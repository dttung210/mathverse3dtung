/**
 * Pure, dependency-free Euclidean coordinate presets for 17 foldable polyhedra.
 * No mutations to MATHVERSE source are required to import this file.
 * Face indices are oriented outward for consistent hinge normals.
 */
const EPS = 1e-9;
const pos = (p, fallback = 1) => Number.isFinite(Number(p)) && Number(p) > EPS ? Number(p) : fallback;
const val = (p, fallback = 0) => Number.isFinite(Number(p)) ? Number(p) : fallback;
const add = (a,b) => [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub = (a,b) => [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const norm = p => Math.hypot(...p);
const avg = xs => xs.reduce((s,p)=>add(s,p),[0,0,0]).map(t=>t/xs.length);
function oriented(vertices, faces){
 const center = avg(vertices);
 return faces.map(face=>{
  const a=vertices[face[0]],b=vertices[face[1]],c=vertices[face[2]];
  const n=cross(sub(b,a),sub(c,a));
  const facecenter=avg(face.map(i=>vertices[i]));
  return dot(n,sub(facecenter,center)) >= 0 ? [...face] : [...face].reverse();
 });
}
function build(vertices, faces, parents, category, metrics, params){
 const v=vertices.map(p=>[...p]);
 const f=oriented(v,faces);
 if(parents.length!==f.length)throw Error('Parent count differs from face count');
 return {vertices:v,faces:f,parents:[...parents],category,metrics,params};
}
function simplePrism(base2D, vector, params={}){
 const n=base2D.length;
 const bottom=base2D.map(([x,y])=>[x,y,0]);
 const top=bottom.map(p=>add(p,vector));
 const vertices=[...bottom,...top];
 const faces=[
  Array.from({length:n},(_,i)=>i),
  Array.from({length:n},(_,i)=>n+i),
  ...Array.from({length:n},(_,i)=>[i,(i+1)%n,(i+1)%n+n,i+n]),
 ];
 // Cross net for quadrilaterals; uninterrupted side strip for triangular prisms.
 const parents=n===3? [2,2,-1,2,3] : [-1,2,...Array(n).fill(0)];
 const edgeLengths=base2D.map((p,i)=>Math.hypot(p[0]-base2D[(i+1)%n][0],p[1]-base2D[(i+1)%n][1]));
 const baseArea=Math.abs(base2D.reduce((s,p,i)=>s+p[0]*base2D[(i+1)%n][1]-base2D[(i+1)%n][0]*p[1],0)/2);
 const h=vector[2];
 const lateral=norm(vector)*edgeLengths.reduce((s,x)=>s+x,0); // corrected below for oblique prisms via cross product
 const actualLateral=edgeLengths.reduce((s,edge,i)=>{
  const side=sub(bottom[(i+1)%n],bottom[i]);
  return s+norm(cross(side,vector));
 },0);
 return build(vertices,faces,parents,'prism',{
  faces:n+2,vertices:n*2,edges:n*3,
  baseArea,basePerimeter:edgeLengths.reduce((s,x)=>s+x,0),
  lateralArea:actualLateral,totalArea:actualLateral+2*baseArea,
  volume:baseArea*Math.abs(h),h,oblique:Math.hypot(vector[0],vector[1])>EPS
 },params);
}
function pyramid(base2D, apex, params={}){
 const n=base2D.length;
 const vertices=[...base2D.map(([x,y])=>[x,y,0]), [...apex]];
 const faces=[Array.from({length:n},(_,i)=>i),...Array.from({length:n},(_,i)=>[i,(i+1)%n,n])];
 const parents=[-1,...Array(n).fill(0)];
 const baseArea=Math.abs(base2D.reduce((s,p,i)=>s+p[0]*base2D[(i+1)%n][1]-base2D[(i+1)%n][0]*p[1],0)/2);
 const lateralArea=base2D.reduce((s,p,i)=>s+norm(cross(sub(vertices[(i+1)%n],vertices[i]),sub(apex,vertices[i])))/2,0);
 return build(vertices,faces,parents,'pyramid',{
  faces:n+1,vertices:n+1,edges:n*2,baseArea,lateralArea,totalArea:baseArea+lateralArea,
  volume:baseArea*Math.abs(apex[2])/3,h:apex[2]
 },params);
}
function rectangle(a,b){return [[-a/2,-b/2],[a/2,-b/2],[a/2,b/2],[-a/2,b/2]];}
function triangleEquilateral(a){
 const r=a/Math.sqrt(3);
 return [0,1,2].map(i=>[r*Math.cos(Math.PI/2+2*Math.PI*i/3),r*Math.sin(Math.PI/2+2*Math.PI*i/3)]);
}
function centerCircle(a,b,c){
 const x1=a[0],y1=a[1],x2=b[0],y2=b[1],x3=c[0],y3=c[1];
 const d=2*(x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2));
 if(Math.abs(d)<EPS)throw Error('Tam giac suy bien, khong tim duoc tam ngoai tiep');
 const u1=x1*x1+y1*y1,u2=x2*x2+y2*y2,u3=x3*x3+y3*y3;
 return [(u1*(y2-y3)+u2*(y3-y1)+u3*(y1-y2))/d,
         (u1*(x3-x2)+u2*(x1-x3)+u3*(x2-x1))/d];
}
function squareFrustum(a,b,h,p){
 if(!(a>b))throw Error('Chop cut can co canh day lon hon canh day nho');
 const lower=rectangle(a,a).map(([x,y])=>[x,y,0]);
 const upper=rectangle(b,b).map(([x,y])=>[x,y,h]);
 const vertices=[...lower,...upper];
 const faces=[[0,1,2,3],[4,5,6,7],...Array.from({length:4},(_,i)=>[i,(i+1)%4,(i+1)%4+4,i+4])];
 const parent=[-1,2,0,0,0,0];
 const s=Math.hypot(h,(a-b)/2);
 return build(vertices,faces,parent,'frustum',{
  faces:6,vertices:8,edges:12,baseArea:a*a,smallBaseArea:b*b,h,
  lateralArea:2*(a+b)*s,totalArea:2*(a+b)*s+a*a+b*b,
  volume:h*(a*a+a*b+b*b)/3,slantHeight:s
 },p);
}
/** 1-based numbering corresponds exactly to the NotebookLM source inventory. */
export function makePolyhedron(index, input={}){
 const p={...input};
 const a=pos(p.a,2),b=pos(p.b,1.5),h=pos(p.h,2);
 switch(index){
  case 1: return simplePrism(rectangle(a,a),[0,0,a],p);
  case 2: return simplePrism(rectangle(a,b),[0,0,h],p);
  case 3: return simplePrism(triangleEquilateral(a),[0,0,h],p);
  case 4: {const x=pos(p.a,3),t=pos(p.b,2),y=pos(p.height,2);
   return simplePrism([[-x/2,-y/2],[x/2,-y/2],[t-x/2,y/2],[-x/2,y/2]],[0,0,h],p);}
  case 5: return simplePrism([[0,0],[a,0],[0,b]],[0,0,h],p);
  case 6: return pyramid(triangleEquilateral(a),[0,0,h],p);
  case 7: return pyramid(rectangle(a,a),[0,0,h],p);
  case 10: {const base=rectangle(a,b);return pyramid(base,[...base[0],h],p);}
  case 11: {const base=[[0,0],[a,0],[a,b]];return pyramid(base,[0,0,h],p);}
  case 12: return pyramid(triangleEquilateral(a),[0,0,a*Math.sqrt(2/3)],p);
  case 13: {
   // O=(0,0,0), OA perpendicular OB perpendicular OC, all pairwise orthogonal.
   const vertices=[[0,0,0],[a,0,0],[0,b,0],[0,0,pos(p.c,2)]];
   const faces=[[0,1,2],[0,1,3],[0,2,3],[1,2,3]];
   return build(vertices,faces,[-1,0,0,0],'tetra-trirect',{
    faces:4,vertices:4,edges:6,volume:a*b*pos(p.c,2)/6,
    totalArea:(a*b+b*pos(p.c,2)+a*pos(p.c,2)+Math.sqrt((a*b)**2+(b*pos(p.c,2))**2+(a*pos(p.c,2))**2))/2,
    areas:[a*b/2,b*pos(p.c,2)/2,a*pos(p.c,2)/2,
      Math.sqrt((a*b)**2+(b*pos(p.c,2))**2+(a*pos(p.c,2))**2)/2]
   },p);
  }
  case 14: return squareFrustum(a,b,h,p);
  case 15: return pyramid(rectangle(a,b),[0,-b/2,h],p);
  case 16: {const c=pos(p.hbase,1.5);return pyramid([[0,0],[0,-c],[a,-c],[2*a,0]],[0,0,h],p);}
  case 17: {const base=[[-a*0.45,-a*0.24],[a*0.58,-a*0.15],[a*0.06,a*0.63]];
   const o=centerCircle(...base);return pyramid(base,[o[0],o[1],h],p);}
  case 19: return simplePrism(rectangle(a,b),[val(p.shearX,0.8),val(p.shearY,0.3),h],p);
  case 20: return simplePrism([[0,0],[a,0],[a*0.27,b]],[val(p.shearX,0.8),val(p.shearY,0.3),h],p);
  default: throw Error(`Not a polyhedron model: ${index}`);
 }
}
export function triangleArea(a,b,c){return norm(cross(sub(b,a),sub(c,a)))/2;}
export function faceArea(vertices,face){
 let area=0;for(let i=1;i<face.length-1;i++)area+=triangleArea(vertices[face[0]],vertices[face[i]],vertices[face[i+1]]);
 return area;
}
export function polySurfaceArea(p){return p.faces.reduce((s,f)=>s+faceArea(p.vertices,f),0);}
export function polySolidVolume(p){
 // Oriented polyhedral surface, signed tetrahedral decomposition; absolute orientation at end.
 let volume=0;
 for(const face of p.faces)for(let i=1;i<face.length-1;i++){
  const a=p.vertices[face[0]],b=p.vertices[face[i]],c=p.vertices[face[i+1]];
  volume+=dot(a,cross(b,c))/6;
 }
 return Math.abs(volume);
}
