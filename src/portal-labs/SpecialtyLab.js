import {ViewerRegistry} from '../viewers/ViewerRegistry.js';
import {TYPES,normalizeExhibit} from '../math-core.js';
import {detectModality} from '../data/migrate-v2-v4-v5.js';
import {zoneById,zoneForModel} from './portal-registry.js';
import {SymmetryMotionCanvas} from './symmetry-motion.js';
import {Grade6Lab} from '../curriculum/Grade6Lab.js';
import {RealWorldCompanion} from './RealWorldCompanion.js';
import {supportsJSXGraph} from '../viewers/JSXGraphAdapter.js';
import {supportsECharts} from '../viewers/EChartsAdapter.js';
import {loadOptionalEngine,OPTIONAL_ENGINES} from '../integrations/optional-engines.js';
import {scheduleLabAutoplay,cancelLabAutoplay,isAutoPlayEnabled,setAutoPlayEnabled} from '../curriculum/lab-autoplay.mjs';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(x))?Number(x):a));
const make=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
const btn=(text,click,className='mv14-btn')=>{const b=make('button',className,text);b.type='button';b.addEventListener('click',click);return b;};
const uiText={plane:'PH\u00d2NG TH\u00cd NGHI\u1ec6M H\u00ccNH PH\u1eb2NG',solid:'PH\u00d2NG TH\u00cd NGHI\u1ec6M KH\u00d4NG GIAN',graph:'PH\u00d2NG TH\u00cd NGHI\u1ec6M \u0110\u1ed2 TH\u1eca',stats:'PH\u00d2NG TH\u00cd NGHI\u1ec6M BI\u1ec2U \u0110\u1ed2',real:'PH\u00d2NG M\u00d4 H\u00ccNH TH\u1ef0C T\u1ebe'};

