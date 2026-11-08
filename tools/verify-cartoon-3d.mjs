import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(readFileSync(join(root,'MANIFEST_CARTOON_3D_2026-11-04.json'),'utf8'));
let failures=0;
for(const [file,meta] of Object.entries(manifest.files)){
 try{const p=join(root,file),bytes=statSync(p).size,hash=createHash('sha256').update(readFileSync(p)).digest('hex');if(bytes!==meta.bytes||hash!==meta.sha256)throw Error('SHA-256 mismatch');}
 catch(e){console.error('[CHIBI] Invalid model/module:',file,e.message);failures++;}
}
const assets=JSON.parse(readFileSync(join(root,'dual/cartoon-3d/model-catalog.json'),'utf8'));
if(assets.assets.length!==22)failures++;
for(const item of assets.assets){if(!manifest.files['dual/cartoon-3d/'+item.file]){console.error('[CHIBI] File not listed:',item.file);failures++;}}
if(failures){console.error('[CHIBI] VALIDATION FAILED',failures);process.exitCode=1;}
else console.log('[OK] CHIBI CARTOON 3D: 10 characters | 12 GLB buildings | 7 LAB styles + original | 7 museum domes + original | 3 new gardens + original.');
