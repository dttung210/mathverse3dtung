/** Vector-precise planar lesson diagrams corresponding to the exhibition's 3D teaching models.
 * Render SVG only in the 2D tab. Not claimed as measured architectural drawings.
 */
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pathFrom=(f,n=90)=>Array.from({length:n+1},(_,i)=>{const [x,y]=f(i/n);return (i?'L':'M')+x.toFixed(2)+','+y.toFixed(2);}).join(' ');
function body(shape){
 switch(shape){
  case 'pyramid':case 'glasspyramid':return `
   <polygon points="350,85 150,360 550,360" fill="none" stroke="#e6c787" stroke-width="5"/>
   <path d="M150 360 L350 425 L550 360 L350 300 Z" fill="none" stroke="#63b7d3" stroke-width="3"/>
   <path d="M350 85 L350 425" stroke="#63b7d3" stroke-width="2" stroke-dasharray="9 8"/>
   <text x="370" y="240" fill="#8fe3e3" font-size="21">h</text><text x="320" y="388" fill="#e7ce9e" font-size="20">a</text>`;
  case 'temple':return `<path d="M128 160 L350 60 L572 160 Z" fill="none" stroke="#e9c78f" stroke-width="5"/>
   <rect x="130" y="160" width="440" height="20" fill="#dfc99e"/><rect x="110" y="394" width="480" height="23" fill="#987f5b"/>
   ${Array.from({length:8},(_,i)=>`<rect x="${151+i*57}" y="181" width="18" height="210" fill="#c7b692"/>`).join('')}`;
  case 'colosseum':return `<ellipse cx="350" cy="258" rx="256" ry="147" fill="none" stroke="#e8cb99" stroke-width="8"/>
    <ellipse cx="350" cy="258" rx="155" ry="80" fill="none" stroke="#73b9cf" stroke-width="5"/>
    <path d="M94 258 H606 M350 111 V405" stroke="#6687a3" stroke-width="2" stroke-dasharray="8 8"/>
    <text x="490" y="250" fill="#efd0a4" font-size="19">a</text><text x="360" y="155" fill="#efd0a4" font-size="19">b</text>`;
  case 'mayan':return `<path d="M80 409 H620 V375 H577 V341 H536 V307 H499 V273 H462 V239 H427 V205 H390 V174 H310 V205 H273 V239 H238 V273 H201 V307 H164 V341 H123 V375 H80 Z" fill="none" stroke="#e9c999" stroke-width="5"/>
    <path d="M310 174 H390 V147 H310 Z" fill="none" stroke="#e9c999" stroke-width="4"/>
    <path d="M310 174 V409 M390 174 V409" stroke="#60b5c1" stroke-dasharray="6 7" stroke-width="2"/>`;
  case 'taj':return `<path d="M200 407 H500 V220 H200 Z" fill="none" stroke="#d6d9d5" stroke-width="5"/>
    <path d="M260 220 A90 110 0 0 1 440 220" fill="none" stroke="#e8dfc7" stroke-width="5"/>
    <rect x="90" y="170" width="35" height="237" fill="#d1d7d6"/><rect x="575" y="170" width="35" height="237" fill="#d1d7d6"/>
    <path d="M90 170 A17.5 26 0 0 1 125 170 M575 170 A17.5 26 0 0 1 610 170" stroke="#e8dfc7" stroke-width="4" fill="none"/>
    <path d="M350 102 V140" stroke="#e6bb74" stroke-width="5"/>`;
  case 'petronas':return `<path d="M145 412 V98 H285 V412 Z M415 412 V98 H555 V412 Z" fill="none" stroke="#9bccd4" stroke-width="5"/>
    ${Array.from({length:11},(_,i)=>`<path d="M145 ${130+i*25} H285 M415 ${130+i*25} H555" stroke="#afc3d0" stroke-width="2"/>`).join('')}
    <path d="M205 98 L215 60 L225 98 M475 98 L485 60 L495 98" fill="none" stroke="#d9e0de" stroke-width="4"/>
    <path d="M285 225 H415 V249 H285 Z" fill="#b7c8cd" stroke="#e7dbb8" stroke-width="3"/>
    <path d="M285 249 L350 292 L415 249" fill="none" stroke="#d3a76d" stroke-width="3"/>`;
  case 'bridge':{
   const d=pathFrom(t=>[75+550*t,220+105*(1-(2*t-1)**2)]);
   return `<path d="M70 409 H630" stroke="#d5d7dc" stroke-width="9"/>
     <rect x="187" y="129" width="23" height="281" fill="#d86452"/><rect x="490" y="129" width="23" height="281" fill="#d86452"/>
     <path d="${d}" fill="none" stroke="#f3d69a" stroke-width="5"/>
     ${Array.from({length:15},(_,i)=>{const x=90+i*37,t=(x-75)/550,y=220+105*(1-(2*t-1)**2);return `<path d="M${x} ${y.toFixed(1)} V409" stroke="#9db5bb" stroke-width="1.5"/>`}).join('')}
     <text x="316" y="455" fill="#eac88e" font-size="18">Mô hình cáp xấp xỉ parabol</text>`;
  }
  case 'catenary':{
   const k=1.6;const d=pathFrom(t=>[80+540*t,400-300*(Math.cosh(k)-Math.cosh(k*(2*t-1)))/(Math.cosh(k)-1)]);
   const parab=pathFrom(t=>[80+540*t,400-300*(1-(2*t-1)**2)]);
   return `<path d="${d}" stroke="#dfdfe0" stroke-width="13" fill="none" stroke-linecap="round"/>
     <path d="${parab}" stroke="#ee886c" stroke-width="2" stroke-dasharray="7 9" fill="none"/>
     <text x="215" y="462" fill="#e8c88e" font-size="19">Trắng: dây xích ngược</text><text x="215" y="487" fill="#ee886c" font-size="17">Cam nét đứt: parabol so sánh</text>`;
  }
  default:return '<text x="120" y="250" fill="#f0d7a5" font-size="25">Chưa có hình 2D phù hợp</text>';
 }
}
export function geometricSVG(item){
 const shape=item?.shape||'',title=esc(item?.caption||item?.name||'Mặt đứng / hình chiếu');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 520" role="img" aria-label="Hình chiếu 2D của ${esc(item?.name)}" style="width:100%;height:100%;background:#091f31;border-radius:8px;">
  ${Array.from({length:13},(_,i)=>`<path d="M${80+45*i} 40 V480" stroke="#23475e" stroke-width="1"/>`).join('')}
  ${Array.from({length:10},(_,i)=>`<path d="M70 ${40+i*45} H630" stroke="#23475e" stroke-width="1"/>`).join('')}
  <path d="M55 450 H655 M80 470 V20" stroke="#69a8bf" stroke-width="2"/>
  <text x="350" y="27" fill="#f0d0a1" font-weight="700" font-size="23" text-anchor="middle">${title}</text>
  ${body(shape)}</svg>`;
}
