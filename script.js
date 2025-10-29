const mapCanvas = document.getElementById('labyrinth-canvas');
const mapContext = mapCanvas ? mapCanvas.getContext('2d') : null;
const mapOverlay = document.getElementById('map-overlay');
const mapAvatar = document.getElementById('map-avatar');
const mapIntel = document.getElementById('map-intel');
const mapLocationElement = document.getElementById('map-location');
const mapCoordsElement = document.getElementById('map-coords');
const mapControls = document.querySelectorAll('.map-control');

const logTabs = document.querySelectorAll('.log-tab');
const logPanels = document.querySelectorAll('.log-panel');
const combatLog = document.getElementById('combat-log');
const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

const lootList = document.getElementById('loot-list');
const actionButtons = document.querySelectorAll('.action-button');
const commandButtons = document.querySelectorAll('.command-button');

const inventoryModal = document.getElementById('inventory-modal');
const inventoryCloseButton = document.getElementById('inventory-close');
const inventoryGrid = document.getElementById('inventory-grid');
const inventoryWeightElement = document.getElementById('inventory-weight');
const inventoryGoldElement = document.getElementById('inventory-gold');
const inventoryEssenceElement = document.getElementById('inventory-essence');
const inventoryCrystalsElement = document.getElementById('inventory-crystals');
const inventoryItemName = document.getElementById('inventory-item-name');
const inventoryItemType = document.getElementById('inventory-item-type');
const inventoryItemDescription = document.getElementById('inventory-item-description');
const inventoryItemStats = document.getElementById('inventory-item-stats');
const inventoryActions = document.querySelectorAll('[data-inventory-action]');

const inventoryState = {
  capacity: 120,
  items: [
    {
      id: 'blade-dawn',
      name: 'Клинок Рассвета',
      short: 'Рассвет',
      type: 'Двуручный меч',
      rarity: 'legendary',
      icon: '⚔️',
      quantity: 1,
      weight: 14,
      stats: {
        Урон: '+52',
        'Крит. шанс': '+7%',
        'Сила света': '+18'
      },
      description: 'Меч, выкованный из крови падшего архангела. Пронзает даже теневых тварей.'
    },
    {
      id: 'shield-obsidian',
      name: 'Обсидиановый бастион',
      short: 'Бастион',
      type: 'Щит',
      rarity: 'epic',
      icon: '🛡️',
      quantity: 1,
      weight: 12,
      stats: {
        Защита: '+36',
        'Поглощение': '+18%',
        Стойкость: '+10'
      },
      description: 'Щит, отражающий удары демонов. Пропитан чарой вечной ночи.'
    },
    {
      id: 'ring-storm',
      name: 'Кольцо Бури',
      short: 'Буря',
      type: 'Украшение',
      rarity: 'rare',
      icon: '💍',
      quantity: 1,
      weight: 1,
      stats: {
        Ловкость: '+8',
        'Скорость заклинаний': '+12%',
        'Сопротивление молнии': '+15%'
      },
      description: 'Шепчет грохотом гроз при каждом движении, усиливая молниеносные удары.'
    },
    {
      id: 'potion-ember',
      name: 'Эликсир Раскалённых Жил',
      short: 'Эликсир',
      type: 'Расходуемое',
      rarity: 'rare',
      icon: '🧪',
      quantity: 3,
      weight: 1,
      stats: {
        'Восстановление HP': '240',
        'Восстановление MP': '80'
      },
      description: 'Пылающий эликсир из сердца вулкана. Мгновенно восполняет жизненные силы.'
    },
    {
      id: 'scroll-abyss',
      name: 'Свиток Бездонной Стражи',
      short: 'Свиток',
      type: 'Расходуемое',
      rarity: 'epic',
      icon: '📜',
      quantity: 2,
      weight: 0.5,
      stats: {
        Щит: '+600',
        'Длительность': '30 сек'
      },
      description: 'При чтении выстраивает вокруг героя кольцо бездны, блокирующее удары.'
    },
    {
      id: 'relic-heart',
      name: 'Реликвия Сердце Артерии',
      short: 'Реликвия',
      type: 'Реликт',
      rarity: 'legendary',
      icon: '🩸',
      quantity: 1,
      weight: 6,
      stats: {
        'Кровавый урон': '+24%',
        Вампиризм: '+6%',
        'Сопротивление тьме': '+12%'
      },
      description: 'Живой артефакт, бьющийся в унисон с владельцем и жаждущий крови врагов.'
    },
    {
      id: 'supply-rations',
      name: 'Полевой рацион «Алый рассвет»',
      short: 'Рацион',
      type: 'Припасы',
      rarity: 'common',
      icon: '🥡',
      quantity: 5,
      weight: 0.6,
      stats: {
        Энергия: '+30',
        'Сопротивление холоду': '+6%'
      },
      description: 'Высушенное мясо и кристаллизованная эссенция. Поддерживает силы в дальних походах.'
    },
    {
      id: 'gem-soul',
      name: 'Самоцвет Душ',
      short: 'Самоцвет',
      type: 'Катализатор',
      rarity: 'epic',
      icon: '🔮',
      quantity: 1,
      weight: 2,
      stats: {
        'Запас эссенции': '+250',
        'Восстановление MP': '+10'
      },
      description: 'Хранит в себе отголоски павших героев. Усиливает контроль над магией крови.'
    }
  ]
};

