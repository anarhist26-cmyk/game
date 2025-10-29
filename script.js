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

const codexModal = document.getElementById('codex-modal');
const codexCloseButton = document.getElementById('codex-close');
const codexTabs = document.querySelectorAll('.codex-tab');
const codexListElement = document.getElementById('codex-list');
const codexEntryName = document.getElementById('codex-entry-name');
const codexEntryMeta = document.getElementById('codex-entry-meta');
const codexEntryDescription = document.getElementById('codex-entry-description');
const codexEntryStats = document.getElementById('codex-entry-stats');
const codexEntryExtra = document.getElementById('codex-entry-extra');

const questsModal = document.getElementById('quests-modal');
const questsCloseButton = document.getElementById('quests-close');
const questFilterButtons = document.querySelectorAll('[data-quest-filter]');
const questsListElement = document.getElementById('quests-list');
const questsEntryName = document.getElementById('quests-entry-name');
const questsEntryMeta = document.getElementById('quests-entry-meta');
const questsEntryStatus = document.getElementById('quests-entry-status');
const questsEntryDescription = document.getElementById('quests-entry-description');
const questsObjectivesList = document.getElementById('quests-objectives');
const questsRewardsList = document.getElementById('quests-rewards');
const questTrackButton = document.getElementById('quest-track-button');

const skillsModal = document.getElementById('skills-modal');
const skillsCloseButton = document.getElementById('skills-close');
const skillsTreeElement = document.getElementById('skills-tree');
const skillPointsAvailableElement = document.getElementById('skill-points-available');
const skillPointsSpentElement = document.getElementById('skill-points-spent');
const skillDetailName = document.getElementById('skill-detail-name');
const skillDetailCost = document.getElementById('skill-detail-cost');
const skillDetailDescription = document.getElementById('skill-detail-description');
const skillDetailEffects = document.getElementById('skill-detail-effects');
const skillDetailRequirements = document.getElementById('skill-detail-requirements');
const skillActionButtons = document.querySelectorAll('[data-skill-action]');

const raceModal = document.getElementById('race-modal');
const raceCloseButton = document.getElementById('race-close');
const raceListElement = document.getElementById('race-list');
const raceDetailName = document.getElementById('race-detail-name');
const raceDetailOrigin = document.getElementById('race-detail-origin');
const raceDetailDescription = document.getElementById('race-detail-description');
const raceDetailTraits = document.getElementById('race-detail-traits');
const raceDetailSkills = document.getElementById('race-detail-skills');
const raceConfirmButton = document.getElementById('race-confirm');

const gameData = {
  loot: new Map(),
  monsters: [],
  monsterIndex: new Map(),
  locations: [],
  locationIndex: new Map(),
  quests: [],
  questIndex: new Map(),
  skills: [],
  allSkills: [],
  skillIndex: new Map(),
  races: [],
  raceIndex: new Map()
};

const codexState = {
  category: 'monsters',
  selectionId: null
};

const questBoardState = {
  filter: 'active',
  selectionId: null,
  trackedId: null
};

const skillsState = {
  totalPoints: 8,
  selectionId: null,
  learned: new Set()
};

const raceState = {
  highlightedId: null
};

const raceStorageKey = 'blood_legends_race';
const storedRacePreference = safeGetStorageItem(raceStorageKey);

const questStatusLabels = {
  active: 'Активно',
  available: 'Доступно',
  completed: 'Завершено',
  failed: 'Провалено'
};

const dataSources = {
  loot: 'data/loot.json',
  monsters: 'data/monsters.json',
  locations: 'data/locations.json',
  quests: 'data/quests.json',
  races: 'data/races.json',
  skills: 'data/skills.json'
};

