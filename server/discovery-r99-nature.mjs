/** R99 read-only proxy. Fixed public source hosts; no arbitrary external URL parameters. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {NATURE_BY_ID,NATURE_WONDERS} from '../dual/discovery-r99/nature-data.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const CACHEDIR=path.join(ROOT,'.cache','discovery-r99');
const FILE_TYPES={terrain:{ext:'png',content:'image/png',template:(z,x,y)=>`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`},satellite:{ext:'jpg',content:'image/jpeg',template:(z,x,y)=>`https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/GoogleMapsCompatible/${z}/${y}/${x}.jpg`}};
const PHOTO_CACHE=new Map();const INFLIGHT=new Map();
const respond=(res,status,data,mime='application/json; charset=utf-8')=>{
 res.writeHead(status,{'Content-Type':mime,'X-Content-Type-Options':'nosniff','Cache-Control':status===200&&mime.startsWith('image/')?'public, max-age=86400':'no-store','Access-Control-Allow-Origin':'none'});
 res.end(Buffer.isBuffer(data)?data:JSON.stringify(data));
};
async function remote(url,limit=3_000_000){
 const response=await fetch(url,{signal:AbortSignal.timeout(14500),headers:{'User-Agent':'MATHVERSE-Teacher-Museum/1.0 (educational terrain viewer)','Accept':'image/png,image/jpeg,application/json;q=0.8,*/*;q=0.2'}});
 if(!response.ok)throw new Error(`Nguồn dữ liệu trả HTTP ${response.status}`);
 const len=Number(response.headers.get('content-length')||0);
 if(len>limit)throw new Error('Nguồn dữ liệu vượt giới hạn tải');
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length>limit||bytes.length<64)throw new Error('Tệp ảnh địa lý không hợp lệ hoặc vượt giới hạn');
 return bytes;
}
function validateTile(z,x,y){return Number.isSafeInteger(z)&&z>=0&&z<=14&&Number.isSafeInteger(x)&&Number.isSafeInteger(y)&&x>=0&&x<2**z&&y>=0&&y<2**z;}
export async function getTerrainTile(kind,z,x,y){
 const source=FILE_TYPES[kind];if(!source||!validateTile(z,x,y))throw Object.assign(new Error('Thông số ô địa hình không hợp lệ'),{status:400});
 const key=`${kind}/${z}/${x}/${y}.${source.ext}`,dest=path.join(CACHEDIR,key);
 try{return{bytes:await fs.readFile(dest),mime:source.content,cache:true};}catch{}
 if(INFLIGHT.has(key))return INFLIGHT.get(key);
 const job=(async()=>{
  const bytes=await remote(source.template(z,x,y));
  if(kind==='terrain' && !(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71))throw new Error('Ô độ cao Terrarium không phải PNG');
  if(kind==='satellite'&&!(bytes[0]===255&&bytes[1]===216))throw new Error('Ô ảnh vệ tinh không phải JPEG');
  await fs.mkdir(path.dirname(dest),{recursive:true});const tmp=dest+'.tmp-'+process.pid;
  await fs.writeFile(tmp,bytes);await fs.rename(tmp,dest);
  return{bytes,mime:source.content,cache:false};
 })();INFLIGHT.set(key,job);
 try{return await job;}finally{INFLIGHT.delete(key);}
}
function cleanMarkup(v){return String(v||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,260);}
function validLicense(value){return /^(CC0|CC BY|CC BY-SA|Public domain|PD-|PDM)/i.test(value||'');}
/** Wikipedia lead-file metadata, then original Commons file licence; no generic image search. */
const LOCAL_PHOTOS_META=path.join(ROOT,'dual','discovery-r99','photos','photos-meta.json');
export async function getWikimediaPhoto(id){
 const item=NATURE_BY_ID.get(id);if(!item)throw Object.assign(new Error('Mã địa danh không thuộc danh sách'),{status:404});
 if(PHOTO_CACHE.has(id))return PHOTO_CACHE.get(id);
 try{
  const list=JSON.parse(await fs.readFile(LOCAL_PHOTOS_META,'utf8'));
  const found=Array.isArray(list)?list.find(x=>x.id===id):null;
  if(found?.url){
   const localFile=path.join(ROOT,found.url.replace(/^\//,''));
   await fs.access(localFile);
   PHOTO_CACHE.set(id,found);
   return found;
  }
 }catch{}
 const searchTitle=decodeURIComponent(item.wiki);
 const wiki=`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=name&titles=${encodeURIComponent(searchTitle)}`;
 const head=JSON.parse((await remote(wiki,1_000_000)).toString('utf8'));
 const page=Object.values(head.query?.pages||{})[0];
 if(!page?.pageimage||page?.missing)throw new Error('Wikipedia chưa có ảnh chính thức của bài viết địa danh');
 const filename=page.pageimage;
 const api=`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=960&titles=${encodeURIComponent('File:'+filename)}`;
 const data=JSON.parse((await remote(api,1_500_000)).toString('utf8'));
 const info=Object.values(data.query?.pages||{})[0]?.imageinfo?.[0];
 const meta=info?.extmetadata||{};
 const license=cleanMarkup(meta.LicenseShortName?.value||meta.License?.value||'');
 if(!info?.thumburl||!validLicense(license))throw new Error(`Ảnh Commons chưa có giấy phép CC/PD phù hợp (${license||'thiếu metadata'})`);
 const photo={ok:true,id,name:item.name,title:filename,url:info.thumburl,source:info.descriptionurl||`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename)}`,author:cleanMarkup(meta.Artist?.value||'Wikimedia Commons contributors'),license,caption:`Ảnh minh họa từ bài viết chính xác ${searchTitle}; cần giáo viên đối chiếu thực địa.`,review:'reference_only'};
 PHOTO_CACHE.set(id,photo);return photo;
}
export async function handleR99Nature(req,res,route,url){
 if(req.method!=='GET'&&req.method!=='HEAD'){respond(res,405,{error:'Chỉ hỗ trợ GET'});return true;}
 try{
  if(route==='/api/discovery/r99/catalog'){
   respond(res,200,{ok:true,version:99,items:NATURE_WONDERS,detail:'DEM+Sentinel-2 bản đồ địa hình 3D, không phải quét 3D điểm đo chính xác từng vật thể',verifiedModelCount:NATURE_WONDERS.filter(x=>x.cachedGlbUrl).length,terrainSupported:NATURE_WONDERS.filter(x=>x.model==='terrain_dem').length,photoVerifiedCount:NATURE_WONDERS.filter(x=>x.photo_verified).length});return true;
  }
  if(route==='/api/discovery/r99/photo'){
   const id=url.searchParams.get('id');respond(res,200,await getWikimediaPhoto(id));return true;
  }
  const m=route.match(/^\/api\/discovery\/r99\/(terrain|satellite)\/(\d+)\/(\d+)\/(\d+)$/);
  if(m){const tile=await getTerrainTile(m[1],+m[2],+m[3],+m[4]);respond(res,200,tile.bytes,tile.mime);return true;}
  respond(res,404,{error:'Không tìm thấy nguồn R99'});return true;
 }catch(error){respond(res,error.status||502,{ok:false,error:error.message,source:'terrain: AWS Terrain Tiles; satellite: EOX 2016',offline:'Dữ liệu chưa được tải trên máy; không thay bằng mô hình giả.'});return true;}
}
