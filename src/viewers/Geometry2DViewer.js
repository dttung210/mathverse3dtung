/**
 * V6 repaired: one mathematically meaningful construction for every 2D catalog type.
 * Parametric 2D scenes + constrained direct manipulation for special cases.
 */
import { Constraints } from '../math/constraints.js';
import { Measurements } from '../math/measurements.js';
import { normalizeExhibit, metrics, TYPES } from '../math-core.js';
import { buildGeometry2DScene } from '../math/geometry2d-scenes.js';
import { getGeometry2DHandles, patchFrom2DHandle } from '../studio/geometry2d-handles.js';
import { triangleFromSides, triangleConstructions, triangleDragIsValid } from '../math/triangle-constructions.js';

const copy = x => structuredClone(x);
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const lerp=(a,b,t)=>add(a,sub(b,a).map(x=>x*t));
const point=(name,xy,locked=false)=>({kind:'point',name,xy,locked});
const line=(a,b,color='#1a8b9a',dashed=false)=>({kind:'line',a,b,color,dashed});
const polygon=(pts,fill='#def3ef')=>({kind:'polygon',pts,fill});

export class Geometry2DViewer {
  constructor(model,options={}) {
    this.model=normalizeExhibit(model);
    this.options=options;
    this.initialParams={...this.model.params};
    this.params={...this.initialParams};
    this.initialPoints=this._makeEditablePoints();
    this.points=copy(this.initialPoints);
    if(model.viewState?.points){
      for(const [name,pt] of Object.entries(model.viewState.points)){
        if(name in this.points && Array.isArray(pt) && pt.length===2 && pt.every(Number.isFinite))this.points[name]=[...pt];
      }
    }
    this.scale=42;
    this.origin={x:0,y:0};
    this.dragTarget=null;
    this.dragParameter=null;
    this.toolMode='edit';
    this.showHandles=true;
    this.isPanning=false;
    this.lastMouse={x:0,y:0};
    this.hitList=[];
    this.showLabels=true;
    this.showGrid=true;
    this.showMeasurements=true;
    this.constructionMode= this.model.type==='triangleCenters' ? 'medians' : this.model.type==='circumIncircle' ? 'circles' : 'triangle';
    this._onPointerDown=this._onPointerDown.bind(this);
    this._onPointerMove=this._onPointerMove.bind(this);
    this._onPointerUp=this._onPointerUp.bind(this);
    this._onWheel=this._onWheel.bind(this);
    this._onResize=this._onResize.bind(this);
  }
  _makeEditablePoints(){
    const p=this.params,t=this.model.type;
    if(t==='parallelogram'||t==='parallelogramMid'){
      const a=p.a,b=p.b,theta=t==='parallelogramMid' ? p.deg*Math.PI/180 : Math.asin(Math.min(1,p.h/p.b));
      const offset=[b*Math.cos(theta),b*Math.sin(theta)];
      return {A:[-a/2,-1.5],B:[a/2,-1.5],D:[-a/2+offset[0],-1.5+offset[1]]};
    }
    if(['triangleCenters','circumIncircle','triangleLaws'].includes(t))return triangleFromSides(p.a,p.b,p.c);
    if(t==='segmentMidpoint')return {A:[-p.len/2,0],B:[p.len/2,0]};
    if(t==='rectangleSquare')return {A:[-p.a/2,-p.b/2],C:[p.a/2,p.b/2]};
    if(t==='rhombus')return {A:[0,p.b/2],B:[p.a/2,0]};
    if(t==='angles')return {B:[2.8*Math.cos(p.deg*Math.PI/180),2.8*Math.sin(p.deg*Math.PI/180)]};
    if(t==='circleOxy')return {I:[p.a,p.b],A:[p.a+p.r,p.b]};
    if(t==='circleTangent')return {H:[0,p.d],R:[p.r,0]};
    if(t==='vectorParallelogram')return {U:[p.ux,p.uy],V:[p.vx,p.vy]};
    if(t==='thales'){
      const a=p.a,b=p.b;
      return {A:[0,2],B:[-a*Math.sin(Math.PI/3),2-a*.5],C:[b*Math.sin(Math.PI/3),2-b*.5]};
    }
    return {};
  }
  get isEditable(){return Object.keys(this.points).length>0||this.getEditableHandleCount()>0;}
  getEditableHandleCount(){return Object.keys(this.points).length+getGeometry2DHandles(this.model.type,this.params).length;}
  setToolMode(mode){this.toolMode=mode==='orbit'?'orbit':'edit';this.render();}
  setConstructionMode(mode){
    if(!['triangleCenters','circumIncircle','triangleLaws'].includes(this.model.type))return false;
    if(!['triangle','medians','centers','circles'].includes(mode))return false;
    this.constructionMode=mode;this._fitToScene();this.render();return true;
  }
  setShowHandles(value){this.showHandles=!!value;this.render();}
  frame(){this._fitToScene();this.render();}
  _getScene(){
    if(!Object.keys(this.points).length)return buildGeometry2DScene(this.model.type,this.params,this.model.grade);
    const P=this.points,t=this.model.type;
    if(['triangleCenters','circumIncircle','triangleLaws'].includes(t)){
      const d=triangleConstructions(P.A,P.B,P.C);
      const prim=[polygon([P.A,P.B,P.C],'#e2f3f0')];
      const addMarker=(name,location,color='#28886a')=>prim.push({...point(name,location,true),color});
      if(this.constructionMode==='medians'||this.constructionMode==='centers'){
        for(const [start,half] of [[P.A,d.midA],[P.B,d.midB],[P.C,d.midC]])prim.push(line(start,half,'#e59433',true));
        addMarker('G',d.G,'#198861');
      }
      if(this.constructionMode==='centers'){
        for(const [start,foot] of [[P.A,d.altitudeA],[P.B,d.altitudeB],[P.C,d.altitudeC]])prim.push(line(start,foot,'#c0616a',true));
        addMarker('H',d.H,'#bc445b');addMarker('O',d.O,'#4474b4');addMarker('I',d.I,'#1e9369');
      }
      if(this.constructionMode==='circles'){
        prim.push({kind:'circle',center:d.O,r:d.radiusCircum,color:'#3d83b7'});
        prim.push({kind:'circle',center:d.I,r:d.radiusIn,color:'#df9142'});
        addMarker('O',d.O,'#3d83b7');addMarker('I',d.I,'#df9142');
      }
      for(const name of ['A','B','C'])prim.push(point(name,P[name]));
      return {type:t,primitives:prim,explanation:t==='triangleCenters'?'Kéo ba đỉnh; trọng tâm G là giao điểm của ba đường trung tuyến, AG = 2GM.':t==='circumIncircle'?'Kéo ba đỉnh để thay đường tròn nội tiếp và ngoại tiếp.':'Di chuyển các đỉnh để khảo sát định lý sin, cosin và số đo các cạnh.'};
    }
    if(t==='segmentMidpoint'){
      const M=Constraints.midpoint(P.A,P.B);
      return {type:t,primitives:[line(P.A,P.B),point('A',P.A),point('B',P.B),point('M',M,true)],explanation:'M luôn là trung điểm của AB.'};
    }
    if(t==='thales'){
      const k=this.params.k/100,M=lerp(P.A,P.B,k),N=lerp(P.A,P.C,k);
      return {type:t,primitives:[polygon([P.A,P.B,P.C]),line(M,N,'#e58b37'),point('A',P.A),point('B',P.B),point('C',P.C),point('M',M,true),point('N',N,true)],explanation:'MN // BC vì AM/AB = AN/AC = k.'};
    }
    if(t==='rectangleSquare'){
      const A=P.A,C=P.C,B=[C[0],A[1]],D=[A[0],C[1]];
      return {type:t,primitives:[polygon([A,B,C,D]),line(A,C,'#df933c',true),point('A',A),point('B',B,true),point('C',C),point('D',D,true)],explanation:'Hai đường chéo bằng nhau, bốn góc vuông; kéo A hoặc C để thay kích thước.'};
    }
    if(t==='rhombus'){
      const A=P.A,B=P.B,C=[0,-A[1]],D=[-B[0],0];
      return {type:t,primitives:[polygon([A,B,C,D]),line(A,C,'#d18b43',true),line(B,D,'#5288b8',true),point('A',A),point('B',B),point('C',C,true),point('D',D,true),point('O',[0,0],true)],explanation:'Hai đường chéo vuông góc và cắt nhau tại trung điểm; các cạnh luôn bằng nhau.'};
    }
    if(t==='angles'){
      const O=[0,0],A=[2.8,0],B=P.B,prim=[line(O,A,'#367db6'),line(O,B,'#e58b37'),point('O',O,true),point('A',A,true),point('B',B)];
      if(this.model.grade===7)prim.push(line(O,[-2.8,0],'#368e6d'),point('C',[-2.8,0],true));
      return {type:t,primitives:prim,explanation:'Kéo B trên cung tròn để thay đổi số đo góc; hai góc kề bù có tổng 180°.'};
    }
    if(t==='circleOxy'){
      const I=P.I,A=P.A,r=Math.hypot(A[0]-I[0],A[1]-I[1]);
      return {type:t,primitives:[{kind:'circle',center:I,r,fill:'#e4f4ee'},line(I,A,'#ed9d48'),point('I',I),point('A',A)],explanation:'Kéo tâm I hoặc điểm A trên đường tròn để chỉnh tâm, bán kính.'};
    }
    if(t==='circleTangent'){
      const O=[0,0],r=P.R[0],d=P.H[1];
      return {type:t,primitives:[{kind:'circle',center:O,r,fill:'#e5f4ee'},line([-5,d],[5,d],'#da9239'),line(O,[0,d],'#da9239',true),point('O',O,true),point('H',P.H),point('R',P.R)],explanation:'Kéo H để thay khoảng cách d hoặc R để thay bán kính r; khi d=r đường thẳng tiếp xúc đường tròn.'};
    }
    if(t==='vectorParallelogram'){
      const O=[0,0],U=P.U,V=P.V,W=add(U,V);
      return {type:t,primitives:[{...line(O,U,'#1689be'),arrow:true},{...line(O,V,'#e28d34'),arrow:true},{...line(O,W,'#248a70'),arrow:true},line(U,W,'#b0c0cf',true),line(V,W,'#b0c0cf',true),point('O',O,true),point('U',U),point('V',V),point('W',W,true)],explanation:'Kéo đầu U hoặc V để thay vectơ; đường chéo OW luôn bằng tổng OU+OV.'};
    }
    const C=Constraints.parallelogramC(P.A,P.B,P.D);
    const primitives=[polygon([P.A,P.B,C,P.D]),point('A',P.A),point('B',P.B),point('C',C,true),point('D',P.D)];
    if(t==='parallelogramMid'){
      const O=Constraints.midpoint(P.A,C);
      primitives.push(line(P.A,C,'#e88a34',true),line(P.B,P.D,'#a480ca',true),point('O',O,true));
    }
    return {type:t,primitives,explanation:'AB // CD, AD // BC và C = B + D − A.'};
  }
  mount(container){
    this.container=container;container.replaceChildren();
    Object.assign(container.style,{position:'relative',width:'100%',height:'100%',overflow:'hidden'});
    this.canvas=document.createElement('canvas');
    Object.assign(this.canvas.style,{width:'100%',height:'100%',display:'block',touchAction:'none'});
    this.canvas.setAttribute('aria-label',`Hình học phẳng: ${this.model.title}`);
    this.ctx=this.canvas.getContext('2d');
    container.append(this.canvas);
    this.canvas.addEventListener('pointerdown',this._onPointerDown);
    window.addEventListener('pointermove',this._onPointerMove);
    window.addEventListener('pointerup',this._onPointerUp);
    this.canvas.addEventListener('wheel',this._onWheel,{passive:false});
    window.addEventListener('resize',this._onResize);
    this._onResize(true);
  }
  _onResize(fit=false){
    if(!this.canvas)return;
    const r=this.container.getBoundingClientRect();
    this.width=Math.max(260,r.width);this.height=Math.max(240,r.height);
    const dpr=Math.min(window.devicePixelRatio||1,2);
    this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    if(fit){this._fitToScene();}
    else if(!this.origin.x&&!this.origin.y){this.origin={x:this.width/2,y:this.height/2};}
    this.render();
  }
  _fitToScene(){
    const scene=this._getScene(),xs=[],ys=[];
    const visit=a=>{if(Array.isArray(a)&&a.length===2&&a.every(Number.isFinite)){xs.push(a[0]);ys.push(a[1]);}};
    for(const prim of scene.primitives){
      visit(prim.xy);visit(prim.a);visit(prim.b);
      for(const pt of prim.pts||[])visit(pt);
      if(prim.center){const c=prim.center,r=prim.r??Math.max(prim.a||0,prim.b||0);visit([c[0]-r,c[1]-r]);visit([c[0]+r,c[1]+r]);}
    }
    if(!xs.length){this.origin={x:this.width/2,y:this.height/2};return;}
    const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
    const extentX=Math.max(2,xmax-xmin),extentY=Math.max(2,ymax-ymin);
    this.scale=Math.min(75,Math.max(8,Math.min((this.width-90)/extentX,(this.height-85)/extentY)));
    this.origin={x:this.width/2-(xmin+xmax)*this.scale/2,y:this.height/2+(ymin+ymax)*this.scale/2};
  }
  toScreen(p){return [this.origin.x+p[0]*this.scale,this.origin.y-p[1]*this.scale];}
  toMath(x,y){return [(x-this.origin.x)/this.scale,(this.origin.y-y)/this.scale].map(v=>Math.round(v*100)/100);}
  _onPointerDown(e){
    if(e.button!==0)return;
    const r=this.canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    this.lastMouse={x:e.clientX,y:e.clientY};
    const hit=this.toolMode==='edit'?this.hitList.find(h=>!h.locked&&Math.hypot(x-h.x,y-h.y)<17):null;
    if(hit?.handle){this.dragParameter=hit.handle;this.canvas.style.cursor='grabbing';}
    else if(hit){this.dragTarget=hit.name;this.canvas.style.cursor='grabbing';}
    else {this.isPanning=true;this.canvas.style.cursor='move';}
    this.canvas.setPointerCapture?.(e.pointerId);
  }
  _onPointerMove(e){
    if(!this.canvas)return;
    const r=this.canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    if(this.dragParameter){
      const patch=patchFrom2DHandle(this.model.type,this.params,this.dragParameter,...this.toMath(x,y));
      if(patch){this.params=normalizeExhibit({...this.model,params:{...this.params,...patch}}).params;
        this.render();this.options.onParametersChange?.({...this.params});this.options.onMetricsChange?.(this.getMetrics());}
    }else if(this.dragTarget){
      const old=this.points[this.dragTarget];let next=this.toMath(x,y);
      const t=this.model.type;
      const bounds=(key,value)=>{const entry=TYPES[t]?.params?.[key];return entry?Math.max(entry[1],Math.min(entry[2],value)):value;};
      if(t==='rhombus'){
        if(this.dragTarget==='A')next=[0,bounds('b',next[1]*2)/2];
        if(this.dragTarget==='B')next=[bounds('a',next[0]*2)/2,0];
      }
      if(t==='rectangleSquare'){
        if(this.dragTarget==='A')next=[this.points.C[0]-bounds('a',this.points.C[0]-next[0]),this.points.C[1]-bounds('b',this.points.C[1]-next[1])];
        if(this.dragTarget==='C')next=[this.points.A[0]+bounds('a',next[0]-this.points.A[0]),this.points.A[1]+bounds('b',next[1]-this.points.A[1])];
      }
      if(t==='angles'){
        const lo=5,hi=175,deg=Math.min(hi,Math.max(lo,Math.atan2(next[1],next[0])*180/Math.PI));
        next=[2.8*Math.cos(deg*Math.PI/180),2.8*Math.sin(deg*Math.PI/180)];
        this.params.deg=Math.round(deg*100)/100;
      }
      if(t==='circleOxy'){
        if(this.dragTarget==='I'){
          next=[bounds('a',next[0]),bounds('b',next[1])];
          const delta=sub(next,old);this.points.A=add(this.points.A,delta);
        }else{
          const vector=sub(next,this.points.I),d=Math.hypot(...vector);
          if(d<1e-6)next=old;
          else next=add(this.points.I,vector.map(v=>v*bounds('r',d)/d));
        }
      }
      if(t==='circleTangent'){
        if(this.dragTarget==='H')next=[0,bounds('d',next[1])];
        if(this.dragTarget==='R')next=[bounds('r',next[0]),0];
      }
      if(t==='vectorParallelogram'){
        const k=this.dragTarget==='U'?'u':'v';next=[bounds(k+'x',next[0]),bounds(k+'y',next[1])];
      }
      // Do not let a triangle/parallelogram collapse; reject degenerate configurations.
      this.points[this.dragTarget]=next;
      if(['parallelogram','parallelogramMid'].includes(t)){
        const {A,B,D}=this.points,u=sub(B,A),v=sub(D,A),a=Math.hypot(...u),b=Math.hypot(...v);
        const cross=u[0]*v[1]-u[1]*v[0],height=a>0?Math.abs(cross)/a:0;
        const deg=a*b>0?Math.acos(Math.min(1,Math.max(-1,(u[0]*v[0]+u[1]*v[1])/(a*b))))*180/Math.PI:0;
        const spec=TYPES[t].params;
        const within=(key,value)=>!spec[key]||(value>=spec[key][1]-1e-6&&value<=spec[key][2]+1e-6);
        if(Math.abs(cross)<.15||!within('a',a)||!within('b',b)||
          (t==='parallelogram'&&!within('h',height))||
          (t==='parallelogramMid'&&!within('deg',deg)))this.points[this.dragTarget]=old;
      }
      if(['triangleCenters','circumIncircle','triangleLaws'].includes(t)){
        const {A,B,C}=this.points;
        if(!triangleDragIsValid(A,B,C,TYPES[t].params))this.points[this.dragTarget]=old;
      }
      if(t==='thales'){
        const {A,B,C}=this.points,cross=(B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0]);
        const a=Math.hypot(...sub(B,A)),b=Math.hypot(...sub(C,A)),sp=TYPES.thales.params;
        if(Math.abs(cross)<.15||a<sp.a[1]||a>sp.a[2]||b<sp.b[1]||b>sp.b[2])this.points[this.dragTarget]=old;
      }
      if(t==='segmentMidpoint'){
        const len=Measurements.distance2D(this.points.A,this.points.B);
        if(len<1||len>14)this.points[this.dragTarget]=old;
      }
      // Keep numerical inspector values consistent with the dragged construction.
      const P=this.points;
      if(t==='segmentMidpoint')this.params.len=Math.round(Math.hypot(...sub(P.B,P.A))*1000)/1000;
      if(t==='thales'){
        this.params.a=Math.round(Math.hypot(...sub(P.B,P.A))*1000)/1000;
        this.params.b=Math.round(Math.hypot(...sub(P.C,P.A))*1000)/1000;
      }
      if(['parallelogram','parallelogramMid'].includes(t)){
        const u=sub(P.B,P.A),v=sub(P.D,P.A),a=Math.hypot(...u),b=Math.hypot(...v);
        const cross=u[0]*v[1]-u[1]*v[0];
        this.params.a=Math.round(a*1000)/1000;this.params.b=Math.round(b*1000)/1000;
        if(t==='parallelogram')this.params.h=Math.round(Math.abs(cross)/a*1000)/1000;
        else this.params.deg=Math.round(Math.acos(Math.min(1,Math.max(-1,(u[0]*v[0]+u[1]*v[1])/(a*b))))*180/Math.PI*1000)/1000;
      }
      if(['triangleCenters','circumIncircle','triangleLaws'].includes(t)){
        const d=triangleConstructions(P.A,P.B,P.C);
        this.params.a=Math.round(d.a*1000)/1000;this.params.b=Math.round(d.b*1000)/1000;this.params.c=Math.round(d.c*1000)/1000;
      }
      if(t==='rectangleSquare'){this.params.a=Math.round((P.C[0]-P.A[0])*100)/100;this.params.b=Math.round((P.C[1]-P.A[1])*100)/100;}
      if(t==='rhombus'){this.params.a=Math.round(P.B[0]*200)/100;this.params.b=Math.round(P.A[1]*200)/100;}
      if(t==='circleOxy'){this.params.a=P.I[0];this.params.b=P.I[1];this.params.r=Math.round(Math.hypot(...sub(P.A,P.I))*100)/100;}
      if(t==='circleTangent'){this.params.r=P.R[0];this.params.d=P.H[1];}
      if(t==='vectorParallelogram'){this.params.ux=P.U[0];this.params.uy=P.U[1];this.params.vx=P.V[0];this.params.vy=P.V[1];}
      this.render();this.options.onParametersChange?.({...this.params});this.options.onMetricsChange?.(this.getMetrics());
    }else if(this.isPanning){
      this.origin.x+=e.clientX-this.lastMouse.x;this.origin.y+=e.clientY-this.lastMouse.y;
      this.lastMouse={x:e.clientX,y:e.clientY};this.render();
    }else{this.canvas.style.cursor=this.toolMode==='edit'&&this.hitList.some(h=>!h.locked&&Math.hypot(x-h.x,y-h.y)<17)?'grab':'default';}
  }
  _onPointerUp(){const changed=!!this.dragTarget||!!this.dragParameter;this.dragTarget=null;this.dragParameter=null;this.isPanning=false;if(this.canvas)this.canvas.style.cursor='default';if(changed)this.options.onInteractionEnd?.();}
  _onWheel(e){e.preventDefault();const factor=e.deltaY<0?1.1:1/1.1;this.scale=Math.max(7,Math.min(175,this.scale*factor));this.render();}
  _drawGrid(){
    const c=this.ctx,s=this.scale;c.save();c.strokeStyle='#e6eef3';c.lineWidth=1;
    if(s>=16){
      for(let x=((this.origin.x%s)+s)%s;x<this.width;x+=s){c.beginPath();c.moveTo(x,0);c.lineTo(x,this.height);c.stroke();}
      for(let y=((this.origin.y%s)+s)%s;y<this.height;y+=s){c.beginPath();c.moveTo(0,y);c.lineTo(this.width,y);c.stroke();}
    }
    c.strokeStyle='#a9bbc7';c.beginPath();c.moveTo(0,this.origin.y);c.lineTo(this.width,this.origin.y);c.moveTo(this.origin.x,0);c.lineTo(this.origin.x,this.height);c.stroke();c.restore();
  }
  _drawPrimitive(g){
    const c=this.ctx;c.save();
    c.strokeStyle=g.color||'#147d89';c.lineWidth=2.3;
    if(g.dashed)c.setLineDash([7,5]);
    if(g.kind==='line'||g.kind==='curve'){
      const pts=g.kind==='line'?[g.a,g.b]:g.pts;
      c.beginPath();pts.forEach((p,i)=>{const [x,y]=this.toScreen(p);if(i)c.lineTo(x,y);else c.moveTo(x,y);});c.stroke();
      if(g.arrow&&pts.length===2){
        const A=this.toScreen(pts[0]),B=this.toScreen(pts[1]),th=Math.atan2(B[1]-A[1],B[0]-A[0]);
        const L=12;c.beginPath();c.moveTo(...B);c.lineTo(B[0]-L*Math.cos(th-.4),B[1]-L*Math.sin(th-.4));c.moveTo(...B);c.lineTo(B[0]-L*Math.cos(th+.4),B[1]-L*Math.sin(th+.4));c.stroke();
      }
    }else if(g.kind==='polygon'){
      c.beginPath();g.pts.forEach((p,i)=>{const [x,y]=this.toScreen(p);if(i)c.lineTo(x,y);else c.moveTo(x,y);});c.closePath();
      c.fillStyle=g.fill||'#dcf1eb';c.globalAlpha=.75;c.fill();c.globalAlpha=1;c.stroke();
    }else if(g.kind==='circle'){
      const [x,y]=this.toScreen(g.center);c.beginPath();c.arc(x,y,g.r*this.scale,0,2*Math.PI);
      if(g.fill){c.fillStyle=g.fill;c.fill();}c.stroke();
    }else if(g.kind==='ellipse'){
      const [x,y]=this.toScreen(g.center);c.beginPath();c.ellipse(x,y,g.a*this.scale,g.b*this.scale,0,0,2*Math.PI);c.stroke();
    }else if(g.kind==='arc'){
      const [x,y]=this.toScreen(g.center);c.beginPath();c.arc(x,y,g.r*this.scale,-g.start*Math.PI/180,-g.end*Math.PI/180,true);c.stroke();
    }else if(g.kind==='point'){
      const [x,y]=this.toScreen(g.xy);
      if(!g.onlyLabel){c.beginPath();c.arc(x,y,g.locked?5:7,0,2*Math.PI);c.fillStyle=g.color||(g.locked?'#318e9c':'#eb8d32');c.fill();c.strokeStyle='#fff';c.lineWidth=1.5;c.stroke();}
      if(this.showLabels&&g.name){c.fillStyle='#102d43';c.font='bold 13px system-ui';c.fillText(g.name,x+8,y-10);}
      if(this.showHandles&&this.toolMode==='edit'&&g.name in this.points)this.hitList.push({name:g.name,x,y,locked:!!g.locked});
    }
    c.restore();
  }
  render(){
    if(!this.ctx)return;
    const ctx=this.ctx;ctx.clearRect(0,0,this.width,this.height);
    if(this.showGrid)this._drawGrid();
    this.hitList=[];
    const scene=this._getScene();
    scene.primitives.filter(x=>x.kind!=='point').forEach(p=>this._drawPrimitive(p));
    scene.primitives.filter(x=>x.kind==='point').forEach(p=>this._drawPrimitive(p));
    if(this.showHandles && this.toolMode==='edit' && !Object.keys(this.points).length){
      for(const h of getGeometry2DHandles(this.model.type,this.params)){
        const [x,y]=this.toScreen(h.pos);
        ctx.save();ctx.shadowColor='rgba(246,160,59,.3)';ctx.shadowBlur=13;
        ctx.beginPath();ctx.arc(x,y,11,0,2*Math.PI);ctx.fillStyle='#fc9b45';ctx.fill();
        ctx.shadowBlur=0;ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.stroke();
        ctx.fillStyle='#21445b';ctx.font='bold 12px system-ui';ctx.fillText(h.label,x+15,y-13);ctx.restore();
        this.hitList.push({name:'param-'+h.key,x,y,handle:h,locked:false});
      }
    }
  }
  updateParameters(patch){
    if(patch.points){Object.assign(this.points,copy(patch.points));}
    const nums=Object.fromEntries(Object.entries(patch).filter(([k])=>k!=='points'));
    if(Object.keys(nums).length){
      this.params=normalizeExhibit({...this.model,params:{...this.params,...nums}}).params;
      this.initialPoints=this._makeEditablePoints();this.points=copy(this.initialPoints);
      this._fitToScene();
    }
    this.render();this.options.onParametersChange?.({...this.params});this.options.onMetricsChange?.(this.getMetrics());
  }
  reset(){this.params={...this.initialParams};this.initialPoints=this._makeEditablePoints();this.points=copy(this.initialPoints);this._fitToScene();this.render();this.options.onParametersChange?.({...this.params});}
  getMetrics(){
    const t=this.model.type,p=this.params;
    if(['triangleCenters','circumIncircle','triangleLaws'].includes(t)){
      const d=triangleConstructions(this.points.A,this.points.B,this.points.C);
      const r=x=>Math.round(x*1000)/1000;
      if(t==='triangleCenters')return [{name:'AG/GM',value:2,unit:''},{name:'Diện tích tam giác',value:r(d.area),unit:'đv²'},{name:'Trọng tâm G',value:`(${r(d.G[0])}; ${r(d.G[1])})`,unit:''}];
      if(t==='circumIncircle')return [{name:'Bán kính ngoại tiếp R',value:r(d.radiusCircum),unit:'đv'},{name:'Bán kính nội tiếp r',value:r(d.radiusIn),unit:'đv'},{name:'Diện tích tam giác',value:r(d.area),unit:'đv²'}];
      return metrics(t,{...this.params,a:d.a,b:d.b,c:d.c});
    }
    if(t==='segmentMidpoint'){
      const ab=Measurements.distance2D(this.points.A,this.points.B);
      return [{name:'Độ dài AB',value:ab,unit:'đv'},{name:'Trung điểm MA = MB',value:Math.round(ab*500)/1000,unit:'đv'}];
    }
    if(t==='parallelogram'||t==='parallelogramMid'){
      const {A,B,D}=this.points;
      return [{name:'Diện tích hình bình hành',value:Measurements.parallelogramArea(A,B,D),unit:'đv²'},{name:'Chu vi',value:Measurements.parallelogramPerimeter(A,B,D),unit:'đv'}];
    }
    if(t==='thales'){
      return [{name:'AM/AB = AN/AC',value:this.params.k/100,unit:''},{name:'MN // BC',value:'Đúng',unit:''}];
    }
    if(t==='angles'&&this.model.grade===7) return [{name:'Góc AOB',value:p.deg,unit:'°'},{name:'Góc BOC kề bù',value:180-p.deg,unit:'°'},{name:'Tổng hai góc',value:180,unit:'°'}];
    return metrics(t,p);
  }
  exportSnapshot(){return this.canvas?.toDataURL('image/png')||'';}
  getState(){return {type:this.model.type,modality:'geometry2d',params:{...this.params},points:copy(this.points)};}
  dispose(){
    window.removeEventListener('pointermove',this._onPointerMove);window.removeEventListener('pointerup',this._onPointerUp);window.removeEventListener('resize',this._onResize);
    this.canvas?.removeEventListener('pointerdown',this._onPointerDown);this.canvas?.removeEventListener('wheel',this._onWheel);
    this.container?.replaceChildren();this.canvas=null;this.ctx=null;
  }
}
