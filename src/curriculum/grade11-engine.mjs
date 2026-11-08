import {lessonMotionProgress} from './educational-motion.mjs';
/** Grade 11 KNTT (R84): independent numerical model, parameter validation, exact 3D vector algebra and Three.js model descriptors.
 * Not a catalogue renderer: every case has separately testable mathematical conditions.
 */
const EPS = 1e-10;
export const add=(a,b)=>a.map((v,i)=>v+b[i]);
export const sub=(a,b)=>a.map((v,i)=>v-b[i]);
export const mul=(a,s)=>a.map(v=>v*s);
export const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const norm=a=>Math.sqrt(dot(a,a));
export const unit=a=>{const m=norm(a);if(m<EPS)throw Error('Zero direction');return mul(a,1/m);};
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const lerp=(a,b,p)=>a+(b-a)*clamp(p,0,1);
export function planeFrom3Points(A,B,C){const n=cross(sub(B,A),sub(C,A));if(norm(n)<EPS)throw Error('Three points are collinear');return {point:[...A],normal:unit(n)};}
export function signedDistancePointPlane(P,plane){return dot(sub(P,plane.point),unit(plane.normal));}
export function footPointPlane(P,plane){const n=unit(plane.normal);return sub(P,mul(n,dot(sub(P,plane.point),n)));}
export function angleLinePlane(u,n){return Math.asin(clamp(Math.abs(dot(u,n))/(norm(u)*norm(n)),0,1));}
export function parallelProjection(P,plane,dir){const n=unit(plane.normal),den=dot(n,dir);if(Math.abs(den)<EPS)throw Error('Projection direction parallel to plane');return sub(P,mul(dir,dot(n,sub(P,plane.point))/den));}
export function planeIntersection(p1,p2){const n1=unit(p1.normal),n2=unit(p2.normal),v=cross(n1,n2),den=dot(v,v);if(den<EPS){const gap=Math.abs(dot(n1,sub(p2.point,p1.point)));return {status:gap<EPS?'coincident':'parallel'};}
 const d1=dot(n1,p1.point),d2=dot(n2,p2.point),point=mul(cross(sub(mul(n2,d1),mul(n1,d2)),v),1/den);
 return {status:'intersect',point,direction:unit(v)};
}
export function skewCommonPerpendicular(P,u,Q,v){const a=dot(u,u),b=dot(u,v),c=dot(v,v),w=sub(P,Q),d=dot(u,w),e=dot(v,w),den=a*c-b*b;
 if(a<EPS||c<EPS)throw Error('Zero line direction');
 if(den<EPS*a*c) return {status:'parallel',distance:norm(cross(sub(Q,P),u))/norm(u)};
 const s=(b*e-c*d)/den,t=(a*e-b*d)/den,H=add(P,mul(u,s)),K=add(Q,mul(v,t));
 const between=sub(K,H);return {status:norm(between)<1e-8?'intersect':'skew',H,K,s,t,distance:norm(between)};
}
export function dihedralRayAngle(u,v){return Math.acos(clamp(dot(u,v)/(norm(u)*norm(v)),-1,1));}
export function frustumVolume(a,b,h){if(!(a>=b&&b>=0&&h>=0))throw Error('Require a >= b >= 0 and h >= 0');return h*(a*a+a*b+b*b)/3;}
export function pyramidVolume(area,h){if(area<0||h<0)throw Error('Nonpositive prism size');return area*h/3;}
export function prismVolume(area,h){if(area<0||h<0)throw Error('Nonpositive prism size');return area*h;}
export function groupedMean(counts,centers){const N=counts.reduce((a,b)=>a+b,0);if(N<=0||counts.length!==centers.length)throw Error('Invalid grouped data');return counts.reduce((s,c,i)=>s+c*centers[i],0)/N;}
export function groupedQuantile(counts,bounds,p){const N=counts.reduce((a,b)=>a+b,0);if(N<=0||bounds.length!==counts.length+1||p<0||p>1)throw Error('Invalid grouped data');const target=p*N;let cumulative=0;for(let k=0;k<counts.length;k++){const past=cumulative;cumulative+=counts[k];if(cumulative>=target&&counts[k]>0)return bounds[k]+(target-past)/counts[k]*(bounds[k+1]-bounds[k]);}return bounds.at(-1);}
export function probabilityUnion(pa,pb,pab){if([pa,pb,pab].some(x=>x<0||x>1)||pab<Math.max(0,pa+pb-1)-EPS||pab>Math.min(pa,pb)+EPS)throw Error('Invalid event probabilities');return pa+pb-pab;}
export function pointOnCircle(alpha){return [Math.cos(alpha),Math.sin(alpha)];}
export function reflectAcrossYeqX(point){return [point[1],point[0]];}
export function secantSlope(f,x,h){if(Math.abs(h)<EPS)throw Error('h must be nonzero');return (f(x+h)-f(x))/h;}
export function monotoneProgress(t,duration){if(!(duration>0))throw Error('duration must be positive');return clamp(t/duration,0,1);}

