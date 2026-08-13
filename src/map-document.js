export const MAP_STORAGE_KEY='brawlpaws.villageMap.v1';
export const MAP_VERSION=1;

export const MAP_ATLASES={
  terrain:{id:'terrain',label:'FLOORS',src:'assets/map-maker/village-terrain-v1.webp',columns:4,rows:4},
  architecture:{id:'architecture',label:'BUILDINGS',src:'assets/map-maker/village-architecture-v1.webp',columns:4,rows:3},
  props:{id:'props',label:'PROPS',src:'assets/map-maker/village-props-v1.webp',columns:5,rows:4}
};

const terrainNames=['Warm Sandstone','Cracked Sandstone','Shrine Engraving','Wet Stone','Packed Earth','Mossy Earth','Gravel','Leaf Soil','Jade Grass','Flowering Grass','Bamboo Deck','Dark Wood','Shallow Water','Deep Water','Spirit Path','Volcanic Stone'];
const architectureNames=['Shrine Hall','Spirit Forge','Dojo Pavilion','Charm Shop','Portal Gate','Moon Shrine','Relic Altar','Mission Shelter','Stone Bridge','Wooden Bridge','Village Gate','Lantern House'];
const propNames=['Cherry Tree','Jade Maple','Bamboo Cluster','Flowering Shrub','Spirit Tree','Mossy Boulder','Rock Cluster','Stone Lantern','Cyan Lantern','Red Lantern','Bamboo Fence','Stone Wall','Market Cart','Shrine Drum','Village Well','Torii Signpost','Barrels & Crates','Spirit Brazier','Blank Banner','Lily Pond'];

const architectureSizes=[
  [720,540],[700,560],[720,520],[700,500],[660,500],[570,500],[590,500],[650,460],[650,420],[620,390],[650,500],[470,430]
];
const propSizes=[
  [390,470],[380,450],[350,420],[310,280],[390,470],[280,210],[300,210],[190,270],[155,245],[155,245],[370,210],[390,220],[350,260],[270,260],[300,250],[270,270],[300,220],[210,260],[230,320],[340,250]
];

export const MAP_ASSETS={
  terrain:terrainNames.map((name,index)=>({id:`terrain-${index}`,name,atlas:'terrain',frame:index,category:'terrain'})),
  architecture:architectureNames.map((name,index)=>({id:`architecture-${index}`,name,atlas:'architecture',frame:index,category:'architecture',width:architectureSizes[index][0],height:architectureSizes[index][1],collision:{width:architectureSizes[index][0]*.66,height:Math.max(75,architectureSizes[index][1]*.18)}})),
  props:propNames.map((name,index)=>({id:`prop-${index}`,name,atlas:'props',frame:index,category:'props',width:propSizes[index][0],height:propSizes[index][1],collision:index<=4?{width:propSizes[index][0]*.42,height:90}:index===10||index===11?{width:propSizes[index][0]*.86,height:55}:index===19?null:{width:propSizes[index][0]*.52,height:Math.max(45,propSizes[index][1]*.18)}}))
};

export const MAP_LAYERS=[
  {id:'ground',name:'Ground',kind:'tile',visible:true,locked:false},
  {id:'groundDetail',name:'Ground Detail',kind:'tile',visible:true,locked:false},
  {id:'structures',name:'Buildings',kind:'object',visible:true,locked:false},
  {id:'props',name:'Props',kind:'object',visible:true,locked:false},
  {id:'foreground',name:'Foreground',kind:'object',visible:true,locked:false},
  {id:'collision',name:'Collision',kind:'geometry',visible:true,locked:false},
  {id:'triggers',name:'Triggers',kind:'geometry',visible:true,locked:false},
  {id:'spawns',name:'Spawns',kind:'point',visible:true,locked:false}
];

let idCounter=0;
export function mapId(prefix='map'){idCounter++;return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;}
export function assetById(id){return [...MAP_ASSETS.terrain,...MAP_ASSETS.architecture,...MAP_ASSETS.props].find((asset)=>asset.id===id)||null;}

function makeObject(assetId,x,y,options={}){
  const asset=assetById(assetId),id=mapId('object');
  const object={id,assetId,atlas:asset.atlas,frame:asset.frame,name:asset.name,x,y,width:options.width||asset.width,height:options.height||asset.height,rotation:options.rotation||0,opacity:1,layer:options.layer||(asset.category==='architecture'?'structures':'props')};
  const collision=asset.collision&&options.collision!==false?{id:mapId('collision'),name:`${asset.name} footprint`,x:x-asset.collision.width/2,y:y-asset.collision.height,width:asset.collision.width,height:asset.collision.height,layer:'collision',sourceObjectId:id,enabled:true}:null;
  return {object,collision};
}

