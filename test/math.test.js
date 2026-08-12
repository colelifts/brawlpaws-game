import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, normalize, segmentCircleHit, shortestAngle, withinArc, encounterActiveLimit, cappedWardPressure } from '../src/math.js';
import { HEROES, WEAPONS, ABILITIES, STATUS_EFFECTS, ELITE_MODIFIERS, BOSS_PATTERNS, BOSS_PROFILES, ENEMIES, ENCOUNTERS, ROOMS, DIFFICULTIES } from '../src/data.js';

test('math helpers support movement and spatial hit tests', () => {
  assert.equal(clamp(12, 0, 10), 10);
  assert.deepEqual(normalize(0, 0), { x: 0, y: 0 });
  assert.ok(Math.abs(normalize(3, 4).x - 0.6) < 0.001);
  assert.equal(segmentCircleHit({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 1, radius: 2 }), true);
  assert.ok(Math.abs(shortestAngle(Math.PI * 0.9, -Math.PI * 0.9)) < Math.PI);
  assert.equal(withinArc({ x: 0, y: 0 }, 0, { x: 100, y: 0, radius: 10 }, 95, Math.PI / 2), true);
  assert.equal(withinArc({ x: 0, y: 0 }, 0, { x: -40, y: 0, radius: 10 }, 95, Math.PI / 2), false);
});

test('army reserves cap simultaneous threats while preserving difficulty and co-op scaling',()=>{
  assert.equal(encounterActiveLimit({waveIndex:0,chapterIndex:0}),8);
  const lateSolo=encounterActiveLimit({waveIndex:5,chapterIndex:2,difficultyId:'nightmare'});
  const lateCoop=encounterActiveLimit({waveIndex:5,chapterIndex:2,difficultyId:'nightmare',partySize:4});
  assert.equal(lateSolo,61);
  assert.equal(lateCoop,72);
  assert.ok(lateSolo>encounterActiveLimit({waveIndex:1,chapterIndex:0,difficultyId:'spirited'}));
  assert.equal(cappedWardPressure(999,520,40),520/(40*.62));
  assert.equal(cappedWardPressure(8,520,40),8);
});

test('Phase 1 definitions are internally valid', () => {
  assert.ok(HEROES.kitsune.speed > ENEMIES.jadeBrawler.speed);
  assert.ok(WEAPONS.spiritBlaster.projectileSpeed > HEROES.kitsune.speed);
  assert.ok(WEAPONS.spiritBlaster.fireRate < .25);
  assert.ok(WEAPONS.spiritBlaster.range > 900);
  assert.ok(ROOMS.jadeCourtyard.enemySpawns.length >= 5);
  assert.equal(ROOMS.jadeCourtyard.enemySpawns.length, 7);
  assert.deepEqual([...new Set(ROOMS.jadeCourtyard.enemySpawns.map((spawn) => spawn.type))].sort(), ['armoredBoar', 'groveMinion', 'jadeBrawler', 'spiritArcher']);
  assert.ok(ROOMS.jadeCourtyard.width >= 3400);
  assert.ok(Math.max(...ROOMS.jadeCourtyard.enemySpawns.map((spawn) => spawn.delay || 0)) >= 15);
  assert.ok(ENEMIES.groveMinion.speed < ENEMIES.jadeBrawler.speed);
  assert.ok(ENEMIES.armoredBoar.slamRadius > ENEMIES.armoredBoar.attackRange / 2);
  assert.ok(ENEMIES.armoredBoar.stunDuration >= 1);
});