let activeInventorySlot = null;

const turnIndicator = document.getElementById('turn-indicator');
const stanceIndicator = document.getElementById('stance-indicator');

const enemyNameElement = document.getElementById('enemy-name');
const enemyLevelElement = document.getElementById('enemy-level');
const enemyStatusElement = document.getElementById('enemy-status');
const enemyDamageElement = document.getElementById('enemy-damage');
const enemyRewardElement = document.getElementById('enemy-reward');

const serverTimeElement = document.getElementById('server-time');
const essenceCounter = document.getElementById('essence-counter');
const crystalCounter = document.getElementById('crystal-counter');
const renownCounter = document.getElementById('renown-counter');

const sidebarHpBar = document.getElementById('sidebar-hp');
const sidebarMpBar = document.getElementById('sidebar-mp');

const progressBars = new Map();
const progressLabels = new Map();

document.querySelectorAll('[data-bar]').forEach((bar) => {
  progressBars.set(bar.dataset.bar, bar);
});

document.querySelectorAll('[data-bar-text]').forEach((label) => {
  progressLabels.set(label.dataset.barText, label);
});

function formatNumber(value) {
  return value.toLocaleString('ru-RU');
}

function timestamp() {
  const now = new Date();
  return now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function appendLog(target, text) {
  if (!target) return;
  const entry = document.createElement('li');
  entry.className = 'log-entry';

  const time = document.createElement('span');
  time.className = 'log-entry__time';
  time.textContent = timestamp();

  const body = document.createElement('span');
  body.className = 'log-entry__text';
  body.innerHTML = text;

  entry.append(time, body);
  target.append(entry);

  if (target.children.length > 60) {
    target.removeChild(target.firstChild);
  }

  target.scrollTo({ top: target.scrollHeight, behavior: 'smooth' });
}

function calculateInventoryWeight() {
  return inventoryState.items.reduce((total, item) => total + item.weight * item.quantity, 0);
}

function syncInventoryResources() {
  if (!inventoryGoldElement || !inventoryEssenceElement || !inventoryCrystalsElement) return;
  const goldText = document.getElementById('player-gold')?.textContent ?? '0';
  const essenceText = essenceCounter?.textContent ?? '0';
  const crystalText = crystalCounter?.textContent ?? '0';
  inventoryGoldElement.textContent = goldText;
  inventoryEssenceElement.textContent = essenceText;
  inventoryCrystalsElement.textContent = crystalText;
}

function updateInventoryWeight() {
  if (!inventoryWeightElement) return;
  const weight = calculateInventoryWeight();
  const formatted = Number.isInteger(weight) ? weight : weight.toFixed(1).replace('.', ',');
  inventoryWeightElement.textContent = `${formatted} / ${inventoryState.capacity}`;
}

function clearInventorySelection() {
  if (activeInventorySlot) {
    activeInventorySlot.classList.remove('is-active');
    activeInventorySlot = null;
  }
}

function renderInventoryDetails(item) {
  if (!inventoryItemName || !inventoryItemDescription || !inventoryItemStats || !inventoryItemType) return;
  if (!item) {
    inventoryItemName.textContent = 'Выберите предмет';
    inventoryItemType.textContent = '';
    inventoryItemDescription.textContent = 'Кликните на ячейку, чтобы увидеть подробности.';
    inventoryItemStats.replaceChildren();
    return;
  }

  inventoryItemName.textContent = item.name;
  inventoryItemType.textContent = `${item.type} · ${item.rarity === 'legendary' ? 'Легендарный' : item.rarity === 'epic' ? 'Эпический' : item.rarity === 'rare' ? 'Редкий' : 'Обычный'}`;
  inventoryItemDescription.textContent = item.description;

  inventoryItemStats.replaceChildren();
  Object.entries(item.stats).forEach(([key, value]) => {
    const term = document.createElement('dt');
    term.textContent = key;
    const def = document.createElement('dd');
    def.textContent = value;
    inventoryItemStats.append(term, def);
  });
}

function renderInventory() {
  if (!inventoryGrid) return;
  inventoryGrid.replaceChildren();
  inventoryState.items.forEach((item) => {
    const slot = document.createElement('button');
    slot.type = 'button';
    slot.className = 'inventory-slot';
    slot.dataset.rarity = item.rarity;
    slot.dataset.qty = item.quantity > 1 ? item.quantity : '';
    slot.dataset.itemId = item.id;
    slot.innerHTML = `
      <span class="inventory-slot__icon">${item.icon}</span>
      <span class="inventory-slot__label">${item.short}</span>
    `;
    slot.addEventListener('click', () => {
      clearInventorySelection();
      activeInventorySlot = slot;
      slot.classList.add('is-active');
      renderInventoryDetails(item);
    });
    inventoryGrid.append(slot);
  });
}

function openInventory() {
  if (!inventoryModal) return;
  inventoryModal.classList.remove('is-hidden');
  inventoryModal.setAttribute('aria-hidden', 'false');
  syncInventoryResources();
  updateInventoryWeight();
  renderInventory();
  if (inventoryState.items.length) {
    const firstSlot = inventoryGrid?.querySelector('.inventory-slot');
    if (firstSlot) {
      firstSlot.click();
    }
  } else {
    renderInventoryDetails(null);
  }
}

function closeInventory() {
  if (!inventoryModal) return;
  inventoryModal.classList.add('is-hidden');
  inventoryModal.setAttribute('aria-hidden', 'true');
  clearInventorySelection();
  renderInventoryDetails(null);
}

function appendCombatLog(message) {
  appendLog(combatLog, message);
}

function appendChatLog(message) {
  appendLog(chatLog, message);
}

function setProgress(key, current, max) {
  const bar = progressBars.get(key);
  const label = progressLabels.get(key);
  const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  if (bar) {
    bar.style.setProperty('--value', ratio);
    bar.dataset.current = String(current);
    bar.dataset.max = String(max);
  }
  if (label) {
    label.textContent = `${formatNumber(current)} / ${formatNumber(max)}`;
  }
}

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
  shield: 0,
  skillBonus: 0,
  skillRounds: 0
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
      { id: 'bone-shard', name: 'Костяной осколок', rarity: 'common', quantity: [2, 4], chance: 0.95, guaranteed: true, icon: '🦴' },
      { id: 'grave-dust', name: 'Могильная пыль', rarity: 'uncommon', quantity: [1, 2], chance: 0.55, icon: '🕯️' },
      { id: 'scarlet-signet', name: 'Алый перстень дозорного', rarity: 'rare', quantity: [1, 1], chance: 0.18, icon: '💍' },
      { id: 'night-essence', name: 'Эссенция ночных стражей', rarity: 'epic', quantity: [1, 1], chance: 0.08, icon: '✨' }
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
      { id: 'obsidian-sigil', name: 'Обсидиановая печать', rarity: 'uncommon', quantity: [1, 2], chance: 0.75, guaranteed: true, icon: '🛡️' },
      { id: 'blood-script', name: 'Писания кровавого дозора', rarity: 'rare', quantity: [1, 1], chance: 0.32, icon: '📜' },
      { id: 'hex-ember', name: 'Уголь проклятия', rarity: 'epic', quantity: [1, 1], chance: 0.14, icon: '🔥' },
      { id: 'dawn-mantle', name: 'Накидка Рассвета', rarity: 'legendary', quantity: [1, 1], chance: 0.06, icon: '🧥' }
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
      { id: 'razor-plume', name: 'Лезвийное перо', rarity: 'common', quantity: [3, 5], chance: 0.88, guaranteed: true, icon: '🪶' },
      { id: 'sky-glass', name: 'Осколок небесного стекла', rarity: 'uncommon', quantity: [1, 2], chance: 0.48, icon: '🔮' },
      { id: 'storm-rune', name: 'Руна штормового визга', rarity: 'rare', quantity: [1, 1], chance: 0.2, icon: '🌀' },
      { id: 'crescent-lyre', name: 'Лира Полуночного ветра', rarity: 'epic', quantity: [1, 1], chance: 0.08, icon: '🎼' }
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
      { id: 'blood-signet', name: 'Печать багрового командора', rarity: 'uncommon', quantity: [1, 2], chance: 0.8, guaranteed: true, icon: '🗡️' },
      { id: 'legion-banner', name: 'Знамя Алой Стражи', rarity: 'rare', quantity: [1, 1], chance: 0.28, icon: '🚩' },
      { id: 'moonsteel-ingot', name: 'Слиток лунной стали', rarity: 'epic', quantity: [1, 2], chance: 0.18, icon: '⚒️' },
      { id: 'sovereign-crest', name: 'Герб Верховного Архонта', rarity: 'legendary', quantity: [1, 1], chance: 0.06, icon: '👑' }
    ]
  }
];

