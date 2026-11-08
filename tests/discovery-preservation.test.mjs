import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const ROOT=path.resolve(import.meta.dirname,'..');
const meta=JSON.parse(fs.readFileSync(path.join(ROOT,'BAO_TOAN_MANIFEST_DISCOVERY.json'),'utf8'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,p))).digest('hex');
test('Original R92 launcher is byte-identical, not replaced',()=>{
 assert.equal(sha('00_MO_DU_AN_MOI_NHAT.bat'),meta.original_launcher_sha256);
});
test('All changed code files are backed up with correct SHA256',()=>{
 assert.ok(Object.keys(meta.tep_nguon_chinh_sua_co_backup).length>=5);
 for(const [rel,item] of Object.entries(meta.tep_nguon_chinh_sua_co_backup)){
  assert.equal(sha(rel),item.sha256_sau,rel);
  assert.equal(sha(item.backup),item.sha256_goc,rel);
 }
});
test('All unchanged R92 original files match their source SHA256, none removed',()=>{
 const csv=fs.readFileSync(path.join(ROOT,'AUDIT_BAO_TOAN_1784_TEP_R92.csv'),'utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/);
 assert.equal(csv.length,1785);
 for(const line of csv.slice(1)){
  const parts=line.split(',');const rel=parts[0],state=parts[1],before=parts[2];
  if(state==='GIU_NGUYEN_SHA256')assert.equal(sha(rel),before,'Nguon bi thay doi: '+rel);
 }
 assert.equal(meta.tep_nguon_giu_y_nguyen_hash,1778);
 assert.deepEqual(meta.tep_nguon_bi_xoa,[]);
 assert.deepEqual(meta.tep_du_lieu_goc_bi_sua,[]);
});
