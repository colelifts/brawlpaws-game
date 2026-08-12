export const HEROES = {
  kitsune: {
    id: 'kitsune', name: 'Kitsune', role: 'Speedster', maxHealth: 120,
    speed: 305, acceleration: 2050, drag: 10.5, radius: 30,
    dashSpeed: 980, dashDuration: 0.15, dashCooldown: 0.88, dashInvulnerability: 0.22,
    weapon: 'spiritBlaster', dashName: 'Fox Step', passiveName: 'Quickstep',
    summary: 'A precision gunner who wins through speed, range, and rapid critical pressure.',
    ratings: { power:3, toughness:2, mobility:5, control:3 }, difficulty:'Technical',
    damageTakenMultiplier: 1, knockbackResistance: 1,
    portrait: 'assets/characters/kitsune-portrait.png', moveAsset: 'kitsune', fireAsset: 'kitsuneFire', accent: '#45eaff'
  },
  bamboo: {
    id: 'bamboo', name: 'Bamboo', role: 'Tank', maxHealth: 185,
    speed: 258, acceleration: 1500, drag: 9.2, radius: 38,
    dashSpeed: 720, dashDuration: 0.18, dashCooldown: 1.12, dashInvulnerability: 0.24,
    weapon: 'bambooCannon', dashName: 'Iron Roll', passiveName: 'Iron Belly',
    summary: 'A cannon tank who absorbs punishment and controls packs with heavy spread fire.',
    ratings: { power:4, toughness:5, mobility:2, control:4 }, difficulty:'Steady',
    damageTakenMultiplier: .82, knockbackResistance: .52,
    portrait: 'assets/characters/bamboo-portrait.png', moveAsset: 'bamboo', fireAsset: 'bambooFire', accent: '#6af27a'
  },
  hopscotch: {
    id: 'hopscotch', name: 'Hopscotch', role: 'Archer', maxHealth: 105,
    speed: 305, acceleration: 1960, drag: 10.2, radius: 28,
    dashSpeed: 900, dashDuration: 0.14, dashCooldown: 1.02, dashInvulnerability: 0.21,
    weapon: 'spiritLongbow', dashName: 'Moon Hop', passiveName: 'Perfect Draw',
    summary: 'A precision archer who commits to a visible bow draw, then releases piercing spirit arrows through lined-up enemies.',
    ratings: { power:4, toughness:2, mobility:4, control:4 }, difficulty:'Expert',
    damageTakenMultiplier: 1.06, knockbackResistance: 1.08,
    portrait: 'assets/characters/hopscotch-portrait.png', moveAsset: 'hopscotch', fireAsset: 'hopscotchFire', accent: '#ff4fa5',
    unlockRequirement:'Complete the three-chapter campaign once.'
  },
  rusty: {
    id:'rusty',name:'Rusty',role:'Trickshot',maxHealth:112,
    speed:318,acceleration:2050,drag:10.4,radius:29,
    dashSpeed:930,dashDuration:.145,dashCooldown:.94,dashInvulnerability:.22,
    weapon:'twinTrickshots',dashName:'Back Alley Slip',passiveName:'Bank Shot',naturalDual:true,
    summary:'A dual-revolver rogue whose precision rounds rebound into a second enemy and reward clever target lines.',
    ratings:{power:4,toughness:2,mobility:4,control:3},difficulty:'Advanced',
    damageTakenMultiplier:1.03,knockbackResistance:.96,
    portrait:'assets/characters/rusty-portrait.png',moveAsset:'rusty',fireAsset:'rustyFire',accent:'#ff9b32',
    directionMap:[2,1,0,7,6,5,4,3],unlockRequirement:'Clear one Ascension campaign.'
  }
};

export const WEAPONS = {
  spiritBlaster: {
    id: 'spiritBlaster', name: 'Spirit Blaster', damage: 7, fireRate: .24,
    projectileSpeed: 980, projectileLife: 1.1, range: 1050,
    knockback: 210, criticalChance: .14, shots: 1, spread: 0,
    projectileRadius: 9, attackDuration: .14, muzzleDistance: 48,
    recoil: 42, color: '#66efff', impactColor: '#45eaff',
    summary:'Fast single spirit rounds with long reach and the best base critical chance.', tags:['PRECISION','RAPID','LONG RANGE']
  },
  bambooCannon: {
    id: 'bambooCannon', name: 'Bamboo Cannon', damage: 7, fireRate: .5,
    projectileSpeed: 780, projectileLife: .92, range: 720,
    knockback: 360, criticalChance: .08, shots: 3, spread: .105,
    projectileRadius: 12, attackDuration: .23, muzzleDistance: 60,
    recoil: 78, color: '#73f4a4', impactColor: '#82ff6d',
    summary:'Three heavy pellets trade fire rate and reach for crowd control and brutal knockback.', tags:['SPREAD','HEAVY','CONTROL']
  },
  spiritLongbow: {
    id: 'spiritLongbow', name: 'Moonstring Longbow', damage: 15, fireRate: .68,
    projectileSpeed: 1160, projectileLife: 1.22, range: 1320,
    knockback: 270, criticalChance: .18, shots: 1, spread: 0,
    projectileRadius: 8, attackDuration: .62, releaseDelay: .36, muzzleDistance: 54,
    recoil: 28, color: '#ff5fbd', impactColor: '#ff8bd4', projectileType:'arrow', pierces:1,
    summary:'A deliberate draw-and-release weapon whose spirit arrows pierce one additional target.', tags:['DRAW','PIERCE','PRECISION']
  },
  twinTrickshots: {
    id:'twinTrickshots',name:'Twin Trickshots',damage:6,fireRate:.34,
    projectileSpeed:1080,projectileLife:1.05,range:1120,
    knockback:185,criticalChance:.12,shots:1,spread:0,
    projectileRadius:8,attackDuration:.22,muzzleDistance:52,
    recoil:34,color:'#4feaff',impactColor:'#ffbe3f',projectileType:'trickshot',baseVolleys:2,ricochets:1,ricochetRange:460,
    summary:'Two synchronized spirit revolvers fire paired rounds that bank into a nearby second target.',tags:['DUAL','RICOCHET','MOBILE']
  }
};

