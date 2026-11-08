import {formatLinearExpr2D} from './math-formula-renderer.mjs?v=r107_v15';

/** Grade 10 - KNTT geometry, graph, probability and statistics engine.
 * Pure functions: do not depend on browser or GPU. No special-case fake results.
 */
export const GRADE10_FAMILY_SIZES=Object.freeze({'10-01':4,'10-02':3,'10-03':3,'10-04':4,'10-05':3,'10-07':4,'10-08':3,'10-09':3,'10-10':4,'10-11':4});
export const GRADE10_IDS=Object.freeze(Object.entries(GRADE10_FAMILY_SIZES).flatMap(([family,count])=>Array.from({length:count},(_,i)=>`${family}-C${String(i+1).padStart(2,'0')}`)));
export const isGrade10Mode=id=>GRADE10_IDS.includes(id);
export const grade10Family=id=>id.slice(0,5);
const z=(key,label,min,max,step)=>({key,label,min,max,step});
const FIELDS={
 '10-01':[z('onlyA','Chỉ thuộc A',0,12,1),z('both','Giao A ∩ B',0,12,1),z('onlyB','Chỉ thuộc B',0,12,1),z('outside','Ngoài A và B',0,12,1),z('l1','Đầu trái A',-5,5,1),z('r1','Đầu phải A',-5,5,1),z('l2','Đầu trái B',-5,5,1),z('r2','Đầu phải B',-5,5,1)],
 '10-02':[z('a','Hệ số a₁',-3,3,1),z('b','Hệ số b₁',-3,3,1),z('c','Hằng số c₁',-8,8,1),z('d','Hệ số a₂',-3,3,1),z('e','Hệ số b₂',-3,3,1),z('f','Hằng số c₂',-8,8,1),z('u','Mục tiêu u',-3,3,1),z('v','Mục tiêu v',-3,3,1)],
 '10-03':[z('base','Độ dài AB',2,8,.2),z('cx','Hoành độ C',-3,9,.2),z('cy','Độ cao C',1,8,.2)],
 '10-04':[z('ux','uₓ',-5,5,.5),z('uy','uᵧ',-5,5,.5),z('vx','vₓ',-5,5,.5),z('vy','vᵧ',-5,5,.5),z('k','Hệ số k',-3,3,.25)],
 '10-05':[z('ax','x_A',-5,5,.5),z('ay','y_A',-5,5,.5),z('bx','x_B',-5,5,.5),z('by','y_B',-5,5,.5),z('vx','vₓ',-5,5,.5),z('vy','vᵧ',-5,5,.5)],
 '10-07':[z('a','VTPT a₁',-4,4,1),z('b','VTPT b₁',-4,4,1),z('c','Hệ số c₁',-6,6,1),z('d','VTPT a₂',-4,4,1),z('e','VTPT b₂',-4,4,1),z('f','Hệ số c₂',-6,6,1),z('px','x_P',-5,5,.5),z('py','y_P',-5,5,.5)],
 '10-08':[z('h','Hoành độ tâm h',-3,3,.25),z('k','Tung độ tâm k',-3,3,.25),z('r','Bán kính R',.5,4,.25),z('m','Hệ số góc m',-3,3,.25),z('q','Tung độ gốc q',-5,5,.25),z('angle','Góc tiếp xúc (°)',0,360,5)],
 '10-09':[z('a','Bán trục a',1.5,6,.25),z('b','Bán trục b',.5,5,.25),z('p','Tham số tiêu p',.5,5,.25)],
 '10-10':[z('shift','Dịch số liệu',-5,5,.5),z('stretch','Tỉ lệ số liệu',.5,2,.1),z('outlier','Tăng giá trị cuối',0,10,.5),z('exact','Giá trị đúng a',-5,10,.1),z('estimate','Giá trị gần đúng ā',-5,10,.1),z('tolerance','Sai số cho phép d',.1,5,.1)],
 '10-11':[z('n','Số phần tử n',2,9,1),z('k','Số chọn k',1,8,1),z('wanted','Số thuận lợi',1,9,1)]
};
const DEFAULTS={
 '10-01':{onlyA:4,both:3,onlyB:5,outside:2,l1:-3,r1:2,l2:-1,r2:4},
 '10-02':{a:1,b:1,c:2,d:-1,e:1,f:1,u:2,v:1},
 '10-03':{base:5,cx:1.5,cy:3.7},
 '10-04':{ux:3,uy:1,vx:1,vy:2,k:1.5},
 '10-05':{ax:-2,ay:1,bx:2,by:3,vx:1,vy:-2},
 '10-07':{a:1,b:-1,c:-1,d:2,e:1,f:-2,px:-2,py:3},
 '10-08':{h:0,k:0,r:3,m:1,q:1,angle:40},
 '10-09':{a:4,b:2.5,p:2},
 '10-10':{shift:0,stretch:1,outlier:0,exact:3.25,estimate:3.4,tolerance:.3},
 '10-11':{n:6,k:3,wanted:2}
};
const fixed=(n,d=2)=>Number.isFinite(n)?Number(n.toFixed(d)):'--';
const close=(a,b)=>Math.abs(a-b)<1e-9;
const pt=(x,y)=>[x,y];
export function grade10Schema(id){if(!isGrade10Mode(id))throw Error(`Unknown Grade10 Lab: ${id}`);const family=grade10Family(id),n=Number(id.slice(-2));let fields=FIELDS[family];
 if(family==='10-01')fields=n===4?fields.slice(4):fields.slice(0,4);
 if(family==='10-10')fields=n===4?fields.slice(3):fields.slice(0,3);
 if(family==='10-02'&&n===1)fields=fields.slice(0,3);
 if(family==='10-02'&&n===2)fields=fields.slice(0,6);
 if(family==='10-04'&&n!==3)fields=fields.filter(s=>s.key!=='k');
 if(family==='10-05'&&n!==3)fields=fields.filter(s=>!['vx','vy'].includes(s.key));
 if(family==='10-07'&&n!==3)fields=fields.filter(s=>!['d','e','f'].includes(s.key));
 if(family==='10-07'&&n!==4)fields=fields.filter(s=>!['px','py'].includes(s.key));
 if(family==='10-08'&&n===1)fields=fields.filter(s=>!['m','q','angle'].includes(s.key));
 if(family==='10-08'&&n===2)fields=fields.filter(s=>s.key!=='angle');
 if(family==='10-08'&&n===3)fields=fields.filter(s=>!['m','q'].includes(s.key));
 if(family==='10-09')fields=fields.filter(s=>n===3?s.key==='p':s.key!=='p');
 if(family==='10-11'&&n===1)fields=fields.filter(s=>s.key!=='wanted');
 if(family==='10-11'&&n===2)fields=fields.filter(s=>s.key!=='wanted');
 if(family==='10-11'&&n===3)fields=fields.filter(s=>s.key!=='k');
 if(family==='10-11'&&n===4)fields=fields.filter(s=>s.key==='n');
 return fields;
}
export function grade10Defaults(id){if(!isGrade10Mode(id))throw Error('Unknown Grade10 Lab');return {...DEFAULTS[grade10Family(id)]};}
export function grade10Valid(id,p){if(!isGrade10Mode(id))return false;const keys=FIELDS[grade10Family(id)];if(keys.some(s=>!Number.isFinite(p[s.key])||p[s.key]<s.min-1e-9||p[s.key]>s.max+1e-9))return false;
 if(grade10Family(id)==='10-02'&&Math.hypot(p.a,p.b)<1e-10)return false;
 if(grade10Family(id)==='10-02'&&Number(id.slice(-2))>=2&&Math.hypot(p.d,p.e)<1e-10)return false;
 if(grade10Family(id)==='10-07'&&Math.hypot(p.a,p.b)<1e-10)return false;
 if(grade10Family(id)==='10-07'&&id==='10-07-C03'&&Math.hypot(p.d,p.e)<1e-10)return false;
 if(grade10Family(id)==='10-01'&&id==='10-01-C04'&&(p.l1>p.r1||p.l2>p.r2))return false;
 if(grade10Family(id)==='10-03'){const a=Math.hypot(p.cx-p.base,p.cy),b=Math.hypot(p.cx,p.cy),c=p.base;if(!(c>0&&p.cy>0&&a+b>c+1e-7&&a+c>b+1e-7&&b+c>a+1e-7))return false;}
 if(grade10Family(id)==='10-11'&&((id!=='10-11-C01'&&p.k>p.n)||p.wanted>p.n))return false;
 return true;
}
export function grade10InvalidReason(id,p){
 const fam=grade10Family(id),n=Number(id.slice(-2));
 if(fam==='10-01'&&n===4&&(p.l1>p.r1||p.l2>p.r2))return 'Đầu trái của khoảng/đoạn phải nhỏ hơn hoặc bằng đầu phải (a ≤ b, c ≤ d). Đã giữ khung hình hợp lệ gần nhất.';
 if(fam==='10-02'&&Math.hypot(p.a,p.b)<1e-10)return 'Hệ số (a₁, b₁) = (0, 0) làm suy biến đường biên thứ nhất. Cần a₁² + b₁² > 0.';
 if(fam==='10-02'&&n>=2&&Math.hypot(p.d,p.e)<1e-10)return 'Hệ số (a₂, b₂) = (0, 0) làm suy biến đường biên thứ hai. Cần a₂² + b₂² > 0.';
 if(fam==='10-03')return 'Ba đỉnh A, B, C thẳng hàng hoặc suy biến (vi phạm bất đẳng thức tam giác a + b > c). Hãy kéo đỉnh C ra khỏi đường thẳng AB.';
 if(fam==='10-07'&&Math.hypot(p.a,p.b)<1e-10)return 'Vectơ pháp tuyến n₁ = (0; 0) không xác định đường thẳng. Cần a₁² + b₁² > 0.';
 if(fam==='10-07'&&n===3&&Math.hypot(p.d,p.e)<1e-10)return 'Vectơ pháp tuyến n₂ = (0; 0) không xác định đường thẳng d₂. Cần a₂² + b₂² > 0.';
 if(fam==='10-11'&&p.k>p.n)return 'Số phần tử được chọn k không thể lớn hơn tổng số phần tử n (cần 0 ≤ k ≤ n).';
 if(fam==='10-11'&&p.wanted>p.n)return 'Số kết quả thuận lợi n(A) không thể vượt quá số phần tử không gian mẫu n(Ω).';
 return 'Tham số nằm ngoài miền xác định Toán học. Đã giữ khung hình hợp lệ gần nhất.';
}
export function clipHalfplane(poly,a,b,c){const inside=P=>a*P[0]+b*P[1]-c<=1e-9;
 const result=[];for(let i=0;i<poly.length;i++){const P=poly[i],Q=poly[(i+1)%poly.length],u=a*P[0]+b*P[1]-c,v=a*Q[0]+b*Q[1]-c,I=inside(P),J=inside(Q);
  if(I&&J)result.push(Q);
  else if(I&&!J){const h=u/(u-v);result.push(pt(P[0]+h*(Q[0]-P[0]),P[1]+h*(Q[1]-P[1])));}
  else if(!I&&J){const h=u/(u-v);result.push(pt(P[0]+h*(Q[0]-P[0]),P[1]+h*(Q[1]-P[1])));result.push(Q);}
 }
 return result.filter((P,i,all)=>i===0||Math.hypot(P[0]-all[i-1][0],P[1]-all[i-1][1])>1e-8);
}
export function feasiblePolygon(p,second=false,lim=5){const bbox=[[-lim,-lim],[lim,-lim],[lim,lim],[-lim,lim]];const first=clipHalfplane(bbox,p.a,p.b,p.c);return second?clipHalfplane(first,p.d,p.e,p.f):first;}
export function polygonArea(pts){return Math.abs(pts.reduce((acc,p,i)=>acc+p[0]*pts[(i+1)%pts.length][1]-p[1]*pts[(i+1)%pts.length][0],0)/2);}
export function grade10Triangle(p){const A=pt(0,0),B=pt(p.base,0),C=pt(p.cx,p.cy),a=Math.hypot(p.cx-p.base,p.cy),b=Math.hypot(p.cx,p.cy),c=p.base;
 const cosA=(b*b+c*c-a*a)/(2*b*c),cosB=(a*a+c*c-b*b)/(2*a*c),cosC=(a*a+b*b-c*c)/(2*a*b);
 const angA=Math.acos(Math.max(-1,Math.min(1,cosA))),angB=Math.acos(Math.max(-1,Math.min(1,cosB))),angC=Math.acos(Math.max(-1,Math.min(1,cosC))),area=c*p.cy/2;
 const a2=a*a,b2=b*b,c2=c*c,twoBcCosA=2*b*c*cosA,rhsCosine=b2+c2-twoBcCosA;
 return {A,B,C,a,b,c,a2,b2,c2,twoBcCosA,rhsCosine,cosA,cosB,cosC,angA,angB,angC,area,R:a*b*c/(4*area)};
}
export function grade10Line(p){const det=p.a*p.e-p.d*p.b,nn1=Math.hypot(p.a,p.b),nn2=Math.hypot(p.d,p.e),parallel=Math.abs(det)<1e-10,coincident=parallel&&Math.abs(p.a*p.f-p.d*p.c)<1e-9&&Math.abs(p.b*p.f-p.e*p.c)<1e-9;
 const intersection=parallel?null:[(p.b*p.f-p.c*p.e)/det,(p.c*p.d-p.a*p.f)/det];
 const distance=Math.abs(p.a*p.px+p.b*p.py+p.c)/nn1,angle=Math.acos(Math.min(1,Math.max(0,Math.abs((p.a*p.d+p.b*p.e)/(nn1*nn2)))));
 const footFactor=(p.a*p.px+p.b*p.py+p.c)/(nn1*nn1),foot=[p.px-footFactor*p.a,p.py-footFactor*p.b];
 return {det,parallel,coincident,intersection,angle,distance,foot};}
