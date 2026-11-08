import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {deflateRawSync} from 'node:zlib';
import {GALLERY_ITEMS,GLOBE_MAP_ITEMS} from '../dual/discovery-r102/catalog.mjs';
import {
 isValidSketchfabUID,sketchfabCandidate,allowedLicense,safeZipPath,crc32,
 unzipGltfArchive,inspectGLB,auditInstalledModels,main
} from '../tools/r105-sketchfab-pipeline.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const source=name=>fs.readFileSync(path.join(root,name),'utf8');

function zipFiles(data){
 const locals=[],centrals=[];let offset=0;
 for(const [name,value] of Object.entries(data)){
  const filename=Buffer.from(name,'utf8'),buffer=Buffer.from(value),compressed=deflateRawSync(buffer);
  const head=Buffer.alloc(30);head.writeUInt32LE(0x04034b50,0);head.writeUInt16LE(20,4);head.writeUInt16LE(8,8);
  head.writeUInt32LE(crc32(buffer),14);head.writeUInt32LE(compressed.length,18);head.writeUInt32LE(buffer.length,22);head.writeUInt16LE(filename.length,26);
  const part=Buffer.concat([head,filename,compressed]);locals.push(part);
  const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50,0);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(8,10);
  c.writeUInt32LE(crc32(buffer),16);c.writeUInt32LE(compressed.length,20);c.writeUInt32LE(buffer.length,24);c.writeUInt16LE(filename.length,28);c.writeUInt32LE(offset,42);
  centrals.push(Buffer.concat([c,filename]));offset+=part.length;
 }
 const centralBuffer=Buffer.concat(centrals),end=Buffer.alloc(22);
 end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(centrals.length,8);end.writeUInt16LE(centrals.length,10);
 end.writeUInt32LE(centralBuffer.length,12);end.writeUInt32LE(offset,16);
 return Buffer.concat([...locals,centralBuffer,end]);
}
function fakeGLB(triangleCount){
 const graph={asset:{version:'2.0'},accessors:[{count:triangleCount*3}],meshes:[{primitives:[{attributes:{POSITION:0}}]}],materials:[{}],images:[]};
 const text=JSON.stringify(graph),pad=(4-text.length%4)%4;
 const json=Buffer.from(text+' '.repeat(pad),'utf8');const glb=Buffer.alloc(20+json.length);
 glb.write('glTF');glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8);glb.writeUInt32LE(json.length,12);glb.write('JSON',16);json.copy(glb,20);
 return glb;
}

