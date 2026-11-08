import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as THREE from '../vendor/three.module.js';
import {GRAPHICS_MODES,GRAPHICS_STATIONS,visualLayout,createMuseumVisuals} from '../src/graphics-r74/museum-visuals.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rooms = Object.fromEntries([6,7,8,9,10,11,12].map((grade,i) =>
  [grade,{x:[-54,-54,-18,-18,18,18,54][i],zSide:grade%2===0?1:-1,accent:0x1ebbc8}]));

function create(){
  const building=new THREE.Group();
  const visuals=createMuseumVisuals(THREE,building,rooms);
  return {building,visuals};
}

test('R74 layout matches original central hall and all seven real grade doors',()=>{
  const layout=visualLayout(rooms);
  assert.equal(layout.doors.length,7);
  assert.deepEqual(layout.doors.map(d=>d.grade),[6,7,8,9,10,11,12]);
  assert.deepEqual(GRAPHICS_STATIONS,[-54,-18,18,54]);
  assert.deepEqual(GRAPHICS_MODES,['classic','enhanced']);
  assert.equal(layout.hall.width,154);
  assert.equal(layout.hall.depth,16.4);
  assert.equal(layout.ceilingRows.length,15);
});

test('R74 architecture is built using vendored Three.js (no imported CDN engines)',()=>{
  const {building,visuals}=create();
  assert.equal(building.children.length,1);
  assert.equal(visuals.visualLayout.doors.length,7);
  assert.ok(visuals.root.children.some(o=>o.isInstancedMesh));
  assert.ok(visuals.premium.children.some(o=>o.isInstancedMesh));
  assert.equal(visuals.diagnostics().mobiles,2);
  assert.equal(visuals.diagnostics().gradeDoors,7);
  assert.equal(visuals.root.userData.visualOnly,true);
  const objects=[];building.traverse(o=>objects.push(o));
  assert.ok(objects.length<150,'architectural decoration has a finite complexity budget');
  assert.ok(!objects.some(o=>o.userData?.mathHistoryId||o.userData?.mathExhibitionAction),
    'decorations must never steal Raycaster/E-key hits');
});

test('R74 visuals switch between classic, eco and enhanced without changing the model',()=>{
  const {visuals}=create();
  const modelContainer=new THREE.Group();
  const model=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial());
  modelContainer.add(model);
  visuals.decoratePlinth(modelContainer,0x22ccbb);
  assert.equal(modelContainer.children.length,3);
  assert.equal(visuals.diagnostics().plinths,1);
  assert.equal(model.visible,true);
  assert.equal(visuals.setMode('classic'),'classic');
  assert.equal(visuals.root.visible,false);
  assert.equal(modelContainer.children[1].visible,false);
  assert.equal(model.visible,true);
  assert.equal(visuals.setMode('enhanced'),'enhanced');
  visuals.setQuality('eco');
  assert.equal(visuals.premium.visible,false);
  assert.equal(visuals.root.visible,true);
  visuals.setQuality('high');
  assert.equal(visuals.premium.visible,true);
  visuals.setTheme(false);
  assert.doesNotThrow(()=>visuals.animate(0.05));
});

test('R74 source integrates visuals natively without altering math Lab modules',()=>{
  const museum=readFileSync(join(root,'src/museum.js'),'utf8');
  const main=readFileSync(join(root,'src/main.js'),'utf8');
  const html=readFileSync(join(root,'index.html'),'utf8');
  assert.match(museum,/import \{createMuseumVisuals\} from '\.\/graphics-r74\/museum-visuals\.mjs'/);
  assert.match(museum,/graphics\.decoratePlinth\(plinth, ac\)/);
  assert.match(museum,/getGraphicsMode: \(\) => graphics\.getMode\(\)/);
  assert.match(museum,/graphics\.animate\(dt\)/);
  assert.match(main,/mountGraphicsPanel\(museum\)/);
  assert.match(html,/graphics-r74\/graphics-ui\.css/);
  assert.ok(!html.includes('NEXTGEN_OUTER_UPGRADE'));
});

test('R74 graphics UI button can toggle/reload its user preference without touching model routing',async()=>{
  const {mountGraphicsPanel}=await import('../src/graphics-r74/graphics-panel.mjs');
  const storageValues=new Map([['mathverse_visual_3d_mode','classic']]);
  const storage={getItem:k=>storageValues.get(k),setItem:(k,v)=>storageValues.set(k,v)};
  const classes=new Set();
  const parent={insertBefore(btn){this.btn=btn}};
  const attributes=new Map();
  const listeners=new Map();
  const fakeBtn={
    setAttribute:(k,v)=>attributes.set(k,v),
    addEventListener:(type,callback)=>listeners.set(type,callback),
    remove(){this.removed=true},textContent:'',className:'',id:'',type:''
  };
  const formerDocument=globalThis.document;
  globalThis.document={
    querySelector:()=>({parentElement:parent,nextSibling:null}),
    createElement:()=>fakeBtn,
    body:{classList:{toggle:(k,on)=>on?classes.add(k):classes.delete(k),remove:k=>classes.delete(k)}}
  };
  try{
    let style='enhanced';
    const museum={
      setGraphicsMode(mode){style=mode;return mode},
      getGraphicsMode(){return style}
    };
    const ui=mountGraphicsPanel(museum,{storage});
    assert.equal(style,'classic');
    assert.equal(attributes.get('aria-pressed'),'false');
    listeners.get('click')();
    assert.equal(style,'enhanced');
    assert.equal(storageValues.get('mathverse_visual_3d_mode'),'enhanced');
    assert.ok(classes.has('mv-graphics-v3d'));
    ui.dispose();
    assert.ok(!classes.has('mv-graphics-v3d'));
    assert.equal(fakeBtn.removed,true);
  }finally{globalThis.document=formerDocument;}
});
