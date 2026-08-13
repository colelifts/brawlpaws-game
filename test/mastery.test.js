import test from 'node:test';
import assert from 'node:assert/strict';
import { HEROES } from '../src/data.js';
import { MASTERY_CAP, MASTERY_POWER_CAP, MASTERY_CRESTS, masteryCrest, availableMasteryCrests, sanitizeMasteryCrests } from '../src/mastery.js';

test('hero mastery extends to a cosmetic prestige road after the power cap',()=>{
  assert.equal(MASTERY_CAP,100);assert.equal(MASTERY_POWER_CAP,50);assert.ok(MASTERY_CRESTS.length>=6);
  assert.deepEqual(MASTERY_CRESTS.map((crest)=>crest.rank),[0,5,25,50,75,100]);
  assert.equal(availableMasteryCrests(49).at(-1).id,'spirit');assert.equal(availableMasteryCrests(100).at(-1).id,'mythic');
});

test('crest selection sanitizes locked or unknown cosmetic ids',()=>{
  assert.equal(masteryCrest('missing').id,'none');
  const clean=sanitizeMasteryCrests({kitsune:'mythic',bamboo:'broken'},Object.keys(HEROES));
  assert.equal(clean.kitsune,'mythic');assert.equal(clean.bamboo,'none');assert.equal(clean.hopscotch,'none');
});
