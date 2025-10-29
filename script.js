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
const equipmentTableBody = document.getElementById('equipment-table-body');

const gameData = {
  loot: new Map(),
  monsters: [],
  monsterIndex: new Map(),
  locations: [],
  locationIndex: new Map()
};

const dataSources = {
  loot: 'data/loot.json',
  monsters: 'data/monsters.json',
  locations: 'data/locations.json'
};

const fallbackCatalogs = {
  loot: [
    {
      id: 'wolf_pelt',
      name: 'Шкура теневого волка',
      rarity: 'обычный',
      type: 'Материал',
      icon: '🐺',
      description: 'Плотная шкура, пропитанная тенью. Используется для пошива скрытных плащей.',
      properties: {
        'Сопротивление тьме': '+6%',
        'Уклонение': '+3%'
      },
      weight: 1.4,
      dropChance: 0.35
    },
    {
      id: 'moon_shard',
      name: 'Осколок лунного стекла',
      rarity: 'редкий',
      type: 'Катализатор',
      icon: '🌙',
      description: 'Сияющий осколок, усиливающий навыки ночного дозора.',
      properties: {
        'Сила заклинаний': '+12',
        'Крит. шанс': '+4%'
      },
      weight: 0.2,
      dropChance: 0.1
    },
    {
      id: 'ashen_scroll',
      name: 'Пепельный свиток',
      rarity: 'эпический',
      type: 'Свиток',
      icon: '📜',
      description: 'Содержит потускневшие руны. После активации пробуждает пепельного фамильяра.',
      properties: {
        'Призыв фамильяра': 'Пепельный дух',
        'Сила огня': '+16'
      },
      weight: 0.3,
      dropChance: 0.05
    },
    {
      id: 'cursed_relic',
      name: 'Проклятый реликт',
      rarity: 'эпический',
      type: 'Артефакт',
      icon: '🩸',
      description: 'Осколок древнего обелиска, пьющий кровь владельца, но дарующий силу.',
      properties: {
        'Кровавый урон': '+18%',
        'Стоимость умений': '+4 MP'
      },
      weight: 1.1,
      dropChance: 0.22
    },
    {
      id: 'bone_talisman',
      name: 'Талисман костяного легиона',
      rarity: 'необычный',
      type: 'Талисман',
      icon: '☠️',
      description: 'Переплетённые кости легионеров защищают от некротической магии.',
      properties: {
        'Сопротивление некрозу': '+18%',
        'Броня': '+6'
      },
      weight: 0.5,
      dropChance: 0.32
    },
    {
      id: 'rusted_gladius',
      name: 'Ржавый гладиус легионера',
      rarity: 'обычный',
      type: 'Оружие',
      icon: '🗡️',
      description: 'Изношенный, но всё ещё опасный клинок.',
      properties: {
        'Физический урон': '+14',
        'Шанс кровотечения': '+4%'
      },
      weight: 5,
      dropChance: 0.18
    },
    {
      id: 'ember_core',
      name: 'Угольно-пламенное ядро',
      rarity: 'редкий',
      type: 'Сфера',
      icon: '🔥',
      description: 'Остывший осколок сердца элементаля.',
      properties: {
        'Огненный урон': '+22',
        'Сопротивление холоду': '+8%'
      },
      weight: 1.8,
      dropChance: 0.14
    },
    {
      id: 'iron_fang',
      name: 'Железный клык',
      rarity: 'необычный',
      type: 'Материал',
      icon: '🦴',
      description: 'Зазубренный клык элементаля, подходящий для ковки шипованных лат.',
      properties: {
        'Прочность брони': '+12%',
        'Урон при блоке': '+6'
      },
      weight: 0.9,
      dropChance: 0.18
    },
    {
      id: 'blood_vial',
      name: 'Фиал закалённой крови',
      rarity: 'редкий',
      type: 'Расходуемое',
      icon: '🧪',
      description: 'Укрепляет плоть, если выпить с молитвой Сангвинариуса.',
      properties: {
        'Восстановление HP': '180',
        'Вампиризм': '+4%'
      },
      weight: 0.3,
      dropChance: 0.12
    },
    {
      id: 'withered_root',
      name: 'Иссохший корень ведьмы',
      rarity: 'обычный',
      type: 'Компонент',
      icon: '🌿',
      description: 'Зловонный корень, впитывающий энергию болота.',
      properties: {
        'Ядовитый урон': '+10',
        'Сопротивление яду': '+5%'
      },
      weight: 0.6,
      dropChance: 0.4
    }
  ],
  monsters: [
    {
      id: 'shadow_wolf',
      name: 'Теневой волк',
      rank: 'охотник',
      level: 6,
      habitat: 'Сумрачный лес',
      alignment: 'дикарь',
      stats: { hp: 180, attack: 24, defense: 12, speed: 30 },
      abilities: ['Раздирающий укус', 'Затуманивание'],
      loot: [
        { itemId: 'wolf_pelt', chance: 0.35 },
        { itemId: 'moon_shard', chance: 0.1 }
      ]
    },
    {
      id: 'rootbound_hag',
      name: 'Корневая ведьма',
      rank: 'жрица',
      level: 9,
      habitat: 'Болотные зеркала',
      alignment: 'колдунья',
      stats: { hp: 240, attack: 28, defense: 18, speed: 22 },
      abilities: ['Гниющая хватка', 'Ядовитая тина'],
      loot: [
        { itemId: 'withered_root', chance: 0.4 },
        { itemId: 'moon_shard', chance: 0.06 }
      ]
    },
    {
      id: 'skeleton_warrior',
      name: 'Скелет-воин',
      rank: 'нежить',
      level: 13,
      habitat: 'Катакомбы Бездны',
      alignment: 'проклятый легион',
      stats: { hp: 360, attack: 48, defense: 32, speed: 14 },
      abilities: ['Костяной размах', 'Стена щитов'],
      loot: [
        { itemId: 'bone_talisman', chance: 0.32 },
        { itemId: 'rusted_gladius', chance: 0.18, quantityRange: [1, 1] }
      ]
    },
    {
      id: 'blood_sentinel',
      name: 'Кровавый страж',
      rank: 'страж',
      level: 15,
      habitat: 'Бастион Сангвинариев',
      alignment: 'легион',
      stats: { hp: 560, attack: 46, defense: 40, speed: 16 },
      abilities: ['Кара клинком', 'Кровавый щит'],
      loot: [
        { itemId: 'blood_vial', chance: 0.12 },
        { itemId: 'cursed_relic', chance: 0.18 }
      ]
    },
    {
      id: 'ember_colossus',
      name: 'Угольный колосс',
      rank: 'босс',
      level: 18,
      habitat: 'Огненная кузница',
      alignment: 'элементаль',
      stats: { hp: 780, attack: 68, defense: 44, speed: 10 },
      abilities: ['Всполох пламени', 'Обвал лавы'],
      loot: [
        { itemId: 'ember_core', chance: 0.14 },
        { itemId: 'iron_fang', chance: 0.18 }
      ]
    }
  ],
  locations: [
    {
      id: 'gloomwood',
      name: 'Сумрачный лес',
      sector: 'Северные рубежи',
      levelRange: [5, 8],
      type: 'дикие земли',
      threatRating: 2,
      description: 'Туманные чащи и алтарь Лунного ветра скрывают следы волчьих стай.',
      pointsOfInterest: ['Логово теневых волков', 'Разрушенный дозорный пост', 'Алтарь Лунного ветра'],
      encounters: ['shadow_wolf', 'rootbound_hag'],
      travelEvents: [
        { type: 'засада', description: 'Стая волков пытается окружить отряд.', dangerLevel: 3 },
        { type: 'обнаружение', description: 'Следы ведьминского ритуала ведут в чащу.', dangerLevel: 2 }
      ]
    },
    {
      id: 'abyssal_catacombs',
      name: 'Катакомбы Бездны',
      sector: 'Подземный шов',
      levelRange: [10, 14],
      type: 'подземелье',
      threatRating: 4,
      description: 'Тесные коридоры с эхом забытых голосов и костяными караулами.',
      pointsOfInterest: ['Зал забытых королей', 'Провал к бездне', 'Алтарь затмения'],
      encounters: ['skeleton_warrior', 'blood_sentinel'],
      travelEvents: [
        { type: 'голос бездны', description: 'Шёпот обещает силу в обмен на кровь.', dangerLevel: 4 },
        { type: 'коллапс', description: 'Потолок осыпается и перекрывает путь.', dangerLevel: 3 }
      ]
    },
    {
      id: 'ember_forge',
      name: 'Огненная кузница',
      sector: 'Вулканический хребет',
      levelRange: [16, 20],
      type: 'цитадель',
      threatRating: 5,
      description: 'Гул горнов и лавовые реки питают оружейные цеха легиона.',
      pointsOfInterest: ['Зал угольных стражей', 'Жертвенный горн', 'Хранилище жароперстов'],
      encounters: ['ember_colossus', 'blood_sentinel'],
      travelEvents: [
        { type: 'жаркое дыхание', description: 'Поток раскалённого воздуха обжигает броню.', dangerLevel: 4 },
        { type: 'лазутчик', description: 'Шпион предлагает обменять добычу на сведения.', dangerLevel: 2 }
      ]
    },
    {
      id: 'noctus_expanse',
      name: 'Пределы Ноктуса',
      sector: 'Пограничная пустошь',
      levelRange: [20, 24],
      type: 'пустошь',
      threatRating: 5,
      description: 'Багровые вихри и руины титанов скрывают патрули легиона.',
      pointsOfInterest: ['Караульная башня', 'Ритуальный кратер', 'Колыбель титанов'],
      encounters: ['blood_sentinel', 'ember_colossus'],
      travelEvents: [
        { type: 'кровавый шторм', description: 'Алые искры усиливают ярость монстров.', dangerLevel: 5 },
        { type: 'призрачный караван', description: 'Торговцы призраки предлагают сделки.', dangerLevel: 3 }
      ]
    }
  ]
};

