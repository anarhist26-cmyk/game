const combatLog = document.querySelector('#combat-log');
const chatLog = document.querySelector('#chat-log');
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
const actionButtons = document.querySelectorAll('.action-button');
const questFilters = document.querySelectorAll('.quest-filter');
const quests = document.querySelectorAll('.quest-list .quest');
const mapCanvas = document.querySelector('#world-map-canvas');
const mapContext = mapCanvas?.getContext('2d');
const mapNodeLayer = document.querySelector('#map-node-layer');
let mapNodes = [];
const mapAvatar = document.querySelector('#map-avatar');
const mapIntel = document.querySelector('#map-intel');
const mapLocation = document.querySelector('#map-location');
const mapTrailElement = document.querySelector('#map-trail');
const mapControlButtons = document.querySelectorAll('.map-control');
const lootList = document.querySelector('#loot-list');
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
    intro: 'Скелет скрежещет клинками, выжидая момент для атаки.',
    lootTable: [
      {
        id: 'bone-shard',
        name: 'Костяной осколок',
        rarity: 'common',
        quantity: [2, 4],
        chance: 0.95,
        guaranteed: true,
        icon: '🦴',
        description: 'Материал для кузницы костей Совета.'
      },
      {
        id: 'grave-dust',
        name: 'Могильная пыль',
        rarity: 'uncommon',
        quantity: [1, 2],
        chance: 0.55,
        icon: '🕯️',
        description: 'Используется для усиления защитных печатей.'
      },
      {
        id: 'scarlet-signet',
        name: 'Алый перстень дозорного',
        rarity: 'rare',
        quantity: [1, 1],
        chance: 0.18,
        icon: '💍',
        description: 'Повышает шанс критического удара на арене.'
      },
      {
        id: 'night-essence',
        name: 'Эссенция ночных стражей',
        rarity: 'epic',
        quantity: [1, 1],
        chance: 0.08,
        icon: '✨',
        description: 'Раскрывает скрытые тропы в катакомбах.'
      }
    ]
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
    intro: 'Инквизитор окутан чёрным плащом и нашёптывает клятвы крови.',
    lootTable: [
      {
        id: 'obsidian-sigil',
        name: 'Обсидиановая печать',
        rarity: 'uncommon',
        quantity: [1, 2],
        chance: 0.75,
        guaranteed: true,
        icon: '🛡️',
        description: 'Укрепляет щиты крови перед рейдами.'
      },
      {
        id: 'blood-script',
        name: 'Писания кровавого дозора',
        rarity: 'rare',
        quantity: [1, 1],
        chance: 0.32,
        icon: '📜',
        description: 'Раскрывает скрытые задачи ордена.'
      },
      {
        id: 'hex-ember',
        name: 'Уголь проклятия',
        rarity: 'epic',
        quantity: [1, 1],
        chance: 0.14,
        icon: '🔥',
        description: 'Ослабляет магический урон врагов на 12%.'
      },
      {
        id: 'dawn-mantle',
        name: 'Накидка Рассвета',
        rarity: 'legendary',
        quantity: [1, 1],
        chance: 0.06,
        icon: '🧥',
        description: 'Увеличивает мощь умений на 18%.'
      }
    ]
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
    intro: 'Гарпия кружит над ареной, рассыпая перья с огненной кромкой.',
    lootTable: [
      {
        id: 'razor-plume',
        name: 'Лезвийное перо',
        rarity: 'common',
        quantity: [3, 5],
        chance: 0.88,
        guaranteed: true,
        icon: '🪶',
        description: 'Оружейники любят их за режущую кромку.'
      },
      {
        id: 'sky-glass',
        name: 'Осколок небесного стекла',
        rarity: 'uncommon',
        quantity: [1, 2],
        chance: 0.48,
        icon: '🔮',
        description: 'Служит катализатором для воздушных чар.'
      },
      {
        id: 'storm-rune',
        name: 'Руна штормового визга',
        rarity: 'rare',
        quantity: [1, 1],
        chance: 0.2,
        icon: '🌀',
        description: 'Призывает вихрь, что разоружает противника.'
      },
      {
        id: 'crescent-lyre',
        name: 'Лира Полуночного ветра',
        rarity: 'epic',
        quantity: [1, 1],
        chance: 0.08,
        icon: '🎼',
        description: 'Усиливает боевой дух союзников гильдии.'
      }
    ]
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
    intro: 'Полководец поднимает клинок, призывая вас к решающей дуэли.',
    lootTable: [
      {
        id: 'blood-signet',
        name: 'Печать багрового командора',
        rarity: 'uncommon',
        quantity: [1, 2],
        chance: 0.8,
        guaranteed: true,
        icon: '🗡️',
        description: 'Позволяет призвать элитную стражу на поле боя.'
      },
      {
        id: 'legion-banner',
        name: 'Знамя Алой Стражи',
        rarity: 'rare',
        quantity: [1, 1],
        chance: 0.28,
        icon: '🚩',
        description: 'Повышает репутацию гильдии среди торговцев.'
      },
      {
        id: 'moonsteel-ingot',
        name: 'Слиток лунной стали',
        rarity: 'epic',
        quantity: [1, 2],
        chance: 0.18,
        icon: '⚒️',
        description: 'Редкий материал для легендарных клинков.'
      },
      {
        id: 'sovereign-crest',
        name: 'Герб Верховного Архонта',
        rarity: 'legendary',
        quantity: [1, 1],
        chance: 0.06,
        icon: '👑',
        description: 'Открывает доступ к рейду Высшей крови.'
      }
    ]
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

