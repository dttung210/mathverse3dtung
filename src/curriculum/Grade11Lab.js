import {Solid3DViewer} from '../viewers/Solid3DViewer.js';
import {grade11Defaults,grade11Schema,grade11Valid,grade11Math,grade11Is3D,grade11SolidModel,grade11AnimatedParams} from './grade11-engine.mjs';
import {grade11SceneSVG,grade11SpatialSVG} from './grade11-svg.mjs';
import {mountRenderedFormula,formatMathText} from './math-formula-renderer.mjs';
import {getGuidedDiscoveryPlan} from './guided-discovery.mjs';
import {createStageInteractivity,decorateInteractiveSVG,tryStartLabelOrPointDrag,handleLabelOrPointMove,stopLabelOrPointDrag,bindFrameWheelZoom,resetStageInteractivity} from './svg-stage-interactivity.mjs';
import {scheduleLabAutoplay,cancelLabAutoplay,isAutoPlayEnabled,setAutoPlayEnabled} from './lab-autoplay.mjs';
import {applySpatialMotion,mountSpatialLessonGuide,updateSpatialLessonGuide} from './spatial-educational-motion.mjs';
const node=(tag,text='',cls='')=>{const x=document.createElement(tag);x.textContent=text;if(cls)x.className=cls;return x;};
const btn=(title,fn)=>{const b=node('button',title,'mv-g7-button');b.type='button';b.addEventListener('click',fn);return b;};
const fmt=x=>Number.isFinite(x)?Number(x.toFixed(3)).toLocaleString('vi-VN'):'—';
/** Isolated lifecycle: avoids WebGL context leaks on changing modes. */
export class Grade11Lab{
 constructor(){this.listeners=[];this.playing=false;this.t=0;this.raf=0;this.previous=0;this.solid=null;this.drag=null;this.destroyed=false;this.webgl=false;this.seed=20261027;this.trials=0;this.last3d=-1;this.stageState=createStageInteractivity();this._updatingSolid=false;this._syncingFromSolid=false;}
 listen(target,event,fn){target.addEventListener(event,fn);this.listeners.push([target,event,fn]);}
 mount(host,id,mode){if(this.host)this.destroy();this.destroyed=false;this.host=host;this.id=id;this.mode=mode;this.params=grade11Defaults(id);this.isSolid=grade11Is3D(id);this.trials=this.params.trials||120;this.stageState=createStageInteractivity();
  try{const stored=JSON.parse(localStorage.getItem('mathverse:g11:lab:'+id)||'null');if(stored&&grade11Valid(id,stored))this.params=stored;}catch{}
  host.replaceChildren();host.classList.add('mv-g7-host');host.append(node('p',mode?.student_interaction||'Khám phá trực quan Toán 11','mv-r5-statement'));
  this.viewport=node('div','','mv-g7-viewport');
  if(this.isSolid){
   const dualGrid=node('div','','mv-g7-dual-grid');
   const leftCol=node('div','','mv-g7-dual-col');
   this.canvas=node('div','','mv-g7-3d-stage');this.canvas.style.height='100%';this.viewport.append(this.canvas);
   leftCol.append(node('div','🧊 Không gian 3D Tương tác (Kéo điểm 3D / nhãn / xoay 360°)','mv-g7-dual-badge'),this.viewport);
   const rightCol=node('div','','mv-g7-dual-col');
   this.schematic=node('div','','mv-g7-net');this.schematic.style.touchAction='none';
   rightCol.append(node('div','📐 Sơ đồ Quan hệ & Thiết diện 2D Đồng bộ (Kéo điểm / nhãn)','mv-g7-dual-badge'),this.schematic);
   dualGrid.append(leftCol,rightCol);
   host.append(dualGrid);
   this.mountSolid();
   this.bindPointer(this.schematic);
  }else{this.viewport.classList.add('mv-g7-svg-stage');this.viewport.style.touchAction='none';host.append(this.viewport);this.bindPointer(this.viewport);}
  this.status=node('p','','mv-g7-status');this.status.setAttribute('aria-live','polite');host.append(this.status);
  this.metrics=node('div','','mv-r5-values');host.append(this.metrics);
  const actions=node('div','','mv-g7-buttons');host.append(actions);
  const period=id.startsWith('11-13')?8:6;
  this.play=btn('▶ Phát chuyển động',()=>this.setPlaying(!this.playing));actions.append(this.play);
  actions.append(btn('⏮ Bước trước',()=>{this.setPlaying(false);this.t=Math.max(0,this.t-period/4);this.draw();}));
  actions.append(btn('⏭ Tiếp bước',()=>{this.setPlaying(false);this.t=Math.min(period,this.t+period/4);this.draw();}));
  actions.append(btn('↺ Đặt lại',()=>{this.setPlaying(false);this.params=grade11Defaults(id);this.t=0;this.trials=this.params.trials||120;resetStageInteractivity(this.stageState);if(this.solid?.labelOffsets3D){this.solid.labelOffsets3D.clear();this.solid._rebuildShape();}this.syncControls();this.draw();this.save();}));
  for(const pct of [0,50,100]){actions.append(btn(`${pct}%`,()=>this.setProgress(pct)));}
  const autoBtn=btn(isAutoPlayEnabled(this)?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt',()=>{const next=setAutoPlayEnabled(this,!isAutoPlayEnabled(this));autoBtn.textContent=next?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt';});
  actions.append(autoBtn);
  if(id==='11-13-C03')actions.append(btn('🎲 Thử thêm 100 lần',()=>{this.setPlaying(false);this.trials=Math.min(5000,this.trials+100);this.draw();}));
  if(id.startsWith('11-09')){
   this.spatialMode='lesson';
   actions.append(btn('◇ Gấp / trải khối 3D theo bản lề',()=>{
    if(!this.solid?.meshGroup?.supportsUnfold)return;
    this.setPlaying(false);this.spatialMode=this.spatialMode==='fold'?'lesson':'fold';
    this.t=0;this.draw();this.setPlaying(true);
   }));
  }
  if(this.isSolid){
   actions.append(btn('▦ Đặc / khung dây',()=>{if(this.solid){this.wire=!this.wire;this.solid.setDisplayMode(this.wire?'wireframe':'solid');}}));
   actions.append(btn('🎯 Ẩn/Hiện nút kéo 3D',()=>{if(this.solid){this.solid.setShowHandles(!this.solid.showHandles);}}));
   actions.append(btn('↻ Góc nhìn chuẩn',()=>this.solid?.setViewPreset('iso')));
  }
  this.timeline=node('input');this.timeline.type='range';this.timeline.min=0;this.timeline.max=period;this.timeline.step=.05;this.timeline.value=0;
  const timelineLabel=node('label','Thanh tiến trình chuyển động','mv-g7-timeline');timelineLabel.append(this.timeline);host.append(timelineLabel);
  this.listen(this.timeline,'input',()=>{this.setPlaying(false);this.t=Number(this.timeline.value);this.draw();});
  this.fields=new Map();const grid=node('div','','mv-r5-params');for(const cfg of grade11Schema(id)){
   const lab=node('label','','mv-r5-param'),name=node('span',formatMathText(cfg.label),'mv-r5-param-label'),out=node('output',fmt(this.params[cfg.key])),input=node('input');
   input.type='range';input.min=cfg.min;input.max=cfg.max;input.step=cfg.step;input.value=this.params[cfg.key];
   this.listen(input,'input',()=>{this.params[cfg.key]=Number(input.value);
    if(this.id==='11-09-C03'){this.params.b=Math.min(this.params.b,this.params.a-.25);this.params.a=Math.max(this.params.a,this.params.b+.25);}
    if(this.id==='11-13-C01'){this.params.overlap=Math.max(Math.max(0,this.params.pa+this.params.pb-1),Math.min(this.params.overlap,this.params.pa,this.params.pb));}
    this.syncControls();this.save();this.draw();});lab.append(name,out,input);grid.append(lab);this.fields.set(cfg.key,{input,out});
  }host.append(grid);
  this.latex=node('div','','mv-r5-latex');const cp=btn('📋 Sao chép công thức LaTeX',async()=>{try{await navigator.clipboard.writeText(this.latex.dataset.rawLatex||this.latex.textContent);cp.textContent='✓ Đã sao chép';}catch{cp.textContent='Chọn công thức để sao chép';}});host.append(cp,this.latex);
  host.append(node('p',this.isSolid?'Mô hình dùng mesh Three.js thật: kéo nút 3D để đổi kích thước/góc, kéo nhãn 3D/2D để tránh đè chữ, kéo nền để xoay camera 360°, lăn chuột phóng to.':'Hình học SVG 2D tính từ tham số; có thể kéo điểm điều khiển, kéo mọi chữ/nhãn tránh đè hình, lăn chuột thu phóng khung làm việc.', 'mv-r5-hint'));
  if(this.isSolid)this.spatialGuide=mountSpatialLessonGuide(host,id,this.solid?.model?.type);
  this.t=0;this.draw();scheduleLabAutoplay(this,{delay:90,reset:false});
 }
 setProgress(pct){
  if(this.destroyed)return;
  this.setPlaying(false);
  const period=this.id.startsWith('11-13')?8:6;
  const f=Math.max(0,Math.min(1,Number(pct)/100));
  this.t=Number((f*period).toFixed(3));
  if(this.timeline)this.timeline.value=this.t;
  this.draw();
 }
 _applySolidParams(next){
  if(this._updatingSolid||!next)return;
  const clampKey=(k,v)=>{const f=this.fields?.get(k);if(!f?.input||!Number.isFinite(v))return v;const min=Number(f.input.min),max=Number(f.input.max),step=Number(f.input.step)||.05;return Math.min(max,Math.max(min,Math.round(v/step)*step));};
  const cand={...this.params};
  if(next.angle!==undefined&&cand.deg!==undefined)cand.deg=clampKey('deg',next.angle);
  if(next.deg!==undefined&&cand.deg!==undefined)cand.deg=clampKey('deg',next.deg);
  if(next.dist!==undefined&&cand.dist!==undefined)cand.dist=clampKey('dist',next.dist);
  if(next.gap!==undefined&&cand.dist!==undefined)cand.dist=clampKey('dist',next.gap);
  if(next.h!==undefined&&cand.h!==undefined)cand.h=clampKey('h',next.h);
  if(next.shift!==undefined&&cand.shift!==undefined)cand.shift=clampKey('shift',next.shift);
  if(next.a!==undefined&&cand.a!==undefined)cand.a=clampKey('a',next.a);
  if(next.b!==undefined&&cand.b!==undefined)cand.b=clampKey('b',next.b);
  if(this.id==='11-09-C03'){cand.b=Math.min(cand.b,cand.a-.25);cand.a=Math.max(cand.a,cand.b+.25);}
  if(grade11Valid(this.id,cand)){
   this.params=cand;this.syncControls();this.save();
   this._syncingFromSolid=true;this.draw();this._syncingFromSolid=false;
  }
 }
 mountSolid(){this.webgl=false;try{this.solid=new Solid3DViewer(grade11SolidModel(this.id,this.params),{onParametersChange:next=>this._applySolidParams(next)});this.solid.mount(this.canvas);this.solid.setToolMode('edit');this.solid.setShowHandles(true);this.solid.setViewPreset('iso');this.webgl=true;}
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
   if(this.drag==='angle'){const theta=Math.atan2(252-y,x-668)*180/Math.PI;const old=this.params.angle;this.params.angle=clampKey('angle',theta+360*Math.round((old-theta)/360));}
   else if(this.drag==='angle2'){const theta=Math.atan2(252-y,x-668)*180/Math.PI-this.params.angle;const old=this.params.angle2;this.params.angle2=clampKey('angle2',theta+360*Math.round((old-theta)/360));}
   else if(this.drag==='radius'&&this.params.radius!==undefined){this.params.radius=clampKey('radius',(Math.hypot(x-668,y-252)-94)/11);}
   else if(this.drag==='m'){const val=-3.2+(408-y)/(408-92)*6.4;if(this.params.value!==undefined)this.params.value=clampKey('value',val);if(this.params.target!==undefined)this.params.target=clampKey('target',val);}
   else if(this.drag.startsWith('n')&&this.id.startsWith('11-04')){this.params[this.drag]=Math.max(1,Math.min(20,Math.round((378-y)/11.5)));}
   else if(this.drag==='x0'&&this.params.x0!==undefined){this.params.x0=clampKey('x0',-4+(x-416)/(922-416)*8);}
   else if(this.drag==='jump'&&this.params.jump!==undefined){const yVal=-1+(408-y)/(408-92)*6;this.params.jump=clampKey('jump',yVal-(this.params.x0+1));}
   else if((this.drag==='pa'||this.drag==='pb')&&this.id==='11-13-C03'){this.params[this.drag]=clampKey(this.drag,(356-y)/220);}
   else if(this.drag==='h'&&this.isSolid&&this.params.h!==undefined){this.params.h=clampKey('h',(350-y)/34);}
   else if(this.drag==='dist'&&this.isSolid&&this.params.dist!==undefined){this.params.dist=clampKey('dist',Math.abs(310-y)/32);}
   else if(this.drag==='a'&&this.isSolid&&this.params.a!==undefined){this.params.a=clampKey('a',Math.abs(x-668)/25);}
   else if(this.drag==='b'&&this.isSolid&&this.params.b!==undefined){this.params.b=clampKey('b',Math.min(this.params.a-.25,Math.abs(x-668)/24));}
   else if(this.drag==='shift'&&this.isSolid&&this.params.shift!==undefined){this.params.shift=clampKey('shift',(x-668)/36);}
   else if(this.drag==='deg'&&this.isSolid&&this.params.deg!==undefined){const ang=Math.atan2(310-y,x-640)*180/Math.PI;this.params.deg=clampKey('deg',Math.abs(ang));}
   if(JSON.stringify(this.params)===before&&this.dragStart&&this.fields.size){
    const keys=this.fields.has(this.drag)?[this.drag]:[...this.fields.keys()],dx=(e.clientX-this.dragStart.x)/r.width,dy=(this.dragStart.y-e.clientY)/r.height;
    const apply=(k,delta)=>{const f=this.fields.get(k);if(!f?.input)return;const min=Number(f.input.min),max=Number(f.input.max),step=Number(f.input.step)||.1;const raw=this.dragStart.params[k]+delta*(max-min);const val=Math.min(max,Math.max(min,Math.round(raw/step)*step));const next={...this.params,[k]:val};if(grade11Valid(this.id,next))this.params[k]=val;};
    if(keys.length===1)apply(keys[0],Math.abs(dx)>Math.abs(dy)?dx:dy);
    else{if(keys[0])apply(keys[0],dx);if(keys[1])apply(keys[1],dy);}
   }
   if(this.id==='11-09-C03'){this.params.b=Math.min(this.params.b,this.params.a-.25);this.params.a=Math.max(this.params.a,this.params.b+.25);}
   if(this.id==='11-13-C01'){this.params.overlap=Math.max(Math.max(0,this.params.pa+this.params.pb-1),Math.min(this.params.overlap,this.params.pa,this.params.pb));}
   this.syncControls();this.save();this.draw();e.preventDefault();});
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])this.listen(container,ev,e=>{stopLabelOrPointDrag(this.stageState,container,e);this.drag=null;this.dragStart=null;this.dragContainer=null;});
 }
 save(){try{localStorage.setItem('mathverse:g11:lab:'+this.id,JSON.stringify(this.params));}catch{}}
 syncControls(){for(const [key,f] of this.fields){f.input.value=this.params[key];f.out.textContent=fmt(this.params[key]);}}
 setPlaying(v){if(this.destroyed)return;if(!v)cancelLabAutoplay(this);this.playing=!!v;if(this.playing&&this.t>=(this.id.startsWith('11-13')?8:6))this.t=0;if(this.play)this.play.textContent=v?'⏸ Tạm dừng':'▶ Phát chuyển động';if(this.solid)this.solid.autoRotate=false;this.previous=0;if(this.playing&&!this.raf)this.raf=requestAnimationFrame(now=>this.tick(now));}
 tick(now){this.raf=0;if(!this.playing||this.destroyed)return;const delta=this.previous?Math.min(.08,(now-this.previous)/1000):.016;this.previous=now;const period=this.id.startsWith('11-13')?8:6;this.t=Math.min(period,this.t+delta);
  if(!this.isSolid||now-this.last3d>95||this.t>=period){this.draw();this.last3d=now;}else if(this.timeline)this.timeline.value=this.t;
  if(this.t>=period){this.setPlaying(false);return;}this.raf=requestAnimationFrame(n=>this.tick(n));}
 draw(){if(this.destroyed||!this.viewport)return;try{const actual=this.isSolid&&!this.id.startsWith('11-09')?grade11AnimatedParams(this.id,this.params,this.t):this.params;
   if(!grade11Valid(this.id,actual))throw Error('Điều kiện Toán học chưa được thỏa mãn. Điều chỉnh tham số.');
   const period=this.id.startsWith('11-13')?8:6;
   const effProg=this.t<=0?.1:Math.min(1,Math.max(.1,this.t/period));
   const shownTrials=this.id==='11-13-C03'?Math.max(10,Math.round(this.trials*effProg)):this.trials;const math=grade11Math(this.id,actual,{trials:shownTrials,seed:this.seed});
   const plan=getGuidedDiscoveryPlan(this.id,this.mode);
   if(this.isSolid){const model=grade11SolidModel(this.id,this.params,this.id.startsWith('11-09')?0:this.t);if(this.solid){if(!this._syncingFromSolid){this._updatingSolid=true;this.solid.updateParameters(model.params);this._updatingSolid=false;}
     if(this.id.startsWith('11-09')){
      this.spatialFrame=applySpatialMotion(this.solid,{id:this.id,type:this.solid.model.type,seconds:this.t,duration:6,netLesson:this.spatialMode==='fold',deep:true});
     }
     updateSpatialLessonGuide(this.spatialGuide,this.id,this.solid.model.type,this.t,6,this.spatialFrame?.phase);
     this.webgl=true;}
    else this.webgl=false;if(this.schematic){this.schematic.innerHTML=grade11SpatialSVG(this.id,actual,this.t);decorateInteractiveSVG(this.schematic,this.stageState);}this.status.textContent=this.webgl?`✓ Hình học 3D thật, tham số và số đo được cập nhật · Kết luận: ${plan.takeaway}`:'⚠ WebGL chưa hoạt động; đây không phải hình 3D đã nghiệm thu';
   }else{this.viewport.innerHTML=grade11SceneSVG(this.id,this.params,this.t,{trials:shownTrials,seed:this.seed});decorateInteractiveSVG(this.viewport,this.stageState);this.status.textContent=`✓ SVG 2D: vẽ lại theo thời gian và tham số · Kết luận: ${plan.takeaway}`;}
   this.status.className='mv-g7-status';this.metrics.replaceChildren();
   const modeHeader=node('div',formatMathText(`${this.id} • ${this.mode?.name||this.mode?.title||'Mô hình Toán 11'}`),'mv-r5-value');
   modeHeader.style.fontWeight='800';modeHeader.style.color='#1D4ED8';
   this.metrics.append(modeHeader);
   for(const value of math.values)this.metrics.append(node('div',formatMathText(value),'mv-r5-value'));mountRenderedFormula(this.latex,math.latex);this.error=null;
  }catch(error){this.error=error.message;this.status.textContent='⚠ '+error.message;this.status.className='mv-g7-status invalid';this.metrics.replaceChildren();if(!this.isSolid)this.viewport.replaceChildren(node('p',error.message,'mv-g7-fallback'));}
  if(this.timeline)this.timeline.value=this.t;
 }
 destroy(){cancelLabAutoplay(this);this.setPlaying(false);this.destroyed=true;if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;for(const [target,type,fn] of this.listeners)target.removeEventListener(type,fn);this.listeners=[];try{this.solid?.dispose?.();}catch{}this.solid=null;}
}
