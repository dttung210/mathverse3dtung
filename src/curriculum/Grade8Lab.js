import {Solid3DViewer} from '../viewers/Solid3DViewer.js?v=r107_v15';
import {grade8Defaults,grade8Schema,grade8Metrics,isGrade8Mode,grade8Solid,grade8Valid,GRADE8_FORMULAS,grade8FormulaFor,pyramid8} from './grade8-engine.mjs?v=r107_v15';
import {grade8SVGScene,grade8NetSVG,grade8QuadProjection} from './grade8-svg.mjs?v=r107_v15';
import {mountRenderedFormula,formatMathText} from './math-formula-renderer.mjs?v=r107_v15';
import {getGuidedDiscoveryPlan} from './guided-discovery.mjs?v=r107_v15';
import {createStageInteractivity,decorateInteractiveSVG,tryStartLabelOrPointDrag,handleLabelOrPointMove,stopLabelOrPointDrag,bindFrameWheelZoom,resetStageInteractivity} from './svg-stage-interactivity.mjs?v=r107_v15';
import {scheduleLabAutoplay,cancelLabAutoplay,isAutoPlayEnabled,setAutoPlayEnabled} from './lab-autoplay.mjs?v=r107_v15';
import {applySpatialMotion,spatialMotionFrame,mountSpatialLessonGuide,updateSpatialLessonGuide} from './spatial-educational-motion.mjs?v=r107_v15';
const node=(tag,cls='',content='')=>{const n=document.createElement(tag);n.className=cls;n.textContent=content;return n;};
const button=(label,fn)=>{const b=node('button','mv-g7-button',label);b.type='button';b.addEventListener('click',fn);return b;};
const fmt=n=>Number.isFinite(n)?Number(n).toLocaleString('vi-VN',{maximumFractionDigits:3}):'—';
export class Grade8Lab{
 constructor(){this.events=[];this.raf=0;this.playing=false;this.destroyed=false;this.t=0;this.wire=false;this.solid=null;this.drag=null;this.params={};this.stageState=createStageInteractivity();this._updating3D=false;}
 listen(x,n,f,o){x.addEventListener(n,f,o);this.events.push([x,n,f,o]);}
 mount(host,id,mode){if(!isGrade8Mode(id))throw Error('Chế độ chưa được xây dựng');
  this.host=host;this.id=id;this.mode=mode;this.params=grade8Defaults(id);this.unfold=(id==='8-09-C03');this.spatialMode='lesson';this.stageState=createStageInteractivity();host.replaceChildren();host.classList.add('mv-g7-host','mv-g8-host');
  host.append(node('p','mv-r5-statement',mode.student_interaction||''));
  this.viewport=node('div','mv-g7-viewport');
  if(grade8Solid(id)){
   const dualGrid=node('div','mv-g7-dual-grid');
   const leftCol=node('div','mv-g7-dual-col');
   leftCol.append(node('div','mv-g7-dual-badge','🧊 Khối Chóp Đều 3D Tương Tác (Kéo chuột để xoay 360°)'),this.viewport);
   const rightCol=node('div','mv-g7-dual-col');
   this.net=node('div','mv-g7-net');
   const badge2D=id==='8-09-C03'
    ?'📐 Hình Khai Triển Phẳng 2D (Mở từng mặt bên & mặt đáy)'
    :id==='8-09-C01'?'📐 Trọng Tâm Đáy Tam Giác Đều O & Tam Giác Vuông Đường Cao △SOI 2D'
    :id==='8-09-C02'?'📐 Mặt Cắt Trục Đối Chiếu Đường Cao SO, Trung Đoạn SI & Cạnh Bên SA 2D'
    :'📐 Thiết Diện Đồng Dạng S(z) & Thể Tích Chóp V = ⅓S_đáy·h 2D';
   rightCol.append(node('div','mv-g7-dual-badge',badge2D),this.net);
   dualGrid.append(leftCol,rightCol);
   host.append(dualGrid);
   this.mountSolid();
  }else{this.viewport.classList.add('mv-g7-svg-stage');host.append(this.viewport);}
  if(grade8Solid(id))this.spatialGuide=mountSpatialLessonGuide(host,id,pyramid8(id,this.params).type);
  const buttons=node('div','mv-g7-buttons');host.append(buttons);
  this.playButton=button('▶ Phát chuyển động',()=>this.setPlaying(!this.playing));buttons.append(this.playButton);
  const period=id.startsWith('8-08')?8:6;
  buttons.append(button('⏮ Bước trước',()=>{this.setPlaying(false);this.t=Math.max(0,this.t-period/4);this.draw();}));
  buttons.append(button('⏭ Từng bước',()=>{this.setPlaying(false);this.t=Math.min(period,this.t+period/4);this.draw();}));
  for(const [lbl,pct] of [['0%',0],['50%',0.5],['100%',1]]){
   buttons.append(button(lbl,()=>{this.setPlaying(false);this.t=period*pct;this.draw();}));
  }
  buttons.append(button('↺ Đặt lại',()=>{this.setPlaying(false);this.t=0;this.params=grade8Defaults(id);resetStageInteractivity(this.stageState);if(this.solid?.labelOffsets3D){this.solid.labelOffsets3D.clear();this.solid._rebuildShape();}this.refresh();this.syncSolid();this.draw();}));
  const autoBtn=button(isAutoPlayEnabled(this)?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt',()=>{const next=setAutoPlayEnabled(this,!isAutoPlayEnabled(this));autoBtn.textContent=next?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt';});
  buttons.append(autoBtn);
  if(id==='8-03-C02')buttons.append(button('✓ Đặt hai tỉ số bằng nhau',()=>{this.params.v=this.params.u;this.refresh();this.draw();}));
  if(id==='8-05-C02')buttons.append(button('⚠ Thử sai định lí đảo',()=>{this.params.c=Math.min(9,Number((this.params.c+.6).toFixed(1)));this.refresh();this.draw();}));
  if(grade8Solid(id)){
   buttons.append(button('◫ Khung dây / hình đặc',()=>{this.wire=!this.wire;this.solid?.setDisplayMode(this.wire?'wireframe':'solid');}));
   buttons.append(button('◉ Góc nhìn trên',()=>this.solid?.setViewPreset('top')));
   buttons.append(button('↻ Góc nhìn 3D',()=>this.solid?.setViewPreset('iso')));
   buttons.append(button('◇ Gấp / trải khối 3D',()=>{
    this.setPlaying(false);this.spatialMode=this.spatialMode==='fold'?'lesson':'fold';this.t=0;this.draw();this.setPlaying(true);
   }));
   buttons.append(button('◫ Mặt cắt song song đáy',()=>{
    if(!this.solid)return;
    this.setPlaying(false);
    this.section=!this.section;
    this.solid.setCrossSection(this.section,50);
   }));
  }
  const scrub=node('label','mv-g7-timeline');this.timeline=node('input');this.timeline.type='range';this.timeline.min=0;this.timeline.max=period;this.timeline.step=.02;this.timeline.value=0;this.timeline.setAttribute('aria-label','Tua thời gian mô phỏng');
  this.listen(this.timeline,'input',()=>{this.setPlaying(false);this.t=Number(this.timeline.value);this.draw();});scrub.append(node('span','','Thời gian (giây)'),this.timeline);host.append(scrub);
  this.status=node('div','mv-g7-status');this.metrics=node('div','mv-r5-values');host.append(this.status,this.metrics);
  const params=node('section','mv-r5-params');this.controls=new Map();for(const def of grade8Schema(id)){
   const label=node('label','mv-r5-param'),output=node('output','',fmt(this.params[def.key])),input=node('input');input.type='range';input.min=def.min;input.max=def.max;input.step=def.step;input.value=this.params[def.key];input.setAttribute('aria-label',def.label);
   label.append(node('span','mv-r5-param-label',formatMathText(def.label)),output,input);params.append(label);this.controls.set(def.key,{output,input,def});
   this.listen(input,'input',()=>{this.params[def.key]=Number(input.value);if((id==='8-01-C02'||id==='8-01-C01'&&this.params.identityVariant===1)&&this.params.b>=this.params.a){if(def.key==='a')this.params.b=Math.max(.5,Math.min(this.params.b,this.params.a-.1));else this.params.a=Math.min(6,Math.max(this.params.a,this.params.b+.1));}
    this.refresh();this.syncSolid();this.draw();});
  }host.append(params);
  if(id==='8-01-C01'||id==='8-01-C03'){
   if(id==='8-01-C03'){
    const scopeWrap=node('label','mv-r5-param'),scopeCap=node('span','mv-r5-param-label','Phạm vi bài học SGK (V4)'),scopeSel=document.createElement('select');
    for(const [k,lbl] of [[7,'Bài 7: Lập phương của một tổng / một hiệu'],[8,'Bài 8: Tổng và hiệu hai lập phương']]){
     const o=document.createElement('option');o.value=String(k);o.textContent=lbl;scopeSel.append(o);
    }
    this.lessonScopeSelect=scopeSel;scopeSel.value=String(this.params.lessonScope||7);
    this.listen(scopeSel,'change',()=>{
     this.params.lessonScope=Number(scopeSel.value);
     if(this.params.lessonScope===7&&this.params.identityVariant>=2)this.params.identityVariant=0;
     if(this.params.lessonScope===8&&this.params.identityVariant<2)this.params.identityVariant=2;
     this.refresh();this.draw();
    });
    scopeWrap.append(scopeCap,scopeSel);params.append(scopeWrap);
   }
   const wrap=node('label','mv-r5-param'),caption=node('span','mv-r5-param-label','Chọn hằng đẳng thức'),select=document.createElement('select');
   const choices=id==='8-01-C01'?[[0,'Bình phương một tổng'],[1,'Bình phương một hiệu']]:
    [[0,'[Bài 7] Lập phương một tổng (a+b)³'],[1,'[Bài 7] Lập phương một hiệu (a−b)³'],[2,'[Bài 8] Tổng hai lập phương a³+b³'],[3,'[Bài 8] Hiệu hai lập phương a³−b³']];
   for(const [key,label] of choices){const opt=document.createElement('option');opt.value=String(key);opt.textContent=label;select.append(opt);}
   this.identitySelect=select;select.value=String(this.params.identityVariant);select.setAttribute('aria-label','Chọn dạng hằng đẳng thức');
   this.listen(select,'change',()=>{this.params.identityVariant=Number(select.value);if(id==='8-01-C03')this.params.lessonScope=this.params.identityVariant<2?7:8;if(id==='8-01-C01'&&this.params.identityVariant===1&&this.params.b>=this.params.a)this.params.b=Math.max(.5,Math.min(this.params.b,this.params.a-.1));this.refresh();this.draw();});
   wrap.append(caption,select);params.append(wrap);
  }
  if(id==='8-08-C03'){
   const wrap=node('label','mv-r5-param'),caption=node('span','mv-r5-param-label','Phạm vi bài học SGK (V4)'),select=document.createElement('select');
   for(const [k,lbl] of [[30,'Bài 30: Không gian mẫu Ω = {1..6} & kết quả thuận lợi k'],[31,'Bài 31: Tỉ số xác suất P(A) = k/6 (xúc xắc cân đối)']]){
    const opt=document.createElement('option');opt.value=String(k);opt.textContent=lbl;select.append(opt);
   }
   select.value=String(this.params.lessonScope||30);select.setAttribute('aria-label','Chọn phạm vi Bài 30 hoặc Bài 31');
   this.listen(select,'change',()=>{this.params.lessonScope=Number(select.value);this.draw();});
   wrap.append(caption,select);params.append(wrap);
  }
  if(id==='8-09-C03'){
   const wrap=node('label','mv-r5-param'),caption=node('span','mv-r5-param-label','Loại hình chóp đều (Bài 38 / Bài 39)'),select=document.createElement('select');
   for(const [k,lbl] of [[3,'Bài 38: Hình chóp tam giác đều (1 đáy + 3 mặt bên)'],[4,'Bài 39: Hình chóp tứ giác đều (1 đáy + 4 mặt bên)']]){
    const opt=document.createElement('option');opt.value=String(k);opt.textContent=lbl;select.append(opt);
   }
   select.value=String(this.params.pyramidBaseSides||4);select.setAttribute('aria-label','Chọn đáy tam giác đều hoặc tứ giác đều');
   this.listen(select,'change',()=>{this.params.pyramidBaseSides=Number(select.value);this.syncSolid();this.draw();});
   wrap.append(caption,select);params.append(wrap);
  }
  if(id==='8-08-C01'){
   const wrap=node('label','mv-r5-param'),caption=node('span','mv-r5-param-label','Chọn loại biểu đồ phù hợp'),select=document.createElement('select');
   for(const [key,label] of [[0,'Biểu đồ cột'],[1,'Biểu đồ đoạn thẳng'],[2,'Biểu đồ quạt tròn (đúng tỉ lệ)']]){
    const opt=document.createElement('option');opt.value=String(key);opt.textContent=label;select.append(opt);
   }
   select.value=String(this.params.chartKind);select.setAttribute('aria-label','Chọn loại biểu đồ');
   this.listen(select,'change',()=>{this.params.chartKind=Number(select.value);this.draw();});
   wrap.append(caption,select);params.append(wrap);
  }
  const formula=grade8FormulaFor(id,this.params);
  const cp=button('📋 Sao chép LaTeX',async()=>{try{if(!navigator.clipboard?.writeText)throw Error('No Clipboard');await navigator.clipboard.writeText(grade8FormulaFor(id,this.params));cp.textContent='✓ Đã sao chép';}catch{cp.textContent='Bôi đen mã LaTeX bên dưới để sao chép';}});
  this.latex=node('div','mv-r5-latex');mountRenderedFormula(this.latex,formula);host.append(cp,this.latex);
  host.append(node('p','mv-r5-hint',grade8Solid(id)?'Khối 3D là mesh WebGL thực: kéo chuột để xoay, đổi cạnh đáy/chiều cao và phát hoạt cảnh. Hình khai triển nằm bên cạnh; không nhầm hình này với mặt phẳng cắt nghiêng.':'Sử dụng Phát/Từng bước/thanh trượt để quan sát hình thay đổi 0% → 50% → 100%. Kéo đỉnh/điểm dữ liệu được đánh dấu nếu có, hoặc điều chỉnh các tham số và kiểm tra số đo.'));
  if(!grade8Solid(id))this.bindDrag(this.viewport);else if(this.net)this.bindDrag(this.net);this.t=0;this.draw();scheduleLabAutoplay(this,{delay:90,reset:false});
 }
 mountSolid(){this.viewport.classList.add('mv-g7-3d-stage');const x=pyramid8(this.id,this.params);
  this.model={id:`g8_live_${this.id}`,title:this.mode.name,grade:8,type:x.type,params:{a:this.params.a,h:this.params.h}};
  try{this.solid=new Solid3DViewer(this.model,{onParametersChange:next=>{
   if(this._updating3D||!next)return;
   if(next.a!==undefined)this.params.a=next.a;
   if(next.h!==undefined)this.params.h=next.h;
   this.refresh();this.draw();
  }});this.solid.mount(this.viewport);this.solid.setToolMode('edit');this.solid.setShowHandles(true);this.solid.setViewPreset('iso');this.webgl=true;}
  catch(e){try{this.solid?.dispose?.();}catch{}this.solid=null;this.webgl=false;this.viewport.replaceChildren(node('p','mv-g7-fallback',`Không có WebGL 3D: ${e.message}. Hãy mở bằng Chrome/Edge hỗ trợ WebGL.`));}
 }
 syncSolid(){
  if(!this.solid)return;
  const x=pyramid8(this.id,this.params);
  if(this.model&&this.model.type!==x.type){
   this.model.type=x.type;
   this.solid.model.type=x.type; // C03 đổi đáy tam giác ↔ tứ giác: phải thay mesh thật
  }
  this._updating3D=true;this.solid.updateParameters({a:this.params.a,h:this.params.h});this._updating3D=false;
 }
 bindDrag(host=this.viewport){
  if(!host)return;
  bindFrameWheelZoom(this.stageState,host,(t,ev,fn,opts)=>this.listen(t,ev,fn,opts));
  this.listen(host,'pointerdown',e=>{
   const directPt=e.target?.getAttribute?.('data-pt')||e.target?.closest?.('[data-pt]')?.getAttribute?.('data-pt');
   if(!directPt&&tryStartLabelOrPointDrag(this.stageState,host,e))return;
   let handle=directPt;
   if(!handle){
    const svg=host.querySelector('svg'),pts=svg?[...svg.querySelectorAll('[data-pt]')]:[];
    if(pts.length===1)handle=pts[0].getAttribute('data-pt');
    else if(pts.length>1){
     let best=null,minD=1e9;
     for(const el of pts){const b=el.getBoundingClientRect(),d=Math.hypot(e.clientX-(b.left+b.width/2),e.clientY-(b.top+b.height/2));if(d<minD){minD=d;best=el;}}
     if(best&&minD<90)handle=best.getAttribute('data-pt');
    }
    if(!handle)handle='__canvas__';
   }
   this.drag=handle;this.dragStart={x:e.clientX,y:e.clientY,params:{...this.params}};
   try{host.setPointerCapture(e.pointerId);}catch{}e.preventDefault();});
  this.listen(host,'pointermove',e=>{
   if(handleLabelOrPointMove(this.stageState,host,e))return;
   if(!this.drag)return;const svg=host.querySelector('svg'),rc=svg?.getBoundingClientRect();if(!rc?.width||!rc?.height)return;
   const x=960*(e.clientX-rc.left)/rc.width,y=490*(e.clientY-rc.top)/rc.height,clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),family=this.id.slice(0,4);
   const before=JSON.stringify(this.params);
   if(family==='8-02'&&this.drag==='C'){
    const {scale,offset}=grade8QuadProjection(this.id,this.params),wx=(x-offset[0])/scale,wy=(offset[1]-y)/scale;
    if(this.id==='8-02-C01'){this.params.h=clamp(wy,1.5,6);this.params.b=clamp(2*wx-this.params.a,2,Math.min(7,this.params.a));}
    else if(this.id==='8-02-C02'){this.params.h=clamp(wy,1.5,6);this.params.skew=clamp(wx-this.params.a,.2,3);}
    else if(this.id==='8-02-C03'){this.params.a=clamp(wx,3,8);this.params.h=clamp(wy,1.5,6);}
    else if(this.id==='8-02-C04'){this.params.angle=clamp(Math.atan2(wy,wx-this.params.a)*180/Math.PI,35,135);}
    else if(this.id==='8-02-C05')this.params.a=clamp((wx+wy)/2,3,8);
   }else if((family==='8-03'||this.id==='8-06-C07')&&['D','E'].includes(this.drag)){
    const wx=(x-620)/52,wy=(404-y)/68,A=[0,this.params.h],B=[-this.params.a*.6,0],C=[this.params.a*.4,0],P=this.drag==='D'?B:C;
    const vx=P[0]-A[0],vy=P[1]-A[1],z=clamp(((wx-A[0])*vx+(wy-A[1])*vy)/(vx*vx+vy*vy),.15,.85);
    if(this.id==='8-03-C02'&&this.drag==='E')this.params.v=Number(z.toFixed(2));
    else if(this.id!=='8-03-C03')this.params.u=Number(z.toFixed(2));
   }else if(family==='8-08'&&this.drag.startsWith('P')){
    const i=Number(this.drag.slice(1)),u=Math.min(1,Math.max(0,this.t/8)),phase=.35+.65*(u*u*(3-2*u));
    if(i>=0&&i<=3)this.params['n'+(i+1)]=Math.round(clamp((395-y)/(11.2*phase),0,25));
   }
   if(JSON.stringify(this.params)===before&&this.dragStart&&this.controls.size){
    const keys=[...this.controls.keys()],dx=(e.clientX-this.dragStart.x)/rc.width,dy=(this.dragStart.y-e.clientY)/rc.height;
    const apply=(k,delta)=>{const c=this.controls.get(k);if(!c?.input)return;const min=Number(c.input.min),max=Number(c.input.max),step=Number(c.input.step)||.1;const raw=this.dragStart.params[k]+delta*(max-min);const next={...this.params,[k]:clamp(Math.round(raw/step)*step,min,max)};if(grade8Valid(this.id,next))this.params[k]=next[k];};
    if(keys[0])apply(keys[0],dx);if(keys[1])apply(keys[1],dy);
   }
   this.refresh();this.draw();
  });for(const name of ['pointerup','pointercancel','lostpointercapture'])this.listen(host,name,e=>{stopLabelOrPointDrag(this.stageState,host,e);this.drag=null;this.dragStart=null;});
 }
 refresh(){if(this.identitySelect)this.identitySelect.value=String(this.params.identityVariant??0);if(this.lessonScopeSelect)this.lessonScopeSelect.value=String(this.params.lessonScope??7);for(const [key,x] of this.controls){x.input.value=this.params[key];x.output.textContent=fmt(this.params[key]);}}
 setPlaying(v){if(this.destroyed)return;if(!v)cancelLabAutoplay(this);this.playing=!!v;if(this.playing&&this.t>=(this.id.startsWith('8-08')?8:6))this.t=0;if(this.playButton)this.playButton.textContent=this.playing?'⏸ Tạm dừng':'▶ Phát chuyển động';if(this.solid)this.solid.autoRotate=false;this.last=0;if(this.playing&&!this.raf)this.raf=requestAnimationFrame(now=>this.tick(now));}
 tick(now){this.raf=0;if(!this.playing||this.destroyed)return;const delta=this.last?Math.min(.08,(now-this.last)/1000):.016;this.last=now;const period=this.id.startsWith('8-08')?8:6;this.t=Math.min(period,this.t+delta);if(!this.lastDraw||now-this.lastDraw>52){this.lastDraw=now;this.draw();}if(this.t>=period){this.draw();this.setPlaying(false);return;}this.raf=requestAnimationFrame(now2=>this.tick(now2));}
 draw(){if(this.destroyed)return;
  if(!grade8Solid(this.id)){try{if(!grade8Valid(this.id,this.params))throw Error('Tham số ngoài miền hợp lệ');this.viewport.innerHTML=grade8SVGScene(this.id,this.params,this.t);decorateInteractiveSVG(this.viewport,this.stageState);this.error=null;}catch(e){this.error=e.message;this.viewport.replaceChildren(node('p','mv-g7-fallback',e.message));}}
  else{
   const openRatio=Math.min(1,Math.max(0,this.t/6));
   // The 2D net follows the identical actual 3D hinge angle, not an unrelated timer.
   const from3D=this.solid?.meshGroup;
   const preFrame=spatialMotionFrame({id:this.id,type:pyramid8(this.id,this.params).type,
     seconds:this.t,duration:6,supportsUnfold:!!from3D?.supportsUnfold,
     supportsCrossSection:!!from3D?.supportsCrossSection,netLesson:this.spatialMode==='fold'||this.id==='8-09-C03',deep:true});
   const netRatio=(preFrame.kind==='fold')?preFrame.unfold:openRatio;
   if(this.net){this.net.innerHTML=grade8NetSVG(this.id,this.params,netRatio);decorateInteractiveSVG(this.net,this.stageState);}
   if(this.solid){
    const modelType=pyramid8(this.id,this.params).type;
    this.spatialFrame=applySpatialMotion(this.solid,{id:this.id,type:modelType,
     seconds:this.t,duration:6,netLesson:this.spatialMode==='fold'||this.id==='8-09-C03',deep:true});
   }
  }
  if(this.spatialGuide)updateSpatialLessonGuide(this.spatialGuide,this.id,pyramid8(this.id,this.params).type,this.t,6,this.spatialFrame?.phase);
  if(this.timeline)this.timeline.value=this.t;
  if(this.latex)mountRenderedFormula(this.latex,grade8FormulaFor(this.id,this.params));
  if(this.metrics){
   this.metrics.replaceChildren();
   const mHead=node('div','mv-r5-value');mHead.append(node('strong','',formatMathText(`${this.id} • ${this.mode?.name||this.mode?.title||'Mô hình Toán 8'}`)));mHead.style.color='#0c7da0';this.metrics.append(mHead);
   for(const msg of grade8Metrics(this.id,this.params)){const x=node('div','mv-r5-value');x.append(node('strong','',formatMathText(msg)));this.metrics.append(x);}
  }
  if(this.status){
   const plan=getGuidedDiscoveryPlan(this.id,this.mode);
   const base=this.error?`⚠ ${this.error}`:grade8Solid(this.id)?this.webgl?'✓ Mesh 3D WebGL; xoay được; số đo cập nhật':'⚠ Chưa dựng được WebGL trên máy này':'✓ Hình SVG 2D và số đo được tính từ tham số';
   this.status.textContent=this.error?base:`${base}${this.spatialFrame?.phase?' · Đang minh họa: '+this.spatialFrame.phase:''} · Kết luận: ${plan.takeaway}`;
  }
 }
 destroy(){cancelLabAutoplay(this);this.destroyed=true;this.playing=false;cancelAnimationFrame(this.raf);this.raf=0;for(const [x,name,fn,o] of this.events)x.removeEventListener(name,fn,o);this.events=[];try{this.solid?.dispose?.();}catch{}this.solid=null;}
}