test('the hero roster contains distinct ranged archetypes',()=>{
  assert.deepEqual(Object.keys(HEROES),['kitsune','bamboo','hopscotch','rusty','zap']);
  assert.equal(HEROES.kitsune.weapon,'spiritBlaster');
  assert.equal(HEROES.bamboo.weapon,'bambooCannon');
  assert.ok(HEROES.bamboo.maxHealth>HEROES.kitsune.maxHealth);
  assert.ok(HEROES.bamboo.speed<HEROES.kitsune.speed);
  assert.ok(HEROES.bamboo.damageTakenMultiplier<1);
  assert.ok(HEROES.bamboo.knockbackResistance<1);
  assert.equal(WEAPONS.bambooCannon.shots,3);
  assert.ok(WEAPONS.bambooCannon.spread>0);
  assert.ok(WEAPONS.bambooCannon.fireRate>WEAPONS.spiritBlaster.fireRate);
  assert.ok(WEAPONS.spiritBlaster.damage<=9);
  assert.ok(WEAPONS.bambooCannon.damage<=7);
  assert.equal(HEROES.hopscotch.weapon,'spiritLongbow');
  assert.equal(WEAPONS.spiritLongbow.projectileType,'arrow');
  assert.ok(WEAPONS.spiritLongbow.releaseDelay>.2);
  assert.ok(WEAPONS.spiritLongbow.pierces>=1);
  assert.equal(HEROES.rusty.weapon,'twinTrickshots');
  assert.equal(HEROES.rusty.naturalDual,true);
  assert.equal(WEAPONS.twinTrickshots.baseVolleys,2);
  assert.ok(WEAPONS.twinTrickshots.ricochets>=1);
  assert.ok(WEAPONS.twinTrickshots.ricochetRange>=400);
  assert.ok(WEAPONS.twinTrickshots.damage<WEAPONS.spiritBlaster.damage);
  assert.equal(HEROES.zap.weapon,'arcCasters');
  assert.equal(HEROES.zap.naturalDual,true);
  assert.equal(WEAPONS.arcCasters.projectileType,'arc');
  assert.equal(WEAPONS.arcCasters.baseVolleys,2);
  assert.equal(WEAPONS.arcCasters.chainThreshold,3);
  assert.ok(WEAPONS.arcCasters.damage<WEAPONS.spiritBlaster.damage);
});

