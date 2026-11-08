/** Du lieu va phep tinh doc lap WebGL, de kiem thu toan hoc. */

function formatLinearInequality2D(a, b, rel = '=', c = 0) {
  const parts = [];
  const na = Number(a) || 0, nb = Number(b) || 0, nc = Number(c) || 0;
  if (Math.abs(na) > 1e-9) {
    const absA = Math.abs(na);
    parts.push(`${na < 0 ? '−' : ''}${Math.abs(absA - 1) < 1e-9 ? '' : absA}x`);
  }
  if (Math.abs(nb) > 1e-9) {
    const absB = Math.abs(nb);
    const coefB = Math.abs(absB - 1) < 1e-9 ? '' : absB;
    parts.push(parts.length === 0 ? `${nb < 0 ? '−' : ''}${coefB}y` : `${nb < 0 ? ' − ' : ' + '}${coefB}y`);
  }
  return `${parts.length ? parts.join('') : '0'} ${rel} ${nc}`;
}

export const TYPES = Object.freeze({
  polygonTiling: {name:'Lát mặt phẳng bằng đa giác đều',params:{n:['Số cạnh 3, 4 hoặc 6',3,6,6],side:['Cạnh ô lát',0.5,2,1.2],rows:['Số hàng ô lát',2,5,3]}},
  transform2d: {name:'Phép biến hình phẳng (quay, vị tự, tịnh tiến)',params:{deg:['Góc quay (°)',-180,180,35],k:['Tỉ số vị tự k',0.3,2,1],dx:['Tịnh tiến x',-4,4,2],dy:['Tịnh tiến y',-4,4,1]}},
  unitCircleMotion: {name:'Đường tròn lượng giác và đồ thị sin',params:{deg:['Góc quay (°)',0,360,60],amp:['Biên độ A',0.5,2,1.5]}},
  boxPlot: {name:'Biểu đồ hộp và tứ phân vị',params:{}},
  cube: {name:'Hình lập phương', params:{a:['Cạnh a',0.5,12,3]}},
  cuboid: {name:'Hình hộp chữ nhật',params:{a:['Dài a',0.5,12,4],b:['Rộng b',0.5,12,3],h:['Cao h',0.5,12,2]}},
  cylinder: {name:'Hình trụ',params:{r:['Bán kính r',0.5,8,2],h:['Chiều cao h',0.5,12,4]}},
  cone: {name:'Hình nón',params:{r:['Bán kính r',0.5,8,2],h:['Chiều cao h',0.5,12,4]}},
  sphere: {name:'Hình cầu',params:{r:['Bán kính r',0.5,8,2]}},
  squarePyramid: {name:'Hình chóp tứ giác đều',params:{a:['Cạnh đáy a',0.5,12,4],h:['Chiều cao h',0.5,12,3]}},
  trianglePyramid: {name:'Hình chóp tam giác đều',params:{a:['Cạnh đáy a',0.5,12,4],h:['Chiều cao h',0.5,12,3]}},
  triPrism: {name:'Lăng trụ đứng tam giác đều',params:{a:['Cạnh đáy a',0.5,12,3],h:['Chiều cao h',0.5,12,4]}},
  polygon: {name:'Đa giác đều',params:{n:['Số cạnh n',3,12,6],r:['Bán kính ngoại tiếp R',0.5,8,2]}},
  circle: {name:'Hình tròn',params:{r:['Bán kính r',0.5,8,3]}},
  triangle: {name:'Tam giác vuông',params:{a:['Cạnh góc vuông a',0.5,10,3],b:['Cạnh góc vuông b',0.5,10,4]}},
  pythagoras: {name:'Định lý Pythagore',params:{a:['Cạnh góc vuông a',1,10,3],b:['Cạnh góc vuông b',1,10,4]}},
  parabola: {name:'Parabol y = ax²',params:{a:['Hệ số a',-2,2,1],b:['Hệ số b',-4,4,0],c:['Hệ số c',-4,4,0]}},
  lineGraph: {name:'Đồ thị hàm bậc nhất',params:{a:['Hệ số a',-3,3,1],b:['Hệ số b',-4,4,1]}},
  sine: {name:'Đồ thị sin',params:{amp:['Biên độ A',0.2,4,1],freq:['Hệ số k',0.5,4,1]}},
  exponential: {name:'Đồ thị hàm mũ',params:{a:['Cơ số a (>1)',1.1,3,1.5]}},
  vector: {name:'Vectơ trong không gian',params:{x:['Tọa độ x',-6,6,3],y:['Tọa độ y',-6,6,2],z:['Tọa độ z',-6,6,1]}},
  plane: {name:'Mặt phẳng tọa độ',params:{angle:['Độ nghiêng',0,80,25]}},
  twoPlanes: {name:'Hai mặt phẳng giao nhau',params:{gap:['Khoảng cách',0,4,1],angle:['Góc quay (độ)',0,80,30]}},
  crossSection: {name:'Thiết diện hình hộp',params:{a:['Dài a',1,12,4],b:['Rộng b',1,12,3],h:['Cao h',1,12,5],t:['Độ cao thiết diện (%)',5,95,50]}},
  ellipse: {name:'Đường elip',params:{a:['Bán trục lớn a',1,8,4],b:['Bán trục nhỏ b',0.5,8,2]}},
  hyperbola: {name:'Đường hypebol',params:{a:['Tham số a',0.5,6,2],b:['Tham số b',0.5,6,1.5]}},
  surface: {name:'Mặt cong 3D',params:{amp:['Biên độ A',0.1,3,1],freq:['Tần số k',0.5,3,1]}},
  tetrahedron: {name:'Tứ diện đều',params:{a:['Cạnh a',0.5,10,4]}},
  trapezoid: {name:'Hình thang cân',params:{a:['Đáy lớn a',2,12,6],b:['Đáy nhỏ b',0.5,10,3],h:['Chiều cao h',0.5,8,3]}},
  rhombus: {name:'Hình thoi',params:{a:['Đường chéo d1',0.5,12,6],b:['Đường chéo d2',0.5,12,4]}},
  derivative: {name:'Hàm bậc ba và đạo hàm',params:{a:['Hệ số a',0.2,2,0.5],b:['Hệ số b',0.2,6,3]}},
  angles: {name:'Góc giữa hai tia',params:{deg:['Số đo góc (độ)',5,175,60]}},
  linePlane: {name:'Đường thẳng và mặt phẳng',params:{angle:['Góc nghiêng',0,85,45],offset:['Độ dịch chuyển',-3,3,0]}},
  parallelogram: {name:'Hình bình hành',params:{a:['Cạnh đáy a',1,12,6],b:['Cạnh bên b',1,10,4],h:['Chiều cao h',0.5,10,3.5]}},
  symmetryAxis: {name:'Hình có trục đối xứng',params:{a:['Cạnh đáy a',1,10,6],h:['Chiều cao h',1,10,5]}},
  symmetryCenter: {name:'Hình có tâm đối xứng',params:{a:['Cạnh dài a',1,10,6],b:['Cạnh ngắn b',1,8,4],deg:['Góc nghiêng',30,150,60]}},
  segmentMidpoint: {name:'Đoạn thẳng và Trung điểm',params:{len:['Độ dài đoạn thẳng AB',1,14,8]}},
  barChart: {name:'Biểu đồ cột thống kê 3D',params:{c1:['Cột 1 (Toán)',1,10,6],c2:['Cột 2 (Văn)',1,10,8],c3:['Cột 3 (Anh)',1,10,5],c4:['Cột 4 (KHTN)',1,10,9]}},
  parallelLines: {name:'Hai đường thẳng song song và cát tuyến',params:{angle:['Góc tạo bởi cát tuyến (°)',30,150,65],dist:['Khoảng cách hai đường thẳng',1.5,6,3]}},
  triangleAngles: {name:'Tổng ba góc trong tam giác',params:{a:['Góc đỉnh A (°)',20,130,60],b:['Góc đỉnh B (°)',20,130,70]}},
  congruentTriangles: {name:'Hai tam giác bằng nhau',params:{a:['Cạnh a',2,8,4],b:['Cạnh b',2,8,5],deg:['Góc xen giữa (°)',30,130,60]}},
  pieChart: {name:'Biểu đồ hình quạt tròn 3D',params:{p1:['Tần số nhóm 1',10,60,40],p2:['Tần số nhóm 2',10,60,35],p3:['Tần số nhóm 3',5,50,25]}},
  triangleCenters: {name:'Các đường đồng quy trong tam giác',params:{a:['Cạnh đáy a',3,10,6],b:['Cạnh bên b',3,10,5],c:['Cạnh bên c',3,10,5.5]}},
  prismQuad: {name:'Hình lăng trụ đứng tứ giác',params:{a:['Đáy lớn a',2,10,5],b:['Đáy nhỏ b',1,8,3],h_base:['Chiều cao đáy',1,8,3],h:['Chiều cao lăng trụ h',2,12,6]}},
  // --- MÔ HÌNH MỚI LỚP 8 ---
  thales: {name:'Định lí Thalès trong tam giác',params:{a:['Cạnh AB',2,10,6],b:['Cạnh AC',2,10,7],k:['Tỉ số AM/AB (%)',15,85,50]}},
  midSegment: {name:'Đường trung bình tam giác',params:{a:['Cạnh đáy BC',2,12,6],h:['Chiều cao AH',2,10,5]}},
  parallelogramMid: {name:'Hình bình hành & Trung điểm 2 đường chéo',params:{a:['Cạnh đáy AB',2,10,6],b:['Cạnh bên AD',2,8,4],deg:['Góc A (°)',30,150,60]}},
  rectangleSquare: {name:'Hình chữ nhật & Hình vuông',params:{a:['Chiều dài a',1,10,5],b:['Chiều rộng b',1,10,3]}},
  similarTriangles: {name:'Tam giác đồng dạng & Hình vị tự',params:{k:['Tỉ số đồng dạng k',0.3,2,0.6],a:['Cạnh đáy',2,8,5]}},
  linearSlope: {name:'Hàm số bậc nhất & Hệ số góc',params:{a:['Hệ số góc a',-4,4,1.5],b:['Tung độ gốc b',-5,5,1]}},
  // --- MÔ HÌNH MỚI LỚP 9 ---
  sphereSection: {name:'Hình cầu & Mặt phẳng cắt (Thiết diện tròn)',params:{r:['Bán kính mặt cầu R',1.5,8,4],d:['Khoảng cách tâm OH',0,6,2]}},
  trigTriangle: {name:'Tỉ số lượng giác góc nhọn tam giác vuông',params:{b:['Cạnh đối AC (b)',1,10,4],c:['Cạnh huyền BC (c)',1.5,12,5]}},
  circleTangent: {name:'Vị trí tương đối đường thẳng & đường tròn (Tiếp tuyến)',params:{r:['Bán kính R',1,6,3],d:['Khoảng cách OH',0.5,6,3]}},
  circleInscribed: {name:'Góc ở tâm & Góc nội tiếp cùng chắn một cung',params:{r:['Bán kính R',1,6,3],deg:['Số đo cung (°)',30,160,80]}},
  circumIncircle: {name:'Đường tròn ngoại tiếp & nội tiếp tam giác',params:{a:['Cạnh a',2,8,5],b:['Cạnh b',2,8,5],c:['Cạnh c',2,8,6]}},
  cyclicQuad: {name:'Tứ giác nội tiếp đường tròn',params:{r:['Bán kính R',1,6,3],a1:['Góc đỉnh 1 (°)',20,80,45],a2:['Góc đỉnh 2 (°)',100,160,135]}},
  // --- MÔ HÌNH MỚI LỚP 10 ---
  parabolaGeneral: {name:'Đồ thị hàm số bậc hai y = ax² + bx + c',params:{a:['Hệ số a',-3,3,1],b:['Hệ số b',-6,6,-2],c:['Hệ số c',-6,6,-1]}},
  inequalityRegion: {name:'Miền nghiệm bất phương trình bậc nhất hai ẩn',params:{a:['Hệ số a',-4,4,1],b:['Hệ số b',-4,4,2],c:['Hệ số c',-6,6,4]}},
  triangleLaws: {name:'Định lí Côsin & Định lí Sin trong tam giác',params:{a:['Cạnh a',2,8,5],b:['Cạnh b',2,8,6],c:['Cạnh c',2,8,7]}},
  vectorParallelogram: {name:'Quy tắc hình bình hành cộng vectơ',params:{ux:['Vectơ u_x',-5,5,3],uy:['Vectơ u_y',-5,5,1],vx:['Vectơ v_x',-5,5,1],vy:['Vectơ v_y',-5,5,3]}},
  vectorDot: {name:'Tích vô hướng của hai vectơ',params:{ulen:['Độ dài vectơ u',1,8,4],vlen:['Độ dài vectơ v',1,8,3],deg:['Góc giữa 2 vectơ (°)',0,180,60]}},
  lineOxy: {name:'Phương trình đường thẳng trong Oxy (Vectơ pháp tuyến)',params:{a:['Tọa độ n_x',-4,4,2],b:['Tọa độ n_y',-4,4,1],c:['Hệ số c',-6,6,-4]}},
  circleOxy: {name:'Phương trình đường tròn trong Oxy',params:{a:['Tâm x₀',-4,4,1],b:['Tâm y₀',-4,4,2],r:['Bán kính R',0.5,6,3]}},
  // --- MÔ HÌNH MỚI LỚP 11 ---
  skewLines: {name:'Hai đường thẳng chéo nhau trong không gian',params:{dist:['Khoảng cách vuông góc chung',1,6,3],angle:['Góc giữa 2 đường thẳng (°)',20,90,60]}},
  lineParallelPlane: {name:'Đường thẳng song song với mặt phẳng',params:{dist:['Khoảng cách đến mặt phẳng',1,5,2.5],angle:['Góc xoay đường thẳng (°)',0,90,0]}},
  parallelPlanes: {name:'Hai mặt phẳng song song trong không gian',params:{dist:['Khoảng cách giữa 2 mp',1,6,3]}},
  parallelProjection: {name:'Phép chiếu song song trên mặt phẳng',params:{h:['Độ cao mặt hình gốc',1,6,2.5],shift:['Độ xiên phương chiếu',-2,2,1]}},
  linePerpPlane: {name:'Đường thẳng vuông góc mặt phẳng & Định lí 3 đường vuông góc',params:{h:['Độ dài đoạn vuông góc',1,6,3],slant:['Góc nghiêng đường xiên (°)',30,80,45]}},
  perpendicularPlanes: {name:'Hai mặt phẳng vuông góc trong không gian',params:{w:['Bề rộng mặt phẳng',2,8,5],h:['Chiều cao mặt phẳng đứng',2,8,4]}},
  linePlaneAngle: {name:'Góc giữa đường thẳng và mặt phẳng',params:{deg:['Góc nghiêng (°)',10,80,45],len:['Độ dài đoạn xiên',2,8,4]}},
  dihedralAngle: {name:'Góc nhị diện & Góc phẳng nhị diện',params:{deg:['Góc nhị diện (°)',20,160,70],size:['Kích thước mặt phẳng',2,6,4]}},
  frustumPyramid: {name:'Hình chóp cụt tứ giác đều',params:{a:['Cạnh đáy lớn a',2,10,5],b:['Cạnh đáy nhỏ b',0.5,6,2],h:['Chiều cao h',1,8,3]}},
  // GD7: truthful 3D Toan 12. These types are added without changing immutable catalog source.
  openTopBox:{name:'Hộp không nắp cắt từ tấm bìa',params:{L:['Cạnh tấm bìa',6,20,10],cut:['Cạnh ô cắt',.2,5,1.5]}},
  profileRevolve:{name:'Khối tròn xoay với tiết diện tính từ r(x)',params:{r1:['Bán kính đầu',.7,3.2,1.8],r2:['Bán kính cuối',.7,3.2,1.2],h:['Chiều dài',1,6,4],hole:['Bán kính rỗng',0,2,0],slice:['Vị trí mặt cắt',.05,.95,.5]}},
  oxyzVectorPair:{name:'Hai vectơ và tổng trong không gian',params:{x:['x',-4,4,2],y:['y',-4,4,1],z:['z',-4,4,2],u1:['u1',-4,4,-1],u2:['u2',-4,4,2],u3:['u3',-4,4,1]}},
  oxyzPlanePointDistance:{name:'Khoảng cách từ điểm đến mặt phẳng tổng quát',params:{A:['A',-3,3,1],B:['B',-3,3,2],C:['C',-3,3,2],D:['D',-4,4,-2],x:['x',-4,4,2],y:['y',-4,4,1],z:['z',-4,4,2]}},
  oxyzLinePair:{name:'Hai đường thẳng không gian thay đổi vị trí',params:{dist:['Khoảng cách',0,4,1.1],deg:['Góc giữa 2 vectơ chỉ phương',0,160,55]}},
  oxyzSphereCut:{name:'Giao mặt phẳng và mặt cầu',params:{r:['Bán kính',1,3.5,2.5],dist:['Khoảng cách tâm–mặt phẳng',0,4,1.25]}},
  oxyzSphereLine:{name:'Giao đường thẳng và mặt cầu',params:{r:['Bán kính',1,3.5,2.5],dist:['Khoảng cách tâm–đường thẳng',0,4,1.25]}},
  // --- MÔ HÌNH MỚI LỚP 12 ---
  cubicCurve: {name:'Đồ thị hàm số bậc ba y = ax³ + bx² + cx + d',params:{a:['Hệ số a',-2,2,0.5],b:['Hệ số b',-4,4,0],c:['Hệ số c',-4,4,-3],d:['Hệ số d',-4,4,1]}},
  rationalFunc: {name:'Đồ thị hàm phân thức y = (ax+b)/(cx+d) & Tiệm cận',params:{a:['Hệ số a',-3,3,2],b:['Hệ số b',-4,4,1],c:['Hệ số c',-3,3,1],d:['Hệ số d',-4,4,-1]}},
  revolvedSolid: {name:'Khối tròn xoay (Ứng dụng tích phân tính thể tích)',params:{r1:['Bán kính đáy trái',0.5,4,1],r2:['Bán kính đáy phải',0.5,5,3],h:['Chiều dài đoạn xoay',1,8,4]}},
  oxyzAxes: {name:'Hệ trục tọa độ Oxyz & Ba mặt phẳng tọa độ',params:{len:['Chiều dài trục',2,8,4]}},
  oxyzVector: {name:'Tọa độ điểm & Vectơ trong không gian Oxyz',params:{x:['Tọa độ x',-5,5,3],y:['Tọa độ y',-5,5,4],z:['Tọa độ z',-5,5,2]}},
  oxyzSphere: {name:'Mặt cầu trong không gian Oxyz',params:{x:['Tâm x₀',-4,4,0],y:['Tâm y₀',-4,4,0],z:['Tâm z₀',-4,4,0],r:['Bán kính R',1,5,3]}},
  oxyzPlane: {name:'Mặt phẳng trong Oxyz & Vectơ pháp tuyến',params:{A:['Tọa độ n_x',-4,4,2],B:['Tọa độ n_y',-4,4,-1],C:['Tọa độ n_z',-4,4,2],D:['Hệ số D',-6,6,-4]}},
  oxyzLine: {name:'Đường thẳng trong Oxyz & Vectơ chỉ phương',params:{x0:['Điểm M₀ x',-4,4,1],y0:['Điểm M₀ y',-4,4,2],z0:['Điểm M₀ z',-4,4,0],u1:['Vectơ u_x',-3,3,2],u2:['Vectơ u_y',-3,3,1],u3:['Vectơ u_z',-3,3,-1]}},
  oxyzDistance: {name:'Vị trí tương đối & Khoảng cách trong Oxyz',params:{x:['Điểm M x',-4,4,2],y:['Điểm M y',-4,4,3],z:['Điểm M z',-4,4,4],d:['Vị trí mặt phẳng z = d',-4,4,0]}},
  conicalFrustum: {name:'Hình nón cụt (Khối nón cụt)',params:{r1:['Bán kính đáy nhỏ',0.5,4,1.5],r2:['Bán kính đáy lớn',1,6,3],h:['Chiều cao',1,8,4]}}
});
export const GRADES = [6,7,8,9,10,11,12];
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const round=v=>Math.round(v*1000)/1000;
export function normalizeExhibit(raw, fallbackId='') {
  if(!raw || typeof raw!=='object' || Array.isArray(raw)) throw new Error('Mô hình phải là đối tượng dữ liệu.');
  const type=String(raw.type||'');
  const spec=TYPES[type];
  if(!spec) throw new Error(`Loại mô hình không hỗ trợ: ${type||'(trống)'}`);
  const grade=Number(raw.grade);
  if(!GRADES.includes(grade)) throw new Error('Khối lớp phải từ 6 đến 12.');
  const params={};
  for(const [key,[,lo,hi,def]] of Object.entries(spec.params)) {
    const v=raw.params?.[key];
    const num=(v===null||v===''||v===undefined)?def:Number(v);
    if(!Number.isFinite(num)) throw new Error(`Tham số ${key} không hợp lệ.`);
    params[key]=key==='n'?Math.round(clamp(num,lo,hi)):round(clamp(num,lo,hi));
  }
  if(raw.params && typeof raw.params==='object'){
    for(const numKey of ['turn','foldProgress','buildProgress']){
      if(raw.params[numKey]!==undefined && Number.isFinite(Number(raw.params[numKey]))){
        params[numKey]=round(clamp(Number(raw.params[numKey]),0,1));
      }
    }
    for(const strKey of ['modeId','variant','subMode']){
      if(typeof raw.params[strKey]==='string' && raw.params[strKey].trim()){
        params[strKey]=raw.params[strKey].trim().slice(0,64);
      }
    }
  }
  // Only regular triangles, squares and hexagons tile the plane by themselves.
  if(type==='polygonTiling'&&!([3,4,6].includes(params.n))){
    params.n=[3,4,6].reduce((best,n)=>Math.abs(n-params.n)<Math.abs(best-params.n)?n:best,3);
  }
  // Đảm bảo tính đúng đắn hình học
  if((type==='trapezoid'||type==='ellipse') && params.b>params.a) params.b=params.a;
  if(type==='triangleAngles' && params.a + params.b >= 175) {
    const sum = params.a + params.b;
    params.a = round(params.a * 170 / sum);
    params.b = round(params.b * 170 / sum);
  }
  if(type==='triangleCenters'||type==='triangleLaws'||type==='circumIncircle') {
    if (params.a >= params.b + params.c) params.a = round((params.b + params.c) * 0.9);
    if (params.b >= params.a + params.c) params.b = round((params.a + params.c) * 0.9);
    if (params.c >= params.a + params.b) params.c = round((params.a + params.b) * 0.9);
  }
  // Bảo toàn ràng buộc: chiều cao hình bình hành không vượt cạnh bên.
  if(type==='parallelogram' && params.h>params.b) params.h=params.b;
  if(type==='lineOxy' && Math.hypot(params.a,params.b)<1e-8) params.b=1;
  if(type==='inequalityRegion' && Math.hypot(params.a,params.b)<1e-8) params.b=1;
  if(type==='oxyzPlane' && Math.hypot(params.A,params.B,params.C)<1e-8) params.C=1;
  if(type==='oxyzLine' && Math.hypot(params.u1,params.u2,params.u3)<1e-8) params.u3=1;
  // Bốn đỉnh cùng thuộc một đường tròn: hai góc đối bù nhau.
  if(type==='cyclicQuad') params.a2=180-params.a1;
  if(type==='squarePyramid') {
    if (params.a <= 0) params.a = 1;
    if (params.h <= 0) params.h = 1;
  }
  if(type==='trigTriangle' && params.b >= params.c) {
    params.b = round(params.c * 0.8);
  }
  if(type==='twoPlanes' && params.angle<1) params.angle=1;
  if(type==='sphereSection' && params.d >= params.r) {
    params.d = round(Math.max(0, params.r - 0.1));
  }
  if(type==='frustumPyramid' && params.b >= params.a) {
    params.b = round(params.a * 0.5);
  }
  if(type==='cubicCurve' && Math.abs(params.a) < 0.05) {
    params.a = 0.5;
  }
  if(type==='rationalFunc' && Math.abs(params.c) < 0.05) {
    params.c = 1;
  }
  const safeString=(v,max)=>String(v??'').trim().slice(0,max);
  const title=safeString(raw.title,110)||spec.name;
  // Lưu an toàn dữ liệu biểu đồ, không biến biểu đồ tùy chỉnh trở lại dữ liệu mặc định.
  let data=null;
  if(raw.data&&Array.isArray(raw.data.values)&&raw.data.values.length<=40){
    const values=raw.data.values.map(Number);
    if(values.length&&values.every(Number.isFinite))data={
      kind:raw.data.kind==='raw_numeric'?'raw_numeric':'categorical_frequency',
      values:values.map(v=>round(Math.max(raw.data.kind==='raw_numeric'?-1_000_000:0,Math.min(1_000_000,v)))),
      labels:values.map((_,i)=>safeString(raw.data.labels?.[i]||`Nhóm ${i+1}`,40)),
      unit:safeString(raw.data.unit||'đơn vị',30)
    };
  }
  // Chỉ giữ tọa độ điểm được người dùng kéo, giới hạn kích thước và kiểu dữ liệu.
  let viewState=null;
  if(raw.viewState?.points&&typeof raw.viewState.points==='object'){
    const entries=Object.entries(raw.viewState.points).filter(([k,v])=>
      /^[A-Z]$/.test(k)&&Array.isArray(v)&&v.length===2&&v.every(x=>Number.isFinite(Number(x)))
    ).slice(0,8);
    if(entries.length)viewState={points:Object.fromEntries(entries.map(([k,v])=>[k,v.map(x=>round(Math.max(-100,Math.min(100,Number(x)))))]))};
  }
  return {
    id:safeString(raw.id || fallbackId || `m_${Date.now()}`,80).replace(/[^a-zA-Z0-9_\-]/g,'_'),
    grade, type, title,
    category:safeString(raw.category||'Hình học',50),
    chapter:safeString(raw.chapter||'',80),
    topic:safeString(raw.topic||'',80),
    curriculumSource:safeString(raw.curriculumSource||'Thông tư 32/2018/TT-BGDĐT',80),
    mathType:safeString(raw.mathType||spec.name,80),
    assumptions:safeString(raw.assumptions||'',500),
    colorHex:/^#[0-9a-fA-F]{6}$/.test(raw.colorHex)?raw.colorHex:null,
    hidden:!!raw.hidden,
    verified:raw.verified!==false,
    order:Number.isInteger(raw.order)?raw.order:null,
    description:safeString(raw.description||'',800),
    formula:safeString(raw.formula||'',300),
    params,
    ...(data?{data}:{}),
    ...(viewState?{viewState}:{}),
    custom:!!raw.custom
  };
}
export function metrics(type,p) {
  const pi=Math.PI;
  switch(type){
    case 'polygonTiling':return [
      {name:'Số cạnh ô lát',value:p.n,unit:'cạnh'},
      {name:'Góc trong',value:round(180*(p.n-2)/p.n),unit:'°'},
      {name:'Số góc tại một đỉnh',value:round(360/(180*(p.n-2)/p.n)),unit:''}];
    case 'transform2d':return [
      {name:'Tỉ số độ dài',value:p.k,unit:''},
      {name:'Tỉ số diện tích',value:round(p.k*p.k),unit:''},
      {name:'Góc quay',value:p.deg,unit:'°'}];
    case 'unitCircleMotion':return [
      {name:'Góc quay',value:p.deg,unit:'°'},
      {name:'sin góc',value:round(Math.sin(p.deg*pi/180)),unit:''},
      {name:'Tung độ điểm trên đồ thị',value:round(p.amp*Math.sin(p.deg*pi/180)),unit:''}];
    case 'boxPlot':return [];
    case 'cube':return [{name:'Thể tích',value:round(p.a**3),unit:'đv³'},{name:'Diện tích toàn phần',value:round(6*p.a**2),unit:'đv²'}];
    case 'cuboid':return [{name:'Thể tích',value:round(p.a*p.b*p.h),unit:'đv³'},{name:'Diện tích toàn phần',value:round(2*(p.a*p.b+p.b*p.h+p.h*p.a)),unit:'đv²'}];
    case 'cylinder':return [{name:'Thể tích',value:round(pi*p.r**2*p.h),unit:'đv³'},{name:'Diện tích xung quanh',value:round(2*pi*p.r*p.h),unit:'đv²'}];
    case 'cone':return [{name:'Thể tích',value:round(pi*p.r**2*p.h/3),unit:'đv³'},{name:'Độ dài đường sinh l',value:round(Math.hypot(p.r,p.h)),unit:'đv'}];
    case 'sphere':return [{name:'Thể tích',value:round(4*pi*p.r**3/3),unit:'đv³'},{name:'Diện tích mặt cầu',value:round(4*pi*p.r**2),unit:'đv²'}];
    case 'squarePyramid':return [{name:'Thể tích',value:round(p.a**2*p.h/3),unit:'đv³'},{name:'Diện tích đáy',value:round(p.a**2),unit:'đv²'}];
    case 'trianglePyramid':return [{name:'Thể tích',value:round(Math.sqrt(3)*p.a**2*p.h/12),unit:'đv³'}];
    case 'triPrism':return [{name:'Thể tích',value:round(Math.sqrt(3)*p.a**2*p.h/4),unit:'đv³'}];
    case 'circle':return [{name:'Chu vi',value:round(2*pi*p.r),unit:'đv'},{name:'Diện tích',value:round(pi*p.r**2),unit:'đv²'}];
    case 'polygon':return [{name:'Chu vi',value:round(2*p.n*p.r*Math.sin(pi/p.n)),unit:'đv'},{name:'Diện tích',value:round(0.5*p.n*p.r**2*Math.sin(2*pi/p.n)),unit:'đv²'}];
    case 'triangle':case 'pythagoras':return [{name:'Cạnh huyền',value:round(Math.hypot(p.a,p.b)),unit:'đv'},{name:'Diện tích',value:round(p.a*p.b/2),unit:'đv²'}];
    case 'hyperbola':return [{name:'Bán trục thực a',value:p.a,unit:'đv'},{name:'Bán trục ảo b',value:p.b,unit:'đv'},{name:'Tiệm cận',value:`y = ±${round(p.b/p.a)}x`,unit:''}];
    case 'ellipse':return [{name:'Diện tích elip',value:round(pi*p.a*p.b),unit:'đv²'},{name:'Tiêu cự 2c',value:round(2*Math.sqrt(Math.max(0,p.a**2-p.b**2))),unit:'đv'}];
    case 'trapezoid':return [{name:'Diện tích',value:round((p.a+p.b)*p.h/2),unit:'đv²'}];
    case 'rhombus':return [{name:'Diện tích',value:round(p.a*p.b/2),unit:'đv²'}];
    case 'tetrahedron':return [{name:'Thể tích',value:round(p.a**3/(6*Math.sqrt(2))),unit:'đv³'}];
    case 'crossSection':return [{name:'Diện tích thiết diện ngang',value:round(p.a*p.b),unit:'đv²'},{name:'Độ cao mặt cắt',value:round(p.h*p.t/100),unit:'đv'}];
    case 'vector':return [{name:'Độ dài vectơ',value:round(Math.hypot(p.x,p.y,p.z)),unit:'đv'}];
    case 'parabola':return Math.abs(p.a)<1e-8?[{name:'Trạng thái',value:'Suy biến thành đường thẳng y = bx + c (a = 0)',unit:''},{name:'Hệ số góc b',value:p.b,unit:''},{name:'Tung độ gốc c',value:p.c,unit:''}]:[{name:'Hoành độ đỉnh x',value:round(-p.b/(2*p.a)),unit:''},{name:'Tung độ đỉnh y',value:round(p.c-p.b**2/(4*p.a)),unit:''},{name:'Trục đối xứng',value:`x = ${round(-p.b/(2*p.a))}`,unit:''}];
    case 'lineGraph':return [{name:'Hệ số góc',value:p.a,unit:''}];
    case 'angles':return [{name:'Số đo góc',value:p.deg,unit:'°'}];
    case 'parallelogram':return [{name:'Chu vi hình bình hành',value:round(2*(p.a+p.b)),unit:'đv'},{name:'Diện tích hình bình hành',value:round(p.a*p.h),unit:'đv²'}];
    case 'symmetryAxis':return [{name:'Số trục đối xứng chính',value:1,unit:'trục'},{name:'Chiều cao trục',value:p.h,unit:'đv'},{name:'Độ rộng đáy',value:p.a,unit:'đv'}];
    case 'symmetryCenter':return [{name:'Góc quay đối xứng qua tâm O',value:180,unit:'°'},{name:'Tỉ lệ cạnh a/b',value:round(p.a/p.b),unit:''}];
    case 'segmentMidpoint':return [{name:'Độ dài MA = MB',value:round(p.len/2),unit:'đv'},{name:'Độ dài đoạn thẳng AB',value:p.len,unit:'đv'}];
    case 'barChart':return [{name:'Cột cao nhất',value:Math.max(p.c1,p.c2,p.c3,p.c4),unit:'đv'},{name:'Tổng số liệu',value:round(p.c1+p.c2+p.c3+p.c4),unit:'đv'}];
    case 'parallelLines':return [{name:'Cặp góc so le trong',value:p.angle,unit:'°'},{name:'Cặp góc trong cùng phía bù nhau',value:180-p.angle,unit:'°'}];
    case 'triangleAngles':return [{name:'Góc C = 180° - A - B',value:Math.max(0,180-p.a-p.b),unit:'°'},{name:'Tổng ba góc A+B+C',value:180,unit:'°'}];
    case 'congruentTriangles':return [{name:'Hai tam giác bằng nhau',value:'ΔABC = ΔA\'B\'C\'',unit:''},{name:'Góc xen giữa',value:p.deg,unit:'°'}];
    case 'pieChart':{const total=p.p1+p.p2+p.p3;return [{name:'Tổng số liệu',value:round(total),unit:'đv'},{name:'Góc quạt phần lớn nhất',value:total>0?round(Math.max(p.p1,p.p2,p.p3)/total*360):0,unit:'°'}];}
    case 'triangleCenters':return [{name:'Tỉ số trọng tâm GA/AM',value:'2/3',unit:''},{name:'Ba trung tuyến',value:'Đồng quy tại G',unit:''}];
    case 'prismQuad':return [{name:'Thể tích lăng trụ V',value:round((p.a+p.b)*p.h_base*p.h/2),unit:'đv³'},{name:'Diện tích đáy',value:round((p.a+p.b)*p.h_base/2),unit:'đv²'}];
    // --- METRICS LỚP 8 ---
    case 'thales':{
      const ratio=p.k/100;
      return [
        {name:'Tỉ số AM/AB = AN/AC',value:round(ratio),unit:''},
        {name:'Đoạn AM',value:round(p.a*ratio),unit:'đv'},
        {name:'Đoạn AN',value:round(p.b*ratio),unit:'đv'},
        {name:'Tính chất',value:'MN // BC',unit:''}
      ];
    }
    case 'midSegment':return [
      {name:'Độ dài đường trung bình MN',value:round(p.a/2),unit:'đv'},
      {name:'Độ dài cạnh đáy BC',value:p.a,unit:'đv'},
      {name:'Quan hệ',value:'MN // BC và MN = 1/2 BC',unit:''}
    ];
    case 'parallelogramMid':return [
      {name:'Tính chất 2 đường chéo',value:'Cắt nhau tại trung điểm mỗi đường',unit:''},
      {name:'Chu vi hình bình hành',value:round(2*(p.a+p.b)),unit:'đv'},
      {name:'Diện tích S',value:round(p.a*p.b*Math.sin(p.deg*pi/180)),unit:'đv²'}
    ];
    case 'rectangleSquare':return [
      {name:'Chu vi',value:round(2*(p.a+p.b)),unit:'đv'},
      {name:'Diện tích',value:round(p.a*p.b),unit:'đv²'},
      {name:'Độ dài đường chéo d',value:round(Math.hypot(p.a,p.b)),unit:'đv'}
    ];
    case 'similarTriangles':return [
      {name:'Tỉ số đồng dạng k',value:p.k,unit:''},
      {name:'Tỉ số diện tích k²',value:round(p.k**2),unit:''},
      {name:'Cạnh đáy tam giác vị tự',value:round(p.a*p.k),unit:'đv'}
    ];
    case 'linearSlope':return [
      {name:'Hệ số góc a',value:p.a,unit:''},
      {name:'Tung độ gốc b',value:p.b,unit:''},
      {name:'Góc dốc so với Ox',value:round(Math.atan(p.a)*180/pi),unit:'°'}
    ];
    // --- METRICS LỚP 9 ---
    case 'sphereSection':{
      const r_sec = Math.sqrt(Math.max(0, p.r**2 - p.d**2));
      return [
        {name:'Bán kính thiết diện tròn r',value:round(r_sec),unit:'đv'},
        {name:'Diện tích thiết diện S',value:round(pi*r_sec**2),unit:'đv²'},
        {name:'Khoảng cách tâm mặt cầu OH',value:p.d,unit:'đv'}
      ];
    }
    case 'trigTriangle':{
      const a = Math.sqrt(Math.max(0, p.c**2 - p.b**2));
      const sinB = p.b / p.c;
      const cosB = a / p.c;
      const tanB = p.b / a;
      return [
        {name:'sin B = AC/BC',value:round(sinB),unit:''},
        {name:'cos B = AB/BC',value:round(cosB),unit:''},
        {name:'tan B = AC/AB',value:round(tanB),unit:''},
        {name:'Góc B',value:round(Math.asin(sinB)*180/pi),unit:'°'}
      ];
    }
    case 'circleTangent':return [
      {name:'Vị trí tương đối',value:Math.abs(p.d - p.r) < 1e-6 ? 'Tiếp xúc (d = R)' : (p.d < p.r ? 'Cắt nhau (d < R)' : 'Không giao nhau (d > R)'),unit:''},
      {name:'Khoảng cách OH',value:p.d,unit:'đv'},
      {name:'Bán kính R',value:p.r,unit:'đv'}
    ];
    case 'circleInscribed':return [
      {name:'Số đo góc ở tâm AOB',value:p.deg,unit:'°'},
      {name:'Số đo góc nội tiếp AMB',value:round(p.deg/2),unit:'°'},
      {name:'Quan hệ',value:'Góc nội tiếp = 1/2 góc ở tâm',unit:''}
    ];
    case 'circumIncircle':{
      const semi = (p.a + p.b + p.c) / 2;
      const area = Math.sqrt(Math.max(0, semi * (semi - p.a) * (semi - p.b) * (semi - p.c)));
      const R_out = (p.a * p.b * p.c) / (4 * area);
      const r_in = area / semi;
      return [
        {name:'Bán kính đường tròn ngoại tiếp R',value:round(R_out),unit:'đv'},
        {name:'Bán kính đường tròn nội tiếp r',value:round(r_in),unit:'đv'},
        {name:'Diện tích tam giác S',value:round(area),unit:'đv²'}
      ];
    }
    case 'cyclicQuad':return [
      {name:'Tổng 2 góc đối diện A + C',value:180,unit:'°'},
      {name:'Tổng 2 góc đối diện B + D',value:180,unit:'°'},
      {name:'Bán kính đường tròn ngoại tiếp R',value:p.r,unit:'đv'}
    ];
    // --- METRICS LỚP 10 ---
    case 'parabolaGeneral':{
      if(Math.abs(p.a)<1e-8)return [{name:'Loại đồ thị',value:Math.abs(p.b)<1e-8?'Hàm số hằng':'Hàm số bậc nhất',unit:''},{name:'Hệ số góc',value:p.b,unit:''}];
      const vx = -p.b / (2 * p.a);
      const vy = p.c - p.b**2 / (4 * p.a);
      const delta = p.b**2 - 4 * p.a * p.c;
      return [
        {name:'Tọa độ đỉnh I (x, y)',value:`(${round(vx)}, ${round(vy)})`,unit:''},
        {name:'Trục đối xứng',value:`x = ${round(vx)}`,unit:''},
        {name:'Biệt thức Δ',value:round(delta),unit:''},
        {name:'Bề lõm',value:p.a > 0 ? 'Quay lên trên (a > 0)' : 'Quay xuống dưới (a < 0)',unit:''}
      ];
    }
    case 'inequalityRegion':return [
      {name:'Vectơ pháp tuyến đường biên n',value:`(${p.a}, ${p.b})`,unit:''},
      {name:'Phương trình đường thẳng biên',value:formatLinearInequality2D(p.a, p.b, '=', p.c),unit:''},
      {name:'Điểm gốc O(0,0)',value:0 <= p.c ? 'Thuộc miền nghiệm' : 'Không thuộc miền nghiệm',unit:''}
    ];
    case 'triangleLaws':{
      const cosA = (p.b**2 + p.c**2 - p.a**2) / (2 * p.b * p.c);
      const angleA = Math.acos(Math.max(-1, Math.min(1, cosA))) * 180 / pi;
      const s = (p.a + p.b + p.c) / 2;
      const area = Math.sqrt(Math.max(0, s * (s - p.a) * (s - p.b) * (s - p.c)));
      return [
        {name:'cos A',value:round(cosA),unit:''},
        {name:'Góc A',value:round(angleA),unit:'°'},
        {name:'Diện tích tam giác S',value:round(area),unit:'đv²'},
        {name:'Bán kính đường tròn ngoại tiếp R',value:round(p.a / (2 * Math.sin(angleA * pi / 180))),unit:'đv'}
      ];
    }
    case 'vectorParallelogram':{
      const sumX = p.ux + p.vx, sumY = p.uy + p.vy;
      const lenSum = Math.hypot(sumX, sumY);
      return [
        {name:'Vectơ tổng w = u + v',value:`(${sumX}, ${sumY})`,unit:''},
        {name:'Độ dài vectơ tổng |u + v|',value:round(lenSum),unit:'đv'},
        {name:'Độ dài |u|',value:round(Math.hypot(p.ux, p.uy)),unit:'đv'},
        {name:'Độ dài |v|',value:round(Math.hypot(p.vx, p.vy)),unit:'đv'}
      ];
    }
    case 'vectorDot':{
      const rad = p.deg * pi / 180;
      const dot = p.ulen * p.vlen * Math.cos(rad);
      return [
        {name:'Tích vô hướng u · v',value:round(dot),unit:''},
        {name:'cos(u, v)',value:round(Math.cos(rad)),unit:''},
        {name:'Trạng thái góc',value:p.deg === 90 ? 'Vuông góc (u ⟂ v)' : (p.deg < 90 ? 'Góc nhọn' : 'Góc tù'),unit:''}
      ];
    }
    case 'lineOxy':return [
      {name:'Vectơ pháp tuyến n',value:`(${p.a}, ${p.b})`,unit:''},
      {name:'Vectơ chỉ phương u',value:`(${-p.b}, ${p.a})`,unit:''},
      {name:'Khoảng cách từ O đến đường thẳng',value:round(Math.abs(p.c) / Math.hypot(p.a, p.b)),unit:'đv'}
    ];
    case 'circleOxy':return [
      {name:'Tâm đường tròn I',value:`(${p.a}, ${p.b})`,unit:''},
      {name:'Bán kính R',value:p.r,unit:'đv'},
      {name:'Chu vi đường tròn',value:round(2*pi*p.r),unit:'đv'},
      {name:'Diện tích hình tròn',value:round(pi*p.r**2),unit:'đv²'}
    ];
    // --- METRICS LỚP 11 ---
    case 'twoPlanes':return [{name:'Góc nghiêng giữa các mặt phẳng',value:p.angle,unit:'°'},{name:'Vị trí',value:'Hai mặt phẳng không song song có giao tuyến',unit:''}];
    case 'skewLines':return [
      {name:'Khoảng cách vuông góc chung',value:p.dist,unit:'đv'},
      {name:'Góc giữa 2 đường thẳng',value:p.angle,unit:'°'},
      {name:'Vị trí tương đối',value:'Chéo nhau (không đồng phẳng và không cắt)',unit:''}
    ];
    case 'lineParallelPlane':return [
      {name:'Khoảng cách d(d, (P))',value:p.dist,unit:'đv'},
      {name:'Vị trí tương đối',value:'Đường thẳng song song với mặt phẳng',unit:''},
      {name:'Số điểm chung',value:0,unit:'điểm'}
    ];
    case 'parallelPlanes':return [
      {name:'Khoảng cách giữa hai mặt phẳng d((P),(Q))',value:p.dist,unit:'đv'},
      {name:'Vị trí tương đối',value:'(P) // (Q)',unit:''},
      {name:'Số điểm chung',value:0,unit:'điểm'}
    ];
    case 'linePerpPlane':{
      const rad = p.slant * pi / 180;
      const projLen = p.h / Math.tan(rad);
      const slantLen = p.h / Math.sin(rad);
      return [
        {name:'Độ dài đoạn vuông góc h (AH)',value:p.h,unit:'đv'},
        {name:'Độ dài hình chiếu (HB)',value:round(projLen),unit:'đv'},
        {name:'Độ dài đường xiên (AB)',value:round(slantLen),unit:'đv'},
        {name:'Định lí ba đường vuông góc',value:'a ⟂ HB ⇔ a ⟂ AB',unit:''}
      ];
    }
    case 'perpendicularPlanes':return [
      {name:'Góc giữa hai mặt phẳng',value:90,unit:'°'},
      {name:'Tính chất',value:'(P) ⟂ (Q)',unit:''},
      {name:'Giao tuyến d',value:'Chứa đường cao vuông góc với mặt phẳng kia',unit:''}
    ];
    case 'linePlaneAngle':{
      const rad = p.deg * pi / 180;
      return [
        {name:'Góc giữa đường thẳng và mặt phẳng φ',value:p.deg,unit:'°'},
        {name:'Độ dài hình chiếu vuông góc',value:round(p.len * Math.cos(rad)),unit:'đv'},
        {name:'Khoảng cách từ đỉnh đến mặt phẳng',value:round(p.len * Math.sin(rad)),unit:'đv'}
      ];
    }
    case 'dihedralAngle':return [
      {name:'Số đo góc nhị diện',value:p.deg,unit:'°'},
      {name:'Số đo góc phẳng nhị diện',value:p.deg,unit:'°'},
      {name:'Trạng thái',value:p.deg === 90 ? 'Hai nửa mặt phẳng vuông góc' : (p.deg < 90 ? 'Góc nhị diện nhọn' : 'Góc nhị diện tù'),unit:''}
    ];
    case 'frustumPyramid':{
      const s1 = p.a**2, s2 = p.b**2;
      const v = (p.h / 3) * (s1 + s2 + Math.sqrt(s1 * s2));
      return [
        {name:'Thể tích chóp cụt đều V',value:round(v),unit:'đv³'},
        {name:'Diện tích đáy lớn S₁',value:round(s1),unit:'đv²'},
        {name:'Diện tích đáy nhỏ S₂',value:round(s2),unit:'đv²'}
      ];
    }
    // --- METRICS LỚP 12 ---
    case 'cubicCurve':{
      const inflecX = -p.b / (3 * p.a);
      const inflecY = p.a * inflecX**3 + p.b * inflecX**2 + p.c * inflecX + p.d;
      const dDelta = (2 * p.b)**2 - 4 * (3 * p.a) * p.c;
      return [
        {name:'Tọa độ điểm uốn U (x, y)',value:`(${round(inflecX)}, ${round(inflecY)})`,unit:''},
        {name:'Số điểm cực trị',value:dDelta > 0 ? '2 cực trị (1 CĐ, 1 CT)' : (dDelta === 0 ? '1 điểm uốn có tiếp tuyến ngang' : 'Không có cực trị (đơn điệu)'),unit:''},
        {name:'Đạo hàm y\'',value:`${3*p.a}x² + ${2*p.b}x + ${p.c}`,unit:''}
      ];
    }
    case 'rationalFunc':{
      const x=-p.d/p.c,y=p.a/p.c,isHole=Math.abs(p.a*p.d-p.b*p.c)<1e-9;
      return isHole ? [
        {name:'Điểm khuyết có thể khử',value:`(${round(x)}, ${round(y)})`,unit:''},
        {name:'Không có tiệm cận đứng',value:'Đúng',unit:''},
        {name:'Tiệm cận ngang',value:`y = ${round(y)}`,unit:''}
      ] : [
        {name:'Tiệm cận đứng',value:`x = ${round(x)}`,unit:''},
        {name:'Tiệm cận ngang',value:`y = ${round(y)}`,unit:''},
        {name:'Tâm đối xứng I (x, y)',value:`(${round(x)}, ${round(y)})`,unit:''},
        {name:'Tập xác định',value:`D = ℝ \ {${round(x)}}`,unit:''}
      ];
    }
    case 'revolvedSolid':{
      const v = (pi * p.h / 3) * (p.r1**2 + p.r1 * p.r2 + p.r2**2);
      return [
        {name:'Thể tích khối tròn xoay V',value:round(v),unit:'đv³'},
        {name:'Công thức tích phân',value:'V = π ∫ [f(x)]² dx',unit:''},
        {name:'Bán kính hai đáy r₁, r₂',value:`${p.r1} và ${p.r2}`,unit:'đv'}
      ];
    }
    case 'conicalFrustum':{
      const r1 = p.r1 || 1.5, r2 = p.r2 || 3, h = p.h || 4;
      const slant = Math.hypot(h, r2 - r1);
      const v = (pi * h / 3) * (r1**2 + r1 * r2 + r2**2);
      const sXq = pi * (r1 + r2) * slant;
      return [
        {name:'Thể tích nón cụt V',value:round(v),unit:'đv³'},
        {name:'Diện tích xung quanh',value:round(sXq),unit:'đv²'},
        {name:'Đường sinh l',value:round(slant),unit:'đv'}
      ];
    }
    case 'oxyzAxes':return [
      {name:'Gốc tọa độ O',value:'(0, 0, 0)',unit:''},
      {name:'Ba trục tọa độ',value:'Ox ⟂ Oy ⟂ Oz',unit:''},
      {name:'Ba mặt phẳng tọa độ',value:'Oxy (z=0), Oyz (x=0), Ozx (y=0)',unit:''}
    ];
    case 'oxyzVector':{
      const len = Math.hypot(p.x, p.y, p.z);
      return [
        {name:'Độ dài vectơ |OM|',value:round(len),unit:'đv'},
        {name:'Hình chiếu lên mp Oxy',value:`M₁(${p.x}, ${p.y}, 0)`,unit:''},
        {name:'Hình chiếu lên trục Oz',value:`M_z(0, 0, ${p.z})`,unit:''}
      ];
    }
    case 'oxyzSphere':return [
      {name:'Tọa độ tâm I (x₀, y₀, z₀)',value:`(${p.x}, ${p.y}, ${p.z})`,unit:''},
      {name:'Bán kính mặt cầu R',value:p.r,unit:'đv'},
      {name:'Thể tích khối cầu V',value:round(4*pi*p.r**3/3),unit:'đv³'},
      {name:'Diện tích mặt cầu S',value:round(4*pi*p.r**2),unit:'đv²'}
    ];
    case 'oxyzPlane':{
      const normLen = Math.hypot(p.A, p.B, p.C);
      return [
        {name:'Vectơ pháp tuyến n',value:`(${p.A}, ${p.B}, ${p.C})`,unit:''},
        {name:'Độ dài vectơ pháp tuyến |n|',value:round(normLen),unit:'đv'},
        {name:'Khoảng cách từ gốc O đến mp',value:round(Math.abs(p.D) / normLen),unit:'đv'}
      ];
    }
    case 'oxyzLine':return [
      {name:'Điểm đi qua M₀',value:`(${p.x0}, ${p.y0}, ${p.z0})`,unit:''},
      {name:'Vectơ chỉ phương u',value:`(${p.u1}, ${p.u2}, ${p.u3})`,unit:''},
      {name:'Độ dài vectơ chỉ phương',value:round(Math.hypot(p.u1, p.u2, p.u3)),unit:'đv'}
    ];
    case 'oxyzDistance':{
      const dist = Math.abs(p.z - p.d);
      return [
        {name:'Khoảng cách d(M, (P))',value:round(dist),unit:'đv'},
        {name:'Tọa độ hình chiếu H trên (P)',value:`(${p.x}, ${p.y}, ${p.d})`,unit:''},
        {name:'Vị trí tương đối',value:dist === 0 ? 'Điểm M thuộc mặt phẳng' : 'Điểm M nằm ngoài mặt phẳng',unit:''}
      ];
    }
    default:return [];
  }
}
/** Chuyển đổi công thức LaTeX sang HTML toán học đẹp, trực quan */
export function formatMathHtml(latex) {
  if (!latex) return '';
  let s = String(latex).trim().replace(/\text\{/g, '\\text{');
  const textSlots = [];
  s = s.replace(/\\(?:text|mathrm)\{([^{}]*)\}/g, (_, t) => {
    const id = `@@TXT#${textSlots.length}@@`;
    textSlots.push(`<span class="mv-math-text">${t}</span>`);
    return id;
  });
  for (let i = 0; i < 3; i++) {
    s = s.replace(/\\sqrt\[([^\]]+)\]\{([^{}]+)\}/g, '<span class="math-sqrt mv-math-sqrt"><sup class="mv-math-root-idx">$1</sup><span class="math-surd mv-math-surd">√</span><span class="math-radicand mv-math-radicand">$2</span></span>');
    s = s.replace(/\\sqrt\{([^{}]+)\}/g, '<span class="math-sqrt mv-math-sqrt"><span class="math-surd mv-math-surd">√</span><span class="math-radicand mv-math-radicand">$1</span></span>');
    s = s.replace(/\\overrightarrow\{([^{}]+)\}/g, '<span class="math-vec mv-math-vec"><span class="math-vec-arrow mv-math-vec-arrow">⟶</span><span class="math-vec-sym mv-math-vec-sym">$1</span></span>');
    s = s.replace(/\\vec\{([^{}]+)\}/g, '<span class="math-vec mv-math-vec"><span class="math-vec-arrow mv-math-vec-arrow">→</span><span class="math-vec-sym mv-math-vec-sym">$1</span></span>');
    s = s.replace(/\\vec\s+([a-zA-Z0-9])/g, '<span class="math-vec mv-math-vec"><span class="math-vec-arrow mv-math-vec-arrow">→</span><span class="math-vec-sym mv-math-vec-sym">$1</span></span>');
    s = s.replace(/\\(?:overline|bar)\{([^{}]+)\}/g, '<span class="mv-math-overline">$1</span>');
    s = s.replace(/\\(?:widehat|hat)\{([^{}]+)\}/g, '<span class="mv-math-hat">$1</span>');
    s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '<span class="math-frac mv-math-frac"><span class="math-num mv-math-num">$1</span><span class="math-denom mv-math-den">$2</span></span>');
    s = s.replace(/\\frac([0-9a-zA-Z])([0-9a-zA-Z])/g, '<span class="math-frac mv-math-frac"><span class="math-num mv-math-num">$1</span><span class="math-denom mv-math-den">$2</span></span>');
  }
  const tags = [];
  const safeTagRe = /^<\/?(?:span|sup|sub|strong|em|b|i|br|small|code)(?:\s+(?:class|aria-hidden)="[^"]*")*\s*\/?>$/i;
  s = s.replace(/<[^>]+>/g, tag => {
    if (!safeTagRe.test(tag)) {
      return tag.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    const id = `@@TAG#${tags.length}@@`;
    tags.push(tag);
    return id;
  });
  s = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\\left\s*([()[\]|])/g, '$1')
    .replace(/\\right\s*([()[\]|])/g, '$1')
    .replace(/\\Leftrightarrow|\\iff/g, ' ⇔ ')
    .replace(/\\Rightarrow|\\implies/g, ' ⇒ ')
    .replace(/\\longrightarrow|\\rightarrow|\\to/g, ' → ')
    .replace(/\\le(?:q)?(?![a-zA-Z])/g, ' ≤ ')
    .replace(/\\ge(?:q)?(?![a-zA-Z])/g, ' ≥ ')
    .replace(/\\ne(?:q)?(?![a-zA-Z])/g, ' ≠ ')
    .replace(/\\approx(?![a-zA-Z])/g, ' ≈ ')
    .replace(/\\cong(?![a-zA-Z])/g, ' ≅ ')
    .replace(/\\sim(?![a-zA-Z])/g, ' ∼ ')
    .replace(/\\pm(?![a-zA-Z])/g, ' ± ')
    .replace(/\\cdot(?![a-zA-Z])/g, ' · ')
    .replace(/\\times(?![a-zA-Z])/g, ' × ')
    .replace(/\\cup(?![a-zA-Z])/g, ' ∪ ')
    .replace(/\\cap(?![a-zA-Z])/g, ' ∩ ')
    .replace(/\\setminus(?![a-zA-Z])/g, ' ∖ ')
    .replace(/\\in(?![a-zA-Z])/g, ' ∈ ')
    .replace(/\\notin(?![a-zA-Z])/g, ' ∉ ')
    .replace(/\\varnothing|\\emptyset/g, '∅')
    .replace(/\\infty(?![a-zA-Z])/g, '∞')
    .replace(/\\parallel(?![a-zA-Z])/g, ' ∥ ')
    .replace(/\\perp(?![a-zA-Z])/g, ' ⊥ ')
    .replace(/\\angle(?![a-zA-Z])/g, '∠')
    .replace(/\\triangle(?![a-zA-Z])/g, '△')
    .replace(/\^\\circ|\\circ(?![a-zA-Z])/g, '°')
    .replace(/\\prime(?![a-zA-Z])/g, '′')
    .replace(/\\ell(?![a-zA-Z])/g, 'ℓ')
    .replace(/\\alpha(?![a-zA-Z])/g, 'α')
    .replace(/\\beta(?![a-zA-Z])/g, 'β')
    .replace(/\\gamma(?![a-zA-Z])/g, 'γ')
    .replace(/\\Delta(?![a-zA-Z])/g, 'Δ')
    .replace(/\\varphi(?![a-zA-Z])|\\phi(?![a-zA-Z])/g, 'φ')
    .replace(/\\theta(?![a-zA-Z])/g, 'θ')
    .replace(/\\pi(?![a-zA-Z])/g, 'π')
    .replace(/\\Omega(?![a-zA-Z])/g, 'Ω')
    .replace(/\\int(?![a-zA-Z])/g, '∫')
    .replace(/\\sum(?![a-zA-Z])/g, '∑')
    .replace(/\\(sin|cos|tan|cot|log|ln|lim|max|min)(?![a-zA-Z])/g, '<span class="mv-math-fn">$1</span>')
    .replace(/\\qquad|\\quad/g, ' &nbsp; ')
    .replace(/\\[,;:!]/g, ' ')
    .replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>')
    .replace(/\^([0-9a-zA-Z′+-])/g, '<sup>$1</sup>')
    .replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>')
    .replace(/_([0-9a-zA-Z+-])/g, '<sub>$1</sub>');
  for (let pass = 0; pass < 4; pass++) {
    s = s.replace(/@@TAG#(\d+)@@/g, (_, i) => tags[Number(i)] || '');
    s = s.replace(/@@TXT#(\d+)@@/g, (_, i) => textSlots[Number(i)] || '');
  }
  return `<span class="math-rendered mv-math-rendered">${s}</span>`;
}
/** Bộ nhận dạng từ khóa OFFLINE, chỉ gợi ý mẫu đã được định nghĩa. */
export function recognizeIdea(text,grade=8) {
  const s=String(text||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
  const rules=[
    [/chop (tu giac|day vuong)|chop deu.*(vuong|tu giac)/,'squarePyramid'],
    [/chop tam giac|tu dien deu/,'trianglePyramid'],
    [/chop cut/,'frustumPyramid'],
    [/lang tru tu giac/,'prismQuad'],
    [/lang tru/,'triPrism'],[/mat cat.*cau|thiet dien.*cau/,'sphereSection'],
    [/mat cat|thiet dien/,'crossSection'],
    [/thales|ta let/,'thales'],
    [/duong trung binh/,'midSegment'],
    [/tam giac dong dang|vi tu/,'similarTriangles'],
    [/ti so luong giac|sin.*cos/,'trigTriangle'],
    [/tiep tuyen/,'circleTangent'],
    [/goc noi tiep|goc o tam/,'circleInscribed'],
    [/ngoai tiep.*tam giac|noi tiep.*tam giac/,'circumIncircle'],
    [/tu giac noi tiep/,'cyclicQuad'],
    [/bac hai.*y\s*=|parabol.*tong quat/,'parabolaGeneral'],
    [/bat phuong trinh|mien nghiem/,'inequalityRegion'],
    [/dinh li cosin|dinh li sin/,'triangleLaws'],
    [/quy tac hinh binh hanh|cong ve[cct]o/,'vectorParallelogram'],
    [/tich vo huong/,'vectorDot'],
    [/duong thang.*oxy|ve[cct]o phap tuyen/,'lineOxy'],
    [/duong tron.*oxy/,'circleOxy'],
    [/cheo nhau/,'skewLines'],
    [/song song.*mat phang/,'lineParallelPlane'],
    [/hai mat phang song song/,'parallelPlanes'],
    [/ba duong vuong goc|vuong goc.*mat phang/,'linePerpPlane'],
    [/hai mat phang vuong goc/,'perpendicularPlanes'],
    [/goc.*duong thang.*mat phang/,'linePlaneAngle'],
    [/goc nhi dien/,'dihedralAngle'],
    [/bac ba/,'cubicCurve'],
    [/phan thuc|tiem can/,'rationalFunc'],
    [/tron xoay|tich phan/,'revolvedSolid'],
    [/he truc.*oxyz|ba mat phang|truc.*oxyz/,'oxyzAxes'],
    [/toa do diem.*oxyz|diem.*oxyz/,'oxyzVector'],
    [/mat cau.*oxyz/,'oxyzSphere'],
    [/mat phang.*oxyz/,'oxyzPlane'],
    [/duong thang.*oxyz/,'oxyzLine'],
    [/khoang cach.*oxyz/,'oxyzDistance'],
    [/pythagore|pitago/,'pythagoras'],[/hop chu nhat/,'cuboid'],[/lap phuong/,'cube'],
    [/hinh chu nhat|hinh vuong/,'rectangleSquare'],
    [/hinh tru/,'cylinder'],[/hinh non/,'cone'],[/mat cau|hinh cau/,'sphere'],
    [/he so goc|bac nhat.*he so/,'linearSlope'],
    [/do thi ham bac nhat|duong thang.*y\s*=/,'lineGraph'],
    [/parabol|parabola|bac hai/,'parabola'],[/ham sin|sin\(/,'sine'],
    [/ham mu/,'exponential'],[/ham bac ba|dao ham/,'derivative'],
    [/hyperbol|hypebol/,'hyperbola'],[/elip|ellipse/,'ellipse'],
    [/ve[cct]o|vector/,'vector'],[/mat phang/,'plane'],
    [/hai mat phang/,'twoPlanes'],
    [/hinh binh hanh.*trung diem|hai duong cheo/,'parallelogramMid'],
    [/hinh binh hanh/,'parallelogram'],
    [/truc doi xung/,'symmetryAxis'],
    [/tam doi xung/,'symmetryCenter'],
    [/trung diem|doan thang/,'segmentMidpoint'],
    [/bieu do cot|thong ke/,'barChart'],
    [/song song|cat tuyen/,'parallelLines'],
    [/tong.*goc.*tam giac/,'triangleAngles'],
    [/tam giac bang nhau/,'congruentTriangles'],
    [/quat tron|bieu do tron/,'pieChart'],
    [/trong tam|dong quy/,'triangleCenters'],
    [/hinh thang/,'trapezoid'],[/hinh thoi/,'rhombus'],
    [/da giac/,'polygon'],[/hinh tron|duong tron/,'circle'],
    [/goc/,'angles'],[/tam giac vuong/,'triangle']
  ];
  const found=rules.find(([re])=>re.test(s));
  if(!found) return null;
  const type=found[1];
  const params=Object.fromEntries(Object.entries(TYPES[type].params).map(([k,setting])=>[k,setting[3]]));
  // Chi trich xuat so khi du kien duoc gan nhan ro rang. Khong tu doan tu anh.
  for(const [key,pattern] of Object.entries({a:/(?:canh day|canh|day lon|a\s*=)\s*[:=]?\s*(\d+(?:[.,]\d+)?)/,h:/(?:chieu cao|h\s*=)\s*[:=]?\s*(\d+(?:[.,]\d+)?)/,r:/(?:ban kinh|r\s*=)\s*[:=]?\s*(\d+(?:[.,]\d+)?)/})) {
    const m=s.match(pattern);
    if(m && key in params) params[key]=Number(m[1].replace(',','.'));
  }
  return normalizeExhibit({id:`draft_${Date.now()}`,grade,type,title:TYPES[type].name,category:'Mô hình do cô tạo',description:'Mô hình được gợi ý từ từ khóa. Cô kiểm tra lại dữ kiện và chỉnh các tham số trước khi lưu.',params,custom:true});
}