export const ABILITIES = {
  undertowWell: { id: 'undertowWell', name: 'Undertow Well', unlockLevel: 2, cooldown: 8, damage: 8, collapseDamage: 26, radius: 250, pull: 920, duration: 2.4, wetDuration: 5.5, slow: .42, holdRadius: .3, holdDuration: .5, color: '#35e7ff', purpose:'Aim a whirlpool into a dangerous pack. It drags enemies into one firing lane, holds them together, Soaks and slows them, then crushes the trapped group. Wet enemies trigger Foxfire Steam Bursts and take 50% more Shock damage.' },
  foxfireVolley: { id: 'foxfireVolley', name: 'Foxfire Volley', unlockLevel: 4, cooldown: 6, damage: 18, speed: 680, life: .95, spread: .18, shots: 5, burnDamage: 6, burnDuration: 4, color: '#ff6a24' },
  wildHeart: { id: 'wildHeart', name: 'Wild Heart', unlockLevel: 6, cooldown: 12, heal: 30, duration: 5, damageReduction: .35, color: '#68ef50' },
  shockPaws: { id: 'shockPaws', name: 'Shock Paws', unlockLevel: 8, cooldown: 23, damage: 16, duration: 5.4, tickRate: .48, wetBonus: .5, color: '#d94cff' }
};

export const STATUS_EFFECTS = {
  burn: { id:'burn', name:'Burn', field:'burnTime', color:'#ff6a24', icon:'♨', description:'Takes repeated fire damage.' },
  wet: { id:'wet', name:'Wet', field:'wetTime', color:'#35e7ff', icon:'◉', description:'Movement is slowed and lightning deals bonus damage.' },
  shock: { id:'shock', name:'Shock', field:'shockTime', color:'#d94cff', icon:'ϟ', description:'Conducting spirit lightning is visibly active.' },
  stun: { id:'stun', name:'Stun', field:'stunTime', color:'#ffd33d', icon:'✦', description:'Actions and movement are briefly interrupted.' }
};

export const ELITE_MODIFIERS = {
  swift: { id:'swift', name:'Swift', icon:'»', color:'#39eaff', healthScale:1.12, speedScale:1.34, damageScale:1.05, cooldownScale:.72, rewardScale:1.35, description:'Moves and attacks much faster.' },
  bulwark: { id:'bulwark', name:'Bulwark', icon:'⬟', color:'#70f06c', healthScale:1.18, speedScale:.88, damageScale:1.08, shieldScale:.48, rewardScale:1.5, description:'Protected by a visible breakable spirit shield.' },
  frenzied: { id:'frenzied', name:'Frenzied', icon:'!', color:'#ff405f', healthScale:1.22, speedScale:1.12, damageScale:1.42, windupScale:.72, rewardScale:1.55, description:'Shorter warnings and brutal damage.' },
  volatile: { id:'volatile', name:'Volatile', icon:'✹', color:'#ff9b32', healthScale:1.08, speedScale:1.08, damageScale:1.12, blastRadius:175, blastDamage:22, rewardScale:1.45, description:'Leaves a delayed spirit explosion on defeat.' },
  splitter: { id:'splitter', name:'Splitter', icon:'◆', color:'#dc55ff', healthScale:1.32, speedScale:.96, damageScale:1.12, splitCount:2, rewardScale:1.6, description:'Splits into two weaker reinforcements on defeat.' }
};

