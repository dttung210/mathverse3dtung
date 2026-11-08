/**
 * MATHVERSE R7.3 – GATE OPENS DIRECTLY ONTO ITS MODELS
 * 34 enlarged 3D thematic rooms; inside each room every curriculum Lab is a
 * separate, labelled zone of 3D pedestals (76 zones, 310 pedestals in total).
 * No intermediate Lab door has to be clicked to see the models.
 * The mathematical modes remain in the shared SGK 6–12 warehouse.
 */
import * as THREE from '/mathverse3dtung/vendor/three.module.js?v=r107_v15';
import {disposeObject} from '../geometry.js?v=r107_v15';
import {getRoomsForGrade,getRoomById} from './r6-room-layout.js?v=r107_v15';
import {getLabDoorsForRoom} from './r68-unified-labs.mjs?v=r107_v15';
import {planR71ExpandedRoom,r71Contains,r71Clamp} from './r71-expanded-room-plan.mjs?v=r107_v15';
import {ROOMS} from '../museum.js?v=r107_v15';
import {getUnifiedLabById} from './r68-unified-labs.mjs?v=r107_v15';
import {createModeExhibit} from './r67-mode-exhibits.mjs?v=r107_v15';
import {planR73RoomGallery} from './r73-room-gallery-plan.mjs?v=r107_v15';
import {getNewFoldNetExhibitsForRoom} from './fold-net/index.mjs?v=r107_v15';

const R73_ZONE_TINTS=[0x0c192c,0x111c30,0x0f172a,0x131f35];
// R9 UI: each Lab of a room has its own colour identity (floor, labels, badges, minimap).
export const R9_LAB_ACCENTS=['#2dd4bf','#f5b544','#a78bfa','#f472b6'];
const r9ShortName=(s,n=24)=>{s=String(s||'').trim();return s.length>n?s.slice(0,n-1).trimEnd()+'…':s;};

export class R6SpatialManager {
  constructor({scene,camera,building,labelSpriteFn,onSelectMode,onReturnToGrade}) {
    this.scene=scene;this.camera=camera;this.building=building;
    this.labelSprite=labelSpriteFn;this.onSelectMode=onSelectMode;
    this.onReturnToGrade=onReturnToGrade;
    this.activeThematicRoomId=null;this.activeGrade=0;this.activeRoomPlan=null;
    this.chamberGroup=new THREE.Group();this.chamberGroup.visible=false;
    this.chamberGroup.name='R7.3 Thematic Room Model Gallery';
    this.building.add(this.chamberGroup);
    this.thematicDoors=[]; // R7.3: no intermediate Lab doors any more.
    this.thematicExhibits=[]; // All pedestals of every Lab in the active room.
    this.labZones=[];
    this.activeLabId=null;
    this.galleryPlan=null;
    this.returnGate=null;
    this.chamberGates=new Map();
  }

  updateGradeGates(grade,portalGatesMap) {
    if(!grade||grade<6||grade>12)return;
    const rooms=getRoomsForGrade(grade),cfg=ROOMS[grade];
    if(!cfg)return;
    for(const [i,gate] of (portalGatesMap[grade]||[]).entries()) {
      const assignedId = gate.thematicRoomId || gate.group?.userData?.thematicRoomId;
      const assignedRoom = assignedId ? getRoomById(assignedId) : null;
      const room = (assignedRoom && assignedRoom.isChapterRoom) ? assignedRoom : rooms[i];
      if(!room)continue;
      gate.thematicRoomId=room.roomId;gate.thematicRoom=room;
      if(!gate.group)continue;
      gate.group.userData.thematicRoomId=room.roomId;
      gate.group.userData.portalGrade=grade;
      if(gate.group.userData.r71SignFor===room.roomId || gate.group.userData.hasChapterSign)continue;
      const existing=gate.group.children.find(c=>c.isSprite);
      if(existing){
        const text=`${room.roomId} · ${room.name}`;
        const sign=this.labelSprite(text,cfg.accentHex||'#53d3c5',4.8,.81,'rgba(9,25,38,.96)');
        sign.position.copy(existing.position);
        gate.group.remove(existing);disposeObject(existing);gate.group.add(sign);
      }
      gate.group.userData.r71SignFor=room.roomId;
    }
  }

