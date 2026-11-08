/**
 * Scenes in mathematical coordinates (not arbitrary triangle fallbacks).
 * No rendering dependencies: each supported 2D type has an explicit construction.
 * Polygons, lines, circles, arcs, and points are checked by node tests.
 */
const RAD = Math.PI / 180;
const sin = t => Math.sin(t * RAD);
const cos = t => Math.cos(t * RAD);
const round = n => Math.round(n * 1000) / 1000;
const plus = (a,b) => [a[0]+b[0],a[1]+b[1]];
const minus = (a,b) => [a[0]-b[0],a[1]-b[1]];
const mult = (a,k) => [a[0]*k,a[1]*k];
const mid = (a,b) => mult(plus(a,b),.5);
const length = a => Math.hypot(a[0],a[1]);
const nrm = a => length(a) > 1e-7 ? mult(a,1/length(a)) : [1,0];
const perp = a => [-a[1],a[0]];
const lerp = (a,b,k) => plus(a,mult(minus(b,a),k));
const polar = (r,t) => [r*cos(t),r*sin(t)];
const rot = (a,angle) => [a[0]*cos(angle)-a[1]*sin(angle),a[0]*sin(angle)+a[1]*cos(angle)];
const dist = (a,b) => length(minus(a,b));

export const GEOMETRY_2D_TYPES = Object.freeze([
  'polygonTiling','transform2d','unitCircleMotion','polygon','circle','triangle','rhombus','trapezoid','parallelogram','symmetryAxis','symmetryCenter',
  'segmentMidpoint','angles','parallelLines','triangleAngles','congruentTriangles','triangleCenters',
  'pythagoras','thales','midSegment','parallelogramMid','rectangleSquare','similarTriangles',
  'trigTriangle','circleTangent','circleInscribed','circumIncircle','cyclicQuad','triangleLaws',
  'vectorParallelogram','vectorDot','lineOxy','circleOxy','ellipse','hyperbola'
]);

