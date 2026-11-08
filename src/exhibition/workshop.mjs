/** Two genuinely separate GeoGebra tools. External code is loaded only after explicit click. */
let scriptPromise;
function ensureGeoGebra(){
  if(typeof window.GGBApplet==='function')return Promise.resolve();
  if(scriptPromise)return scriptPromise;
  scriptPromise=new Promise((resolve,reject)=>{
    const el=document.createElement('script');el.src='https://www.geogebra.org/apps/deployggb.js';el.async=true;
    const timeout=setTimeout(()=>{el.remove();reject(new Error('GeoGebra không tải được sau 25 giây. Kiểm tra Internet hoặc CSP.'));},25000);
    el.onload=()=>{clearTimeout(timeout);if(typeof window.GGBApplet==='function')resolve();else reject(new Error('GeoGebra đã tải nhưng thiếu GGBApplet.'));};
    el.onerror=()=>{clearTimeout(timeout);el.remove();reject(new Error('Không kết nối được máy chủ GeoGebra.'));};
    document.head.append(el);
  }).catch(e=>{scriptPromise=undefined;throw e;});
  return scriptPromise;
}
function download(fileName,blob){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=fileName;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);}
function bytesFrom64(s){const raw=atob(s);const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return bytes;}
function frame(){const el=document.createElement('section');el.id='mv-exhibition-ggb';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Xưởng vẽ hình GeoGebra');el.innerHTML=`
<div class="mv-ggb-window">
  <header class="mv-ggb-head"><div><h2 id="mv-ggb-title">XƯỞNG VẼ HÌNH</h2><p id="mv-ggb-caption">GeoGebra - công cụ Toán học động</p></div><button type="button" id="mv-ggb-close">✕ Về phòng Triển lãm</button></header>
  <div class="mv-ggb-actions">
    <button type="button" id="mv-ggb-sample">Tạo hình mẫu</button>
    <button type="button" id="mv-ggb-save">Lưu bài vẽ .ggb</button>
    <button type="button" id="mv-ggb-open">Mở bài vẽ .ggb</button>
    <button type="button" id="mv-ggb-png">Xuất PNG</button>
    <button type="button" id="mv-ggb-svg">Xuất SVG (2D)</button>
    <button type="button" id="mv-ggb-empty">Xóa hình</button>
    <input id="mv-ggb-file" type="file" accept=".ggb" hidden>
  </div>
  <div class="mv-ggb-status" role="status" aria-live="polite" id="mv-ggb-status">Mở công cụ để bắt đầu.</div>
  <div class="mv-ggb-container" id="mv-ggb-container"><div class="mv-ggb-holder" id="mv-ggb-holder"></div></div>
  <footer class="mv-ggb-foot">GeoGebra® · Sử dụng phi thương mại theo điều khoản của GeoGebra · Cần Internet khi dùng bản CDN · Dữ liệu chỉ được tải về khi cô/học sinh bấm Lưu.</footer>
</div>`;document.body.append(el);return el;}
function style(){if(document.getElementById('mv-ggb-css'))return;const css=document.createElement('link');css.id='mv-ggb-css';css.rel='stylesheet';css.href='/src/exhibition/workshop.css';document.head.append(css);}
export function initGeometryWorkshops(){
  if(window.__MATHVERSE_GG_WORKSHOP_V2__)return window.__MATHVERSE_GG_WORKSHOP_V2__;
  style();const host=frame();const $=id=>document.getElementById(id);let current=null,api=null,instance=null,lastFocus=null,token=0;
  const status=(s,err=false)=>{const el=$('mv-ggb-status');el.textContent=s;el.dataset.error=String(!!err);};
  const disabled=b=>{for(const id of ['mv-ggb-save','mv-ggb-open','mv-ggb-png','mv-ggb-svg','mv-ggb-sample','mv-ggb-empty'])$(id).disabled=b;};
  function stopKeys(e){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();return;}if(['w','a','s','d','W','A','S','D','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.stopImmediatePropagation();}
  function close(){token++;if(host.hidden)return;host.hidden=true;window.removeEventListener('keydown',stopKeys,true);
    const activeApi=api;api=null;instance=null;current=null;
    try{activeApi?.remove?.();}catch(err){console.warn('[MATHVERSE GeoGebra] remove:',err);}
    $('mv-ggb-holder').replaceChildren();if(lastFocus?.isConnected)lastFocus.focus?.();
  }
  async function open(kind='2d'){
    if(!['2d','3d'].includes(kind))kind='2d';const my=++token;
    if(!host.hidden)close();const id=++token;lastFocus=document.activeElement;current=kind;api=null;
    host.hidden=false;document.exitPointerLock?.();window.addEventListener('keydown',stopKeys,true);
    $('mv-ggb-title').textContent=kind==='2d'?'BỤC 01 - XƯỞNG VẼ HÌNH 2D':'BỤC 02 - XƯỞNG DỰNG HÌNH 3D';
    $('mv-ggb-caption').textContent=kind==='2d'?'Dựng điểm, đường, hình, phép biến hình và quỹ tích':'Dựng điểm Oxyz, đường, mặt phẳng, khối và thiết diện';
    $('mv-ggb-svg').hidden=kind!=='2d';disabled(true);status('Đang kết nối GeoGebra…');$('mv-ggb-close').focus();
    const holder=$('mv-ggb-holder');
    holder.innerHTML=`<div class="mv-ggb-loading"><div class="mv-ggb-spinner"></div><div style="font-weight:600;font-size:15px;color:#0e3650">Đang khởi tạo xưởng vẽ GeoGebra ${kind.toUpperCase()}…</div><div style="font-size:12px;color:#53738a">Lần đầu tải có thể mất vài giây. Xin vui lòng chờ trong giây lát.</div></div>`;
    try{
      await ensureGeoGebra();if(id!==token||host.hidden)return;
      const box=$('mv-ggb-container').getBoundingClientRect();
      const params={id:'mv_exhibition_ggb',appName:kind==='2d'?'geometry':'3d',width:Math.max(650,Math.round(box.width-8)),height:Math.max(420,Math.round(box.height-8)),showToolBar:true,showMenuBar:true,showAlgebraInput:true,showResetIcon:true,showToolBarHelp:true,allowStyleBar:true,enableShiftDragZoom:true,language:'vi',scaleContainerClass:'mv-ggb-container',appletOnLoad(ggb){if(id!==token||host.hidden){try{ggb.remove?.();}catch{}return;}api=ggb;disabled(false);status('Sẵn sàng. Vẽ trực tiếp trong GeoGebra; dùng Lưu .ggb để tải bài về máy.');}};
      instance=new window.GGBApplet(params,true);instance.inject(holder);
      // GeoGebra applets may take seconds to initialize after the script loads.
      setTimeout(()=>{if(id===token&&!host.hidden&&!api)status('GeoGebra đang tải tài nguyên. Nếu lâu, kiểm tra kết nối mạng của máy.');},14000);
    }catch(err){if(id!==token||host.hidden)return;status(err.message+' Có thể dùng GeoGebra trực tiếp tại geogebra.org/geometry hoặc /3d.',true);
      const a=document.createElement('a');a.href=kind==='2d'?'https://www.geogebra.org/geometry':'https://www.geogebra.org/3d';a.target='_blank';a.rel='noopener noreferrer';a.textContent='Mở GeoGebra chính thức trong tab mới';$('mv-ggb-holder').replaceChildren(a);
    }
  }
  async function getGGB(){return await new Promise((resolve,reject)=>{if(!api?.getBase64)return reject(new Error('GeoGebra chưa sẵn sàng.'));let done=false;const tid=setTimeout(()=>{if(!done){done=true;reject(new Error('Hết thời gian xuất GGB.'));}},18000);try{api.getBase64(s=>{if(done)return;done=true;clearTimeout(tid);s?resolve(s):reject(new Error('Không xuất được GGB.'));});}catch(err){done=true;clearTimeout(tid);reject(err);}});}
  $('mv-ggb-close').addEventListener('click',close);
  host.addEventListener('click',e=>{if(e.target===host)close();});
  $('mv-ggb-save').addEventListener('click',async()=>{try{status('Đang tạo tệp GGB…');const s=await getGGB();download(`MATHVERSE_ve_hinh_${current}.ggb`,new Blob([bytesFrom64(s)],{type:'application/vnd.geogebra.file'}));status('Đã xuất tệp .ggb để cô lưu về máy.');}catch(e){status('Không lưu được: '+e.message,true);}});
  $('mv-ggb-open').addEventListener('click',()=>{$('mv-ggb-file').value='';$('mv-ggb-file').click();});
  $('mv-ggb-file').addEventListener('change',async(e)=>{const f=e.target.files?.[0];if(!f||!api)return;if(f.size>25*1024*1024){status('Tệp quá lớn (tối đa 25 MB).',true);return;}
    try{status('Đang mở tệp .ggb…');const data=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result));r.onerror=()=>rej(new Error('Không đọc được tệp'));r.readAsDataURL(f);});
      api.setBase64(data.slice(data.indexOf(',')+1),()=>status('Đã nạp hình từ file .ggb.'));
    }catch(err){status('Lỗi mở tệp: '+err.message,true);}
  });
  $('mv-ggb-png').addEventListener('click',()=>{try{if(!api)throw new Error('Chưa sẵn sàng');const s=api.getPNGBase64(1,false,72);if(!s)throw new Error('Không tạo được PNG');download(`MATHVERSE_ve_hinh_${current}.png`,new Blob([bytesFrom64(s)],{type:'image/png'}));status('Đã xuất hình PNG.');}catch(err){status('Lỗi xuất PNG: '+err.message,true);}});
  $('mv-ggb-svg').addEventListener('click',()=>{try{if(current!=='2d')throw new Error('SVG chỉ hỗ trợ khung 2D');api.exportSVG('MATHVERSE_ve_hinh_2d.svg');status('Đã yêu cầu GeoGebra xuất SVG.');}catch(err){status('Lỗi SVG: '+err.message,true);}});
  $('mv-ggb-empty').addEventListener('click',()=>{if(api&&confirm('Xóa toàn bộ hình hiện tại? Hãy lưu .ggb trước nếu cần.')){api.newConstruction();status('Đã tạo trang vẽ mới.');}});
  $('mv-ggb-sample').addEventListener('click',()=>{if(!api)return;if(!confirm('Tạo hình mẫu sẽ thêm các đối tượng vào bản vẽ hiện tại. Tiếp tục?'))return;
    try{const cmd=current==='2d'?['A=(0,0)','B=(4,0)','C=(1,3)','Polygon(A,B,C)','d=Line(A,B)','M=Midpoint(A,B)']:['A=(0,0,0)','B=(3,0,0)','C=(0,3,0)','D=(0,0,3)','Pyramid(Polygon(A,B,C),D)'];for(const s of cmd)api.evalCommand(s);status('Đã tạo mẫu. Cô có thể kéo, xoay và sửa các đối tượng.');}catch(err){status('Không thể tạo mẫu: '+err.message,true);}});
  window.addEventListener('mathverse:exhibition-action',e=>{const a=e.detail||{};if(a.type==='ggb-2d')void open('2d');if(a.type==='ggb-3d')void open('3d');});
  setTimeout(()=>{ensureGeoGebra().catch(()=>{});},1500);
  const result=Object.freeze({open,close,getMode:()=>current,getReady:()=>!!api});window.__MATHVERSE_GG_WORKSHOP_V2__=result;return result;
}
