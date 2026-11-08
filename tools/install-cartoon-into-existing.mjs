/**
 * Optional updater for the user's later hotfixed MATHVERSE installation.
 * Never replaces the bank, mathematical labs, park or full existing JS sources.
 * Makes reversible backups before source injection. Idempotent.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.resolve(process.argv[2]||'.');
function fail(m){console.error('[LOI CHIBI UPDATE]',m);process.exit(1);}
if(source===target)fail('Trong bo cai moi, Chibi da co san. Hay dung BAT mo MATHVERSE binh thuong.');
if(!fs.existsSync(path.join(target,'dual','app.mjs'))||!fs.existsSync(path.join(target,'dual','index.html'))||!fs.existsSync(path.join(target,'package.json')))fail('Khong tim thay thu muc goc MATHVERSE. Hay chon thu muc chua dual/ va package.json');
const stamp=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
const backup=path.join(target,'SAO_LUU_TRUOC_CHIBI_'+stamp);
const read=p=>fs.readFileSync(path.join(target,p),'utf8');
function requireReplace(text,from,to,id){if(text.includes(to))return text;if(!text.includes(from))throw Error('Khong tim thay vi tri an toan: '+id);return text.replace(from,to);}
let app=read('dual/app.mjs'),html=read('dual/index.html'),css=read('dual/style.css');
if(!app.includes('createCartoonStudio(')){
 app=requireReplace(app,"import {createAvatar} from './avatar-r75.mjs';","import {createAvatar} from './avatar-r75.mjs';\nimport {createCartoonStudio,ALL_AVATAR_IDS,CHIBI_PRESETS,isChibiPreset} from './cartoon-3d/studio.mjs';",'import');
 app=requireReplace(app,"lobbyGroup.add(masterplanRoads.group);","lobbyGroup.add(masterplanRoads.group);\nconst cartoonStudio=createCartoonStudio({avatar,lobbyGroup,onAvatarChange:value=>saveAvatar(value),onStatus:message=>status(message)});",'studio attach');
 app=requireReplace(app,"if(!['alex','triet','an','bot'].includes(value))return;","if(!ALL_AVATAR_IDS.includes(value))return;",'avatar allow-list');
 app=requireReplace(app,"try{const mv=$('r75-frame').contentWindow?.museum;if(mv&&mv.getAvatarType?.()!==value)mv.setAvatarType(value);}catch{}","cartoonStudio.syncAvatar();\n  const r75Compatible=isChibiPreset(value)?'triet':value;\n  try{const mv=$('r75-frame').contentWindow?.museum;if(mv&&mv.getAvatarType?.()!==r75Compatible)mv.setAvatarType(r75Compatible);}catch{}",'r75 avatar fallback');
 app=requireReplace(app,"renderer.shadowMap.enabled=val==='high';onResize();","renderer.shadowMap.enabled=val==='high';cartoonStudio.setQuality(val);onResize();",'quality');
 app=requireReplace(app,"if(type&&['alex','triet','an','bot'].includes(type))saveAvatar(type);","if(type&&['alex','triet','an','bot'].includes(type)&&!isChibiPreset(avatar.getAvatarType()))saveAvatar(type);",'return avatar');
 app=requireReplace(app,"const types=['alex','triet','an','bot'];","const types=ALL_AVATAR_IDS;",'cycle');
 app=requireReplace(app,"status('Nhân vật: '+({alex:'Alex',triet:'Triết',an:'An',bot:'Bot Pi'}[next]));","status('Nhân vật: '+({alex:'Alex',triet:'Triết',an:'An',bot:'Bot Pi'}[next]||CHIBI_PRESETS.find(c=>c.id===next)?.name||next));",'avatar label');
 app=requireReplace(app,"function update(dt){\n  if(mode==='r75'||","function update(dt){\n  if(cartoonStudio.isOpen||mode==='r75'||",'modal movement');
 app=requireReplace(app,"if(api.getAvatarType?.()!==avatar.getAvatarType())api.setAvatarType?.(avatar.getAvatarType());","const originalAvatar=isChibiPreset(avatar.getAvatarType())&&!api.supportsChibiCartoon?'triet':avatar.getAvatarType();\n    if(api.getAvatarType?.()!==originalAvatar)api.setAvatarType?.(originalAvatar);",'enter R75');
 if(app.includes('getGrand:()=>grand,getParkPortal'))app=app.replace('getGrand:()=>grand,getParkPortal','getGrand:()=>grand,getCartoonStudio:()=>cartoonStudio,getParkPortal');
}
if(!html.includes('id="cartoon-studio-panel"')){
 const donor=fs.readFileSync(path.join(source,'dual/index.html'),'utf8');
 const addonPanel=donor.match(/  <section id="cartoon-studio-panel"[\s\S]*?<\/section>/)?.[0];
 if(!addonPanel)fail('Nguon giao dien bo sung khong hop le');
 html=requireReplace(html,'  <section id="lobby-menu" class="glass" hidden>',addonPanel+'\n  <section id="lobby-menu" class="glass" hidden>','overlay');
}
if(!html.includes('id="cartoon-studio-open"')){
 const needle='<button id="avatar-next" type="button" title="Đổi nhân vật (V)">NHÂN VẬT ⇄</button>';
 html=requireReplace(html,needle,needle+'\n    <button id="cartoon-studio-open" type="button" aria-expanded="false" aria-controls="cartoon-studio-panel">🎨 CHIBI 3D</button>','button');
}
if(!html.includes('<option value="chibi-amber">')){
 const optionList=[['chibi-amber','Áo Cam'],['chibi-sakura','Sakura'],['chibi-ocean','Đại Dương'],['chibi-mint','Bạc Hà'],['chibi-astro','Phi Hành Gia'],['chibi-lavender','Oải Hương'],['chibi-scientist','Nhà Khoa Học'],['chibi-sun','Mặt Trời'],['chibi-robot','Robot'],['chibi-night','Đêm Sao']].map(([k,v])=>`<option value="${k}">Chibi ${v}</option>`).join('');
 html=requireReplace(html,'<option value="bot">Bot Pi</option></select>','<option value="bot">Bot Pi</option>'+optionList+'</select>','avatar selector');
}
if(!html.includes('href="/dual/cartoon-3d/studio.css"')){
 html=requireReplace(html,'</head>','<link rel="stylesheet" href="/dual/cartoon-3d/studio.css"/>\n</head>','stylesheet');
}
// Optional R75 skin support, no changes to R75 math, navigation or portal logic.
let r75File=null;
if(fs.existsSync(path.join(target,'src/museum.js'))){
 const originalR75=read('src/museum.js');r75File=originalR75;
 if(!originalR75.includes('enhanceOriginalAvatar(')){
  const header="import * as THREE from '/vendor/three.module.js';";
  const creation="  const avatar = createAvatar(savedAvatar);\n  scene.add(avatar.root);";
  if(originalR75.includes(header)&&originalR75.includes(creation)){
   r75File=r75File.replace(header,header+"\nimport {enhanceOriginalAvatar,isChibiPreset} from './cartoon-3d/avatar-adapter.mjs';");
   r75File=r75File.replace(creation,"  const avatar = createAvatar(isChibiPreset(savedAvatar)?'triet':savedAvatar);\n  enhanceOriginalAvatar(avatar);\n  if(isChibiPreset(savedAvatar))avatar.setAvatarType(savedAvatar);\n  scene.add(avatar.root);");
   r75File=r75File.replace('    getAvatarType: () => avatar.getAvatarType(),','    getAvatarType: () => avatar.getAvatarType(),\n    supportsChibiCartoon: true,');
  }else console.warn('[CANH BAO] Khong sua R75 vi cau truc khac ban. Grand Campus van co 10 Chibi.');
 }
}
let verifier=fs.existsSync(path.join(target,'tools/verify-mathverse-final.mjs'))?read('tools/verify-mathverse-final.mjs'):null;
if(verifier&&(!verifier.includes("MANIFEST_CARTOON_3D_2026-11-04.json"))){
 const needle="const manifest=JSON.parse(readFileSync(join(root,'MANIFEST_MATHVERSE_FINAL.json'),'utf8'));";
 if(verifier.includes(needle)&&verifier.includes('for(const [file,info] of Object.entries(manifest.files)){')){
  verifier=verifier.replace(needle,needle+"\nlet cartoonAddon={files:{}};try{cartoonAddon=JSON.parse(readFileSync(join(root,'MANIFEST_CARTOON_3D_2026-11-04.json'),'utf8'));}catch{}");
  verifier=verifier.replace('for(const [file,info] of Object.entries(manifest.files)){','for(const [file,originalInfo] of Object.entries(manifest.files)){\n  const info=cartoonAddon.files[file]||originalInfo;');
 }else console.warn('[CANH BAO] Bo kiem cu dang su dung cau truc moi; can kiem thu check:final sau khi cai.');
}
// Validate every source pattern before modifying disk, then make full backups.
const originals={'dual/app.mjs':read('dual/app.mjs'),'dual/index.html':read('dual/index.html'),'dual/style.css':css};
if(verifier!==null)originals['tools/verify-mathverse-final.mjs']=read('tools/verify-mathverse-final.mjs');
if(r75File!==null)originals['src/museum.js']=read('src/museum.js');
originals['package.json']=read('package.json');
for(const [name,data] of Object.entries(originals)){
 const targetPath=path.join(backup,name);fs.mkdirSync(path.dirname(targetPath),{recursive:true});fs.writeFileSync(targetPath,data);
}
function write(relative,data){const p=path.join(target,relative);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,data);}
write('dual/app.mjs',app);write('dual/index.html',html);
if(r75File!==null)write('src/museum.js',r75File);
if(verifier!==null)write('tools/verify-mathverse-final.mjs',verifier);
fs.cpSync(path.join(source,'dual/cartoon-3d'),path.join(target,'dual/cartoon-3d'),{force:true,recursive:true});
if(r75File!==null&&r75File.includes('enhanceOriginalAvatar('))fs.cpSync(path.join(source,'src/cartoon-3d'),path.join(target,'src/cartoon-3d'),{force:true,recursive:true});
for(const name of ['tools/verify-cartoon-3d.mjs','tests/cartoon-3d-studio.test.mjs']){
 const sourceFile=path.join(source,name),out=path.join(target,name);fs.mkdirSync(path.dirname(out),{recursive:true});fs.copyFileSync(sourceFile,out);
}
const pkg=JSON.parse(originals['package.json']);pkg.scripts=pkg.scripts||{};
pkg.scripts['check:cartoon']='node tools/verify-cartoon-3d.mjs && node --test tests/cartoon-3d-studio.test.mjs';
pkg.mathverseGraphicsAddon='CARTOON-3D-2026-11-04';write('package.json',JSON.stringify(pkg,null,2)+'\n');
const files=['dual/app.mjs','dual/index.html','package.json','tools/verify-cartoon-3d.mjs','tests/cartoon-3d-studio.test.mjs'];
if(verifier!==null)files.push('tools/verify-mathverse-final.mjs');
if(r75File!==null)files.push('src/museum.js');
for(const f of fs.readdirSync(path.join(target,'dual/cartoon-3d'),{recursive:true})){
 const relative='dual/cartoon-3d/'+f;
 if(fs.statSync(path.join(target,relative)).isFile())files.push(relative);
}
if(fs.existsSync(path.join(target,'src/cartoon-3d'))){for(const f of fs.readdirSync(path.join(target,'src/cartoon-3d'),{recursive:true})){const relative='src/cartoon-3d/'+f;if(fs.statSync(path.join(target,relative)).isFile())files.push(relative);}}
const manifest={release:'MATHVERSE Cartoon 3D Overlay',date:'2026-11-04',source:'Current MATHVERSE, preserve all previous bank/maze fixes',files:{}};
for(const f of files){const data=fs.readFileSync(path.join(target,f));manifest.files[f]={bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')};}
write('MANIFEST_CARTOON_3D_2026-11-04.json',JSON.stringify(manifest,null,2)+'\n');
console.log('[OK] 22 mo hinh GLB 3D va giao dien chon da duoc cap nhat vao:',target);
console.log('[OK] Da sao luu cac tep truoc khi sua o:',backup);
console.log('[GHI CHU] Cac tep ngan hang, maze va 11 tro choi khong bi thay the. Chay npm run check:cartoon de kiem tra.');
