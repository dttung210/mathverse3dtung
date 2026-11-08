/** V15 grade-six museum routing. Source 60 MathLab experiments are immutable.
 * Four zones are based on genuine curriculum visuals, not fixed 2D/3D quotas.
 */
import {ALL_MATH6_LABS,LAB_TO_EXHIBIT} from '../math6-lab/catalog.js?v=r107_v15';
import {GRADE6_ACTIVE_EXHIBITS,GRADE6_ACTIVE_IDS} from './grade6-curation-v15-1.js?v=r107_v15';

export const GRADE6_PORTALS = Object.freeze([
  {id:'plane',name:'Thế giới hình phẳng',label:'Hình phẳng & ghép hình',short:'Hình phẳng',icon:'◇',accent:'#36dfc1',description:'Hình đều, tứ giác, cắt ghép và lát nền',emoji:'◇'},
  {id:'symmetry',name:'Đối xứng & đo đạc',label:'Đối xứng & đo đạc',short:'Đối xứng',icon:'✧',accent:'#b4a0ff',description:'Gấp theo trục, quay quanh tâm, điểm – đường – góc',emoji:'✧'},
  {id:'number',name:'Số học trực quan',label:'Trục số & phân số',short:'Trục số',icon:'±',accent:'#ffbe65',description:'Trục số, giá trị số nguyên, phân số và phần trăm',emoji:'±'},
  {id:'data',name:'Dữ liệu & cuộc sống',label:'Biểu đồ & thực tế',short:'Biểu đồ',icon:'▥',accent:'#74caff',description:'Biểu đồ 2D, xác suất và mô hình đời sống',emoji:'▥'}
]);
const zoneByGroup={
 'Hình phẳng 2D':'plane',
 'Cắt ghép và lát nền':'plane',
 'Đối xứng và gấp hình':'symmetry',
 'Điểm – đường – góc':'symmetry',
 'Trục số và sơ đồ':'number',
 'Phân số – số thập phân':'number',
 'Thống kê – biểu đồ':'data',
 'Thí nghiệm xác suất':'data',
 'Mô hình thực tế':'data'
};
export function grade6ZoneForLab(lab){return zoneByGroup[lab?.group]||null;}
export function grade6Labs(zone){
 const idByLab=new Map(ALL_MATH6_LABS.map(lab=>[lab.id,lab]));
 return (GRADE6_ACTIVE_EXHIBITS[zone]||[]).map(id=>idByLab.get(id)).filter(Boolean);
}
/** Hidden from visitor galleries but kept intact for optional teacher restoration. */
export function grade6ArchivedLabs(){const active=new Set(GRADE6_ACTIVE_IDS);return ALL_MATH6_LABS.filter(lab=>!active.has(lab.id));}
export function grade6Featured(catalog,zone){
 const baseById=new Map(catalog.filter(x=>Number(x.grade)===6).map(x=>[x.id,x]));
 return grade6Labs(zone).flatMap(lab=>{
  const original=baseById.get(LAB_TO_EXHIBIT[lab.id]);
  if(!original)return [];
  // Preserve a real existing exhibit for continuity and overlay its own SGK lab.
  // A 3D plinth represents a thematic preview; selecting it opens the exact lab.
  return [{...original,id:`mv15_lab_${lab.id}`,grade:6,
   title:lab.title,description:lab.action,portalZone:zone,sourceExhibitId:original.id,
   labId:lab.id,labEngine:lab.engine,labVariant:lab.variant,group:lab.group,
   labSource:lab.source,labDefaults:lab.defaults,virtualLab:true,supplemental:true,custom:false}];
 });
}
export function grade6Counts(){return Object.fromEntries(GRADE6_PORTALS.map(zone=>[zone.id,grade6Labs(zone.id).length]));}