  static material(color,params={}){return new THREE.MeshStandardMaterial({color,...params});}
  _mesh(geo,mat,x,y,z,parent=this.chamberGroup){
    const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.receiveShadow=true;
    parent.add(mesh);return mesh;
  }

  /**
   * R7.3: the gate leads straight into the gallery. Each Lab of the room is a
   * zone (tinted floor + overhead name) containing one pedestal per mode.
   */
  enterThematicRoom(roomId,player,callback) {
    const room=getRoomById(roomId);
    if(!room)return false;
    const cfg=ROOMS[room.grade];if(!cfg)return false;
    const labs=getLabDoorsForRoom(roomId);
    // Fail before altering the old scene if the registry is inconsistent.
    const plan=planR73RoomGallery(room,cfg,labs);
    this.clearChamber();
    this.activeThematicRoomId=roomId;this.activeGrade=room.grade;
    this.activeRoomPlan=plan;this.activeLabId=null;this.galleryPlan=null;this.chamberGroup.visible=true;
    const accent=new THREE.Color(cfg.accentHex||'#53d3c5');
    // R11.2: Không gian phòng triển lãm 2D/3D tương phản cao (Sàn Obsidian Navy + Tường trắng ngà + Chân tường kim loại xước)
    const tile=this.constructor.material(0x121e2c,{roughness:.35,metalness:.15});
    const wall=this.constructor.material(0xf8fafc,{roughness:.68});
    const wainscot=this.constructor.material(0x1b2d42,{roughness:.38,metalness:.45});
    const trim=new THREE.MeshBasicMaterial({color:accent,toneMapped:false,fog:false});
    const ceiling=this.constructor.material(0xffffff,{roughness:.85,side:THREE.DoubleSide});
    const P=plan,halfW=P.width/2,halfD=P.depth/2;
    const floor=this._mesh(new THREE.PlaneGeometry(P.width,P.depth),tile,P.x,0.025,P.z);
    floor.rotation.x=-Math.PI/2;
    const roof=this._mesh(new THREE.PlaneGeometry(P.width,P.depth),ceiling,P.x,P.height,P.z);
    roof.rotation.x=-Math.PI/2;
    // Standalone 48 x 56 gallery: original 34 x 40 grade classrooms stay intact.
    this._mesh(new THREE.BoxGeometry(.35,P.height,P.depth),wall,P.x-halfW,P.height/2,P.z);
    this._mesh(new THREE.BoxGeometry(.35,P.height,P.depth),wall,P.x+halfW,P.height/2,P.z);
    this._mesh(new THREE.BoxGeometry(P.width,P.height,.35),wall,P.x,P.height/2,P.z-P.zSide*halfD);
    this._mesh(new THREE.BoxGeometry(P.width,P.height,.35),wall,P.x,P.height/2,P.z+P.zSide*halfD);
    // Chân tường kiến trúc & viền ánh sáng giúp phân tách tường – sàn rõ nét
    this._mesh(new THREE.BoxGeometry(.42,1.35,P.depth-.4),wainscot,P.x-halfW+.05,.68,P.z);
    this._mesh(new THREE.BoxGeometry(.42,1.35,P.depth-.4),wainscot,P.x+halfW-.05,.68,P.z);
    this._mesh(new THREE.BoxGeometry(P.width-.4,1.35,.42),wainscot,P.x,.68,P.z+P.zSide*(halfD-.05));
    // A quiet border + an entrance aisle that ends where the Lab zones start.
    for(const dx of [-halfW+1.15,halfW-1.15])this._mesh(
      new THREE.BoxGeometry(.14,.055,P.depth-3.6),trim,P.x+dx,.07,P.z);
    const walkway=this._mesh(new THREE.PlaneGeometry(3.8,13.5),
      this.constructor.material(0x0f172a,{roughness:.38}),P.x,.048,P.z-P.zSide*20.2);
    walkway.rotation.x=-Math.PI/2;
    for(const zone of P.zones){
      const light=new THREE.PointLight(0xffffff,14,82,1.5);
      light.position.set(zone.x,P.height-1.0,P.z+P.zSide*2);
      this.chamberGroup.add(light);
    }
    const entryLight=new THREE.PointLight(0xfffbeb,12,75,1.5);
    entryLight.position.set(P.x,P.height-1.0,P.z-P.zSide*12);
    this.chamberGroup.add(entryLight);
    const sign=this.labelSprite(`${room.roomId} · ${room.name.toUpperCase()}`,
      cfg.accentHex||'#53d3c5',12,1.2,'rgba(8,24,37,.96)');
    sign.position.set(P.x,7.2,P.z+P.zSide*(halfD-1.2));
    this.chamberGroup.add(sign);
    const unitWord = room.isChapterRoom ? 'BÀI HỌC' : 'LAB';
    const info=this.labelSprite(`${labs.length} ${unitWord} · ${P.modeCount} MÔ HÌNH · NHẤP BỤC / PHÍM E ĐỂ MỞ`,
      '#f2cf90',11,.7,'rgba(8,24,37,.92)');
    info.position.set(P.x,6.25,P.z+P.zSide*(halfD-1.2));
    this.chamberGroup.add(info);

    this.buildLabZones(P,cfg.accentHex||'#53d3c5',accent);
    this.createReturnGate(P.returnGate.x,P.returnGate.z,room.grade,P.zSide);
    if(player){player.x=P.spawn.x;player.z=P.spawn.z;}
    if(callback)callback();
    return true;
  }

