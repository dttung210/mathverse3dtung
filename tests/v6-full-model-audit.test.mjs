import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import { buildGeometry2DScene, GEOMETRY_2D_TYPES } from '../src/math/geometry2d-scenes.js';
import { detectModality } from '../src/data/migrate-v2-v4-v5.js';
import { normalizeExhibit, TYPES, metrics, formatMathHtml } from '../src/math-core.js';
import { StatisticsChartViewer } from '../src/viewers/StatisticsChartViewer.js';
import { FunctionGraphViewer } from '../src/viewers/FunctionGraphViewer.js';
import { Geometry2DViewer } from '../src/viewers/Geometry2DViewer.js';
import { SafeExpression } from '../src/math/safe-expression.js';
import { createMathModel, disposeObject } from '../src/geometry.js';
import { Constraints } from '../src/math/constraints.js';

// Minimal canvas stub for Three.js CanvasTexture sprites; no GPU required.
if(!globalThis.document){globalThis.document={createElement:(tag)=>({width:128,height:128,getContext:()=>({beginPath(){},arc(){},fill(){},stroke(){},fillText(){},roundRect(){}})})};}
const items=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8')).items;
function finitePrimitive(g){
  const pts=[g.xy,g.center,g.a,g.b,...(g.pts||[])].filter(Array.isArray);
  assert.ok(pts.every(p=>p.every(Number.isFinite)),`NaN in 2D ${JSON.stringify(g)}`);
}
const near=(x,y,eps=1e-6)=>assert.ok(Math.abs(x-y)<eps,`${x} expected ${y}`);

test('63 mẫu thuộc 7 phòng, tự dựng đúng viewer và đúng phép tính',()=>{
  assert.equal(items.length,63);
  for(const g of [6,7,8,9,10,11,12])assert.equal(items.filter(i=>i.grade===g).length,9);
  for(const item of items){
    const m=normalizeExhibit(item),mod=detectModality(m.type);
    assert.ok(['geometry2d','solid3d','functiongraph','statisticschart'].includes(mod),item.id);
    const values=metrics(m.type,m.params);
    assert.ok(Array.isArray(values),item.id);
    if(mod==='geometry2d'){
      assert.ok(GEOMETRY_2D_TYPES.includes(m.type),`Không có scene thực cho ${m.type}`);
      const scene=buildGeometry2DScene(m.type,m.params);
      assert.ok(scene.primitives.length>=3,`Hình 2D quá ít đối tượng: ${item.id}`);
      scene.primitives.forEach(finitePrimitive);
      const viewer=new Geometry2DViewer(m);assert.equal(viewer.model.type,m.type);
    }else if(mod==='functiongraph'){
      const viewer=new FunctionGraphViewer(m);
      assert.ok(Object.values(viewer.params).every(Number.isFinite),item.id);
      if(m.type==='inequalityRegion') assert.equal(viewer.evaluate(2),null);
      else assert.ok(typeof viewer.evaluate(1)==='number'||viewer.evaluate(1)===null,item.id);
    }else if(mod==='statisticschart'){
      const v=new StatisticsChartViewer(m);
      assert.ok(v.data.values.length>0,item.id);
      if(m.type==='pieChart'){assert.deepEqual(v.data.values,[m.params.p1,m.params.p2,m.params.p3]);assert.equal(v.chartKind,'pie');}
      if(m.type==='barChart')assert.deepEqual(v.data.values,[m.params.c1,m.params.c2,m.params.c3,m.params.c4]);
      assert.ok(v.getMetrics().every(x=>x.name&&x.value!==undefined));
    }else{
      const holder=createMathModel(m);
      const bounds=new THREE.Box3().setFromObject(holder);
      assert.ok(!bounds.isEmpty()&&[bounds.min.x,bounds.min.y,bounds.min.z,bounds.max.x,bounds.max.y,bounds.max.z].every(Number.isFinite),item.id);
      disposeObject(holder);
    }
  }
});