export const BOSS_PATTERNS = {
  sweep: { id:'sweep', name:'Guardian Sweep', windupState:'bossWindupSweep', actionState:'bossSweep', windup:.95, action:.5, resolveAt:.32, recovery:1.05, description:'A huge forward arc. Cross behind the guardian before the weapon commits.' },
  slam: { id:'slam', name:'Spirit Slam', windupState:'bossWindupSlam', actionState:'bossSlam', windup:1.25, action:.58, resolveAt:.34, recovery:1.15, description:'A full-circle impact that stuns. Leave the marked radius before the hammer lands.' },
  channel: { id:'channel', name:'Spirit Barrage', windupState:'bossChannel', actionState:'bossChannel', windup:1.45, action:1.45, resolveAt:.78, recovery:.9, description:'A projectile ritual with open lanes that change by guardian and phase.' },
  crossfire: { id:'crossfire', name:'Sealing Crossfire', windupState:'bossWindupCrossfire', actionState:'bossCrossfire', windup:1.35, action:.62, resolveAt:.46, recovery:1.05, description:'Intersecting spirit lanes lock onto your position. Escape diagonally before they converge.' }
};

export const BOSS_PROFILES = {
  jadeguardTanuki: {
    id:'jadeguardTanuki', sweepRange:390, sweepDamage:18, slamDamage:22, radialBase:10, crossfireDamage:24, crossfireWidth:72, crossfireLanes:2,
    phaseNames:{1:'AWAKENED GUARDIAN',2:'SPIRIT FURY',3:'JADE ENRAGED'},
    schedules:{1:['sweep','slam','channel'],2:['sweep','channel','slam','crossfire'],3:['channel','crossfire','sweep','slam','crossfire']}
  },
  moonfangKomainu: {
    id:'moonfangKomainu', sweepRange:450, sweepDamage:22, slamDamage:27, radialBase:14, crossfireDamage:29, crossfireWidth:78, crossfireLanes:3,
    phaseNames:{1:'AWAKENED GUARDIAN',2:'MOON HUNGER',3:'HOLLOW ENRAGED'},
    schedules:{1:['sweep','slam','channel'],2:['sweep','crossfire','slam','channel'],3:['crossfire','sweep','channel','slam','crossfire']}
  },
  pyreclawShogun: {
    id:'pyreclawShogun', sweepRange:500, sweepDamage:28, slamDamage:32, radialBase:0, crossfireDamage:36, crossfireWidth:84, crossfireLanes:4,
    phaseNames:{1:'AWAKENED GUARDIAN',2:'INFERNO OATH',3:'SHOGUN UNBOUND'},
    schedules:{1:['sweep','slam','channel'],2:['sweep','channel','crossfire','slam'],3:['crossfire','channel','sweep','crossfire','slam','channel']}
  }
};

