/** Export actual reconstructed DEM mesh as standard glTF 2.0 binary (.glb).
 * GLB is a terrain model, NOT a photogrammetry scan and not a survey-accuracy guarantee.
 */
const pad4=(n)=>(n+3)&~3;
function bytesOf(attr){return new Uint8Array(attr.array.buffer.slice(attr.array.byteOffset,attr.array.byteOffset+attr.array.byteLength));}
function b64bytes(s){const raw=atob(s);const v=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)v[i]=raw.charCodeAt(i);return v;}
export function exportNatureGLB(bundle){
 if(!bundle?.geometry||!bundle?.site)throw Error('Chưa có DEM 3D được tải thành công');
 const geo=bundle.geometry,views=[],accessors=[],parts=[];let binOffset=0;
 const push=(data,target)=>{const offset=pad4(binOffset);if(offset>binOffset)parts.push(new Uint8Array(offset-binOffset));
  const vIndex=views.length;views.push({buffer:0,byteOffset:offset,byteLength:data.byteLength,...(target?{target}:{})});parts.push(data);
  binOffset=offset+data.byteLength;return vIndex;
 };
 function attribute(name,type,components){const attr=geo.getAttribute(name);if(!attr)return null;
  const bytes=bytesOf(attr),view=push(bytes,34962),acc={bufferView:view,componentType:5126,count:attr.count,type};
  if(name==='position'){acc.min=[Infinity,Infinity,Infinity];acc.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<attr.count;i++)for(let j=0;j<3;j++){let v=attr.array[i*components+j];acc.min[j]=Math.min(acc.min[j],v);acc.max[j]=Math.max(acc.max[j],v);}}
  const idx=accessors.length;accessors.push(acc);return idx;
 }
 const position=attribute('position','VEC3',3),normal=attribute('normal','VEC3',3),uv=attribute('uv','VEC2',2);
 const color=bundle.texture?null:attribute('color','VEC3',3);
 const indicesArray=Uint32Array.from(geo.index.array);const idxIndex=accessors.length,ib=push(new Uint8Array(indicesArray.buffer),34963);
 accessors.push({bufferView:ib,componentType:5125,count:indicesArray.length,type:'SCALAR'});
 const primitive={attributes:{POSITION:position,NORMAL:normal,TEXCOORD_0:uv,...(color!=null?{COLOR_0:color}:{})},indices:idxIndex,material:0};
 const material={name:'MATHVERSE terrain - physically measured elevation',pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],metallicFactor:0,roughnessFactor:1},doubleSided:true};
 const doc={asset:{version:'2.0',generator:'MATHVERSE Discovery R99 DEM terrain'},scenes:[{nodes:[0]}],scene:0,nodes:[{mesh:0,name:bundle.site.name}],meshes:[{primitives:[primitive]}],materials:[material],buffers:[],bufferViews:views,accessors,
  extras:{kind:'terrain_dem_not_photogrammetry',latitude:bundle.site.lat,longitude:bundle.site.lng,zoom:bundle.plan.zoom,source:'https://registry.opendata.aws/terrain-tiles/',imagerySource:bundle.texture?'EOX Sentinel-2 Cloudless 2016 CC BY 4.0':null,verticalExaggeration:bundle.stats.verticalExaggeration,spanMetres:bundle.stats.spanMeters,resolutionMetres:bundle.stats.resolutionMetres,heightRangeMetres:[bundle.stats.minElevationMeters,bundle.stats.maxElevationMeters],warning:'Not metrically certified; no invented geometry, no cave, underwater reef or volumetric aurora structure'}};
 if(bundle.texture?.image?.toDataURL){const imageBytes=b64bytes(bundle.texture.image.toDataURL('image/jpeg',0.88).split(',')[1]);const imageView=push(imageBytes);doc.images=[{bufferView:imageView,mimeType:'image/jpeg'}];doc.samplers=[{magFilter:9729,minFilter:9987,wrapS:33071,wrapT:33071}];doc.textures=[{sampler:0,source:0}];material.pbrMetallicRoughness.baseColorTexture={index:0};}
 const binLength=pad4(binOffset),bin=new Uint8Array(binLength);let at=0;
 for(const part of parts){bin.set(part,at);at+=part.byteLength;}
 doc.buffers=[{byteLength:binLength}];const str=JSON.stringify(doc);const encoded=new TextEncoder().encode(str),jsonLength=pad4(encoded.length);
 const length=12+8+jsonLength+8+binLength,out=new ArrayBuffer(length),dv=new DataView(out),arr=new Uint8Array(out);
 dv.setUint32(0,0x46546c67,true);dv.setUint32(4,2,true);dv.setUint32(8,length,true);
 dv.setUint32(12,jsonLength,true);dv.setUint32(16,0x4e4f534a,true);arr.fill(32,20,20+jsonLength);arr.set(encoded,20);
 const binAt=20+jsonLength;dv.setUint32(binAt,binLength,true);dv.setUint32(binAt+4,0x004e4942,true);arr.set(bin,binAt+8);
 return new Blob([out],{type:'model/gltf-binary'});
}
export function downloadNatureGLB(bundle){const blob=exportNatureGLB(bundle),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${bundle.site.id}_DEM_3D_MATHVERSE.glb`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);return blob.size;}
