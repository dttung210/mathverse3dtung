import {lessonMotionProgress} from './educational-motion.mjs?v=r107_v15';
/** MATHVERSE GD7 / R85: Toan 12 – validated mathematical models, independent of DOM and WebGL.
 * 10 SVG + 19 world-spatial Three.js modes; 10 graph modes use graph-models.mjs.
 */
export const R85_PALETTE=Object.freeze({
 origin:'#1D4ED8',
 compare:'#15803D',
 active:'#C2410C',
 result:'#7C3AED',
 aux:'#64748B',
 invalid:'#B91C1C',
 axes:Object.freeze({Ox:'#9A3412',Oy:'#15803D',Oz:'#1D4ED8'}),
 planes:Object.freeze({plane_a:'#2563EB',plane_b:'#EA580C',intersection:'#16A34A'})
});
export function monotoneProgress(t=0,dur=6,{holdAtEnd=true}={}){
 const v=Math.max(0,Number(t)||0),period=Math.max(.1,dur);
 const x=holdAtEnd?Math.min(v,period):(v%period);
 const u=Math.min(1,Math.max(0,x/period));
 return u*u*(3-2*u);
}
export function stageIndexFromProgress(ph=0){
 const p=Math.max(0,Math.min(1,Number(ph)||0));
 return p<.25?1:p<.55?2:p<.85?3:4;
}
export function formatCanonicalLine(M=[0,0,0],u=[1,1,1]){
 const axes=['x','y','z'],ratios=[],fixed=[];
 for(let i=0;i<3;i++){
  const m0=Number(Number(M[i]||0).toFixed(2)),ui=Number(Number(u[i]||0).toFixed(2));
  const num=m0===0?axes[i]:m0>0?`${axes[i]} - ${m0}`:`${axes[i]} + ${Math.abs(m0)}`;
  if(Math.abs(ui)>1e-7)ratios.push(`(${num})/${ui}`);
  else fixed.push(`${axes[i]} = ${m0}`);
 }
 return [ratios.join(' = '),fixed.join(', ')].filter(Boolean).join(' ; ');
}
const FAMILIES=Object.freeze({'12-03':3,'12-04':4,'12-05':3,'12-06':1,'12-07':3,'12-08':4,'12-09':4,'12-10':3,'12-11':4});
export const GRADE12_CUSTOM_IDS=Object.freeze(Object.entries(FAMILIES).flatMap(([f,n])=>Array.from({length:n},(_,i)=>`${f}-C${String(i+1).padStart(2,'0')}`)));
export const isGrade12Mode=id=>GRADE12_CUSTOM_IDS.includes(id);
export const grade12Family=id=>String(id).slice(0,5);
export const grade12Is3D=id=>isGrade12Mode(id)&&['12-04','12-07','12-08','12-09','12-10'].includes(grade12Family(id))||id==='12-03-C02';
const PI=Math.PI,EPS=1e-9;
const f=(key,label,min,max,step)=>({key,label,min,max,step});
const S={
 P:f('P','Chu vi P',12,40,.5),x:f('x','Độ rộng / độ cắt x',.3,5,.05),L:f('L','Cạnh tấm bìa L',6,20,.5),
 demand:f('demand','Lượng cầu ban đầu a',10,60,1),slope:f('slope','Hệ số cầu b',.5,6,.5),price:f('price','Giá bán p',1,20,.25),
 vx:f('vx','Hoành độ x',-4,4,.25),vy:f('vy','Tung độ y',-4,4,.25),vz:f('vz','Cao độ z',-4,4,.25),
 ux:f('ux','Vectơ thứ hai u₁',-4,4,.25),uy:f('uy','Vectơ thứ hai u₂',-4,4,.25),uz:f('uz','Vectơ thứ hai u₃',-4,4,.25),
 lo:f('lo','Cận đầu lớp',-10,20,1),w:f('w','Bề rộng lớp',1,8,.5),
 n1:f('n1','Tần số lớp 1',1,20,1),n2:f('n2','Tần số lớp 2',1,20,1),n3:f('n3','Tần số lớp 3',1,20,1),n4:f('n4','Tần số lớp 4',1,20,1),
 r1:f('r1','Bán kính đầu r₁',.7,3.2,.1),r2:f('r2','Bán kính cuối r₂',.7,3.2,.1),h:f('h','Chiều dài khối h',1,6,.2),hole:f('hole','Bán kính lỗ r₀',0,2,.1),slice:f('slice','Vị trí mặt cắt (0..1)',.05,.95,.05),
 A:f('A','Pháp tuyến A',-3,3,.25),B:f('B','Pháp tuyến B',-3,3,.25),C:f('C','Pháp tuyến C',-3,3,.25),D:f('D','Hệ số D',-4,4,.25),
 dist:f('dist','Khoảng cách d',0,4,.1),deg:f('deg','Góc điều khiển φ (°)',0,160,5),
 r:f('r','Bán kính mặt cầu R',1,3.5,.1),
 prior:f('prior','P(A)',.05,.95,.05),pa:f('pa','P(B|A)',.05,.95,.05),pb:f('pb','P(B|Ā)',.05,.95,.05),
 trials:f('trials','Số phép thử',20,500,10)
};
const FIELDS={
 '12-03-C01':['P','x'],'12-03-C02':['L','x'],'12-03-C03':['demand','slope','price'],
 '12-04-C01':['vx','vy','vz'],'12-04-C02':['vx','vy','vz','ux','uy','uz'],
 '12-04-C03':['vx','vy','vz','ux','uy','uz'],'12-04-C04':['vx','vy','vz','ux','uy','uz'],
 '12-05-C01':['lo','w','n1','n2','n3','n4'],'12-05-C02':['lo','w','n1','n2','n3','n4'],'12-05-C03':['lo','w','n1','n2','n3','n4'],
 '12-06-C01':['x'],
 '12-07-C01':['r1','r2','h'],'12-07-C02':['r1','r2','h','hole'],'12-07-C03':['r1','r2','h','slice'],
 '12-08-C01':['A','B','C','vx','vy','vz'],'12-08-C02':['dist','deg'],'12-08-C03':['A','B','C','D','vx','vy','vz'],'12-08-C04':['deg'],
 '12-09-C01':['vx','vy','vz','ux','uy','uz'],'12-09-C02':['vx','vy','vz','ux','uy','uz'],
 '12-09-C03':['dist','deg'],'12-09-C04':['deg'],
 '12-10-C01':['vx','vy','vz','r'],'12-10-C02':['r','dist'],'12-10-C03':['r','dist'],
 '12-11-C01':['prior','pa','pb'],'12-11-C02':['prior','pa','pb'],'12-11-C03':['prior','pa','pb'],
 '12-11-C04':['prior','pa','pb']
};
const BASE={P:20,L:10,x:2,demand:40,slope:2,price:8,vx:2,vy:1,vz:2,ux:-1,uy:2,uz:1,
 lo:0,w:5,n1:5,n2:9,n3:11,n4:5,r1:1.8,r2:1.2,h:4,hole:.5,slice:.5,A:1,B:2,C:2,D:-2,dist:1.1,deg:55,r:2.5,prior:.4,pa:.75,pb:.2,trials:100};
