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
export const expeditionNode=(roomId)=>NODE_BY_ROOM.get(roomId)||null;
export const expeditionNeighbors=(roomId)=>links.flatMap((link)=>link.from===roomId?[link.to]:link.to===roomId?[link.from]:[]);
export function expeditionWorldPosition(roomId,localX=3072,localY=1940){
  const node=expeditionNode(roomId);if(!node)return {x:localX,y:localY};
  return {x:node.x+(localX-3072)*.18,y:node.y+(localY-1940)*.18};
}
export function expeditionProgress(discovered=[]){
  const known=discovered instanceof Set?discovered:new Set(discovered),count=nodes.reduce((total,node)=>total+(known.has(node.roomId)?1:0),0);return {discovered:count,total:nodes.length,ratio:nodes.length?count/nodes.length:0};
}