export function grade10Circle(p){const norm=Math.hypot(p.m,1),d=Math.abs(p.k-p.m*p.h-p.q)/norm;
 const A=1+p.m*p.m,B=2*(p.m*(p.q-p.k)-p.h),C=p.h*p.h+(p.q-p.k)**2-p.r*p.r,delta=B*B-4*A*C;
 const intersections=delta< -1e-9?[]:Math.abs(delta)<=1e-9?[[-B/(2*A),p.m*(-B/(2*A))+p.q]]:[(-B-Math.sqrt(delta))/(2*A),(-B+Math.sqrt(delta))/(2*A)].map(x=>[x,p.m*x+p.q]);
 const angle=p.angle*Math.PI/180,contact=[p.h+p.r*Math.cos(angle),p.k+p.r*Math.sin(angle)];
 return {distance:d,delta,state:d>p.r+1e-9?'none':Math.abs(d-p.r)<1e-9?'tangent':'secant',intersections,contact,tangent:{a:Math.cos(angle),b:Math.sin(angle),c:Math.cos(angle)*contact[0]+Math.sin(angle)*contact[1]}};
}
export function grade10Statistics(p){const base=[2,3,4,5,5,6,8,9,12,14];const values=base.map((x,i)=>p.shift+p.stretch*x+(i===base.length-1?p.outlier:0)).sort((a,b)=>a-b),n=values.length;
 const avg=values.reduce((a,b)=>a+b,0)/n,median=(values[n/2-1]+values[n/2])/2,low=values.slice(0,n/2),high=values.slice(n/2),med=arr=>arr.length%2?arr[(arr.length-1)/2]:(arr[arr.length/2-1]+arr[arr.length/2])/2;
 const q1=med(low),q3=med(high),variance=values.reduce((s,x)=>s+(x-avg)**2,0)/n;
 const histogram=new Map();for(const x of values)histogram.set(x,(histogram.get(x)||0)+1);const maxCount=Math.max(...histogram.values()),modes=[...histogram].filter(([,cnt])=>cnt===maxCount).map(([val])=>val);
 return {values,n,avg,median,q1,q3,range:values[n-1]-values[0],iqr:q3-q1,variance,stddev:Math.sqrt(variance),modes:maxCount<=1?[]:modes};}
