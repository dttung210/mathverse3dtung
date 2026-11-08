import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Math6ExhibitLab} from '../src/math6-lab/Math6ExhibitLab.js';
import {TOAN6_LAB_MODELS,LAB_TO_EXHIBIT,labsForExhibit} from '../src/math6-lab/catalog.js';
import {qualityProfile} from '../src/museum/quality-controller.js';

const file = name => fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('All 60 MathLab 6 model thumbnails group into nine meaningful classes',()=>{
 assert.equal(TOAN6_LAB_MODELS.length,60);
 const groups=new Set(TOAN6_LAB_MODELS.map(x=>x.group));assert.equal(groups.size,9);
 assert.equal(new Set(TOAN6_LAB_MODELS.map(x=>x.id)).size,60);
 const gradeSix=JSON.parse(file('data/catalog.json')).items.filter(x=>x.grade===6);
 assert.equal(gradeSix.length,9);
 for(const lab of TOAN6_LAB_MODELS){
   assert.ok(gradeSix.some(x=>x.id===LAB_TO_EXHIBIT[lab.id]),'Missing pedestal '+lab.id);
   assert.ok(['T1','T2'].includes(lab.source.book),'SGK volume '+lab.id);
 }
 for(const model of gradeSix)assert.ok(labsForExhibit(model.id).length,'Model lacks experiments '+model.id);
});
test('MathLab state saving coalesces drag updates and flushes immediately at release',()=>{
 const prior=globalThis.localStorage;
 const calls=[];
 globalThis.localStorage={setItem:(key,value)=>calls.push({key,value}),getItem:()=>null};
 try{
  const lab=new Math6ExhibitLab({anchor:{id:'g6_01',grade:6}});
  lab.selected={id:'lab-demo'};
  lab.state={params:{r:2},counts:[],tileFlips:new Set(),selectedDesk:0};
  lab._saveState();lab.state.params.r=3;lab._saveState();lab.state.params.r=4;lab._saveState();
  assert.equal(calls.length,0,'localStorage should not block every pointermove');
  lab._saveState(true);
  assert.equal(calls.length,1);
  assert.equal(JSON.parse(calls[0].value).params.r,4);
  assert.match(calls[0].key,/g6_01.*lab-demo/);
  assert.equal(lab._saveTimer,null);
 }finally{globalThis.localStorage=prior;}
});
test('MathLab independent experiment and plinth IDs cannot overwrite each other',()=>{
 const a=new Math6ExhibitLab({anchor:{grade:6,id:'g6_01'}});
 const b=new Math6ExhibitLab({anchor:{grade:6,id:'g6_02'}});
 assert.notEqual(a._storageKey('lab-a'),b._storageKey('lab-a'));
 assert.notEqual(a._storageKey('lab-a'),a._storageKey('lab-b'));
 assert.throws(()=>new Math6ExhibitLab({anchor:{grade:7}}),/grade 6/);
});
test('Main 3D museum remains separate from 2D editor with consistent user quality options',()=>{
 const main=file('src/main.js'),museum=file('src/museum.js'),html=file('index.html');
 for(const mode of ['eco','auto','high'])assert.equal(qualityProfile(mode).name,mode);
 assert.match(main,/museum-render-quality/);assert.match(html,/museum-render-quality/);
 assert.match(museum,/setQuality,/);
 assert.match(file('src/ui/LabShell.js'),/id="lab-unified-mode"/);
 assert.match(file('src/ui/LabShell.js'),/createDocumentFragment\(\)/);
 assert.match(file('src/math6-lab/Math6ExhibitLab.js'),/150\);/);
});
test('No older video/AI dependency or GeoGebra was silently introduced into runtime',()=>{
 const files=['index.html','src/main.js','src/museum.js','src/ui/LabShell.js','src/math6-lab/Math6ExhibitLab.js'];
 for(const p of files)assert.doesNotMatch(file(p),/GGBApplet|deployggb|geogebra\.org/i,p);
 const pkg=JSON.parse(file('package.json'));
 assert.deepEqual(pkg.dependencies,{});
});
