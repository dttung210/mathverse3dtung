/** A pop-up interactive animated preview for the grade wall boards. */
import {WALL_MODELS,WALL_BY_ID,drawPanel} from './wall2d.mjs?v=r107_v15';
export function initWallModelViewer(){
  if(window.__MV_WALL_MODEL_VIEWER_V2__)return window.__MV_WALL_MODEL_VIEWER_V2__;
  const host=document.createElement('div');host.id='mv-wall-viewer-v2';host.hidden=true;
  const shadow=host.attachShadow({mode:'open'});const s=document.createElement('style');s.textContent=`
:host{all:initial;font:14px/1.48 'Segoe UI',Arial,sans-serif;color:#eef8ff}
*{box-sizing:border-box}button{font:inherit;cursor:pointer;border:1px solid #4c7e95;background:#194156;color:#e3faff;border-radius:9px;padding:10px 12px;font-weight:700}
#overlay{position:fixed;inset:0;z-index:2147482100;background:#06131be9;display:grid;place-items:center;padding:14px;pointer-events:auto}
#box{width:min(1050px,98vw);max-height:96vh;overflow:auto;background:#0d2237;border:2px solid #bf9555;border-radius:15px;padding:18px}
h2{font-size:22px;color:#ffe1a4;margin:0 0 8px}p{color:#d6ebf2}#body{display:grid;grid-template-columns:1.3fr 1fr;gap:18px}#preview{width:100%;height:auto;background:#123;max-height:45vh;border:1px solid #42697c;border-radius:10px}#formula{font:600 15px Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;padding:14px;background:#203d4d;border-radius:8px;color:#ffe0b1}#actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}#choose{max-width:100%;padding:9px;border-radius:8px;background:#173246;color:#eff}#status{min-height:24px;color:#bcf0d6}label{display:block;margin:0 0 8px;color:#d8efff;font-weight:700} @media(max-width:740px){#body{display:block}#box{padding:10px}h2{font-size:17px}}
  `;shadow.append(s);const o=document.createElement('div');o.id='overlay';o.innerHTML=`<div id="box" role="dialog" aria-modal="true" aria-label="Mô hình Toán trên hành lang"><h2 id="heading">Tranh Toán học 2D</h2><div id="body"><canvas id="preview" width="720" height="370"></canvas><section><label for="choose">Chọn mô hình lớp 6–12</label><select id="choose"></select><p id="detail"></p><p><strong>Liên hệ:</strong> <span id="school"></span></p><div id="formula"></div><p id="status" role="status"></p></section></div><div id="actions"><button id="go-lab">Mở Lab SGK gốc</button><button id="open-ggb">Thử dựng trong Xưởng 2D</button><button id="copy">Sao chép LaTeX</button><button id="close">Đóng và quay lại sảnh</button></div></div>`;shadow.append(o);document.body.append(host);
  const $=id=>shadow.getElementById(id);let active=null,prev=null,frameId=0,lastTime=0;
  for(const m of WALL_MODELS){const opt=document.createElement('option');opt.value=m.id;opt.textContent=`Lớp ${m.grade} - ${m.title}`;$('choose').append(opt);}
  const setStatus=t=>$('status').textContent=t||'';
  function select(id){const m=WALL_BY_ID.get(id);if(!m)return;active=m;$('choose').value=id;$('heading').textContent=`Lớp ${m.grade} · ${m.title}`;$('detail').textContent=m.detail;$('school').textContent=m.caption+' · Mã mô hình: '+m.modeId;$('formula').textContent=m.formula;setStatus('Hình minh họa tự dựng, không sao chép ảnh SGK.');drawPanel($('preview'),m,performance.now()*.001);}
  function step(t){if(host.hidden||!active)return;if(t-lastTime>75){drawPanel($('preview'),active,t*.001);lastTime=t;}frameId=requestAnimationFrame(step);}
  function onKey(e){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();return;}if(['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.stopImmediatePropagation();}
  function open(id){prev=document.activeElement;host.hidden=false;document.exitPointerLock?.();select(id&&WALL_BY_ID.has(id)?id:WALL_MODELS[0].id);window.addEventListener('keydown',onKey,true);lastTime=0;frameId=requestAnimationFrame(step);$('close').focus();}
  function close(){if(host.hidden)return;host.hidden=true;cancelAnimationFrame(frameId);window.removeEventListener('keydown',onKey,true);if(prev?.isConnected)prev.focus?.();}
  $('choose').addEventListener('change',e=>select(e.target.value));$('close').addEventListener('click',close);$('overlay').addEventListener('click',e=>{if(e.target===$('overlay'))close();});
  $('go-lab').addEventListener('click',()=>{if(!active)return;if(typeof window.navigateToMode==='function'){const id=active.modeId;close();window.navigateToMode(id);}else setStatus('MATHVERSE chưa cung cấp điều hướng trực tiếp trong phiên này.');});
  $('open-ggb').addEventListener('click',()=>{close();window.dispatchEvent(new CustomEvent('mathverse:exhibition-action',{detail:{type:'ggb-2d'}}));});
  $('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(active.formula);setStatus('Đã sao chép LaTeX.');}catch{setStatus('Trình duyệt chặn clipboard; hãy chọn và sao chép công thức trên màn hình.');}});
  window.addEventListener('mathverse:exhibition-action',e=>{if(e.detail?.type==='wall')open(e.detail.id);});
  const result=Object.freeze({open,close,count:WALL_MODELS.length});window.__MV_WALL_MODEL_VIEWER_V2__=result;return result;
}