  buildLabZones(P,accentHex,accent){
    const zFront=P.z+P.zSide*(-13.2),zBack=P.z+P.zSide*(P.depth/2-4.2);
    const zoneDepth=Math.abs(zBack-zFront),zoneMid=(zFront+zBack)/2;
    for(const zone of P.zones){
      const lab=zone.lab;
      const labHex=R9_LAB_ACCENTS[zone.index%R9_LAB_ACCENTS.length],labCol=new THREE.Color(labHex);
      const rug=this._mesh(new THREE.PlaneGeometry(zone.width,zoneDepth),
        this.constructor.material(R73_ZONE_TINTS[zone.index%R73_ZONE_TINTS.length],{roughness:.72}),
        zone.x,.06,zoneMid);
      rug.rotation.x=-Math.PI/2;rug.name=`KHU LAB ${lab.labId}`;
      for(const ex of [zone.minX,zone.maxX])this._mesh(new THREE.BoxGeometry(.16,.08,zoneDepth),
        this.constructor.material(labCol,{emissive:labCol,emissiveIntensity:.45}),ex,.09,zoneMid);
      for(const ez of [zFront,zBack])this._mesh(new THREE.BoxGeometry(zone.width,.08,.16),
        this.constructor.material(labCol,{emissive:labCol,emissiveIntensity:.45}),zone.x,.09,ez);
      const zoneTitleText = lab.isChapterLessonLab ? lab.name.toUpperCase() : `LAB ${zone.index+1} · ${lab.name.toUpperCase()}`;
      const title=this.labelSprite(zoneTitleText,
        labHex,Math.min(zone.width-1,10.5),1.1,'rgba(8,24,37,.96)',{wrap:true});
      title.position.set(zone.x,5.45,zFront);this.chamberGroup.add(title);
      const sub=this.labelSprite(`${lab.modes.length} mô hình`,labHex,3.2,.5,'rgba(8,24,37,.92)');
      sub.position.set(zone.x,4.62,zFront);this.chamberGroup.add(sub);
      this.labZones.push({lab,zone,title,accentHex:labHex});
    }
    for(const item of P.objects){
      const labHex=R9_LAB_ACCENTS[(item.zone||0)%R9_LAB_ACCENTS.length];
      const stand=this.createModelPedestal(item,item.lab,labHex,new THREE.Color(labHex));
      this.chamberGroup.add(stand);
      const preview = stand.userData.previewModel;
      preview?.userData?.onViewEnter?.();
      this.thematicExhibits.push({plinth:stand,mode:item.mode,labId:item.labId,x:item.x,z:item.z,preview});
    }

    // R87: Spawn dedicated NEW_MUSEUM_EXHIBIT 2D<->3D Fold-Net pedestals in this room
    // without duplicating existing pedestals (which are already upgraded via EXTEND_EXISTING_MUSEUM).
    const newFoldSpecs = getNewFoldNetExhibitsForRoom(this.activeThematicRoomId);
    if (newFoldSpecs.length > 0) {
      const foldHex = '#f59e0b';
      const foldCol = new THREE.Color(foldHex);
      const zFold = P.z - P.zSide * 15.6;
      const syntheticLab = {
        labId: `${this.activeThematicRoomId}-R87-FOLD`,
        roomId: this.activeThematicRoomId,
        grade: this.activeGrade,
        name: 'Hiện vật Gấp/Trải 2D ⇄ 3D'
      };
      newFoldSpecs.forEach((spec, idx) => {
        const side = idx % 2 === 0 ? -1 : 1;
        const slot = Math.floor(idx / 2);
        const fx = P.x + side * (5.4 + slot * 5.6);
        const fz = zFold + (slot % 2) * P.zSide * 2.2;
        const foldMode = {
          id: spec.id,
          name: `${spec.name} (Gấp/Trải 2D ⇄ 3D)`,
          grade: this.activeGrade,
          roomId: this.activeThematicRoomId,
          labId: syntheticLab.labId,
          status: 'featured',
          isFoldNetExhibit: true
        };
        const item = {
          mode: foldMode,
          lab: syntheticLab,
          labId: syntheticLab.labId,
          x: fx,
          z: fz,
          index: P.objects.length + idx,
          row: slot,
          zSide: P.zSide
        };
        const stand = this.createModelPedestal(item, syntheticLab, foldHex, foldCol);
        this.chamberGroup.add(stand);
        const preview = stand.userData.previewModel;
        preview?.userData?.onViewEnter?.();
        this.thematicExhibits.push({
          plinth: stand,
          mode: foldMode,
          labId: syntheticLab.labId,
          x: fx,
          z: fz,
          preview,
          isFoldNetExhibit: true
        });
      });
    }
  }

