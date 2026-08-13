import { mkdirSync, writeFileSync } from 'node:fs';

const W=24,H=15,T=256,PIXEL_W=W*T,PIXEL_H=H*T;
const REQUIRED=['Ground','Ground Detail','Walls','Props Below Player','Collision','Props / Interactive','Doors / Gates','Enemy Spawns','Player Spawn','Triggers','Foreground / Occlusion','VFX Anchors'];
const CROP={lantern:[55,65,300,420],crystal:[390,70,310,445],pots:[665,125,420,410],statue:[390,540,310,430],shrine:[700,535,360,415],gate:[690,520,380,430],crate:[1100,155,330,350],bamboo:[35,535,340,430],bush:[1040,570,400,390]};

const ROOMS=[
  {id:'bambooHollow',file:'hollow-gate',name:'Bamboo Hollow Gate',next:'bambooMoonbridge',theme:'hollow',detail:2,internal:[[260,610,1040,1840,'bamboo_wall_w'],[4844,610,1040,1840,'bamboo_wall_e'],[2250,610,520,460,'moon_gate_w'],[3374,610,520,460,'moon_gate_e']]},
  {id:'bambooMoonbridge',file:'moonlit-reedbridge',name:'Moonlit Reedbridge',next:'bambooSporeMarsh',theme:'reedbridge',detail:4,internal:[[260,610,1850,2280,'river_w'],[4034,610,1850,2280,'river_e'],[2600,1180,240,520,'broken_rail_w'],[3304,2050,240,500,'broken_rail_e']]},
  {id:'bambooSporeMarsh',file:'spore-shrine-marsh',name:'Spore Shrine Marsh',next:'bambooMoonlotusReservoir',theme:'marsh',detail:5,internal:[[760,760,870,620,'spore_pool_nw'],[4514,760,870,620,'spore_pool_ne'],[620,2420,1180,520,'spore_pool_sw'],[4344,2420,1180,520,'spore_pool_se'],[2740,1500,664,500,'spore_totem_isle']]},
  {id:'bambooMoonlotusReservoir',file:'moonlotus-reservoir',name:'Moonlotus Reservoir',next:'bambooSporelightMonastery',theme:'reservoir',detail:3,internal:[[260,780,1640,1900,'reservoir_w'],[4244,780,1640,1900,'reservoir_e'],[2200,700,520,540,'lotus_pier_w'],[3424,700,520,540,'lotus_pier_e'],[2790,2380,564,340,'ward_island']]},
  {id:'bambooSporelightMonastery',file:'sporelight-monastery',name:'Sporelight Monastery',next:'bambooMoonstoneCauseway',theme:'monastery',detail:2,internal:[[1650,490,2844,620,'monastery_hall'],[750,1280,660,460,'bell_house_w'],[4734,1280,660,460,'bell_house_e'],[2580,2050,984,420,'meditation_dais']]},
  {id:'bambooMoonstoneCauseway',file:'moonstone-causeway',name:'Hollow Moonstone Causeway',next:'bambooMoonfangBurrow',theme:'causeway',detail:4,internal:[[260,570,1450,2390,'moon_cliff_w'],[4434,570,1450,2390,'moon_cliff_e'],[2130,1150,490,290,'chain_pillar_w'],[3524,1150,490,290,'chain_pillar_e'],[2130,2380,490,290,'chain_pillar_sw'],[3524,2380,490,290,'chain_pillar_se']]},
  {id:'bambooMoonfangBurrow',file:'moonfang-burrow',name:'Moonfang Burrow',next:'crimsonDojo',theme:'moonfang',detail:3,boss:true,internal:[[260,470,1180,1020,'burrow_nw'],[4704,470,1180,1020,'burrow_ne'],[260,2740,1180,620,'burrow_sw'],[4704,2740,1180,620,'burrow_se']]},
  {id:'bambooWhisperingGrotto',file:'whispering-grotto',name:'Whispering Grotto',next:'bambooSporeMarsh',theme:'grotto',detail:5,optional:true,internal:[[700,650,1180,720,'grotto_pool_w'],[4264,650,1180,720,'grotto_pool_e'],[2380,1780,1384,440,'echo_cavern'],[900,2600,760,430,'crystal_shelf_w'],[4484,2600,760,430,'crystal_shelf_e']]},
  {id:'bambooLotusSanctuary',file:'lotus-sanctuary',name:'Moonlotus Sanctuary',next:'bambooSporelightMonastery',theme:'sanctuary',detail:3,optional:true,internal:[[2250,540,1644,650,'sanctuary_hall'],[850,1260,710,520,'lotus_garden_w'],[4584,1260,710,520,'lotus_garden_e'],[2730,2180,684,420,'healing_pool']]},
  {id:'bambooHunterCamp',file:'reedblade-hunter-camp',name:'Reedblade Hunter Camp',next:'bambooMoonbridge',theme:'hunter',detail:4,optional:true,internal:[[820,720,780,620,'hunter_tents_w'],[4544,720,780,620,'hunter_tents_e'],[1120,2420,650,410,'cage_w'],[4374,2420,650,410,'cage_e'],[2720,1420,704,470,'war_table']]}
];

