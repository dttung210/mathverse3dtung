/** V12 horizontal plane / primitive solid intersections.
 * Cross-sections are calculated from analytic geometry, not from image slicing.
 * The returned vertices are in the untransformed local XZ plane.
 */
const clamp=(x,a,b)=>Math.min(b,Math.max(a,Number(x)));
const polygonArea=vertices=>Math.abs(vertices.reduce((v,p,i)=>{const q=vertices[(i+1)%vertices.length];return v+p[0]*q[1]-q[0]*p[1];},0))/2;
const regular=(n,r,offset=0)=>Array.from({length:n},(_,i)=>{const a=offset+i*Math.PI*2/n;return [r*Math.cos(a),r*Math.sin(a)];});
export function computeHorizontalSection(item,fraction=.5){
  if(!item||item.kind==='catalog3d')return null;
  const t=clamp(fraction,.01,.99),sx=Math.abs(item.sx||1),sz=Math.abs(item.sz||1),sy=Math.abs(item.sy||1);
  let height,vertices=null,radius=null;
  switch(item.kind){
    case 'box':height=2;vertices=[[-1,-1],[1,-1],[1,1],[-1,1]];break;
    case 'pyramid':height=2.7;vertices=regular(4,1.6*(1-t),Math.PI/4);break;
    case 'prism':height=2.5;vertices=regular(3,1.6,Math.PI/2);break;
    case 'cylinder':height=2.5;radius=1.3;break;
    case 'cone':height=3;radius=1.4*(1-t);break;
    case 'sphere':height=2.8;radius=Math.sqrt(Math.max(0,1.4**2-(height*t-1.4)**2));break;
    default:return null;
  }
  const localArea=vertices?polygonArea(vertices):Math.PI*radius*radius;
  const area=localArea*sx*sz;
  const profile={type:vertices?'polygon':'ellipse',vertices,radius,
    rx:radius===null?null:radius*sx,rz:radius===null?null:radius*sz,
    fraction:t,y:height*t,height:height*sy,
    worldHeight:height*t*sy+(item.y||0),area,
    sx,sz,category:item.kind,unit:'đv²'};
  return profile;
}
export function sectionSVG(profile){
  if(!profile)return '';
  let points=profile.vertices?.map(([x,z])=>[x*profile.sx,z*profile.sz])||[];
  if(profile.type==='ellipse'){
    const r=profile.radius;points=regular(80,1).map(([x,z])=>[x*r*profile.sx,z*r*profile.sz]);
  }
  const bounds=points.reduce((b,p)=>({minX:Math.min(b.minX,p[0]),maxX:Math.max(b.maxX,p[0]),minY:Math.min(b.minY,p[1]),maxY:Math.max(b.maxY,p[1])}),{minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity});
  const dx=Math.max(.1,bounds.maxX-bounds.minX),dy=Math.max(.1,bounds.maxY-bounds.minY);
  const s=Math.min(164/dx,96/dy),cx=(bounds.minX+bounds.maxX)/2,cy=(bounds.minY+bounds.maxY)/2;
  return points.map(p=>`${(100+(p[0]-cx)*s).toFixed(2)},${(64-(p[1]-cy)*s).toFixed(2)}`).join(' ');
}
export function formatSectionArea(area){return `${Number(area).toLocaleString('vi-VN',{maximumFractionDigits:3})} đv²`;}
