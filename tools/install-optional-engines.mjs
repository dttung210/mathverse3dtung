/** Explicit install (not an auto-update): pinned browser binaries for two opt-in engines.
 * Local files only; no new npm dependency; prevents browser CDN/CSP exceptions.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const folder=path.join(root,'vendor','optional');
const files=[
  {name:'jsxgraphcore.js',sub:'jsxgraph@1.14.1/distrib/jsxgraphcore.js',min:400000,max:6000000,contains:'JXG'},
  {name:'jsxgraph.css',sub:'jsxgraph@1.14.1/distrib/jsxgraph.css',min:1000,max:200000,contains:'.jxg'},
  {name:'LICENSE_JSXGRAPH_MIT.txt',sub:'jsxgraph@1.14.1/distrib/LICENSE.MIT',min:300,max:20000,contains:'MIT'},
  {name:'echarts.min.js',sub:'echarts@6.1.0/dist/echarts.min.js',min:400000,max:12000000,contains:'echarts'},
  {name:'LICENSE_ECHARTS_APACHE2.txt',sub:'echarts@6.1.0/LICENSE',min:500,max:250000,contains:'Apache'}
];
async function get(entry){
  const urls=[`https://cdn.jsdelivr.net/npm/${entry.sub}`,`https://unpkg.com/${entry.sub}`];
  let lastError;
  for(const url of urls){
    try{
      const response=await fetch(url,{signal:AbortSignal.timeout(25000),redirect:'follow',headers:{'user-agent':'MATHVERSE/15.1 optional engines installer'}});
      if(!response.ok)throw Error(`HTTP ${response.status}`);
      const n=Number(response.headers.get('content-length')||0);
      if(n>entry.max)throw Error('Tệp tải xuống vượt giới hạn kích thước');
      const buf=Buffer.from(await response.arrayBuffer());
      if(buf.length<entry.min||buf.length>entry.max||!buf.toString('utf8').includes(entry.contains))throw Error('Tệp không đúng định dạng mong đợi');
      return {buffer:buf,url};
    }catch(error){lastError=error;}
  }
  throw new Error(`Không thể tải ${entry.name}: ${lastError?.message}`);
}
await fs.mkdir(folder,{recursive:true});
const temporary=[];
const manifest={installedAt:new Date().toISOString(),engines:{jsxgraph:'1.14.1',echarts:'6.1.0'},files:{}};
try{
  for(const item of files){
    console.log(`Đang tải ${item.name}...`);
    const {buffer,url}=await get(item);
    const tmp=path.join(folder,item.name+'.partial');
    await fs.writeFile(tmp,buffer,{flag:'w'});
    temporary.push(tmp);
    manifest.files[item.name]={bytes:buffer.length,sha256:crypto.createHash('sha256').update(buffer).digest('hex'),source:url};
  }
  for(const item of files){
    const target=path.join(folder,item.name);
    await fs.copyFile(target+'.partial',target);
  }
  await fs.writeFile(path.join(folder,'MANIFEST_INSTALLED.json'),JSON.stringify(manifest,null,2)+'\n','utf8');
  console.log('\nĐÃ CÀI THÀNH CÔNG: JSXGraph 1.14.1 và Apache ECharts 6.1.0.');
  console.log('Khởi động lại MATHVERSE rồi chọn "Bộ dựng hình mở rộng" trong phòng thí nghiệm phù hợp.');
}catch(error){
  console.error(`\nKHÔNG CÀI ĐƯỢC: ${error.message}`);
  console.error('Bộ dựng hình Canvas mặc định và bảo tàng Three.js vẫn hoạt động bình thường.');
  process.exitCode=1;
}finally{
  for(const tmp of temporary)await fs.rm(tmp,{force:true}).catch(()=>{});
}
