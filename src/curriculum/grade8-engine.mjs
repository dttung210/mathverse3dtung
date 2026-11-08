/** MATHVERSE grade-8 interactive mathematics, SGK KNTT T1 + T2. Pure functions. */
export const GRADE8_IDS=Object.freeze([
 '8-01-C01','8-01-C02','8-01-C03',
 '8-02-C01','8-02-C02','8-02-C03','8-02-C04','8-02-C05',
 '8-03-C01','8-03-C02','8-03-C03',
 '8-04-C01','8-04-C02',
 '8-05-C01','8-05-C02','8-05-C03',
 '8-06-C07','8-06-C08','8-06-C09',
 '8-08-C01','8-08-C02','8-08-C03','8-08-C04','8-08-C05',
 '8-09-C01','8-09-C02','8-09-C03','8-09-C04'
]);
export const isGrade8Mode=id=>GRADE8_IDS.includes(id);
export const grade8Solid=id=>id.startsWith('8-09-');
const base={
 '8-01':[['a','Độ dài a',1,6,.1,3.5],['b','Độ dài b',.5,4,.1,1.6]],
 '8-02':[['a','Cạnh hoặc đáy AB',3,8,.1,6],['b','Cạnh hoặc đáy CD',2,7,.1,3.4],['h','Chiều cao',1.5,6,.1,3.6],['skew','Độ nghiêng',.2,3,.1,1.3],['angle','Góc A (°)',35,135,1,65]],
 '8-03':[['a','Độ dài BC',4,9,.1,6.5],['h','Chiều cao A',2,6,.1,4.5],['u','Tỉ lệ AD/AB',.15,.85,.01,.52],['v','Tỉ lệ AE/AC',.15,.85,.01,.52]],
 '8-04':[['a','Đoạn BH (hình gốc)',2,6,.1,3.5],['b','Đoạn HC (hình gốc)',2,6,.1,4.5],['h','Chiều cao A',2,6,.1,4.5],['u','Vị trí đường song song',.2,.8,.01,.5]],
 '8-05':[['a','Cạnh góc vuông a',2,6,.1,3],['b','Cạnh góc vuông b',2,6,.1,4],['c','Cạnh đối diện góc đang xét c',2,9,.1,5]],
 '8-06':[['a','Cạnh đáy',2,7,.1,4.5],['h','Chiều cao',2,6,.1,3.4],['u','Tỉ lệ đường song song',.2,.8,.01,.5],['k','Tỉ số đồng dạng',.45,2,.05,1.45]],
 '8-08':[['k','Số mặt thuận lợi (xúc xắc)',1,6,1,3],['red','Số bóng đỏ',1,9,1,3],['blue','Số bóng xanh',1,9,1,2],['trials','Số lần thử',10,1000,10,100],['seed','Hạt giống mô phỏng',1,50,1,7],['n1','Số liệu A',0,25,1,7],['n2','Số liệu B',0,25,1,12],['n3','Số liệu C',0,25,1,9],['n4','Số liệu D',0,25,1,15],['delta','Độ thay đổi nhóm 2',-8,8,1,3]],
 '8-09':[['a','Độ dài cạnh đáy',2,7,.1,4],['h','Chiều cao khối chóp',1.5,7,.1,4.8]]
};
const only={
 '8-02-C01':['a','b','h'], '8-02-C02':['a','h','skew'], '8-02-C03':['a','h'], '8-02-C04':['a','angle'], '8-02-C05':['a'],
 '8-03-C01':['a','h','u'], '8-03-C02':['a','h','u','v'], '8-03-C03':['a','h'],
 '8-04-C01':['a','b','h'], '8-04-C02':['a','b','h','u'],
 '8-05-C01':['a','b'], '8-05-C02':['a','b','c'],'8-05-C03':['a','b'],
 '8-06-C07':['a','h','u'], '8-06-C08':['a','h','k'], '8-06-C09':['a','h','k'],
 '8-08-C01':['n1','n2','n3','n4'], '8-08-C02':['n1','n2','n3','n4','delta'],
 '8-08-C03':['k','trials','seed'], '8-08-C04':['red','blue'], '8-08-C05':['trials','seed']
};
export function grade8Schema(id){
 if(!isGrade8Mode(id))throw Error('Mã Lab Toán 8 chưa có bộ dựng hình');
 const defs=base[id.slice(0,4)], keys=only[id];
 return defs.filter(x=>!keys||keys.includes(x[0])).map(([key,label,min,max,step,def])=>({key,label,min,max,step,def}));
}
export function grade8Defaults(id){const p=Object.fromEntries(grade8Schema(id).map(x=>[x.key,x.def]));if(id==='8-03-C02')p.v=.68;if(id==='8-08-C01')p.chartKind=0;if(id==='8-01-C01'||id==='8-01-C03')p.identityVariant=0;if(id==='8-01-C03')p.lessonScope=7;if(id==='8-08-C03')p.lessonScope=30;return p;}
export function grade8Valid(id,p){return grade8Schema(id).every(x=>Number.isFinite(p[x.key])&&p[x.key]>=x.min-1e-6&&p[x.key]<=x.max+1e-6);}
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
export const areaPoly=pts=>Math.abs(pts.reduce((s,p,i)=>s+cross(p,pts[(i+1)%pts.length]),0))/2;
const near=(a,b,eps=.00001)=>Math.abs(a-b)<=eps*Math.max(1,Math.abs(a),Math.abs(b));
export function quad8(id,p){
 const {a}=p;
 if(id==='8-02-C01'){const b=p.b;return [[0,0],[a,0],[(a+b)/2,p.h],[(a-b)/2,p.h]];}
 if(id==='8-02-C02')return [[0,0],[a,0],[a+p.skew,p.h],[p.skew,p.h]];
 if(id==='8-02-C03')return [[0,0],[a,0],[a,p.h],[0,p.h]];
 if(id==='8-02-C04'){const z=p.angle*Math.PI/180;return [[0,0],[a,0],[a+a*Math.cos(z),a*Math.sin(z)],[a*Math.cos(z),a*Math.sin(z)]];}
 if(id==='8-02-C05')return [[0,0],[a,0],[a,a],[0,a]];
 throw Error('Không phải tứ giác Toán 8');
}
export function quad8Properties(id,p){
 const v=quad8(id,p),sides=v.map((x,i)=>dist(x,v[(i+1)%4])),diags=[dist(v[0],v[2]),dist(v[1],v[3])];
 const midpointAC=v[0].map((n,i)=>(n+v[2][i])/2),midpointBD=v[1].map((n,i)=>(n+v[3][i])/2);
 const dot=(u,w)=>u[0]*w[0]+u[1]*w[1],ab=v[1].map((x,i)=>x-v[0][i]),ad=v[3].map((x,i)=>x-v[0][i]);
 const props={area:areaPoly(v),sides,diags,diagonalsBisect:near(dist(midpointAC,midpointBD),0),legsEqual:near(sides[1],sides[3]),right:near(dot(ab,ad),0),allSidesEqual:sides.every(s=>near(s,sides[0]))};
 return {...props,vertices:v,valid:props.area>1e-5};
}
export const homothety8=(O,P,k)=>[O[0]+k*(P[0]-O[0]),O[1]+k*(P[1]-O[1])];
export function thales8(p,{reverse=false,midline=false}={}){
 const A=[0,p.h],B=[-p.a*.6,0],C=[p.a*.4,0];const u=midline?.5:p.u,v=reverse?p.v:u;
 const D=A.map((x,i)=>x+u*(B[i]-x)),E=A.map((x,i)=>x+v*(C[i]-x));
 return {A,B,C,D,E,ratios:[dist(A,D)/dist(A,B),dist(A,E)/dist(A,C),dist(D,E)/dist(B,C)],parallel:Math.abs(cross([E[0]-D[0],E[1]-D[1]],[C[0]-B[0],C[1]-B[1]]))<1e-8};
}
export function bisector8(p){const A=[0,p.h],B=[-p.a,0],C=[p.b,0],AB=dist(A,B),AC=dist(A,C),k=AB/(AB+AC),D=[B[0]+k*(C[0]-B[0]),0];return {A,B,C,D,AB,AC,BD:dist(B,D),DC:dist(D,C),ratio:AB/AC,ok:near(dist(B,D)/dist(D,C),AB/AC)};}
export function pythag8(p,reverse=false){const {a,b}=p,c=reverse?p.c:Math.hypot(a,b),valid=(a+b>c&&a+c>b&&b+c>a),cos=valid?(a*a+b*b-c*c)/(2*a*b):NaN;
 return {a,b,c,valid,cos,angle:valid?Math.acos(Math.min(1,Math.max(-1,cos)))*180/Math.PI:NaN,
     right:valid&&near(a*a+b*b,c*c,1e-5),difference:valid?a*a+b*b-c*c:NaN};}