const combatPhrases = {
  attack: [
    'Вы выпускаете клинок Морессы, оставляя кровавый след. <strong>+{value}</strong> урона.',
    'Кровавое копьё пронзает врага. <strong>{value}</strong> урона.',
    'Вы активируете умение «Багровый шторм». Урон: <strong>{value}</strong>. '
  ],
  defend: [
    'Вы поднимаете щит Полумесяца, снижая входящий урон на <strong>{value}</strong>.',
    'Алое поле поглощает атаку. Щит крепнет на <strong>{value}</strong>.',
    'Вы укрываетесь за магической стеной, увеличивая защиту.'
  ],
  skill: [
    'Заклинание «Кровавые цепи» обвивает врага. Критический шанс +<strong>{value}%</strong>.',
    'Вы вызываете фамильяра Нокса. Следующий удар усилен на <strong>{value}</strong>.',
    'Темная мантра усиливает клинок. Бонус урона: <strong>{value}</strong>.'
  ],
  heal: [
    'Кровавый эликсир восстанавливает <strong>{value}</strong> НР.',
    'Мантра Жрецов закрывает раны. Исцелено: <strong>{value}</strong>.',
    'Символ Алого Света вспыхивает на коже. Восстановлено <strong>{value}</strong> НР.'
  ]
};