function rollLoot(table = []) {
  if (!Array.isArray(table) || !table.length) return [];
  return table.reduce((drops, item) => {
    const chance = typeof item.chance === 'number' ? Math.max(0, Math.min(1, item.chance)) : 0;
    const quantityRange = Array.isArray(item.quantity) ? item.quantity : [item.quantity || 1, item.quantity || 1];
    const min = Math.max(1, Number(quantityRange[0]) || 1);
    const max = Math.max(min, Number(quantityRange[1]) || min);
    if (item.guaranteed || Math.random() < chance) {
      drops.push({
        id: item.id,
        name: item.name,
        rarity: item.rarity || 'common',
        quantity: randomInRange(min, max),
        icon: item.icon || '',
        description: item.description || ''
      });
    }
    return drops;
  }, []);
}

function updateLootUI(summary) {
  if (!lootList) return;
  const { enemyName, xp, gold, items } = summary;
  lootList.innerHTML = '';

  const header = document.createElement('li');
  header.className = 'loot-list__summary';
  header.innerHTML = `<strong>${enemyName}</strong>`;
  const meta = document.createElement('div');
  meta.className = 'loot-list__summary-meta';
  meta.innerHTML = `<span>Опыт: ${formatNumber(xp)}</span><span>Золото: ${formatNumber(gold)}</span>`;
  header.appendChild(meta);
  lootList.appendChild(header);

  if (!items.length) {
    const empty = document.createElement('li');
    empty.className = 'loot-list__empty';
    empty.textContent = 'Ничего ценного не найдено — враг рассеялся в алом тумане.';
    lootList.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const entry = document.createElement('li');
    entry.className = `loot-item loot-item--${item.rarity}`;
    const info = document.createElement('div');
    info.className = 'loot-item__info';
    const name = document.createElement('span');
    name.className = 'loot-item__name';
    name.innerHTML = `${item.icon ? `<span class="loot-item__icon">${item.icon}</span>` : ''}${item.name}`;
    const metaLine = document.createElement('span');
    metaLine.className = 'loot-item__meta';
    metaLine.textContent = item.description || 'Стандартный трофей.';
    info.append(name, metaLine);
    const quantity = document.createElement('span');
    quantity.className = 'loot-item__quantity';
    quantity.textContent = `×${formatNumber(item.quantity)}`;
    entry.append(info, quantity);
    lootList.appendChild(entry);
  });
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

