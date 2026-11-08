/** Interactive parameter handles that preserve the solid's mathematical family. */
import { TYPES } from '../math-core.js';

const descriptor=(key,label,pos,axis,factor=1)=>({key,label,pos,axis,factor});
export function getSolidHandles(type,p){
  const a=p.a||4,b=p.b||3,h=p.h||5,r=p.r||3;
  switch(type){
    case 'squarePyramid':return [
      descriptor('h','Đỉnh S · chiều cao',[0,h/2,0],[0,1,0],2),
      descriptor('a','Cạnh đáy a',[a/2,-h/2,a/2],[1,0,0],2)
    ];
    case 'trianglePyramid':return [
      descriptor('h','Đỉnh S · chiều cao',[0,h/2,0],[0,1,0],2),
      descriptor('a','Cạnh đáy',[a/2,-h/2,a/(2*Math.sqrt(3))],[1,0,0],2)
    ];
    case 'sphere':return [descriptor('r','B\u00e1n k\u00ednh',[r,0,0],[1,0,0],1)];
    case 'tetrahedron':return [descriptor('a','C\u1ea1nh t\u1ee9 di\u1ec7n',[0,-a*Math.sqrt(2/3)/2,-a/Math.sqrt(3)],[0,0,-1],Math.sqrt(3))];
    case 'triPrism':return [descriptor('h','Chi\u1ec1u cao',[0,h/2,0],[0,1,0],2),descriptor('a','C\u1ea1nh \u0111\u00e1y',[0,-h/2,a/Math.sqrt(3)],[0,0,1],Math.sqrt(3))];
    case 'prismQuad':return [descriptor('h','Chi\u1ec1u cao',[0,h/2,0],[0,1,0],2),descriptor('a','\u0110\u00e1y d\u00e0i',[a/2,-h/2,-(p.h_base||3)/2],[1,0,0],2),descriptor('h_base','Chi\u1ec1u cao \u0111\u00e1y',[0,-h/2,(p.h_base||3)/2],[0,0,1],2)];
    case 'cube':return [descriptor('a','Cạnh lập phương',[a/2,a/2,a/2],[1,0,0],2)];
    case 'cuboid':return [
      descriptor('h','Chiều cao',[a/2,h/2,b/2],[0,1,0],2),
      descriptor('a','Chiều dài',[a/2,-h/2,b/2],[1,0,0],2),
      descriptor('b','Chiều rộng',[-a/2,-h/2,b/2],[0,0,1],2)
    ];
    case 'cylinder':case 'cone':return [
      descriptor('h','Chiều cao',[0,h/2,0],[0,1,0],2),
      descriptor('r','Bán kính đáy',[r,-h/2,0],[1,0,0],1)
    ];
    case 'revolvedSolid':return [descriptor('h','Chi\u1ec1u d\u00e0i tr\u1ee5c',[h/2,0,0],[1,0,0],2),descriptor('r1','B\u00e1n k\u00ednh 1',[-h/2,p.r1||2,0],[0,1,0],1),descriptor('r2','B\u00e1n k\u00ednh 2',[h/2,p.r2||3,0],[0,1,0],1)];
    case 'crossSection':return [descriptor('t','\u0110\u1ed9 cao m\u1eb7t c\u1eaft',[0,-h/2+h*(p.t||50)/100,0],[0,1,0],100/h),descriptor('h','Chi\u1ec1u cao',[a/2,h/2,b/2],[0,1,0],2)];
    case 'oxyzVector':return [descriptor('x','T\u1ecda \u0111\u1ed9 x',[(p.x||0)+.3,p.y||0,p.z||0],[1,0,0],1),descriptor('y','T\u1ecda \u0111\u1ed9 y',[p.x||0,(p.y||0)+.3,p.z||0],[0,1,0],1),descriptor('z','T\u1ecda \u0111\u1ed9 z',[p.x||0,p.y||0,(p.z||0)+.3],[0,0,1],1)];
    case 'oxyzAxes':return [descriptor('len','\u0110\u1ed9 d\u00e0i tr\u1ee5c',[p.len||5,0,0],[1,0,0],1)];
    case 'sphereSection':return [
      descriptor('r','Bán kính mặt cầu',[r,0,0],[1,0,0],1),
      descriptor('d','Vị trí mặt phẳng cắt',[0,p.d||0,0],[0,1,0],1)
    ];
    case 'oxyzSphere':return [
      descriptor('r','Bán kính R',[(p.x||0)+r,p.y||0,p.z||0],[1,0,0],1),
      descriptor('x','Tâm I · x',[p.x||0,p.y||0,p.z||0],[1,0,0],1),
      descriptor('y','Tâm I · y',[p.x||0,(p.y||0)+0.4,p.z||0],[0,1,0],1),
      descriptor('z','Tâm I · z',[p.x||0,p.y||0,(p.z||0)+0.4],[0,0,1],1)
    ];
    case 'frustumPyramid':return [
      descriptor('h','Chiều cao h',[0,h/2,0],[0,1,0],2),
      descriptor('a','Đáy lớn a',[a/2,-h/2,a/2],[1,0,0],2),
      descriptor('b','Đáy nhỏ b',[b/2,h/2,b/2],[1,0,0],2)
    ];
    case 'plane':return [
      descriptor('angle','Góc nghiêng mặt phẳng (P)',[1.9,0.2,-0.9],[0,1,0],25)
    ];
    case 'twoPlanes':return [
      descriptor('angle','Góc nghiêng (Q)',[-2.0,(p.gap||0)/2,0],[0,1,0],25),
      descriptor('gap','Khoảng cách hai mặt phẳng',[0,(p.gap||1)/2,0],[0,1,0],2)
    ];
    case 'skewLines':return [
      descriptor('dist','Đoạn vuông góc chung AB',[0,(p.dist||2)/2,0],[0,1,0],2),
      descriptor('angle','Góc chéo nhau φ',[2.2,(p.dist||2)/2,1.2],[0,0,1],30)
    ];
    case 'parallelLines':return [
      descriptor('dist','Khoảng cách hai đường song song',[0,(p.dist||2)/2,0],[0,1,0],2),
      descriptor('angle','Góc cát tuyến',[2.0,(p.dist||2)/2,0],[1,0,0],25)
    ];
    case 'parallelProjection':return [
      descriptor('h','Độ cao vật thể A, B, C',[-1.5,p.h||2.4,-1],[0,1,0],1),
      descriptor('shift','Độ xiên phương chiếu l',[(p.shift||1)-1.5,0,-1],[1,0,0],1)
    ];
    case 'lineParallelPlane':return [
      descriptor('dist','Khoảng cách d(d,(P))',[0,p.dist||2,0],[0,1,0],1),
      descriptor('angle','Hướng đường thẳng d',[2.2,p.dist||2,0.8],[0,0,1],30)
    ];
    case 'parallelPlanes':return [
      descriptor('dist','Khoảng cách HK giữa (P) và (Q)',[0,(p.dist||2.2)/2,0],[0,1,0],2)
    ];
    case 'linePerpPlane':return [
      descriptor('h','Độ cao AH ⊥ (P)',[0,p.h||3,0],[0,1,0],1),
      descriptor('slant','Góc đường xiên AB',[1.8,0,0],[1,0,0],-15)
    ];
    case 'perpendicularPlanes':return [
      descriptor('h','Chiều cao mặt đứng (Q)',[0,p.h||3.2,0],[0,1,0],1),
      descriptor('w','Độ rộng giao tuyến d',[(p.w||4.6)/2,0,0],[1,0,0],2)
    ];
    case 'linePlaneAngle':return [
      descriptor('deg','Góc φ = (d, (P))',[0,(p.len||3.6)*Math.sin((p.deg||45)*Math.PI/180),0],[0,1,0],18),
      descriptor('len','Độ dài đoạn xiên AB',[(p.len||3.6)*Math.cos((p.deg||45)*Math.PI/180),0,0],[1,0,0],1)
    ];
    case 'dihedralAngle':return [
      descriptor('deg','Góc phẳng nhị diện [P,d,Q]',[0,1.5*Math.sin((p.deg||60)*Math.PI/180),1.5*Math.cos((p.deg||60)*Math.PI/180)],[0,1,0],25)
    ];
    case 'openTopBox':return [
      descriptor('cut','Cạnh góc cắt x',[(p.L||6)/2-(p.cut||1),(p.cut||1)/2,(p.L||6)/2-(p.cut||1)],[0,1,0],0.8),
      descriptor('L','Cạnh tấm bìa L',[(p.L||6)/2,-(p.cut||1)/2,0],[1,0,0],2)
    ];
    case 'profileRevolve':return [
      descriptor('slice','Vị trí lát cắt S(x)',[((p.slice??0.5)-0.5)*(p.h||4),0,0],[1,0,0],1/Math.max(1,p.h||4)),
      descriptor('r2','Bán kính R(b)',[(p.h||4)/2,p.r2||2.4,0],[0,1,0],1)
    ];
    case 'oxyzVectorPair':return [
      descriptor('x','Vectơ v · x',[p.x||1,p.y||2,p.z||1],[1,0,0],1),
      descriptor('y','Vectơ v · y',[p.x||1,(p.y||2)+0.35,p.z||1],[0,1,0],1),
      descriptor('z','Vectơ v · z',[p.x||1,p.y||2,(p.z||1)+0.35],[0,0,1],1),
      descriptor('u1','Vectơ u · x',[p.u1||2,p.u2||1,p.u3||2],[1,0,0],1)
    ];
    case 'oxyzPlane':return [
      descriptor('D','Hệ số tự do D (tịnh tiến mặt phẳng)',[0,0,-(p.D||0)/Math.max(1,(p.A||0)**2+(p.B||0)**2+(p.C||1)**2)],[0,0,-1],2)
    ];
    case 'oxyzPlanePointDistance':return [
      descriptor('x','Điểm M · x',[p.x||2,p.y||1,p.z||2],[1,0,0],1),
      descriptor('y','Điểm M · y',[p.x||2,(p.y||1)+0.35,p.z||2],[0,1,0],1),
      descriptor('z','Điểm M · z',[p.x||2,p.y||1,(p.z||2)+0.35],[0,0,1],1)
    ];
    case 'oxyzLine':return [
      descriptor('x0','Điểm M₀ · x₀',[p.x0||1,p.y0||1,p.z0||1],[1,0,0],1),
      descriptor('y0','Điểm M₀ · y₀',[p.x0||1,(p.y0||1)+0.35,p.z0||1],[0,1,0],1),
      descriptor('z0','Điểm M₀ · z₀',[p.x0||1,p.y0||1,(p.z0||1)+0.35],[0,0,1],1)
    ];
    case 'oxyzLinePair':return [
      descriptor('dist','Khoảng cách chéo nhau HK',[0,0,p.dist||1.8],[0,0,1],1),
      descriptor('deg','Góc giữa hai đường thẳng',[2.2,1.2,p.dist||1.8],[0,1,0],25)
    ];
    case 'oxyzSphereCut':case 'oxyzSphereLine':return [
      descriptor('dist','Khoảng cách d từ tâm O',[0,0,p.dist||1.2],[0,0,1],1),
      descriptor('r','Bán kính mặt cầu R',[p.r||2.6,0,0],[1,0,0],1)
    ];
    default:return [];
  }
}
const FALLBACK_RANGES={
  angle:[-80,80],deg:[5,175],slant:[20,80],gap:[0,4],dist:[0,4.5],h:[1,6],shift:[-3,3],w:[2,6],len:[1.5,6],size:[2,6],
  a:[1,6],b:[0.8,5],r:[0.8,4.5],r1:[0.4,4],r2:[0.5,4.5],L:[3,10],cut:[0.2,2.4],slice:[0,1],
  x:[-4,4],y:[-4,4],z:[-4,4],x0:[-4,4],y0:[-4,4],z0:[-4,4],u1:[-4,4],u2:[-4,4],u3:[-4,4],A:[-4,4],B:[-4,4],C:[-4,4],D:[-6,6]
};
export function clampHandleValue(type,key,value){
  if(!Number.isFinite(value))return null;
  const range=TYPES[type]?.params?.[key];
  if(range)return Math.max(range[1],Math.min(range[2],Math.round(value*100)/100));
  const fb=FALLBACK_RANGES[key];
  if(fb)return Math.max(fb[0],Math.min(fb[1],Math.round(value*100)/100));
  return Math.round(value*100)/100;
}
