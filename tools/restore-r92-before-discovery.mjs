import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd();
const audit=JSON.parse(fs.readFileSync(path.join(root,'BAO_TOAN_MANIFEST_DISCOVERY.json'),'utf8'));
const apply=process.argv.includes('--apply');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const operations=[];
for(const [rel,meta] of Object.entries(audit.tep_nguon_chinh_sua_co_backup)){
 const dst=path.join(root,rel),bak=path.join(root,meta.backup);
 if(!fs.existsSync(dst)||!fs.existsSync(bak))throw Error('Thieu tep: '+rel);
 if(sha(bak)!==meta.sha256_goc)throw Error('Backup bi sua, dung hoan tac: '+rel);
 if(![meta.sha256_sau,meta.sha256_goc].includes(sha(dst)))throw Error('Tep da bi sua tiep, DUNG de tranh ghi de: '+rel);
 operations.push([rel,dst,bak]);
}
console.log('Da xac minh '+operations.length+' tep ma nguon. Du lieu R92 khac khong bi dong den.');
if(!apply){console.log('CHUA HOAN TAC. Neu can, chay: node tools/restore-r92-before-discovery.mjs --apply');process.exit(0);}
for(const [rel,dst,bak] of operations){fs.copyFileSync(bak,dst);console.log('Da phuc hoi: '+rel);}
console.log('Da khoi phuc cac diem ket noi R92, giu nguyen toan bo du lieu.');
