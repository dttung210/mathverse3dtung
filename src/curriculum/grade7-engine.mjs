/** MATHVERSE Giai doan 2: pure mathematics for 34 grade-7 interactive cases.
 * No external dependency, no layout assumptions. Source: SGK Toan 7 KNTT tap 1/2.
 */
export const GRADE7_IDS=Object.freeze([
 '7-01-C01','7-01-C02','7-01-C03',
 '7-02-C01','7-02-C02','7-02-C03','7-02-C04','7-02-C05',
 '7-03-C01','7-03-C02','7-03-C03','7-03-C04','7-03-C05',
 '7-05-C01','7-05-C02','7-05-C03','7-05-C04','7-05-C05',
 '7-06-C01','7-06-C02','7-06-C03',
 '7-07-C01','7-07-C02',
 '7-08-C01','7-08-C02','7-08-C03','7-08-C04',
 '7-09-C01','7-09-C02','7-09-C03','7-09-C04',
 '7-10-C01','7-10-C02','7-10-C03'
]);
export const isGrade7Mode=id=>GRADE7_IDS.includes(id);
export const grade7Solid=id=>/^7-0[89]-C0[1-4]$/.test(id);
const schemas=Object.freeze({
 '7-01':[['x','Vị trí số x',-4,4,.1,1.5],['zoom','Hệ số phóng to',1,5,.1,2],['n','Số cần lấy căn',2,12,1,2]],
 '7-02':[['theta','Góc điều chỉnh (°)',20,160,1,65],['shift','Độ lệch song song (°)',-25,25,1,0]],
 '7-03':[['u','Hoành độ đỉnh C',1,5,.1,2.3],['v','Chiều cao đỉnh C',1.5,6,.1,3.9],['a','Độ dài AB',3,8,.1,6],['b','Độ dài AC',2,9,.1,5],['c','Độ dài BC',2,9,.1,5]],
 '7-05':[['u','Hoành độ đỉnh C',.7,5.3,.1,2.4],['v','Chiều cao C',1.6,5.8,.1,4.1],['a','Độ dài đoạn AB',3,8,.1,6]],
 '7-06':[['p1','Nhóm A (%)',5,70,1,40],['p2','Nhóm B (%)',5,70,1,35]],
 '7-07':[['y1','Kì 1',0,20,1,7],['y2','Kì 2',0,20,1,12],['y3','Kì 3',0,20,1,9],['y4','Kì 4',0,20,1,16]],
 '7-08':[['a','Chiều dài a',1,6,.1,3],['b','Chiều rộng b',1,6,.1,2],['h','Chiều cao h',1,6,.1,4]],
 '7-09':[['a','Cạnh đáy a',2,6,.1,3.5],['b','Cạnh phía trên b',1,5,.1,2.4],['h_base','Chiều cao tứ giác đáy',1,5,.1,2.6],['h','Chiều cao lăng trụ h',2,7,.1,4]],
 '7-10':[['n','Số lần thử',10,300,10,100],['faces','Tổng số kết quả đồng khả năng',2,10,1,6],['fav','Số kết quả thuận lợi',1,10,1,3]]
});
const only={
 '7-01-C01':['x'], '7-01-C02':['n'],'7-01-C03':['x','zoom'],
 '7-03-C04':['a','b','c'], '7-03-C05':['a','v'],
 '7-05-C05':['a'],
 '7-08-C02':['a'], '7-08-C03':['a','b','h'],
 '7-09-C01':['a','h'],'7-09-C03':['a','h'],'7-09-C04':['a','h','b','h_base'],
 '7-10-C01':[],'7-10-C02':['faces','fav'],'7-10-C03':['n']
};
export function grade7Schema(id){
 if(!isGrade7Mode(id))throw Error('Khong co che do Toan 7');
 const family=id.slice(0,4);let s=schemas[family];
 const keys=only[id];if(keys)s=s.filter(x=>keys.includes(x[0]));
 return s.map(([key,label,min,max,step,def])=>({key,label,min,max,step,def}));
}
export function grade7Defaults(id){const obj={};for(const p of grade7Schema(id))obj[p.key]=p.def;if(id==='7-10-C01')obj.lessonScope=29;return obj;}
export function checkGrade7Params(id,params){
 for(const s of grade7Schema(id))if(!Number.isFinite(params[s.key])||params[s.key]<s.min-1e-9||params[s.key]>s.max+1e-9)return false;
 if(id.startsWith('7-06')&&params.p1+params.p2>95)return false;
 if(id==='7-10-C02'&&params.fav>params.faces)return false;
 return true;
}
const r=(x,n=3)=>Number(x.toFixed(n));
export const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
export const areaTriangle=(A,B,C)=>Math.abs(cross([B[0]-A[0],B[1]-A[1]],[C[0]-A[0],C[1]-A[1]]))/2;
export const med=(P,Q)=>[(P[0]+Q[0])/2,(P[1]+Q[1])/2];
export function triangle7(p){let A=[0,0],B=[p.a??6,0],C=[p.u??2.4,p.v??4.1];return {A,B,C};}
export function triangleCenters7(T){
 const {A,B,C}=T, a=dist(B,C),b=dist(A,C),c=dist(A,B),det=2*cross([B[0]-A[0],B[1]-A[1]],[C[0]-A[0],C[1]-A[1]]);
 if(Math.abs(det)<1e-8)throw Error('Tam giac suy bien');
 const s=(a+b+c)/2,area=areaTriangle(A,B,C);
 const G=[(A[0]+B[0]+C[0])/3,(A[1]+B[1]+C[1])/3];
 const I=[(a*A[0]+b*B[0]+c*C[0])/(a+b+c),(a*A[1]+b*B[1]+c*C[1])/(a+b+c)];
 const b2=(B[0]**2+B[1]**2)-(A[0]**2+A[1]**2),c2=(C[0]**2+C[1]**2)-(A[0]**2+A[1]**2);
 const O=[(b2*(C[1]-A[1])-c2*(B[1]-A[1]))/det,((B[0]-A[0])*c2-(C[0]-A[0])*b2)/det];
 const H=[A[0]+B[0]+C[0]-2*O[0],A[1]+B[1]+C[1]-2*O[1]];
 return {G,I,O,H,r:area/s,R:dist(O,A),area,s};
}
export function pieData(p){const v=[p.p1,p.p2,100-p.p1-p.p2];if(v.some(x=>x<0))throw Error('Phan tram phai khong am');return {values:v,angles:v.map(x=>x*3.6),sum:v.reduce((a,b)=>a+b,0)};}
export function trapezoidArea(a,b,h){return (a+b)*h/2;}
export function grade7SolidProperties(id,p){
 if(!grade7Solid(id))throw Error('Khong phai khoi 3D Toan 7');
 if(id.startsWith('7-08')){const a=p.a,b=id==='7-08-C02'?p.a:p.b??2,h=id==='7-08-C02'?p.a:p.h??4;
  return {faces:6,edges:12,vertices:8,baseArea:a*b,basePerimeter:2*(a+b),lateralArea:2*(a+b)*h,volume:a*b*h,surfaceArea:2*(a*b+a*h+b*h),a,b,h};}
 // 7-09 C02 and C04 have an isosceles trapezium as quadrilateral base.
 const a=p.a,b=p.b??2.4,h_base=p.h_base??2.6,h=p.h;
 const triangular=!['7-09-C02','7-09-C04'].includes(id);
 if(triangular){const baseArea=Math.sqrt(3)*a*a/4;return {faces:5,edges:9,vertices:6,baseArea,basePerimeter:3*a,lateralArea:3*a*h,volume:baseArea*h,surfaceArea:2*baseArea+3*a*h,a,h};}
 const baseArea=trapezoidArea(a,b,h_base),perimeter=a+b+2*Math.hypot((a-b)/2,h_base);
 return {faces:6,edges:12,vertices:8,baseArea,basePerimeter:perimeter,lateralArea:perimeter*h,volume:baseArea*h,surfaceArea:2*baseArea+perimeter*h,a,b,h_base,h};
}
export function grade7Outcome(id,index,seed=2026,faces=6){
 // 32-bit integer hash gives deterministic, almost uniform teaching examples.
 let x=(Math.imul((index+1)^(seed>>>0),0x9e3779b1)+0x7f4a7c15)>>>0;
 x^=x>>>16;x=Math.imul(x,0x85ebca6b);x^=x>>>13;x=Math.imul(x,0xc2b2ae35);x^=x>>>16;x>>>=0;
 return id==='7-10-C01'?x%2:x%faces+1;
}
export function grade7Frequency(id,count,seed=2026,totalFaces=6,favFaces=3){
 const faces=id==='7-10-C01'?2:id==='7-10-C02'?Math.max(2,Math.min(10,Math.round(totalFaces))):6;
 const chosen=Math.max(1,Math.min(faces,Math.round(favFaces))),hist=Array(faces).fill(0);
 for(let k=0;k<count;k++)hist[grade7Outcome(id,k,seed,faces)-(id==='7-10-C01'?0:1)]++;
 const favourable=id==='7-10-C01'?hist[0]:id==='7-10-C02'?hist.slice(0,chosen).reduce((a,b)=>a+b,0):hist[1]+hist[3]+hist[5];
 const expected=id==='7-10-C02'?chosen/faces:.5;
 return {hist,total:count,favourable,relative:count?favourable/count:0,expected,faces,chosen};
}
export function grade7Metrics(id,params,extra={}){
 const p={...grade7Defaults(id),...params},family=id.slice(0,4);
 if(family==='7-01'){
  const base=[`Số đang xét: ${r(id==='7-01-C02'?Math.sqrt(p.n):p.x)}`,`Giá trị tương ứng: ${id==='7-01-C02'?'√'+p.n:'x = '+r(p.x)}`];
  if(id==='7-01-C02')base.push(`Trọng tâm Bài 6: Đọc & ước lượng √${p.n} trên trục số (tam giác vuông là minh họa trực quan; định lí Pythagore học ở Lớp 8)`);
  return base;
 }
 if(family==='7-02')return [`Góc α = ${r(p.theta)}°`,`Góc kề bù = ${r(180-p.theta)}°`,`Góc đối đỉnh = ${r(p.theta)}°`,...(id.endsWith('C05')?[`Hai đường thẳng ${Math.abs(p.shift)<1e-8?'song song':'chưa song song'}`]:[])];
 if(family==='7-03'){
  if(id==='7-03-C04')return [`a+b ${p.a+p.b>p.c?'>':'≤'} c`,`b+c ${p.b+p.c>p.a?'>':'≤'} a`,`c+a ${p.c+p.a>p.b?'>':'≤'} b`,...(p.a+p.b>p.c&&p.b+p.c>p.a&&p.c+p.a>p.b?['Dựng được tam giác']:['Không dựng được tam giác'])];
  const T=triangle7(p);if(id==='7-03-C05')T.C=[p.a/2,p.v];const angles=triangleAngles7(T);return [`A = ${r(angles.A)}°`,`B = ${r(angles.B)}°`,`C = ${r(angles.C)}°`,`Tổng = ${r(angles.A+angles.B+angles.C)}°`];}
 if(family==='7-05'){
  if(id==='7-05-C05'){
   const ab=Number(p.a)||6,pm=ab*Math.sqrt(3)/2;
   return [`AB = R = ${r(ab)}`,`MA = MB = ${r(ab/2)}`,`PA = PB = QA = QB = ${r(ab)}`,`PM = QM = ${r(pm)}`];
  }
  const T=triangle7(p),centers=triangleCenters7(T);return [`G = (${r(centers.G[0])}; ${r(centers.G[1])})`,`I = (${r(centers.I[0])}; ${r(centers.I[1])})`,`R = ${r(centers.R)}`,`r = ${r(centers.r)}`];}
 if(family==='7-06'){const data=pieData(p);return [`Tổng = ${data.sum}%`,...data.values.map((v,i)=>`Nhóm ${'ABC'[i]}: ${v}% = ${r(data.angles[i],1)}°`)];}
 if(family==='7-07')return [`Giá trị: ${[p.y1,p.y2,p.y3,p.y4].join(' / ')}`,`Chênh lệch cuối - đầu: ${p.y4-p.y1}`];
 if(grade7Solid(id)){
  const e=grade7SolidProperties(id,p);
  const m=[`${e.faces} mặt · ${e.edges} cạnh · ${e.vertices} đỉnh`,`S đáy = ${r(e.baseArea)}`,`S xung quanh = ${r(e.lateralArea)}`,`V = ${r(e.volume)}`];
  if(id==='7-08-C03')m.push('Khai triển Bài 36: 4 mặt bên hình chữ nhật + 2 mặt đáy bằng nhau không chồng lấn');
  if(id==='7-09-C03')m.push('Khai triển Bài 37: 2 đáy tam giác bằng nhau + 3 mặt bên hình chữ nhật khớp từng cạnh đáy');
  return m;
 }
 if(family==='7-10'){
  const z=grade7Frequency(id,extra.count??p.n??100,extra.seed??2026,p.faces??6,p.fav??3);
  if(id==='7-10-C01'&&Number(p.lessonScope??extra.lessonScope??29)===29){
   return [`Phạm vi Bài 29 SGK: Nhận diện phép thử & biến cố ngẫu nhiên`,`Tập kết quả có thể: {Mặt 0 (Sấp), Mặt 1 (Ngửa)}`,`Đã thử: ${z.total} lần (mặt 0 xuất hiện ${z.favourable} lần)`,`Mở rộng Bài 30: Chuyển sang chế độ Bài 30 để tính xác suất P = 1/2`];
  }
  return [`Số lần thử: ${z.total}`,`Số lần thuận lợi: ${z.favourable}`,`Tần suất tương đối: ${r(z.relative*100,1)}%`,`Xác suất lý thuyết: ${r(z.expected*100,1)}%`];
 }
 return [];
}
export function triangleAngles7(T){
 const a=dist(T.B,T.C),b=dist(T.A,T.C),c=dist(T.A,T.B);
 const A=Math.acos(Math.max(-1,Math.min(1,(b*b+c*c-a*a)/(2*b*c))))*180/Math.PI;
 const B=Math.acos(Math.max(-1,Math.min(1,(a*a+c*c-b*b)/(2*a*c))))*180/Math.PI;
 return {A,B,C:180-A-B};
}
