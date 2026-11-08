/**
 * MATHVERSE R105 – lawful, testable Sketchfab -> native GLB pedestal pipeline.
 * No secrets stored in source/release. No unauthorized asset download or iframe scraping.
 * Requires a user-authorized Sketchfab OAuth access token in the *process environment* for --fetch.
 * ZIP->glTF conversion uses optional @gltf-transform/cli, installed by Antigravity only as needed.
 */
import {readFile, writeFile, mkdir, stat, rename, rm, copyFile, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {inflateRawSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {GALLERY_ITEMS} from '../dual/discovery-r102/catalog.mjs';

export const PROJECT_ROOT=fileURLToPath(new URL('../',import.meta.url));
export const OUTPUT_DIRECTORY=path.join(PROJECT_ROOT,'dual/discovery-r103/assets');
export const MANIFEST=path.join(OUTPUT_DIRECTORY,'approved-local-models.json');
export const WORK_DIRECTORY=path.join(PROJECT_ROOT,'R105_AGENT/_download_work');
export const MAX_ARCHIVE_BYTES=230*1024*1024;
export const MAX_UNCOMPRESSED_BYTES=550*1024*1024;
const permittedModelIds=new Map(GALLERY_ITEMS.map(x=>[x.id,x]));

export function isValidSketchfabUID(uid){return /^[a-f0-9]{32}$/i.test(String(uid||''));}
export function sketchfabCandidate(item){
  if(!item||!permittedModelIds.has(item.id))throw Error('Mã bục không thuộc khu trưng bày có thể kiểm chứng');
  if(!isValidSketchfabUID(item.uid))throw Error(`Sketchfab UID không hợp lệ: ${item.id}`);
  return {id:item.id,name:item.name,group:item.group,uid:item.uid,
    sketchfabURL:`https://sketchfab.com/models/${item.uid}`,
    originalAuthor:item.author||'Chưa xác minh',
    licenseStatus:'CHUA_XAC_MINH',
    downloadStatus:'CHUA_XAC_MINH',
    galleryStatus:'CANDIDATE_SOURCE_ONLY'};
}
export function allowedLicense(license){
  const raw=typeof license==='string'?license:[license?.slug,license?.label,license?.name,license?.uri].filter(Boolean).join(' ');
  const text=String(raw||'').toLowerCase();
  // Restrict the *automatic* importer to reusable licenses. Other licenses need manual legal review.
  if(/(nc|non.commercial|noncommercial|no.derivatives|no-derivatives|\bnd\b|editorial|standard|all.rights.reserved)/i.test(text))return false;
  return /\bcc0\b|public.domain|creative.commons.zero|\bcc.by\b|cc.by.sa|attribution.sharealike|attribution\s*4\.0|creative.commons.attribution/i.test(text);
}
export function safeZipPath(filename){
  const name=String(filename||'').replaceAll('\\','/');
  if(!name||name.startsWith('/')||/^([a-z]:|\\\\)/i.test(name)||name.includes('\0'))throw Error('ZIP chứa đường dẫn không an toàn');
  const parts=name.split('/');
  if(parts.some(p=>p==='..'||p==='.'||p.includes(':')))throw Error('ZIP có đường dẫn vượt thư mục');
  const final=path.posix.normalize(name);
  if(final==='.'||final.startsWith('../'))throw Error('ZIP có đường dẫn không hợp lệ');
  return final;
}

const crcTable=(()=>{
 const tbl=new Uint32Array(256);
 for(let i=0;i<256;i++){
  let c=i;for(let j=0;j<8;j++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);
  tbl[i]=c>>>0;
 }return tbl;
})();
export function crc32(data){
 let c=0xffffffff;
 for(const b of data)c=crcTable[(c^b)&0xff]^(c>>>8);
 return (c^0xffffffff)>>>0;
}

/** Parse central-directory ZIP entries without external npm dependencies.
 * ZIP64 and encrypted archives are deliberately not accepted; use a reviewed converter for those.
 */
export function unzipGltfArchive(buffer){
 if(!Buffer.isBuffer(buffer))buffer=Buffer.from(buffer);
 if(buffer.length>MAX_ARCHIVE_BYTES)throw Error('Kho ZIP vượt mức 230 MB');
 let eocd=-1;
 for(let i=buffer.length-22;i>=Math.max(0,buffer.length-65557);i--){
  if(buffer.readUInt32LE(i)===0x06054b50){eocd=i;break;}
 }
 if(eocd===-1)throw Error('Tệp không có ZIP central-directory hợp lệ');
 const count=buffer.readUInt16LE(eocd+10),position=buffer.readUInt32LE(eocd+16);
 if(count>2500||count===0||position>=buffer.length)throw Error('Kho ZIP không hợp lệ hoặc quá nhiều tệp');
 let cursor=position,total=0;
 const output=new Map();
 for(let n=0;n<count;n++){
  if(cursor+46>buffer.length||buffer.readUInt32LE(cursor)!==0x02014b50)throw Error('Cấu trúc ZIP trung tâm bị lỗi');
  const flags=buffer.readUInt16LE(cursor+8),method=buffer.readUInt16LE(cursor+10),wantedCRC=buffer.readUInt32LE(cursor+16),compressed=buffer.readUInt32LE(cursor+20),uncompressed=buffer.readUInt32LE(cursor+24);
  const nameLen=buffer.readUInt16LE(cursor+28),extraLen=buffer.readUInt16LE(cursor+30),commentLen=buffer.readUInt16LE(cursor+32),attrs=buffer.readUInt32LE(cursor+38),offset=buffer.readUInt32LE(cursor+42);
  if(compressed===0xffffffff||uncompressed===0xffffffff||offset===0xffffffff)throw Error('ZIP64 không được hỗ trợ trong chế độ an toàn');
  if(flags&1)throw Error('ZIP được mã hóa, không thể đọc');
  if(nameLen===0||cursor+46+nameLen+extraLen+commentLen>buffer.length)throw Error('ZIP tên tệp không hợp lệ');
  const filename=safeZipPath(buffer.toString('utf8',cursor+46,cursor+46+nameLen));
  cursor+=46+nameLen+extraLen+commentLen;
  if(filename.endsWith('/'))continue;
  const unixMode=attrs>>>16;
  if((unixMode&0xf000)===0xa000)throw Error('Từ chối liên kết symbolic trong ZIP');
  if(!/\.(gltf|bin|png|jpg|jpeg|webp|ktx2|basis)$/i.test(filename))continue;
  if(method!==0&&method!==8)throw Error('Thuật toán nén ZIP không hỗ trợ');
  total+=uncompressed;if(total>MAX_UNCOMPRESSED_BYTES)throw Error('ZIP giải nén quá lớn');
  if(offset+30>buffer.length||buffer.readUInt32LE(offset)!==0x04034b50)throw Error('ZIP thiếu phần dữ liệu');
  const actualStart=offset+30+buffer.readUInt16LE(offset+26)+buffer.readUInt16LE(offset+28);
  if(actualStart+compressed>buffer.length)throw Error('ZIP dữ liệu vượt chiều dài');
  const raw=buffer.subarray(actualStart,actualStart+compressed);
  const content=method===0?Buffer.from(raw):inflateRawSync(raw,{maxOutputLength:uncompressed+1});
  if(content.length!==uncompressed||crc32(content)!==wantedCRC)throw Error(`ZIP lỗi CRC/kích thước ở: ${filename}`);
  if(output.has(filename))throw Error('ZIP có tên tệp trùng lặp');
  output.set(filename,content);
 }
 if(![...output.keys()].some(p=>p.toLowerCase().endsWith('.gltf')))throw Error('Sketchfab trả về ZIP không có glTF');
 return output;
}

export function inspectGLB(buffer){
 if(!Buffer.isBuffer(buffer))buffer=Buffer.from(buffer);
 if(buffer.length<40||buffer.toString('ascii',0,4)!=='glTF'||buffer.readUInt32LE(4)!==2||buffer.readUInt32LE(8)!==buffer.length)
  throw Error('GLB không phải glTF 2.0 hợp lệ');
 const chunkLength=buffer.readUInt32LE(12),chunkType=buffer.toString('ascii',16,20);
 if(chunkType!=='JSON'||20+chunkLength>buffer.length)throw Error('GLB thiếu JSON chunk');
 let graph;try{graph=JSON.parse(buffer.subarray(20,20+chunkLength).toString('utf8').replace(/\0+$/,''));}catch{throw Error('GLB chứa JSON không hợp lệ');}
 if(graph.asset?.version!=='2.0')throw Error('GLB thiếu glTF asset.version 2.0');
 const meshes=graph.meshes||[],accessors=graph.accessors||[];
 let triangles=0;
 for(const mesh of meshes)for(const primitive of mesh.primitives||[]){
  if(primitive.mode!==undefined&&primitive.mode!==4)continue; // triangles only
  const i=primitive.indices!==undefined?primitive.indices:primitive.attributes?.POSITION;
  triangles+=Math.floor((accessors[i]?.count||0)/3);
 }
 if(!meshes.length||!triangles)throw Error('GLB không có lưới tam giác');
 return {meshes:meshes.length,triangles,materials:(graph.materials||[]).length,images:(graph.images||[]).length,extensions:graph.extensionsUsed||[]};
}

async function fetchJSON(url,token){
 const headers={accept:'application/json'};
 if(token)headers.authorization=`Bearer ${token}`;
 const response=await fetch(url,{headers,signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error(`Sketchfab API trả HTTP ${response.status}; kiểm tra tài khoản, quyền tải và kết nối`);
 return await response.json();
}
async function authorizedMetadata(item,token){
 const meta=await fetchJSON(`https://api.sketchfab.com/v3/models/${item.uid}`,token);
 if(meta.uid!==item.uid)throw Error('UID nguồn không trùng công trình cần tải');
 return meta;
}
function approvedLicenseDetails(metadata){
 const lic=metadata.license;
 if(!allowedLicense(lic))throw Error('Chưa xác nhận được giấy phép cho phép tải/chuyển đổi. Agent phải kiểm tra quyền từ chủ mô hình.');
 return typeof lic==='string'?lic:(lic?.label||lic?.name||lic?.slug||'CC BY – cần xác nhận phiên bản');
}
function identifyAuthor(metadata){return metadata.user?.displayName||metadata.user?.username||metadata.user?.uid||'';}
function assetSource(metadata,item){
 const web=metadata.viewerUrl||metadata.url||item.sketchfabURL;
 try{const u=new URL(web);return u.protocol==='https:'&&u.hostname.endsWith('sketchfab.com')?u.href:item.sketchfabURL;}catch{return item.sketchfabURL;}
}
function safeArchiveURL(raw){
 const u=new URL(raw);
 if(u.protocol!=='https:')throw Error('Kho tải phải dùng HTTPS');
 const host=u.hostname.toLowerCase();
 if(!(host==='sketchfab.com'||host.endsWith('.sketchfab.com')||host==='amazonaws.com'||host.endsWith('.amazonaws.com')||host.endsWith('.cloudfront.net')))
  throw Error('URL tải không thuộc CDN được Sketchfab sử dụng – cần xác minh thủ công');
 return u.href;
}
async function downloadArchive(url,expectedLength){
 const response=await fetch(safeArchiveURL(url),{redirect:'follow',signal:AbortSignal.timeout(180000)});
 if(!response.ok)throw Error(`Không tải được gói glTF, HTTP ${response.status}`);
 if(Number(response.headers.get('content-length')||0)>MAX_ARCHIVE_BYTES||expectedLength>MAX_ARCHIVE_BYTES)throw Error('Gói glTF vượt 230 MB');
 let size=0;const chunks=[];
 for await(const part of response.body){size+=part.length;if(size>MAX_ARCHIVE_BYTES)throw Error('Quá giới hạn 230 MB');chunks.push(part);}
 return Buffer.concat(chunks,size);
}
async function persistExtractedArchive(id,content){
 const dir=path.join(WORK_DIRECTORY,id,'unpacked');
 await rm(dir,{recursive:true,force:true});await mkdir(dir,{recursive:true});
 for(const [name,buf] of content){
  const dest=path.resolve(dir,...name.split('/'));
  if(!dest.startsWith(dir+path.sep))throw Error('Tên tệp ZIP vượt thư mục bảo vệ');
  await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,buf);
 }
 const files=[...content.keys()].filter(n=>n.toLowerCase().endsWith('.gltf'));
 files.sort((a,b)=>(/scene\.gltf$/i.test(a)?-100:0)-(/scene\.gltf$/i.test(b)?-100:0)||a.length-b.length);
 return {gltf:path.join(dir,...files[0].split('/')),dir};
}
function convertGltfToGlb(gltfPath,glbPath){
 // The conversion dependency is isolated from MATHVERSE runtime and only used by Antigravity.
 // This command does NOT require installing Python or modifying the viewer's bundled Three.js.
 const npmCmd=process.platform==='win32'?'npx.cmd':'npx';
 const result=spawnSync(npmCmd,['--yes','@gltf-transform/cli','copy',gltfPath,glbPath],{
   cwd:PROJECT_ROOT,encoding:'utf8',timeout:300000,maxBuffer:6*1024*1024,
   env:{...process.env,npm_config_update_notifier:'false'}
 });
 if(result.error||result.status!==0)throw Error(`Không chuyển đổi được glTF sang GLB (${result.status??result.error?.code}). Kiểm tra npm/Internet; tệp nguồn vẫn lưu ở R105_AGENT/_download_work. ${String(result.stderr||'').slice(-900)}`);
}
async function registerModel(item,metadata,license,glbPath,stats){
 const src=path.resolve(glbPath),target=path.join(OUTPUT_DIRECTORY,`${item.id}.glb`);
 await mkdir(OUTPUT_DIRECTORY,{recursive:true});
 const buffer=await readFile(src);if(buffer.length>180*1024*1024)throw Error('GLB >180 MB cần tối ưu để tránh nghẽn tải');
 const details=inspectGLB(buffer);
 if(details.triangles<2000)throw Error('GLB có ít hơn 2000 tam giác; cần kiểm tra mô hình không đúng công trình');
 const digest=createHash('sha256').update(buffer).digest('hex');
 let manifest;
 try{manifest=JSON.parse(await readFile(MANIFEST,'utf8'));}catch{manifest={version:'R105',models:[]};}
 if(!Array.isArray(manifest.models))throw Error('Manifest GLB có định dạng không hợp lệ');
 const backup=target+'.r105-backup';
 try{await stat(target);await copyFile(target,backup);}catch{}
 const temp=target+'.r105-new';await writeFile(temp,buffer);await rename(temp,target);
 const model={id:item.id,file:`${item.id}.glb`,author:identifyAuthor(metadata),license,sourceURL:assetSource(metadata,item),modelUid:item.uid,
   provider:'Sketchfab',sha256:digest,verifiedWebGL:false,verifiedLicenseFromAPI:true,
   geometryType:metadata.isReconstruction?'reconstruction':'third-party-model-not-certified-survey',
   statistics:details,importedAt:new Date().toISOString(),teacherProvided:false};
 manifest.version='R105';manifest.description='Verified-license Sketchfab assets. A model is accepted onto a stand only after native WebGL GLTFLoader successfully loads it.';
 manifest.models=manifest.models.filter(x=>x.id!==item.id);manifest.models.push(model);
 const mtmp=MANIFEST+'.r105-new';await writeFile(mtmp,JSON.stringify(manifest,null,2)+'\n');await rename(mtmp,MANIFEST);
 return model;
}
async function fetchAndIntegrate(id,{confirmed=false}={}){
 const item=permittedModelIds.get(id);if(!item)throw Error('Không tìm thấy bục cần tích hợp');
 if(!confirmed)throw Error('Cần --confirm-reviewed sau khi Agent xác nhận đúng địa danh, tác giả, chất lượng và giấy phép');
 const token=process.env.SKETCHFAB_OAUTH_ACCESS_TOKEN;
 if(!token)throw Error('Chưa có quyền Sketchfab. Antigravity cần mở OAuth chính thức và cấu hình token trong môi trường tiến trình; KHÔNG yêu cầu cô gửi token vào chat.');
 const candidate=sketchfabCandidate(item);
 const metadata=await authorizedMetadata(candidate,token);
 const license=approvedLicenseDetails(metadata);
 const author=identifyAuthor(metadata);if(!author)throw Error('Metadata thiếu tác giả');
 if(metadata.isDownloadable===false||metadata.downloadable===false)throw Error('Tác giả đã tắt quyền tải');
 console.log('Đang tải mô hình hợp lệ:',item.name,'| tác giả:',author,'| giấy phép:',license);
 const download=await fetchJSON(`https://api.sketchfab.com/v3/models/${item.uid}/download`,token);
 if(!download.gltf?.url)throw Error('Tác giả không cung cấp gói glTF hợp lệ (chỉ hiển thị Viewer)');
 const zip=await downloadArchive(download.gltf.url,download.gltf.size);
 const files=unzipGltfArchive(zip);
 const {gltf}=await persistExtractedArchive(item.id,files);
 const dir=path.join(WORK_DIRECTORY,item.id);
 const glb=path.join(dir,`${item.id}.glb`);
 console.log('Đang chuyển glTF hợp lệ sang GLB...',item.id);
 convertGltfToGlb(gltf,glb);
 const row=await registerModel(item,metadata,license,glb);
 console.log(`THÀNH CÔNG: ${item.name} -> ${row.file} (${row.statistics.triangles.toLocaleString('vi-VN')} tam giác)`);
 console.log('Nguồn:',row.sourceURL,'| SHA256:',row.sha256);
 console.log('Lưu ý: thử WebGL trên máy cô và kiểm chứng mô hình thực tế trước khi phát hành lại ZIP công khai.');
 return row;
}

export async function auditInstalledModels({print=true}={}){
 let manifest;try{manifest=JSON.parse(await readFile(MANIFEST,'utf8'));}catch{manifest={models:[]};}
 const rows=[];
 for(const x of GALLERY_ITEMS){
  const record=manifest.models?.find(y=>y.id===x.id);
  const file=record?.file&&/^[a-z0-9_-]+\.glb$/i.test(record.file)?path.join(OUTPUT_DIRECTORY,record.file):null;
  let status='SKETCHFAB_CHUA_CO_GLB';let details=null;
  if(file){
   try{
    const buf=await readFile(file),hash=createHash('sha256').update(buf).digest('hex');
    details=inspectGLB(buf);
    status=record.sha256&&hash!==record.sha256?'SAI_SHA256':'GLB_DA_CO_CHUA_KIEM_THU_WEBGL';
    if(record.verifiedWebGL===true&&status!=='SAI_SHA256')status='GLB_DA_DUYET_WEBGL';
   }catch{status='LOI_TEP_GLB';}
  }
  rows.push({id:x.id,name:x.name,uid:x.uid,status,source:`https://sketchfab.com/models/${x.uid}`,
   author:record?.author||x.author||null,license:record?.license||null,geometry:details});
 }
 if(print){
  console.log('\nMATHVERSE R105 – 9 BỤC KIẾN TRÚC (không tính Parthenon GLB đã có)\n');
  for(const x of rows)console.log(`${x.status.padEnd(33)} ${x.id.padEnd(23)} ${x.name}`);
  console.log('\nGLB R98 Parthenon: bảo toàn nguyên trạng; không thuộc pipeline tải Sketchfab.');
 }
 return rows;
}

export async function main(argv=process.argv.slice(2)){
 const action=argv[0]||'--audit';
 if(action==='--audit'){
  const rows=await auditInstalledModels();
  const report={createdAt:new Date().toISOString(),rows,source:'R104 project itself – no third-party model file is bundled unless listed in approved-local-models.json'};
  await writeFile(path.join(PROJECT_ROOT,'R105_AGENT/BAO_CAO_TRANG_THAI.json'),JSON.stringify(report,null,2)+'\n');
  return rows;
 }
 if(action==='--verify'){
  const rows=await auditInstalledModels();
  const failed=rows.filter(x=>x.status==='SAI_SHA256'||x.status==='LOI_TEP_GLB');
  if(failed.length)throw Error(`${failed.length} GLB có lỗi hoặc sai SHA256`);
  return rows;
 }
 if(action==='--inspect'){
  const id=argv[1],item=permittedModelIds.get(id);
  if(!item)throw Error('Chọn đúng ID từ npm run audit:r105');
  const metadata=await authorizedMetadata(sketchfabCandidate(item),process.env.SKETCHFAB_OAUTH_ACCESS_TOKEN||null);
  const details={id,uid:item.uid,realModelName:metadata.name,author:identifyAuthor(metadata),
   license:metadata.license,downloadable:metadata.isDownloadable??metadata.downloadable??'NOT_DECLARED',
   url:assetSource(metadata,sketchfabCandidate(item))};
  console.log(JSON.stringify(details,null,2));return details;
 }
 if(action==='--fetch')return await fetchAndIntegrate(argv[1],{confirmed:argv.includes('--confirm-reviewed')});
 if(action==='--fetch-all'){
  if(!argv.includes('--confirm-reviewed'))throw Error('Cần --confirm-reviewed sau khi Agent xác minh từng mô hình');
  const results=[];
  for(const item of GALLERY_ITEMS){
   try{results.push({id:item.id,ok:true,row:await fetchAndIntegrate(item.id,{confirmed:true})});}
   catch(e){console.error('CHƯA TÍCH HỢP:',item.name,':',e.message);results.push({id:item.id,ok:false,reason:e.message});}
  }
  await writeFile(path.join(PROJECT_ROOT,'R105_AGENT/KET_QUA_NAP_GLB.json'),JSON.stringify(results,null,2)+'\n');
  if(results.some(x=>!x.ok))process.exitCode=2;
  return results;
 }
 throw Error(`Lệnh không hợp lệ: ${action}. Dùng --audit, --verify, --inspect <id>, --fetch <id> --confirm-reviewed hoặc --fetch-all --confirm-reviewed.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 main().catch(e=>{console.error('R105:',e.message);process.exitCode=1;});
}