const rarityGlyphs = {
  legendary: '✦',
  легендарный: '✦',
  epic: '✧',
  эпический: '✧',
  rare: '◆',
  редкий: '◆',
  uncommon: '⬗',
  необычный: '⬗',
  common: '⬖',
  обычный: '⬖'
};

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

const equipmentSlotsMeta = [
  { id: 'helmet', label: 'Шлем' },
  { id: 'amulet', label: 'Кулон' },
  { id: 'gloves', label: 'Перчатки' },
  { id: 'ring1', label: 'Кольцо I' },
  { id: 'ring2', label: 'Кольцо II' },
  { id: 'weapon', label: 'Оружие' },
  { id: 'belt', label: 'Пояс' },
  { id: 'boots', label: 'Обувь' },
  { id: 'greaves', label: 'Поножи' },
  { id: 'offhand', label: 'Щит / Второе оружие' },
  { id: 'armor', label: 'Броня' },
  { id: 'cloak', label: 'Плащ' }
];

const equipmentState = {
  helmet: {
    id: 'helm-eclipse',
    name: 'Шлем Эйдолона',
    icon: '🪖',
    rarity: 'epic',
    properties: {
      Защита: '+28',
      'Сопротивление тьме': '+15%'
    }
  },
  amulet: {
    id: 'amulet-scarlet',
    name: 'Кулон Алого Сердца',
    icon: '📿',
    rarity: 'legendary',
    properties: {
      'Сила крови': '+20',
      'Регенерация маны': '+6 ед./5 сек'
    }
  },
  gloves: {
    id: 'gloves-warden',
    name: 'Перчатки Дозорного',
    icon: '🧤',
    rarity: 'rare',
    properties: {
      'Скорость атаки': '+8%',
      Точность: '+6'
    }
  },
  ring1: cloneInventoryItem('ring-storm'),
  ring2: {
    id: 'ring-warden',
    name: 'Кольцо Стража',
    icon: '💍',
    rarity: 'rare',
    properties: {
      Защита: '+6',
      'Сопротивление магии': '+10%'
    }
  },
  weapon: cloneInventoryItem('blade-dawn'),
  belt: {
    id: 'belt-ember',
    name: 'Пояс Жаркого ядра',
    icon: '🪢',
    rarity: 'epic',
    properties: {
      'Макс. выносливость': '+30',
      'Сопротивление огню': '+8%'
    }
  },
  boots: {
    id: 'boots-shadow',
    name: 'Сапоги Теневого шага',
    icon: '🥾',
    rarity: 'epic',
    properties: {
      'Скорость перемещения': '+12%',
      'Беззвучный шаг': '+10%'
    }
  },
  greaves: {
    id: 'greaves-bastion',
    name: 'Поножи Бастиона',
    icon: '🦿',
    rarity: 'rare',
    properties: {
      Броня: '+18',
      Стойкость: '+6'
    }
  },
  offhand: cloneInventoryItem('shield-obsidian'),
  armor: {
    id: 'armor-bloodguard',
    name: 'Кираса Кровавой Стражи',
    icon: '🛡️',
    rarity: 'legendary',
    properties: {
      Броня: '+46',
      'Поглощение урона': '+12%'
    }
  },
  cloak: {
    id: 'cloak-veil',
    name: 'Плащ Багрового Покрова',
    icon: '🧥',
    rarity: 'epic',
    properties: {
      Скрытность: '+15%',
      'Сопротивление мраку': '+12%'
    }
  }
};

