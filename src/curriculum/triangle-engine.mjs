/** MATHVERSE R5 - exact, testable Euclidean triangle construction engine.
 * AB = p, AC = q; theta = angle BAC.  Right triangles have right angle at A.
 * Pure functions: safe in browser and node tests; no external packages.
 */
export const TRIANGLE_CASES=Object.freeze({
 '7-04-C01':{title:'Bằng nhau cạnh – cạnh – cạnh (c.c.c)',kind:'sss',similar:false,statement:'AB=A′B′, AC=A′C′, BC=B′C′',latex:'AB=A\\prime B\\prime,\\ AC=A\\prime C\\prime,\\ BC=B\\prime C\\prime\\Rightarrow\\triangle ABC\\cong\\triangle A\\prime B\\prime C\\prime'},
 '7-04-C02':{title:'Bằng nhau cạnh – góc – cạnh (c.g.c)',kind:'sas',similar:false,statement:'Hai cạnh và góc xen giữa tương ứng bằng nhau',latex:'AB=A\\prime B\\prime,\\ AC=A\\prime C\\prime,\\ \\angle A=\\angle A\\prime\\Rightarrow\\triangle ABC\\cong\\triangle A\\prime B\\prime C\\prime'},
 '7-04-C03':{title:'Bằng nhau góc – cạnh – góc (g.c.g)',kind:'asa',similar:false,statement:'Một cạnh và hai góc kề cạnh đó bằng nhau',latex:'AB=A\\prime B\\prime,\\ \\angle A=\\angle A\\prime,\\ \\angle B=\\angle B\\prime\\Rightarrow\\triangle ABC\\cong\\triangle A\\prime B\\prime C\\prime'},
 '7-04-C04':{title:'Tam giác vuông: hai cạnh góc vuông',kind:'right-legs',similar:false,statement:'Hai cạnh góc vuông tương ứng bằng nhau',latex:'\\angle A=\\angle A\\prime=90^\\circ,\\ AB=A\\prime B\\prime,\\ AC=A\\prime C\\prime'},
 '7-04-C05':{title:'Tam giác vuông: cạnh góc vuông – góc nhọn kề',kind:'right-adj-angle',similar:false,statement:'Một cạnh góc vuông và góc nhọn kề cạnh đó bằng nhau',latex:'\\angle A=\\angle A\\prime=90^\\circ,\\ AB=A\\prime B\\prime,\\ \\angle B=\\angle B\\prime'},
 '7-04-C06':{title:'Tam giác vuông: cạnh huyền – góc nhọn',kind:'right-hyp-angle',similar:false,statement:'Cạnh huyền và một góc nhọn tương ứng bằng nhau',latex:'\\angle A=\\angle A\\prime=90^\\circ,\\ BC=B\\prime C\\prime,\\ \\angle B=\\angle B\\prime'},
 '7-04-C07':{title:'Tam giác vuông: cạnh huyền – cạnh góc vuông',kind:'right-hyp-leg',similar:false,statement:'Cạnh huyền và một cạnh góc vuông tương ứng bằng nhau',latex:'\\angle A=\\angle A\\prime=90^\\circ,\\ BC=B\\prime C\\prime,\\ AB=A\\prime B\\prime'},
 '8-06-C01':{title:'Đồng dạng cạnh – cạnh – cạnh (c.c.c)',kind:'sss',similar:true,statement:'Ba cặp cạnh tương ứng tỉ lệ',latex:'\\frac{A\\prime B\\prime}{AB}=\\frac{A\\prime C\\prime}{AC}=\\frac{B\\prime C\\prime}{BC}=k'},
 '8-06-C02':{title:'Đồng dạng cạnh – góc – cạnh (c.g.c)',kind:'sas',similar:true,statement:'Hai cặp cạnh tương ứng tỉ lệ, góc xen giữa bằng nhau',latex:'\\frac{A\\prime B\\prime}{AB}=\\frac{A\\prime C\\prime}{AC}=k,\\ \\angle A=\\angle A\\prime'},
 '8-06-C03':{title:'Đồng dạng góc – góc (g.g)',kind:'asa',similar:true,statement:'Hai góc tương ứng bằng nhau',latex:'\\angle A=\\angle A\\prime,\\ \\angle B=\\angle B\\prime\\Rightarrow\\triangle ABC\\sim\\triangle A\\prime B\\prime C\\prime'},
 '8-06-C04':{title:'Tam giác vuông: một góc nhọn tương ứng bằng nhau',kind:'right-adj-angle',similar:true,statement:'Hai góc vuông và một cặp góc nhọn tương ứng bằng nhau',latex:'\\angle A=\\angle A\\prime=90^\\circ,\\ \\angle B=\\angle B\\prime'},
 '8-06-C05':{title:'Tam giác vuông: hai cạnh góc vuông tỉ lệ',kind:'right-legs',similar:true,statement:'Hai cặp cạnh góc vuông tương ứng tỉ lệ',latex:'\\frac{A\\prime B\\prime}{AB}=\\frac{A\\prime C\\prime}{AC}=k'},
 '8-06-C06':{title:'Tam giác vuông: cạnh huyền và một cạnh góc vuông tỉ lệ',kind:'right-hyp-leg',similar:true,statement:'Cạnh huyền và một cạnh góc vuông tương ứng tỉ lệ',latex:'\\frac{B\\prime C\\prime}{BC}=\\frac{A\\prime B\\prime}{AB}=k'}
});
export const TRIANGLE_CASE_IDS=Object.freeze(Object.keys(TRIANGLE_CASES));
export const isTriangleCase=id=>Object.hasOwn(TRIANGLE_CASES,id);
const radians=d=>d*Math.PI/180;
const degrees=r=>r*180/Math.PI;
export const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const angle=(u,v,w)=>{
 const ux=u[0]-v[0],uy=u[1]-v[1],wx=w[0]-v[0],wy=w[1]-v[1];
 return degrees(Math.acos(clamp((ux*wx+uy*wy)/(Math.hypot(ux,uy)*Math.hypot(wx,wy)),-1,1)));
};
const checkFinite=(...values)=>values.every(x=>Number.isFinite(x)&&x>0);
export function initialTriangleParams(id){
 const c=TRIANGLE_CASES[id];if(!c)throw Error('Không có trường hợp hình học này');
 const p={p:5,q:4,r:4.5,theta:60,alpha:53,beta:47,h:7,k:1.35};
 if(c.kind==='right-hyp-leg')p.p=5,p.h=7;
 if(c.kind==='right-hyp-angle')p.h=7,p.beta=40;
 if(c.kind==='right-adj-angle')p.p=5,p.beta=42;
 if(c.kind==='asa')p.alpha=55,p.beta=60;
 return p;
}
export function triangleParamSchema(id){
 const c=TRIANGLE_CASES[id];if(!c)throw Error('Không có trường hợp hình học này');
 const defs={p:['Độ dài AB',2,8,.1],q:['Độ dài AC',2,8,.1],r:['Độ dài BC',2,9,.1],theta:['Góc xen giữa A (°)',20,145,1],alpha:['Góc A (°)',20,75,1],beta:['Góc B (°)',18,75,1],h:['Cạnh huyền BC',5,10,.1],k:['Tỉ số đồng dạng k',.5,2.2,.05]};
 const names={sss:['p','q','r'],sas:['p','q','theta'],asa:['p','alpha','beta'],'right-legs':['p','q'],'right-adj-angle':['p','beta'],'right-hyp-angle':['h','beta'],'right-hyp-leg':['h','p']}[c.kind];
 return [...names,...(c.similar?['k']:[])].map(key=>({key,label:defs[key][0],min:defs[key][1],max:defs[key][2],step:defs[key][3]}));
}
export function makeTriangle(id,params=initialTriangleParams(id)){
 const c=TRIANGLE_CASES[id];if(!c)throw Error('Trường hợp chưa hỗ trợ');
 const {p,q,r,theta,alpha,beta,h}=params;
 let ab=p,ac=q,t=theta;
 if(c.kind==='sss'){
  if(!checkFinite(p,q,r)||p+q<=r+1e-7||p+r<=q+1e-7||q+r<=p+1e-7)throw Error('Ba cạnh không thỏa bất đẳng thức tam giác.');
  t=degrees(Math.acos(clamp((p*p+q*q-r*r)/(2*p*q),-1,1)));
 }else if(c.kind==='sas'){
  if(!checkFinite(p,q)||theta<=0||theta>=180)throw Error('Góc xen giữa phải thuộc (0°;180°).');
 }else if(c.kind==='asa'){
  if(!checkFinite(p,alpha,beta)||alpha+beta>=180)throw Error('Hai góc đã nhập phải có tổng nhỏ hơn 180°.');
  t=alpha;ac=p*Math.sin(radians(beta))/Math.sin(radians(180-alpha-beta));
 }else if(c.kind==='right-legs'){
  if(!checkFinite(p,q))throw Error('Cạnh góc vuông phải dương.');
  t=90;
 }else if(c.kind==='right-adj-angle'){
  if(!checkFinite(p,beta)||beta>=90)throw Error('Góc nhọn phải nhỏ hơn 90°.');
  ac=p*Math.tan(radians(beta));t=90;
 }else if(c.kind==='right-hyp-angle'){
  if(!checkFinite(h,beta)||beta>=90)throw Error('Cạnh huyền phải dương; góc nhọn nhỏ hơn 90°.');
  ab=h*Math.cos(radians(beta));ac=h*Math.sin(radians(beta));t=90;
 }else if(c.kind==='right-hyp-leg'){
  if(!checkFinite(h,p)||p>=h)throw Error('Cạnh góc vuông phải nhỏ hơn cạnh huyền.');
  ab=p;ac=Math.sqrt(h*h-p*p);t=90;
 }
 const A=[0,0],B=[ab,0],C=[ac*Math.cos(radians(t)),ac*Math.sin(radians(t))];
 const out={A,B,C};
 if(!Number.isFinite(C[0])||!Number.isFinite(C[1])||C[1]<1e-6)throw Error('Tam giác bị suy biến, cần thay tham số.');
 return out;
}
export function triangleMeasures(T){
 const {A,B,C}=T;
 const AB=dist(A,B),AC=dist(A,C),BC=dist(B,C);
 const angles={A:angle(B,A,C),B:angle(A,B,C),C:angle(A,C,B)};
 return {AB,AC,BC,...angles,area:Math.abs((B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0]))/2};
}
export function makeTrianglePair(id,params=initialTriangleParams(id),{perturb=false}={}){
 const spec=TRIANGLE_CASES[id];const first=makeTriangle(id,params);
 const k=spec.similar?Number(params.k):1;
 if(!Number.isFinite(k)||k<=0)throw Error('Tỉ số đồng dạng phải dương.');
 const second=Object.fromEntries(Object.entries(first).map(([name,point])=>[name,point.map(v=>v*k)]));
 if(perturb)second.C=[second.C[0]+.42*k,second.C[1]+.55*k];
 return {first,second,k,check:checkTrianglePair(id,first,second)};
}
function close(a,b,tol=1e-7){return Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b));}
export function checkTrianglePair(id,first,second){
 const c=TRIANGLE_CASES[id];if(!c)throw Error('Không có trường hợp hình học này');
 const x=triangleMeasures(first),y=triangleMeasures(second);
 const valid=Object.values(x).every(Number.isFinite)&&Object.values(y).every(Number.isFinite)&&x.area>1e-7&&y.area>1e-7;
 if(!valid)return {passes:false,ratio:NaN,reason:'Tam giác suy biến'};
 const base=x.AB,scale=y.AB/base;
 const eq=(a,b)=>close(a,b),proportion=(a,b)=>close(b/a,scale),acute=()=>eq(x.B,y.B),right=()=>eq(x.A,90)&&eq(y.A,90);
 let passes=false;
 if(c.similar){
  passes=({sss:()=>proportion(x.AC,y.AC)&&proportion(x.BC,y.BC),sas:()=>proportion(x.AC,y.AC)&&eq(x.A,y.A),asa:()=>eq(x.A,y.A)&&eq(x.B,y.B),'right-legs':()=>right()&&proportion(x.AC,y.AC),'right-adj-angle':()=>right()&&acute(),'right-hyp-leg':()=>right()&&proportion(x.BC,y.BC)})[c.kind]();
 }else{
  passes=({sss:()=>eq(x.AB,y.AB)&&eq(x.AC,y.AC)&&eq(x.BC,y.BC),sas:()=>eq(x.AB,y.AB)&&eq(x.AC,y.AC)&&eq(x.A,y.A),asa:()=>eq(x.AB,y.AB)&&eq(x.A,y.A)&&eq(x.B,y.B),'right-legs':()=>right()&&eq(x.AB,y.AB)&&eq(x.AC,y.AC),'right-adj-angle':()=>right()&&eq(x.AB,y.AB)&&acute(),'right-hyp-angle':()=>right()&&eq(x.BC,y.BC)&&acute(),'right-hyp-leg':()=>right()&&eq(x.BC,y.BC)&&eq(x.AB,y.AB)})[c.kind]();
 }
 // The classroom inspector must never label deformed pairs as equal/similar.
 return {passes,ratio:scale,sideRatios:[y.AB/x.AB,y.AC/x.AC,y.BC/x.BC],areaRatio:y.area/x.area,first:x,second:y};
}
/** Drag an editable vertex while respecting case-specific invariants. */
export function dragTrianglePoint(id,current,vertex,point){
 const c=TRIANGLE_CASES[id];if(!c||!['B','C'].includes(vertex)||!Array.isArray(point))return {...current};
 const out={...current};const x=Number(point[0]),y=Number(point[1]);if(!Number.isFinite(x)||!Number.isFinite(y))return out;
 if(vertex==='B'){
  if(c.kind==='right-hyp-angle')out.h=clamp(x/Math.cos(radians(out.beta)),5,10);
  else out.p=clamp(x,2,c.kind==='right-hyp-leg'?Math.min(6,out.h-.35):8);
 }else{
  if(c.kind==='sss'){out.q=clamp(Math.hypot(x,y),2,8);out.r=clamp(Math.hypot(x-out.p,y),2,9);}
  else if(c.kind==='sas'){out.q=clamp(Math.hypot(x,y),2,8);out.theta=clamp(degrees(Math.atan2(y,x)),20,145);}
  else if(c.kind==='asa'){out.alpha=clamp(degrees(Math.atan2(y,x)),20,75);out.beta=clamp(degrees(Math.atan2(y,out.p-x)),20,75);}
  else if(c.kind==='right-legs')out.q=clamp(y,2,8);
  else if(c.kind==='right-adj-angle')out.beta=clamp(degrees(Math.atan2(y,out.p)),18,75);
  else if(c.kind==='right-hyp-angle')out.beta=clamp(degrees(Math.atan2(y,out.h*Math.cos(radians(out.beta)))),18,75);
  else if(c.kind==='right-hyp-leg')out.h=clamp(Math.hypot(out.p,Math.max(y,.5)),Math.max(5,out.p+.1),10);
 }
 try{makeTriangle(id,out);return out;}catch{return {...current};}
}
