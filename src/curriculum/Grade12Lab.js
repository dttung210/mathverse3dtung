import {lessonMotionProgress} from './educational-motion.mjs?v=r107_v15';
import {Solid3DViewer} from '../viewers/Solid3DViewer.js?v=r107_v15';
import {grade12Defaults,grade12Schema,grade12Valid,grade12Math,grade12Is3D,grade12SolidModel,grade12AnimatedParams} from './grade12-engine.mjs?v=r107_v15';
import {grade12SceneSVG,grade12SpatialSVG} from './grade12-svg.mjs?v=r107_v15';
import {mountRenderedFormula,formatMathText} from './math-formula-renderer.mjs?v=r107_v15';
import {getGuidedDiscoveryPlan} from './guided-discovery.mjs?v=r107_v15';
import {createStageInteractivity,decorateInteractiveSVG,tryStartLabelOrPointDrag,handleLabelOrPointMove,stopLabelOrPointDrag,bindFrameWheelZoom,resetStageInteractivity} from './svg-stage-interactivity.mjs?v=r107_v15';
import {scheduleLabAutoplay,cancelLabAutoplay,isAutoPlayEnabled,setAutoPlayEnabled} from './lab-autoplay.mjs?v=r107_v15';
import {applySpatialMotion,mountSpatialLessonGuide,updateSpatialLessonGuide} from './spatial-educational-motion.mjs?v=r107_v15';
const node=(tag,text='',cls='')=>{const x=document.createElement(tag);x.textContent=text;if(cls)x.className=cls;return x;};
const btn=(title,fn)=>{const b=node('button',title,'mv-g7-button');b.type='button';b.addEventListener('click',fn);return b;};
const fmt=x=>Number.isFinite(x)?Number(x.toFixed(3)).toLocaleString('vi-VN'):'—';
/** Isolated lifecycle: avoids WebGL context leaks on changing modes. */
export class Grade12Lab{
 constructor(){this.listeners=[];this.playing=false;this.t=0;this.raf=0;this.previous=0;this.solid=null;this.drag=null;this.destroyed=false;this.webgl=false;this.seed=20261027;this.trials=0;this.last3d=-1;this.stageState=createStageInteractivity();this._updatingSolid=false;this._syncingFromSolid=false;}
 listen(target,event,fn){target.addEventListener(event,fn);this.listeners.push([target,event,fn]);}
 mount(host,id,mode){if(this.host)this.destroy();this.destroyed=false;this.host=host;this.id=id;this.mode=mode;this.params=grade12Defaults(id);this.isSolid=grade12Is3D(id);this.trials=this.params.trials||120;this.stageState=createStageInteractivity();
  try{const stored=JSON.parse(localStorage.getItem('mathverse:g12:lab:'+id)||'null');if(stored&&grade12Valid(id,stored))this.params=stored;}catch{}
  host.replaceChildren();host.classList.add('mv-g7-host');host.append(node('p',mode?.student_interaction||'Khám phá trực quan Toán 12','mv-r5-statement'));
  this.viewport=node('div','','mv-g7-viewport');
  if(this.isSolid){
   const dualGrid=node('div','','mv-g7-dual-grid');
   const leftCol=node('div','','mv-g7-dual-col');
   this.canvas=node('div','','mv-g7-3d-stage');this.canvas.style.height='100%';this.viewport.append(this.canvas);
   leftCol.append(node('div','🧊 Không gian Oxyz / Khối 3D (Kéo điểm 3D / nhãn / xoay 360°)','mv-g7-dual-badge'),this.viewport);
   const rightCol=node('div','','mv-g7-dual-col');
   this.schematic=node('div','','mv-g7-net');this.schematic.style.touchAction='none';
   rightCol.append(node('div','📐 Mặt cắt & Sơ đồ Tọa độ 2D Đồng bộ (Kéo điểm / nhãn)','mv-g7-dual-badge'),this.schematic);
   dualGrid.append(leftCol,rightCol);
   host.append(dualGrid);
   this.mountSolid();
   this.bindPointer(this.schematic);
  }else{this.viewport.classList.add('mv-g7-svg-stage');this.viewport.style.touchAction='none';host.append(this.viewport);this.bindPointer(this.viewport);}
  this.status=node('p','','mv-g7-status');this.status.setAttribute('aria-live','polite');host.append(this.status);
  this.metrics=node('div','','mv-r5-values');host.append(this.metrics);
  const actions=node('div','','mv-g7-buttons');host.append(actions);
  this.play=btn('▶ Phát chuyển động',()=>this.setPlaying(!this.playing));actions.append(this.play);
  actions.append(btn('⏮ Bước trước',()=>{this.setPlaying(false);this.t=Math.max(0,this.t-.8);if(this.revolutionSlider){this.revolutionAngle=Math.max(45,Math.round(60+300*(this.t/6)));}this.draw();}));
  actions.append(btn('⏭ Tiếp bước',()=>{this.setPlaying(false);this.t=Math.min(6,this.t+.8);if(this.revolutionSlider){this.revolutionAngle=Math.max(45,Math.round(60+300*(this.t/6)));}this.draw();}));
  for(const pct of [0,50,100])actions.append(btn(`${pct}%`,()=>this.setProgress(pct)));
  actions.append(btn('↺ Đặt lại',()=>{this.setPlaying(false);this.params=grade12Defaults(id);this.t=0;this.trials=this.params.trials||120;this.revolutionAngle=60;resetStageInteractivity(this.stageState);if(this.solid?.labelOffsets3D){this.solid.labelOffsets3D.clear();this.solid._rebuildShape();}this.syncControls();this.draw();this.save();}));
  const autoBtn=btn(isAutoPlayEnabled(this)?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt',()=>{const next=setAutoPlayEnabled(this,!isAutoPlayEnabled(this));autoBtn.textContent=next?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt';});
  actions.append(autoBtn);
  if(this.isSolid){
   actions.append(btn('▦ Đặc / khung dây',()=>{if(this.solid){this.wire=!this.wire;this.solid.setDisplayMode(this.wire?'wireframe':'solid');}}));
   actions.append(btn('🎯 Ẩn/Hiện nút kéo 3D',()=>{if(this.solid){this.solid.setShowHandles(!this.solid.showHandles);}}));
   actions.append(btn('↻ Góc nhìn chuẩn',()=>this.solid?.setViewPreset('iso')));
  }
  if(this.isSolid&&id.startsWith('12-07')){
   this.revolutionAngle=60;
   const sweepLabel=node('label','G\u00f3c qu\u00e9t t\u1ea1o kh\u1ed1i (0\u00b0-360\u00b0)','mv-g7-timeline');
   this.revolutionSlider=node('input');this.revolutionSlider.type='range';this.revolutionSlider.min='0';this.revolutionSlider.max='360';this.revolutionSlider.step='5';this.revolutionSlider.value='60';
   this.revolutionOutput=node('output','60°');
   this.listen(this.revolutionSlider,'input',()=>{this.setPlaying(false);this.revolutionAngle=Number(this.revolutionSlider.value);this.revolutionOutput.textContent=this.revolutionAngle+'°';this.solid?.setRevolutionProgress(this.revolutionAngle/360);});
   sweepLabel.append(this.revolutionSlider,this.revolutionOutput);host.append(sweepLabel);
  } else {this.revolutionSlider=null;this.revolutionOutput=null;this.revolutionAngle=360;}
  this.timeline=node('input');this.timeline.type='range';this.timeline.min=0;this.timeline.max=6;this.timeline.step=.05;this.timeline.value=0;
  const timelineLabel=node('label','Thanh tiến trình chuyển động (0% → 100%)','mv-g7-timeline');timelineLabel.append(this.timeline);host.append(timelineLabel);
  this.listen(this.timeline,'input',()=>{this.setPlaying(false);this.t=Number(this.timeline.value);if(this.revolutionSlider){this.revolutionAngle=Math.max(45,Math.round(60+300*(this.t/6)));this.revolutionSlider.value=this.revolutionAngle;this.revolutionOutput.textContent=this.revolutionAngle+'°';}this.draw();});
  this.fields=new Map();const grid=node('div','','mv-r5-params');for(const cfg of grade12Schema(id)){
   const lab=node('label','','mv-r5-param'),name=node('span',formatMathText(cfg.label),'mv-r5-param-label'),out=node('output',fmt(this.params[cfg.key])),input=node('input');
   input.type='range';input.min=cfg.min;input.max=cfg.max;input.step=cfg.step;input.value=this.params[cfg.key];
   this.listen(input,'input',()=>{this.params[cfg.key]=Number(input.value);
    if(this.id==='12-03-C02')this.params.x=Math.min(this.params.x,this.params.L/2-.12);
    if(this.id==='12-03-C01')this.params.x=Math.min(this.params.x,this.params.P/2-.12);
    if(this.id==='12-03-C03')this.params.price=Math.min(this.params.price,this.params.demand/this.params.slope);
    if(this.id==='12-07-C02')this.params.hole=Math.min(this.params.hole,Math.min(this.params.r1,this.params.r2)-.1);
    this.syncControls();this.save();this.draw();});lab.append(name,out,input);grid.append(lab);this.fields.set(cfg.key,{input,out});
  }host.append(grid);
  this.latex=node('div','','mv-r5-latex');const cp=btn('📋 Sao chép công thức LaTeX',async()=>{try{await navigator.clipboard.writeText(this.latex.dataset.rawLatex||this.latex.textContent);cp.textContent='✓ Đã sao chép';}catch{cp.textContent='Chọn công thức để sao chép';}});host.append(cp,this.latex);
  host.append(node('p',this.isSolid?'Mô hình dùng mesh Three.js thật: kéo nút 3D để đổi tọa độ/kích thước/góc, kéo nhãn 3D/2D để tránh đè chữ, kéo nền xoay camera 360°, lăn chuột phóng to.':'Hình SVG 2D được dựng theo dữ liệu thật; có thể kéo điểm điều khiển, kéo mọi chữ/nhãn tránh đè hình, lăn chuột thu phóng khung làm việc.', 'mv-r5-hint'));
  if(this.isSolid)this.spatialGuide=mountSpatialLessonGuide(host,id,this.solidType||'openTopBox');
  this.t=0;this.draw();scheduleLabAutoplay(this,{delay:90,reset:false});
 }
 _applySolidParams(next){
  if(this._updatingSolid||!next)return;
  const clampKey=(k,v)=>{const f=this.fields?.get(k);if(!f?.input||!Number.isFinite(v))return v;const min=Number(f.input.min),max=Number(f.input.max),step=Number(f.input.step)||.05;return Math.min(max,Math.max(min,Math.round(v/step)*step));};
  const cand={...this.params},fam=this.id.slice(0,5),m=Number(this.id.slice(-2));
  if(fam==='12-03'){
   if(next.L!==undefined&&cand.L!==undefined)cand.L=clampKey('L',next.L);
   if(next.cut!==undefined&&cand.x!==undefined)cand.x=clampKey('x',next.cut);
   cand.x=Math.min(cand.x,cand.L/2-.12);
  }else if(fam==='12-04'||fam==='12-09'||fam==='12-10'||fam==='12-08'){
   if(next.x!==undefined&&cand.vx!==undefined)cand.vx=clampKey('vx',next.x);
   if(next.y!==undefined&&cand.vy!==undefined)cand.vy=clampKey('vy',next.y);
   if(next.z!==undefined&&cand.vz!==undefined)cand.vz=clampKey('vz',next.z);
   if(next.x0!==undefined&&cand.vx!==undefined)cand.vx=clampKey('vx',next.x0);
   if(next.y0!==undefined&&cand.vy!==undefined)cand.vy=clampKey('vy',next.y0);
   if(next.z0!==undefined&&cand.vz!==undefined)cand.vz=clampKey('vz',next.z0);
   if(next.u1!==undefined&&cand.ux!==undefined)cand.ux=clampKey('ux',next.u1);
   if(next.u2!==undefined&&cand.uy!==undefined)cand.uy=clampKey('uy',next.u2);
   if(next.u3!==undefined&&cand.uz!==undefined)cand.uz=clampKey('uz',next.u3);
   if(next.A!==undefined&&cand.A!==undefined)cand.A=clampKey('A',next.A);
   if(next.B!==undefined&&cand.B!==undefined)cand.B=clampKey('B',next.B);
   if(next.C!==undefined&&cand.C!==undefined)cand.C=clampKey('C',next.C);
   if(next.D!==undefined&&cand.D!==undefined&&!(fam==='12-08'&&m===1))cand.D=clampKey('D',next.D);
   if(next.angle!==undefined&&cand.deg!==undefined)cand.deg=clampKey('deg',next.angle);
   if(next.deg!==undefined&&cand.deg!==undefined)cand.deg=clampKey('deg',next.deg);
   if(next.dist!==undefined&&cand.dist!==undefined)cand.dist=clampKey('dist',next.dist);
   if(next.gap!==undefined&&cand.dist!==undefined)cand.dist=clampKey('dist',next.gap);
   if(next.r!==undefined&&cand.r!==undefined)cand.r=clampKey('r',next.r);
  }else if(fam==='12-07'){
   for(const k of ['r1','r2','h','hole','slice']){if(next[k]!==undefined&&cand[k]!==undefined)cand[k]=clampKey(k,next[k]);}
   if(this.id==='12-07-C02')cand.hole=Math.min(cand.hole,Math.min(cand.r1,cand.r2)-.1);
  }
  if(grade12Valid(this.id,cand)){
   this.params=cand;this.syncControls();this.save();
   this._syncingFromSolid=true;this.draw();this._syncingFromSolid=false;
  }
 }
 mountSolid(model=grade12SolidModel(this.id,this.params,this.t)){this.webgl=false;try{this.solidType=model.type;this.solid=new Solid3DViewer(model,{onParametersChange:next=>this._applySolidParams(next)});this.solid.mount(this.canvas);this.solid.setToolMode('edit');this.solid.setShowHandles(true);this.solid.setViewPreset('iso');this.webgl=true;}
  catch(error){try{this.solid?.dispose?.();}catch{}this.solid=null;this.canvas.replaceChildren(node('p','⚠ Chưa hiển thị WebGL 3D: '+error.message,'mv-g7-fallback'));}
 }
 bindPointer(container=this.viewport){
  if(!container)return;
  bindFrameWheelZoom(this.stageState,container,(t,ev,fn)=>this.listen(t,ev,fn));
  this.listen(container,'pointerdown',e=>{
   const directKey=e.target?.getAttribute?.('data-handle')||e.target?.closest?.('[data-handle]')?.getAttribute?.('data-handle');
   if(!directKey&&tryStartLabelOrPointDrag(this.stageState,container,e))return;
   let key=directKey;
   if(!key){
    const svg=container.querySelector('svg'),pts=svg?[...svg.querySelectorAll('[data-handle]')]:[];
    if(pts.length===1)key=pts[0].getAttribute('data-handle');
    else if(pts.length>1){
     let best=null,minD=1e9;
     for(const el of pts){const b=el.getBoundingClientRect(),d=Math.hypot(e.clientX-(b.left+b.width/2),e.clientY-(b.top+b.height/2));if(d<minD){minD=d;best=el;}}
     if(best&&minD<90)key=best.getAttribute('data-handle');
    }
    if(!key)key='__canvas__';
   }
   this.drag=key;this.dragContainer=container;this.dragStart={x:e.clientX,y:e.clientY,params:{...this.params}};
   try{container.setPointerCapture(e.pointerId);}catch{}e.preventDefault();});
  this.listen(container,'pointermove',e=>{
   if(handleLabelOrPointMove(this.stageState,container,e))return;
   if(!this.drag||this.dragContainer!==container)return;
   const svg=container.querySelector('svg'),r=svg?.getBoundingClientRect();if(!r?.width)return;
   let x=394+550*(e.clientX-r.left)/r.width,y=70+412*(e.clientY-r.top)/r.height;
   try{const ctm=svg.getScreenCTM?.();if(ctm&&typeof DOMPoint==='function'){const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform(ctm.inverse());x=pt.x;y=pt.y;}}catch{}
   const clampKey=(k,v)=>{const f=this.fields?.get(k);if(!f?.input||!Number.isFinite(v))return v;const min=Number(f.input.min),max=Number(f.input.max),step=Number(f.input.step)||.05;return Math.min(max,Math.max(min,Math.round(v/step)*step));};
   const before=JSON.stringify(this.params);
   if(this.drag==='x'&&this.id==='12-03-C01')this.params.x=clampKey('x',(x-424)/492*this.params.P/2);
   else if(this.drag==='x'&&this.id==='12-03-C02')this.params.x=clampKey('x',Math.min(this.params.L/2-.12,x>650?(x-684)/226*(this.params.L/2):(x-436)/210*this.params.L));
   else if(this.drag==='price'&&this.id==='12-03-C03')this.params.price=clampKey('price',(x-424)/492*this.params.demand/this.params.slope);
   else if(this.drag==='x'&&this.id==='12-06-C01')this.params.x=clampKey('x',-1.6+(x-424)/492*4.6);
   else if(/^n[1-4]$/.test(this.drag)&&this.id.startsWith('12-05'))this.params[this.drag]=Math.max(1,Math.min(20,Math.round((378-y)/11.5)));
   else if(this.drag==='slice'&&this.params.slice!==undefined)this.params.slice=clampKey('slice',(x-442)/230);
   else if((this.drag==='r1'||this.drag==='r2')&&this.params[this.drag]!==undefined)this.params[this.drag]=clampKey(this.drag,Math.abs(276-y)/36);
   else if(this.drag==='dist'&&this.isSolid&&this.params.dist!==undefined)this.params.dist=clampKey('dist',Math.abs((this.id.startsWith('12-10')?262:310)-y)/(this.id.startsWith('12-10')?42:28));
   else if(this.drag==='r'&&this.isSolid&&this.params.r!==undefined)this.params.r=clampKey('r',Math.hypot(x-668,y-262)/42);
   else if(this.drag==='deg'&&this.isSolid&&this.params.deg!==undefined){const ox=this.id==='12-09-C04'?620:668,oy=this.id==='12-09-C04'?316:308;this.params.deg=clampKey('deg',Math.abs(Math.atan2(oy-y,x-ox)*180/Math.PI));}
   if(JSON.stringify(this.params)===before&&this.dragStart&&this.fields.size){
    const keys=this.fields.has(this.drag)?[this.drag]:[...this.fields.keys()],dx=(e.clientX-this.dragStart.x)/r.width,dy=(this.dragStart.y-e.clientY)/r.height;
    const apply=(k,delta)=>{const f=this.fields.get(k);if(!f?.input)return;const min=Number(f.input.min),max=Number(f.input.max),step=Number(f.input.step)||.1;const raw=this.dragStart.params[k]+delta*(max-min);const val=Math.min(max,Math.max(min,Math.round(raw/step)*step));const next={...this.params,[k]:val};if(grade12Valid(this.id,next))this.params[k]=val;};
    if(keys.length===1)apply(keys[0],Math.abs(dx)>Math.abs(dy)?dx:dy);
    else{if(keys[0])apply(keys[0],dx);if(keys[1])apply(keys[1],dy);}
   }
   if(this.id==='12-03-C02')this.params.x=Math.min(this.params.x,this.params.L/2-.12);
   if(this.id==='12-03-C01')this.params.x=Math.min(this.params.x,this.params.P/2-.12);
   if(this.id==='12-03-C03')this.params.price=Math.min(this.params.price,this.params.demand/this.params.slope);
   if(this.id==='12-07-C02')this.params.hole=Math.min(this.params.hole,Math.min(this.params.r1,this.params.r2)-.1);
   this.syncControls();this.save();this.draw();e.preventDefault();});
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])this.listen(container,ev,e=>{stopLabelOrPointDrag(this.stageState,container,e);this.drag=null;this.dragStart=null;this.dragContainer=null;});
 }
 save(){try{localStorage.setItem('mathverse:g12:lab:'+this.id,JSON.stringify(this.params));}catch{}}
 syncControls(){for(const [key,f] of this.fields){f.input.value=this.params[key];f.out.textContent=fmt(this.params[key]);}}
 setProgress(pct){
  this.setPlaying(false);
  const p=Math.max(0,Math.min(100,Number(pct)||0))/100;
  this.t=Number((p*6).toFixed(2));
  if(this.revolutionSlider){this.revolutionAngle=Math.max(45,Math.round(60+300*p));this.revolutionSlider.value=String(this.revolutionAngle);this.revolutionOutput.textContent=this.revolutionAngle+'°';}
  this.draw();
 }
 setPlaying(v){if(this.destroyed)return;if(!v)cancelLabAutoplay(this);this.playing=!!v;if(this.playing&&this.t>=6)this.t=0;if(this.play)this.play.textContent=v?'⏸ Tạm dừng':'▶ Phát chuyển động';if(this.solid)this.solid.autoRotate=false;this.previous=0;if(this.playing&&!this.raf)this.raf=requestAnimationFrame(now=>this.tick(now));}
 tick(now){this.raf=0;if(!this.playing||this.destroyed)return;const delta=this.previous?Math.min(.08,(now-this.previous)/1000):.016;this.previous=now;const period=6;this.t=Math.min(period,this.t+delta);
  if(!this.isSolid||now-this.last3d>95||this.t>=period){this.draw();this.last3d=now;}else if(this.timeline)this.timeline.value=this.t;
  if(this.t>=period){this.setPlaying(false);return;}this.raf=requestAnimationFrame(n=>this.tick(n));}
 draw(){if(this.destroyed||!this.viewport)return;try{const actual=this.isSolid&&this.id!=='12-03-C02'?grade12AnimatedParams(this.id,this.params,this.t):this.params;
   if(!grade12Valid(this.id,actual))throw Error('Điều kiện Toán học chưa được thỏa mãn. Điều chỉnh tham số.');
   const math=grade12Math(this.id,actual);
   const plan=getGuidedDiscoveryPlan(this.id,this.mode||{});
   if(this.isSolid){const model=grade12SolidModel(this.id,this.params,this.id==='12-03-C02'?0:this.t);if(this.solid){if(this.solidType!==model.type){this.solid.dispose();this.solid=null;this.mountSolid(model);}else if(!this._syncingFromSolid){this._updatingSolid=true;this.solid.updateParameters(model.params);this._updatingSolid=false;}this.webgl=!!this.solid;}
    else this.webgl=false;if(this.schematic){this.schematic.innerHTML=grade12SpatialSVG(this.id,actual,this.t);decorateInteractiveSVG(this.schematic,this.stageState);}this.status.textContent=(this.webgl?'✓ Hình học 3D thật, tham số và số đo được cập nhật':'⚠ WebGL chưa hoạt động; đây không phải hình 3D đã nghiệm thu')+(plan?.takeaway?` · Kết luận: ${plan.takeaway}`:'');
   }else{this.viewport.innerHTML=grade12SceneSVG(this.id,this.params,this.t);decorateInteractiveSVG(this.viewport,this.stageState);this.status.textContent='✓ SVG 2D: vẽ lại theo thời gian và tham số'+(plan?.takeaway?` · Kết luận: ${plan.takeaway}`:'');}
   if(this.solid){
    if(this.id==='12-03-C02')this.spatialFrame=applySpatialMotion(this.solid,{id:this.id,type:'openTopBox',seconds:this.t,duration:6,deep:true});
    updateSpatialLessonGuide(this.spatialGuide,this.id,this.solidType||'openTopBox',this.t,6,this.spatialFrame?.phase);
   }
   if(this.solid&&this.revolutionSlider){
     const angle=this.playing?Math.max(45,Math.round(60+300*lessonMotionProgress(this.t))):this.revolutionAngle;
     this.revolutionAngle=angle;
     this.solid.setRevolutionProgress(angle/360);
     this.revolutionSlider.value=String(angle);this.revolutionOutput.textContent=angle+'°';
   }
   this.status.className='mv-g7-status';this.metrics.replaceChildren();
   const isExt=this.mode?.display_status==='EXTENSION'||['12-07-C02','12-10-C03'].includes(this.id);
   const modeHeader=node('div',formatMathText(`${this.id}${isExt?' [MỞ RỘNG]':''} • ${this.mode?.name||this.mode?.title||'Mô hình Toán 12'}`),'mv-r5-value');
   modeHeader.style.fontWeight='800';modeHeader.style.color='#1D4ED8';
   this.metrics.append(modeHeader);
   for(const value of math.values)this.metrics.append(node('div',formatMathText(value),'mv-r5-value'));mountRenderedFormula(this.latex,math.latex);this.error=null;
  }catch(error){this.error=error.message;this.status.textContent='⚠ '+error.message;this.status.className='mv-g7-status invalid';this.metrics.replaceChildren();if(!this.isSolid)this.viewport.replaceChildren(node('p',error.message,'mv-g7-fallback'));}
  if(this.timeline)this.timeline.value=this.t;
 }
 destroy(){cancelLabAutoplay(this);this.setPlaying(false);this.destroyed=true;if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;for(const [target,type,fn] of this.listeners)target.removeEventListener(type,fn);this.listeners=[];try{this.solid?.dispose?.();}catch{}this.solid=null;}
}
