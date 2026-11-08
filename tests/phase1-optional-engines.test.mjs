import test from 'node:test';
import assert from 'node:assert/strict';
import {ViewerRegistry} from '../src/viewers/ViewerRegistry.js';
import {Geometry2DViewer} from '../src/viewers/Geometry2DViewer.js';
import {StatisticsChartViewer} from '../src/viewers/StatisticsChartViewer.js';
import {JSXGraphAdapter,supportsJSXGraph} from '../src/viewers/JSXGraphAdapter.js';
import {EChartsAdapter,supportsECharts} from '../src/viewers/EChartsAdapter.js';
import {loadOptionalEngine,OPTIONAL_ENGINES} from '../src/integrations/optional-engines.js';
const spec=(type,grade,modality,params={})=>({id:`test_${type}`,title:type,type,grade,modality,params});
test('Phase 1: native viewer stays default for both 2D and statistics',()=>{
 assert(ViewerRegistry.createViewer(spec('segmentMidpoint',6,'geometry2d',{len:4})) instanceof Geometry2DViewer);
 assert(ViewerRegistry.createViewer(spec('barChart',6,'statisticschart')) instanceof StatisticsChartViewer);
});
test('Phase 1: opt-in JSXGraph supports only vetted 2D geometric types',()=>{
 assert(supportsJSXGraph(spec('thales',8)));
 assert(supportsJSXGraph(spec('segmentMidpoint',6)));
 assert(supportsJSXGraph(spec('angles',7)));
 assert(!supportsJSXGraph(spec('circleOxy',10)));
 assert(ViewerRegistry.createViewer(spec('thales',8,'geometry2d',{a:4,b:6,k:40}),{engine:'jsxgraph'}) instanceof JSXGraphAdapter);
 assert(ViewerRegistry.createViewer(spec('circleOxy',10,'geometry2d',{a:1,b:2,r:4}),{engine:'jsxgraph'}) instanceof Geometry2DViewer);
});
test('Phase 1: ECharts cannot replace geometry / 3D',()=>{
 assert(supportsECharts(spec('pieChart',7)));
 assert(!supportsECharts(spec('thales',8)));
 assert(ViewerRegistry.createViewer(spec('barChart',6,'statisticschart'),{engine:'echarts'}) instanceof EChartsAdapter);
 assert(ViewerRegistry.createViewer(spec('segmentMidpoint',6,'geometry2d',{len:4}),{engine:'echarts'}) instanceof Geometry2DViewer);
});
test('Phase 1: JS vendor paths are local only and their versions are pinned',()=>{
 for(const entry of Object.values(OPTIONAL_ENGINES)){
  assert(entry.script.startsWith('/vendor/optional/'));
  assert(!entry.script.startsWith('http'));
  assert(/^[0-9]+\.[0-9]+\.[0-9]+$/.test(entry.version));
 }
 assert.rejects(loadOptionalEngine('arbitrary'),/Engine không hợp lệ/);
});
test('Phase 1: new chart engine preserves categorical counts in statistics',()=>{
 const m=spec('barChart',6,'statisticschart',{c1:4,c2:9,c3:12,c4:1});
 const v=new EChartsAdapter(m);assert.deepEqual(v.data.values,[4,9,12,1]);
 assert.equal(v.getMetrics()[0].value,'26');
 v.setDataValues([5,5,5,5]);assert.equal(v.getMetrics()[0].value,'20');
 v.reset();assert.equal(v.getMetrics()[0].value,'26');
});
test('Phase 1: JSXGraph drag midpoint updates geometry and rejects overly short segment',()=>{
 let notices=0;
 const v=new JSXGraphAdapter(spec('segmentMidpoint',6,'geometry2d',{len:6}),{onParametersChange:()=>notices++});
 const A={X:()=>-2,Y:()=>0,moveTo:()=>{}};
 v._handleDrag('A',A);
 assert.equal(v.getMetrics()[0].value,5);
 assert.equal(v.params.len,5);
 assert.equal(notices,1);
 let moved=false;
 const illegal={X:()=>3,Y:()=>0,moveTo:()=>{moved=true;}};
 v._handleDrag('A',illegal);
 assert(moved);
 assert.equal(v.getMetrics()[0].value,5);
});
test('Phase 1: JSXGraph grade 7 supplementary angle is limited to 5..175 degrees',()=>{
 const v=new JSXGraphAdapter(spec('angles',7,'geometry2d',{deg:60}));
 const prev=[...v.points.B];let moved=false;
 v._handleDrag('B',{X:()=>-2.8,Y:()=>-1,moveTo:()=>{moved=true;}});
 assert(moved);assert.deepEqual(v.points.B,prev);
 v._handleDrag('B',{X:()=>0,Y:()=>2.8,moveTo:()=>{}});
 assert.equal(v.getMetrics()[0].value,90);
 assert.equal(v.getMetrics()[1].value,90);
});
test('Phase 1: ECharts bar option uses actual model values',()=>{
 const v=new EChartsAdapter(spec('barChart',6,'statisticschart',{c1:4,c2:9,c3:12,c4:1}));
 let rendered;
 v.chart={setOption:o=>{rendered=o;}};
 v.render();
 assert.deepEqual(rendered.series[0].data,[4,9,12,1]);
 v.setChartKind('pie');assert.equal(rendered.series[0].type,'pie');
 assert.equal(rendered.series[0].data.map(x=>x.value).reduce((a,b)=>a+b,0),26);
});