const COUNTS={
 '11-01':4,'11-02':2,'11-03':3,'11-04':3,'11-05':3,'11-06':4,
 '11-07':3,'11-08':4,'11-09':3,'11-10':3,'11-13':3
};
export const GRADE11_IDS=Object.freeze(Object.entries(COUNTS).flatMap(([key,n])=>Array.from({length:n},(_,i)=>`${key}-C${String(i+1).padStart(2,'0')}`).filter(id=>!['11-02-C01','11-02-C02'].includes(id))));
// 11-02-C05/06 are equations; C01-C04 are already served by FunctionGraphLab.
export const GRADE11_CUSTOM_IDS=Object.freeze([...GRADE11_IDS.filter(x=>!x.startsWith('11-02')), '11-02-C05','11-02-C06'].sort());
export const isGrade11Mode=id=>GRADE11_CUSTOM_IDS.includes(id);
export const grade11Family=id=>id.slice(0,5);
export const grade11Is3D=id=>isGrade11Mode(id)&&['11-05','11-06','11-07','11-08','11-09'].includes(grade11Family(id));
const P=Math.PI;
const bound=(x,a,b)=>Math.max(a,Math.min(b,x));
const num=x=>Number.isFinite(x)?Number(x.toFixed(2)):'—';
const field=(key,label,min,max,step)=>({key,label,min,max,step});
const fieldSet={
 angle:field('angle','Góc lượng giác α (°)',-720,720,5),
 radius:field('radius','Bán kính R',.7,5,.1),
 angle2:field('angle2','Góc β (°)',-180,180,5),
 kind:field('kind','Chọn dạng (0: sin/tan; 1: cos/cot)',0,1,1),
 value:field('value','Giá trị vế phải m',-1,1,.05),
 target:field('target','Giá trị vế phải m',-3,3,.1),
 n:field('n','Số hạng n',3,12,1),
 u1:field('u1','Số hạng u₁',-3,5,.5),
 d:field('d','Công sai d',-2,3,.25),
 q:field('q','Công bội q',-2,2,.25),
 start:field('start','Đầu mút khoảng thứ nhất',0,20,1),
 width:field('width','Độ rộng khoảng nhóm',1,5,.5),
 n1:field('n1','Tần số nhóm 1',1,20,1),n2:field('n2','Tần số nhóm 2',1,20,1),
 n3:field('n3','Tần số nhóm 3',1,20,1),n4:field('n4','Tần số nhóm 4',1,20,1),
 deg:field('deg','Góc nghiêng φ (°)',20,160,5),
 dist:field('dist','Khoảng cách h',.7,5,.1),
 h:field('h','Chiều cao h',1,6,.2),
 a:field('a','Cạnh đáy a',2,6,.25),b:field('b','Cạnh đáy trên b',.5,4,.25),
 shift:field('shift','Độ xiên của phương chiếu',-2,2,.2),
 x0:field('x0','Điểm xét x₀',-2,2,.1),
 jump:field('jump','Mức độ nhảy (0 = liên tục)',0,2,.1),
 rate:field('rate','Tỉ lệ thay đổi dãy',.3,2,.1),
 trials:field('trials','Số phép thử',10,500,10),
 pa:field('pa','P(A)',.05,.95,.05),pb:field('pb','P(B)',.05,.95,.05),
 overlap:field('overlap','P(A ∩ B)',0,.8,.05)
};
const keys={
 '11-01':['angle','radius','angle2'], '11-02':['kind','value','target'],
 '11-03':['n','u1','d','q'], '11-04':['start','width','n1','n2','n3','n4'],
 '11-05':['deg','dist'], '11-06':['deg','dist','shift','h'],
 '11-07':['deg','h'], '11-08':['deg','dist','h'], '11-09':['a','b','h'],
 '11-10':['n','rate','x0','jump'], '11-13':['pa','pb','overlap','trials']
};
const defaults={
 '11-01':{angle:75,radius:2.5,angle2:30},'11-02':{kind:0,value:.5,target:1},
 '11-03':{n:8,u1:2,d:1,q:1.5,rate:1},'11-04':{start:0,width:3,n1:4,n2:8,n3:12,n4:6},
 '11-05':{deg:55,dist:2},'11-06':{deg:45,dist:2,shift:1,h:2.5},
 '11-07':{deg:90,h:3},'11-08':{deg:55,dist:2,h:3},
 '11-09':{a:4,b:2,h:3}, '11-10':{n:8,rate:1,x0:1,jump:0},
 '11-13':{pa:.5,pb:.4,overlap:.2,trials:120}
};
export function grade11Schema(id){if(!isGrade11Mode(id))throw Error('Lab Toán 11 chưa triển khai: '+id);
 const fam=grade11Family(id),n=Number(id.split('-C')[1]);let selected=keys[fam];
 if(fam==='11-01'&&n!==4)selected=['angle','radius'];
 if(fam==='11-02')selected=n===5?['kind','value']:['kind','target'];
 if(fam==='11-03')selected=n===1?['n','rate']:n===2?['n','u1','d']:['n','u1','q'];
 if(fam==='11-05')selected=n===1?['deg']:n===2?['deg','dist']:['deg','dist'];
 if(fam==='11-06')selected=n===4?['h','shift']:n===2?['dist','deg']:['dist'];
 if(fam==='11-07')selected=n===3?['deg']:n===1?['deg']:['h'];
 if(fam==='11-08')selected=n===1||n===2?['deg']:n===3?['h']:['dist','deg'];
 if(fam==='11-09')selected=n===3?['a','b','h']:['a','h'];
 if(fam==='11-10')selected=n===1?['n','rate']:n===2?['x0','jump']:['x0','jump'];
 if(fam==='11-13')selected=n===1?['pa','pb','overlap']:n===2?['pa','pb','overlap']:['pa','pb','trials'];
 return selected.map(k=>fieldSet[k]);
}
export function grade11Defaults(id){if(!isGrade11Mode(id))throw Error('Unknown Grade11 Lab');return {...defaults[grade11Family(id)],...(id==='11-13-C02'?{overlap:0}:{}),...(id==='11-10-C02'?{jump:1}:{})};}
export function grade11Valid(id,p){if(!isGrade11Mode(id))return false;const schema=grade11Schema(id);
 if(!schema.every(s=>Number.isFinite(p[s.key])&&p[s.key]>=s.min-1e-8&&p[s.key]<=s.max+1e-8))return false;
 const f=grade11Family(id);if(f==='11-09'&&id==='11-09-C03'&&!(p.a>p.b))return false;
 if(id==='11-13-C02'&&Math.abs(p.overlap)>1e-9)return false;
 if(f==='11-13'&&id!=='11-13-C03'&&(p.overlap>Math.min(p.pa,p.pb)+1e-8||p.overlap<Math.max(0,p.pa+p.pb-1)-1e-8))return false;
 return true;
}
const result=(latex,values,extra={})=>({latex,values:Object.entries(values).map(([k,v])=>`${k}: ${num(v)}`),result:extra});
const medianGrouped=(counts,bounds,portion)=>{const N=counts.reduce((a,b)=>a+b,0),target=N*portion;let count=0;
 for(let i=0;i<counts.length;i++){const prev=count;count+=counts[i];if(count+1e-9>=target)return bounds[i]+(target-prev)/counts[i]*(bounds[i+1]-bounds[i]);}
 return bounds.at(-1);
};
export function grade11Grouped(p){const counts=[p.n1,p.n2,p.n3,p.n4],N=counts.reduce((a,b)=>a+b,0),bounds=Array.from({length:5},(_,i)=>p.start+i*p.width);
 const centers=counts.map((_,i)=>(bounds[i]+bounds[i+1])/2),mean=counts.reduce((s,c,i)=>s+c*centers[i],0)/N;
 return {counts,N,bounds,centers,mean,Q1:medianGrouped(counts,bounds,.25),Me:medianGrouped(counts,bounds,.5),Q3:medianGrouped(counts,bounds,.75)};
}
export function grade11Sequence(id,p){const n=p.n,kind=Number(id.split('-C')[1]);return Array.from({length:n},(_,i)=>kind===1?p.rate*(i+1)/(i+2):kind===2?p.u1+i*p.d:p.u1*p.q**i);}
export function grade11TrigSolutions(id,p){if(id==='11-02-C05'){
 const val=p.value,asin=Math.asin(val),acos=Math.acos(val),sol=p.kind===0?[asin,P-asin]:[acos,-acos];
 return {kind:p.kind===0?'sin':'cos',solutions:sol,period:2*P,value:val};
 }
 const val=p.target,angle=p.kind===0?Math.atan(val):Math.atan2(1,val);
 return {kind:p.kind===0?'tan':'cot',solutions:[angle],period:P,value:val};
}
export function grade11Prob(p){const both=p.overlap,onlyA=p.pa-both,onlyB=p.pb-both,neither=1-p.pa-p.pb+both;return {both,onlyA,onlyB,neither,union:p.pa+p.pb-both,independent:Math.abs(both-p.pa*p.pb)<1e-9};}
export function grade11Math(id,p,{trials=0,seed=20261027}={}){
 if(!grade11Valid(id,p))throw Error('Tham số không hợp lệ / điều kiện toán học không thỏa mãn: '+id);
 const family=grade11Family(id),mode=Number(id.split('-C')[1]);
 if(family==='11-01'){
  const a=p.angle*P/180,b=p.angle2*P/180,r=p.radius;
  if(mode===4)return result(String.raw`\cos(\alpha+\beta)=\cos\alpha\cos\beta-\sin\alpha\sin\beta`,{'cos(α+β)':Math.cos(a+b),'Vế phải':Math.cos(a)*Math.cos(b)-Math.sin(a)*Math.sin(b),'sin(α+β)':Math.sin(a+b)},{a,b});
  if(mode===3)return result(String.raw`\ell=R|\alpha|\qquad(\alpha\;\text{tính bằng radian})`,{'Góc (rad)':a,'Độ dài cung':r*Math.abs(a),'Bán kính':r},{a,r});
  if(mode===2)return result(String.raw`M(\cos\alpha;\sin\alpha),\quad\cos^2\alpha+\sin^2\alpha=1`,{'cos α':Math.cos(a),'sin α':Math.sin(a),'Hệ thức':Math.cos(a)**2+Math.sin(a)**2},{a});
  return result(String.raw`\alpha=\frac{\pi}{180^\circ}\cdot\alpha_{\text{độ}},\quad\alpha'=\alpha+2k\pi`,{'Số đo rad':a,'Số vòng tròn':p.angle/360},{a});
 }
 if(family==='11-02'){const x=grade11TrigSolutions(id,p);return result(x.kind==='sin'?String.raw`\sin x=m`:x.kind==='cos'?String.raw`\cos x=m`:x.kind==='tan'?String.raw`\tan x=m`:String.raw`\cot x=m`,{'Nghiệm 1 (rad)':x.solutions[0],'Nghiệm 2 (rad)':x.solutions[1]??x.solutions[0],'Chu kỳ nghiệm':x.period},x);}
 if(family==='11-03'){const sequence=grade11Sequence(id,p);const s=sequence.reduce((a,b)=>a+b,0),v=sequence.at(-1);return result(mode===1?String.raw`u_n=\frac{cn}{n+1}`:mode===2?String.raw`u_n=u_1+(n-1)d,\quad S_n=\frac{n(u_1+u_n)}2`:String.raw`u_n=u_1q^{n-1},\quad S_n=u_1\frac{1-q^n}{1-q}\;(q\ne1)`,{'Số hạng cuối':v,'Tổng n số hạng':s,'Số hạng':p.n},{sequence,sum:s});}
 if(family==='11-04'){const d=grade11Grouped(p);return result(mode===1?String.raw`N=\sum_i n_i`:mode===2?String.raw`\overline x\approx\frac{\sum_i n_ic_i}{N}`:String.raw`M_e\approx L+\frac{N/2-F_{\text{trước}}}{n_k}\cdot h`,{'Cỡ mẫu':d.N,'Trung bình xấp xỉ':d.mean,'Q1 (ước lượng)':d.Q1,'Trung vị (ước lượng)':d.Me,'Q3 (ước lượng)':d.Q3},d);}
 if(family==='11-10'){
  const x0=p.x0;if(mode===1){const n=p.n,val=p.rate/(n+1);return result(String.raw`u_n=\frac{c}{n+1}\longrightarrow0`,{'Số hạng thứ n':val,'Giới hạn':0},{n,val});}
  if(mode===2){const left=x0+1+p.jump,right=x0+1;return result(String.raw`\lim_{x\to a^-}f(x)=1+a+j,\quad \lim_{x\to a^+}f(x)=1+a`,{'Giới hạn trái':left,'Giới hạn phải':right,'Bằng nhau':p.jump===0?1:0},{left,right});}
  return result(String.raw`f\;\text{liên tục tại}\;a\iff\lim_{x\to a}f(x)=f(a)`,{'Giới hạn trái':x0+1+p.jump,'Giới hạn phải':x0+1,'Giá trị f(a)':x0+1,'Liên tục':p.jump===0?1:0},{continuous:p.jump===0});
 }
 if(family==='11-13'){
  if(mode===3){const exact=p.pa*p.pb;const samples=grade11Trials(p,trials||p.trials,seed);return result(String.raw`P(A\cap B)=P(A)\cdot P(B)\quad\text{(khi }A,B\text{ độc lập)}`,{'Xác suất A':p.pa,'Xác suất B':p.pb,'Xác suất giao':exact,'Tần số tương đối':samples.relative,'Số lần thử':samples.trials},{...samples,expected:exact});}
  const r=grade11Prob(p);return result(mode===1?String.raw`P(A\cup B)=P(A)+P(B)-P(A\cap B)`:String.raw`P(A\cup B)=P(A)+P(B)\quad\text{(khi }A,B\text{ xung khắc)}`,{'P(A∪B)':r.union,'P(A∩B)':r.both,'P(A∩B)=0':r.both===0?1:0},r);
 }
 // Actual volume/space computations: params control non-degenerate geometry in 3D.
 if(family==='11-09'){
  const area=mode===1?Math.sqrt(3)*p.a*p.a/4:p.a*p.a;
  const volume=mode===1?area*p.h:mode===2?area*p.h/3:p.h*(p.a*p.a+p.a*p.b+p.b*p.b)/3;
  return result(mode===1?String.raw`V_{\text{lăng trụ}}=S_{\text{đáy}}\cdot h`:mode===2?String.raw`V_{\text{chóp}}=\frac13S_{\text{đáy}}\cdot h`:String.raw`V_{\text{chóp cụt}}=\frac h3\left(S_1+S_2+\sqrt{S_1S_2}\right)\quad\text{[Mở rộng / Vận dụng Bài 27]}`,mode===3?{'Chiều cao':p.h,'Diện tích đáy lớn S₁':area,'Diện tích đáy nhỏ S₂':p.b*p.b,'Thể tích [Mở rộng / Vận dụng]':volume,'Giới hạn lăng trụ (khi b → a)':area*p.h}:{'Chiều cao':p.h,'Diện tích đáy lớn':area,'Thể tích':volume}, {volume,area,topArea:mode===3?p.b*p.b:0,prismLimitVolume:area*p.h});
 }
 if(family==='11-05'){
  const rad=(p.deg||55)*P/180,sk=skewCommonPerpendicular([0,-p.dist/2,0],[1,0,0],[0,p.dist/2,0],[Math.cos(rad),0,Math.sin(rad)]);
  return result(mode===1?String.raw`\vec n=\overrightarrow{AB}\times\overrightarrow{AC}\ne\vec0\Rightarrow(ABC)`:mode===2?String.raw`d=(P)\cap(Q)`:String.raw`d(d_1,d_2)=\frac{|(P_2-P_1)\cdot(\vec u_1\times\vec u_2)|}{\|\vec u_1\times\vec u_2\|}`,{'Góc tham số (°)':p.deg,'Khoảng cách HK':mode===3?sk.distance:p.dist}, {skew:mode===3,commonPerp:sk});
 }
 if(family==='11-06'){
  const projPt=parallelProjection([-2,p.h,-1],{point:[0,0,0],normal:[0,1,0]},[p.shift,-p.h,0]);
  return result(mode===1?String.raw`d_1\parallel d_2\iff\vec u_1\times\vec u_2=\vec0`:mode===2?String.raw`\vec u_d\cdot\vec n_P=0,\;d\cap(P)=\varnothing`:mode===3?String.raw`\vec n_P\times\vec n_Q=\vec0`:String.raw`P'=P-\frac{\vec n\cdot(P-P_0)}{\vec n\cdot\vec v}\vec v`,{'Khoảng cách':p.dist,'Góc hướng (°)':p.deg,'Độ xiên':p.shift,'Chiều cao chiếu':p.h}, {parallel:mode<4,projectedA:projPt});
 }
 if(family==='11-07'){
  const dotVal=Math.cos((p.deg||90)*P/180);
  return result(mode===1?String.raw`\vec u_1\cdot\vec u_2=0`:mode===2?String.raw`\vec u_d\parallel\vec n_P\Rightarrow d\perp(P)`:String.raw`\vec n_P\cdot\vec n_Q=0\iff(P)\perp(Q)`,{'Góc điều khiển (°)':mode===3?p.deg:mode===1?p.deg:90,'Tích vô hướng u·v':mode===2?0:dotVal,'Đúng vuông góc':mode!==2&&Math.abs(p.deg-90)<1e-9?1:mode===2?1:0},{perpendicular:mode===2||Math.abs(p.deg-90)<1e-9,dotProduct:mode===2?0:dotVal});
 }
 if(family==='11-08'){
  const rad=(p.deg||55)*P/180;
  return result(mode===1?String.raw`\sin\varphi=\frac{|\vec u\cdot\vec n|}{\|\vec u\|\,\|\vec n\|}`:mode===2?String.raw`\varphi=\angle(\vec u,\vec v),\quad \vec u\perp d,\;\vec v\perp d`:mode===3?String.raw`d(A,(P))=\frac{|\vec n\cdot\overrightarrow{P_0A}|}{\|\vec n\|}=AH`:String.raw`\overrightarrow{HK}\cdot\vec u_1=\overrightarrow{HK}\cdot\vec u_2=0,\quad d(d_1,d_2)=HK`,{'Góc (°)':p.deg,'sin φ':Math.sin(rad),'Khoảng cách':mode===3?p.h:p.dist},{distance:mode===3?p.h:p.dist,sinPhi:Math.sin(rad)});
 }
 throw Error('Không nhận diện toán học: '+id);
}
function hash32(x){x|=0;x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}
export function grade11Trials(p,trials=100,seed=20261027){let x=seed>>>0,hit=0;for(let i=0;i<trials;i++){x=hash32(x+0x9e3779b9);const a=(x>>>0)/4294967296<p.pa;x=hash32(x+0x9e3779b9);const b=(x>>>0)/4294967296<p.pb;if(a&&b)hit++;}return {hits:hit,trials,relative:trials?hit/trials:0};}
export function grade11AnimatedParams(id,p,t=0){
 const q={...p};if(!grade11Is3D(id)||!t)return q;
 const family=grade11Family(id),n=Number(id.split('-C')[1]);
 const fields=grade11Schema(id),byKey=Object.fromEntries(fields.map(x=>[x.key,x]));
 const progress=lessonMotionProgress(t);
 let key;
 if(family==='11-09'||(family==='11-07'&&n===2)||(family==='11-08'&&n===3))key='h';
 else if(family==='11-06'&&n===4)key='shift';
 else if(family==='11-06'&&[1,2,3].includes(n))key='dist';
 else if(family==='11-05'&&n>=2)key='deg';
 else if(family==='11-08'&&n===4)key='dist';
 else key=byKey.deg?'deg':byKey.dist?'dist':fields[0]?.key;
 const def=byKey[key];if(!def)return q;
 const span=def.max-def.min;
 const target=bound(p[key]+span*.36,def.min,def.max);
 q[key]=p[key]+(target-p[key])*progress;
 if(id==='11-09-C03')q.a=Math.max(q.a,q.b+.20);
 return grade11Valid(id,q)?q:{...p};
}
/** Real Three.js geometry, not a 2D image projected onto a pane. */
export function grade11SolidModel(id,p,t=0){if(!grade11Is3D(id))throw Error('Không phải Lab không gian Toán 11');const x=grade11AnimatedParams(id,p,t),n=Number(id.split('-C')[1]),f=grade11Family(id),turn=Number(lessonMotionProgress(t).toFixed(3));
 const wrap=(type,params)=>({id:'gd6_'+id,grade:11,title:id,type,params:{...params,turn,modeId:id},custom:false});
 if(f==='11-05')return n===1?wrap('plane',{angle:x.deg}):n===2?wrap('twoPlanes',{gap:0,angle:x.deg}):wrap('skewLines',{dist:x.dist,angle:x.deg,subMode:'skew_check'});
 if(f==='11-06')return n===1?wrap('skewLines',{dist:x.dist,angle:0,subMode:'parallel'}):n===2?wrap('lineParallelPlane',{dist:x.dist,angle:x.deg}):n===3?wrap('parallelPlanes',{dist:x.dist}):wrap('parallelProjection',{h:x.h,shift:x.shift});
 if(f==='11-07')return n===1?wrap('skewLines',{dist:0,angle:x.deg,subMode:'angle_vectors'}):n===2?wrap('linePerpPlane',{h:x.h,slant:45,subMode:'perp_basis'}):wrap('dihedralAngle',{deg:x.deg,size:4,subMode:'perp_planes'});
 if(f==='11-08')return n===1?wrap('linePlaneAngle',{deg:x.deg,len:4,subMode:'line_plane_angle'}):n===2?wrap('dihedralAngle',{deg:x.deg,size:4,subMode:'dihedral_plane_angle'}):n===3?wrap('linePerpPlane',{h:x.h,slant:45,subMode:'point_distance'}):wrap('skewLines',{dist:x.dist,angle:x.deg,subMode:'common_perp'});
 return n===1?wrap('triPrism',{a:x.a,h:x.h}):n===2?wrap('squarePyramid',{a:x.a,h:x.h}):wrap('frustumPyramid',{a:x.a,b:x.b,h:x.h});
}
