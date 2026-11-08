/** Actual measured 3D relief, not AI-invented topography.
 * Terrarium DEM + registered Sentinel-2 mosaic. Imagery is an optional visual layer;
 * missing DEM -> ERROR, never substituting procedural fake terrain.
 */
import * as THREE from '/vendor/three.module.js';
import {tilePlan,tileCoords,decodeTerrarium} from './tile-geo.mjs';

const MAX_VERTICES=80000;
async function getImage(path,signal){
 const response=await fetch(path,{signal,cache:'force-cache'});
 if(!response.ok){let info='';try{info=(await response.json()).error;}catch{}throw Error(info||`HTTP ${response.status} (${path})`);}
 const blob=await response.blob();if(!blob.type.startsWith('image/'))throw Error('Dữ liệu địa hình không phải ảnh');
 if(typeof createImageBitmap!=='undefined')return createImageBitmap(blob);
 return new Promise((ok,fail)=>{const im=new Image();const src=URL.createObjectURL(blob);im.onload=()=>{URL.revokeObjectURL(src);ok(im);};im.onerror=()=>{URL.revokeObjectURL(src);fail(Error('Không giải mã được tile ảnh'));};im.src=src;});
}
function imageCanvas(n){const canvas=document.createElement('canvas');canvas.width=canvas.height=n;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Trình duyệt không có Canvas2D');return{canvas,ctx};}
async function mosaic(kind,plan,signal){
 const {canvas,ctx}=imageCanvas(plan.totalPixels);
 const tiles=tileCoords(plan);
 // Limited fan-out protects public tile services and slower school networks.
 for(let start=0;start<tiles.length;start+=3){
  const batch=tiles.slice(start,start+3);
  await Promise.all(batch.map(async p=>{
   const url=`/api/discovery/r99/${kind}/${p.zoom}/${p.x}/${p.y}`;
   const image=await getImage(url,signal);
   ctx.drawImage(image,p.col*256,p.row*256,256,256);image.close?.();
  }));
 }
 return{canvas,pixels:kind==='terrain'?ctx.getImageData(0,0,canvas.width,canvas.height).data:null};
}
function elevationColor(t){
 const stops=[[.00,0x1d5b45],[.2,0x508653],[.4,0x839468],[.65,0xa99d74],[.85,0xbeb7a3],[1,0xf2f1ed]];
 for(let k=1;k<stops.length;k++)if(t<=stops[k][0]){
  const[a,ca]=stops[k-1],[b,cb]=stops[k],f=(t-a)/(b-a||1);
  const c1=new THREE.Color(ca),c2=new THREE.Color(cb);return c1.lerp(c2,f);
 }
 return new THREE.Color(0xffffff);
}
function sampleRGB(pixels,stride,x,y){
 const ox=Math.min(stride-1,Math.max(0,Math.round(x))),oy=Math.min(stride-1,Math.max(0,Math.round(y)));
 const at=(oy*stride+ox)*4;return decodeTerrarium(pixels[at],pixels[at+1],pixels[at+2]);
}
export async function loadNatureTerrain(site,{detail=false,verticalExaggeration=1,signal}={}){
 if(site?.model!=='terrain_dem')throw Error(site?.reason||'Chưa đủ dữ liệu 3D tin cậy');
 if(verticalExaggeration<1||verticalExaggeration>4)throw Error('Phóng đại đứng chỉ hỗ trợ 1–4 lần');
 const plan=tilePlan(site.lng,site.lat,detail?site.zoom:site.previewZoom,detail?3:1);
 const terrain=await mosaic('terrain',plan,signal); // Mandatory real DEM.
 const W=plan.totalPixels,step=detail?5:3,grid=Math.floor((W-1)/step)+1;
 if(grid*grid>MAX_VERTICES)throw Error('Số đỉnh DEM vượt ngưỡng máy học sinh');
 const heights=new Float32Array(grid*grid),positions=new Float32Array(grid*grid*3);
 const uv=new Float32Array(grid*grid*2),colors=new Float32Array(grid*grid*3);
 let hMin=Infinity,hMax=-Infinity;
 for(let j=0;j<grid;j++)for(let i=0;i<grid;i++){
  const v=sampleRGB(terrain.pixels,W,i/(grid-1)*(W-1),j/(grid-1)*(W-1));
  heights[j*grid+i]=v;hMin=Math.min(hMin,v);hMax=Math.max(hMax,v);
 }
 if(!Number.isFinite(hMin)||!Number.isFinite(hMax)||hMin===hMax){
  // A flat zero-elevation tile cannot be called a reconstructed natural wonder.
  throw Error('DEM thiếu thông tin độ cao tại khu vực đã chọn; không dựng 3D phẳng giả');
 }
 const sceneWidth=10.8,spanMetres=plan.pixelMetres*W,spanMeters=spanMetres,metersPerUnit=spanMetres/sceneWidth;
 for(let j=0;j<grid;j++)for(let i=0;i<grid;i++){
  const k=j*grid+i,h=heights[k];
  positions[k*3]=(i/(grid-1)-.5)*sceneWidth;
  positions[k*3+1]=(h-hMin)/metersPerUnit*verticalExaggeration;
  positions[k*3+2]=(j/(grid-1)-.5)*sceneWidth;
  uv[k*2]=i/(grid-1);uv[k*2+1]=1-j/(grid-1);
  const rgb=elevationColor((h-hMin)/Math.max(1,hMax-hMin));colors[k*3]=rgb.r;colors[k*3+1]=rgb.g;colors[k*3+2]=rgb.b;
 }
 const indexes=[];for(let j=0;j<grid-1;j++)for(let i=0;i<grid-1;i++){
  const k=j*grid+i;indexes.push(k,k+grid,k+1, k+1,k+grid,k+grid+1);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
 geometry.setIndex(indexes);geometry.computeVertexNormals();
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.98,metalness:0,side:THREE.DoubleSide});
 const mesh=new THREE.Mesh(geometry,material);mesh.name=`R99_TRUE_DEM_${site.id}`;mesh.castShadow=false;mesh.receiveShadow=true;
 const group=new THREE.Group();group.name=`NATURE_TERRAIN_${site.id}`;group.add(mesh);
 if((site.id==='nature_halong'||site.id==='nature_rio')&&hMin<=0.5){
  const seaPlane=new THREE.Mesh(new THREE.PlaneGeometry(sceneWidth,sceneWidth),new THREE.MeshStandardMaterial({color:0x0f5c78,roughness:.25,metalness:.1,transparent:true,opacity:.42,side:THREE.DoubleSide}));
  seaPlane.rotation.x=-Math.PI/2;seaPlane.position.y=Math.max(0,(0-hMin)/metersPerUnit*verticalExaggeration)+.012;
  seaPlane.name=`R99_SEA_REFERENCE_${site.id}`;group.add(seaPlane);
 }
 const base=new THREE.Mesh(new THREE.BoxGeometry(sceneWidth+.05,.22,sceneWidth+.05),new THREE.MeshStandardMaterial({color:0x203344,roughness:.9}));base.position.y=-.14;group.add(base);
 const result={group,mesh,geometry,texture:null,imagery:'none',site,plan,stats:{minElevationMeters:hMin,maxElevationMeters:hMax,spanMeters,spanMetres,verticalExaggeration,vertices:grid*grid,triangles:indexes.length/3,imagery:false,provider:'Mapzen Terrain Tiles / AWS Terrarium',resolutionMetres:plan.pixelMetres*step}};
 // Only use actual satellite imagery when it loads. It aligns on the same Web Mercator tile grid.
 try{
  const image=await mosaic('satellite',plan,signal);
  const texture=new THREE.CanvasTexture(image.canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  material.vertexColors=false;material.map=texture;material.needsUpdate=true;
  result.texture=texture;result.imagery='Sentinel-2 Cloudless 2016 / EOX';result.stats.imagery=true;
 }catch(error){result.imagery='unavailable';result.stats.imageryError=String(error.message||error).slice(0,300);}
 return result;
}
export function disposeNatureTerrain(bundle){if(!bundle)return;bundle.geometry?.dispose();bundle.texture?.dispose();bundle.mesh?.material?.dispose();bundle.group?.traverse?.(n=>{if(n.isMesh&&n!==bundle.mesh){n.geometry?.dispose();n.material?.dispose?.();}});}
