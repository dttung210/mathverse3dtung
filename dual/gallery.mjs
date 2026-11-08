import * as THREE from '/vendor/three.module.js';
import {buildCrystalAtrium,buildCrystalHall} from './crystal-architecture.mjs';
import {createAvatar} from './avatar-r75.mjs';
import {
  GRADES,HUB_RADIUS,ENTRANCE_Z,RETURN_PORTAL,CLASSIFICATION_PODIUM,
  GATE_HALF_WIDTH,SECTOR_HALF,roomWorld,polarPosition,
  gradeForPosition,nearestPortal,restrictPosition,isWalkable,posterDisplaySize
} from './layout-plan.mjs';

export const FAR_RADIUS = 142; // V17: Expanded outer perimeter to 142m for spacious 30 horizontal S-curve rows

export const S_CURVE_ROOM_CONFIG = {
  6: {
    grade: 6,
    total: 43,
    rows: [
      { row: 1, count: 6, startLesson: 1, endLesson: 6, direction: 'left_to_right' },
      { row: 2, count: 7, startLesson: 7, endLesson: 13, direction: 'right_to_left' },
      { row: 3, count: 9, startLesson: 14, endLesson: 22, direction: 'left_to_right' },
      { row: 4, count: 10, startLesson: 23, endLesson: 32, direction: 'right_to_left' },
      { row: 5, count: 11, startLesson: 33, endLesson: 43, direction: 'left_to_right' }
    ],
    returnGate: { side: 'right', afterLesson: 43, r: 130, u: 34 }
  },
  7: {
    grade: 7,
    total: 37,
    rows: [
      { row: 1, count: 5, startLesson: 1, endLesson: 5, direction: 'left_to_right' },
      { row: 2, count: 6, startLesson: 6, endLesson: 11, direction: 'right_to_left' },
      { row: 3, count: 7, startLesson: 12, endLesson: 18, direction: 'left_to_right' },
      { row: 4, count: 9, startLesson: 19, endLesson: 27, direction: 'right_to_left' },
      { row: 5, count: 10, startLesson: 28, endLesson: 37, direction: 'left_to_right' }
    ],
    returnGate: { side: 'right', afterLesson: 37, r: 130, u: 32 }
  },
  8: {
    grade: 8,
    total: 39,
    rows: [
      { row: 1, count: 5, startLesson: 1, endLesson: 5, direction: 'left_to_right' },
      { row: 2, count: 7, startLesson: 6, endLesson: 12, direction: 'right_to_left' },
      { row: 3, count: 8, startLesson: 13, endLesson: 20, direction: 'left_to_right' },
      { row: 4, count: 9, startLesson: 21, endLesson: 29, direction: 'right_to_left' },
      { row: 5, count: 10, startLesson: 30, endLesson: 39, direction: 'left_to_right' }
    ],
    returnGate: { side: 'right', afterLesson: 39, r: 130, u: 32 }
  },
  9: {
    grade: 9,
    total: 32,
    rows: [
      { row: 1, count: 6, startLesson: 1, endLesson: 6, direction: 'left_to_right' },
      { row: 2, count: 7, startLesson: 7, endLesson: 13, direction: 'right_to_left' },
      { row: 3, count: 9, startLesson: 14, endLesson: 22, direction: 'left_to_right' },
      { row: 4, count: 10, startLesson: 23, endLesson: 32, direction: 'right_to_left' }
    ],
    returnGate: { side: 'left', afterLesson: 32, r: 126, u: -34 }
  },
  10: {
    grade: 10,
    total: 27,
    rows: [
      { row: 1, count: 5, startLesson: 1, endLesson: 5, direction: 'left_to_right' },
      { row: 2, count: 6, startLesson: 6, endLesson: 11, direction: 'right_to_left' },
      { row: 3, count: 8, startLesson: 12, endLesson: 19, direction: 'left_to_right' },
      { row: 4, count: 8, startLesson: 20, endLesson: 27, direction: 'right_to_left' }
    ],
    returnGate: { side: 'left', afterLesson: 27, r: 126, u: -28 }
  },
  11: {
    grade: 11,
    total: 33,
    rows: [
      { row: 1, count: 6, startLesson: 1, endLesson: 6, direction: 'left_to_right' },
      { row: 2, count: 8, startLesson: 7, endLesson: 14, direction: 'right_to_left' },
      { row: 3, count: 9, startLesson: 15, endLesson: 23, direction: 'left_to_right' },
      { row: 4, count: 10, startLesson: 24, endLesson: 33, direction: 'right_to_left' }
    ],
    returnGate: { side: 'left', afterLesson: 33, r: 126, u: -34 }
  },
  12: {
    grade: 12,
    total: 19,
    rows: [
      { row: 1, count: 5, startLesson: 1, endLesson: 5, direction: 'left_to_right' },
      { row: 2, count: 6, startLesson: 6, endLesson: 11, direction: 'right_to_left' },
      { row: 3, count: 8, startLesson: 12, endLesson: 19, direction: 'left_to_right' }
    ],
    returnGate: { side: 'right', afterLesson: 19, r: 124, u: 28 }
  }
};

export function getRowRadii(numRows){
  if(numRows === 5) return [62, 78, 94, 110, 126];
  if(numRows === 4) return [64, 83, 102, 122];
  if(numRows === 3) return [68, 94, 120];
  const step = (126 - 62) / Math.max(1, numRows - 1);
  return Array.from({length: numRows}, (_, i) => Math.round(62 + i * step));
}

const ANGLES_DEG = [-148, -99, -49.5, 0, 49.5, 99, 148];

export function planRooms(items){
  return GRADES.map((grade, i) => {
    const lessons = items.filter(it => Number(it.grade) === grade).sort((a, b) => Number(a.number) - Number(b.number));
    const theta = ANGLES_DEG[i] * Math.PI / 180;
    const config = S_CURVE_ROOM_CONFIG[grade];
    const rowRadii = getRowRadii(config.rows.length);

    const blocks = config.rows.map((rowDef, idx) => {
      const r = rowRadii[idx];
      const maxU = r * Math.tan(SECTOR_HALF);
      const pitch = Math.min(5.8, Math.max(4.6, (maxU * 2 - 14) / Math.max(1, rowDef.count)));
      const width = (rowDef.count - 1) * pitch + 4.9;
      return { r, u: 0, width, thickness: 0.44 };
    });

    const gateCfg = config.returnGate;
    const returnGate = {
      grade,
      side: gateCfg.side,
      r: gateCfg.r,
      u: gateCfg.u,
      afterLesson: gateCfg.afterLesson,
      world: roomWorld(theta, gateCfg.r, gateCfg.u)
    };

    return {
      grade,
      theta,
      angleDeg: ANGLES_DEG[i],
      halfAngle: SECTOR_HALF,
      start: HUB_RADIUS,
      end: FAR_RADIUS,
      length: FAR_RADIUS - HUB_RADIUS,
      lessons,
      portal: roomWorld(theta, HUB_RADIUS),
      blocks,
      config,
      rowRadii,
      returnGate
    };
  });
}