export function grade12Schema(id){if(!isGrade12Mode(id))throw Error('Không phải Lab Toán 12: '+id);return FIELDS[id].map(k=>(k==='deg'&&['12-08-C02','12-08-C04','12-09-C04'].includes(id))?{...S[k],max:80}:S[k]);}
export function grade12Defaults(id){if(!isGrade12Mode(id))throw Error('Không có Lab '+id);return Object.fromEntries(grade12Schema(id).map(s=>[s.key,id==='12-03-C02'&&s.key==='x'?1.5:id==='12-06-C01'&&s.key==='x'?1.2:id==='12-10-C02'&&s.key==='dist'?1.25:id==='12-09-C03'&&s.key==='dist'?1.2:BASE[s.key]]));}
export function grade12Valid(id,p){if(!isGrade12Mode(id))return false;const fields=grade12Schema(id);
 if(!fields.every(x=>Number.isFinite(p[x.key])&&p[x.key]>=x.min-1e-7&&p[x.key]<=x.max+1e-7))return false;
 if(id==='12-03-C01'&&!(p.x>0&&p.x<p.P/2))return false;
 if(id==='12-03-C02'&&!(p.x>0&&p.x<p.L/2))return false;
 if(id==='12-03-C03'&&p.price>p.demand/p.slope)return false;
 if(id.startsWith('12-07')&&p.hole!==undefined&&p.hole>=Math.min(p.r1,p.r2))return false;
 if(['12-08-C01','12-08-C03'].includes(id)&&Math.hypot(p.A,p.B,p.C)<.1)return false;
 if(['12-04-C03','12-04-C04'].includes(id)&&Math.hypot(p.vx,p.vy,p.vz)<.1)return false;
 if(['12-04-C03','12-04-C04','12-04-C02','12-09-C01','12-09-C02'].includes(id)&&Math.hypot(p.ux,p.uy,p.uz)<.1)return false;
 return true;
}
const rd=x=>Number.isFinite(x)?Number(x.toFixed(2)):null;
const result=(latex,fields,calc={})=>({latex,values:Object.entries(fields).map(([k,v])=>`${k}: ${v===null?'không xác định':typeof v==='number'?rd(v):v}`),result:calc});
const dot=(u,v)=>u.reduce((s,x,i)=>s+x*v[i],0);const len=u=>Math.hypot(...u);const multiply=(s,u)=>u.map(x=>s*x);
export function grade12Grouped(p){const counts=[p.n1,p.n2,p.n3,p.n4],N=counts.reduce((a,b)=>a+b,0),centers=counts.map((_,i)=>p.lo+(i+.5)*p.w),mean=dot(counts,centers)/N;
 const quartile=q=>{let prev=0;for(let i=0;i<4;i++){const now=prev+counts[i];if(N*q<=now+1e-9)return p.lo+i*p.w+((N*q-prev)/counts[i])*p.w;prev=now;}return p.lo+4*p.w;};
 const Q1=quartile(.25),Me=quartile(.5),Q3=quartile(.75),variance=counts.reduce((s,n,i)=>s+n*(centers[i]-mean)**2,0)/N;
 return {counts,N,centers,mean,Q1,Me,Q3,iqr:Q3-Q1,range:4*p.w,variance,sd:Math.sqrt(variance)};
}
export function grade12Bayes(p){const pB=p.prior*p.pa+(1-p.prior)*p.pb;const both=p.prior*p.pa;return {pB,both,posterior:both/pB,pNotAAndB:(1-p.prior)*p.pb,sum:p.prior*p.pa+p.prior*(1-p.pa)+(1-p.prior)*p.pb+(1-p.prior)*(1-p.pb)};}
export function grade12Volume(p){const outer=PI*p.h*(p.r1*p.r1+p.r1*p.r2+p.r2*p.r2)/3;const inner=PI*(p.hole||0)**2*p.h;
 const t=p.slice??.5,rs=p.r1+(p.r2-p.r1)*t;return {outer,inner,volume:outer-inner,section:PI*(rs*rs-(p.hole||0)**2),radius:rs};}
