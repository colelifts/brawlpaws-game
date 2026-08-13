import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_BINDINGS, sanitizeBindings, keyLabel, radialDeadzone, gamepadActions } from '../src/controls.js';

const pad=({axes=[0,0,0,0],buttons={}}={})=>({axes,buttons:Array.from({length:16},(_,index)=>({pressed:Boolean(buttons[index]),value:buttons[index]?1:0}))});

test('persistent bindings keep safe keys and restore invalid commands',()=>{
  const bindings=sanitizeBindings({moveUp:'i',attack:'x',dash:'escape',bogus:'z'});
  assert.equal(bindings.moveUp,'i');assert.equal(bindings.attack,'x');assert.equal(bindings.dash,DEFAULT_BINDINGS.dash);assert.equal(bindings.bogus,undefined);
  assert.equal(keyLabel(' '),'SPACE');assert.equal(keyLabel('arrowup'),'UP');
});

test('radial stick deadzones prevent drift while preserving analog direction',()=>{
  assert.deepEqual(radialDeadzone(.08,-.12),{x:0,y:0,magnitude:0});
  const active=radialDeadzone(.8,-.6);assert.ok(active.magnitude>.9);assert.ok(active.x>.7);assert.ok(active.y<-.5);
});

test('gamepad mapping supports twin-stick aim and edge-triggered actions',()=>{
  const first=gamepadActions(pad({axes:[-.8,.2,.9,-.4],buttons:{6:true,7:true,3:true}}));
  assert.ok(first.move.x<-.5);assert.ok(first.aim.x>.7);assert.ok(first.held.has('dash'));assert.ok(first.held.has('attack'));assert.ok(first.pressed.has('ultimate'));
  const held=gamepadActions(pad({buttons:{7:true,3:true}}),first.held);assert.equal(held.pressed.has('ultimate'),false);assert.equal(held.pressed.has('attack'),false);
});
