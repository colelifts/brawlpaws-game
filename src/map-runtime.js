const REQUIRED_LAYERS=['Ground','Ground Detail','Walls','Props Below Player','Collision','Props / Interactive','Doors / Gates','Enemy Spawns','Player Spawn','Triggers','Foreground / Occlusion','VFX Anchors'];

const JADE_MAPS=[
  ['jadeCourtyard','shrine-courtyard'],
  ['jadeMoonbridge','moonbridge-crossing'],
  ['jadeRootGarden','root-covered-plaza'],
  ['jadeBellTerraces','bell-terraces'],
  ['jadeLanternCanals','lantern-canals'],
  ['jadeWardenProcessional','warden-processional'],
  ['jadeGuardianApproach','jadebreaker-courtyard'],
  ['jadeBrokenPavilion','broken-pavilion'],
  ['jadeCrystalClearing','spirit-crystal-clearing'],
  ['jadeTrainingYard','abandoned-training-yard']
].map(([roomId,file])=>({roomId,key:`jade-${file}`,path:`assets/maps/jade-grove/${file}.json`}));

const BAMBOO_MAPS=[
  ['bambooHollow','hollow-gate'],
  ['bambooMoonbridge','moonlit-reedbridge'],
  ['bambooSporeMarsh','spore-shrine-marsh'],
  ['bambooMoonlotusReservoir','moonlotus-reservoir'],
  ['bambooSporelightMonastery','sporelight-monastery'],
  ['bambooMoonstoneCauseway','moonstone-causeway'],
  ['bambooMoonfangBurrow','moonfang-burrow'],
  ['bambooWhisperingGrotto','whispering-grotto'],
  ['bambooLotusSanctuary','lotus-sanctuary'],
  ['bambooHunterCamp','reedblade-hunter-camp']
].map(([roomId,file])=>({roomId,key:`bamboo-${file}`,path:`assets/maps/bamboo-hollow/${file}.json`,tilesetName:'bamboo-ground',tilesetKey:'bamboo-ground'}));

const CRIMSON_MAPS=[
  ['crimsonDojo','first-bell-dojo'],
  ['crimsonBellCourt','ember-bell-court'],
  ['crimsonWarYard','ashen-war-yard'],
  ['crimsonCinderRooftops','cinder-pagoda-rooftops'],
  ['crimsonDrumFoundry','ashen-drum-foundry'],
  ['crimsonWarProcessional','shogun-war-processional'],
  ['crimsonOniGate','oni-gate-throne'],
  ['crimsonFoxfireArchive','foxfire-archive'],
  ['crimsonAncestorShrine','ancestor-flame-shrine'],
  ['crimsonExecutionYard','execution-yard']
].map(([roomId,file])=>({roomId,key:`crimson-${file}`,path:`assets/maps/crimson-dojo/${file}.json`,tilesetName:'crimson-ground',tilesetKey:'crimson-ground'}));

const STORM_MAPS=[
  ['stormTempestHarbor','tempest-harbor'],
  ['stormTideglassCauseway','tideglass-causeway'],
  ['stormDrownedBellSanctum','drowned-bell-sanctum'],
  ['stormSirenReefMonastery','siren-reef-monastery'],
  ['stormThunderbreakLighthouse','thunderbreak-lighthouse'],
  ['stormSkyfangAscent','skyfang-ascent'],
  ['stormEyeOfTempest','eye-of-tempest'],
  ['stormPearlCove','storm-pearl-cove'],
  ['stormTidekeeperShrine','tidekeeper-shrine'],
  ['stormRaiderWreck','raider-wreck']
].map(([roomId,file])=>({roomId,key:`storm-${file}`,path:`assets/maps/storm-coast/${file}.json`,tilesetName:'storm-ground',tilesetKey:'storm-ground'}));

const NEON_MAPS=[
  ['neonRainGate','neon-rain-gate'],
  ['neonCircuitMarket','circuit-market'],
  ['neonHologramArcade','hologram-arcade'],
  ['neonSkyrailShrine','skyrail-shrine'],
  ['neonDataLotusGardens','data-lotus-gardens'],
  ['neonShogunTower','shogun-tower'],
  ['neonShogunCore','shogun-core'],
  ['neonMemoryBazaar','memory-bazaar'],
  ['neonPulseShrine','pulse-shrine'],
  ['neonKernelFoundry','kernel-foundry']
].map(([roomId,file])=>({roomId,key:`neon-${file}`,path:`assets/maps/neon-city/${file}.json`,tilesetName:'neon-ground',tilesetKey:'neon-ground'}));

