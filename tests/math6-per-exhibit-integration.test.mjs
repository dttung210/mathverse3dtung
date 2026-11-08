import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {TOAN6_LAB_MODELS,LAB_TO_EXHIBIT,ORIGINAL_GRADE6_IDS,labsForExhibit,labById} from '../src/math6-lab/catalog.js';
import {Math6ExhibitLab} from '../src/math6-lab/Math6ExhibitLab.js';
import {renderModel,W,H} from '../src/math6-lab/canvas.mjs';
import {mathStats,polygonMeasures} from '../src/math6-lab/math.mjs';
import {motionParams} from '../src/math6-lab/catalog-motion.mjs';
import {SUPPORTS_3D} from '../src/math6-lab/three-lab.mjs';
import {GeometryStudio} from '../src/math6-lab/geometry-studio.mjs';

const base = new URL('./',import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('../data/catalog.json',base),'utf8'));
const labSource=JSON.parse(readFileSync(new URL('../data/models.toan6.json',base),'utf8'));
const perGrade=grade=>catalog.items.filter(m=>m.grade===grade);
const fakeCtx=new Proxy({}, {get:(obj,key)=>{
  if(key in obj)return obj[key];
  if(key==='measureText')return ()=>({width:90});
  if(key==='createLinearGradient'||key==='createRadialGradient')return ()=>({addColorStop(){}});
  return ()=>{};
},set:(obj,key,value)=>{obj[key]=value;return true;}});
const state=model=>({params:structuredClone(model.defaults),time:0,counts:[],tileFlips:new Set(),selectedDesk:0,lastOutcome:undefined});