  /**
   * R7.3: Labs are already displayed in the room. "Entering" a Lab only
   * focuses it: the player is moved to the front of that Lab's zone
   * (unless teleport:false, used when a pedestal was clicked directly).
   */
  enterLabGallery(labId,player,callback,{teleport=true}={}) {
    const lab=getUnifiedLabById(labId),roomId=this.activeThematicRoomId;
    if(!lab||!roomId||lab.roomId!==roomId||lab.grade!==this.activeGrade)return false;
    const entry=this.labZones.find(z=>z.lab.labId===lab.labId);
    if(!entry)return false;
    this.activeLabId=lab.labId;
    this.galleryPlan=entry.zone;
    if(teleport&&player){player.x=entry.zone.entry.x;player.z=entry.zone.entry.z;}
    if(callback)callback();
    return true;
  }

  createModelPedestal(item,lab,accentHex,accent){
    const {mode,x,z,index}=item;
    const stand=new THREE.Group();stand.position.set(x,0,z);
    stand.name=`MÔ HÌNH ${mode.id} · ${mode.name}`;
    stand.userData.thematicMode=mode.id;
    stand.userData.thematicLabId=lab.labId;
    stand.userData.thematicRoomForLab=lab.roomId;
    // PA1: Vòng Cung Khán Đài Đồng Tâm 3 Tầng (Concentric Amphitheater Stepped Tiers: 0% sightline occlusion)
    const tierRow=Math.min(2,Math.max(0,Number(item.row)||0));
    const tierStepY=tierRow*0.48;
    if(tierStepY>0){
      const terrace=this._mesh(new THREE.CylinderGeometry(2.82,3.05,tierStepY,12),
        this.constructor.material(0x111d2e,{metalness:.65,roughness:.28}),0,tierStepY/2,0,stand);
      terrace.castShadow=false;
      const terraceRim=this._mesh(new THREE.CylinderGeometry(2.88,2.88,.05,12),
        this.constructor.material(0xfbbf24,{metalness:.72,roughness:.22,emissive:new THREE.Color(0xfbbf24),emissiveIntensity:.28}),0,tierStepY,0,stand);
      terraceRim.castShadow=false;
    }
    const pedestal=this._mesh(new THREE.CylinderGeometry(2.48,2.68,.84,8),
      this.constructor.material(0x182432,{metalness:.78,roughness:.22}),0,tierStepY+.42,0,stand);
    pedestal.castShadow=false;
    const edge=this._mesh(new THREE.CylinderGeometry(2.58,2.58,.08,8),
      this.constructor.material(accent,{metalness:.35,roughness:.28,emissive:accent,emissiveIntensity:.46}),0,tierStepY+.88,0,stand);
    const stageTop=this._mesh(new THREE.CylinderGeometry(2.38,2.42,.06,8),
      this.constructor.material(0x0a121c,{metalness:.25,roughness:.14}),0,tierStepY+.94,0,stand);
    stageTop.castShadow=false;
    const preview=createModeExhibit(lab.grade,{...mode,sourceLabId:mode.sourceLabId||mode.labId,labId:lab.labId,labName:lab.name});
    if(!preview)throw new Error(`Missing 3D museum preview: ${mode.id}`);
    const bounds=new THREE.Box3().setFromObject(preview);
    const size=bounds.getSize(new THREE.Vector3());
    const span=Math.max(size.x,size.y,size.z,.02);
    const scale=Math.min(1.18,2.95/span);
    preview.scale.setScalar(scale);
    preview.position.set(-(bounds.min.x+size.x/2)*scale,
      tierStepY+1.16-bounds.min.y*scale,
      -(bounds.min.z+size.z/2)*scale);
    const visual=new THREE.Group();visual.add(preview);stand.add(visual);
    stand.userData.previewModel=preview;
    // R9 UI: ivory bubble title (full name, 2 lines) staggered by row so
    // neighbouring cards never overlap; compact 1-line card for far viewing;
    // a round number badge at the front edge of the pedestal.
    const lift=(item.row||0)%2?.45:0;
    const title=this.labelSprite(`${index+1}. ${mode.name}`,
      accentHex,5.6,1.22,'rgba(8,24,37,.95)',{wrap:true,theme:'light',tail:true});
    title.position.set(0,tierStepY+4.28+lift,0);stand.add(title);
    const compact=this.labelSprite(`${index+1} · ${r9ShortName(mode.name)}`,
      accentHex,4.8,.80,'rgba(8,24,37,.95)',{theme:'light'});
    compact.position.set(0,tierStepY+4.12+lift,0);compact.visible=false;stand.add(compact);
    const badge=this.labelSprite(String(index+1),accentHex,1.02,1.02,'rgba(8,24,37,.95)',{circle:true});
    const zs=item.zSide||1;
    badge.position.set(0,tierStepY+1.42,-zs*2.68);stand.add(badge);
    const tag=this.labelSprite(`E · Mở mô hình · ${mode.id}${mode.status==='archived'?' · LƯU KHO':''}`,
      '#ffe0a6',4.8,.48,'rgba(8,24,37,.92)',{color:'#ffe9bf'});
    tag.position.set(0,tierStepY+3.42,0);tag.visible=false;stand.add(tag);
    stand.userData.r8Title=title;stand.userData.r8Tag=tag;
    stand.userData.r9Compact=compact;stand.userData.r9Badge=badge;
    return stand;
  }

