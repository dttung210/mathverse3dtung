/** R98: local-only fidelity-first intake for verified heritage GLB + photographic sources.
 * Explicit human review is necessary. Machine checks NEVER certify architectural accuracy.
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {UNESCO_HERITAGE} from '../dual/discovery-unesco-data.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const DIR=path.join(ROOT,'dual','discovery-r98');
const ASSETS=path.join(DIR,'assets');
const STORE=path.join(DIR,'curation.json');
const KNOWN=new Map(UNESCO_HERITAGE.map(x=>[x.id,x]));
const MIME_EXT={glb:'glb',jpg:'jpg',png:'png',webp:'webp'};
const LIMITS={glb:85*1024*1024,photo:13*1024*1024};
const FULL_LICENSE=new Set(['CC BY 4.0','CC BY 3.0','CC BY-SA 4.0','CC BY-SA 3.0','CC0 1.0','Public Domain']);
async function readDb(){try{const db=JSON.parse(await fsp.readFile(STORE,'utf8'));return db?.version===98&&Array.isArray(db.assets)?db:{version:98,assets:[]};}catch{return{version:98,assets:[]};}}
async function saveDb(db){await fsp.mkdir(DIR,{recursive:true});const tmp=STORE+'.tmp';await fsp.writeFile(tmp,JSON.stringify(db,null,2)+'\n');await fsp.rename(tmp,STORE);}
function reply(res,status,obj){const body=JSON.stringify(obj);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);}
async function receive(req,limit=12_000){const blocks=[];let size=0;for await(const part of req){size+=part.length;if(size>limit)throw Error('Dữ liệu JSON quá lớn');blocks.push(part);}return JSON.parse(Buffer.concat(blocks).toString('utf8'));}
function allowedSite(id){return typeof id==='string'&&KNOWN.has(id);}
function validLink(url){try{const u=new URL(String(url||''));return (u.protocol==='https:'||u.protocol==='http:')&&u.hostname.length>3;}catch{return false;}}
function glbStats(buf){
 if(buf.length<32||buf.toString('ascii',0,4)!=='glTF'||buf.readUInt32LE(4)!==2||buf.readUInt32LE(8)!==buf.length)throw Error('GLB không hợp lệ: thiếu header glTF 2.0');
 const jsonSize=buf.readUInt32LE(12),type=buf.toString('ascii',16,20);
 if(type!=='JSON'||jsonSize<40||jsonSize>buf.length-20)throw Error('Không đọc được JSON trong GLB');
 let doc;try{doc=JSON.parse(buf.toString('utf8',20,20+jsonSize));}catch{throw Error('GLB có phần JSON hỏng');}
 if(doc.asset?.version!=='2.0'||!Array.isArray(doc.meshes)||!doc.meshes.length)throw Error('Tệp GLB không chứa mesh glTF 2.0');
 let triangles=0;for(const mesh of doc.meshes){for(const p of mesh.primitives||[]){const mode=p.mode??4;const index=p.indices!=null?doc.accessors?.[p.indices]:doc.accessors?.[p.attributes?.POSITION];if(mode===4&&index?.count)triangles+=Math.floor(index.count/3);}}
 const images=doc.images?.length||0,materials=doc.materials?.length||0;
 if(triangles<10000)throw Error(`Mesh chỉ khoảng ${triangles} tam giác: chưa đạt ngưỡng tối thiểu 10.000 cho khu quét 3D. Ngưỡng này không xác nhận độ chính xác.`);
 if(!images||!materials)throw Error('GLB chưa có ảnh kết cấu và vật liệu. Cần mô hình có texture đối chiếu ảnh hiện trạng.');
 if(doc.images.some(im=>im.uri&&!im.uri.startsWith('data:')))throw Error('GLB còn tham chiếu ảnh texture nằm ngoài: phải nhúng texture vào GLB để tránh mất hình.');
 if(doc.extensionsRequired?.some(x=>['KHR_draco_mesh_compression','EXT_meshopt_compression'].includes(x)))throw Error('GLB cần decoder Draco/Meshopt: hãy xuất bản GLB không nén hoặc cài bộ giải mã trong Antigravity.');
 return {triangles,images,materials,meshes:doc.meshes.length,extensionsRequired:doc.extensionsRequired||[]};
}
function photoExt(bytes){
 if(bytes.length>4&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return'jpg';
 if(bytes.length>8&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return'png';
 if(bytes.length>12&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')return'webp';
 throw Error('Ảnh phải là JPEG, PNG hoặc WebP hợp lệ.');
}
function cleanRecord(rec){if(!rec)return null;const {temporaryFile,...safe}=rec;return safe;}
export async function handleR98Curation(req,res,route,url,origin){
 const id=url.searchParams.get('id');
 if(req.method!=='GET'){
   const remoteOrigin=req.headers.origin;
   if(remoteOrigin&&remoteOrigin!==origin){reply(res,403,{ok:false,error:'Chỉ cho phép thao tác cùng máy chủ MATHVERSE'});return true;}
 }
 try{
 if(route==='/api/discovery/r98/catalog'&&req.method==='GET'){
   const db=await readDb();const approved=db.assets.filter(x=>x.status==='approved').map(cleanRecord);
   reply(res,200,{ok:true,version:98,approved,records:db.assets.map(cleanRecord),approvedCount:approved.length,policy:'Only manually reviewed on-device assets appear. Review is not scientific accuracy certification.'});return true;
 }
 if(route==='/api/discovery/r98/upload'&&req.method==='POST'){
   if(!allowedSite(id)){reply(res,400,{ok:false,error:'Mã di sản không hợp lệ'});return true;}
   const type=url.searchParams.get('type');if(!['glb','photo'].includes(type)){reply(res,400,{ok:false,error:'Loại tệp không hợp lệ'});return true;}
   let size=0;const chunks=[];
   for await(const part of req){size+=part.length;if(size>LIMITS[type])throw Error('Tệp vượt ngưỡng: GLB 85 MB hoặc ảnh 13 MB. Hãy dùng glTF-Transform để giảm kích thước trước.');chunks.push(part);}
   const bytes=Buffer.concat(chunks);if(bytes.length<1024)throw Error('Tệp quá nhỏ hoặc trống');
   const ext=type==='glb'?'glb':photoExt(bytes);
   const stat=type==='glb'?glbStats(bytes):null;
   await fsp.mkdir(ASSETS,{recursive:true});
   const filename=`${id}_${type}.${ext}`;const target=path.join(ASSETS,filename),tmp=target+'.tmp';
   await fsp.writeFile(tmp,bytes);await fsp.rename(tmp,target);
   const hash=createHash('sha256').update(bytes).digest('hex');
   const db=await readDb();let rec=db.assets.find(x=>x.id===id);
   if(!rec){rec={id,name:KNOWN.get(id).name,whcId:KNOWN.get(id).whcId,status:'pending_review'};db.assets.push(rec);}
   rec.status='pending_review';rec.approvedAt=null;rec[type]={url:`/dual/discovery-r98/assets/${filename}`,hash,size,ext,...(stat||{})};
   await saveDb(db);
   reply(res,200,{ok:true,id,type,size,hash,stats:stat,status:rec.status});return true;
 }
 if(route==='/api/discovery/r98/approve'&&req.method==='POST'){
   const body=await receive(req);if(!allowedSite(body.id))throw Error('Mã di sản không hợp lệ');
   const db=await readDb();const rec=db.assets.find(x=>x.id===body.id);
   if(!rec?.glb||!rec?.photo)throw Error('Phải tải cả GLB thực tế và ảnh thật trước khi duyệt');
   if(!FULL_LICENSE.has(body.modelLicense)||!FULL_LICENSE.has(body.photoLicense))throw Error('Giấy phép chưa thuộc nhóm có thể phân phối kèm ghi công; giữ ở trạng thái chờ');
   if(!validLink(body.modelSource)||!validLink(body.photoSource)||!validLink(body.comparisonSource))throw Error('Cần 3 URL nguồn: GLB, ảnh, đối chiếu độc lập');
   if(!String(body.modelAuthor||'').trim()||!String(body.photoAuthor||'').trim()||!String(body.reviewer||'').trim())throw Error('Thiếu ghi công tác giả hoặc người thẩm định');
   if(!['photogrammetry','lidar','survey_mesh'].includes(body.modelMethod))throw Error('Chỉ duyệt mô hình từ quang trắc / LiDAR / mesh đo đạc, không dùng mô hình suy diễn từ một ảnh');
   if(body.comparePhoto!==true||body.compareDimensions!==true||body.compareLicense!==true||body.compareIdentity!==true)throw Error('Chưa xác nhận đủ bốn bước thẩm định thủ công');
   // Prevent stale files from being approved if changed outside this application.
   for(const [key,data] of [['glb',rec.glb],['photo',rec.photo]]){
     const file=path.join(ASSETS,path.basename(new URL(data.url,'http://local').pathname));const content=await fsp.readFile(file);
     if(createHash('sha256').update(content).digest('hex')!==data.hash)throw Error(`${key} bị đổi sau tải, phải nhập lại.`);
   }
   rec.status='approved';rec.approvedAt=new Date().toISOString();
   rec.review={modelAuthor:String(body.modelAuthor).slice(0,140),photoAuthor:String(body.photoAuthor).slice(0,140),reviewer:String(body.reviewer).slice(0,100),modelLicense:body.modelLicense,photoLicense:body.photoLicense,modelSource:String(body.modelSource).slice(0,500),photoSource:String(body.photoSource).slice(0,500),comparisonSource:String(body.comparisonSource).slice(0,500),modelMethod:body.modelMethod,notes:String(body.notes||'').slice(0,900),checks:{compareIdentity:true,comparePhoto:true,compareDimensions:true,compareLicense:true},accuracyLevel:'reviewed_visual_not_metrically_certified'};
   await saveDb(db);reply(res,200,{ok:true,id:body.id,status:rec.status,notice:'Duyệt nội bộ thủ công; không phải xác nhận sai số đo đạc.'});return true;
 }
 if(route==='/api/discovery/r98/revoke'&&req.method==='POST'){
   const body=await receive(req);const db=await readDb();const rec=db.assets.find(x=>x.id===body.id);
   if(!rec)throw Error('Không tìm thấy bản ghi');rec.status='pending_review';rec.approvedAt=null;
   await saveDb(db);reply(res,200,{ok:true,id:rec.id,status:rec.status});return true;
 }
 }catch(e){reply(res,400,{ok:false,error:e.message});return true;}
 return false;
}
export {glbStats,photoExt,FULL_LICENSE};
