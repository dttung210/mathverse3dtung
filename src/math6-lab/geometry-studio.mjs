import {newBoard,newItem,getItem,coords,bboxLine,hitHandle,hitGeometry,updateHandle,translate,canAttach,addFrame,interpolateBoard,validateBoard,exportBoard,LABELS,DERIVED_KINDS,POLYGON_KINDS} from './geometry-core.mjs?v=r107_v15';
const W=920,H=560,S=46;
const toPixel=([x,y])=>[W/2+x*S,H/2-y*S];
const toWorld=([x,y])=>[(x-W/2)/S,(H/2-y)/S];
const unique=list=>[...new Set(list)];
const cpy=x=>structuredClone(x);
const K='math6-lab:studio:grade6';
function download(name,text,type='application/json'){const a=document.createElement('a');const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function btn(t,fun,klass=''){const b=document.createElement('button');b.type='button';b.textContent=t;b.className=klass;b.addEventListener('click',fun);return b;}
export class GeometryStudio{
 constructor(canvas,toolbar,inspector,motion,onNotice=()=>{},options={}){
  this.storageKey=options.storageKey||K;this.statusElement=options.statusElement||null;
  this.canvas=canvas;this.ctx=canvas.getContext('2d');this.toolbar=toolbar;this.inspector=inspector;this.motion=motion;this.onNotice=onNotice;
  this.board=this._load();this.active=false;this.selectedId=null;this.drag=null;this.playing=false;this.previewBefore=null;this.position=0;this.speed=1;this.raf=0;this.lastTick=0;this.history=[exportBoard(this.board)];this.cursor=0;this._initToolbar();this._initMotion();this._events();this.draw();this.inspectorRender();
 }
 _load(){try{const raw=localStorage.getItem(this.storageKey);if(raw)return validateBoard(JSON.parse(raw));}catch(e){console.warn('Cannot open math geometry board',e);}const board=newBoard();
  const square=newItem('square',-2,0,{a:3,name:'Hình vuông ABCD'});
  const segment=newItem('segment',3.3,-.7,{ax:-1.5,ay:0,bx:1.5,by:0,name:'Đoạn thẳng EF'});
  const mid=newItem('midpoint',0,0,{parentId:segment.id,name:'Trung điểm M'});
  board.items.push(square,segment,mid);return board;
 }
 _save(){try{localStorage.setItem(this.storageKey,exportBoard(this.board));return true;}catch(e){this.onNotice('Không thể tự lưu. Hãy xuất JSON để sao lưu.');return false;}}
 _snapshot(){const value=exportBoard(this.board);if(this.history[this.cursor]!==value){this.history=this.history.slice(0,this.cursor+1);this.history.push(value);if(this.history.length>55)this.history.shift();this.cursor=this.history.length-1;}this._save();this.inspectorRender();this._motionRefresh();this.draw();this._updateStatus();}
 undo(){this._stopPreview();if(this.cursor>0){this.cursor--;this.board=validateBoard(JSON.parse(this.history[this.cursor]));this.selectedId=null;this._save();this.draw();this.inspectorRender();this._motionRefresh();}}
 redo(){this._stopPreview();if(this.cursor<this.history.length-1){this.cursor++;this.board=validateBoard(JSON.parse(this.history[this.cursor]));this.selectedId=null;this._save();this.draw();this.inspectorRender();this._motionRefresh();}}
 _initToolbar(){this.toolbar.replaceChildren();const title=document.createElement('span');title.className='shape-tool-label';title.textContent='HÌNH DỰNG SẴN';this.toolbar.append(title);
  for(const kind of ['point','segment','line','ray','angle','circle','triangle','square','hexagon','rectangle','rhombus','parallelogram','trapezoid']){
   const b=btn('＋ '+LABELS[kind],()=>this.add(kind), 'tool-chip');b.draggable=true;b.dataset.kind=kind;
   b.addEventListener('dragstart',e=>{e.dataTransfer.setData('application/x-math6-geometry',kind);e.dataTransfer.effectAllowed='copy';});this.toolbar.append(b);
  }
  this.toolbar.append(btn('↶',()=>this.undo(),'tool-chip little'),btn('↷',()=>this.redo(),'tool-chip little'));
 }
 _initMotion(){const m=this.motion;m.replaceChildren();const top=document.createElement('div');top.className='motion-first';
  const t=document.createElement('strong');t.textContent='🎞 Phòng thí nghiệm chuyển động · Đặt hình → Ghi mốc → Kéo hình → Ghi mốc → Phát';top.append(t);
  this.record=btn('● Ghi mốc',()=>{this._stopPreview();const last=this.board.keyframes.at(-1)?.t;const when=last===undefined?0:Math.min(120,last+2);const frame=addFrame(this.board,when);this.position=frame.t;this._snapshot();this.onNotice(frame.limitReached?`Đã đạt giới hạn 60 mốc hoạt cảnh: mốc ${frame.t}s đã thay thế mốc cũ nhất.`:`Đã ghi mốc ${frame.t}s. Kéo hình rồi ghi mốc tiếp theo.`);});
  this.playBtn=btn('▶ Phát',()=>this.togglePlay());this.resetBtn=btn('↺ Trở về hình gốc',()=>this._stopPreview());this.delBtn=btn('✕ Xóa mốc cuối',()=>{this._stopPreview();this.board.keyframes.pop();this._snapshot();});
  this.speedSelect=document.createElement('select');this.speedSelect.setAttribute('aria-label','Tốc độ phát');for(const v of [.25,.5,1,1.5,2,3]){const o=document.createElement('option');o.value=v;o.textContent=v+'×';this.speedSelect.append(o);}this.speedSelect.value=String(this.board.speed||1);this.speedSelect.addEventListener('change',()=>{this.board.speed=Number(this.speedSelect.value);this._snapshot();});
  const actions=document.createElement('div');actions.className='motion-actions';actions.append(this.record,this.playBtn,this.resetBtn,this.delBtn,this.speedSelect);
  const trail=document.createElement('div');trail.className='timeline-track';this.slider=document.createElement('input');this.slider.type='range';this.slider.step='.01';this.slider.min='0';this.slider.max='2';this.slider.value='0';this.slider.setAttribute('aria-label','Vị trí thời gian');this.slider.addEventListener('input',()=>this.seek(Number(this.slider.value)));
  this.timeLabel=document.createElement('span');this.timeLabel.className='time-value';trail.append(this.slider,this.timeLabel);
  this.frameLabels=document.createElement('div');this.frameLabels.className='frame-labels';m.append(top,actions,trail,this.frameLabels);this._motionRefresh();
 }
 _motionRefresh(){if(!this.slider)return;const frames=this.board.keyframes,dur=Math.max(2,frames.at(-1)?.t||2);this.slider.max=dur;this.slider.value=String(Math.min(this.position,dur));this.timeLabel.textContent=`${this.position.toFixed(1)} / ${dur.toFixed(1)} s · ${frames.length} mốc`;
  this.frameLabels.replaceChildren();for(const f of frames)this.frameLabels.append(btn('◆ '+f.t+'s',()=>this.seek(f.t),'timeline-marker'));
  this.playBtn.textContent=this.playing?'Ⅱ Tạm dừng':'▶ Phát';
 }
 _stopPreview(){if(this.raf)cancelAnimationFrame(this.raf);this.playing=false;this.raf=0;this.lastTick=0;this.position=0;if(this.previewBefore){this.board.items=this.previewBefore;this.previewBefore=null;}this.draw();this._motionRefresh();this.inspectorRender();}
 pause(){if(!this.playing)return;this.playing=false;cancelAnimationFrame(this.raf);this.raf=0;this.lastTick=0;this._motionRefresh();}
 togglePlay(){if(this.playing){this.pause();return;}if(this.board.keyframes.length<2){this.onNotice('Hãy ghi ít nhất hai trạng thái khác nhau.');return;}
  if(!this.previewBefore)this.previewBefore=cpy(this.board.items);
  this.playing=true;this.lastTick=0;
  const loop=now=>{if(!this.playing||!this.active)return;const duration=this.board.keyframes.at(-1).t;if(this.lastTick){this.position+=(now-this.lastTick)/1000*this.board.speed;if(this.position>duration)this.position=0;}this.lastTick=now;interpolateBoard(this.board,this.board.keyframes,this.position);this.draw();this._motionRefresh();this.raf=requestAnimationFrame(loop);};
  this.raf=requestAnimationFrame(loop);this._motionRefresh();
 }
 seek(t){if(!this.board.keyframes.length)return;if(!this.previewBefore)this.previewBefore=cpy(this.board.items);this.pause();this.position=t;interpolateBoard(this.board,this.board.keyframes,t);this.draw();this._motionRefresh();this.inspectorRender();}
 activate(){this.active=true;this.draw();this.inspectorRender();this._updateStatus();}
 deactivate(){this._stopPreview();this.active=false;}
 add(kind,world=[0,0]){this._stopPreview();const item=newItem(kind,...world);this.board.items.push(item);this.selectedId=item.id;this._snapshot();}
 addCatalogModel(model){this._stopPreview();const isPoly=model.engine==='polygon',isGeom=model.engine==='geometry';let made=[];
  if(isPoly)made.push(newItem(model.variant,0,0,{...model.defaults,name:'SGK · '+model.title}));
  else if(isGeom){if(['angle','angletypes','clock'].includes(model.variant))made.push(newItem('angle',0,0,{theta:model.defaults.angle||60,name:'SGK · '+model.title}));
   else if(['midpoint','ruler'].includes(model.variant)){const seg=newItem('segment',0,0,{ax:-2.5,ay:0,bx:2.5,by:0,name:'SGK · '+model.title});made.push(seg);if(model.variant==='midpoint')made.push(newItem('midpoint',0,0,{parentId:seg.id}));}
   else if(model.variant==='rays'){made.push(newItem('ray',0,0),newItem('ray',0,0,{bx:-2,by:0}));}
   else if(model.variant==='pairlines'){made.push(newItem('line',0,1),newItem('line',0,-1));}
   else made.push(newItem('point',0,0,{name:'SGK · '+model.title}),newItem('line',0,-1));
  }else if(model.engine==='symmetry'){
   const p=newItem('point',-2,1,{name:'Điểm A'});made.push(p,newItem(model.variant==='center'||model.variant==='rosette'?'reflectionCenter':'reflectionAxis',0,0,{parentId:p.id}));
  }
  if(!made.length){this.onNotice('Mô hình này có thí nghiệm chuyên dụng ở tab SGK; kho dựng hình tự do dành cho hình 2D.');return false;}
  this.board.items.push(...made);this.selectedId=made.at(-1).id;this._snapshot();return true;
 }
 addDependency(kind){this._stopPreview();const source=getItem(this.board,this.selectedId);
  if(!source||!canAttach(kind,source)){this.onNotice(kind==='midpoint'?'Chọn một đoạn thẳng trước.':'Chọn điểm hoặc một hình 2D trước.');return;}
  const newObj=newItem(kind,0,0,{parentId:source.id});this.board.items.push(newObj);this.selectedId=newObj.id;this._snapshot();
 }
 remove(){this._stopPreview();if(!this.selectedId)return;const targets=new Set([this.selectedId]);let n=-1;while(n!==targets.size){n=targets.size;for(const i of this.board.items)if(targets.has(i.parentId))targets.add(i.id);}
  this.board.items=this.board.items.filter(i=>!targets.has(i.id));for(const f of this.board.keyframes)f.items=f.items.filter(i=>!targets.has(i.id));this.selectedId=null;this._snapshot();
 }
 duplicate(){this._stopPreview();const a=getItem(this.board,this.selectedId);if(!a||DERIVED_KINDS.includes(a.kind))return;
  const options=cpy(a);delete options.id;options.name=a.name+' (bản sao)';const fresh=newItem(a.kind,a.x+0.8,a.y+0.5,options);fresh.x=a.x+0.8;fresh.y=a.y+0.5;this.board.items.push(fresh);this.selectedId=fresh.id;this._snapshot();
 }
 exportJSON(){download('TOAN6_BANG_DUNG_HINH_DYNAMIC.json',exportBoard(this.board));}
 async importJSON(file){if(!file||file.size>200000)return this.onNotice('Tệp không hợp lệ hoặc quá 200 KB.');try{this._stopPreview();const board=validateBoard(JSON.parse(await file.text()));this.board=board;this.history=[exportBoard(board)];this.cursor=0;this.selectedId=null;this._save();this.draw();this.inspectorRender();this._motionRefresh();this._updateStatus();this.onNotice('Đã nhập bảng hình Toán 6 thành công.');}catch(e){this.onNotice('Không thể nhập dữ liệu: '+e.message);}}
 exportPNG(){this.canvas.toBlob(blob=>{if(blob)download('TOAN6_BANG_DUNG_HINH.png',blob,'image/png');});}
 _updateStatus(){const el=this.statusElement;if(el&&this.active)el.textContent=`${this.board.items.length} đối tượng • ${this.board.keyframes.length} mốc chuyển động. Dữ liệu xưởng lưu riêng với 60 mô hình SGK.`;}
 _events(){this.canvas.addEventListener('pointerdown',e=>{if(!this.active)return;this._stopPreview();const p=this._point(e),world=toWorld(p);let best=null;
  for(const item of [...this.board.items].reverse()){if(item.visible===false)continue;const g=coords(item,this.board);const h=hitHandle(item,g,world,.3);if(h>=0){best={item,handle:h};break;}if(hitGeometry(item,g,world,.3)){best={item,handle:-1};break;}}
  if(best){this.selectedId=best.item.id;if(!best.item.locked){this.drag={id:best.item.id,handle:best.handle,last:world,modified:false};this.canvas.setPointerCapture(e.pointerId);}}else this.selectedId=null;
  this.inspectorRender();this.draw();
 });
  this.canvas.addEventListener('pointermove',e=>{if(!this.active||!this.drag)return;const p=toWorld(this._point(e)),item=getItem(this.board,this.drag.id);if(!item)return;
   if(this.drag.handle>=0){if(updateHandle(item,this.drag.handle,p))this.drag.modified=true;}
   else{if(translate(item,p[0]-this.drag.last[0],p[1]-this.drag.last[1]))this.drag.modified=true;this.drag.last=p;}
   this.draw();this._updateMetrics();
  });
  const end=()=>{if(this.drag?.modified)this._snapshot();this.drag=null;};this.canvas.addEventListener('pointerup',end);this.canvas.addEventListener('pointercancel',end);
  this.canvas.addEventListener('dragover',e=>{if(this.active){e.preventDefault();e.dataTransfer.dropEffect='copy';}});
  this.canvas.addEventListener('drop',e=>{if(!this.active)return;e.preventDefault();const kind=e.dataTransfer.getData('application/x-math6-geometry');if(!LABELS[kind]||DERIVED_KINDS.includes(kind))return;this.add(kind,toWorld(this._point(e)));});
 }
 _point(e){const rect=this.canvas.getBoundingClientRect();const k=Math.min(rect.width/W,rect.height/H),padX=(rect.width-W*k)/2,padY=(rect.height-H*k)/2;
  return [(e.clientX-rect.left-padX)/k,(e.clientY-rect.top-padY)/k];}
 _paintLine(c,a,b,color='#56d9d0',width=3,dashes=[]){const p=toPixel(a),q=toPixel(b);c.beginPath();c.moveTo(...p);c.lineTo(...q);c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dashes);c.stroke();c.setLineDash([]);}
 draw(){const c=this.ctx;if(!c)return;c.clearRect(0,0,W,H);c.fillStyle='#f7fafc';c.fillRect(0,0,W,H);
  c.strokeStyle='#e1eaf0';c.lineWidth=1;for(let x=0;x<=W;x+=S){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}for(let y=0;y<=H;y+=S){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
  this._paintLine(c,[-10,0],[10,0],'#b0c3cf',1);this._paintLine(c,[0,-7],[0,7],'#b0c3cf',1);
  for(const item of this.board.items){if(item.visible===false)continue;const geo=coords(item,this.board);if(!geo)continue;const color=this.selectedId===item.id?'#df831c':item.color||'#16a2a7';c.lineWidth=2.5;c.fillStyle='#20aaa820';c.strokeStyle=color;
   if(geo.kind==='circle'){const at=toPixel(geo.center);c.beginPath();c.arc(...at,geo.r*S,0,Math.PI*2);c.fill();c.stroke();}
   else if(geo.kind==='point'){const at=toPixel(geo.vertices[0]);c.beginPath();c.arc(...at,5.5,0,Math.PI*2);c.fillStyle=color;c.fill();}
   else if(geo.vertices?.length){const vv=geo.vertices;
    if(['line','ray'].includes(geo.kind)){const segment=bboxLine(vv[0],vv[1],[-W/(2*S),W/(2*S),-H/(2*S),H/(2*S)],geo.kind);if(segment)this._paintLine(c,...segment,color,2.6);}
    else if(geo.kind==='angle'){this._paintLine(c,vv[0],vv[1],color,3);this._paintLine(c,vv[0],vv[2],color,3);const origin=toPixel(vv[0]);c.beginPath();c.arc(...origin,44,-item.theta*Math.PI/180,0);c.stroke();}
    else{c.beginPath();vv.forEach((p,i)=>{const pt=toPixel(p);if(i)c.lineTo(...pt);else c.moveTo(...pt);});if(POLYGON_KINDS.includes(item.kind)||item.kind.startsWith('reflection')){if(vv.length>2){c.closePath();c.fillStyle=item.kind.startsWith('reflection')?'#f1b35f2a':'#16a2a72d';c.fill();}}c.stroke();}
   }
   if(this.selectedId===item.id){for(const [i,p] of (geo.vertices||[]).entries()){const at=toPixel(p);c.beginPath();c.arc(...at,5,0,2*Math.PI);c.fillStyle='#ffb54b';c.fill();c.lineWidth=1;c.strokeStyle='#7c4900';c.stroke();}
    if(geo.kind==='circle'){const at=toPixel([geo.center[0]+geo.r,geo.center[1]]);c.beginPath();c.arc(...at,6,0,2*Math.PI);c.fillStyle='#ffb54b';c.fill();}
   }
   const top=geo.vertices?.[0]||geo.center;if(top){const pt=toPixel(top);c.font='bold 13px system-ui';c.fillStyle='#214f68';c.fillText(item.name.slice(0,22),pt[0]+12,pt[1]-15);}
  }
  c.fillStyle='#637b8a';c.font='14px system-ui';c.fillText('Kéo đỉnh màu cam hoặc kéo cả hình. Chọn một đối tượng để xem thuộc tính.',22,H-24);
 }
 _updateMetrics(){const item=getItem(this.board,this.selectedId);const g=coords(item,this.board);const box=this.inspector.querySelector('[data-geometry-metrics]');if(box&&g)box.textContent=this._measure(g,item);}
 _measure(g,item){if(g.area!==undefined)return `Chu vi ≈ ${g.perimeter.toFixed(2)} • Diện tích ≈ ${g.area.toFixed(2)}`;if(item.kind==='segment')return `Độ dài AB ≈ ${Math.hypot(item.bx-item.ax,item.by-item.ay).toFixed(2)}`;if(item.kind==='circle')return `Bán kính ${item.r.toFixed(2)} • S ≈ ${(Math.PI*item.r*item.r).toFixed(2)}`;if(item.kind==='angle')return `Góc ${item.theta.toFixed(1)}°`;return 'Các quan hệ hình học phụ thuộc được cập nhật khi hình nguồn thay đổi.';}
 inspectorRender(){if(!this.inspector)return;const i=this.inspector;i.replaceChildren();const title=document.createElement('h3');title.textContent='Thuộc tính & lớp hình';i.append(title);
  const actions=document.createElement('div');actions.className='studio-actions';actions.append(btn('⊙ Trung điểm',()=>this.addDependency('midpoint')),btn('↔ Đối xứng trục',()=>this.addDependency('reflectionAxis')),btn('⤨ Đối xứng tâm',()=>this.addDependency('reflectionCenter')));i.append(actions);
  const layers=document.createElement('div');layers.className='studio-layers';for(const item of this.board.items){const row=btn((item.id===this.selectedId?'● ':'○ ')+(item.name||LABELS[item.kind]),()=>{this.selectedId=item.id;this.inspectorRender();this.draw();},'layer-row');if(item.id===this.selectedId)row.classList.add('selected');layers.append(row);}i.append(layers);
  const selected=getItem(this.board,this.selectedId);if(!selected){const p=document.createElement('p');p.className='hint';p.textContent='Chọn một hình hoặc kéo thả hình từ thanh công cụ vào bảng để chỉnh sửa.';i.append(p);return;}
  const geo=coords(selected,this.board),metric=document.createElement('div');metric.className='studio-metrics';metric.dataset.geometryMetrics='true';metric.textContent=geo?this._measure(geo,selected):'Đối tượng phụ thuộc';i.append(metric);
  const manage=document.createElement('div');manage.className='studio-actions';manage.append(btn('👁 '+(selected.visible===false?'Hiện':'Ẩn'),()=>{selected.visible=selected.visible===false;this._snapshot();}),btn(selected.locked?'🔓 Mở khóa':'🔒 Khóa',()=>{selected.locked=!selected.locked;this._snapshot();}),btn('⧉ Nhân bản',()=>this.duplicate()),btn('✕ Xóa',()=>this.remove()));i.append(manage);
  const name=document.createElement('label');name.className='studio-edit';name.textContent='Tên đối tượng';const input=document.createElement('input');input.value=selected.name;input.maxLength=80;input.onchange=()=>{selected.name=input.value.slice(0,80);this._snapshot();};name.append(input);i.append(name);
  const fields={point:['x','y'],segment:['x','y','ax','ay','bx','by'],line:['x','y','ax','ay','bx','by'],ray:['x','y','ax','ay','bx','by'],angle:['x','y','theta','r'],circle:['x','y','r'],triangle:['x','y','a','rotation'],square:['x','y','a','rotation'],hexagon:['x','y','a','rotation'],rectangle:['x','y','a','b','rotation'],rhombus:['x','y','a','b','rotation'],parallelogram:['x','y','a','b','skew','rotation'],trapezoid:['x','y','a','b','height','rotation'],midpoint:[],reflectionAxis:['axisX'],reflectionCenter:['cx','cy']}[selected.kind]||[];
  const grid=document.createElement('div');grid.className='studio-input-grid';for(const key of fields){const lab=document.createElement('label');lab.className='studio-edit';lab.textContent=key;const n=document.createElement('input');n.type='number';n.step='.1';n.min='-999';n.max='999';n.value=String(Number(selected[key]||0).toFixed(2));n.disabled=selected.locked;
   n.onchange=()=>{const v=Number(n.value);if(Number.isFinite(v)){selected[key]=v;this._snapshot();}};lab.append(n);grid.append(lab);}i.append(grid);
  const note=document.createElement('p');note.className='hint';note.textContent=DERIVED_KINDS.includes(selected.kind)?'Điểm/hình phụ thuộc được tính lại từ đối tượng gốc khi cô thay đổi hình ban đầu.':'Có thể thay số trực tiếp hoặc kéo đỉnh trên bảng; các tính chất hình học dựng sẵn được giữ.';i.append(note);
 }
 dispose(){
   this.deactivate();
   this._stopPreview();
   if(this.toolbar)this.toolbar.replaceChildren();
   if(this.inspector)this.inspector.replaceChildren();
   if(this.motion)this.motion.replaceChildren();
   this.board=null;
   this.canvas=null;
   this.ctx=null;
 }
}