/** One specialty engine per zone. Old V11 WorkspaceComposer remains archived for migration only. */
export class SpecialtyLab{
 constructor({model,zone,onNotice=()=>{},onModelChange=()=>{}}){
  this.model=model;this.zone=zoneById(zone)?zone:zoneForModel(model);
  this.onNotice=onNotice;this.onModelChange=onModelChange;
  this.viewer=null;this.math6=null;this.mode='model';this.playing=false;this.progress=0;this.raf=0;this.time=0;this.lastUpdate=0;this.speed=1;
  this.previewing=false;this.saved=this._load();this.nativeParams={...(model.params||{}),...(this.saved?.params||{})};
  this.chartData=this.saved?.values||null;this.chartKind=this.saved?.chartKind||null;this.root=null;this.motionParam=null;
  this.engineName='native';this.engineSerial=0;this.disposed=false;this.geometryViewState=this.saved?.points||null;
 }
 _storageKey(){const id=this.model.supplemental?this.model.id:(this.model.sourceExhibitId||this.model.id);return `mathverse:v14:lab:${this.model.grade}:${this.zone}:${id}`;}
 _load(){try{const d=JSON.parse(localStorage.getItem(this._storageKey())||'null');if(d&&typeof d==='object'&&d.version===14)return d;}catch{}return null;}
 _save(){if(!this.model||this.mode==='math6')return;
  const params={};const spec=TYPES[this.model.type];for(const [key,[label,min,max]] of Object.entries(spec?.params||{})){
    if(Number.isFinite(Number(this.nativeParams[key])))params[key]=clamp(this.nativeParams[key],min,max);
  }
  const values=this.viewer?.data?.values;
  const p=this.viewer?.getState?.()?.points||this.geometryViewState;
  const points=p&&typeof p==='object'?Object.fromEntries(Object.entries(p).filter(([key,v])=>/^[A-Za-z0-9_]{1,6}$/.test(key)&&Array.isArray(v)&&v.length===2&&v.every(x=>Number.isFinite(x)&&Math.abs(x)<=1000)).slice(0,50)):null;
  const doc={version:14,zone:this.zone,grade:this.model.grade,modelId:this.model.id,params,...(this.viewer?.chartKind?{chartKind:this.viewer.chartKind}:this.chartKind?{chartKind:this.chartKind}:{}),...(Array.isArray(values)?{values:values.slice(0,20).map(v=>clamp(v,this.viewer?.data?.kind==='raw_numeric'?-1e4:0,1e4))}:{}),...(points?{points}:{}),fold:this.symmetry?this.symmetry.progress:null,motionMode:this.symmetry?(this.symmetry.axis?'axis':'center'):null,symmetryDimensions:this.symmetry?{length:this.symmetry.length,height:this.symmetry.height}:null};
  try{localStorage.setItem(this._storageKey(),JSON.stringify(doc));}catch{this.onNotice('Kh\u00f4ng th\u1ec3 t\u1ef1 l\u01b0u. H\u00e3y xu\u1ea5t t\u1ec7p JSON.');}
 }
 mount(viewport,inspector){this.disposed=false;this.viewport=viewport;this.inspector=inspector;this._mountNative();}
 _clearEngines(){this.pause();if(this.viewer){this.viewer.dispose();this.viewer=null;}if(this.symmetry){this.symmetry.dispose();this.symmetry=null;}
  if(this.math6){this.math6.dispose();this.math6=null;}this.realWorld?.dispose();this.realWorld=null;for(const fn of this.disposers||[])fn();this.disposers=[];}
 _mountNative(){this._clearEngines();this.mode='model';this.viewport.replaceChildren();this.inspector.replaceChildren();
  this.root=make('div','mv14-lab-root');this.viewport.append(this.root);
  const banner=make('header','mv14-lab-banner');const badge=make('span','mv14-zone-mark',uiText[this.zone]||'PH\u00d2NG TH\u00cd NGHI\u1ec6M');
  const title=make('strong','mv14-lab-object-title',this.model.title);banner.append(badge,title);this.root.append(banner);
  this.stage=make('div','mv14-lab-canvas-host');this.root.append(this.stage);
  const controls=make('footer','mv14-lab-transport');this.root.append(controls);
  this.playButton=btn('\u25b6 Chuy\u1ec3n \u0111\u1ed9ng',()=>this.togglePlay());this.pauseButton=btn('\u23f8 T\u1ea1m d\u1eebng',()=>this.pause());
  this.resetButton=btn('\u21ba \u0110\u1eb7t l\u1ea1i',()=>this.reset());
  const jump0=btn('0%',()=>{this.pause();this.setProgress(0,true);});
  const jump50=btn('50%',()=>{this.pause();this.setProgress(.5,true);});
  const jump100=btn('100%',()=>{this.pause();this.setProgress(1,true);});
  this.autoPlayBtn=btn(isAutoPlayEnabled(this)?'\u26a1 T\u1ef1 ph\u00e1t: B\u1eadt':'\u26a1 T\u1ef1 ph\u00e1t: T\u1eaft',()=>{
    const next=!isAutoPlayEnabled(this);
    setAutoPlayEnabled(this,next);
    this.autoPlayBtn.textContent=next?'\u26a1 T\u1ef1 ph\u00e1t: B\u1eadt':'\u26a1 T\u1ef1 ph\u00e1t: T\u1eaft';
    if(!next)this.pause();
  });
  this.timeline=make('input','mv14-motion-progress');this.timeline.type='range';this.timeline.min='0';this.timeline.max='100';this.timeline.value='0';this.timeline.step='1';this.timeline.setAttribute('aria-label','Tua chuy\u1ec3n \u0111\u1ed9ng');
  this.timeline.addEventListener('input',()=>{this.pause();this.setProgress(Number(this.timeline.value)/100,true);});
  const speed=make('select','mv14-motion-speed');speed.setAttribute('aria-label','T\u1ed1c \u0111\u1ed9');for(const v of [.5,1,1.5,2]){const option=make('option','',`${v}\u00d7`);option.value=v;speed.append(option);}
  speed.value=String(this.speed);speed.addEventListener('change',()=>{this.speed=Number(speed.value);});
  this.readout=make('output','mv14-progress-text','0%');
  controls.append(this.playButton,this.pauseButton,this.resetButton,jump0,jump50,jump100,this.timeline,this.readout,speed,this.autoPlayBtn);
  this.content=make('div','mv14-lab-inspector');this.inspector.append(this.content);
  this._initEngine();this._renderControls();
  const initialFold=this.saved?.fold;
  if(Number.isFinite(initialFold)){
    this.setProgress(initialFold,false);
  }else{
    this.setProgress(0,false);
    scheduleLabAutoplay(this,{
      start:()=>{
        if(!this.disposed&&!this.playing)this.togglePlay();
      }
    });
  }
 }
 _initEngine(){const t=this.model.type,modality=this.model.modality||detectModality(t);
  if(modality==='geometry2d'&&['symmetryAxis','symmetryCenter','rhombus','rectangleSquare','polygon','parallelogram'].includes(t)){
    this.symmetry=new SymmetryMotionCanvas(this.model,state=>{if(state.progress!==undefined){this.progress=state.progress;this._showProgress();}this._updateOutputs(state);if(state.committed)this._save();});
    this.symmetry.mount(this.stage);
    if(this.saved?.symmetryDimensions){const {length,height}=this.saved.symmetryDimensions;this.symmetry.setDimensions(clamp(length,1,10),clamp(height,1,10));}if(this.saved?.motionMode&&this.symmetry.motions.includes(this.saved.motionMode))this.symmetry.setMode(this.saved.motionMode);if(this.saved?.fold)this.symmetry.setProgress(this.saved.fold);
    this.motionKind='symmetry';return;
  }
  const source={...this.model,params:{...this.nativeParams}};
  if(this.geometryViewState)source.viewState={points:structuredClone(this.geometryViewState)};
  if(this.chartData&&modality==='statisticschart')source.data={kind:this.model.data?.kind||'categorical_frequency',labels:this.model.data?.labels||this.chartData.map((_,i)=>`Nhóm ${i+1}`),values:this.chartData};
  this.viewer=ViewerRegistry.createViewer(source,{
    engine:this.engineName,
    onParametersChange:params=>{if(!this.previewing){this.nativeParams={...this.nativeParams,...params};this._save();}this._updateOutputs(params);this._refreshMetrics();},
    onDataChange:values=>{this.pause();this.chartOriginal=[...values];this.chartData=[...values];this._updateOutputs(Object.fromEntries(values.map((v,i)=>[i,v])));this._refreshMetrics();this._save();},
    onInteractionEnd:()=>{this.pause();this._refreshMetrics();this._save();},onMetricsChange:()=>this._refreshMetrics()
  });
  try{this.viewer.mount(this.stage);}catch(error){
    this.viewer?.dispose?.();this.viewer=null;
    const note=make('p','mv14-webgl-warning','Kh\u00f4ng kh\u1edfi t\u1ea1o \u0111\u01b0\u1ee3c c\u00f4ng c\u1ee5. H\u00e3y b\u1eadt WebGL trong Chrome/Edge.');this.stage.append(note);
    this.onNotice(error.message);return;
  }
  if(modality==='solid3d')this.viewer.setToolMode?.('edit');
  if(modality==='statisticschart'){this.motionKind='stats';if(this.chartKind)this.viewer.setChartKind(this.chartKind);this.chartOriginal=[...this.viewer.data.values];this._attachStatsDrag();}

  else {this.motionKind='parameter';this.motionParam=this._preferredParameter();}
  const cancel=()=>this.pause();this.stage.addEventListener('pointerdown',cancel);this.disposers.push(()=>this.stage?.removeEventListener('pointerdown',cancel));
 }
 _nativeGraphPatch(key,value){
  // Catalog y=ax+b maps to FunctionGraphViewer internals y=(b)x+c.
  if(['linearSlope','lineGraph'].includes(this.model.type)){
    return {[key==='a'?'b':key==='b'?'c':key]:value};
  }
  return {[key]:value};
 }
 _restoreNativeParams(){
  if(!this.viewer?.updateParameters)return;
  const raw=this.nativeParams;
  if(['linearSlope','lineGraph'].includes(this.model.type)){
    this.viewer.updateParameters({b:raw.a,c:raw.b});
  }else this.viewer.updateParameters({...raw});
 }
 _preferredParameter(){const params=TYPES[this.model.type]?.params||{};
  return ['deg','angle','h','r','a','b','k','d','c'].find(key=>params[key]&&Number.isFinite(this.nativeParams[key]))||Object.keys(params)[0]||null;
 }
 _makeField(name,value,min,max,step,onChange){const row=make('label','mv14-param-line');const headline=make('span','mv14-param-heading');
  const title=make('strong','',name),output=make('output','',Number(value).toLocaleString('vi-VN',{maximumFractionDigits:2}));headline.append(title,output);
  const range=make('input','mv14-param-range');range.type='range';range.min=min;range.max=max;range.step=step;range.value=value;
  const number=make('input','mv14-param-number');number.type='number';number.min=min;number.max=max;number.step=step;number.value=value;
  const change=value=>{const v=clamp(value,min,max);range.value=v;number.value=v;output.textContent=v.toLocaleString('vi-VN',{maximumFractionDigits:2});onChange(v);};
  range.addEventListener('input',()=>{this.pause();change(range.value);});number.addEventListener('change',()=>{this.pause();change(number.value);});
  row.append(headline,range,number);this.content.append(row);return {range,number,output,change};
 }
 _renderControls(){this.content.replaceChildren();this.fields=new Map();
  const intro=make('div','mv14-lab-intro');intro.append(make('h3','',this.model.title),make('p','',this.zone==='real'?'M\u00f4 h\u00ecnh \u1ee9ng d\u1ee5ng t\u1eeb h\u00ecnh h\u1ecdc; kh\u00f4ng ph\u1ea3i \u1ea3nh 3D qu\u00e9t t\u1eeb v\u1eadt th\u1eadt.':this.model.description||'K\u00e9o tr\u1ef1c ti\u1ebfp tr\u00ean h\u00ecnh v\u1ebd v\u00e0 thay \u0111\u1ed5i th\u00f4ng s\u1ed1.'));
  this.content.append(intro);
  this._renderEngineSelector();
  if(this.model.supplemental)this.content.append(make('p','mv14-supplement-note','M\u1eabu th\u1eed nghi\u1ec7m b\u1ed5 sung; kh\u00f4ng ph\u1ea3i m\u00f4 h\u00ecnh g\u1ed1c c\u1ee7a l\u1edbp.'));
  if(this.symmetry){
    if(this.symmetry.motions.length>1){const choices=make('div','mv14-lab-options');
      choices.append(btn('Gấp theo trục',()=>{this.symmetry.setMode('axis');this._save();}),btn('Quay 180° quanh tâm',()=>{this.symmetry.setMode('center');this._save();}));
      this.content.append(choices);
    }
    this.fields.set('length',this._makeField('K\u00edch th\u01b0\u1edbc ngang',this.symmetry.length,1,10,.1,v=>{this.symmetry.setDimensions(v,this.symmetry.height);this._save();}));
    this.fields.set('height',this._makeField('Chi\u1ec1u cao',this.symmetry.height,1,10,.1,v=>{this.symmetry.setDimensions(this.symmetry.length,v);this._save();}));
    this.content.append(make('p','mv14-teaching-note',this.symmetry.axis?'G\u1ea5p quanh tr\u1ee5c: n\u1eeda di \u0111\u1ed9ng s\u1ebd tr\u00f9ng v\u1edbi n\u1eeda c\u1ed1 \u0111\u1ecbnh \u1edf 180\u00b0.':'\u0110\u1ed1i x\u1ee9ng t\u00e2m l\u00e0 ph\u00e9p quay 180\u00b0 quanh O, kh\u00f4ng ph\u1ea3i ph\u00e9p g\u1ea5p qua tr\u1ee5c.'));
  }else if(this.viewer){
    const modality=this.model.modality||detectModality(this.model.type);
    if(modality==='statisticschart')this._chartControls();
    else{
      for(const [key,[label,lo,hi]] of Object.entries(TYPES[this.model.type]?.params||{})){
        const v=Number(this.nativeParams[key]);if(!Number.isFinite(v))continue;
        if(this.model.type==='cyclicQuad' && key==='a2')continue; // Derived opposing angle, not an independent input.
        const step=['n','deg'].includes(key)?1:.1;
        this.fields.set(key,this._makeField(label,v,lo,hi,step,val=>{
          this.nativeParams=normalizeExhibit({...this.model,params:{...this.nativeParams,[key]:val}}).params;
          this.progress=1;this._showProgress();this.realWorld?.setProgress(1);
          this.previewing=true;
          try{this._restoreNativeParams();}finally{this.previewing=false;}
          this._updateOutputs(this.nativeParams);this._refreshMetrics();this._save();
        }));
      }
      if(modality==='geometry2d' && ['triangleCenters','circumIncircle','triangleLaws'].includes(this.model.type))this._triangleControls();
      if(modality==='solid3d')this._solidControls();
      if(modality==='functiongraph')this.content.append(make('p','mv14-teaching-note','K\u00e9o thay \u0111\u1ed5i tham s\u1ed1: \u0111\u1ed3 th\u1ecb di chuy\u1ec3n theo h\u1ec7 s\u1ed1, kh\u00f4ng thay \u0111\u1ed5i d\u1eef ki\u1ec7n SGK g\u1ed1c.'));
    }
  }
  if(this.zone==='real'){
    const caption=make('h4','mv14-option-title','Ứng dụng trong đời sống • mô phỏng kèm');
    const box=make('div','mv14-real-companion');this.content.append(caption,box);
    this.realWorld?.dispose();this.realWorld=new RealWorldCompanion({...this.model,params:{...this.nativeParams}});this.realWorld.mount(box);
    this.realWorld.setProgress(this.progress);
    this.fields.set('real_scale',this._makeField('Phóng to vật thể minh họa',1,.65,1.7,.05,v=>this.realWorld?.setScale(v)));
    this.content.append(make('p','mv14-teaching-note','Bảng minh họa vật thể là sơ đồ 2.5D đồng bộ trực tiếp với số đo toán học bên trái. Kéo thanh trượt hoặc chạy chuyển động để quan sát tương quan thực tế.'));
  }
  if(this.viewer)this._renderMetricsPanel();
  const bottom=make('div','mv14-lab-actions');bottom.append(btn('T\u1ea3i \u1ea3nh PNG',()=>this.exportPNG()),btn('Xu\u1ea5t JSON',()=>this.exportJSON()));this.content.append(bottom);
 }
  _triangleControls(){
    if(this.engineName!=='native'||typeof this.viewer?.setConstructionMode!=='function')return;
    this.content.append(make('h4','mv14-option-title','Khám phá tam giác'));
    const row=make('div','mv14-lab-options');
    for(const [mode,label] of [['triangle','Tam giác'],['medians','Trung tuyến / G'],['centers','Các tâm G–H–O–I'],['circles','Nội / ngoại tiếp']]){
      const button=btn(label,()=>{this.viewer?.setConstructionMode(mode);this._refreshMetrics();});
      row.append(button);
    }
    this.content.append(row,make('p','mv14-teaching-note','Kéo trực tiếp A, B, C; các đường trung tuyến, tâm và đường tròn sẽ luôn được dựng lại theo hình. Kéo quá giới hạn hoặc làm tam giác suy biến sẽ bị từ chối.'));
  }
  _renderMetricsPanel(){
    this.metricsHost=make('div','mv17-metrics');
    const summary=make('h4','mv14-option-title','Số đo và kiểm chứng trực tiếp');
    this.content.append(summary,this.metricsHost);
    this._refreshMetrics();
    if(this.model.formula){
      const formula=make('code','mv17-formula',this.model.formula);
      const button=btn('Sao chép LaTeX',()=>{
        const value=this.model.formula;
        if(navigator.clipboard?.writeText)navigator.clipboard.writeText(value).then(()=>this.onNotice('Đã sao chép công thức LaTeX.')).catch(()=>this.onNotice('Không thể sao chép; hãy chọn mã công thức bên trên.'));
        else this.onNotice('Hãy chọn và sao chép mã công thức bên trên.');
      });
      this.content.append(make('h4','mv14-option-title','Công thức LaTeX'),formula,button);
    }
  }
  _refreshMetrics(){
    if(!this.metricsHost||!this.viewer?.getMetrics)return;
    let measurements;
    try{measurements=this.viewer.getMetrics();}catch(error){this.metricsHost.textContent=`Không tính được số đo: ${error.message}`;return;}
    this.metricsHost.replaceChildren();
    for(const item of (Array.isArray(measurements)?measurements:[]).slice(0,12)){
      const line=make('div','mv17-metric');
      line.append(make('span','',String(item.name||'')),make('strong','',`${item.value??'—'} ${item.unit||''}`.trim()));
      this.metricsHost.append(line);
    }
  }
 _solidControls(){const row=make('div','mv14-lab-options');
  row.append(btn('K\u00e9o ch\u1ec9nh h\u00ecnh',()=>this.viewer?.setToolMode('edit')),btn('Xoay camera',()=>this.viewer?.setToolMode('orbit')),btn('M\u1eb7t d\u00e2y',()=>this.viewer?.setDisplayMode('wireframe')),btn('H\u00ecnh \u0111\u1eb7c',()=>this.viewer?.setDisplayMode('solid')));
  this.content.append(row);
  if(this.viewer?.meshGroup?.supportsUnfold){
    this.content.append(make('h4','mv14-option-title','Khai tri\u1ec3n h\u00ecnh kh\u1ed1i'));
    this._makeField('M\u1ee9c m\u1edf c\u00e1c m\u1eb7t',0,0,100,1,v=>this.viewer?.setUnfold(v>0,v/100));
  }
  if(this.viewer?.meshGroup?.supportsObliqueSection){
    this.content.append(make('h4','mv14-option-title','Thiết diện nghiêng — diện tích đúng'));
    this.content.append(make('p','mv14-teaching-note','Mặt phẳng quay quanh trục Oz; đa giác cắt được tính theo giao điểm thật với các cạnh của khối.'));
    const update=(show=true)=>{const d=this.viewer?.setObliqueSection(show,this.sectionPct??50,this.sectionAngle??0);this._refreshMetrics();return d;};
    this.sectionPct=50;this.sectionAngle=0;
    this.content.append(btn('Bật / tắt mặt cắt nghiêng',()=>update(!this.viewer?.obliqueEnabled)));
    this.fields.set('sectionPct',this._makeField('Vị trí mặt cắt (%)',50,1,99,1,v=>{this.sectionPct=v;update();}));
    this.fields.set('sectionAngle',this._makeField('Góc nghiêng mặt phẳng (°)',0,-65,65,1,v=>{this.sectionAngle=v;update();}));
  }
  if(this.viewer?.meshGroup?.supportsCrossSection){
    this.content.append(make('h4','mv14-option-title','Thi\u1ebft di\u1ec7n tr\u1ef1c quan'));
    this._makeField('V\u1ecb tr\u00ed m\u1eb7t c\u1eaft (%)',50,0,100,1,v=>this.viewer?.setCrossSection(true,v));
  }
 }

