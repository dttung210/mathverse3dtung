/** User-selectable rendering cost; automatic profile follows real frame times. */
export const RENDER_QUALITY = Object.freeze({
  eco:{pixelCap:1.0,shadowMapSize:512,shadows:false,particles:false,ao:false},
  low:{pixelCap:1.0,shadowMapSize:512,shadows:true,particles:false,ao:false},
  auto:{pixelCap:1.5,shadowMapSize:1024,shadows:true,particles:true,ao:false},
  medium:{pixelCap:1.5,shadowMapSize:1024,shadows:true,particles:true,ao:false},
  high:{pixelCap:2.0,shadowMapSize:2048,shadows:true,particles:true,ao:true}
});
export function qualityProfile(name,dpr=1){
  const key=Object.prototype.hasOwnProperty.call(RENDER_QUALITY,name)?name:'auto';
  const entry=RENDER_QUALITY[key];
  const ratio=(key==='low'||key==='eco')?1:Math.min(Math.max(.65,dpr),entry.pixelCap);
  return {...entry,name:key,pixelRatio:ratio};
}
export function tuneAutoRatio(ratio,fps,physicalDpr=1){
  const max=Math.min(Math.max(.85,physicalDpr),1.35);
  if(fps<38)return Math.max(.75,Math.round((ratio-.13)*100)/100);
  if(fps>56)return Math.min(max,Math.round((ratio+.05)*100)/100);
  return ratio;
}

export function readStoredPixelRatio(dpr=1, storage){
  try{
    const store = storage !== undefined ? storage : (typeof localStorage === 'undefined' ? null : localStorage);
    return qualityProfile(store?.getItem('mathverse-render-quality')||'auto',dpr).pixelRatio;
  }
  catch{return qualityProfile('auto',dpr).pixelRatio;}
}
