const combatLog = document.querySelector('#combat-log');
const chatLog = document.querySelector('#chat-log');
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
const actionButtons = document.querySelectorAll('.action-button');
const questFilters = document.querySelectorAll('.quest-filter');
const quests = document.querySelectorAll('.quest-list .quest');
const mapCanvas = document.querySelector('#world-map-canvas');
const mapContext = mapCanvas?.getContext('2d');
const mapNodes = document.querySelectorAll('.map-node');
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

const mapRegions = [
  {
    id: 'castle',
    type: 'fort',
    path: [
      [0.55, 0.28],
      [0.63, 0.35],
      [0.6, 0.44],
      [0.48, 0.46],
      [0.46, 0.34]
    ]
  },
  {
    id: 'forest',
    type: 'ritual',
    path: [
      [0.27, 0.52],
      [0.33, 0.62],
      [0.41, 0.58],
      [0.38, 0.48]
    ]
  },
  {
    id: 'catacombs',
    type: 'ruin',
    path: [
      [0.7, 0.58],
      [0.78, 0.66],
      [0.74, 0.72],
      [0.64, 0.66]
    ]
  },
  {
    id: 'market',
    type: 'trade',
    path: [
      [0.4, 0.18],
      [0.48, 0.22],
      [0.46, 0.3],
      [0.36, 0.26]
    ]
  },
  {
    id: 'lair',
    type: 'fort',
    path: [
      [0.78, 0.22],
      [0.86, 0.28],
      [0.82, 0.36],
      [0.72, 0.3]
    ]
  }
];

const regionStyles = {
  fort: { fill: '#b2243e', glow: '#f45a7a' },
  ritual: { fill: '#472a8f', glow: '#8b63ff' },
  ruin: { fill: '#144c61', glow: '#4ed4e0' },
  trade: { fill: '#7a3d14', glow: '#ffb657' }
};

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

let activeRegion = mapNodes[0]?.dataset.region || 'castle';
let hoveredRegion = null;
let mapPulse = 0;

function updateCanvasDimensions() {
  if (!mapCanvas || !mapContext) return;
  const ratio = window.devicePixelRatio || 1;
  const width = mapCanvas.clientWidth || mapCanvas.width;
  const height = mapCanvas.clientHeight || mapCanvas.height;
  if (!width || !height) return;
  mapCanvas.width = width * ratio;
  mapCanvas.height = height * ratio;
  mapContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function getRegionStyle(region) {
  return regionStyles[region.type] || regionStyles.fort;
}

function drawRegionShape(region, highlightId) {
  if (!mapCanvas || !mapContext) return;
  const ctx = mapContext;
  const { width, height } = mapCanvas;
  const points = region.path.map(([x, y]) => [x * width, y * height]);
  const style = getRegionStyle(region);
  const isHighlight = region.id === highlightId;

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) {
    const [px, py] = points[i];
    ctx.lineTo(px, py);
  }
  ctx.closePath();

  ctx.save();
  ctx.fillStyle = isHighlight ? style.glow : style.fill;
  ctx.globalAlpha = isHighlight ? 0.9 : 0.65;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = isHighlight ? style.glow : 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = isHighlight ? 4 : 2;
  ctx.stroke();
  ctx.restore();

  if (isHighlight) {
    ctx.save();
    ctx.shadowBlur = 25;
    ctx.shadowColor = style.glow;
    ctx.lineWidth = 3;
    ctx.strokeStyle = style.glow;
    ctx.stroke();
    ctx.restore();
  }
}

