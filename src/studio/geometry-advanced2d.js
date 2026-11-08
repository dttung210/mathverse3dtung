/** V12 - deterministic, editable dependent Euclidean constructions.
 * Reference objects by persistent ids; no eval, snippets or arbitrary scripts.
 */
import { vertices, worldCoords, derived2DPosition } from './workspace-document.js?v=r107_v15';
const EPS=1e-9;
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
const mul=(a,s)=>[a[0]*s,a[1]*s];
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
const norm=a=>Math.hypot(...a);
const perpendicular=a=>[-a[1],a[0]];
const direction=a=>{const n=norm(a);return n>EPS?mul(a,1/n):null;};
export function lineIntersection(a,b,c,d){
  const v=sub(b,a),w=sub(d,c),det=cross(v,w);
  if(Math.abs(det)<EPS)return null;
  const t=cross(sub(c,a),w)/det;
  const p=add(a,mul(v,t));return p.every(Number.isFinite)?p:null;
}
export function projectPoint(p,a,b){
  const d=sub(b,a),den=d[0]*d[0]+d[1]*d[1];
  if(den<EPS)return null;
  const t=(sub(p,a)[0]*d[0]+sub(p,a)[1]*d[1])/den;
  return add(a,mul(d,t));
}
export function circumcircle(a,b,c){
  const ab=sub(b,a),ac=sub(c,a),den=2*cross(ab,ac);
  if(Math.abs(den)<EPS)return null;
  const v=(ab[0]*ab[0]+ab[1]*ab[1]),w=(ac[0]*ac[0]+ac[1]*ac[1]);
  const center=add(a,[(ac[1]*v-ab[1]*w)/den,(ab[0]*w-ac[0]*v)/den]);
  const r=norm(sub(center,a));return Number.isFinite(r)&&r>EPS?{center,r}:null;
}
const rawWorldPoints=item=>vertices(item).map(p=>worldCoords(item,p));
export function geometryFor(item,doc,depth=0){
  if(!item||depth>10)return null;
  const lookup=id=>doc.items.find(q=>q.id===id);
  const dep=id=>geometryFor(lookup(id),doc,depth+1);
  const parent=()=>dep(item.parentId);
  const linked=(item.parentIds||[]).map(dep);
  if(['point','midpoint','circlePoint'].includes(item.kind))return {type:'point',p:derived2DPosition(item,doc)};
  if(['segment','line','ray'].includes(item.kind)){
    const pts=rawWorldPoints(item);if(pts.length<2)return null;
    return {type:item.kind,a:pts[0],b:pts[1]};
  }
  if(item.kind==='triangle')return {type:'triangle',vertices:rawWorldPoints(item)};
  if(item.kind==='circle')return {type:'circle',center:[item.x,item.y],r:item.r};
  if(item.kind==='perpBisector'){
    const base=parent();if(!base?.a||!base?.b)return null;
    const m=mul(add(base.a,base.b),.5),v=direction(perpendicular(sub(base.b,base.a)));
    return v?{type:'line',a:m,b:add(m,v)}:null;
  }
  if(['parallelLine','perpendicularLine'].includes(item.kind)){
    const [pt,base]=linked;
    if(pt?.type!=='point'||!base?.a||!base?.b)return null;
    const v=direction(item.kind==='parallelLine'?sub(base.b,base.a):perpendicular(sub(base.b,base.a)));
    return v?{type:'line',a:pt.p,b:add(pt.p,v)}:null;
  }
  if(['median','altitude','angleBisector'].includes(item.kind)){
    const tri=parent();if(tri?.type!=='triangle')return null;
    const v=tri.vertices,i=Math.min(2,Math.max(0,item.vertexIndex||0)),a=v[i],b=v[(i+1)%3],c=v[(i+2)%3];
    let target;
    if(item.kind==='median')target=mul(add(b,c),.5);
    if(item.kind==='altitude')target=projectPoint(a,b,c);
    if(item.kind==='angleBisector'){
      const u=direction(sub(b,a)),w=direction(sub(c,a));
      if(!u||!w)return null;
      const ray=add(u,w),d=direction(ray);if(!d)return null;
      target=lineIntersection(a,add(a,d),b,c);
    }
    return target?{type:'segment',a,b:target}:null;
  }
  if(item.kind==='intersectionPoint'){
    const [a,b]=linked;if(!a?.a||!a?.b||!b?.a||!b?.b)return null;
    const p=lineIntersection(a.a,a.b,b.a,b.b);return p?{type:'point',p}:null;
  }
  if(item.kind==='circumcircle'){
    const tri=parent();if(tri?.type!=='triangle')return null;
    const result=circumcircle(...tri.vertices);return result?{type:'circle',...result}:null;
  }
  if(item.kind==='tangentLine'){
    const pt=parent();if(pt?.type!=='point')return null;
    const pointObj=lookup(item.parentId),circle=lookup(pointObj?.parentId);
    if(circle?.kind!=='circle')return null;
    const radial=sub(pt.p,[circle.x,circle.y]),v=direction(perpendicular(radial));
    return v?{type:'line',a:pt.p,b:add(pt.p,v)}:null;
  }
  return null;
}
/** Screen clipping: world bounding rectangle [left,right,bottom,top]. */
export function clipInfiniteLine(a,b,bounds,isRay=false){
  if(!a||!b||!bounds)return null;
  const d=sub(b,a),norm2=d[0]**2+d[1]**2;if(norm2<EPS)return null;
  const [left,right,bottom,top]=bounds,ts=[];
  if(Math.abs(d[0])>EPS){ts.push((left-a[0])/d[0],(right-a[0])/d[0]);}
  if(Math.abs(d[1])>EPS){ts.push((bottom-a[1])/d[1],(top-a[1])/d[1]);}
  const valid=ts.filter(t=>Number.isFinite(t)&&(!isRay||t>=-EPS)).map(t=>[t,add(a,mul(d,t))]).filter(([t,p])=>p[0]>=left-1e-6&&p[0]<=right+1e-6&&p[1]>=bottom-1e-6&&p[1]<=top+1e-6);
  if(isRay&&a[0]>=left&&a[0]<=right&&a[1]>=bottom&&a[1]<=top)valid.push([0,a]);
  valid.sort((u,v)=>u[0]-v[0]);
  return valid.length>=2?[valid[0][1],valid.at(-1)[1]]:null;
}
export const ADVANCED_KINDS=['line','ray','perpBisector','parallelLine','perpendicularLine','median','altitude','angleBisector','intersectionPoint','circumcircle','tangentLine'];
export function canBuildDerived(kind,parents){
  const k=parents.map(p=>p?.kind);
  if(['perpBisector'].includes(kind))return k.length===1&&k[0]==='segment';
  if(['median','altitude','angleBisector','circumcircle'].includes(kind))return k.length===1&&k[0]==='triangle';
  if(kind==='tangentLine')return k.length===1&&k[0]==='circlePoint';
  if(['parallelLine','perpendicularLine'].includes(kind))return k.length===2&&['point','midpoint','circlePoint','intersectionPoint'].includes(k[0])&&['segment','line','ray','perpBisector','parallelLine','perpendicularLine'].includes(k[1]);
  if(kind==='intersectionPoint')return k.length===2&&k.every(v=>['segment','line','ray','perpBisector','parallelLine','perpendicularLine'].includes(v));
  return false;
}