 /** Only opt-in for supported types. Never replaces MathLab6 or the 3D museum. */
 _engineChoices(){
  const modality=this.model.modality||detectModality(this.model.type);
  if(modality==='statisticschart'&&supportsECharts(this.model))return ['native','echarts'];
  if(modality==='geometry2d'&&supportsJSXGraph(this.model))return ['native','jsxgraph'];
  return [];
 }
 _renderEngineSelector(){
  const choices=this._engineChoices();if(!choices.length||this.mode!=='model')return;
  const label=make('h4','mv14-option-title','Bộ dựng hình');
  const group=make('div','mv14-lab-options mv16-engine-options');
  for(const choice of choices){
    const active=this.engineName===choice;
    const title=choice==='native'?'Bộ gốc V15.1':`${OPTIONAL_ENGINES[choice].label} (mở rộng)`;
    const button=btn(title,()=>{void this.chooseEngine(choice);});
    button.setAttribute('aria-pressed',String(active));button.classList.toggle('mv16-engine-selected',active);
    group.append(button);
  }
  this.content.append(label,group);
  this.content.append(make('p','mv14-teaching-note','Bản gốc hoạt động offline. Thư viện mở rộng chỉ chạy sau khi cài bằng CAI_THU_VIEN_MO_RONG.bat; lỗi sẽ tự quay về bộ gốc.'));
 }
 async chooseEngine(choice){
  const choices=this._engineChoices();if(!choices.includes(choice)||this.engineName===choice||this.disposed||this.mode!=='model')return false;
  const serial=++this.engineSerial;
  if(choice!=='native'){
    try{await loadOptionalEngine(choice);}catch(error){if(!this.disposed&&serial===this.engineSerial)this.onNotice(error.message);return false;}
  }
  if(this.disposed||serial!==this.engineSerial||!this.root?.isConnected||this.mode!=='model')return false;
  // Preserve numeric data and draggable points before releasing old renderer.
  if(this.viewer?.data?.values){this.chartData=[...this.viewer.data.values];this.chartKind=this.viewer.chartKind;}
  const points=this.viewer?.getState?.()?.points;
  if(points)this.geometryViewState=structuredClone(points);
  this._clearEngines();this.stage.replaceChildren();this.engineName=choice;
  try{this._initEngine();if(!this.viewer)throw Error('Trình xem không khởi tạo được');this._renderControls();this.onNotice(choice==='native'?'Đã trở lại bộ dựng hình gốc.':`Đã mở ${OPTIONAL_ENGINES[choice].label}.`);return true;}
  catch(error){
    this.onNotice(`Bộ dựng hình mở rộng gặp lỗi: ${error.message}. Đang dùng bộ gốc.`);
    this._clearEngines();this.stage.replaceChildren();this.engineName='native';this._initEngine();this._renderControls();return false;
  }
 }
 _chartControls(){
  const row=make('div','mv14-lab-options');
  const options=[['bar','Cột'],['line','Đường'],['pie','Tròn']];
  if(this.viewer?.data?.kind==='raw_numeric')options.push(['hist','Histogram'],['box','Biểu đồ hộp']);
  for(const [kind,label] of options){
    const button=btn(label,()=>{
      this.viewer?.setChartKind(kind);this.chartKind=this.viewer?.chartKind;
      for(const b of row.children)b.setAttribute('aria-pressed',String(b===button));
      this._refreshMetrics();this._save();
    });
    button.setAttribute('aria-pressed',String(this.viewer?.chartKind===kind));row.append(button);
  }
  this.content.append(row);
  this.fields=new Map();
  const values=this.viewer?.data?.values||[];
  const isRaw=this.viewer?.data?.kind==='raw_numeric';
  const limit=Math.max(100,...values.map(v=>Math.ceil(Math.abs(v)*1.5)));
  const lower=isRaw?Math.min(-100,...values.map(v=>Math.floor(v*1.5))):0;
  values.forEach((value,index)=>{
    this.fields.set(String(index),this._makeField(this.viewer.data.labels?.[index]||`Nhóm ${index+1}`,value,lower,limit,1,val=>{
      const next=[...this.viewer.data.values];next[index]=val;this.viewer.setDataValues(next);
      this.chartData=[...next];this.chartOriginal=[...next];this._refreshMetrics();this._save();
    }));
  });
  this.content.append(make('p','mv14-teaching-note','Thay số liệu ở bảng hoặc kéo đầu cột. Với mẫu số liệu thô, chọn Histogram hoặc Biểu đồ hộp để quan sát phân bố, trung vị và tứ phân vị. Số âm được hỗ trợ trong mẫu thô.'));
 }