export function pyramid8(id,p){if(!grade8Solid(id))throw Error('Không phải khối Toán 8');const triangular=id==='8-09-C01'||(id==='8-09-C03'&&Number(p?.pyramidBaseSides)===3);const A=triangular?Math.sqrt(3)*p.a*p.a/4:p.a*p.a, perimeter=triangular?3*p.a:4*p.a;
 const apothem=triangular?p.a*Math.sqrt(3)/6:p.a/2,slant=Math.hypot(p.h,apothem),sideA=perimeter*slant/2;
 return {type:triangular?'trianglePyramid':'squarePyramid',baseArea:A,faces:triangular?4:5,edges:triangular?6:8,vertices:triangular?4:5,slantHeight:slant,lateralArea:sideA,surfaceArea:sideA+A,volume:A*p.h/3};}
export function grade8Metrics(id,p){const family=id.slice(0,4),fmt=x=>Number.isFinite(x)?Number(x.toFixed(3)):null;
 if(family==='8-01'){
  const a=p.a,b=p.b,v=p.identityVariant??0;
  if(id==='8-01-C01')return v===1?[`(a−b)² = ${fmt((a-b)**2)}`,`a²−2ab+b² = ${fmt(a*a-2*a*b+b*b)}`]:[`(a+b)² = ${fmt((a+b)**2)}`,`a²+2ab+b² = ${fmt(a*a+2*a*b+b*b)}`];
  if(id==='8-01-C02')return [`a²−b² = ${fmt(a*a-b*b)}`,`(a−b)(a+b) = ${fmt((a-b)*(a+b))}`];
  const lhs=[(a+b)**3,(a-b)**3,a**3+b**3,a**3-b**3][v];
  const rhs=[a**3+3*a*a*b+3*a*b*b+b**3,a**3-3*a*a*b+3*a*b*b-b**3,(a+b)*(a*a-a*b+b*b),(a-b)*(a*a+a*b+b*b)][v];
  const lessonTag=v<2?'Bài 7: Lập phương của tổng/hiệu':'Bài 8: Tổng/hiệu hai lập phương';
  return [`${['(a+b)³','(a−b)³','a³+b³','a³−b³'][v]} (${lessonTag}) = ${fmt(lhs)}`,`Khai triển hoặc phân tích thành nhân tử = ${fmt(rhs)}`];
 }
 if(family==='8-02'){const m=quad8Properties(id,p);return [`Diện tích = ${fmt(m.area)}`,`4 cạnh: ${m.sides.map(fmt).join(' / ')}`,`2 đường chéo: ${m.diags.map(fmt).join(' / ')}`,`Hai đường chéo cắt nhau tại trung điểm: ${m.diagonalsBisect?'Đúng':'Sai'}`];}
 if(family==='8-03'||id==='8-06-C07'){const m=thales8(p,{reverse:id==='8-03-C02',midline:id==='8-03-C03'});return [`AD/AB = ${fmt(m.ratios[0])}`,`AE/AC = ${fmt(m.ratios[1])}`,`DE/BC = ${fmt(m.ratios[2])}`,`DE ${m.parallel?'song song':'không song song'} BC`];}
 if(family==='8-04'){const m=bisector8(p);return [`AB/AC = ${fmt(m.ratio)}`,`BD/DC = ${fmt(m.BD/m.DC)}`,`Tính chất phân giác: ${m.ok?'đúng':'sai'}`];}
 if(family==='8-05'){const m=pythag8(p,id==='8-05-C02');return m.valid?[`a²+b² = ${fmt(p.a*p.a+p.b*p.b)}`,`c² = ${fmt(m.c*m.c)}`,`Góc giữa a và b = ${fmt(m.angle)}°`,m.right?'Tam giác vuông':'Chưa phải tam giác vuông']:[`Ba cạnh đã cho không dựng được tam giác`];}
 if(family==='8-06'){
  if(id==='8-06-C08')return [`Tỉ số vị tự (phối cảnh tâm O) k = ${fmt(p.k)}`,`Tỉ số diện tích k² = ${fmt(p.k*p.k)}`,`Bài 37: O, A, A′ thẳng hàng · OA′/OA = |k| · Góc tương ứng bằng nhau`];
  if(id==='8-06-C09')return [`Tỉ số đồng dạng k = ${fmt(p.k)}`,`Tỉ số diện tích k² = ${fmt(p.k*p.k)}`];
  return grade8Metrics('8-03-C01',{...p,u:p.u});
 }
 if(id==='8-08-C03'){
  const z=grade8Probability(id,p,6),scope=Number(p.lessonScope||30);
  const favFaces=Array.from({length:Math.max(1,Math.min(6,Math.round(p.k)))},(_,i)=>i+1).join(', ');
  if(scope===30)return [`Không gian mẫu Ω = {1,2,3,4,5,6} (6 kết quả có thể)`,`Kết quả thuận lợi (Bài 30): {${favFaces}} (${p.k} kết quả)`,`Tần số thử nghiệm = ${z.successes}/${z.count}`,`Ghi chú SGK: Bật chế độ Bài 31 để tính tỉ số xác suất P(A) = k/6`];
  return [`Không gian mẫu Ω = {1,2,3,4,5,6}`,`Số kết quả thuận lợi = ${p.k} ({${favFaces}})`,`P(A) = k/6 = ${fmt(z.theoretical)} (Bài 31: xúc xắc cân đối)`,`Tần số thử nghiệm = ${z.successes}/${z.count}`];
 }
 if(id==='8-08-C04'){const z=grade8Probability(id,p,6);return [`Bóng đỏ = ${p.red}, bóng xanh = ${p.blue}`,`P(lấy bóng đỏ) = ${fmt(z.theoretical)}`,`Tổng số bóng = ${p.red+p.blue}`];}
 if(id==='8-08-C05'){const z=grade8Probability(id,p,6);return [`Số lần tung đồng xu = ${z.count}`,`Số lần mặt ngửa = ${z.successes}`,`Tần số tương đối = ${fmt(z.relative)}`,`Xác suất lí thuyết = 1/2`];}
 if(family==='8-08'){const vals=[p.n1,p.n2,p.n3,p.n4];return [`Số liệu: ${vals.join(', ')}`,`Tổng = ${vals.reduce((a,b)=>a+b,0)}`,`Lớn nhất = ${Math.max(...vals)}`,`Nhóm B thay đổi ${p.delta??0} đơn vị`];}
 if(family==='8-09'){
  const x=pyramid8(id,p);
  const baseMetrics=[`${x.faces} mặt · ${x.edges} cạnh · ${x.vertices} đỉnh`,`Sđáy = ${fmt(x.baseArea)}`,`Sxq = ${fmt(x.lateralArea)}`,`V = ${fmt(x.volume)}`];
  if(id==='8-09-C03')baseMetrics.push(x.type==='trianglePyramid'?'Khai triển Bài 38: 1 đáy tam giác đều + 3 mặt bên tam giác cân khớp 3 cạnh đáy':'Khai triển Bài 39: 1 đáy hình vuông + 4 mặt bên tam giác cân khớp 4 cạnh đáy');
  return baseMetrics;
 }
 return [];
}
/** Deterministic seeded simulation. Not a claim about actual random hardware. */
export function grade8Probability(id,p,t=6){
 if(!['8-08-C03','8-08-C04','8-08-C05'].includes(id))throw Error('Không phải thí nghiệm xác suất');
 if(id==='8-08-C04'){const total=p.red+p.blue;return {count:total,successes:p.red,theoretical:p.red/total,relative:p.red/total,outcomes:[]};}
 const total=Math.max(1,Math.floor(p.trials)),n=Math.max(1,Math.min(total,Math.ceil(total*Math.max(0,Math.min(t,6))/6)));
 let state=(Math.floor(p.seed)*1103515245+12345)>>>0;
 const outcomes=[];let successes=0;const favorable=id==='8-08-C03'?p.k:1,faces=id==='8-08-C03'?6:2;
 for(let i=0;i<n;i++){state=(Math.imul(1664525,state)+1013904223)>>>0;const face=Math.floor((state/4294967296)*faces)+1;outcomes.push(face);if(face<=favorable)successes++;}
 return {count:n,successes,relative:successes/n,theoretical:favorable/faces,outcomes};
}
export const GRADE8_FORMULAS=Object.freeze({
 '8-01':String.raw`(a+b)^2=a^2+2ab+b^2`,
 '8-01-C02':String.raw`a^2-b^2=(a-b)(a+b)`,
 '8-01-C03':String.raw`(a+b)^3=a^3+3a^2b+3ab^2+b^3`,
 '8-02-C01':String.raw`S_{ABCD}=\frac{(AB+CD)h}{2}`,
 '8-02-C02':String.raw`S_{ABCD}=a h`,
 '8-02-C03':String.raw`S_{ABCD}=ab`,
 '8-02-C04':String.raw`S_{ABCD}=\frac{d_1 d_2}{2}`,
 '8-02-C05':String.raw`S_{ABCD}=a^2`,
 '8-03':String.raw`\frac{AD}{AB}=\frac{AE}{AC}=\frac{DE}{BC}`,
 '8-03-C03':String.raw`DE=\frac12BC`,
 '8-04':String.raw`\frac{BD}{DC}=\frac{AB}{AC}`,
 '8-05':'a^2+b^2=c^2',
 '8-05-C03':String.raw`L=\sqrt{a^2+b^2}`, 
 '8-06':String.raw`\triangle ABC\sim\triangle A\prime B\prime C\prime,\quad\frac{S\prime}{S}=k^2` ,
 '8-08':String.raw`N=n_A+n_B+n_C+n_D`,
 '8-08-C03':String.raw`P(A)=\frac{n(A)}{n(\Omega)}=\frac{k}{6}`,
 '8-08-C04':String.raw`P(\text{lấy bóng đỏ})=\frac{r}{r+b}`,
 '8-08-C05':String.raw`f_n(A)=\frac{n_A}{n},\quad P(A)=\frac12`,
 '8-09':String.raw`V=\frac13S_{\text{đáy}}h,\quad S_{xq}=\frac12p_{\text{đáy}}d`
});

/** MathType/Word compatible LaTeX for each display mode. */
export function grade8FormulaFor(id,p={}){
 const v=p.identityVariant??0;
 if(id==='8-01-C01')return v===1?String.raw`(a-b)^2=a^2-2ab+b^2`:String.raw`(a+b)^2=a^2+2ab+b^2`;
 if(id==='8-01-C03')return [
  String.raw`(a+b)^3=a^3+3a^2b+3ab^2+b^3`,
  String.raw`(a-b)^3=a^3-3a^2b+3ab^2-b^3`,
  String.raw`a^3+b^3=(a+b)(a^2-ab+b^2)`,
  String.raw`a^3-b^3=(a-b)(a^2+ab+b^2)`
 ][v];
 return GRADE8_FORMULAS[id]||GRADE8_FORMULAS[id.slice(0,4)]||'';
}
