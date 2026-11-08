import {readFileSync,statSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
function fail(message){console.error('[LOI] '+message);process.exitCode=1;}
const revised='MANIFEST_MATHVERSE_2026-11-02_DA_SUA.json';
const original='MANIFEST_MATHVERSE_FINAL.json';
const releaseManifest=existsSync(join(root,revised))?revised:original;
const manifest=JSON.parse(readFileSync(join(root,releaseManifest),'utf8'));
const hex=file=>createHash('sha256').update(readFileSync(join(root,file))).digest('hex');
for(const [file,info] of Object.entries(manifest.files)){
  try{if(statSync(join(root,file)).size!==info.bytes||hex(file)!==info.sha256)fail('Tep hu hong/thieu: '+file);}
  catch(e){fail('Khong tim thay tep: '+file+'; '+e.message);}
}
const bank=JSON.parse(readFileSync(join(root,'game-park/assets/teacher-bank-6-12-63-chapters.json'),'utf8'));
const qa=JSON.parse(readFileSync(join(root,'game-park/quality-reports/QA_TONG_HOP_KHO_TOAN_6_12.json'),'utf8'));
const chapters=bank.chapters||[],all=chapters.flatMap(c=>c.questions||[]);
const valid=all.filter(q=>!q.issues?.length);
const pairs=new Set(chapters.map(c=>`${c.grade}/${c.chapter}`));
const ids=new Set(all.map(q=>q.id));
const grades=new Set(chapters.map(c=>c.grade));
if(chapters.length!==63||pairs.size!==63||[...grades].sort((a,b)=>a-b).join(',')!=='6,7,8,9,10,11,12')fail('Thieu lop hoac chuong');
if(chapters.some(c=>c.questions.length!==50))fail('Mot chuong khong du 50 cau nguon');
if(all.length!==3150||ids.size!==3150||valid.length!==3087||all.length-valid.length!==63)fail('Ngan hang cau hoi khong dung so luong');
if(qa.readyCount!==3087||qa.issueCount!==63)fail('Bao cao QA khong khop ngan hang');
if(all.some(q=>!q.answer||!['A','B','C','D'].includes(q.answer)||!q.sourceTex?.question||Object.keys(q.choices||{}).length!==4))fail('Cau hoi khong day du nguon hoac dap an');
if(valid.some(q=>!q.prompt_segments||!q.choice_segments||!['Dễ','Trung bình','Khó'].includes(q.difficulty)))fail('Cau thi thieu phan do kho hoac cong thuc');
if(process.exitCode)process.exit();
console.log('[OK] MATHVERSE FINAL: 11 game | Lop 6-12 | 63 chuong | 3150 cau | 3087 cau du dieu kien cau truc | 63 cau can ra soat.');
console.log('[OK] Nguon Word / LaTeX / PDF va tep ung dung duoc kiem tra SHA-256 theo: '+releaseManifest);
console.log('[LUU Y] 3087 cau moi qua kiem tra cau truc, chua duoc tham dinh doc lap 100% ve noi dung Toan.');