test('original V12 museum unchanged: 7 rooms and 63 exhibits, original 9 grade6 exhibits intact',()=>{
  assert.equal(catalog.items.length,63);
  assert.deepEqual([...new Set(catalog.items.map(m=>m.grade))].sort((a,b)=>a-b),[6,7,8,9,10,11,12]);
  assert.equal(perGrade(6).length,9);
  assert.deepEqual(perGrade(6).map(m=>m.id).sort(),ORIGINAL_GRADE6_IDS);
  for(const g of [7,8,9,10,11,12])assert.equal(perGrade(g).length,9);
  assert.equal(catalog.items.some(m=>m.id.startsWith('toan6-')),false,'MathLab should not replace original mathematical types with generic exhibit placeholders');
});
test('all 60 full-fidelity MathLab6 models are linked to one of 9 real existing grade6 pedestals',()=>{
  assert.equal(TOAN6_LAB_MODELS.length,60);
  assert.equal(labSource.models.length,60);
  assert.deepEqual(TOAN6_LAB_MODELS,labSource.models,'original catalog model definitions must be faithfully preserved');
  assert.equal(new Set(TOAN6_LAB_MODELS.map(m=>m.id)).size,60);
  const originals=new Set(ORIGINAL_GRADE6_IDS);
  for(const model of TOAN6_LAB_MODELS){
    assert.ok(originals.has(LAB_TO_EXHIBIT[model.id]),model.id);
    assert.equal(labById(model.id).title,model.title);
  }
  for(const id of ORIGINAL_GRADE6_IDS)assert.ok(labsForExhibit(id).length>0,id+' has no MathLab');
  const groupCounts=new Map();for(const m of TOAN6_LAB_MODELS)groupCounts.set(m.group,(groupCounts.get(m.group)||0)+1);
  assert.equal(groupCounts.size,9);
});
test('the original MathLab6 animation renderers run on ALL 60 models without replacing them by screenshots',()=>{
  for(const model of TOAN6_LAB_MODELS){
    const s=state(model);
    assert.doesNotThrow(()=>renderModel(fakeCtx,model,s),model.id);
    assert.equal(typeof mathStats(model,s),'string',model.id);
    const moved=motionParams(model,s.params,2.5,8);
    assert.ok(moved&&typeof moved==='object'&&Object.keys(moved).length>0,model.id);
    assert.doesNotThrow(()=>renderModel(fakeCtx,model,{...s,params:moved,time:2500}),model.id+' after motion');
  }
});
test('Mathematical properties of grade6 rhombus stay valid on direct parameter drag',()=>{
  const model=labById('toan6-hinh-thoi');const anchor=perGrade(6).find(m=>m.id==='g6_06');
  const lab=new Math6ExhibitLab({anchor});lab.selected=model;lab.state=state(model);lab.mode='model';
  lab._saveState=()=>{};lab._draw=()=>{};lab._renderControls=()=>{};lab._pointerCoordinates=()=>[W/2+138,H/2];
  lab._handlePointer({});
  const measured=polygonMeasures(model.variant,lab.state.params);
  const a=measured.vertices[0],b=measured.vertices[1],c=measured.vertices[2],d=measured.vertices[3];
  assert.ok(Math.abs((c[0]-a[0])*(d[0]-b[0])+(c[1]-a[1])*(d[1]-b[1]))<1e-8,'diagonals remain perpendicular');
  assert.ok(measured.area>0,'nondegenerate area');
});
test('per-exhibit storage namespaces cannot overwrite any another grade6 pedestal or base museum data',()=>{
  const original=perGrade(6);
  const A=new Math6ExhibitLab({anchor:original[0]});
  const B=new Math6ExhibitLab({anchor:original[1]});
  assert.notEqual(A._storageKey(TOAN6_LAB_MODELS[0].id),B._storageKey(TOAN6_LAB_MODELS[0].id));
  assert.ok(A._storageKey(TOAN6_LAB_MODELS[0].id).includes(':exhibit:'));
  assert.throws(()=>new Math6ExhibitLab({anchor:perGrade(7)[0]}),/grade 6/);
  assert.equal(GeometryStudio.prototype._save.toString().includes('this.storageKey'),true);
});
test('3D MathLab stays optional and matches original source model capabilities',()=>{
  const eligible=TOAN6_LAB_MODELS.filter(SUPPORTS_3D);
  assert.equal(eligible.length,8);
  assert.equal(SUPPORTS_3D(labById('toan6-dong-xu')),true);
  assert.equal(SUPPORTS_3D(labById('toan6-xuc-xac')),true);
  assert.equal(SUPPORTS_3D(labById('toan6-tam-giac-deu')),false);
});
test('MathLab is embedded in original LabShell, not a separate iframe or replacement 3D classroom',()=>{
  const shell=readFileSync(new URL('../src/ui/LabShell.js',base),'utf8');
  const index=readFileSync(new URL('../index.html',base),'utf8');
  assert.match(shell,/lab-btn-math6/);
  assert.match(shell,/Grade6Lab/);
  assert.match(shell,/data-library-mode="math6"/);
  assert.match(shell,/_selectMath6Lab\(labId\)/);
  assert.match(shell,/_exitMath6Lab\(restoreViewer=true\)/);
  assert.match(shell,/this\._mountViewer\(\);this\._renderInspectorControls\(\)/);
  assert.match(index,/math6-lab\/inline-math6\.css/);
  assert.doesNotMatch(shell,/<iframe/);
  assert.ok(existsSync(new URL('../src/museum.js',base)));
});

test('MathLab6 cannot import or open an experiment assigned to another original grade6 pedestal',()=>{
  const grade6=perGrade(6);
  const anchor=grade6.find(m=>m.id==='g6_06');
  const other=labById('toan6-cot-kep');
  assert.equal(LAB_TO_EXHIBIT[other.id],'g6_13');
  const lab=new Math6ExhibitLab({anchor});
  assert.equal(lab.select(other.id),false,'must navigate to linked physical exhibit instead of opening under wrong pedestal');
});

test('Regression: GeometryStudio has dispose method and cleans up cleanly',()=>{
  assert.equal(typeof GeometryStudio.prototype.dispose, 'function');
  const mockStudio = {
    deactivate: () => {},
    _stopPreview: () => {},
    toolbar: { replaceChildren: () => {} },
    inspector: { replaceChildren: () => {} },
    motion: { replaceChildren: () => {} },
    board: {},
    canvas: {},
    ctx: {}
  };
  assert.doesNotThrow(() => GeometryStudio.prototype.dispose.call(mockStudio));
  assert.equal(mockStudio.board, null);
  assert.equal(mockStudio.canvas, null);
  assert.equal(mockStudio.ctx, null);
});

test('Regression: Math6ThreeLab source does not have dangling _pointer.bind',()=>{
  const threeSrc = readFileSync(new URL('../src/math6-lab/three-lab.mjs', base), 'utf8');
  assert.doesNotMatch(threeSrc, /_pointer\.bind/);
});