const fallbackCatalogs = {
  races: [
    {
      id: 'bloodborn',
      name: 'Алые наследники',
      icon: '🩸',
      description: 'Наследники алого легиона, укрепившие свою силу в ритуалах крови и защите цитаделей.',
      origin: 'Цитадель Алого Сумрака',
      traits: [
        'Прирост силы и максимального здоровья',
        'Мастерство кровавых клинков и защитных барьеров',
        'Лояльность ордену Багрового бастиона'
      ]
    },
    {
      id: 'veilborn',
      name: 'Сумеречные лисы',
      icon: '🌒',
      description: 'Кланы ночных охотников, скользящих по теням и управляющих страхом своих врагов.',
      origin: 'Гроты Ноктуса',
      traits: [
        'Повышенная ловкость и скорость',
        'Снижение шанса засад и ловушек',
        'Специализация на скрытности и проклятых клинках'
      ]
    },
    {
      id: 'emberforged',
      name: 'Пепельно-кованые',
      icon: '🔥',
      description: 'Гильдии кузнецов из Угольных Кузниц, несущие пламя и тяжёлые доспехи на поле боя.',
      origin: 'Гарнизон Угольной Кузницы',
      traits: [
        'Повышенная защита и устойчивость',
        'Усиленные кровавые бастионы и тяжелое оружие',
        'Пламенные клятвы и дисциплина легионов'
      ]
    },
    {
      id: 'stormbound',
      name: 'Штормовые кочевники',
      icon: '⚡',
      description: 'Странники грозового плато, обученные маневренным боям и внезапным ударам.',
      origin: 'Плато Грозового дозора',
      traits: [
        'Сбалансированные показатели силы и защиты',
        'Устойчивость к кровотечению и оглушению',
        'Комбинируют разведку с фронтальными атаками'
      ]
    }
  ],
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
  ],
  quests: [
    {
      id: 'shadow_watch',
      name: 'Тени над дозором',
      type: 'охота',
      status: 'active',
      giver: 'Капитан дозора Элиан',
      recommendedLevel: 7,
      locationId: 'gloomwood',
      summary: 'Расследуйте исчезновение патрулей в туманных тропах Сумрачного леса.',
      description: 'Элиан просит зачистить тропы от теневых волков и собрать образцы шкур для алхимиков.',
      objectives: [
        { id: 'recon_post', type: 'investigate', description: 'Осмотреть разрушенный дозорный пост', locationId: 'gloomwood', required: 1, progress: 1 },
        { id: 'wolf_pack', type: 'hunt', targetId: 'shadow_wolf', required: 6, progress: 3 },
        { id: 'wolf_samples', type: 'collect', targetId: 'wolf_pelt', required: 3, progress: 1 }
      ],
      rewards: {
        xp: 780,
        gold: 220,
        reputation: { faction: 'Дозор Сумрака', amount: 45 },
        loot: [
          { itemId: 'moon_shard', quantity: 1, chance: 1 },
          { itemId: 'blood_vial', quantity: 1, chance: 0.25 }
        ]
      },
      tags: ['сюжет', 'патруль'],
      urgency: 'средняя'
    },
    {
      id: 'catacomb_echoes',
      name: 'Эхо катакомб',
      type: 'разведка',
      status: 'available',
      giver: 'Архивариус Лисандр',
      recommendedLevel: 12,
      locationId: 'abyssal_catacombs',
      summary: 'Соберите хроники из зала забытых королей и подавите костяных стражей.',
      description: 'Лисандру нужны записи и костяные талисманы, чтобы закрыть порталы некрополя.',
      objectives: [
        { id: 'royal_hall', type: 'explore', description: 'Добраться до Зала забытых королей', locationId: 'abyssal_catacombs', required: 1, progress: 0 },
        { id: 'legionnaires', type: 'hunt', targetId: 'skeleton_warrior', required: 4, progress: 0 },
        { id: 'talismans', type: 'collect', targetId: 'bone_talisman', required: 2, progress: 0 }
      ],
      rewards: {
        xp: 1220,
        gold: 360,
        loot: [
          { itemId: 'ashen_scroll', quantity: 1, chance: 0.18 },
          { itemId: 'cursed_relic', quantity: 1, chance: 0.12 }
        ]
      },
      tags: ['подземелье', 'архив']
    },
    {
      id: 'ember_heart',
      name: 'Сердце кузницы',
      type: 'подвиг',
      status: 'completed',
      giver: 'Лорд-командор Каэлин',
      recommendedLevel: 18,
      locationId: 'ember_forge',
      summary: 'Сопроводите караван через Огненную кузницу и повергните угольного колосса.',
      description: 'Караван доставил реликвии, а колосс был низвергнут в лаву — поставки легиона сорваны.',
      objectives: [
        { id: 'escort', type: 'escort', description: 'Сопроводить караван через зал угольных стражей', locationId: 'ember_forge', required: 1, progress: 1 },
        { id: 'colossus', type: 'defeat', targetId: 'ember_colossus', required: 1, progress: 1 }
      ],
      rewards: {
        xp: 1840,
        gold: 540,
        loot: [
          { itemId: 'ember_core', quantity: 1, chance: 1 },
          { itemId: 'iron_fang', quantity: 1, chance: 0.5 }
        ]
      },
      tags: ['легендарный', 'история'],
      urgency: 'низкая'
    }
  ],
  skills: [
    {
      id: 'shadow_step',
      name: 'Шаг тени',
      tier: 1,
      column: 1,
      cost: 1,
      icon: '🦊',
      category: 'Тактика',
      description: 'Вы учитесь растворяться в сумерках и проскальзывать мимо засады.',
      effects: {
        'Шанс уклонения': '+5%',
        'Скорость перемещения': '+10%'
      },
      bonuses: {
        agility: 4
      },
      races: ['veilborn', 'stormbound']
    },
    {
      id: 'blood_edge',
      name: 'Клинок крови',
      tier: 1,
      column: 2,
      cost: 1,
      icon: '🗡️',
      category: 'Атака',
      description: 'Концентрируете ярость, пропитывая клинок кровавой энергией.',
      effects: {
        'Физический урон': '+6%',
        'Критический шанс': '+3%'
      },
      bonuses: {
        strength: 3
      },
      races: ['bloodborn', 'veilborn', 'emberforged']
    },
    {
      id: 'scarlet_resolve',
      name: 'Алое стояние',
      tier: 1,
      column: 3,
      cost: 1,
      icon: '🛡️',
      category: 'Защита',
      description: 'Закаляет вашу плоть и волю, усиливая кровавые барьеры.',
      effects: {
        'Броня': '+8',
        'Сопротивление кровотечению': '+12%'
      },
      bonuses: {
        defense: 4,
        maxHp: 40
      },
      races: ['bloodborn', 'emberforged', 'stormbound']
    },
    {
      id: 'veil_of_ashes',
      name: 'Пепельный покров',
      tier: 2,
      column: 1,
      cost: 2,
      icon: '🜂',
      category: 'Тактика',
      description: 'Пепельные вихри окутывают след героя, скрывая его от врагов.',
      prerequisites: ['shadow_step'],
      effects: {
        'Видимость на карте': '-1 сектор врагам',
        'Шанс засад': '-20%'
      },
      bonuses: {
        agility: 2,
        defense: 2
      },
      races: ['veilborn', 'stormbound']
    },
    {
      id: 'siphon_strike',
      name: 'Кровавый сифон',
      tier: 2,
      column: 2,
      cost: 2,
      icon: '🩸',
      category: 'Атака',
      description: 'Каждый удар вытягивает жизненную силу противника и укрепляет вас.',
      prerequisites: ['blood_edge'],
      effects: {
        'Кража здоровья': '4% от нанесённого урона',
        'Шанс ослабления врага': '15%'
      },
      bonuses: {
        strength: 2,
        maxHp: 30
      },
      races: ['bloodborn', 'veilborn', 'emberforged']
    },
    {
      id: 'blood_barrier',
      name: 'Багровый бастион',
      tier: 2,
      column: 3,
      cost: 2,
      icon: '🛞',
      category: 'Защита',
      description: 'Создаёт пульсирующий щит, впитывающий кровавые удары.',
      prerequisites: ['scarlet_resolve'],
      effects: {
        'Поглощение урона': '+12%',
        'Щит в начале боя': '+60'
      },
      bonuses: {
        defense: 5,
        maxHp: 50
      },
      races: ['bloodborn', 'emberforged', 'stormbound']
    },
    {
      id: 'nightmare_blade',
      name: 'Клинок кошмаров',
      tier: 3,
      column: 2,
      cost: 3,
      icon: '⚔️',
      category: 'Атака',
      description: 'Вы высвобождаете призрачные клинки, рвущие разум врагов.',
      prerequisites: ['siphon_strike'],
      effects: {
        'Пробивание брони': '+18%',
        'Шанс страха': '10% на 1 ход'
      },
      bonuses: {
        strength: 4,
        agility: 2
      },
      races: ['bloodborn', 'veilborn', 'emberforged']
    },
    {
      id: 'crimson_vanguard',
      name: 'Алый авангард',
      tier: 3,
      column: 3,
      cost: 3,
      icon: '🛡️',
      category: 'Защита',
      description: 'Легендарная стойка легиона, усиливающая весь отряд.',
      prerequisites: ['blood_barrier'],
      effects: {
        'Броня союзников': '+12%',
        'Сопротивление магии': '+10%'
      },
      bonuses: {
        defense: 6,
        maxHp: 60
      },
      races: ['bloodborn', 'emberforged', 'stormbound']
    },
    {
      id: 'spectral_command',
      name: 'Призрачный приказ',
      tier: 3,
      column: 1,
      cost: 3,
      icon: '👁️',
      category: 'Тактика',
      description: 'Связывает вас с призрачным авангардом, открывая разведданные.',
      prerequisites: ['veil_of_ashes'],
      effects: {
        'Разведка на карте': '+1 сектор',
        'Вероятность засады': '-30%'
      },
      bonuses: {
        agility: 2,
        defense: 3
      },
      races: ['veilborn', 'stormbound']
    },
    {
      id: 'avatar_of_legends',
      name: 'Аватар легенд',
      tier: 4,
      column: 2,
      cost: 3,
      icon: '✦',
      category: 'Парный',
      description: 'Сливает опыт боя и тактики, открывая истинный потенциал Blood Legends.',
      prerequisites: ['nightmare_blade', 'crimson_vanguard'],
      effects: {
        'Все характеристики': '+8',
        'Шанс легендарной добычи': '+4%'
      },
      bonuses: {
        strength: 4,
        agility: 4,
        defense: 4,
        maxHp: 80,
        maxMp: 40
      },
      races: ['bloodborn', 'emberforged']
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
const playerRaceElement = document.getElementById('player-race');

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

function safeGetStorageItem(key) {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function safeSetStorageItem(key, value) {
  try {
    if (typeof localStorage === 'undefined') return;
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    // ignore storage errors
  }
}

function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function slugify(text, fallback = 'entry') {
  if (!text) return fallback;
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF]+/gi, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '') || fallback;
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

function transformRace(rawRace) {
  if (!rawRace) return null;
  const id = rawRace.id ?? slugify(rawRace.name ?? 'race', `race_${Math.random().toString(36).slice(2, 8)}`);
  const traits = Array.isArray(rawRace.traits) ? rawRace.traits.filter(Boolean) : [];

  return {
    id,
    name: rawRace.name ?? 'Неизвестная раса',
    icon: rawRace.icon ?? '✹',
    description: rawRace.description ?? 'Описание отсутствует.',
    origin: rawRace.origin ?? '',
    traits
  };
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

function transformSkill(rawSkill) {
  const id = rawSkill.id ?? slugify(rawSkill.name ?? 'skill', `skill_${Math.random().toString(36).slice(2, 8)}`);
  const tier = Number.parseInt(rawSkill.tier ?? 1, 10);
  const column = Number.parseInt(rawSkill.column ?? 1, 10);
  const cost = Math.max(1, Number.parseInt(rawSkill.cost ?? 1, 10));
  const prerequisites = Array.isArray(rawSkill.prerequisites) ? rawSkill.prerequisites.filter(Boolean) : [];
  const effects = rawSkill.effects && typeof rawSkill.effects === 'object' ? rawSkill.effects : {};
  const bonuses = rawSkill.bonuses && typeof rawSkill.bonuses === 'object' ? rawSkill.bonuses : {};

  return {
    id,
    name: rawSkill.name ?? 'Неизвестный навык',
    tier: Number.isFinite(tier) ? tier : 1,
    column: Number.isFinite(column) ? column : 1,
    cost,
    icon: rawSkill.icon ?? '✦',
    category: rawSkill.category ?? 'Навык',
    description: rawSkill.description ?? 'Описание навыка пока не добавлено.',
    prerequisites,
    effects,
    bonuses,
    tags: Array.isArray(rawSkill.tags) ? rawSkill.tags : [],
    races: Array.isArray(rawSkill.races) ? rawSkill.races.filter(Boolean) : []
  };
}

function transformQuest(rawQuest) {
  if (!rawQuest) return null;

  const status = (rawQuest.status ?? 'available').toLowerCase();
  const recommendedLevel = rawQuest.recommendedLevel ?? rawQuest.level ?? null;
  const locationId = rawQuest.locationId ?? rawQuest.regionId ?? null;
  const location = locationId ? gameData.locationIndex.get(locationId) : null;

  const objectives = (rawQuest.objectives ?? []).map((objective, index) => {
    const required = objective.required ?? objective.count ?? 1;
    const progress = Math.max(0, Math.min(required, objective.progress ?? objective.completed ?? 0));
    const targetId = objective.targetId ?? objective.monsterId ?? objective.itemId ?? null;
    const objectiveLocationId = objective.locationId ?? locationId ?? null;
    const objectiveLocation = objectiveLocationId ? gameData.locationIndex.get(objectiveLocationId) : null;
    const typeKey = objective.type ?? 'objective';

    let text = objective.description ?? '';
    if (!text) {
      if (['hunt', 'defeat'].includes(typeKey) && targetId) {
        const monster = gameData.monsterIndex.get(targetId);
        const monsterName = monster?.name ?? targetId;
        text = `Победить ${required} × ${monsterName}`;
      } else if (['collect', 'gather'].includes(typeKey) && targetId) {
        const item = gameData.loot.get(targetId);
        const itemName = item?.name ?? targetId;
        text = `Собрать ${required} × ${itemName}`;
      } else if (['explore', 'investigate'].includes(typeKey)) {
        text = `Исследовать ${objectiveLocation?.name ?? 'локацию'}`;
      } else if (typeKey === 'escort') {
        text = 'Сопроводить союзников к цели';
      } else {
        text = 'Выполнить поставленную задачу';
      }
    }

    return {
      id: objective.id ?? `${rawQuest.id}-obj-${index + 1}`,
      text,
      type: typeKey,
      targetId,
      locationId: objectiveLocationId,
      locationName: objectiveLocation?.name ?? null,
      required,
      progress,
      isComplete: progress >= required,
      optional: Boolean(objective.optional)
    };
  });

  const completedObjectives = objectives.filter((objective) => objective.isComplete).length;
  const overallComplete = status === 'completed' || (objectives.length > 0 && completedObjectives === objectives.length);
  const progressPercent = objectives.length
    ? Math.round((completedObjectives / objectives.length) * 100)
    : overallComplete ? 100 : 0;

  const lootRewards = (rawQuest.rewards?.loot ?? []).map((reward) => {
    const itemId = reward.itemId ?? reward.id ?? null;
    const item = itemId ? gameData.loot.get(itemId) : null;
    const quantity = reward.quantity ?? reward.count ?? 1;
    const chance = reward.chance ?? reward.dropChance ?? item?.dropChance ?? null;
    return {
      id: itemId,
      name: item?.name ?? itemId ?? 'Неизвестный трофей',
      icon: item?.icon ?? '♦',
      quantity,
      chance,
      rarity: item?.rarity ?? null
    };
  });

  return {
    id: rawQuest.id,
    name: rawQuest.name ?? rawQuest.title ?? 'Неизвестное задание',
    status,
    type: rawQuest.type ?? 'задание',
    giver: rawQuest.giver ?? rawQuest.client ?? '',
    recommendedLevel,
    locationId,
    locationName: location?.name ?? rawQuest.location ?? '',
    locationSector: location?.sector ?? rawQuest.sector ?? '',
    summary: rawQuest.summary ?? '',
    description: rawQuest.description ?? rawQuest.summary ?? '',
    objectives,
    rewards: {
      xp: rawQuest.rewards?.xp ?? null,
      gold: rawQuest.rewards?.gold ?? null,
      loot: lootRewards,
      reputation: rawQuest.rewards?.reputation ?? null
    },
    tags: rawQuest.tags ?? [],
    urgency: rawQuest.urgency ?? '',
    overallComplete,
    progressPercent
  };
}

function registerQuests(quests = []) {
  gameData.questIndex.clear();
  gameData.quests = quests
    .map((quest) => transformQuest(quest))
    .filter((quest) => quest !== null);

  gameData.quests.forEach((quest) => {
    gameData.questIndex.set(quest.id, quest);
  });

  if (questBoardState.selectionId && !gameData.questIndex.has(questBoardState.selectionId)) {
    questBoardState.selectionId = null;
  }

  if (!questBoardState.selectionId && gameData.quests.length) {
    const preferred = gameData.quests.find((quest) => quest.status === 'active') ?? gameData.quests[0];
    questBoardState.selectionId = preferred?.id ?? null;
  } else if (!gameData.quests.length) {
    questBoardState.selectionId = null;
  }

  if (questBoardState.trackedId && !gameData.questIndex.has(questBoardState.trackedId)) {
    questBoardState.trackedId = null;
  }

  if (!questBoardState.trackedId && questBoardState.selectionId) {
    questBoardState.trackedId = questBoardState.selectionId;
  } else if (!questBoardState.trackedId && gameData.quests.length) {
    const activeQuest = gameData.quests.find((quest) => quest.status === 'active') ?? gameData.quests[0];
    questBoardState.trackedId = activeQuest?.id ?? null;
  }
}

function ingestCatalogs({ loot = [], monsters = [], locations = [], quests = [], skills = [], races = [] }) {
  gameData.loot.clear();
  loot.forEach((entry) => {
    const enriched = enrichLootEntry(entry);
    gameData.loot.set(enriched.id, enriched);
  });

  registerRaces(races);
  registerLocations(locations);

  registerSkills(skills);

  gameData.monsterIndex.clear();
  gameData.monsters = monsters.map((monster) => {
    const template = transformMonster(monster);
    gameData.monsterIndex.set(template.id, template);
    return template;
  });

  registerQuests(quests);
  syncCodexAfterDataUpdate();
  syncQuestBoardAfterDataUpdate();
  syncSkillsAfterDataUpdate();
}

function registerRaces(races) {
  const entries = Array.isArray(races) ? races : [];
  gameData.races = entries
    .map((race) => transformRace(race))
    .filter((race) => Boolean(race?.id));
  gameData.raceIndex.clear();
  gameData.races.forEach((race) => {
    gameData.raceIndex.set(race.id, race);
  });

  if (playerState.raceId && !gameData.raceIndex.has(playerState.raceId)) {
    playerState.raceId = null;
    safeSetStorageItem(raceStorageKey, null);
  }

  if (!playerState.raceId && storedRacePreference && gameData.raceIndex.has(storedRacePreference)) {
    playerState.raceId = storedRacePreference;
  }

  if (playerState.raceId && gameData.raceIndex.has(playerState.raceId)) {
    raceState.highlightedId = playerState.raceId;
  } else if (gameData.races.length) {
    raceState.highlightedId = gameData.races[0].id;
  } else {
    raceState.highlightedId = null;
  }
}

function registerLocations(locations) {
  gameData.locations = locations;
  gameData.locationIndex.clear();
  locations.forEach((location) => {
    gameData.locationIndex.set(location.id, location);
  });
}

function registerSkills(skills) {
  gameData.allSkills = skills.map((skill) => transformSkill(skill));
  gameData.allSkills.sort((a, b) => {
    if (a.tier === b.tier) {
      return (a.column ?? 1) - (b.column ?? 1);
    }
    return a.tier - b.tier;
  });

  applyRaceSkillFilter({ preserveSelection: true });
}

function applyRaceSkillFilter({ preserveSelection = false } = {}) {
  const allSkills = Array.isArray(gameData.allSkills) ? gameData.allSkills : [];
  const hasRace = playerState.raceId && gameData.raceIndex.has(playerState.raceId);

  if (playerState.raceId && !hasRace) {
    playerState.raceId = null;
    playerState.raceName = '—';
    safeSetStorageItem(raceStorageKey, null);
  }

  const raceId = hasRace ? playerState.raceId : null;
  const filtered = raceId
    ? allSkills.filter((skill) => {
        if (!skill.races || !skill.races.length) return true;
        return skill.races.includes(raceId);
      })
    : [];

  gameData.skills = filtered;
  gameData.skillIndex.clear();
  filtered.forEach((skill) => {
    gameData.skillIndex.set(skill.id, skill);
  });

  [...skillsState.learned].forEach((id) => {
    if (!gameData.skillIndex.has(id)) {
      skillsState.learned.delete(id);
    }
  });

  let selection = preserveSelection && skillsState.selectionId && gameData.skillIndex.has(skillsState.selectionId)
    ? skillsState.selectionId
    : null;

  if (!selection && filtered.length) {
    selection = filtered[0].id;
  }

  skillsState.selectionId = selection ?? null;

  const raceEntry = raceId ? gameData.raceIndex.get(raceId) : null;
  playerState.raceName = raceEntry?.name ?? '—';

  if (raceId) {
    raceState.highlightedId = raceId;
  } else if (!gameData.races.length) {
    raceState.highlightedId = null;
  }

  applySkillBonuses();
  updateSkillSummary();
  renderSkillsTree();
  renderRaceSelection();
}

function getSkillsForRace(raceId) {
  if (!raceId) return [];
  const allSkills = Array.isArray(gameData.allSkills) ? gameData.allSkills : [];
  return allSkills
    .filter((skill) => {
      if (!skill.races || !skill.races.length) return true;
      return skill.races.includes(raceId);
    })
    .map((skill) => skill.name);
}

function renderRaceSelection() {
  if (!raceListElement) return;

  raceListElement.replaceChildren();

  if (!gameData.races.length) {
    const placeholder = document.createElement('li');
    placeholder.className = 'race-placeholder';
    placeholder.textContent = 'Каталог рас не загружен.';
    raceListElement.append(placeholder);
    renderRaceDetails(null);
    if (raceConfirmButton) {
      raceConfirmButton.disabled = true;
      raceConfirmButton.textContent = 'Подтвердить расу';
    }
    return;
  }

  if (!raceState.highlightedId || !gameData.raceIndex.has(raceState.highlightedId)) {
    raceState.highlightedId = playerState.raceId && gameData.raceIndex.has(playerState.raceId)
      ? playerState.raceId
      : gameData.races[0].id;
  }

  gameData.races.forEach((race) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'race-card';
    button.dataset.raceId = race.id;
    button.setAttribute('role', 'option');
    if (race.id === raceState.highlightedId) {
      button.classList.add('is-active');
      button.setAttribute('aria-selected', 'true');
    } else {
      button.setAttribute('aria-selected', 'false');
    }

    const icon = document.createElement('span');
    icon.className = 'race-card__icon';
    icon.textContent = race.icon ?? '✹';

    const name = document.createElement('span');
    name.className = 'race-card__name';
    name.textContent = race.name;

    button.append(icon, name);

    button.addEventListener('click', () => {
      if (raceState.highlightedId === race.id) return;
      raceState.highlightedId = race.id;
      renderRaceSelection();
    });

    item.append(button);
    raceListElement.append(item);
  });

  const activeRace = gameData.raceIndex.get(raceState.highlightedId) ?? null;
  renderRaceDetails(activeRace);
}

function renderRaceDetails(race) {
  if (!raceDetailName || !raceDetailDescription || !raceDetailTraits || !raceDetailSkills) return;

  if (!race) {
    raceDetailName.textContent = 'Выберите расу';
    if (raceDetailOrigin) {
      raceDetailOrigin.textContent = '';
    }
    raceDetailDescription.textContent = 'Откройте карточку слева, чтобы увидеть особенности и доступные навыки.';
    raceDetailTraits.replaceChildren();
    raceDetailSkills.replaceChildren();

    const traitsPlaceholder = document.createElement('li');
    traitsPlaceholder.className = 'race-trait race-trait--empty';
    traitsPlaceholder.textContent = 'Особенности будут показаны после выбора расы.';
    raceDetailTraits.append(traitsPlaceholder);

    const skillsPlaceholder = document.createElement('p');
    skillsPlaceholder.className = 'race-skills__placeholder';
    skillsPlaceholder.textContent = 'Навыки станут доступны после выбора расы.';
    raceDetailSkills.append(skillsPlaceholder);

    if (raceConfirmButton) {
      raceConfirmButton.disabled = true;
      raceConfirmButton.textContent = 'Подтвердить расу';
    }
    return;
  }

  const title = race.icon ? `${race.icon} ${race.name}`.trim() : race.name;
  raceDetailName.textContent = title;
  if (raceDetailOrigin) {
    raceDetailOrigin.textContent = race.origin ? `Родные земли: ${race.origin}` : '';
  }
  raceDetailDescription.textContent = race.description ?? '';

  raceDetailTraits.replaceChildren();
  if (race.traits?.length) {
    race.traits.forEach((trait) => {
      const entry = document.createElement('li');
      entry.className = 'race-trait';
      entry.textContent = trait;
      raceDetailTraits.append(entry);
    });
  } else {
    const entry = document.createElement('li');
    entry.className = 'race-trait race-trait--empty';
    entry.textContent = 'Особенности будут уточнены позже.';
    raceDetailTraits.append(entry);
  }

  raceDetailSkills.replaceChildren();
  const skillsTitle = document.createElement('h4');
  skillsTitle.className = 'race-skills__title';
  skillsTitle.textContent = 'Навыки расовой школы';
  raceDetailSkills.append(skillsTitle);

  const availableSkills = getSkillsForRace(race.id);
  if (availableSkills.length) {
    const list = document.createElement('ul');
    list.className = 'race-skills__list';
    availableSkills.forEach((name) => {
      const item = document.createElement('li');
      item.textContent = name;
      list.append(item);
    });
    raceDetailSkills.append(list);
  } else {
    const placeholder = document.createElement('p');
    placeholder.className = 'race-skills__placeholder';
    placeholder.textContent = 'Навыки для этой расы ещё в разработке.';
    raceDetailSkills.append(placeholder);
  }

  if (raceConfirmButton) {
    const isCurrent = race.id === playerState.raceId;
    raceConfirmButton.disabled = isCurrent;
    raceConfirmButton.textContent = isCurrent ? 'Уже выбрана' : 'Подтвердить расу';
  }
}

function openRaceSelection() {
  if (!raceModal) return;
  if (!gameData.races.length) {
    appendChatLog('<strong>Система</strong>: Каталог рас не загружен.');
    return;
  }

  if (!raceState.highlightedId || !gameData.raceIndex.has(raceState.highlightedId)) {
    raceState.highlightedId = playerState.raceId && gameData.raceIndex.has(playerState.raceId)
      ? playerState.raceId
      : gameData.races[0].id;
  }

  renderRaceSelection();
  raceModal.classList.remove('is-hidden');
  raceModal.setAttribute('aria-hidden', 'false');
}

function closeRaceSelection() {
  if (!raceModal) return;
  raceModal.classList.add('is-hidden');
  raceModal.setAttribute('aria-hidden', 'true');
}

function setPlayerRace(raceId, { silent = false } = {}) {
  if (!raceId || !gameData.raceIndex.has(raceId)) {
    appendChatLog('<strong>Система</strong>: Невозможно выбрать неизвестную расу.');
    return false;
  }

  const previous = playerState.raceId;
  playerState.raceId = raceId;
  safeSetStorageItem(raceStorageKey, raceId);
  raceState.highlightedId = raceId;

  applyRaceSkillFilter();

  if (!silent) {
    if (previous === raceId) {
      appendChatLog(`<strong>Система</strong>: Раса «${playerState.raceName}» уже активна.`);
    } else {
      appendChatLog(`<strong>Система</strong>: Вы выбрали расу «${playerState.raceName}».`);
    }
  }

  closeRaceSelection();
  return true;
}

function ensureRaceSelection() {
  if (!gameData.races.length) return;

  if (playerState.raceId && gameData.raceIndex.has(playerState.raceId)) {
    raceState.highlightedId = playerState.raceId;
    applyRaceSkillFilter({ preserveSelection: true });
    return;
  }

  raceState.highlightedId = gameData.races[0]?.id ?? null;
  renderRaceSelection();
  openRaceSelection();
  appendChatLog('<strong>Система</strong>: Выберите расу, чтобы разблокировать древо навыков.');
}

async function loadGameData() {
  const [lootData, monsterData, locationData, questData, raceData, skillData] = await Promise.all([
    fetchJson(dataSources.loot),
    fetchJson(dataSources.monsters),
    fetchJson(dataSources.locations),
    fetchJson(dataSources.quests),
    fetchJson(dataSources.races),
    fetchJson(dataSources.skills)
  ]);
  ingestCatalogs({
    loot: lootData,
    monsters: monsterData,
    locations: locationData,
    quests: questData,
    skills: skillData,
    races: raceData
  });
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

function setCodexActiveTab(category) {
  if (!codexTabs.length) return;
  codexTabs.forEach((tab) => {
    const active = tab.dataset.codexTab === category;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
}

function formatLevelRange(range) {
  if (Array.isArray(range) && range.length === 2) {
    return `${range[0]} — ${range[1]}`;
  }
  if (typeof range === 'number') {
    return String(range);
  }
  return '—';
}

function formatChance(value) {
  if (value === null || value === undefined) {
    return '—';
  }
  const normalized = value > 1 ? value : value * 100;
  const rounded = Math.abs(normalized - Math.round(normalized)) < 0.05
    ? Math.round(normalized)
    : normalized.toFixed(1);
  return `${String(rounded).replace('.', ',')}%`;
}

function buildCodexDataset(category) {
  switch (category) {
    case 'monsters':
      return gameData.monsters.map((monster) => ({
        id: monster.id,
        title: monster.name,
        meta: `Ур. ${monster.level}${monster.habitat ? ` · ${monster.habitat}` : ''}`,
        data: monster
      }));
    case 'locations':
      return gameData.locations.map((location) => ({
        id: location.id,
        title: location.name,
        meta: `${location.sector ?? 'Неизвестный сектор'} · Угроза ${location.threatRating ?? '—'}`,
        data: location
      }));
    case 'loot':
      return Array.from(gameData.loot.values()).map((item) => ({
        id: item.id,
        title: item.name,
        meta: `${item.type ?? 'Трофей'} · Шанс ${formatChance(item.dropChance ?? item.chance ?? null)}`,
        data: item
      }));
    default:
      return [];
  }
}

function createCodexListSection(title, items) {
  const section = document.createElement('div');
  section.className = 'codex-extra-section';
  const heading = document.createElement('h4');
  heading.textContent = title;
  const list = document.createElement('ul');
  list.className = 'codex-extra-list';
  if (!items.length) {
    const placeholder = document.createElement('li');
    placeholder.textContent = 'Нет данных.';
    list.append(placeholder);
  } else {
    items.forEach((item) => {
      const entry = document.createElement('li');
      if (item instanceof HTMLElement) {
        entry.append(item);
      } else {
        entry.textContent = item;
      }
      list.append(entry);
    });
  }
  section.append(heading, list);
  return section;
}

function createCodexLootSection(lootTable) {
  const section = document.createElement('div');
  section.className = 'codex-extra-section';
  const heading = document.createElement('h4');
  heading.textContent = 'Трофеи';
  const list = document.createElement('ul');
  list.className = 'codex-extra-list';

  if (!lootTable.length) {
    const placeholder = document.createElement('li');
    placeholder.textContent = 'Трофеи не обнаружены.';
    list.append(placeholder);
  } else {
    lootTable.forEach((entry) => {
      const itemRow = document.createElement('li');
      const container = document.createElement('div');
      container.className = 'codex-loot-item';

      const icon = document.createElement('span');
      icon.className = 'codex-loot-item__icon';
      icon.textContent = entry.icon ?? '♦';

      const body = document.createElement('div');
      body.className = 'codex-loot-item__body';

      const name = document.createElement('span');
      name.className = 'codex-loot-item__name';
      name.textContent = entry.name;

      const [minQty, maxQty] = entry.quantityRange ?? [1, 1];
      const qtyText = minQty === maxQty ? `${minQty} шт.` : `${minQty}–${maxQty} шт.`;
      const meta = document.createElement('span');
      meta.className = 'codex-loot-item__meta';
      meta.textContent = `Шанс ${formatChance(entry.chance ?? entry.dropChance ?? null)} · ${qtyText}`;

      body.append(name, meta);
      container.append(icon, body);
      itemRow.append(container);
      list.append(itemRow);
    });
  }

  section.append(heading, list);
  return section;
}

function renderCodexDetails(entry, category) {
  if (!codexEntryName || !codexEntryMeta || !codexEntryDescription || !codexEntryStats || !codexEntryExtra) {
    return;
  }

  codexEntryExtra.replaceChildren();
  codexEntryStats.replaceChildren();

  if (!entry) {
    codexEntryName.textContent = 'Записей пока нет';
    codexEntryMeta.textContent = '';
    codexEntryDescription.textContent = 'Добавьте данные в каталоги JSON, чтобы увидеть записи кодекса.';
    return;
  }

  if (category === 'monsters') {
    codexEntryName.textContent = entry.name;
    const rank = entry.rank ? capitalize(entry.rank) : 'Противник';
    const locationText = entry.habitat ? ` · ${entry.habitat}` : '';
    codexEntryMeta.textContent = `Ур. ${entry.level} · ${rank}${locationText}`;
    codexEntryDescription.textContent = entry.intro;

    const stats = [
      ['Макс. НР', formatNumber(entry.maxHp)],
      ['Урон', `${formatNumber(entry.minDamage)} – ${formatNumber(entry.maxDamage)}`],
      ['Опыт', formatNumber(entry.xpReward)],
      ['Золото', Array.isArray(entry.goldReward)
        ? `${formatNumber(entry.goldReward[0])} – ${formatNumber(entry.goldReward[1])}`
        : formatNumber(entry.goldReward ?? 0)
      ],
      ['Принадлежность', entry.alignment ? capitalize(entry.alignment) : 'Неизвестно']
    ];

    stats.forEach(([label, value]) => {
      const term = document.createElement('dt');
      term.textContent = label;
      const def = document.createElement('dd');
      def.textContent = value;
      codexEntryStats.append(term, def);
    });

    if (entry.abilities?.length) {
      codexEntryExtra.append(createCodexListSection('Способности', entry.abilities));
    }

    codexEntryExtra.append(createCodexLootSection(entry.lootTable ?? []));
    return;
  }

  if (category === 'locations') {
    codexEntryName.textContent = entry.name;
    codexEntryMeta.textContent = `${entry.sector ?? 'Неизвестный сектор'} · Тип: ${entry.type ?? '—'}`;
    codexEntryDescription.textContent = entry.description ?? 'Описание локации не задано.';

    const stats = [
      ['Уровни', formatLevelRange(entry.levelRange)],
      ['Угроза', entry.threatRating ?? '—'],
      ['Ключевых точек', entry.pointsOfInterest?.length ?? 0],
      ['Событий в пути', entry.travelEvents?.length ?? 0]
    ];

    stats.forEach(([label, value]) => {
      const term = document.createElement('dt');
      term.textContent = label;
      const def = document.createElement('dd');
      def.textContent = String(value);
      codexEntryStats.append(term, def);
    });

    if (entry.pointsOfInterest?.length) {
      codexEntryExtra.append(createCodexListSection('Ключевые точки', entry.pointsOfInterest));
    }

    if (entry.encounters?.length) {
      const encounters = entry.encounters.map((id) => {
        const monster = gameData.monsterIndex.get(id);
        if (monster) {
          return `${monster.name} (ур. ${monster.level})`;
        }
        return id;
      });
      codexEntryExtra.append(createCodexListSection('Возможные враги', encounters));
    }

    if (entry.travelEvents?.length) {
      const events = entry.travelEvents.map((event) => {
        const type = event?.type ? capitalize(event.type) : 'Событие';
        const description = event?.description ?? '';
        const risk = event?.dangerLevel ? ` (опасность: ${event.dangerLevel})` : '';
        const separator = description ? ' — ' : '';
        return `${type}${separator}${description}${risk}`.trim();
      });
      codexEntryExtra.append(createCodexListSection('События на пути', events));
    }
    return;
  }

  if (category === 'loot') {
    codexEntryName.textContent = entry.name;
    codexEntryMeta.textContent = `${entry.type ?? 'Трофей'} · ${capitalize(entry.rarity ?? '')}`;
    codexEntryDescription.textContent = entry.description ?? 'Описание отсутствует.';

    const weight = typeof entry.weight === 'number'
      ? (Number.isInteger(entry.weight) ? entry.weight : entry.weight.toFixed(1).replace('.', ','))
      : '—';

    const stats = [
      ['Вес', typeof weight === 'string' ? weight : String(weight)],
      ['Шанс выпадения', formatChance(entry.dropChance ?? entry.chance ?? null)],
      ['Редкость', entry.rarity ? capitalize(entry.rarity) : '—']
    ];

    stats.forEach(([label, value]) => {
      const term = document.createElement('dt');
      term.textContent = label;
      const def = document.createElement('dd');
      def.textContent = String(value);
      codexEntryStats.append(term, def);
    });

    if (entry.properties && Object.keys(entry.properties).length) {
      const properties = Object.entries(entry.properties).map(([prop, value]) => `${prop}: ${value}`);
      codexEntryExtra.append(createCodexListSection('Свойства', properties));
    }

    const sources = gameData.monsters
      .filter((monster) => monster.lootTable?.some((loot) => loot.id === entry.id))
      .map((monster) => `${monster.name} (ур. ${monster.level})`);
    if (sources.length) {
      codexEntryExtra.append(createCodexListSection('Источник', sources));
    }
    return;
  }
}

function syncCodexAfterDataUpdate() {
  const dataset = buildCodexDataset(codexState.category);
  if (!dataset.some((entry) => entry.id === codexState.selectionId)) {
    codexState.selectionId = dataset[0]?.id ?? null;
  }
  if (codexModal && !codexModal.classList.contains('is-hidden')) {
    renderCodex(codexState.category);
  }
}

function renderCodex(category = codexState.category) {
  if (!codexListElement) return;
  codexState.category = category;
  setCodexActiveTab(category);

  const dataset = buildCodexDataset(category);
  codexListElement.replaceChildren();

  if (!dataset.length) {
    codexState.selectionId = null;
    const placeholder = document.createElement('li');
    placeholder.textContent = 'Нет записей для выбранной категории.';
    codexListElement.append(placeholder);
    renderCodexDetails(null, category);
    return;
  }

  if (!dataset.some((entry) => entry.id === codexState.selectionId)) {
    codexState.selectionId = dataset[0].id;
  }

  dataset.forEach((entry) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'codex-entry';
    button.setAttribute('role', 'option');
    if (entry.id === codexState.selectionId) {
      button.classList.add('is-active');
      button.setAttribute('aria-selected', 'true');
    } else {
      button.setAttribute('aria-selected', 'false');
    }
    button.dataset.entryId = entry.id;

    const titleLine = document.createElement('div');
    titleLine.className = 'codex-entry__title';
    const title = document.createElement('span');
    title.textContent = entry.title;
    titleLine.append(title);

    const metaLine = document.createElement('div');
    metaLine.className = 'codex-entry__meta';
    metaLine.textContent = entry.meta;

    button.append(titleLine, metaLine);

    button.addEventListener('click', () => {
      codexState.selectionId = entry.id;
      renderCodex(category);
    });

    item.append(button);
    codexListElement.append(item);
  });

  const active = dataset.find((entry) => entry.id === codexState.selectionId) ?? dataset[0];
  renderCodexDetails(active?.data ?? null, category);
}

function openCodex(category = codexState.category) {
  if (!codexModal) return;
  codexModal.classList.remove('is-hidden');
  codexModal.setAttribute('aria-hidden', 'false');
  renderCodex(category);
}

function closeCodex() {
  if (!codexModal) return;
  codexModal.classList.add('is-hidden');
  codexModal.setAttribute('aria-hidden', 'true');
}

function calculateSkillPointsSpent() {
  let total = 0;
  skillsState.learned.forEach((id) => {
    const skill = gameData.skillIndex.get(id);
    if (skill) {
      total += skill.cost;
    }
  });
  return total;
}

function getAvailableSkillPoints() {
  return Math.max(0, skillsState.totalPoints - calculateSkillPointsSpent());
}

function arePrerequisitesMet(skill) {
  if (!skill?.prerequisites?.length) return true;
  return skill.prerequisites.every((id) => skillsState.learned.has(id));
}

function getSkillDependants(skillId) {
  const dependants = new Set();
  if (!skillId) return dependants;
  const stack = [skillId];
  while (stack.length) {
    const current = stack.pop();
    gameData.skills.forEach((skill) => {
      if (skill.prerequisites?.includes(current) && !dependants.has(skill.id)) {
        dependants.add(skill.id);
        stack.push(skill.id);
      }
    });
  }
  dependants.delete(skillId);
  return dependants;
}

function isSkillAvailableForRace(skill, raceId = playerState.raceId) {
  if (!skill) return false;
  if (!raceId) return false;
  if (!skill.races || !skill.races.length) return true;
  return skill.races.includes(raceId);
}

function canLearnSkill(skill) {
  if (!skill) return false;
  if (skillsState.learned.has(skill.id)) return false;
  if (!isSkillAvailableForRace(skill)) return false;
  if (!arePrerequisitesMet(skill)) return false;
  return getAvailableSkillPoints() >= skill.cost;
}

function aggregateSkillBonuses() {
  const totals = {};
  skillsState.learned.forEach((id) => {
    const skill = gameData.skillIndex.get(id);
    if (!skill?.bonuses) return;
    Object.entries(skill.bonuses).forEach(([key, value]) => {
      if (typeof value !== 'number' || Number.isNaN(value)) return;
      if (!totals[key]) {
        totals[key] = 0;
      }
      totals[key] += value;
    });
  });
  return totals;
}

function applySkillBonuses() {
  const totals = aggregateSkillBonuses();
  const keys = ['strength', 'agility', 'defense'];
  keys.forEach((key) => {
    if (playerBaseAttributes[key] !== undefined) {
      playerState[key] = playerBaseAttributes[key] + (totals[key] ?? 0);
    }
  });

  if (playerBaseAttributes.maxHp !== undefined) {
    const prevRatio = playerState.maxHp > 0 ? playerState.hp / playerState.maxHp : 1;
    playerState.maxHp = playerBaseAttributes.maxHp + (totals.maxHp ?? 0);
    playerState.hp = clamp(Math.round(playerState.maxHp * prevRatio), 0, playerState.maxHp);
  }

  if (playerBaseAttributes.maxMp !== undefined) {
    const prevRatio = playerState.maxMp > 0 ? playerState.mp / playerState.maxMp : 1;
    playerState.maxMp = playerBaseAttributes.maxMp + (totals.maxMp ?? 0);
    playerState.mp = clamp(Math.round(playerState.maxMp * prevRatio), 0, playerState.maxMp);
  }

  updatePlayerUI();
}

function updateSkillSummary() {
  if (skillPointsAvailableElement) {
    skillPointsAvailableElement.textContent = String(getAvailableSkillPoints());
  }
  if (skillPointsSpentElement) {
    skillPointsSpentElement.textContent = String(calculateSkillPointsSpent());
  }
}

function renderSkillDetails(skill) {
  if (!skillDetailName || !skillDetailDescription || !skillDetailEffects || !skillDetailRequirements || !skillDetailCost) return;

  if (!skill) {
    skillDetailName.textContent = 'Выберите навык';
    skillDetailCost.textContent = '—';
    skillDetailDescription.textContent = 'Кликните на ячейку в древе, чтобы узнать подробности и изучить навык.';
    skillDetailEffects.replaceChildren();
    skillDetailRequirements.replaceChildren();
    skillActionButtons.forEach((button) => {
      button.disabled = true;
    });
    return;
  }

  skillDetailName.textContent = skill.name;
  skillDetailCost.textContent = `Стоимость: ${skill.cost}`;
  skillDetailDescription.textContent = skill.description;

  skillDetailEffects.replaceChildren();
  const entries = Object.entries(skill.effects ?? {});
  if (entries.length) {
    entries.forEach(([label, value]) => {
      const term = document.createElement('dt');
      term.textContent = label;
      const def = document.createElement('dd');
      def.textContent = String(value);
      skillDetailEffects.append(term, def);
    });
  }

  skillDetailRequirements.replaceChildren();
  const requirements = [];
  if (skill.prerequisites?.length) {
    const names = skill.prerequisites
      .map((id) => gameData.skillIndex.get(id)?.name ?? id)
      .join(', ');
    requirements.push(`Требует: ${names}`);
  }
  requirements.push(`Тип: ${skill.category ?? 'Навык'}`);
  requirements.push(`Уровень: ${skill.tier}`);
  if (skill.races?.length) {
    const raceNames = skill.races
      .map((id) => gameData.raceIndex.get(id)?.name ?? id)
      .join(', ');
    requirements.push(`Расы: ${raceNames}`);
  } else {
    requirements.push('Расы: доступно всем путям');
  }

  requirements.forEach((text) => {
    const line = document.createElement('p');
    line.textContent = text;
    skillDetailRequirements.append(line);
  });

  const learned = skillsState.learned.has(skill.id);
  const available = canLearnSkill(skill);
  skillActionButtons.forEach((button) => {
    const action = button.dataset.skillAction;
    if (action === 'learn') {
      button.disabled = !available;
    } else if (action === 'reset') {
      button.disabled = !learned;
    }
  });
}

function renderSkillsTree() {
  if (!skillsTreeElement) return;

  skillsTreeElement.replaceChildren();
  const raceId = playerState.raceId && gameData.raceIndex.has(playerState.raceId)
    ? playerState.raceId
    : null;
  const skills = [...gameData.skills];

  if (!raceId) {
    skillsState.selectionId = null;
    skillsTreeElement.style.removeProperty('--skill-columns');
    const placeholder = document.createElement('p');
    placeholder.className = 'skills-placeholder';
    placeholder.textContent = 'Выберите расу, чтобы открыть древо навыков.';
    skillsTreeElement.append(placeholder);
    renderSkillDetails(null);
    updateSkillSummary();
    return;
  }

  if (!skills.length) {
    skillsState.selectionId = null;
    skillsTreeElement.style.removeProperty('--skill-columns');
    const placeholder = document.createElement('p');
    placeholder.className = 'skills-placeholder';
    placeholder.textContent = 'Для выбранной расы навыки ещё не определены.';
    skillsTreeElement.append(placeholder);
    renderSkillDetails(null);
    updateSkillSummary();
    return;
  }

  if (!skillsState.selectionId || !gameData.skillIndex.has(skillsState.selectionId)) {
    skillsState.selectionId = skills[0].id;
  }

  const maxColumn = Math.max(3, ...skills.map((skill) => skill.column ?? 1));
  skillsTreeElement.style.setProperty('--skill-columns', String(maxColumn));

  skills.forEach((skill) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'skill-node';
    button.dataset.skillId = skill.id;
    button.style.gridColumn = String(skill.column ?? 1);
    button.style.gridRow = String(skill.tier ?? 1);
    button.title = skill.description;

    const icon = document.createElement('span');
    icon.className = 'skill-node__icon';
    icon.textContent = skill.icon ?? '✦';

    const name = document.createElement('span');
    name.className = 'skill-node__name';
    name.textContent = skill.name;

    button.append(icon, name);

    const learned = skillsState.learned.has(skill.id);
    const available = canLearnSkill(skill);
    if (learned) {
      button.classList.add('is-learned');
    } else if (available) {
      button.classList.add('is-available');
    } else {
      button.classList.add('is-locked');
    }

    if (skill.id === skillsState.selectionId) {
      button.classList.add('is-active');
      button.setAttribute('aria-selected', 'true');
    } else {
      button.setAttribute('aria-selected', 'false');
    }

    button.addEventListener('click', () => {
      skillsState.selectionId = skill.id;
      renderSkillsTree();
    });

    skillsTreeElement.append(button);
  });

  const activeSkill = gameData.skillIndex.get(skillsState.selectionId) ?? null;
  renderSkillDetails(activeSkill);
  updateSkillSummary();
}

function learnSkill(skill) {
  if (!canLearnSkill(skill)) {
    appendChatLog('<strong>Система</strong>: Недостаточно очков навыков или не выполнены требования.');
    return;
  }
  skillsState.learned.add(skill.id);
  appendChatLog(`<strong>Система</strong>: Навык «${skill.name}» изучен.`);
  applySkillBonuses();
  renderSkillsTree();
}

function resetSkill(skill) {
  if (!skillsState.learned.has(skill.id)) {
    appendChatLog('<strong>Система</strong>: Навык ещё не изучен.');
    return;
  }
  const toForget = new Set([skill.id]);
  const dependants = getSkillDependants(skill.id);
  dependants.forEach((id) => {
    if (skillsState.learned.has(id)) {
      toForget.add(id);
    }
  });

  const forgottenNames = [];
  toForget.forEach((id) => {
    if (skillsState.learned.delete(id)) {
      const entry = gameData.skillIndex.get(id);
      forgottenNames.push(entry?.name ?? id);
    }
  });

  appendChatLog(`<strong>Система</strong>: Сброшены навыки: ${forgottenNames.join(', ')}.`);
  applySkillBonuses();
  if (skillsState.selectionId && !skillsState.learned.has(skillsState.selectionId) && !gameData.skillIndex.has(skillsState.selectionId)) {
    skillsState.selectionId = gameData.skills[0]?.id ?? null;
  }
  renderSkillsTree();
}

function handleSkillAction(action) {
  const skill = skillsState.selectionId ? gameData.skillIndex.get(skillsState.selectionId) : null;
  if (!skill) return;
  if (action === 'learn') {
    learnSkill(skill);
  } else if (action === 'reset') {
    resetSkill(skill);
  }
}

function openSkills() {
  if (!skillsModal) return;
  skillsModal.classList.remove('is-hidden');
  skillsModal.setAttribute('aria-hidden', 'false');
  renderSkillsTree();
}

function closeSkills() {
  if (!skillsModal) return;
  skillsModal.classList.add('is-hidden');
  skillsModal.setAttribute('aria-hidden', 'true');
}

function syncSkillsAfterDataUpdate() {
  applyRaceSkillFilter({ preserveSelection: true });
}

function buildQuestDataset(filter = questBoardState.filter) {
  const quests = [...gameData.quests];
  if (filter === 'all') return quests;
  return quests.filter((quest) => {
    if (filter === 'active') return quest.status === 'active';
    if (filter === 'available') return quest.status === 'available';
    if (filter === 'completed') return quest.status === 'completed';
    if (filter === 'failed') return quest.status === 'failed';
    return true;
  });
}

function setQuestFilterActive(filter) {
  if (!questFilterButtons.length) return;
  questFilterButtons.forEach((button) => {
    const isActive = button.dataset.questFilter === filter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
}

function renderQuestBoard() {
  if (!questsListElement) return;
  setQuestFilterActive(questBoardState.filter);

  const dataset = buildQuestDataset(questBoardState.filter);
  questsListElement.replaceChildren();

  if (!dataset.length) {
    const placeholder = document.createElement('li');
    placeholder.className = 'quests-placeholder';
    placeholder.textContent = 'Нет заданий для выбранного фильтра.';
    questsListElement.append(placeholder);
    renderQuestDetails(null);
    return;
  }

  if (!dataset.some((quest) => quest.id === questBoardState.selectionId)) {
    questBoardState.selectionId = dataset[0].id;
  }

  dataset.forEach((quest) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quests-entry';
    button.dataset.questId = quest.id;

    if (quest.id === questBoardState.selectionId) {
      button.classList.add('is-active');
    }
    if (quest.id === questBoardState.trackedId) {
      button.classList.add('is-tracked');
    }

    const title = document.createElement('div');
    title.className = 'quests-entry__title';
    const name = document.createElement('span');
    name.className = 'quests-entry__name';
    name.textContent = quest.name;
    const statusBadge = document.createElement('span');
    statusBadge.className = 'quests-entry__status';
    statusBadge.textContent = questStatusLabels[quest.status] ?? capitalize(quest.status ?? '—');
    title.append(name, statusBadge);

    const meta = document.createElement('div');
    meta.className = 'quests-entry__meta';
    const metaParts = [];
    if (quest.type) metaParts.push(capitalize(quest.type));
    if (quest.recommendedLevel) metaParts.push(`Ур. ${quest.recommendedLevel}`);
    if (quest.locationName) metaParts.push(quest.locationName);
    meta.textContent = metaParts.join(' · ');

    const progress = document.createElement('div');
    progress.className = 'quests-entry__progress';
    const progressLabel = document.createElement('span');
    progressLabel.textContent = 'Прогресс';
    const progressValue = document.createElement('span');
    progressValue.textContent = `${quest.progressPercent}%`;
    progress.append(progressLabel, progressValue);

    button.append(title, meta, progress);
    item.append(button);
    questsListElement.append(item);
  });

  const activeQuest = questBoardState.selectionId ? gameData.questIndex.get(questBoardState.selectionId) : null;
  renderQuestDetails(activeQuest ?? dataset[0]);
}

function renderQuestDetails(quest) {
  if (!questsEntryName || !questsEntryDescription || !questsEntryStatus) return;

  if (!quest) {
    questsEntryName.textContent = 'Выберите задание';
    if (questsEntryMeta) questsEntryMeta.textContent = '';
    questsEntryStatus.textContent = '—';
    questsEntryStatus.dataset.status = 'none';
    questsEntryDescription.textContent = 'Откройте запись слева, чтобы увидеть цели и награды.';
    if (questsObjectivesList) questsObjectivesList.replaceChildren();
    if (questsRewardsList) questsRewardsList.replaceChildren();
    if (questTrackButton) {
      questTrackButton.disabled = true;
      questTrackButton.textContent = 'Отслеживать';
      questTrackButton.classList.remove('is-tracked');
      questTrackButton.removeAttribute('data-quest-id');
      questTrackButton.setAttribute('aria-pressed', 'false');
    }
    return;
  }

  questsEntryName.textContent = quest.name;
  if (questsEntryMeta) {
    const metaParts = [];
    if (quest.type) metaParts.push(capitalize(quest.type));
    if (quest.recommendedLevel) metaParts.push(`Рекомендуемый уровень: ${quest.recommendedLevel}`);
    if (quest.locationName) metaParts.push(quest.locationName);
    questsEntryMeta.textContent = metaParts.join(' · ');
  }
  questsEntryStatus.textContent = questStatusLabels[quest.status] ?? capitalize(quest.status ?? '—');
  questsEntryStatus.dataset.status = quest.status ?? 'unknown';
  questsEntryDescription.textContent = quest.description || quest.summary || 'Описание отсутствует.';

  if (questsObjectivesList) {
    questsObjectivesList.replaceChildren();
    if (!quest.objectives.length) {
      const placeholder = document.createElement('li');
      placeholder.className = 'quests-placeholder';
      placeholder.textContent = 'Задачи не назначены.';
      questsObjectivesList.append(placeholder);
    } else {
      quest.objectives.forEach((objective) => {
        const li = document.createElement('li');
        li.className = 'quests-objective';
        if (objective.isComplete) li.classList.add('is-complete');
        if (objective.optional) li.classList.add('is-optional');

        const text = document.createElement('span');
        text.className = 'quests-objective__text';
        text.textContent = objective.text;

        const progress = document.createElement('span');
        progress.className = 'quests-objective__progress';
        progress.textContent = `${objective.progress}/${objective.required}`;

        const bar = document.createElement('div');
        bar.className = 'quests-objective__bar';
        const fill = document.createElement('span');
        const ratio = objective.required > 0 ? Math.min(1, objective.progress / objective.required) : 0;
        fill.style.setProperty('--value', ratio);
        bar.append(fill);

        li.append(text, progress, bar);
        questsObjectivesList.append(li);
      });
    }
  }

  if (questsRewardsList) {
    questsRewardsList.replaceChildren();
    const rewards = quest.rewards ?? {};
    const rewardItems = [];

    if (typeof rewards.xp === 'number') {
      rewardItems.push({ text: `Опыт: ${formatNumber(rewards.xp)}` });
    }
    if (typeof rewards.gold === 'number') {
      rewardItems.push({ text: `Золото: ${formatNumber(rewards.gold)}` });
    }
    if (rewards.reputation) {
      const rep = rewards.reputation;
      if (typeof rep === 'object') {
        const amount = rep.amount ?? rep.value ?? 0;
        const label = rep.faction ? `${rep.faction}: +${amount}` : `Репутация: +${amount}`;
        rewardItems.push({ text: label });
      } else if (typeof rep === 'number') {
        rewardItems.push({ text: `Репутация: +${rep}` });
      }
    }

    if (Array.isArray(rewards.loot) && rewards.loot.length) {
      rewards.loot.forEach((entry) => {
        const parts = [];
        if (entry.icon) parts.push(entry.icon);
        parts.push(entry.name);
        const quantity = entry.quantity ?? 1;
        if (quantity > 1) parts.push(`×${quantity}`);
        if (entry.chance != null) {
          parts.push(`(${formatChance(entry.chance)})`);
        }
        rewardItems.push({ text: parts.join(' '), className: 'quests-reward--loot' });
      });
    }

    if (!rewardItems.length) {
      const placeholder = document.createElement('li');
      placeholder.className = 'quests-placeholder';
      placeholder.textContent = 'Наград нет.';
      questsRewardsList.append(placeholder);
    } else {
      rewardItems.forEach((reward) => {
        const li = document.createElement('li');
        li.className = 'quests-reward';
        if (reward.className) li.classList.add(reward.className);
        li.textContent = reward.text;
        questsRewardsList.append(li);
      });
    }
  }

  if (questTrackButton) {
    const isTracked = questBoardState.trackedId === quest.id;
    questTrackButton.disabled = isTracked;
    questTrackButton.classList.toggle('is-tracked', isTracked);
    questTrackButton.textContent = isTracked ? 'Отслеживается' : 'Отслеживать';
    questTrackButton.dataset.questId = quest.id;
    questTrackButton.setAttribute('aria-pressed', isTracked ? 'true' : 'false');
  }
}

function openQuestBoard() {
  if (!questsModal) return;
  questsModal.classList.remove('is-hidden');
  questsModal.setAttribute('aria-hidden', 'false');
  renderQuestBoard();
}

function closeQuestBoard() {
  if (!questsModal) return;
  questsModal.classList.add('is-hidden');
  questsModal.setAttribute('aria-hidden', 'true');
}

function getTrackedQuest() {
  if (!questBoardState.trackedId) return null;
  return gameData.questIndex.get(questBoardState.trackedId) ?? null;
}

function syncQuestBoardAfterDataUpdate() {
  const dataset = buildQuestDataset(questBoardState.filter);
  if (questBoardState.selectionId && !gameData.questIndex.has(questBoardState.selectionId)) {
    questBoardState.selectionId = dataset[0]?.id ?? gameData.quests[0]?.id ?? null;
  }
  if (!questBoardState.selectionId && dataset.length) {
    questBoardState.selectionId = dataset[0].id;
  }
  if (questBoardState.trackedId && !gameData.questIndex.has(questBoardState.trackedId)) {
    questBoardState.trackedId = questBoardState.selectionId ?? dataset[0]?.id ?? null;
  }

  if (questsModal && !questsModal.classList.contains('is-hidden')) {
    renderQuestBoard();
  }

  updateQuestHighlights();
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
  skillRounds: 0,
  skillPoints: 12,
  raceId: storedRacePreference ?? null,
  raceName: '—'
};

const playerBaseAttributes = {
  strength: playerState.strength,
  agility: playerState.agility,
  defense: playerState.defense,
  maxHp: playerState.maxHp,
  maxMp: playerState.maxMp
};

skillsState.totalPoints = playerState.skillPoints ?? skillsState.totalPoints;


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

  updateQuestHighlights();
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

function buildNodeIntel(node, trackedQuest = getTrackedQuest()) {
  const base = describeNode(node);
  if (!trackedQuest) return base;

  const relevant = (() => {
    if (!trackedQuest) return false;
    if (trackedQuest.locationId && node.locationId === trackedQuest.locationId) return true;
    return trackedQuest.objectives.some((objective) => objective.locationId && objective.locationId === node.locationId);
  })();

  if (!relevant) return base;
  return `${base} Отслеживаемое задание: «${trackedQuest.name}».`;
}

function updateQuestHighlights() {
  const tracked = getTrackedQuest();
  mapState.nodes.forEach((node) => {
    if (!node.element) return;
    const relevant = Boolean(tracked && (
      (tracked.locationId && node.locationId === tracked.locationId) ||
      tracked.objectives.some((objective) => objective.locationId && objective.locationId === node.locationId)
    ));
    node.element.classList.toggle('has-quest', relevant);
  });

  if (mapIntel && mapState.current) {
    mapIntel.textContent = buildNodeIntel(mapState.current, tracked);
  }
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
    mapIntel.textContent = buildNodeIntel(node);
  }

  mapState.nodes.forEach((entry) => {
    if (!entry.element) return;
    entry.element.classList.toggle('is-current', entry.key === node.key);
    const isNeighbor = node.neighbors.includes(entry.key);
    entry.element.classList.toggle('is-adjacent', isNeighbor);
  });

  updateQuestHighlights();
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

  if (playerRaceElement) {
    playerRaceElement.textContent = playerState.raceName ?? '—';
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
        case 'codex':
          openCodex();
          break;
        case 'skills':
          openSkills();
          break;
        case 'race':
          openRaceSelection();
          break;
        case 'map':
          appendChatLog('<strong>Система</strong>: Центр карты уже активен.');
          break;
        case 'quests':
          openQuestBoard();
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

if (codexModal) {
  codexModal.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target === codexModal || event.target.matches('[data-dismiss="codex"]')) {
      closeCodex();
    }
  });
}

if (questsModal) {
  questsModal.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target === questsModal || event.target.matches('[data-dismiss="quests"]')) {
      closeQuestBoard();
    }
  });
}