export {
  GRADES,HUB_RADIUS,ENTRANCE_Z,RETURN_PORTAL,CLASSIFICATION_PODIUM,
  GATE_HALF_WIDTH,SECTOR_HALF,roomWorld,polarPosition,
  gradeForPosition,nearestPortal,restrictPosition,isWalkable,posterDisplaySize
};

export const GRADE_STYLE={
  6:{accent:0x0d9488,hex:'#14b8a6',title:'SỐ HỌC & HÌNH PHẲNG'},
  7:{accent:0x2563eb,hex:'#3b82f6',title:'SỐ HỮU TỈ & HÌNH HỌC'},
  8:{accent:0xd97706,hex:'#f59e0b',title:'ĐA THỨC & TỨ GIÁC'},
  9:{accent:0xe11d48,hex:'#f43f5e',title:'ĐỒ THỊ & ĐƯỜNG TRÒN'},
  10:{accent:0x7c3aed,hex:'#8b5cf6',title:'VECTƠ & TỌA ĐỘ'},
  11:{accent:0x059669,hex:'#10b981',title:'LƯỢNG GIÁC & GIẢI TÍCH'},
  12:{accent:0xb59342,hex:'#e8c76b',title:'TÍCH PHÂN & KHÔNG GIAN'}
};

export const NPC_PROFILES={
  6:{name:'Bé Tuệ An',title:'Học sinh Tiêu biểu Lớp 6 (Chibi 3D)',avatarType:'an',quote:'Toán 6 là cánh cửa mở ra thế giới số học và hình học trực quan kỳ thú!',greeting:'Chào mừng các bạn đến với Phòng Triển Lãm Toán 6! Tại đây trưng bày 43 bài học Infographic tuyển chọn về Số tự nhiên, Phân số, Số thập phân và Hình học trực quan.'},
  7:{name:'Bạn Minh Triết',title:'Học sinh Giỏi Toán 7 (Chibi 3D)',avatarType:'triet',quote:'Số hữu tỉ và các định lý tam giác bằng nhau chứa đựng vẻ đẹp logic tuyệt vời.',greeting:'Chào mừng bạn đến với Phòng Triển Lãm Toán 7! Chúng mình cùng khám phá 37 bài Infographic sinh động về Tập hợp số hữu tỉ, Số thực, Biểu thức đại số và Hình học tam giác nhé!'},
  8:{name:'Thầy Tùng',title:'Đại sứ Học tập Lớp 8 (Chibi 3D)',avatarType:'alex',quote:'Đa thức, Hằng đẳng thức và Định lý Pythagore là nền tảng của tư duy đại số hiện đại.',greeting:'Chào bạn! Phòng Triển Lãm Toán 8 mang đến 39 bức tranh kiến thức về Hằng đẳng thức đáng nhớ, Phân thức đại số, Tứ giác và Định lý Pythagore.'},
  9:{name:'Sư Học Bá',title:'Tiểu Sư Chùa Thông Thái Lớp 9 (Chibi 3D)',avatarType:'suhocba',quote:'Tĩnh tâm quán chiếu Phương trình bậc hai và Đường tròn để tự tin chinh phục kỳ thi vào 10!',greeting:'A Di Đà Phật! Chào mừng thí chủ đến với Phòng Triển Lãm Toán 9! Tại đây có 32 bài Infographic trọng tâm: Căn bậc hai, Hệ thức Vi-ét, Hệ thức lượng tam giác vuông và Đường tròn.'},
  10:{name:'Robot Bot Pi',title:'Trợ Lý AI Toán 10 (Chibi 3D)',avatarType:'bot',quote:'Bước vào bậc THPT với tư duy Vectơ, Bất phương trình và Hình học giải tích mới mẻ.',greeting:'Chào mừng các bạn đến với Phòng Triển Lãm Toán 10! Tổng hợp 27 bài Infographic chương trình mới về Mệnh đề, Tập hợp, Bất phương trình, Hệ thức lượng và Phương pháp Vectơ.'},
  11:{name:'Bạn Minh Triết',title:'Thành viên CLB Toán 11 (Chibi 3D)',avatarType:'triet',quote:'Lượng giác, Cấp số, Đạo hàm và Hình không gian 11 mở rộng chân trời toán học.',greeting:'Chào bạn! Phòng Triển Lãm Toán 11 trưng bày 33 bài học đồ họa chất lượng cao về Hàm số lượng giác, Dãy số - Cấp số, Giới hạn - Đạo hàm và Hình học không gian.'},
  12:{name:'Thầy Tùng',title:'Hướng Dẫn Viên Sư Phạm Toán 12 (Chibi 3D)',avatarType:'alex',quote:'Đồng hành cùng các em học sinh chinh phục điểm 9+ kỳ thi Tốt nghiệp THPT & Đánh giá năng lực!',greeting:'Chào mừng các em đến với Phòng Triển Lãm Toán 12! Nơi hội tụ 19 Infographic đỉnh cao tổng ôn toàn diện: Khảo sát hàm số, Nguyên hàm - Tích phân, Số phức và Tọa độ Oxyz trong không gian.'}
};

