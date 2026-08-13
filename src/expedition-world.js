const CHAPTER_REGION_SETS=[
  {id:'jade',name:'JADE GROVE',color:'#71ef67',rooms:['jadeCourtyard','jadeMoonbridge','jadeRootGarden','jadeBellTerraces','jadeLanternCanals','jadeWardenProcessional','jadeGuardianApproach'],branches:['jadeBrokenPavilion','jadeCrystalClearing','jadeTrainingYard']},
  {id:'bamboo',name:'BAMBOO HOLLOW',color:'#62e99b',rooms:['bambooHollow','bambooMoonbridge','bambooSporeMarsh','bambooMoonlotusReservoir','bambooSporelightMonastery','bambooMoonstoneCauseway','bambooMoonfangBurrow'],branches:['bambooWhisperingGrotto','bambooLotusSanctuary','bambooHunterCamp']},
  {id:'crimson',name:'CRIMSON DOJO',color:'#ff5b55',rooms:['crimsonDojo','crimsonBellCourt','crimsonWarYard','crimsonCinderRooftops','crimsonDrumFoundry','crimsonWarProcessional','crimsonOniGate'],branches:['crimsonFoxfireArchive','crimsonAncestorShrine','crimsonExecutionYard']},
  {id:'storm',name:'STORM COAST',color:'#46e9ff',rooms:['stormTempestHarbor','stormTideglassCauseway','stormDrownedBellSanctum','stormSirenReefMonastery','stormThunderbreakLighthouse','stormSkyfangAscent','stormEyeOfTempest'],branches:['stormPearlCove','stormTidekeeperShrine','stormRaiderWreck']},
  {id:'neon',name:'NEON CITY',color:'#ff42be',rooms:['neonRainGate','neonCircuitMarket','neonHologramArcade','neonSkyrailShrine','neonDataLotusGardens','neonShogunTower','neonShogunCore'],branches:['neonMemoryBazaar','neonPulseShrine','neonKernelFoundry']},
  {id:'shadow',name:'SHADOW REALM',color:'#bd6cff',rooms:['shadowObsidianPath','shadowMirrorgraveVillage','shadowWraithwoodCrossing','shadowEclipseArchive','shadowMoonlessProcessional','shadowUmbralPalaceSteps','shadowThroneBeyondMoon'],branches:['shadowForsakenMirrorVault','shadowEclipseSanctuary','shadowDreadmoonPrison']}
];

const REGION_GAP_X=7200,REGION_GAP_Y=1260,BRANCH_GAP_Y=2700;
const nodes=[],links=[];
for(const [chapterIndex,chapter] of CHAPTER_REGION_SETS.entries()){
  const baseX=chapterIndex*REGION_GAP_X;
  chapter.rooms.forEach((roomId,index)=>nodes.push({roomId,chapterIndex,biome:chapter.id,biomeName:chapter.name,color:chapter.color,kind:index===6?'guardian':'main',order:index,x:baseX+index*920,y:5200+(index%2?REGION_GAP_Y:0)}));
  chapter.branches.forEach((roomId,index)=>nodes.push({roomId,chapterIndex,biome:chapter.id,biomeName:chapter.name,color:chapter.color,kind:['event','shrine','elite'][index],order:7+index,x:baseX+(index+2)*1200,y:5200+(index===1?-BRANCH_GAP_Y:BRANCH_GAP_Y)}));
  for(let index=0;index<chapter.rooms.length-1;index++)links.push({from:chapter.rooms[index],to:chapter.rooms[index+1],kind:'main'});
  links.push({from:chapter.rooms[1],to:chapter.branches[0],kind:'branch'},{from:chapter.branches[0],to:chapter.rooms[2],kind:'branch'},{from:chapter.rooms[3],to:chapter.branches[1],kind:'branch'},{from:chapter.branches[1],to:chapter.rooms[4],kind:'branch'},{from:chapter.rooms[4],to:chapter.branches[2],kind:'branch'},{from:chapter.branches[2],to:chapter.rooms[5],kind:'branch'});
  if(chapterIndex<CHAPTER_REGION_SETS.length-1)links.push({from:chapter.rooms[6],to:CHAPTER_REGION_SETS[chapterIndex+1].rooms[0],kind:'realm'});
}

export const EXPEDITION_WORLD={
  id:'spiritRoadExpeditionOne',name:'THE SIX-REALM SPIRIT ROAD',width:REGION_GAP_X*5+6900,height:10800,nodes,links,
  chapters:CHAPTER_REGION_SETS.map(({id,name,color,rooms,branches})=>({id,name,color,rooms:[...rooms],branches:[...branches]}))
};