test('Toàn bộ tham số cực trị của 63 mẫu không gây NaN/vật thể hỏng',()=>{
  let count=0;
  for(const item of items){
    for(const [key,sp] of Object.entries(TYPES[item.type].params)){
      for(const edge of [sp[1],sp[2]]){
        const m=normalizeExhibit({...item,params:{...item.params,[key]:edge}});
        const mod=detectModality(m.type);
        if(mod==='geometry2d'){
          buildGeometry2DScene(m.type,m.params).primitives.forEach(finitePrimitive);
        }else if(mod==='solid3d'){
          const obj=createMathModel(m);
          const box=new THREE.Box3().setFromObject(obj);
          assert.ok(!box.isEmpty(),`empty ${m.type}:${key}=${edge}`);
          assert.ok([box.min.x,box.min.y,box.min.z,box.max.x,box.max.y,box.max.z].every(Number.isFinite),`bad 3D ${m.type}:${key}=${edge}`);
          disposeObject(obj);
        }else if(mod==='functiongraph'){
          const v=new FunctionGraphViewer(m);assert.ok(Object.values(v.params).every(Number.isFinite));
        }else{const v=new StatisticsChartViewer(m);assert.ok(v.data.values.every(Number.isFinite));}
        count++;
      }
    }
  }
  assert.ok(count>200);console.log('Đã kiểm thử biên '+count+' biến thể mô hình.');
});

test('Hình học phẳng đúng đối tượng và điều kiện, không trả về tam giác mặc định',()=>{
  const scene=(type,params)=>buildGeometry2DScene(type,params).primitives;
  assert.ok(scene('circleOxy',{a:1,b:2,r:3}).some(x=>x.kind==='circle'&&x.center[0]===1&&x.center[1]===2));
  assert.ok(scene('rhombus',{a:6,b:4}).filter(x=>x.kind==='line').length>=2);
  assert.ok(scene('ellipse',{a:4,b:2}).some(x=>x.kind==='ellipse'));
  assert.ok(scene('hyperbola',{a:2,b:1.5}).filter(x=>x.kind==='curve').length===2);
  assert.ok(scene('circleTangent',{r:3,d:3}).some(x=>x.kind==='circle'));
  const t=scene('thales',{a:6,b:7,k:50});
  const M=t.find(x=>x.kind==='point'&&x.name==='M').xy;
  const N=t.find(x=>x.kind==='point'&&x.name==='N').xy;
  const B=t.find(x=>x.kind==='point'&&x.name==='B').xy;
  const C=t.find(x=>x.kind==='point'&&x.name==='C').xy;
  assert.ok(Constraints.areParallel([N[0]-M[0],N[1]-M[1]],[C[0]-B[0],C[1]-B[1]]));
  const pts=scene('triangleCenters',{a:6,b:5,c:5.5}).filter(x=>x.kind==='point');
  const [A,B2,C2]=['A','B','C'].map(n=>pts.find(p=>p.name===n).xy);
  near(Math.hypot(...[B2[0]-C2[0],B2[1]-C2[1]]),6);
  near(Math.hypot(...[A[0]-C2[0],A[1]-C2[1]]),5);
  near(Math.hypot(...[A[0]-B2[0],A[1]-B2[1]]),5.5);
  const g=scene('cyclicQuad',{r:3,a1:45,a2:135});
  assert.equal(g.filter(x=>x.kind==='point').length,4);
});

test('Tương thích tham số, số liệu và ngăn công thức HTML không an toàn',()=>{
  const p=normalizeExhibit({id:'test',grade:8,type:'parallelogram',params:{a:6,b:2,h:8}});
  assert.ok(p.params.h<=p.params.b);
  assert.equal(normalizeExhibit({id:'l',grade:10,type:'lineOxy',params:{a:0,b:0,c:2}}).params.b,1);
  assert.equal(normalizeExhibit({id:'p',grade:12,type:'oxyzPlane',params:{A:0,B:0,C:0,D:2}}).params.C,1);
  const ex=normalizeExhibit({id:'cat',grade:6,type:'barChart',data:{kind:'categorical_frequency',values:[1,2],labels:['I','II']}});
  assert.deepEqual(ex.data.values,[1,2]);
  assert.ok(!formatMathHtml('<img src=x onerror=alert(1)>').includes('<img'));
  const removable=SafeExpression.analyzeRational(2,2,1,1);
  assert.equal(removable.verticalAsymptote,null);
  assert.deepEqual(removable.hole,[-1,2]);
  assert.equal(new FunctionGraphViewer({type:'linearSlope',params:{a:2,b:3}}).getState().params.a,2);
});
