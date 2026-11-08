import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {ViewerRegistry} from '../src/viewers/ViewerRegistry.js';
import {Geometry2DViewer} from '../src/viewers/Geometry2DViewer.js';
import {StatisticsChartViewer} from '../src/viewers/StatisticsChartViewer.js';
import {JSXGraphAdapter} from '../src/viewers/JSXGraphAdapter.js';
import {EChartsAdapter} from '../src/viewers/EChartsAdapter.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const expected={
 'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15',
 'data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'
};
for(const [file,sha] of Object.entries(expected))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),sha,`Dữ liệu gốc đã bị sửa: ${file}`);
const model=(type,grade,modality)=>({type,grade,modality,params:{len:4,k:50,deg:60,c1:5,c2:7}});
assert(ViewerRegistry.createViewer(model('segmentMidpoint',6,'geometry2d')) instanceof Geometry2DViewer);
assert(ViewerRegistry.createViewer(model('segmentMidpoint',6,'geometry2d'),{engine:'jsxgraph'}) instanceof JSXGraphAdapter);
assert(ViewerRegistry.createViewer(model('polygon',6,'geometry2d'),{engine:'jsxgraph'}) instanceof Geometry2DViewer);
assert(ViewerRegistry.createViewer(model('barChart',6,'statisticschart')) instanceof StatisticsChartViewer);
assert(ViewerRegistry.createViewer(model('barChart',6,'statisticschart'),{engine:'echarts'}) instanceof EChartsAdapter);
assert(ViewerRegistry.createViewer(model('segmentMidpoint',6,'geometry2d'),{engine:'echarts'}) instanceof Geometry2DViewer);
const optional=path.join(root,'vendor','optional'),manifest=path.join(optional,'MANIFEST_INSTALLED.json');
if(fs.existsSync(manifest)){
 const m=JSON.parse(fs.readFileSync(manifest,'utf8'));
 for(const [name,info] of Object.entries(m.files)){
  assert(/^(jsxgraphcore\.js|jsxgraph\.css|LICENSE_JSXGRAPH_MIT\.txt|echarts\.min\.js|LICENSE_ECHARTS_APACHE2\.txt)$/.test(name));
  const buf=fs.readFileSync(path.join(optional,name));
  assert.equal(buf.length,info.bytes);
  assert.equal(crypto.createHash('sha256').update(buf).digest('hex'),info.sha256);
 }
 console.log('ĐẠT: đối chiếu hash thư viện đã cài.');
}else console.log('CHƯA CÀI: hai thư viện mở rộng (không bắt buộc).');
console.log('ĐẠT GIAI ĐOẠN 1: dữ liệu gốc và 4 viewer không đổi, router engine chọn lọc đúng; fallback native sẵn sàng.');