const NODE_BY_ROOM=new Map(nodes.map((node)=>[node.roomId,node]));
const START_ROOM=CHAPTER_REGION_SETS[0].rooms[0];
const DEPTH_BY_ROOM=new Map([[START_ROOM,0]]),queue=[START_ROOM];
while(queue.length){
  const roomId=queue.shift(),depth=DEPTH_BY_ROOM.get(roomId);
  for(const neighbor of links.flatMap((link)=>link.from===roomId?[link.to]:link.to===roomId?[link.from]:[])){
    if(DEPTH_BY_ROOM.has(neighbor))continue;DEPTH_BY_ROOM.set(neighbor,depth+1);queue.push(neighbor);
  }
}
const MAX_DEPTH=Math.max(...DEPTH_BY_ROOM.values());
export const EXPEDITION_THREAT_BANDS=[
  {id:'landing',name:'LANDING',min:0,color:'#78f07a',enemyHealth:1,enemyDamage:1,enemySpeed:1,enemyCount:1,spawnRate:1,xp:1,gold:1,cache:1,loot:'COMMON'},
  {id:'wild',name:'WILD',min:.12,color:'#55e8c0',enemyHealth:1.03,enemyDamage:1.04,enemySpeed:1.02,enemyCount:1.04,spawnRate:1.03,xp:1.1,gold:1.12,cache:1.18,loot:'UNCOMMON'},
  {id:'dangerous',name:'DANGEROUS',min:.28,color:'#43cfff',enemyHealth:1.08,enemyDamage:1.1,enemySpeed:1.05,enemyCount:1.08,spawnRate:1.07,xp:1.23,gold:1.28,cache:1.42,loot:'RARE'},
  {id:'deadly',name:'DEADLY',min:.46,color:'#bc66ff',enemyHealth:1.15,enemyDamage:1.18,enemySpeed:1.08,enemyCount:1.13,spawnRate:1.12,xp:1.4,gold:1.48,cache:1.78,loot:'EPIC'},
  {id:'cursed',name:'CURSED',min:.66,color:'#ff4b9b',enemyHealth:1.24,enemyDamage:1.28,enemySpeed:1.12,enemyCount:1.19,spawnRate:1.18,xp:1.62,gold:1.72,cache:2.18,loot:'LEGENDARY'},
  {id:'mythic',name:'MYTHIC',min:.84,color:'#ffca4a',enemyHealth:1.36,enemyDamage:1.4,enemySpeed:1.16,enemyCount:1.25,spawnRate:1.24,xp:1.9,gold:2.05,cache:2.72,loot:'MYTHIC'}
];
export const EXPEDITION_LOOT_TIERS=[
  {id:'common',name:'COMMON',color:'#a7b2bd',multiplier:1},
  {id:'uncommon',name:'UNCOMMON',color:'#61ed83',multiplier:1.3},
  {id:'rare',name:'RARE',color:'#47dfff',multiplier:1.72},
  {id:'epic',name:'EPIC',color:'#c969ff',multiplier:2.25},
  {id:'legendary',name:'LEGENDARY',color:'#ff8b38',multiplier:3.05},
  {id:'mythic',name:'MYTHIC',color:'#ffe06a',multiplier:4.1}
];
export const expeditionNode=(roomId)=>NODE_BY_ROOM.get(roomId)||null;
export const expeditionNeighbors=(roomId)=>links.flatMap((link)=>link.from===roomId?[link.to]:link.to===roomId?[link.from]:[]);
export function expeditionThreat(roomId){
  const node=expeditionNode(roomId),depth=DEPTH_BY_ROOM.get(roomId)??0,progress=MAX_DEPTH?depth/MAX_DEPTH:0;
  const band=[...EXPEDITION_THREAT_BANDS].reverse().find((entry)=>progress>=entry.min)||EXPEDITION_THREAT_BANDS[0];
  return {...band,depth,maxDepth:MAX_DEPTH,progress,branchBonus:node&&node.kind!=='main'&&node.kind!=='guardian'?.12:0};
}
export function expeditionLoot(roomId,seed=0){
  const threat=expeditionThreat(roomId),node=expeditionNode(roomId),branchBonus=node&&node.kind!=='main'&&node.kind!=='guardian'?1:0;
  const roll=Math.abs(Math.imul((seed|0)+17,2654435761)+(roomId||'').split('').reduce((sum,char)=>sum+char.charCodeAt(0)*31,0))%100;
  const base=Math.min(EXPEDITION_LOOT_TIERS.length-1,EXPEDITION_THREAT_BANDS.findIndex((entry)=>entry.id===threat.id));
  const tierIndex=Math.max(0,Math.min(EXPEDITION_LOOT_TIERS.length-1,base+(branchBonus&&roll<72?1:0)-(roll>84?1:0)));
  return {...EXPEDITION_LOOT_TIERS[tierIndex],threat:threat.id};
}
export function expeditionWorldPosition(roomId,localX=3072,localY=1940){
  const node=expeditionNode(roomId);if(!node)return {x:localX,y:localY};
  return {x:node.x+(localX-3072)*.18,y:node.y+(localY-1940)*.18};
}
export function expeditionProgress(discovered=[]){
  const known=discovered instanceof Set?discovered:new Set(discovered),count=nodes.reduce((total,node)=>total+(known.has(node.roomId)?1:0),0);return {discovered:count,total:nodes.length,ratio:nodes.length?count/nodes.length:0};
}
