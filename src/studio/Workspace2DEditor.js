import { clone, make2D, vertices, worldCoords, localCoords, set2DHandle, derived2DPosition, distance, clamp } from './workspace-document.js?v=r107_v15';
import { geometryFor, clipInfiniteLine, ADVANCED_KINDS, canBuildDerived } from './geometry-advanced2d.js?v=r107_v15';
const DEPENDENT_KINDS=ADVANCED_KINDS.filter(kind=>!['line','ray'].includes(kind));

// Self-contained geometric composition canvas. The original 2D exhibit viewer
// remains available for editing model-specific parametric constructions.
export class Workspace2DEditor {
  constructor(document,callbacks={}){
    this.doc=document;this.cb=callbacks;this.tool='select';this.selection=[];this.drag=null;
    this.pending=[];this.zoom=42;this.pan={x:0,y:0};this.snap=!!document.snap;
    this.canvas=null;this.ctx=null;this.width=100;this.height=100;this.resizeObserver=null;this.lastInspectorAt=0;
    this._down=this._down.bind(this);this._move=this._move.bind(this);this._up=this._up.bind(this);this._wheel=this._wheel.bind(this);
  }
  mount(node){
    this.container=node;this.canvas=document.createElement('canvas');this.canvas.className='mv11-canvas2d';this.canvas.setAttribute('aria-label','Bang dung hinh hoc phang 2D');
    node.replaceChildren(this.canvas);this.ctx=this.canvas.getContext('2d');
    this.canvas.addEventListener('pointerdown',this._down);this.canvas.addEventListener('wheel',this._wheel,{passive:false});
    window.addEventListener('pointermove',this._move);window.addEventListener('pointerup',this._up);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(node);this.resize();
  }
  resize(){if(!this.canvas||!this.container)return;const rect=this.container.getBoundingClientRect();const ratio=Math.min(devicePixelRatio||1,2);
    this.width=Math.max(220,rect.width);this.height=Math.max(140,rect.height);
    this.canvas.width=Math.round(this.width*ratio);this.canvas.height=Math.round(this.height*ratio);this.canvas.style.width='100%';this.canvas.style.height='100%';this.ctx.setTransform(ratio,0,0,ratio,0,0);this.draw();}
  screen(p){return [this.width/2+this.pan.x+p[0]*this.zoom,this.height/2+this.pan.y-p[1]*this.zoom];}
  world(p){return [(p[0]-this.width/2-this.pan.x)/this.zoom,(this.height/2+this.pan.y-p[1])/this.zoom];}
  eventPoint(e){const rect=this.canvas.getBoundingClientRect();return [e.clientX-rect.left,e.clientY-rect.top];}
  quantize(p){
    if(!this.doc.snap)return p;
    const screen=this.screen(p);
    let nearest=null,min=14;
    for(const item of this.doc.items){
      if(item.hidden)continue;
      for(const v of this._objectPoints(item)){
        const dist=distance(this.screen(v),screen);
        if(dist<min){nearest=v;min=dist;}
      }
    }
    return nearest||p.map(v=>Math.round(v*4)/4);
  }
  setTool(tool){this.tool=tool;this.pending=[];this.draw();}
  add(item){this.doc.items.push(item);this.selection=[item.id];this.cb.change?.();this.draw();}
  setSelection(ids){this.selection=[...new Set(ids)];this.cb.select?.(this.selection);this.draw();}
  _objectPoints(obj){
    if(ADVANCED_KINDS.includes(obj.kind)){
      const g=geometryFor(obj,this.doc);
      if(g?.type==='point')return [g.p];
      if(g?.type==='circle')return [[g.center[0]+g.r,g.center[1]]];
      return g?.a&&g?.b?[g.a,g.b]:[];
    }
    if(obj.kind==='circlePoint'||obj.kind==='midpoint')return [derived2DPosition(obj,this.doc)];
    return vertices(obj).map(p=>worldCoords(obj,p));
  }
  _lineBounds(){const a=this.world([0,this.height]),b=this.world([this.width,0]);return [a[0],b[0],a[1],b[1]];}
  _lineHit(a,b,p,infinite=false,ray=false){
    const endpoints=infinite?clipInfiniteLine(a,b,this._lineBounds(),ray):[a,b];
    return !!endpoints&&this._pointNearSegment(this.world(p),endpoints[0],endpoints[1],Math.max(.14,10/this.zoom));
  }
  _hit(p){
    for(let i=this.doc.items.length-1;i>=0;i--){
      const o=this.doc.items[i];if(o.hidden)continue;
      const points=this._objectPoints(o);
      if(this.tool==='select'&&!o.locked&&!DEPENDENT_KINDS.includes(o.kind)&&!['midpoint','circlePoint'].includes(o.kind)){for(let j=0;j<points.length;j++){
        if(distance(this.screen(points[j]),p)<11)return {item:o,index:j,handle:true};
      }}
      const advanced=ADVANCED_KINDS.includes(o.kind)?geometryFor(o,this.doc):null;
      if(advanced){
        if(advanced.type==='point'&&distance(this.screen(advanced.p),p)<12)return {item:o,handle:false};
        if(advanced.type==='circle'&&Math.abs(distance(this.screen(advanced.center),p)-advanced.r*this.zoom)<12)return {item:o,handle:false};
        if(advanced.a&&advanced.b&&this._lineHit(advanced.a,advanced.b,p,advanced.type==='line'||advanced.type==='ray',advanced.type==='ray'))return {item:o,handle:false};
      }
      else if(['circle','regularPolygon'].includes(o.kind)){
        const center=this.screen([o.x,o.y]),r=(o.r||2)*this.zoom,d=distance(center,p);
        if(Math.abs(d-r)<12||d<Math.max(14,r*.7))return {item:o,handle:false};
      }else if(['segment','line','ray','triangle','rectangle','rhombus','construction2d'].includes(o.kind)){
        if(this._inside(o,this.world(p)))return {item:o,handle:false};
      }else if(points.length&&distance(this.screen(points[0]),p)<14)return {item:o,handle:false};
    }
    return null;
  }
  _inside(item,p){
    const local=localCoords(item,p);
    if(item.kind==='construction2d'){
      const primitives=item.primitives||[];
      let near=false;
      for(const g of primitives){
        if(g.kind==='circle'&&Math.abs(distance(g.center,local)-g.r)<.24)near=true;
        if(g.kind==='point'&&distance(g.xy,local)<.25)near=true;
        if(g.kind==='line'&&this._pointNearSegment(local,g.a,g.b,.25))near=true;
        if(g.kind==='polygon'&&this._pointInPolygon(local,g.pts))near=true;
      }
      return near;
    }
    const verts=vertices(item);
    if(['segment','line','ray'].includes(item.kind))return this._lineHit(worldCoords(item,verts[0]),worldCoords(item,verts[1]),this.screen(p),item.kind!=='segment',item.kind==='ray');
    return this._pointInPolygon(local,verts);
  }
  _pointNearSegment(p,a,b,eps){const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/Math.max(1e-9,dx*dx+dy*dy),0,1);
    return distance(p,[a[0]+t*dx,a[1]+t*dy])<eps;}
  _pointInPolygon(p,arr){let inside=false;for(let i=0,j=arr.length-1;i<arr.length;j=i++){
      if((arr[i][1]>p[1])!==(arr[j][1]>p[1])&&p[0]<(arr[j][0]-arr[i][0])*(p[1]-arr[i][1])/(arr[j][1]-arr[i][1])+arr[i][0])inside=!inside;
    }return inside;}
  _down(e){if(e.button!==0&&e.button!==1)return;e.preventDefault();this.canvas.setPointerCapture?.(e.pointerId);
    const p=this.eventPoint(e),w=this.quantize(this.world(p));
    if(e.button===1||this.tool==='pan'||e.code==='Space'){
      this.drag={kind:'pan',x:p[0],y:p[1],pan:{...this.pan}};return;
    }
    if(DEPENDENT_KINDS.includes(this.tool)){
      const hit=this._hit(p);
      if(!hit){this.cb.notify?.('Hãy nhấp đúng đối tượng làm căn cứ dựng hình.');return;}
      const kind=this.tool;
      const single=['perpBisector','median','altitude','angleBisector','circumcircle','tangentLine'];
      if(single.includes(kind)){
        if(!canBuildDerived(kind,[hit.item])){this.cb.notify?.('Chọn đoạn thẳng, tam giác hoặc điểm trên đường tròn phù hợp.');return;}
        const item=make2D(kind,w,{parentId:hit.item.id,label:({perpBisector:'Đường trung trực',median:'Trung tuyến A',altitude:'Đường cao A',angleBisector:'Phân giác A',circumcircle:'Đường tròn ngoại tiếp',tangentLine:'Tiếp tuyến'})[kind]});
        this.add(item);this.setTool('select');return;
      }
      this.pending.push(hit.item.id);
      const ids=[...new Set(this.pending)];
      if(ids.length===2){
        let parents=ids.map(id=>this.doc.items.find(v=>v.id===id));
        if(['parallelLine','perpendicularLine'].includes(kind))parents.sort((a,b)=>Number(['point','midpoint','circlePoint','intersectionPoint'].includes(b.kind))-Number(['point','midpoint','circlePoint','intersectionPoint'].includes(a.kind)));
        if(!canBuildDerived(kind,parents)){
          this.pending=[];this.cb.notify?.('Chọn 1 điểm và 1 đường, hoặc chọn hai đường cắt nhau.');return;
        }
        const item=make2D(kind,w,{parentIds:parents.map(o=>o.id),label:({parallelLine:'Đường song song',perpendicularLine:'Đường vuông góc',intersectionPoint:'Giao điểm'})[kind]});
        this.add(item);this.setTool('select');return;
      }
      this.cb.notify?.('Chọn đối tượng thứ hai để hoàn tất phép dựng.');return;
    }
    if(['point','segment','line','ray','circle','triangle','rectangle','rhombus','regularPolygon'].includes(this.tool)){
      if(['point','rectangle','rhombus','regularPolygon'].includes(this.tool)){
        const item=make2D(this.tool,w);this.add(item);this.setTool('select');return;
      }
      this.pending.push(w);const required={segment:2,line:2,ray:2,circle:2,triangle:3}[this.tool];
      if(this.pending.length>=required){
        const coords=this.pending;let item;
        if(this.tool==='circle')item=make2D('circle',coords[0],{r:clamp(distance(coords[0],coords[1]),.2,50)});
        else if(['segment','line','ray','triangle'].includes(this.tool)){
          const n=coords.length,c=coords.reduce((acc,q)=>[acc[0]+q[0]/n,acc[1]+q[1]/n],[0,0]);
          item=make2D(this.tool,c);item.points=coords.map(q=>[q[0]-c[0],q[1]-c[1]]);
          if(this.tool==='triangle'&&Math.abs((coords[1][0]-coords[0][0])*(coords[2][1]-coords[0][1])-(coords[1][1]-coords[0][1])*(coords[2][0]-coords[0][0]))<.2){this.pending=[];this.cb.notify?.('Ba diem khong duoc thang hang.');return;}
        }
        this.add(item);this.setTool('select');
      }else this.draw();return;
    }
    if(this.tool==='midpoint'){
      const hit=this._hit(p);
      if(hit?.item.kind==='segment')this.add(make2D('midpoint',w,{parentId:hit.item.id}));
      else this.cb.notify?.('Hay chon mot doan thang.');return;
    }
    if(this.tool==='circlePoint'){
      const hit=this._hit(p);
      if(hit?.item.kind==='circle'){
        const angle=Math.atan2(w[1]-hit.item.y,w[0]-hit.item.x);
        this.add(make2D('circlePoint',w,{parentId:hit.item.id,theta:angle}));
      }else this.cb.notify?.('Hay chon mot duong tron.');return;
    }
    if(this.tool!=='select')return;
    const hit=this._hit(p);
    if(!hit){if(!e.shiftKey)this.setSelection([]);this.drag={kind:'pan',x:p[0],y:p[1],pan:{...this.pan}};return;}
    const item=hit.item;
    if(e.shiftKey){this.setSelection(this.selection.includes(item.id)?this.selection.filter(id=>id!==item.id):[...this.selection,item.id]);return;}
    if(!this.selection.includes(item.id))this.setSelection([item.id]);
    if(item.locked||item.kind==='midpoint'||DEPENDENT_KINDS.includes(item.kind))return;
    if(item.kind==='circlePoint'){
      this.drag={kind:'circlePoint',id:item.id,modified:false};return;
    }
    if(hit.handle){
      this.drag={kind:'handle',id:item.id,index:hit.index,modified:false};
    }else{
      this.drag={kind:'object',start:w,origins:this.selection.map(id=>{const o=this.doc.items.find(x=>x.id===id);return {id,x:o.x,y:o.y};}),modified:false};
    }
  }
  _notifyLive(){const now=performance.now();if(now-this.lastInspectorAt>70){this.lastInspectorAt=now;this.cb.live?.();}}
  _move(e){if(!this.drag)return;
    const p=this.eventPoint(e),w=this.quantize(this.world(p));
    if(this.drag.kind==='pan'){this.pan.x=this.drag.pan.x+p[0]-this.drag.x;this.pan.y=this.drag.pan.y+p[1]-this.drag.y;this.draw();return;}
    if(this.drag.kind==='object'){
      for(const start of this.drag.origins){const o=this.doc.items.find(x=>x.id===start.id);if(!o||o.locked)continue;
        o.x=Math.round((start.x+w[0]-this.drag.start[0])*1000)/1000;
        o.y=Math.round((start.y+w[1]-this.drag.start[1])*1000)/1000;
      }
      this.drag.modified=true;this.draw();this._notifyLive();return;
    }
    if(this.drag.kind==='circlePoint'){
      const item=this.doc.items.find(v=>v.id===this.drag.id);
      const parent=this.doc.items.find(v=>v.id===item?.parentId);
      if(item&&parent?.kind==='circle'){
        item.theta=Math.atan2(w[1]-parent.y,w[0]-parent.x);
        this.drag.modified=true;this.draw();this._notifyLive();
      }
      return;
    }
    if(this.drag.kind==='handle'){
      const o=this.doc.items.find(x=>x.id===this.drag.id);if(o&&set2DHandle(o,this.drag.index,w)){
        this.drag.modified=true;this.draw();this._notifyLive();
      }
    }
  }
  _up(){if(!this.drag)return;const changed=this.drag.modified;this.drag=null;if(changed)this.cb.change?.();this.draw();}
  _wheel(e){e.preventDefault();const s=this.eventPoint(e),before=this.world(s),factor=e.deltaY<0?1.1:.9;
    this.zoom=clamp(this.zoom*factor,11,200);const after=this.world(s);
    this.pan.x+=(after[0]-before[0])*this.zoom;this.pan.y-=(after[1]-before[1])*this.zoom;this.draw();}
  focus(){this.pan={x:0,y:0};this.zoom=42;this.draw();}
  draw(){if(!this.ctx)return;const ctx=this.ctx,w=this.width,h=this.height;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#fafdff';ctx.fillRect(0,0,w,h);
    if(this.doc.grid){const gap=this.zoom;ctx.lineWidth=1;ctx.strokeStyle='#e4edf3';
      if(gap>12){for(let x=(w/2+this.pan.x)%gap;x<w;x+=gap){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
        for(let y=(h/2+this.pan.y)%gap;y<h;y+=gap){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}}
      ctx.strokeStyle='#afc2cf';const zero=this.screen([0,0]);ctx.beginPath();ctx.moveTo(0,zero[1]);ctx.lineTo(w,zero[1]);ctx.moveTo(zero[0],0);ctx.lineTo(zero[0],h);ctx.stroke();}
    for(const o of this.doc.items){if(o.hidden)continue;this._drawItem(o);}
    if(this.pending.length){ctx.save();ctx.fillStyle='#df8d40';for(const p of this.pending){const [x,y]=this.screen(p);ctx.beginPath();ctx.arc(x,y,5,0,2*Math.PI);ctx.fill();}ctx.restore();}
  }
  _drawItem(o){const ctx=this.ctx,selected=this.selection.includes(o.id);
    ctx.save();ctx.lineWidth=selected?2.8:2;ctx.strokeStyle=o.color||'#0d8494';ctx.fillStyle=selected?'rgba(6,135,151,.16)':'rgba(23,151,153,.11)';ctx.lineJoin='round';
    const path=(pts,close=false)=>{if(!pts.length)return;ctx.beginPath();pts.forEach((p,i)=>{const [x,y]=this.screen(p);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);});if(close)ctx.closePath();if(close)ctx.fill();ctx.stroke();};
    if(o.kind==='circle'){const [x,y]=this.screen([o.x,o.y]);ctx.beginPath();ctx.arc(x,y,o.r*this.zoom,0,2*Math.PI);ctx.fill();ctx.stroke();}
    else if(o.kind==='construction2d'){
      for(const g of o.primitives){
        ctx.save();if(g.color)ctx.strokeStyle=g.color;if(g.fill)ctx.fillStyle=g.fill;
        if(g.dashed)ctx.setLineDash([7,5]);
        if(g.kind==='polygon')path(g.pts.map(p=>worldCoords(o,p)),true);
        else if(g.kind==='line'){
          const worldA=worldCoords(o,g.a),worldB=worldCoords(o,g.b);
          path([worldA,worldB]);
          if(g.arrow){
            const A=this.screen(worldA),B=this.screen(worldB),theta=Math.atan2(B[1]-A[1],B[0]-A[0]),len=12;
            ctx.beginPath();ctx.moveTo(...B);
            ctx.lineTo(B[0]-len*Math.cos(theta-.4),B[1]-len*Math.sin(theta-.4));
            ctx.moveTo(...B);ctx.lineTo(B[0]-len*Math.cos(theta+.4),B[1]-len*Math.sin(theta+.4));ctx.stroke();
          }
        }
        else if(g.kind==='curve'&&g.pts)path(g.pts.map(p=>worldCoords(o,p)));
        else if(g.kind==='circle'){const [x,y]=this.screen(worldCoords(o,g.center));ctx.beginPath();ctx.arc(x,y,g.r*this.zoom,0,2*Math.PI);ctx.stroke();}
        else if(g.kind==='arc'){
          const [x,y]=this.screen(worldCoords(o,g.center));ctx.beginPath();
          ctx.arc(x,y,g.r*this.zoom,-(g.start+(o.angle||0))*Math.PI/180,-(g.end+(o.angle||0))*Math.PI/180,true);ctx.stroke();
        }
        else if(g.kind==='ellipse'){
          const [x,y]=this.screen(worldCoords(o,g.center));ctx.beginPath();
          ctx.ellipse(x,y,g.a*this.zoom,g.b*this.zoom,-(o.angle||0)*Math.PI/180,0,2*Math.PI);ctx.stroke();
        }
        else if(g.kind==='point'&&Array.isArray(g.xy)){
          const [x,y]=this.screen(worldCoords(o,g.xy));if(!g.onlyLabel){ctx.beginPath();ctx.arc(x,y,3.4,0,2*Math.PI);ctx.fillStyle='#0e8797';ctx.fill();}
          if(g.name){ctx.fillStyle='#28485c';ctx.font='12px system-ui';ctx.fillText(String(g.name),x+8,y-8);}
        }
        ctx.restore();
      }
    }else if(['circlePoint','midpoint','point'].includes(o.kind)){
      const point=derived2DPosition(o,this.doc),[x,y]=this.screen(point);ctx.beginPath();ctx.arc(x,y,5,0,2*Math.PI);ctx.fillStyle='#e7a14c';ctx.fill();ctx.stroke();
    }else if(['line','ray'].includes(o.kind)){
      const g=geometryFor(o,this.doc),ends=g&&clipInfiniteLine(g.a,g.b,this._lineBounds(),o.kind==='ray');
      if(ends)path(ends);
    }else{path(vertices(o).map(p=>worldCoords(o,p)),o.kind!=='segment');}
    if(selected&&!DEPENDENT_KINDS.includes(o.kind)){
      for(const world of this._objectPoints(o)){
        const [x,y]=this.screen(world);ctx.beginPath();ctx.arc(x,y,6,0,2*Math.PI);ctx.fillStyle=o.locked?'#9ba7b0':'#f2a44e';ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.stroke();
      }
    }
    if(!['construction2d'].includes(o.kind)){
      const [x,y]=this.screen([o.x,o.y]);ctx.fillStyle='#33596a';ctx.font='600 11px system-ui';ctx.fillText(o.label.slice(0,22),x+9,y-11);
    }
    ctx.restore();
  }
  exportPNG(){return this.canvas.toDataURL('image/png');}
  dispose(){this.resizeObserver?.disconnect();this.canvas?.removeEventListener('pointerdown',this._down);this.canvas?.removeEventListener('wheel',this._wheel);
    window.removeEventListener('pointermove',this._move);window.removeEventListener('pointerup',this._up);this.container?.replaceChildren();this.canvas=null;this.ctx=null;}
}
