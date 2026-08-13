export const HEROES = {
  kitsune: {
    id: 'kitsune', name: 'Kitsune', role: 'Speedster', maxHealth: 120,
    speed: 305, acceleration: 2050, drag: 10.5, radius: 30,
    dashSpeed: 980, dashDuration: 0.15, dashCooldown: 0.88, dashInvulnerability: 0.22,
    weapon: 'spiritBlaster', dashName: 'Fox Step', passiveName: 'Quickstep',
    summary: 'A precision gunner who wins through speed, range, and rapid critical pressure.',
    ratings: { power:3, toughness:2, mobility:5, control:3 }, difficulty:'Technical',
    damageTakenMultiplier: 1, knockbackResistance: 1,
    portrait: 'assets/characters/kitsune-portrait.png', moveAsset: 'kitsune', fireAsset: 'kitsuneFire', stateAsset: 'kitsuneStates', accent: '#45eaff'
  },
  bamboo: {
    id: 'bamboo', name: 'Bamboo', role: 'Tank', maxHealth: 185,
    speed: 258, acceleration: 1500, drag: 9.2, radius: 38,
    dashSpeed: 720, dashDuration: 0.18, dashCooldown: 1.12, dashInvulnerability: 0.24,
    weapon: 'bambooCannon', dashName: 'Iron Roll', passiveName: 'Iron Belly',
    summary: 'A cannon tank who absorbs punishment and controls packs with heavy spread fire.',
    ratings: { power:4, toughness:5, mobility:2, control:4 }, difficulty:'Steady',
    damageTakenMultiplier: .82, knockbackResistance: .52,
    portrait: 'assets/characters/bamboo-portrait.png', moveAsset: 'bamboo', fireAsset: 'bambooFire', stateAsset: 'bambooStates', accent: '#6af27a'
  },
  hopscotch: {
    id: 'hopscotch', name: 'Hopscotch', role: 'Archer', maxHealth: 105,
    speed: 305, acceleration: 1960, drag: 10.2, radius: 28,
    dashSpeed: 900, dashDuration: 0.14, dashCooldown: 1.02, dashInvulnerability: 0.21,
    weapon: 'spiritLongbow', dashName: 'Moon Hop', passiveName: 'Perfect Draw',
    summary: 'A precision archer who commits to a visible bow draw, then releases piercing spirit arrows through lined-up enemies.',
    ratings: { power:4, toughness:2, mobility:4, control:4 }, difficulty:'Expert',
    damageTakenMultiplier: 1.06, knockbackResistance: 1.08,
    portrait: 'assets/characters/hopscotch-portrait.png', moveAsset: 'hopscotch', fireAsset: 'hopscotchFire', stateAsset: 'hopscotchStates', accent: '#ff4fa5',
    unlockRequirement:'Complete the five-chapter campaign once.'
  },
  rusty: {
    id:'rusty',name:'Rusty',role:'Trickshot',maxHealth:112,
    speed:318,acceleration:2050,drag:10.4,radius:29,
    dashSpeed:930,dashDuration:.145,dashCooldown:.94,dashInvulnerability:.22,
    weapon:'twinTrickshots',dashName:'Back Alley Slip',passiveName:'Bank Shot',naturalDual:true,
    summary:'A dual-revolver rogue whose precision rounds rebound into a second enemy and reward clever target lines.',
    ratings:{power:4,toughness:2,mobility:4,control:3},difficulty:'Advanced',
    damageTakenMultiplier:1.03,knockbackResistance:.96,
    portrait:'assets/characters/rusty-portrait.png',moveAsset:'rusty',fireAsset:'rustyFire',stateAsset:'rustyStates',accent:'#ff9b32',
    directionMap:[2,1,0,7,6,5,4,3],unlockRequirement:'Clear one Ascension campaign.'
  },
  zap: {
    id:'zap',name:'Zap',role:'Techie',maxHealth:110,
    speed:300,acceleration:1980,drag:10.2,radius:28,
    dashSpeed:910,dashDuration:.145,dashCooldown:.98,dashInvulnerability:.22,
    weapon:'arcCasters',dashName:'Static Skip',passiveName:'Conductive Loop',naturalDual:true,
    summary:'A paired arc-caster techie who marks enemies Conductive, then turns the third hit into a controlled lightning chain through the pack.',
    ratings:{power:3,toughness:2,mobility:4,control:5},difficulty:'Technical',
    damageTakenMultiplier:1.04,knockbackResistance:1,
    portrait:'assets/characters/zap-portrait-v1.png',moveAsset:'zap',fireAsset:'zapFire',stateAsset:'zapStates',accent:'#39eaff',
    unlockRequirement:'Complete two full campaigns.'
  },
  nomi: {
    id:'nomi',name:'Nomi',role:'Spirit Lancer',maxHealth:114,
    speed:312,acceleration:2020,drag:10.3,radius:29,
    dashSpeed:920,dashDuration:.145,dashCooldown:.96,dashInvulnerability:.22,
    weapon:'moonreturnGlaive',dashName:'Feather Drift',passiveName:'Second Passage',
    summary:'A ranged spirit-lancer whose thrown moon glaive cuts through a line, turns, and strikes the pack again on its return.',
    ratings:{power:4,toughness:2,mobility:4,control:5},difficulty:'Advanced',
    damageTakenMultiplier:1.03,knockbackResistance:.96,
    portrait:'assets/characters/nomi-portrait-v1.png',moveAsset:'nomi',fireAsset:'nomiFire',stateAsset:'nomiStates',accent:'#b65cff',
    unlockRequirement:'Defeat Tsukiko and complete the six-chapter campaign.'
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
  },
  arcCasters: {
    id:'arcCasters',name:'Twin Arc Casters',damage:4,fireRate:.29,
    projectileSpeed:1040,projectileLife:1.02,range:1060,
    knockback:165,criticalChance:.1,shots:1,spread:0,
    projectileRadius:8,attackDuration:.2,muzzleDistance:49,
    recoil:28,color:'#40eaff',impactColor:'#ffd43b',projectileType:'arc',baseVolleys:2,
    chainThreshold:3,chainRange:360,chainTargets:2,chainDamage:.55,
    summary:'Paired low-damage pulses build Conductive marks; the third hit discharges a controlled chain into nearby enemies.',tags:['DUAL','CONDUCTIVE','CHAIN']
  },
  moonreturnGlaive: {
    id:'moonreturnGlaive',name:'Moonreturn Glaive',damage:10,fireRate:.62,
    projectileSpeed:900,projectileLife:.62,range:980,
    knockback:240,criticalChance:.13,shots:1,spread:0,
    projectileRadius:18,attackDuration:.52,releaseDelay:.27,muzzleDistance:60,
    recoil:30,color:'#aeefff',impactColor:'#b65cff',projectileType:'glaive',pierces:5,returnSpeed:1120,
    summary:'Throw a crescent through a line. It turns at maximum reach and can cut every target again while returning to Nomi.',tags:['RETURN','PIERCE','LINE CONTROL']
  },
  frostbiteNeedle: {
    id:'frostbiteNeedle',name:'Frostbite Needle',damage:6,fireRate:.36,
    projectileSpeed:1180,projectileLife:1.08,range:1270,
    knockback:125,criticalChance:.12,shots:1,spread:0,
    projectileRadius:8,attackDuration:.2,muzzleDistance:54,
    recoil:24,color:'#67edff',impactColor:'#c9fbff',projectileType:'frost',chillThreshold:3,freezeDuration:1.15,
    summary:'Rapid ice needles stack Chill. The third hit visibly freezes normal enemies and briefly interrupts guardians.',tags:['CHILL','FREEZE','PRECISION']
  },
  oniMortar: {
    id:'oniMortar',name:'Oni Mortar',damage:7,fireRate:.82,
    projectileSpeed:620,projectileLife:.86,range:535,
    knockback:420,criticalChance:.06,shots:1,spread:0,
    projectileRadius:15,attackDuration:.34,muzzleDistance:60,
    recoil:92,color:'#ff8a24',impactColor:'#ffd069',projectileType:'mortar',blastRadius:205,blastDamage:19,
    summary:'A deliberate arcing shell detonates in a broad Oni blast, trading speed for pack-clearing force.',tags:['AREA','DEMOLITION','HEAVY']
  },
  galeWarFan: {
    id:'galeWarFan',name:'Gale War Fan',damage:8,fireRate:.54,
    projectileSpeed:850,projectileLife:.6,range:930,
    knockback:315,criticalChance:.11,shots:1,spread:0,
    projectileRadius:18,attackDuration:.3,muzzleDistance:58,
    recoil:34,color:'#bffcff',impactColor:'#67efff',projectileType:'gale',pierces:5,returnSpeed:1060,
    summary:'A wide spirit fan carves through a line, turns at maximum reach, and knocks the pack aside again on return.',tags:['RETURN','WIDE','CONTROL']
  },
  embercoilRepeater: {
    id:'embercoilRepeater',name:'Embercoil Repeater',damage:5,fireRate:.42,
    projectileSpeed:1080,projectileLife:.88,range:950,
    knockback:155,criticalChance:.1,shots:3,spread:.055,
    projectileRadius:9,attackDuration:.24,muzzleDistance:58,
    recoil:54,color:'#ff5b27',impactColor:'#ffd052',projectileType:'embercoil',burnDuration:2.8,burnPower:.68,ruptureEvery:4,
    summary:'A three-barrel spirit repeater opens burning wounds; every fourth volley ignites a compact pack rupture.',tags:['BURST','BURN','RUPTURE']
  },
  tempestChakram: {
    id:'tempestChakram',name:'Tempest Chakram',damage:11,fireRate:.68,
    projectileSpeed:820,projectileLife:.72,range:980,
    knockback:355,criticalChance:.12,shots:1,spread:0,
    projectileRadius:24,attackDuration:.34,muzzleDistance:62,
    recoil:38,color:'#5deeff',impactColor:'#d8ffff',projectileType:'chakram',pierces:8,returnSpeed:1180,
    summary:'A broad moon-ring cleaves an entire lane, turns at maximum reach, and cuts the displaced pack again on return.',tags:['RETURN','WIDE','LANE CONTROL']
  },
  moonpiercerRailbow: {
    id:'moonpiercerRailbow',name:'Moonpiercer Railbow',damage:28,fireRate:.98,
    projectileSpeed:1480,projectileLife:1.05,range:1550,
    knockback:420,criticalChance:.2,shots:1,spread:0,
    projectileRadius:13,attackDuration:.76,releaseDelay:.48,muzzleDistance:68,
    recoil:110,color:'#b55cff',impactColor:'#f4dcff',projectileType:'railbow',pierces:7,
    summary:'A deliberate moon-charge fires through a full enemy column, rewarding alignment with brutal precision damage.',tags:['CHARGE','PIERCE','EXECUTION']
  }
};

