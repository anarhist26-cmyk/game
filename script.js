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
const actionReadout = document.querySelector('#action-readout');
const turnIndicator = document.querySelector('#turn-indicator');
const stanceIndicator = document.querySelector('#stance-indicator');
const enemyStatus = document.querySelector('#enemy-status');
const enemyNameElement = document.querySelector('.enemy-card__info h3');
const enemyLevelElement = document.querySelector('#enemy-level');
const playerLevelElement = document.querySelector('#player-level');

const statElements = {
  strength: document.querySelector('#player-strength'),
  agility: document.querySelector('#player-agility'),
  defense: document.querySelector('#player-defense'),
  gold: document.querySelector('#player-gold')
};

const progressBars = new Map();
const progressLabels = new Map();

document.querySelectorAll('[data-bar]').forEach((element) => {
  if (!element.dataset.bar) return;
  progressBars.set(element.dataset.bar, element);
});

document.querySelectorAll('[data-bar-text]').forEach((element) => {
  if (!element.dataset.barText) return;
  progressLabels.set(element.dataset.barText, element);
});

function formatNumber(value) {
  return value.toLocaleString('ru-RU');
}

const combatPhrases = {
  attack: [
    'Вы выпускаете клинок Морессы, оставляя кровавый след на броне врага. <strong>+{value}</strong> урона.',
    'Кровавое копьё пронзает Скелета-воина. <strong>+{value}</strong> урона.',
    'Вы активируете умение «Багровый шторм». Враг отступает, теряя <strong>{value}</strong> НР.'
  ],
  defend: [
    'Вы поднимаете щит Полумесяца, отражая удар и снижая получаемый урон.',
    'Алое поле поглощает большую часть атаки. Вы блокируете <strong>{value}</strong> урона.',
    'Вы укрываетесь за магической стеной крови, усиливая защиту.'
  ],
  skill: [
    'Вы читаете заклинание «Кровавые цепи», обездвиживая врага на ход.',
    'Темная энергия прорывается через вас. Критический шанс увеличен на <strong>{value}%</strong>.',
    'Вы вызываете фамильяра Нокса, который ослабляет Скелета-воина.'
  ],
  heal: [
    'Кровавый эликсир восстанавливает <strong>{value}</strong> НР и увеличивает регенерацию.',
    'Вы произносите мантру Лунных Жрецов, исцеляя раны и избавляясь от проклятий.',
    'Символ Алого Света вспыхивает на вашей коже. Восстановлено <strong>{value}</strong> НР.'
  ]
};

const enemyResponses = [
  'Скелет-воин яростно размахивает клинком, но вы уворачиваетесь.',
  'На арене завывает ветер из Катакомб Забвения, усиливая давление.',
  'Из тени выплывает эхо древнего ритуала. Вы чувствуете прилив сил.',
  'Совет Крови наблюдает за боем, оценивая вашу решимость.'
];

const playerState = {
  level: 12,
  hp: 450,
  maxHp: 600,
  mp: 280,
  maxMp: 350,
  xp: 2400,
  maxXp: 3000,
  strength: 45,
  agility: 52,
  defense: 38,
  gold: 1250,
  shield: 0
};

const enemyTemplates = [
  {
    id: 'skeleton',
    name: 'Скелет-воин',
    level: 8,
    maxHp: 500,
    minDamage: 18,
    maxDamage: 36,
    xpReward: 160,
    goldReward: [85, 140],
    intro: 'Скелет скрежещет клинками, выжидая момент для атаки.'
  },
  {
    id: 'inquisitor',
    name: 'Инквизитор Ночи',
    level: 10,
    maxHp: 620,
    minDamage: 24,
    maxDamage: 44,
    xpReward: 210,
    goldReward: [120, 200],
    intro: 'Инквизитор окутан чёрным плащом и нашёптывает клятвы крови.'
  },
  {
    id: 'harpy',
    name: 'Гарпия Рассвета',
    level: 11,
    maxHp: 540,
    minDamage: 20,
    maxDamage: 38,
    xpReward: 195,
    goldReward: [100, 170],
    intro: 'Гарпия кружит над ареной, рассыпая перья с огненной кромкой.'
  },
  {
    id: 'warlord',
    name: 'Полководец Багровой Стражи',
    level: 13,
    maxHp: 720,
    minDamage: 28,
    maxDamage: 52,
    xpReward: 280,
    goldReward: [180, 260],
    intro: 'Полководец поднимает клинок, призывая вас к решающей дуэли.'
  }
];

let enemyIndex = 0;
let enemyState = { ...enemyTemplates[0], hp: enemyTemplates[0].maxHp };
let isPlayerTurn = true;

