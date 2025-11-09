"""Telegram command handlers."""

from __future__ import annotations

from datetime import date, timedelta

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, InputFile, Update
from telegram.ext import ContextTypes

from .bnovo_client import BnovoClient
from .config import get_settings
from .directory import Hotel, get_apartment_directory
from .reporting import render_report


APARTMENT_NUMBER_KEY = "apartment_number"
HOTEL_ID_KEY = "hotel_id"
HOTEL_NAME_KEY = "hotel_name"
PENDING_APARTMENT_KEY = "pending_apartment"


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Respond to /start commands."""

    if update.message is None:
        return

    context.user_data.clear()

    await update.message.reply_text(
        "Отправьте номер апартамента, чтобы выбрать адрес дома."
        "\nПосле этого команда /report сформирует отчёт за прошлый месяц."
    )


async def handle_apartment_number(
    update: Update, context: ContextTypes.DEFAULT_TYPE
) -> None:
    """Process free-form messages with apartment numbers."""

    if update.message is None or update.message.text is None:
        return

    apartment_number = update.message.text.strip()
    if not apartment_number:
        return

    directory = get_apartment_directory()
    matches = directory.lookup(apartment_number)

    if not matches:
        context.user_data.pop(APARTMENT_NUMBER_KEY, None)
        context.user_data.pop(HOTEL_ID_KEY, None)
        context.user_data.pop(HOTEL_NAME_KEY, None)
        await update.message.reply_text(
            "Апартаменты не найдены. Убедитесь, что они добавлены в файл"
            " bot/data/apartments.json."
        )
        return

    if len(matches) == 1:
        _store_selection(context, apartment_number, matches[0])
        await update.message.reply_text(
            _format_selection_message(apartment_number, matches[0])
        )
        return

    context.user_data[PENDING_APARTMENT_KEY] = apartment_number
    keyboard = [
        [InlineKeyboardButton(hotel.name, callback_data=f"select_hotel:{hotel.id}")]
        for hotel in matches
    ]

    await update.message.reply_text(
        "Найдено несколько адресов с таким номером апартаментов."
        "\nВыберите нужный дом:",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )


async def handle_hotel_selection(
    update: Update, context: ContextTypes.DEFAULT_TYPE
) -> None:
    """Handle inline keyboard selection of a hotel."""

    query = update.callback_query
    if query is None or query.data is None:
        return

    if not query.data.startswith("select_hotel:"):
        await query.answer()
        return

    await query.answer()
    _, hotel_id = query.data.split(":", 1)

    directory = get_apartment_directory()
    hotel = directory.hotel_by_id(hotel_id)
    if hotel is None:
        await query.edit_message_text(
            "Не удалось определить адрес. Проверьте файл bot/data/apartments.json."
        )
        return

    apartment_number = context.user_data.pop(PENDING_APARTMENT_KEY, None)
    if apartment_number is None:
        apartment_number = context.user_data.get(APARTMENT_NUMBER_KEY, "")

    _store_selection(context, apartment_number, hotel)

    await query.edit_message_text(_format_selection_message(apartment_number, hotel))


async def report(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Generate and send a report for the requested period."""

    if update.message is None:
        return

    hotel_id = context.user_data.get(HOTEL_ID_KEY)
    hotel_name = context.user_data.get(HOTEL_NAME_KEY)

    if not hotel_id:
        await update.message.reply_text(
            "Сначала отправьте номер апартаментов, чтобы выбрать адрес."
        )
        return

    today = date.today()
    first_day_of_month = today.replace(day=1)
    end_date = first_day_of_month - timedelta(days=1)
    start_date = end_date.replace(day=1)

    settings = get_settings()

    await update.message.reply_text(
        "Создаю отчет за прошлый месяц"
        f" ({start_date.isoformat()} — {end_date.isoformat()})"
        + (f" для {hotel_name}." if hotel_name else "."),
    )

    try:
        async with BnovoClient(settings) as client:
            stats = await client.fetch_daily_stats(
                start_date, end_date, hotel_id=hotel_id
            )
    except Exception as exc:  # noqa: BLE001
        await update.message.reply_text(f"Не удалось получить данные Bnovo: {exc}")
        return

    if not stats:
        await update.message.reply_text("Нет данных за выбранный период.")
        return

    report_bytes = render_report(stats, template_path=settings.report_template)

    suffix = str(hotel_id)
    slug_name = _slugify(hotel_name) if hotel_name else ""
    if slug_name:
        suffix = f"{hotel_id}_{slug_name}"
    file_name = (
        f"bnovo_report_{suffix}_{start_date.isoformat()}_{end_date.isoformat()}.xlsx"
    )
    output_path = settings.report_output_dir / file_name
    output_path.write_bytes(report_bytes)

    with output_path.open("rb") as file_obj:
        await update.message.reply_document(
            document=InputFile(file_obj, filename=file_name),
            caption="Отчет Bnovo",
        )


def _store_selection(
    context: ContextTypes.DEFAULT_TYPE,
    apartment_number: str,
    hotel: Hotel,
) -> None:
    context.user_data[APARTMENT_NUMBER_KEY] = str(apartment_number).strip()
    context.user_data[HOTEL_ID_KEY] = str(hotel.id)
    context.user_data[HOTEL_NAME_KEY] = hotel.name
    context.user_data.pop(PENDING_APARTMENT_KEY, None)


def _format_selection_message(apartment_number: str, hotel: Hotel) -> str:
    apartment_number = (apartment_number or "").strip()
    if apartment_number:
        return f"Выбраны апартаменты {apartment_number} в {hotel.name}."
    return f"Выбран адрес {hotel.name}."


def _slugify(value: str) -> str:
    slug = "".join(char if char.isalnum() else "_" for char in value.strip())
    while "__" in slug:
        slug = slug.replace("__", "_")
    return slug.strip("_")


__all__ = ["start", "report", "handle_apartment_number", "handle_hotel_selection"]
