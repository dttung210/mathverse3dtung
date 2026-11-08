import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createIntegratedSgkDirectory} from '../src/curriculum/sgk-integrated-directory.mjs';
import {SGK_EXHIBIT_TO_MODE,SGK_EXHIBIT_COUNT} from '../src/curriculum/sgk-exhibit-links.mjs';
import {CURRICULUM_MODEL_BY_ID,ALL_CURRICULUM_MODELS,getChaptersForGrade} from '../src/curriculum/curriculum-manifest.mjs';
import {ALL_MATH6_LABS} from '../src/math6-lab/catalog.js';
import {isTriangleCase} from '../src/curriculum/triangle-engine.mjs';
import {isCirclePosition} from '../src/curriculum/circle-positions.mjs';
import {isGraphCase} from '../src/curriculum/graph-models.mjs';
import {isGrade7Mode} from '../src/curriculum/grade7-engine.mjs';
import {isGrade8Mode} from '../src/curriculum/grade8-engine.mjs';
import {isGrade9Mode} from '../src/curriculum/grade9-engine.mjs';
import {isGrade10Mode} from '../src/curriculum/grade10-engine.mjs';
import {isGrade11Mode} from '../src/curriculum/grade11-engine.mjs';
import {isGrade12Mode} from '../src/curriculum/grade12-engine.mjs';
import {TYPES} from '../src/math-core.js';
const curated=JSON.parse(fs.readFileSync(new URL('../data/mathverse-7-12-curated.json',import.meta.url)));
const exhibits=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url))).items;
const directory=createIntegratedSgkDirectory(curated,{exhibits});
const expected={6:64,7:38,8:40,9:45,10:38,11:46,12:39};
const supports=id=>isTriangleCase(id)||isCirclePosition(id)||isGraphCase(id)||isGrade7Mode(id)||isGrade8Mode(id)||isGrade9Mode(id)||isGrade10Mode(id)||isGrade11Mode(id)||isGrade12Mode(id);

test('R90: 310 canonical SGK modes in 58 chapters, no missing or duplicate ID',()=>{
 assert.deepEqual(directory.errors,[]);
 assert.equal(directory.labCount,310);
 assert.equal(ALL_CURRICULUM_MODELS.length,310);
 assert.equal(CURRICULUM_MODEL_BY_ID.size,310);
 const count=[...directory.index.values()].filter(m=>!m.relatedExhibit&&!m.relatedVariant).length;
 assert.equal(count,310);
 let chapters=0;
 for(let grade=6;grade<=12;grade++){
  const list=directory.getChapters(grade);chapters+=list.length;
  assert.equal(list.length,getChaptersForGrade(grade).length);
  assert.equal(list.flatMap(ch=>ch.modes).filter(m=>!m.relatedExhibit&&!m.relatedVariant).length,expected[grade]);
 }
 assert.equal(chapters,58);
 assert.equal(ALL_MATH6_LABS.length,63);
});

test('R90: all 247 original grade7–12 audit mode IDs survive and are interactive',()=>{
 const all=curated.source_registry.flatMap(f=>f.modes);
 assert.equal(all.length,247);
 for(const mode of all){
  const stored=directory.findMode(mode.id);
  assert.ok(stored,mode.id);
  assert.ok(supports(mode.id),`no specialized renderer: ${mode.id}`);
  assert.equal(stored.chapterId,CURRICULUM_MODEL_BY_ID.get(mode.id).chapterId);
 }
});

test('R90: four cross-grade audit modes are under their actual SGK chapter',()=>{
 const target={'7-01-C03':6,'7-10-C02':8,'7-10-C03':8,'9-13-C03':8};
 for(const [id,grade] of Object.entries(target)){
  const mode=directory.findMode(id);
  assert.equal(mode.grade,grade,id);
  assert.equal(mode.sourceGrade,Number(id.split('-')[0]),id);
  assert.ok(directory.getChapters(grade).some(ch=>ch.modes.some(m=>m.id===id)));
 }
});

test('R90: 54 existing gallery exhibits point to valid lesson mode within the same grade',()=>{
 assert.equal(SGK_EXHIBIT_COUNT,54);
 assert.equal(directory.exhibitCount,54);
 for(const [id,anchor] of Object.entries(SGK_EXHIBIT_TO_MODE)){
  const exhibition=exhibits.find(x=>x.id===id);
  const link=directory.findMode(id);
  assert.ok(exhibition,`missing gallery source: ${id}`);
  assert.ok(link,`missing SGK gallery link: ${id}`);
  assert.equal(link.anchorModeId,anchor);
  assert.equal(link.grade,Number(exhibition.grade));
  assert.equal(link.grade,directory.findMode(anchor).grade);
  assert.ok(TYPES[exhibition.type],`no native viewer type: ${id} / ${exhibition.type}`);
 }
});

test('R90: keep three specialized grade10 sub-modes in their existing SGK lesson',()=>{
 assert.equal(directory.variantCount,3);
 for(const id of ['10-11-C01-MUL','10-11-C02-A','10-11-C02-C']){
  const mode=directory.findMode(id);
  assert.ok(mode?.relatedVariant,id);
  assert.equal(mode.grade,10);
  assert.ok(directory.findChapter(id));
 }
});

test('R90: canonical Lab registry is independent of whether gallery data are available',()=>{
 const bare=createIntegratedSgkDirectory(curated,{exhibits:[]});
 assert.equal(bare.labCount,310);
 assert.equal(bare.exhibitCount,0);
 assert.deepEqual(bare.errors,[]);
});

test('R90: command-deck selector routes into current SGK rather than opening QA audit windows',()=>{
 const html=fs.readFileSync(new URL('../dual/index.html',import.meta.url),'utf8');
 const app=fs.readFileSync(new URL('../dual/app.mjs',import.meta.url),'utf8');
 assert.match(html,/value="sgk:6"/);
 assert.match(html,/value="sgk:12"/);
 assert.match(app,/explorer\.open\(grade\)/);
 assert.doesNotMatch(app,/if\(url\)\{window\.open\(url,'_blank'/);
});
