/** Regenerate the exact approved-pedestal candidate list from the *current* project catalog. */
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {GALLERY_ITEMS,R102_CATALOG} from '../dual/discovery-r102/catalog.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=path.join(root,'R105_AGENT');
const rows=GALLERY_ITEMS.map(x=>({
 id:x.id,name:x.name,group:x.group,sketchfabUID:x.uid,
 sourceURL:`https://sketchfab.com/models/${x.uid}`,
 creditedAuthorInExistingR104:x.author||null,
 reviewStatus:'PENDING_REVIEW_OF_SOURCE_AND_LICENSE',
 nativeGLBStatus:'NOT_BUNDLED_IN_R105',
 heritageStatus:x.isReconstruction?'RECONSTRUCTION_NOT_ORIGINAL_SCAN':'MUST_VERIFY_SOURCE',
 mathShape:x.shape
}));
const sheet={version:'R105',origin:'Extracted verbatim identifiers from the uploaded MATHVERSE R104 catalog',
  exhibitionPedestals:rows,worldMapAndGlobePoints:R102_CATALOG.length,
  warning:'Links and credits are inherited candidates, not license verification. Only the Parthenon GLB is presently included.'};
await writeFile(path.join(out,'DANH_MUC_NGUON_9_BUC.json'),JSON.stringify(sheet,null,2)+'\n');
const group=g=>g==='ancient'?'Cổ đại':g==='new2007'?'New7Wonders':'Kiến trúc khác';
const lines=[
 '# DANH MỤC 9 BỤC – TỪ ZIP R104 CÔ CUNG CẤP',
 '',
 '> **Chỉ là nguồn ứng viên.** Chưa chứng minh quyền tải, độ đúng địa danh, hoặc mức chính xác quang trắc. Antigravity phải kiểm tra từng mô hình và tác giả.',
 '',
 '| ID công trình | Công trình | Nhóm | Sketchfab link trong R104 | Tác giả ghi trong R104 |',
 '|---|---|---|---|---|',
 ...rows.map(x=>`| \`${x.id}\` | ${x.name} | ${group(x.group)} | [Xem Sketchfab](${x.sourceURL}) | ${x.creditedAuthorInExistingR104||'Chưa rõ'} |`),
 '',
 'Parthenon: `dual/discovery-r98/assets/unesco_parthenon_glb.glb` – **giữ nguyên**.',
 '',
 'Tổng điểm bản đồ/địa cầu: '+R102_CATALOG.length+'; không được xóa hoặc đưa nhầm tất cả 18 địa điểm vào phòng.',
 '',
 'Mỗi mô hình nhập thành công phải ghi `file`, `author`, `license`, `sourceURL`, `sha256`, `modelUid`, `verifiedWebGL` vào `dual/discovery-r103/assets/approved-local-models.json`.',
 'Không gọi bất kỳ nguồn ứng viên nào là "đã tích hợp GLB" nếu chưa có tệp trong assets và kết quả nghiệm thu.'
];
await writeFile(path.join(out,'DANH_MUC_NGUON_9_BUC.md'),lines.join('\n')+'\n');
console.log('Created 9 selected candidate sources and provenance checklist.');
