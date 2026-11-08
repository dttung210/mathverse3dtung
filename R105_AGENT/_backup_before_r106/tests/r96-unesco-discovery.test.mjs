/** R96 additive Discovery UNESCO smoke/contract tests (no browser dependency). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import { UNESCO_HERITAGE, UNESCO_TOTAL, UNESCO_BY_ID, isUnescoItem, trustedSketchfabEmbed } from '../dual/discovery-unesco-data.mjs';
import { DISCOVERY_ALL_ARTWORKS, DISCOVERY_ALL_LANDMARKS, discoveryById, filterLandmarks } from '../dual/discovery-data.mjs';
import { requestedWikiTitle, resolveDiscoveryPhoto } from '../dual/discovery-photo-r96.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const src=(name)=>fs.readFileSync(path.join(root,name),'utf8');

test('18 World Cultural Heritage monuments, six from Vietnam and 12 worldwide, with UNESCO source IDs',()=>{
  assert.equal(UNESCO_TOTAL,18);
  assert.equal(UNESCO_HERITAGE.filter(x=>x.country==='Việt Nam').length,6);
  assert.equal(UNESCO_HERITAGE.filter(x=>x.country!=='Việt Nam').length,12);
  assert.equal(new Set(UNESCO_HERITAGE.map(x=>x.id)).size,18);
  for(const x of UNESCO_HERITAGE){
    assert.ok(x.heritageInscriptionVerified);
    assert.equal(x.heritageType,'cultural');
    assert.equal(x.publishReady,false,'No automatic claim that photograph is publication-ready');
    assert.equal(UNESCO_BY_ID.get(x.id),x);
    assert.equal(discoveryById(x.id),x);
    assert.equal(x.unescoUrl,`https://whc.unesco.org/en/list/${x.whcId}/`);
    assert.ok(Math.abs(x.lat)<=90 && Math.abs(x.lng)<=180);
    assert.ok(x.math && x.shape && x.grade && x.history && x.kind);
    assert.ok(requestedWikiTitle(x));
  }
  assert.equal(UNESCO_BY_ID.get('unesco_vinhnghiem').year,2025);
  assert.equal(UNESCO_BY_ID.get('unesco_hue').wikipediaTitle,'Meridian Gate (Huế)');
  assert.equal(UNESCO_BY_ID.get('unesco_hoian').wikipediaTitle,'Japanese Bridge');
});

test('Sketchfab only embeds the curated 32-digit model IDs; never assumes the right to download GLB',()=>{
  assert.equal(UNESCO_HERITAGE.filter(x=>x.sketchfabId).length,14);
  for(const item of UNESCO_HERITAGE){
    const link=trustedSketchfabEmbed(item);
    if(item.sketchfabId){
      assert.match(link,/^https:\/\/sketchfab\.com\/models\/[a-f0-9]{32}\/embed\?/);
      assert.ok(item.modelAuthor);
    }else assert.equal(link,null);
  }
  assert.equal(trustedSketchfabEmbed({id:'unverified',sketchfabId:'a'.repeat(32)}),null);
  assert.equal(trustedSketchfabEmbed({...UNESCO_HERITAGE[0],sketchfabId:'http://evil.test'}),null);
});

test('R95 originals retained unchanged: 40 art exhibits, 36 old points, UNESCO added separately',()=>{
  assert.equal(DISCOVERY_ALL_ARTWORKS.length,40);
  assert.equal(DISCOVERY_ALL_LANDMARKS.length,36);
  for(const item of DISCOVERY_ALL_ARTWORKS) assert.ok(requestedWikiTitle(item));
  assert.equal(filterLandmarks(UNESCO_HERITAGE,{continent:'Châu Âu'}).length,5);
  assert.equal(filterLandmarks(UNESCO_HERITAGE,{text:'Ngo Mon'}).length,1);
  assert.equal(filterLandmarks(UNESCO_HERITAGE,{text:'Taj Mahal'}).length,1);
});

test('Three independent areas: foyer with one original Earth, left UNESCO frames, right preserved gallery',()=>{
  const world=src('dual/discovery-unesco-world.mjs');
  const app=src('dual/app.mjs');
  assert.match(app,/upgradeDiscoveryToUNESCO\(createDiscoveryWorld\(\)\)/);
  assert.match(world,/foyer\.add\(pivot\)/);
  assert.match(world,/oldGlobeRoom\.name='DISCOVERY_GLOBE_ROOM_UNESCO_GALLERY'/);
  assert.match(world,/world\.setRoom=\(name\)=>/);
  assert.match(world,/const coords=\[/);
  assert.match(world,/world\.unescoPins=pins/);
  assert.match(world,/artHits\.filter\(o=>o && o\.parent\?\.visible!==false\)/);
  assert.match(world,/createWallFrame\(entry,x,z,rot\)/);
  assert.match(world,/resolveDiscoveryPhoto\(item\)/);
  assert.ok(!world.includes('new THREE.WebGLRenderer('),'R96 world shares the existing renderer');
  assert.match(src('dual/discovery-world.mjs'),/const galleryRoom=new THREE\.Group\(\)/);
});

test('Image left, 2D / native GLB or embedded Sketchfab right, with legal attribution and no external redirect on selection',()=>{
  const html=src('dual/index.html');
  const ui=src('dual/discovery-ui.mjs');
  const resolver=src('dual/discovery-photo-r96.mjs');
  for(const id of ['discovery-photo','discovery-unesco-source','discovery-sketchfab-iframe','discovery-sketchfab-source','discovery-show-3d','discovery-show-2d','discovery-show-sketchfab']){
    assert.match(html,new RegExp(`id="${id}"`));
  }
  // R97: the approved 3D gallery must never embed Sketchfab; map/globe still may.
  assert.match(ui,/showView\(permitEmbed\?'sketchfab'/);
  assert.match(ui,/iframe\.src=url/);
  assert.match(ui,/iframe\.removeAttribute\('src'\)/);
  assert.match(ui,/resolveDiscoveryPhoto\(data\)/);
  assert.match(ui,/source\.textContent=.*media\.author.*media\.license/);
  assert.match(resolver,/CC\\s\*BY/);
  assert.match(resolver,/restricted=/);
  assert.match(src('dual/discovery-shapes.mjs'),/heritageInscriptionVerified/);
  assert.match(src('dual/discovery-world.mjs'),/real, licensed Wikimedia documentary photograph/);
});

test('Wikimedia metadata must be checked; share-alike permitted, non-commercial assets rejected',async()=>{
  const saved=globalThis.fetch;
  try{
    globalThis.fetch=async (url)=>{
      const bad=String(url).includes('test_bad');
      const page={};
      if(String(url).includes('imageinfo')) {
        page.imageinfo=[{
          url:'https://upload.wikimedia.org/wikipedia/commons/a/abc/test.jpg',
          thumburl:'https://upload.wikimedia.org/wikipedia/commons/a/abc/test.jpg',
          extmetadata:{
            LicenseShortName:{value:bad?'CC BY-NC 4.0':'CC BY-SA 4.0'},
            Artist:{value:'<b>Test author</b>'}
          }
        }];
      } else {
        page.pageimage=bad?'test_bad.jpg':'test_good.jpg';
      }
      return {ok:true,json:async()=>({query:{pages:{x:page}}})};
    };
    const good=await resolveDiscoveryPhoto({id:'r96_photo_test_good',wikipediaTitle:'test_good'});
    assert.equal(good.license,'CC BY-SA 4.0');
    assert.equal(good.author,'Test author');
    assert.ok(good.referenceOnly);
    const bad=await resolveDiscoveryPhoto({id:'r96_photo_test_bad',wikipediaTitle:'test_bad'});
    assert.equal(bad,null);
  }finally{globalThis.fetch=saved;}
});