export const ABILITIES = {
  undertowWell: { id: 'undertowWell', name: 'Undertow Well', castHook:'vortex', evolutionHook:'doubleCollapse', unlockLevel: 2, cooldown: 8, damage: 8, collapseDamage: 26, radius: 250, pull: 920, duration: 2.4, wetDuration: 5.5, slow: .42, holdRadius: .3, holdDuration: .5, color: '#35e7ff', purpose:'Aim a whirlpool into a dangerous pack. It drags enemies into one firing lane, holds them together, Soaks and slows them, then crushes the trapped group. Wet enemies trigger Foxfire Steam Bursts and take 50% more Shock damage.' },
  foxfireVolley: { id: 'foxfireVolley', name: 'Foxfire Volley', castHook:'flameFan', evolutionHook:'nineTail', unlockLevel: 4, cooldown: 6, damage: 18, speed: 680, life: .95, spread: .18, shots: 5, burnDamage: 6, burnDuration: 4, color: '#ff6a24' },
  wildHeart: { id: 'wildHeart', name: 'Wild Heart', castHook:'heartWard', evolutionHook:'guardianBloom', expiryHook:'guardianBloom', unlockLevel: 6, cooldown: 12, heal: 30, duration: 5, damageReduction: .35, color: '#68ef50' },
  shockPaws: { id: 'shockPaws', name: 'Shock Paws', castHook:'globalStorm', evolutionHook:'heavensVerdict', unlockLevel: 8, cooldown: 23, damage: 16, duration: 5.4, tickRate: .48, wetBonus: .5, color: '#d94cff' }
};

export const STATUS_EFFECTS = {
  burn: { id:'burn', name:'Burn', field:'burnTime', color:'#ff6a24', icon:'♨', reaction:'burn', vfx:'burn', targets:['enemy'], description:'Takes repeated fire damage until the flame expires.' },
  wet: { id:'wet', name:'Wet', field:'wetTime', color:'#35e7ff', icon:'◉', reaction:'wet', vfx:'wet', targets:['enemy'], description:'Movement is slowed and lightning deals bonus damage.' },
  shock: { id:'shock', name:'Shock', field:'shockTime', color:'#d94cff', icon:'ϟ', reaction:'shock', vfx:'shock', targets:['enemy'], description:'Conducting spirit lightning is visibly active.' },
  chill: { id:'chill', name:'Chill', field:'chillTime', color:'#67edff', icon:'❄', reaction:'frost', vfx:'chill', targets:['enemy'], description:'Ice stacks reduce movement. Enough stacks become Freeze.' },
  freeze: { id:'freeze', name:'Freeze', field:'freezeTime', color:'#d9fdff', icon:'✧', reaction:'freeze', vfx:'freeze', targets:['enemy'], description:'Movement and actions stop briefly while the frozen body remains visible.' },
  stun: { id:'stun', name:'Stun', field:'stunTime', color:'#ffd33d', icon:'✦', reaction:'stun', targets:['player','enemy'], description:'Actions and movement are briefly interrupted.' },
  bleed: { id:'bleed', name:'Bleed', field:'bleedTime', color:'#ff365f', icon:'〽', reaction:'bleed', vfx:'bleed', targets:['player','enemy'], description:'Movement tears the spirit wound open and triggers recurring damage.' },
  curse: { id:'curse', name:'Curse', field:'curseTime', color:'#b84dff', icon:'☾', reaction:'curse', vfx:'curse', targets:['player','enemy'], description:'The next incoming strike shatters the mark for amplified damage.' },
  shield: { id:'shield', name:'Ward', field:'shieldTime', color:'#72f0a0', icon:'⬡', reaction:'shield', targets:['player','enemy'], description:'A visible spirit barrier absorbs damage before health is lost.' }
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
  crossfire: { id:'crossfire', name:'Sealing Crossfire', windupState:'bossWindupCrossfire', actionState:'bossCrossfire', windup:1.35, action:.62, resolveAt:.46, recovery:1.05, description:'Intersecting spirit lanes lock onto your position. Escape diagonally before they converge.' },
  signature: { id:'signature', name:'Guardian Signature', windupState:'bossWindupSignature', actionState:'bossSignature', windup:1.55, action:1.25, resolveAt:.9, recovery:1.3, description:'Each guardian reveals a unique ritual with its own warning and escape rule.' }
};