test('R105 uses same 9 UNESCO room podiums and 18 globe/map points as the uploaded R104',()=>{
 assert.equal(GALLERY_ITEMS.length,9);assert.equal(GLOBE_MAP_ITEMS.length,18);
 for(const item of GALLERY_ITEMS){
  assert.ok(isValidSketchfabUID(item.uid),item.id);
  const candidate=sketchfabCandidate(item);
  assert.equal(candidate.licenseStatus,'CHUA_XAC_MINH');
  assert.ok(candidate.sketchfabURL.endsWith(item.uid));
 }
});
test('Never accept restricted, unknown, non-commercial or non-derivative licenses automatically',()=>{
 for(const license of ['CC BY','CC BY 4.0','CC0 1.0','CC BY-SA 4.0','Creative Commons Attribution 4.0'])assert.equal(allowedLicense(license),true,license);
 for(const license of ['CC BY-NC 4.0','CC BY-ND 4.0','Editorial Only','All Rights Reserved','Unknown',''])assert.equal(allowedLicense(license),false,license);
});
test('Reject untrusted ZIP path traversal and Windows drive paths',()=>{
 for(const unsafe of ['../evil.gltf','../../a.png','C:\\WINDOWS\\system32\\evil.gltf','/absolute/scene.gltf'])assert.throws(()=>safeZipPath(unsafe));
 assert.equal(safeZipPath('scene.gltf'),'scene.gltf');
 assert.equal(safeZipPath('textures\\texture.jpg'),'textures/texture.jpg');
});
test('Read an authenticated Sketchfab-shaped glTF ZIP safely using only native Node.js',()=>{
 const archive=zipFiles({'assets/scene.gltf':JSON.stringify({asset:{version:'2.0'}}),'assets/texture.jpg':Buffer.from('not-real-jpeg'),'README.txt':'no code'});
 const files=unzipGltfArchive(archive);
 assert.ok(files.has('assets/scene.gltf'));
 assert.ok(files.has('assets/texture.jpg'));
 assert.ok(!files.has('README.txt'));
 assert.equal(files.get('assets/scene.gltf').toString('utf8'),'{"asset":{"version":"2.0"}}');
});
test('Reject tampered glTF ZIP compressed data using CRC validation',()=>{
 const archive=zipFiles({'scene.gltf':'{"asset":{"version":"2.0"}}'});
 const corrupted=Buffer.from(archive);corrupted[44]^=0xff;
 assert.throws(()=>unzipGltfArchive(corrupted));
});
test('GLB native mesh parser counts actual triangle primitives from glTF 2.0 JSON chunk',()=>{
 const valid=fakeGLB(2700);assert.deepEqual(inspectGLB(valid),{meshes:1,triangles:2700,materials:1,images:0,extensions:[]});
 const invalid=Buffer.from(valid);invalid.writeUInt32LE(1,4);
 assert.throws(()=>inspectGLB(invalid),/glTF 2.0/);
});
test('The R98 photogrammetry Parthenon asset remains present and not replaced',()=>{
 const scan=path.join(root,'dual/discovery-r98/assets/unesco_parthenon_glb.glb');
 assert.ok(fs.statSync(scan).size>20_000_000);
 const room=source('dual/discovery-r102/exhibition-room.mjs');
 assert.match(room,/R98_APPROVED_ARCHITECTURE_ONLY/);
 assert.match(room,/stand\.model\.add\(scene\)/);
 assert.match(room,/MÔ HÌNH GLB · NGUỒN CÓ GHI CÔNG/);
});
test('Registered GLB stays absent until a genuine, licensed file is installed',async()=>{
 const report=await auditInstalledModels({print:false});
 assert.equal(report.length,9);
 const manifest=JSON.parse(source('dual/discovery-r103/assets/approved-local-models.json'));
 assert.equal(manifest.models.length,0);
 assert.ok(report.every(x=>x.status==='SKETCHFAB_CHUA_CO_GLB'));
});
test('Fetch requires explicit model review and official Sketchfab authorization, never retrieves an iframe mesh',async()=>{
 await assert.rejects(()=>main(['--fetch','wonder_giza']),/--confirm-reviewed/);
 const pipeline=source('tools/r105-sketchfab-pipeline.mjs');
 assert.ok(pipeline.includes('SKETCHFAB_OAUTH_ACCESS_TOKEN'));
 assert.ok(pipeline.includes('/v3/models/${item.uid}/download'));
 assert.ok(!pipeline.includes('localStorage'));
 assert.ok(pipeline.includes('authorizedMetadata'));
});
test('R100 dual-column modal survives and R105 adds source/GLB provenance',()=>{
 const ui=source('dual/discovery-r100/wonders-ui.mjs'),css=source('dual/discovery-r100/wonders.css');
 for(const c of ['r100-window','r100-media-grid','r100-photo-box','r100-viewer','r100-list','r100-details']){
  assert.ok(ui.includes(c));assert.ok(css.includes('.'+c));
 }
 assert.match(ui,/r105-glb-status/);
 assert.match(ui,/asset\.sourceURL/);
});
test('Antigravity prompt, offline audit and one primary R105 launcher are bundled',()=>{
 assert.ok(fs.existsSync(path.join(root,'R105_AGENT/PROMPT_ANTIGRAVITY_R105.md')));
 assert.ok(fs.existsSync(path.join(root,'R105_AGENT/DANH_MUC_NGUON_9_BUC.md')));
 assert.ok(fs.existsSync(path.join(root,'00_MO_MATHVERSE_R105.bat')));
 assert.ok(!fs.existsSync(path.join(root,'00_MO_MATHVERSE_R104.bat')));
});