const SHADOW_MAPS=[
  ['shadowObsidianPath','obsidian-lantern-path'],
  ['shadowMirrorgraveVillage','mirrorgrave-village'],
  ['shadowWraithwoodCrossing','wraithwood-crossing'],
  ['shadowEclipseArchive','eclipse-archive'],
  ['shadowMoonlessProcessional','moonless-processional'],
  ['shadowUmbralPalaceSteps','umbral-palace-steps'],
  ['shadowThroneBeyondMoon','throne-beyond-moon'],
  ['shadowForsakenMirrorVault','forsaken-mirror-vault'],
  ['shadowEclipseSanctuary','eclipse-sanctuary'],
  ['shadowDreadmoonPrison','dreadmoon-prison']
].map(([roomId,file])=>({roomId,key:`shadow-${file}`,path:`assets/maps/shadow-realm/${file}.json`,tilesetName:'shadow-ground',tilesetKey:'shadow-ground'}));

const LAYERED_MAPS=[...JADE_MAPS.map((entry)=>({...entry,tilesetName:'jade-ground',tilesetKey:'jade-ground'})),...BAMBOO_MAPS,...CRIMSON_MAPS,...STORM_MAPS,...NEON_MAPS,...SHADOW_MAPS];

const objectProperties=(object)=>Object.fromEntries((object.properties||[]).map((entry)=>[entry.name,entry.value]));

export class LayeredMapRuntime {
  constructor(parentId='phaser-map'){
    this.parentId=parentId;this.ready=false;this.debug=false;this.entries=new Map();this.activeRoomId=null;this.previewRoomId=null;this.scene=null;this.game=null;
    this.start();
  }

  start(){
    const Phaser=window.Phaser;if(!Phaser){console.error('Phaser 3 runtime is unavailable.');return;}
    const runtime=this;
    class JadeGroveScene extends Phaser.Scene{
      constructor(){super('JadeGroveLayeredMaps');}
      preload(){
        for(const definition of LAYERED_MAPS)this.load.tilemapTiledJSON(definition.key,definition.path);
        this.load.image('jade-ground','assets/tilesets/jade-grove/jade-ground.svg');
        this.load.image('bamboo-ground','assets/tilesets/bamboo-hollow/bamboo-ground.svg');
        this.load.image('crimson-ground','assets/tilesets/crimson-dojo/crimson-ground.svg');
        this.load.image('storm-ground','assets/tilesets/storm-coast/storm-ground.svg');
        this.load.image('neon-ground','assets/tilesets/neon-city/neon-ground.svg');
        this.load.image('shadow-ground','assets/tilesets/shadow-realm/shadow-ground.svg');
        this.load.image('jade-props','assets/environment/jade-props.png');
        this.load.spritesheet('spirit-wisp','assets/environment/animated/spirit-wisp.png',{frameWidth:512,frameHeight:512});
        this.load.spritesheet('lantern-flame','assets/environment/animated/lantern-flame.png',{frameWidth:512,frameHeight:512});
      }
      create(){runtime.build(this);}
    }
    this.game=new Phaser.Game({type:Phaser.AUTO,parent:this.parentId,transparent:true,width:window.innerWidth,height:window.innerHeight,pixelArt:false,antialias:true,roundPixels:false,render:{powerPreference:'high-performance',antialias:true},physics:{default:'arcade',arcade:{debug:false}},scene:[JadeGroveScene],audio:{noAudio:true},banner:false});
  }

  build(scene){
    this.scene=scene;
    scene.anims.create({key:'map-wisp',frames:scene.anims.generateFrameNumbers('spirit-wisp',{start:0,end:5}),frameRate:8,repeat:-1});
    scene.anims.create({key:'map-flame',frames:scene.anims.generateFrameNumbers('lantern-flame',{start:0,end:5}),frameRate:9,repeat:-1});
    for(const definition of LAYERED_MAPS)this.buildMap(scene,definition);
    this.ready=true;window.dispatchEvent(new CustomEvent('brawlpaws-map-ready',{detail:{runtime:this}}));
  }

