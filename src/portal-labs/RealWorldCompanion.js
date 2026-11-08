/** V14: small real-world simulation next to mathematically editable base object.
 * The main 3D/2D model stays interactive; this canvas is a 2.5D schematic with live parameters.
 */
const fmt=n=>Number.isFinite(Number(n))?Number(Number(n).toFixed(2)).toLocaleString('vi-VN'):'—';
const inferCategory=model=>{
  const t=String(model?.type||''),id=String(model?.sourceExhibitId||model?.id||'');
  const title=String(model?.title||'').toLocaleLowerCase('vi');
  if(['cylinder','cone','sphere','oxyzSphere','sphereSection','revolvedSolid'].includes(t))return ({cylinder:'can',cone:'hat',sphere:'ball',oxyzSphere:'ball',sphereSection:'ball',revolvedSolid:'vase'})[t];
  if(t==='pythagoras'||id.includes('g8_03')||title.includes('cầu thang')||title.includes('cau thang')||title.includes('dốc'))return 'stairs';
  if(t==='ellipse'||id.includes('g10_08')||title.includes('quỹ đạo')||title.includes('quy dao')||title.includes('elip'))return 'orbit';
  if(t==='circleOxy'||id.includes('g10_07')||title.includes('bánh xe')||title.includes('banh xe'))return 'wheel';
  if(t==='lineParallelPlane'||id.includes('g11_03')||title.includes('đường ray')||title.includes('duong ray'))return 'rails';
  if(title.includes('lát')||title.includes('lat ')||title.includes('gạch')||title.includes('hoa văn')||title.includes('hoa van')||id.includes('g6_03')||id.includes('g6_06'))return 'tiles';
  if(title.includes('mái')||title.includes('mai ')||title.includes('lều')||title.includes('leu ')||['trapezoid','triPrism','squarePyramid','frustumPyramid'].includes(t)||['g6_07','g7_01','g8_01','g11_09'].some(k=>id.includes(k)))return 'roof';
  if(t.includes('prism')||['cube','cuboid','squarePyramid','trianglePyramid'].includes(t)||id.includes('g7_02'))return 'gift';
  return 'geometry';
};
export class RealWorldCompanion{
  constructor(model){this.model=model||{};this.category=inferCategory(this.model);this.progress=0;this.scale=1;this.canvas=null;}
  mount(container){this.container=container;const canvas=document.createElement('canvas');canvas.width=480;canvas.height=245;
    canvas.className='mv14-real-canvas';canvas.setAttribute('aria-label','Mô phỏng ứng dụng thực tế 2D minh họa');container.append(canvas);this.canvas=canvas;this.draw();}
  setProgress(p){this.progress=Math.min(1,Math.max(0,Number(p)||0));this.draw();}
  setScale(s){this.scale=Math.min(1.7,Math.max(.65,Number(s)||1));this.draw();}
  updateParams(params){if(params&&typeof params==='object'){this.model={...this.model,params:{...(this.model?.params||{}),...params}};this.draw();}}
  draw(){const cv=this.canvas;if(!cv)return;const c=cv.getContext('2d'),w=cv.width,h=cv.height,p=this.progress;
    const mp=this.model?.params||{};
    c.clearRect(0,0,w,h);
    const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#faffff');g.addColorStop(1,'#deedf5');c.fillStyle=g;c.fillRect(0,0,w,h);
    c.strokeStyle='#cfdae5';c.lineWidth=1.5;c.beginPath();c.moveTo(10,192);c.lineTo(w-10,192);c.stroke();
    let formulaLine='',takeawayLine='';
    const stageLabel=p<0.2?'Bước 1 (0%): Khung/trục cơ sở':p<0.45?'Bước 2 (25%): Dựng kích thước chính':p<0.7?'Bước 3 (50%): Dựng mặt/khối hình học':p<0.92?'Bước 4 (75%): Đường cao/thiết diện':'Bước 5 (100%): Kiểm chứng công thức';
    c.save();c.translate(240,116);c.scale(this.scale,this.scale);
    switch(this.category){
      case 'can':{
        const rVal=Number(mp.r)||2,hVal=Number(mp.h)||4.5,vol=Math.PI*rVal*rVal*hVal,stp=2*Math.PI*rVal*(rVal+hVal);
        const hGrow=Math.max(0.18,Math.min(1,p<0.05?0.18:p));
        const topY=60-122*hGrow;
        c.beginPath();c.ellipse(0,60,62,16,0,0,Math.PI*2);c.fillStyle='rgba(29,78,216,0.16)';c.fill();c.strokeStyle='#1D4ED8';c.lineWidth=2.2;c.stroke();
        if(p>=0.2){
          c.fillStyle='rgba(29,78,216,0.22)';c.fillRect(-62,topY,124,60-topY);
          c.strokeStyle='#1D4ED8';c.lineWidth=2.5;c.strokeRect(-62,topY,124,60-topY);
          c.beginPath();c.ellipse(0,topY,62,18,0,0,Math.PI*2);c.fillStyle='#DBEAFE';c.fill();c.stroke();
        }
        if(p>=0.45){
          const fillFrac=Math.min(1,(p-0.2)/0.8);
          c.save();c.beginPath();c.rect(-59,60-118*fillFrac,118,118*fillFrac);c.clip();c.fillStyle='rgba(180,83,9,0.34)';c.fillRect(-60,-60,120,124);c.restore();
        }
        c.strokeStyle='#1D4ED8';c.lineWidth=2.2;c.beginPath();c.moveTo(0,topY);c.lineTo(62,topY);c.stroke();
        if(p>=0.65){
          c.strokeStyle='#6D28D9';c.setLineDash([4,3]);c.beginPath();c.moveTo(0,topY);c.lineTo(0,60);c.lineTo(62,60);c.stroke();c.setLineDash([]);
          c.strokeRect(0,51,9,9);
        }
        c.fillStyle='#1D4ED8';c.font='bold 12px system-ui';c.textAlign='center';c.fillText(`r = ${fmt(rVal)}`,31,topY-6);
        c.fillStyle='#B45309';c.textAlign='left';c.fillText(`h = ${fmt(hVal)}`,68,4);
        c.fillStyle='#6D28D9';c.font='bold 13px system-ui';c.textAlign='center';c.fillText(`Tiến trình dựng: ${Math.round(p*100)}%`,0,14);
        formulaLine=`Tương quan: r = ${fmt(rVal)}, h = ${fmt(hVal)} ⇒ V = πr²h ≈ ${fmt(vol)} đv³ · S_tp ≈ ${fmt(stp)} đv²`;
        takeawayLine='Kết luận: Tăng bán kính r gấp k lần làm dung tích hình trụ tăng gấp k² lần.';
        break;}
      case 'ball':{
        const rVal=Number(mp.r)||2.8,dVal=Number(mp.d)||1.0,vol=(4/3)*Math.PI*rVal**3,area=4*Math.PI*rVal**2;
        const y=4,r=55,sweep=Math.max(0.22,p)*Math.PI*2;
        c.beginPath();c.ellipse(0,68,58,11,0,0,Math.PI*2);c.fillStyle='#cbd5e1';c.fill();
        if(p>=0.45){
          const grad=c.createRadialGradient(-18,y-20,1,0,y,r);grad.addColorStop(0,'#eff6ff');grad.addColorStop(.55,'#93c5fd');grad.addColorStop(1,'#1D4ED8');
          c.beginPath();c.arc(0,y,r,0,sweep);c.fillStyle=grad;c.fill();
        }
        c.beginPath();c.arc(0,y,r,0,sweep);c.lineWidth=2.5;c.strokeStyle='#1D4ED8';c.stroke();
        if(p>=0.25){
          c.strokeStyle='#B45309';c.setLineDash([4,3]);c.beginPath();c.ellipse(0,y,r,15,0,0,sweep);c.stroke();c.setLineDash([]);
        }
        if(p>=0.7){
          c.strokeStyle='#6D28D9';c.setLineDash([3,3]);c.beginPath();c.ellipse(0,y,16,r,0,0,Math.PI*2);c.stroke();c.setLineDash([]);
        }
        c.fillStyle='#6D28D9';c.beginPath();c.arc(0,y,4,0,Math.PI*2);c.fill();
        c.strokeStyle='#B45309';c.lineWidth=2.4;c.beginPath();c.moveTo(0,y);c.lineTo(r,y);c.stroke();
        c.font='bold 12px system-ui';c.textAlign='center';c.fillStyle='#6D28D9';c.fillText('O',-10,y+4);
        c.fillStyle='#B45309';c.fillText(`R = ${fmt(rVal)}`,r/2,y-7);
        formulaLine=`Tương quan: R = ${fmt(rVal)}${mp.d!==undefined?`, d = ${fmt(dVal)}`:''} ⇒ S = 4πR² ≈ ${fmt(area)} · V = (4/3)πR³ ≈ ${fmt(vol)}`;
        takeawayLine='Kết luận: Mọi điểm trên mặt cầu cách tâm O một khoảng không đổi bằng R.';
        break;}
      case 'hat':{
        const rVal=Number(mp.r)||2.4,hVal=Number(mp.h)||4.5,lVal=Math.hypot(rVal,hVal),sxq=Math.PI*rVal*lVal,vol=(1/3)*Math.PI*rVal*rVal*hVal;
        const apexY=58-134*Math.max(0.15,p);
        c.beginPath();c.ellipse(0,58,76,16,0,0,Math.PI*2);c.fillStyle='rgba(29,78,216,0.16)';c.fill();c.strokeStyle='#1D4ED8';c.lineWidth=2.2;c.stroke();
        if(p>=0.2){
          c.strokeStyle='#6D28D9';c.lineWidth=2.2;c.setLineDash([4,3]);c.beginPath();c.moveTo(0,apexY);c.lineTo(0,58);c.lineTo(76,58);c.stroke();c.setLineDash([]);
          c.strokeRect(0,49,9,9);
        }
        if(p>=0.45){
          c.fillStyle='rgba(180,83,9,0.24)';c.strokeStyle='#B45309';c.lineWidth=2.5;
          c.beginPath();c.moveTo(0,apexY);c.lineTo(-76,58);c.lineTo(76,58);c.closePath();
          if(p>=0.7)c.fill();
          c.stroke();
        }
        c.fillStyle='#6D28D9';c.font='bold 11.5px system-ui';c.fillText('S',-4,apexY-6);c.fillText('O',-13,56);c.fillText('A',80,62);
        c.fillStyle='#6D28D9';c.fillText(`h=${fmt(hVal)}`,6,(apexY+58)/2);
        c.fillStyle='#1D4ED8';c.fillText(`r=${fmt(rVal)}`,28,54);
        if(p>=0.45){c.fillStyle='#B45309';c.fillText(`l=${fmt(lVal)}`,42,(apexY+58)/2-6);}
        formulaLine=`Tương quan: l = √(r²+h²) ≈ ${fmt(lVal)} · S_xq = πrl ≈ ${fmt(sxq)} · V = ⅓πr²h ≈ ${fmt(vol)}`;
        takeawayLine='Kết luận: Đường cao SO ⊥ bán kính đáy OA tạo tam giác vuông SOA (l² = r² + h²).';
        break;}
      case 'roof':{
        const aVal=Number(mp.a)||4,bVal=Number(mp.b)||2.4,hVal=Number(mp.h)||3.2;
        const isFrustum=String(this.model?.type)==='frustumPyramid'||String(this.model?.sourceExhibitId||'').includes('g11_09');
        const isTriPrism=String(this.model?.type)==='triPrism'||String(this.model?.sourceExhibitId||'').includes('g7_01');
        c.fillStyle='rgba(29,78,216,0.14)';c.fillRect(-84,-4,168,72);c.strokeStyle='#1D4ED8';c.lineWidth=2;c.strokeRect(-84,-4,168,72);
        const hScale=Math.max(0.15,p);
        c.save();c.translate(0,-6);
        const topY=(isFrustum?-68:-78)*hScale;
        if(p>=0.2){
          c.beginPath();
          if(isFrustum){c.moveTo(-108,0);c.lineTo(-48,topY);c.lineTo(48,topY);c.lineTo(108,0);c.closePath();}
          else if(isTriPrism){c.moveTo(-106,0);c.lineTo(-28,topY);c.lineTo(54,topY);c.lineTo(106,0);c.closePath();}
          else{c.moveTo(-110,0);c.lineTo(0,topY);c.lineTo(110,0);c.closePath();}
          c.fillStyle=p>=0.5?'rgba(180,83,9,0.28)':'rgba(180,83,9,0.10)';c.fill();c.strokeStyle='#B45309';c.lineWidth=2.5;c.stroke();
        }
        if(p>=0.45){
          c.strokeStyle='#6D28D9';c.lineWidth=2;c.setLineDash([4,3]);c.beginPath();c.moveTo(0,topY);c.lineTo(0,0);c.stroke();c.setLineDash([]);
          c.strokeRect(0,-9,9,9);
        }
        c.fillStyle='#6D28D9';c.font='bold 11.5px system-ui';c.fillText(`h = ${fmt(hVal)}`,6,topY/2);
        c.fillStyle='#1D4ED8';c.fillText(`Đáy a = ${fmt(aVal)}`,24,-4);
        if(isFrustum){c.fillStyle='#B45309';c.fillText(`b = ${fmt(bVal)}`,-22,topY-6);}
        c.restore();
        formulaLine=isFrustum?`Tương quan: Đáy lớn a=${fmt(aVal)}, đáy nhỏ b=${fmt(bVal)}, cao h=${fmt(hVal)}`:isTriPrism?`Tương quan: Cạnh đáy a=${fmt(aVal)}, cao lăng trụ h=${fmt(hVal)} ⇒ V = S_đáy · h`:`Tương quan: Cạnh đáy a = ${fmt(aVal)}, chiều cao mái h = ${fmt(hVal)} (SH ⊥ mặt đáy)`;
        takeawayLine='Kết luận: Chiều cao hạ vuông góc xuống mặt đáy quyết định độ dốc thoát nước và thể tích khối.';
        break;}
      case 'tiles':{
        const nVal=Number(mp.n)||6,rVal=Number(mp.r||mp.a)||2.6,inAngle=Math.round((nVal-2)*180/nVal);
        c.fillStyle='#f1f5f9';c.fillRect(-115,-74,230,138);
        const maxCells=18,shown=Math.max(1,Math.ceil(maxCells*Math.max(0.08,p)));
        let idx=0;
        for(let y=-56;y<55;y+=36)for(let x=-95;x<95;x+=36){
          if(idx++>=shown)continue;
          c.save();c.translate(x+18,y+18);
          c.fillStyle=(x+y)%2?'#DBEAFE':'#FEF3C7';c.strokeStyle=(x+y)%2?'#1D4ED8':'#B45309';c.lineWidth=1.6;
          c.fillRect(-15,-15,30,30);c.strokeRect(-15,-15,30,30);c.restore();
        }
        formulaLine=`Tương quan: Đa giác n = ${nVal} cạnh · Góc trong = ${inAngle}° · Kích thước = ${fmt(rVal)}`;
        takeawayLine='Kết luận: Các viên gạch lát kín phẳng khi tổng các góc chung đỉnh bằng đúng 360°.';
        break;}
      case 'vase':{
        const kVal=Number(mp.k)||1.2,hVal=Number(mp.h)||4.2,r1Val=Number(mp.r1)||1.6,r2Val=Number(mp.r2)||2.8;
        c.strokeStyle='#475569';c.lineWidth=1.8;c.setLineDash([4,3]);c.beginPath();c.moveTo(0,-76);c.lineTo(0,70);c.stroke();c.setLineDash([]);
        c.fillStyle='#475569';c.font='bold 11.5px system-ui';c.fillText('Trục quay Ox',8,-56);
        c.beginPath();c.moveTo(42,-68);c.bezierCurveTo(22,-8,76,34,36,64);c.strokeStyle='#1D4ED8';c.lineWidth=2.8;c.stroke();
        if(p>=0.25){
          c.beginPath();c.moveTo(-42,-68);c.bezierCurveTo(-22,-8,-76,34,-36,64);c.lineTo(36,64);c.bezierCurveTo(76,34,22,-8,42,-68);c.closePath();
          if(p>=0.5){c.fillStyle='rgba(29,78,216,0.22)';c.fill();}
          c.strokeStyle='#1D4ED8';c.lineWidth=2.4;c.stroke();
          c.beginPath();c.ellipse(0,-68,42*Math.min(1,p*1.4),10,0,0,Math.PI*2);c.fillStyle='#DBEAFE';c.fill();c.stroke();
        }
        if(p>=0.5){
          const ySlice=-30+p*64;
          c.beginPath();c.ellipse(0,ySlice,46,9,0,0,Math.PI*2);c.strokeStyle='#B45309';c.lineWidth=2.2;c.stroke();
          c.fillStyle='#B45309';c.fillText('Thiết diện tròn R(x)',48,ySlice+4);
        }
        formulaLine=`Tương quan: r₁=${fmt(r1Val)}, r₂=${fmt(r2Val)}, k=${fmt(kVal)}, h=${fmt(hVal)} ⇒ V = π ∫ [R(x)]² dx`;
        takeawayLine='Kết luận: Quay đường sinh R(x) quanh trục tạo khối tròn xoay có mọi thiết diện vuông góc trục là hình tròn.';
        break;}
      case 'gift':{
        const aVal=Number(mp.a)||4,bVal=Number(mp.b||mp.a)||3,hVal=Number(mp.h||mp.a)||3,vol=aVal*bVal*hVal,stp=2*(aVal*bVal+bVal*hVal+hVal*aVal);
        const hGrow=Math.max(0.15,p),topFrontY=64-86*hGrow,topBackY=18-86*hGrow;
        c.beginPath();c.moveTo(-75,64);c.lineTo(55,64);c.lineTo(105,18);c.lineTo(-25,18);c.closePath();
        c.fillStyle='rgba(29,78,216,0.16)';c.fill();c.strokeStyle='#1D4ED8';c.lineWidth=2;c.stroke();
        if(p>=0.2){
          c.fillStyle='rgba(29,78,216,0.24)';c.strokeStyle='#1D4ED8';c.lineWidth=2.4;
          c.fillRect(-75,topFrontY,130,64-topFrontY);c.strokeRect(-75,topFrontY,130,64-topFrontY);
          c.beginPath();c.moveTo(-75,topFrontY);c.lineTo(-25,topBackY);c.lineTo(105,topBackY);c.lineTo(55,topFrontY);c.closePath();
          c.fillStyle='#DBEAFE';c.fill();c.stroke();
          c.beginPath();c.moveTo(55,topFrontY);c.lineTo(105,topBackY);c.lineTo(105,18);c.lineTo(55,64);c.closePath();
          c.fillStyle='rgba(180,83,9,0.22)';c.fill();c.strokeStyle='#B45309';c.stroke();
        }
        if(p>=0.7){
          c.strokeStyle='#6D28D9';c.lineWidth=2.2;c.setLineDash([4,3]);
          c.beginPath();c.moveTo(-75,64);c.lineTo(105,topBackY);c.stroke();c.setLineDash([]);
        }
        c.fillStyle='#1D4ED8';c.font='bold 11.5px system-ui';
        c.fillText(`a = ${fmt(aVal)}`,-22,78);
        c.fillStyle='#B45309';c.fillText(`b = ${fmt(bVal)}`,84,50);
        c.fillStyle='#6D28D9';c.fillText(`h = ${fmt(hVal)}`,-112,(topFrontY+64)/2);
        formulaLine=`Tương quan: a=${fmt(aVal)}, b=${fmt(bVal)}, h=${fmt(hVal)} ⇒ V = abh = ${fmt(vol)} · S_tp = ${fmt(stp)}`;
        takeawayLine='Kết luận: Tủ/hộp chữ nhật có 6 mặt chữ nhật đôi một bằng nhau; V = diện tích đáy (a·b) × chiều cao h.';
        break;}
      case 'stairs':{
        const aVal=Number(mp.a)||3,bVal=Number(mp.b)||4,cVal=Math.hypot(aVal,bVal);
        const B=[-78,56],A=[58,56],C=[-78,-58];
        c.strokeStyle='#1D4ED8';c.lineWidth=3;c.beginPath();c.moveTo(B[0],B[1]);c.lineTo(A[0],A[1]);c.stroke();
        c.strokeStyle='#6D28D9';c.lineWidth=2;c.strokeRect(B[0],B[1]-12,12,12);
        if(p>=0.2){
          const kWall=Math.min(1,(p-0.1)/0.3);
          c.strokeStyle='#1D4ED8';c.lineWidth=3;c.beginPath();c.moveTo(B[0],B[1]);c.lineTo(B[0],B[1]+(C[1]-B[1])*kWall);c.stroke();
        }
        if(p>=0.45){
          c.fillStyle='rgba(29,78,216,0.10)';c.beginPath();c.moveTo(B[0],B[1]);c.lineTo(A[0],A[1]);c.lineTo(C[0],C[1]);c.closePath();c.fill();
          const steps=6,visSteps=Math.max(1,Math.ceil(steps*Math.min(1,(p-0.4)/0.45)));
          c.strokeStyle='#15803D';c.lineWidth=2.2;c.beginPath();
          for(let i=0;i<visSteps;i++){
            const x1=A[0]+(C[0]-A[0])*(i/steps),y1=A[1]+(C[1]-A[1])*(i/steps);
            const x2=A[0]+(C[0]-A[0])*((i+1)/steps),y2=A[1]+(C[1]-A[1])*((i+1)/steps);
            c.moveTo(x1,y1);c.lineTo(x1,y2);c.lineTo(x2,y2);
          }
          c.stroke();
          const kHyp=Math.min(1,(p-0.45)/0.45);
          c.strokeStyle='#B45309';c.lineWidth=3.2;c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(A[0]+(C[0]-A[0])*kHyp,A[1]+(C[1]-A[1])*kHyp);c.stroke();
        }
        c.fillStyle='#6D28D9';c.font='bold 12px system-ui';
        c.fillText('B (90°)',B[0]-42,B[1]+14);c.fillText('A',A[0]+8,A[1]+14);c.fillText('C',C[0]-18,C[1]-4);
        c.fillStyle='#1D4ED8';c.fillText(`Chân dốc a = ${fmt(aVal)}`,(A[0]+B[0])/2-36,B[1]+16);
        c.fillText(`Cao b = ${fmt(bVal)}`,B[0]-78,(B[1]+C[1])/2);
        if(p>=0.45){c.fillStyle='#B45309';c.fillText(`Dốc c = √(a²+b²) = ${fmt(cVal)}`,0,-12);}
        formulaLine=`Tương quan: a = ${fmt(aVal)}, b = ${fmt(bVal)} (B = 90°) ⇒ c = √(a² + b²) = ${fmt(cVal)}`;
        takeawayLine='Kết luận: Định lí Pythagore giúp tính chính xác chiều dài đường dốc/cầu thang từ chiều cao và mặt sàn.';
        break;}
      case 'orbit':{
        const aVal=Math.max(Number(mp.a)||4,1.5),bVal=Math.min(Number(mp.b)||2.5,aVal-.2),cVal=Math.sqrt(Math.max(0,aVal*aVal-bVal*bVal));
        const rx=108,ry=rx*(bVal/aVal),fx=rx*(cVal/aVal);
        c.strokeStyle='#475569';c.lineWidth=1.2;c.setLineDash([4,3]);c.beginPath();c.moveTo(-rx-12,0);c.lineTo(rx+12,0);c.moveTo(0,-ry-10);c.lineTo(0,ry+10);c.stroke();c.setLineDash([]);
        c.fillStyle='#B45309';c.beginPath();c.arc(-fx,0,6.5,0,Math.PI*2);c.fill();
        c.fillStyle='#6D28D9';c.beginPath();c.arc(fx,0,5.5,0,Math.PI*2);c.fill();
        const sweep=Math.max(0.15,p)*Math.PI*1.85;
        c.strokeStyle='#1D4ED8';c.lineWidth=2.6;c.beginPath();c.ellipse(0,0,rx,ry,0,0,sweep);c.stroke();
        const mx=rx*Math.cos(sweep),my=ry*Math.sin(sweep);
        if(p>=0.2){
          c.strokeStyle='#B45309';c.lineWidth=2.2;c.beginPath();c.moveTo(-fx,0);c.lineTo(mx,my);c.lineTo(fx,0);c.stroke();
          c.fillStyle='#15803D';c.beginPath();c.arc(mx,my,6.5,0,Math.PI*2);c.fill();
        }
        c.fillStyle='#1e293b';c.font='bold 11.5px system-ui';
        c.fillText('F₁',-fx-10,20);c.fillText('F₂',fx-6,20);c.fillText('M',mx+8,my-6);
        formulaLine=`Tương quan: a = ${fmt(aVal)}, b = ${fmt(bVal)}, c = ${fmt(cVal)} ⇒ MF₁ + MF₂ = 2a = ${fmt(2*aVal)} (không đổi)`;
        takeawayLine='Kết luận: Mọi điểm M trên viền bồn hoa/quỹ đạo Elip luôn có tổng khoảng cách tới hai tiêu điểm F₁, F₂ bằng 2a.';
        break;}
      case 'wheel':{
        const rVal=Number(mp.r)||2.6,aVal=Number(mp.a)||0,bVal=Number(mp.b)||0,circum=2*Math.PI*rVal;
        const sweep=Math.max(0.15,p)*Math.PI*2,rPx=52;
        c.strokeStyle='#475569';c.lineWidth=1.2;c.setLineDash([4,3]);c.beginPath();c.moveTo(-90,4);c.lineTo(90,4);c.moveTo(0,-66);c.lineTo(0,72);c.stroke();c.setLineDash([]);
        c.strokeStyle='#1D4ED8';c.lineWidth=4.5;c.beginPath();c.arc(0,4,rPx,0,sweep);c.stroke();
        const spokeCount=Math.max(1,Math.ceil(6*Math.max(0.15,p)));
        c.strokeStyle='#B45309';c.lineWidth=2;
        for(let k=0;k<spokeCount;k++){const a=k*Math.PI/3;c.beginPath();c.moveTo(0,4);c.lineTo(rPx*Math.cos(a),4+rPx*Math.sin(a));c.stroke();}
        c.fillStyle='#6D28D9';c.beginPath();c.arc(0,4,4.5,0,Math.PI*2);c.fill();
        c.strokeStyle='#6D28D9';c.lineWidth=2.5;c.beginPath();c.moveTo(0,4);c.lineTo(rPx,4);c.stroke();
        c.font='bold 12px system-ui';c.fillText(`I(${fmt(aVal)};${fmt(bVal)})`,-26,-8);c.fillText(`R=${fmt(rVal)}`,14,-2);
        formulaLine=`Tương quan: Tâm I(${fmt(aVal)}; ${fmt(bVal)}), bán kính R = ${fmt(rVal)} ⇒ (x-a)²+(y-b)²=R² · Chu vi C = 2πR ≈ ${fmt(circum)}`;
        takeawayLine='Kết luận: Mọi điểm trên vành bánh xe cách tâm I(a; b) một khoảng không đổi bằng bán kính R.';
        break;}
      case 'rails':{
        const hVal=Number(mp.h)||2.5;
        c.fillStyle='#e2e8f0';c.beginPath();c.moveTo(-125,55);c.lineTo(-85,15);c.lineTo(125,15);c.lineTo(85,55);c.closePath();c.fill();c.strokeStyle='#1D4ED8';c.lineWidth=2;c.stroke();
        const yRail=35-hVal*22;
        if(p>=0.2){
          c.strokeStyle='#15803D';c.lineWidth=2.2;c.setLineDash([5,3]);c.beginPath();c.moveTo(-105,35);c.lineTo(105,35);c.stroke();c.setLineDash([]);
        }
        if(p>=0.45){
          const span=Math.min(1,(p-0.35)/0.45)*210;
          c.strokeStyle='#B45309';c.lineWidth=4;c.beginPath();c.moveTo(-105,yRail);c.lineTo(-105+span,yRail);c.stroke();
        }
        if(p>=0.7){
          for(const xPos of [-55,55]){
            c.strokeStyle='#6D28D9';c.lineWidth=2.2;c.setLineDash([4,3]);c.beginPath();c.moveTo(xPos,yRail);c.lineTo(xPos,35);c.stroke();c.setLineDash([]);
            c.strokeRect(xPos,27,8,8);
            c.fillStyle='#6D28D9';c.font='bold 11px system-ui';c.fillText(`h=${fmt(hVal)}`,xPos+6,(yRail+35)/2);
          }
        }
        c.fillStyle='#B45309';c.font='bold 12px system-ui';c.fillText('Đường ray d ∥ (P)',-45,yRail-8);
        c.fillStyle='#1D4ED8';c.fillText('Mặt sàn (P)',-35,50);
        formulaLine=`Tương quan: d ∥ d′ ⊂ (P) ⇒ d ∥ (P) · Khoảng cách AA′ = BB′ = h = ${fmt(hVal)} không đổi`;
        takeawayLine='Kết luận: Khi đường thẳng d song song với mặt phẳng (P), mọi điểm trên d cách (P) một khoảng h bằng nhau.';
        break;}
      default:{
        c.beginPath();c.moveTo(-85,55);c.lineTo(-20,-65);c.lineTo(87,55);c.closePath();c.fillStyle='#9dcdd3';c.fill();c.strokeStyle='#418b94';c.lineWidth=3;c.stroke();
        formulaLine='Tương quan: Thay đổi các thanh tham số để quan sát kích thước và số đo biến thiên.';
        takeawayLine='Kết luận: Mô hình thực tế được trừu tượng hóa thành các yếu tố hình học cơ bản.';
        break;}
    }
    c.restore();
    c.fillStyle='#1D4ED8';c.font='bold 12px system-ui';c.fillText(`MÔ HÌNH MINH HỌA MỞ RỘNG · ${(this.model?.title||'').toUpperCase()}`,12,18);
    c.fillStyle='#6D28D9';c.font='bold 11px system-ui';c.fillText(stageLabel,12,34);
    if(formulaLine){c.fillStyle='#15803D';c.font='bold 11.5px system-ui';c.fillText(formulaLine,12,212);}
    if(takeawayLine){c.fillStyle='#334155';c.font='11.5px system-ui';c.fillText(takeawayLine,12,232);}
  }
  dispose(){this.canvas?.remove();this.canvas=null;}
}
export const realWorldCategory=inferCategory;
