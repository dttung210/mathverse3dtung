/**
 * MATHVERSE MASTERPLAN V4 — one shared world: Lab/Museum directly on hall, Park opposite the hall.
 * World X grows to the east/right and Z grows toward the entrance/front.
 * This pure module also powers the SVG wayfinding overlay and aerial framing.
 */
export const CAMPUS_MASTERPLAN = Object.freeze({
  version:'V4-SANH_CHUNG_DOI_DIEN_CONG_VIEN',
  // These are physical coordinates in the original Grand Campus scene.
  entrance:Object.freeze({x:0,z:47,label:'Cổng đại sảnh'}),
  plaza:Object.freeze({x:0,z:0,label:'Sảnh chung · quảng trường'}),
  receptionist:Object.freeze({x:0,z:-7,label:'Sảnh chung · lễ tân MATHVERSE'}),
  lab:Object.freeze({x:-42,z:-60,entryX:-42,entryZ:-29.5,radius:38,label:'MATHVERSE LAB'}),
  museum:Object.freeze({x:42,z:-60,entryX:42,entryZ:-29.5,radius:34,label:'Bảo tàng Infographic'}),
  park:Object.freeze({x:0,z:138,entryX:0,entryZ:66,spawnX:0,spawnZ:58,radius:80,label:'Công viên Toán học 3D'}),
  discovery:Object.freeze({x:-108,z:8,entryX:-78,entryZ:8,label:'MATHVERSE DISCOVERY · Địa cầu & Hình học'}),
  // One STRAIGHT campus avenue from the common hall toward the opposite park.
  // It passes through the existing main campus entrance, without moving Lab/Museum.
  boulevard:Object.freeze([[0,24],[0,41],[0,56],[0,66]]),
  westBranch:Object.freeze([[0,-7],[-17,-2],[-33,-16],[-42,-29.5]]),
  eastBranch:Object.freeze([[0,-7],[17,-2],[33,-16],[42,-29.5]]),
  bounds:Object.freeze({xMin:-146,xMax:120,zMin:-112,zMax:230}),
  parkBounds:Object.freeze({xMin:-90,xMax:90,zMin:45,zMax:226}),
  ringRadius:54,
  zones:Object.freeze([
    'Học bá Chuồng Gà','Học bá Tên Lửa','Phòng Thích Học Bá','Cầu Kính Tri Thức',
    'Kéo Co Tri Thức','Đá Bóng Học Bá','Kiến Trúc Sư','Mê Cung Lạc Lối',
    'Tàu Lượn Siêu Tốc','Khinh Khí Cầu Trí Tuệ','Ai Là Triệu Phú Toán Học'
  ])
});

export const ORBITAL_MASTERPLAN = Object.freeze({
  version:'R107-VONG_QUY_DAO_TRI_THUC_04_05',
  center:Object.freeze({x:0,z:0,radius:48,label:'GRAND DOME · Sảnh Trung Tâm'}),
  discovery:Object.freeze({x:0,z:-138,entryX:0,entryZ:-78,radius:66,label:'DISCOVERY · Hướng Bắc'}),
  lab:Object.freeze({x:-138,z:0,entryX:-108,entryZ:0,radius:66,label:'LAB · Hướng Tây'}),
  museum:Object.freeze({x:138,z:0,entryX:108,entryZ:0,radius:66,label:'MUSEUM · Hướng Đông'}),
  park:Object.freeze({x:0,z:138,entryX:0,entryZ:66,spawnX:0,spawnZ:58,radius:66,label:'WONDER PARK · Hướng Nam'}),
  orbitRadius:138,
  bounds:Object.freeze({xMin:-222,xMax:222,zMin:-222,zMax:222}),
  parkBounds:Object.freeze({xMin:-85,xMax:85,zMin:52,zMax:214})
});

export function zoneCenter(index) {
  if (!Number.isInteger(index) || index<0 || index>=11) return null;
  const p=CAMPUS_MASTERPLAN.park;
  if(index===2)return {x:p.x,z:p.z,angle:0}; // Learning room in the center.
  const outer=[0,1,3,4,5,6,7,8,9,10];
  const slot=outer.indexOf(index);
  if(slot<0)return null;
  // Match wonder-park-world.mjs (physically rotated by PI toward the hall).
  const a=.34+slot*Math.PI*2/10;
  return {x:p.x-54*Math.sin(a),z:p.z-54*Math.cos(a),angle:a};
}

/** Fit a near-vertical perspective camera to ALL map geometry without cropping. */
export function fitAerialBounds({aspect=16/9,verticalFov=66,bounds=CAMPUS_MASTERPLAN.bounds,zoom=1}){
  const width=bounds.xMax-bounds.xMin,height=bounds.zMax-bounds.zMin;
  const fov=Math.max(45,Math.min(88,Number(verticalFov)||66))*Math.PI/180;
  const a=Math.max(.4,Math.min(3.6,Number(aspect)||16/9));
  // Include proportional safety margins for dome height and labels.
  const distance=Math.max(height/(2*Math.tan(fov/2)),width/(2*Math.tan(fov/2)*a))*1.15 + 39;
  return {x:(bounds.xMin+bounds.xMax)/2,z:(bounds.zMin+bounds.zMax)/2,y:Math.max(110,distance)*Math.max(.9,Number(zoom)||1)};
}
