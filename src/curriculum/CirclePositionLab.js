import {isCirclePosition,circleDefaults,circleExpected,circleLatex,classifyLineCircle,classifyTwoCircles,twoCircleGeometry,lineCircleGeometry,CIRCLE_LABELS} from './circle-positions.mjs';
import {mountRenderedFormula} from './math-formula-renderer.mjs';
import {getGuidedDiscoveryPlan} from './guided-discovery.mjs';
import {createStageInteractivity,decorateInteractiveSVG,tryStartLabelOrPointDrag,handleLabelOrPointMove,stopLabelOrPointDrag,bindFrameWheelZoom,resetStageInteractivity} from './svg-stage-interactivity.mjs';
import {scheduleLabAutoplay,cancelLabAutoplay,isAutoPlayEnabled,setAutoPlayEnabled} from './lab-autoplay.mjs';
const NS='http://www.w3.org/2000/svg';
const tag=(name,attrs={})=>{const t=document.createElementNS(NS,name);for(const [key,value] of Object.entries(attrs))t.setAttribute(key,String(value));return t;};
const el=(tagname,text='',cls='')=>{const t=document.createElement(tagname);t.textContent=text;if(cls)t.className=cls;return t;};
const round=n=>Number(n).toLocaleString('vi-VN',{maximumFractionDigits:2});
export class CirclePositionLab{
 constructor(){this.modeId=null;this.params=null;this.drag=false;this.chart=null;this.view={x:155,y:245,s:36};this.playing=false;this.raf=0;this.last=0;this.t=0;this.stageState=createStageInteractivity();}
 _targetTrajectory(){
  const R=this.params?.R??this.params?.r??3,r=this.params?.r??2;
  if(this.modeId==='9-06-C01')return {start:Number((R*1.45).toFixed(1)),mid:Number((R*0.95).toFixed(1)),end:Number((R*0.35).toFixed(1)),note:'Tịnh tiến đường thẳng tiến vào đường tròn đến vị trí cắt nhau (d < R → 2 giao điểm A, B)'};
  if(this.modeId==='9-06-C02')return {start:Number((R*0.4).toFixed(1)),mid:Number((R*0.75).toFixed(1)),end:Number(R.toFixed(1)),note:'Dịch đường thẳng đến đúng khoảng cách d = R: hai giao điểm chập thành 1 tiếp điểm H (OH ⊥ a)'};
  if(this.modeId==='9-06-C03')return {start:Number(R.toFixed(1)),mid:Number((R*1.2).toFixed(1)),end:Number((R*1.45).toFixed(1)),note:'Tịnh tiến đường thẳng ra ngoài đường tròn (d > R): hiện rõ khoảng hở, không có điểm chung'};
  if(this.modeId==='9-06-C04')return {start:Number((R+r+1).toFixed(1)),mid:Number((R+r-0.2).toFixed(1)),end:Number(((Math.abs(R-r)+R+r)/2).toFixed(1)),note:'Di chuyển tâm O₂ vào miền |R − r| < d < R + r: hai đường tròn cắt nhau tại 2 giao điểm A, B'};
  if(this.modeId==='9-06-C05')return {start:Number((R+r+1.2).toFixed(1)),mid:Number((R+r).toFixed(1)),end:Number(Math.abs(R-r).toFixed(1)),note:'Qua 2 mốc tiếp xúc: d = R + r (tiếp xúc ngoài) → d = |R − r| (tiếp xúc trong) trên đường nối tâm O₁O₂'};
  return {start:Number((R+r+1.2).toFixed(1)),mid:Number(Math.max(0.2,Math.abs(R-r)-0.5).toFixed(1)),end:0,note:'Khảo sát 3 trạng thái không giao: Ngoài nhau (d > R + r) → Chứa nhau (d < |R − r|) → Đồng tâm / Trùng nhau (d = 0)'};
 }
 setProgress(pct){
  this.setPlaying(false);
  const f=Math.max(0,Math.min(1,Number(pct)/100));
  this.t=f*6;
  const traj=this._targetTrajectory();
  if(f<=0.01)this.params.d=traj.start;
  else if(f<0.55){const u=f/0.55;this.params.d=Number((traj.start+(traj.mid-traj.start)*u).toFixed(1));}
  else{const u=(f-0.55)/0.45;this.params.d=Number((traj.mid+(traj.end-traj.mid)*u).toFixed(1));}
  if(this.modeId==='9-06-C06'&&f>=0.95)this.params.r=this.params.R;
  this.sync();this.draw();
 }
 mount(container,modeId,mode){
  if(!isCirclePosition(modeId))throw Error('Chưa hỗ trợ mô hình');
  this.modeId=modeId;this.params=circleDefaults(modeId);this.container=container;this.stageState=createStageInteractivity();container.replaceChildren();
  this.header=el('p',mode.student_interaction,'mv-r5-statement');container.append(this.header);
  const box=el('div','','mv-r5-viewbox');this.box=box;this.chart=tag('svg',{viewBox:'0 0 840 420',preserveAspectRatio:'xMidYMid meet','aria-label':'Mô hình hình học đường tròn có thể kéo'});this.chart.style.touchAction='none';box.append(this.chart);container.append(box);
  this.metrics=el('div','','mv-r5-values');container.append(this.metrics);
  this.state=el('p','','mv-r5-triangle-status');container.append(this.state);
  const panel=el('div','','mv-r5-params');this.controls=new Map();for(const key of Object.keys(this.params)){
   const wrap=el('label','','mv-r5-param'),label=el('span',key==='R'?'Bán kính R':key==='r'?'Bán kính r':'Khoảng cách d','mv-r5-param-label'),value=el('output',round(this.params[key]));const slide=el('input');slide.type='range';slide.min=key==='d'?0:.5;slide.max=key==='d'?10:5;slide.step='.1';slide.value=this.params[key];slide.addEventListener('input',()=>{this.setPlaying(false);this.params[key]=Number(slide.value);value.textContent=round(this.params[key]);this.draw();});wrap.append(label,value,slide);panel.append(wrap);this.controls.set(key,{slide,value});}container.append(panel);
  const timelineWrap=el('label','Tua tiến trình vị trí tương đối (0% → 50% → 100%)','mv-g7-timeline');
  this.timeline=el('input');this.timeline.type='range';this.timeline.min=0;this.timeline.max=6;this.timeline.step='.05';this.timeline.value=0;
  this.timeline.addEventListener('input',()=>{this.setPlaying(false);this.t=Number(this.timeline.value);this.advance();});
  timelineWrap.append(this.timeline);container.append(timelineWrap);
  const btns=el('div','','mv-r5-stage-actions');const reset=el('button','↺ Đặt lại','mv-r5-action');reset.type='button';reset.addEventListener('click',()=>{this.setPlaying(false);this.t=0;if(this.timeline)this.timeline.value=0;resetStageInteractivity(this.stageState);this.params=circleDefaults(modeId);const traj=this._targetTrajectory();this.params.d=traj.start;this.sync();this.draw();});btns.append(reset);
  if(modeId==='9-06-C05'){
   for(const [label,dist] of [['Tiếp xúc ngoài (d = R+r)',()=>this.params.R+this.params.r],['Tiếp xúc trong (d = |R−r|)',()=>Math.abs(this.params.R-this.params.r)]]){
    const b=el('button',label,'mv-r5-action');b.type='button';b.addEventListener('click',()=>{this.setPlaying(false);this.params.d=Number(dist().toFixed(1));this.sync();this.draw();});btns.append(b);
   }
  }else if(modeId==='9-06-C06'){
   for(const [label,get] of [['Ngoài nhau (d > R+r)',()=>({d:this.params.R+this.params.r+1})],['Chứa nhau (d < |R−r|)',()=>({d:Math.max(0,Math.abs(this.params.R-this.params.r)-.5)})],['Trùng nhau (d = 0, R = r)',()=>({r:this.params.R,d:0})]]){
    const b=el('button',label,'mv-r5-action');b.type='button';b.addEventListener('click',()=>{this.setPlaying(false);Object.assign(this.params,get());this.sync();this.draw();});btns.append(b);
   }
  }
  const play=el('button','▶ Phát thay đổi vị trí','mv-r5-action');play.type='button';play.addEventListener('click',()=>this.setPlaying(!this.playing));btns.prepend(play);this.playButton=play;
  const prevStep=el('button','⏮ Bước trước','mv-r5-action');prevStep.type='button';prevStep.addEventListener('click',()=>{this.setPlaying(false);this.t=Math.max(0,this.t-1.5);this.advance();});btns.append(prevStep);
  const step=el('button','⏭ Tiếp bước','mv-r5-action');step.type='button';step.addEventListener('click',()=>{this.setPlaying(false);this.t=Math.min(6,this.t+1.5);this.advance();});btns.append(step);
  for(const [lbl,pct] of [['0%',0],['50%',50],['100%',100]]){
   const qBtn=el('button',lbl,'mv-r5-action');qBtn.type='button';qBtn.addEventListener('click',()=>this.setProgress(pct));btns.append(qBtn);
  }
  const autoBtn=el('button',isAutoPlayEnabled(this)?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt','mv-r5-action');autoBtn.type='button';autoBtn.addEventListener('click',()=>{const next=setAutoPlayEnabled(this,!isAutoPlayEnabled(this));autoBtn.textContent=next?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt';});btns.append(autoBtn);
  container.append(btns);
  const copy=el('button','📋 Sao chép LaTeX','mv-r5-copy');copy.type='button';copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(circleLatex(modeId));copy.textContent='✓ Đã sao chép';}catch{copy.textContent='Chọn và sao chép mã bên dưới';}});const latexEl=el('div','','mv-r5-latex');mountRenderedFormula(latexEl,circleLatex(modeId));container.append(copy,latexEl,el('p','Kéo đường thẳng, tâm O₂, đầu mút bán kính R/r hoặc kéo trực tiếp các chữ/điểm để tránh đè lên hình.','mv-r5-hint'));
  bindFrameWheelZoom(this.stageState,box,(t,ev,fn)=>t.addEventListener(ev,fn));
  this.chart.addEventListener('pointerdown',e=>{
   this.setPlaying(false);
   const dragTarget=e.target?.dataset?.drag||e.target?.closest?.('[data-drag]')?.dataset?.drag;
   if(!dragTarget&&tryStartLabelOrPointDrag(this.stageState,box,e))return;
   const fallback=this.modeId<='9-06-C03'?'line':'circle';
   this.drag=dragTarget||fallback;
   try{this.chart.setPointerCapture(e.pointerId);}catch{}
  });
  this.chart.addEventListener('pointermove',e=>{
   if(handleLabelOrPointMove(this.stageState,box,e))return;
   if(!this.drag)return;const rect=this.chart.getBoundingClientRect();if(!rect.width||!rect.height)return;
   let px=(e.clientX-rect.left)*840/rect.width,py=(e.clientY-rect.top)*420/rect.height;
   try{const ctm=this.chart.getScreenCTM?.();if(ctm&&typeof DOMPoint==='function'){const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform(ctm.inverse());px=pt.x;py=pt.y;}}catch{}
   if(this.drag==='R'){
    const rad=Math.hypot(px-this.view.x,py-this.view.y)/this.view.s;
    const key=this.modeId<='9-06-C03'?'r':'R';
    if(this.params[key]!==undefined)this.params[key]=Math.min(5,Math.max(.5,Math.round(rad*10)/10));
   }else if(this.drag==='r2'&&this.params.r!==undefined){
    const x2=this.view.x+this.params.d*this.view.s;
    const rad=Math.hypot(px-x2,py-this.view.y)/this.view.s;
    this.params.r=Math.min(5,Math.max(.5,Math.round(rad*10)/10));
   }else{
    const value=this.drag==='line'?Math.max(0,(this.view.y-py)/this.view.s):Math.max(0,(px-this.view.x)/this.view.s);
    this.params.d=Math.min(10,Math.round(value*10)/10);
   }
   this.sync();this.draw();});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])this.chart.addEventListener(event,e=>{stopLabelOrPointDrag(this.stageState,box,e);this.drag=false;});
  this.t=0;const initTraj=this._targetTrajectory();this.params.d=initTraj.start;this.sync();this.draw();scheduleLabAutoplay(this,{delay:90,reset:false});
 }
 setPlaying(v){if(!v)cancelLabAutoplay(this);this.playing=!!v;if(this.playing&&this.t>=6)this.t=0;if(this.playButton)this.playButton.textContent=this.playing?'⏸ Tạm dừng':'▶ Phát thay đổi vị trí';this.last=0;if(this.playing&&!this.raf)this.raf=requestAnimationFrame(now=>this.tick(now));}
 tick(now){this.raf=0;if(!this.playing)return;const dt=this.last?Math.min(.075,(now-this.last)/1000):.016;this.last=now;this.t=Math.min(6,this.t+dt);this.advance();if(this.t>=6){this.setPlaying(false);return;}this.raf=requestAnimationFrame(t=>this.tick(t));}
 advance(){
  const f=Math.max(0,Math.min(1,this.t/6)),traj=this._targetTrajectory();
  if(f<=0.55){const u=f/0.55;this.params.d=Number((traj.start+(traj.mid-traj.start)*u).toFixed(1));}
  else{const u=(f-0.55)/0.45;this.params.d=Number((traj.mid+(traj.end-traj.mid)*u).toFixed(1));}
  if(this.timeline)this.timeline.value=this.t;
  this.sync();this.draw();
 }
 destroy(){cancelLabAutoplay(this);this.destroyed=true;this.playing=false;if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;this.drag=false;}
 sync(){for(const [k,v] of this.controls){v.slide.value=this.params[k];v.value.textContent=round(this.params[k]);}}
 draw(){
  this.chart.replaceChildren();const {R,r,d}=this.params,isLine=this.modeId<='9-06-C03';
  const s=isLine?Math.min(38,150/Math.max(r,d,1)):Math.min(40,340/(R+d+r+1)),x=isLine?420:280,y=252;this.view={x,y,s};
  const result=isLine?lineCircleGeometry(r,d):twoCircleGeometry(R,r,d),matches=circleExpected(this.modeId,result.state);
  this.chart.append(tag('rect',{x:0,y:0,width:840,height:420,rx:16,fill:'#f8fafc',stroke:'#cbd5e1','stroke-width':1.5}));
  this.chart.append(tag('line',{x1:60,y1:y,x2:780,y2:y,stroke:'#94a3b8','stroke-width':1.8,'stroke-dasharray':'5 6'}));
  const radMain=(isLine?r:R)*s;
  // Đường tròn gốc (O₁, R): Xanh dương (#1D4ED8 / #DBEAFE)
  this.chart.append(tag('circle',{cx:x,cy:y,r:radMain,stroke:'#1D4ED8','stroke-width':3.8,fill:'#DBEAFE66'}));
  const label=(px,py,content,fill='#0F172A',sz=14.5,anchor='start')=>{const t=tag('text',{x:px,y:py,'font-size':sz,'font-weight':750,fill,'text-anchor':anchor,style:'paint-order:stroke;stroke:#ffffff;stroke-width:3.5px;stroke-linejoin:round'});t.textContent=content;this.chart.append(t);};
  const pill=(px,py,w,h,content,bg='#F8FAFC',bd='#CBD5E1',col='#0F172A')=>{
   this.chart.append(tag('rect',{x:px,y:py,width:w,height:h,rx:8,fill:bg,stroke:bd,'stroke-width':1.4}));
   label(px+w/2,py+h/2+4.5,content,col,12.5,'middle');
  };
  this.chart.append(tag('circle',{cx:x,cy:y,r:5.5,fill:'#1D4ED8'}));
  label(x-20,y+22,'O₁','#1D4ED8',14.5);
  const rx1=x-radMain*0.707,ry1=y+radMain*0.707;
  this.chart.append(tag('line',{x1:x,y1:y,x2:rx1,y2:ry1,stroke:'#1D4ED8','stroke-width':2.5,'stroke-dasharray':'4 3'}));
  const rGrip1=tag('circle',{cx:rx1,cy:ry1,r:7.5,fill:'#1D4ED8',stroke:'#fff','stroke-width':2.5});rGrip1.dataset.drag='R';rGrip1.style.cursor='grab';this.chart.append(rGrip1);
  label(x-radMain*0.5-26,y+radMain*0.45+16,(isLine?'R = '+round(r):'R = '+round(R)),'#1D4ED8',13.5);
  if(this.metrics)this.metrics.replaceChildren();
  if(isLine){
   const ly=y-d*s;
   // Bán kính/khoảng cách vuông góc OH: Tím (#6D28D9) khi tiếp xúc d=R, Cam (#B45309) khi đang đo
   const ohCol=result.state==='tangent'?'#6D28D9':'#B45309';
   this.chart.append(tag('line',{x1:x,y1:y,x2:x,y2:ly,stroke:ohCol,'stroke-width':3.2,'stroke-dasharray':result.state==='tangent'?'none':'5 4'}));
   if(d*s>10){
    const sq=11;
    this.chart.append(tag('polyline',{points:`${x},${ly+sq} ${x+sq},${ly+sq} ${x+sq},${ly}`,fill:'none',stroke:'#6D28D9','stroke-width':2.4}));
   }
   // Nếu d > R (9-06-C03), vẽ nổi bật khoảng hở ngắn nhất từ đỉnh đường tròn đến đường thẳng bằng màu cam (#B45309)
   if(d>r+1e-6){
    const topCircleY=y-radMain;
    this.chart.append(tag('line',{x1:x+26,y1:topCircleY,x2:x+26,y2:ly,stroke:'#B45309','stroke-width':3.5}));
    label(x+36,(topCircleY+ly)/2+4,`Khe hở Δ = d − R = ${round(d-r)}`,'#B45309',12.5);
   }
   // Nếu d < R (9-06-C01), vẽ hai đoạn HA = HB = sqrt(R² - d²) và hai bán kính OA, OB tạo tam giác vuông OHA
   if(result.state==='secant'&&result.intersections.length===2){
    const halfChord=Math.sqrt(Math.max(0,r*r-d*d));
    const ax=x-halfChord*s,bx=x+halfChord*s;
    this.chart.append(tag('line',{x1:x,y1:y,x2:bx,y2:ly,stroke:'#1D4ED8','stroke-width':2.2,'stroke-dasharray':'4 3'}));
    this.chart.append(tag('line',{x1:ax,y1:ly,x2:bx,y2:ly,stroke:'#6D28D9','stroke-width':4.2}));
    label(x+halfChord*s*0.5,ly-10,`HB = √(R²−d²) = ${round(halfChord)}`,'#6D28D9',12.5,'middle');
   }
   const lineCol=this.modeId==='9-06-C01'?'#15803D':this.modeId==='9-06-C02'?'#B45309':result.state==='disjoint'?'#475569':'#15803D';
   const line=tag('line',{x1:120,y1:ly,x2:720,y2:ly,stroke:lineCol,'stroke-width':4.5});line.dataset.drag='line';line.style.cursor='ns-resize';this.chart.append(line);
   const hDot=tag('circle',{cx:x,cy:ly,r:7.5,fill:ohCol,stroke:'#fff','stroke-width':2});hDot.dataset.drag='line';hDot.style.cursor='ns-resize';this.chart.append(hDot);
   if(result.state!=='tangent')label(x-22,ly-10,'H',ohCol,14);
   label(x-14,(y+ly)/2+5,'d = '+round(d),ohCol,13.5,'end');
   label(705,ly-10,'a',lineCol,16);
   const cmp=Math.abs(d-r)<1e-6?'d = R (Tiếp xúc: 1 tiếp điểm T, OT ⊥ a)':d<r?`d < R (Cắt nhau: 2 giao điểm A, B; HA = HB = ${round(Math.sqrt(Math.max(0,r*r-d*d)))})`:'d > R (Ngoài nhau: 0 giao điểm)';
   pill(24,18,460,30,cmp,result.state==='tangent'?'#EDE9FE':d<r?'#DCFCE7':'#FEF3C7',result.state==='tangent'?'#6D28D9':d<r?'#15803D':'#B45309',result.state==='tangent'?'#6D28D9':d<r?'#166534':'#92400E');
   if(this.metrics){
    for(const txt of [`${this.modeId} • Đường thẳng & đường tròn`,`d = O₁H = ${round(d)} | R = ${round(r)}`,cmp,`Số giao điểm: ${result.intersections.length}`])this.metrics.append(el('div',txt,'mv-r5-value'));
   }
  }else{
   const x2=x+d*s,isCoincident=result.state==='coincident';
   // Đường tròn thứ hai (O₂, r): Xanh lá (#15803D / #DCFCE7); nếu trùng nhau vẽ nét đứt để thấy cả 2 đường tròn chồng khít
   this.chart.append(tag('circle',{cx:x2,cy:y,r:r*s,stroke:'#15803D','stroke-width':3.8,'stroke-dasharray':isCoincident?'9 6':'none',fill:'#DCFCE755'}));
   // Đoạn nối tâm O₁O₂: Cam (#B45309)
   this.chart.append(tag('line',{x1:x,y1:y,x2:x2,y2:y,stroke:'#B45309','stroke-width':3.2}));
   // Dây cung chung AB khi cắt nhau (9-06-C04)
   if(result.state==='intersect'&&result.intersections.length===2){
    const pA=result.intersections[0],pB=result.intersections[1];
    this.chart.append(tag('line',{x1:x+pA[0]*s,y1:y-pA[1]*s,x2:x+pB[0]*s,y2:y-pB[1]*s,stroke:'#6D28D9','stroke-width':2.6,'stroke-dasharray':'5 3'}));
   }
   const rx2=x2+r*s*0.707,ry2=y+r*s*0.707;
   this.chart.append(tag('line',{x1:x2,y1:y,x2:rx2,y2:ry2,stroke:'#15803D','stroke-width':2.5,'stroke-dasharray':'4 3'}));
   const rGrip2=tag('circle',{cx:rx2,cy:ry2,r:7.5,fill:'#15803D',stroke:'#fff','stroke-width':2.5});rGrip2.dataset.drag='r2';rGrip2.style.cursor='grab';this.chart.append(rGrip2);
   label(x2+r*s*0.35+6,y+r*s*0.45+16,'r = '+round(r),'#15803D',13.5);
   const grip=tag('circle',{cx:x2,cy:y,r:9.5,fill:'#B45309',stroke:'white','stroke-width':2.8});grip.dataset.drag='circle';grip.style.cursor='ew-resize';this.chart.append(grip);
   label(x2+10,y+28,isCoincident?'O₁ ≡ O₂':'O₂','#B45309',14.5);
   if(d>0.1)label((x+x2)/2,y-12,'d = O₁O₂ = '+round(d),'#B45309',13.5,'middle');
   const relTxt=isCoincident?'d = 0, R = r ⇒ Trùng nhau (vô số điểm chung)':result.state==='externally_tangent'?`d = R + r = ${round(R+r)} ⇒ Tiếp xúc ngoài (1 tiếp điểm)`:result.state==='internally_tangent'?`d = |R − r| = ${round(Math.abs(R-r))} ⇒ Tiếp xúc trong (1 tiếp điểm)`:result.state==='intersect'?`|R−r| = ${round(Math.abs(R-r))} < d = ${round(d)} < R+r = ${round(R+r)} ⇒ Cắt nhau (2 điểm)`:result.state==='separate'?`d = ${round(d)} > R + r = ${round(R+r)} ⇒ Ngoài nhau (0 điểm)`:`d = ${round(d)} < |R − r| = ${round(Math.abs(R-r))} ⇒ Đựng nhau (0 điểm)`;
   pill(24,18,540,30,relTxt,'#EDE9FE','#6D28D9','#6D28D9');
   if(this.metrics){
    for(const txt of [`${this.modeId} • Hai đường tròn`,`d = ${round(d)} | R+r = ${round(R+r)} | |R−r| = ${round(Math.abs(R-r))}`,`Vị trí: ${CIRCLE_LABELS[result.state]}`,`Số giao điểm: ${result.state==='coincident'?'Vô số (trùng)':result.intersections.length}`])this.metrics.append(el('div',txt,'mv-r5-value'));
   }
  }
  for(const [ix,p] of result.intersections.entries()){
   const px=x+p[0]*s,py=y-p[1]*s;
   const isTangentPt=result.intersections.length===1;
   const ptCol=isTangentPt&&this.modeId==='9-06-C05'?'#B45309':'#6D28D9';
   this.chart.append(tag('circle',{cx:px,cy:py,r:11,fill:ptCol+'28',stroke:ptCol,'stroke-width':1.6}));
   this.chart.append(tag('circle',{cx:px,cy:py,r:6.8,fill:ptCol,stroke:'#fff','stroke-width':2.2}));
   label(px+12,py+(ix===0?-10:18),isTangentPt?'T':ix===0?'A':'B',ptCol,15.5);
  }
  if(this.box)decorateInteractiveSVG(this.box,this.stageState);
  this.state.className='mv-r5-triangle-status '+(matches?'valid':'invalid');
  const plan=getGuidedDiscoveryPlan(this.modeId);
  this.state.textContent=`${matches?'✓':'!'} ${CIRCLE_LABELS[result.state]} · ${matches?'Đúng điều kiện đang xét':'Đã chuyển sang trường hợp khác'}. ${result.intersections.length} giao điểm phân biệt${result.state==='coincident'?' (trùng nhau: vô số điểm chung)':''}.${plan?.takeaway?` · Kết luận: ${plan.takeaway}`:''}`;
 }
}
