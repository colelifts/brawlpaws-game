import test from 'node:test';
import assert from 'node:assert/strict';
import {assetById,createDefaultVillageMap,placeMapObject,removeMapEntity,resolveMapCollisions,sanitizeMapDocument} from '../src/map-document.js';

test('the village map is built from editable layers and component assets',()=>{
  const map=createDefaultVillageMap();
  assert.equal(map.width,4800);assert.equal(map.height,2700);assert.equal(map.tiles.ground.length,map.columns*map.rows);
  assert.ok(map.layers.some((layer)=>layer.id==='collision'));assert.ok(map.layers.some((layer)=>layer.id==='triggers'));assert.ok(map.objects.length>=20);
  assert.equal(assetById('architecture-4').name,'Portal Gate');assert.ok(map.collisions.some((shape)=>shape.sourceObjectId));
});

test('placing and deleting a building keeps linked collision geometry together',()=>{
  const map=createDefaultVillageMap(),before=map.collisions.length,object=placeMapObject(map,'architecture-11',1800,1200);
  assert.ok(map.collisions.some((shape)=>shape.sourceObjectId===object.id));assert.equal(map.collisions.length,before+1);
  removeMapEntity(map,object.id);assert.equal(map.objects.some((item)=>item.id===object.id),false);assert.equal(map.collisions.some((shape)=>shape.sourceObjectId===object.id),false);
});

test('authored map collision blocks a circular player body',()=>{
  const map=sanitizeMapDocument({columns:10,rows:10,tileSize:100,objects:[],collisions:[{id:'wall',x:400,y:200,width:100,height:600,enabled:true}],triggers:[],spawns:[{id:'player',type:'player',x:200,y:500}]});
  const player={x:430,y:500,vx:300,vy:0,radius:30};resolveMapCollisions(player,map,{x:360,y:500});assert.equal(player.x,360);assert.equal(player.vx,0);
});
