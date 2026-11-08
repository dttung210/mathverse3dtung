/** Plane/polyhedron intersection in local 3D coordinates. No Three.js dependency.
 * Supports a plane rotated around Oz: sin(theta)x + cos(theta)y = offset.
 * Also supports arbitrary cutting plane through 3 points M, N, P (E08).
 * Used for actual sections, not a projected decorative polygon.
 */
import { planeThrough3, convexSection } from './geometry-v3-core.mjs';

const sub = (a,b)=>a.map((x,i)=>x-b[i]);
const dot = (a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
const dist = (a,b)=>Math.hypot(...sub(a,b));
const mix = (a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);
const clamp = (v,lo,hi)=>Math.min(hi,Math.max(lo,Number.isFinite(Number(v))?Number(v):lo));

export function polyhedronEdges(type, p) {
  let vertices, edges;
  if(type==='cube'||type==='cuboid'||type==='tdhop') {
    const a=Number(p.a);
    const b=(type==='cube'||(type==='tdhop'&&p.b===undefined))?a:Number(p.b);
    const h=(type==='cube'||(type==='tdhop'&&p.h===undefined))?a:Number(p.h);
    if(![a,b,h].every(x=>Number.isFinite(x)&&x>0))return null;
    vertices=[[-a/2,-h/2,-b/2],[a/2,-h/2,-b/2],[a/2,-h/2,b/2],[-a/2,-h/2,b/2],
              [-a/2,h/2,-b/2],[a/2,h/2,-b/2],[a/2,h/2,b/2],[-a/2,h/2,b/2]];
    edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  }else if(type==='squarePyramid'||type==='chop4'||type==='tdchop4'){
    const a=Number(p.a),h=Number(p.h);
    if(![a,h].every(x=>Number.isFinite(x)&&x>0))return null;
    vertices=[[-a/2,-h/2,-a/2],[a/2,-h/2,-a/2],[a/2,-h/2,a/2],[-a/2,-h/2,a/2],[0,h/2,0]];
    edges=[[0,1],[1,2],[2,3],[3,0],[0,4],[1,4],[2,4],[3,4]];
  }else if(type==='tetrahedron'||type==='tdtudien'){
    const a=Number(p.a||3.5), h=Number(p.h||(a*Math.sqrt(2/3)));
    if(![a,h].every(x=>Number.isFinite(x)&&x>0))return null;
    const R=a/Math.sqrt(3), r=a/(2*Math.sqrt(3));
    vertices=[[0,-h/2,R],[-a/2,-h/2,-r],[a/2,-h/2,-r],[0,h/2,0]];
    edges=[[0,1],[1,2],[2,0],[0,3],[1,3],[2,3]];
  }else if(type==='triPrism'||type==='triangularPrism'||type==='tdlangtru'){
    const a=Number(p.a||3.5), h=Number(p.h||4);
    if(![a,h].every(x=>Number.isFinite(x)&&x>0))return null;
    const R=a/Math.sqrt(3), r=a/(2*Math.sqrt(3));
    vertices=[[0,-h/2,R],[-a/2,-h/2,-r],[a/2,-h/2,-r],
              [0,h/2,R],[-a/2,h/2,-r],[a/2,h/2,-r]];
    edges=[[0,1],[1,2],[2,0],[3,4],[4,5],[5,3],[0,3],[1,4],[2,5]];
  }else if(type==='frustumPyramid'||type==='chopcut4'){
    const a1=Number(p.a||p.a1||4), a2=Number(p.b||p.a2||2), h=Number(p.h||4);
    if(![a1,a2,h].every(x=>Number.isFinite(x)&&x>0))return null;
    vertices=[[-a1/2,-h/2,-a1/2],[a1/2,-h/2,-a1/2],[a1/2,-h/2,a1/2],[-a1/2,-h/2,a1/2],
              [-a2/2,h/2,-a2/2],[a2/2,h/2,-a2/2],[a2/2,h/2,a2/2],[-a2/2,h/2,a2/2]];
    edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  }else return null;
  return {vertices,edges};
}

export function obliqueSection(type,p,heightPercent=50,tiltDegrees=0,mnp=null){
  const shape=polyhedronEdges(type,p);
  if(!shape)return null;

  // If arbitrary 3 points M, N, P are supplied, use convexSection (E08)
  if(mnp && mnp.M && mnp.N && mnp.P) {
    const res = convexSection(shape.vertices, shape.edges, mnp.M, mnp.N, mnp.P);
    const vertices = res.vertices;
    const perimeter = vertices.reduce((sum,a,i)=>sum+dist(a,vertices[(i+1)%vertices.length]),0);
    return {
      vertices,
      planeVertices: vertices.map(v => [v[0], v[2]]),
      area: res.area,
      perimeter,
      normal: res.plane.normal,
      offset: res.plane.offset,
      tiltDegrees: 0,
      heightPercent: 50,
      classification: res.classification,
      mnp
    };
  }

  const theta=clamp(tiltDegrees,-65,65)*Math.PI/180;
  const normal=[Math.sin(theta),Math.cos(theta),0];
  const u=[Math.cos(theta),-Math.sin(theta),0],w=[0,0,1];
  const positions=shape.vertices.map(v=>dot(v,normal));
  const min=Math.min(...positions),max=Math.max(...positions);
  const t=clamp(heightPercent,1,99)/100,offset=min+(max-min)*t;
  const epsilon=1e-8*Math.max(1,...shape.vertices.flat().map(Math.abs));
  const raw=[];
  const addUnique=p=>{if(!raw.some(q=>dist(q,p)<epsilon*4))raw.push(p);};
  for(const [a,b] of shape.edges){
    const v0=shape.vertices[a],v1=shape.vertices[b];
    const d0=dot(v0,normal)-offset,d1=dot(v1,normal)-offset;
    if(Math.abs(d0)<epsilon)addUnique(v0);
    if(Math.abs(d1)<epsilon)addUnique(v1);
    if(d0*d1 < -(epsilon*epsilon))addUnique(mix(v0,v1,d0/(d0-d1)));
  }
  if(raw.length<3)return {vertices:[],planeVertices:[],area:0,perimeter:0,normal,offset,tiltDegrees:theta*180/Math.PI,heightPercent:heightPercent};
  const center=[0,1,2].map(j=>raw.reduce((sum,v)=>sum+v[j],0)/raw.length);
  const oriented=raw.map(v=>({v,uv:[dot(sub(v,center),u),dot(sub(v,center),w)]}));
  oriented.sort((a,b)=>Math.atan2(a.uv[1],a.uv[0])-Math.atan2(b.uv[1],b.uv[0]));
  const vertices=oriented.map(item=>item.v),planeVertices=oriented.map(item=>item.uv);
  const area=Math.abs(planeVertices.reduce((sum,a,i)=>{
    const b=planeVertices[(i+1)%planeVertices.length];return sum+a[0]*b[1]-b[0]*a[1];
  },0))/2;
  const perimeter=vertices.reduce((sum,a,i)=>sum+dist(a,vertices[(i+1)%vertices.length]),0);
  return {vertices,planeVertices,area,perimeter,normal,offset,tiltDegrees:theta*180/Math.PI,heightPercent:clamp(heightPercent,1,99)};
}

export function obliqueSectionThroughPoints(type, p, M, N, P) {
  return obliqueSection(type, p, 50, 0, { M, N, P });
}