 _attachStatsDrag(){
  const canvas=this.viewer?.canvas;if(!canvas)return;
  let dragged=-1,dragMax=1;
  const coord=e=>{
    const rect=canvas.getBoundingClientRect();
    return {x:(e.clientX-rect.left)*(this.viewer.width/(rect.width||this.viewer.width)),
      y:(e.clientY-rect.top)*(this.viewer.height/(rect.height||this.viewer.height))};
  };
  const update=e=>{
    if(dragged<0)return;
    this.pause();const {y}=coord(e),plotH=Math.max(1,this.viewer.height-95);
    const val=Math.round(clamp((this.viewer.height-55-y)/plotH*dragMax,0,Math.max(100,dragMax*1.5)));
    const values=[...this.viewer.data.values];values[dragged]=val;
    this.viewer.setDataValues(values);this.chartOriginal=[...values];this.chartData=[...values];
    this._updateOutputs({[dragged]:val});this._refreshMetrics();
  };
  const down=e=>{
    if(this.viewer.chartKind!=='bar'||e.button!==undefined&&e.button!==0)return;
    const {x,y}=coord(e),n=this.viewer.data.values.length,pad=60,available=this.viewer.width-90;
    if(n<1||available<=0||x<pad||x>pad+available||y<40||y>this.viewer.height-55)return;
    const slot=available/n,idx=Math.floor((x-pad)/slot);
    if(idx<0||idx>=n)return;
    const w=Math.min(65,slot*.65),local=x-(pad+idx*slot);
    if(local<(slot-w)/2-7||local>(slot+w)/2+7)return;
    dragged=idx;dragMax=Math.max(10,...this.viewer.data.values.map(v=>Number(v)||0));
    canvas.setPointerCapture?.(e.pointerId);update(e);
  };
  const end=()=>{if(dragged>=0)this._save();dragged=-1;};
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',update);
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  this.disposers.push(()=>{
    canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',update);
    canvas.removeEventListener('pointerup',end);canvas.removeEventListener('pointercancel',end);
  });
 }

