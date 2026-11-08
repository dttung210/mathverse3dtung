import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeExhibit,metrics} from '../src/math-core.js';
import {buildGeometry2DScene} from '../src/math/geometry2d-scenes.js';
import {StatisticsChartViewer} from '../src/viewers/StatisticsChartViewer.js';
import {FunctionGraphViewer} from '../src/viewers/FunctionGraphViewer.js';
import {Solid3DViewer} from '../src/viewers/Solid3DViewer.js';
import {createMathModel,disposeObject} from '../src/geometry.js';
if(!globalThis.document)globalThis.document={createElement:()=>({width:128,height:128,getContext:()=>({beginPath(){},arc(){},fill(){},stroke(){},fillText(){},roundRect(){}})})};
const catalog=JSON.parse(readFileSync(new URL('../data/catalog.json',import.meta.url))).items;

function mdl(id){return normalizeExhibit(catalog.find(m=>m.id===id));}
test('Bảng số liệu của giáo viên được ưu tiên và không trở về bộ mẫu',()=>{
  for(const id of ['g6_13','g7_12']){
    const m={...mdl(id),data:{kind:'categorical_frequency',values:[7,13],labels:['Tổ A','Tổ B'],unit:'em'}};
    const v=new StatisticsChartViewer(m);
    assert.deepEqual(v.data.values,[7,13]);assert.deepEqual(v.data.labels,['Tổ A','Tổ B']);
    assert.equal(v.getMetrics().find(x=>x.name==='Tổng số lượng').value,'20');
    v.setDataValues([8,11]);
    assert.deepEqual(v.getState().data.values,[8,11]);
    v.reset();assert.deepEqual(v.data.values,[7,13]);
  }
});
test('Góc kề bù lớp 7 có hai cung, hai tia đối, góc còn lại 180-alpha',()=>{
  const scene=buildGeometry2DScene('angles',{deg:70},7);
  assert.equal(scene.primitives.filter(x=>x.kind==='arc').length,2);
  assert.ok(scene.primitives.some(x=>x.kind==='point'&&x.name==='110°'));
  const g=buildGeometry2DScene('angles',{deg:70},6);
  assert.equal(g.primitives.filter(x=>x.kind==='arc').length,1);
});
test('Bộ xem đồ thị chặn trạng thái vô nghĩa khi sửa hệ số',()=>{
  const inequality=new FunctionGraphViewer(mdl('g10_02'));
  inequality.updateParameters({a:0,b:0,c:4});
  assert.notEqual(Math.hypot(inequality.params.a,inequality.params.b),0);
  const rational=new FunctionGraphViewer(mdl('g12_02'));
  rational.updateParameters({c:0});assert.equal(rational.params.c,1);
  const cubic=new FunctionGraphViewer(mdl('g12_01'));
  cubic.updateParameters({a:0});assert.ok(Math.abs(cubic.params.a)>=0.05);
  const linear=new FunctionGraphViewer(mdl('g8_09'));
  linear.updateParameters({b:2,c:3});assert.deepEqual(linear.getState().params,{a:2,b:3});
});
test('Hai mặt phẳng có giao tuyến không được song song',()=>{
  const m=normalizeExhibit({...mdl('g11_01'),params:{gap:2,angle:0}});
  assert.ok(m.params.angle>=1);
});
test('Lăng trụ đứng tứ giác đúng tọa độ đáy, độ cao và diện tích',()=>{
  const m=mdl('g7_14');const g=createMathModel(m);
  let mesh;g.traverse(x=>{if(x.isMesh&&x.geometry.type==='BufferGeometry'&&x.geometry.getAttribute('position')?.count>=36)mesh=x;});
  assert.ok(mesh,'Thiếu mặt lăng trụ');
  const pos=mesh.geometry.getAttribute('position');
  const verts=Array.from({length:pos.count},(_,i)=>[pos.getX(i),pos.getY(i),pos.getZ(i)]);
  const range=i=>[Math.min(...verts.map(v=>v[i])),Math.max(...verts.map(v=>v[i]))];
  assert.ok(Math.abs(range(1)[1]-range(1)[0]-m.params.h)<1e-5);
  assert.ok(Math.abs(range(2)[1]-range(2)[0]-m.params.h_base)<1e-5);
  assert.ok(Math.abs(range(0)[1]-range(0)[0]-m.params.a)<1e-5);
  const v=metrics(m.type,m.params).find(x=>x.name.includes('Thể tích'));
  assert.ok(Math.abs(v.value-(m.params.a+m.params.b)*m.params.h_base*m.params.h/2)<0.01);
  disposeObject(g);
});
test('Mô hình mặt phẳng 3D tự chuẩn hóa tham số sửa',()=>{
  const v=new Solid3DViewer(mdl('g12_07'));
  v.scene={add(){},remove(){}};v.grid={visible:true};v.axes={visible:true};
  v.updateParameters({A:0,B:0,C:0,D:3});
  assert.ok(Math.hypot(v.params.A,v.params.B,v.params.C)>0);
  disposeObject(v.meshGroup);
});
test('Tệp cấu hình mẫu không chứa khóa riêng',()=>{
  const env=readFileSync(new URL('../.env.example',import.meta.url),'utf8');
  assert.match(env,/GEMINI_API_KEY=\s*\n/);
  assert.doesNotMatch(env,/AQ\.[A-Za-z0-9]{25,}|AIza[\w-]{30,}/);
});