  /**
   * R8/R9 UI level-of-detail for labels (visual only): nearby titles are fully
   * opaque, far ones switch to a compact card, the nearest pedestal is enlarged
   * and shows its "E" hint. Aerial views keep every full title readable.
   */
  updateLabelLOD(player,topView=false,overviewCam=null){
    if(!player||!this.thematicExhibits.length)return;
    let nearest=null,best=4.2;
    for(const ex of this.thematicExhibits){
      const d=Math.hypot(player.x-ex.x,player.z-ex.z);ex.r8Dist=d;
      if(d<best){best=d;nearest=ex;}
    }
    const proj=1;
    for(const ex of this.thematicExhibits){
      const ud=ex.plinth.userData,title=ud.r8Title,tag=ud.r8Tag,compact=ud.r9Compact;
      if(!title)continue;
      const d=ex.r8Dist,focus=ex===nearest&&!overviewCam;
      const far=!topView&&d>19;
      const showFull=!far||focus;
      title.visible=showFull;
      if(compact)compact.visible=!showFull;
      const card=showFull?title:compact;
      if(card?.material){
        const opacity=topView?1:THREE.MathUtils.clamp(1-(d-24)/26,.45,1);
        card.material.opacity=THREE.MathUtils.lerp(card.material.opacity??1,opacity,.2);
      }
      if(card?.userData?.r8BaseScale){
        const [w,h]=card.userData.r8BaseScale;
        const k=(focus?1.16:(overviewCam?1.32:topView?1.12:1))*proj;
        card.scale.set(THREE.MathUtils.lerp(card.scale.x,w*k,.2),THREE.MathUtils.lerp(card.scale.y,h*k,.2),1);
      }
      if(ud.r9Badge?.userData?.r8BaseScale){
        const [bw,bh]=ud.r9Badge.userData.r8BaseScale,bk=(overviewCam?1.6:topView?1.3:1)*proj;
        ud.r9Badge.scale.set(bw*bk,bh*bk,1);
      }
      if(tag)tag.visible=!topView&&(focus||d<5.5);
    }
  }

