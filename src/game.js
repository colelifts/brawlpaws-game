import { clamp, lerp, normalize, distance, approachAngle, encounterActiveLimit, campaignPressureCurve, cappedWardPressure, normalizedEnemyScales, enemySpeedCeiling, enemyTelegraphFloor, incomingDamageLimit, guardianAttackTiming } from './math.js?v=20260812-guardians1';
import { HEROES, WEAPONS, ABILITIES, STATUS_EFFECTS, ELITE_MODIFIERS, BOSS_PATTERNS, BOSS_PROFILES, ENEMIES, ENCOUNTERS, ROOMS, DIFFICULTIES } from './data.js?v=20260813-expedition6';
import { createLayeredMapRuntime } from './map-runtime.js?v=20260813-expedition6';
import { EXPEDITION_WORLD, expeditionNode, expeditionNeighbors, expeditionWorldPosition, expeditionProgress } from './expedition-world.js?v=20260813-world1';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d', { alpha: true });
const minimapCanvas = document.querySelector('#minimap');
const minimapCtx = minimapCanvas.getContext('2d');
const worldMapCanvas=document.querySelector('#world-map');
const worldMapCtx=worldMapCanvas.getContext('2d');
const shell = document.querySelector('#game-shell');
const startScreen = document.querySelector('#start-screen');
const resultScreen = document.querySelector('#result-screen');
const levelupScreen = document.querySelector('#levelup-screen');
const upgradeGrid = document.querySelector('#upgrade-grid');
const storyScreen = document.querySelector('#story-screen');
const tutorialTracker=document.querySelector('#tutorial-tracker');
const routeScreen = document.querySelector('#route-screen');
const routeGrid = document.querySelector('#route-grid');
const shopScreen = document.querySelector('#shop-screen');
const shopGrid = document.querySelector('#shop-grid');
const hubMenuScreen = document.querySelector('#hub-menu-screen');
const hubUpgradeGrid = document.querySelector('#hub-upgrade-grid');
const dojoPanel = document.querySelector('#dojo-panel');
const eventScreen = document.querySelector('#event-screen');
const eventChoiceGrid = document.querySelector('#event-choice-grid');
const guardianRewardScreen = document.querySelector('#guardian-reward-screen');
const guardianRewardGrid = document.querySelector('#guardian-reward-grid');
const relicDraftScreen = document.querySelector('#relic-draft-screen');
const relicDraftGrid = document.querySelector('#relic-draft-grid');
const codexScreen = document.querySelector('#codex-screen');
const worldMapScreen=document.querySelector('#world-map-screen');
const codexGrid = document.querySelector('#codex-grid');
const codexDetail = document.querySelector('#codex-detail');
const codexProgress = document.querySelector('#codex-progress');
const pauseScreen = document.querySelector('#pause-screen');
const settingsScreen = document.querySelector('#settings-screen');
const continueRunButton = document.querySelector('#continue-run');
const continueRunCopy = document.querySelector('#continue-run-copy');
const coopPanel=document.querySelector('#coop-start');
const coopStatus=document.querySelector('#coop-status');
const coopRoster=document.querySelector('#coop-roster');
const coopCodeInput=document.querySelector('#coop-code');
const coopCreateButton=document.querySelector('#coop-create');
const coopJoinButton=document.querySelector('#coop-join');
const coopLeaveButton=document.querySelector('#coop-leave');
const hud = document.querySelector('#hud');
const loading = document.querySelector('#loading');
let selectedHeroId = 'kitsune';
let heroDef = HEROES[selectedHeroId];
let weapon = WEAPONS[heroDef.weapon];
const CHAPTER_ORDER = ['jadeChapter', 'bambooChapter', 'crimsonChapter', 'stormChapter', 'neonChapter', 'shadowChapter'];
let chapterIndex = 0;
let chapter = ENCOUNTERS[CHAPTER_ORDER[chapterIndex]];
let room = ROOMS[chapter.room];
const debugParams=new URLSearchParams(window.location.search);
const debugBoss = debugParams.has('boss');
const debugRoute = Number(debugParams.get('route')||0);
const debugChapter = clamp(Number(debugParams.get('chapter')||1)-1, 0, CHAPTER_ORDER.length-1);
const debugDifficulty = debugParams.get('difficulty');
const debugHubStation = debugParams.get('hub');
const debugSystem = debugParams.get('system');
const debugHero = debugParams.get('hero');
const debugMission = debugParams.get('mission');
const layeredMapRuntime=createLayeredMapRuntime('phaser-map');
shell.addEventListener('scroll',()=>{if(shell.scrollTop||shell.scrollLeft)scrollShellToOrigin();},{passive:true});
function scrollShellToOrigin(){shell.scrollTop=0;shell.scrollLeft=0;}

const assets = {
  arena: new Image(), kitsune: new Image(), kitsuneFire: new Image(), kitsuneStates: new Image(), bamboo: new Image(), bambooFire: new Image(), bambooStates: new Image(), hopscotch: new Image(), hopscotchFire: new Image(), hopscotchStates: new Image(), rusty: new Image(), rustyFire: new Image(), rustyStates: new Image(), zap: new Image(), zapFire: new Image(), zapStates: new Image(), nomi: new Image(), nomiFire: new Image(), nomiStates: new Image(), enemies: new Image(), props: new Image(),
  archerMove: new Image(), archerAttack: new Image(), raccoonAttack: new Image(), boarAttack: new Image(),
  undertowVfx: new Image(), foxfireVfx: new Image(), wildHeartVfx: new Image(),
  blasterShotVfx: new Image(), blasterImpactVfx: new Image(), spiritArrowVfx: new Image(), spiritArrowImpactVfx: new Image(), hopscotchArrow: new Image(), trickshotVfx: new Image(), zapArcVfx: new Image(), nomiGlaiveVfx: new Image(), arsenalWeaponsVfx: new Image(), arsenalReactionsVfx: new Image(), arsenalTier2Vfx: new Image(),
  burnStatusVfx: new Image(), waterImpactVfx: new Image(), clawSlashVfx: new Image(), hammerSlamVfx: new Image(),
  shockImpactVfx: new Image(), shockLinkVfx: new Image(), spiritWispVfx: new Image(), lanternFlameVfx: new Image(), waterRippleVfx: new Image(),
  jadeguardTanuki: new Image(), jadeguardTanukiMove: new Image(), bambooEnemies: new Image(), bambooEnemiesMove: new Image(), moonfangKomainu: new Image(), moonfangKomainuMove: new Image(),
  crimsonEnemies: new Image(), crimsonEnemiesMove: new Image(), pyreclawShogun: new Image(), pyreclawShogunMove: new Image(), crimsonCombatVfx: new Image(),
  stormEnemies: new Image(), stormEnemiesMove: new Image(), raijinKirin: new Image(), raijinKirinMove: new Image(), stormCoastVfx: new Image(),
  neonEnemies: new Image(), neonEnemiesMove: new Image(), daikyoOni: new Image(), daikyoOniMove: new Image(), neonCityVfx: new Image(),
  shadowEnemies: new Image(), shadowEnemiesMove: new Image(), tsukikoEmpress: new Image(), tsukikoEmpressMove: new Image(), shadowRealmVfx: new Image(),
  bellweaverCat: new Image(), powderkegToad: new Image(), gatewardenRhino: new Image(), mistclawLynx: new Image(), tidechantHeron: new Image(), kernelHackerTanuki: new Image(), moonveilSeer: new Image(), specialEnemyVfx: new Image(), guardianSignatureVfx: new Image()
};
const assetSources = {
  arena: room.background,
  kitsune: 'assets/characters/kitsune-gunner.png',
  kitsuneFire: 'assets/characters/kitsune-fire.png',
  kitsuneStates: 'assets/characters/kitsune-states-v1.png',
  bamboo: 'assets/characters/bamboo-cannon.png',
  bambooFire: 'assets/characters/bamboo-fire.png',
  bambooStates: 'assets/characters/bamboo-states-v1.png',
  hopscotch: 'assets/characters/hopscotch-archer-alpha.png',
  hopscotchFire: 'assets/characters/hopscotch-fire-alpha.png',
  hopscotchStates: 'assets/characters/hopscotch-states-v1.png',
  rusty: 'assets/characters/rusty-trickshot-alpha.png',
  rustyFire: 'assets/characters/rusty-fire-alpha.png',
  rustyStates: 'assets/characters/rusty-states-v1.png',
  zap: 'assets/characters/zap-techie-v1.png',
  zapFire: 'assets/characters/zap-fire-v1.png',
  zapStates: 'assets/characters/zap-states-v1.png',
  nomi: 'assets/characters/nomi-crane-v1.png',
  nomiFire: 'assets/characters/nomi-fire-v1.png',
  nomiStates: 'assets/characters/nomi-states-v1.png',
  enemies: 'assets/characters/enemy-roster-animated.png',
  props: 'assets/environment/jade-props.png',
  archerMove: 'assets/characters/archer-movement.png',
  archerAttack: 'assets/characters/archer-attack.png',
  raccoonAttack: 'assets/characters/raccoon-attack.png',
  boarAttack: 'assets/characters/boar-attack.png',
  undertowVfx: 'assets/vfx/undertow-well-v2.png',
  foxfireVfx: 'assets/vfx/foxfire-bolt.png',
  wildHeartVfx: 'assets/vfx/wild-heart.png',
  blasterShotVfx: 'assets/vfx/spirit-blaster-shot.png',
  blasterImpactVfx: 'assets/vfx/spirit-blaster-impact.png',
  spiritArrowVfx: 'assets/vfx/spirit-arrow.png',
  spiritArrowImpactVfx: 'assets/vfx/spirit-arrow-impact.png',
  hopscotchArrow: 'assets/vfx/hopscotch-arrow-alpha.png',
  trickshotVfx: 'assets/vfx/trickshot-round-alpha.png',
  zapArcVfx: 'assets/vfx/zap-arc-pulse-v1.png',
  nomiGlaiveVfx: 'assets/vfx/nomi-glaive-vfx-v1.png',
  arsenalWeaponsVfx: 'assets/vfx/arsenal-weapons-v1.png',
  arsenalReactionsVfx: 'assets/vfx/arsenal-reactions-v1.png',
  arsenalTier2Vfx: 'assets/vfx/arsenal-tier2-v1.png',
  burnStatusVfx: 'assets/vfx/burn-status.png',
  waterImpactVfx: 'assets/vfx/water-impact.png',
  clawSlashVfx: 'assets/vfx/claw-slash.png',
  hammerSlamVfx: 'assets/vfx/hammer-slam.png',
  shockImpactVfx: 'assets/vfx/shock-paws-impact.png',
  shockLinkVfx: 'assets/vfx/shock-link.png',
  spiritWispVfx: 'assets/environment/animated/spirit-wisp.png',
  lanternFlameVfx: 'assets/environment/animated/lantern-flame.png',
  waterRippleVfx: 'assets/environment/animated/water-ripple.png',
  jadeguardTanuki: 'assets/characters/jadeguard-tanuki-v2.png',
  jadeguardTanukiMove: 'assets/characters/jadeguard-tanuki-move-v1.png',
  bambooEnemies: 'assets/characters/bamboo-enemies-v3.png',
  bambooEnemiesMove: 'assets/characters/bamboo-enemies-move-v1.png',
  moonfangKomainu: 'assets/characters/moonfang-komainu.png',
  moonfangKomainuMove: 'assets/characters/moonfang-komainu-move-v1.png',
  crimsonEnemies: 'assets/characters/crimson-enemies.png',
  crimsonEnemiesMove: 'assets/characters/crimson-enemies-move-v1.png',
  pyreclawShogun: 'assets/characters/pyreclaw-shogun.png',
  pyreclawShogunMove: 'assets/characters/pyreclaw-shogun-move-v1.png',
  crimsonCombatVfx: 'assets/vfx/crimson-combat-vfx.png',
  stormEnemies: 'assets/characters/storm-enemies-v1.png',
  stormEnemiesMove: 'assets/characters/storm-enemies-move-v1.png',
  raijinKirin: 'assets/characters/raijin-kirin-v1.png',
  raijinKirinMove: 'assets/characters/raijin-kirin-move-v1.png',
  stormCoastVfx: 'assets/vfx/storm-coast-vfx-v1.png',
  neonEnemies: 'assets/characters/neon-enemies-v1.png',
  neonEnemiesMove: 'assets/characters/neon-enemies-move-v1.png',
  daikyoOni: 'assets/characters/daikyo-oni-v1.png',
  daikyoOniMove: 'assets/characters/daikyo-oni-move-v1.png',
  neonCityVfx: 'assets/vfx/neon-city-vfx-v1.png',
  shadowEnemies: 'assets/characters/shadow-enemies-v1.png',
  shadowEnemiesMove: 'assets/characters/shadow-enemies-move-v1.png',
  tsukikoEmpress: 'assets/characters/tsukiko-empress-v1.png',
  tsukikoEmpressMove: 'assets/characters/tsukiko-empress-move-v1.png',
  shadowRealmVfx: 'assets/vfx/shadow-realm-vfx-v1.png',
  bellweaverCat: 'assets/characters/bellweaver-cat.png',
  powderkegToad: 'assets/characters/powderkeg-toad.png',
  gatewardenRhino: 'assets/characters/gatewarden-rhino.png',
  mistclawLynx: 'assets/characters/mistclaw-lynx.png',
  tidechantHeron: 'assets/characters/tidechant-heron-v1.png',
  kernelHackerTanuki: 'assets/characters/kernel-hacker-tanuki-v1.png',
  moonveilSeer: 'assets/characters/moonveil-seer-v1.png',
  specialEnemyVfx: 'assets/vfx/special-enemy-vfx.png',
  guardianSignatureVfx: 'assets/vfx/guardian-signatures.png'
};
const STARTUP_LOADING_LIMIT_MS=3200;
const startupAssetKeys=new Set(['arena','kitsune','kitsuneFire','kitsuneStates','enemies','props','archerMove','archerAttack','raccoonAttack','boarAttack','blasterShotVfx','blasterImpactVfx']);
const settledStartupAssets=new Set(),deferredAssetSources=[];
let loadingReleased=false;
function startDeferredAssetLoading(){let index=0;const loadBatch=()=>{for(let count=0;count<4&&index<deferredAssetSources.length;count++,index++){const [key,source]=deferredAssetSources[index];assets[key].fetchPriority='low';assets[key].decoding='async';assets[key].src=source;}if(index<deferredAssetSources.length)window.setTimeout(loadBatch,90);};window.setTimeout(loadBatch,180);}
function releaseLoadingScreen(){if(loadingReleased)return;loadingReleased=true;loading.classList.add('ready');startDeferredAssetLoading();}
function settleStartupAsset(key){if(!startupAssetKeys.has(key)||settledStartupAssets.has(key))return;settledStartupAssets.add(key);if(settledStartupAssets.size>=startupAssetKeys.size)releaseLoadingScreen();}
for (const [key, source] of Object.entries(assetSources)) {
  const image=assets[key];
  if(!startupAssetKeys.has(key)){deferredAssetSources.push([key,source]);continue;}
  image.fetchPriority='high';
  image.addEventListener('load',()=>settleStartupAsset(key),{once:true});
  image.addEventListener('error',()=>settleStartupAsset(key),{once:true});
  image.src=source;
  if(image.complete)queueMicrotask(()=>settleStartupAsset(key));
}
window.setTimeout(releaseLoadingScreen,STARTUP_LOADING_LIMIT_MS);
const arenaCache=new Map([[room.id,assets.arena]]);
function loadRoomArena(roomDefinition){if(arenaCache.has(roomDefinition.id))return arenaCache.get(roomDefinition.id);const image=new Image();image.decoding='async';image.fetchPriority='high';image.src=roomDefinition.background;arenaCache.set(roomDefinition.id,image);return image;}

const ui = {
  healthFill: document.querySelector('#health-fill'), healthText: document.querySelector('#health-text'),
  timer: document.querySelector('#timer'), objective: document.querySelector('#objective-text'),
  corruptionPanel:document.querySelector('#corruption-panel'),corruptionTier:document.querySelector('#corruption-tier'),corruptionFill:document.querySelector('#corruption-fill'),corruptionCopy:document.querySelector('#corruption-copy'),
  minimapPanel:document.querySelector('#minimap-panel'),minimapLabel:document.querySelector('#minimap-label'),minimapCount:document.querySelector('#minimap-count'),
  worldMapButton:document.querySelector('#world-map-button'),worldMapProgress:document.querySelector('#world-map-progress'),worldMapLocation:document.querySelector('#world-map-location'),
  roomState: document.querySelector('#room-state'), comboPanel: document.querySelector('#combo-panel'),
  comboCount: document.querySelector('#combo-count'), dashCard: document.querySelector('#dash-card'),sprintCard:document.querySelector('#sprint-card'),sprintFill:document.querySelector('#sprint-fill'),
  dashCooldown: document.querySelector('#dash-cooldown'), resultTitle: document.querySelector('#result-title'),
  heroPortrait:document.querySelector('#hero-portrait'),heroName:document.querySelector('#hero-name'),heroRole:document.querySelector('#hero-role'),
  weaponName:document.querySelector('#weapon-name'),dashName:document.querySelector('#dash-name'),
  startHeroMark:document.querySelector('#start-hero-mark'),startHeroName:document.querySelector('#start-hero-name'),startHeroCopy:document.querySelector('#start-hero-copy'),
  comparisonRatings:document.querySelector('#comparison-ratings'),comparisonWeapon:document.querySelector('#comparison-weapon'),comparisonWeaponTags:document.querySelector('#comparison-weapon-tags'),comparisonWeaponCopy:document.querySelector('#comparison-weapon-copy'),comparisonWeaponStats:document.querySelector('#comparison-weapon-stats'),
  arsenalContractTitle:document.querySelector('#arsenal-contract-title'),arsenalContractCopy:document.querySelector('#arsenal-contract-copy'),arsenalContractGrid:document.querySelector('#arsenal-contract-grid'),
  xpFill: document.querySelector('#xp-fill'), xpText: document.querySelector('#xp-text'),
  levelBadge: document.querySelector('#level-badge'),
  goldToken: document.querySelector('#gold-token'), routeProgress: document.querySelector('#route-progress'),
  routeHealth: document.querySelector('#route-health'), routeGold: document.querySelector('#route-gold'), routeRelics: document.querySelector('#route-relics'),
  shopGold: document.querySelector('#shop-gold'),
  waveLabel: document.querySelector('#wave-label'), bossPanel: document.querySelector('#boss-panel'),
  bossHealthFill: document.querySelector('#boss-health-fill'), bossHealthText: document.querySelector('#boss-health-text'), bossPhase: document.querySelector('#boss-phase'),
  bossReadout:document.querySelector('#boss-readout'),bossIntentKicker:document.querySelector('#boss-intent-kicker'),bossIntentName:document.querySelector('#boss-intent-name'),bossIntentTime:document.querySelector('#boss-intent-time'),bossIntentHint:document.querySelector('#boss-intent-hint'),bossIntentFill:document.querySelector('#boss-intent-fill'),
  storyKicker: document.querySelector('#story-kicker'), storyTitle: document.querySelector('#story-title'), storyCopy: document.querySelector('#story-copy'), storyQuote: document.querySelector('#story-quote'), storyProgress:document.querySelector('#story-progress'),storyObjective:document.querySelector('#story-objective'),storyButton: document.querySelector('#story-button'),tutorialHeroArt:document.querySelector('#tutorial-hero-art'),tutorialStep:document.querySelector('#tutorial-step'),tutorialTask:document.querySelector('#tutorial-task'),tutorialHint:document.querySelector('#tutorial-hint'),tutorialProgress:document.querySelector('#tutorial-progress'),
  biomeTitle: document.querySelector('#biome-title'), routeBiome: document.querySelector('#route-biome'), bossName: document.querySelector('#boss-name'),
  abilityCards: {
    undertowWell: { card: document.querySelector('#undertow-card'), fill: document.querySelector('#undertow-cooldown') },
    foxfireVolley: { card: document.querySelector('#flame-card'), fill: document.querySelector('#flame-cooldown') },
    wildHeart: { card: document.querySelector('#heart-card'), fill: document.querySelector('#heart-cooldown') },
    shockPaws: { card: document.querySelector('#ultimate-card'), fill: document.querySelector('#ultimate-cooldown') }
  },
  resultKicker: document.querySelector('#result-kicker'), resultCopy: document.querySelector('#result-copy'),
  resultTime: document.querySelector('#result-time'), resultCombo: document.querySelector('#result-combo'),
  resultDashes: document.querySelector('#result-dashes'), resultReward: document.querySelector('#result-reward'),
  profileSummary: document.querySelector('#profile-summary'),
  synergyStrip:document.querySelector('#synergy-strip'), levelupSubtitle:document.querySelector('#levelup-subtitle'),rerollButton:document.querySelector('#reroll-upgrades'),
  rerollCost:document.querySelector('#reroll-cost'), skipUpgrade:document.querySelector('#skip-upgrade'),
  eventKicker:document.querySelector('#event-kicker'), eventTitle:document.querySelector('#event-title'),
  eventCopy:document.querySelector('#event-copy'), eventQuote:document.querySelector('#event-quote'),
  guardianRewardKicker:document.querySelector('#guardian-reward-kicker'),guardianRewardTitle:document.querySelector('#guardian-reward-title'),guardianRewardCopy:document.querySelector('#guardian-reward-copy'),
  relicDraftKicker:document.querySelector('#relic-draft-kicker'),relicDraftTitle:document.querySelector('#relic-draft-title'),relicDraftCopy:document.querySelector('#relic-draft-copy'),
  roomTransition:document.querySelector('#room-transition'),roomTransitionKicker:document.querySelector('#room-transition-kicker'),
  roomTransitionTitle:document.querySelector('#room-transition-title'),roomTransitionSubtitle:document.querySelector('#room-transition-subtitle'),
  hubMenuKicker:document.querySelector('#hub-menu-kicker'), hubMenuTitle:document.querySelector('#hub-menu-title'),
  hubMenuCopy:document.querySelector('#hub-menu-copy'), hubShards:document.querySelector('#hub-shards'),
  dojoTargetName:document.querySelector('#dojo-target-name'),dojoTargetHealth:document.querySelector('#dojo-target-health'),dojoHealthFill:document.querySelector('#dojo-health-fill'),
  dojoDps:document.querySelector('#dojo-dps'),dojoTotalDamage:document.querySelector('#dojo-total-damage'),dojoBestDps:document.querySelector('#dojo-best-dps'),dojoKills:document.querySelector('#dojo-kills'),dojoStatuses:document.querySelector('#dojo-statuses'),
  dojoCycleTarget:document.querySelector('#dojo-cycle-target'),dojoToggleAi:document.querySelector('#dojo-toggle-ai'),dojoToggleDual:document.querySelector('#dojo-toggle-dual')
};

const PROFILE_KEY='brawlpaws-profile-v1';
const RUN_KEY='brawlpaws-run-v1';
const RUN_VERSION=1;
const DEFAULT_SETTINGS={screenShake:1,flashIntensity:1,damageNumbers:true,ambientMotion:true,minimap:true,masterVolume:.8,musicVolume:.55,sfxVolume:.85,abilityVolume:.85,uiVolume:.7};
const DEFAULT_CONTRACT_PROGRESS={spiritCull:0,eliteBreakers:0,foxfireHunt:0,sealRunner:0,guardianOath:0};
const DEFAULT_PROFILE={spiritShards:0,campaignClears:0,runsStarted:0,bestDifficulty:'',lastDifficulty:'ferocious',selectedHero:'kitsune',highestLevel:1,tutorialComplete:false,tutorialStep:0,vitalityRank:0,forgeRank:0,attunementRank:0,purseRank:0,ascensionRank:1,ascensionClears:0,unlockedHeroes:['kitsune','bamboo'],collectedWeapons:[],boundArsenal:{},discoveredEnemies:['groveMinion'],discoveredGuardians:[],contractProgress:DEFAULT_CONTRACT_PROGRESS,claimedContracts:[],settings:DEFAULT_SETTINGS};
function loadProfile(){
  try{
    const loaded={...DEFAULT_PROFILE,...JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')};
    loaded.settings={...DEFAULT_SETTINGS,...loaded.settings};
    loaded.settings.screenShake=[0,.35,1].includes(Number(loaded.settings.screenShake))?Number(loaded.settings.screenShake):1;
    loaded.settings.flashIntensity=[0,.35,1].includes(Number(loaded.settings.flashIntensity))?Number(loaded.settings.flashIntensity):1;
    loaded.settings.damageNumbers=loaded.settings.damageNumbers!==false;
    loaded.settings.ambientMotion=loaded.settings.ambientMotion!==false;
    loaded.settings.minimap=loaded.settings.minimap!==false;
    for(const key of ['masterVolume','musicVolume','sfxVolume','abilityVolume','uiVolume'])loaded.settings[key]=clamp(Number(loaded.settings[key]??DEFAULT_SETTINGS[key]),0,1);
    loaded.discoveredEnemies=Array.isArray(loaded.discoveredEnemies)?loaded.discoveredEnemies:['groveMinion'];
    loaded.discoveredGuardians=Array.isArray(loaded.discoveredGuardians)?loaded.discoveredGuardians:[];
    loaded.collectedWeapons=Array.isArray(loaded.collectedWeapons)?loaded.collectedWeapons:[];
    loaded.boundArsenal=loaded.boundArsenal&&typeof loaded.boundArsenal==='object'?loaded.boundArsenal:{};
    loaded.unlockedHeroes=Array.isArray(loaded.unlockedHeroes)?loaded.unlockedHeroes:['kitsune','bamboo'];
    loaded.contractProgress={...DEFAULT_CONTRACT_PROGRESS,...loaded.contractProgress};loaded.claimedContracts=Array.isArray(loaded.claimedContracts)?loaded.claimedContracts:[];
    if(loaded.campaignClears>0&&!loaded.unlockedHeroes.includes('hopscotch'))loaded.unlockedHeroes.push('hopscotch');
    if(loaded.campaignClears>0&&!loaded.unlockedHeroes.includes('nomi'))loaded.unlockedHeroes.push('nomi');
    if(loaded.campaignClears>=2&&!loaded.unlockedHeroes.includes('zap'))loaded.unlockedHeroes.push('zap');
    loaded.ascensionRank=clamp(Math.round(Number(loaded.ascensionRank)||1),1,10);loaded.ascensionClears=Math.max(0,Math.round(Number(loaded.ascensionClears)||0));
    if(loaded.ascensionClears>0&&!loaded.unlockedHeroes.includes('rusty'))loaded.unlockedHeroes.push('rusty');
    return loaded;
  }catch{return {...DEFAULT_PROFILE,settings:{...DEFAULT_SETTINGS},unlockedHeroes:[...DEFAULT_PROFILE.unlockedHeroes],collectedWeapons:[],boundArsenal:{},discoveredEnemies:[...DEFAULT_PROFILE.discoveredEnemies],discoveredGuardians:[],contractProgress:{...DEFAULT_CONTRACT_PROGRESS},claimedContracts:[]};}
}
function saveProfile(){try{localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));}catch{/* Storage can be unavailable in private contexts. */}}
let profile=loadProfile();
selectedHeroId=HEROES[debugHero]?debugHero:(HEROES[profile.selectedHero]&&profile.unlockedHeroes.includes(profile.selectedHero)?profile.selectedHero:'kitsune');
heroDef=HEROES[selectedHeroId];weapon=WEAPONS[heroDef.weapon];
let selectedDifficulty=DIFFICULTIES[debugDifficulty]?debugDifficulty:(DIFFICULTIES[profile.lastDifficulty]?profile.lastDifficulty:'ferocious');
if(selectedDifficulty==='ascension'&&profile.campaignClears<1&&debugDifficulty!=='ascension')selectedDifficulty='ferocious';
let runReward=0;

function activeDifficulty(){
  const base=DIFFICULTIES[selectedDifficulty]||DIFFICULTIES.ferocious;if(selectedDifficulty!=='ascension')return {...base,rank:0,enemyCountScale:base.enemyCountScale||1,spawnRateScale:base.spawnRateScale||1};
  const rank=clamp(profile.ascensionRank||1,1,10);return {...base,rank,healthScale:base.healthScale*(1+(rank-1)*.1),speedScale:base.speedScale*(1+(rank-1)*.022),damageScale:base.damageScale*(1+(rank-1)*.075),rewardScale:base.rewardScale*(1+(rank-1)*.065),enemyCountScale:(base.enemyCountScale||1)+(rank-1)*.045,spawnRateScale:(base.spawnRateScale||1)+(rank-1)*.025};
}

function expectedPowerForProgress(progress){return 1+progress*.18;}
function currentBuildPower(){
  if(!player)return 1;const abilityRanks=Object.values(player.abilityPower).reduce((sum,value)=>sum+Math.max(0,value-1),0)*.28;const unlockPower=player.unlockedAbilities.size*.14;const projectilePower=(player.bonusProjectiles+player.bonusPierces*.35+player.bonusRicochets*.5)*.12;const capstone=player.weaponEvolution?.2:0;const evolvedPower=Object.values(player.abilityEvolutions||{}).filter(Boolean).length*.16,pathPower=player.buildPath?.12:0,masteryPower=player.buildMastery?.2:0;
  return .55+player.damageMultiplier*(1/Math.max(.48,player.fireRateMultiplier))*.45+abilityRanks+unlockPower+projectilePower+capstone+evolvedPower+pathPower+masteryPower+Math.max(0,player.level-1)*.045;
}
function createCorruptionDirector(waveIndex,saved={}){
  const progress=chapterIndex*chapter.waves.length+waveIndex;const scripted=Math.min(CORRUPTION_TIERS.length-1,Math.floor(progress/3));const ahead=currentBuildPower()/expectedPowerForProgress(progress);const adaptive=ahead>1.75?2:ahead>1.34?1:0;const tier=clamp(saved.tier??scripted+adaptive,0,CORRUPTION_TIERS.length-1);const definition=CORRUPTION_TIERS[tier];
  return {tier,definition,progress,buildPower:ahead,killWindow:Number(saved.killWindow)||0,killClock:Number(saved.killClock)||0,reinforcementsUsed:Number(saved.reinforcementsUsed)||0,nextThreshold:Number(saved.nextThreshold)||Math.max(4,9-tier),surgeShown:Boolean(saved.surgeShown)};
}
function serializeCorruptionDirector(){if(!corruptionDirector)return null;return {tier:corruptionDirector.tier,killWindow:corruptionDirector.killWindow,killClock:corruptionDirector.killClock,reinforcementsUsed:corruptionDirector.reinforcementsUsed,nextThreshold:corruptionDirector.nextThreshold,surgeShown:corruptionDirector.surgeShown};}
function corruptionTier(){return corruptionDirector?.definition||CORRUPTION_TIERS[0];}
function refreshCorruptionHud({surge=false}={}){
  if(!ui.corruptionPanel)return;const tier=corruptionTier();ui.corruptionPanel.style.setProperty('--corruption',tier.color);ui.corruptionTier.textContent=tier.name;ui.corruptionCopy.textContent=tier.copy;ui.corruptionFill.style.width=`${Math.max(8,(corruptionDirector?.tier??0)/(CORRUPTION_TIERS.length-1)*100)}%`;if(surge){ui.corruptionPanel.classList.remove('surging');void ui.corruptionPanel.offsetWidth;ui.corruptionPanel.classList.add('surging');setTimeout(()=>ui.corruptionPanel.classList.remove('surging'),1700);}
}
function spawnCorruptionWarband(){
  if(!corruptionDirector||encounter.bossActive||encounter.transitioning)return;const tier=corruptionTier(),wave=chapter.waves[encounter.wave],difficulty=activeDifficulty(),b=room.combatBounds;const count=3+corruptionDirector.tier*2+coopPressure().reinforcements*2;const baseAngle=Math.atan2(player.y-b.y,player.x-b.x)+Math.PI;
  for(let i=0;i<count;i++){const angle=baseAngle+(i-(count-1)/2)*.12;const lane=.78+(i%3)*.055;const type=wave.roster[(enemies.length+i*3+corruptionDirector.reinforcementsUsed)%wave.roster.length];enemies.push(makeEnemy({type,eliteId:eliteModifierFor(enemies.length+i,encounter.wave,encounter.nodeType),delay:.18+i*.09,x:b.x+Math.cos(angle)*b.radiusX*lane,y:b.y+Math.sin(angle)*b.radiusY*lane,healthScale:wave.healthScale*difficulty.healthScale*tier.health,speedScale:wave.speedScale*difficulty.speedScale*tier.speed*1.06,damageScale:wave.damageScale*difficulty.damageScale*tier.damage},enemies.length+i));}
  corruptionDirector.reinforcementsUsed++;corruptionDirector.killWindow=0;corruptionDirector.nextThreshold=Math.max(4,corruptionDirector.nextThreshold-1);encounter.modifiers.corruption=serializeCorruptionDirector();saveRunCheckpoint({kind:'wave',wave:encounter.wave,modifiers:encounter.modifiers});spawnWord(player.x,player.y-140,'CORRUPTION WARBAND!',tier.color);effects.rings.push({x:player.x,y:player.y,radius:35,maxRadius:255,color:tier.color,life:.8,maxLife:.8});camera.shake=Math.max(camera.shake,9);refreshCorruptionHud({surge:true});playSfx('heavyImpact',.28,.82);
}
function recordCorruptionKill(){
  if(!corruptionDirector||corruptionDirector.definition.reinforcements+coopPressure().reinforcements<=corruptionDirector.reinforcementsUsed)return;corruptionDirector.killWindow++;corruptionDirector.killClock=0;if(corruptionDirector.killWindow>=corruptionDirector.nextThreshold)spawnCorruptionWarband();
}
function updateCorruptionDirector(dt){
  if(!corruptionDirector||encounter.bossActive||encounter.transitioning)return;corruptionDirector.killClock+=dt;corruptionDirector.huntClock=(corruptionDirector.huntClock||0)+dt;if(corruptionDirector.killClock>6){corruptionDirector.killClock=0;corruptionDirector.killWindow=0;}
  const huntInterval=Math.max(6,11-corruptionDirector.tier);if(corruptionDirector.tier>=3&&corruptionDirector.huntClock>=huntInterval){const active=enemies.filter((enemy)=>!enemy.dead&&enemy.state!=='waiting');if(active.length){corruptionDirector.huntClock=0;for(const enemy of active)enemy.huntTime=Math.max(enemy.huntTime||0,3.8);spawnWord(player.x,player.y-126,'THE PACK HUNTS!',corruptionTier().color);effects.rings.push({x:player.x,y:player.y,radius:20,maxRadius:210,color:corruptionTier().color,life:.58,maxLife:.58});refreshCorruptionHud({surge:true});playSfx('strike',.24,.82);}}
}

const CHAPTER_WARPACKS={
  jadeChapter:{name:'BELL RALLY',color:'#8cff39',formation:'arc',minWave:2,interval:18,count:5},
  bambooChapter:{name:'MOON PINCER',color:'#41f5da',formation:'pincer',minWave:2,interval:17,count:6},
  crimsonChapter:{name:'ONI PHALANX',color:'#ff5b27',formation:'wall',minWave:1,interval:16,count:7},
  stormChapter:{name:'TIDEBREAK FLANK',color:'#37dfff',formation:'pincer',minWave:1,interval:15,count:8},
  neonChapter:{name:'OVERCLOCK SQUAD',color:'#ff3ab8',formation:'cross',minWave:1,interval:14,count:9},
  shadowChapter:{name:'MIRROR HUNT',color:'#b84dff',formation:'mirror',minWave:1,interval:13,count:10}
};

function warpackPosition(formation,index,count,bounds,beat){
  const playerAngle=Math.atan2(player.y-bounds.y,player.x-bounds.x),side=index%2?1:-1,rank=Math.floor(index/2),spread=(rank-(Math.ceil(count/2)-1)/2)*.12;
  let angle=playerAngle+Math.PI+spread;
  if(formation==='pincer')angle=playerAngle+side*(Math.PI*.56+rank*.055);
  else if(formation==='wall')angle=playerAngle+Math.PI/2+(index-(count-1)/2)*.085;
  else if(formation==='cross')angle=playerAngle+Math.PI/4+(index%4)*Math.PI/2+Math.floor(index/4)*.06;
  else if(formation==='mirror')angle=playerAngle+(index<count/2?Math.PI:.08)+(index%Math.ceil(count/2)-(Math.ceil(count/2)-1)/2)*.1;
  const lane=.82+(index%3)*.045;
  return {x:bounds.x+Math.cos(angle)*bounds.radiusX*lane,y:bounds.y+Math.sin(angle)*bounds.radiusY*lane,beat};
}

function spawnChapterWarpack(){
  const doctrine=CHAPTER_WARPACKS[chapter.id],wave=chapter.waves[encounter.wave];if(!doctrine||!wave)return;
  const difficulty=activeDifficulty(),tier=corruptionTier(),party=coopPressure(),bounds=room.combatBounds;
  const count=Math.min(doctrine.count+Math.floor(encounter.wave/2)+party.reinforcements*2,14);
  for(let i=0;i<count;i++){
    const position=warpackPosition(doctrine.formation,i,count,bounds,encounter.warpackCount||0),type=wave.roster[(i*2+(encounter.warpackCount||0))%wave.roster.length];
    const rawSpeed=wave.speedScale*difficulty.speedScale*tier.speed*(1.05+chapterIndex*.015),speedScale=rawSpeed<=1?rawSpeed:Math.min(2.4,1+(rawSpeed-1)*.58);
    const enemy=makeEnemy({type,eliteId:eliteModifierFor(enemies.length+i,encounter.wave,encounter.nodeType),delay:.2+i*.1,spawnDuration:.62,x:position.x,y:position.y,healthScale:wave.healthScale*difficulty.healthScale*tier.health*party.health,speedScale,damageScale:wave.damageScale*difficulty.damageScale*tier.damage*party.damage},enemies.length+i);
    enemy.warpack=true;enemy.huntTime=doctrine.formation==='mirror'||doctrine.formation==='pincer'?3.2:1.8;enemies.push(enemy);
  }
  encounter.warpackCount=(encounter.warpackCount||0)+1;spawnWord(player.x,player.y-142,doctrine.name,doctrine.color);effects.rings.push({x:player.x,y:player.y,radius:26,maxRadius:245,color:doctrine.color,life:.72,maxLife:.72});camera.shake=Math.max(camera.shake,8);playSfx('heavyImpact',.24,.9);
}

function updateChapterWarpack(dt){
  const doctrine=CHAPTER_WARPACKS[chapter.id];if(!doctrine||encounter.bossActive||encounter.transitioning||encounter.wave<doctrine.minWave)return;
  const maxWarpackBeats=1+Math.floor(encounter.wave/2);if((encounter.warpackCount||0)>=maxWarpackBeats)return;
  const alive=enemies.some((enemy)=>!enemy.dead);if(!alive)return;
  encounter.warpackClock=(encounter.warpackClock??doctrine.interval*.78)-dt;
  if(encounter.warpackClock<=0){spawnChapterWarpack();encounter.warpackClock=doctrine.interval+Math.max(0,2-encounter.wave*.35);}
}

function refreshProfileUi(){
  const record=profile.campaignClears?`ASCENSION ${profile.ascensionRank}`:profile.bestDifficulty?`BEST ${profile.bestDifficulty.toUpperCase()}`:'NO CLEARS YET';
  ui.profileSummary.textContent=`SPIRIT SHARDS ${profile.spiritShards} / CAMPAIGN CLEARS ${profile.campaignClears} / ${record}`;
  for(const button of document.querySelectorAll('[data-difficulty]')){const ascension=button.dataset.difficulty==='ascension';const unlocked=!ascension||profile.campaignClears>0||debugDifficulty==='ascension';button.classList.toggle('selected',button.dataset.difficulty===selectedDifficulty);button.disabled=!unlocked;const label=button.querySelector('small');if(ascension&&label)label.textContent=unlocked?`RANK ${profile.ascensionRank}`:'LOCKED  CLEAR 1 RUN';}
  for(const button of document.querySelectorAll('[data-hero]')){
    const id=button.dataset.hero;const unlocked=profile.unlockedHeroes.includes(id)||id===debugHero;button.classList.toggle('locked',!unlocked);button.disabled=!unlocked;
    const label=button.querySelector('small');if(label)label.textContent=unlocked?HEROES[id].role.toUpperCase():id==='rusty'?'LOCKED  CLEAR ASCENSION':id==='zap'?'LOCKED  CLEAR 2 RUNS':id==='nomi'?'LOCKED  DEFEAT TSUKIKO':'LOCKED  CLEAR 1 RUN';
  }
}

function applyHeroUi(){
  shell.dataset.hero=selectedHeroId;shell.dataset.weapon=weapon.id;shell.style.setProperty('--hero-accent',heroDef.accent);ui.heroPortrait.style.setProperty('--hero-portrait',`url('${heroDef.portrait}')`);
  ui.heroName.textContent=heroDef.name.toUpperCase();ui.heroRole.textContent=heroDef.role.toUpperCase();ui.weaponName.textContent=weapon.name.toUpperCase();ui.dashName.textContent=heroDef.dashName.toUpperCase();
  ui.startHeroMark.style.backgroundImage=`url('${heroDef.portrait}')`;ui.startHeroName.textContent=heroDef.name.toUpperCase();
  ui.startHeroCopy.textContent=selectedHeroId==='bamboo'?`${heroDef.role}  Wide spirit cannon  ${heroDef.passiveName}`:`${heroDef.role}  Precision spirit blaster  ${heroDef.passiveName}`;
  ui.startHeroCopy.textContent=`${heroDef.role} / ${heroDef.difficulty} / ${heroDef.passiveName}`;
  ui.comparisonRatings.innerHTML=Object.entries(heroDef.ratings).map(([name,value])=>`<div class="comparison-rating"><b>${name.toUpperCase()}</b><span class="rating-pips">${Array.from({length:5},(_,index)=>`<i class="${index<value?'active':''}"></i>`).join('')}</span></div>`).join('');
  ui.comparisonWeapon.textContent=weapon.name.toUpperCase();ui.comparisonWeaponTags.textContent=weapon.tags.join(' / ');ui.comparisonWeaponCopy.textContent=weapon.summary;
  ui.comparisonWeaponStats.innerHTML=`<span><small>DAMAGE</small><b>${weapon.damage}</b></span><span><small>FIRE RATE</small><b>${(1/weapon.fireRate).toFixed(1)}/S</b></span><span><small>SHOTS</small><b>${(weapon.shots||1)*(weapon.baseVolleys||1)}</b></span><span><small>CRIT</small><b>${Math.round(weapon.criticalChance*100)}%</b></span>`;
  for(const button of document.querySelectorAll('[data-hero]'))button.classList.toggle('selected',button.dataset.hero===selectedHeroId);
  renderArsenalContract();
}

function equipWeapon(id,{announce=false}={}){
  const next=WEAPONS[id];if(!next)return false;weapon=next;if(player){player.weaponId=id;player.arsenalAwakened=id!==heroDef.weapon;player.legendArsenalAwakened=['embercoilRepeater','tempestChakram','moonpiercerRailbow'].includes(id);player.attack=null;player.shotCooldown=0;if(ARSENAL_BLUEPRINTS.some((entry)=>entry.id===id)&&!profile.collectedWeapons.includes(id)){profile.collectedWeapons.push(id);saveProfile();renderArsenalContract();}}
  shell.dataset.weapon=id;ui.weaponName.textContent=next.name.toUpperCase();
  if(announce){spawnWord(player.x,player.y-102,`${next.name.toUpperCase()} AWAKENED!`,next.color);effects.rings.push({x:player.x,y:player.y,radius:18,maxRadius:175,color:next.color,life:.72,maxLife:.72});}
  return true;
}

function selectHero(id,{returnToHub=false}={}){
  if(!HEROES[id]||(!profile.unlockedHeroes.includes(id)&&id!==debugHero)||(!['preview','hubMenu','hub'].includes(state)))return;
  selectedHeroId=id;heroDef=HEROES[id];weapon=WEAPONS[heroDef.weapon];profile.selectedHero=id;saveProfile();applyHeroUi();resetGame();
  if(returnToHub||state==='hubMenu'||state==='hub')enterHub();
}

function selectDifficulty(id){
  if(!DIFFICULTIES[id]||state!=='preview'||(id==='ascension'&&profile.campaignClears<1&&debugDifficulty!=='ascension'))return;
  selectedDifficulty=id;profile.lastDifficulty=id;saveProfile();refreshProfileUi();
}

const input = { keys: new Set(), pressed: new Set(), pointer: { x: 0, y: 0, active: false }, attack: false, attackHeld: false };
const camera = { x: room.playerSpawn.x, y: room.playerSpawn.y, zoom: 1, shake: 0, kick: 0 };
const effects = { particles: [], afterimages: [], numbers: [], words: [], rings: [], shards: [], projectiles: [], playerShots: [], vortices: [], shockStorms: [], flameBolts: [], fireTrails: [], blooms: [], spriteEffects: [], shockLinks: [], stars: [], enemyHazards: [], guardianSignatures: [], biomePressures: [] };
const combatWordCooldowns=new Map();
const props = [
  { col: 0, row: 0, x: 690, y: 530, scale: .62, radius: 44, light: '#ff9b2c' },
  { col: 1, row: 0, x: 1810, y: 560, scale: .56, radius: 42, light: '#2de9ff' },
  { col: 2, row: 0, x: 720, y: 880, scale: .48, radius: 38 },
  { col: 3, row: 0, x: 1770, y: 890, scale: .5, radius: 40 },
  { col: 0, row: 1, x: 815, y: 690, scale: .48, radius: 34 },
  { col: 0, row: 1, x: 1670, y: 710, scale: .48, radius: 30 },
  { col: 1, row: 1, x: 900, y: 1050, scale: .52, radius: 38, light: '#38e9ff' },
  { col: 2, row: 1, x: 1605, y: 1040, scale: .5, radius: 42 },
  { col: 2, row: 0, x: 1045, y: 690, scale: .22, radius: 18 },
  { col: 2, row: 0, x: 1470, y: 845, scale: .19, radius: 16 },
  { col: 3, row: 0, x: 1515, y: 670, scale: .18, radius: 18 },
  { col: 0, row: 1, x: 1095, y: 940, scale: .24, radius: 16 },
  { col: 0, row: 0, x: 455, y: 510, scale: .55, radius: 42, light: '#ff8f28', sway: .012 },
  { col: 1, row: 0, x: 2050, y: 520, scale: .54, radius: 42, light: '#35e7ff', sway: .01 },
  { col: 2, row: 1, x: 430, y: 980, scale: .48, radius: 39, sway: .018 },
  { col: 3, row: 0, x: 2070, y: 1010, scale: .5, radius: 40, sway: .016 },
  { col: 0, row: 1, x: 610, y: 330, scale: .3, radius: 20, light: '#d94cff', sway: .02 },
  { col: 0, row: 1, x: 1880, y: 350, scale: .3, radius: 20, light: '#d94cff', sway: .02 },
  { col: 1, row: 1, x: 760, y: 1190, scale: .47, radius: 34, light: '#31e5ff', sway: .012 },
  { col: 1, row: 1, x: 1760, y: 1180, scale: .47, radius: 34, light: '#31e5ff', sway: .012 },
  { col: 2, row: 0, x: 545, y: 760, scale: .22, radius: 18, sway: .025 },
  { col: 2, row: 0, x: 1980, y: 760, scale: .22, radius: 18, sway: .025 },
  { col: 0, row: 0, x: 865, y: 535, scale: .5, radius: 39, light: '#ff9428', sway: .012 },
  { col: 1, row: 0, x: 1655, y: 545, scale: .5, radius: 39, light: '#38e8ff', sway: .012 },
  { col: 2, row: 1, x: 905, y: 950, scale: .45, radius: 35, sway: .017 },
  { col: 3, row: 0, x: 1615, y: 945, scale: .46, radius: 36, sway: .016 },
  { col: 0, row: 1, x: 1080, y: 430, scale: .31, radius: 22, light: '#d94cff', sway: .02 },
  { col: 0, row: 1, x: 1440, y: 435, scale: .31, radius: 22, light: '#d94cff', sway: .02 },
  { col: 1, row: 1, x: 1040, y: 1040, scale: .42, radius: 31, light: '#35e7ff', sway: .014 },
  { col: 1, row: 1, x: 1480, y: 1040, scale: .42, radius: 31, light: '#35e7ff', sway: .014 },
  { col: 2, row: 0, x: 980, y: 675, scale: .19, radius: 16, sway: .024 },
  { col: 2, row: 0, x: 1540, y: 690, scale: .2, radius: 16, sway: .024 },
  { col: 3, row: 1, x: 820, y: 790, scale: .43, radius: 0, foreground: true, sway: .018 },
  { col: 3, row: 1, x: 1700, y: 820, scale: .45, radius: 0, foreground: true, sway: .018 },
  { col: 3, row: 1, x: 570, y: 760, scale: .58, radius: 0, foreground: true },
  { col: 3, row: 1, x: 1945, y: 790, scale: .62, radius: 0, foreground: true }
].map((prop) => ({
  ...prop,
  x: room.combatBounds.x + (prop.x - 1260) * 2.2,
  y: room.combatBounds.y + (prop.y - 750) * 2.0
}));

const ambientWisps = Array.from({ length: 18 }, (_, index) => ({
  x: room.combatBounds.x + Math.cos(index * 2.17) * (480 + (index % 5) * 275),
  y: room.combatBounds.y + Math.sin(index * 1.73) * (280 + (index % 4) * 185),
  phase: index * .71,
  scale: .42 + (index % 3) * .11
}));
const waterRipples = [
  { x: 870, y: 1940, scale: 1.1, phase: 0 }, { x: 1160, y: 2050, scale: .72, phase: 1.9 },
  { x: 3890, y: 1840, scale: 1.05, phase: .8 }, { x: 3650, y: 2020, scale: .68, phase: 2.6 },
  { x: 2380, y: 520, scale: .8, phase: 1.2 }
];

const SPRITE_ANIMATIONS = {
  idle: { fps: 4, frames: 1 }, run: { fps: 10, frames: 1 },
  attack1: { fps: 14, frames: 1, fallback: 'idle' }, attack2: { fps: 14, frames: 1, fallback: 'idle' },
  attack3: { fps: 12, frames: 1, fallback: 'idle' }, dash: { fps: 18, frames: 1, fallback: 'run' },
  cast: { fps: 10, frames: 1, fallback: 'idle' }, hit: { fps: 10, frames: 1, fallback: 'idle' },
  death: { fps: 8, frames: 1, fallback: 'hit' }
};
let enemies = [];
let player;
let state = 'preview';
let runTime = 0;
let lastTime = performance.now();
let hitStop = 0;
let clearDelay = -1;
let comboUiTimer = 0;
const lastSfxAt=new Map();
const AUDIO_SOURCES={blaster:'assets/audio/weapon-blaster.mp3',arrow:'assets/audio/weapon-arrow.mp3',slice:'assets/audio/weapon-magic-slice.mp3',impact:'assets/audio/impact-body.mp3',strike:'assets/audio/impact-strike.mp3',heavyImpact:'assets/audio/impact-heavy.mp3',dash:'assets/audio/dash-whoosh.mp3',heal:'assets/audio/ability-heal.mp3',upgrade:'assets/audio/upgrade-awaken.mp3',fire:'assets/audio/ability-fire.mp3',water:'assets/audio/ability-water.mp3',lightning:'assets/audio/ability-lightning.mp3',stomp:'assets/audio/boss-stomp.mp3'};
const audioSamples=Object.fromEntries(Object.entries(AUDIO_SOURCES).map(([id,src])=>[id,new Audio(src)]));
const MUSIC_TRACKS={
  menu:{src:'assets/audio/music-menu-upbeat.mp3',gain:1,rate:1},
  hub:{src:'assets/audio/music-spirit-woods.mp3',gain:.9,rate:1},
  jade:{src:'assets/audio/music-combat-orchestral.mp3',gain:.88,rate:1},
  bamboo:{src:'assets/audio/music-bamboo-heartfelt.ogg',gain:.9,rate:1},
  crimson:{src:'assets/audio/music-combat-rush.ogg',gain:.78,rate:1.02},
  storm:{src:'assets/audio/music-storm-ocean.ogg',gain:.82,rate:1},
  neon:{src:'assets/audio/music-neon-robotic.ogg',gain:.82,rate:1.04},
  shadow:{src:'assets/audio/music-shadow-dark.mp3',gain:.82,rate:1},
  guardianJade:{src:'assets/audio/music-boss-oh.mp3',gain:.88,rate:.94},
  guardianBamboo:{src:'assets/audio/music-boss-oh.mp3',gain:.9,rate:1},
  guardianCrimson:{src:'assets/audio/music-boss-heavy.mp3',gain:.84,rate:.96},
  guardianStorm:{src:'assets/audio/music-boss-heavy.mp3',gain:.86,rate:1},
  guardianNeon:{src:'assets/audio/music-boss-heavy.mp3',gain:.84,rate:1.05},
  guardianShadow:{src:'assets/audio/music-boss-heavy.mp3',gain:.88,rate:1.1}
};
const musicPlayers=[new Audio(),new Audio()];for(const musicPlayer of musicPlayers)musicPlayer.loop=true;
let audioUnlocked=false,activeMusicPlayer=0,activeMusicTrack='',musicFade=0;
let enemyId = 0;
let encounter;
let currentUpgradeChoices = [];
let pendingLevelUps = 0;
let currentRouteChoices = [];
let pendingRouteWave = 0;
let activeRouteEvent = null;
let roomInteractable = null;
let destructibles = [];
let tutorialActive=null;
let tutorialTypeTimer=null;
let roomMission = null;
let missionCheckpointClock = 0;
let defeatReason = '';
let roomTransitionTimer = 0;
let codexReturnState = 'preview';
let worldMapReturnState='playing';
let activeCodexTab = 'heroes';
let activeCodexId = null;
let runActive = false;
let pausedState = 'playing';
let settingsReturnState = 'preview';
let currentGuardianRewards = [];
let pendingGuardianReward = null;
let currentRelicChoices = [];
let relicDraftReturnState = 'playing';
let relicDraftContinuation = null;
let corruptionDirector = null;
const coop={peer:null,hostConnection:null,connections:new Map(),connected:false,isRoomHost:false,code:'',id:crypto.randomUUID(),hostId:null,members:new Map(),remotePlayers:new Map(),snapshotClock:0,presenceClock:0,applyingSignal:false};

function coopPartySize(){return coop.connected?Math.max(1,coop.members.size):1;}
function coopIsHost(){return coopPartySize()===1||coop.hostId===coop.id;}
function coopPressure(){const extra=Math.max(0,coopPartySize()-1);return {health:1+extra*.62,damage:1+extra*.16,count:1+extra*.34,elite:extra*.07,reward:1+extra*.18,reinforcements:extra};}
function activeEnemyLimit(){
  if(!encounter||encounter.bossActive||state==='dojo')return Number.POSITIVE_INFINITY;
  const ceiling=encounterActiveLimit({waveIndex:encounter.wave,chapterIndex,difficultyId:selectedDifficulty,partySize:coopPartySize(),elite:encounter.nodeType==='elite'||encounter.nodeType?.includes('Elite')});
  const pressure=campaignPressureCurve({chapterIndex,waveIndex:Math.max(0,encounter.wave),elapsed:encounter.waveTime||0,difficultyId:selectedDifficulty});return Math.min(ceiling,pressure.activeRamp);
}
function refreshCoopUi(message=''){
  const online=coop.connected;coopPanel?.classList.toggle('online',online);if(coopStatus)coopStatus.textContent=online?`${coopIsHost()?'HOST':'ALLY'} · ${coop.code} · ${coopPartySize()}/4`:'SOLO · OFFLINE READY';
  if(coopRoster)coopRoster.textContent=message||(online?[...coop.members.values()].map((member)=>`${member.name} ${member.hero.toUpperCase()}`).join(' · '):'FREE PEER-TO-PEER CO-OP · 2–4 PLAYERS INCREASE THE CHALLENGE');
  if(coopLeaveButton)coopLeaveButton.hidden=!online;if(coopCreateButton)coopCreateButton.hidden=online;if(coopJoinButton)coopJoinButton.hidden=online;if(coopCodeInput)coopCodeInput.readOnly=online;
}
function coopRoomCode(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const bytes=crypto.getRandomValues(new Uint8Array(5));return [...bytes].map((value)=>alphabet[value%alphabet.length]).join('');}
function coopMember(){return {id:coop.id,name:HEROES[selectedHeroId].name,hero:selectedHeroId,weaponId:player?.weaponId||heroDef.weapon,x:player?.x||room.playerSpawn.x,y:player?.y||room.playerSpawn.y,facing:player?.facing||0,health:player?.health||heroDef.maxHealth,state,room:room.id};}
function coopPeerId(code){return `brawlpaws-${code.toLowerCase()}`;}
function broadcastCoop(packet,except=null){for(const connection of coop.connections.values())if(connection!==except&&connection.open)connection.send(packet);}
function broadcastRoster(){if(!coop.isRoomHost)return;const packet={type:'roster',hostId:coop.id,members:[...coop.members.values()]};broadcastCoop(packet);handleCoopMessage(packet);}
function attachGuestConnection(connection){
  connection.on('open',()=>{if(coop.members.size>=4){connection.send({type:'error',message:'PARTY FULL'});connection.close();return;}const metadata=connection.metadata||{};const member={id:metadata.playerId||connection.peer,name:metadata.name||'BRAWLPAW',hero:HEROES[metadata.hero]?metadata.hero:'kitsune'};connection.memberId=member.id;coop.connections.set(member.id,connection);coop.members.set(member.id,member);connection.send({type:'welcome',hostId:coop.id});broadcastRoster();});
  connection.on('data',(packet)=>{if(!packet||typeof packet!=='object')return;handleCoopMessage(packet);broadcastCoop(packet,connection);});
  connection.on('close',()=>{if(!connection.memberId)return;coop.connections.delete(connection.memberId);coop.members.delete(connection.memberId);coop.remotePlayers.delete(connection.memberId);broadcastRoster();});
}
async function connectCoop(code,createRoom=false){
  const clean=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5);if(clean.length!==5){refreshCoopUi('ENTER A FIVE-CHARACTER PARTY CODE');return;}
  leaveCoop(false);coop.code=clean;coop.isRoomHost=createRoom;refreshCoopUi('CONNECTING TO THE PEER-TO-PEER SPIRIT ROAD…');
  let Peer;try{({Peer}=await import('https://esm.sh/peerjs@1.5.5?bundle'));}catch{refreshCoopUi('CO-OP LIBRARY UNAVAILABLE · SOLO STILL READY');return;}
  const peer=new Peer(createRoom?coopPeerId(clean):undefined,{debug:1});coop.peer=peer;
  peer.on('open',()=>{if(createRoom){coop.connected=true;coop.hostId=coop.id;coop.members.set(coop.id,coopMember());refreshCoopUi('PARTY CREATED · SHARE THE ROOM CODE');return;}const connection=peer.connect(coopPeerId(clean),{reliable:true,metadata:{playerId:coop.id,name:HEROES[selectedHeroId].name,hero:selectedHeroId}});coop.hostConnection=connection;connection.on('open',()=>{coop.connected=true;refreshCoopUi('PARTY CONNECTED · WAITING FOR HOST');});connection.on('data',(packet)=>handleCoopMessage(packet));connection.on('close',()=>leaveCoop(true,'HOST LEFT · SOLO MODE RESTORED'));connection.on('error',()=>leaveCoop(true,'CO-OP CONNECTION FAILED · SOLO STILL READY'));});
  peer.on('connection',(connection)=>{if(createRoom)attachGuestConnection(connection);else connection.close();});
  peer.on('error',(error)=>{const message=error?.type==='unavailable-id'?'ROOM CODE ALREADY EXISTS · CREATE ANOTHER':'CO-OP CONNECTION FAILED · SOLO STILL READY';leaveCoop(true,message);});
}
function leaveCoop(close=true,message=''){if(close){for(const connection of coop.connections.values())connection.close();coop.hostConnection?.close();coop.peer?.destroy();}coop.peer=null;coop.hostConnection=null;coop.connections.clear();coop.connected=false;coop.isRoomHost=false;coop.hostId=null;coop.members.clear();coop.remotePlayers.clear();coop.code='';refreshCoopUi(message);}
function sendCoop(type,payload={}){
  if(!coop.connected)return;let packet={type,...payload,playerId:coop.id,hero:selectedHeroId};if(type==='presence'){const member={...coopMember(),...payload};coop.members.set(coop.id,member);packet={type,playerId:coop.id,hero:selectedHeroId,member};}
  if(coop.isRoomHost)broadcastCoop(packet);else if(coop.hostConnection?.open)coop.hostConnection.send(packet);
}
function handleCoopMessage(raw){
  let packet;try{packet=typeof raw==='string'?JSON.parse(raw):raw;}catch{return;}if(!packet||typeof packet!=='object')return;
  if(packet.type==='error'){refreshCoopUi(packet.message||'CO-OP CONNECTION FAILED');return;}
  if(packet.type==='welcome'){coop.hostId=packet.hostId;refreshCoopUi();return;}
  if(packet.type==='roster'){coop.hostId=packet.hostId;coop.members=new Map(packet.members.map((member)=>[member.id,member]));for(const member of packet.members)if(member.id!==coop.id)coop.remotePlayers.set(member.id,member);for(const id of coop.remotePlayers.keys())if(!coop.members.has(id))coop.remotePlayers.delete(id);refreshCoopUi();return;}
  if(packet.type==='presence'&&packet.member?.id!==coop.id){coop.members.set(packet.member.id,packet.member);coop.remotePlayers.set(packet.member.id,packet.member);return;}
  if(packet.type==='action'&&packet.playerId!==coop.id)applyRemoteAction(packet.playerId,packet.hero,packet.payload); 
  if(packet.type==='signal'&&!coopIsHost())applyCoopSignal(packet.payload);
  if(packet.type==='snapshot'&&!coopIsHost())applyCoopSnapshot(packet.payload);
}
function applyRemoteAction(playerId,heroId,payload={}){
  const member=coop.members.get(playerId);const remoteWeapon=WEAPONS[payload.weaponId]||WEAPONS[member?.weaponId]||WEAPONS[HEROES[heroId]?.weapon];if(!member||!remoteWeapon||payload.kind!=='attack')return;const angle=Number(payload.facing)||0;const direction={x:Math.cos(angle),y:Math.sin(angle)};const pellets=remoteWeapon.shots||1;const volleys=remoteWeapon.baseVolleys||1;
  for(let volley=0;volley<volleys;volley++)for(let i=0;i<pellets;i++){const side=volleys===1?0:(volley?1:-1),shotAngle=angle+(i-(pellets-1)/2)*(remoteWeapon.spread||0)+side*.035,type=remoteWeapon.projectileType,glaive=type==='glaive',gale=type==='gale';effects.playerShots.push({x:member.x+direction.x*48-direction.y*side*12,y:member.y+direction.y*48-7+direction.x*side*12,vx:Math.cos(shotAngle)*remoteWeapon.projectileSpeed,vy:Math.sin(shotAngle)*remoteWeapon.projectileSpeed,radius:remoteWeapon.projectileRadius||9,damage:remoteWeapon.damage*.78,baseDamage:remoteWeapon.damage*.78,color:remoteWeapon.color,arrow:type==='arrow',trickshot:type==='trickshot',arc:type==='arc',frost:type==='frost',mortar:type==='mortar',glaive,gale,knockback:remoteWeapon.knockback,criticalChance:remoteWeapon.criticalChance,blastRadius:remoteWeapon.blastRadius,blastDamage:(remoteWeapon.blastDamage||0)*.78,remoteOwner:glaive||gale?member:null,returnSpeed:remoteWeapon.returnSpeed||1100,ricochets:remoteWeapon.ricochets||0,ricochetRetention:.78,pierces:glaive||gale?99:remoteWeapon.pierces||0,hitIds:new Set(),life:remoteWeapon.projectileLife,maxLife:remoteWeapon.projectileLife});}
  burst(member.x+direction.x*44,member.y+direction.y*44,remoteWeapon.impactColor,10,220,3);
}
function coopSignal(payload){if(coopIsHost())sendCoop('signal',{payload});}
function applyCoopSignal(payload){if(!payload)return;coop.applyingSignal=true;if(payload.kind==='wave'){setChapter(payload.chapter);startWave(payload.wave,{nodeType:payload.nodeType||'combat'});}else if(payload.kind==='boss'){setChapter(payload.chapter);spawnBoss();}coop.applyingSignal=false;}
function applyCoopSnapshot(payload){
  if(!payload||payload.room!==room.id)return;for(const saved of payload.enemies||[]){let enemy=enemies.find((candidate)=>candidate.id===saved.id);if(!enemy){enemy=makeEnemy({type:saved.type,x:saved.x,y:saved.y,delay:0,healthScale:1,speedScale:1,damageScale:1},enemies.length);enemy.id=saved.id;enemies.push(enemy);}Object.assign(enemy,saved);enemy.def=ENEMIES[enemy.type];}
  const ids=new Set((payload.enemies||[]).map((enemy)=>enemy.id));for(const enemy of enemies)if(!ids.has(enemy.id))enemy.dead=true;
}
function updateCoop(dt){
  if(!player)return;const worldPosition=expeditionWorldPosition(room.id,player.x,player.y);player.worldX=worldPosition.x;player.worldY=worldPosition.y;player.currentRegion=room.id;
  if(!coop.connected)return;coop.presenceClock-=dt;coop.snapshotClock-=dt;if(coop.presenceClock<=0){coop.presenceClock=.08;sendCoop('presence',{x:player.x,y:player.y,worldX:worldPosition.x,worldY:worldPosition.y,facing:player.facing,health:player.health,hero:selectedHeroId,state,room:room.id});}
  if(coopIsHost()&&coop.snapshotClock<=0&&state==='playing'){coop.snapshotClock=.1;sendCoop('snapshot',{payload:{room:room.id,enemies:enemies.map(({id,type,x,y,vx,vy,facing,state,stateTime,health,maxHealth,shield,maxShield,dead,deathTime,burnTime,wetTime,shockTime,stunTime,bleedTime,bleedPower,curseTime,curseMultiplier,shieldTime,conductiveStacks,conductiveTime,bossPhase,counterTime,chillStacks,chillTime,freezeTime})=>({id,type,x,y,vx,vy,facing,state,stateTime,health,maxHealth,shield,maxShield,dead,deathTime,burnTime,wetTime,shockTime,stunTime,bleedTime,bleedPower,curseTime,curseMultiplier,shieldTime,conductiveStacks,conductiveTime,bossPhase,counterTime,chillStacks,chillTime,freezeTime}))}});}
}

const CORRUPTION_TIERS=[
  {id:'dormant',name:'DORMANT',color:'#52eaff',health:1,speed:1,damage:1,count:1,spawn:1,elite:0,reward:1,reinforcements:0,copy:'THE GROVE IS QUIET'},
  {id:'stirring',name:'STIRRING',color:'#78ef63',health:1.08,speed:1.06,damage:1.05,count:1.06,spawn:1.08,elite:.04,reward:1.06,reinforcements:0,copy:'SPIRITS GATHER'},
  {id:'hunting',name:'HUNTING',color:'#ffd13a',health:1.18,speed:1.13,damage:1.12,count:1.13,spawn:1.18,elite:.1,reward:1.14,reinforcements:1,copy:'WARPACKS TRACK YOUR SCENT'},
  {id:'ravenous',name:'RAVENOUS',color:'#ff7a31',health:1.31,speed:1.21,damage:1.22,count:1.22,spawn:1.3,elite:.18,reward:1.24,reinforcements:2,copy:'THE CURSE FEEDS ON POWER'},
  {id:'cataclysm',name:'CATACLYSM',color:'#ff365f',health:1.48,speed:1.31,damage:1.36,count:1.34,spawn:1.46,elite:.28,reward:1.38,reinforcements:3,copy:'NO SAFE GROUND REMAINS'},
  {id:'apocalypse',name:'APOCALYPSE',color:'#d94cff',health:1.7,speed:1.42,damage:1.55,count:1.5,spawn:1.65,elite:.4,reward:1.58,reinforcements:4,copy:'THE SPIRIT ROAD BREAKS'}
];

function serializePlayerCheckpoint(){
  if(!player)return null;
  const worldPosition=expeditionWorldPosition(room.id,player.x,player.y);
  return {
    ...player,x:room.playerSpawn.x,y:room.playerSpawn.y,worldX:worldPosition.x,worldY:worldPosition.y,currentRegion:room.id,vx:0,vy:0,attack:null,shotCooldown:0,dashTime:0,dashCooldown:0,invulnerable:1.1,flash:0,hurtTime:0,stunTime:0,bleedTime:0,bleedTick:0,curseTime:0,curseMultiplier:1,castTime:0,ultimateFlash:0,wildHeartTime:0,braceTime:0,braced:false,
    unlockedAbilities:[...player.unlockedAbilities],synergies:[...player.synergies],eventHistory:[...player.eventHistory],shopPurchases:[...player.shopPurchases],discoveredRegions:[...(player.discoveredRegions||[])],clearedRegions:[...(player.clearedRegions||[])]
  };
}

function validRunSnapshot(snapshot){
  if(!snapshot||snapshot.version!==RUN_VERSION||!HEROES[snapshot.heroId]||!DIFFICULTIES[snapshot.difficulty])return false;
  if(!Number.isInteger(snapshot.chapterIndex)||snapshot.chapterIndex<0||snapshot.chapterIndex>=CHAPTER_ORDER.length||!snapshot.player)return false;
  const checkpoint=snapshot.checkpoint;const allowed=['story','wave','route','boss','guardianReward'];if(!checkpoint||!allowed.includes(checkpoint.kind))return false;
  const savedChapter=ENCOUNTERS[CHAPTER_ORDER[snapshot.chapterIndex]];
  if(checkpoint.kind==='wave'&&(!Number.isInteger(checkpoint.wave)||checkpoint.wave<0||checkpoint.wave>=savedChapter.waves.length))return false;
  if(checkpoint.kind==='route'&&(!Number.isInteger(checkpoint.nextWave)||checkpoint.nextWave<1||checkpoint.nextWave>=savedChapter.waves.length))return false;
  if(checkpoint.kind==='guardianReward'&&!GUARDIAN_REWARDS[checkpoint.guardianId])return false;
  return true;
}

function loadRunCheckpoint(){
  try{const snapshot=JSON.parse(localStorage.getItem(RUN_KEY)||'null');if(validRunSnapshot(snapshot))return snapshot;if(snapshot)localStorage.removeItem(RUN_KEY);}catch{/* Ignore unavailable or corrupt storage. */}
  return null;
}

function checkpointLabel(snapshot){
  if(!snapshot)return '';
  const savedChapter=ENCOUNTERS[CHAPTER_ORDER[snapshot.chapterIndex]];const point=snapshot.checkpoint;
  if(point.kind==='boss')return `CHAPTER ${snapshot.chapterIndex+1}  GUARDIAN`;
  if(point.kind==='guardianReward')return `CHAPTER ${snapshot.chapterIndex+1}  GUARDIAN REWARD`;
  if(point.kind==='route')return `CHAPTER ${snapshot.chapterIndex+1}  CHOOSE WAVE ${point.nextWave+1}`;
  if(point.kind==='wave')return `CHAPTER ${snapshot.chapterIndex+1}  WAVE ${point.wave+1}`;
  return `CHAPTER ${snapshot.chapterIndex+1}  ${savedChapter.name.toUpperCase()}`;
}

function refreshContinueRunUi(){
  const snapshot=loadRunCheckpoint();continueRunButton.hidden=!snapshot;
  if(snapshot)continueRunCopy.textContent=checkpointLabel(snapshot);
}

function saveRunCheckpoint(checkpoint){
  if(!runActive||!player||debugBoss||debugRoute>0||debugParams.has('chapter')||Boolean(debugSystem))return;
  const snapshot={version:RUN_VERSION,savedAt:Date.now(),heroId:selectedHeroId,difficulty:selectedDifficulty,chapterIndex,runTime,checkpoint:{...checkpoint,region:room.id},world:{id:EXPEDITION_WORLD.id,discovered:[...(player.discoveredRegions||new Set([room.id]))],cleared:[...(player.clearedRegions||new Set())]},player:serializePlayerCheckpoint()};
  try{localStorage.setItem(RUN_KEY,JSON.stringify(snapshot));}catch{/* Run remains playable when storage is unavailable. */}
  refreshContinueRunUi();
}

function clearRunCheckpoint(){try{localStorage.removeItem(RUN_KEY);}catch{/* Storage can be unavailable. */}refreshContinueRunUi();}

function restorePlayerCheckpoint(saved){
  const restored={...saved};
  const migratedAbilities=(Array.isArray(saved.unlockedAbilities)?saved.unlockedAbilities:[]).map((id)=>id==='riptide'?'undertowWell':id);
  restored.unlockedAbilities=new Set(migratedAbilities);
  restored.abilityCooldowns={...player.abilityCooldowns,...saved.abilityCooldowns};if('riptide' in restored.abilityCooldowns){restored.abilityCooldowns.undertowWell=restored.abilityCooldowns.riptide;delete restored.abilityCooldowns.riptide;}
  restored.abilityPower={...player.abilityPower,...saved.abilityPower};if('riptide' in restored.abilityPower){restored.abilityPower.undertowWell=restored.abilityPower.riptide;delete restored.abilityPower.riptide;}
  restored.abilityEvolutions={...player.abilityEvolutions,...saved.abilityEvolutions};
  restored.upgradeRanks={...player.upgradeRanks,...saved.upgradeRanks};
  restored.arcChainBonus=Number(saved.arcChainBonus)||0;restored.arcChainPower=Number(saved.arcChainPower)||1;restored.arcChainRange=Number(saved.arcChainRange)||0;
  restored.synergies=new Set(Array.isArray(saved.synergies)?saved.synergies:[]);
  restored.eventHistory=new Set(Array.isArray(saved.eventHistory)?saved.eventHistory:[]);
  restored.shopPurchases=new Set(Array.isArray(saved.shopPurchases)?saved.shopPurchases:[]);
  restored.discoveredRegions=new Set(Array.isArray(saved.discoveredRegions)?saved.discoveredRegions:[saved.currentRegion||chapter.room]);restored.clearedRegions=new Set(Array.isArray(saved.clearedRegions)?saved.clearedRegions:[]);
  Object.assign(player,restored,{x:room.playerSpawn.x,y:room.playerSpawn.y,vx:0,vy:0,attack:null,dashTime:0,shotCooldown:0,aimFacing:Number.isFinite(restored.aimFacing)?restored.aimFacing:(restored.facing??-Math.PI/2),moveFacing:Number.isFinite(restored.moveFacing)?restored.moveFacing:(restored.facing??-Math.PI/2),aimLockTime:0,invulnerable:1.1,flash:0,hurtTime:0,stunTime:0,bleedTime:0,bleedTick:0,curseTime:0,curseMultiplier:1,castTime:0,ultimateFlash:0,wildHeartTime:0,braceTime:0,braced:false});player.maxSpiritShield=Math.max(0,Number(player.maxSpiritShield)||0);player.spiritShield=clamp(Number(player.spiritShield)||0,0,player.maxSpiritShield);
  equipWeapon(WEAPONS[player.weaponId]?player.weaponId:heroDef.weapon);player.health=clamp(Number(player.health)||1,1,player.maxHealth);camera.x=player.x;camera.y=player.y;camera.shake=0;resolveSynergies();
}

function resumeSavedRun(){
  const snapshot=loadRunCheckpoint();if(!snapshot){refreshContinueRunUi();return;}
  ensureAudio();input.attack=false;input.attackHeld=false;input.keys.clear();
  selectedHeroId=snapshot.heroId;heroDef=HEROES[selectedHeroId];weapon=WEAPONS[heroDef.weapon];selectedDifficulty=snapshot.difficulty;applyHeroUi();refreshProfileUi();
  resetGame();setChapter(snapshot.chapterIndex);player.discoveredRegions=new Set(snapshot.world?.discovered||snapshot.player.discoveredRegions||[chapter.room]);player.clearedRegions=new Set(snapshot.world?.cleared||snapshot.player.clearedRegions||[]);restorePlayerCheckpoint(snapshot.player);runTime=Math.max(0,Number(snapshot.runTime)||0);runActive=true;
  startScreen.classList.remove('active');resultScreen.classList.remove('active');hud.classList.remove('hidden');
  const point=snapshot.checkpoint;
  if(point.kind==='boss')spawnBoss({restoring:true});
  else if(point.kind==='guardianReward')openGuardianReward(point.guardianId);
  else if(point.kind==='route'){if(point.region&&ROOMS[point.region])activateRoom(point.region,{reposition:true});openRoute(point.nextWave);}
  else if(point.kind==='wave')startWave(point.wave,{...(point.modifiers||{}),resumeRegion:point.region});
  else showStory(['intro','interlude2','interlude4','boss','epilogue'].includes(point.beat)?point.beat:'intro');
  updateHud();
}

function pauseGame(){
  if(!['playing','dojo','hub'].includes(state))return;pausedState=state;state='paused';input.keys.clear();input.attackHeld=false;pauseScreen.classList.add('active');
  document.querySelector('#save-title-button').textContent=runActive?'SAVE CHECKPOINT & TITLE':'RETURN TO TITLE';
}

function resumeGame(){if(state!=='paused')return;pauseScreen.classList.remove('active');state=pausedState;lastTime=performance.now();}

function refreshSettingsUi(){
  for(const button of settingsScreen.querySelectorAll('[data-setting]')){
    const key=button.dataset.setting;const raw=button.dataset.value;const value=raw==='true'?true:raw==='false'?false:Number(raw);
    button.classList.toggle('selected',profile.settings[key]===value);
  }
  for(const slider of settingsScreen.querySelectorAll('[data-audio-setting]')){const key=slider.dataset.audioSetting;slider.value=profile.settings[key];const output=settingsScreen.querySelector(`[data-audio-output="${key}"]`);if(output)output.value=`${Math.round(profile.settings[key]*100)}%`;}
}

function openSettings(returnState=state){
  if(state==='settings')return;settingsReturnState=returnState;state='settings';settingsScreen.classList.add('active');refreshSettingsUi();input.keys.clear();input.attackHeld=false;
}

function closeSettings(){if(state!=='settings')return;settingsScreen.classList.remove('active');state=settingsReturnState||'preview';lastTime=performance.now();}

function changeSetting(key,raw){
  if(!(key in DEFAULT_SETTINGS))return;profile.settings[key]=raw==='true'?true:raw==='false'?false:Number(raw);saveProfile();refreshSettingsUi();applyAudioMix();
}

for(const slider of settingsScreen.querySelectorAll('[data-audio-setting]'))slider.addEventListener('input',()=>changeSetting(slider.dataset.audioSetting,slider.value));

function returnToTitle(){
  runActive=false;pauseScreen.classList.remove('active');settingsScreen.classList.remove('active');dojoPanel.classList.remove('active');
  resetGame();state='preview';startScreen.classList.add('active');resultScreen.classList.remove('active');hud.classList.add('hidden');refreshContinueRunUi();refreshProfileUi();
}

function motionTime(divisor=1000,fallback=17.25){return profile.settings.ambientMotion?performance.now()/divisor:fallback;}

const ENEMY_CODEX_NOTES = {
  groveMinion:{lore:'A timid grove spirit twisted into the curse\'s first foot soldier.',counter:'Keep firing while circling. Its short swipe only threatens careless approaches.'},
  jadeBrawler:{lore:'A shrine raider that commits its whole body to a fast lunging claw.',counter:'Bait the red warning, dodge across its flank, then punish the recovery.'},
  spiritArcher:{lore:'A disciplined bow spirit that prefers the far edge of every fight.',counter:'Change direction after the bow is drawn. Rush it while the arrow is in flight.'},
  armoredBoar:{lore:'A stone-plated enforcer whose sledgehammer can stun a BrawlPaw cold.',counter:'Leave the marked slam circle before impact. Its long recovery is your opening.'},
  bellweaverCat:{lore:'A corrupted cantor that rings lesser spirits out of broken shrine bells.',counter:'Break line of sight during the ritual, then focus the Bellweaver before its summons fill the arena.'},
  mistclawLynx:{lore:'A crimson assassin that vanishes into mist before committing to one lethal line.',counter:'Watch the destination mark, move perpendicular to it, and punish the revealed strike.'},
  bambooStalker:{lore:'A reedblade hunter bred to close space faster than ordinary grove spirits.',counter:'Do not retreat in a straight line. Cut across its lunge and fire into its back.'},
  sporeArcher:{lore:'A hollow marksman whose arrows carry luminous fungal spores.',counter:'Pressure it early; open ground gives its projectiles too much room to spread.'},
  mossBrute:{lore:'A massive root-bound bruiser that trades speed for crushing area control.',counter:'Hold medium range and save your dash for the hammer impact, not the windup.'},
  powderkegToad:{lore:'A reckless sapper that predicts your route and plants a delayed spirit bomb there.',counter:'Break your movement pattern when the fuse appears. Never dodge back into the marked blast.'},
  emberAkita:{lore:'A dojo duelist that turns every missed shot into a chance to close distance.',counter:'Strafe around cover and reserve crowd control for its final approach.'},
  gongwing:{lore:'A winged bell-keeper firing resonant bolts from beyond melee reach.',counter:'Close diagonally between volleys and force it away from its preferred orbit.'},
  ironhorn:{lore:'A crimson executioner carrying enough armor to walk through light fire.',counter:'Draw out the slam, unload during recovery, and use Wet to keep it contained.'},
  gatewardenRhino:{lore:'An oathbound sentinel protected by a regenerating forward spirit ward.',counter:'Shots from the front feed its shield. Flank it, break the ward, then burst before it reforms.'},
  tidebladeOtter:{lore:'A harbor duelist carrying twin blades sharpened by the storm tide.',counter:'Its cross-cut is fast but narrow. Step through the outside edge and punish the full-body follow-through.'},
  galecrestGull:{lore:'A high-perched storm archer that draws lightning directly into its bowstring.',counter:'Change direction after the bow reaches full draw, then close while the lightning arrow is in flight.'},
  reefbreakerWalrus:{lore:'A siege veteran whose anchor hammer can stun an entire landing party.',counter:'Respect the large tide marker. The hammer cannot turn once it starts falling.'}
  ,tidechantHeron:{lore:'A storm priest that turns Raijin\'s drowned choir into battlefield-wide tide lanes.',counter:'The chant locks the lane before the surge arrives. Cross the dashed edge, then focus the exposed conductor.'}
  ,circuitJackal:{lore:'A city executioner whose twin energy tonfa cross before its whole body flashes through a target.',counter:'Step outside the crossed warning and punish the Jackal after both tonfa finish their arc.'}
  ,pulsewingCrow:{lore:'A masked data archer that draws corrupted city light directly into its bow.',counter:'Watch the visible full draw, change direction at release, then rush the exposed Crow.'}
  ,chromebackGorilla:{lore:'A reactor-backed enforcer whose pile-driver fist crashes entire circuit blocks.',counter:'Leave the large kernel marker before impact. Its overheated arm creates a long damage window.'}
  ,kernelHackerTanuki:{lore:'A Shogun Core controller that predicts escape routes and compiles them into sprint-draining snares.',counter:'Break your route when the triangular glyph appears. Leave the marked zone before it compiles.'}
  ,shadowstepFerret:{lore:'A twin-blade hunter woven from the choices abandoned by earlier runs.',counter:'Its crescent lunge is brutally fast but commits to one line. Cross the warning instead of outrunning it.'}
  ,veilwingOwl:{lore:'An archive seer that turns forgotten futures into long-range moon bolts.',counter:'Break direction at full draw, then close before the next hollow-moon orb forms.'}
  ,gravebackBear:{lore:'A palace executioner carrying a tombstone hammer heavy enough to stun an entire squad.',counter:'Leave the eclipse marker early. The hammer cannot redirect after the Bear lifts both feet.'}
  ,moonveilSeer:{lore:'A hollow-moon oracle that marks living choices for Tsukiko to erase.',counter:'Dodge the crescent. If marked, sustain a sprint until the curse cleanses before taking another hit.'}
};

const BEHAVIOR_LABELS={basic:'SWARMER',melee:'DUELIST',ranged:'MARKSMAN',heavy:'BRUISER',summoner:'SUMMONER',bomber:'BOMBER',assassin:'ASSASSIN',shield:'WARDEN',conductor:'CONDUCTOR',hacker:'CONTROLLER',curser:'ORACLE',boss:'GUARDIAN'};
const STATUS_ART={burn:'assets/vfx/burn-status.png',wet:'assets/vfx/water-impact.png',shock:'assets/vfx/shock-paws-impact.png',stun:'assets/vfx/hammer-slam.png',bleed:'assets/vfx/claw-slash.png',curse:'assets/vfx/shadow-realm-vfx-v1.png',shield:'assets/vfx/special-enemy-vfx.png'};
const SPECIALIST_ART={bellweaverCat:'bellweaver-cat',powderkegToad:'powderkeg-toad',gatewardenRhino:'gatewarden-rhino',mistclawLynx:'mistclaw-lynx',tidechantHeron:'tidechant-heron-v1',kernelHackerTanuki:'kernel-hacker-tanuki-v1',moonveilSeer:'moonveil-seer-v1'};
const BOSS_ART={jadeguardTanuki:'jadeguard-tanuki-v2',moonfangKomainu:'moonfang-komainu',pyreclawShogun:'pyreclaw-shogun',raijinKirin:'raijin-kirin-v1',daikyoOni:'daikyo-oni-v1',tsukikoEmpress:'tsukiko-empress-v1'};

function codexArtFor(entry,tab){
  if(tab==='heroes')return {image:entry.portrait,size:'cover',position:'center'};
  if(tab==='statuses')return {image:STATUS_ART[entry.id],size:'cover',position:'center'};
  if(BOSS_ART[entry.id])return {image:`assets/characters/${BOSS_ART[entry.id]}.png`,size:'300% 200%',position:'0% 0%'};
  if(SPECIALIST_ART[entry.id])return {image:`assets/characters/${SPECIALIST_ART[entry.id]}.png`,size:'400% 600%',position:'0% 0%'};
  const columns=3;const x=(entry.spriteColumn||0)/(columns-1)*100;
  if(entry.biome==='bamboo')return {image:'assets/characters/bamboo-enemies-v3.png',size:'300% 200%',position:`${x}% 0%`};
  if(entry.biome==='crimson')return {image:'assets/characters/crimson-enemies.png',size:'300% 200%',position:`${x}% 0%`};
  if(entry.biome==='storm')return {image:'assets/characters/storm-enemies-v1.png',size:'300% 200%',position:`${x}% 0%`};
  if(entry.biome==='neon')return {image:'assets/characters/neon-enemies-v1.png',size:'300% 200%',position:`${x}% 0%`};
  if(entry.biome==='shadow')return {image:'assets/characters/shadow-enemies-v1.png',size:'300% 200%',position:`${x}% 0%`};
  return {image:'assets/characters/enemy-roster-animated.png',size:'300% 400%',position:`${x}% 0%`};
}

function codexEntries(tab){
  if(tab==='heroes')return Object.values(HEROES);
  if(tab==='statuses')return Object.values(STATUS_EFFECTS);
  const guardians=Object.values(ENEMIES).filter((entry)=>entry.behavior==='boss');
  return tab==='guardians'?guardians:Object.values(ENEMIES).filter((entry)=>entry.behavior!=='boss');
}

function codexEntryUnlocked(entry,tab){
  if(tab==='heroes')return profile.unlockedHeroes.includes(entry.id)||entry.id===debugHero;
  if(tab==='statuses')return true;
  return (tab==='guardians'?profile.discoveredGuardians:profile.discoveredEnemies).includes(entry.id);
}

function discoverEnemy(definition){
  const key=definition.behavior==='boss'?'discoveredGuardians':'discoveredEnemies';
  if(profile[key].includes(definition.id))return;
  profile[key].push(definition.id);saveProfile();
  if(state==='codex')renderCodex(activeCodexTab);
}

function codexStyle(entry,tab){
  const art=codexArtFor(entry,tab);const color=entry.accent||entry.color||'#42eaf4';
  return `--codex:${color};--codex-image:url('${art.image}');--codex-size:${art.size};--codex-position:${art.position}`;
}

function renderCodexDetail(entry,tab,unlocked){
  const style=codexStyle(entry,tab);
  codexDetail.className=`codex-detail${unlocked?'':' locked'}`;codexDetail.setAttribute('style',style);
  if(!unlocked){const heroLock=tab==='heroes';const heroNote=entry.id==='rusty'?'Complete one full Ascension campaign to prove you can handle Rusty"s twin Trickshots.':entry.id==='zap'?'Complete two full campaigns to unlock Zap and the Twin Arc Casters.':'Defeat Tsukiko and finish all six chapters to add this BrawlPaw to the roster.';codexDetail.innerHTML=`<div class="codex-detail-hero"><div class="codex-detail-art"></div><div><h3>${heroLock?'LOCKED BRAWLPAW':'UNRECORDED SPIRIT'}</h3><span class="codex-role">${heroLock?(entry.id==='rusty'?'ASCENSION CLEAR REQUIRED':entry.id==='zap'?'TWO CAMPAIGN CLEARS REQUIRED':'CAMPAIGN CLEAR REQUIRED'):'ENCOUNTER REQUIRED'}</span><p>${heroLock?(entry.unlockRequirement||'Complete a campaign challenge to unlock this hero.'):'This archive entry will reveal itself after the spirit appears in a run.'}</p></div></div><div class="codex-tip"><small>ARCHIVIST NOTE</small><b>${heroLock?heroNote:'Explore later chapters, elite routes, and guardian chambers to complete the record.'}</b></div>`;return;}
  if(tab==='heroes'){
    const heroWeapon=WEAPONS[entry.weapon];const capstones={kitsune:['PHASE NOVA','After Spirit Cylinder II and Phase Rounds I at level 7, every fifth volley pierces deeply and detonates the surrounding pack.'],bamboo:['SIEGE LOTUS','After Scatter Bore I and Guardian Hide I at level 7, every third blast loads a giant central shell with explosive knockback.'],hopscotch:['MOON CONSTELLATION','After Moon Piercer II and Perfect Draw I at level 7, every fourth full draw splits into two seeking moon arrows.'],rusty:['DEADEYE CIRCUIT','After Bank Shot II and Loaded Dice I at level 7, every sixth volley becomes a guaranteed critical execution chain.'],zap:['THUNDERHEAD ARRAY','After Capacitor Bank II and Chain Logic I at level 7, every third discharge overloads and chains through the entire nearby pack.']};const capstone=capstones[entry.id];
    codexDetail.innerHTML=`<div class="codex-detail-hero"><div class="codex-detail-art"></div><div><h3>${entry.name.toUpperCase()}</h3><span class="codex-role">${entry.role.toUpperCase()} / ${entry.difficulty.toUpperCase()}</span><p>${entry.summary}</p></div></div><div class="codex-stats"><span><small>HEALTH</small><b>${entry.maxHealth}</b></span><span><small>SPEED</small><b>${entry.speed}</b></span><span><small>POWER</small><b>${entry.ratings.power}/5</b></span><span><small>CONTROL</small><b>${entry.ratings.control}/5</b></span></div><div class="codex-tip"><small>STARTING WEAPON / ${heroWeapon.name.toUpperCase()}</small><b>${heroWeapon.summary} ${heroWeapon.damage} base damage, ${(1/heroWeapon.fireRate).toFixed(1)} volleys per second.</b></div><div class="codex-tip"><small>EARNED CAPSTONE / ${capstone[0]}</small><b>${capstone[1]}</b></div>`;
    return;
  }
  if(tab==='statuses'){
    const statusTips={burn:'Refresh Burn with Foxfire to keep damage ticking until the target falls.',wet:'Undertow Well applies Wet; Foxfire detonates Wet packs and Shock Paws deals bonus damage to them.',shock:'Lightning pulses are global and briefly expose every afflicted enemy.',stun:'Stunned targets cannot move or attack. Heavy hammers can stun heroes too.',bleed:'Razor Fang rounds open a spirit wound. Moving enemies tick faster, so knockback and pursuit become damage tools.',curse:'Hexed enemies take a stronger next hit. If Moonveil marks you, sustain a sprint to cleanse it before another strike.',shield:'Ward absorbs incoming damage before health. Break hostile wards or keep moving until your own barrier recovers.'};
    codexDetail.innerHTML=`<div class="codex-detail-hero"><div class="codex-detail-art"></div><div><h3>${entry.name.toUpperCase()}</h3><span class="codex-role">COMBAT CONDITION / ${entry.targets.map((target)=>target.toUpperCase()).join(' + ')}</span><p>${entry.description}</p></div></div><div class="codex-tip"><small>TACTICAL USE</small><b>${statusTips[entry.id]}</b></div>`;return;
  }
  if(tab==='guardians'){
    const bossProfile=BOSS_PROFILES[entry.id];const schedule=[...new Set(Object.values(bossProfile.schedules).flat())];
    const patterns=schedule.map((id)=>{const pattern=BOSS_PATTERNS[id];const name=id==='signature'?bossProfile.signatureName:pattern.name;const description=id==='signature'?bossProfile.signatureDescription:pattern.description;return `<span><b>${name.toUpperCase()}</b><small>${description||`${pattern.windup.toFixed(2)} second warning before impact.`}</small></span>`;}).join('');
    codexDetail.innerHTML=`<div class="codex-detail-hero"><div class="codex-detail-art"></div><div><h3>${entry.name.toUpperCase()}</h3><span class="codex-role">THREE-PHASE GUARDIAN</span><p>An ancient guardian with a phase-specific combat schedule and summoned reinforcements.</p></div></div><div class="codex-stats"><span><small>BASE HEALTH</small><b>${entry.maxHealth}</b></span><span><small>MOVE</small><b>${entry.speed}</b></span><span><small>SLAM</small><b>${entry.slamRadius}</b></span><span><small>PHASES</small><b>3</b></span></div><div class="pattern-list">${patterns}</div><div class="codex-tip"><small>COUNTERPLAY</small><b>Read the floor warning, keep one escape lane open, and eliminate phase reinforcements before the next pattern begins.</b></div>`;return;
  }
  const note=ENEMY_CODEX_NOTES[entry.id]||{lore:'A corrupted spirit serving the curse.',counter:'Read its warning and punish the recovery.'};
  codexDetail.innerHTML=`<div class="codex-detail-hero"><div class="codex-detail-art"></div><div><h3>${entry.name.toUpperCase()}</h3><span class="codex-role">${(BEHAVIOR_LABELS[entry.behavior]||entry.behavior).toUpperCase()}</span><p>${note.lore}</p></div></div><div class="codex-stats"><span><small>HEALTH</small><b>${entry.maxHealth}</b></span><span><small>SPEED</small><b>${entry.speed}</b></span><span><small>DAMAGE</small><b>${entry.contactDamage}</b></span><span><small>RANGE</small><b>${entry.attackRange}</b></span></div><div class="codex-tip"><small>HOW TO FIGHT IT</small><b>${note.counter}</b></div>`;
}

function renderCodex(tab=activeCodexTab){
  activeCodexTab=tab;const entries=codexEntries(tab);const unlocked=entries.filter((entry)=>codexEntryUnlocked(entry,tab));
  for(const button of document.querySelectorAll('[data-codex-tab]'))button.classList.toggle('selected',button.dataset.codexTab===tab);
  codexProgress.textContent=`${unlocked.length} / ${entries.length} RECORDED`;
  if(!entries.some((entry)=>entry.id===activeCodexId&&codexEntryUnlocked(entry,tab)))activeCodexId=(unlocked[0]||entries[0])?.id;
  codexGrid.innerHTML=entries.map((entry)=>{const known=codexEntryUnlocked(entry,tab);return `<button type="button" class="codex-card ${known?'':'locked'} ${entry.id===activeCodexId?'selected':''}" style="${codexStyle(entry,tab)}" data-codex-id="${entry.id}"><span class="codex-thumb"></span><span><strong>${known?entry.name.toUpperCase():'???'}</strong><em>${known?(entry.role||BEHAVIOR_LABELS[entry.behavior]||'ELEMENTAL CONDITION').toUpperCase():tab==='heroes'?'LOCKED HERO':'UNRECORDED'}</em><small>${known?(tab==='guardians'?'THREE PHASES':tab==='heroes'?entry.passiveName:tab==='statuses'?'STATUS EFFECT':`${entry.maxHealth} BASE HP`):tab==='heroes'?'CLEAR THE CAMPAIGN':'ENCOUNTER TO REVEAL'}</small></span></button>`;}).join('');
  for(const button of codexGrid.querySelectorAll('[data-codex-id]'))button.addEventListener('click',()=>{activeCodexId=button.dataset.codexId;renderCodex(tab);});
  const selected=entries.find((entry)=>entry.id===activeCodexId)||entries[0];if(selected)renderCodexDetail(selected,tab,codexEntryUnlocked(selected,tab));
}

function openCodex(tab='heroes'){
  if(state==='codex'){renderCodex(tab);return;}
  codexReturnState=state;state='codex';codexScreen.classList.add('active');activeCodexId=null;renderCodex(tab);
}

function closeCodex(){
  if(state!=='codex')return;codexScreen.classList.remove('active');state=codexReturnState||'preview';
}

const UPGRADES = [
  {id:'equipFrostbiteNeedle',name:'Frostbite Needle',icon:'FROST',type:'ARSENAL AWAKENING',color:'#67edff',description:'Rapid precision fire stacks Chill. The third hit freezes the enemy in a visible ice prison.',detail:'3 HITS = FREEZE',available:()=>player.level>=3&&!player.arsenalAwakened,apply:()=>equipWeapon('frostbiteNeedle',{announce:true})},
  {id:'equipOniMortar',name:'Oni Mortar',icon:'MORTAR',type:'ARSENAL AWAKENING',color:'#ff862c',description:'A slower heavy shell erupts across the pack at the end of its flight or on first impact.',detail:'205 AREA BLAST',available:()=>player.level>=3&&!player.arsenalAwakened,apply:()=>equipWeapon('oniMortar',{announce:true})},
  {id:'equipGaleWarFan',name:'Gale War Fan',icon:'GALE',type:'ARSENAL AWAKENING',color:'#bffcff',description:'A wide war fan cuts through enemies, turns at maximum reach, and hits them again while returning.',detail:'OUT + RETURN',available:()=>player.level>=3&&!player.arsenalAwakened,apply:()=>equipWeapon('galeWarFan',{announce:true})},
  {id:'equipEmbercoilRepeater',name:'Embercoil Repeater',icon:'EMBER',type:'LEGEND ARSENAL',color:'#ff5b27',description:'Fire a tight three-round burst that opens burning wounds. Every fourth volley ruptures the struck pack.',detail:'3 SHOTS / 4th RUPTURES',available:()=>player.level>=7&&player.arsenalAwakened&&!player.legendArsenalAwakened,apply:()=>equipWeapon('embercoilRepeater',{announce:true})},
  {id:'equipTempestChakram',name:'Tempest Chakram',icon:'CHAKRAM',type:'LEGEND ARSENAL',color:'#5deeff',description:'Carve a broad lane outward, turn at maximum reach, and cut the displaced pack again while returning.',detail:'WIDE OUT + RETURN',available:()=>player.level>=7&&player.arsenalAwakened&&!player.legendArsenalAwakened,apply:()=>equipWeapon('tempestChakram',{announce:true})},
  {id:'equipMoonpiercerRailbow',name:'Moonpiercer Railbow',icon:'RAILBOW',type:'LEGEND ARSENAL',color:'#b55cff',description:'Hold a deliberate moon-charge, then execute every enemy aligned through the firing lane.',detail:'CHARGE / 8 PIERCES',available:()=>player.level>=7&&player.arsenalAwakened&&!player.legendArsenalAwakened,apply:()=>equipWeapon('moonpiercerRailbow',{announce:true})},
  { id:'unlockUndertow', name:'Undertow Well', icon:'VORTEX', type:'LEVEL 2 TECHNIQUE', color:'#35e7ff', description:'Aim a violent whirlpool into a dangerous pack. It pulls the group into one firing lane, Soaks and slows them, then crushes the center.', detail:'Pull pack · Soak · Crush', available:()=>player.level>=ABILITIES.undertowWell.unlockLevel&&!player.unlockedAbilities.has('undertowWell'), apply:()=>player.unlockedAbilities.add('undertowWell') },
  { id:'unlockFoxfire', name:'Foxfire Volley', icon:'FIRE', type:'LEVEL 4 TECHNIQUE', color:'#ff6a24', description:'Fan out spirit flames that ignite every enemy they strike.', detail:'Burn damage over time', available:()=>player.level>=ABILITIES.foxfireVolley.unlockLevel&&player.unlockedAbilities.has('undertowWell')&&!player.unlockedAbilities.has('foxfireVolley'), apply:()=>player.unlockedAbilities.add('foxfireVolley') },
  { id:'unlockHeart', name:'Wild Heart', icon:'HEART', type:'LEVEL 6 TECHNIQUE', color:'#68ef50', description:'Restore health and briefly reduce incoming damage.', detail:'Survival + recovery', available:()=>player.level>=ABILITIES.wildHeart.unlockLevel&&player.unlockedAbilities.has('foxfireVolley')&&!player.unlockedAbilities.has('wildHeart'), apply:()=>player.unlockedAbilities.add('wildHeart') },
  { id:'unlockShock', name:'Shock Paws', icon:'STORM', type:'LEVEL 8 ULTIMATE', color:'#d94cff', description:'Call a long spirit storm that repeatedly strikes every active enemy, anywhere in the room.', detail:'5.4 sec / all active enemies', available:()=>player.level>=ABILITIES.shockPaws.unlockLevel&&player.unlockedAbilities.has('wildHeart')&&!player.unlockedAbilities.has('shockPaws'), apply:()=>player.unlockedAbilities.add('shockPaws') },
  { id:'dualWield', name:'Twin Spirits', icon:'TWIN', type:'WEAPON EVOLUTION', color:'#ffcf3a', description:'Echo your weapon with a second spirit volley.', detail:'2 volleys  80% damage each', available:()=>!player.dualWield, apply:()=>{player.dualWield=true;} },
  { id:'spiritRounds', name:'Spirit Rounds', icon:'SHOT', type:'WEAPON UPGRADE', color:'#42eaff', description:'Charge every weapon round with denser spirit energy.', detail:'+22% weapon damage', available:()=>player.upgradeRanks.spiritRounds<4, apply:()=>{player.upgradeRanks.spiritRounds++;player.damageMultiplier*=1.22;} },
  { id:'quickPaws', name:'Quick Paws', icon:'FAST', type:'WEAPON UPGRADE', color:'#42eaff', description:'Recover faster after every shot and keep pressure on the pack.', detail:'+15% attack speed', available:()=>player.upgradeRanks.quickPaws<3, apply:()=>{player.upgradeRanks.quickPaws++;player.fireRateMultiplier*=.85;} },
  { id:'vitality', name:'Iron Resolve', icon:'HP', type:'HERO UPGRADE', color:'#77f059', description:'Strengthen your BrawlPaw and immediately restore the health gained.', detail:'+20 maximum health', available:()=>player.upgradeRanks.vitality<3, apply:()=>{player.upgradeRanks.vitality++;player.maxHealth+=20;player.health=Math.min(player.maxHealth,player.health+20);} },
  { id:'undertow', name:'Abyssal Grip', icon:'PULL', type:'UNDERTOW UPGRADE', color:'#35e7ff', description:'Widen Undertow Well, strengthen its inward drag, and deepen the final collapse.', detail:'+18% size, pull, and collapse power', available:()=>player.unlockedAbilities.has('undertowWell')&&player.upgradeRanks.undertow<3, apply:()=>{player.upgradeRanks.undertow++;player.abilityPower.undertowWell*=1.18;} },
  { id:'hungryFlame', name:'Hungry Flame', icon:'BURN', type:'FOXFIRE UPGRADE', color:'#ff6a24', description:'Foxfire burns hotter and the flames cling to enemies longer.', detail:'+25% burn power', available:()=>player.unlockedAbilities.has('foxfireVolley')&&player.upgradeRanks.hungryFlame<3, apply:()=>{player.upgradeRanks.hungryFlame++;player.abilityPower.foxfireVolley*=1.25;} },
  { id:'heartBloom', name:'Heart Bloom', icon:'HEAL', type:'WILD HEART UPGRADE', color:'#68ef50', description:'Wild Heart restores more health without covering the hero in effects.', detail:'+15 healing', available:()=>player.unlockedAbilities.has('wildHeart')&&player.upgradeRanks.heartBloom<3, apply:()=>{player.upgradeRanks.heartBloom++;player.heartBonus+=15;} },
  { id:'stormHeart', name:'Storm Heart', icon:'BOLT', type:'ULTIMATE UPGRADE', color:'#d94cff', description:'Each global lightning pulse becomes stronger and the storm lasts longer.', detail:'+20% damage  +0.5 sec', available:()=>player.unlockedAbilities.has('shockPaws')&&player.upgradeRanks.stormHeart<3, apply:()=>{player.upgradeRanks.stormHeart++;player.abilityPower.shockPaws*=1.2;player.stormBonus+=.5;} },
  { id:'wardbreaker', name:'Wardbreaker', icon:'BREAK', type:'HUNTER UPGRADE', color:'#75f08a', description:'Crack Bulwark shields faster and deal more damage to every mutated enemy.', detail:'+35% shield  +6% elite damage', available:()=>player.upgradeRanks.wardbreaker<3, apply:()=>{player.upgradeRanks.wardbreaker++;player.shieldDamageMultiplier*=1.35;player.eliteDamageMultiplier*=1.06;} },
  { id:'spiritHunter', name:'Spirit Hunter', icon:'HUNT', type:'ELITE HUNTER', color:'#ff4a91', description:'Learn the rhythm of mutations and punish elite openings.', detail:'+18% damage to elites', available:()=>player.upgradeRanks.spiritHunter<3, apply:()=>{player.upgradeRanks.spiritHunter++;player.eliteDamageMultiplier*=1.18;} },
  { id:'spiritCatalyst', name:'Spirit Catalyst', icon:'STATUS', type:'STATUS UPGRADE', color:'#ff8a32', description:'Burn and Wet last longer while every active ability grows stronger.', detail:'+20% duration  +12% ability power', available:()=>player.upgradeRanks.spiritCatalyst<3, apply:()=>{player.upgradeRanks.spiritCatalyst++;player.statusDurationMultiplier*=1.2;for(const id of Object.keys(player.abilityPower))player.abilityPower[id]*=1.12;} },
  { id:'pressureChamber', name:'Pressure Chamber', icon:'PLUS', type:'WEAPON EVOLUTION', color:'#ffd13a', description:'Add another projectile to every weapon volley at the cost of slightly slower cycling.', detail:'+1 projectile  8% slower', available:()=>player.upgradeRanks.pressureChamber<2, apply:()=>{player.upgradeRanks.pressureChamber++;player.bonusProjectiles++;player.fireRateMultiplier*=1.08;} },
  { id:'headhunter', name:'Headhunter Feast', icon:'BOUNTY', type:'BOUNTY UPGRADE', color:'#d95cff', description:'Mutated enemies drop richer bounties and restore health when defeated.', detail:'+35% elite gold  +6 HP', available:()=>player.upgradeRanks.headhunter<3, apply:()=>{player.upgradeRanks.headhunter++;player.eliteGoldMultiplier*=1.35;player.eliteKillHeal+=6;} },
  { id:'keenEye', name:'Keen Eye', icon:'CRIT', type:'WEAPON UPGRADE', color:'#42eaff', description:'Read enemy movement and land critical shots more reliably.', detail:'+5% critical chance', available:()=>player.upgradeRanks.keenEye<3, apply:()=>{player.upgradeRanks.keenEye++;player.critBonus+=.05;} }
  ,{id:'permafrost',name:'Permafrost',icon:'FROST',type:'FROSTBITE NEEDLE',color:'#67edff',description:'Ice builds faster and the prison holds longer.',detail:'2 HITS TO FREEZE / +0.25 SEC',available:()=>weapon.id==='frostbiteNeedle'&&player.upgradeRanks.permafrost<2,apply:()=>{player.upgradeRanks.permafrost++;}}
  ,{id:'shatterpoint',name:'Shatterpoint',icon:'SHATTER',type:'FROSTBITE NEEDLE',color:'#d7fbff',description:'Freezing a target releases a damaging ice shockwave into its nearby pack.',detail:'+45% FREEZE BURST',available:()=>weapon.id==='frostbiteNeedle'&&player.upgradeRanks.shatterpoint<3,apply:()=>{player.upgradeRanks.shatterpoint++;}}
  ,{id:'oniPayload',name:'Oni Payload',icon:'MORTAR',type:'ONI MORTAR',color:'#ff862c',description:'Load denser spirit powder into every mortar shell.',detail:'+18% BLAST DAMAGE',available:()=>weapon.id==='oniMortar'&&player.upgradeRanks.oniPayload<3,apply:()=>{player.upgradeRanks.oniPayload++;}}
  ,{id:'blastChamber',name:'Blast Chamber',icon:'BLAST',type:'ONI MORTAR',color:'#ffc34f',description:'Expand the Oni eruption without cluttering its warning.',detail:'+28 BLAST RADIUS',available:()=>weapon.id==='oniMortar'&&player.upgradeRanks.blastChamber<3,apply:()=>{player.upgradeRanks.blastChamber++;}}
  ,{id:'razorCurrent',name:'Razor Current',icon:'GALE',type:'GALE WAR FAN',color:'#bffcff',description:'Sharpen both the outward and returning fan passages.',detail:'+14% DAMAGE / RETURN POWER',available:()=>weapon.id==='galeWarFan'&&player.upgradeRanks.razorCurrent<3,apply:()=>{player.upgradeRanks.razorCurrent++;}}
  ,{id:'typhoonReach',name:'Typhoon Reach',icon:'WIND',type:'GALE WAR FAN',color:'#63efff',description:'A broader current carries the war fan farther and throws enemies harder.',detail:'+12% RANGE / +18% KNOCKBACK',available:()=>weapon.id==='galeWarFan'&&player.upgradeRanks.typhoonReach<3,apply:()=>{player.upgradeRanks.typhoonReach++;}}
  ,{id:'cinderDrum',name:'Cinder Drum',icon:'EMBER',type:'EMBERCOIL REPEATER',color:'#ff5b27',description:'Every burst burns hotter and tears the spirit wound open longer.',detail:'+22% BURN / +0.6 SEC',available:()=>weapon.id==='embercoilRepeater'&&player.upgradeRanks.cinderDrum<3,apply:()=>{player.upgradeRanks.cinderDrum++;}}
  ,{id:'ruptureMagazine',name:'Rupture Magazine',icon:'BLAST',type:'EMBERCOIL REPEATER',color:'#ffc23e',description:'The fourth volley erupts across a wider pack for greater weapon-scaled damage.',detail:'+22 RADIUS / +18% RUPTURE',available:()=>weapon.id==='embercoilRepeater'&&player.upgradeRanks.ruptureMagazine<3,apply:()=>{player.upgradeRanks.ruptureMagazine++;}}
  ,{id:'cycloneEdge',name:'Cyclone Edge',icon:'CHAKRAM',type:'TEMPEST CHAKRAM',color:'#5deeff',description:'Sharpen both passages of the returning moon-ring.',detail:'+15% OUT + RETURN',available:()=>weapon.id==='tempestChakram'&&player.upgradeRanks.cycloneEdge<3,apply:()=>{player.upgradeRanks.cycloneEdge++;}}
  ,{id:'crosswindRecall',name:'Crosswind Recall',icon:'WIND',type:'TEMPEST CHAKRAM',color:'#d8ffff',description:'The returning ring accelerates, widens, and throws the pack farther aside.',detail:'+16% RETURN / +20% CONTROL',available:()=>weapon.id==='tempestChakram'&&player.upgradeRanks.crosswindRecall<3,apply:()=>{player.upgradeRanks.crosswindRecall++;}}
  ,{id:'lunarCapacitor',name:'Lunar Capacitor',icon:'RAILBOW',type:'MOONPIERCER RAILBOW',color:'#b55cff',description:'Charge denser moonlight into the railbow for a stronger execution line.',detail:'+19% DAMAGE',available:()=>weapon.id==='moonpiercerRailbow'&&player.upgradeRanks.lunarCapacitor<3,apply:()=>{player.upgradeRanks.lunarCapacitor++;}}
  ,{id:'horizonBore',name:'Horizon Bore',icon:'PIERCE',type:'MOONPIERCER RAILBOW',color:'#f4dcff',description:'Extend the moon lance through more targets and punish the final body struck.',detail:'+2 PIERCE / +8% CRIT',available:()=>weapon.id==='moonpiercerRailbow'&&player.upgradeRanks.horizonBore<3,apply:()=>{player.upgradeRanks.horizonBore++;player.critBonus+=.08;}}
  ,{ id:'moonPiercer', name:'Moon Piercer', icon:'PIERCE', type:'LONGBOW EVOLUTION', color:'#ff5fbd', description:'Spirit arrows tear through another target and strike harder after every puncture.', detail:'+1 pierce  +12% weapon damage', available:()=>selectedHeroId==='hopscotch'&&player.upgradeRanks.moonPiercer<3, apply:()=>{player.upgradeRanks.moonPiercer++;player.bonusPierces++;player.damageMultiplier*=1.12;} }
  ,{ id:'perfectDraw', name:'Perfect Draw', icon:'AIM', type:'ARCHER MASTERY', color:'#ff8bd4', description:'Steady your release for more critical hits and far stronger critical punctures.', detail:'+8% critical  +20% critical damage', available:()=>selectedHeroId==='hopscotch'&&player.upgradeRanks.perfectDraw<3, apply:()=>{player.upgradeRanks.perfectDraw++;player.critBonus+=.08;player.critDamageMultiplier*=1.2;} }
  ,{ id:'glassFang', name:'Glass Fang', icon:'RISK', type:'CURSED POWER', color:'#ff476f', description:'Accept dangerous spirit force: hit much harder, but every enemy hit hurts more.', detail:'+28% damage  +12% damage taken', available:()=>player.upgradeRanks.glassFang<2, apply:()=>{player.upgradeRanks.glassFang++;player.damageMultiplier*=1.28;player.damageTakenMultiplier*=1.12;} }
  ,{ id:'spiritMomentum', name:'Spirit Momentum', icon:'MOVE', type:'MOBILITY UPGRADE', color:'#42eaff', description:'Move faster between firing windows and recover your evasive step sooner.', detail:'+10% speed  -12% dash cooldown', available:()=>player.upgradeRanks.spiritMomentum<3, apply:()=>{player.upgradeRanks.spiritMomentum++;player.speedMultiplier*=1.1;player.dashCooldownMultiplier*=.88;} }
  ,{ id:'guardianHunter', name:'Guardian Hunter', icon:'BOSS', type:'BOSS HUNTER', color:'#ffd13a', description:'Learn the ancient guardian rhythms and punish every recovery window.', detail:'+22% guardian damage', available:()=>player.upgradeRanks.guardianHunter<3, apply:()=>{player.upgradeRanks.guardianHunter++;player.guardianDamageMultiplier*=1.22;} }
  ,{ id:'deepReserves', name:'Deep Reserves', icon:'GOLD', type:'RUN ECONOMY', color:'#d95cff', description:'Bank emergency route funds and another chance to reshape a bad level-up offer.', detail:'+35 gold  +1 reroll', available:()=>player.upgradeRanks.deepReserves<2, apply:()=>{player.upgradeRanks.deepReserves++;player.gold+=35;player.rerolls++;} }
  ,{ id:'bankShot', name:'Bank Shot', icon:'BANK', type:'TRICKSHOT EVOLUTION', color:'#ff9b32', description:'Every spirit round can rebound into one more target and keeps more force after turning.', detail:'+1 ricochet  +10% retention', available:()=>selectedHeroId==='rusty'&&player.upgradeRanks.bankShot<3, apply:()=>{player.upgradeRanks.bankShot++;player.bonusRicochets++;player.ricochetDamageRetention=Math.min(.96,player.ricochetDamageRetention+.1);} }
  ,{ id:'loadedDice', name:'Loaded Dice', icon:'LUCK', type:'ROGUE MASTERY', color:'#ffd13a', description:'Tilt every banked round toward a critical finish.', detail:'+7% critical  +15% critical damage', available:()=>selectedHeroId==='rusty'&&player.upgradeRanks.loadedDice<3, apply:()=>{player.upgradeRanks.loadedDice++;player.critBonus+=.07;player.critDamageMultiplier*=1.15;} }
  ,{ id:'quickdraw', name:'Quickdraw', icon:'QUICK', type:'TWIN REVOLVER MASTERY', color:'#45eaff', description:'Cycle both revolvers faster without weakening their paired recoil.', detail:'+13% fire rate  +8% weapon damage', available:()=>selectedHeroId==='rusty'&&player.upgradeRanks.quickdraw<3, apply:()=>{player.upgradeRanks.quickdraw++;player.fireRateMultiplier*=.87;player.damageMultiplier*=1.08;} }
  ,{id:'spiritCylinder',name:'Spirit Cylinder',icon:'RAPID',type:'KITSUNE GUNNER',color:'#45eaff',description:'Tune the Spirit Blaster for faster, harder precision fire.',detail:'+12% fire rate / +9% weapon damage',available:()=>selectedHeroId==='kitsune'&&player.upgradeRanks.spiritCylinder<3,apply:()=>{player.upgradeRanks.spiritCylinder++;player.fireRateMultiplier*=.88;player.damageMultiplier*=1.09;}}
  ,{id:'phaseRounds',name:'Phase Rounds',icon:'PHASE',type:'KITSUNE EVOLUTION',color:'#d94cff',description:'Precision rounds pass through another target and find critical openings.',detail:'+1 pierce / +5% critical chance',available:()=>selectedHeroId==='kitsune'&&player.upgradeRanks.phaseRounds<2,apply:()=>{player.upgradeRanks.phaseRounds++;player.bonusPierces++;player.critBonus+=.05;}}
  ,{id:'foxstepMastery',name:'Foxstep Mastery',icon:'STEP',type:'KITSUNE MOBILITY',color:'#ff4f91',description:'Move faster and recover Fox Step sooner without adding another dash.',detail:'+8% speed / -14% dash cooldown',available:()=>selectedHeroId==='kitsune'&&player.upgradeRanks.foxstepMastery<3,apply:()=>{player.upgradeRanks.foxstepMastery++;player.speedMultiplier*=1.08;player.dashCooldownMultiplier*=.86;}}
  ,{id:'ironBelly',name:'Iron Belly Mastery',icon:'BRACE',type:'BAMBOO DEFENSE',color:'#70ef8a',description:'Plant your feet faster and absorb more damage while braced.',detail:'-7% braced damage / faster brace',available:()=>selectedHeroId==='bamboo'&&player.upgradeRanks.ironBelly<3,apply:()=>{player.upgradeRanks.ironBelly++;player.braceDamageMultiplier=Math.max(.52,player.braceDamageMultiplier-.07);player.braceDelay=Math.max(.42,player.braceDelay-.1);}}
  ,{id:'scatterBore',name:'Scatter Bore',icon:'SPREAD',type:'BAMBOO CANNON',color:'#ffd13a',description:'Add another heavy pellet and amplify every hit\'s crowd-control force.',detail:'+1 pellet / +18% knockback',available:()=>selectedHeroId==='bamboo'&&player.upgradeRanks.scatterBore<2,apply:()=>{player.upgradeRanks.scatterBore++;player.bonusProjectiles++;player.knockbackMultiplier*=1.18;}}
  ,{id:'guardianHide',name:'Guardian Hide',icon:'ARMOR',type:'BAMBOO FORTIFICATION',color:'#65ef55',description:'Grow tougher without turning the opening cannon into an instant kill weapon.',detail:'+28 max HP / -5% damage taken',available:()=>selectedHeroId==='bamboo'&&player.upgradeRanks.guardianHide<3,apply:()=>{player.upgradeRanks.guardianHide++;player.maxHealth+=28;player.health+=28;player.damageTakenMultiplier*=.95;}}
  ,{id:'capacitorBank',name:'Capacitor Bank',icon:'CHARGE',type:'ZAP TECHIE',color:'#39eaff',description:'Store more force in every Conductive discharge without making the opening pulse overpowering.',detail:'+18% chain damage / +9% weapon damage',available:()=>selectedHeroId==='zap'&&player.upgradeRanks.capacitorBank<3,apply:()=>{player.upgradeRanks.capacitorBank++;player.arcChainPower*=1.18;player.damageMultiplier*=1.09;}}
  ,{id:'chainLogic',name:'Chain Logic',icon:'CHAIN',type:'ZAP CONTROL',color:'#ffd43b',description:'Route each discharge into one additional nearby enemy and extend its search radius.',detail:'+1 chain target / +55 range',available:()=>selectedHeroId==='zap'&&player.upgradeRanks.chainLogic<3,apply:()=>{player.upgradeRanks.chainLogic++;player.arcChainBonus++;player.arcChainRange+=55;}}
  ,{id:'rapidCycle',name:'Rapid Cycle',icon:'RAPID',type:'ARC CASTER TUNING',color:'#62f2ff',description:'Cycle the paired arc casters faster while keeping their individual pulse damage low.',detail:'+13% fire rate',available:()=>selectedHeroId==='zap'&&player.upgradeRanks.rapidCycle<3,apply:()=>{player.upgradeRanks.rapidCycle++;player.fireRateMultiplier*=.87;}}
  ,{id:'moonEdge',name:'Moon Edge',icon:'PIERCE',type:'NOMI GLAIVE',color:'#b65cff',description:'Sharpen both passages of the Moonreturn Glaive.',detail:'+12% throw / +14% return damage',available:()=>selectedHeroId==='nomi'&&player.upgradeRanks.moonEdge<3,apply:()=>{player.upgradeRanks.moonEdge++;player.damageMultiplier*=1.12;player.glaiveReturnPower*=1.14;}}
  ,{id:'secondPassage',name:'Second Passage',icon:'RETURN',type:'NOMI MASTERY',color:'#69efff',description:'Guide the returning crescent faster and punish enemies caught twice.',detail:'+16% return speed / +4% return crit',available:()=>selectedHeroId==='nomi'&&player.upgradeRanks.secondPassage<3,apply:()=>{player.upgradeRanks.secondPassage++;player.glaiveReturnSpeed*=1.16;player.glaiveReturnCrit+=.04;}}
  ,{id:'cranePoise',name:'Crane Poise',icon:'MOVE',type:'SPIRIT LANCER',color:'#f3f5ff',description:'Flow between throws with more movement speed and precision.',detail:'+8% speed / +4% critical',available:()=>selectedHeroId==='nomi'&&player.upgradeRanks.cranePoise<3,apply:()=>{player.upgradeRanks.cranePoise++;player.speedMultiplier*=1.08;player.critBonus+=.04;}}
  ,{id:'razorFang',name:'Razor Fang Rounds',icon:'BLEED',type:'STATUS WEAPON',color:'#ff365f',description:'Weapon hits open a visible spirit wound. Moving targets bleed faster, rewarding knockback and pursuit.',detail:'Weapon hits apply Bleed',available:()=>player.level>=4&&player.upgradeRanks.razorFang<2,apply:()=>{player.upgradeRanks.razorFang++;player.bleedOnHit=3.5+player.upgradeRanks.razorFang*.75;}}
  ,{id:'hollowHex',name:'Hollow-Moon Hex',icon:'CURSE',type:'STATUS WEAPON',color:'#b84dff',description:'Critical hits mark enemies. Their next hit takes bonus damage and visibly shatters the moon seal.',detail:'Critical hits apply Curse',available:()=>player.level>=6&&player.upgradeRanks.hollowHex<2,apply:()=>{player.upgradeRanks.hollowHex++;player.curseOnCrit=1.18+player.upgradeRanks.hollowHex*.08;}}
  ,{id:'spiritAegis',name:'Spirit Aegis',icon:'WARD',type:'DEFENSIVE STATUS',color:'#72f0a0',description:'Gain a compact protective Ward that absorbs damage and refreshes at the start of every combat seal.',detail:'+30 Ward / refresh each room',available:()=>player.level>=5&&player.upgradeRanks.spiritAegis<3,apply:()=>{player.upgradeRanks.spiritAegis++;player.maxSpiritShield+=30;applyPlayerStatus('shield',12,player.maxSpiritShield);}}
  ,{id:'phaseNova',name:'Phase Nova',icon:'NOVA',type:'KITSUNE CAPSTONE',color:'#d94cff',description:'Every fifth blaster volley phases through its mark and detonates spirit damage through the surrounding pack.',detail:'5th volley / piercing pack detonation',available:()=>player.level>=7&&selectedHeroId==='kitsune'&&!player.weaponEvolution&&player.upgradeRanks.spiritCylinder>=2&&player.upgradeRanks.phaseRounds>=1,apply:()=>{player.weaponEvolution='phaseNova';}}
  ,{id:'siegeLotus',name:'Siege Lotus',icon:'SIEGE',type:'BAMBOO CAPSTONE',color:'#ffd13a',description:'Every third cannon blast loads an immense spirit shell that erupts on contact and throws the whole pack outward.',detail:'3rd blast / heavy area explosion',available:()=>player.level>=7&&selectedHeroId==='bamboo'&&!player.weaponEvolution&&player.upgradeRanks.scatterBore>=1&&player.upgradeRanks.guardianHide>=1,apply:()=>{player.weaponEvolution='siegeLotus';}}
  ,{id:'moonConstellation',name:'Moon Constellation',icon:'SPLIT',type:'HOPSCOTCH CAPSTONE',color:'#ff5fbd',description:'Every fourth fully drawn arrow fractures after impact and hunts two additional enemies.',detail:'4th arrow / two seeking splinters',available:()=>player.level>=7&&selectedHeroId==='hopscotch'&&!player.weaponEvolution&&player.upgradeRanks.moonPiercer>=2&&player.upgradeRanks.perfectDraw>=1,apply:()=>{player.weaponEvolution='moonConstellation';}}
  ,{id:'deadeyeCircuit',name:'Deadeye Circuit',icon:'CHAIN',type:'RUSTY CAPSTONE',color:'#ff9b32',description:'Every sixth twin-revolver volley becomes a guaranteed critical execution chain with two additional full-force banks.',detail:'6th volley / critical ricochet chain',available:()=>player.level>=7&&selectedHeroId==='rusty'&&!player.weaponEvolution&&player.upgradeRanks.bankShot>=2&&player.upgradeRanks.loadedDice>=1,apply:()=>{player.weaponEvolution='deadeyeCircuit';}}
  ,{id:'thunderheadArray',name:'Thunderhead Array',icon:'STORM',type:'ZAP CAPSTONE',color:'#39eaff',description:'Every third paired volley overloads its first target and immediately chains through a much larger nearby pack.',detail:'3rd volley / expanded discharge',available:()=>player.level>=7&&selectedHeroId==='zap'&&!player.weaponEvolution&&player.upgradeRanks.capacitorBank>=2&&player.upgradeRanks.chainLogic>=1,apply:()=>{player.weaponEvolution='thunderheadArray';}}
  ,{id:'skyfeatherConstellation',name:'Skyfeather Constellation',icon:'FEATHER',type:'NOMI CAPSTONE',color:'#d98cff',description:'Every fourth returning glaive releases six spirit feathers that hunt surviving enemies.',detail:'4th return / 6 homing feathers',available:()=>player.level>=7&&selectedHeroId==='nomi'&&!player.weaponEvolution&&player.upgradeRanks.moonEdge>=2&&player.upgradeRanks.secondPassage>=1,apply:()=>{player.weaponEvolution='skyfeatherConstellation';}}
  ,{id:'abyssalMaw',name:'Abyssal Maw',icon:'VORTEX',type:'UNDERTOW EVOLUTION',color:'#35e7ff',description:'The well implodes twice, crushing its trapped pack halfway through and again at the end.',detail:'2 crushing collapses',available:()=>player.level>=9&&player.upgradeRanks.undertow>=2&&!player.abilityEvolutions.undertowWell,apply:()=>{player.abilityEvolutions.undertowWell=true;}}
  ,{id:'nineTailInferno',name:'Nine-Tail Inferno',icon:'FIRE',type:'FOXFIRE EVOLUTION',color:'#ff6a24',description:'Fire nine spirit flames. Burning enemies spread Foxfire when they fall.',detail:'9 flames / death spreads burn',available:()=>player.level>=9&&player.upgradeRanks.hungryFlame>=2&&!player.abilityEvolutions.foxfireVolley,apply:()=>{player.abilityEvolutions.foxfireVolley=true;}}
  ,{id:'guardianBloom',name:'Guardian Bloom',icon:'HEART',type:'WILD HEART EVOLUTION',color:'#68ef50',description:'When Wild Heart ends, a life-draining bloom blasts the nearby pack and restores health per target.',detail:'Expiry blast / life drain',available:()=>player.level>=9&&player.upgradeRanks.heartBloom>=2&&!player.abilityEvolutions.wildHeart,apply:()=>{player.abilityEvolutions.wildHeart=true;}}
  ,{id:'heavensVerdict',name:"Heaven's Verdict",icon:'STORM',type:'ULTIMATE EVOLUTION',color:'#d94cff',description:'Shock Paws ends with a final judgment bolt against every surviving enemy in the room.',detail:'Global finishing strike',available:()=>player.level>=9&&player.upgradeRanks.stormHeart>=2&&!player.abilityEvolutions.shockPaws,apply:()=>{player.abilityEvolutions.shockPaws=true;}}
  ,{id:'pathGunner',name:'Spirit Gunner',icon:'SHOT',type:'LEVEL 5 FIGHTING STYLE',color:'#45eaff',description:'Commit this run to ranged execution. Every weapon gains another line of penetration and strikes harder.',detail:'+1 pierce / +12% weapon power',available:()=>player.level>=5&&!player.buildPath,apply:()=>{player.buildPath='gunner';player.bonusPierces++;player.damageMultiplier*=1.12;}}
  ,{id:'pathElementalist',name:'Elementalist',icon:'STATUS',type:'LEVEL 5 FIGHTING STYLE',color:'#d94cff',description:'Commit this run to elemental reactions. Techniques grow stronger and Burn, Wet, Shock, and Freeze hold longer.',detail:'+15% ability power / +20% status',available:()=>player.level>=5&&!player.buildPath,apply:()=>{player.buildPath='elementalist';for(const id of Object.keys(player.abilityPower))player.abilityPower[id]*=1.15;player.statusDurationMultiplier*=1.2;}}
  ,{id:'pathVanguard',name:'Warpath Vanguard',icon:'WARD',type:'LEVEL 5 FIGHTING STYLE',color:'#78ef63',description:'Commit this run to aggressive survival. Take less damage and gain enough health to fight inside the pack.',detail:'+35 max HP / -8% damage',available:()=>player.level>=5&&!player.buildPath,apply:()=>{player.buildPath='vanguard';player.maxHealth+=35;player.health+=35;player.damageTakenMultiplier*=.92;}}
  ,{id:'masterGunner',name:'Hunter Constellation',icon:'TARGET',type:'LEVEL 10 PATH MASTERY',color:'#45eaff',description:'Every fifth volley launches two spirit seekers that curve around the battlefield and hunt separate enemies.',detail:'5th volley / 2 homing seekers',available:()=>player.level>=10&&player.buildPath==='gunner'&&!player.buildMastery,apply:()=>{player.buildMastery='gunner';}}
  ,{id:'masterElementalist',name:'Prismatic Rupture',icon:'BURST',type:'LEVEL 10 PATH MASTERY',color:'#d94cff',description:'Applying a second elemental condition ruptures the target in a readable area blast and damages its nearby pack.',detail:'2 statuses / elemental rupture',available:()=>player.level>=10&&player.buildPath==='elementalist'&&!player.buildMastery,apply:()=>{player.buildMastery='elementalist';}}
  ,{id:'masterVanguard',name:'Stampede Chamber',icon:'RUN',type:'LEVEL 10 PATH MASTERY',color:'#78ef63',description:'A full sprint charges your next volley into an oversized impact that throws apart the entire firing lane.',detail:'Sprint charge / crushing volley',available:()=>player.level>=10&&player.buildPath==='vanguard'&&!player.buildMastery,apply:()=>{player.buildMastery='vanguard';}}
];

const RELICS=[
  {id:'luckyCoin',name:'Lucky Coin',icon:'GOLD',color:'#ffd13a',description:'+35% gold from every enemy.',apply:()=>{player.goldMultiplier*=1.35;}},
  {id:'spiritMask',name:'Spirit Mask',icon:'MASK',color:'#d95cff',description:'+15% weapon and ability power.',apply:()=>{player.damageMultiplier*=1.15;for(const id of Object.keys(player.abilityPower))player.abilityPower[id]*=1.15;}},
  {id:'thunderSeal',name:'Thunder Seal',icon:'STORM',color:'#c84fff',description:'Empower Shock Paws by 30% after its level-8 awakening.',apply:()=>{player.abilityPower.shockPaws*=1.3;}},
  {id:'bloodVial',name:'Blood Vial',icon:'HEAL',color:'#ff4268',description:'Heal 2 HP whenever an enemy falls.',apply:()=>{player.killHeal+=2;}},
  {id:'dragonScale',name:'Dragon Scale',icon:'ARMOR',color:'#69ef55',description:'Reduce all incoming damage by 12%.',apply:()=>{player.damageTakenMultiplier*=.88;}},
  {id:'rainbowFeather',name:'Rainbow Feather',icon:'MOVE',color:'#43eaff',description:'+12% movement speed and faster dash recovery.',apply:()=>{player.speedMultiplier*=1.12;player.dashCooldownMultiplier*=.85;}},
  {id:'wardBell',name:'Ward Bell',icon:'WARD',color:'#75f08a',description:'Double shield damage and deal 15% more damage to elites.',apply:()=>{player.shieldDamageMultiplier*=2;player.eliteDamageMultiplier*=1.15;}},
  {id:'oniContract',name:'Oni Contract',icon:'RISK',color:'#ff4a91',description:'Elite bounties are 75% richer, but you take 10% more damage.',apply:()=>{player.eliteGoldMultiplier*=1.75;player.damageTakenMultiplier*=1.1;}}
  ,{id:'moonPearl',name:'Moon Pearl',icon:'PIERCE',color:'#ff5fbd',description:'Every weapon projectile pierces one additional enemy.',apply:()=>{player.bonusPierces++;}}
  ,{id:'phoenixPlume',name:'Phoenix Plume',icon:'FIRE',color:'#ff6a24',description:'Empower Foxfire Volley by 35% after its level-4 awakening.',apply:()=>{player.abilityPower.foxfireVolley*=1.35;}}
  ,{id:'riverMirror',name:'River Mirror',icon:'WATER',color:'#35e7ff',description:'Empower Undertow Well pull and collapse by 35% after its level-2 awakening.',apply:()=>{player.abilityPower.undertowWell*=1.35;}}
  ,{id:'guardianFang',name:'Guardian Fang',icon:'BOSS',color:'#ffd13a',description:'Deal 30% more weapon and ability damage to guardians.',apply:()=>{player.guardianDamageMultiplier*=1.3;}}
  ,{id:'crimsonThread',name:'Crimson Thread',icon:'BLEED',color:'#ff365f',description:'Bleeding enemies spread half their remaining wound to a nearby enemy when defeated.',apply:()=>{player.bleedSpread=true;}}
  ,{id:'moonMirror',name:'Moon Mirror',icon:'CURSE',color:'#b84dff',description:'Cursed enemies suffer a stronger shatter and the mark lasts longer.',apply:()=>{player.cursePowerMultiplier*=1.18;player.curseDurationMultiplier*=1.3;}}
  ,{id:'lanternWard',name:'Lantern Ward',icon:'WARD',color:'#72f0a0',description:'Gain 25 Ward capacity and refresh it whenever a combat seal begins.',apply:()=>{player.maxSpiritShield+=25;applyPlayerStatus('shield',12,player.maxSpiritShield);}}
];

const GUARDIAN_REWARDS={
  jadeguardTanuki:{
    kicker:'JADEGUARD TANUKI IS FREED',title:'CLAIM THE JADE OATH',copy:'The ancient warden bows. Choose the vow that will carry into Bamboo Hollow.',
    choices:[
      {id:'jadeTempest',name:'Tempest Magazine',icon:'STORM',type:'OFFENSE / STORM',color:'#49eaff',description:'The Jadeguard loads your weapon with a second spirit echo and charges your future storm.',detail:'+1 projectile / +35% Shock power',apply:()=>{player.bonusProjectiles++;player.abilityPower.shockPaws*=1.35;}},
      {id:'jadeAegis',name:'Warden Aegis',icon:'WARD',type:'SURVIVAL / CONTROL',color:'#75f08a',description:'Jade scales reinforce your body and make every guardian recovery window more vulnerable.',detail:'+45 max HP / -12% damage / +20% guardian damage',apply:()=>{player.maxHealth+=45;player.health+=45;player.damageTakenMultiplier*=.88;player.guardianDamageMultiplier*=1.2;}},
      {id:'jadeFortune',name:'Bell of Plenty',icon:'GOLD',type:'ECONOMY / RECOVERY',color:'#ffd13a',description:'The restored bells shower the run in spirit coin and sharpen future reward choices.',detail:'+120 gold / +2 rerolls / full heal',apply:()=>{player.gold+=120;player.rerolls+=2;player.health=player.maxHealth;}}
    ]
  },
  moonfangKomainu:{
    kicker:'MOONFANG KOMAINU IS FREED',title:'CLAIM THE MOON OATH',copy:'The Hollow exhales. Moonfang tears three fangs from the curse and offers one to you.',
    choices:[
      {id:'moonHunt',name:'Predator Moon',icon:'FANG',type:'WEAPON / EXECUTION',color:'#ff5fbd',description:'Moonfang sharpens every projectile and teaches it to pass through crowded warpacks.',detail:'+28% weapon damage / +2 pierce / +10% critical',apply:()=>{player.damageMultiplier*=1.28;player.bonusPierces+=2;player.critBonus+=.1;}},
      {id:'moonCurrent',name:'Eclipse Current',icon:'TIDE',type:'ABILITY / STATUS',color:'#45eaff',description:'The moon floods every awakened and future technique with lasting elemental force.',detail:'+28% all ability power / +30% status duration',apply:()=>{for(const id of Object.keys(ABILITIES))player.abilityPower[id]*=1.28;player.statusDurationMultiplier*=1.3;}},
      {id:'moonStride',name:'Unchained Hunt',icon:'HUNT',type:'MOBILITY / LIFESTEAL',color:'#8cff58',description:'Move like Moonfang and recover whenever the warpack breaks beneath you.',detail:'+18% speed / faster dash / heal 3 on kill',apply:()=>{player.speedMultiplier*=1.18;player.dashCooldownMultiplier*=.72;player.killHeal+=3;}}
    ]
  },
  pyreclawShogun:{
    kicker:'PYRECLAW SHOGUN TORA IS FREED',title:'CLAIM THE ONI OATH',copy:'The oni gate opens onto a black ocean. Pyreclaw offers one last weapon before you enter the storm.',
    choices:[
      {id:'oniEdge',name:'Oni Edge',icon:'BLADE',type:'WEAPON / CRITICAL',color:'#ff5a35',description:'Pyreclaw tempers every shot in oni fire for the war beyond the gate.',detail:'+32% weapon damage / +15% critical',apply:()=>{player.damageMultiplier*=1.32;player.critBonus+=.15;}},
      {id:'oniHeart',name:'Living Inferno',icon:'FIRE',type:'ABILITY / STATUS',color:'#ff9a32',description:'The Shogun feeds every awakened technique with the fire that survived his chains.',detail:'+35% all ability power / +35% status duration',apply:()=>{for(const id of Object.keys(ABILITIES))player.abilityPower[id]*=1.35;player.statusDurationMultiplier*=1.35;}},
      {id:'oniPact',name:'Ashen Bulwark',icon:'WARD',type:'SURVIVAL / GUARDIAN',color:'#ffd05a',description:'Carry the Shogun’s endurance into the storm and strike harder against its guardian.',detail:'+70 max HP / -14% damage / +28% guardian damage',apply:()=>{player.maxHealth+=70;player.health+=70;player.damageTakenMultiplier*=.86;player.guardianDamageMultiplier*=1.28;}}
    ]
  },
  raijinKirin:{
    kicker:'RAIJIN KIRIN IS FREED',title:'CLAIM THE STORM OATH',copy:'The horizon returns, revealing a city that has forgotten how to wake. Raijin offers one crown-shard for the road ahead.',
    choices:[
      {id:'stormCrown',name:'Storm Crown',icon:'CROWN',type:'PROJECTILES / SHOCK',color:'#37dfff',description:'Raijin splits every volley and supercharges the lightning waiting in your paws.',detail:'+2 projectiles / +40% Shock power',apply:()=>{player.bonusProjectiles+=2;player.abilityPower.shockPaws*=1.4;}},
      {id:'skyBlood',name:'Skyblood Current',icon:'STORM',type:'ABILITY / SPEED',color:'#ba68ff',description:'Carry the living storm through every technique and sprint between its pulses.',detail:'+38% ability power / +15% speed',apply:()=>{for(const id of Object.keys(ABILITIES))player.abilityPower[id]*=1.38;player.speedMultiplier*=1.15;}},
      {id:'tempestHide',name:'Tempest Hide',icon:'WARD',type:'SURVIVAL / RECOVERY',color:'#72efac',description:'The Kirin’s hide turns punishment into momentum for the final city climb.',detail:'+85 max HP / -15% damage / heal 4 on kill',apply:()=>{player.maxHealth+=85;player.health+=85;player.damageTakenMultiplier*=.85;player.killHeal+=4;}}
    ]
  },
  daikyoOni:{
    kicker:'DAIKYO ONI IS FREED',title:'CLAIM THE CORE OATH',copy:'The city wakes, but every restored light casts a shadow that runs toward the moon. Daikyo offers one command fragment for the final road.',
    choices:[
      {id:'coreMemory',name:'Memory Breaker',icon:'CORE',type:'WEAPON / EXECUTION',color:'#55efff',description:'Daikyo writes every defeated pattern into your weapon before Tsukiko can erase it.',detail:'+38% weapon damage / +2 pierce / +15% critical',apply:()=>{player.damageMultiplier*=1.38;player.bonusPierces+=2;player.critBonus+=.15;}},
      {id:'coreOverclock',name:'Unwritten Protocol',icon:'STORM',type:'ABILITY / SPEED',color:'#ff3ab8',description:'Burn the last command and route its power through every awakened technique.',detail:'+42% ability power / +16% speed',apply:()=>{for(const id of Object.keys(ABILITIES))player.abilityPower[id]*=1.42;player.speedMultiplier*=1.16;}},
      {id:'coreShell',name:'Oni Kernel Shell',icon:'WARD',type:'SURVIVAL / GUARDIAN',color:'#f7ef69',description:'Carry the waking city as armor into the realm where every shadow hunts.',detail:'+100 max HP / -17% damage / +32% guardian damage',apply:()=>{player.maxHealth+=100;player.health+=100;player.damageTakenMultiplier*=.83;player.guardianDamageMultiplier*=1.32;}}
    ]
  },
  tsukikoEmpress:{
    kicker:'THE HOLLOW MOON BREAKS',title:'CHOOSE YOUR FINAL VOW',copy:'Tsukiko releases every life she tried to preserve by force. Decide what the six freed guardians will build from the dawn.',final:true,
    choices:[
      {id:'mercy',name:'Vow of Mercy',icon:'HEART',type:'HEAL THE SIX REALMS',color:'#71f09a',description:'Return every lost self and let each guardian choose a new sacred watch.',detail:'+45 victory shards / hopeful epilogue',shardBonus:45,ending:'mercy'},
      {id:'power',name:'Vow of Power',icon:'MOON',type:'CLAIM THE HOLLOW MOON',color:'#d459ff',description:'Take command of every abandoned future and become keeper of all six spirit roads.',detail:'+90 victory shards / power epilogue',shardBonus:90,ending:'power'},
      {id:'freedom',name:'Vow of Freedom',icon:'WING',type:'FREE EVERY POSSIBLE SELF',color:'#54e9ff',description:'Destroy the throne and return every choice, failure, and future to the paws that must live it.',detail:'+65 victory shards / freedom epilogue',shardBonus:65,ending:'freedom'}
    ]
  }
};

const SHOP_ITEMS=[
  {id:'moonTonic',name:'Moon Tonic',icon:'HEAL',color:'#65ef55',price:35,description:'Restore 55 health immediately.',available:()=>player.health<player.maxHealth,apply:()=>{player.health=Math.min(player.maxHealth,player.health+55);}},
  {id:'twinSpirits',name:'Twin Spirits',icon:'TWIN',color:'#ffd13a',price:90,description:'Evolve the blaster into Dual-Wield.',available:()=>!player.dualWield,apply:()=>{player.dualWield=true;}},
  {id:'spiritScope',name:'Spirit Scope',icon:'SHOT',color:'#43eaff',price:75,description:'+25% weapon damage.',available:()=>player.upgradeRanks.spiritRounds<4,apply:()=>{player.upgradeRanks.spiritRounds++;player.damageMultiplier*=1.25;}},
  {id:'jadeBand',name:'Jade Band',icon:'HP',color:'#69ef55',price:70,description:'+25 max HP and restore it.',available:()=>player.upgradeRanks.vitality<3,apply:()=>{player.upgradeRanks.vitality++;player.maxHealth+=25;player.health+=25;}},
  {id:'foxfireCharm',name:'Foxfire Charm',icon:'FIRE',color:'#ff6a24',price:95,description:'Increase awakened or future Foxfire power by 30%.',available:()=>true,apply:()=>{player.abilityPower.foxfireVolley*=1.3;}},
  {id:'stormSeal',name:'Storm Seal',icon:'STORM',color:'#d94cff',price:115,description:'Increase awakened or future Shock Paws power by 25%.',available:()=>true,apply:()=>{player.abilityPower.shockPaws*=1.25;}}
];

const ROUTE_SETS=[
  [{id:'combat',name:'Spirit Ambush',icon:'FIGHT',color:'#bfc5d1',tag:'COMBAT',description:'Standard danger. Reliable gold and XP.'},{id:'event',name:'Lantern Crossroads',icon:'?',color:'#c45cff',tag:'STORY EVENT',description:'A spirit offers power at an uncertain price.'},{id:'elite',name:'Cursed Elite',icon:'ELITE',color:'#f13b8c',tag:'HIGH RISK / DOUBLE GOLD',description:'Much stronger enemies for twice the gold.'}],
  [{id:'shop',name:'Moon Market',icon:'SHOP',color:'#ffb52f',tag:'SHOP',description:'Spend run gold on lasting upgrades.'},{id:'treasure',name:'Spirit Vault',icon:'RELIC',color:'#d94cff',tag:'RELIC',description:'Claim one permanent relic for this run.'},{id:'secret',name:'Hidden Spirit Den',icon:'SECRET',color:'#45eaff',tag:'SECRET / DANGER',description:'A concealed path promises forbidden rewards.'}],
  [{id:'shrine',name:'Hero Shrine',icon:'POWER',color:'#35e7ff',tag:'FREE UPGRADE',description:'Choose one additional build upgrade.'},{id:'heal',name:'Sacred Spring',icon:'HEAL',color:'#65ef55',tag:'RECOVERY',description:'Restore 50 HP before the final onslaught.'},{id:'elite',name:'Guardian Elite',icon:'ELITE',color:'#f13b8c',tag:'EXTREME / DOUBLE GOLD',description:'The strongest route into the boss.'}]
];

const PHYSICAL_ROUTE_NODES=new Set(['heal','treasure','shrine']);
const INTERACTABLE_DEFS={
  heal:{name:'SACRED SPRING',prompt:'DRINK FROM THE SPRING',color:'#65ef55',icon:'HEAL'},
  treasure:{name:'SPIRIT VAULT',prompt:'OPEN THE RELIC VAULT',color:'#d94cff',icon:'RELIC'},
  shrine:{name:'HERO SHRINE',prompt:'COMMUNE FOR AN UPGRADE',color:'#35e7ff',icon:'POWER'}
};

const UPGRADE_RARITIES={
  equipFrostbiteNeedle:'rare',equipOniMortar:'rare',equipGaleWarFan:'rare',permafrost:'rare',shatterpoint:'epic',oniPayload:'rare',blastChamber:'rare',razorCurrent:'rare',typhoonReach:'rare',
  equipEmbercoilRepeater:'epic',equipTempestChakram:'epic',equipMoonpiercerRailbow:'epic',cinderDrum:'rare',ruptureMagazine:'epic',cycloneEdge:'rare',crosswindRecall:'epic',lunarCapacitor:'rare',horizonBore:'epic',
  unlockUndertow:'rare',unlockFoxfire:'rare',unlockHeart:'rare',unlockShock:'epic',dualWield:'epic',
  spiritRounds:'common',quickPaws:'common',vitality:'common',undertow:'rare',hungryFlame:'rare',heartBloom:'rare',stormHeart:'epic',
  wardbreaker:'common',spiritHunter:'rare',spiritCatalyst:'rare',pressureChamber:'epic',headhunter:'rare',keenEye:'common',
  spiritCylinder:'common',phaseRounds:'epic',foxstepMastery:'rare',ironBelly:'rare',scatterBore:'epic',guardianHide:'rare',
  capacitorBank:'rare',chainLogic:'rare',rapidCycle:'common',
  moonEdge:'rare',secondPassage:'rare',cranePoise:'common',skyfeatherConstellation:'epic',
  razorFang:'rare',hollowHex:'epic',spiritAegis:'rare',
  phaseNova:'epic',siegeLotus:'epic',moonConstellation:'epic',deadeyeCircuit:'epic',thunderheadArray:'epic',abyssalMaw:'epic',nineTailInferno:'epic',guardianBloom:'epic',heavensVerdict:'epic',
  pathGunner:'rare',pathElementalist:'rare',pathVanguard:'rare',masterGunner:'epic',masterElementalist:'epic',masterVanguard:'epic'
};
const RARITY_STYLES={common:{name:'COMMON',color:'#a9b4c3',weight:56},rare:{name:'RARE',color:'#39e8ff',weight:32},epic:{name:'EPIC',color:'#e04cff',weight:12}};
const SYNERGIES=[
  {id:'steamBurst',name:'STEAM BURST',color:'#50ecff',requires:()=>player.unlockedAbilities.has('undertowWell')&&player.unlockedAbilities.has('foxfireVolley'),description:'Foxfire detonates Wet enemies in a scalding area blast.'},
  {id:'stormCurrent',name:'STORM CURRENT',color:'#c84fff',requires:()=>player.unlockedAbilities.has('undertowWell')&&player.unlockedAbilities.has('shockPaws'),description:'Shock Paws deals 50% more damage to Wet enemies.'},
  {id:'guardianTempest',name:'GUARDIAN TEMPEST',color:'#72ef5b',requires:()=>player.unlockedAbilities.has('wildHeart')&&player.unlockedAbilities.has('shockPaws'),description:'Every global storm pulse restores a small amount of health.'},
  {id:'twinCinders',name:'TWIN CINDERS',color:'#ff8a2a',requires:()=>player.dualWield&&player.unlockedAbilities.has('foxfireVolley'),description:'Every eighth gun volley loads burning spirit rounds.'}
];

const ROUTE_EVENTS={
  event:[
    {kicker:'THE LANTERN CROSSROADS',title:'A HERO WITHOUT A SHADOW',copy:'A masked spirit holds a sealed relic in one paw and an empty lantern in the other. It asks what the BrawlPaw is willing to leave behind.',quote:'Power remembers the hand that stole it.',choices:[
      {name:'BREAK THE SEAL',tag:'RELIC CHOICE  CURSED BLOOD',color:'#d94cff',description:'Choose one of three relics and gain 35 gold, but permanently lose 12 maximum health this run.',result:'CHOOSE RELIC + 35 GOLD  -12 MAX HP',apply:()=>{player.maxHealth=Math.max(60,player.maxHealth-12);player.health=Math.min(player.health,player.maxHealth);player.gold+=35;grantRelic({source:'THE BOUND RELIQUARY',continuation:()=>finishRouteEvent({damageScale:1.1,nodeType:'event'})});}},
      {name:'FEED THE LANTERN',tag:'30 GOLD  SAFE PASSAGE',color:'#65ef55',description:'Pay the spirit, restore 45 health, and gain one additional upgrade reroll.',result:'-30 GOLD  +45 HP  +1 REROLL',available:()=>player.gold>=30,apply:()=>{player.gold-=30;player.health=Math.min(player.maxHealth,player.health+45);player.rerolls++;finishRouteEvent({nodeType:'event'});}}
    ]},
    {kicker:'THE ECHO POOL',title:'YOUR REFLECTION ATTACKS FIRST',copy:'Moonlit water shows a stronger reflection with colder eyes. It offers its power, but only if the next pack is allowed to hunt at full strength.',quote:'If you want my fire, survive my enemies.',choices:[
      {name:'ACCEPT THE REFLECTION',tag:'POWER  ELITE NEXT WAVE',color:'#ff4d9d',description:'Increase every ability by 12%. The next wave becomes faster, tougher, and far more rewarding.',result:'+12% ABILITY POWER  160% REWARD',apply:()=>{for(const id of Object.keys(player.abilityPower))player.abilityPower[id]*=1.12;finishRouteEvent({healthScale:1.18,speedScale:1.15,damageScale:1.14,rewardScale:1.6,nodeType:'eventElite'});}},
      {name:'STILL THE WATER',tag:'RECOVERY  MAX HEALTH',color:'#41e8ff',description:'Reject the bargain, gain 14 maximum health, and enter the next fight restored.',result:'+14 MAX HP  +35 HP',apply:()=>{player.maxHealth+=14;player.health=Math.min(player.maxHealth,player.health+49);finishRouteEvent({nodeType:'event'});}}
    ]}
  ],
  secret:[
    {kicker:'SECRET PATH / HIDDEN SPIRIT DEN',title:'THE ARSENAL BENEATH THE ROOTS',copy:'Two ancient spirit weapons rest above a warning carved into the stone: take both, and every guardian on the road will know your name.',quote:'One weapon escapes notice. Two begin a war.',choices:[
      {name:'TAKE THE TWIN BLASTERS',tag:'WEAPON EVOLUTION  EXTREME WAVE',color:'#ffcf3a',description:'Immediately unlock Dual-Wield. The next wave gains elite health, speed, and damage.',result:'DUAL-WIELD  190% REWARD',available:()=>!player.dualWield,apply:()=>{player.dualWield=true;resolveSynergies();finishRouteEvent({healthScale:1.32,speedScale:1.22,damageScale:1.24,rewardScale:1.9,nodeType:'secretElite'});}},
      {name:'EMPTY THE SPIRIT CACHE',tag:'TREASURE  BLOOD PRICE',color:'#d94cff',description:'Take 100 gold and one reroll. The sealed cache drains 22 current health.',result:'+100 GOLD  +1 REROLL  -22 HP',apply:()=>{player.gold+=100;player.rerolls++;player.health=Math.max(1,player.health-22);finishRouteEvent({speedScale:1.08,nodeType:'secret'});}}
    ]},
    {kicker:'SECRET PATH / MIRROR SHRINE',title:'FOUR POWERS, ONE REFLECTION',copy:'A cracked mirror contains an ability the hero has not yet awakened. Pulling it free will also pull something hungry through the glass.',quote:'Every shortcut opens in both directions.',choices:[
      {name:'STEAL THE REFLECTION',tag:'ABILITY POWER  CURSE',color:'#e04cff',description:'Charge every future technique by 24%, but take 8% more damage for the rest of this run.',result:'+24% ABILITY POWER  +8% DAMAGE TAKEN',available:()=>true,apply:()=>{for(const id of Object.keys(player.abilityPower))player.abilityPower[id]*=1.24;player.damageTakenMultiplier*=1.08;resolveSynergies();finishRouteEvent({damageScale:1.1,nodeType:'secret'});}},
      {name:'SHATTER THE MIRROR',tag:'RELIC CHOICE  GUARDIAN WRATH',color:'#45eaff',description:'Destroy the passage and choose one of three relics. The next enemies arrive much faster.',result:'CHOOSE RELIC  FAST WAVE',apply:()=>{grantRelic({source:'THE SHATTERED MIRROR',continuation:()=>finishRouteEvent({speedScale:1.2,rewardScale:1.35,nodeType:'secret'})});}}
    ]}
  ]
};

const HUB_STATIONS=[
  {id:'heroShrine',name:'HERO SHRINE',x:1580,y:760,color:'#42eaff',prompt:'PERMANENT VITALITY'},
  {id:'forge',name:'SPIRIT FORGE',x:2590,y:700,color:'#ff7b28',prompt:'PERMANENT WEAPON POWER'},
  {id:'relicAltar',name:'RELIC ALTAR',x:3650,y:800,color:'#d95cff',prompt:'PERMANENT ABILITY POWER'},
  {id:'missionBoard',name:'MISSION BOARD',x:820,y:1200,color:'#ffd13a',prompt:'VIEW CAMPAIGN RECORD'},
  {id:'dojo',name:'DOJO',x:1500,y:1880,color:'#72ef5b',prompt:'TRAIN & REVIEW CONTROLS'},
  {id:'shopkeeper',name:'CHARM SHOP',x:3300,y:1840,color:'#ff4f79',prompt:'PERMANENT STARTING GOLD'},
  {id:'portal',name:'PORTAL GATE',x:2400,y:2240,color:'#556dff',prompt:'START THE CAMPAIGN'}
];

const HUB_UPGRADES={
  heroShrine:{id:'vitalityRank',name:'Iron Resolve Sigil',color:'#42eaff',max:5,cost:(rank)=>70+rank*55,description:'+5 permanent starting maximum health.'},
  forge:{id:'forgeRank',name:'Spirit Chamber',color:'#ff7b28',max:5,cost:(rank)=>90+rank*65,description:'+3% permanent weapon damage.'},
  relicAltar:{id:'attunementRank',name:'Relic Attunement',color:'#d95cff',max:5,cost:(rank)=>100+rank*70,description:'+4% permanent power for every unlocked ability.'},
  shopkeeper:{id:'purseRank',name:'Lucky Purse',color:'#ff4f79',max:5,cost:(rank)=>65+rank*50,description:'+5 permanent starting run gold.'}
};
const LEGEND_ARSENAL_COLLECTION=[
  {id:'embercoilRepeater',name:'EMBERCOIL REPEATER',tag:'BURST / BURN / RUPTURE',color:'#ff5b27',position:'0% 0%',description:'Three-round spirit-fire bursts. Every fourth volley ruptures the wounded pack.'},
  {id:'tempestChakram',name:'TEMPEST CHAKRAM',tag:'OUTBOUND / RETURN / CONTROL',color:'#5deeff',position:'50% 0%',description:'A broad storm blade that cuts a lane outward, turns, and carves through it again.'},
  {id:'moonpiercerRailbow',name:'MOONPIERCER RAILBOW',tag:'CHARGE / PIERCE / EXECUTE',color:'#b55cff',position:'100% 0%',description:'A deliberate moon-charge that executes every enemy aligned in its firing lane.'}
];
const ARSENAL_BLUEPRINTS=[
  {id:'frostbiteNeedle',upgradeId:'equipFrostbiteNeedle',tier:3,name:'FROSTBITE NEEDLE',tag:'FREEZE',color:'#67edff',asset:'assets/vfx/arsenal-weapons-v1.png',position:'0% 0%'},
  {id:'oniMortar',upgradeId:'equipOniMortar',tier:3,name:'ONI MORTAR',tag:'AREA',color:'#ff862c',asset:'assets/vfx/arsenal-weapons-v1.png',position:'50% 0%'},
  {id:'galeWarFan',upgradeId:'equipGaleWarFan',tier:3,name:'GALE WAR FAN',tag:'RETURN',color:'#bffcff',asset:'assets/vfx/arsenal-weapons-v1.png',position:'100% 0%'},
  {id:'embercoilRepeater',upgradeId:'equipEmbercoilRepeater',tier:7,name:'EMBERCOIL REPEATER',tag:'BURN',color:'#ff5b27',asset:'assets/vfx/arsenal-tier2-v1.png',position:'0% 0%'},
  {id:'tempestChakram',upgradeId:'equipTempestChakram',tier:7,name:'TEMPEST CHAKRAM',tag:'CONTROL',color:'#5deeff',asset:'assets/vfx/arsenal-tier2-v1.png',position:'50% 0%'},
  {id:'moonpiercerRailbow',upgradeId:'equipMoonpiercerRailbow',tier:7,name:'MOONPIERCER RAILBOW',tag:'EXECUTE',color:'#b55cff',asset:'assets/vfx/arsenal-tier2-v1.png',position:'100% 0%'}
];
function boundArsenalForHero(){const id=profile.boundArsenal?.[selectedHeroId];return ARSENAL_BLUEPRINTS.some((entry)=>entry.id===id)&&profile.collectedWeapons.includes(id)?id:'';}
function bindArsenalBlueprint(id){if(state!=='preview'&&!['hub','hubMenu'].includes(state))return false;if(id&&!profile.collectedWeapons.includes(id))return false;if(id&&!ARSENAL_BLUEPRINTS.some((entry)=>entry.id===id))return false;profile.boundArsenal={...profile.boundArsenal,[selectedHeroId]:id};saveProfile();renderArsenalContract();if(state==='hubMenu'&&activeHubStation?.id==='forge')renderHubUpgrade(HUB_UPGRADES.forge);return true;}
function renderArsenalContract(){if(!ui.arsenalContractGrid)return;const bound=boundArsenalForHero();const known=ARSENAL_BLUEPRINTS.filter((entry)=>profile.collectedWeapons.includes(entry.id));ui.arsenalContractTitle.textContent=bound?`${WEAPONS[bound].name.toUpperCase()} · LEVEL ${ARSENAL_BLUEPRINTS.find((entry)=>entry.id===bound).tier}`:'FATE DRAFT';ui.arsenalContractCopy.textContent=bound?'Your run still begins with the hero weapon. This blueprint is guaranteed only at its earned awakening level.':known.length?'Bind one discovered weapon, or keep the random three-card Arsenal draft.':'Discover Arsenal weapons at levels 3 and 7 to bind future awakening contracts.';ui.arsenalContractGrid.innerHTML=`<button type="button" class="arsenal-contract-card ${bound?'':'selected'}" data-bind-arsenal=""><span class="contract-fate">?</span><b>FATE DRAFT</b><small>RANDOM CHOICE</small></button>${ARSENAL_BLUEPRINTS.map((entry)=>{const discovered=profile.collectedWeapons.includes(entry.id),selected=bound===entry.id;return `<button type="button" class="arsenal-contract-card ${selected?'selected':''} ${discovered?'known':'locked'}" style="--contract:${entry.color};--contract-art:url('${entry.asset}');--contract-position:${entry.position}" data-bind-arsenal="${entry.id}" ${discovered?'':'disabled'}><span class="contract-weapon-art" aria-hidden="true"></span><b>${discovered?entry.name:'???'}</b><small>${discovered?`LV ${entry.tier} · ${entry.tag}`:`DISCOVER AT LV ${entry.tier}`}</small></button>`;}).join('')}`;for(const button of ui.arsenalContractGrid.querySelectorAll('[data-bind-arsenal]'))button.addEventListener('click',()=>bindArsenalBlueprint(button.dataset.bindArsenal));}
const CAMPAIGN_CONTRACTS=[
  {id:'spiritCull',name:'Thin the Curse',tag:'HUNTER CONTRACT',color:'#42eaff',target:120,reward:55,description:'Defeat 120 hostile spirits across any number of runs.',bonus:'START EACH RUN WITH +15 GOLD'},
  {id:'eliteBreakers',name:'Break the Mutated',tag:'ELITE CONTRACT',color:'#ff4f91',target:18,reward:70,description:'Defeat 18 Swift, Bulwark, Frenzied, Volatile, or Splitter enemies.',bonus:'PERMANENT +8% ELITE DAMAGE'},
  {id:'foxfireHunt',name:'Ashes Remember',tag:'FOXFIRE CONTRACT',color:'#ff6a24',target:35,reward:75,description:'Finish 35 burning enemies after awakening Foxfire Volley.',bonus:'PERMANENT +6% FOXFIRE POWER'},
  {id:'sealRunner',name:'Road of Thirty-Six Seals',tag:'CAMPAIGN CONTRACT',color:'#8cff58',target:36,reward:180,description:'Clear 36 combat seals across the six chapters.',bonus:'START EACH RUN WITH +1 REROLL'},
  {id:'guardianOath',name:'Free the Six',tag:'GUARDIAN CONTRACT',color:'#d95cff',target:6,reward:220,description:'Defeat six corrupted guardians across any number of runs.',bonus:'PERMANENT +8% GUARDIAN DAMAGE'}
];

function contractClaimed(id){return profile.claimedContracts.includes(id);}
function contractProgress(contract){return clamp(Number(profile.contractProgress[contract.id])||0,0,contract.target);}
let contractSaveTimer=0;
function recordContractProgress(id,amount=1){const contract=CAMPAIGN_CONTRACTS.find((entry)=>entry.id===id);if(!contract||contractClaimed(id))return;profile.contractProgress[id]=clamp(contractProgress(contract)+amount,0,contract.target);clearTimeout(contractSaveTimer);contractSaveTimer=setTimeout(saveProfile,450);}
function claimCampaignContract(id){
  const contract=CAMPAIGN_CONTRACTS.find((entry)=>entry.id===id);if(!contract||contractClaimed(id)||contractProgress(contract)<contract.target)return;profile.claimedContracts.push(id);profile.spiritShards+=contract.reward;saveProfile();refreshProfileUi();ui.hubShards.textContent=`SHARDS ${profile.spiritShards}`;spawnWord(player.x,player.y-105,'CONTRACT CLAIMED!',contract.color);effects.rings.push({x:player.x,y:player.y,radius:20,maxRadius:175,color:contract.color,life:.75,maxLife:.75});playSfx('upgrade',.28,1.12);renderMissionBoard();
}
function renderMissionBoard(){
  const complete=CAMPAIGN_CONTRACTS.filter((entry)=>contractClaimed(entry.id)).length;ui.hubMenuCopy.textContent=`Complete contracts across multiple runs. Claimed oaths grant shards and restrained permanent build options. ${complete} / ${CAMPAIGN_CONTRACTS.length} fulfilled.`;
  hubUpgradeGrid.innerHTML=CAMPAIGN_CONTRACTS.map((contract)=>{const progress=contractProgress(contract),ready=progress>=contract.target,claimed=contractClaimed(contract.id);return `<button type="button" class="hub-upgrade-card mission-contract ${ready?'ready':''} ${claimed?'claimed':''}" style="--hub:${contract.color};--contract-progress:${progress/contract.target*100}%" data-contract="${contract.id}" ${ready&&!claimed?'':'disabled'}><span class="contract-status">${claimed?'FULFILLED':ready?'CLAIM REWARD':`${progress} / ${contract.target}`}</span><strong>${contract.name}</strong><em>${contract.tag}</em><p>${contract.description}</p><span class="contract-bar"><i></i></span><b>${claimed?contract.bonus:`${contract.reward} SHARDS  ·  ${contract.bonus}`}</b></button>`;}).join('')+`<button type="button" class="hub-upgrade-card mission-archive" style="--hub:#9c58d9" data-open-codex><strong>SPIRIT ARCHIVE</strong><em>${profile.discoveredEnemies.length} ENEMIES  ${profile.discoveredGuardians.length} GUARDIANS</em><p>Study recorded attacks, weaknesses, statuses, and guardian patterns.</p><b>OPEN BRAWLPAWS CODEX</b></button>`;
  for(const button of hubUpgradeGrid.querySelectorAll('[data-contract]'))button.addEventListener('click',()=>claimCampaignContract(button.dataset.contract));hubUpgradeGrid.querySelector('[data-open-codex]').addEventListener('click',()=>openCodex('enemies'));
}
let activeHubStation=null;
const DOJO_TARGETS=[
  {type:'groveMinion',name:'SWIFT SCOUT',health:800,armor:1,description:'Unarmored movement target'},
  {type:'spiritArcher',name:'SPIRIT ARCHER',health:1450,armor:.9,description:'Light spirit armor'},
  {type:'mossBrute',name:'MOSS BRUTE',health:3600,armor:.72,description:'Heavy stagger-resistant armor'},
  {type:'jadeguardTanuki',name:'GUARDIAN ECHO',health:9000,armor:.55,description:'Boss-grade armor  passive only'}
];
const dojoState={targetIndex:0,aggressive:false,totalDamage:0,bestDps:0,kills:0,time:0,lastDamageAt:-99,damageSamples:[],respawnTimer:0};

function nearestHubStation(){
  let best=null,bestDistance=Infinity;for(const station of HUB_STATIONS){const d=Math.hypot(player.x-station.x,player.y-station.y);if(d<bestDistance){best=station;bestDistance=d;}}
  return bestDistance<=235?{station:best,distance:bestDistance}:null;
}

function activateRoom(roomId,{reposition=true,announce=false,waveIndex=0,subtitle=''}={}){
  const nextRoom=ROOMS[roomId];if(!nextRoom)return;room=nextRoom;assets.arena=loadRoomArena(room);
  const authoredSpawn=room.mapRuntime==='phaser-tiled'?layeredMapRuntime.playerSpawn(room.id):null,spawn=authoredSpawn||room.playerSpawn;
  if(reposition&&player){player.x=spawn.x;player.y=spawn.y;player.vx=0;player.vy=0;player.facing=-Math.PI/2;player.invulnerable=Math.max(player.invulnerable,1.1);camera.x=player.x;camera.y=player.y;camera.shake=0;}
  if(player){if(!(player.discoveredRegions instanceof Set))player.discoveredRegions=new Set(player.discoveredRegions||[]);if(expeditionNode(room.id))player.discoveredRegions.add(room.id);const worldPosition=expeditionWorldPosition(room.id,player.x,player.y);player.worldX=worldPosition.x;player.worldY=worldPosition.y;player.currentRegion=room.id;}
  ui.biomeTitle.textContent=room.name.toUpperCase();ui.routeBiome.textContent=`${room.name.toUpperCase()}  BRANCHING ROUTE`;canvas.setAttribute('aria-label',`${room.name} combat arena`);
  if(announce)showRoomTransition(waveIndex,subtitle);
}

function showRoomTransition(waveIndex,subtitle=''){
  clearTimeout(roomTransitionTimer);ui.roomTransitionKicker.textContent=`CHAPTER ${chapterIndex+1}  ${chapter.name.toUpperCase()}`;ui.roomTransitionTitle.textContent=room.name.toUpperCase();
  ui.roomTransitionSubtitle.textContent=subtitle||`SEAL ${waveIndex+1} OF ${chapter.waves.length}`;ui.roomTransition.classList.remove('active');void ui.roomTransition.offsetWidth;ui.roomTransition.classList.add('active');
  roomTransitionTimer=setTimeout(()=>ui.roomTransition.classList.remove('active'),1100);
}

const JADE_OPTIONAL_ROOMS={event:'jadeBrokenPavilion',secret:'jadeBrokenPavilion',shop:'jadeBrokenPavilion',elite:'jadeCrystalClearing',shrine:'jadeCrystalClearing',heal:'jadeTrainingYard',treasure:'jadeTrainingYard'};
const BAMBOO_OPTIONAL_ROOMS={event:'bambooWhisperingGrotto',secret:'bambooWhisperingGrotto',shop:'bambooHunterCamp',elite:'bambooHunterCamp',shrine:'bambooLotusSanctuary',heal:'bambooLotusSanctuary',treasure:'bambooWhisperingGrotto'};
const CRIMSON_OPTIONAL_ROOMS={event:'crimsonFoxfireArchive',secret:'crimsonFoxfireArchive',shop:'crimsonExecutionYard',elite:'crimsonExecutionYard',shrine:'crimsonAncestorShrine',heal:'crimsonAncestorShrine',treasure:'crimsonFoxfireArchive'};
const STORM_OPTIONAL_ROOMS={event:'stormPearlCove',secret:'stormPearlCove',shop:'stormRaiderWreck',elite:'stormRaiderWreck',shrine:'stormTidekeeperShrine',heal:'stormTidekeeperShrine',treasure:'stormPearlCove'};
const NEON_OPTIONAL_ROOMS={event:'neonMemoryBazaar',secret:'neonMemoryBazaar',shop:'neonKernelFoundry',elite:'neonKernelFoundry',shrine:'neonPulseShrine',heal:'neonPulseShrine',treasure:'neonMemoryBazaar'};
const SHADOW_OPTIONAL_ROOMS={event:'shadowForsakenMirrorVault',secret:'shadowForsakenMirrorVault',shop:'shadowDreadmoonPrison',elite:'shadowDreadmoonPrison',shrine:'shadowEclipseSanctuary',heal:'shadowEclipseSanctuary',treasure:'shadowForsakenMirrorVault'};
function roomForWave(index,nodeType='combat'){
  const rooms=chapter.rooms||[chapter.room];
  if(chapter.id==='jadeChapter'&&index>0&&index<rooms.length&&JADE_OPTIONAL_ROOMS[nodeType])return JADE_OPTIONAL_ROOMS[nodeType];
  if(chapter.id==='bambooChapter'&&index>0&&index<rooms.length&&BAMBOO_OPTIONAL_ROOMS[nodeType])return BAMBOO_OPTIONAL_ROOMS[nodeType];
  if(chapter.id==='crimsonChapter'&&index>0&&index<rooms.length&&CRIMSON_OPTIONAL_ROOMS[nodeType])return CRIMSON_OPTIONAL_ROOMS[nodeType];
  if(chapter.id==='stormChapter'&&index>0&&index<rooms.length&&STORM_OPTIONAL_ROOMS[nodeType])return STORM_OPTIONAL_ROOMS[nodeType];
  if(chapter.id==='neonChapter'&&index>0&&index<rooms.length&&NEON_OPTIONAL_ROOMS[nodeType])return NEON_OPTIONAL_ROOMS[nodeType];
  if(chapter.id==='shadowChapter'&&index>0&&index<rooms.length&&SHADOW_OPTIONAL_ROOMS[nodeType])return SHADOW_OPTIONAL_ROOMS[nodeType];
  return rooms[Math.min(rooms.length-1,index%rooms.length)];
}

function authoredEnemySpawns(roomId=room.id){
  if(room.mapRuntime!=='phaser-tiled')return [];
  return layeredMapRuntime.worldObjects('Enemy Spawns',roomId).sort((a,b)=>(a.properties.spawnIndex??0)-(b.properties.spawnIndex??0));
}

function spawnPositionFor(index,total,bounds){
  const authored=authoredEnemySpawns();if(authored.length){const point=authored[index%authored.length],cycle=Math.floor(index/authored.length),angle=(point.properties.spawnIndex??index)*2.3999632297+cycle*.77,spread=Math.min(170,cycle*34);return {x:clamp(point.x+Math.cos(angle)*spread,280,room.width-280),y:clamp(point.y+Math.sin(angle)*spread,280,room.height-280),delay:Number(point.properties.delay||0)};}
  const angle=index*2.3999632297+encounter.wave*.73,lane=(room.spawnLane??.78)+(index%3)*(room.spawnLaneStep??.07);return {x:bounds.x+Math.cos(angle)*bounds.radiusX*lane,y:bounds.y+Math.sin(angle)*bounds.radiusY*lane,delay:0};
}

function enterHub(){
  activateRoom('spiritVillage',{reposition:false});state='hub';enemies=[];roomInteractable=null;roomMission=null;destructibles=[];Object.values(effects).forEach((list)=>list.splice(0));
  corruptionDirector=null;refreshCorruptionHud();
  player.x=room.playerSpawn.x;player.y=room.playerSpawn.y;player.vx=0;player.vy=0;player.facing=-Math.PI/2;camera.x=player.x;camera.y=player.y;
  const qaStation=HUB_STATIONS.find((station)=>station.id===debugHubStation);if(qaStation){player.x=qaStation.x;player.y=qaStation.y+150;camera.x=player.x;camera.y=player.y;}
  canvas.setAttribute('aria-label','Spirit Lantern Village walkable hub');
  ui.biomeTitle.textContent='SPIRIT LANTERN VILLAGE';ui.waveLabel.textContent='HUB  SAFE HAVEN';ui.roomState.textContent='THE SPIRIT ROAD';ui.roomState.style.color='#42eaff';ui.objective.textContent='VISIT A SERVICE OR ENTER THE PORTAL';
  ui.bossPanel.classList.remove('active');hubMenuScreen.classList.remove('active');updateHud();
}

function startCampaign(){
  clearRunCheckpoint();runActive=true;
  profile.runsStarted++;profile.lastDifficulty=selectedDifficulty;saveProfile();refreshProfileUi();
  runTime=0;player.dashes=0;player.hitCount=0;player.maxCombo=0;player.comboDrop=0;player.dashCooldown=0;
  setChapter(0);player.x=room.playerSpawn.x;player.y=room.playerSpawn.y;player.vx=0;player.vy=0;camera.x=player.x;camera.y=player.y;
  encounter={wave:-1,transitioning:false,transitionTime:0,bossActive:false,bossDefeated:false,storyBeat:'intro',rewardScale:1,nodeType:'combat',startWaveAfterUpgrade:null};
  state='story';showStory('intro');
}

function openHubStation(station){
  activeHubStation=station;state='hubMenu';hubMenuScreen.classList.add('active');ui.hubShards.textContent=`SHARDS ${profile.spiritShards}`;ui.hubMenuKicker.textContent='SPIRIT LANTERN VILLAGE';ui.hubMenuTitle.textContent=station.name;
  const upgrade=HUB_UPGRADES[station.id];
  if(upgrade){ui.hubMenuCopy.textContent='Spend permanent spirit shards. Purchased ranks apply to every future run.';renderHubUpgrade(upgrade);}
  else if(station.id==='missionBoard'){
    renderMissionBoard();
  } else {
    ui.hubMenuCopy.textContent='Train before entering the spirit road. Abilities remain locked until earned during each run.';
    hubUpgradeGrid.innerHTML=`<div class="hub-upgrade-card" style="--hub:#72ef5b"><strong>MOVEMENT</strong><em>WASD  SHIFT</em><p>Move, kite, and use your hero dash for invulnerability. Enemy speed rises every chapter.</p><b>PERFECT DODGES BUILD SPACE</b></div><div class="hub-upgrade-card" style="--hub:#d95cff"><strong>COMBAT</strong><em>LMB  E  C  F  Q</em><p>Fire your ranged weapon and unlock abilities from level-up choices during the campaign.</p><b>ABILITIES START LOCKED</b></div>`;
  }
}

function renderHubUpgrade(upgrade){
  const rank=profile[upgrade.id]||0;const maxed=rank>=upgrade.max;const cost=maxed?0:upgrade.cost(rank);const affordable=profile.spiritShards>=cost;
  hubUpgradeGrid.innerHTML=`<button class="hub-upgrade-card" style="--hub:${upgrade.color}" data-hub-buy ${maxed||!affordable?'disabled':''}><strong>${upgrade.name}</strong><em>RANK ${rank} / ${upgrade.max}</em><p>${upgrade.description}</p><b>${maxed?'MAXIMUM RANK':`  ${cost}`}</b></button><div class="hub-upgrade-card" style="--hub:#78658a"><strong>NEXT RUN</strong><em>PERMANENT LEGACY</em><p>These bonuses do not unlock active abilities. Undertow Well, Foxfire Volley, Wild Heart, and Shock Paws must still be earned at levels 2, 4, 6, and 8.</p><b>  ${profile.spiritShards} AVAILABLE</b></div>`;
  if(upgrade.id==='forgeRank'){
    const collected=new Set(profile.collectedWeapons),bound=boundArsenalForHero();ui.hubMenuCopy.textContent=`Study six run-discovered blueprints and bind one awakening contract for ${heroDef.name}. Your run still begins with ${WEAPONS[heroDef.weapon].name}. Collection ${collected.size} / ${ARSENAL_BLUEPRINTS.length}.`;
    hubUpgradeGrid.insertAdjacentHTML('beforeend',ARSENAL_BLUEPRINTS.map((entry,index)=>{const known=collected.has(entry.id),selected=bound===entry.id,weaponDefinition=WEAPONS[entry.id];return `<button class="hub-upgrade-card forge-collection-card ${known?'known':'locked'} ${selected?'selected':''}" style="--hub:${entry.color};--forge-position:${entry.position};--forge-art:url('${entry.asset}')" data-forge-bind="${entry.id}" ${known?'':'disabled'}><span class="forge-weapon-art" aria-hidden="true"></span><strong>${known?entry.name:'??? UNDISCOVERED'}</strong><em>LEVEL ${entry.tier}  ${entry.tag}  ·  ${index+1} / ${ARSENAL_BLUEPRINTS.length}</em><p>${known?weaponDefinition.summary:`Reach level ${entry.tier} and choose this weapon during a run to record its blueprint.`}</p><b>${selected?'BOUND TO THIS BRAWLPAW':known?'BIND AWAKENING CONTRACT':'DISCOVER DURING A RUN'}</b></button>`;}).join(''));
    for(const button of hubUpgradeGrid.querySelectorAll('[data-forge-bind]'))button.addEventListener('click',()=>bindArsenalBlueprint(button.dataset.forgeBind));
  }
  if(upgrade.id==='vitalityRank'){
    hubUpgradeGrid.insertAdjacentHTML('beforeend',Object.values(HEROES).map((hero)=>{const unlocked=profile.unlockedHeroes.includes(hero.id)||hero.id===debugHero;const lockCallout=hero.id==='rusty'?'CLEAR ASCENSION TO UNLOCK':hero.id==='zap'?'CLEAR 2 CAMPAIGNS TO UNLOCK':hero.id==='nomi'?'DEFEAT TSUKIKO TO UNLOCK':'DEFEAT PYRECLAW TO UNLOCK';return `<button class="hub-upgrade-card hub-hero-card ${hero.id===selectedHeroId?'selected':''}" style="--hub:${hero.accent}" data-hub-hero="${hero.id}" ${unlocked?'':'disabled'}><strong>${unlocked?hero.name.toUpperCase():'??? LOCKED'}</strong><em>${hero.role.toUpperCase()}  ${hero.passiveName.toUpperCase()}</em><p>${unlocked?`${WEAPONS[hero.weapon].name}. ${hero.summary}`:(hero.unlockRequirement||'Complete the campaign to unlock.')}</p><b>${unlocked?(hero.id===selectedHeroId?'ACTIVE BRAWLPAW':'SWITCH HERO'):lockCallout}</b></button>`;}).join(''));
    for(const button of hubUpgradeGrid.querySelectorAll('[data-hub-hero]'))button.addEventListener('click',()=>selectHero(button.dataset.hubHero,{returnToHub:true}));
  }
  hubUpgradeGrid.querySelector('[data-hub-buy]')?.addEventListener('click',()=>buyHubUpgrade(upgrade));
}

function buyHubUpgrade(upgrade){
  const rank=profile[upgrade.id]||0;if(rank>=upgrade.max)return;const cost=upgrade.cost(rank);if(profile.spiritShards<cost)return;
  profile.spiritShards-=cost;profile[upgrade.id]=rank+1;saveProfile();refreshProfileUi();ui.hubShards.textContent=`SHARDS ${profile.spiritShards}`;
  if(upgrade.id==='vitalityRank'){player.maxHealth+=5;player.health+=5;}else if(upgrade.id==='forgeRank')player.damageMultiplier*=1.03;else if(upgrade.id==='attunementRank')for(const id of Object.keys(player.abilityPower))player.abilityPower[id]*=1.04;else if(upgrade.id==='purseRank')player.gold+=5;
  spawnWord(player.x,player.y-90,'PERMANENT POWER!',upgrade.color);playSfx('upgrade',.28,1.18);renderHubUpgrade(upgrade);updateHud();
}

function closeHubMenu(){hubMenuScreen.classList.remove('active');state='hub';activeHubStation=null;}

function dojoTarget(){return enemies.find((enemy)=>enemy.practice&&!enemy.dead);}

function resetDojoStats(){
  dojoState.totalDamage=0;dojoState.bestDps=0;dojoState.kills=0;dojoState.time=0;dojoState.lastDamageAt=-99;dojoState.damageSamples=[];dojoState.respawnTimer=0;
}

function clearDojoEffects(){for(const list of Object.values(effects))list.splice(0);}

function spawnDojoTarget({resetSession=false}={}){
  if(resetSession)resetDojoStats();clearDojoEffects();
  const definition=DOJO_TARGETS[dojoState.targetIndex];const target=makeEnemy({type:definition.type,x:room.combatBounds.x,y:room.combatBounds.y+210,delay:0},0);
  target.practice=true;target.practiceArmor=definition.armor;target.practiceName=definition.name;target.health=definition.health;target.maxHealth=definition.health;
  target.state=dojoState.aggressive&&target.def.behavior!=='boss'?'chase':'practice';target.stateTime=99;target.cooldown=.8;target.facing=Math.PI;
  enemies=[target];dojoState.respawnTimer=0;
  player.facing=Math.atan2(target.y-player.y,target.x-player.x);
  for(const id of Object.keys(player.abilityCooldowns))player.abilityCooldowns[id]=0;player.shotCooldown=0;player.health=player.maxHealth;player.stunTime=0;
  spawnWord(target.x,target.y-95,definition.name,target.def.color);updateDojoHud();
}

function enterDojo(){
  hubMenuScreen.classList.remove('active');activeHubStation=null;activateRoom('spiritDojo',{reposition:true});state='dojo';clearDojoEffects();enemies=[];
  player.maxHealth=Math.max(player.maxHealth,220);player.health=player.maxHealth;player.dualWield=Boolean(heroDef.naturalDual);Object.keys(ABILITIES).forEach((id)=>player.unlockedAbilities.add(id));
  for(const id of Object.keys(player.abilityPower))player.abilityPower[id]=1;resolveSynergies();resetDojoStats();dojoState.aggressive=false;
  dojoPanel.classList.add('active');ui.biomeTitle.textContent='SPIRIT DOJO';ui.waveLabel.textContent='PRACTICE CHAMBER';ui.roomState.textContent='COMBAT LAB';ui.roomState.style.color='#72ef5b';ui.objective.textContent='TEST YOUR BUILD  T TARGET  G AI  R RESET  ESC EXIT';
  ui.bossPanel.classList.remove('active');canvas.setAttribute('aria-label','Spirit Dojo interactive practice arena');spawnDojoTarget({resetSession:true});updateHud();
}

function exitDojo(){dojoPanel.classList.remove('active');resetGame();enterHub();}

function cycleDojoTarget(){dojoState.targetIndex=(dojoState.targetIndex+1)%DOJO_TARGETS.length;if(DOJO_TARGETS[dojoState.targetIndex].type==='jadeguardTanuki')dojoState.aggressive=false;spawnDojoTarget({resetSession:true});}

function toggleDojoAi(){const definition=DOJO_TARGETS[dojoState.targetIndex];if(definition.type==='jadeguardTanuki'){dojoState.aggressive=false;spawnWord(player.x,player.y-80,'BOSS ECHO IS PASSIVE','#ffd13a');updateDojoHud();return;}dojoState.aggressive=!dojoState.aggressive;spawnDojoTarget();}

function toggleDojoDual(){if(heroDef.naturalDual){spawnWord(player.x,player.y-78,'INHERENT TWIN WEAPONS',heroDef.accent);updateDojoHud();return;}player.dualWield=!player.dualWield;resolveSynergies();for(const id of Object.keys(player.abilityCooldowns))player.abilityCooldowns[id]=0;spawnWord(player.x,player.y-78,player.dualWield?'DUAL-WIELD!':'SINGLE BLASTER',player.dualWield?'#ffd13a':'#45eaff');updateDojoHud();}

function recordDojoDamage(enemy,damage){
  if(state!=='dojo'||!enemy?.practice||damage<=0)return;const applied=Math.max(0,Math.min(enemy.health,damage));dojoState.totalDamage+=applied;dojoState.lastDamageAt=dojoState.time;dojoState.damageSamples.push({time:dojoState.time,damage:applied});
}

function updateDojoHud(){
  const target=dojoTarget()||enemies.find((enemy)=>enemy.practice);const definition=DOJO_TARGETS[dojoState.targetIndex];const health=target?Math.max(0,Math.ceil(target.health)):0;const maxHealth=target?.maxHealth||definition.health;
  dojoState.damageSamples=dojoState.damageSamples.filter((sample)=>dojoState.time-sample.time<=3);const sampleDamage=dojoState.damageSamples.reduce((sum,sample)=>sum+sample.damage,0);const sampleSpan=dojoState.damageSamples.length?Math.max(.5,Math.min(3,dojoState.time-dojoState.damageSamples[0].time+.25)):1;const dps=dojoState.time-dojoState.lastDamageAt>2?0:Math.round(sampleDamage/sampleSpan);dojoState.bestDps=Math.max(dojoState.bestDps,dps);
  ui.dojoTargetName.textContent=definition.name;ui.dojoTargetHealth.textContent=`${health} / ${maxHealth}`;ui.dojoHealthFill.style.width=`${clamp(health/maxHealth*100,0,100)}%`;ui.dojoDps.textContent=String(dps);ui.dojoTotalDamage.textContent=Math.round(dojoState.totalDamage).toLocaleString();ui.dojoBestDps.textContent=String(dojoState.bestDps);ui.dojoKills.textContent=String(dojoState.kills);
  const statuses=[];for(const status of Object.values(STATUS_EFFECTS)){const remaining=target?.[status.field]||0;if(remaining>0)statuses.push(`<em class="${status.id}">${status.icon} ${status.name.toUpperCase()} ${status.id==='shock'?'':`${remaining.toFixed(1)}s`}</em>`);}statuses.push(`<em>${Math.round(definition.armor*100)}% DAMAGE</em>`);ui.dojoStatuses.innerHTML=statuses.join('');
  ui.dojoToggleAi.querySelector('span').textContent=definition.type==='jadeguardTanuki'?'AI: PASSIVE ONLY':`AI: ${dojoState.aggressive?'ACTIVE':'PASSIVE'}`;ui.dojoToggleDual.querySelector('span').textContent=heroDef.naturalDual?'TWIN WEAPONS: INHERENT':`DUAL-WIELD: ${player.dualWield?'ON':'OFF'}`;ui.dojoToggleDual.disabled=Boolean(heroDef.naturalDual);
}

function updateDojo(dt){
  if(input.pressed.has('escape')){exitDojo();return;}if(input.pressed.has('t'))cycleDojoTarget();if(input.pressed.has('g'))toggleDojoAi();if(input.pressed.has('v'))toggleDojoDual();if(input.pressed.has('r'))spawnDojoTarget({resetSession:true});
  dojoState.time+=dt;if(dojoState.respawnTimer>0){dojoState.respawnTimer-=dt;if(dojoState.respawnTimer<=0)spawnDojoTarget();}
  updatePlayer(dt);updateEnemies(dt);comboUiTimer=Math.max(0,comboUiTimer-dt);updateEffects(dt);updateDojoHud();
}

function updateHub(dt){
  updatePlayer(dt);const nearby=nearestHubStation();ui.objective.textContent=nearby?`${nearby.station.name}  PRESS E TO ${nearby.station.id==='portal'?'START RUN':'INTERACT'}`:'VISIT A SERVICE OR ENTER THE PORTAL';
  if((input.pressed.has('e')||input.pressed.has('enter'))&&nearby){if(nearby.station.id==='portal')startCampaign();else if(nearby.station.id==='dojo')enterDojo();else openHubStation(nearby.station);}
}

function setChapter(index) {
  chapterIndex = clamp(index, 0, CHAPTER_ORDER.length - 1);
  chapter = ENCOUNTERS[CHAPTER_ORDER[chapterIndex]];
  activateRoom(chapter.rooms?.[0]||chapter.room,{reposition:false});
  ui.waveLabel.textContent = `CHAPTER ${chapterIndex+1}  WAVE 1 / ${chapter.waves.length}`;
  document.querySelector('#game').setAttribute('aria-label', `${room.name} combat arena`);
}

function resetGame() {
  dojoPanel.classList.remove('active');
  weapon=WEAPONS[heroDef.weapon];shell.dataset.weapon=weapon.id;ui.weaponName.textContent=weapon.name.toUpperCase();
  setChapter(0);
  const legacyHealth=Math.min(25,profile.campaignClears*5)+profile.vitalityRank*5;const legacyGold=Math.min(25,profile.campaignClears*5)+profile.purseRank*5+(contractClaimed('spiritCull')?15:0);
  player = {
    x: room.playerSpawn.x, y: room.playerSpawn.y, vx: 0, vy: 0, radius: heroDef.radius,
    facing: -Math.PI / 2, aimFacing: -Math.PI / 2, moveFacing: -Math.PI / 2, aimLockTime: 0, health: heroDef.maxHealth+legacyHealth, maxHealth: heroDef.maxHealth+legacyHealth, invulnerable: 0, flash: 0,
    dashTime: 0, dashCooldown: 0, dashDirection: { x: 0, y: -1 }, dashTrailClock: 0,sprint:100,sprinting:false,footstepClock:0,
    attack: null, shotCooldown: 0,weaponId:weapon.id,arsenalAwakened:false,legendArsenalAwakened:false,
    abilityCooldowns: { undertowWell: 0, foxfireVolley: 0, wildHeart: 0, shockPaws: 0 },
    unlockedAbilities: new Set(), dualWield:Boolean(heroDef.naturalDual), damageMultiplier: 1+profile.forgeRank*.03, fireRateMultiplier: 1,
    rerolls:1+(contractClaimed('sealRunner')?1:0),paidRerolls:0,synergies:new Set(),eventHistory:new Set(),shotsFired:0,buildPath:null,buildMastery:null,masteryCharge:0,
    abilityPower: { undertowWell: 1+profile.attunementRank*.04, foxfireVolley:(1+profile.attunementRank*.04)*(contractClaimed('foxfireHunt')?1.06:1), wildHeart: 1+profile.attunementRank*.04, shockPaws: 1+profile.attunementRank*.04 },
    abilityEvolutions:{undertowWell:false,foxfireVolley:false,wildHeart:false,shockPaws:false},
    upgradeRanks:{spiritRounds:0,quickPaws:0,vitality:0,undertow:0,hungryFlame:0,heartBloom:0,stormHeart:0,wardbreaker:0,spiritHunter:0,spiritCatalyst:0,pressureChamber:0,headhunter:0,keenEye:0,moonPiercer:0,perfectDraw:0,glassFang:0,spiritMomentum:0,guardianHunter:0,deepReserves:0,bankShot:0,loadedDice:0,quickdraw:0,spiritCylinder:0,phaseRounds:0,foxstepMastery:0,ironBelly:0,scatterBore:0,guardianHide:0,capacitorBank:0,chainLogic:0,rapidCycle:0,moonEdge:0,secondPassage:0,cranePoise:0,permafrost:0,shatterpoint:0,oniPayload:0,blastChamber:0,razorCurrent:0,typhoonReach:0,cinderDrum:0,ruptureMagazine:0,cycloneEdge:0,crosswindRecall:0,lunarCapacitor:0,horizonBore:0,razorFang:0,hollowHex:0,spiritAegis:0},
    heartBonus: 0, stormBonus: 0,guardianBlessings:[],endingVow:null,victoryShardBonus:0,
    gold:legacyGold,goldMultiplier:1,relics:[],shopPurchases:new Set(),discoveredRegions:new Set([room.id]),clearedRegions:new Set(),worldX:0,worldY:0,currentRegion:room.id,killHeal:0,damageTakenMultiplier:heroDef.damageTakenMultiplier,speedMultiplier:1,dashCooldownMultiplier:1,
    knockbackResistance:heroDef.knockbackResistance,knockbackMultiplier:1,braceTime:0,braceDelay:.72,braceDamageMultiplier:.8,braced:false,shieldDamageMultiplier:1,eliteDamageMultiplier:contractClaimed('eliteBreakers')?1.08:1,guardianDamageMultiplier:contractClaimed('guardianOath')?1.08:1,eliteGoldMultiplier:1,eliteKillHeal:0,statusDurationMultiplier:1,bleedOnHit:0,bleedSpread:false,curseOnCrit:0,cursePowerMultiplier:1,curseDurationMultiplier:1,spiritShield:0,maxSpiritShield:0,shieldTime:0,bonusProjectiles:0,bonusPierces:0,bonusRicochets:0,ricochetDamageRetention:.78,critBonus:0,critDamageMultiplier:1,arcChainBonus:0,arcChainPower:1,arcChainRange:0,glaiveReturnPower:1,glaiveReturnSpeed:1,glaiveReturnCrit:0,weaponEvolution:null,
    wildHeartTime: 0, ultimateFlash: 0, castTime: 0, castAbility: null,
    hitCount: 0, maxCombo: 0, comboDrop: 0, dashes: 0, hurtTime: 0, stunTime: 0, bleedTime:0, bleedTick:0, curseTime:0, curseMultiplier:1,
    level: 1, xp: 0, xpToNext: 48
  };
  enemies = [];
  Object.values(effects).forEach((list) => list.splice(0));
  camera.x = player.x; camera.y = player.y; camera.shake = 0; camera.kick = 0;
  encounter = { wave:-1, transitioning:false, transitionTime:0,bossActive:false,bossDefeated:false,storyBeat:'intro',rewardScale:1,nodeType:'combat',startWaveAfterUpgrade:null };roomMission=null;missionCheckpointClock=0;defeatReason='';corruptionDirector=null;
  runTime = 0; runReward=0; hitStop = 0; clearDelay = -1; comboUiTimer = 0; pendingLevelUps = 0; currentUpgradeChoices = [];
  levelupScreen.classList.remove('active');
  tutorialActive=null;tutorialTracker.classList.remove('active','complete');storyScreen.classList.remove('active','tutorial-mode');routeScreen.classList.remove('active');shopScreen.classList.remove('active');eventScreen.classList.remove('active');guardianRewardScreen.classList.remove('active');relicDraftScreen.classList.remove('active');worldMapScreen.classList.remove('active');ui.bossPanel.classList.remove('active');currentGuardianRewards=[];pendingGuardianReward=null;currentRelicChoices=[];relicDraftContinuation=null;
  ui.waveLabel.textContent = `CHAPTER ${chapterIndex+1}  WAVE 1 / ${chapter.waves.length}`;
  ui.roomState.textContent = 'ENCOUNTER'; ui.roomState.style.color = '#ff38b5';
  ui.objective.textContent = 'BRACE  SPIRITS APPROACH';
  refreshCorruptionHud();updateHud();
}

function applyEnemyStatus(enemy,id,duration,power=1){
  const status=STATUS_EFFECTS[id];if(!status||enemy.dead)return false;
  const beforeElements=activeElementCount(enemy);
  duration*=player?.statusDurationMultiplier||1;
  enemy[status.field]=Math.max(enemy[status.field]||0,duration);
  enemy.abilityReactType=id;enemy.abilityReactTime=Math.max(enemy.abilityReactTime||0,id==='shock'?.48:id==='burn'?.38:.44);
  if(id==='burn'){enemy.burnTick=Math.min(enemy.burnTick||.45,.45);enemy.burnPower=Math.max(enemy.burnPower||1,power);}
  if(id==='bleed'){enemy.bleedTick=Math.min(enemy.bleedTick||.55,.55);enemy.bleedPower=Math.max(enemy.bleedPower||1,power);}
  if(id==='curse'){enemy.curseMultiplier=Math.max(enemy.curseMultiplier||1,Math.max(1.12,power));}
  if(id==='shield'){const capacity=Math.max(1,Math.round(power));enemy.maxShield=Math.max(enemy.maxShield||0,capacity);enemy.shield=Math.max(enemy.shield||0,capacity);}
  if(id==='stun'){enemy.stunTime=Math.max(enemy.stunTime||0,duration);}
  if(player?.buildMastery==='elementalist'&&beforeElements<2&&activeElementCount(enemy)>=2&&(enemy.elementalRuptureCooldown||0)<=0)triggerPrismaticRupture(enemy,power);
  return true;
}

function applyPlayerStatus(id,duration,power=1){
  const status=STATUS_EFFECTS[id];if(!status||!player)return false;player[status.field]=Math.max(player[status.field]||0,duration);
  if(id==='curse')player.curseMultiplier=Math.max(player.curseMultiplier||1,Math.max(1.15,power));
  if(id==='bleed'){player.bleedTick=Math.min(player.bleedTick||.65,.65);player.bleedPower=Math.max(player.bleedPower||1,power);}
  if(id==='shield'){const capacity=Math.max(1,Math.round(power));player.maxSpiritShield=Math.max(player.maxSpiritShield||0,capacity);player.spiritShield=Math.max(player.spiritShield||0,capacity);}
  if(id==='stun')player.stunTime=Math.max(player.stunTime||0,duration);return true;
}

function consumeEnemyCurse(enemy,damage){
  if(!enemy.curseTime)return {damage,shattered:false};const multiplier=enemy.curseMultiplier||1.25;enemy.curseTime=0;enemy.curseMultiplier=1;enemy.abilityReactType='curse';enemy.abilityReactTime=.48;effects.rings.push({x:enemy.x,y:enemy.y,radius:74,maxRadius:18,color:'#b84dff',life:.44,maxLife:.44});burst(enemy.x,enemy.y-12,'#d78cff',14,280,4);spawnWord(enemy.x,enemy.y-74,'HEX SHATTER!','#e7bdff');return {damage:damage*multiplier,shattered:true};
}

function activeElementCount(enemy){return Number((enemy.burnTime||0)>0)+Number((enemy.wetTime||0)>0)+Number((enemy.shockTime||0)>0)+Number((enemy.freezeTime||0)>0);}

function triggerPrismaticRupture(origin,power=1){
  origin.elementalRuptureCooldown=1.1;const radius=210,damage=Math.round(22*Math.max(1,power));effects.rings.push({x:origin.x,y:origin.y,radius:22,maxRadius:radius,color:'#e66cff',life:.52,maxLife:.52});effects.spriteEffects.push({asset:'shockImpactVfx',fixedFrame:5,x:origin.x,y:origin.y-18,width:390,height:310,life:.55,maxLife:.55,glow:'#e66cff'});spawnWord(origin.x,origin.y-86,'PRISMATIC RUPTURE!','#f4a2ff');burst(origin.x,origin.y-12,'#65efff',32,460,6);
  for(const target of enemies){if(target.dead||target.state==='waiting'||distance(origin,target)>radius+target.radius)continue;const away=normalize(target.x-origin.x,target.y-origin.y);damageEnemyFromAbility(target,damage,165,away,'#e66cff',null);}
  camera.shake=Math.max(camera.shake,10);hitStop=Math.max(hitStop,.05);playSfx('lightning',.24,1.18);
}

function resolveEnemyDamage(enemy,amount,incomingDirection=null,{consumeCurse=true}={}){
  const bossCounter=enemy.def.behavior==='boss'&&enemy.counterTime>0?(BOSS_PROFILES[enemy.def.id]?.counterMultiplier||1):1;
  const cursed=consumeCurse?consumeEnemyCurse(enemy,Math.max(0,amount)):{damage:Math.max(0,amount),shattered:false};let remaining=cursed.damage*bossCounter;let shieldDamage=0;let blocked=false;
  const frontalGuard=enemy.def.behavior==='shield';
  const sourceDirection=incomingDirection?normalize(-incomingDirection.x,-incomingDirection.y):null;
  const facingVector={x:Math.cos(enemy.facing),y:Math.sin(enemy.facing)};
  const hitsFront=!frontalGuard||(sourceDirection&&facingVector.x*sourceDirection.x+facingVector.y*sourceDirection.y>.08);
  if(enemy.shield>0&&hitsFront){remaining*=player?.shieldDamageMultiplier||1;shieldDamage=Math.min(enemy.shield,remaining);enemy.shield-=shieldDamage;remaining-=shieldDamage;blocked=frontalGuard;if(blocked){spawnWord(enemy.x+facingVector.x*32,enemy.y-54,'BLOCK!','#ff765d');effects.rings.push({x:enemy.x+facingVector.x*28,y:enemy.y+facingVector.y*18,radius:8,maxRadius:58,color:'#ff5b3a',life:.2,maxLife:.2});}if(enemy.shield<=0){enemy.shield=0;enemy.guardCooldown=enemy.def.guardRecovery||0;spawnWord(enemy.x,enemy.y-78,'SHIELD BREAK!',enemy.eliteDef?.color||enemy.def.color||'#70f06c');effects.rings.push({x:enemy.x,y:enemy.y,radius:18,maxRadius:135,color:enemy.eliteDef?.color||enemy.def.color||'#70f06c',life:.48,maxLife:.48});burst(enemy.x,enemy.y-10,enemy.eliteDef?.color||enemy.def.color||'#70f06c',24,320,5);}}
  enemy.health-=remaining;return {healthDamage:remaining,shieldDamage,total:remaining+shieldDamage,blocked,curseShattered:cursed.shattered};
}

function eliteModifierFor(spawnIndex,waveIndex,nodeType){
  if(waveIndex<0)return null;
  const difficultyBonus=selectedDifficulty==='nightmare' ? .08 : selectedDifficulty==='spirited' ? -.04 : 0;
  const chance=clamp(chapterIndex*.09+waveIndex*.06+difficultyBonus+(corruptionTier().elite||0)+coopPressure().elite+(nodeType==='elite' ? .38 : nodeType?.includes('Elite') ? .24 : 0),0,.84);
  const guaranteed=nodeType==='elite'?2:nodeType?.includes('Elite')?1:0;
  const roll=((spawnIndex*37+waveIndex*19+chapterIndex*23+11)%100)/100;
  if(spawnIndex>=guaranteed&&roll>=chance)return null;
  const ids=Object.keys(ELITE_MODIFIERS);return ids[(spawnIndex+waveIndex*2+chapterIndex)%ids.length];
}

function makeEnemy(spawn, index) {
  const definition = ENEMIES[spawn.type || 'jadeBrawler'];
  discoverEnemy(definition);
  const eliteDef=spawn.eliteId?ELITE_MODIFIERS[spawn.eliteId]:null;
  const scales=normalizedEnemyScales({healthScale:(spawn.healthScale||1)*(eliteDef?.healthScale||1),speedScale:(spawn.speedScale||1)*(eliteDef?.speedScale||1),damageScale:(spawn.damageScale||1)*(eliteDef?.damageScale||1),boss:definition.behavior==='boss'});const maxHealth=Math.round(definition.maxHealth*scales.health);const maxShield=Math.round(maxHealth*Math.max(eliteDef?.shieldScale||0,definition.guardScale||0));const spawnDuration=spawn.spawnDuration??1.35;
  return {
    id: ++enemyId, type: definition.id, def: definition, x: spawn.x, y: spawn.y, vx: 0, vy: 0, radius: definition.radius,
    health:maxHealth,maxHealth,shield:maxShield,maxShield,guardCooldown:0,eliteId:eliteDef?.id||null,eliteDef,eliteRewardScale:eliteDef?.rewardScale||1,splitDepth:spawn.splitDepth||0,
    facing: Math.PI / 2, state: spawn.delay > 0 ? 'waiting' : 'enter', stateTime: spawn.delay || spawnDuration, spawnDuration,cooldown: 1.2 + index * .16,
    flash: 0, stagger: 0, dead: false, deathTime: 0, hitPlayer: false, bob: Math.random() * Math.PI * 2,
    burnTime: 0, burnTick: 0, wetTime: 0, shockTime: 0, stunTime:0,bleedTime:0,bleedTick:0,bleedPower:1,curseTime:0,curseMultiplier:1,shieldTime:maxShield>0?999:0,huntTime: 0,conductiveStacks:0,conductiveTime:0,chillStacks:0,chillTime:0,freezeTime:0,elementalRuptureCooldown:0,abilityReactTime:0,abilityReactType:'',abilityReactSeed:Math.random()*20,
    orbitAngle: Math.atan2(spawn.y - room.playerSpawn.y, spawn.x - room.playerSpawn.x),
    orbitRadius: definition.behavior === 'ranged' ? 430 : definition.behavior === 'summoner' ? 480 : definition.behavior === 'bomber' ? 390 : definition.behavior === 'assassin' ? 250 : ['conductor','hacker','curser'].includes(definition.behavior) ? 500 : definition.behavior === 'heavy' || definition.behavior === 'shield' ? 105 : definition.behavior === 'boss' ? 260 : definition.behavior === 'basic' ? 86 : 180 + (index % 2) * 34,
    orbitDrift: index % 2 ? 1 : -1, spawnIndex: index, shotSide: index % 2 ? 1 : -1,
    healthScale:scales.health,speedScale:scales.speed,damageScale:scales.damage,attackCooldownScale:eliteDef?.cooldownScale||1,windupScale:eliteDef?.windupScale||1,
    summonCharges:definition.summonCharges||0,summoned:Boolean(spawn.summoned),summonOwnerId:spawn.summonOwnerId||null,
    bossPhase: 1, patternIndex: 0, patternHit: false, phaseTriggered: {2:false,3:false},counterTime:0,counterAnnounced:false
  };
}

const CHAPTER_STORY_BEATS={
  jadeChapter:{accent:'#8cff39',intro:['CHAPTER I  THE SILENT BELLS','THE GROVE IS LISTENING','The guardian bells have gone silent. Corrupted spirits are gathering beneath the moonlit shrine, growing faster and stronger with every broken seal.','Break the curse before the Jadeguard wakes.','BEGIN THE CHAPTER','ENTER JADE GROVE'],interlude2:['CHAPTER I  TWO SEALS BROKEN','THE BELLS ANSWER BACK','The freed spirits whisper the same warning: the curse is not invading the grove. It is being pulled toward the buried guardian by a bell that no living paw can hear.','Follow the false ringing. Find the hand beneath it.','CHOOSE THE THIRD PATH','HUNT THE HIDDEN BELL'],interlude4:['CHAPTER I  THE JADE LIE','THE GUARDIAN WAS FRAMED','A shattered curse anchor bears Jadeguard’s own seal turned backward. Someone chained the ancient Tanuki inside his duty, then taught every corrupted spirit to wear the scent of an intruder.','If Jadeguard sees {hero} first, the curse wins.','BREAK THE FINAL SEALS','REACH JADEGUARD FIRST'],boss:['CHAPTER I  THE GUARDIAN WAKES','THE MOUNTAIN MOVES','The last corrupted spirit falls. Beneath the shrine, jade fire erupts, and the ancient Tanuki mistakes {hero} for the curse that poisoned his grove.','No trespasser leaves my sacred ground alive.','FACE THE JADEGUARD','FREE JADEGUARD TANUKI']},
  bambooChapter:{accent:'#41f5da',intro:['CHAPTER II  BREATH BENEATH THE REEDS','THE HOLLOW BREATHES','Jadeguard opens the moon gate, but the path exhales a poisoned mist. Reedblade hunters and spore archers gather around something enormous moving below the roots.','The curse ran downstream. Follow it before the Hollow closes.','ENTER BAMBOO HOLLOW','TRACE THE POISONED CURRENT'],interlude2:['CHAPTER II  THE HUNGER BELOW','THE ROOTS HAVE TEETH','Rescued hollow spirits reveal that Moonfang has been fighting the curse from underground. Every victory tears more poison from the reeds—and drives it deeper into the guardian’s starving heart.','He is not hunting us. He is hunting what we carry.','DESCEND THROUGH THE REEDS','FOLLOW MOONFANG’S TRAIL'],interlude4:['CHAPTER II  THE MOON CHAIN','THE HOLLOW STOPS BREATHING','At the Moonstone Causeway, the curse tightens around Moonfang’s sacred collar. The guardian can no longer tell prey from ally, and the whole forest bends toward his first strike.','Stand your ground, {hero}. Make him remember his oath.','ENTER THE MOONSTONE ROAD','SURVIVE THE MOON HUNT'],boss:['CHAPTER II  THE MOONFANG AWAKENS','TEETH BENEATH THE MOON','The Hollow stops breathing. Every bamboo stalk bends toward the moon gate as its ancient lion-dog guardian tears free of the corrupted roots.','Your fire freed the grove. Now prove it can survive the moon.','FACE MOONFANG','FREE MOONFANG KOMAINU']},
  crimsonChapter:{accent:'#ff5b27',intro:['CHAPTER III  THE GATE OF ASH','THE DOJO DEMANDS A TRIAL','Beyond Bamboo Hollow stands a monastery that trains spirits for war. The corruption has turned every duel into an execution and sealed the final road behind an ancient oni gate.','Ring all four bells. Survive what answers.','ENTER THE CRIMSON DOJO','RING THE ASHEN BELLS'],interlude2:['CHAPTER III  THE BURNING OATH','THE SHOGUN CHOSE THE CURSE','The first war bells reveal the truth: Pyreclaw bound the corruption to his own heart to stop it reaching Spirit Lantern Village. Every spirit slain weakens the prison—and strengthens the prisoner.','The gate held because its guardian agreed to burn.','CROSS THE CINDER ROOFS','FIND PYRECLAW’S OATH'],interlude4:['CHAPTER III  NO ROAD BACK','THE ONI GATE OPENS','The final bell answers with Pyreclaw’s voice. He will not abandon the gate, even if his living fire consumes every warrior who comes to free him. The last two seals are a declaration of war.','Come armed, {hero}. Mercy will not survive this throne.','MARCH ON THE ONI GATE','BREAK THE SHOGUN’S CHAINS'],boss:['CHAPTER III  THE SHOGUN’S OATH','THE LAST BELL BURNS','The oni gate splits open. Pyreclaw Shogun Tora has chained the curse to his own heart, and every bell in the dojo answers with a wave of living fire.','If the curse must pass this gate, it will pass through me.','CHALLENGE PYRECLAW','FREE PYRECLAW SHOGUN TORA']},
  stormChapter:{accent:'#37dfff',intro:['CHAPTER IV  THE SEA THAT EATS THE SKY','THE HORIZON HAS TEETH','Beyond Pyreclaw’s oni gate, the spirit road ends at a drowned harbor. A living tempest has swallowed the stars, and every wave carries warriors wearing Raijin Kirin’s storm mark.','The sea is not flooding the road. The sky is dragging it upward.','ENTER TEMPEST HARBOR','FOLLOW THE STOLEN LIGHTNING'],interlude2:['CHAPTER IV  THE DROWNED BELLS','THE STORM REMEMBERS YOUR NAME','Freed tidekeepers reveal that Raijin Kirin once carried every prayer safely across the ocean. The curse reversed the current. Now every desperate voice feeds the storm crown instead.','Silence the drowned bells before the guardian hears us coming.','CROSS THE TIDEGLASS ROAD','BREAK THE STORM CHOIR'],interlude4:['CHAPTER IV  THE LAST HORIZON','HEAVEN BEGINS TO FALL','The Thunderbreak Lighthouse catches fire with blue lightning. Above it, the Kirin pulls whole islands toward the eye of the storm, building a throne from everything the spirit sea has lost.','Climb, {hero}. The road ends where the sky breaks.','ASCEND SKYFANG','GROUND THE STORM CROWN'],boss:['CHAPTER IV  EATER OF SKIES','THE TEMPEST OPENS ITS EYE','Sea and sky fold into one vast arena. Raijin Kirin descends through the lightning, chained to a crown that turns every rescued spirit into another thunderbolt.','Four guardians were bound. Only one still believes the chain is a crown.','CHALLENGE RAIJIN KIRIN','FREE THE EATER OF SKIES']},
  neonChapter:{accent:'#ff3ab8',intro:['CHAPTER V  THE CITY THAT DREAMS IN CODE','NO ONE HERE IS AWAKE','Beyond the returned horizon, Neon City shines beneath endless rain. Its citizens move, trade, and pray—but every face repeats the same perfect night while the Shogun Core harvests their memories.','This city is not alive. It is being replayed.','BREACH THE RAIN GATE','WAKE THE CIRCUIT MARKET'],interlude2:['CHAPTER V  THE GHOST PROTOCOL','THE CITY KNOWS YOUR PAST','Freed market spirits remember each of the four guardians falling before they remember their own names. Daikyo has been recording every victory, teaching his army how {hero} escapes, fires, and survives.','Every fight makes the Core smarter. Become impossible to predict.','ENTER THE HOLOGRAM ARCADE','CRASH THE MEMORY LOOP'],interlude4:['CHAPTER V  THE LAST COMMAND','THE SHOGUN WAS THE FIRST CHAIN','The Data Lotus reveals an older truth: Daikyo wrote the command that bound every guardian to their sacred post. The corruption did not invent the chains. It simply taught them to tighten.','Reach the Core before he deletes the proof.','ASCEND SHOGUN TOWER','SEVER THE ROOT COMMAND'],boss:['CHAPTER V  SHOGUN OF THE CORE','THE CITY OPENS ITS EYES','The tower splits and the sleeping city looks upward. Daikyo Oni descends in white tiger armor, carrying the original command in a reactor where his heart once lived.','I did not chain the guardians. I made duty eternal.','CHALLENGE DAIKYO ONI','DELETE THE FIRST CHAIN']},
  shadowChapter:{accent:'#b84dff',intro:['CHAPTER VI  THE REALM BEHIND EVERY SHADOW','THE LIGHTS CAST NOTHING','Neon City wakes, yet none of the five freed guardians casts a shadow. Their missing selves flee through Daikyo’s broken command and open an obsidian road behind the moon.','The chains were written in code. The fear that asked for them is older.','ENTER THE OBSIDIAN PATH','FOLLOW THE STOLEN SHADOWS'],interlude2:['CHAPTER VI  THE LIVES WE LEFT BEHIND','MIRRORGRAVE REMEMBERS EVERY RUN','The village is inhabited by heroes who turned left when {hero} turned right, fell where {hero} survived, or accepted powers this life refused. Tsukiko has hidden every abandoned future here and calls the prison mercy.','She did not erase our failures. She made them her army.','CROSS WRAITHWOOD','FREE THE FORGOTTEN SELVES'],interlude4:['CHAPTER VI  THE FIRST REQUEST','DAIKYO OBEYED THE HOLLOW MOON','The Eclipse Archive reveals the true beginning: Tsukiko saw a future where the spirit roads devoured one another, then ordered Daikyo to make every guardian’s duty eternal. The curse grew from a cage built to prevent grief.','A perfect future chosen for everyone is still a prison.','ASCEND THE UMBRAL PALACE','BREAK THE SIX MOON CHAINS'],boss:['CHAPTER VI  EMPRESS OF THE HOLLOW MOON','EVERY SHADOW KNEELS','Beyond the last palace step waits Tsukiko, snow-leopard guardian of forgotten choices. Six spectral tails carry every future she refused to let the world risk.','Freedom creates suffering, {hero}. I loved this world enough to end its choices.','CHALLENGE TSUKIKO','FREE THE HOLLOW MOON']}
};

function renderCampaignStory(beat){
  if(beat==='epilogue')return false;const story=CHAPTER_STORY_BEATS[chapter.id],definition=story?.[beat]||story?.intro;if(!definition)return false;const resolve=(copy)=>copy.replaceAll('{hero}',heroDef.name),seals=beat==='boss'?6:beat==='interlude4'?4:beat==='interlude2'?2:0;
  storyScreen.style.setProperty('--story-accent',story.accent);ui.storyKicker.textContent=resolve(definition[0]);ui.storyTitle.textContent=resolve(definition[1]);ui.storyCopy.textContent=resolve(definition[2]);ui.storyQuote.textContent=resolve(definition[3]);ui.storyProgress.textContent=`SEALS BROKEN  ${seals} / ${chapter.waves.length}`;ui.storyObjective.textContent=`NEXT  ${resolve(definition[5])}`;ui.storyButton.innerHTML=`${resolve(definition[4])} <span>›</span>`;return true;
}

function showStory(beat) {
  tutorialTracker.classList.remove('active');storyScreen.classList.remove('tutorial-mode');encounter.storyBeat = beat; state = 'story'; storyScreen.classList.add('active');
  if(renderCampaignStory(beat)){saveRunCheckpoint({kind:'story',beat});return;}
  const bamboo = chapter.id === 'bambooChapter';
  const crimson = chapter.id === 'crimsonChapter';
  if(beat==='epilogue'){
    const endings={
      mercy:{kicker:'EPILOGUE  A DAWN WITH SHADOWS',title:'THE SIX GUARDIANS RISE',copy:`${heroDef.name} returns every lost self. Jade Grove rings, Bamboo Hollow breathes, Crimson calls its warriors home, Storm Coast sees stars, Neon City wakes, and the Shadow Realm opens its doors to a real dawn.`,quote:'Strength is not what you preserve. It is what you trust to choose again.',button:'RETURN TO SPIRIT LANTERN VILLAGE'},
      power:{kicker:'EPILOGUE  KEEPER OF EVERY FUTURE',title:'THE HOLLOW MOON CHOOSES YOU',copy:`${heroDef.name} claims Tsukiko’s throne. Six realms are safe, but every possible spirit road now answers to the fiercest guardian of all.`,quote:'No future will be lost unless I allow it.',button:'DESCEND FROM THE HOLLOW MOON'},
      freedom:{kicker:'EPILOGUE  EVERY ROAD OPENS',title:'THE FUTURE HAS NO MASTER',copy:`${heroDef.name} breaks the hollow throne. Six guardians remain by choice, every shadow returns to its living paw, and every BrawlPaw may decide what the next dawn becomes.`,quote:'A chosen oath is devotion. A future without escape is a cage.',button:'RUN WITH THE FREE SPIRITS'}
    };const ending=endings[player.endingVow]||endings.mercy;storyScreen.style.setProperty('--story-accent','#d95cff');ui.storyKicker.textContent=ending.kicker;ui.storyTitle.textContent=ending.title;ui.storyCopy.textContent=ending.copy;ui.storyQuote.textContent=ending.quote;ui.storyProgress.textContent='6 / 6 GUARDIANS FREED';ui.storyObjective.textContent='EVERY POSSIBLE ROAD REMEMBERS YOUR VOW';ui.storyButton.innerHTML=`${ending.button} <span>›</span>`;
  } else if (beat === 'boss' && crimson) {
    ui.storyKicker.textContent = 'CHAPTER III  THE SHOGUN"S OATH';
    ui.storyTitle.textContent = 'THE LAST BELL BURNS';
    ui.storyCopy.textContent = 'The oni gate splits open. Pyreclaw Shogun Tora has chained the curse to his own heart, and every bell in the dojo answers with a wave of living fire.';
    ui.storyQuote.textContent = 'If the curse must pass this gate, it will pass through me.';
    ui.storyButton.innerHTML = 'CHALLENGE PYRECLAW <span></span>';
  } else if (beat === 'boss' && bamboo) {
    ui.storyKicker.textContent = 'CHAPTER II  THE MOONFANG AWAKENS';
    ui.storyTitle.textContent = 'TEETH BENEATH THE MOON';
    ui.storyCopy.textContent = 'The Hollow stops breathing. Every bamboo stalk bends toward the moon gate as its ancient lion-dog guardian tears free of the corrupted roots.';
    ui.storyQuote.textContent = 'Your fire freed the grove. Now prove it can survive the moon.';
    ui.storyButton.innerHTML = 'FACE MOONFANG <span></span>';
  } else if (beat === 'boss') {
    ui.storyKicker.textContent = 'CHAPTER I  THE GUARDIAN WAKES';
    ui.storyTitle.textContent = 'THE MOUNTAIN MOVES';
    ui.storyCopy.textContent = `The last corrupted spirit falls. Beneath the shrine, jade fire eruptsand the ancient Tanuki mistakes ${heroDef.name} for the curse that poisoned his grove.`;
    ui.storyQuote.textContent = 'No trespasser leaves my sacred ground alive.';
    ui.storyButton.innerHTML = 'FACE THE JADEGUARD <span></span>';
  } else if (crimson) {
    ui.storyKicker.textContent = 'CHAPTER III  THE GATE OF ASH';
    ui.storyTitle.textContent = 'THE DOJO DEMANDS A TRIAL';
    ui.storyCopy.textContent = 'Beyond Bamboo Hollow stands a monastery that trains spirits for war. The corruption has turned every duel into an execution and sealed the final road behind an ancient oni gate.';
    ui.storyQuote.textContent = 'Ring all four bells. Survive what answers.';
    ui.storyButton.innerHTML = 'ENTER THE CRIMSON DOJO <span></span>';
  } else if (bamboo) {
    ui.storyKicker.textContent = 'CHAPTER II  BREATH BENEATH THE REEDS';
    ui.storyTitle.textContent = 'THE HOLLOW BREATHES';
    ui.storyCopy.textContent = 'Jadeguard opens the moon gate, but the path exhales a poisoned mist. Reedblade hunters and spore archers gather around something enormous moving below the roots.';
    ui.storyQuote.textContent = 'The curse ran downstream. Follow it before the Hollow closes.';
    ui.storyButton.innerHTML = 'ENTER BAMBOO HOLLOW <span></span>';
  } else {
    ui.storyKicker.textContent = 'CHAPTER I  THE SILENT BELLS';
    ui.storyTitle.textContent = 'THE GROVE IS LISTENING';
    ui.storyCopy.textContent = 'The guardian bells have gone silent. Corrupted spirits are gathering beneath the moonlit shrine, growing faster and stronger with every broken seal.';
    ui.storyQuote.textContent = 'Break the curse before the Jadeguard wakes.';
    ui.storyButton.innerHTML = 'BEGIN THE CHAPTER <span></span>';
  }
  saveRunCheckpoint({kind:'story',beat});
}

function continueStory() {
  storyScreen.classList.remove('active');
  if(encounter.storyBeat==='epilogue')endGame(true);else if(encounter.storyBeat==='boss')spawnBoss();else if(encounter.storyBeat==='interlude2')openRoute(2);else if(encounter.storyBeat==='interlude4')openRoute(4);else if(chapterIndex===0&&!profile.tutorialComplete){startWave(0);showTutorialLesson(clamp(profile.tutorialStep||0,0,TUTORIAL_LESSONS.length-1));}else startWave(0);
}

const TUTORIAL_LESSONS=[
  {id:'move',title:'FIND YOUR FOOTING',copy:'The grove is wide, and standing still is how spirits surround you. Move in any direction until your paws remember the road.',quote:'Use W A S D to move.',task:'MOVE THROUGH THE GROVE',hint:'Use W A S D  ·  travel 420 distance',goal:420,timeout:30},
  {id:'fire',title:'ANSWER WITH SPIRIT FIRE',copy:'Aim with the mouse. Your starter is a real ranged weapon: keep space between you and danger, then fire down the open lane.',quote:'Aim with the mouse. Fire with Left Click or J.',task:'FIRE THE SPIRIT BLASTER',hint:'Aim anywhere  ·  fire 5 shots',goal:5,timeout:30},
  {id:'sprint',title:'MAKE YOUR OWN SPACE',copy:'Running is not another attack. Hold it to leave a closing pack, cross open ground, or reach loot before the next threat arrives.',quote:'Move while holding Space to sprint.',task:'SPRINT THROUGH THE COURTYARD',hint:'Hold Space while moving  ·  sprint for 2 seconds',goal:2,timeout:30},
  {id:'dash',title:'STEP THROUGH DANGER',copy:'Fox Step is your precise escape. Pick a direction, wait for the warning, then cut through the danger instead of spending every second dashing.',quote:'Press Shift while moving to Fox Step.',task:'PERFORM ONE FOX STEP',hint:'Move in a direction  ·  press Shift once',goal:1,timeout:30},
  {id:'loot',title:'EVERY RUIN HIDES POWER',copy:'Break caches and collect what they carry. Gold buys temporary run power; experience unlocks stronger choices during this expedition.',quote:'Shoot the marked cache and collect its reward.',task:'BREAK THE TRAINING CACHE',hint:'Fire at the gold-marked cache',goal:1,timeout:40},
  {id:'fight',title:'THE GROVE FIGHTS BACK',copy:'Now combine what you learned. Keep range, sprint before you are boxed in, and save Fox Step for a committed attack.',quote:'Defeat the first slow scouts. You can always retreat.',task:'DEFEAT THE FIRST SCOUTS',hint:'Shoot from range  ·  sprint for space  ·  dash on warning',goal:4,timeout:90}
];

function tutorialHeroImage(){return `url('${heroDef.portrait}')`;}
function typeTutorialCopy(copy){clearInterval(tutorialTypeTimer);ui.storyCopy.textContent='';let index=0;tutorialTypeTimer=setInterval(()=>{index=Math.min(copy.length,index+2);ui.storyCopy.textContent=copy.slice(0,index)+(index<copy.length?' ▮':'');if(index>=copy.length)clearInterval(tutorialTypeTimer);},22);}

function showTutorialLesson(index=0){
  const lesson=TUTORIAL_LESSONS[index];if(!lesson){finishTutorial();return;}tutorialActive={index,id:lesson.id,progress:0,elapsed:0,lastX:player.x,lastY:player.y,startShots:player.shotsFired,startDashes:player.dashes,startKills:0,phase:'explain'};
  state='story';storyScreen.classList.add('active','tutorial-mode');storyScreen.style.setProperty('--story-accent',index<2?'#45eaff':index<4?'#ff4d9b':'#ffd13a');storyScreen.style.setProperty('--tutorial-art',tutorialHeroImage());ui.storyKicker.textContent=`FIELD LESSON ${index+1} / ${TUTORIAL_LESSONS.length}`;ui.storyTitle.textContent=lesson.title;typeTutorialCopy(lesson.copy);ui.storyQuote.textContent=lesson.quote;ui.storyProgress.textContent='TRACKED IN LIVE GAMEPLAY';ui.storyObjective.textContent=lesson.task;ui.storyButton.innerHTML=`TRY IT NOW <span>›</span>`;ui.tutorialProgress.style.width='0%';
}

function startTutorialLesson(){
  clearInterval(tutorialTypeTimer);const lesson=TUTORIAL_LESSONS[tutorialActive.index];storyScreen.classList.remove('active','tutorial-mode');state='playing';tutorialActive.phase='live';tutorialActive.elapsed=0;tutorialActive.lastX=player.x;tutorialActive.lastY=player.y;tutorialActive.startShots=player.shotsFired;tutorialActive.startDashes=player.dashes;tutorialActive.startKills=enemies.filter((enemy)=>enemy.dead).length;
  ui.tutorialStep.textContent=`LESSON ${tutorialActive.index+1} / ${TUTORIAL_LESSONS.length}`;ui.tutorialTask.textContent=lesson.task;ui.tutorialHint.textContent=lesson.hint;tutorialTracker.classList.add('active');tutorialTracker.classList.remove('complete');ui.tutorialProgress.style.width='0%';ui.objective.textContent=lesson.task;
  for(const enemy of enemies)enemy.tutorialDormant=lesson.id!=='fight';
  if(lesson.id==='loot')spawnTutorialCache();
}

function spawnTutorialCache(){
  if(destructibles.some((prop)=>prop.tutorial))return;const x=player.x+Math.cos(player.facing)*330,y=player.y+Math.sin(player.facing)*330;destructibles.push({id:'tutorial-cache',kind:'crate',tutorial:true,x,y,radius:50,health:18,maxHealth:18,broken:false,col:3,row:0,scale:.4});effects.rings.push({x,y,radius:18,maxRadius:92,color:'#ffd13a',life:1.2,maxLife:1.2});spawnWord(x,y-65,'TRAINING CACHE','#ffd13a');
}

function updateTutorial(dt){
  if(!tutorialActive||tutorialActive.phase!=='live')return;const lesson=TUTORIAL_LESSONS[tutorialActive.index];tutorialActive.elapsed+=dt;
  if(lesson.id==='move'){tutorialActive.progress+=distance(player,{x:tutorialActive.lastX,y:tutorialActive.lastY});tutorialActive.lastX=player.x;tutorialActive.lastY=player.y;}
  else if(lesson.id==='fire')tutorialActive.progress=player.shotsFired-tutorialActive.startShots;
  else if(lesson.id==='sprint'&&player.sprinting)tutorialActive.progress+=dt;
  else if(lesson.id==='dash')tutorialActive.progress=player.dashes-tutorialActive.startDashes;
  else if(lesson.id==='loot')tutorialActive.progress=destructibles.some((prop)=>prop.tutorial&&prop.broken)?1:0;
  else if(lesson.id==='fight')tutorialActive.progress=enemies.filter((enemy)=>enemy.dead).length-tutorialActive.startKills;
  const ratio=clamp(tutorialActive.progress/lesson.goal,0,1);ui.tutorialProgress.style.width=`${ratio*100}%`;ui.objective.textContent=lesson.task;document.documentElement.dataset.tutorialStep=lesson.id;document.documentElement.dataset.tutorialProgress=ratio.toFixed(2);if(ratio>=1)completeTutorialLesson();else if(tutorialActive.elapsed>=lesson.timeout)skipTutorialLesson('TIMEOUT SAFETY');
}

function completeTutorialLesson(){
  if(!tutorialActive||tutorialActive.phase!=='live')return;const completedIndex=tutorialActive.index;tutorialActive.phase='complete';tutorialTracker.classList.add('complete');ui.tutorialTask.textContent='LESSON COMPLETE';ui.tutorialHint.textContent='The spirit road remembers.';ui.tutorialProgress.style.width='100%';playSfx('upgrade',.22,1.18);profile.tutorialStep=completedIndex+1;saveProfile();if(completedIndex===TUTORIAL_LESSONS.length-1){finishTutorial();return;}setTimeout(()=>{if(!tutorialActive)return;showTutorialLesson(completedIndex+1);},650);
}

function skipTutorialLesson(reason='SKIPPED'){if(!tutorialActive)return;spawnWord(player.x,player.y-80,reason,'#9b94a7');completeTutorialLesson();}
function finishTutorial(){clearInterval(tutorialTypeTimer);profile.tutorialComplete=true;profile.tutorialStep=TUTORIAL_LESSONS.length;saveProfile();tutorialActive=null;tutorialTracker.classList.remove('active','complete');storyScreen.classList.remove('active','tutorial-mode');for(const enemy of enemies)enemy.tutorialDormant=false;state='playing';ui.objective.textContent='DEFEAT THE OPENING SCOUTS';delete document.documentElement.dataset.tutorialStep;delete document.documentElement.dataset.tutorialProgress;}
function skipTutorial(){clearInterval(tutorialTypeTimer);profile.tutorialComplete=true;profile.tutorialStep=TUTORIAL_LESSONS.length;saveProfile();tutorialActive=null;tutorialTracker.classList.remove('active','complete');storyScreen.classList.remove('active','tutorial-mode');for(const enemy of enemies)enemy.tutorialDormant=false;state='playing';ui.objective.textContent='DEFEAT THE OPENING SCOUTS';delete document.documentElement.dataset.tutorialStep;delete document.documentElement.dataset.tutorialProgress;}

function startWave(index,modifiers={}) {
  const wave = chapter.waves[index];
  const difficulty=activeDifficulty();
  Object.values(effects).forEach((list)=>list.splice(0));const requestedNodeType=modifiers.nodeType||'combat',targetRegion=modifiers.resumeRegion&&ROOMS[modifiers.resumeRegion]?modifiers.resumeRegion:roomForWave(index,requestedNodeType);activateRoom(targetRegion,{reposition:true,announce:true,waveIndex:index,subtitle:wave.name.toUpperCase()});
  if(player.maxSpiritShield>0)applyPlayerStatus('shield',14,player.maxSpiritShield);
  encounter.wave=index; encounter.waveTime=0;encounter.transitioning=false; encounter.bossActive=false;encounter.nodeType=modifiers.nodeType||'combat';encounter.modifiers={...modifiers};encounter.biomePressureClock=biomePressureInterval(index)*.72;encounter.biomePressureCount=0;encounter.warpackClock=(CHAPTER_WARPACKS[chapter.id]?.interval||18)*.78;encounter.warpackCount=0;corruptionDirector=createCorruptionDirector(index,modifiers.corruption);const corruption=corruptionTier();encounter.rewardScale=(modifiers.rewardScale||1)*difficulty.rewardScale*corruption.reward;enemies=[];state='playing';roomInteractable=null;spawnRoomDestructibles(index,modifiers.brokenProps||[]);spawnRoomMission(wave.mission,modifiers.missionState);refreshCorruptionHud({surge:corruptionDirector.tier>=2});
  if(PHYSICAL_ROUTE_NODES.has(encounter.nodeType)){spawnRoomInteractable(encounter.nodeType);if(modifiers.interactableUsed)roomInteractable.used=true;}
  ui.waveLabel.textContent=`CHAPTER ${chapterIndex+1}  WAVE ${index+1} / ${chapter.waves.length}`;
  const eliteNode=encounter.nodeType==='elite'||encounter.nodeType?.includes('Elite');ui.roomState.textContent=eliteNode?`MUTATED  ${wave.name.toUpperCase()}`:wave.name.toUpperCase();ui.roomState.style.color=eliteNode?'#f13b8c':index>=2?'#ff7448':'#ff38b5';
  ui.objective.textContent=roomMission?.title||`SURVIVE ${wave.name.toUpperCase()}`;
  const b=room.combatBounds;const party=coopPressure();
  const authoredCount=wave.targetCount||wave.roster.length;const targetCount=Math.max(wave.roster.length,Math.ceil(authoredCount*(difficulty.enemyCountScale||1)*corruption.count*party.count));const scaledRoster=Array.from({length:targetCount},(_,i)=>wave.roster[i%wave.roster.length]);
  scaledRoster.forEach((type,i)=>{
    const spawn=spawnPositionFor(i,targetCount,b);
    const spawnDuration=Math.max(.42,1.35-index*.15-chapterIndex*.08);
    const rawSpeedScale=wave.speedScale*(modifiers.speedScale||1)*difficulty.speedScale*corruption.speed;const speedScale=rawSpeedScale<=1?rawSpeedScale:Math.min(2.35,1+(rawSpeedScale-1)*.58);
    enemies.push(makeEnemy({type,eliteId:eliteModifierFor(i,index,encounter.nodeType),delay:spawnDuration+spawn.delay+i*wave.spawnRate/((difficulty.spawnRateScale||1)*corruption.spawn),spawnDuration,x:spawn.x,y:spawn.y,healthScale:wave.healthScale*(modifiers.healthScale||1)*difficulty.healthScale*corruption.health*party.health,speedScale,damageScale:wave.damageScale*(modifiers.damageScale||1)*difficulty.damageScale*corruption.damage*party.damage},i));
  });
  spawnWord(player.x,player.y-110,`WAVE ${index+1}!`,index>=2?'#ff6a43':'#56edff');
  if(roomMission?.type!=='eliminate')setTimeout(()=>{if(state==='playing'&&roomMission)spawnWord(player.x,player.y-145,roomMission.title,roomMission.color);},420);
  effects.rings.push({x:player.x,y:player.y,radius:18,maxRadius:170,color:index>=2?'#ff5d42':'#45eaff',life:.7,maxLife:.7});
  encounter.modifiers.missionState=serializeMissionState();encounter.modifiers.corruption=serializeCorruptionDirector();saveRunCheckpoint({kind:'wave',wave:index,modifiers:encounter.modifiers});if(!coop.applyingSignal)coopSignal({kind:'wave',chapter:chapterIndex,wave:index,nodeType:encounter.nodeType});
}

function biomePressureInterval(waveIndex=encounter?.wave||0){const pressure=chapter.pressure;if(!pressure)return 999;return Math.max(pressure.minInterval,pressure.baseInterval-waveIndex*.82-(selectedDifficulty==='nightmare'?.65:selectedDifficulty==='ascension'?1.05:0));}

function scheduleBiomePressure(){
  const pressure=chapter.pressure;if(!pressure||encounter.wave<pressure.startWave||encounter.transitioning||encounter.bossActive)return;
  const b=room.combatBounds,index=encounter.biomePressureCount++,lead=.42+encounter.wave*.055;
  if(pressure.id==='bellEcho'){
    const target={x:clamp(player.x+player.vx*lead,b.x-b.radiusX*.72,b.x+b.radiusX*.72),y:clamp(player.y+player.vy*lead,b.y-b.radiusY*.72,b.y+b.radiusY*.72)};
    effects.biomePressures.push({type:'bellEcho',x:target.x,y:target.y,radius:pressure.radius+encounter.wave*8,damage:pressure.damage+encounter.wave*2,color:pressure.color,life:pressure.warning,maxLife:pressure.warning,stage:'warning',triggered:false,index});
  }else if(pressure.id==='sporeBloom'){
    const angle=index*2.21+encounter.wave*.47,lane=.28+(index%3)*.18;effects.biomePressures.push({type:'sporeBloom',x:b.x+Math.cos(angle)*b.radiusX*lane,y:b.y+Math.sin(angle)*b.radiusY*lane,radius:pressure.radius+encounter.wave*7,damage:pressure.damage+encounter.wave,color:pressure.color,life:pressure.warning,maxLife:pressure.warning,activeDuration:pressure.activeDuration,slow:pressure.slow,stage:'warning',triggered:false,index});
  }else if(pressure.id==='eclipseRift'){
    const target={x:clamp(player.x+player.vx*lead,b.x-b.radiusX*.78,b.x+b.radiusX*.78),y:clamp(player.y+player.vy*lead,b.y-b.radiusY*.76,b.y+b.radiusY*.76)};
    effects.biomePressures.push({type:'eclipseRift',x:target.x,y:target.y,radius:pressure.radius+encounter.wave*10,damage:pressure.damage+encounter.wave*3,color:pressure.color,life:pressure.warning,maxLife:pressure.warning,activeDuration:pressure.activeDuration,slow:pressure.slow,stage:'warning',triggered:false,index});
  }else{
    const angle=Math.atan2(player.y-b.y,player.x-b.x)+(index%2?Math.PI/2:0)+Math.sin(index*1.7)*.22;effects.biomePressures.push({type:'emberLane',x:b.x,y:b.y,angle,width:pressure.width+encounter.wave*6,length:b.radiusX*2.25,damage:pressure.damage+encounter.wave*2,color:pressure.color,life:pressure.warning,maxLife:pressure.warning,activeDuration:pressure.activeDuration,stage:'warning',triggered:false,index});
    if(pressure.id==='stormSurge'){const surge=effects.biomePressures.at(-1);surge.type='stormSurge';surge.width=pressure.width+encounter.wave*8;surge.length=b.radiusX*2.42;}
    if(pressure.id==='firewallGrid'){const firewall=effects.biomePressures.at(-1);firewall.type='firewallGrid';firewall.width=pressure.width+encounter.wave*8;firewall.length=b.radiusX*2.5;firewall.angle+=index%3===0?Math.PI/4:0;}
  }
  spawnWord(player.x,player.y-130,pressure.name,pressure.color);
}

function updateBiomePressure(dt){
  if(state!=='playing'||encounter.bossActive||encounter.transitioning)return;const pressure=chapter.pressure;if(!pressure||encounter.wave<pressure.startWave)return;
  encounter.biomePressureClock=(encounter.biomePressureClock??biomePressureInterval())-dt;if(encounter.biomePressureClock<=0){encounter.biomePressureClock=biomePressureInterval();scheduleBiomePressure();}
}

function startSpecialistShowcase(){
  const late=debugParams.get('set')==='late';if(late)setChapter(3);activateRoom(late?ROOMS.stormDrownedBellSanctum:ROOMS.jadeRootGarden,{reposition:true,announce:true,waveIndex:2,subtitle:'SPECIALIST COMBAT LAB'});state='playing';encounter.wave=2;encounter.transitioning=false;encounter.bossActive=false;encounter.nodeType='elite';encounter.rewardScale=1;encounter.biomePressureClock=999;encounter.biomePressureCount=0;encounter.warpackClock=999;encounter.warpackCount=0;clearDelay=-1;enemies=[];
  player.maxHealth=520;player.health=520;player.damageMultiplier=1.4;player.unlockedAbilities.add('foxfireVolley');player.unlockedAbilities.add('undertowWell');
  const placements=late?[
    {type:'tidechantHeron',x:player.x-520,y:player.y-240,delay:.2},
    {type:'kernelHackerTanuki',x:player.x+510,y:player.y-210,delay:1},
    {type:'moonveilSeer',x:player.x,y:player.y+380,delay:1.8}
  ]:[
    {type:'bellweaverCat',x:player.x-540,y:player.y-250,delay:.2},
    {type:'powderkegToad',x:player.x+520,y:player.y-230,delay:1},
    {type:'gatewardenRhino',x:player.x,y:player.y+390,delay:1.8},
    {type:'mistclawLynx',x:player.x+470,y:player.y+290,delay:2.6}
  ];
  enemies=placements.map((spawn,index)=>makeEnemy({...spawn,healthScale:1.15,speedScale:1,damageScale:.8},index));
  ui.waveLabel.textContent='COMBAT LAB  SPECIALISTS';ui.roomState.textContent=late?'THREE LATE-GAME CONTROLLERS':'FOUR AUTHORED THREATS';ui.roomState.style.color=late?'#74f5ff':'#ff9a31';ui.objective.textContent=late?'ESCAPE THE LANE  LEAVE THE SNARE  SPRINT OFF THE CURSE':'FLANK  ESCAPE  READ THE MARK';updateHud();
}

function startStatusShowcase(){
  setChapter(2);activateRoom('crimsonDojo',{reposition:true,announce:true,waveIndex:3,subtitle:'STATUS COMBAT LAB'});state='playing';encounter.wave=3;encounter.transitioning=false;encounter.bossActive=false;encounter.nodeType='elite';encounter.rewardScale=1;encounter.biomePressureClock=999;encounter.warpackClock=999;clearDelay=-1;enemies=[];
  player.level=8;player.maxHealth=520;player.health=520;player.upgradeRanks.razorFang=2;player.upgradeRanks.hollowHex=2;player.upgradeRanks.spiritAegis=2;player.bleedOnHit=5;player.curseOnCrit=1.34;player.cursePowerMultiplier=1.18;player.curseDurationMultiplier=1.3;player.maxSpiritShield=60;applyPlayerStatus('shield',18,60);
  enemies=[makeEnemy({type:'emberAkita',x:player.x-280,y:player.y-135,delay:0,healthScale:8,speedScale:.7,damageScale:.7},0),makeEnemy({type:'ironhorn',x:player.x+285,y:player.y-125,delay:0,healthScale:5,speedScale:.65,damageScale:.7},1),makeEnemy({type:'mistclawLynx',x:player.x,y:player.y+245,delay:0,healthScale:7,speedScale:.7,damageScale:.65},2)];for(const enemy of enemies){enemy.practice=true;enemy.state='practice';enemy.stateTime=99;}applyEnemyStatus(enemies[0],'bleed',12,1.45);applyEnemyStatus(enemies[1],'curse',12,1.34);applyEnemyStatus(enemies[2],'shield',12,180);
  ui.waveLabel.textContent='COMBAT LAB  SHARED STATUS ENGINE';ui.roomState.textContent='BLEED  CURSE  WARD';ui.roomState.style.color='#ff5b86';ui.objective.textContent='MOVE WOUNDED TARGETS  SHATTER HEXES  BREAK WARDS';updateHud();
}

function spawnBoss({restoring=false}={}) {
  Object.values(effects).forEach((list)=>list.splice(0));roomInteractable=null;roomMission=null;destructibles=[];activateRoom(chapter.bossRoom||chapter.rooms?.at(-1)||chapter.room,{reposition:true,announce:true,waveIndex:chapter.waves.length,subtitle:'GUARDIAN CHAMBER'});
  const b=room.combatBounds; enemies=[]; encounter.bossActive=true; encounter.transitioning=false; state='playing';
  const difficulty=activeDifficulty();corruptionDirector=createCorruptionDirector(chapter.waves.length);const corruption=corruptionTier(),party=coopPressure();refreshCorruptionHud({surge:true});
  const bossEntranceY=b.y+(chapter.id==='shadowChapter'?445:chapter.id==='neonChapter'?430:chapter.id==='stormChapter'?410:chapter.id==='crimsonChapter'?390:280);
  const boss=makeEnemy({type:chapter.boss,x:b.x+330,y:bossEntranceY,delay:.25,healthScale:difficulty.healthScale*corruption.health*party.health,speedScale:difficulty.speedScale*corruption.speed,damageScale:difficulty.damageScale*corruption.damage*party.damage},0);
  boss.state='waiting'; boss.stateTime=.25;boss.domainClock=Number.POSITIVE_INFINITY; enemies.push(boss);
  const bossDef=ENEMIES[chapter.boss];
  ui.waveLabel.textContent=`CHAPTER ${chapterIndex+1}  BOSS`; ui.roomState.textContent=chapter.id==='shadowChapter'?'HOLLOW MOON':chapter.id==='neonChapter'?'OVERRIDE PROTOCOL':chapter.id==='stormChapter'?'TEMPEST CROWN':chapter.id==='crimsonChapter'?'INFERNO OATH':chapter.id==='bambooChapter'?'MOON HUNGER':'SPIRIT FURY'; ui.roomState.style.color=bossDef.color;
  ui.objective.textContent=`DEFEAT ${bossDef.name.toUpperCase()}`; ui.bossName.textContent=bossDef.name.toUpperCase(); ui.bossPanel.classList.add('active');
  camera.shake=18;if(!restoring)player.health=Math.min(player.maxHealth,player.health+35);
  saveRunCheckpoint({kind:'boss'});if(!coop.applyingSignal)coopSignal({kind:'boss',chapter:chapterIndex});
}

function beginWaveTransition() {
  if(encounter.transitioning)return;
  recordContractProgress('sealRunner');
  if(!(player.clearedRegions instanceof Set))player.clearedRegions=new Set(player.clearedRegions||[]);player.clearedRegions.add(room.id);
  encounter.transitioning=true;encounter.awaitingGate=room.mapRuntime==='phaser-tiled'&&Boolean(layeredMapRuntime.forwardGate());encounter.transitionTime=encounter.awaitingGate?0:2.4;
  ui.roomState.textContent='SEAL BROKEN';ui.roomState.style.color='#65ef4f';ui.objective.textContent=encounter.awaitingGate?'THE NORTH GATE IS OPEN  ·  CONTINUE FORWARD':'THE CURSE GROWS STRONGER';
  player.health=Math.min(player.maxHealth,player.health+12);
  spawnWord(player.x,player.y-110,encounter.awaitingGate?'GATE OPEN!':'WAVE CLEAR!','#65ef80');
}

function updateEncounter(dt) {
  if (!encounter.transitioning) return;
  if(encounter.awaitingGate){
    const exit=layeredMapRuntime.exitAt(player);if(!exit)return;encounter.awaitingGate=false;encounter.transitionTime=.45;player.vx=0;player.vy=0;player.invulnerable=Math.max(player.invulnerable,.9);spawnWord(player.x,player.y-100,'PATH FOUND!','#45efff');
  }
  encounter.transitionTime-=dt;
  if(encounter.transitionTime>0)return;
  encounter.transitioning=false;
  if(encounter.wave===1)showStory('interlude2');
  else if(encounter.wave===3)showStory('interlude4');
  else if(encounter.wave+1<chapter.waves.length) openRoute(encounter.wave+1);
  else showStory('boss');
}

function openRoute(nextWave){
  pendingRouteWave=nextWave;state='route';routeScreen.classList.add('active');currentRouteChoices=ROUTE_SETS[(nextWave-1)%ROUTE_SETS.length];
  ui.routeBiome.textContent=`${room.name.toUpperCase()}  BRANCHING ROUTE`;
  ui.routeProgress.innerHTML=[...Array(chapter.waves.length).keys(),'boss'].map((step,index)=>`<span class="route-step ${index<nextWave?'cleared':index===nextWave?'current':''} ${step==='boss'?'boss':''}">${step==='boss'?'BOSS':index+1}</span>`).join('');
  routeGrid.innerHTML=currentRouteChoices.map((node,index)=>`<button class="route-card ${node.id==='elite'?'elite':''}" style="--node:${node.color}" data-route-index="${index}"><span class="choice-art node-icon" data-choice-art="${routeArtFrame(node.id)}" aria-hidden="true"></span><strong>${node.name}</strong><em>${node.tag}</em><span>${node.description}</span></button>`).join('');
  for(const button of routeGrid.querySelectorAll('.route-card'))button.addEventListener('click',()=>selectRoute(Number(button.dataset.routeIndex)));
  refreshRouteSummary();updateHud();playSfx('upgrade',.2,.92);saveRunCheckpoint({kind:'route',nextWave});
}

function routeArtFrame(id){return ({combat:8,event:14,elite:9,shop:11,treasure:12,secret:14,shrine:13,heal:10}[id]??8);}
function shopArtFrame(id){return ({moonTonic:10,twinSpirits:0,spiritScope:3,jadeBand:2,foxfireCharm:5,stormSeal:7}[id]??12);}
function choiceArtFrame(choice){const text=`${choice.name} ${choice.tag||''} ${choice.type||''}`.toLowerCase();if(text.includes('heart')||text.includes('health')||text.includes('mercy'))return 6;if(text.includes('fire')||text.includes('inferno')||text.includes('oni'))return 5;if(text.includes('storm')||text.includes('lightning')||text.includes('tempest'))return 7;if(text.includes('water')||text.includes('current')||text.includes('tide'))return 4;if(text.includes('gold')||text.includes('fortune')||text.includes('cache'))return 12;if(text.includes('ward')||text.includes('shell')||text.includes('aegis'))return 2;if(text.includes('crown')||text.includes('power'))return 15;if(text.includes('weapon')||text.includes('edge')||text.includes('hunt'))return 0;return 14;}

function refreshRouteSummary(){
  ui.routeHealth.textContent=`HP ${Math.ceil(player.health)} / ${player.maxHealth}`;ui.routeGold.textContent=`GOLD ${player.gold}`;ui.routeRelics.textContent=player.relics.length?player.relics.map((id)=>RELICS.find((relic)=>relic.id===id)?.name).join('  '):'NO RELICS';
}

function selectRoute(index){
  if(state!=='route')return;const node=currentRouteChoices[index];if(!node)return;routeScreen.classList.remove('active');
  if(node.id==='elite')startWave(pendingRouteWave,{nodeType:'elite',healthScale:1.28,speedScale:1.18,damageScale:1.22,rewardScale:2});
  else if(PHYSICAL_ROUTE_NODES.has(node.id))startWave(pendingRouteWave,{nodeType:node.id,rewardScale:1.08});
  else if(node.id==='shop')openShop();
  else if(node.id==='event'||node.id==='secret')openRouteEvent(node.id);
  else startWave(pendingRouteWave);
}

function openRouteEvent(kind){
  const pool=ROUTE_EVENTS[kind];const unseen=pool.filter((entry)=>!player.eventHistory.has(`${kind}:${entry.title}`));
  activeRouteEvent=(unseen.length?unseen:pool)[Math.floor(Math.random()*(unseen.length?unseen.length:pool.length))];activeRouteEvent.kind=kind;
  player.eventHistory.add(`${kind}:${activeRouteEvent.title}`);state='event';eventScreen.classList.add('active');
  ui.eventKicker.textContent=activeRouteEvent.kicker;ui.eventTitle.textContent=activeRouteEvent.title;ui.eventCopy.textContent=activeRouteEvent.copy;ui.eventQuote.textContent=activeRouteEvent.quote;
  eventChoiceGrid.innerHTML=activeRouteEvent.choices.map((choice,index)=>`<button class="event-choice" style="--event:${choice.color}" data-event-index="${index}" ${choice.available&&!choice.available()?'disabled':''}><span class="choice-art event-icon" data-choice-art="${choiceArtFrame(choice)}" aria-hidden="true"></span><strong>${choice.name}</strong><em>${choice.tag}</em><p>${choice.description}</p><b>${choice.result}</b></button>`).join('');
  for(const button of eventChoiceGrid.querySelectorAll('.event-choice'))button.addEventListener('click',()=>chooseRouteEvent(Number(button.dataset.eventIndex)));
  playSfx('upgrade',.24,kind==='secret'?1.18:.9);
}

function chooseRouteEvent(index){
  if(state!=='event'||!activeRouteEvent)return;const choice=activeRouteEvent.choices[index];if(!choice||(choice.available&&!choice.available()))return;
  choice.apply();
}

function finishRouteEvent(options={}){
  const eventKind=activeRouteEvent?.kind||'event';eventScreen.classList.remove('active');activeRouteEvent=null;spawnWord(player.x,player.y-95,'FATE CHOSEN!','#d94cff');updateHud();startWave(pendingRouteWave,{nodeType:eventKind,...options});
}

function openGuardianReward(guardianId){
  const reward=GUARDIAN_REWARDS[guardianId];if(!reward)return;
  const guardianCourt=chapter.bossRoom&&ROOMS[chapter.bossRoom];if(guardianCourt&&room.id!==guardianCourt.id)activateRoom(guardianCourt,{reposition:true});
  clearDelay=-1;pendingGuardianReward=guardianId;currentGuardianRewards=reward.choices;state='guardianReward';guardianRewardScreen.classList.add('active');
  ui.guardianRewardKicker.textContent=reward.kicker;ui.guardianRewardTitle.textContent=reward.title;ui.guardianRewardCopy.textContent=reward.copy;
  guardianRewardGrid.innerHTML=reward.choices.map((choice,index)=>`<button class="guardian-reward-card ${reward.final?'final-vow':''}" style="--guardian:${choice.color}" data-guardian-reward="${index}"><span class="guardian-choice">${index+1} / CLAIM</span><span class="choice-art guardian-icon" data-choice-art="${choiceArtFrame(choice)}" aria-hidden="true"></span><strong>${choice.name}</strong><em>${choice.type}</em><p>${choice.description}</p><b>${choice.detail}</b></button>`).join('');
  for(const button of guardianRewardGrid.querySelectorAll('.guardian-reward-card'))button.addEventListener('click',()=>chooseGuardianReward(Number(button.dataset.guardianReward)));
  saveRunCheckpoint({kind:'guardianReward',guardianId});playSfx('upgrade',.32,reward.final?.86:1.1);
}

function chooseGuardianReward(index){
  if(state!=='guardianReward')return;const guardianId=pendingGuardianReward;const definition=GUARDIAN_REWARDS[guardianId];const choice=currentGuardianRewards[index];if(!definition||!choice)return;
  if(choice.apply)choice.apply();player.guardianBlessings=Array.isArray(player.guardianBlessings)?player.guardianBlessings:[];player.guardianBlessings.push(choice.id);guardianRewardScreen.classList.remove('active');pendingGuardianReward=null;currentGuardianRewards=[];
  if(definition.final){player.endingVow=choice.ending;player.victoryShardBonus=choice.shardBonus||0;showStory('epilogue');return;}
  resolveSynergies();player.health=Math.min(player.maxHealth,player.health+Math.max(30,Math.round(player.maxHealth*.28)));spawnWord(player.x,player.y-110,choice.name.toUpperCase(),choice.color);effects.rings.push({x:player.x,y:player.y,radius:25,maxRadius:230,color:choice.color,life:1,maxLife:1});burst(player.x,player.y-15,choice.color,46,470,7);playSfx('upgrade',.32,1.08);completeChapter();
}

function relicRole(relic){
  if(['dragonScale','bloodVial','lanternWard'].includes(relic.id))return 'SURVIVAL';
  if(['luckyCoin','oniContract'].includes(relic.id))return 'FORTUNE';
  if(relic.id==='rainbowFeather')return 'MOBILITY';
  if(['thunderSeal','phoenixPlume','riverMirror'].includes(relic.id))return 'ELEMENTAL';
  if(['crimsonThread','moonMirror'].includes(relic.id))return 'STATUS';
  if(['wardBell','guardianFang'].includes(relic.id))return 'GUARDIAN HUNT';
  return 'WEAPON POWER';
}

function relicBuildScore(relic){
  let score=0;
  if(player.buildPath==='gunner'&&['spiritMask','moonPearl','guardianFang'].includes(relic.id))score+=4;
  if(player.buildPath==='elementalist'&&['thunderSeal','phoenixPlume','riverMirror','crimsonThread','moonMirror'].includes(relic.id))score+=4;
  if(player.buildPath==='vanguard'&&['dragonScale','bloodVial','wardBell','lanternWard'].includes(relic.id))score+=4;
  if(relic.id==='thunderSeal'&&player.unlockedAbilities.has('shockPaws'))score+=3;
  if(relic.id==='phoenixPlume'&&player.unlockedAbilities.has('foxfireVolley'))score+=3;
  if(relic.id==='riverMirror'&&player.unlockedAbilities.has('undertowWell'))score+=3;
  if(relic.id==='crimsonThread'&&player.bleedOnHit>0)score+=3;
  if(relic.id==='moonMirror'&&player.curseOnCrit>0)score+=3;
  if(relic.id==='lanternWard'&&player.maxSpiritShield>0)score+=3;
  if(relic.id==='oniContract'&&selectedDifficulty!=='story')score+=1;
  return score;
}

function relicDetail(relic){
  return ({luckyCoin:'+35% ALL GOLD',spiritMask:'+15% WEAPON + ABILITY',thunderSeal:'+30% SHOCK PAWS',bloodVial:'+2 HP PER KILL',dragonScale:'-12% DAMAGE TAKEN',rainbowFeather:'+12% SPEED / -15% DASH COOLDOWN',wardBell:'2X SHIELD DAMAGE / +15% ELITE DAMAGE',oniContract:'+75% ELITE GOLD / +10% DAMAGE TAKEN',moonPearl:'+1 PROJECTILE PIERCE',phoenixPlume:'+35% FOXFIRE POWER',riverMirror:'+35% UNDERTOW POWER',guardianFang:'+30% GUARDIAN DAMAGE',crimsonThread:'BLEED SPREADS ON DEFEAT',moonMirror:'+18% CURSE POWER / +30% DURATION',lanternWard:'+25 WARD / REFRESH EACH SEAL'}[relic.id]||relic.description.toUpperCase());
}

function openRelicDraft({source='AN ANCIENT TREASURE ANSWERS',continuation=null}={}){
  const available=RELICS.filter((relic)=>!player.relics.includes(relic.id));
  if(!available.length){player.gold+=100;spawnWord(player.x,player.y-105,'RELIC VAULT COMPLETE  +100 GOLD','#ffd13a');if(continuation)continuation();else updateHud();return;}
  const pool=[...available];for(let index=pool.length-1;index>0;index--){const swap=Math.floor(Math.random()*(index+1));[pool[index],pool[swap]]=[pool[swap],pool[index]];}
  currentRelicChoices=pool.slice(0,3);relicDraftReturnState=state;relicDraftContinuation=continuation;state='relicDraft';relicDraftScreen.classList.add('active');
  ui.relicDraftKicker.textContent=source;ui.relicDraftCopy.textContent=player.buildPath?`Your ${player.buildPath.toUpperCase()} path is taking shape. Choose the charm that completes it.`:'Claim one run-changing charm. The other spirits return to the road.';
  const bestScore=Math.max(...currentRelicChoices.map(relicBuildScore));
  relicDraftGrid.innerHTML=currentRelicChoices.map((relic,index)=>{const score=relicBuildScore(relic),recommended=bestScore>0&&score===bestScore;return `<button class="relic-draft-card ${recommended?'recommended':''}" style="--relic:${relic.color}" data-relic-index="${index}"><span class="relic-choice">${index+1} / CLAIM</span>${recommended?'<span class="relic-match">BUILD MATCH</span>':''}<span class="choice-art relic-icon" data-choice-art="${choiceArtFrame(relic)}" aria-hidden="true"></span><strong>${relic.name}</strong><em>${relicRole(relic)}</em><p>${relic.description}</p><b>${relicDetail(relic)}</b></button>`;}).join('');
  for(const button of relicDraftGrid.querySelectorAll('.relic-draft-card'))button.addEventListener('click',()=>chooseRelic(Number(button.dataset.relicIndex)));
  playSfx('upgrade',.26,1.04);
}

function grantRelic(options={}){openRelicDraft(options);}

function chooseRelic(index){
  if(state!=='relicDraft')return;const relic=currentRelicChoices[index];if(!relic)return;
  player.relics.push(relic.id);relic.apply();resolveSynergies();relicDraftScreen.classList.remove('active');currentRelicChoices=[];state=relicDraftReturnState;const continuation=relicDraftContinuation;relicDraftContinuation=null;
  spawnWord(player.x,player.y-105,relic.name.toUpperCase(),relic.color);effects.rings.push({x:player.x,y:player.y,radius:20,maxRadius:190,color:relic.color,life:.9,maxLife:.9});burst(player.x,player.y-12,relic.color,34,390,6);playSfx('upgrade',.28,1.18);updateHud();
  if(debugSystem)document.documentElement.dataset.relicClaimed=relic.id;
  if(continuation)continuation();else if(runActive&&encounter.wave>=0)saveRunCheckpoint({kind:'wave',wave:encounter.wave,modifiers:encounter.modifiers||{}});
}

function spawnRoomInteractable(type){
  const definition=INTERACTABLE_DEFS[type];if(!definition)return;
  const side=encounter.wave%2?1:-1;roomInteractable={type,...definition,x:room.combatBounds.x+side*room.combatBounds.radiusX*.48,y:room.combatBounds.y+room.combatBounds.radiusY*.2,used:false,radius:74};
}

function spawnRoomDestructibles(waveIndex,brokenIds=[]){
  if(room.id==='spiritVillage'||room.id==='spiritDojo'){destructibles=[];return;}
  if(room.mapRuntime==='phaser-tiled'){
    destructibles=layeredMapRuntime.worldObjects('Props / Interactive').filter((object)=>object.properties.destructible).map((object,index)=>{const p=object.properties,kind=p.kind||'pot',id=`map:${room.id}:${object.name}`;return {id,kind,x:object.x,y:object.y,radius:p.collisionRadius||(kind==='crate'?44:34),health:p.health||(kind==='crate'?24:14),maxHealth:p.health||(kind==='crate'?24:14),broken:brokenIds.includes(id),col:kind==='crate'?3:2,row:0,scale:kind==='crate'?.34:.27,mapObject:object};});return;
  }
  const count=4+Math.min(4,Math.floor(waveIndex/2));const b=room.combatBounds;destructibles=Array.from({length:count},(_,index)=>{const angle=(index/count)*Math.PI*2+waveIndex*.67;const kind=index%3===0?'crate':'pot',id=`${chapterIndex}:${waveIndex}:${index}`;return {id,kind,x:b.x+Math.cos(angle)*b.radiusX*(.42+(index%2)*.18),y:b.y+Math.sin(angle)*b.radiusY*(.42+(index%2)*.14),radius:kind==='crate'?44:34,health:kind==='crate'?24:14,maxHealth:kind==='crate'?24:14,broken:brokenIds.includes(id),col:kind==='crate'?3:2,row:0,scale:kind==='crate'?.34:.27};});
}

function missionPalette(type){
  if(type==='anchors')return chapter.id==='shadowChapter'?'#c865ff':chapter.id==='neonChapter'?'#ff38c7':chapter.id==='stormChapter'?'#31e8ff':chapter.id==='crimsonChapter'?'#ff542f':chapter.id==='bambooChapter'?'#b8ff45':'#c94cff';
  if(type==='rescue')return chapter.id==='shadowChapter'?'#70efff':chapter.id==='neonChapter'?'#46f6ff':chapter.id==='stormChapter'?'#78fff0':chapter.id==='crimsonChapter'?'#ffbc42':chapter.id==='bambooChapter'?'#72f7c7':'#55eaff';
  return chapter.id==='shadowChapter'?'#e7d3ff':chapter.id==='neonChapter'?'#f7ef69':chapter.id==='stormChapter'?'#65f5ff':chapter.id==='crimsonChapter'?'#ff9a32':chapter.id==='bambooChapter'?'#a6ff4c':'#65f3dc';
}

function spawnRoomMission(definition={type:'eliminate',title:'DEFEAT THE SPIRITS'},saved={}){
  const type=definition.type||'eliminate',b=room.combatBounds,color=missionPalette(type);
  roomMission={...definition,type,color,complete:Boolean(saved?.complete),rewarded:Boolean(saved?.rewarded),failed:false,actors:[],checkpointClock:0};
  if(type==='anchors'){
    const broken=new Set(saved?.brokenIds||[]),count=definition.count||3;
    roomMission.actors=Array.from({length:count},(_,index)=>{const angle=(index/count)*Math.PI*2-1.15;const id=`anchor:${chapterIndex}:${encounter.wave}:${index}`;return {id,x:b.x+Math.cos(angle)*b.radiusX*.44,y:b.y+Math.sin(angle)*b.radiusY*.4,radius:54,maxHealth:definition.health||70,health:definition.health||70,broken:broken.has(id),kind:'anchor'};});
    roomMission.complete=roomMission.complete||roomMission.actors.every((actor)=>actor.broken);
  }else if(type==='rescue'){
    const released=new Set(saved?.releasedIds||[]),count=definition.count||2;
    roomMission.actors=Array.from({length:count},(_,index)=>{const angle=(index/count)*Math.PI*2+.45;const id=`captive:${chapterIndex}:${encounter.wave}:${index}`;return {id,x:b.x+Math.cos(angle)*b.radiusX*.39,y:b.y+Math.sin(angle)*b.radiusY*.35,radius:48,released:released.has(id),kind:'captive'};});
    roomMission.complete=roomMission.complete||roomMission.actors.every((actor)=>actor.released);
  }else if(type==='defend'){
    const maxHealth=definition.health||300;roomMission.duration=definition.duration||25;roomMission.ward={x:b.x,y:b.y+Math.min(125,b.radiusY*.12),radius:82,maxHealth,health:clamp(saved?.wardHealth??maxHealth,1,maxHealth),grace:clamp(saved?.wardGrace??3.5,0,3.5),calmTime:0};
    roomMission.remaining=clamp(saved?.remaining??roomMission.duration,0,roomMission.duration);roomMission.complete=roomMission.complete||roomMission.remaining<=0;
  }
  missionCheckpointClock=0;
}

function serializeMissionState(){
  if(!roomMission)return null;
  return {type:roomMission.type,complete:roomMission.complete,rewarded:roomMission.rewarded,brokenIds:roomMission.actors.filter((actor)=>actor.broken).map((actor)=>actor.id),releasedIds:roomMission.actors.filter((actor)=>actor.released).map((actor)=>actor.id),wardHealth:roomMission.ward?.health,wardGrace:roomMission.ward?.grace,remaining:roomMission.remaining};
}

function saveMissionCheckpoint(){
  if(!roomMission||!encounter||encounter.bossActive)return;encounter.modifiers={...(encounter.modifiers||{}),missionState:serializeMissionState()};saveRunCheckpoint({kind:'wave',wave:encounter.wave,modifiers:encounter.modifiers});
}

function completeRoomMission(){
  if(!roomMission||roomMission.complete&&roomMission.rewarded)return;roomMission.complete=true;
  if(!roomMission.rewarded&&roomMission.type!=='eliminate'){roomMission.rewarded=true;const reward=10+encounter.wave*3;player.gold+=reward;gainXp(6+encounter.wave*2);const victory=chapter.id==='shadowChapter'?'NIGHT BROKEN!':chapter.id==='neonChapter'?'SYSTEM RESTORED!':chapter.id==='stormChapter'?'TIDE BROKEN!':chapter.id==='crimsonChapter'?'OATH KEPT!':chapter.id==='bambooChapter'?'HOLLOW FREED!':'SEAL RESTORED!';spawnWord(player.x,player.y-118,victory,roomMission.color);spawnWord(player.x,player.y-82,`+${reward} GOLD`, '#ffd34f');effects.rings.push({x:player.x,y:player.y,radius:22,maxRadius:190,color:roomMission.color,life:.85,maxLife:.85});playSfx('upgrade',.24,1.04);}
  saveMissionCheckpoint();updateHud();
}

function failRoomMission(){
  if(!roomMission||roomMission.failed)return;roomMission.failed=true;defeatReason=`${roomMission.title} FAILED. THE CURSE CLAIMED THE ROOM.`;ui.objective.textContent='MISSION FAILED';spawnWord(player.x,player.y-135,'MISSION FAILED!','#ff375f');camera.shake=22;playSfx('heavyImpact',.38,.62);setTimeout(()=>endGame(false),750);
}

function missionComplete(){return !roomMission||roomMission.type==='eliminate'||roomMission.complete;}

function nearestMissionCaptive(){
  if(roomMission?.type!=='rescue'||roomMission.complete)return null;let best=null;
  for(const actor of roomMission.actors){if(actor.released)continue;const d=distance(player,actor);if(d<=175&&(!best||d<best.distance))best={actor,distance:d};}
  return best;
}

function useMissionInteraction(){
  const nearby=nearestMissionCaptive();if(!nearby)return false;const actor=nearby.actor;actor.released=true;burst(actor.x,actor.y-22,roomMission.color,32,350,6);effects.rings.push({x:actor.x,y:actor.y,radius:16,maxRadius:155,color:roomMission.color,life:.72,maxLife:.72});spawnWord(actor.x,actor.y-82,'SPIRIT FREED!',roomMission.color);playSfx('heal',.24,1.18);if(roomMission.actors.every((item)=>item.released))completeRoomMission();else saveMissionCheckpoint();return true;
}

function damageRoomMissionObjects(shot){
  if(roomMission?.type!=='anchors'||roomMission.complete)return false;
  for(const actor of roomMission.actors){if(actor.broken||distance(shot,actor)>=shot.radius+actor.radius)continue;actor.health-=Math.max(5,shot.damage||weapon.damage);shot.life=0;burst(actor.x,actor.y-18,roomMission.color,18,285,5);effects.rings.push({x:actor.x,y:actor.y,radius:12,maxRadius:78,color:roomMission.color,life:.3,maxLife:.3});if(actor.health<=0){actor.broken=true;camera.shake=Math.max(camera.shake,11);spawnWord(actor.x,actor.y-82,'ANCHOR SHATTERED!',roomMission.color);burst(actor.x,actor.y-10,'#f7f1ff',34,480,7);if(roomMission.actors.every((item)=>item.broken))completeRoomMission();else saveMissionCheckpoint();}return true;}
  return false;
}

function updateRoomMission(dt){
  if(!roomMission||roomMission.failed||encounter.bossActive)return;
  const alive=enemies.filter((enemy)=>!enemy.dead);
  if(roomMission.type==='eliminate'){if(!alive.length)roomMission.complete=true;return;}
  if(roomMission.type==='defend'&&!roomMission.complete){
    const active=alive.filter((enemy)=>enemy.state!=='waiting');if(!alive.length){completeRoomMission();return;}
    if(active.length){
      const ward=roomMission.ward;roomMission.remaining=Math.max(0,roomMission.remaining-dt);ward.grace=Math.max(0,ward.grace-dt);
      const attackers=active.filter((enemy)=>distance(enemy,ward)<ward.radius+250).sort((a,b)=>distance(a,ward)-distance(b,ward)).slice(0,8);
      let pressure=0;for(const enemy of attackers)pressure+=(enemy.def.contactDamage||8)*enemy.damageScale*.022;
      if(pressure>0&&ward.grace<=0){ward.calmTime=0;const appliedPressure=cappedWardPressure(pressure,ward.maxHealth,roomMission.duration);ward.health=Math.max(0,ward.health-appliedPressure*dt);roomMission.damageFlash=.13;}
      else if(ward.grace<=0){ward.calmTime+=dt;if(ward.calmTime>1.25)ward.health=Math.min(ward.maxHealth,ward.health+ward.maxHealth*.01*dt);}
      if(ward.health<=0){failRoomMission();return;}if(roomMission.remaining<=0)completeRoomMission();
    }
    roomMission.damageFlash=Math.max(0,(roomMission.damageFlash||0)-dt);missionCheckpointClock+=dt;if(missionCheckpointClock>=2){missionCheckpointClock=0;saveMissionCheckpoint();}
  }
}

function missionObjectiveText(activeCount,incomingCount){
  if(!roomMission)return '';
  if(roomMission.type==='anchors'){const done=roomMission.actors.filter((actor)=>actor.broken).length;return `${roomMission.title}  ${done} / ${roomMission.actors.length}`;}
  if(roomMission.type==='rescue'){const done=roomMission.actors.filter((actor)=>actor.released).length;const near=nearestMissionCaptive();return near?`PRESS E  FREE THE SPIRIT  ${done} / ${roomMission.actors.length}`:`${roomMission.title}  ${done} / ${roomMission.actors.length}`;}
  if(roomMission.type==='defend')return `${roomMission.title}  ${Math.ceil(roomMission.remaining)}s  WARD ${Math.ceil(roomMission.ward.health)} / ${roomMission.ward.maxHealth}`;
  return activeCount===0?'BRACE  SPIRITS APPROACH':incomingCount>0?`${activeCount} ACTIVE  ${incomingCount} INCOMING`:`${roomMission.title}  ${activeCount} LEFT`;
}

function damageDestructibles(shot){
  for(const prop of destructibles){if(prop.broken||distance(shot,prop)>=shot.radius+prop.radius)continue;prop.health-=Math.max(5,shot.damage||weapon.damage);shot.life=0;burst(prop.x,prop.y,prop.kind==='crate'?'#ffad36':'#45eaff',12,240,4);effects.rings.push({x:prop.x,y:prop.y,radius:6,maxRadius:52,color:prop.kind==='crate'?'#ffad36':'#45eaff',life:.25,maxLife:.25});if(prop.health<=0)breakDestructible(prop);break;}
}

function breakDestructible(prop){
  if(prop.broken)return;prop.broken=true;const gold=prop.kind==='crate'?12:7;player.gold+=gold;gainXp(prop.kind==='crate'?4:2);spawnWord(prop.x,prop.y-48,`+${gold} GOLD`,'#ffd13a');burst(prop.x,prop.y,'#15101e',22,340,7);for(let i=0;i<5;i++){const angle=Math.random()*Math.PI*2;effects.shards.push({x:prop.x,y:prop.y-8,vx:Math.cos(angle)*150,vy:Math.sin(angle)*150,color:i%2?'#ffd13a':'#45eaff',life:2.4,maxLife:2.4,delay:.15+i*.035,size:4});}encounter.modifiers={...(encounter.modifiers||{}),brokenProps:destructibles.filter((item)=>item.broken).map((item)=>item.id)};saveRunCheckpoint({kind:'wave',wave:encounter.wave,modifiers:encounter.modifiers});playSfx(prop.kind==='crate'?'heavyImpact':'impact',.2,prop.kind==='crate'?.82:1.05);updateHud();
}

function nearestRoomInteractable(){if(!roomInteractable||roomInteractable.used)return null;const d=distance(player,roomInteractable);return d<=190?{item:roomInteractable,distance:d}:null;}

function useRoomInteractable(){
  const nearby=nearestRoomInteractable();if(!nearby)return false;const item=nearby.item;item.used=true;
  if(item.type==='heal'){player.health=Math.min(player.maxHealth,player.health+50);spawnWord(item.x,item.y-90,'RESTORED!','#65ef55');}
  else if(item.type==='treasure')grantRelic();
  else if(item.type==='shrine'){pendingLevelUps++;openLevelUp();}
  effects.rings.push({x:item.x,y:item.y,radius:22,maxRadius:190,color:item.color,life:.8,maxLife:.8});burst(item.x,item.y-18,item.color,32,370,6);encounter.modifiers={...(encounter.modifiers||{}),interactableUsed:true};saveRunCheckpoint({kind:'wave',wave:encounter.wave,modifiers:encounter.modifiers});playSfx('upgrade',.23,1.02);updateHud();return true;
}

function openShop(){
  state='shop';shopScreen.classList.add('active');renderShop();
}

function renderShop(){
  ui.shopGold.textContent=` ${player.gold}`;
  const items=SHOP_ITEMS.filter((item)=>item.available()).slice(0,4);
  shopGrid.innerHTML=items.map((item,index)=>`<button class="shop-item" style="--item:${item.color}" data-shop-index="${index}" ${player.gold<item.price?'disabled':''}><span class="choice-art item-icon" data-choice-art="${shopArtFrame(item.id)}" aria-hidden="true"></span><strong>${item.name}</strong><p>${item.description}</p><b> ${item.price}</b></button>`).join('');
  for(const button of shopGrid.querySelectorAll('.shop-item'))button.addEventListener('click',()=>buyShopItem(items[Number(button.dataset.shopIndex)]));
}

function buyShopItem(item){
  if(state!=='shop'||!item||player.gold<item.price||!item.available())return;player.gold-=item.price;item.apply();resolveSynergies();player.shopPurchases.add(item.id);playSfx('upgrade',.18,1.22);burst(player.x,player.y-30,item.color,18,230,4);renderShop();updateHud();
}

function leaveShop(){shopScreen.classList.remove('active');startWave(pendingRouteWave,{nodeType:'shop'});}

function gainXp(amount) {
  player.xp += amount;
  if (player.xp < player.xpToNext) return;
  player.xp -= player.xpToNext;
  player.level++;
  player.xpToNext = Math.round(player.xpToNext * 1.48 + 5);
  pendingLevelUps++;
  if (state === 'playing') openLevelUp();
}

function openLevelUp() {
  const boundId=boundArsenalForHero(),bound=ARSENAL_BLUEPRINTS.find((entry)=>entry.id===boundId);
  if(bound&&player.level>=bound.tier&&((bound.tier===3&&!player.arsenalAwakened)||(bound.tier===7&&player.arsenalAwakened&&!player.legendArsenalAwakened))){equipWeapon(bound.id,{announce:true});spawnWord(player.x,player.y-142,'FORGE CONTRACT FULFILLED!',bound.color);}
  const available = UPGRADES.filter((upgrade) => upgrade.available());
  if (!available.length) {if(encounter.startWaveAfterUpgrade!==null){const nextWave=encounter.startWaveAfterUpgrade;encounter.startWaveAfterUpgrade=null;startWave(nextWave);}return;}
  pendingLevelUps = Math.max(0, pendingLevelUps - 1);
  state = 'levelup';
  rollUpgradeChoices(available);
  renderUpgradeChoices();
  levelupScreen.classList.add('active');
  playSfx('upgrade',.25,1.06);
  updateHud();
}

function rarityForUpgrade(upgrade){return UPGRADE_RARITIES[upgrade.id]||'common';}

function upgradeOfferClass(upgrade){
  if(upgrade.type==='ARSENAL AWAKENING')return 'CHOOSE ONE WEAPON';
  if(upgrade.type==='LEVEL 5 FIGHTING STYLE')return 'CHOOSE ONE PATH';
  if(upgrade.type==='LEVEL 10 PATH MASTERY')return 'PATH MASTERY';
  if(upgrade.id.startsWith('unlock'))return 'NEW ABILITY';
  if(['abyssalMaw','nineTailInferno','guardianBloom','heavensVerdict'].includes(upgrade.id))return 'ABILITY EVOLUTION';
  if(['phaseNova','siegeLotus','moonConstellation','deadeyeCircuit','thunderheadArray','skyfeatherConstellation'].includes(upgrade.id))return 'WEAPON CAPSTONE';
  if(upgrade.id==='dualWield')return 'NEW WEAPON MODE';
  const rank=player.upgradeRanks[upgrade.id];return Number.isFinite(rank)?`RANK ${rank+1}`:'BUILD PIVOT';
}

function upgradeComparison(upgrade){
  const percent=(value)=>`${Math.round(value*100)}%`,ability=(id,multiplier)=>`${percent(player.abilityPower[id])}  →  ${percent(player.abilityPower[id]*multiplier)}`;
  const comparisons={
    equipFrostbiteNeedle:()=> '3 HITS = FREEZE',equipOniMortar:()=> '205 AREA BLAST',equipGaleWarFan:()=> 'OUT + RETURN',
    equipEmbercoilRepeater:()=> '3 SHOTS / 4th RUPTURES',equipTempestChakram:()=> 'WIDE OUT + RETURN',equipMoonpiercerRailbow:()=> 'CHARGE / 8 PIERCES',
    unlockUndertow:()=> 'LOCKED  →  READY ON E',unlockFoxfire:()=> 'LOCKED  →  READY ON C',unlockHeart:()=> 'LOCKED  →  READY ON F',unlockShock:()=> 'LOCKED  →  READY ON Q',
    dualWield:()=> '1 VOLLEY  →  2 VOLLEYS',spiritRounds:()=>`${percent(player.damageMultiplier)}  →  ${percent(player.damageMultiplier*1.22)}`,quickPaws:()=>`${percent(1/player.fireRateMultiplier)}  →  ${percent(1/(player.fireRateMultiplier*.85))}`,
    vitality:()=>`${player.maxHealth} HP  →  ${player.maxHealth+20} HP`,undertow:()=>ability('undertowWell',1.18),hungryFlame:()=>ability('foxfireVolley',1.25),heartBloom:()=>`+${player.heartBonus} HEAL  →  +${player.heartBonus+15} HEAL`,stormHeart:()=>`${percent(player.abilityPower.shockPaws)}  →  ${percent(player.abilityPower.shockPaws*1.2)}`,
    wardbreaker:()=>`${percent(player.shieldDamageMultiplier)}  →  ${percent(player.shieldDamageMultiplier*1.35)}`,spiritHunter:()=>`${percent(player.eliteDamageMultiplier)}  →  ${percent(player.eliteDamageMultiplier*1.18)}`,spiritCatalyst:()=>`${percent(player.statusDurationMultiplier)} STATUS  →  ${percent(player.statusDurationMultiplier*1.2)}`,
    pressureChamber:()=>`+${player.bonusProjectiles} SHOTS  →  +${player.bonusProjectiles+1}`,headhunter:()=>`+${player.eliteKillHeal} ELITE HEAL  →  +${player.eliteKillHeal+6}`,keenEye:()=>`${percent(weapon.criticalChance+player.critBonus)}  →  ${percent(weapon.criticalChance+player.critBonus+.05)}`,
    moonPiercer:()=>`+${player.bonusPierces} PIERCE  →  +${player.bonusPierces+1}`,perfectDraw:()=>`${percent(weapon.criticalChance+player.critBonus)}  →  ${percent(weapon.criticalChance+player.critBonus+.08)}`,glassFang:()=>`${percent(player.damageMultiplier)}  →  ${percent(player.damageMultiplier*1.28)}`,
    spiritMomentum:()=>`${percent(player.speedMultiplier)} SPEED  →  ${percent(player.speedMultiplier*1.1)}`,guardianHunter:()=>`${percent(player.guardianDamageMultiplier)}  →  ${percent(player.guardianDamageMultiplier*1.22)}`,deepReserves:()=>`${player.gold} GOLD  →  ${player.gold+35} GOLD`,
    bankShot:()=>`+${player.bonusRicochets} BANKS  →  +${player.bonusRicochets+1}`,loadedDice:()=>`${percent(weapon.criticalChance+player.critBonus)}  →  ${percent(weapon.criticalChance+player.critBonus+.07)}`,quickdraw:()=>`${percent(1/player.fireRateMultiplier)}  →  ${percent(1/(player.fireRateMultiplier*.87))}`,
    spiritCylinder:()=>`${percent(player.damageMultiplier)} POWER  →  ${percent(player.damageMultiplier*1.09)}`,phaseRounds:()=>`+${player.bonusPierces} PIERCE  →  +${player.bonusPierces+1}`,foxstepMastery:()=>`${percent(player.speedMultiplier)} SPEED  →  ${percent(player.speedMultiplier*1.08)}`,
    ironBelly:()=>`${percent(player.braceDamageMultiplier)} BRACED  →  ${percent(Math.max(.52,player.braceDamageMultiplier-.07))}`,scatterBore:()=>`+${player.bonusProjectiles} PELLETS  →  +${player.bonusProjectiles+1}`,guardianHide:()=>`${player.maxHealth} HP  →  ${player.maxHealth+28} HP`,
    capacitorBank:()=>`${percent(player.arcChainPower)} CHAIN  →  ${percent(player.arcChainPower*1.18)} CHAIN`,chainLogic:()=>`${2+player.arcChainBonus} TARGETS  →  ${3+player.arcChainBonus} TARGETS`,rapidCycle:()=>`${percent(1/player.fireRateMultiplier)} RATE  →  ${percent(1/(player.fireRateMultiplier*.87))} RATE`,
    razorFang:()=>`${player.bleedOnHit?`${player.bleedOnHit.toFixed(1)}s`:'NO BLEED'}  →  ${(3.5+(player.upgradeRanks.razorFang+1)*.75).toFixed(1)}s BLEED`,hollowHex:()=>`${player.curseOnCrit?'HEX ACTIVE':'NO HEX'}  →  ${percent((1.18+(player.upgradeRanks.hollowHex+1)*.08)*player.cursePowerMultiplier)} NEXT HIT`,spiritAegis:()=>`${player.maxSpiritShield} WARD  →  ${player.maxSpiritShield+30} WARD`,
    cinderDrum:()=>`${percent(1+player.upgradeRanks.cinderDrum*.22)} BURN  →  ${percent(1+(player.upgradeRanks.cinderDrum+1)*.22)} BURN`,ruptureMagazine:()=>`${155+player.upgradeRanks.ruptureMagazine*22} AREA  →  ${177+player.upgradeRanks.ruptureMagazine*22} AREA`,cycloneEdge:()=>`${percent(1+player.upgradeRanks.cycloneEdge*.15)} EDGE  →  ${percent(1+(player.upgradeRanks.cycloneEdge+1)*.15)} EDGE`,crosswindRecall:()=>`${percent(1+player.upgradeRanks.crosswindRecall*.16)} RETURN  →  ${percent(1+(player.upgradeRanks.crosswindRecall+1)*.16)} RETURN`,lunarCapacitor:()=>`${percent(1+player.upgradeRanks.lunarCapacitor*.19)} POWER  →  ${percent(1+(player.upgradeRanks.lunarCapacitor+1)*.19)} POWER`,horizonBore:()=>`${7+player.upgradeRanks.horizonBore*2} PIERCE  →  ${9+player.upgradeRanks.horizonBore*2} PIERCE`
  };
  if(upgrade.id==='pathGunner')return 'BASE SHOTS  →  PIERCING SHOTS';
  if(upgrade.id==='pathElementalist')return 'BASE STATUS  →  120% DURATION';
  if(upgrade.id==='pathVanguard')return `${player.maxHealth} HP  →  ${player.maxHealth+35} HP`;
  if(upgrade.id==='masterGunner')return '5th VOLLEY  →  2 SEEKERS';
  if(upgrade.id==='masterElementalist')return '2 ELEMENTS  →  PACK RUPTURE';
  if(upgrade.id==='masterVanguard')return 'FULL SPRINT  →  CRUSHING VOLLEY';
  if(comparisons[upgrade.id])return comparisons[upgrade.id]();
  if(upgrade.id==='moonEdge')return `${percent(player.glaiveReturnPower)} RETURN POWER`;
  if(upgrade.id==='secondPassage')return `${percent(player.glaiveReturnSpeed)} RETURN SPEED`;
  if(upgrade.id==='cranePoise')return `${percent(player.speedMultiplier)} MOVE SPEED`;
  if(['phaseNova','siegeLotus','moonConstellation','deadeyeCircuit','thunderheadArray'].includes(upgrade.id))return `BASE WEAPON  →  ${upgrade.name.toUpperCase()}`;
  if(['abyssalMaw','nineTailInferno','guardianBloom','heavensVerdict'].includes(upgrade.id))return `BASE TECHNIQUE  →  ${upgrade.name.toUpperCase()}`;
  return upgrade.detail.toUpperCase();
}

function upgradeSynergyPreview(upgrade){
  if(upgrade.id==='unlockFoxfire'&&player.unlockedAbilities.has('undertowWell'))return 'UNLOCKS  STEAM BURST';
  if(upgrade.id==='unlockShock'&&player.unlockedAbilities.has('undertowWell'))return 'UNLOCKS  STORM CURRENT';
  if(upgrade.id==='unlockShock'&&player.unlockedAbilities.has('wildHeart'))return 'UNLOCKS  GUARDIAN TEMPEST';
  if(upgrade.id==='dualWield'&&player.unlockedAbilities.has('foxfireVolley'))return 'UNLOCKS  TWIN CINDERS';
  return '';
}

function weightedUpgradeIndex(pool){
  const weights=pool.map((upgrade)=>{const rarity=rarityForUpgrade(upgrade);const base=RARITY_STYLES[rarity].weight;if(rarity==='rare')return base+player.level*1.8;if(rarity==='epic')return base+Math.max(0,player.level-2)*1.6;return Math.max(24,base-player.level*1.4);});
  let roll=Math.random()*weights.reduce((sum,value)=>sum+value,0);for(let i=0;i<weights.length;i++){roll-=weights[i];if(roll<=0)return i;}return weights.length-1;
}

function rollUpgradeChoices(available=UPGRADES.filter((upgrade)=>upgrade.available())){
  const pool=[...available];currentUpgradeChoices=[];
  const bound=ARSENAL_BLUEPRINTS.find((entry)=>entry.id===boundArsenalForHero());
  const arsenal=pool.filter((upgrade)=>upgrade.type==='ARSENAL AWAKENING');if(arsenal.length&&bound?.tier!==3){currentUpgradeChoices=arsenal;return;}
  const legendArsenal=pool.filter((upgrade)=>upgrade.type==='LEGEND ARSENAL');if(legendArsenal.length&&bound?.tier!==7){currentUpgradeChoices=legendArsenal;return;}
  for(let index=pool.length-1;index>=0;index--)if(['ARSENAL AWAKENING','LEGEND ARSENAL'].includes(pool[index].type))pool.splice(index,1);
  const paths=pool.filter((upgrade)=>upgrade.type==='LEVEL 5 FIGHTING STYLE');if(paths.length){currentUpgradeChoices=paths;return;}
  const mastery=pool.filter((upgrade)=>upgrade.type==='LEVEL 10 PATH MASTERY');if(mastery.length){currentUpgradeChoices=mastery;return;}
  const earnedUnlock=pool.find((upgrade)=>upgrade.id==='unlockShock')||pool.find((upgrade)=>upgrade.id==='unlockHeart')||pool.find((upgrade)=>upgrade.id==='unlockFoxfire')||pool.find((upgrade)=>upgrade.id==='unlockUndertow');
  if(earnedUnlock){currentUpgradeChoices.push(earnedUnlock);pool.splice(pool.indexOf(earnedUnlock),1);}
  while(currentUpgradeChoices.length<Math.min(3,available.length)){const index=weightedUpgradeIndex(pool);currentUpgradeChoices.push(pool.splice(index,1)[0]);}
}

function renderUpgradeChoices(){
  const awakened=player.unlockedAbilities.size,arsenalDraft=currentUpgradeChoices.every((upgrade)=>upgrade.type==='ARSENAL AWAKENING'),legendDraft=currentUpgradeChoices.every((upgrade)=>upgrade.type==='LEGEND ARSENAL');ui.levelupSubtitle.textContent=arsenalDraft?'LEVEL 3  ARSENAL AWAKENING  ·  CHOOSE YOUR RUN WEAPON':legendDraft?'LEVEL 7  LEGEND ARSENAL  ·  EVOLVE YOUR RUN WEAPON':`LEVEL ${player.level} BUILD  ·  ${awakened} / ${Object.keys(ABILITIES).length} ABILITIES AWAKENED`;
  const pathDraft=currentUpgradeChoices.every((upgrade)=>upgrade.type==='LEVEL 5 FIGHTING STYLE'),masteryDraft=currentUpgradeChoices.every((upgrade)=>upgrade.type==='LEVEL 10 PATH MASTERY');levelupScreen.classList.toggle('mastery-draft',masteryDraft);if(pathDraft)ui.levelupSubtitle.textContent='LEVEL 5  CHOOSE YOUR FIGHTING STYLE';else if(masteryDraft)ui.levelupSubtitle.textContent=`LEVEL 10  MASTER ${player.buildPath.toUpperCase()}`;
  upgradeGrid.innerHTML = currentUpgradeChoices.map((upgrade, index) => `
    <button class="upgrade-card" title="${upgrade.description}" aria-label="${upgrade.name}. ${upgrade.detail}" data-rarity="${rarityForUpgrade(upgrade)}" style="--card-color:${upgrade.color};--rarity:${RARITY_STYLES[rarityForUpgrade(upgrade)].color}" data-upgrade-index="${index}">
      <span class="upgrade-card-top"><b class="choice-number">${index + 1}</b><i class="upgrade-rarity">${RARITY_STYLES[rarityForUpgrade(upgrade)].name}</i></span>
      <span class="upgrade-icon ${upgrade.type==='ARSENAL AWAKENING'?'arsenal-icon':upgrade.type==='LEGEND ARSENAL'?'legend-arsenal-icon':''}" data-arsenal="${upgrade.id}" data-icon="${upgradeIconFrame(upgrade)}"></span>
      <strong>${upgrade.name}</strong>
      <span class="upgrade-type">${upgradeOfferClass(upgrade)}</span>
      <span class="upgrade-comparison">${upgradeComparison(upgrade)}</span>
      ${upgradeSynergyPreview(upgrade)?`<span class="upgrade-synergy">${upgradeSynergyPreview(upgrade)}</span>`:''}
    </button>`).join('');
  for (const button of upgradeGrid.querySelectorAll('.upgrade-card')) {
    button.addEventListener('click', () => chooseUpgrade(Number(button.dataset.upgradeIndex)));
  }
  const cost=30+player.paidRerolls*15;ui.rerollCost.textContent=player.rerolls>0?`FREE  ${player.rerolls} LEFT`:` ${cost} GOLD`;
  if(pathDraft||masteryDraft){ui.rerollButton.disabled=true;document.querySelector('#skip-upgrade').disabled=true;levelupScreen.classList.add('arsenal-draft');document.querySelector('.levelup-hint').textContent=pathDraft?'PRESS 1, 2, OR 3 TO COMMIT YOUR BUILD':'PRESS 1 TO MASTER YOUR PATH';return;}
  ui.rerollButton.disabled=arsenalDraft||legendDraft||(player.rerolls<=0&&player.gold<cost);document.querySelector('#skip-upgrade').disabled=arsenalDraft||legendDraft;levelupScreen.classList.toggle('arsenal-draft',arsenalDraft||legendDraft);document.querySelector('.levelup-hint').textContent=arsenalDraft||legendDraft?'PRESS 1, 2, OR 3 TO CHOOSE YOUR WEAPON':'PRESS 1, 2, OR 3 TO CHOOSE · R TO REROLL';
}

function upgradeIconFrame(upgrade){
  if(upgrade.id==='pathGunner'||upgrade.id==='masterGunner')return 11;if(upgrade.id==='pathElementalist'||upgrade.id==='masterElementalist')return 3;if(upgrade.id==='pathVanguard'||upgrade.id==='masterVanguard')return 6;
  if(upgrade.id==='unlockUndertow'||upgrade.type.includes('UNDERTOW'))return 0;if(upgrade.id==='unlockFoxfire'||upgrade.type.includes('FOXFIRE'))return 1;if(upgrade.id==='unlockHeart'||upgrade.type.includes('HEART'))return 2;if(upgrade.id==='unlockShock'||upgrade.type.includes('ULTIMATE'))return 3;
  if(upgrade.id==='dualWield')return 4;if(['spiritRounds','quickPaws','quickdraw','spiritCylinder','rapidCycle','capacitorBank'].includes(upgrade.id))return 5;if(['wardbreaker','ironBelly','guardianHide','vitality','glassFang','spiritAegis'].includes(upgrade.id))return 6;if(['keenEye','perfectDraw','loadedDice','spiritHunter'].includes(upgrade.id))return 7;
  if(['guardianHunter','headhunter'].includes(upgrade.id)||upgrade.type.includes('CAPSTONE')||upgrade.type.includes('EVOLUTION'))return 8;if(['spiritMomentum','foxstepMastery'].includes(upgrade.id))return 9;if(upgrade.id==='deepReserves')return 10;if(['moonPiercer','phaseRounds'].includes(upgrade.id))return 11;if(['bankShot','deadeyeCircuit','chainLogic','thunderheadArray'].includes(upgrade.id))return 12;if(['perfectDraw','moonConstellation'].includes(upgrade.id))return 13;if(['pressureChamber','scatterBore','siegeLotus'].includes(upgrade.id))return 14;if(upgrade.id==='razorFang')return 7;if(upgrade.id==='hollowHex')return 3;return 15;
}

function rerollUpgrades(){
  if(state!=='levelup'||currentUpgradeChoices.every((upgrade)=>['ARSENAL AWAKENING','LEVEL 5 FIGHTING STYLE','LEVEL 10 PATH MASTERY'].includes(upgrade.type)))return;const cost=30+player.paidRerolls*15;
  if(player.rerolls>0)player.rerolls--;else if(player.gold>=cost){player.gold-=cost;player.paidRerolls++;}else return;
  rollUpgradeChoices();renderUpgradeChoices();spawnWord(player.x,player.y-90,'FATE REROLLED!','#45eaff');playSfx('upgrade',.2,.9);updateHud();
}

function finishLevelUpFlow(){
  levelupScreen.classList.remove('active','arsenal-draft','mastery-draft');state='playing';updateHud();
  if(encounter.startWaveAfterUpgrade!==null){const nextWave=encounter.startWaveAfterUpgrade;encounter.startWaveAfterUpgrade=null;startWave(nextWave);return;}
  if(pendingLevelUps>0)setTimeout(openLevelUp,180);
}

function skipUpgrade(){
  if(state!=='levelup'||currentUpgradeChoices.every((upgrade)=>['ARSENAL AWAKENING','LEVEL 5 FIGHTING STYLE','LEVEL 10 PATH MASTERY'].includes(upgrade.type)))return;player.gold+=20;player.health=Math.min(player.maxHealth,player.health+18);spawnWord(player.x,player.y-92,'POWER BANKED!','#ffd13a');effects.rings.push({x:player.x,y:player.y,radius:15,maxRadius:105,color:'#ffd13a',life:.5,maxLife:.5});playSfx('heal',.2,1.22);finishLevelUpFlow();
}

function chooseUpgrade(index) {
  if (state !== 'levelup') return;
  const upgrade = currentUpgradeChoices[index];
  if (!upgrade) return;
  upgrade.apply();
  resolveSynergies();
  spawnWord(player.x, player.y - 92, `${upgrade.name.toUpperCase()}!`, upgrade.color);
  effects.rings.push({ x:player.x, y:player.y, radius:18, maxRadius:150, color:upgrade.color, life:.62, maxLife:.62 });
  burst(player.x, player.y - 18, upgrade.color, 24, 260, 4);
  playSfx('upgrade',.32,1.18);
  finishLevelUpFlow();
}

function resolveSynergies(){
  for(const synergy of SYNERGIES){
    if(player.synergies.has(synergy.id)||!synergy.requires())continue;
    player.synergies.add(synergy.id);spawnWord(player.x,player.y-125,`${synergy.name}!`,synergy.color);effects.rings.push({x:player.x,y:player.y,radius:22,maxRadius:205,color:synergy.color,life:.9,maxLife:.9});burst(player.x,player.y-15,synergy.color,38,390,6);playSfx('upgrade',.35,.84);
  }
  refreshSynergyHud();
}

function refreshSynergyHud(){
  const active=SYNERGIES.filter((synergy)=>player.synergies.has(synergy.id));const capstones={phaseNova:{name:'PHASE NOVA',color:'#d94cff'},siegeLotus:{name:'SIEGE LOTUS',color:'#ffd13a'},moonConstellation:{name:'MOON CONSTELLATION',color:'#ff5fbd'},deadeyeCircuit:{name:'DEADEYE CIRCUIT',color:'#ff9b32'},thunderheadArray:{name:'THUNDERHEAD ARRAY',color:'#39eaff'},skyfeatherConstellation:{name:'SKYFEATHER CONSTELLATION',color:'#d98cff'}};const capstone=capstones[player.weaponEvolution];
  const key=`${active.map((synergy)=>synergy.id).join('|')}|${player.weaponEvolution||''}`;if(ui.synergyStrip.dataset.key===key)return;ui.synergyStrip.dataset.key=key;
  ui.synergyStrip.innerHTML=`${capstone?`<span class="synergy-badge capstone" style="--synergy:${capstone.color}" title="Hero weapon capstone active">${capstone.name}</span>`:''}${active.map((synergy)=>`<span class="synergy-badge" style="--synergy:${synergy.color}" title="${synergy.description}">${synergy.name}</span>`).join('')}`;
}

function begin() {
  ensureAudio();
  input.attack = false; input.attackHeld = false; input.keys.clear();
  resetGame();
  runActive=false;
  startScreen.classList.remove('active');
  resultScreen.classList.remove('active');
  hud.classList.remove('hidden');
  const directDebug=debugBoss||debugRoute>0||debugParams.has('chapter')||Boolean(debugSystem);
  if(!directDebug){enterHub();return;}
  state = 'story';
  if(debugChapter>0){
    setChapter(debugChapter);player.x=room.playerSpawn.x;player.y=room.playerSpawn.y;camera.x=player.x;camera.y=player.y;
    player.maxHealth=600;player.health=600;player.damageMultiplier=3.5;player.level=8;player.gold=180;player.dualWield=true;
    Object.keys(ABILITIES).forEach((id)=>player.unlockedAbilities.add(id));
    resolveSynergies();updateHud();
  }
  if(debugSystem==='levelup'){player.level=Number(debugParams.get('level')||2);if(player.level>3)player.arsenalAwakened=true;pendingLevelUps=1;encounter.startWaveAfterUpgrade=0;openLevelUp();return;}
  if(debugSystem==='statusDraft'){player.level=7;player.arsenalAwakened=true;player.buildPath='elementalist';currentUpgradeChoices=['razorFang','hollowHex','spiritAegis'].map((id)=>UPGRADES.find((upgrade)=>upgrade.id===id));state='levelup';renderUpgradeChoices();levelupScreen.classList.add('active');updateHud();return;}
  if(debugSystem==='path'){player.level=5;player.arsenalAwakened=true;pendingLevelUps=1;encounter.startWaveAfterUpgrade=0;openLevelUp();return;}
  if(debugSystem==='mastery'){player.level=10;player.arsenalAwakened=true;player.buildPath=['gunner','elementalist','vanguard'].includes(debugParams.get('path'))?debugParams.get('path'):'gunner';pendingLevelUps=1;encounter.startWaveAfterUpgrade=0;openLevelUp();return;}
  if(debugSystem==='arsenal'){player.level=3;pendingLevelUps=1;encounter.startWaveAfterUpgrade=0;openLevelUp();return;}
  if(debugSystem==='legendArsenal'){player.level=7;player.arsenalAwakened=true;pendingLevelUps=1;encounter.startWaveAfterUpgrade=0;openLevelUp();return;}
  if(debugSystem==='legendCombat'){player.level=8;player.maxHealth=700;player.health=700;player.damageMultiplier=1.55;player.arsenalAwakened=true;equipWeapon(['embercoilRepeater','tempestChakram','moonpiercerRailbow'].includes(debugParams.get('weapon'))?debugParams.get('weapon'):'embercoilRepeater');startWave(3);return;}
  if(debugSystem==='boundArsenal'){const requested=ARSENAL_BLUEPRINTS.find((entry)=>entry.id===debugParams.get('weapon'))||ARSENAL_BLUEPRINTS[0];profile.collectedWeapons=[...new Set([...profile.collectedWeapons,requested.id])];profile.boundArsenal={...profile.boundArsenal,[selectedHeroId]:requested.id};player.level=requested.tier;if(requested.tier===7){equipWeapon('frostbiteNeedle');player.buildPath='gunner';}pendingLevelUps=1;encounter.startWaveAfterUpgrade=0;openLevelUp();return;}
  if(debugSystem==='forgeCollection'){profile.collectedWeapons=ARSENAL_BLUEPRINTS.map((entry)=>entry.id);profile.boundArsenal={...profile.boundArsenal,[selectedHeroId]:debugParams.get('weapon')||'frostbiteNeedle'};enterHub();openHubStation(HUB_STATIONS.find((station)=>station.id==='forge'));return;}
  if(debugSystem==='contracts'){if(debugParams.has('restore')){profile.spiritShards=764;profile.contractProgress={...DEFAULT_CONTRACT_PROGRESS};profile.claimedContracts=[];saveProfile();}if(debugParams.has('ready'))for(const contract of CAMPAIGN_CONTRACTS)profile.contractProgress[contract.id]=contract.target;enterHub();openHubStation(HUB_STATIONS.find((station)=>station.id==='missionBoard'));return;}
  if(debugSystem==='story'){const storyBeat=['intro','interlude2','interlude4','boss'].includes(debugParams.get('beat'))?debugParams.get('beat'):'interlude2';showStory(storyBeat);return;}
  if(debugSystem==='tutorial'){startWave(0);showTutorialLesson(clamp(Number(debugParams.get('step')||1)-1,0,TUTORIAL_LESSONS.length-1));return;}
  if(debugSystem==='dojo'){enterDojo();return;}
  if(debugSystem==='crossfire'){
    player.maxHealth=600;player.health=600;spawnBoss();const boss=enemies[0];const profile=BOSS_PROFILES[boss.def.id];boss.bossPhase=3;boss.health=boss.maxHealth*.3;boss.state='bossWindupCrossfire';boss.patternWindup=guardianAttackTiming({baseWindup:BOSS_PATTERNS.crossfire.windup,tempo:profile.phaseTempo[3],phase:3,difficultyId:selectedDifficulty}).windup;boss.stateTime=boss.patternWindup;boss.activePattern='crossfire';boss.patternTargetX=player.x;boss.patternTargetY=player.y;boss.patternAngle=Math.atan2(player.y-boss.y,player.x-boss.x)+.51;ui.bossPhase.textContent=profile.phaseNames[3];return;
  }
  if(debugSystem==='signature'){
    player.maxHealth=1200;player.health=1200;spawnBoss();const boss=enemies[0];const bossProfile=BOSS_PROFILES[boss.def.id];boss.bossPhase=3;boss.health=boss.maxHealth*.3;boss.state='bossWindupSignature';boss.patternWindup=guardianAttackTiming({baseWindup:BOSS_PATTERNS.signature.windup,tempo:bossProfile.phaseTempo[3],phase:3,difficultyId:selectedDifficulty}).windup;boss.stateTime=boss.patternWindup;boss.activePattern='signature';boss.signaturePrepared=false;ui.bossPhase.textContent=bossProfile.phaseNames[3];return;
  }
  if(debugSystem==='elites'){player.maxHealth=320;player.health=320;player.damageMultiplier=1.8;player.unlockedAbilities.add('foxfireVolley');startWave(1,{nodeType:'elite',healthScale:1.08,speedScale:1.04,damageScale:1.04,rewardScale:2});return;}
  if(debugSystem==='mapGate'){
    player.maxHealth=900;player.health=900;startWave(0);setTimeout(()=>{for(const enemy of enemies)enemy.dead=true;beginWaveTransition();const gate=layeredMapRuntime.forwardGate();if(gate){gate.sealed=false;player.x=gate.x+gate.width/2;player.y=gate.y+gate.height/2;camera.x=player.x;camera.y=player.y;}},300);
    return;
  }
  if(debugSystem==='bambooRoute'){setChapter(1);player.maxHealth=1600;player.health=1600;startWave(2,{nodeType:['elite','shrine','event'].includes(debugParams.get('node'))?debugParams.get('node'):'elite'});return;}
  if(debugSystem==='crimsonRoute'){setChapter(2);player.maxHealth=2400;player.health=2400;startWave(3,{nodeType:['elite','shrine','event'].includes(debugParams.get('node'))?debugParams.get('node'):'elite'});return;}
  if(debugSystem==='stormRoute'){setChapter(3);player.maxHealth=3200;player.health=3200;startWave(4,{nodeType:['elite','shrine','event'].includes(debugParams.get('node'))?debugParams.get('node'):'elite'});return;}
  if(debugSystem==='neonRoute'){setChapter(4);player.maxHealth=4200;player.health=4200;startWave(4,{nodeType:['elite','shrine','event'].includes(debugParams.get('node'))?debugParams.get('node'):'elite'});return;}
  if(debugSystem==='shadowRoute'){setChapter(5);player.maxHealth=12000;player.health=12000;startWave(4,{nodeType:['elite','shrine','event'].includes(debugParams.get('node'))?debugParams.get('node'):'elite'});return;}
  if(debugSystem==='specialists'){startSpecialistShowcase();return;}
  if(debugSystem==='statuses'){startStatusShowcase();return;}
  if(debugSystem==='capstone'){player.level=10;player.maxHealth=1200;player.health=1200;player.damageMultiplier=2.4;player.weaponEvolution=selectedHeroId==='kitsune'?'phaseNova':selectedHeroId==='bamboo'?'siegeLotus':selectedHeroId==='hopscotch'?'moonConstellation':selectedHeroId==='rusty'?'deadeyeCircuit':selectedHeroId==='nomi'?'skyfeatherConstellation':'thunderheadArray';player.bonusPierces=selectedHeroId==='hopscotch'?2:player.bonusPierces;player.bonusRicochets=selectedHeroId==='rusty'?2:player.bonusRicochets;player.arcChainBonus=selectedHeroId==='zap'?3:player.arcChainBonus;refreshSynergyHud();startWave(4);return;}
  if(debugSystem==='opening'){startWave(0);return;}
  if(debugSystem==='room6'){player.level=10;player.maxHealth=50000;player.health=50000;startWave(5);return;}
  if(debugSystem==='pressure'){player.maxHealth=chapter.id==='shadowChapter'?12000:900;player.health=player.maxHealth;player.unlockedAbilities.add('undertowWell');startWave(Math.min(4,chapter.waves.length-1));encounter.biomePressureClock=.35;return;}
  if(debugSystem==='evolutions'){player.level=12;player.maxHealth=1200;player.health=1200;player.damageMultiplier=1.35;for(const id of Object.keys(ABILITIES))player.unlockedAbilities.add(id);for(const id of Object.keys(player.abilityEvolutions))player.abilityEvolutions[id]=true;player.stormBonus=1;refreshSynergyHud();startWave(Math.min(4,chapter.waves.length-1));return;}
  if(debugSystem==='mission'){const type=['anchors','rescue','defend'].includes(debugMission)?debugMission:'anchors';const missionWave=chapter.waves.findIndex((wave)=>wave.mission?.type===type);player.maxHealth=900;player.health=900;player.damageMultiplier=type==='anchors'?4:1.6;startWave(Math.max(0,missionWave));if(roomMission?.actors?.[0]){roomMission.actors[0].x=player.x+125;roomMission.actors[0].y=player.y;}if(roomMission?.ward){roomMission.ward.x=player.x+90;roomMission.ward.y=player.y+40;}return;}
  if(debugSystem==='guardianReward'){openGuardianReward(chapter.boss);return;}
  if(debugSystem==='relicDraft'){player.level=6;player.buildPath=['gunner','elementalist','vanguard'].includes(debugParams.get('path'))?debugParams.get('path'):'elementalist';player.unlockedAbilities.add('undertowWell');player.unlockedAbilities.add('foxfireVolley');player.bleedOnHit=4;openRelicDraft({source:'MOON VAULT DISCOVERED'});return;}
  if(debugSystem==='codex'){openCodex('enemies');return;}
  if(debugSystem==='event'||debugSystem==='secret'){player.gold=80;pendingRouteWave=1;openRouteEvent(debugSystem);return;}
  if(debugSystem==='synergy'){player.unlockedAbilities.add('undertowWell');player.unlockedAbilities.add('foxfireVolley');resolveSynergies();startWave(0);return;}
  if(debugRoute>0){encounter.wave=debugRoute-1;player.gold=180;openRoute(Math.min(debugRoute,chapter.waves.length-1));}
  else showStory(debugBoss?'boss':'intro');
}

function completeChapter() {
  clearDelay=-1;
  if(chapterIndex>=CHAPTER_ORDER.length-1){showStory('epilogue');return;}
  setChapter(chapterIndex+1);
  enemies=[];roomMission=null;Object.values(effects).forEach((list)=>list.splice(0));
  player.x=room.playerSpawn.x;player.y=room.playerSpawn.y;player.vx=0;player.vy=0;
  player.health=Math.min(player.maxHealth,player.health+Math.max(35,Math.round(player.maxHealth*.35)));
  player.invulnerable=1.5;camera.x=player.x;camera.y=player.y;camera.shake=0;
  encounter={wave:-1,transitioning:false,transitionTime:0,bossActive:false,bossDefeated:false,storyBeat:'intro',rewardScale:1,nodeType:'combat',startWaveAfterUpgrade:null};
  ui.bossPanel.classList.remove('active');ui.roomState.textContent=chapter.id==='shadowChapter'?'ECLIPSE GATE':chapter.id==='neonChapter'?'CORE GATE':chapter.id==='stormChapter'?'STORM GATE':chapter.id==='crimsonChapter'?'ASH GATE':'MOON GATE';ui.roomState.style.color=chapter.id==='shadowChapter'?'#b84dff':chapter.id==='neonChapter'?'#ff3ab8':chapter.id==='stormChapter'?'#37dfff':chapter.id==='crimsonChapter'?'#ff5b27':'#41f5da';
  showStory('intro');updateHud();
}

function endGame(won) {
  if(state==='won'||state==='lost')return;
  runActive=false;clearRunCheckpoint();const difficulty=activeDifficulty();
  runReward=Math.round(((won?100:Math.max(6,player.level*3))+(won?(player.victoryShardBonus||0):0))*difficulty.rewardScale);
  profile.spiritShards+=runReward;profile.highestLevel=Math.max(profile.highestLevel,player.level);
  const unlockedNames=[];
  if(won){
    profile.campaignClears++;const rank={spirited:1,ferocious:2,nightmare:3,ascension:4};if((rank[selectedDifficulty]||0)>(rank[profile.bestDifficulty]||0))profile.bestDifficulty=selectedDifficulty;
    if(!profile.unlockedHeroes.includes('hopscotch')){profile.unlockedHeroes.push('hopscotch');unlockedNames.push('HOPSCOTCH');}
    if(!profile.unlockedHeroes.includes('nomi')){profile.unlockedHeroes.push('nomi');unlockedNames.push('NOMI');}
    if(profile.campaignClears>=2&&!profile.unlockedHeroes.includes('zap')){profile.unlockedHeroes.push('zap');unlockedNames.push('ZAP');}
    if(selectedDifficulty==='ascension'){profile.ascensionClears++;profile.ascensionRank=Math.min(10,(profile.ascensionRank||1)+1);if(!profile.unlockedHeroes.includes('rusty')){profile.unlockedHeroes.push('rusty');unlockedNames.push('RUSTY');}}
  }
  saveProfile();refreshProfileUi();
  state = won ? 'won' : 'lost';
  ui.resultTitle.textContent = won ? 'RUN COMPLETE!' : `${heroDef.name.toUpperCase()} FALLS`;
  ui.resultKicker.textContent = won ? 'THE HOLLOW MOON OPENS' : 'THE SPIRITS STILL WATCH';
  const endingResults={mercy:'You healed the Hollow Moon and returned every lost self to the six realms.',power:'You claimed Tsukiko’s throne and became keeper of every possible guardian road.',freedom:'You shattered the hollow throne, freed all six guardians, and returned every future to its living paws.'};
  ui.resultCopy.textContent = won ? `${endingResults[player.endingVow]||'Tsukiko releases the Hollow Moon and all six guardians bow.'} ${unlockedNames.length?`${unlockedNames.join(' AND ')} ${unlockedNames.length>1?'HAVE':'HAS'} JOINED THE ROSTER. `:''}${selectedDifficulty==='ascension'?`ASCENSION RANK ${profile.ascensionRank} NOW AWAITS. `:''}Permanent spirit rewards are banked, and a harder run awaits.` : defeatReason||'The curse grows stronger. Rebuild your powers and strike again.';
  ui.resultTime.textContent = formatTime(runTime);
  ui.resultCombo.textContent = String(player.maxCombo);
  ui.resultDashes.textContent = String(player.dashes);
  ui.resultReward.textContent=`+${runReward} SPIRIT SHARDS  ${profile.spiritShards} TOTAL${selectedDifficulty==='ascension'?`  ASCENSION ${profile.ascensionRank}`:''}`;
  resultScreen.classList.add('active');
  playSfx(won?'upgrade':'heavyImpact',won?.48:.4,won?.82:.6);
}

function resize() {
  const width = shell.clientWidth;
  const height = shell.clientHeight;
  // 1.25x remains crisp on high-DPI displays while avoiding Chrome's costly 4x pixel workload at 2x DPR.
  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  camera.zoom = Math.min(width / 2100, height / 1180);
  camera.zoom = Math.max(camera.zoom, .43);
  return { width, height, dpr };
}

function musicTrackForState(){
  if(state==='worldMap')return worldMapReturnState==='hub'?'hub':['Jade','Bamboo','Crimson','Storm','Neon','Shadow'][chapterIndex].toLowerCase();
  if(state==='preview'||state==='codex'||state==='settings'&&settingsReturnState==='preview')return 'menu';
  if(state==='hub'||state==='hubMenu'||room.id==='spiritVillage')return 'hub';
  const realms=['Jade','Bamboo','Crimson','Storm','Neon','Shadow'];
  if(encounter?.bossActive||state==='guardianReward')return `guardian${realms[chapterIndex]}`;
  return realms[chapterIndex].toLowerCase();
}
function applyAudioMix(){const volume=profile.settings.masterVolume*profile.settings.musicVolume*.68;for(let i=0;i<musicPlayers.length;i++){const track=MUSIC_TRACKS[musicPlayers[i].dataset.track]||{gain:1};musicPlayers[i].volume=clamp(volume*track.gain*(musicFade>0?(i===activeMusicPlayer?musicFade:1-musicFade):(i===activeMusicPlayer?1:0)),0,1);}}
function switchMusic(trackId){
  const track=MUSIC_TRACKS[trackId];if(!audioUnlocked||trackId===activeMusicTrack||!track)return;const next=1-activeMusicPlayer,player=musicPlayers[next];player.src=track.src;player.dataset.track=trackId;player.playbackRate=track.rate||1;player.currentTime=0;player.volume=0;player.play().catch(()=>{});activeMusicPlayer=next;activeMusicTrack=trackId;document.documentElement.dataset.musicTrack=trackId;musicFade=.001;
}
function updateAudioDirector(dt){if(!audioUnlocked)return;switchMusic(musicTrackForState());if(musicFade>0)musicFade=Math.min(1,musicFade+dt*1.65);applyAudioMix();if(musicFade>=1){musicPlayers[1-activeMusicPlayer].pause();musicFade=0;applyAudioMix();}}
function ensureAudio(){audioUnlocked=true;switchMusic(musicTrackForState());updateAudioDirector(.016);}

function playSfx(id,volume=.35,rate=1,cooldown){
  const source=audioSamples[id],abilityIds=new Set(['fire','water','lightning','heal']),uiIds=new Set(['upgrade']),bus=abilityIds.has(id)?'abilityVolume':uiIds.has(id)?'uiVolume':'sfxVolume',mix=profile.settings.masterVolume*profile.settings[bus];if(!source||mix<=0)return;
  const intervals={impact:42,strike:90,heavyImpact:105,arrow:75,blaster:42,slice:80,fire:110,water:130,lightning:155,stomp:180,dash:90,heal:180,upgrade:160};const now=performance.now(),minimum=cooldown??intervals[id]??65;
  if(now-(lastSfxAt.get(id)||-Infinity)<minimum)return;lastSfxAt.set(id,now);
  const sound=source.cloneNode();sound.volume=clamp(volume*mix,0,1);sound.playbackRate=rate*(.96+Math.random()*.08);sound.play().catch(()=>{});
}

function movementVector() {
  const x = (input.keys.has('d') || input.keys.has('arrowright') ? 1 : 0) - (input.keys.has('a') || input.keys.has('arrowleft') ? 1 : 0);
  const y = (input.keys.has('s') || input.keys.has('arrowdown') ? 1 : 0) - (input.keys.has('w') || input.keys.has('arrowup') ? 1 : 0);
  return normalize(x, y);
}

function pointerWorld() {
  const screen = resize();
  return {
    x: (input.pointer.x - screen.width / 2) / camera.zoom + camera.x,
    y: (input.pointer.y - screen.height / 2) / camera.zoom + camera.y
  };
}

const AIM_FACING_LOCK = .42;

function updatePointerAim(lock = false) {
  if (!input.pointer.active || !player) return false;
  const target = pointerWorld();
  if (distance(player, target) <= 35) return false;
  player.aimFacing = Math.atan2(target.y - player.y, target.x - player.x);
  if (lock) player.aimLockTime = Math.max(player.aimLockTime || 0, AIM_FACING_LOCK);
  return true;
}

function setActionFacing(direction, lock = true) {
  if (!direction || (!direction.x && !direction.y)) return;
  player.aimFacing = Math.atan2(direction.y, direction.x);
  player.facing = player.aimFacing;
  if (lock) player.aimLockTime = Math.max(player.aimLockTime || 0, AIM_FACING_LOCK);
}

function startDash() {
  if (player.dashCooldown > 0 || player.dashTime > 0 || player.hurtTime > 0 || player.stunTime > 0) return;
  const move = movementVector();
  if(!Number.isFinite(player.sprint))player.sprint=100;
  const direction = Math.hypot(move.x, move.y) > 0 ? move : { x: Math.cos(player.facing), y: Math.sin(player.facing) };
  player.dashDirection = direction;
  player.moveFacing = Math.atan2(direction.y, direction.x);
  if ((player.aimLockTime || 0) <= 0) {
    player.aimFacing = player.moveFacing;
    player.facing = player.moveFacing;
  }
  player.dashTime = heroDef.dashDuration;
  player.dashCooldown = heroDef.dashCooldown*player.dashCooldownMultiplier;
  player.invulnerable = Math.max(player.invulnerable, heroDef.dashInvulnerability);
  player.attack = null; player.dashes++;
  camera.kick = 18; camera.shake = Math.max(camera.shake, 3);
  burst(player.x, player.y, '#b534ff', 16, 260, 4);
  effects.rings.push({ x: player.x, y: player.y, radius: 22, maxRadius: 85, color: '#b434ff', life: .24, maxLife: .24 });
  playSfx('dash',selectedHeroId==='bamboo'?.28:.22,selectedHeroId==='bamboo'?.78:1.08);
}

function requestAttack() {
  if (!['playing','dojo'].includes(state) || player.dashTime > 0 || player.hurtTime > .08 || player.stunTime > 0 || player.castTime > 0 || player.shotCooldown > 0) return;
  startAttack();
}

function startAttack() {
  updatePointerAim(true);
  player.facing = Number.isFinite(player.aimFacing) ? player.aimFacing : player.facing;
  player.aimFacing = player.facing;
  player.aimLockTime = Math.max(player.aimLockTime || 0, AIM_FACING_LOCK);
  const direction = { x: Math.cos(player.facing), y: Math.sin(player.facing) };
  player.attack = { index: 0, definition: { duration: weapon.attackDuration||.14 }, time: 0, released:false, facing:player.facing };
  player.shotCooldown = weapon.fireRate * player.fireRateMultiplier;
  if(coop.connected)sendCoop('action',{payload:{kind:'attack',facing:player.facing,weaponId:weapon.id}});
  if(!weapon.releaseDelay)releaseWeaponVolley();
}

function releaseWeaponVolley() {
  if(!player.attack||player.attack.released)return;player.attack.released=true;
  const attackFacing=player.attack.facing??player.facing;player.facing=attackFacing;
  const direction = { x: Math.cos(attackFacing), y: Math.sin(attackFacing) };
  const muzzleDistance=weapon.muzzleDistance||48;
  const muzzle = { x: player.x + direction.x * muzzleDistance, y: player.y + direction.y * muzzleDistance - 7 };
  player.shotsFired++;const burningVolley=player.synergies.has('twinCinders')&&player.shotsFired%8===0,gunnerSeekers=player.buildMastery==='gunner'&&player.shotsFired%5===0,vanguardCrush=player.buildMastery==='vanguard'&&player.masteryCharge>=1;
  const evolution=player.weaponEvolution;const phaseNova=evolution==='phaseNova'&&player.shotsFired%5===0;const siegeLotus=evolution==='siegeLotus'&&player.shotsFired%3===0;const moonConstellation=evolution==='moonConstellation'&&player.shotsFired%4===0;const deadeyeCircuit=evolution==='deadeyeCircuit'&&player.shotsFired%6===0;const thunderheadArray=evolution==='thunderheadArray'&&player.shotsFired%3===0;const skyfeatherConstellation=evolution==='skyfeatherConstellation'&&player.shotsFired%4===0;
  const volleyCount=weapon.baseVolleys||(player.dualWield?2:1);const pelletCount=(weapon.shots||1)+player.bonusProjectiles;const echoPenalty=(player.dualWield&&!weapon.baseVolleys) ? .8 : 1;
  for(let volley=0;volley<volleyCount;volley++){
    const volleySide=volleyCount===1?0:(volley?1:-1);
    for(let pellet=0;pellet<pelletCount;pellet++){
      const siegeShell=siegeLotus&&pellet===Math.floor((pelletCount-1)/2);
      const spread=(pellet-(pelletCount-1)/2)*(weapon.spread||0);
      const angle=attackFacing+spread+volleySide*.035;
      const shotDirection={x:Math.cos(angle),y:Math.sin(angle)};
      const sideX=-direction.y*volleySide*12,sideY=direction.x*volleySide*12;
      const shotMuzzle={x:muzzle.x+sideX,y:muzzle.y+sideY};
      const type=weapon.projectileType,arrow=type==='arrow',trickshot=type==='trickshot',arc=type==='arc',glaive=type==='glaive',frost=type==='frost',mortar=type==='mortar',gale=type==='gale',embercoil=type==='embercoil',chakram=type==='chakram',railbow=type==='railbow';
      const arsenalPower=frost?1:mortar?Math.pow(1.18,player.upgradeRanks.oniPayload):gale?Math.pow(1.14,player.upgradeRanks.razorCurrent):chakram?Math.pow(1.15,player.upgradeRanks.cycloneEdge):railbow?Math.pow(1.19,player.upgradeRanks.lunarCapacitor):1;const shotDamage=weapon.damage*player.damageMultiplier*echoPenalty*arsenalPower*(vanguardCrush?1.75:siegeShell?1.7:thunderheadArray?1.12:1);
      const rangeBoost=gale?1+player.upgradeRanks.typhoonReach*.12:chakram?1+player.upgradeRanks.crosswindRecall*.08:1;const emberRupture=embercoil&&player.shotsFired%(weapon.ruptureEvery||4)===0&&volley===0&&pellet===Math.floor((pelletCount-1)/2);
      effects.playerShots.push({x:shotMuzzle.x,y:shotMuzzle.y,vx:shotDirection.x*weapon.projectileSpeed,vy:shotDirection.y*weapon.projectileSpeed,radius:(weapon.projectileRadius||9)*(vanguardCrush?1.8:siegeShell?1.75:1),damage:shotDamage,baseDamage:shotDamage,color:vanguardCrush?'#78ef63':phaseNova?'#d94cff':siegeShell?'#ffd13a':moonConstellation?'#ff5fbd':deadeyeCircuit?'#ff9b32':thunderheadArray?'#fff177':skyfeatherConstellation?'#d98cff':burningVolley?'#ff8a2a':weapon.color,ignite:burningVolley,arrow,trickshot,arc,glaive,frost,mortar,gale,embercoil,chakram,railbow,emberRupture,vanguardCrush,returning:false,returnSpeed:(weapon.returnSpeed||1120)*player.glaiveReturnSpeed*(chakram?1+player.upgradeRanks.crosswindRecall*.16:1),knockback:weapon.knockback*(vanguardCrush?2.2:gale?1+player.upgradeRanks.typhoonReach*.18:chakram?1+player.upgradeRanks.crosswindRecall*.2:1),criticalChance:weapon.criticalChance,blastRadius:(weapon.blastRadius||0)+player.upgradeRanks.blastChamber*28,blastDamage:(weapon.blastDamage||0)*player.damageMultiplier*Math.pow(1.18,player.upgradeRanks.oniPayload),skyfeatherConstellation,phaseNova,siegeLotus:siegeShell,moonConstellation,deadeyeCircuit,thunderheadArray:thunderheadArray&&volley===0&&pellet===0,guaranteedCrit:deadeyeCircuit,ricochets:(weapon.ricochets||0)+player.bonusRicochets+(deadeyeCircuit?2:0),ricochetRange:(weapon.ricochetRange||0)+(deadeyeCircuit?220:0),ricochetRetention:deadeyeCircuit?1:player.ricochetDamageRetention,pierces:glaive||gale||chakram?99:(weapon.pierces||0)+player.bonusPierces+(railbow?player.upgradeRanks.horizonBore*2:0)+(phaseNova?4:0)+(vanguardCrush?3:0),hitIds:new Set(),life:weapon.projectileLife*rangeBoost,maxLife:weapon.projectileLife*rangeBoost});
      effects.spriteEffects.push({asset:embercoil||chakram||railbow?'arsenalTier2Vfx':glaive?'nomiGlaiveVfx':frost||mortar||gale?'arsenalWeaponsVfx':arrow?'hopscotchArrow':trickshot?'trickshotVfx':arc?'zapArcVfx':'blasterImpactVfx',fixedFrame:embercoil?3:chakram?4:railbow?5:glaive?0:frost?3:mortar?4:gale?5:arrow||trickshot||arc?0:undefined,x:shotMuzzle.x,y:shotMuzzle.y,width:railbow?150:chakram?132:embercoil?112:glaive?128:frost?100:mortar?104:gale?118:arrow?92:trickshot?76:arc?82:selectedHeroId==='bamboo'?82:68,height:railbow?74:chakram?104:embercoil?68:glaive?104:frost?70:mortar?80:gale?96:arrow?52:trickshot?76:arc?68:selectedHeroId==='bamboo'?70:58,life:.16,maxLife:.16,rotation:angle,glow:weapon.impactColor});
    }
  }
  if(gunnerSeekers)spawnHunterSeekers(muzzle,weapon.damage*player.damageMultiplier);
  if(vanguardCrush){player.masteryCharge=0;spawnWord(player.x,player.y-88,'STAMPEDE CHAMBER!','#78ef63');effects.rings.push({x:player.x,y:player.y,radius:18,maxRadius:150,color:'#78ef63',life:.5,maxLife:.5});camera.shake=Math.max(camera.shake,9);}
  if(phaseNova||siegeLotus||moonConstellation||deadeyeCircuit||thunderheadArray||skyfeatherConstellation){const label=phaseNova?'PHASE NOVA!':siegeLotus?'SIEGE LOTUS!':moonConstellation?'MOON CONSTELLATION!':deadeyeCircuit?'DEADEYE CIRCUIT!':skyfeatherConstellation?'SKYFEATHER READY!':'THUNDERHEAD!';const color=phaseNova?'#d94cff':siegeLotus?'#ffd13a':moonConstellation?'#ff5fbd':deadeyeCircuit?'#ff9b32':skyfeatherConstellation?'#d98cff':'#39eaff';spawnWord(player.x,player.y-86,label,color);effects.rings.push({x:player.x,y:player.y,radius:18,maxRadius:115,color,life:.42,maxLife:.42});}
  burst(muzzle.x,muzzle.y,weapon.impactColor,selectedHeroId==='bamboo'?22:selectedHeroId==='rusty'?20:14,selectedHeroId==='bamboo'?330:selectedHeroId==='rusty'?300:260,selectedHeroId==='bamboo'?5:3);
  player.vx-=direction.x*(weapon.recoil||42);player.vy-=direction.y*(weapon.recoil||42);
  camera.kick=Math.max(camera.kick,selectedHeroId==='bamboo'?15:selectedHeroId==='hopscotch'?7:selectedHeroId==='rusty'?11:9);camera.shake=Math.max(camera.shake,selectedHeroId==='bamboo'?4.5:selectedHeroId==='hopscotch'?2:selectedHeroId==='rusty'?3:2.5);
  const releaseType=weapon.projectileType;playSfx(releaseType==='railbow'||releaseType==='frost'?'arrow':releaseType==='mortar'?'stomp':releaseType==='gale'||releaseType==='chakram'?'slice':releaseType==='embercoil'?'fire':selectedHeroId==='hopscotch'?'arrow':selectedHeroId==='bamboo'||selectedHeroId==='nomi'?'slice':selectedHeroId==='zap'?'lightning':'blaster',releaseType==='railbow'?.42:releaseType==='mortar'?.38:releaseType==='chakram'?.32:releaseType==='gale'?.29:selectedHeroId==='bamboo'?.42:selectedHeroId==='nomi'?.3:selectedHeroId==='zap'?.24:.3,releaseType==='railbow'?.72:releaseType==='embercoil'?1.18:releaseType==='mortar'?.82:releaseType==='frost'?1.3:releaseType==='gale'||releaseType==='chakram'?1.18:selectedHeroId==='rusty'?1.12:selectedHeroId==='nomi'?1.28:selectedHeroId==='zap'?1.32:1);
}

function spawnHunterSeekers(source,damage){
  const targets=enemies.filter((enemy)=>!enemy.dead&&enemy.state!=='waiting').sort((a,b)=>distance(source,a)-distance(source,b)).slice(0,2);for(const target of targets){const direction=normalize(target.x-source.x,target.y-source.y);effects.playerShots.push({x:source.x,y:source.y,vx:direction.x*1040,vy:direction.y*1040,radius:8,damage:damage*.72,baseDamage:damage*.72,color:'#45eaff',hunterSeeker:true,homingTarget:target,guaranteedCrit:false,ricochets:0,pierces:0,hitIds:new Set(),life:1.05,maxLife:1.05});}if(targets.length){spawnWord(player.x,player.y-88,'HUNTER CONSTELLATION!','#45eaff');effects.rings.push({x:player.x,y:player.y,radius:15,maxRadius:125,color:'#45eaff',life:.42,maxLife:.42});playSfx('arrow',.2,1.34);}
}

function aimDirection() {
  if (input.pointer.active) {
    const target = pointerWorld(); const direction = normalize(target.x-player.x,target.y-player.y);
    if (direction.x || direction.y) return direction;
  }
  return {x:Math.cos(player.facing),y:Math.sin(player.facing)};
}

function useAbility(id) {
  const definition=ABILITIES[id];
  if (!definition || !player.unlockedAbilities.has(id) || player.abilityCooldowns[id] > 0 || player.hurtTime > .08 || player.stunTime > 0 || player.dashTime > 0 || !['playing','dojo'].includes(state)) return;
  const direction=aimDirection(); setActionFacing(direction); player.abilityCooldowns[id]=definition.cooldown;player.castAbility=id;
  if (id === 'undertowWell') {
    player.castTime=.34;
    const power=player.abilityPower.undertowWell;
    effects.vortices.push({x:player.x+direction.x*300,y:player.y+direction.y*300,life:definition.duration,maxLife:definition.duration,radius:definition.radius*Math.sqrt(power),pull:definition.pull*power,hit:new Set(),collapsed:false,midCollapsed:false,evolved:player.abilityEvolutions.undertowWell,definition,rotation:0});
    effects.rings.push({x:player.x,y:player.y,radius:18,maxRadius:80,color:definition.color,life:.3,maxLife:.3});
    burst(player.x,player.y,definition.color,25,260,4); playSfx('water',.38,.9);
  } else if (id === 'foxfireVolley') {
    player.castTime=.28;
    const shots=player.abilityEvolutions.foxfireVolley?9:definition.shots;const spread=player.abilityEvolutions.foxfireVolley?definition.spread*.66:definition.spread;
    for(let i=0;i<shots;i++){
      const angle=player.facing+(i-(shots-1)/2)*spread;
      effects.flameBolts.push({x:player.x+Math.cos(angle)*46,y:player.y+Math.sin(angle)*46-7,vx:Math.cos(angle)*definition.speed,vy:Math.sin(angle)*definition.speed,radius:12,life:definition.life,maxLife:definition.life,definition,power:player.abilityPower.foxfireVolley});
    }
    burst(player.x,player.y,definition.color,28,320,5); camera.kick=18; camera.shake=5; playSfx('fire',.42,1.04);
  } else if (id === 'wildHeart') {
    player.wildHeartTime=definition.duration; player.castTime=.34; player.health=Math.min(player.maxHealth,player.health+definition.heal+player.heartBonus);
    effects.rings.push({x:player.x,y:player.y,radius:18,maxRadius:150,color:definition.color,life:.7,maxLife:.7});
    effects.blooms.push({x:player.x,y:player.y-24,life:.9,maxLife:.9,color:definition.color});
    burst(player.x,player.y,definition.color,36,300,5); playSfx('heal',.34,1.12);
  } else if (id === 'shockPaws') {
    player.castTime=.5; player.ultimateFlash=.12; player.invulnerable=Math.max(player.invulnerable,.45);
    effects.shockStorms.push({x:player.x,y:player.y,life:definition.duration+player.stormBonus,maxLife:definition.duration+player.stormBonus,tick:0,pulse:0,definition,power:player.abilityPower.shockPaws,verdict:player.abilityEvolutions.shockPaws,verdictResolved:false});
    effects.spriteEffects.push({asset:'shockImpactVfx',x:player.x,y:player.y-26,width:190,height:170,life:.6,maxLife:.6,glow:definition.color});
    effects.rings.push({x:player.x,y:player.y,radius:20,maxRadius:230,color:definition.color,life:.7,maxLife:.7});
    camera.kick=24; camera.shake=8; hitStop=.05; playSfx('lightning',.5,.92);
  }
}

function triggerGuardianBloom(){
  const radius=285;const targets=enemies.filter((enemy)=>!enemy.dead&&enemy.state!=='waiting'&&distance(player,enemy)<radius+enemy.radius);let drained=0;
  for(const enemy of targets){damageEnemyFromAbility(enemy,Math.round(42*player.abilityPower.wildHeart),185,normalize(enemy.x-player.x,enemy.y-player.y),'#9dff79',null);drained++;}
  if(drained)player.health=Math.min(player.maxHealth,player.health+Math.min(30,drained*4));
  effects.blooms.push({x:player.x,y:player.y-20,life:1.05,maxLife:1.05,color:'#9dff79',evolved:true});effects.rings.push({x:player.x,y:player.y,radius:28,maxRadius:radius,color:'#9dff79',life:.72,maxLife:.72});burst(player.x,player.y-12,'#9dff79',48,520,7);spawnWord(player.x,player.y-92,'GUARDIAN BLOOM!','#9dff79');camera.shake=Math.max(camera.shake,11);hitStop=Math.max(hitStop,.06);playSfx('impact',.34,.82);
}

function triggerHeavensVerdict(storm){
  storm.verdictResolved=true;const targets=enemies.filter((enemy)=>!enemy.dead&&enemy.state!=='waiting');
  for(const enemy of targets){effects.shockLinks.push({x1:player.x,y1:player.y-95,x2:enemy.x,y2:enemy.y-22,life:.48,maxLife:.48,phase:storm.pulse+3,verdict:true});effects.spriteEffects.push({asset:'shockImpactVfx',fixedFrame:5,x:enemy.x,y:enemy.y-28,width:235,height:210,life:.6,maxLife:.6,glow:'#f4ddff'});effects.stars.push({x:enemy.x,y:enemy.y-18,size:68,color:'#f4ddff',facing:enemy.facing,life:.5,maxLife:.5});damageEnemyFromAbility(enemy,Math.round(54*storm.power),105,normalize(enemy.x-player.x,enemy.y-player.y),'#f4ddff',null);applyEnemyStatus(enemy,'shock',1.1);}
  if(targets.length){spawnWord(player.x,player.y-120,"HEAVEN'S VERDICT!",'#f4ddff');effects.rings.push({x:player.x,y:player.y,radius:38,maxRadius:330,color:'#d94cff',life:.85,maxLife:.85});camera.shake=Math.max(camera.shake,18);hitStop=Math.max(hitStop,.1);player.ultimateFlash=.16;playSfx('lightning',.65,.72);}
}

function updatePlayer(dt) {
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  player.flash = Math.max(0, player.flash - dt);
  player.hurtTime = Math.max(0, player.hurtTime - dt);
  player.stunTime = Math.max(0, player.stunTime - dt);
  player.curseTime=Math.max(0,(player.curseTime||0)-dt);
  player.shieldTime=Math.max(0,(player.shieldTime||0)-dt);if(player.shieldTime<=0)player.spiritShield=0;
  if(player.bleedTime>0){player.bleedTime=Math.max(0,player.bleedTime-dt);player.bleedTick-=dt;if(player.bleedTick<=0){player.bleedTick=player.sprinting?.44:.72;const bleedDamage=Math.max(1,Math.round((player.bleedPower||1)*(player.sprinting?4:2)));player.health=Math.max(0,player.health-bleedDamage);player.flash=.12;effects.numbers.push({x:player.x,y:player.y-42,vx:0,vy:-60,text:`-${bleedDamage}`,color:'#ff365f',life:.55,maxLife:.55,size:19});burst(player.x,player.y-10,'#ff365f',6,130,2);if(player.health<=0&&state==='dojo'){player.health=player.maxHealth;player.bleedTime=0;player.invulnerable=1.5;spawnWord(player.x,player.y-78,'PRACTICE RESET','#72ef5b');}else if(player.health<=0){player.hurtTime=99;setTimeout(()=>endGame(false),600);}}}
  const recoveryRate=state==='dojo'?4:1;
  player.dashCooldown = Math.max(0, player.dashCooldown - dt*recoveryRate);
  player.shotCooldown = Math.max(0, player.shotCooldown - dt);
  player.aimLockTime = Math.max(0, (player.aimLockTime || 0) - dt);
  player.ultimateFlash = Math.max(0, player.ultimateFlash - dt);
  player.castTime=Math.max(0,player.castTime-dt);if(player.castTime<=0)player.castAbility=null;const wildHeartWasActive=player.wildHeartTime>0;player.wildHeartTime=Math.max(0,player.wildHeartTime-dt);if(wildHeartWasActive&&player.wildHeartTime<=0&&player.abilityEvolutions.wildHeart)triggerGuardianBloom();
  for(const id of Object.keys(player.abilityCooldowns)) player.abilityCooldowns[id]=Math.max(0,player.abilityCooldowns[id]-dt*recoveryRate);
  player.comboDrop = Math.max(0, player.comboDrop - dt);
  if (player.comboDrop <= 0) player.hitCount = 0;

  if (player.stunTime > 0) {
    player.braced=false;player.braceTime=0;
    player.attack = null;
    const stunDrag = Math.exp(-12 * dt); player.vx *= stunDrag; player.vy *= stunDrag;
    player.x += player.vx * dt; player.y += player.vy * dt; keepInArena(player);
    return;
  }

  if (input.pressed.has('shift')) startDash();
  if (input.pressed.has('e')) {if(!useMissionInteraction()&&!useRoomInteractable())useAbility('undertowWell');}
  if (input.pressed.has('c')) useAbility('foxfireVolley');
  if (input.pressed.has('f')) useAbility('wildHeart');
  if (input.pressed.has('q')) useAbility('shockPaws');
  if (input.attack || input.attackHeld || input.keys.has('j') || input.pressed.has('j') || input.pressed.has('enter')) requestAttack();

  const move = movementVector();
  if (move.x || move.y) player.moveFacing = Math.atan2(move.y, move.x);
  // Twin-stick rule: movement controls translation; a live mouse aim controls body facing.
  // This prevents alternating left/right frames when moving opposite the firing direction.
  if (input.pointer.active) updatePointerAim(input.attackHeld || Boolean(player.attack) || player.castTime > 0);
  const actionOwnsFacing = input.pointer.active || (player.aimLockTime || 0) > 0 || input.attackHeld || Boolean(player.attack) || player.castTime > 0;
  if (actionOwnsFacing && Number.isFinite(player.aimFacing)) player.facing = player.aimFacing;
  const wantsSprint=input.keys.has(' ')&&Boolean(move.x||move.y)&&!player.attack&&player.castTime<=0&&player.dashTime<=0;
  player.sprinting=wantsSprint&&player.sprint>2;
  player.sprint=clamp(player.sprint+(player.sprinting?-27:28)*dt,0,100);
  if(player.curseTime>0&&player.sprinting){player.curseTime=Math.max(0,player.curseTime-dt*2.65);if(player.curseTime<=0){player.curseMultiplier=1;spawnWord(player.x,player.y-82,'CURSE CLEANSED!','#8ff8ff');effects.rings.push({x:player.x,y:player.y,radius:72,maxRadius:18,color:'#8ff8ff',life:.38,maxLife:.38});}}
  if(player.buildMastery==='vanguard'){player.masteryCharge=clamp((player.masteryCharge||0)+(player.sprinting?dt/1.4:-dt*.16),0,1);if(player.masteryCharge>=1&&player.masteryReady!==true){player.masteryReady=true;spawnWord(player.x,player.y-78,'STAMPEDE READY!','#78ef63');effects.rings.push({x:player.x,y:player.y,radius:14,maxRadius:92,color:'#78ef63',life:.35,maxLife:.35});}if(player.masteryCharge<1)player.masteryReady=false;}
  if(selectedHeroId==='bamboo'&&player.dashTime<=0&&!move.x&&!move.y&&!player.attack){player.braceTime+=dt;player.braced=player.braceTime>=player.braceDelay;}else{player.braceTime=0;player.braced=false;}
  if (player.dashTime > 0) {
    const wasDashing = player.dashTime > 0;
    player.dashTime = Math.max(0, player.dashTime - dt);
    player.vx = player.dashDirection.x * heroDef.dashSpeed;
    player.vy = player.dashDirection.y * heroDef.dashSpeed;
    player.dashTrailClock -= dt;
    if (player.dashTrailClock <= 0) {
      effects.afterimages.push({ x: player.x, y: player.y, facing: player.facing, life: .23, maxLife: .23 });
      player.dashTrailClock = .026;
    }
    if (wasDashing && player.dashTime <= 0) {
      burst(player.x, player.y, '#3de8ef', 11, 170, 3);
      effects.rings.push({ x: player.x, y: player.y, radius: 10, maxRadius: 50, color: '#45e9f4', life: .2, maxLife: .2 });
    }
  } else {
    const attackingSlow = player.attack ? .9 : 1;const sprintBoost=player.sprinting?1.58:1;
    const targetVx = move.x * heroDef.speed * player.speedMultiplier * attackingSlow*sprintBoost;
    const targetVy = move.y * heroDef.speed * player.speedMultiplier * attackingSlow*sprintBoost;
    const accel = clamp(heroDef.acceleration * dt / Math.max(heroDef.speed, 1), 0, 1);
    player.vx = lerp(player.vx, targetVx, accel);
    player.vy = lerp(player.vy, targetVy, accel);
    if (!move.x && !move.y) {
      const drag = Math.exp(-heroDef.drag * dt);
      player.vx *= drag; player.vy *= drag;
    } else if (!actionOwnsFacing) {
      player.facing = approachAngle(player.facing, player.moveFacing, clamp(dt * 15, 0, 1));
      player.aimFacing = player.facing;
    }
  }

  player.x += player.vx * dt;
  player.y += player.vy * dt;
  keepInArena(player);
  updateAttack(dt);
}

function damageEnemyFromAbility(enemy,damage,knockback,direction,color,word){
  damage=Math.max(1,Math.round(damage*(enemy.practiceArmor??1)*(enemy.eliteId?player.eliteDamageMultiplier:1)*(enemy.def.behavior==='boss'?player.guardianDamageMultiplier:1)));recordDojoDamage(enemy,damage);const resolved=resolveEnemyDamage(enemy,damage,direction);
  const isBoss=enemy.def.behavior==='boss';
  enemy.vx+=direction.x*knockback*(isBoss ? .05 : 1);enemy.vy+=direction.y*knockback*(isBoss ? .05 : 1);enemy.flash=.15;registerEnemyHitReaction(enemy,direction,'ability',damage);
  if(!isBoss){enemy.state='stagger';enemy.stateTime=.2;}
  player.hitCount++;player.maxCombo=Math.max(player.maxCombo,player.hitCount);player.comboDrop=2.5;comboUiTimer=.75;hitStop=Math.max(hitStop,.045);camera.shake=Math.max(camera.shake,7);
  burst(enemy.x,enemy.y,color,14,310,4);
  playSfx(isBoss?'heavyImpact':'impact',isBoss?.34:.19,isBoss?.76:1.04);
  effects.numbers.push({x:enemy.x,y:enemy.y-38,vx:0,vy:-100,text:resolved.shieldDamage&&!resolved.healthDamage?String(Math.round(resolved.total)):String(damage),color:resolved.shieldDamage?'#9aff8b':color,life:.8,maxLife:.8,size:30});
  if(word)spawnWord(enemy.x,enemy.y-58,word,color); if(enemy.health<=0)killEnemy(enemy,direction);
}

function registerEnemyHitReaction(enemy,direction,kind='projectile',damage=1){
  const heavy=enemy.def.behavior==='boss'||enemy.def.behavior==='heavy';const force=kind==='critical'?1.4:kind==='ability'?1.15:1;
  enemy.hitReactTime=Math.max(enemy.hitReactTime||0,heavy?.18:.24);enemy.hitReactMax=enemy.hitReactTime;enemy.hitReactX=(direction?.x||0)*force;enemy.hitReactY=(direction?.y||0)*force;enemy.hitReactKind=kind;enemy.hitReactPower=clamp(damage/Math.max(1,enemy.maxHealth)*12,.38,1.35);
}

function updateAttack(dt) {
  if (!player.attack) return;
  player.attack.time += dt;
  if(!player.attack.released&&weapon.releaseDelay&&player.attack.time>=weapon.releaseDelay)releaseWeaponVolley();
  if (player.attack.time >= player.attack.definition.duration) player.attack = null;
}

function hitEnemyWithShot(enemy, shot) {
  const critical=shot.guaranteedCrit||Math.random()<Math.min(.75,(shot.criticalChance??weapon.criticalChance)+player.critBonus+(shot.returning?shot.returnCrit||0:0));
  const damage=Math.max(1,Math.round((shot.damage??weapon.damage)*(critical?1.65*player.critDamageMultiplier:1)*(enemy.practiceArmor??1)*(enemy.eliteId?player.eliteDamageMultiplier:1)*(enemy.def.behavior==='boss'?player.guardianDamageMultiplier:1)));recordDojoDamage(enemy,damage);
  const direction = normalize(shot.vx, shot.vy);
  const isBoss=enemy.def.behavior==='boss';
  const resolved=resolveEnemyDamage(enemy,damage,direction);
  const weaponForce=weapon.knockback*player.knockbackMultiplier;const shotForce=shot.knockback==null?weaponForce:shot.knockback*player.knockbackMultiplier;enemy.vx += direction.x * shotForce*(isBoss ? .05 : 1); enemy.vy += direction.y * shotForce*(isBoss ? .05 : 1);
  enemy.flash = .15; enemy.stagger = critical ? .22 : .12;registerEnemyHitReaction(enemy,direction,critical?'critical':'projectile',damage);
  if(!isBoss){enemy.state = 'stagger'; enemy.stateTime = enemy.stagger;}
  player.hitCount++; player.maxCombo = Math.max(player.maxCombo, player.hitCount); player.comboDrop = 2.25;
  comboUiTimer = .65; hitStop = Math.max(hitStop, critical ? .05 : .026); camera.shake = Math.max(camera.shake, critical ? 6 : 3);
  const impactX = shot.x, impactY = shot.y - 8;
  const impactColor=critical?'#ffd52d':shot.color||weapon.impactColor;burst(impactX, impactY, impactColor, critical ? 16 : 9, critical ? 370 : 260, critical ? 5 : 3);
  effects.spriteEffects.push({asset:shot.embercoil||shot.chakram||shot.railbow?'arsenalTier2Vfx':shot.frost||shot.gale||shot.mortar?'arsenalReactionsVfx':shot.glaive||shot.spiritFeather?'nomiGlaiveVfx':shot.arrow?'hopscotchArrow':shot.trickshot?'trickshotVfx':shot.arc?'zapArcVfx':'blasterImpactVfx',fixedFrame:shot.embercoil?3:shot.chakram?4:shot.railbow?5:shot.frost?0:shot.gale?4:shot.mortar?3:shot.glaive?2:shot.spiritFeather?3:shot.arrow?(critical?4:3):shot.trickshot?(critical?5:4):shot.arc?(critical?5:4):undefined,x:impactX,y:impactY,width:shot.railbow?225:shot.chakram?205:shot.embercoil?160:shot.frost?155:shot.gale?190:shot.mortar?210:shot.glaive?(critical?205:174):shot.spiritFeather?128:shot.trickshot?(critical?170:138):shot.arc?(critical?176:142):critical?190:148,height:shot.railbow?112:shot.chakram?170:shot.embercoil?105:shot.frost?126:shot.gale?150:shot.mortar?170:shot.glaive?(critical?170:144):shot.spiritFeather?98:shot.trickshot?(critical?170:138):shot.arc?(critical?150:120):critical?155:122,life:.4,maxLife:.4,rotation:Math.atan2(shot.vy,shot.vx),glow:impactColor});
  effects.numbers.push({ x: enemy.x, y: enemy.y - 34, vx: (Math.random() - .5) * 45, vy: -95, text:resolved.shieldDamage&&!resolved.healthDamage?String(Math.round(resolved.total)):String(damage),color:resolved.shieldDamage?'#9aff8b':critical?'#ffd833':'#fff8ed',life:.75,maxLife:.75,size:critical?32:23 });
  if(player.bleedOnHit>0){applyEnemyStatus(enemy,'bleed',player.bleedOnHit,1+player.upgradeRanks.razorFang*.22);if((enemy.bleedAnnounce||0)<=0){enemy.bleedAnnounce=1.25;spawnWord(enemy.x,enemy.y-62,'SPIRIT WOUND!','#ff526f');}}
  if(critical&&player.curseOnCrit>0){applyEnemyStatus(enemy,'curse',3.8*player.curseDurationMultiplier,player.curseOnCrit*player.cursePowerMultiplier);spawnWord(enemy.x,enemy.y-72,'HOLLOW-MARKED!','#d88cff');}
  if(shot.ignite){applyEnemyStatus(enemy,'burn',2.8,.72);effects.spriteEffects.push({asset:'burnStatusVfx',x:enemy.x,y:enemy.y-8,width:160,height:132,life:.36,maxLife:.36,glow:'#ff7428'});spawnWord(enemy.x,enemy.y-56,'CINDER ROUND!','#ff8a2a');}
  if(shot.embercoil){const burnRank=player.upgradeRanks.cinderDrum||0;applyEnemyStatus(enemy,'burn',(weapon.burnDuration||2.8)+burnRank*.6,(weapon.burnPower||.68)*(1+burnRank*.22));enemy.abilityReactType='burn';enemy.abilityReactTime=Math.max(enemy.abilityReactTime||0,.42);if(shot.emberRupture&&!shot.ruptured){shot.ruptured=true;const rank=player.upgradeRanks.ruptureMagazine||0;triggerWeaponBlast(enemy,shot,'#ff6a24',155+rank*22,.55*(1+rank*.18),'EMBER RUPTURE!');}}
  if(shot.phaseNova&&!shot.phaseDetonated){shot.phaseDetonated=true;triggerWeaponBlast(enemy,shot,'#d94cff',165,.62,'PHASE BURST!');}
  if(shot.siegeLotus)triggerWeaponBlast(enemy,shot,'#ffd13a',230,.82,'SIEGE BLOOM!');
  if(shot.moonConstellation&&!shot.splitSpawned){shot.splitSpawned=true;spawnMoonSplinters(enemy,shot);}
  if(shot.arc)applyConductiveHit(enemy,shot,direction);
  if(shot.frost)applyFrostbite(enemy,shot);
  if (critical || enemy.health <= 0) spawnWord(impactX, impactY - 42, enemy.health <= 0 ? 'CRASH!!' : 'ZAP!!', critical ? '#ffd938' : '#39eaff');
  playSfx(critical||isBoss?'heavyImpact':'impact',critical?.3:isBoss?.27:.16,critical?.9:isBoss?.78:1.08);
  if (enemy.health <= 0) killEnemy(enemy, direction);
}

function applyFrostbite(enemy,shot){
  if(enemy.dead)return;const threshold=Math.max(2,(WEAPONS.frostbiteNeedle.chillThreshold||3)-(player.upgradeRanks.permafrost>0?1:0));enemy.chillStacks=Math.min(threshold,(enemy.chillStacks||0)+1);enemy.chillTime=4.2;enemy.abilityReactType='frost';enemy.abilityReactTime=Math.max(enemy.abilityReactTime||0,.44);
  if(enemy.chillStacks<threshold){spawnWord(enemy.x,enemy.y-65,`${enemy.chillStacks} / ${threshold} CHILL`,'#80f3ff');return;}
  enemy.chillStacks=0;enemy.chillTime=0;enemy.freezeTime=Math.max(enemy.freezeTime||0,(enemy.def.behavior==='boss'?.38:WEAPONS.frostbiteNeedle.freezeDuration)+player.upgradeRanks.permafrost*.25);enemy.abilityReactType='freeze';enemy.abilityReactTime=Math.max(enemy.abilityReactTime||0,.55);spawnWord(enemy.x,enemy.y-78,'FROZEN!','#d9fdff');effects.rings.push({x:enemy.x,y:enemy.y,radius:18,maxRadius:130,color:'#67edff',life:.52,maxLife:.52});effects.spriteEffects.push({asset:'arsenalReactionsVfx',fixedFrame:2,x:enemy.x,y:enemy.y-25,width:enemy.radius*4.4,height:enemy.radius*4.9,life:.62,maxLife:.62,glow:'#67edff'});burst(enemy.x,enemy.y-12,'#bffaff',26,390,6);playSfx('water',.26,1.32);
  const rank=player.upgradeRanks.shatterpoint||0;if(rank>0){const radius=125+rank*18,damage=Math.max(1,Math.round(shot.damage*.45*rank));for(const target of enemies){if(target===enemy||target.dead||target.state==='waiting'||distance(enemy,target)>radius+target.radius)continue;const away=normalize(target.x-enemy.x,target.y-enemy.y);damageEnemyFromAbility(target,damage,145,away,'#bffaff',null);}effects.rings.push({x:enemy.x,y:enemy.y,radius:20,maxRadius:radius,color:'#d9fdff',life:.42,maxLife:.42});}
}

function detonateMortar(shot){
  if(shot.detonated)return;shot.detonated=true;shot.life=0;const radius=shot.blastRadius||205;effects.spriteEffects.push({asset:'arsenalReactionsVfx',fixedFrame:3,x:shot.x,y:shot.y-18,width:radius*2.35,height:radius*1.9,life:.58,maxLife:.58,glow:'#ff862c'});effects.rings.push({x:shot.x,y:shot.y,radius:24,maxRadius:radius,color:'#ff9a2c',life:.5,maxLife:.5});burst(shot.x,shot.y,'#ffb43e',44,620,8);camera.shake=Math.max(camera.shake,14);hitStop=Math.max(hitStop,.07);playSfx('stomp',.42,.78);
  for(const enemy of enemies){if(enemy.dead||enemy.state==='waiting'||distance(shot,enemy)>radius+enemy.radius)continue;const away=normalize(enemy.x-shot.x,enemy.y-shot.y);damageEnemyFromAbility(enemy,shot.blastDamage||18,shot.knockback||420,away,'#ff8a24',null);enemy.abilityReactType='blast';enemy.abilityReactTime=Math.max(enemy.abilityReactTime||0,.48);}
}

function applyConductiveHit(source,shot,direction){
  if(source.dead||source.health<=0)return;source.conductiveStacks=(source.conductiveStacks||0)+1;source.conductiveTime=4.2;source.abilityReactType='shock';source.abilityReactTime=Math.max(source.abilityReactTime||0,.3);
  const threshold=weapon.chainThreshold||3;if(source.conductiveStacks<threshold&&!shot.thunderheadArray){spawnWord(source.x,source.y-62,`${source.conductiveStacks} / ${threshold}`,'#39eaff');return;}
  source.conductiveStacks=0;source.conductiveTime=0;const color=shot.thunderheadArray?'#fff177':'#39eaff';const range=(weapon.chainRange||360)+(player.arcChainRange||0)+(shot.thunderheadArray?150:0);const limit=(weapon.chainTargets||2)+(player.arcChainBonus||0)+(shot.thunderheadArray?4:0);
  const targets=enemies.filter((enemy)=>enemy!==source&&!enemy.dead&&enemy.state!=='waiting'&&distance(source,enemy)<=range+enemy.radius).sort((a,b)=>distance(source,a)-distance(source,b)).slice(0,limit);
  let previous=source;const chainDamage=Math.max(1,Math.round(shot.damage*(weapon.chainDamage||.55)*(player.arcChainPower||1)*(shot.thunderheadArray?1.35:1)));
  for(const target of targets){const linkDirection=normalize(target.x-previous.x,target.y-previous.y);effects.shockLinks.push({x1:previous.x,y1:previous.y-18,x2:target.x,y2:target.y-18,color,life:.34,maxLife:.34});effects.spriteEffects.push({asset:'zapArcVfx',fixedFrame:5,x:target.x,y:target.y-12,width:170,height:144,life:.42,maxLife:.42,rotation:Math.atan2(linkDirection.y,linkDirection.x),glow:color});target.abilityReactType='shock';target.abilityReactTime=Math.max(target.abilityReactTime||0,.48);damageEnemyFromAbility(target,chainDamage,115,linkDirection,color,null);previous=target;}
  effects.rings.push({x:source.x,y:source.y,radius:12,maxRadius:shot.thunderheadArray?190:112,color,life:.4,maxLife:.4});burst(source.x,source.y-12,color,shot.thunderheadArray?30:18,shot.thunderheadArray?520:350,5);spawnWord(source.x,source.y-78,shot.thunderheadArray?'THUNDERHEAD!':'CONDUCTIVE! ',color);camera.shake=Math.max(camera.shake,shot.thunderheadArray?9:5);playSfx('lightning',shot.thunderheadArray?.38:.24,shot.thunderheadArray?.78:1.14);
}

function triggerWeaponBlast(source,shot,color,radius,damageScale,label){
  effects.rings.push({x:source.x,y:source.y,radius:18,maxRadius:radius,color,life:.46,maxLife:.46});effects.spriteEffects.push({asset:'blasterImpactVfx',x:source.x,y:source.y-18,width:radius*1.6,height:radius*1.25,life:.48,maxLife:.48,glow:color});burst(source.x,source.y,color,28,480,7);spawnWord(source.x,source.y-72,label,color);camera.shake=Math.max(camera.shake,shot.siegeLotus?12:8);
  for(const enemy of enemies){if(enemy===source||enemy.dead||enemy.state==='waiting'||distance(source,enemy)>radius+enemy.radius)continue;const direction=normalize(enemy.x-source.x,enemy.y-source.y);damageEnemyFromAbility(enemy,Math.round(shot.damage*damageScale),shot.siegeLotus?430:180,direction,color,null);}
}

function spawnMoonSplinters(source,shot){
  const candidates=enemies.filter((enemy)=>enemy!==source&&!enemy.dead&&enemy.state!=='waiting'&&!shot.hitIds.has(enemy.id)).sort((a,b)=>distance(source,a)-distance(source,b)).slice(0,2);
  for(const target of candidates){const direction=normalize(target.x-source.x,target.y-source.y);effects.playerShots.push({x:source.x,y:source.y-12,vx:direction.x*1250,vy:direction.y*1250,radius:7,damage:shot.damage*.72,color:'#ff8bd4',arrow:true,guaranteedCrit:false,ricochets:0,pierces:1,hitIds:new Set([source.id]),life:.72,maxLife:.72});}
  effects.rings.push({x:source.x,y:source.y,radius:8,maxRadius:88,color:'#ff5fbd',life:.34,maxLife:.34});burst(source.x,source.y,'#ff8bd4',18,340,4);spawnWord(source.x,source.y-64,'SPLIT THE MOON!','#ff5fbd');
}

function turnGlaiveForReturn(shot){
  if(!shot.glaive||shot.returning)return;shot.returning=true;shot.hitIds=new Set();shot.pierces=99;shot.life=1.35;shot.maxLife=1.35;shot.damage=(shot.baseDamage||shot.damage)*.78*player.glaiveReturnPower;shot.returnCrit=player.glaiveReturnCrit;
  effects.spriteEffects.push({asset:'nomiGlaiveVfx',fixedFrame:1,x:shot.x,y:shot.y,width:190,height:126,life:.38,maxLife:.38,rotation:Math.atan2(-shot.vy,-shot.vx),glow:'#aeefff'});effects.rings.push({x:shot.x,y:shot.y,radius:8,maxRadius:74,color:'#b65cff',life:.28,maxLife:.28});
  if(shot.skyfeatherConstellation)spawnSkyfeathers(shot);
}

function turnGaleForReturn(shot){
  if(!shot.gale||shot.returning)return;shot.returning=true;shot.hitIds=new Set();shot.pierces=99;shot.life=1.3;shot.maxLife=1.3;shot.damage=(shot.baseDamage||shot.damage)*(.76+player.upgradeRanks.razorCurrent*.08);
  effects.spriteEffects.push({asset:'arsenalReactionsVfx',fixedFrame:5,x:shot.x,y:shot.y-8,width:205,height:170,life:.38,maxLife:.38,rotation:Math.atan2(-shot.vy,-shot.vx),glow:'#67efff'});effects.rings.push({x:shot.x,y:shot.y,radius:8,maxRadius:82,color:'#bffcff',life:.3,maxLife:.3});
}

function turnChakramForReturn(shot){
  if(!shot.chakram||shot.returning)return;shot.returning=true;shot.hitIds=new Set();shot.pierces=99;shot.life=1.45;shot.maxLife=1.45;shot.damage=(shot.baseDamage||shot.damage)*(.82+player.upgradeRanks.cycloneEdge*.15);effects.spriteEffects.push({asset:'arsenalTier2Vfx',fixedFrame:4,x:shot.x,y:shot.y,width:235,height:190,life:.4,maxLife:.4,rotation:Math.atan2(-shot.vy,-shot.vx),glow:'#d8ffff'});effects.rings.push({x:shot.x,y:shot.y,radius:10,maxRadius:96,color:'#5deeff',life:.34,maxLife:.34});spawnWord(shot.x,shot.y-54,'CROSSWIND!','#d8ffff');
}

function spawnSkyfeathers(source){
  const targets=enemies.filter((enemy)=>!enemy.dead&&enemy.state!=='waiting').sort((a,b)=>distance(source,a)-distance(source,b)).slice(0,6);
  for(const target of targets){const direction=normalize(target.x-source.x,target.y-source.y);effects.playerShots.push({x:source.x,y:source.y-10,vx:direction.x*1080,vy:direction.y*1080,radius:8,damage:source.damage*.58,color:'#d98cff',spiritFeather:true,homingTarget:target,guaranteedCrit:false,ricochets:0,pierces:0,hitIds:new Set(),life:.9,maxLife:.9});}
  effects.spriteEffects.push({asset:'nomiGlaiveVfx',fixedFrame:4,x:source.x,y:source.y-18,width:250,height:210,life:.58,maxLife:.58,glow:'#d98cff'});spawnWord(source.x,source.y-72,'SKYFEATHER!','#d98cff');camera.shake=Math.max(camera.shake,8);playSfx('lightning',.25,1.42);
}

function redirectTrickshot(shot,sourceEnemy){
  if(!shot.trickshot||shot.ricochets<=0)return false;
  let target=null,best=shot.ricochetRange||460;
  for(const candidate of enemies){if(candidate===sourceEnemy||candidate.dead||candidate.state==='waiting'||shot.hitIds?.has(candidate.id))continue;const gap=distance(sourceEnemy,candidate);if(gap<best){best=gap;target=candidate;}}
  if(!target)return false;
  const direction=normalize(target.x-shot.x,target.y-shot.y);const speed=Math.max(720,Math.hypot(shot.vx,shot.vy));shot.vx=direction.x*speed;shot.vy=direction.y*speed;shot.x+=direction.x*18;shot.y+=direction.y*18;shot.life=Math.max(shot.life,.58);shot.ricochets--;shot.damage*=shot.ricochetRetention||.78;
  effects.spriteEffects.push({asset:'trickshotVfx',fixedFrame:2,x:shot.x,y:shot.y,width:126,height:126,life:.34,maxLife:.34,rotation:Math.atan2(direction.y,direction.x),glow:'#ffbe3f'});effects.rings.push({x:shot.x,y:shot.y,radius:7,maxRadius:58,color:'#ffbe3f',life:.24,maxLife:.24});burst(shot.x,shot.y,'#4feaff',9,220,3);spawnWord(shot.x,shot.y-38,'BANK!','#ffbe3f');playSfx('impact',.16,1.28);return true;
}

function killEnemy(enemy, direction) {
  const foxfireSpread=enemy.burnTime>0&&player.abilityEvolutions?.foxfireVolley;const spreadingPower=enemy.burnPower||1;const bleedSpread=enemy.bleedTime>0&&player.bleedSpread;const bleedDuration=enemy.bleedTime*.55;const bleedPower=enemy.bleedPower||1;enemy.dead = true; enemy.deathTime = .72;
  if(enemy.practice){dojoState.kills++;dojoState.respawnTimer=.82;enemy.vx+=direction.x*220;enemy.vy+=direction.y*220;burst(enemy.x,enemy.y,'#72ef5b',34,390,7);spawnWord(enemy.x,enemy.y-90,'TARGET BROKEN!','#72ef5b');camera.shake=10;return;}
  if(enemy.def.behavior==='boss'){
    recordContractProgress('guardianOath');
    enemy.deathTime=2.8;encounter.bossDefeated=true;clearDelay=3.2;encounter.defeatedGuardianId=enemy.def.id;ui.bossPanel.classList.remove('active');
    const bamboo=enemy.def.id==='moonfangKomainu';const crimson=enemy.def.id==='pyreclawShogun';
    ui.roomState.textContent='GUARDIAN FREED';ui.roomState.style.color='#65ef80';ui.objective.textContent=crimson?'THE ONI GATE OPENS':bamboo?'THE HOLLOW BREATHES AGAIN':'THE JADE BELLS RING AGAIN';
    spawnWord(enemy.x,enemy.y-190,'CURSE BROKEN!',enemy.def.color);camera.shake=24;player.ultimateFlash=.2;
    for(let i=0;i<48;i++){const a=Math.random()*Math.PI*2,s=120+Math.random()*420;effects.shards.push({x:enemy.x,y:enemy.y-60,vx:Math.cos(a)*s,vy:Math.sin(a)*s,color:i%3?enemy.def.color:'#d94cff',life:5,maxLife:5,delay:.4+Math.random()*.8,size:6+Math.random()*8});}
    return;
  }
  recordContractProgress('spiritCull');if(enemy.eliteId)recordContractProgress('eliteBreakers');if(enemy.burnTime>0)recordContractProgress('foxfireHunt');
  if(bleedSpread){const target=enemies.filter((candidate)=>candidate!==enemy&&!candidate.dead&&candidate.state!=='waiting').sort((a,b)=>distance(enemy,a)-distance(enemy,b))[0];if(target&&distance(enemy,target)<340){applyEnemyStatus(target,'bleed',bleedDuration,bleedPower*.72);effects.rings.push({x:enemy.x,y:enemy.y,radius:18,maxRadius:distance(enemy,target),color:'#ff365f',life:.34,maxLife:.34});spawnWord(target.x,target.y-62,'WOUND SPREAD!','#ff526f');}}
  recordCorruptionKill();
  if(foxfireSpread){
    const spreadTargets=enemies.filter((target)=>target!==enemy&&!target.dead&&target.state!=='waiting'&&distance(enemy,target)<360+target.radius).sort((a,b)=>distance(enemy,a)-distance(enemy,b)).slice(0,3);
    for(const target of spreadTargets){applyEnemyStatus(target,'burn',ABILITIES.foxfireVolley.burnDuration*.8,spreadingPower*.85);effects.spriteEffects.push({asset:'burnStatusVfx',x:target.x,y:target.y-12,width:178,height:146,life:.46,maxLife:.46,glow:'#ff8a2a'});effects.fireTrails.push({x:(enemy.x+target.x)/2,y:(enemy.y+target.y)/2,color:'#ff6a24',life:.46,maxLife:.46});}
    if(spreadTargets.length){effects.rings.push({x:enemy.x,y:enemy.y,radius:20,maxRadius:190,color:'#ff6a24',life:.45,maxLife:.45});burst(enemy.x,enemy.y-12,'#ff8a2a',28,430,6);spawnWord(enemy.x,enemy.y-78,'FOXFIRE SPREAD!','#ff8a2a');}
  }
  if(enemy.eliteId==='volatile'){
    effects.enemyHazards.push({x:enemy.x,y:enemy.y+5,radius:enemy.eliteDef.blastRadius,damage:Math.round(enemy.eliteDef.blastDamage*enemy.damageScale),color:enemy.eliteDef.color,life:.78,maxLife:.78,triggerAt:.16,triggered:false,type:'volatile'});
    spawnWord(enemy.x,enemy.y-82,'CORE UNSTABLE!',enemy.eliteDef.color);
  }
  if(enemy.eliteId==='splitter'&&enemy.splitDepth<1){
    const splitType=enemy.def.biome==='shadow'?'shadowstepFerret':enemy.def.biome==='neon'?'circuitJackal':enemy.def.biome==='storm'?'tidebladeOtter':enemy.def.biome==='crimson'?'emberAkita':enemy.def.biome==='bamboo'?'bambooStalker':'groveMinion';
    for(let i=0;i<enemy.eliteDef.splitCount;i++){const angle=(i?1:-1)*.8+enemy.facing;const child=makeEnemy({type:splitType,x:enemy.x+Math.cos(angle)*58,y:enemy.y+Math.sin(angle)*44,delay:.22+i*.12,healthScale:enemy.healthScale*.48,speedScale:enemy.speedScale*1.12,damageScale:enemy.damageScale*.7,splitDepth:enemy.splitDepth+1},enemies.length+i);enemies.push(child);}
    spawnWord(enemy.x,enemy.y-82,'SPIRIT SPLIT!',enemy.eliteDef.color);effects.rings.push({x:enemy.x,y:enemy.y,radius:18,maxRadius:145,color:enemy.eliteDef.color,life:.5,maxLife:.5});
  }
    const goldBase=['conductor','hacker','curser'].includes(enemy.def.behavior)?24:enemy.def.behavior==='shield'?22:enemy.def.behavior==='summoner'?14:enemy.def.behavior==='assassin'?12:enemy.def.behavior==='bomber'?11:enemy.def.behavior==='heavy'?18:enemy.def.behavior==='ranged'?8:enemy.def.behavior==='melee'?7:4;
  const goldReward=Math.round(goldBase*player.goldMultiplier*(encounter.rewardScale||1)*enemy.eliteRewardScale*(enemy.eliteId?player.eliteGoldMultiplier:1));player.gold+=goldReward;
  if(enemy.eliteId&&player.eliteKillHeal>0)player.health=Math.min(player.maxHealth,player.health+player.eliteKillHeal);
  if(player.killHeal>0)player.health=Math.min(player.maxHealth,player.health+player.killHeal);
  effects.numbers.push({x:enemy.x+24,y:enemy.y-56,vx:0,vy:-70,text:`+${goldReward}`,color:'#ffd13a',life:.8,maxLife:.8,size:19});
  enemy.vx += direction.x * 330; enemy.vy += direction.y * 330;
  burst(enemy.x, enemy.y, '#11101e', 24, 360, 8);
  burst(enemy.x, enemy.y, enemy.def.color, enemy.def.behavior === 'heavy' ? 42 : 25, 430, 6);
  const shardCount=(enemy.def.behavior==='heavy'?12:enemy.def.behavior==='ranged'?6:5)+(enemy.eliteId?4:0);
  for (let i = 0; i < shardCount; i++) {
    const angle = Math.random() * Math.PI * 2; const speed = 80 + Math.random() * 170;
    effects.shards.push({ x: enemy.x, y: enemy.y - 10, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color: i % 2 ? '#33e9ff' : '#ad45ff', life: 4, maxLife: 4, delay: .38 + Math.random() * .38, size: 5 + Math.random() * 4 });
  }
}

function hurtPlayer(amount, source, stunDuration = 0) {
  if (player.invulnerable > 0 || !['playing','dojo'].includes(state)) return false;
  const behavior=source?.def?.behavior;const kind=source?.boss||behavior==='boss'?'boss':behavior==='heavy'?'heavy':['summoner','bomber','conductor','hacker','curser','assassin'].includes(behavior)?'specialist':source?.def?'standard':'hazard';
  const curseConsumed=player.curseTime>0;
  if(curseConsumed){amount*=player.curseMultiplier||1.35;player.curseTime=0;player.curseMultiplier=1;effects.rings.push({x:player.x,y:player.y,radius:82,maxRadius:18,color:'#c36cff',life:.42,maxLife:.42});spawnWord(player.x,player.y-92,'CURSE SHATTERED!','#e2a0ff');}
  if(player.braced)amount*=player.braceDamageMultiplier;
  amount=Math.max(1,Math.round(amount*player.damageTakenMultiplier));
  if (player.wildHeartTime > 0) amount = Math.max(1, Math.round(amount * (1 - ABILITIES.wildHeart.damageReduction)));
  amount=Math.min(amount,incomingDamageLimit({maxHealth:player.maxHealth,kind,chapterIndex,difficultyId:selectedDifficulty}));
  const wardDamage=Math.min(player.spiritShield||0,amount);player.spiritShield=Math.max(0,(player.spiritShield||0)-wardDamage);const healthDamage=Math.max(0,amount-wardDamage);player.health = Math.max(0, player.health - healthDamage);
  if(wardDamage>0){effects.rings.push({x:player.x,y:player.y,radius:42,maxRadius:78,color:'#72f0a0',life:.3,maxLife:.3});burst(player.x,player.y-8,'#9affc0',10,220,3);if(player.spiritShield<=0){player.shieldTime=0;spawnWord(player.x,player.y-82,'WARD BREAK!','#baffcf');playSfx('heavyImpact',.2,1.24);}}
  player.invulnerable = .72; player.flash = .22; player.hurtTime = .28; player.attack = null;
  if (stunDuration > 0 && healthDamage > 0) {
    player.stunTime = Math.max(player.stunTime, stunDuration);
    effects.rings.push({ x: player.x, y: player.y, radius: 16, maxRadius: 92, color: '#ffd33d', life: .55, maxLife: .55 });
    spawnWord(player.x, player.y - 72, 'STUNNED!', '#ffd33d');
  }
  const direction = normalize(player.x - source.x, player.y - source.y);
  player.vx=direction.x*460*player.knockbackResistance;player.vy=direction.y*460*player.knockbackResistance;
  camera.shake = 12; hitStop = .06;
  burst(player.x, player.y, '#ff334e', 20, 340, 5);
  effects.numbers.push({ x: player.x, y: player.y - 45, vx: 0, vy: -75, text: wardDamage&&!healthDamage?`WARD -${wardDamage}`:`-${healthDamage}`, color: wardDamage&&!healthDamage?'#9affc0':'#ff405d', life: .8, maxLife: .8, size: 30 });
  spawnWord(player.x + 20, player.y - 50, wardDamage&&!healthDamage?'BLOCK!':'BAM!', wardDamage&&!healthDamage?'#9affc0':'#ff3b57');
  playSfx(source?.boss||source?.def?.behavior==='boss'?'heavyImpact':'strike',source?.boss||source?.def?.behavior==='boss'?.42:.28,source?.boss||source?.def?.behavior==='boss'?.76:1);
  updateHud();
  if (player.health <= 0 && state==='dojo') {
    player.health=player.maxHealth;player.invulnerable=1.5;player.stunTime=0;spawnWord(player.x,player.y-78,'PRACTICE RESET','#72ef5b');
  } else if (player.health <= 0) {
    player.hurtTime = 99;
    setTimeout(() => endGame(false), 600);
  }
  return true;
}

function summonBossGuard(enemy, phase) {
  const bamboo=enemy.def.biome==='bamboo';const crimson=enemy.def.biome==='crimson';const storm=enemy.def.biome==='storm';const neon=enemy.def.biome==='neon';const shadow=enemy.def.biome==='shadow';
  const types=shadow
    ? phase===2?['shadowstepFerret','veilwingOwl','shadowstepFerret','veilwingOwl','gravebackBear','shadowstepFerret','veilwingOwl','shadowstepFerret']:['gravebackBear','veilwingOwl','shadowstepFerret','gravebackBear','veilwingOwl','shadowstepFerret','gravebackBear','veilwingOwl','shadowstepFerret','shadowstepFerret']
    : neon
    ? phase===2?['circuitJackal','pulsewingCrow','circuitJackal','pulsewingCrow','chromebackGorilla','circuitJackal','pulsewingCrow']:['chromebackGorilla','pulsewingCrow','circuitJackal','chromebackGorilla','pulsewingCrow','circuitJackal','pulsewingCrow','chromebackGorilla','circuitJackal']
    : storm
    ? phase===2?['tidebladeOtter','galecrestGull','tidebladeOtter','galecrestGull','reefbreakerWalrus','tidebladeOtter']:['reefbreakerWalrus','galecrestGull','tidebladeOtter','reefbreakerWalrus','galecrestGull','tidebladeOtter','galecrestGull','reefbreakerWalrus']
    : crimson
    ? phase===2?['emberAkita','gongwing','emberAkita','gongwing','mistclawLynx','ironhorn']:['gatewardenRhino','mistclawLynx','gongwing','emberAkita','gatewardenRhino','gongwing','mistclawLynx']
    : bamboo?phase===2?['bambooStalker','sporeArcher','bambooStalker','sporeArcher','bambooStalker']:['mossBrute','bambooStalker','powderkegToad','bambooStalker','mossBrute','powderkegToad']
    : phase===2?['jadeBrawler','spiritArcher','jadeBrawler','spiritArcher']:['armoredBoar','jadeBrawler','bellweaverCat','jadeBrawler','groveMinion','bellweaverCat'];
  const baseHealth=shadow?3.08:neon?2.68:storm?2.35:crimson?2.05:bamboo?1.82:1.65;const baseSpeed=shadow?2.18:neon?1.98:storm?1.82:crimson?1.68:bamboo?1.55:1.42;const baseDamage=shadow?2.58:neon?2.24:storm?1.98:crimson?1.72:bamboo?1.5:1.35;
  types.forEach((type,i)=>{const a=i/types.length*Math.PI*2;enemies.push(makeEnemy({type,x:enemy.x+Math.cos(a)*560,y:enemy.y+Math.sin(a)*350,delay:.25+i*.16,healthScale:baseHealth*enemy.healthScale,speedScale:baseSpeed*enemy.speedScale,damageScale:baseDamage*enemy.damageScale},enemies.length+i));});
  spawnWord(enemy.x,enemy.y-190,shadow?(phase===2?'SHADOW COURT!':'TEN THOUSAND SELVES!'):neon?(phase===2?'CORE LEGION!':'SYSTEM PURGE!'):storm?(phase===2?'STORM FLEET!':'SKY FURY!'):crimson?(phase===2?'WARHOST!':'SHOGUN FURY!'):bamboo?(phase===2?'MOON PACK!':'HOLLOW FURY!'):(phase===2?'SPIRIT GUARD!':'JADE FURY!'),enemy.def.color);
}

function bossDomainInterval(enemy,profile){
  const base=profile.domainIntervals?.[enemy.bossPhase]||999;const difficulty=selectedDifficulty==='ascension'?.78:selectedDifficulty==='nightmare'?.86:selectedDifficulty==='spirited'?1.14:1;return base*difficulty;
}

function triggerBossDomain(enemy,profile){
  const b=room.combatBounds;const crimson=enemy.def.id==='pyreclawShogun',moon=enemy.def.id==='moonfangKomainu',storm=enemy.def.id==='raijinKirin',neon=enemy.def.id==='daikyoOni',shadow=enemy.def.id==='tsukikoEmpress';enemy.domainCount=(enemy.domainCount||0)+1;
  if(shadow){const lead=.54;effects.biomePressures.push({type:'eclipseRift',x:clamp(player.x+player.vx*lead,b.x-b.radiusX*.8,b.x+b.radiusX*.8),y:clamp(player.y+player.vy*lead,b.y-b.radiusY*.78,b.y+b.radiusY*.78),radius:205+enemy.bossPhase*22,damage:Math.round((21+enemy.bossPhase*7)*enemy.damageScale),color:'#b84dff',life:.8,maxLife:.8,activeDuration:1.2,slow:.34,stage:'warning',triggered:false,index:enemy.domainCount});}
  else if(neon){const angle=Math.atan2(player.y-b.y,player.x-b.x)+(enemy.domainCount%2?Math.PI/2:Math.PI/4);effects.biomePressures.push({type:'firewallGrid',x:b.x,y:b.y,angle,width:98+enemy.bossPhase*16,length:b.radiusX*2.5,damage:Math.round((18+enemy.bossPhase*6)*enemy.damageScale),color:'#ff3ab8',life:.86,maxLife:.86,activeDuration:.96,stage:'warning',triggered:false,index:enemy.domainCount});}
  else if(storm){const angle=Math.atan2(player.y-b.y,player.x-b.x)+(enemy.domainCount%2?Math.PI/2:0)+.18;effects.biomePressures.push({type:'stormSurge',x:b.x,y:b.y,angle,width:105+enemy.bossPhase*15,length:b.radiusX*2.42,damage:Math.round((15+enemy.bossPhase*5)*enemy.damageScale),color:'#37dfff',life:.92,maxLife:.92,activeDuration:1.05,stage:'warning',triggered:false,index:enemy.domainCount});}
  else if(crimson){const angle=Math.atan2(player.y-b.y,player.x-b.x)+(enemy.domainCount%2?Math.PI/2:0);effects.biomePressures.push({type:'emberLane',x:b.x,y:b.y,angle,width:76+enemy.bossPhase*12,length:b.radiusX*2.25,damage:Math.round((10+enemy.bossPhase*4)*enemy.damageScale),color:'#ff5b27',life:1.05,maxLife:1.05,activeDuration:1.35,stage:'warning',triggered:false,index:enemy.domainCount});}
  else if(moon){const angle=enemy.domainCount*2.11,lane=.34+(enemy.domainCount%3)*.14;effects.biomePressures.push({type:'sporeBloom',x:b.x+Math.cos(angle)*b.radiusX*lane,y:b.y+Math.sin(angle)*b.radiusY*lane,radius:185+enemy.bossPhase*18,damage:Math.round((6+enemy.bossPhase*2)*enemy.damageScale),color:'#58f6d0',life:1.15,maxLife:1.15,activeDuration:3.8,slow:.36,stage:'warning',triggered:false,index:enemy.domainCount});}
  else{const lead=.36;effects.biomePressures.push({type:'bellEcho',x:clamp(player.x+player.vx*lead,b.x-b.radiusX*.74,b.x+b.radiusX*.74),y:clamp(player.y+player.vy*lead,b.y-b.radiusY*.74,b.y+b.radiusY*.74),radius:155+enemy.bossPhase*14,damage:Math.round((8+enemy.bossPhase*3)*enemy.damageScale),color:'#8cff39',life:1.2,maxLife:1.2,stage:'warning',triggered:false,index:enemy.domainCount});}
  spawnWord(enemy.x,enemy.y-212,profile.domainName,enemy.def.color);playSfx(shadow?'lightning':neon?'lightning':storm?'lightning':crimson?'fire':moon?'water':'lightning',.34,shadow?.58:neon?1.12:storm?.94:.78);
}

function updateBossDomain(enemy,profile,dt){
  if(enemy.bossPhase<2)return;enemy.domainClock=(Number.isFinite(enemy.domainClock)?enemy.domainClock:bossDomainInterval(enemy,profile))-dt;if(enemy.domainClock<=0){enemy.domainClock=bossDomainInterval(enemy,profile);triggerBossDomain(enemy,profile);}
}

function fireBossRadial(enemy,count){
  const bamboo=enemy.def.biome==='bamboo';const crimson=enemy.def.biome==='crimson';const neon=enemy.def.biome==='neon';const shadow=enemy.def.biome==='shadow';const speed=shadow?780:neon?690:crimson?610:bamboo?540:470;
  for(let i=0;i<count;i++){const angle=i/count*Math.PI*2+enemy.patternIndex*.19;effects.projectiles.push({x:enemy.x+Math.cos(angle)*95,y:enemy.y+Math.sin(angle)*70-42,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,radius:shadow?26:neon?24:crimson?22:bamboo?20:17,color:enemy.def.color,damage:Math.round(((shadow?30:neon?25:crimson?21:bamboo?17:14)+enemy.bossPhase*2)*enemy.damageScale),life:3.6,maxLife:3.6,boss:true,shadow});}
  burst(enemy.x,enemy.y-65,enemy.def.color,40,420,6);camera.shake=11;playSfx('heavyImpact',.34,.82);
}

function fireBossLanes(enemy){
  const aim=Math.atan2(player.y-enemy.y,player.x-enemy.x);const lanes=5+enemy.bossPhase*2;
  for(let i=0;i<lanes;i++){const offset=(i-(lanes-1)/2)*.14;const angle=aim+offset;effects.projectiles.push({x:enemy.x+Math.cos(angle)*115,y:enemy.y+Math.sin(angle)*82-35,vx:Math.cos(angle)*650,vy:Math.sin(angle)*650,radius:23,color:'#ff5b27',damage:Math.round((19+enemy.bossPhase*3)*enemy.damageScale),life:3.4,maxLife:3.4,boss:true,crimson:true,vfxFrame:4,impactFrame:5});for(let j=1;j<=3;j++){const x=enemy.x+Math.cos(angle)*j*120,y=enemy.y+Math.sin(angle)*j*120;effects.fireTrails.push({x,y,color:'#ff5b27',life:.85,maxLife:.85});effects.spriteEffects.push({asset:'crimsonCombatVfx',fixedFrame:4,x,y,width:240,height:135,life:.48,maxLife:.48,rotation:angle,glow:'#ff5b27'});}}
  effects.spriteEffects.push({asset:'crimsonCombatVfx',fixedFrame:5,x:enemy.x,y:enemy.y-20,width:430,height:430,life:.65,maxLife:.65,glow:'#ff5b27'});
  spawnWord(enemy.x,enemy.y-190,'BURNING LANES!','#ff7a2d');burst(enemy.x,enemy.y-60,'#ff5b27',48,460,7);camera.shake=15;playSfx('fire',.48,.76);
}

function fireBossCrossfire(enemy,profile){
  const target={x:enemy.patternTargetX,y:enemy.patternTargetY};let struck=false;
  for(let i=0;i<profile.crossfireLanes;i++){
    const angle=enemy.patternAngle+i*Math.PI/profile.crossfireLanes;
    const lineDistance=Math.abs((player.x-target.x)*Math.sin(angle)-(player.y-target.y)*Math.cos(angle));
    if(lineDistance<profile.crossfireWidth+player.radius)struck=true;
    for(let step=-2;step<=2;step++){
      const x=target.x+Math.cos(angle)*step*230,y=target.y+Math.sin(angle)*step*230;
      const neon=enemy.def.biome==='neon',shadow=enemy.def.biome==='shadow';effects.spriteEffects.push({asset:shadow?'shadowRealmVfx':neon?'neonCityVfx':enemy.def.biome==='crimson'?'crimsonCombatVfx':'shockImpactVfx',fixedFrame:shadow?2:neon?1:enemy.def.biome==='crimson'?4:3,x,y,width:shadow?320:neon?285:245,height:shadow?210:neon?180:150,life:.55,maxLife:.55,rotation:angle,glow:enemy.def.color});
    }
  }
  if(struck)hurtPlayer(Math.round((profile.crossfireDamage+enemy.bossPhase*3)*enemy.damageScale),enemy,.45);
  effects.rings.push({x:target.x,y:target.y,radius:20,maxRadius:profile.crossfireWidth*2.1,color:enemy.def.color,life:.5,maxLife:.5});
  burst(target.x,target.y,enemy.def.color,52,560,7);spawnWord(target.x,target.y-90,'SEAL BREAK!','#fff2a5');camera.shake=19;hitStop=.07;playSfx('heavyImpact',.42,.72);
}

function prepareBossSignature(enemy,profile){
  const b=room.combatBounds;const neon=enemy.def.id==='daikyoOni',shadow=enemy.def.id==='tsukikoEmpress';const lead=shadow?.78:neon?.7:enemy.def.id==='moonfangKomainu'?.48:enemy.def.id==='raijinKirin'?.62:.28;const count=shadow?6+enemy.bossPhase:neon?5+enemy.bossPhase:enemy.def.id==='raijinKirin'?4+enemy.bossPhase:enemy.def.id==='pyreclawShogun'?2+Math.floor(enemy.bossPhase/2):enemy.def.id==='moonfangKomainu'?3:1;
  enemy.signatureTargets=Array.from({length:count},(_,index)=>{
    if(enemy.def.id==='jadeguardTanuki')return {x:enemy.x,y:enemy.y+10,radius:430};
    const spread=index-(count-1)/2;const x=player.x+player.vx*lead+spread*(shadow?156:neon?170:enemy.def.id==='raijinKirin'?188:enemy.def.id==='pyreclawShogun'?205:175);const y=player.y+player.vy*lead+(index%2?(shadow?145:neon?130:115):(shadow?-90:neon?-70:-55));
    return {x:clamp(x,b.x-b.radiusX*.86,b.x+b.radiusX*.86),y:clamp(y,b.y-b.radiusY*.84,b.y+b.radiusY*.84),radius:shadow?168:neon?155:enemy.def.id==='raijinKirin'?148:enemy.def.id==='pyreclawShogun'?132:138};
  });
  const warningLife=enemy.stateTime+BOSS_PATTERNS.signature.action-BOSS_PATTERNS.signature.resolveAt;
  for(const target of enemy.signatureTargets)effects.guardianSignatures.push({x:target.x,y:target.y,radius:target.radius,row:profile.signatureRow,storm:enemy.def.id==='raijinKirin',neon,shadow,stage:0,life:warningLife,maxLife:warningLife,color:enemy.def.color,ownerId:enemy.id});
  spawnWord(enemy.x,enemy.y-205,profile.signatureName.toUpperCase(),enemy.def.color);playSfx(enemy.def.id==='pyreclawShogun'?'fire':enemy.def.id==='moonfangKomainu'?'water':'lightning',.42,neon?1.12:enemy.def.id==='raijinKirin'?.9:.76);
}

function resolveBossSignature(enemy,profile){
  const targets=enemy.signatureTargets||[{x:enemy.x,y:enemy.y,radius:360}];const jade=enemy.def.id==='jadeguardTanuki',moon=enemy.def.id==='moonfangKomainu',storm=enemy.def.id==='raijinKirin',neon=enemy.def.id==='daikyoOni',shadow=enemy.def.id==='tsukikoEmpress';
  if(jade){
    const count=14+enemy.bossPhase*4;for(let i=0;i<count;i++){const angle=i/count*Math.PI*2+enemy.patternIndex*.31;const gap=i%(enemy.bossPhase>=3?5:4)===0;if(gap)continue;effects.projectiles.push({x:enemy.x+Math.cos(angle)*115,y:enemy.y+Math.sin(angle)*82-38,vx:Math.cos(angle)*(440+enemy.bossPhase*45),vy:Math.sin(angle)*(440+enemy.bossPhase*45),radius:18,color:enemy.def.color,damage:Math.round(profile.signatureDamage*enemy.damageScale),life:3.2,maxLife:3.2,boss:true});}
  }else{
    let hit=false;for(const target of targets){if(distance(player,target)<target.radius+player.radius)hit=true;effects.rings.push({x:target.x,y:target.y,radius:24,maxRadius:target.radius,color:enemy.def.color,life:.56,maxLife:.56});burst(target.x,target.y,enemy.def.color,moon?36:48,moon?520:680,moon?6:8);}
    if(hit)hurtPlayer(Math.round(profile.signatureDamage*enemy.damageScale),enemy,moon ? .55 : .72);
  }
  effects.guardianSignatures=effects.guardianSignatures.filter((effect)=>effect.ownerId!==enemy.id);for(const target of targets)effects.guardianSignatures.push({x:target.x,y:target.y,radius:target.radius,row:profile.signatureRow,storm,neon,shadow,stage:1,life:.78,maxLife:.78,color:enemy.def.color,ownerId:enemy.id});
  camera.shake=Math.max(camera.shake,shadow?36:neon?32:jade?16:moon?20:storm?28:24);hitStop=Math.max(hitStop,.075);spawnWord(targets[0].x,targets[0].y-90,shadow?'MOON DEVOURS!':neon?'KERNEL CRASH!':jade?'BELLS BREAK!':moon?'MOON CLAWS!':storm?'HEAVEN SPLITS!':'ONI ERUPTS!',enemy.def.color);playSfx(shadow?'lightning':neon?'lightning':jade?'lightning':moon?'slice':storm?'lightning':'stomp',.52,shadow?.52:neon?.58:storm?.68:jade?.82:moon?.75:.68);
}

function updateBoss(enemy,dt){
  const bamboo=enemy.def.biome==='bamboo';const crimson=enemy.def.biome==='crimson';const storm=enemy.def.biome==='storm';const neon=enemy.def.biome==='neon';const shadow=enemy.def.biome==='shadow';const bossColor=enemy.def.color;const profile=BOSS_PROFILES[enemy.def.id];const sweepRange=profile.sweepRange;
  enemy.stateTime-=dt;enemy.contactCooldown=Math.max(0,(enemy.contactCooldown||0)-dt);enemy.counterTime=Math.max(0,(enemy.counterTime||0)-dt);if(enemy.counterTime<=0)enemy.counterAnnounced=false;
  const healthRatio=enemy.health/enemy.maxHealth;const nextPhase=healthRatio<=.33?3:healthRatio<=.67?2:1;
  if(nextPhase>enemy.bossPhase){enemy.bossPhase=nextPhase;enemy.domainClock=bossDomainInterval(enemy,profile)*.55;enemy.state='bossEnrage';enemy.stateTime=1.35;enemy.patternHit=false;player.ultimateFlash=.12;camera.shake=20;ui.bossPhase.textContent=profile.phaseNames[nextPhase];if(!enemy.phaseTriggered[nextPhase]){enemy.phaseTriggered[nextPhase]=true;summonBossGuard(enemy,nextPhase);}}
  updateBossDomain(enemy,profile,dt);
  const toPlayer=normalize(player.x-enemy.x,player.y-enemy.y);const dist=distance(enemy,player);enemy.facing=approachAngle(enemy.facing,Math.atan2(toPlayer.y,toPlayer.x),clamp(dt*4,0,1));
  if(dist<enemy.radius+player.radius+8&&enemy.contactCooldown<=0){enemy.contactCooldown=1.1;hurtPlayer(Math.round(enemy.def.contactDamage*.65*enemy.damageScale),enemy);}
  if(enemy.state==='enter'){enemy.vx*=.84;enemy.vy*=.84;if(enemy.stateTime<=0){enemy.state='bossIdle';enemy.stateTime=1.1;const entranceName=shadow?'TSUKIKO!':neon?'DAIKYO ONI!':enemy.def.id==='raijinKirin'?'RAIJIN KIRIN!':enemy.def.id==='pyreclawShogun'?'PYRECLAW!':enemy.def.id==='moonfangKomainu'?'MOONFANG!':'JADEGUARD!';spawnWord(enemy.x,enemy.y-180,entranceName,bossColor);}return;}
  if(enemy.state==='bossEnrage'){enemy.vx*=Math.exp(-10*dt);enemy.vy*=Math.exp(-10*dt);if(enemy.stateTime<=0){enemy.state='bossIdle';enemy.stateTime=.45;}return;}
  if(enemy.state==='bossWindupSweep'){enemy.vx*=Math.exp(-12*dt);enemy.vy*=Math.exp(-12*dt);if(enemy.stateTime<=0){enemy.state=BOSS_PATTERNS.sweep.actionState;enemy.stateTime=BOSS_PATTERNS.sweep.action;enemy.patternHit=false;playSfx('slice',.44,.7);}return;}
  if(enemy.state==='bossSweep'){
    if(!enemy.patternHit&&enemy.stateTime<=BOSS_PATTERNS.sweep.resolveAt){enemy.patternHit=true;const facing={x:Math.cos(enemy.facing),y:Math.sin(enemy.facing)};const toward=normalize(player.x-enemy.x,player.y-enemy.y);if(dist<sweepRange&&facing.x*toward.x+facing.y*toward.y>-.15)hurtPlayer(Math.round((profile.sweepDamage+enemy.bossPhase*4)*enemy.damageScale),enemy,.35);effects.spriteEffects.push({asset:shadow?'shadowRealmVfx':neon?'neonCityVfx':storm?'stormCoastVfx':crimson?'crimsonCombatVfx':'hammerSlamVfx',fixedFrame:shadow?0:neon?2:storm?2:crimson?0:undefined,x:enemy.x+facing.x*190,y:enemy.y+facing.y*125,width:shadow?980:neon?900:storm?820:crimson?760:bamboo?660:560,height:shadow?590:neon?520:storm?500:crimson?420:bamboo?370:330,life:.62,maxLife:.62,rotation:enemy.facing,glow:bossColor});camera.shake=16;hitStop=.06;}
    if(enemy.stateTime<=0){enemy.state='bossIdle';enemy.stateTime=guardianAttackTiming({baseRecovery:BOSS_PATTERNS.sweep.recovery,phase:enemy.bossPhase,difficultyId:selectedDifficulty}).recovery;}return;
  }
  if(enemy.state==='bossWindupSlam'){enemy.vx*=Math.exp(-14*dt);enemy.vy*=Math.exp(-14*dt);if(enemy.stateTime<=0){enemy.state=BOSS_PATTERNS.slam.actionState;enemy.stateTime=BOSS_PATTERNS.slam.action;enemy.patternHit=false;}return;}
  if(enemy.state==='bossSlam'){
    if(!enemy.patternHit&&enemy.stateTime<=BOSS_PATTERNS.slam.resolveAt){enemy.patternHit=true;effects.spriteEffects.push({asset:shadow?'shadowRealmVfx':neon?'neonCityVfx':storm?'stormCoastVfx':crimson?'crimsonCombatVfx':'hammerSlamVfx',fixedFrame:shadow?5:neon?5:storm?5:crimson?5:undefined,x:enemy.x,y:enemy.y+18,width:shadow?1050:neon?980:storm?920:crimson?760:bamboo?860:760,height:shadow?930:neon?900:storm?880:crimson?760:bamboo?590:520,life:.8,maxLife:.8,glow:bossColor});effects.rings.push({x:enemy.x,y:enemy.y,radius:40,maxRadius:enemy.def.slamRadius,color:shadow?'#b84dff':neon?'#ff3ab8':storm?'#37dfff':crimson?'#ff5b27':bamboo?'#41f5da':'#ff3b69',life:.65,maxLife:.65});if(dist<enemy.def.slamRadius+player.radius)hurtPlayer(Math.round((profile.slamDamage+enemy.bossPhase*4)*enemy.damageScale),enemy,enemy.def.stunDuration);camera.shake=22;hitStop=.08;playSfx(shadow||neon||storm?'lightning':'stomp',.58,shadow?.58:neon?.78:.68);}
    if(enemy.stateTime<=0){openBossCounter(enemy,profile,'slam');enemy.state='bossIdle';enemy.stateTime=guardianAttackTiming({baseRecovery:BOSS_PATTERNS.slam.recovery,phase:enemy.bossPhase,difficultyId:selectedDifficulty}).recovery;}return;
  }
  if(enemy.state==='bossChannel'){
    enemy.vx*=Math.exp(-10*dt);enemy.vy*=Math.exp(-10*dt);
    if(!enemy.patternHit&&enemy.stateTime<=BOSS_PATTERNS.channel.resolveAt){enemy.patternHit=true;if(crimson)fireBossLanes(enemy);else fireBossRadial(enemy,profile.radialBase+enemy.bossPhase*4);}
    if(enemy.stateTime<=0){openBossCounter(enemy,profile,'channel');enemy.state='bossIdle';enemy.stateTime=guardianAttackTiming({baseRecovery:BOSS_PATTERNS.channel.recovery,phase:enemy.bossPhase,difficultyId:selectedDifficulty}).recovery;}return;
  }
  if(enemy.state==='bossWindupCrossfire'){
    enemy.vx*=Math.exp(-13*dt);enemy.vy*=Math.exp(-13*dt);
    if(enemy.stateTime<=0){enemy.state=BOSS_PATTERNS.crossfire.actionState;enemy.stateTime=BOSS_PATTERNS.crossfire.action;enemy.patternHit=false;}
    return;
  }
  if(enemy.state==='bossCrossfire'){
    enemy.vx*=Math.exp(-13*dt);enemy.vy*=Math.exp(-13*dt);
    if(!enemy.patternHit&&enemy.stateTime<=BOSS_PATTERNS.crossfire.resolveAt){enemy.patternHit=true;fireBossCrossfire(enemy,profile);}
    if(enemy.stateTime<=0){openBossCounter(enemy,profile,'crossfire');enemy.state='bossIdle';enemy.stateTime=guardianAttackTiming({baseRecovery:BOSS_PATTERNS.crossfire.recovery,phase:enemy.bossPhase,difficultyId:selectedDifficulty}).recovery;}
    return;
  }
  if(enemy.state==='bossWindupSignature'){
    enemy.vx*=Math.exp(-13*dt);enemy.vy*=Math.exp(-13*dt);
    if(!enemy.signaturePrepared){enemy.signaturePrepared=true;prepareBossSignature(enemy,profile);}
    if(enemy.stateTime<=0){enemy.state=BOSS_PATTERNS.signature.actionState;enemy.stateTime=BOSS_PATTERNS.signature.action;enemy.patternHit=false;}
    return;
  }
  if(enemy.state==='bossSignature'){
    enemy.vx*=Math.exp(-13*dt);enemy.vy*=Math.exp(-13*dt);
    if(!enemy.patternHit&&enemy.stateTime<=BOSS_PATTERNS.signature.resolveAt){enemy.patternHit=true;resolveBossSignature(enemy,profile);}
    if(enemy.stateTime<=0){openBossCounter(enemy,profile,'signature');enemy.state='bossIdle';enemy.stateTime=guardianAttackTiming({baseRecovery:BOSS_PATTERNS.signature.recovery,phase:enemy.bossPhase,difficultyId:selectedDifficulty}).recovery;enemy.signaturePrepared=false;enemy.signatureTargets=null;}
    return;
  }
  const preferred=dist>420?1:dist<250?-1:0;enemy.vx=lerp(enemy.vx,toPlayer.x*enemy.def.speed*enemy.speedScale*preferred,clamp(dt*2.7,0,1));enemy.vy=lerp(enemy.vy,toPlayer.y*enemy.def.speed*enemy.speedScale*preferred,clamp(dt*2.7,0,1));enemy.x+=enemy.vx*dt;enemy.y+=enemy.vy*dt;keepInArena(enemy);
  if(enemy.stateTime<=0){const schedule=profile.schedules[enemy.bossPhase];const pattern=BOSS_PATTERNS[schedule[enemy.patternIndex++%schedule.length]];const tempo=profile.phaseTempo?.[enemy.bossPhase]||1;const timing=guardianAttackTiming({baseWindup:pattern.windup,baseRecovery:pattern.recovery,tempo,phase:enemy.bossPhase,difficultyId:selectedDifficulty});enemy.activePattern=pattern.id;enemy.state=pattern.windupState;enemy.patternWindup=timing.windup;enemy.patternRecovery=timing.recovery;enemy.stateTime=enemy.patternWindup;enemy.patternHit=false;if(pattern.id==='crossfire'){enemy.patternTargetX=player.x;enemy.patternTargetY=player.y;enemy.patternAngle=Math.atan2(player.y-enemy.y,player.x-enemy.x)+enemy.bossPhase*.17;}if(pattern.id==='signature'){enemy.signaturePrepared=false;enemy.signatureTargets=null;}}
}

function openBossCounter(enemy,profile,pattern){
  if(profile.counterPattern!==pattern||enemy.dead)return;enemy.counterTime=profile.counterDuration;enemy.counterAnnounced=true;
  spawnWord(enemy.x,enemy.y-190,profile.counterName, '#ffe36a');effects.rings.push({x:enemy.x,y:enemy.y,radius:enemy.radius*.55,maxRadius:enemy.radius*1.75,color:'#ffe36a',life:.5,maxLife:.5});playSfx('upgrade',.22,1.18);
}

const BOSS_PATTERN_CUES={
  sweep:'CROSS BEHIND THE WEAPON',slam:'LEAVE THE MARKED RING',channel:'FIND THE OPEN PROJECTILE LANE',crossfire:'ESCAPE DIAGONALLY BEFORE IMPACT'
};

function updateBossReadout(boss,profile){
  const counter=boss.counterTime>0,phaseShift=boss.state==='bossEnrage';const pattern=BOSS_PATTERNS[boss.activePattern];
  ui.bossPanel.classList.toggle('counter-open',counter);ui.bossPanel.classList.toggle('phase-shift',phaseShift);
  if(counter){ui.bossIntentKicker.textContent='BREAK WINDOW';ui.bossIntentName.textContent=profile.counterName;ui.bossIntentHint.textContent=`STRIKE NOW  ·  ${profile.counterMultiplier.toFixed(2)}x DAMAGE`;ui.bossIntentTime.textContent=`${boss.counterTime.toFixed(1)}s`;ui.bossIntentFill.style.width=`${clamp(boss.counterTime/profile.counterDuration*100,0,100)}%`;return;}
  if(phaseShift){ui.bossIntentKicker.textContent='PHASE SHIFT';ui.bossIntentName.textContent=profile.phaseNames[boss.bossPhase];ui.bossIntentHint.textContent='REPOSITION  ·  REINFORCEMENTS INBOUND';ui.bossIntentTime.textContent=`${Math.max(0,boss.stateTime).toFixed(1)}s`;ui.bossIntentFill.style.width=`${clamp(boss.stateTime/1.35*100,0,100)}%`;return;}
  if(pattern&&boss.state!=='bossIdle'&&boss.state!=='enter'){
    const warning=boss.state.startsWith('bossWindup')||(boss.state==='bossChannel'&&!boss.patternHit);const name=pattern.id==='signature'?profile.signatureName:pattern.name;
    ui.bossIntentKicker.textContent=warning?'INCOMING ATTACK':'GUARDIAN COMMITTED';ui.bossIntentName.textContent=name.toUpperCase();ui.bossIntentHint.textContent=pattern.id==='signature'?profile.signatureDescription.toUpperCase():BOSS_PATTERN_CUES[pattern.id];ui.bossIntentTime.textContent=warning?`${Math.max(0,boss.stateTime).toFixed(1)}s`:'MOVE';ui.bossIntentFill.style.width=warning?`${clamp(boss.stateTime/(boss.patternWindup||pattern.windup)*100,0,100)}%`:'100%';return;
  }
  ui.bossIntentKicker.textContent='READ THE GUARDIAN';ui.bossIntentName.textContent='REPOSITIONING';ui.bossIntentHint.textContent='WATCH THE WEAPON  ·  KEEP AN ESCAPE LANE';ui.bossIntentTime.textContent='';ui.bossIntentFill.style.width='0%';
}

function summonBellweaverGuard(enemy){
  const owned=enemies.filter((candidate)=>!candidate.dead&&candidate.summonOwnerId===enemy.id).length;
  const count=Math.max(0,Math.min(enemy.def.summonCount||2,4-owned));
  if(count<=0)return false;
  enemy.summonCharges=Math.max(0,enemy.summonCharges-1);
  for(let i=0;i<count;i++){
    const angle=enemy.facing+(i-(count-1)/2)*1.28+Math.PI;
    const radius=72+i*12;
    const child=makeEnemy({type:'groveMinion',x:enemy.x+Math.cos(angle)*radius,y:enemy.y+Math.sin(angle)*radius*.72,delay:.16+i*.14,healthScale:enemy.healthScale*.62,speedScale:enemy.speedScale*1.08,damageScale:enemy.damageScale*.74,summoned:true,summonOwnerId:enemy.id},enemies.length+i);
    enemies.push(child);
  }
  spawnWord(enemy.x,enemy.y-92,'BELLS AWAKEN!','#65ffc8');
  effects.rings.push({x:enemy.x,y:enemy.y+8,radius:28,maxRadius:188,color:'#57f2b4',life:.7,maxLife:.7});
  effects.spriteEffects.push({asset:'specialEnemyVfx',fixedFrame:1,x:enemy.x,y:enemy.y+10,width:275,height:210,life:.72,maxLife:.72,glow:'#57f2b4'});
  burst(enemy.x,enemy.y-12,'#57f2b4',28,320,5);playSfx('upgrade',.22,1.2);return true;
}

function throwPowderkegBomb(enemy){
  const bounds=room.combatBounds;const lead=.34;
  const x=clamp(player.x+player.vx*lead,bounds.x-bounds.radiusX*.9,bounds.x+bounds.radiusX*.9);
  const y=clamp(player.y+player.vy*lead,bounds.y-bounds.radiusY*.9,bounds.y+bounds.radiusY*.9);
  const fuse=enemy.def.bombFuse||1.05;
  effects.enemyHazards.push({x,y,radius:enemy.def.bombRadius||148,damage:Math.round(enemy.def.contactDamage*enemy.damageScale),color:enemy.def.color,life:fuse,maxLife:fuse,triggerAt:.1,triggered:false,type:'bomb',ownerId:enemy.id});
  effects.rings.push({x,y,radius:10,maxRadius:48,color:'#ff9a31',life:.32,maxLife:.32});
  spawnWord(enemy.x,enemy.y-82,'BOMB AWAY!','#ffad35');burst(enemy.x,enemy.y-24,'#ff9a31',18,260,4);playSfx('strike',.18,.86);
}

function updateEnemies(dt) {
  if(!encounter.bossActive)encounter.waveTime=(encounter.waveTime||0)+dt;
  const campaignPressure=campaignPressureCurve({chapterIndex,waveIndex:Math.max(0,encounter.wave),elapsed:encounter.waveTime||0,difficultyId:selectedDifficulty});
  const alive = enemies.filter((enemy) => !enemy.dead);
  const activeCombatants=alive.filter((enemy)=>enemy.state!=='waiting');
  let activationSlots=Math.max(0,activeEnemyLimit()-activeCombatants.length);
  for (const enemy of enemies) {
    const definition = enemy.def;
    enemy.flash = Math.max(0, enemy.flash - dt);
    enemy.abilityReactTime=Math.max(0,(enemy.abilityReactTime||0)-dt);
    enemy.elementalRuptureCooldown=Math.max(0,(enemy.elementalRuptureCooldown||0)-dt);
    enemy.hitReactTime=Math.max(0,(enemy.hitReactTime||0)-dt);
    enemy.cooldown = Math.max(0, enemy.cooldown - dt*campaignPressure.attackTempo);
    enemy.bob += dt * 5;
    if(enemy.tutorialDormant){enemy.vx*=Math.exp(-12*dt);enemy.vy*=Math.exp(-12*dt);continue;}
    if (enemy.state === 'waiting') {
      enemy.stateTime -= dt*campaignPressure.reserveRate;
      if (enemy.stateTime <= 0 && activationSlots > 0) {
        enemy.state = 'enter'; enemy.stateTime = enemy.spawnDuration||1.35;
        activationSlots--;activeCombatants.push(enemy);
        effects.rings.push({ x: enemy.x, y: enemy.y, radius: 12, maxRadius: 84 * enemy.def.scale, color: enemy.def.color, life: .6, maxLife: .6 });
        burst(enemy.x, enemy.y, enemy.def.color, 16, 190, 4);
      }
      continue;
    }
    if (enemy.dead) {
      enemy.deathTime -= dt;
      enemy.x += enemy.vx * dt; enemy.y += enemy.vy * dt;
      enemy.vx *= Math.exp(-5 * dt); enemy.vy *= Math.exp(-5 * dt);
      continue;
    }
    enemy.bleedAnnounce=Math.max(0,(enemy.bleedAnnounce||0)-dt);
    if (enemy.burnTime > 0) {
      enemy.burnTime = Math.max(0, enemy.burnTime - dt);
      enemy.burnTick -= dt;
      if (enemy.burnTick <= 0) {
        const burnDamage=Math.max(1,Math.round(ABILITIES.foxfireVolley.burnDamage*(enemy.burnPower||1)*(enemy.practiceArmor??1)*(enemy.eliteId?player.eliteDamageMultiplier:1)));recordDojoDamage(enemy,burnDamage);
        const resolved=resolveEnemyDamage(enemy,burnDamage,null,{consumeCurse:false});enemy.flash=Math.max(enemy.flash,.08);enemy.burnTick=.5;
        burst(enemy.x, enemy.y - 8, ABILITIES.foxfireVolley.color, 7, 130, 3);
        effects.numbers.push({x:enemy.x,y:enemy.y-34,vx:0,vy:-62,text:resolved.shieldDamage&&!resolved.healthDamage?String(Math.round(resolved.total)):String(burnDamage),color:resolved.shieldDamage?'#9aff8b':'#ff8a38',life:.55,maxLife:.55,size:18});
        if (enemy.health <= 0) { killEnemy(enemy, normalize(enemy.x-player.x, enemy.y-player.y)); continue; }
      }
    }
    if(enemy.bleedTime>0){enemy.bleedTime=Math.max(0,enemy.bleedTime-dt);enemy.bleedTick-=dt;if(enemy.bleedTick<=0){const moving=Math.hypot(enemy.vx||0,enemy.vy||0)>42,bleedDamage=Math.max(1,Math.round((3+player.upgradeRanks.razorFang*1.5)*(enemy.bleedPower||1)*(moving?1.75:1)*(enemy.practiceArmor??1)*(enemy.eliteId?player.eliteDamageMultiplier:1)));recordDojoDamage(enemy,bleedDamage);const resolved=resolveEnemyDamage(enemy,bleedDamage,null,{consumeCurse:false});enemy.bleedTick=moving?.46:.72;enemy.flash=Math.max(enemy.flash,.08);enemy.abilityReactType='bleed';enemy.abilityReactTime=Math.max(enemy.abilityReactTime||0,.36);burst(enemy.x,enemy.y-8,'#ff365f',7,145,3);effects.numbers.push({x:enemy.x,y:enemy.y-34,vx:0,vy:-62,text:resolved.shieldDamage&&!resolved.healthDamage?String(Math.round(resolved.total)):String(bleedDamage),color:resolved.shieldDamage?'#9aff8b':'#ff526f',life:.55,maxLife:.55,size:18});if(enemy.health<=0){killEnemy(enemy,normalize(enemy.x-player.x,enemy.y-player.y));continue;}}}
    enemy.wetTime = Math.max(0, enemy.wetTime - dt);
    enemy.shockTime = Math.max(0, enemy.shockTime - dt);
    enemy.curseTime=Math.max(0,(enemy.curseTime||0)-dt);if(enemy.curseTime<=0)enemy.curseMultiplier=1;
    enemy.shieldTime=Math.max(0,(enemy.shieldTime||0)-dt);if(enemy.shieldTime<=0&&enemy.def.behavior!=='shield'){enemy.shield=0;enemy.maxShield=0;}
    enemy.chillTime=Math.max(0,(enemy.chillTime||0)-dt);if(enemy.chillTime<=0)enemy.chillStacks=0;
    enemy.freezeTime=Math.max(0,(enemy.freezeTime||0)-dt);if(enemy.freezeTime>0){enemy.vx*=Math.exp(-18*dt);enemy.vy*=Math.exp(-18*dt);continue;}
    enemy.stunTime=Math.max(0,(enemy.stunTime||0)-dt);if(enemy.stunTime>0){enemy.vx*=Math.exp(-16*dt);enemy.vy*=Math.exp(-16*dt);continue;}
    enemy.huntTime = Math.max(0, (enemy.huntTime||0) - dt);
    enemy.conductiveTime=Math.max(0,(enemy.conductiveTime||0)-dt);if(enemy.conductiveTime<=0)enemy.conductiveStacks=0;
    if(definition.behavior==='shield'&&enemy.shield<=0&&enemy.maxShield>0){enemy.guardCooldown=Math.max(0,enemy.guardCooldown-dt);if(enemy.guardCooldown<=0){enemy.shield=enemy.maxShield;spawnWord(enemy.x,enemy.y-84,'GUARD RESTORED!','#ff6a48');effects.rings.push({x:enemy.x,y:enemy.y,radius:24,maxRadius:118,color:definition.color,life:.42,maxLife:.42});}}
    if(enemy.practice&&!dojoState.aggressive){enemy.state='practice';enemy.stateTime=99;enemy.vx*=Math.exp(-12*dt);enemy.vy*=Math.exp(-12*dt);enemy.facing=approachAngle(enemy.facing,Math.atan2(player.y-enemy.y,player.x-enemy.x),clamp(dt*7,0,1));continue;}
    if(definition.behavior==='boss'){updateBoss(enemy,dt);continue;}
    const toPlayer = normalize(player.x - enemy.x, player.y - enemy.y);
    const dist = distance(enemy, player);
    enemy.facing = approachAngle(enemy.facing, Math.atan2(toPlayer.y, toPlayer.x), clamp(dt * 9, 0, 1));
    enemy.stateTime -= dt;

    if (enemy.state === 'enter') {
      enemy.vx *= .88; enemy.vy *= .88;
      if (enemy.stateTime <= 0) {
        enemy.state = 'chase';
        effects.rings.push({ x: enemy.x, y: enemy.y, radius: 18, maxRadius: 72 * definition.scale, color: definition.color, life: .34, maxLife: .34 });
        burst(enemy.x, enemy.y, definition.color, 12, 180, 3);
      }
    } else if (enemy.state === 'stagger') {
      enemy.vx *= Math.exp(-5.5 * dt); enemy.vy *= Math.exp(-5.5 * dt);
      if (enemy.stateTime <= 0) enemy.state = 'chase';
    } else if (enemy.state === 'windup') {
      enemy.vx *= Math.exp(-13 * dt); enemy.vy *= Math.exp(-13 * dt);
      if (enemy.stateTime <= 0) {
        if(definition.behavior==='assassin'){
          burst(enemy.x,enemy.y-12,'#bd58ff',24,330,5);enemy.x=enemy.blinkX??enemy.x;enemy.y=enemy.blinkY??enemy.y;keepInArena(enemy);const strikeDirection=normalize(player.x-enemy.x,player.y-enemy.y);enemy.facing=Math.atan2(strikeDirection.y,strikeDirection.x);enemy.state='strike';enemy.stateTime=.4;enemy.hitPlayer=false;enemy.vx=strikeDirection.x*definition.strikeSpeed;enemy.vy=strikeDirection.y*definition.strikeSpeed;effects.rings.push({x:enemy.x,y:enemy.y,radius:10,maxRadius:86,color:definition.color,life:.28,maxLife:.28});spawnWord(enemy.x,enemy.y-70,'MIST STEP!','#d678ff');
        } else if(definition.behavior==='summoner'){
          if(enemy.summonCharges>0&&summonBellweaverGuard(enemy)){enemy.state='recover';enemy.stateTime=.72;enemy.cooldown=definition.attackCooldown*enemy.attackCooldownScale;}
          else{fireEnemyProjectile(enemy,toPlayer);enemy.state='recover';enemy.stateTime=.48;enemy.cooldown=definition.attackCooldown*.62*enemy.attackCooldownScale;}
        } else if(definition.behavior==='bomber'){
          throwPowderkegBomb(enemy);enemy.state='recover';enemy.stateTime=.58;enemy.cooldown=definition.attackCooldown*enemy.attackCooldownScale;
        } else if(definition.behavior==='conductor'){
          castTidechantSurge(enemy);enemy.state='recover';enemy.stateTime=.72;enemy.cooldown=definition.attackCooldown*enemy.attackCooldownScale;
        } else if(definition.behavior==='hacker'){
          plantKernelSnare(enemy);enemy.state='recover';enemy.stateTime=.66;enemy.cooldown=definition.attackCooldown*enemy.attackCooldownScale;
        } else if(definition.behavior==='curser'){
          castMoonveilCurse(enemy);enemy.state='recover';enemy.stateTime=.58;enemy.cooldown=definition.attackCooldown*enemy.attackCooldownScale;
        } else if (definition.behavior === 'ranged') {
          fireEnemyProjectile(enemy, toPlayer);
          enemy.state='recover';enemy.stateTime=.4;enemy.cooldown=definition.attackCooldown*enemy.attackCooldownScale;
        } else if (definition.behavior === 'heavy') {
          enemy.state = 'slam'; enemy.stateTime = .52; enemy.slamResolved = false; enemy.vx = 0; enemy.vy = 0;
        } else {
          enemy.state = 'strike'; enemy.stateTime = .38; enemy.hitPlayer = false;
          const speed = definition.behavior === 'basic' ? 165 : definition.behavior==='shield' ? 640 : 720;
          enemy.vx = Math.cos(enemy.facing) * speed; enemy.vy = Math.sin(enemy.facing) * speed;
          if(definition.behavior!=='shield'){const shadow=definition.biome==='shadow',neon=definition.biome==='neon';effects.spriteEffects.push({asset:shadow?'shadowRealmVfx':neon?'neonCityVfx':definition.biome==='crimson'?'crimsonCombatVfx':'clawSlashVfx',fixedFrame:shadow?0:neon?0:definition.biome==='crimson'?0:undefined,x:enemy.x+Math.cos(enemy.facing)*62,y:enemy.y+Math.sin(enemy.facing)*62-16,width:shadow?300:neon?265:definition.biome==='crimson'?240:definition.behavior==='basic'?135:190,height:shadow?190:neon?175:definition.biome==='crimson'?160:definition.behavior==='basic'?90:124,life:.38,maxLife:.38,rotation:enemy.facing,glow:definition.color});}
        }
      }
    } else if (enemy.state === 'slam') {
      enemy.vx *= Math.exp(-15 * dt); enemy.vy *= Math.exp(-15 * dt);
      if (!enemy.slamResolved && enemy.stateTime <= .3) {
        enemy.slamResolved = true;
        const radius = definition.slamRadius;
        const shadow=definition.biome==='shadow',neon=definition.biome==='neon';effects.spriteEffects.push({asset:shadow?'shadowRealmVfx':neon?'neonCityVfx':definition.biome==='crimson'?'crimsonCombatVfx':'hammerSlamVfx',fixedFrame:shadow?4:neon?2:definition.biome==='crimson'?3:undefined,x:enemy.x,y:enemy.y+14,width:shadow?radius*3.2:neon?radius*2.75:definition.biome==='crimson'?radius*3.15:radius*2.8,height:shadow?radius*2.75:neon?radius*2.3:definition.biome==='crimson'?radius*2.55:radius*2.2,life:.58,maxLife:.58,glow:definition.color});
        burst(enemy.x, enemy.y + 12, '#ff9a24', 22, 390, 5);
        camera.shake = Math.max(camera.shake, 13); hitStop = Math.max(hitStop, .065); playSfx('stomp',definition.behavior==='heavy'?.42:.31,definition.behavior==='heavy'?.82:1);
        if (dist < radius + player.radius) hurtPlayer(Math.round(definition.contactDamage*enemy.damageScale), enemy, definition.stunDuration);
      }
      if(enemy.stateTime<=0){enemy.state='recover';enemy.stateTime=.7;enemy.cooldown=definition.attackCooldown*enemy.attackCooldownScale;}
    } else if (enemy.state === 'strike') {
      if (!enemy.hitPlayer && dist < enemy.radius + player.radius + 12) {
        enemy.hitPlayer = true;const healthBefore=player.health;hurtPlayer(Math.round(definition.contactDamage*enemy.damageScale), enemy,definition.behavior==='shield'?definition.stunDuration:0);if(definition.behavior==='assassin'&&player.health<healthBefore){applyPlayerStatus('bleed',3.8,1+chapterIndex*.12);spawnWord(player.x,player.y-82,'SPIRIT WOUND!','#ff526f');}
        if(definition.behavior==='shield'){effects.rings.push({x:player.x,y:player.y,radius:14,maxRadius:96,color:definition.color,life:.34,maxLife:.34});effects.spriteEffects.push({asset:'specialEnemyVfx',fixedFrame:5,x:player.x,y:player.y-18,width:210,height:165,life:.38,maxLife:.38,rotation:enemy.facing,glow:definition.color});burst(player.x,player.y-16,definition.color,24,390,6);spawnWord(player.x,player.y-76,'SHIELD BASH!','#ff684d');}
      }
      enemy.vx *= Math.exp(-(definition.behavior === 'heavy' ? 1.45 : 2.2) * dt);
      enemy.vy *= Math.exp(-(definition.behavior === 'heavy' ? 1.45 : 2.2) * dt);
      if(enemy.stateTime<=0){enemy.state='recover';enemy.stateTime=.38;enemy.cooldown=definition.attackCooldown*enemy.attackCooldownScale;}
    } else if (enemy.state === 'recover') {
      enemy.vx *= Math.exp(-10 * dt); enemy.vy *= Math.exp(-10 * dt);
      enemy.stateTime-=dt*(1/campaignPressure.recovery-1);
      if (enemy.stateTime <= 0) enemy.state = 'chase';
    } else {
      const canAttack = ['ranged','summoner','bomber','assassin','conductor','hacker','curser'].includes(definition.behavior) ? dist < definition.attackRange : dist <= definition.attackRange + player.radius;
      if (canAttack && enemy.cooldown <= 0) {
        enemy.state='windup';enemy.stateTime=Math.max(definition.windup*enemy.windupScale,enemyTelegraphFloor({behavior:definition.behavior,difficultyId:selectedDifficulty,boss:definition.behavior==='boss'}));
        if(definition.behavior==='assassin'){const through=normalize(player.x-enemy.x,player.y-enemy.y);enemy.blinkX=player.x+through.x*definition.blinkOffset;enemy.blinkY=player.y+through.y*definition.blinkOffset;}
      } else {
        enemy.orbitAngle += enemy.orbitDrift * dt * (['ranged','summoner','bomber','assassin','conductor','hacker','curser'].includes(definition.behavior) ? .18 : .11);
        const rallyDistance=Math.max(620,enemy.orbitRadius*1.55),rallying=chapterIndex>0&&dist>rallyDistance;
        const hunting=enemy.huntTime>0||rallying;
        const pursuitLane=Math.max(90,Math.min(enemy.orbitRadius,260));
        const orbitTarget = hunting ? {x:player.x+Math.cos(enemy.orbitAngle)*pursuitLane,y:player.y+Math.sin(enemy.orbitAngle)*pursuitLane*.72} : {
          x: player.x + Math.cos(enemy.orbitAngle) * enemy.orbitRadius,
          y: player.y + Math.sin(enemy.orbitAngle) * enemy.orbitRadius * .72
        };
        const toOrbit = normalize(orbitTarget.x - enemy.x, orbitTarget.y - enemy.y);
        const orbitDistance = distance(enemy, orbitTarget);
        const statusSpeed = (enemy.wetTime > 0 ? 1 - ABILITIES.undertowWell.slow : 1)*(1-(enemy.chillStacks||0)*.12);
        const pursuitBoost=rallying?campaignPressure.pursuit:hunting?1.18:1;
        const desiredSpeed=definition.speed*enemy.speedScale*statusSpeed*pursuitBoost*clamp(orbitDistance/65,.38,1.15);const speed=Math.min(desiredSpeed,enemySpeedCeiling({playerWalkSpeed:heroDef.speed*Math.sqrt(player.speedMultiplier),behavior:definition.behavior,hunting,difficultyId:selectedDifficulty}));
        enemy.vx = lerp(enemy.vx, toOrbit.x * speed, clamp(dt * 5.5, 0, 1));
        enemy.vy = lerp(enemy.vy, toOrbit.y * speed, clamp(dt * 5.5, 0, 1));
      }
    }

    enemy.x += enemy.vx * dt; enemy.y += enemy.vy * dt;
    keepInArena(enemy);
  }
  resolveEnemyCrowding(activeCombatants,dt);
  updateEnemyProjectiles(dt);
  updateRoomMission(dt);
  const activeCount = alive.filter((enemy) => enemy.state !== 'waiting').length;
  const incomingCount = alive.length - activeCount;
  if(debugSystem){const activeEnemies=alive.filter((enemy)=>enemy.state!=='waiting'),peakEnemySpeed=activeEnemies.reduce((peak,enemy)=>Math.max(peak,Math.hypot(enemy.vx,enemy.vy)),0),peakHit=activeEnemies.reduce((peak,enemy)=>Math.max(peak,(enemy.def.contactDamage||0)*enemy.damageScale),0),balance={playerWalk:heroDef.speed*player.speedMultiplier,playerSprint:heroDef.speed*player.speedMultiplier*1.58,peakEnemySpeed:Number(peakEnemySpeed.toFixed(1)),peakRawHit:Number(peakHit.toFixed(1)),standardHitCap:Number(incomingDamageLimit({maxHealth:player.maxHealth,kind:'standard',chapterIndex,difficultyId:selectedDifficulty}).toFixed(1)),bossHitCap:Number(incomingDamageLimit({maxHealth:player.maxHealth,kind:'boss',chapterIndex,difficultyId:selectedDifficulty}).toFixed(1))};window.__BRAWLPAWS_PRESSURE__={chapter:chapterIndex+1,wave:encounter.wave+1,active:activeCount,incoming:incomingCount,ceiling:activeEnemyLimit(),...campaignPressure};window.__BRAWLPAWS_BALANCE__=balance;Object.assign(document.documentElement.dataset,{pressureChapter:String(chapterIndex+1),pressureWave:String(encounter.wave+1),pressureActive:String(activeCount),pressureIncoming:String(incomingCount),pressureCeiling:String(activeEnemyLimit()),pressurePursuit:campaignPressure.pursuit.toFixed(2),pressureTempo:campaignPressure.attackTempo.toFixed(2),pressureReserve:campaignPressure.reserveRate.toFixed(2),balanceWalk:String(balance.playerWalk),balanceSprint:String(balance.playerSprint),balanceEnemyPeak:String(balance.peakEnemySpeed),balanceRawHit:String(balance.peakRawHit),balanceStandardCap:String(balance.standardHitCap),balanceBossCap:String(balance.bossHitCap)});}
  const volatileDanger=effects.enemyHazards.some((hazard)=>!hazard.triggered);
  const nearbyInteractable=nearestRoomInteractable();
  if(state==='playing'&&alive.length>0&&nearbyInteractable&&!encounter.bossActive)ui.objective.textContent=`PRESS E  ${nearbyInteractable.item.prompt}`;
  if (state === 'playing' && alive.length > 0 && clearDelay < 0 && !encounter.bossActive) ui.objective.textContent = missionObjectiveText(activeCount,incomingCount);
  if(state==='playing'&&alive.length>0&&nearbyInteractable&&!encounter.bossActive)ui.objective.textContent=`PRESS E  ${nearbyInteractable.item.prompt}`;
  if(state==='playing'&&alive.length===0&&volatileDanger&&!encounter.bossActive)ui.objective.textContent='ESCAPE THE VOLATILE CORE!';
  if(state==='playing'&&alive.length===0&&!volatileDanger&&!missionComplete()&&!encounter.bossActive)ui.objective.textContent=missionObjectiveText(0,0);
  if(state==='playing'&&alive.length===0&&!volatileDanger&&roomInteractable&&!roomInteractable.used&&!encounter.bossActive)ui.objective.textContent=`CLAIM YOUR ROUTE REWARD  ${roomInteractable.prompt}`;
  if(state==='playing'&&alive.length===0&&!volatileDanger&&missionComplete()&&(!roomInteractable||roomInteractable.used)&&clearDelay<0&&!encounter.bossActive)beginWaveTransition();
}

function resolveEnemyCrowding(activeCombatants,dt){
  const bodies=activeCombatants.filter((enemy)=>!enemy.dead&&enemy.state!=='waiting'&&enemy.def.behavior!=='boss');
  const cellSize=190,neighborOffsets=[[-1,-1],[0,-1],[1,-1],[-1,0],[0,0],[1,0],[-1,1],[0,1],[1,1]];
  for(let pass=0;pass<2;pass++){
    const grid=new Map();
    for(let i=0;i<bodies.length;i++){const body=bodies[i],cx=Math.floor(body.x/cellSize),cy=Math.floor(body.y/cellSize),key=`${cx},${cy}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(i);}
    for(let i=0;i<bodies.length;i++){
      const a=bodies[i],cx=Math.floor(a.x/cellSize),cy=Math.floor(a.y/cellSize);
      for(const [ox,oy] of neighborOffsets)for(const j of grid.get(`${cx+ox},${cy+oy}`)||[]){if(j<=i)continue;
        const b=bodies[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);const angle=d>.01?Math.atan2(dy,dx):(a.id*2.3999632297+b.id*.73);const nx=Math.cos(angle),ny=Math.sin(angle);
        const heavyA=a.def.behavior==='heavy'||a.def.behavior==='shield',heavyB=b.def.behavior==='heavy'||b.def.behavior==='shield';const minimum=(a.radius+b.radius+24)*(heavyA||heavyB?1.2:1.08);if(d>=minimum)continue;
        const committedA=['windup','strike','slam'].includes(a.state),committedB=['windup','strike','slam'].includes(b.state);const overlap=minimum-Math.max(d,.01),settle=clamp(dt*18,.16,.62),weightA=heavyA?2.7:1,weightB=heavyB?2.7:1,total=weightA+weightB;
        const moveA=overlap*settle*(weightB/total)*(committedA?.18:1),moveB=overlap*settle*(weightA/total)*(committedB?.18:1);a.x-=nx*moveA;a.y-=ny*moveA;b.x+=nx*moveB;b.y+=ny*moveB;
        const closing=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(closing<0){const cancel=-closing*.42;a.vx-=nx*cancel*(weightB/total);a.vy-=ny*cancel*(weightB/total);b.vx+=nx*cancel*(weightA/total);b.vy+=ny*cancel*(weightA/total);}
      }
    }
  }
  for(const enemy of bodies)keepInArena(enemy);
}

function fireEnemyProjectile(enemy, direction) {
  const shadow=enemy.def.biome==='shadow';const neon=enemy.def.biome==='neon';const storm=enemy.def.biome==='storm';const crimson=enemy.def.biome==='crimson';const speed = shadow?810:neon?720:storm?640:crimson?560:enemy.def.biome==='bamboo'?485:410;const color=enemy.def.color||'#37e8ff';
  const muzzle = {x:enemy.x+direction.x*48,y:enemy.y+direction.y*48-16};
  effects.projectiles.push({ x: muzzle.x, y: muzzle.y, vx: direction.x * speed, vy: direction.y * speed, radius: shadow?20:neon?18:crimson?16:12, color, damage:Math.round((shadow?23:neon?19:storm?17:crimson?15:enemy.def.biome==='bamboo'?12:8)*enemy.damageScale), life: 2.1, maxLife: 2.1, shadow, neon, crimson });
  effects.spriteEffects.push({asset:shadow?'shadowRealmVfx':neon?'neonCityVfx':crimson?'crimsonCombatVfx':'spiritArrowImpactVfx',fixedFrame:shadow?1:neon?1:crimson?2:undefined,x:muzzle.x,y:muzzle.y,width:shadow?132:neon?112:crimson?82:66,height:shadow?96:neon?84:crimson?82:58,life:.16,maxLife:.16,rotation:Math.atan2(direction.y,direction.x),glow:color});
  burst(muzzle.x, muzzle.y, color, 16, 230, 3);
  playSfx(shadow?'lightning':neon?'lightning':crimson?'fire':'arrow',shadow?.24:neon?.23:crimson?.24:.18,shadow?.72:neon?1.24:crimson?1.18:.9);
}

function castTidechantSurge(enemy){
  const b=room.combatBounds,angle=Math.atan2(player.y-enemy.y,player.x-enemy.x);effects.biomePressures.push({type:'stormSurge',x:b.x,y:b.y,angle,width:enemy.def.surgeWidth,length:b.radiusX*2.42,damage:Math.round(enemy.def.surgeDamage*enemy.damageScale),color:enemy.def.color,life:.92,maxLife:.92,activeDuration:.82,stage:'warning',triggered:false,index:enemy.id});
  effects.spriteEffects.push({asset:'stormCoastVfx',fixedFrame:1,x:enemy.x+Math.cos(angle)*76,y:enemy.y+Math.sin(angle)*76-18,width:220,height:155,life:.42,maxLife:.42,rotation:angle,glow:enemy.def.color});spawnWord(enemy.x,enemy.y-82,'TIDECHANT!','#bffcff');playSfx('water',.3,1.08);
}

function plantKernelSnare(enemy){
  const lead=normalize(player.vx,player.vy),x=player.x+lead.x*105,y=player.y+lead.y*105;effects.enemyHazards.push({x,y,radius:enemy.def.snareRadius,damage:Math.round(enemy.def.snareDamage*enemy.damageScale),drain:enemy.def.snareDrain,color:enemy.def.color,life:1.15,maxLife:1.15,triggerAt:.12,triggered:false,type:'kernelSnare',ownerId:enemy.id});
  effects.spriteEffects.push({asset:'neonCityVfx',fixedFrame:1,x:enemy.x,y:enemy.y-20,width:195,height:150,life:.44,maxLife:.44,glow:enemy.def.color});spawnWord(enemy.x,enemy.y-78,'KERNEL SNARE!','#ff9bea');playSfx('lightning',.28,1.28);
}

function castMoonveilCurse(enemy){
  const direction=normalize(player.x-enemy.x,player.y-enemy.y),speed=760;effects.projectiles.push({x:enemy.x+direction.x*58,y:enemy.y+direction.y*58-18,vx:direction.x*speed,vy:direction.y*speed,radius:24,color:enemy.def.color,damage:Math.round(enemy.def.contactDamage*.42*enemy.damageScale),life:2.25,maxLife:2.25,shadow:true,curseDuration:enemy.def.curseDuration,curseMultiplier:enemy.def.curseMultiplier});
  effects.spriteEffects.push({asset:'shadowRealmVfx',fixedFrame:1,x:enemy.x+direction.x*64,y:enemy.y+direction.y*64-18,width:210,height:140,life:.38,maxLife:.38,rotation:Math.atan2(direction.y,direction.x),glow:enemy.def.color});spawnWord(enemy.x,enemy.y-82,'HOLLOW CURSE!','#ddb1ff');playSfx('lightning',.3,.68);
}

function updateEnemyProjectiles(dt) {
  for (const projectile of effects.projectiles) {
    projectile.life -= dt; projectile.x += projectile.vx * dt; projectile.y += projectile.vy * dt;
    if (projectile.life > 0 && distance(projectile, player) < projectile.radius + player.radius) {
      projectile.life = 0;const struck=hurtPlayer(projectile.damage||8, projectile);if(projectile.curseDuration&&struck&&player.health>0){applyPlayerStatus('curse',projectile.curseDuration,projectile.curseMultiplier||1.35);effects.rings.push({x:player.x,y:player.y,radius:18,maxRadius:98,color:'#c36cff',life:.58,maxLife:.58});spawnWord(player.x,player.y-88,'SPRINT TO CLEANSE!','#e6b9ff');} burst(projectile.x, projectile.y, projectile.color||'#37e8ff', 8, 210, 3);
      effects.spriteEffects.push({asset:projectile.shadow?'shadowRealmVfx':projectile.neon?'neonCityVfx':projectile.crimson?'crimsonCombatVfx':'spiritArrowImpactVfx',fixedFrame:projectile.shadow?2:projectile.neon?4:projectile.crimson?(projectile.impactFrame??2):undefined,x:projectile.x,y:projectile.y-10,width:projectile.shadow?240:projectile.neon?210:projectile.crimson?178:142,height:projectile.shadow?210:projectile.neon?190:projectile.crimson?178:126,life:.45,maxLife:.45,rotation:Math.atan2(projectile.vy,projectile.vx),glow:projectile.color||'#37e8ff'});
    }
  }
}

function keepInArena(entity) {
  const bounds = room.combatBounds;
  if(room.mapRuntime==='phaser-tiled'){
    entity.x=clamp(entity.x,entity.radius,room.width-entity.radius);entity.y=clamp(entity.y,entity.radius,room.height-entity.radius);
  }else{
    const nx = (entity.x - bounds.x) / bounds.radiusX;
    const ny = (entity.y - bounds.y) / bounds.radiusY;
    const length = Math.hypot(nx, ny);
    if (length > .96) {
      entity.x = bounds.x + (nx / length) * bounds.radiusX * .96;
      entity.y = bounds.y + (ny / length) * bounds.radiusY * .96;
      entity.vx *= .45; entity.vy *= .45;
    }
  }
  for (const prop of room.id==='jadeCourtyard'?props:[]) {
    if (!prop.radius) continue;
    const dx = entity.x - prop.x; const dy = entity.y - prop.y;
    const d = Math.hypot(dx, dy); const minimum = entity.radius + prop.radius;
    if (d > 0 && d < minimum) {
      entity.x = prop.x + dx / d * minimum; entity.y = prop.y + dy / d * minimum;
      entity.vx *= .55; entity.vy *= .55;
    }
  }
  for(const prop of destructibles){if(prop.broken)continue;const dx=entity.x-prop.x,dy=entity.y-prop.y,d=Math.hypot(dx,dy),minimum=entity.radius+prop.radius;if(d>0&&d<minimum){entity.x=prop.x+dx/d*minimum;entity.y=prop.y+dy/d*minimum;entity.vx*=.58;entity.vy*=.58;}}
  if(room.mapRuntime==='phaser-tiled')layeredMapRuntime.resolveCollision(entity);
}

function burst(x, y, color, count, speed, size) {
  const active=enemies?.filter?.((enemy)=>!enemy.dead&&enemy.state!=='waiting').length||0,pressure=active>48?.42:active>32?.62:active>20?.8:1;
  count=Math.max(2,Math.round(count*pressure));
  if(effects.particles.length>360)effects.particles.splice(0,effects.particles.length-320);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * (.25 + Math.random() * .75);
    effects.particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, color, size: size * (.45 + Math.random()), life: .25 + Math.random() * .35, maxLife: .6, drag: 3 + Math.random() * 4 });
  }
}

function spawnWord(x, y, text, color) {
  const now=performance.now();for(const [label,expires] of combatWordCooldowns)if(expires<=now)combatWordCooldowns.delete(label);
  if(effects.words.length>=4||combatWordCooldowns.has(text))return;
  combatWordCooldowns.set(text,now+420);
  effects.words.push({ x, y, text, color, life: .62, maxLife: .62, rotation: -.18 + (Math.random() - .5) * .18 });
}

function updateEffects(dt) {
  for (const particle of effects.particles) {
    particle.life -= dt; particle.x += particle.vx * dt; particle.y += particle.vy * dt;
    const drag = Math.exp(-particle.drag * dt); particle.vx *= drag; particle.vy *= drag;
  }
  for (const image of effects.afterimages) image.life -= dt;
  for (const number of effects.numbers) { number.life -= dt; number.x += number.vx * dt; number.y += number.vy * dt; number.vy += 55 * dt; }
  for (const word of effects.words) { word.life -= dt; word.y -= 18 * dt; }
  for (const ring of effects.rings) ring.life -= dt;
  for (const star of effects.stars) star.life -= dt;
  for (const bloom of effects.blooms) bloom.life -= dt;
  for (const trail of effects.fireTrails) trail.life -= dt;
  for (const effect of effects.spriteEffects) effect.life -= dt;
  for (const link of effects.shockLinks) link.life -= dt;
  for (const signature of effects.guardianSignatures) signature.life -= dt;
  for(const pressure of effects.biomePressures){
    pressure.life-=dt;
    if(pressure.stage==='warning'&&pressure.life<=0){pressure.stage='active';pressure.life=pressure.type==='bellEcho'?.7:pressure.activeDuration;pressure.maxLife=pressure.life;pressure.triggered=false;
      if(pressure.type==='bellEcho'){effects.rings.push({x:pressure.x,y:pressure.y,radius:18,maxRadius:pressure.radius,color:pressure.color,life:.5,maxLife:.5});burst(pressure.x,pressure.y-16,pressure.color,30,420,6);playSfx('lightning',.28,1.28);}
      else if(pressure.type==='sporeBloom'){effects.rings.push({x:pressure.x,y:pressure.y,radius:22,maxRadius:pressure.radius,color:pressure.color,life:.55,maxLife:.55});burst(pressure.x,pressure.y,pressure.color,28,260,5);playSfx('water',.22,.74);}
      else if(pressure.type==='eclipseRift'){effects.rings.push({x:pressure.x,y:pressure.y,radius:pressure.radius,maxRadius:28,color:pressure.color,life:.62,maxLife:.62});effects.spriteEffects.push({asset:'shadowRealmVfx',fixedFrame:3,x:pressure.x,y:pressure.y-28,width:pressure.radius*2.35,height:pressure.radius*1.75,life:.74,maxLife:.74,glow:pressure.color});burst(pressure.x,pressure.y-20,pressure.color,44,520,7);camera.shake=Math.max(camera.shake,14);playSfx('lightning',.38,.62);}
      else{camera.shake=Math.max(camera.shake,9);playSfx(pressure.type==='stormSurge'?'water':pressure.type==='firewallGrid'?'lightning':'fire',.32,pressure.type==='stormSurge'?1.05:pressure.type==='firewallGrid'?1.18:.82);}
    }
    if(pressure.stage!=='active')continue;
    if(pressure.type==='bellEcho'&&!pressure.triggered){pressure.triggered=true;const hit=distance(pressure,player)<pressure.radius+player.radius;if(hit)hurtPlayer(pressure.damage,pressure,.18);const count=8+Math.floor(encounter.wave/2)*2;for(let i=0;i<count;i++){const a=i/count*Math.PI*2+pressure.index*.27;effects.projectiles.push({x:pressure.x,y:pressure.y-14,vx:Math.cos(a)*(310+encounter.wave*30),vy:Math.sin(a)*(310+encounter.wave*30),radius:11,color:pressure.color,damage:Math.max(4,Math.round(pressure.damage*.7)),life:2.8,maxLife:2.8});}}
    else if(pressure.type==='sporeBloom'){if(distance(pressure,player)<pressure.radius+player.radius){player.vx*=Math.exp(-pressure.slow*8*dt);player.vy*=Math.exp(-pressure.slow*8*dt);pressure.tick=(pressure.tick||0)-dt;if(pressure.tick<=0){pressure.tick=.72;hurtPlayer(pressure.damage,pressure);}}}
    else if(pressure.type==='eclipseRift'){if(distance(pressure,player)<pressure.radius+player.radius){player.vx*=Math.exp(-pressure.slow*11*dt);player.vy*=Math.exp(-pressure.slow*11*dt);if(!pressure.triggered){pressure.triggered=true;hurtPlayer(pressure.damage,pressure,.32);effects.spriteEffects.push({asset:'shadowRealmVfx',fixedFrame:5,x:player.x,y:player.y-22,width:330,height:260,life:.58,maxLife:.58,glow:pressure.color});spawnWord(player.x,player.y-85,'SHADOW CAUGHT!',pressure.color);}}}
    else if(pressure.type==='emberLane'&&!pressure.triggered){pressure.triggered=true;const dx=player.x-pressure.x,dy=player.y-pressure.y,side=Math.abs(-Math.sin(pressure.angle)*dx+Math.cos(pressure.angle)*dy),along=Math.abs(Math.cos(pressure.angle)*dx+Math.sin(pressure.angle)*dy);if(side<pressure.width+player.radius&&along<pressure.length*.5)hurtPlayer(pressure.damage,pressure,.24);effects.fireTrails.push(...Array.from({length:15},(_,i)=>({x:pressure.x+Math.cos(pressure.angle)*(i-7)*pressure.length/14,y:pressure.y+Math.sin(pressure.angle)*(i-7)*pressure.length/14,color:pressure.color,life:.92,maxLife:.92})));}
    else if(pressure.type==='stormSurge'&&!pressure.triggered){pressure.triggered=true;const dx=player.x-pressure.x,dy=player.y-pressure.y,side=Math.abs(-Math.sin(pressure.angle)*dx+Math.cos(pressure.angle)*dy),along=Math.abs(Math.cos(pressure.angle)*dx+Math.sin(pressure.angle)*dy);if(side<pressure.width+player.radius&&along<pressure.length*.5)hurtPlayer(pressure.damage,pressure,.38);for(let i=-6;i<=6;i+=2)effects.spriteEffects.push({asset:'stormCoastVfx',fixedFrame:4,x:pressure.x+Math.cos(pressure.angle)*i*pressure.length/13,y:pressure.y+Math.sin(pressure.angle)*i*pressure.length/13,width:360,height:270,life:.76,maxLife:.76,rotation:pressure.angle-Math.PI/2,glow:pressure.color});camera.shake=Math.max(camera.shake,15);}
    else if(pressure.type==='firewallGrid'&&!pressure.triggered){pressure.triggered=true;const dx=player.x-pressure.x,dy=player.y-pressure.y,side=Math.abs(-Math.sin(pressure.angle)*dx+Math.cos(pressure.angle)*dy),along=Math.abs(Math.cos(pressure.angle)*dx+Math.sin(pressure.angle)*dy);if(side<pressure.width+player.radius&&along<pressure.length*.5)hurtPlayer(pressure.damage,pressure,.46);for(let i=-6;i<=6;i+=2)effects.spriteEffects.push({asset:'neonCityVfx',fixedFrame:4,x:pressure.x+Math.cos(pressure.angle)*i*pressure.length/13,y:pressure.y+Math.sin(pressure.angle)*i*pressure.length/13,width:340,height:310,life:.68,maxLife:.68,rotation:pressure.angle-Math.PI/2,glow:pressure.color});camera.shake=Math.max(camera.shake,17);}
  }
  for(const hazard of effects.enemyHazards){
    hazard.life-=dt;
    if(!hazard.triggered&&hazard.life<=(hazard.triggerAt??.16)){hazard.triggered=true;const bomb=hazard.type==='bomb',kernel=hazard.type==='kernelSnare';effects.rings.push({x:hazard.x,y:hazard.y,radius:24,maxRadius:hazard.radius,color:hazard.color,life:.44,maxLife:.44});burst(hazard.x,hazard.y,bomb?'#ffbd42':hazard.color,bomb?46:kernel?30:38,bomb?610:kernel?430:520,bomb?8:kernel?5:7);effects.spriteEffects.push({asset:bomb?'specialEnemyVfx':kernel?'neonCityVfx':'crimsonCombatVfx',fixedFrame:bomb?4:5,x:hazard.x,y:hazard.y,width:hazard.radius*2.65,height:hazard.radius*2.2,life:.58,maxLife:.58,glow:hazard.color});camera.shake=Math.max(camera.shake,bomb?18:kernel?10:15);hitStop=Math.max(hitStop,bomb ? .08 : .07);playSfx(bomb?'stomp':kernel?'lightning':'heavyImpact',bomb?.4:kernel?.3:.3,bomb?.8:kernel?1.12:.72);if(distance(hazard,player)<hazard.radius+player.radius){hurtPlayer(hazard.damage,hazard,bomb ? .4 : kernel?.28:.28);if(kernel){player.sprint=Math.max(0,player.sprint-hazard.drain);spawnWord(player.x,player.y-82,'SPRINT JAMMED!','#ff75df');}}}
  }
  for (const shot of effects.playerShots) {
    if((shot.spiritFeather||shot.hunterSeeker)&&shot.homingTarget&&!shot.homingTarget.dead){const toward=normalize(shot.homingTarget.x-shot.x,shot.homingTarget.y-shot.y),speed=Math.max(900,Math.hypot(shot.vx,shot.vy));shot.vx=lerp(shot.vx,toward.x*speed,clamp(dt*9,0,1));shot.vy=lerp(shot.vy,toward.y*speed,clamp(dt*9,0,1));}
    if((shot.glaive||shot.gale||shot.chakram)&&shot.returning){const owner=shot.remoteOwner||player,toward=normalize(owner.x-shot.x,owner.y-shot.y),speed=shot.returnSpeed||1120;shot.vx=lerp(shot.vx,toward.x*speed,clamp(dt*13,0,1));shot.vy=lerp(shot.vy,toward.y*speed,clamp(dt*13,0,1));}
    shot.life -= dt; shot.x += shot.vx * dt; shot.y += shot.vy * dt;
    if(shot.glaive&&!shot.returning&&shot.life<=0)turnGlaiveForReturn(shot);
    if(shot.gale&&!shot.returning&&shot.life<=0)turnGaleForReturn(shot);
    if(shot.chakram&&!shot.returning&&shot.life<=0)turnChakramForReturn(shot);
    if(shot.mortar&&shot.life<=0&&!shot.detonated){detonateMortar(shot);continue;}
    if((shot.glaive||shot.gale||shot.chakram)&&shot.returning){const owner=shot.remoteOwner||player;if(distance(shot,owner)<owner.radius+24){shot.life=0;effects.spriteEffects.push({asset:shot.chakram?'arsenalTier2Vfx':shot.gale?'arsenalReactionsVfx':'nomiGlaiveVfx',fixedFrame:shot.chakram?4:5,x:owner.x,y:owner.y-24,width:shot.chakram?190:shot.gale?165:138,height:shot.chakram?155:shot.gale?140:116,life:.34,maxLife:.34,glow:shot.chakram?'#d8ffff':shot.gale?'#67efff':'#b65cff'});effects.rings.push({x:owner.x,y:owner.y,radius:8,maxRadius:52,color:shot.chakram?'#5deeff':shot.gale?'#bffcff':'#aeefff',life:.25,maxLife:.25});if(!shot.remoteOwner)playSfx('impact',.13,1.52);continue;}}
    if(!damageRoomMissionObjects(shot))damageDestructibles(shot);
    for (const enemy of enemies) {
      if (shot.life <= 0 || enemy.dead || enemy.state==='waiting' || shot.hitIds?.has(enemy.id) || distance(shot, enemy) >= shot.radius + enemy.radius) continue;
      shot.hitIds?.add(enemy.id);hitEnemyWithShot(enemy, shot);
      if(shot.mortar){detonateMortar(shot);break;}
      if(redirectTrickshot(shot,enemy))continue;
      if((shot.pierces||0)>0){shot.pierces--;shot.damage*=.82;}else{shot.life=0;break;}
    }
  }
  for (const bolt of effects.flameBolts) {
    bolt.life -= dt; bolt.x += bolt.vx * dt; bolt.y += bolt.vy * dt;
    for (const enemy of enemies) {
      if (bolt.life <= 0 || enemy.dead || enemy.state==='waiting' || distance(bolt, enemy) >= bolt.radius + enemy.radius) continue;
      bolt.life = 0;
      const direction = normalize(bolt.vx, bolt.vy);const steamReady=enemy.wetTime>0&&player.synergies.has('steamBurst');
      damageEnemyFromAbility(enemy, Math.round(bolt.definition.damage*bolt.power), 230, direction, bolt.definition.color, null);
      applyEnemyStatus(enemy,'burn',bolt.definition.burnDuration,bolt.power);
      effects.fireTrails.push({x:bolt.x,y:bolt.y,radius:38,color:bolt.definition.color,life:.5,maxLife:.5});
      effects.spriteEffects.push({asset:'burnStatusVfx',x:enemy.x,y:enemy.y-10,width:160,height:132,life:.34,maxLife:.34,glow:bolt.definition.color});
      if(steamReady)triggerSteamBurst(enemy,bolt.power);
      break;
    }
  }
  for (const vortex of effects.vortices) {
    vortex.life -= dt;
    const progress=1-vortex.life/vortex.maxLife;
    for (const enemy of enemies) {
      if (enemy.dead || enemy.state === 'waiting') continue;
      const dist = distance(vortex, enemy);
      if (dist >= vortex.radius + enemy.radius) continue;
      const toward = normalize(vortex.x-enemy.x, vortex.y-enemy.y);
      const pullStrength = vortex.pull * clamp(1-dist/vortex.radius, .25, 1);
      const pullResistance=enemy.def.behavior==='boss' ? .06 : 1;
      enemy.vx += toward.x*pullStrength*dt*pullResistance; enemy.vy += toward.y*pullStrength*dt*pullResistance;
      if(enemy.def.behavior!=='boss'&&progress>.28&&progress<.82&&dist<vortex.radius*vortex.definition.holdRadius){enemy.vx*=Math.exp(-8*dt);enemy.vy*=Math.exp(-8*dt);enemy.huntTime=0;}
      applyEnemyStatus(enemy,'wet',vortex.definition.wetDuration);
      if (!vortex.hit.has(enemy.id)) {
        vortex.hit.add(enemy.id);
        damageEnemyFromAbility(enemy, Math.round(vortex.definition.damage*player.abilityPower.undertowWell), 40, toward, vortex.definition.color, 'DRAGGED!');
        effects.spriteEffects.push({asset:'waterImpactVfx',x:enemy.x,y:enemy.y-20,width:190,height:160,life:.56,maxLife:.56,glow:vortex.definition.color});
      }
    }
    if(vortex.evolved&&!vortex.midCollapsed&&progress>=.5){vortex.midCollapsed=true;const targets=enemies.filter((enemy)=>!enemy.dead&&enemy.state!=='waiting'&&distance(vortex,enemy)<vortex.radius*.78+enemy.radius);for(const enemy of targets){const inward=normalize(vortex.x-enemy.x,vortex.y-enemy.y);damageEnemyFromAbility(enemy,Math.round(vortex.definition.collapseDamage*player.abilityPower.undertowWell*.68),110,inward,'#96f7ff',null);applyEnemyStatus(enemy,'wet',vortex.definition.wetDuration);}effects.rings.push({x:vortex.x,y:vortex.y,radius:vortex.radius*.2,maxRadius:vortex.radius*.82,color:'#96f7ff',life:.38,maxLife:.38});effects.spriteEffects.push({asset:'waterImpactVfx',fixedFrame:5,x:vortex.x,y:vortex.y-10,width:vortex.radius*2.1,height:vortex.radius*1.55,life:.5,maxLife:.5,glow:'#96f7ff'});burst(vortex.x,vortex.y,'#96f7ff',28,410,6);spawnWord(vortex.x,vortex.y-70,'ABYSSAL MAW!','#96f7ff');camera.shake=Math.max(camera.shake,8);hitStop=Math.max(hitStop,.045);}
    if(!vortex.collapsed&&vortex.life<=vortex.definition.holdDuration){vortex.collapsed=true;const targets=enemies.filter((enemy)=>!enemy.dead&&enemy.state!=='waiting'&&distance(vortex,enemy)<vortex.radius*.72+enemy.radius);for(const enemy of targets){const inward=normalize(vortex.x-enemy.x,vortex.y-enemy.y);damageEnemyFromAbility(enemy,Math.round(vortex.definition.collapseDamage*player.abilityPower.undertowWell),85,inward,vortex.definition.color,'UNDERTOW!');applyEnemyStatus(enemy,'wet',vortex.definition.wetDuration);}effects.rings.push({x:vortex.x,y:vortex.y,radius:vortex.radius*.5,maxRadius:vortex.radius*1.12,color:'#dfffff',life:.48,maxLife:.48});burst(vortex.x,vortex.y,'#dfffff',36,470,7);camera.shake=Math.max(camera.shake,10);hitStop=Math.max(hitStop,.055);playSfx('water',.28,.78);}
  }
  for (const storm of effects.shockStorms) {
    storm.life -= dt;if(storm.life<=0){if(storm.verdict&&!storm.verdictResolved)triggerHeavensVerdict(storm);continue;}storm.tick -= dt;
    if (storm.tick > 0) continue;
    storm.tick = storm.definition.tickRate; storm.pulse++;
    const targets = enemies.filter((enemy)=>!enemy.dead&&enemy.state!=='waiting');
    for (const enemy of targets) {
      const wetMultiplier = enemy.wetTime>0&&player.synergies.has('stormCurrent') ? 1+storm.definition.wetBonus : 1;
      const damage = Math.round(storm.definition.damage*storm.power*wetMultiplier);
      effects.shockLinks.push({x1:player.x,y1:player.y-28,x2:enemy.x,y2:enemy.y-22,life:.28,maxLife:.28,phase:storm.pulse});
      effects.spriteEffects.push({asset:'shockImpactVfx',x:enemy.x,y:enemy.y-20,width:150,height:132,life:.38,maxLife:.38,glow:storm.definition.color});
      damageEnemyFromAbility(enemy,damage,70,normalize(enemy.x-player.x,enemy.y-player.y),storm.definition.color,null);
      applyEnemyStatus(enemy,'shock',.55);
    }
    if (targets.length) {if(player.synergies.has('guardianTempest'))player.health=Math.min(player.maxHealth,player.health+1.5);camera.shake=Math.max(camera.shake,5); hitStop=Math.max(hitStop,.018); playSfx('lightning',.2,1.08); }
  }
  for (const shard of effects.shards) {
    shard.life -= dt; shard.delay -= dt;
    if (shard.delay > 0) {
      shard.x += shard.vx * dt; shard.y += shard.vy * dt;
      const drag = Math.exp(-5 * dt); shard.vx *= drag; shard.vy *= drag;
    } else {
      const direction = normalize(player.x - shard.x, player.y - shard.y);
      const speed = clamp(180 + (1.4 - Math.min(1.4, shard.life)) * 360, 180, 620);
      shard.vx = lerp(shard.vx, direction.x * speed, clamp(dt * 8, 0, 1));
      shard.vy = lerp(shard.vy, direction.y * speed, clamp(dt * 8, 0, 1));
      shard.x += shard.vx * dt; shard.y += shard.vy * dt;
      if (distance(shard, player) < 27) { shard.life = 0; gainXp(3); burst(player.x,player.y-12,shard.color,5,120,2); effects.rings.push({x:player.x,y:player.y,radius:4,maxRadius:22,color:shard.color,life:.14,maxLife:.14}); playSfx('upgrade',.08,1.38,35); }
    }
  }
  for (const list of Object.values(effects)) {
    for (let i = list.length - 1; i >= 0; i--) if (list[i].life <= 0) list.splice(i, 1);
  }
}

function triggerSteamBurst(origin,power){
  origin.wetTime=0;const radius=205;effects.rings.push({x:origin.x,y:origin.y,radius:28,maxRadius:radius,color:'#dffcff',life:.55,maxLife:.55});effects.spriteEffects.push({asset:'waterImpactVfx',x:origin.x,y:origin.y-12,width:370,height:280,life:.58,maxLife:.58,glow:'#52eaff'});effects.spriteEffects.push({asset:'burnStatusVfx',x:origin.x,y:origin.y-28,width:285,height:225,life:.42,maxLife:.42,glow:'#ff8b2a'});spawnWord(origin.x,origin.y-78,'STEAM BURST!','#eaffff');burst(origin.x,origin.y,'#dffcff',32,430,6);
  for(const target of enemies){if(target.dead||target.state==='waiting'||distance(origin,target)>radius+target.radius)continue;const away=normalize(target.x-origin.x,target.y-origin.y);damageEnemyFromAbility(target,Math.round(18*power),210,away,'#b8f8ff',null);target.wetTime=0;}
  camera.shake=Math.max(camera.shake,11);hitStop=Math.max(hitStop,.065);playSfx('water',.24,.82);
}

function updateCamera(dt, screen) {
  const viewWidth = screen.width / camera.zoom;
  const viewHeight = screen.height / camera.zoom;
  const lookX = player.vx * .16 + Math.cos(player.facing) * camera.kick;
  const lookY = player.vy * .11 + Math.sin(player.facing) * camera.kick * .7;
  const targetX = clamp(player.x + lookX, viewWidth / 2, room.width - viewWidth / 2);
  const targetY = clamp(player.y + lookY, viewHeight / 2, room.height - viewHeight / 2);
  camera.x = lerp(camera.x, targetX, 1 - Math.exp(-4.7 * dt));
  camera.y = lerp(camera.y, targetY, 1 - Math.exp(-4.7 * dt));
  camera.shake = Math.max(0, camera.shake - dt * 29);
  camera.kick = lerp(camera.kick, 0, 1 - Math.exp(-9 * dt));
}

function updateHud() {
  if (!player) return;
  const healthPercent = clamp(player.health / player.maxHealth * 100, 0, 100);
  ui.healthFill.style.width = `${healthPercent}%`;
  ui.healthText.textContent = player.spiritShield>0?`${Math.ceil(player.health)} / ${player.maxHealth}  ·  WARD ${Math.ceil(player.spiritShield)}`:`${Math.ceil(player.health)} / ${player.maxHealth}`;
  ui.heroRole.textContent=player.braced?`${heroDef.role.toUpperCase()}  BRACED`:heroDef.role.toUpperCase();
  ui.timer.textContent = formatTime(runTime);
  const dashPercent = clamp(player.dashCooldown / (heroDef.dashCooldown*player.dashCooldownMultiplier) * 100, 0, 100);
  ui.dashCooldown.style.height = `${dashPercent}%`;
  ui.dashCard.classList.toggle('ready', dashPercent <= 0);
  ui.sprintFill.style.height=`${player.sprint}%`;ui.sprintCard.classList.toggle('empty',player.sprint<3);
  for (const [id, controls] of Object.entries(ui.abilityCards)) {
    const cooldownPercent = clamp(player.abilityCooldowns[id] / ABILITIES[id].cooldown * 100, 0, 100);
    const unlocked = player.unlockedAbilities.has(id);
    controls.fill.style.height = `${cooldownPercent}%`;
    controls.card.classList.toggle('locked', !unlocked);
    controls.card.classList.toggle('ready', unlocked && cooldownPercent <= 0);
    controls.card.classList.toggle('evolved',Boolean(player.abilityEvolutions?.[id]));
    controls.card.dataset.evolution=id==='undertowWell'?'ABYSSAL MAW':id==='foxfireVolley'?'NINE-TAIL':id==='wildHeart'?'GUARDIAN':"VERDICT";
  }
  ui.xpFill.style.width = `${clamp(player.xp/player.xpToNext*100,0,100)}%`; ui.xpText.textContent = `${player.xp} / ${player.xpToNext}`;
  ui.levelBadge.textContent = String(player.level);
  ui.goldToken.textContent=`GOLD ${player.gold}`;
  ui.comboCount.textContent = String(player.hitCount);
  ui.comboPanel.classList.toggle('show', comboUiTimer > 0 && player.hitCount >= 2);
  const boss=enemies.find((enemy)=>enemy.def.behavior==='boss'&&!enemy.dead);
  if(boss){const profile=BOSS_PROFILES[boss.def.id];ui.bossHealthFill.style.width=`${clamp(boss.health/boss.maxHealth*100,0,100)}%`;ui.bossHealthText.textContent=`${Math.max(0,Math.ceil(boss.health))} / ${boss.maxHealth}`;ui.bossPhase.textContent=profile.phaseNames[boss.bossPhase];ui.bossPhase.style.color=boss.counterTime>0?'#ffe36a':'';updateBossReadout(boss,profile);ui.bossPanel.dataset.guardian=boss.def.id;ui.bossPanel.dataset.pattern=boss.activePattern||'none';ui.bossPanel.dataset.telegraph=String(boss.patternWindup||0);}
  refreshSynergyHud();
}

function formatTime(time) {
  const seconds = Math.floor(time % 60).toString().padStart(2, '0');
  const minutes = Math.floor(time / 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function update(dt, screen) {
  if (!player) resetGame();
  updateCoop(dt);
  if (state === 'playing') {
    runTime += dt;
    if (hitStop > 0) hitStop -= dt;
    else {
      updatePlayer(dt);
      updateTutorial(dt);
      updateEnemies(dt);
      updateCorruptionDirector(dt);
      updateChapterWarpack(dt);
      updateBiomePressure(dt);
      updateEncounter(dt);
      if(tutorialActive?.phase==='live')ui.objective.textContent=TUTORIAL_LESSONS[tutorialActive.index].task;
      if (clearDelay >= 0) { clearDelay -= dt; if (clearDelay <= 0){clearDelay=-1;openGuardianReward(encounter.defeatedGuardianId||chapter.boss);} }
    }
    comboUiTimer = Math.max(0, comboUiTimer - dt);
    updateEffects(dt);
    updateCamera(dt, screen);
    updateHud();
  } else if(state==='hub'){
    updateHub(dt);updateEffects(dt);updateCamera(dt,screen);updateHud();
  } else if(state==='dojo'){
    updateDojo(dt);updateCamera(dt,screen);updateHud();
  } else if (!['levelup','hubMenu','codex','paused','settings'].includes(state)) {
    updateEffects(dt);
    camera.x = lerp(camera.x, room.playerSpawn.x, .03);
    camera.y = lerp(camera.y, room.playerSpawn.y - 80, .03);
  }
  input.pressed.clear(); input.attack = false;
}

function setWorldTransform(screen) {
  const shakeAmount=camera.shake*profile.settings.screenShake;
  const shakeX = shakeAmount ? (Math.random() - .5) * shakeAmount * 2 : 0;
  const shakeY = shakeAmount ? (Math.random() - .5) * shakeAmount * 2 : 0;
  ctx.setTransform(screen.dpr * camera.zoom, 0, 0, screen.dpr * camera.zoom,
    screen.dpr * (screen.width / 2 - camera.x * camera.zoom + shakeX),
    screen.dpr * (screen.height / 2 - camera.y * camera.zoom + shakeY));
}

function drawArenaBackdrop(screen){
  if(room.mapRuntime==='phaser-tiled'&&['playing','story'].includes(state))return;
  if(!assets.arena.complete||!assets.arena.naturalWidth){ctx.fillStyle='#12112a';ctx.fillRect(0,0,room.width,room.height);return;}
  const halfWidth=screen.width/(camera.zoom*2)+160,halfHeight=screen.height/(camera.zoom*2)+160;
  const x=clamp(camera.x-halfWidth,0,room.width),y=clamp(camera.y-halfHeight,0,room.height),width=Math.min(room.width-x,halfWidth*2),height=Math.min(room.height-y,halfHeight*2);
  ctx.drawImage(assets.arena,x/room.width*assets.arena.naturalWidth,y/room.height*assets.arena.naturalHeight,width/room.width*assets.arena.naturalWidth,height/room.height*assets.arena.naturalHeight,x,y,width,height);
}

function draw(screen) {
  ctx.setTransform(screen.dpr, 0, 0, screen.dpr, 0, 0);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const layeredMapActive=room.mapRuntime==='phaser-tiled'&&['playing','story'].includes(state);
  if(!layeredMapActive){ctx.fillStyle = '#080718'; ctx.fillRect(0, 0, screen.width, screen.height);}
  layeredMapRuntime.update({roomId:room.id,cameraX:camera.x,cameraY:camera.y,zoom:camera.zoom,width:screen.width,height:screen.height,active:layeredMapActive,sealed:state==='playing'&&enemies.some((enemy)=>!enemy.dead&&enemy.state!=='waiting')});
  setWorldTransform(screen);
  drawArenaBackdrop(screen);

  if(room.id!=='spiritVillage')drawWorldZones();
  if(room.id==='jadeCourtyard'){drawFloorDetails();drawArchitectureLandmarks();drawLightPools();}
  drawAmbient();
  if(room.id==='spiritVillage')drawHubStations();
  drawArenaSeal();
  if(room.id!=='spiritVillage')drawRoomInteractable();
  if(room.id==='jadeCourtyard')drawSpiritGates();
  for (const after of effects.afterimages) drawHero(after, after.life / after.maxLife * .36, true);
  // Attack art belongs in the world, behind readable character silhouettes. Hit motion/status tint stays on bodies.
  drawEffects(false);
  const renderables = [
    ...(room.mapRuntime==='phaser-tiled'?layeredMapRuntime.worldObjects('Props / Interactive').filter((object)=>!object.properties.destructible).map((object)=>({...object,renderType:'tiledProp'})):[]),
    ...(room.id==='jadeCourtyard'?props.filter((prop) => !prop.foreground).map((prop) => ({ ...prop, renderType: 'prop' })):[]),
    ...destructibles.filter((prop)=>!prop.broken).map((prop)=>({...prop,renderType:'destructible'})),
    ...(roomMission?.actors||[]).filter((actor)=>!actor.broken&&!actor.released).map((actor)=>({...actor,renderType:actor.kind==='anchor'?'missionAnchor':'missionCaptive'})),
    ...(roomMission?.ward&&!roomMission.complete?[{...roomMission.ward,renderType:'missionWard'}]:[]),
    ...enemies.filter((enemy) => enemy.state !== 'waiting' && (enemy.deathTime > 0 || !enemy.dead)),
    ...[...coop.remotePlayers.values()].filter((member)=>member.room===room.id&&member.state!=='preview').map((member)=>({...member,renderType:'coopPlayer'})),player
  ].filter((entity)=>entity&&Math.abs(entity.x-camera.x)<screen.width/(camera.zoom*2)+520&&Math.abs(entity.y-camera.y)<screen.height/(camera.zoom*2)+420).sort((a, b) => a.y - b.y);
  drawCombatantReadabilityPlates(renderables);
  for (const entity of renderables) {
    if (entity.renderType === 'prop') drawProp(entity);
    else if(entity.renderType==='tiledProp')drawTiledMapObject(entity);
    else if(entity.renderType==='destructible')drawDestructible(entity);
    else if(entity.renderType==='missionAnchor')drawMissionAnchor(entity);
    else if(entity.renderType==='missionCaptive')drawMissionCaptive(entity);
    else if(entity.renderType==='missionWard')drawMissionWard(entity);
    else if(entity.renderType==='coopPlayer')drawCoopPlayer(entity);
    else if (entity === player) drawHero(player, 1, false);
    else drawEnemy(entity);
  }
  if(room.id==='jadeCourtyard')for (const prop of props.filter((item) => item.foreground)) drawProp(prop, .94);
  if(room.mapRuntime==='phaser-tiled')for(const object of layeredMapRuntime.worldObjects('Foreground / Occlusion'))drawTiledMapObject(object,.94);
  drawForegroundHaze();
  drawEffects(true);
  if(player?.ultimateFlash>0&&profile.settings.flashIntensity>0){ctx.setTransform(screen.dpr,0,0,screen.dpr,0,0);const a=clamp(player.ultimateFlash/.16,0,1)*profile.settings.flashIntensity;const flash=ctx.createRadialGradient(screen.width/2,screen.height/2,20,screen.width/2,screen.height/2,screen.width*.7);flash.addColorStop(0,`rgba(255,214,126,${a*.42})`);flash.addColorStop(.45,`rgba(201,53,255,${a*.26})`);flash.addColorStop(1,'rgba(82,10,122,0)');ctx.fillStyle=flash;ctx.fillRect(0,0,screen.width,screen.height);}
  drawMinimap();
}

function drawCombatantReadabilityPlates(renderables){
  for(const entity of renderables){
    if(entity.renderType&&entity.renderType!=='coopPlayer'||entity.renderType==='prop'||entity.dead)continue;
    const boss=entity.def?.behavior==='boss',radius=boss?entity.radius*1.25:(entity.radius||player.radius)*1.18;
    const gradient=ctx.createRadialGradient(entity.x,entity.y-18,0,entity.x,entity.y-10,radius*1.55);
    gradient.addColorStop(0,'rgba(4,4,10,.72)');gradient.addColorStop(.52,'rgba(4,4,10,.42)');gradient.addColorStop(1,'rgba(4,4,10,0)');
    ctx.save();ctx.translate(entity.x,entity.y-12);ctx.scale(1,.78);ctx.translate(-entity.x,-entity.y+12);ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(entity.x,entity.y-12,radius*1.55,0,Math.PI*2);ctx.fill();ctx.restore();
  }
}

function minimapPoint(entity,bounds,geometry){
  const nx=clamp((entity.x-bounds.x)/bounds.radiusX,-1,1),ny=clamp((entity.y-bounds.y)/bounds.radiusY,-1,1);
  return {x:geometry.cx+nx*geometry.rx,y:geometry.cy+ny*geometry.ry};
}

function drawMinimapMarker(map,entity,color,size=3,shape='dot'){
  const point=minimapPoint(entity,room.combatBounds,map);minimapCtx.save();minimapCtx.translate(point.x,point.y);minimapCtx.fillStyle=color;minimapCtx.strokeStyle='#070711';minimapCtx.lineWidth=1.5;minimapCtx.shadowColor=color;minimapCtx.shadowBlur=size*1.8;
  minimapCtx.beginPath();
  if(shape==='diamond'){minimapCtx.moveTo(0,-size);minimapCtx.lineTo(size,0);minimapCtx.lineTo(0,size);minimapCtx.lineTo(-size,0);minimapCtx.closePath();}
  else if(shape==='triangle'){minimapCtx.rotate(entity.facing||0);minimapCtx.moveTo(size*1.35,0);minimapCtx.lineTo(-size*.9,-size);minimapCtx.lineTo(-size*.55,0);minimapCtx.lineTo(-size*.9,size);minimapCtx.closePath();}
  else minimapCtx.arc(0,0,size,0,Math.PI*2);
  minimapCtx.fill();minimapCtx.stroke();minimapCtx.restore();
}

function drawExpeditionWorldMap(){
  if(!player||!worldMapCanvas)return;const rect=worldMapCanvas.getBoundingClientRect(),width=Math.max(1,Math.round(rect.width)),height=Math.max(1,Math.round(rect.height)),dpr=Math.min(window.devicePixelRatio||1,1.5);
  if(worldMapCanvas.width!==Math.round(width*dpr)||worldMapCanvas.height!==Math.round(height*dpr)){worldMapCanvas.width=Math.round(width*dpr);worldMapCanvas.height=Math.round(height*dpr);}worldMapCtx.setTransform(dpr,0,0,dpr,0,0);worldMapCtx.clearRect(0,0,width,height);
  const discovered=player.discoveredRegions instanceof Set?player.discoveredRegions:new Set(player.discoveredRegions||[room.id]),cleared=player.clearedRegions instanceof Set?player.clearedRegions:new Set(player.clearedRegions||[]),padding=54,scaleX=(width-padding*2)/EXPEDITION_WORLD.width,scaleY=(height-padding*2)/EXPEDITION_WORLD.height,scale=Math.min(scaleX,scaleY),offsetX=(width-EXPEDITION_WORLD.width*scale)/2,offsetY=(height-EXPEDITION_WORLD.height*scale)/2,point=(node)=>({x:offsetX+node.x*scale,y:offsetY+node.y*scale});
  worldMapCtx.fillStyle='#050510';worldMapCtx.fillRect(0,0,width,height);for(const chapterData of EXPEDITION_WORLD.chapters){const chapterNodes=EXPEDITION_WORLD.nodes.filter((node)=>node.biome===chapterData.id&&node.kind==='main'),xs=chapterNodes.map((node)=>point(node).x);worldMapCtx.fillStyle=`${chapterData.color}0b`;worldMapCtx.strokeStyle=`${chapterData.color}26`;worldMapCtx.lineWidth=1;worldMapCtx.beginPath();worldMapCtx.roundRect(Math.min(...xs)-28,30,Math.max(...xs)-Math.min(...xs)+56,height-60,24);worldMapCtx.fill();worldMapCtx.stroke();worldMapCtx.fillStyle=`${chapterData.color}aa`;worldMapCtx.font='900 9px Inter, sans-serif';worldMapCtx.textAlign='center';worldMapCtx.fillText(chapterData.name,(Math.min(...xs)+Math.max(...xs))/2,50);}
  for(const link of EXPEDITION_WORLD.links){const from=expeditionNode(link.from),to=expeditionNode(link.to),fromKnown=discovered.has(link.from)||from.kind==='main',toKnown=discovered.has(link.to)||to.kind==='main';if(!fromKnown||!toKnown)continue;const a=point(from),b=point(to),explored=discovered.has(link.from)&&discovered.has(link.to);worldMapCtx.strokeStyle=explored?(link.kind==='realm'?'#fff08c99':`${from.color}aa`):'#55506645';worldMapCtx.lineWidth=explored?3:1.5;worldMapCtx.setLineDash(link.kind==='branch'?[7,6]:[]);worldMapCtx.beginPath();worldMapCtx.moveTo(a.x,a.y);worldMapCtx.lineTo(b.x,b.y);worldMapCtx.stroke();worldMapCtx.setLineDash([]);}
  for(const node of EXPEDITION_WORLD.nodes){const known=discovered.has(node.roomId),main=node.kind==='main'||node.kind==='guardian';if(!known&&!main)continue;const p=point(node),current=node.roomId===room.id,radius=current?12:node.kind==='guardian'?9:known?7:4;worldMapCtx.save();worldMapCtx.translate(p.x,p.y);worldMapCtx.fillStyle=current?'#fff29a':known?node.color:'#2c2939';worldMapCtx.strokeStyle=current?'#ffffff':known?'#080812':'#625c72';worldMapCtx.lineWidth=current?4:2;worldMapCtx.shadowColor=current?'#fff29a':known?node.color:'transparent';worldMapCtx.shadowBlur=current?20:known?8:0;worldMapCtx.beginPath();if(node.kind==='guardian'||node.kind==='elite'){worldMapCtx.moveTo(0,-radius);worldMapCtx.lineTo(radius,0);worldMapCtx.lineTo(0,radius);worldMapCtx.lineTo(-radius,0);worldMapCtx.closePath();}else worldMapCtx.arc(0,0,radius,0,Math.PI*2);worldMapCtx.fill();worldMapCtx.stroke();if(cleared.has(node.roomId)){worldMapCtx.strokeStyle='#6eff86';worldMapCtx.lineWidth=2;worldMapCtx.beginPath();worldMapCtx.arc(0,0,radius+5,0,Math.PI*2);worldMapCtx.stroke();}worldMapCtx.restore();if(current||known&&node.kind!=='main'){worldMapCtx.fillStyle=current?'#fff8cf':'#c9c1d0';worldMapCtx.font=`900 ${current?10:7}px Inter, sans-serif`;worldMapCtx.textAlign='center';worldMapCtx.fillText((ROOMS[node.roomId]?.name||node.roomId).toUpperCase(),p.x,p.y+radius+15);}}
  for(const member of coop.remotePlayers.values()){if(!Number.isFinite(member.worldX)||!Number.isFinite(member.worldY))continue;const p={x:offsetX+member.worldX*scale,y:offsetY+member.worldY*scale};worldMapCtx.save();worldMapCtx.translate(p.x,p.y);worldMapCtx.rotate(member.facing||0);worldMapCtx.fillStyle='#65f2ff';worldMapCtx.strokeStyle='#ffffff';worldMapCtx.lineWidth=1.5;worldMapCtx.shadowColor='#65f2ff';worldMapCtx.shadowBlur=10;worldMapCtx.beginPath();worldMapCtx.moveTo(8,0);worldMapCtx.lineTo(-5,-5);worldMapCtx.lineTo(-3,0);worldMapCtx.lineTo(-5,5);worldMapCtx.closePath();worldMapCtx.fill();worldMapCtx.stroke();worldMapCtx.restore();}
  const progress=expeditionProgress(discovered),node=expeditionNode(room.id);ui.worldMapProgress.textContent=`${progress.discovered} / ${progress.total} REGIONS · ${Math.round(progress.ratio*100)}% DISCOVERED`;ui.worldMapLocation.textContent=`CURRENT REGION · ${ROOMS[room.id]?.name.toUpperCase()||room.id} · ${node?.biomeName||'SPIRIT ROAD'}`;document.documentElement.dataset.worldDiscovered=String(progress.discovered);document.documentElement.dataset.worldRegion=room.id;
}

function openWorldMap(){if(!['playing','hub','dojo'].includes(state)||!player)return;worldMapReturnState=state;state='worldMap';input.keys.clear();input.attackHeld=false;drawExpeditionWorldMap();worldMapScreen.classList.add('active');playSfx('upgrade',.12,.9);}
function closeWorldMap(){if(state!=='worldMap')return;worldMapScreen.classList.remove('active');state=worldMapReturnState;lastTime=performance.now();}

function drawMinimap(){
  const visible=Boolean(profile.settings.minimap&&player&&['playing','hub','dojo'].includes(state));ui.minimapPanel.classList.toggle('map-hidden',!visible);if(!visible)return;
  const rect=minimapCanvas.getBoundingClientRect(),width=Math.max(1,Math.round(rect.width)),height=Math.max(1,Math.round(rect.height)),dpr=Math.min(window.devicePixelRatio||1,2);
  if(minimapCanvas.width!==Math.round(width*dpr)||minimapCanvas.height!==Math.round(height*dpr)){minimapCanvas.width=Math.round(width*dpr);minimapCanvas.height=Math.round(height*dpr);}
  minimapCtx.setTransform(dpr,0,0,dpr,0,0);minimapCtx.clearRect(0,0,width,height);
  const map={cx:width/2,cy:height/2+1,rx:width*.43,ry:height*.42};const crimson=room.id.includes('crimson')||room.id.includes('pyre'),bamboo=room.id.includes('bamboo')||room.id.includes('moonfang'),accent=crimson?'#ff4c79':bamboo?'#62e99b':'#42eaf4';
  minimapCtx.save();minimapCtx.beginPath();minimapCtx.ellipse(map.cx,map.cy,map.rx,map.ry,0,0,Math.PI*2);minimapCtx.clip();
  const background=minimapCtx.createRadialGradient(map.cx,map.cy,5,map.cx,map.cy,map.rx);background.addColorStop(0,crimson?'#24101d':bamboo?'#10241f':'#101d25');background.addColorStop(1,'#04050d');minimapCtx.fillStyle=background;minimapCtx.fillRect(0,0,width,height);
  minimapCtx.strokeStyle=`${accent}24`;minimapCtx.lineWidth=1;for(const scale of [.35,.68,1]){minimapCtx.beginPath();minimapCtx.ellipse(map.cx,map.cy,map.rx*scale,map.ry*scale,0,0,Math.PI*2);minimapCtx.stroke();}minimapCtx.beginPath();minimapCtx.moveTo(map.cx-map.rx,map.cy);minimapCtx.lineTo(map.cx+map.rx,map.cy);minimapCtx.moveTo(map.cx,map.cy-map.ry);minimapCtx.lineTo(map.cx,map.cy+map.ry);minimapCtx.stroke();
  if(room.id==='spiritVillage'){
    for(const station of HUB_STATIONS)drawMinimapMarker(map,station,station.color,station.id==='portal'?5:3.5,'diamond');
    ui.minimapLabel.textContent='VILLAGE SERVICES';ui.minimapCount.textContent=`${HUB_STATIONS.length} STATIONS`;
  }else{
    const activeEnemies=enemies.filter((enemy)=>enemy.state!=='waiting'&&!enemy.dead&&enemy.deathTime<=0);
    for(const enemy of activeEnemies){const boss=enemy.def.behavior==='boss';drawMinimapMarker(map,enemy,boss?'#ffcf3d':enemy.eliteDef?.color||'#ff466d',boss?7:enemy.eliteDef?4.2:2.6,boss?'diamond':'dot');}
    for(const actor of roomMission?.actors||[])if(!actor.broken&&!actor.released)drawMinimapMarker(map,actor,roomMission.color||'#55efff',4.2,'diamond');
    if(roomMission?.ward&&!roomMission.complete)drawMinimapMarker(map,roomMission.ward,roomMission.color||'#55efff',5.2,'diamond');
    if(roomInteractable&&!roomInteractable.used)drawMinimapMarker(map,roomInteractable,roomInteractable.color||'#ffd142',5,'diamond');
    ui.minimapLabel.textContent=encounter.bossActive?'GUARDIAN DOMAIN':'ARENA MAP';ui.minimapCount.textContent=encounter.bossActive?'BOSS ACTIVE':`${activeEnemies.length} ACTIVE`;
  }
  for(const member of coop.remotePlayers.values())if(member.room===room.id&&member.state!=='preview')drawMinimapMarker(map,member,'#65f2ff',4,'triangle');
  drawMinimapMarker(map,player,'#fff18c',5.2,'triangle');minimapCtx.restore();
  minimapCtx.strokeStyle=accent;minimapCtx.lineWidth=2;minimapCtx.shadowColor=accent;minimapCtx.shadowBlur=8;minimapCtx.beginPath();minimapCtx.ellipse(map.cx,map.cy,map.rx,map.ry,0,0,Math.PI*2);minimapCtx.stroke();minimapCtx.shadowBlur=0;
}

function drawRoomInteractable(){
  const item=roomInteractable;if(!item||item.used)return;const time=motionTime(),near=distance(player,item)<190,pulse=1+Math.sin(time*4)*.06;
  ctx.save();ctx.translate(item.x,item.y);const glow=ctx.createRadialGradient(0,0,5,0,0,145);glow.addColorStop(0,`${item.color}66`);glow.addColorStop(1,`${item.color}00`);ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(0,18,145*pulse,72*pulse,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=item.color;ctx.lineWidth=near?7:4;ctx.setLineDash([18,11]);ctx.lineDashOffset=-time*42;ctx.beginPath();ctx.ellipse(0,18,92*pulse,41*pulse,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(6,5,17,.94)';ctx.strokeStyle=item.color;ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-122,-125,244,72,10);ctx.fill();ctx.stroke();ctx.font='900 35px Impact';ctx.textAlign='center';ctx.fillStyle=item.color;ctx.fillText(item.icon,0,-80);ctx.font='italic 900 17px Impact';ctx.fillStyle='#fff7ed';ctx.fillText(item.name,0,-59);if(near){ctx.font='900 13px Inter';ctx.fillStyle=item.color;ctx.fillText(`[ E ] ${item.prompt}`,0,-140);}ctx.restore();
}

function drawDestructible(prop){
  if(!assets.props.complete||!assets.props.naturalWidth)return;const sw=assets.props.naturalWidth/4,sh=assets.props.naturalHeight/2,h=250*prop.scale,w=h*(sw/sh);ctx.save();ctx.fillStyle='rgba(0,0,8,.38)';ctx.beginPath();ctx.ellipse(prop.x,prop.y+4,prop.radius*1.12,prop.radius*.38,0,0,Math.PI*2);ctx.fill();ctx.translate(prop.x,prop.y);if(prop.health<prop.maxHealth){ctx.rotate(Math.sin(performance.now()/26)*.035);ctx.globalAlpha=.82;}ctx.drawImage(assets.props,prop.col*sw,prop.row*sh,sw,sh,-w/2,-h*.82,w,h);ctx.restore();
}

function drawTiledMapObject(object,alpha=1){
  if(!assets.props.complete||!assets.props.naturalWidth)return;const p=object.properties||{};if(!Number.isFinite(p.cropW)||!Number.isFinite(p.cropH))return;
  const scale=p.scale??1,w=p.cropW*scale,h=p.cropH*scale,originY=p.originY??1,time=motionTime();ctx.save();ctx.globalAlpha=alpha;
  if(p.collisionRadius){ctx.fillStyle='rgba(0,0,8,.28)';ctx.beginPath();ctx.ellipse(object.x,object.y+3,p.collisionRadius*1.12,p.collisionRadius*.34,0,0,Math.PI*2);ctx.fill();}
  ctx.translate(object.x,object.y);if(p.foreground)ctx.rotate(Math.sin(time*1.4+object.x*.003)*.008);ctx.drawImage(assets.props,p.cropX,p.cropY,p.cropW,p.cropH,-w/2,-h*originY,w,h);ctx.restore();
}

function drawMissionAnchor(actor){
  const time=motionTime(),pulse=1+Math.sin(time*5+actor.x*.01)*.06,ratio=clamp(actor.health/actor.maxHealth,0,1);ctx.save();ctx.translate(actor.x,actor.y);
  const glow=ctx.createRadialGradient(0,-28,4,0,-28,130);glow.addColorStop(0,`${roomMission.color}88`);glow.addColorStop(1,`${roomMission.color}00`);ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(0,-14,125*pulse,80*pulse,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(2,3,12,.54)';ctx.beginPath();ctx.ellipse(0,18,55,17,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=roomMission.color;ctx.lineWidth=4;ctx.setLineDash([12,8]);ctx.lineDashOffset=-time*36;ctx.beginPath();ctx.ellipse(0,12,62*pulse,27*pulse,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#17112a';ctx.strokeStyle='#f2d8ff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-34,9);ctx.lineTo(-22,-54);ctx.lineTo(0,-88);ctx.lineTo(25,-48);ctx.lineTo(38,12);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=roomMission.color;ctx.globalAlpha=.8;ctx.beginPath();ctx.moveTo(-10,-50);ctx.lineTo(0,-72);ctx.lineTo(12,-43);ctx.lineTo(3,-3);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle='rgba(2,3,12,.88)';ctx.fillRect(-55,-119,110,12);ctx.fillStyle=ratio>.35?roomMission.color:'#ff365b';ctx.fillRect(-53,-117,106*ratio,8);ctx.restore();
}

function drawMissionCaptive(actor){
  const time=motionTime(),near=distance(player,actor)<175,bob=Math.sin(time*3.8+actor.x*.01)*8;ctx.save();ctx.translate(actor.x,actor.y+bob);
  const glow=ctx.createRadialGradient(0,-34,5,0,-34,120);glow.addColorStop(0,`${roomMission.color}80`);glow.addColorStop(1,`${roomMission.color}00`);ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,-30,115,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(1,3,13,.46)';ctx.beginPath();ctx.ellipse(0,32-bob,48,14,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=near?'#fff8d8':roomMission.color;ctx.lineWidth=near?5:3;ctx.beginPath();ctx.ellipse(0,-25,42,61,0,0,Math.PI*2);ctx.stroke();for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*20,-80);ctx.lineTo(i*20,28);ctx.stroke();}
  ctx.fillStyle='#f8ffff';ctx.shadowColor=roomMission.color;ctx.shadowBlur=25;ctx.beginPath();ctx.arc(0,-31,17,0,Math.PI*2);ctx.fill();ctx.fillStyle=roomMission.color;ctx.beginPath();ctx.moveTo(-20,-22);ctx.quadraticCurveTo(-44,-7,-31,12);ctx.quadraticCurveTo(-8,0,0,17);ctx.quadraticCurveTo(8,0,31,12);ctx.quadraticCurveTo(44,-7,20,-22);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
  if(near){ctx.fillStyle='rgba(4,4,15,.92)';ctx.strokeStyle=roomMission.color;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-91,-126,182,33,7);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.font='900 15px Inter';ctx.textAlign='center';ctx.fillText('[ E ] FREE SPIRIT',0,-104);}ctx.restore();
}

function drawMissionWard(ward){
  const time=motionTime(),pulse=1+Math.sin(time*4)*.045,ratio=clamp(ward.health/ward.maxHealth,0,1);ctx.save();ctx.translate(ward.x,ward.y);
  const glow=ctx.createRadialGradient(0,0,8,0,0,175);glow.addColorStop(0,`${roomMission.color}${roomMission.damageFlash?'aa':'66'}`);glow.addColorStop(1,`${roomMission.color}00`);ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(0,12,175*pulse,95*pulse,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(3,5,16,.7)';ctx.strokeStyle=roomMission.color;ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(0,18,93*pulse,43*pulse,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.lineWidth=3;ctx.setLineDash([18,10]);ctx.lineDashOffset=-time*46;ctx.beginPath();ctx.ellipse(0,18,125*pulse,58*pulse,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#191329';ctx.strokeStyle='#f5edff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-46,15);ctx.lineTo(-28,-56);ctx.lineTo(0,-86);ctx.lineTo(29,-54);ctx.lineTo(47,15);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=roomMission.color;ctx.beginPath();ctx.arc(0,-39,24*pulse,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(-7,-47,7,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle='rgba(2,3,12,.9)';ctx.fillRect(-88,-127,176,16);ctx.fillStyle=ratio>.32?roomMission.color:'#ff385d';ctx.fillRect(-85,-124,170*ratio,10);ctx.strokeStyle='#fff';ctx.globalAlpha=.6;ctx.strokeRect(-88,-127,176,16);ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.font='900 17px Impact';ctx.textAlign='center';ctx.fillText(`${Math.ceil(roomMission.remaining)}s`,0,-137);ctx.restore();
}

function drawHubStations(){
  const time=motionTime();const nearby=nearestHubStation();
  for(const station of HUB_STATIONS){
    const isNear=nearby?.station===station;const pulse=1+Math.sin(time*3+station.x*.003)*.07;
    ctx.save();ctx.translate(station.x,station.y);
    const glow=ctx.createRadialGradient(0,0,5,0,0,isNear?155:110);glow.addColorStop(0,`${station.color}${isNear?'70':'38'}`);glow.addColorStop(1,`${station.color}00`);ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(0,16,150*pulse,76*pulse,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=station.color;ctx.globalAlpha=isNear ? .95 : .44;ctx.lineWidth=isNear?7:4;ctx.setLineDash(isNear?[20,12]:[10,18]);ctx.lineDashOffset=-time*35;ctx.beginPath();ctx.ellipse(0,16,(isNear?102:82)*pulse,(isNear?44:34)*pulse,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    const width=Math.max(240,station.name.length*18+66);ctx.globalAlpha=isNear?1:.86;ctx.fillStyle='rgba(5,5,16,.88)';ctx.strokeStyle=station.color;ctx.lineWidth=isNear?4:2;ctx.beginPath();ctx.roundRect(-width/2,-104,width,70,9);ctx.fill();ctx.stroke();
    ctx.font='italic 900 27px Impact, sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff7ef';ctx.fillText(station.name,0,-73);
    ctx.font='800 13px Inter, sans-serif';ctx.letterSpacing='2px';ctx.fillStyle=station.color;ctx.fillText(isNear?`[ E ]  ${station.prompt}`:station.prompt,0,-49);ctx.restore();
  }
}

function drawWorldZones() {
  const zones=[
    {x:2400,y:1420,rx:1220,ry:650,c0:'rgba(45,88,76,.18)',c1:'rgba(8,9,25,0)'},
    {x:930,y:1900,rx:640,ry:360,c0:'rgba(19,116,132,.24)',c1:'rgba(18,39,83,0)'},
    {x:3840,y:1860,rx:690,ry:390,c0:'rgba(30,102,94,.22)',c1:'rgba(14,34,70,0)'},
    {x:2380,y:540,rx:760,ry:300,c0:'rgba(137,36,126,.19)',c1:'rgba(66,15,80,0)'}
  ];
  ctx.save();
  for(const zone of zones){const g=ctx.createRadialGradient(zone.x,zone.y,10,zone.x,zone.y,zone.rx);g.addColorStop(0,zone.c0);g.addColorStop(1,zone.c1);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(zone.x,zone.y,zone.rx,zone.ry,0,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='rgba(68,224,218,.08)';ctx.lineWidth=14;ctx.setLineDash([80,46,20,46]);ctx.lineDashOffset=-motionTime(120);
  ctx.beginPath();ctx.ellipse(room.combatBounds.x,room.combatBounds.y,room.combatBounds.radiusX*.82,room.combatBounds.radiusY*.72,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();
}

function drawFloorDetails() {
  ctx.save();
  ctx.translate(room.combatBounds.x, room.combatBounds.y); ctx.scale(2.2, 2.0); ctx.translate(-1260, -750);
  const cracks = [[950,715,-.5],[1120,610,.4],[1450,790,-.2],[1320,980,.7],[1580,640,.2],[820,820,-.8],[1210,705,.15],[1370,690,-.7],[1165,875,.85],[1510,935,-.3]];
  ctx.strokeStyle = 'rgba(12,18,31,.34)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (const [x,y,r] of cracks) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(r); ctx.beginPath(); ctx.moveTo(-42,0); ctx.lineTo(-18,-9); ctx.lineTo(-4,4); ctx.lineTo(13,-5); ctx.lineTo(38,3); ctx.stroke(); ctx.lineWidth=2; ctx.beginPath();ctx.moveTo(-8,2);ctx.lineTo(-1,18);ctx.moveTo(13,-5);ctx.lineTo(25,-19);ctx.stroke();ctx.restore();
  }
  const petals = [[1040,540],[1460,620],[875,760],[1540,910],[1200,1030],[1700,760],[770,930],[1110,760],[1380,575],[1340,920],[990,855],[1615,820]];
  for (let i=0;i<petals.length;i++) {
    const [x,y]=petals[i]; ctx.fillStyle = i%2 ? 'rgba(246,53,153,.72)' : 'rgba(80,226,245,.55)';
    ctx.save(); ctx.translate(x,y); ctx.rotate(i*.9); for(let p=0;p<3;p++){ctx.beginPath();ctx.ellipse(p*9,p%2?4:-3,5,2.2,p*.5,0,Math.PI*2);ctx.fill();} ctx.restore();
  }
  const markers=[[1010,790,1],[1410,610,.8],[1510,890,.75],[1190,955,.7]];
  for(const [x,y,s] of markers){ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(29,38,54,.68)';ctx.strokeStyle='rgba(73,211,214,.22)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-13*s,7*s);ctx.lineTo(-8*s,-12*s);ctx.lineTo(8*s,-16*s);ctx.lineTo(14*s,7*s);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='rgba(42,231,238,.25)';ctx.fillRect(-2*s,-10*s,4*s,11*s);ctx.restore();}
  const grass=[[1080,650],[1435,745],[1240,930],[1580,850],[920,865]];
  for(let i=0;i<grass.length;i++){const [x,y]=grass[i];ctx.save();ctx.translate(x,y);ctx.strokeStyle=i%2?'rgba(44,151,83,.7)':'rgba(43,203,153,.55)';ctx.lineWidth=3;for(let g=-2;g<=2;g++){ctx.beginPath();ctx.moveTo(g*4,4);ctx.quadraticCurveTo(g*6,-7,g*3+(g%2)*5,-17-Math.abs(g)*2);ctx.stroke();}ctx.restore();}
  const roots=[[1005,610,.2],[1500,760,-.4],[1290,585,.6],[1370,970,-.2]];
  ctx.strokeStyle='rgba(48,34,42,.62)';ctx.lineWidth=7;
  for(const [x,y,a] of roots){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.beginPath();ctx.moveTo(-34,3);ctx.bezierCurveTo(-15,-12,4,13,38,-4);ctx.stroke();ctx.strokeStyle='rgba(121,52,91,.28)';ctx.lineWidth=2;ctx.stroke();ctx.restore();}
  ctx.restore();
}

function drawArchitectureLandmarks(){
  ctx.save();ctx.translate(room.combatBounds.x, room.combatBounds.y);ctx.scale(2.2,2.0);ctx.translate(-1260,-750);
  const landmarks=[
    {x:1260,y:320,a:0,type:'temple',accent:'#ff9a2d'},
    {x:1260,y:1182,a:Math.PI,type:'bridge',accent:'#37e8ff'},
    {x:500,y:750,a:Math.PI/2,type:'shrine',accent:'#d642ff'},
    {x:2020,y:750,a:-Math.PI/2,type:'balcony',accent:'#ff6a37'}
  ];
  for(const l of landmarks){ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.a);ctx.globalAlpha=.92;
    ctx.fillStyle='rgba(5,7,18,.82)';ctx.strokeStyle='rgba(117,74,137,.55)';ctx.lineWidth=5;
    ctx.beginPath();ctx.moveTo(-128,35);ctx.lineTo(-108,-18);ctx.lineTo(-78,-25);ctx.lineTo(-62,-56);ctx.lineTo(62,-56);ctx.lineTo(78,-25);ctx.lineTo(108,-18);ctx.lineTo(128,35);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#17152b';for(let s=0;s<4;s++)ctx.fillRect(-86+s*44,36+s*10,172-s*88,7);
    ctx.fillStyle=l.accent;ctx.shadowColor=l.accent;ctx.shadowBlur=14;ctx.globalAlpha=.65;ctx.fillRect(-74,-45,18,28);ctx.fillRect(56,-45,18,28);
    ctx.globalAlpha=.9;ctx.shadowBlur=0;ctx.fillStyle='#28182c';ctx.fillRect(-112,-18,224,13);ctx.fillStyle='#090b18';ctx.fillRect(-88,-7,176,43);
    ctx.strokeStyle='rgba(231,174,87,.45)';ctx.lineWidth=3;ctx.strokeRect(-88,-7,176,43);ctx.restore();}ctx.restore();
}

function drawLightPools() {
  const pulse=.9+Math.sin(motionTime(260))*.1;
  for (const prop of props) {
    if (!prop.light) continue;
    const gradient = ctx.createRadialGradient(prop.x, prop.y, 4, prop.x, prop.y, 115*pulse);
    gradient.addColorStop(0, `${prop.light}42`); gradient.addColorStop(1, `${prop.light}00`);
    ctx.fillStyle = gradient; ctx.beginPath(); ctx.ellipse(prop.x, prop.y + 5, 120, 68, 0, 0, Math.PI*2); ctx.fill();
  }
}

function drawProp(prop, alpha = 1) {
  if (!assets.props.complete || !assets.props.naturalWidth) return;
  const sw = assets.props.naturalWidth / 4; const sh = assets.props.naturalHeight / 2;
  const h = 250 * prop.scale; const w = h * (sw / sh);
  const time=motionTime();const sway=(prop.sway||.006)*Math.sin(time*1.7+prop.x*.006);
  ctx.save(); ctx.globalAlpha = alpha;
  if (prop.radius) { ctx.fillStyle = 'rgba(0,0,8,.35)'; ctx.beginPath(); ctx.ellipse(prop.x,prop.y+4,prop.radius*1.15,prop.radius*.42,0,0,Math.PI*2); ctx.fill(); }
  ctx.translate(prop.x,prop.y);ctx.rotate(sway);ctx.drawImage(assets.props, prop.col * sw, prop.row * sh, sw, sh, -w/2, -h*.82, w, h);
  if(prop.light) drawAtlasFrame(assets.lanternFlameVfx,Math.floor(time*11+prop.x*.01)%6,0,-h*.63,42+prop.scale*24,56+prop.scale*28,0,.68,prop.light);
  ctx.restore();
}

function drawForegroundHaze() {
  const g = ctx.createLinearGradient(0, room.height-260, 0, room.height);
  g.addColorStop(0,'rgba(27,10,51,0)'); g.addColorStop(1,'rgba(12,5,30,.5)');
  ctx.fillStyle=g; ctx.fillRect(0,room.height-260,room.width,260);
}

function drawAmbient() {
  const time = motionTime();const crimson=chapter.id==='crimsonChapter';const neon=chapter.id==='neonChapter';const shadow=chapter.id==='shadowChapter';const ambient=room.ambient||'';
  const ambientPalette={
    river:['#54efff','#668cff'],roots:['#ff3fb5','#d54cff'],corruption:['#ff3fb5','#a63cff'],
    moonriver:['#58f2ff','#7297ff'],spores:['#7dff9c','#d54cff'],mooncurse:['#42ecff','#9b4dff'],
    bells:['#ffb13b','#ff3b79'],ash:['#ff8738','#c73d54'],inferno:['#ff5b2e','#d738ff'],dojo:['#72ef5b','#d54cff'],
    neonRain:['#43efff','#ff3bbd'],circuitMarket:['#f7ef69','#ff3bbd'],hologram:['#52efff','#d54cff'],skyrail:['#41f5ff','#f7ef69'],dataLotus:['#7dff9c','#ff3bbd'],override:['#ff365e','#52efff'],
    shadow:['#c865ff','#54e9ff'],mirrorgrave:['#e6c8ff','#5cecff'],wraithwood:['#a64dff','#4be4ff'],eclipse:['#ff66dc','#8b55ff'],hollowMoon:['#f2ddff','#b84dff']
  };
  const [moteA,moteB]=ambientPalette[ambient]||(crimson?['#ffb13b','#ff3b62']:['#54efff','#d54cff']);
  const wispTint=ambient==='inferno'?'#ff37d7':ambient==='ash'||ambient==='bells'?'#ff6b2d':ambient==='spores'||ambient==='dojo'?'#86ff8a':ambient==='mooncurse'||ambient==='corruption'?'#d94cff':'#4aeaff';
  for (let i = 0; i < 36; i++) {
    const x = room.combatBounds.x-room.combatBounds.radiusX*.88 + ((i * 231 + time * (7 + i % 3)) % (room.combatBounds.radiusX*1.76));
    const y = room.combatBounds.y-room.combatBounds.radiusY*.82 + ((i * 137 + Math.sin(time + i) * 16) % (room.combatBounds.radiusY*1.64));
    ctx.globalAlpha = .22 + Math.sin(time * 2 + i) * .09;
    ctx.fillStyle = i%3===0?moteA:moteB;
    ctx.beginPath(); ctx.arc(x, y, 2.2 + (i % 3), 0, Math.PI * 2); ctx.fill();
  }
  for(const wisp of ambientWisps){
    const x=wisp.x+Math.sin(time*.7+wisp.phase)*58;const y=wisp.y+Math.sin(time*1.25+wisp.phase)*24;
    drawAtlasFrame(assets.spiritWispVfx,Math.floor(time*8+wisp.phase)%6,x,y-36,92*wisp.scale,108*wisp.scale,0,.42+Math.sin(time*1.7+wisp.phase)*.12,wispTint);
  }
  for(const ripple of !crimson&&(['river','roots','moonriver','spores'].includes(ambient)||room.id==='jadeCourtyard')?waterRipples:[]){
    drawAtlasFrame(assets.waterRippleVfx,Math.floor(time*5+ripple.phase)%6,ripple.x,ripple.y,185*ripple.scale,96*ripple.scale,0,.44,'#37e8ff');
  }
  if(crimson){for(let i=0;i<(ambient==='inferno'?14:10);i++){const count=ambient==='inferno'?14:10;const a=i/count*Math.PI*2;const x=room.combatBounds.x+Math.cos(a)*room.combatBounds.radiusX*.88;const y=room.combatBounds.y+Math.sin(a)*room.combatBounds.radiusY*.86;drawAtlasFrame(assets.lanternFlameVfx,Math.floor(time*11+i)%6,x,y-18,ambient==='inferno'?86:74,ambient==='inferno'?110:96,0,.62,i%4===0&&ambient==='inferno'?'#d738ff':'#ff6b24');}}
  if(ambient==='mooncurse'){for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const x=room.combatBounds.x+Math.cos(a)*room.combatBounds.radiusX*.9;const y=room.combatBounds.y+Math.sin(a)*room.combatBounds.radiusY*.87;drawAtlasFrame(assets.lanternFlameVfx,Math.floor(time*9+i)%6,x,y-18,64,88,0,.5,i%2?'#44edff':'#954dff');}}
  if(ambient==='corruption'){for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const x=room.combatBounds.x+Math.cos(a)*room.combatBounds.radiusX*.9;const y=room.combatBounds.y+Math.sin(a)*room.combatBounds.radiusY*.87;drawAtlasFrame(assets.lanternFlameVfx,Math.floor(time*10+i)%6,x,y-18,62,84,0,.52,i%2?'#4aeaff':'#d94cff');}}
  if(neon){
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
    for(let i=0;i<34;i++){const span=room.combatBounds.radiusX*1.9;const x=room.combatBounds.x-span*.5+((i*281+time*(190+i%5*22))%span);const y=room.combatBounds.y-room.combatBounds.radiusY*.88+((i*167+time*(520+i%4*35))%(room.combatBounds.radiusY*1.76));ctx.globalAlpha=.11+(i%5)*.025;ctx.strokeStyle=i%3?'#52efff':'#ff3bbd';ctx.lineWidth=2+(i%3);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-30,y+92);ctx.stroke();}
    for(let i=0;i<9;i++){const a=i/9*Math.PI*2+time*.08;const x=room.combatBounds.x+Math.cos(a)*room.combatBounds.radiusX*.82;const y=room.combatBounds.y+Math.sin(a)*room.combatBounds.radiusY*.77;drawAtlasFrame(assets.neonCityVfx,Math.floor(time*7+i)%2,x,y-20,128,88,a,.26,i%2?'#48efff':'#ff3ab8');}
    ctx.restore();
  }
  if(shadow){
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2+time*.035;const x=room.combatBounds.x+Math.cos(a)*room.combatBounds.radiusX*(.7+(i%3)*.07);const y=room.combatBounds.y+Math.sin(a)*room.combatBounds.radiusY*(.68+(i%2)*.08);drawAtlasFrame(assets.shadowRealmVfx,1,x,y-24,118+(i%3)*18,82+(i%3)*12,a,.16+(i%4)*.035,i%2?'#b84dff':'#54e9ff');}
    ctx.globalAlpha=.09;ctx.fillStyle='#b84dff';for(let i=0;i<7;i++){const drift=((time*54+i*683)%(room.combatBounds.radiusX*2))-room.combatBounds.radiusX;const y=room.combatBounds.y-room.combatBounds.radiusY*.78+i*room.combatBounds.radiusY*.25+Math.sin(time*.4+i)*38;ctx.beginPath();ctx.ellipse(room.combatBounds.x+drift,y,280+i*28,36+i*5,-.08,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }
  for(let i=0;i<26;i++){
    const span=room.combatBounds.radiusX*1.85;const x=room.combatBounds.x-span/2+((i*317+time*(18+i%4*6))%span);
    const y=room.combatBounds.y-room.combatBounds.radiusY*.84+((i*193+Math.sin(time*.8+i)*42)%(room.combatBounds.radiusY*1.68));
    ctx.save();ctx.translate(x,y);ctx.rotate(time*.8+i);ctx.globalAlpha=.18+(i%4)*.05;ctx.fillStyle=i%3?moteB:moteA;ctx.beginPath();ctx.ellipse(0,0,crimson?8:6,crimson?3.2:2.2,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawArenaSeal() {
  if (state !== 'playing' || clearDelay >= 0) return;
  const b = room.combatBounds;
  ctx.save(); ctx.translate(b.x, b.y); ctx.scale(b.radiusX, b.radiusY);
  ctx.strokeStyle = 'rgba(244, 40, 118, .17)'; ctx.lineWidth = 5 / Math.max(b.radiusX, b.radiusY);
  ctx.setLineDash([.026, .018]); ctx.lineDashOffset = -motionTime(190000);
  ctx.beginPath(); ctx.arc(0, 0, .985, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}

function drawSpiritGates() {
  const opening = clearDelay >= 0 ? 1 - clamp(clearDelay / 1.45, 0, 1) : 0;
  ctx.save();ctx.translate(room.combatBounds.x, room.combatBounds.y);ctx.scale(2.2,2.0);ctx.translate(-1260,-750);
  const gates = [
    {x:1260,y:338,a:0},{x:1260,y:1162,a:0},{x:515,y:750,a:Math.PI/2},{x:2005,y:750,a:Math.PI/2}
  ];
  for (const gate of gates) {
    ctx.save(); ctx.translate(gate.x,gate.y); ctx.rotate(gate.a);
    ctx.fillStyle='rgba(4,5,14,.7)';ctx.beginPath();ctx.ellipse(0,36,88,25,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#171428';ctx.strokeStyle='#49304f';ctx.lineWidth=5;ctx.fillRect(-76,-48,19,92);ctx.strokeRect(-76,-48,19,92);ctx.fillRect(57,-48,19,92);ctx.strokeRect(57,-48,19,92);
    ctx.fillStyle='#261936';ctx.beginPath();ctx.moveTo(-91,-55);ctx.lineTo(-70,-73);ctx.lineTo(70,-73);ctx.lineTo(91,-55);ctx.lineTo(71,-44);ctx.lineTo(-71,-44);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#a96826';ctx.fillRect(-84,-63,168,7);ctx.fillStyle='#e98731';ctx.beginPath();ctx.arc(-67,-3,7,0,Math.PI*2);ctx.arc(67,-3,7,0,Math.PI*2);ctx.fill();
    if(opening<1){const pulse=.72+Math.sin(motionTime(115))*.18;ctx.save();ctx.globalAlpha=(1-opening)*pulse;ctx.shadowColor='#3cecff';ctx.shadowBlur=28;
      const veil=ctx.createLinearGradient(0,-44,0,40);veil.addColorStop(0,'rgba(39,223,255,.08)');veil.addColorStop(.45,'rgba(50,238,255,.34)');veil.addColorStop(1,'rgba(152,54,255,.11)');ctx.fillStyle=veil;
      ctx.beginPath();ctx.moveTo(-52-opening*65,-42);ctx.lineTo(52+opening*65,-42);ctx.lineTo(47+opening*70,38);ctx.lineTo(-47-opening*70,38);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#6ff5ff';ctx.lineWidth=4;ctx.setLineDash([14,8]);ctx.lineDashOffset=-motionTime(45);ctx.stroke();ctx.setLineDash([]);
      ctx.translate(0,-2);ctx.rotate(Math.PI/4);ctx.strokeStyle='#efffff';ctx.lineWidth=4;ctx.strokeRect(-18,-18,36,36);ctx.rotate(-Math.PI/4);ctx.fillStyle='#64f2ff';ctx.font='900 25px Impact';ctx.textAlign='center';ctx.fillText('9',0,9);ctx.restore();}
    ctx.restore();
  }ctx.restore();
}

function drawHero(entity, alpha = 1, afterimage = false) {
  const moveSheet=assets[heroDef.moveAsset];const fireSheet=assets[heroDef.fireAsset];const stateSheet=assets[heroDef.stateAsset];
  if(!moveSheet?.complete||!moveSheet.naturalWidth)return;
  const moving = Math.hypot(entity.vx || 0, entity.vy || 0);
  const time = performance.now() / 1000;
  const stateName = afterimage ? 'dash' : state==='won' ? 'victory' : entity.health <= 0 || state==='lost' ? 'death' : entity.stunTime > 0 ? 'stun' : entity.hurtTime > 0 ? 'hit' : entity.dashTime > 0 ? 'dash' : entity.attack ? 'attack1' : entity.castTime > 0 ? 'cast' : moving > 45 ? 'run' : 'idle';
  const animation = SPRITE_ANIMATIONS[stateName] || SPRITE_ANIMATIONS.idle;
  const rawDirection=directionIndex(entity.facing);const direction=heroDef.directionMap?.[rawDirection]??rawDirection;
  const firing=!afterimage&&stateName.startsWith('attack')&&fireSheet?.complete&&fireSheet.naturalWidth;
  const specialFrames={undertowWell:0,foxfireVolley:1,wildHeart:2,shockPaws:3,hit:4,stun:5,death:6,victory:7};
  const specialFrame=stateName==='cast'?specialFrames[entity.castAbility]:(specialFrames[stateName]??-1);
  const authoredState=!afterimage&&specialFrame>=0&&stateSheet?.complete&&stateSheet.naturalWidth;
  const sheet=authoredState?stateSheet:firing?fireSheet:moveSheet;
  const sw = sheet.naturalWidth / 4; const sh = sheet.naturalHeight / (authoredState?2:4);
  const useRunFrame = !firing && (stateName === 'dash' || (stateName === 'run' && Math.floor(time * 10) % 2 === 1));
  const fireStage = firing && entity.attack?.time > (weapon.releaseDelay||.045) ? 2 : 0;
  const sx = authoredState?(specialFrame%4)*sw:(direction % 4) * sw; const sy = authoredState?Math.floor(specialFrame/4)*sh:(Math.floor(direction / 4) + (firing ? fireStage : useRunFrame ? 2 : 0)) * sh;
  const runBob = stateName === 'run' ? Math.sin(time * animation.fps * Math.PI*(entity.sprinting?1.5:1)) * (entity.sprinting?5:3) : 0;
  const speedLean = clamp(moving / heroDef.speed, 0, 1) * .06;
  let scaleX = 1, scaleY = 1, rotation = 0;
  if (stateName === 'run') { const pace=entity.sprinting?30:20;scaleX = 1 + Math.sin(time * pace) * (entity.sprinting?.065:.035); scaleY = 1 - Math.sin(time * pace) * (entity.sprinting?.055:.03); rotation = Math.cos(entity.moveFacing ?? entity.facing) * speedLean*(entity.sprinting?1.8:1); }
  if (stateName === 'dash') { scaleX = 1.28; scaleY = .88; rotation = Math.cos(entity.facing) * .08; }
  if (firing) {
    const p = clamp(entity.attack?.time / entity.attack?.definition.duration || .5, 0, 1);
    scaleX = 1 + Math.sin(p * Math.PI) * .1; scaleY = 1 - Math.sin(p * Math.PI) * .06;
    rotation = -Math.cos(entity.facing) * Math.sin(p * Math.PI) * .06;
  }
  if (!authoredState&&stateName === 'hit') rotation = Math.sin(time * 45) * .08;
  const bamboo=selectedHeroId==='bamboo';const hopscotch=selectedHeroId==='hopscotch';const rusty=selectedHeroId==='rusty';const zap=selectedHeroId==='zap';const nomi=selectedHeroId==='nomi';const baseH=bamboo?(firing?142:136):hopscotch?(firing?126:122):rusty?(firing?124:120):zap?(firing?126:122):nomi?(firing?140:132):(firing?112:108);const h=authoredState?(bamboo?154:hopscotch?142:rusty?140:zap?142:nomi?152:136):baseH;const w=h*(sw/sh);
  drawContactShadow(entity.x,entity.y+(bamboo?15:hopscotch||rusty||zap||nomi?13:12),entity.dashTime>0?(bamboo?16:hopscotch||rusty||zap||nomi?12:13):(bamboo?24:hopscotch?18:rusty?19:zap?18:nomi?18:19),entity.dashTime>0?(bamboo?4.4:3.5):(bamboo?6.4:hopscotch?5:rusty?5.2:zap?4.8:nomi?4.9:5.5),.34*alpha);
  if (!afterimage && entity.wildHeartTime > 0) {
    const pulse = .2 + Math.sin(time * 7) * .035;
    if (!drawAtlasFrame(assets.wildHeartVfx, 5, entity.x, entity.y + 5, 104, 78, 0, pulse, '#62f05f')) {
      ctx.save(); ctx.translate(entity.x, entity.y + 3); ctx.scale(1, .44); ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#6cf25b'; ctx.shadowColor = '#6cf25b'; ctx.shadowBlur = 18; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, 31 + Math.sin(time * 6) * 3, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
  }
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(entity.x, entity.y);
  ctx.translate(0, runBob); ctx.rotate(rotation); ctx.scale((authoredState&&Math.cos(entity.facing)<0?-1:1)*scaleX, scaleY);
  ctx.shadowColor=afterimage?'#8f3dff':entity.dashTime>0?heroDef.accent:(bamboo?'#63ef79':hopscotch?'#ff4fa5':rusty?'#ff9b32':'#ff4d76');ctx.shadowBlur=afterimage?24:entity.dashTime>0?16:4;
  ctx.filter = afterimage ? 'hue-rotate(68deg) saturate(1.8) brightness(1.4)' : entity.flash > 0 ? 'brightness(2.4) saturate(.4)' : 'none';
  ctx.drawImage(sheet, sx, sy, sw, sh, -w/2, -h*.82, w, h);
  ctx.restore(); ctx.filter = 'none'; ctx.globalAlpha = 1;
  if(!afterimage&&entity.spiritShield>0){const ratio=clamp(entity.spiritShield/Math.max(1,entity.maxSpiritShield),0,1);ctx.save();ctx.translate(entity.x,entity.y-30);ctx.scale(1,.72);ctx.globalAlpha=.22+ratio*.25;ctx.strokeStyle='#9affc0';ctx.shadowColor='#72f0a0';ctx.shadowBlur=16;ctx.lineWidth=3;ctx.setLineDash([12,8]);ctx.lineDashOffset=-time*28;ctx.beginPath();ctx.arc(0,0,46,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
  if(!afterimage&&entity.bleedTime>0){ctx.save();ctx.translate(entity.x,entity.y-46);ctx.globalAlpha=.45+Math.sin(time*11)*.08;ctx.strokeStyle='#ff526f';ctx.lineWidth=3;ctx.shadowColor='#ff365f';ctx.shadowBlur=11;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*7-3,-7);ctx.lineTo(i*7+3,7);ctx.stroke();}ctx.restore();}
  if(!afterimage&&entity.curseTime>0){const pulse=.48+Math.sin(time*7)*.08;ctx.save();ctx.translate(entity.x,entity.y-62);ctx.globalAlpha=pulse;ctx.strokeStyle='#d68cff';ctx.shadowColor='#b84dff';ctx.shadowBlur=18;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,18,Math.PI*.18,Math.PI*1.82);ctx.stroke();ctx.fillStyle='#170525';ctx.beginPath();ctx.arc(6,-3,13,0,Math.PI*2);ctx.fill();ctx.restore();}
  if (!afterimage && entity.stunTime > 0 && !authoredState) {
    ctx.save(); ctx.translate(entity.x, entity.y - 82); ctx.rotate(time * 3.6); ctx.shadowColor='#ffd33d'; ctx.shadowBlur=16;
    for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI*2/3);ctx.translate(27,0);ctx.rotate(-time*5);ctx.fillStyle=i%2?'#fff3a0':'#ffd33d';ctx.beginPath();for(let p=0;p<10;p++){const radius=p%2?4:10;const a=p/10*Math.PI*2-Math.PI/2;p?ctx.lineTo(Math.cos(a)*radius,Math.sin(a)*radius):ctx.moveTo(Math.cos(a)*radius,Math.sin(a)*radius);}ctx.closePath();ctx.fill();ctx.restore();}ctx.restore();
  }
}

function directionIndex(angle) {
  return (Math.round((Math.PI / 2 - angle) / (Math.PI / 4)) + 8) % 8;
}

function enemyMotion(enemy){
  const speed=Math.hypot(enemy.vx||0,enemy.vy||0),moving=!enemy.dead&&['chase','bossIdle'].includes(enemy.state)&&speed>24;const heavy=enemy.def.behavior==='heavy'||enemy.def.behavior==='boss';
  const t=performance.now()/1000+(enemy.spawnIndex||0)*.31,cadence=(heavy?5.8:9.8)*clamp(speed/Math.max(80,enemy.def.speed||160),.72,1.65),step=Math.sin(t*cadence);let x=0,y=moving?-Math.abs(step)*(heavy?7:5):0,rotation=moving?step*(heavy?.018:.04)*Math.sign(Math.cos(enemy.facing)||1):0,scaleX=moving?1+Math.abs(step)*(heavy?.025:.045):1,scaleY=moving?1-Math.abs(step)*(heavy?.02:.04):1,filter='none';
  if(enemy.state==='enter'){const p=clamp(1-enemy.stateTime/(enemy.spawnDuration||1.35),0,1);y=18*(1-p);scaleX=1+.04*Math.sin(p*Math.PI);scaleY=.92+.08*p;}
  if(enemy.freezeTime>0){x=0;y=2;rotation=0;scaleX=.98;scaleY=1.02;filter='brightness(1.35) saturate(.65) hue-rotate(135deg)';}
  else if(enemy.abilityReactTime>0){const p=enemy.abilityReactTime/(enemy.abilityReactType==='shock'?.48:enemy.abilityReactType==='burn'?.38:.44),wave=Math.sin(t*48+enemy.abilityReactSeed);if(enemy.abilityReactType==='shock'){x=wave*7;y+=Math.cos(t*55)*4;rotation=wave*.07;filter='brightness(1.75) saturate(1.8) hue-rotate(18deg)';}else if(enemy.abilityReactType==='burn'){x=wave*3;rotation=wave*.055;scaleX=1.08;scaleY=.92;filter='brightness(1.35) saturate(1.7) sepia(.35)';}else if(enemy.abilityReactType==='frost'){x=wave*2;scaleX=1.03;scaleY=.97;filter='brightness(1.45) saturate(.85) hue-rotate(130deg)';}else{y+=7;rotation=-Math.cos(enemy.facing)*.09;scaleX=1.12;scaleY=.84;filter='brightness(1.35) saturate(1.45) hue-rotate(145deg)';}}
  if(enemy.hitReactTime>0){const p=clamp(enemy.hitReactTime/Math.max(.01,enemy.hitReactMax||.2),0,1),kick=Math.sin(p*Math.PI)*(enemy.hitReactPower||.5);x-=(enemy.hitReactX||0)*(heavy?8:17)*kick;y-=(enemy.hitReactY||0)*(heavy?4:9)*kick-Math.sin(p*Math.PI)*(heavy?2:5);rotation-=(enemy.hitReactX||0)*(heavy?.025:.09)*kick;scaleX*=1+kick*(heavy?.025:.075);scaleY*=1-kick*(heavy?.018:.06);}
  return {x,y,rotation,scaleX,scaleY,filter,moving};
}

function drawEnemyStatusBack(enemy,width=135,height=105){
  if(enemy.dead)return;if(enemy.burnTime>0)drawAtlasFrame(assets.burnStatusVfx,Math.floor(performance.now()/90+enemy.id)%6,enemy.x,enemy.y+4,width,height,0,.42,'#ff6828');
  if(enemy.wetTime>0)drawAtlasFrame(assets.waterImpactVfx,5,enemy.x,enemy.y+13,width*.82,height*.5,0,.32,'#35e7ff');
  if(enemy.shockTime>0)drawAtlasFrame(assets.shockImpactVfx,4,enemy.x,enemy.y+2,width*.92,height*.72,0,clamp(enemy.shockTime/.55,0,1)*.38,'#d94cff');
  if(enemy.bleedTime>0){ctx.save();ctx.translate(enemy.x,enemy.y+4);ctx.globalAlpha=.33+Math.sin(performance.now()/82+enemy.id)*.07;ctx.strokeStyle='#ff365f';ctx.shadowColor='#ff365f';ctx.shadowBlur=12;ctx.lineWidth=3;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*width*.08-width*.04,-height*.2);ctx.lineTo(i*width*.08+width*.04,height*.2);ctx.stroke();}ctx.restore();}
  if(enemy.curseTime>0){ctx.save();ctx.translate(enemy.x,enemy.y+7);ctx.scale(1,.55);ctx.globalAlpha=.34;ctx.strokeStyle='#d68cff';ctx.shadowColor='#b84dff';ctx.shadowBlur=17;ctx.lineWidth=4;ctx.setLineDash([12,9]);ctx.lineDashOffset=-performance.now()/38;ctx.beginPath();ctx.arc(0,0,width*.38,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
  if(enemy.conductiveStacks>0)drawAtlasFrame(assets.zapArcVfx,enemy.conductiveStacks>1?1:0,enemy.x,enemy.y-4,width*.72,height*.62,0,.28+enemy.conductiveStacks*.08,'#39eaff');
  if(enemy.freezeTime>0)drawGridAtlasFrame(assets.arsenalReactionsVfx,2,3,2,enemy.x,enemy.y-height*.2,width*1.28,height*1.48,0,.88,'#67edff');
  else if(enemy.chillStacks>0)drawGridAtlasFrame(assets.arsenalReactionsVfx,enemy.chillStacks>1?1:0,3,2,enemy.x,enemy.y-height*.08,width*(enemy.chillStacks>1?1.12:.85),height*(enemy.chillStacks>1?1.22:.78),0,.52,'#67edff');
}

function drawCoopPlayer(member){
  const remoteHero=HEROES[member.hero]||HEROES.kitsune;const sheet=assets[remoteHero.moveAsset];if(!sheet?.complete||!sheet.naturalWidth)return;
  const rawDirection=directionIndex(member.facing||0),direction=remoteHero.directionMap?.[rawDirection]??rawDirection;const sw=sheet.naturalWidth/4,sh=sheet.naturalHeight/4;const sx=(direction%4)*sw,sy=Math.floor(direction/4)*sh;const h=member.hero==='bamboo'?136:member.hero==='hopscotch'?122:member.hero==='rusty'?120:member.hero==='zap'?122:member.hero==='nomi'?132:108,w=h*(sw/sh);
  drawContactShadow(member.x,member.y+13,member.hero==='bamboo'?24:19,member.hero==='bamboo'?6.4:5.3,.3);ctx.save();ctx.translate(member.x,member.y);ctx.shadowColor=remoteHero.accent;ctx.shadowBlur=13;ctx.drawImage(sheet,sx,sy,sw,sh,-w/2,-h*.82,w,h);ctx.restore();ctx.save();ctx.translate(member.x,member.y-h*.96);ctx.textAlign='center';ctx.font='900 10px Inter,sans-serif';ctx.lineWidth=4;ctx.strokeStyle='#070812';ctx.strokeText(member.name||remoteHero.name,0,0);ctx.fillStyle=remoteHero.accent;ctx.fillText(member.name||remoteHero.name,0,0);ctx.restore();
}

function drawBoss(enemy){
  const time=performance.now()/1000;const alpha=enemy.dead?clamp(enemy.deathTime/2.8,0,1):1;const bamboo=enemy.def.biome==='bamboo';const crimson=enemy.def.biome==='crimson';const storm=enemy.def.biome==='storm';const neon=enemy.def.biome==='neon';const shadow=enemy.def.biome==='shadow';const bossColor=enemy.def.color;
  const stateFrames={enter:0,bossIdle:0,bossWindupSweep:1,bossSweep:2,bossWindupSlam:1,bossSlam:3,bossChannel:4,bossWindupCrossfire:4,bossCrossfire:3,bossWindupSignature:4,bossSignature:3,bossEnrage:5};
  const frame=enemy.dead?5:(stateFrames[enemy.state]??0);
  const motion=enemyMotion(enemy);drawContactShadow(enemy.x,enemy.y+26,shadow?106:neon?100:storm?94:crimson?88:bamboo?82:76,shadow?21:neon?20:storm?19:crimson?18:bamboo?17:16,.42*alpha);drawEnemyStatusBack(enemy,shadow?430:neon?405:storm?380:340,shadow?310:neon?292:storm?272:245);
  if(enemy.counterTime>0){const profile=BOSS_PROFILES[enemy.def.id],pulse=1+Math.sin(time*12)*.08;ctx.save();ctx.translate(enemy.x,enemy.y+18);ctx.scale(1,.52);ctx.globalAlpha=.72;ctx.strokeStyle='#ffe36a';ctx.shadowColor='#ffe36a';ctx.shadowBlur=28;ctx.lineWidth=8;ctx.setLineDash([28,11,6,11]);ctx.lineDashOffset=-performance.now()/28;ctx.beginPath();ctx.arc(0,0,enemy.radius*1.45*pulse,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();ctx.save();ctx.translate(enemy.x,enemy.y-230);ctx.textAlign='center';ctx.font='italic 900 18px Impact';ctx.lineWidth=7;ctx.strokeStyle='#10040d';ctx.strokeText(`COUNTER x${profile.counterMultiplier.toFixed(2)}`,0,0);ctx.fillStyle='#fff2a8';ctx.fillText(`COUNTER x${profile.counterMultiplier.toFixed(2)}`,0,0);ctx.restore();}
  ctx.save();ctx.translate(enemy.x,enemy.y);
  if(enemy.state==='bossWindupSweep'){
    const p=1-clamp(enemy.stateTime/(enemy.patternWindup||BOSS_PATTERNS.sweep.windup),0,1);ctx.rotate(enemy.facing);ctx.fillStyle=`rgba(255,48,88,${.08+p*.14})`;ctx.strokeStyle=`rgba(255,66,101,${.55+p*.4})`;ctx.lineWidth=8;ctx.shadowColor='#ff315f';ctx.shadowBlur=18;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,enemy.def.attackRange+60,-1.74,1.74);ctx.closePath();ctx.fill();ctx.stroke();
  } else if(enemy.state==='bossWindupSlam'){
    const p=1-clamp(enemy.stateTime/(enemy.patternWindup||BOSS_PATTERNS.slam.windup),0,1);ctx.fillStyle=`rgba(255,42,84,${.07+p*.14})`;ctx.strokeStyle=`rgba(255,58,92,${.5+p*.48})`;ctx.lineWidth=9;ctx.setLineDash([42,16,9,14]);ctx.lineDashOffset=-performance.now()/35;ctx.beginPath();ctx.arc(0,12,enemy.def.slamRadius,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([]);
  } else if(enemy.state==='bossChannel'){
    const p=1-clamp(enemy.stateTime/1.45,0,1);ctx.strokeStyle=shadow?`rgba(184,77,255,${.5+p*.5})`:neon?`rgba(255,58,184,${.5+p*.5})`:storm?`rgba(55,223,255,${.5+p*.5})`:crimson?`rgba(255,91,39,${.5+p*.5})`:bamboo?`rgba(65,245,218,${.45+p*.5})`:`rgba(140,255,57,${.45+p*.5})`;ctx.lineWidth=6;ctx.shadowColor=bossColor;ctx.shadowBlur=24;for(let i=1;i<=3;i++){ctx.setLineDash([20+i*7,12]);ctx.lineDashOffset=(i%2?1:-1)*performance.now()/45;ctx.beginPath();ctx.arc(0,0,85+i*54+p*18,0,Math.PI*2);ctx.stroke();}ctx.setLineDash([]);
  } else if(enemy.state==='bossWindupCrossfire'||enemy.state==='bossCrossfire'){
    const profile=BOSS_PROFILES[enemy.def.id];const active=enemy.state==='bossCrossfire';const p=active?1:1-clamp(enemy.stateTime/(enemy.patternWindup||BOSS_PATTERNS.crossfire.windup),0,1);
    ctx.translate(enemy.patternTargetX-enemy.x,enemy.patternTargetY-enemy.y);ctx.globalCompositeOperation='lighter';ctx.shadowColor=bossColor;ctx.shadowBlur=active?42:18;
    for(let i=0;i<profile.crossfireLanes;i++){ctx.save();ctx.rotate(enemy.patternAngle+i*Math.PI/profile.crossfireLanes);ctx.fillStyle=active?'rgba(255,245,216,.55)':`rgba(255,45,124,${.04+p*.1})`;ctx.strokeStyle=active?'#fff4c4':bossColor;ctx.lineWidth=active?12:4+p*6;ctx.setLineDash(active?[]:[32,18,8,15]);ctx.lineDashOffset=-performance.now()/26;ctx.fillRect(-1700,-profile.crossfireWidth,3400,profile.crossfireWidth*2);ctx.beginPath();ctx.moveTo(-1700,0);ctx.lineTo(1700,0);ctx.stroke();ctx.restore();}
    ctx.setLineDash([]);ctx.globalCompositeOperation='source-over';ctx.strokeStyle=active?'#fff4c4':bossColor;ctx.lineWidth=active?10:5;ctx.beginPath();ctx.arc(0,0,42+p*28,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
  const bob=enemy.state==='bossIdle'?Math.sin(time*2.3)*4:0;const pulse=enemy.state==='bossEnrage'?1+Math.sin(time*15)*.035:1;
  ctx.save();ctx.filter=enemy.flash>0?'brightness(2.2) saturate(.35)':motion.filter;ctx.globalAlpha=alpha;ctx.translate(enemy.x+motion.x,enemy.y+bob+motion.y);ctx.rotate(motion.rotation);ctx.scale(pulse*motion.scaleX,pulse*motion.scaleY);
  const bossSheet=shadow?assets.tsukikoEmpress:neon?assets.daikyoOni:storm?assets.raijinKirin:crimson?assets.pyreclawShogun:bamboo?assets.moonfangKomainu:assets.jadeguardTanuki;
  const moveSheet=shadow?assets.tsukikoEmpressMove:neon?assets.daikyoOniMove:storm?assets.raijinKirinMove:crimson?assets.pyreclawShogunMove:bamboo?assets.moonfangKomainuMove:assets.jadeguardTanukiMove;
  const bossSize=shadow?730:neon?690:storm?650:crimson?600:bamboo?540:500;const useMove=motion.moving&&enemy.state==='bossIdle'&&moveSheet?.complete&&moveSheet.naturalWidth;const bossYOffset=shadow?-154:neon?-145:storm?-138:crimson?-125:bamboo?-112:-104;
  if(useMove){const speed=Math.hypot(enemy.vx||0,enemy.vy||0),cadence=clamp(speed/32,2.8,5.2),moveFrame=Math.floor((time+(enemy.spawnIndex||0)*.19)*cadence)%2;drawGridAtlasFrame(moveSheet,moveFrame,2,1,0,bossYOffset,bossSize,bossSize,0,1,enemy.bossPhase>=3?'#ff3fbc':bossColor);}
  else drawAtlasFrame(bossSheet,frame,0,bossYOffset,bossSize,bossSize,0,1,enemy.bossPhase>=3?'#ff3fbc':bossColor);ctx.restore();ctx.filter='none';
  if(enemy.dead){const p=1-alpha;ctx.save();ctx.translate(enemy.x,enemy.y-80);ctx.globalAlpha=alpha;ctx.strokeStyle=bossColor;ctx.shadowColor=bossColor;ctx.shadowBlur=32;ctx.lineWidth=12;ctx.beginPath();ctx.arc(0,0,80+p*260,0,Math.PI*2);ctx.stroke();ctx.restore();}
}

function drawBambooEnemy(enemy) {
  const baseSheet=enemy.def.biome==='shadow'?assets.shadowEnemies:enemy.def.biome==='neon'?assets.neonEnemies:enemy.def.biome==='storm'?assets.stormEnemies:enemy.def.biome==='crimson'?assets.crimsonEnemies:assets.bambooEnemies;
  const moveSheet=enemy.def.biome==='shadow'?assets.shadowEnemiesMove:enemy.def.biome==='neon'?assets.neonEnemiesMove:enemy.def.biome==='storm'?assets.stormEnemiesMove:enemy.def.biome==='crimson'?assets.crimsonEnemiesMove:assets.bambooEnemiesMove;
  if (!baseSheet.complete || !baseSheet.naturalWidth) return;
  const definition=enemy.def;const alpha=enemy.dead?clamp(enemy.deathTime/.72,0,1):1;
  const attacking=['windup','strike','slam','recover'].includes(enemy.state);const motion=enemyMotion(enemy);const useMove=!attacking&&motion.moving&&moveSheet?.complete&&moveSheet.naturalWidth;
  const speed=Math.hypot(enemy.vx||0,enemy.vy||0),cadence=clamp(speed/24,4.2,10.5),walkRow=Math.floor((performance.now()/1000+(enemy.spawnIndex||0)*.17)*cadence)%2;
  const sheet=useMove?moveSheet:baseSheet;const frame=definition.spriteColumn+(attacking?3:useMove?walkRow*3:0);
  const sw=sheet.naturalWidth/3,sh=sheet.naturalHeight/2;
  const sx=(frame%3)*sw,sy=Math.floor(frame/3)*sh;const lateAtlas=definition.biome==='storm'||definition.biome==='neon'||definition.biome==='shadow';const baseH=(lateAtlas?(definition.behavior==='heavy'?112:102):(definition.behavior==='heavy'?148:138))*definition.scale;const baseW=baseH*(sw/sh);
  const flip=Math.cos(enemy.facing)<0?-1:1;let scaleX=1,scaleY=1,rotation=0;
  if(enemy.state==='enter'){scaleX=1;scaleY=1;}
  if(enemy.state==='windup'){scaleX=1.08;scaleY=.92;}
  if(enemy.state==='strike'){scaleX=1.22;scaleY=.86;rotation=flip*.07;}
  if(enemy.state==='slam'){scaleX=1.18;scaleY=.84;}
  if(enemy.state==='stagger'){rotation=-flip*.12;scaleX=.92;scaleY=1.08;}
  if(enemy.dead){rotation=flip*(1-alpha)*1.05;scaleY=.7+alpha*.3;}
  scaleX*=motion.scaleX;scaleY*=motion.scaleY;rotation+=motion.rotation;drawContactShadow(enemy.x,enemy.y+13,definition.behavior==='heavy'?26:15,definition.behavior==='heavy'?6:4,.31*alpha);drawEnemyStatusBack(enemy,definition.behavior==='heavy'?175:125,definition.behavior==='heavy'?130:90);
  ctx.save();ctx.globalAlpha=enemy.state==='enter'?alpha*clamp(1-enemy.stateTime/(enemy.spawnDuration||1.35),0,1):alpha;ctx.translate(enemy.x+motion.x,enemy.y+motion.y);drawEnemyTelegraph(enemy);ctx.rotate(rotation);ctx.scale(flip*scaleX,scaleY);
  ctx.shadowColor=definition.color;ctx.shadowBlur=enemy.state==='windup'?18:5;ctx.filter=enemy.flash>0?'brightness(2.6) saturate(.2)':motion.filter;
  ctx.drawImage(sheet,sx,sy,sw,sh,-baseW/2,-baseH*.78,baseW,baseH);ctx.restore();ctx.filter='none';ctx.globalAlpha=1;
  if(!enemy.dead)drawEnemyHealth(enemy);
}

function drawEliteAura(enemy){
  const elite=enemy.eliteDef;if(!elite)return;const time=performance.now()/1000;const pulse=1+Math.sin(time*5+enemy.id)*.06;ctx.save();ctx.translate(enemy.x,enemy.y+9);ctx.scale(1,.52);ctx.globalAlpha=.72;ctx.shadowColor=elite.color;ctx.shadowBlur=18;ctx.strokeStyle=elite.color;ctx.lineWidth=4;ctx.setLineDash([18,10,4,9]);ctx.lineDashOffset=-time*42;ctx.beginPath();ctx.arc(0,0,enemy.radius*1.6*pulse,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=.12;ctx.fillStyle=elite.color;ctx.beginPath();ctx.arc(0,0,enemy.radius*1.48*pulse,0,Math.PI*2);ctx.fill();ctx.restore();
  if(enemy.shield>0){const ratio=enemy.shield/enemy.maxShield;ctx.save();ctx.translate(enemy.x,enemy.y-enemy.radius*.45);ctx.globalAlpha=.28+ratio*.36;ctx.strokeStyle=elite.color;ctx.shadowColor=elite.color;ctx.shadowBlur=20;ctx.lineWidth=4;ctx.setLineDash([16,8]);ctx.lineDashOffset=time*34;ctx.beginPath();ctx.arc(0,0,enemy.radius*1.28,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
}

function drawSpecialEnemy(enemy){
  const sheet=assets[enemy.type];if(!sheet?.complete||!sheet.naturalWidth)return;
  const definition=enemy.def;const alpha=enemy.dead?clamp(enemy.deathTime/.72,0,1):1;
  const direction=directionIndex(enemy.facing);const attacking=['windup','strike','recover'].includes(enemy.state)&&enemy.state!=='recover' || enemy.state==='recover'&&enemy.stateTime>.28;
  const moving=!attacking&&!enemy.dead&&enemy.state==='chase';const poseOffset=attacking?4:moving?2:0;
  const sw=sheet.naturalWidth/4,sh=sheet.naturalHeight/6;const sx=(direction%4)*sw,sy=(Math.floor(direction/4)+poseOffset)*sh;
  const lateSpecial=['conductor','hacker','curser'].includes(definition.behavior);const baseH=definition.behavior==='shield'?176:lateSpecial?158:definition.behavior==='bomber'?148:definition.behavior==='assassin'?142:152;const baseW=baseH*(sw/sh);const motion=enemyMotion(enemy);
  let scaleX=motion.scaleX,scaleY=motion.scaleY,rotation=motion.rotation;if(enemy.state==='windup'){scaleX*=1.06;scaleY*=.94;}if(enemy.state==='strike'){scaleX*=1.15;scaleY*=.88;}if(enemy.state==='stagger'){rotation-=.1;scaleX*=.94;scaleY*=1.06;}if(enemy.dead){rotation=(1-alpha)*.92;scaleY=.7+alpha*.3;}
  const shadowX=definition.behavior==='shield'?28:19;drawContactShadow(enemy.x,enemy.y+13,shadowX,shadowX*.21,.32*alpha);drawEnemyStatusBack(enemy,definition.behavior==='shield'?175:130,definition.behavior==='shield'?128:94);
  const mistAlpha=definition.behavior==='assassin'&&enemy.state==='windup' ? .32+clamp(enemy.stateTime/definition.windup,0,1)*.58 : 1;ctx.save();ctx.translate(enemy.x,enemy.y);drawEnemyTelegraph(enemy);ctx.restore();ctx.save();ctx.globalAlpha=alpha*mistAlpha*(enemy.state==='enter'?clamp(1-enemy.stateTime/(enemy.spawnDuration||1.35),0,1):1);ctx.translate(enemy.x+motion.x,enemy.y+motion.y);ctx.rotate(rotation);ctx.scale(scaleX,scaleY);ctx.filter=enemy.flash>0?'brightness(2.55) saturate(.3)':motion.filter;ctx.shadowColor=definition.color;ctx.shadowBlur=enemy.state==='windup'?18:5;ctx.drawImage(sheet,sx,sy,sw,sh,-baseW/2,-baseH*.79,baseW,baseH);ctx.restore();ctx.filter='none';ctx.globalAlpha=1;
  if(definition.behavior==='shield'&&enemy.shield>0&&!enemy.dead){const ratio=enemy.shield/enemy.maxShield;ctx.save();ctx.translate(enemy.x,enemy.y-12);ctx.rotate(enemy.facing);ctx.scale(1,.72);ctx.globalAlpha=.34+ratio*.38;ctx.strokeStyle='#ff5b3a';ctx.shadowColor='#ff3828';ctx.shadowBlur=20;ctx.lineWidth=7;ctx.setLineDash([18,7]);ctx.lineDashOffset=-performance.now()/45;ctx.beginPath();ctx.arc(0,0,69,-.78,.78);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
  if(!enemy.dead)drawEnemyHealth(enemy);
}

function drawEnemy(enemy) {
  if (enemy.state === 'waiting') return;
  if(enemy.eliteId&&!enemy.dead)drawEliteAura(enemy);
  if(enemy.def.behavior==='boss'){drawBoss(enemy);return;}
  if(['bellweaverCat','powderkegToad','gatewardenRhino','mistclawLynx','tidechantHeron','kernelHackerTanuki','moonveilSeer'].includes(enemy.type)){drawSpecialEnemy(enemy);return;}
  if(enemy.def.biome==='bamboo'||enemy.def.biome==='crimson'||enemy.def.biome==='storm'||enemy.def.biome==='neon'||enemy.def.biome==='shadow'){drawBambooEnemy(enemy);return;}
  if (!assets.enemies.complete || !assets.enemies.naturalWidth) return;
  const definition = enemy.def;
  const alpha = enemy.dead ? clamp(enemy.deathTime / .72, 0, 1) : 1;
  const inAttack = enemy.state === 'windup' || enemy.state === 'strike' || enemy.state === 'slam' || (enemy.def.behavior === 'ranged' && enemy.state === 'recover' && enemy.stateTime > .18);
  const attackSheet = enemy.def.behavior === 'ranged' ? assets.archerAttack : enemy.def.behavior === 'heavy' ? assets.boarAttack : assets.raccoonAttack;
  const directionalMove = !inAttack && enemy.def.behavior === 'ranged';
  const sheet = inAttack ? attackSheet : directionalMove ? assets.archerMove : assets.enemies;
  const direction = directionIndex(enemy.facing);
  const sw = sheet.naturalWidth / (inAttack || directionalMove ? 4 : 3); const sh = sheet.naturalHeight / 4;
  const movingFrame = !inAttack && !enemy.dead && enemy.state === 'chase' && Math.floor(performance.now()/115 + enemy.spawnIndex) % 2 === 1;
  const attackStage = enemy.state === 'strike' || enemy.state === 'slam' || (enemy.def.behavior === 'ranged' && enemy.state === 'recover') ? 2 : 0;
  const row = inAttack || directionalMove ? Math.floor(direction / 4) + (inAttack ? attackStage : movingFrame ? 2 : 0) : (Math.sin(enemy.facing) < -.05 ? 1 : 0) + (movingFrame ? 2 : 0);
  const column = inAttack || directionalMove ? direction % 4 : definition.spriteColumn;
  const flip = inAttack || directionalMove ? 1 : Math.cos(enemy.facing) < 0 ? -1 : 1;
  const baseH = 104 * definition.scale; const w = baseH * (sw / sh);const motion=enemyMotion(enemy);
  let scaleX = motion.scaleX, scaleY = motion.scaleY, rotation = motion.rotation;
  if (enemy.state === 'windup') { scaleX = 1.1; scaleY = .9; }
  if (enemy.state === 'strike') { scaleX = 1.2; scaleY = .88; rotation = flip * .08; }
  if (enemy.state === 'slam') { scaleX = 1.22; scaleY = .82; rotation = flip * .04; }
  if (enemy.state === 'stagger') { rotation = -flip * .12; scaleX = .92; scaleY = 1.08; }
  if (enemy.dead) { rotation = flip * (1 - alpha) * 1.05; scaleY = .72 + alpha * .28; }
  drawContactShadow(enemy.x, enemy.y + 12, definition.behavior === 'heavy' ? 23 : 14, definition.behavior === 'heavy' ? 5.5 : 3.7, .32 * alpha);drawEnemyStatusBack(enemy,definition.behavior==='heavy'?160:115,definition.behavior==='heavy'?120:86);
  ctx.save(); ctx.globalAlpha = alpha*(enemy.state==='enter'?clamp(1-enemy.stateTime/(enemy.spawnDuration||1.35),0,1):1); ctx.translate(enemy.x+motion.x, enemy.y+motion.y); drawEnemyTelegraph(enemy);
  ctx.rotate(rotation); ctx.scale(flip * scaleX, scaleY);
  ctx.shadowColor = definition.color; ctx.shadowBlur = enemy.state === 'windup' ? 18 : 5;
  ctx.filter = enemy.flash > 0 ? 'brightness(2.6) saturate(.2)' : motion.filter;
  ctx.drawImage(sheet, column * sw, row * sh, sw, sh, -w/2, -baseH*.79, w, baseH);
  ctx.restore(); ctx.filter = 'none'; ctx.globalAlpha = 1;
  if (!enemy.dead) drawEnemyHealth(enemy);
}

function drawContactShadow(x, y, radiusX, radiusY, alpha) {
  ctx.save(); ctx.translate(x,y); ctx.scale(1, radiusY/radiusX);
  const gradient=ctx.createRadialGradient(0,0,1,0,0,radiusX);
  gradient.addColorStop(0,`rgba(0,0,7,${alpha})`); gradient.addColorStop(.52,`rgba(0,0,7,${alpha*.72})`); gradient.addColorStop(1,'rgba(0,0,7,0)');
  ctx.fillStyle=gradient; ctx.beginPath(); ctx.arc(0,0,radiusX,0,Math.PI*2); ctx.fill(); ctx.restore();
}

function drawEnemyTelegraph(enemy) {
  if (enemy.state === 'enter') {
    const pulse = .5 + Math.sin(performance.now()/90) * .2; ctx.strokeStyle = `${enemy.def.color}${Math.round(pulse*255).toString(16).padStart(2,'0')}`; ctx.lineWidth = 4;
    ctx.setLineDash([18,8,4,8]);ctx.lineDashOffset=-performance.now()/70;ctx.beginPath(); ctx.arc(0,8,enemy.radius*1.7,0,Math.PI*2); ctx.stroke();ctx.setLineDash([]);
    for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;ctx.save();ctx.rotate(a);ctx.fillStyle=enemy.def.color;ctx.beginPath();ctx.moveTo(enemy.radius*1.42,0);ctx.lineTo(enemy.radius*1.75,-6);ctx.lineTo(enemy.radius*1.75,6);ctx.closePath();ctx.fill();ctx.restore();} return;
  }
  if (enemy.state !== 'windup') return;
  const p=1-enemy.stateTime/(enemy.def.windup*(enemy.windupScale||1));
  if(enemy.def.behavior==='assassin'){
    const dx=(enemy.blinkX??enemy.x)-enemy.x,dy=(enemy.blinkY??enemy.y)-enemy.y;ctx.save();ctx.strokeStyle=`rgba(196,86,255,${.5+p*.48})`;ctx.fillStyle=`rgba(189,88,255,${.07+p*.12})`;ctx.shadowColor='#bd58ff';ctx.shadowBlur=18;ctx.lineWidth=4;ctx.setLineDash([15,9]);ctx.lineDashOffset=-performance.now()/30;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(dx,dy);ctx.stroke();ctx.setLineDash([]);ctx.translate(dx,dy);ctx.scale(1,.58);ctx.beginPath();ctx.arc(0,0,45+p*18,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.rotate(Math.PI/4);ctx.strokeRect(-15,-15,30,30);ctx.restore();
  } else if(enemy.def.behavior==='summoner'){
    drawAtlasFrame(assets.specialEnemyVfx,p<.55?0:1,0,10,220+p*55,168+p*40,0,.38+p*.42,'#57f2b4');
    ctx.save();ctx.translate(0,8);ctx.scale(1,.58);ctx.rotate(performance.now()/900);ctx.strokeStyle=`rgba(87,242,180,${.5+p*.48})`;ctx.fillStyle=`rgba(87,242,180,${.06+p*.12})`;ctx.shadowColor='#57f2b4';ctx.shadowBlur=20;ctx.lineWidth=5;for(let i=0;i<3;i++){ctx.setLineDash([18+i*7,9]);ctx.lineDashOffset=-performance.now()/(42+i*8);ctx.beginPath();ctx.arc(0,0,50+i*24+p*12,0,Math.PI*2);ctx.fill();ctx.stroke();}ctx.setLineDash([]);ctx.restore();
  } else if(enemy.def.behavior==='bomber'){
    ctx.save();ctx.rotate(enemy.facing);ctx.fillStyle=`rgba(255,154,49,${.1+p*.18})`;ctx.strokeStyle=`rgba(255,188,72,${.55+p*.42})`;ctx.shadowColor='#ff792c';ctx.shadowBlur=15;ctx.lineWidth=4;ctx.setLineDash([14,8]);ctx.lineDashOffset=-performance.now()/34;ctx.beginPath();ctx.moveTo(28,-14);ctx.quadraticCurveTo(115,-96,220,0);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(32,-36,12+p*8,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
  } else if(enemy.def.behavior==='shield'){
    ctx.save();ctx.rotate(enemy.facing);ctx.scale(1,.68);ctx.fillStyle=`rgba(255,49,52,${.07+p*.15})`;ctx.strokeStyle=`rgba(255,91,58,${.55+p*.4})`;ctx.shadowColor='#ff3828';ctx.shadowBlur=16;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(18,0);ctx.arc(18,0,enemy.def.attackRange,-.58,.58);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  } else if (enemy.def.behavior === 'ranged') {
    ctx.save(); ctx.rotate(enemy.facing);ctx.shadowColor='#ff3158';ctx.shadowBlur=12;
    const beam=ctx.createLinearGradient(10,0,560,0);beam.addColorStop(0,`rgba(255,45,88,${.08+p*.12})`);beam.addColorStop(.72,`rgba(255,45,88,${.2+p*.17})`);beam.addColorStop(1,'rgba(255,210,110,.05)');ctx.fillStyle=beam;
    ctx.beginPath();ctx.moveTo(14,-5);ctx.lineTo(520,-12-p*4);ctx.lineTo(560,0);ctx.lineTo(520,12+p*4);ctx.lineTo(14,5);ctx.closePath();ctx.fill();
    ctx.strokeStyle=`rgba(255,236,196,${.45+p*.5})`;ctx.lineWidth=2;ctx.setLineDash([24,13,5,10]);ctx.lineDashOffset=-performance.now()/35;ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(548,0);ctx.stroke();ctx.setLineDash([]);
    for(let x=170;x<520;x+=120){ctx.strokeStyle=`rgba(255,59,96,${.35+p*.55})`;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-14,-9);ctx.lineTo(x,0);ctx.lineTo(x-14,9);ctx.stroke();}ctx.restore();
  } else {
    const radius=(enemy.def.behavior === 'heavy' ? enemy.def.slamRadius : enemy.def.behavior === 'basic' ? 45 : 56) + p * 18;ctx.save();ctx.translate(0,8);ctx.shadowColor='#ff304f';ctx.shadowBlur=10;
    ctx.fillStyle=`rgba(255,35,68,${.045+p*.1})`;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=`rgba(255,55,82,${.4+p*.58})`;ctx.lineWidth=enemy.def.behavior==='heavy'?7:4;ctx.setLineDash(enemy.def.behavior==='heavy'?[36,12,8,12]:[18,10]);ctx.lineDashOffset=performance.now()/50;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    for(let i=0;i<(enemy.def.behavior==='heavy'?8:4);i++){ctx.save();ctx.rotate(i*Math.PI/(enemy.def.behavior==='heavy'?4:2));ctx.fillStyle='#ff3655';ctx.beginPath();ctx.moveTo(radius-3,0);ctx.lineTo(radius-20,-7);ctx.lineTo(radius-20,7);ctx.closePath();ctx.fill();ctx.restore();}
    if(enemy.def.behavior==='heavy'){ctx.rotate(Math.PI/4);ctx.strokeStyle=`rgba(255,210,128,${.45+p*.5})`;ctx.lineWidth=3;ctx.strokeRect(-20,-20,40,40);}ctx.restore();
  }
  ctx.save();ctx.translate(0,-enemy.def.radius*1.7-Math.sin(p*Math.PI)*8);ctx.rotate(-.08);ctx.fillStyle='#ff304f';ctx.strokeStyle='#16030a';ctx.lineWidth=8;ctx.font=`italic 900 ${enemy.def.behavior === 'heavy' ? 43 : 33}px Impact`;ctx.textAlign='center';ctx.strokeText('!',0,0);ctx.fillText('!',0,0);ctx.restore();
}

function drawEnemyHealth(enemy) {
  const activeCount=enemies.filter((candidate)=>!candidate.dead&&candidate.state!=='waiting').length;
  const important=enemy.eliteId||['shield','summoner','bomber','assassin','heavy'].includes(enemy.def.behavior)||enemy.health<enemy.maxHealth||enemy.flash>0||distance(enemy,player)<330;
  if(activeCount>26&&!important)return;
  const special=['shield','summoner','bomber'].includes(enemy.def.behavior);const width = enemy.def.behavior === 'heavy'||enemy.def.behavior==='shield' ? 102 : special?80:66; const x = enemy.x - width / 2; const y = enemy.y - (enemy.def.behavior === 'heavy'||enemy.def.behavior==='shield' ? 108 : special?82:62);
  if(enemy.eliteDef){ctx.save();ctx.font='italic 900 10px Impact';ctx.textAlign='center';ctx.fillStyle=enemy.eliteDef.color;ctx.shadowColor='#000';ctx.shadowBlur=5;ctx.fillText(`${enemy.eliteDef.icon} ${enemy.eliteDef.name.toUpperCase()}`,enemy.x,y-9);ctx.restore();}
  ctx.fillStyle = '#080611'; ctx.fillRect(x - 2, y - 2, width + 4, 9);
  ctx.fillStyle = enemy.def.color; ctx.fillRect(x, y, width * clamp(enemy.health / enemy.maxHealth, 0, 1), 5);
  if(enemy.maxShield>0){ctx.fillStyle='#08120d';ctx.fillRect(x-2,y+7,width+4,6);ctx.fillStyle=enemy.eliteDef?.color||enemy.def.color;ctx.fillRect(x,y+8,width*clamp(enemy.shield/enemy.maxShield,0,1),3);}
}

function drawAtlasFrame(sheet, frame, x, y, width, height, rotation = 0, alpha = 1, glow = null) {
  if (!sheet?.complete || !sheet.naturalWidth) return false;
  const columns = 3, rows = 2;
  const sw = sheet.naturalWidth / columns, sh = sheet.naturalHeight / rows;
  const index = clamp(Math.floor(frame), 0, columns * rows - 1);
  const sx = (index % columns) * sw, sy = Math.floor(index / columns) * sh;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.globalAlpha = alpha;
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 20; }
  ctx.drawImage(sheet, sx, sy, sw, sh, -width / 2, -height / 2, width, height);
  ctx.restore(); return true;
}

function drawGridAtlasFrame(sheet, frame, columns, rows, x, y, width, height, rotation = 0, alpha = 1, glow = null) {
  if (!sheet?.complete || !sheet.naturalWidth) return false;
  const sw=sheet.naturalWidth/columns,sh=sheet.naturalHeight/rows,index=clamp(Math.floor(frame),0,columns*rows-1),sx=(index%columns)*sw,sy=Math.floor(index/columns)*sh;
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.globalAlpha=alpha;if(glow){ctx.shadowColor=glow;ctx.shadowBlur=24;}ctx.drawImage(sheet,sx,sy,sw,sh,-width/2,-height/2,width,height);ctx.restore();return true;
}

function drawEffects(textOnly=false) {
  if(textOnly){drawCombatText();return;}
  for(const pressure of effects.biomePressures){
    const warning=pressure.stage==='warning',p=1-pressure.life/pressure.maxLife,pulse=.82+Math.sin(performance.now()/85+pressure.index)*.14;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=warning?.35+p*.4:.44;
    if(pressure.type==='bellEcho'){ctx.translate(pressure.x,pressure.y);ctx.scale(1,.58);ctx.strokeStyle=warning?'#fff3a1':pressure.color;ctx.fillStyle=`${pressure.color}18`;ctx.shadowColor=pressure.color;ctx.shadowBlur=22;ctx.lineWidth=warning?4+p*5:8;ctx.setLineDash(warning?[22,11,5,10]:[]);ctx.lineDashOffset=-performance.now()/30;ctx.beginPath();ctx.arc(0,0,pressure.radius*pulse,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.rotate(performance.now()/900);for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.strokeRect(pressure.radius*.66,-7,14,14);}ctx.setLineDash([]);}
    else if(pressure.type==='sporeBloom'){ctx.translate(pressure.x,pressure.y);ctx.scale(1,.55);ctx.fillStyle=`${pressure.color}${warning?'20':'35'}`;ctx.strokeStyle=warning?'#e8ffd7':pressure.color;ctx.shadowColor=pressure.color;ctx.shadowBlur=28;ctx.lineWidth=5;ctx.setLineDash(warning?[18,10]:[]);ctx.lineDashOffset=-performance.now()/35;ctx.beginPath();ctx.arc(0,0,pressure.radius*pulse,0,Math.PI*2);ctx.fill();ctx.stroke();for(let i=0;i<7;i++){const a=i/7*Math.PI*2+performance.now()/1100;ctx.beginPath();ctx.arc(Math.cos(a)*pressure.radius*.58,Math.sin(a)*pressure.radius*.58,8+Math.sin(a*4)*3,0,Math.PI*2);ctx.fill();}ctx.setLineDash([]);}
    else if(pressure.type==='eclipseRift'){ctx.translate(pressure.x,pressure.y);ctx.scale(1,.58);ctx.fillStyle=warning?'rgba(184,77,255,.12)':'rgba(42,5,72,.62)';ctx.strokeStyle=warning?'#f1d6ff':pressure.color;ctx.shadowColor=pressure.color;ctx.shadowBlur=warning?24:42;ctx.lineWidth=warning?5+p*5:11;ctx.setLineDash(warning?[26,12,7,10]:[]);ctx.lineDashOffset=-performance.now()/24;ctx.beginPath();ctx.arc(0,0,pressure.radius*pulse,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.rotate(-performance.now()/760);for(let i=0;i<6;i++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(pressure.radius*.38,-14);ctx.lineTo(pressure.radius*.74,0);ctx.lineTo(pressure.radius*.38,14);ctx.stroke();}ctx.setLineDash([]);}
    else{ctx.translate(pressure.x,pressure.y);ctx.rotate(pressure.angle);const storm=pressure.type==='stormSurge',neon=pressure.type==='firewallGrid',grad=ctx.createLinearGradient(0,-pressure.width,0,pressure.width);grad.addColorStop(0,storm?'rgba(49,232,255,0)':neon?'rgba(255,58,184,0)':'rgba(255,42,40,0)');grad.addColorStop(.5,warning?(storm?'rgba(100,245,255,.2)':neon?'rgba(72,239,255,.22)':'rgba(255,180,70,.18)'):(storm?'rgba(40,190,255,.45)':neon?'rgba(255,58,184,.48)':'rgba(255,74,30,.42)'));grad.addColorStop(1,storm?'rgba(49,232,255,0)':neon?'rgba(255,58,184,0)':'rgba(255,42,40,0)');ctx.fillStyle=grad;ctx.strokeStyle=warning?(storm?'#d6ffff':neon?'#62f5ff':'#ffd06a'):pressure.color;ctx.shadowColor=pressure.color;ctx.shadowBlur=neon?34:26;ctx.lineWidth=warning?4:11;ctx.setLineDash(warning?[32,16,7,12]:[]);ctx.lineDashOffset=-performance.now()/25;ctx.fillRect(-pressure.length/2,-pressure.width,pressure.length,pressure.width*2);ctx.beginPath();ctx.moveTo(-pressure.length/2,0);ctx.lineTo(pressure.length/2,0);ctx.stroke();if(neon){ctx.strokeStyle=warning?'rgba(247,239,105,.75)':'#f7ef69';ctx.lineWidth=warning?2:5;for(let x=-pressure.length/2;x<pressure.length/2;x+=115){ctx.beginPath();ctx.moveTo(x,-pressure.width*.55);ctx.lineTo(x+58,pressure.width*.55);ctx.stroke();}}ctx.setLineDash([]);}
    ctx.restore();
  }
  for(const signature of effects.guardianSignatures){
    const p=1-signature.life/signature.maxLife;const impact=signature.stage===1;const frame=signature.row*3+(impact?(p>.58?2:1):0);const size=signature.radius*(impact?2.75:2.25);const signatureAlpha=clamp(signature.life/.12,0,1)*(impact?.58:.3);if(signature.shadow)drawAtlasFrame(assets.shadowRealmVfx,impact?5:3,signature.x,signature.y-24,size*1.2,size*.94,0,signatureAlpha,signature.color);else if(signature.neon)drawAtlasFrame(assets.neonCityVfx,impact?5:3,signature.x,signature.y-24,size*1.25,size,0,signatureAlpha,signature.color);else if(signature.storm)drawAtlasFrame(assets.stormCoastVfx,impact?5:3,signature.x,signature.y-24,size*1.18,size*.94,0,signatureAlpha,signature.color);else drawGridAtlasFrame(assets.guardianSignatureVfx,frame,3,3,signature.x,signature.y-24,size,size*.72,0,signatureAlpha,signature.color);
    if(!impact){ctx.save();ctx.translate(signature.x,signature.y);ctx.scale(1,.58);ctx.strokeStyle=signature.color;ctx.shadowColor=signature.color;ctx.shadowBlur=18;ctx.lineWidth=5+p*6;ctx.setLineDash([30,14,8,11]);ctx.lineDashOffset=-performance.now()/24;ctx.beginPath();ctx.arc(0,0,signature.radius*(.72+p*.28),0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
  }
  for(const hazard of effects.enemyHazards){
    const p=1-hazard.life/hazard.maxLife;if(hazard.type==='bomb')drawAtlasFrame(assets.specialEnemyVfx,p<.58?2:3,hazard.x,hazard.y-34,116+p*34,116+p*34,0,.96,hazard.color);ctx.save();ctx.translate(hazard.x,hazard.y);ctx.scale(1,.56);ctx.shadowColor=hazard.color;ctx.shadowBlur=22;ctx.fillStyle=`${hazard.color}${Math.round((.08+p*.13)*255).toString(16).padStart(2,'0')}`;ctx.strokeStyle=hazard.color;ctx.lineWidth=5+p*6;ctx.setLineDash(hazard.type==='kernelSnare'?[8,7]:[24,11,5,10]);ctx.lineDashOffset=-performance.now()/28;ctx.beginPath();ctx.arc(0,0,hazard.radius*(.45+p*.55),0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([]);const points=hazard.type==='kernelSnare'?3:8;for(let i=0;i<points;i++){ctx.save();ctx.rotate(i*Math.PI*2/points+p*1.3);ctx.fillStyle=hazard.color;ctx.beginPath();ctx.moveTo(hazard.radius-8,0);ctx.lineTo(hazard.radius-31,-9);ctx.lineTo(hazard.radius-31,9);ctx.closePath();ctx.fill();ctx.restore();}ctx.restore();
  }
  for (const shot of effects.playerShots) {
    const angle=Math.atan2(shot.vy,shot.vx);const frame=shot.arrow||shot.trickshot?Math.floor(performance.now()/65)%3:shot.arc?2+Math.floor(performance.now()/80)%2:2+Math.floor(performance.now()/65)%3;
    const scale=shot.radius>=12?1.24:1;
    const arsenal=shot.frost||shot.mortar||shot.gale,tier2=shot.embercoil||shot.chakram||shot.railbow;const shotAsset=tier2?assets.arsenalTier2Vfx:arsenal?assets.arsenalWeaponsVfx:shot.glaive||shot.spiritFeather?assets.nomiGlaiveVfx:shot.arrow?assets.hopscotchArrow:shot.trickshot?assets.trickshotVfx:shot.arc?assets.zapArcVfx:assets.blasterShotVfx;const shotFrame=shot.embercoil?3:shot.chakram?4:shot.railbow?5:shot.frost?3:shot.mortar?4:shot.gale?5:shot.glaive?(shot.returning?1:0):shot.spiritFeather?3:frame;const shotWidth=shot.railbow?235:shot.chakram?(shot.returning?230:205):shot.embercoil?170:shot.frost?142:shot.mortar?128:shot.gale?(shot.returning?198:176):shot.glaive?(shot.returning?186:150):shot.spiritFeather?126:shot.arrow?168:shot.trickshot?116:shot.arc?132:112;const shotHeight=shot.railbow?104:shot.chakram?(shot.returning?185:168):shot.embercoil?95:shot.frost?92:shot.mortar?112:shot.gale?(shot.returning?154:142):shot.glaive?(shot.returning?116:126):shot.spiritFeather?86:shot.arrow?72:shot.trickshot?92:shot.arc?82:70;
    const drawn=arsenal||tier2?drawGridAtlasFrame(shotAsset,shotFrame,3,2,shot.x,shot.y,shotWidth*scale,shotHeight*scale,angle,clamp(shot.life/.12,0,1),shot.color||'#42ecff'):drawAtlasFrame(shotAsset,shotFrame,shot.x,shot.y,shotWidth*scale,shotHeight*scale,angle,clamp(shot.life/.12,0,1),shot.color||'#42ecff');if(!drawn){
      ctx.save();ctx.translate(shot.x,shot.y);ctx.rotate(angle);ctx.fillStyle='#fff';ctx.fillRect(-22,-5,44,10);ctx.restore();
    }
  }
  for (const bolt of effects.flameBolts) {
    const angle=Math.atan2(bolt.vy,bolt.vx);const p=1-bolt.life/bolt.maxLife;const alpha=clamp(bolt.life/.12,0,1);
    if (!drawAtlasFrame(assets.foxfireVfx, Math.floor(p*6), bolt.x, bolt.y, 145, 96, angle, alpha, '#ff5d21')) {
      ctx.save();ctx.translate(bolt.x,bolt.y);ctx.rotate(angle);ctx.globalAlpha=alpha;ctx.shadowColor='#ff5d21';ctx.shadowBlur=30;
      const flame=ctx.createLinearGradient(-74,0,18,0);flame.addColorStop(0,'rgba(197,40,255,0)');flame.addColorStop(.36,'rgba(198,52,255,.72)');flame.addColorStop(.7,'#ff5827');flame.addColorStop(1,'#fff49a');ctx.fillStyle=flame;
      ctx.beginPath();ctx.moveTo(21,0);ctx.bezierCurveTo(-6,-19,-25,-4,-72,-13);ctx.quadraticCurveTo(-48,0,-72,13);ctx.bezierCurveTo(-25,4,-6,19,21,0);ctx.fill();ctx.strokeStyle='#fff4b2';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(17,0);ctx.lineTo(-28,0);ctx.stroke();ctx.restore();
    }
  }
  for (const trail of effects.fireTrails) {
    const p = 1 - trail.life / trail.maxLife;
    drawAtlasFrame(assets.burnStatusVfx,Math.floor(p*6),trail.x,trail.y,104,82,0,(1-p)*.78,trail.color);
  }
  for(const bloom of effects.blooms){const p=1-bloom.life/bloom.maxLife;const alpha=(1-p)*.94;
    if(!drawAtlasFrame(assets.wildHeartVfx,Math.floor(p*6),bloom.x,bloom.y+4,190,158,0,alpha*.68,'#68ef50')){const s=lerp(.35,.8,Math.min(1,p*2.2));ctx.save();ctx.translate(bloom.x,bloom.y);ctx.scale(s,s);ctx.globalAlpha=alpha*.7;ctx.fillStyle='#9dff79';ctx.beginPath();ctx.arc(0,0,42,0,Math.PI*2);ctx.fill();ctx.restore();}}
  for (const vortex of effects.vortices) {
    const p=1-vortex.life/vortex.maxLife; const alpha=clamp(vortex.life/.18,0,1); const spin=performance.now()/260;
    drawAtlasFrame(assets.waterRippleVfx,Math.floor(p*6),vortex.x,vortex.y+12,vortex.radius*2.15,vortex.radius*1.18,spin*.12,alpha*.82,vortex.definition.color);
    if(!drawAtlasFrame(assets.undertowVfx,Math.floor(p*6),vortex.x,vortex.y-15,vortex.radius*2.05,vortex.radius*1.38,0,alpha,vortex.definition.color)){
      ctx.save();ctx.translate(vortex.x,vortex.y);ctx.rotate(spin);ctx.globalAlpha=alpha;ctx.shadowColor=vortex.definition.color;ctx.shadowBlur=30;ctx.strokeStyle='#dfffff';ctx.lineWidth=14;ctx.beginPath();ctx.arc(0,0,vortex.radius*.58,.3,Math.PI*1.8);ctx.stroke();ctx.restore();
    }
  }
  for (const storm of effects.shockStorms) {
    const p=1-storm.life/storm.maxLife; const pulse=.84+Math.sin(performance.now()/95)*.12;
    ctx.save();ctx.translate(player.x,player.y);ctx.globalAlpha=clamp(storm.life/.25,0,1)*.6;ctx.strokeStyle=storm.definition.color;ctx.shadowColor=storm.definition.color;ctx.shadowBlur=30;ctx.lineWidth=5;
    ctx.beginPath();ctx.arc(0,0,(95+p*65)*pulse,0,Math.PI*2);ctx.stroke();ctx.setLineDash([12,16]);ctx.rotate(-performance.now()/420);ctx.beginPath();ctx.arc(0,0,72*pulse,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  for (const projectile of effects.projectiles) {
    const angle=Math.atan2(projectile.vy,projectile.vx);const frame=2+Math.floor(performance.now()/78+projectile.x*.01)%3;
    if(projectile.shadow)drawAtlasFrame(assets.shadowRealmVfx,1,projectile.x,projectile.y,178,112,angle,clamp(projectile.life/.2,0,1),projectile.color);
    else if(projectile.neon)drawAtlasFrame(assets.neonCityVfx,1,projectile.x,projectile.y,152,92,angle,clamp(projectile.life/.2,0,1),projectile.color);
    else if(projectile.crimson)drawAtlasFrame(assets.crimsonCombatVfx,projectile.vfxFrame??1,projectile.x,projectile.y,projectile.vfxFrame===4?210:130,projectile.vfxFrame===4?118:130,angle,clamp(projectile.life/.2,0,1),projectile.color);
    else drawAtlasFrame(assets.spiritArrowVfx,frame,projectile.x,projectile.y,132,72,angle,clamp(projectile.life/.2,0,1),projectile.color);
  }
  for (const link of effects.shockLinks) {
    const dx=link.x2-link.x1,dy=link.y2-link.y1;const length=Math.hypot(dx,dy);const p=1-link.life/link.maxLife;
    drawAtlasFrame(assets.shockLinkVfx,Math.floor(p*6),(link.x1+link.x2)/2,(link.y1+link.y2)/2,length,94,Math.atan2(dy,dx),clamp(link.life/.12,0,1),'#d94cff');
  }
  for (const effect of effects.spriteEffects) {
    const p=1-effect.life/effect.maxLife; const sheet=assets[effect.asset];
    const frame=effect.fixedFrame??Math.floor(p*6);if(effect.asset==='arsenalWeaponsVfx'||effect.asset==='arsenalReactionsVfx'||effect.asset==='arsenalTier2Vfx')drawGridAtlasFrame(sheet,frame,3,2,effect.x,effect.y,effect.width,effect.height,effect.rotation||0,clamp(effect.life/.1,0,1),effect.glow);else drawAtlasFrame(sheet,frame,effect.x,effect.y,effect.width,effect.height,effect.rotation||0,clamp(effect.life/.1,0,1),effect.glow);
  }
  for (const shard of effects.shards) {
    ctx.save(); ctx.translate(shard.x,shard.y); ctx.rotate(performance.now()/180 + shard.x); ctx.globalAlpha=clamp(shard.life/.35,0,1); ctx.fillStyle=shard.color; ctx.shadowColor=shard.color; ctx.shadowBlur=14;
    ctx.beginPath(); ctx.moveTo(0,-shard.size*1.4); ctx.lineTo(shard.size*.75,0); ctx.lineTo(0,shard.size*1.4); ctx.lineTo(-shard.size*.75,0); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  for (const ring of effects.rings) {
    const p = 1 - ring.life / ring.maxLife;
    ctx.globalAlpha = 1 - p; ctx.strokeStyle = ring.color; ctx.lineWidth = lerp(8, 2, p);
    ctx.beginPath(); ctx.arc(ring.x, ring.y, lerp(ring.radius, ring.maxRadius, p), 0, Math.PI * 2); ctx.stroke();
  }
  for (const star of effects.stars) {
    const p = 1-star.life/star.maxLife; const rays=10; ctx.save(); ctx.translate(star.x,star.y); ctx.rotate(star.facing+p*.8); ctx.globalAlpha=1-p; ctx.fillStyle=star.color; ctx.shadowColor=star.color; ctx.shadowBlur=22;
    ctx.beginPath(); for(let i=0;i<rays*2;i++){const r=i%2===0?star.size*(1+p*.25):star.size*.18; const a=i/(rays*2)*Math.PI*2; const x=Math.cos(a)*r,y=Math.sin(a)*r; i?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.closePath(); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,0,star.size*.16,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  for (const particle of effects.particles) {
    ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1); ctx.fillStyle = particle.color; ctx.shadowColor = particle.color; ctx.shadowBlur = particle.size * 2;
    ctx.save(); ctx.translate(particle.x, particle.y); ctx.rotate(Math.atan2(particle.vy, particle.vx)); ctx.fillRect(-particle.size * 1.8, -particle.size / 2, particle.size * 3.6, particle.size); ctx.restore();
  }
  ctx.shadowBlur = 0;
}

function drawCombatText(){
  if(profile.settings.damageNumbers)for (const number of effects.numbers) {
    const p = 1 - number.life / number.maxLife;
    const scale = p < .18 ? lerp(.4, 1.35, p / .18) : lerp(1.35, .9, (p - .18) / .82);
    ctx.save(); ctx.translate(number.x, number.y); ctx.scale(scale, scale); ctx.globalAlpha = clamp(number.life / .25, 0, 1);
    ctx.font = `italic 900 ${number.size}px Impact, sans-serif`; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#140716'; ctx.lineWidth = 7; ctx.strokeText(number.text, 0, 0); ctx.fillStyle = number.color; ctx.fillText(number.text, 0, 0); ctx.restore();
  }
  for (const word of effects.words) {
    const p = 1 - word.life / word.maxLife;
    const scale = p < .18 ? lerp(.2, 1.28, p / .18) : lerp(1.28, .92, (p - .18) / .82);
    ctx.save(); ctx.translate(word.x, word.y); ctx.rotate(word.rotation); ctx.scale(scale * 1.2, scale); ctx.globalAlpha = clamp(word.life / .16, 0, 1);
    ctx.strokeStyle=word.color;ctx.lineWidth=5;for(let i=0;i<9;i++){const a=i/9*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*33,Math.sin(a)*19);ctx.lineTo(Math.cos(a)*(57+i%3*9),Math.sin(a)*(35+i%3*5));ctx.stroke();}
    ctx.font = 'italic 900 51px Impact, sans-serif'; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#10040d'; ctx.lineWidth = 14; ctx.strokeText(word.text, 0, 0); ctx.strokeStyle = '#fff2e8'; ctx.lineWidth = 4; ctx.strokeText(word.text, 0, 0); ctx.fillStyle = word.color; ctx.fillText(word.text, 0, 0); ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function easeOutBack(x) {
  const c1 = 1.70158; const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

let lastDrawTime=0,lastFrameMetric=performance.now();const frameDurations=[];
function frame(now) {
  scrollShellToOrigin();
  const screen = resize();
  const dt = Math.min((now - lastTime) / 1000, .033);
  lastTime = now;
  updateAudioDirector(dt);
  const liveWorld=['playing','hub','dojo'].includes(state),ambientPreview=state==='preview'&&profile.settings.ambientMotion;
  if(liveWorld){update(dt,screen);draw(screen);lastDrawTime=now;}
  else if(ambientPreview&&now-lastDrawTime>=50){update(Math.min(dt,.05),screen);draw(screen);lastDrawTime=now;}
  else if(!lastDrawTime||now-lastDrawTime>=1000){update(0,screen);draw(screen);lastDrawTime=now;}
  const frameMs=now-lastFrameMetric;lastFrameMetric=now;if(liveWorld&&frameMs<100){frameDurations.push(frameMs);if(frameDurations.length>180)frameDurations.shift();const sorted=[...frameDurations].sort((a,b)=>a-b),average=frameDurations.reduce((sum,value)=>sum+value,0)/frameDurations.length;window.__BRAWLPAWS_PERF__={fps:Math.round(1000/average),p95Ms:Number((sorted[Math.floor(sorted.length*.95)]||0).toFixed(1)),renderDpr:screen.dpr,samples:frameDurations.length,effects:Object.values(effects).reduce((sum,list)=>sum+(Array.isArray(list)?list.length:0),0)};if(debugSystem)Object.assign(document.documentElement.dataset,{perfFps:String(window.__BRAWLPAWS_PERF__.fps),perfP95:String(window.__BRAWLPAWS_PERF__.p95Ms),perfEffects:String(window.__BRAWLPAWS_PERF__.effects)});}
  requestAnimationFrame(frame);
}

window.__BRAWLPAWS_QA__=()=>({state,room:room.id,player:player&&{x:player.x,y:player.y,worldX:player.worldX,worldY:player.worldY,currentRegion:player.currentRegion,discoveredRegions:player.discoveredRegions?.size||0,clearedRegions:player.clearedRegions?.size||0,vx:player.vx,vy:player.vy,facing:player.facing,aimFacing:player.aimFacing,moveFacing:player.moveFacing,aimLockTime:player.aimLockTime,attacking:Boolean(player.attack)},mapReady:layeredMapRuntime.ready,mapDebug:layeredMapRuntime.debug,mapRoom:layeredMapRuntime.activeRoomId,world:{id:EXPEDITION_WORLD.id,regions:EXPEDITION_WORLD.nodes.length,links:EXPEDITION_WORLD.links.length,neighbors:expeditionNeighbors(room.id)}});

window.addEventListener('resize', ()=>{lastDrawTime=0;resize();});
window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if(state==='worldMap'&&(key==='m'||key==='escape')){closeWorldMap();event.preventDefault();return;}
  if(key==='m'&&['playing','hub','dojo'].includes(state)){openWorldMap();event.preventDefault();return;}
  if(key==='f3'){const active=layeredMapRuntime.toggleDebug();if(player)spawnWord(player.x,player.y-90,active?'MAP DEBUG ON':'MAP DEBUG OFF',active?'#45f4ff':'#9ea1ad');event.preventDefault();return;}
  if(state==='settings'&&(key==='escape'||key==='o')){closeSettings();event.preventDefault();return;}
  if(state==='paused'&&key==='escape'){resumeGame();event.preventDefault();return;}
  if(key==='o'&&['preview','hub','playing','dojo','paused'].includes(state)){openSettings(state);event.preventDefault();return;}
  if(state==='codex'&&(key==='escape'||key==='k')){closeCodex();event.preventDefault();return;}
  if(key==='k'&&['preview','hub','playing','dojo'].includes(state)){openCodex(state==='preview'?'heroes':'enemies');event.preventDefault();return;}
  if(state==='hubMenu'&&(key==='escape'||key==='enter')){closeHubMenu();event.preventDefault();return;}
  if(state==='story'&&key==='enter'){tutorialActive?.phase==='explain'?startTutorialLesson():continueStory();event.preventDefault();return;}
  if(state==='route'&&['1','2','3'].includes(key)){selectRoute(Number(key)-1);event.preventDefault();return;}
  if(state==='event'&&['1','2'].includes(key)){chooseRouteEvent(Number(key)-1);event.preventDefault();return;}
  if(state==='guardianReward'&&['1','2','3'].includes(key)){chooseGuardianReward(Number(key)-1);event.preventDefault();return;}
  if(state==='relicDraft'&&['1','2','3'].includes(key)){chooseRelic(Number(key)-1);event.preventDefault();return;}
  if(state==='shop'&&(key==='escape'||key==='enter')){leaveShop();event.preventDefault();return;}
  if(state==='levelup'&&key==='r'){rerollUpgrades();event.preventDefault();return;}
  if (state === 'levelup' && ['1','2','3'].includes(key)) {
    chooseUpgrade(Number(key)-1); event.preventDefault(); return;
  }
  if(key==='escape'&&['playing','dojo','hub'].includes(state)){pauseGame();event.preventDefault();return;}
  if (!input.keys.has(key)) input.pressed.add(key);
  input.keys.add(key);
  if (['arrowup','arrowdown','arrowleft','arrowright','shift',' '].includes(key)) event.preventDefault();
  ensureAudio();
});
window.addEventListener('keyup', (event) => input.keys.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => { input.keys.clear(); input.attackHeld = false;if(['playing','dojo'].includes(state))pauseGame(); });
canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect(); input.pointer.x = event.clientX - rect.left; input.pointer.y = event.clientY - rect.top; input.pointer.active = true;
});
canvas.addEventListener('pointerdown', (event) => { if (event.button === 0) { const rect=canvas.getBoundingClientRect();input.pointer.x=event.clientX-rect.left;input.pointer.y=event.clientY-rect.top;input.pointer.active=true;input.attack = true; input.attackHeld = true; ensureAudio();requestAttack(); } });
window.addEventListener('pointerup', (event) => { if (event.button === 0) input.attackHeld = false; });
canvas.addEventListener('contextmenu', (event) => event.preventDefault());
document.querySelector('#start-button').addEventListener('click', begin);
coopCreateButton?.addEventListener('click',()=>{const code=coopRoomCode();coopCodeInput.value=code;connectCoop(code,true);});
coopJoinButton?.addEventListener('click',()=>connectCoop(coopCodeInput.value));
coopLeaveButton?.addEventListener('click',()=>leaveCoop());
continueRunButton.addEventListener('click',resumeSavedRun);
document.querySelector('#codex-button').addEventListener('click',()=>openCodex('heroes'));
document.querySelector('#settings-button').addEventListener('click',()=>openSettings('preview'));
document.querySelector('#resume-button').addEventListener('click',resumeGame);
document.querySelector('#pause-settings').addEventListener('click',()=>openSettings('paused'));
document.querySelector('#save-title-button').addEventListener('click',returnToTitle);
document.querySelector('#close-settings').addEventListener('click',closeSettings);
for(const button of settingsScreen.querySelectorAll('[data-setting]'))button.addEventListener('click',()=>changeSetting(button.dataset.setting,button.dataset.value));
document.querySelector('#close-codex').addEventListener('click',closeCodex);
document.querySelector('#world-map-button').addEventListener('click',openWorldMap);
document.querySelector('#close-world-map').addEventListener('click',closeWorldMap);
for(const button of document.querySelectorAll('[data-codex-tab]'))button.addEventListener('click',()=>{activeCodexId=null;renderCodex(button.dataset.codexTab);});
document.querySelector('#restart-button').addEventListener('click', begin);
document.querySelector('#story-button').addEventListener('click',()=>tutorialActive?.phase==='explain'?startTutorialLesson():continueStory());
document.querySelector('#tutorial-skip').addEventListener('click',skipTutorial);
document.querySelector('#tutorial-live-skip').addEventListener('click',()=>skipTutorialLesson('LESSON SKIPPED'));
document.querySelector('#leave-shop').addEventListener('click', leaveShop);
document.querySelector('#close-hub-menu').addEventListener('click',closeHubMenu);
document.querySelector('#dojo-cycle-target').addEventListener('click',cycleDojoTarget);
document.querySelector('#dojo-toggle-ai').addEventListener('click',toggleDojoAi);
document.querySelector('#dojo-toggle-dual').addEventListener('click',toggleDojoDual);
document.querySelector('#dojo-reset').addEventListener('click',()=>spawnDojoTarget({resetSession:true}));
document.querySelector('#dojo-exit').addEventListener('click',exitDojo);
document.querySelector('#reroll-upgrades').addEventListener('click',rerollUpgrades);
document.querySelector('#skip-upgrade').addEventListener('click',skipUpgrade);
for(const button of document.querySelectorAll('[data-difficulty]'))button.addEventListener('click',()=>selectDifficulty(button.dataset.difficulty));
for(const button of document.querySelectorAll('[data-hero]'))button.addEventListener('click',()=>selectHero(button.dataset.hero));
window.addEventListener('keydown', (event) => { if (event.key.toLowerCase() === 'r' && (state === 'won' || state === 'lost')) begin(); });

if(debugSystem==='arsenalLoadout'){profile.collectedWeapons=ARSENAL_BLUEPRINTS.map((entry)=>entry.id);profile.boundArsenal={...profile.boundArsenal,[selectedHeroId]:debugParams.get('weapon')||'frostbiteNeedle'};}
applyHeroUi();
resetGame();
refreshProfileUi();
refreshSettingsUi();
refreshContinueRunUi();
refreshCoopUi();
requestAnimationFrame(frame);