function rewardPlayer({ xpReward, goldReward, lootTable = [], name }) {
  gainXp(xpReward);
  const goldGain = randomInRange(goldReward[0], goldReward[1]);
  playerState.gold += goldGain;
  updateStats();
  const drops = rollLoot(lootTable);
  appendLog(`Вы собираете <strong>${formatNumber(goldGain)}</strong> золота с поверженного врага.`, 'heal');
  if (drops.length) {
    const summary = drops
      .map((item) => `${item.name} ×${formatNumber(item.quantity)}`)
      .join(', ');
    appendLog(`Трофеи боя: ${summary}.`, 'heal');
  } else {
    appendLog('Трофеи боя: лишь пепел и кровь остаются после врага.', 'heal');
  }
  updateLootUI({ enemyName: name || 'Неизвестный противник', xp: xpReward, gold: goldGain, items: drops });
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


const labyrinthNodes = [
  {
    id: 'citadel',
    label: 'Цитадель Алого Сумрака',
    type: 'boss',
    position: [0.5, 0.5],
    intel: 'Сердце Империи пульсирует эссенцией и управляет портальными нитями лабиринта.',
    connections: { north: 'inner-north', south: 'inner-south', east: 'inner-east', west: 'inner-west' }
  },
  {
    id: 'inner-north',
    label: 'Кольцо Воронов',
    type: 'path',
    position: [0.5, 0.42],
    intel: 'Переход к северным воротам. Караул проверяет печати крови на каждой связке.',
    connections: { south: 'citadel', north: 'north-gate', east: 'portal-north-east', west: 'portal-north-west' }
  },
  {
    id: 'inner-south',
    label: 'Галерея Огней',
    type: 'path',
    position: [0.5, 0.58],
    intel: 'Коридор ведёт к нижним ярусам катакомб и мастерским алхимиков.',
    connections: { north: 'citadel', south: 'south-gate', east: 'portal-south-east', west: 'portal-south-west' }
  },
  {
    id: 'inner-east',
    label: 'Артерия восточного крыла',
    type: 'path',
    position: [0.58, 0.5],
    intel: 'Поток мерцающей эссенции ведёт к рынку рун и торговцам древними печатями.',
    connections: { west: 'citadel', east: 'east-gate', north: 'portal-north-east', south: 'portal-south-east' }
  },
  {
    id: 'inner-west',
    label: 'Тоннель теней',
    type: 'path',
    position: [0.42, 0.5],
    intel: 'Спрятанный путь к мастерским гильдии и оружейным кузницам.',
    connections: { east: 'citadel', west: 'west-gate', north: 'portal-north-west', south: 'portal-south-west' }
  },
  {
    id: 'north-gate',
    label: 'Северные ворота',
    type: 'gate',
    position: [0.5, 0.32],
    intel: 'Караул следит за каждым путником, ведущим к ледяным покоям архонтов.',
    connections: { south: 'inner-north', north: 'north-ward', east: 'portal-north-east', west: 'portal-north-west' }
  },
  {
    id: 'south-gate',
    label: 'Южные ворота',
    type: 'gate',
    position: [0.5, 0.68],
    intel: 'Запечатанный вход в алтарные склепы и рынки алхимиков.',
    connections: { north: 'inner-south', south: 'south-ward', east: 'portal-south-east', west: 'portal-south-west' }
  },
  {
    id: 'east-gate',
    label: 'Восточные ворота',
    type: 'gate',
    position: [0.68, 0.5],
    intel: 'Патрули гильдий охраняют порталы к торговым кварталам.',
    connections: { west: 'inner-east', east: 'east-ward', north: 'portal-north-east', south: 'portal-south-east' }
  },
  {
    id: 'west-gate',
    label: 'Западные ворота',
    type: 'gate',
    position: [0.32, 0.5],
    intel: 'Ведут в кузницы и склады оружия.',
    connections: { east: 'inner-west', west: 'west-ward', north: 'portal-north-west', south: 'portal-south-west' }
  },
  {
    id: 'north-ward',
    label: 'Ледяной карниз',
    type: 'portal',
    position: [0.5, 0.22],
    intel: 'Ворота к обледеневшим террасам архонтов.',
    connections: { south: 'north-gate', north: 'north-sanctum', east: 'north-east-ward', west: 'north-west-ward' }
  },
  {
    id: 'north-sanctum',
    label: 'Святилище Полуночного ветра',
    type: 'sanctum',
    position: [0.5, 0.12],
    intel: 'Здесь звучит хорал, открывающий древние клятвы.',
    connections: { south: 'north-ward' }
  },
  {
    id: 'north-east-ward',
    label: 'Казармы ледяных стражей',
    type: 'treasure',
    position: [0.62, 0.24],
    intel: 'Командиры прячут здесь редкие руны и замороженные трофеи.',
    connections: { west: 'north-ward', east: 'outer-north-east' }
  },
  {
    id: 'north-west-ward',
    label: 'Обитель вороних дозоров',
    type: 'treasure',
    position: [0.38, 0.24],
    intel: 'Сюда свозят перья и маски ночного дозора.',
    connections: { east: 'north-ward', west: 'outer-north-west' }
  },
  {
    id: 'outer-north-east',
    label: 'Рубеж Стылой Луны',
    type: 'gate',
    position: [0.72, 0.24],
    intel: 'Открывает путь к ледяным бастионам спутников.',
    connections: { west: 'north-east-ward' }
  },
  {
    id: 'outer-north-west',
    label: 'Застава Чернокрылых',
    type: 'gate',
    position: [0.28, 0.24],
    intel: 'Пропускает только тех, кто принесёт кровь врагов.',
    connections: { east: 'north-west-ward' }
  },
  {
    id: 'south-ward',
    label: 'Алый колодец',
    type: 'portal',
    position: [0.5, 0.78],
    intel: 'Сердце ритуалов крови и доступа к нижним катакомбам.',
    connections: { north: 'south-gate', south: 'south-sanctum', east: 'south-east-ward', west: 'south-west-ward' }
  },
  {
    id: 'south-sanctum',
    label: 'Святилище Жар-птицы',
    type: 'sanctum',
    position: [0.5, 0.88],
    intel: 'Пламя восстанавливает павших героев.',
    connections: { north: 'south-ward' }
  },
  {
    id: 'south-east-ward',
    label: 'Алхимическая пристань',
    type: 'treasure',
    position: [0.62, 0.76],
    intel: 'Хранятся редкие эликсиры и реагенты.',
    connections: { west: 'south-ward', east: 'outer-south-east' }
  },
  {
    id: 'south-west-ward',
    label: 'Гранитные склады',
    type: 'treasure',
    position: [0.38, 0.76],
    intel: 'Запасы металла и эссенции для осад.',
    connections: { east: 'south-ward', west: 'outer-south-west' }
  },
  {
    id: 'outer-south-east',
    label: 'Врата Горящего Полумесяца',
    type: 'gate',
    position: [0.72, 0.76],
    intel: 'Выводят к пламенеющим аренам кланов.',
    connections: { west: 'south-east-ward' }
  },
  {
    id: 'outer-south-west',
    label: 'Лазурный редут',
    type: 'gate',
    position: [0.28, 0.76],
    intel: 'Отсюда открываются подземные ходы в ущелья.',
    connections: { east: 'south-west-ward' }
  },
  {
    id: 'east-ward',
    label: 'Зеркало торговцев',
    type: 'portal',
    position: [0.78, 0.5],
    intel: 'Мерцающий портал ведёт к рынку реликвий.',
    connections: { west: 'east-gate', east: 'east-sanctum', north: 'east-north-ward', south: 'east-south-ward' }
  },
  {
    id: 'east-sanctum',
    label: 'Хранилище рун',
    type: 'sanctum',
    position: [0.88, 0.5],
    intel: 'Место, где заключены договоры с духами торговли.',
    connections: { west: 'east-ward' }
  },
  {
    id: 'east-north-ward',
    label: 'Терраса арбитров',
    type: 'treasure',
    position: [0.76, 0.38],
    intel: 'Арбитры проводят сюда победителей арены.',
    connections: { south: 'east-ward', north: 'outer-east-north' }
  },
  {
    id: 'east-south-ward',
    label: 'Лаборатория рунных мастеров',
    type: 'treasure',
    position: [0.76, 0.62],
    intel: 'Тоннели наполнены руническими искрами.',
    connections: { north: 'east-ward', south: 'outer-east-south' }
  },
  {
    id: 'outer-east-north',
    label: 'Портал к облачным мостам',
    type: 'gate',
    position: [0.76, 0.28],
    intel: 'Ведёт к парящим укреплениям над бездной.',
    connections: { south: 'east-north-ward' }
  },
  {
    id: 'outer-east-south',
    label: 'Терраса огненных клятв',
    type: 'gate',
    position: [0.76, 0.72],
    intel: 'Пропускает только носителей священных печатей.',
    connections: { north: 'east-south-ward' }
  },
  {
    id: 'west-ward',
    label: 'Туннель мастеров',
    type: 'portal',
    position: [0.22, 0.5],
    intel: 'Связь между кузницами и центральными складами.',
    connections: { east: 'west-gate', west: 'west-sanctum', north: 'west-north-ward', south: 'west-south-ward' }
  },
  {
    id: 'west-sanctum',
    label: 'Святилище Каменной клятвы',
    type: 'sanctum',
    position: [0.12, 0.5],
    intel: 'Оплот кузнецов, создающих артефакты.',
    connections: { east: 'west-ward' }
  },
  {
    id: 'west-north-ward',
    label: 'Гнездо рыцарей сумрака',
    type: 'treasure',
    position: [0.24, 0.38],
    intel: 'Они накапливают редкие пластины брони.',
    connections: { south: 'west-ward', north: 'outer-west-north' }
  },
  {
    id: 'west-south-ward',
    label: 'Склепы Алатара',
    type: 'treasure',
    position: [0.24, 0.62],
    intel: 'Хранятся филактерии павших генералов.',
    connections: { north: 'west-ward', south: 'outer-west-south' }
  },
  {
    id: 'outer-west-north',
    label: 'Башня дымных крыльев',
    type: 'gate',
    position: [0.24, 0.28],
    intel: 'Скрытая обсерватория воздушной разведки.',
    connections: { south: 'west-north-ward' }
  },
  {
    id: 'outer-west-south',
    label: 'Форт подземной реки',
    type: 'gate',
    position: [0.24, 0.72],
    intel: 'Ведёт в подземные катакомбы реки крови.',
    connections: { north: 'west-south-ward' }
  },
  {
    id: 'portal-north-east',
    label: 'Перекрёсток стихий',
    type: 'portal',
    position: [0.62, 0.38],
    intel: 'Магические лучи соединяют ворота с рынками.',
    connections: { west: 'inner-north', south: 'inner-east', north: 'north-gate', east: 'east-gate' }
  },
  {
    id: 'portal-north-west',
    label: 'Зеркало Чернокрыла',
    type: 'portal',
    position: [0.38, 0.38],
    intel: 'Чернокрылая стража наблюдает за северо-западным крылом.',
    connections: { east: 'inner-north', south: 'inner-west', north: 'north-gate', west: 'west-gate' }
  },
  {
    id: 'portal-south-east',
    label: 'Кристальный перекрёсток',
    type: 'portal',
    position: [0.62, 0.62],
    intel: 'Своды мерцают алым стеклом и ведут в торжище алхимиков.',
    connections: { north: 'inner-east', west: 'inner-south', east: 'east-gate', south: 'south-gate' }
  },
  {
    id: 'portal-south-west',
    label: 'Огненный дозор',
    type: 'portal',
    position: [0.38, 0.62],
    intel: 'Гильдия следит за юго-западными тоннелями.',
    connections: { north: 'inner-west', east: 'inner-south', south: 'south-gate', west: 'west-gate' }
  }
];

const originNodeId = 'citadel';
const labyrinthNodeMap = new Map(labyrinthNodes.map((node) => [node.id, node]));

const labyrinthChambers = [
  { x: 0.42, y: 0.42, w: 0.16, h: 0.16 },
  { x: 0.32, y: 0.32, w: 0.1, h: 0.1 },
  { x: 0.58, y: 0.32, w: 0.1, h: 0.1 },
  { x: 0.32, y: 0.58, w: 0.1, h: 0.1 },
  { x: 0.58, y: 0.58, w: 0.1, h: 0.1 },
  { x: 0.32, y: 0.44, w: 0.1, h: 0.08 },
  { x: 0.58, y: 0.44, w: 0.1, h: 0.08 },
  { x: 0.44, y: 0.32, w: 0.08, h: 0.1 },
  { x: 0.44, y: 0.58, w: 0.08, h: 0.1 },
  { x: 0.2, y: 0.2, w: 0.1, h: 0.1 },
  { x: 0.7, y: 0.2, w: 0.1, h: 0.1 },
  { x: 0.2, y: 0.7, w: 0.1, h: 0.1 },
  { x: 0.7, y: 0.7, w: 0.1, h: 0.1 },
  { x: 0.2, y: 0.44, w: 0.1, h: 0.12 },
  { x: 0.7, y: 0.44, w: 0.1, h: 0.12 },
  { x: 0.44, y: 0.2, w: 0.12, h: 0.1 },
  { x: 0.44, y: 0.7, w: 0.12, h: 0.1 },
  { x: 0.18, y: 0.18, w: 0.06, h: 0.06 },
  { x: 0.76, y: 0.18, w: 0.06, h: 0.06 },
  { x: 0.18, y: 0.76, w: 0.06, h: 0.06 },
  { x: 0.76, y: 0.76, w: 0.06, h: 0.06 },
  { x: 0.2, y: 0.32, w: 0.06, h: 0.06 },
  { x: 0.74, y: 0.32, w: 0.06, h: 0.06 },
  { x: 0.2, y: 0.62, w: 0.06, h: 0.06 },
  { x: 0.74, y: 0.62, w: 0.06, h: 0.06 },
  { x: 0.44, y: 0.1, w: 0.12, h: 0.06 },
  { x: 0.44, y: 0.84, w: 0.12, h: 0.06 }
];

const labyrinthGlyphs = [
  { position: [0.5, 0.36], icon: '⚔️', glow: 'rgba(242, 77, 109, 0.55)', core: 'rgba(39, 10, 21, 0.92)' },
  { position: [0.5, 0.64], icon: '🛡️', glow: 'rgba(108, 196, 255, 0.5)', core: 'rgba(13, 22, 38, 0.92)' },
  { position: [0.36, 0.5], icon: '🔮', glow: 'rgba(192, 149, 255, 0.6)', core: 'rgba(25, 16, 36, 0.9)' },
  { position: [0.64, 0.5], icon: '🜂', glow: 'rgba(255, 150, 102, 0.55)', core: 'rgba(36, 20, 14, 0.92)' },
  { position: [0.36, 0.36], icon: '☠️', glow: 'rgba(255, 255, 255, 0.28)', core: 'rgba(20, 20, 28, 0.92)' },
  { position: [0.64, 0.36], icon: '🧪', glow: 'rgba(81, 224, 192, 0.55)', core: 'rgba(12, 31, 28, 0.9)' },
  { position: [0.36, 0.64], icon: '🗝️', glow: 'rgba(255, 228, 118, 0.55)', core: 'rgba(34, 26, 14, 0.9)' },
  { position: [0.64, 0.64], icon: '📜', glow: 'rgba(192, 149, 255, 0.5)', core: 'rgba(18, 16, 32, 0.92)' },
  { position: [0.5, 0.5], icon: '⛬', glow: 'rgba(242, 77, 109, 0.7)', core: 'rgba(48, 12, 24, 0.95)', scale: 1.2 },
  { position: [0.2, 0.5], icon: '⚙️', glow: 'rgba(148, 179, 255, 0.55)', core: 'rgba(16, 22, 38, 0.9)' },
  { position: [0.8, 0.5], icon: '💰', glow: 'rgba(255, 208, 120, 0.6)', core: 'rgba(36, 24, 12, 0.9)' }
];

const labyrinthEdges = [];
const edgeRegistry = new Set();
labyrinthNodes.forEach((node) => {
  const { connections = {} } = node;
  Object.values(connections).forEach((targetId) => {
    if (!targetId || !labyrinthNodeMap.has(targetId)) return;
    const key = [node.id, targetId].sort().join('::');
    if (edgeRegistry.has(key)) return;
    edgeRegistry.add(key);
    labyrinthEdges.push({ from: node.id, to: targetId });
  });
});

let activeNodeId = labyrinthNodeMap.has(originNodeId) ? originNodeId : labyrinthNodes[0]?.id || null;
let hoveredNodeId = null;
let mapPulse = 0;
const travelHistory = activeNodeId ? [activeNodeId] : [];
const visitedNodeIds = new Set(travelHistory);

function getNode(id) {
  return labyrinthNodeMap.get(id);
}

function createMapNodes() {
  if (!mapNodeLayer) return;
  mapNodeLayer.innerHTML = '';
  labyrinthNodes.forEach((node) => {
    const item = document.createElement('li');
    item.style.setProperty('--x', (node.position[0] * 100).toFixed(2));
    item.style.setProperty('--y', (node.position[1] * 100).toFixed(2));
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `map-node map-node--${node.type}`;
    button.dataset.node = node.id;
    if (node.intel) button.dataset.intel = node.intel;
    button.setAttribute('aria-label', `${node.label}. ${node.intel}`);
    button.innerHTML = '<span class="map-node__pip"></span><span class="map-node__label">' + node.label + '</span>';
    item.appendChild(button);
    mapNodeLayer.appendChild(item);
  });
  mapNodes = Array.from(mapNodeLayer.querySelectorAll('.map-node'));
}

function syncMapNodeSelection() {
  if (!mapNodes.length) return;
  mapNodes.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.node === activeNodeId);
    button.classList.toggle('is-visited', visitedNodeIds.has(button.dataset.node || ''));
  });
}

