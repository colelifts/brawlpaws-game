import { clamp, lerp, normalize, distance, approachAngle, encounterActiveLimit, cappedWardPressure } from './math.js';
import { HEROES, WEAPONS, ABILITIES, STATUS_EFFECTS, ELITE_MODIFIERS, BOSS_PATTERNS, BOSS_PROFILES, ENEMIES, ENCOUNTERS, ROOMS, DIFFICULTIES } from './data.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d', { alpha: false });
const shell = document.querySelector('#game-shell');
const startScreen = document.querySelector('#start-screen');
const resultScreen = document.querySelector('#result-screen');
const levelupScreen = document.querySelector('#levelup-screen');
const upgradeGrid = document.querySelector('#upgrade-grid');
const storyScreen = document.querySelector('#story-screen');
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
const codexScreen = document.querySelector('#codex-screen');
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
const CHAPTER_ORDER = ['jadeChapter', 'bambooChapter', 'crimsonChapter'];
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

const assets = {
  arena: new Image(), kitsune: new Image(), kitsuneFire: new Image(), bamboo: new Image(), bambooFire: new Image(), hopscotch: new Image(), hopscotchFire: new Image(), rusty: new Image(), rustyFire: new Image(), enemies: new Image(), props: new Image(),
  archerMove: new Image(), archerAttack: new Image(), raccoonAttack: new Image(), boarAttack: new Image(),
  undertowVfx: new Image(), foxfireVfx: new Image(), wildHeartVfx: new Image(),
  blasterShotVfx: new Image(), blasterImpactVfx: new Image(), spiritArrowVfx: new Image(), spiritArrowImpactVfx: new Image(), hopscotchArrow: new Image(), trickshotVfx: new Image(),
  burnStatusVfx: new Image(), waterImpactVfx: new Image(), clawSlashVfx: new Image(), hammerSlamVfx: new Image(),
  shockImpactVfx: new Image(), shockLinkVfx: new Image(), spiritWispVfx: new Image(), lanternFlameVfx: new Image(), waterRippleVfx: new Image(),
  jadeguardTanuki: new Image(), bambooEnemies: new Image(), moonfangKomainu: new Image(),
  crimsonEnemies: new Image(), pyreclawShogun: new Image(), crimsonCombatVfx: new Image(),
  bellweaverCat: new Image(), powderkegToad: new Image(), gatewardenRhino: new Image(), mistclawLynx: new Image(), specialEnemyVfx: new Image(), guardianSignatureVfx: new Image()
};
const assetSources = {
  arena: room.background,
  kitsune: 'assets/characters/kitsune-gunner.png',
  kitsuneFire: 'assets/characters/kitsune-fire.png',
  bamboo: 'assets/characters/bamboo-cannon.png',
  bambooFire: 'assets/characters/bamboo-fire.png',
  hopscotch: 'assets/characters/hopscotch-archer-alpha.png',
  hopscotchFire: 'assets/characters/hopscotch-fire-alpha.png',
  rusty: 'assets/characters/rusty-trickshot-alpha.png',
  rustyFire: 'assets/characters/rusty-fire-alpha.png',
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
  bambooEnemies: 'assets/characters/bamboo-enemies-v3.png',
  moonfangKomainu: 'assets/characters/moonfang-komainu.png',
  crimsonEnemies: 'assets/characters/crimson-enemies.png',
  pyreclawShogun: 'assets/characters/pyreclaw-shogun.png',
  crimsonCombatVfx: 'assets/vfx/crimson-combat-vfx.png',
  bellweaverCat: 'assets/characters/bellweaver-cat.png',
  powderkegToad: 'assets/characters/powderkeg-toad.png',
  gatewardenRhino: 'assets/characters/gatewarden-rhino.png',
  mistclawLynx: 'assets/characters/mistclaw-lynx.png',
  specialEnemyVfx: 'assets/vfx/special-enemy-vfx.png',
  guardianSignatureVfx: 'assets/vfx/guardian-signatures.png'
};
let assetsLoaded = 0;
for (const [key, source] of Object.entries(assetSources)) {
  assets[key].src = source;
  assets[key].addEventListener('load', () => {
    assetsLoaded++;
    if (assetsLoaded === Object.keys(assetSources).length) loading.classList.add('ready');
  });
}
const arenaCache=new Map([[room.id,assets.arena]]);
for(const roomDefinition of Object.values(ROOMS)){
  if(arenaCache.has(roomDefinition.id))continue;const image=new Image();image.src=roomDefinition.background;arenaCache.set(roomDefinition.id,image);
}

