import { HEROES, WEAPONS, ENEMIES, DIFFICULTIES } from './data.js?v=20260813-expedition6';
import { expeditionNode } from './expedition-world.js?v=20260813-world2';

export const PROFILE_VERSION=2;
export const PROFILE_FORMAT='brawlpaws-save';
export const DEFAULT_SETTINGS=Object.freeze({screenShake:1,flashIntensity:1,damageNumbers:true,ambientMotion:true,minimap:true,masterVolume:.8,musicVolume:.55,sfxVolume:.85,abilityVolume:.85,uiVolume:.7});
export const DEFAULT_CONTRACT_PROGRESS=Object.freeze({spiritCull:0,eliteBreakers:0,foxfireHunt:0,sealRunner:0,guardianOath:0});

const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
const integer=(value,min=0,max=Number.MAX_SAFE_INTEGER)=>Math.max(min,Math.min(max,Math.round(finite(value,min))));
const unique=(value,predicate)=>[...new Set((Array.isArray(value)?value:[]).filter(predicate))];
const identifier=(value)=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,64}$/.test(value);

export function defaultHeroMastery(){return Object.fromEntries(Object.keys(HEROES).map((id)=>[id,{xp:0,highestRoad:0,kills:0,guardians:0}]));}
export function createDefaultProfile(){return {schemaVersion:PROFILE_VERSION,spiritShards:0,campaignClears:0,runsStarted:0,expeditionsExtracted:0,bestExtractionDepth:0,bestDifficulty:'',lastDifficulty:'ferocious',selectedHero:'kitsune',highestLevel:1,tutorialComplete:false,tutorialStep:0,vitalityRank:0,forgeRank:0,attunementRank:0,purseRank:0,ascensionRank:1,ascensionClears:0,unlockedHeroes:['kitsune','bamboo'],collectedWeapons:[],boundArsenal:{},discoveredEnemies:['groveMinion'],discoveredGuardians:[],worldDiscoveries:['jadeCourtyard'],worldsCompleted:[],heroMastery:defaultHeroMastery(),contractProgress:{...DEFAULT_CONTRACT_PROGRESS},claimedContracts:[],settings:{...DEFAULT_SETTINGS}};}

function migrateLegacy(raw){
  const source=raw&&typeof raw==='object'&&!Array.isArray(raw)?structuredClone(raw):{};
  const version=integer(source.schemaVersion||1,1,999);
  if(version>PROFILE_VERSION)throw new Error(`This save needs a newer BrawlPaws build (save v${version}, game v${PROFILE_VERSION}).`);
  if(version<2){source.worldsCompleted=Array.isArray(source.worldsCompleted)?source.worldsCompleted:[];source.schemaVersion=2;}
  return source;
}

export function sanitizeProfile(raw){
  const source=migrateLegacy(raw),profile=createDefaultProfile();
  for(const key of ['spiritShards','campaignClears','runsStarted','expeditionsExtracted','bestExtractionDepth','ascensionClears'])profile[key]=integer(source[key]);
  profile.highestLevel=integer(source.highestLevel,1,999);
  profile.tutorialStep=integer(source.tutorialStep,0,999);
  for(const key of ['vitalityRank','forgeRank','attunementRank','purseRank'])profile[key]=integer(source[key],0,5);
  profile.ascensionRank=integer(source.ascensionRank,1,10);
  profile.tutorialComplete=source.tutorialComplete===true;
  profile.bestDifficulty=DIFFICULTIES[source.bestDifficulty]?source.bestDifficulty:'';
  profile.lastDifficulty=DIFFICULTIES[source.lastDifficulty]?source.lastDifficulty:'ferocious';
  profile.unlockedHeroes=unique(source.unlockedHeroes,(id)=>Boolean(HEROES[id]));
  for(const starter of ['kitsune','bamboo'])if(!profile.unlockedHeroes.includes(starter))profile.unlockedHeroes.push(starter);
  if(profile.campaignClears>0)for(const id of ['hopscotch','nomi'])if(!profile.unlockedHeroes.includes(id))profile.unlockedHeroes.push(id);
  if(profile.campaignClears>=2&&!profile.unlockedHeroes.includes('zap'))profile.unlockedHeroes.push('zap');
  if(profile.ascensionClears>0&&!profile.unlockedHeroes.includes('rusty'))profile.unlockedHeroes.push('rusty');
  profile.selectedHero=profile.unlockedHeroes.includes(source.selectedHero)?source.selectedHero:'kitsune';
  profile.collectedWeapons=unique(source.collectedWeapons,(id)=>Boolean(WEAPONS[id]));
  profile.boundArsenal={};
  if(source.boundArsenal&&typeof source.boundArsenal==='object')for(const [heroId,weaponId] of Object.entries(source.boundArsenal))if(HEROES[heroId]&&WEAPONS[weaponId])profile.boundArsenal[heroId]=weaponId;
  profile.discoveredEnemies=unique(source.discoveredEnemies,(id)=>Boolean(ENEMIES[id]));
  if(!profile.discoveredEnemies.includes('groveMinion'))profile.discoveredEnemies.unshift('groveMinion');
  profile.discoveredGuardians=unique(source.discoveredGuardians,(id)=>ENEMIES[id]?.behavior==='boss');
  profile.worldDiscoveries=unique(source.worldDiscoveries,(id)=>Boolean(expeditionNode(id)));
  if(!profile.worldDiscoveries.includes('jadeCourtyard'))profile.worldDiscoveries.unshift('jadeCourtyard');
  profile.worldsCompleted=unique(source.worldsCompleted,identifier);
  profile.heroMastery=defaultHeroMastery();
  for(const id of Object.keys(HEROES)){const saved=source.heroMastery?.[id]||{};profile.heroMastery[id]={xp:integer(saved.xp),highestRoad:integer(saved.highestRoad),kills:integer(saved.kills),guardians:integer(saved.guardians)};}
  for(const id of Object.keys(DEFAULT_CONTRACT_PROGRESS))profile.contractProgress[id]=integer(source.contractProgress?.[id]);
  profile.claimedContracts=unique(source.claimedContracts,identifier);
  profile.settings={...DEFAULT_SETTINGS};
  profile.settings.screenShake=[0,.35,1].includes(finite(source.settings?.screenShake))?finite(source.settings.screenShake):1;
  profile.settings.flashIntensity=[0,.35,1].includes(finite(source.settings?.flashIntensity))?finite(source.settings.flashIntensity):1;
  for(const key of ['damageNumbers','ambientMotion','minimap'])profile.settings[key]=source.settings?.[key]!==false;
  for(const key of ['masterVolume','musicVolume','sfxVolume','abilityVolume','uiVolume'])profile.settings[key]=Math.max(0,Math.min(1,finite(source.settings?.[key],DEFAULT_SETTINGS[key])));
  return profile;
}

export function createSaveArchive(profile){return {format:PROFILE_FORMAT,version:PROFILE_VERSION,exportedAt:new Date().toISOString(),profile:sanitizeProfile(profile)};}
export function parseSaveArchive(text){
  let parsed;try{parsed=JSON.parse(String(text));}catch{throw new Error('That file is not valid JSON.');}
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('That file is not a BrawlPaws save.');
  if(parsed.format&&parsed.format!==PROFILE_FORMAT)throw new Error('That file belongs to a different game.');
  const raw=parsed.format===PROFILE_FORMAT?parsed.profile:parsed;
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('The BrawlPaws profile is missing.');
  return sanitizeProfile(raw);
}
