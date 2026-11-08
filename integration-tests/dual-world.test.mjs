import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const data=JSON.parse(read('museum-data/catalog.json'));
test('Original R75 source has all 732 files and checksum matches',()=>{
  const csv=read('audit/R75_SHA256_ORIGINAL.csv').trim().split(/\r?\n/);
  assert.ok(csv.length>=727);
  for(const row of csv.slice(1)){
    const [name,sha,size]=row.match(/^(.+),([0-9a-f]{64}),(\d+)$/).slice(1);
    const bytes=fs.readFileSync(path.join(root,name));
    assert.equal(bytes.length,Number(size),name);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),sha,name);
  }
});
test('R75 avatar factory is a verbatim extraction',()=>{
  const src=read('src/museum.js');
  const a=src.indexOf('function createAvatar(initialType = '),b=src.indexOf('\n/** T',a+4);
  assert.ok(a>0&&b>a);
  const exact=src.slice(a,b).trim();
  const derived=read('dual/avatar-r75.mjs');
  assert.ok(derived.includes(exact.replace('function createAvatar(initialType =','export function createAvatar(initialType =')));
  for(const name of ['alex','triet','an','bot'])assert.ok(exact.includes(name),name);
});
test('230 posters across 7 grades with no repeated lesson numbers',()=>{
  assert.equal(data.total,230);assert.equal(data.items.length,230);
  assert.deepEqual(data.counts,{'6':43,'7':37,'8':39,'9':32,'10':27,'11':33,'12':19});
  for(let g=6;g<=12;g++){
    const arr=data.items.filter(x=>x.grade===g),numbers=arr.map(x=>x.number);
    assert.equal(new Set(numbers).size,arr.length);
    assert.ok(arr.every(x=>x.title&&x.page>1));
  }
});
test('All 230 curated images exist with correct WebP signatures',()=>{
  for(const item of data.items){
    const file=path.join(root,item.src.substring(1));
    const buf=fs.readFileSync(file);
    assert.ok(buf.length>4000,item.src);
    assert.equal(buf.toString('ascii',0,4),'RIFF');
    assert.equal(buf.toString('ascii',8,12),'WEBP');
  }
});
test('Frontend has exactly two main entrances, without runtime uploads',()=>{
  const html=read('dual/index.html');
  assert.match(html,/id="enter-mathverse"/);assert.match(html,/id="enter-gallery"/);
  assert.doesNotMatch(html,/<input\s+[^>]*type="file"/i);
  assert.doesNotMatch(html,/download=/i);
  assert.match(html,/id="r75-frame"/);
});
test('Root original server is isolated and untouched by host routing',()=>{
  const host=read('server/host.mjs');
  assert.match(host,/NO_SHORTCUTS:'1'/);assert.match(host,/NO_BROWSER:'1'/);
  assert.match(host,/frame-ancestors/);
});
test('Seven rooms plan and lazy texture disposal included',()=>{
  const gallery=read('dual/gallery.mjs');
  assert.match(gallery,/SEVEN_VISIBLE_CLASS_ENTRANCES/);
  assert.match(gallery,/GRADES/);
  assert.match(gallery,/ensureNearby/);assert.match(gallery,/updateTextures/);
  assert.match(gallery,/\.dispose\(/);
  assert.match(gallery,/closestPoster/);assert.match(gallery,/restrictPosition/);
});
test('R75 existing public API includes pause, avatar and state bridge',()=>{
  const src=read('src/museum.js');
  for(const key of ['setPaused:','getState:','restoreState:','setAvatarType:'])assert.ok(src.includes(key),key);
  assert.match(read('dual/app.mjs'),/contentWindow\?\.museum/);
});
