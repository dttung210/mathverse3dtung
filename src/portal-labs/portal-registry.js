import {GRADE6_PORTALS,grade6ZoneForLab,grade6Labs,grade6Featured} from './grade6-v15.js?v=r107_v15';
import {detectModality} from '../data/migrate-v2-v4-v5.js?v=r107_v15';
import {TOAN6_LAB_MODELS} from '../math6-lab/catalog.js?v=r107_v15';
import {explorationsForGrade} from './exploration-collection.js?v=r107_v15';

/** The original catalog is immutable; virtual workbench samples never enter it. */
export const PORTAL_ZONES=Object.freeze([
  {id:'plane',name:'Hình phẳng 2D',label:'Hình phẳng',icon:'◇',accent:'#20ccb5',description:'Gấp đối xứng, kéo điểm và dựng hình động'},
  {id:'solid',name:'Không gian 3D',label:'Không gian',icon:'⬡',accent:'#9c8bff',description:'Xoay, biến đổi không gian và thiết diện'},
  {id:'graph',name:'Đồ thị hàm số',label:'Đồ thị',icon:'⌁',accent:'#48bafd',description:'Kéo tham số để thấy đồ thị chuyển động'},
  {id:'stats',name:'Thống kê – biểu đồ',label:'Biểu đồ',icon:'▥',accent:'#ffc66c',description:'Kéo cột, thay số liệu và so sánh'},
  {id:'real',name:'Mô hình thực tế',label:'Thực tế',icon:'◈',accent:'#ff8c9c',description:'Vật thể đời sống và thí nghiệm ứng dụng'}
]);
const realIds={6:['g6_03','g6_06','g6_07'],7:['g7_02','g7_01'],8:['g8_01','g8_03'],9:['g9_01','g9_02','g9_03'],10:['g10_08','g10_07'],11:['g11_09','g11_03'],12:['g12_03','g12_06']};
const realTitles={g6_03:'Lát gạch lục giác đều',g6_06:'Hoa văn hình thoi',g6_07:'Mái nhà hình thang cân',g7_02:'Hộp quà hình chữ nhật',g7_01:'Mái lều lăng trụ đứng',g8_01:'Mái tháp hình chóp đều',g8_03:'Độ dài cầu thang (Pythagore)',g9_01:'Lon nước hình trụ',g9_02:'Mũ sinh nhật hình nón',g9_03:'Quả bóng hình cầu',g10_08:'Quỹ đạo hành tinh Elip',g10_07:'Bánh xe hình tròn',g11_09:'Mái tháp hình chóp cụt',g11_03:'Đường ray song song mặt sàn',g12_03:'Bình hoa khối tròn xoay',g12_06:'Hành tinh mặt cầu Oxyz'};
const exampleTypes={plane:'rhombus',solid:'cuboid',graph:'linearSlope',stats:'barChart',real:'cuboid'};
export const zonesForGrade=grade=>Number(grade)===6?GRADE6_PORTALS:PORTAL_ZONES;
export const zoneById=id=>[...PORTAL_ZONES,...GRADE6_PORTALS].find(z=>z.id===id)||null;
export const portalIsAvailable=(grade,zone)=>zonesForGrade(grade).some(x=>x.id===zone);
export function zoneForModel(model){
  if(model.portalZone&&zoneById(model.portalZone))return model.portalZone;
  const mod=model.modality||detectModality(model.type);
  return ({geometry2d:'plane',solid3d:'solid',functiongraph:'graph',statisticschart:'stats'})[mod]||'real';
}
export function labZoneForMath6(lab){return grade6ZoneForLab(lab)||'plane';}
export function gradePortalLabs(grade,zone){
  if(Number(grade)!==6)return [];
  return grade6Labs(zone);
}
function createExample(catalog,grade,zone){
  const type=exampleTypes[zone];
  const source=catalog.find(m=>m.type===type)||catalog.find(m=>zoneForModel(m)===(zone==='real'?'solid':zone));
  if(!source)return null;
  return {...source,grade,id:`portal_demo_g${grade}_${zone}`,title:`Mẫu thao tác bổ sung: ${zoneById(zone).label}`,
    description:`Ví dụ minh họa bổ sung cho Lab ${zoneById(zone).name}, KHÔNG phải mô hình SGK lớp ${grade}.`,
    supplemental:true,portalZone:zone,sourceExhibitId:source.id,custom:false};
}
export function portalExhibits(catalog,grade,zone){
  if(!zoneById(zone))return [];
  if(Number(grade)===6)return grade6Featured(catalog,zone);
  const own=catalog.filter(x=>Number(x.grade)===Number(grade));
  if(zone==='real'){
    const base=(realIds[grade]||[]).map(id=>own.find(x=>x.id===id)).filter(Boolean)
      .map(item=>({...item,id:`real_${grade}_${item.id}`,sourceExhibitId:item.id,portalZone:'real',
        realWorld:true,title:realTitles[item.id]||item.title,
        description:`Mô hình ứng dụng thực tế của ${item.title}. ${item.description||''}`}));
    const extra=explorationsForGrade(catalog,grade,'real').map((item,index)=>({
      ...item,
      id:`real_${grade}_explore_${index}_${item.type}`,
      sourceExhibitId:item.sourceExhibitId||item.id||item.type,
      portalZone:'real',
      realWorld:true,
      description:item.description||`Mô hình minh họa mở rộng cho lớp ${grade}: ${item.title}.`
    }));
    return [...base,...extra].slice(0,9);
  }
  const found=own.filter(item=>zoneForModel(item)===zone).map(item=>(Number(grade)===7&&item.id==='g7_12')?{...item,title:'Biểu đồ hình quạt: trưng bày 3D, đo đúng trong Lab 2D',description:'Hiện vật là minh họa không gian. Đọc góc ở tâm, tỉ lệ và số liệu trên Lab biểu đồ quạt tròn 2D.'}:item);
  // Lớp 7 và 8: không bổ sung hiện vật giả chỉ để lấp cổng trống (đặc biệt thống kê lớp 8).
  const example=[7,8,9,10,11,12].includes(Number(grade))?[]:found.length?[]:[createExample(catalog,grade,zone)].filter(Boolean);
  // GĐ2: the four exploratory class-7 presets are off-syllabus/duplicated, hidden only from grade-7 main exhibition.
  const extra=[7,8,9,10,11,12].includes(Number(grade))?[]:explorationsForGrade(catalog,grade,zone);
  return [...found,...example,...extra].slice(0,9);
}
export function portalCounts(catalog,grade){return zonesForGrade(grade).map(z=>({...z,count:portalExhibits(catalog,grade,z.id).length,math6:gradePortalLabs(grade,z.id).length}));}
export function gallerySelection(items,grade,zone,page=0){
  if(!zone)return items.filter(m=>m.grade===grade).slice(page*9,page*9+9);
  const candidates=portalExhibits(items,grade,zone);
  return candidates.slice(page*9,page*9+9);
}
export const PORTAL_LAYOUT={1:[4],2:[3,5],3:[3,4,5],4:[1,3,5,7],5:[1,3,4,5,7],6:[0,2,3,5,6,8],7:[0,1,2,3,5,6,8],8:[0,1,2,3,5,6,7,8],9:[0,1,2,3,4,5,6,7,8]};