  buildMap(scene,definition){
    const map=scene.make.tilemap({key:definition.key}),mapData=scene.cache.tilemap.get(definition.key).data;
    const missing=REQUIRED_LAYERS.filter((name)=>!mapData.layers.some((layer)=>layer.name===name));
    if(missing.length)throw new Error(`${definition.roomId} is missing Tiled layers: ${missing.join(', ')}`);
    const entry={...definition,map,mapData,layers:{},objects:{},collision:[],gates:[],display:[],debugGraphics:null,visible:false};
    const tiles=map.addTilesetImage(definition.tilesetName,definition.tilesetKey,256,256,0,0);
    for(const [name,depth] of [['Ground',-3000],['Ground Detail',-2900],['Walls',-2400]]){
      const layer=map.createLayer(name,tiles,0,0).setDepth(depth).setVisible(false);entry.layers[name]=layer;entry.display.push(layer);
    }
    for(const layerName of REQUIRED_LAYERS.filter((name)=>!['Ground','Ground Detail','Walls'].includes(name))){
      const source=map.getObjectLayer(layerName);entry.objects[layerName]=(source?.objects||[]).map((object)=>({...object,properties:objectProperties(object)}));
    }
    entry.collision=entry.objects.Collision.map((object)=>({id:object.name,x:object.x,y:object.y,width:object.width,height:object.height,active:true}));
    entry.gates=entry.objects['Doors / Gates'].map((object)=>({...object,sealed:object.properties.state==='combat-sealed'}));
    this.createLowProps(scene,entry);this.createGateArt(scene,entry);this.createAmbient(scene,entry);this.createDebug(scene,entry);
    entry.displayOrigins=new Map(entry.display.map((object)=>[object,{x:Number(object.x)||0,y:Number(object.y)||0}]));
    this.entries.set(definition.roomId,entry);
  }

  createLowProps(scene,entry){
    for(const object of entry.objects['Props Below Player']){
      const p=object.properties,sprite=scene.add.image(object.x,object.y,'jade-props').setOrigin(.5,p.originY??1).setCrop(p.cropX,p.cropY,p.cropW,p.cropH).setScale(p.scale??1).setDepth(-1200+object.y*.01).setVisible(false);
      sprite.setData('mapObject',object.name);entry.display.push(sprite);
    }
  }

  createGateArt(scene,entry){
    for(const gate of entry.gates){
      const cx=gate.x+gate.width/2,foot=gate.y+gate.height+100;
      gate.sprite=scene.add.image(cx,foot,'jade-props').setOrigin(.5,.82).setCrop(690,520,380,430).setScale(1.38).setDepth(-850+foot*.01).setVisible(false);
      gate.seal=scene.add.graphics().setDepth(-700+foot*.01).setBlendMode('ADD').setVisible(false);gate.cx=cx;gate.foot=foot;entry.display.push(gate.sprite,gate.seal);
    }
  }

  createAmbient(scene,entry){
    for(const anchor of entry.objects['VFX Anchors']){
      const p=anchor.properties;let sprite=null;
      if(p.effect==='spiritWisp')sprite=scene.add.sprite(anchor.x,anchor.y,'spirit-wisp').setDisplaySize(150,150).setAlpha(.58).setBlendMode('ADD').setDepth(-1000+anchor.y*.01).play('map-wisp');
      if(p.effect==='lanternGlow')sprite=scene.add.sprite(anchor.x,anchor.y,'lantern-flame').setDisplaySize(260,210).setAlpha(.42).setBlendMode('ADD').setDepth(-1000+anchor.y*.01).play('map-flame');
      if(sprite){sprite.setVisible(false);entry.display.push(sprite);}
    }
  }

  createDebug(scene,entry){entry.debugGraphics=scene.add.graphics().setDepth(100000).setVisible(false);entry.display.push(entry.debugGraphics);}

  activateRoom(roomId){
    if(this.activeRoomId===roomId)return this.entries.get(roomId)||null;
    this.previewRoomId=null;for(const entry of this.entries.values()){this.setEntryOffset(entry,0,0);entry.visible=entry.roomId===roomId;for(const object of entry.display)object.setVisible(entry.visible&&(object!==entry.debugGraphics||this.debug));}
    this.activeRoomId=this.entries.has(roomId)?roomId:null;const entry=this.activeEntry();
    if(entry){this.scene.cameras.main.setBounds(0,0,entry.map.widthInPixels,entry.map.heightInPixels);this.scene.physics.world.setBounds(0,0,entry.map.widthInPixels,entry.map.heightInPixels);}
    return entry;
  }

