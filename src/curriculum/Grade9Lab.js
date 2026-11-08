import {Solid3DViewer} from '../viewers/Solid3DViewer.js?v=r107_v15';
import {isGrade9Mode,grade9Schema,grade9Defaults,grade9Valid,grade9Solid,grade9Math,grade9SolidModel,grade9Experiment} from './grade9-engine.mjs?v=r107_v15';
import {grade9SceneSVG,grade9NetSVG} from './grade9-svg.mjs?v=r107_v15';
import {mountRenderedFormula,formatMathText} from './math-formula-renderer.mjs?v=r107_v15';
import {getGuidedDiscoveryPlan} from './guided-discovery.mjs?v=r107_v15';
import {createStageInteractivity,decorateInteractiveSVG,tryStartLabelOrPointDrag,handleLabelOrPointMove,stopLabelOrPointDrag,bindFrameWheelZoom,resetStageInteractivity} from './svg-stage-interactivity.mjs?v=r107_v15';
import {scheduleLabAutoplay,cancelLabAutoplay,isAutoPlayEnabled,setAutoPlayEnabled} from './lab-autoplay.mjs?v=r107_v15';
import {applySpatialMotion,mountSpatialLessonGuide,updateSpatialLessonGuide} from './spatial-educational-motion.mjs?v=r107_v15';
const el=(name,txt='',cls='')=>{const x=document.createElement(name);x.textContent=txt;if(cls)x.className=cls;return x;};
const btn=(name,callback)=>{const x=el('button',name,'mv-g7-button');x.type='button';x.addEventListener('click',callback);return x;};
const fmt=v=>Number.isFinite(v)?Number(v.toFixed(2)).toLocaleString('vi-VN'):'—';
/** Each Grade 9 lab owns its WebGL/canvas lifecycle and has honest fallback states. */
export class Grade9Lab {
 constructor(){this.events=[];this.playing=false;this.t=0;this.raf=0;this.prev=0;this.destroyed=false;this.trials=0;this.seed=20260926;this.drag=null;this.solid=null;this.stageState=createStageInteractivity();this._updating3D=false;}
 listen(t,e,cb){t.addEventListener(e,cb);this.events.push([t,e,cb]);}
 mount(container,id,mode){if(!isGrade9Mode(id))throw Error('Chế độ Toán 9 chưa triển khai');this.id=id;this.params=grade9Defaults(id);this.mode=mode;this.container=container;this.stageState=createStageInteractivity();container.replaceChildren();container.classList.add('mv-g7-host');
  container.append(el('p',mode?.student_interaction||'Mô hình tương tác theo SGK Toán 9','mv-r5-statement'));
  const viewport=el('div','','mv-g7-viewport');this.viewport=viewport;
  if(grade9Solid(id)){
   const dualGrid=el('div','','mv-g7-dual-grid');
   const leftCol=el('div','','mv-g7-dual-col');
   leftCol.append(el('div','🧊 Khối Không Gian 3D Tương Tác (Kéo chuột để xoay 360°)','mv-g7-dual-badge'),viewport);
   const webgl=el('div','','mv-g7-3d-stage');webgl.style.height='100%';viewport.append(webgl);this.canvas=webgl;
   const rightCol=el('div','','mv-g7-dual-col');
   this.net=el('div','','mv-g7-net');
   const badge2D=id==='9-09-C02'||id==='9-10-C02'
    ?'📐 Bản Khai Triển Phẳng 2D (Mặt xung quanh & mặt đáy)'
    :id==='9-09-C01'?'📐 Hình Chữ Nhật OO′AB Quay Quanh Trục Tạo Hình Trụ 2D'
    :id==='9-09-C03'?'📐 Lớp Thiết Diện Tròn πr² & Thể Tích Hình Trụ V = πr²h 2D'
    :id==='9-10-C01'?'📐 Tam Giác Vuông △SOA Quay Tạo Hình Nón & Đường Sinh l 2D'
    :id==='9-10-C03'?'📐 Thiết Diện Tròn Thu Nhỏ r(z) & Thể Tích Nón V = ⅓πr²h 2D'
    :id==='9-11-C01'?'📐 Nửa Đường Tròn Đường Kính 2R Quay Tạo Mặt Cầu 2D'
    :id==='9-11-C02'?'📐 Đối Chiếu Diện Tích Mặt Cầu S = 4πR² & Thể Tích V = (4/3)πR³ 2D'
    :'📐 Mặt Phẳng Cắt Khối Cầu & Thiết Diện Tròn r = √(R² − d²) 2D';
   rightCol.append(el('div',badge2D,'mv-g7-dual-badge'),this.net);
   dualGrid.append(leftCol,rightCol);
   container.append(dualGrid);
   this.mountSolid();
  }else{viewport.classList.add('mv-g7-svg-stage');container.append(viewport);this.draw();}
  if(grade9Solid(id))this.spatialGuide=mountSpatialLessonGuide(container,id,this.solid?.model?.type);
  this.status=el('p','','mv-g7-status');container.append(this.status);
  this.metrics=el('div','','mv-r5-values');container.append(this.metrics);
  const actions=el('div','','mv-g7-buttons');container.append(actions);
  const period=id.startsWith('9-13')?8:6;
  this.play=btn('▶ Phát chuyển động',()=>this.setPlaying(!this.playing));actions.append(this.play);
  actions.append(btn('⏮ Bước trước',()=>{this.setPlaying(false);this.t=Math.max(0,this.t-1);this.draw();}));
  actions.append(btn('⏭ Tiếp bước',()=>{this.setPlaying(false);this.t=Math.min(period,this.t+1);this.draw();}));
  for(const [lbl,pct] of [['0%',0],['50%',50],['100%',100]]){
   actions.append(btn(lbl,()=>this.setProgress(pct)));
  }
  actions.append(btn('↺ Đặt lại',()=>{this.setPlaying(false);this.params=grade9Defaults(this.id);this.t=0;this.trials=0;this.seed=20260926;resetStageInteractivity(this.stageState);if(this.solid?.labelOffsets3D){this.solid.labelOffsets3D.clear();this.solid._rebuildShape();}this.syncControls();this.syncSolid();this.draw();}));
  const autoBtn=btn(isAutoPlayEnabled(this)?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt',()=>{const next=setAutoPlayEnabled(this,!isAutoPlayEnabled(this));autoBtn.textContent=next?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt';});
  actions.append(autoBtn);
  if(id.startsWith('9-13'))for(const n of [1,10,100])actions.append(btn(`🎲 Thử ${n} lần`,()=>{this.setPlaying(false);this.trials=Math.min(1200,this.trials+n);this.draw();}));
  if(grade9Solid(id)){
   this.spatialMode='lesson';
   if(!id.startsWith('9-11'))actions.append(btn('◇ Xem gấp / trải mặt khối',()=>{
    if(!this.solid?.meshGroup?.supportsUnfold)return;
    this.setPlaying(false);this.spatialMode=this.spatialMode==='fold'?'lesson':'fold';this.t=0;this.draw();this.setPlaying(true);
   }));
   actions.append(btn('▦ Đặc / khung dây',()=>{if(!this.solid)return;this.wire=!this.wire;this.solid.setDisplayMode(this.wire?'wireframe':'solid');}));
   actions.append(btn('↻ Góc nhìn chuẩn',()=>this.solid?.setViewPreset('iso')));
  }
  this.timeline=el('input');this.timeline.type='range';this.timeline.min=0;this.timeline.max=id.startsWith('9-13')?8:6;this.timeline.step='.05';this.timeline.value=0;
  const timelineLabel=el('label','Tua chuyển động / tiến trình dựng hình','mv-g7-timeline');timelineLabel.append(this.timeline);container.append(timelineLabel);
  this.listen(this.timeline,'input',()=>{this.setPlaying(false);this.t=Number(this.timeline.value);this.draw();});
  this.fields=new Map();const grid=el('div','','mv-r5-params');for(const cfg of grade9Schema(id)){
   if(id!=='9-07-C06'&&cfg.key==='n')continue;if(id.startsWith('9-07-')&&Number(id.slice(-2))>=3&&cfg.key==='theta')continue;if(id!=='9-11-C03'&&cfg.key==='d'&&id.startsWith('9-11'))continue;
   const lab=el('label','','mv-r5-param'),name=el('span',formatMathText(id.startsWith('9-07-C0')&&['9-07-C03','9-07-C04'].includes(id)&&cfg.key==='r'?'Tỉ lệ kích thước tam giác':cfg.label),'mv-r5-param-label'),output=el('output',fmt(this.params[cfg.key])),input=el('input');input.type='range';input.min=cfg.min;input.max=cfg.max;input.step=cfg.step;input.value=this.params[cfg.key];this.listen(input,'input',()=>{
    this.params[cfg.key]=Number(input.value);
    if(id.startsWith('9-13'))this.params.wanted=Math.min(this.params.wanted,this.params.sides);
    this.syncControls();this.syncSolid();this.draw();});lab.append(name,output,input);grid.append(lab);this.fields.set(cfg.key,{input,output});
  }container.append(grid);
  const cp=btn('📋 Sao chép công thức LaTeX',async()=>{try{await navigator.clipboard.writeText(this.latex.dataset.rawLatex||this.latex.textContent);cp.textContent='✓ Đã sao chép';}catch{cp.textContent='Bôi đen công thức để sao chép';}});
  this.latex=el('div','','mv-r5-latex');container.append(cp,this.latex);
  container.append(el('p',grade9Solid(id)?'Khối có lưới Three.js 3D. Kéo trên khối để đổi góc nhìn; hình khai triển/thiết diện bên dưới là sơ đồ 2D tính đúng tỉ lệ; có thể gấp/trải mặt 3D theo bản lề hoặc cuộn mặt cong nếu loại khối hỗ trợ.':'Phát để hình biến đổi; có thể tua, thay tham số và kéo các điểm điều khiển nếu được đánh dấu bằng viền cam.','mv-r5-hint'));
  if(!grade9Solid(id))this.bindPointer(this.viewport);else if(this.net)this.bindPointer(this.net);this.t=0;this.draw();scheduleLabAutoplay(this,{delay:90,reset:false});
 }
 setProgress(pct){
  this.setPlaying(false);
  const period=this.id.startsWith('9-13')?8:6;
  const f=Math.max(0,Math.min(1,Number(pct)/100));
  this.t=Number((f*period).toFixed(3));
  if(this.id.startsWith('9-13')&&f>0)this.trials=Math.max(this.trials,f>=0.95?20:10);
  if(this.timeline)this.timeline.value=this.t;
  this.syncSolid(this._animatedParams());
  this.draw();
 }
 _animatedParams(){
  if(!grade9Solid(this.id))return this.params;
  const p={...this.params};
  if(this.id==='9-11-C03'&&this.t>0){
   const u=Math.min(1,Math.max(0,this.t/6));
   // Từ d = 0 (đường tròn lớn) -> d = R (tiếp điểm) khi t đi từ 0 -> 100%, nếu người dùng chưa kéo vượt R
   if(p.d<=p.r){
    const targetD=Math.max(p.d,Number((p.r*0.85).toFixed(2)));
    p.d=Number((targetD*u).toFixed(2));
   }
  }
  return p;
 }
 mountSolid(){const model=grade9SolidModel(this.id,this.params,this.t/6);this.webgl=false;try{
   this.solid=new Solid3DViewer(model,{onParametersChange:next=>{
    if(this._updating3D||!next)return;
    for(const k of ['r','h','d'])if(next[k]!==undefined&&this.params[k]!==undefined)this.params[k]=next[k];
    this.syncControls();this.draw();
   }});this.solid.mount(this.canvas);this.solid.setToolMode('edit');this.solid.setShowHandles(true);this.solid.setViewPreset('iso');this.webgl=true;
  }catch(e){try{this.solid?.dispose?.();}catch{}this.solid=null;this.canvas.replaceChildren(el('p','Không thể tạo WebGL 3D: '+e.message,'mv-g7-fallback'));}
 }
 syncSolid(p=this.params,force=false){if(!this.solid)return;try{const turn=(this.id.endsWith('-C01')||this.id.startsWith('9-11'))?this.t/6:0;const nextParams=grade9SolidModel(this.id,p,turn).params;const sig=JSON.stringify(nextParams);if(!force&&this._lastSolidSig===sig)return;this._lastSolidSig=sig;this._updating3D=true;this.solid.updateParameters(nextParams);this._updating3D=false;}catch(e){this._updating3D=false;this.webgl=false;this.canvas.replaceChildren(el('p',`WebGL lỗi khi cập nhật: ${e.message}`,'mv-g7-fallback'));try{this.solid.dispose();}catch{}this.solid=null;}}
 syncControls(){for(const [key,entry] of this.fields){entry.input.value=this.params[key];entry.output.textContent=fmt(this.params[key]);}}
 setPlaying(state){if(this.destroyed)return;if(!state)cancelLabAutoplay(this);this.playing=!!state;if(this.playing&&this.t>=(this.id.startsWith('9-13')?8:6))this.t=0;if(this.play)this.play.textContent=this.playing?'⏸ Tạm dừng':'▶ Phát chuyển động';if(this.solid)this.solid.autoRotate=false;this.prev=0;if(this.playing&&!this.raf)this.raf=requestAnimationFrame(now=>this.step(now));}
 step(now){this.raf=0;if(!this.playing||this.destroyed)return;const delta=this.prev?Math.min(.08,(now-this.prev)/1000):.016;this.prev=now;const period=this.id.startsWith('9-13')?8:6;const prevCycle=Math.floor(this.t/4);this.t=Math.min(period,this.t+delta);const curCycle=Math.floor(this.t/4);if(this.id.startsWith('9-13')&&curCycle!==prevCycle)this.trials=Math.min(1200,this.trials+(this.id==='9-13-C03'?5:1));this.draw();if(this.t>=period){this.setPlaying(false);return;}this.raf=requestAnimationFrame(n=>this.step(n));}
 bindPointer(host=this.viewport){
  if(!host)return;
  bindFrameWheelZoom(this.stageState,host,(t,ev,fn)=>this.listen(t,ev,fn));
  this.listen(host,'pointerdown',e=>{
   const directPt=e.target?.getAttribute?.('data-point')||e.target?.closest?.('[data-point]')?.getAttribute?.('data-point');
   if((directPt===null||directPt===undefined)&&tryStartLabelOrPointDrag(this.stageState,host,e))return;
   let pt=directPt;
   if(pt===null||pt===undefined){
    const svg=host.querySelector('svg'),pts=svg?[...svg.querySelectorAll('[data-point]')]:[];
    if(pts.length===1)pt=pts[0].getAttribute('data-point');
    else if(pts.length>1){
     let best=null,minD=1e9;
     for(const el of pts){const b=el.getBoundingClientRect(),d=Math.hypot(e.clientX-(b.left+b.width/2),e.clientY-(b.top+b.height/2));if(d<minD){minD=d;best=el;}}
     if(best&&minD<90)pt=best.getAttribute('data-point');
    }
    if(pt===null||pt===undefined)pt='__canvas__';
   }
   this.drag=pt;this.dragStart={x:e.clientX,y:e.clientY,params:{...this.params}};
   try{host.setPointerCapture(e.pointerId);}catch{}e.preventDefault();});
  this.listen(host,'pointermove',e=>{
   if(handleLabelOrPointMove(this.stageState,host,e))return;
   if(!this.drag)return;const svg=host.querySelector('svg'),rc=svg?.getBoundingClientRect();if(!rc?.width||!rc?.height)return;const x=960*(e.clientX-rc.left)/rc.width,y=500*(e.clientY-rc.top)/rc.height;
   const before=JSON.stringify(this.params);
   if(this.id.startsWith('9-12')&&this.drag.startsWith('P')){const i=Number(this.drag.slice(1)),value=Math.max(0,Math.min(20,Math.round((410-y)/11.4)));if(i>=0&&i<=3)this.params['n'+(i+1)]=value;}
   else if((this.id.startsWith('9-05')||this.id.startsWith('9-07'))&&this.fields.has('theta')){
    const deg=Math.round(Math.atan2(265-y,x-480)*180/Math.PI);
    const entry=this.fields.get('theta');
    const min=entry?Number(entry.input.min):20,max=entry?Number(entry.input.max):160;
    this.params.theta=Math.max(min,Math.min(max,Math.abs(deg)*2||60));
   }
   if(JSON.stringify(this.params)===before&&this.dragStart&&this.fields.size){
    const keys=[...this.fields.keys()],dx=(e.clientX-this.dragStart.x)/rc.width,dy=(this.dragStart.y-e.clientY)/rc.height;
    const apply=(k,delta)=>{const f=this.fields.get(k);if(!f?.input)return;const min=Number(f.input.min),max=Number(f.input.max),step=Number(f.input.step)||.1;const raw=this.dragStart.params[k]+delta*(max-min);const val=Math.min(max,Math.max(min,Math.round(raw/step)*step));const next={...this.params,[k]:val};if(grade9Valid(this.id,next))this.params[k]=val;};
    if(keys[0])apply(keys[0],dx);if(keys[1])apply(keys[1],dy);
   }
   this.syncControls();this.draw();});
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])this.listen(host,ev,e=>{stopLabelOrPointDrag(this.stageState,host,e);this.drag=null;this.dragStart=null;});
 }
 draw(){if(this.destroyed)return;let error=null;try{
  if(!grade9Valid(this.id,this.params))throw Error('Tham số không hợp lệ hoặc làm hình suy biến.');
  const activeP=this._animatedParams();
  const results=grade9Math(this.id,activeP);
  if(grade9Solid(this.id)){
   if(!this._updating3D)this.syncSolid(activeP);
   if(this.solid)this.spatialFrame=applySpatialMotion(this.solid,{
    id:this.id,type:this.solid.model.type,seconds:this.t,duration:6,netLesson:this.spatialMode==='fold',deep:true
   });
   if(this.net){
    const ratio=(this.spatialFrame?.kind==='fold')?this.spatialFrame.unfold:this.t/6;
    this.net.innerHTML=grade9NetSVG(this.id,activeP,ratio);decorateInteractiveSVG(this.net,this.stageState);
   }
   updateSpatialLessonGuide(this.spatialGuide,this.id,this.solid?.model?.type,this.t,6,this.spatialFrame?.phase);
  }
  else{this.viewport.innerHTML=grade9SceneSVG(this.id,this.params,this.t,{tries:this.trials,seed:this.seed});decorateInteractiveSVG(this.viewport,this.stageState);}
  if(this.metrics){
   this.metrics.replaceChildren();
   const mHead=el('div',formatMathText(`${this.id} • ${this.mode?.name||this.mode?.title||'Mô hình Toán 9'}`),'mv-r5-value');
   mHead.style.fontWeight='800';mHead.style.color='#0c7da0';
   this.metrics.append(mHead);
   for(const value of results.values){const d=el('div',formatMathText(value),'mv-r5-value');this.metrics.append(d);}
  }
  if(this.latex)mountRenderedFormula(this.latex,results.latex);
  if(this.status){
   const plan=getGuidedDiscoveryPlan(this.id,this.mode);
   const base=grade9Solid(this.id)?this.webgl?'✓ Khối 3D Three.js & Mặt cắt 2D hoạt động đồng bộ · Kéo chuột trên hình 3D để xoay':'⚠ WebGL chưa hoạt động; xem sơ đồ 2D bên cạnh':'✓ SVG hình học động theo tham số và thời gian';
   this.status.textContent=`${base}${this.spatialFrame?.phase?' · Đang minh họa: '+this.spatialFrame.phase:''} · Kết luận: ${plan.takeaway}`;
  }
  }catch(e){error=e;if(!grade9Solid(this.id))this.viewport.replaceChildren(el('p',e.message,'mv-g7-fallback'));if(this.status)this.status.textContent='⚠ '+e.message;}
  this.error=error?.message||null;if(this.timeline)this.timeline.value=this.t;
 }
 destroy(){cancelLabAutoplay(this);this.setPlaying(false);this.destroyed=true;if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;for(const [el,type,cb] of this.events)el.removeEventListener(type,cb);this.events=[];try{this.solid?.dispose?.();}catch{}this.solid=null;}
}