export class InfographicGallery {
  constructor({scene,items,onSelect}){
    this.scene=scene;
    this.plan=planRooms(items);
    this.onSelect=onSelect;
    this.plan.forEach(p=>p.style=GRADE_STYLE[p.grade]);
    this.rooms=new Map();
    this.posters=[];
    this.picked=[];
    this.doorTargets=[];
    this.returnTargets=[];
    this.classificationTargets=[];
    this.roomReturnTargets=[];
    this.roomReturnGates=[];
    this.solid=[];
    this.frameTransforms=[];
    this.frameMeshes=[];
    this.crystalLights=[];
    this.crystalSpinner=null;
    this.npcs=[];
    this.npcTargets=[];
    this.group=new THREE.Group();
    this.group.name='MUSEUM_CIRCULAR_SEVEN_GRADE_HALLS_V17_S_CURVE';
    scene.add(this.group);

    this.loader=new THREE.TextureLoader();
    this.ray=new THREE.Raycaster();
    this.quality='auto';
    this.disposed=false;
    this.thumbnailQueue=[];
    this.thumbnailActive=0;
    this.thumbnailFailures=[];
    this.lastPos=null;
    this.lastGrade=null;

    this.geo={unitBox:new THREE.BoxGeometry(1,1,1),unitPlane:new THREE.PlaneGeometry(1,1)};
    this.mat={
      wall:new THREE.MeshStandardMaterial({color:0xf8fbfb,roughness:.36,metalness:.08,side:THREE.DoubleSide}),
      floor:new THREE.MeshStandardMaterial({color:0xedf7f7,roughness:.16,metalness:.16,side:THREE.DoubleSide}),
      trim:new THREE.MeshStandardMaterial({color:0x0e4250,roughness:.24,metalness:.70}),
      gold:new THREE.MeshStandardMaterial({color:0xe7c17c,roughness:.18,metalness:.82}),
      ceiling:new THREE.MeshStandardMaterial({color:0xf4faf8,roughness:.36,metalness:.09,side:THREE.DoubleSide}),
      light:new THREE.MeshBasicMaterial({color:0xffe9b0,toneMapped:false}),
      glass:new THREE.MeshStandardMaterial({color:0xb3f0f3,metalness:.10,roughness:.07,transparent:true,opacity:.32,depthWrite:false,side:THREE.DoubleSide})
    };
    this.textures=[];this.extraMaterials=[];this.extraGeometries=[];

    this.buildAtrium();
    for(const info of this.plan) this.buildRoom(info);
    this.finalizeFrameInstances();
    this.streamThumbnails();
    this.tick({x:0,z:ENTRANCE_Z});
  }

  box(group,w,h,d,x,y,z,material,rotY=0){
    const mesh=new THREE.Mesh(this.geo.unitBox,material);
    mesh.scale.set(w,h,d);mesh.position.set(x,y,z);mesh.rotation.y=rotY;group.add(mesh);return mesh;
  }

