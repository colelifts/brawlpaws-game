export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const lerp = (a, b, amount) => a + (b - a) * amount;
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const normalize = (x, y) => {
  const length = Math.hypot(x, y);
  return length > 0.0001 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
};
export const shortestAngle = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
export const approachAngle = (from, to, amount) => from + shortestAngle(from, to) * amount;
export const COMBAT_BALANCE_TARGETS=Object.freeze({
  openingTtk:[1.6,2.4],standardPursuitRatio:.9,huntingPursuitRatio:1.06,
  minimumTelegraph:{basic:.48,melee:.46,ranged:.54,heavy:.78,assassin:.58,specialist:.66,boss:.72},
  maxHealthPerHit:{standard:.13,heavy:.19,specialist:.17,boss:.25,hazard:.16}
});

export function normalizedEnemyScales({healthScale=1,speedScale=1,damageScale=1,boss=false}={}){
  const compress=(value,weight,ceiling)=>value<=1?Math.max(.5,value):Math.min(ceiling,1+(value-1)*weight);
  return {
    health:compress(healthScale,boss?.72:.55,boss?5.4:4.2),
    speed:compress(speedScale,.32,boss?1.42:1.65),
    damage:compress(damageScale,.36,boss?2.35:2.05)
  };
}

export function enemySpeedCeiling({playerWalkSpeed=300,behavior='melee',hunting=false,difficultyId='ferocious'}={}){
  const roleRatio=behavior==='heavy'?.7:behavior==='ranged'?.8:behavior==='summoner'?.76:['conductor','hacker','curser'].includes(behavior)?.78:behavior==='assassin'?1.02:behavior==='boss'?.84:COMBAT_BALANCE_TARGETS.standardPursuitRatio;
  const huntRatio=hunting?Math.max(roleRatio,behavior==='assassin'?1.12:COMBAT_BALANCE_TARGETS.huntingPursuitRatio):roleRatio;
  const difficulty=difficultyId==='ascension'?1.06:difficultyId==='nightmare'?1.035:difficultyId==='spirited'?.96:1;
  return playerWalkSpeed*huntRatio*difficulty;
}

export function enemyTelegraphFloor({behavior='melee',difficultyId='ferocious',boss=false}={}){
  const specialist=['summoner','bomber','conductor','hacker','curser'].includes(behavior);
  const key=boss||behavior==='boss'?'boss':specialist?'specialist':COMBAT_BALANCE_TARGETS.minimumTelegraph[behavior]!=null?behavior:'melee';
  const difficulty=difficultyId==='ascension'?.86:difficultyId==='nightmare'?.91:difficultyId==='spirited'?1.08:1;
  return COMBAT_BALANCE_TARGETS.minimumTelegraph[key]*difficulty;
}

export function incomingDamageLimit({maxHealth=100,kind='standard',chapterIndex=0,difficultyId='ferocious'}={}){
  const base=COMBAT_BALANCE_TARGETS.maxHealthPerHit[kind]??COMBAT_BALANCE_TARGETS.maxHealthPerHit.standard;
  const campaign=Math.min(.045,Math.max(0,chapterIndex)*.009);
  const difficulty=difficultyId==='ascension'?.055:difficultyId==='nightmare'?.035:difficultyId==='spirited'?-.018:0;
  return Math.max(1,maxHealth*(base+campaign+difficulty));
}
export const circleOverlap = (a, b) => distance(a, b) < a.radius + b.radius;
export const withinArc = (origin, facing, target, range, arc) => {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  return Math.hypot(dx, dy) <= range + (target.radius || 0)
    && Math.abs(shortestAngle(facing, Math.atan2(dy, dx))) <= arc / 2;
};
export function encounterActiveLimit({ waveIndex = 0, chapterIndex = 0, difficultyId = 'ferocious', partySize = 1, elite = false } = {}) {
  const difficultyBonus = difficultyId === 'ascension' ? 11 : difficultyId === 'nightmare' ? 7 : difficultyId === 'spirited' ? -2 : 0;
  const partyBonus = Math.max(0, partySize - 1) * 6;
  const waveRamp = waveIndex * 5 + Math.max(0, waveIndex - 1) ** 2;
  return clamp(Math.round(8 + waveRamp + chapterIndex * 3 + difficultyBonus + partyBonus + (elite ? 3 : 0)), 6, 24);
}
export function campaignPressureCurve({ chapterIndex = 0, waveIndex = 0, elapsed = 0, difficultyId = 'ferocious' } = {}) {
  const chapter=clamp(Math.round(chapterIndex),0,5),wave=clamp(Math.round(waveIndex),0,5),time=Math.max(0,elapsed);
  const difficulty=difficultyId==='ascension'?1.18:difficultyId==='nightmare'?1.1:difficultyId==='spirited'?.9:1;
  const progress=chapter*6+wave;
  return {
    progress,
    activeRamp:Math.max(4,Math.round((8+chapter*4+wave*2+time*(1.5+wave*.55+chapter*.25))*difficulty)),
    reserveRate:1+(chapter*.14+wave*.09)*difficulty,
    pursuit:1+(chapter*.038+wave*.025)*difficulty,
    attackTempo:Math.min(1.32,1+(chapter*.03+wave*.018)*difficulty),
    recovery:clamp(1-(chapter*.026+wave*.016)*difficulty,.72,1)
  };
}
export function cappedWardPressure(rawDamagePerSecond, maxHealth, duration) {
  const survivalWindow = Math.max(18, duration * .62);
  return clamp(rawDamagePerSecond, 0, maxHealth / survivalWindow);
}
export function segmentCircleHit(start, end, circle, padding = 0) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSq = dx * dx + dy * dy || 1;
  const t = clamp(((circle.x - start.x) * dx + (circle.y - start.y) * dy) / lengthSq, 0, 1);
  const px = start.x + dx * t;
  const py = start.y + dy * t;
  return Math.hypot(circle.x - px, circle.y - py) <= circle.radius + padding;
}