export function createDefaultVillageMap(){
  const tileSize=150,columns=32,rows=18,total=columns*rows;
  const ground=new Array(total).fill(8),detail=new Array(total).fill(-1);
  for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
    const index=row*columns+col,edge=col<2||col>29||row<1||row>16;
    if(edge)ground[index]=(col+row)%3===0?9:8;
    else if(col>=7&&col<=25&&row>=3&&row<=15)ground[index]=(col+row)%9===0?1:0;
    else ground[index]=(col*3+row)%6===0?5:4;
    if(!edge&&((col===15||col===16)||(row===9&&col>3&&col<29)))detail[index]=14;
    if(row>=13&&col>=13&&col<=18)ground[index]=2;
  }
  const objects=[],collisions=[];
  const add=(assetId,x,y,options={})=>{const made=makeObject(assetId,x,y,options);objects.push(made.object);if(made.collision)collisions.push(made.collision);return made.object;};
  add('architecture-0',2400,770);add('architecture-1',3260,950);add('architecture-2',1210,1170);add('architecture-3',3920,1420);
  add('architecture-6',3660,830);add('architecture-7',690,1310);add('architecture-4',2400,2430,{width:760,height:575});
  add('architecture-5',1520,720,{width:520,height:460});
  add('prop-0',380,790);add('prop-0',4450,710);add('prop-1',430,2080);add('prop-4',4320,2120);
  add('prop-2',760,700);add('prop-2',4080,650);add('prop-3',800,2070);add('prop-3',3910,2140);
  add('prop-7',1980,1040);add('prop-8',2820,1040);add('prop-12',3540,1680);add('prop-14',1060,1760);add('prop-15',2380,1230,{collision:false});
  add('prop-17',2140,2050);add('prop-17',2660,2050);add('prop-19',4100,2450,{collision:false});
  collisions.push(
    {id:mapId('collision'),name:'North boundary',x:0,y:0,width:4800,height:80,layer:'collision',enabled:true,boundary:true},
    {id:mapId('collision'),name:'South boundary',x:0,y:2620,width:4800,height:80,layer:'collision',enabled:true,boundary:true},
    {id:mapId('collision'),name:'West boundary',x:0,y:0,width:80,height:2700,layer:'collision',enabled:true,boundary:true},
    {id:mapId('collision'),name:'East boundary',x:4720,y:0,width:80,height:2700,layer:'collision',enabled:true,boundary:true}
  );
  return {version:MAP_VERSION,id:'spirit-lantern-village',name:'Spirit Lantern Village',width:4800,height:2700,tileSize,columns,rows,layers:MAP_LAYERS.map((layer)=>({...layer})),tiles:{ground,groundDetail:detail},objects,collisions,triggers:[{id:mapId('trigger'),name:'Portal Gate',type:'portal',x:2070,y:2140,width:660,height:420,layer:'triggers'}],spawns:[{id:'player-spawn',name:'Player Spawn',type:'player',x:2400,y:1480,layer:'spawns'}],updatedAt:new Date().toISOString()};
}

function normalizeTileArray(value,length,fallback){const output=Array.isArray(value)?value.slice(0,length):[];while(output.length<length)output.push(fallback);return output.map((tile)=>Number.isInteger(Number(tile))?Number(tile):fallback);}
export function sanitizeMapDocument(input){
  const base=createDefaultVillageMap();if(!input||typeof input!=='object')return base;
  const columns=Math.max(4,Math.min(100,Math.round(Number(input.columns)||base.columns))),rows=Math.max(4,Math.min(100,Math.round(Number(input.rows)||base.rows))),tileSize=Math.max(32,Math.min(512,Math.round(Number(input.tileSize)||base.tileSize))),length=columns*rows;
  return {...base,...input,version:MAP_VERSION,width:columns*tileSize,height:rows*tileSize,columns,rows,tileSize,layers:MAP_LAYERS.map((definition)=>({...definition,...(input.layers||[]).find((layer)=>layer.id===definition.id)})),tiles:{ground:normalizeTileArray(input.tiles?.ground,length,8),groundDetail:normalizeTileArray(input.tiles?.groundDetail,length,-1)},objects:Array.isArray(input.objects)?input.objects.filter(Boolean):base.objects,collisions:Array.isArray(input.collisions)?input.collisions.filter(Boolean):base.collisions,triggers:Array.isArray(input.triggers)?input.triggers.filter(Boolean):base.triggers,spawns:Array.isArray(input.spawns)&&input.spawns.length?input.spawns.filter(Boolean):base.spawns};
}

