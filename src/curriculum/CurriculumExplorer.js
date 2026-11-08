import {Grade12Lab} from './Grade12Lab.js?v=r107_v15';
import {Grade6Lab} from '../curriculum/Grade6Lab.js?v=r107_v15';
import {getLabDoorsForRoom} from '../museum/r68-unified-labs.mjs?v=r107_v15';
import {getCurriculumModelById} from './curriculum-manifest.mjs?v=r107_v15';
import {mountGuidedDiscoveryCard} from './guided-discovery.mjs?v=r107_v15';
import {LAB_TO_EXHIBIT} from '../math6-lab/catalog.js?v=r107_v15';
import {grade6WarehouseFamilies, GRADE6_WAREHOUSE_COUNT} from './grade6-warehouse.mjs?v=r107_v15';
import {isGrade6ActiveLab} from '../portal-labs/grade6-curation-v15-1.js?v=r107_v15';
import {isGrade12Mode} from './grade12-engine.mjs?v=r107_v15';
import {CirclePositionLab} from './CirclePositionLab.js?v=r107_v15';
import {FunctionGraphLab} from './FunctionGraphLab.js?v=r107_v15';
import {Grade7Lab} from './Grade7Lab.js?v=r107_v15';
import {Grade8Lab} from './Grade8Lab.js?v=r107_v15';
import {Grade9Lab} from './Grade9Lab.js?v=r107_v15';
import {Grade10Lab} from './Grade10Lab.js?v=r107_v15';
import {Grade11Lab} from './Grade11Lab.js?v=r107_v15';
import {isGrade11Mode} from './grade11-engine.mjs?v=r107_v15';
import {isGrade10Mode} from './grade10-engine.mjs?v=r107_v15';
import {isGrade9Mode} from './grade9-engine.mjs?v=r107_v15';
import {isGrade8Mode} from './grade8-engine.mjs?v=r107_v15';
import {isGrade7Mode} from './grade7-engine.mjs?v=r107_v15';
import {isGraphCase} from './graph-models.mjs?v=r107_v15';
import {isCirclePosition,CIRCLE_POSITION_IDS} from './circle-positions.mjs?v=r107_v15';
import {TRIANGLE_CASES,TRIANGLE_CASE_IDS,isTriangleCase,initialTriangleParams,triangleParamSchema,makeTrianglePair,dragTrianglePoint} from './triangle-engine.mjs?v=r107_v15';
import {isTrue3DCapable} from '../math6-lab/math6-taxonomy.mjs?v=r107_v15';
import {mountRenderedFormula} from './math-formula-renderer.mjs?v=r107_v15';
import {createStageInteractivity,decorateInteractiveSVG,tryStartLabelOrPointDrag,handleLabelOrPointMove,stopLabelOrPointDrag,bindFrameWheelZoom,resetStageInteractivity} from './svg-stage-interactivity.mjs?v=r107_v15';
import {createIntegratedSgkDirectory} from './sgk-integrated-directory.mjs?v=r107_v15';
import {SGK_EXHIBIT_TO_MODE} from './sgk-exhibit-links.mjs?v=r107_v15';
import {isDuplicateMergedModeId,resolveDeduplicatedModeId} from './dedup-modes.mjs?v=r107_v15';
import {ViewerRegistry} from '../viewers/ViewerRegistry.js?v=r107_v15';
import {scheduleLabAutoplay,cancelLabAutoplay,isAutoPlayEnabled,setAutoPlayEnabled} from './lab-autoplay.mjs?v=r107_v15';
import {speakText,stopSpeech} from '../ui/audio.js?v=r107_v15';

