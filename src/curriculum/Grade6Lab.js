/** MATHVERSE R6.5: Grade 6 uses the same specialist-lab shell as Grades 7–12.
 * Legacy Math6ExhibitLab UI is NOT mounted. Its mathematical canvas engine and
 * verified Three.js models are reused directly; source SGK data stays intact.
 */
import {renderModel, W, H} from '../math6-lab/canvas.mjs';
import {mathStats, sampleOutcome, clamp} from '../math6-lab/math.mjs';
import {motionParams} from '../math6-lab/catalog-motion.mjs';
import {labById, LAB_TO_EXHIBIT, labsForExhibit} from '../math6-lab/catalog.js';
import {Math6ThreeLab} from '../math6-lab/three-lab.mjs';
import {isTrue3DCapable, getModelTaxonomy} from '../math6-lab/math6-taxonomy.mjs';
import {isGrade6ActiveLab} from '../portal-labs/grade6-curation-v15-1.js';
import {makeGrade6DragSpec, applyGrade6Drag} from './grade6-direct-manipulation.mjs';
import {mountRenderedFormula} from './math-formula-renderer.mjs';
import {getGuidedDiscoveryPlan} from './guided-discovery.mjs';
import {scheduleLabAutoplay, cancelLabAutoplay, isAutoPlayEnabled, setAutoPlayEnabled} from './lab-autoplay.mjs';

const elt=(tag,cls='',text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el;};
const fmt=n=>Number.isFinite(n)?Number(n).toLocaleString('vi-VN',{maximumFractionDigits:2}):'—';
const paramSpec={
 a:[0.5,10,.1],b:[0.5,10,.1],height:[.2,10,.1],skew:[-4,4,.1],rotation:[-180,360,1],
 speed:[1,8,.25],angle:[0,180,1],measure:[0,12,.1],position:[-3,3,.1],fold:[0,180,1],
 value:[-20,100,1],step:[-12,12,1],count:[2,11,1],type:[0,1,1],
 numerator:[0,100,1],denominator:[1,100,1],factor:[1,6,1],other:[0,100,1],total:[1,100,1],
 unit:[1,10,1],segments:[2,6,1]
};
const fresh=model=>({params:structuredClone(model.defaults),time:0,counts:[],lastOutcome:undefined,tileFlips:new Set(),selectedDesk:0});