const toneVariants = ['combat-state__value--default', 'combat-state__value--danger', 'combat-state__value--victory', 'combat-state__value--focus'];

function flashElement(element, className) {
  if (!element) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function setProgress(id, current, max, formatter) {
  const bar = progressBars.get(id);
  const label = progressLabels.get(id);
  if (!bar) return;
  const safeMax = Number.isFinite(max) && max > 0 ? max : 1;
  const ratio = Math.max(0, Math.min(1, current / safeMax));
  bar.style.setProperty('--value', ratio);
  bar.dataset.current = String(Math.max(0, Math.round(current)));
  bar.dataset.max = String(Math.round(safeMax));
  if (label) {
    const formatted = formatter ? formatter(Math.max(0, Math.round(current)), Math.round(safeMax)) : `${Math.max(0, Math.round(current))} / ${Math.round(safeMax)}`;
    label.textContent = formatted;
  }
}

function setTone(element, tone) {
  if (!element) return;
  toneVariants.forEach((variant) => element.classList.remove(variant));
  element.classList.add(`combat-state__value--${tone}`);
  flashElement(element, 'combat-state__value--pulse');
}

function setTurnIndicatorText(text, tone = 'default') {
  if (!turnIndicator) return;
  turnIndicator.textContent = text;
  setTone(turnIndicator, tone);
}

function setStanceText(text, tone = 'focus') {
  if (!stanceIndicator) return;
  stanceIndicator.textContent = text;
  setTone(stanceIndicator, tone);
}

function setEnemyStatusText(text, tone = 'intro') {
  if (!enemyStatus) return;
  enemyStatus.textContent = text;
  enemyStatus.classList.remove('enemy-card__status--danger', 'enemy-card__status--victory', 'enemy-card__status--intro');
  enemyStatus.classList.add(`enemy-card__status--${tone}`);
  flashElement(enemyStatus, 'enemy-card__status--pulse');
}

function setActionReadoutText(text) {
  if (!actionReadout) return;
  actionReadout.textContent = text;
  flashElement(actionReadout, 'action-readout--flash');
}

function setPlayerTurn(state) {
  isPlayerTurn = state;
  actionButtons.forEach((button) => {
    button.disabled = !state;
    button.classList.toggle('action-button--locked', !state);
  });
}

function updateStats() {
  if (playerLevelElement) playerLevelElement.textContent = String(playerState.level);
  if (statElements.strength) statElements.strength.textContent = formatNumber(playerState.strength);
  if (statElements.agility) statElements.agility.textContent = formatNumber(playerState.agility);
  if (statElements.defense) statElements.defense.textContent = formatNumber(playerState.defense);
  if (statElements.gold) statElements.gold.textContent = formatNumber(playerState.gold);
}

function updatePlayerBars() {
  setProgress('player-hp', playerState.hp, playerState.maxHp, (current, max) => `${formatNumber(current)} / ${formatNumber(max)}`);
  setProgress('player-mp', playerState.mp, playerState.maxMp, (current, max) => `${formatNumber(current)} / ${formatNumber(max)}`);
  setProgress('player-xp', playerState.xp, playerState.maxXp, (current, max) => `${formatNumber(current)} / ${formatNumber(max)}`);
}

function updateEnemyBar() {
  setProgress('enemy-hp', enemyState.hp, enemyState.maxHp, (current, max) => `${formatNumber(current)} / ${formatNumber(max)}`);
}

function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillPhrase(template, value) {
  if (!template) return '';
  if (!template.includes('{value}')) return template;
  const replacement = typeof value === 'number' ? formatNumber(value) : value;
  return template.replace('{value}', replacement);
}

function gainXp(amount) {
  playerState.xp += amount;
  const logs = [];
  while (playerState.xp >= playerState.maxXp) {
    playerState.xp -= playerState.maxXp;
    playerState.level += 1;
    playerState.maxHp += 40;
    playerState.maxMp += 20;
    playerState.strength += 4;
    playerState.agility += 3;
    playerState.defense += 2;
    playerState.hp = playerState.maxHp;
    playerState.mp = playerState.maxMp;
    playerState.maxXp = Math.round(playerState.maxXp * 1.2);
    logs.push(`Вы повышаете уровень до <strong>${playerState.level}</strong>! Все параметры усилены.`);
  }
  updateStats();
  updatePlayerBars();
  logs.forEach((entry) => appendLog(entry, 'heal'));
}

function rewardPlayer({ xpReward, goldReward }) {
  gainXp(xpReward);
  const goldGain = randomInRange(goldReward[0], goldReward[1]);
  playerState.gold += goldGain;
  updateStats();
  appendLog(`Вы собираете <strong>${formatNumber(goldGain)}</strong> золота с поверженного врага.`, 'heal');
}

function applyShield(amount) {
  playerState.shield = amount;
  if (amount <= 0) return;
  appendLog(`Щит Полумесяца поглощает до <strong>${formatNumber(amount)}</strong> урона.`, 'heal');
}

function damageEnemy(amount, critical = false) {
  enemyState.hp = Math.max(0, enemyState.hp - amount);
  updateEnemyBar();
  if (enemyState.hp <= 0) {
    appendLog(`Вы добиваете ${enemyState.name}!`, critical ? 'critical' : undefined);
    setEnemyStatusText(`${enemyState.name} повержен.`, 'victory');
    setTurnIndicatorText('Победа', 'victory');
    rewardPlayer(enemyState);
    setPlayerTurn(false);
    setActionReadoutText('Вы готовитесь к следующей волне противников.');
    setTimeout(() => {
      enemyIndex = (enemyIndex + 1) % enemyTemplates.length;
      spawnEnemy(enemyTemplates[enemyIndex]);
    }, 2200);
    return true;
  }
  return false;
}

function damagePlayer(amount) {
  if (playerState.shield > 0) {
    const absorbed = Math.min(playerState.shield, amount);
    amount -= absorbed;
    playerState.shield = Math.max(0, playerState.shield - absorbed);
    if (absorbed > 0) {
      appendLog(`Ваш кровавый щит поглощает <strong>${formatNumber(absorbed)}</strong> урона.`, 'heal');
    }
  }
  if (amount <= 0) return false;
  playerState.hp = Math.max(0, playerState.hp - amount);
  updatePlayerBars();
  appendLog(`${enemyState.name} наносит вам <strong>${formatNumber(amount)}</strong> урона.`);
  if (playerState.hp <= 0) {
    handlePlayerDefeat();
    return true;
  }
  return false;
}

function handlePlayerDefeat() {
  setTurnIndicatorText('Поражение', 'danger');
  setEnemyStatusText(`${enemyState.name} празднует победу.`, 'danger');
  setActionReadoutText('Вы истекаете кровью, но резервная эссенция готовится к восстановлению.');
  setPlayerTurn(false);
  appendLog('Вы падаете на колено — бой временно проигран.', 'critical');
  setTimeout(() => {
    playerState.hp = Math.round(playerState.maxHp * 0.6);
    playerState.mp = Math.round(playerState.maxMp * 0.5);
    playerState.shield = 0;
    updatePlayerBars();
    setTurnIndicatorText('Ваш ход', 'default');
    setEnemyStatusText(`${enemyState.name} не успевает нанести завершающий удар.`, 'intro');
    setActionReadoutText('Вы возрождаетесь с резервом эссенции и готовы к ответному удару.');
    setPlayerTurn(true);
  }, 3500);
}

function spawnEnemy(template) {
  enemyState = { ...template, hp: template.maxHp };
  if (enemyNameElement) enemyNameElement.textContent = template.name;
  if (enemyLevelElement) enemyLevelElement.textContent = String(template.level);
  updateEnemyBar();
  setEnemyStatusText(template.intro, 'intro');
  appendLog(`На арену выходит ${template.name}.`, 'heal');
  setTurnIndicatorText('Ваш ход', 'default');
  setStanceText('Наступление', 'focus');
  playerState.shield = 0;
  setPlayerTurn(true);
}


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

function enemyTurn() {
  if (enemyState.hp <= 0) return;
  setEnemyStatusText(`${enemyState.name} готовит атаку.`, 'danger');
  setActionReadoutText(`${enemyState.name} собирает силу.`);
  setTurnIndicatorText('Ход врага', 'danger');

  setTimeout(() => {
    const damage = randomInRange(enemyState.minDamage, enemyState.maxDamage);
    const response = enemyResponses[Math.floor(Math.random() * enemyResponses.length)];
    if (response) appendLog(response);
    const playerDefeated = damagePlayer(damage);
    if (!playerDefeated) {
      setEnemyStatusText(`${enemyState.name} выжидает следующую возможность.`, 'intro');
      setActionReadoutText(`${enemyState.name} наносит ${formatNumber(damage)} урона.`);
      setTurnIndicatorText('Ваш ход', 'default');
      setStanceText('Наступление', 'focus');
      setPlayerTurn(true);
    }
  }, 900);
}

function performPlayerAction(action) {
  if (!isPlayerTurn) return;
  setPlayerTurn(false);

  if (action === 'attack') {
    const base = randomInRange(42, 68) + Math.round(playerState.strength * 0.4);
    const isCritical = Math.random() < 0.18 + playerState.agility / 400;
    const damage = isCritical ? Math.round(base * 1.6) : base;
    const phrase = combatPhrases.attack[Math.floor(Math.random() * combatPhrases.attack.length)];
    appendLog(fillPhrase(phrase, damage), isCritical ? 'critical' : undefined);
    setActionReadoutText(`Вы наносите ${formatNumber(damage)} урона по ${enemyState.name}.`);
    setStanceText('Наступление', 'focus');
    const enemyDefeated = damageEnemy(damage, isCritical);
    if (!enemyDefeated) {
      setTurnIndicatorText('Ход врага', 'danger');
      setTimeout(enemyTurn, 650);
    }
    return;
  }

  if (action === 'defend') {
    const guard = Math.round(playerState.defense * 1.4) + randomInRange(18, 35);
    const phrase = combatPhrases.defend[Math.floor(Math.random() * combatPhrases.defend.length)];
    appendLog(fillPhrase(phrase, guard), 'heal');
    applyShield(guard);
    setActionReadoutText(`Щит поглотит до ${formatNumber(guard)} урона в следующей атаке.`);
    setStanceText('Глухая оборона', 'focus');
    setTurnIndicatorText('Ход врага', 'danger');
    setTimeout(enemyTurn, 650);
    return;
  }

  if (action === 'skill') {
    const manaCost = 60;
    if (playerState.mp < manaCost) {
      appendLog('Недостаточно маны для использования умения.', 'critical');
      setActionReadoutText('Недостаточно маны для ритуала крови.');
      setTurnIndicatorText('Ваш ход', 'default');
      setPlayerTurn(true);
      return;
    }
    playerState.mp -= manaCost;
    const burst = Math.round(playerState.agility * 0.75) + randomInRange(75, 110);
    const skillBuff = 25 + Math.round(playerState.level / 2);
    const phrase = combatPhrases.skill[Math.floor(Math.random() * combatPhrases.skill.length)];
    appendLog(fillPhrase(phrase, `${skillBuff}`), 'critical');
    appendLog(`Ритуал крови обрушивает волну на <strong>${formatNumber(burst)}</strong> урона.`, 'critical');
    updatePlayerBars();
    enemyState.minDamage = Math.max(10, enemyState.minDamage - 2);
    setActionReadoutText(`Кровавый ритуал наносит ${formatNumber(burst)} урона и ослабляет ${enemyState.name}.`);
    setStanceText('Ритуал крови', 'focus');
    const enemyDefeated = damageEnemy(burst, true);
    if (!enemyDefeated) {
      setTurnIndicatorText('Ход врага', 'danger');
      setTimeout(enemyTurn, 650);
    }
    return;
  }

  if (action === 'heal') {
    if (playerState.hp >= playerState.maxHp) {
      appendLog('Вы и так на пике силы — исцеление не требуется.', 'heal');
      setActionReadoutText('Здоровье уже на максимуме.');
      setTurnIndicatorText('Ваш ход', 'default');
      setPlayerTurn(true);
      return;
    }
    const manaCost = 35;
    if (playerState.mp < manaCost) {
      appendLog('Недостаточно маны, чтобы соткать лечебный ритуал.', 'critical');
      setActionReadoutText('Недостаточно маны для исцеления.');
      setTurnIndicatorText('Ваш ход', 'default');
      setPlayerTurn(true);
      return;
    }
    playerState.mp -= manaCost;
    const missingHp = playerState.maxHp - playerState.hp;
    const healPotential = Math.round(playerState.maxHp * 0.35) + randomInRange(24, 44);
    const healAmount = Math.min(healPotential, missingHp);
    playerState.hp += healAmount;
    updatePlayerBars();
    const phrase = combatPhrases.heal[Math.floor(Math.random() * combatPhrases.heal.length)];
    appendLog(fillPhrase(phrase, healAmount), 'heal');
    setActionReadoutText(`Лечение восстанавливает ${formatNumber(healAmount)} здоровья.`);
    setStanceText('Восстановление', 'focus');
    setTurnIndicatorText('Ход врага', 'danger');
    setTimeout(enemyTurn, 650);
    return;
  }

  setPlayerTurn(true);
}

function handleAction(event) {
  const { action } = event.currentTarget.dataset;
  if (!action) return;
  performPlayerAction(action);
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

updateStats();
updatePlayerBars();
spawnEnemy(enemyTemplates[0]);
setActionReadoutText('Выберите действие, чтобы начать раунд.');