function updateLocationLabel() {
  if (!mapLocation) return;
  const node = getNode(activeNodeId);
  mapLocation.textContent = node ? node.label : 'Неизвестная точка';
}

function updateMapAvatarPosition() {
  if (!mapAvatar) return;
  const node = getNode(activeNodeId);
  if (!node) return;
  mapAvatar.style.left = `${(node.position[0] * 100).toFixed(2)}%`;
  mapAvatar.style.top = `${(node.position[1] * 100).toFixed(2)}%`;
}

function updateTravelTrail() {
  if (!mapTrailElement) return;
  mapTrailElement.innerHTML = '';
  const recent = travelHistory.slice(-6);
  recent.forEach((id, index) => {
    const entry = document.createElement('li');
    entry.className = 'map-trail__item';
    if (index === recent.length - 1) entry.classList.add('is-current');
    const node = getNode(id);
    entry.textContent = node ? node.label : id;
    mapTrailElement.appendChild(entry);
  });
}

function updateMovementControls() {
  if (!mapControlButtons.length) return;
  const current = getNode(activeNodeId);
  mapControlButtons.forEach((button) => {
    const direction = button.dataset.direction;
    if (direction === 'origin') {
      button.disabled = activeNodeId === originNodeId || !originNodeId;
      return;
    }
    const hasRoute = Boolean(current?.connections?.[direction]);
    button.disabled = !hasRoute;
  });
}