export const BOSS_PROFILES = {
  jadeguardTanuki: {
    id:'jadeguardTanuki', sweepRange:390, sweepDamage:18, slamDamage:22, radialBase:10, crossfireDamage:24, crossfireWidth:72, crossfireLanes:2,
    phaseTempo:{1:1,2:.93,3:.82},domainIntervals:{2:9.2,3:6.7},domainName:'BELLSTORM DOMAIN',
    signatureName:'Thousand-Bell Spiral',signatureRow:0,signatureDamage:24,signatureDescription:'Jade bells wind into a rotating projectile spiral. Read the gaps and rotate with them.',
    phaseNames:{1:'AWAKENED GUARDIAN',2:'SPIRIT FURY',3:'JADE ENRAGED'},
    schedules:{1:['sweep','slam','channel'],2:['signature','sweep','channel','slam','crossfire'],3:['signature','channel','crossfire','sweep','slam','signature']},counterPattern:'slam',counterName:'HAMMER BURIED',counterDuration:1.8,counterMultiplier:1.45
  },
  moonfangKomainu: {
    id:'moonfangKomainu', sweepRange:450, sweepDamage:22, slamDamage:27, radialBase:14, crossfireDamage:29, crossfireWidth:78, crossfireLanes:3,
    phaseTempo:{1:1,2:.9,3:.76},domainIntervals:{2:8.2,3:5.8},domainName:'MOONBLOOM DOMAIN',
    signatureName:'Lunar Hunt',signatureRow:1,signatureDamage:31,signatureDescription:'Three moon-claw marks predict your path, then collapse in sequence. Change direction after they lock.',
    phaseNames:{1:'AWAKENED GUARDIAN',2:'MOON HUNGER',3:'HOLLOW ENRAGED'},
    schedules:{1:['sweep','slam','channel'],2:['signature','sweep','crossfire','slam','channel'],3:['signature','crossfire','sweep','channel','slam','signature']},counterPattern:'signature',counterName:'MOONFANG EXPOSED',counterDuration:1.65,counterMultiplier:1.42
  },
  pyreclawShogun: {
    id:'pyreclawShogun', sweepRange:500, sweepDamage:28, slamDamage:32, radialBase:0, crossfireDamage:36, crossfireWidth:84, crossfireLanes:4,
    phaseTempo:{1:.96,2:.86,3:.72},domainIntervals:{2:7.2,3:4.9},domainName:'ONI-FIRE DOMAIN',
    signatureName:'Oni Eruption',signatureRow:2,signatureDamage:42,signatureDescription:'Oni seals bloom beneath your escape routes and erupt one after another. Keep moving through the open seam.',
    phaseNames:{1:'AWAKENED GUARDIAN',2:'INFERNO OATH',3:'SHOGUN UNBOUND'},
    schedules:{1:['sweep','signature','slam','channel'],2:['signature','sweep','channel','crossfire','slam'],3:['signature','crossfire','channel','sweep','signature','slam','channel']},counterPattern:'channel',counterName:'FLAME CORE OPEN',counterDuration:1.5,counterMultiplier:1.4
  },
  raijinKirin: {
    id:'raijinKirin', sweepRange:545, sweepDamage:34, slamDamage:40, radialBase:20, crossfireDamage:46, crossfireWidth:92, crossfireLanes:5,
    phaseTempo:{1:.92,2:.8,3:.66},domainIntervals:{2:6.4,3:4.25},domainName:'TEMPEST EYE',
    signatureName:'Heaven-Splitter Judgment',signatureRow:0,signatureDamage:54,signatureDescription:'The Kirin brands five escape routes with tide sigils, then calls down a moving wall of judgment. Never stop changing lanes.',
    phaseNames:{1:'STORM GUARDIAN',2:'TEMPEST CROWN',3:'HEAVEN UNBOUND'},
    schedules:{1:['sweep','slam','channel','signature'],2:['signature','crossfire','sweep','channel','slam'],3:['signature','crossfire','channel','sweep','signature','slam','crossfire']},counterPattern:'crossfire',counterName:'STORM CROWN GROUNDED',counterDuration:1.35,counterMultiplier:1.38
  },
  daikyoOni: {
    id:'daikyoOni', sweepRange:590, sweepDamage:41, slamDamage:48, radialBase:24, crossfireDamage:55, crossfireWidth:98, crossfireLanes:6,
    phaseTempo:{1:.88,2:.74,3:.59},domainIntervals:{2:5.8,3:3.75},domainName:'SYSTEM OVERRIDE',
    signatureName:'Oni Kernel Collapse',signatureRow:0,signatureDamage:63,signatureDescription:'Daikyo brands six circuits around your predicted route, then crashes the entire arena kernel in sequence. Keep a diagonal escape lane open.',
    phaseNames:{1:'CORE SENTINEL',2:'OVERRIDE PROTOCOL',3:'ONI KERNEL UNBOUND'},
    schedules:{1:['sweep','channel','slam','signature'],2:['signature','crossfire','sweep','channel','slam','crossfire'],3:['signature','crossfire','channel','sweep','signature','slam','crossfire','channel']},counterPattern:'signature',counterName:'KERNEL EXPOSED',counterDuration:1.2,counterMultiplier:1.36
  },
  tsukikoEmpress: {
    id:'tsukikoEmpress', sweepRange:640, sweepDamage:48, slamDamage:58, radialBase:28, crossfireDamage:63, crossfireWidth:108, crossfireLanes:7,
    phaseTempo:{1:.84,2:.69,3:.54},domainIntervals:{2:5.15,3:3.15},domainName:'ECLIPSE SOVEREIGNTY',
    signatureName:'Hollow Moon Descent',signatureRow:0,signatureDamage:72,signatureDescription:'Tsukiko seals your predicted route beneath a hollow moon, then collapses every shadow inward. Break direction after the last seal locks.',
    phaseNames:{1:'HOLLOW EMPRESS',2:'SIX-TAIL ECLIPSE',3:'MOON WITHOUT DAWN'},
    schedules:{1:['sweep','signature','channel','slam'],2:['signature','crossfire','sweep','channel','slam','signature'],3:['signature','crossfire','channel','sweep','signature','slam','crossfire','signature','channel']},counterPattern:'signature',counterName:'HOLLOW MOON FRACTURES',counterDuration:1.05,counterMultiplier:1.34
  }
};