const SVG_NS='http://www.w3.org/2000/svg';
const node=(tag,cls='',value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=String(value);return e;};
const svgNode=(tag,attrs={})=>{const e=document.createElementNS(SVG_NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
const button=(label,fn,cls='')=>{const e=node('button',cls,label);e.type='button';e.addEventListener('click',fn);return e;};
const fmt=n=>Number.isFinite(n)?Number(n).toLocaleString('vi-VN',{maximumFractionDigits:3}):'—';
const FAMILY_NAMES={
'7-01':'Trục số, số thực và căn bậc hai','7-02':'Góc và hai đường thẳng song song','7-03':'Góc trong tam giác','7-04':'Các trường hợp bằng nhau của tam giác','7-05':'Các đường đồng quy trong tam giác','7-06':'Biểu đồ quạt tròn','7-07':'Biểu đồ đoạn thẳng','7-08':'Hình hộp chữ nhật và lập phương','7-09':'Lăng trụ đứng','7-10':'Phép thử ngẫu nhiên',
'8-01':'Cắt ghép minh họa hằng đẳng thức','8-02':'Tứ giác đặc biệt','8-03':'Định lí Thalès và đường trung bình','8-04':'Tính chất phân giác trong tam giác','8-05':'Định lí Pythagore','8-06':'Các trường hợp đồng dạng của tam giác','8-07':'Hàm số bậc nhất','8-08':'Dữ liệu, biểu đồ và xác suất','8-09':'Hình chóp đều',
'9-01':'Hệ hai phương trình bậc nhất','9-02':'Bất phương trình bậc nhất','9-03':'Tỉ số lượng giác góc nhọn','9-04':'Đo chiều cao và khoảng cách','9-05':'Dây cung, cung tròn, hình quạt','9-06':'Vị trí tương đối của đường tròn','9-07':'Góc nội tiếp và tứ giác nội tiếp','9-08':'Đồ thị y = ax²','9-09':'Hình trụ','9-10':'Hình nón','9-11':'Hình cầu','9-12':'Tần số và tần số tương đối','9-13':'Phép thử xác suất hữu hạn',
'10-01':'Tập hợp và sơ đồ Venn','10-02':'Miền nghiệm bất phương trình hai ẩn','10-03':'Hệ thức lượng trong tam giác','10-04':'Các phép toán vectơ','10-05':'Vectơ và tọa độ Oxy','10-06':'Hàm bậc hai và parabol','10-07':'Phương trình đường thẳng Oxy','10-08':'Phương trình đường tròn Oxy','10-09':'Ba đường conic','10-10':'Đặc trưng mẫu số liệu','10-11':'Quy tắc đếm và xác suất',
'11-01':'Đường tròn lượng giác','11-02':'Đồ thị lượng giác','11-03':'Dãy số và cấp số','11-04':'Thống kê dữ liệu ghép nhóm','11-05':'Điểm, đường thẳng, mặt phẳng','11-06':'Quan hệ song song trong không gian','11-07':'Quan hệ vuông góc trong không gian','11-08':'Góc và khoảng cách trong không gian','11-09':'Thể tích lăng trụ, hình chóp','11-10':'Giới hạn và liên tục','11-11':'Hàm số mũ và logarit','11-12':'Đạo hàm và tiếp tuyến','11-13':'Quy tắc xác suất',
'12-01':'Đạo hàm, cực trị, bảng biến thiên','12-02':'Đồ thị hàm số và tiệm cận','12-03':'Bài toán tối ưu thực tế','12-04':'Vectơ trong Oxyz','12-05':'Độ phân tán dữ liệu ghép nhóm','12-06':'Nguyên hàm, tích phân và diện tích','12-07':'Khối tròn xoay','12-08':'Mặt phẳng trong Oxyz','12-09':'Đường thẳng trong Oxyz','12-10':'Mặt cầu trong Oxyz','12-11':'Xác suất có điều kiện và Bayes'
};
const FAMILY_BADGE={SGK_CHAPTER:'Chương SGK',GRADE6:'Phòng chuyên đề Toán 6',PLANE:'Hình phẳng',SOLID:'Không gian',GRAPH:'Đồ thị',STAT:'Biểu đồ',PROB:'Xác suất',NUMBER:'Trục số',REAL:'Thực tế'};
export const curatedFamilyTitle=fam=>FAMILY_NAMES[fam.id]||fam.name;
const normalizeModeId=id=>String(id||'').replace(/^exhibit:/,'').replace(/-(ADD|MUL|P|A|C)$/,'');
export const caseRuntimeStatus=id=>{
 const base=normalizeModeId(id);
 return (SGK_EXHIBIT_TO_MODE[base]||isTriangleCase(base)||isCirclePosition(base)||isGraphCase(base)||isGrade7Mode(base)||isGrade8Mode(base)||isGrade9Mode(base)||isGrade10Mode(base)||isGrade11Mode(base)||isGrade12Mode(base))?'interactive':'specification';
};

export class CurriculumExplorer{
 constructor({url='/data/mathverse-7-12-curated.json',getLibraryItems=()=>[],getExhibitItems=null}={}){
  this.url=url;this.getLibraryItems=getLibraryItems;this.getExhibitItems=getExhibitItems||getLibraryItems;this.directory=null;this.exhibitViewer=null;this.data=null;this.overlay=null;this.grade=6;this.grade6Lab=null;this.focusMode=false;this.family=null;this.mode=null;this.runningOnly=false;this.search='';this.align=false;this.perturb=false;this.drag=null;this.lastFocus=null;this.grade7Lab=null;this.grade8Lab=null;this.grade9Lab=null;this.grade10Lab=null;this.grade11Lab=null;this.grade12Lab=null;this.triPlaying=false;this.triMotion=0;this.triRAF=0;
  this.keyHandler=e=>{if(e.key==='Escape'&&!this.overlay?.hidden){e.preventDefault();this.close();}};
 }
 async open(grade=7, targetFamily=null, targetMode=null){
  this.lastFocus=document.activeElement;
  if(!this.data){
   try{const res=await fetch(this.url,{cache:'no-cache'});if(!res.ok)throw Error(`HTTP ${res.status}`);const data=await res.json();
    if(data.families!==67||data.modes_total!==247||!Array.isArray(data.source_registry))throw Error('Danh mục thiếu hoặc sai định dạng');
    this.data=data;
    this.directory=createIntegratedSgkDirectory(data,{exhibits:this.getExhibitItems()});
    if(this.directory.errors.length)console.warn('R90 SGK mapping:',this.directory.errors);
   }catch(e){window.alert(`Chưa nạp được kho chuyên đề: ${e.message}`);return;}
  }else if(!this.directory){
   this.directory=createIntegratedSgkDirectory(this.data,{exhibits:this.getExhibitItems()});
  }
  if(!this.overlay)this._build();
  const baseTargetMode=normalizeModeId(targetMode);
  const requested=this.directory?.findMode(targetMode)||this.directory?.findMode(baseTargetMode);
  this.grade=[6,7,8,9,10,11,12].includes(grade)?grade:6;
  if(requested?.grade)this.grade=requested.grade;
  const gradeFamilies=this._families();
  const exactOwner=requested?gradeFamilies.find(f=>f.id===requested.chapterId):null;
  const aliasOwner=targetFamily?this.directory?.findLegacyFamily(this.grade,targetFamily):null;
  const resolved=exactOwner||gradeFamilies.find(f=>f.id===targetFamily)||aliasOwner||gradeFamilies[0];
  this.family=resolved?.id||null;
  const defaultModes=resolved?.modes?.filter(m=>!m.relatedExhibit&&!m.relatedVariant&&!isDuplicateMergedModeId(m.id))||resolved?.modes||[];
  this.mode=(requested&&resolved?.modes?.some(m=>m.id===requested.id))?requested.id:defaultModes[0]?.id||resolved?.modes?.[0]?.id||null;
  this.overlay.hidden=false;this.setFocusMode(this.focusMode);document.body.classList.add('mv-r5-open');document.addEventListener('keydown',this.keyHandler);
  this._applyTheme();
  this.render();this.overlay.querySelector('.mv-r5-close').focus();
 }
 setFocusMode(enabled){
  this.focusMode=Boolean(enabled);
  this.overlay?.classList.toggle('mv-r63-focus',this.focusMode);
  if(this.btnFocus){
    this.btnFocus.textContent=this.focusMode?'⊞ Hiện danh mục':'⛶ Mở rộng hình';
    this.btnFocus.setAttribute('aria-pressed',String(this.focusMode));
    this.btnFocus.title=this.focusMode?'Hiện lại cột danh mục chương và bài học':'Thu gọn danh mục để mở rộng tối đa vùng hình vẽ';
  }
  if(this.stageDrawerBtn){
    this.stageDrawerBtn.innerHTML=this.focusMode?`<span>☰</span> Hiện danh mục (Lớp ${this.grade})`:'<span>◀</span> Thu gọn danh mục';
    this.stageDrawerBtn.setAttribute('aria-pressed',String(!this.focusMode));
    this.stageDrawerBtn.title=this.focusMode?`Mở cột danh mục bài học Lớp ${this.grade}`:'Thu gọn danh mục để phóng to tối đa hình vẽ';
    this.stageDrawerBtn.classList.toggle('is-focus-active',this.focusMode);
  }
 }
 close(){if(!this.overlay)return;stopSpeech();this._disposeActiveLab();this.overlay.hidden=true;document.body.classList.remove('mv-r5-open');document.removeEventListener('keydown',this.keyHandler);this.drag=null;this.lastFocus?.focus?.();}
 _applyTheme(){
  const isDark=this.theme==='dark';
  this.overlay?.classList.toggle('mv-theme-dark',isDark);
  this.overlay?.classList.toggle('mv-theme-light',!isDark);
  this.root?.classList.toggle('mv-theme-dark',isDark);
  this.root?.classList.toggle('mv-theme-light',!isDark);
  if(this.themeBtn){
    this.themeBtn.innerHTML=isDark?'🌙 <span>Đen Teal</span>':'☀️ <span>Trắng Teal</span>';
    this.themeBtn.title=isDark?'Đang bật Đen Teal. Nhấp để chuyển sang ☀️ Trắng Teal':'Đang bật Trắng Teal. Nhấp để chuyển sang 🌙 Đen Teal';
  }
 }
 _build(){
  const overlay=node('div','mv-r5-backdrop');overlay.hidden=true;overlay.id='mv-r5-browser';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Kho SGK và Lab tương tác Toán 6 đến 12');
  const root=node('section','mv-r5-window');overlay.append(root);
  this.root=root;
  const header=node('header','mv-r5-header');const headline=node('div','mv-r5-heading');headline.append(node('strong','', 'MATHVERSE R90 · KHO SGK THEO CHƯƠNG – BÀI – LAB TOÁN 6–12'),node('small','', '7 khối lớp · 58 chương SGK · 166 bài học/Lab SGK · 310 chế độ chuẩn + 54 hiện vật sẵn có gắn theo bài'));
  this.theme=(typeof localStorage!=='undefined'&&localStorage.getItem('mathverse_curriculum_theme'))||'light';
  const themeBtn=button(this.theme==='dark'?'🌙 Đen Teal':'☀️ Trắng Teal',()=>{
    this.theme=this.theme==='dark'?'light':'dark';
    try{localStorage.setItem('mathverse_curriculum_theme',this.theme);}catch(e){}
    this._applyTheme();
  },'mv-r63-theme-btn');
  this.themeBtn=themeBtn;
  const focus=button('⛶ Mở rộng hình',()=>this.setFocusMode(!this.focusMode),'mv-r63-focus-btn');focus.setAttribute('aria-pressed','false');this.btnFocus=focus;
  const speakLessonBtn=button('🔊 Thuyết minh bài học',()=>{
    const fam=this._families().find(f=>f.id===this.family);
    const rec=this._modeRecord();
    const chapTitle=fam?curatedFamilyTitle(fam):`Toán lớp ${this.grade}`;
    const lessonName=rec?(rec.lessonTitle||rec.name||''):'';
    const modeName=rec?(rec.name||''):'';
    const summaryTxt=rec?(rec.summary||rec.description||fam?.summary||''):'';
    const stageNotes=Array.from(this.stage?.querySelectorAll('p, li, .mv-r5-note, .mv-g7-note')||[])
      .map(el=>el.textContent?.trim()||'')
      .filter(Boolean)
      .slice(0,5)
      .join('. ');
    speakText(`Thầy Tùng thuyết minh bài học Toán lớp ${this.grade}, ${chapTitle}. ${lessonName}. Mô hình: ${modeName}. ${summaryTxt}. ${stageNotes}`);
  },'mv-r63-focus-btn');
  speakLessonBtn.title='Nghe giọng đọc Tiếng Việt của Thầy Tùng thuyết minh bài học và mô hình đang mở';
  const actions=node('div','mv-r63-header-actions');const close=button('✕ Đóng',()=>this.close(),'mv-r5-close');actions.append(speakLessonBtn,themeBtn,focus,close);header.append(headline,actions);root.append(header);
  const toolbar=node('div','mv-r5-toolbar');const gradeArea=node('nav','mv-r5-grades');gradeArea.setAttribute('aria-label','Chọn lớp');for(let g=6;g<=12;g++){const b=button(`Lớp ${g}`,()=>{this.grade=g;const first=this._families()[0];const firstModes=first?.modes?.filter(m=>!m.relatedExhibit&&!m.relatedVariant&&!isDuplicateMergedModeId(m.id))||first?.modes||[];this.family=first?.id;this.mode=firstModes[0]?.id;this.render();},'mv-r5-grade');b.dataset.grade=g;gradeArea.append(b);}
  const search=node('input','mv-r5-search');search.type='search';search.placeholder='Tìm chương, bài học, định lý, mã Lab...';search.setAttribute('aria-label','Tìm kiếm kho chuyên đề');search.addEventListener('input',()=>{this.search=search.value.trim().toLocaleLowerCase('vi');this.renderList();});
  const filter=node('label','mv-r5-filter');const check=node('input');check.type='checkbox';check.addEventListener('change',()=>{this.runningOnly=check.checked;this.renderList();});this.filterCaption=node('span','', 'Chỉ xem chế độ đã dựng');filter.append(check,this.filterCaption);
  toolbar.append(gradeArea,search,filter);root.append(toolbar);
  const body=node('div','mv-r5-body');this.left=node('aside','mv-r5-families');this.list=node('aside','mv-r5-cases');this.stage=node('main','mv-r5-stage');body.append(this.left,this.list,this.stage);root.append(body);
  const footer=node('footer','mv-r5-footer','MATHVERSE R90 · Các mô hình từng nằm ở menu “KIỂM ĐỊNH R86 (L6–L12)” nay mở trực tiếp trong Kho SGK theo đúng Chương → Bài → Lab; giữ nguyên toàn bộ ID và sảnh 3D.');root.append(footer);
  document.body.append(overlay);this.overlay=overlay;overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)this.close();});
 }
 _families(){return this.directory?.getChapters(this.grade)||(this.grade===6?grade6WarehouseFamilies():[]);}
 _modeRecord(){const fam=this._families().find(f=>f.id===this.family);return fam?.modes.find(m=>m.id===this.mode)||null;}
 _modeReady(mode){return !!mode?.relatedExhibit||Boolean(mode?.realModel)||caseRuntimeStatus(mode?.baseId||mode?.id)==='interactive';}
 _modeVisible(mode){return !this.runningOnly||this._modeReady(mode);}
 render(){if(this.filterCaption)this.filterCaption.textContent='Chỉ xem mô hình mở được';for(const b of this.overlay.querySelectorAll('.mv-r5-grade')){const active=Number(b.dataset.grade)===this.grade;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));}this.renderList();}
 renderList(){
  this.left.replaceChildren();this.list.replaceChildren();const families=this._families();
  this.left.append(node('h3','',`Lớp ${this.grade} · ${families.length} chương SGK`));
  for(const family of families){
   const isMergedInChapter=m=>{
    const anchor=m.anchorModeId||(isDuplicateMergedModeId(m.id)?resolveDeduplicatedModeId(m.id):null);
    return Boolean((m.relatedExhibit||m.relatedVariant||isDuplicateMergedModeId(m.id))&&anchor&&family.modes.some(x=>x.id===anchor));
   };
   const canonModes=family.modes.filter(m=>!isMergedInChapter(m));
   const available=canonModes.filter(m=>this._modeReady(m)).length;const total=canonModes.length;
   const match=`${curatedFamilyTitle(family)} ${family.modes.map(x=>`${x.name} ${x.id} ${x.lessonTitle||''}`).join(' ')}`.toLocaleLowerCase('vi').includes(this.search);
   if(!match||(this.runningOnly&&available===0))continue;
   const b=button('',()=>{this.family=family.id;const visible=canonModes.filter(m=>this._modeVisible(m)&&(!this.search||`${curatedFamilyTitle(family)} ${m.name} ${m.id} ${m.lessonTitle||''}`.toLocaleLowerCase('vi').includes(this.search)));this.mode=visible[0]?.id||canonModes[0]?.id||family.modes[0]?.id;this.renderList();},'mv-r5-family'+(family.id===this.family?' active':''));
   b.dataset.family=family.id;
   b.append(node('strong','',curatedFamilyTitle(family)),node('small','',`${family.summary.replace(/\d+\s*(?:Lab SGK|mô hình)/,`${total} mô hình`)} · ${available}/${total} truy cập được`));this.left.append(b);
  }
  const current=families.find(f=>f.id===this.family);if(!current){this._disposeActiveLab();this.stage.replaceChildren(node('p','','Chọn một chương SGK ở cột bên trái.'));return;}
  this.list.append(node('h3','',curatedFamilyTitle(current)+' · Theo từng bài học'));
  const linkedByAnchor=new Map();
  for(const m of current.modes){
   const anchor=m.anchorModeId||(isDuplicateMergedModeId(m.id)?resolveDeduplicatedModeId(m.id):null);
   if((m.relatedExhibit||m.relatedVariant||isDuplicateMergedModeId(m.id))&&anchor&&current.modes.some(x=>x.id===anchor)){
    if(!linkedByAnchor.has(anchor))linkedByAnchor.set(anchor,[]);
    linkedByAnchor.get(anchor).push(m);
   }
  }
  let shown=0;
  let lastLessonKey='';
  for(const mode of current.modes){
   const anchor=mode.anchorModeId||(isDuplicateMergedModeId(mode.id)?resolveDeduplicatedModeId(mode.id):null);
   if((mode.relatedExhibit||mode.relatedVariant||isDuplicateMergedModeId(mode.id))&&anchor&&current.modes.some(x=>x.id===anchor))continue;
   const linked=linkedByAnchor.get(mode.id)||[];
   const linkedSearch=linked.map(x=>`${x.id} ${x.name}`).join(' ');
   const active=this._modeReady(mode);
   const match=`${curatedFamilyTitle(current)} ${mode.name} ${mode.id} ${mode.displayCode||''} ${mode.lessonTitle||''} ${linkedSearch}`.toLocaleLowerCase('vi').includes(this.search);
   if(!this._modeVisible(mode)||!match)continue;
   const lessonKey=`${mode.lessonNum||0}:${mode.lessonTitle||''}`;
   if(mode.lessonTitle&&lessonKey!==lastLessonKey){
    lastLessonKey=lessonKey;
    this.list.append(node('div','mv-r90-lesson-divider',`Bài ${mode.lessonNum}: ${mode.lessonTitle}`));
   }
   shown++;
   const isSelected=mode.id===this.mode||linked.some(x=>x.id===this.mode);
   const b=button('',()=>{
    // R92: Exhibits are references. Default to the *teaching* Lab, not the still museum thumbnail.
    const target=mode.relatedExhibit&&this.directory?.findMode(mode.anchorModeId)?mode.anchorModeId:mode.id;
    this.mode=target;this.align=false;this.perturb=false;this.renderList();
   },'mv-r5-case'+(isSelected?' active':''));
   b.dataset.mode=mode.id;
   if(linked.length)b.dataset.linkedExhibits=linked.map(x=>x.id).join(',');
   const isG6_3d = this.grade === 6 && isTrue3DCapable(mode.id);
   const baseStatus=mode.relatedExhibit?'▶ Mở Lab động của hiện vật (không trưng bày tĩnh)':
    mode.relatedVariant?'↳ Chế độ cùng bài':
    this.grade===6?(mode.status==='archived'?'◇ Kho lưu trữ SGK':isG6_3d?'● 3D tương tác':'● Lab 2D/3D'):
    active?'● Lab chuyên sâu':'○ Chưa có bộ dựng';
   const statusText=linked.length?`${baseStatus} · Hợp nhất ${linked.map(x=>x.id).join(', ')}`:baseStatus;
   b.classList.toggle('mv-r90-exhibit-item',!!mode.relatedExhibit);
   const lessonLabel=`Tập ${mode.volume||current.volume} · Bài ${mode.lessonNum}: ${mode.lessonTitle||''}`;
   const codeLabel=`${mode.displayCode||mode.id}${linked.length?` (+ ${linked.map(x=>x.id).join(', ')})`:''}`;
   b.append(node('small','mv-r5-case-id',codeLabel+' · '+lessonLabel),
    node('strong','',mode.name),node('span','mv-r5-status '+(active?'ready':'pending'),statusText));this.list.append(b);
  }
  if(!shown)this.list.append(node('p','mv-r5-empty','Không có chế độ phù hợp.'));
  const selected=this._modeRecord();if(selected&&this._modeVisible(selected)){
   try{this.renderStage(selected,current);}catch(error){console.error('R90 SGK render error',selected.id,error);
    this._disposeActiveLab();this.stage.replaceChildren(node('p','mv-g7-fallback',`Không hiển thị được ${selected.id}: ${error.message}. Vui lòng chọn mô hình khác hoặc dùng nút Chạy lại.`));}
  }
  else {this._disposeActiveLab();this.stage.replaceChildren(node('p','mv-r5-empty','Chọn một chế độ ở cột bên trái.'));}
 }
 _renderGrade6Stage(mode,family){
  const anchorId=LAB_TO_EXHIBIT[mode.id];
  const anchor=(this.getLibraryItems()||[]).find(x=>x.id===anchorId&&Number(x.grade)===6)||(anchorId?{id:anchorId,grade:6,title:mode.name||'Mô hình Toán 6',formula:''}:null);
  if(!anchor){this.stage.append(node('p','mv-r5-empty',`Không có hiện vật liên kết Toán 6: ${anchorId||mode.id}`));return;}
  const host=node('div','mv-r5-specialized-host mv-g6-warehouse-host');this.stage.append(host);
  try{
   this.grade6Lab=new Grade6Lab({anchor,initialLabId:mode.id,includeArchived:true,
    allowedLabIds:family.modes.filter(m=>!isDuplicateMergedModeId(m.id)||m.id===mode.id).map(m=>m.id),
    onNotice:msg=>{const banner=node('div','mv-g7-fallback',msg);host.prepend(banner);},
    onSelected:model=>{this.mode=model.id;
     for(const b of this.list.querySelectorAll('.mv-r5-case'))b.classList.toggle('active',b.dataset.mode===model.id);
    }
   });
   this.grade6Lab.mount(host);
  }catch(error){console.error('Grade6Lab unified renderer:',error);
   this.grade6Lab?.dispose();this.grade6Lab=null;
   host.replaceChildren(node('p','mv-g7-fallback',`Không khởi tạo được Lab Toán 6: ${error.message}`));
  }
 }
 _disposeActiveLab(){
  cancelLabAutoplay(this);
  if(this.grade6Lab){this.grade6Lab.dispose();this.grade6Lab=null;}
  if(this.grade7Lab){this.grade7Lab.destroy();this.grade7Lab=null;}
  if(this.grade8Lab){this.grade8Lab.destroy();this.grade8Lab=null;}
  if(this.grade9Lab){this.grade9Lab.destroy();this.grade9Lab=null;}
  if(this.grade10Lab){this.grade10Lab.destroy();this.grade10Lab=null;}
  if(this.grade11Lab){this.grade11Lab.destroy();this.grade11Lab=null;}
  if(this.grade12Lab){this.grade12Lab.destroy();this.grade12Lab=null;}
  if(this.circleLab){this.circleLab.destroy?.();this.circleLab=null;}
  if(this.graphLab){this.graphLab.destroy?.();this.graphLab=null;}
  if(this.exhibitViewer){try{this.exhibitViewer.dispose?.();}catch(error){console.warn(error);}this.exhibitViewer=null;}
  if(this.triRAF)cancelAnimationFrame(this.triRAF);this.triRAF=0;this.triPlaying=false;this.triMotion=0;
 }
 _renderExistingExhibit(mode){
  const host=node('section','mv-r90-linked-exhibit');this.stage.append(host);
  const controls=node('div','mv-r90-linked-actions');host.append(controls);
  const anchorId=mode.anchorModeId;
  const gotoLab=button(`▶ Xem hoạt cảnh trong Lab SGK tương ứng (${anchorId})`,()=>{void this.open(this.grade,mode.chapterId,anchorId);},'mv-r5-action');
  controls.append(gotoLab);
  for(const [lbl,pct] of [['⏮ Mốc 0%',0],['◐ Mốc 50%',50],['⏭ Mốc 100%',100]]){
   controls.append(button(`${lbl} (${anchorId})`,()=>{
    void this.open(this.grade,mode.chapterId,anchorId).then(()=>{
     setTimeout(()=>{
      const btns=[...this.stage.querySelectorAll('button')];
      const match=btns.find(b=>(b.textContent||'').trim()===`${pct}%`||(b.textContent||'').includes(`Mốc ${pct}%`));
      if(match)match.click();
     },60);
    });
   },'mv-g7-button'));
  }
  const source=[...(this.getLibraryItems()||[]),...(this.getExhibitItems()||[])]
   .find(item=>item.id===mode.sourceExhibitId&&Number(item.grade)===Number(mode.grade));
  if(!source){host.append(node('p','mv-g7-fallback',`Chưa tìm thấy dữ liệu hiện vật gốc ${mode.sourceExhibitId}. Mở Lab SGK liên kết để xem mô phỏng tương ứng.`));return;}
  const stage=node('div','mv-r90-linked-stage');host.append(stage);
  const note=node('p','mv-r5-hint',`Hiện vật gốc: ${source.id} · ${source.title}. Đây là mô hình học liệu có sẵn (không sao chép). Để xem chuyển động theo tiến trình chứng minh, chọn “Xem hoạt cảnh trong Lab SGK tương ứng”.`);host.append(note);
  const legend=node('div','mv-r90-color-legend');legend.setAttribute('aria-label','Chú giải màu sắc có chủ đích');
  for(const [color,label] of [['#1D4ED8','Dữ kiện'],['#B45309','Đang dựng'],['#15803D','So sánh'],['#6D28D9','Kết quả'],['#475569','Đường phụ']]){
   const tag=node('span','',label);tag.style.setProperty('--r90-key-color',color);legend.append(tag);
  }
  host.append(legend);
  if(source.formula){
   const formulaBox=node('div','mv-r5-latex');
   mountRenderedFormula(formulaBox,source.formula);
   host.append(formulaBox);
  }
  try{
   const viewer=ViewerRegistry.createViewer(source,{onParametersChange:()=>{}});
   viewer.mount(stage);viewer.setToolMode?.('orbit');this.exhibitViewer=viewer;
   if(typeof requestAnimationFrame==='function'){
    requestAnimationFrame(()=>{try{viewer.resize?.();}catch{}});
   }
  }catch(error){console.error('R90 source exhibit renderer:',source.id,error);
   try{this.exhibitViewer?.dispose?.();}catch{}this.exhibitViewer=null;
   stage.replaceChildren(node('p','mv-g7-fallback',`Không thể khởi tạo hiện vật ${source.id} trên trình duyệt này: ${error.message}. Mở Lab tương ứng bằng nút phía trên.`));
  }
 }
 _mountExistingLab(LabClass,property,host,id,mode){
  // Compatibility note for audit tests: new Grade8Lab() / new Grade7Lab() / new Grade9Lab()
  try{const lab=new LabClass();this[property]=lab;lab.mount(host,id,mode);}
  catch(error){console.error(`R90 Lab ${id} không hiển thị`,error);
   try{this[property]?.destroy?.();}catch{}this[property]=null;
   host.replaceChildren(node('p','mv-g7-fallback',`Lỗi mở ${id}: ${error.message}. Kiểm tra WebGL/Console và thử tải lại Lab.`));
  }
 }
 setPlaying(active){this._setTriPlaying(active);}
 _setTriPlaying(active){
  if(!active){
   cancelLabAutoplay(this);
   this.triPlaying=false;
   if(this.triRAF)cancelAnimationFrame(this.triRAF);
   this.triRAF=0;
   if(this.triPlayBtn)this.triPlayBtn.textContent='▶ Chồng hình động';
   return;
  }
  this.triPlaying=true;
  if(this.triMotion>=1)this.triMotion=0;
  if(this.triPlayBtn)this.triPlayBtn.textContent='⏸ Dừng chồng hình';
  this.triLast=0;
  const tick=now=>{
   this.triRAF=0;
   if(!this.triPlaying||this.overlay?.hidden)return;
   const delta=this.triLast?Math.min(.07,(now-this.triLast)/1000):.016;
   this.triLast=now;
   this.triMotion=Math.min(1,this.triMotion+delta/4);
   this._drawTriangle();
   if(this.triMotion>=1){this._setTriPlaying(false);return;}
   this.triRAF=requestAnimationFrame(tick);
  };
  this.triRAF=requestAnimationFrame(tick);
 }
 renderStage(mode,family){
  this._disposeActiveLab();this.stage.replaceChildren();const head=node('div','mv-r5-stage-header');
  const baseModeId=mode.baseId||mode.id;
  const cm=getCurriculumModelById(baseModeId);
  const metaLine=cm
    ? `#${String(cm.num).padStart(3,'0')} · LỚP ${cm.targetGrade} (Tập ${cm.volume}) · Chương ${cm.chapterNum}: ${cm.chapterTitle} · Bài ${cm.lessonNum}: ${cm.lessonTitle} · Lab: ${cm.targetLabId}${cm.sourceLabId!==cm.targetLabId?` (gốc: ${cm.sourceLabId})`:''}`
    : `LỚP ${this.grade} · ${family.id} · ${mode.displayCode||mode.id}`;
  const titleRow=node('div','mv-r11-stage-title-row');
  const drawerBtn=button('',()=>this.setFocusMode(!this.focusMode),'mv-stage-drawer-toggle-btn');
  drawerBtn.innerHTML=this.focusMode?`<span>☰</span> Hiện danh mục (Lớp ${this.grade})`:'<span>◀</span> Thu gọn danh mục';
  drawerBtn.setAttribute('aria-pressed',String(!this.focusMode));
  drawerBtn.title=this.focusMode?`Mở cột danh mục bài học Lớp ${this.grade}`:'Thu gọn danh mục để phóng to tối đa hình vẽ';
  drawerBtn.classList.toggle('is-focus-active',this.focusMode);
  this.stageDrawerBtn=drawerBtn;
  titleRow.append(drawerBtn);
  titleRow.append(node('h2','',mode.name));
  const holoBtn=button('🔮 Tương tác trên Bục 3D (Holo-Stage)',()=>{
   this.close();
   if(typeof window!=='undefined'&&typeof window.openHoloStageForMode==='function'){
    window.openHoloStageForMode(baseModeId);
   }
  },'mv-r11-holo-jump-btn');
  titleRow.append(holoBtn);
  head.append(node('small','',metaLine),titleRow);this.stage.append(head);
  const attachDiscovery=()=>mountGuidedDiscoveryCard(this.stage,{modeId:baseModeId,mode});
  if(cm&&cm.sourceGrade!==cm.targetGrade){
   const crossBanner=node('div','mv-r86-cross-grade-banner');
   crossBanner.style.cssText='margin:0 0 8px;padding:8px 12px;border-radius:9px;background:#DBEAFE;border:1px solid #1D4ED8;color:#1D4ED8;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;';
   const crossText=node('span','',`🔗 Liên thông học liệu (R86): Đang trưng bày tại Lớp ${cm.targetGrade} (Bài ${cm.lessonNum}: ${cm.lessonTitle}, Lab ${cm.targetLabId}) · Nguồn dữ liệu gốc: Lớp ${cm.sourceGrade} (${cm.sourceLabId} · ${baseModeId}). Không nhân bản ID.`);
   crossBanner.append(crossText);
   this.stage.append(crossBanner);
  }
  if(mode.relatedExhibit){
   // R91: a linked SGK museum card MUST open the live canonical Lab itself,
   // not mount another static ViewerRegistry card and merely offer a link.
   // Existing museum exhibits remain unchanged in their original rooms.
   const canonical=this.directory?.findMode(mode.anchorModeId);
   if(canonical&&canonical.id!==mode.id&&!canonical.relatedExhibit){
    const selectedAlias=this.mode;
    this.renderStage(canonical,family);
    this.mode=selectedAlias; // keep the selected gallery card highlighted
    const note=node('p','mv-r5-hint',`🔗 Hiện vật liên kết “${mode.name}” → Lab SGK ${canonical.id}: hiển thị hoạt cảnh trực tiếp, không phải ảnh tĩnh.`);
    note.dataset.r91LinkedLab='true';
    this.stage.prepend(note);
    return;
   }
   this._renderExistingExhibit(mode);attachDiscovery();return;
  }
  if(this.grade===6&&!isGrade7Mode(baseModeId)){this._renderGrade6Stage(mode,family);attachDiscovery();return;}
  if(isGrade12Mode(baseModeId)){const host=node('div','mv-r5-specialized-host');this.stage.append(host);this._mountExistingLab(Grade12Lab,'grade12Lab',host,baseModeId,mode);attachDiscovery();return;}
  if(isGrade11Mode(baseModeId)){const host=node('div','mv-r5-specialized-host');this.stage.append(host);this._mountExistingLab(Grade11Lab,'grade11Lab',host,baseModeId,mode);attachDiscovery();return;}
  if(isGrade10Mode(baseModeId)){const host=node('div','mv-r5-specialized-host');this.stage.append(host);this._mountExistingLab(Grade10Lab,'grade10Lab',host,baseModeId,mode);attachDiscovery();return;}
  if(isGrade9Mode(baseModeId)){const host=node('div','mv-r5-specialized-host');this.stage.append(host);this._mountExistingLab(Grade9Lab,'grade9Lab',host,baseModeId,mode);attachDiscovery();return;}
  if(isGrade8Mode(mode.id)||isGrade8Mode(baseModeId)){const host=node('div','mv-r5-specialized-host');this.stage.append(host);this._mountExistingLab(Grade8Lab,'grade8Lab',host,baseModeId,mode);attachDiscovery();return;}
  if(isGrade7Mode(baseModeId)){const host=node('div','mv-r5-specialized-host');this.stage.append(host);this._mountExistingLab(Grade7Lab,'grade7Lab',host,baseModeId,mode);attachDiscovery();return;}
  if(isCirclePosition(baseModeId)){const host=node('div','mv-r5-specialized-host');this.stage.append(host);this._mountExistingLab(CirclePositionLab,'circleLab',host,baseModeId,mode);attachDiscovery();return;}
  if(isGraphCase(baseModeId)){const host=node('div','mv-r5-specialized-host');this.stage.append(host);this._mountExistingLab(FunctionGraphLab,'graphLab',host,baseModeId,mode);attachDiscovery();return;}
  if(!isTriangleCase(mode.id)){
   const info=node('section','mv-r5-design');info.append(node('div','mv-r5-pending','CHƯA TRIỂN KHAI MÔ PHỎNG'),node('h3','',curatedFamilyTitle(family)),node('p','','Mô hình đã được rà soát và xếp vào đúng chương trình. Chưa có công cụ kéo thả chuyên biệt được kiểm chứng trong bản R5.'));
   const dl=node('dl');for(const [key,value] of [['Tương tác cần xây dựng',mode.student_interaction],['Điều kiện toán học cần kiểm tra',mode.math_rule_to_verify],['Nguồn SGK / chương',family.source_evidence||family.source_chapter]]){dl.append(node('dt','',key),node('dd','',value||'Chưa có'));}info.append(dl);this.stage.append(info);return;
  }
  this.currentCase=mode.id;
  this.triStageState=createStageInteractivity();
  const saved=this._loadCase(mode.id);this.params=saved||initialTriangleParams(mode.id);this.align=false;this.perturb=false;
  const summary=node('p','mv-r5-statement',TRIANGLE_CASES[mode.id].statement);this.stage.append(summary);
  const viewport=node('div','mv-r5-viewbox');const svg=svgNode('svg',{viewBox:'0 0 980 450',preserveAspectRatio:'xMidYMid meet','role':'img','aria-label':'Hai tam giác tương tác với tay nắm B và C'});svg.style.touchAction='none';viewport.append(svg);this.svg=svg;this.triViewport=viewport;this.stage.append(viewport);
  const status=node('p','mv-r5-triangle-status');status.setAttribute('aria-live','polite');this.stage.append(status);this.triangleStatus=status;
  const values=node('div','mv-r5-values');this.values=values;this.stage.append(values);
  const toolbar=node('div','mv-r5-stage-actions');const alignBtn=button('⧉ Chồng hình / vị tự',()=>{this._setTriPlaying(false);this.align=!this.align;this._drawTriangle();},'mv-r5-action');const perturbBtn=button('⚠ Thử vi phạm điều kiện',()=>{this._setTriPlaying(false);this.perturb=!this.perturb;this._drawTriangle();},'mv-r5-action');const resetBtn=button('↺ Đặt lại',()=>{this._setTriPlaying(false);this.params=initialTriangleParams(this.currentCase);this.perturb=false;this.align=false;this.triMotion=0;resetStageInteractivity(this.triStageState,this.triViewport);this._saveCase();this._syncInputs();this._drawTriangle();},'mv-r5-action');toolbar.append(alignBtn,perturbBtn,resetBtn);
  if(mode.id.startsWith('7-04-')||mode.id.startsWith('8-06-')){
   const play=button('▶ Chồng hình động',()=>this._setTriPlaying(!this.triPlaying),'mv-r5-action');
   this.triPlayBtn=play;
   const stepBack=button('⏮ Bước trước',()=>{this._setTriPlaying(false);this.align=false;this.triMotion=Math.max(0,(this.triMotion||0)-0.25);this._drawTriangle();},'mv-r5-action');
   const stepNext=button('⏭ Tiếp bước',()=>{this._setTriPlaying(false);this.align=false;this.triMotion=Math.min(1,(this.triMotion||0)+0.25);this._drawTriangle();},'mv-r5-action');
   toolbar.append(play,stepBack,stepNext);
   for(const [lbl,mVal] of [['0%',0],['50%',0.5],['100%',1]]){
    toolbar.append(button(lbl,()=>{this._setTriPlaying(false);this.align=false;this.triMotion=mVal;this._drawTriangle();},'mv-r5-action'));
   }
   const autoBtn=button(isAutoPlayEnabled(this)?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt',()=>{const next=setAutoPlayEnabled(this,!isAutoPlayEnabled(this));autoBtn.textContent=next?'⚡ Tự phát: Bật':'⚡ Tự phát: Tắt';},'mv-r5-action');
   toolbar.append(autoBtn);
  }
  this.stage.append(toolbar);
  const paramGrid=node('div','mv-r5-params');this.inputs=new Map();for(const cfg of triangleParamSchema(mode.id)){
   const wrap=node('label','mv-r5-param');const caption=node('span','mv-r5-param-label',cfg.label);const val=node('output','',fmt(this.params[cfg.key]));const slider=node('input');slider.type='range';slider.min=cfg.min;slider.max=cfg.max;slider.step=cfg.step;slider.value=this.params[cfg.key];slider.addEventListener('input',()=>{this._setTriPlaying(false);this.params[cfg.key]=Number(slider.value);val.textContent=fmt(slider.value);this._saveCase();this._drawTriangle();});wrap.append(caption,val,slider);paramGrid.append(wrap);this.inputs.set(cfg.key,{slider,val});}
  this.stage.append(paramGrid);
  const latext=node('div','mv-r5-latex');mountRenderedFormula(latext,TRIANGLE_CASES[mode.id].latex);const copy=button('📋 Sao chép LaTeX',async()=>{try{await navigator.clipboard.writeText(TRIANGLE_CASES[mode.id].latex);copy.textContent='✓ Đã sao chép';}catch{copy.textContent='Không sao chép được; cô có thể bôi đen mã dưới đây.';}},'mv-r5-copy');this.stage.append(copy,latext);
  const hint=node('p','mv-r5-hint','Kéo điểm B hoặc C của tam giác gốc △ABC, hoặc điều chỉnh các thanh trượt. Các cặp cạnh/góc thuộc giả thiết được tô cùng màu ngữ nghĩa R86 (#1D4ED8, #B45309, #15803D, #6D28D9). Nút “Thử vi phạm” cố ý làm lệch dữ kiện để kiểm chứng phản ví dụ (#B91C1C).');this.stage.append(hint);
  bindFrameWheelZoom(viewport,this.triStageState,(el,type,fn)=>el.addEventListener(type,fn));
  svg.addEventListener('pointerdown',e=>{
   this._setTriPlaying(false);
   let v=e.target?.dataset?.vertex;
   if(!v){
    if(tryStartLabelOrPointDrag(e,viewport,this.triStageState)){this.drag='__stage_free__';return;}
    const verts=[...svg.querySelectorAll('[data-vertex]')].filter(el=>el.dataset.vertex!=='A');
    let best=null,bestD=120;
    for(const el of verts){const r=el.getBoundingClientRect(),d=Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2));if(d<bestD){bestD=d;best=el.dataset.vertex;}}
    v=best||'C';
   }
   this.drag=v;try{svg.setPointerCapture(e.pointerId);}catch{}e.preventDefault();
  });
  svg.addEventListener('pointermove',e=>{
   if(!this.drag)return;
   if(this.drag==='__stage_free__'){handleLabelOrPointMove(e,viewport,this.triStageState);return;}
   const rect=svg.getBoundingClientRect();if(!rect.width||!rect.height)return;const pt=[(e.clientX-rect.left)*980/rect.width,(e.clientY-rect.top)*450/rect.height];const world=[(pt[0]-this.drawMap.x)/this.drawMap.s,(this.drawMap.y-pt[1])/this.drawMap.s];this.params=dragTrianglePoint(this.currentCase,this.params,this.drag,world);this._saveCase();this._syncInputs();this._drawTriangle();
  });
  const up=()=>{stopLabelOrPointDrag(this.triStageState);this.drag=null;};svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',up);svg.addEventListener('lostpointercapture',up);
  this.triMotion=0;this._drawTriangle();
  attachDiscovery();
  if(mode.id.startsWith('7-04-')||mode.id.startsWith('8-06-'))scheduleLabAutoplay(this,{delay:90,reset:false,start:()=>this._setTriPlaying(true)});
 }
 _loadCase(id){try{const obj=JSON.parse(localStorage.getItem(`mathverse:r5:tri:${id}`)||'null');if(!obj||typeof obj!=='object')return null;const defaults=initialTriangleParams(id);for(const f of triangleParamSchema(id)){if(!Number.isFinite(obj[f.key])||obj[f.key]<f.min||obj[f.key]>f.max)return null;}return {...defaults,...obj};}catch{return null;}}
 _saveCase(){try{localStorage.setItem(`mathverse:r5:tri:${this.currentCase}`,JSON.stringify(this.params));}catch{}}
 _syncInputs(){for(const [key,obj] of this.inputs){obj.slider.value=this.params[key];obj.val.textContent=fmt(this.params[key]);}}
 _drawTriangle(){
  this.svg.replaceChildren();let pair;
  try{pair=makeTrianglePair(this.currentCase,this.params,{perturb:this.perturb});}
  catch(e){this.triangleStatus.textContent=`⚠ ${e.message} Hãy sửa thanh tham số.`;this.triangleStatus.className='mv-r5-triangle-status invalid';this.values.replaceChildren();return;}
  const {first,second,check,k}=pair;const m=check.first,mm=check.second;
  const isSimilar=Boolean(TRIANGLE_CASES[this.currentCase]?.similar);
  const maxdim=Math.max(m.AB,m.AC,m.BC,mm.AB,mm.AC,mm.BC,6);
  const scale=Math.min(68,260/maxdim,225/Math.max(first.C[1],second.C[1],2));
  const anchors={left:[98,354],right:[584,354]};this.drawMap={x:anchors.left[0],y:anchors.left[1],s:scale};
  const CASE_SPECS={
   '7-04-C01':{sides:['AB','AC','BC'],angles:[],badge:'Giả thiết (c.c.c): Chỉ đánh dấu 3 cặp cạnh bằng nhau AB = A′B′ (#1D4ED8), AC = A′C′ (#B45309), BC = B′C′ (#15803D)'},
   '7-04-C02':{sides:['AB','AC'],angles:['A'],badge:'Giả thiết (c.g.c): Đánh dấu 2 cặp cạnh AB = A′B′ (#1D4ED8), AC = A′C′ (#15803D) và góc xen giữa ∠A = ∠A′ (#B45309)'},
   '7-04-C03':{sides:['AB'],angles:['A','B'],badge:'Giả thiết (g.c.g): Đánh dấu cạnh AB = A′B′ (#1D4ED8) và 2 góc kề cạnh đó ∠A = ∠A′ (#B45309), ∠B = ∠B′ (#15803D)'},
   '7-04-C04':{sides:['AB','AC'],angles:['A_right'],badge:'Tam giác vuông (2 cạnh góc vuông): Đánh dấu ∠A = ∠A′ = 90° (#6D28D9) và AB = A′B′ (#1D4ED8), AC = A′C′ (#B45309)'},
   '7-04-C05':{sides:['AB'],angles:['A_right','B'],badge:'Tam giác vuông (cạnh góc vuông – góc nhọn): Đánh dấu ∠A = ∠A′ = 90° (#6D28D9), AB = A′B′ (#1D4ED8) và ∠B = ∠B′ (#B45309)'},
   '7-04-C06':{sides:['BC'],angles:['A_right','B'],badge:'Tam giác vuông (cạnh huyền – góc nhọn): Đánh dấu ∠A = ∠A′ = 90° (#6D28D9), cạnh huyền BC = B′C′ (#1D4ED8) và ∠B = ∠B′ (#B45309)'},
   '7-04-C07':{sides:['AB','BC'],angles:['A_right'],badge:'Tam giác vuông (cạnh huyền – cạnh góc vuông): Đánh dấu ∠A = ∠A′ = 90° (#6D28D9), BC = B′C′ (#1D4ED8) và AB = A′B′ (#B45309)'},
   '8-06-C01':{sides:['AB','AC','BC'],angles:[],badge:'Đồng dạng (c.c.c): 3 cặp cạnh tương ứng tỉ lệ A′B′/AB = A′C′/AC = B′C′/BC = k (thu phóng vị tự 1/k → chồng khít)'},
   '8-06-C02':{sides:['AB','AC'],angles:['A'],badge:'Đồng dạng (c.g.c): 2 cặp cạnh tỉ lệ A′B′/AB = A′C′/AC = k và góc xen giữa ∠A = ∠A′ (#B45309)'},
   '8-06-C03':{sides:[],angles:['A','B'],badge:'Đồng dạng (g.g): 2 cặp góc tương ứng bằng nhau ∠A = ∠A′ (#B45309) và ∠B = ∠B′ (#15803D)'},
   '8-06-C04':{sides:[],angles:['A_right','B'],badge:'Tam giác vuông đồng dạng (góc nhọn): ∠A = ∠A′ = 90° (#6D28D9) và cặp góc nhọn ∠B = ∠B′ (#B45309)'},
   '8-06-C05':{sides:['AB','AC'],angles:['A_right'],badge:'Tam giác vuông đồng dạng (2 cạnh góc vuông): ∠A = ∠A′ = 90° (#6D28D9) và A′B′/AB = A′C′/AC = k'},
   '8-06-C06':{sides:['AB','BC'],angles:['A_right'],badge:'Tam giác vuông đồng dạng (cạnh huyền – cạnh góc vuông): ∠A = ∠A′ = 90° (#6D28D9) và B′C′/BC = A′B′/AB = k'}
  };
  const spec=CASE_SPECS[this.currentCase]||{sides:['AB','AC','BC'],angles:['A','B','C'],badge:''};
  const activeSides=new Set(spec.sides);
  const activeAngles=new Set(spec.angles);
  const SIDE_PAIR_COLORS={
   AB:'#1D4ED8',
   AC:this.currentCase==='7-04-C02'||this.currentCase==='8-06-C02'?'#15803D':'#B45309',
   BC:this.currentCase==='7-04-C06'||this.currentCase==='7-04-C07'||this.currentCase==='8-06-C06'?'#1D4ED8':'#15803D'
  };
  this.svg.append(svgNode('rect',{x:12,y:12,width:470,height:412,rx:18,fill:'#F8FAFC',stroke:'#CBD5E1','stroke-width':1.2}),svgNode('rect',{x:498,y:12,width:470,height:412,rx:18,fill:'#F8FAFC',stroke:'#CBD5E1','stroke-width':1.2}));
  if(spec.badge){
   this.svg.append(svgNode('rect',{x:24,y:18,width:932,height:30,rx:8,fill:'#DBEAFE',stroke:'#1D4ED8','stroke-width':1.2}));
   const bTxt=svgNode('text',{x:490,y:38,'font-size':13,'font-weight':'800',fill:'#1D4ED8','text-anchor':'middle'});
   bTxt.textContent=spec.badge;this.svg.append(bTxt);
  }
  const note=(x,text,col='#1E293B')=>{const el=svgNode('text',{x,y:72,'font-size':17,fill:col,'font-weight':'800'});el.textContent=text;this.svg.append(el);};
  note(38,'△ ABC · tam giác gốc (#1D4ED8)','#1D4ED8');
  note(526,`△ A′B′C′ · ${isSimilar?'tỉ số đồng dạng k = '+fmt(k):'tam giác đối chiếu'}`,'#B45309');
  const motion=this.align?1:Math.min(1,Math.max(0,this.triMotion||0));
  const draw=(coords,anchor,col,labelSuffix,highlight,meas,scaleFactor=1)=>{
   const P=Object.fromEntries(Object.entries(coords).map(([name,p])=>[name,[anchor[0]+p[0]*scale*scaleFactor,anchor[1]-p[1]*scale*scaleFactor]]));
   const drawVertexArc=(vName,p1Name,p2Name,degVal,arcCount,arcCol)=>{
    if(!activeAngles.has(vName))return;
    const V=P[vName],P1=P[p1Name],P2=P[p2Name];
    const a1=Math.atan2(P1[1]-V[1],P1[0]-V[0]),a2=Math.atan2(P2[1]-V[1],P2[0]-V[0]);
    let d=a2-a1;while(d<=-Math.PI)d+=Math.PI*2;while(d>Math.PI)d-=Math.PI*2;
    const sA=d>=0?a1:a2,eA=d>=0?a2:a1,span=Math.abs(d),rBase=28;
    const sx0=V[0]+rBase*Math.cos(sA),sy0=V[1]+rBase*Math.sin(sA),ex0=V[0]+rBase*Math.cos(eA),ey0=V[1]+rBase*Math.sin(eA);
    this.svg.append(svgNode('path',{d:`M ${V[0].toFixed(1)} ${V[1].toFixed(1)} L ${sx0.toFixed(1)} ${sy0.toFixed(1)} A ${rBase} ${rBase} 0 ${span>Math.PI?1:0} 1 ${ex0.toFixed(1)} ${ey0.toFixed(1)} Z`,fill:arcCol,'fill-opacity':0.22,stroke:'none'}));
    for(let kIdx=0;kIdx<arcCount;kIdx++){
     const rk=rBase-kIdx*4.5,sx=V[0]+rk*Math.cos(sA),sy=V[1]+rk*Math.sin(sA),ex=V[0]+rk*Math.cos(eA),ey=V[1]+rk*Math.sin(eA);
     this.svg.append(svgNode('path',{d:`M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${rk} ${rk} 0 ${span>Math.PI?1:0} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`,fill:'none',stroke:arcCol,'stroke-width':2.5}));
    }
    if(!highlight){
     const mid=sA+span/2,tx=V[0]+(rBase+16)*Math.cos(mid)-12,ty=V[1]+(rBase+16)*Math.sin(mid)+4;
     const tNode=svgNode('text',{x:tx.toFixed(1),y:ty.toFixed(1),'font-size':12.5,'font-weight':800,fill:arcCol});
     tNode.textContent=`${Math.round(degVal)}°`;this.svg.append(tNode);
    }
   };
   const polyFill=!check.passes&&col!=='blue'?'rgba(254,226,226,0.65)':highlight?'rgba(237,233,254,0.72)':col==='blue'?'rgba(219,234,254,0.52)':'rgba(254,243,199,0.52)';
   const polygon=svgNode('polygon',{points:['A','B','C'].map(k=>P[k].join(',')).join(' '),fill:polyFill,stroke:'none'});this.svg.append(polygon);
   if(meas){
    drawVertexArc('A','B','C',meas.A,1,'#B45309');
    drawVertexArc('B','C','A',meas.B,2,this.currentCase==='7-04-C05'||this.currentCase==='7-04-C06'||this.currentCase==='8-06-C04'?'#B45309':'#15803D');
    drawVertexArc('C','A','B',meas.C,3,'#6D28D9');
   }
   if(activeAngles.has('A_right')){
    const rightAngle=Math.abs((meas?.A??check.first.A)-90)<1e-4;
    if(rightAngle){const a=P.A;const s=15;this.svg.append(svgNode('path',{d:`M${a[0]+s},${a[1]} L${a[0]+s},${a[1]-s} L${a[0]},${a[1]-s}`,fill:'rgba(109,40,217,0.18)',stroke:'#6D28D9','stroke-width':2.6}));}
   }
   const sides=[['A','B',1,'AB'],['A','C',2,'AC'],['B','C',3,'BC']];
   for(const [a,b,ticks,sKey] of sides){
    const isHyp=activeSides.has(sKey);
    const pairCol=!check.passes&&col!=='blue'?'#B91C1C':highlight?'#6D28D9':(SIDE_PAIR_COLORS[sKey]||'#1D4ED8');
    this.svg.append(svgNode('line',{
     x1:P[a][0],y1:P[a][1],x2:P[b][0],y2:P[b][1],
     stroke:isHyp?pairCol:'#475569',
     'stroke-width':isHyp?(highlight?5.5:4.5):2.2,
     'stroke-dasharray':isHyp?'':'6 4',
     'stroke-linecap':'round'
    }));
    if(isHyp&&!highlight){
     const x=(P[a][0]+P[b][0])/2,y=(P[a][1]+P[b][1])/2;
     const dx=P[b][0]-P[a][0],dy=P[b][1]-P[a][1],len=Math.hypot(dx,dy)||1,tx=dx/len,ty=dy/len,nx=-ty,ny=tx;
     if(check.passes){
      for(let ti=0;ti<ticks;ti++){
       const off=(ti-(ticks-1)/2)*5.5,cx=x+tx*off,cy=y+ty*off;
       this.svg.append(svgNode('line',{x1:(cx-nx*6.5).toFixed(1),y1:(cy-ny*6.5).toFixed(1),x2:(cx+nx*6.5).toFixed(1),y2:(cy+ny*6.5).toFixed(1),stroke:pairCol,'stroke-width':2.4}));
      }
     }
     const offX=sKey==='AB'?0:sKey==='AC'?-28:12;
     const offY=sKey==='AB'?19:-8;
     const text=svgNode('text',{x:x+offX,y:y+offY,'font-size':14,'font-weight':800,fill:pairCol,'text-anchor':'middle'});
     text.textContent=fmt(Math.hypot(coords[a][0]-coords[b][0],coords[a][1]-coords[b][1]));
     this.svg.append(text);
    }
   }
   for(const name of ['A','B','C']){
    const [x,y]=P[name];const circle=svgNode('circle',{cx:x,cy:y,r:highlight?6:8,fill:!check.passes&&col!=='blue'?'#B91C1C':highlight?'#6D28D9':col==='blue'?'#1D4ED8':'#B45309',stroke:'white','stroke-width':2});if(col==='blue'&&!highlight){circle.dataset.vertex=name;if(name!=='A'){circle.style.cursor='grab';circle.setAttribute('tabindex','0');circle.setAttribute('aria-label',`Kéo điểm ${name}`);}}this.svg.append(circle);
    const vy=name==='C'?y-12:y+24;
    const text=svgNode('text',{x:x-7,y:vy,'font-size':17,'font-weight':800,fill:!check.passes&&col!=='blue'?'#B91C1C':highlight?'#6D28D9':col==='blue'?'#1D4ED8':'#B45309'});text.textContent=name+labelSuffix;this.svg.append(text);
   }
   return P;
  };
  const P1=draw(first,anchors.left,'blue','',false,m,1);
  // In similar triangles (8-06), scale second triangle from 1 to 1/k as motion goes 0 -> 1 so at 100% it overlays first triangle!
  const targetRatio=isSimilar&&check.passes&&k>0?(1/k):1;
  const curScaleFactor=1+(targetRatio-1)*motion;
  const P2=draw(second,[anchors.right[0]+(anchors.left[0]-anchors.right[0])*motion,anchors.right[1]],'orange','′',motion>.88&&check.passes,mm,curScaleFactor);
  if(motion>0.02&&motion<0.95){
   for(const vName of ['A','B','C']){
    this.svg.append(svgNode('line',{x1:P2[vName][0],y1:P2[vName][1],x2:P1[vName][0],y2:P1[vName][1],stroke:'#475569','stroke-width':1.5,'stroke-dasharray':'5 4'}));
   }
  }
  const corrNote=svgNode('text',{x:32,y:410,'font-size':13,'font-weight':800,fill:check.passes?(motion>.88?'#6D28D9':'#15803D'):'#B91C1C'});
  corrNote.textContent=check.passes?(isSimilar?`Kết luận: Từ giả thiết đã đánh dấu ⇒ △ABC ∽ △A′B′C′ (tỉ số đồng dạng k = ${fmt(check.ratio)}, thu phóng 1/k chồng khít)`:`Kết luận: Từ giả thiết đã đánh dấu ⇒ △ABC = △A′B′C′ (hai tam giác chồng khít hoàn toàn #6D28D9)`):'Phản ví dụ (#B91C1C): Khi làm lệch một dữ kiện giả thiết, hai tam giác không còn chồng khít / đồng dạng.';
  this.svg.append(corrNote);
  this.triangleStatus.className='mv-r5-triangle-status '+(check.passes?'valid':'invalid');this.triangleStatus.textContent=check.passes?(isSimilar?'✓ Hai tam giác đồng dạng theo điều kiện đang xét':'✓ Hai tam giác bằng nhau theo điều kiện đang xét'):'✕ Điều kiện không còn đúng; không thể kết luận bằng nhau/đồng dạng.';
  this.values.replaceChildren();for(const [label,value] of [['AB',fmt(m.AB)],['AC',fmt(m.AC)],['BC',fmt(m.BC)],['Góc A',fmt(m.A)+'°'],['Góc B',fmt(m.B)+'°'],['Góc C',fmt(m.C)+'°'],['Tỉ số cạnh B′/B',fmt(check.ratio)],['Tỉ số diện tích',fmt(check.areaRatio)]]){const cell=node('div','mv-r5-value');cell.append(node('small','',label),node('strong','',value));this.values.append(cell);}
  decorateInteractiveSVG(this.triViewport,this.triStageState);
 }
}
