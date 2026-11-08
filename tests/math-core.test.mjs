import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {GRADES,TYPES,normalizeExhibit,metrics,recognizeIdea,formatMathHtml} from '../src/math-core.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8'));
const one=(type,params)=>metrics(type,params)[0]?.value;
test('63 mẫu chuẩn GDPT 2018, 7 phòng, mỗi phòng chính xác 9 mô hình (7x9=63)',()=>{
  assert.equal(GRADES.length,7);
  assert.equal(catalog.items.length,63);
  for(const grade of [6,7,8,9,10,11,12]){
    const gradeItems = catalog.items.filter(i=>i.grade===grade);
    assert.equal(gradeItems.length,9,`Lớp ${grade} phải có chính xác 9 mô hình`);
  }
  assert.equal(new Set(catalog.items.map(i=>i.id)).size,catalog.items.length);
});
test('Tất cả mẫu có loại hình và dữ liệu hợp lệ',()=>{
  for(const raw of catalog.items){assert.ok(TYPES[raw.type],`Thiếu ${raw.type}`);const model=normalizeExhibit(raw);
    assert.ok(model.title.length);assert.equal(model.grade,raw.grade);
    for(const [k,v] of Object.entries(model.params))assert.ok(Number.isFinite(v),k);
  }
});
test('Thể tích hình chóp tứ giác đều 4 cm x 3 cm',()=>assert.equal(one('squarePyramid',{a:4,h:3}),16));
test('Hình cầu r=3: thể tích và diện tích',()=>{
  const m=metrics('sphere',{r:3});assert.equal(m[0].value,113.097);assert.equal(m[1].value,113.097);
});
test('Hình trụ r=2 h=4 và hình nón có cùng đáy cao',()=>{
  const tru=one('cylinder',{r:2,h:4});const non=one('cone',{r:2,h:4});
  assert.ok(Math.abs(tru-3*non)<.003);
});
test('Định lý Pythagore 3-4-5',()=>assert.equal(one('pythagoras',{a:3,b:4}),5));
test('Tứ diện đều công thức thể tích',()=>assert.equal(one('tetrahedron',{a:6}),25.456));
test('Hình bình hành a=6, b=4, h=3.5: chu vi 20, diện tích 21',()=>{
  const m=metrics('parallelogram',{a:6,b:4,h:3.5});
  assert.equal(m[0].value,20);assert.equal(m[1].value,21);
});
test('Đoạn thẳng AB=8: trung điểm MA=MB=4',()=>{
  const m=metrics('segmentMidpoint',{len:8});
  assert.equal(m[0].value,4);assert.equal(m[1].value,8);
});
test('Hai đường thẳng song song: góc so le trong 65°, góc trong cùng phía 115°',()=>{
  const m=metrics('parallelLines',{angle:65,dist:3});
  assert.equal(m[0].value,65);assert.equal(m[1].value,115);
});
test('Tổng ba góc trong tam giác A=60°, B=70° -> C=50°, Tổng=180°',()=>{
  const m=metrics('triangleAngles',{a:60,b:70});
  assert.equal(m[0].value,50);assert.equal(m[1].value,180);
});
test('Lăng trụ đứng tứ giác a=5, b=3, h_base=3, h=6: V=72',()=>{
  const m=metrics('prismQuad',{a:5,b:3,h_base:3,h:6});
  assert.equal(m[0].value,72);
});

// --- TESTS MỚI TOÁN LỚP 8 ---
test('Định lí Thalès: AB=6, AC=7, k=50% -> AM=3, AN=3.5',()=>{
  const m=metrics('thales',{a:6,b:7,k:50});
  assert.equal(m[0].value,0.5);
  assert.equal(m[1].value,3);
  assert.equal(m[2].value,3.5);
});
test('Đường trung bình tam giác: BC=6 -> MN=3',()=>{
  const m=metrics('midSegment',{a:6,h:5});
  assert.equal(m[0].value,3);
});
test('Tam giác đồng dạng: k=0.6, S\'/S=0.36',()=>{
  const m=metrics('similarTriangles',{k:0.6,a:5});
  assert.equal(m[0].value,0.6);
  assert.equal(m[1].value,0.36);
});

