import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {MODE_BY_ID} from '../src/museum/r6-room-layout.js';
import {createModeExhibit} from '../src/museum/r67-mode-exhibits.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const q=s=>'"'+String(s??'').replaceAll('"','""')+'"';
const lines=[['Lop','Phong','Lab','Ma_mo_hinh','Ten_mo_hinh','Trang_thai_kho','Hien_vat_3D','Phan_loai_3D','Mo_dung_kho_SGK','Trang_thai_nghiem_thu_Windows']];
const count={};let planes=0,boards=0,real=0;
for(const mode of MODE_BY_ID.values()){
 const preview=createModeExhibit(mode.grade,mode);const type=preview.userData.exhibitKind;let meshes=0;
 preview.traverse(o=>{if(o.isMesh){meshes++;if(o.geometry?.type==='PlaneGeometry')planes++;if(o.material?.map?.isCanvasTexture)boards++;}});
 if(!meshes)throw Error('Mode missing 3D exhibit '+mode.id);
 if(['3d-solid','3d-real-object'].includes(type))real++;
 count[type]=(count[type]||0)+1;
 lines.push([mode.grade,mode.roomId,mode.labId,mode.id,mode.name,mode.status,meshes,type,'Kho SGK Toan 6-12','CHUA KIEM TRA GPU']);
 preview.traverse(o=>{o.geometry?.dispose?.();const ma=o.material;if(Array.isArray(ma))ma.forEach(m=>{m.map?.dispose?.();m.dispose?.();});else{ma?.map?.dispose?.();ma?.dispose?.();}});
}
if(lines.length!==311||planes||boards)throw Error('Gallery validation failed '+JSON.stringify({count:lines.length,planes,boards}));
const filename='R67_DOI_CHIEU_310_MO_HINH_3D.csv';
fs.writeFileSync(path.join(root,filename),'\ufeff'+lines.map(x=>x.map(q).join(',')).join('\r\n'),'utf8');
const summary={modelCount:310,gradeCount:7,roomCount:34,labCount:130,meshesRealGeometry:true,planeMeshes:planes,canvasTextureBoards:boards,volumeFamilies:real,categories:count};
fs.writeFileSync(path.join(root,'R67_GALLERY_SUMMARY.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