if (skillsModal) {
  skillsModal.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target === skillsModal || event.target.matches('[data-dismiss="skills"]')) {
      closeSkills();
    }
  });
}

if (raceModal) {
  raceModal.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target === raceModal || event.target.matches('[data-dismiss="race"]')) {
      closeRaceSelection();
    }
  });
}

if (inventoryCloseButton) {
  inventoryCloseButton.addEventListener('click', () => closeInventory());
}

if (codexCloseButton) {
  codexCloseButton.addEventListener('click', () => closeCodex());
}

if (questsCloseButton) {
  questsCloseButton.addEventListener('click', () => closeQuestBoard());
}

if (skillsCloseButton) {
  skillsCloseButton.addEventListener('click', () => closeSkills());
}

if (raceCloseButton) {
  raceCloseButton.addEventListener('click', () => closeRaceSelection());
}

if (raceConfirmButton) {
  raceConfirmButton.addEventListener('click', () => {
    if (!raceState.highlightedId) return;
    setPlayerRace(raceState.highlightedId);
  });
}

if (skillActionButtons.length) {
  skillActionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      handleSkillAction(button.dataset.skillAction);
    });
  });
}

if (codexTabs.length) {
  codexTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.codexTab ?? 'monsters';
      codexState.selectionId = null;
      renderCodex(category);
    });
  });
}