  exitLabGallery(player,callback){
    if(!this.activeLabId)return false;
    this.activeLabId=null;this.galleryPlan=null;
    const P=this.activeRoomPlan;
    if(player&&P){player.x=P.spawn.x;player.z=P.spawn.z;}
    if(callback)callback();
    return true;
  }

  createThematicLabDoor(placement,accent,accentHex) {
    const {lab,x,z,rotation,index}=placement;
    const group=new THREE.Group();group.name=`CỬA LAB ${lab.labId} · ${lab.name}`;
    group.position.set(x,0,z);group.rotation.y=rotation;
    group.userData.thematicLabId=lab.labId;
    group.userData.thematicRoomForLab=lab.roomId;
    group.userData.isLabDoor=true;
    const frame=this.constructor.material(accent,{roughness:.4,metalness:.3,emissive:accent,emissiveIntensity:.18});
    const leaf=this.constructor.material(0x164a56,{roughness:.45,metalness:.12,transparent:true,opacity:.97});
    const recess=this.constructor.material(0x0c2432,{roughness:.7});
    this._mesh(new THREE.BoxGeometry(5.9,5.4,.56),recess,0,2.72,0,group);
    this._mesh(new THREE.BoxGeometry(5.1,4.62,.12),leaf,0,2.43,.34,group);
    for(const edge of [-2.85,2.85])this._mesh(new THREE.BoxGeometry(.25,5.85,.85),frame,edge,2.93,.42,group);
    this._mesh(new THREE.BoxGeometry(5.95,.28,.85),frame,0,5.9,.42,group);
    this._mesh(new THREE.BoxGeometry(.15,1.18,.1),frame,1.55,2.25,.53,group);
    const knob=this._mesh(new THREE.SphereGeometry(.16,12,8),
      this.constructor.material(0xf0cd82,{metalness:.55,roughness:.38}),1.75,2.1,.65,group);
    const sign=this.labelSprite(`${index+1}. ${lab.name}`,accentHex,7.6,.89,'rgba(8,24,37,.96)');
    sign.position.set(0,6.72,.30);group.add(sign);
    const count=this.labelSprite(`${lab.modes.length} mô hình · NHẤP / E ĐỂ MỞ`,
      '#f5d59b',5.8,.54,'rgba(8,24,37,.91)');
    count.position.set(0,5.13,.82);group.add(count);
    return group;
  }