const ui = {
  healthFill: document.querySelector('#health-fill'), healthText: document.querySelector('#health-text'),
  timer: document.querySelector('#timer'), objective: document.querySelector('#objective-text'),
  corruptionPanel:document.querySelector('#corruption-panel'),corruptionTier:document.querySelector('#corruption-tier'),corruptionFill:document.querySelector('#corruption-fill'),corruptionCopy:document.querySelector('#corruption-copy'),
  roomState: document.querySelector('#room-state'), comboPanel: document.querySelector('#combo-panel'),
  comboCount: document.querySelector('#combo-count'), dashCard: document.querySelector('#dash-card'),sprintCard:document.querySelector('#sprint-card'),sprintFill:document.querySelector('#sprint-fill'),
  dashCooldown: document.querySelector('#dash-cooldown'), resultTitle: document.querySelector('#result-title'),
  heroPortrait:document.querySelector('#hero-portrait'),heroName:document.querySelector('#hero-name'),heroRole:document.querySelector('#hero-role'),
  weaponName:document.querySelector('#weapon-name'),dashName:document.querySelector('#dash-name'),
  startHeroMark:document.querySelector('#start-hero-mark'),startHeroName:document.querySelector('#start-hero-name'),startHeroCopy:document.querySelector('#start-hero-copy'),
  comparisonRatings:document.querySelector('#comparison-ratings'),comparisonWeapon:document.querySelector('#comparison-weapon'),comparisonWeaponTags:document.querySelector('#comparison-weapon-tags'),comparisonWeaponCopy:document.querySelector('#comparison-weapon-copy'),comparisonWeaponStats:document.querySelector('#comparison-weapon-stats'),
  xpFill: document.querySelector('#xp-fill'), xpText: document.querySelector('#xp-text'),
  levelBadge: document.querySelector('#level-badge'),
  goldToken: document.querySelector('#gold-token'), routeProgress: document.querySelector('#route-progress'),
  routeHealth: document.querySelector('#route-health'), routeGold: document.querySelector('#route-gold'), routeRelics: document.querySelector('#route-relics'),
  shopGold: document.querySelector('#shop-gold'),
  waveLabel: document.querySelector('#wave-label'), bossPanel: document.querySelector('#boss-panel'),
  bossHealthFill: document.querySelector('#boss-health-fill'), bossHealthText: document.querySelector('#boss-health-text'), bossPhase: document.querySelector('#boss-phase'),
  storyKicker: document.querySelector('#story-kicker'), storyTitle: document.querySelector('#story-title'), storyCopy: document.querySelector('#story-copy'), storyQuote: document.querySelector('#story-quote'), storyButton: document.querySelector('#story-button'),
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
  synergyStrip:document.querySelector('#synergy-strip'), rerollButton:document.querySelector('#reroll-upgrades'),
  rerollCost:document.querySelector('#reroll-cost'), skipUpgrade:document.querySelector('#skip-upgrade'),
  eventKicker:document.querySelector('#event-kicker'), eventTitle:document.querySelector('#event-title'),
  eventCopy:document.querySelector('#event-copy'), eventQuote:document.querySelector('#event-quote'),
  guardianRewardKicker:document.querySelector('#guardian-reward-kicker'),guardianRewardTitle:document.querySelector('#guardian-reward-title'),guardianRewardCopy:document.querySelector('#guardian-reward-copy'),
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
const DEFAULT_SETTINGS={screenShake:1,flashIntensity:1,damageNumbers:true,ambientMotion:true};
const DEFAULT_PROFILE={spiritShards:0,campaignClears:0,runsStarted:0,bestDifficulty:'',lastDifficulty:'ferocious',selectedHero:'kitsune',highestLevel:1,vitalityRank:0,forgeRank:0,attunementRank:0,purseRank:0,ascensionRank:1,ascensionClears:0,unlockedHeroes:['kitsune','bamboo'],discoveredEnemies:['groveMinion'],discoveredGuardians:[],settings:DEFAULT_SETTINGS};
function loadProfile(){
  try{
    const loaded={...DEFAULT_PROFILE,...JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')};
    loaded.settings={...DEFAULT_SETTINGS,...loaded.settings};
    loaded.settings.screenShake=[0,.35,1].includes(Number(loaded.settings.screenShake))?Number(loaded.settings.screenShake):1;
    loaded.settings.flashIntensity=[0,.35,1].includes(Number(loaded.settings.flashIntensity))?Number(loaded.settings.flashIntensity):1;
    loaded.settings.damageNumbers=loaded.settings.damageNumbers!==false;
    loaded.settings.ambientMotion=loaded.settings.ambientMotion!==false;
    loaded.discoveredEnemies=Array.isArray(loaded.discoveredEnemies)?loaded.discoveredEnemies:['groveMinion'];
    loaded.discoveredGuardians=Array.isArray(loaded.discoveredGuardians)?loaded.discoveredGuardians:[];
    loaded.unlockedHeroes=Array.isArray(loaded.unlockedHeroes)?loaded.unlockedHeroes:['kitsune','bamboo'];
    if(loaded.campaignClears>0&&!loaded.unlockedHeroes.includes('hopscotch'))loaded.unlockedHeroes.push('hopscotch');
    loaded.ascensionRank=clamp(Math.round(Number(loaded.ascensionRank)||1),1,10);loaded.ascensionClears=Math.max(0,Math.round(Number(loaded.ascensionClears)||0));
    if(loaded.ascensionClears>0&&!loaded.unlockedHeroes.includes('rusty'))loaded.unlockedHeroes.push('rusty');
    return loaded;
  }catch{return {...DEFAULT_PROFILE,settings:{...DEFAULT_SETTINGS},unlockedHeroes:[...DEFAULT_PROFILE.unlockedHeroes],discoveredEnemies:[...DEFAULT_PROFILE.discoveredEnemies],discoveredGuardians:[]};}
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
  if(!player)return 1;const abilityRanks=Object.values(player.abilityPower).reduce((sum,value)=>sum+Math.max(0,value-1),0)*.28;const unlockPower=player.unlockedAbilities.size*.14;const projectilePower=(player.bonusProjectiles+player.bonusPierces*.35+player.bonusRicochets*.5)*.12;const capstone=player.weaponEvolution?.2:0;
  return .55+player.damageMultiplier*(1/Math.max(.48,player.fireRateMultiplier))*.45+abilityRanks+unlockPower+projectilePower+capstone+Math.max(0,player.level-1)*.045;
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
  corruptionDirector.reinforcementsUsed++;corruptionDirector.killWindow=0;corruptionDirector.nextThreshold=Math.max(4,corruptionDirector.nextThreshold-1);encounter.modifiers.corruption=serializeCorruptionDirector();saveRunCheckpoint({kind:'wave',wave:encounter.wave,modifiers:encounter.modifiers});spawnWord(player.x,player.y-140,'CORRUPTION WARBAND!',tier.color);effects.rings.push({x:player.x,y:player.y,radius:35,maxRadius:255,color:tier.color,life:.8,maxLife:.8});camera.shake=Math.max(camera.shake,9);refreshCorruptionHud({surge:true});playTone(105,.38,'sawtooth',.05,120);
}
function recordCorruptionKill(){
  if(!corruptionDirector||corruptionDirector.definition.reinforcements+coopPressure().reinforcements<=corruptionDirector.reinforcementsUsed)return;corruptionDirector.killWindow++;corruptionDirector.killClock=0;if(corruptionDirector.killWindow>=corruptionDirector.nextThreshold)spawnCorruptionWarband();
}
function updateCorruptionDirector(dt){
  if(!corruptionDirector||encounter.bossActive||encounter.transitioning)return;corruptionDirector.killClock+=dt;corruptionDirector.huntClock=(corruptionDirector.huntClock||0)+dt;if(corruptionDirector.killClock>6){corruptionDirector.killClock=0;corruptionDirector.killWindow=0;}
  const huntInterval=Math.max(6,11-corruptionDirector.tier);if(corruptionDirector.tier>=3&&corruptionDirector.huntClock>=huntInterval){const active=enemies.filter((enemy)=>!enemy.dead&&enemy.state!=='waiting');if(active.length){corruptionDirector.huntClock=0;for(const enemy of active)enemy.huntTime=Math.max(enemy.huntTime||0,3.8);spawnWord(player.x,player.y-126,'THE PACK HUNTS!',corruptionTier().color);effects.rings.push({x:player.x,y:player.y,radius:20,maxRadius:210,color:corruptionTier().color,life:.58,maxLife:.58});refreshCorruptionHud({surge:true});playTone(125,.26,'square',.035,170);}}
}

function refreshProfileUi(){
  const record=profile.campaignClears?`ASCENSION ${profile.ascensionRank}`:profile.bestDifficulty?`BEST ${profile.bestDifficulty.toUpperCase()}`:'NO CLEARS YET';
  ui.profileSummary.textContent=`SPIRIT SHARDS ${profile.spiritShards} / CAMPAIGN CLEARS ${profile.campaignClears} / ${record}`;
  for(const button of document.querySelectorAll('[data-difficulty]')){const ascension=button.dataset.difficulty==='ascension';const unlocked=!ascension||profile.campaignClears>0||debugDifficulty==='ascension';button.classList.toggle('selected',button.dataset.difficulty===selectedDifficulty);button.disabled=!unlocked;const label=button.querySelector('small');if(ascension&&label)label.textContent=unlocked?`RANK ${profile.ascensionRank}`:'LOCKED  CLEAR 1 RUN';}
  for(const button of document.querySelectorAll('[data-hero]')){
    const id=button.dataset.hero;const unlocked=profile.unlockedHeroes.includes(id)||id===debugHero;button.classList.toggle('locked',!unlocked);button.disabled=!unlocked;
    const label=button.querySelector('small');if(label)label.textContent=unlocked?HEROES[id].role.toUpperCase():id==='rusty'?'LOCKED  CLEAR ASCENSION':'LOCKED  CLEAR 1 RUN';
  }
}

function applyHeroUi(){
  shell.dataset.hero=selectedHeroId;shell.style.setProperty('--hero-accent',heroDef.accent);ui.heroPortrait.style.setProperty('--hero-portrait',`url('${heroDef.portrait}')`);
  ui.heroName.textContent=heroDef.name.toUpperCase();ui.heroRole.textContent=heroDef.role.toUpperCase();ui.weaponName.textContent=weapon.name.toUpperCase();ui.dashName.textContent=heroDef.dashName.toUpperCase();
  ui.startHeroMark.style.backgroundImage=`url('${heroDef.portrait}')`;ui.startHeroName.textContent=heroDef.name.toUpperCase();
  ui.startHeroCopy.textContent=selectedHeroId==='bamboo'?`${heroDef.role}  Wide spirit cannon  ${heroDef.passiveName}`:`${heroDef.role}  Precision spirit blaster  ${heroDef.passiveName}`;
  ui.startHeroCopy.textContent=`${heroDef.role} / ${heroDef.difficulty} / ${heroDef.passiveName}`;
  ui.comparisonRatings.innerHTML=Object.entries(heroDef.ratings).map(([name,value])=>`<div class="comparison-rating"><b>${name.toUpperCase()}</b><span class="rating-pips">${Array.from({length:5},(_,index)=>`<i class="${index<value?'active':''}"></i>`).join('')}</span></div>`).join('');
  ui.comparisonWeapon.textContent=weapon.name.toUpperCase();ui.comparisonWeaponTags.textContent=weapon.tags.join(' / ');ui.comparisonWeaponCopy.textContent=weapon.summary;
  ui.comparisonWeaponStats.innerHTML=`<span><small>DAMAGE</small><b>${weapon.damage}</b></span><span><small>FIRE RATE</small><b>${(1/weapon.fireRate).toFixed(1)}/S</b></span><span><small>SHOTS</small><b>${(weapon.shots||1)*(weapon.baseVolleys||1)}</b></span><span><small>CRIT</small><b>${Math.round(weapon.criticalChance*100)}%</b></span>`;
  for(const button of document.querySelectorAll('[data-hero]'))button.classList.toggle('selected',button.dataset.hero===selectedHeroId);
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
const effects = { particles: [], afterimages: [], numbers: [], words: [], rings: [], shards: [], projectiles: [], playerShots: [], vortices: [], shockStorms: [], flameBolts: [], fireTrails: [], blooms: [], spriteEffects: [], shockLinks: [], stars: [], enemyHazards: [], guardianSignatures: [] };
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
let audioContext;
const AUDIO_SOURCES={music:'assets/audio/music-spirit-woods.mp3',blaster:'assets/audio/weapon-blaster.mp3',arrow:'assets/audio/weapon-arrow.mp3',slice:'assets/audio/weapon-magic-slice.mp3',impact:'assets/audio/impact-body.mp3',fire:'assets/audio/ability-fire.mp3',water:'assets/audio/ability-water.mp3',lightning:'assets/audio/ability-lightning.mp3',stomp:'assets/audio/boss-stomp.mp3'};
const audioSamples=Object.fromEntries(Object.entries(AUDIO_SOURCES).map(([id,src])=>[id,new Audio(src)]));
audioSamples.music.loop=true;audioSamples.music.volume=.16;
let enemyId = 0;
let encounter;
let currentUpgradeChoices = [];
let pendingLevelUps = 0;
let currentRouteChoices = [];
let pendingRouteWave = 0;
let activeRouteEvent = null;
let roomInteractable = null;
let destructibles = [];
let roomMission = null;
let missionCheckpointClock = 0;
let defeatReason = '';
let roomTransitionTimer = 0;
let codexReturnState = 'preview';
let activeCodexTab = 'heroes';
let activeCodexId = null;
let runActive = false;
let pausedState = 'playing';
let settingsReturnState = 'preview';
let currentGuardianRewards = [];
let pendingGuardianReward = null;
let corruptionDirector = null;
const coop={peer:null,hostConnection:null,connections:new Map(),connected:false,isRoomHost:false,code:'',id:crypto.randomUUID(),hostId:null,members:new Map(),remotePlayers:new Map(),snapshotClock:0,presenceClock:0,applyingSignal:false};

function coopPartySize(){return coop.connected?Math.max(1,coop.members.size):1;}
function coopIsHost(){return coopPartySize()===1||coop.hostId===coop.id;}
function coopPressure(){const extra=Math.max(0,coopPartySize()-1);return {health:1+extra*.62,damage:1+extra*.16,count:1+extra*.34,elite:extra*.07,reward:1+extra*.18,reinforcements:extra};}
function activeEnemyLimit(){
  if(!encounter||encounter.bossActive||state==='dojo')return Number.POSITIVE_INFINITY;
  return encounterActiveLimit({waveIndex:encounter.wave,chapterIndex,difficultyId:selectedDifficulty,partySize:coopPartySize(),elite:encounter.nodeType==='elite'||encounter.nodeType?.includes('Elite')});
}
function refreshCoopUi(message=''){
  const online=coop.connected;coopPanel?.classList.toggle('online',online);if(coopStatus)coopStatus.textContent=online?`${coopIsHost()?'HOST':'ALLY'} · ${coop.code} · ${coopPartySize()}/4`:'SOLO · OFFLINE READY';
  if(coopRoster)coopRoster.textContent=message||(online?[...coop.members.values()].map((member)=>`${member.name} ${member.hero.toUpperCase()}`).join(' · '):'FREE PEER-TO-PEER CO-OP · 2–4 PLAYERS INCREASE THE CHALLENGE');
  if(coopLeaveButton)coopLeaveButton.hidden=!online;if(coopCreateButton)coopCreateButton.hidden=online;if(coopJoinButton)coopJoinButton.hidden=online;if(coopCodeInput)coopCodeInput.readOnly=online;
}
function coopRoomCode(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const bytes=crypto.getRandomValues(new Uint8Array(5));return [...bytes].map((value)=>alphabet[value%alphabet.length]).join('');}
function coopMember(){return {id:coop.id,name:HEROES[selectedHeroId].name,hero:selectedHeroId,x:player?.x||room.playerSpawn.x,y:player?.y||room.playerSpawn.y,facing:player?.facing||0,health:player?.health||heroDef.maxHealth,state,room:room.id};}
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
  const member=coop.members.get(playerId);const remoteWeapon=WEAPONS[HEROES[heroId]?.weapon];if(!member||!remoteWeapon||payload.kind!=='attack')return;const angle=Number(payload.facing)||0;const direction={x:Math.cos(angle),y:Math.sin(angle)};const pellets=remoteWeapon.shots||1;
  for(let i=0;i<pellets;i++){const shotAngle=angle+(i-(pellets-1)/2)*(remoteWeapon.spread||0);effects.playerShots.push({x:member.x+direction.x*48,y:member.y+direction.y*48-7,vx:Math.cos(shotAngle)*remoteWeapon.projectileSpeed,vy:Math.sin(shotAngle)*remoteWeapon.projectileSpeed,radius:remoteWeapon.projectileRadius||9,damage:remoteWeapon.damage*.78,color:remoteWeapon.color,arrow:remoteWeapon.projectileType==='arrow',trickshot:remoteWeapon.projectileType==='trickshot',ricochets:remoteWeapon.ricochets||0,ricochetRetention:.78,pierces:remoteWeapon.pierces||0,hitIds:new Set(),life:remoteWeapon.projectileLife,maxLife:remoteWeapon.projectileLife});}
  burst(member.x+direction.x*44,member.y+direction.y*44,remoteWeapon.impactColor,10,220,3);
}
function coopSignal(payload){if(coopIsHost())sendCoop('signal',{payload});}
function applyCoopSignal(payload){if(!payload)return;coop.applyingSignal=true;if(payload.kind==='wave'){setChapter(payload.chapter);startWave(payload.wave,{nodeType:payload.nodeType||'combat'});}else if(payload.kind==='boss'){setChapter(payload.chapter);spawnBoss();}coop.applyingSignal=false;}
function applyCoopSnapshot(payload){
  if(!payload||payload.room!==room.id)return;for(const saved of payload.enemies||[]){let enemy=enemies.find((candidate)=>candidate.id===saved.id);if(!enemy){enemy=makeEnemy({type:saved.type,x:saved.x,y:saved.y,delay:0,healthScale:1,speedScale:1,damageScale:1},enemies.length);enemy.id=saved.id;enemies.push(enemy);}Object.assign(enemy,saved);enemy.def=ENEMIES[enemy.type];}
  const ids=new Set((payload.enemies||[]).map((enemy)=>enemy.id));for(const enemy of enemies)if(!ids.has(enemy.id))enemy.dead=true;
}
function updateCoop(dt){
  if(!coop.connected||!player)return;coop.presenceClock-=dt;coop.snapshotClock-=dt;if(coop.presenceClock<=0){coop.presenceClock=.08;sendCoop('presence',{x:player.x,y:player.y,facing:player.facing,health:player.health,hero:selectedHeroId,state,room:room.id});}
  if(coopIsHost()&&coop.snapshotClock<=0&&state==='playing'){coop.snapshotClock=.1;sendCoop('snapshot',{payload:{room:room.id,enemies:enemies.map(({id,type,x,y,vx,vy,facing,state,stateTime,health,maxHealth,shield,maxShield,dead,deathTime,burnTime,wetTime,shockTime,bossPhase})=>({id,type,x,y,vx,vy,facing,state,stateTime,health,maxHealth,shield,maxShield,dead,deathTime,burnTime,wetTime,shockTime,bossPhase}))}});}
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
  return {
    ...player,x:room.playerSpawn.x,y:room.playerSpawn.y,vx:0,vy:0,attack:null,shotCooldown:0,dashTime:0,dashCooldown:0,invulnerable:1.1,flash:0,hurtTime:0,stunTime:0,castTime:0,ultimateFlash:0,wildHeartTime:0,braceTime:0,braced:false,
    unlockedAbilities:[...player.unlockedAbilities],synergies:[...player.synergies],eventHistory:[...player.eventHistory],shopPurchases:[...player.shopPurchases]
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
  const snapshot={version:RUN_VERSION,savedAt:Date.now(),heroId:selectedHeroId,difficulty:selectedDifficulty,chapterIndex,runTime,checkpoint,player:serializePlayerCheckpoint()};
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
  restored.synergies=new Set(Array.isArray(saved.synergies)?saved.synergies:[]);
  restored.eventHistory=new Set(Array.isArray(saved.eventHistory)?saved.eventHistory:[]);
  restored.shopPurchases=new Set(Array.isArray(saved.shopPurchases)?saved.shopPurchases:[]);
  Object.assign(player,restored,{x:room.playerSpawn.x,y:room.playerSpawn.y,vx:0,vy:0,attack:null,dashTime:0,shotCooldown:0,invulnerable:1.1,flash:0,hurtTime:0,stunTime:0,castTime:0,ultimateFlash:0,wildHeartTime:0,braceTime:0,braced:false});
  player.health=clamp(Number(player.health)||1,1,player.maxHealth);camera.x=player.x;camera.y=player.y;camera.shake=0;resolveSynergies();
}

function resumeSavedRun(){
  const snapshot=loadRunCheckpoint();if(!snapshot){refreshContinueRunUi();return;}
  ensureAudio();input.attack=false;input.attackHeld=false;input.keys.clear();
  selectedHeroId=snapshot.heroId;heroDef=HEROES[selectedHeroId];weapon=WEAPONS[heroDef.weapon];selectedDifficulty=snapshot.difficulty;applyHeroUi();refreshProfileUi();
  resetGame();setChapter(snapshot.chapterIndex);restorePlayerCheckpoint(snapshot.player);runTime=Math.max(0,Number(snapshot.runTime)||0);runActive=true;
  startScreen.classList.remove('active');resultScreen.classList.remove('active');hud.classList.remove('hidden');
  const point=snapshot.checkpoint;
  if(point.kind==='boss')spawnBoss({restoring:true});
  else if(point.kind==='guardianReward')openGuardianReward(point.guardianId);
  else if(point.kind==='route')openRoute(point.nextWave);
  else if(point.kind==='wave')startWave(point.wave,point.modifiers||{});
  else showStory(['boss','epilogue'].includes(point.beat)?point.beat:'intro');
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
}

function openSettings(returnState=state){
  if(state==='settings')return;settingsReturnState=returnState;state='settings';settingsScreen.classList.add('active');refreshSettingsUi();input.keys.clear();input.attackHeld=false;
}

function closeSettings(){if(state!=='settings')return;settingsScreen.classList.remove('active');state=settingsReturnState||'preview';lastTime=performance.now();}

function changeSetting(key,raw){
  if(!(key in DEFAULT_SETTINGS))return;profile.settings[key]=raw==='true'?true:raw==='false'?false:Number(raw);saveProfile();refreshSettingsUi();
}

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
  gatewardenRhino:{lore:'An oathbound sentinel protected by a regenerating forward spirit ward.',counter:'Shots from the front feed its shield. Flank it, break the ward, then burst before it reforms.'}
};

const BEHAVIOR_LABELS={basic:'SWARMER',melee:'DUELIST',ranged:'MARKSMAN',heavy:'BRUISER',summoner:'SUMMONER',bomber:'BOMBER',assassin:'ASSASSIN',shield:'WARDEN',boss:'GUARDIAN'};
const STATUS_ART={burn:'assets/vfx/burn-status.png',wet:'assets/vfx/water-impact.png',shock:'assets/vfx/shock-paws-impact.png',stun:'assets/vfx/hammer-slam.png'};
const SPECIALIST_ART={bellweaverCat:'bellweaver-cat',powderkegToad:'powderkeg-toad',gatewardenRhino:'gatewarden-rhino',mistclawLynx:'mistclaw-lynx'};
const BOSS_ART={jadeguardTanuki:'jadeguard-tanuki-v2',moonfangKomainu:'moonfang-komainu',pyreclawShogun:'pyreclaw-shogun'};

function codexArtFor(entry,tab){
  if(tab==='heroes')return {image:entry.portrait,size:'cover',position:'center'};
  if(tab==='statuses')return {image:STATUS_ART[entry.id],size:'cover',position:'center'};
  if(BOSS_ART[entry.id])return {image:`assets/characters/${BOSS_ART[entry.id]}.png`,size:'300% 200%',position:'0% 0%'};
  if(SPECIALIST_ART[entry.id])return {image:`assets/characters/${SPECIALIST_ART[entry.id]}.png`,size:'400% 600%',position:'0% 0%'};
  const columns=3;const x=(entry.spriteColumn||0)/(columns-1)*100;
  if(entry.biome==='bamboo')return {image:'assets/characters/bamboo-enemies-v3.png',size:'300% 200%',position:`${x}% 0%`};
  if(entry.biome==='crimson')return {image:'assets/characters/crimson-enemies.png',size:'300% 200%',position:`${x}% 0%`};
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
  if(!unlocked){const heroLock=tab==='heroes';const heroNote=entry.id==='rusty'?'Complete one full Ascension campaign to prove you can handle Rusty"s twin Trickshots.':'Defeat Pyreclaw and finish all three chapters to add this BrawlPaw to the roster.';codexDetail.innerHTML=`<div class="codex-detail-hero"><div class="codex-detail-art"></div><div><h3>${heroLock?'LOCKED BRAWLPAW':'UNRECORDED SPIRIT'}</h3><span class="codex-role">${heroLock?(entry.id==='rusty'?'ASCENSION CLEAR REQUIRED':'CAMPAIGN CLEAR REQUIRED'):'ENCOUNTER REQUIRED'}</span><p>${heroLock?(entry.unlockRequirement||'Complete a campaign challenge to unlock this hero.'):'This archive entry will reveal itself after the spirit appears in a run.'}</p></div></div><div class="codex-tip"><small>ARCHIVIST NOTE</small><b>${heroLock?heroNote:'Explore later chapters, elite routes, and guardian chambers to complete the record.'}</b></div>`;return;}
  if(tab==='heroes'){
    const heroWeapon=WEAPONS[entry.weapon];const capstones={kitsune:['PHASE NOVA','After Spirit Cylinder II and Phase Rounds I at level 7, every fifth volley pierces deeply and detonates the surrounding pack.'],bamboo:['SIEGE LOTUS','After Scatter Bore I and Guardian Hide I at level 7, every third blast loads a giant central shell with explosive knockback.'],hopscotch:['MOON CONSTELLATION','After Moon Piercer II and Perfect Draw I at level 7, every fourth full draw splits into two seeking moon arrows.'],rusty:['DEADEYE CIRCUIT','After Bank Shot II and Loaded Dice I at level 7, every sixth volley becomes a guaranteed critical execution chain.']};const capstone=capstones[entry.id];
    codexDetail.innerHTML=`<div class="codex-detail-hero"><div class="codex-detail-art"></div><div><h3>${entry.name.toUpperCase()}</h3><span class="codex-role">${entry.role.toUpperCase()} / ${entry.difficulty.toUpperCase()}</span><p>${entry.summary}</p></div></div><div class="codex-stats"><span><small>HEALTH</small><b>${entry.maxHealth}</b></span><span><small>SPEED</small><b>${entry.speed}</b></span><span><small>POWER</small><b>${entry.ratings.power}/5</b></span><span><small>CONTROL</small><b>${entry.ratings.control}/5</b></span></div><div class="codex-tip"><small>STARTING WEAPON / ${heroWeapon.name.toUpperCase()}</small><b>${heroWeapon.summary} ${heroWeapon.damage} base damage, ${(1/heroWeapon.fireRate).toFixed(1)} volleys per second.</b></div><div class="codex-tip"><small>EARNED CAPSTONE / ${capstone[0]}</small><b>${capstone[1]}</b></div>`;
    return;
  }
  if(tab==='statuses'){
    const statusTips={burn:'Refresh Burn with Foxfire to keep damage ticking until the target falls.',wet:'Undertow Well applies Wet; Foxfire detonates Wet packs and Shock Paws deals bonus damage to them.',shock:'Lightning pulses are global and briefly expose every afflicted enemy.',stun:'Stunned targets cannot move or attack. Heavy hammers can stun heroes too.'};
    codexDetail.innerHTML=`<div class="codex-detail-hero"><div class="codex-detail-art"></div><div><h3>${entry.name.toUpperCase()}</h3><span class="codex-role">ELEMENTAL CONDITION</span><p>${entry.description}</p></div></div><div class="codex-tip"><small>TACTICAL USE</small><b>${statusTips[entry.id]}</b></div>`;return;
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
  ,{id:'phaseNova',name:'Phase Nova',icon:'NOVA',type:'KITSUNE CAPSTONE',color:'#d94cff',description:'Every fifth blaster volley phases through its mark and detonates spirit damage through the surrounding pack.',detail:'5th volley / piercing pack detonation',available:()=>player.level>=7&&selectedHeroId==='kitsune'&&!player.weaponEvolution&&player.upgradeRanks.spiritCylinder>=2&&player.upgradeRanks.phaseRounds>=1,apply:()=>{player.weaponEvolution='phaseNova';}}
  ,{id:'siegeLotus',name:'Siege Lotus',icon:'SIEGE',type:'BAMBOO CAPSTONE',color:'#ffd13a',description:'Every third cannon blast loads an immense spirit shell that erupts on contact and throws the whole pack outward.',detail:'3rd blast / heavy area explosion',available:()=>player.level>=7&&selectedHeroId==='bamboo'&&!player.weaponEvolution&&player.upgradeRanks.scatterBore>=1&&player.upgradeRanks.guardianHide>=1,apply:()=>{player.weaponEvolution='siegeLotus';}}
  ,{id:'moonConstellation',name:'Moon Constellation',icon:'SPLIT',type:'HOPSCOTCH CAPSTONE',color:'#ff5fbd',description:'Every fourth fully drawn arrow fractures after impact and hunts two additional enemies.',detail:'4th arrow / two seeking splinters',available:()=>player.level>=7&&selectedHeroId==='hopscotch'&&!player.weaponEvolution&&player.upgradeRanks.moonPiercer>=2&&player.upgradeRanks.perfectDraw>=1,apply:()=>{player.weaponEvolution='moonConstellation';}}
  ,{id:'deadeyeCircuit',name:'Deadeye Circuit',icon:'CHAIN',type:'RUSTY CAPSTONE',color:'#ff9b32',description:'Every sixth twin-revolver volley becomes a guaranteed critical execution chain with two additional full-force banks.',detail:'6th volley / critical ricochet chain',available:()=>player.level>=7&&selectedHeroId==='rusty'&&!player.weaponEvolution&&player.upgradeRanks.bankShot>=2&&player.upgradeRanks.loadedDice>=1,apply:()=>{player.weaponEvolution='deadeyeCircuit';}}
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
    kicker:'THE ONI GATE STANDS OPEN',title:'CHOOSE YOUR FINAL VOW',copy:'Pyreclaw releases the last chain. Decide what your victory means for the spirit realm.',final:true,
    choices:[
      {id:'mercy',name:'Vow of Mercy',icon:'HEART',type:'RESTORE THE GUARDIANS',color:'#71f09a',description:'Purify the remaining corruption and return every guardian to its sacred post.',detail:'+30 victory shards / hopeful epilogue',shardBonus:30,ending:'mercy'},
      {id:'power',name:'Vow of Power',icon:'CROWN',type:'CLAIM THE ONI FLAME',color:'#ff5a35',description:'Take Pyreclaw’s flame into yourself and become the new keeper of the sealed gate.',detail:'+65 victory shards / power epilogue',shardBonus:65,ending:'power'},
      {id:'freedom',name:'Vow of Freedom',icon:'WING',type:'BREAK EVERY CHAIN',color:'#d95cff',description:'Destroy the spirit road’s ancient bindings so no guardian can ever be chained again.',detail:'+45 victory shards / freedom epilogue',shardBonus:45,ending:'freedom'}
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
  unlockUndertow:'rare',unlockFoxfire:'rare',unlockHeart:'rare',unlockShock:'epic',dualWield:'epic',
  spiritRounds:'common',quickPaws:'common',vitality:'common',undertow:'rare',hungryFlame:'rare',heartBloom:'rare',stormHeart:'epic',
  wardbreaker:'common',spiritHunter:'rare',spiritCatalyst:'rare',pressureChamber:'epic',headhunter:'rare',keenEye:'common',
  spiritCylinder:'common',phaseRounds:'epic',foxstepMastery:'rare',ironBelly:'rare',scatterBore:'epic',guardianHide:'rare',
  phaseNova:'epic',siegeLotus:'epic',moonConstellation:'epic',deadeyeCircuit:'epic'
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
      {name:'BREAK THE SEAL',tag:'RELIC  CURSED BLOOD',color:'#d94cff',description:'Claim a random relic and 35 gold, but permanently lose 12 maximum health this run.',result:'RELIC + 35 GOLD  -12 MAX HP',apply:()=>{player.maxHealth=Math.max(60,player.maxHealth-12);player.health=Math.min(player.health,player.maxHealth);player.gold+=35;grantRelic();finishRouteEvent({damageScale:1.1});}},
      {name:'FEED THE LANTERN',tag:'30 GOLD  SAFE PASSAGE',color:'#65ef55',description:'Pay the spirit, restore 45 health, and gain one additional upgrade reroll.',result:'-30 GOLD  +45 HP  +1 REROLL',available:()=>player.gold>=30,apply:()=>{player.gold-=30;player.health=Math.min(player.maxHealth,player.health+45);player.rerolls++;finishRouteEvent();}}
    ]},
    {kicker:'THE ECHO POOL',title:'YOUR REFLECTION ATTACKS FIRST',copy:'Moonlit water shows a stronger reflection with colder eyes. It offers its power, but only if the next pack is allowed to hunt at full strength.',quote:'If you want my fire, survive my enemies.',choices:[
      {name:'ACCEPT THE REFLECTION',tag:'POWER  ELITE NEXT WAVE',color:'#ff4d9d',description:'Increase every ability by 12%. The next wave becomes faster, tougher, and far more rewarding.',result:'+12% ABILITY POWER  160% REWARD',apply:()=>{for(const id of Object.keys(player.abilityPower))player.abilityPower[id]*=1.12;finishRouteEvent({healthScale:1.18,speedScale:1.15,damageScale:1.14,rewardScale:1.6,nodeType:'eventElite'});}},
      {name:'STILL THE WATER',tag:'RECOVERY  MAX HEALTH',color:'#41e8ff',description:'Reject the bargain, gain 14 maximum health, and enter the next fight restored.',result:'+14 MAX HP  +35 HP',apply:()=>{player.maxHealth+=14;player.health=Math.min(player.maxHealth,player.health+49);finishRouteEvent();}}
    ]}
  ],
  secret:[
    {kicker:'SECRET PATH / HIDDEN SPIRIT DEN',title:'THE ARSENAL BENEATH THE ROOTS',copy:'Two ancient spirit weapons rest above a warning carved into the stone: take both, and every guardian on the road will know your name.',quote:'One weapon escapes notice. Two begin a war.',choices:[
      {name:'TAKE THE TWIN BLASTERS',tag:'WEAPON EVOLUTION  EXTREME WAVE',color:'#ffcf3a',description:'Immediately unlock Dual-Wield. The next wave gains elite health, speed, and damage.',result:'DUAL-WIELD  190% REWARD',available:()=>!player.dualWield,apply:()=>{player.dualWield=true;resolveSynergies();finishRouteEvent({healthScale:1.32,speedScale:1.22,damageScale:1.24,rewardScale:1.9,nodeType:'secretElite'});}},
      {name:'EMPTY THE SPIRIT CACHE',tag:'TREASURE  BLOOD PRICE',color:'#d94cff',description:'Take 100 gold and one reroll. The sealed cache drains 22 current health.',result:'+100 GOLD  +1 REROLL  -22 HP',apply:()=>{player.gold+=100;player.rerolls++;player.health=Math.max(1,player.health-22);finishRouteEvent({speedScale:1.08});}}
    ]},
    {kicker:'SECRET PATH / MIRROR SHRINE',title:'FOUR POWERS, ONE REFLECTION',copy:'A cracked mirror contains an ability the hero has not yet awakened. Pulling it free will also pull something hungry through the glass.',quote:'Every shortcut opens in both directions.',choices:[
      {name:'STEAL THE REFLECTION',tag:'ABILITY POWER  CURSE',color:'#e04cff',description:'Charge every future technique by 24%, but take 8% more damage for the rest of this run.',result:'+24% ABILITY POWER  +8% DAMAGE TAKEN',available:()=>true,apply:()=>{for(const id of Object.keys(player.abilityPower))player.abilityPower[id]*=1.24;player.damageTakenMultiplier*=1.08;resolveSynergies();finishRouteEvent({damageScale:1.1});}},
      {name:'SHATTER THE MIRROR',tag:'RELIC  GUARDIAN WRATH',color:'#45eaff',description:'Destroy the passage and claim a relic shard. The next enemies arrive much faster.',result:'RANDOM RELIC  FAST WAVE',apply:()=>{grantRelic();finishRouteEvent({speedScale:1.2,rewardScale:1.35,nodeType:'secret'});}}
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
  const nextRoom=ROOMS[roomId];if(!nextRoom)return;room=nextRoom;assets.arena=arenaCache.get(room.id)||assets.arena;
  if(reposition&&player){player.x=room.playerSpawn.x;player.y=room.playerSpawn.y;player.vx=0;player.vy=0;player.facing=-Math.PI/2;player.invulnerable=Math.max(player.invulnerable,1.1);camera.x=player.x;camera.y=player.y;camera.shake=0;}
  ui.biomeTitle.textContent=room.name.toUpperCase();ui.routeBiome.textContent=`${room.name.toUpperCase()}  BRANCHING ROUTE`;canvas.setAttribute('aria-label',`${room.name} combat arena`);
  if(announce)showRoomTransition(waveIndex,subtitle);
}

function showRoomTransition(waveIndex,subtitle=''){
  clearTimeout(roomTransitionTimer);ui.roomTransitionKicker.textContent=`CHAPTER ${chapterIndex+1}  ${chapter.name.toUpperCase()}`;ui.roomTransitionTitle.textContent=room.name.toUpperCase();
  ui.roomTransitionSubtitle.textContent=subtitle||`SEAL ${waveIndex+1} OF ${chapter.waves.length}`;ui.roomTransition.classList.remove('active');void ui.roomTransition.offsetWidth;ui.roomTransition.classList.add('active');
  roomTransitionTimer=setTimeout(()=>ui.roomTransition.classList.remove('active'),1100);
}

function roomForWave(index){const rooms=chapter.rooms||[chapter.room];return rooms[Math.min(rooms.length-1,index%rooms.length)];}

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
    ui.hubMenuCopy.textContent='Your campaign record and every spirit encountered are stored on this device.';
    const difficulty=activeDifficulty();hubUpgradeGrid.innerHTML=`<div class="hub-upgrade-card" style="--hub:#ffd13a"><strong>CAMPAIGN RECORD</strong><em>${profile.campaignClears} CLEARS  ${profile.runsStarted} RUNS</em><p>Highest level ${profile.highestLevel}. Best clear: ${profile.bestDifficulty?profile.bestDifficulty.toUpperCase():'NONE YET'}.</p><b>  ${profile.spiritShards} BANKED</b></div><div class="hub-upgrade-card" style="--hub:#42eaff"><strong>ACTIVE CHALLENGE</strong><em>${difficulty.name.toUpperCase()}${difficulty.rank?`  RANK ${difficulty.rank}`:''}</em><p>${difficulty.description}</p><b>${Math.round(difficulty.rewardScale*100)}% REWARDS</b></div><button type="button" class="hub-upgrade-card" style="--hub:#d95cff" data-open-codex><strong>SPIRIT ARCHIVE</strong><em>${profile.discoveredEnemies.length} ENEMIES  ${profile.discoveredGuardians.length} GUARDIANS</em><p>Study recorded attack roles, weaknesses, status effects, and guardian patterns.</p><b>OPEN BRAWLPAWS CODEX</b></button>`;
    hubUpgradeGrid.querySelector('[data-open-codex]').addEventListener('click',()=>openCodex('enemies'));
  } else {
    ui.hubMenuCopy.textContent='Train before entering the spirit road. Abilities remain locked until earned during each run.';
    hubUpgradeGrid.innerHTML=`<div class="hub-upgrade-card" style="--hub:#72ef5b"><strong>MOVEMENT</strong><em>WASD  SHIFT</em><p>Move, kite, and use your hero dash for invulnerability. Enemy speed rises every chapter.</p><b>PERFECT DODGES BUILD SPACE</b></div><div class="hub-upgrade-card" style="--hub:#d95cff"><strong>COMBAT</strong><em>LMB  E  C  F  Q</em><p>Fire your ranged weapon and unlock abilities from level-up choices during the campaign.</p><b>ABILITIES START LOCKED</b></div>`;
  }
}

function renderHubUpgrade(upgrade){
  const rank=profile[upgrade.id]||0;const maxed=rank>=upgrade.max;const cost=maxed?0:upgrade.cost(rank);const affordable=profile.spiritShards>=cost;
  hubUpgradeGrid.innerHTML=`<button class="hub-upgrade-card" style="--hub:${upgrade.color}" data-hub-buy ${maxed||!affordable?'disabled':''}><strong>${upgrade.name}</strong><em>RANK ${rank} / ${upgrade.max}</em><p>${upgrade.description}</p><b>${maxed?'MAXIMUM RANK':`  ${cost}`}</b></button><div class="hub-upgrade-card" style="--hub:#78658a"><strong>NEXT RUN</strong><em>PERMANENT LEGACY</em><p>These bonuses do not unlock active abilities. Undertow Well, Foxfire Volley, Wild Heart, and Shock Paws must still be earned at levels 2, 4, 6, and 8.</p><b>  ${profile.spiritShards} AVAILABLE</b></div>`;
  if(upgrade.id==='vitalityRank'){
    hubUpgradeGrid.insertAdjacentHTML('beforeend',Object.values(HEROES).map((hero)=>{const unlocked=profile.unlockedHeroes.includes(hero.id)||hero.id===debugHero;const lockCallout=hero.id==='rusty'?'CLEAR ASCENSION TO UNLOCK':'DEFEAT PYRECLAW TO UNLOCK';return `<button class="hub-upgrade-card hub-hero-card ${hero.id===selectedHeroId?'selected':''}" style="--hub:${hero.accent}" data-hub-hero="${hero.id}" ${unlocked?'':'disabled'}><strong>${unlocked?hero.name.toUpperCase():'??? LOCKED'}</strong><em>${hero.role.toUpperCase()}  ${hero.passiveName.toUpperCase()}</em><p>${unlocked?`${WEAPONS[hero.weapon].name}. ${hero.summary}`:(hero.unlockRequirement||'Complete the campaign to unlock.')}</p><b>${unlocked?(hero.id===selectedHeroId?'ACTIVE BRAWLPAW':'SWITCH HERO'):lockCallout}</b></button>`;}).join(''));
    for(const button of hubUpgradeGrid.querySelectorAll('[data-hub-hero]'))button.addEventListener('click',()=>selectHero(button.dataset.hubHero,{returnToHub:true}));
  }
  hubUpgradeGrid.querySelector('[data-hub-buy]')?.addEventListener('click',()=>buyHubUpgrade(upgrade));
}

function buyHubUpgrade(upgrade){
  const rank=profile[upgrade.id]||0;if(rank>=upgrade.max)return;const cost=upgrade.cost(rank);if(profile.spiritShards<cost)return;
  profile.spiritShards-=cost;profile[upgrade.id]=rank+1;saveProfile();refreshProfileUi();ui.hubShards.textContent=`SHARDS ${profile.spiritShards}`;
  if(upgrade.id==='vitalityRank'){player.maxHealth+=5;player.health+=5;}else if(upgrade.id==='forgeRank')player.damageMultiplier*=1.03;else if(upgrade.id==='attunementRank')for(const id of Object.keys(player.abilityPower))player.abilityPower[id]*=1.04;else if(upgrade.id==='purseRank')player.gold+=5;
  spawnWord(player.x,player.y-90,'PERMANENT POWER!',upgrade.color);playTone(360,.32,'triangle',.05,430);renderHubUpgrade(upgrade);updateHud();
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
  setChapter(0);
  const legacyHealth=Math.min(25,profile.campaignClears*5)+profile.vitalityRank*5;const legacyGold=Math.min(25,profile.campaignClears*5)+profile.purseRank*5;
  player = {
    x: room.playerSpawn.x, y: room.playerSpawn.y, vx: 0, vy: 0, radius: heroDef.radius,
    facing: -Math.PI / 2, health: heroDef.maxHealth+legacyHealth, maxHealth: heroDef.maxHealth+legacyHealth, invulnerable: 0, flash: 0,
    dashTime: 0, dashCooldown: 0, dashDirection: { x: 0, y: -1 }, dashTrailClock: 0,sprint:100,sprinting:false,footstepClock:0,
    attack: null, shotCooldown: 0,
    abilityCooldowns: { undertowWell: 0, foxfireVolley: 0, wildHeart: 0, shockPaws: 0 },
    unlockedAbilities: new Set(), dualWield:Boolean(heroDef.naturalDual), damageMultiplier: 1+profile.forgeRank*.03, fireRateMultiplier: 1,
    rerolls:1,paidRerolls:0,synergies:new Set(),eventHistory:new Set(),shotsFired:0,
    abilityPower: { undertowWell: 1+profile.attunementRank*.04, foxfireVolley: 1+profile.attunementRank*.04, wildHeart: 1+profile.attunementRank*.04, shockPaws: 1+profile.attunementRank*.04 },
    upgradeRanks:{spiritRounds:0,quickPaws:0,vitality:0,undertow:0,hungryFlame:0,heartBloom:0,stormHeart:0,wardbreaker:0,spiritHunter:0,spiritCatalyst:0,pressureChamber:0,headhunter:0,keenEye:0,moonPiercer:0,perfectDraw:0,glassFang:0,spiritMomentum:0,guardianHunter:0,deepReserves:0,bankShot:0,loadedDice:0,quickdraw:0,spiritCylinder:0,phaseRounds:0,foxstepMastery:0,ironBelly:0,scatterBore:0,guardianHide:0},
    heartBonus: 0, stormBonus: 0,guardianBlessings:[],endingVow:null,victoryShardBonus:0,
    gold:legacyGold,goldMultiplier:1,relics:[],shopPurchases:new Set(),killHeal:0,damageTakenMultiplier:heroDef.damageTakenMultiplier,speedMultiplier:1,dashCooldownMultiplier:1,
    knockbackResistance:heroDef.knockbackResistance,knockbackMultiplier:1,braceTime:0,braceDelay:.72,braceDamageMultiplier:.8,braced:false,shieldDamageMultiplier:1,eliteDamageMultiplier:1,guardianDamageMultiplier:1,eliteGoldMultiplier:1,eliteKillHeal:0,statusDurationMultiplier:1,bonusProjectiles:0,bonusPierces:0,bonusRicochets:0,ricochetDamageRetention:.78,critBonus:0,critDamageMultiplier:1,weaponEvolution:null,
    wildHeartTime: 0, ultimateFlash: 0, castTime: 0,
    hitCount: 0, maxCombo: 0, comboDrop: 0, dashes: 0, hurtTime: 0, stunTime: 0,
    level: 1, xp: 0, xpToNext: 48
  };
  enemies = [];
  Object.values(effects).forEach((list) => list.splice(0));
  camera.x = player.x; camera.y = player.y; camera.shake = 0; camera.kick = 0;
  encounter = { wave:-1, transitioning:false, transitionTime:0,bossActive:false,bossDefeated:false,storyBeat:'intro',rewardScale:1,nodeType:'combat',startWaveAfterUpgrade:null };roomMission=null;missionCheckpointClock=0;defeatReason='';corruptionDirector=null;
  runTime = 0; runReward=0; hitStop = 0; clearDelay = -1; comboUiTimer = 0; pendingLevelUps = 0; currentUpgradeChoices = [];
  levelupScreen.classList.remove('active');
  storyScreen.classList.remove('active');routeScreen.classList.remove('active');shopScreen.classList.remove('active');eventScreen.classList.remove('active');guardianRewardScreen.classList.remove('active');ui.bossPanel.classList.remove('active');currentGuardianRewards=[];pendingGuardianReward=null;
  ui.waveLabel.textContent = `CHAPTER ${chapterIndex+1}  WAVE 1 / ${chapter.waves.length}`;
  ui.roomState.textContent = 'ENCOUNTER'; ui.roomState.style.color = '#ff38b5';
  ui.objective.textContent = 'BRACE  SPIRITS APPROACH';
  refreshCorruptionHud();updateHud();
}

function applyEnemyStatus(enemy,id,duration,power=1){
  const status=STATUS_EFFECTS[id];if(!status||enemy.dead)return false;
  duration*=player?.statusDurationMultiplier||1;
  enemy[status.field]=Math.max(enemy[status.field]||0,duration);
  enemy.abilityReactType=id;enemy.abilityReactTime=Math.max(enemy.abilityReactTime||0,id==='shock'?.48:id==='burn'?.38:.44);
  if(id==='burn'){enemy.burnTick=Math.min(enemy.burnTick||.45,.45);enemy.burnPower=Math.max(enemy.burnPower||1,power);}
  return true;
}

function resolveEnemyDamage(enemy,amount,incomingDirection=null){
  let remaining=Math.max(0,amount);let shieldDamage=0;let blocked=false;
  const frontalGuard=enemy.def.behavior==='shield';
  const sourceDirection=incomingDirection?normalize(-incomingDirection.x,-incomingDirection.y):null;
  const facingVector={x:Math.cos(enemy.facing),y:Math.sin(enemy.facing)};
  const hitsFront=!frontalGuard||(sourceDirection&&facingVector.x*sourceDirection.x+facingVector.y*sourceDirection.y>.08);
  if(enemy.shield>0&&hitsFront){remaining*=player?.shieldDamageMultiplier||1;shieldDamage=Math.min(enemy.shield,remaining);enemy.shield-=shieldDamage;remaining-=shieldDamage;blocked=frontalGuard;if(blocked){spawnWord(enemy.x+facingVector.x*32,enemy.y-54,'BLOCK!','#ff765d');effects.rings.push({x:enemy.x+facingVector.x*28,y:enemy.y+facingVector.y*18,radius:8,maxRadius:58,color:'#ff5b3a',life:.2,maxLife:.2});}if(enemy.shield<=0){enemy.shield=0;enemy.guardCooldown=enemy.def.guardRecovery||0;spawnWord(enemy.x,enemy.y-78,'SHIELD BREAK!',enemy.eliteDef?.color||enemy.def.color||'#70f06c');effects.rings.push({x:enemy.x,y:enemy.y,radius:18,maxRadius:135,color:enemy.eliteDef?.color||enemy.def.color||'#70f06c',life:.48,maxLife:.48});burst(enemy.x,enemy.y-10,enemy.eliteDef?.color||enemy.def.color||'#70f06c',24,320,5);}}
  enemy.health-=remaining;return {healthDamage:remaining,shieldDamage,total:remaining+shieldDamage,blocked};
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
  const healthScale=(spawn.healthScale||1)*(eliteDef?.healthScale||1);const maxHealth=Math.round(definition.maxHealth*healthScale);const maxShield=Math.round(maxHealth*Math.max(eliteDef?.shieldScale||0,definition.guardScale||0));
  return {
    id: ++enemyId, type: definition.id, def: definition, x: spawn.x, y: spawn.y, vx: 0, vy: 0, radius: definition.radius,
    health:maxHealth,maxHealth,shield:maxShield,maxShield,guardCooldown:0,eliteId:eliteDef?.id||null,eliteDef,eliteRewardScale:eliteDef?.rewardScale||1,splitDepth:spawn.splitDepth||0,
    facing: Math.PI / 2, state: spawn.delay > 0 ? 'waiting' : 'enter', stateTime: spawn.delay || 1.35, spawnDuration:1.35,cooldown: 1.2 + index * .16,
    flash: 0, stagger: 0, dead: false, deathTime: 0, hitPlayer: false, bob: Math.random() * Math.PI * 2,
    burnTime: 0, burnTick: 0, wetTime: 0, shockTime: 0, huntTime: 0,abilityReactTime:0,abilityReactType:'',abilityReactSeed:Math.random()*20,
    orbitAngle: Math.atan2(spawn.y - room.playerSpawn.y, spawn.x - room.playerSpawn.x),
    orbitRadius: definition.behavior === 'ranged' ? 430 : definition.behavior === 'summoner' ? 480 : definition.behavior === 'bomber' ? 390 : definition.behavior === 'assassin' ? 250 : definition.behavior === 'heavy' || definition.behavior === 'shield' ? 105 : definition.behavior === 'boss' ? 260 : definition.behavior === 'basic' ? 86 : 180 + (index % 2) * 34,
    orbitDrift: index % 2 ? 1 : -1, spawnIndex: index, shotSide: index % 2 ? 1 : -1,
    healthScale:spawn.healthScale||1,speedScale:(spawn.speedScale||1)*(eliteDef?.speedScale||1),damageScale:(spawn.damageScale||1)*(eliteDef?.damageScale||1),attackCooldownScale:eliteDef?.cooldownScale||1,windupScale:eliteDef?.windupScale||1,
    summonCharges:definition.summonCharges||0,summoned:Boolean(spawn.summoned),summonOwnerId:spawn.summonOwnerId||null,
    bossPhase: 1, patternIndex: 0, patternHit: false, phaseTriggered: {2:false,3:false}
  };
}

function showStory(beat) {
  encounter.storyBeat = beat; state = 'story'; storyScreen.classList.add('active');
  const bamboo = chapter.id === 'bambooChapter';
  const crimson = chapter.id === 'crimsonChapter';
  if(beat==='epilogue'){
    const endings={
      mercy:{kicker:'EPILOGUE  THE BELLS RETURN',title:'THE GUARDIANS BOW',copy:`${heroDef.name} returns the stolen flame to the three guardians. Jade Grove rings, Bamboo Hollow breathes, and the Crimson bells call warriors home instead of summoning them to die.`,quote:'Strength is not what you take. It is what survives your victory.',button:'RETURN TO SPIRIT LANTERN VILLAGE'},
      power:{kicker:'EPILOGUE  THE NEW GATEKEEPER',title:'THE FLAME CHOOSES YOU',copy:`${heroDef.name} binds Pyreclaw’s oni fire to a new oath. The spirit road is safe, but every creature beyond the gate now knows the name of its fiercest keeper.`,quote:'Let the next curse learn fear before it crosses my gate.',button:'ASCEND FROM THE ONI THRONE'},
      freedom:{kicker:'EPILOGUE  NO MORE CHAINS',title:'THE ROAD HAS NO MASTER',copy:`${heroDef.name} shatters the last ancient seal. The guardians remain by choice, the spirit roads open beneath a thousand lanterns, and every BrawlPaw may choose where the next path leads.`,quote:'A guardian who cannot leave is only another prisoner.',button:'RUN WITH THE FREE SPIRITS'}
    };const ending=endings[player.endingVow]||endings.mercy;ui.storyKicker.textContent=ending.kicker;ui.storyTitle.textContent=ending.title;ui.storyCopy.textContent=ending.copy;ui.storyQuote.textContent=ending.quote;ui.storyButton.innerHTML=`${ending.button} <span></span>`;
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
  if(encounter.storyBeat==='epilogue')endGame(true);else if (encounter.storyBeat === 'boss') spawnBoss(); else startWave(0);
}

function startWave(index,modifiers={}) {
  const wave = chapter.waves[index];
  const difficulty=activeDifficulty();
  Object.values(effects).forEach((list)=>list.splice(0));activateRoom(roomForWave(index),{reposition:true,announce:true,waveIndex:index,subtitle:wave.name.toUpperCase()});
  encounter.wave=index; encounter.transitioning=false; encounter.bossActive=false;encounter.nodeType=modifiers.nodeType||'combat';encounter.modifiers={...modifiers};corruptionDirector=createCorruptionDirector(index,modifiers.corruption);const corruption=corruptionTier();encounter.rewardScale=(modifiers.rewardScale||1)*difficulty.rewardScale*corruption.reward;enemies=[];state='playing';roomInteractable=null;spawnRoomDestructibles(index,modifiers.brokenProps||[]);spawnRoomMission(wave.mission,modifiers.missionState);refreshCorruptionHud({surge:corruptionDirector.tier>=2});
  if(PHYSICAL_ROUTE_NODES.has(encounter.nodeType)){spawnRoomInteractable(encounter.nodeType);if(modifiers.interactableUsed)roomInteractable.used=true;}
  ui.waveLabel.textContent=`CHAPTER ${chapterIndex+1}  WAVE ${index+1} / ${chapter.waves.length}`;
  const eliteNode=encounter.nodeType==='elite'||encounter.nodeType?.includes('Elite');ui.roomState.textContent=eliteNode?`MUTATED  ${wave.name.toUpperCase()}`:wave.name.toUpperCase();ui.roomState.style.color=eliteNode?'#f13b8c':index>=2?'#ff7448':'#ff38b5';
  ui.objective.textContent=roomMission?.title||`SURVIVE ${wave.name.toUpperCase()}`;
  const b=room.combatBounds;const party=coopPressure();
  const authoredCount=wave.targetCount||wave.roster.length;const targetCount=Math.max(wave.roster.length,Math.ceil(authoredCount*(difficulty.enemyCountScale||1)*corruption.count*party.count));const scaledRoster=Array.from({length:targetCount},(_,i)=>wave.roster[i%wave.roster.length]);
  scaledRoster.forEach((type,i)=>{
    const angle=(i/scaledRoster.length)*Math.PI*2+index*.73;
    const lane=(room.spawnLane??.78)+(i%3)*(room.spawnLaneStep??.07);
    enemies.push(makeEnemy({type,eliteId:eliteModifierFor(i,index,encounter.nodeType),delay:1.35+i*wave.spawnRate/((difficulty.spawnRateScale||1)*corruption.spawn),x:b.x+Math.cos(angle)*b.radiusX*lane,y:b.y+Math.sin(angle)*b.radiusY*lane,healthScale:wave.healthScale*(modifiers.healthScale||1)*difficulty.healthScale*corruption.health*party.health,speedScale:wave.speedScale*(modifiers.speedScale||1)*difficulty.speedScale*corruption.speed,damageScale:wave.damageScale*(modifiers.damageScale||1)*difficulty.damageScale*corruption.damage*party.damage},i));
  });
  spawnWord(player.x,player.y-110,`WAVE ${index+1}!`,index>=2?'#ff6a43':'#56edff');
  if(roomMission?.type!=='eliminate')setTimeout(()=>{if(state==='playing'&&roomMission)spawnWord(player.x,player.y-145,roomMission.title,roomMission.color);},420);
  effects.rings.push({x:player.x,y:player.y,radius:18,maxRadius:170,color:index>=2?'#ff5d42':'#45eaff',life:.7,maxLife:.7});
  encounter.modifiers.missionState=serializeMissionState();encounter.modifiers.corruption=serializeCorruptionDirector();saveRunCheckpoint({kind:'wave',wave:index,modifiers:encounter.modifiers});if(!coop.applyingSignal)coopSignal({kind:'wave',chapter:chapterIndex,wave:index,nodeType:encounter.nodeType});
}

function startSpecialistShowcase(){
  activateRoom(ROOMS.jadeRootGarden,{reposition:true,announce:true,waveIndex:2,subtitle:'SPECIALIST COMBAT LAB'});state='playing';encounter.wave=2;encounter.transitioning=false;encounter.bossActive=false;encounter.nodeType='elite';encounter.rewardScale=1;clearDelay=-1;enemies=[];
  player.maxHealth=520;player.health=520;player.damageMultiplier=1.4;player.unlockedAbilities.add('foxfireVolley');player.unlockedAbilities.add('undertowWell');
  const placements=[
    {type:'bellweaverCat',x:player.x-540,y:player.y-250,delay:.2},
    {type:'powderkegToad',x:player.x+520,y:player.y-230,delay:1},
    {type:'gatewardenRhino',x:player.x,y:player.y+390,delay:1.8},
    {type:'mistclawLynx',x:player.x+470,y:player.y+290,delay:2.6}
  ];
  enemies=placements.map((spawn,index)=>makeEnemy({...spawn,healthScale:1.15,speedScale:1,damageScale:.8},index));
  ui.waveLabel.textContent='COMBAT LAB  SPECIALISTS';ui.roomState.textContent='FOUR AUTHORED THREATS';ui.roomState.style.color='#ff9a31';ui.objective.textContent='FLANK  ESCAPE  READ THE MARK';updateHud();
}

function spawnBoss({restoring=false}={}) {
  Object.values(effects).forEach((list)=>list.splice(0));roomInteractable=null;roomMission=null;destructibles=[];activateRoom(chapter.bossRoom||chapter.rooms?.at(-1)||chapter.room,{reposition:true,announce:true,waveIndex:chapter.waves.length,subtitle:'GUARDIAN CHAMBER'});
  const b=room.combatBounds; enemies=[]; encounter.bossActive=true; encounter.transitioning=false; state='playing';
  const difficulty=activeDifficulty();corruptionDirector=createCorruptionDirector(chapter.waves.length);const corruption=corruptionTier(),party=coopPressure();refreshCorruptionHud({surge:true});
  const bossEntranceY=b.y+(chapter.id==='crimsonChapter'?390:280);
  const boss=makeEnemy({type:chapter.boss,x:b.x+330,y:bossEntranceY,delay:.25,healthScale:difficulty.healthScale*corruption.health*party.health,speedScale:difficulty.speedScale*corruption.speed,damageScale:difficulty.damageScale*corruption.damage*party.damage},0);
  boss.state='waiting'; boss.stateTime=.25; enemies.push(boss);
  const bossDef=ENEMIES[chapter.boss];
  ui.waveLabel.textContent=`CHAPTER ${chapterIndex+1}  BOSS`; ui.roomState.textContent=chapter.id==='crimsonChapter'?'INFERNO OATH':chapter.id==='bambooChapter'?'MOON HUNGER':'SPIRIT FURY'; ui.roomState.style.color=bossDef.color;
  ui.objective.textContent=`DEFEAT ${bossDef.name.toUpperCase()}`; ui.bossName.textContent=bossDef.name.toUpperCase(); ui.bossPanel.classList.add('active');
  camera.shake=18;if(!restoring)player.health=Math.min(player.maxHealth,player.health+35);
  saveRunCheckpoint({kind:'boss'});if(!coop.applyingSignal)coopSignal({kind:'boss',chapter:chapterIndex});
}

function beginWaveTransition() {
  if(encounter.transitioning)return;
  encounter.transitioning=true; encounter.transitionTime=2.4;
  ui.roomState.textContent='WAVE CLEARED';ui.roomState.style.color='#65ef4f';ui.objective.textContent='THE CURSE GROWS STRONGER';
  player.health=Math.min(player.maxHealth,player.health+12);
  spawnWord(player.x,player.y-110,'WAVE CLEAR!','#65ef80');
}

function updateEncounter(dt) {
  if (!encounter.transitioning) return;
  encounter.transitionTime-=dt;
  if(encounter.transitionTime>0)return;
  encounter.transitioning=false;
  if(encounter.wave+1<chapter.waves.length) openRoute(encounter.wave+1);
  else showStory('boss');
}

function openRoute(nextWave){
  pendingRouteWave=nextWave;state='route';routeScreen.classList.add('active');currentRouteChoices=ROUTE_SETS[(nextWave-1)%ROUTE_SETS.length];
  ui.routeBiome.textContent=`${room.name.toUpperCase()}  BRANCHING ROUTE`;
  ui.routeProgress.innerHTML=[...Array(chapter.waves.length).keys(),'boss'].map((step,index)=>`<span class="route-step ${index<nextWave?'cleared':index===nextWave?'current':''} ${step==='boss'?'boss':''}">${step==='boss'?'BOSS':index+1}</span>`).join('');
  routeGrid.innerHTML=currentRouteChoices.map((node,index)=>`<button class="route-card ${node.id==='elite'?'elite':''}" style="--node:${node.color}" data-route-index="${index}"><span class="node-icon">${node.icon}</span><strong>${node.name}</strong><em>${node.tag}</em><span>${node.description}</span></button>`).join('');
  for(const button of routeGrid.querySelectorAll('.route-card'))button.addEventListener('click',()=>selectRoute(Number(button.dataset.routeIndex)));
  refreshRouteSummary();updateHud();playTone(220,.35,'triangle',.04,280);saveRunCheckpoint({kind:'route',nextWave});
}

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
  activeRouteEvent=(unseen.length?unseen:pool)[Math.floor(Math.random()*(unseen.length?unseen.length:pool.length))];
  player.eventHistory.add(`${kind}:${activeRouteEvent.title}`);state='event';eventScreen.classList.add('active');
  ui.eventKicker.textContent=activeRouteEvent.kicker;ui.eventTitle.textContent=activeRouteEvent.title;ui.eventCopy.textContent=activeRouteEvent.copy;ui.eventQuote.textContent=activeRouteEvent.quote;
  eventChoiceGrid.innerHTML=activeRouteEvent.choices.map((choice,index)=>`<button class="event-choice" style="--event:${choice.color}" data-event-index="${index}" ${choice.available&&!choice.available()?'disabled':''}><strong>${choice.name}</strong><em>${choice.tag}</em><p>${choice.description}</p><b>${choice.result}</b></button>`).join('');
  for(const button of eventChoiceGrid.querySelectorAll('.event-choice'))button.addEventListener('click',()=>chooseRouteEvent(Number(button.dataset.eventIndex)));
  playTone(kind==='secret'?310:210,.5,'triangle',.04,kind==='secret'?420:220);
}

function chooseRouteEvent(index){
  if(state!=='event'||!activeRouteEvent)return;const choice=activeRouteEvent.choices[index];if(!choice||(choice.available&&!choice.available()))return;
  choice.apply();
}

function finishRouteEvent(options={}){
  eventScreen.classList.remove('active');activeRouteEvent=null;spawnWord(player.x,player.y-95,'FATE CHOSEN!','#d94cff');updateHud();startWave(pendingRouteWave,options);
}

function openGuardianReward(guardianId){
  const reward=GUARDIAN_REWARDS[guardianId];if(!reward)return;
  const guardianCourt=chapter.bossRoom&&ROOMS[chapter.bossRoom];if(guardianCourt&&room.id!==guardianCourt.id)activateRoom(guardianCourt,{reposition:true});
  clearDelay=-1;pendingGuardianReward=guardianId;currentGuardianRewards=reward.choices;state='guardianReward';guardianRewardScreen.classList.add('active');
  ui.guardianRewardKicker.textContent=reward.kicker;ui.guardianRewardTitle.textContent=reward.title;ui.guardianRewardCopy.textContent=reward.copy;
  guardianRewardGrid.innerHTML=reward.choices.map((choice,index)=>`<button class="guardian-reward-card ${reward.final?'final-vow':''}" style="--guardian:${choice.color}" data-guardian-reward="${index}"><span class="guardian-choice">${index+1} / CLAIM</span><span class="guardian-icon">${choice.icon}</span><strong>${choice.name}</strong><em>${choice.type}</em><p>${choice.description}</p><b>${choice.detail}</b></button>`).join('');
  for(const button of guardianRewardGrid.querySelectorAll('.guardian-reward-card'))button.addEventListener('click',()=>chooseGuardianReward(Number(button.dataset.guardianReward)));
  saveRunCheckpoint({kind:'guardianReward',guardianId});playTone(reward.final?185:260,.65,'triangle',.06,reward.final?380:520);
}

function chooseGuardianReward(index){
  if(state!=='guardianReward')return;const guardianId=pendingGuardianReward;const definition=GUARDIAN_REWARDS[guardianId];const choice=currentGuardianRewards[index];if(!definition||!choice)return;
  if(choice.apply)choice.apply();player.guardianBlessings=Array.isArray(player.guardianBlessings)?player.guardianBlessings:[];player.guardianBlessings.push(choice.id);guardianRewardScreen.classList.remove('active');pendingGuardianReward=null;currentGuardianRewards=[];
  if(definition.final){player.endingVow=choice.ending;player.victoryShardBonus=choice.shardBonus||0;showStory('epilogue');return;}
  resolveSynergies();player.health=Math.min(player.maxHealth,player.health+Math.max(30,Math.round(player.maxHealth*.28)));spawnWord(player.x,player.y-110,choice.name.toUpperCase(),choice.color);effects.rings.push({x:player.x,y:player.y,radius:25,maxRadius:230,color:choice.color,life:1,maxLife:1});burst(player.x,player.y-15,choice.color,46,470,7);playTone(310,.48,'triangle',.055,460);completeChapter();
}

function grantRelic(){
  const available=RELICS.filter((relic)=>!player.relics.includes(relic.id));
  if(!available.length){player.gold+=100;return;}
  const relic=available[Math.floor(Math.random()*available.length)];player.relics.push(relic.id);relic.apply();resolveSynergies();spawnWord(player.x,player.y-105,relic.name.toUpperCase(),relic.color);effects.rings.push({x:player.x,y:player.y,radius:20,maxRadius:170,color:relic.color,life:.8,maxLife:.8});
}

function spawnRoomInteractable(type){
  const definition=INTERACTABLE_DEFS[type];if(!definition)return;
  const side=encounter.wave%2?1:-1;roomInteractable={type,...definition,x:room.combatBounds.x+side*room.combatBounds.radiusX*.48,y:room.combatBounds.y+room.combatBounds.radiusY*.2,used:false,radius:74};
}

function spawnRoomDestructibles(waveIndex,brokenIds=[]){
  if(room.id==='spiritVillage'||room.id==='spiritDojo'){destructibles=[];return;}
  const count=4+Math.min(4,Math.floor(waveIndex/2));const b=room.combatBounds;destructibles=Array.from({length:count},(_,index)=>{const angle=(index/count)*Math.PI*2+waveIndex*.67;const kind=index%3===0?'crate':'pot',id=`${chapterIndex}:${waveIndex}:${index}`;return {id,kind,x:b.x+Math.cos(angle)*b.radiusX*(.42+(index%2)*.18),y:b.y+Math.sin(angle)*b.radiusY*(.42+(index%2)*.14),radius:kind==='crate'?44:34,health:kind==='crate'?24:14,maxHealth:kind==='crate'?24:14,broken:brokenIds.includes(id),col:kind==='crate'?3:2,row:0,scale:kind==='crate'?.34:.27};});
}

function missionPalette(type){
  if(type==='anchors')return chapter.id==='crimsonChapter'?'#ff542f':chapter.id==='bambooChapter'?'#b8ff45':'#c94cff';
  if(type==='rescue')return chapter.id==='crimsonChapter'?'#ffbc42':chapter.id==='bambooChapter'?'#72f7c7':'#55eaff';
  return chapter.id==='crimsonChapter'?'#ff9a32':chapter.id==='bambooChapter'?'#a6ff4c':'#65f3dc';
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
  if(!roomMission.rewarded&&roomMission.type!=='eliminate'){roomMission.rewarded=true;const reward=10+encounter.wave*3;player.gold+=reward;gainXp(6+encounter.wave*2);spawnWord(player.x,player.y-118,chapter.id==='crimsonChapter'?'OATH KEPT!':chapter.id==='bambooChapter'?'HOLLOW FREED!':'SEAL RESTORED!',roomMission.color);spawnWord(player.x,player.y-82,`+${reward} GOLD`, '#ffd34f');effects.rings.push({x:player.x,y:player.y,radius:22,maxRadius:190,color:roomMission.color,life:.85,maxLife:.85});playTone(280,.42,'triangle',.05,390);}
  saveMissionCheckpoint();updateHud();
}

function failRoomMission(){
  if(!roomMission||roomMission.failed)return;roomMission.failed=true;defeatReason=`${roomMission.title} FAILED. THE CURSE CLAIMED THE ROOM.`;ui.objective.textContent='MISSION FAILED';spawnWord(player.x,player.y-135,'MISSION FAILED!','#ff375f');camera.shake=22;playTone(60,.8,'sawtooth',.09,-25);setTimeout(()=>endGame(false),750);
}

function missionComplete(){return !roomMission||roomMission.type==='eliminate'||roomMission.complete;}

function nearestMissionCaptive(){
  if(roomMission?.type!=='rescue'||roomMission.complete)return null;let best=null;
  for(const actor of roomMission.actors){if(actor.released)continue;const d=distance(player,actor);if(d<=175&&(!best||d<best.distance))best={actor,distance:d};}
  return best;
}

function useMissionInteraction(){
  const nearby=nearestMissionCaptive();if(!nearby)return false;const actor=nearby.actor;actor.released=true;burst(actor.x,actor.y-22,roomMission.color,32,350,6);effects.rings.push({x:actor.x,y:actor.y,radius:16,maxRadius:155,color:roomMission.color,life:.72,maxLife:.72});spawnWord(actor.x,actor.y-82,'SPIRIT FREED!',roomMission.color);playTone(340,.32,'sine',.045,410);if(roomMission.actors.every((item)=>item.released))completeRoomMission();else saveMissionCheckpoint();return true;
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
  if(prop.broken)return;prop.broken=true;const gold=prop.kind==='crate'?12:7;player.gold+=gold;gainXp(prop.kind==='crate'?4:2);spawnWord(prop.x,prop.y-48,`+${gold} GOLD`,'#ffd13a');burst(prop.x,prop.y,'#15101e',22,340,7);for(let i=0;i<5;i++){const angle=Math.random()*Math.PI*2;effects.shards.push({x:prop.x,y:prop.y-8,vx:Math.cos(angle)*150,vy:Math.sin(angle)*150,color:i%2?'#ffd13a':'#45eaff',life:2.4,maxLife:2.4,delay:.15+i*.035,size:4});}encounter.modifiers={...(encounter.modifiers||{}),brokenProps:destructibles.filter((item)=>item.broken).map((item)=>item.id)};saveRunCheckpoint({kind:'wave',wave:encounter.wave,modifiers:encounter.modifiers});playTone(prop.kind==='crate'?95:180,.16,'square',.045,-45);updateHud();
}

function nearestRoomInteractable(){if(!roomInteractable||roomInteractable.used)return null;const d=distance(player,roomInteractable);return d<=190?{item:roomInteractable,distance:d}:null;}

function useRoomInteractable(){
  const nearby=nearestRoomInteractable();if(!nearby)return false;const item=nearby.item;item.used=true;
  if(item.type==='heal'){player.health=Math.min(player.maxHealth,player.health+50);spawnWord(item.x,item.y-90,'RESTORED!','#65ef55');}
  else if(item.type==='treasure')grantRelic();
  else if(item.type==='shrine'){pendingLevelUps++;openLevelUp();}
  effects.rings.push({x:item.x,y:item.y,radius:22,maxRadius:190,color:item.color,life:.8,maxLife:.8});burst(item.x,item.y-18,item.color,32,370,6);encounter.modifiers={...(encounter.modifiers||{}),interactableUsed:true};saveRunCheckpoint({kind:'wave',wave:encounter.wave,modifiers:encounter.modifiers});playTone(245,.38,'triangle',.045,360);updateHud();return true;
}

function openShop(){
  state='shop';shopScreen.classList.add('active');renderShop();
}

function renderShop(){
  ui.shopGold.textContent=` ${player.gold}`;
  const items=SHOP_ITEMS.filter((item)=>item.available()).slice(0,4);
  shopGrid.innerHTML=items.map((item,index)=>`<button class="shop-item" style="--item:${item.color}" data-shop-index="${index}" ${player.gold<item.price?'disabled':''}><span class="item-icon">${item.icon}</span><strong>${item.name}</strong><p>${item.description}</p><b> ${item.price}</b></button>`).join('');
  for(const button of shopGrid.querySelectorAll('.shop-item'))button.addEventListener('click',()=>buyShopItem(items[Number(button.dataset.shopIndex)]));
}

function buyShopItem(item){
  if(state!=='shop'||!item||player.gold<item.price||!item.available())return;player.gold-=item.price;item.apply();resolveSynergies();player.shopPurchases.add(item.id);playTone(420,.16,'triangle',.04,190);burst(player.x,player.y-30,item.color,18,230,4);renderShop();updateHud();
}

function leaveShop(){shopScreen.classList.remove('active');startWave(pendingRouteWave);}

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
  const available = UPGRADES.filter((upgrade) => upgrade.available());
  if (!available.length) {if(encounter.startWaveAfterUpgrade!==null){const nextWave=encounter.startWaveAfterUpgrade;encounter.startWaveAfterUpgrade=null;startWave(nextWave);}return;}
  pendingLevelUps = Math.max(0, pendingLevelUps - 1);
  state = 'levelup';
  rollUpgradeChoices(available);
  renderUpgradeChoices();
  levelupScreen.classList.add('active');
  playTone(260, .42, 'triangle', .05, 420);
  updateHud();
}

function rarityForUpgrade(upgrade){return UPGRADE_RARITIES[upgrade.id]||'common';}

function weightedUpgradeIndex(pool){
  const weights=pool.map((upgrade)=>{const rarity=rarityForUpgrade(upgrade);const base=RARITY_STYLES[rarity].weight;if(rarity==='rare')return base+player.level*1.8;if(rarity==='epic')return base+Math.max(0,player.level-2)*1.6;return Math.max(24,base-player.level*1.4);});
  let roll=Math.random()*weights.reduce((sum,value)=>sum+value,0);for(let i=0;i<weights.length;i++){roll-=weights[i];if(roll<=0)return i;}return weights.length-1;
}

function rollUpgradeChoices(available=UPGRADES.filter((upgrade)=>upgrade.available())){
  const pool=[...available];currentUpgradeChoices=[];
  const earnedUnlock=pool.find((upgrade)=>upgrade.id==='unlockShock')||pool.find((upgrade)=>upgrade.id==='unlockHeart')||pool.find((upgrade)=>upgrade.id==='unlockFoxfire')||pool.find((upgrade)=>upgrade.id==='unlockUndertow');
  if(earnedUnlock){currentUpgradeChoices.push(earnedUnlock);pool.splice(pool.indexOf(earnedUnlock),1);}
  while(currentUpgradeChoices.length<Math.min(3,available.length)){const index=weightedUpgradeIndex(pool);currentUpgradeChoices.push(pool.splice(index,1)[0]);}
}

function renderUpgradeChoices(){
  upgradeGrid.innerHTML = currentUpgradeChoices.map((upgrade, index) => `
    <button class="upgrade-card" title="${upgrade.description}" aria-label="${upgrade.name}. ${upgrade.detail}" data-rarity="${rarityForUpgrade(upgrade)}" style="--card-color:${upgrade.color};--rarity:${RARITY_STYLES[rarityForUpgrade(upgrade)].color}" data-upgrade-index="${index}">
      <span class="choice-number">${index + 1} / CHOOSE</span>
      <span class="upgrade-icon" data-icon="${upgradeIconFrame(upgrade)}"></span>
      <strong>${upgrade.name}</strong>
      <span class="upgrade-rarity">${RARITY_STYLES[rarityForUpgrade(upgrade)].name}</span>
      <span class="upgrade-type">${upgrade.type}</span>
      <span class="upgrade-description">${upgrade.description}</span>
      <span class="upgrade-detail">${upgrade.detail}</span>
    </button>`).join('');
  for (const button of upgradeGrid.querySelectorAll('.upgrade-card')) {
    button.addEventListener('click', () => chooseUpgrade(Number(button.dataset.upgradeIndex)));
  }
  const cost=30+player.paidRerolls*15;ui.rerollCost.textContent=player.rerolls>0?`FREE  ${player.rerolls} LEFT`:` ${cost} GOLD`;
  ui.rerollButton.disabled=player.rerolls<=0&&player.gold<cost;
}

function upgradeIconFrame(upgrade){
  if(upgrade.id==='unlockUndertow'||upgrade.type.includes('UNDERTOW'))return 0;if(upgrade.id==='unlockFoxfire'||upgrade.type.includes('FOXFIRE'))return 1;if(upgrade.id==='unlockHeart'||upgrade.type.includes('HEART'))return 2;if(upgrade.id==='unlockShock'||upgrade.type.includes('ULTIMATE'))return 3;
  if(['dualWield','pressureChamber','bankShot','quickdraw'].includes(upgrade.id))return 4;if(['spiritRounds','quickPaws','spiritCylinder','phaseRounds'].includes(upgrade.id))return 5;if(['wardbreaker','ironBelly','guardianHide'].includes(upgrade.id))return 6;if(['keenEye','perfectDraw','loadedDice','headhunter'].includes(upgrade.id))return 7;return 8;
}

function rerollUpgrades(){
  if(state!=='levelup')return;const cost=30+player.paidRerolls*15;
  if(player.rerolls>0)player.rerolls--;else if(player.gold>=cost){player.gold-=cost;player.paidRerolls++;}else return;
  rollUpgradeChoices();renderUpgradeChoices();spawnWord(player.x,player.y-90,'FATE REROLLED!','#45eaff');playTone(205,.28,'triangle',.04,360);updateHud();
}

function finishLevelUpFlow(){
  levelupScreen.classList.remove('active');state='playing';updateHud();
  if(encounter.startWaveAfterUpgrade!==null){const nextWave=encounter.startWaveAfterUpgrade;encounter.startWaveAfterUpgrade=null;startWave(nextWave);return;}
  if(pendingLevelUps>0)setTimeout(openLevelUp,180);
}

function skipUpgrade(){
  if(state!=='levelup')return;player.gold+=20;player.health=Math.min(player.maxHealth,player.health+18);spawnWord(player.x,player.y-92,'POWER BANKED!','#ffd13a');effects.rings.push({x:player.x,y:player.y,radius:15,maxRadius:105,color:'#ffd13a',life:.5,maxLife:.5});playTone(280,.24,'sine',.035,180);finishLevelUpFlow();
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
  playTone(330, .32, 'triangle', .05, 360);
  finishLevelUpFlow();
}

function resolveSynergies(){
  for(const synergy of SYNERGIES){
    if(player.synergies.has(synergy.id)||!synergy.requires())continue;
    player.synergies.add(synergy.id);spawnWord(player.x,player.y-125,`${synergy.name}!`,synergy.color);effects.rings.push({x:player.x,y:player.y,radius:22,maxRadius:205,color:synergy.color,life:.9,maxLife:.9});burst(player.x,player.y-15,synergy.color,38,390,6);playTone(190,.5,'triangle',.055,520);
  }
  refreshSynergyHud();
}

function refreshSynergyHud(){
  const active=SYNERGIES.filter((synergy)=>player.synergies.has(synergy.id));const capstones={phaseNova:{name:'PHASE NOVA',color:'#d94cff'},siegeLotus:{name:'SIEGE LOTUS',color:'#ffd13a'},moonConstellation:{name:'MOON CONSTELLATION',color:'#ff5fbd'},deadeyeCircuit:{name:'DEADEYE CIRCUIT',color:'#ff9b32'}};const capstone=capstones[player.weaponEvolution];const key=`${active.map((synergy)=>synergy.id).join('|')}|${player.weaponEvolution||''}`;if(ui.synergyStrip.dataset.key===key)return;ui.synergyStrip.dataset.key=key;
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
  if(debugSystem==='levelup'){player.level=2;pendingLevelUps=1;encounter.startWaveAfterUpgrade=0;openLevelUp();return;}
  if(debugSystem==='dojo'){enterDojo();return;}
  if(debugSystem==='crossfire'){
    player.maxHealth=600;player.health=600;spawnBoss();const boss=enemies[0];const profile=BOSS_PROFILES[boss.def.id];boss.bossPhase=3;boss.health=boss.maxHealth*.3;boss.state='bossWindupCrossfire';boss.stateTime=BOSS_PATTERNS.crossfire.windup;boss.activePattern='crossfire';boss.patternTargetX=player.x;boss.patternTargetY=player.y;boss.patternAngle=Math.atan2(player.y-boss.y,player.x-boss.x)+.51;ui.bossPhase.textContent=profile.phaseNames[3];return;
  }
  if(debugSystem==='signature'){
    player.maxHealth=1200;player.health=1200;spawnBoss();const boss=enemies[0];const bossProfile=BOSS_PROFILES[boss.def.id];boss.bossPhase=3;boss.health=boss.maxHealth*.3;boss.state='bossWindupSignature';boss.stateTime=BOSS_PATTERNS.signature.windup;boss.activePattern='signature';boss.signaturePrepared=false;ui.bossPhase.textContent=bossProfile.phaseNames[3];return;
  }
  if(debugSystem==='elites'){player.maxHealth=320;player.health=320;player.damageMultiplier=1.8;player.unlockedAbilities.add('foxfireVolley');startWave(1,{nodeType:'elite',healthScale:1.08,speedScale:1.04,damageScale:1.04,rewardScale:2});return;}
  if(debugSystem==='specialists'){startSpecialistShowcase();return;}
  if(debugSystem==='capstone'){player.level=10;player.maxHealth=1200;player.health=1200;player.damageMultiplier=2.4;player.weaponEvolution=selectedHeroId==='kitsune'?'phaseNova':selectedHeroId==='bamboo'?'siegeLotus':selectedHeroId==='hopscotch'?'moonConstellation':'deadeyeCircuit';player.bonusPierces=selectedHeroId==='hopscotch'?2:player.bonusPierces;player.bonusRicochets=selectedHeroId==='rusty'?2:player.bonusRicochets;refreshSynergyHud();startWave(4);return;}
  if(debugSystem==='room6'){player.level=10;player.maxHealth=1400;player.health=1400;startWave(5);return;}
  if(debugSystem==='mission'){const type=['anchors','rescue','defend'].includes(debugMission)?debugMission:'anchors';const missionWave=chapter.waves.findIndex((wave)=>wave.mission?.type===type);player.maxHealth=900;player.health=900;player.damageMultiplier=type==='anchors'?4:1.6;startWave(Math.max(0,missionWave));if(roomMission?.actors?.[0]){roomMission.actors[0].x=player.x+125;roomMission.actors[0].y=player.y;}if(roomMission?.ward){roomMission.ward.x=player.x+90;roomMission.ward.y=player.y+40;}return;}
  if(debugSystem==='guardianReward'){openGuardianReward(chapter.boss);return;}
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
  ui.bossPanel.classList.remove('active');ui.roomState.textContent=chapter.id==='crimsonChapter'?'ASH GATE':'MOON GATE';ui.roomState.style.color=chapter.id==='crimsonChapter'?'#ff5b27':'#41f5da';
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
    if(selectedDifficulty==='ascension'){profile.ascensionClears++;profile.ascensionRank=Math.min(10,(profile.ascensionRank||1)+1);if(!profile.unlockedHeroes.includes('rusty')){profile.unlockedHeroes.push('rusty');unlockedNames.push('RUSTY');}}
  }
  saveProfile();refreshProfileUi();
  state = won ? 'won' : 'lost';
  ui.resultTitle.textContent = won ? 'RUN COMPLETE!' : `${heroDef.name.toUpperCase()} FALLS`;
  ui.resultKicker.textContent = won ? 'THE ONI GATE OPENS' : 'THE SPIRITS STILL WATCH';
  const endingResults={mercy:'You returned the stolen flame and restored all three guardians.',power:'You claimed the oni flame and became the spirit road’s new gatekeeper.',freedom:'You shattered every ancient chain and left the spirit roads free.'};
  ui.resultCopy.textContent = won ? `${endingResults[player.endingVow]||'Pyreclaw breaks the final chain and the three guardians bow.'} ${unlockedNames.length?`${unlockedNames.join(' AND ')} ${unlockedNames.length>1?'HAVE':'HAS'} JOINED THE ROSTER. `:''}${selectedDifficulty==='ascension'?`ASCENSION RANK ${profile.ascensionRank} NOW AWAITS. `:''}Permanent spirit rewards are banked, and a harder run awaits.` : defeatReason||'The curse grows stronger. Rebuild your powers and strike again.';
  ui.resultTime.textContent = formatTime(runTime);
  ui.resultCombo.textContent = String(player.maxCombo);
  ui.resultDashes.textContent = String(player.dashes);
  ui.resultReward.textContent=`+${runReward} SPIRIT SHARDS  ${profile.spiritShards} TOTAL${selectedDifficulty==='ascension'?`  ASCENSION ${profile.ascensionRank}`:''}`;
  resultScreen.classList.add('active');
  playTone(won ? 220 : 85, won ? .6 : .8, won ? 'triangle' : 'sawtooth', .11);
}

