import {Solid3DViewer} from '../viewers/Solid3DViewer.js';
import {grade7Schema,grade7Defaults,grade7Metrics,grade7Solid,isGrade7Mode,grade7SolidProperties,grade7Frequency} from './grade7-engine.mjs';
import {grade7SVGScene,grade7NetSVG} from './grade7-svg.mjs';
import {mountRenderedFormula} from './math-formula-renderer.mjs';
import {getGuidedDiscoveryPlan} from './guided-discovery.mjs';
import {createStageInteractivity,decorateInteractiveSVG,tryStartLabelOrPointDrag,handleLabelOrPointMove,stopLabelOrPointDrag,bindFrameWheelZoom,resetStageInteractivity} from './svg-stage-interactivity.mjs';
import {scheduleLabAutoplay,cancelLabAutoplay,isAutoPlayEnabled,setAutoPlayEnabled} from './lab-autoplay.mjs';
import {applySpatialMotion,spatialMotionFrame,mountSpatialLessonGuide,updateSpatialLessonGuide} from './spatial-educational-motion.mjs';
const el=(name,content='',cls='')=>{const e=document.createElement(name);if(cls)e.className=cls;e.textContent=content;return e;};
const round=v=>Number.isFinite(v)?Number(v).toLocaleString('vi-VN',{maximumFractionDigits:3}):'—';
const $=(tag,cls='',text='')=>el(tag,text,cls);
const method=(label,fn)=>{const b=$('button','mv-g7-button',label);b.type='button';b.addEventListener('click',fn);return b;};
const G7_FORMULAS={
 '7-01':'\\sqrt{n}\\ge 0',
 '7-02':'\\angle 1+\\angle 2=180^\\circ',
 '7-03':'\\widehat A+\\widehat B+\\widehat C=180^\\circ',
 '7-05':'AG=\\frac{2}{3}AM,\\quad OA=OB=OC',
 '7-06':'\\theta_i=360^\\circ\\frac{n_i}{N}',
 '7-07':'\\Delta y=y_{i+1}-y_i',
 '7-08':'V=abh,\\quad S_{xq}=2(a+b)h',
 '7-09':'V=S_{\\text{đáy}}h,\\quad S_{xq}=C_{\\text{đáy}}h',
 '7-10':'P(A)=\\frac{n(A)}{n(\\Omega)}\\quad\\text{(đồng khả năng)}'
};
/** One isolated, fully functional laboratory per SGK case. */
export class Grade7Lab {
 constructor(){this.destroyed=false;this.playing=false;this.t=0;this.raf=0;this.lastTime=0;this.lastDraw=0;this.sampleCount=0;this.seed=2026;this.events=[];this.solid=null;this.drag=null;this.hiddenPie=new Set();this.stageState=createStageInteractivity();this._updating3D=false;}
 listen(target,name,fn,opts){target.addEventListener(name,fn,opts);this.events.push([target,name,fn,opts]);}
 mount(container,modeId,mode){
  if(!isGrade7Mode(modeId))throw Error('Chế độ không có trong SGK Toán 7');
  this.id=modeId;this.mode=mode;this.container=container;this.params=grade7Defaults(modeId);this.stageState=createStageInteractivity();container.replaceChildren();
  container.classList.add('mv-g7-host');
  container.append($('p','mv-r5-statement',mode.student_interaction||''));
  const view=$('div','mv-g7-viewport');this.viewport=view;
  const hasNet=grade7Solid(modeId);
  this.unfold=(modeId==='7-08-C03'||modeId==='7-09-C03');this.spatialMode='lesson';
  if(grade7Solid(modeId)){
   if(hasNet){
    const dualGrid=$('div','mv-g7-dual-grid');
    const leftCol=$('div','mv-g7-dual-col');
    leftCol.append($('div','mv-g7-dual-badge','🧊 Khối Lăng Trụ / Hình Hộp 3D (Kéo chuột để xoay 360°)'),view);
    const rightCol=$('div','mv-g7-dual-col');
    const net=$('div','mv-g7-net');this.net=net;
    const badge2D=modeId==='7-08-C03'||modeId==='7-09-C03'
     ?'📐 Bản Khai Triển Phẳng 2D (Hai đáy & các mặt bên)'
     :modeId==='7-08-C01'?'📐 Hình Chiếu 3 Mặt & Đường Chéo Không Gian 2D'
     :modeId==='7-08-C02'?'📐 Mặt Vuông & Thiết Diện Chéo Lập Phương 2D'
     :modeId==='7-08-C04'?'📐 Sơ Đồ Tích Lũy Thể Tích V = a·b·h & Diện Tích 2D'
     :modeId==='7-09-C01'?'📐 Hai Đáy Tam Giác Song Song & Cạnh Bên Vuông Góc 2D'
     :modeId==='7-09-C02'?'📐 Phân Rã Đáy Tứ Giác & Diện Tích Đáy 2D'
     :'📐 Thiết Diện Song Song Đáy & Thể Tích V = S_đáy·h 2D';
    rightCol.append($('div','mv-g7-dual-badge',badge2D),net);
    dualGrid.append(leftCol,rightCol);
    container.append(dualGrid);
    this.mount3D(view);
   }else{
    container.append(view);this.mount3D(view);
   }
  }else{view.classList.add('mv-g7-svg-stage');container.append(view);this.draw2D();}
  this.status=$('div','mv-g7-status');container.append(this.status);
  this.metrics=$('div','mv-r5-values');container.append(this.metrics);
  if(grade7Solid(modeId))this.spatialGuide=mountSpatialLessonGuide(container,modeId,this.solid?.model?.type);
  const btns=$('div','mv-g7-buttons');container.append(btns);
  const maxTime=modeId.startsWith('7-10')?8:6;
  this.playButton=method('▶ Phát chuyển động',()=>this.setPlaying(!this.playing));btns.append(this.playButton);
  btns.append(method('⏮ Bước trước',()=>{this.setPlaying(false);this.t=Math.max(0,this.t-1);this.draw();}));
  btns.append(method('⏭ Tiếp bước',()=>{this.setPlaying(false);this.t=Math.min(maxTime,this.t+1);this.draw();}));
  for(const [lbl,pct] of [['0%',0],['50%',0.5],['100%',1]]){
   btns.append(method(lbl,()=>{this.setPlaying(false);this.t=maxTime*pct;this.draw();}));
  }
  btns.append(method('↺ Đặt lại',()=>{this.setPlaying(false);this.params=grade7Defaults(this.id);this.sampleCount=0;this.seed=2026;this.t=0;this.hiddenPie.clear();resetStageInteractivity(this.stageState);if(this.solid?.labelOffsets3D){this.solid.labelOffsets3D.clear();this.solid._rebuildShape();}this.refreshControls();this.sync3D();this.draw();}));
  const autoBtn=method(isAutoPlayEnabled(this)?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt',()=>{const next=setAutoPlayEnabled(this,!isAutoPlayEnabled(this));autoBtn.textContent=next?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt';});
  btns.append(autoBtn);
  if(modeId.startsWith('7-10')){
   btns.append(method('🎲 Thử 1 lần',()=>this.addSamples(1)));
   btns.append(method('🎲 Thử 10 lần',()=>this.addSamples(10)));
   btns.append(method('🎲 Thử 100 lần',()=>this.addSamples(100)));
  }
  if(modeId==='7-06-C02')for(const group of ['A','B','C'])btns.append(method(`◉ Ẩn/hiện nhóm ${group}`,()=>{const i='ABC'.indexOf(group);if(this.hiddenPie.has(i))this.hiddenPie.delete(i);else this.hiddenPie.add(i);this.draw();}));
  if(modeId==='7-03-C05')btns.append(method('△ Chuyển thành tam giác đều',()=>{this.params.v=Math.min(6,Math.max(1.5,Math.round(this.params.a*Math.sqrt(3)*5)/10));this.refreshControls();this.draw();}));
  if(grade7Solid(modeId)){
   btns.append(method('◫ Hình đặc / khung dây',()=>{if(!this.solid)return;this.wire=!this.wire;this.solid.setDisplayMode(this.wire?'wireframe':'solid');}));
   btns.append(method('↻ Góc nhìn chuẩn',()=>this.solid?.setViewPreset('iso')));
   btns.append(method('◉ Góc nhìn trên',()=>this.solid?.setViewPreset('top')));
   if(hasNet)btns.append(method('◇ Mở / gấp khối 3D',()=>{
    this.setPlaying(false);this.spatialMode=this.spatialMode==='fold'?'lesson':'fold';this.t=0;this.draw();this.setPlaying(true);
   }));
  }
  const track=$('label','mv-g7-timeline'),slider=$('input');slider.type='range';slider.min=0;slider.max=maxTime;slider.step=.02;slider.value='0';slider.setAttribute('aria-label','Tua thời gian chuyển động');this.timeline=slider;
  this.listen(slider,'input',()=>{this.setPlaying(false);this.t=Number(slider.value);this.draw();});
  track.append($('span','', 'Thời gian (giây)'),slider);container.append(track);
  const controls=$('section','mv-r5-params');this.controls=new Map();
  for(const def of grade7Schema(modeId)){
   const label=$('label','mv-r5-param'),output=$('output','',round(this.params[def.key])),input=$('input');
   input.type='range';input.min=def.min;input.max=def.max;input.step=def.step;input.value=this.params[def.key];input.setAttribute('aria-label',def.label);
   label.append($('span','mv-r5-param-label',def.label),output,input);controls.append(label);this.controls.set(def.key,{output,input,def});
   this.listen(input,'input',()=>{let value=Number(input.value);if(modeId.startsWith('7-06')){
    const other=def.key==='p1'?'p2':'p1';value=Math.min(value,95-this.params[other]);input.value=value;
   }
   if(modeId==='7-10-C02'&&def.key==='fav')value=Math.min(value,this.params.faces);
   this.params[def.key]=value;
   if(modeId==='7-10-C02'&&def.key==='faces')this.params.fav=Math.min(this.params.fav,value);
   this.refreshControls();this.sync3D();this.draw();});
  }
  if(modeId==='7-10-C01'){
   const wrap=$('label','mv-r5-param'),cap=$('span','mv-r5-param-label','Phạm vi bài học SGK (V4)'),sel=document.createElement('select');
   for(const [k,lbl] of [[29,'Bài 29: Làm quen với biến cố & tập kết quả có thể'],[30,'Bài 30: Xác suất đồng khả năng P(Sấp) = P(Ngửa) = 1/2']]){
    const opt=document.createElement('option');opt.value=String(k);opt.textContent=lbl;sel.append(opt);
   }
   sel.value=String(this.params.lessonScope||29);sel.setAttribute('aria-label','Chọn phạm vi Bài 29 hoặc Bài 30');
   this.listen(sel,'change',()=>{this.params.lessonScope=Number(sel.value);this.draw();});
   wrap.append(cap,sel);controls.append(wrap);
  }
  if(this.controls.size||modeId==='7-10-C01')container.append(controls);
  const formula=modeId==='7-05-C05'?'PA=PB=R=AB,\\quad MA=MB=\\frac{AB}{2},\\quad PQ\\perp AB':(G7_FORMULAS[modeId.slice(0,4)]||'');
  const copy=method('📋 Sao chép LaTeX',async()=>{try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(formula);copy.textContent='✓ Đã sao chép LaTeX';}catch{copy.textContent='Cô hãy bôi đen mã bên dưới để sao chép';}});
  const latexEl=$('div','mv-r5-latex');mountRenderedFormula(latexEl,formula);
  container.append(copy,latexEl);
  container.append($('p','mv-r5-hint',grade7Solid(modeId)?'Hình trưng bày 3D thực, dùng chuột xoay/góc nhìn; thay tham số để dựng lại khối. Bản khai triển là hình 2D chính xác.':'Kéo tay nắm trên hình (nếu có), dùng các thanh trượt hoặc nút Phát để kiểm chứng trường hợp Toán học.'));
  if(!grade7Solid(modeId))this.bindDrag(this.viewport);
  else if(this.net)this.bindDrag(this.net);
  this.t=0;this.draw();scheduleLabAutoplay(this,{delay:90,reset:false});
 }
 mount3D(view){
  view.classList.add('mv-g7-3d-stage');
  const p=this.params;
  let type='cuboid',args={a:p.a,b:p.b??2,h:p.h??4};
  if(this.id==='7-08-C02'){type='cube';args={a:p.a};}
  else if(this.id.startsWith('7-09')){
   if(this.id==='7-09-C01'||this.id==='7-09-C03'){type='triPrism';args={a:p.a,h:p.h};}
   else{type='prismQuad';args={a:p.a,b:p.b,h_base:p.h_base,h:p.h};}
  }
  this.solidModel={id:`g7_live_${this.id}`,grade:7,type,params:args,title:this.mode.name};
  try{
   this.solid=new Solid3DViewer(this.solidModel,{onParametersChange:next=>{
    if(this._updating3D||!next)return;
    for(const k of Object.keys(next))if(this.params[k]!==undefined)this.params[k]=next[k];
    this.refreshControls();this.draw();
   }});
   this.solid.mount(view);this.solid.setToolMode('edit');this.solid.setShowHandles(true);this.solid.setViewPreset('iso');
   this.webgl=true;
  }catch(err){
   try{this.solid?.dispose?.();}catch{}this.solid=null;this.webgl=false;view.replaceChildren($('p','mv-g7-fallback',`Không thể khởi tạo WebGL 3D: ${err.message}. Vui lòng mở ứng dụng trong Chrome/Edge có WebGL.`));
  }
 }
 sync3D(){if(!this.solid)return;const o=this.solidModel.params;for(const k of Object.keys(o))if(this.params[k]!==undefined)o[k]=this.params[k];this._updating3D=true;this.solid.updateParameters(o);this._updating3D=false;}
 bindDrag(host=this.viewport){
  if(!host)return;
  bindFrameWheelZoom(this.stageState,host,(t,ev,fn,opts)=>this.listen(t,ev,fn,opts));
  this.listen(host,'pointerdown',e=>{
   const directPt=e.target?.getAttribute?.('data-pt')||e.target?.closest?.('[data-pt]')?.getAttribute?.('data-pt');
   if(!directPt&&tryStartLabelOrPointDrag(this.stageState,host,e))return;
   let h=directPt;
   if(!h){
    const svg=host.querySelector('svg'),pts=svg?[...svg.querySelectorAll('[data-pt]')]:[];
    if(pts.length===1)h=pts[0].getAttribute('data-pt');
    else if(pts.length>1){
     let best=null,minD=1e9;
     for(const el of pts){const b=el.getBoundingClientRect(),d=Math.hypot(e.clientX-(b.left+b.width/2),e.clientY-(b.top+b.height/2));if(d<minD){minD=d;best=el;}}
     if(best&&minD<90)h=best.getAttribute('data-pt');
    }
    if(!h)h='__canvas__';
   }
   this.drag=h;this.dragStart={x:e.clientX,y:e.clientY,params:{...this.params}};
   try{host.setPointerCapture(e.pointerId);}catch{}e.preventDefault();
  });
  this.listen(host,'pointermove',e=>{
   if(handleLabelOrPointMove(this.stageState,host,e))return;
   if(!this.drag)return;const svg=host.querySelector('svg');if(!svg)return;const rect=svg.getBoundingClientRect();if(!rect.width||!rect.height)return;
   const sx=900*(e.clientX-rect.left)/rect.width,sy=470*(e.clientY-rect.top)/rect.height;
   const u=(sx-185)/55,v=(365-sy)/55,fam=this.id.slice(0,4);
   const before=JSON.stringify(this.params);
   if(fam==='7-01'&&this.drag.startsWith('M'))this.params.x=Math.max(-4,Math.min(4,Math.round(((sx-455)/62)*10)/10));
   else if(fam==='7-02'){
    if(this.drag==='shift'&&'shift' in this.params){
     this.params.shift=Math.max(-20,Math.min(20,Math.round((125-sy)/3.2)));
    }else{
     const cx=300,cy=(this.id==='7-02-C01'||this.id==='7-02-C02')?290:318;
     const ang=Math.round(Math.atan2(cy-sy,sx-cx)*180/Math.PI);
     const deg=Math.max(25,Math.min(155,ang>0?ang:ang+180));
     if('theta' in this.params)this.params.theta=deg;
     if('angle' in this.params)this.params.angle=deg;
    }
   }
   else if(fam==='7-06'&&(this.drag==='pieA'||this.drag==='pieB')){
    const a=(((Math.atan2(sy-245,sx-295)*180/Math.PI)+90)%360+360)%360;
    const percentage=Math.round(a/3.6);
    if(this.drag==='pieA')this.params.p1=Math.max(5,Math.min(70,95-this.params.p2,percentage));
    else this.params.p2=Math.max(5,Math.min(70,95-this.params.p1,percentage-this.params.p1));
   }
   else if(fam==='7-07'&&this.drag.startsWith('P')){
    const i=Number(this.drag.slice(1));if(i>=0&&i<4)this.params['y'+(i+1)]=Math.min(20,Math.max(0,Math.round((395-sy)/15)));
   }else if((fam==='7-03'||fam==='7-05')&&this.drag==='C'){
    if('u' in this.params)this.params.u=Math.round(Math.min(5.3,Math.max(.7,u))*10)/10;
    if('v' in this.params)this.params.v=Math.round(Math.min(fam==='7-03'?6:5.8,Math.max(fam==='7-03'?1.5:1.6,v))*10)/10;
   }else if((fam==='7-03'||fam==='7-05')&&this.drag==='B'&&this.params.a){const rawA=this.id==='7-05-C05'?Math.abs(sx-268)*2/21.5:u;this.params.a=Math.round(Math.min(8,Math.max(3,rawA))*10)/10;}
   if(JSON.stringify(this.params)===before&&this.dragStart&&this.controls.size){
    const keys=[...this.controls.keys()],dx=(e.clientX-this.dragStart.x)/rect.width,dy=(this.dragStart.y-e.clientY)/rect.height;
    const apply=(k,delta)=>{const c=this.controls.get(k);if(!c)return;const min=Number(c.def.min),max=Number(c.def.max),step=Number(c.def.step)||.1;const raw=this.dragStart.params[k]+delta*(max-min);this.params[k]=Math.min(max,Math.max(min,Math.round(raw/step)*step));};
    if(keys[0])apply(keys[0],dx);if(keys[1])apply(keys[1],dy);
   }
   this.refreshControls();this.draw();
  });
  const stop=e=>{stopLabelOrPointDrag(this.stageState,host,e);this.drag=null;this.dragStart=null;};for(const name of ['pointerup','pointercancel','lostpointercapture'])this.listen(host,name,stop);
 }
 refreshControls(){for(const [key,obj] of this.controls){obj.input.value=this.params[key];obj.output.textContent=round(this.params[key]);}}
 addSamples(n){this.sampleCount+=n;this.setPlaying(false);this.draw();}
 setPlaying(value){if(this.destroyed)return;if(!value)cancelLabAutoplay(this);this.playing=!!value;if(this.playing&&this.t>=(this.id.startsWith('7-10')?8:6))this.t=0;this.playButton.textContent=this.playing?'⏸ Tạm dừng':'▶ Phát chuyển động';if(this.solid)this.solid.autoRotate=false;this.lastTime=0;
  if(this.playing&&this.id.startsWith('7-10')&&this.sampleCount===0)this.sampleCount=1;
  if(this.playing&&!this.raf)this.raf=requestAnimationFrame(time=>this.tick(time));}
 tick(now){this.raf=0;if(!this.playing||this.destroyed)return;const delta=this.lastTime?Math.min(.08,(now-this.lastTime)/1000):.016;this.lastTime=now;
  const period=this.id.startsWith('7-10')?8:6;
  const prevCycle=Math.floor(this.t/4);
  this.t=Math.min(period,this.t+delta);
  const curCycle=Math.floor(this.t/4);
  if(this.id.startsWith('7-10')&&curCycle!==prevCycle)this.sampleCount++;
  if(!this.lastDraw||now-this.lastDraw>55||this.t>=period){this.lastDraw=now;this.draw();}
  if(this.t>=period){this.setPlaying(false);return;}this.raf=requestAnimationFrame(time=>this.tick(time));
 }
 draw2D(){try{this.viewport.innerHTML=grade7SVGScene(this.id,this.params,this.t,{count:this.sampleCount,seed:this.seed,hiddenPie:[...this.hiddenPie]});decorateInteractiveSVG(this.viewport,this.stageState);this.error=null;}
 catch(err){this.error=err.message;this.viewport.replaceChildren($('p','mv-g7-fallback',`Tham số chưa hợp lệ: ${err.message}`));}}
 draw(){if(this.destroyed)return;
  if(!grade7Solid(this.id))this.draw2D();
  else{
   const period=this.id.startsWith('7-10')?8:6;
   const prog=Math.min(1,Math.max(0,this.t/period));
   const isNetLesson=this.spatialMode==='fold'||this.id==='7-08-C03'||this.id==='7-09-C03';
   if(this.net){
    const frame=spatialMotionFrame({id:this.id,type:this.solid?.model?.type||'',seconds:this.t,
      duration:period,supportsUnfold:!!this.solid?.meshGroup?.supportsUnfold,
      supportsCrossSection:!!this.solid?.meshGroup?.supportsCrossSection,netLesson:isNetLesson,deep:true});
    const netProgress=(frame.kind==='fold')?frame.unfold:0.18+0.82*prog;
    this.net.innerHTML=grade7NetSVG(this.id,this.params,netProgress);
    decorateInteractiveSVG(this.net,this.stageState);
   }
   if(this.solid){
    this.spatialFrame=applySpatialMotion(this.solid,{id:this.id,type:this.solid.model.type,
     seconds:this.t,duration:period,netLesson:isNetLesson,deep:true});
   }
  }
  if(this.spatialGuide)updateSpatialLessonGuide(this.spatialGuide,this.id,this.solid?.model?.type,this.t,6,this.spatialFrame?.phase);
  if(this.timeline)this.timeline.value=this.t;
  if(this.metrics){this.metrics.replaceChildren();for(const line of grade7Metrics(this.id,this.params,{count:this.sampleCount,seed:this.seed})){
   const c=$('div','mv-r5-value');c.append($('strong','',line));this.metrics.append(c);
  }}
  if(this.status){
   const plan=getGuidedDiscoveryPlan(this.id,this.mode);
   const base=this.error?`⚠ ${this.error}`:grade7Solid(this.id)?this.webgl?'✓ Khối 3D dựng bằng WebGL, thao tác xoay được':'⚠ Chưa có WebGL trên máy này':'✓ Hình SVG 2D chính xác, có điều khiển và hoạt cảnh';
   this.status.textContent=this.error?base:`${base}${this.spatialFrame?.phase?' · Đang minh họa: '+this.spatialFrame.phase:''} · Kết luận: ${plan.takeaway}`;
  }
 }
 destroy(){cancelLabAutoplay(this);this.destroyed=true;this.playing=false;cancelAnimationFrame(this.raf);this.raf=0;for(const [target,name,handler,opts] of this.events)target.removeEventListener(name,handler,opts);this.events=[];try{this.solid?.dispose?.();}catch{}this.solid=null;}
}