function attemptMoveTo(targetId) {
  if (!targetId || targetId === activeNodeId) return;
  if (targetId === originNodeId) {
    moveToNode(targetId);
    return;
  }
  const current = getNode(activeNodeId);
  if (!current) return;
  const neighbors = new Set(Object.values(current.connections || {}));
  if (neighbors.has(targetId)) {
    moveToNode(targetId);
  }
}

function attemptDirection(direction) {
  if (!direction) return;
  if (direction === 'origin') {
    if (activeNodeId !== originNodeId) moveToNode(originNodeId);
    return;
  }
  const current = getNode(activeNodeId);
  const targetId = current?.connections?.[direction];
  if (targetId) {
    moveToNode(targetId);
  }
}

function moveToNode(targetId) {
  if (!targetId || !labyrinthNodeMap.has(targetId) || targetId === activeNodeId) return;
  activeNodeId = targetId;
  visitedNodeIds.add(targetId);
  syncMapNodeSelection();
  updateLocationLabel();
  const node = getNode(targetId);
  if (node?.intel) setIntel(node.intel);
  if (!travelHistory.length || travelHistory[travelHistory.length - 1] !== targetId) {
    travelHistory.push(targetId);
    if (travelHistory.length > 12) {
      travelHistory.splice(0, travelHistory.length - 12);
    }
  }
  updateTravelTrail();
  updateMovementControls();
  updateMapAvatarPosition();
  drawMap();
}

