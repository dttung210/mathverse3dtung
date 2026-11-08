import {isGrade10Mode,grade10Defaults,grade10Schema,grade10Valid,grade10InvalidReason,grade10Family,grade10Math,GRADE10_EXPLORE_DATA} from './grade10-engine.mjs';
import {grade10SceneSVG,GRADE10_VIEW} from './grade10-svg.mjs';
import {mountRenderedFormula,formatMathText} from './math-formula-renderer.mjs';
import {getGuidedDiscoveryPlan} from './guided-discovery.mjs';
import {createStageInteractivity,decorateInteractiveSVG,tryStartLabelOrPointDrag,handleLabelOrPointMove,stopLabelOrPointDrag,bindFrameWheelZoom,resetStageInteractivity} from './svg-stage-interactivity.mjs';
import {scheduleLabAutoplay,cancelLabAutoplay,isAutoPlayEnabled,setAutoPlayEnabled} from './lab-autoplay.mjs';
const make=(tag,content='',cls='')=>{const e=document.createElement(tag);e.textContent=content;if(cls)e.className=cls;return e;};
const fmt=x=>Number.isFinite(x)?Number(x.toFixed(3)).toLocaleString('vi-VN'):'-';
const lim=(x,min,max)=>Math.max(min,Math.min(max,x));
const snap=(v,s)=>{const st=Number(s?.step)||.1,mn=Number(s?.min)??-10,mx=Number(s?.max)??10;return Number((mn+Math.round((lim(Number(v),mn,mx)-mn)/st)*st).toFixed(4));};
const btn=(label,action)=>{const e=make('button',label,'mv-g7-button');e.type='button';e.addEventListener('click',action);return e;};
const PHASE_STOPS=[0,1.25,2.75,4.6];
/** Fully independent Grade10 2D mathematics viewer; Grade10 has no core volumetric-solid chapter. */
export class Grade10Lab{
 constructor(){this.events=[];this.playing=false;this.t=0;this.trials=0;this.raf=0;this.prev=0;this.destroyed=false;this.drag=null;this.seed=20261026;this.lockSides=false;this.showAux=true;this.lockedB=null;this.lastValidSvg='';this.flags={};this.labelOffsets=new Map();this.stageState=createStageInteractivity();}
 listen(el,type,fn){el.addEventListener(type,fn);this.events.push([el,type,fn]);}
 _key(){return 'mathverse:r74c:gd5:10:'+(this.mode?.displayCode||this.mode?.id||this.id);}
 _defaultParams(){
  const d=grade10Defaults(this.id),sub=this.mode?.subMode||null;
  if(sub==='add')return {...d,n:4,k:3,wanted:2};
  if(sub==='multiply')return {...d,n:3,k:4,wanted:2};
  if(sub==='P')return {...d,n:5,k:3,wanted:2};
  if(sub==='A')return {...d,n:5,k:3,wanted:2};
  if(sub==='C')return {...d,n:5,k:3,wanted:2};
  return d;
 }
 _resetFlags(){
  const sub=this.mode?.subMode||null;
  this.flags={
   swapDiff:false,openBLeft:false,strictIneq:false,sgk4Lines:true,testM:[0,0],compareVertices:false,vecRule:'parallelogram',compareRev:false,translateAB:false,skewLine:false,branch:1,mAng:0.65,mY:2.0,
   ruleMode:sub==='multiply'?'multiply':'add',
   orderMode:sub==='C'?'unordered':sub==='P'?'perm':'ordered',
   combTab:(sub==='P'||sub==='A'||sub==='C')?sub:'P',
   permStep:0,arrStep:0,bagSpin:0,
   lockedSubMode:sub
  };
  if(this.labelOffsets)this.labelOffsets.clear();
  if(this.stageState)resetStageInteractivity(this.stageState,this.viewport);
 }
 load(){const d=this._defaultParams();try{const v=JSON.parse(localStorage.getItem(this._key())||'null');if(v&&typeof v==='object'){const p={...d,...v};for(const f of grade10Schema(this.id))if(Number.isFinite(p[f.key]))p[f.key]=snap(p[f.key],f);if(grade10Valid(this.id,p))return p;}}catch{}return d;}
 save(){try{localStorage.setItem(this._key(),JSON.stringify(this.params));}catch{}}
 mount(container,id,mode){if(!isGrade10Mode(id))throw Error('Unsupported Grade10 mode');this.id=id;this.mode=mode;this.params=this.load();this.lockSides=false;this.showAux=true;this._resetFlags();this.lockedB=Math.hypot(this.params.cx||0,this.params.cy||1);this.container=container;container.replaceChildren();container.classList.add('mv-g7-host','mv-g10-host');
  container.append(make('p',mode?.student_interaction||'Mô hình Toán 10 tương tác trực quan','mv-r5-statement'));
  this.viewport=make('div','','mv-g7-viewport mv-g7-svg-stage');container.append(this.viewport);
  this.status=make('p','','mv-g7-status');this.status.setAttribute('aria-live','polite');container.append(this.status);
  this.metrics=make('div','','mv-r5-values');container.append(this.metrics);
  const actions=make('div','','mv-g7-buttons');container.append(actions);
  const maxTime=id==='10-11-C03'?8:6;
  this.play=btn('▶ Phát chuyển động (6s)',()=>this.setPlaying(!this.playing));actions.append(this.play);
  actions.append(btn('⏮ Bước trước',()=>{
   this.setPlaying(false);
   const prevStop=[...PHASE_STOPS].reverse().find(s=>s<this.t-0.15);
   this.t=prevStop!==undefined?prevStop:0;
   this.draw();
  }));
  actions.append(btn('⏭ Tiếp bước pha',()=>{
   this.setPlaying(false);
   const nextStop=PHASE_STOPS.find(s=>s>this.t+0.15);
   this.t=nextStop!==undefined?nextStop:maxTime;
   this.draw();
  }));
  this.auxBtn=btn('📐 Lớp phụ trợ: Bật',()=>{this.showAux=!this.showAux;this.auxBtn.textContent=this.showAux?'📐 Lớp phụ trợ: Bật':'📐 Lớp phụ trợ: Tắt';this.draw();});
  actions.append(this.auxBtn);
  actions.append(btn('↺ Đặt lại',()=>{
   this.setPlaying(false);this.params=this._defaultParams();this.t=0;this.trials=0;this.lockSides=false;this._resetFlags();this.lockedB=Math.hypot(this.params.cx||0,this.params.cy||1);
   if(this.lockBtn)this.lockBtn.textContent='🔓 Khóa 2 cạnh AB, AC: Tắt';
   this.syncControls();this.save();this.draw();
  }));
  for(const pct of [0,33,50,66,100]){
   actions.append(btn(`${pct}%`,()=>this.setProgress(pct)));
  }
  const autoBtn=btn(isAutoPlayEnabled(this)?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt',()=>{const next=setAutoPlayEnabled(this,!isAutoPlayEnabled(this));autoBtn.textContent=next?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt';});
  actions.append(autoBtn);
  if(id==='10-01-C02'){
   const swapBtn=btn('⇄ Đảo vai A\\B ↔ B\\A',()=>{this.flags.swapDiff=!this.flags.swapDiff;swapBtn.textContent=this.flags.swapDiff?'⇄ Đang chọn: B \\ A':'⇄ Đang chọn: A \\ B';this.draw();});
   actions.append(swapBtn);
  }
  if(id==='10-01-C04'){
   const openBtn=btn('[ ] ↔ ( ] Đầu trái B: Đóng [',()=>{this.flags.openBLeft=!this.flags.openBLeft;openBtn.textContent=this.flags.openBLeft?'[ ] ↔ ( ] Đầu trái B: Mở (':'[ ] ↔ ( ] Đầu trái B: Đóng [';this.draw();});
   actions.append(openBtn);
  }
  if(id==='10-02-C01'){
   const strictBtn=btn('≤ ↔ < Đổi dấu: ≤ (Nét liền)',()=>{this.flags.strictIneq=!this.flags.strictIneq;strictBtn.textContent=this.flags.strictIneq?'≤ ↔ < Đổi dấu: < (Nét đứt)':'≤ ↔ < Đổi dấu: ≤ (Nét liền)';this.draw();});
   actions.append(strictBtn);
   actions.append(btn('↺ Đặt lại M(0; 0)',()=>{this.flags.testM=[0,0];this.draw();}));
  }
  if(id==='10-02-C02'){
   actions.append(btn('↺ Đặt lại M(0; 0)',()=>{this.flags.testM=[0,0];this.draw();}));
  }
  if(id==='10-02-C03'){
   const compBtn=btn('📊 So sánh giá trị tại các đỉnh',()=>{this.flags.compareVertices=!this.flags.compareVertices;compBtn.textContent=this.flags.compareVertices?'📊 Ẩn bảng đỉnh':'📊 So sánh giá trị tại các đỉnh';this.draw();});
   actions.append(compBtn);
   const sgkBtn=btn('📐 Hệ 4 đường SGK: Bật',()=>{this.flags.sgk4Lines=!this.flags.sgk4Lines;sgkBtn.textContent=this.flags.sgk4Lines?'📐 Hệ 4 đường SGK: Bật':'📐 Hệ 4 đường SGK: Tắt';this.draw();});
   actions.append(sgkBtn);
  }
  if(id==='10-03-C01'){
   this.lockBtn=btn('🔓 Khóa 2 cạnh AB, AC: Tắt',()=>{this.lockSides=!this.lockSides;this.lockedB=Math.hypot(this.params.cx,this.params.cy);this.lockBtn.textContent=this.lockSides?'🔒 Khóa 2 cạnh AB, AC: Bật':'🔓 Khóa 2 cạnh AB, AC: Tắt';this.draw();});
   actions.append(this.lockBtn);
  }
  if(id==='10-04-C01'){
   const ruleBtn=btn('⇄ Quy tắc: Hình bình hành',()=>{this.flags.vecRule=this.flags.vecRule==='parallelogram'?'triangle':'parallelogram';ruleBtn.textContent=this.flags.vecRule==='parallelogram'?'⇄ Quy tắc: Hình bình hành':'⇄ Quy tắc: 3 điểm nối tiếp';this.draw();});
   actions.append(ruleBtn);
  }
  if(id==='10-04-C02'){
   const revBtn=btn('⇄ So sánh với v⃗ − u⃗: Tắt',()=>{this.flags.compareRev=!this.flags.compareRev;revBtn.textContent=this.flags.compareRev?'⇄ So sánh với v⃗ − u⃗: Bật':'⇄ So sánh với v⃗ − u⃗: Tắt';this.draw();});
   actions.append(revBtn);
  }
  if(id==='10-05-C01'){
   const trBtn=btn('⇄ Tịnh tiến đồng thời A, B: Tắt',()=>{this.flags.translateAB=!this.flags.translateAB;trBtn.textContent=this.flags.translateAB?'⇄ Tịnh tiến đồng thời A, B: Bật':'⇄ Tịnh tiến đồng thời A, B: Tắt';this.draw();});
   actions.append(trBtn);
  }
  if(id==='10-08-C03'){
   const skewBtn=btn('📐 Đường thử lệch góc: Tắt',()=>{this.flags.skewLine=!this.flags.skewLine;skewBtn.textContent=this.flags.skewLine?'📐 Đường thử lệch góc: Bật':'📐 Đường thử lệch góc: Tắt';this.draw();});
   actions.append(skewBtn);
  }
  if(id==='10-09-C02'){
   const brBtn=btn('⇄ Nhánh của M: Nhánh phải',()=>{this.flags.branch=this.flags.branch===1?-1:1;brBtn.textContent=this.flags.branch===1?'⇄ Nhánh của M: Nhánh phải':'⇄ Nhánh của M: Nhánh trái';this.draw();});
   actions.append(brBtn);
  }
  if(id==='10-11-C01'&&!this.flags.lockedSubMode){
   actions.append(btn('➕ Mô hình Quy tắc Cộng',()=>{this.flags.ruleMode='add';this.draw();}));
   actions.append(btn('✖ Mô hình Quy tắc Nhân',()=>{this.flags.ruleMode='multiply';this.draw();}));
  }
  if(id==='10-11-C02'&&!this.flags.lockedSubMode){
   actions.append(btn('🔢 Mô hình Hoán vị Pₙ',()=>{this.flags.combTab='P';this.flags.orderMode='perm';this.draw();}));
   actions.append(btn('🎯 Mô hình Chỉnh hợp Aₙᵏ',()=>{this.flags.combTab='A';this.flags.orderMode='ordered';this.draw();}));
   actions.append(btn('🧺 Mô hình Tổ hợp Cₙᵏ',()=>{this.flags.combTab='C';this.flags.orderMode='unordered';this.draw();}));
  }
  if(this.flags.lockedSubMode==='P'){
   actions.append(btn('🔀 Đổi chỗ 2 vị trí liền kề (Sinh hoán vị mới)',()=>{this.setPlaying(false);this.flags.permStep=(this.flags.permStep||0)+1;this.draw();}));
  }
  if(this.flags.lockedSubMode==='A'){
   actions.append(btn('🔢 Xem từng bước chọn ghế (Bước 1 → k)',()=>{this.setPlaying(false);this.t=0;const maxK=Math.min(5,Math.min(this.params.k||1,this.params.n||1));this.flags.arrStep=((this.flags.arrStep||0)+1)%(maxK+1);this.draw();}));
   actions.append(btn('⇄ Đổi chỗ Ghế 1 ↔ Ghế 2 (Đảo thứ tự)',()=>{this.setPlaying(false);this.t=0;this.flags.arrStep=0;this.flags.permStep=(this.flags.permStep||0)^1;this.draw();}));
   actions.append(btn('👉 Chọn bộ ứng viên khác',()=>{this.setPlaying(false);this.t=0;this.flags.arrStep=0;this.flags.permStep=(Math.floor((this.flags.permStep||0)/2)+1)*2;this.draw();}));
  }
  if(this.flags.lockedSubMode==='C'){
   actions.append(btn('🔄 Xáo trộn trong giỏ (Tập con không đổi!)',()=>{this.setPlaying(false);this.flags.bagSpin=(this.flags.bagSpin||0)+1;this.draw();}));
   actions.append(btn('👉 Chọn tập con tiếp theo',()=>{this.setPlaying(false);this.flags.permStep=(this.flags.permStep||0)+1;this.draw();}));
  }
  if(grade10Family(id)==='10-11'&&id==='10-11-C03'){
   actions.append(btn('🎲 Rút 1 quả',()=>{this.setPlaying(false);this.trials=Math.min(2000,this.trials+1);this.t=2.5;this.draw();}));
   actions.append(btn('🎲 Rút 10 quả',()=>{this.setPlaying(false);this.trials=Math.min(2000,this.trials+10);this.t=2.5;this.draw();}));
   actions.append(btn('🎲 Rút 50 quả',()=>{this.setPlaying(false);this.trials=Math.min(2000,this.trials+50);this.t=2.5;this.draw();}));
   actions.append(btn('↺ Xóa lượt rút',()=>{this.setPlaying(false);this.trials=0;this.t=0;this.draw();}));
  }
  const timelineLabel=make('label',`Tua chuyển động (0–${maxTime} s)`,'mv-g7-timeline');this.timeline=make('input');this.timeline.type='range';this.timeline.min=0;this.timeline.max=maxTime;this.timeline.step='.05';this.timeline.value=0;timelineLabel.append(this.timeline);container.append(timelineLabel);
  this.listen(this.timeline,'input',()=>{this.setPlaying(false);this.t=Number(this.timeline.value);this.draw();});
  this.fields=new Map();const grid=make('div','','mv-r5-params');for(const f of grade10Schema(id)){
   if(this.flags.lockedSubMode==='P'&&f.key==='k')continue;
   const lblText=this.flags.lockedSubMode==='P'&&f.key==='n'?'Số phần tử cần hoán vị n':
    this.flags.lockedSubMode==='A'&&f.key==='n'?'Tổng số ứng viên ban đầu n':
    this.flags.lockedSubMode==='A'&&f.key==='k'?'Số bục xếp hạng cần trao k':
    this.flags.lockedSubMode==='C'&&f.key==='n'?'Số phần tử tập gốc n':
    this.flags.lockedSubMode==='C'&&f.key==='k'?'Số phần tử mỗi tập con k':
    (id==='10-11-C01'&&f.key==='n'?'Số cách phương án A (m)':
     id==='10-11-C01'&&f.key==='k'?'Số cách phương án B (n)':
     id==='10-11-C03'&&f.key==='n'?'Tổng số bóng trong hộp n(Ω)':
     id==='10-11-C03'&&f.key==='wanted'?'Số bóng Xanh thuận lợi n(A)':
     f.label);
   const label=make('label','','mv-r5-param'),caption=make('span',formatMathText(lblText),'mv-r5-param-label'),output=make('output',fmt(this.params[f.key]));const slider=make('input');slider.type='range';slider.min=f.min;slider.max=f.max;slider.step=f.step;slider.value=this.params[f.key];
   this.listen(slider,'input',()=>{this.setPlaying(false);if(this.id==='10-03-C01')this.t=0;this.params[f.key]=Number(slider.value);if(this.id==='10-03-C01')this.lockedB=Math.hypot(this.params.cx,this.params.cy);if(grade10Family(this.id)==='10-11'){if(this.id!=='10-11-C01')this.params.k=Math.min(this.params.k,this.params.n);this.params.wanted=Math.min(this.params.wanted,this.params.n);}this.trials=0;this.save();this.syncControls();this.draw();});
   label.append(caption,output,slider);grid.append(label);this.fields.set(f.key,{slider,output});
  }container.append(grid);
  const subExpMap={
   add:{
    question:'Khi nào ta cộng số cách (m + n) thay vì nhân (m × n)?',
    explanation:'Quy tắc cộng áp dụng khi công việc được hoàn thành bằng MỘT trong hai phương án độc lập, xung khắc nhau (chọn A thì thôi B). Vì hai tập phương án rời nhau nên tổng số cách chọn là m + n.',
    presets:[
     {label:'Phương án A (4 cách) HOẶC B (3 cách) → 4 + 3 = 7 cách',params:{n:4,k:3,wanted:2}},
     {label:'Phương án A (5 cách) HOẶC B (2 cách) → 5 + 2 = 7 cách',params:{n:5,k:2,wanted:2}},
     {label:'Phương án A (6 cách) HOẶC B (4 cách) → 6 + 4 = 10 cách',params:{n:6,k:4,wanted:2}}
    ]
   },
   multiply:{
    question:'Vì sao công việc gồm 2 công đoạn liên tiếp lại nhân số cách (m × n)?',
    explanation:'Vì công việc đòi hỏi phải hoàn thành cả Công đoạn 1 (m cách) VÀ tiếp nối Công đoạn 2 (n cách). Ứng với mỗi nhánh ở Công đoạn 1 đều tỏa ra đủ n nhánh ở Công đoạn 2, tạo thành bảng ghép đôi m × n bộ.',
    presets:[
     {label:'3 áo × 4 quần → 12 bộ phối đồ',params:{n:3,k:4,wanted:2}},
     {label:'4 chặng đầu × 3 chặng sau → 12 lộ trình',params:{n:4,k:3,wanted:2}},
     {label:'5 bước đầu × 4 bước sau → 20 tổ hợp nhánh',params:{n:5,k:4,wanted:2}}
    ]
   },
   P:{
    question:'Điểm khác biệt cốt lõi của Hoán vị Pₙ = n! so với Chỉnh hợp và Tổ hợp là gì?',
    explanation:'Hoán vị dùng TẤT CẢ n phần tử (không bỏ sót phần tử nào) để xếp vào n vị trí có thứ tự. Chỉ cần đổi chỗ 2 vị trí bất kỳ (VTi ↔ VTj) là sinh ra một hoán vị mới, số cách chọn giảm dần từ n xuống 1: Pₙ = n × (n−1) × ... × 1 = n!.',
    presets:[
     {label:'Hoán vị 3 phần tử → P₃ = 3! = 6 cách xếp hàng',params:{n:3,k:3,wanted:2}},
     {label:'Hoán vị 4 phần tử → P₄ = 4! = 24 cách xếp hàng',params:{n:4,k:3,wanted:2}},
     {label:'Hoán vị 5 phần tử → P₅ = 5! = 120 cách xếp hàng',params:{n:5,k:3,wanted:2}}
    ]
   },
   A:{
    question:'Vì sao Chỉnh hợp Aₙᵏ = n! / (n − k)! lại chia cho (n − k)! và khác Tổ hợp ở đâu?',
    explanation:'Chỉnh hợp chỉ chọn k phần tử từ n ứng viên để trao k thứ hạng khác nhau (🥇 Hạng 1 ≠ 🥈 Hạng 2), còn (n − k) ứng viên bị đưa vào Kho loại bỏ nên phải chia cho (n − k)! để cắt bỏ đuôi giai thừa thừa. Khác với Tổ hợp: trên bục trao giải, đổi chỗ Hạng 1 và Hạng 2 tạo ra 2 chỉnh hợp hoàn toàn khác nhau!',
    presets:[
     {label:'Trao 3 giải (🥇🥈🥉) từ 5 ứng viên → A₅³ = 5×4×3 = 60',params:{n:5,k:3,wanted:2}},
     {label:'Chọn Chủ tịch & Phó chủ tịch từ 4 người → A₄² = 4×3 = 12',params:{n:4,k:2,wanted:2}},
     {label:'Xếp 4 vị trí từ 6 ứng viên → A₆⁴ = 6×5×4×3 = 360',params:{n:6,k:4,wanted:2}}
    ]
   },
   C:{
    question:'Vì sao Tổ hợp Cₙᵏ = Aₙᵏ / k! lại đi qua phễu khử thứ tự chia cho k!?',
    explanation:'Trong Tổ hợp, các phần tử được gom vào một giỏ tập hợp { ... } bình đẳng, không có ghế Hạng 1 hay Hạng 2. Mọi cách xếp thứ tự k! của cùng k phần tử khi đổ qua phễu đều gom về đúng 1 tập con duy nhất, nên số tổ hợp giảm đi k! lần so với chỉnh hợp: Cₙᵏ = Aₙᵏ / k!.',
    presets:[
     {label:'Chọn 3 bạn trực nhật từ 5 bạn → C₅³ = 60 / 3! = 10 tập con',params:{n:5,k:3,wanted:2}},
     {label:'Chọn 2 điểm nối đoạn thẳng từ 4 điểm → C₄² = 12 / 2! = 6 tập con',params:{n:4,k:2,wanted:2}},
     {label:'Tính đối xứng: C₆² = C₆⁴ = 15 tập con',params:{n:6,k:2,wanted:2}}
    ]
   }
  };
  const expData=subExpMap[this.flags.lockedSubMode]||GRADE10_EXPLORE_DATA[id];
  if(expData){
   const expBox=make('div','','mv-r5-explore');
   expBox.style.cssText='margin-top:8px;padding:10px 12px;border-radius:10px;background:#f2f8fc;border:1px solid #c5dfee;font-size:13px;color:#123b52;';
   const qTitle=make('strong','🔍 Hoạt động khám phá (1–2 phút): ');
   const qText=make('span',formatMathText(expData.question));
   const presetRow=make('div','','mv-g7-buttons');presetRow.style.marginTop='6px';
   for(const preset of expData.presets||[]){
    presetRow.append(btn(formatMathText(preset.label),()=>{
     this.setPlaying(false);this.t=0;
     this.params={...this.params,...preset.params};
     const keepLock=this.flags.lockedSubMode;
     if(preset.flags)this.flags={...this.flags,...preset.flags};
     if(keepLock){
      this.flags.lockedSubMode=keepLock;
      if(keepLock==='add'||keepLock==='multiply')this.flags.ruleMode=keepLock;
      if(keepLock==='P'||keepLock==='A'||keepLock==='C'){this.flags.combTab=keepLock;this.flags.orderMode=keepLock==='C'?'unordered':keepLock==='P'?'perm':'ordered';}
     }
     if(Number.isFinite(this.params.cx)&&Number.isFinite(this.params.cy))this.lockedB=Math.hypot(this.params.cx,this.params.cy);
     this.syncControls();this.save();this.draw();
    }));
   }
   const ansEl=make('p',formatMathText(`💡 Giải thích: ${expData.explanation}`),'mv-r5-exp-answer');
   ansEl.style.cssText='display:none;margin:8px 0 0;padding:8px 10px;background:#e6f6f0;border-left:3px solid #12876f;border-radius:6px;color:#0d4f3f;font-weight:600;';
   const explainBtn=btn('💡 Hiện giải thích',()=>{const open=ansEl.style.display==='none';ansEl.style.display=open?'block':'none';explainBtn.textContent=open?'🙈 Ẩn giải thích':'💡 Hiện giải thích';});
   presetRow.append(explainBtn);
   expBox.append(qTitle,qText,presetRow,ansEl);
   container.append(expBox);
  }
  this.latex=make('div','','mv-r5-latex');const copy=btn('📋 Sao chép LaTeX',async()=>{try{await navigator.clipboard.writeText(this.latex.dataset.rawLatex||this.latex.textContent);copy.textContent='✓ Đã sao chép';}catch{copy.textContent='Bôi đen mã LaTeX để sao chép';}});
  container.append(copy,this.latex,make('p','Hình 2D động theo dữ liệu thật. Điểm tròn có thể kéo để đổi hình; chữ/nhãn có thể kéo trực tiếp để dời vị trí.','mv-r5-hint'));
  this.bindDrag();this.t=0;this.draw();scheduleLabAutoplay(this,{delay:90,reset:false});
 }
 syncControls(){for(const [k,f] of this.fields){f.slider.value=this.params[k];f.output.textContent=fmt(this.params[k]);}}
 setPlaying(state){if(this.destroyed)return;if(!state)cancelLabAutoplay(this);this.playing=!!state;if(this.playing&&this.t>=(this.id==='10-11-C03'?8:6))this.t=0;if(this.play)this.play.textContent=this.playing?'⏸ Tạm dừng':'▶ Phát chuyển động (6s)';this.prev=0;if(this.playing&&!this.raf)this.raf=requestAnimationFrame(now=>this.step(now));}
 setProgress(pct){
  if(this.destroyed)return;
  this.setPlaying(false);
  const period=this.id==='10-11-C03'?8:6;
  const f=Math.max(0,Math.min(1,Number(pct)/100));
  this.t=Number((f*period).toFixed(3));
  if(this.id==='10-11-C03'){
   this.trials=f===0?0:f<=0.35?10:f<=0.70?50:120;
  }
  if(this.timeline)this.timeline.value=this.t;
  this.draw();
 }
 step(now){this.raf=0;if(!this.playing||this.destroyed)return;const delta=this.prev?Math.min(.09,(now-this.prev)/1000):.016;this.prev=now;const period=this.id==='10-11-C03'?8:6;const prevCycle=Math.floor(this.t/4);this.t=Math.min(period,this.t+delta);const curCycle=Math.floor(this.t/4);if(this.id==='10-11-C03'&&curCycle!==prevCycle)this.trials=Math.min(2000,this.trials+1);this.draw();if(this.t>=period){this.setPlaying(false);return;}this.raf=requestAnimationFrame(n=>this.step(n));}
 _svgPoint(e){
  const svg=this.viewport.querySelector('svg'),rc=svg?.getBoundingClientRect();
  if(!rc?.width||!rc?.height)return null;
  let x=394+550*(e.clientX-rc.left)/rc.width,y=74+424*(e.clientY-rc.top)/rc.height;
  try{const ctm=svg.getScreenCTM?.();if(ctm&&typeof DOMPoint==='function'){const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(ctm.inverse());x=point.x;y=point.y;}}catch{}
  return [x,y];
 }
 _decorateDraggableLabels(){
  decorateInteractiveSVG(this.viewport,this.stageState);
 }
 bindDrag(){
  bindFrameWheelZoom(this.viewport,this.stageState,(el,type,fn)=>this.listen(el,type,fn));
  this.listen(this.viewport,'pointerdown',e=>{
   const subEl=e.target?.closest?.('[data-submodel]');
   if(subEl){
    const sub=subEl.getAttribute('data-submodel');
    if(this.id==='10-11-C01'&&(sub==='add'||sub==='multiply')){this.flags.ruleMode=sub;this.draw();return;}
    if(this.id==='10-11-C02'&&(sub==='P'||sub==='A'||sub==='C')){this.flags.combTab=sub;this.flags.orderMode=sub==='C'?'unordered':sub==='P'?'perm':'ordered';this.draw();return;}
   }
   const permEl=e.target?.closest?.('[data-perm-idx]');
   if(permEl){
    this.setPlaying(false);this.t=0;this.flags.arrStep=0;
    this.flags.permStep=Number(permEl.getAttribute('data-perm-idx'))||0;
    this.draw();return;
   }
   let name=e.target?.closest?.('[data-handle]')?.getAttribute?.('data-handle')||e.target?.getAttribute?.('data-handle');
   if(!name){
    if(tryStartLabelOrPointDrag(e,this.viewport,this.stageState)){this.drag='__stage_free__';return;}
    const handles=[...this.viewport.querySelectorAll('[data-handle]')];
    let best=null,bestD=48;
    for(const el of handles){const r=el.getBoundingClientRect(),d=Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2));if(d<bestD){bestD=d;best=el.getAttribute('data-handle');}}
    name=best||'__canvas__';
   }
   this.drag=name;this.setPlaying(false);if(this.id==='10-03-C01')this.t=0;try{this.viewport.setPointerCapture(e.pointerId);}catch{}e.preventDefault();});
  this.listen(this.viewport,'pointermove',e=>{if(!this.drag)return;
   if(this.drag==='__stage_free__'){handleLabelOrPointMove(e,this.viewport,this.stageState);return;}
   const pt=this._svgPoint(e);if(!pt)return;const [x,y]=pt;
   const wx=(x-GRADE10_VIEW.ox)/GRADE10_VIEW.unit,wy=(GRADE10_VIEW.oy-y)/GRADE10_VIEW.unit,p=this.params,fam=grade10Family(this.id),key=this.drag;
   if(this.id==='10-01-C04'&&['l1','r1','l2','r2'].includes(key)){
    const v=Math.round(lim((x-452)/36-6,-5,5));
    if(key==='l1')p.l1=Math.min(v,p.r1);
    else if(key==='r1')p.r1=Math.max(v,p.l1);
    else if(key==='l2')p.l2=Math.min(v,p.r2);
    else if(key==='r2')p.r2=Math.max(v,p.l2);
   }
   else if(fam==='10-01'&&['onlyA','inter','onlyB'].includes(key)){
    const count=Math.round(lim((430-y)/26,0,12));
    if(key==='onlyA')p.onlyA=count;
    else if(key==='inter')p.both=count;
    else if(key==='onlyB')p.onlyB=count;
   }
   else if(this.id==='10-02-C01'||this.id==='10-02-C02'||this.id==='10-02-C03'){
    if(key==='M'||key==='__canvas__'){
     this.flags.testM=[Number(lim(wx,-6,6).toFixed(1)),Number(lim(wy,-5,5).toFixed(1))];
    }else if(key==='P1'||key==='d1'){
     p.c=Math.round(lim(p.a*wx+p.b*wy,-8,8));
    }else if(key==='P2'||key==='d2'){
     p.f=Math.round(lim(p.d*wx+p.e*wy,-8,8));
    }else if(key==='U'||key==='grad'){
     const nu=Math.round(lim(wx,-3,3)),nv=Math.round(lim(wy,-3,3));
     if(nu!==0||nv!==0){p.u=nu;p.v=nv;}
    }
   }
   else if(fam==='10-03'){
    if(key==='B'){p.base=lim(Number(((x-GRADE10_VIEW.triOrigin[0])/GRADE10_VIEW.triScale).toFixed(2)),2,8);}
    else if(this.id==='10-03-C01'&&this.lockSides){
     const bLen=Math.max(1.5,Math.min(7.5,this.lockedB||Math.hypot(p.cx,p.cy)));
     const rawAng=Math.atan2(GRADE10_VIEW.triOrigin[1]-y,x-GRADE10_VIEW.triOrigin[0]);
     const minSin=Math.min(0.95,1.02/bLen),minAng=Math.max(0.22,Math.asin(minSin)),maxAng=Math.min(2.65,Math.PI-minAng);
     const ang=lim(rawAng,minAng,maxAng);
     p.cx=lim(Number((bLen*Math.cos(ang)).toFixed(2)),-3,9);
     p.cy=lim(Number((bLen*Math.sin(ang)).toFixed(2)),1,8);
    }else{
     p.cx=lim(Number(((x-GRADE10_VIEW.triOrigin[0])/GRADE10_VIEW.triScale).toFixed(2)),-3,9);
     p.cy=lim(Number(((GRADE10_VIEW.triOrigin[1]-y)/GRADE10_VIEW.triScale).toFixed(2)),1,8);
     this.lockedB=Math.hypot(p.cx,p.cy);
    }
   }
   else if(fam==='10-04'){
    if(key==='U'||key==='__canvas__'){p.ux=snap(wx,{min:-5,max:5,step:.5});p.uy=snap(wy,{min:-5,max:5,step:.5});}
    if(key==='V'){p.vx=snap(wx,{min:-5,max:5,step:.5});p.vy=snap(wy,{min:-5,max:5,step:.5});}
    if(key==='K'){
     const u2=p.ux*p.ux+p.uy*p.uy;
     if(u2>1e-4)p.k=snap((wx*p.ux+wy*p.uy)/u2,{min:-3,max:3,step:.25});
    }
   }
   else if(fam==='10-05'){if(key==='A'||key==='__canvas__'){p.ax=snap(wx,{min:-5,max:5,step:.5});p.ay=snap(wy,{min:-5,max:5,step:.5});}if(key==='B'){p.bx=snap(wx,{min:-5,max:5,step:.5});p.by=snap(wy,{min:-5,max:5,step:.5});}if(key==='V'){p.vx=snap(wx,{min:-5,max:5,step:.5});p.vy=snap(wy,{min:-5,max:5,step:.5});}}
   else if(fam==='10-07'){
    if(key==='N'){
     const na=Math.round(lim(wx,-4,4)),nb=Math.round(lim(wy,-4,4));
     if(na!==0||nb!==0){p.a=na;p.b=nb;}
    }else if(key==='P'||key==='__canvas__'){p.px=snap(wx,{min:-5,max:5,step:.5});p.py=snap(wy,{min:-5,max:5,step:.5});}
   }
   else if(fam==='10-08'){
    if(key==='I'){p.h=snap(wx,{min:-3,max:3,step:.25});p.k=snap(wy,{min:-3,max:3,step:.25});}
    else if(key==='Hsec'){p.q=snap(wy-p.m*wx,{min:-4,max:4,step:.25});}
    else if(key==='T'||key==='__canvas__'){p.angle=snap((Math.atan2(wy-p.k,wx-p.h)*180/Math.PI+360)%360,{min:0,max:360,step:5});}
   }
   else if(fam==='10-09'){
    if(key==='A'){p.a=snap(Math.abs(wx),{min:1.5,max:6,step:.25});if(this.id==='10-09-C01'&&p.b>=p.a)p.b=Math.max(1,Number((p.a-0.25).toFixed(2)));}
    else if(key==='B'){p.b=snap(Math.abs(wy),{min:1,max:this.id==='10-09-C01'?Math.max(1,p.a-0.25):5,step:.25});}
    else if(key==='F'){p.p=snap(Math.max(0.5,2*wx),{min:0.5,max:6,step:.25});}
    else if(key==='M'||key==='__canvas__'){
     this.t=0;
     this.flags.mAng=Math.atan2(wy/Math.max(0.5,p.b),wx/Math.max(0.5,p.a));
     this.flags.mY=lim(wy,-3.8,3.8);
     if(this.id==='10-09-C02')this.flags.branch=wx<0?-1:1;
    }
   }
   else if(fam==='10-10'){
    if(this.id==='10-10-C04'&&['exact','estimate'].includes(key)){
     const val=snap(((x-450)/430)*15-5,{min:-5,max:10,step:.1});
     if(key==='exact')p.exact=val;
     else p.estimate=val;
    }else if(key==='outlier'){
     p.outlier=snap(((246-y)/116)*18,{min:0,max:20,step:.5});
    }else if(String(key).startsWith('bar-')){
     p.center=snap(((246-y)/116)*14,{min:2,max:14,step:.5});
    }
   }
   else{
    const sch=grade10Schema(this.id);
    if(sch[0]){const f0=sch[0],r0=lim((x-416)/504,0,1);p[f0.key]=snap(f0.min+r0*(f0.max-f0.min),f0);}
    if(sch[1]){const f1=sch[1],r1=lim((430-y)/340,0,1);p[f1.key]=snap(f1.min+r1*(f1.max-f1.min),f1);}
    if(fam==='10-11'){if(this.id!=='10-11-C01')p.k=Math.min(p.k,p.n);p.wanted=Math.min(this.params.wanted,p.n);}
   }
   this.syncControls();this.save();this.draw();e.preventDefault();
  });for(const kind of ['pointerup','pointercancel','lostpointercapture'])this.listen(this.viewport,kind,()=>{stopLabelOrPointDrag(this.stageState);this.drag=null;});
 }
 draw(){if(this.destroyed)return;try{if(!grade10Valid(this.id,this.params))throw Error(grade10InvalidReason(this.id,this.params));
  const opts={tries:this.trials,seed:this.seed,showAux:this.showAux,lockSides:this.lockSides,...this.flags};
  const v=grade10Math(this.id,this.params,opts),svg=grade10SceneSVG(this.id,this.params,this.t,opts);this.viewport.innerHTML=svg;this.lastValidSvg=svg;
  this._decorateDraggableLabels();
  this.metrics.replaceChildren();
  const codeBadge=this.mode?.displayCode||this.id;
  const modeHeader=make('div',formatMathText(`${codeBadge} • ${this.mode?.name||this.mode?.title||'Mô hình Toán 10'}`),'mv-r5-value');
  modeHeader.style.fontWeight='800';modeHeader.style.color='#0c7da0';
  this.metrics.append(modeHeader);
  const sub=this.flags.lockedSubMode,r=v.result||{},n=this.params.n,k=(sub==='add'||sub==='multiply')?(this.params.k||1):Math.min(this.params.k||1,n||1);
  const dispValues=sub==='add'?[`Phương án A: ${n} cách`,`Phương án B: ${k} cách`,`Quy tắc cộng: N = ${n} + ${k} = ${r.addition} cách`]:
   sub==='multiply'?[`Công đoạn 1: ${n} cách`,`Công đoạn 2: ${k} cách`,`Quy tắc nhân: N = ${n} × ${k} = ${r.multiplication} bộ`]:
   sub==='P'?[`Số phần tử: n = ${n}`,`Hoán vị: P_${n} = ${n}! = ${r.permutations}`]:
   sub==='A'?[`Chọn có thứ tự: k = ${k} từ n = ${n}`,`Chỉnh hợp: A_${n}^${k} = ${n}!/(${n}-${k})! = ${r.arrangements}`]:
   sub==='C'?[`Chọn tập con: k = ${k} từ n = ${n}`,`Tổ hợp: C_${n}^${k} = A_${n}^${k}/${k}! = ${r.combinations}`]:v.values;
  const dispLatex=sub==='add'?`N = m + n = ${n} + ${k} = ${r.addition}`:
   sub==='multiply'?`N = m \\cdot n = ${n} \\cdot ${k} = ${r.multiplication}`:
   sub==='P'?`P_${n} = ${n}! = ${r.permutations}`:
   sub==='A'?`A_${n}^{${k}} = \\frac{${n}!}{(${n}-${k})!} = ${r.arrangements}`:
   sub==='C'?`C_${n}^{${k}} = \\frac{${n}!}{${k}!(${n}-${k})!} = \\frac{A_${n}^{${k}}}{${k}!} = ${r.combinations}`:v.latex;
  for(const value of dispValues)this.metrics.append(make('div',formatMathText(value),'mv-r5-value'));
  const plan=getGuidedDiscoveryPlan(this.id,this.mode);
  mountRenderedFormula(this.latex,dispLatex);this.status.textContent=formatMathText(`✓ Lab 2D có chuyển động; kết quả tính lại từ tham số · Kết luận: ${plan.takeaway}`);this.status.className='mv-g7-status';this.error=null;
  }catch(e){this.error=e.message;this.status.textContent='⚠ '+e.message;this.status.className='mv-g7-status invalid';if(!this.lastValidSvg)this.viewport.replaceChildren(make('p',e.message,'mv-g7-fallback'));}
  if(this.timeline)this.timeline.value=this.t;
 }
 destroy(){cancelLabAutoplay(this);this.setPlaying(false);this.destroyed=true;if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;for(const [target,type,fn] of this.events)target.removeEventListener(type,fn);this.events=[];}
}
