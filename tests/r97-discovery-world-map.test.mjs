/** R97 geographical accuracy and heritage-geometry gating. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {UNESCO_HERITAGE} from '../dual/discovery-unesco-data.mjs';
import {DISCOVERY_ALL_ARTWORKS,DISCOVERY_ALL_LANDMARKS} from '../dual/discovery-data.mjs';
import {R97_VERIFIED_IDS,R97_VERIFIED_UNESCO_MODELS} from '../dual/discovery-r97/verified-heritage.mjs';
import {R97_GIZA_KHUFU_GEOMETRY_GLB_BASE64} from '../dual/discovery-r97/giza-glb-data.mjs';
import {validLatLon,lonLatToPixel,pixelToLonLat,normalizeOfficialUnesco,normalizeOfficialDataset,countryFeatures,geometryRings,NATURAL_EARTH_50M_URL,OFFLINE_COUNTRIES_PATH} from '../dual/discovery-r97/geo-core.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const src=n=>readFileSync(path.join(root,n),'utf8');
test('Natural Earth WGS84 map: consistent globe coordinates, offline borders and 50m upgrade',()=>{
 assert.deepEqual(lonLatToPixel(0,0,360,180),{x:180,y:90});
 for(const [lat,lng] of [[16.4669,107.5791],[-7.6079,110.2038],[29.9792,31.1342],[-33.8568,151.2153]]){
  assert.ok(validLatLon(lat,lng));const point=lonLatToPixel(lng,lat,1440,720);const reverse=pixelToLonLat(point.x,point.y,1440,720);
  assert.ok(Math.abs(reverse.lat-lat)<1e-7);assert.ok(Math.abs(reverse.lng-lng)<1e-7);
 }
 const geo=JSON.parse(src('dual/discovery-r97/countries-110m-offline.geojson'));
 assert.equal(countryFeatures(geo).length,177,'110m offline fallback explicitly has 177 features, not all world countries');
 assert.ok(countryFeatures(geo).every(x=>geometryRings(x).length));
 assert.match(NATURAL_EARTH_50M_URL,/ne_50m_admin_0_countries\.geojson/);
 assert.equal(OFFLINE_COUNTRIES_PATH,'/dual/discovery-r97/countries-110m-offline.geojson');
});
test('Official UNESCO records: only cultural and geographically valid sites; no fabricated photo or 3D',()=>{
 const feature={type:'Feature',geometry:{type:'Point',coordinates:[103.867,13.4125]},properties:{id_no:668,name_en:'Angkor',category:'Cultural',states_names:'Cambodia',date_inscribed:'1992',short_description_en:'A historic temple complex'}};
 const site=normalizeOfficialUnesco(feature);
 assert.equal(site.id,'unesco_official_668');assert.equal(site.lat,13.4125);assert.equal(site.lng,103.867);
 assert.equal(site.model3d,false);assert.equal(site.sketchfabId,null);assert.equal(site.media.photo,'');
 assert.equal(site.unescoUrl,'https://whc.unesco.org/en/list/668/');
 assert.equal(normalizeOfficialUnesco({...feature,properties:{...feature.properties,category:'Natural'}}),null);
 assert.equal(normalizeOfficialUnesco({...feature,geometry:{type:'Point',coordinates:[800,13]}}),null);
 assert.deepEqual(normalizeOfficialDataset({features:[feature,feature]}).map(s=>s.id),['unesco_official_668']);
});
test('Room UNESCO: only three structurally supported models, not 18 arbitrary GLB approximations',()=>{
 assert.deepEqual([...R97_VERIFIED_IDS].sort(),['unesco_borobudur','unesco_giza','unesco_parthenon']);
 assert.equal(UNESCO_HERITAGE.length,18);
 for(const id of R97_VERIFIED_IDS){
  assert.ok(UNESCO_HERITAGE.find(x=>x.id===id));
  assert.ok(R97_VERIFIED_UNESCO_MODELS[id].source.startsWith('https://'));
  assert.match(R97_VERIFIED_UNESCO_MODELS[id].caveat,/không phải/i);
 }
 const g=R97_VERIFIED_UNESCO_MODELS.unesco_giza.dimensions;
 assert.ok(Math.abs(g.ratioHeightBase-g.originalHeightMeters/g.baseMeters)<1e-10);
 assert.equal(R97_VERIFIED_UNESCO_MODELS.unesco_borobudur.parameters.squareTerraces,5);
 assert.equal(R97_VERIFIED_UNESCO_MODELS.unesco_borobudur.parameters.circularTerraces,3);
 assert.equal(R97_VERIFIED_UNESCO_MODELS.unesco_parthenon.parameters.frontColumns,8);
 assert.equal(R97_VERIFIED_UNESCO_MODELS.unesco_parthenon.parameters.sideColumns,17);
 const room=src('dual/discovery-unesco-world.mjs');assert.match(room,/UNESCO_VERIFIED_ROOM\[i\]/);
 assert.match(room,/verifiedModelHits/);assert.match(room,/R97_UNESCO_VERIFIED_GEOMETRY_/);
 assert.doesNotMatch(room,/iframe\.src\s*=/);
});
test('Native GLB Giza has valid binary container; museum must not mislabel it as a scan',()=>{
 const buffer=Buffer.from(R97_GIZA_KHUFU_GEOMETRY_GLB_BASE64,'base64');
 assert.equal(buffer.toString('utf8',0,4),'glTF');
 assert.equal(buffer.readUInt32LE(8),buffer.length);
 const glbFile=path.join(root,'dual/discovery-r97/models/giza_khufu_original_ratio_geometry_not_scan.glb');
 assert.ok(existsSync(glbFile));assert.deepEqual(readFileSync(glbFile),buffer);
 const shapes=src('dual/discovery-shapes.mjs');assert.match(shapes,/parseGlbFromBase64\(R97_GIZA_KHUFU_GEOMETRY_GLB_BASE64,g\)/);
 assert.match(shapes,/new THREE\.CylinderGeometry\(0\.72, 0\.72, 0\.12, 32\)/);
});
test('Physically separated 3D map, rotating globe, UNESCO and original 40 + R106 11 pictures',()=>{
 assert.equal(DISCOVERY_ALL_ARTWORKS.length,68);assert.equal(DISCOVERY_ALL_LANDMARKS.length,36);
 const app=src('dual/app.mjs'),ui=src('dual/discovery-ui.mjs'), html=src('dual/index.html');
 assert.match(app,/upgradeDiscoveryToWorldMapR97\(upgradeDiscoveryToUNESCO\(createDiscoveryWorld\(\)\)\)/);
 assert.match(app,/createDiscoveryWorldMapUI\(/);
 assert.match(app,/discovery\.setWorldHeritageDots\?\.\(sites\)/);
 assert.match(html,/id="discovery-btn-map"/);
 assert.match(ui,/currentRoomId==='unesco'\|\|currentRoomId==='globe'/);
 assert.match(ui,/permitEmbed=Boolean\(embed\)/);
 assert.match(ui,/registerOfficialSites\(sites=\[\]\)/);
 assert.match(src('dual/discovery-r97/world-map-room.mjs'),/DISCOVERY_R97_WORLD_MAP_ROOM/);
 assert.match(src('dual/discovery-r97/world-map-ui.mjs'),/fetchOfficialUNESCO\(\)/);
 assert.match(src('dual/discovery-r97/world-map-ui.mjs'),/NATURAL_EARTH_50M_URL/);
 assert.match(ui,/Chưa có ảnh thực tế được kiểm chứng/);
});
