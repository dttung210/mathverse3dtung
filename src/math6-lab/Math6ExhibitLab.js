/** MathLab 6 mounted DIRECTLY inside an existing class-6 MATHVERSE exhibit.
 * Not a standalone app, iframe, replaced exhibit, or a new room.
 * 60 MathLab constructions are related to 9 protected original exhibit IDs.
 */
import {renderModel,W,H} from './canvas.mjs';
import {clamp,mathStats,outcomeLabels,sampleOutcome} from './math.mjs';
import {motionParams,motionDescription} from './catalog-motion.mjs';
import {GeometryStudio} from './geometry-studio.mjs';
import {labsForExhibit,labById,LAB_TO_EXHIBIT} from './catalog.js';
import {isGrade6ActiveLab} from '../portal-labs/grade6-curation-v15-1.js';
import {getModelTaxonomy, isTrue3DCapable} from './math6-taxonomy.mjs';
import {scheduleLabAutoplay, cancelLabAutoplay} from '../curriculum/lab-autoplay.mjs';

const DURATION=8;
const $=(scope,q)=>scope.querySelector(q);
const isStudioCapable=m=>['polygon','geometry','symmetry'].includes(m?.engine);
const canUse3D=m=>Boolean(m && isTrue3DCapable(m.id));
const create=(tag,cls='',text='')=>{const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=text;return e;};
function download(name,data,mime='application/json'){
 const blob=data instanceof Blob?data:new Blob([data],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function sanitized(model,stored){
 const p=structuredClone(model.defaults);
 for(const [k,original] of Object.entries(p)){
   const x=stored?.params?.[k];
   if(typeof original==='number'&&typeof x==='number'&&Number.isFinite(x))p[k]=clamp(x,-10000,10000);
   else if(Array.isArray(original)&&Array.isArray(x)&&x.length===original.length&&x.every(v=>Number.isFinite(v)))p[k]=x.map(v=>clamp(v,0,100));
 }
 return {params:p,time:0,counts:Array.isArray(stored?.counts)?stored.counts.filter(Number.isFinite).slice(0,12).map(x=>Math.round(clamp(x,0,1e6))):[],lastOutcome:Number.isInteger(stored?.lastOutcome)?stored.lastOutcome:undefined,tileFlips:new Set(Array.isArray(stored?.tileFlips)?stored.tileFlips.slice(0,200):Array.isArray(stored?.tiles)?stored.tiles.slice(0,200):[]),selectedDesk:Number.isInteger(stored?.selectedDesk)?clamp(stored.selectedDesk,0,11):0};
}

export class Math6ExhibitLab {
 constructor({anchor,initialLabId,onNotice=()=>{},onSelected=()=>{},includeArchived=false,allowedLabIds=null}){
  if(Number(anchor?.grade)!==6)throw new Error('MathLab 6 must remain inside a grade 6 exhibit');
  this.anchor=anchor;this.initialLabId=initialLabId;this.onNotice=onNotice;this.onSelected=onSelected;
  this.includeArchived=Boolean(includeArchived);this.allowedLabIds=allowedLabIds?new Set(allowedLabIds):null;
  this.selected=null;this.state=null;this.mode='model';this.three=null;this.studio=null;
  this.current=0;this.speed=1;this.raf=0;this.playing=false;this.lastTick=0;this.before=null;this.pointerId=null;this._saveTimer=null;
 }
 _storageKey(labId){return `mathverse:math6:exhibit:${this.anchor.id}:lab:${labId}`;}
 _loadState(model){let stored=null;
  try{stored=JSON.parse(localStorage.getItem(this._storageKey(model.id))||localStorage.getItem('math6-lab:'+model.id)||'null');}catch{}
  return sanitized(model,stored);
 }
 _saveState(immediate=false){if(!this.state||!this.selected)return;
  const key=this._storageKey(this.selected.id);
  const snapshot=JSON.stringify({params:this.state.params,counts:this.state.counts,lastOutcome:this.state.lastOutcome,tileFlips:[...this.state.tileFlips],selectedDesk:this.state.selectedDesk});
  if(this._saveTimer){clearTimeout(this._saveTimer);this._saveTimer=null;}
  const persist=()=>{try{localStorage.setItem(key,snapshot);}catch{this.onNotice('Bộ nhớ đầy: cô hãy xuất JSON để sao lưu.');}};
  if(immediate)persist();
  else this._saveTimer=setTimeout(()=>{this._saveTimer=null;persist();},150);
 }
 mount(viewport,inspector){
  this.viewport=viewport;this.inspector=inspector;
  const root=create('div','math6-exhibit-lab');this.root=root;
  root.innerHTML=`
    <div class="math6-portal-heading">
      <div class="math6-title-block">
        <div class="math6-title-row">
          <h2 class="math6-model-title"></h2>
          <div class="math6-badges">
            <span class="math6-tax-badge"></span>
            <span class="math6-curated-badge"></span>
          </div>
        </div>
        <div class="math6-anchor-caption">🏛 Bục bảo tàng liên kết: <strong class="math6-anchor-name"></strong> <small class="math6-anchor-id"></small></div>
      </div>
      <div class="math6-related-wrap">
        <label for="math6-related-select">Mẫu SGK cùng bục</label>
        <select id="math6-related-select" aria-label="Thí nghiệm liên quan đến mô hình đang mở"></select>
      </div>
    </div>
    <div class="math6-modebar">
      <button data-math6-mode="model" class="active">▤ Bản vẽ 2D SGK</button>
      <button data-math6-mode="3d">⬡ Mô hình 3D thật</button>
      <button data-math6-mode="studio">△ Dựng hình từ mẫu</button>
      <button class="math6-copy" data-math6-copy>＋ Đưa vào bản vẽ chuyên biệt</button>
    </div>
    <div class="math6-shape-tools" hidden></div>
    <div class="math6-display">
      <canvas data-math6-canvas="book" width="920" height="560" aria-label="Hình động Toán 6 theo SGK"></canvas>
      <canvas data-math6-canvas="studio" width="920" height="560" hidden aria-label="Xưởng dựng hình động Toán 6"></canvas>
      <canvas data-math6-canvas="3d" width="920" height="560" hidden aria-label="Thí nghiệm không gian Toán 6"></canvas>
    </div>
    <div class="math6-lab-footer"><span class="math6-stats" aria-live="polite"></span><span class="math6-source"></span></div>
    <details class="math6-motion"><summary>🎞 Chuyển động / Ghi mốc · Phát / Tạm dừng / Tua</summary>
      <div class="math6-model-motion">
        <div class="math6-motion-description"></div>
        <div class="math6-motion-range"><input type="range" min="0" max="8" step="0.05" value="0" aria-label="Tua chuyển động mô hình"><output>0.0 / 8.0 s</output></div>
        <div class="math6-motion-actions"><button data-math6-action="back">◀ 1 giây</button><button data-math6-action="play">▶ Phát</button><button data-math6-action="next">1 giây ▶</button><button data-math6-action="stop">↺ Khôi phục</button><select data-math6-speed aria-label="Tốc độ"><option value="0.25">0,25×</option><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="1.5">1,5×</option><option value="2">2×</option><option value="3">3×</option></select></div>
      </div>
      <div class="math6-studio-motion" hidden></div>
    </details>
    <details class="mv13-math6-export"><summary>⋯ Lưu / Xuất / Khôi phục</summary><div class="math6-savebar"><button data-math6-action="reset">↻ Đặt lại</button><button data-math6-action="png">↓ PNG</button><button data-math6-action="json">↓ JSON</button><label class="math6-import">↑ Nhập JSON <input type="file" accept="application/json,.json" data-math6-import hidden/></label></div></details>
  `;
  viewport.replaceChildren(root);
  this.bookCanvas=$(root,'[data-math6-canvas="book"]');this.ctx=this.bookCanvas.getContext('2d');
  this.studioCanvas=$(root,'[data-math6-canvas="studio"]');this.threeCanvas=$(root,'[data-math6-canvas="3d"]');
  this.details=$(root,'.math6-model-motion');this.studioMotion=$(root,'.math6-studio-motion');
  this.stats=$(root,'.math6-stats');this.related=$(root,'#math6-related-select');
  this.bookControls=create('div','math6-parameters');this.studioControls=create('div','math6-studio-inspector');
  inspector.replaceChildren(this.bookControls,this.studioControls);
  this.studioControls.hidden=true;
  for(const m of labsForExhibit(this.anchor.id).filter(m=>(this.includeArchived||isGrade6ActiveLab(m.id))&&(!this.allowedLabIds||this.allowedLabIds.has(m.id)))){
    const opt=create('option','',m.supplemental?`${m.title} • Bổ sung`:`${m.title} • ${m.source.book}, tr. ${m.source.printed_page}`);
    opt.value=m.id;this.related.append(opt);
  }
  this.related.addEventListener('change',()=>this.select(this.related.value));
  root.querySelectorAll('[data-math6-mode]').forEach(b=>b.addEventListener('click',()=>this.setMode(b.dataset.math6Mode)));
  $(root,'[data-math6-copy]').addEventListener('click',async()=>{await this.setMode('studio');if(this.studio?.addCatalogModel(this.selected))this.onNotice('Đã thêm hình này vào bảng dựng hình của mô hình đang mở.');});
  root.querySelectorAll('[data-math6-action]').forEach(b=>b.addEventListener('click',()=>this._action(b.dataset.math6Action)));
  $(root,'[data-math6-speed]').addEventListener('change',e=>{this.speed=Number(e.target.value)||1;});
  $(root,'.math6-motion-range input').addEventListener('input',e=>this.scrub(Number(e.target.value)));
  $(root,'[data-math6-import]').addEventListener('change',async e=>{const file=e.target.files?.[0];e.target.value='';if(file)await this.importJSON(file);});
  this.bookCanvas.addEventListener('pointerdown',e=>{if(this.mode!=='model')return;this._stopMotion(true);this.pointerId=e.pointerId;this.bookCanvas.setPointerCapture?.(e.pointerId);this._handlePointer(e);});
  this.bookCanvas.addEventListener('pointermove',e=>{if(this.mode==='model'&&this.pointerId===e.pointerId&&(e.buttons&1)&&!['chance','tiling'].includes(this.selected?.engine))this._handlePointer(e);});
  this.bookCanvas.addEventListener('pointerup',e=>{if(e.pointerId===this.pointerId){this.pointerId=null;this._saveState(true);this._renderControls();}});
  this.bookCanvas.addEventListener('pointercancel',e=>{if(e.pointerId===this.pointerId){this.pointerId=null;this._saveState(true);this._renderControls();}});
  this._onShortcut=e=>{if(this.mode!=='studio'||!(e.ctrlKey||e.metaKey)||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;const k=e.key.toLowerCase();if(k==='z'||k==='y'){e.preventDefault();if(k==='y'||e.shiftKey)this.studio?.redo();else this.studio?.undo();}};
  window.addEventListener('keydown',this._onShortcut);
  const initial=labById(this.initialLabId);const chosen=(initial&&LAB_TO_EXHIBIT[initial.id]===this.anchor.id?initial:null)||labsForExhibit(this.anchor.id).find(m=>isGrade6ActiveLab(m.id))||labsForExhibit(this.anchor.id)[0];
  if(!chosen)throw new Error('No MathLab experience linked to '+this.anchor.id);
  this.select(chosen.id);
 }
 select(id){
  this._saveState(true);
  const model=labById(id);if(!model||LAB_TO_EXHIBIT[model.id]!==this.anchor.id||(this.allowedLabIds&&!this.allowedLabIds.has(id)))return false;
  this._stopMotion(false);
  if(this.studio)this.studio.deactivate();if(this.three)this.three.leave();
  this.selected=model;this.state=this._loadState(model);this.current=0;this.before=null;
  if([...this.related.options].some(opt=>opt.value===id))this.related.value=id;
  else {
   const opt=create('option','',`${model.title} · ${model.supplemental?'Bổ sung':model.source.book+' tr. '+model.source.printed_page}`);opt.value=id;this.related.append(opt);this.related.value=id;
  }
  const modelTitle = $(this.root, '.math6-model-title');
  if(modelTitle) modelTitle.textContent = model.title;
  const tax = getModelTaxonomy(model.id);
  const taxBadge = $(this.root, '.math6-tax-badge');
  if(taxBadge){
    taxBadge.textContent = tax.badge;
    taxBadge.className = 'math6-tax-badge math6-tax-' + tax.code.toLowerCase();
  }
  const isFeatured = isGrade6ActiveLab(model.id);
  const curatedBadge = $(this.root, '.math6-curated-badge');
  if(curatedBadge){
    curatedBadge.textContent = isFeatured ? '● Đang trưng bày' : '◇ Lưu kho';
    curatedBadge.className = 'math6-curated-badge ' + (isFeatured ? 'featured' : 'archived');
  }
  const anchorName = $(this.root, '.math6-anchor-name');
  if(anchorName) anchorName.textContent = this.anchor.title;
  const anchorId = $(this.root, '.math6-anchor-id');
  if(anchorId) anchorId.textContent = `(${this.anchor.id})`;

  $(this.root,'.math6-source').textContent=model.supplemental?`${model.group} · Bài thực nghiệm bổ sung theo chủ đề Toán 6`:`${model.group} · SGK Toán 6 ${model.source.book==='T1'?'Tập 1':'Tập 2'}, trang ${model.source.printed_page}`;
  $(this.root,'.math6-motion-description').textContent=motionDescription(model);
  this._renderControls();
  this.before=structuredClone(this.state.params);
  this.state.params=motionParams(this.selected,this.before,0,DURATION);
  this.state.time=0;
  
  if(canUse3D(model)){
    this.setMode('3d').then(ok => {
      if(!ok) this.setMode('model');
      scheduleLabAutoplay(this,{delay:90,reset:false});
    });
  } else {
    this.setMode('model');
    scheduleLabAutoplay(this,{delay:90,reset:false});
  }
  
  this.onSelected(model,this.anchor);
  return true;
 }
 async setMode(mode){
  if(!['model','studio','3d'].includes(mode))return false;
  if(mode==='3d'&&!canUse3D(this.selected)){
    this.onNotice('Mẫu này là hình phẳng 2D chuẩn SGK; chế độ 3D chỉ áp dụng cho khối lập phương, xúc xắc hoặc vật thể không gian.');
    return false;
  }
  if(mode!==this.mode){this._stopMotion(true);this.studio?.deactivate();this.three?.leave();}
  if(mode==='studio'&&!this.studio){
    this.studio=new GeometryStudio(this.studioCanvas,$(this.root,'.math6-shape-tools'),this.studioControls,this.studioMotion,msg=>this.onNotice(msg),{storageKey:`mathverse:math6:studio:${this.anchor.id}`,statusElement:this.stats});
  }
  if(mode==='3d'){
   if(!this.three){
     try{
       const {Math6ThreeLab}=await import('./three-lab.mjs');
       this.three=new Math6ThreeLab(this.threeCanvas,msg=>this.onNotice(msg));
     }catch(e){
       this.onNotice('Không tải được động cơ 3D: '+e.message);
       return false;
     }
   }
   if(!this.three.ready||!this.three.enter(this.selected,this.state)){
     this.onNotice('WebGL chưa khả dụng; hệ thống tự động chuyển sang bản vẽ 2D chuẩn SGK.');
     return false;
   }
  }
  this.mode=mode;
  if(mode==='studio')this.studio.activate();
  this._syncView();this._draw();return true;
 }
 _syncView(){
  const isModel=this.mode==='model',isStudio=this.mode==='studio',is3D=this.mode==='3d';
  this.bookCanvas.hidden=!isModel;this.studioCanvas.hidden=!isStudio;this.threeCanvas.hidden=!is3D;
  this.bookControls.hidden=isStudio;this.studioControls.hidden=!isStudio;
  this.details.hidden=isStudio;this.studioMotion.hidden=!isStudio;
  $(this.root,'.math6-shape-tools').hidden=!isStudio;
  $(this.root,'[data-math6-copy]').disabled=!isStudioCapable(this.selected);
  this.root.querySelectorAll('[data-math6-mode]').forEach(b=>{
    b.classList.toggle('active',b.dataset.math6Mode===this.mode);
    if(b.dataset.math6Mode==='3d'){
      const sup = canUse3D(this.selected);
      b.disabled = !sup;
      b.title = sup ? 'Xem mô hình 3D không gian tương tác xoay/zoom' : 'Mẫu này là đối tượng 2D phẳng; không áp dụng khối 3D.';
    }
  });
  this.stats.textContent=isStudio?`${this.studio?.board.items.length||0} hình trong xưởng · ${this.studio?.board.keyframes.length||0} mốc` :mathStats(this.selected,this.state);
 }
 _draw(){if(!this.selected||!this.state)return;
  if(this.mode==='model')renderModel(this.ctx,this.selected,this.state,{theme:'light'});
  if(this.mode==='3d')this.three?.setState(this.state);
  this.stats.textContent=this.mode==='studio'?`${this.studio?.board.items.length||0} hình trong xưởng` :mathStats(this.selected,this.state);
 }
 _renderControls(){
  const m=this.selected,p=this.state.params,box=this.bookControls;box.replaceChildren();
  const heading=create('h3','math6-controls-title','⚙ THÔNG SỐ THÍ NGHIỆM');box.append(heading);
  const note=create('p','math6-controls-note',m.action);box.append(note);
  const engine=m.engine,variant=m.variant;
  const definitions=[];
  const entry=(key,label,min,max,step=1)=>{if(typeof p[key]==='number')definitions.push({key,label,min,max,step});};
  if(engine==='polygon'){entry('a',variant==='rhombus'?'Đường chéo 1':'Cạnh / đáy / bán kính',1,9,.1);entry('b',variant==='rhombus'?'Đường chéo 2':'Cạnh / đáy nhỏ',1,9,.1);entry('skew','Độ xiên',-3,3,.1);entry('height','Chiều cao',1,7,.1);entry('rotation','Góc quay (°)',-180,180,1);}
  else if(engine==='composition')entry('progress','Mức tách / ghép',0,1,.01);
  else if(engine==='tiling'){entry('count','Mật độ lát nền',2,11,1);entry('type','Kiểu lát (0 / 1)',0,1,1);}
  else if(engine==='symmetry'){entry('position','Vị trí trục / tâm',-3,3,.1);entry('fold','Góc gấp / quay',0,180,1);}
  else if(engine==='geometry'){entry('angle','Số đo góc',0,180,1);entry('measure',variant==='clock'?'Phút':'Độ dài / độ lệch',0,variant==='clock'?59:12,.1);}
  else if(engine==='number'){entry('value',variant==='multiples'?'Chọn số cần tìm bội':variant==='primes'?'Giới hạn sàng':'Giá trị',variant==='multiples'||variant==='primes'?2:variant==='thermometer'?-20:variant==='place'?0:-20,variant==='primes'?100:variant==='multiples'?20:variant==='place'?9999:variant==='factors'?300:variant==='thermometer'?40:30,1);entry('step','Số bước / số mũ',-12,12,1);}
  else if(engine==='venn'){entry('a','Bộ A',2,9,1);entry('b','Bộ B',2,9,1);}
  else if(engine==='fraction'){entry('denominator','Mẫu số',variant==='addsame'?2:1,variant==='addsame'?20:100,1);entry('numerator','Tử số / phần trăm',0,variant==='addsame'?20:100,1);entry('factor','Hệ số',1,6,1);entry('other',variant==='addsame'?'Tử số thứ hai':'Tử số so sánh',0,variant==='addsame'?20:100,1);entry('total','Tổng số đồ vật',1,100,1);}
  else if(engine==='real'){entry('rotation','Góc quay / góc gấp',0,360,1);entry('speed','Số bậc / tốc độ',1,8,.25);}
  else if(engine==='chance'&&variant==='spinner')entry('segments','Số kết quả trên vòng quay',2,6,1);
  for(const d of definitions)this._addSlider(box,d,p[d.key],value=>{
    const state=this.state.params;state[d.key]=value;
    if(engine==='chance'&&variant==='spinner'&&d.key==='segments'){this.state.counts=[];this.state.lastOutcome=undefined;}
    if(engine==='fraction'){
      state.denominator=Math.max(variant==='addsame'?2:1,Math.round(state.denominator||1));
      state.numerator=Math.min(Math.round(state.numerator||0),state.denominator);
      if(variant==='addsame')state.other=Math.min(Math.round(state.other||0),state.denominator);
    }
    this._saveState();this._draw();
  });
  if(engine==='chart'){
   for(const key of ['values','otherValues'])if(Array.isArray(p[key]))p[key].forEach((v,index)=>this._addSlider(box,{key,label:`${key==='values'?'Nhóm 1':'Nhóm 2'} · cột ${index+1}`,min:0,max:30,step:1},v,value=>{
     this.state.params[key][index]=value;this._saveState();this._draw();
   }));
   if(typeof p.unit==='number')this._addSlider(box,{key:'unit',label:'Đơn vị biểu đồ',min:1,max:10,step:1},p.unit,v=>{this.state.params.unit=v;this._saveState();this._draw();});
  }
  if(engine==='chance'){
   const row=create('div','math6-chance-actions');for(const n of [1,10,100]){const b=create('button','',`⚄ Thử ${n} lần`);b.addEventListener('click',()=>this.simulate(n));row.append(b);}
   const clear=create('button','',`↺ Xóa kết quả`);clear.addEventListener('click',()=>{this.state.counts=[];this.state.lastOutcome=undefined;this._saveState();this._draw();});row.append(clear);box.append(row);
  }
  box.append(create('p','math6-controls-source',m.supplemental?`Mô hình được xây dựng bổ sung theo chủ đề Toán 6 (không sao chép hình SGK). Dữ liệu chỉ lưu ở ${this.anchor.id}.`:`Nguồn: SGK Toán 6 KNTT · ${m.source.book}, trang ${m.source.printed_page}. Mọi thay đổi chỉ lưu ở thí nghiệm ${this.anchor.id}.`));
 }
 _addSlider(box,d,initial,onInput){const row=create('label','math6-param-row');const head=create('span','math6-param-head');
  const label=create('strong','',d.label),out=create('output','',String(initial));head.append(label,out);
  const range=create('input');range.type='range';range.min=d.min;range.max=d.max;range.step=d.step;range.value=clamp(initial,d.min,d.max);
  range.addEventListener('input',()=>{this._stopMotion(false);const value=Number(range.value);out.textContent=value.toLocaleString('vi-VN');onInput(value);});row.append(head,range);box.append(row);
 }
 _pointerCoordinates(e){const b=this.bookCanvas.getBoundingClientRect(),k=Math.min(b.width/W,b.height/H),padX=(b.width-W*k)/2,padY=(b.height-H*k)/2;
  return [(e.clientX-b.left-padX)/k,(e.clientY-b.top-padY)/k];
 }
 _handlePointer(e){if(!this.selected||this.mode!=='model')return;const [x,y]=this._pointerCoordinates(e),p=this.state.params,m=this.selected,v=m.variant,dx=x-W/2,dy=H/2-y;
  switch(m.engine){
  case 'polygon':
    if(v==='rhombus'){if(Math.abs(dx)>Math.abs(dy))p.a=clamp(2*Math.abs(dx)/46,1,9);else p.b=clamp(2*Math.abs(dy)/46,1,9);}
    else if(['rectangle','parallelogram','trapezoid'].includes(v)){p.a=clamp(2*Math.abs(dx)/46,1,9);if(v==='trapezoid')p.height=clamp(2*Math.abs(dy)/46,1,7);else p.b=clamp(2*Math.abs(dy)/46,1,9);}
    else{p.a=clamp(Math.hypot(dx,dy)/46*(v==='hexagon'?1:2*Math.sin(Math.PI/(v==='triangle'?3:4))),1,9);p.rotation=clamp(Math.atan2(dy,dx)*180/Math.PI,-180,180);}break;
  case 'composition':p.progress=clamp(x/W,0,1);break;
  case 'symmetry':p.position=clamp(dx/45,-3,3);p.fold=clamp((x/W)*180,0,180);break;
  case 'geometry':
    if(['angle','angletypes','rays','pairlines'].includes(v))p.angle=clamp(Math.abs(Math.atan2(dy,dx)*180/Math.PI),0,180);
    if(['midpoint','ruler'].includes(v))p.measure=clamp((x-300)/43,1,12);
    if(['pointline','collinear'].includes(v))p.measure=clamp((340-y)/25,0,8);
    if(v==='clock')p.measure=clamp(Math.round(((Math.atan2(y-H/2,x-W/2)+Math.PI/2+Math.PI*2)%(Math.PI*2))/(Math.PI*2)*60),0,59);break;
  case 'number':
    if(v==='thermometer')p.value=Math.round(clamp((425-y)/305*60-20,-20,40));
    else if(['natural','integer','hops'].includes(v)){const min=v==='natural'?0:-10,max=v==='natural'?14:10;const x0=460-(max+min)*46/2;p.value=Math.round(clamp((x-x0)/46,min,max));}
    else if(['multiples','primes'].includes(v)){const col=Math.floor((x-185)/54),row=Math.floor((y-115)/33);if(col>=0&&col<10&&row>=0&&row<10)p.value=Math.round(clamp(row*10+col+1,2,v==='multiples'?20:100));}break;
  case 'fraction':
    if(['percent','decimal'].includes(v)){const col=Math.floor((x-310)/32),row=Math.floor((y-125)/30);p.numerator=Math.round(clamp(row*10+col+1,0,100));}
    else if(v==='addsame'){const nn=Math.round(clamp((x-228)/460*(p.denominator||1),0,p.denominator||1));if(y>=215&&y<311)p.other=nn;else p.numerator=nn;}
    else p.numerator=Math.round(clamp((x-228)/460*(p.denominator||1),0,p.denominator||1));break;
  case 'chart':{
    const vals=p.values||[],other=p.otherValues||[];
    if(v==='pictogram'){const idx=Math.round((y-160)/75),unit=Math.max(1,Math.round(p.unit||1));
      if(idx>=0&&idx<vals.length)vals[idx]=Math.round(clamp(((x-265)/38)*unit,0,30));break;}
    if(v==='table'||v==='tally')break;
    const index=v==='horizontal'?Math.floor((y-160)/69):Math.floor((x-285)/118);
    const second=v==='double'&&index>=0&&x>=285+index*118+40;
    const list=second?other:vals;
    const maximum=Math.max(10,Math.ceil(Math.max(...vals,...other,0)*1.1/5)*5);
    const value=v==='horizontal'?(x-265)/460*maximum:(430-y)/302*maximum;
    if(index>=0&&index<list.length)list[index]=Math.round(clamp(value,0,30));break;
   }
  case 'venn':p.a=Math.round(clamp(Math.abs(dx)/48+2,2,9));break;
  case 'tiling':{const count=Math.round(clamp(p.count??6,2,11)),floor=v==='floor',radius=24,dy=Math.sqrt(3)*radius;
    const col=floor?Math.floor((x-220)/(380/count)):Math.round((x-220)/(1.5*radius));
    const row=floor?Math.floor((y-130)/(380/count)):Math.round((y-130-(col%2)*dy/2)/dy);
    const cx=floor?220+(col+.5)*(380/count):220+col*1.5*radius;
    const cy=floor?130+(row+.5)*(380/count):130+row*dy+(col%2)*dy/2;
    if(col>=0&&col<count&&row>=0&&row<6&&(floor||(Math.hypot(x-cx,y-cy)<=radius+2))){const key=`${row}:${col}`;if(this.state.tileFlips.has(key))this.state.tileFlips.delete(key);else this.state.tileFlips.add(key);}break;}
  case 'real':if(v==='room'){const col=Math.floor((x-259)/102),row=Math.floor((y-193)/80);this.state.selectedDesk=Math.round(clamp(row*4+col,0,11));}
   else if(v==='cubes')p.speed=Math.round(clamp((x-245)/32,2,8));else p.rotation=Math.round(clamp(Math.atan2(-dy,dx)*180/Math.PI+180,0,360));break;
  case 'chance':this.simulate(1);return;
  }
  this._saveState();this._draw();
 }
 simulate(n){if(this.selected?.engine!=='chance')return;this._stopMotion(true);
  for(let j=0;j<n;j++){const i=sampleOutcome(this.selected,Math.random,this.state.params);this.state.counts[i]=(this.state.counts[i]||0)+1;this.state.lastOutcome=i;}
  this._saveState();this._draw();
 }
 _updateTimeline(){const input=$(this.root,'.math6-motion-range input');input.value=String(this.current);
  $(this.root,'.math6-motion-range output').textContent=`${this.current.toFixed(1)} / ${DURATION.toFixed(1)} s`;
  $(this.root,'[data-math6-action="play"]').textContent=this.playing?'Ⅱ Tạm dừng':'▶ Phát';
 }
 scrub(time){if(!this.selected||!this.state)return;this._pause();if(!this.before)this.before=structuredClone(this.state.params);
  this.current=clamp(time,0,DURATION);this.state.params=motionParams(this.selected,this.before,this.current,DURATION);this.state.time=this.current*1000;this._draw();this._updateTimeline();}
 _pause(){cancelLabAutoplay(this);this.playing=false;cancelAnimationFrame(this.raf);this.raf=0;this.lastTick=0;this._updateTimeline();}
 _stopMotion(redraw=true){this._pause();if(this.before&&this.state){this.state.params=motionParams(this.selected,this.before,0,DURATION);this.state.time=0;}
  this.current=0;if(redraw&&this.selected){this._draw();this._renderControls();}this._updateTimeline();}
 setPlaying(active){
  if(active){
   if(!this.playing)this._play();
  }else{
   this._pause();
  }
 }
 _play(){if(this.mode==='studio'){this.studio?.togglePlay();return;}if(!this.selected)return;
  if(this.playing){this._pause();return;}
  if(this.current>=DURATION)this.current=0;
  this.playing=true;this.lastTick=0;
  const tick=t=>{if(!this.playing)return;if(this.lastTick)this.current+=(t-this.lastTick)/1000*this.speed;this.lastTick=t;
   if(this.current>=DURATION){this.current=DURATION;if(!this.before)this.before=structuredClone(this.state.params);this.state.params=motionParams(this.selected,this.before,this.current,DURATION);this.state.time=this.current*1000;this._draw();this._pause();return;}
   if(!this.before)this.before=structuredClone(this.state.params);
   this.state.params=motionParams(this.selected,this.before,this.current,DURATION);this.state.time=this.current*1000;
   this._draw();this._updateTimeline();this.raf=requestAnimationFrame(tick);
  };this.raf=requestAnimationFrame(tick);this._updateTimeline();
 }
 _action(name){
  if(name==='play'){this._play();return;}if(name==='stop'){this._stopMotion();return;}
  if(name==='back'){this.scrub(this.current-1);return;}if(name==='next'){this.scrub(this.current+1);return;}
  if(name==='reset'){
   if(this.mode==='studio'){this.studio?._stopPreview();return;}
   this._stopMotion(false);this.state=sanitized(this.selected,null);this.before=structuredClone(this.state.params);this.state.params=motionParams(this.selected,this.before,0,DURATION);this._saveState();this._renderControls();this._draw();return;
  }
  if(name==='png'){
   const url=this.mode==='3d'?this.three?.screenshot():this.mode==='studio'?this.studioCanvas.toDataURL('image/png'):this.bookCanvas.toDataURL('image/png');
   if(url){const a=document.createElement('a');a.href=url;a.download=`${this.selected.id}_${this.mode}.png`;a.click();}return;
  }
  if(name==='json'){
   if(this.mode==='studio'){this.studio?.exportJSON();return;}
   const data={schema:'mathverse.math6.exhibit-state.v1',grade:6,anchorId:this.anchor.id,modelId:this.selected.id,params:this.before||this.state.params,
    counts:this.state.counts,lastOutcome:this.state.lastOutcome,tileFlips:[...this.state.tileFlips],selectedDesk:this.state.selectedDesk};
   download(`${this.anchor.id}_${this.selected.id}.json`,JSON.stringify(data,null,2));return;
  }
 }
 async importJSON(file){if(file.size>300000){this.onNotice('Tệp quá 300 KB.');return false;}
  try{
   const data=JSON.parse(await file.text());
   if(data.schema==='mathverse.toan6.geometry.v2'){
    await this.setMode('studio');await this.studio.importJSON(file);return true;
   }
   if(data.schema!=='mathverse.math6.exhibit-state.v1'||data.grade!==6||data.anchorId!==this.anchor.id||LAB_TO_EXHIBIT[data.modelId]!==this.anchor.id)throw Error('Tệp phải thuộc cùng bục mô hình lớp 6.');
   this.select(data.modelId);this.state=sanitized(this.selected,data);this._renderControls();this._draw();this._saveState();return true;
  }catch(e){this.onNotice('Không nhập được: '+e.message);return false;}
 }
 dispose(){this.disposed=true;cancelLabAutoplay(this);this._stopMotion(false);this._saveState(true);if(this._saveTimer){clearTimeout(this._saveTimer);this._saveTimer=null;}if(this._onShortcut)window.removeEventListener('keydown',this._onShortcut);this.studio?.dispose();this.studio=null;
  if(this.three){this.three.leave();this.three.renderer?.dispose?.();this.three=null;}
  this.root?.remove();this.viewport=null;this.inspector=null;this.root=null;
 }
}