export const ENEMIES = {
  groveMinion: {
    id: 'groveMinion', name: 'Grove Minion', maxHealth: 58, speed: 220,
    radius: 27, contactDamage: 6, windup: .62, attackRange: 108,
    attackCooldown: 1.55, color: '#75dd55', spriteColumn: 0, scale: .88, behavior: 'basic'
  },
  jadeBrawler: {
    id: 'jadeBrawler', name: 'Jade Brawler', maxHealth: 96, speed: 252,
    radius: 29, contactDamage: 10, windup: 0.44, attackRange: 250,
    attackCooldown: 1.25, color: '#ef435e', spriteColumn: 0, scale: 1, behavior: 'melee'
  },
  spiritArcher: {
    id: 'spiritArcher', name: 'Spirit Archer', maxHealth: 72, speed: 184,
    radius: 27, contactDamage: 9, windup: 0.58, attackRange: 430,
    attackCooldown: 1.72, color: '#30dff5', spriteColumn: 1, scale: .96, behavior: 'ranged'
  },
  armoredBoar: {
    id: 'armoredBoar', name: 'Jadebreaker', maxHealth: 240, speed: 132,
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
    id: 'bambooStalker', name: 'Bamboo Stalker', maxHealth: 118, speed: 262,
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
    id: 'emberAkita', name: 'Ember Akita', maxHealth: 152, speed: 278,
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
  },
  tidebladeOtter: {
    id:'tidebladeOtter', name:'Tideblade Otter', maxHealth:210, speed:248,
    radius:31, contactDamage:21, windup:.27, attackRange:292, attackCooldown:.82,
    color:'#31e8ff', spriteColumn:0, scale:1.14, behavior:'melee', biome:'storm'
  },
  galecrestGull: {
    id:'galecrestGull', name:'Galecrest Gull', maxHealth:164, speed:208,
    radius:30, contactDamage:20, windup:.39, attackRange:590, attackCooldown:1.08,
    color:'#ae75ff', spriteColumn:1, scale:1.12, behavior:'ranged', biome:'storm'
  },
  reefbreakerWalrus: {
    id:'reefbreakerWalrus', name:'Reefbreaker Walrus', maxHealth:590, speed:146,
    radius:55, contactDamage:36, windup:.74, attackRange:195, attackCooldown:1.82, slamRadius:194, stunDuration:1.42,
    color:'#56dfff', spriteColumn:2, scale:1.68, behavior:'heavy', biome:'storm'
  },
  tidechantHeron: {
    id:'tidechantHeron', name:'Tidechant Heron', maxHealth:390, speed:178,
    radius:35, contactDamage:27, windup:1.05, attackRange:680, attackCooldown:4.25,
    surgeWidth:88, surgeDamage:24, color:'#74f5ff', scale:1.12, behavior:'conductor', biome:'storm'
  },
  raijinKirin: {
    id:'raijinKirin', name:'Raijin Kirin, Eater of Skies', maxHealth:11200, speed:138,
    radius:142, contactDamage:46, windup:.82, attackRange:435, attackCooldown:1.46, slamRadius:410, stunDuration:1.5,
    color:'#37dfff', scale:4.9, behavior:'boss', biome:'storm'
  },
  circuitJackal: {
    id:'circuitJackal', name:'Circuit Jackal', maxHealth:270, speed:278,
    radius:31, contactDamage:25, windup:.22, attackRange:315, attackCooldown:.72,
    color:'#29e9ff', spriteColumn:0, scale:1.12, behavior:'melee', biome:'neon'
  },
  pulsewingCrow: {
    id:'pulsewingCrow', name:'Pulsewing Crow', maxHealth:210, speed:226,
    radius:30, contactDamage:24, windup:.34, attackRange:650, attackCooldown:.96,
    color:'#df4cff', spriteColumn:1, scale:1.12, behavior:'ranged', biome:'neon'
  },
  chromebackGorilla: {
    id:'chromebackGorilla', name:'Chromeback Gorilla', maxHealth:760, speed:162,
    radius:58, contactDamage:42, windup:.66, attackRange:208, attackCooldown:1.62, slamRadius:212, stunDuration:1.48,
    color:'#b94cff', spriteColumn:2, scale:1.72, behavior:'heavy', biome:'neon'
  },
  kernelHackerTanuki: {
    id:'kernelHackerTanuki', name:'Kernel Hacker Tanuki', maxHealth:480, speed:204,
    radius:34, contactDamage:31, windup:.9, attackRange:640, attackCooldown:3.8,
    snareRadius:126, snareDamage:28, snareDrain:48, color:'#ff4bd8', scale:1.08, behavior:'hacker', biome:'neon'
  },
  daikyoOni: {
    id:'daikyoOni', name:'Daikyo Oni, Shogun of the Core', maxHealth:14800, speed:152,
    radius:152, contactDamage:54, windup:.72, attackRange:470, attackCooldown:1.28, slamRadius:445, stunDuration:1.58,
    color:'#ff3ab8', scale:5.15, behavior:'boss', biome:'neon'
  },
  shadowstepFerret: {
    id:'shadowstepFerret', name:'Shadowstep Ferret', maxHealth:350, speed:315,
    radius:31, contactDamage:30, windup:.18, attackRange:345, attackCooldown:.62,
    color:'#b84dff', spriteColumn:0, scale:1.14, behavior:'melee', biome:'shadow'
  },
  veilwingOwl: {
    id:'veilwingOwl', name:'Veilwing Owl', maxHealth:290, speed:255,
    radius:31, contactDamage:29, windup:.29, attackRange:710, attackCooldown:.79,
    color:'#54e9ff', spriteColumn:1, scale:1.16, behavior:'ranged', biome:'shadow'
  },
  gravebackBear: {
    id:'gravebackBear', name:'Graveback Bear', maxHealth:980, speed:180,
    radius:62, contactDamage:50, windup:.56, attackRange:225, attackCooldown:1.42, slamRadius:228, stunDuration:1.55,
    color:'#d459ff', spriteColumn:2, scale:1.82, behavior:'heavy', biome:'shadow'
  },
  moonveilSeer: {
    id:'moonveilSeer', name:'Moonveil Seer', maxHealth:560, speed:226,
    radius:35, contactDamage:36, windup:.78, attackRange:760, attackCooldown:3.35,
    curseDuration:6.5, curseMultiplier:1.35, color:'#c36cff', scale:1.1, behavior:'curser', biome:'shadow'
  },
  tsukikoEmpress: {
    id:'tsukikoEmpress', name:'Tsukiko, Empress of the Hollow Moon', maxHealth:19000, speed:165,
    radius:164, contactDamage:62, windup:.65, attackRange:505, attackCooldown:1.12, slamRadius:480, stunDuration:1.68,
    color:'#b84dff', scale:5.45, behavior:'boss', biome:'shadow'
  }
};