if (questFilterButtons.length) {
  questFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.questFilter ?? 'all';
      questBoardState.filter = filter;
      questBoardState.selectionId = null;
      renderQuestBoard();
    });
  });
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

if (questsListElement) {
  questsListElement.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest('[data-quest-id]');
    if (!(button instanceof HTMLElement)) return;
    const questId = button.dataset.questId;
    if (!questId || questId === questBoardState.selectionId) return;
    questBoardState.selectionId = questId;
    renderQuestBoard();
  });
}

if (questTrackButton) {
  questTrackButton.addEventListener('click', () => {
    const questId = questTrackButton.dataset.questId;
    if (!questId) return;
    questBoardState.trackedId = questId;
    const quest = gameData.questIndex.get(questId);
    if (quest) {
      appendChatLog(`<strong>Система</strong>: Отслеживается задание «${quest.name}».`);
    }
    renderQuestBoard();
    updateQuestHighlights();
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (inventoryModal && !inventoryModal.classList.contains('is-hidden')) {
      closeInventory();
    } else if (codexModal && !codexModal.classList.contains('is-hidden')) {
      closeCodex();
    } else if (questsModal && !questsModal.classList.contains('is-hidden')) {
      closeQuestBoard();
    } else if (skillsModal && !skillsModal.classList.contains('is-hidden')) {
      closeSkills();
    } else if (raceModal && !raceModal.classList.contains('is-hidden')) {
      closeRaceSelection();
    }
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

  ensureRaceSelection();
  updatePlayerUI();
  setPlayerTurn(true);
}

initializeGame();