export function loadMapDocument(){try{const saved=localStorage.getItem(MAP_STORAGE_KEY);return saved?sanitizeMapDocument(JSON.parse(saved)):createDefaultVillageMap();}catch{return createDefaultVillageMap();}}
export function saveMapDocument(document){const clean=sanitizeMapDocument(document);clean.updatedAt=new Date().toISOString();localStorage.setItem(MAP_STORAGE_KEY,JSON.stringify(clean));return clean;}
export function resetMapDocument(){const fresh=createDefaultVillageMap();saveMapDocument(fresh);return fresh;}
export function cloneMapDocument(document){return JSON.parse(JSON.stringify(document));}

export function createMapImages(){const images={};for(const atlas of Object.values(MAP_ATLASES)){const image=new Image();image.src=atlas.src;images[atlas.id]=image;}return images;}
export function frameRect(image,atlasId,frame){const atlas=MAP_ATLASES[atlasId],sw=image.naturalWidth/atlas.columns,sh=image.naturalHeight/atlas.rows;return {sx:(frame%atlas.columns)*sw,sy:Math.floor(frame/atlas.columns)*sh,sw,sh};}
export function drawAtlasFrame(ctx,image,atlasId,frame,x,y,width,height,rotation=0,opacity=1){if(!image?.complete||!image.naturalWidth)return false;const source=frameRect(image,atlasId,frame);ctx.save();ctx.globalAlpha=opacity;ctx.translate(x,y);ctx.rotate(rotation);ctx.drawImage(image,source.sx,source.sy,source.sw,source.sh,-width/2,-height,width,height);ctx.restore();return true;}

function layerVisible(document,id){return document.layers.find((layer)=>layer.id===id)?.visible!==false;}
export function drawMapGround(ctx,document,images,{view=null,grid=false}={}){
  ctx.save();ctx.fillStyle='#07110f';ctx.fillRect(0,0,document.width,document.height);
  const tileImage=images.terrain,startCol=view?Math.max(0,Math.floor(view.left/document.tileSize)-1):0,endCol=view?Math.min(document.columns,Math.ceil(view.right/document.tileSize)+1):document.columns,startRow=view?Math.max(0,Math.floor(view.top/document.tileSize)-1):0,endRow=view?Math.min(document.rows,Math.ceil(view.bottom/document.tileSize)+1):document.rows;
  for(const layerId of ['ground','groundDetail']){if(!layerVisible(document,layerId))continue;const tiles=document.tiles[layerId];for(let row=startRow;row<endRow;row++)for(let col=startCol;col<endCol;col++){const frame=tiles[row*document.columns+col];if(frame<0||!tileImage?.complete||!tileImage.naturalWidth)continue;const source=frameRect(tileImage,'terrain',frame);ctx.globalAlpha=layerId==='ground' ? 1 : .72;ctx.drawImage(tileImage,source.sx,source.sy,source.sw,source.sh,col*document.tileSize,row*document.tileSize,document.tileSize+.6,document.tileSize+.6);}}
  ctx.globalAlpha=1;
  if(grid){ctx.strokeStyle='rgba(100,242,255,.18)';ctx.lineWidth=1;ctx.beginPath();for(let col=startCol;col<=endCol;col++){ctx.moveTo(col*document.tileSize,startRow*document.tileSize);ctx.lineTo(col*document.tileSize,endRow*document.tileSize);}for(let row=startRow;row<=endRow;row++){ctx.moveTo(startCol*document.tileSize,row*document.tileSize);ctx.lineTo(endCol*document.tileSize,row*document.tileSize);}ctx.stroke();}
  ctx.restore();
}

export function orderedMapObjects(document,{includeForeground=false}={}){return document.objects.filter((object)=>layerVisible(document,object.layer)&&((object.layer==='foreground')===includeForeground)).sort((a,b)=>(a.y||0)-(b.y||0));}
export function drawMapObjects(ctx,document,images,{view=null,includeForeground=false,selectedId=null}={}){
  for(const object of orderedMapObjects(document,{includeForeground})){
    if(view&&(object.x+object.width/2<view.left||object.x-object.width/2>view.right||object.y<view.top||object.y-object.height>view.bottom))continue;
    if(object.layer!=='foreground'){ctx.save();ctx.fillStyle='rgba(2,4,10,.28)';ctx.beginPath();ctx.ellipse(object.x,object.y-8,Math.max(34,object.width*.22),Math.max(12,Math.min(54,object.height*.055)),0,0,Math.PI*2);ctx.fill();ctx.restore();}
    drawAtlasFrame(ctx,images[object.atlas],object.atlas,object.frame,object.x,object.y,object.width,object.height,object.rotation||0,object.opacity??1);
    if(selectedId===object.id){ctx.save();ctx.strokeStyle='#53f4ff';ctx.lineWidth=5;ctx.setLineDash([18,10]);ctx.strokeRect(object.x-object.width/2,object.y-object.height,object.width,object.height);ctx.restore();}
  }
}