function drawMap(explicitHighlight) {
  if (!mapCanvas || !mapContext) return;
  const ctx = mapContext;
  const width = mapCanvas.clientWidth || mapCanvas.width;
  const height = mapCanvas.clientHeight || mapCanvas.height;
  const highlightId = explicitHighlight || hoveredRegion || activeRegion;

  ctx.clearRect(0, 0, width, height);

  const baseGradient = ctx.createLinearGradient(0, 0, 0, height);
  baseGradient.addColorStop(0, '#06070f');
  baseGradient.addColorStop(1, '#1c0a16');
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, width, height);

  const haze = ctx.createRadialGradient(width * 0.5, height * 0.35, width * 0.1, width * 0.5, height * 0.35, width * 0.75);
  haze.addColorStop(0, 'rgba(92, 18, 46, 0.6)');
  haze.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, width, height);

  ctx.beginPath();
  ctx.moveTo(width * 0.12, height * 0.72);
  ctx.quadraticCurveTo(width * 0.05, height * 0.42, width * 0.28, height * 0.25);
  ctx.quadraticCurveTo(width * 0.46, height * 0.06, width * 0.72, height * 0.18);
  ctx.quadraticCurveTo(width * 0.93, height * 0.34, width * 0.86, height * 0.62);
  ctx.quadraticCurveTo(width * 0.7, height * 0.93, width * 0.38, height * 0.86);
  ctx.quadraticCurveTo(width * 0.18, height * 0.81, width * 0.12, height * 0.72);
  ctx.closePath();

  const landGradient = ctx.createLinearGradient(width * 0.4, height * 0.15, width * 0.6, height * 0.85);
  landGradient.addColorStop(0, '#22122c');
  landGradient.addColorStop(0.5, '#2e1b3a');
  landGradient.addColorStop(1, '#15162a');
  ctx.fillStyle = landGradient;
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = 'rgba(243, 67, 112, 0.25)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(width * 0.2, height * 0.32);
  ctx.bezierCurveTo(width * 0.32, height * 0.38, width * 0.28, height * 0.55, width * 0.38, height * 0.68);
  ctx.bezierCurveTo(width * 0.48, height * 0.8, width * 0.62, height * 0.76, width * 0.75, height * 0.82);
  ctx.strokeStyle = 'rgba(116, 177, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 12]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(width * 0.58, height * 0.18);
  ctx.bezierCurveTo(width * 0.66, height * 0.3, width * 0.58, height * 0.5, width * 0.68, height * 0.56);
  ctx.strokeStyle = `rgba(233, 76, 111, ${0.2 + Math.sin(mapPulse) * 0.12})`;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  mapRegions.forEach((region) => drawRegionShape(region, highlightId));

  mapRegions.forEach((region) => {
    const point = region.path[0];
    const x = point[0] * width;
    const y = point[1] * height;
    const style = getRegionStyle(region);

    ctx.save();
    ctx.fillStyle = style.glow;
    ctx.globalAlpha = 0.4 + Math.sin(mapPulse * 1.2 + region.path[0][0]) * 0.15;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#0c101f';
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = style.glow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, highlightId === region.id ? 9 : 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });
}

function animateMap() {
  mapPulse += 0.02;
  drawMap();
  requestAnimationFrame(animateMap);
}

if (mapCanvas && mapContext) {
  updateCanvasDimensions();
  drawMap();
  requestAnimationFrame(animateMap);
  window.addEventListener('resize', () => {
    updateCanvasDimensions();
    drawMap();
  });
}

if (mapNodes.length) {
  activateRegion(mapNodes[0]);
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
  if (!text || mapIntel.textContent === text) return;
  mapIntel.textContent = text;
  mapIntel.classList.remove('map-intel--pulse');
  void mapIntel.offsetWidth;
  mapIntel.classList.add('map-intel--pulse');
}

function activateRegion(node) {
  if (!node) return;
  mapNodes.forEach((button) => button.classList.remove('is-active'));
  node.classList.add('is-active');
  activeRegion = node.dataset.region || activeRegion;
  hoveredRegion = null;
  if (node.dataset.intel) {
    setIntel(node.dataset.intel);
  }
  drawMap();
}

function restoreActiveIntel() {
  const current = document.querySelector('.map-node.is-active');
  if (current && current.dataset.intel) {
    setIntel(current.dataset.intel);
  }
}

mapNodes.forEach((node) => {
  node.addEventListener('click', () => activateRegion(node));
  node.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activateRegion(node);
    }
  });
  node.addEventListener('mouseenter', () => {
    hoveredRegion = node.dataset.region || null;
    if (node.dataset.intel) setIntel(node.dataset.intel);
    drawMap();
  });
  node.addEventListener('mouseleave', () => {
    hoveredRegion = null;
    restoreActiveIntel();
  });
  node.addEventListener('focus', () => {
    hoveredRegion = node.dataset.region || null;
    if (node.dataset.intel) setIntel(node.dataset.intel);
    drawMap();
  });
  node.addEventListener('blur', () => {
    hoveredRegion = null;
    restoreActiveIntel();
  });
});

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