const fact=n=>{let v=1;for(let j=2;j<=n;j++)v*=j;return v;};
export function grade10Experiment(id,p,tries=0,seed=20261026){
 let s=seed>>>0,hits=0;
 const outcomes=[];
 const runningRel=[];
 const step=Math.max(1,Math.floor(tries/40));
 for(let i=0;i<tries;i++){
  s^=s<<13;s^=s>>>17;s^=s<<5;
  const value=1+(s>>>0)%p.n;
  if(value<=p.wanted)hits++;
  if(i>=tries-20)outcomes.push(value);
  if((i+1)%step===0||i===tries-1)runningRel.push({n:i+1,f:hits/(i+1)});
 }
 return {tries,hits,relative:tries?hits/tries:0,outcomes,runningRel,probability:p.wanted/p.n,last:outcomes.at(-1)??null};
}
export function grade10Math(id,p,{tries=0,openBLeft=false,strictIneq=false,testM=null,swapDiff=false,ruleMode='multiply',orderMode='ordered'}={}){if(!grade10Valid(id,p))throw Error('Grade 10 parameters invalid or degenerate');const fam=grade10Family(id),idx=Number(id.slice(-2));let result={},latex='',lines=[];const record=(key,value)=>lines.push([key,typeof value==='number'?fixed(value):value]);
 if(fam==='10-01'&&idx===4){
  const a=[p.l1,p.r1],b=[p.l2,p.r2],lo=Math.max(p.l1,p.l2),hi=Math.min(p.r1,p.r2);
  const touchAtOpen=openBLeft&&Math.abs(lo-hi)<1e-9&&Math.abs(p.l2-lo)<1e-9;
  const inter=(lo<=hi&&!touchAtOpen)?[lo,hi]:null;
  const united=(p.r1<p.l2||(openBLeft&&Math.abs(p.r1-p.l2)<1e-9)||p.r2<p.l1)?[a,b]:[[Math.min(p.l1,p.l2),Math.max(p.r1,p.r2)]];
  const brBLeft=openBLeft?'(':'[';
  result={a,b,intersection:inter,union:united,openBLeft};latex=String.raw`[a;b]\cap[c;d]=[\max(a,c);\min(b,d)]\quad\text{(khi giao }\ne\varnothing\text{)}`;
  record('Tập A',`[${p.l1}; ${p.r1}]`);record('Tập B',`${brBLeft}${p.l2}; ${p.r2}]`);
  record('Giao A ∩ B',inter?(Math.abs(inter[0]-inter[1])<1e-9?`{${inter[0]}}`:`${openBLeft&&Math.abs(inter[0]-p.l2)<1e-9?'(':'['}${inter.join('; ')}]`):'∅ (tập rỗng)');
  record('Hợp A ∪ B',united.map((I,k)=>k===1&&openBLeft?`(${I.join('; ')}]`:`[${I.join('; ')}]`).join(' ∪ '));
 }else if(fam==='10-01'){
  const onlyA=Math.round(p.onlyA),both=Math.round(p.both),onlyB=Math.round(p.onlyB),outside=Math.round(p.outside);
  const union=onlyA+both+onlyB,total=union+outside,intersection=both;result={union,total,intersection,difference:onlyA,reverseDiff:onlyB,complement:onlyB+outside};
  latex=idx===1?String.raw`n(A\cup B)=n(A)+n(B)-n(A\cap B)`:idx===2?(swapDiff?String.raw`B\setminus A=\{x\in B\mid x\notin A\}`:String.raw`A\setminus B=\{x\in A\mid x\notin B\}`):String.raw`C_U A=U\setminus A,\quad n(C_U A)=n(U)-n(A)`;
  if(idx===1){record('Số phần tử n(A)',onlyA+intersection);record('Số phần tử n(B)',onlyB+intersection);record('Giao n(A ∩ B)',intersection);record('Hợp n(A ∪ B)',union);}
  else if(idx===2){record('Số phần tử n(A)',onlyA+intersection);record('Hiệu n(A \\ B)',onlyA);record('Hiệu n(B \\ A)',onlyB);record('Giao n(A ∩ B)',intersection);}
  else{record('Tập vũ trụ n(U)',total);record('Số phần tử n(A)',onlyA+intersection);record('Phần bù n(C_U A)',result.complement);}
 }else if(fam==='10-02'){
  const poly=feasiblePolygon(p,idx>=2),area=poly.length>=3?polygonArea(poly):0,rows=poly.map(P=>({x:P[0],y:P[1],value:p.u*P[0]+p.v*P[1]}));const max=rows.length?rows.reduce((a,b)=>a.value>=b.value?a:b):null;
  const mx=testM?testM[0]:0,my=testM?testM[1]:0,lhsM=p.a*mx+p.b*my,inM=strictIneq?(lhsM<p.c-1e-9):(lhsM<=p.c+1e-9);
  result={vertices:poly,area,empty:poly.length===0,objective:max,clipped:true,rows,testM:[mx,my],lhsM,inM,strictIneq};
  latex=idx===1?(strictIneq?String.raw`ax+by<c`:String.raw`ax+by\le c`):idx===2?String.raw`\begin{cases}a_1x+b_1y\le c_1\\a_2x+b_2y\le c_2\end{cases}`:String.raw`F(x,y)=ux+vy\;\longrightarrow\;\max\quad\text{[Mở rộng / Vận dụng Bài 4]}`;
  if(idx===1){
   record('Đường bờ (d₁)',`${p.a}x + ${p.b}y = ${p.c} (${strictIneq?'Nét đứt, không lấy bờ':'Nét liền, có lấy bờ'})`);
   record(`Điểm thử M(${fixed(mx,1)}; ${fixed(my,1)})`,`VT = ${fixed(lhsM,1)} ${strictIneq?'<':'≤'} ${p.c} → ${inM?'Thuộc miền nghiệm':'Không thuộc'}`);
   record('Miền nghiệm',`Nửa mặt phẳng bờ (d₁) ${inM?'chứa M (được tô màu)':'không chứa M'}`);
  }else if(idx===2){
   const det=p.a*p.e-p.b*p.d;
   const interPt=Math.abs(det)>1e-4?`(${fixed((p.c*p.e-p.b*p.f)/det,1)}; ${fixed((p.a*p.f-p.c*p.d)/det,1)})`:'Song song / Trùng';
   const in2=p.d*mx+p.e*my<=p.f+1e-9;
   record('Giao điểm 2 bờ I',interPt);
   record(`Điểm thử M(${fixed(mx,1)}; ${fixed(my,1)})`,`${inM&&in2?'M ∈ S₁ ∩ S₂ (Thuộc miền nghiệm chung)':inM?'M chỉ thuộc S₁':in2?'M chỉ thuộc S₂':'M ∉ S'}`);
   record('Miền nghiệm chung S',poly.length?`Miền giao S₁ ∩ S₂ (${poly.length} đỉnh)`:'∅ (rỗng trong khung)');
  }else{
   record('Hệ 4 đường ràng buộc',`(d₁): ${p.a}x + ${p.b}y ≤ ${p.c}; (d₂): ${p.d}x + ${p.e}y ≤ ${p.f}; (d₃): x ≥ 0; (d₄): y ≥ 0`);
   record('Hướng tăng mục tiêu F',`∇F = (${p.u}; ${p.v})`);
   if(poly.length){
    record('Tọa độ các đỉnh',rows.map((r,i)=>`V_${i+1}(${fixed(r.x,1)}; ${fixed(r.y,1)})`).join(', '));
    record('Giá trị F tại các đỉnh',rows.map((r,i)=>`F(V_${i+1}) = ${fixed(r.value,1)}`).join(', '));
   }
   if(max){record('Đỉnh cực trị tối ưu',`Max F = ${fixed(max.value,1)} tại đỉnh (${fixed(max.x,1)}; ${fixed(max.y,1)})`);}
   record('Miền nghiệm đa giác',poly.length?`${poly.length} đỉnh lồi`:'∅ (rỗng)');
  }
  if(!poly.length)record('Miền nghiệm','∅ (rỗng trong khung)');
 }else if(fam==='10-03'){
  result=grade10Triangle(p);latex=idx===1?String.raw`a^2=b^2+c^2-2bc\cos A`:idx===2?String.raw`\frac{a}{\sin A}=\frac{b}{\sin B}=\frac{c}{\sin C}=2R`:String.raw`S=\frac12bc\sin A=\frac12c\cdot h_c`;
  if(idx===1){record('Cạnh a = BC',result.a);record('Cạnh b = AC',result.b);record('Cạnh c = AB',result.c);record('Góc A (°)',result.angA*180/Math.PI);record('a² = b² + c² − 2bc·cos A',result.a2);}
  else if(idx===2){record('Bán kính ngoại tiếp R',result.R);record('Đường kính 2R = a/sin A',2*result.R);record('Cạnh a = BC',result.a);record('Góc A (°)',result.angA*180/Math.PI);}
  else{record('Diện tích S',result.area);record('Đường cao h_c',p.cy);record('Cạnh đáy c = AB',result.c);record('Bán kính ngoại tiếp R',result.R);}
 }else if(fam==='10-04'){
  const u=[p.ux,p.uy],v=[p.vx,p.vy],dot=u[0]*v[0]+u[1]*v[1],resultant=idx===1?[u[0]+v[0],u[1]+v[1]]:idx===2?[u[0]-v[0],u[1]-v[1]]:idx===3?[p.k*u[0],p.k*u[1]]:null;
  const sizeU=Math.hypot(...u),sizeV=Math.hypot(...v),angle=sizeU*sizeV>0?Math.acos(Math.max(-1,Math.min(1,dot/(sizeU*sizeV)))):null;
  result={u,v,dot,resultant,angle};latex=idx===1?String.raw`\vec u+\vec v=(u_x+v_x;\;u_y+v_y)`:idx===2?String.raw`\vec u-\vec v=\vec u+(-\vec v)=(u_x-v_x;\;u_y-v_y)`:idx===3?String.raw`k\vec u=(ku_x;\;ku_y),\quad |k\vec u|=|k|\cdot|\vec u|`:String.raw`\vec u\cdot\vec v=|\vec u|\cdot|\vec v|\cos(\vec u,\vec v)=u_xv_x+u_yv_y`;
  if(idx===1){record('Vectơ u',`(${fixed(u[0])}; ${fixed(u[1])})`);record('Vectơ v',`(${fixed(v[0])}; ${fixed(v[1])})`);record('Vectơ tổng u + v',`(${fixed(resultant[0])}; ${fixed(resultant[1])})`);record('Độ dài |u + v|',Math.hypot(...resultant));}
  else if(idx===2){record('Vectơ u',`(${fixed(u[0])}; ${fixed(u[1])})`);record('Vectơ v',`(${fixed(v[0])}; ${fixed(v[1])})`);record('Vectơ hiệu u − v',`(${fixed(resultant[0])}; ${fixed(resultant[1])})`);record('Độ dài |u − v|',Math.hypot(...resultant));}
  else if(idx===3){record('Vectơ u',`(${fixed(u[0])}; ${fixed(u[1])})`);record('Hệ số k',p.k);record('Vectơ tích k·u',`(${fixed(resultant[0])}; ${fixed(resultant[1])})`);record('Độ dài |k·u|',Math.hypot(...resultant));if(Math.abs(p.k)<1e-9||sizeU<1e-9)record('Chú ý hướng','Vectơ-không 0⃗ không có hướng xác định');}
  else{record('Độ dài |u|',sizeU);record('Độ dài |v|',sizeV);record('Tích vô hướng u·v',dot);record('Góc (u, v)',angle!==null?`${fixed(angle*180/Math.PI,1)}°`:'Không xác định (vectơ 0)');}
 }else if(fam==='10-05'){
  const u=[p.bx-p.ax,p.by-p.ay],v=[p.vx,p.vy],dot=u[0]*v[0]+u[1]*v[1],length=Math.hypot(...u);
  result={A:[p.ax,p.ay],B:[p.bx,p.by],u,v,dot,length};latex=idx===1?String.raw`\overrightarrow{AB}=(x_B-x_A;\;y_B-y_A)`:idx===2?String.raw`|\overrightarrow{AB}|=\sqrt{(x_B-x_A)^2+(y_B-y_A)^2}`:String.raw`\overrightarrow{AB}\cdot\vec v=u_xv_x+u_yv_y`;
  if(idx===1){record('Điểm A',`(${fixed(p.ax)}; ${fixed(p.ay)})`);record('Điểm B',`(${fixed(p.bx)}; ${fixed(p.by)})`);record('Tọa độ vectơ AB',`(${fixed(u[0])}; ${fixed(u[1])})`);}
  else if(idx===2){record('Tọa độ vectơ AB',`(${fixed(u[0])}; ${fixed(u[1])})`);record('Độ dài |AB|',length);record('Trung điểm M',`(${fixed((p.ax+p.bx)/2)}; ${fixed((p.ay+p.by)/2)})`);}
  else{record('Vectơ AB',`(${fixed(u[0])}; ${fixed(u[1])})`);record('Vectơ v',`(${fixed(v[0])}; ${fixed(v[1])})`);record('Thành phần uₓvₓ + uᵧvᵧ',`${fixed(u[0]*v[0])} + (${fixed(u[1]*v[1])}) = ${fixed(dot)}`);record('Tích vô hướng AB·v',dot);}
 }else if(fam==='10-07'){
  result=grade10Line(p);latex=idx===1?String.raw`\Delta:\;ax+by+c=0,\quad\vec n=(a;b)`:idx===2?String.raw`\begin{cases}x=x_0-bt\\y=y_0+at\end{cases}\quad(t\in\mathbb{R})`:idx===3?String.raw`\cos\varphi=\frac{|a_1a_2+b_1b_2|}{\sqrt{a_1^2+b_1^2}\cdot\sqrt{a_2^2+b_2^2}}`:String.raw`d(P,\Delta)=\frac{|ax_P+by_P+c|}{\sqrt{a^2+b^2}}`;
  record('VTPT n',`(${p.a}; ${p.b})`);if(idx<=2)record('VTCP u',`(${-p.b}; ${p.a})`);if(idx===3){record('Vị trí tương đối',result.coincident?'Trùng nhau':result.parallel?'Song song':'Cắt nhau');if(result.intersection)record('Giao điểm M',`(${result.intersection.map(x=>fixed(x)).join('; ')})`);record('Góc giữa hai đường (°)',result.angle*180/Math.PI);}if(idx===4){record('Hình chiếu H',`(${result.foot.map(x=>fixed(x)).join('; ')})`);record('Khoảng cách d(P, Δ)',result.distance);}
 }else if(fam==='10-08'){
  result=grade10Circle(p);const stateVi=result.state==='secant'?'Cắt nhau (2 giao điểm)':result.state==='tangent'?'Tiếp xúc (1 tiếp điểm)':'Không giao nhau';
  latex=idx===1?String.raw`(x-h)^2+(y-k)^2=R^2`:idx===2?String.raw`d(I,\Delta)\;\begin{cases}<R:\;\text{2 giao điểm}\\=R:\;\text{tiếp xúc}\\>R:\;\text{không giao}\end{cases}`:String.raw`(x_T-h)(x-x_T)+(y_T-k)(y-y_T)=0`;
  record('Tâm I',`(${p.h}; ${p.k})`);record('Bán kính R',p.r);if(idx===2){record('Khoảng cách d(I, Δ)',result.distance);record('Vị trí tương đối',stateVi);record('Số giao điểm',result.intersections.length);}if(idx===3)record('Tiếp điểm T',`(${result.contact.map(x=>fixed(x)).join('; ')})`);
 }else if(fam==='10-09'){
  if(idx===1){const a=p.a,b=p.b,c=Math.sqrt(Math.abs(a*a-b*b)),major=Math.max(a,b),minor=Math.min(a,b);result={a,b,c,major,minor,vertical:b>a};latex=String.raw`\frac{x^2}{a^2}+\frac{y^2}{b^2}=1,\quad MF_1+MF_2=2a`;record('Bán trục lớn a',major);record('Tiêu cự một nửa c',c);record('Tổng MF₁ + MF₂',2*major);}
  if(idx===2){const c=Math.hypot(p.a,p.b);result={a:p.a,b:p.b,c,asymptote:p.b/p.a};latex=String.raw`\frac{x^2}{a^2}-\frac{y^2}{b^2}=1,\quad |MF_1-MF_2|=2a`;record('Tiêu cự một nửa c',c);record('Hệ số góc tiệm cận ±b/a',p.b/p.a);record('Hiệu |MF₁ − MF₂|',2*p.a);}
  if(idx===3){result={p:p.p,focus:[p.p/2,0],directrix:-p.p/2};latex=String.raw`y^2=2px,\quad F\left(\frac{p}{2};0\right),\quad \Delta:\;x=-\frac{p}{2}`;record('Tiêu điểm F',`(${fixed(p.p/2)}; 0)`);record('Đường chuẩn Δ: x =',-p.p/2);}
 }else if(fam==='10-10'&&idx===4){
  const error=Math.abs(p.exact-p.estimate),ok=error<=p.tolerance+1e-10,relError=Math.abs(p.estimate)>1e-9?error/Math.abs(p.estimate):null;
  result={exact:p.exact,estimate:p.estimate,tolerance:p.tolerance,error,relError,ok};
  latex=String.raw`\Delta_a=|a-\overline a|\le d,\quad \delta_a=\frac{\Delta_a}{|a|}\le\frac{d}{|a|}`;
  record('Giá trị đúng ā',p.exact);record('Giá trị gần đúng a',p.estimate);record('Sai số tuyệt đối Δₐ',error);record('Sai số tương đối δₐ',relError!==null?`${fixed(relError*100,2)}%`:'Không xác định (a = 0)');record('Độ chính xác d',p.tolerance);record('Đánh giá Δₐ ≤ d',ok?'Đạt':'Vượt ngưỡng');
 }else if(fam==='10-10'){
  result=grade10Statistics(p);latex=idx===1?String.raw`\overline x=\frac{1}{n}\sum_{i=1}^{n} x_i`:idx===2?String.raw`R=x_{\max}-x_{\min},\quad \Delta_Q=Q_3-Q_1`:String.raw`s^2=\frac{1}{n}\sum_{i=1}^n(x_i-\overline x)^2,\quad s=\sqrt{s^2}`;
  if(idx===1){record('Số trung bình x_TB',result.avg);record('Trung vị Mₑ',result.median);record('Tứ phân vị Q₁; Q₃',`${fixed(result.q1)}; ${fixed(result.q3)}`);record('Mốt M₀',result.modes.length?result.modes.map(x=>fixed(x)).join(', '):'Không có mốt nổi trội');}
  else if(idx===2){record('Khoảng biến thiên R',result.range);record('Khoảng tứ phân vị Δ_Q',result.iqr);record('Tứ phân vị Q₁; Q₃',`${fixed(result.q1)}; ${fixed(result.q3)}`);}
  else{record('Phương sai s²',result.variance);record('Độ lệch chuẩn s',result.stddev);record('Khoảng tứ phân vị Δ_Q',result.iqr);}
 }else if(fam==='10-11'&&idx===4){
  const coefficients=Array.from({length:p.n+1},(_,j)=>fact(p.n)/(fact(j)*fact(p.n-j)));result={n:p.n,coefficients};
  latex=String.raw`(a+b)^n=\sum_{k=0}^{n} C_n^k a^{n-k}b^k`;
  record('Bậc khai triển n',p.n);record('Các hệ số Cₙᵏ',coefficients.join(', '));record('Tổng hệ số 2ⁿ',coefficients.reduce((a,b)=>a+b,0));
 }else if(fam==='10-11'){
  const kComb=Math.min(p.k,p.n),A=fact(p.n)/fact(p.n-kComb),C=A/fact(kComb),experiment=grade10Experiment(id,p,tries);
  result={addition:p.n+p.k,multiplication:p.n*p.k,permutations:fact(p.n),arrangements:A,combinations:C,experiment,ruleMode,orderMode};
  latex=idx===1?String.raw`N_{\text{cộng}}=m+n,\quad N_{\text{nhân}}=m\cdot n`:idx===2?String.raw`P_n=n!,\quad A_n^k=\frac{n!}{(n-k)!},\quad C_n^k=\frac{n!}{k!(n-k)!}`:String.raw`P(A)=\frac{n(A)}{n(\Omega)}\quad\text{(đồng khả năng)}`;
  if(idx===1){record('Quy tắc cộng (m + n)',result.addition);record('Quy tắc nhân (m · n)',result.multiplication);}if(idx===2){record('Hoán vị Pₙ',result.permutations);record('Chỉnh hợp Aₙᵏ (có thứ tự)',A);record('Tổ hợp Cₙᵏ (không thứ tự)',C);}if(idx===3){record('Xác suất lý thuyết P(A)',experiment.probability);record('Số phép thử N',experiment.tries);record('Tần số tương đối f',experiment.relative);}
 }
 return {id,result,latex,values:lines.map(([key,val])=>`${key}: ${val}`)};
}

