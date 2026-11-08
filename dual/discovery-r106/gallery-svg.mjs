/** Mathematical reference diagrams independent of the real photo content. */
const E=(s)=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const circle=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#f2cc8e" stroke-width="4"/>`;
const poly=(n,x=300,y=230,r=115,rot=0)=>`<polygon points="${Array.from({length:n},(_,i)=>{const a=rot+2*Math.PI*i/n;return `${(x+r*Math.cos(a)).toFixed(1)},${(y+r*Math.sin(a)).toFixed(1)}`;}).join(' ')}" fill="none" stroke="#f3cd91" stroke-width="4"/>`;
const line=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#84cfda" stroke-width="3"/>`;
const dots=(n,r=140)=>Array.from({length:n},(_,i)=>{const a=2*Math.PI*i/n;return circle((300+r*Math.cos(a)).toFixed(2),(230+r*Math.sin(a)).toFixed(2),7);}).join('');
export function roomBMathSVG(item){
 const id=String(item?.id||'');let content='';
 if(id==='r106_beehive'||id==='r106_tessellation')content=[[-100,0],[0,0],[100,0],[-50,-88],[50,-88],[-50,88],[50,88]].map(([x,y])=>poly(6,300+x,230+y,56,Math.PI/6)).join('');
 else if(id==='r106_ferris'||id==='r106_bicycle'){content=circle(300,230,150)+dots(12,150)+Array.from({length:12},(_,i)=>{const a=2*Math.PI*i/12;return line(300,230,(300+150*Math.cos(a)).toFixed(1),(230+150*Math.sin(a)).toFixed(1));}).join('');}
 else if(id==='r106_geodesic'){content=poly(12,300,230,170)+Array.from({length:12},(_,i)=>{const a=2*Math.PI*i/12;return line(300,230,(300+170*Math.cos(a)).toFixed(1),(230+170*Math.sin(a)).toFixed(1));}).join('')+poly(6,300,230,90);}
 else if(id==='r106_football'){content=poly(5,300,230,75,-Math.PI/2)+Array.from({length:5},(_,i)=>{const a=2*Math.PI*i/5;const x=300+145*Math.cos(a),y=230+145*Math.sin(a);return poly(6,x,y,47,Math.PI/6);}).join('');}
 else if(id==='r106_snowflake'){content=Array.from({length:6},(_,i)=>{const a=i*Math.PI/3,x=300+165*Math.cos(a),y=230+165*Math.sin(a);return line(300,230,x,y);}).join('')+dots(6,165);}
 else if(id==='r106_starfish'){content=poly(10,300,230,150,-Math.PI/2)+Array.from({length:5},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/5;return line(300,230,300+150*Math.cos(a),230+150*Math.sin(a));}).join('');}
 else if(id==='r106_pine'||id==='r106_romanesco'){content=Array.from({length:7},(_,i)=>{const r=20+i*23;return poly(6,300,230,r,Math.PI*i/13);}).join('');}
 else if(id==='r106_stairs'){content=circle(300,230,140)+Array.from({length:16},(_,i)=>{const a=i*Math.PI/8;return line(300,230,(300+140*Math.cos(a)).toFixed(1),(230+140*Math.sin(a)).toFixed(1));}).join('');}
 return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Hình học 2D tham khảo ${E(item?.name)}" viewBox="0 0 600 480"><rect width="600" height="480" rx="10" fill="#092339"/><text x="300" y="40" fill="#f0ce95" font-family="sans-serif" font-size="24" font-weight="700" text-anchor="middle">${E(item?.name)}</text>${content}<text x="300" y="451" fill="#a6d9dd" font-family="sans-serif" font-size="16" text-anchor="middle">Hình học lý tưởng hóa • không phải bản vẽ đo đạc vật thể</text></svg>`;
}