export const ENEMIES = {
  groveMinion: {
    id: 'groveMinion', name: 'Grove Minion', maxHealth: 58, speed: 118,
    radius: 27, contactDamage: 6, windup: .62, attackRange: 108,
    attackCooldown: 1.55, color: '#75dd55', spriteColumn: 0, scale: .88, behavior: 'basic'
  },
  jadeBrawler: {
    id: 'jadeBrawler', name: 'Jade Brawler', maxHealth: 96, speed: 168,
    radius: 29, contactDamage: 10, windup: 0.44, attackRange: 250,
    attackCooldown: 1.25, color: '#ef435e', spriteColumn: 0, scale: 1, behavior: 'melee'
  },
  spiritArcher: {
    id: 'spiritArcher', name: 'Spirit Archer', maxHealth: 72, speed: 148,
    radius: 27, contactDamage: 9, windup: 0.58, attackRange: 430,
    attackCooldown: 1.72, color: '#30dff5', spriteColumn: 1, scale: .96, behavior: 'ranged'
  },
  armoredBoar: {
    id: 'armoredBoar', name: 'Jadebreaker', maxHealth: 240, speed: 94,
    radius: 43, contactDamage: 18, windup: 1.25, attackRange: 148,
    attackCooldown: 2.75, slamRadius: 128, stunDuration: 1.05,
    color: '#ff9a24', spriteColumn: 2, scale: 1.36, behavior: 'heavy'
  },
  bellweaverCat: {
    id: 'bellweaverCat', name: 'Bellweaver Cat', maxHealth: 148, speed: 118,
    radius: 30, contactDamage: 10, windup: 1.08, attackRange: 520,
    attackCooldown: 4.4, summonCharges: 2, summonCount: 2,
    color: '#57f2b4', scale: 1.18, behavior: 'summoner', biome: 'jade'
  },
  mistclawLynx: {
    id: 'mistclawLynx', name: 'Mistclaw Lynx', maxHealth: 126, speed: 242,
    radius: 29, contactDamage: 19, windup: .68, attackRange: 520,
    attackCooldown: 2.7, blinkOffset: 118, strikeSpeed: 790,
    color: '#bd58ff', scale: 1.12, behavior: 'assassin', biome: 'crimson'
  },
  jadeguardTanuki: {
    id: 'jadeguardTanuki', name: 'Jadeguard Tanuki', maxHealth: 2600, speed: 92,
    radius: 112, contactDamage: 24, windup: 1.15, attackRange: 330,
    attackCooldown: 2.2, slamRadius: 285, stunDuration: 1.2,
    color: '#8cff39', scale: 3.8, behavior: 'boss'
  },
  bambooStalker: {
    id: 'bambooStalker', name: 'Bamboo Stalker', maxHealth: 118, speed: 205,
    radius: 28, contactDamage: 12, windup: .34, attackRange: 255,
    attackCooldown: 1.04, color: '#42f5a7', spriteColumn: 0, scale: 1.04,
    behavior: 'melee', biome: 'bamboo'
  },
  sporeArcher: {
    id: 'sporeArcher', name: 'Spore Archer', maxHealth: 94, speed: 165,
    radius: 28, contactDamage: 12, windup: .5, attackRange: 470,
    attackCooldown: 1.42, color: '#d96aff', spriteColumn: 1, scale: 1.02,
    behavior: 'ranged', biome: 'bamboo'
  },
  mossBrute: {
    id: 'mossBrute', name: 'Moss Brute', maxHealth: 330, speed: 120,
    radius: 47, contactDamage: 24, windup: .92, attackRange: 165,
    attackCooldown: 2.25, slamRadius: 155, stunDuration: 1.15,
    color: '#65e85d', spriteColumn: 2, scale: 1.48,
    behavior: 'heavy', biome: 'bamboo'
  },
  powderkegToad: {
    id: 'powderkegToad', name: 'Powderkeg Toad', maxHealth: 138, speed: 184,
    radius: 32, contactDamage: 16, windup: .82, attackRange: 455,
    attackCooldown: 3.25, bombRadius: 148, bombFuse: 1.05,
    color: '#ff9a31', scale: 1.22, behavior: 'bomber', biome: 'bamboo'
  },
  moonfangKomainu: {
    id: 'moonfangKomainu', name: 'Moonfang Komainu', maxHealth: 5200, speed: 118,
    radius: 120, contactDamage: 32, windup: 1.05, attackRange: 370,
    attackCooldown: 1.85, slamRadius: 330, stunDuration: 1.3,
    color: '#41f5da', scale: 4.1, behavior: 'boss', biome: 'bamboo'
  },
  emberAkita: {
    id: 'emberAkita', name: 'Ember Akita', maxHealth: 152, speed: 228,
    radius: 30, contactDamage: 15, windup: .3, attackRange: 275,
    attackCooldown: .94, color: '#ff5a2d', spriteColumn: 0, scale: 1.08,
    behavior: 'melee', biome: 'crimson'
  },
  gongwing: {
    id: 'gongwing', name: 'Gongwing', maxHealth: 116, speed: 192,
    radius: 29, contactDamage: 15, windup: .43, attackRange: 510,
    attackCooldown: 1.22, color: '#c65cff', spriteColumn: 1, scale: 1.06,
    behavior: 'ranged', biome: 'crimson'
  },
  ironhorn: {
    id: 'ironhorn', name: 'Ironhorn', maxHealth: 425, speed: 132,
    radius: 51, contactDamage: 29, windup: .82, attackRange: 178,
    attackCooldown: 2.05, slamRadius: 178, stunDuration: 1.3,
    color: '#ff8b25', spriteColumn: 2, scale: 1.58,
    behavior: 'heavy', biome: 'crimson'
  },
  gatewardenRhino: {
    id: 'gatewardenRhino', name: 'Gatewarden Rhino', maxHealth: 410, speed: 126,
    radius: 46, contactDamage: 27, windup: .72, attackRange: 174,
    attackCooldown: 2.25, guardScale: .68, guardRecovery: 6.5, stunDuration: .72,
    color: '#ff4b31', scale: 1.52, behavior: 'shield', biome: 'crimson'
  },
  pyreclawShogun: {
    id: 'pyreclawShogun', name: 'Pyreclaw Shogun Tora', maxHealth: 7600, speed: 126,
    radius: 130, contactDamage: 38, windup: .92, attackRange: 400,
    attackCooldown: 1.65, slamRadius: 365, stunDuration: 1.35,
    color: '#ff5b27', scale: 4.45, behavior: 'boss', biome: 'crimson'
  }
};

