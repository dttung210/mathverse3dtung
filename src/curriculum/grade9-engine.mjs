/** Grade 9 (KNTT) individual interactive models. No source catalogue mutation. */
export const GRADE9_IDS = Object.freeze(['9-02','9-03','9-04','9-05','9-07','9-09','9-10','9-11','9-12','9-13'].flatMap((fam)=>{
 const counts={'9-02':2,'9-03':3,'9-04':2,'9-05':4,'9-07':6,'9-09':3,'9-10':3,'9-11':3,'9-12':3,'9-13':3};
 return Array.from({length:counts[fam]},(_,i)=>`${fam}-C${String(i+1).padStart(2,'0')}`);
}));
export const isGrade9Mode = id => GRADE9_IDS.includes(id);
export const grade9Solid = id => isGrade9Mode(id)&&['9-09','9-10','9-11'].includes(id.slice(0,4));
export const grade9Family = id=>id.slice(0,4);
const bound=(x,a,b)=>Math.min(b,Math.max(a,x));
const nice=x=>Number.isFinite(x)?Number(x.toFixed(3)):'—';
export function grade9Schema(id){
 if(!isGrade9Mode(id))throw Error('Không có Lab Toán 9: '+id);
 const family=grade9Family(id);
 if(id==='9-05-C01')return [{key:'r',label:'Bán kính R',min:1,max:5,step:.1},{key:'theta',label:'Góc ở tâm (độ)',min:25,max:180,step:1}];
 if(id==='9-05-C04')return [{key:'r',label:'Bán kính ngoài R',min:1,max:5,step:.1},{key:'theta',label:'Góc ở tâm hình quạt (độ)',min:20,max:300,step:1},{key:'inner',label:'Tỉ lệ bán kính trong r/R',min:.2,max:.85,step:.05}];
 const r={
  '9-02':[['a','Mốc a',-5,5,1],['b','Mốc b',-5,8,1]],
  '9-03':[['a','Cạnh kề góc A',1,9,.2],['b','Cạnh đối góc A',1,9,.2]],
  '9-04':[['h','Chiều cao (m)',2,12,.2],['d','Khoảng cách (m)',3,14,.2]],
  '9-05':[['r','Bán kính R',1,5,.1],['theta','Góc ở tâm (độ)',25,175,1]],
  '9-07':[['r','Bán kính R',1,5,.1],['theta','Số đo cung AB (độ)',30,160,1],['n','Số đỉnh đa giác',3,10,1]],
  '9-09':[['r','Bán kính r',.8,5,.1],['h','Chiều cao h',1,9,.2]],
  '9-10':[['r','Bán kính r',.8,5,.1],['h','Chiều cao h',1,9,.2]],
  '9-11':[['r','Bán kính R',1,5,.1],['d','Khoảng cách tâm–mặt phẳng',0,4.5,.1]],
  '9-12':[['n1','Nhóm A',0,20,1],['n2','Nhóm B',0,20,1],['n3','Nhóm C',0,20,1],['n4','Nhóm D',0,20,1]],
  '9-13':[['sides','Số kết quả đồng khả năng',2,12,1],['wanted','Số kết quả thuận lợi',1,12,1]]
 }[family];return r.map(([key,label,min,max,step])=>({key,label,min,max,step}));
}
export function grade9Defaults(id){
 if(!isGrade9Mode(id))throw Error('Không có Lab Toán 9');
 if(id==='9-05-C04')return {r:3,theta:120,inner:.55};
 return structuredClone({
 '9-02':{a:-1,b:3},'9-03':{a:4,b:3},'9-04':{h:6,d:9},'9-05':{r:3,theta:95},
 '9-07':{r:3,theta:92,n:6},'9-09':{r:2,h:4},'9-10':{r:2,h:4},
 '9-11':{r:3,d:1},'9-12':{n1:6,n2:9,n3:5,n4:10},'9-13':{sides:6,wanted:2}
 }[grade9Family(id)]);
}
export function grade9Valid(id,p){
 if(!isGrade9Mode(id))return false;
 const schema=grade9Schema(id);
 return schema.every(x=>Number.isFinite(p[x.key])&&p[x.key]>=x.min-1e-9&&p[x.key]<=x.max+1e-9)
 && !(grade9Family(id)==='9-13'&&p.wanted>p.sides)
 && !(grade9Family(id)==='9-11'&&p.d<0)
 && !(grade9Family(id)==='9-12'&&p.n1+p.n2+p.n3+p.n4===0);
}
export function grade9TriangleCenters(p){
 const z=p.r/3,A=[-2.2*z,-1.2*z],B=[2.25*z,-1.2*z],C=[.55*z,2.15*z];
 const sq=P=>P[0]*P[0]+P[1]*P[1];const dist=(P,Q)=>Math.hypot(P[0]-Q[0],P[1]-Q[1]);
 const det=2*(A[0]*(B[1]-C[1])+B[0]*(C[1]-A[1])+C[0]*(A[1]-B[1]));
 const u=[(sq(A)*(B[1]-C[1])+sq(B)*(C[1]-A[1])+sq(C)*(A[1]-B[1]))/det,(sq(A)*(C[0]-B[0])+sq(B)*(A[0]-C[0])+sq(C)*(B[0]-A[0]))/det];
 const a=dist(B,C),b=dist(A,C),c=dist(A,B),perim=a+b+c;
 const i=[(a*A[0]+b*B[0]+c*C[0])/perim,(a*A[1]+b*B[1]+c*C[1])/perim];
 const rho=Math.abs((B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0]))/perim;
 return {A,B,C,O:u,I:i,R:dist(u,A),r:rho,sides:{a,b,c},perimeter:perim};
}
export function grade9Math(id,p){
 const family=grade9Family(id);if(!isGrade9Mode(id))throw Error('Chế độ không xác định');
 const res={values:[],latex:'',result:null};const set=(formula,...values)=>{res.latex=formula;res.values=values.map(([key,x])=>`${key}: ${nice(x)}`);};
 if(family==='9-02'){const a=p.a,b=p.b; const lo=a,hi=b,empty=lo>hi;
  if(id.endsWith('01'))set(String.raw`x\ge ${a}`,['Mốc biên',a]);
  else if(empty)set(String.raw`[${a};+\infty)\cap(-\infty;${b}]=\varnothing`,['Không có nghiệm chung',0]);
  else set(String.raw`${lo}\le x\le ${hi}`,['Biên trái',lo],['Biên phải',hi]);
  res.result={lo,hi,empty};
 }else if(family==='9-03'){const c=Math.hypot(p.a,p.b),alpha=Math.atan2(p.b,p.a)*180/Math.PI;
  set(String.raw`\sin A=\frac{${nice(p.b)}}{${nice(c)}},\quad\cos A=\frac{${nice(p.a)}}{${nice(c)}}`,['Góc A (°)',alpha],['Cạnh huyền',c],['sin A',p.b/c],['cos A',p.a/c],['tan A',p.b/p.a],['cot A',p.a/p.b]);
  res.result={c,alpha,sin:p.b/c,cos:p.a/c,tan:p.b/p.a,cot:p.a/p.b};
 }else if(family==='9-04'){const alpha=Math.atan2(p.h,p.d)*180/Math.PI;
  set(String.raw`\tan\alpha=\frac{h}{d},\quad h=d\tan\alpha`,['Góc nâng (°)',alpha],[id.endsWith('02')?'Chiều rộng qua sông (m)':'Chiều cao (m)',p.h],['Khoảng cách đo (m)',p.d]);res.result={alpha};
 }else if(family==='9-05'&&id==='9-05-C04'){const annulus=Math.PI*p.r*p.r*(1-p.inner*p.inner),sector=Math.PI*p.r*p.r*p.theta/360;
  set(String.raw`S_{\text{quạt}}=\frac{\theta}{360^\circ}\pi R^2,\quad S_{\text{vành khuyên}}=\pi(R^2-r^2)`,['Góc quạt (°)',p.theta],['Diện tích quạt tròn',sector],['Bán kính ngoài R',p.r],['Bán kính trong r',p.r*p.inner],['Diện tích vành khuyên',annulus]);res.result={annulus,sector};
 }else if(family==='9-05'){const th=p.theta*Math.PI/180,arc=p.r*th,sector=.5*p.r*p.r*th,chord=2*p.r*Math.sin(th/2);
  set(String.raw`\ell=\frac{\theta}{360^\circ}2\pi R,\quad S=\frac{\theta}{360^\circ}\pi R^2`,['Độ dài cung',arc],['Dây cung AB',chord],['Diện tích quạt',sector],['Diện tích vành khuyên',Math.PI*p.r*p.r*(1-.55*.55)]);res.result={arc,sector,chord};
 }else if(family==='9-07'){
  const variant=Number(id.slice(-2)),theta=p.theta;
  if(variant<=2){set(String.raw`\angle AMB=\frac12\angle AOB`,['Góc ở tâm (°)',theta],['Góc nội tiếp (°)',theta/2]);res.result={inner:theta/2};}
  else if(variant===3){const t=grade9TriangleCenters(p);set(String.raw`R=\frac{abc}{4S_{\triangle ABC}}`,['Bán kính ngoại tiếp',t.R],['OA=OB=OC',t.R]);res.result=t;}
  else if(variant===4){const t=grade9TriangleCenters(p);set(String.raw`r=\frac{S_{\triangle ABC}}{p}`,['Bán kính nội tiếp',t.r],['Khoảng cách từ I đến mỗi cạnh',t.r]);res.result=t;}
  else if(variant===5){set(String.raw`\angle A+\angle C=180^\circ`,['Tổng góc đối A+C (°)',180],['Tổng góc đối B+D (°)',180]);res.result={opposite:180};}
  else {const alpha=180-360/p.n,rin=p.r*Math.cos(Math.PI/p.n);set(String.raw`\alpha=\frac{(n-2)180^\circ}{n}`,['Số cạnh',p.n],['Góc trong (°)',alpha],['Góc ngoài (°)',360/p.n],['Bán kính nội tiếp',rin]);res.result={polyAngle:alpha,inradius:rin};}
 }else if(family==='9-09'){const surface=2*Math.PI*p.r*p.h,volume=Math.PI*p.r**2*p.h;
  set(String.raw`S_{xq}=2\pi rh,\quad V=\pi r^2h`,['Chu vi đáy',2*Math.PI*p.r],['Diện tích xung quanh',surface],['Thể tích',volume]);res.result={surface,volume};
 }else if(family==='9-10'){const l=Math.hypot(p.r,p.h),area=Math.PI*p.r*l,vol=Math.PI*p.r**2*p.h/3;
  set(String.raw`\ell=\sqrt{r^2+h^2},\quad S_{xq}=\pi r\ell,\quad V=\frac13\pi r^2h`,['Đường sinh',l],['Góc quạt khai triển (°)',360*p.r/l],['Diện tích xung quanh',area],['Thể tích',vol]);res.result={l,area,vol};
 }else if(family==='9-11'){const area=4*Math.PI*p.r*p.r,volume=4*Math.PI*p.r**3/3,crossR=p.d<=p.r?Math.sqrt(Math.max(0,p.r*p.r-p.d*p.d)):0;
  set(id==='9-11-C03'?String.raw`r_{\text{cắt}}=\sqrt{R^2-d^2}\quad(0\le d\le R),\quad S=4\pi R^2,\quad V=\frac43\pi R^3`:String.raw`S=4\pi R^2,\quad V=\frac43\pi R^3`,['Diện tích mặt cầu',area],['Thể tích hình cầu',volume],['Bán kính thiết diện [mở rộng trực quan]',crossR]);
  if(id==='9-11-C03')res.values.push(`[Mở rộng trực quan Bài 32] Vị trí mặt phẳng cắt: ${Math.abs(p.d)<1e-6?'d = 0 → đường tròn lớn r = R':Math.abs(p.d-p.r)<1e-6?'d = R → tiếp xúc tại 1 điểm H (r = 0)':p.d<p.r?'0 < d < R → đường tròn mặt cắt r = √(R² − d²)':'d > R → mặt phẳng không giao với mặt cầu'}`);
  res.result={area,volume,crossR,validCut:p.d>=0&&p.d<=p.r,cutState:Math.abs(p.d-p.r)<1e-6?'tangent':p.d<p.r?'secant':'disjoint'};
 }else if(family==='9-12'){const data=[p.n1,p.n2,p.n3,p.n4],total=data.reduce((a,b)=>a+b,0);
  set(String.raw`f_i=\frac{n_i}{N},\quad\sum_i f_i=1`,['Tổng N',total],...data.map((n,i)=>[`Nhóm ${'ABCD'[i]} (%)`,total?100*n/total:0]));res.result={data,total,proportions:data.map(n=>n/total)};
 }else if(family==='9-13'){const pair=id==='9-13-C02',probability=pair?(p.wanted/p.sides)**2:p.wanted/p.sides;
  if(pair)set(String.raw`P(A)=\frac{m^2}{n^2}=\frac{${p.wanted}^2}{${p.sides}^2}`,['Cặp kết quả đồng khả năng',p.sides*p.sides],['Số cặp thuận lợi',p.wanted*p.wanted],['Xác suất lý thuyết',probability]);
  else set(String.raw`P(A)=\frac{m}{n}=\frac{${p.wanted}}{${p.sides}}`,['Kết quả đồng khả năng',p.sides],['Số thuận lợi',p.wanted],['Xác suất lý thuyết',probability]);
  res.result={probability,pair};}
 return res;
}
export function grade9SolidModel(id,p,t=0){
 if(!grade9Solid(id))throw Error('Không phải Lab khối 3D');
 const family=grade9Family(id),type=family==='9-09'?'cylinder':family==='9-10'?'cone':id==='9-11-C03'?'sphereSection':'sphere';
 const turn=Number.isFinite(t)?t:0;
 return {id:'gd4_'+id,grade:9,title:id,type,params:type==='sphereSection'?{r:p.r,d:p.d,turn,modeId:id}:type==='sphere'?{r:p.r,d:p.d,turn,variant:id==='9-11-C02'?'solid':'surface',modeId:id}:{r:p.r,h:p.h,turn,modeId:id},custom:false};
}
function hash32(x){x|=0;x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}
/** Seeded, repeatable mathematical pseudo-random experiment: never claim true RNG. */
export function grade9Experiment(id,p,count=100,seed=20260926){
 if(!isGrade9Mode(id)||grade9Family(id)!=='9-13')throw Error('Không phải phép thử');
 const {sides,wanted}=p,pair=id==='9-13-C02';let v=seed>>>0,hits=0;const outcomes=[];
 for(let i=0;i<count;i++){v=hash32((v+0x9e3779b9)>>>0);const a=1+(v%sides);
  if(pair){v=hash32((v+0x9e3779b9)>>>0);const b=1+(v%sides);if(a<=wanted&&b<=wanted)hits++;if(i>=Math.max(0,count-24))outcomes.push(`${a}-${b}`);}
  else{if(a<=wanted)hits++;if(i>=Math.max(0,count-24))outcomes.push(a);}}
 return {hits,tries:count,relative:count?hits/count:0,theoretical:pair?(wanted/sides)**2:wanted/sides,outcomes};
}