function resize() {
  const width = shell.clientWidth;
  const height = shell.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

function ensureAudio() {
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();
  if(audioSamples.music.paused)audioSamples.music.play().catch(()=>{});
}

function playSfx(id,volume=.35,rate=1){const source=audioSamples[id];if(!source)return;const sound=source.cloneNode();sound.volume=clamp(volume,0,1);sound.playbackRate=rate*(.96+Math.random()*.08);sound.play().catch(()=>{});}

function playTone(frequency, duration = .08, type = 'sawtooth', volume = .035, glide = 0) {
  if (!audioContext) return;
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, now);
  if (glide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, frequency + glide), now + duration);
  gain.gain.setValueAtTime(Math.min(volume*.2,.012), now);
  gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now); oscillator.stop(now + duration);
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

function startDash() {
  if (player.dashCooldown > 0 || player.dashTime > 0 || player.hurtTime > 0 || player.stunTime > 0) return;
  const move = movementVector();
  if(!Number.isFinite(player.sprint))player.sprint=100;
  const direction = Math.hypot(move.x, move.y) > 0 ? move : { x: Math.cos(player.facing), y: Math.sin(player.facing) };
  player.dashDirection = direction;
  player.facing = Math.atan2(direction.y, direction.x);
  player.dashTime = heroDef.dashDuration;
  player.dashCooldown = heroDef.dashCooldown*player.dashCooldownMultiplier;
  player.invulnerable = Math.max(player.invulnerable, heroDef.dashInvulnerability);
  player.attack = null; player.dashes++;
  camera.kick = 18; camera.shake = Math.max(camera.shake, 3);
  burst(player.x, player.y, '#b534ff', 16, 260, 4);
  effects.rings.push({ x: player.x, y: player.y, radius: 22, maxRadius: 85, color: '#b434ff', life: .24, maxLife: .24 });
  playTone(190, .16, 'sawtooth', .045, 470);
}

