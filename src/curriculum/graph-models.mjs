/** Pure mathematical graph models; this file is independently unit-tested. */
export const GRAPH_FAMILIES=Object.freeze(['8-07','9-01','9-08','10-06','11-02','11-11','11-12','12-01','12-02','12-06']);
const supportedCount={'8-07':3,'9-01':3,'9-08':5,'10-06':3,'11-02':4,'11-11':3,'11-12':4,'12-01':4,'12-02':4,'12-06':3};
export const isGraphCase=id=>GRAPH_FAMILIES.some(prefix=>id.startsWith(prefix+'-C')&&Number(id.split('-C')[1])<=(supportedCount[prefix]||0)&&(prefix!=='12-06'||['12-06-C02','12-06-C03'].includes(id)));
const r=n=>Math.round(n*1000)/1000;
export function graphDefaults(id){if(!isGraphCase(id))throw Error('Không có đồ thị tương tác');
 const [grade,family]=id.split('-');const n=Number(id.split('-C')[1]);const key=`${grade}-${family}`;
 if(key==='8-07')return {a:n===2?-1.2:1.3,b:1,c:-.7,d:2};
 if(key==='9-01')return {a:1,b:1,c:n===1?-1.3:1,d:n===3?1:3};
 if(key==='9-08')return n===4||n===5?{a:1,b:-3,c:2}:{a:n===2?-1.3:1.3};
 if(key==='10-06')return {a:n===2?-1:1,b:-2,c:-1};
 if(key==='11-02')return {amplitude:1,frequency:1};
 if(key==='11-11')return {base:2};
 if(key==='11-12')return {x0:1,h:.75};
 if(key==='12-01')return {a:1,b:-3,c:0};
 if(key==='12-02')return {a:2,b:1,c:1,d:-1};
 if(key==='12-06')return {n:10,b:1};
 throw Error('Không có cấu hình');
}
export function graphParamSchema(id){
 const s={a:['Hệ số a',-3,3,.1],b:['Hệ số b',-4,4,.1],c:['Hệ số c',-4,4,.1],d:['Hệ số d',-4,4,.1],amplitude:['Biên độ',.25,3,.05],frequency:['Hệ số góc/tần số',.5,2.5,.1],base:['Cơ số a (a > 0, a ≠ 1)',.3,3,.1],x0:['Hoành độ tiếp điểm',-2.5,2.5,.1],h:['Độ tăng Δx',.05,2,.05],n:['Số hình chữ nhật',2,48,1]};
 const key=id.split('-C')[0];let ids=[];
 if(key==='8-07')ids=['a','b','c','d'];
 else if(key==='9-01')ids=['a','b','c','d'];
 else if(key==='9-08')ids=Number(id.split('-C')[1])>=4?['a','b','c']:['a'];
 else if(key==='10-06')ids=['a','b','c'];
 else if(key==='11-02')ids=['amplitude','frequency'];
 else if(key==='11-11')ids=['base'];
 else if(key==='11-12')ids=['x0','h'];
 else if(key==='12-01')ids=['a','b','c'];
 else if(key==='12-02')ids=Number(id.split('-C')[1])===3?['d']:Number(id.split('-C')[1])===4?['b','d']:['a','b','c','d'];
 else if(key==='12-06')ids=['n'];
 return ids.map(key=>({key,label:s[key][0],min:s[key][1],max:s[key][2],step:s[key][3]}));
}
const series=(name,fn,color,dashed=false)=>({name,evaluate:fn,color,dashed});
export function graphExperiment(id,p=graphDefaults(id)){
 if(!isGraphCase(id))throw Error('Đồ thị chưa được dựng');
 const prefix=id.split('-C')[0],mode=Number(id.split('-C')[1]);
 const out={id,domain:[-5,5],range:[-5,5],series:[],markers:[],asymptotes:[],summary:'',latex:'',shading:null,check:true};
 if(prefix==='8-07'){
  out.series=[series(mode===3?'d₁: y=a₁x+b₁':'y=ax+b',x=>p.a*x+p.b,'#1D4ED8')];
  if(mode===3)out.series.push(series('d₂: y=a₂x+b₂',x=>p.c*x+p.d,'#B45309'));
  out.latex=mode===2?'m=a':mode===3?String.raw`d_1: y=a_1x+b_1,\ d_2: y=a_2x+b_2;\quad d_1\parallel d_2 \Leftrightarrow a_1=a_2,\ b_1\ne b_2`:'y=ax+b';
  out.summary=mode===2?`Hệ số góc a = ${r(p.a)}; cắt Oy tại b = ${r(p.b)}`:mode===3?(Math.abs(p.a-p.c)<1e-8?Math.abs(p.b-p.d)<1e-8?'Hai đường d₁, d₂ trùng nhau (a₁ = a₂, b₁ = b₂)':'Hai đường d₁, d₂ song song (a₁ = a₂, b₁ ≠ b₂)':'Hai đường d₁, d₂ cắt nhau (a₁ ≠ a₂)'):'Kéo a, b để tịnh tiến và quay đường thẳng.';
  return out;
 }
 if(prefix==='9-01'){
  // R82 semantic colors: Đường 1 xanh dương (#1D4ED8), đường 2 xanh lá (#15803D, nét đứt khi trùng nhau), giao điểm tím (#6D28D9)
  const determinant=p.a-p.c,isSame=Math.abs(determinant)<1e-8&&Math.abs(p.b-p.d)<1e-8;
  out.series=[series('d₁: y = a₁x + b₁',x=>p.a*x+p.b,'#1D4ED8'),series('d₂: y = a₂x + b₂',x=>p.c*x+p.d,'#15803D',isSame)];
  let status;
  if(Math.abs(determinant)>1e-8){const x=(p.d-p.b)/determinant;status=`Một nghiệm duy nhất: (${r(x)}; ${r(p.a*x+p.b)})`;out.markers.push({x,y:p.a*x+p.b,name:'Nghiệm',color:'#6D28D9'});}
  else status=isSame?'Vô số nghiệm (hai đường thẳng trùng nhau d₁ ≡ d₂)':'Vô nghiệm (hai đường thẳng song song d₁ ∥ d₂)';
  out.summary=status;
  out.check=mode===1?Math.abs(determinant)>1e-8:mode===2?Math.abs(determinant)<1e-8&&Math.abs(p.b-p.d)>1e-8:isSame;
  out.latex='\\begin{cases}y=ax+b\\\\y=cx+d\\end{cases}';return out;
 }
 if(prefix==='9-08'){
  if(mode>=4){
   const delta=p.b*p.b-4*p.a*p.c;out.series=[series('y = ax² + bx + c',x=>p.a*x*x+p.b*x+p.c,'#1D4ED8')];
   if(Math.abs(p.a)<1e-9){out.check=false;out.summary='a phải khác 0 để được phương trình bậc hai';return out;}
   if(delta>=0){const root=Math.sqrt(delta),x1=(-p.b-root)/(2*p.a),x2=(-p.b+root)/(2*p.a);
    out.markers.push({x:x1,y:0,name:'Nghiệm 1',color:mode===5?'#1D4ED8':'#6D28D9'});
    if(delta>1e-10)out.markers.push({x:x2,y:0,name:'Nghiệm 2',color:mode===5?'#15803D':'#6D28D9'});
    out.summary=mode===5?`Viète: x₁+x₂ = ${r(x1+x2)} = -b/a; x₁·x₂ = ${r(x1*x2)} = c/a.`:`Δ=${r(delta)}; ${delta>1e-10?'hai nghiệm phân biệt':'một nghiệm kép'} tại các giao điểm với Ox.`;
   }else out.summary=`Δ=${r(delta)} < 0: đồ thị không cắt Ox, phương trình vô nghiệm thực.`;
   out.latex=mode===5?String.raw`x_1+x_2=-\frac{b}{a},\quad x_1x_2=\frac{c}{a}`:String.raw`\Delta=b^2-4ac,\quad x_{1,2}=\frac{-b\pm\sqrt{\Delta}}{2a}`;return out;
  }
  out.series=[series('y = ax²',x=>p.a*x*x,'#1D4ED8')];
  out.summary=Math.abs(p.a)<1e-8?'a = 0 không còn là parabol':p.a>0?'Parabol mở lên, trục Oy là trục đối xứng':'Parabol mở xuống, trục Oy là trục đối xứng';
  out.check=mode===1?p.a>0:mode===2?p.a<0:Math.abs(p.a)>1e-8;
  out.latex='y=ax^2\\quad(a\\ne0)';out.markers.push({x:0,y:0,name:'O',color:mode===2?'#6D28D9':'#1D4ED8'});return out;
 }
 if(prefix==='10-06'){
  const v=Math.abs(p.a)<1e-8?null:-p.b/(2*p.a),y=v===null?null:p.a*v*v+p.b*v+p.c,delta=p.b*p.b-4*p.a*p.c;
  out.series=[series('y=ax²+bx+c',x=>p.a*x*x+p.b*x+p.c,'#1D4ED8')];
  if(mode===1||mode===2){
   out.series.push(series(mode===2?'Tham chiếu y=-x²':'Tham chiếu y=x²',x=>(mode===2?-1:1)*x*x,'#15803D',true));
  }
  if(v!==null){
   out.markers.push({x:v,y,name:'Đỉnh I',color:'#6D28D9'});
   out.markers.push({x:0,y:p.c,name:'Giao Oy',color:'#15803D'});
   if(delta>1e-8){
    const rt=Math.sqrt(delta),x1=(-p.b-rt)/(2*p.a),x2=(-p.b+rt)/(2*p.a);
    out.markers.push({x:x1,y:0,name:'x₁',color:'#6D28D9'},{x:x2,y:0,name:'x₂',color:'#6D28D9'});
   }else if(Math.abs(delta)<=1e-8){
    out.markers.push({x:v,y:0,name:'Nghiệm kép',color:'#6D28D9'});
   }
  }
  const rootNote=delta>1e-8?'Δ > 0 (cắt Ox tại 2 điểm phân biệt)':Math.abs(delta)<=1e-8?'Δ = 0 (tiếp xúc Ox tại đỉnh)':'Δ < 0 (không cắt Ox)';
  if(Math.abs(p.a)<1e-8){out.summary='a = 0 không còn là hàm số bậc hai (parabol suy biến thành đường thẳng)';}
  else if(mode===1&&p.a<=0){out.summary='Chế độ 10-06-C01 khảo sát parabol mở lên (yêu cầu a > 0). Hãy chọn a > 0.';}
  else if(mode===2&&p.a>=0){out.summary='Chế độ 10-06-C02 khảo sát parabol mở xuống (yêu cầu a < 0). Hãy chọn a < 0.';}
  else{out.summary=`Đỉnh I(${r(v)}; ${r(y)}); trục đối xứng x = ${r(v)}; ${p.a>0?'mở lên (GTNN y_I)':'mở xuống (GTLN y_I)'}; Δ = ${r(delta)} → ${rootNote}.`;}
  out.check=mode===1?p.a>0:mode===2?p.a<0:Math.abs(p.a)>1e-8;
  out.latex=mode===3?String.raw`x_I=-\frac{b}{2a},\quad \Delta=b^2-4ac`:String.raw`y=ax^2+bx+c,\quad I\left(-\frac{b}{2a};\;-\frac{\Delta}{4a}\right)`;return out;
 }
 if(prefix==='11-02'){
  const fn=[Math.sin,Math.cos,Math.tan,x=>Math.cos(x)/Math.sin(x)][mode-1],label=['sin','cos','tan','cot'][mode-1];
  out.domain=[-2*Math.PI,2*Math.PI];out.range=mode<=2?[-3.2,3.2]:[-4,4];
  out.series=[series(`y=A ${label}(kx)`,x=>p.amplitude*fn(p.frequency*x),'#1D4ED8')];
  if(mode<=2&&(Math.abs(p.amplitude-1)>1e-4||Math.abs(p.frequency-1)>1e-4)){
   out.series.push(series(`Chuẩn y=${label}(x)`,x=>fn(x),'#047857',true));
  }
  if(mode===3||mode===4){
   const xs=[];
   for(let n=-14;n<=14;n++){
    const x=mode===3?(Math.PI/2+n*Math.PI)/p.frequency:n*Math.PI/p.frequency;
    if(x>out.domain[0]&&x<out.domain[1])xs.push(x);
   }
   out.asymptotes=xs.map(value=>({type:'vertical',value}));
  }
  out.latex=mode<=2?'T=\\frac{2\\pi}{|k|}':'T=\\frac{\\pi}{|k|}';
  out.summary=`${label}: ${mode<=2?'Chu kỳ 2π/|k|':'Chu kỳ π/|k|'}; ${mode<=2?'giá trị trong [−A; A]':'không xác định tại các điểm tiệm cận đứng'}.`;
  return out;
 }
 if(prefix==='11-11'){
  out.domain=[-4,4];out.range=[-4,5];
  const valid=p.base>0&&Math.abs(p.base-1)>1e-8;
  if(!valid){out.check=false;out.summary='Cơ số phải dương và khác 1';return out;}
  if(mode===1||mode===3)out.series.push(series('y=aˣ',x=>Math.pow(p.base,x),'#1D4ED8'));
  if(mode===2||mode===3)out.series.push(series('y=logₐx',x=>x>0?Math.log(x)/Math.log(p.base):NaN,'#047857'));
  if(mode===3)out.series.push(series('y=x',x=>x,'#64748B',true));
  if(mode===1){
   out.asymptotes=[{type:'horizontal',value:0}];
   out.markers.push({x:0,y:1,name:'(0;1)',color:'#6D28D9'},{x:1,y:p.base,name:'(1;a)',color:'#047857'});
  }else if(mode===2){
   out.asymptotes=[{type:'vertical',value:0}];
   out.markers.push({x:1,y:0,name:'(1;0)',color:'#6D28D9'},{x:p.base,y:1,name:'(a;1)',color:'#1D4ED8'});
  }else if(mode===3){
   out.markers.push({x:0,y:1,name:'M₀',color:'#1D4ED8'},{x:1,y:0,name:'N₀',color:'#047857'});
  }
  out.latex='y=a^x,\\quad y=\\log_a x,\\quad a>0,\\ a\\ne1';
  out.summary=p.base>1?'Cơ số a > 1: cả hai hàm đồng biến':'Cơ số 0 < a < 1: cả hai hàm nghịch biến';return out;
 }
 if(prefix==='11-12'&&mode===4){
  out.domain=[-3,3];out.range=[-7,7];out.series=[series('f(x)=x³',x=>x**3,'#1D4ED8'),series("f′(x)=3x²",x=>3*x*x,'#047857'),series("f″(x)=6x",x=>6*x,'#6D28D9')];
  out.markers=[{x:p.x0,y:6*p.x0,name:'f″(x₀)',color:'#6D28D9'}];out.latex=String.raw`f(x)=x^3,\quad f'(x)=3x^2,\quad f''(x)=6x`;out.summary=`Đạo hàm cấp hai tại x₀ = ${r(p.x0)}: f″(x₀) = ${r(6*p.x0)}.`;return out;
 }
 if(prefix==='11-12'){
  const f=x=>x*x,derivative=2*p.x0,safeH=Math.abs(p.h)<1e-4?0.05:p.h;
  const secant=(f(p.x0+safeH)-f(p.x0))/safeH;
  out.series=[series('y=x²',f,'#1D4ED8')];
  if(mode===1||mode===2){
   const slope=mode===1?derivative:secant;
   out.series.push(series(mode===1?'Tiếp tuyến':'Cát tuyến',x=>f(p.x0)+slope*(x-p.x0),'#B45309'));
   if(mode===2)out.series.push(series('Tiếp tuyến giới hạn',x=>f(p.x0)+derivative*(x-p.x0),'#6D28D9',true));
   out.markers.push({x:p.x0,y:f(p.x0),name:'M',color:'#6D28D9'});
   if(mode===2)out.markers.push({x:p.x0+safeH,y:f(p.x0+safeH),name:'Q',color:'#047857'});
  }
  else{out.series.push(series("y'=2x",x=>2*x,'#047857'));out.markers.push({x:p.x0,y:f(p.x0),name:`f(x₀)=${r(f(p.x0))}`,color:'#1D4ED8'},{x:p.x0,y:derivative,name:`f′(x₀)=${r(derivative)}`,color:'#6D28D9'});}
  out.latex=mode===2?'\\frac{f(x_0+h)-f(x_0)}{h}\\to f\\prime(x_0)':mode===3?'(x^n)\\prime=nx^{n-1},\\quad f(x)=x^2\\implies f\\prime(x)=2x':'f(x)=x^2,\\quad f\\prime(x)=2x';
  out.summary=mode===2?`Hệ số góc cát tuyến ${r(secant)}; khi h → 0 sẽ tiến tới ${r(derivative)}`:mode===1?`Hệ số góc tiếp tuyến f′(x₀) = ${r(derivative)}`:`[Bài 32 — Quy tắc tính đạo hàm] Áp dụng (xⁿ)′ = nxⁿ⁻¹: với f(x) = x² ⇒ f′(x) = 2x. Tại x₀ = ${r(p.x0)}: f(x₀) = ${r(f(p.x0))}, đạo hàm f′(x₀) = 2·(${r(p.x0)}) = ${r(derivative)}.`;return out;
 }
 if(prefix==='12-01'){
  const f=x=>p.a*x*x*x+p.b*x+p.c,df=x=>3*p.a*x*x+p.b;
  out.series=[series('f(x)',f,'#1D4ED8')];
  if(mode===1||mode===4)out.series.push(series("f'(x)",df,'#15803D'));
  const stationary=p.a!==0&&-p.b/(3*p.a)>0?Math.sqrt(-p.b/(3*p.a)):null;
  if(stationary!==null){
   for(const x of [-stationary,stationary]){
    out.markers.push({x,y:f(x),name:df(x-0.1)>0?'CĐ':'CT',color:'#7C3AED'});
    if(mode===1)out.markers.push({x,y:0,name:"f'=0",color:'#C2410C'});
   }
   if(mode===2){
    out.series.push(series('Tiếp tuyến cực trị 1',()=>f(-stationary),'#C2410C',true));
    out.series.push(series('Tiếp tuyến cực trị 2',()=>f(stationary),'#C2410C',true));
   }
  }
  if(mode===2||mode===4)out.markers.push({x:0,y:p.c,name:'U(0;c)',color:'#7C3AED'});
  if(mode===4&&p.a!==0)out.series.push(series("f''(x)=6ax",x=>6*p.a*x,'#C2410C',true));
  if(mode===3){
   out.domain=[-2.2,2.2];
   out.asymptotes=[{type:'vertical',value:-2},{type:'vertical',value:2}];
   const candidates=[-2,2,...(stationary===null?[]:[-stationary,stationary].filter(x=>x>=-2&&x<=2))];
   const ys=candidates.map(f),minY=Math.min(...ys),maxY=Math.max(...ys);
   const xMin=candidates[ys.indexOf(minY)],xMax=candidates[ys.indexOf(maxY)];
   out.markers.push({x:xMax,y:maxY,name:'GTLN',color:'#7C3AED'},{x:xMin,y:minY,name:'GTNN',color:'#15803D'});
   out.summary=`Trên đoạn [−2; 2]: GTNN = ${r(minY)} tại x = ${r(xMin)}, GTLN = ${r(maxY)} tại x = ${r(xMax)}.`;
  }
  else out.summary=stationary===null?'Không có hai cực trị phân biệt với các tham số hiện tại (f′(x) không đổi dấu).':`Các điểm dừng x = ±${r(stationary)}; đạo hàm f′(x) = 3ax² + b; tâm đối xứng U(0; ${r(p.c)}).`;
  out.latex='f(x)=ax^3+bx+c,\\quad f\\prime(x)=3ax^2+b';return out;
 }
 if(prefix==='12-02'){
  if(mode===1){
   const f=x=>p.a*x*x*x+p.b*x*x+p.c*x+p.d,df=x=>3*p.a*x*x+2*p.b*x+p.c;
   out.series=[series('Hàm bậc ba',f,'#1D4ED8')];
   if(Math.abs(p.a)>1e-6){
    const xU=-p.b/(3*p.a),yU=f(xU),kU=df(xU);
    out.markers.push({x:xU,y:yU,name:'U (Uốn)',color:'#7C3AED'});
    out.series.push(series('Tiếp tuyến tại U',x=>yU+kU*(x-xU),'#C2410C',true));
    const deltaP=p.b*p.b-3*p.a*p.c;
    if(deltaP>1e-6){
     const x1=(-p.b-Math.sqrt(deltaP))/(3*p.a),x2=(-p.b+Math.sqrt(deltaP))/(3*p.a);
     out.markers.push({x:x1,y:f(x1),name:'Cực trị 1',color:'#15803D'},{x:x2,y:f(x2),name:'Cực trị 2',color:'#15803D'});
    }
    out.summary=`Đồ thị bậc ba có tâm đối xứng U(${r(xU)}; ${r(yU)}), Δ' = ${r(deltaP)}.`;
   }else{
    out.summary='Khi a = 0, hàm suy biến về bậc hai hoặc bậc nhất.';
   }
   out.latex='y=ax^3+bx^2+cx+d,\\quad x_U=-\\frac{b}{3a}';
  }else if(mode===2){
   if(Math.abs(p.c)<1e-8){out.check=false;out.summary='Hệ số c phải khác 0';return out;}
   const xAsym=-p.d/p.c,yAsym=p.a/p.c,det=p.a*p.d-p.b*p.c;
   out.series=[series('Hàm phân thức',x=>(p.a*x+p.b)/(p.c*x+p.d),'#1D4ED8')];
   out.asymptotes=[{type:'vertical',value:xAsym},{type:'horizontal',value:yAsym}];
   out.summary=`Tiệm cận đứng x = ${r(xAsym)}; ngang y = ${r(yAsym)} (nếu không triệt tiêu).`;
   out.latex='y=\\frac{ax+b}{cx+d},\\quad ad-bc='+r(det);
   if(Math.abs(det)<1e-8){
    out.summary+=' Lưu ý: phân thức rút gọn thành hằng số, vị trí bị khuyết không phải tiệm cận đứng.';
    out.asymptotes=[{type:'horizontal',value:yAsym}];
    out.markers.push({x:xAsym,y:yAsym,name:'Điểm khuyết',color:'#B91C1C'});
   }else{
    out.markers.push({x:xAsym,y:yAsym,name:'Tâm I',color:'#7C3AED'});
   }
  }else if(mode===3){
   out.series=[series('y=1/(x−d)',x=>1/(x-p.d),'#1D4ED8')];
   out.asymptotes=[{type:'vertical',value:p.d},{type:'horizontal',value:0}];
   out.markers.push({x:p.d,y:0,name:`I(${r(p.d)};0)`,color:'#7C3AED'});
   out.latex='x=d\\text{ là tiệm cận đứng},\\quad y=0\\text{ là tiệm cận ngang}';
   out.summary=`Tiệm cận đứng x = ${r(p.d)}; tiệm cận ngang y = 0; tâm đối xứng I(${r(p.d)}; 0).`;
  }else{
   const f=x=>x+p.b+2/(x-p.d),s2=Math.SQRT2;
   out.series=[series('Phân thức bậc hai/bậc nhất',f,'#1D4ED8')];
   out.asymptotes=[{type:'vertical',value:p.d},{type:'oblique',slope:1,offset:p.b}];
   out.markers.push({x:p.d,y:p.d+p.b,name:'Giao TC I',color:'#7C3AED'},{x:p.d-s2,y:f(p.d-s2),name:'CĐ',color:'#15803D'},{x:p.d+s2,y:f(p.d+s2),name:'CT',color:'#15803D'});
   out.latex='y=x+b+\\frac{2}{x-d}';
   out.summary=`Tiệm cận xiên y=x+${r(p.b)}; đứng x=${r(p.d)}; tâm đối xứng I(${r(p.d)}; ${r(p.d+p.b)}).`;
  }
  return out;
 }
 if(prefix==='12-06'){
  const n=Math.max(2,Math.round(p.n)),f=x=>x*x;
  out.domain=[-.4,1.6];out.range=[-.2,1.5];
  if(mode===2){
   const sn=Array.from({length:n},(_,i)=>f((i+.5)/n)/n).reduce((a,b)=>a+b,0),exact=1/3;
   out.series=[series('f(x)=x²',f,'#1D4ED8')];
   out.shading={from:0,to:1,n,low:x=>0,high:f};
   out.markers.push({x:0,y:0,name:'a=0',color:'#15803D'},{x:1,y:1,name:'b=1',color:'#7C3AED'});
   out.latex='\\int_0^1 x^2\\,dx=\\frac{1^3-0^3}{3}=\\frac{1}{3}';
   out.summary=`Xấp xỉ tổng Riemann (n=${n}): S_n ≈ ${r(sn)}; giá trị đúng 1/3 ≈ ${r(exact)} (sai số ${r(Math.abs(sn-exact))}).`;
  }else{
   out.series=[series('f(x)=x',x=>x,'#1D4ED8'),series('g(x)=x²',f,'#15803D')];
   out.shading={from:0,to:1,n,low:f,high:x=>x};
   out.markers.push({x:0,y:0,name:'O(0;0)',color:'#7C3AED'},{x:1,y:1,name:'A(1;1)',color:'#7C3AED'});
   out.latex='S=\\int_0^1 |x-x^2|\\,dx=\\int_0^1 (x-x^2)\\,dx=\\frac16';
   out.summary=`Diện tích giữa y=x và y=x² trên [0;1]: S = ∫₀¹ |x−x²| dx = 1/6 ≈ ${r(1/6)}.`;
  }
  return out;
 }
 throw Error('Không có hàm số');
}
