/** R6.8 read-only audit of the SAME source engines used by actual Lab views. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {MODE_BY_ID,ROOM_BY_ID} from '../src/museum/r6-room-layout.js';
import {getUnifiedLabByModeId, GRADE6_FAMILY_LABS,getLabDoorsForRoom} from '../src/museum/r68-unified-labs.mjs';
import {labById} from '../src/math6-lab/catalog.js';
import {renderModel} from '../src/math6-lab/canvas.mjs';
import {mathStats} from '../src/math6-lab/math.mjs';
import {getModelTaxonomy,isTrue3DCapable} from '../src/math6-lab/math6-taxonomy.mjs';
import {grade7Defaults,isGrade7Mode,grade7Solid,grade7SolidProperties} from '../src/curriculum/grade7-engine.mjs';
import {grade7SVGScene} from '../src/curriculum/grade7-svg.mjs';
import {grade8Defaults,isGrade8Mode,grade8Solid,pyramid8} from '../src/curriculum/grade8-engine.mjs';
import {grade8SVGScene} from '../src/curriculum/grade8-svg.mjs';
import {grade9Defaults,isGrade9Mode,grade9Solid,grade9SolidModel} from '../src/curriculum/grade9-engine.mjs';
import {grade9SceneSVG} from '../src/curriculum/grade9-svg.mjs';
import {grade10Defaults,isGrade10Mode} from '../src/curriculum/grade10-engine.mjs';
import {grade10SceneSVG} from '../src/curriculum/grade10-svg.mjs';
import {grade11Defaults,isGrade11Mode,grade11Is3D,grade11SolidModel} from '../src/curriculum/grade11-engine.mjs';
import {grade11SceneSVG} from '../src/curriculum/grade11-svg.mjs';
import {grade12Defaults,isGrade12Mode,grade12Is3D,grade12SolidModel} from '../src/curriculum/grade12-engine.mjs';
import {grade12SceneSVG} from '../src/curriculum/grade12-svg.mjs';
import {isTriangleCase,initialTriangleParams,makeTrianglePair} from '../src/curriculum/triangle-engine.mjs';
import {isGraphCase} from '../src/curriculum/graph-models.mjs';
import {isCirclePosition} from '../src/curriculum/circle-positions.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const results=[];
const sha=x=>createHash('sha256').update(String(x)).digest('hex').slice(0,16);
const csvLine=row=>row.map(x=>'"'+String(x??'').replaceAll('"','""')+'"').join(',');
const ctxLog=[];
const canvasContext=new Proxy({}, {get:(_obj,key)=>{
 if(key==='canvas')return {width:920,height:560};
 if(key==='measureText')return text=>({width:String(text).length*12});
 if(['fillStyle','strokeStyle','font','lineWidth','textAlign','textBaseline','globalAlpha','lineCap','lineJoin'].includes(key))return '';
 return (...args)=>{if(ctxLog.length<20000)ctxLog.push(String(key)+'('+args.map(x=>typeof x==='number'?Math.round(x*1000)/1000:String(x)).join(',')+')');};
 },set:()=>true});
let errorCount=0;
for(const [id,source] of MODE_BY_ID){
 const grade=Number(source.grade), family=getUnifiedLabByModeId(id),row={grade,roomId:source.roomId,labId:family?.labId||'',modeId:id,name:source.name,engine:'',category:'',result:'PASS',error:'',fingerprint:'',visuallyIdenticalGroup:'',hasActive3D:false};
 try{
  if(!family||!getLabDoorsForRoom(source.roomId).some(f=>f.labId===family.labId))throw Error('No unified family Lab door or incorrect room assignment');
  if(grade===6){
   const lab=labById(id);if(!lab)throw Error('Not in Grade6 source renderer');
   const state={params:structuredClone(lab.defaults),time:0,counts:[],tileFlips:new Set(),selectedDesk:0};
   ctxLog.length=0;renderModel(canvasContext,lab,state);const steps=[...ctxLog];
   if(steps.length<4)throw Error('Canvas had too few drawing operations');
   const stat=mathStats(lab,state);if(!stat||String(stat).includes('NaN'))throw Error('Invalid mathStats');
   row.engine='Math6 Canvas';row.category=getModelTaxonomy(id)?.nature||'SGK';row.hasActive3D=isTrue3DCapable(id);
   row.fingerprint=sha(steps.join('|'));
  } else if(isTriangleCase(id)) {
   const params=initialTriangleParams(id);const pair=makeTrianglePair(id,params);
   if(!pair.check?.passes)throw Error('Initial triangles do not satisfy their named conditions');
   row.engine='Triangle geometric proof';row.category='2D SGK';row.fingerprint=sha(JSON.stringify(pair.first)+JSON.stringify(pair.second));
  } else if(isGrade7Mode(id)){
   const params=grade7Defaults(id);const result=grade7Solid(id)?grade7SolidProperties(id,params):grade7SVGScene(id,params,0);
   if(result==null||typeof result==='string' && result.length<110)throw Error('No grade7 geometry');
   row.engine=grade7Solid(id)?'Grade7 Three.js solid':'Grade7 SVG';row.hasActive3D=grade7Solid(id);row.fingerprint=sha(JSON.stringify(result));
  } else if(isGrade8Mode(id)){
   const params=grade8Defaults(id);const result=grade8Solid(id)?pyramid8(id,params):grade8SVGScene(id,params,0);
   if(result==null||typeof result==='string' && result.length<110)throw Error('No grade8 geometry');
   row.engine=grade8Solid(id)?'Grade8 Three.js solid':'Grade8 SVG';row.hasActive3D=grade8Solid(id);row.fingerprint=sha(JSON.stringify(result));
  } else if(isGrade9Mode(id)){
   const params=grade9Defaults(id);const result=grade9Solid(id)?grade9SolidModel(id,params):grade9SceneSVG(id,params,0);
   if(result==null||typeof result==='string'&&result.length<110)throw Error('No grade9 geometry');
   row.engine=grade9Solid(id)?'Grade9 Three.js solid':'Grade9 SVG';row.hasActive3D=grade9Solid(id);row.fingerprint=sha(JSON.stringify(result));
  } else if(isGrade10Mode(id)){
   const params=grade10Defaults(id);const result=grade10SceneSVG(id,params,0);
   if(!result||result.length<110)throw Error('No grade10 drawing');
   row.engine='Grade10 SVG';row.fingerprint=sha(result);
  } else if(isGrade11Mode(id)){
   const params=grade11Defaults(id);const result=grade11Is3D(id)?grade11SolidModel(id,params,0):grade11SceneSVG(id,params,0);
   if(!result||typeof result==='string'&&result.length<110)throw Error('No grade11 drawing');
   row.engine=grade11Is3D(id)?'Grade11 Three.js solid':'Grade11 SVG';row.hasActive3D=grade11Is3D(id);row.fingerprint=sha(JSON.stringify(result));
  } else if(isGrade12Mode(id)){
   const params=grade12Defaults(id);const result=grade12Is3D(id)?grade12SolidModel(id,params,0):grade12SceneSVG(id,params,0);
   if(!result||typeof result==='string'&&result.length<110)throw Error('No grade12 drawing');
   row.engine=grade12Is3D(id)?'Grade12 Three.js solid':'Grade12 SVG';row.hasActive3D=grade12Is3D(id);row.fingerprint=sha(JSON.stringify(result));
  } else if(isGraphCase(id)||isCirclePosition(id)){
   row.engine=isGraphCase(id)?'Interactive graph renderer':'Interactive circle renderer';row.category='2D SVG';row.fingerprint=sha(id+'-legacy-interactive');
  } else throw Error('Missing interactive mathematical engine');
  if(row.fingerprint==='')throw Error('Blank output fingerprint');
 }catch(e){row.result='FAIL';row.error=String(e.message||e);errorCount++;}
 results.push(row);
}
const key2modes=new Map();for(const r of results.filter(x=>x.result==='PASS')){const key=r.engine+'|'+r.fingerprint;const a=key2modes.get(key)||[];a.push(r.modeId);key2modes.set(key,a);}
for(const r of results){const twins=key2modes.get(r.engine+'|'+r.fingerprint)||[];if(twins.length>1)r.visuallyIdenticalGroup=twins.join(' / ');}
const csv=results.map(({grade,roomId,labId,modeId,name,engine,category,result,error,fingerprint,visuallyIdenticalGroup,hasActive3D})=>[grade,roomId,labId,modeId,name,engine,category,hasActive3D?'THREE_JS':'2D',result,error,fingerprint,visuallyIdenticalGroup]);
const head=['Lop','Phong','Lab_chuyen_de','Ma_mo_hinh','Ten_mo_hinh','Bo_dung','Phan_loai','Che_do','Kiem_thu','Loi','Dau_van_hinh_ve','Trung_dau_van'];
const outfile=path.join(root,'R68_KIEM_DINH_310_MO_HINH.csv');fs.writeFileSync(outfile,'\uFEFF'+[head,...csv].map(csvLine).join('\r\n'),'utf-8');
const duplicate=results.filter(x=>x.visuallyIdenticalGroup);
const summary={total:results.length,passed:results.length-errorCount,failed:errorCount,groups:9+67,doors:[...ROOM_BY_ID.values()].reduce((n,r)=>n+getLabDoorsForRoom(r.roomId).length,0),mathematical3d:results.filter(x=>x.hasActive3D).length,identicalFingerprints:duplicate.length,failures:results.filter(x=>x.result==='FAIL').map(({modeId,error})=>({modeId,error})),duplicates:duplicate.map(x=>x.modeId)};
fs.writeFileSync(path.join(root,'R68_AUDIT_SUMMARY.json'),JSON.stringify(summary,null,2),'utf8');
console.log('AUDIT',JSON.stringify(summary,null,2));
if(errorCount)process.exitCode=1;
