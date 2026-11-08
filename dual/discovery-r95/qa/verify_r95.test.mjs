import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mergeByIdPreserveExisting, isReadyToPublish,isReadyToShowPhotograph,filterLandmarks,MAX_GALLERY_PHYSICAL_FRAMES} from '../ui/catalog-merge-r95.mjs';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const j=p=>JSON.parse(readFileSync(join(root,p),'utf8'));
const landmarks=j('data/landmarks_add_r95.json').landmarks;
const exhibits=j('data/gallery_add_r95.json').exhibits;
const ids=arr=>arr.map(x=>x.id);
const glbDir=join(root,'models');
test('Chính xác 32 địa danh bổ sung, không ID trùng',()=>{assert.equal(landmarks.length,32);assert.equal(new Set(ids(landmarks)).size,32);});
test('Chính xác 36 tranh, 6 nhóm, mỗi nhóm 6 tranh',()=>{
 assert.equal(exhibits.length,36);assert.equal(new Set(ids(exhibits)).size,36);
 const groups=new Map();for(const x of exhibits)groups.set(x.collection,(groups.get(x.collection)||0)+1);
 assert.equal(groups.size,6);for(const n of groups.values())assert.equal(n,6);
});
test('Mỗi địa danh có tọa độ, chủ đề toán, nguồn và SVG',()=>{for(const x of landmarks){
 assert.ok(x.latitude>=-90&&x.latitude<=90&&Number.isFinite(x.latitude));
 assert.ok(x.longitude>=-180&&x.longitude<=180&&Number.isFinite(x.longitude));
 assert.ok(x.geometry.modelType&&x.geometry.latex&&!x.geometry.latex.includes('\t'));
 assert.ok(x.sourceUrl.startsWith('https://'));
 assert.ok(existsSync(join(root,x.svgPath)),x.svgPath);
 assert.ok(x.publishReady===false&&!isReadyToPublish(x));
 assert.ok(x.photo.status==='needs_licensed_photo');
}});
test('Tranh ảnh có SVG 2D và mặc định chưa giả nhận là ảnh thật',()=>{for(const x of exhibits){
 assert.ok(existsSync(join(root,x.svgPath)));assert.equal(x.publishReady,false);
 assert.ok(x.photo.status==='needs_licensed_photo');assert.ok(!isReadyToShowPhotograph(x));
}});
test('Các SVG hợp lệ, không có script hoặc ảnh từ web chèn vào',()=>{
 const paths=[...landmarks,...exhibits].map(x=>join(root,x.svgPath));
 for(const p of paths){const s=readFileSync(p,'utf8');assert.ok(s.startsWith('<svg'));assert.ok(s.includes('</svg>'));
 assert.ok(!s.includes('<script'));assert.ok(!s.includes('<image'));assert.ok(s.includes('KHÔNG PHẢI ẢNH THẬT'));}
});
test('13 GLB đều có header glTF2 và chiều dài khai báo đúng',()=>{
 const names=readdirSync(glbDir).filter(x=>x.endsWith('.glb'));assert.equal(names.length,13);
 for(const name of names){const b=readFileSync(join(glbDir,name));assert.equal(b.toString('utf8',0,4),'glTF');assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);}
});
test('Merge bảo toàn dữ liệu cũ, không sửa object gốc, bỏ qua ID trùng',()=>{
 const old=[{id:'giza',title:'Bản gốc'},{id:'sydney',title:'Bản gốc 2'}];
 const result=mergeByIdPreserveExisting(old,[{id:'giza',title:'Override attempted'},landmarks[0]]);
 assert.equal(result.items.length,3);assert.equal(result.items[0],old[0]);assert.equal(old.length,2);
 assert.deepEqual(result.skipped,['giza']);assert.equal(result.originalCount,2);
});
test('Tìm kiếm tiếng Việt không dấu và giới hạn 8 khung vật lý',()=>{
 const filtered=filterLandmarks(landmarks,{text:'đền Borobudur'});assert.equal(filtered.length,1);
 assert.equal(MAX_GALLERY_PHYSICAL_FRAMES,8);
});
test('Không có ID xung đột R94 của bộ bổ sung trước',()=>{
 // Separate hard-coded from the current R94 catalog so this test works offline.
 const formerLandmarks=new Set('giza louvre pantheon sydney eiffel golden_gate london_eye washington nhat_tan pisa gateway_arch taj_mahal dragon_bridge'.split(' '));
 const formerPaintings=new Set('traffic fish bicycle clock tiles honeycomb aquarium soccer'.split(' '));
 assert.ok(landmarks.every(x=>!formerLandmarks.has(x.id)));assert.ok(exhibits.every(x=>!formerPaintings.has(x.id)));
});
