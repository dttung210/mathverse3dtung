export const clamp=(x,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(x))?Number(x):a));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const deg=d=>d*Math.PI/180;
export const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export function polygonPoints(variant,p){
  const a=clamp(p.a,1,9),b=clamp(p.b??3,1,9),angle=deg(p.rotation??0);
  let vertices=[];
  if(variant==='triangle'||variant==='square'||variant==='hexagon'){
    const n={triangle:3,square:4,hexagon:6}[variant];const R=variant==='hexagon'?a:a/(2*Math.sin(Math.PI/n));
    const start=variant==='triangle'?-Math.PI/2:variant==='square'?-Math.PI/4:-Math.PI/6;
    vertices=Array.from({length:n},(_,i)=>[R*Math.cos(start+i*2*Math.PI/n),R*Math.sin(start+i*2*Math.PI/n)]);
  }else if(variant==='rectangle'){vertices=[[-a/2,-b/2],[a/2,-b/2],[a/2,b/2],[-a/2,b/2]];}
  else if(variant==='rhombus'){vertices=[[0,-b/2],[a/2,0],[0,b/2],[-a/2,0]];}
  else if(variant==='parallelogram'){
    const sk=clamp(p.skew??1.3,-3,3);
    vertices=[[-a/2-sk/2,-b/2],[a/2-sk/2,-b/2],[a/2+sk/2,b/2],[-a/2+sk/2,b/2]];
  }else if(variant==='trapezoid'){
    const h=clamp(p.height??3,1,6);
    vertices=[[-a/2,-h/2],[a/2,-h/2],[b/2,h/2],[-b/2,h/2]];
  }
  const c=Math.cos(angle),s=Math.sin(angle);
  return vertices.map(([x,y])=>[x*c-y*s,x*s+y*c]);
}
export function polygonArea(pts){return Math.abs(pts.reduce((sum,p,i)=>{const q=pts[(i+1)%pts.length];return sum+p[0]*q[1]-q[0]*p[1];},0))/2;}
export function polygonPerimeter(pts){return pts.reduce((sum,p,i)=>sum+dist(p,pts[(i+1)%pts.length]),0);}
export function polygonMeasures(v,p){let pts=polygonPoints(v,p);return {vertices:pts,area:polygonArea(pts),perimeter:polygonPerimeter(pts)};}
export const scalarDot=(a,b)=>a[0]*b[0]+a[1]*b[1];
export const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
export function isCollinear(a,b,c,eps=1e-8){return Math.abs(cross([b[0]-a[0],b[1]-a[1]],[c[0]-a[0],c[1]-a[1]]))<eps;}
export const midpoint=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
export const reflectAxisX=(p,axis)=>[2*axis-p[0],p[1]];
export const reflectCenter=(p,c)=>[2*c[0]-p[0],2*c[1]-p[1]];
export function gcd(a,b){a=Math.abs(Math.round(a));b=Math.abs(Math.round(b));while(b){[a,b]=[b,a%b];}return a||1;}
export const fractionRatio=(n,d)=>clamp(n,0,Math.max(1,d))/Math.max(1,Math.round(d));
export function primeFactors(n){n=Math.round(clamp(n,2,9999));let result=[];for(let p=2;p*p<=n;p++){while(n%p===0){result.push(p);n/=p;}}if(n>1)result.push(n);return result;}
export function smallestFactor(n){n=Math.round(clamp(n,2,9999));for(let p=2;p*p<=n;p++)if(n%p===0)return p;return n;}
export function classifyAngle(x){x=clamp(x,0,180);if(Math.abs(x-90)<.001)return 'Góc vuông';if(Math.abs(x-180)<.001)return 'Góc bẹt';if(Math.abs(x)<.001)return 'Góc không';return x<90?'Góc nhọn':'Góc tù';}
export function clockAngle(hour,minute){const h=(hour%12)*30+minute/2,m=minute*6;let d=Math.abs(h-m)%360;return Math.min(d,360-d);}
export function outcomeLabels(variant){return ({spinner:['Đỏ','Xanh','Vàng','Tím','Cam','Lam'],dice:['1','2','3','4','5','6'],bag:['Đỏ','Xanh','Vàng'],coin:['Ngửa','Sấp'],rps:['Búa','Bao','Kéo']})[variant]||[];}
export function sampleOutcome(model,random=Math.random,currentParams=model?.defaults){let labels=outcomeLabels(model.variant);const size=model.variant==='spinner'?Math.round(clamp(currentParams?.segments??model.defaults.segments??6,2,6)):labels.length;return Math.min(size-1,Math.floor(Math.max(0,Math.min(.99999999,random()))*size));}
export function mathStats(model,state){const p=state?.params||model.defaults,v=model.variant;
  switch(model.engine){
    case 'polygon':{
      let m=polygonMeasures(v,p);
      if(v==='rectangle'){
        const a=clamp(p.a,1,9),b=clamp(p.b??3,1,9),diag=Math.hypot(a,b),half=diag/2;
        return `AB = CD = a = ${a.toFixed(2)} đv · AD = BC = b = ${b.toFixed(2)} đv · AC = BD = √(a²+b²) ≈ ${diag.toFixed(2)} đv · OA = OB = OC = OD ≈ ${half.toFixed(2)} đv · Chu vi ≈ ${m.perimeter.toFixed(2)} đv · Diện tích ≈ ${m.area.toFixed(2)} đv²`;
      }
      if(v==='rhombus'){
        const side=Math.hypot((p.a||5)/2,(p.b||3)/2),scope=Number(state?.lessonScope||0);
        if(scope===19)return `[Bài 19 — Nhận biết Hình thoi] 4 cạnh bằng nhau ≈ ${side.toFixed(2)} đv · Hai đường chéo d₁ = ${(p.a||5).toFixed(1)}, d₂ = ${(p.b||3).toFixed(1)} vuông góc tại trung điểm  ·  Chu vi ≈ ${m.perimeter.toFixed(2)} đv  ·  Diện tích ≈ ${m.area.toFixed(2)} đv²`;
        if(scope===20)return `[Bài 20 — Chu vi & Diện tích Hình thoi] Cạnh a ≈ ${side.toFixed(2)} đv · d₁ = ${(p.a||5).toFixed(1)}, d₂ = ${(p.b||3).toFixed(1)}  ·  Chu vi ≈ ${m.perimeter.toFixed(2)} đv  ·  Diện tích ≈ ${m.area.toFixed(2)} đv²`;
        return `Cạnh ≈ ${side.toFixed(2)} đv (4 cạnh bằng nhau, 2 đường chéo ⊥ — Bài 19)  ·  Chu vi ≈ ${m.perimeter.toFixed(2)} đv  ·  Diện tích ≈ ${m.area.toFixed(2)} đv² (Bài 20)`;
      }
      return `Chu vi ≈ ${m.perimeter.toFixed(2)} đv  ·  Diện tích ≈ ${m.area.toFixed(2)} đv²`;
    }
    case 'geometry': if(['angle','angletypes'].includes(v))return `Số đo góc ${Math.round(p.angle||0)}° · ${classifyAngle(p.angle||0)}`;
      if(v==='clock')return `Giữa hai kim: ${clockAngle(Math.round((p.angle||0)/30),Math.round(p.measure||0))}°`;
      if(v==='midpoint')return `AM = MB = ${(p.measure||5)/2} đv`;
      return 'Kéo hình hoặc thay tham số để kiểm chứng quan hệ hình học.';
    case 'composition':return v==='hexagon6'?'6 tam giác đều ghép thành 1 lục giác đều.':`Tỉ lệ tách mảnh ${Math.round((p.progress||0)*100)}%. Diện tích bảo toàn khi dịch chuyển.`;
    case 'fraction':{const n=Math.round(p.numerator||0),d=Math.round(p.denominator||1);if(v==='addsame')return `${n}/${d} + ${Math.round(p.other||0)}/${d} = ${(n+Math.round(p.other||0))}/${d}`;return `${n}/${d} = ${(100*fractionRatio(n,d)).toFixed(1)}%${v==='equivalent'?` = ${n*(p.factor||2)}/${d*(p.factor||2)}`:''}`;}
    case 'chart':return `Tổng dữ liệu: ${(p.values||[]).reduce((a,b)=>a+b,0)}`;
    case 'chance':return `Đã thử ${(state.counts||[]).reduce((a,b)=>a+b,0)} lần${state.lastOutcome!==undefined?` · Kết quả cuối: ${outcomeLabels(v)[state.lastOutcome]}`:''}.`;
    case 'number':return v==='factors'?`Phân tích: ${primeFactors(p.value||84).join(' × ')}`:v==='multiples'?`Từ 1 đến 100 có ${Math.floor(100/Math.round(clamp(p.value,2,20)))} bội của ${p.value}`:v==='primes'?`Số nguyên tố không vượt quá ${p.value}: ${Array.from({length:Math.round(clamp(p.value,2,100))-1},(_,i)=>i+2).filter(n=>{for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;}).length}`:`Giá trị điều khiển: ${p.value}`;
    case 'real':
      if(v==='cubes'){
        const n = Math.round(clamp(p.speed||4, 2, 8));
        const total = (n * (n + 1)) / 2;
        return `Số tầng bậc thang: ${n} · Tổng số khối lập phương đơn vị: N = ${total} khối · Tổng thể tích: V = ${total} đv³ (mỗi khối V₀ = 1 đv³).`;
      }
      if(v==='ferris'){
        return `Vòng đu quay: 8 cabin trục quay 360° · Góc hiện tại: ${Math.round(p.rotation||0)}° · Tốc độ: ${p.speed||1}×`;
      }
      if(v==='roads'){
        return `Mô hình 2 trục đường giao thông · Góc cắt: ${Math.round(p.rotation||0)}°`;
      }
      if(v==='card'){
        return `Thiệp gấp không gian · Góc mở: ${Math.round(p.rotation||0)}° (0° đóng, 180° mở phẳng)`;
      }
      if(v==='room'){
        const desk = Number.isInteger(state?.selectedDesk) ? state.selectedDesk + 1 : 1;
        return `Mặt bằng phòng học chữ nhật: 12 bàn (3 hàng × 4 dãy) · Đang chọn bàn vị trí: ${desk}`;
      }
      return model.action;
    default:return model.action;
  }
}