let activeInventorySlot = null;

function cloneInventoryItem(itemId) {
  const item = inventoryState.items.find((entry) => entry.id === itemId);
  if (!item) return null;
  return {
    id: item.id,
    name: item.name,
    icon: item.icon,
    rarity: item.rarity,
    properties: { ...item.stats },
    description: item.description ?? ''
  };
}

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

function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Не удалось загрузить ${path}: ${response.status}`);
  }
  return response.json();
}

function enrichLootEntry(raw) {
  const rarityKey = raw.rarity?.toLowerCase();
  const icon = raw.icon || rarityGlyphs[rarityKey] || '♦';
  return {
    ...raw,
    icon,
    properties: raw.properties ?? {}
  };
}

function mergeQuantityRange(entry) {
  if (!entry) return [1, 1];
  if (Array.isArray(entry.quantityRange)) return entry.quantityRange;
  if (typeof entry.min === 'number' && typeof entry.max === 'number') {
    return [entry.min, entry.max];
  }
  if (typeof entry.quantity === 'number') {
    return [entry.quantity, entry.quantity];
  }
  return [1, 1];
}

function describeMonsterIntro(monster) {
  const rank = monster.rank ? capitalize(monster.rank) : 'Существо';
  const habitat = monster.habitat ? `из локации ${monster.habitat}` : 'лабиринта';
  const ability = monster.abilities?.length ? `Использует приёмы: ${monster.abilities.join(', ')}.` : 'Готов к атаке.';
  return `${rank} ${habitat}. ${ability}`;
}

function transformMonster(rawMonster) {
  const stats = rawMonster.stats ?? {};
  const hp = stats.hp ?? 240;
  const attack = stats.attack ?? 32;
  const defense = stats.defense ?? 18;
  const speed = stats.speed ?? 12;
  const level = rawMonster.level ?? Math.max(1, Math.round((hp + attack + defense) / 40));
  const xpReward = Math.round(60 + level * 18 + defense * 1.6 + speed * 1.2);
  const goldBase = Math.round(45 + level * 6 + defense * 1.4);
  const goldReward = [goldBase, Math.round(goldBase + level * 4 + hp / 10)];

  const lootTable = (rawMonster.loot ?? []).map((entry) => {
    const lootDef = gameData.loot.get(entry.itemId);
    const rarityKey = lootDef?.rarity?.toLowerCase();
    return {
      id: entry.itemId,
      name: lootDef?.name ?? entry.itemId,
      rarity: lootDef?.rarity ?? 'обычный',
      chance: entry.chance ?? lootDef?.dropChance ?? 0,
      quantityRange: mergeQuantityRange(entry),
      icon: lootDef?.icon ?? rarityGlyphs[rarityKey] ?? '♦',
      properties: lootDef?.properties ?? null,
      description: lootDef?.description ?? ''
    };
  });

  return {
    id: rawMonster.id,
    name: rawMonster.name,
    level,
    maxHp: hp,
    minDamage: Math.max(6, Math.round(attack * 0.65)),
    maxDamage: Math.max(10, Math.round(attack * 1.12)),
    xpReward,
    goldReward,
    intro: describeMonsterIntro(rawMonster),
    lootTable,
    alignment: rawMonster.alignment,
    habitat: rawMonster.habitat,
    abilities: rawMonster.abilities ?? [],
    rank: rawMonster.rank ?? 'противник',
    base: rawMonster
  };
}

function ingestCatalogs({ loot = [], monsters = [], locations = [] }) {
  gameData.loot.clear();
  loot.forEach((entry) => {
    const enriched = enrichLootEntry(entry);
    gameData.loot.set(enriched.id, enriched);
  });

  gameData.monsterIndex.clear();
  gameData.monsters = monsters.map((monster) => {
    const template = transformMonster(monster);
    gameData.monsterIndex.set(template.id, template);
    return template;
  });

  registerLocations(locations);
}

function registerLocations(locations) {
  gameData.locations = locations;
  gameData.locationIndex.clear();
  locations.forEach((location) => {
    gameData.locationIndex.set(location.id, location);
  });
}

async function loadGameData() {
  const [lootData, monsterData, locationData] = await Promise.all([
    fetchJson(dataSources.loot),
    fetchJson(dataSources.monsters),
    fetchJson(dataSources.locations)
  ]);
  ingestCatalogs({ loot: lootData, monsters: monsterData, locations: locationData });
}

function loadFallbackData() {
  ingestCatalogs(fallbackCatalogs);
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

function findEquipmentSlotByItem(itemId) {
  return (
    Object.entries(equipmentState).find(([, entry]) => {
      if (!entry) return false;
      if (typeof entry === 'string') {
        return entry === itemId;
      }
      return entry.id === itemId;
    })?.[0] ?? null
  );
}

function isItemEquipped(itemId) {
  return Boolean(findEquipmentSlotByItem(itemId));
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
  const stats = item.stats ?? item.properties ?? {};
  Object.entries(stats).forEach(([key, value]) => {
    const term = document.createElement('dt');
    term.textContent = key;
    const def = document.createElement('dd');
    def.textContent = value;
    inventoryItemStats.append(term, def);
  });
}

function renderInventory(selectedItemId = activeInventorySlot?.dataset.itemId ?? null) {
  if (!inventoryGrid) return;
  inventoryGrid.replaceChildren();
  activeInventorySlot = null;
  let selectedItem = null;
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
    if (isItemEquipped(item.id)) {
      slot.classList.add('is-equipped');
    }
    slot.addEventListener('click', () => {
      clearInventorySelection();
      activeInventorySlot = slot;
      slot.classList.add('is-active');
      renderInventoryDetails(item);
    });
    inventoryGrid.append(slot);
    if (item.id === selectedItemId) {
      slot.classList.add('is-active');
      activeInventorySlot = slot;
      selectedItem = item;
    }
  });

  if (activeInventorySlot && selectedItem) {
    renderInventoryDetails(selectedItem);
  } else if (!activeInventorySlot && inventoryGrid.firstElementChild instanceof HTMLElement) {
    inventoryGrid.firstElementChild.click();
  } else if (!inventoryState.items.length) {
    renderInventoryDetails(null);
  }
}

function formatPropertiesTooltip(entry) {
  const lines = [];
  if (entry.description) {
    lines.push(entry.description);
  }
  const props = entry.properties ?? entry.stats ?? {};
  const propLines = Object.entries(props).map(([key, value]) => `${key}: ${value}`);
  if (propLines.length) {
    if (lines.length) {
      lines.push('');
    }
    lines.push(...propLines);
  }
  return lines.join('\n');
}

function getEquipmentDescriptor(entry) {
  if (!entry) return null;
  if (typeof entry === 'string') {
    const fromInventory = cloneInventoryItem(entry);
    if (fromInventory) return fromInventory;
    const lootDef = gameData.loot.get(entry);
    if (lootDef) {
      return {
        id: lootDef.id,
        name: lootDef.name,
        icon: lootDef.icon ?? rarityGlyphs[lootDef.rarity?.toLowerCase() ?? 'common'] ?? '⬖',
        rarity: lootDef.rarity,
        properties: lootDef.properties ?? {},
        description: lootDef.description ?? ''
      };
    }
    return null;
  }
  if (entry.properties || entry.stats) {
    return {
      id: entry.id,
      name: entry.name,
      icon: entry.icon ?? rarityGlyphs[entry.rarity?.toLowerCase() ?? 'common'] ?? '⬖',
      rarity: entry.rarity,
      properties: entry.properties ?? entry.stats ?? {},
      description: entry.description ?? ''
    };
  }
  return entry;
}

function renderEquipmentTable() {
  if (!equipmentTableBody) return;
  equipmentTableBody.replaceChildren();
  equipmentSlotsMeta.forEach((slot) => {
    const row = document.createElement('tr');
    row.dataset.slot = slot.id;

    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.textContent = slot.label;

    const cell = document.createElement('td');
    const descriptor = getEquipmentDescriptor(equipmentState[slot.id]);
    if (descriptor) {
      const item = document.createElement('div');
      item.className = 'equipment-item';
      item.dataset.rarity = (descriptor.rarity ?? 'common').toLowerCase();
      item.title = formatPropertiesTooltip(descriptor);

      const icon = document.createElement('span');
      icon.className = 'equipment-item__icon';
      icon.textContent = descriptor.icon ?? rarityGlyphs[(descriptor.rarity ?? 'common').toLowerCase()] ?? '⬖';

      const label = document.createElement('span');
      label.textContent = descriptor.name;

      item.append(icon, label);
      cell.append(item);
    } else {
      cell.textContent = '—';
      cell.classList.add('equipment-slot-empty');
    }

    row.append(heading, cell);
    equipmentTableBody.append(row);
  });
}

renderEquipmentTable();

function getEquipmentSlotsForItem(item) {
  const mapping = {
    'Двуручный меч': ['weapon'],
    'Щит': ['offhand'],
    'Украшение': ['ring1', 'ring2'],
    'Реликт': ['amulet', 'belt'],
    'Катализатор': ['amulet'],
    'Доспех': ['armor'],
    'Броня': ['armor'],
    'Оружие': ['weapon']
  };
  const key = item.type;
  const slots = mapping[key];
  if (!slots) {
    return [];
  }
  return Array.isArray(slots) ? slots : [slots];
}

function equipItem(item) {
  const alreadyEquipped = findEquipmentSlotByItem(item.id);
  if (alreadyEquipped) {
    return { success: false, reason: 'already', slot: alreadyEquipped };
  }

  const slots = getEquipmentSlotsForItem(item);
  if (!slots.length) {
    return { success: false, reason: 'incompatible' };
  }

  const targetSlot = slots.find((slot) => !equipmentState[slot]) ?? slots[0];

  equipmentState[targetSlot] = {
    id: item.id,
    name: item.name,
    icon: item.icon,
    rarity: item.rarity,
    properties: { ...(item.stats ?? item.properties ?? {}) },
    description: item.description ?? ''
  };

  if (item.type === 'Двуручный меч' && targetSlot === 'weapon') {
    equipmentState.offhand = null;
  }

  return { success: true, slot: targetSlot };
}

function openInventory() {
  if (!inventoryModal) return;
  inventoryModal.classList.remove('is-hidden');
  inventoryModal.setAttribute('aria-hidden', 'false');
  syncInventoryResources();
  updateInventoryWeight();
  renderInventory();
  renderEquipmentTable();
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
  mapState.nodes.clear();

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

  const locationBindings = [
    {
      id: 'gloomwood',
      nodes: [
        [6, 1],
        [6, 2],
        [6, 3],
        [5, 3],
        [7, 3]
      ],
      anchor: '6,1'
    },
    {
      id: 'abyssal_catacombs',
      nodes: [
        [5, 5],
        [4, 5],
        [3, 5],
        [2, 5],
        [3, 6],
        [3, 7],
        [3, 8]
      ],
      anchor: '3,6'
    },
    {
      id: 'ember_forge',
      nodes: [
        [8, 4],
        [9, 4],
        [10, 4],
        [11, 4],
        [9, 5],
        [9, 6],
        [9, 7],
        [8, 6],
        [8, 7],
        [8, 8]
      ],
      anchor: '9,5'
    },
    {
      id: 'noctus_expanse',
      nodes: [
        [6, 6],
        [6, 7],
        [5, 6],
        [5, 7],
        [4, 7],
        [8, 7]
      ],
      anchor: '6,7'
    }
  ];

  locationBindings.forEach((binding) => {
    const location = gameData.locationIndex.get(binding.id);
    if (!location) return;
    const [minLevel, maxLevel] = location.levelRange ?? [1, 1];
    const baseThreat = Math.round((minLevel + maxLevel) / 2 + (location.threatRating ?? 0) * 2);
    const encounterChance = Math.min(0.9, 0.24 + (location.threatRating ?? 1) * 0.1);
    binding.nodes.forEach(([x, y]) => {
      const node = ensureNode(x, y);
      const key = `${x},${y}`;
      node.locationId = binding.id;
      node.sector = location.sector;
      node.levelRange = location.levelRange;
      node.threat = baseThreat;
      node.encounterChance = encounterChance;
      const index = binding.nodes.findIndex(([nx, ny]) => nx === x && ny === y);
      const poi = location.pointsOfInterest?.[index % (location.pointsOfInterest.length || 1)] ?? null;
      const travelEvent = location.travelEvents?.[index % (location.travelEvents.length || 1)] ?? null;
      node.type = key === binding.anchor ? 'stronghold' : node.type === 'treasure' ? 'treasure' : 'encounter';
      const intelParts = [location.description];
      if (poi) intelParts.push(`Точка интереса: ${poi}.`);
      if (travelEvent?.description) intelParts.push(`Событие: ${travelEvent.description}`);
      node.intel = intelParts.join(' ');
      node.name = key === binding.anchor ? location.name : `${location.name} · ${poi ?? 'Коридор'}`;
    });
  });

  const citadel = ensureNode(6, 4);
  citadel.type = 'stronghold';
  citadel.name = 'Цитадель Алого Сумрака';
  citadel.intel = 'Центральный командный пост. Здесь планируются рейды и собираются отчёты разведки.';
  citadel.threat = 14;
  citadel.levelRange = [12, 14];
  citadel.encounterChance = 0.55;

  const forwardBase = ensureNode(6, 5);
  if (!forwardBase.locationId) {
    forwardBase.type = 'encounter';
    forwardBase.name = 'Плац нижнего яруса';
    forwardBase.intel = 'Соединительный плац между цитаделью и внешними секторами. Гарнизон предупреждает о частых засадах.';
    forwardBase.threat = 13;
    forwardBase.levelRange = [11, 13];
    forwardBase.encounterChance = 0.48;
  }

  const treasure = mapState.nodes.get('3,8');
  if (treasure) {
    treasure.type = 'treasure';
    treasure.name = treasure.name ?? 'Зал трофеев';
    treasure.intel = 'Древние сундуки под охраной ловушек. Здесь можно найти редкие эссенции и чертежи.';
    treasure.encounterChance = 0.35;
  }

  mapState.nodes.forEach((node) => {
    if (!node.levelRange) {
      node.levelRange = [10, 12];
    }
    if (!node.threat) {
      node.threat = Math.round((node.levelRange[0] + node.levelRange[1]) / 2);
    }
    if (!node.encounterChance) {
      node.encounterChance = 0.28;
    }
    if (!node.name) {
      node.name = `Переход лабиринта [${String(node.x + 1).padStart(2, '0')}:${String(node.y + 1).padStart(2, '0')}]`;
    }
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
    if (node.locationId) {
      element.dataset.location = node.locationId;
    }
    const { x, y } = gridToPixel(node.x, node.y);
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    const location = node.locationId ? gameData.locationIndex.get(node.locationId) : null;
    const label = node.name ? `${node.name}` : location ? location.name : `Переход [${String(node.x + 1).padStart(2, '0')}:${String(node.y + 1).padStart(2, '0')}]`;
    const details = [label];
    if (location?.sector) {
      details.push(`Сектор: ${location.sector}`);
    }
    details.push(`Угроза: ${node.threat}`);
    element.title = details.join('\n');
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
  if (node.locationId) {
    const location = gameData.locationIndex.get(node.locationId);
    if (location) {
      return `${location.name}. Угроза: ${node.threat}. Диапазон уровней: ${location.levelRange?.join('–') ?? 'неизвестно'}.`;
    }
  }
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
    spawnEnemyForThreat(node.threat, node.name, node.locationId);
  } else {
    appendCombatLog('Разведка сообщает: в коридоре тихо, можно двигаться дальше.');
  }
}

const currentEnemy = {
  template: null,
  hp: 0,
  maxHp: 0
};

function selectTemplateForThreat(threat, locationId) {
  const pool = gameData.monsters.length ? [...gameData.monsters] : [];
  if (!pool.length) return null;
  let candidates = pool;
  if (locationId) {
    const location = gameData.locationIndex.get(locationId);
    if (location?.encounters?.length) {
      const allowed = new Set(location.encounters);
      const filtered = pool.filter((monster) => allowed.has(monster.id));
      if (filtered.length) {
        candidates = filtered;
      }
    }
  }
  const targetLevel = threat ?? 10;
  candidates.sort((a, b) => Math.abs(a.level - targetLevel) - Math.abs(b.level - targetLevel));
  const closeMatches = candidates.filter((monster) => Math.abs(monster.level - targetLevel) <= 4);
  const selection = closeMatches.length ? closeMatches : candidates;
  return selection[Math.floor(Math.random() * selection.length)] ?? candidates[0];
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

function spawnEnemyForThreat(threat, locationName, locationId) {
  const template = selectTemplateForThreat(threat, locationId);
  if (!template) {
    appendCombatLog('Данные о противниках отсутствуют. Разведка будет обновлена позже.');
    return;
  }
  currentEnemy.template = template;
  currentEnemy.hp = template.maxHp;
  currentEnemy.maxHp = template.maxHp;
  updateEnemyUI();
  setPlayerTurn(true);
  const sector = locationId ? gameData.locationIndex.get(locationId)?.sector : null;
  const introLocation = locationName || 'Лабиринт';
  const sectorSuffix = sector ? ` (${sector})` : '';
  appendCombatLog(`В локации <strong>${introLocation}${sectorSuffix}</strong> появляется ${template.name}.`);
  if (stanceIndicator) {
    stanceIndicator.textContent = 'Стойка: Бастион';
  }
  playerState.shield = 0;
  playerState.skillBonus = 0;
  playerState.skillRounds = 0;
  if (enemyStatusElement) {
    const abilityNote = template.abilities?.length ? ` Приёмы: ${template.abilities.join(', ')}.` : '';
    enemyStatusElement.textContent = `${template.intro}${abilityNote}`;
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
    const chance = loot.chance ?? 0;
    const guaranteed = loot.guaranteed || Math.random() < chance;
    if (!guaranteed) return;
    const range = loot.quantityRange ?? [1, 1];
    const min = range[0];
    const max = range[1] ?? range[0];
    const amount = randomBetween(min, max);
    dropSet.push({
      id: loot.id,
      name: loot.name,
      rarity: loot.rarity,
      quantity: amount,
      icon: loot.icon || rarityGlyphs[loot.rarity?.toLowerCase() ?? 'common'] || '♦',
      description: loot.description ?? '',
      properties: loot.properties ?? null
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
    if (item.properties) {
      entry.title = formatPropertiesTooltip(item);
    } else if (item.description) {
      entry.title = item.description;
    }
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
    const currentNode = mapState.current;
    spawnEnemyForThreat(currentNode ? currentNode.threat : template.level, currentNode ? currentNode.name : undefined, currentNode?.locationId);
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
      if (action === 'equip') {
        const result = equipItem(item);
        if (result.success) {
          const slotLabel = equipmentSlotsMeta.find((meta) => meta.id === result.slot)?.label ?? result.slot;
          renderEquipmentTable();
          renderInventory(item.id);
          appendCombatLog(`Вы экипируете «${item.name}» в слот <strong>${slotLabel}</strong>.`);
        } else if (result.reason === 'already') {
          const slotLabel = equipmentSlotsMeta.find((meta) => meta.id === result.slot)?.label ?? result.slot;
          appendCombatLog(`«${item.name}» уже экипирован в слоте <strong>${slotLabel}</strong>.`);
        } else {
          appendCombatLog(`«${item.name}» не подходит для экипировки.`);
        }
        return;
      }
      const actionText = {
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

async function initializeGame() {
  let usedFallback = false;
  try {
    await loadGameData();
  } catch (error) {
    console.error(error);
    loadFallbackData();
    usedFallback = true;
  }

  renderEquipmentTable();
  buildLabyrinth();
  drawMap();
  renderNodes();

  const originNode = mapState.nodes.get('6,4') || mapState.nodes.values().next().value;
  if (originNode) {
    updateMapState(originNode);
    spawnEnemyForThreat(originNode.threat, originNode.name, originNode.locationId);
  } else if (enemyStatusElement) {
    enemyStatusElement.textContent = 'Разведка не обнаружила подходящих координат. Проверьте карту.';
  }

  appendCombatLog('Добро пожаловать в Blood Legends. Лабиринт ждёт ваших решений.');
  appendChatLog('<strong>Система</strong>: Канал связи с отрядом активирован.');

  if (usedFallback) {
    appendCombatLog('Игровые каталоги не удалось загрузить, используется встроенный набор данных. Запустите локальный сервер для работы с JSON.');
    appendChatLog('<strong>Система</strong>: Активированы встроенные каталоги. Для редактирования файлов используйте запуск через локальный сервер.');
  }

  updatePlayerUI();
  setPlayerTurn(true);
}

initializeGame();
