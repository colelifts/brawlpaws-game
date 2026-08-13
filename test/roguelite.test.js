import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BOSS_PATTERNS, BOSS_PROFILES, ENCOUNTERS } from '../src/data.js';
import { encounterActiveLimit } from '../src/math.js';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const game=readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
const data=readFileSync(new URL('../src/data.js',import.meta.url),'utf8');
const styles=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('the run includes route and shop interaction surfaces',()=>{
  for(const id of ['route-screen','route-grid','shop-screen','shop-grid','gold-token'])assert.match(html,new RegExp(`id="${id}"`));
  for(const fn of ['openRoute','selectRoute','openShop','buyShopItem','grantRelic'])assert.match(game,new RegExp(`function ${fn}\\(`));
});

test('route rewards cover risk, recovery, economy, relics, and upgrades',()=>{
  for(const node of ['combat','elite','heal','shop','treasure','shrine','event','secret'])assert.match(game,new RegExp(`id:'${node}'`));
  for(const relic of ['luckyCoin','spiritMask','thunderSeal','bloodVial','dragonScale','rainbowFeather'])assert.match(game,new RegExp(`id:'${relic}'`));
  assert.match(game,/rewardScale:2/);
  assert.match(game,/player\.gold-=item\.price/);
  assert.match(game,/encounter\.startWaveAfterUpgrade/);
});