function requestAttack() {
  if (!['playing','dojo'].includes(state) || player.dashTime > 0 || player.hurtTime > .08 || player.stunTime > 0 || player.castTime > 0 || player.shotCooldown > 0) return;
  startAttack();
}

function startAttack() {
  if (input.pointer.active) {
    const target = pointerWorld();
    const delta = distance(player, target);
    if (delta > 35) player.facing = Math.atan2(target.y - player.y, target.x - player.x);
  }
  const direction = { x: Math.cos(player.facing), y: Math.sin(player.facing) };
  player.attack = { index: 0, definition: { duration: weapon.attackDuration||.14 }, time: 0, released:false, facing:player.facing };
  player.shotCooldown = weapon.fireRate * player.fireRateMultiplier;
  if(coop.connected)sendCoop('action',{payload:{kind:'attack',facing:player.facing}});
  if(!weapon.releaseDelay)releaseWeaponVolley();
}

function releaseWeaponVolley() {
  if(!player.attack||player.attack.released)return;player.attack.released=true;
  const attackFacing=player.attack.facing??player.facing;player.facing=attackFacing;
  const direction = { x: Math.cos(attackFacing), y: Math.sin(attackFacing) };
  const muzzleDistance=weapon.muzzleDistance||48;
  const muzzle = { x: player.x + direction.x * muzzleDistance, y: player.y + direction.y * muzzleDistance - 7 };
  player.shotsFired++;const burningVolley=player.synergies.has('twinCinders')&&player.shotsFired%8===0;
  const evolution=player.weaponEvolution;const phaseNova=evolution==='phaseNova'&&player.shotsFired%5===0;const siegeLotus=evolution==='siegeLotus'&&player.shotsFired%3===0;const moonConstellation=evolution==='moonConstellation'&&player.shotsFired%4===0;const deadeyeCircuit=evolution==='deadeyeCircuit'&&player.shotsFired%6===0;
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
      const arrow=weapon.projectileType==='arrow',trickshot=weapon.projectileType==='trickshot';
      effects.playerShots.push({x:shotMuzzle.x,y:shotMuzzle.y,vx:shotDirection.x*weapon.projectileSpeed,vy:shotDirection.y*weapon.projectileSpeed,radius:(weapon.projectileRadius||9)*(siegeShell?1.75:1),damage:weapon.damage*player.damageMultiplier*echoPenalty*(siegeShell?1.7:1),color:phaseNova?'#d94cff':siegeShell?'#ffd13a':moonConstellation?'#ff5fbd':deadeyeCircuit?'#ff9b32':burningVolley?'#ff8a2a':weapon.color,ignite:burningVolley,arrow,trickshot,phaseNova,siegeLotus:siegeShell,moonConstellation,deadeyeCircuit,guaranteedCrit:deadeyeCircuit,ricochets:(weapon.ricochets||0)+player.bonusRicochets+(deadeyeCircuit?2:0),ricochetRange:(weapon.ricochetRange||0)+(deadeyeCircuit?220:0),ricochetRetention:deadeyeCircuit?1:player.ricochetDamageRetention,pierces:(weapon.pierces||0)+player.bonusPierces+(phaseNova?4:0),hitIds:new Set(),life:weapon.projectileLife,maxLife:weapon.projectileLife});
      effects.spriteEffects.push({asset:arrow?'hopscotchArrow':trickshot?'trickshotVfx':'blasterImpactVfx',fixedFrame:arrow||trickshot?0:undefined,x:shotMuzzle.x,y:shotMuzzle.y,width:arrow?92:trickshot?76:selectedHeroId==='bamboo'?82:68,height:arrow?52:trickshot?76:selectedHeroId==='bamboo'?70:58,life:.16,maxLife:.16,rotation:angle,glow:weapon.impactColor});
    }
  }
  if(phaseNova||siegeLotus||moonConstellation||deadeyeCircuit){const label=phaseNova?'PHASE NOVA!':siegeLotus?'SIEGE LOTUS!':moonConstellation?'MOON CONSTELLATION!':'DEADEYE CIRCUIT!';const color=phaseNova?'#d94cff':siegeLotus?'#ffd13a':moonConstellation?'#ff5fbd':'#ff9b32';spawnWord(player.x,player.y-86,label,color);effects.rings.push({x:player.x,y:player.y,radius:18,maxRadius:115,color,life:.42,maxLife:.42});}
  burst(muzzle.x,muzzle.y,weapon.impactColor,selectedHeroId==='bamboo'?22:selectedHeroId==='rusty'?20:14,selectedHeroId==='bamboo'?330:selectedHeroId==='rusty'?300:260,selectedHeroId==='bamboo'?5:3);
  player.vx-=direction.x*(weapon.recoil||42);player.vy-=direction.y*(weapon.recoil||42);
  camera.kick=Math.max(camera.kick,selectedHeroId==='bamboo'?15:selectedHeroId==='hopscotch'?7:selectedHeroId==='rusty'?11:9);camera.shake=Math.max(camera.shake,selectedHeroId==='bamboo'?4.5:selectedHeroId==='hopscotch'?2:selectedHeroId==='rusty'?3:2.5);
  playSfx(selectedHeroId==='hopscotch'?'arrow':selectedHeroId==='bamboo'?'slice':'blaster',selectedHeroId==='bamboo'?.42:.3,selectedHeroId==='rusty'?1.12:1);
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
  const direction=aimDirection(); player.facing=Math.atan2(direction.y,direction.x); player.abilityCooldowns[id]=definition.cooldown;
  if (id === 'undertowWell') {
    player.castTime=.34;
    const power=player.abilityPower.undertowWell;
    effects.vortices.push({x:player.x+direction.x*300,y:player.y+direction.y*300,life:definition.duration,maxLife:definition.duration,radius:definition.radius*Math.sqrt(power),pull:definition.pull*power,hit:new Set(),collapsed:false,definition,rotation:0});
    effects.rings.push({x:player.x,y:player.y,radius:18,maxRadius:80,color:definition.color,life:.3,maxLife:.3});
    burst(player.x,player.y,definition.color,25,260,4); playSfx('water',.38,.9);
  } else if (id === 'foxfireVolley') {
    player.castTime=.28;
    for(let i=0;i<definition.shots;i++){
      const angle=player.facing+(i-(definition.shots-1)/2)*definition.spread;
      effects.flameBolts.push({x:player.x+Math.cos(angle)*46,y:player.y+Math.sin(angle)*46-7,vx:Math.cos(angle)*definition.speed,vy:Math.sin(angle)*definition.speed,radius:12,life:definition.life,maxLife:definition.life,definition,power:player.abilityPower.foxfireVolley});
    }
    burst(player.x,player.y,definition.color,28,320,5); camera.kick=18; camera.shake=5; playSfx('fire',.42,1.04);
  } else if (id === 'wildHeart') {
    player.wildHeartTime=definition.duration; player.castTime=.34; player.health=Math.min(player.maxHealth,player.health+definition.heal+player.heartBonus);
    effects.rings.push({x:player.x,y:player.y,radius:18,maxRadius:150,color:definition.color,life:.7,maxLife:.7});
    effects.blooms.push({x:player.x,y:player.y-24,life:.9,maxLife:.9,color:definition.color});
    burst(player.x,player.y,definition.color,36,300,5); playTone(330,.45,'sine',.035,260);
  } else if (id === 'shockPaws') {
    player.castTime=.5; player.ultimateFlash=.12; player.invulnerable=Math.max(player.invulnerable,.45);
    effects.shockStorms.push({x:player.x,y:player.y,life:definition.duration+player.stormBonus,maxLife:definition.duration+player.stormBonus,tick:0,pulse:0,definition,power:player.abilityPower.shockPaws});
    effects.spriteEffects.push({asset:'shockImpactVfx',x:player.x,y:player.y-26,width:190,height:170,life:.6,maxLife:.6,glow:definition.color});
    effects.rings.push({x:player.x,y:player.y,radius:20,maxRadius:230,color:definition.color,life:.7,maxLife:.7});
    camera.kick=24; camera.shake=8; hitStop=.05; playSfx('lightning',.5,.92);
  }
}

