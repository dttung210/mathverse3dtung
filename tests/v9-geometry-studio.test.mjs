import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeExhibit } from '../src/math-core.js';
import { buildPresets } from '../src/studio/presets.js';
import { getSolidHandles, clampHandleValue } from '../src/studio/solid-handles.js';
import { Geometry2DViewer } from '../src/viewers/Geometry2DViewer.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8')).items;
const get=(grade,type)=>catalog.find(m=>m.grade===grade&&m.type===type);
const eps=(a,b)=>Math.abs(a-b)<1e-7;

test('Thư viện V9 giữ 63 mô hình, bổ sung đúng 42 mẫu thuộc 7 lớp',()=>{
  const originals=JSON.stringify(catalog);
  const p=buildPresets(catalog);
  assert.equal(catalog.length,63);assert.equal(p.length,42);
  assert.equal(JSON.stringify(catalog),originals);
  assert.equal(new Set(p.map(x=>x.id)).size,42);
  for(const g of [6,7,8,9,10,11,12])assert.equal(p.filter(x=>x.grade===g).length,6);
  for(const model of p){
    assert.ok(model.id.startsWith('preset_'));
    assert.ok(model.title.length>5);
    assert.ok(Object.values(model.params).every(Number.isFinite));
    assert.equal(normalizeExhibit(model).grade,model.grade);
  }
});

test('Tay nắm 3D chỉ áp dụng cho loại hình hỗ trợ, chỉ sửa tham số tồn tại',()=>{
  for(const model of catalog){
    const h=getSolidHandles(model.type,model.params);
    for(const d of h){
      assert.equal(d.pos.length,3);assert.equal(d.axis.length,3);
      assert.ok(d.pos.every(Number.isFinite));
      assert.ok(d.axis.every(Number.isFinite));
      assert.ok(d.factor>0);
      assert.ok(d.key in model.params);
      assert.ok(clampHandleValue(model.type,d.key,model.params[d.key])!==null);
    }
  }
});

test('Chóp tứ giác đều: tay nắm chiều cao và đáy không làm mất điều kiện đều',()=>{
  const m=get(8,'squarePyramid'),list=getSolidHandles(m.type,m.params);
  assert.deepEqual(list.map(x=>x.key),['h','a']);
  assert.deepEqual(list[0].axis,[0,1,0]);
  assert.equal(list[0].factor,2);
  assert.equal(clampHandleValue('squarePyramid','h',1e6),12);
  assert.equal(clampHandleValue('squarePyramid','missing',1),null);
});

test('Hình chữ nhật 2D giữ vuông góc sau khi thay trực tiếp hai đỉnh đối',()=>{
  const v=new Geometry2DViewer(get(8,'rectangleSquare'));
  assert.equal(v.isEditable,true);
  v.points.A=[-3,-1];v.points.C=[4,2];
  const scene=v._getScene();const pts=scene.primitives.find(x=>x.kind==='polygon').pts;
  assert.deepEqual(pts,[[-3,-1],[4,-1],[4,2],[-3,2]]);
  assert.ok(eps(pts[1][0]-pts[0][0],7));
});

test('Hình thoi: hai đường chéo vuông góc và chia đôi',()=>{
  const v=new Geometry2DViewer(get(6,'rhombus'));
  v.points.A=[0,4];v.points.B=[5,0];
  const pts=v._getScene().primitives.find(x=>x.kind==='polygon').pts;
  assert.deepEqual(pts,[[0,4],[5,0],[0,-4],[-5,0]]);
});

test('Vectơ: điểm W luôn là U+V khi kéo các đầu',()=>{
  const v=new Geometry2DViewer(get(10,'vectorParallelogram'));
  v.points.U=[2,-1];v.points.V=[-3,4];
  const W=v._getScene().primitives.find(x=>x.kind==='point'&&x.name==='W').xy;
  assert.deepEqual(W,[-1,3]);
});

test('Đường tròn Oxy: bán kính phụ thuộc tâm I và điểm A',()=>{
  const v=new Geometry2DViewer(get(10,'circleOxy'));
  v.points.I=[1,1];v.points.A=[4,5];
  const c=v._getScene().primitives.find(x=>x.kind==='circle');
  assert.deepEqual(c.center,[1,1]);assert.ok(eps(c.r,5));
});

test('Tiếp tuyến: d=r có đúng một tiếp điểm trên đường tròn',()=>{
  const v=new Geometry2DViewer(get(9,'circleTangent'));
  v.points.H=[0,3];v.points.R=[3,0];
  const scene=v._getScene();const c=scene.primitives.find(x=>x.kind==='circle');
  const l=scene.primitives.find(x=>x.kind==='line');
  assert.equal(c.r,3);assert.equal(l.a[1],3);
});