test('the extended campaign has physical room rewards and destructible loot',()=>{
  for(const fn of ['spawnRoomInteractable','useRoomInteractable','spawnRoomDestructibles','damageDestructibles','breakDestructible','drawRoomInteractable','drawDestructible'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/PHYSICAL_ROUTE_NODES=new Set/);
  assert.match(game,/wave\.targetCount\|\|wave\.roster\.length/);
  assert.match(game,/currentRouteChoices=ROUTE_SETS\[\(nextWave-1\)%ROUTE_SETS\.length\]/);
  assert.match(game,/CLAIM YOUR ROUTE REWARD/);
  for(const count of [72,112,150])assert.match(data,new RegExp(`targetCount:${count}`));
});

test('level ups support weighted rarity, rerolls, and a recovery skip',()=>{
  for(const id of ['reroll-upgrades','reroll-cost','skip-upgrade'])assert.match(html,new RegExp(`id="${id}"`));
  for(const rarity of ['common','rare','epic'])assert.match(game,new RegExp(`${rarity}:\\{name:`));
  for(const fn of ['rarityForUpgrade','weightedUpgradeIndex','rollUpgradeChoices','rerollUpgrades','skipUpgrade'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/rerolls:1/);
  assert.match(game,/player\.gold\+=20/);
  assert.match(game,/player\.health=Math\.min\(player\.maxHealth,player\.health\+18\)/);
  assert.match(game,/const earnedUnlock=pool\.find/);
  for(const id of ['unlockUndertow','unlockFoxfire','unlockHeart','unlockShock'])assert.match(game,new RegExp(`upgrade\.id==='${id}'`));
});

test('upgrade offers show exact build changes instead of hidden prose',()=>{
  for(const helper of ['upgradeOfferClass','upgradeComparison','upgradeSynergyPreview'])assert.match(game,new RegExp(`function ${helper}\\(`));
  assert.match(game,/class="upgrade-comparison"/);
  assert.match(game,/class="upgrade-type">\$\{upgradeOfferClass\(upgrade\)\}/);
  assert.doesNotMatch(game,/class="upgrade-detail"/);
  assert.match(game,/class="upgrade-comparison">\$\{upgradeComparison\(upgrade\)\}/);
  assert.match(game,/ABILITIES\.length|Object\.keys\(ABILITIES\)\.length/);
  assert.doesNotMatch(styles,/\.upgrade-card \.upgrade-description\s*\{\s*display\s*:\s*none/);
  assert.match(styles,/choice-atlas-v1\.png/);
  assert.match(styles,/background-size:400% 400%/);
  for(const family of ['spiritMomentum','deepReserves','moonPiercer','bankShot','scatterBore'])assert.match(game,new RegExp(`['"]${family}['"]`));
});

test('combat presentation uses licensed recordings and whole-body hit reactions',()=>{
  for(const asset of ['dash-whoosh.mp3','impact-heavy.mp3','impact-strike.mp3','ability-heal.mp3','upgrade-awaken.mp3'])assert.match(game,new RegExp(asset.replace('.','\\.')));
  for(const setting of ['masterVolume','musicVolume','sfxVolume','abilityVolume','uiVolume'])assert.match(html,new RegExp(`data-audio-setting="${setting}"`));
  for(const helper of ['playSfx','registerEnemyHitReaction','enemyMotion'])assert.match(game,new RegExp(`function ${helper}\\(`));
  assert.match(game,/registerEnemyHitReaction\(enemy,direction,'ability',damage\)/);
  assert.match(game,/registerEnemyHitReaction\(enemy,direction,critical\?'critical':'projectile',damage\)/);
  assert.match(game,/enemy\.hitReactTime=Math\.max\(0/);
  assert.match(game,/const speed=Math\.hypot\(enemy\.vx\|\|0,enemy\.vy\|\|0\)/);
  assert.match(game,/playSfx\('stomp'/);
  assert.match(game,/const lastSfxAt=new Map\(\)/);
  assert.doesNotMatch(game,/createOscillator|function playTone/);
});

test('Chrome performance, adaptive audio, and readable choice art are production-wired',()=>{
  assert.match(game,/Math\.min\(window\.devicePixelRatio \|\| 1, 1\.25\)/);
  assert.match(game,/window\.__BRAWLPAWS_PERF__/);
  assert.match(game,/drawEffects\(false\)[\s\S]+const renderables[\s\S]+drawEffects\(true\)/);
  assert.match(game,/const MUSIC_TRACKS=/);
  for(const track of ['music-menu-upbeat.mp3','music-combat-orchestral.mp3','music-combat-rush.ogg','music-boss-oh.mp3'])assert.match(game,new RegExp(track.replace('.','\\.')));
  for(const helper of ['musicTrackForState','switchMusic','updateAudioDirector','routeArtFrame','shopArtFrame','choiceArtFrame'])assert.match(game,new RegExp(`function ${helper}\\(`));
  assert.match(game,/class="choice-art node-icon"/);
  assert.match(game,/class="choice-art event-icon"/);
  assert.match(game,/class="choice-art guardian-icon"/);
  assert.match(game,/class="choice-art item-icon"/);
});

test('all six campaign realms and guardians own adaptive soundtrack identities',()=>{
  for(const track of ['jade','bamboo','crimson','storm','neon','shadow','guardianJade','guardianBamboo','guardianCrimson','guardianStorm','guardianNeon','guardianShadow'])assert.match(game,new RegExp(`${track}:\\{src:`));
  assert.match(game,/const realms=\['Jade','Bamboo','Crimson','Storm','Neon','Shadow'\]/);
  assert.match(game,/return `guardian\$\{realms\[chapterIndex\]\}`/);
  assert.match(game,/musicPlayers\[i\]\.dataset\.track/);
  assert.match(game,/document\.documentElement\.dataset\.musicTrack=trackId/);
  for(const file of ['music-bamboo-heartfelt.ogg','music-storm-ocean.ogg','music-neon-robotic.ogg','music-shadow-dark.mp3','music-boss-heavy.mp3'])assert.match(game,new RegExp(file.replace('.','\\.')));
});

test('each chapter has checkpoint-safe mid-run story continuity',()=>{
  for(const chapterId of ['jadeChapter','bambooChapter','crimsonChapter'])assert.match(game,new RegExp(`${chapterId}:\\{accent:[\\s\\S]{0,4000}interlude2:[\\s\\S]{0,4000}interlude4:`));
  assert.match(game,/encounter\.wave===1\)showStory\('interlude2'\)/);
  assert.match(game,/encounter\.wave===3\)showStory\('interlude4'\)/);
  assert.match(game,/interlude2'\)openRoute\(2\)/);
  assert.match(game,/interlude4'\)openRoute\(4\)/);
  for(const id of ['story-progress','story-objective'])assert.match(html,new RegExp(`id="${id}"`));
});

test('the Mission Board tracks and rewards persistent campaign contracts',()=>{
  for(const id of ['spiritCull','eliteBreakers','foxfireHunt','sealRunner','guardianOath'])assert.match(game,new RegExp(`id:'${id}'`));
  for(const helper of ['recordContractProgress','renderMissionBoard','claimCampaignContract','contractClaimed'])assert.match(game,new RegExp(`function ${helper}\\(`));
  assert.match(game,/recordContractProgress\('spiritCull'\)/);
  assert.match(game,/enemy\.eliteId\)recordContractProgress\('eliteBreakers'\)/);
  assert.match(game,/enemy\.burnTime>0\)recordContractProgress\('foxfireHunt'\)/);
  assert.match(game,/recordContractProgress\('sealRunner'\)/);
  assert.match(game,/recordContractProgress\('guardianOath'\)/);
  assert.match(game,/profile\.spiritShards\+=contract\.reward/);
  assert.match(styles,/\.contract-bar i\{display:block;width:var\(--contract-progress\)/);
});

test('earned ability ladder replaces Tidal Slash with a readable Undertow trap',()=>{
  assert.match(data,/spiritBlaster:[\s\S]{0,100}damage:\s*7/);
  assert.match(data,/undertowWell:[^\n]*unlockLevel:\s*2/);
  assert.match(data,/foxfireVolley:[^\n]*unlockLevel:\s*4/);
  assert.match(data,/wildHeart:[^\n]*unlockLevel:\s*6/);
  assert.match(data,/shockPaws:[^\n]*unlockLevel:\s*8/);
  assert.match(game,/unlockedAbilities:\s*new Set\(\)/);
  assert.match(game,/xpToNext:\s*48/);
  assert.match(game,/debugSystem==='levelup'[^\n]*encounter\.startWaveAfterUpgrade=0/);
  assert.match(game,/assets\/vfx\/undertow-well-v2\.png/);
  assert.match(game,/vortex\.definition\.collapseDamage/);
  assert.match(game,/enemy\.vx\*=Math\.exp\(-8\*dt\)/);
  assert.doesNotMatch(game,/if\(player\.unlockedAbilities\.has\('shockPaws'\)\).*unlockedAbilities\.add\('shockPaws'\)/);
  assert.doesNotMatch(game,/if\(player\.unlockedAbilities\.has\('foxfireVolley'\)\).*unlockedAbilities\.add\('foxfireVolley'\)/);
  const withoutSaveMigration=game.replace(/function restorePlayerCheckpoint[\s\S]*?function resumeSavedRun/,'function resumeSavedRun');
  assert.doesNotMatch(withoutSaveMigration,/\briptide\b/i);
  assert.doesNotMatch(game,/tidal[-A-Z]/i);
});

test('late campaign armies compound enemy count, pursuit, and spawn pressure',()=>{
  const counts=Object.values(ENCOUNTERS).map((chapter)=>chapter.waves.map((wave)=>wave.targetCount||wave.roster.length));
  assert.equal(counts[0][0],4);
  assert.equal(counts[0].at(-1),72);
  assert.equal(counts[1].at(-1),112);
  assert.equal(counts[2].at(-1),150);
  for(const chapter of Object.values(ENCOUNTERS)){
    assert.ok(chapter.waves.at(-1).speedScale>chapter.waves[0].speedScale*1.75);
    assert.ok(chapter.waves.at(-1).spawnRate<chapter.waves[0].spawnRate*.18);
  }
  const math=readFileSync(new URL('../src/math.js',import.meta.url),'utf8');
  for(const fn of ['activeEnemyLimit','encounterActiveLimit','cappedWardPressure'])assert.match(game+math,new RegExp(`function ${fn}\\(`));
  assert.match(game,/activationSlots=Math\.max\(0,activeEnemyLimit\(\)-activeCombatants\.length\)/);
  assert.match(game,/activationSlots--;activeCombatants\.push\(enemy\)/);
});

test('hero-specific upgrades create distinct gunner and tank build paths',()=>{
  for(const id of ['spiritCylinder','phaseRounds','foxstepMastery','ironBelly','scatterBore','guardianHide']){
    assert.match(game,new RegExp(`id:'${id}'`));
    assert.match(game,new RegExp(`${id}:0`));
  }
  assert.match(game,/selectedHeroId==='kitsune'/);
  assert.match(game,/selectedHeroId==='bamboo'/);
  assert.match(game,/knockbackMultiplier:\s*1/);
  assert.match(game,/braceDelay:\s*\.72/);
  assert.match(game,/braceDamageMultiplier:\s*\.8/);
  assert.match(game,/weapon\.knockback\*player\.knockbackMultiplier/);
});

test('each hero earns a late-run weapon capstone with distinct projectile behavior',()=>{
  for(const id of ['phaseNova','siegeLotus','moonConstellation','deadeyeCircuit','thunderheadArray']){
    assert.match(game,new RegExp(`id:'${id}'`));
    assert.match(game,new RegExp(`${id}:'epic'`));
  }
  assert.match(game,/player\.level>=7&&selectedHeroId==='kitsune'/);
  assert.match(game,/player\.level>=7&&selectedHeroId==='bamboo'/);
  assert.match(game,/function triggerWeaponBlast\(/);
  assert.match(game,/function spawnMoonSplinters\(/);
  assert.match(game,/guaranteedCrit:deadeyeCircuit/);
  assert.match(game,/function applyConductiveHit\(/);
  assert.match(game,/const thunderheadArray=evolution==='thunderheadArray'/);
  assert.match(game,/restored\.upgradeRanks=\{\.\.\.player\.upgradeRanks,\.\.\.saved\.upgradeRanks\}/);
  assert.match(game,/conductiveStacks,conductiveTime,bossPhase/);
  assert.match(game,/weaponEvolution:null/);
  for(const name of ['PHASE NOVA','SIEGE LOTUS','MOON CONSTELLATION','DEADEYE CIRCUIT'])assert.match(game,new RegExp(name));
  assert.match(game,/debugSystem==='capstone'/);
  assert.match(game,/debugSystem==='room6'/);
  assert.match(game,/debugSystem==='opening'/);
});

test('elemental recipes unlock visible combat-changing synergies',()=>{
  assert.match(html,/id="synergy-strip"/);
  for(const synergy of ['steamBurst','stormCurrent','guardianTempest','twinCinders'])assert.match(game,new RegExp(`id:'${synergy}'`));
  for(const fn of ['resolveSynergies','refreshSynergyHud','triggerSteamBurst'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/player\.synergies\.has\('stormCurrent'\)/);
  assert.match(game,/player\.synergies\.has\('guardianTempest'\)/);
  assert.match(game,/player\.synergies\.has\('twinCinders'\)/);
});

test('Shock Paws is a long global ultimate that resolves every active enemy',()=>{
  assert.match(game,/const targets = enemies\.filter\(\(enemy\)=>!enemy\.dead&&enemy\.state!==\'waiting\'\)/);
  assert.match(game,/for \(const enemy of targets\)/);
  assert.match(data,/shockPaws:[^\n]*damage:\s*16/);
  assert.match(data,/shockPaws:[^\n]*duration:\s*5\.4/);
});

test('late waves add visible elite mutations and counter-build upgrades',()=>{
  for(const id of ['swift','bulwark','frenzied','volatile','splitter'])assert.match(data,new RegExp(`${id}: \\{ id:'${id}'`));
  for(const fn of ['applyEnemyStatus','resolveEnemyDamage','eliteModifierFor','drawEliteAura'])assert.match(game,new RegExp(`function ${fn}\\(`));
  for(const id of ['wardbreaker','spiritHunter','spiritCatalyst','pressureChamber','headhunter','keenEye'])assert.match(game,new RegExp(`id:'${id}'`));
  for(const relic of ['wardBell','oniContract'])assert.match(game,new RegExp(`id:'${relic}'`));
  assert.match(game,/effects\.enemyHazards\.push/);
  assert.match(game,/splitDepth<1/);
  assert.match(game,/eliteId:eliteModifierFor/);
  assert.match(game,/debugSystem==='elites'/);
});

test('shared combat statuses support player and enemy ownership plus build choices',()=>{
  for(const id of ['bleed','curse','shield'])assert.match(data,new RegExp(`${id}: \\{ id:'${id}'`));
  for(const fn of ['applyPlayerStatus','consumeEnemyCurse'])assert.match(game,new RegExp(`function ${fn}\\(`));
  for(const id of ['razorFang','hollowHex','spiritAegis']){assert.match(game,new RegExp(`id:'${id}'`));assert.match(game,new RegExp(`${id}:0`));}
  for(const relic of ['crimsonThread','moonMirror','lanternWard'])assert.match(game,new RegExp(`id:'${relic}'`));
  assert.match(game,/player\.spiritShield=Math\.max/);
  assert.match(game,/if\(player\.bleedTime>0\)/);
  assert.match(game,/applyPlayerStatus\('curse',projectile\.curseDuration/);
  assert.match(game,/debugSystem==='statuses'/);
});

test('the startup loader cannot strand Chrome behind nonessential late-game art',()=>{
  assert.match(game,/const STARTUP_LOADING_LIMIT_MS=3200/);
  assert.match(game,/deferredAssetSources\.push\(\[key,source\]\)/);
  assert.match(game,/function loadRoomArena\(roomDefinition\)/);
  assert.match(game,/image\.addEventListener\('error',\(\)=>settleStartupAsset\(key\)/);
  assert.match(game,/window\.setTimeout\(releaseLoadingScreen,STARTUP_LOADING_LIMIT_MS\)/);
  assert.doesNotMatch(game,/assetsLoaded === Object\.keys\(assetSources\)\.length/);
});

test('corruption director preserves the slow opening and escalates late-room pressure',()=>{
  for(const id of ['corruption-panel','corruption-tier','corruption-fill','corruption-copy'])assert.match(html,new RegExp(`id="${id}"`));
  for(const tier of ['dormant','stirring','hunting','ravenous','cataclysm','apocalypse'])assert.match(game,new RegExp(`id:'${tier}'`));
  for(const fn of ['expectedPowerForProgress','currentBuildPower','createCorruptionDirector','serializeCorruptionDirector','refreshCorruptionHud','spawnCorruptionWarband','recordCorruptionKill','updateCorruptionDirector'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/Math\.floor\(progress\/3\)/);
  assert.match(game,/authoredCount\*\(difficulty\.enemyCountScale\|\|1\)\*corruption\.count/);
  assert.match(game,/difficulty\.healthScale\*corruption\.health/);
  assert.match(game,/difficulty\.speedScale\*corruption\.speed/);
  assert.match(game,/difficulty\.damageScale\*corruption\.damage/);
  assert.match(game,/corruptionDirector\.definition\.reinforcements\+coopPressure\(\)\.reinforcements<=corruptionDirector\.reinforcementsUsed/);
  assert.match(game,/enemy\.huntTime=Math\.max/);
  assert.match(game,/const hunting=enemy\.huntTime>0/);
  assert.match(game,/updateCorruptionDirector\(dt\)/);
});

test('online co-op exposes room codes, live authority, and party-size pressure scaling',()=>{
  for(const id of ['coop-start','coop-status','coop-code','coop-create','coop-join','coop-leave','coop-roster'])assert.match(html,new RegExp(`id="${id}"`));
  for(const fn of ['coopPartySize','coopIsHost','coopPressure','connectCoop','leaveCoop','sendCoop','handleCoopMessage','applyRemoteAction','applyCoopSignal','applyCoopSnapshot','updateCoop','drawCoopPlayer'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/peer\.connect\(coopPeerId\(clean\)/);
  assert.match(game,/peerjs@1\.5\.5/);
  assert.match(game,/health:1\+extra\*\.62/);
  assert.match(game,/count:1\+extra\*\.34/);
  assert.match(game,/elite:extra\*\.07/);
  assert.match(game,/corruption\.count\*party\.count/);
  assert.match(game,/corruption\.health\*party\.health/);
  assert.match(game,/corruption\.damage\*party\.damage/);
});

test('specialist enemies use dedicated animation and attack assets',()=>{
  for(const id of ['bellweaverCat','powderkegToad','gatewardenRhino','mistclawLynx'])assert.match(data,new RegExp(`${id}: \\{`));
  for(const fn of ['summonBellweaverGuard','throwPowderkegBomb','drawSpecialEnemy','startSpecialistShowcase'])assert.match(game,new RegExp(`function ${fn}\\(`));
  for(const asset of ['bellweaver-cat.png','powderkeg-toad.png','gatewarden-rhino.png','mistclaw-lynx.png','special-enemy-vfx.png'])assert.match(game,new RegExp(asset.replace('.','\\.')));
  assert.match(game,/const frontalGuard=enemy\.def\.behavior==='shield'/);
  assert.match(game,/enemy\.shield>0&&hitsFront/);
  assert.match(game,/type:'bomb'/);
  assert.match(game,/enemy\.blinkX=player\.x\+through\.x\*definition\.blinkOffset/);
  assert.match(game,/spawnWord\(enemy\.x,enemy\.y-70,'MIST STEP!'/);
  assert.match(game,/\['gatewardenRhino','mistclawLynx','gongwing'/);
  assert.match(game,/\['mossBrute','bambooStalker','powderkegToad'/);
  assert.match(game,/\['armoredBoar','jadeBrawler','bellweaverCat'/);
  assert.match(game,/debugSystem==='specialists'/);
});

test('late specialist bodies cast counterable world-space attacks',()=>{
  for(const asset of ['tidechant-heron-v1.png','kernel-hacker-tanuki-v1.png','moonveil-seer-v1.png'])assert.match(game,new RegExp(asset.replace('.','\\.')));
  for(const fn of ['castTidechantSurge','plantKernelSnare','castMoonveilCurse'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/type:'kernelSnare'/);
  assert.match(game,/SPRINT TO CLEANSE!/);
  assert.match(game,/CURSE CLEANSED!/);
  assert.match(game,/debugParams\.get\('set'\)==='late'/);
});

test('story and secret route events present consequential branching choices',()=>{
  for(const id of ['event-screen','event-title','event-copy','event-quote','event-choice-grid'])assert.match(html,new RegExp(`id="${id}"`));
  for(const fn of ['openRouteEvent','chooseRouteEvent','finishRouteEvent'])assert.match(game,new RegExp(`function ${fn}\\(`));
  for(const title of ['A HERO WITHOUT A SHADOW','YOUR REFLECTION ATTACKS FIRST','THE ARSENAL BENEATH THE ROOTS','FOUR POWERS, ONE REFLECTION'])assert.match(game,new RegExp(title));
  assert.match(game,/rewardScale:1\.9/);
  assert.match(game,/damageTakenMultiplier\*=1\.08/);
});

test('title and Hero Shrine support persistent hero selection',()=>{
  for(const hero of ['kitsune','bamboo','hopscotch','rusty','zap','nomi'])assert.match(html,new RegExp(`data-hero="${hero}"`));
  for(const id of ['hero-portrait','hero-name','hero-role','weapon-name','dash-name','start-hero-name'])assert.match(html,new RegExp(`id="${id}"`));
  for(const fn of ['applyHeroUi','selectHero','drawHero'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/selectedHero:'kitsune'/);
  assert.match(game,/data-hub-hero/);
  assert.match(game,/damageTakenMultiplier:heroDef\.damageTakenMultiplier/);
  assert.match(game,/knockbackResistance:heroDef\.knockbackResistance/);
  assert.match(game,/unlockedAbilities: new Set\(\)/);
  assert.doesNotMatch(game,/weapon\.critChance/);
});

test('Nomi is an earned returning-glaive hero with a homing capstone',()=>{
  for(const asset of ['nomi-portrait-v1.png','nomi-crane-v1.png','nomi-fire-v1.png','nomi-states-v1.png','nomi-glaive-vfx-v1.png'])assert.match(game+html,new RegExp(asset.replace('.','\\.')));
  assert.match(game,/profile\.unlockedHeroes\.push\('nomi'\)/);
  assert.match(game,/function turnGlaiveForReturn\(/);
  assert.match(game,/shot\.hitIds=new Set\(\)/);
  assert.match(game,/shot\.glaive&&!shot\.returning&&shot\.life<=0/);
  assert.match(game,/function spawnSkyfeathers\(/);
  assert.match(game,/homingTarget:target/);
  for(const id of ['moonEdge','secondPassage','cranePoise','skyfeatherConstellation'])assert.match(game,new RegExp(`id:'${id}'`));
});

test('Rusty is an Ascension-earned twin-revolver ricochet hero',()=>{
  for(const asset of ['rusty-portrait.png','rusty-trickshot-alpha.png','rusty-fire-alpha.png','trickshot-round-alpha.png'])assert.match(game+html,new RegExp(asset.replace('.','\\.')));
  assert.match(game,/profile\.ascensionClears\+\+/);
  assert.match(game,/profile\.unlockedHeroes\.push\('rusty'\)/);
  assert.match(game,/function redirectTrickshot\(/);
  assert.match(game,/weapon\.baseVolleys/);
  assert.match(game,/shot\.ricochets--/);
  assert.match(game,/TWIN WEAPONS: INHERENT/);
  for(const id of ['bankShot','loadedDice','quickdraw'])assert.match(game,new RegExp(`id:'${id}'`));
});

test('Hopscotch is an earned directional archer with a timed piercing release',()=>{
  for(const asset of ['hopscotch-portrait.png','hopscotch-archer-alpha.png','hopscotch-fire-alpha.png','hopscotch-arrow-alpha.png'])assert.match(game+html,new RegExp(asset.replace('.','\\.')));
  assert.match(game,/unlockedHeroes:\['kitsune','bamboo'\]/);
  assert.match(game,/profile\.unlockedHeroes\.push\('hopscotch'\)/);
  assert.match(game,/profile\.campaignClears>=2&&!profile\.unlockedHeroes\.includes\('zap'\)/);
  assert.match(game,/function releaseWeaponVolley\(/);
  assert.match(game,/weapon\.releaseDelay/);
  assert.match(game,/shot\.pierces--/);
  assert.match(game,/shot\.arrow\?assets\.hopscotchArrow/);
  assert.match(game,/fireStage = firing && entity\.attack\?\.time > \(weapon\.releaseDelay\|\|\.045\)/);
  for(const id of ['moonPiercer','perfectDraw','glassFang','spiritMomentum','guardianHunter','deepReserves'])assert.match(game,new RegExp(`id:'${id}'`));
  for(const relic of ['moonPearl','phoenixPlume','riverMirror','guardianFang'])assert.match(game,new RegExp(`id:'${relic}'`));
  assert.match(game,/guardianDamageMultiplier/);
  assert.match(game,/critDamageMultiplier/);
});

test('title hero comparison and boss scheduler consume data definitions',()=>{
  for(const id of ['hero-comparison','comparison-ratings','comparison-weapon','comparison-weapon-tags','comparison-weapon-copy','comparison-weapon-stats'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(game,/Object\.entries\(heroDef\.ratings\)/);
  assert.match(game,/weapon\.tags\.join/);
  assert.match(game,/const profile=BOSS_PROFILES\[enemy\.def\.id\]/);
  assert.match(game,/const schedule=profile\.schedules\[enemy\.bossPhase\]/);
  assert.match(game,/const pattern=BOSS_PATTERNS\[schedule/);
});

test('the persistent Codex records encountered spirits and exposes real counterplay',()=>{
  for(const id of ['codex-screen','codex-grid','codex-detail','codex-progress','codex-button','close-codex'])assert.match(html,new RegExp(`id="${id}"`));
  for(const tab of ['heroes','enemies','guardians','statuses'])assert.match(html,new RegExp(`data-codex-tab="${tab}"`));
  for(const fn of ['codexArtFor','codexEntries','discoverEnemy','renderCodex','renderCodexDetail','openCodex','closeCodex'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/discoveredEnemies:\['groveMinion'\]/);
  assert.match(game,/discoveredGuardians:\[\]/);
  assert.match(game,/discoverEnemy\(definition\)/);
  assert.match(game,/debugSystem==='codex'/);
  assert.match(game,/data-open-codex/);
});

test('guardians gain a telegraphed phase-specific sealing crossfire',()=>{
  assert.match(data,/crossfire: \{ id:'crossfire'/);
  for(const profile of ['jadeguardTanuki','moonfangKomainu','pyreclawShogun'])assert.match(data,new RegExp(`${profile}:[\\s\\S]{0,260}crossfireDamage:[\\s\\S]{0,520}'crossfire'`));
  for(const state of ['bossWindupCrossfire','bossCrossfire'])assert.match(game,new RegExp(state));
  assert.match(game,/function fireBossCrossfire\(/);
  assert.match(game,/lineDistance<profile\.crossfireWidth\+player\.radius/);
  assert.match(game,/pattern\.id==='crossfire'/);
});

test('every guardian owns a distinct animated signature attack',()=>{
  for(const name of ['Thousand-Bell Spiral','Lunar Hunt','Oni Eruption'])assert.match(data,new RegExp(name));
  for(const fn of ['prepareBossSignature','resolveBossSignature','drawGridAtlasFrame'])assert.match(game,new RegExp(`function ${fn}\\(`));
  for(const state of ['bossWindupSignature','bossSignature'])assert.match(game,new RegExp(state));
  assert.match(game,/guardian-signatures\.png/);
  assert.match(game,/effects\.guardianSignatures\.push/);
  assert.match(game,/enemy\.def\.id==='jadeguardTanuki'/);
  assert.match(game,/enemy\.def\.id==='moonfangKomainu'/);
  assert.match(game,/enemy\.def\.id==='pyreclawShogun'/);
  assert.match(game,/debugSystem==='signature'/);
});

test('the campaign exposes difficulty selection and persistent profile rewards',()=>{
  for(const id of ['spirited','ferocious','nightmare','ascension'])assert.match(html,new RegExp(`data-difficulty="${id}"`));
  for(const id of ['profile-summary','result-reward'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(game,/brawlpaws-profile-v1/);
  assert.match(game,/localStorage\.setItem/);
  assert.match(game,/profile\.campaignClears\+\+/);
  assert.match(game,/ascensionRank/);
  assert.match(game,/enemyCountScale/);
  assert.match(game,/spawnRateScale/);
  assert.match(game,/SPIRIT SHARDS/);
});

test('active campaigns persist a versioned room-safe checkpoint and can resume',()=>{
  for(const id of ['continue-run','continue-run-copy','pause-screen','resume-button','save-title-button'])assert.match(html,new RegExp(`id="${id}"`));
  for(const fn of ['serializePlayerCheckpoint','validRunSnapshot','loadRunCheckpoint','saveRunCheckpoint','clearRunCheckpoint','restorePlayerCheckpoint','resumeSavedRun','pauseGame','resumeGame','returnToTitle'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/brawlpaws-run-v1/);
  assert.match(game,/const RUN_VERSION=1/);
  assert.match(game,/encounter\.modifiers\.missionState=serializeMissionState\(\)/);
  assert.match(game,/saveRunCheckpoint\(\{kind:'wave',wave:index,modifiers:encounter\.modifiers\}\)/);
  assert.match(game,/saveRunCheckpoint\(\{kind:'route',nextWave\}\)/);
  assert.match(game,/saveRunCheckpoint\(\{kind:'boss'\}\)/);
  assert.match(game,/unlockedAbilities:\[\.\.\.player\.unlockedAbilities\]/);
  assert.match(game,/restored\.unlockedAbilities=new Set/);
  assert.match(game,/spawnBoss\(\{restoring:true\}\)/);
});

test('rooms carry first-class rescue, curse-anchor, and ward-defense missions',()=>{
  const waves=Object.values(ENCOUNTERS).flatMap((chapter)=>chapter.waves);
  assert.equal(waves.length,36);
  for(const type of ['eliminate','rescue','anchors','defend'])assert.ok(waves.some((wave)=>wave.mission?.type===type),`missing ${type} mission`);
  for(const wave of waves){assert.ok(wave.mission?.title);if(wave.mission.type==='rescue'||wave.mission.type==='anchors')assert.ok(wave.mission.count>=2);if(wave.mission.type==='defend'){assert.ok(wave.mission.duration>=20);assert.ok(wave.mission.health>=200);}}
  for(const fn of ['spawnRoomMission','serializeMissionState','saveMissionCheckpoint','completeRoomMission','failRoomMission','nearestMissionCaptive','useMissionInteraction','damageRoomMissionObjects','updateRoomMission','missionObjectiveText','drawMissionAnchor','drawMissionCaptive','drawMissionWard'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/!volatileDanger&&missionComplete\(\)/);
  assert.match(game,/if\(!damageRoomMissionObjects\(shot\)\)damageDestructibles\(shot\)/);
  assert.match(game,/MISSION FAILED/);
  assert.match(game,/\.slice\(0,8\)/);
  assert.match(game,/ward\.grace<=0/);
  assert.match(game,/cappedWardPressure\(pressure,ward\.maxHealth,roomMission\.duration\)/);
  assert.match(game,/debugSystem==='mission'/);
});

test('guardian victories open build-defining blessings and a three-vow epilogue',()=>{
  for(const id of ['guardian-reward-screen','guardian-reward-title','guardian-reward-copy','guardian-reward-grid'])assert.match(html,new RegExp(`id="${id}"`));
  for(const fn of ['openGuardianReward','chooseGuardianReward'])assert.match(game,new RegExp(`function ${fn}\\(`));
  for(const guardian of ['jadeguardTanuki','moonfangKomainu','pyreclawShogun','raijinKirin'])assert.match(game,new RegExp(`${guardian}:\\{`));
  for(const reward of ['jadeTempest','jadeAegis','jadeFortune','moonHunt','moonCurrent','moonStride','mercy','power','freedom'])assert.match(game,new RegExp(`id:'${reward}'`));
  assert.match(game,/openGuardianReward\(encounter\.defeatedGuardianId\|\|chapter\.boss\)/);
  assert.match(game,/saveRunCheckpoint\(\{kind:'guardianReward',guardianId\}\)/);
  assert.match(game,/point\.kind==='guardianReward'/);
  assert.match(game,/showStory\('epilogue'\)/);
  assert.match(game,/encounter\.storyBeat==='epilogue'\)endGame\(true\)/);
  assert.match(game,/player\.victoryShardBonus/);
});

test('persistent accessibility controls change render behavior and remain pause-safe',()=>{
  for(const id of ['settings-screen','settings-button','pause-settings','close-settings'])assert.match(html,new RegExp(`id="${id}"`));
  for(const setting of ['screenShake','flashIntensity','damageNumbers','ambientMotion'])assert.match(html,new RegExp(`data-setting="${setting}"`));
  for(const fn of ['refreshSettingsUi','openSettings','closeSettings','changeSetting','motionTime'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/camera\.shake\*profile\.settings\.screenShake/);
  assert.match(game,/profile\.settings\.flashIntensity>0/);
  assert.match(game,/if\(profile\.settings\.damageNumbers\)for/);
  assert.match(game,/profile\.settings\.ambientMotion\?performance\.now/);
  assert.match(game,/\['levelup','hubMenu','codex','paused','settings'\]/);
});

test('the walkable hub exposes permanent progression without pre-unlocking run abilities',()=>{
  for(const id of ['hub-menu-screen','hub-upgrade-grid','hub-shards','close-hub-menu'])assert.match(html,new RegExp(`id="${id}"`));
  for(const fn of ['enterHub','startCampaign','openHubStation','buyHubUpgrade','updateHub','drawHubStations'])assert.match(game,new RegExp(`function ${fn}\\(`));
  for(const station of ['heroShrine','forge','relicAltar','missionBoard','dojo','shopkeeper','portal'])assert.match(game,new RegExp(`id:'${station}'`));
  for(const rank of ['vitalityRank','forgeRank','attunementRank','purseRank'])assert.match(game,new RegExp(rank));
  assert.match(game,/unlockedAbilities: new Set\(\)/);
  assert.match(game,/if\(!directDebug\)\{enterHub\(\);return;\}/);
});

test('the circular minimap tracks live navigation without exposing waiting reserves',()=>{
  for(const id of ['minimap-panel','minimap','minimap-label','minimap-count'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/data-setting="minimap"/);
  for(const fn of ['minimapPoint','drawMinimapMarker','drawMinimap'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/enemies\.filter\(\(enemy\)=>enemy\.state!=='waiting'&&!enemy\.dead/);
  assert.match(game,/roomMission\?\.actors/);
  assert.match(game,/roomMission\?\.ward/);
  assert.match(game,/roomInteractable&&!roomInteractable\.used/);
  assert.match(game,/coop\.remotePlayers\.values\(\)/);
  assert.match(game,/for\(const station of HUB_STATIONS\)drawMinimapMarker/);
  assert.match(styles,/\.minimap-panel\{/);
  assert.match(styles,/border-radius:50%/);
});

test('the Spirit Dojo is an isolated interactive combat laboratory',()=>{
  for(const id of ['dojo-panel','dojo-target-name','dojo-dps','dojo-total-damage','dojo-best-dps','dojo-kills','dojo-cycle-target','dojo-toggle-ai','dojo-toggle-dual','dojo-reset','dojo-exit'])assert.match(html,new RegExp(`id="${id}"`));
  for(const fn of ['enterDojo','exitDojo','spawnDojoTarget','cycleDojoTarget','toggleDojoAi','toggleDojoDual','recordDojoDamage','updateDojo','updateDojoHud'])assert.match(game,new RegExp(`function ${fn}\\(`));
  for(const target of ['groveMinion','spiritArcher','mossBrute','jadeguardTanuki'])assert.match(game,new RegExp(`type:'${target}'`));
  assert.match(game,/state==='dojo'\?4:1/);
  assert.match(game,/enemy\.practice/);
  assert.match(game,/debugSystem==='dojo'/);
});

test('combat waves activate distinct rooms with a visible location transition',()=>{
  for(const id of ['room-transition','room-transition-kicker','room-transition-title','room-transition-subtitle'])assert.match(html,new RegExp(`id="${id}"`));
  for(const fn of ['activateRoom','showRoomTransition','roomForWave'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/activateRoom\(roomForWave\(index\)/);
  assert.match(game,/chapter\.bossRoom\|\|chapter\.rooms\?\.at\(-1\)/);
  assert.match(game,/const arenaCache=new Map/);
});

test('every campaign wave advances into its own production-painted combat location',()=>{
  const chapterRooms={
    jadeChapter:['jadeCourtyard','jadeMoonbridge','jadeRootGarden','jadeBellTerraces','jadeLanternCanals','jadeWardenProcessional'],
    bambooChapter:['bambooHollow','bambooMoonbridge','bambooSporeMarsh','bambooMoonlotusReservoir','bambooSporelightMonastery','bambooMoonstoneCauseway'],
    crimsonChapter:['crimsonDojo','crimsonBellCourt','crimsonWarYard','crimsonCinderRooftops','crimsonDrumFoundry','crimsonWarProcessional']
    ,stormChapter:['stormTempestHarbor','stormTideglassCauseway','stormDrownedBellSanctum','stormSirenReefMonastery','stormThunderbreakLighthouse','stormSkyfangAscent']
    ,neonChapter:['neonRainGate','neonCircuitMarket','neonHologramArcade','neonSkyrailShrine','neonDataLotusGardens','neonShogunTower']
    ,shadowChapter:['shadowObsidianPath','shadowMirrorgraveVillage','shadowWraithwoodCrossing','shadowEclipseArchive','shadowMoonlessProcessional','shadowUmbralPalaceSteps']
  };
  for(const [chapter,rooms] of Object.entries(chapterRooms)){
    assert.match(data,new RegExp(`id:\\s*'${chapter}'[\\s\\S]{0,260}rooms:\\s*\\[${rooms.map(room=>`'${room}'`).join(',')}\\]`));
    for(const room of rooms){
      assert.match(data,new RegExp(`${room}:\\s*\\{[\\s\\S]{0,360}width:\\s*4800[\\s\\S]{0,80}height:\\s*2700`));
      assert.match(data,new RegExp(`${room}:\\s*\\{[\\s\\S]{0,1600}combatBounds:`));
    }
  }
  assert.match(data,/bossRoom:'bambooMoonfangBurrow'/);
  assert.match(data,/bossRoom:'crimsonOniGate'/);
  assert.match(data,/bossRoom:'jadeGuardianApproach'/);
  assert.match(data,/bossRoom:'stormEyeOfTempest'/);
  assert.match(data,/bossRoom:'neonShogunCore'/);
  assert.match(data,/bossRoom:'shadowThroneBeyondMoon'/);
  assert.doesNotMatch(data,/rooms: \[[^\]]*'jadeGuardianApproach'/);
  assert.doesNotMatch(data,/rooms: \[[^\]]*'bambooMoonfangBurrow'/);
  assert.doesNotMatch(data,/rooms: \[[^\]]*'crimsonOniGate'/);
  assert.doesNotMatch(data,/rooms: \[[^\]]*'stormEyeOfTempest'/);
  assert.doesNotMatch(data,/rooms: \[[^\]]*'neonShogunCore'/);
  assert.doesNotMatch(data,/rooms: \[[^\]]*'shadowThroneBeyondMoon'/);
  for(const asset of ['jade-bell-terraces.png','jade-lantern-canals.png','jade-warden-processional.png','bamboo-moonlotus-reservoir.png','bamboo-sporelight-monastery.png','bamboo-moonstone-causeway.png','crimson-cinder-rooftops.png','crimson-drum-foundry.png','crimson-war-processional.png','storm-tempest-harbor-v1.png','storm-skyfang-ascent-v1.png','neon-rain-gate-v1.png','neon-shogun-tower-v1.png','shadow-obsidian-lantern-path-v1.png','shadow-umbral-palace-steps-v1.png','shadow-throne-beyond-moon-v1.png'])assert.match(data,new RegExp(asset.replace('.','\\.')));
});

test('each chapter escalates through a unique biome pressure mechanic',()=>{
  const pressures=Object.values(ENCOUNTERS).map((chapter)=>chapter.pressure);
  assert.deepEqual(pressures.map((pressure)=>pressure.id),['bellEcho','sporeBloom','emberLane','stormSurge','firewallGrid','eclipseRift']);
  for(const pressure of pressures){assert.ok(pressure.baseInterval>pressure.minInterval);assert.ok(pressure.warning>=.9);assert.ok(pressure.damage>0);}
  assert.match(game,/function scheduleBiomePressure/);assert.match(game,/function updateBiomePressure/);assert.match(game,/effects\.biomePressures/);
});

test('every unlocked ability earns a behavior-changing late-run evolution',()=>{
  for(const id of ['abyssalMaw','nineTailInferno','guardianBloom','heavensVerdict'])assert.match(game,new RegExp(`id:'${id}'`));
  assert.match(game,/abilityEvolutions:\{undertowWell:false,foxfireVolley:false,wildHeart:false,shockPaws:false\}/);
  assert.match(game,/restored\.abilityEvolutions=\{\.\.\.player\.abilityEvolutions,\.\.\.saved\.abilityEvolutions\}/);
  assert.match(game,/vortex\.evolved&&!vortex\.midCollapsed/);
  assert.match(game,/const shots=player\.abilityEvolutions\.foxfireVolley\?9/);
  assert.match(game,/function triggerGuardianBloom\(/);
  assert.match(game,/function triggerHeavensVerdict\(/);
  assert.match(game,/storm\.verdict&&!storm\.verdictResolved/);
  assert.match(game,/debugSystem==='evolutions'/);
});

test('late armies and guardians escalate pressure without changing the tutorial opening',()=>{
  assert.equal(encounterActiveLimit({waveIndex:0,chapterIndex:0,difficultyId:'ferocious'}),8);
  assert.equal(encounterActiveLimit({waveIndex:5,chapterIndex:2,difficultyId:'ferocious'}),24);
  assert.equal(encounterActiveLimit({waveIndex:5,chapterIndex:2,difficultyId:'nightmare'}),24);
  assert.match(game,/const spawnDuration=Math\.max\(\.42,1\.35-index\*\.15-chapterIndex\*\.08\)/);
  assert.match(game,/const angle=i\*2\.3999632297\+index\*\.73/);
  assert.match(game,/campaignPressureCurve\(\{chapterIndex,waveIndex:Math\.max\(0,encounter\.wave\)/);
  assert.match(game,/window\.__BRAWLPAWS_PRESSURE__/);
  assert.match(game,/const cellSize=190,neighborOffsets=/);
  assert.match(game,/const pursuitLane=Math\.max\(90,Math\.min\(enemy\.orbitRadius,260\)\)/);
  assert.match(game,/effects\.words\.length>=4\|\|combatWordCooldowns\.has\(text\)/);
  assert.match(game,/return Math\.min\(ceiling,pressure\.activeRamp\)/);
  assert.match(game,/Math\.min\(2\.35,1\+\(rawSpeedScale-1\)\*\.58\)/);
  assert.match(game,/abilityEvolutions\|\|\{\}\)\.filter\(Boolean\)\.length\*\.16/);
  for(const guardian of Object.values(BOSS_PROFILES)){assert.ok(guardian.phaseTempo[3]<guardian.phaseTempo[2]);assert.ok(guardian.domainIntervals[3]<guardian.domainIntervals[2]);assert.ok(guardian.domainName);}
  for(const fn of ['bossDomainInterval','triggerBossDomain','updateBossDomain'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/updateBossDomain\(enemy,profile,dt\)/);
  assert.match(game,/enemy\.patternWindup=pattern\.windup\*tempo/);
});

test('every late chapter and guardian locomotion uses authored pose atlases',()=>{
  for(const asset of ['bamboo-enemies-move-v1.png','crimson-enemies-move-v1.png','storm-enemies-move-v1.png','neon-enemies-move-v1.png','shadow-enemies-move-v1.png','jadeguard-tanuki-move-v1.png','moonfang-komainu-move-v1.png','pyreclaw-shogun-move-v1.png','raijin-kirin-move-v1.png','daikyo-oni-move-v1.png','tsukiko-empress-move-v1.png'])assert.match(game,new RegExp(asset.replace('.','\\.')));
  assert.match(game,/const useMove=!attacking&&motion\.moving/);
  assert.match(game,/const frame=definition\.spriteColumn\+\(attacking\?3:useMove\?walkRow\*3:0\)/);
  assert.match(game,/const useMove=motion\.moving&&enemy\.state==='bossIdle'/);
  assert.match(game,/drawGridAtlasFrame\(moveSheet,moveFrame,2,1/);
});

test('crowds preserve readable bodies and sprint creates real escape space',()=>{
  assert.match(game,/function resolveEnemyCrowding\(activeCombatants,dt\)/);
  assert.match(game,/resolveEnemyCrowding\(activeCombatants,dt\)/);
  assert.match(game,/minimum=\(a\.radius\+b\.radius\+24\)\*\(heavyA\|\|heavyB\?1\.2:1\.08\)/);
  assert.match(game,/committedA\?\.18:1/);
  assert.match(game,/sprintBoost=player\.sprinting\?1\.58:1/);
  assert.match(game,/player\.sprinting\?-27:28/);
});

test('every playable hero owns authored ability and reaction poses',()=>{
  for(const hero of ['kitsune','bamboo','hopscotch','rusty','zap']){
    assert.match(data,new RegExp(`${hero}[\\s\\S]{0,780}stateAsset: ?'${hero}States'`));
    assert.match(game,new RegExp(`${hero}States: 'assets/characters/${hero}-states-v1\\.png'`));
  }
  assert.match(game,/const specialFrames=\{undertowWell:0,foxfireVolley:1,wildHeart:2,shockPaws:3,hit:4,stun:5,death:6,victory:7\}/);
  assert.match(game,/player\.castAbility=id/);
  assert.match(game,/if\(player\.castTime<=0\)player\.castAbility=null/);
  assert.match(game,/entity\.stunTime > 0 \? 'stun'/);
  assert.match(game,/state==='won' \? 'victory'/);
  assert.match(game,/sheet\.naturalHeight \/ \(authoredState\?2:4\)/);
});

test('level three forces an authored arsenal awakening with distinct combat contracts',()=>{
  for(const weapon of ['frostbiteNeedle','oniMortar','galeWarFan'])assert.match(data,new RegExp(`${weapon}: \\{[\\s\\S]{0,520}projectileType:`));
  for(const upgrade of ['equipFrostbiteNeedle','equipOniMortar','equipGaleWarFan','permafrost','shatterpoint','oniPayload','blastChamber','razorCurrent','typhoonReach'])assert.match(game,new RegExp(`id:'${upgrade}'`));
  assert.match(game,/const arsenal=pool\.filter\(\(upgrade\)=>upgrade\.type==='ARSENAL AWAKENING'\);if\(arsenal\.length&&bound\?\.tier!==3\)\{currentUpgradeChoices=arsenal;return;\}/);
  assert.match(game,/currentUpgradeChoices\.every\(\(upgrade\)=>upgrade\.type==='ARSENAL AWAKENING'\)/);
  assert.match(styles,/arsenal-weapons-v1\.png/);
});

test('arsenal projectiles create whole-enemy freeze, mortar, and return reactions',()=>{
  for(const fn of ['equipWeapon','applyFrostbite','detonateMortar','turnGaleForReturn'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/chillStacks:0,chillTime:0,freezeTime:0/);
  assert.match(game,/enemy\.freezeTime>0\)\{enemy\.vx\*=Math\.exp\(-18\*dt\)/);
  assert.match(game,/drawGridAtlasFrame\(assets\.arsenalReactionsVfx,2,3,2/);
  assert.match(game,/if\(shot\.mortar\)\{detonateMortar\(shot\);break;\}/);
  assert.match(game,/if\(shot\.gale&&!shot\.returning&&shot\.life<=0\)turnGaleForReturn\(shot\)/);
  assert.match(game,/weaponId:player\?\.weaponId\|\|heroDef\.weapon/);
});

test('level seven forces an authored legend arsenal with persistent collection tracking',()=>{
  for(const weapon of ['embercoilRepeater','tempestChakram','moonpiercerRailbow'])assert.match(data,new RegExp(`${weapon}: \\{[\\s\\S]{0,620}projectileType:`));
  for(const upgrade of ['equipEmbercoilRepeater','equipTempestChakram','equipMoonpiercerRailbow','cinderDrum','ruptureMagazine','cycloneEdge','crosswindRecall','lunarCapacitor','horizonBore'])assert.match(game,new RegExp(`id:'${upgrade}'`));
  assert.match(game,/const legendArsenal=pool\.filter\(\(upgrade\)=>upgrade\.type==='LEGEND ARSENAL'\)/);
  assert.match(game,/function turnChakramForReturn\(shot\)/);
  assert.match(game,/profile\.collectedWeapons\.push\(id\)/);
  assert.match(game,/debugSystem==='legendArsenal'/);
  assert.match(game,/LEGEND_ARSENAL_COLLECTION/);
  assert.match(game,/debugSystem==='forgeCollection'/);
  assert.match(game,/forge-collection-card/);
  assert.match(styles,/\.forge-collection-card \.forge-weapon-art/);
  assert.match(styles,/arsenal-tier2-v1\.png/);
});

test('discovered Arsenal blueprints bind per hero without bypassing the low-power opening',()=>{
  for(const weapon of ['frostbiteNeedle','oniMortar','galeWarFan','embercoilRepeater','tempestChakram','moonpiercerRailbow'])assert.match(game,new RegExp(`id:'${weapon}'[\\s\\S]{0,180}tier:`));
  assert.match(game,/boundArsenal:\{\}/);
  assert.match(game,/function boundArsenalForHero\(\)/);
  assert.match(game,/function bindArsenalBlueprint\(id\)/);
  assert.match(game,/function renderArsenalContract\(\)/);
  assert.match(game,/player\.level>=bound\.tier/);
  assert.match(game,/FORGE CONTRACT FULFILLED!/);
  assert.match(game,/weapon=WEAPONS\[heroDef\.weapon\]/);
  assert.match(game,/unlockedAbilities: new Set\(\)/);
  assert.match(game,/debugSystem==='boundArsenal'/);
  assert.match(game,/debugSystem==='arsenalLoadout'/);
  assert.match(styles,/\.arsenal-contract-grid/);
  assert.match(styles,/\.forge-collection-card\.selected/);
});

test('relic rewards are visible three-choice build decisions',()=>{
  assert.match(game,/function openRelicDraft\(/);
  assert.match(game,/currentRelicChoices=pool\.slice\(0,3\)/);
  assert.match(game,/function relicBuildScore\(/);
  assert.match(game,/BUILD MATCH/);
  assert.match(game,/function chooseRelic\(/);
  assert.match(game,/state==='relicDraft'&&\['1','2','3'\]\.includes\(key\)/);
  assert.match(game,/continuation:\(\)=>finishRouteEvent/);
  assert.match(styles,/\.relic-draft-card/);
  assert.match(styles,/choice-atlas-v1\.png/);
});

test('chapters attack with distinct readable warpack formations',()=>{
  for(const id of ['jadeChapter','bambooChapter','crimsonChapter','stormChapter','neonChapter','shadowChapter'])assert.match(game,new RegExp(`${id}:\\{name:`));
  for(const formation of ['arc','pincer','wall','cross','mirror'])assert.match(game,new RegExp(`formation:'${formation}'`));
  assert.match(game,/updateChapterWarpack\(dt\)/);
  assert.match(game,/activeCount>26&&!important/);
});

test('every guardian exposes a named skill-based counter window',()=>{
  for(const profile of Object.values(BOSS_PROFILES)){
    assert.ok(BOSS_PATTERNS[profile.counterPattern],`${profile.id} needs a valid counter pattern`);
    assert.ok(profile.counterName&&profile.counterDuration>=1&&profile.counterMultiplier>1);
  }
  assert.match(game,/openBossCounter\(enemy,profile/);
  assert.match(game,/enemy\.def\.behavior==='boss'&&enemy\.counterTime>0/);
});

test('level five paths and level ten masteries create distinct combat loops',()=>{
  for(const id of ['pathGunner','pathElementalist','pathVanguard'])assert.match(game,new RegExp(`id:'${id}'[\\s\\S]{0,260}LEVEL 5 FIGHTING STYLE`));
  for(const id of ['masterGunner','masterElementalist','masterVanguard'])assert.match(game,new RegExp(`id:'${id}'[\\s\\S]{0,260}LEVEL 10 PATH MASTERY`));
  assert.match(game,/const paths=pool\.filter\(\(upgrade\)=>upgrade\.type==='LEVEL 5 FIGHTING STYLE'\)/);
  assert.match(game,/const mastery=pool\.filter\(\(upgrade\)=>upgrade\.type==='LEVEL 10 PATH MASTERY'\)/);
  assert.match(game,/function spawnHunterSeekers\(/);
  assert.match(game,/function triggerPrismaticRupture\(/);
  assert.match(game,/vanguardCrush=player\.buildMastery==='vanguard'&&player\.masteryCharge>=1/);
  assert.match(game,/buildPath:null,buildMastery:null,masteryCharge:0/);
});
