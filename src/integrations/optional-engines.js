/** MATHVERSE Phase 1: optional, on-demand, same-origin math engines.
 * Never loads remote scripts in the browser. Original viewers remain default.
 * Downloaded vendor files must be installed explicitly via tools/install-optional-engines.mjs.
 */
export const OPTIONAL_ENGINES = Object.freeze({
  jsxgraph: Object.freeze({
    label: 'JSXGraph', version: '1.14.1',
    script: '/vendor/optional/jsxgraphcore.js',
    style: '/vendor/optional/jsxgraph.css', global: 'JXG'
  }),
  echarts: Object.freeze({
    label: 'Apache ECharts', version: '6.1.0',
    script: '/vendor/optional/echarts.min.js', global: 'echarts'
  })
});
const inFlight = new Map();
export class MissingOptionalEngineError extends Error {
  constructor(name){
    super(`Chưa cài ${OPTIONAL_ENGINES[name]?.label || name}. Hãy đóng ứng dụng, chạy CAI_THU_VIEN_MO_RONG.bat khi có Internet, rồi mở lại.`);
    this.name = 'MissingOptionalEngineError';
  }
}
function globalPresent(name){
  if(typeof window==='undefined')return false;
  const obj=window[OPTIONAL_ENGINES[name].global];
  return name==='jsxgraph' ? !!obj?.JSXGraph?.initBoard : !!obj?.init;
}
function loadStyles(url){
  if(!url || document.querySelector(`link[data-mathverse-engine-css="${url}"]`))return;
  const node=document.createElement('link');node.rel='stylesheet';node.href=url;node.dataset.mathverseEngineCss=url;
  document.head.append(node);
}
function loadScript(url){
  return new Promise((resolve,reject)=>{
    const node=document.createElement('script');node.src=url;node.async=true;
    node.onload=resolve;
    node.onerror=()=>{node.remove();reject(new Error('Tệp thư viện mở rộng không có trên máy'));};
    document.head.append(node);
  });
}
export async function loadOptionalEngine(name){
  if(!Object.hasOwn(OPTIONAL_ENGINES,name))throw new Error(`Engine không hợp lệ: ${name}`);
  if(globalPresent(name))return window[OPTIONAL_ENGINES[name].global];
  if(!inFlight.has(name)){
    const cfg=OPTIONAL_ENGINES[name];
    const p=(async()=>{
      loadStyles(cfg.style);
      try{await loadScript(cfg.script);}catch{throw new MissingOptionalEngineError(name);}
      if(!globalPresent(name))throw new MissingOptionalEngineError(name);
      return window[cfg.global];
    })();
    inFlight.set(name,p);
    p.catch(()=>inFlight.delete(name));
  }
  return inFlight.get(name);
}
