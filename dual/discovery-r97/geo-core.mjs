/** MATHVERSE Discovery R97 -- geographic data boundary. No fabricated coordinates. */
export const NATURAL_EARTH_50M_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson';
export const UNESCO_DATAHUB_BASE = 'https://data.unesco.org/api/explore/v2.1/catalog/datasets/whc001';
export const OFFLINE_COUNTRIES_PATH = '/dual/discovery-r97/countries-110m-offline.geojson';
export const OFFICIAL_UNESCO_DATASET = 'https://data.unesco.org/explore/assets/whc001/';

const numberOrNull=v=>{const n=Number(v);return Number.isFinite(n)?n:null;};
export const validLatLon=(lat,lng)=>Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180;
export function lonLatToPixel(lng,lat,width,height){
  return {x:(lng+180)/360*width, y:(90-lat)/180*height};
}
export function pixelToLonLat(x,y,width,height){
  return {lng:x/width*360-180,lat:90-y/height*180};
}
function recordCoordinates(record){
  const p=record?.geometry;
  if(p?.type==='Point'&&Array.isArray(p.coordinates))return {lng:Number(p.coordinates[0]),lat:Number(p.coordinates[1])};
  const fields=record?.properties||record?.fields||record||{};
  const geo=fields.geo_point_2d||fields.coordinates;
  if(geo?.type==='Point'&&Array.isArray(geo.coordinates))return {lng:Number(geo.coordinates[0]),lat:Number(geo.coordinates[1])};
  if(geo&&typeof geo==='object'){
    if(Array.isArray(geo)&&geo.length===2) return {lng:Number(geo[0]),lat:Number(geo[1])};
    if(geo.lon!==undefined&&geo.lat!==undefined)return {lng:Number(geo.lon),lat:Number(geo.lat)};
    if(geo.longitude!==undefined&&geo.latitude!==undefined)return {lng:Number(geo.longitude),lat:Number(geo.latitude)};
  }
  // A free-form UNESCO coordinate text is ambiguous; do not guess the lat/lon order.
  return null;
}
export function normalizeOfficialUnesco(record){
  const p=record?.properties||record?.fields||record||{};
  if(String(p.category||'').toLowerCase()!=='cultural')return null;
  const geo=recordCoordinates(record);
  if(!geo||!validLatLon(geo.lat,geo.lng))return null;
  const whc=Number.parseInt(String(p.id_no||p.id||''),10);
  if(!Number.isSafeInteger(whc)||whc<1||whc>99999)return null;
  const name=String(p.name_en||'').trim();
  if(!name)return null;
  const year=Number.parseInt(String(p.date_inscribed||'').slice(0,4),10);
  return {
    id:`unesco_official_${whc}`,whcId:whc,officialWorldHeritage:true,
    heritageType:'cultural',name,title:name,country:String(p.states_names||p.iso_codes||'').trim(),
    lat:geo.lat,lng:geo.lng,latitude:geo.lat,longitude:geo.lng,
    continent:String(p.region||'Chưa phân loại'),year:Number.isFinite(year)?year:null,
    grade:'Tư liệu địa lý – lịch sử',kind:'',model3d:false,sketchfabId:null,
    shape:'Chưa có mô hình hình học được kiểm định',math:'Dữ liệu UNESCO chính thức; chưa có mô hình hình học được kiểm chứng.',
    history:String(p.short_description_en||p.description_en||'').replace(/<[^>]*>/g,'').slice(0,1300),
    explanation:'Di sản được UNESCO ghi danh. Chưa xác minh ảnh và mô hình 3D của riêng công trình.',
    unescoUrl:`https://whc.unesco.org/en/list/${whc}/`,
    photo:{status:'pending_commons_image_review'},
    media:{source:`https://whc.unesco.org/en/list/${whc}/`,author:'UNESCO',license:'CC BY-SA 4.0 (dữ liệu mô tả)',photo:''}
  };
}
export function normalizeOfficialDataset(json){
  const records=Array.isArray(json)?json:Array.isArray(json?.features)?json.features:Array.isArray(json?.results)?json.results:[];
  const seen=new Set(), sites=[];
  for(const r of records){
    const v=normalizeOfficialUnesco(r);
    if(v&&!seen.has(v.whcId)){sites.push(v);seen.add(v.whcId);}
  }
  return sites;
}
const timeoutFetch=async(url,ms=14000)=>{
  const ac=new AbortController(); const t=setTimeout(()=>ac.abort(),ms);
  try{const r=await fetch(url,{signal:ac.signal,mode:'cors',credentials:'omit'});if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json();}
  finally{clearTimeout(t);}
};
export async function fetchOfficialUNESCO(){
  let errors=[];
  // Prefer the fixed-origin Node gateway: 7-day cache and no cross-origin browser requests.
  try{
    const result=await timeoutFetch('/api/discovery/unesco',26000);
    if(result.ok&&Array.isArray(result.sites)&&result.sites.length>200){
      const sites=result.sites.filter(s=>s?.officialWorldHeritage===true&&validLatLon(s.lat,s.lng));
      if(sites.length>200)return sites;
    }
    errors.push('Gateway chưa có dữ liệu UNESCO đầy đủ');
  }catch(e){errors.push(`Gateway: ${e.message}`);}
  // Full UNESCO export has no per-request page cap; use it preferentially.
  try {
    const data=await timeoutFetch(`${UNESCO_DATAHUB_BASE}/exports/geojson`,22000);
    const sites=normalizeOfficialDataset(data);
    if(sites.length>200)return sites;
    errors.push(`GeoJSON chỉ có ${sites.length} điểm văn hóa hợp lệ`);
  }catch(e){errors.push(`GeoJSON: ${e.message}`);}
  try {
    const all=[];let offset=0;let total=1273;
    for(let page=0;page<15&&offset<total;page++){
      const d=await timeoutFetch(`${UNESCO_DATAHUB_BASE}/records?limit=100&offset=${offset}`);
      if(!Array.isArray(d.results))throw Error('Cấu trúc records không hợp lệ');
      all.push(...d.results);offset+=d.results.length;
      total=Number.isFinite(d.total_count)?d.total_count:total;
      if(!d.results.length)break;
    }
    const sites=normalizeOfficialDataset(all);
    if(sites.length>200)return sites;
    throw Error(`chỉ đọc được ${sites.length} di sản văn hóa`);
  }catch(e){errors.push(`Records: ${e.message}`);}
  throw Error(`Không thể tải dữ liệu UNESCO hiện tại: ${errors.join('; ')}`);
}
export function getCountryName(p){return String(p?.ADMIN||p?.NAME||p?.name||p?.NAME_EN||p?.SOVEREIGNT||'');}
export function countryFeatures(dataset){return Array.isArray(dataset?.features)?dataset.features.filter(f=>['Polygon','MultiPolygon'].includes(f?.geometry?.type)):[];}
export function geometryRings(feature){
  const g=feature.geometry;
  if(g.type==='Polygon')return g.coordinates;
  if(g.type==='MultiPolygon')return g.coordinates.flatMap(p=>p);
  return [];
}
export function lonLatDistanceDeg(a,b){
  const phi=(a.lat+b.lat)*Math.PI/360;
  return Math.hypot((a.lng-b.lng)*Math.cos(phi),a.lat-b.lat);
}