  activeEntry(){return this.entries.get(this.activeRoomId)||null;}

  setEntryOffset(entry,x=0,y=0){
    if(!entry?.displayOrigins)return;for(const object of entry.display){const origin=entry.displayOrigins.get(object);if(origin)object.setPosition(origin.x+x,origin.y+y);}
  }

  entrySpawn(roomId,direction='back'){
    const entry=this.entries.get(roomId),gate=direction==='forward'?this.forwardGate(roomId):this.backGate(roomId);if(!entry||!gate)return this.playerSpawn(roomId);
    const inward=direction==='forward'?1:-1,x=gate.x+gate.width/2,y=gate.y+gate.height/2+inward*(gate.height/2+190);
    return {x:Math.max(180,Math.min(entry.map.widthInPixels-180,x)),y:Math.max(180,Math.min(entry.map.heightInPixels-180,y)),facing:direction==='forward'?Math.PI/2:-Math.PI/2};
  }

  previewNeighbor(destinationRoomId){
    const current=this.activeEntry(),destination=this.entries.get(destinationRoomId);if(!current||!destination||destination===current)return null;
    if(this.previewRoomId&&this.previewRoomId!==destinationRoomId)this.clearPreview();const exit=this.forwardGate(current.roomId),entrance=this.backGate(destinationRoomId);if(!exit||!entrance)return null;
    const offsetX=(exit.x+exit.width/2)-(entrance.x+entrance.width/2),offsetY=exit.y-(entrance.y+entrance.height)+24;
    this.setEntryOffset(destination,offsetX,offsetY);destination.visible=true;for(const object of destination.display)object.setVisible(object!==destination.debugGraphics||this.debug);this.previewRoomId=destinationRoomId;
    const minX=Math.min(0,offsetX),minY=Math.min(0,offsetY),maxX=Math.max(current.map.widthInPixels,offsetX+destination.map.widthInPixels),maxY=Math.max(current.map.heightInPixels,offsetY+destination.map.heightInPixels);this.scene.cameras.main.setBounds(minX,minY,maxX-minX,maxY-minY);return {roomId:destinationRoomId,offsetX,offsetY};
  }

  clearPreview(){
    if(!this.previewRoomId)return;const entry=this.entries.get(this.previewRoomId);if(entry&&entry.roomId!==this.activeRoomId){entry.visible=false;this.setEntryOffset(entry,0,0);for(const object of entry.display)object.setVisible(false);}this.previewRoomId=null;const active=this.activeEntry();if(active)this.scene.cameras.main.setBounds(0,0,active.map.widthInPixels,active.map.heightInPixels);
  }

  update({roomId,cameraX,cameraY,zoom,width,height,sealed,active=true}){
    const host=document.getElementById(this.parentId);if(host)host.style.visibility=active?'visible':'hidden';
    if(!this.ready||!active)return;const entry=this.activateRoom(roomId);if(!entry)return;
    const camera=this.scene.cameras.main;if(camera.width!==width||camera.height!==height)this.game.scale.resize(width,height);camera.setZoom(zoom);camera.centerOn(cameraX,cameraY);this.setCombatSealed(sealed);this.renderGateSeals();if(this.debug)this.renderDebug();
  }

  setCombatSealed(sealed){const entry=this.activeEntry();if(!entry)return;for(const gate of entry.gates)if(gate.properties.state==='combat-sealed')gate.sealed=Boolean(sealed);}

  renderGateSeals(){
    const entry=this.activeEntry();if(!entry)return;const time=performance.now()/1000;
    for(const gate of entry.gates){gate.seal.clear();if(!gate.sealed)continue;gate.seal.lineStyle(7,0x50f4ff,.7).fillStyle(0x8a2be2,.12);gate.seal.fillRoundedRect(gate.x,gate.y-25,gate.width,gate.height+85,32);gate.seal.strokeRoundedRect(gate.x,gate.y-25,gate.width,gate.height+85,32);for(let i=0;i<4;i++){const y=gate.y+i*42+Math.sin(time*3+i)*9;gate.seal.lineStyle(3,i%2?0xb94cff:0x4ff8ea,.72);gate.seal.beginPath();gate.seal.moveTo(gate.x+22,y);gate.seal.lineTo(gate.x+gate.width-22,y+Math.sin(time*4+i)*15);gate.seal.strokePath();}}
  }

