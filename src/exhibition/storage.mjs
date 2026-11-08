const DATABASE='mathverse-history-gallery-portraits-v1';
const TABLE='portraits';
function getDB(){
  return new Promise((resolve,reject)=>{
    if(typeof indexedDB==='undefined')return reject(new Error('Trình duyệt không hỗ trợ lưu ảnh IndexedDB.'));
    const request=indexedDB.open(DATABASE,1);
    request.onupgradeneeded=()=>{
      if(!request.result.objectStoreNames.contains(TABLE))request.result.createObjectStore(TABLE);
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||new Error('Không mở được kho ảnh'));
  });
}
async function storageOp(mode,id,blob){
  const db=await getDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(TABLE,mode==='read'?'readonly':'readwrite');
    const st=tx.objectStore(TABLE);
    const op=mode==='read'?st.get(id):mode==='delete'?st.delete(id):st.put(blob,id);
    op.onsuccess=()=>resolve(op.result||null);
    op.onerror=()=>reject(op.error||new Error('Không thể lưu ảnh'));
    tx.oncomplete=()=>db.close();
    tx.onerror=()=>{db.close();reject(tx.error||new Error('Lỗi lưu ảnh'));};
  });
}
export const getPortrait=async id=>await storageOp('read',id);
export const savePortrait=async(id,blob)=>await storageOp('write',id,blob);
export const deletePortrait=async id=>await storageOp('delete',id);
export async function preparePortrait(file){
  if(!file||!file.type.startsWith('image/'))throw new Error('Vui lòng chọn hình ảnh PNG, JPG hoặc WebP.');
  if(file.size>12*1024*1024)throw new Error('Ảnh quá lớn. Tối đa 12 MB.');
  const blobUrl=URL.createObjectURL(file);
  const img=new Image();
  try{
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Ảnh không hợp lệ'));img.src=blobUrl;});
    const ratio=Math.min(1,560/img.naturalWidth,720/img.naturalHeight);
    const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*ratio));c.height=Math.max(1,Math.round(img.naturalHeight*ratio));
    const ctx=c.getContext('2d');ctx.fillStyle='#f7f5ee';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);
    return await new Promise((resolve,reject)=>c.toBlob(blob=>blob?resolve(blob):reject(new Error('Không nén được ảnh')),'image/jpeg',.84));
  }finally{URL.revokeObjectURL(blobUrl);}
}
