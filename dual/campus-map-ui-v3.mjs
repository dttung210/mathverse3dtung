/**
 * MATHVERSE map V4 — DIRECT shared hall branches to Lab/Museum;
 * exactly opposite the hall is Wonder Park. One vector overview,
 * reflecting coordinates of the SAME Grand Campus WebGL world.
 */
import {CAMPUS_MASTERPLAN as M,ORBITAL_MASTERPLAN as O,zoneCenter} from './campus-masterplan.mjs';
const NS='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id);
function node(tag,attrs={},body=null){
  const e=document.createElementNS(NS,tag);
  for(const [name,value] of Object.entries(attrs))e.setAttribute(name,String(value));
  if(body!==null)e.textContent=String(body);
  return e;
}
export function initializeCampusMap({navigate,aerial,notice}){
  const dialog=$('campus-map-dialog'),svg=$('campus-map-svg'),guide=$('campus-map-legend');
  const S=1.62,X=480,Y=430;
  const P=([x,z])=>[X+x*S,Y+z*S];
  const p=(x,z)=>{const [cx,cy]=P([x,z]);return {cx,cy};};
  const add=(tag,attrs={},body=null,parent=svg)=>{const e=node(tag,attrs,body);parent.appendChild(e);return e;};
  function line(points,color,width=7,dash=''){
    return add('polyline',{
      points:points.map(pt=>P(pt).join(',')).join(' '),fill:'none',stroke:color,
      'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round',
      ...(dash?{'stroke-dasharray':dash}:{})
    });
  }
  const print=(x,z,label,fill='#fff',size=15,weight=800)=>{
    const pt=p(x,z);return add('text',{x:pt.cx,y:pt.cy,fill,'font-size':size,
      'font-weight':weight,'text-anchor':'middle','pointer-events':'none'},label);
  };
  function circleButton(id,x,z,color,r,label,centerText=''){
    const g=add('g',{'data-destination':id,role:'button',tabindex:0,
      'aria-label':label,class:'campus-map-node'});
    const pt=p(x,z);
    add('circle',{...pt,r,fill:color,stroke:'#fff2c9','stroke-width':2.5},null,g);
    if(centerText)add('text',{x:pt.cx,y:pt.cy+4.2,fill:'#0e2a37','font-size':12,
      'font-weight':900,'text-anchor':'middle','pointer-events':'none'},centerText,g);
    add('title',{},label,g);
    return g;
  }
  // Nền trời mây sáng dịu giống hệt Ảnh 2: VÒNG QUỸ ĐẠO TRI THỨC (04/05)
  add('rect',{x:0,y:0,width:960,height:825,rx:20,fill:'#0b253c'});
  for(let xx=-200;xx<=200;xx+=40){const [x]=P([xx,0]);add('line',{x1:x,y1:0,x2:x,y2:825,stroke:'#1e4968','stroke-width':.8});}
  for(let zz=-200;zz<=200;zz+=40){const [,y]=P([0,zz]);add('line',{x1:0,y1:y,x2:960,y2:y,stroke:'#1e4968','stroke-width':.8});}
  add('text',{x:480,y:34,'font-size':21,fill:'#ffefc7','font-weight':900,'text-anchor':'middle'},
    'MATHVERSE R107 · QUẦN ĐẢO TRÊN MÂY — VÒNG QUỸ ĐẠO TRI THỨC (04/05)');
  add('text',{x:480,y:56,'font-size':12,fill:'#c5e3f0','text-anchor':'middle'},
    'TRUNG TÂM GRAND DOME (0,0) · 4 ĐƯỜNG ĐI XUYÊN TÂM ĐỐI XỨNG · BẮC DISCOVERY · TÂY LAB · ĐÔNG MUSEUM · NAM WONDER PARK');

  // 1. VÒNG CẦU LIÊN ĐẢO ĐỒNG TÂM (R = 138m quanh tâm (0, 0))
  const C0=p(0,0);
  add('circle',{cx:C0.cx,cy:C0.cy,r:138*S,fill:'none',stroke:'#f59e0b','stroke-width':16,'stroke-opacity':0.85,'pointer-events':'none'});
  add('circle',{cx:C0.cx,cy:C0.cy,r:138*S,fill:'none',stroke:'#fffbeb','stroke-width':6,'pointer-events':'none'});

  // 2. 4 CẦU XUYÊN TÂM CHỮ THẬP (+) ĐỐI XỨNG 90° TỪ TÂM (0, 0)
  for(const bridge of [[[0,-44],[0,-80]],[[0,44],[0,80]],[[-44,0],[-80,0]],[[44,0],[80,0]]]){
    line(bridge,'#d97706',18);
    line(bridge,'#fffbeb',10);
    line(bridge,'#94a3b8',2);
  }

  // 3. TÂM (0, 0): ĐẢO TRUNG TÂM GRAND DOME
  add('circle',{cx:C0.cx,cy:C0.cy,r:48*S,fill:'#86efac',stroke:'#fbbf24','stroke-width':4,
    'data-destination':'reception',class:'campus-map-node',role:'button',tabindex:0,
    'aria-label':'Đi về Sảnh Trung Tâm GRAND DOME'});
  add('circle',{cx:C0.cx,cy:C0.cy,r:39*S,fill:'#fefce8',stroke:'#eab308','stroke-width':2,'pointer-events':'none'});
  add('ellipse',{cx:C0.cx,cy:C0.cy-6,rx:24*S,ry:18*S,fill:'#0f2942',stroke:'#eab308','stroke-width':2.5,'pointer-events':'none'});
  add('ellipse',{cx:C0.cx,cy:C0.cy-6,rx:16*S,ry:12*S,fill:'#7dd3fc','pointer-events':'none'});
  print(0,22,'GRAND DOME','#1e293b',16,900);
  print(0,32,'SẢNH TRUNG TÂM · LỄ TÂN','#475569',10,800);

  // 4. HƯỚNG BẮC (0, -138): ĐẢO DISCOVERY
  const D=p(O.discovery.x,O.discovery.z);
  add('circle',{...D,r:56*S,fill:'#86efac',stroke:'#fbbf24','stroke-width':4,
    'data-destination':'discovery',class:'campus-map-node',role:'button',tabindex:0,
    'aria-label':'Đến Đảo Bắc DISCOVERY'});
  add('circle',{...D,r:46*S,fill:'#ede9fe',stroke:'#8b5cf6','stroke-width':2.5,'pointer-events':'none'});
  add('circle',{cx:D.cx,cy:D.cy-8,r:20*S,fill:'#dbeafe',stroke:'#6d28d9','stroke-width':2.5,'pointer-events':'none'});
  print(0,-105,'DISCOVERY','#4c1d95',16,900);
  print(0,-93,'ĐỊA CẦU & 35 KỲ QUAN','#5b21b6',10,800);
  print(0,-204,'BẮC','#fde68a',13,900);

  // 5. HƯỚNG TÂY (-138, 0): ĐẢO LAB
  const L=p(O.lab.x,O.lab.z);
  add('circle',{...L,r:56*S,fill:'#86efac',stroke:'#fbbf24','stroke-width':4,
    'data-destination':'lab',class:'campus-map-node',role:'button',tabindex:0,
    'aria-label':'Đi đến Đảo Tây MATHVERSE LAB'});
  add('circle',{...L,r:46*S,fill:'#f0f9ff',stroke:'#0284c7','stroke-width':2.5,'pointer-events':'none'});
  add('rect',{x:L.cx-24*S,y:L.cy-22*S,width:48*S,height:32*S,rx:6,fill:'#bae6fd',stroke:'#0284c7','stroke-width':2.5,'pointer-events':'none'});
  print(O.lab.x,26,'LAB','#0c4a6e',17,900);
  print(O.lab.x,37,'76 LAB · 310 MÔ HÌNH','#0369a1',10,800);
  print(-212,0,'TÂY','#fde68a',13,900);

  // 6. HƯỚNG ĐÔNG (+138, 0): ĐẢO MUSEUM
  const U=p(O.museum.x,O.museum.z);
  add('circle',{...U,r:56*S,fill:'#86efac',stroke:'#fbbf24','stroke-width':4,
    'data-destination':'museum',class:'campus-map-node',role:'button',tabindex:0,
    'aria-label':'Đi đến Đảo Đông Bảo tàng Infographic'});
  add('circle',{...U,r:46*S,fill:'#fffbeb',stroke:'#d97706','stroke-width':2.5,'pointer-events':'none'});
  add('ellipse',{cx:U.cx,cy:U.cy-10,rx:22*S,ry:11*S,fill:'#bae6fd',stroke:'#d97706','stroke-width':2.5,'pointer-events':'none'});
  print(O.museum.x,26,'MUSEUM','#78350f',17,900);
  print(O.museum.x,37,'7 PHÒNG · 230 INFOGRAPHIC','#b45309',10,800);
  print(212,0,'ĐÔNG','#fde68a',13,900);

  // 7. HƯỚNG NAM (0, +138): ĐẢO WONDER PARK
  const V=p(O.park.x,O.park.z);
  add('circle',{...V,r:56*S,fill:'#86efac',stroke:'#fbbf24','stroke-width':4,
    'data-destination':'park',class:'campus-map-node',role:'button',tabindex:0,
    'aria-label':'Đến Đảo Nam WONDER PARK'});
  add('circle',{...V,r:46*S,fill:'#ecfdf5',stroke:'#10b981','stroke-width':2.5,'pointer-events':'none'});
  add('circle',{...V,r:34*S,fill:'none',stroke:'#fbbf24','stroke-width':8,'pointer-events':'none'});
  const swatches=['#ffdb89','#ffae86','#8ee4ea','#f0bc74','#a8f3c7','#c8bcff','#ffe29c','#8ee1ba','#ffb5d1','#a9d6ff'];
  for(let i=0;i<M.zones.length;i++){
    const q=zoneCenter(i);
    const zx=q.x*0.62, zz=O.park.z+(q.z-O.park.z)*0.62;
    const at=p(zx,zz);
    const g=add('g',{'data-destination':`zone:${i}`,class:'campus-map-node',
      role:'button',tabindex:0,'aria-label':`${i+1}. ${M.zones[i]}`});
    add('circle',{...at,r:10.5,fill:swatches[i]||'#efd28c',stroke:'#183b4c','stroke-width':1.8},null,g);
    add('text',{x:at.cx,y:at.cy+4,'font-size':11,'font-weight':900,
      'text-anchor':'middle',fill:'#173540','pointer-events':'none'},String(i+1),g);
    add('title',{},M.zones[i],g);
  }
  print(0,178,'WONDER PARK','#065f46',16,900);
  print(0,212,'NAM','#fde68a',13,900);

  const me=circleButton('player',0,28,'#ffe6a9',10,'Vị trí nhân vật');
  me.removeAttribute('data-destination');me.removeAttribute('role');me.removeAttribute('tabindex');
  const marker=me.querySelector('circle');marker.id='campus-map-player-dot';

  function hide(){dialog.hidden=true;dialog.setAttribute('aria-hidden','true');}
  function open(){dialog.hidden=false;dialog.setAttribute('aria-hidden','false');$('campus-map-close').focus();}
  function go(id){if(id==='player')return;hide();navigate(id);}
  svg.addEventListener('click',ev=>{const match=ev.target.closest?.('[data-destination]');if(match)go(match.dataset.destination);});
  svg.addEventListener('keydown',ev=>{
    if(!['Enter',' '].includes(ev.key))return;
    const match=ev.target.closest?.('[data-destination]');if(!match)return;
    ev.preventDefault();go(match.dataset.destination);
  });
  const buttons=[['entry','⌂ Cổng MATHVERSE'],['reception','🏛 SẢNH CHUNG'],
    ['lab','⚗ LAB (trực tiếp từ sảnh)'],['museum','▤ Bảo tàng (trực tiếp từ sảnh)'],
    ['park','🎡 Công viên đối diện sảnh'],
    ['discovery','🌍 Khu Discovery · hai phòng riêng']];
  for(let i=0;i<M.zones.length;i++)buttons.push([`zone:${i}`,`${i+1}. ${M.zones[i]}`]);
  for(const [id,label] of buttons){
    const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.destination=id;
    b.addEventListener('click',()=>go(id));guide.appendChild(b);
  }
  $('campus-map-open').addEventListener('click',open);
  $('campus-map-close').addEventListener('click',hide);
  $('campus-map-overview').addEventListener('click',()=>{hide();aerial('all');});
  $('campus-map-parkview').addEventListener('click',()=>{hide();aerial('park');});
  dialog.addEventListener('click',ev=>{if(ev.target===dialog)hide();});
  function updatePlayer(current){if(!current)return;const at=p(current.x,current.z);marker.setAttribute('cx',at.cx);marker.setAttribute('cy',at.cy);}
  return {show:open,hide,updatePlayer,get isOpen(){return !dialog.hidden;},plan:M};
}
