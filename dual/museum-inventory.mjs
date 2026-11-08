/**
 * Curated Infographic Museum inventory shared by Grand Dome and the local host.
 * This module is pure JavaScript: no renderer, global window, or R75 dependency.
 */
export const MUSEUM_EXPECTED_COUNTS = Object.freeze({6:43,7:37,8:39,9:32,10:27,11:33,12:19});
export function validateMuseumCatalog(catalog){
  if(!catalog || !Array.isArray(catalog.items))throw new Error('Museum: catalog.items must be an array');
  const counts=Object.fromEntries(Object.keys(MUSEUM_EXPECTED_COUNTS).map(g=>[g,0]));
  const keys=new Set(),ids=new Set();
  for(const item of catalog.items){
    const grade=Number(item.grade),lesson=Number(item.number);
    if(!Number.isInteger(grade)||grade<6||grade>12)throw new Error('Museum: invalid grade');
    if(!Number.isInteger(lesson)||lesson<1)throw new Error('Museum: invalid lesson number');
    const key=`${grade}:${lesson}`;
    if(keys.has(key))throw new Error(`Museum: duplicate lesson ${key}`);
    keys.add(key);
    if(!item.id || ids.has(item.id))throw new Error(`Museum: missing or repeated ID ${item.id}`);
    ids.add(item.id);
    if(typeof item.title!=='string'||!item.title.trim())throw new Error(`Museum: missing lesson title ${key}`);
    if(!Number.isFinite(Number(item.aspect))||Number(item.aspect)<=0)throw new Error(`Museum: invalid image aspect ${key}`);
    const assetPrefix=`/museum-assets/g${grade}/`;
    if(typeof item.src!=='string'||!item.src.startsWith(assetPrefix)|| !/^[a-zA-Z0-9_-]+\.webp$/.test(item.src.slice(assetPrefix.length))){
      throw new Error(`Museum: invalid image source ${key}`);
    }
    counts[grade]++;
  }
  if(catalog.total!==catalog.items.length)throw new Error('Museum: catalog total does not match item count');
  for(const [grade,expected] of Object.entries(MUSEUM_EXPECTED_COUNTS)){
    if(counts[grade]!==expected)throw new Error(`Museum: grade ${grade} has ${counts[grade]}, expected ${expected}`);
  }
  return Object.freeze({total:catalog.items.length,gradeCounts:Object.freeze(counts),rooms:7,world:'INFOGRAPHIC_MUSEUM'});
}
