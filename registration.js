const profileStorageKey = 'labyrinth_client_profile';
const raceStorageKey = 'labyrinth_client_race';
const legacyProfileStorageKey = 'blood_legends_profile';
const legacyRaceStorageKey = 'blood_legends_race';

const registrationForm = document.getElementById('registration-form');
const raceListElement = document.getElementById('registration-race-list');
const errorElement = document.getElementById('registration-error');
const summarySection = document.getElementById('registration-summary');
const summaryName = document.getElementById('summary-name');
const summaryEmail = document.getElementById('summary-email');
const summaryRace = document.getElementById('summary-race');
const continueButton = document.getElementById('registration-continue');

const fallbackRaces = [
  {
    id: 'human',
    name: 'Человек',
    icon: '🛡️',
    origin: 'Гарнизон Алого Предела',
    description: 'Универсальные исследователи, уравновешенные и дисциплинированные.',
    traits: [
      'Сбалансированные характеристики',
      'Стойкость к искажениям лабиринта',
      'Повышение репутации у фракций'
    ]
  },
  {
    id: 'dwarf',
    name: 'Гном',
    icon: '⚒️',
    origin: 'Оплот Каменных Песен',
    description: 'Кузнецы-осадники, способные выдержать любое давление.',
    traits: [
      'Повышенная защита и здоровье',
      'Сопротивление контролю',
      'Бонус к созданию экипировки'
    ]
  },
  {
    id: 'elf',
    name: 'Эльф',
    icon: '🌙',
    origin: 'Святилище Лунных Троп',
    description: 'Следопыты сумрака, владеющие искусством скрытности.',
    traits: [
      'Высокая ловкость и точность',
      'Снижение шанса засад',
      'Расширенная разведка карты'
    ]
  },
  {
    id: 'orc',
    name: 'Орк',
    icon: '🗡️',
    origin: 'Чертоги Громового Вожака',
    description: 'Грозовые воины, питающие ярость сражений.',
    traits: [
      'Повышенный урон и критический шанс',
      'Прирост ярости при получении урона',
      'Бонус к добыче трофеев'
    ]
  }
];

function safeParseJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function setError(message) {
  if (!errorElement) return;
  errorElement.textContent = message ?? '';
}

function storageAvailable() {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return false;
    }
    const storage = window.localStorage;
    const testKey = '__labyrinth_client_test__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

function getStoredProfile() {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return null;
    }
    const storage = window.localStorage;
    const newRaw = storage.getItem(profileStorageKey);
    const legacyRaw = storage.getItem(legacyProfileStorageKey);
    const raw = newRaw ?? legacyRaw;
    if (!newRaw && legacyRaw) {
      storage.setItem(profileStorageKey, legacyRaw);
      storage.removeItem(legacyProfileStorageKey);
    }
    return safeParseJson(raw);
  } catch (error) {
    return null;
  }
}

async function hashPassword(password) {
  if (window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(password);
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }
  const encoded = new TextEncoder().encode(password);
  let binary = '';
  encoded.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

async function loadRaces() {
  try {
    const response = await fetch('data/races.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Не удалось загрузить каталог рас');
    const data = await response.json();
    if (!Array.isArray(data) || !data.length) {
      return fallbackRaces;
    }
    return data;
  } catch (error) {
    console.warn('Используется резервный список рас:', error);
    return fallbackRaces;
  }
}

function renderRaceOptions(races) {
  if (!raceListElement) return;
  raceListElement.replaceChildren();

  if (!Array.isArray(races) || !races.length) {
    const placeholder = document.createElement('p');
    placeholder.className = 'registration-note';
    placeholder.textContent = 'Каталог рас временно недоступен. Обновите страницу позже.';
    raceListElement.append(placeholder);
    return;
  }

  races.forEach((race, index) => {
    const option = document.createElement('label');
    option.className = 'registration-race-option';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'race';
    input.value = race.id;
    input.className = 'registration-race-radio';
    input.required = true;
    input.setAttribute('aria-label', race.name);
    if (index === 0) {
      input.tabIndex = 0;
    }

    const card = document.createElement('div');
    card.className = 'registration-race-card';

    const icon = document.createElement('span');
    icon.className = 'registration-race-icon';
    icon.textContent = race.icon ?? '✹';

    const name = document.createElement('span');
    name.className = 'registration-race-name';
    name.textContent = race.name;

    const origin = document.createElement('span');
    origin.className = 'registration-race-origin';
    origin.textContent = race.origin ?? '';

    const traits = document.createElement('ul');
    traits.className = 'registration-race-traits';
    if (race.traits?.length) {
      race.traits.forEach((trait) => {
        const item = document.createElement('li');
        item.textContent = trait;
        traits.append(item);
      });
    }

    card.append(icon, name, origin, traits);
    option.append(input, card);
    raceListElement.append(option);
  });
}

function showSummary(profile, races) {
  if (registrationForm) {
    registrationForm.setAttribute('hidden', '');
  }
  if (!summarySection) return;

  const raceName = races.find((entry) => entry.id === profile.raceId)?.name ?? profile.raceId ?? '—';

  summaryName.textContent = profile.nickname ?? '—';
  summaryEmail.textContent = profile.email ?? '—';
  summaryRace.textContent = raceName;

  summarySection.hidden = false;

  if (continueButton) {
    continueButton.addEventListener('click', () => {
      window.location.replace('index.html');
    });
  }
}

function bindForm(races) {
  if (!registrationForm) return;

  registrationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    handleRegistration(races);
  });
}

async function handleRegistration(races) {
  if (!registrationForm) return;
  setError('');

  if (!storageAvailable()) {
    setError('Локальное хранилище недоступно. Проверьте настройки браузера.');
    return;
  }

  const formData = new FormData(registrationForm);
  const nickname = String(formData.get('nickname') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const raceId = String(formData.get('race') ?? '');

  if (nickname.length < 3) {
    setError('Укажите ник длиной не менее 3 символов.');
    return;
  }

  if (!email || !email.includes('@')) {
    setError('Введите корректный адрес электронной почты.');
    return;
  }

  if (password.trim().length < 6) {
    setError('Пароль должен содержать минимум 6 символов.');
    return;
  }

  if (!raceId) {
    setError('Выберите расу героя.');
    return;
  }

  const raceEntry = races.find((entry) => entry.id === raceId) ?? fallbackRaces.find((entry) => entry.id === raceId);
  if (!raceEntry) {
    setError('Выбранная раса недоступна.');
    return;
  }

  try {
    const passwordHash = await hashPassword(password.trim());
    const profile = {
      nickname,
      email,
      raceId,
      raceName: raceEntry.name,
      createdAt: new Date().toISOString(),
      raceLocked: true,
      passwordHash
    };

    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      setError('Локальное хранилище недоступно в этом окружении.');
      return;
    }
    window.localStorage.setItem(profileStorageKey, JSON.stringify(profile));
    window.localStorage.setItem(raceStorageKey, raceId);
    window.localStorage.removeItem(legacyProfileStorageKey);
    window.localStorage.removeItem(legacyRaceStorageKey);
    window.location.replace('index.html');
  } catch (error) {
    console.error(error);
    setError('Не удалось сохранить профиль. Попробуйте ещё раз.');
  }
}

(async function initRegistration() {
  const races = await loadRaces();
  const existingProfile = getStoredProfile();

  if (existingProfile?.raceId) {
    showSummary(existingProfile, races);
    return;
  }

  renderRaceOptions(races);
  bindForm(races);
})();