function bindMapNodeEvents() {
  if (!mapNodes.length) return;
  mapNodes.forEach((button) => {
    const nodeId = button.dataset.node;
    button.addEventListener('click', () => attemptMoveTo(nodeId));
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        attemptMoveTo(nodeId);
      }
    });
    button.addEventListener('mouseenter', () => {
      hoveredNodeId = nodeId;
      const node = getNode(nodeId);
      if (node?.intel) setIntel(node.intel);
      drawMap();
    });
    button.addEventListener('mouseleave', () => {
      hoveredNodeId = null;
      restoreActiveIntel();
      drawMap();
    });
    button.addEventListener('focus', () => {
      hoveredNodeId = nodeId;
      const node = getNode(nodeId);
      if (node?.intel) setIntel(node.intel);
      drawMap();
    });
    button.addEventListener('blur', () => {
      hoveredNodeId = null;
      restoreActiveIntel();
      drawMap();
    });
  });
}

function updateCanvasDimensions() {
  if (!mapCanvas || !mapContext) return;
  const ratio = window.devicePixelRatio || 1;
  const width = mapCanvas.clientWidth || mapCanvas.width;
  const height = mapCanvas.clientHeight || mapCanvas.height;
  if (!width || !height) return;
  mapCanvas.width = width * ratio;
  mapCanvas.height = height * ratio;
  mapContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  updateMapAvatarPosition();
}