  stripBetween(group,a,b,height,material,thick=.24){
    const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);
    const wall=this.box(group,len,height,thick,(a.x+b.x)/2,height/2,(a.z+b.z)/2,material,-Math.atan2(dz,dx));
    this.solid.push(wall);return wall;
  }

  quad(group,pts,y,material){
    const g=new THREE.BufferGeometry();
    const coords=pts.flatMap(p=>[p.x,y,p.z]);
    g.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));
    g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();
    const m=new THREE.Mesh(g,material);group.add(m);this.extraGeometries.push(g);return m;
  }

  label(group,text,width=8,height=.8,accent='#d4af37',x=0,y=0,z=0,yaw=0){
    const c=document.createElement('canvas');const small=text.startsWith('BAI ')||text.startsWith('BÀI ');c.width=small?640:1280;c.height=small?128:256;const ctx=c.getContext('2d');
    if(ctx){
      if('imageSmoothingQuality' in ctx)ctx.imageSmoothingQuality='high';
      ctx.fillStyle='#122438';ctx.fillRect(0,0,c.width,c.height);
      ctx.strokeStyle=accent;ctx.lineWidth=small?6:12;ctx.strokeRect(6,6,c.width-12,c.height-12);
      ctx.fillStyle='#fff9e8';ctx.font=`bold ${small?56:92}px "Segoe UI",Arial,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,c.width/2,c.height/2,c.width-28);
    }
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;this.textures.push(tex);
    const mat=new THREE.MeshBasicMaterial({map:tex,toneMapped:false,side:THREE.FrontSide});this.extraMaterials.push(mat);
    const obj=new THREE.Mesh(this.geo.unitPlane,mat);obj.scale.set(width,height,1);obj.position.set(x,y,z);obj.rotation.y=yaw;group.add(obj);
    const back=new THREE.Mesh(this.geo.unitPlane,mat);back.rotation.y=Math.PI;back.position.z=-0.012;obj.add(back);
    return obj;
  }

  makeAccent(grade){
    const v=GRADE_STYLE[grade];const mat=new THREE.MeshStandardMaterial({color:v.accent,roughness:.30,metalness:.55,emissive:v.accent,emissiveIntensity:.12});this.extraMaterials.push(mat);return mat;
  }

  makeGradeFloor(grade,lightness=.28){
    const v=GRADE_STYLE[grade];
    const col=new THREE.Color(v.accent);
    col.lerp(new THREE.Color(0xffffff),.22);
    const mat=new THREE.MeshStandardMaterial({color:col,roughness:.24,metalness:.20,side:THREE.DoubleSide});
    this.extraMaterials.push(mat);
    return mat;
  }

  makeGradeWall(grade,lightness=.42){
    const tint=new THREE.Color(GRADE_STYLE[grade].accent);
    tint.lerp(new THREE.Color(0xf6faf8),lightness);
    const mat=new THREE.MeshStandardMaterial({color:tint,roughness:.42,metalness:.08,side:THREE.DoubleSide});
    this.extraMaterials.push(mat);return mat;
  }

  makeGradePanel(grade,lightness=.62){
    const tint=new THREE.Color(GRADE_STYLE[grade].accent);
    tint.lerp(new THREE.Color(0xfcfdfa),lightness);
    const mat=new THREE.MeshStandardMaterial({color:tint,roughness:.36,metalness:.12,side:THREE.DoubleSide});
    this.extraMaterials.push(mat);return mat;
  }

  buildAtrium(){
    const group=new THREE.Group();group.name='SEVEN_VISIBLE_CLASS_ENTRANCES';
    this.group.add(group);this.atrium=group;
    buildCrystalAtrium(this,group,this.plan);
  }

  finalizeFrameInstances(){
    const count=this.frameTransforms.length;
    const outer=new THREE.InstancedMesh(this.geo.unitBox,this.mat.gold,count);
    const inner=new THREE.InstancedMesh(this.geo.unitBox,this.mat.trim,count);
    outer.name='CRYSTAL_GOLD_FRAMES_INSTANCED';
    inner.name='CRYSTAL_POSTER_BACKINGS_INSTANCED';
    const dummy=new THREE.Object3D();
    this.frameTransforms.forEach(({x,y,z,rotation,w,h},i)=>{
      dummy.position.set(x,y,z);dummy.rotation.set(0,rotation,0);
      dummy.scale.set(w+.28,h+.31,.14);dummy.updateMatrix();outer.setMatrixAt(i,dummy.matrix);
      const front=new THREE.Vector3(0,0,.095).applyAxisAngle(new THREE.Vector3(0,1,0),rotation);
      dummy.position.set(x+front.x,y,z+front.z);
      dummy.scale.set(w+.095,h+.11,.045);dummy.updateMatrix();inner.setMatrixAt(i,dummy.matrix);
    });
    outer.instanceMatrix.needsUpdate=true;inner.instanceMatrix.needsUpdate=true;
    this.group.add(outer,inner);this.frameMeshes=[outer,inner];
  }

  makePoster(holder,item,slot,room){
    const group=new THREE.Group();group.name=`G${item.grade}-B${item.number}`;
    const rot=Math.atan2(slot.nx,slot.nz);
    // PA1: Vòng Cung Khán Đài Đồng Tâm Đa Tầng — nâng nhẹ cao độ theo vòng cung hàng (0% che khuất tầm nhìn)
    const tierLift=((slot.row||1)-1)*0.32;
    const posterY=4.1+tierLift;
    group.position.set(slot.x,posterY,slot.z);group.rotation.y=rot;holder.add(group);

    const {w,h}=posterDisplaySize(Number(item.aspect));
    this.frameTransforms.push({x:slot.x,y:posterY,z:slot.z,rotation:rot,w,h});
    const mat=new THREE.MeshBasicMaterial({color:0xd3e7e7,side:THREE.FrontSide,toneMapped:false});
    this.extraMaterials.push(mat);
    const pic=new THREE.Mesh(this.geo.unitPlane,mat);
    pic.scale.set(w,h,1);pic.position.z=.14;pic.userData.lesson=item;
    group.add(pic);this.picked.push(pic);
    const picBack=new THREE.Mesh(this.geo.unitPlane,mat);
    picBack.scale.set(w,h,1);picBack.position.z=-.08;picBack.rotation.y=Math.PI;picBack.userData.lesson=item;
    group.add(picBack);this.picked.push(picBack);

    this.box(group,.06,.42,.26,0,h/2+.22,.26,this.mat.gold);
    const spotHead=new THREE.Mesh(new THREE.CylinderGeometry(.10,.16,.18,12),this.mat.gold);
    spotHead.position.set(0,h/2+.36,.36);spotHead.rotation.x=Math.PI*.35;group.add(spotHead);
    const spotBulb=new THREE.Mesh(new THREE.OctahedronGeometry(.10,0),new THREE.MeshBasicMaterial({color:0xfff1cc,toneMapped:false}));
    spotBulb.position.set(0,h/2+.31,.38);group.add(spotBulb);

    const labelW=Math.min(4.8,Math.max(3.2,w*.85));
    this.box(group,labelW+.12,.48,.08,0,-h/2-.46,.12,room.accent);
    this.box(group,labelW+.04,.42,.09,0,-h/2-.46,.13,this.mat.gold);
    const cleanTitle=item.title.replace(/^bài\s*\d+[\.\:\-\s]*/i,'').trim();
    const shortTitle=cleanTitle.length>22?cleanTitle.slice(0,20)+'…':cleanTitle;
    this.label(group,`BÀI ${item.number} · ${shortTitle}`,labelW-.08,.38,'#ffffff',0,-h/2-.46,.201);
    this.label(group,`BÀI ${item.number} · ${shortTitle}`,labelW-.08,.38,'#ffffff',0,-h/2-.46,.065,Math.PI);

    const p={item,group,mat,pic,x:slot.x,z:slot.z,slotKind:slot.kind,routeDepth:slot.depth,displayOrder:slot.displayOrder,nx:slot.nx,nz:slot.nz,texture:null,thumb:null,thumbLoading:false,loading:false,wanted:false,room,w,h};
    this.thumbnailQueue.push(p);
    room.posters.push(p);this.posters.push(p);return p;
  }

  createSlots(info){
    const {theta,config,rowRadii,lessons}=info;
    const selected=[];
    const panels=[];
    let currentLessonIdx=0;

    for(let rIdx=0; rIdx<config.rows.length; rIdx++){
      const rowDef=config.rows[rIdx];
      const r=rowRadii[rIdx];
      const count=rowDef.count;
      const isLtoR=rowDef.direction==='left_to_right';

      const maxU=r*Math.tan(SECTOR_HALF);
      const pitch=Math.min(5.8,Math.max(4.6,(maxU*2-14)/Math.max(1,count)));
      const span=(count-1)*pitch;
      const startU=-span/2;

      const nx=-Math.sin(theta);
      const nz=Math.cos(theta);

      const rowSlots=[];
      for(let j=0; j<count; j++){
        const u=startU+j*pitch;
        const pos=roomWorld(theta,r,u);
        rowSlots.push({
          x:pos.x+nx*0.22,
          z:pos.z+nz*0.22,
          nx,nz,
          depth:r,
          lateral:u,
          row:rowDef.row,
          dir:rowDef.direction,
          kind:'row_panel'
        });
      }

      const orderedSlots=isLtoR?rowSlots:rowSlots.slice().reverse();

      orderedSlots.forEach((slot)=>{
        slot.displayOrder=currentLessonIdx+1;
        selected.push(slot);
        currentLessonIdx++;
      });

      const panelWidth=span+4.9;
      panels.push({
        id:`R${rowDef.row}_${r}`,
        row:rowDef.row,
        r,
        u:0,
        width:panelWidth,
        thickness:0.44,
        count,
        direction:rowDef.direction,
        startLesson:rowDef.startLesson,
        endLesson:rowDef.endLesson,
        world:roomWorld(theta,r,0)
      });
    }

    if(selected.length!==lessons.length){
      throw new Error(`Lesson count mismatch in Grade ${info.grade}: expected ${lessons.length}, got ${selected.length}`);
    }

    return {selected,panels};
  }

  fanMesh(group,info,y,material){
    const steps=48,pos=[],indices=[];
    for(let i=0;i<=steps;i++){
      const a=info.theta-info.halfAngle+2*info.halfAngle*i/steps;
      for(const r of [HUB_RADIUS-.6,FAR_RADIUS+.16]){
        const p=roomWorld(a,r);pos.push(p.x,y,p.z);
      }
      if(i<steps){const n=i*2;indices.push(n,n+1,n+3,n,n+3,n+2);}
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    geometry.setIndex(indices);geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,material);group.add(mesh);this.extraGeometries.push(geometry);
    return mesh;
  }

  buildRoomNpc(group,info,room){
    const profile=NPC_PROFILES[info.grade];
    if(!profile)return;
    const npcPos=roomWorld(info.theta,HUB_RADIUS-4.5,4.8);
    const facingYaw=Math.atan2(-npcPos.x,-npcPos.z);

    const podiumGeo=new THREE.CylinderGeometry(1.6,1.75,.36,32);
    const rimGeo=new THREE.CylinderGeometry(1.78,1.78,.08,32);
    this.extraGeometries.push(podiumGeo,rimGeo);
    const podium=new THREE.Mesh(podiumGeo,this.mat.trim);
    podium.position.set(npcPos.x,.18,npcPos.z);
    podium.rotation.y=facingYaw;
    group.add(podium);

    const rim=new THREE.Mesh(rimGeo,this.mat.gold);
    rim.position.set(npcPos.x,.38,npcPos.z);
    rim.rotation.y=facingYaw;
    group.add(rim);

    const ringGeo=new THREE.RingGeometry(1.2,1.55,36);
    const ringMat=new THREE.MeshBasicMaterial({color:info.style.accent,side:THREE.DoubleSide,transparent:true,opacity:.72});
    this.extraGeometries.push(ringGeo);this.extraMaterials.push(ringMat);
    const ring=new THREE.Mesh(ringGeo,ringMat);
    ring.rotation.x=-Math.PI/2;
    ring.position.set(npcPos.x,.43,npcPos.z);
    group.add(ring);

    const avatar=createAvatar(profile.avatarType);
    avatar.root.scale.setScalar(1.95);
    avatar.root.position.set(npcPos.x,.42,npcPos.z);
    avatar.body.rotation.y=facingYaw;
    group.add(avatar.root);

    this.label(group,`${profile.name} · TOÁN ${info.grade}`,4.6,.55,info.style.hex,npcPos.x,4.45,npcPos.z,facingYaw);

    const hitGeo=new THREE.BoxGeometry(2.6,4.2,2.6);
    const hitMat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});
    this.extraGeometries.push(hitGeo);this.extraMaterials.push(hitMat);
    const hit=new THREE.Mesh(hitGeo,hitMat);
    hit.position.set(npcPos.x,2.2,npcPos.z);
    hit.userData.npcGrade=info.grade;
    group.add(hit);
    this.npcTargets.push(hit);

    this.npcs.push({grade:info.grade,profile,avatar,position:npcPos,hitMesh:hit,ring});
  }

  buildRoomReturnGate(group,info,room){
    const gateCfg=info.returnGate;
    const gatePos=gateCfg.world;
    const gateGroup=new THREE.Group();
    gateGroup.name=`CLASS_${info.grade}_PURPLE_RETURN_GATE`;
    const inwardYaw=-info.theta+(gateCfg.side==='right'?-0.32:0.32);
    gateGroup.position.set(gatePos.x,0,gatePos.z);
    gateGroup.rotation.y=inwardYaw;
    group.add(gateGroup);

    const purpleCrystal=new THREE.MeshStandardMaterial({
      color:0x7c3aed,roughness:.20,metalness:.68,emissive:0x5b21b6,emissiveIntensity:.42
    });
    const purpleGlow=new THREE.MeshBasicMaterial({color:0xc084fc,toneMapped:false});
    const lilacAura=new THREE.MeshBasicMaterial({color:0xa855f7,transparent:true,opacity:.78,side:THREE.DoubleSide});
    this.extraMaterials.push(purpleCrystal,purpleGlow,lilacAura);

    for(const side of [-2.4, 2.4]){
      this.box(gateGroup,.52,5.6,.52,side,2.8,0,purpleCrystal);
      this.box(gateGroup,.72,.34,.72,side,.17,0,this.mat.gold);
      this.box(gateGroup,.68,.28,.68,side,5.6,0,this.mat.gold);
      this.box(gateGroup,.12,4.8,.12,side,2.8,.28,purpleGlow);
    }

    this.box(gateGroup,5.4,.48,.56,0,5.75,0,purpleCrystal);
    this.box(gateGroup,5.6,.12,.62,0,6.05,0,this.mat.gold);

    const gemGeo=new THREE.OctahedronGeometry(.72,0);
    this.extraGeometries.push(gemGeo);
    const gem=new THREE.Mesh(gemGeo,purpleGlow);
    gem.position.set(0,6.7,0);
    gem.rotation.y=Math.PI/4;
    gateGroup.add(gem);
    const gemWire=new THREE.LineSegments(new THREE.EdgesGeometry(gemGeo),new THREE.LineBasicMaterial({color:0xffffff}));
    this.extraGeometries.push(gemWire.geometry);this.extraMaterials.push(gemWire.material);
    gem.add(gemWire);

    const basePodium=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.5,.18,32),this.mat.trim);
    basePodium.position.y=.09;
    gateGroup.add(basePodium);
    const floorRing=new THREE.Mesh(new THREE.RingGeometry(1.4,2.2,36),lilacAura);
    floorRing.rotation.x=-Math.PI/2;
    floorRing.position.y=.19;
    gateGroup.add(floorRing);

    this.label(gateGroup,'HOÀN THÀNH THAM QUAN – VỀ SẢNH TRUNG TÂM',10.8,.92,'#c084fc',0,5.85,.32,0);
    this.label(gateGroup,'✦ NHẤN PHÍM E HOẶC NHẤP CHUỘT ĐỂ VỀ BỤC TRA CỨU ✦',8.4,.46,'#ffd866',0,5.15,.32,0);

    const hitGeo=new THREE.BoxGeometry(5.4,6.2,3.6);
    const hitMat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});
    this.extraGeometries.push(hitGeo);this.extraMaterials.push(hitMat);
    const hitMesh=new THREE.Mesh(hitGeo,hitMat);
    hitMesh.position.set(gatePos.x,3.1,gatePos.z);
    hitMesh.userData.isRoomReturnGate=true;
    hitMesh.userData.gateGrade=info.grade;
    group.add(hitMesh);
    this.roomReturnTargets.push(hitMesh);

    const gateRecord={
      grade:info.grade,
      position:gatePos,
      world:gatePos,
      hitMesh,
      auraRing:floorRing,
      gem,
      info
    };
    this.roomReturnGates.push(gateRecord);
    room.returnGate=gateRecord;
  }

  addRoomSequenceGuide(group,info,room){
    const at=roomWorld(info.theta,HUB_RADIUS+11.5,0);
    const title=`LỚP ${info.grade} · LỘ TRÌNH CHỮ S: BÀI 1 → BÀI ${info.lessons.at(-1).number} · CỬA VỀ Ở CUỐI BÀI`;
    const sign=this.label(group,title,13.8,.78,info.style.hex,at.x,8.45,at.z,-info.theta);
    sign.name=`CLASS_${info.grade}_LESSON_SEQUENCE_B1_TO_B${info.lessons.at(-1).number}`;
  }

  buildRoom(info){
    const group=new THREE.Group();group.name=`GRAND_FAN_HALL_TOAN_${info.grade}`;this.group.add(group);
    const room={
      info,
      group,
      accent:this.makeAccent(info.grade),
      wall:this.makeGradeWall(info.grade,.42),
      floor:this.makeGradeFloor(info.grade,.28),
      panelMaterial:this.makeGradePanel(info.grade,.62),
      posters:[],
      panels:[],
      blocks:[]
    };
    this.rooms.set(info.grade,room);

    const a=roomWorld(info.theta-info.halfAngle,HUB_RADIUS),b=roomWorld(info.theta+info.halfAngle,HUB_RADIUS);
    const c=roomWorld(info.theta+info.halfAngle,FAR_RADIUS),d=roomWorld(info.theta-info.halfAngle,FAR_RADIUS);

    this.fanMesh(group,info,-.018,room.floor);
    this.fanMesh(group,info,9.35,this.mat.glass);

    this.stripBetween(group,a,d,9.34,room.wall,.32);
    this.stripBetween(group,b,c,9.34,room.wall,.32);

    for(let i=0;i<28;i++){
      const start=info.theta-info.halfAngle+2*info.halfAngle*i/28;
      const end=info.theta-info.halfAngle+2*info.halfAngle*(i+1)/28;
      this.stripBetween(group,roomWorld(start,FAR_RADIUS),roomWorld(end,FAR_RADIUS),9.34,room.wall,.32);
    }

    const la=roomWorld(info.theta,HUB_RADIUS,-GATE_HALF_WIDTH);
    const ra=roomWorld(info.theta,HUB_RADIUS,GATE_HALF_WIDTH);
    this.stripBetween(group,a,la,9.34,room.wall,.28);
    this.stripBetween(group,ra,b,9.34,room.wall,.28);

    this.buildRoomNpc(group,info,room);

    const lampGeo=new THREE.BoxGeometry(3.7,.045,.32);this.extraGeometries.push(lampGeo);
    const lamps=new THREE.InstancedMesh(lampGeo,this.mat.light,64);let count=0;
    const dummy=new THREE.Object3D();dummy.rotation.y=-info.theta;
    for(const r of [58,74,90,106,122,136])for(const u of [-24,-12,0,12,24]){
      const v=roomWorld(info.theta,r,u);dummy.position.set(v.x,9.0,v.z);dummy.updateMatrix();lamps.setMatrixAt(count++,dummy.matrix);
    }
    lamps.count=count;lamps.instanceMatrix.needsUpdate=true;group.add(lamps);room.lamps=lamps;

    const {selected,panels}=this.createSlots(info);

    const mathReliefTitles={
      6:['SỐ NGUYÊN TỐ & ƯỚC SỐ','TỶ LỆ VÀNG FIBONACCI','HÌNH HỌC TRỰC QUAN'],
      7:['TẬP HỢP SỐ HỮU TỈ ℚ','TAM GIÁC BẰNG NHAU','ĐỊNH LÝ PYTHAGORE'],
      8:['HẰNG ĐẲNG THỨC ĐÁNG NHỚ','PHÂN THỨC ĐẠI SỐ','TỨ GIÁC NỘI TIẾP'],
      9:['PHƯƠNG TRÌNH BẬC HAI','HỆ THỨC LƯỢNG & VI-ÉT','ĐƯỜNG TRÒN TIẾP XÚC'],
      10:['MỆNH ĐỀ & TẬP HỢP','PHƯƠNG PHÁP VECTƠ','HỆ BẤT PHƯƠNG TRÌNH'],
      11:['HÀM SỐ LƯỢNG GIÁC','CẤP SỐ & ĐẠO HÀM','HÌNH HỌC KHÔNG GIAN'],
      12:['KHẢO SÁT HÀM SỐ','NGUYÊN HÀM & TÍCH PHÂN ∫','TỌA ĐỘ OXYZ KHÔNG GIAN']
    };
    const reliefs=mathReliefTitles[info.grade]||['KIẾN THỨC TRỌNG TÂM','MÔ HÌNH TOÁN HỌC','VẺ ĐẸP LOGIC'];

    for(let rIdx=0; rIdx<panels.length; rIdx++){
      const data=panels[rIdx];
      // PA1: Vòng Cung Khán Đài Đồng Tâm Đa Tầng — bậc thềm khán đài nâng dần theo từng vòng
      const tierLift=rIdx*0.32;
      const panelH=7.10+tierLift;
      // Transverse row partition walls run across the sector: rotation is -info.theta
      const panel=this.box(group,data.width,panelH,.38,data.world.x,panelH/2,data.world.z,
        room.panelMaterial,-info.theta);
      panel.name=`CLASS_${info.grade}_ROW_${data.row}_PARTITION`;

      const rim=this.box(group,data.width,.12,.42,data.world.x,panelH+.06,data.world.z,this.mat.gold,-info.theta);
      const base=this.box(group,data.width,.32+tierLift,.54,data.world.x,(.32+tierLift)/2,data.world.z,room.accent,-info.theta);

      const nxBack=Math.sin(info.theta);
      const nzBack=-Math.cos(info.theta);
      const backDist=.20;
      const bX=data.world.x+nxBack*backDist;
      const bZ=data.world.z+nzBack*backDist;
      const backRot=-info.theta;

      this.box(group,data.width-.4,.10,.06,bX,6.4,bZ,this.mat.gold,-info.theta);
      this.box(group,data.width-.4,.10,.06,bX,.8,bZ,this.mat.gold,-info.theta);
      this.box(group,data.width-.2,.18,.05,bX,3.6,bZ,room.accent,-info.theta);

      const reliefPlaqueText=`${reliefs[rIdx%reliefs.length]} · HÀNG ${data.row}`;
      this.label(group,reliefPlaqueText,Math.min(9.2,data.width*.75),.68,info.style.hex,bX+nxBack*.04,3.6,bZ+nzBack*.04,Math.PI-info.theta);

      room.panels.push({panel,rim,base,id:data.id});
      room.blocks.push({r:data.r,u:data.u,width:data.width,thickness:data.thickness});
      this.solid.push(panel);

      const aisleR=data.r-3.2;
      const aislePos=roomWorld(info.theta,aisleR,0);
      const carpetRunner=this.box(group,data.width,0.024,2.8,aislePos.x,.026,aislePos.z,room.accent,-info.theta);
      carpetRunner.name=`CLASS_${info.grade}_ROW_${data.row}_AISLE_CARPET`;
      this.box(group,data.width,0.028,0.06,aislePos.x,0.028,aislePos.z,this.mat.gold,-info.theta);

      if(rIdx<panels.length-1){
        const nextR=panels[rIdx+1].r;
        const turnR=(data.r+nextR)/2;
        const turnLength=nextR-data.r;
        const turnSide=data.direction==='left_to_right'?1:-1;
        const turnU=turnSide*(data.width/2+1.4);
        const turnPos=roomWorld(info.theta,turnR,turnU);
        this.box(group,turnLength+2.2,0.024,2.8,turnPos.x,0.026,turnPos.z,room.accent,Math.PI/2-info.theta);
        this.box(group,turnLength+2.2,0.028,0.06,turnPos.x,0.028,turnPos.z,this.mat.gold,Math.PI/2-info.theta);
      }
    }

    info.blocks=room.blocks;
    buildCrystalHall(this,room);

    selected.forEach((slot,index)=>this.makePoster(group,info.lessons[index],slot,room));

    this.buildRoomReturnGate(group,info,room);

    room.posters.sort((a,b)=>a.item.number-b.item.number);
    this.addRoomSequenceGuide(group,info,room);
  }

  ensureNearby(position){
    const grade=gradeForPosition(this.plan,position);
    const r=Math.hypot(position.x,position.z);
    // Sector-cull distant grade rooms when the player is deep inside a specific grade wing (r > HUB_RADIUS + 4.5)
    // When in the central Atrium (r <= HUB_RADIUS + 4.5), keep all 7 wings visible so all 7 doorways are visible
    if(r>HUB_RADIUS+4.5 && grade){
      for(const [g,roomObj] of this.rooms.entries()){
        if(roomObj?.group)roomObj.group.visible=(Math.abs(g-grade)<=1)||(g===6&&grade===12)||(g===12&&grade===6);
      }
    }else if(this.lastGrade!==null){
      for(const roomObj of this.rooms.values()){
        if(roomObj?.group&&!roomObj.group.visible)roomObj.group.visible=true;
      }
    }
    this.lastGrade=grade;
    return grade;
  }

  streamThumbnails(){
    if(this.disposed)return;
    while(this.thumbnailActive<5&&this.thumbnailQueue.length){
      const p=this.thumbnailQueue.shift();if(!p||p.thumb||p.thumbLoading)continue;
      this.thumbnailActive++;p.thumbLoading=true;
      const src=p.item.src.replace('/museum-assets/','/museum-thumbs/');
      const finish=()=>{this.thumbnailActive--;p.thumbLoading=false;this.streamThumbnails();};
      this.loader.load(src,tex=>{
        if(this.disposed){tex.dispose();finish();return;}
        tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=2;
        p.thumb=tex;
        if(!p.texture){p.mat.map=tex;p.mat.color.set(0xffffff);p.mat.needsUpdate=true;}
        finish();
      },undefined,()=>{
        this.thumbnailFailures.push(src);
        p.mat.color.set(0xe9ca81);p.mat.needsUpdate=true;finish();
      });
    }
  }

  updateTextures(position){
    const grade=gradeForPosition(this.plan,position),near=[];
    if(grade){
      for(const p of this.posters){
        if(p.item.grade!==grade)continue;
        const distance=Math.hypot(p.x-position.x,p.z-position.z);
        if(distance<22)near.push({p,distance});
      }
    }
    near.sort((a,b)=>a.distance-b.distance);
    const cap=this.quality==='eco'?4:this.quality==='high'?12:8;
    const wanted=new Set(near.slice(0,cap).map(e=>e.p));
    for(const p of this.posters){
      p.wanted=wanted.has(p);
      if(!p.wanted&&p.texture){
        p.mat.map=p.thumb||null;p.mat.color.set(p.thumb?0xffffff:0xd3e7e7);
        p.texture.dispose();p.texture=null;p.mat.needsUpdate=true;
      }
    }
    for(const p of wanted){
      if(p.texture||p.loading)continue;
      p.loading=true;
      this.loader.load(p.item.src,tex=>{
        p.loading=false;
        if(this.disposed||!p.wanted){tex.dispose();return;}
        tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
        p.texture=tex;p.mat.map=tex;p.mat.color.set(0xffffff);p.mat.needsUpdate=true;
      },undefined,()=>{p.loading=false;this.thumbnailFailures.push(p.item.src);});
    }
  }

  setAerialRoofVisibility(isAerial){
    this.mat.glass.opacity=isAerial?.055:.32;
    this.mat.glass.needsUpdate=true;
  }

  setQuality(q){
    this.quality=q;this.lastPos=null;
    if(this.crystalLights)for(const l of this.crystalLights)l.intensity=q==='eco'?.9:q==='high'?2.5:1.7;
  }

  tick(position, dt = 0.016){
    this.ensureNearby(position);
    if(!this.lastPos||Math.hypot(position.x-this.lastPos.x,position.z-this.lastPos.z)>1.4){
      this.lastPos={...position};this.updateTextures(position);
    }
    if(this.crystalSpinner)this.crystalSpinner.rotation.y+=.0004;
    for(const npc of this.npcs){
      npc.avatar?.updateAnimation(dt, 0, 0, 0, 0, 0);
      if(npc.ring) npc.ring.rotation.z += 0.015;
    }
    for(const gate of this.roomReturnGates){
      if(gate.gem) gate.gem.rotation.y += 0.02;
      if(gate.auraRing) gate.auraRing.rotation.z += 0.018;
    }
    const grade=gradeForPosition(this.plan,position);
    return grade?this.plan.find(p=>p.grade===grade):null;
  }

  nearNpc(position, maxDistance = 4.8){
    for(const npc of this.npcs){
      const d = Math.hypot(position.x - npc.position.x, position.z - npc.position.z);
      if(d <= maxDistance) return npc;
    }
    return null;
  }

  clickNpc(pointer, camera){
    this.ray.setFromCamera(pointer, camera);
    const hits = this.ray.intersectObjects(this.npcTargets, false);
    if(hits.length > 0){
      const grade = hits[0].object.userData.npcGrade;
      return this.npcs.find(n => n.grade === grade) || null;
    }
    return null;
  }

  nearRoomReturnGate(position, maxDistance = 4.8){
    for(const gate of this.roomReturnGates){
      const d = Math.hypot(position.x - gate.position.x, position.z - gate.position.z);
      if(d <= maxDistance) return gate;
    }
    return null;
  }

  clickRoomReturnGate(pointer, camera){
    this.ray.setFromCamera(pointer, camera);
    const hits = this.ray.intersectObjects(this.roomReturnTargets, false);
    if(hits.length > 0){
      const grade = hits[0].object.userData.gateGrade;
      return this.roomReturnGates.find(g => g.grade === grade) || null;
    }
    return null;
  }

  closestPoster(position,maxDistance=3.8){
    let best=null,d=maxDistance;
    for(const p of this.posters){
      const dx=position.x-p.x,dz=position.z-p.z;
      const m=Math.hypot(dx,dz);
      if(m<d && dx*p.nx+dz*p.nz>-.15){best=p;d=m;}
    }
    return best;
  }

  nearestDoor(position){return nearestPortal(this.plan,position,9.0);}
  nearReturn(position){return Math.hypot(position.x-RETURN_PORTAL.x,position.z-RETURN_PORTAL.z)<5.8;}

  clickReturnPortalToLobby(pointer,camera){
    this.ray.setFromCamera(pointer,camera);
    return this.ray.intersectObjects(this.returnTargets,false).length>0;
  }

  clickClassification(pointer,camera){
    this.ray.setFromCamera(pointer,camera);
    const hits=this.ray.intersectObjects(this.classificationTargets,false);
    return hits[0]?.object?.userData?.catalogAll?'all':hits[0]?.object?.userData?.catalogGrade||null;
  }

  nearClassification(position,maxDistance=9.5){
    return Math.hypot(position.x-CLASSIFICATION_PODIUM.x,position.z-CLASSIFICATION_PODIUM.z)<maxDistance;
  }

  clickDoorToEnter(pointer,camera){
    this.ray.setFromCamera(pointer,camera);
    const hit=this.ray.intersectObjects(this.doorTargets,false)[0];
    return hit?.object?.userData?.grade||null;
  }

  clickToSelect(pointer,camera){
    this.ray.setFromCamera(pointer,camera);
    const hit=this.ray.intersectObjects(this.picked,false)[0];
    if(!hit||!hit.object.userData.lesson)return false;
    const blocker=this.ray.intersectObjects(this.solid,false)[0];
    if(blocker && blocker.distance+.02<hit.distance)return false;
    this.onSelect(hit.object.userData.lesson);return true;
  }

  getViewingSpot(poster){
    const room=this.plan.find(r=>r.grade===poster.item.grade);
    const dist=3.6;
    const spot={x:poster.x+poster.nx*dist,z:poster.z+poster.nz*dist};
    return {...spot,yaw:room.theta};
  }

  safeCameraPosition(target,desired){
    if(this._lastSafeCam &&
       Math.abs(target.x-this._lastSafeTarget.x)<0.03 &&
       Math.abs(target.z-this._lastSafeTarget.z)<0.03 &&
       Math.abs(desired.x-this._lastSafeDesired.x)<0.03 &&
       Math.abs(desired.z-this._lastSafeDesired.z)<0.03){
      return this._lastSafeCam;
    }
    const from=new THREE.Vector3(target.x,target.y,target.z);
    const to=new THREE.Vector3(desired.x,desired.y,desired.z);
    const delta=to.clone().sub(from);const length=delta.length();
    if(length<.1)return desired;
    this.ray.set(from,delta.normalize());this.ray.far=length;
    const hits=this.ray.intersectObjects(this.solid,false);
    let out=desired;
    if(hits.length&&hits[0].distance<length-.32){
      const safe=Math.max(.9,hits[0].distance-.38);
      out=from.addScaledVector(delta,safe);
    }
    this._lastSafeTarget={x:target.x,z:target.z};
    this._lastSafeDesired={x:desired.x,z:desired.z};
    this._lastSafeCam=out;
    return out;
  }

  gotoGrade(grade){
    const p=this.plan.find(p=>p.grade===Number(grade));
    return p?roomWorld(p.theta,HUB_RADIUS+6.6):{x:0,z:ENTRANCE_Z};
  }

  getPlan(){return this.plan;}

  dispose(){
    this.disposed=true;this.thumbnailQueue.length=0;
    for(const p of this.posters){
      p.wanted=false;
      if(p.texture)p.texture.dispose();
      if(p.thumb)p.thumb.dispose();
      p.mat.map=null;
    }
    for(const t of this.textures)t.dispose();
    for(const m of this.extraMaterials)m.dispose();
    for(const g of this.extraGeometries)g.dispose();
    for(const g of Object.values(this.geo))g.dispose();
    for(const m of Object.values(this.mat))m.dispose();
    for(const mesh of this.frameMeshes)mesh.dispose();
    for(const room of this.rooms.values())room.lamps?.dispose();
    this.group.removeFromParent();
    this.rooms.clear();
    this.solid.length=0;
    this.picked.length=0;
    this.doorTargets.length=0;
    this.returnTargets.length=0;
    this.classificationTargets.length=0;
    this.roomReturnTargets.length=0;
    this.roomReturnGates.length=0;
    this.posters.length=0;
    this.npcs.length=0;
    this.npcTargets.length=0;
  }
}