export const ENCOUNTERS = {
  jadeChapter: {
    id: 'jadeChapter', name: 'The Silent Bells', room: 'jadeCourtyard', rooms: ['jadeCourtyard','jadeMoonbridge','jadeRootGarden','jadeBellTerraces','jadeLanternCanals','jadeWardenProcessional'], bossRoom:'jadeGuardianApproach', boss: 'jadeguardTanuki',
    pressure:{id:'bellEcho',name:'BELL ECHO',startWave:1,baseInterval:10.5,minInterval:5.8,warning:1.25,radius:138,damage:9,color:'#8cff39'},
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
    pressure:{id:'sporeBloom',name:'SPORE BLOOM',startWave:0,baseInterval:9.4,minInterval:5.1,warning:1.15,activeDuration:3.2,radius:168,damage:6,slow:.32,color:'#7dff9c'},
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
    pressure:{id:'emberLane',name:'EMBER CORRIDOR',startWave:0,baseInterval:8,minInterval:4.25,warning:1.05,activeDuration:1.25,width:82,damage:12,color:'#ff5b27'},
    waves: [
      { name: 'First Bell Challengers', roster: ['emberAkita','gongwing','mistclawLynx','emberAkita','gongwing','emberAkita','gongwing','emberAkita','mistclawLynx','gongwing','emberAkita','gongwing'], spawnRate: .42, healthScale: 1.15, speedScale: 1.1, damageScale: 1.12, mission:{type:'eliminate',title:'WIN THE FIRST BELL'} },
      { name: 'Crimson Trial', roster: ['emberAkita','gongwing','emberAkita','gatewardenRhino','gongwing','emberAkita','emberAkita','gongwing','emberAkita','ironhorn','gongwing','emberAkita','emberAkita','gongwing','gatewardenRhino','emberAkita','gongwing','emberAkita','emberAkita','gongwing'], spawnRate: .26, healthScale: 1.42, speedScale: 1.22, damageScale: 1.28, mission:{type:'anchors',title:'BREAK THE EXECUTION SEALS',count:3,health:105} },
      { name: 'Burning Hundred', roster: ['emberAkita','gongwing','ironhorn','emberAkita','gongwing','emberAkita','emberAkita','gongwing','ironhorn','emberAkita','gongwing','emberAkita','ironhorn','gongwing','emberAkita','emberAkita','gongwing','ironhorn','emberAkita','gongwing','emberAkita','ironhorn','gongwing','emberAkita','emberAkita','gongwing','ironhorn','emberAkita','gongwing','emberAkita'], spawnRate: .16, healthScale: 1.72, speedScale: 1.38, damageScale: 1.48, mission:{type:'rescue',title:'FREE THE ASH PRISONERS',count:3} },
      { name: 'Shogun Warhost', roster: ['gatewardenRhino','emberAkita','gongwing','emberAkita','emberAkita','gongwing','ironhorn','emberAkita','gongwing','gatewardenRhino','ironhorn','gongwing','emberAkita','emberAkita','gongwing','gatewardenRhino','emberAkita','gongwing','emberAkita','ironhorn','gongwing','emberAkita','emberAkita','gongwing','gatewardenRhino','emberAkita','gongwing','emberAkita','ironhorn','gongwing','emberAkita','emberAkita','gongwing','gatewardenRhino','emberAkita','gongwing','emberAkita','ironhorn','gongwing','emberAkita','gatewardenRhino','gongwing'], spawnRate: .105, healthScale: 2.06, speedScale: 1.55, damageScale: 1.72, mission:{type:'defend',title:'DEFEND THE ANCESTRAL FLAME',duration:30,health:390} },
      { name:'Ashen Clan Avalanche',roster:['gatewardenRhino','emberAkita','gongwing','ironhorn','mistclawLynx','emberAkita','gongwing'],targetCount:112,spawnRate:.041,healthScale:2.44,speedScale:2.02,damageScale:1.98,mission:{type:'anchors',title:'DESTROY THE ONI CHAINS',count:5,health:132} },
      { name:'Oni Gate Cataclysm',roster:['gatewardenRhino','ironhorn','mistclawLynx','gongwing','emberAkita','gatewardenRhino','gongwing','ironhorn'],targetCount:150,spawnRate:.026,healthScale:2.88,speedScale:2.35,damageScale:2.28,mission:{type:'defend',title:'HOLD THE SHOGUN SEAL',duration:40,health:520} }
    ]
  },
  stormChapter: {
    id:'stormChapter', name:'The Sea That Eats the Sky', room:'stormTempestHarbor', rooms:['stormTempestHarbor','stormTideglassCauseway','stormDrownedBellSanctum','stormSirenReefMonastery','stormThunderbreakLighthouse','stormSkyfangAscent'], bossRoom:'stormEyeOfTempest', boss:'raijinKirin',
    pressure:{id:'stormSurge',name:'TIDEBREAK SURGE',startWave:0,baseInterval:7.2,minInterval:3.8,warning:.95,activeDuration:1.05,width:105,damage:16,color:'#31e8ff'},
    waves:[
      {name:'Tempest Harbor Raiders',roster:['tidebladeOtter','galecrestGull','tidebladeOtter','galecrestGull'],targetCount:20,spawnRate:.31,healthScale:1.28,speedScale:1.2,damageScale:1.2,mission:{type:'eliminate',title:'RETAKE TEMPEST HARBOR'}},
      {name:'Tideglass Hunting Fleet',roster:['tidebladeOtter','galecrestGull','tidebladeOtter','reefbreakerWalrus','galecrestGull'],targetCount:34,spawnRate:.18,healthScale:1.58,speedScale:1.38,damageScale:1.42,mission:{type:'rescue',title:'FREE THE TIDEKEEPERS',count:4}},
      {name:'Drowned Bell Armada',roster:['tidebladeOtter','galecrestGull','tidechantHeron','reefbreakerWalrus','galecrestGull','tidebladeOtter'],targetCount:54,spawnRate:.105,healthScale:1.92,speedScale:1.6,damageScale:1.68,mission:{type:'anchors',title:'BREAK THE DROWNED BELLS',count:4,health:148}},
      {name:'Siren Reef War Choir',roster:['tidechantHeron','galecrestGull','tidebladeOtter','reefbreakerWalrus','galecrestGull','tidebladeOtter','reefbreakerWalrus'],targetCount:82,spawnRate:.062,healthScale:2.32,speedScale:1.85,damageScale:1.94,mission:{type:'defend',title:'DEFEND THE SIREN BEACON',duration:36,health:560}},
      {name:'Thunderbreak Legion',roster:['reefbreakerWalrus','tidechantHeron','galecrestGull','tidebladeOtter','galecrestGull','tidebladeOtter'],targetCount:138,spawnRate:.032,healthScale:2.76,speedScale:2.18,damageScale:2.24,mission:{type:'anchors',title:'GROUND THE STORM CHAINS',count:5,health:182}},
      {name:'Skyfang Cataclysm',roster:['reefbreakerWalrus','tidechantHeron','tidebladeOtter','galecrestGull','tidebladeOtter','reefbreakerWalrus','galecrestGull'],targetCount:186,spawnRate:.019,healthScale:3.22,speedScale:2.52,damageScale:2.55,mission:{type:'defend',title:'HOLD THE EYE OF HEAVEN',duration:44,health:680}}
    ]
  },
  neonChapter: {
    id:'neonChapter', name:'The City That Dreams in Code', room:'neonRainGate', rooms:['neonRainGate','neonCircuitMarket','neonHologramArcade','neonSkyrailShrine','neonDataLotusGardens','neonShogunTower'], bossRoom:'neonShogunCore', boss:'daikyoOni',
    pressure:{id:'firewallGrid',name:'FIREWALL OVERRIDE',startWave:0,baseInterval:6.5,minInterval:3.3,warning:.9,activeDuration:.95,width:92,damage:19,color:'#ff39bd'},
    waves:[
      {name:'Rain Gate Sweepers',roster:['circuitJackal','pulsewingCrow','circuitJackal','pulsewingCrow'],targetCount:24,spawnRate:.27,healthScale:1.38,speedScale:1.26,damageScale:1.28,mission:{type:'eliminate',title:'BREACH THE RAIN GATE'}},
      {name:'Circuit Market Blackout',roster:['circuitJackal','pulsewingCrow','chromebackGorilla','circuitJackal','pulsewingCrow'],targetCount:42,spawnRate:.15,healthScale:1.72,speedScale:1.46,damageScale:1.52,mission:{type:'rescue',title:'FREE THE MARKET SPIRITS',count:4}},
      {name:'Arcade Ghost Protocol',roster:['pulsewingCrow','circuitJackal','kernelHackerTanuki','chromebackGorilla','pulsewingCrow','circuitJackal'],targetCount:68,spawnRate:.082,healthScale:2.08,speedScale:1.7,damageScale:1.8,mission:{type:'anchors',title:'CRASH THE GHOST SERVERS',count:4,health:172}},
      {name:'Skyrail Execution Loop',roster:['circuitJackal','kernelHackerTanuki','pulsewingCrow','chromebackGorilla','circuitJackal','pulsewingCrow','chromebackGorilla'],targetCount:104,spawnRate:.047,healthScale:2.5,speedScale:1.98,damageScale:2.1,mission:{type:'defend',title:'DEFEND THE SKYRAIL SHRINE',duration:39,health:650}},
      {name:'Data Lotus Purge',roster:['chromebackGorilla','kernelHackerTanuki','pulsewingCrow','circuitJackal','pulsewingCrow','circuitJackal'],targetCount:164,spawnRate:.025,healthScale:2.98,speedScale:2.32,damageScale:2.42,mission:{type:'anchors',title:'SEVER THE ONI CIRCUITS',count:6,health:208}},
      {name:'Shogun Tower Override',roster:['chromebackGorilla','kernelHackerTanuki','circuitJackal','pulsewingCrow','circuitJackal','chromebackGorilla','pulsewingCrow'],targetCount:218,spawnRate:.015,healthScale:3.52,speedScale:2.68,damageScale:2.78,mission:{type:'defend',title:'HOLD THE KERNEL GATE',duration:48,health:790}}
    ]
  },
  shadowChapter: {
    id:'shadowChapter', name:'The Realm Behind Every Shadow', room:'shadowObsidianPath', rooms:['shadowObsidianPath','shadowMirrorgraveVillage','shadowWraithwoodCrossing','shadowEclipseArchive','shadowMoonlessProcessional','shadowUmbralPalaceSteps'], bossRoom:'shadowThroneBeyondMoon', boss:'tsukikoEmpress',
    pressure:{id:'eclipseRift',name:'ECLIPSE RIFT',startWave:0,baseInterval:5.9,minInterval:2.75,warning:.9,activeDuration:1.15,radius:188,damage:23,slow:.28,color:'#b84dff'},
    waves:[
      {name:'Obsidian Lantern Hunt',roster:['shadowstepFerret','veilwingOwl','shadowstepFerret','veilwingOwl'],targetCount:30,spawnRate:.23,healthScale:1.5,speedScale:1.32,damageScale:1.42,mission:{type:'eliminate',title:'LIGHT THE OBSIDIAN ROAD'}},
      {name:'Mirrorgrave Awakening',roster:['shadowstepFerret','veilwingOwl','gravebackBear','shadowstepFerret','veilwingOwl'],targetCount:54,spawnRate:.125,healthScale:1.86,speedScale:1.55,damageScale:1.7,mission:{type:'rescue',title:'FREE THE FORGOTTEN SELVES',count:5}},
      {name:'Wraithwood Pursuit',roster:['veilwingOwl','shadowstepFerret','moonveilSeer','gravebackBear','shadowstepFerret','veilwingOwl'],targetCount:88,spawnRate:.068,healthScale:2.25,speedScale:1.82,damageScale:2.02,mission:{type:'anchors',title:'SHATTER THE SHADOW MIRRORS',count:5,health:204}},
      {name:'Eclipse Archive Legion',roster:['shadowstepFerret','moonveilSeer','veilwingOwl','gravebackBear','shadowstepFerret','veilwingOwl','gravebackBear'],targetCount:136,spawnRate:.038,healthScale:2.72,speedScale:2.12,damageScale:2.38,mission:{type:'defend',title:'DEFEND THE UNWRITTEN OATH',duration:43,health:760}},
      {name:'Moonless Processional',roster:['gravebackBear','moonveilSeer','veilwingOwl','shadowstepFerret','veilwingOwl','shadowstepFerret'],targetCount:208,spawnRate:.02,healthScale:3.35,speedScale:2.5,damageScale:2.8,mission:{type:'anchors',title:'BREAK THE SIX MOON CHAINS',count:6,health:244}},
      {name:'Palace of Ten Thousand Shadows',roster:['gravebackBear','moonveilSeer','shadowstepFerret','veilwingOwl','shadowstepFerret','gravebackBear','veilwingOwl'],targetCount:280,spawnRate:.012,healthScale:4.15,speedScale:2.92,damageScale:3.2,mission:{type:'defend',title:'HOLD THE LAST FREE SHADOW',duration:54,health:920}}
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
    id: 'jadeCourtyard', name: 'Shrine Courtyard', width: 6144, height: 3840,
    map: 'assets/maps/jade-grove/shrine-courtyard.json', mapRuntime:'phaser-tiled',
    exits:['north'],enemySet:'jade_early',difficulty:1,rewardType:'standard',
    background: 'assets/environment/jade-grove-arena.png',
    playerSpawn: { x: 3072, y: 2460 },
    enemySpawns: [
      { x: 1450, y: 1460, type: 'groveMinion', delay: .6 },
      { x: 4690, y: 1460, type: 'groveMinion', delay: 1.6 },
      { x: 1660, y: 2130, type: 'groveMinion', delay: 2.6 },
      { x: 4480, y: 2130, type: 'groveMinion', delay: 3.6 },
      { x: 3072, y: 1260, type: 'spiritArcher', delay: 6 }
    ],
    combatBounds: { x: 3072, y: 1940, radiusX: 2750, radiusY: 1650 }
  },
  jadeMoonbridge: {
    id:'jadeMoonbridge', name:'Moonbridge Crossing', width:6144, height:3840,map:'assets/maps/jade-grove/moonbridge-crossing.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'jade_bridge',difficulty:2,rewardType:'standard',
    background:'assets/environment/jade-moonbridge.png', playerSpawn:{x:3072,y:3310}, enemySpawns:[], ambient:'river',spawnLane:.66,spawnLaneStep:.045,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  jadeRootGarden: {
    id:'jadeRootGarden', name:'Root-Covered Plaza', width:6144, height:3840,map:'assets/maps/jade-grove/root-covered-plaza.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'jade_roots',difficulty:3,rewardType:'elite',
    background:'assets/environment/jade-root-garden.png', playerSpawn:{x:3072,y:3310}, enemySpawns:[], ambient:'roots',spawnLane:.55,spawnLaneStep:.05,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  jadeBellTerraces: {
    id:'jadeBellTerraces',name:'Jade Bell Terraces',width:6144,height:3840,map:'assets/maps/jade-grove/bell-terraces.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'jade_bells',difficulty:4,rewardType:'shrine',background:'assets/environment/jade-bell-terraces.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'bells',spawnLane:.6,spawnLaneStep:.046,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  jadeLanternCanals: {
    id:'jadeLanternCanals',name:'Whispering Lantern Canals',width:6144,height:3840,map:'assets/maps/jade-grove/lantern-canals.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'jade_canals',difficulty:5,rewardType:'treasure',background:'assets/environment/jade-lantern-canals.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'river',spawnLane:.58,spawnLaneStep:.044,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  jadeGuardianApproach: {
    id:'jadeGuardianApproach', name:'Jadebreaker Boss Courtyard', width:6144, height:3840,map:'assets/maps/jade-grove/jadebreaker-courtyard.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'jade_guardian',difficulty:7,rewardType:'guardian',
    background:'assets/environment/jade-guardian-approach.png', playerSpawn:{x:3072,y:3310}, enemySpawns:[], ambient:'corruption',spawnLane:.66,spawnLaneStep:.04,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  jadeWardenProcessional: {
    id:'jadeWardenProcessional',name:'Jade Warden Processional',width:6144,height:3840,map:'assets/maps/jade-grove/warden-processional.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'jade_siege',difficulty:6,rewardType:'elite',background:'assets/environment/jade-warden-processional.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'corruption',spawnLane:.61,spawnLaneStep:.04,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  jadeBrokenPavilion:{id:'jadeBrokenPavilion',name:'Broken Pavilion',width:6144,height:3840,map:'assets/maps/jade-grove/broken-pavilion.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'jade_event',difficulty:2,rewardType:'event',background:'assets/environment/jade-root-garden.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'roots',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  jadeCrystalClearing:{id:'jadeCrystalClearing',name:'Spirit Crystal Clearing',width:6144,height:3840,map:'assets/maps/jade-grove/spirit-crystal-clearing.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'jade_elite',difficulty:4,rewardType:'elite',background:'assets/environment/jade-bell-terraces.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'bells',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  jadeTrainingYard:{id:'jadeTrainingYard',name:'Abandoned Training Yard',width:6144,height:3840,map:'assets/maps/jade-grove/abandoned-training-yard.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'jade_combat',difficulty:2,rewardType:'standard',background:'assets/environment/jade-grove-arena.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'dojo',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  bambooHollow: {
    id: 'bambooHollow', name: 'Bamboo Hollow Gate', width: 6144, height: 3840,map:'assets/maps/bamboo-hollow/hollow-gate.json',mapRuntime:'phaser-tiled',exits:['north'],enemySet:'bamboo_scouts',difficulty:2,rewardType:'standard',
    background: 'assets/environment/bamboo-hollow-arena.png',
    playerSpawn: { x: 3072, y: 3310 },
    enemySpawns: [],
    combatBounds: { x: 3072, y: 1940, radiusX: 2700, radiusY: 1600 }
  },
  bambooMoonbridge: {
    id:'bambooMoonbridge', name:'Moonlit Reedbridge', width:6144, height:3840,map:'assets/maps/bamboo-hollow/moonlit-reedbridge.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'bamboo_bridge',difficulty:3,rewardType:'standard',
    background:'assets/environment/bamboo-moonbridge.png', playerSpawn:{x:3072,y:3310}, enemySpawns:[], ambient:'moonriver', spawnLane:.63, spawnLaneStep:.045,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  bambooSporeMarsh: {
    id:'bambooSporeMarsh', name:'Spore Shrine Marsh', width:6144, height:3840,map:'assets/maps/bamboo-hollow/spore-shrine-marsh.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'bamboo_spores',difficulty:4,rewardType:'elite',
    background:'assets/environment/bamboo-spore-marsh.png', playerSpawn:{x:3072,y:3310}, enemySpawns:[], ambient:'spores', spawnLane:.58, spawnLaneStep:.05,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  bambooMoonlotusReservoir: {
    id:'bambooMoonlotusReservoir',name:'Moonlotus Reservoir',width:6144,height:3840,map:'assets/maps/bamboo-hollow/moonlotus-reservoir.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'bamboo_reservoir',difficulty:5,rewardType:'shrine',background:'assets/environment/bamboo-moonlotus-reservoir.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'moonriver',spawnLane:.59,spawnLaneStep:.045,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  bambooSporelightMonastery: {
    id:'bambooSporelightMonastery',name:'Sporelight Monastery',width:6144,height:3840,map:'assets/maps/bamboo-hollow/sporelight-monastery.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'bamboo_monastery',difficulty:6,rewardType:'treasure',background:'assets/environment/bamboo-sporelight-monastery.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'spores',spawnLane:.57,spawnLaneStep:.043,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  bambooMoonfangBurrow: {
    id:'bambooMoonfangBurrow', name:'Moonfang Burrow', width:6144, height:3840,map:'assets/maps/bamboo-hollow/moonfang-burrow.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'bamboo_guardian',difficulty:8,rewardType:'guardian',
    background:'assets/environment/bamboo-moonfang-burrow.png', playerSpawn:{x:3072,y:3310}, enemySpawns:[], ambient:'mooncurse', spawnLane:.64, spawnLaneStep:.04,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  bambooMoonstoneCauseway: {
    id:'bambooMoonstoneCauseway',name:'Hollow Moonstone Causeway',width:6144,height:3840,map:'assets/maps/bamboo-hollow/moonstone-causeway.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'bamboo_siege',difficulty:7,rewardType:'elite',background:'assets/environment/bamboo-moonstone-causeway.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'mooncurse',spawnLane:.61,spawnLaneStep:.04,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  bambooWhisperingGrotto:{id:'bambooWhisperingGrotto',name:'Whispering Grotto',width:6144,height:3840,map:'assets/maps/bamboo-hollow/whispering-grotto.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'bamboo_event',difficulty:4,rewardType:'event',background:'assets/environment/bamboo-spore-marsh.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'spores',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  bambooLotusSanctuary:{id:'bambooLotusSanctuary',name:'Moonlotus Sanctuary',width:6144,height:3840,map:'assets/maps/bamboo-hollow/lotus-sanctuary.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'bamboo_shrine',difficulty:5,rewardType:'shrine',background:'assets/environment/bamboo-moonlotus-reservoir.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'moonriver',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  bambooHunterCamp:{id:'bambooHunterCamp',name:'Reedblade Hunter Camp',width:6144,height:3840,map:'assets/maps/bamboo-hollow/reedblade-hunter-camp.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'bamboo_elite',difficulty:5,rewardType:'elite',background:'assets/environment/bamboo-hollow-arena.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'mooncurse',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  crimsonDojo: {
    id: 'crimsonDojo', name: 'First Bell Dojo', width: 6144, height: 3840,map:'assets/maps/crimson-dojo/first-bell-dojo.json',mapRuntime:'phaser-tiled',exits:['north'],enemySet:'crimson_challengers',difficulty:3,rewardType:'standard',
    background: 'assets/environment/crimson-dojo-arena.png',
    playerSpawn: { x: 3072, y: 3310 },
    enemySpawns: [],
    combatBounds: { x: 3072, y: 1940, radiusX: 2700, radiusY: 1600 }
  },
  crimsonBellCourt: {
    id:'crimsonBellCourt', name:'Ember Bell Court', width:6144, height:3840,map:'assets/maps/crimson-dojo/ember-bell-court.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'crimson_bells',difficulty:4,rewardType:'standard',
    background:'assets/environment/crimson-bell-court.png', playerSpawn:{x:3072,y:3310}, enemySpawns:[], ambient:'bells', spawnLane:.64, spawnLaneStep:.045,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  crimsonWarYard: {
    id:'crimsonWarYard', name:'Ashen War Yard', width:6144, height:3840,map:'assets/maps/crimson-dojo/ashen-war-yard.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'crimson_yard',difficulty:5,rewardType:'elite',
    background:'assets/environment/crimson-war-yard.png', playerSpawn:{x:3072,y:3310}, enemySpawns:[], ambient:'ash', spawnLane:.61, spawnLaneStep:.05,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  crimsonCinderRooftops: {
    id:'crimsonCinderRooftops',name:'Cinder Pagoda Rooftops',width:6144,height:3840,map:'assets/maps/crimson-dojo/cinder-pagoda-rooftops.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'crimson_roofs',difficulty:6,rewardType:'shrine',background:'assets/environment/crimson-cinder-rooftops.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'inferno',spawnLane:.6,spawnLaneStep:.044,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  crimsonDrumFoundry: {
    id:'crimsonDrumFoundry',name:'Ashen Drum Foundry',width:6144,height:3840,map:'assets/maps/crimson-dojo/ashen-drum-foundry.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'crimson_foundry',difficulty:7,rewardType:'treasure',background:'assets/environment/crimson-drum-foundry.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'ash',spawnLane:.58,spawnLaneStep:.042,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  crimsonOniGate: {
    id:'crimsonOniGate', name:'Oni Gate Throne', width:6144, height:3840,map:'assets/maps/crimson-dojo/oni-gate-throne.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'crimson_guardian',difficulty:10,rewardType:'guardian',
    background:'assets/environment/crimson-oni-gate.png', playerSpawn:{x:3072,y:3310}, enemySpawns:[], ambient:'inferno', spawnLane:.64, spawnLaneStep:.04,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  }
  ,crimsonWarProcessional: {
    id:'crimsonWarProcessional',name:'Shogun War Processional',width:6144,height:3840,map:'assets/maps/crimson-dojo/shogun-war-processional.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'crimson_siege',difficulty:9,rewardType:'elite',background:'assets/environment/crimson-war-processional.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'inferno',spawnLane:.61,spawnLaneStep:.04,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  crimsonFoxfireArchive:{id:'crimsonFoxfireArchive',name:'Foxfire Archive',width:6144,height:3840,map:'assets/maps/crimson-dojo/foxfire-archive.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'crimson_event',difficulty:6,rewardType:'event',background:'assets/environment/crimson-cinder-rooftops.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'inferno',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  crimsonAncestorShrine:{id:'crimsonAncestorShrine',name:'Ancestor Flame Shrine',width:6144,height:3840,map:'assets/maps/crimson-dojo/ancestor-flame-shrine.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'crimson_shrine',difficulty:7,rewardType:'shrine',background:'assets/environment/crimson-bell-court.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'bells',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  crimsonExecutionYard:{id:'crimsonExecutionYard',name:'Execution Yard',width:6144,height:3840,map:'assets/maps/crimson-dojo/execution-yard.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'crimson_elite',difficulty:8,rewardType:'elite',background:'assets/environment/crimson-war-yard.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'ash',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  stormTempestHarbor:{
    id:'stormTempestHarbor',name:'Tempest Harbor',width:6144,height:3840,map:'assets/maps/storm-coast/tempest-harbor.json',mapRuntime:'phaser-tiled',exits:['north'],enemySet:'storm_raiders',difficulty:5,rewardType:'standard',background:'assets/environment/storm-tempest-harbor-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'storm',spawnLane:.62,spawnLaneStep:.042,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  stormTideglassCauseway:{
    id:'stormTideglassCauseway',name:'Tideglass Causeway',width:6144,height:3840,map:'assets/maps/storm-coast/tideglass-causeway.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'storm_causeway',difficulty:6,rewardType:'standard',background:'assets/environment/storm-tideglass-causeway-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'tide',spawnLane:.63,spawnLaneStep:.04,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  stormDrownedBellSanctum:{
    id:'stormDrownedBellSanctum',name:'Drowned Bell Sanctum',width:6144,height:3840,map:'assets/maps/storm-coast/drowned-bell-sanctum.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'storm_bells',difficulty:7,rewardType:'elite',background:'assets/environment/storm-drowned-bell-sanctum-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'storm',spawnLane:.61,spawnLaneStep:.04,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  stormSirenReefMonastery:{
    id:'stormSirenReefMonastery',name:'Siren Reef Monastery',width:6144,height:3840,map:'assets/maps/storm-coast/siren-reef-monastery.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'storm_reef',difficulty:8,rewardType:'shrine',background:'assets/environment/storm-siren-reef-monastery-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'tide',spawnLane:.6,spawnLaneStep:.038,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  stormThunderbreakLighthouse:{
    id:'stormThunderbreakLighthouse',name:'Thunderbreak Lighthouse',width:6144,height:3840,map:'assets/maps/storm-coast/thunderbreak-lighthouse.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'storm_lighthouse',difficulty:9,rewardType:'treasure',background:'assets/environment/storm-thunderbreak-lighthouse-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'lightning',spawnLane:.59,spawnLaneStep:.038,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  stormSkyfangAscent:{
    id:'stormSkyfangAscent',name:'Skyfang Ascent',width:6144,height:3840,map:'assets/maps/storm-coast/skyfang-ascent.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'storm_siege',difficulty:11,rewardType:'elite',background:'assets/environment/storm-skyfang-ascent-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'tempest',spawnLane:.6,spawnLaneStep:.036,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  stormEyeOfTempest:{
    id:'stormEyeOfTempest',name:'Eye of the Tempest',width:6144,height:3840,map:'assets/maps/storm-coast/eye-of-tempest.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'storm_guardian',difficulty:12,rewardType:'guardian',background:'assets/environment/storm-eye-of-tempest-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'tempest',spawnLane:.62,spawnLaneStep:.034,
    combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}
  },
  stormPearlCove:{id:'stormPearlCove',name:'Storm Pearl Cove',width:6144,height:3840,map:'assets/maps/storm-coast/storm-pearl-cove.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'storm_event',difficulty:8,rewardType:'event',background:'assets/environment/storm-drowned-bell-sanctum-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'tide',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  stormTidekeeperShrine:{id:'stormTidekeeperShrine',name:'Tidekeeper Shrine',width:6144,height:3840,map:'assets/maps/storm-coast/tidekeeper-shrine.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'storm_shrine',difficulty:9,rewardType:'shrine',background:'assets/environment/storm-siren-reef-monastery-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'tide',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  stormRaiderWreck:{id:'stormRaiderWreck',name:'Tempest Raider Wreck',width:6144,height:3840,map:'assets/maps/storm-coast/raider-wreck.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'storm_elite',difficulty:10,rewardType:'elite',background:'assets/environment/storm-tempest-harbor-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'storm',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  neonRainGate:{id:'neonRainGate',name:'Neon Rain Gate',width:6144,height:3840,map:'assets/maps/neon-city/neon-rain-gate.json',mapRuntime:'phaser-tiled',exits:['north'],enemySet:'neon_sweepers',difficulty:7,rewardType:'standard',background:'assets/environment/neon-rain-gate-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'neonRain',spawnLane:.62,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  neonCircuitMarket:{id:'neonCircuitMarket',name:'Circuit Market',width:6144,height:3840,map:'assets/maps/neon-city/circuit-market.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'neon_market',difficulty:8,rewardType:'standard',background:'assets/environment/neon-circuit-market-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'neonRain',spawnLane:.61,spawnLaneStep:.038,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  neonHologramArcade:{id:'neonHologramArcade',name:'Hologram Arcade',width:6144,height:3840,map:'assets/maps/neon-city/hologram-arcade.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'neon_arcade',difficulty:9,rewardType:'elite',background:'assets/environment/neon-hologram-arcade-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'hologram',spawnLane:.6,spawnLaneStep:.038,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  neonSkyrailShrine:{id:'neonSkyrailShrine',name:'Skyrail Shrine',width:6144,height:3840,map:'assets/maps/neon-city/skyrail-shrine.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'neon_skyrail',difficulty:10,rewardType:'shrine',background:'assets/environment/neon-skyrail-shrine-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'skyrail',spawnLane:.6,spawnLaneStep:.036,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  neonDataLotusGardens:{id:'neonDataLotusGardens',name:'Data Lotus Gardens',width:6144,height:3840,map:'assets/maps/neon-city/data-lotus-gardens.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'neon_lotus',difficulty:11,rewardType:'treasure',background:'assets/environment/neon-data-lotus-gardens-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'hologram',spawnLane:.59,spawnLaneStep:.035,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  neonShogunTower:{id:'neonShogunTower',name:'Shogun Tower',width:6144,height:3840,map:'assets/maps/neon-city/shogun-tower.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'neon_siege',difficulty:13,rewardType:'elite',background:'assets/environment/neon-shogun-tower-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'override',spawnLane:.59,spawnLaneStep:.034,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  neonShogunCore:{id:'neonShogunCore',name:'Neon Shogun Core',width:6144,height:3840,map:'assets/maps/neon-city/shogun-core.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'neon_guardian',difficulty:14,rewardType:'guardian',background:'assets/environment/neon-shogun-core-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'override',spawnLane:.61,spawnLaneStep:.032,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  neonMemoryBazaar:{id:'neonMemoryBazaar',name:'Memory Bazaar',width:6144,height:3840,map:'assets/maps/neon-city/memory-bazaar.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'neon_event',difficulty:10,rewardType:'event',background:'assets/environment/neon-circuit-market-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'circuitMarket',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  neonPulseShrine:{id:'neonPulseShrine',name:'Pulse Shrine',width:6144,height:3840,map:'assets/maps/neon-city/pulse-shrine.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'neon_shrine',difficulty:11,rewardType:'shrine',background:'assets/environment/neon-skyrail-shrine-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'skyrail',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  neonKernelFoundry:{id:'neonKernelFoundry',name:'Kernel Foundry',width:6144,height:3840,map:'assets/maps/neon-city/kernel-foundry.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'neon_elite',difficulty:12,rewardType:'elite',background:'assets/environment/neon-shogun-tower-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'override',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  shadowObsidianPath:{id:'shadowObsidianPath',name:'Obsidian Lantern Path',width:6144,height:3840,map:'assets/maps/shadow-realm/obsidian-lantern-path.json',mapRuntime:'phaser-tiled',exits:['north'],enemySet:'shadow_hunt',difficulty:9,rewardType:'standard',background:'assets/environment/shadow-obsidian-lantern-path-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'shadow',spawnLane:.62,spawnLaneStep:.038,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  shadowMirrorgraveVillage:{id:'shadowMirrorgraveVillage',name:'Mirrorgrave Village',width:6144,height:3840,map:'assets/maps/shadow-realm/mirrorgrave-village.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'shadow_mirrorgrave',difficulty:10,rewardType:'standard',background:'assets/environment/shadow-mirrorgrave-village-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'mirrorgrave',spawnLane:.61,spawnLaneStep:.036,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  shadowWraithwoodCrossing:{id:'shadowWraithwoodCrossing',name:'Wraithwood Crossing',width:6144,height:3840,map:'assets/maps/shadow-realm/wraithwood-crossing.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'shadow_wraithwood',difficulty:11,rewardType:'elite',background:'assets/environment/shadow-wraithwood-crossing-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'wraithwood',spawnLane:.6,spawnLaneStep:.035,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  shadowEclipseArchive:{id:'shadowEclipseArchive',name:'Eclipse Archive',width:6144,height:3840,map:'assets/maps/shadow-realm/eclipse-archive.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'shadow_archive',difficulty:12,rewardType:'shrine',background:'assets/environment/shadow-eclipse-archive-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'eclipse',spawnLane:.59,spawnLaneStep:.034,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  shadowMoonlessProcessional:{id:'shadowMoonlessProcessional',name:'Moonless Processional',width:6144,height:3840,map:'assets/maps/shadow-realm/moonless-processional.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'shadow_processional',difficulty:13,rewardType:'treasure',background:'assets/environment/shadow-moonless-processional-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'shadow',spawnLane:.59,spawnLaneStep:.033,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  shadowUmbralPalaceSteps:{id:'shadowUmbralPalaceSteps',name:'Umbral Palace Steps',width:6144,height:3840,map:'assets/maps/shadow-realm/umbral-palace-steps.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'shadow_palace',difficulty:15,rewardType:'elite',background:'assets/environment/shadow-umbral-palace-steps-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'eclipse',spawnLane:.58,spawnLaneStep:.032,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  shadowThroneBeyondMoon:{id:'shadowThroneBeyondMoon',name:'Throne Beyond the Moon',width:6144,height:3840,map:'assets/maps/shadow-realm/throne-beyond-moon.json',mapRuntime:'phaser-tiled',exits:['south'],enemySet:'shadow_guardian',difficulty:16,rewardType:'guardian',background:'assets/environment/shadow-throne-beyond-moon-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'hollowMoon',spawnLane:.6,spawnLaneStep:.03,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  shadowForsakenMirrorVault:{id:'shadowForsakenMirrorVault',name:'Forsaken Mirror Vault',width:6144,height:3840,map:'assets/maps/shadow-realm/forsaken-mirror-vault.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'shadow_event',difficulty:12,rewardType:'event',background:'assets/environment/shadow-mirrorgrave-village-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'mirrorgrave',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  shadowEclipseSanctuary:{id:'shadowEclipseSanctuary',name:'Eclipse Sanctuary',width:6144,height:3840,map:'assets/maps/shadow-realm/eclipse-sanctuary.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'shadow_shrine',difficulty:13,rewardType:'shrine',background:'assets/environment/shadow-eclipse-archive-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'eclipse',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}},
  shadowDreadmoonPrison:{id:'shadowDreadmoonPrison',name:'Dreadmoon Prison',width:6144,height:3840,map:'assets/maps/shadow-realm/dreadmoon-prison.json',mapRuntime:'phaser-tiled',exits:['north','south'],enemySet:'shadow_elite',difficulty:15,rewardType:'elite',background:'assets/environment/shadow-umbral-palace-steps-v1.png',playerSpawn:{x:3072,y:3310},enemySpawns:[],ambient:'hollowMoon',spawnLane:.6,spawnLaneStep:.04,combatBounds:{x:3072,y:1940,radiusX:2700,radiusY:1600}}
};
