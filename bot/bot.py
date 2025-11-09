"""Application entry point for the Telegram bot."""

from __future__ import annotations

import logging
from typing import Optional

from telegram.ext import (
    Application,
    ApplicationBuilder,
    CallbackQueryHandler,
    CommandHandler,
    MessageHandler,
    filters,
)

from .config import Settings, get_settings
from .handlers import handle_apartment_number, handle_hotel_selection, report, start


def build_application(settings: Optional[Settings] = None) -> Application:
    settings = settings or get_settings()

    application = ApplicationBuilder().token(settings.telegram_token).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", start))
    application.add_handler(CommandHandler("report", report))
    application.add_handler(
        MessageHandler(filters.TEXT & ~filters.COMMAND, handle_apartment_number)
    )
    application.add_handler(
        CallbackQueryHandler(handle_hotel_selection, pattern=r"^select_hotel:")
    )
    return application


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    application = build_application()
    application.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