  createReturnGate(x,z,grade,zSide) {
    const group=new THREE.Group();group.position.set(x,0,z);
    group.rotation.y=zSide>0?0:Math.PI;
    group.userData.isReturnGate=true;group.userData.returnGrade=grade;
    const dark=this.constructor.material(0x164e59,{roughness:.55});
    const border=this.constructor.material(0x53d3c5,{metalness:.3,roughness:.38});
    this._mesh(new THREE.BoxGeometry(3.15,3.7,.32),dark,0,1.86,0,group);
    for(const sx of [-1.75,1.75])this._mesh(new THREE.BoxGeometry(.28,4.1,.55),border,sx,2.02,0,group);
    this._mesh(new THREE.BoxGeometry(3.8,.25,.55),border,0,4.2,0,group);
    const title=this.labelSprite(`↩ VỀ PHÒNG LỚP ${grade}`,'#ffd166',5.2,.76,'rgba(10,24,38,.95)');
    title.position.set(0,5.05,0);group.add(title);
    this.chamberGroup.add(group);
    this.returnGate={group,x,z,grade};
  }

  isWithinActiveChamber(x,z) {return r71Contains(this.activeRoomPlan,x,z);}
  constrainToRoom(x,z) {return r71Clamp(this.activeRoomPlan,x,z);}
  getActiveRoomPlan(){return this.activeRoomPlan;}

  clearChamber(){
    for(const ex of this.thematicExhibits){
      ex.preview?.userData?.onViewLeave?.();
      ex.preview?.userData?.disposeFoldNet?.();
    }
    this.thematicDoors=[];this.thematicExhibits=[];this.labZones=[];this.activeLabId=null;this.galleryPlan=null;
    while(this.chamberGroup.children.length){
      const c=this.chamberGroup.children[0];this.chamberGroup.remove(c);disposeObject(c);
    }
    this.returnGate=null;this.chamberGroup.visible=false;this.activeRoomPlan=null;
  }

  exitThematicRoom(player){
    const grade=this.activeGrade;this.clearChamber();this.activeThematicRoomId=null;
    if(player&&grade&&ROOMS[grade]){
      player.x=ROOMS[grade].x;player.z=ROOMS[grade].zSide*14;
    }
    if(this.onReturnToGrade)this.onReturnToGrade(grade);
  }

