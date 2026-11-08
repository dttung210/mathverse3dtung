import { V } from './workspace-labels.js?v=r107_v15';
import { MAX_OBJECTS, makeDocument, make2D, make3D, fromCatalog, clone, uid, clamp, validateDocument, metrics2D, constrainScale3D } from './workspace-document.js?v=r107_v15';
import { Workspace2DEditor } from './Workspace2DEditor.js?v=r107_v15';
import { Workspace3DEditor } from './Workspace3DEditor.js?v=r107_v15';
import { computeHorizontalSection,sectionSVG,formatSectionArea } from './section-math.js?v=r107_v15';
import { recordKeyframe,interpolateState } from './motion-timeline.js?v=r107_v15';

const group = (name,arr) => ({name,items:arr});
const twoGroups=[group(V.geometry,['select','pan','point','segment','line','circle','triangle'])];
const basicExtras=['ray','rectangle','rhombus','regularPolygon','midpoint','circlePoint'];
const solids=['box','pyramid','prism','cylinder','cone','sphere'];
const precisionTools=['perpBisector','parallelLine','perpendicularLine','intersectionPoint','median','altitude','angleBisector','circumcircle','tangentLine'];
const threeGroups=[group(V.geometry,['select','move','rotate','scale'])];
const iconMap={select:'\u2196',pan:'\u270b',point:'\u25cf',segment:'\u2571',circle:'\u25ef',triangle:'\u25b3',rectangle:'\u25ad',rhombus:'\u25c7',regularPolygon:'\u2b21',midpoint:'\u2299',circlePoint:'\u2299',line:'\u2501',ray:'\u2192',move:'\u2725',rotate:'\u27f3',scale:'\u2922',box:'\u25a3',pyramid:'\u25b2',prism:'\u29c9',cylinder:'\u25af',cone:'\u25b2',sphere:'\u25cf'};
function button(label,onClick,cls='mv11-mini-btn'){
  const node=document.createElement('button');node.type='button';node.className=cls;node.textContent=label;node.addEventListener('click',onClick);return node;
}
function downloadBlob(name,content,mime){const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export class WorkspaceComposer {
  constructor({grade,dimension,container,inspector,onToast=()=>{},onChange=()=>{}}){
    this.grade=grade;this.dimension=dimension;this.container=container;this.inspector=inspector;this.onToast=onToast;this.onChange=onChange;
    this.doc=this._load();this.history=[JSON.stringify(this.doc)];this.cursor=0;this.controller=null;
    this.motionOriginal=null;this.motionPlaying=false;this.motionRAF=0;this.motionPosition=0;
    this._shortcuts=this._shortcuts.bind(this);this._initDOM();this._mountDimension();window.addEventListener('keydown',this._shortcuts);
  }
  _key(){return `mathverse-workspace-v11-grade-${this.grade}-${this.dimension}`;}
  _load(){try{const s=localStorage.getItem(this._key());if(s)return validateDocument(JSON.parse(s),this.grade,this.dimension);}catch(e){this.onToast?.(e.message);}return makeDocument(this.grade,this.dimension);}
  _namedKey(){return `mathverse-v11-named-scenes-grade-${this.grade}-${this.dimension}`;}
  _namedScenes(){try{const data=JSON.parse(localStorage.getItem(this._namedKey())||'[]');return Array.isArray(data)?data.slice(0,30):[];}catch{return [];}}
  refreshSavedScenes(){if(!this.savedSelect)return;
    const active=this.savedSelect.value;this.savedSelect.replaceChildren();
    const initial=document.createElement('option');initial.value='';initial.textContent='C\u1ea3nh \u0111\u00e3 l\u01b0u...';this.savedSelect.append(initial);
    for(const entry of this._namedScenes()){
      const option=document.createElement('option');option.value=entry.id;option.textContent=entry.title;this.savedSelect.append(option);
    }
    if([...this.savedSelect.options].some(option=>option.value===active))this.savedSelect.value=active;
  }
  saveNamedScene(){
    if(!this.doc.items.length){this.onToast(V.noData);return;}
    const title=window.prompt('T\u00ean c\u1ea3nh \u0111\u1ec3 l\u01b0u:',`Lop ${this.grade} - ${this.dimension.toUpperCase()} - ${new Date().toLocaleDateString('vi-VN')}`);
    if(title===null)return;if(!title.trim())return;
    const scenes=this._namedScenes();if(scenes.length>=30){this.onToast('M\u1ed7i l\u1edbp l\u01b0u t\u1ed1i \u0111a 30 c\u1ea3nh. H\u00e3y xu\u1ea5t JSON \u0111\u1ec3 sao l\u01b0u.');return;}
    const next={id:uid(),title:title.trim().slice(0,90),savedAt:new Date().toISOString(),document:clone(this.doc)};
    scenes.unshift(next);
    try{localStorage.setItem(this._namedKey(),JSON.stringify(scenes));const ok=this._persist();this.refreshSavedScenes();this.savedSelect.value=next.id;if(ok)this.onToast(V.saveToast);}
    catch{this.onToast('Kh\u00f4ng \u0111\u1ee7 b\u1ed9 nh\u1edb. H\u00e3y xu\u1ea5t JSON.');}
  }
  openSavedScene(id){
    const entry=this._namedScenes().find(scene=>scene.id===id);if(!entry)return;
    try{const fresh=validateDocument(entry.document,this.grade,this.dimension);
      this.doc=fresh;this.history=[JSON.stringify(fresh)];this.cursor=0;this._mountDimension();this._persist();this.savedSelect.value=id;this.onToast('\u0110\u00e3 m\u1edf c\u1ea3nh: '+entry.title);
    }catch(e){this.onToast(V.importFail+' '+e.message);}
  }
  deleteSavedScene(){
    const id=this.savedSelect?.value;
    if(!id){this.onToast('H\u00e3y ch\u1ecdn m\u1ed9t c\u1ea3nh \u0111\u00e3 l\u01b0u.');return;}
    const entries=this._namedScenes().filter(s=>s.id!==id);
    if(typeof window!=='undefined'&&typeof window.confirm==='function'&&!window.confirm('X\u00f3a c\u1ea3nh n\u00e0y kh\u1ecfi danh s\u00e1ch \u0111\u00e3 l\u01b0u?'))return;
    try{localStorage.setItem(this._namedKey(),JSON.stringify(entries));this.refreshSavedScenes();this.savedSelect.value='';}
    catch{this.onToast('Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt danh s\u00e1ch c\u1ea3nh \u0111\u00e3 l\u01b0u.');}
  }
  _persist(){try{this.doc.updatedAt=new Date().toISOString();localStorage.setItem(this._key(),JSON.stringify(this.doc));return true;}catch{this.onToast?.('Kh\u00f4ng th\u1ec3 t\u1ef1 l\u01b0u. H\u00e3y xu\u1ea5t t\u1ec7p JSON \u0111\u1ec3 sao l\u01b0u.');return false;}}
  _initDOM(){
    this.container.replaceChildren();const shell=document.createElement('div');shell.className='mv11-workspace-shell';this.shell=shell;
    const bar=document.createElement('div');bar.className='mv11-toolstrip';this.bar=bar;
    const mode=document.createElement('div');mode.className='mv11-mode-switch';
    for(const [dim,label] of [['2d',V.mode2d],['3d',V.mode3d]]){
      const btn=button(label,()=>this.setDimension(dim),'mv11-mode-btn');btn.dataset.dim=dim;mode.append(btn);
    }
    bar.append(mode);this.toolRow=document.createElement('div');this.toolRow.className='mv11-toolgroup';bar.append(this.toolRow);
    const actions=document.createElement('div');actions.className='mv11-actiongroup';bar.append(actions);
    this.savedSelect=document.createElement('select');
    this.savedSelect.className='mv11-saved-scenes';this.savedSelect.title='Mo canh da luu';
    this.savedSelect.addEventListener('change',()=>{
      const id=this.savedSelect.value;if(id)this.openSavedScene(id);
    });actions.append(this.savedSelect);this.refreshSavedScenes();
    actions.append(
      button('\u21b6',()=>this.undo(),'mv11-mini-btn mv11-icon-btn'),
      button('\u21b7',()=>this.redo(),'mv11-mini-btn mv11-icon-btn'),
      button('\u25a1 '+V.fit,()=>this.controller?.focus()),
      button('\u2295 '+V.duplicate,()=>this.duplicate()),
      button('\u2715 '+V.delete,()=>this.remove()),
    );
    const more=document.createElement('details');more.className='mv11-actions-menu';
    const summary=document.createElement('summary');summary.textContent='\u22ef '+V.actions;more.append(summary);
    const menu=document.createElement('div');menu.className='mv11-dropdown';
    menu.append(
      button(V.save,()=>{if(this._persist())this.onToast(V.saveToast);more.open=false;}),
      button('L\u01b0u th\u00e0nh c\u1ea3nh m\u1edbi',()=>{this.saveNamedScene();more.open=false;}),
      button(V.export,()=>{this.exportJSON();more.open=false;}),
      button(V.import,()=>{this.fileInput.click();more.open=false;}),
      button(V.png,()=>{this.exportPNG();more.open=false;}),
      button(V.newScene,()=>{this.clearAll();more.open=false;}),
      button('X\u00f3a c\u1ea3nh \u0111\u00e3 l\u01b0u',()=>{this.deleteSavedScene();more.open=false;}),
    );more.append(menu);actions.append(more);
    const status=document.createElement('div');status.className='mv11-workspace-help';this.status=status;
    const viewport=document.createElement('div');viewport.className='mv11-workspace-viewport';this.viewport=viewport;
    const foot=document.createElement('div');foot.className='mv11-scene-foot';this.footer=foot;
    const timeline=document.createElement('details');timeline.className='mv12-timeline';this.timeline=timeline;
    this._createMotionUI(timeline);
    this.fileInput=document.createElement('input');this.fileInput.type='file';this.fileInput.accept='.json,application/json';this.fileInput.hidden=true;
    this.fileInput.addEventListener('change',async e=>{
      const file=e.target.files?.[0];e.target.value='';if(!file)return;
      try{if(file.size>5*1024*1024)throw new Error('File exceeds 5MB');
        const next=validateDocument(JSON.parse(await file.text()),this.grade,this.dimension);
        this.doc=next;this.history=[JSON.stringify(next)];this.cursor=0;this._mountDimension();this._persist();this.onToast(V.importToast);
      }catch(err){this.onToast(V.importFail+' '+err.message);}
    });
    shell.append(bar,status,viewport,timeline,foot,this.fileInput);this.container.append(shell);
  }
  _mountDimension(){
    this._stopMotion();this.controller?.dispose();
    const opts={select:()=>this.renderInspector(),live:()=>this.renderInspector(),change:()=>this.commit(),notify:msg=>this.onToast(msg)};
    this.controller=this.dimension==='2d'?new Workspace2DEditor(this.doc,opts):new Workspace3DEditor(this.doc,opts);
    this.controller.mount(this.viewport);this.controller.setTool('select');this._renderTools();this.renderInspector();this._updateUi();
    this.status.textContent=(this.dimension==='2d'?V.help2d:V.help3d)+' '+V.dragtip;this._renderMotionUI();
  }
  _renderTools(){
    this.toolRow.replaceChildren();const groups=this.dimension==='2d'?twoGroups:threeGroups;
    const flat=groups.flatMap(g=>g.items);
    for(const tool of flat){
      const btn=button(`${iconMap[tool]||'+'} ${V[tool]||tool}`,()=>{
        if(this.dimension==='3d'&&['box','pyramid','prism','cylinder','cone','sphere'].includes(tool)){
          this.addPrimitive(tool);return;
        }
        this.controller.setTool(tool);this._updateUi();
      },'mv11-tool');btn.dataset.tool=tool;btn.title=V[tool]||tool;this.toolRow.append(btn);
    }
    const makeDropdown=(title,tools)=>{
      const details=document.createElement('details');details.className='mv12-tool-catalog';
      const summary=document.createElement('summary');summary.textContent=title;details.append(summary);
      const panel=document.createElement('div');panel.className='mv12-tool-catalog-grid';
      for(const tool of tools){
        const b=button(`${iconMap[tool]||'＋'} ${V[tool]||tool}`,()=>{
          if(this.dimension==='3d'&&solids.includes(tool))this.addPrimitive(tool);
          else {this.controller.setTool(tool);this._updateUi();}
          details.open=false;
        },'mv11-tool');b.dataset.tool=tool;panel.append(b);
      }
      details.append(panel);this.toolRow.append(details);
    };
    if(this.dimension==='2d')makeDropdown('▧ Hình & điểm phụ',basicExtras);
    else makeDropdown('⬡ Thêm khối 3D',solids);
    if(this.dimension==='2d'){
      const details=document.createElement('details');details.className='mv12-tool-catalog';
      const summary=document.createElement('summary');summary.textContent='⌗ Dựng hình nâng cao';details.append(summary);
      const panel=document.createElement('div');panel.className='mv12-tool-catalog-grid';
      for(const tool of precisionTools){
        const b=button(`＋ ${V[tool]}`,()=>{this.controller.setTool(tool);this._updateUi();details.open=false;},'mv11-tool');
        b.dataset.tool=tool;panel.append(b);
      }
      details.append(panel);this.toolRow.append(details);
    }
    for(const el of this.shell.querySelectorAll('[data-dim]'))el.classList.toggle('active',el.dataset.dim===this.dimension);
  }
  _updateUi(){
    for(const el of this.toolRow.querySelectorAll('[data-tool]'))el.classList.toggle('active',el.dataset.tool===this.controller.tool);
    const n=this.doc.items.length;
    this.footer.replaceChildren();const a=document.createElement('span');a.textContent=`${V.numItems}: ${n}/${MAX_OBJECTS} | ${V.selected}: ${this.controller.selection.length}`;
    const controls=document.createElement('span');controls.textContent=`${V.scene} \u2022 L\u1edbp ${this.grade} \u2022 ${this.dimension.toUpperCase()}`;
    this.footer.append(a,controls);
  }
  setDimension(dim){if(!['2d','3d'].includes(dim)||dim===this.dimension)return;this._stopMotion();
    this._persist();this.dimension=dim;this.doc=this._load();this.history=[JSON.stringify(this.doc)];this.cursor=0;this._mountDimension();this.refreshSavedScenes();
    this.onChange({dimension:dim,count:this.doc.items.length});
  }
  addPrimitive(kind){if(this.doc.items.length>=MAX_OBJECTS){this.onToast(V.capacity);return false;}
    const i=this.doc.items.length;
    if(this.dimension==='2d')this.controller.add(make2D(kind,[i*.2,i*.2]));
    else this.controller.add(make3D(kind,[Math.round((i%5)*2.8-5),0,Math.round(Math.floor(i/5)*2.8-3)]));
    this._updateUi();return true;
  }
  addFromCatalog(model,clientX,clientY){
    if(this.doc.items.length>=MAX_OBJECTS){this.onToast(V.capacity);return false;}
    const modality=model.modality||'';
    if((this.dimension==='2d'&&modality!=='geometry2d')||(this.dimension==='3d'&&modality!=='solid3d')){
      this.onToast(V.wrongType);return false;
    }
    let position;
    if(this.dimension==='2d'&&Number.isFinite(clientX)&&Number.isFinite(clientY)){
      const rect=this.controller.canvas?.getBoundingClientRect();position=rect?this.controller.quantize(this.controller.world([clientX-rect.left,clientY-rect.top])):[0,0];
    }else if(this.dimension==='3d'&&Number.isFinite(clientX)&&Number.isFinite(clientY)&&this.controller.camera){
      this.controller._mouse({clientX,clientY});const hit=this.controller._rayFloor();position=hit?[hit.x,hit.y,hit.z]:[0,0,0];
    }else position=this.dimension==='2d'?[this.doc.items.length*.2,0]:[(this.doc.items.length%5)*2.5-4,0,0];
    const object=fromCatalog(model,this.dimension,position);if(!object){this.onToast(V.wrongType);return false;}
    this.controller.add(object);this._updateUi();return true;
  }
  commit(){
    this._stopMotion();const current=JSON.stringify(this.doc);
    if(this.history[this.cursor]!==current){
      this.history=this.history.slice(0,this.cursor+1);this.history.push(current);
      if(this.history.length>80)this.history.shift();this.cursor=this.history.length-1;
    }
    this._persist();this.renderInspector();this._updateUi();this.onChange({dimension:this.dimension,count:this.doc.items.length});
  }
  _restore(index){if(index<0||index>=this.history.length)return;this._stopMotion();
    this.cursor=index;const restored=validateDocument(JSON.parse(this.history[index]),this.grade,this.dimension);
    this.doc=restored;this.controller.doc=restored;this.controller.setSelection([]);
    if(this.dimension==='3d')this.controller.reload();else this.controller.draw();this.renderInspector();this._persist();this._updateUi();
  }
  undo(){this._restore(this.cursor-1);}
  redo(){this._restore(this.cursor+1);}
  remove(){const ids=new Set(this.controller.selection);if(!ids.size)return;
    const parents=new Set(ids);let removed=false;
    let previous=-1;
    while(previous!==parents.size){
      previous=parents.size;
      for(const item of this.doc.items){
        if(parents.has(item.parentId)||item.parentIds?.some(id=>parents.has(id)))parents.add(item.id);
      }
    }
    this.doc.items=this.doc.items.filter(item=>{if(parents.has(item.id)){removed=true;return false;}return true;});
    if(this.doc.motion?.keyframes)for(const frame of this.doc.motion.keyframes)frame.items=frame.items.filter(i=>!parents.has(i.id));
    if(removed){this.controller.setSelection([]);if(this.dimension==='3d')this.controller.reload();else this.controller.draw();this.commit();}
  }
  duplicate(){const source=this.doc.items.filter(item=>this.controller.selection.includes(item.id));if(!source.length)return;
    if(source.length+this.doc.items.length>MAX_OBJECTS){this.onToast(V.capacity);return;}
    const ids=new Map(source.map(o=>[o.id,uid()]));
    const items=source.map(v=>{
      const next=clone(v);next.id=ids.get(v.id);
      if(next.parentId&&ids.has(next.parentId))next.parentId=ids.get(next.parentId);
      if(next.parentIds)next.parentIds=next.parentIds.map(id=>ids.get(id)||id);
      next.x+=this.dimension==='2d'?.4:1.5;next.y+=this.dimension==='2d'?.4:0;return next;
    });
    this.doc.items.push(...items);
    if(this.dimension==='3d')this.controller.reload();else this.controller.draw();this.controller.setSelection(items.map(v=>v.id));this.commit();
  }
  clearAll(){
    if(!this.doc.items.length&&!this.doc.motion?.keyframes?.length)return;
    if(typeof window!=='undefined'&&typeof window.confirm==='function'&&!window.confirm(V.deleteConfirm))return;
    this._stopMotion?.();
    this.motionOriginal=null;
    this.motionPosition=0;
    this.doc.items=[];
    if(this.doc.motion)this.doc.motion.keyframes=[];
    this.controller?.setSelection?.([]);
    if(this.dimension==='3d')this.controller?.reload?.();else this.controller?.draw?.();
    this._renderMotionUI?.();
    this.commit?.();
  }
  _createMotionUI(node){
    const summary=document.createElement('summary');summary.textContent='🎞 Motion Studio · Ghi các trạng thái hình';node.append(summary);
    const body=document.createElement('div');body.className='mv12-timeline-body';
    const tools=document.createElement('div');tools.className='mv12-timeline-actions';
    this.motionRecord=button('● Ghi mốc',()=>this._recordMotion());
    this.motionPlay=button('▶ Phát',()=>this._playMotion());
    this.motionPause=button('Ⅱ Tạm dừng',()=>this._pauseMotion());
    this.motionReset=button('↺ Đặt lại',()=>this._stopMotion());
    this.motionDelete=button('✕ Xóa mốc cuối',()=>this._deleteMotionFrame());
    tools.append(this.motionRecord,this.motionPlay,this.motionPause,this.motionReset,this.motionDelete);
    this.motionSpeed=document.createElement('select');this.motionSpeed.setAttribute('aria-label','Tốc độ chuyển động');
    for(const speed of [.25,.5,1,1.5,2,3]){const o=document.createElement('option');o.value=speed;o.textContent=speed+'×';this.motionSpeed.append(o);}
    this.motionSpeed.addEventListener('change',()=>{this.doc.motion??={keyframes:[],speed:1};this.doc.motion.speed=Number(this.motionSpeed.value);this.commit();});
    tools.append(this.motionSpeed);
    const seek=document.createElement('div');seek.className='mv12-timeline-scrub';
    this.motionSlider=document.createElement('input');this.motionSlider.type='range';this.motionSlider.min='0';this.motionSlider.max='1';this.motionSlider.step='.01';this.motionSlider.value='0';this.motionSlider.setAttribute('aria-label','Tua mốc chuyển động');
    this.motionSlider.addEventListener('input',()=>this._seekMotion(Number(this.motionSlider.value)));
    this.motionTime=document.createElement('span');seek.append(this.motionSlider,this.motionTime);
    this.motionMarkers=document.createElement('div');this.motionMarkers.className='mv12-timeline-markers';
    body.append(tools,seek,this.motionMarkers);node.append(body);
    this._renderMotionUI();
  }
  _renderMotionUI(){
    if(!this.motionSlider)return;
    const frames=this.doc?.motion?.keyframes||[],duration=Math.max(1,frames.at(-1)?.at||0);
    this.motionSlider.max=String(duration);if(!this.motionPlaying)this.motionSlider.value=String(Math.min(this.motionPosition,duration));
    this.motionTime.textContent=`${this.motionPosition.toFixed(1)}s / ${duration.toFixed(1)}s · ${frames.length} mốc`;
    this.motionSpeed.value=String(this.doc?.motion?.speed||1);
    this.motionMarkers.replaceChildren();for(const f of frames){
      const m=button(`◆ ${f.at.toFixed(1)}s`,()=>this._seekMotion(f.at));m.title='Xem mốc '+f.at.toFixed(1)+' giây';this.motionMarkers.append(m);
    }
  }
  _previewMotion(){if(this.dimension==='3d')this.controller?.preview?.();else this.controller?.draw?.();}
  _recordMotion(){
    this._stopMotion();if(!this.doc.items.length){this.onToast(V.noData);return;}
    const frames=this.doc.motion?.keyframes||[];
    const at=frames.length?Math.min(300,frames.at(-1).at+2):0;
    const frame=recordKeyframe(this.doc,at);this.motionPosition=frame.at;this.commit();this._renderMotionUI();
    if(frame.limitReached){
      this.onToast('Đã đạt giới hạn 60 mốc hoạt cảnh: mốc '+frame.at.toFixed(1)+' giây đã thay thế mốc cũ nhất.');
    }else{
      this.onToast('Đã ghi mốc '+frame.at.toFixed(1)+' giây. Kéo hình rồi ghi mốc kế tiếp.');
    }
  }
  _deleteMotionFrame(){this._stopMotion();const frames=this.doc.motion?.keyframes;
    if(frames?.length){frames.pop();this.motionPosition=0;this.commit();this._renderMotionUI();}
  }
  _seekMotion(value){
    const frames=this.doc.motion?.keyframes||[];if(!frames.length)return;
    this._pauseMotion();
    if(!this.motionOriginal)this.motionOriginal=clone(this.doc.items);
    this.motionPosition=value;interpolateState(this.doc,frames,value);this._previewMotion();this._renderMotionUI();
  }
  _playMotion(){
    const frames=this.doc.motion?.keyframes||[];if(frames.length<2){this.onToast('Hãy ghi ít nhất 2 mốc ở các trạng thái khác nhau.');return;}
    if(this.motionPlaying)return;
    if(!this.motionOriginal)this.motionOriginal=clone(this.doc.items);
    this.motionPlaying=true;this.motionPrevious=0;
    const end=frames.at(-1).at, speed=()=>this.doc.motion?.speed||1;
    const tick=time=>{
      if(!this.motionPlaying)return;
      if(this.motionPrevious)this.motionPosition+=(time-this.motionPrevious)/1000*speed();this.motionPrevious=time;
      if(this.motionPosition>end)this.motionPosition=0;
      interpolateState(this.doc,frames,this.motionPosition);this._previewMotion();this._renderMotionUI();
      this.motionRAF=requestAnimationFrame(tick);
    };this.motionRAF=requestAnimationFrame(tick);
  }
  _pauseMotion(){this.motionPlaying=false;if(this.motionRAF)cancelAnimationFrame(this.motionRAF);this.motionRAF=0;}
  _stopMotion(){
    this._pauseMotion();if(this.motionOriginal&&this.doc){this.doc.items=this.motionOriginal;this.motionOriginal=null;
      if(this.controller){this.controller.doc=this.doc;this.controller.reload?.();this.controller.draw?.();}
    }
    this.motionPosition=0;this._renderMotionUI();
  }
  exportJSON(){
    this._persist();
    const stamp=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
    downloadBlob(`MATHVERSE_lop${this.grade}_${this.dimension}_canh_${stamp}.json`,JSON.stringify(this.doc,null,2),'application/json');
  }
  exportPNG(){
    const data=this.controller.exportPNG?.();if(!data){this.onToast('Khong the xuat anh tren trinh duyet nay.');return;}
    const stamp=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
    const a=document.createElement('a');a.href=data;a.download=`MATHVERSE_lop${this.grade}_${this.dimension}_${stamp}.png`;document.body.append(a);a.click();a.remove();
  }
  _shortcuts(e){if(!this.container.isConnected)return;
    const target=e.target;if(['INPUT','TEXTAREA','SELECT'].includes(target?.tagName)||target?.isContentEditable)return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.stopImmediatePropagation();if(e.shiftKey)this.redo();else this.undo();}
    else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();e.stopImmediatePropagation();this.redo();}
    else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='d'){e.preventDefault();this.duplicate();}
    else if(['Delete','Backspace'].includes(e.key)){e.preventDefault();this.remove();}
  }
  renderInspector(){
    if(!this.inspector)return;const holder=this.inspector;holder.replaceChildren();
    const section=document.createElement('div');section.className='mv11-inspector-section';
    const heading=document.createElement('h3');heading.textContent=V.objects;section.append(heading);
    const list=document.createElement('div');list.className='mv11-object-list';
    if(!this.doc.items.length){const empty=document.createElement('p');empty.className='mv11-muted';empty.textContent=V.dragtip;list.append(empty);}
    else for(const item of [...this.doc.items].reverse()){
      const row=document.createElement('div');row.className='mv11-object-row';
      row.classList.toggle('active',this.controller.selection.includes(item.id));
      const open=button(item.label,()=>{this.controller.setSelection([item.id]);this.renderInspector();},'mv11-object-name');
      open.title=item.label;const eye=button(item.hidden?'\u25cb':'\u25c9',()=>{item.hidden=!item.hidden;this.controller.reload?.();this.controller.draw?.();this.commit();},'mv11-object-toggle');
      eye.title=V.hidden;const lock=button(item.locked?'\u25a3':'\u25a1',()=>{item.locked=!item.locked;this.controller.reload?.();this.controller.draw?.();this.commit();},'mv11-object-toggle');lock.title=V.locked;
      row.append(open,eye,lock);list.append(row);
    }
    section.append(list);holder.append(section);
    const selected=this.doc.items.filter(item=>this.controller.selection.includes(item.id));
    if(selected.length!==1){const p=document.createElement('p');p.className='mv11-muted';p.textContent=selected.length>1?`${V.grouped} (${selected.length})`:V.empty;holder.append(p);return;}
    const item=selected[0],properties=document.createElement('div');properties.className='mv11-inspector-section';
    const subtitle=document.createElement('h3');subtitle.textContent=V.properties;properties.append(subtitle);
    const fields=[['label',V.label,'text'],['x','X','number'],['y','Y','number']];
    if(this.dimension==='3d')fields.push(['z','Z','number']);
    fields.push(['angle','G\u00f3c quay (\u00b0)','number']);
    if(this.dimension==='3d')fields.push(['sx','T\u1ef7 l\u1ec7 X','number'],['sy','T\u1ef7 l\u1ec7 Y','number'],['sz','T\u1ef7 l\u1ec7 Z','number']);
    if(this.dimension==='2d'){
      if(item.kind==='rectangle')fields.push(['w','Chi\u1ec1u r\u1ed9ng','number'],['h','Chi\u1ec1u cao','number']);
      if(item.kind==='rhombus')fields.push(['d1','\u0110\u01b0\u1eddng ch\u00e9o 1','number'],['d2','\u0110\u01b0\u1eddng ch\u00e9o 2','number']);
      if(item.kind==='circle'||item.kind==='regularPolygon')fields.push(['r','B\u00e1n k\u00ednh','number']);
      if(item.kind==='regularPolygon')fields.push(['n','S\u1ed1 c\u1ea1nh','number']);
    }
    for(const [key,label,type] of fields){if(!(key in item))continue;
      const wrapper=document.createElement('label');wrapper.className='mv11-property-field';
      const text=document.createElement('span');text.textContent=label;
      const input=document.createElement('input');input.type=type;input.value=item[key];if(type==='number'){input.step=key==='n'?'1':'.1';input.min=key==='n'?'3':key==='r'||key==='w'||key==='h'||key==='d1'||key==='d2'||key.startsWith('s')?'.2':'-100';input.max=key==='n'?'16':key.startsWith('s')?'10':'100';}
      input.addEventListener('change',()=>{
        if(key==='label')item[key]=input.value.trim().slice(0,80)||item[key];
        else{
          let value=Number(input.value);if(!Number.isFinite(value)){input.value=item[key];return;}
          if(['r','w','h','d1','d2','sx','sy','sz'].includes(key))value=clamp(value,.2,50);
          if(key==='n')value=Math.round(clamp(value,3,16));
          if(key==='angle')value=((value%360)+360)%360;
          item[key]=value;
          if(this.dimension==='3d'&&['sx','sy','sz'].includes(key))constrainScale3D(item,key.slice(1),value);
        }
        this.controller.reload?.();this.controller.draw?.();this.commit();
      });wrapper.append(text,input);properties.append(wrapper);
    }
    if(this.dimension==='3d'&&item.kind!=='catalog3d'){
      const section=document.createElement('div');section.className='mv12-section-panel';
      const title=document.createElement('h4');title.textContent='⊞ Thiết diện động 3D → 2D';section.append(title);
      const toggle=document.createElement('label');toggle.className='mv12-toggle';
      const checked=document.createElement('input');checked.type='checkbox';checked.checked=!!item.sectionEnabled;
      checked.addEventListener('change',()=>{item.sectionEnabled=checked.checked;this.controller.reload?.();this.commit();});
      toggle.append(checked,document.createTextNode(' Hiện mặt phẳng cắt'));section.append(toggle);
      const slide=document.createElement('input');slide.type='range';slide.min='2';slide.max='98';slide.step='1';slide.value=Math.round(100*(item.sectionFraction??.5));slide.className='mv12-section-slider';
      const viz=document.createElement('div');viz.className='mv12-section-viz';
      const update=()=>{
        const profile=computeHorizontalSection(item,item.sectionFraction??.5);if(!profile)return;
        const poly=sectionSVG(profile);
        viz.replaceChildren();
        const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 200 128');svg.setAttribute('aria-label','Thiết diện phẳng theo chiều cao');
        const shape=document.createElementNS('http://www.w3.org/2000/svg','polygon');shape.setAttribute('points',poly);shape.setAttribute('fill','#f3d49b');shape.setAttribute('stroke','#c5781c');shape.setAttribute('stroke-width','2');svg.append(shape);viz.append(svg);
        const metrics=document.createElement('p');metrics.textContent=`h = ${profile.worldHeight.toFixed(2)} đv • S = ${formatSectionArea(profile.area)}`;viz.append(metrics);
      };
      slide.addEventListener('input',()=>{item.sectionFraction=Number(slide.value)/100;item.sectionEnabled=true;checked.checked=true;this.controller.reload?.();update();});
      slide.addEventListener('change',()=>this.commit());
      section.append(slide,viz);update();properties.append(section);
    }
    if(this.dimension==='2d'){
      const result=metrics2D(item);const metrics=document.createElement('div');metrics.className='mv11-object-metrics';
      for(const [key,value] of Object.entries(result)){
        const p=document.createElement('div');p.textContent=`${V[key]||key}: ${value}`;metrics.append(p);
      }
      properties.append(metrics);
      if(['perpBisector','parallelLine','perpendicularLine','median','altitude','angleBisector','intersectionPoint','circumcircle','tangentLine'].includes(item.kind)){
        const note=document.createElement('p');note.className='mv12-derived-note';
        note.textContent='Quan hệ dựng hình phụ thuộc đối tượng gốc: kết quả tự cập nhật khi cô kéo điểm/đường liên quan.';
        properties.append(note);
      }
      if(item.kind==='construction2d'){
        const note=document.createElement('p');note.className='mv11-muted';
        note.textContent='Ph\u00e9p d\u1ef1ng m\u1eabu \u0111\u01b0\u1ee3c gi\u1eef nguy\u00ean c\u1ea5u tr\u00fac; c\u00f3 th\u1ec3 di chuy\u1ec3n v\u00e0 xoay c\u1ea3 h\u00ecnh.';
        properties.append(note);
      }
    }
    const row=document.createElement('div');row.className='mv11-properties-actions';
    row.append(button(V.duplicate,()=>this.duplicate()),button(V.delete,()=>this.remove()));
    properties.append(row);holder.append(properties);
  }
  dispose(){this._stopMotion();this._persist();window.removeEventListener('keydown',this._shortcuts);this.controller?.dispose();this.container?.replaceChildren();}
}
