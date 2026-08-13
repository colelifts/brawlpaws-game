export const MASTERY_CAP=100;
export const MASTERY_POWER_CAP=50;

export const MASTERY_CRESTS=Object.freeze([
  {id:'none',name:'Unmarked',rank:0,color:'#7e7788',secondary:'#1b1323',description:'Fight without a prestige crest.'},
  {id:'hunter',name:'Hunter Crest',rank:5,color:'#45efff',secondary:'#174b68',description:'A cyan tracking seal earned through field discipline.'},
  {id:'spirit',name:'Spirit Lantern',rank:25,color:'#75f06a',secondary:'#18725e',description:'Living jade petals orbit the hero’s footwork.'},
  {id:'guardian',name:'Guardian Oath',rank:50,color:'#ffe36a',secondary:'#ff7a32',description:'A gold guardian ward records fifty ranks of mastery.'},
  {id:'astral',name:'Astral Road',rank:75,color:'#d95cff',secondary:'#45eaff',description:'Two interlocking spirit roads mark a veteran explorer.'},
  {id:'mythic',name:'Mythic Crown',rank:100,color:'#fff4c2',secondary:'#ff43aa',description:'The complete hundred-rank crest of a legendary BrawlPaw.'}
]);

export function masteryCrest(id){return MASTERY_CRESTS.find((crest)=>crest.id===id)||MASTERY_CRESTS[0];}
export function availableMasteryCrests(rank){return MASTERY_CRESTS.filter((crest)=>crest.rank<=rank);}
export function sanitizeMasteryCrests(raw,heroIds){
  const source=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};return Object.fromEntries(heroIds.map((heroId)=>[heroId,masteryCrest(source[heroId]).id]));
}