  update(dt,nowMs,player){
    if(!this.activeThematicRoomId||!this.chamberGroup.visible||!player)return null;
    if(this.returnGate){
      const d=Math.hypot(player.x-this.returnGate.x,player.z-this.returnGate.z);
      if(d<1.40){this.exitThematicRoom(player);return {action:'exit',grade:this.activeGrade};}
    }
    // R7.3 / R11: pedestals of every Lab are live & support In-World Holo-Stage manipulation.
    const tSec=(nowMs||performance.now())*.001;
    let closest=null,shortest=3.2;
    for(const ex of this.thematicExhibits){
      const d=Math.hypot(player.x-ex.x,player.z-ex.z);
      const p=ex.preview;
      if(p){
        if(d<3.4){
          if(!p.userData._nearActive){
            p.userData._nearActive=true;
            if(p.userData._lessonStartSeconds!==undefined&&(tSec-p.userData._lessonStartSeconds)>=9.8){
              p.userData._lessonStartSeconds=tSec;
            }
          }
        }else if(d>4.5){
          p.userData._nearActive=false;
        }
        const hs=p.userData.holoState;
        // Each exhibit starts at zero when entering the room and cycles smoothly after holding 1.5s at 100%.
        const origin=p.userData._lessonStartSeconds??(p.userData._lessonStartSeconds=tSec);
        const elapsed=Math.max(0,tSec-origin);
        let animTime=Math.min(10,elapsed%11.8);
        if(hs){
          const old=hs._lastTickSeconds??tSec;
          const delta=Math.max(0,Math.min(.1,tSec-old));
          hs._lastTickSeconds=tSec;
          if(!hs.paused){
            hs.phase=(hs.phase||0)+delta*(hs.speed??1);
            if(hs.phase>=11.5)hs.phase=0;
          }
          animTime=Math.min(10,hs.phase||0);
          if(typeof document!=='undefined'&&typeof CustomEvent==='function'
             &&Math.abs((p.userData._lastMotionUIPhase??-1)-animTime)>.12){
            p.userData._lastMotionUIPhase=animTime;
            document.dispatchEvent(new CustomEvent('mathverse:learning-progress',{
              detail:{modeId:ex.mode.id,phase:animTime,paused:hs.paused}
            }));
          }
        }
        if(p.userData?.animate){
          p.userData.animate(animTime);
          const step=p.userData.motionStage;
          if(step&&hs&&p.userData._lastHoloStage!==step.stage){
            p.userData._lastHoloStage=step.stage;
            if(typeof document!=='undefined'&&typeof CustomEvent==='function'){
              document.dispatchEvent(new CustomEvent('mathverse:learning-step',{
                detail:{modeId:ex.mode.id,stage:step.stage,description:step.description}
              }));
            }
          }
        }else{
          p.rotation.y=0; // Do not invent a sine-like movement for an unsupported model.
        }
        if(hs){
          if(!p.userData._baseScale)p.userData._baseScale=p.scale.x||1;
          p.scale.setScalar(p.userData._baseScale*(hs.scale||1));
          if(Number.isFinite(hs.spinOffset))p.rotation.y+=hs.spinOffset;
          this._applyHoloExplodeAndMaterial(p,hs.explode||0,hs.renderMode||'solid');
        }
      }
      if(d<shortest){closest=ex;shortest=d;}
    }
    if(closest)return {action:'nearMode',modeId:closest.mode.id,labId:closest.labId,
      roomId:this.activeThematicRoomId,grade:this.activeGrade};
    return null;
  }

  _applyHoloExplodeAndMaterial(root,explode,renderMode){
    if(!root)return;
    const hadExplode=(root.userData._lastExplode||0)>0.001;
    root.userData._lastExplode=explode;
    if(explode>0.001||hadExplode){
      for(const child of root.children){
        if(!child.userData._basePos)child.userData._basePos=child.position.clone();
        const bp=child.userData._basePos;
        const len=bp.length();
        if(explode>0.001&&len>0.02){
          child.position.set(bp.x*(1+explode*0.65),bp.y*(1+explode*0.55)+explode*0.18,bp.z*(1+explode*0.65));
        }else if(hadExplode){
          child.position.copy(bp);
        }
      }
    }
    if(root.userData._lastRenderMode!==renderMode){
      root.userData._lastRenderMode=renderMode;
      root.traverse(obj=>{
        if(!obj.isMesh||!obj.material)return;
        const m=obj.material;
        if(m.userData._origWire===undefined){
          m.userData._origWire=!!m.wireframe;
          m.userData._origTrans=!!m.transparent;
          m.userData._origOp=m.opacity??1;
        }
        if(renderMode==='wire'){
          m.wireframe=true;m.transparent=false;m.opacity=1;
        }else if(renderMode==='xray'){
          m.wireframe=false;m.transparent=true;m.opacity=Math.min(m.userData._origOp,0.42);
        }else{
          m.wireframe=m.userData._origWire;
          m.transparent=m.userData._origTrans;
          m.opacity=m.userData._origOp;
        }
      });
    }
  }

  getExhibitByModeId(modeId){
    return this.thematicExhibits.find(x=>x.mode.id===modeId)||null;
  }

  getRoomExhibits(){
    return this.thematicExhibits||[];
  }

  getClickTargets(){
    if(!this.activeThematicRoomId||!this.chamberGroup.visible)return [];
    const arr=[];if(this.returnGate?.group)arr.push(this.returnGate.group);
    for(const ex of this.thematicDoors)arr.push(ex.door);
    for(const ex of this.thematicExhibits)arr.push(ex.plinth);
    return arr;
  }
}