const typeOf=(value)=>typeof value==='boolean'?'bool':typeof value==='number'?'float':'string';
const properties=(values)=>Object.entries(values).map(([name,value])=>({name,type:typeOf(value),value}));

function buildRoom(definition){
  let nextId=1;const layers=[];
  const tileLayer=(name,fn)=>({id:layers.length+1,name,type:'tilelayer',width:W,height:H,x:0,y:0,opacity:1,visible:true,data:Array.from({length:W*H},(_,i)=>fn(i%W,Math.floor(i/W)))});
  const object=(name,x,y,width,height,type,values={})=>({id:nextId++,name,type,x,y,width,height,rotation:0,visible:true,properties:properties(values)});
  const prop=(name,x,y,crop,values={})=>object(name,x,y,crop[2],crop[3],'prop',{cropX:crop[0],cropY:crop[1],cropW:crop[2],cropH:crop[3],scale:values.scale??1,originY:values.originY??1,...values});
  const group=(name,objects,visible=true)=>({id:layers.length+1,name,type:'objectgroup',draworder:'topdown',opacity:1,visible,objects});
  const edge=(x,y)=>x===0||y===0||x===W-1||y===H-1;
  const ground=(x,y)=>{
    if(edge(x,y))return 5;
    if(definition.theme==='reedbridge')return x>=9&&x<=14?(y>3&&y<12?4:1):3;
    if(definition.theme==='marsh'||definition.theme==='grotto')return (x<7||x>16)&&y>3&&y<12?3:((x+y)%7===0?2:1);
    if(definition.theme==='reservoir')return x<8||x>15?3:((x+y)%9===0?4:1);
    if(definition.theme==='causeway')return x>=8&&x<=15?((x+y)%6===0?4:1):2;
    if(definition.theme==='moonfang')return Math.hypot(x-11.5,(y-7)*1.35)<6?4:((x+y)%8===0?2:1);
    if(definition.theme==='monastery'||definition.theme==='sanctuary')return y<5?4:y<10?1:2;
    return (x+y+definition.detail)%10===0?2:(x>7&&x<16&&y>4&&y<11?4:1);
  };
  layers.push(tileLayer('Ground',ground));layers.push(tileLayer('Ground Detail',(x,y)=>(x*definition.detail+y*5+definition.file.length)%17===0?6:0));layers.push(tileLayer('Walls',(x,y)=>edge(x,y)?5:0));
  const low=[prop(`${definition.theme}_bamboo_w`,820,2390,CROP.bamboo,{scale:.82,collisionRadius:62}),prop(`${definition.theme}_bamboo_e`,5324,2390,CROP.bamboo,{scale:.82,collisionRadius:62}),prop(`${definition.theme}_lantern_w`,1280,1080,CROP.lantern,{scale:.57,collisionRadius:44}),prop(`${definition.theme}_lantern_e`,4864,1080,CROP.lantern,{scale:.57,collisionRadius:44}),prop(`${definition.theme}_spore_bush`,3940,760,CROP.bush,{scale:.54,collisionRadius:55})];
  if(definition.theme!=='reedbridge')low.push(prop(`${definition.theme}_moonstone`,2200,800,CROP.crystal,{scale:.58,collisionRadius:65}));layers.push(group('Props Below Player',low));
  layers.push(group('Collision',[object('boundary_north_west',0,0,2800,220,'collision'),object('boundary_north_east',3344,0,2800,220,'collision'),object('boundary_south_west',0,3620,2800,220,'collision'),object('boundary_south_east',3344,3620,2800,220,'collision'),object('boundary_west',0,0,260,3840,'collision'),object('boundary_east',5884,0,260,3840,'collision'),...definition.internal.map(([x,y,width,height,name])=>object(name,x,y,width,height,'collision'))],false));
  layers.push(group('Props / Interactive',[prop(`${definition.theme}_supply_a`,1760,2780,CROP.crate,{scale:.58,destructible:true,kind:'crate',health:28,collisionRadius:52}),prop(`${definition.theme}_spore_pots`,4380,2790,CROP.pots,{scale:.46,destructible:true,kind:'pot',health:16,collisionRadius:45}),prop(`${definition.theme}_supply_b`,4660,1770,CROP.crate,{scale:.5,destructible:true,kind:'crate',health:28,collisionRadius:50}),prop(`${definition.theme}_moon_shrine`,3072,definition.boss?650:930,CROP.shrine,{scale:definition.boss?1.12:.8,interaction:definition.boss?'bossSeal':'moonShrine',collisionRadius:110})]));
  layers.push(group('Doors / Gates',[object('gate_forward',2800,260,544,260,'door',{state:'combat-sealed',direction:'forward',destination:definition.next,collision:true,sealColor:'#76ffd2'}),object('gate_return',2800,3570,544,150,'door',{state:'open',direction:'back',destination:'previous',collision:false})]));
  const candidates=[];for(const y of [620,900,1220,1550,1900,2250,2600,2940,3260])for(const x of [620,980,1380,1780,2180,2580,3072,3564,3964,4364,4764,5164,5524])candidates.push([x,y]);
  const blocked=([x,y])=>definition.internal.some(([rx,ry,rw,rh])=>x>rx-150&&x<rx+rw+150&&y>ry-150&&y<ry+rh+150),safe=candidates.filter((point)=>!blocked(point)),offset=definition.file.length%safe.length;
  const points=Array.from({length:16},(_,index)=>safe[(offset+index*7)%safe.length]);layers.push(group('Enemy Spawns',points.map(([x,y],index)=>object(`enemy_spawn_${String(index+1).padStart(2,'0')}`,x,y,1,1,'enemySpawn',{spawnIndex:index,role:index<6?'ranged':index<13?'flank':'center',delay:Number((index*.15).toFixed(2))}))));
  layers.push(group('Player Spawn',[object('player_spawn',3072,3310,1,1,'playerSpawn',{facing:'north'})]));
  const triggers=[object(`${definition.theme}_encounter`,650,520,4844,2750,'trigger',{triggerType:'encounter',encounterId:`${definition.id}_encounter`,once:true}),object(`${definition.theme}_arrival`,2440,3020,1264,480,'trigger',{triggerType:'cutscene',cutsceneId:`${definition.id}_arrival`,once:true}),object(`${definition.theme}_exit`,2700,240,744,430,'trigger',{triggerType:'roomExit',destination:definition.next,requiresClear:true})];if(definition.boss)triggers.push(object('moonfang_awaken',1850,700,2444,1900,'trigger',{triggerType:'bossStart',bossId:'moonfangKomainu',once:true}));layers.push(group('Triggers',triggers,false));
  layers.push(group('Foreground / Occlusion',[prop(`${definition.theme}_canopy_w`,320,1840,CROP.bamboo,{scale:1.28,foreground:true,originY:.75}),prop(`${definition.theme}_canopy_e`,5824,1840,CROP.bamboo,{scale:1.28,foreground:true,originY:.75}),prop(`${definition.theme}_roof`,3072,620,CROP.gate,{scale:1.35,foreground:true,originY:.82})]));
  layers.push(group('VFX Anchors',[object(`${definition.theme}_wisp_w`,1100,1660,1,1,'vfx',{effect:'spiritWisp',color:'#79ffd0'}),object(`${definition.theme}_wisp_e`,5044,1660,1,1,'vfx',{effect:'spiritWisp',color:'#bc65ff'}),object(`${definition.theme}_spores`,3072,1940,1,1,'vfx',{effect:'fallingPetals',radius:1350}),object(`${definition.theme}_moon_glow`,3072,690,1,1,'vfx',{effect:'lanternGlow',color:'#79ffe5'})]));
  if(!REQUIRED.every((name)=>layers.some((layer)=>layer.name===name)))throw new Error(`${definition.id} has an incomplete layer contract.`);
  return {compressionlevel:-1,height:H,width:W,infinite:false,layers,nextlayerid:layers.length+1,nextobjectid:nextId,orientation:'orthogonal',renderorder:'right-down',tiledversion:'1.11.2',tileheight:T,tilewidth:T,type:'map',version:'1.10',properties:properties({roomId:definition.id,displayName:definition.name,template:definition.theme,isOptional:Boolean(definition.optional),isBoss:Boolean(definition.boss),biome:'bamboo'}),tilesets:[{firstgid:1,columns:6,image:'../../../tilesets/bamboo-hollow/bamboo-ground.svg',imageheight:256,imagewidth:1536,margin:0,name:'bamboo-ground',spacing:0,tilecount:6,tileheight:T,tilewidth:T}]};
}

mkdirSync('assets/maps/bamboo-hollow',{recursive:true});for(const definition of ROOMS)writeFileSync(`assets/maps/bamboo-hollow/${definition.file}.json`,JSON.stringify(buildRoom(definition),null,2)+'\n');console.log(`Built ${ROOMS.length} layered Bamboo Hollow maps (${PIXEL_W}x${PIXEL_H} each).`);