const mapState = {
  nodes: new Map(),
  current: null
};

const mapConfig = {
  cols: 13,
  rows: 9
};

function ensureNode(x, y) {
  const key = `${x},${y}`;
  if (!mapState.nodes.has(key)) {
    mapState.nodes.set(key, {
      key,
      x,
      y,
      type: 'step',
      name: null,
      intel: '',
      threat: 10,
      encounterChance: 0.28,
      levelRange: [8, 12],
      sector: null,
      neighbors: [],
      element: null
    });
  }
  return mapState.nodes.get(key);
}

function buildLabyrinth() {
  const segments = [
    [[6, 4], [6, 3], [6, 2], [6, 1]],
    [[6, 4], [6, 5], [6, 6], [6, 7]],
    [[6, 5], [5, 5], [4, 5], [3, 5], [2, 5]],
    [[3, 6], [3, 7], [3, 8]],
    [[6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [11, 4]],
    [[9, 4], [9, 5], [9, 6], [9, 7]],
    [[8, 4], [8, 3], [8, 2]],
    [[6, 6], [7, 6], [8, 6], [8, 7], [8, 8]],
    [[5, 6], [5, 7], [4, 7]],
    [[7, 4], [7, 5], [7, 6]],
    [[5, 5], [5, 4], [4, 4]]
  ];

  segments.forEach((path) => {
    path.forEach(([x, y]) => ensureNode(x, y));
  });

  const locationConfigs = {
    '6,4': {
      type: 'stronghold',
      name: 'Цитадель Алого Сумрака',
      intel: 'Центральная цитадель. Угроза: 12. Сердце Империи ждёт ваших приказов.',
      threat: 12,
      levelRange: [10, 12],
      encounterChance: 0.6
    },
    '6,1': {
      type: 'stronghold',
      name: 'Врата Рассвета',
      intel: 'Узкий проход, ведущий к верхним террасам. Патрули Орденов усилили караулы.',
      threat: 9,
      levelRange: [8, 10],
      encounterChance: 0.4
    },
    '2,5': {
      type: 'stronghold',
      name: 'Хранилище Пепла',
      intel: 'Сводчатая зала с барханами праха. В каждом вихре скрывается реликвия.',
      threat: 15,
      levelRange: [11, 14],
      encounterChance: 0.5
    },
    '3,7': {
      type: 'encounter',
      name: 'Катакомбы Эха',
      intel: 'Отголоски шагов мешают ориентироваться. Нечисть любит засады на поворотах.',
      threat: 16,
      levelRange: [12, 15],
      encounterChance: 0.65
    },
    '9,6': {
      type: 'stronghold',
      name: 'Святилище Лунных клинков',
      intel: 'Алтарь, где перековывают клинки из светящегося камня. Магия ослепляет врагов.',
      threat: 18,
      levelRange: [12, 16],
      encounterChance: 0.55
    },
    '8,2': {
      type: 'stronghold',
      name: 'Бастион Лестницы',
      intel: 'Каменные площадки, перерезанные лучами небесного света. Отличный ориентир.',
      threat: 11,
      levelRange: [9, 12],
      encounterChance: 0.45
    },
    '11,4': {
      type: 'encounter',
      name: 'Обелиск Заката',
      intel: 'Шпиль переливается золотом. Говорят, у подножия обитают элитные дозорные.',
      threat: 22,
      levelRange: [14, 17],
      encounterChance: 0.72
    },
    '3,8': {
      type: 'treasure',
      name: 'Зал трофеев',
      intel: 'Древние сундуки. Можно найти ценные эссенции, если пережить ловушки.',
      threat: 15,
      levelRange: [12, 15],
      encounterChance: 0.3
    }
  };

  Object.entries(locationConfigs).forEach(([key, config]) => {
    const node = mapState.nodes.get(key);
    if (!node) return;
    node.type = config.type;
    node.name = config.name;
    node.intel = config.intel;
    node.threat = config.threat;
    node.levelRange = config.levelRange;
    node.encounterChance = config.encounterChance;
  });

  const encounterBoost = {
    '6,3': 0.55,
    '6,5': 0.48,
    '9,5': 0.52,
    '7,6': 0.42,
    '5,7': 0.4,
    '8,7': 0.58,
    '4,5': 0.38,
    '3,6': 0.5
  };

  Object.entries(encounterBoost).forEach(([key, chance]) => {
    const node = mapState.nodes.get(key);
    if (!node) return;
    node.type = node.type === 'stronghold' ? node.type : 'encounter';
    node.encounterChance = chance;
  });

  mapState.nodes.forEach((node) => {
    node.neighbors = [];
  });

  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ];

  mapState.nodes.forEach((node) => {
    directions.forEach(([dx, dy]) => {
      const neighbor = mapState.nodes.get(`${node.x + dx},${node.y + dy}`);
      if (neighbor) {
        node.neighbors.push(neighbor.key);
      }
    });
  });
}

