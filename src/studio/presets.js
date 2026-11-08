/**
 * Mathverse Geometry Studio: curated, editable parametric presets.
 * Every preset inherits a catalog exhibit: formulas, curriculum & rendering stay valid.
 * All models are editable numeric constructions, not static images.
 */
import { normalizeExhibit } from '../math-core.js';

const CURATED = [
  [6,'polygon','Lục giác đều bán kính 3',{n:6,r:3}],
  [6,'polygon','Bát giác đều bán kính 4',{n:8,r:4}],
  [6,'rhombus','Hình thoi – chéo ngang dài',{a:7,b:3}],
  [6,'trapezoid','Hình thang cân – hai đáy',{a:8,b:4,h:3}],
  [6,'parallelogram','Hình bình hành – thấp',{a:7,b:5,h:2.5}],
  [6,'angles','Hai tia tạo góc vuông',{deg:90}],
  [7,'angles','Góc kề bù: góc 120 độ',{deg:120}],
  [7,'parallelLines','Hai đường song song – cát tuyến',{dist:3,angle:48}],
  [7,'triangleAngles','Tam giác với góc 45° và 65°',{a:45,b:65}],
  [7,'triangleCenters','Trọng tâm tam giác cân',{a:5,b:5,c:6}],
  [7,'triPrism','Lăng trụ tam giác đứng – cao',{a:4,h:7}],
  [7,'cuboid','Hình hộp chữ nhật – dẹt',{a:7,b:5,h:2}],
  [8,'squarePyramid','Chóp tứ giác đều – đáy rộng',{a:7,h:5}],
  [8,'squarePyramid','Chóp tứ giác đều – cao',{a:3.5,h:8}],
  [8,'trianglePyramid','Chóp tam giác đều – thấp',{a:6,h:3}],
  [8,'thales','Tam giác Thalès – tỉ số 1/2',{a:6,b:7,k:50}],
  [8,'rectangleSquare','Hình vuông cạnh 5',{a:5,b:5}],
  [8,'parallelogramMid','Hai đường chéo hình bình hành',{a:6,b:4,deg:75}],
  [9,'cylinder','Hình trụ – bán kính 2, cao 7',{r:2,h:7}],
  [9,'cylinder','Hình trụ – bán kính 4, cao 2',{r:4,h:2}],
  [9,'cone','Hình nón – đáy rộng',{r:4,h:4}],
  [9,'sphereSection','Hình cầu – mặt phẳng gần tâm',{r:4,d:0.7}],
  [9,'circleTangent','Tiếp tuyến đường tròn',{r:3,d:3}],
  [9,'circleInscribed','Góc nội tiếp chắn cung 100°',{r:3,deg:100}],
  [10,'parabolaGeneral','Parabol đối xứng trục Oy',{a:1,b:0,c:-2}],
  [10,'parabolaGeneral','Parabol mở xuống',{a:-1,b:2,c:3}],
  [10,'vectorParallelogram','Cộng hai vectơ không vuông góc',{ux:4,uy:1,vx:2,vy:3}],
  [10,'circleOxy','Đường tròn tâm (−2;1)',{a:-2,b:1,r:2.5}],
  [10,'ellipse','Elip hai trục 10 và 6',{a:5,b:3}],
  [10,'hyperbola','Hypebol với a=3, b=2',{a:3,b:2}],
  [11,'twoPlanes','Hai mặt phẳng cắt nhau',{angle:65}],
  [11,'skewLines','Hai đường chéo nhau – khoảng cách 2',{dist:2,angle:55}],
  [11,'parallelPlanes','Hai mặt phẳng song song – d=2',{dist:2}],
  [11,'dihedralAngle','Góc nhị diện bằng 90°',{deg:90,size:4}],
  [11,'frustumPyramid','Chóp cụt tứ giác đều – cao 4',{a:6,b:3,h:4}],
  [11,'linePlaneAngle','Đường xiên tạo góc 30°',{deg:30,len:6}],
  [12,'cubicCurve','Hàm bậc ba – hai cực trị',{a:1,b:0,c:-3,d:1}],
  [12,'rationalFunc','Phân thức – tiệm cận đứng x=1',{a:2,b:1,c:1,d:-1}],
  [12,'oxyzSphere','Mặt cầu tâm (1;2;−1)',{x:1,y:2,z:-1,r:3}],
  [12,'oxyzPlane','Mặt phẳng với pháp tuyến (1;1;1)',{A:1,B:1,C:1,D:-3}],
  [12,'oxyzVector','Vectơ tọa độ (3;−2;4)',{x:3,y:-2,z:4}],
  [12,'revolvedSolid','Khối tròn xoay – hai bán kính',{r1:2,r2:4,h:6}]
];

export function buildPresets(catalog){
  const byKey=new Map((catalog||[]).map(m=>[`${m.grade}:${m.type}`,m]));
  return CURATED.flatMap(([grade,type,label,params],i)=>{
    const base=byKey.get(`${grade}:${type}`);
    if(!base)return [];
    return [normalizeExhibit({
      ...base,id:`preset_${grade}_${String(i+1).padStart(2,'0')}`,
      title:label,
      description:`${label}. Đây là mô hình tham số có thể kéo/chỉnh sửa và sao lưu riêng; phép dựng dựa trên ${base.title}.`,
      params:{...base.params,...params},
      preset:true,
      templateSourceId:base.id,
      custom:false
    })];
  });
}

const FAVORITES_KEY='mathverse-geometry-studio-favorites-v9';
export function loadFavorites(storage){
  try {
    const store = storage !== undefined ? storage : globalThis.localStorage;
    const data=JSON.parse(store.getItem(FAVORITES_KEY)||'[]');
    return new Set(Array.isArray(data)?data.filter(x=>typeof x==='string').slice(0,300):[]);
  }catch{return new Set();}
}
export function saveFavorites(ids,storage){
  try{
    const store = storage !== undefined ? storage : globalThis.localStorage;
    store.setItem(FAVORITES_KEY,JSON.stringify([...ids].slice(0,300)));
    return true;
  }catch{return false;}
}
