import { mkdirSync, writeFileSync } from 'node:fs';

const W=24,H=15,T=256,PIXEL_W=W*T,PIXEL_H=H*T;
const REQUIRED=['Ground','Ground Detail','Walls','Props Below Player','Collision','Props / Interactive','Doors / Gates','Enemy Spawns','Player Spawn','Triggers','Foreground / Occlusion','VFX Anchors'];
const CROP={lantern:[55,65,300,420],crystal:[390,70,310,445],pots:[665,125,420,410],statue:[390,540,310,430],shrine:[700,535,360,415],gate:[690,520,380,430],crate:[1100,155,330,350],bamboo:[35,535,340,430],bush:[1040,570,400,390]};

const ROOMS=[
  {id:'jadeCourtyard',file:'shrine-courtyard',name:'Shrine Courtyard',next:'jadeMoonbridge',theme:'courtyard',detail:3,internal:[[2440,220,1260,610,'shrine_building'],[260,600,720,800,'west_root_mass'],[5160,600,724,800,'east_root_mass']]},
  {id:'jadeMoonbridge',file:'moonbridge-crossing',name:'Moonbridge Crossing',next:'jadeRootGarden',theme:'bridge',detail:4,internal:[[260,650,1780,2120,'west_river_bank'],[4104,650,1780,2120,'east_river_bank'],[2570,1370,270,450,'broken_bridge_west'],[3304,1960,270,430,'broken_bridge_east']]},
  {id:'jadeRootGarden',file:'root-covered-plaza',name:'Root-Covered Plaza',next:'jadeBellTerraces',theme:'roots',detail:2,internal:[[1020,760,700,540,'root_island_nw'],[4420,760,700,540,'root_island_ne'],[800,2560,920,500,'root_island_sw'],[4420,2560,920,500,'root_island_se'],[2780,1550,584,520,'ancient_root_heart']]},
  {id:'jadeBellTerraces',file:'bell-terraces',name:'Jade Bell Terraces',next:'jadeLanternCanals',theme:'terraces',detail:3,internal:[[260,850,1450,300,'terrace_west_high'],[4434,850,1450,300,'terrace_east_high'],[260,2180,1120,330,'terrace_west_low'],[4764,2180,1120,330,'terrace_east_low'],[2600,1080,944,260,'bell_dais']]},
  {id:'jadeLanternCanals',file:'lantern-canals',name:'Whispering Lantern Canals',next:'jadeWardenProcessional',theme:'canals',detail:4,internal:[[260,920,1760,530,'canal_west_north'],[4124,920,1760,530,'canal_east_north'],[260,2370,1760,510,'canal_west_south'],[4124,2370,1760,510,'canal_east_south'],[2770,1450,260,540,'canal_pillar_w'],[3114,1840,260,530,'canal_pillar_e']]},
  {id:'jadeWardenProcessional',file:'warden-processional',name:'Jade Warden Processional',next:'jadeGuardianApproach',theme:'processional',detail:2,internal:[[260,620,1200,2260,'processional_wall_w'],[4684,620,1200,2260,'processional_wall_e'],[2220,1020,470,300,'guardian_plinth_w'],[3454,1020,470,300,'guardian_plinth_e'],[2220,2370,470,300,'guardian_plinth_sw'],[3454,2370,470,300,'guardian_plinth_se']]},
  {id:'jadeGuardianApproach',file:'jadebreaker-courtyard',name:'Jadebreaker Boss Courtyard',next:'bambooHollow',theme:'boss',detail:3,boss:true,internal:[[260,470,940,930,'boss_cliff_nw'],[4944,470,940,930,'boss_cliff_ne'],[260,2760,940,600,'boss_cliff_sw'],[4944,2760,940,600,'boss_cliff_se']]},
  {id:'jadeBrokenPavilion',file:'broken-pavilion',name:'Broken Pavilion',next:'jadeRootGarden',theme:'pavilion',detail:4,optional:true,internal:[[2180,520,1784,590,'pavilion_ruin'],[760,1260,650,420,'fallen_roof_w'],[4734,1260,650,420,'fallen_roof_e'],[2830,2040,484,360,'collapsed_altar']]},
  {id:'jadeCrystalClearing',file:'spirit-crystal-clearing',name:'Spirit Crystal Clearing',next:'jadeBellTerraces',theme:'crystal',detail:2,optional:true,internal:[[1000,840,520,620,'crystal_mass_nw'],[4624,840,520,620,'crystal_mass_ne'],[1120,2520,600,470,'crystal_mass_sw'],[4424,2520,600,470,'crystal_mass_se']]},
  {id:'jadeTrainingYard',file:'abandoned-training-yard',name:'Abandoned Training Yard',next:'jadeMoonbridge',theme:'training',detail:3,optional:true,internal:[[950,820,430,900,'dummy_row_w'],[4764,820,430,900,'dummy_row_e'],[1980,2260,500,280,'weapon_rack_w'],[3664,2260,500,280,'weapon_rack_e']]}
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
    if(definition.theme==='bridge')return x>=9&&x<=14?(y>4&&y<11?3:1):2;
    if(definition.theme==='processional')return x>=8&&x<=15?((x+y)%5===0?3:1):2;
    if(definition.theme==='canals')return (x<8||x>15)&&y>3&&y<12?2:((x+y)%8===0?4:1);
    if(definition.theme==='boss')return Math.hypot(x-11.5,(y-7)*1.4)<6?3:((x+y)%9===0?2:1);
    if(definition.theme==='terraces')return y<5?4:y<10?1:2;
    return (x+y+definition.detail)%11===0?2:(x>7&&x<16&&y>4&&y<11?3:1);
  };
  layers.push(tileLayer('Ground',ground));
  layers.push(tileLayer('Ground Detail',(x,y)=>(x*definition.detail+y*3+definition.file.length)%19===0?4:0));
  layers.push(tileLayer('Walls',(x,y)=>edge(x,y)?5:0));

  const low=[
    prop(`${definition.theme}_lantern_w`,890,2450,CROP.lantern,{scale:.62,collisionRadius:48}),prop(`${definition.theme}_lantern_e`,5254,2450,CROP.lantern,{scale:.62,collisionRadius:48}),
    prop(`${definition.theme}_crystal_w`,1300,1120,CROP.crystal,{scale:.64,collisionRadius:68}),prop(`${definition.theme}_crystal_e`,4844,1120,CROP.crystal,{scale:.64,collisionRadius:68}),
    prop(`${definition.theme}_offerings`,3920,760,CROP.pots,{scale:.5,collisionRadius:46})
  ];
  if(definition.theme!=='bridge')low.push(prop(`${definition.theme}_guardian_statue`,2160,760,CROP.statue,{scale:.58,collisionRadius:72}));
  layers.push(group('Props Below Player',low));

  const collision=[
    object('boundary_north_west',0,0,2800,220,'collision'),object('boundary_north_east',3344,0,2800,220,'collision'),
    object('boundary_south_west',0,3620,2800,220,'collision'),object('boundary_south_east',3344,3620,2800,220,'collision'),
    object('boundary_west',0,0,260,3840,'collision'),object('boundary_east',5884,0,260,3840,'collision'),
    ...definition.internal.map(([x,y,width,height,name])=>object(name,x,y,width,height,'collision'))
  ];
  layers.push(group('Collision',collision,false));

  const interactives=[
    prop(`${definition.theme}_crate_a`,1780,2780,CROP.crate,{scale:.6,destructible:true,kind:'crate',health:22,collisionRadius:52}),
    prop(`${definition.theme}_pots_a`,4360,2800,CROP.pots,{scale:.46,destructible:true,kind:'pot',health:12,collisionRadius:44}),
    prop(`${definition.theme}_crate_b`,4550,1720,CROP.crate,{scale:.52,destructible:true,kind:'crate',health:22,collisionRadius:50}),
    prop(`${definition.theme}_shrine`,3072,definition.boss?650:940,CROP.shrine,{scale:definition.boss?1.05:.78,interaction:definition.boss?'bossSeal':'shrine',collisionRadius:105})
  ];
  layers.push(group('Props / Interactive',interactives));

  layers.push(group('Doors / Gates',[
    object('gate_forward',2800,260,544,260,'door',{state:'combat-sealed',direction:'forward',destination:definition.next,collision:true,sealColor:'#45f0e3'}),
    object('gate_return',2800,3570,544,150,'door',{state:'open',direction:'back',destination:'previous',collision:false})
  ]));

  const spawnCandidates=[];
  for(const y of [620,900,1220,1550,1900,2250,2600,2940,3260])for(const x of [620,980,1380,1780,2180,2580,3072,3564,3964,4364,4764,5164,5524])spawnCandidates.push([x,y]);
  const blocked=([x,y])=>definition.internal.some(([rx,ry,rw,rh])=>x>rx-150&&x<rx+rw+150&&y>ry-150&&y<ry+rh+150);
  const safeCandidates=spawnCandidates.filter((point)=>!blocked(point)),offset=definition.file.length%safeCandidates.length;
  const spawnPoints=Array.from({length:14},(_,index)=>safeCandidates[(offset+index*7)%safeCandidates.length]);
  layers.push(group('Enemy Spawns',spawnPoints.map(([x,y],index)=>object(`enemy_spawn_${String(index+1).padStart(2,'0')}`,x,y,1,1,'enemySpawn',{spawnIndex:index,role:index<6?'ranged':index<12?'flank':'center',delay:Number((index*.18).toFixed(2))}))));
  layers.push(group('Player Spawn',[object('player_spawn',3072,3310,1,1,'playerSpawn',{facing:'north'})]));
  const triggers=[
    object(`${definition.theme}_encounter`,650,520,4844,2750,'trigger',{triggerType:'encounter',encounterId:`${definition.id}_encounter`,once:true}),
    object(`${definition.theme}_arrival`,2440,3020,1264,480,'trigger',{triggerType:'cutscene',cutsceneId:`${definition.id}_arrival`,once:true}),
    object(`${definition.theme}_exit`,2700,240,744,430,'trigger',{triggerType:'roomExit',destination:definition.next,requiresClear:true})
  ];
  if(definition.boss)triggers.push(object('jadebreaker_intro',1760,980,2624,1320,'trigger',{triggerType:'cutscene',cutsceneId:'jadebreaker_intro',once:true}));
  layers.push(group('Triggers',triggers));

  layers.push(group('Foreground / Occlusion',[
    prop(`${definition.theme}_canopy_w`,570,1740,CROP.bamboo,{scale:1.12,foreground:true}),prop(`${definition.theme}_canopy_e`,5570,1820,CROP.bush,{scale:1.16,foreground:true}),
    prop(`${definition.theme}_roof`,3072,620,CROP.gate,{scale:1.35,foreground:true,originY:.82})
  ]));
  layers.push(group('VFX Anchors',[
    object(`${definition.theme}_wisp_w`,1100,1660,1,1,'vfx',{effect:'spiritWisp',color:'#45eaff'}),object(`${definition.theme}_wisp_e`,5044,1660,1,1,'vfx',{effect:'spiritWisp',color:'#c44cff'}),
    object(`${definition.theme}_petals`,3072,1940,1,1,'vfx',{effect:'fallingPetals',radius:1300}),object(`${definition.theme}_lantern_glow`,3072,690,1,1,'vfx',{effect:'lanternGlow',color:'#ff9a32'})
  ]));

  if(!REQUIRED.every((name)=>layers.some((layer)=>layer.name===name)))throw new Error(`${definition.id} has an incomplete layer contract.`);
  const mapProperties={roomId:definition.id,displayName:definition.name,template:definition.theme,isOptional:Boolean(definition.optional),isBoss:Boolean(definition.boss)};
  const tileset={firstgid:1,columns:6,image:'../../../tilesets/jade-grove/jade-ground.svg',imageheight:256,imagewidth:1536,margin:0,name:'jade-ground',spacing:0,tilecount:6,tileheight:T,tilewidth:T};
  return {compressionlevel:-1,height:H,width:W,infinite:false,layers,nextlayerid:layers.length+1,nextobjectid:nextId,orientation:'orthogonal',renderorder:'right-down',tiledversion:'1.11.2',tileheight:T,tilewidth:T,type:'map',version:'1.10',properties:properties(mapProperties),tilesets:[tileset]};
}

mkdirSync('assets/maps/jade-grove',{recursive:true});
for(const definition of ROOMS)writeFileSync(`assets/maps/jade-grove/${definition.file}.json`,JSON.stringify(buildRoom(definition),null,2)+'\n');
console.log(`Built ${ROOMS.length} layered Jade Grove maps (${PIXEL_W}x${PIXEL_H} each).`);