function gridToPixel(x, y) {
  if (!mapCanvas) {
    return { x: 0, y: 0 };
  }
  const spacingX = mapCanvas.width / (mapConfig.cols - 1);
  const spacingY = mapCanvas.height / (mapConfig.rows - 1);
  return {
    x: Math.round(x * spacingX),
    y: Math.round(y * spacingY)
  };
}

function drawMap() {
  if (!mapCanvas || !mapContext) return;
  const { width, height } = mapCanvas;
  mapContext.clearRect(0, 0, width, height);

  const spacingX = width / (mapConfig.cols - 1);
  const spacingY = height / (mapConfig.rows - 1);

  const sectorRects = [
    { x0: 4, y0: 3, x1: 8, y1: 5, color: 'rgba(179, 15, 42, 0.16)' },
    { x0: 5, y0: 0, x1: 7, y1: 2, color: 'rgba(63, 121, 201, 0.14)' },
    { x0: 8, y0: 3, x1: 12, y1: 7, color: 'rgba(118, 98, 198, 0.14)' },
    { x0: 4, y0: 5, x1: 7, y1: 8, color: 'rgba(63, 161, 104, 0.14)' },
    { x0: 1, y0: 4, x1: 4, y1: 7, color: 'rgba(194, 119, 54, 0.14)' }
  ];

  sectorRects.forEach((rect) => {
    const x = (rect.x0 - 0.5) * spacingX;
    const y = (rect.y0 - 0.5) * spacingY;
    const w = (rect.x1 - rect.x0 + 1) * spacingX;
    const h = (rect.y1 - rect.y0 + 1) * spacingY;
    mapContext.fillStyle = rect.color;
    mapContext.fillRect(x, y, w, h);
  });

  mapContext.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  mapContext.lineWidth = 1;
  mapContext.beginPath();
  for (let c = 0; c < mapConfig.cols; c += 1) {
    const x = c * spacingX;
    mapContext.moveTo(x, 0);
    mapContext.lineTo(x, height);
  }
  for (let r = 0; r < mapConfig.rows; r += 1) {
    const y = r * spacingY;
    mapContext.moveTo(0, y);
    mapContext.lineTo(width, y);
  }
  mapContext.stroke();

  mapContext.strokeStyle = 'rgba(210, 230, 255, 0.45)';
  mapContext.lineWidth = 3;
  mapContext.lineCap = 'round';

  mapState.nodes.forEach((node) => {
    const { x, y } = gridToPixel(node.x, node.y);
    node.neighbors.forEach((neighborKey) => {
      const neighbor = mapState.nodes.get(neighborKey);
      if (!neighbor) return;
      if (neighbor.x < node.x || neighbor.y < node.y) return;
      const { x: nx, y: ny } = gridToPixel(neighbor.x, neighbor.y);
      mapContext.beginPath();
      mapContext.moveTo(x, y);
      mapContext.lineTo(nx, ny);
      mapContext.stroke();
    });
  });
}

function renderNodes() {
  if (!mapOverlay) return;
  mapOverlay.innerHTML = '';

  mapState.nodes.forEach((node) => {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = 'map-node';
    element.dataset.type = node.type;
    const { x, y } = gridToPixel(node.x, node.y);
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    const label = node.name ? `${node.name}` : `Переход [${String(node.x + 1).padStart(2, '0')}:${String(node.y + 1).padStart(2, '0')}]`;
    element.title = `${label}\nУгроза: ${node.threat}`;
    element.addEventListener('click', () => attemptMove(node));
    mapOverlay.append(element);
    node.element = element;
  });
}

function updateAvatarPosition(node) {
  if (!mapAvatar) return;
  const { x, y } = gridToPixel(node.x, node.y);
  mapAvatar.style.left = `${x}px`;
  mapAvatar.style.top = `${y}px`;
}

function describeNode(node) {
  if (node.intel) return node.intel;
  if (node.type === 'treasure') {
    return 'Малый зал с сундуками. Враги могут притаиться в тени. Угроза: ' + node.threat;
  }
  if (node.type === 'encounter') {
    return 'Боевой узел лабиринта. Вероятность засады повышена. Угроза: ' + node.threat;
  }
  return 'Переход лабиринта. Потенциальная угроза: ' + node.threat;
}

function updateMapState(node) {
  mapState.current = node;
  updateAvatarPosition(node);

  if (mapLocationElement) {
    mapLocationElement.textContent = node.name || 'Переход лабиринта';
  }

  if (mapCoordsElement) {
    const cx = String(node.x + 1).padStart(2, '0');
    const cy = String(node.y + 1).padStart(2, '0');
    mapCoordsElement.textContent = `[${cx}:${cy}]`;
  }

  if (mapIntel) {
    mapIntel.textContent = describeNode(node);
  }

  mapState.nodes.forEach((entry) => {
    if (!entry.element) return;
    entry.element.classList.toggle('is-current', entry.key === node.key);
    const isNeighbor = node.neighbors.includes(entry.key);
    entry.element.classList.toggle('is-adjacent', isNeighbor);
  });
}

