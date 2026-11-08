import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=s=>fs.readFileSync(new URL('../'+s,import.meta.url),'utf8');
test('Grade9 exhibit QA enumerates all 9 original objects without faking solid types',()=>{
 const src=JSON.parse(read('data/catalog.json')).items.filter(x=>x.grade===9);
 assert.equal(src.length,9);const real=src.filter(x=>['cylinder','cone','sphere','sphereSection'].includes(x.type));
 assert.equal(real.length,3);assert.equal(src.length-real.length,6);
 const html=read('src/qa/toan9-hienvat.html'),js=read('src/qa/toan9-hienvat.js');
 assert.match(html,/Kiểm tra 9 hiện vật/);assert.match(js,/Solid3DViewer/);assert.match(js,/dispose\(/);assert.match(js,/grade\)===9/);assert.match(js,/GPU|WebGL/);
});
test('Grade9 audit links to an independent 9-exhibit viewer, both support CSV records',()=>{
 const html=read('src/qa/toan9-audit.html'),a=read('src/qa/toan9-audit.js'),b=read('src/qa/toan9-hienvat.js');
 assert.match(html,/toan9-hienvat\.html/);assert.match(a,/\.csv/);assert.match(b,/\.csv/);
 assert.match(b,/check['"]\+i/);assert.match(b,/localStorage\.setItem/);
});
