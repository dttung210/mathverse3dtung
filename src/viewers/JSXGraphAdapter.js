/** Opt-in interactive constructions, preserving the original Canvas engine. */
import {Geometry2DViewer} from './Geometry2DViewer.js';
import {Measurements} from '../math/measurements.js';
import {normalizeExhibit,TYPES as MODEL_TYPES} from '../math-core.js';
import {triangleConstructions,triangleDragIsValid} from '../math/triangle-constructions.js';

const TYPES = new Set(['segmentMidpoint','thales','angles','triangleCenters']);
export const supportsJSXGraph = model => TYPES.has(model?.type);
let idCounter=0;
const xy = obj => [obj.X(),obj.Y()];
const valid = p => p.every(Number.isFinite);
const cross = (A,B,C) => (B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0]);

export class JSXGraphAdapter extends Geometry2DViewer {
  constructor(model,options={}){super(model,options);this.board=null;this.element=null;this.jxPoints={};this.syncing=false;}
  mount(container){
    if(!supportsJSXGraph(this.model))throw new Error('Mô hình này chưa được hỗ trợ bởi JSXGraph');
    if(!globalThis.JXG?.JSXGraph?.initBoard)throw new Error('Chưa tải JSXGraph');
    this.container=container;container.replaceChildren();
    const div=document.createElement('div');div.id=`mathverse-jsxgraph-${++idCounter}`;div.className='jxgbox mv16-jxgbox';
    div.setAttribute('aria-label',`Hình học động: ${this.model.title}`);container.append(div);this.element=div;
    this.board=globalThis.JXG.JSXGraph.initBoard(div.id,{
      boundingbox:[-7,6,7,-6],axis:true,grid:false,keepAspectRatio:true,
      showNavigation:false,showCopyright:false,pan:{enabled:true},zoom:{wheel:true},
      renderer:'svg'
    });
    this._build();this.board.fullUpdate?.();
  }
  _add(name,location,attribute={}){
    const pt=this.board.create('point',location,{name,size:4,strokeColor:'#0f668d',fillColor:'#f9a03f',...attribute});
    this.jxPoints[name]=pt;
    if(!attribute.fixed){
      pt.on('drag',()=>this._handleDrag(name,pt));
      pt.on('up',()=>this.options.onInteractionEnd?.());
    }
    return pt;
  }
  _handleDrag(name,pt){
    if(this.syncing)return;
    const next=xy(pt),prev=this.points[name];
    if(!prev||!valid(next))return;
    if(this.model.type==='segmentMidpoint'){
      const other=this.points[name==='A'?'B':'A'];
      const len=Measurements.distance2D(next,other);
      if(len<1||len>14){this.syncing=true;pt.moveTo(prev,0);this.syncing=false;return;}
      this.params.len=Math.round(len*100)/100;
    }
    if(this.model.type==='thales'){
      const copy={...this.points,[name]:next};
      const ab=Measurements.distance2D(copy.A,copy.B),ac=Measurements.distance2D(copy.A,copy.C);
      if(Math.abs(cross(copy.A,copy.B,copy.C))<.15||ab<2||ab>10||ac<2||ac>10){
        this.syncing=true;pt.moveTo(prev,0);this.syncing=false;return;
      }
      this.params.a=Math.round(ab*100)/100;this.params.b=Math.round(ac*100)/100;
    }
    if(this.model.type==='triangleCenters'){
      const P={...this.points,[name]:next};
      if(!triangleDragIsValid(P.A,P.B,P.C,MODEL_TYPES.triangleCenters.params)){
        this.syncing=true;pt.moveTo(prev,0);this.syncing=false;return;
      }
      const d=triangleConstructions(P.A,P.B,P.C);
      this.params.a=Math.round(d.a*1000)/1000;this.params.b=Math.round(d.b*1000)/1000;this.params.c=Math.round(d.c*1000)/1000;
    }
    if(this.model.type==='angles'){
      const deg=(Math.atan2(next[1],next[0])*180/Math.PI+360)%360;
      // These classroom models only represent 5..175 degrees (grade 7 adjacent supplementary angles).
      if(deg<5||deg>175){this.syncing=true;pt.moveTo(prev,0);this.syncing=false;return;}
      this.params.deg=Math.round(deg*10)/10;
    }
    this.points[name]=next;
    this.options.onParametersChange?.({...this.params});
    this.options.onMetricsChange?.(this.getMetrics());
  }
  _build(){
    const board=this.board,P=this.points,t=this.model.type;
    const segment=(a,b,attr={})=>board.create('segment',[a,b],{strokeWidth:3,strokeColor:'#1b88a1',fixed:true,...attr});
    if(t==='segmentMidpoint'){
      const A=this._add('A',P.A), B=this._add('B',P.B);segment(A,B);
      board.create('midpoint',[A,B],{name:'M',size:3,fixed:true,strokeColor:'#16a34a',fillColor:'#16a34a'});
    }else if(t==='thales'){
      const A=this._add('A',P.A),B=this._add('B',P.B),C=this._add('C',P.C);
      board.create('polygon',[A,B,C],{fillColor:'#32a7b0',fillOpacity:.13,borders:{strokeColor:'#1b88a1',strokeWidth:2}});
      const coeff=()=>Math.max(0,Math.min(1,(Number(this.params.k)||0)/100));
      const M=board.create('point',[()=>A.X()+(B.X()-A.X())*coeff(),()=>A.Y()+(B.Y()-A.Y())*coeff()],{name:'M',fixed:true,size:3,strokeColor:'#ed9d48'});
      const N=board.create('point',[()=>A.X()+(C.X()-A.X())*coeff(),()=>A.Y()+(C.Y()-A.Y())*coeff()],{name:'N',fixed:true,size:3,strokeColor:'#ed9d48'});
      segment(M,N,{strokeColor:'#ed9d48'});
    }else if(t==='triangleCenters'){
      const A=this._add('A',P.A),B=this._add('B',P.B),C=this._add('C',P.C);
      board.create('polygon',[A,B,C],{fillColor:'#32a7b0',fillOpacity:.12,borders:{strokeColor:'#157e92',strokeWidth:2}});
      for(const [V,E,F] of [[A,B,C],[B,C,A],[C,A,B]]){
        const M=board.create('midpoint',[E,F],{name:'',size:2,fixed:true,fillColor:'#eda05b'});
        segment(V,M,{strokeColor:'#e59542',dash:2});
      }
      board.create('point',[()=>((A.X()+B.X()+C.X())/3),()=>((A.Y()+B.Y()+C.Y())/3)],
        {name:'G',fixed:true,size:4,strokeColor:'#168665',fillColor:'#168665'});
    }else if(t==='angles'){
      const O=this._add('O',[0,0],{fixed:true}),A=this._add('A',[2.8,0],{fixed:true});
      const circle=board.create('circle',[O,A],{visible:false,fixed:true});
      const B=board.create('glider',[P.B[0],P.B[1],circle],{name:'B',size:4,strokeColor:'#d98a29',fillColor:'#d98a29'});
      this.jxPoints.B=B;B.on('drag',()=>this._handleDrag('B',B));B.on('up',()=>this.options.onInteractionEnd?.());
      segment(O,A,{strokeColor:'#1b88a1'});segment(O,B,{strokeColor:'#ed9d48'});
      if(Number(this.model.grade)===7){const C=this._add('C',[-2.8,0],{fixed:true});segment(O,C,{strokeColor:'#348c65'});}
    }
  }
  render(){this.board?.update?.();}
  _onResize(){this.board?.resizeContainer?.(this.container.clientWidth,this.container.clientHeight,true);}
  updateParameters(patch={}){
    const nums=Object.fromEntries(Object.entries(patch).filter(([k])=>k!=='points'));
    const nextParams=normalizeExhibit({...this.model,params:{...this.params,...nums}}).params;
    const changed=Object.keys(nums);
    const type=this.model.type;
    const reframe=(type==='segmentMidpoint'&&changed.includes('len'))||
      (type==='thales'&&changed.some(k=>k==='a'||k==='b'))||
      (type==='triangleCenters'&&changed.some(k=>['a','b','c'].includes(k)));
    this.params=nextParams;
    if(reframe){
      const fresh=this._makeEditablePoints();
      this.syncing=true;
      for(const [name,pos] of Object.entries(fresh)){
        this.points[name]=pos;this.jxPoints[name]?.moveTo(pos,0);
      }
      this.syncing=false;
    }
    if(patch.points){this.syncing=true;for(const [name,pos] of Object.entries(patch.points)){
      if(!(name in this.points)||!Array.isArray(pos)||pos.length!==2||!valid(pos))continue;
      this.points[name]=[...pos];this.jxPoints[name]?.moveTo(pos,0);
    }this.syncing=false;}
    if('deg' in patch && type==='angles'){
      const d=this.params.deg*Math.PI/180,vec=[2.8*Math.cos(d),2.8*Math.sin(d)];
      this.points.B=vec;this.syncing=true;this.jxPoints.B?.moveTo(vec,0);this.syncing=false;
    }
    this.render();this.options.onParametersChange?.({...this.params});this.options.onMetricsChange?.(this.getMetrics());
  }

  reset(){this.params={...this.initialParams};this.points=structuredClone(this.initialPoints);
    this.syncing=true;for(const [key,pt] of Object.entries(this.jxPoints)){
      if(this.points[key])pt.moveTo(this.points[key],0);
    }this.syncing=false;this.render();this.options.onParametersChange?.({...this.params});this.options.onMetricsChange?.(this.getMetrics());
  }
  frame(){this.board?.setBoundingBox?.([-7,6,7,-6],true);}
  setToolMode(){/* Pan/zoom handled directly by JSXGraph. */}
  async exportSnapshot(){
    const svg=this.element?.querySelector('svg');if(!svg)return '';
    const str=new XMLSerializer().serializeToString(svg),blob=new Blob([str],{type:'image/svg+xml;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    try{
      const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});
      const canvas=document.createElement('canvas');canvas.width=Math.max(500,this.element.clientWidth*2);canvas.height=Math.max(400,this.element.clientHeight*2);
      const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
      return canvas.toDataURL('image/png');
    }finally{URL.revokeObjectURL(url);}
  }
  dispose(){
    if(this.board){globalThis.JXG?.JSXGraph?.freeBoard?.(this.board);this.board=null;}
    this.container?.replaceChildren();this.element=null;this.container=null;
  }
}