function attemptMove(target) {
  if (!mapState.current) {
    moveToNode(target);
    return;
  }

  if (!mapState.current.neighbors.includes(target.key)) {
    appendCombatLog('Путь заблокирован. Нужно сначала расчистить ближайшие коридоры.');
    return;
  }
  moveToNode(target);
}

function moveToNode(node) {
  const previous = mapState.current;
  updateMapState(node);
  appendCombatLog(`Вы перемещаетесь в узел <strong>${node.name || 'Лабиринта'}</strong>.`);

  if (node.type === 'treasure') {
    grantTreasure(node);
  }

  resolveEncounter(node, previous);
}

function resolveEncounter(node, previous) {
  const shouldSpawn = (() => {
    if (!previous || node.key === previous.key) return false;
    if (node.type === 'stronghold' || node.type === 'encounter') return true;
    return Math.random() < (node.encounterChance || 0.25);
  })();

  if (shouldSpawn) {
    spawnEnemyForThreat(node.threat, node.name);
  } else {
    appendCombatLog('Разведка сообщает: в коридоре тихо, можно двигаться дальше.');
  }
}

const currentEnemy = {
  template: null,
  hp: 0,
  maxHp: 0
};

function selectTemplateForThreat(threat) {
  const sorted = [...enemyTemplates].sort((a, b) => Math.abs(a.level - threat) - Math.abs(b.level - threat));
  const pool = sorted.filter((template) => Math.abs(template.level - threat) <= 4);
  const candidates = pool.length ? pool.slice(0, 3) : sorted.slice(0, 3);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function updateEnemyUI() {
  if (!currentEnemy.template) return;
  const template = currentEnemy.template;
  if (enemyNameElement) enemyNameElement.textContent = template.name;
  if (enemyLevelElement) enemyLevelElement.textContent = String(template.level);
  if (enemyStatusElement) enemyStatusElement.textContent = template.intro;
  if (enemyDamageElement) enemyDamageElement.textContent = `${template.minDamage}-${template.maxDamage}`;
  if (enemyRewardElement) {
    const [goldMin, goldMax] = template.goldReward;
    enemyRewardElement.textContent = `${template.xpReward} XP · ${goldMin}-${goldMax} золота`;
  }
  setProgress('enemy-hp', currentEnemy.hp, currentEnemy.maxHp);
}

function spawnEnemyForThreat(threat, locationName) {
  const template = selectTemplateForThreat(threat);
  currentEnemy.template = template;
  currentEnemy.hp = template.maxHp;
  currentEnemy.maxHp = template.maxHp;
  updateEnemyUI();
  setPlayerTurn(true);
  appendCombatLog(`В локации <strong>${locationName || 'Лабиринт'}</strong> появляется ${template.name}.`);
  if (stanceIndicator) {
    stanceIndicator.textContent = 'Стойка: Бастион';
  }
  playerState.shield = 0;
  playerState.skillBonus = 0;
  playerState.skillRounds = 0;
  if (enemyStatusElement) {
    enemyStatusElement.textContent = template.intro;
  }
}

function setPlayerTurn(isPlayer) {
  if (!turnIndicator) return;
  turnIndicator.textContent = isPlayer ? 'Ваш ход' : 'Ход врага';
  actionButtons.forEach((button) => {
    button.disabled = !isPlayer;
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updatePlayerUI() {
  setProgress('player-hp', playerState.hp, playerState.maxHp);
  setProgress('player-mp', playerState.mp, playerState.maxMp);
  setProgress('player-xp', playerState.xp, playerState.maxXp);
  const strength = document.getElementById('player-strength');
  const agility = document.getElementById('player-agility');
  const defense = document.getElementById('player-defense');
  const gold = document.getElementById('player-gold');

  if (strength) strength.textContent = String(playerState.strength);
  if (agility) agility.textContent = String(playerState.agility);
  if (defense) defense.textContent = String(playerState.defense);
  if (gold) gold.textContent = formatNumber(playerState.gold);

  if (sidebarHpBar) {
    sidebarHpBar.style.width = `${(playerState.hp / playerState.maxHp) * 100}%`;
  }
  if (sidebarMpBar) {
    sidebarMpBar.style.width = `${(playerState.mp / playerState.maxMp) * 100}%`;
  }
}

function grantLoot(template) {
  if (!lootList) return;
  const dropSet = [];
  template.lootTable.forEach((loot) => {
    const guaranteed = loot.guaranteed || Math.random() < loot.chance;
    if (!guaranteed) return;
    const min = loot.quantity[0];
    const max = loot.quantity[1];
    const amount = randomBetween(min, max);
    dropSet.push({
      id: loot.id,
      name: loot.name,
      rarity: loot.rarity,
      quantity: amount,
      icon: loot.icon || '♦'
    });
  });

  if (!dropSet.length) return;

  dropSet.forEach((item) => {
    const entry = document.createElement('li');
    entry.className = 'loot-item';
    entry.dataset.rarity = item.rarity;

    const name = document.createElement('span');
    name.className = 'loot-item__name';
    name.innerHTML = `${item.icon} ${item.name}`;

    const quantity = document.createElement('span');
    quantity.textContent = `×${item.quantity}`;

    entry.append(name, quantity);
    lootList.prepend(entry);
  });

  while (lootList.children.length > 12) {
    lootList.removeChild(lootList.lastChild);
  }
}

function grantTreasure(node) {
  appendCombatLog('Вы обыскиваете зал трофеев и находите сокровища.');
  const treasure = {
    template: {
      lootTable: [
        { id: 'ancient-coin', name: 'Монеты древней чеканки', rarity: 'rare', quantity: [3, 6], chance: 1, guaranteed: true, icon: '🪙' },
        { id: 'lunar-essence', name: 'Лунная эссенция', rarity: 'epic', quantity: [1, 2], chance: 0.45, icon: '🌙' },
        { id: 'ward-sigil', name: 'Печать стража', rarity: 'uncommon', quantity: [1, 3], chance: 0.6, icon: '🛡️' }
      ]
    }
  };
  grantLoot(treasure.template);
  playerState.gold += randomBetween(60, 120);
  updatePlayerUI();
  if (mapIntel) {
    mapIntel.textContent = `${node.name}. Сокровища собраны, но ловушки ещё активны.`;
  }
}

function handleVictory() {
  const template = currentEnemy.template;
  appendCombatLog(`Вы побеждаете ${template.name}.`);
  grantLoot(template);
  playerState.xp = clamp(playerState.xp + template.xpReward, 0, playerState.maxXp);
  const goldGain = randomBetween(template.goldReward[0], template.goldReward[1]);
  playerState.gold += goldGain;
  appendCombatLog(`Получено <strong>${template.xpReward}</strong> опыта и <strong>${goldGain}</strong> золота.`);
  updatePlayerUI();
  setPlayerTurn(false);
  setTimeout(() => {
    setPlayerTurn(true);
    appendCombatLog('Новый противник готовится к атаке.');
    spawnEnemyForThreat(mapState.current ? mapState.current.threat : template.level, mapState.current ? mapState.current.name : undefined);
  }, 1500);
}

function enemyTurn() {
  setPlayerTurn(false);
  setTimeout(() => {
    if (!currentEnemy.template || currentEnemy.hp <= 0) {
      setPlayerTurn(true);
      return;
    }
    const template = currentEnemy.template;
    const damage = randomBetween(template.minDamage, template.maxDamage);
    const mitigated = Math.max(0, damage - playerState.shield);
    playerState.shield = Math.max(0, playerState.shield - damage);
    playerState.hp = clamp(playerState.hp - mitigated, 0, playerState.maxHp);
    appendCombatLog(`Враг атакует и наносит <strong>${mitigated}</strong> урона.`);
    if (playerState.hp <= 0) {
      appendCombatLog('Вы теряете сознание. Похоже, пора отступить.');
      actionButtons.forEach((button) => button.setAttribute('disabled', 'disabled'));
    }
    updatePlayerUI();
    if (playerState.hp > 0) {
      setPlayerTurn(true);
    }
  }, 800);
}

function performAction(action) {
  if (!currentEnemy.template || currentEnemy.hp <= 0) {
    appendCombatLog('Рядом нет активного противника.');
    return;
  }
  const template = currentEnemy.template;

  switch (action) {
    case 'attack': {
      const base = randomBetween(42, 68) + playerState.skillBonus;
      const damage = Math.round(base * (1 + playerState.strength / 120));
      currentEnemy.hp = clamp(currentEnemy.hp - damage, 0, currentEnemy.maxHp);
      const phrase = combatPhrases.attack[Math.floor(Math.random() * combatPhrases.attack.length)].replace('{value}', damage);
      appendCombatLog(phrase);
      if (playerState.skillRounds > 0) {
        playerState.skillRounds -= 1;
        if (playerState.skillRounds === 0) {
          playerState.skillBonus = 0;
          if (stanceIndicator) {
            stanceIndicator.textContent = 'Стойка: Бастион';
          }
        }
      }
      if (currentEnemy.hp <= 0) {
        setProgress('enemy-hp', 0, currentEnemy.maxHp);
        handleVictory();
        return;
      }
      setProgress('enemy-hp', currentEnemy.hp, currentEnemy.maxHp);
      enemyTurn();
      break;
    }
    case 'defend': {
      const shield = Math.round(playerState.defense * 1.5 + Math.random() * 12);
      playerState.shield = shield;
      if (stanceIndicator) {
        stanceIndicator.textContent = 'Стойка: Бастион щита';
      }
      const phrase = combatPhrases.defend[Math.floor(Math.random() * combatPhrases.defend.length)].replace('{value}', shield);
      appendCombatLog(phrase);
      enemyTurn();
      break;
    }
    case 'skill': {
      const bonus = randomBetween(18, 34);
      playerState.skillBonus = bonus;
      playerState.skillRounds = 2;
      if (stanceIndicator) {
        stanceIndicator.textContent = 'Стойка: Клинки крови';
      }
      const phrase = combatPhrases.skill[Math.floor(Math.random() * combatPhrases.skill.length)].replace('{value}', bonus);
      appendCombatLog(phrase);
      enemyTurn();
      break;
    }
    case 'heal': {
      if (playerState.mp < 40) {
        appendCombatLog('Недостаточно маны для эликсира.');
        return;
      }
      playerState.mp = clamp(playerState.mp - 40, 0, playerState.maxMp);
      const heal = randomBetween(110, 150);
      playerState.hp = clamp(playerState.hp + heal, 0, playerState.maxHp);
      appendCombatLog(combatPhrases.heal[Math.floor(Math.random() * combatPhrases.heal.length)].replace('{value}', heal));
      updatePlayerUI();
      enemyTurn();
      break;
    }
    default:
      break;
  }
}

actionButtons.forEach((button) => {
  button.addEventListener('click', () => performAction(button.dataset.action));
});

if (chatForm) {
  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;
    appendChatLog(`<strong>Вы</strong>: ${message}`);
    chatInput.value = '';
  });
}

if (commandButtons.length) {
  commandButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const command = button.dataset.command;
      switch (command) {
        case 'inventory':
          openInventory();
          break;
        case 'map':
          appendChatLog('<strong>Система</strong>: Центр карты уже активен.');
          break;
        case 'quests':
          appendChatLog('<strong>Система</strong>: Квестовая доска обновится в следующем патче.');
          break;
        case 'help':
          appendChatLog('<strong>Система</strong>: /roll — бросок куба, /dance — станцевать победный танец.');
          break;
        default:
          appendChatLog(`<strong>Система</strong>: Раздел «${button.textContent}» пока в разработке.`);
          break;
      }
    });
  });
}

