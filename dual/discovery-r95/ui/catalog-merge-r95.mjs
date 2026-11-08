/** Pure merge helper for R93 + optional R94 + R95. NEVER discards previous content. */
export function mergeByIdPreserveExisting(previous, incoming, {collision='skip'}={}) {
  if (!Array.isArray(previous) || !Array.isArray(incoming)) throw new TypeError('Expected two arrays');
  const existing = new Map();
  const result = [];
  for (const item of previous) {
    if (!item || typeof item.id!=='string' || !item.id) throw new Error('Existing catalog has invalid id');
    if(existing.has(item.id)) throw new Error(`Duplicate id in existing data: ${item.id}`);
    existing.set(item.id, true);
    result.push(item);
  }
  const inserted=[]; const skipped=[];
  const seenNew=new Set();
  for (const item of incoming) {
    if (!item || typeof item.id!=='string' || !item.id) throw new Error('New item has invalid id');
    if(seenNew.has(item.id)) throw new Error(`Duplicate id in new catalog: ${item.id}`);
    seenNew.add(item.id);
    if(existing.has(item.id)) {
      if(collision==='error')throw new Error(`ID already exists: ${item.id}`);
      skipped.push(item.id);
    } else {
      result.push(item); inserted.push(item.id); existing.set(item.id,true);
    }
  }
  return {items:result, inserted, skipped, originalCount:previous.length};
}
export function isReadyToShowPhotograph(item) {
  const image=item?.photo ?? item?.image;
  return !!(image && image.status==='approved' && typeof image.author==='string' && image.author.trim() &&
    typeof image.license==='string' && image.license.trim() && typeof image.commonsPage==='string' &&
    image.commonsPage.startsWith('https://') && typeof image.localPath==='string' && image.localPath.startsWith('/'));
}
export function isReadyToPublish(item) {
  return item?.publishReady===true && item?.geometryReviewRequired===false && isReadyToShowPhotograph(item);
}
export function filterLandmarks(items, {text='',continent='all',classes='all',limit=100}={}) {
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const q=norm(text);
 return items.filter(x=>(!q||[x.title,x.country,x.geometry?.concepts?.join(' ')].some(s=>norm(s).includes(q)))&&
 (continent==='all'||x.continent===continent)&&
 (classes==='all'||String(x.classes).includes(classes))).slice(0,limit);
}
export const MAX_GALLERY_PHYSICAL_FRAMES = 8; // Keeps WebGL workload bounded.
