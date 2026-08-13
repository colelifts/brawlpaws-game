export const DEFAULT_BINDINGS=Object.freeze({
  moveUp:'w',moveDown:'s',moveLeft:'a',moveRight:'d',sprint:' ',dash:'shift',interact:'e',
  attack:'j',undertow:'e',foxfire:'c',wildHeart:'f',ultimate:'q',worldMap:'m',codex:'k',settings:'o'
});

export const BINDING_LABELS=Object.freeze({
  moveUp:'MOVE UP',moveDown:'MOVE DOWN',moveLeft:'MOVE LEFT',moveRight:'MOVE RIGHT',sprint:'SPRINT',dash:'FOX STEP',interact:'INTERACT',
  attack:'FIRE',undertow:'UNDERTOW WELL',foxfire:'FOXFIRE VOLLEY',wildHeart:'WILD HEART',ultimate:'SHOCK PAWS',worldMap:'WORLD MAP',codex:'CODEX',settings:'SETTINGS'
});

const validKey=(value)=>typeof value==='string'&&value.length>0&&value.length<=24&&!['escape','tab'].includes(value.toLowerCase());

export function sanitizeBindings(raw={}){
  const source=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  return Object.fromEntries(Object.entries(DEFAULT_BINDINGS).map(([action,fallback])=>[action,validKey(source[action])?source[action].toLowerCase():fallback]));
}

export function keyLabel(key){
  const labels={' ':'SPACE',shift:'SHIFT',enter:'ENTER',arrowup:'UP',arrowdown:'DOWN',arrowleft:'LEFT',arrowright:'RIGHT'};
  return labels[key]||String(key||'').replace(/^key/i,'').toUpperCase();
}

export function radialDeadzone(x=0,y=0,deadzone=.22){
  const magnitude=Math.hypot(x,y);if(magnitude<=deadzone)return {x:0,y:0,magnitude:0};
  const scaled=Math.min(1,(magnitude-deadzone)/(1-deadzone));return {x:x/magnitude*scaled,y:y/magnitude*scaled,magnitude:scaled};
}

export function gamepadActions(gamepad,previous=new Set()){
  const held=new Set();if(!gamepad)return {held,pressed:new Set(),move:{x:0,y:0,magnitude:0},aim:{x:0,y:0,magnitude:0}};
  const down=(index,action,threshold=.45)=>{const button=gamepad.buttons?.[index];if(button&&(button.pressed||button.value>threshold))held.add(action);};
  down(0,'confirm');down(1,'cancel');down(2,'foxfire');down(3,'ultimate');down(4,'undertow');down(5,'wildHeart');down(6,'dash');down(7,'attack',.2);down(8,'worldMap');down(9,'pause');down(10,'sprint');down(12,'navUp');down(13,'navDown');down(14,'navLeft');down(15,'navRight');
  const move=radialDeadzone(gamepad.axes?.[0],gamepad.axes?.[1]),aim=radialDeadzone(gamepad.axes?.[2],gamepad.axes?.[3]);
  if(move.magnitude>.55){if(move.y<-.55)held.add('navUp');if(move.y>.55)held.add('navDown');if(move.x<-.55)held.add('navLeft');if(move.x>.55)held.add('navRight');}
  const pressed=new Set([...held].filter((action)=>!previous.has(action)));return {held,pressed,move,aim};
}