function updatePlayer(dt) {
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  player.flash = Math.max(0, player.flash - dt);
  player.hurtTime = Math.max(0, player.hurtTime - dt);
  player.stunTime = Math.max(0, player.stunTime - dt);
  const recoveryRate=state==='dojo'?4:1;
  player.dashCooldown = Math.max(0, player.dashCooldown - dt*recoveryRate);
  player.shotCooldown = Math.max(0, player.shotCooldown - dt);
  player.ultimateFlash = Math.max(0, player.ultimateFlash - dt);
  player.castTime=Math.max(0,player.castTime-dt); player.wildHeartTime=Math.max(0,player.wildHeartTime-dt);
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
  const wantsSprint=input.keys.has(' ')&&Boolean(move.x||move.y)&&!player.attack&&player.castTime<=0&&player.dashTime<=0;
  player.sprinting=wantsSprint&&player.sprint>2;
  player.sprint=clamp(player.sprint+(player.sprinting?-34:23)*dt,0,100);
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
    const attackingSlow = player.attack ? .9 : 1;const sprintBoost=player.sprinting?1.42:1;
    const targetVx = move.x * heroDef.speed * player.speedMultiplier * attackingSlow*sprintBoost;
    const targetVy = move.y * heroDef.speed * player.speedMultiplier * attackingSlow*sprintBoost;
    const accel = clamp(heroDef.acceleration * dt / Math.max(heroDef.speed, 1), 0, 1);
    player.vx = lerp(player.vx, targetVx, accel);
    player.vy = lerp(player.vy, targetVy, accel);
    if (!move.x && !move.y) {
      const drag = Math.exp(-heroDef.drag * dt);
      player.vx *= drag; player.vy *= drag;
    } else if (!player.attack) {
      player.facing = approachAngle(player.facing, Math.atan2(move.y, move.x), clamp(dt * 15, 0, 1));
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
  enemy.vx+=direction.x*knockback*(isBoss ? .05 : 1);enemy.vy+=direction.y*knockback*(isBoss ? .05 : 1);enemy.flash=.15;
  if(!isBoss){enemy.state='stagger';enemy.stateTime=.2;}
  player.hitCount++;player.maxCombo=Math.max(player.maxCombo,player.hitCount);player.comboDrop=2.5;comboUiTimer=.75;hitStop=Math.max(hitStop,.045);camera.shake=Math.max(camera.shake,7);
  burst(enemy.x,enemy.y,color,14,310,4);
  playSfx('impact',enemy.def.behavior==='boss'?.32:.2,enemy.def.behavior==='boss'?.78:1.05);
  effects.numbers.push({x:enemy.x,y:enemy.y-38,vx:0,vy:-100,text:resolved.shieldDamage&&!resolved.healthDamage?String(Math.round(resolved.total)):String(damage),color:resolved.shieldDamage?'#9aff8b':color,life:.8,maxLife:.8,size:30});
  if(word)spawnWord(enemy.x,enemy.y-58,word,color); if(enemy.health<=0)killEnemy(enemy,direction);
}

function updateAttack(dt) {
  if (!player.attack) return;
  player.attack.time += dt;
  if(!player.attack.released&&weapon.releaseDelay&&player.attack.time>=weapon.releaseDelay)releaseWeaponVolley();
  if (player.attack.time >= player.attack.definition.duration) player.attack = null;
}

function hitEnemyWithShot(enemy, shot) {
  const critical=shot.guaranteedCrit||Math.random()<Math.min(.75,weapon.criticalChance+player.critBonus);
  const damage=Math.max(1,Math.round((shot.damage??weapon.damage)*(critical?1.65*player.critDamageMultiplier:1)*(enemy.practiceArmor??1)*(enemy.eliteId?player.eliteDamageMultiplier:1)*(enemy.def.behavior==='boss'?player.guardianDamageMultiplier:1)));recordDojoDamage(enemy,damage);
  const direction = normalize(shot.vx, shot.vy);
  const isBoss=enemy.def.behavior==='boss';
  const resolved=resolveEnemyDamage(enemy,damage,direction);
  enemy.vx += direction.x * weapon.knockback*player.knockbackMultiplier*(isBoss ? .05 : 1); enemy.vy += direction.y * weapon.knockback*player.knockbackMultiplier*(isBoss ? .05 : 1);
  enemy.flash = .15; enemy.stagger = critical ? .22 : .12;
  if(!isBoss){enemy.state = 'stagger'; enemy.stateTime = enemy.stagger;}
  player.hitCount++; player.maxCombo = Math.max(player.maxCombo, player.hitCount); player.comboDrop = 2.25;
  comboUiTimer = .65; hitStop = Math.max(hitStop, critical ? .05 : .026); camera.shake = Math.max(camera.shake, critical ? 6 : 3);
  const impactX = shot.x, impactY = shot.y - 8;
  const impactColor=critical?'#ffd52d':shot.color||weapon.impactColor;burst(impactX, impactY, impactColor, critical ? 16 : 9, critical ? 370 : 260, critical ? 5 : 3);
  effects.spriteEffects.push({asset:shot.arrow?'hopscotchArrow':shot.trickshot?'trickshotVfx':'blasterImpactVfx',fixedFrame:shot.arrow?(critical?4:3):shot.trickshot?(critical?5:4):undefined,x:impactX,y:impactY,width:shot.trickshot?(critical?170:138):critical?190:148,height:shot.trickshot?(critical?170:138):critical?155:122,life:.4,maxLife:.4,rotation:Math.atan2(shot.vy,shot.vx),glow:impactColor});
  effects.numbers.push({ x: enemy.x, y: enemy.y - 34, vx: (Math.random() - .5) * 45, vy: -95, text:resolved.shieldDamage&&!resolved.healthDamage?String(Math.round(resolved.total)):String(damage),color:resolved.shieldDamage?'#9aff8b':critical?'#ffd833':'#fff8ed',life:.75,maxLife:.75,size:critical?32:23 });
  if(shot.ignite){applyEnemyStatus(enemy,'burn',2.8,.72);effects.spriteEffects.push({asset:'burnStatusVfx',x:enemy.x,y:enemy.y-8,width:160,height:132,life:.36,maxLife:.36,glow:'#ff7428'});spawnWord(enemy.x,enemy.y-56,'CINDER ROUND!','#ff8a2a');}
  if(shot.phaseNova&&!shot.phaseDetonated){shot.phaseDetonated=true;triggerWeaponBlast(enemy,shot,'#d94cff',165,.62,'PHASE BURST!');}
  if(shot.siegeLotus)triggerWeaponBlast(enemy,shot,'#ffd13a',230,.82,'SIEGE BLOOM!');
  if(shot.moonConstellation&&!shot.splitSpawned){shot.splitSpawned=true;spawnMoonSplinters(enemy,shot);}
  if (critical || enemy.health <= 0) spawnWord(impactX, impactY - 42, enemy.health <= 0 ? 'CRASH!!' : 'ZAP!!', critical ? '#ffd938' : '#39eaff');
  playTone(critical ? 120 : 165, critical ? .12 : .07, 'square', critical ? .06 : .035, -55);
  if (enemy.health <= 0) killEnemy(enemy, direction);
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

function redirectTrickshot(shot,sourceEnemy){
  if(!shot.trickshot||shot.ricochets<=0)return false;
  let target=null,best=shot.ricochetRange||460;
  for(const candidate of enemies){if(candidate===sourceEnemy||candidate.dead||candidate.state==='waiting'||shot.hitIds?.has(candidate.id))continue;const gap=distance(sourceEnemy,candidate);if(gap<best){best=gap;target=candidate;}}
  if(!target)return false;
  const direction=normalize(target.x-shot.x,target.y-shot.y);const speed=Math.max(720,Math.hypot(shot.vx,shot.vy));shot.vx=direction.x*speed;shot.vy=direction.y*speed;shot.x+=direction.x*18;shot.y+=direction.y*18;shot.life=Math.max(shot.life,.58);shot.ricochets--;shot.damage*=shot.ricochetRetention||.78;
  effects.spriteEffects.push({asset:'trickshotVfx',fixedFrame:2,x:shot.x,y:shot.y,width:126,height:126,life:.34,maxLife:.34,rotation:Math.atan2(direction.y,direction.x),glow:'#ffbe3f'});effects.rings.push({x:shot.x,y:shot.y,radius:7,maxRadius:58,color:'#ffbe3f',life:.24,maxLife:.24});burst(shot.x,shot.y,'#4feaff',9,220,3);spawnWord(shot.x,shot.y-38,'BANK!','#ffbe3f');playTone(410,.08,'triangle',.025,260);return true;
}

function killEnemy(enemy, direction) {
  enemy.dead = true; enemy.deathTime = .72;
  if(enemy.practice){dojoState.kills++;dojoState.respawnTimer=.82;enemy.vx+=direction.x*220;enemy.vy+=direction.y*220;burst(enemy.x,enemy.y,'#72ef5b',34,390,7);spawnWord(enemy.x,enemy.y-90,'TARGET BROKEN!','#72ef5b');camera.shake=10;return;}
  if(enemy.def.behavior==='boss'){
    enemy.deathTime=2.8;encounter.bossDefeated=true;clearDelay=3.2;encounter.defeatedGuardianId=enemy.def.id;ui.bossPanel.classList.remove('active');
    const bamboo=enemy.def.id==='moonfangKomainu';const crimson=enemy.def.id==='pyreclawShogun';
    ui.roomState.textContent='GUARDIAN FREED';ui.roomState.style.color='#65ef80';ui.objective.textContent=crimson?'THE ONI GATE OPENS':bamboo?'THE HOLLOW BREATHES AGAIN':'THE JADE BELLS RING AGAIN';
    spawnWord(enemy.x,enemy.y-190,'CURSE BROKEN!',enemy.def.color);camera.shake=24;player.ultimateFlash=.2;
    for(let i=0;i<48;i++){const a=Math.random()*Math.PI*2,s=120+Math.random()*420;effects.shards.push({x:enemy.x,y:enemy.y-60,vx:Math.cos(a)*s,vy:Math.sin(a)*s,color:i%3?enemy.def.color:'#d94cff',life:5,maxLife:5,delay:.4+Math.random()*.8,size:6+Math.random()*8});}
    return;
  }
  recordCorruptionKill();
  if(enemy.eliteId==='volatile'){
    effects.enemyHazards.push({x:enemy.x,y:enemy.y+5,radius:enemy.eliteDef.blastRadius,damage:Math.round(enemy.eliteDef.blastDamage*enemy.damageScale),color:enemy.eliteDef.color,life:.78,maxLife:.78,triggerAt:.16,triggered:false,type:'volatile'});
    spawnWord(enemy.x,enemy.y-82,'CORE UNSTABLE!',enemy.eliteDef.color);
  }
  if(enemy.eliteId==='splitter'&&enemy.splitDepth<1){
    const splitType=enemy.def.biome==='crimson'?'emberAkita':enemy.def.biome==='bamboo'?'bambooStalker':'groveMinion';
    for(let i=0;i<enemy.eliteDef.splitCount;i++){const angle=(i?1:-1)*.8+enemy.facing;const child=makeEnemy({type:splitType,x:enemy.x+Math.cos(angle)*58,y:enemy.y+Math.sin(angle)*44,delay:.22+i*.12,healthScale:enemy.healthScale*.48,speedScale:enemy.speedScale*1.12,damageScale:enemy.damageScale*.7,splitDepth:enemy.splitDepth+1},enemies.length+i);enemies.push(child);}
    spawnWord(enemy.x,enemy.y-82,'SPIRIT SPLIT!',enemy.eliteDef.color);effects.rings.push({x:enemy.x,y:enemy.y,radius:18,maxRadius:145,color:enemy.eliteDef.color,life:.5,maxLife:.5});
  }
  const goldBase=enemy.def.behavior==='shield'?22:enemy.def.behavior==='summoner'?14:enemy.def.behavior==='assassin'?12:enemy.def.behavior==='bomber'?11:enemy.def.behavior==='heavy'?18:enemy.def.behavior==='ranged'?8:enemy.def.behavior==='melee'?7:4;
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
  if (player.invulnerable > 0 || !['playing','dojo'].includes(state)) return;
  if(player.braced)amount*=player.braceDamageMultiplier;
  amount=Math.max(1,Math.round(amount*player.damageTakenMultiplier));
  if (player.wildHeartTime > 0) amount = Math.max(1, Math.round(amount * (1 - ABILITIES.wildHeart.damageReduction)));
  player.health = Math.max(0, player.health - amount);
  player.invulnerable = .72; player.flash = .22; player.hurtTime = .28; player.attack = null;
  if (stunDuration > 0) {
    player.stunTime = Math.max(player.stunTime, stunDuration);
    effects.rings.push({ x: player.x, y: player.y, radius: 16, maxRadius: 92, color: '#ffd33d', life: .55, maxLife: .55 });
    spawnWord(player.x, player.y - 72, 'STUNNED!', '#ffd33d');
  }
  const direction = normalize(player.x - source.x, player.y - source.y);
  player.vx=direction.x*460*player.knockbackResistance;player.vy=direction.y*460*player.knockbackResistance;
  camera.shake = 12; hitStop = .06;
  burst(player.x, player.y, '#ff334e', 20, 340, 5);
  effects.numbers.push({ x: player.x, y: player.y - 45, vx: 0, vy: -75, text: `-${amount}`, color: '#ff405d', life: .8, maxLife: .8, size: 30 });
  spawnWord(player.x + 20, player.y - 50, 'BAM!', '#ff3b57');
  playTone(85, .18, 'sawtooth', .07, -45);
  updateHud();
  if (player.health <= 0 && state==='dojo') {
    player.health=player.maxHealth;player.invulnerable=1.5;player.stunTime=0;spawnWord(player.x,player.y-78,'PRACTICE RESET','#72ef5b');
  } else if (player.health <= 0) {
    player.hurtTime = 99;
    setTimeout(() => endGame(false), 600);
  }
}

function summonBossGuard(enemy, phase) {
  const bamboo=enemy.def.biome==='bamboo';const crimson=enemy.def.biome==='crimson';
  const types=crimson
    ? phase===2?['emberAkita','gongwing','emberAkita','gongwing','mistclawLynx','ironhorn']:['gatewardenRhino','mistclawLynx','gongwing','emberAkita','gatewardenRhino','gongwing','mistclawLynx']
    : bamboo?phase===2?['bambooStalker','sporeArcher','bambooStalker','sporeArcher','bambooStalker']:['mossBrute','bambooStalker','powderkegToad','bambooStalker','mossBrute','powderkegToad']
    : phase===2?['jadeBrawler','spiritArcher','jadeBrawler','spiritArcher']:['armoredBoar','jadeBrawler','bellweaverCat','jadeBrawler','groveMinion','bellweaverCat'];
  const baseHealth=crimson?2.05:bamboo?1.82:1.65;const baseSpeed=crimson?1.68:bamboo?1.55:1.42;const baseDamage=crimson?1.72:bamboo?1.5:1.35;
  types.forEach((type,i)=>{const a=i/types.length*Math.PI*2;enemies.push(makeEnemy({type,x:enemy.x+Math.cos(a)*560,y:enemy.y+Math.sin(a)*350,delay:.25+i*.16,healthScale:baseHealth*enemy.healthScale,speedScale:baseSpeed*enemy.speedScale,damageScale:baseDamage*enemy.damageScale},enemies.length+i));});
  spawnWord(enemy.x,enemy.y-190,crimson?(phase===2?'WARHOST!':'SHOGUN FURY!'):bamboo?(phase===2?'MOON PACK!':'HOLLOW FURY!'):(phase===2?'SPIRIT GUARD!':'JADE FURY!'),enemy.def.color);
}

function fireBossRadial(enemy,count){
  const bamboo=enemy.def.biome==='bamboo';const crimson=enemy.def.biome==='crimson';const speed=crimson?610:bamboo?540:470;
  for(let i=0;i<count;i++){const angle=i/count*Math.PI*2+enemy.patternIndex*.19;effects.projectiles.push({x:enemy.x+Math.cos(angle)*95,y:enemy.y+Math.sin(angle)*70-42,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,radius:crimson?22:bamboo?20:17,color:enemy.def.color,damage:Math.round(((crimson?21:bamboo?17:14)+enemy.bossPhase*2)*enemy.damageScale),life:3.6,maxLife:3.6,boss:true});}
  burst(enemy.x,enemy.y-65,enemy.def.color,40,420,6);camera.shake=11;playTone(92,.42,'sawtooth',.07,360);
}

function fireBossLanes(enemy){
  const aim=Math.atan2(player.y-enemy.y,player.x-enemy.x);const lanes=5+enemy.bossPhase*2;
  for(let i=0;i<lanes;i++){const offset=(i-(lanes-1)/2)*.14;const angle=aim+offset;effects.projectiles.push({x:enemy.x+Math.cos(angle)*115,y:enemy.y+Math.sin(angle)*82-35,vx:Math.cos(angle)*650,vy:Math.sin(angle)*650,radius:23,color:'#ff5b27',damage:Math.round((19+enemy.bossPhase*3)*enemy.damageScale),life:3.4,maxLife:3.4,boss:true,crimson:true,vfxFrame:4,impactFrame:5});for(let j=1;j<=3;j++){const x=enemy.x+Math.cos(angle)*j*120,y=enemy.y+Math.sin(angle)*j*120;effects.fireTrails.push({x,y,color:'#ff5b27',life:.85,maxLife:.85});effects.spriteEffects.push({asset:'crimsonCombatVfx',fixedFrame:4,x,y,width:240,height:135,life:.48,maxLife:.48,rotation:angle,glow:'#ff5b27'});}}
  effects.spriteEffects.push({asset:'crimsonCombatVfx',fixedFrame:5,x:enemy.x,y:enemy.y-20,width:430,height:430,life:.65,maxLife:.65,glow:'#ff5b27'});
  spawnWord(enemy.x,enemy.y-190,'BURNING LANES!','#ff7a2d');burst(enemy.x,enemy.y-60,'#ff5b27',48,460,7);camera.shake=15;playTone(68,.5,'sawtooth',.08,420);
}

function fireBossCrossfire(enemy,profile){
  const target={x:enemy.patternTargetX,y:enemy.patternTargetY};let struck=false;
  for(let i=0;i<profile.crossfireLanes;i++){
    const angle=enemy.patternAngle+i*Math.PI/profile.crossfireLanes;
    const lineDistance=Math.abs((player.x-target.x)*Math.sin(angle)-(player.y-target.y)*Math.cos(angle));
    if(lineDistance<profile.crossfireWidth+player.radius)struck=true;
    for(let step=-2;step<=2;step++){
      const x=target.x+Math.cos(angle)*step*230,y=target.y+Math.sin(angle)*step*230;
      effects.spriteEffects.push({asset:enemy.def.biome==='crimson'?'crimsonCombatVfx':'shockImpactVfx',fixedFrame:enemy.def.biome==='crimson'?4:3,x,y,width:245,height:150,life:.55,maxLife:.55,rotation:angle,glow:enemy.def.color});
    }
  }
  if(struck)hurtPlayer(Math.round((profile.crossfireDamage+enemy.bossPhase*3)*enemy.damageScale),enemy,.45);
  effects.rings.push({x:target.x,y:target.y,radius:20,maxRadius:profile.crossfireWidth*2.1,color:enemy.def.color,life:.5,maxLife:.5});
  burst(target.x,target.y,enemy.def.color,52,560,7);spawnWord(target.x,target.y-90,'SEAL BREAK!','#fff2a5');camera.shake=19;hitStop=.07;playTone(61,.42,'sawtooth',.075,360);
}

function prepareBossSignature(enemy,profile){
  const b=room.combatBounds;const lead=enemy.def.id==='moonfangKomainu'?.48:.28;const count=enemy.def.id==='pyreclawShogun'?3+enemy.bossPhase:enemy.def.id==='moonfangKomainu'?3:1;
  enemy.signatureTargets=Array.from({length:count},(_,index)=>{
    if(enemy.def.id==='jadeguardTanuki')return {x:enemy.x,y:enemy.y+10,radius:430};
    const spread=index-(count-1)/2;const x=player.x+player.vx*lead+spread*(enemy.def.id==='pyreclawShogun'?205:175);const y=player.y+player.vy*lead+(index%2?115:-55);
    return {x:clamp(x,b.x-b.radiusX*.86,b.x+b.radiusX*.86),y:clamp(y,b.y-b.radiusY*.84,b.y+b.radiusY*.84),radius:enemy.def.id==='pyreclawShogun'?148:138};
  });
  const warningLife=BOSS_PATTERNS.signature.windup+BOSS_PATTERNS.signature.action-BOSS_PATTERNS.signature.resolveAt;
  for(const target of enemy.signatureTargets)effects.guardianSignatures.push({x:target.x,y:target.y,radius:target.radius,row:profile.signatureRow,stage:0,life:warningLife,maxLife:warningLife,color:enemy.def.color,ownerId:enemy.id});
  spawnWord(enemy.x,enemy.y-205,profile.signatureName.toUpperCase(),enemy.def.color);playTone(enemy.def.id==='pyreclawShogun'?58:enemy.def.id==='moonfangKomainu'?130:210,.5,'sawtooth',.055,240);
}

function resolveBossSignature(enemy,profile){
  const targets=enemy.signatureTargets||[{x:enemy.x,y:enemy.y,radius:360}];const jade=enemy.def.id==='jadeguardTanuki',moon=enemy.def.id==='moonfangKomainu';
  if(jade){
    const count=14+enemy.bossPhase*4;for(let i=0;i<count;i++){const angle=i/count*Math.PI*2+enemy.patternIndex*.31;const gap=i%(enemy.bossPhase>=3?5:4)===0;if(gap)continue;effects.projectiles.push({x:enemy.x+Math.cos(angle)*115,y:enemy.y+Math.sin(angle)*82-38,vx:Math.cos(angle)*(440+enemy.bossPhase*45),vy:Math.sin(angle)*(440+enemy.bossPhase*45),radius:18,color:enemy.def.color,damage:Math.round(profile.signatureDamage*enemy.damageScale),life:3.2,maxLife:3.2,boss:true});}
  }else{
    let hit=false;for(const target of targets){if(distance(player,target)<target.radius+player.radius)hit=true;effects.rings.push({x:target.x,y:target.y,radius:24,maxRadius:target.radius,color:enemy.def.color,life:.56,maxLife:.56});burst(target.x,target.y,enemy.def.color,moon?36:48,moon?520:680,moon?6:8);}
    if(hit)hurtPlayer(Math.round(profile.signatureDamage*enemy.damageScale),enemy,moon ? .55 : .72);
  }
  effects.guardianSignatures=effects.guardianSignatures.filter((effect)=>effect.ownerId!==enemy.id);for(const target of targets)effects.guardianSignatures.push({x:target.x,y:target.y,radius:target.radius,row:profile.signatureRow,stage:1,life:.78,maxLife:.78,color:enemy.def.color,ownerId:enemy.id});
  camera.shake=Math.max(camera.shake,jade?16:moon?20:24);hitStop=Math.max(hitStop,.075);spawnWord(targets[0].x,targets[0].y-90,jade?'BELLS BREAK!':moon?'MOON CLAWS!':'ONI ERUPTS!',enemy.def.color);playTone(jade?84:moon?71:49,.52,'sawtooth',.08,jade?340:90);
}

function updateBoss(enemy,dt){
  const bamboo=enemy.def.biome==='bamboo';const crimson=enemy.def.biome==='crimson';const bossColor=enemy.def.color;const profile=BOSS_PROFILES[enemy.def.id];const sweepRange=profile.sweepRange;
  enemy.stateTime-=dt;enemy.contactCooldown=Math.max(0,(enemy.contactCooldown||0)-dt);
  const healthRatio=enemy.health/enemy.maxHealth;const nextPhase=healthRatio<=.33?3:healthRatio<=.67?2:1;
  if(nextPhase>enemy.bossPhase){enemy.bossPhase=nextPhase;enemy.state='bossEnrage';enemy.stateTime=1.35;enemy.patternHit=false;player.ultimateFlash=.12;camera.shake=20;ui.bossPhase.textContent=profile.phaseNames[nextPhase];if(!enemy.phaseTriggered[nextPhase]){enemy.phaseTriggered[nextPhase]=true;summonBossGuard(enemy,nextPhase);}}
  const toPlayer=normalize(player.x-enemy.x,player.y-enemy.y);const dist=distance(enemy,player);enemy.facing=approachAngle(enemy.facing,Math.atan2(toPlayer.y,toPlayer.x),clamp(dt*4,0,1));
  if(dist<enemy.radius+player.radius+8&&enemy.contactCooldown<=0){enemy.contactCooldown=1.1;hurtPlayer(Math.round(enemy.def.contactDamage*.65*enemy.damageScale),enemy);}
  if(enemy.state==='enter'){enemy.vx*=.84;enemy.vy*=.84;if(enemy.stateTime<=0){enemy.state='bossIdle';enemy.stateTime=1.1;const entranceName=enemy.def.id==='pyreclawShogun'?'PYRECLAW!':enemy.def.id==='moonfangKomainu'?'MOONFANG!':'JADEGUARD!';spawnWord(enemy.x,enemy.y-180,entranceName,bossColor);}return;}
  if(enemy.state==='bossEnrage'){enemy.vx*=Math.exp(-10*dt);enemy.vy*=Math.exp(-10*dt);if(enemy.stateTime<=0){enemy.state='bossIdle';enemy.stateTime=.45;}return;}
  if(enemy.state==='bossWindupSweep'){enemy.vx*=Math.exp(-12*dt);enemy.vy*=Math.exp(-12*dt);if(enemy.stateTime<=0){enemy.state=BOSS_PATTERNS.sweep.actionState;enemy.stateTime=BOSS_PATTERNS.sweep.action;enemy.patternHit=false;playTone(75,.25,'sawtooth',.06,120);}return;}
  if(enemy.state==='bossSweep'){
    if(!enemy.patternHit&&enemy.stateTime<=BOSS_PATTERNS.sweep.resolveAt){enemy.patternHit=true;const facing={x:Math.cos(enemy.facing),y:Math.sin(enemy.facing)};const toward=normalize(player.x-enemy.x,player.y-enemy.y);if(dist<sweepRange&&facing.x*toward.x+facing.y*toward.y>-.15)hurtPlayer(Math.round((profile.sweepDamage+enemy.bossPhase*4)*enemy.damageScale),enemy,.35);effects.spriteEffects.push({asset:crimson?'crimsonCombatVfx':'hammerSlamVfx',fixedFrame:crimson?0:undefined,x:enemy.x+facing.x*190,y:enemy.y+facing.y*125,width:crimson?760:bamboo?660:560,height:crimson?420:bamboo?370:330,life:.62,maxLife:.62,rotation:enemy.facing,glow:bossColor});camera.shake=16;hitStop=.06;}
    if(enemy.stateTime<=0){enemy.state='bossIdle';enemy.stateTime=BOSS_PATTERNS.sweep.recovery/enemy.bossPhase;}return;
  }
  if(enemy.state==='bossWindupSlam'){enemy.vx*=Math.exp(-14*dt);enemy.vy*=Math.exp(-14*dt);if(enemy.stateTime<=0){enemy.state=BOSS_PATTERNS.slam.actionState;enemy.stateTime=BOSS_PATTERNS.slam.action;enemy.patternHit=false;}return;}
  if(enemy.state==='bossSlam'){
    if(!enemy.patternHit&&enemy.stateTime<=BOSS_PATTERNS.slam.resolveAt){enemy.patternHit=true;effects.spriteEffects.push({asset:crimson?'crimsonCombatVfx':'hammerSlamVfx',fixedFrame:crimson?5:undefined,x:enemy.x,y:enemy.y+18,width:crimson?760:bamboo?860:760,height:crimson?760:bamboo?590:520,life:.8,maxLife:.8,glow:bossColor});effects.rings.push({x:enemy.x,y:enemy.y,radius:40,maxRadius:enemy.def.slamRadius,color:crimson?'#ff5b27':bamboo?'#41f5da':'#ff3b69',life:.65,maxLife:.65});if(dist<enemy.def.slamRadius+player.radius)hurtPlayer(Math.round((profile.slamDamage+enemy.bossPhase*4)*enemy.damageScale),enemy,enemy.def.stunDuration);camera.shake=22;hitStop=.08;playTone(58,.45,'sawtooth',.08,-20);}
    if(enemy.stateTime<=0){enemy.state='bossIdle';enemy.stateTime=BOSS_PATTERNS.slam.recovery/enemy.bossPhase;}return;
  }
  if(enemy.state==='bossChannel'){
    enemy.vx*=Math.exp(-10*dt);enemy.vy*=Math.exp(-10*dt);
    if(!enemy.patternHit&&enemy.stateTime<=BOSS_PATTERNS.channel.resolveAt){enemy.patternHit=true;if(crimson)fireBossLanes(enemy);else fireBossRadial(enemy,profile.radialBase+enemy.bossPhase*4);}
    if(enemy.stateTime<=0){enemy.state='bossIdle';enemy.stateTime=BOSS_PATTERNS.channel.recovery/enemy.bossPhase;}return;
  }
  if(enemy.state==='bossWindupCrossfire'){
    enemy.vx*=Math.exp(-13*dt);enemy.vy*=Math.exp(-13*dt);
    if(enemy.stateTime<=0){enemy.state=BOSS_PATTERNS.crossfire.actionState;enemy.stateTime=BOSS_PATTERNS.crossfire.action;enemy.patternHit=false;}
    return;
  }
  if(enemy.state==='bossCrossfire'){
    enemy.vx*=Math.exp(-13*dt);enemy.vy*=Math.exp(-13*dt);
    if(!enemy.patternHit&&enemy.stateTime<=BOSS_PATTERNS.crossfire.resolveAt){enemy.patternHit=true;fireBossCrossfire(enemy,profile);}
    if(enemy.stateTime<=0){enemy.state='bossIdle';enemy.stateTime=BOSS_PATTERNS.crossfire.recovery/enemy.bossPhase;}
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
    if(enemy.stateTime<=0){enemy.state='bossIdle';enemy.stateTime=BOSS_PATTERNS.signature.recovery/enemy.bossPhase;enemy.signaturePrepared=false;enemy.signatureTargets=null;}
    return;
  }
  const preferred=dist>420?1:dist<250?-1:0;enemy.vx=lerp(enemy.vx,toPlayer.x*enemy.def.speed*enemy.speedScale*preferred,clamp(dt*2.7,0,1));enemy.vy=lerp(enemy.vy,toPlayer.y*enemy.def.speed*enemy.speedScale*preferred,clamp(dt*2.7,0,1));enemy.x+=enemy.vx*dt;enemy.y+=enemy.vy*dt;keepInArena(enemy);
  if(enemy.stateTime<=0){const schedule=profile.schedules[enemy.bossPhase];const pattern=BOSS_PATTERNS[schedule[enemy.patternIndex++%schedule.length]];enemy.activePattern=pattern.id;enemy.state=pattern.windupState;enemy.stateTime=pattern.windup;enemy.patternHit=false;if(pattern.id==='crossfire'){enemy.patternTargetX=player.x;enemy.patternTargetY=player.y;enemy.patternAngle=Math.atan2(player.y-enemy.y,player.x-enemy.x)+enemy.bossPhase*.17;}if(pattern.id==='signature'){enemy.signaturePrepared=false;enemy.signatureTargets=null;}}
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
  burst(enemy.x,enemy.y-12,'#57f2b4',28,320,5);playTone(410,.32,'sine',.045,240);return true;
}

function throwPowderkegBomb(enemy){
  const bounds=room.combatBounds;const lead=.34;
  const x=clamp(player.x+player.vx*lead,bounds.x-bounds.radiusX*.9,bounds.x+bounds.radiusX*.9);
  const y=clamp(player.y+player.vy*lead,bounds.y-bounds.radiusY*.9,bounds.y+bounds.radiusY*.9);
  const fuse=enemy.def.bombFuse||1.05;
  effects.enemyHazards.push({x,y,radius:enemy.def.bombRadius||148,damage:Math.round(enemy.def.contactDamage*enemy.damageScale),color:enemy.def.color,life:fuse,maxLife:fuse,triggerAt:.1,triggered:false,type:'bomb',ownerId:enemy.id});
  effects.rings.push({x,y,radius:10,maxRadius:48,color:'#ff9a31',life:.32,maxLife:.32});
  spawnWord(enemy.x,enemy.y-82,'BOMB AWAY!','#ffad35');burst(enemy.x,enemy.y-24,'#ff9a31',18,260,4);playTone(170,.18,'square',.035,80);
}

function updateEnemies(dt) {
  const alive = enemies.filter((enemy) => !enemy.dead);
  const activeCombatants=alive.filter((enemy)=>enemy.state!=='waiting');
  let activationSlots=Math.max(0,activeEnemyLimit()-activeCombatants.length);
  for (const enemy of enemies) {
    const definition = enemy.def;
    enemy.flash = Math.max(0, enemy.flash - dt);
    enemy.abilityReactTime=Math.max(0,(enemy.abilityReactTime||0)-dt);
    enemy.cooldown = Math.max(0, enemy.cooldown - dt);
    enemy.bob += dt * 5;
    if (enemy.state === 'waiting') {
      enemy.stateTime -= dt;
      if (enemy.stateTime <= 0 && activationSlots > 0) {
        enemy.state = 'enter'; enemy.stateTime = 1.35;
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
    if (enemy.burnTime > 0) {
      enemy.burnTime = Math.max(0, enemy.burnTime - dt);
      enemy.burnTick -= dt;
      if (enemy.burnTick <= 0) {
        const burnDamage=Math.max(1,Math.round(ABILITIES.foxfireVolley.burnDamage*(enemy.burnPower||1)*(enemy.practiceArmor??1)*(enemy.eliteId?player.eliteDamageMultiplier:1)));recordDojoDamage(enemy,burnDamage);
        const resolved=resolveEnemyDamage(enemy,burnDamage);enemy.flash=Math.max(enemy.flash,.08);enemy.burnTick=.5;
        burst(enemy.x, enemy.y - 8, ABILITIES.foxfireVolley.color, 7, 130, 3);
        effects.numbers.push({x:enemy.x,y:enemy.y-34,vx:0,vy:-62,text:resolved.shieldDamage&&!resolved.healthDamage?String(Math.round(resolved.total)):String(burnDamage),color:resolved.shieldDamage?'#9aff8b':'#ff8a38',life:.55,maxLife:.55,size:18});
        if (enemy.health <= 0) { killEnemy(enemy, normalize(enemy.x-player.x, enemy.y-player.y)); continue; }
      }
    }
    enemy.wetTime = Math.max(0, enemy.wetTime - dt);
    enemy.shockTime = Math.max(0, enemy.shockTime - dt);
    enemy.huntTime = Math.max(0, (enemy.huntTime||0) - dt);
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
        } else if (definition.behavior === 'ranged') {
          fireEnemyProjectile(enemy, toPlayer);
          enemy.state='recover';enemy.stateTime=.4;enemy.cooldown=definition.attackCooldown*enemy.attackCooldownScale;
        } else if (definition.behavior === 'heavy') {
          enemy.state = 'slam'; enemy.stateTime = .52; enemy.slamResolved = false; enemy.vx = 0; enemy.vy = 0;
        } else {
          enemy.state = 'strike'; enemy.stateTime = .38; enemy.hitPlayer = false;
          const speed = definition.behavior === 'basic' ? 165 : definition.behavior==='shield' ? 640 : 720;
          enemy.vx = Math.cos(enemy.facing) * speed; enemy.vy = Math.sin(enemy.facing) * speed;
          if(definition.behavior!=='shield')effects.spriteEffects.push({asset:definition.biome==='crimson'?'crimsonCombatVfx':'clawSlashVfx',fixedFrame:definition.biome==='crimson'?0:undefined,x:enemy.x+Math.cos(enemy.facing)*62,y:enemy.y+Math.sin(enemy.facing)*62-16,width:definition.biome==='crimson'?240:definition.behavior==='basic'?135:190,height:definition.biome==='crimson'?160:definition.behavior==='basic'?90:124,life:.38,maxLife:.38,rotation:enemy.facing,glow:definition.color});
        }
      }
    } else if (enemy.state === 'slam') {
      enemy.vx *= Math.exp(-15 * dt); enemy.vy *= Math.exp(-15 * dt);
      if (!enemy.slamResolved && enemy.stateTime <= .3) {
        enemy.slamResolved = true;
        const radius = definition.slamRadius;
        effects.spriteEffects.push({asset:definition.biome==='crimson'?'crimsonCombatVfx':'hammerSlamVfx',fixedFrame:definition.biome==='crimson'?3:undefined,x:enemy.x,y:enemy.y+14,width:definition.biome==='crimson'?radius*3.15:radius*2.8,height:definition.biome==='crimson'?radius*2.55:radius*2.2,life:.68,maxLife:.68,glow:definition.color});
        burst(enemy.x, enemy.y + 12, '#ff9a24', 22, 390, 5);
        camera.shake = Math.max(camera.shake, 13); hitStop = Math.max(hitStop, .065); playTone(72, .3, 'sawtooth', .075, -28);
        if (dist < radius + player.radius) hurtPlayer(Math.round(definition.contactDamage*enemy.damageScale), enemy, definition.stunDuration);
      }
      if(enemy.stateTime<=0){enemy.state='recover';enemy.stateTime=.7;enemy.cooldown=definition.attackCooldown*enemy.attackCooldownScale;}
    } else if (enemy.state === 'strike') {
      if (!enemy.hitPlayer && dist < enemy.radius + player.radius + 12) {
        enemy.hitPlayer = true; hurtPlayer(Math.round(definition.contactDamage*enemy.damageScale), enemy,definition.behavior==='shield'?definition.stunDuration:0);
        if(definition.behavior==='shield'){effects.rings.push({x:player.x,y:player.y,radius:14,maxRadius:96,color:definition.color,life:.34,maxLife:.34});effects.spriteEffects.push({asset:'specialEnemyVfx',fixedFrame:5,x:player.x,y:player.y-18,width:210,height:165,life:.38,maxLife:.38,rotation:enemy.facing,glow:definition.color});burst(player.x,player.y-16,definition.color,24,390,6);spawnWord(player.x,player.y-76,'SHIELD BASH!','#ff684d');}
      }
      enemy.vx *= Math.exp(-(definition.behavior === 'heavy' ? 1.45 : 2.2) * dt);
      enemy.vy *= Math.exp(-(definition.behavior === 'heavy' ? 1.45 : 2.2) * dt);
      if(enemy.stateTime<=0){enemy.state='recover';enemy.stateTime=.38;enemy.cooldown=definition.attackCooldown*enemy.attackCooldownScale;}
    } else if (enemy.state === 'recover') {
      enemy.vx *= Math.exp(-10 * dt); enemy.vy *= Math.exp(-10 * dt);
      if (enemy.stateTime <= 0) enemy.state = 'chase';
    } else {
      const canAttack = ['ranged','summoner','bomber','assassin'].includes(definition.behavior) ? dist < 575 : dist <= definition.attackRange + player.radius;
      if (canAttack && enemy.cooldown <= 0) {
        enemy.state='windup';enemy.stateTime=definition.windup*enemy.windupScale;
        if(definition.behavior==='assassin'){const through=normalize(player.x-enemy.x,player.y-enemy.y);enemy.blinkX=player.x+through.x*definition.blinkOffset;enemy.blinkY=player.y+through.y*definition.blinkOffset;}
      } else {
        enemy.orbitAngle += enemy.orbitDrift * dt * (['ranged','summoner','bomber','assassin'].includes(definition.behavior) ? .18 : .11);
        const hunting=enemy.huntTime>0;
        const orbitTarget = hunting ? {x:player.x,y:player.y} : {
          x: player.x + Math.cos(enemy.orbitAngle) * enemy.orbitRadius,
          y: player.y + Math.sin(enemy.orbitAngle) * enemy.orbitRadius * .72
        };
        const toOrbit = normalize(orbitTarget.x - enemy.x, orbitTarget.y - enemy.y);
        const orbitDistance = distance(enemy, orbitTarget);
        const statusSpeed = enemy.wetTime > 0 ? 1 - ABILITIES.undertowWell.slow : 1;
        const speed = definition.speed * enemy.speedScale * statusSpeed * (hunting?1.18:1) * clamp(orbitDistance / 65, .38, 1.15);
        enemy.vx = lerp(enemy.vx, toOrbit.x * speed, clamp(dt * 5.5, 0, 1));
        enemy.vy = lerp(enemy.vy, toOrbit.y * speed, clamp(dt * 5.5, 0, 1));
      }
    }

    for (const other of activeCombatants) {
      if (other === enemy) continue;
      const d = distance(enemy, other);
      const minimum = enemy.radius + other.radius + 18;
      if (d > 0 && d < minimum) {
        const repel = normalize(enemy.x - other.x, enemy.y - other.y);
        enemy.vx += repel.x * (minimum - d) * 35 * dt;
        enemy.vy += repel.y * (minimum - d) * 35 * dt;
      }
    }
    enemy.x += enemy.vx * dt; enemy.y += enemy.vy * dt;
    keepInArena(enemy);
  }
  updateEnemyProjectiles(dt);
  updateRoomMission(dt);
  const activeCount = alive.filter((enemy) => enemy.state !== 'waiting').length;
  const incomingCount = alive.length - activeCount;
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

function fireEnemyProjectile(enemy, direction) {
  const crimson=enemy.def.biome==='crimson';const speed = crimson?560:enemy.def.biome==='bamboo'?485:410;const color=enemy.def.color||'#37e8ff';
  const muzzle = {x:enemy.x+direction.x*48,y:enemy.y+direction.y*48-16};
  effects.projectiles.push({ x: muzzle.x, y: muzzle.y, vx: direction.x * speed, vy: direction.y * speed, radius: crimson?16:12, color, damage:Math.round((crimson?15:enemy.def.biome==='bamboo'?12:8)*enemy.damageScale), life: 2.1, maxLife: 2.1, crimson });
  effects.spriteEffects.push({asset:crimson?'crimsonCombatVfx':'spiritArrowImpactVfx',fixedFrame:crimson?2:undefined,x:muzzle.x,y:muzzle.y,width:crimson?82:66,height:crimson?82:58,life:.16,maxLife:.16,rotation:Math.atan2(direction.y,direction.x),glow:color});
  burst(muzzle.x, muzzle.y, color, 16, 230, 3);
  playTone(310, .14, 'triangle', .028, 120);
}

function updateEnemyProjectiles(dt) {
  for (const projectile of effects.projectiles) {
    projectile.life -= dt; projectile.x += projectile.vx * dt; projectile.y += projectile.vy * dt;
    if (projectile.life > 0 && distance(projectile, player) < projectile.radius + player.radius) {
      projectile.life = 0; hurtPlayer(projectile.damage||8, projectile); burst(projectile.x, projectile.y, projectile.color||'#37e8ff', 8, 210, 3);
      effects.spriteEffects.push({asset:projectile.crimson?'crimsonCombatVfx':'spiritArrowImpactVfx',fixedFrame:projectile.crimson?(projectile.impactFrame??2):undefined,x:projectile.x,y:projectile.y-10,width:projectile.crimson?178:142,height:projectile.crimson?178:126,life:.45,maxLife:.45,rotation:Math.atan2(projectile.vy,projectile.vx),glow:projectile.color||'#37e8ff'});
    }
  }
}

function keepInArena(entity) {
  const bounds = room.combatBounds;
  const nx = (entity.x - bounds.x) / bounds.radiusX;
  const ny = (entity.y - bounds.y) / bounds.radiusY;
  const length = Math.hypot(nx, ny);
  if (length > .96) {
    entity.x = bounds.x + (nx / length) * bounds.radiusX * .96;
    entity.y = bounds.y + (ny / length) * bounds.radiusY * .96;
    entity.vx *= .45; entity.vy *= .45;
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
}

function burst(x, y, color, count, speed, size) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * (.25 + Math.random() * .75);
    effects.particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, color, size: size * (.45 + Math.random()), life: .25 + Math.random() * .35, maxLife: .6, drag: 3 + Math.random() * 4 });
  }
}

