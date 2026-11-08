/* One pass per lesson cycle: observe -> transform -> hold the result. */
export function lessonMotionProgress(seconds, duration=6){
 const v=Math.max(0,Number(seconds)||0),period=Math.max(.1,duration);
 const t=Math.min(v,period);
 const u=Math.min(1,Math.max(0,(t-.4)/(duration*.70)));
 return u*u*(3-2*u);
}
