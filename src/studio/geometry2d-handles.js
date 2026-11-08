/** 2D direct manipulation presets. Geometry remains defined by named parameters. */
import {TYPES} from '../math-core.js?v=r107_v15';
const D=Math.PI/180;
const H=(key,label,pos,operation)=>({key,label,pos,operation});
const V=(p,k,f)=>Number.isFinite(p[k])?p[k]:f;
export function getGeometry2DHandles(type,p={}){
  const a=V(p,'a',4),b=V(p,'b',3),h=V(p,'h',4),r=V(p,'r',3);
  switch(type){
    case 'polygon': return [H('r','Ban kinh',[0,-r],'radius')];
    case 'circle': return [H('r','Ban kinh',[r,0],'radius')];
    case 'trapezoid':return [H('a','Day lon',[a/2,-h/2],'twox'),H('b','Day nho',[b/2,h/2],'twox'),H('h','Chieu cao',[0,h/2],'twoy')];
    case 'symmetryAxis':case 'midSegment':return [H('a','Canh day',[a/2,-h/2],'twox'),H('h','Chieu cao',[0,h/2],'twoy')];
    case 'triangle':case 'pythagoras':return [H('a','Canh a',[a/2,-b/3],'twox'),H('b','Canh b',[-a/2,2*b/3],'threehalfy')];
    case 'parallelLines': {
      const deg=V(p,'angle',65),distance=V(p,'dist',3);
      return [H('dist','Khoang cach',[0,distance/2],'twoy'),H('angle','Goc cat tuyen',[3*Math.cos(deg*D),3*Math.sin(deg*D)],'polar-angle')];
    }
    case 'similarTriangles':return [H('a','Canh hinh goc',[-3+a,-1.4],'offset-a'),H('k','Ti so dong dang',[3.5+a*V(p,'k',.6),-1.4],'similar-k')];
    case 'congruentTriangles':return [H('a','Canh tam giac',[-5+a,-1],'offset-congruent-a'),H('b','Canh ben',[-5+b*Math.cos(V(p,'deg',60)*D),-1+b*Math.sin(V(p,'deg',60)*D)],'congruent-length')];
    case 'ellipse':return [H('a','Ban truc lon',[a,0],'absx'),H('b','Ban truc nho',[0,b],'absy')];
    case 'hyperbola':return [H('a','Tham so a',[a,0],'absx'),H('b','Tham so b',[a*Math.cosh(.8),b*Math.sinh(.8)],'hyperbola-b')];
    case 'circleInscribed':return [H('r','Ban kinh',[r,0],'radius'),H('deg','So do cung',[r*Math.cos(V(p,'deg',80)*D/2),r*Math.sin(V(p,'deg',80)*D/2)],'double-angle')];
    case 'cyclicQuad':return [H('r','Ban kinh',[r,0],'radius'),H('a1','Goc tham so',[r*Math.cos(V(p,'a1',45)*D),r*Math.sin(V(p,'a1',45)*D)],'polar-angle')];
    case 'vectorDot':return [H('ulen','Do dai u',[V(p,'ulen',4),0],'absx'),H('vlen','Do dai v',[V(p,'vlen',3)*Math.cos(V(p,'deg',60)*D),V(p,'vlen',3)*Math.sin(V(p,'deg',60)*D)],'radius')];
    case 'trigTriangle':{
      const bc=V(p,'c',5),ac=V(p,'b',4);
      return [H('b','Canh goc vuong',[-Math.sqrt(Math.max(.01,bc*bc-ac*ac))/2,2*ac/3],'threehalfy')];
    }
    case 'lineOxy':return [H('c','Dich duong thang',[0,-V(p,'c',-4)/(Math.abs(b)<.01?1:b)],'line-c')];
    default:return [];
  }
}
export function patchFrom2DHandle(type,p,handle,x,y){
 if(!handle||!Number.isFinite(x)||!Number.isFinite(y))return null;
 let v;
 switch(handle.operation){
   case 'radius':v=Math.hypot(x,y);break;
   case 'twox':v=Math.abs(x)*2;break;
   case 'twoy':v=Math.abs(y)*2;break;
   case 'threehalfy':v=Math.abs(y)*1.5;break;
   case 'absx':v=Math.abs(x);break;
   case 'absy':v=Math.abs(y);break;
   case 'offset-a':v=x+3;break;
   case 'offset-congruent-a':v=x+5;break;
   case 'similar-k':v=(x-3.5)/Math.max(.1,p.a||5);break;
   case 'congruent-length':v=Math.hypot(x+5,y+1);break;
   case 'hyperbola-b':v=Math.abs(y)/Math.sinh(.8);break;
   case 'polar-angle':v=Math.atan2(y,x)/D;break;
   case 'double-angle':v=2*Math.atan2(y,x)/D;break;
   case 'line-c':v=-(p.b||1)*y;break;
   default:return null;
 }
 const spec=TYPES[type]?.params?.[handle.key];if(!spec)return null;
 const lower=spec[1],upper=spec[2];
 if(type==='trapezoid'){
   if(handle.key==='a')v=Math.max(v,(p.b||3)+.15);
   if(handle.key==='b')v=Math.min(v,(p.a||6)-.15);
 }
 if(type==='trigTriangle'&&handle.key==='b')v=Math.min(v,(p.c||5)-.1);
 v=Math.max(lower,Math.min(upper,v));
 if(!Number.isFinite(v))return null;
 return {[handle.key]:Math.round(v*100)/100};
}