 _updateOutputs(values){for(const [key,value] of Object.entries(values||{})){
    const control=this.fields?.get(String(key));if(!control||!Number.isFinite(Number(value)))continue;
    control.range.value=value;control.number.value=value;control.output.textContent=Number(value).toLocaleString('vi-VN',{maximumFractionDigits:2});
  }
  this.realWorld?.updateParams?.({...this.nativeParams,...(values||{})});
 }
 setProgress(p,manual=false){this.progress=clamp(p,0,1);this._showProgress();this.realWorld?.setProgress(this.progress);if(this.mode==='math6')return;
  if(this.symmetry){this.symmetry.setProgress(this.progress);if(manual)this._save();return;}
  if(!this.viewer)return;
  if(this.motionKind==='stats'){
    const base=this.chartOriginal||this.viewer.data.values;
    this.viewer.setDataValues(base.map(v=>Math.round(v*this.progress*10)/10));this._refreshMetrics();return;
  }
  const key=this.motionParam,range=TYPES[this.model.type]?.params?.[key];if(!key||!range)return;
  const target=clamp(this.nativeParams[key],range[1],range[2]);
  const startVal=clamp(range[1]+(target-range[1])*0.18,range[1],target);
  const changed=clamp(startVal+(target-startVal)*this.progress,range[1],range[2]);
  this.previewing=true;
  try{this.viewer.updateParameters(this._nativeGraphPatch(key,changed));}finally{this.previewing=false;}
  this._updateOutputs({[key]:changed});this._refreshMetrics();
 }
 _showProgress(){if(this.timeline)this.timeline.value=Math.round(this.progress*100);if(this.readout)this.readout.textContent=`${Math.round(this.progress*100)}%`;}
 togglePlay(){if(this.playing){this.pause();return;}if(this.progress>=.99)this.progress=0;
  if(this.symmetry){this.symmetry.play(this.speed);this.playing=true;this.raf=requestAnimationFrame(()=>this._syncSymmetryPlayback());return;}
  this.playing=true;this.lastFrame=0;this.lastUpdate=0;
  const tick=now=>{if(!this.playing)return;const dt=this.lastFrame?Math.min(.08,(now-this.lastFrame)/1000):0;this.lastFrame=now;
    this.progress=Math.min(1,this.progress+dt*this.speed/3.4);
    if(now-this.lastUpdate>=40||this.progress>=1){this.lastUpdate=now;this.setProgress(this.progress);}
    if(this.progress>=1){this.pause();return;}this.raf=requestAnimationFrame(tick);
  };this.raf=requestAnimationFrame(tick);
 }
 _syncSymmetryPlayback(){if(!this.playing)return;this.progress=this.symmetry?.progress||0;this._showProgress();if(!this.symmetry?.playing){this.playing=false;return;}this.raf=requestAnimationFrame(()=>this._syncSymmetryPlayback());}
 pause(){cancelLabAutoplay(this);this.playing=false;cancelAnimationFrame(this.raf);this.raf=0;this.symmetry?.pause();}
 reset(){this.pause();this.progress=0;if(this.symmetry)this.symmetry.reset();else{
    this.setProgress(0,false);
  }this._showProgress();this._refreshMetrics();}
 async openMath6(id,anchor){this._clearEngines();this.mode='math6';this.viewport.replaceChildren();this.inspector.replaceChildren();
  this.math6=new Grade6Lab({anchor,initialLabId:id,onNotice:this.onNotice});
  try{this.math6.mount(this.viewport,this.inspector);}catch(error){this.onNotice(error.message);this.math6=null;}
 }
 async exportPNG(){let data;try{data=this.symmetry?.canvas?.toDataURL('image/png')||await this.viewer?.exportSnapshot?.();}catch(error){this.onNotice(`Không thể xuất ảnh: ${error.message}`);}
  if(!data)return this.onNotice('Kh\u00f4ng th\u1ec3 xu\u1ea5t \u1ea3nh tr\u00ean tr\u00ecnh duy\u1ec7t n\u00e0y.');const a=document.createElement('a');a.href=data;a.download=`MATHVERSE_LAB_${this.model.grade}_${this.model.id}.png`;document.body.append(a);a.click();a.remove();}
 exportJSON(){this._save();const blob=new Blob([JSON.stringify({grade:this.model.grade,zone:this.zone,model:this.model.id,params:this.nativeParams,data:this.viewer?.data||null},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`mathverse-lab-${this.model.id}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
 dispose(){this.disposed=true;this.engineSerial++;this._save();this._clearEngines();this.viewport?.replaceChildren();this.inspector?.replaceChildren();}
}
