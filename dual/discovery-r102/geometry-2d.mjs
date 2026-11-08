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
  case 'opera':return `<path d="M90 405 H610" stroke="#c5b694" stroke-width="16"/><path d="M120 392 Q240 105 315 395 M275 392 Q365 82 445 395 M410 392 Q525 142 580 395" fill="none" stroke="#f0ecdd" stroke-width="15"/>`;
  case 'hagia':return `<rect x="130" y="250" width="440" height="155" fill="none" stroke="#d0bda4" stroke-width="6"/><path d="M210 250 A140 130 0 0 1 490 250" fill="none" stroke="#b9c3c4" stroke-width="9"/><path d="M75 410 V145 M625 410 V145" stroke="#e4d9c1" stroke-width="16"/>`;
  case 'pantheon':return `<path d="M120 400 H580 V260 H120 Z" fill="none" stroke="#c9bba5" stroke-width="5"/><path d="M185 260 A165 150 0 0 1 515 260" stroke="#d8d2c6" stroke-width="7" fill="none"/><path d="M350 115 V408" stroke="#84b7c1" stroke-dasharray="6 7"/>`;
  case 'eiffel':return `<path d="M150 410 L312 100 L388 100 L550 410 M210 310 H490 M285 196 H415 M150 410 H550" fill="none" stroke="#d1ac7c" stroke-width="7"/><path d="M200 337 L500 337 M250 245 L450 245 M150 410 L500 337 M550 410 L200 337" stroke="#b9bdac" stroke-width="3"/>`;
  case 'atomium':return `<g stroke="#9cbbbc" stroke-width="15">${[[185,130,515,130],[185,130,185,390],[515,130,515,390],[185,390,515,390],[185,130,350,260],[515,130,350,260],[185,390,350,260],[515,390,350,260]].map(v=>`<line x1="${v[0]}" y1="${v[1]}" x2="${v[2]}" y2="${v[3]}"/>`).join('')}</g>${[[185,130],[515,130],[185,390],[515,390],[350,260]].map(q=>`<circle cx="${q[0]}" cy="${q[1]}" r="30" fill="#c7dddd"/>`).join('')}`;
  case 'burj':return `<path d="M245 410 V330 H270 V255 H290 V192 H315 V135 H340 V80 H360 V135 H385 V192 H410 V255 H430 V330 H455 V410 Z" fill="none" stroke="#a5d4e0" stroke-width="6"/>${Array.from({length:10},(_,i)=>`<line x1="${250+i*4}" y1="${387-i*26}" x2="${450-i*4}" y2="${387-i*26}" stroke="#8aafc4"/>`).join('')}`;
  case 'borobudur':return Array.from({length:6},(_,i)=>`<rect x="${125+i*26}" y="${386-i*47}" width="${450-i*52}" height="${35}" fill="none" stroke="#e5ccaa" stroke-width="3"/>`).join('')+`<ellipse cx="350" cy="100" rx="62" ry="18" fill="none" stroke="#c1d8da" stroke-width="4"/>`;
  case 'angkor':return `<rect x="130" y="320" width="440" height="80" fill="none" stroke="#e5c69a" stroke-width="5"/>`+[-155,0,155].map(dx=>`<path d="M${350+dx-30} 320 V195 L${350+dx} 95 L${350+dx+30} 195 V320" fill="none" stroke="#c6b799" stroke-width="5"/>`).join('');
  case 'pisa':return `<g transform="rotate(8 350 406)"><rect x="285" y="88" width="130" height="318" fill="none" stroke="#d7cdb7" stroke-width="5"/>${Array.from({length:8},(_,i)=>`<line x1="282" x2="418" y1="${120+i*36}" y2="${120+i*36}" stroke="#b8afa0" stroke-width="5"/>`).join('')}</g><path d="M350 73 V415" stroke="#81cbd6" stroke-width="3" stroke-dasharray="7 9"/>`;
  case 'samarra':return `<path d="M205 406 L300 97 H400 L495 406 Z" fill="none" stroke="#cfba92" stroke-width="6"/>`+Array.from({length:8},(_,i)=>{const x=205+i*12,y=405-i*40;return `<path d="M${x} ${y} H${700-x}" fill="none" stroke="#e4c9a1" stroke-width="4"/>`}).join('');
  case 'himeji':return Array.from({length:5},(_,i)=>{const w=400-i*70,y=390-i*63;return `<rect x="${350-w*.42}" y="${y-48}" width="${w*.84}" height="48" fill="none" stroke="#c9d7d9" stroke-width="4"/><path d="M${350-w/2} ${y-48} L350 ${y-76} L${350+w/2} ${y-48} Z" fill="none" stroke="#92aeb9" stroke-width="5"/>`}).join('');
  case 'sagrada':return `<rect x="155" y="215" width="390" height="180" fill="none" stroke="#d9bd92" stroke-width="5"/>`+Array.from({length:8},(_,i)=>{const x=190+i*45;return `<path d="M${x-13} 310 V150 L${x} ${85+i%2*16} L${x+13} 150 V310" fill="none" stroke="#d7bd9e" stroke-width="4"/>`}).join('');
  case 'brasilia':return Array.from({length:16},(_,i)=>{const x=180+i*22;return `<path d="M${x} 397 Q${x-45} 205 ${x+10} 100" fill="none" stroke="#e0e0d9" stroke-width="4"/>`}).join('');
  case 'lotus':return Array.from({length:9},(_,i)=>{const a=(i-4)*Math.PI/18,x=350+240*Math.sin(a);return `<path d="M350 401 Q${x-42} 175 ${x} 110 Q${x+40} 190 350 401" fill="none" stroke="#e9e9e1" stroke-width="3"/>`}).join('');
  case 'millau':return `<rect x="72" y="285" width="556" height="20" fill="#95b7c7"/>`+Array.from({length:5},(_,i)=>{const x=130+i*110;return `<path d="M${x} 400 V120" stroke="#d2dbd9" stroke-width="8"/><path d="M${x} 120 L${x-62} 285 M${x} 120 L${x+62} 285" stroke="#f0d19c" fill="none" stroke-width="3"/>`}).join('');
  case 'needle':return `<path d="M230 404 L350 150 L470 404 M300 404 L350 150 L400 404" fill="none" stroke="#e4ded5" stroke-width="8"/><ellipse cx="350" cy="150" rx="135" ry="32" fill="none" stroke="#a6c8d1" stroke-width="8"/><path d="M350 120 V65" stroke="#e7ce9d" stroke-width="5"/>`;
  case 'babylon':return Array.from({length:4},(_,i)=>`<rect x="${120+i*42}" y="${340-i*58}" width="${460-i*84}" height="56" fill="none" stroke="#e6c787" stroke-width="4"/>`).join('')+`<path d="M350 95 V415" stroke="#63b7d3" stroke-width="2" stroke-dasharray="7 6"/>`;
  case 'zeus':return `<rect x="160" y="340" width="380" height="65" fill="none" stroke="#d9c6a3" stroke-width="5"/><rect x="260" y="160" width="180" height="180" fill="none" stroke="#f0d078" stroke-width="5"/><path d="M350 85 V420" stroke="#63b7d3" stroke-width="2" stroke-dasharray="8 6"/>`;
  case 'mausoleum':return `<rect x="160" y="290" width="380" height="115" fill="none" stroke="#dcd6c8" stroke-width="5"/>`+Array.from({length:8},(_,i)=>`<rect x="${182+i*45}" y="195" width="14" height="95" fill="#c7b692"/>`).join('')+`<polygon points="155,195 350,95 545,195" fill="none" stroke="#e6c787" stroke-width="5"/>`;
  case 'colossus':return `<rect x="175" y="330" width="110" height="75" fill="none" stroke="#d8c39e" stroke-width="5"/><rect x="415" y="330" width="110" height="75" fill="none" stroke="#d8c39e" stroke-width="5"/><path d="M230 330 L330 165 H370 L470 330" fill="none" stroke="#e8a864" stroke-width="8"/><circle cx="350" cy="125" r="28" fill="none" stroke="#f4d068" stroke-width="5"/><path d="M350 70 V420" stroke="#63b7d3" stroke-dasharray="7 7" stroke-width="2"/>`;
  case 'pharos':return `<rect x="235" y="265" width="230" height="140" fill="none" stroke="#e2d5b8" stroke-width="5"/><rect x="268" y="165" width="164" height="100" fill="none" stroke="#85cad6" stroke-width="5"/><rect x="300" y="95" width="100" height="70" fill="none" stroke="#f2cf88" stroke-width="5"/><path d="M350 60 V420" stroke="#ee886c" stroke-dasharray="7 6" stroke-width="2"/>`;
  case 'greatwall':return `<polyline points="95,355 215,245 345,305 475,185 605,235" fill="none" stroke="#e5c896" stroke-width="8"/>`+[[95,355],[215,245],[345,305],[475,185],[605,235]].map(([x,y])=>`<rect x="${x-22}" y="${y-36}" width="44" height="44" fill="#183b52" stroke="#65d6ce" stroke-width="4"/>`).join('');
  case 'petra':return `<rect x="170" y="85" width="360" height="320" fill="none" stroke="#d88b6c" stroke-width="5"/><polygon points="185,255 350,195 515,255" fill="none" stroke="#f0c79c" stroke-width="4"/><circle cx="350" cy="145" r="38" fill="none" stroke="#68d2d8" stroke-width="4"/><path d="M350 70 V420" stroke="#f4cf81" stroke-dasharray="7 6" stroke-width="2"/>`;
  case 'machu':return Array.from({length:5},(_,i)=>`<path d="M${110+i*28} ${395-i*45} H${590-i*28}" stroke="#7fd18b" stroke-width="6"/>`).join('')+`<polygon points="280,190 350,125 420,190" fill="none" stroke="#e8c88e" stroke-width="5"/><rect x="295" y="190" width="110" height="55" fill="none" stroke="#d6d1c4" stroke-width="4"/>`;
  case 'christ':return `<polygon points="275,405 305,335 395,335 425,405" fill="none" stroke="#a6c8d1" stroke-width="4"/><rect x="322" y="135" width="56" height="200" fill="none" stroke="#e8eae6" stroke-width="5"/><rect x="180" y="175" width="340" height="38" fill="none" stroke="#e8eae6" stroke-width="5"/><path d="M350 85 V420 M160 194 H540" stroke="#38c8be" stroke-dasharray="7 6" stroke-width="2.5"/>`;
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