// --- TESTS MỚI TOÁN LỚP 9 ---
test('Thiết diện cắt mặt cầu R=4, d=2: r = sqrt(16-4) = sqrt(12) = 3.464',()=>{
  const m=metrics('sphereSection',{r:4,d:2});
  assert.equal(m[0].value,3.464);
});
test('Tỉ số lượng giác tam giác vuông kề=4, huyền=5: sin=0.6, cos=0.8, tan=0.75',()=>{
  const m=metrics('trigTriangle',{b:3,c:5});
  assert.equal(m[0].value,0.6);
  assert.equal(m[1].value,0.8);
  assert.equal(m[2].value,0.75);
});
test('Góc nội tiếp chắn cung 80° bằng 40°',()=>{
  const m=metrics('circleInscribed',{r:3,deg:80});
  assert.equal(m[0].value,80);
  assert.equal(m[1].value,40);
});

// --- TESTS MỚI TOÁN LỚP 10 ---
test('Parabol tổng quát y = x^2 - 2x - 1: đỉnh I(1, -2)',()=>{
  const m=metrics('parabolaGeneral',{a:1,b:-2,c:-1});
  assert.equal(m[0].value,'(1, -2)');
  assert.equal(m[1].value,'x = 1');
});
test('Định lí Côsin tam giác đều cạnh 5: cosA = 0.5, góc A = 60°',()=>{
  const m=metrics('triangleLaws',{a:5,b:5,c:5});
  assert.equal(m[0].value,0.5);
  assert.equal(m[1].value,60);
});
test('Tích vô hướng hai vectơ u=4, v=3, góc=60°: u·v = 4*3*0.5 = 6',()=>{
  const m=metrics('vectorDot',{ulen:4,vlen:3,deg:60});
  assert.equal(m[0].value,6);
});

// --- TESTS MỚI TOÁN LỚP 11 ---
test('Chóp cụt tứ giác đều a=5, b=2, h=3: V = 39',()=>{
  const m=metrics('frustumPyramid',{a:5,b:2,h:3});
  // V = 3/3 * (25 + 4 + 10) = 39
  assert.equal(m[0].value,39);
});
test('Đường vuông góc mặt phẳng: h=3, góc nghiêng 45° -> đường xiên = 3*sqrt(2) = 4.243',()=>{
  const m=metrics('linePerpPlane',{h:3,slant:45});
  assert.equal(m[0].value,3);
  assert.equal(m[2].value,4.243);
});

// --- TESTS MỚI TOÁN LỚP 12 ---
test('Hàm bậc ba y = 0.5x^3 - 3x + 1: điểm uốn x = 0, y = 1',()=>{
  const m=metrics('cubicCurve',{a:0.5,b:0,c:-3,d:1});
  assert.equal(m[0].value,'(0, 1)');
});
test('Hàm phân thức y = (2x+1)/(x-1): tiệm cận đứng x=1, tiệm cận ngang y=2',()=>{
  const m=metrics('rationalFunc',{a:2,b:1,c:1,d:-1});
  assert.equal(m[0].value,'x = 1');
  assert.equal(m[1].value,'y = 2');
  assert.equal(m[2].value,'(1, 2)');
});
test('Khoảng cách từ M(2, 3, 4) đến mặt phẳng z = 0 là 4',()=>{
  const m=metrics('oxyzDistance',{x:2,y:3,z:4,d:0});
  assert.equal(m[0].value,4);
});

test('Format LaTeX sang HTML toán học trực quan',()=>{
  const res=formatMathHtml('V=\\frac{1}{3}a^2h');
  assert.ok(res.includes('math-frac'));
  assert.ok(res.includes('<sup>2</sup>'));
  const vecRes=formatMathHtml('\\vec{u}');
  assert.ok(vecRes.includes('math-vec'));
});
test('Nhận dạng từ khóa offline các mô hình mới',()=>{
  const thales=recognizeIdea('Định lí Thales lớp 8',8);
  assert.equal(thales.type,'thales');
  const mid=recognizeIdea('Đường trung bình tam giác',8);
  assert.equal(mid.type,'midSegment');
  const oxyz=recognizeIdea('Hệ trục tọa độ Oxyz ba mặt phẳng',12);
  assert.equal(oxyz.type,'oxyzAxes');
  const frustum=recognizeIdea('Hình chóp cụt tứ giác đều',11);
  assert.equal(frustum.type,'frustumPyramid');
});


