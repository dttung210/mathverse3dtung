import * as THREE from '/mathverse3dtung/vendor/three.module.js?v=r107_v15';
import {createMathModel,disposeObject} from './geometry.js?v=r107_v15';
import {TYPES,normalizeExhibit,metrics,formatMathHtml} from './math-core.js?v=r107_v15';
import {formatInlineMathHtml} from './curriculum/math-formula-renderer.mjs?v=r107_v15';
import {applyConditionalShadows,createContactShadowDisc,createPedagogicalShadowFloor,createProceduralHDRIEnvironment,getSharedPBRMaterial} from './graphics-r74/depth-pipeline-v12.mjs?v=r107_v15';
import {speakText,stopSpeech} from './ui/audio.js?v=r107_v15';

export function makeViewer({onClose,onSave}) {
  const byId=id=>document.getElementById(id);
  const modal=byId('viewer-overlay'), canvas=byId('viewer-canvas');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.2;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;

  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x112030);
  const envTex=createProceduralHDRIEnvironment(renderer);
  if(envTex)scene.environment=envTex;
  scene.add(new THREE.HemisphereLight(0xffffff,0x566477,2.4));
  const sun=new THREE.DirectionalLight(0xfef7e8,3);
  sun.position.set(4,6,7);
  sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  sun.shadow.camera.left=-6;sun.shadow.camera.right=6;sun.shadow.camera.top=6;sun.shadow.camera.bottom=-6;
  sun.shadow.bias=-0.00012;sun.shadow.normalBias=0.024;
  scene.add(sun);

  const shadowFloor=createPedagogicalShadowFloor({size:18,y:-1.86,darkTheme:true});
  scene.add(shadowFloor);
  const contactDisc=createContactShadowDisc({radius:2.05,y:-1.852,opacity:0.42});
  scene.add(contactDisc);
  let pbrPresetKey='default';

  // Lưới tọa độ và Hệ trục Oxyz
  const grid=new THREE.GridHelper(8,16,0x477486,0x274354);
  grid.position.y=-1.85;
  scene.add(grid);

  const axes=new THREE.AxesHelper(4.5);
  axes.position.y=-1.85;
  scene.add(axes);

  const camera=new THREE.PerspectiveCamera(48,1,.05,50);
  const orthoCamera=new THREE.OrthographicCamera(-4,4,4,-4,.05,50);
  let projectionMode='perspective';
  let distance=7, yaw=.45, pitch=.35;

  let current=null, params={}, shape=null, visible=false;
  let edges=true, faces=true, spin=false, raf=0, lastTime=0;
  let displayMode='solid'; // 'solid' | 'wireframe' | 'transparent'
  let showAxes=true, showGrid=true, showLabels=true;
  let crossSectionEnabled=false, crossSectionPct=50;
  let unfoldEnabled=false, unfoldProgress=0;

  function syncOrthoFrustum(aspect){
    const halfH=Math.max(1.2,distance*Math.tan(THREE.MathUtils.degToRad(48*0.5)));
    const halfW=halfH*(aspect||camera.aspect||1);
    orthoCamera.left=-halfW;
    orthoCamera.right=halfW;
    orthoCamera.top=halfH;
    orthoCamera.bottom=-halfH;
    orthoCamera.updateProjectionMatrix();
  }

  function getActiveCamera(){
    return projectionMode==='orthographic'?orthoCamera:camera;
  }

  function setProjectionMode(mode){
    projectionMode=mode==='orthographic'?'orthographic':'perspective';
    syncOrthoFrustum(camera.aspect||1);
    return projectionMode;
  }

  function resize(){
    const w=Math.max(1,canvas.clientWidth), h=Math.max(1,canvas.clientHeight);
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    camera.updateProjectionMatrix();
    syncOrthoFrustum(camera.aspect);
  }

  function updateView(){
    if(!current) return;
    if(shape){
      scene.remove(shape);
      disposeObject(shape);
      shape=null;
    }
    const valid=normalizeExhibit({...current,params});
    params={...valid.params};
    shape=createMathModel(valid,{faces,edges,labels:showLabels,mode:displayMode});
    applyConditionalShadows(shape);
    if(pbrPresetKey&&pbrPresetKey!=='default'){
      const sharedMat=getSharedPBRMaterial(pbrPresetKey);
      if(sharedMat){
        shape.traverse(obj=>{
          if(obj?.isMesh&&!obj.isSprite&&!obj.isLine&&obj.material&&!obj.material.wireframe){
            obj.material=sharedMat;
          }
        });
      }
    }
    scene.add(shape);

    axes.visible=showAxes;
    grid.visible=showGrid;

    if(shape.supportsCrossSection){
      const info=shape.setCrossSection(crossSectionEnabled,crossSectionPct);
      const mathEl=byId('cross-section-math');
      if(mathEl&&info){
        if(info.type==='square'){
          mathEl.innerHTML=formatInlineMathHtml(`Thiết diện: <b>Hình vuông</b> cạnh $w = ${info.side}$<br/>Tỉ lệ diện tích: $\\frac{S}{S_0} = (1-t)^2 = ${Math.round(info.ratio*100)}\\%$<br/>Diện tích thiết diện: $S = ${info.area}$`);
        }else if(info.type==='rectangle'){
          mathEl.innerHTML=formatInlineMathHtml(`Thiết diện: <b>Hình chữ nhật</b> cạnh $a \\times b = ${info.width} \\times ${info.length}$<br/>Diện tích thiết diện: $S = ${info.area}$`);
        }
      }
    }
    if(shape.supportsUnfold){
      shape.setUnfoldProgress(unfoldEnabled?unfoldProgress:0);
    }

    byId('viewer-metrics').replaceChildren();
    for(const metric of metrics(current.type,params)){
      const node=document.createElement('div');
      node.className='metric-card';
      const label=document.createElement('span');
      label.textContent=metric.name;
      const value=document.createElement('strong');
      value.textContent=`${metric.value} ${metric.unit}`;
      node.append(label,value);
      byId('viewer-metrics').append(node);
    }
  }

  function createControls(){
    const holder=byId('param-controls');
    holder.replaceChildren();
    for(const [key,[label,min,max]] of Object.entries(TYPES[current.type].params)){
      const wrap=document.createElement('label');
      wrap.className='param-control';
      const head=document.createElement('span');
      head.className='param-head';
      const labelEl=document.createElement('span');
      labelEl.textContent=label;
      const value=document.createElement('output');
      value.textContent=String(params[key]);
      head.append(labelEl,value);
      const slider=document.createElement('input');
      slider.type='range';
      slider.min=String(min);
      slider.max=String(max);
      slider.step=key==='n'||key==='deg'||key==='t'?'1':'0.1';
      slider.value=String(params[key]);
      slider.addEventListener('input',()=>{
        params[key]=Number(slider.value);
        value.textContent=slider.value;
        updateView();
      });
      wrap.append(head,slider);
      holder.append(wrap);
    }
  }

  function setDisplayMode(mode){
    displayMode=mode;
    if(shape?.setDisplayMode) shape.setDisplayMode(mode);
    else updateView();
    // Cập nhật trạng thái nút
    for(const m of ['solid','wire','trans']){
      const btn=byId(`viewer-mode-${m}`);
      if(btn) btn.classList.toggle('active', (m==='solid'&&mode==='solid')||(m==='wire'&&mode==='wireframe')||(m==='trans'&&mode==='transparent'));
    }
  }

  function setCameraPreset(preset){
    if(preset==='iso'){
      yaw=0.45; pitch=0.35; distance=7;
    } else if(preset==='front'){
      yaw=0; pitch=0; distance=7;
    } else if(preset==='top'){
      yaw=0; pitch=Math.PI/2 - 0.02; distance=7;
    } else if(preset==='side'){
      yaw=Math.PI/2; pitch=0; distance=7;
    }
    for(const p of ['iso','front','top','side']){
      const btn=byId(`view-preset-${p}`);
      if(btn) btn.classList.toggle('active', p===preset);
    }
  }

  function open(item,{canSave=false}={}){
    current=normalizeExhibit(item);
    params={...current.params};
    edges=true; faces=true; spin=false; visible=true;
    displayMode='solid';
    showAxes=true; showGrid=true; showLabels=true;
    yaw=.45; pitch=.35; distance=7;

    modal.hidden=false;
    byId('viewer-title').textContent=current.title;
    byId('viewer-grade').textContent=`LỚP ${current.grade} · ${current.category}`;
    byId('viewer-description').textContent=current.description||'Mô hình có thể thay đổi tham số trực quan.';

    // Hiển thị công thức toán học định dạng chuyên nghiệp
    const formulaContainer=byId('viewer-formula');
    if(formulaContainer){
      formulaContainer.innerHTML=formatMathHtml(current.formula||'Mô hình hình học');
    }

    // Đặt lại các checkbox
    if(byId('viewer-edges')) byId('viewer-edges').checked=true;
    if(byId('viewer-faces')) byId('viewer-faces').checked=true;
    if(byId('viewer-axes')) byId('viewer-axes').checked=true;
    if(byId('viewer-grid')) byId('viewer-grid').checked=true;
    if(byId('viewer-labels')) byId('viewer-labels').checked=true;

    setDisplayMode('solid');
    setCameraPreset('iso');

    byId('viewer-spin').textContent='Tự quay: Tắt';
    byId('viewer-save').hidden=!canSave;

    createControls();
    resize();
    updateView();

    crossSectionEnabled=false;
    crossSectionPct=50;
    unfoldEnabled=false;
    unfoldProgress=0;

    const hasSim=!!(shape?.supportsCrossSection||shape?.supportsUnfold);
    const simBox=byId('viewer-simulations');
    if(simBox) simBox.hidden=!hasSim;

    const csCtrl=byId('cross-section-control');
    if(csCtrl) csCtrl.hidden=!shape?.supportsCrossSection;
    const csCheck=byId('viewer-cross-section');
    if(csCheck) csCheck.checked=false;
    const csSliderWrap=byId('cross-section-slider-wrap');
    if(csSliderWrap) csSliderWrap.hidden=true;
    const csSlider=byId('cross-section-slider');
    if(csSlider) csSlider.value='50';
    const csVal=byId('cross-section-val');
    if(csVal) csVal.textContent='50%';

    const ufCtrl=byId('unfold-control');
    if(ufCtrl) ufCtrl.hidden=!shape?.supportsUnfold;
    const ufCheck=byId('viewer-unfold');
    if(ufCheck) ufCheck.checked=false;
    const ufSliderWrap=byId('unfold-slider-wrap');
    if(ufSliderWrap) ufSliderWrap.hidden=true;
    const ufSlider=byId('unfold-slider');
    if(ufSlider) ufSlider.value='0';
    const ufVal=byId('unfold-val');
    if(ufVal) ufVal.textContent='0%';

    lastTime=performance.now();
    cancelAnimationFrame(raf);
    renderLoop(lastTime);
  }

  function close(){
    visible=false;
    cancelAnimationFrame(raf);
    stopSpeech();
    modal.hidden=true;
    if(onClose) onClose();
  }

  function renderLoop(now){
    if(!visible) return;
    const dt=Math.min(.07,(now-lastTime)/1000||.016);
    lastTime=now;
    if(spin) yaw+=dt*.42;
    const p=distance*Math.sin(pitch), h=distance*Math.cos(pitch);
    camera.position.set(h*Math.sin(yaw),p,h*Math.cos(yaw));
    camera.lookAt(0,0,0);
    if(projectionMode==='orthographic'){
      orthoCamera.position.copy(camera.position);
      orthoCamera.quaternion.copy(camera.quaternion);
      syncOrthoFrustum(camera.aspect);
    }
    renderer.render(scene,getActiveCamera());
    raf=requestAnimationFrame(renderLoop);
  }

  byId('viewer-close').addEventListener('click',close);
  byId('viewer-speak')?.addEventListener('click',()=>{
    if(!current)return;
    const gradeTxt=byId('viewer-grade')?.textContent||`Lớp ${current.grade||''}`;
    const titleTxt=byId('viewer-title')?.textContent||current.title||'Mô hình toán học';
    const descTxt=byId('viewer-description')?.textContent||current.description||'';
    const formulaTxt=current.formula||byId('viewer-formula')?.textContent||'';
    const metricsTxt=byId('viewer-metrics')?.textContent||'';
    speakText(`Thầy Tùng thuyết minh mô hình ${gradeTxt}: ${titleTxt}. Kiến thức trọng tâm: ${descTxt}. Công thức toán học: ${formulaTxt}. Số liệu hiện tại: ${metricsTxt}`);
  });
  modal.addEventListener('pointerdown',e=>{if(e.target===modal)close();});
  byId('viewer-reset').addEventListener('click',()=>{
    params={...current.params};
    yaw=.45; pitch=.35; distance=7;
    setCameraPreset('iso');
    createControls();
    updateView();
  });

  // Chế độ hiển thị
  byId('viewer-mode-solid')?.addEventListener('click',()=>setDisplayMode('solid'));
  byId('viewer-mode-wire')?.addEventListener('click',()=>setDisplayMode('wireframe'));
  byId('viewer-mode-trans')?.addEventListener('click',()=>setDisplayMode('transparent'));

  // Góc nhìn chuẩn
  byId('view-preset-iso')?.addEventListener('click',()=>setCameraPreset('iso'));
  byId('view-preset-front')?.addEventListener('click',()=>setCameraPreset('front'));
  byId('view-preset-top')?.addEventListener('click',()=>setCameraPreset('top'));
  byId('view-preset-side')?.addEventListener('click',()=>setCameraPreset('side'));
  const sideBtn=byId('view-preset-side');
  if(sideBtn&&sideBtn.parentElement&&!byId('view-preset-ortho')){
    const orthoBtn=document.createElement('button');
    orthoBtn.id='view-preset-ortho';
    orthoBtn.type='button';
    orthoBtn.className=sideBtn.className;
    orthoBtn.textContent='📐 Phối cảnh';
    orthoBtn.title='Chuyển đổi Phối cảnh (Perspective) / Trực giao (Orthographic - đo đạc chính xác)';
    orthoBtn.addEventListener('click',()=>{
      const m=setProjectionMode(projectionMode==='orthographic'?'perspective':'orthographic');
      orthoBtn.textContent=m==='orthographic'?'📐 Trực giao':'📐 Phối cảnh';
      orthoBtn.classList.toggle('active',m==='orthographic');
    });
    sideBtn.parentElement.appendChild(orthoBtn);
    if(!byId('view-preset-pbr')){
      const pbrSel=document.createElement('select');
      pbrSel.id='view-preset-pbr';
      pbrSel.title='Chất liệu PBR thực tế (Gỗ, Kính, Kim loại, Nhựa, Đá)';
      pbrSel.style.cssText='padding:4px 8px;border-radius:8px;border:1px solid rgba(56,189,248,.4);background:#0f172a;color:#e2e8f0;font-size:12px;font-weight:700;cursor:pointer;';
      for(const [val,label] of [
        ['default','🎨 Mặc định'],
        ['woodOak','🪵 Gỗ Sồi'],
        ['crystalGlass','💎 Kính'],
        ['brushedMetal','🥇 Kim Loại'],
        ['glossyPlastic','🧪 Nhựa'],
        ['marbleStone','🏛️ Đá']
      ]){
        const opt=document.createElement('option');
        opt.value=val; opt.textContent=label;
        pbrSel.appendChild(opt);
      }
      pbrSel.addEventListener('change',()=>{
        pbrPresetKey=pbrSel.value;
        updateView();
      });
      sideBtn.parentElement.appendChild(pbrSel);
    }
  }

  // Bật/tắt các yếu tố
  byId('viewer-edges')?.addEventListener('change',e=>{edges=e.target.checked;updateView();});
  byId('viewer-faces')?.addEventListener('change',e=>{faces=e.target.checked;updateView();});
  byId('viewer-axes')?.addEventListener('change',e=>{showAxes=e.target.checked;axes.visible=showAxes;});
  byId('viewer-grid')?.addEventListener('change',e=>{showGrid=e.target.checked;grid.visible=showGrid;});
  byId('viewer-labels')?.addEventListener('change',e=>{
    showLabels=e.target.checked;
    if(shape?.setLabelsVisible) shape.setLabelsVisible(showLabels);
    else updateView();
  });

  // Mô phỏng Toán học: Thiết diện & Trải hình phẳng
  byId('viewer-cross-section')?.addEventListener('change',e=>{
    crossSectionEnabled=e.target.checked;
    const wrap=byId('cross-section-slider-wrap');
    if(wrap) wrap.hidden=!crossSectionEnabled;
    updateView();
  });
  byId('cross-section-slider')?.addEventListener('input',e=>{
    crossSectionPct=Number(e.target.value);
    const val=byId('cross-section-val');
    if(val) val.textContent=`${crossSectionPct}%`;
    if(shape?.setCrossSection){
      const info=shape.setCrossSection(crossSectionEnabled,crossSectionPct);
      const mathEl=byId('cross-section-math');
      if(mathEl&&info){
        if(info.type==='square'){
          mathEl.innerHTML=formatInlineMathHtml(`Thiết diện: <b>Hình vuông</b> cạnh $w = ${info.side}$<br/>Tỉ lệ diện tích: $\\frac{S}{S_0} = (1-t)^2 = ${Math.round(info.ratio*100)}\\%$<br/>Diện tích thiết diện: $S = ${info.area}$`);
        }else if(info.type==='rectangle'){
          mathEl.innerHTML=formatInlineMathHtml(`Thiết diện: <b>Hình chữ nhật</b> cạnh $a \\times b = ${info.width} \\times ${info.length}$<br/>Diện tích thiết diện: $S = ${info.area}$`);
        }
      }
    }
  });

  byId('viewer-unfold')?.addEventListener('change',e=>{
    unfoldEnabled=e.target.checked;
    const wrap=byId('unfold-slider-wrap');
    if(wrap) wrap.hidden=!unfoldEnabled;
    if(shape?.setUnfoldProgress) shape.setUnfoldProgress(unfoldEnabled?unfoldProgress:0);
  });
  byId('unfold-slider')?.addEventListener('input',e=>{
    unfoldProgress=Number(e.target.value)/100;
    const val=byId('unfold-val');
    if(val) val.textContent=`${e.target.value}%`;
    if(shape?.setUnfoldProgress) shape.setUnfoldProgress(unfoldProgress);
  });

  // Xuất ảnh PNG độ nét cao
  byId('viewer-export-png')?.addEventListener('click',()=>{
    if(!current) return;
    renderer.render(scene,camera);
    const safeTitle=(current.title||'mo-hinh-toan-3d').replace(/[\s/\\?%*:|"<>]+/g,'_');
    const dataUrl=canvas.toDataURL('image/png');
    const a=document.createElement('a');
    a.download=`${safeTitle}_Lop${current.grade}.png`;
    a.href=dataUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  byId('viewer-spin').addEventListener('click',e=>{
    spin=!spin;
    e.target.textContent=`Tự quay: ${spin?'Bật':'Tắt'}`;
  });

  byId('viewer-save').addEventListener('click',()=>{
    if(current&&onSave) onSave({...current,params:{...params}});
  });

  byId('viewer-copy').addEventListener('click',async()=>{
    try {
      await navigator.clipboard.writeText(current?.formula||'');
      byId('viewer-copy').textContent='✓ Đã chép LaTeX';
      setTimeout(()=>{byId('viewer-copy').textContent='📋 Sao chép LaTeX';},1200);
    }catch{
      alert('Không thể sao chép tự động; cô chọn và sao chép công thức hiển thị.');
    }
  });

  let drag=null;
  canvas.addEventListener('pointerdown',e=>{
    drag={x:e.clientX,y:e.clientY};
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(!drag)return;
    yaw-=(e.clientX-drag.x)*.009;
    pitch=THREE.MathUtils.clamp(pitch-(e.clientY-drag.y)*.009,-1.4,1.4);
    drag={x:e.clientX,y:e.clientY};
  });
  canvas.addEventListener('pointerup',()=>drag=null);
  canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('wheel',e=>{
    if(!visible)return;
    e.preventDefault();
    distance=THREE.MathUtils.clamp(distance+e.deltaY*.008,3.3,13);
  },{passive:false});

  return {open,close,getCurrent:()=>current,isOpen:()=>visible,setProjectionMode,getProjectionMode:()=>projectionMode};
}