function spawnWord(x, y, text, color) {
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
  for(const hazard of effects.enemyHazards){
    hazard.life-=dt;
    if(!hazard.triggered&&hazard.life<=(hazard.triggerAt??.16)){hazard.triggered=true;const bomb=hazard.type==='bomb';effects.rings.push({x:hazard.x,y:hazard.y,radius:24,maxRadius:hazard.radius,color:hazard.color,life:.44,maxLife:.44});burst(hazard.x,hazard.y,bomb?'#ffbd42':hazard.color,bomb?46:38,bomb?610:520,bomb?8:7);effects.spriteEffects.push({asset:bomb?'specialEnemyVfx':'crimsonCombatVfx',fixedFrame:bomb?4:5,x:hazard.x,y:hazard.y,width:hazard.radius*2.65,height:hazard.radius*2.2,life:.58,maxLife:.58,glow:hazard.color});camera.shake=Math.max(camera.shake,bomb?18:15);hitStop=Math.max(hitStop,bomb ? .08 : .07);playTone(bomb?52:64,.35,'sawtooth',.07,30);if(distance(hazard,player)<hazard.radius+player.radius)hurtPlayer(hazard.damage,hazard,bomb ? .4 : .28);}
  }
  for (const shot of effects.playerShots) {
    shot.life -= dt; shot.x += shot.vx * dt; shot.y += shot.vy * dt;
    if(!damageRoomMissionObjects(shot))damageDestructibles(shot);
    for (const enemy of enemies) {
      if (shot.life <= 0 || enemy.dead || enemy.state==='waiting' || shot.hitIds?.has(enemy.id) || distance(shot, enemy) >= shot.radius + enemy.radius) continue;
      shot.hitIds?.add(enemy.id);hitEnemyWithShot(enemy, shot);
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
    if(!vortex.collapsed&&vortex.life<=vortex.definition.holdDuration){vortex.collapsed=true;const targets=enemies.filter((enemy)=>!enemy.dead&&enemy.state!=='waiting'&&distance(vortex,enemy)<vortex.radius*.72+enemy.radius);for(const enemy of targets){const inward=normalize(vortex.x-enemy.x,vortex.y-enemy.y);damageEnemyFromAbility(enemy,Math.round(vortex.definition.collapseDamage*player.abilityPower.undertowWell),85,inward,vortex.definition.color,'UNDERTOW!');applyEnemyStatus(enemy,'wet',vortex.definition.wetDuration);}effects.rings.push({x:vortex.x,y:vortex.y,radius:vortex.radius*.5,maxRadius:vortex.radius*1.12,color:'#dfffff',life:.48,maxLife:.48});burst(vortex.x,vortex.y,'#dfffff',36,470,7);camera.shake=Math.max(camera.shake,10);hitStop=Math.max(hitStop,.055);playTone(92,.3,'sawtooth',.045,380);}
  }
  for (const storm of effects.shockStorms) {
    storm.life -= dt; storm.tick -= dt;
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
    if (targets.length) {if(player.synergies.has('guardianTempest'))player.health=Math.min(player.maxHealth,player.health+1.5);camera.shake=Math.max(camera.shake,5); hitStop=Math.max(hitStop,.018); playTone(145+storm.pulse*12,.12,'square',.025,360); }
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
      if (distance(shard, player) < 27) { shard.life = 0; gainXp(3); burst(player.x,player.y-12,shard.color,5,120,2); effects.rings.push({x:player.x,y:player.y,radius:4,maxRadius:22,color:shard.color,life:.14,maxLife:.14}); playTone(520 + player.xp * 2, .06, 'sine', .015, 80); }
    }
  }
  for (const list of Object.values(effects)) {
    for (let i = list.length - 1; i >= 0; i--) if (list[i].life <= 0) list.splice(i, 1);
  }
}

