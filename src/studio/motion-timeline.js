/** V12 deterministic model-parameter animation timeline. No eval/remote scripts. */
import {clone,clamp,constrainScale3D} from './workspace-document.js?v=r107_v15';
const KEYS=['x','y','z','angle','sx','sy','sz','r','w','h','d1','d2','theta','sectionFraction'];
export function captureState(doc,at){
  return {at:Math.max(0,Math.min(300,Number(at)||0)),items:doc.items.map(o=>{
    const p={id:o.id,kind:o.kind};for(const key of KEYS)if(Number.isFinite(o[key]))p[key]=o[key];
    if(Array.isArray(o.points))p.points=clone(o.points);
    return p;
  })};
}
export function interpolateAngle(a,b,t){let dif=((b-a+540)%360)-180;return (a+dif*t+360)%360;}
export function interpolateState(doc,frames,seconds){
  if(!Array.isArray(frames)||!frames.length)return false;
  const sorted=[...frames].sort((a,b)=>a.at-b.at);
  const time=clamp(seconds,0,300);
  let start=sorted[0],end=sorted.at(-1);
  for(let i=0;i<sorted.length;i++){
    if(sorted[i].at<=time)start=sorted[i];
    if(sorted[i].at>=time){end=sorted[i];break;}
  }
  if(time<sorted[0].at)end=start=sorted[0];
  const delta=end.at-start.at,t=delta>0?clamp((time-start.at)/delta,0,1):0;
  const aMap=new Map(start.items.map(x=>[x.id,x]));const bMap=new Map(end.items.map(x=>[x.id,x]));
  for(const object of doc.items){
    const a=aMap.get(object.id),b=bMap.get(object.id)||a;
    if(!a||!b||a.kind!==object.kind||b.kind!==object.kind)continue;
    for(const k of KEYS){
      if(!Number.isFinite(a[k])||!Number.isFinite(b[k]))continue;
      object[k]=k==='angle'?interpolateAngle(a[k],b[k],t):a[k]+(b[k]-a[k])*t;
    }
    if(Array.isArray(a.points)&&Array.isArray(b.points)&&a.points.length===b.points.length)
      object.points=a.points.map((p,i)=>p.map((n,j)=>n+(b.points[i][j]-n)*t));
    // Maintain the geometric constraints of standard solid families.
    if(['sphere','oxyzSphere','sphereSection','cube','tetrahedron'].includes(object.kind))
      constrainScale3D(object,'x',object.sx);
    if(['pyramid','prism','cylinder','cone'].includes(object.kind))constrainScale3D(object,'x',object.sx);
  }
  return true;
}
export const MAX_KEYFRAMES = 60;
export function recordKeyframe(doc,at){
  if(!doc.motion)doc.motion={speed:1,keyframes:[]};
  const frame=captureState(doc,at),idx=doc.motion.keyframes.findIndex(f=>Math.abs(f.at-frame.at)<.01);
  if(idx>=0){
    doc.motion.keyframes[idx]=frame;
  }else{
    if(doc.motion.keyframes.length>=MAX_KEYFRAMES){
      frame.limitReached=true;
      frame.replacedOldest=true;
    }
    doc.motion.keyframes.push(frame);
  }
  doc.motion.keyframes.sort((a,b)=>a.at-b.at);
  if(doc.motion.keyframes.length>MAX_KEYFRAMES){
    doc.motion.keyframes=doc.motion.keyframes.slice(-MAX_KEYFRAMES);
  }
  return frame;
}
export function validateMotion(doc){
  const frames=doc.motion?.keyframes||[];
  if(frames.length>60)throw new Error('Quá 60 mốc chuyển động.');
  const ids=new Set(doc.items.map(i=>i.id));
  for(const frame of frames){
    if(!Number.isFinite(frame.at)||frame.at<0||frame.at>300||!Array.isArray(frame.items)||frame.items.length>120)throw new Error('Mốc thời gian không hợp lệ.');
    for(const item of frame.items){if(!ids.has(item.id))continue;
      for(const k of KEYS)if(k in item&&!Number.isFinite(item[k]))throw new Error('Thông số hoạt cảnh sai.');
      if(item.points&&(!Array.isArray(item.points)||item.points.length>32))throw new Error('Điểm hoạt cảnh sai.');
    }
  }
  return true;
}
