const combatLog = document.querySelector('#combat-log');
const chatLog = document.querySelector('#chat-log');
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
const actionButtons = document.querySelectorAll('.action-button');
const questFilters = document.querySelectorAll('.quest-filter');
const quests = document.querySelectorAll('.quest-list .quest');
const mapItems = document.querySelectorAll('.map-list__item');
const mapIntel = document.querySelector('#map-intel');
const serverTime = document.querySelector('#server-time');
const essenceCounter = document.querySelector('#essence-counter');
const crystalCounter = document.querySelector('#crystal-counter');
const renownCounter = document.querySelector('#renown-counter');
const events = document.querySelectorAll('.event');

const combatPhrases = {
  attack: [
    'Вы выпускаете клинок Морессы, оставляя кровавый след на броне врага. <strong>+42</strong> урона.',
    'Кровавое копьё пронзает Скелета-воина. <strong>+38</strong> урона.',
    'Вы активируете умение «Багровый шторм». Враг отступает, теряя <strong>57</strong> НР.'
  ],
  defend: [
    'Вы поднимаете щит Полумесяца, отражая удар и снижая получаемый урон.',
    'Алое поле поглощает большую часть атаки. Вы блокируете <strong>30</strong> урона.',
    'Вы укрываетесь за магической стеной крови, усиливая защиту.'
  ],
  skill: [
    'Вы читаете заклинание «Кровавые цепи», обездвиживая врага на ход.',
    'Темная энергия прорывается через вас. Критический шанс увеличен на <strong>25%</strong>.',
    'Вы вызываете фамильяра Нокса, который ослабляет Скелета-воина.'
  ],
  heal: [
    'Кровавый эликсир восстанавливает <strong>60</strong> НР и увеличивает регенерацию.',
    'Вы произносите мантру Лунных Жрецов, исцеляя раны и избавляясь от проклятий.',
    'Символ Алого Света вспыхивает на вашей коже. Восстановлено <strong>45</strong> НР.'
  ]
};

const enemyResponses = [
  'Скелет-воин яростно размахивает клинком, но вы уворачиваетесь.',
  'На арене завывает ветер из Катакомб Забвения, усиливая давление.',
  'Из тени выплывает эхо древнего ритуала. Вы чувствуете прилив сил.',
  'Совет Крови наблюдает за боем, оценивая вашу решимость.'
];

const resources = {
  essence: 9870,
  crystals: 1240,
  renown: 42600
};

function appendLog(entry, type) {
  const item = document.createElement('li');
  item.innerHTML = entry;
  if (type === 'critical') {
    item.classList.add('log--critical');
  }
  if (type === 'heal') {
    item.classList.add('log--heal');
  }
  combatLog.appendChild(item);
  combatLog.scrollTop = combatLog.scrollHeight;
}

function handleAction(event) {
  const { action } = event.currentTarget.dataset;
  const phrases = combatPhrases[action];
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  const type = action === 'heal' ? 'heal' : action === 'attack' && Math.random() > 0.8 ? 'critical' : undefined;

  appendLog(phrase, type);
  const response = enemyResponses[Math.floor(Math.random() * enemyResponses.length)];
  appendLog(response);
}

actionButtons.forEach((button) => button.addEventListener('click', handleAction));

chatForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  const time = new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const item = document.createElement('li');
  item.innerHTML = `<span class="chat-log__time">${time}</span> <span class="chat-log__name chat-log__name--warrior">Вы:</span> ${message}`;
  chatLog.appendChild(item);
  chatLog.scrollTop = chatLog.scrollHeight;
  chatInput.value = '';
});

const loreSlides = [
  'В тени Кровавого Замка скрываются архивы, где хранится кровь древних героев. Доступ к ним открывается после прохождения испытания Клятвы Ночи.',
  'Лес Мрака дышит живой магией. Каждое дерево помнит клятвы воинов, и если прислушаться, можно услышать их шёпот.',
  'Рынок Теней существует одновременно в нескольких мирах. Продавцы узнают настоящих героев по сверканию их аур.',
  'Катакомбы Забвения скрывают врата к Сердцу Ночи — артефакту, способному переписать историю Империи.',
  'Когда Кровавый Полумесяц достигает зенита, бастионы Совета окрашиваются светом, открывая охоту за редкими реликвиями.'
];

let loreIndex = 0;
const loreText = document.querySelector('.lore__text');

function rotateLore() {
  loreIndex = (loreIndex + 1) % loreSlides.length;
  const paragraph = document.createElement('p');
  paragraph.textContent = loreSlides[loreIndex];
  paragraph.classList.add('lore__extra');

  if (loreText.querySelector('.lore__extra')) {
    loreText.removeChild(loreText.querySelector('.lore__extra'));
  }

  loreText.appendChild(paragraph);
}

if (loreText) {
  rotateLore();
  setInterval(rotateLore, 15000);
}

function formatNumber(value) {
  return value.toLocaleString('ru-RU');
}

function animateResources() {
  const essenceGain = Math.floor(Math.random() * 35) + 15;
  const crystalGain = Math.floor(Math.random() * 5) + 1;
  const renownGain = Math.floor(Math.random() * 120) + 40;

  resources.essence += essenceGain;
  resources.crystals += crystalGain;
  resources.renown += renownGain;

  if (essenceCounter) essenceCounter.textContent = formatNumber(resources.essence);
  if (crystalCounter) crystalCounter.textContent = formatNumber(resources.crystals);
  if (renownCounter) renownCounter.textContent = formatNumber(resources.renown);
}

if (essenceCounter && crystalCounter && renownCounter) {
  animateResources();
  setInterval(animateResources, 12000);
}

function updateServerClock() {
  if (!serverTime) return;
  const now = new Date();
  serverTime.textContent = now.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

if (serverTime) {
  updateServerClock();
  setInterval(updateServerClock, 1000);
}

function handleQuestFilter(event) {
  const { filter } = event.currentTarget.dataset;
  questFilters.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });

  quests.forEach((quest) => {
    const matches = filter === 'all' || quest.dataset.state === filter;
    quest.classList.toggle('quest--hidden', !matches);
  });
}

questFilters.forEach((button) => {
  button.addEventListener('click', handleQuestFilter);
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleQuestFilter({ currentTarget: button });
    }
  });
});

const defaultFilter = document.querySelector('.quest-filter[data-filter="all"]');
if (defaultFilter) {
  handleQuestFilter({ currentTarget: defaultFilter });
}

function setIntel(text) {
  if (!mapIntel) return;
  mapIntel.textContent = text;
}

mapItems.forEach((item) => {
  const intel = item.dataset.intel;
  if (!intel) return;
  item.addEventListener('mouseenter', () => setIntel(intel));
  item.addEventListener('focus', () => setIntel(intel));
});

if (mapItems.length && mapIntel) {
  const primaryIntel = mapItems[0].dataset.intel;
  if (primaryIntel) {
    setIntel(primaryIntel);
  }
}

function formatDuration(seconds) {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

events.forEach((eventItem) => {
  const timerElement = eventItem.querySelector('.event__timer');
  if (!timerElement) return;

  let remaining = Number(eventItem.dataset.seconds || 0);

  function tick() {
    if (remaining <= 0) {
      timerElement.textContent = 'Завершено';
      eventItem.classList.add('event--ended');
      return;
    }

    timerElement.textContent = formatDuration(remaining);
    remaining -= 1;
  }

  tick();
  setInterval(tick, 1000);
});