function triggerSteamBurst(origin,power){
  origin.wetTime=0;const radius=205;effects.rings.push({x:origin.x,y:origin.y,radius:28,maxRadius:radius,color:'#dffcff',life:.55,maxLife:.55});effects.spriteEffects.push({asset:'waterImpactVfx',x:origin.x,y:origin.y-12,width:370,height:280,life:.58,maxLife:.58,glow:'#52eaff'});effects.spriteEffects.push({asset:'burnStatusVfx',x:origin.x,y:origin.y-28,width:285,height:225,life:.42,maxLife:.42,glow:'#ff8b2a'});spawnWord(origin.x,origin.y-78,'STEAM BURST!','#eaffff');burst(origin.x,origin.y,'#dffcff',32,430,6);
  for(const target of enemies){if(target.dead||target.state==='waiting'||distance(origin,target)>radius+target.radius)continue;const away=normalize(target.x-origin.x,target.y-origin.y);damageEnemyFromAbility(target,Math.round(18*power),210,away,'#b8f8ff',null);target.wetTime=0;}
  camera.shake=Math.max(camera.shake,11);hitStop=Math.max(hitStop,.065);playTone(130,.28,'sawtooth',.035,260);
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
  ui.healthText.textContent = `${Math.ceil(player.health)} / ${player.maxHealth}`;
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
  }
  ui.xpFill.style.width = `${clamp(player.xp/player.xpToNext*100,0,100)}%`; ui.xpText.textContent = `${player.xp} / ${player.xpToNext}`;
  ui.levelBadge.textContent = String(player.level);
  ui.goldToken.textContent=`GOLD ${player.gold}`;
  ui.comboCount.textContent = String(player.hitCount);
  ui.comboPanel.classList.toggle('show', comboUiTimer > 0 && player.hitCount >= 2);
  const boss=enemies.find((enemy)=>enemy.def.behavior==='boss'&&!enemy.dead);
  if(boss){const profile=BOSS_PROFILES[boss.def.id];ui.bossHealthFill.style.width=`${clamp(boss.health/boss.maxHealth*100,0,100)}%`;ui.bossHealthText.textContent=`${Math.max(0,Math.ceil(boss.health))} / ${boss.maxHealth}`;ui.bossPhase.textContent=profile.phaseNames[boss.bossPhase];}
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
      updateEnemies(dt);
      updateCorruptionDirector(dt);
      updateEncounter(dt);
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

function draw(screen) {
  ctx.setTransform(screen.dpr, 0, 0, screen.dpr, 0, 0);
  ctx.fillStyle = '#080718'; ctx.fillRect(0, 0, screen.width, screen.height);
  setWorldTransform(screen);
  if (assets.arena.complete && assets.arena.naturalWidth) ctx.drawImage(assets.arena, 0, 0, room.width, room.height);
  else { ctx.fillStyle = '#12112a'; ctx.fillRect(0, 0, room.width, room.height); }

  if(room.id!=='spiritVillage')drawWorldZones();
  if(room.id==='jadeCourtyard'){drawFloorDetails();drawArchitectureLandmarks();drawLightPools();}
  drawAmbient();
  if(room.id==='spiritVillage')drawHubStations();
  drawArenaSeal();
  if(room.id!=='spiritVillage')drawRoomInteractable();
  if(room.id==='jadeCourtyard')drawSpiritGates();
  for (const after of effects.afterimages) drawHero(after, after.life / after.maxLife * .36, true);
  const renderables = [
    ...(room.id==='jadeCourtyard'?props.filter((prop) => !prop.foreground).map((prop) => ({ ...prop, renderType: 'prop' })):[]),
    ...destructibles.filter((prop)=>!prop.broken).map((prop)=>({...prop,renderType:'destructible'})),
    ...(roomMission?.actors||[]).filter((actor)=>!actor.broken&&!actor.released).map((actor)=>({...actor,renderType:actor.kind==='anchor'?'missionAnchor':'missionCaptive'})),
    ...(roomMission?.ward&&!roomMission.complete?[{...roomMission.ward,renderType:'missionWard'}]:[]),
    ...enemies.filter((enemy) => enemy.state !== 'waiting' && (enemy.deathTime > 0 || !enemy.dead)),
    ...[...coop.remotePlayers.values()].filter((member)=>member.room===room.id&&member.state!=='preview').map((member)=>({...member,renderType:'coopPlayer'})),player
  ].sort((a, b) => a.y - b.y);
  for (const entity of renderables) {
    if (entity.renderType === 'prop') drawProp(entity);
    else if(entity.renderType==='destructible')drawDestructible(entity);
    else if(entity.renderType==='missionAnchor')drawMissionAnchor(entity);
    else if(entity.renderType==='missionCaptive')drawMissionCaptive(entity);
    else if(entity.renderType==='missionWard')drawMissionWard(entity);
    else if(entity.renderType==='coopPlayer')drawCoopPlayer(entity);
    else if (entity === player) drawHero(player, 1, false);
    else drawEnemy(entity);
  }
  drawEffects();
  if(room.id==='jadeCourtyard')for (const prop of props.filter((item) => item.foreground)) drawProp(prop, .94);
  drawForegroundHaze();
  if(player?.ultimateFlash>0&&profile.settings.flashIntensity>0){ctx.setTransform(screen.dpr,0,0,screen.dpr,0,0);const a=clamp(player.ultimateFlash/.16,0,1)*profile.settings.flashIntensity;const flash=ctx.createRadialGradient(screen.width/2,screen.height/2,20,screen.width/2,screen.height/2,screen.width*.7);flash.addColorStop(0,`rgba(255,214,126,${a*.42})`);flash.addColorStop(.45,`rgba(201,53,255,${a*.26})`);flash.addColorStop(1,'rgba(82,10,122,0)');ctx.fillStyle=flash;ctx.fillRect(0,0,screen.width,screen.height);}
}

