/** R97 fixed-source geospatial gateway: no arbitrary remote URLs, no API keys.
 * Runs inside MATHVERSE Node.js server to avoid browser CORS on UNESCO/Natural Earth.
 * Keeps a seven-day cache and is explicit if full official data is unavailable.
 */
import fsp from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {UNESCO_HERITAGE} from '../dual/discovery-unesco-data.mjs';
import {normalizeOfficialDataset,countryFeatures} from '../dual/discovery-r97/geo-core.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../data/discovery-r97-geodata');
const UNESCO_URLS=[
 'https://data.unesco.org/api/explore/v2.1/catalog/datasets/whc001/exports/geojson',
 'https://data.unesco.org/api/explore/v2.1/catalog/datasets/whc001/exports/json',
 'https://data.unesco.org/api/explore/v2.1/catalog/datasets/whc001/records?limit=100'
];
const COUNTRIES_URLS=[
 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson',
 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_0_countries.geojson'
];
const inflight=new Map(),MAX_CACHE_MS=7*86400_000;
async function readCache(name){try{return JSON.parse(await fsp.readFile(path.join(root,`${name}.json`),'utf8'));}catch{return null;}}
async function cacheWrite(name,content){try{await fsp.mkdir(root,{recursive:true});await fsp.writeFile(path.join(root,`${name}.json`),JSON.stringify(content));}catch(e){console.warn('[R97 cache is read-only]',e.message);}}
async function downloadJSON(url,maxBytes){
 const response=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{'user-agent':'MATHVERSE-Discovery-R97 (educational archival dataset)','accept':'application/geo+json, application/json'}});
 if(!response.ok)throw Error(`HTTP ${response.status}`);
 const length=Number(response.headers.get('content-length')||0);if(length>maxBytes)throw Error('File too large');
 let bytes=0;const parts=[];
 for await(const chunk of response.body){bytes+=chunk.length;if(bytes>maxBytes)throw Error('Download exceeds safety cap');parts.push(Buffer.from(chunk));}
 return JSON.parse(Buffer.concat(parts).toString('utf8'));
}
async function cachedDataset(name,urls,validate,maxBytes){
 if(inflight.has(name))return inflight.get(name);
 const job=(async()=>{
  const prev=await readCache(name),now=Date.now();
  if(prev&&now-prev.savedAt<MAX_CACHE_MS&&validate(prev.data))return {...prev,state:'cache'};
  for(const url of urls){try{
    const data=await downloadJSON(url,maxBytes);
    if(!validate(data))throw Error('Source lacks expected complete schema');
    const record={savedAt:now,source:url,data};await cacheWrite(name,record);
    return {...record,state:'live'};
  }catch(e){console.warn(`[R97 geo] ${name} ${url}`,e.message);}}
  if(prev&&validate(prev.data))return {...prev,state:'offline-cache'};
  return null;
 })();inflight.set(name,job);
 try{return await job;}finally{inflight.delete(name);}
}
export async function getCountryTopology(){
 const r=await cachedDataset('natural-earth-countries-50m',COUNTRIES_URLS,d=>countryFeatures(d).length>=200,14_000_000);
 return r?{ok:true,geojson:r.data,source:r.source,count:countryFeatures(r.data).length,license:'Natural Earth public domain',cacheState:r.state}:
 {ok:false,geojson:null,count:0,license:'Natural Earth public domain',message:'Chưa tải được bản đồ 1:50m. Sử dụng bản ngoại tuyến 1:110m.'};
}
export async function getUnescoSites(){
 const r=await cachedDataset('unesco-cultural-sites',UNESCO_URLS,d=>normalizeOfficialDataset(d).length>200,32_000_000);
 if(r){const sites=normalizeOfficialDataset(r.data);return {ok:true,sites,count:sites.length,source:r.source,license:'UNESCO DataHub whc001 CC BY-SA 4.0',cacheState:r.state};}
 return {ok:false,count:UNESCO_HERITAGE.length,sites:UNESCO_HERITAGE.map(s=>({id:s.id,lat:s.lat,lng:s.lng,whcId:s.whcId,name:s.name,country:s.country})),source:'R96 curated (18 only)',message:'Không tải được dữ liệu UNESCO cập nhật. Chỉ hiển thị 18 điểm đã tuyển chọn, không gọi là toàn bộ UNESCO.'};
}
