import {graphDefaults,graphParamSchema,graphExperiment,isGraphCase} from './graph-models.mjs?v=r107_v15';
import {GRADE10_EXPLORE_DATA} from './grade10-engine.mjs?v=r107_v15';
import {mountRenderedFormula,formatMathText} from './math-formula-renderer.mjs?v=r107_v15';
import {getGuidedDiscoveryPlan} from './guided-discovery.mjs?v=r107_v15';
import {createStageInteractivity,decorateInteractiveSVG,tryStartLabelOrPointDrag,handleLabelOrPointMove,stopLabelOrPointDrag,bindFrameWheelZoom,resetStageInteractivity} from './svg-stage-interactivity.mjs?v=r107_v15';
import {scheduleLabAutoplay,cancelLabAutoplay,isAutoPlayEnabled,setAutoPlayEnabled} from './lab-autoplay.mjs?v=r107_v15';
const NS='http://www.w3.org/2000/svg';
const svgEl=(name,props={})=>{const e=document.createElementNS(NS,name);for(const [k,v] of Object.entries(props))e.setAttribute(k,String(v));return e;};
const node=(n,cls,text)=>{const e=document.createElement(n);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const fmt=x=>Number(x).toLocaleString('vi-VN',{maximumFractionDigits:2});
const short=(s,max=43)=>String(s).length>max?String(s).slice(0,max-1)+'…':String(s);
function effectiveDomain(model, box={left:416,right:924,top:90,bottom:458}){
 const [xmin0,xmax0]=model.domain, [ymin,ymax]=model.range;
 const spanX=xmax0-xmin0, spanY=ymax-ymin;
 if(Math.abs(spanX-spanY)<=1.5){
  const targetSpanX=spanY*(box.right-box.left)/(box.bottom-box.top);
  const midX=0.5*(xmin0+xmax0);
  return [midX-0.5*targetSpanX, midX+0.5*targetSpanX];
 }
 return [xmin0,xmax0];
}
export class FunctionGraphLab{
 mount(host,id,mode){this.playing=false;this.t=0;this.raf=0;this.last=0;this.showAux=true;this.lastValidParams=null;this.labelOffsets=new Map();this.stageState=createStageInteractivity();if(!isGraphCase(id))throw Error('Đồ thị chưa dựng');this.id=id;this.mode=mode;this.params=graphDefaults(id);this.lastValidParams={...this.params};this.host=host;host.replaceChildren();
  host.append(node('p','mv-r5-statement',mode?.student_interaction||'Khảo sát đồ thị hàm số tương tác'));
  const pane=node('div','mv-r5-viewbox');this.pane=pane;this.svg=svgEl('svg',{viewBox:'394 70 550 412',preserveAspectRatio:'xMidYMid meet',role:'img','aria-label':'Đồ thị Toán học có thay đổi tham số'});this.svg.style.touchAction='none';this.svg.style.cursor='crosshair';pane.append(this.svg);host.append(pane);
  this.bindPointer();
  this.metrics=node('div','mv-r5-values');host.append(this.metrics);
  this.summary=node('p','mv-r5-triangle-status');this.summary.setAttribute('aria-live','polite');host.append(this.summary);
  const grp=node('div','mv-r5-params');this.fields=new Map();for(const spec of graphParamSchema(id)){
   const label=node('label','mv-r5-param'),caption=node('span','mv-r5-param-label',formatMathText(spec.label)),val=node('output','',fmt(this.params[spec.key]));const range=node('input');range.type='range';range.min=spec.min;range.max=spec.max;range.step=spec.step;range.value=this.params[spec.key];range.addEventListener('input',()=>{this.params[spec.key]=Number(range.value);val.textContent=fmt(this.params[spec.key]);this.draw();});label.append(caption,val,range);grp.append(label);this.fields.set(spec.key,{range,val});}
  host.append(grp);
  const timelineLabel=node('label','mv-r5-param','Điểm khảo sát chạy trên đồ thị (0–6 s)');this.timeline=node('input');this.timeline.type='range';this.timeline.min=0;this.timeline.max=6;this.timeline.step='.05';this.timeline.value=0;this.timeline.addEventListener('input',()=>{this.setPlaying(false);this.t=Number(this.timeline.value);this.draw();});timelineLabel.append(this.timeline);host.append(timelineLabel);
  const row=node('div','mv-r5-stage-actions');this.playBtn=node('button','mv-r5-action','▶ Phát chuyển động (6s)');this.playBtn.type='button';this.playBtn.addEventListener('click',()=>this.setPlaying(!this.playing));row.append(this.playBtn);
  const prevStep=node('button','mv-r5-action','⏮ Bước trước');prevStep.type='button';prevStep.addEventListener('click',()=>{this.setPlaying(false);this.t=Math.max(0,this.t-1.5);this.draw();});row.append(prevStep);
  const step=node('button','mv-r5-action','⏭ Tiếp bước pha');step.type='button';step.addEventListener('click',()=>{this.setPlaying(false);this.t=Math.min(6,this.t+1.5);this.draw();});row.append(step);
  const auxBtn=node('button','mv-r5-action','📐 Lớp phụ trợ: Bật');auxBtn.type='button';auxBtn.addEventListener('click',()=>{this.showAux=!this.showAux;auxBtn.textContent=this.showAux?'📐 Lớp phụ trợ: Bật':'📐 Lớp phụ trợ: Tắt';this.draw();});row.append(auxBtn);
  const reset=node('button','mv-r5-action','↺ Đặt lại');reset.type='button';reset.addEventListener('click',()=>{this.setPlaying(false);this.t=0;this.labelOffsets.clear();resetStageInteractivity(this.stageState);this.params=graphDefaults(id);this.lastValidParams={...this.params};for(const [key,f] of this.fields){f.range.value=this.params[key];f.val.textContent=fmt(this.params[key]);}this.draw();});row.append(reset);
  for(const pct of [0,33,50,66,100]){const b=node('button','mv-r5-action',`${pct}%`);b.type='button';b.addEventListener('click',()=>this.setProgress(pct));row.append(b);}
  const autoBtn=node('button','mv-r5-action',isAutoPlayEnabled(this)?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt');autoBtn.type='button';autoBtn.addEventListener('click',()=>{const next=setAutoPlayEnabled(this,!isAutoPlayEnabled(this));autoBtn.textContent=next?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt';});row.append(autoBtn);
  host.append(row);
  const expData=GRADE10_EXPLORE_DATA[id];
  if(expData){
   const expBox=node('div','mv-r5-explore');
   expBox.style.cssText='margin-top:8px;padding:10px 12px;border-radius:10px;background:#f2f8fc;border:1px solid #c5dfee;font-size:13px;color:#123b52;';
   const qTitle=node('strong','','🔍 Hoạt động khám phá (1–2 phút): ');
   const qText=node('span','',formatMathText(expData.question));
   const presetRow=node('div','mv-r5-stage-actions');presetRow.style.marginTop='6px';
   for(const preset of expData.presets||[]){
    const pBtn=node('button','mv-r5-action',formatMathText(preset.label));pBtn.type='button';
    pBtn.addEventListener('click',()=>{
     this.setPlaying(false);this.t=0;this.params={...this.params,...preset.params};
     for(const [key,f] of this.fields)if(this.params[key]!==undefined){f.range.value=this.params[key];f.val.textContent=fmt(this.params[key]);}
     this.draw();
    });
    presetRow.append(pBtn);
   }
   const ansEl=node('p','mv-r5-exp-answer',formatMathText(`💡 Giải thích: ${expData.explanation}`));
   ansEl.style.cssText='display:none;margin:8px 0 0;padding:8px 10px;background:#e6f6f0;border-left:3px solid #12876f;border-radius:6px;color:#0d4f3f;font-weight:600;';
   const explainBtn=node('button','mv-r5-action','💡 Hiện giải thích');explainBtn.type='button';
   explainBtn.addEventListener('click',()=>{const open=ansEl.style.display==='none';ansEl.style.display=open?'block':'none';explainBtn.textContent=open?'🙈 Ẩn giải thích':'💡 Hiện giải thích';});
   presetRow.append(explainBtn);
   expBox.append(qTitle,qText,presetRow,ansEl);
   host.append(expBox);
  }
  this.latex=node('div','mv-r5-latex');const cp=node('button','mv-r5-copy','📋 Sao chép LaTeX');cp.type='button';cp.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(this.latex.dataset.rawLatex||this.latex.textContent);cp.textContent='✓ Đã sao chép';}catch{cp.textContent='Bôi đen công thức để sao chép';}});host.append(cp,this.latex,node('p','mv-r5-hint','👆 Kéo điểm M để trượt trên đồ thị; kéo trực tiếp các nhãn chữ (I, A, B, M, Trục ĐX...) để dời nhãn tránh khỏi đường cong.',''));
  this.t=0;this.draw();scheduleLabAutoplay(this,{delay:90,reset:false});
 }
 _svgPoint(e){
  const rect=this.svg?.getBoundingClientRect();
  if(!rect?.width||!rect?.height)return null;
  let px=394+(e.clientX-rect.left)*550/rect.width,py=70+(e.clientY-rect.top)*412/rect.height;
  try{const ctm=this.svg.getScreenCTM?.();if(ctm&&typeof DOMPoint==='function'){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(ctm.inverse());px=p.x;py=p.y;}}catch{}
  return [px,py];
 }
 bindPointer(){
  this.dragging=null;
  bindFrameWheelZoom(this.stageState,this.pane,(t,ev,fn)=>t.addEventListener(ev,fn));
  const clampKey=(k,v)=>{const f=this.fields?.get(k);if(!f?.range||!Number.isFinite(v))return v;const min=Number(f.range.min),max=Number(f.range.max),step=Number(f.range.step)||.1;return Math.min(max,Math.max(min,Math.round(v/step)*step));};
  const syncSliders=()=>{for(const [key,f] of this.fields)if(this.params[key]!==undefined){f.range.value=this.params[key];f.val.textContent=fmt(this.params[key]);}};
  const scrubFromEvent=e=>{
   const pt=this._svgPoint(e);if(!pt)return;
   const [px,py]=pt;
   if(this.dragging&&this.dragging.type==='label'){
    const nx=this.dragging.ox+(px-this.dragging.sx),ny=this.dragging.oy+(py-this.dragging.sy);
    this.labelOffsets.set(this.dragging.key,[nx,ny]);
    const gEl=this.svg.querySelector(`[data-drag-label="${this.dragging.key}"]`);
    if(gEl)gEl.setAttribute('transform',`translate(${nx.toFixed(1)}, ${ny.toFixed(1)})`);
    return;
   }
   if(this.dragging&&this.dragging.type==='handle'){
    const model=graphExperiment(this.id,this.params);
    const [xmin,xmax]=effectiveDomain(model),[ymin,ymax]=model.range;
    const xVal=xmin+(px-416)/(924-416)*(xmax-xmin),yVal=ymin+(458-py)/(458-90)*(ymax-ymin);
    const hKey=this.dragging.key;
    if(hKey==='vertex-I'&&this.id.startsWith('10-06-')&&this.params.a){
     this.params.b=clampKey('b',-2*this.params.a*xVal);
     this.params.c=clampKey('c',yVal+this.params.a*xVal*xVal);
     syncSliders();this.draw();return;
    }
    if(hKey==='x0'&&this.params.x0!==undefined){
     this.params.x0=clampKey('x0',xVal);syncSliders();this.draw();return;
    }
    if(this.fields.has(hKey)){
     this.params[hKey]=clampKey(hKey,xVal);syncSliders();this.draw();return;
    }
   }
   const frac=Math.max(0,Math.min(1,(px-416)/(922-416)));
   const norm=Math.max(0,Math.min(1,(frac-.08)/.84));
   this.t=Number((norm*6).toFixed(3));
   this.draw();
  };
  this.svg.addEventListener('pointerdown',e=>{
   this.setPlaying(false);
   const hEl=e.target?.closest?.('[data-handle]');
   if(hEl&&hEl.getAttribute('data-handle')!=='cursor'){
    this.dragging={type:'handle',key:hEl.getAttribute('data-handle')};
    try{this.svg.setPointerCapture(e.pointerId);}catch{}
    scrubFromEvent(e);e.preventDefault();return;
   }
   const lblEl=e.target?.closest?.('[data-drag-label]');
   if(lblEl){
    const key=lblEl.getAttribute('data-drag-label'),pt=this._svgPoint(e)||[0,0],cur=this.labelOffsets.get(key)||[0,0];
    this.dragging={type:'label',key,sx:pt[0],sy:pt[1],ox:cur[0],oy:cur[1]};
    try{this.svg.setPointerCapture(e.pointerId);}catch{}
    e.preventDefault();return;
   }
   if(!hEl&&tryStartLabelOrPointDrag(this.stageState,this.pane,e))return;
   this.dragging={type:'scrub'};
   try{this.svg.setPointerCapture(e.pointerId);}catch{}
   scrubFromEvent(e);e.preventDefault();
  });
  this.svg.addEventListener('pointermove',e=>{
   if(handleLabelOrPointMove(this.stageState,this.pane,e))return;
   if(!this.dragging)return;
   scrubFromEvent(e);e.preventDefault();
  });
  for(const ev of ['pointerup','pointercancel','lostpointercapture']){
   this.svg.addEventListener(ev,e=>{stopLabelOrPointDrag(this.stageState,this.pane,e);this.dragging=null;});
  }
 }
 setPlaying(v){if(!v)cancelLabAutoplay(this);this.playing=!!v;if(this.playing&&this.t>=6)this.t=0;if(this.playBtn)this.playBtn.textContent=v?'⏸ Tạm dừng':'▶ Phát chuyển động';this.last=0;if(this.playing&&!this.raf)this.raf=requestAnimationFrame(n=>this.tick(n));}
 setProgress(pct){
  this.setPlaying(false);
  const f=Math.max(0,Math.min(1,Number(pct)/100));
  this.t=Number((f*6).toFixed(3));
  if(this.timeline)this.timeline.value=this.t;
  this.draw();
 }
 tick(now){this.raf=0;if(!this.playing)return;const dt=this.last?Math.min(.08,(now-this.last)/1000):.016;this.last=now;this.t=Math.min(6,this.t+dt);this.draw();if(this.t>=6){this.setPlaying(false);return;}this.raf=requestAnimationFrame(n=>this.tick(n));}
 destroy(){cancelLabAutoplay(this);this.destroyed=true;this.playing=false;this.dragging=false;if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;}
 draw(){
  const rawModel=graphExperiment(this.id,this.params),plan=getGuidedDiscoveryPlan(this.id,this.mode);
  if(rawModel.check)this.lastValidParams={...this.params};
  const renderParams=(!rawModel.check&&this.id.startsWith('10-06-')&&this.lastValidParams)?this.lastValidParams:this.params;
  const model=(!rawModel.check&&this.id.startsWith('10-06-')&&this.lastValidParams)?graphExperiment(this.id,renderParams):rawModel;
  this.summary.className='mv-r5-triangle-status '+(rawModel.check?'valid':'invalid');
  this.summary.textContent=formatMathText((rawModel.check?'✓ ':'⚠ ')+rawModel.summary+(rawModel.check&&plan?.takeaway?` · Kết luận: ${plan.takeaway}`:''));
  mountRenderedFormula(this.latex,model.latex);
  const svg=this.svg;svg.replaceChildren();
  const defs=svgEl('defs');
  const cardClip=svgEl('clipPath',{id:'fg-card-clip'});cardClip.append(svgEl('rect',{x:24,y:78,width:358,height:196,rx:12}));
  const footClip=svgEl('clipPath',{id:'fg-foot-clip'});footClip.append(svgEl('rect',{x:24,y:292,width:358,height:52,rx:8}));
  defs.append(cardClip,footClip);svg.append(defs);
  const desc=svgEl('desc');desc.textContent=`1. Quan sát: Đồ thị, giao điểm, cực trị, tiệm cận | 2. Tương quan: Đổi hệ số thấy độ dốc biến thiên | 3. KẾT LUẬN SGK: ${model.summary}`;svg.append(desc);
  const box={left:416,right:924,top:90,bottom:458};
  const [xmin,xmax]=effectiveDomain(model,box),[ymin,ymax]=model.range;
  const sx=x=>box.left+(x-xmin)/(xmax-xmin)*(box.right-box.left),sy=y=>box.bottom-(y-ymin)/(ymax-ymin)*(box.bottom-box.top);
  const addTxt=(x,y,t,color='#163a4f',size=12.5,anchor='start',weight=700,parent=svg,dragKey='')=>{
   const props={x,y,'font-size':size,'font-weight':weight,fill:color,'text-anchor':anchor,'font-family':'Inter,Segoe UI,Arial,sans-serif'};
   if(parent===svg)props.style='paint-order:stroke;stroke:#ffffff;stroke-width:3.8px;stroke-linejoin:round;';
   const e=svgEl('text',props);e.textContent=t;
   if(dragKey){
    const g=svgEl('g',{'data-drag-label':dragKey,style:'cursor:grab'});
    const off=this.labelOffsets.get(dragKey);
    if(off&&(off[0]!==0||off[1]!==0))g.setAttribute('transform',`translate(${off[0].toFixed(1)}, ${off[1].toFixed(1)})`);
    g.append(e);parent.append(g);return;
   }
   parent.append(e);
  };
  const addPill=(x,y,w,h,t,bg='#eef7fb',bd='#bdd9e7',col='#124e68',sz=11,parent=svg,dragKey='')=>{
   const target=dragKey?svgEl('g',{'data-drag-label':dragKey,style:'cursor:grab'}):parent;
   if(dragKey){
    const off=this.labelOffsets.get(dragKey);
    if(off&&(off[0]!==0||off[1]!==0))target.setAttribute('transform',`translate(${off[0].toFixed(1)}, ${off[1].toFixed(1)})`);
    parent.append(target);
   }
   target.append(svgEl('rect',{x,y,width:w,height:h,rx:7,fill:bg,stroke:bd,'stroke-width':1.3}));
   addTxt(x+w/2,y+h/2+4,t,col,sz,'middle',750,target);
  };
  const hiddenChrome=svgEl('g',{opacity:'0','pointer-events':'none'});svg.append(hiddenChrome);
  hiddenChrome.append(svgEl('rect',{x:10,y:10,width:940,height:480,rx:18,fill:'#ffffff',stroke:'#d5e5ef','stroke-width':1.5}));
  hiddenChrome.append(svgEl('rect',{x:20,y:18,width:920,height:46,rx:12,fill:'#eef6fb',stroke:'#c8dfec','stroke-width':1.4}));
  addTxt(36,46,`${this.id} • ${this.mode?.title||'Khảo sát và biểu diễn đồ thị hàm số'}`,'#0e435c',16.2,'start',800,hiddenChrome);
  addPill(748,28,178,26,'SGK Chuẩn • Đồ thị tương tác','#0c7da0','#0c7da0','#fff',11,hiddenChrome);
  // Compact Left Formula Card (hidden inside SVG, rendered below in HTML)
  hiddenChrome.append(svgEl('rect',{x:20,y:74,width:368,height:204,rx:14,fill:'#f8fcfe',stroke:'#c5dfec','stroke-width':1.5}));
  const cardG=svgEl('g',{'clip-path':'url(#fg-card-clip)'});hiddenChrome.append(cardG);
  cardG.append(svgEl('rect',{x:32,y:86,width:344,height:28,rx:8,fill:'#e6f4fa'}));
  addTxt(44,105,'Hàm số & Tiếp tuyến','#0f4963',13,'start',800,cardG);
  // Right Graph Stage
  svg.append(svgEl('rect',{x:398,y:74,width:542,height:404,rx:14,fill:'#ffffff',stroke:'#cde2ee','stroke-width':1.5}));
  const stepX=xmax-xmin>11?Math.PI:1;
  for(let x=Math.ceil(xmin/stepX)*stepX;x<=xmax;x+=stepX){
   const xx=sx(x);svg.append(svgEl('line',{x1:xx,y1:box.top,x2:xx,y2:box.bottom,stroke:'#e5eff5','stroke-width':1}));
   if(Math.abs(x)>1e-4)addTxt(xx,Math.min(box.bottom+14,Math.max(box.top+14,sy(0)+14)),stepX===Math.PI?`${Math.round(x/Math.PI)}π`:fmt(x),'#68879b',10,'middle',600);
  }
  for(let y=Math.ceil(ymin);y<=ymax;y++){
   const yy=sy(y);svg.append(svgEl('line',{x1:box.left,y1:yy,x2:box.right,y2:yy,stroke:'#e5eff5','stroke-width':1}));
   if(y!==0&&y%2===0)addTxt(Math.max(box.left+16,Math.min(box.right-16,sx(0)-8)),yy+4,fmt(y),'#68879b',10,'end',600);
  }
  const y0Axis=sy(Math.max(ymin,Math.min(ymax,0))),x0Axis=sx(Math.max(xmin,Math.min(xmax,0)));
  svg.append(svgEl('line',{x1:box.left,y1:y0Axis,x2:box.right,y2:y0Axis,stroke:'#3b6982','stroke-width':1.8}));
  svg.append(svgEl('line',{x1:x0Axis,y1:box.top,x2:x0Axis,y2:box.bottom,stroke:'#3b6982','stroke-width':1.8}));
  addTxt(box.right-8,y0Axis-8,'x','#234f68',12.5,'end',800);
  addTxt(x0Axis+8,box.top+14,'y','#234f68',12.5,'start',800);
  const isG11=this.id.startsWith('11-'),isG12=this.id.startsWith('12-');
  const uTime=Math.min(1,Math.max(0,this.t/6));
  const prog=Math.min(1,Math.max(0.08,uTime));
  if(model.shading){
   const z=model.shading,{from,to,n,low,high}=z,span=to-from,activeTo=from+span*prog,dx=(activeTo-from)/n;
   const fillCol=isG12?'rgba(124,58,237,0.22)':'#12876f38',strokeCol=isG12?'#7C3AED':'#12876f';
   for(let j=0;j<n;j++){const mid=from+(j+.5)*dx,upper=high(mid),lower=low(mid);
    svg.append(svgEl('rect',{x:sx(from+j*dx),y:sy(Math.max(upper,lower)),width:Math.max(1,sx(from+(j+1)*dx)-sx(from+j*dx)),height:Math.abs(sy(lower)-sy(upper)),fill:fillCol,stroke:strokeCol,'stroke-width':1.1}));
   }
   svg.append(svgEl('line',{x1:sx(activeTo),y1:box.top,x2:sx(activeTo),y2:box.bottom,stroke:isG12?'#C2410C':'#12876f','stroke-width':2.2,'stroke-dasharray':'4 3'}));
  }
  for(const [aIdx,asym] of model.asymptotes.entries()){
   const vCol=(isG11||isG12)?'#B91C1C':'#d9742b',hCol=(isG11||isG12)?'#15803D':'#d9742b',oCol=isG12?'#15803D':'#d9742b';
   if(asym.type==='vertical'){const x=sx(asym.value);if(Number.isFinite(x)&&x>=box.left&&x<=box.right){svg.append(svgEl('line',{x1:x,y1:box.top,x2:x,y2:box.bottom,stroke:vCol,'stroke-width':2.2,'stroke-dasharray':'6 4'}));addTxt(x+6,box.top+16,'TCĐ',vCol,10,'start',800,svg,`asym-${aIdx}`);}}
   else if(asym.type==='horizontal'){const y=sy(asym.value);if(Number.isFinite(y)&&y>=box.top&&y<=box.bottom){svg.append(svgEl('line',{x1:box.left,y1:y,x2:box.right,y2:y,stroke:hCol,'stroke-width':2.0,'stroke-dasharray':'6 4'}));addTxt(box.left+8,y-6,'TCN',hCol,10,'start',800,svg,`asym-${aIdx}`);}}
   else if(asym.type==='oblique'){svg.append(svgEl('line',{x1:sx(xmin),y1:sy(asym.slope*xmin+asym.offset),x2:sx(xmax),y2:sy(asym.slope*xmax+asym.offset),stroke:oCol,'stroke-width':2.2,'stroke-dasharray':'6 4'}));addTxt(box.right-10,Math.max(box.top+16,Math.min(box.bottom-8,sy(asym.slope*xmax+asym.offset)-6)),'TCX',oCol,10,'end',800,svg,`asym-${aIdx}`);}
  }
  if(this.id==='10-06-C03'&&model.series[0]){
   const fn0=model.series[0].evaluate;
   for(let i=0;i<120;i++){
    const x1=xmin+(xmax-xmin)*i/120,x2=xmin+(xmax-xmin)*(i+1)/120,ym=fn0((x1+x2)/2);
    if(!Number.isFinite(ym))continue;
    svg.append(svgEl('line',{x1:sx(x1),y1:y0Axis,x2:sx(x2),y2:y0Axis,stroke:ym>=0?'#15803D':'#B91C1C','stroke-width':5,'stroke-opacity':0.65}));
   }
  }
  if(this.id.startsWith('10-06-')&&renderParams.a&&this.showAux!==false){
   const xv=-renderParams.b/(2*renderParams.a),yv=renderParams.a*xv*xv+renderParams.b*xv+renderParams.c,delta=renderParams.b*renderParams.b-4*renderParams.a*renderParams.c;
   if(xv>=xmin&&xv<=xmax){
    svg.append(svgEl('line',{x1:sx(xv),y1:box.top,x2:sx(xv),y2:box.bottom,stroke:'#475569','stroke-width':2.2,'stroke-dasharray':'6 4'}));
    addPill(414,80,126,20,`Trục ĐX: x = ${fmt(xv)}`,'#F1F5F9','#475569','#475569',9.6,svg,'axis-sym');
   }
   if(this.id==='10-06-C02'&&yv>=ymin&&yv<=ymax){
    svg.append(svgEl('line',{x1:box.left,y1:sy(yv),x2:box.right,y2:sy(yv),stroke:'#6D28D9','stroke-width':1.8,'stroke-dasharray':'5 4'}));
   }
   // Visual Δ = b² - 4ac meter & vertex I(xv, yv) badge placed in top-right corner away from curves
   const dCol=delta>1e-8?'#6D28D9':Math.abs(delta)<=1e-8?'#6D28D9':'#B91C1C';
   const dState=delta>1e-8?'2 giao điểm Ox':Math.abs(delta)<=1e-8?'1 điểm tiếp xúc':'0 giao điểm Ox';
   addPill(666,80,262,20,`Δ = ${fmt(delta)} (${dState})`,delta>=0?'#EDE9FE':'#FEF2F2',dCol,dCol,9.6,svg,'delta-badge');
   if(this.id==='10-06-C03'&&delta>1e-8){
    const r1=(-renderParams.b-Math.sqrt(delta))/(2*renderParams.a),r2=(-renderParams.b+Math.sqrt(delta))/(2*renderParams.a);
    const sx1=sx(Math.min(r1,r2)),sx2=sx(Math.max(r1,r2));
    if(sx1>=box.left&&sx2<=box.right){
     svg.append(svgEl('line',{x1:sx1,y1:y0Axis-14,x2:sx2,y2:y0Axis-14,stroke:'#6D28D9','stroke-width':2,'stroke-dasharray':'3 2'}));
     addTxt((sx1+sx2)/2,y0Axis-18,`Đối xứng qua x = ${fmt(xv)}`,'#6D28D9',9.5,'middle',800,svg,'sym-span');
    }
   }
   if(this.t>=0){
    const ph=Math.min(1,Math.max(0,(this.t%6.0001)/6)),pIdx=ph<=0.20?1:ph<=0.45?2:ph<=0.75?3:4;
    const pNotes=this.id==='10-06-C01'?[
     'Pha 1: a > 0 → Parabol mở bề lõm lên, đáy cực tiểu tại đỉnh I',
     `Pha 2: Gương trục đối xứng x = −b/(2a) = ${fmt(xv)} đi qua đỉnh I`,
     `Pha 3: Trượt xuống nghịch biến (−∞; ${fmt(xv)}) → Trượt lên đồng biến (${fmt(xv)}; +∞)`,
     'Pha 4: Thanh ngang nối cặp điểm M ↔ M\' luôn nhận trục ĐX làm trung trực'
    ]:this.id==='10-06-C02'?[
     'Pha 1: a < 0 → Parabol úp bề lõm xuống, đỉnh cực đại tại I',
     `Pha 2: Đỉnh vòm I(${fmt(xv)}; ${fmt(yv)}) và trục đối xứng x = ${fmt(xv)}`,
     `Pha 3: Trượt lên đồng biến (−∞; ${fmt(xv)}) → Trượt xuống nghịch biến (${fmt(xv)}; +∞)`,
     `Pha 4: Nâng hạ c dịch chuyển tịnh tiến vòm Parabol và GTLN y_max = ${fmt(yv)}`
    ]:[
     `Pha 1: Thước đo biệt thức Δ = b² − 4ac = ${fmt(delta)}`,
     `Pha 2: Trục đối xứng x = −b/(2a) = ${fmt(xv)} chia đôi khoảng cách 2 nghiệm`,
     delta>1e-8?'Pha 3: Δ > 0 ⇒ Cắt trục hoành Ox tại 2 giao điểm phân biệt x₁, x₂':Math.abs(delta)<=1e-8?'Pha 3: Δ = 0 ⇒ Hai nghiệm chập lại tiếp xúc Ox tại đỉnh I':'Pha 3: Δ < 0 ⇒ Parabol tách khỏi trục Ox (vô nghiệm thực)',
     'Pha 4: Dải màu dấu tam thức f(x) > 0 (xanh) và f(x) < 0 (đỏ) trên Ox'
    ];
    addPill(414,box.bottom-6,360,22,pNotes[pIdx-1],'#fff4eb','#f3c299','#b84a18',9.1,svg,'phase-note');
   }
  }
  if(this.id==='11-11-C03'){
   svg.append(svgEl('line',{x1:sx(Math.max(xmin,ymin)),y1:sy(Math.max(xmin,ymin)),x2:sx(Math.min(xmax,ymax)),y2:sy(Math.min(xmax,ymax)),stroke:'#64748B','stroke-width':1.8,'stroke-dasharray':'6 4'}));
  }
  if((this.id==='11-02-C01'||this.id==='11-02-C02')&&this.showAux!==false){
   const A=Math.abs(Number(renderParams.amplitude)||1);
   if(A>=ymin&&A<=ymax){
    svg.append(svgEl('line',{x1:box.left,y1:sy(A),x2:box.right,y2:sy(A),stroke:'#047857','stroke-width':1.4,'stroke-dasharray':'5 4'}));
    svg.append(svgEl('line',{x1:box.left,y1:sy(-A),x2:box.right,y2:sy(-A),stroke:'#047857','stroke-width':1.4,'stroke-dasharray':'5 4'}));
    addTxt(box.right-8,sy(A)-5,`+A = ${fmt(A)}`,'#047857',9.8,'end',750,svg,'g11-amp-pos');
    addTxt(box.right-8,sy(-A)+13,`−A = −${fmt(A)}`,'#047857',9.8,'end',750,svg,'g11-amp-neg');
   }
  }
  // R81 Grade 8 (8-07-C01, 8-07-C02, 8-07-C03): Explicit slope triangle (rise/run), Oy/Ox intercept projections, and intersection focus
  if(this.id==='8-07-C01'||this.id==='8-07-C02'){
   const aSlope=Number(renderParams.a)||0,bInt=Number(renderParams.b)||0;
   const xStep0=0,xStep1=1,yStep0=bInt,yStep1=aSlope+bInt;
   if(yStep0>=ymin&&yStep0<=ymax){
    // 8-07-C01: Điểm cắt Oy cam (#B45309)
    svg.append(svgEl('circle',{cx:sx(0),cy:sy(yStep0),r:7.5,fill:'#B45309',stroke:'#fff','stroke-width':2}));
    addPill(Math.max(418,sx(0)-92),Math.max(96,Math.min(430,sy(yStep0)-24)),84,18,`A(0; ${fmt(bInt)})`,'#FEF3C7','#B45309','#B45309',9.5,svg,'g8-oy');
   }
   if(yStep0>=ymin&&yStep0<=ymax&&yStep1>=ymin&&yStep1<=ymax){
    svg.append(svgEl('polygon',{points:`${sx(xStep0)},${sy(yStep0)} ${sx(xStep1)},${sy(yStep0)} ${sx(xStep1)},${sy(yStep1)}`,fill:'rgba(180,83,9,0.14)',stroke:'none'}));
    svg.append(svgEl('line',{x1:sx(xStep0),y1:sy(yStep0),x2:sx(xStep1),y2:sy(yStep0),stroke:'#1D4ED8','stroke-width':3}));
    svg.append(svgEl('line',{x1:sx(xStep1),y1:sy(yStep0),x2:sx(xStep1),y2:sy(yStep1),stroke:'#B45309','stroke-width':3}));
    if(this.id==='8-07-C02'){
     svg.append(svgEl('line',{x1:sx(xStep0),y1:sy(yStep0),x2:sx(xStep1),y2:sy(yStep1),stroke:'#6D28D9','stroke-width':4.6}));
    }
    svg.append(svgEl('circle',{cx:sx(xStep1),cy:sy(yStep1),r:6,fill:'#6D28D9',stroke:'#fff','stroke-width':2}));
    addTxt((sx(xStep0)+sx(xStep1))/2,sy(yStep0)+(aSlope>=0?15:-7),'Δx = 1','#1D4ED8',10.5,'middle',800,svg,'g8-dx');
    addTxt(sx(xStep1)+8,(sy(yStep0)+sy(yStep1))/2+4,`Δy = a = ${fmt(aSlope)}`,'#B45309',10.5,'start',800,svg,'g8-dy');
   }
   if(Math.abs(aSlope)>1e-4){
    const xRoot=-bInt/aSlope;
    if(xRoot>=xmin&&xRoot<=xmax){
     svg.append(svgEl('circle',{cx:sx(xRoot),cy:y0Axis,r:6.5,fill:'#6D28D9',stroke:'#fff','stroke-width':2}));
    }
   }
  }
  if(this.id==='8-07-C03'){
   const a1=Number(renderParams.a1??renderParams.a)||0,b1=Number(renderParams.b1??renderParams.b)||0,a2=Number(renderParams.a2??renderParams.c)||0,b2=Number(renderParams.b2??renderParams.d)||0;
   if(Math.abs(a1-a2)>1e-6){
    const xInt=(b2-b1)/(a1-a2),yInt=a1*xInt+b1;
    if(xInt>=xmin&&xInt<=xmax&&yInt>=ymin&&yInt<=ymax){
     svg.append(svgEl('line',{x1:sx(xInt),y1:sy(yInt),x2:sx(xInt),y2:y0Axis,stroke:'#6D28D9','stroke-width':1.8,'stroke-dasharray':'4 3'}));
     svg.append(svgEl('line',{x1:sx(xInt),y1:sy(yInt),x2:x0Axis,y2:sy(yInt),stroke:'#6D28D9','stroke-width':1.8,'stroke-dasharray':'4 3'}));
     svg.append(svgEl('circle',{cx:sx(xInt),cy:sy(yInt),r:11,fill:'rgba(109,40,217,0.18)',stroke:'#6D28D9','stroke-width':1.8}));
     svg.append(svgEl('circle',{cx:sx(xInt),cy:sy(yInt),r:6.5,fill:'#6D28D9',stroke:'#fff','stroke-width':2}));
     addPill(Math.min(812,sx(xInt)+12),Math.max(96,sy(yInt)-26),108,19,`I(${fmt(xInt)}; ${fmt(yInt)})`,'#EDE9FE','#6D28D9','#6D28D9',9.5,svg,'g8-int');
    }
   }else if(Math.abs(b1-b2)>1e-6){
    const yA=Math.max(ymin+0.5,Math.min(ymax-0.5,b1)),yB=Math.max(ymin+0.5,Math.min(ymax-0.5,b2));
    svg.append(svgEl('line',{x1:x0Axis,y1:sy(yA),x2:x0Axis,y2:sy(yB),stroke:'#6D28D9','stroke-width':3,'stroke-dasharray':'4 2'}));
    addPill(Math.min(810,x0Axis+10),(sy(yA)+sy(yB))/2-10,118,20,`d₁ ∥ d₂ (Δb=${fmt(Math.abs(b1-b2))})`,'#EDE9FE','#6D28D9','#6D28D9',9.6,svg,'g8-par');
   }
  }
  // R82 Grade 9: 9-01-C01..C03 (Hệ hai phương trình bậc nhất hai ẩn) & 9-08-C01..C05 (Parabol y=ax² & Phương trình bậc hai / Viète)
  if(this.id.startsWith('9-01-')){
   const a1=Number(renderParams.a)||0,b1=Number(renderParams.b)||0,a2=Number(renderParams.c)||0,b2=Number(renderParams.d)||0;
   const det=a1-a2,isSame=Math.abs(det)<1e-8&&Math.abs(b1-b2)<1e-8;
   for(const xv of [-2,2]){
    const y1=a1*xv+b1,y2=a2*xv+b2;
    if(y1>=ymin&&y1<=ymax)svg.append(svgEl('circle',{cx:sx(xv),cy:sy(y1),r:4.5,fill:'#1D4ED8',stroke:'#fff','stroke-width':1.5}));
    if(uTime>=0.25&&y2>=ymin&&y2<=ymax)svg.append(svgEl('circle',{cx:sx(xv),cy:sy(y2),r:4.5,fill:'#15803D',stroke:'#fff','stroke-width':1.5}));
   }
   if(Math.abs(det)>1e-8){
    const xInt=(b2-b1)/det,yInt=a1*xInt+b1;
    if(xInt>=xmin&&xInt<=xmax&&yInt>=ymin&&yInt<=ymax){
     svg.append(svgEl('line',{x1:sx(xInt),y1:sy(yInt),x2:sx(xInt),y2:y0Axis,stroke:'#6D28D9','stroke-width':2,'stroke-dasharray':'4 3'}));
     svg.append(svgEl('line',{x1:sx(xInt),y1:sy(yInt),x2:x0Axis,y2:sy(yInt),stroke:'#6D28D9','stroke-width':2,'stroke-dasharray':'4 3'}));
     svg.append(svgEl('circle',{cx:sx(xInt),cy:sy(yInt),r:12,fill:'rgba(109,40,217,0.18)',stroke:'#6D28D9','stroke-width':1.8}));
     svg.append(svgEl('circle',{cx:sx(xInt),cy:sy(yInt),r:7,fill:'#6D28D9',stroke:'#fff','stroke-width':2.2}));
     addPill(Math.min(790,sx(xInt)+14),Math.max(96,sy(yInt)-26),130,20,`Nghiệm (${fmt(xInt)}; ${fmt(yInt)})`,'#EDE9FE','#6D28D9','#6D28D9',9.6,svg,'g9-sol');
    }
   }else if(!isSame){
    const yA=Math.max(ymin+0.4,Math.min(ymax-0.4,b1)),yB=Math.max(ymin+0.4,Math.min(ymax-0.4,b2));
    svg.append(svgEl('line',{x1:x0Axis,y1:sy(yA),x2:x0Axis,y2:sy(yB),stroke:'#B45309','stroke-width':3.4,'stroke-dasharray':'5 3'}));
    addPill(416,82,226,22,`d₁ ∥ d₂ (Δb = ${fmt(Math.abs(b1-b2))}) ⇒ Vô nghiệm`,'#FEF3C7','#B45309','#92400E',9.5,svg,'g9-nosol');
   }else{
    addPill(416,82,248,22,'d₁ ≡ d₂ (hai đường trùng khít) ⇒ Vô số nghiệm','#EDE9FE','#6D28D9','#6D28D9',9.5,svg,'g9-inf');
   }
  }
  if(this.id==='9-08-C01'||this.id==='9-08-C02'||this.id==='9-08-C03'){
   const aVal=Number(renderParams.a)||1;
   svg.append(svgEl('line',{x1:x0Axis,y1:box.top,x2:x0Axis,y2:box.bottom,stroke:'#475569','stroke-width':2.2,'stroke-dasharray':'6 4'}));
   const pairs=this.id==='9-08-C03'?(uTime<0.35?[1]:[1,2]):[1,2];
   for(const xv of pairs){
    const yv=aVal*xv*xv;
    if(yv>=ymin&&yv<=ymax){
     const isHighlight=(xv===1&&uTime<0.6)||(xv===2&&uTime>=0.6);
     const col=isHighlight?'#B45309':'#1D4ED8';
     svg.append(svgEl('line',{x1:sx(-xv),y1:sy(yv),x2:sx(xv),y2:sy(yv),stroke:col,'stroke-width':1.8,'stroke-dasharray':'4 3'}));
     svg.append(svgEl('circle',{cx:sx(-xv),cy:sy(yv),r:5.8,fill:col,stroke:'#fff','stroke-width':1.8}));
     svg.append(svgEl('circle',{cx:sx(xv),cy:sy(yv),r:5.8,fill:col,stroke:'#fff','stroke-width':1.8}));
     if(this.id==='9-08-C03'){
      addTxt(sx(-xv)-8,sy(yv)-8,`(-${xv};${fmt(yv)})`,col,9.8,'end',800,svg,`g9-symL-${xv}`);
      addTxt(sx(xv)+8,sy(yv)-8,`(${xv};${fmt(yv)})`,col,9.8,'start',800,svg,`g9-symR-${xv}`);
     }
    }
   }
  }
  if(this.id==='9-08-C04'||this.id==='9-08-C05'){
   const aVal=Number(renderParams.a)||1,bVal=Number(renderParams.b)||0,cVal=Number(renderParams.c)||0;
   const delta=bVal*bVal-4*aVal*cVal;
   if(this.id==='9-08-C04'){
    const stCol=delta>1e-8?'#6D28D9':Math.abs(delta)<=1e-8?'#B45309':'#475569';
    const stTxt=delta>1e-8?`Δ = ${fmt(delta)} > 0 ⇒ 2 nghiệm thực phân biệt`:Math.abs(delta)<=1e-8?`Δ = 0 ⇒ Nghiệm kép x₁ = x₂ = ${fmt(-bVal/(2*aVal))}`:`Δ = ${fmt(delta)} < 0 ⇒ Không cắt Ox (Vô nghiệm thực)`;
    addPill(416,80,295,22,stTxt,delta>=0?'#EDE9FE':'#F1F5F9',stCol,stCol,9.5,svg,'g9-delta');
   }else if(delta>=0){
    const rt=Math.sqrt(delta),x1=(-bVal-rt)/(2*aVal),x2=(-bVal+rt)/(2*aVal),midX=(x1+x2)/2;
    if(x1>=xmin&&x2<=xmax){
     svg.append(svgEl('line',{x1:sx(x1),y1:y0Axis,x2:sx(x2),y2:y0Axis,stroke:'#6D28D9','stroke-width':4}));
     svg.append(svgEl('circle',{cx:sx(midX),cy:y0Axis,r:5,fill:'#6D28D9',stroke:'#fff','stroke-width':1.8}));
    }
    addPill(416,80,320,22,`Viète: S = x₁+x₂ = ${fmt(-bVal/aVal)}  |  P = x₁·x₂ = ${fmt(cVal/aVal)}`,'#EDE9FE','#6D28D9','#6D28D9',9.5,svg,'g9-viete');
   }
  }
  const vAsyms=model.asymptotes.filter(a=>a.type==='vertical').map(a=>a.value);
  for(const [cIdx,curve] of model.series.entries()){
   let d='',prev=null,prevX=null;
   for(let i=0;i<=800;i++){
    const x=xmin+(xmax-xmin)*i/800,y=curve.evaluate(x),ok=Number.isFinite(y)&&y>=ymin-.6&&y<=ymax+.6;
    if(!ok){prev=null;prevX=null;continue;}
    const crossedAsym=prevX!==null&&vAsyms.some(va=>(prevX-va)*(x-va)<=0);
    const xy=[sx(x),sy(y)],isNew=!prev||crossedAsym||Math.abs(prev[1]-xy[1])>(box.bottom-box.top)*.45;
    d+=`${isNew?'M':'L'}${xy[0].toFixed(2)} ${xy[1].toFixed(2)} `;prev=xy;prevX=x;
   }
   svg.append(svgEl('path',{d,stroke:curve.color,'stroke-width':3.2,'stroke-dasharray':curve.dashed?'7 5':'none',fill:'none'}));
   if(cIdx===0&&(this.id==='12-01-C01'||this.id==='12-01-C02')){
    for(let i=1;i<8;i++){
     const xm=xmin+(xmax-xmin)*i/8,ym=curve.evaluate(xm),ym2=curve.evaluate(xm+.05);
     if(Number.isFinite(ym)&&Number.isFinite(ym2)&&ym>ymin+.3&&ym<ymax-.3){
      const sl=(ym2-ym)/.05;
      if(Math.abs(sl)>0.18)addTxt(sx(xm),sy(ym)-8,sl>0?'↗':'↘',sl>0?'#12876f':'#c94236',13,'middle',900);
     }
    }
   }
  }
  if(this.timeline)this.timeline.value=this.t;
  if(isG11){
   const stIdx=uTime<0.25?1:uTime<0.55?2:uTime<0.85?3:4;
   const stLabel=this.id.startsWith('11-02-')?['Dựng đồ thị chuẩn','Biến thiên biên độ/tần số','Chu kì tuần hoàn T','Đối xứng & Tiệm cận'][stIdx-1]:
    this.id.startsWith('11-11-')?['Khởi tạo cơ số a','Điểm neo cố định','Đường tiệm cận & đơn điệu','Đối xứng qua y = x'][stIdx-1]:
    ['Điểm gốc M(x₀; f(x₀))','Cát tuyến qua Δx = h','Quá trình h → 0','Tiếp tuyến & Đạo hàm'][stIdx-1];
   addPill(414,80,248,20,`Cảnh ${stIdx}/4 (${Math.round(uTime*100)}%): ${stLabel}`,'#F5F3FF','#DDD6FE','#6D28D9',9.5,svg,'g11-stage');
  }
  if(isG12){
   const stIdx=uTime<0.25?1:uTime<0.55?2:uTime<0.85?3:4;
   const stLabel=this.id.startsWith('12-01-')?['Dựng đồ thị gốc','Quét tiếp tuyến tại M','Xét dấu f\'(x) & điểm dừng','Cực trị & GTLN/GTNN'][stIdx-1]:
    this.id.startsWith('12-02-')?['Dựng nhánh đồ thị','Tiệm cận / Tâm đối xứng','Tiếp tuyến & giao điểm','Hoàn tất khảo sát'][stIdx-1]:
    ['Chia đoạn [a; b]','Quét tổng Riemann S_n','Mịn hóa phân hoạch','Hội tụ tích phân xác định'][stIdx-1];
   addPill(414,80,264,20,`Cảnh ${stIdx}/4 (${Math.round(uTime*100)}%): ${stLabel}`,'#F5F3FF','#DDD6FE','#7C3AED',9.5,svg,'g12-stage');
  }
  let cursorInfo='• Điểm M ngoài khung nhìn',slopeInfo='• Tiếp tuyến: đang cập nhật';
  const first=model.series[0];
  if(first&&typeof first.evaluate==='function'){
   const cursorX=xmin+(xmax-xmin)*(.12+.76*uTime),cursorY=first.evaluate(cursorX);
   const lineCol=this.id==='10-06-C03'?(cursorY>=0?'#12876f':'#c94236'):'#64748B';
   svg.append(svgEl('line',{x1:sx(cursorX),y1:box.top,x2:sx(cursorX),y2:box.bottom,stroke:lineCol,'stroke-width':1.3,'stroke-dasharray':'4 4'}));
   if(Number.isFinite(cursorY)&&cursorY>=ymin&&cursorY<=ymax){
    svg.append(svgEl('line',{x1:sx(cursorX),y1:sy(cursorY),x2:x0Axis,y2:sy(cursorY),stroke:'#1D4ED8','stroke-width':1.4,'stroke-dasharray':'4 4'}));
    svg.append(svgEl('circle',{cx:sx(cursorX),cy:y0Axis,r:4,fill:'#1D4ED8'}));
    svg.append(svgEl('circle',{cx:x0Axis,cy:sy(cursorY),r:4,fill:'#1D4ED8'}));
    const xv=this.id.startsWith('10-06-')&&renderParams.a?-renderParams.b/(2*renderParams.a):0;
    if(this.id.startsWith('10-06-')&&renderParams.a&&this.showAux!==false){
     const mirrorX=2*xv-cursorX;
     if(mirrorX>=xmin&&mirrorX<=xmax){
      svg.append(svgEl('line',{x1:sx(cursorX),y1:sy(cursorY),x2:sx(mirrorX),y2:sy(cursorY),stroke:'#12876f','stroke-width':2.4,'stroke-dasharray':'4 3'}));
      svg.append(svgEl('circle',{cx:sx(xv),cy:sy(cursorY),r:3.5,fill:'#12876f'}));
      svg.append(svgEl('circle',{cx:sx(mirrorX),cy:sy(cursorY),r:6,fill:'#12876f',stroke:'#fff','stroke-width':2}));
      if(Math.abs(cursorX-xv)>0.42){
       addTxt(sx(mirrorX)+(mirrorX>xv?12:-12),sy(cursorY)-8,`M'(${fmt(mirrorX)};${fmt(cursorY)})`,'#0f6953',9.8,mirrorX>xv?'start':'end',800,svg,'mirror-M');
      }
     }
    }
    if(this.id.startsWith('11-02-C0')){
     const freq=Math.max(0.1,Math.abs(Number(renderParams.frequency)||1));
     const T=((this.id==='11-02-C03'||this.id==='11-02-C04')?Math.PI:2*Math.PI)/freq;
     const xNext=cursorX+T<=xmax?cursorX+T:cursorX-T;
     if(xNext>=xmin&&xNext<=xmax){
      svg.append(svgEl('line',{x1:sx(cursorX),y1:sy(cursorY),x2:sx(xNext),y2:sy(cursorY),stroke:'#6D28D9','stroke-width':2.4,'stroke-dasharray':'5 3'}));
      svg.append(svgEl('circle',{cx:sx(xNext),cy:sy(cursorY),r:6,fill:'#6D28D9',stroke:'#fff','stroke-width':2}));
      addTxt((sx(cursorX)+sx(xNext))/2,sy(cursorY)-7,`T = ${fmt(T)}`,'#6D28D9',10.2,'middle',800,svg,'trig-period');
     }
    }
    if(this.id==='11-11-C03'&&this.showAux!==false){
     const rx=cursorY,ry=cursorX,mx=(cursorX+rx)/2,my=(cursorY+ry)/2;
     if(rx>=xmin&&rx<=xmax&&ry>=ymin&&ry<=ymax){
      svg.append(svgEl('line',{x1:sx(cursorX),y1:sy(cursorY),x2:sx(rx),y2:sy(ry),stroke:'#B45309','stroke-width':2.2,'stroke-dasharray':'4 3'}));
      svg.append(svgEl('circle',{cx:sx(mx),cy:sy(my),r:4.5,fill:'#6D28D9',stroke:'#fff','stroke-width':1.5}));
      svg.append(svgEl('circle',{cx:sx(rx),cy:sy(ry),r:6.5,fill:'#047857',stroke:'#fff','stroke-width':2}));
      addTxt(sx(rx)+10,sy(ry)+4,`M'(${fmt(rx)};${fmt(ry)})`,'#047857',9.8,'start',800,svg,'exp-log-mirror');
     }
    }
    if((this.id==='11-12-C01'||this.id==='11-12-C02')&&this.params.x0!==undefined){
     const x0=this.params.x0,y0=first.evaluate(x0);
     if(this.id==='11-12-C02'){
      const baseH=Math.abs(this.params.h||0.75)<0.05?0.75:this.params.h;
      const hEff=Math.max(0.06,baseH*(1-0.88*uTime));
      const xQ=x0+hEff,yQ=first.evaluate(xQ),secSlope=(yQ-y0)/hEff;
      if(xQ>=xmin&&xQ<=xmax&&yQ>=ymin&&yQ<=ymax){
       svg.append(svgEl('line',{x1:sx(x0),y1:sy(y0),x2:sx(xQ),y2:sy(y0),stroke:'#1D4ED8','stroke-width':2,'stroke-dasharray':'3 2'}));
       svg.append(svgEl('line',{x1:sx(xQ),y1:sy(y0),x2:sx(xQ),y2:sy(yQ),stroke:'#047857','stroke-width':2,'stroke-dasharray':'3 2'}));
       svg.append(svgEl('circle',{cx:sx(xQ),cy:sy(yQ),r:6.8,fill:'#B45309',stroke:'#fff','stroke-width':2}));
       addPill(676,80,244,20,`h = ${fmt(hEff)} ⇒ k_PQ = ${fmt(secSlope)} → f'(x₀) = ${fmt(2*x0)}`,'#FEF3C7','#FCD34D','#B45309',9.4,svg,'g11-secant-pill');
      }
     }else if(Number.isFinite(y0)&&Math.abs(cursorX-x0)>0.08){
      svg.append(svgEl('line',{x1:sx(x0),y1:sy(y0),x2:sx(cursorX),y2:sy(cursorY),stroke:'#047857','stroke-width':2.4}));
      svg.append(svgEl('circle',{cx:sx(x0),cy:sy(y0),r:7.5,fill:'#1D4ED8',stroke:'#fff','stroke-width':2,'data-handle':'x0',style:'cursor:grab'}));
     }
    }
    if(this.id==='11-12-C03'){
     const trackY=box.bottom-14;
     svg.append(svgEl('line',{x1:box.left+20,y1:trackY,x2:box.right-20,y2:trackY,stroke:'#CBD5E1','stroke-width':4}));
     const px=sx(Math.max(xmin,Math.min(xmax,cursorY)));
     svg.append(svgEl('circle',{cx:px,cy:trackY,r:6.5,fill:'#B45309',stroke:'#fff','stroke-width':2}));
    }
    const eps=(xmax-xmin)*1e-4,yPlus=first.evaluate(cursorX+eps),yMinus=first.evaluate(cursorX-eps);
    const slope=(Number.isFinite(yPlus)&&Number.isFinite(yMinus))?(yPlus-yMinus)/(2*eps):null;
    cursorInfo=`• Khảo sát: M(${fmt(cursorX)}; ${fmt(cursorY)})`;
    if(Number.isFinite(slope)&&Math.abs(slope)<1e3){
     slopeInfo=`• Hệ số góc: k = f'(${fmt(cursorX)}) ≈ ${fmt(slope)}`;
     const span=(xmax-xmin)*.13,tx1=cursorX-span,ty1=cursorY-slope*span,tx2=cursorX+span,ty2=cursorY+slope*span;
     svg.append(svgEl('line',{x1:sx(tx1),y1:sy(ty1),x2:sx(tx2),y2:sy(ty2),stroke:isG11?'#B45309':'#c94236','stroke-width':2,'stroke-dasharray':'5 4'}));
     const dxTri=(xmax-xmin)*.07,xTri=cursorX+dxTri,yTri=cursorY+slope*dxTri;
     if(yTri>=ymin&&yTri<=ymax){
      svg.append(svgEl('line',{x1:sx(cursorX),y1:sy(cursorY),x2:sx(xTri),y2:sy(cursorY),stroke:'#047857','stroke-width':1.8,'stroke-dasharray':'3 3'}));
      svg.append(svgEl('line',{x1:sx(xTri),y1:sy(cursorY),x2:sx(xTri),y2:sy(yTri),stroke:'#047857','stroke-width':1.8,'stroke-dasharray':'3 3'}));
     }
    }
    svg.append(svgEl('circle',{cx:sx(cursorX),cy:sy(cursorY),r:13,fill:'rgba(180,83,9,0.2)',stroke:'#B45309','stroke-width':1.5,'data-handle':'cursor'}));
    svg.append(svgEl('circle',{cx:sx(cursorX),cy:sy(cursorY),r:7.5,fill:'#B45309',stroke:'#fff','stroke-width':2.2,'data-handle':'cursor'}));
    // Place M pill outward from the parabola branch so it never covers the curve or vertex I
    const mPillX=cursorX>=xv?Math.min(812,sx(cursorX)+14):Math.max(416,sx(cursorX)-126);
    const mPillY=Math.max(106,Math.min(416,sy(cursorY)-28));
    addPill(mPillX,mPillY,112,20,`M(${fmt(cursorX)}; ${fmt(cursorY)})`,'#fff1e6','#f3c299','#b84a18',10,svg,'cursor-M');
   }
  }
  for(const [idx,p] of model.markers.entries()){
   if(p.x<xmin||p.x>xmax||p.y<ymin||p.y>ymax)continue;
   const isVertexI=(p.name==='I'||p.name==='Đỉnh I')&&this.id.startsWith('10-06-');
   const mCol=p.color||'#12876f';
   const cProps={cx:sx(p.x),cy:sy(p.y),r:isVertexI?7.5:6.5,fill:mCol,stroke:'#fff','stroke-width':2};
   if(isVertexI){cProps['data-handle']='vertex-I';cProps.style='cursor:grab';}
   svg.append(svgEl('circle',cProps));
   // Smart outward placement for Vertex I and Roots A, B so they never sit on the curve or collide
   let px=sx(p.x)-48,py=sy(p.y)+14;
   if(isVertexI){
    py=(renderParams.a>0)?Math.min(426,sy(p.y)+14):Math.max(106,sy(p.y)-34);
   }else if(p.name==='A'){
    px=Math.max(414,sx(p.x)-104);py=Math.min(426,sy(p.y)+14);
   }else if(p.name==='B'){
    px=Math.min(826,sx(p.x)+10);py=Math.min(426,sy(p.y)+14);
   }else{
    px=Math.min(818,Math.max(416,sx(p.x)+10));py=Math.max(106,Math.min(420,sy(p.y)-12+(idx%2)*24));
   }
   const bgCol=p.color==='#6D28D9'?'#EDE9FE':p.color==='#1D4ED8'?'#DBEAFE':p.color==='#15803D'?'#DCFCE7':'#e5f7f1';
   const bdCol=p.color||'#98d9c4';
   const txCol=p.color||'#0f6953';
   addPill(Math.min(826,Math.max(414,px)),py,96,19,`${p.name}(${fmt(p.x)};${fmt(p.y)})`,bgCol,bdCol,txCol,9.6,svg,`marker-${p.name}-${idx}`);
  }
  // Populate Compact Left Formula Card & HTML Metrics below SVG
  let rowY=142;
  if(this.metrics){
   this.metrics.replaceChildren();
   const mHead=node('div','mv-r5-value',formatMathText(`${this.id} • ${this.mode?.name||this.mode?.title||'Đồ thị hàm số'}`));
   mHead.style.fontWeight='800';mHead.style.color='#0c7da0';
   this.metrics.append(mHead);
   for(const s of model.series)this.metrics.append(node('div','mv-r5-value',formatMathText(s.name)));
   this.metrics.append(node('div','mv-r5-value',formatMathText(cursorInfo.replace(/^•\s*/,''))));
   this.metrics.append(node('div','mv-r5-value',formatMathText(slopeInfo.replace(/^•\s*/,''))));
  }
  for(const s of model.series.slice(0,2)){
   cardG.append(svgEl('line',{x1:36,y1:rowY-4,x2:60,y2:rowY-4,stroke:s.color,'stroke-width':3.2,'stroke-dasharray':s.dashed?'5 3':'none'}));
   addTxt(68,rowY,short(s.name,36),s.color,12.2,'start',800,cardG);rowY+=34;
  }
  addTxt(36,rowY,short(cursorInfo.replace(/^•\s*/,''),43),'#0c7da0',12.2,'start',750,cardG);rowY+=34;
  if(rowY<=260)addTxt(36,rowY,short(slopeInfo.replace(/^•\s*/,''),43),'#c94236',12.2,'start',750,cardG);
  // Compact Formula Badge below Card (hidden inside SVG)
  hiddenChrome.append(svgEl('rect',{x:20,y:288,width:368,height:60,rx:12,fill:'#eef8f5',stroke:'#a9dec9','stroke-width':1.4}));
  const footG=svgEl('g',{'clip-path':'url(#fg-foot-clip)'});hiddenChrome.append(footG);
  addTxt(36,323,short(model.summary,46),'#0f5e4b',12.2,'start',800,footG);
  decorateInteractiveSVG(this.pane,this.stageState);
 }
}