function drawRoomInteractable(){
  const item=roomInteractable;if(!item||item.used)return;const time=motionTime(),near=distance(player,item)<190,pulse=1+Math.sin(time*4)*.06;
  ctx.save();ctx.translate(item.x,item.y);const glow=ctx.createRadialGradient(0,0,5,0,0,145);glow.addColorStop(0,`${item.color}66`);glow.addColorStop(1,`${item.color}00`);ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(0,18,145*pulse,72*pulse,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=item.color;ctx.lineWidth=near?7:4;ctx.setLineDash([18,11]);ctx.lineDashOffset=-time*42;ctx.beginPath();ctx.ellipse(0,18,92*pulse,41*pulse,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(6,5,17,.94)';ctx.strokeStyle=item.color;ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-122,-125,244,72,10);ctx.fill();ctx.stroke();ctx.font='900 35px Impact';ctx.textAlign='center';ctx.fillStyle=item.color;ctx.fillText(item.icon,0,-80);ctx.font='italic 900 17px Impact';ctx.fillStyle='#fff7ed';ctx.fillText(item.name,0,-59);if(near){ctx.font='900 13px Inter';ctx.fillStyle=item.color;ctx.fillText(`[ E ] ${item.prompt}`,0,-140);}ctx.restore();
}

function drawDestructible(prop){
  if(!assets.props.complete||!assets.props.naturalWidth)return;const sw=assets.props.naturalWidth/4,sh=assets.props.naturalHeight/2,h=250*prop.scale,w=h*(sw/sh);ctx.save();ctx.fillStyle='rgba(0,0,8,.38)';ctx.beginPath();ctx.ellipse(prop.x,prop.y+4,prop.radius*1.12,prop.radius*.38,0,0,Math.PI*2);ctx.fill();ctx.translate(prop.x,prop.y);if(prop.health<prop.maxHealth){ctx.rotate(Math.sin(performance.now()/26)*.035);ctx.globalAlpha=.82;}ctx.drawImage(assets.props,prop.col*sw,prop.row*sh,sw,sh,-w/2,-h*.82,w,h);ctx.restore();
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
  const time = motionTime();const crimson=chapter.id==='crimsonChapter';const ambient=room.ambient||'';
  const ambientPalette={
    river:['#54efff','#668cff'],roots:['#ff3fb5','#d54cff'],corruption:['#ff3fb5','#a63cff'],
    moonriver:['#58f2ff','#7297ff'],spores:['#7dff9c','#d54cff'],mooncurse:['#42ecff','#9b4dff'],
    bells:['#ffb13b','#ff3b79'],ash:['#ff8738','#c73d54'],inferno:['#ff5b2e','#d738ff'],dojo:['#72ef5b','#d54cff']
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
  const moveSheet=assets[heroDef.moveAsset];const fireSheet=assets[heroDef.fireAsset];
  if(!moveSheet?.complete||!moveSheet.naturalWidth)return;
  const moving = Math.hypot(entity.vx || 0, entity.vy || 0);
  const time = performance.now() / 1000;
  const stateName = afterimage ? 'dash' : entity.health <= 0 ? 'death' : entity.hurtTime > 0 ? 'hit' : entity.dashTime > 0 ? 'dash' : entity.attack ? 'attack1' : entity.castTime > 0 ? 'cast' : moving > 45 ? 'run' : 'idle';
  const animation = SPRITE_ANIMATIONS[stateName] || SPRITE_ANIMATIONS.idle;
  const rawDirection=directionIndex(entity.facing);const direction=heroDef.directionMap?.[rawDirection]??rawDirection;
  const firing=!afterimage&&stateName.startsWith('attack')&&fireSheet?.complete&&fireSheet.naturalWidth;
  const sheet=firing?fireSheet:moveSheet;
  const sw = sheet.naturalWidth / 4; const sh = sheet.naturalHeight / 4;
  const useRunFrame = !firing && (stateName === 'dash' || (stateName === 'run' && Math.floor(time * 10) % 2 === 1));
  const fireStage = firing && entity.attack?.time > (weapon.releaseDelay||.045) ? 2 : 0;
  const sx = (direction % 4) * sw; const sy = (Math.floor(direction / 4) + (firing ? fireStage : useRunFrame ? 2 : 0)) * sh;
  const runBob = stateName === 'run' ? Math.sin(time * animation.fps * Math.PI*(entity.sprinting?1.5:1)) * (entity.sprinting?5:3) : 0;
  const speedLean = clamp(moving / heroDef.speed, 0, 1) * .06;
  let scaleX = 1, scaleY = 1, rotation = 0;
  if (stateName === 'run') { const pace=entity.sprinting?30:20;scaleX = 1 + Math.sin(time * pace) * (entity.sprinting?.065:.035); scaleY = 1 - Math.sin(time * pace) * (entity.sprinting?.055:.03); rotation = Math.cos(entity.facing) * speedLean*(entity.sprinting?1.8:1); }
  if (stateName === 'dash') { scaleX = 1.28; scaleY = .88; rotation = Math.cos(entity.facing) * .08; }
  if (firing) {
    const p = clamp(entity.attack?.time / entity.attack?.definition.duration || .5, 0, 1);
    scaleX = 1 + Math.sin(p * Math.PI) * .1; scaleY = 1 - Math.sin(p * Math.PI) * .06;
    rotation = -Math.cos(entity.facing) * Math.sin(p * Math.PI) * .06;
  }
  if (stateName === 'hit') rotation = Math.sin(time * 45) * .08;
  const bamboo=selectedHeroId==='bamboo';const hopscotch=selectedHeroId==='hopscotch';const rusty=selectedHeroId==='rusty';const h=bamboo?(firing?142:136):hopscotch?(firing?126:122):rusty?(firing?124:120):(firing?112:108);const w=h*(sw/sh);
  drawContactShadow(entity.x,entity.y+(bamboo?15:hopscotch||rusty?13:12),entity.dashTime>0?(bamboo?16:hopscotch||rusty?12:13):(bamboo?24:hopscotch?18:rusty?19:19),entity.dashTime>0?(bamboo?4.4:3.5):(bamboo?6.4:hopscotch?5:rusty?5.2:5.5),.34*alpha);
  if (!afterimage && entity.wildHeartTime > 0) {
    const pulse = .2 + Math.sin(time * 7) * .035;
    if (!drawAtlasFrame(assets.wildHeartVfx, 5, entity.x, entity.y + 5, 104, 78, 0, pulse, '#62f05f')) {
      ctx.save(); ctx.translate(entity.x, entity.y + 3); ctx.scale(1, .44); ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#6cf25b'; ctx.shadowColor = '#6cf25b'; ctx.shadowBlur = 18; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, 31 + Math.sin(time * 6) * 3, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
  }
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(entity.x, entity.y);
  ctx.translate(0, runBob); ctx.rotate(rotation); ctx.scale(scaleX, scaleY);
  ctx.shadowColor=afterimage?'#8f3dff':entity.dashTime>0?heroDef.accent:(bamboo?'#63ef79':hopscotch?'#ff4fa5':rusty?'#ff9b32':'#ff4d76');ctx.shadowBlur=afterimage?24:entity.dashTime>0?16:4;
  ctx.filter = afterimage ? 'hue-rotate(68deg) saturate(1.8) brightness(1.4)' : entity.flash > 0 ? 'brightness(2.4) saturate(.4)' : 'none';
  ctx.drawImage(sheet, sx, sy, sw, sh, -w/2, -h*.82, w, h);
  ctx.restore(); ctx.filter = 'none'; ctx.globalAlpha = 1;
  if (!afterimage && entity.stunTime > 0) {
    ctx.save(); ctx.translate(entity.x, entity.y - 82); ctx.rotate(time * 3.6); ctx.shadowColor='#ffd33d'; ctx.shadowBlur=16;
    for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI*2/3);ctx.translate(27,0);ctx.rotate(-time*5);ctx.fillStyle=i%2?'#fff3a0':'#ffd33d';ctx.beginPath();for(let p=0;p<10;p++){const radius=p%2?4:10;const a=p/10*Math.PI*2-Math.PI/2;p?ctx.lineTo(Math.cos(a)*radius,Math.sin(a)*radius):ctx.moveTo(Math.cos(a)*radius,Math.sin(a)*radius);}ctx.closePath();ctx.fill();ctx.restore();}ctx.restore();
  }
}

function directionIndex(angle) {
  return (Math.round((Math.PI / 2 - angle) / (Math.PI / 4)) + 8) % 8;
}

function enemyMotion(enemy){
  const moving=!enemy.dead&&['chase','bossIdle'].includes(enemy.state)&&Math.hypot(enemy.vx||0,enemy.vy||0)>24;
  const t=performance.now()/1000+(enemy.spawnIndex||0)*.31;let x=0,y=moving?Math.abs(Math.sin(t*10))*-4:0,rotation=moving?Math.sin(t*10)*.028:0,scaleX=1,scaleY=1,filter='none';
  if(enemy.state==='enter'){const p=clamp(1-enemy.stateTime/1.35,0,1);y=18*(1-p);scaleX=1+.04*Math.sin(p*Math.PI);scaleY=.92+.08*p;}
  if(enemy.abilityReactTime>0){const p=enemy.abilityReactTime/(enemy.abilityReactType==='shock'?.48:enemy.abilityReactType==='burn'?.38:.44),wave=Math.sin(t*48+enemy.abilityReactSeed);if(enemy.abilityReactType==='shock'){x=wave*7;y+=Math.cos(t*55)*4;rotation=wave*.07;filter='brightness(1.75) saturate(1.8) hue-rotate(18deg)';}else if(enemy.abilityReactType==='burn'){x=wave*3;rotation=wave*.055;scaleX=1.08;scaleY=.92;filter='brightness(1.35) saturate(1.7) sepia(.35)';}else{y+=7;rotation=-Math.cos(enemy.facing)*.09;scaleX=1.12;scaleY=.84;filter='brightness(1.35) saturate(1.45) hue-rotate(145deg)';}}
  return {x,y,rotation,scaleX,scaleY,filter,moving};
}

function drawEnemyStatusBack(enemy,width=135,height=105){
  if(enemy.dead)return;if(enemy.burnTime>0)drawAtlasFrame(assets.burnStatusVfx,Math.floor(performance.now()/90+enemy.id)%6,enemy.x,enemy.y+4,width,height,0,.42,'#ff6828');
  if(enemy.wetTime>0)drawAtlasFrame(assets.waterImpactVfx,5,enemy.x,enemy.y+13,width*.82,height*.5,0,.32,'#35e7ff');
  if(enemy.shockTime>0)drawAtlasFrame(assets.shockImpactVfx,4,enemy.x,enemy.y+2,width*.92,height*.72,0,clamp(enemy.shockTime/.55,0,1)*.38,'#d94cff');
}

function drawCoopPlayer(member){
  const remoteHero=HEROES[member.hero]||HEROES.kitsune;const sheet=assets[remoteHero.moveAsset];if(!sheet?.complete||!sheet.naturalWidth)return;
  const rawDirection=directionIndex(member.facing||0),direction=remoteHero.directionMap?.[rawDirection]??rawDirection;const sw=sheet.naturalWidth/4,sh=sheet.naturalHeight/4;const sx=(direction%4)*sw,sy=Math.floor(direction/4)*sh;const h=member.hero==='bamboo'?136:member.hero==='hopscotch'?122:member.hero==='rusty'?120:108,w=h*(sw/sh);
  drawContactShadow(member.x,member.y+13,member.hero==='bamboo'?24:19,member.hero==='bamboo'?6.4:5.3,.3);ctx.save();ctx.translate(member.x,member.y);ctx.shadowColor=remoteHero.accent;ctx.shadowBlur=13;ctx.drawImage(sheet,sx,sy,sw,sh,-w/2,-h*.82,w,h);ctx.restore();ctx.save();ctx.translate(member.x,member.y-h*.96);ctx.textAlign='center';ctx.font='900 10px Inter,sans-serif';ctx.lineWidth=4;ctx.strokeStyle='#070812';ctx.strokeText(member.name||remoteHero.name,0,0);ctx.fillStyle=remoteHero.accent;ctx.fillText(member.name||remoteHero.name,0,0);ctx.restore();
}

function drawBoss(enemy){
  const time=performance.now()/1000;const alpha=enemy.dead?clamp(enemy.deathTime/2.8,0,1):1;const bamboo=enemy.def.biome==='bamboo';const crimson=enemy.def.biome==='crimson';const bossColor=enemy.def.color;
  const stateFrames={enter:0,bossIdle:0,bossWindupSweep:1,bossSweep:2,bossWindupSlam:1,bossSlam:3,bossChannel:4,bossWindupCrossfire:4,bossCrossfire:3,bossWindupSignature:4,bossSignature:3,bossEnrage:5};
  const frame=enemy.dead?5:(stateFrames[enemy.state]??0);
  const motion=enemyMotion(enemy);drawContactShadow(enemy.x,enemy.y+26,crimson?88:bamboo?82:76,crimson?18:bamboo?17:16,.42*alpha);drawEnemyStatusBack(enemy,340,245);
  ctx.save();ctx.translate(enemy.x,enemy.y);
  if(enemy.state==='bossWindupSweep'){
    const p=1-clamp(enemy.stateTime/.95,0,1);ctx.rotate(enemy.facing);ctx.fillStyle=`rgba(255,48,88,${.08+p*.14})`;ctx.strokeStyle=`rgba(255,66,101,${.55+p*.4})`;ctx.lineWidth=8;ctx.shadowColor='#ff315f';ctx.shadowBlur=18;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,enemy.def.attackRange+60,-1.74,1.74);ctx.closePath();ctx.fill();ctx.stroke();
  } else if(enemy.state==='bossWindupSlam'){
    const p=1-clamp(enemy.stateTime/1.25,0,1);ctx.fillStyle=`rgba(255,42,84,${.07+p*.14})`;ctx.strokeStyle=`rgba(255,58,92,${.5+p*.48})`;ctx.lineWidth=9;ctx.setLineDash([42,16,9,14]);ctx.lineDashOffset=-performance.now()/35;ctx.beginPath();ctx.arc(0,12,enemy.def.slamRadius,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([]);
  } else if(enemy.state==='bossChannel'){
    const p=1-clamp(enemy.stateTime/1.45,0,1);ctx.strokeStyle=crimson?`rgba(255,91,39,${.5+p*.5})`:bamboo?`rgba(65,245,218,${.45+p*.5})`:`rgba(140,255,57,${.45+p*.5})`;ctx.lineWidth=6;ctx.shadowColor=bossColor;ctx.shadowBlur=24;for(let i=1;i<=3;i++){ctx.setLineDash([20+i*7,12]);ctx.lineDashOffset=(i%2?1:-1)*performance.now()/45;ctx.beginPath();ctx.arc(0,0,85+i*54+p*18,0,Math.PI*2);ctx.stroke();}ctx.setLineDash([]);
  } else if(enemy.state==='bossWindupCrossfire'||enemy.state==='bossCrossfire'){
    const profile=BOSS_PROFILES[enemy.def.id];const active=enemy.state==='bossCrossfire';const p=active?1:1-clamp(enemy.stateTime/BOSS_PATTERNS.crossfire.windup,0,1);
    ctx.translate(enemy.patternTargetX-enemy.x,enemy.patternTargetY-enemy.y);ctx.globalCompositeOperation='lighter';ctx.shadowColor=bossColor;ctx.shadowBlur=active?42:18;
    for(let i=0;i<profile.crossfireLanes;i++){ctx.save();ctx.rotate(enemy.patternAngle+i*Math.PI/profile.crossfireLanes);ctx.fillStyle=active?'rgba(255,245,216,.55)':`rgba(255,45,124,${.04+p*.1})`;ctx.strokeStyle=active?'#fff4c4':bossColor;ctx.lineWidth=active?12:4+p*6;ctx.setLineDash(active?[]:[32,18,8,15]);ctx.lineDashOffset=-performance.now()/26;ctx.fillRect(-1700,-profile.crossfireWidth,3400,profile.crossfireWidth*2);ctx.beginPath();ctx.moveTo(-1700,0);ctx.lineTo(1700,0);ctx.stroke();ctx.restore();}
    ctx.setLineDash([]);ctx.globalCompositeOperation='source-over';ctx.strokeStyle=active?'#fff4c4':bossColor;ctx.lineWidth=active?10:5;ctx.beginPath();ctx.arc(0,0,42+p*28,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
  const bob=enemy.state==='bossIdle'?Math.sin(time*2.3)*4:0;const pulse=enemy.state==='bossEnrage'?1+Math.sin(time*15)*.035:1;
  ctx.save();ctx.filter=enemy.flash>0?'brightness(2.2) saturate(.35)':motion.filter;ctx.globalAlpha=alpha;ctx.translate(enemy.x+motion.x,enemy.y+bob+motion.y);ctx.rotate(motion.rotation);ctx.scale(pulse*motion.scaleX,pulse*motion.scaleY);
  const bossSheet=crimson?assets.pyreclawShogun:bamboo?assets.moonfangKomainu:assets.jadeguardTanuki;const bossSize=crimson?600:bamboo?540:500;
  drawAtlasFrame(bossSheet,frame,0,crimson?-125:bamboo?-112:-104,bossSize,bossSize,0,1,enemy.bossPhase>=3?'#ff3fbc':bossColor);ctx.restore();ctx.filter='none';
  if(enemy.dead){const p=1-alpha;ctx.save();ctx.translate(enemy.x,enemy.y-80);ctx.globalAlpha=alpha;ctx.strokeStyle=bossColor;ctx.shadowColor=bossColor;ctx.shadowBlur=32;ctx.lineWidth=12;ctx.beginPath();ctx.arc(0,0,80+p*260,0,Math.PI*2);ctx.stroke();ctx.restore();}
}

function drawBambooEnemy(enemy) {
  const sheet=enemy.def.biome==='crimson'?assets.crimsonEnemies:assets.bambooEnemies;
  if (!sheet.complete || !sheet.naturalWidth) return;
  const definition=enemy.def;const alpha=enemy.dead?clamp(enemy.deathTime/.72,0,1):1;
  const attacking=['windup','strike','slam','recover'].includes(enemy.state);const frame=definition.spriteColumn+(attacking?3:0);
  const sw=sheet.naturalWidth/3,sh=sheet.naturalHeight/2;
  const sx=(frame%3)*sw,sy=Math.floor(frame/3)*sh;const baseH=184*definition.scale;const baseW=baseH*(sw/sh);const motion=enemyMotion(enemy);
  const flip=Math.cos(enemy.facing)<0?-1:1;let scaleX=1,scaleY=1,rotation=0;
  if(enemy.state==='enter'){scaleX=1;scaleY=1;}
  if(enemy.state==='windup'){scaleX=1.08;scaleY=.92;}
  if(enemy.state==='strike'){scaleX=1.22;scaleY=.86;rotation=flip*.07;}
  if(enemy.state==='slam'){scaleX=1.18;scaleY=.84;}
  if(enemy.state==='stagger'){rotation=-flip*.12;scaleX=.92;scaleY=1.08;}
  if(enemy.dead){rotation=flip*(1-alpha)*1.05;scaleY=.7+alpha*.3;}
  scaleX*=motion.scaleX;scaleY*=motion.scaleY;rotation+=motion.rotation;drawContactShadow(enemy.x,enemy.y+13,definition.behavior==='heavy'?26:15,definition.behavior==='heavy'?6:4,.31*alpha);drawEnemyStatusBack(enemy,definition.behavior==='heavy'?175:125,definition.behavior==='heavy'?130:90);
  ctx.save();ctx.globalAlpha=enemy.state==='enter'?alpha*clamp(1-enemy.stateTime/1.35,0,1):alpha;ctx.translate(enemy.x+motion.x,enemy.y+motion.y);drawEnemyTelegraph(enemy);ctx.rotate(rotation);ctx.scale(flip*scaleX,scaleY);
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
  const baseH=definition.behavior==='shield'?204:definition.behavior==='bomber'?164:definition.behavior==='assassin'?158:168;const baseW=baseH*(sw/sh);const motion=enemyMotion(enemy);
  let scaleX=motion.scaleX,scaleY=motion.scaleY,rotation=motion.rotation;if(enemy.state==='windup'){scaleX*=1.06;scaleY*=.94;}if(enemy.state==='strike'){scaleX*=1.15;scaleY*=.88;}if(enemy.state==='stagger'){rotation-=.1;scaleX*=.94;scaleY*=1.06;}if(enemy.dead){rotation=(1-alpha)*.92;scaleY=.7+alpha*.3;}
  const shadowX=definition.behavior==='shield'?28:19;drawContactShadow(enemy.x,enemy.y+13,shadowX,shadowX*.21,.32*alpha);drawEnemyStatusBack(enemy,definition.behavior==='shield'?175:130,definition.behavior==='shield'?128:94);
  const mistAlpha=definition.behavior==='assassin'&&enemy.state==='windup' ? .32+clamp(enemy.stateTime/definition.windup,0,1)*.58 : 1;ctx.save();ctx.translate(enemy.x,enemy.y);drawEnemyTelegraph(enemy);ctx.restore();ctx.save();ctx.globalAlpha=alpha*mistAlpha*(enemy.state==='enter'?clamp(1-enemy.stateTime/1.35,0,1):1);ctx.translate(enemy.x+motion.x,enemy.y+motion.y);ctx.rotate(rotation);ctx.scale(scaleX,scaleY);ctx.filter=enemy.flash>0?'brightness(2.55) saturate(.3)':motion.filter;ctx.shadowColor=definition.color;ctx.shadowBlur=enemy.state==='windup'?18:5;ctx.drawImage(sheet,sx,sy,sw,sh,-baseW/2,-baseH*.79,baseW,baseH);ctx.restore();ctx.filter='none';ctx.globalAlpha=1;
  if(definition.behavior==='shield'&&enemy.shield>0&&!enemy.dead){const ratio=enemy.shield/enemy.maxShield;ctx.save();ctx.translate(enemy.x,enemy.y-12);ctx.rotate(enemy.facing);ctx.scale(1,.72);ctx.globalAlpha=.34+ratio*.38;ctx.strokeStyle='#ff5b3a';ctx.shadowColor='#ff3828';ctx.shadowBlur=20;ctx.lineWidth=7;ctx.setLineDash([18,7]);ctx.lineDashOffset=-performance.now()/45;ctx.beginPath();ctx.arc(0,0,69,-.78,.78);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
  if(!enemy.dead)drawEnemyHealth(enemy);
}

function drawEnemy(enemy) {
  if (enemy.state === 'waiting') return;
  if(enemy.eliteId&&!enemy.dead)drawEliteAura(enemy);
  if(enemy.def.behavior==='boss'){drawBoss(enemy);return;}
  if(['bellweaverCat','powderkegToad','gatewardenRhino','mistclawLynx'].includes(enemy.type)){drawSpecialEnemy(enemy);return;}
  if(enemy.def.biome==='bamboo'||enemy.def.biome==='crimson'){drawBambooEnemy(enemy);return;}
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
  ctx.save(); ctx.globalAlpha = alpha*(enemy.state==='enter'?clamp(1-enemy.stateTime/1.35,0,1):1); ctx.translate(enemy.x+motion.x, enemy.y+motion.y); drawEnemyTelegraph(enemy);
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

function drawEffects() {
  for(const signature of effects.guardianSignatures){
    const p=1-signature.life/signature.maxLife;const impact=signature.stage===1;const frame=signature.row*3+(impact?(p>.58?2:1):0);const size=signature.radius*(impact?2.95:2.5);drawGridAtlasFrame(assets.guardianSignatureVfx,frame,3,3,signature.x,signature.y-24,size,size*.72,0,clamp(signature.life/.12,0,1)*(impact?1:.82),signature.color);
    if(!impact){ctx.save();ctx.translate(signature.x,signature.y);ctx.scale(1,.58);ctx.strokeStyle=signature.color;ctx.shadowColor=signature.color;ctx.shadowBlur=18;ctx.lineWidth=5+p*6;ctx.setLineDash([30,14,8,11]);ctx.lineDashOffset=-performance.now()/24;ctx.beginPath();ctx.arc(0,0,signature.radius*(.72+p*.28),0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
  }
  for(const hazard of effects.enemyHazards){
    const p=1-hazard.life/hazard.maxLife;if(hazard.type==='bomb')drawAtlasFrame(assets.specialEnemyVfx,p<.58?2:3,hazard.x,hazard.y-34,116+p*34,116+p*34,0,.96,hazard.color);ctx.save();ctx.translate(hazard.x,hazard.y);ctx.scale(1,.56);ctx.shadowColor=hazard.color;ctx.shadowBlur=22;ctx.fillStyle=`${hazard.color}${Math.round((.08+p*.13)*255).toString(16).padStart(2,'0')}`;ctx.strokeStyle=hazard.color;ctx.lineWidth=5+p*6;ctx.setLineDash([24,11,5,10]);ctx.lineDashOffset=-performance.now()/28;ctx.beginPath();ctx.arc(0,0,hazard.radius*(.45+p*.55),0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([]);for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4+p*1.3);ctx.fillStyle=hazard.color;ctx.beginPath();ctx.moveTo(hazard.radius-8,0);ctx.lineTo(hazard.radius-31,-9);ctx.lineTo(hazard.radius-31,9);ctx.closePath();ctx.fill();ctx.restore();}ctx.restore();
  }
  for (const shot of effects.playerShots) {
    const angle=Math.atan2(shot.vy,shot.vx);const frame=shot.arrow||shot.trickshot?Math.floor(performance.now()/65)%3:2+Math.floor(performance.now()/65)%3;
    const scale=shot.radius>=12?1.24:1;
    const shotAsset=shot.arrow?assets.hopscotchArrow:shot.trickshot?assets.trickshotVfx:assets.blasterShotVfx;const shotWidth=shot.arrow?168:shot.trickshot?116:112;const shotHeight=shot.arrow?72:shot.trickshot?92:70;
    if(!drawAtlasFrame(shotAsset,frame,shot.x,shot.y,shotWidth*scale,shotHeight*scale,angle,clamp(shot.life/.12,0,1),shot.color||'#42ecff')){
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
    if(projectile.crimson)drawAtlasFrame(assets.crimsonCombatVfx,projectile.vfxFrame??1,projectile.x,projectile.y,projectile.vfxFrame===4?210:130,projectile.vfxFrame===4?118:130,angle,clamp(projectile.life/.2,0,1),projectile.color);
    else drawAtlasFrame(assets.spiritArrowVfx,frame,projectile.x,projectile.y,132,72,angle,clamp(projectile.life/.2,0,1),projectile.color);
  }
  for (const link of effects.shockLinks) {
    const dx=link.x2-link.x1,dy=link.y2-link.y1;const length=Math.hypot(dx,dy);const p=1-link.life/link.maxLife;
    drawAtlasFrame(assets.shockLinkVfx,Math.floor(p*6),(link.x1+link.x2)/2,(link.y1+link.y2)/2,length,94,Math.atan2(dy,dx),clamp(link.life/.12,0,1),'#d94cff');
  }
  for (const effect of effects.spriteEffects) {
    const p=1-effect.life/effect.maxLife; const sheet=assets[effect.asset];
    drawAtlasFrame(sheet,effect.fixedFrame??Math.floor(p*6),effect.x,effect.y,effect.width,effect.height,effect.rotation||0,clamp(effect.life/.1,0,1),effect.glow);
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

function frame(now) {
  const screen = resize();
  const dt = Math.min((now - lastTime) / 1000, .033);
  lastTime = now;
  update(dt, screen); draw(screen);
  requestAnimationFrame(frame);
}

window.addEventListener('resize', resize);
window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if(state==='settings'&&(key==='escape'||key==='o')){closeSettings();event.preventDefault();return;}
  if(state==='paused'&&key==='escape'){resumeGame();event.preventDefault();return;}
  if(key==='o'&&['preview','hub','playing','dojo','paused'].includes(state)){openSettings(state);event.preventDefault();return;}
  if(state==='codex'&&(key==='escape'||key==='k')){closeCodex();event.preventDefault();return;}
  if(key==='k'&&['preview','hub','playing','dojo'].includes(state)){openCodex(state==='preview'?'heroes':'enemies');event.preventDefault();return;}
  if(state==='hubMenu'&&(key==='escape'||key==='enter')){closeHubMenu();event.preventDefault();return;}
  if(state==='story'&&key==='enter'){continueStory();event.preventDefault();return;}
  if(state==='route'&&['1','2','3'].includes(key)){selectRoute(Number(key)-1);event.preventDefault();return;}
  if(state==='event'&&['1','2'].includes(key)){chooseRouteEvent(Number(key)-1);event.preventDefault();return;}
  if(state==='guardianReward'&&['1','2','3'].includes(key)){chooseGuardianReward(Number(key)-1);event.preventDefault();return;}
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
for(const button of document.querySelectorAll('[data-codex-tab]'))button.addEventListener('click',()=>{activeCodexId=null;renderCodex(button.dataset.codexTab);});
document.querySelector('#restart-button').addEventListener('click', begin);
document.querySelector('#story-button').addEventListener('click', continueStory);
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

applyHeroUi();
resetGame();
refreshProfileUi();
refreshSettingsUi();
refreshContinueRunUi();
refreshCoopUi();
requestAnimationFrame(frame);

