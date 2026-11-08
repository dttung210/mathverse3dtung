/** Strict source preservation check against the exact R92 ZIP supplied by the teacher.
 * This audit intentionally does NOT rewrite old V10 baselines or any old source.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=rel=>crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,rel))).digest('hex');
const read=rel=>fs.readFileSync(path.join(ROOT,rel),'utf8');
const old=JSON.parse(read('BAO_TOAN_MANIFEST_DISCOVERY.json'));
const lines=read('AUDIT_BAO_TOAN_1784_TEP_R92.csv').replace(/^\uFEFF/,'').trim().split(/\r?\n/);
const header=lines.shift();
if(header!=='duong_dan,trang_thai,sha256_goc,sha256_sau')throw Error('Original source audit CSV is not recognized');
const rows=lines.map(line=>{const [relative,state,before,after]=line.split(',');return {relative,state,before,after};});
const failures=[];
let identical=0, changed=0;
for(const row of rows){
 if(!fs.existsSync(path.join(ROOT,row.relative))){failures.push(`Missing original: ${row.relative}`);continue;}
 const actual=sha(row.relative);
 if(row.state==='GIU_NGUYEN_SHA256'){
  identical++;
  if(actual!==row.before||row.before!==row.after)failures.push(`Original source changed: ${row.relative}`);
 }else{
  changed++;
  const backup=old.tep_nguon_chinh_sua_co_backup[row.relative];
  if(!backup)failures.push(`Unapproved integration change: ${row.relative}`);
  else if(actual!==backup.sha256_sau||sha(backup.backup)!==row.before)failures.push(`Integration patch/backup hash mismatch: ${row.relative}`);
 }
}
if(rows.length!==old.tong_tep_nguon||identical!==old.tep_nguon_giu_y_nguyen_hash||changed!==Object.keys(old.tep_nguon_chinh_sua_co_backup).length){
 failures.push('Original count / integration count has changed');
}
if(sha('00_MO_DU_AN_MOI_NHAT.bat')!==old.original_launcher_sha256)failures.push('Original launcher has changed');
// Historical V10 manifest predates R92 modifications. Compare against *original R92 hashes*,
// never force an older version over modern code to satisfy its stale checksum test.
const v10=JSON.parse(read('audit/V10_FUNCTIONAL_SOURCE_BASELINE.json'));
const srcHash=new Map(rows.map(r=>[r.relative,r.before]));
const skip=new Set([...(v10.exception_files||[]),'dual/crystal-architecture.mjs','dual/gallery.mjs']);
const legacyMismatch=[];let legacySame=0,legacyMissing=0;
for(const [rel,hash] of Object.entries(v10.files)){
 if(skip.has(rel))continue;
 const r92=srcHash.get(rel);
 if(!r92){legacyMissing++;continue;}
 if(r92===hash)legacySame++;
 else legacyMismatch.push(rel);
}
const report={current_source:'MATHVERSE R92 as provided',source_files:rows.length,unchanged_original_files:identical,approved_modified_original_files:changed,deleted_original_files:rows.filter(r=>!fs.existsSync(path.join(ROOT,r.relative))).length,v10_stale_checksum_count:legacyMismatch.length,v10_stale_files:legacyMismatch,v10_matching_checksums:legacySame,v10_missing:legacyMissing,integrity_failures:failures};
const reportPath=path.join(ROOT,'QA_WEBGL_R93','R93_SOURCE_AND_V10_LINEAGE_AUDIT.json');fs.mkdirSync(path.dirname(reportPath),{recursive:true});fs.writeFileSync(reportPath,JSON.stringify(report,null,2),'utf8');
console.log(`R92 source: ${rows.length} present, ${identical} unchanged, ${changed} approved patches, missing ${report.deleted_original_files}.`);
console.log(`V10 historical checksum: ${legacyMismatch.length} pre-existing mismatches relative to R92, kept intact (NOT new corruption).`);
console.log(`New regression errors: ${failures.length}; report: QA_WEBGL_R93/R93_SOURCE_AND_V10_LINEAGE_AUDIT.json`);
if(failures.length){for(const err of failures)console.error(err);process.exitCode=1;}