export function buildGeometry2DScene(type,p={},grade=0) {
  const s={type,primitives:[],explanation:''};
  const add = (kind,props) => s.primitives.push({kind,...props});
  const polygon = (pts,opts={}) => add('polygon',{pts,...opts});
  const line = (a,b,opts={}) => add('line',{a,b,...opts});
  const circle = (center,r,opts={}) => add('circle',{center,r,...opts});
  const arc = (center,r,start,end,opts={}) => add('arc',{center,r,start,end,...opts});
  const point = (name,xy,opts={}) => add('point',{name,xy,...opts});
  const segment = (nameA,A,nameB,B,opts={}) => {line(A,B,opts);point(nameA,A);point(nameB,B);};
  const vertexPolygon = (names,pts,opts={}) => {polygon(pts,opts);pts.forEach((xy,i)=>point(names[i]??'',xy));};
  const triSides = (a,b,c) => { // BC = a, CA = b, AB = c
    const B=[-a/2,0], C=[a/2,0];
    const x=(c*c-b*b)/(2*a), y=Math.sqrt(Math.max(0,c*c-(x+a/2)**2));
    return {A:[x,y],B,C};
  };
  const triShape = ({A,B,C},opts) => vertexPolygon(['A','B','C'],[A,B,C],opts);
  const circlePts=(center,r,angles)=>angles.map(a=>plus(center,polar(r,a)));
  switch(type) {
    case 'polygonTiling':{
      const n=[3,4,6].includes(p.n)?p.n:6,side=p.side??1.2,rows=Math.round(p.rows??3);
      const palette=['#e0f4ef','#ffebd4','#e3e8ff'];
      if(n===4){
        for(let j=0;j<rows;j++)for(let i=0;i<rows;i++){
          const x=(i-rows/2)*side,y=(j-rows/2)*side;
          polygon([[x,y],[x+side,y],[x+side,y+side],[x,y+side]],{fill:palette[(i+j)%3]});
        }
      }else if(n===3){
        const h=Math.sqrt(3)*side/2;
        for(let j=0;j<rows;j++)for(let i=0;i<rows;i++){
          const x=(i-rows/2)*side+j*side/2,y=(j-rows/2)*h;
          const A=[x,y],B=[x+side,y],C=[x+side/2,y+h],D=[x+3*side/2,y+h];
          polygon([A,B,C],{fill:palette[(i+j)%3]});polygon([B,D,C],{fill:palette[(i+j+1)%3]});
        }
      }else{
        const h=Math.sqrt(3)*side;
        for(let j=0;j<rows;j++)for(let i=0;i<rows;i++){
          const cx=(i-(rows-1)/2)*1.5*side,cy=(j-(rows-1)/2+(i%2)*.5)*h;
          polygon(Array.from({length:6},(_,k)=>plus([cx,cy],polar(side,k*60))),{fill:palette[(i+j)%3]});
        }
      }
      s.explanation='Tổng góc tại một đỉnh chung phải bằng 360°. Tam giác đều, hình vuông và lục giác đều lát mặt phẳng không có khe hở.';
      break;
    }
    case 'transform2d':{
      const A=[-3,-1],B=[-1,-1],C=[-2.4,1.1],k=p.k??1,ang=p.deg??35;
      const t=pt=>plus(mult(rot(pt,ang),k),[p.dx??2,p.dy??1]);
      vertexPolygon(['A','B','C'],[A,B,C],{fill:'#d8f1ed'});
      vertexPolygon(["A′","B′","C′"],[t(A),t(B),t(C)],{fill:'#ffe3c3'});
      line(A,t(A),{dashed:true,color:'#b59ac5'});
      s.explanation='Ảnh được tạo bằng phép quay, vị tự tâm O và tịnh tiến; góc không đổi, độ dài nhân |k|, diện tích nhân k².';
      break;
    }
    case 'unitCircleMotion':{
      const deg=p.deg??60,amp=p.amp??1.5,theta=deg*RAD,center=[-4.2,0],r=1.7;
      circle(center,r,{color:'#277eae'});line([center[0]-r-.4,0],[center[0]+r+.4,0],{color:'#8eacba'});
      line([center[0],-r-.35],[center[0],r+.35],{color:'#8eacba'});
      const E=plus(center,[r*Math.cos(theta),r*Math.sin(theta)]);
      line(center,E,{color:'#eb9239'});line(E,[E[0],0],{dashed:true,color:'#eba24c'});
      point('O',center);point('M',E);
      line([0,0],[6.4,0],{color:'#86a8b9'});line([0,-2.2],[0,2.2],{color:'#86a8b9'});
      const pts=Array.from({length:181},(_,i)=>[6.2*i/180,amp*Math.sin(i*2*Math.PI/180)]);
      add('curve',{pts,color:'#168b7c'});
      const Q=[6.2*deg/360,amp*Math.sin(theta)];point('P',Q);line(Q,[Q[0],0],{dashed:true,color:'#d46c42'});
      s.explanation='Điểm M chạy trên đường tròn lượng giác; P trên đồ thị y=A sin(t). Góc tính theo độ, đồ thị trục t tương ứng 0–360°.';
      break;
    }
    case 'polygon': {
      const n=Math.round(p.n??6),r=p.r??2.6,pts=Array.from({length:n},(_,i)=>polar(r,-90+360*i/n));
      polygon(pts);circle([0,0],r,{dashed:true,color:'#c3ced9'});point('O',[0,0]);pts.forEach((pt,i)=>point(String.fromCharCode(65+i),pt));
      s.explanation=`Đa giác đều ${n} cạnh nội tiếp đường tròn bán kính ${r}.`;break;
    }
    case 'circle': {
      const r=p.r??3;circle([0,0],r,{fill:'#dff5f1'});segment('O',[0,0],'A',[r,0],{color:'#f59b40'});break;
    }
    case 'rhombus': {
      const a=(p.a??6)/2,b=(p.b??4)/2,A=[-a,0],B=[0,-b],C=[a,0],D=[0,b];
      vertexPolygon(['A','B','C','D'],[A,B,C,D]);line(A,C,{color:'#e38c33'});line(B,D,{color:'#a57bd2'});point('O',[0,0]);
      s.explanation='Hai đường chéo AC và BD vuông góc, cắt nhau tại trung điểm.';break;
    }
    case 'trapezoid': {
      const a=p.a??6,b=p.b??3,h=p.h??3;vertexPolygon(['A','B','C','D'],[[-a/2,-h/2],[a/2,-h/2],[b/2,h/2],[-b/2,h/2]]);
      line([-b/2,h/2],[-b/2,-h/2],{dashed:true,color:'#dc8743'});
      s.explanation='Hình thang cân với hai đáy song song, hai cạnh bên bằng nhau.';break;
    }
    case 'parallelogram':case 'parallelogramMid':case 'symmetryCenter': {
      const a=p.a??6,b=p.b??4,phi=type==='symmetryCenter'?(p.deg??60):type==='parallelogramMid'?(p.deg??60):Math.asin(Math.min(1,(p.h??3.5)/b))/RAD;
      const u=[a,0],w=polar(b,phi),A=mult(plus(u,w),-.5),B=plus(A,u),D=plus(A,w),C=plus(B,w);
      vertexPolygon(['A','B','C','D'],[A,B,C,D]);
      if(type!=='parallelogram') {line(A,C,{color:'#e88e3a'});line(B,D,{color:'#9477c0'});point('O',mid(A,C));}
      if(type==='parallelogram') {const H=[D[0],A[1]];line(D,H,{dashed:true,color:'#ec884e'});point('H',H);}
      s.explanation=type==='symmetryCenter'?'Phép quay 180° quanh O biến mỗi đỉnh thành đỉnh đối diện.':'Hai cặp cạnh đối song song và bằng nhau.';break;
    }
    case 'symmetryAxis': {
      const a=p.a??6,h=p.h??5,A=[0,h/2],B=[-a/2,-h/2],C=[a/2,-h/2];vertexPolygon(['A','B','C'],[A,B,C]);
      line([0,-h/2-1],[0,h/2+1],{dashed:true,color:'#e46b65'});point('H',[0,-h/2]);
      s.explanation='Trục đối xứng đi qua đỉnh A và trung điểm H của BC.';break;
    }
    case 'segmentMidpoint':{
      const a=(p.len??8)/2,A=[-a,0],B=[a,0];segment('A',A,'B',B);point('M',[0,0]);
      line([0,-.18],[0,.18],{color:'#e88e3a'});s.explanation='M là trung điểm AB nên MA = MB = AB/2.';break;
    }
    case 'angles':{
      const t=p.deg??65,rad=2.8,O=[0,0],A=[rad,0],B=polar(rad,t);segment('O',O,'A',A,{color:'#168dc1'});segment('O',O,'B',B,{color:'#e38d33'});arc(O,.85,0,t,{color:'#de8844'});
      if(t<180 && t>0){point(`${round(t)}°`,polar(1.4,t/2),{onlyLabel:true});}
      if(grade===7){
        const C=[-rad,0];segment('O',O,'C',C,{color:'#2a9f83'});
        arc(O,.92,t,180,{color:'#268c6d'});
        point(`${round(180-t)}°`,polar(1.5,(t+180)/2),{onlyLabel:true});
      }
      s.explanation=grade===7?'Hai góc AOB và BOC kề bù, OA và OC là hai tia đối nhau; tổng 180°.':'Số đo góc AOB; kéo tham số để quan sát góc nhọn, vuông và tù.';break;
    }
    case 'parallelLines':{
      const d=p.dist??3,ang=p.angle??65,m=Math.tan(ang*RAD);const y=d/2;
      line([-5,y],[5,y]);line([-5,-y],[5,-y]);
      const L=Math.max(5,1.6*d/Math.max(.1,Math.abs(Math.sin(ang*RAD))));
      const dx=L*Math.cos(ang*RAD),dy=L*Math.sin(ang*RAD);
      line([-dx,-dy],[dx,dy],{color:'#e68a31'});point('A',[y/m,y]);point('B',[-y/m,-y]);
      s.explanation=`Hai đường ngang song song; các góc so le trong bằng ${ang}°.`;break;
    }
    case 'triangle':case 'pythagoras':case 'trigTriangle':{
      let a,b;
      if(type==='trigTriangle'){b=p.b??4;a=Math.sqrt(Math.max(.01,(p.c??5)**2-b*b));}else{a=p.a??3;b=p.b??4;}
      const A=[-a/2,-b/3],B=[a/2,-b/3],C=[-a/2,2*b/3];vertexPolygon(['A','B','C'],[A,B,C]);
      line([A[0]+.32,A[1]],[A[0]+.32,A[1]+.32],{color:'#c86e38'});line([A[0]+.32,A[1]+.32],[A[0],A[1]+.32],{color:'#c86e38'});
      if(type==='pythagoras'){
        const u=minus(B,A),v=minus(C,A),w=minus(C,B);polygon([A,B,plus(B,rot(u,-90)),plus(A,rot(u,-90))],{fill:'#ffe2c3'});
        polygon([A,C,plus(C,rot(v,90)),plus(A,rot(v,90))],{fill:'#e0d5f7'});
        const ext=mult(perp(w),-1);polygon([B,C,plus(C,ext),plus(B,ext)],{fill:'#caeee8'});
      }
      s.explanation=type==='trigTriangle'?'Tỉ số lượng giác của góc B trong tam giác vuông tại A.':type==='pythagoras'?'Ba hình vuông dựng trên ba cạnh tam giác vuông; tổng hai diện tích nhỏ bằng diện tích lớn.':'Tam giác vuông tại A.';break;
    }
    case 'triangleAngles':{
      const Aangle=p.a??60,Bangle=p.b??70,Cangle=180-Aangle-Bangle, a=5.5;
      const len=a*sin(Cangle)/Math.max(.001,sin(Aangle)); const B=[-a/2,-1.2],C=[a/2,-1.2],A=plus(B,polar(len,Bangle));
      triShape({A,B,C});s.explanation=`∠A=${Aangle}°, ∠B=${Bangle}°, ∠C=${round(Cangle)}°; tổng 180°.`;break;
    }
    case 'congruentTriangles':{
      const a=p.a??4,b=p.b??5,t=p.deg??60;
      const A=[-5,-1],B=plus(A,[a,0]),C=plus(A,polar(b,t));
      const tx=5.4, ty=-.2,D=[tx,ty],E=plus(D,[a,0]),F=plus(D,polar(b,t));
      vertexPolygon(['A','B','C'],[A,B,C],{fill:'#d8eefa'});
      vertexPolygon(["A′","B′","C′"],[D,E,F],{fill:'#f7e7ce'});
      s.explanation='Hai tam giác có hai cạnh và góc xen giữa tương ứng bằng nhau.';break;
    }
    case 'triangleCenters':case 'triangleLaws':case 'circumIncircle':{
      const {A,B,C}=triSides(p.a??6,p.b??5,p.c??5.5);triShape({A,B,C});
      if(type==='triangleCenters'){
        for(const [X,Y] of [[A,mid(B,C)],[B,mid(A,C)],[C,mid(A,B)]])line(X,Y,{color:'#e6973c'});
        const G=mult(plus(plus(A,B),C),1/3);point('G',G);s.explanation='Ba đường trung tuyến đồng quy tại G; AG/GM=2.';
      }
      if(type==='circumIncircle'){
        const D=2*(A[0]*(B[1]-C[1])+B[0]*(C[1]-A[1])+C[0]*(A[1]-B[1]));
        if(Math.abs(D)>1e-8){const sq=q=>q[0]*q[0]+q[1]*q[1];const O=[(sq(A)*(B[1]-C[1])+sq(B)*(C[1]-A[1])+sq(C)*(A[1]-B[1]))/D,(sq(A)*(C[0]-B[0])+sq(B)*(A[0]-C[0])+sq(C)*(B[0]-A[0]))/D];circle(O,dist(O,A),{color:'#358cba'});point('O',O);}
        const a=dist(B,C),b=dist(C,A),c=dist(A,B),P=a+b+c,I=mult(plus(plus(mult(A,a),mult(B,b)),mult(C,c)),1/P);
        const s2=Math.abs((B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0]))/2;
        circle(I,2*s2/P,{color:'#ed9544'});point('I',I);s.explanation='Đường tròn ngoại tiếp qua A,B,C; đường tròn nội tiếp tiếp xúc ba cạnh.';
      }
      if(type==='triangleLaws')s.explanation='Định lí Côsin và Định lí Sin áp dụng trên các cạnh a=BC, b=CA, c=AB.';
      break;
    }
    case 'thales':{
      const A=[0,2.3],B=[-2.4,-1.5],C=[3,-1.5],k=(p.k??50)/100;
      triShape({A,B,C});const M=lerp(A,B,k),N=lerp(A,C,k);segment('M',M,'N',N,{color:'#e38e3c'});
      s.explanation=`AM/AB = AN/AC = ${round(k)}, MN // BC.`;break;
    }
    case 'midSegment':{
      const a=p.a??6,h=p.h??5,A=[0,h/2],B=[-a/2,-h/2],C=[a/2,-h/2];triShape({A,B,C});const M=mid(A,B),N=mid(A,C);segment('M',M,'N',N,{color:'#e38e3c'});break;
    }
    case 'rectangleSquare':{
      const a=p.a??5,b=p.b??3;vertexPolygon(['A','B','C','D'],[[-a/2,-b/2],[a/2,-b/2],[a/2,b/2],[-a/2,b/2]]);
      line([-a/2,-b/2],[a/2,b/2],{dashed:true,color:'#db8a45'});s.explanation=a===b?'Hình vuông: bốn cạnh bằng nhau, bốn góc vuông.':'Hình chữ nhật: bốn góc vuông; hai đường chéo bằng nhau.';break;
    }
    case 'similarTriangles':{
      const a=p.a??5,k=p.k??.6;
      const A=[-3,-1.4],B=plus(A,[a,0]),C=plus(A,[a*.32,a*.75]);triShape({A,B,C});
      const o=[3.5,-1.4],sA=o,sB=plus(o,[a*k,0]),sC=plus(o,[a*.32*k,a*.75*k]);vertexPolygon(['A′','B′','C′'],[sA,sB,sC],{fill:'#f9e4ce'});
      s.explanation=`Hai tam giác đồng dạng theo tỉ số k=${k}; tỉ số diện tích k²=${round(k*k)}.`;break;
    }
    case 'circleTangent':{
      const r=p.r??3,d=p.d??3;circle([0,0],r);line([-5,d],[5,d],{color:'#e38c33'});segment('O',[0,0],'H',[0,d],{dashed:true,color:'#e38c33'});
      s.explanation=d===r?'Đường thẳng tiếp xúc đường tròn tại H.':d<r?'Đường thẳng cắt đường tròn tại hai điểm.':'Đường thẳng ở ngoài đường tròn.';break;
    }
    case 'circleInscribed':{
      const r=p.r??3,theta=p.deg??80,O=[0,0],A=polar(r,-theta/2),B=polar(r,theta/2),M=polar(r,180);
      circle(O,r);line(O,A);line(O,B);line(M,A,{color:'#e28a3d'});line(M,B,{color:'#e28a3d'});
      point('O',O);point('A',A);point('B',B);point('M',M);
      arc(O,r*.45,-theta/2,theta/2,{color:'#df934e'});
      s.explanation=`∠AOB=${theta}°, góc nội tiếp ∠AMB=${round(theta/2)}°.`;break;
    }
    case 'cyclicQuad':{
      const r=p.r??3,alpha=p.a1??45;const A=polar(r,180+alpha),B=polar(r,0),C=polar(r,alpha),D=polar(r,2*alpha);
      circle([0,0],r,{color:'#568fb3'});vertexPolygon(['A','B','C','D'],[A,B,C,D],{fill:'#e1f2eb'});
      s.explanation=`∠A=${alpha}°, ∠C=${round(180-alpha)}°. Hai góc đối của tứ giác nội tiếp bù nhau.`;break;
    }
    case 'vectorParallelogram':{
      const O=[0,0],u=[p.ux??3,p.uy??1],v=[p.vx??1,p.vy??3],w=plus(u,v);
      line(O,u,{color:'#218bc4',arrow:true});line(O,v,{color:'#eb9239',arrow:true});
      line(u,w,{dashed:true,color:'#93a6b8'});line(v,w,{dashed:true,color:'#93a6b8'});line(O,w,{color:'#278b6f',arrow:true});
      point('O',O);point('u',u);point('v',v);point('u+v',w);s.explanation='Đường chéo hình bình hành biểu diễn vectơ tổng u+v.';break;
    }
    case 'vectorDot':{
      const O=[0,0],u=[p.ulen??4,0],v=polar(p.vlen??3,p.deg??60);
      line(O,u,{color:'#208bc1',arrow:true});line(O,v,{color:'#e78e35',arrow:true});point('O',O);point('u',u);point('v',v);arc(O,.8,0,p.deg??60);
      s.explanation=`u·v=|u|·|v| cos(${p.deg??60}°).`;break;
    }
    case 'lineOxy':{
      const a=p.a??2,b=p.b??1,c=p.c??-4;
      if(Math.hypot(a,b)<1e-8)throw Error('Đường thẳng cần vectơ pháp tuyến khác 0.');
      const P=mult([a,b],-c/(a*a+b*b)); const d=nrm([-b,a]);
      line(plus(P,mult(d,-8)),plus(P,mult(d,8)));line(P,plus(P,mult([a,b],.8)),{color:'#e9983a',arrow:true});point('H',P);point('O',[0,0]);
      s.explanation=`Đường thẳng ${a}x+${b}y+(${c})=0; vectơ pháp tuyến n=(${a};${b}).`;break;
    }
    case 'circleOxy':{
      const O=[p.a??1,p.b??2],r=p.r??3;circle(O,r,{fill:'#e3f5ef'});segment('I',O,'A',[O[0]+r,O[1]],{color:'#e68a32'});break;
    }
    case 'ellipse':{
      const a=p.a??4,b=p.b??2;add('ellipse',{center:[0,0],a,b});const c=Math.sqrt(Math.max(0,a*a-b*b));point('F₁',[-c,0]);point('F₂',[c,0]);
      s.explanation='Tổng khoảng cách từ mỗi điểm trên elip đến hai tiêu điểm bằng 2a.';break;
    }
    case 'hyperbola':{
      const a=p.a??2,b=p.b??1.5;for(const sign of [-1,1])add('curve',{pts:Array.from({length:121},(_,i)=>{const t=-2.0+i*4/120;return [sign*a*Math.cosh(t),b*Math.sinh(t)];})});
      line([-9,-9*b/a],[9,9*b/a],{dashed:true,color:'#b888c2'});line([-9,9*b/a],[9,-9*b/a],{dashed:true,color:'#b888c2'});
      point('F₁',[-Math.hypot(a,b),0]);point('F₂',[Math.hypot(a,b),0]);
      s.explanation='Hypebol x²/a² − y²/b² = 1, có hai đường tiệm cận y=±(b/a)x.';break;
    }
    default: throw Error(`Chưa có quy tắc vẽ đúng cho loại hình phẳng ${type}`);
  }
  // Reject geometry producing NaNs; a test verifies all catalog entries and parameter extremes.
  for (const obj of s.primitives) {
    const coords = [obj.xy,obj.center,obj.a,obj.b,...(obj.pts||[])].filter(Array.isArray);
    if(coords.some(x => x.some(v => !Number.isFinite(v))) || !Number.isFinite(obj.r??0)) throw Error(`Dữ liệu hình học không hợp lệ: ${type}`);
  }
  return s;
}
