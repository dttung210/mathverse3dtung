/** Original, mathematically annotated SVG diagrams. Never pass these off as actual photographs. */
const clean=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const line=(x1,y1,x2,y2,col='#a8d8eb',w=3,more='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" ${more}/>`;
const circle=(x,y,r,col='#edcd8c')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${col}" stroke-width="4"/>`;
const poly=(n,x,y,r,rot=0)=>`<polygon points="${Array.from({length:n},(_,i)=>{const t=rot+2*Math.PI*i/n;return`${(x+r*Math.cos(t)).toFixed(2)},${(y+r*Math.sin(t)).toFixed(2)}`}).join(' ')}" fill="none" stroke="#f0c989" stroke-width="4"/>`;
const curves=(points,col='#c2d8e2',w=3)=>`<polyline points="${points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
function diagram(id){
 const stem=id?.replace('r107_','')||'';
 if(stem==='basalt')return Array.from({length:4},(_,r)=>Array.from({length:5},(_,c)=>poly(6,130+95*c+(r%2)*45,110+r*87,50,Math.PI/6)).join('')).join('');
 if(stem==='spiderweb')return Array.from({length:16},(_,i)=>{const t=i*Math.PI/8;return line(320,240,320+188*Math.cos(t),240+188*Math.sin(t));}).join('')+Array.from({length:5},(_,j)=>poly(16,320,240,40+j*35,0)).join('');
 if(stem==='nautilus'||stem==='pineapple')return curves(Array.from({length:220},(_,i)=>{const t=i/219*8*Math.PI,r=2*Math.exp(.13*t);return [Math.round(300+r*Math.cos(t)),Math.round(240+r*Math.sin(t))];}), '#e9ce91',4);
 if(stem==='leaf')return curves([[310,430],[295,350],[300,250],[310,140],[315,70]],'#e9ce91',6)+Array.from({length:6},(_,i)=>{const y=105+i*51;return curves([[305,y+25],[240,y-15],[160,y-40]],'#96d1a8',3)+curves([[305,y+25],[370,y-14],[440,y-35]],'#96d1a8',3)}).join('');
 if(stem==='treerings')return Array.from({length:6},(_,i)=>`<ellipse cx="310" cy="240" rx="${50+i*29}" ry="${43+i*25}" stroke="#edc88d" stroke-width="3" fill="none"/>`).join('');
 if(stem==='soapbubbles')return circle(310,235,150)+circle(310,235,18,'#7dcfda')+line(310,235,460,235,'#76d0de',2)+`<text x="389" y="226" fill="#f6e4bb" font-size="22">R</text>`;
 if(stem==='soapfilms')return Array.from({length:15},(_,i)=>{const x=125+26*i;return `<path d="M${x},95 Q${x+30},245 ${x},400" fill="none" stroke="#7bb9d6" stroke-width="2"/>`}).join('')+line(125,95,495,95,'#efd59d',6)+line(125,400,495,400,'#efd59d',6);
 if(stem==='butterfly')return `<path d="M310 230 C150 50,95 190,235 245 C65 385,210 430,310 250 C410 430,555 385,385 245 C525 190,470 50,310 230 Z" fill="none" stroke="#edc88d" stroke-width="5"/>`+line(310,55,310,425,'#76d8e3',3,'stroke-dasharray="8 9"');
 if(stem==='dish')return `<path d="M115 75 Q320 500 525 75" fill="none" stroke="#f0ca92" stroke-width="8"/>`+circle(320,300,9,'#76d6df')+line(320,300,320,90,'#76d6df',2,'stroke-dasharray="8 7"')+`<text x="333" y="300" fill="#e7d6aa" font-size="20">F</text>`;
 if(stem==='windturbine')return circle(310,225,18)+Array.from({length:3},(_,i)=>{const t=i*2*Math.PI/3;return `<path d="M310 225 L${(310+160*Math.cos(t+.08)).toFixed(1)} ${(225+160*Math.sin(t+.08)).toFixed(1)} Q${(310+185*Math.cos(t+.2)).toFixed(1)} ${(225+185*Math.sin(t+.2)).toFixed(1)} 310 225" fill="none" stroke="#e7c88e" stroke-width="6"/>`}).join('')+line(310,244,310,440,'#78b9d1',12);
 if(stem==='truss')return line(90,400,550,400,'#e7cf9a',8)+Array.from({length:8},(_,i)=>{const x=90+i*57.5;return line(x,400,x+28.75,285,'#93c9d6',3)+line(x+28.75,285,x+57.5,400,'#93c9d6',3)}).join('')+line(120,285,520,285,'#e7cf9a',5);
 if(stem==='spring'||stem==='staircase')return curves(Array.from({length:250},(_,i)=>{const t=i/249*7*Math.PI;return [(300+130*Math.cos(t)).toFixed(2),(410-t*13.8).toFixed(2)]}), '#e8cb8d',5);
 if(stem==='container')return `<rect x="115" y="135" width="410" height="245" fill="none" stroke="#eac88d" stroke-width="5"/>`+Array.from({length:12},(_,i)=>line(129+i*32,138,129+i*32,377,'#8abfcd',3)).join('')+`<text x="284" y="415" fill="#f0d49b" font-size="20">a × b × c</text>`;
 if(stem==='irrigation')return circle(310,240,165)+circle(310,240,6)+line(310,240,475,240,'#e7d29b',4)+`<text x="380" y="232" fill="#e7d29b" font-size="20">R</text>`;
 if(stem==='chainring')return circle(310,235,160)+circle(310,235,40)+Array.from({length:24},(_,i)=>{const t=i*Math.PI/12;return line(310+154*Math.cos(t),235+154*Math.sin(t),310+168*Math.cos(t),235+168*Math.sin(t),'#c7bd96',4)}).join('');
 return `<text x="100" y="255" font-size="24" fill="#e5c88f">Chưa có sơ đồ 2D đã duyệt</text>`;
}
export function roomBMathSVG_R107(item){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 480" role="img" aria-label="Sơ đồ Toán học minh họa ${clean(item?.name)}" style="width:100%;height:100%"><rect width="620" height="480" fill="#0a2234"/><text x="310" y="38" fill="#f2d5a2" font-family="sans-serif" font-size="23" font-weight="bold" text-anchor="middle">${clean(item?.name)}</text>${diagram(item?.id)}<text x="310" y="461" font-family="sans-serif" font-size="13" text-anchor="middle" fill="#a7d9dd">Sơ đồ Toán lý tưởng hóa · KHÔNG phải ảnh chụp thật</text></svg>`;}
