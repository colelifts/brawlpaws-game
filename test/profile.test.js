import test from 'node:test';
import assert from 'node:assert/strict';
import { PROFILE_VERSION, PROFILE_FORMAT, createDefaultProfile, sanitizeProfile, createSaveArchive, parseSaveArchive } from '../src/profile.js';
import { readFileSync } from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const game=readFileSync(new URL('../src/game.js',import.meta.url),'utf8');

test('legacy profiles migrate to the current schema without losing progression',()=>{
  const profile=sanitizeProfile({spiritShards:742,campaignClears:2,selectedHero:'zap',unlockedHeroes:['kitsune','zap'],worldDiscoveries:['jadeCourtyard','jadeMoonbridge'],heroMastery:{kitsune:{xp:912,kills:44}},settings:{musicVolume:.2}});
  assert.equal(profile.schemaVersion,PROFILE_VERSION);
  assert.equal(profile.spiritShards,742);
  assert.equal(profile.selectedHero,'zap');
  assert.ok(profile.unlockedHeroes.includes('hopscotch'));
  assert.equal(profile.heroMastery.kitsune.xp,912);
  assert.equal(profile.heroMastery.kitsune.kills,44);
  assert.equal(profile.settings.musicVolume,.2);
  assert.equal(profile.settings.sfxVolume,.85);
  assert.equal(profile.settings.colorAssist,false);
  assert.equal(profile.settings.toggleFire,false);
  assert.deepEqual(profile.realmSeals,[]);
  assert.deepEqual(profile.claimedExpeditionMilestones,[]);
  assert.equal(profile.keyBindings.attack,'j');
});

test('profile sanitization rejects invalid ids and clamps untrusted values',()=>{
  const profile=sanitizeProfile({spiritShards:-90,ascensionRank:900,selectedHero:'hacker',unlockedHeroes:['hacker'],collectedWeapons:['fakeWeapon'],worldDiscoveries:['fakeRoom'],settings:{masterVolume:7,screenShake:.7}});
  assert.equal(profile.spiritShards,0);
  assert.equal(profile.ascensionRank,10);
  assert.equal(profile.selectedHero,'kitsune');
  assert.deepEqual(profile.unlockedHeroes,['kitsune','bamboo']);
  assert.deepEqual(profile.collectedWeapons,[]);
  assert.deepEqual(profile.worldDiscoveries,['jadeCourtyard']);
  assert.equal(profile.settings.masterVolume,1);
  assert.equal(profile.settings.screenShake,1);
  assert.equal(profile.keyBindings.dash,'shift');
});

test('save archives round trip and reject incompatible data',()=>{
  const source=createDefaultProfile();source.spiritShards=321;source.worldDiscoveries.push('jadeMoonbridge');
  const archive=createSaveArchive(source),restored=parseSaveArchive(JSON.stringify(archive));
  assert.equal(archive.format,PROFILE_FORMAT);
  assert.equal(archive.version,PROFILE_VERSION);
  assert.equal(restored.spiritShards,321);
  assert.ok(restored.worldDiscoveries.includes('jadeMoonbridge'));
  assert.throws(()=>parseSaveArchive('{broken'),/valid JSON/);
  assert.throws(()=>parseSaveArchive(JSON.stringify({format:'another-game',profile:{}})),/different game/);
  assert.throws(()=>parseSaveArchive(JSON.stringify({schemaVersion:PROFILE_VERSION+1})),/newer BrawlPaws/);
});

test('settings expose visible export, import, and guarded reset controls',()=>{
  for(const id of ['save-data-summary','save-data-status','save-data-text','export-save','import-save-file','import-save','reset-save'])assert.match(html,new RegExp(`id="${id}"`));
  for(const fn of ['exportProfileSave','importProfileText','requestProfileReset'])assert.match(game,new RegExp(`function ${fn}\\(`));
  assert.match(game,/resetSaveConfirmUntil=now\+5000/);
  assert.match(game,/localStorage\.removeItem\(RUN_KEY\)/);
});

test('settings expose persistent remapping and controller input contracts',()=>{
  for(const id of ['binding-grid','binding-status','reset-bindings'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(game,/function pollGamepad\(/);assert.match(game,/function renderBindingControls\(/);assert.match(game,/input\.gamepad\.aim\.magnitude/);assert.match(game,/const actionOwnsFacing = input\.gamepad\.aim\.magnitude/);
});

test('combat accessibility offers persistent color assistance and toggle fire',()=>{
  for(const setting of ['colorAssist','toggleFire'])assert.match(html,new RegExp(`data-setting="${setting}"`));
  assert.match(game,/function drawColorAssistMarker\(/);assert.match(game,/profile\.settings\.toggleFire&&\(keyPressed\('attack'\)/);assert.match(game,/profile\.settings\.colorAssist/);
});