function drawLabyrinthBase(ctx, width, height) {
  ctx.fillStyle = '#080a17';
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(width * 0.5, height * 0.5, width * 0.1, width * 0.5, height * 0.5, Math.max(width, height) * 0.75);
  gradient.addColorStop(0, 'rgba(42, 16, 36, 0.85)');
  gradient.addColorStop(1, 'rgba(7, 9, 19, 0.95)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.fillStyle = 'rgba(28, 24, 44, 0.92)';
  labyrinthChambers.forEach(({ x, y, w, h }) => {
    ctx.fillRect(x * width, y * height, w * width, h * height);
  });
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
  ctx.lineWidth = Math.max(width, height) * 0.0035;
  labyrinthChambers.forEach(({ x, y, w, h }) => {
    ctx.strokeRect(x * width, y * height, w * width, h * height);
  });
  ctx.restore();
}

function drawLabyrinthGlyphs(ctx, width, height) {
  labyrinthGlyphs.forEach((glyph) => {
    const [gx, gy] = glyph.position;
    const x = gx * width;
    const y = gy * height;
    const radius = Math.max(width, height) * 0.032 * (glyph.scale || 1);
    ctx.save();
    const glow = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    glow.addColorStop(0, glyph.core || 'rgba(18, 18, 28, 0.95)');
    glow.addColorStop(1, 'rgba(8, 10, 21, 0.4)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = glyph.glow || 'rgba(242, 77, 109, 0.45)';
    ctx.lineWidth = radius * 0.18;
    ctx.globalAlpha = 0.6;
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = `${radius * 0.9}px 'Raleway', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = glyph.glow || 'rgba(242, 77, 109, 0.45)';
    ctx.shadowBlur = radius * 0.6;
    ctx.fillText(glyph.icon, x, y + (glyph.offsetY || 0));
    ctx.restore();
  });
}

function drawLabyrinthEdges(ctx, width, height) {
  const activeNeighbors = new Set(Object.values(getNode(activeNodeId)?.connections || {}));
  labyrinthEdges.forEach((edge) => {
    const from = getNode(edge.from);
    const to = getNode(edge.to);
    if (!from || !to) return;
    const fx = from.position[0] * width;
    const fy = from.position[1] * height;
    const tx = to.position[0] * width;
    const ty = to.position[1] * height;
    const isActive = edge.from === activeNodeId || edge.to === activeNodeId;
    const isReachable = activeNeighbors.has(edge.from) || activeNeighbors.has(edge.to);
    const isHovered = hoveredNodeId && (edge.from === hoveredNodeId || edge.to === hoveredNodeId);
    const isVisited = visitedNodeIds.has(edge.from) && visitedNodeIds.has(edge.to);
    const baseWidth = Math.max(width, height) * 0.012;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(tx, ty);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (isActive) {
      ctx.strokeStyle = `rgba(242, 77, 109, ${0.45 + Math.sin(mapPulse) * 0.2})`;
      ctx.lineWidth = baseWidth * 1.25;
      ctx.shadowColor = 'rgba(242, 77, 109, 0.45)';
      ctx.shadowBlur = baseWidth * 1.5;
    } else if (isHovered) {
      ctx.strokeStyle = `rgba(108, 196, 255, ${0.4 + Math.sin(mapPulse * 1.1) * 0.2})`;
      ctx.lineWidth = baseWidth * 1.1;
      ctx.shadowColor = 'rgba(108, 196, 255, 0.4)';
      ctx.shadowBlur = baseWidth * 1.4;
    } else if (isVisited) {
      ctx.strokeStyle = 'rgba(148, 179, 255, 0.32)';
      ctx.lineWidth = baseWidth * 1.05;
      ctx.setLineDash([baseWidth * 0.7, baseWidth * 1.1]);
    } else if (isReachable) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
      ctx.lineWidth = baseWidth;
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = baseWidth * 0.9;
    }
    ctx.stroke();
    ctx.restore();
  });

  labyrinthNodes.forEach((node) => {
    const nx = node.position[0] * width;
    const ny = node.position[1] * height;
    const radius = Math.max(width, height) * 0.018;
    const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, radius);
    if (node.id === activeNodeId) {
      glow.addColorStop(0, 'rgba(242, 77, 109, 0.38)');
      glow.addColorStop(1, 'rgba(242, 77, 109, 0)');
    } else if (visitedNodeIds.has(node.id)) {
      glow.addColorStop(0, 'rgba(148, 179, 255, 0.28)');
      glow.addColorStop(1, 'rgba(148, 179, 255, 0)');
    } else if (node.id === hoveredNodeId) {
      glow.addColorStop(0, 'rgba(108, 196, 255, 0.35)');
      glow.addColorStop(1, 'rgba(108, 196, 255, 0)');
    } else {
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(nx, ny, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawTravelPath(ctx, width, height) {
  if (travelHistory.length < 2) return;
  const recent = travelHistory.slice(-10).map((id) => getNode(id)).filter(Boolean);
  if (recent.length < 2) return;
  ctx.save();
  ctx.beginPath();
  recent.forEach((node, index) => {
    const px = node.position[0] * width;
    const py = node.position[1] * height;
    if (index === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  });
  const startNode = recent[0];
  const endNode = recent[recent.length - 1];
  const gradient = ctx.createLinearGradient(
    startNode.position[0] * width,
    startNode.position[1] * height,
    endNode.position[0] * width,
    endNode.position[1] * height
  );
  gradient.addColorStop(0, 'rgba(86, 194, 255, 0.2)');
  gradient.addColorStop(0.5, 'rgba(242, 77, 109, 0.55)');
  gradient.addColorStop(1, 'rgba(255, 207, 120, 0.7)');
  ctx.strokeStyle = gradient;
  ctx.lineWidth = Math.max(width, height) * 0.02;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(242, 77, 109, 0.45)';
  ctx.shadowBlur = Math.max(width, height) * 0.018;
  ctx.globalAlpha = 0.85;
  ctx.stroke();
  ctx.restore();
}

function drawMap() {
  if (!mapCanvas || !mapContext) return;
  const ctx = mapContext;
  const width = mapCanvas.clientWidth || mapCanvas.width;
  const height = mapCanvas.clientHeight || mapCanvas.height;

  ctx.clearRect(0, 0, width, height);
  drawLabyrinthBase(ctx, width, height);
  drawLabyrinthGlyphs(ctx, width, height);
  drawLabyrinthEdges(ctx, width, height);
  drawTravelPath(ctx, width, height);
}

function animateMap() {
  mapPulse += 0.015;
  drawMap();
  requestAnimationFrame(animateMap);
}

function initializeMapLayer() {
  if (!mapNodeLayer) return;
  createMapNodes();
  bindMapNodeEvents();
  if (!activeNodeId && labyrinthNodes.length) {
    activeNodeId = labyrinthNodes[0].id;
  }
  visitedNodeIds.clear();
  if (activeNodeId) {
    visitedNodeIds.add(activeNodeId);
  }
  syncMapNodeSelection();
  updateLocationLabel();
  travelHistory.length = 0;
  if (activeNodeId) travelHistory.push(activeNodeId);
  updateTravelTrail();
  updateMovementControls();
  const node = getNode(activeNodeId);
  if (node?.intel) setIntel(node.intel);
  updateMapAvatarPosition();
  if (mapCanvas && mapContext) {
    drawMap();
  }
}

function handleMapKeyboard(event) {
  if (!mapNodeLayer) return;
  const activeTag = document.activeElement?.tagName;
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
  const keyMap = {
    ArrowUp: 'north',
    ArrowDown: 'south',
    ArrowLeft: 'west',
    ArrowRight: 'east',
    w: 'north',
    W: 'north',
    s: 'south',
    S: 'south',
    a: 'west',
    A: 'west',
    d: 'east',
    D: 'east'
  };
  const direction = keyMap[event.key];
  if (!direction) return;
  event.preventDefault();
  attemptDirection(direction);
}

const resources = {
  essence: 9870,
  crystals: 1240,
  renown: 42600
};

if (mapCanvas && mapContext) {
  updateCanvasDimensions();
}

initializeMapLayer();

if (mapCanvas && mapContext) {
  drawMap();
  requestAnimationFrame(animateMap);
  window.addEventListener('resize', () => {
    updateCanvasDimensions();
    drawMap();
  });
}

mapControlButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const { direction } = button.dataset;
    attemptDirection(direction);
  });
});

window.addEventListener('keydown', handleMapKeyboard);

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

function restoreActiveIntel() {
  const node = getNode(activeNodeId);
  if (node?.intel) {
    setIntel(node.intel);
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

updateStats();
updatePlayerBars();
spawnEnemy(enemyTemplates[0]);
setActionReadoutText('Выберите действие, чтобы начать раунд.');