  toggleDebug(){this.debug=!this.debug;for(const entry of this.entries.values()){entry.debugGraphics?.setVisible(entry.visible&&this.debug);if(!this.debug)entry.debugGraphics?.clear();}return this.debug;}

  worldObjects(layerName,roomId=this.activeRoomId){return this.entries.get(roomId)?.objects[layerName]||[];}

  playerSpawn(roomId){const spawn=this.worldObjects('Player Spawn',roomId)[0];return spawn?{x:spawn.x,y:spawn.y,facing:spawn.properties.facing}:null;}

  forwardGate(roomId=this.activeRoomId){return this.entries.get(roomId)?.gates.find((gate)=>gate.properties.direction==='forward')||null;}

  backGate(roomId=this.activeRoomId){return this.entries.get(roomId)?.gates.find((gate)=>gate.properties.direction==='back')||null;}

  exitAt(entity){
    const gate=this.forwardGate();if(!gate||gate.sealed)return null;const margin=70;
    return entity.x>=gate.x-margin&&entity.x<=gate.x+gate.width+margin&&entity.y>=gate.y-margin&&entity.y<=gate.y+gate.height+margin?{destination:gate.properties.destination,gate}:null;
  }

  triggersAt(entity,roomId=this.activeRoomId){
    const triggers=this.worldObjects('Triggers',roomId),radius=entity.radius||18;
    return triggers.filter((trigger)=>entity.x+radius>=trigger.x&&entity.x-radius<=trigger.x+trigger.width&&entity.y+radius>=trigger.y&&entity.y-radius<=trigger.y+trigger.height);
  }

  renderDebug(){
    const entry=this.activeEntry();if(!entry)return;const g=entry.debugGraphics;g.clear();g.lineStyle(6,0x39f4ff,.9);for(const rect of entry.collision)g.strokeRect(rect.x,rect.y,rect.width,rect.height);for(const gate of entry.gates){g.lineStyle(6,gate.sealed?0xff3864:0x71ff71,.95);g.strokeRect(gate.x,gate.y,gate.width,gate.height);}
    for(const spawn of entry.objects['Enemy Spawns']){g.fillStyle(0xff365f,.9);g.fillCircle(spawn.x,spawn.y,22);}for(const trigger of entry.objects.Triggers){g.lineStyle(5,0xff4fd8,.8);g.strokeRect(trigger.x,trigger.y,trigger.width,trigger.height);}
  }

  resolveCollision(entity){
    const entry=this.activeEntry();if(!entry)return false;let collided=false;const radius=entity.radius||20;const blockers=[...entry.collision,...entry.gates.filter((gate)=>gate.sealed).map((gate)=>({x:gate.x,y:gate.y,width:gate.width,height:gate.height}))];
    for(const rect of blockers){const closestX=Math.max(rect.x,Math.min(entity.x,rect.x+rect.width)),closestY=Math.max(rect.y,Math.min(entity.y,rect.y+rect.height)),dx=entity.x-closestX,dy=entity.y-closestY,dist=Math.hypot(dx,dy);if(dist>=radius)continue;collided=true;
      if(dist>0){const push=radius-dist;entity.x+=dx/dist*push;entity.y+=dy/dist*push;}else{const left=Math.abs(entity.x-rect.x),right=Math.abs(rect.x+rect.width-entity.x),top=Math.abs(entity.y-rect.y),bottom=Math.abs(rect.y+rect.height-entity.y),min=Math.min(left,right,top,bottom);if(min===left)entity.x=rect.x-radius;else if(min===right)entity.x=rect.x+rect.width+radius;else if(min===top)entity.y=rect.y-radius;else entity.y=rect.y+rect.height+radius;}entity.vx*=.42;entity.vy*=.42;
    }return collided;
  }
}

export const createLayeredMapRuntime=(parentId)=>new LayeredMapRuntime(parentId);
