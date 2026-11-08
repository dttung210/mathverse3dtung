/** MATHVERSE Toan 6 dynamic constructive geometry — deterministic pure module.
 * No arbitrary code execution, all lengths in educational coordinate units.
 */
import {polygonPoints,polygonArea,polygonPerimeter,dist,midpoint,reflectAxisX,reflectCenter,clamp} from './math.mjs?v=r107_v15';
export const SHAPE_KINDS=['point','segment','line','ray','angle','circle','triangle','square','hexagon','rectangle','rhombus','parallelogram','trapezoid'];
export const DERIVED_KINDS=['midpoint','reflectionAxis','reflectionCenter'];
export const LABELS={point:'Điểm',segment:'Đoạn thẳng',line:'Đường thẳng',ray:'Tia',angle:'Góc',circle:'Đường tròn',triangle:'Tam giác đều',square:'Hình vuông',hexagon:'Lục giác đều',rectangle:'Hình chữ nhật',rhombus:'Hình thoi',parallelogram:'Hình bình hành',trapezoid:'Hình thang cân',midpoint:'Trung điểm',reflectionAxis:'Đối xứng trục',reflectionCenter:'Đối xứng tâm'};
export const POLYGON_KINDS=['triangle','square','hexagon','rectangle','rhombus','parallelogram','trapezoid'];
const finite=n=>Number.isFinite(n)&&Math.abs(n)<=10000;
const clone=x=>JSON.parse(JSON.stringify(x));
let nextCounter=0;
export function newItem(kind,x=0,y=0,settings={}){
 if(![...SHAPE_KINDS,...DERIVED_KINDS].includes(kind))throw Error('Loại hình không hỗ trợ: '+kind);
 const id=`geo6-${Date.now().toString(36)}-${(++nextCounter).toString(36)}`;
 const common={id,kind,x,y,visible:true,locked:false,color:'#16a2a7',name:LABELS[kind]};
 const extras={
 point:{},segment:{ax:-2,ay:0,bx:2,by:0},line:{ax:-2,ay:0,bx:2,by:0},ray:{ax:-2,ay:0,bx:2,by:0},
 angle:{theta:60,r:2.5},circle:{r:2},triangle:{a:4,rotation:0},square:{a:4,rotation:0},hexagon:{a:3,rotation:0},
 rectangle:{a:5,b:3,rotation:0},rhombus:{a:6,b:4,rotation:0},parallelogram:{a:5,b:3,skew:1.3,rotation:0},trapezoid:{a:5,b:3,height:3,rotation:0},
 midpoint:{parentId:''},reflectionAxis:{parentId:'',axisX:0},reflectionCenter:{parentId:'',cx:0,cy:0}
 };
 return {...common,...extras[kind],...settings};
}
export function newBoard(){return {schema:'mathverse.toan6.geometry.v2',grade:6,items:[],keyframes:[],speed:1};}
export function getItem(board,id){return board.items.find(o=>o.id===id);}
export function coords(item,board,depth=0,visited=new Set()){
 if(!item||depth>10||visited.has(item.id))return null;
 const nextVisited=new Set(visited);nextVisited.add(item.id);
 const source=()=>coords(getItem(board,item.parentId),board,depth+1,nextVisited);
 if(item.kind==='point')return {kind:item.kind,vertices:[[item.x,item.y]]};
 if(['segment','line','ray'].includes(item.kind))return {kind:item.kind,vertices:[[item.x+item.ax,item.y+item.ay],[item.x+item.bx,item.y+item.by]]};
 if(item.kind==='angle'){
  const theta=item.theta*Math.PI/180;
  return {kind:item.kind,vertices:[[item.x,item.y],[item.x+item.r,item.y],[item.x+Math.cos(theta)*item.r,item.y+Math.sin(theta)*item.r]],angle:item.theta};
 }
 if(item.kind==='circle')return {kind:item.kind,center:[item.x,item.y],r:item.r};
 if(POLYGON_KINDS.includes(item.kind)){
  const verts=polygonPoints(item.kind,item).map(([x,y])=>[x+item.x,y+item.y]);
  return {kind:item.kind,vertices:verts,area:polygonArea(verts),perimeter:polygonPerimeter(verts)};
 }
 const parent=source();if(!parent)return null;
 if(item.kind==='midpoint'){
  if(!['segment','line','ray'].includes(parent.kind))return null;
  return {kind:'point',vertices:[midpoint(parent.vertices[0],parent.vertices[1])],dependent:true};
 }
 if(item.kind==='reflectionAxis'){
  if(!parent.vertices)return null;
  return {...parent,vertices:parent.vertices.map(p=>reflectAxisX(p,item.axisX)),dependent:true};
 }
 if(item.kind==='reflectionCenter'){
  if(!parent.vertices)return null;
  return {...parent,vertices:parent.vertices.map(p=>reflectCenter(p,[item.cx,item.cy])),dependent:true};
 }
 return null;
}
export function bboxLine(a,b,bounds,mode='line'){
 const x=b[0]-a[0],y=b[1]-a[1];if(x*x+y*y<1e-12)return null;
 const [left,right,bottom,top]=bounds;
 let t0=mode==='ray'?0:mode==='segment'?0:-Infinity,t1=mode==='segment'?1:Infinity;
 for(const [p,q] of [[-x,a[0]-left],[x,right-a[0]],[-y,a[1]-bottom],[y,top-a[1]]]){
  if(Math.abs(p)<1e-10){if(q<0)return null;continue;}
  const t=q/p;
  if(p<0)t0=Math.max(t0,t);else t1=Math.min(t1,t);
  if(t0>t1)return null;
 }
 return [[a[0]+x*t0,a[1]+y*t0],[a[0]+x*t1,a[1]+y*t1]];
}
export function hitHandle(item,g,world,radius=.26){
 if(!g||item.locked||item.kind==='midpoint'||item.kind.startsWith('reflection'))return -1;
 if(g.kind==='circle'){const handle=[g.center[0]+g.r,g.center[1]];if(dist(handle,world)<radius)return 1;if(dist(g.center,world)<radius)return 0;return -1;}
 return (g.vertices||[]).findIndex(p=>dist(p,world)<=radius);
}
export function hitGeometry(item,g,world,radius=.24){
 if(!g||item.visible===false)return false;
 if(g.kind==='circle')return Math.abs(dist(g.center,world)-g.r)<=radius||dist(g.center,world)<=radius;
 if(g.kind==='point')return dist(g.vertices[0],world)<=radius;
 if(!g.vertices||!g.vertices.length)return false;
 if(g.kind==='angle')return g.vertices.some(v=>dist(v,world)<radius*2);
 const vv=g.vertices;
 if(POLYGON_KINDS.includes(g.kind)||item.kind.startsWith('reflection')){
  let inside=false;for(let i=0,j=vv.length-1;i<vv.length;j=i++){
   const a=vv[i],b=vv[j];if((a[1]>world[1])!==(b[1]>world[1])&&world[0]<(b[0]-a[0])*(world[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }if(inside)return true;
 }
 const vertices=['line','ray'].includes(g.kind)?bboxLine(vv[0],vv[1],[-12,12,-8,8],g.kind):null;
 const edges=vertices?[vertices]:vv.slice(0,vv.length-1).map((p,i)=>[p,vv[i+1]]);
 if(POLYGON_KINDS.includes(g.kind))edges.push([vv.at(-1),vv[0]]);
 for(const [a,b] of edges){let dx=b[0]-a[0],dy=b[1]-a[1],n=dx*dx+dy*dy;if(n<1e-10)continue;let t=clamp(((world[0]-a[0])*dx+(world[1]-a[1])*dy)/n,0,1);if(dist(world,[a[0]+dx*t,a[1]+dy*t])<=radius)return true;}
 return false;
}
export function updateHandle(item,handle,world){
 if(item.locked||DERIVED_KINDS.includes(item.kind))return false;
 const [x,y]=world;
 if(!finite(x)||!finite(y))return false;
 if(item.kind==='point'){item.x=x;item.y=y;return true;}
 if(['segment','line','ray'].includes(item.kind)){
  if(handle<0||handle>1)return false;
  const a=handle===0?'a':'b';const other=handle===0?[item.x+item.bx,item.y+item.by]:[item.x+item.ax,item.y+item.ay];
  if(dist(world,other)<.1)return false;item[a+'x']=x-item.x;item[a+'y']=y-item.y;return true;
 }
 if(item.kind==='circle'){
  if(handle===0){item.x=x;item.y=y;}else item.r=clamp(dist(world,[item.x,item.y]),.3,8);return true;
 }
 if(item.kind==='angle'){if(handle===0){item.x=x;item.y=y;}else{item.theta=clamp(Math.atan2(y-item.y,x-item.x)*180/Math.PI,0,180);item.r=clamp(dist(world,[item.x,item.y]),.5,6);}return true;}
 if(POLYGON_KINDS.includes(item.kind)){
  const xx=x-item.x,yy=y-item.y,rr=Math.hypot(xx,yy),theta=Math.atan2(yy,xx)*180/Math.PI;
  if(item.kind==='rhombus'){if(handle%2===0)item.b=clamp(Math.abs(yy)*2,1,9);else item.a=clamp(Math.abs(xx)*2,1,9);return true;}
  if(['rectangle','parallelogram'].includes(item.kind)){item.a=clamp(2*Math.abs(xx),1,9);item.b=clamp(2*Math.abs(yy),1,9);return true;}
  if(item.kind==='trapezoid'){item.a=clamp(2*Math.abs(xx),1,9);item.height=clamp(2*Math.abs(yy),1,6);return true;}
  const n=item.kind==='triangle'?3:item.kind==='square'?4:6;
  item.a=clamp(item.kind==='hexagon'?rr:2*rr*Math.sin(Math.PI/n),1,9);
  item.rotation=theta-(item.kind==='triangle'?-90:item.kind==='square'?-45:-30)-handle*360/n;
  return true;
 }
 return false;
}
export function translate(item,dx,dy){if(item.locked||DERIVED_KINDS.includes(item.kind))return false;item.x=clamp(item.x+dx,-14,14);item.y=clamp(item.y+dy,-9,9);return true;}
export function canAttach(kind,parent){return kind==='midpoint'?['segment','line','ray'].includes(parent?.kind):['point','segment','line','ray',...POLYGON_KINDS].includes(parent?.kind);}
const scalarKeys=['x','y','ax','ay','bx','by','theta','a','b','r','rotation','skew','height','axisX','cx','cy'];
export function captureFrame(board,t){return {t,items:board.items.map(item=>{
 const copy={id:item.id,kind:item.kind};for(const k of scalarKeys)if(Number.isFinite(item[k]))copy[k]=item[k];return copy;
 })};}
export function addFrame(board,t){
 const frame=captureFrame(board,clamp(t,0,120));
 const at=board.keyframes.findIndex(f=>Math.abs(f.t-frame.t)<.01);
 if(at>=0)board.keyframes[at]=frame;
 else{
  if(board.keyframes.length>=60){frame.limitReached=true;frame.replacedOldest=true;}
  board.keyframes.push(frame);
 }
 board.keyframes.sort((a,b)=>a.t-b.t);
 if(board.keyframes.length>60)board.keyframes=board.keyframes.slice(-60);
 return frame;
}
export function interpolateBoard(board,frames,seconds){
 if(!frames?.length)return;
 const sorted=[...frames].sort((a,b)=>a.t-b.t),t=clamp(seconds,0,120);
 let a=sorted[0],b=sorted.at(-1);for(let i=0;i<sorted.length;i++){if(sorted[i].t<=t)a=sorted[i];if(sorted[i].t>=t){b=sorted[i];break;}}
 const f=a===b?0:clamp((t-a.t)/(b.t-a.t),0,1),A=new Map(a.items.map(v=>[v.id,v])),B=new Map(b.items.map(v=>[v.id,v]));
 for(const obj of board.items){const x=A.get(obj.id),y=B.get(obj.id)||x;if(!x||!y)continue;for(const k of scalarKeys){if(!finite(x[k])||!finite(y[k]))continue;
  if(k==='rotation'){const d=((y[k]-x[k]+540)%360)-180;obj[k]=x[k]+d*f;}else obj[k]=x[k]+(y[k]-x[k])*f;
 }}
}
export function validateBoard(input){
 if(!input||input.grade!==6||input.schema!=='mathverse.toan6.geometry.v2'||!Array.isArray(input.items)||input.items.length>100)throw Error('Định dạng bảng dựng hình Toán 6 không hợp lệ');
 const ids=new Set(),items=[];
 const positiveScalarKeys=['a','b','r','height'];
 for(const item of input.items){if(!item||![...SHAPE_KINDS,...DERIVED_KINDS].includes(item.kind)||typeof item.id!=='string'||item.id.length>100||ids.has(item.id))throw Error('Vật thể không hợp lệ');ids.add(item.id);
  const clean=newItem(item.kind,0,0,{id:item.id,name:String(item.name||LABELS[item.kind]).slice(0,80),visible:item.visible!==false,locked:item.locked===true});
  for(const k of scalarKeys){
   if(k in item){
    if(!finite(item[k]))throw Error('Số không hợp lệ');
    if(positiveScalarKeys.includes(k)&&Number(item[k])<=0)throw Error(`Kích thước hình học (${k}) phải dương`);
    clean[k]=item[k];
   }
  }
  if(typeof item.parentId==='string')clean.parentId=item.parentId.slice(0,100);
  if(typeof item.color==='string'&&/^#[a-fA-F0-9]{6}$/.test(item.color))clean.color=item.color;
  items.push(clean);
 }
 const byId=new Map(items.map(it=>[it.id,it]));
 for(const o of items){
  const hasParent=Boolean(o.parentId);
  if(DERIVED_KINDS.includes(o.kind)||hasParent){
   if(!o.parentId||!ids.has(o.parentId)||o.parentId===o.id)throw Error('Mất đối tượng gốc của phép dựng');
   const visited=new Set([o.id]);
   let cur=byId.get(o.parentId);
   while(cur){
    if(visited.has(cur.id))throw Error('Phát hiện vòng tham chiếu phụ thuộc giữa các đối tượng hình học: '+o.id);
    visited.add(cur.id);
    cur=cur.parentId?byId.get(cur.parentId):null;
   }
  }
 }
 const tempBoard={schema:'mathverse.toan6.geometry.v2',grade:6,items,keyframes:[],speed:1};
 for(const o of items){
  if(!coords(o,tempBoard))throw Error('Không thể dựng hình phụ thuộc (chu trình tham chiếu hoặc đối tượng gốc không tương thích): '+o.id);
 }
 const frames=[];if(input.keyframes!==undefined){if(!Array.isArray(input.keyframes)||input.keyframes.length>60)throw Error('Số mốc hoạt cảnh không hợp lệ');
  for(const f of input.keyframes){if(!f||!finite(f.t)||f.t<0||f.t>120||!Array.isArray(f.items)||f.items.length>100)throw Error('Mốc hoạt cảnh không hợp lệ');
   const parts=[];for(const p of f.items){if(!p||!ids.has(p.id)||typeof p.kind!=='string')continue;const a={id:p.id,kind:p.kind};for(const k of scalarKeys){if(k in p){if(!finite(p[k]))throw Error('Dữ liệu chuyển động không hợp lệ');if(positiveScalarKeys.includes(k)&&Number(p[k])<=0)throw Error('Kích thước chuyển động phải dương');a[k]=p[k];}}parts.push(a);}
   frames.push({t:f.t,items:parts});
  }
 }
 frames.sort((a,b)=>a.t-b.t);
 return {schema:'mathverse.toan6.geometry.v2',grade:6,items,keyframes:frames,speed:clamp(input.speed||1,.25,3)};
}
export function exportBoard(board){return JSON.stringify(validateBoard(board),null,2);}
