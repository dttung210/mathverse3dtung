/** Offline licensed GLB import utility for teachers using MATHVERSE on Windows.
 * It NEVER downloads from Sketchfab, bypasses authentication, or asserts that a file is licensed.
 * The user declares the model rights, records attribution and file hash, and installs to a
 * deterministic location read by R104's existing manifest loader.
 */
import {readFile,writeFile,copyFile,mkdir,rename,stat,open} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {createInterface} from 'node:readline/promises';
import {stdin as input,stdout as output} from 'node:process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {GALLERY_ITEMS} from '../dual/discovery-r102/catalog.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const assetFolder=path.join(root,'dual/discovery-r103/assets');
const manifestPath=path.join(assetFolder,'approved-local-models.json');
const prompt=createInterface({input,output});

async function ask(question){return (await prompt.question(question)).trim();}
const allowed=new Set(GALLERY_ITEMS.map(x=>x.id));

async function verifyGLB(filename){
 const file=await open(filename,'r');
 try{
  const header=Buffer.alloc(12);const rd=await file.read(header,0,12,0);
  if(rd.bytesRead!==12||header.toString('ascii',0,4)!=='glTF'||header.readUInt32LE(4)!==2)throw Error('Đây không phải tệp GLB glTF 2.0 hợp lệ');
  const actual=(await file.stat()).size;
  if(actual>180*1024*1024)throw Error('Tệp lớn hơn 180 MB: cần tối ưu GLB');
  if(header.readUInt32LE(8)!==actual)throw Error('Kích thước header GLB không trùng với tệp');
 }finally{await file.close();}
}

async function sha256(filename){
 const h=createHash('sha256');for await(const part of createReadStream(filename))h.update(part);return h.digest('hex');
}

async function main(){
 console.log('\nMATHVERSE R104 - NAP MO HINH GLB CO QUYEN SU DUNG LEN BUC');
 console.log('Thao tác này không tải Sketchfab tự động. Cô phải có tệp GLB từ nguồn cho phép.');
 const fromInput=process.argv[2]?.replace(/^"|"$/g,'');
 const source=fromInput || await ask('Đường dẫn đầy đủ tới file GLB (có thể kéo thả rồi Enter): ');
 if(!source)throw Error('Chưa có tệp GLB');
 const sourceFile=path.resolve(source);
 await verifyGLB(sourceFile);
 const bytes=(await stat(sourceFile)).size;
 console.log(`Tệp GLB hợp lệ về cấu trúc đầu tệp, dung lượng ${(bytes/1024/1024).toFixed(1)} MB.`);
 console.log('Lưu ý: bộ kiểm thử Three.js sẽ xác minh lưới 3D thực khi mở ứng dụng.');
 console.log('\nChọn bục:');
 GALLERY_ITEMS.forEach((w,i)=>console.log(`${String(i+1).padStart(2,'0')}. ${w.name} (${w.id})`));
 const selection=await ask('Số thứ tự bục: ');
 const target=GALLERY_ITEMS[Number(selection)-1];
 if(!target||!allowed.has(target.id))throw Error('Số thứ tự bục không hợp lệ');
 const author=await ask('Tên tác giả / đơn vị cung cấp mô hình: ');
 const license=await ask('Giấy phép / quyền sử dụng (ví dụ CC BY 4.0): ');
 const sourceURL=await ask('URL nguồn mô hình: ');
 if(!author||!license||!/^https:\/\//i.test(sourceURL))throw Error('Phải có tác giả, giấy phép và URL nguồn HTTPS');
 const confirm=(await ask('Xác nhận cô có quyền dùng tệp này trong dự án MATHVERSE? Gõ DONG_Y: ')).toUpperCase();
 if(confirm!=='DONG_Y')throw Error('Chưa xác nhận quyền sử dụng; không chép mô hình');
 await mkdir(assetFolder,{recursive:true});
 const filename=`${target.id}.glb`;
 const dest=path.join(assetFolder,filename);
 const digest=await sha256(sourceFile);
 const temp=dest+'.r104-install-tmp';
 await copyFile(sourceFile,temp);
 let manifest;
 try{manifest=JSON.parse(await readFile(manifestPath,'utf8'));}catch{manifest={version:'R104',models:[]};}
 if(!Array.isArray(manifest.models))manifest.models=[];
 const backup=dest+'.r104-backup';
 try{await stat(dest);await copyFile(dest,backup);}catch{}
 await rename(temp,dest);
 const record={id:target.id,file:filename,author,license,sourceURL,sha256:digest,teacherProvided:true,verifiedWebGL:false};
 manifest.models=manifest.models.filter(x=>x.id!==target.id);
 manifest.models.push(record);
 manifest.version='R104';
 manifest.description='Teacher supplied local GLBs; self-declared permission; verify licenses and provenance independently before distribution.';
 await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 console.log(`\nDA NAP: ${target.name}`);
 console.log(`GLB: ${dest}`);
 console.log(`SHA256: ${digest}`);
 console.log('Khởi động lại R104 để GLB được tự tải lên bục và thay mô hình minh họa.');
 console.log('KHÔNG nén hoặc phát hành lại tệp GLB nếu giấy phép không cho phép.');
}
try{await main();}catch(err){console.error('LOI: '+err.message);process.exitCode=1;}finally{prompt.close();}
