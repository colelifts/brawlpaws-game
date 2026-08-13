import { mkdirSync, writeFileSync } from 'node:fs';

const width=24,height=15,tilewidth=256,tileheight=256;
const tileLayer=(name,fn)=>({id:layers.length+1,name,type:'tilelayer',width,height,x:0,y:0,opacity:1,visible:true,data:Array.from({length:width*height},(_,i)=>fn(i%width,Math.floor(i/width)))});
const prop=(name,x,y,crop,properties={})=>({id:nextId++,name,type:'prop',x,y,width:crop[2],height:crop[3],rotation:0,visible:true,properties:[['cropX',crop[0]],['cropY',crop[1]],['cropW',crop[2]],['cropH',crop[3]],['scale',properties.scale??1],['originY',properties.originY??1],...Object.entries(properties).filter(([key])=>!['scale','originY'].includes(key))].map(([name,value])=>({name,type:typeof value==='boolean'?'bool':typeof value==='number'?'float':'string',value}))});
const rect=(name,x,y,width,height,type,properties={})=>({id:nextId++,name,type,x,y,width,height,rotation:0,visible:true,properties:Object.entries(properties).map(([name,value])=>({name,type:typeof value==='boolean'?'bool':typeof value==='number'?'float':'string',value}))});
let nextId=1;const layers=[];
layers.push(tileLayer('Ground',(x,y)=>x===0||y===0||x===width-1||y===height-1?5:((x+y)%11===0?2:(x>7&&x<16&&y>4&&y<11?3:1))));
layers.push(tileLayer('Ground Detail',(x,y)=>(x+y*3)%23===0?4:0));
layers.push(tileLayer('Walls',(x,y)=>x===0||y===0||x===width-1||y===height-1?5:0));

const low=[];
for(const [name,x,y,crop,scale] of [
  ['lantern_west',980,2510,[55,65,300,420],.62],['lantern_east',5160,2510,[55,65,300,420],.62],
  ['crystal_west',1250,1340,[390,70,310,445],.68],['crystal_east',4890,1340,[390,70,310,445],.68],
  ['offering_pots',3820,860,[665,125,420,410],.58],['fox_statue',2100,920,[390,540,310,430],.64]
]) low.push(prop(name,x,y,crop,{scale,collisionRadius:name.includes('lantern')?48:70}));
layers.push({id:layers.length+1,name:'Props Below Player',type:'objectgroup',draworder:'topdown',opacity:1,visible:true,objects:low});

const collision=[
  rect('boundary_north',0,0,6144,220,'collision'),rect('boundary_south',0,3620,6144,220,'collision'),rect('boundary_west',0,0,260,3840,'collision'),rect('boundary_east',5884,0,260,3840,'collision'),
  rect('shrine_building',2440,220,1260,610,'collision'),rect('west_root_mass',260,600,720,800,'collision'),rect('east_root_mass',5160,600,724,800,'collision'),
  rect('west_rockwork',260,2590,650,760,'collision'),rect('east_rockwork',5234,2590,650,760,'collision')
];
layers.push({id:layers.length+1,name:'Collision',type:'objectgroup',draworder:'topdown',opacity:1,visible:false,objects:collision});

layers.push({id:layers.length+1,name:'Props / Interactive',type:'objectgroup',draworder:'topdown',opacity:1,visible:true,objects:[
  prop('breakable_crate',1860,2780,[1100,155,330,350],{scale:.62,destructible:true,health:18,collisionRadius:54}),
  prop('breakable_pots',4310,2790,[665,125,420,410],{scale:.48,destructible:true,health:10,collisionRadius:46}),
  prop('spirit_shrine',3072,1010,[700,535,360,415],{scale:.86,interaction:'shrine',collisionRadius:105})
]});

layers.push({id:layers.length+1,name:'Doors / Gates',type:'objectgroup',draworder:'topdown',opacity:1,visible:true,objects:[
  rect('gate_north',2800,735,544,128,'door',{state:'combat-sealed',destination:'jade_bamboo_bridge',collision:true,sealColor:'#45f0e3'}),
  rect('gate_south',2800,3510,544,110,'door',{state:'open',destination:'jade_training_yard',collision:false})
]});

layers.push({id:layers.length+1,name:'Enemy Spawns',type:'objectgroup',draworder:'topdown',opacity:1,visible:true,objects:[
  rect('enemy_wave_1_a',1450,1460,1,1,'enemySpawn',{enemyType:'groveMinion',wave:1,delay:.6}),rect('enemy_wave_1_b',4690,1460,1,1,'enemySpawn',{enemyType:'groveMinion',wave:1,delay:1.6}),
  rect('enemy_wave_1_c',1660,2130,1,1,'enemySpawn',{enemyType:'groveMinion',wave:1,delay:2.6}),rect('enemy_wave_1_d',4480,2130,1,1,'enemySpawn',{enemyType:'groveMinion',wave:1,delay:3.6}),
  rect('enemy_wave_2_archer',3072,1260,1,1,'enemySpawn',{enemyType:'spiritArcher',wave:2,delay:1.2})
]});
layers.push({id:layers.length+1,name:'Player Spawn',type:'objectgroup',draworder:'topdown',opacity:1,visible:true,objects:[rect('player_spawn',3072,2460,1,1,'playerSpawn',{facing:'north'})]});
layers.push({id:layers.length+1,name:'Triggers',type:'objectgroup',draworder:'topdown',opacity:1,visible:true,objects:[
  rect('tutorial_welcome',2570,2880,1000,420,'trigger',{triggerType:'cutscene',cutsceneId:'jade_arrival',once:true}),
  rect('courtyard_combat',1120,1080,3904,1970,'trigger',{triggerType:'encounter',encounterId:'jade_shrine_opening',once:true})
]});

layers.push({id:layers.length+1,name:'Foreground / Occlusion',type:'objectgroup',draworder:'topdown',opacity:1,visible:true,objects:[
  prop('west_bamboo_canopy',600,1770,[35,535,340,430],{scale:1.1,foreground:true}),prop('east_bush_canopy',5550,1860,[1040,570,400,390],{scale:1.15,foreground:true}),
  prop('shrine_roof',3072,700,[690,520,380,430],{scale:1.42,foreground:true,originY:.82})
]});
layers.push({id:layers.length+1,name:'VFX Anchors',type:'objectgroup',draworder:'topdown',opacity:1,visible:true,objects:[
  rect('wisp_west',1180,1750,1,1,'vfx',{effect:'spiritWisp',color:'#45eaff'}),rect('wisp_east',4960,1750,1,1,'vfx',{effect:'spiritWisp',color:'#c44cff'}),
  rect('petal_field',3072,1940,1,1,'vfx',{effect:'fallingPetals',radius:1250}),rect('lantern_glow_north',3072,790,1,1,'vfx',{effect:'lanternGlow',color:'#ff9a32'})
]});

const map={compressionlevel:-1,height,width,infinite:false,layers,nextlayerid:layers.length+1,nextobjectid:nextId,orientation:'orthogonal',renderorder:'right-down',tiledversion:'1.11.2',tileheight,tilewidth,type:'map',version:'1.10',tilesets:[{firstgid:1,columns:6,image:'../../../tilesets/jade-grove/jade-ground.svg',imageheight:256,imagewidth:1536,margin:0,name:'jade-ground',spacing:0,tilecount:6,tileheight:256,tilewidth:256}]};
mkdirSync('assets/maps/jade-grove',{recursive:true});
writeFileSync('assets/maps/jade-grove/shrine-courtyard.json',JSON.stringify(map,null,2)+'\n');
