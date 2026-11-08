/** R90: Single chapter / lesson registry, derived from immutable 310-mode SGK manifest.
 * Grade 6 sources 63 Math6 labs. Grades 7–12 source 247 curated QA/SGK modes.
 * Four cross-grade modes are placed according to the existing SGK manifest, not
 * the source audit's original grade. Exhibits appear as references, not duplicates.
 */
import {getChaptersForGrade,getCurriculumModelById} from './curriculum-manifest.mjs?v=r107_v15';
import {grade6WarehouseFamilies} from './grade6-warehouse.mjs?v=r107_v15';
import {SGK_EXHIBIT_TO_MODE} from './sgk-exhibit-links.mjs?v=r107_v15';

const sourceIndex=new Map();
const cleanGrade=grade=>Number(grade);
export function createIntegratedSgkDirectory(curated,{exhibits=[]}={}){
 const registry=Array.isArray(curated?.source_registry)?curated.source_registry:[];
 sourceIndex.clear();
 const familiesById=new Map();
 for(const family of registry){
  familiesById.set(family.id,family);
  for(const m of family.modes||[])sourceIndex.set(m.id,{...m,legacyFamilyId:family.id,sourceEvidence:family.source_evidence,sourceGrade:family.grade});
 }
 for(const family of grade6WarehouseFamilies()){
  familiesById.set(family.id,family);
  for(const m of family.modes)sourceIndex.set(m.id,{...m,legacyFamilyId:family.id,sourceGrade:6});
 }
 const exhibitsByAnchor=new Map();
 const seenExhibits=new Set();
 for(const exhibit of exhibits||[]){
  const anchor=SGK_EXHIBIT_TO_MODE[exhibit?.id];
  if(!anchor||seenExhibits.has(exhibit.id))continue;
  const cm=getCurriculumModelById(anchor);
  if(!cm||Number(cm.grade)!==Number(exhibit.grade))continue;
  seenExhibits.add(exhibit.id);
  if(!exhibitsByAnchor.has(anchor))exhibitsByAnchor.set(anchor,[]);
  exhibitsByAnchor.get(anchor).push(exhibit);
 }
 const chaptersByGrade=new Map(),index=new Map(),errors=[];
 for(let grade=6;grade<=12;grade++){
  const chapters=[];
  for(const chapter of getChaptersForGrade(grade)){
   const modes=[];
   for(const lesson of chapter.lessons||[]){
    for(const item of lesson.models||[]){
     const source=sourceIndex.get(item.id);
     const cm=getCurriculumModelById(item.id);
     if(!cm||!source){errors.push(`Thiếu dữ liệu gốc ${item.id} (Lớp ${grade})`);continue;}
     const mode={...source,
      id:item.id,name:source.name||item.name,
      chapterId:chapter.id,chapterNum:chapter.number,chapterTitle:chapter.title,
      grade,lessonNum:lesson.lesson,lessonTitle:lesson.title,volume:chapter.volume,
      sourceGrade:cm.sourceGrade,targetGrade:cm.targetGrade,
      sourceLabId:cm.sourceLabId,targetLabId:cm.targetLabId,
      auditSourceId:source.legacyFamilyId,
      relatedExhibit:false,
     };
     if(index.has(mode.id)){errors.push(`Trùng ID Lab ${mode.id}`);continue;}
     index.set(mode.id,mode);modes.push(mode);
     if(item.id==='10-11-C01'||item.id==='10-11-C02'){
      const variants=item.id==='10-11-C01'
       ?[{suffix:'-MUL',subMode:'multiply',name:'Quy tắc nhân (m × n)'}]
       :[{suffix:'-A',subMode:'A',name:'Chỉnh hợp (Aₙᵏ)'},{suffix:'-C',subMode:'C',name:'Tổ hợp (Cₙᵏ)'}];
      if(item.id==='10-11-C01'){mode.name='Quy tắc cộng (m + n)';mode.subMode='add';}
      if(item.id==='10-11-C02'){mode.name='Hoán vị (Pₙ = n!)';mode.subMode='P';}
      for(const variant of variants){
       const other={...mode,...variant,id:item.id+variant.suffix,baseId:item.id,
        relatedVariant:true,displayCode:item.id+variant.suffix};
       index.set(other.id,other);modes.push(other);
      }
     }
     for(const exhibit of exhibitsByAnchor.get(item.id)||[]){
      const display={
       id:exhibit.id, name:exhibit.title||exhibit.id,
       grade,chapterId:chapter.id,chapterNum:chapter.number,chapterTitle:chapter.title,
       lessonNum:lesson.lesson,lessonTitle:lesson.title,volume:chapter.volume,
       baseId:item.id,anchorModeId:item.id,sourceExhibitId:exhibit.id,
       relatedExhibit:true,auditSourceId:'gallery',sourceGrade:grade,targetGrade:grade,
       student_interaction:'Xem hiện vật sẵn có và mở Lab SGK liên kết để theo dõi chuyển động có ý nghĩa toán học',
      };
      if(index.has(display.id)){errors.push(`Trùng ID hiện vật ${display.id}`);continue;}
      index.set(display.id,display);modes.push(display);
     }
    }
   }
   chapters.push({
    id:chapter.id,grade,chapterNum:chapter.number,volume:chapter.volume,
    name:`Chương ${chapter.number}: ${chapter.title}`,
    summary:`Tập ${chapter.volume} · ${chapter.lessons.length} bài · ${modes.filter(m=>!m.relatedExhibit).length} Lab SGK`,
    family:'SGK',source_evidence:'SGK Toán ' +grade+' · Kết nối tri thức',
    modes,
   });
  }
  chaptersByGrade.set(cleanGrade(grade),chapters);
 }
 return {
  chaptersByGrade,index,errors,
  getChapters(grade){return chaptersByGrade.get(cleanGrade(grade))||[];},
  findMode(id){return index.get(String(id||''))||null;},
  findChapter(id){const mode=index.get(String(id||''));return mode?this.getChapters(mode.grade).find(ch=>ch.id===mode.chapterId):null;},
  findLegacyFamily(grade,familyId){return this.getChapters(grade).find(ch=>ch.modes.some(m=>m.auditSourceId===familyId||m.sourceLabId===familyId||m.targetLabId===familyId))||null;},
  labCount:[...index.values()].filter(x=>!x.relatedExhibit&&!x.relatedVariant).length,
  variantCount:[...index.values()].filter(x=>x.relatedVariant).length,
  exhibitCount:[...index.values()].filter(x=>x.relatedExhibit).length,
 };
}
