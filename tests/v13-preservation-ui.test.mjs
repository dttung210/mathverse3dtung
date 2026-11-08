import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';import vm from 'node:vm';
import {TOAN6_LAB_MODELS,LAB_TO_EXHIBIT,ORIGINAL_GRADE6_IDS} from '../src/math6-lab/catalog.js';
import {buildPresets} from '../src/studio/presets.js';
import {migrateItemToV5} from '../src/data/migrate-v2-v4-v5.js';
import {previewMarkup,groupLabels} from '../src/math6-lab/previews.js';
const fromFile=(path)=>fs.readFileSync(new URL('../'+path,import.meta.url));
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const catalog=JSON.parse(fromFile('data/catalog.json')).items;
test('Immutable 63 baseline exhibits: binary SHA-256 matches the verified V12.1 ZIP',()=>{
 assert.equal(digest(fromFile('data/catalog.json')),'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15');
 assert.equal(catalog.length,63);
 assert.deepEqual([...new Set(catalog.map(x=>x.grade))].sort((a,b)=>a-b),[6,7,8,9,10,11,12]);
});
test('Immutable 60 grade-6 MathLab definitions preserved byte-for-byte',()=>{
 assert.equal(digest(fromFile('data/models.toan6.json')),'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9');
 assert.equal(TOAN6_LAB_MODELS.length,60);
 assert.equal([...new Set(TOAN6_LAB_MODELS.map(m=>m.id))].length,60);
 assert.ok(TOAN6_LAB_MODELS.every(lab=>Boolean(LAB_TO_EXHIBIT[lab.id]))); // plus three clearly separate V15 extensions
 const g6=new Set(catalog.filter(x=>x.grade===6).map(x=>x.id));
 assert.equal(g6.size,9);
 for(const model of TOAN6_LAB_MODELS)assert.ok(g6.has(LAB_TO_EXHIBIT[model.id]),`Missing original exhibit mapping: ${model.id}`);
 assert.deepEqual([...g6].sort(),[...ORIGINAL_GRADE6_IDS].sort());
});
test('All 42 legacy presets retained and each MathLab image preview is safe inline SVG',()=>{
 const presets=buildPresets(catalog.map(migrateItemToV5));assert.equal(presets.length,42);
 for(const item of TOAN6_LAB_MODELS){
  const svg=previewMarkup(item);assert.match(svg,/^<svg/);assert.match(svg,/<\/svg>$/);assert.doesNotMatch(svg,/<script|javascript:|onload=/i);
 }
 assert.equal(Object.keys(groupLabels).length,9);
});
test('Unified viewport includes one grade-aware mode navigation',()=>{
 const code=fromFile('src/ui/LabShell.js').toString('utf8');
 for(const mode of ['model','math6','2d','3d'])assert.match(code,new RegExp(`data-unified-mode="${mode}"`));
 const style=fromFile('src/studio/v13-unified.css').toString('utf8');
 assert.match(style,/#lab-btn-math6/);assert.match(style,/#lab-btn-compose/);
 assert.match(style,/mv13-mode-option\.active/);
 assert.match(code,/LAB_TO_EXHIBIT\[labId\]/);
});
test('Unified switch routes Model / SGK / 2D / 3D without deleting exhibit objects',async()=>{
 const source=fromFile('src/ui/LabShell.js').toString('utf8').replace(/^import\s.*;\s*$/gm,'').replace('export class LabShell','class LabShell')+'\nthis.LabShell=LabShell;';
 const ctx=vm.createContext({});vm.runInContext(source,ctx);
 const shell=Object.create(ctx.LabShell.prototype);
 const btns=['model','math6','2d','3d'].map(mode=>({dataset:{unifiedMode:mode},hidden:false,classList:{toggle(){}},setAttribute(k,v){this[k]=v}}));
 shell.activeModel={grade:6,id:'g6_06'};shell.dom={app:{dataset:{}},unifiedMode:{querySelectorAll:()=>btns}};
 shell.overlay={querySelectorAll:()=>[]};shell._renderModelList=()=>{};shell._syncLibraryMode=()=>{};
 shell.libraryMode='room';shell.activeFilter='all';shell.math6Lab=null;shell.workspaceEditor=null;
 shell._enterMath6Lab=()=>{shell.math6Lab={mode:'model',setMode:async(mode)=>{shell.math6Lab.mode=mode;}};};
 shell._exitMath6Lab=()=>{shell.math6Lab=null;};
 shell._enterWorkspace=()=>{shell.workspaceEditor={dimension:'2d',setDimension(v){this.dimension=v;}};};
 shell._exitWorkspace=()=>{shell.workspaceEditor=null;};
 await shell._setUnifiedMode('math6');assert.equal(shell.dom.app.dataset.viewMode,'math6');
 await shell._setUnifiedMode('2d');assert.equal(shell.dom.app.dataset.viewMode,'2d');assert.equal(shell.math6Lab,null);
 await shell._setUnifiedMode('3d');assert.equal(shell.workspaceEditor.dimension,'3d');
 await shell._setUnifiedMode('model');assert.equal(shell.workspaceEditor,null);assert.equal(shell.dom.app.dataset.viewMode,'model');
 shell.activeModel={grade:7,id:'g7_01'};await shell._setUnifiedMode('math6');assert.equal(shell.dom.app.dataset.viewMode,'model');
});