test('the starter ability loadout is complete and data-driven', () => {
  assert.deepEqual(Object.keys(ABILITIES), ['undertowWell', 'foxfireVolley', 'wildHeart', 'shockPaws']);
  assert.equal(new Set(Object.values(ABILITIES).map((ability) => ability.id)).size, 4);
  for (const ability of Object.values(ABILITIES)) {
    assert.ok(ability.cooldown > 0);
    assert.match(ability.color, /^#[0-9a-f]{6}$/i);
  }
  assert.deepEqual(Object.values(ABILITIES).map((ability)=>ability.unlockLevel),[2,4,6,8]);
  assert.ok(ABILITIES.undertowWell.duration > 0);
  assert.ok(ABILITIES.undertowWell.collapseDamage > ABILITIES.undertowWell.damage);
  assert.ok(ABILITIES.undertowWell.pull >= 900);
  assert.ok(ABILITIES.foxfireVolley.burnDuration > 0);
  assert.ok(ABILITIES.wildHeart.damageReduction > 0);
  assert.ok(ABILITIES.shockPaws.duration >= 5);
  assert.ok(ABILITIES.shockPaws.damage >= 16);
  assert.ok(ABILITIES.shockPaws.tickRate > 0);
  assert.ok(ABILITIES.undertowWell.wetDuration > 0);
});

test('statuses and elite mutations have complete combat data',()=>{
  assert.deepEqual(Object.keys(STATUS_EFFECTS),['burn','wet','shock','stun']);
  assert.deepEqual(Object.keys(ELITE_MODIFIERS),['swift','bulwark','frenzied','volatile','splitter']);
  for(const status of Object.values(STATUS_EFFECTS)){assert.ok(status.field.endsWith('Time'));assert.match(status.color,/^#[0-9a-f]{6}$/i);}
  for(const elite of Object.values(ELITE_MODIFIERS)){assert.ok(elite.rewardScale>1);assert.ok(elite.description.length>10);assert.match(elite.color,/^#[0-9a-f]{6}$/i);}
  assert.ok(ELITE_MODIFIERS.bulwark.shieldScale>.4);
  assert.ok(ELITE_MODIFIERS.volatile.blastRadius>=170);
  assert.equal(ELITE_MODIFIERS.splitter.splitCount,2);
});

test('authored specialist enemies expose distinct counterplay contracts',()=>{
  assert.equal(ENEMIES.bellweaverCat.behavior,'summoner');
  assert.ok(ENEMIES.bellweaverCat.summonCharges>=2);
  assert.equal(ENEMIES.powderkegToad.behavior,'bomber');
  assert.ok(ENEMIES.powderkegToad.bombFuse>=1);
  assert.ok(ENEMIES.powderkegToad.bombRadius>120);
  assert.equal(ENEMIES.gatewardenRhino.behavior,'shield');
  assert.ok(ENEMIES.gatewardenRhino.guardScale>.6);
  assert.ok(ENEMIES.gatewardenRhino.stunDuration>.5);
  assert.equal(ENEMIES.mistclawLynx.behavior,'assassin');
  assert.ok(ENEMIES.mistclawLynx.blinkOffset>100);
  assert.ok(ENEMIES.mistclawLynx.strikeSpeed>700);
  assert.ok(!ENCOUNTERS.jadeChapter.waves[0].roster.includes('bellweaverCat'));
  assert.ok(ENCOUNTERS.jadeChapter.waves[2].roster.includes('bellweaverCat'));
  assert.ok(ENCOUNTERS.bambooChapter.waves[1].roster.includes('powderkegToad'));
  assert.ok(ENCOUNTERS.crimsonChapter.waves[1].roster.includes('gatewardenRhino'));
  assert.ok(ENCOUNTERS.crimsonChapter.waves[0].roster.includes('mistclawLynx'));
});

test('boss profiles expose reusable timing and phase schedules',()=>{
  assert.deepEqual(Object.keys(BOSS_PATTERNS),['sweep','slam','channel','crossfire','signature']);
  assert.deepEqual(Object.keys(BOSS_PROFILES),['jadeguardTanuki','moonfangKomainu','pyreclawShogun']);
  for(const pattern of Object.values(BOSS_PATTERNS)){assert.ok(pattern.windup>0);assert.ok(pattern.resolveAt>0);assert.ok(pattern.recovery>0);}
  for(const [id,profile] of Object.entries(BOSS_PROFILES)){
    assert.equal(profile.id,id);assert.equal(Object.keys(profile.phaseNames).length,3);assert.equal(Object.keys(profile.schedules).length,3);
    assert.ok(profile.signatureName.length>5);assert.ok(profile.signatureDescription.length>25);assert.ok(profile.signatureDamage>20);
    for(const schedule of Object.values(profile.schedules))for(const patternId of schedule)assert.ok(BOSS_PATTERNS[patternId]);
    assert.ok(profile.schedules[2].includes('signature'));assert.ok(profile.schedules[3].includes('signature'));
  }
  assert.ok(BOSS_PROFILES.pyreclawShogun.schedules[3].length>BOSS_PROFILES.jadeguardTanuki.schedules[1].length);
});

test('the Jade Grove chapter escalates into a real boss encounter', () => {
  const chapter = ENCOUNTERS.jadeChapter;
  assert.equal(chapter.waves.length, 6);
  assert.deepEqual(chapter.waves.map((wave)=>wave.targetCount||wave.roster.length),[4,10,18,30,48,72]);
  assert.ok(chapter.waves[3].roster.length >= 18);
  assert.ok(chapter.waves[3].speedScale > chapter.waves[0].speedScale);
  assert.ok(chapter.waves[3].healthScale > chapter.waves[0].healthScale);
  assert.equal(ENEMIES[chapter.boss].behavior, 'boss');
  assert.ok(ENEMIES[chapter.boss].maxHealth >= 2500);
  assert.ok(ENEMIES[chapter.boss].slamRadius >= 280);
});

test('Jade Grove progresses through six authored waves and a separate guardian court',()=>{
  const chapter=ENCOUNTERS.jadeChapter;
  assert.deepEqual(chapter.rooms,['jadeCourtyard','jadeMoonbridge','jadeRootGarden','jadeBellTerraces','jadeLanternCanals','jadeWardenProcessional']);
  assert.equal(chapter.bossRoom,'jadeGuardianApproach');
  assert.ok(!chapter.rooms.includes(chapter.bossRoom));
  for(const roomId of chapter.rooms){
    const room=ROOMS[roomId];assert.ok(room);assert.equal(room.width,4800);assert.equal(room.height,2700);assert.ok(room.combatBounds.radiusX>=1450);assert.ok(room.combatBounds.radiusY>=750);
  }
  assert.match(ROOMS.jadeMoonbridge.background,/jade-moonbridge\.png$/);
  assert.match(ROOMS.jadeRootGarden.background,/jade-root-garden\.png$/);
  assert.match(ROOMS.jadeGuardianApproach.background,/jade-guardian-approach\.png$/);
});

test('Bamboo Hollow is a harder second chapter with its own enemy family and guardian', () => {
  const chapter = ENCOUNTERS.bambooChapter;
  assert.equal(chapter.room, 'bambooHollow');
  assert.equal(chapter.waves.length, 6);
  assert.deepEqual(chapter.waves.map((wave)=>wave.targetCount||wave.roster.length),[14,14,22,30,84,112]);
  assert.ok(chapter.waves[0].roster.length >= 8);
  assert.ok(chapter.waves[3].roster.length >= 30);
  assert.ok(chapter.waves[3].speedScale > ENCOUNTERS.jadeChapter.waves[3].speedScale * .9);
  for (const id of ['bambooStalker', 'sporeArcher', 'mossBrute']) assert.equal(ENEMIES[id].biome, 'bamboo');
  assert.ok(ENEMIES.bambooStalker.speed > ENEMIES.jadeBrawler.speed);
  assert.ok(ENEMIES.mossBrute.stunDuration > ENEMIES.armoredBoar.stunDuration);
  assert.equal(ENEMIES[chapter.boss].behavior, 'boss');
  assert.equal(ENEMIES[chapter.boss].biome, 'bamboo');
  assert.ok(ENEMIES[chapter.boss].maxHealth >= 5000);
  assert.match(ROOMS.bambooHollow.background, /bamboo-hollow-arena\.png$/);
});

test('Crimson Dojo escalates into the densest chapter and a third giant guardian', () => {
  const chapter=ENCOUNTERS.crimsonChapter;
  assert.equal(chapter.room,'crimsonDojo');
  assert.deepEqual(chapter.waves.map((wave)=>wave.targetCount||wave.roster.length),[12,20,30,42,112,150]);
  assert.ok(chapter.waves.every((wave,index)=>index===0||wave.healthScale>chapter.waves[index-1].healthScale));
  assert.ok(chapter.waves.every((wave,index)=>index===0||wave.speedScale>chapter.waves[index-1].speedScale));
  for(const id of ['emberAkita','gongwing','ironhorn'])assert.equal(ENEMIES[id].biome,'crimson');
  assert.ok(ENEMIES.emberAkita.speed>ENEMIES.bambooStalker.speed);
  assert.ok(ENEMIES.ironhorn.stunDuration>ENEMIES.mossBrute.stunDuration);
  assert.equal(ENEMIES[chapter.boss].id,'pyreclawShogun');
  assert.ok(ENEMIES[chapter.boss].maxHealth>=7500);
  assert.match(ROOMS.crimsonDojo.background,/crimson-dojo-arena\.png$/);
});

test('difficulty modes scale pressure and rewards in the same direction',()=>{
  assert.deepEqual(Object.keys(DIFFICULTIES),['spirited','ferocious','nightmare','ascension']);
  assert.ok(DIFFICULTIES.spirited.healthScale<DIFFICULTIES.ferocious.healthScale);
  assert.ok(DIFFICULTIES.nightmare.healthScale>DIFFICULTIES.ferocious.healthScale);
  assert.ok(DIFFICULTIES.nightmare.speedScale>DIFFICULTIES.ferocious.speedScale);
  assert.ok(DIFFICULTIES.nightmare.damageScale>DIFFICULTIES.ferocious.damageScale);
  assert.ok(DIFFICULTIES.nightmare.rewardScale>DIFFICULTIES.ferocious.rewardScale);
  assert.ok(DIFFICULTIES.ascension.healthScale>DIFFICULTIES.nightmare.healthScale);
  assert.ok(DIFFICULTIES.ascension.damageScale>DIFFICULTIES.nightmare.damageScale);
  assert.ok(DIFFICULTIES.ascension.enemyCountScale>1);
  assert.ok(DIFFICULTIES.ascension.spawnRateScale>1);
});

test('Spirit Lantern Village is a large walkable campaign hub',()=>{
  const hub=ROOMS.spiritVillage;
  assert.equal(hub.id,'spiritVillage');
  assert.ok(hub.width>=4800);
  assert.ok(hub.height>=2700);
  assert.match(hub.background,/spirit-lantern-village\.png$/);
  assert.ok(hub.combatBounds.radiusX>=1700);
});