export const ENCOUNTERS = {
  jadeChapter: {
    id: 'jadeChapter', name: 'The Silent Bells', room: 'jadeCourtyard', rooms: ['jadeCourtyard','jadeMoonbridge','jadeRootGarden','jadeBellTerraces','jadeLanternCanals','jadeWardenProcessional'], bossRoom:'jadeGuardianApproach', boss: 'jadeguardTanuki',
    waves: [
      { name: 'Whispering Scouts', roster: ['groveMinion','groveMinion','groveMinion','groveMinion'], spawnRate: 1.05, healthScale: 1, speedScale: 1, damageScale: 1, mission:{type:'eliminate',title:'SILENCE THE SCOUTS'} },
      { name: 'Broken Shrine Pack', roster: ['groveMinion','jadeBrawler','groveMinion','spiritArcher','groveMinion','jadeBrawler','groveMinion','spiritArcher'], targetCount:10, spawnRate: .62, healthScale: 1.18, speedScale: 1.16, damageScale: 1.12, mission:{type:'rescue',title:'FREE THE BELLKEEPERS',count:2} },
      { name: 'Jade Moon Swarm', roster: ['groveMinion','groveMinion','jadeBrawler','spiritArcher','groveMinion','jadeBrawler','bellweaverCat','spiritArcher','groveMinion','armoredBoar','groveMinion','spiritArcher','jadeBrawler'], targetCount:18, spawnRate: .34, healthScale: 1.43, speedScale: 1.34, damageScale: 1.25, mission:{type:'anchors',title:'SHATTER ROOT ANCHORS',count:3,health:58} },
      { name: 'Guardian Onslaught', roster: ['jadeBrawler','groveMinion','bellweaverCat','jadeBrawler','groveMinion','armoredBoar','spiritArcher','jadeBrawler','groveMinion','spiritArcher','bellweaverCat','armoredBoar','groveMinion','jadeBrawler','spiritArcher','groveMinion','jadeBrawler','bellweaverCat'], targetCount:30, spawnRate: .19, healthScale: 1.72, speedScale: 1.54, damageScale: 1.42, mission:{type:'defend',title:'DEFEND THE JADE WARD',duration:24,health:260} },
      { name:'Bellbreaker Legion',roster:['jadeBrawler','spiritArcher','bellweaverCat','armoredBoar','groveMinion','jadeBrawler','bellweaverCat'],targetCount:48,spawnRate:.115,healthScale:1.98,speedScale:1.78,damageScale:1.58,mission:{type:'anchors',title:'BREAK THE BELL CURSE',count:4,health:88} },
      { name:'Thousand-Paw Siege',roster:['jadeBrawler','bellweaverCat','armoredBoar','spiritArcher','groveMinion','jadeBrawler','armoredBoar','bellweaverCat'],targetCount:72,spawnRate:.068,healthScale:2.26,speedScale:2.05,damageScale:1.78,mission:{type:'defend',title:'HOLD THE WARDEN SEAL',duration:32,health:340} }
    ]
  },
  bambooChapter: {
    id: 'bambooChapter', name: 'Breath Beneath the Reeds', room: 'bambooHollow', rooms: ['bambooHollow','bambooMoonbridge','bambooSporeMarsh','bambooMoonlotusReservoir','bambooSporelightMonastery','bambooMoonstoneCauseway'], bossRoom:'bambooMoonfangBurrow', boss: 'moonfangKomainu',
    waves: [
      { name: 'Reedblade Scouts', roster: ['bambooStalker','bambooStalker','sporeArcher','bambooStalker','sporeArcher','bambooStalker','bambooStalker','sporeArcher'], targetCount:14, spawnRate: .42, healthScale: 1.08, speedScale: 1.12, damageScale: 1.05, mission:{type:'eliminate',title:'CLEAR THE REEDBLADES'} },
      { name: 'Hollow Hunting Party', roster: ['bambooStalker','sporeArcher','bambooStalker','powderkegToad','sporeArcher','bambooStalker','bambooStalker','sporeArcher','bambooStalker','mossBrute','sporeArcher','bambooStalker','bambooStalker','sporeArcher'], spawnRate: .34, healthScale: 1.28, speedScale: 1.16, damageScale: 1.18, mission:{type:'rescue',title:'FREE THE MOON MONKS',count:3} },
      { name: 'Moonroot Stampede', roster: ['bambooStalker','sporeArcher','powderkegToad','mossBrute','bambooStalker','sporeArcher','mistclawLynx','powderkegToad','sporeArcher','bambooStalker','bambooStalker','sporeArcher','mossBrute','bambooStalker','sporeArcher','bambooStalker','mossBrute','sporeArcher','powderkegToad','mistclawLynx','sporeArcher','bambooStalker'], spawnRate: .22, healthScale: 1.5, speedScale: 1.28, damageScale: 1.34, mission:{type:'anchors',title:'BURN THE SPORE TOTEMS',count:3,health:82} },
      { name: 'Moonfang Warpack', roster: ['mossBrute','bambooStalker','powderkegToad','bambooStalker','bambooStalker','sporeArcher','mossBrute','bambooStalker','sporeArcher','powderkegToad','mossBrute','sporeArcher','bambooStalker','bambooStalker','powderkegToad','mossBrute','bambooStalker','sporeArcher','bambooStalker','mossBrute','sporeArcher','powderkegToad','bambooStalker','sporeArcher','mossBrute','bambooStalker','sporeArcher','bambooStalker','mossBrute','powderkegToad'], spawnRate: .15, healthScale: 1.78, speedScale: 1.42, damageScale: 1.52, mission:{type:'defend',title:'DEFEND THE LOTUS WARD',duration:28,health:330} },
      { name:'Sporemoon Deluge',roster:['bambooStalker','sporeArcher','powderkegToad','mistclawLynx','mossBrute','bambooStalker','sporeArcher'],targetCount:84,spawnRate:.062,healthScale:2.08,speedScale:1.82,damageScale:1.7,mission:{type:'rescue',title:'RELEASE THE HOLLOW SAGES',count:4} },
      { name:'Hollow Eclipse',roster:['mossBrute','powderkegToad','mistclawLynx','sporeArcher','bambooStalker','mossBrute','powderkegToad'],targetCount:112,spawnRate:.038,healthScale:2.42,speedScale:2.15,damageScale:1.94,mission:{type:'defend',title:'HOLD THE MOONSTONE SEAL',duration:36,health:430} }
    ]
  },
  crimsonChapter: {
    id: 'crimsonChapter', name: 'The Gate of Ash', room: 'crimsonDojo', rooms: ['crimsonDojo','crimsonBellCourt','crimsonWarYard','crimsonCinderRooftops','crimsonDrumFoundry','crimsonWarProcessional'], bossRoom:'crimsonOniGate', boss: 'pyreclawShogun',
    waves: [
      { name: 'First Bell Challengers', roster: ['emberAkita','gongwing','mistclawLynx','emberAkita','gongwing','emberAkita','gongwing','emberAkita','mistclawLynx','gongwing','emberAkita','gongwing'], spawnRate: .42, healthScale: 1.15, speedScale: 1.1, damageScale: 1.12, mission:{type:'eliminate',title:'WIN THE FIRST BELL'} },
      { name: 'Crimson Trial', roster: ['emberAkita','gongwing','emberAkita','gatewardenRhino','gongwing','emberAkita','emberAkita','gongwing','emberAkita','ironhorn','gongwing','emberAkita','emberAkita','gongwing','gatewardenRhino','emberAkita','gongwing','emberAkita','emberAkita','gongwing'], spawnRate: .26, healthScale: 1.42, speedScale: 1.22, damageScale: 1.28, mission:{type:'anchors',title:'BREAK THE EXECUTION SEALS',count:3,health:105} },
      { name: 'Burning Hundred', roster: ['emberAkita','gongwing','ironhorn','emberAkita','gongwing','emberAkita','emberAkita','gongwing','ironhorn','emberAkita','gongwing','emberAkita','ironhorn','gongwing','emberAkita','emberAkita','gongwing','ironhorn','emberAkita','gongwing','emberAkita','ironhorn','gongwing','emberAkita','emberAkita','gongwing','ironhorn','emberAkita','gongwing','emberAkita'], spawnRate: .16, healthScale: 1.72, speedScale: 1.38, damageScale: 1.48, mission:{type:'rescue',title:'FREE THE ASH PRISONERS',count:3} },
      { name: 'Shogun Warhost', roster: ['gatewardenRhino','emberAkita','gongwing','emberAkita','emberAkita','gongwing','ironhorn','emberAkita','gongwing','gatewardenRhino','ironhorn','gongwing','emberAkita','emberAkita','gongwing','gatewardenRhino','emberAkita','gongwing','emberAkita','ironhorn','gongwing','emberAkita','emberAkita','gongwing','gatewardenRhino','emberAkita','gongwing','emberAkita','ironhorn','gongwing','emberAkita','emberAkita','gongwing','gatewardenRhino','emberAkita','gongwing','emberAkita','ironhorn','gongwing','emberAkita','gatewardenRhino','gongwing'], spawnRate: .105, healthScale: 2.06, speedScale: 1.55, damageScale: 1.72, mission:{type:'defend',title:'DEFEND THE ANCESTRAL FLAME',duration:30,health:390} },
      { name:'Ashen Clan Avalanche',roster:['gatewardenRhino','emberAkita','gongwing','ironhorn','mistclawLynx','emberAkita','gongwing'],targetCount:112,spawnRate:.041,healthScale:2.44,speedScale:2.02,damageScale:1.98,mission:{type:'anchors',title:'DESTROY THE ONI CHAINS',count:5,health:132} },
      { name:'Oni Gate Cataclysm',roster:['gatewardenRhino','ironhorn','mistclawLynx','gongwing','emberAkita','gatewardenRhino','gongwing','ironhorn'],targetCount:150,spawnRate:.026,healthScale:2.88,speedScale:2.35,damageScale:2.28,mission:{type:'defend',title:'HOLD THE SHOGUN SEAL',duration:40,health:520} }
    ]
  }
};