if (inventoryModal) {
  inventoryModal.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target === inventoryModal || event.target.matches('[data-dismiss="inventory"]')) {
      closeInventory();
    }
  });
}

if (inventoryCloseButton) {
  inventoryCloseButton.addEventListener('click', () => closeInventory());
}

if (inventoryActions.length) {
  inventoryActions.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.inventoryAction;
      if (!activeInventorySlot) {
        appendChatLog('<strong>Система</strong>: Сначала выберите предмет.');
        return;
      }
      const itemId = activeInventorySlot.dataset.itemId;
      const item = inventoryState.items.find((entry) => entry.id === itemId);
      if (!item) return;
      const actionText = {
        equip: 'готовится экипировать',
        use: 'готовится использовать',
        drop: 'прикидывает, стоит ли выбросить'
      }[action] ?? 'взаимодействует с';
      appendCombatLog(`Вы ${actionText.toLowerCase()} предмет «${item.name}».`);
    });
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && inventoryModal && !inventoryModal.classList.contains('is-hidden')) {
    closeInventory();
  }
});

if (logTabs.length && logPanels.length) {
  logTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.log;
      logTabs.forEach((other) => {
        const active = other === tab;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-selected', String(active));
      });
      logPanels.forEach((panel) => {
        const active = panel.dataset.log === target;
        panel.classList.toggle('is-active', active);
        panel.setAttribute('aria-hidden', String(!active));
      });
    });
  });
}