export function grade12Optimization(id,p){if(id==='12-03-C01'){const area=p.x*(p.P/2-p.x),opt=p.P/4;return {value:area,optimum:opt,best:p.P*p.P/16};}
 if(id==='12-03-C02'){const volume=p.x*(p.L-2*p.x)**2,opt=p.L/6;return {value:volume,optimum:opt,best:opt*(p.L-2*opt)**2,side:p.L-2*p.x};}
 const value=p.price*(p.demand-p.slope*p.price),opt=p.demand/(2*p.slope);return {value,optimum:opt,best:p.demand*p.demand/(4*p.slope),demand:p.demand-p.slope*p.price};}
export function grade12Math(id,p){if(!grade12Valid(id,p))throw Error(`Tham số chưa hợp lệ ở ${id}`);
 const m=Number(id.slice(-2)),fam=grade12Family(id);
 if(fam==='12-03'){const v=grade12Optimization(id,p);const latex=m===1?String.raw`S(x)=x\left(\frac P2-x\right),\quad x_* =\frac P4`:m===2?String.raw`V(x)=x(L-2x)^2,\quad x_*=\frac L6`:String.raw`R(p)=p(a-bp),\quad p_*=\frac a{2b}`;return result(latex,{'Giá trị hiện tại':v.value,'Đạt lớn nhất khi':v.optimum,'Giá trị tối đa':v.best},v);}
 if(fam==='12-04'){const v=[p.vx,p.vy,p.vz],u=m===1?[0,0,0]:[p.ux,p.uy,p.uz],sum=v.map((x,i)=>x+u[i]),d=dot(v,u),den=len(v)*len(u),cos=den?Math.max(-1,Math.min(1,d/den)):null;
  const fields=m===1?{'Điểm M(x; y; z)':`(${v.join('; ')})`,'Độ dài OM = |v|':len(v)}:m===2?{'Vectơ v':`(${v.join('; ')})`,'Vectơ u':`(${u.join('; ')})`,'Độ dài |v|':len(v),'Độ dài |u|':len(u)}:m===3?{'Độ dài |v|':len(v),'Độ dài |u|':len(u),'Tích vô hướng u·v':d,'cos(u, v)':cos}:{'Vectơ v':`(${v.join('; ')})`,'Vectơ u':`(${u.join('; ')})`,'Tổng u + v':`(${sum.join('; ')})`,'Độ dài |u + v|':len(sum)};
  return result(m===1?String.raw`M(x;y;z),\quad OM=\sqrt{x^2+y^2+z^2}`:m===2?String.raw`\vec u=(u_1;u_2;u_3)` :m===3?String.raw`\vec u\cdot\vec v=u_1v_1+u_2v_2+u_3v_3`:String.raw`\vec u+\vec v=(u_1+v_1;u_2+v_2;u_3+v_3)`,fields, {v,u,sum,dot:d,cos});}
 if(fam==='12-05'){const s=grade12Grouped(p);return result(m===1?String.raw`R=x_{\max}-x_{\min}\quad\text{(xấp xỉ theo lớp)}`:m===2?String.raw`\Delta_Q=Q_3-Q_1`:String.raw`s^2\approx\frac1N\sum n_i(c_i-\bar x)^2`,{'Khoảng biến thiên (ước lượng)':s.range,'IQR (ước lượng)':s.iqr,'Phương sai (ước lượng)':s.variance,'Độ lệch chuẩn (ước lượng)':s.sd,'Trung bình (ước lượng)':s.mean},s);}
 if(fam==='12-06')return result(String.raw`F(x)=\frac{x^3}3+C,\quad F'(x)=x^2`,{'Điểm x':p.x,'Đạo hàm F’(x)':p.x*p.x,'Giá trị F(x), C=0':p.x**3/3},{x:p.x,derivative:p.x*p.x});
 if(fam==='12-07'){const v=grade12Volume(p);return result(m===2?String.raw`V=\pi\int_0^h\left(r(x)^2-r_0^2\right)dx\quad(r(x)\ge r_0\ge 0)\;\text{[Tùy trường hợp Bài 13]}`:String.raw`V=\pi\int_0^h r(x)^2\,dx`,m===2?{'Thể tích khối':v.volume,'Thể tích đặc V_ngoài':v.outer,'Thể tích lỗ V_trong':v.inner,'Bán kính lỗ r₀':p.hole||0,'Bán kính mặt cắt':v.radius,'Diện tích mặt cắt':v.section}:{'Thể tích khối':v.volume,'Bán kính mặt cắt':v.radius,'Diện tích mặt cắt':v.section},v);}
 if(fam==='12-08'){
  if(m===2){const state=p.deg===0?(p.dist===0?'trùng nhau':'song song'):'cắt nhau';return result(String.raw`\cos\varphi=\frac{|\vec n_1\cdot\vec n_2|}{|\vec n_1||\vec n_2|}`,{'Quan hệ hai mặt phẳng':state,'Khoảng cách điều khiển':p.dist,'Góc':Math.min(p.deg,180-p.deg)}, {state});}
  if(m===4)return result(String.raw`\cos\varphi=\frac{|\vec n_1\cdot\vec n_2|}{|\vec n_1||\vec n_2|}`,{'Góc giữa hai mặt phẳng (nhọn)':Math.min(p.deg,180-p.deg)},{angle:Math.min(p.deg,180-p.deg)});
  const norm=Math.hypot(p.A,p.B,p.C),M=[p.vx||0,p.vy||0,p.vz||0],planeD=m===1?-dot([p.A,p.B,p.C],M):p.D,signed=(dot([p.A,p.B,p.C],M)+planeD)/norm,dist=Math.abs(signed);
  return result(m===1?String.raw`A(x-x_0)+B(y-y_0)+C(z-z_0)=0,\quad\vec n=(A;B;C)`:String.raw`d(M,(P))=\frac{|Ax_0+By_0+Cz_0+D|}{\sqrt{A^2+B^2+C^2}}`,{'Độ dài pháp tuyến':norm,'Khoảng cách đến (P)':dist}, {normal:[p.A,p.B,p.C],foot:M.map((x,i)=>x-signed*[p.A,p.B,p.C][i]/norm),dist});
 }
 if(fam==='12-09'){
  if(m===3){const state=p.deg===0?(p.dist===0?'trùng nhau':'song song'):p.dist===0?'cắt nhau':'chéo nhau';return result(String.raw`d_1:\vec x=\vec a+t\vec u_1,\quad d_2:\vec x=\vec b+s\vec u_2`,{'Quan hệ đường thẳng':state,'Khoảng cách vuông góc':p.dist,'Góc hướng':p.deg},{state});}
  if(m===4)return result(String.raw`\sin\alpha=\frac{|\vec u\cdot\vec n|}{|\vec u||\vec n|}`,{'Góc giữa đường và mặt phẳng':Math.min(90,p.deg)},{angle:Math.min(90,p.deg)});
  const M=[p.vx,p.vy,p.vz],direction=[p.ux,p.uy,p.uz],canon=formatCanonicalLine(M,direction);
  return result(m===1?String.raw`\vec x=\vec M_0+t\vec u`:String.raw`x=x_0+u_1t,\quad y=y_0+u_2t,\quad z=z_0+u_3t`,{'Tọa độ M₀':`(${p.vx}; ${p.vy}; ${p.vz})`,'Độ dài vectơ chỉ phương':len(direction),'Phương trình chính tắc':canon}, {M,direction,canonical:canon});
 }
 if(fam==='12-10'){
  if(m===1)return result(String.raw`(x-a)^2+(y-b)^2+(z-c)^2=R^2`,{'Bán kính R':p.r,'Diện tích mặt cầu':4*PI*p.r*p.r,'Thể tích khối cầu':4/3*PI*p.r**3},{center:[p.vx,p.vy,p.vz],r:p.r});
  const state=p.dist<p.r-EPS?'cắt tại hai điểm':Math.abs(p.dist-p.r)<=EPS?'tiếp xúc':'không giao',sec=Math.sqrt(Math.max(0,p.r*p.r-p.dist*p.dist));
  return result(m===2?String.raw`r_{\text{thiết diện}}=\sqrt{R^2-d^2}\quad(d\le R)`:String.raw`d(I,\ell)\;\begin{cases}<R:&\text{2 giao điểm}\\=R:&\text{1 tiếp điểm}\\>R:&\text{0 giao điểm}\end{cases}\quad\text{[Mở rộng trực quan Bài 17]}`,m===2?{'Vị trí tương đối':p.dist<p.r-EPS?'cắt theo một đường tròn':Math.abs(p.dist-p.r)<=EPS?'tiếp xúc tại một điểm':'không giao','Bán kính đường tròn giao tuyến':p.dist<=p.r?sec:null}:{'Khoảng cách d(I, Δ)':p.dist,'Bán kính R':p.r,'Vị trí tương đối':state,'Số giao điểm':p.dist<p.r-EPS?2:Math.abs(p.dist-p.r)<=EPS?1:0},{state:m===2?(p.dist<p.r-EPS?'đường tròn':Math.abs(p.dist-p.r)<=EPS?'tiếp điểm':'không giao'):state,sectionRadius:m===2&&p.dist>p.r?null:sec});
 }
 if(fam==='12-11'){const b=grade12Bayes(p),val=m===1?b.both/(b.pB):m===2?b.both:m===3?b.posterior:b.pB;return result(m===1?String.raw`P(A\mid B)=\frac{P(A\cap B)}{P(B)}`:m===2?String.raw`P(A\cap B)=P(A)P(B\mid A)`:m===3?String.raw`P(A\mid B)=\frac{P(A)P(B\mid A)}{P(B)}`:String.raw`P(B)=P(A)P(B\mid A)+P(\overline A)P(B\mid\overline A)`,{'P(A)':p.prior,'P(B)':b.pB,'P(A∩B)':b.both,'P(A|B)':b.posterior,'Tổng xác suất lá':b.sum},b);}
 throw Error('Chưa xây dựng toán học cho '+id);
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function grade12AnimatedParams(id,p,t=0){
 const x={...p};if(!grade12Is3D(id)||!t)return x;
 const progress=monotoneProgress(t,6,{holdAtEnd:true}),fields=grade12Schema(id),byKey=Object.fromEntries(fields.map(z=>[z.key,z]));
 let key,target;
 if(id==='12-03-C02'){key='x';const opt=p.L/6;target=Math.abs(p.x-opt)>.05?opt:Math.min(p.L/2-.3,p.x+.8);}
 else if(id==='12-07-C03'){key='slice';target=.85;}
 else if(id==='12-07-C02'){key='hole';target=Math.min(Math.min(p.r1,p.r2)-.15,p.hole+.55);}
 else if(id==='12-07-C01'){key='r2';target=Math.min(byKey.r2.max,p.r2+.9);}
 else if(id==='12-10-C02'||id==='12-10-C03'){key='dist';target=Math.min(byKey.dist.max,p.r+.55);}
 else if(id==='12-04-C02'){key='ux';target=Math.min(byKey.ux.max,p.ux+(byKey.ux.max-byKey.ux.min)*.35);}
 else if(id==='12-04-C03'){key='vy';target=Math.min(byKey.vy.max,p.vy+(byKey.vy.max-byKey.vy.min)*.35);}
 else if(id==='12-09-C02'){key='ux';target=Math.min(byKey.ux.max,p.ux+(byKey.ux.max-byKey.ux.min)*.35);}
 else if(['12-08-C02','12-08-C04','12-09-C04','12-09-C03'].includes(id)){
   key=byKey.deg?'deg':'dist';target=Math.min(byKey[key].max,p[key]+(byKey[key].max-byKey[key].min)*.38);
 }else {key=byKey.vx?'vx':byKey.dist?'dist':byKey.x?'x':fields[0]?.key;
   if(!key)return x;target=Math.min(byKey[key].max,p[key]+(byKey[key].max-byKey[key].min)*.34);}
 const f=byKey[key];if(!f)return x;
 x[key]=clamp(p[key]+(target-p[key])*progress,f.min,f.max);
 if(id==='12-03-C02')x.x=Math.min(x.x,x.L/2-.2);
 if(id==='12-07-C02')x.hole=Math.min(x.hole,Math.min(x.r1,x.r2)-.15);
 return grade12Valid(id,x)?x:{...p};
}
export function grade12SolidModel(id,p,t=0){if(!grade12Is3D(id))throw Error('Không phải hình 3D Toán 12');const x=grade12AnimatedParams(id,p,t),m=Number(id.slice(-2)),family=grade12Family(id),turn=Number(monotoneProgress(t,6).toFixed(4));
 const make=(type,params)=>({id:'gd7_'+id,title:id,type,params:{...params,turn,modeId:id},grade:12,custom:false});
 if(family==='12-03')return make('openTopBox',{L:x.L,cut:x.x});
 if(family==='12-04')return m===1?make('oxyzVector',{x:x.vx,y:x.vy,z:x.vz}):make('oxyzVectorPair',{x:x.vx,y:x.vy,z:x.vz,u1:x.ux,u2:x.uy,u3:x.uz,subMode:m===2?'components':m===3?'dot_angle':'parallelogram_sum'});
 if(family==='12-07')return make('profileRevolve',{r1:x.r1,r2:x.r2,h:x.h,hole:m===2?x.hole:0,slice:m===3?x.slice:.5,subMode:m===1?'riemann_disks':m===2?'washer_hole':'revolve_sweep'});
 if(family==='12-08')return m===1?make('oxyzPlane',{A:x.A,B:x.B,C:x.C,D:-(x.A*x.vx+x.B*x.vy+x.C*x.vz)}):m===2?(x.deg===0?(x.dist===0?make('oxyzPlane',{A:0,B:0,C:1,D:0,subMode:'oxyz_coincident'}):make('parallelPlanes',{dist:x.dist,subMode:'oxyz_parallel'})):make('twoPlanes',{angle:Math.max(1,x.deg),gap:0,subMode:'oxyz_two_planes'})):m===3?make('oxyzPlanePointDistance',{A:x.A,B:x.B,C:x.C,D:x.D,x:x.vx,y:x.vy,z:x.vz}):make('dihedralAngle',{deg:Math.max(1,x.deg),size:4,subMode:'oxyz_normals_angle'});
 if(family==='12-09')return m<=2?make('oxyzLine',{x0:x.vx,y0:x.vy,z0:x.vz,u1:x.ux,u2:x.uy,u3:x.uz,subMode:m===1?'canonical':'parametric'}):m===3?make('oxyzLinePair',{dist:x.dist,deg:x.deg}):make('linePlaneAngle',{deg:Math.min(89,Math.max(1,x.deg)),len:4,subMode:'oxyz_line_plane_angle'});
 if(family==='12-10')return m===1?make('oxyzSphere',{x:x.vx,y:x.vy,z:x.vz,r:x.r}):m===2?make('oxyzSphereCut',{r:x.r,dist:x.dist}):make('oxyzSphereLine',{r:x.r,dist:x.dist});
 throw Error('Thiếu mô hình 3D '+id);
}