export class Grade6Lab {
 constructor({anchor,initialLabId,onNotice=()=>{},onSelected=()=>{},includeArchived=false,allowedLabIds=null}={}){
  if(Number(anchor?.grade)!==6)throw Error('Grade6Lab requires grade 6 original anchor');
  this.anchor=anchor;this.initialLabId=initialLabId;this.onNotice=onNotice;this.onSelected=onSelected;
  this.includeArchived=includeArchived;this.allowedLabIds=allowedLabIds?new Set(allowedLabIds):null;
  this.selected=null;this.state=null;this.mode='model';this.playing=false;this.raf=0;this.time=0;
  this.speed=1;this.lastTick=0;this.before=null;this.three=null;this.disposed=false;this.listeners=[];this.lastWarning='';this.dragging=false;this.activeDragKey=null;
 }
 _listen(target,type,fn,options){target.addEventListener(type,fn,options);this.listeners.push([target,type,fn,options]);}
 _storeKey(id){return `mathverse:math6:exhibit:${this.anchor.id}:lab:${id}`;}
 _state(model){let saved;try{saved=JSON.parse(localStorage.getItem(this._storeKey(model.id))||'null');}catch{}
  const s=fresh(model);if(saved?.params)for(const [k,def] of Object.entries(model.defaults)){const v=saved.params[k];if(typeof def==='number'&&typeof v==='number'&&Number.isFinite(v))s.params[k]=v;else if(Array.isArray(def)&&Array.isArray(v)&&v.length===def.length&&v.every(Number.isFinite))s.params[k]=v;}
  if(Array.isArray(saved?.counts))s.counts=saved.counts.filter(x=>Number.isFinite(x)&&x>=0).slice(0,20);
  if(Number.isInteger(saved?.lastOutcome))s.lastOutcome=saved.lastOutcome;
  if(Array.isArray(saved?.tileFlips))s.tileFlips=new Set(saved.tileFlips.slice(0,200));
  if(Number.isInteger(saved?.selectedDesk))s.selectedDesk=saved.selectedDesk;
  return s;
 }
 _save(){if(!this.selected||!this.state)return;const cleanParams=structuredClone(this.before||this.state.params);if(!('progress' in (this.selected.defaults||{})))delete cleanParams.progress;try{localStorage.setItem(this._storeKey(this.selected.id),JSON.stringify({params:cleanParams,counts:this.state.counts,lastOutcome:this.state.lastOutcome,tileFlips:[...this.state.tileFlips],selectedDesk:this.state.selectedDesk}));}catch{}}
 mount(viewport,inspector){
  this.viewport=viewport;this.inspector=inspector;this.root=elt('section','mv-g7-host mv-g8-host mv-g6-unified');
  this.root.dataset.grade6Lab='unified';
  this.heading=elt('p','mv-r5-statement');this.root.append(this.heading);
  this.view=elt('div','mv-g7-viewport mv-g6-viewport');this.view.setAttribute('aria-label','Sân khấu mô hình SGK Toán 6');
  this.bookCanvas=elt('canvas','mv-g6-book');this.bookCanvas.width=W;this.bookCanvas.height=H;this.bookCanvas.setAttribute('aria-label','Mô hình Toán 6 SGK dạng 2D tương tác');
  this.bookCtx=this.bookCanvas.getContext('2d');
  this.threeCanvas=elt('canvas','mv-g6-three');this.threeCanvas.width=W;this.threeCanvas.height=H;this.threeCanvas.hidden=true;this.threeCanvas.setAttribute('aria-label','Hình 3D trong phòng thí nghiệm Toán 6');
  this.view.append(this.bookCanvas,this.threeCanvas);this.root.append(this.view);
  this.status=elt('p','mv-g7-status');this.status.setAttribute('role','status');this.root.append(this.status);
  this.stats=elt('div','mv-r5-values');this.root.append(this.stats);
  const bar=elt('div','mv-g7-buttons mv-g6-toolbar');this.root.append(bar);
  const action=(name,fn)=>{const b=elt('button','mv-g7-button',name);b.type='button';this._listen(b,'click',fn);bar.append(b);return b;};
  this.mode2D=action('▤ Bản vẽ 2D',()=>this.setMode('model'));
  this.mode3D=action('⬡ Xem 3D',()=>this.setMode('3d'));
  this.play=action('▶ Phát',()=>{if(this.playing){this.setPlaying(false);return;}if(this.time>=8)this.applyTime(0);this.setPlaying(true);});
  action('⏮ Bước trước',()=>{this.setPlaying(false);this.scrub(Math.max(0,this.time-1));});
  action('⏭ Tiếp bước',()=>{this.setPlaying(false);this.scrub(Math.min(8,this.time+1));});
  for(const [lbl,sec] of [['0%',0],['50%',4],['100%',8]]){
   action(lbl,()=>{this.setPlaying(false);this.scrub(this.selected?.engine==='chance'?sec*6/8:sec);});
  }
  action('↺ Đặt lại',()=>this.reset());
  this.autoPlayBtn=action(isAutoPlayEnabled(this)?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt',()=>{
   const next=setAutoPlayEnabled(this,!isAutoPlayEnabled(this));
   this.autoPlayBtn.textContent=next?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt';
  });
  this.roll1=action('🎲 Thử 1 lần',()=>this.simulate(1));this.roll10=action('🎲 Thử 10 lần',()=>this.simulate(10));this.roll100=action('🎲 Thử 100 lần',()=>this.simulate(100));
  const timeline=elt('label','mv-g7-timeline');timeline.append(elt('span','','Thời gian (giây)'));
  this.seek=elt('input');this.seek.type='range';this.seek.min=0;this.seek.max=8;this.seek.step=.02;this.seek.value=0;this.seek.setAttribute('aria-label','Tua chuyển động');
  this._listen(this.seek,'input',()=>this.scrub(Number(this.seek.value)));timeline.append(this.seek);this.root.append(timeline);
  this.controls=elt('section','mv-r5-params mv-g6-controls');this.root.append(this.controls);
  this.latex=elt('div','mv-r5-latex');
  if(this.anchor?.formula){mountRenderedFormula(this.latex,this.anchor.formula);this.root.append(this.latex);}
  this.source=elt('p','mv-r5-hint');this.root.append(this.source);
  viewport.replaceChildren(this.root);
  this.inspectorControls=elt('div','mv-g6-inspector');
  inspector?.replaceChildren(this.inspectorControls);
  this._listen(this.bookCanvas,'pointerdown',event=>{this.dragging=true;try{this.bookCanvas.setPointerCapture(event.pointerId);}catch{}this.pointer(event);event.preventDefault();});
  this._listen(this.bookCanvas,'pointermove',event=>{if(this.dragging)this.pointer(event);});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])this._listen(this.bookCanvas,type,()=>{this.dragging=false;});
  const first=labById(this.initialLabId)&&(this.allowedLabIds?this.allowedLabIds.has(this.initialLabId):LAB_TO_EXHIBIT[this.initialLabId]===this.anchor.id)?this.initialLabId:labsForExhibit(this.anchor.id).find(m=>!this.allowedLabIds||this.allowedLabIds.has(m.id))?.id||[...(this.allowedLabIds||[])][0];
  if(!first||!this.select(first))throw Error('Không có Lab Toán 6 phù hợp với hiện vật gốc');
 }
 select(id){
  const model=labById(id);
  if(!model||(this.allowedLabIds?!this.allowedLabIds.has(id):LAB_TO_EXHIBIT[id]!==this.anchor.id))return false;
  if(LAB_TO_EXHIBIT[id]&&this.anchor&&this.anchor.id!==LAB_TO_EXHIBIT[id])this.anchor={...this.anchor,id:LAB_TO_EXHIBIT[id]};
  this.setPlaying(false);this._save();this.selected=model;this.state=this._state(model);this.time=0;this.before=structuredClone(this.state.params);
  this.heading.textContent=model.action||`Khám phá mô hình ${model.title}`;
  this.source.textContent=`${model.source?.book||'SGK'} · trang ${model.source?.printed_page??'—'} · ${getModelTaxonomy(id).badge} · ${isGrade6ActiveLab(id)?'Trưng bày':'Lưu kho'}`;
  this.roll1.hidden=this.roll10.hidden=this.roll100.hidden=model.engine!=='chance';
  this.mode3D.hidden=!isTrue3DCapable(id);
  this.mode3D.textContent='⬡ Mô hình 3D WebGL';
  this.dragOptions=makeGrade6DragSpec(model);
  this.activeDragKey=this.dragOptions[0]?.key||null;
  this.renderControls();
  this.applyTime(0);
  this.setMode(isTrue3DCapable(id)?'3d':'model');
  this.onSelected(model,this.anchor);
  scheduleLabAutoplay(this,{delay:90,reset:false});
  return true;
 }
 setMode(mode){
  if(this.disposed)return false;
  if(mode==='studio')mode='model'; // Legacy caller: the former Math6Studio UI was removed.
  if(!['3d','model'].includes(mode))return false;
  // A planar diagram is not promoted to a fake volumetric 3D model.
  if(mode==='3d'&&!isTrue3DCapable(this.selected?.id))return false;
  this.lastWarning='';
  if(mode==='3d'){
   if(!this.three){this.three=new Math6ThreeLab(this.threeCanvas,msg=>this.notice(msg));}
   if(!this.three.ready){this.lastWarning='Không khởi tạo được WebGL trên máy này. Hệ thống đã chuyển sang hình SGK 2D; kiểm tra tăng tốc phần cứng của trình duyệt.';mode='model';}
   else if(!this.three.enter(this.selected,this.state,{allowBoard:true})){this.lastWarning='Không dựng được 3D; hiển thị hình SGK 2D thay thế.';mode='model';}
  }
  if(mode==='model')this.three?.leave();
  this.mode=mode;
  this.bookCanvas.hidden=mode!=='model';this.threeCanvas.hidden=mode!=='3d';
  this.mode2D.classList.toggle('active',mode==='model');this.mode3D.classList.toggle('active',mode==='3d');
  if(mode==='3d'){
   const r=this.view.getBoundingClientRect();this.three?.resize(Math.max(320,r.width),Math.max(300,r.height));
   this.three?.renderer?.render(this.three.scene,this.three.camera);
  }
  this.draw();return mode==='3d'||mode==='model';
 }
 notice(msg){this.status.textContent=msg;this.onNotice(msg);}
 renderControls(){
  this.controls.replaceChildren();this.inspectorControls?.replaceChildren();this.paramBindings=[];
  const p=this.state.params,box=this.controls;
  if(this.selected?.id==='toan6-hinh-thoi'){
    const scopeBar=elt('label','mv-g6-direct-picker');
    scopeBar.append(elt('span','','Phạm vi bài học SGK (V4)'));
    const scopeSel=elt('select');scopeSel.setAttribute('aria-label','Chọn phạm vi Bài 19 hoặc Bài 20');
    for(const [k,lbl] of [[19,'Bài 19: Nhận biết 4 cạnh bằng nhau & hai đường chéo vuông góc'],[20,'Bài 20: Chu vi P = 4a & Diện tích S = ½·d₁·d₂']]){
      const o=elt('option','',lbl);o.value=String(k);scopeSel.append(o);
    }
    if(!this.state.lessonScope)this.state.lessonScope=19;
    scopeSel.value=String(this.state.lessonScope);
    this._listen(scopeSel,'change',()=>{this.state.lessonScope=Number(scopeSel.value);this.draw();});
    scopeBar.append(scopeSel);this.controls.append(scopeBar);
  }
  if(this.selected?.variant==='room'){
    const deskBar=elt('label','mv-g6-direct-picker');
    deskBar.append(elt('span','','Chọn bàn học trong sơ đồ (3 hàng × 4 dãy)'));
    const deskSel=elt('select');deskSel.setAttribute('aria-label','Chọn bàn học');
    for(let idx=0;idx<12;idx++){
      const row=Math.floor(idx/4)+1,col=(idx%4)+1;
      const o=elt('option','',`Bàn ${idx+1} (Hàng ${row}, Dãy ${col})`);o.value=String(idx);deskSel.append(o);
    }
    deskSel.value=String(Number.isInteger(this.state.selectedDesk)?this.state.selectedDesk:0);
    this._listen(deskSel,'change',()=>{this.state.selectedDesk=Number(deskSel.value);this._save();this.draw();});
    deskBar.append(deskSel);this.controls.append(deskBar);
  }
  // Same direct-manipulation affordance as Grade 7/8 SVG labs. Every Grade-6
  // parameterized model has a visible active handle and an explicit drag map.
  if(this.dragOptions?.length){
    const dragBar=elt('label','mv-g6-direct-picker');
    dragBar.append(elt('span','','Kéo trực tiếp trên hình · Tham số'));
    const select=elt('select');select.setAttribute('aria-label','Chọn tham số kéo trực tiếp');
    for(const item of this.dragOptions){const opt=elt('option','',item.label);opt.value=item.key;select.append(opt);}
    select.value=this.activeDragKey||this.dragOptions[0].key;
    this._listen(select,'change',()=>{this.activeDragKey=select.value;this.draw();});
    dragBar.append(select);this.controls.append(dragBar);
  }
  for(const [key,value] of Object.entries(p)){
   const add=(v,i=null)=>{
    if(typeof v!=='number'||!Number.isFinite(v))return;
    let [low,hi,step]=paramSpec[key]||[Math.min(0,v-10),Math.max(10,v+10),Number.isInteger(v)?1:.1];
    if(key==='value'&&this.selected.variant==='place')hi=9999;
    if(key==='denominator'&&this.selected.variant==='addsame')low=2;
    if(key==='measure'&&this.selected.variant==='clock'){low=0;hi=59;step=1;}
    if(key==='angle'&&this.selected.variant==='clock'){low=0;hi=360;step=30;}
    const label=elt('label','mv-r5-param');const title=elt('span','mv-r5-param-label',key+(i===null?'':` ${i+1}`));
    const val=elt('output','',fmt(v)),input=elt('input');input.type='range';input.min=low;input.max=hi;input.step=step;input.value=v;input.setAttribute('aria-label',key+(i===null?'':` ${i+1}`));
    this._listen(input,'input',()=>{
     cancelLabAutoplay(this);this.setPlaying(false);
     const n=Number(input.value);if(i===null)this.state.params[key]=n;else this.state.params[key][i]=n;
     if(this.selected.engine==='fraction'){
      const q=this.state.params;q.denominator=Math.max(1,Math.round(q.denominator||1));q.numerator=Math.min(q.numerator??0,q.denominator);
     }
     if(!('progress' in (this.selected.defaults||{})))this.state.params.progress=1;
     const base=structuredClone(this.state.params);if(!('progress' in (this.selected.defaults||{})))delete base.progress;
     this.before=base;
     val.textContent=fmt(n);this._save();this.draw();
    });
    label.append(title,val,input);box.append(label);this.paramBindings.push({input,val,key,i});
   };
   if(Array.isArray(value))value.forEach((n,i)=>add(n,i));else add(value);
  }
  if(this.inspectorControls){this.inspectorControls.append(elt('h3','','Thông số mô hình Toán 6'),elt('p','',this.selected.action||''));}
 }
 syncParamControls(){
  for(const {input,val,key,i} of this.paramBindings||[]){
   const value=i===null?this.state.params[key]:this.state.params[key]?.[i];
   if(Number.isFinite(value)){input.value=String(value);val.textContent=fmt(value);}
  }
 }
 draw(){
  if(!this.selected||!this.state)return;
  try{renderModel(this.bookCtx,this.selected,this.state,{theme:'light'});}catch(error){if(this.mode==='model')this.notice('Không vẽ được mô hình 2D: '+error.message);}
  if(this.mode!=='model'){this.three?.setState(this.state);}
  this.stats.replaceChildren();
  const values=mathStats(this.selected,this.state);
  const lines=Array.isArray(values)?values:[values];
  for(const line of lines.filter(Boolean))this.stats.append(elt('span','mv-g6-metric',line));
  this.play.textContent=this.playing?'⏸ Tạm dừng':'▶ Phát';this.seek.value=String(this.time);
  const plan=getGuidedDiscoveryPlan(this.selected.id,this.selected);
  const takeawaySuffix=plan?.takeaway?` · Kết luận: ${plan.takeaway}`:'';
  if(this.lastWarning){this.status.textContent='⚠ '+this.lastWarning;}
  else if(this.selected.engine!=='chance'&&this.mode==='3d'&&!isTrue3DCapable(this.selected.id))
    this.status.textContent='Hình phẳng / biểu đồ 2D được trưng bày trên bảng 3D; không phải khối có thể tích.'+takeawaySuffix;
  else this.status.textContent=(this.mode==='3d'?'Mô hình Three.js 3D: kéo chuột để xoay, cuộn để phóng to.':'Bản vẽ Toán 6 chuẩn SGK: chọn tham số và kéo trực tiếp trên hình, hoặc dùng thanh trượt.')+takeawaySuffix;
 }
 pointer(e){
  if(this.mode!=='model'||!this.selected)return;
  cancelLabAutoplay(this);this.setPlaying(false);
  const b=this.bookCanvas.getBoundingClientRect();if(!b.width||!b.height)return;
  const x=(e.clientX-b.left)*W/b.width,y=(e.clientY-b.top)*H/b.height,p=this.state.params,v=this.selected.variant;
  if(v==='room'&&e.type==='pointerdown'){
   for(let row=0;row<3;row++)for(let col=0;col<4;col++){
    const dx=259+col*102,dy=193+row*80;
    if(x>=dx&&x<=dx+72&&y>=dy&&y<=dy+53){this.state.selectedDesk=row*4+col;this.renderControls();this._save();this.draw();return;}
   }
  }
  if(['angle','angletypes','rays','pairlines'].includes(v)&&Number.isFinite(p.angle))p.angle=Math.max(0,Math.min(180,Math.abs(Math.atan2(H/2-y,x-W/2)*180/Math.PI)));
  else if(['midpoint','ruler'].includes(v)&&Number.isFinite(p.measure))p.measure=Math.max(1,Math.min(12,(x-300)/43));
  else if(['integer','natural','hops'].includes(v)&&Number.isFinite(p.value))p.value=Math.max(v==='natural'?0:-10,Math.min(v==='natural'?14:10,Math.round((x-460)/46)));
  else if(this.selected.engine==='chance'){if(e.type==='pointerdown')this.simulate(1);return;}
  else if(this.selected.engine==='tiling'){if(e.type==='pointerdown'){const col=Math.floor((x-220)/46),row=Math.floor((y-130)/46),key=`${row}:${col}`;if(this.state.tileFlips.has(key))this.state.tileFlips.delete(key);else this.state.tileFlips.add(key);}else return;}
  else if(!applyGrade6Drag(this.selected,p,this.activeDragKey,x/W,y/H))return;
  if(!('progress' in (this.selected.defaults||{})))p.progress=1;
  const base=structuredClone(p);if(!('progress' in (this.selected.defaults||{})))delete base.progress;
  this.before=base;this._save();this.syncParamControls();this.draw();
 }
 simulate(n){if(this.selected?.engine!=='chance')return;for(let i=0;i<n;i++){const outcome=sampleOutcome(this.selected,Math.random,this.state.params);this.state.counts[outcome]=(this.state.counts[outcome]||0)+1;this.state.lastOutcome=outcome;}this._save();this.draw();}
 applyTime(seconds){
  if(!this.selected||!this.state)return;
  if(!this.before){
   const base=structuredClone(this.state.params);
   if(!('progress' in (this.selected.defaults||{})))delete base.progress;
   this.before=base;
  }
  this.time=clamp(seconds,0,8);
  this.state.params=motionParams(this.selected,this.before,this.time,8);
  this.state.time=this.time*1000;
  this.syncParamControls();
 }
 scrub(seconds){this.setPlaying(false);this.applyTime(seconds);this.draw();}
 reset(){this.setPlaying(false);this.state=fresh(this.selected);this.before=structuredClone(this.state.params);this.time=0;this.renderControls();this.applyTime(0);this.three?.setState(this.state);this._save();this.draw();}
 setPlaying(active){this.playing=Boolean(active);if(!active){cancelLabAutoplay(this);if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;this.lastTick=0;if(this.play)this.play.textContent='▶ Phát';return;}
  this.lastTick=0;const tick=t=>{if(!this.playing||this.disposed)return;if(this.lastTick)this.time+=(t-this.lastTick)/1000*this.speed;this.lastTick=t;if(this.time>=8){this.time=8;this.setPlaying(false);}
   this.applyTime(this.time);this.draw();if(this.playing)this.raf=requestAnimationFrame(tick);};this.raf=requestAnimationFrame(tick);
 }
 dispose(){this.destroy();}
 destroy(){if(this.disposed)return;cancelLabAutoplay(this);this.setPlaying(false);this._save();this.disposed=true;this.three?.dispose();this.three=null;
  for(const [el,type,fn,opts] of this.listeners)el.removeEventListener(type,fn,opts);this.listeners=[];
  this.root?.remove();this.viewport=null;this.inspector=null;
 }
}