if (mapControls.length) {
  mapControls.forEach((button) => {
    button.addEventListener('click', () => {
      if (!mapState.current) return;
      const direction = button.dataset.direction;
      if (direction === 'origin') {
        const origin = mapState.nodes.get('6,4');
        if (origin) moveToNode(origin);
        return;
      }
      const delta = {
        north: [0, -1],
        south: [0, 1],
        west: [-1, 0],
        east: [1, 0]
      }[direction];
      if (!delta) return;
      const nextKey = `${mapState.current.x + delta[0]},${mapState.current.y + delta[1]}`;
      const target = mapState.nodes.get(nextKey);
      if (target) {
        attemptMove(target);
      } else {
        appendCombatLog('Путь в эту сторону закрыт каменной стеной.');
      }
    });
  });
}

function updateServerTime() {
  if (!serverTimeElement) return;
  const now = new Date();
  serverTimeElement.textContent = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

updateServerTime();
setInterval(updateServerTime, 1000);

const resources = {
  essence: 9870,
  crystals: 1240,
  renown: 42600
};

function updateResources() {
  if (essenceCounter) essenceCounter.textContent = formatNumber(resources.essence);
  if (crystalCounter) crystalCounter.textContent = formatNumber(resources.crystals);
  if (renownCounter) renownCounter.textContent = formatNumber(resources.renown);
}

setInterval(() => {
  resources.essence += randomBetween(3, 9);
  resources.crystals += randomBetween(1, 4);
  resources.renown += randomBetween(6, 14);
  updateResources();
}, 5000);

updateResources();

buildLabyrinth();
drawMap();
renderNodes();

const originNode = mapState.nodes.get('6,4') || mapState.nodes.values().next().value;
if (originNode) {
  updateMapState(originNode);
  spawnEnemyForThreat(originNode.threat, originNode.name);
}

appendCombatLog('Добро пожаловать в Blood Legends. Лабиринт ждёт ваших решений.');
appendChatLog('<strong>Система</strong>: Канал связи с отрядом активирован.');

updatePlayerUI();
setPlayerTurn(true);