export function drawMapGeometry(ctx,document,{collisions=true,triggers=true,spawns=true,selectedId=null}={}){
  if(collisions&&layerVisible(document,'collision'))for(const shape of document.collisions){ctx.save();ctx.fillStyle=shape.id===selectedId?'rgba(255,78,112,.35)':'rgba(255,78,112,.19)';ctx.strokeStyle=shape.id===selectedId?'#fff':'#ff4e70';ctx.lineWidth=4;ctx.setLineDash(shape.boundary?[]:[14,8]);ctx.fillRect(shape.x,shape.y,shape.width,shape.height);ctx.strokeRect(shape.x,shape.y,shape.width,shape.height);ctx.restore();}
  if(triggers&&layerVisible(document,'triggers'))for(const shape of document.triggers){ctx.save();ctx.fillStyle='rgba(210,75,255,.15)';ctx.strokeStyle=shape.id===selectedId?'#fff':'#d64bff';ctx.lineWidth=4;ctx.setLineDash([12,8]);ctx.fillRect(shape.x,shape.y,shape.width,shape.height);ctx.strokeRect(shape.x,shape.y,shape.width,shape.height);ctx.restore();}
  if(spawns&&layerVisible(document,'spawns'))for(const spawn of document.spawns){ctx.save();ctx.translate(spawn.x,spawn.y);ctx.fillStyle=spawn.id===selectedId?'#fff':'#59f4ff';ctx.strokeStyle='#06121e';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-26);ctx.lineTo(22,20);ctx.lineTo(0,12);ctx.lineTo(-22,20);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
}

export function pointInObject(point,object){return point.x>=object.x-object.width/2&&point.x<=object.x+object.width/2&&point.y>=object.y-object.height&&point.y<=object.y;}
export function pointInRect(point,rect){return point.x>=rect.x&&point.x<=rect.x+rect.width&&point.y>=rect.y&&point.y<=rect.y+rect.height;}

export function resolveMapCollisions(entity,document,previous={x:entity.x,y:entity.y}){
  const radius=Math.max(8,entity.radius||24);entity.x=Math.max(radius,Math.min(document.width-radius,entity.x));entity.y=Math.max(radius,Math.min(document.height-radius,entity.y));
  for(const rect of document.collisions){if(rect.enabled===false)continue;const nearestX=Math.max(rect.x,Math.min(rect.x+rect.width,entity.x)),nearestY=Math.max(rect.y,Math.min(rect.y+rect.height,entity.y)),dx=entity.x-nearestX,dy=entity.y-nearestY;if(dx*dx+dy*dy>=radius*radius)continue;
    const wasHorizontal=previous.x+radius<=rect.x||previous.x-radius>=rect.x+rect.width;
    const wasVertical=previous.y+radius<=rect.y||previous.y-radius>=rect.y+rect.height;
    if(wasHorizontal&&!wasVertical){entity.x=previous.x;entity.vx=0;}else if(wasVertical&&!wasHorizontal){entity.y=previous.y;entity.vy=0;}else{
      const pushLeft=Math.abs((rect.x-radius)-entity.x),pushRight=Math.abs((rect.x+rect.width+radius)-entity.x),pushTop=Math.abs((rect.y-radius)-entity.y),pushBottom=Math.abs((rect.y+rect.height+radius)-entity.y),min=Math.min(pushLeft,pushRight,pushTop,pushBottom);
      if(min===pushLeft)entity.x=rect.x-radius;else if(min===pushRight)entity.x=rect.x+rect.width+radius;else if(min===pushTop)entity.y=rect.y-radius;else entity.y=rect.y+rect.height+radius;
    }
  }
  return entity;
}

export function placeMapObject(document,assetId,x,y,options={}){const made=makeObject(assetId,x,y,options);document.objects.push(made.object);if(made.collision)document.collisions.push(made.collision);return made.object;}
export function removeMapEntity(document,id){const object=document.objects.find((item)=>item.id===id);document.objects=document.objects.filter((item)=>item.id!==id);document.collisions=document.collisions.filter((item)=>item.id!==id&&item.sourceObjectId!==id);document.triggers=document.triggers.filter((item)=>item.id!==id);document.spawns=document.spawns.filter((item)=>item.id!==id);return Boolean(object);}