export const DIFFICULTIES = {
  spirited: { id:'spirited', name:'Spirited', healthScale:.86, speedScale:.92, damageScale:.82, rewardScale:.9, enemyCountScale:.86, spawnRateScale:.9, description:'A fair campaign with gentler enemy pressure.' },
  ferocious: { id:'ferocious', name:'Ferocious', healthScale:1, speedScale:1, damageScale:1, rewardScale:1, enemyCountScale:1, spawnRateScale:1, description:'The intended hard BrawlPaws experience.' },
  nightmare: { id:'nightmare', name:'Nightmare', healthScale:1.38, speedScale:1.18, damageScale:1.32, rewardScale:1.4, enemyCountScale:1.18, spawnRateScale:1.15, description:'Relentless speed, larger packs, stronger spirits, and richer rewards.' },
  ascension: { id:'ascension', name:'Ascension', healthScale:1.56, speedScale:1.24, damageScale:1.48, rewardScale:1.7, enemyCountScale:1.25, spawnRateScale:1.22, description:'A post-clear climb that adds enemies and scales again after every victory.' }
};

export const ROOMS = {
  spiritVillage: {
    id: 'spiritVillage', name: 'Spirit Lantern Village', width: 4800, height: 2700,
    background: 'assets/environment/spirit-lantern-village.png',
    playerSpawn: { x: 2400, y: 1480 },
    enemySpawns: [],
    combatBounds: { x: 2400, y: 1460, radiusX: 1780, radiusY: 980 }
  },
  spiritDojo: {
    id:'spiritDojo', name:'Spirit Dojo', width:4800, height:2700,
    background:'assets/environment/crimson-dojo-arena.png', playerSpawn:{x:2800,y:1650}, enemySpawns:[], ambient:'dojo', spawnLane:.58, spawnLaneStep:.04,
    combatBounds:{x:2400,y:1450,radiusX:1640,radiusY:820}
  },
  jadeCourtyard: {
    id: 'jadeCourtyard', name: 'Jade Grove Ruins', width: 4800, height: 2700,
    background: 'assets/environment/jade-grove-arena.png',
    playerSpawn: { x: 2400, y: 1540 },
    enemySpawns: [
      { x: 2050, y: 1160, type: 'groveMinion', delay: 1.2 },
      { x: 2760, y: 1150, type: 'groveMinion', delay: 3.2 },
      { x: 1740, y: 1580, type: 'groveMinion', delay: 6 },
      { x: 3070, y: 1620, type: 'jadeBrawler', delay: 8.5 },
      { x: 1550, y: 900, type: 'spiritArcher', delay: 11.5 },
      { x: 3270, y: 920, type: 'spiritArcher', delay: 14 },
      { x: 2400, y: 660, type: 'armoredBoar', delay: 17 }
    ],
    combatBounds: { x: 2400, y: 1420, radiusX: 1900, radiusY: 1040 }
  },
  jadeMoonbridge: {
    id:'jadeMoonbridge', name:'Moonbridge Crossing', width:4800, height:2700,
    background:'assets/environment/jade-moonbridge.png', playerSpawn:{x:2100,y:1800}, enemySpawns:[], ambient:'river',spawnLane:.66,spawnLaneStep:.045,
    combatBounds:{x:2410,y:1430,radiusX:1500,radiusY:780}
  },
  jadeRootGarden: {
    id:'jadeRootGarden', name:'Corrupted Root Garden', width:4800, height:2700,
    background:'assets/environment/jade-root-garden.png', playerSpawn:{x:2400,y:1820}, enemySpawns:[], ambient:'roots',spawnLane:.55,spawnLaneStep:.05,
    combatBounds:{x:2400,y:1440,radiusX:1650,radiusY:840}
  },
  jadeBellTerraces: {
    id:'jadeBellTerraces',name:'Jade Bell Terraces',width:4800,height:2700,background:'assets/environment/jade-bell-terraces.png',playerSpawn:{x:2340,y:1810},enemySpawns:[],ambient:'bells',spawnLane:.6,spawnLaneStep:.046,
    combatBounds:{x:2400,y:1430,radiusX:1740,radiusY:900}
  },
  jadeLanternCanals: {
    id:'jadeLanternCanals',name:'Whispering Lantern Canals',width:4800,height:2700,background:'assets/environment/jade-lantern-canals.png',playerSpawn:{x:2400,y:1840},enemySpawns:[],ambient:'river',spawnLane:.58,spawnLaneStep:.044,
    combatBounds:{x:2400,y:1435,radiusX:1700,radiusY:880}
  },
  jadeGuardianApproach: {
    id:'jadeGuardianApproach', name:'Jadeguard Approach', width:4800, height:2700,
    background:'assets/environment/jade-guardian-approach.png', playerSpawn:{x:2400,y:1900}, enemySpawns:[], ambient:'corruption',spawnLane:.66,spawnLaneStep:.04,
    combatBounds:{x:2400,y:1500,radiusX:1550,radiusY:750}
  },
  jadeWardenProcessional: {
    id:'jadeWardenProcessional',name:'Jade Warden Processional',width:4800,height:2700,background:'assets/environment/jade-warden-processional.png',playerSpawn:{x:2400,y:1870},enemySpawns:[],ambient:'corruption',spawnLane:.61,spawnLaneStep:.04,
    combatBounds:{x:2400,y:1460,radiusX:1730,radiusY:890}
  },
  bambooHollow: {
    id: 'bambooHollow', name: 'Bamboo Hollow', width: 4800, height: 2700,
    background: 'assets/environment/bamboo-hollow-arena.png',
    playerSpawn: { x: 2400, y: 1540 },
    enemySpawns: [],
    combatBounds: { x: 2400, y: 1420, radiusX: 1900, radiusY: 1040 }
  },
  bambooMoonbridge: {
    id:'bambooMoonbridge', name:'Moonlit Reedbridge', width:4800, height:2700,
    background:'assets/environment/bamboo-moonbridge.png', playerSpawn:{x:2050,y:1790}, enemySpawns:[], ambient:'moonriver', spawnLane:.63, spawnLaneStep:.045,
    combatBounds:{x:2400,y:1430,radiusX:1540,radiusY:790}
  },
  bambooSporeMarsh: {
    id:'bambooSporeMarsh', name:'Spore Shrine Marsh', width:4800, height:2700,
    background:'assets/environment/bamboo-spore-marsh.png', playerSpawn:{x:2400,y:1810}, enemySpawns:[], ambient:'spores', spawnLane:.58, spawnLaneStep:.05,
    combatBounds:{x:2400,y:1440,radiusX:1640,radiusY:840}
  },
  bambooMoonlotusReservoir: {
    id:'bambooMoonlotusReservoir',name:'Moonlotus Reservoir',width:4800,height:2700,background:'assets/environment/bamboo-moonlotus-reservoir.png',playerSpawn:{x:2360,y:1810},enemySpawns:[],ambient:'moonriver',spawnLane:.59,spawnLaneStep:.045,
    combatBounds:{x:2400,y:1430,radiusX:1710,radiusY:885}
  },
  bambooSporelightMonastery: {
    id:'bambooSporelightMonastery',name:'Sporelight Monastery',width:4800,height:2700,background:'assets/environment/bamboo-sporelight-monastery.png',playerSpawn:{x:2420,y:1820},enemySpawns:[],ambient:'spores',spawnLane:.57,spawnLaneStep:.043,
    combatBounds:{x:2400,y:1430,radiusX:1690,radiusY:870}
  },
  bambooMoonfangBurrow: {
    id:'bambooMoonfangBurrow', name:'Moonfang Burrow', width:4800, height:2700,
    background:'assets/environment/bamboo-moonfang-burrow.png', playerSpawn:{x:2400,y:1880}, enemySpawns:[], ambient:'mooncurse', spawnLane:.64, spawnLaneStep:.04,
    combatBounds:{x:2400,y:1500,radiusX:1540,radiusY:760}
  },
  bambooMoonstoneCauseway: {
    id:'bambooMoonstoneCauseway',name:'Hollow Moonstone Causeway',width:4800,height:2700,background:'assets/environment/bamboo-moonstone-causeway.png',playerSpawn:{x:2400,y:1860},enemySpawns:[],ambient:'mooncurse',spawnLane:.61,spawnLaneStep:.04,
    combatBounds:{x:2400,y:1450,radiusX:1720,radiusY:885}
  },
  crimsonDojo: {
    id: 'crimsonDojo', name: 'Crimson Dojo', width: 4800, height: 2700,
    background: 'assets/environment/crimson-dojo-arena.png',
    playerSpawn: { x: 2400, y: 1540 },
    enemySpawns: [],
    combatBounds: { x: 2400, y: 1420, radiusX: 1940, radiusY: 1060 }
  },
  crimsonBellCourt: {
    id:'crimsonBellCourt', name:'Ember Bell Court', width:4800, height:2700,
    background:'assets/environment/crimson-bell-court.png', playerSpawn:{x:2180,y:1830}, enemySpawns:[], ambient:'bells', spawnLane:.64, spawnLaneStep:.045,
    combatBounds:{x:2400,y:1450,radiusX:1620,radiusY:820}
  },
  crimsonWarYard: {
    id:'crimsonWarYard', name:'Ashen War Yard', width:4800, height:2700,
    background:'assets/environment/crimson-war-yard.png', playerSpawn:{x:2400,y:1840}, enemySpawns:[], ambient:'ash', spawnLane:.61, spawnLaneStep:.05,
    combatBounds:{x:2400,y:1450,radiusX:1660,radiusY:840}
  },
  crimsonCinderRooftops: {
    id:'crimsonCinderRooftops',name:'Cinder Pagoda Rooftops',width:4800,height:2700,background:'assets/environment/crimson-cinder-rooftops.png',playerSpawn:{x:2380,y:1830},enemySpawns:[],ambient:'inferno',spawnLane:.6,spawnLaneStep:.044,
    combatBounds:{x:2400,y:1435,radiusX:1730,radiusY:890}
  },
  crimsonDrumFoundry: {
    id:'crimsonDrumFoundry',name:'Ashen Drum Foundry',width:4800,height:2700,background:'assets/environment/crimson-drum-foundry.png',playerSpawn:{x:2420,y:1840},enemySpawns:[],ambient:'ash',spawnLane:.58,spawnLaneStep:.042,
    combatBounds:{x:2400,y:1440,radiusX:1710,radiusY:880}
  },
  crimsonOniGate: {
    id:'crimsonOniGate', name:'Oni Gate Throne', width:4800, height:2700,
    background:'assets/environment/crimson-oni-gate.png', playerSpawn:{x:2400,y:1900}, enemySpawns:[], ambient:'inferno', spawnLane:.64, spawnLaneStep:.04,
    combatBounds:{x:2400,y:1500,radiusX:1550,radiusY:760}
  }
  ,crimsonWarProcessional: {
    id:'crimsonWarProcessional',name:'Shogun War Processional',width:4800,height:2700,background:'assets/environment/crimson-war-processional.png',playerSpawn:{x:2400,y:1870},enemySpawns:[],ambient:'inferno',spawnLane:.61,spawnLaneStep:.04,
    combatBounds:{x:2400,y:1450,radiusX:1740,radiusY:895}
  }
};
