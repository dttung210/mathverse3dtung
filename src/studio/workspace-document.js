/**
 * MATHVERSE V11: typed editable scene documents, independent from the museum catalog.
 * A saved scene never mutates a catalog exhibit or replaces one of the 63 originals.
 * No eval, executable user code, or remote model dependencies.
 */
import { buildGeometry2DScene } from '../math/geometry2d-scenes.js';
import { detectModality } from '../data/migrate-v2-v4-v5.js';
export const WORKSPACE_VERSION = 12;
export const MAX_OBJECTS = 120;
const round = v => Math.round(v * 1000) / 1000;
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(Number(v)) ? Number(v) : lo));
export const clone = value => JSON.parse(JSON.stringify(value));
export const uid = () => `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
const finite2 = (p, fallback=[0,0]) => Array.isArray(p) && p.length===2 && p.every(v=>Number.isFinite(Number(v))) ? p.map(v=>clamp(v,-1000,1000)) : [...fallback];
const finite3 = (p, fallback=[0,0,0]) => Array.isArray(p) && p.length===3 && p.every(v=>Number.isFinite(Number(v))) ? p.map(v=>clamp(v,-1000,1000)) : [...fallback];
const palette=['#0a8192','#e69a41','#7359c8','#1d9c77','#c15b74'];
export function makeDocument(grade=8, dimension='2d'){
  return {schema:'mathverse.workspace',version:WORKSPACE_VERSION,grade,dimension,items:[],snap:true,grid:true,updatedAt:new Date().toISOString()};
}
export function make2D(kind, pos=[0,0], options={}){
  const base={id:uid(),kind,x:round(pos[0]),y:round(pos[1]),angle:0,label:options.label||'Hinh '+kind,
    hidden:false,locked:false,color:options.color||palette[Math.floor(Math.random()*palette.length)]};
  switch(kind){
    case 'point': return {...base,label:options.label||'P'};
    case 'segment':case 'line':case 'ray': return {...base,points:[[-2,0],[2,0]],label:options.label||'AB'};
    case 'triangle': return {...base,points:[[-2,-1.3],[2,-1.3],[0.3,2]],label:options.label||'ABC'};
    case 'rectangle': return {...base,w:options.w||4,h:options.h||2.5,label:options.label||'ABCD'};
    case 'rhombus': return {...base,d1:options.d1||5,d2:options.d2||3.5,label:options.label||'ABCD'};
    case 'circle': return {...base,r:options.r||2,label:options.label||'Duong tron'};
    case 'regularPolygon': return {...base,r:options.r||2,n:options.n||6,label:options.label||'Da giac deu'};
    case 'construction2d': return {...base,primitives:clone(options.primitives||[]),sourceId:options.sourceId||'',label:options.label||'Phep dung mau'};
    case 'circlePoint': return {...base,parentId:options.parentId||'',theta:options.theta||0,label:options.label||'M'};
    case 'midpoint': return {...base,parentId:options.parentId||'',label:options.label||'M'};
    case 'perpBisector':case 'median':case 'altitude':case 'angleBisector':case 'circumcircle':case 'tangentLine': return {...base,parentId:options.parentId||'',vertexIndex:options.vertexIndex||0,label:options.label||kind};
    case 'parallelLine':case 'perpendicularLine':case 'intersectionPoint':return {...base,parentIds:[...(options.parentIds||[])],label:options.label||kind};
    default: throw new Error('Unsupported 2D shape: '+kind);
  }
}
export function make3D(kind, pos=[0,0,0], options={}){
  const base={id:uid(),kind,x:round(pos[0]),y:round(pos[1]),z:round(pos[2]),angle:0,
    sx:1,sy:1,sz:1,hidden:false,locked:false,color:options.color||palette[Math.floor(Math.random()*palette.length)],
    label:options.label||'Khoi '+kind};
  if(kind==='catalog3d')return {...base,sourceId:options.sourceId||'',source:clone(options.source),label:options.label||options.source?.title||'Khoi hinh hoc'};
  if(['box','pyramid','cylinder','cone','sphere','prism'].includes(kind))return {...base};
  throw new Error('Unsupported 3D shape: '+kind);
}
export function fromCatalog(model,dimension,pos){
  const modality=model.modality||detectModality(model.type);
  if(dimension==='3d'){
    if(modality!=='solid3d')return null;
    return make3D('catalog3d',finite3(pos),{source:{id:model.id,type:model.type,grade:model.grade,params:clone(model.params||{}),title:model.title,modality:'solid3d'},sourceId:model.id,label:model.title});
  }
  if(modality!=='geometry2d')return null;
  const p=finite2(pos),params=model.params||{};
  if(model.type==='rhombus')return make2D('rhombus',p,{d1:params.a||5,d2:params.b||3,label:model.title});
  if(model.type==='rectangleSquare')return make2D('rectangle',p,{w:params.a||4,h:params.b||3,label:model.title});
  if(model.type==='circle'||model.type==='circleOxy'){const q=model.type==='circleOxy'?[p[0]+(params.a||0),p[1]+(params.b||0)]:p;return make2D('circle',q,{r:params.r||2,label:model.title});}
  if(model.type==='polygon')return make2D('regularPolygon',p,{n:params.n||6,r:params.r||2,label:model.title});
  // All other catalog types are imported faithfully as one movable construction,
  // not replaced with a generic triangle. Editing the internal constraints
  // remains available via the original single-exhibit viewer.
  return make2D('construction2d',p,{sourceId:model.id,label:model.title,primitives:buildGeometry2DScene(model.type,params,model.grade).primitives});
}
export const is2D = item => ['point','segment','line','ray','triangle','rectangle','rhombus','circle','regularPolygon','construction2d','circlePoint','midpoint','perpBisector','parallelLine','perpendicularLine','median','altitude','angleBisector','intersectionPoint','circumcircle','tangentLine'].includes(item.kind);
export const is3D = item => ['box','pyramid','cylinder','cone','sphere','prism','catalog3d'].includes(item.kind);
export const MAX_POLYGON_SIDES = 64;
export function validateDocument(raw,expectedGrade,dimension){
  if(!raw||raw.schema!=='mathverse.workspace'||!Array.isArray(raw.items))throw new Error('Not a MATHVERSE scene document.');
  if(raw.items.length>MAX_OBJECTS)throw new Error('Too many scene objects.');
  if(raw.grade!==expectedGrade||raw.dimension!==dimension)throw new Error('Scene grade or dimension mismatch.');
  const ids=new Set();
  const positiveKeys=['r','w','h','d1','d2','sx','sy','sz'];
  const items=raw.items.map(item=>{
    if(!item||typeof item!=='object'||Array.isArray(item))throw new Error('Invalid shape.');
    if((dimension==='2d'&&!is2D(item))||(dimension==='3d'&&!is3D(item)))throw new Error('Wrong shape type.');
    if(typeof item.id!=='string'||!item.id||ids.has(item.id))throw new Error('Duplicate or missing shape ID.');
    ids.add(item.id);
    for(const key of ['x','y','z','angle','sx','sy','sz','r','w','h','d1','d2']){
      if(key in item && !Number.isFinite(Number(item[key])))throw new Error('Non-finite shape coordinate.');
    }
    for(const key of positiveKeys){
      if(key in item && Number(item[key])<=0)throw new Error(`Invalid non-positive dimension (${key}): must be > 0.`);
    }
    if(item.kind==='circle' && (!('r' in item) || Number(item.r)<=0))throw new Error('Circle radius r must be positive (r > 0).');
    if(item.kind==='regularPolygon'){
      if(!('r' in item) || Number(item.r)<=0)throw new Error('Regular polygon radius r must be positive (r > 0).');
      const nVal=Number(item.n);
      if(!Number.isInteger(nVal)||nVal<3||nVal>MAX_POLYGON_SIDES)throw new Error(`Regular polygon vertex count n must be an integer between 3 and ${MAX_POLYGON_SIDES}.`);
    }
    if(item.kind==='rectangle' && (Number(item.w)<=0 || Number(item.h)<=0))throw new Error('Rectangle dimensions w and h must be positive.');
    if(item.kind==='rhombus' && (Number(item.d1)<=0 || Number(item.d2)<=0))throw new Error('Rhombus diagonals d1 and d2 must be positive.');
    const clean={...clone(item),label:String(item.label||'Shape').slice(0,100),hidden:!!item.hidden,locked:!!item.locked};
    for(const key of ['x','y','z','angle']){
      if(key in clean){if(!Number.isFinite(Number(clean[key])))throw new Error('Non-finite shape coordinate.');clean[key]=clamp(clean[key],-1000,1000);}
    }
    for(const key of positiveKeys){
      if(key in clean){if(!Number.isFinite(Number(clean[key]))||Number(clean[key])<=0)throw new Error(`Invalid non-positive dimension (${key}).`);clean[key]=clamp(clean[key],0.05,1000);}
    }
    if(clean.kind==='regularPolygon')clean.n=Math.round(clamp(clean.n,3,MAX_POLYGON_SIDES));
    if(clean.points){if(!Array.isArray(clean.points)||clean.points.length>32)throw new Error('Invalid point array.');clean.points=clean.points.map(q=>finite2(q));}
    if(clean.kind==='construction2d'){
      if(!Array.isArray(clean.primitives)||clean.primitives.length>400)throw new Error('Invalid construction.');
      const validXY=p=>Array.isArray(p)&&p.length===2&&p.every(q=>Number.isFinite(Number(q))&&Math.abs(Number(q))<=10000);
      for(const shape of clean.primitives){
        if(shape.kind==='line'&&(!validXY(shape.a)||!validXY(shape.b)))throw new Error('Invalid construction line.');
        if(['point'].includes(shape.kind)&&!validXY(shape.xy))throw new Error('Invalid construction point.');
        if(['circle','ellipse','arc'].includes(shape.kind)&&!validXY(shape.center))throw new Error('Invalid construction circle.');
        if(['polygon','curve'].includes(shape.kind)&&(!Array.isArray(shape.pts)||shape.pts.length>500||!shape.pts.every(validXY)))throw new Error('Invalid construction polygon.');
      }
    }
    if(clean.parentId!==undefined && typeof clean.parentId!=='string')throw new Error('Invalid dependent id.');
    if(clean.parentIds!==undefined && (!Array.isArray(clean.parentIds)||clean.parentIds.length>2||!clean.parentIds.every(p=>typeof p==='string')))throw new Error('Invalid dependent references.');
    if(clean.sectionFraction!==undefined)clean.sectionFraction=clamp(clean.sectionFraction,.02,.98);
    if(clean.kind==='catalog3d' && (!clean.source||typeof clean.source.type!=='string'))throw new Error('Missing source model.');
    return clean;
  });
  const ids2=new Set(items.map(x=>x.id));
  const byId=new Map(items.map(x=>[x.id,x]));
  for(const item of items){
    if(item.parentId&&!ids2.has(item.parentId))throw new Error('Missing dependency: '+item.parentId);
    if(item.parentIds?.some(id=>!ids2.has(id)))throw new Error('Missing linked object.');
    if(item.parentId===item.id||(item.parentIds&&item.parentIds.includes(item.id)))throw new Error('Cyclic dependency on shape: '+item.id);
    const visited=new Set([item.id]);
    const stack=[...(item.parentId?[item.parentId]:[]),...(Array.isArray(item.parentIds)?item.parentIds:[])];
    while(stack.length){
      const pid=stack.pop();
      if(pid===item.id)throw new Error('Cyclic dependency detected involving: '+item.id);
      if(visited.has(pid))continue;
      visited.add(pid);
      const pObj=byId.get(pid);
      if(!pObj)continue;
      if(pObj.parentId)stack.push(pObj.parentId);
      if(Array.isArray(pObj.parentIds))stack.push(...pObj.parentIds);
    }
  }
  const motionKeys=['x','y','z','angle','sx','sy','sz','r','w','h','d1','d2','theta','sectionFraction'];
  let motion;
  if(raw.motion!==undefined){
    if(!raw.motion||typeof raw.motion!=='object'||!Array.isArray(raw.motion.keyframes)||raw.motion.keyframes.length>60)throw new Error('Invalid motion timeline.');
    motion={keyframes:[],speed:clamp(raw.motion.speed||1,.25,3)};
    for(const frame of raw.motion.keyframes){
      if(!Number.isFinite(frame.at)||frame.at<0||frame.at>300||!Array.isArray(frame.items)||frame.items.length>MAX_OBJECTS)throw new Error('Invalid motion frame.');
      const cleanFrame={at:frame.at,items:[]},seen=new Set();
      for(const point of frame.items){
        if(!point||typeof point.id!=='string'||seen.has(point.id))throw new Error('Invalid animation object.');
        const item=byId.get(point.id);if(!item||item.kind!==point.kind)continue;
        seen.add(point.id);const fixed={id:item.id,kind:item.kind};
        for(const key of motionKeys){if(key in point){
          if(!Number.isFinite(point[key])||Math.abs(point[key])>10000)throw new Error('Invalid motion number.');
          if(positiveKeys.includes(key)&&point[key]<=0)throw new Error('Invalid non-positive motion dimension.');
          fixed[key]=point[key];
        }}
        if(point.points!==undefined){if(!Array.isArray(point.points)||point.points.length>32||!point.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(v=>Number.isFinite(v)&&Math.abs(v)<=10000)))throw new Error('Invalid motion points.');
          fixed.points=clone(point.points);
        }
        cleanFrame.items.push(fixed);
      }
      motion.keyframes.push(cleanFrame);
    }
    motion.keyframes.sort((a,b)=>a.at-b.at);
  }
  return {...makeDocument(expectedGrade,dimension),items,snap:raw.snap!==false,grid:raw.grid!==false,...(motion?{motion}: {})};
}
export function localCoords(item,world){
  const dx=world[0]-item.x,dy=world[1]-item.y,a=(item.angle||0)*Math.PI/180;
  return [dx*Math.cos(a)+dy*Math.sin(a),-dx*Math.sin(a)+dy*Math.cos(a)];
}
export function worldCoords(item,local){
  const a=(item.angle||0)*Math.PI/180;
  return [item.x+local[0]*Math.cos(a)-local[1]*Math.sin(a),item.y+local[0]*Math.sin(a)+local[1]*Math.cos(a)];
}
export function vertices(item){
  switch(item.kind){
    case 'point':return [[0,0]];
    case 'segment':case 'line':case 'ray':case 'triangle':return item.points;
    case 'rectangle':{const w=Math.max(0.05,Math.abs(Number(item.w)||0)),h=Math.max(0.05,Math.abs(Number(item.h)||0));return [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];}
    case 'rhombus':{const d1=Math.max(0.05,Math.abs(Number(item.d1)||0)),d2=Math.max(0.05,Math.abs(Number(item.d2)||0));return [[0,d2/2],[d1/2,0],[0,-d2/2],[-d1/2,0]];}
    case 'circle':{const r=Math.max(0.05,Math.abs(Number(item.r)||0));return [[r,0]];}
    case 'regularPolygon':{
      const rawN=Number(item.n);
      if(!Number.isFinite(rawN)||rawN<3)return [];
      const n=Math.min(MAX_POLYGON_SIDES,Math.floor(rawN));
      const r=Math.max(0.05,Math.abs(Number(item.r)||0));
      return Array.from({length:n},(_,i)=>[r*Math.cos(2*Math.PI*i/n-Math.PI/2),r*Math.sin(2*Math.PI*i/n-Math.PI/2)]);
    }
    default:return [];
  }
}
export function set2DHandle(item,index,target){
  if(item.locked)return false;
  const [x,y]=localCoords(item,target);
  switch(item.kind){
    case 'point':item.x=round(target[0]);item.y=round(target[1]);return true;
    case 'segment':case 'line':case 'ray':{const pts=clone(item.points);pts[index]=[round(x),round(y)];if(Math.hypot(pts[0][0]-pts[1][0],pts[0][1]-pts[1][1])<.15)return false;item.points=pts;return true;}
    case 'triangle':{
      const pts=clone(item.points);pts[index]=[round(x),round(y)];const cross=(pts[1][0]-pts[0][0])*(pts[2][1]-pts[0][1])-(pts[1][1]-pts[0][1])*(pts[2][0]-pts[0][0]);if(Math.abs(cross)<.15)return false;item.points=pts;return true;
    }
    case 'rectangle':item.w=round(clamp(2*Math.abs(x),.2,50));item.h=round(clamp(2*Math.abs(y),.2,50));return true;
    case 'rhombus':if(index%2===0)item.d2=round(clamp(2*Math.abs(y),.2,50));else item.d1=round(clamp(2*Math.abs(x),.2,50));return true;
    case 'circle':case 'regularPolygon':item.r=round(clamp(Math.hypot(x,y),.2,50));return true;
    default:return false;
  }
}
export function distance(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1]);}
export function derived2DPosition(item,doc){
  const parent=doc.items.find(v=>v.id===item.parentId&&!v.hidden);
  if(!parent)return [item.x,item.y];
  if(item.kind==='midpoint'&&parent.kind==='segment'){
    const p=vertices(parent).map(v=>worldCoords(parent,v));return [(p[0][0]+p[1][0])/2,(p[0][1]+p[1][1])/2];
  }
  if(item.kind==='circlePoint'&&parent.kind==='circle')return worldCoords(parent,[parent.r*Math.cos(item.theta),parent.r*Math.sin(item.theta)]);
  return [item.x,item.y];
}
export function metrics2D(item){
  const n=v=>Math.round(v*100)/100;
  if(item.kind==='rhombus'){
    const d1=Number(item.d1),d2=Number(item.d2);
    if(!Number.isFinite(d1)||!Number.isFinite(d2)||d1<=0||d2<=0)return {area:0,perimeter:0};
    return {area:n(d1*d2/2),perimeter:n(2*Math.hypot(d1,d2))};
  }
  if(item.kind==='rectangle'){
    const w=Number(item.w),h=Number(item.h);
    if(!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0)return {area:0,perimeter:0};
    return {area:n(w*h),perimeter:n(2*(w+h))};
  }
  if(item.kind==='circle'){
    const r=Number(item.r);
    if(!Number.isFinite(r)||r<=0)return {area:0,circumference:0};
    return {area:n(Math.PI*r**2),circumference:n(2*Math.PI*r)};
  }
  if(item.kind==='regularPolygon'){
    const r=Number(item.r),rawN=Number(item.n);
    if(!Number.isFinite(r)||r<=0||!Number.isInteger(rawN)||rawN<3||rawN>MAX_POLYGON_SIDES)return {area:0};
    return {area:n(rawN*r*r*Math.sin(2*Math.PI/rawN)/2)};
  }
  if(['segment','line','ray'].includes(item.kind))return item.kind==='segment'?{length:n(distance(...item.points))}:{};
  if(item.kind==='triangle'){
    const pts=item.points;return {area:n(Math.abs((pts[1][0]-pts[0][0])*(pts[2][1]-pts[0][1])-(pts[1][1]-pts[0][1])*(pts[2][0]-pts[0][0]))/2)};
  }
  return {};
}

export function constrainScale3D(item,axis,value){
  if(!['x','y','z'].includes(axis)||!Number.isFinite(value))return false;
  const v=Math.round(clamp(value,.15,10)*100)/100;
  item['s'+axis]=v;
  const family=item.kind==='catalog3d'?item.source?.type:item.kind;
  if(['sphere','oxyzSphere','sphereSection','cube','tetrahedron'].includes(family))item.sx=item.sy=item.sz=v;
  if(['cylinder','cone','pyramid','prism','squarePyramid','trianglePyramid'].includes(family)&&['x','z'].includes(axis))item.sx=item.sz=v;
  return true;
}