export const GRADE10_EXPLORE_DATA = Object.freeze({
 '10-01-C01': {
  question: 'Kéo một phần tử từ A sang miền giao: khi nào số phần tử thuộc hợp không đổi?',
  explanation: 'Khi một phần tử chuyển từ vùng chỉ thuộc A (A \\ B) vào vùng giao (A ∩ B), số phần tử chỉ thuộc A giảm 1 nhưng số phần tử giao tăng 1. Theo công thức n(A ∪ B) = n(A \\ B) + n(A ∩ B) + n(B \\ A), tổng số phần tử thuộc hợp A ∪ B giữ nguyên không đổi!',
  presets: [
   { label: 'Mặc định: n(A)=7, n(B)=8, giao=3 → hợp=12', params: { onlyA: 4, both: 3, onlyB: 5, outside: 2 } },
   { label: 'Chuyển 1 phần tử từ A vào giao → hợp vẫn = 12', params: { onlyA: 3, both: 4, onlyB: 5, outside: 2 } },
   { label: 'Hai tập rời nhau (A ∩ B = ∅)', params: { onlyA: 4, both: 0, onlyB: 5, outside: 2 } }
  ]
 },
 '10-01-C02': {
  question: 'Nếu A có 5 phần tử riêng và B có 2 phần tử riêng, hai phép hiệu có bằng nhau không?',
  explanation: 'Không bằng nhau! Phép hiệu tập hợp không có tính giao hoán: A \\ B chỉ lấy các phần tử thuộc A mà không thuộc B (n(A \\ B) = 5), còn B \\ A chỉ lấy các phần tử thuộc B mà không thuộc A (n(B \\ A) = 2). A \\ B = B \\ A khi và chỉ khi A = B.',
  presets: [
   { label: 'Kiểm chứng SGK: A={1,2,3}, B={3,4} → n(A\\B)=2, n(B\\A)=1', params: { onlyA: 2, both: 1, onlyB: 1, outside: 2 } },
   { label: 'Câu hỏi khám phá: n(A\\B)=5, n(B\\A)=2', params: { onlyA: 5, both: 3, onlyB: 2, outside: 2 } },
   { label: 'Hai tập bằng nhau: A\\B = B\\A = ∅', params: { onlyA: 0, both: 5, onlyB: 0, outside: 2 } }
  ]
 },
 '10-01-C03': {
  question: 'Giữ A không đổi nhưng mở rộng U: vì sao phần bù tăng?',
  explanation: 'Vì phần bù C_U A = U \\ A gồm mọi phần tử của tập vũ trụ U nằm ngoài A. Khi giữ nguyên A mà thêm phần tử vào vùng ngoài (mở rộng U), tất cả các phần tử mới thêm đều không thuộc A nên thuộc C_U A, làm n(C_U A) = n(U) − n(A) tăng tương ứng.',
  presets: [
   { label: 'Kiểm chứng SGK: n(U)=5, n(A)=2 → n(C_U A)=3', params: { onlyA: 1, both: 1, onlyB: 2, outside: 1 } },
   { label: 'Mở rộng U thêm 4 phần tử ngoài A → n(C_U A)=7', params: { onlyA: 1, both: 1, onlyB: 2, outside: 5 } },
   { label: 'Khi A = U → C_U A = ∅', params: { onlyA: 4, both: 3, onlyB: 0, outside: 0 } }
  ]
 },
 '10-01-C04': {
  question: 'Hai khoảng chỉ chạm tại x=2 có giao hay không khi một phía mở?',
  explanation: 'Khi A = [−2; 2] (chứa điểm 2) và B = [2; 4] (cũng chứa điểm 2), giao A ∩ B = {2}. Nhưng nếu đổi đầu trái của B thành ngoặc tròn B = (2; 4] thì điểm x = 2 không thuộc B, nên hai tập không còn điểm chung nào và A ∩ B = ∅!',
  presets: [
   { label: 'Chạm biên đóng: A=[−2; 2], B=[2; 4] → A∩B={2}', params: { l1: -2, r1: 2, l2: 2, r2: 4 }, flags: { openBLeft: false } },
   { label: 'Chạm biên mở: A=[−2; 2], B=(2; 4] → A∩B=∅', params: { l1: -2, r1: 2, l2: 2, r2: 4 }, flags: { openBLeft: true } },
   { label: 'Giao lồng nhau: A=[−3; 2], B=[−1; 4] → [−1; 2]', params: { l1: -3, r1: 2, l2: -1, r2: 4 }, flags: { openBLeft: false } }
  ]
 },
 '10-02-C01': {
  question: 'Điểm trên đường biên có phải nghiệm của bất phương trình nghiêm ngặt không?',
  explanation: 'Không! Với bất phương trình nghiêm ngặt ax + by < c (vẽ bằng đường biên nét đứt), các điểm nằm trên đường thẳng ax + by = c làm vế trái bằng c chứ không nhỏ hơn c, nên không thuộc miền nghiệm.',
  presets: [
   { label: 'Kiểm chứng x + y ≤ 2: thử O(0;0) thỏa mãn', params: { a: 1, b: 1, c: 2 }, flags: { testM: [0, 0], strictIneq: false } },
   { label: 'Thử điểm M(3;1) → 3+1=4 > 2 (Không thỏa)', params: { a: 1, b: 1, c: 2 }, flags: { testM: [3, 1], strictIneq: false } },
   { label: 'Điểm biên M(2;0) khi đổi sang x + y < 2 (Nét đứt)', params: { a: 1, b: 1, c: 2 }, flags: { testM: [2, 0], strictIneq: true } }
  ]
 },
 '10-02-C02': {
  question: 'Nếu hai nửa mặt phẳng song song quay lưng vào nhau thì miền nghiệm ra sao?',
  explanation: 'Khi hai đường biên song song và hai nửa mặt phẳng quay lưng vào nhau (ví dụ x ≤ −2 và x ≥ 2), không có điểm (x; y) nào thỏa mãn đồng thời cả hai bất phương trình. Khi đó miền nghiệm của hệ là tập rỗng ∅!',
  presets: [
   { label: 'Miền đa giác giao chuẩn', params: { a: 1, b: 1, c: 3, d: -1, e: 1, f: 1 } },
   { label: 'Hai nửa mặt phẳng song song ngược chiều → Tập rỗng ∅', params: { a: 1, b: 0, c: -2, d: -1, e: 0, f: -2 } },
   { label: 'Góc phần tư: x ≤ 3, y ≤ 3', params: { a: 1, b: 0, c: 3, d: 0, e: 1, f: 3 } }
  ]
 },
 '10-02-C03': {
  question: 'Vì sao đường mức chạm cuối cùng ở một đỉnh hoặc cả cạnh của miền nghiệm?',
  explanation: 'Hàm bậc nhất F(x, y) = ux + vy có các đường mức ux + vy = k là họ đường thẳng song song. Khi tịnh tiến đường mức theo hướng pháp tuyến (u; v) trên miền đa giác lồi, vị trí cuối cùng trước khi rời khỏi đa giác luôn là một đỉnh cực biên (hoặc toàn bộ một cạnh biên nếu đường mức song song với cạnh đó).',
  presets: [
   { label: 'Đạt cực đại duy nhất tại 1 đỉnh', params: { a: 1, b: 1, c: 3, d: -1, e: 1, f: 1, u: 2, v: 1 } },
   { label: 'Đường mức song song biên x + y = 3', params: { a: 1, b: 1, c: 3, d: 1, e: 0, f: 2, u: 1, v: 1 } },
   { label: 'Đổi hướng mục tiêu (u, v) = (-1, 2)', params: { a: 1, b: 1, c: 2, d: -1, e: 1, f: 2, u: -1, v: 2 } }
  ]
 },
 '10-03-C01': {
  question: 'Khi góc A từ nhọn sang vuông rồi sang tù, số hạng −2bc cos A làm a² thay đổi thế nào?',
  explanation: 'Theo định lí cosin a² = b² + c² − 2bc·cos A: khi A < 90° thì cos A > 0 nên a² < b² + c²; khi A = 90° thì cos A = 0 nên trở về định lí Pythagore a² = b² + c²; khi A > 90° thì cos A < 0 nên −2bc·cos A > 0 làm a² > b² + c².',
  presets: [
   { label: 'Góc vuông A = 90° (b=3, c=4 → a=5)', params: { base: 4, cx: 0, cy: 3 } },
   { label: 'Góc nhọn A = 60° (b=3, c=4 → a²=13)', params: { base: 4, cx: 1.5, cy: 2.598076 } },
   { label: 'Góc tù A = 120° (b=3, c=4 → a²=37)', params: { base: 4, cx: -1.5, cy: 2.598076 } }
  ]
 },
 '10-03-C02': {
  question: 'Kéo một đỉnh chạy trên đường tròn: vì sao cạnh đối diện và sin góc cùng biến đổi theo một tỉ số?',
  explanation: 'Theo Định lí sin: a/sin A = b/sin B = c/sin C = 2R. Khi đỉnh C di chuyển trên cung tròn ngoại tiếp cố định (bán kính R và dây cung AB = c không đổi), góc nội tiếp C chắn cung AB giữ sin C không đổi và tỉ số giữa mỗi cạnh với sin góc đối diện luôn bằng đường kính 2R.',
  presets: [
   { label: 'Tam giác vuông 3–4–5 → R = 2.5, 2R = 5', params: { base: 4, cx: 0, cy: 3 } },
   { label: 'Tam giác cân c = 5, C(2.5; 4)', params: { base: 5, cx: 2.5, cy: 4 } },
   { label: 'Tam giác góc tù → Tâm O nằm ngoài tam giác', params: { base: 4, cx: -1.2, cy: 2.4 } }
  ]
 },
 '10-03-C03': {
  question: 'Giữ hai cạnh không đổi, góc xen bằng bao nhiêu độ cho diện tích lớn nhất?',
  explanation: 'Từ công thức S = ½ bc sin A: vì hai cạnh b, c cố định và sin A ≤ 1, diện tích S đạt giá trị lớn nhất S_max = ½ bc khi và chỉ khi sin A = 1, tức là góc xen A = 90° (tam giác vuông tại A).',
  presets: [
   { label: 'Góc vuông A = 90° (b=3, c=4 → S_max = 6)', params: { base: 4, cx: 0, cy: 3 } },
   { label: 'Góc A = 30° (b=3, c=4 → S = 3)', params: { base: 4, cx: 2.6, cy: 1.5 } },
   { label: 'Góc tù (Chân đường cao H nằm ngoài đáy AB)', params: { base: 4, cx: -1.6, cy: 3 } }
  ]
 },
 '10-04-C01': {
  question: 'Đổi thứ tự ghép u và v, mũi tên tổng có thay đổi không?',
  explanation: 'Không thay đổi! Phép cộng vectơ có tính chất giao hoán: u⃗ + v⃗ = v⃗ + u⃗. Dù tịnh tiến v⃗ đến ngọn u⃗ hay tịnh tiến u⃗ đến ngọn v⃗, hai đường gấp khúc đều khép thành cùng một hình bình hành và cho cùng một đường chéo tổng.',
  presets: [
   { label: 'Kiểm chứng SGK: u=(2;1), v=(−1;3) → u+v=(1;4)', params: { ux: 2, uy: 1, vx: -1, vy: 3, k: 1.5 } },
   { label: 'Hai vectơ vuông góc u=(3;0), v=(0;2)', params: { ux: 3, uy: 0, vx: 0, vy: 2, k: 1.5 } },
   { label: 'Hai vectơ đối nhau → Tổng bằng 0⃗', params: { ux: 2.5, uy: 1.5, vx: -2.5, vy: -1.5, k: 1.5 } }
  ]
 },
 '10-04-C02': {
  question: 'Vì sao u−v và v−u ngược hướng nhau?',
  explanation: 'Vì u⃗ − v⃗ = −(v⃗ − u⃗). Trên hình học, với u⃗ = OA⃗ và v⃗ = OB⃗ chung gốc O thì u⃗ − v⃗ = BA⃗ (đi từ B tới A), còn v⃗ − u⃗ = AB⃗ (đi từ A tới B) nên chúng có cùng độ dài nhưng ngược hướng nhau 180°.',
  presets: [
   { label: 'Kiểm chứng SGK: u=(3;2), v=(1;−1) → u−v=(2;3)', params: { ux: 3, uy: 2, vx: 1, vy: -1, k: 1.5 } },
   { label: 'Hai vectơ bằng nhau u = v → u − v = 0⃗', params: { ux: 2, uy: 2, vx: 2, vy: 2, k: 1.5 } },
   { label: 'Hiệu hai vectơ vuông góc', params: { ux: 3, uy: 0, vx: 0, vy: 2, k: 1.5 } }
  ]
 },
 '10-04-C03': {
  question: 'Khi k<0, hướng và độ dài của vectơ thay đổi như thế nào?',
  explanation: 'Khi k < 0, vectơ tích k·u⃗ luôn ngược hướng với vectơ u⃗ (quay 180°) và có độ dài gấp |k| lần độ dài của u⃗: |k·u⃗| = |k|·|u⃗|. Đặc biệt khi k = 0 thì 0·u⃗ = 0⃗ (vectơ-không không có hướng xác định).',
  presets: [
   { label: 'Kiểm chứng SGK: u=(2;−1), k=−2 → (−4;2), |ku|≈4.47', params: { ux: 2, uy: -1, vx: 1, vy: 2, k: -2 } },
   { label: 'Cùng hướng k = 2 → giãn gấp đôi', params: { ux: 2, uy: 1, vx: 1, vy: 2, k: 2 } },
   { label: 'Trường hợp suy biến k = 0 → Vectơ-không 0⃗', params: { ux: 2, uy: -1, vx: 1, vy: 2, k: 0 } }
  ]
 },
 '10-04-C04': {
  question: 'Vì sao hai vectơ vuông góc có tích vô hướng bằng 0 dù cả hai khác vectơ 0?',
  explanation: 'Vì u⃗·v⃗ = |u⃗|·|v⃗|·cos(u⃗, v⃗). Khi u⃗ ⊥ v⃗ thì góc giữa chúng bằng 90° nên cos 90° = 0 (hình chiếu vuông góc của u⃗ lên phương v⃗ thu về 1 điểm có độ dài bằng 0), kéo theo u⃗·v⃗ = 0.',
  presets: [
   { label: 'Vuông góc 90°: u=(1;0), v=(0;2) → u·v = 0', params: { ux: 1, uy: 0, vx: 0, vy: 2, k: 1.5 } },
   { label: 'Ngược hướng 180°: u=(1;0), v=(−2;0) → u·v = −2', params: { ux: 1, uy: 0, vx: -2, vy: 0, k: 1.5 } },
   { label: 'Góc nhọn: u=(3;1), v=(2;2) → u·v = 8 > 0', params: { ux: 3, uy: 1, vx: 2, vy: 2, k: 1.5 } }
  ]
 },
 '10-05-C01': {
  question: 'Nếu tịnh tiến đồng thời A và B một khoảng như nhau, tọa độ AB có đổi không?',
  explanation: 'Không đổi! Khi tịnh tiến cả A và B theo cùng vectơ (dx; dy), tọa độ mới là A\'(x_A+dx; y_A+dy) và B\'(x_B+dx; y_B+dy). Khi lấy hiệu x_B\' − x_A\' và y_B\' − y_A\', lượng dịch chuyển (dx; dy) triệt tiêu hoàn toàn nên AB⃗ giữ nguyên tọa độ.',
  presets: [
   { label: 'Kiểm chứng SGK: A(−2;1), B(3;−1) → AB=(5;−2)', params: { ax: -2, ay: 1, bx: 3, by: -1, vx: 1, vy: -2 } },
   { label: 'Tịnh tiến A, B sang phải +2, lên +2 → AB vẫn =(5;−2)', params: { ax: 0, ay: 3, bx: 5, by: 1, vx: 1, vy: -2 } },
   { label: 'Điểm đầu trùng gốc O(0;0), B(3;2)', params: { ax: 0, ay: 0, bx: 3, by: 2, vx: 1, vy: -2 } }
  ]
 },
 '10-05-C02': {
  question: 'Khi đổi dấu u_x nhưng giữ nguyên trị tuyệt đối, độ dài u có đổi không?',
  explanation: 'Không đổi! Trong công thức |AB⃗| = √(u_x² + u_y²), các thành phần tọa độ đều được bình phương: (−u_x)² = u_x². Về hình học, tam giác vuông chỉ lật đối xứng nhưng hai cạnh góc vuông |Δx|, |Δy| giữ nguyên nên cạnh huyền không đổi.',
  presets: [
   { label: 'Kiểm chứng SGK: u=(−3;4) → |u| = 5', params: { ax: 1, ay: -2, bx: -2, by: 2, vx: 1, vy: -2 } },
   { label: 'Đổi dấu u_x thành u=(+3;4) → |u| vẫn = 5', params: { ax: -1, ay: -2, bx: 2, by: 2, vx: 1, vy: -2 } },
   { label: 'Vectơ nằm ngang Δy = 0 → |AB| = |Δx| = 4', params: { ax: -2, ay: 1, bx: 2, by: 1, vx: 1, vy: -2 } }
  ]
 },
 '10-05-C03': {
  question: 'Hai vectơ có tích vô hướng âm thì góc giữa chúng thuộc loại nào?',
  explanation: 'Góc tù (90° < θ ≤ 180°)! Vì cos θ = (u_x·v_x + u_y·v_y) / (|u⃗|·|v⃗|) mà tích độ dài |u⃗|·|v⃗| > 0, nên khi tổng u_x·v_x + u_y·v_y < 0 thì cos θ < 0, suy ra góc giữa hai vectơ là góc tù.',
  presets: [
   { label: 'Kiểm chứng vuông góc: u=(2;3), v=(3;−2) → u·v = 0', params: { ax: 0, ay: 0, bx: 2, by: 3, vx: 3, vy: -2 } },
   { label: 'Góc tù: u=(2;2), v=(−3;1) → u·v = −4 < 0', params: { ax: 0, ay: 0, bx: 2, by: 2, vx: -3, vy: 1 } },
   { label: 'Góc nhọn: u=(3;1), v=(2;2) → u·v = 8 > 0', params: { ax: -1, ay: 0, bx: 2, by: 1, vx: 2, vy: 2 } }
  ]
 },
 '10-06-C01': {
  question: 'Khi giữ b=c=0, tăng a>0 có làm thay đổi tọa độ đỉnh không?',
  explanation: 'Không! Khi b = 0 và c = 0, hoành độ đỉnh x_I = −b/(2a) = 0 và tung độ đỉnh y_I = 0 với mọi a > 0. Tăng hệ số a > 0 chỉ làm hai nhánh parabol khép hẹp lại (dốc hơn), còn đỉnh I(0; 0) đứng yên tại gốc tọa độ.',
  presets: [
   { label: 'Kiểm chứng SGK: a=1, b=−2, c=1 → Đỉnh I(1;0)', params: { a: 1, b: -2, c: 1 } },
   { label: 'Câu hỏi khám phá: b=0, c=0, a=0.5 → Đỉnh I(0;0)', params: { a: 0.5, b: 0, c: 0 } },
   { label: 'Câu hỏi khám phá: b=0, c=0, a=2.5 → Đỉnh vẫn I(0;0)', params: { a: 2.5, b: 0, c: 0 } }
  ]
 },
 '10-06-C02': {
  question: 'Điều gì xảy ra với giá trị lớn nhất của hàm khi tăng c?',
  explanation: 'Với a < 0, parabol mở xuống nên hàm số đạt giá trị lớn nhất tại đỉnh: y_max = y_I = −b²/(4a) + c. Khi giữ nguyên a, b và tăng c thêm một lượng Δc, toàn bộ đồ thị tịnh tiến thẳng đứng lên trên và giá trị lớn nhất y_max cũng tăng đúng bằng Δc.',
  presets: [
   { label: 'Kiểm chứng SGK: a=−1, b=2, c=0 → Đỉnh I(1;1)', params: { a: -1, b: 2, c: 0 } },
   { label: 'Tăng c lên c=2 → Giá trị lớn nhất tăng lên y_I = 3', params: { a: -1, b: 2, c: 2 } },
   { label: 'Mở rộng độ mở: a=−0.5, b=1, c=1.5', params: { a: -0.5, b: 1, c: 1.5 } }
  ]
 },
 '10-06-C03': {
  question: 'Khi parabol chỉ chạm Ox thì có mấy nghiệm phân biệt?',
  explanation: 'Chỉ có 1 hoành độ giao điểm duy nhất (nghiệm kép x₁ = x₂ = −b/(2a))! Khi đó biệt thức Δ = b² − 4ac = 0 và đỉnh I của parabol nằm ngay trên trục hoành Ox (tiếp xúc với Ox).',
  presets: [
   { label: 'Kiểm chứng Δ = 0 (Tiếp xúc Ox): a=1, b=−2, c=1 → x=1', params: { a: 1, b: -2, c: 1 } },
   { label: 'Δ > 0 (2 giao điểm): a=1, b=−2, c=−3 → x=−1; 3', params: { a: 1, b: -2, c: -3 } },
   { label: 'Δ < 0 (Không cắt Ox): a=1, b=−2, c=2 → Δ=−4', params: { a: 1, b: -2, c: 2 } }
  ]
 },
 '10-07-C01': {
  question: 'Khi nhân mọi hệ số a, b, c với cùng một số khác 0, đường thẳng có đổi không?',
  explanation: 'Đường thẳng hoàn toàn không đổi! Phương trình k·ax + k·by + k·c = 0 (với k ≠ 0) tương đương với ax + by + c = 0; vectơ pháp tuyến mới k·n⃗ = (ka; kb) cùng phương với n⃗ = (a; b) nên xác định cùng một đường thẳng.',
  presets: [
   { label: 'Kiểm chứng SGK: 2x − y + 1 = 0 → M(0;1) ∈ d, n=(2;−1)', params: { a: 2, b: -1, c: 1, d: 2, e: 1, f: -2, px: -2, py: 3 } },
   { label: 'Nhân đôi hệ số: 4x − 2y + 2 = 0 → Cùng đường thẳng d', params: { a: 4, b: -2, c: 2, d: 2, e: 1, f: -2, px: -2, py: 3 } },
   { label: 'Đường phân giác góc phần tư I: x − y = 0', params: { a: 1, b: -1, c: 0, d: 2, e: 1, f: -2, px: -2, py: 3 } }
  ]
 },
 '10-07-C02': {
  question: 'Đổi tham số t trên R thì điểm P(t) chạy trên cả đường thẳng hay chỉ trên một tia?',
  explanation: 'Chạy trên toàn bộ đường thẳng! Khi t = 0 thì P(0) = M₀; khi t > 0 điểm P(t) = M₀ + t·u⃗ quét nửa đường thẳng theo hướng u⃗; khi t < 0 điểm P(t) quét nửa đường thẳng ngược hướng u⃗. Vậy t ∈ ℝ sinh ra toàn bộ đường thẳng d.',
  presets: [
   { label: 'Kiểm chứng SGK: u=(2;−1) ↔ VTPT n=(1;2), c=−5', params: { a: 1, b: 2, c: -5, d: 2, e: 1, f: -2, px: -2, py: 3 } },
   { label: 'Đường thẳng có VTCP u=(1;1)', params: { a: 1, b: -1, c: -1, d: 2, e: 1, f: -2, px: -2, py: 3 } },
   { label: 'Đường thẳng nằm ngang VTCP u=(2;0)', params: { a: 0, b: 2, c: -4, d: 2, e: 1, f: -2, px: -2, py: 3 } }
  ]
 },
 '10-07-C03': {
  question: 'Hai đường có pháp tuyến cùng phương luôn trùng nhau hay có thể song song khác nhau?',
  explanation: 'Có thể song song phân biệt hoặc trùng nhau! Khi hai vectơ pháp tuyến cùng phương (a₁b₂ − a₂b₁ = 0), nếu tỉ số hằng số c₁/c₂ khác tỉ số pháp tuyến thì hai đường song song phân biệt (vô nghiệm); nếu tỉ lệ bằng nhau cả với c thì hai đường trùng nhau.',
  presets: [
   { label: 'Kiểm chứng vuông góc: x=0 và y=0 cắt tại O(0;0), φ=90°', params: { a: 1, b: 0, c: 0, d: 0, e: 1, f: 0, px: -2, py: 3 } },
   { label: 'Hai đường song song phân biệt: x−y−1=0 và 2x−2y+2=0', params: { a: 1, b: -1, c: -1, d: 2, e: -2, f: 2, px: -2, py: 3 } },
   { label: 'Hai đường trùng nhau: x−y−1=0 và 2x−2y−2=0', params: { a: 1, b: -1, c: -1, d: 2, e: -2, f: -2, px: -2, py: 3 } }
  ]
 },
 '10-07-C04': {
  question: 'Vì sao khoảng cách không đo theo đoạn nối P với điểm bất kỳ trên d?',
  explanation: 'Trong tam giác vuông PHM (với H là hình chiếu vuông góc của P trên d và M là điểm bất kỳ trên d), đoạn vuông góc PH là cạnh góc vuông còn PM là cạnh huyền nên luôn có PH ≤ PM. Khoảng cách từ P đến d được định nghĩa là độ dài ngắn nhất, tức là đoạn vuông góc PH.',
  presets: [
   { label: 'Kiểm chứng SGK: 3x + 4y = 0, P(0;5) → d(P,Δ) = 4', params: { a: 3, b: 4, c: 0, d: 2, e: 1, f: -2, px: 0, py: 5 } },
   { label: 'Điểm P(1;0) thuộc đường x − y − 1 = 0 → d = 0', params: { a: 1, b: -1, c: -1, d: 2, e: 1, f: -2, px: 1, py: 0 } },
   { label: 'Mặc định: d: x − y − 1 = 0, P(−2;3)', params: { a: 1, b: -1, c: -1, d: 2, e: 1, f: -2, px: -2, py: 3 } }
  ]
 },
 '10-08-C01': {
  question: 'Đổi tâm I nhưng giữ R: phương trình chính tắc thay đổi những số hạng nào?',
  explanation: 'Trong phương trình (x − h)² + (y − k)² = R², khi dời tâm I(h; k) mà giữ nguyên bán kính R, chỉ có hai số hạng tọa độ tâm h và k ở vế trái thay đổi, còn vế phải R² giữ nguyên không đổi!',
  presets: [
   { label: 'Kiểm chứng SGK: I(1;−2), R=3 → P(4;−2) ∈ (C)', params: { h: 1, k: -2, r: 3, m: 1, q: 1, angle: 0 } },
   { label: 'Đường tròn tâm O(0;0), bán kính R = 3', params: { h: 0, k: 0, r: 3, m: 1, q: 1, angle: 40 } },
   { label: 'Dời tâm sang I(−2; 1.5), giữ R = 3', params: { h: -2, k: 1.5, r: 3, m: 1, q: 1, angle: 40 } }
  ]
 },
 '10-08-C02': {
  question: 'Nếu tâm cách đường thẳng đúng một bán kính thì tại sao chỉ có một giao điểm?',
  explanation: 'Gọi H là hình chiếu vuông góc của tâm I lên đường thẳng d. Khi d(I, d) = IH = R, điểm H cách I một khoảng bằng R nên H nằm trên đường tròn. Mọi điểm M ≠ H trên d đều có IM = √(IH² + HM²) > R nên nằm ngoài đường tròn. Vậy d chỉ tiếp xúc (C) tại duy nhất điểm H.',
  presets: [
   { label: 'Kiểm chứng tiếp xúc: I(0;0), R=2, y=2 → Tiếp xúc tại (0;2)', params: { h: 0, k: 0, r: 2, m: 0, q: 2, angle: 40 } },
   { label: 'Cắt nhau 2 điểm (d < R): I(0;0), R=3, y=x+1', params: { h: 0, k: 0, r: 3, m: 1, q: 1, angle: 40 } },
   { label: 'Không giao nhau (d > R): I(0;0), R=2, y=3.5', params: { h: 0, k: 0, r: 2, m: 0, q: 3.5, angle: 40 } }
  ]
 },
 '10-08-C03': {
  question: 'Nếu đường thẳng đi qua T nhưng không vuông góc IT thì có phải tiếp tuyến không?',
  explanation: 'Không phải tiếp tuyến! Nếu đường thẳng d đi qua T ∈ (C) nhưng không vuông góc với bán kính IT, thì hình chiếu vuông góc H của tâm I lên d khác T và có IH < IT = R. Do đó đường thẳng sẽ đi vào bên trong đường tròn và cắt đường tròn tại điểm thứ hai!',
  presets: [
   { label: 'Kiểm chứng SGK: I(0;0), R=3, T(3;0) → Tiếp tuyến x = 3', params: { h: 0, k: 0, r: 3, m: 1, q: 1, angle: 0 } },
   { label: 'Tiếp điểm tại góc 90°: T(0;3) → Tiếp tuyến y = 3', params: { h: 0, k: 0, r: 3, m: 1, q: 1, angle: 90 } },
   { label: 'Tiếp điểm góc 45° với tâm I(1;−1), R=2.5', params: { h: 1, k: -1, r: 2.5, m: 1, q: 1, angle: 45 } }
  ]
 },
 '10-09-C01': {
  question: 'Tại sao khi hai tiêu điểm nhập lại (c=0) thì elip trở thành đường tròn?',
  explanation: 'Khi c = √(a² − b²) = 0 (tức a = b = R), hai tiêu điểm F₁(−c; 0) và F₂(c; 0) trùng nhau tại tâm O(0; 0). Điều kiện MF₁ + MF₂ = 2a trở thành MO + MO = 2R ⇔ OM = R, tức là tập hợp các điểm M cách đều tâm O một khoảng R (đường tròn).',
  presets: [
   { label: 'Kiểm chứng SGK: a=5, b=4 → c=3, MF₁+MF₂=10', params: { a: 5, b: 4, p: 2 } },
   { label: 'Elip dẹt: a=5, b=2 → Tiêu cự lớn c≈4.58', params: { a: 5, b: 2, p: 2 } },
   { label: 'Khi a = b = 3.5 → c = 0 (Trở thành đường tròn)', params: { a: 3.5, b: 3.5, p: 2 } }
  ]
 },
 '10-09-C02': {
  question: 'Vì sao phải lấy giá trị tuyệt đối |MF₁ − MF₂| = 2a khi chuyển M sang nhánh còn lại?',
  explanation: 'Khi điểm M nằm trên nhánh phải (x > 0), M gần F₂ hơn F₁ nên MF₁ > MF₂ và MF₁ − MF₂ = +2a. Khi chuyển M sang nhánh trái (x < 0), M gần F₁ hơn F₂ nên MF₁ < MF₂ và MF₁ − MF₂ = −2a. Do đó phải lấy giá trị tuyệt đối |MF₁ − MF₂| = 2a cho cả hai nhánh!',
  presets: [
   { label: 'Kiểm chứng SGK: a=3, b=4 → c=5, |MF₁−MF₂|=6', params: { a: 3, b: 4, p: 2 }, flags: { branch: 1 } },
   { label: 'Chuyển M sang nhánh trái: MF₁ − MF₂ = −6, |MF₁−MF₂|=6', params: { a: 3, b: 4, p: 2 }, flags: { branch: -1 } },
   { label: 'Hypebol vuông a = b = 3 → Tiệm cận y = ±x', params: { a: 3, b: 3, p: 2 }, flags: { branch: 1 } }
  ]
 },
 '10-09-C03': {
  question: 'Vì sao quỹ tích không phải đường tròn dù khoảng cách đến một điểm và một đường bằng nhau?',
  explanation: 'Đường tròn là quỹ tích các điểm cách một điểm cố định một hằng số R không đổi. Còn trên Parabol, khoảng cách MF = d(M, Δ) = x + p/2 tăng dần khi M ra xa đỉnh O; để giữ MF bằng khoảng cách tới đường chuẩn Δ, điểm M phải mở rộng ra xa tạo thành nhánh cong chữ U vô hạn.',
  presets: [
   { label: 'Kiểm chứng SGK: p=2 → F(1;0), Δ: x=−1 (Tại M(1;2) có MF=MH=2)', params: { a: 4, b: 2.5, p: 2 }, flags: { mY: 2 } },
   { label: 'Tăng tham số tiêu p = 4 → F(2;0), Δ: x = −2', params: { a: 4, b: 2.5, p: 4 }, flags: { mY: 3 } },
   { label: 'Thu nhỏ p = 1 → F(0.5;0), Δ: x = −0.5', params: { a: 4, b: 2.5, p: 1 }, flags: { mY: 1.5 } }
  ]
 },
 '10-10-C01': {
  question: 'Kéo một giá trị lớn lên cao (ngoại lệ): số trung bình hay trung vị nhạy hơn với ngoại lệ?',
  explanation: 'Số trung bình x̄ nhạy hơn rất nhiều! Vì x̄ cộng trực tiếp giá trị của mọi phần tử chia cho n, nên khi phần tử cuối tăng vọt (ngoại lệ), x̄ bị kéo lệch về phía ngoại lệ. Trong khi đó trung vị M_e chỉ phụ thuộc vào thứ tự đứng giữa nên giữ nguyên không đổi!',
  presets: [
   { label: 'Mẫu chuẩn chưa có ngoại lệ (outlier = 0) → x̄=6.8, M_e=5.5', params: { shift: 0, stretch: 1, outlier: 0, exact: 3.25, estimate: 3.4, tolerance: 0.3 } },
   { label: 'Kéo ngoại lệ cuối +10 → x̄ tăng lên 7.8, còn M_e vẫn = 5.5!', params: { shift: 0, stretch: 1, outlier: 10, exact: 3.25, estimate: 3.4, tolerance: 0.3 } },
   { label: 'Dịch toàn bộ mẫu +2 → Cả x̄, M_e, M₀ cùng tăng +2', params: { shift: 2, stretch: 1, outlier: 0, exact: 3.25, estimate: 3.4, tolerance: 0.3 } }
  ]
 },
 '10-10-C02': {
  question: 'Vì sao cùng một bộ dữ liệu có ngoại lệ thì R thay đổi mạnh nhưng Δ_Q = Q₃ − Q₁ ít thay đổi?',
  explanation: 'Khoảng biến thiên R = x_max − x_min chỉ tính từ 2 giá trị ở hai đầu mút nên bị kéo giãn ngay lập tức khi có ngoại lệ ở đầu mút. Ngược lại, khoảng tứ phân vị Δ_Q = Q₃ − Q₁ đo độ phân tán của 50% số liệu ở chính giữa mẫu, bỏ qua 25% đầu và 25% cuối nên rất bền vững trước giá trị ngoại lệ.',
  presets: [
   { label: 'Mẫu chuẩn (outlier = 0) → R = 12, Δ_Q = 5', params: { shift: 0, stretch: 1, outlier: 0, exact: 3.25, estimate: 3.4, tolerance: 0.3 } },
   { label: 'Tăng ngoại lệ +10 → R vọt lên 22, nhưng Δ_Q vẫn = 5!', params: { shift: 0, stretch: 1, outlier: 10, exact: 3.25, estimate: 3.4, tolerance: 0.3 } },
   { label: 'Co giãn tỉ lệ ×1.5 → Cả R và Δ_Q nhân 1.5', params: { shift: 0, stretch: 1.5, outlier: 0, exact: 3.25, estimate: 3.4, tolerance: 0.3 } }
  ]
 },
 '10-10-C03': {
  question: 'Vì sao phương sai s² không thể âm dù trong mẫu có các độ lệch (x_i − x̄) âm?',
  explanation: 'Vì mỗi độ lệch (x_i − x̄) đều được bình phương thành diện tích hình vuông (x_i − x̄)² ≥ 0 trước khi cộng lại chia cho n. Tổng của các số không âm luôn lớn hơn hoặc bằng 0, và s² = 0 khi và chỉ khi mọi số liệu trong mẫu bằng nhau.',
  presets: [
   { label: 'Mẫu chuẩn → s² = 13.56, s ≈ 3.68', params: { shift: 0, stretch: 1, outlier: 0, exact: 3.25, estimate: 3.4, tolerance: 0.3 } },
   { label: 'Dịch số liệu +3 → Độ lệch x_i − x̄ không đổi, s² giữ nguyên!', params: { shift: 3, stretch: 1, outlier: 0, exact: 3.25, estimate: 3.4, tolerance: 0.3 } },
   { label: 'Thêm ngoại lệ +8 → Hình vuông độ lệch cuối phóng to, s² tăng mạnh', params: { shift: 0, stretch: 1, outlier: 8, exact: 3.25, estimate: 3.4, tolerance: 0.3 } }
  ]
 },
 '10-10-C04': {
  question: 'Nếu giá trị gần đúng gần bằng 0, sai số tương đối có thể rất lớn dù sai số tuyệt đối nhỏ không?',
  explanation: 'Đúng vậy! Sai số tương đối được tính bởi δ_a = Δ_a / |a|. Khi giá trị gần đúng |a| rất nhỏ (gần 0), mẫu số |a| tiến sát 0 làm tỉ số Δ_a / |a| tăng vọt rất lớn dù sai số tuyệt đối Δ_a = |a − ā| nhỏ.',
  presets: [
   { label: 'Kiểm chứng SGK: ā=3.25, a=3.4, d=0.2 → Δ_a=0.15 ≤ 0.2 (Đạt)', params: { shift: 0, stretch: 1, outlier: 0, exact: 3.25, estimate: 3.4, tolerance: 0.2 } },
   { label: 'Vượt ngưỡng dung sai: ā=3.25, a=3.6, d=0.2 → Δ_a=0.35 > 0.2', params: { shift: 0, stretch: 1, outlier: 0, exact: 3.25, estimate: 3.6, tolerance: 0.2 } },
   { label: 'Khi a gần 0 (a=0.1, ā=0.2) → Δ_a=0.1 nhỏ nhưng δ_a = 100%!', params: { shift: 0, stretch: 1, outlier: 0, exact: 0.2, estimate: 0.1, tolerance: 0.2 } }
  ]
 },
 '10-11-C01': {
  question: 'Vì sao có 3 áo và 2 quần thì có 6 cách phối bộ, không phải 5?',
  explanation: 'Vì việc phối một bộ trang phục gồm 2 công đoạn liên tiếp phụ thuộc nhau: chọn áo (3 cách), ứng với mỗi chiếc áo lại có 2 cách chọn quần đi kèm (tạo ra 3 nhánh × 2 nhánh = 6 bộ). Còn 3 + 2 = 5 là số cách chọn chỉ 1 món đồ duy nhất (hoặc áo, hoặc quần).',
  presets: [
   { label: 'Kiểm chứng SGK: m=3 áo, k=2 quần → Nhân: 3×2=6 bộ | Cộng: 3+2=5', params: { n: 3, k: 2, wanted: 2 } },
   { label: 'Tăng lên m=4 bước đầu, k=3 bước sau → 4×3=12 cách', params: { n: 4, k: 3, wanted: 2 } },
   { label: 'Quy trình 5 × 4 = 20 nhánh ghép', params: { n: 5, k: 4, wanted: 2 } }
  ]
 },
 '10-11-C02': {
  question: 'Chọn 2 bạn từ 4 bạn đi trực nhật khác với phân công 1 lớp trưởng, 1 lớp phó từ 4 bạn ở chỗ nào?',
  explanation: 'Phân công 1 lớp trưởng và 1 lớp phó có phân biệt thứ tự/vai trò (AB khác BA) nên là chỉnh hợp A₄² = 12 cách. Còn chọn 2 bạn cùng đi trực nhật không phân biệt thứ tự (nhóm {A, B} trùng nhóm {B, A}), mỗi cặp bị đếm lặp 2! = 2 lần nên là tổ hợp C₄² = A₄² / 2! = 6 cách.',
  presets: [
   { label: 'Kiểm chứng SGK: n=4, k=2 → A₄² = 12, C₄² = 6', params: { n: 4, k: 2, wanted: 2 } },
   { label: 'Chọn 3 từ 5 phần tử: A₅³ = 60, C₅³ = 10 (gộp 3! = 6 hoán vị)', params: { n: 5, k: 3, wanted: 2 } },
   { label: 'Khi k = n = 4 → Hoán vị P₄ = A₄⁴ = 24, C₄⁴ = 1', params: { n: 4, k: 4, wanted: 2 } }
  ]
 },
 '10-11-C03': {
  question: 'Nếu các quả bóng trong hộp không cùng kích cỡ và khối lượng (không đồng khả năng) thì có dùng được công thức P(A) = n(A)/n(Ω) không?',
  explanation: 'Không được! Công thức xác suất cổ điển P(A) = n(A)/n(Ω) chỉ đúng khi mọi kết quả trong không gian mẫu Ω đều đồng khả năng (mọi quả bóng có cơ hội rút như nhau). Nếu bóng bị lệch kích cỡ hoặc nặng nhẹ khác nhau, ta phải dùng định luật số lớn ước lượng xác suất qua tần số tương đối f(N) = k/N khi số lần rút N rất lớn.',
  presets: [
   { label: 'Hộp chuẩn SGK: 6 bóng (2 xanh, 4 trắng) → P(A) = 2/6 ≈ 0.33', params: { n: 6, k: 3, wanted: 2 } },
   { label: 'Hộp 6 bóng: 3 bóng xanh (nửa hộp) → P(A) = 3/6 = 0.50', params: { n: 6, k: 3, wanted: 3 } },
   { label: 'Hộp 5 bóng: 1 bóng xanh đặc biệt → P(A) = 1/5 = 0.20', params: { n: 5, k: 2, wanted: 1 } },
   { label: 'Hộp 8 bóng: 6 bóng xanh thuận lợi → P(A) = 6/8 = 0.75', params: { n: 8, k: 3, wanted: 6 } }
  ]
 },
 '10-11-C04': {
  question: 'Hệ số của a²b² trong (a+b)⁴ được lấy ở vị trí nào trong tam giác Pascal?',
  explanation: 'Trong khai triển (a + b)⁴ = C₄⁰a⁴ + C₄¹a³b + C₄²a²b² + C₄³ab³ + C₄⁴b⁴, số hạng chứa a²b² ứng với k = 2 nên nằm ở vị trí chính giữa (ô thứ 3, chỉ số k = 2) của hàng n = 4 trong tam giác Pascal: C₄² = 3 + 3 = 6.',
  presets: [
   { label: 'Kiểm chứng SGK: Bậc n = 4 → Hệ số 1, 4, 6, 4, 1 (Tổng = 16)', params: { n: 4, k: 2, wanted: 2 } },
   { label: 'Bậc n = 5 → Hệ số 1, 5, 10, 10, 5, 1 (Tổng = 32)', params: { n: 5, k: 2, wanted: 2 } },
   { label: 'Bậc n = 3 → Hệ số 1, 3, 3, 1 (Tổng = 8)', params: { n: 3, k: 2, wanted: 2 } }
  ]
 }
});
