/** Grade-facing corridor gallery: 14 original mathematical drawings, no SGK images copied. */
export const WALL_MODELS = Object.freeze([
  {id:'g6-regular', grade:6, title:'Lục giác đều', caption:'6 cạnh và 6 góc bằng nhau', kind:'hexagon', modeId:'toan6-luc-giac-deu', formula:'P=6a', detail:'Quan sát lục giác đều được tạo từ sáu tam giác đều. Khi thay đổi bán kính, độ dài cạnh và chu vi thay đổi tương ứng.'},
  {id:'g6-symmetry', grade:6, title:'Trục đối xứng', caption:'Phép phản chiếu qua trục', kind:'symmetry', modeId:'toan6-doi-xung-truc', formula:'\\operatorname{dist}(A,d)=\\operatorname{dist}(A^{\\prime},d)', detail:'Kéo điểm A qua hai phía trục. Ảnh đối xứng của A luôn ở phía bên kia và cách trục một khoảng bằng khoảng cách từ A đến trục.'},
  {id:'g7-angles', grade:7, title:'Tổng góc tam giác', caption:'Tổng ba góc bằng 180°', kind:'triangle', modeId:'7-03-C01', formula:'\\widehat A+\\widehat B+\\widehat C=180^{\\circ}', detail:'Di chuyển một đỉnh của tam giác. Các góc thay đổi nhưng tổng số đo ba góc không đổi và bằng 180°.'},
  {id:'g7-parallel', grade:7, title:'Đường thẳng song song', caption:'Góc đồng vị, so le trong', kind:'parallel', modeId:'7-02-C05', formula:'a\\parallel b\\Rightarrow\\alpha=\\beta', detail:'Trượt cát tuyến qua hai đường song song để quan sát các cặp góc đồng vị và so le trong có số đo bằng nhau.'},
  {id:'g8-thales', grade:8, title:'Định lí Thalès', caption:'Tỉ số trên hai cạnh tam giác', kind:'thales', modeId:'8-03-C01', formula:'\\frac{AM}{AB}=\\frac{AN}{AC}', detail:'Di chuyển đoạn MN nhưng luôn giữ MN song song BC. Quan sát hai tỉ số tương ứng luôn bằng nhau.'},
  {id:'g8-pythagoras', grade:8, title:'Định lí Pythagore', caption:'Diện tích ba hình vuông', kind:'pythagoras', modeId:'8-05-C01', formula:'a^2+b^2=c^2', detail:'Quan sát ba hình vuông dựng trên các cạnh tam giác vuông. Hai diện tích nhỏ cộng lại bằng diện tích lớn.'},
  {id:'g9-tangent', grade:9, title:'Tiếp tuyến đường tròn', caption:'Bán kính vuông góc tiếp tuyến', kind:'tangent', modeId:'9-06-C02', formula:'OT\\perp t', detail:'Di chuyển điểm tiếp xúc T trên đường tròn. Đường tiếp tuyến tại T luôn vuông góc với bán kính OT.'},
  {id:'g9-parabola', grade:9, title:'Đồ thị parabol', caption:'Hàm số y=ax²', kind:'parabola', modeId:'9-08-C01', formula:'y=ax^2\\ (a\\ne0)', detail:'Thay đổi hệ số a và quan sát độ mở, chiều hướng và trục đối xứng của parabol.'},
  {id:'g10-vector', grade:10, title:'Tổng hai vectơ', caption:'Quy tắc ba điểm', kind:'vector', modeId:'10-04-C01', formula:'\\vec{AC}=\\vec{AB}+\\vec{BC}', detail:'Di chuyển các vectơ AB và BC; vectơ AC biểu diễn chính xác tổng của hai vectơ đó.'},
  {id:'g10-ellipse', grade:10, title:'Đường elip', caption:'Tổng khoảng cách đến hai tiêu điểm', kind:'ellipse', modeId:'10-09-C01', formula:'MF_1+MF_2=2a', detail:'Di chuyển điểm M trên elip. Tổng MF1 + MF2 luôn không đổi và bằng 2a.'},
  {id:'g11-circle', grade:11, title:'Đường tròn lượng giác', caption:'Sin và cos theo góc quay', kind:'trig', modeId:'11-01-C02', formula:'\\sin^2x+\\cos^2x=1', detail:'Quay bán kính OM trên đường tròn đơn vị; hoành độ và tung độ của M lần lượt là cos và sin.'},
  {id:'g11-space', grade:11, title:'Hình học không gian', caption:'Đường thẳng song song mặt phẳng', kind:'plane', modeId:'11-05-C01', formula:'d\\parallel(P)', detail:'Quan sát đường thẳng d không nằm trong và không cắt mặt phẳng (P). Mô hình tường là hình chiếu 2D.'},
  {id:'g12-derivative', grade:12, title:'Đạo hàm và cực trị', caption:'Tiếp tuyến thay đổi', kind:'derivative', modeId:'12-01-C02', formula:'f\\prime(x)=0', detail:'Cho M chạy trên đồ thị. Hệ số góc tiếp tuyến là đạo hàm; tại điểm cực trị trơn của hàm, đạo hàm bằng 0.'},
  {id:'g12-integral', grade:12, title:'Tích phân xác định', caption:'Xấp xỉ diện tích bằng hình chữ nhật', kind:'integral', modeId:'12-06-C02', formula:'S=\\int_a^b f(x)\\,dx\\ (f\\ge0)', detail:'Chia miền phẳng dưới đồ thị thành nhiều hình chữ nhật; tăng số chia để quan sát tổng Riemann tiến gần diện tích.'}
]);
export const WALL_BY_ID = new Map(WALL_MODELS.map(m=>[m.id,m]));
function ln(ctx,x,y,X,Y,color='#6bcde5',w=3){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(X,Y);ctx.stroke();}
function dot(ctx,x,y,name='',color='#ffd27a'){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();if(name){ctx.font='16px Arial';ctx.fillStyle='#fff';ctx.fillText(name,x+8,y-8);}}
function pl(ctx,pts,stroke='#64d8d9',fill=null){ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.stroke();}
function words(ctx,v,x,y,size=18,color='#e9f5ff'){ctx.fillStyle=color;ctx.font=`${size}px Arial`;ctx.fillText(v,x,y);}
function graph(ctx,fn,lo,hi,xmin=72,xmax=660,ymid=200,scaleX=68,scaleY=57){
  ctx.beginPath();for(let i=0;i<=125;i++){const x=lo+(hi-lo)*i/125;const px=(xmin+xmax)/2+x*scaleX,py=ymid-fn(x)*scaleY;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.strokeStyle='#62f2cf';ctx.lineWidth=4;ctx.stroke();
}
function drawIdea(c,m,t){const k=m.kind;let cx=350,cy=205;const motion=Math.sin(t*.8);
  if(k==='hexagon'){const r=110+10*motion;const p=Array.from({length:6},(_,i)=>[cx+Math.cos(Math.PI*i/3)*r,cy+Math.sin(Math.PI*i/3)*r]);pl(c,p,'#ffe088','#16496088');p.forEach((v,i)=>dot(c,v[0],v[1],String(i+1)));ln(c,cx-r,cy,cx+r,cy,'#bdaafa',2);}
  else if(k==='symmetry'){ln(c,cx,70,cx,310,'#f8dc8d',3);const x=230+motion*35,y=125;dot(c,x,y,'A');dot(c,2*cx-x,y,"A'");ln(c,x,y,2*cx-x,y,'#ddd0ff',2);words(c,'d',cx+10,83);}
  else if(k==='triangle'){const a=[320,74],b=[130+motion*14,291],d=[540,291];pl(c,[a,b,d]);dot(c,...a,'A');dot(c,...b,'B');dot(c,...d,'C');words(c,'A + B + C = 180',225,338);}
  else if(k==='parallel'){ln(c,120,120,590,120);ln(c,120,255,590,255);ln(c,220+motion*50,45,470+motion*50,332,'#ffcd84',4);words(c,'a // b',530,86);}
  else if(k==='thales'){const A=[345,68],B=[140,300],C=[545,300],f=.48+.12*motion;const M=[A[0]+f*(B[0]-A[0]),A[1]+f*(B[1]-A[1])],N=[A[0]+f*(C[0]-A[0]),A[1]+f*(C[1]-A[1])];pl(c,[A,B,C]);ln(c,...M,...N,'#ffd27a',5);dot(c,...A,'A');dot(c,...B,'B');dot(c,...C,'C');dot(c,...M,'M');dot(c,...N,'N');}
  else if(k==='pythagoras'){const A=[260,235],B=[260,135],C=[380,235];pl(c,[[160,135],[260,135],[260,235],[160,235]],'#baabff','#bda3fe44');pl(c,[[260,235],[380,235],[380,355],[260,355]],'#6df2e0','#8de4cc33');pl(c,[[260,135],[380,235],[480,115],[360,15]],'#ffd185','#ffd18533');pl(c,[A,B,C]);words(c,'a²+b²=c²',505,90,24);}
  else if(k==='tangent'){const X=350,Y=196,R=95; c.strokeStyle='#62dbe7';c.lineWidth=4;c.beginPath();c.arc(X,Y,R,0,Math.PI*2);c.stroke();const q=Math.PI*.18+motion*.35;const px=X+R*Math.cos(q),py=Y+R*Math.sin(q);ln(c,X,Y,px,py,'#c5c0fa');ln(c,px-130*Math.sin(q),py+130*Math.cos(q),px+130*Math.sin(q),py-130*Math.cos(q),'#ffcf86',4);dot(c,X,Y,'O');dot(c,px,py,'T');}
  else if(k==='parabola'){ln(c,90,285,610,285,'#a5c9d9',2);ln(c,350,34,350,340,'#a5c9d9',2);graph(c,x=>1.0*Math.max(.35,1+.5*motion)*x*x,-2.4,2.4,90,610,285,86,33);words(c,'y = a x²',440,70);}
  else if(k==='vector'){const P=[200,240],U=[345,140],V=[490+25*motion,245];ln(c,...P,...U,'#65e3ef',5);ln(c,...U,...V,'#fdce80',5);ln(c,...P,...V,'#aa9dfc',5);ln(c,...P,V[0],V[1], '#bcb9fa',2);dot(c,...P,'A');dot(c,...U,'B');dot(c,...V,'C');}
  else if(k==='ellipse'){const a=186,b=110,d=Math.sqrt(a*a-b*b),q=.53+motion*.52;const M=[cx+a*Math.cos(q),cy+b*Math.sin(q)];c.strokeStyle='#62dfda';c.lineWidth=4;c.beginPath();c.ellipse(cx,cy,a,b,0,0,Math.PI*2);c.stroke();dot(c,cx-d,cy,'F1');dot(c,cx+d,cy,'F2');dot(c,...M,'M');ln(c,cx-d,cy,...M,'#f3cc83');ln(c,cx+d,cy,...M,'#c6a4ff');}
  else if(k==='trig'){const r=125,a=1.2+motion*.7;c.strokeStyle='#86deea';c.lineWidth=4;c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.stroke();ln(c,cx-175,cy,cx+175,cy,'#d9dee5',2);ln(c,cx,cy-155,cx,cy+155,'#d9dee5',2);const M=[cx+r*Math.cos(a),cy-r*Math.sin(a)];ln(c,cx,cy,...M,'#ffcc85',4);ln(c,...M,M[0],cy,'#cda6fb',2);dot(c,...M,'M');words(c,'cos x',M[0]-45,cy+28);words(c,'sin x',M[0]+12,cy-r*.35);}
  else if(k==='plane'){pl(c,[[160,222],[450,222],[570,310],[282,310]],'#68d8df','#448ebf55');ln(c,230,130,450,130,'#ffe082',5);words(c,'d',455,132);words(c,'(P)',380,282);}
  else if(k==='derivative'){ln(c,100,273,610,273,'#9ccbd9',2);ln(c,350,40,350,328,'#9ccbd9',2);graph(c,x=>1.6-(x-1)**2,-2.7,3.0,100,610,273,75,49);const x=1+motion*.8,px=355+x*75,py=273-(1.6-(x-1)**2)*49,slope=-2*(x-1);ln(c,px-100,py+100*slope*49/75,px+100,py-100*slope*49/75,'#f9ca87',3);dot(c,px,py,'M');}
  else if(k==='integral'){ln(c,95,303,625,303,'#9cbcd2',2);const n=6+Math.round(10*(1+motion)/2),a=-2.5,b=2.5,sx=66;const f=x=>.25*x*x+1.2;for(let i=0;i<n;i++){const x=a+(b-a)*i/n,x2=a+(b-a)*(i+1)/n;const y=303-f(x)*48;c.fillStyle='#75d2d066';c.fillRect(cx+x*sx,y,(x2-x)*sx,303-y);c.strokeStyle='#63cbbf';c.strokeRect(cx+x*sx,y,(x2-x)*sx,303-y);}graph(c,f,a,b,92,608,303,sx,48);words(c,'S = integral f(x) dx',430,66,16);}
}
export function drawPanel(canvas,model,t=0){const c=canvas.getContext('2d');const W=canvas.width,H=canvas.height;
  const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#0b2638');g.addColorStop(1,'#102b42');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.strokeStyle='#2b7887';c.lineWidth=2;for(let x=20;x<W;x+=46){ln(c,x,38,x,H-42,'#1d455755',1);}for(let y=40;y<H;y+=46)ln(c,20,y,W-20,y,'#1d455755',1);
  c.fillStyle='#f3e0aa';c.font='bold 26px Arial';c.fillText('TOÁN '+model.grade+'   /   '+model.title.toUpperCase(),28,38);
  drawIdea(c,model,t);
  c.fillStyle='#e4f5ff';c.font='20px Arial';c.fillText(model.caption,30,H-15);
  c.strokeStyle='#d0ad66';c.lineWidth=6;c.strokeRect(3,3,W-6,H-6);
}
export function mountHallwayBoards(THREE,building,rooms){
  const group=new THREE.Group();group.name='MATHVERSE WALL MATH 2D (14)';building.add(group);
  const frames=[],targets=[];const outline=new THREE.MeshStandardMaterial({color:0xb89459,metalness:.48,roughness:.43});
  for(const m of WALL_MODELS){const room=rooms[m.grade];if(!room)continue;const left=m.id===WALL_MODELS.find(x=>x.grade===m.grade)?.id;const sign=new THREE.Group();
    sign.name=`Hallway 2D Grade ${m.grade} ${m.id}`;sign.userData.mathExhibitionAction={type:'wall',id:m.id};
    sign.position.set(room.x+(left?-10.1:10.1),3.6,room.zSide*7.73);sign.rotation.y=room.zSide===1?Math.PI:0;
    const back=new THREE.Mesh(new THREE.BoxGeometry(9.8,4.9,.12),outline);
    const c=document.createElement('canvas');c.width=720;c.height=370;drawPanel(c,m,.1);
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
    const fMat=new THREE.MeshBasicMaterial({map:tex,side:THREE.FrontSide});
    const front=new THREE.Mesh(new THREE.PlaneGeometry(9.45,4.6),fMat);front.position.z=.09;
    const backFace=new THREE.Mesh(front.geometry,fMat);backFace.position.z=-.09;backFace.rotation.y=Math.PI;
    sign.add(back,front,backFace);group.add(sign);frames.push({sign,tex,c,model:m,last:0});targets.push(sign);
  }
  let cursor=0;
  function animateNearby(x,z,time){if(time-(animateNearby.last||0)<230)return;animateNearby.last=time;
    for(let n=0;n<3;n++){const item=frames[cursor++%frames.length];if(!item)break;
      if(Math.hypot(item.sign.position.x-x,item.sign.position.z-z)>22)continue;
      drawPanel(item.c,item.model,time*.001);item.tex.needsUpdate=true;
    }
  }
  function destroy(){for(const f of frames){f.tex.dispose();}}
  return {group,targets,animateNearby,destroy,count:frames.length};
}
