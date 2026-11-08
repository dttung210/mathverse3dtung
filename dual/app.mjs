import * as THREE from '/vendor/three.module.js';
import {createAvatar} from './avatar-r75.mjs';
import {createCartoonStudio,ALL_AVATAR_IDS,CHIBI_PRESETS,isChibiPreset} from './cartoon-3d/studio.mjs';
import {createGrandDome, GRAND_DOME_LAYOUT} from './grand-dome.mjs';
import {createWonderParkWorld,WONDER_PARK_LOCATION} from './wonder-park-world.mjs';
import {initializeParkUI} from './wonder-park-ui.mjs';
import {CAMPUS_MASTERPLAN,ORBITAL_MASTERPLAN,fitAerialBounds} from './campus-masterplan.mjs';
import {createCampusRoutes} from './campus-routes-v3.mjs';
import {initializeCampusMap} from './campus-map-ui-v3.mjs';
import {InfographicGallery,GRADE_STYLE,ENTRANCE_Z,CLASSIFICATION_PODIUM,restrictPosition} from './gallery.mjs';
import {validateMuseumCatalog} from './museum-inventory.mjs';
import {createDiscoveryWorld,DISCOVERY_SITE} from './discovery-world.mjs';
import {upgradeDiscoveryToUNESCO} from './discovery-unesco-world.mjs';
import {createDiscoveryUI} from './discovery-ui.mjs';
import {upgradeDiscoveryToWorldMapR97} from './discovery-r97/world-map-room.mjs';
import {createDiscoveryWorldMapUI} from './discovery-r97/world-map-ui.mjs';
import {upgradeDiscoveryToFidelityR98} from './discovery-r98/fidelity-world.mjs';
import {upgradeDiscoveryWondersR102} from './discovery-r102/exhibition-room.mjs';
import {createWorldWondersR100UI} from './discovery-r100/wonders-ui.mjs';
import {createPodiumSketchfabViewer} from './discovery-r103/podium-viewer.mjs';
import {initializeGraphicsEngine} from './graphics-engine.mjs';
import {speakVietnamese,stopVietnameseSpeech,isSpeakingVietnamese,onSpeechStateChange,ZONE_VOICE_GUIDES,toggleVietnameseVoiceCommand,onVoiceCommandStateChange} from './vn-tts.mjs';

const $=id=>document.getElementById(id);
const COPY={
  worlds:'BỐN KHU VỰC · MỘT NHÂN VẬT',
  avatar:'NHÂN VẬT',help:'HƯỚNG DẪN',home:'VỀ SẢNH',
  title:'MATHVERSE TOÁN HỌC MR.TUNG 3D',
  subtitle:'LAB và Bảo tàng nối trực tiếp Sảnh chung · Công viên nằm đối diện Sảnh chung.',
  labSubtitle:'Phòng Lab, mô hình 3D, toàn bộ R75 gốc',
  gallerySubtitle:'Bảo tàng 7 phòng hình quạt chữ S, 30 hàng ngang, 230 tranh, cửa trở về sảnh sau bài cuối',
  walkHint:'Chọn LAB, Bảo tàng, Công viên hoặc Discovery: Địa cầu và Triển lãm hình học thực tế.',
  explore:'Đóng bảng để tham quan 3D',
  galleryHeading:'BẢO TÀNG INFOGRAPHIC',
  museumEntrance:'Về cửa vào bảo tàng',
  controls:'WASD: Di chuyển · E: Tương tác · K: Kho · C: Góc nhìn · V: Nhân vật',
  returnLobby:'← VỀ SẢNH CHUNG',
  viewerHint:'Cuộn chuột để phóng to · ESC để đóng · Không có nút tải ảnh',
  helpTitle:'CÁCH THAM QUAN BẢO TÀNG',
  helpText:'Sảnh Grand Campus: tòa Lab xanh bên trái, tòa Museum tím bên phải. Hai đường đi cân xứng; quầy lễ tân ở giữa. WASD đi, Shift chạy, E tương tác, C đổi camera, V đổi nhân vật. Trong Museum: K mở kho, M mở sơ đồ, nhấn E để xem tranh.',
  integrationNote:'MATHVERSE LAB được phục vụ nguyên bản, giữ vững toàn bộ mô hình gốc.',
  nearR75:'VÀO MATHVERSE LAB',
  nearMuseum:'VÀO TÒA BẢO TÀNG MÁI VÒM',
  nearGuide:'TRÒ CHUYỆN VỚI HƯỚNG DẪN VIÊN',
  nearPoster:'XEM INFOGRAPHIC PHÓNG TO',
  nearReturn:'VỀ SẢNH CHUNG',
  room:'PHÒNG LỚP',
  lessons:'bài học',
  entrance:'SẢNH TRUNG TÂM 7 LỚP',
  stage:'Trang PDF nguồn',
  pause:'Đang chuyển vào khu MATHVERSE LAB...',
  loading:'Đang dựng quảng trường học thuật, tòa Lab và bảo tàng nghệ thuật V11...',
  firstRoom:'Khu Triển Lãm Infographic Toán 6 → 12 (230 Bài học)'
};
for(const el of document.querySelectorAll('[data-i18n]')){
  const k=el.dataset.i18n;if(COPY[k])el.textContent=COPY[k];
}
const catalog=await fetch('/museum-data/catalog.json').then(r=>{if(!r.ok)throw Error('Catalog not found');return r.json();});
const museumInventory=validateMuseumCatalog(catalog);
const canvas=$('dual-canvas');
let renderer;
try {renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}
catch(error) {
  $('loading-text').textContent='3D WebGL is unavailable on this computer. Open 2D library or original R75.';
  $('fallback-actions').hidden=false;
  throw error;
}
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.02;
renderer.shadowMap.enabled=false;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color(0xdcebf3);scene.fog=new THREE.FogExp2(0xdcebf3,.00028);
scene.add(new THREE.HemisphereLight(0xf9ffff,0xadc9c8,1.4));
scene.add(new THREE.AmbientLight(0xffffff,.48));
const sun=new THREE.DirectionalLight(0xfff4df,1.0);sun.position.set(25,45,30);scene.add(sun);
const camera=new THREE.PerspectiveCamera(65,1,.1,950);camera.rotation.order='YXZ';
const avatarType=localStorage.getItem('mathverse_avatar')||'alex';
const avatar=createAvatar(['alex','triet','an','bot','suhocba'].includes(avatarType)?avatarType:'alex');scene.add(avatar.root);
const input=new Set();const touch=new Set();
let jumpHeight=0,jumpVelocity=0;const JUMP_IMPULSE=7.35,JUMP_GRAVITY=19.6;
let mode='lobby',player={...GRAND_DOME_LAYOUT.playerSpawn},savedMuseum={x:0,z:ENTRANCE_Z},gallery=null;
let yaw=0,pitch=.12,charYaw=Math.PI,clock=new THREE.Clock(),activePoster=null,zoom=1,dragStart=null;
// Camera dolly for BOTH 3D worlds (not poster zoom or original R75 runtime).
// Values are actual camera-to-avatar world distances; clamp to avoid clipping.
const CAMERA_DOLLY_MIN=3.1,CAMERA_DOLLY_MAX=18.5;
let cameraDollyGoal=7.9,cameraDollyCurrent=7.9;
function setWorldCameraDolly(distance){
  cameraDollyGoal=THREE.MathUtils.clamp(distance,CAMERA_DOLLY_MIN,CAMERA_DOLLY_MAX);
  const el=$('world-zoom-value');if(el)el.textContent=`${Math.round(7.9/cameraDollyGoal*100)}%`;
}
function wheelMayZoomWorld(){
  return !masterMap?.isOpen&&!discoveryMapUI?.isOpen&&!discoveryUI?.isOpen&&mode!=='r75'&&$('poster-modal').hidden&&$('guide-dialog').hidden&&$('catalog-modal').hidden&&$('room-map-modal').hidden&&$('help-modal').hidden;
}

const CAMERA_MODES=['third','first','top','iso','overview'];
let cameraMode=CAMERA_MODES.includes(localStorage.getItem('mathverse-museum-camera-v5'))?localStorage.getItem('mathverse-museum-camera-v5'):'third';
let catalogGrade=6,presentation=false;
// Always declare render quality before setGraphics() is invoked during startup.
let mobileQuality='auto';
let lastNear=null,frameReady=false,frameLoaded=false,r75State=null,raf=0,lastGrade=0,noticeTimer=null;
const portMessages={lobby:'SẢNH CHUNG',museum:'BẢO TÀNG INFOGRAPHIC',r75:'MATHVERSE LAB'};
const palette={wood:new THREE.MeshStandardMaterial({color:0x22364a,metalness:.82,roughness:.24}),brass:new THREE.MeshStandardMaterial({color:0xd4af37,metalness:.76,roughness:.22}),white:new THREE.MeshStandardMaterial({color:0xf8fbfa,metalness:.08,roughness:.30}),stone:new THREE.MeshStandardMaterial({color:0xe9f4f1,metalness:.13,roughness:.27}),glow:new THREE.MeshBasicMaterial({color:0xffe2a7,toneMapped:false}),glass:new THREE.MeshStandardMaterial({color:0x145675,metalness:.49,roughness:.17,emissive:0x008cbb,emissiveIntensity:.40,transparent:true,opacity:.7})};
// GRAND CAMPUS V11 replaces the old V9 double-ring plaza with two DISTINCT buildings.
// The actual R75 engine and infographic gallery remain independently loaded beyond their entrances.
const grand=createGrandDome({createAvatar,catalogCounts:museumInventory.gradeCounts});
const lobbyGroup=grand.group;
scene.add(lobbyGroup);
const doorTargets=grand.clickable;
// ARCHITECTURE #4: a genuine building on the same campus, two independent interiors.
const discovery=upgradeDiscoveryWondersR102(upgradeDiscoveryToFidelityR98(upgradeDiscoveryToWorldMapR97(upgradeDiscoveryToUNESCO(createDiscoveryWorld()))));
lobbyGroup.add(discovery.exterior);scene.add(discovery.interior);
let discoveryUI=null,discoveryMapUI=null,natureUI=null,wondersUI=null,podiumViewer=null,nativeDragId=null,globePointerDrag=false;
// The 3rd portal is additive and does not modify any R75 Lab/Museum objects.
const parkWorld=createWonderParkWorld();
lobbyGroup.add(parkWorld.group);
const masterplanRoads=createCampusRoutes();
lobbyGroup.add(masterplanRoads.group);
let aerialScope='all',parkFocusZone=null,parkUI=null,masterMap=null,parkGameCamera=null,mazeReturnPosition=null,cartoonStudio=null;
// The Wonder Park is physically present in Grand Campus, sharing its WebGL scene and avatar.


function status(message){const el=$('status');el.textContent=message;el.classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.classList.remove('show'),3200);}
function saveAvatar(value){
  if(!ALL_AVATAR_IDS.includes(value))return;
  if(avatar.getAvatarType()!==value)avatar.setAvatarType(value);
  localStorage.setItem('mathverse_avatar',value);
  if($('avatar-select')&&$('avatar-select').value!==value)$('avatar-select').value=value;
  cartoonStudio?.syncAvatar();
  try{
    const mv=$('r75-frame').contentWindow?.museum;
    const r75Value=(isChibiPreset(value)&&!mv?.supportsChibiCartoon)?'triet':value;
    if(mv&&mv.getAvatarType?.()!==r75Value)mv.setAvatarType(r75Value);
  }catch{}
}
cartoonStudio=createCartoonStudio({avatar,lobbyGroup,onAvatarChange:saveAvatar,onStatus:status});
let graphicsEngine=null;
try{
  graphicsEngine=initializeGraphicsEngine({renderer,scene,canvas,onStatus:status});
  graphicsEngine?.enableSceneShadows?.(lobbyGroup);
  graphicsEngine?.enableSceneShadows?.(discovery.interior);
}catch(err){console.warn('Graphics engine fallback:',err);}
if(ALL_AVATAR_IDS.includes(avatarType))saveAvatar(avatarType);
$('avatar-select').value=avatar.getAvatarType();$('avatar-select').onchange=e=>saveAvatar(e.target.value);
$('avatar-next').onclick=cycleAvatar;
$('camera-mode').value=cameraMode;$('camera-mode').onchange=e=>setCameraMode(e.target.value);
$('present-mode').onclick=()=>setPresentation(!presentation);
function setGraphics(val){
  mobileQuality=val;gallery?.setQuality(val);cartoonStudio?.setQuality(val);
  const tierMap={low:'low',eco:'low',medium:'medium',auto:'medium',high:'high'};
  const tier=tierMap[val]||'medium';
  try{graphicsEngine?.applyQualityTier?.(tier,false);}catch{}
  const pixel=(val==='eco'||val==='low')?1.0:val==='high'?Math.min(devicePixelRatio,1.35):Math.min(devicePixelRatio,1.15);
  renderer.setPixelRatio(pixel);
  try{graphicsEngine?.setShadows?.(val==='high');}catch{}
  onResize();
  try{localStorage.setItem('mathverse-render-quality',val);}catch{}
}
$('quality').value=['low','medium','eco','auto','high'].includes(localStorage.getItem('mathverse-render-quality'))?localStorage.getItem('mathverse-render-quality'):'auto';
setGraphics($('quality').value);
$('quality').onchange=e=>setGraphics(e.target.value);
function showLobbyMenu(visible){$('lobby-menu').hidden=!visible;}
function moveToLobby(){
  parkUI?.stopTempleSound?.();parkUI?.hide();parkWorld.leaveSanctuary();parkWorld.clearGameFocus();parkGameCamera=null;parkWorld.closeGate();parkFocusZone=null;aerialScope='all';
  // Unconditionally clean up Discovery state
  discoveryUI?.hide();if(discovery?.interior)discovery.interior.visible=false;
  wondersUI?.close();natureUI?.close();discoveryMapUI?.hide();
  if($('r107-gallery-switch'))$('r107-gallery-switch').hidden=true;
  if($('r107-roomb-floor-switch'))$('r107-roomb-floor-switch').hidden=true;
  // Unconditionally clean up R75 Lab state
  if(frameLoaded){
    const iframe=$('r75-frame');
    try{
      const mv=iframe?.contentWindow?.museum;
      if(mv){
        r75State=mv.getState?.()||r75State;
        const type=mv.getAvatarType?.();if(type&&ALL_AVATAR_IDS.includes(type))saveAvatar(type);
        const q=mv.getQuality?.()?.name;if(['eco','auto','high'].includes(q)){$('quality').value=q;setGraphics(q);}
        mv.setPaused?.(true);
      }
    }catch(e){console.warn('R75 pause issue',e);}
  }
  if($('r75-shell'))$('r75-shell').hidden=true;
  if($('topbar'))$('topbar').hidden=false;
  if($('screen'))$('screen').hidden=false;
  canvas.hidden=false;
  // Unconditionally clean up Museum state
  stopAutoTour();
  if(mode==='museum')savedMuseum={...player};
  if(gallery?.group)gallery.group.visible=false;
  if($('museum-hud'))$('museum-hud').hidden=true;
  closeRoomMap();closeCatalog();closeGradeGuide();
  setPresentation(false);
  // Restore Central Grand Dome Lobby
  lobbyGroup.visible=true;
  if($('plaza-guide-hint'))$('plaza-guide-hint').hidden=false;
  mode='lobby';document.body.classList.add('campus-lobby');player={...GRAND_DOME_LAYOUT.playerSpawn};yaw=0;pitch=.12;
  input.clear();touch.clear();$('to-lobby').hidden=true;$('mode-pill').textContent='GRAND CAMPUS';
  $('room-name').textContent='LAB · BẢO TÀNG · CÔNG VIÊN · DISCOVERY';showLobbyMenu(false);closeGuide();lastGrade=0;
  $('near-prompt').hidden=true;avatar.root.position.set(player.x,0,player.z);
  onResize();
}
window.__returnToMainCampusLobby=moveToLobby;
window.addEventListener('message',e=>{
  if(e.data?.type==='mathverse-r75-return-lobby')moveToLobby();
});
function moveToParkGate(){
  if(mode!=='lobby')moveToLobby();
  player={x:WONDER_PARK_LOCATION.startX,z:WONDER_PARK_LOCATION.startZ};yaw=Math.PI;charYaw=Math.PI;
  avatar.root.position.set(player.x,0,player.z);
  setCameraMode('third');parkFocusZone=null;
  input.clear();touch.clear();showLobbyMenu(false);
  status('Đang đứng ngay trước cổng công viên trong cùng thế giới MATHVERSE. Nhấn E để mở cổng!');
}
function focusParkAerial(scope='park'){
  if(mode!=='lobby')moveToLobby();
  parkFocusZone=null;aerialScope=scope;
  setCameraMode('top');showLobbyMenu(false);
  status(scope==='park'?'GÓC TRÊN CAO — 10 khu trò chơi ngoài, Phòng Thích Học Bá ở giữa.':'GÓC TRÊN CAO — nhìn chung đại sảnh, hai tòa và công viên.');
}
function visitParkZone(i){
  if(mode!=='lobby')moveToLobby();
  const p=parkWorld.getZoneWorldPosition(i);
  if(!p)return;
  const dx=p.x-WONDER_PARK_LOCATION.centerX,dz=p.z-WONDER_PARK_LOCATION.centerZ;
  const len=Math.max(.01,Math.hypot(dx,dz));
  player={x:p.x+dx/len*10.4,z:p.z+dz/len*10.4};
  yaw=Math.atan2(-dx,dz);charYaw=yaw;
  avatar.root.position.set(player.x,0,player.z);
  input.clear();touch.clear();showLobbyMenu(false);
}
function focusParkZone(i){
  parkFocusZone=i;
  setCameraMode('third');
  parkFocusZone=i; // setCameraMode may clear focus when leaving aerial mode
}
function enterParkGameCamera(index,view='arena'){
  if(mode!=='lobby')moveToLobby();
  input.clear();touch.clear();parkGameCamera={index,view};
  // The camera observes each 3D attraction; player avatar is never transformed into a chicken.
  if(index!==2)parkFocusZone=index;else parkFocusZone=null;
  setCameraMode('third');
  if(index!==2)parkFocusZone=index;
}
function leaveParkGameCamera(){
  parkGameCamera=null;parkWorld.clearGameFocus();parkFocusZone=null;
  avatar.root.visible=true;
}
function enterMazeMode(spawn,view='maze_preview',startYaw=0){
  if(mode!=='lobby')moveToLobby();
  if(!mazeReturnPosition)mazeReturnPosition={...player};
  player={x:spawn.x,z:spawn.z};yaw=startYaw;charYaw=startYaw;pitch=.05;
  parkWorld.focusGame(7);
  parkGameCamera={index:7,view};
  setCameraMode('third');parkFocusZone=null;input.clear();touch.clear();
  avatar.root.position.set(player.x,0,player.z);
}
export function cycleParkGameCameraView(){
  if(!parkGameCamera)return false;
  const idx=parkGameCamera.index;
  const presets={
    0:['close','stand','track'],
    1:['pad','orbit','tracker'],
    2:['altar','pond','overview'],
    3:['follow','side','lookdown'],
    4:['sideline','faceoff','overhead'],
    5:['striker','keeper','stadium'],
    6:['facade','isometric','walk'],
    7:['maze_preview','maze_walk','maze_top'],
    8:['rider','wheel_front','aerial'],
    9:['eye','near','far'],
    10:['hotseat','crane','overhead']
  };
  const list=presets[idx]||['default'];
  const curIdx=list.indexOf(parkGameCamera.view);
  const nextView=list[(curIdx+1)%list.length];
  parkGameCamera.view=nextView;
  const viewNames={
    close:'Cận cảnh gà đua',stand:'Khán đài trường gà',track:'Toàn cảnh đường đua',
    pad:'Bệ phóng tên lửa',orbit:'Quỹ đạo vũ trụ',tracker:'Bám đuôi tên lửa',
    altar:'Chính diện điện thờ',pond:'Bờ hồ sen trí tuệ',overview:'Toàn cảnh Tam Quan',
    follow:'Theo nhịp cầu kính',side:'Góc nghiêng cầu',lookdown:'Góc nhìn xuống vực',
    sideline:'Khán đài đường biên',faceoff:'Cận cảnh đối đầu',overhead:'Trên cao sân kéo',
    striker:'Cầu thủ sút phạt',keeper:'Thủ môn bắt bóng',stadium:'Khán đài cầu trường',
    facade:'Mặt tiền kiến trúc',isometric:'Phối cảnh 3D',walk:'Dạo quanh công trình',
    maze_preview:'Cổng vào mê cung',maze_walk:'Người chạy mê cung',maze_top:'Bản đồ vệ tinh từ trên đỉnh',
    rider:'Cabin vòng đu quay',wheel_front:'Mặt trước vòng quay',aerial:'Toàn cảnh trên cao',
    eye:'👁 Góc nhìn Mắt (Trong giỏ khinh khí cầu ngắm toàn cảnh)',near:'🔎 Góc nhìn Gần (Bay sát khinh khí cầu)',far:'🎥 Góc nhìn Xa (Toàn cảnh thấy khinh khí cầu di chuyển)',
    bow:'Mũi thuyền rẽ sóng',promenade:'Bờ hồ ngắm thuyền',overhead:'Flycam mặt hồ',
    hotseat:'Ghế nóng trường quay',crane:'Cần cẩu khán phòng',overhead:'Trần trường quay'
  };
  status('Góc nhìn Game: '+(viewNames[nextView]||nextView));
  return true;
}

function leaveMazeMode(){
  if(mazeReturnPosition){player={...mazeReturnPosition};mazeReturnPosition=null;avatar.root.position.set(player.x,0,player.z);}
  leaveParkGameCamera();input.clear();touch.clear();
  setCameraMode('third');
}

function enterSanctuaryRoom(){
  if(!parkWorld.gateOpen){status('Mở cổng công viên trước khi vào Phòng Thích Học Bá.');return;}
  parkWorld.enterSanctuary();const p=parkWorld.getSanctuaryDoorWorldPosition();
  player={x:p.x,z:p.z};yaw=Math.PI;charYaw=Math.PI;pitch=0;
  avatar.root.position.set(player.x,0,player.z);setCameraMode('third');
  parkFocusZone=null;input.clear();touch.clear();
  status('Đã bước qua cổng chiều không gian: Phòng Thích Học Bá. Đi tới NPC Trí Tuệ để bốc quẻ.');
}
function exitSanctuaryRoom(){
  parkUI?.stopTempleSound?.();
  parkWorld.leaveSanctuary();leaveParkGameCamera();
  const p=parkWorld.getZoneWorldPosition(2);
  player={x:p.x,z:p.z-9.0};yaw=0;charYaw=0;pitch=0;
  avatar.root.position.set(player.x,0,player.z);
  setCameraMode('third');input.clear();touch.clear();
  status('Đã trở về quảng trường công viên, trước cổng Phòng Thích Học Bá.');
}
function toSanctuaryDoor(){
  if(!parkWorld.sanctuaryActive)return;
  const p=parkWorld.getSanctuaryDoorWorldPosition();
  player={x:p.x,z:p.z};yaw=Math.PI;charYaw=Math.PI;
  avatar.root.position.set(player.x,0,player.z);
}
function navigateMasterMap(place){
  if(mode!=='lobby')moveToLobby();
  if(parkWorld.sanctuaryActive)exitSanctuaryRoom();
  parkUI?.hide();
  let dest=null;
  if(place==='entry')dest={...GRAND_DOME_LAYOUT.playerSpawn};
  else if(place==='reception')dest={x:0,z:8};
  else if(place==='lab')dest={x:GRAND_DOME_LAYOUT.lab.x+3,z:GRAND_DOME_LAYOUT.lab.z};
  else if(place==='museum')dest={x:GRAND_DOME_LAYOUT.museum.x-3,z:GRAND_DOME_LAYOUT.museum.z};
  else if(place==='discovery')dest={...DISCOVERY_SITE.entry};
  else if(place==='park'){moveToParkGate();parkUI?.showGate();return;}
  else if(place.startsWith('zone:')){
    const i=Number(place.slice(5));
    if(!Number.isInteger(i)||i<0||i>=parkWorld.zones.length)return;
    if(!parkWorld.gateOpen){moveToParkGate();parkUI?.showGate();status('Mở cổng công viên trước khi vào 11 khu trò chơi.');return;}
    visitParkZone(i);focusParkZone(i);parkUI?.showZone(i);return;
  }
  if(dest){player=dest;charYaw=Math.PI;yaw=0;parkFocusZone=null;
    avatar.root.position.set(player.x,0,player.z);setCameraMode('third');
    status('Đã đến: '+place+' · Nhấn E ở điểm tương tác gần nhất.');}
}
function enterGamePark(){
  if(mode!=='lobby')moveToLobby();
  // V2: the quick button never creates a second scene, page, iframe or renderer.
  moveToParkGate();
  parkUI?.showGate();
}
function setDiscoveryRoom(room){
  if(mode!=='discovery')return;
  const spawn=discovery.setRoom(room);player={...spawn,y:spawn.y||0};yaw=0;charYaw=Math.PI;pitch=.10;
  avatar.root.position.set(player.x,player.y||0,player.z);input.clear();touch.clear();
  discoveryUI?.showRoom(room);
  if(room==='map')discoveryMapUI?.show();else discoveryMapUI?.hide();
  const names={foyer:'SẢNH DISCOVERY · BẢNG CHỈ DẪN 2 PHÒNG & NPC',globe:'PHÒNG A UNESCO 3D · 3 TẦNG (35 MÔ HÌNH)',unesco:'PHÒNG A UNESCO 3D · 3 TẦNG (35 MÔ HÌNH)',map:'BẢN ĐỒ THẾ GIỚI · DI SẢN UNESCO',gallery:'PHÒNG B · 3 TẦNG (68 TRANH & MÔ HÌNH 3D)'};
  $('room-name').textContent=names[room]||names.foyer;
  status(names[room]);
}
function snapDiscoveryCamera(){
  discovery.clearRoomSnap?.();
  const py=mode==='discovery'?(Number(player.y)||0):0;
  camera.position.set(player.x-Math.sin(yaw)*cameraDollyCurrent,py+Math.max(2.55,2.1+cameraDollyCurrent*.29)+pitch*2.4,player.z+Math.cos(yaw)*cameraDollyCurrent);
  camera.lookAt(player.x,py+1.8,player.z-Math.cos(yaw)*3);
  camera.updateMatrixWorld(true);
}
function teleportDiscoveryFloor(room,floorIdx=0){
  if(mode!=='discovery')enterDiscovery();
  if((room==='unesco'||room==='globe')&&discovery.setUnescoFloor){
    if(discovery.currentRoom!=='globe')setDiscoveryRoom('globe');
    const pos=discovery.setUnescoFloor(floorIdx);
    player={x:pos.x,y:pos.y||0,z:pos.z};
    if(Number.isFinite(pos.yaw)){yaw=pos.yaw;charYaw=pos.yaw;}
    avatar.root.position.set(player.x,player.y,player.z);
    snapDiscoveryCamera();
    status(`Đã lên Tầng ${floorIdx+1} · Phòng A UNESCO 3D (y = ${player.y}m)`);
  }else if(room==='gallery'&&discovery.setGalleryFloor){
    if(discovery.currentRoom!=='gallery')setDiscoveryRoom('gallery');
    const pos=discovery.setGalleryFloor(floorIdx);
    player={x:pos.x,y:pos.y||0,z:pos.z};
    if(Number.isFinite(pos.yaw)){yaw=pos.yaw;charYaw=pos.yaw;}
    avatar.root.position.set(player.x,player.y,player.z);
    snapDiscoveryCamera();
    status(`Đã lên Tầng ${floorIdx+1} · Phòng B 32 Ảnh Thật & Mô hình 3D (y = ${player.y}m)`);
  }
}
window.__teleportDiscoveryFloor=teleportDiscoveryFloor;
window.__setDiscoveryPose=({x,y,z,yaw:ny,pitch:np}={})=>{
  if(Number.isFinite(x))player.x=x;
  if(Number.isFinite(y))player.y=y;
  if(Number.isFinite(z))player.z=z;
  if(Number.isFinite(ny)){yaw=ny;charYaw=ny;}
  if(Number.isFinite(np))pitch=np;
  avatar.root.position.set(player.x,player.y||0,player.z);
  snapDiscoveryCamera();
  return {...player,yaw,pitch};
};
window.__getDiscoveryPose=()=>({...player,yaw,pitch});
const DISCOVERY_NPCS={
  chief:{
    eyebrow:'BAN CHỈ DẪN TRUNG TÂM · MATHVERSE DISCOVERY',
    name:'GS. Minh Triết — Trưởng ban Triển lãm Hình học & Di sản',
    greeting:'Chào mừng thầy cô và các em đến Hành lang Khám phá MATHVERSE Discovery! Ở chính giữa sảnh là Bảng Chỉ Dẫn 2 Căn Phòng 3 Tầng. Hai bên hành lang đối xứng là Địa Cầu 3D Tương Tác (bên trái, 34 điểm) và Bản Đồ Thế Giới (bên phải, 34 điểm). Cửa bên trái dẫn vào Phòng A — Đại sảnh UNESCO 3D 3 tầng (35 mô hình kiến trúc). Cửa bên phải dẫn vào Phòng B — Đại sảnh 68 Tranh & Mô hình Hình học 3 tầng!',
    quote:'Mỗi công trình kiến trúc và mỗi hiện tượng tự nhiên đều ẩn chứa những cấu trúc hình học kỳ diệu có thể mô phỏng trực quan bằng 3D và 2D.',
    primaryLabel:'🏛️ VÀO PHÒNG A (UNESCO 3 TẦNG)',
    primaryRoom:'unesco',
    secondaryLabel:'📐 VÀO PHÒNG B (68 TRANH 3 TẦNG)',
    secondaryRoom:'gallery'
  },
  unesco_guide:{
    eyebrow:'HƯỚNG DẪN VIÊN PHÒNG A · ĐẠI SẢNH KIẾN TRÚC 3 TẦNG',
    name:'KTS. Bảo Ngọc — Chuyên gia Hình học Kiến trúc & Di sản UNESCO',
    greeting:'Chào mừng thầy cô và các em đến trước Phòng A — Đại sảnh UNESCO & Kỳ quan 3D! Căn phòng được thiết kế 3 tầng rộng lớn có cầu thang đi bộ lên: Tầng 1 trưng bày 16 công trình R106 và bản quét GLB Đền Parthenon R98; Tầng 2 trưng bày 10 công trình di sản & cầu tháp R107; Tầng 3 trưng bày 9 Kỳ quan Cổ đại & Thế giới mới. Tất cả 35 mô hình đều có đầy đủ mục Sketchfab, Hình học 3D xoay 360° và Hình 2D!',
    quote:'Hãy đi bộ lên cầu thang hoặc bấm nút chọn Tầng 1, Tầng 2, Tầng 3 để quan sát trọn vẹn 35 công trình trong cùng một không gian.',
    primaryLabel:'🏛️ BƯỚC VÀO PHÒNG A (TẦNG 1)',
    primaryRoom:'unesco',
    secondaryLabel:'🔼 VÀO NGAY TẦNG 2 PHÒNG A',
    secondaryRoom:'unesco_f2'
  },
  gallery_guide:{
    eyebrow:'HƯỚNG DẪN VIÊN PHÒNG B · ĐẠI SẢNH 32 ẢNH THẬT & MÔ HÌNH 3D',
    name:'TS. Hoàng Nam — Chuyên gia Mô hình hóa Toán học Thực tiễn',
    greeting:'Chào mừng thầy cô và các em đến trước Phòng B — Đại sảnh 32 Ảnh Thật & Mô hình Hình học Thực tế (đã lọc bỏ hoàn toàn các tranh không có ảnh xác thực)! Căn phòng được mở rộng thành 3 tầng có cầu thang đi bộ lên: Tầng 1 trưng bày 15 ảnh thật Đời sống R106 & R93; Tầng 2 trưng bày 9 ảnh thật Thiên nhiên R107; Tầng 3 trưng bày 8 ảnh thật Kỹ thuật R107. Trước mỗi khung ảnh thật đều có bục mô hình 3D trực quan!',
    quote:'Khi bấm vào bất kỳ bức ảnh thật hay bục 3D nào, các em đều có thể chuyển đổi qua lại giữa Mô hình 3D xoay 360° và Sơ đồ Hình học 2D.',
    primaryLabel:'📐 BƯỚC VÀO PHÒNG B (TẦNG 1)',
    primaryRoom:'gallery',
    secondaryLabel:'🔼 VÀO NGAY TẦNG 2 PHÒNG B',
    secondaryRoom:'gallery_f2'
  }
};
function openDiscoveryNpcGuide(npcId='chief'){
  const info=DISCOVERY_NPCS[npcId]||DISCOVERY_NPCS.chief;
  const dialog=$('grade-guide-dialog');
  if(!dialog)return;
  $('grade-guide-eyebrow').textContent=info.eyebrow;
  $('grade-guide-heading').textContent=info.name;
  $('grade-guide-description').innerHTML=`
    <p>${info.greeting}</p>
    <blockquote style="border-left:3px solid #2dcab8;padding-left:12px;margin:12px 0;color:#fde68a;font-style:italic;">"${info.quote}"</blockquote>
  `;
  const startBtn=$('grade-guide-start');
  const catBtn=$('grade-guide-catalog');
  if(startBtn){
    startBtn.textContent=info.primaryLabel;
    startBtn.onclick=()=>{
      closeGradeGuide();
      setDiscoveryRoom(info.primaryRoom);
    };
  }
  if(catBtn){
    catBtn.textContent=info.secondaryLabel;
    catBtn.onclick=()=>{
      closeGradeGuide();
      if(info.secondaryRoom==='unesco_f2'){setDiscoveryRoom('unesco');teleportDiscoveryFloor('unesco',1);}
      else if(info.secondaryRoom==='gallery_f2'){setDiscoveryRoom('gallery');teleportDiscoveryFloor('gallery',1);}
      else setDiscoveryRoom(info.secondaryRoom);
    };
  }
  $('grade-guide-speak').onclick=()=>{
    speakVietnamese(`${info.name}. ${info.greeting} ${info.quote}`);
  };
  $('grade-guide-close').onclick=closeGradeGuide;
  $('grade-guide-backdrop').onclick=closeGradeGuide;
  dialog.hidden=false;
  input.clear();touch.clear();
}
function enterDiscovery(){
  if(mode!=='lobby')moveToLobby();
  // Do not mutate Museum/Lab/Park; hide the campus, show this scene only.
  mode='discovery';document.body.classList.remove('campus-lobby');showLobbyMenu(false);
  lobbyGroup.visible=false;discovery.interior.visible=true;
  input.clear();touch.clear();parkUI?.hide();parkGameCamera=null;parkFocusZone=null;
  $('to-lobby').hidden=false;$('museum-hud').hidden=true;if($('plaza-guide-hint'))$('plaza-guide-hint').hidden=true;
  $('mode-pill').textContent='DISCOVERY · KHU THỨ TƯ';
  setCameraMode('third');setWorldCameraDolly(7.9);
  setDiscoveryRoom('foyer');
  // Defer UNESCO map canvas update off the entry frame so entering Discovery foyer is 100% lag-free
  setTimeout(()=>{void discoveryMapUI?.update?.();},650);
}
function handleDiscoveryAction(action){
  if(!action)return false;
  if(action.type==='enter'){enterDiscovery();return true;}
  if(action.type==='go'){setDiscoveryRoom(action.room);return true;}
  if(action.type==='exit'){moveToLobby();return true;}
  if(action.type==='discovery-npc'){openDiscoveryNpcGuide(action.npcId);return true;}
  if(action.type==='unesco-floor'){teleportDiscoveryFloor('unesco',action.floor);return true;}
  if(action.type==='gallery-floor'){teleportDiscoveryFloor('gallery',action.floor);return true;}
  if(action.type==='world-map-open'){discoveryMapUI?.show();input.clear();return true;}
  if(action.type==='globe-list'){discoveryUI?.showRoom('foyer');status('🌍 Chọn chấm di sản UNESCO trên địa cầu hoặc tên trong danh mục để xem ảnh thật & mô hình.');return true;}
  if(action.type==='world-wonder'){discoveryMapUI?.hide();wondersUI?.open(action.id,discovery.currentRoom==='globe'?'room':'globe');input.clear();return true;}
  if(['landmark','artwork'].includes(action.type)){discoveryUI?.openItem(action.id);input.clear();return true;}
  return false;
}
function enterMuseum(){
  if(mode!=='lobby')moveToLobby();
  mode='museum';document.body.classList.remove('campus-lobby');input.clear();touch.clear();showLobbyMenu(false);
  lobbyGroup.visible=false;
  if(!gallery||gallery.disposed){
    gallery=new InfographicGallery({scene,items:catalog.items,onSelect:openPoster});
  }else if(gallery.group){
    gallery.group.visible=true;
  }
  gallery.setQuality(mobileQuality);gallery.setAerialRoofVisibility(['top','iso','overview'].includes(cameraMode));
  // Every museum entry begins in the rotunda so all seven wings are visible.
  player={x:0,z:ENTRANCE_Z};yaw=0;pitch=.12;
  $('museum-hud').hidden=false;$('to-lobby').hidden=false;
  closeRoomMap();closeGradeGuide();
  $('mode-pill').textContent='INFOGRAPHIC MUSEUM';$('room-name').textContent=COPY.firstRoom;
  avatar.root.position.set(player.x,0,player.z);
  buildNav();updateMuseumHud(true);status(COPY.firstRoom);
}
let pendingR75Action=null;
function injectR75CompactToolbar(doc){
  if(!doc||doc.getElementById('mv-r107-compact-style'))return;
  const st=doc.createElement('style');
  st.id='mv-r107-compact-style';
  st.textContent=`
    #mv-compact-launcher.r107-collapsed > button:not(#mv-r107-toggle-bar) { display: none !important; }
    #mv-compact-launcher.r107-collapsed {
      left: 14px !important; transform: none !important; top: 10px !important;
      padding: 4px 6px !important; border-radius: 999px !important;
      background: rgba(8, 28, 46, 0.92) !important; border: 1.5px solid #fbbf24 !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45) !important;
    }
    #mv-r107-toggle-bar {
      background: linear-gradient(135deg, #f59e0b, #eab308) !important;
      color: #081c2e !important; font-weight: 900 !important;
      border-radius: 999px !important; padding: 6px 14px !important;
      border: 1px solid #fef08a !important; cursor: pointer !important;
      font-size: 12px !important; display: inline-flex !important; align-items: center !important; gap: 6px !important;
    }
    #mv-r107-lab-quick-hud {
      position: fixed; top: 10px; left: 225px; z-index: 2147400000;
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      background: rgba(7, 20, 36, 0.92); border: 1.5px solid rgba(56, 189, 248, 0.55);
      padding: 5px 10px; border-radius: 999px; box-shadow: 0 10px 26px rgba(0,0,0,0.5);
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    #mv-r107-lab-quick-hud button {
      border-radius: 999px; padding: 5px 11px; font-size: 12px; font-weight: 800;
      cursor: pointer; border: 1px solid rgba(148, 163, 184, 0.45);
      background: #1e293b; color: #f8fafc;
    }
    #mv-r107-lab-quick-hud button.lobby-btn {
      background: linear-gradient(135deg, #d97706, #b45309); border-color: #fde047; color: #fffbeb;
    }
    #mv-r107-lab-quick-hud button.boost-btn {
      background: linear-gradient(135deg, #059669, #0d9488); border-color: #6ee7b7; color: #ecfdf5;
    }
    #mv-r107-lab-quick-hud button.tts-btn {
      background: linear-gradient(135deg, #6d28d9, #9333ea); border-color: #d8b4fe; color: #faf5ff;
    }
    #mv-r107-lab-quick-hud button.voice-btn {
      background: linear-gradient(135deg, #0284c7, #0369a1); border-color: #7dd3fc; color: #f0f9ff;
    }
  `;
  doc.head?.appendChild(st);
  if(doc.defaultView){
    doc.defaultView.__mathverseSpeakText=speakVietnamese;
    doc.defaultView.__mathverseStopSpeech=stopVietnameseSpeech;
  }
  const bar=doc.getElementById('mv-compact-launcher');
  if(bar&&!doc.getElementById('mv-r107-toggle-bar')){
    bar.classList.add('r107-collapsed');
    const tBtn=doc.createElement('button');
    tBtn.type='button';tBtn.id='mv-r107-toggle-bar';
    tBtn.innerHTML='⊞ <span>Công cụ Phòng Lab ▾</span>';
    tBtn.title='Mở / Thu gọn thanh công cụ nội khu Phòng Lab';
    tBtn.onclick=()=>{
      const collapsed=bar.classList.toggle('r107-collapsed');
      tBtn.innerHTML=collapsed?'⊞ <span>Công cụ Phòng Lab ▾</span>':'✕ <span>Thu gọn</span>';
    };
    bar.insertBefore(tBtn,bar.firstChild);
  }
  if(!doc.getElementById('mv-r107-lab-quick-hud')){
    const qHud=doc.createElement('div');
    qHud.id='mv-r107-lab-quick-hud';
    qHud.innerHTML=`
      <button type="button" class="lobby-btn" id="r75-quick-main-lobby" title="Quay về Sảnh Chính 4 Khu vực">🏛 Về Sảnh Chính</button>
      <button type="button" class="boost-btn" id="r75-quick-boost" title="Bật/Tắt Tăng tốc di chuyển (Shift)">🚲 Tăng tốc (Shift)</button>
      <button type="button" class="tts-btn" id="r75-quick-tts" title="Nghe giọng đọc Tiếng Việt thuyết minh Tòa Lab">🔊 Thuyết minh</button>
      <button type="button" class="voice-btn" id="r75-quick-voice" title="Nói Tiếng Việt để hỏi Thầy Tùng hoặc ra lệnh">🎙 Nói Tiếng Việt</button>
      <button type="button" id="r75-cam-eye" title="Góc nhìn Mắt (Thứ nhất)">👁 Mắt</button>
      <button type="button" id="r75-cam-near" title="Góc nhìn Gần">🔍 Gần</button>
      <button type="button" id="r75-cam-far" title="Góc nhìn Xa">🔭 Xa</button>
    `;
    doc.body?.appendChild(qHud);
    doc.getElementById('r75-quick-main-lobby')?.addEventListener('click',()=>moveToLobby());
    doc.getElementById('r75-quick-boost')?.addEventListener('click',()=>{
      const active=doc.defaultView?.museum?.toggleSprint?.();
      const b=doc.getElementById('r75-quick-boost');
      if(b)b.textContent=active?'⚡ Đang Tăng tốc (Shift)':'🚲 Tăng tốc (Shift)';
    });
    doc.getElementById('r75-quick-tts')?.addEventListener('click',()=>{
      if(isSpeakingVietnamese())stopVietnameseSpeech();
      else speakVietnamese(ZONE_VOICE_GUIDES.r75);
    });
    doc.getElementById('r75-quick-voice')?.addEventListener('click',()=>triggerVietnameseVoiceAssistant());
    doc.getElementById('r75-cam-eye')?.addEventListener('click',()=>doc.defaultView?.postMessage({type:'mathverse-r75-cam',preset:'eye'},'*'));
    doc.getElementById('r75-cam-near')?.addEventListener('click',()=>doc.defaultView?.postMessage({type:'mathverse-r75-cam',preset:'near'},'*'));
    doc.getElementById('r75-cam-far')?.addEventListener('click',()=>doc.defaultView?.postMessage({type:'mathverse-r75-cam',preset:'far'},'*'));
  }
}
function runPendingR75Action(win){
  if(!pendingR75Action||!win)return;
  const act=pendingR75Action;pendingR75Action=null;
  setTimeout(()=>{
    try{
      if(act.type==='kho')win.document?.getElementById('btn-curriculum')?.click();
      else if(act.type==='grade'){
        if(win.curriculumExplorer?.open)win.curriculumExplorer.open(act.grade);
        else win.document?.getElementById('btn-curriculum')?.click();
      }else if(act.type==='studio')win.document?.getElementById('btn-studio-launchpad')?.click();
      else if(act.type==='history')win.__MATHVERSE_EXHIBITION_CORE_R74__?.open?.();
    }catch(e){console.warn('Pending R75 action issue',e);}
  },180);
}
function syncR75(){
  const iframe=$('r75-frame');
  try{
    const win=iframe.contentWindow;
    const api=win?.museum;
    if(!api)return false;
    injectR75CompactToolbar(win.document);
    if(api.getAvatarType?.()!==avatar.getAvatarType())api.setAvatarType?.(avatar.getAvatarType());
    if(r75State)api.restoreState?.(r75State);
    api.setPaused?.(false);
    api.setViewMode?.(cameraMode);
    frameReady=true;
    runPendingR75Action(win);
    return true;
  }catch(e){console.warn('R75 API unreachable',e);return false;}
}
function enterR75(){
  if(mode!=='lobby')moveToLobby();
  mode='r75';document.body.classList.remove('campus-lobby');input.clear();touch.clear();showLobbyMenu(false);
  $('r75-shell').hidden=false;
  $('topbar').hidden=true;$('screen').hidden=true;canvas.hidden=true;
  const iframe=$('r75-frame');
  if(!frameLoaded){
    frameLoaded=true;iframe.addEventListener('load',()=>{
      let attempts=0;const boot=()=>{
        if(syncR75())return;
        if(++attempts<35)setTimeout(boot,250);
        else console.warn('R75 iframe loaded but API not ready');
      };boot();
    });iframe.src='/r75/';
  }else syncR75();
}
function gotoGrade(grade){
  if(mode!=='museum'||!gallery)return;
  const position=gallery.gotoGrade(grade);player=position;input.clear();touch.clear();
  yaw=gallery.getPlan().find(p=>p.grade===Number(grade))?.theta||0;
  gallery.tick(player);updateMuseumHud(true);status(`Đang tham quan phòng Toán ${grade}`);
}
function setCameraMode(value){
  if(!CAMERA_MODES.includes(value))return;
  cameraMode=value;$('camera-mode').value=value;
  localStorage.setItem('mathverse-museum-camera-v5',value);
  if(mode==='museum')gallery?.setAerialRoofVisibility(value==='top'||value==='iso'||value==='overview');
  try{$('r75-frame').contentWindow?.museum?.setViewMode?.(value);}catch{}
  status('Góc nhìn: '+({third:'Theo vai',first:'Mắt nhân vật',top:'Từ trên cao',iso:'Góc xiên 3D',overview:'Toàn cảnh'}[value]));
}
function cycleAvatar(){
  const types=ALL_AVATAR_IDS;
  const current=avatar.getAvatarType();
  const next=types[(types.indexOf(current)+1)%types.length];
  saveAvatar(next);$('avatar-select').value=next;
  const chibiName=CHIBI_PRESETS.find(x=>x.id===next)?.name;
  status('Nhân vật: '+({alex:'Thầy Tùng (Chibi 3D)',triet:'Minh Triết (Chibi 3D)',an:'Tuệ An (Chibi 3D)',bot:'Bot Pi (Chibi 3D)',suhocba:'Sư Học Bá · Sư Chùa Đầu Trọc (Chibi 3D)'}[next]||chibiName||next));
}
function setPresentation(value){
  presentation=Boolean(value);
  document.body.classList.toggle('museum-presenting',presentation);
  $('present-mode').setAttribute('aria-pressed',String(presentation));
  $('present-mode').textContent=presentation?'KẾT THÚC TRÌNH CHIẾU':'TRÌNH CHIẾU';
}
let catalogTopic='all';
function matchTopic(it,topic){
  if(topic==='all')return true;
  const t=`${it.topic||''} ${it.title}`.toLowerCase();
  if(topic==='geom')return /hình|góc|tam giác|tứ giác|tròn|vectơ|toạ độ|tọa độ|không gian|mặt phẳng|khối/.test(t);
  if(topic==='stat')return /thống kê|xác suất|dữ liệu|biểu đồ|mẫu/.test(t);
  if(topic==='alg')return !/hình|góc|tam giác|tứ giác|tròn|không gian/.test(t);
  return true;
}
function openCatalog(grade=6){
  if(mode!=='museum')return;
  catalogGrade=Number(grade)||6;
  catalogTopic='all';
  $('catalog-modal').hidden=false;
  $('catalog-search').value='';
  renderCatalog();input.clear();touch.clear();
}
function closeCatalog(){if($('catalog-modal'))$('catalog-modal').hidden=true;}
let catalogSemester='all', catalogView='grid';
function renderCatalog(){
  if(mode!=='museum')return;
  const tabs=$('catalog-grade-tabs');tabs.replaceChildren();
  for(let grade=6;grade<=12;grade++){
    const button=document.createElement('button');button.type='button';
    button.textContent=`Lớp ${grade}`;button.setAttribute('aria-current',String(grade===catalogGrade));
    button.onclick=()=>{catalogGrade=grade;renderCatalog();};tabs.append(button);
  }
  for(const btn of document.querySelectorAll('#catalog-topic-tabs .catalog-topic-pill')){
    btn.classList.toggle('active',btn.dataset.topic===catalogTopic);
    btn.onclick=()=>{catalogTopic=btn.dataset.topic;renderCatalog();};
  }
  for(const btn of document.querySelectorAll('#catalog-semester-tabs .catalog-sem-pill')){
    btn.classList.toggle('active',btn.dataset.sem===catalogSemester);
    btn.onclick=()=>{catalogSemester=btn.dataset.sem;renderCatalog();};
  }
  const query=$('catalog-search').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const all=catalog.items.filter(it=>Number(it.grade)===catalogGrade).sort((a,b)=>a.number-b.number);
  const midPoint=Math.ceil(all.length/2);
  const visible=all.filter(it=>{
    const semOk=catalogSemester==='all'||(catalogSemester==='hk1'?it.number<=midPoint:it.number>midPoint);
    return semOk&&matchTopic(it,catalogTopic)&&(!query||`${it.title} ${it.number} ${it.topic||''}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query));
  });
  $('catalog-counter').textContent=`Lớp ${catalogGrade}: ${visible.length}/${all.length} infographic`;
  const grid=$('catalog-grid');grid.replaceChildren();
  if(catalogView==='list')grid.classList.add('list-view');else grid.classList.remove('list-view');
  for(const it of visible){
    const item=document.createElement('article');item.className='catalog-item';
    const button=document.createElement('button');button.type='button';button.className='catalog-preview';
    const img=document.createElement('img');img.src=it.src;img.alt=it.title;img.loading='lazy';img.decoding='async';
    const title=document.createElement('strong');title.textContent=it.title;
    button.append(img,title);button.onclick=()=>{closeCatalog();openPoster(it);};
    const jump=document.createElement('button');jump.type='button';jump.className='catalog-jump';
    jump.textContent='ĐI TỚI KHUNG TRANH';jump.onclick=()=>{
      const poster=gallery?.posters.find(p=>p.item.id===it.id);
      if(!poster)return;
      const viewing=gallery.getViewingSpot(poster);
      player={x:viewing.x,z:viewing.z};yaw=viewing.yaw;
      charYaw=yaw;avatar.root.position.set(player.x,0,player.z);
      closeCatalog();gallery.tick(player);updateMuseumHud(true);status(`Đã đến Bài ${it.number} · Lớp ${it.grade}`);
    };
    item.append(button,jump);grid.append(item);
  }
}
function openRoomMap(){if(mode!=='museum')return;closeCatalog();$('room-map-modal').hidden=false;input.clear();touch.clear();}
function closeRoomMap(){if($('room-map-modal'))$('room-map-modal').hidden=true;}
function buildNav(){
  const nav=$('grade-nav');nav.replaceChildren();
  const grid=$('room-map-grid');grid.replaceChildren();
  for(let grade=6;grade<=12;grade++){
    const btn=document.createElement('button');btn.type='button';btn.textContent=`L${grade}`;btn.dataset.grade=String(grade);
    btn.onclick=()=>gotoGrade(grade);
    nav.append(btn);
    const link=document.createElement('button');link.type='button';link.className='room-map-door';
    link.textContent=`TOÁN ${grade}`;link.dataset.grade=String(grade);
    // V7 circular minimap: seven fan rooms are placed around one central podium.
    const theta=gallery?.getPlan().find(p=>p.grade===grade)?.theta??0;
    link.style.left=`${50+37*Math.sin(theta)}%`;
    link.style.top=`${50-37*Math.cos(theta)}%`;
    link.title=`Vào phòng Toán ${grade}`;link.onclick=()=>{gotoGrade(grade);closeRoomMap();};
    grid.append(link);
  }
}
function updateMuseumHud(force=false){
  if(mode!=='museum'||!gallery)return;
  const room=gallery.tick(player);const grade=room?.grade||null;
  if(force||grade!==lastGrade){
    lastGrade=grade;
    $('grade-title').textContent=grade?`TOÁN ${grade}`:COPY.entrance;
    $('grade-subtitle').textContent=grade?`${room.lessons.length} infographic · ${COPY.lessons}`:COPY.firstRoom;
    for(const door of $('room-map-grid').querySelectorAll('button'))door.setAttribute('aria-current',String(Number(door.dataset.grade)===grade));
    $('room-name').textContent=grade?`${COPY.room} ${grade} · ${room.lessons.length} infographic`:COPY.entrance;
    for(const btn of $('grade-nav').querySelectorAll('button'))btn.setAttribute('aria-current',String(Number(btn.dataset.grade)===grade));
  }
  if(grade){
    const closest=gallery.posters.filter(p=>p.item.grade===grade).sort((a,b)=>
      Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z))[0];
    const step=closest?.item.number??1;
    const proportion=Math.max(0,Math.min(1,step/room.lessons.length));
    $('progress-label').textContent=`Lớp ${grade} · gần Bài ${step}/${room.lessons.length}`;
    $('progress-fill').style.width=`${Math.round(proportion*100)}%`;
  }else{$('progress-label').textContent=COPY.entrance;$('progress-fill').style.width='0%';}
}
function jumpToRelativeLesson(delta){
  if(mode!=='museum'||!gallery)return;
  const room=gallery.tick(player);
  if(!room||!room.grade)return;
  const gradePosters=gallery.posters.filter(p=>p.item.grade===room.grade).sort((a,b)=>a.item.number-b.item.number);
  if(!gradePosters.length)return;
  const closest=gradePosters.slice().sort((a,b)=>
    Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z))[0];
  const curIdx=gradePosters.indexOf(closest);
  let nextIdx=curIdx+delta;
  if(nextIdx<0)nextIdx=0;
  if(nextIdx>=gradePosters.length)nextIdx=gradePosters.length-1;
  const targetPoster=gradePosters[nextIdx];
  if(!targetPoster)return;
  const viewing=gallery.getViewingSpot(targetPoster);
  player={x:viewing.x,z:viewing.z};yaw=viewing.yaw;charYaw=yaw;
  avatar.root.position.set(player.x,0,player.z);
  gallery.tick(player);updateMuseumHud(true);
  status(`Đã đến ${targetPoster.item.title} · Lớp ${targetPoster.item.grade}`);
}
function openPoster(item){
  if(mode!=='museum')return;
  activePoster=item;zoom=1;
  $('poster-modal').hidden=false;
  $('poster-image').src=item.src;$('poster-image').alt=item.title;
  $('poster-title').textContent=`TOÁN ${item.grade} · ${item.title}`;
  $('poster-info').textContent=`${COPY.stage}: ${item.page} · ${item.topic||''}`;
  const minimapImg=$('poster-minimap-img');if(minimapImg)minimapImg.src=item.src;
  setPosterZoom(1);input.clear();touch.clear();
}
function setPosterZoom(value){
  zoom=Math.min(3.8,Math.max(.5,value));
  $('poster-image').style.width=`${Math.round(zoom*800)}px`;
  $('poster-zoom-label').textContent=`${Math.round(zoom*100)}%`;
  const minimap=$('poster-minimap');
  if(minimap){
    minimap.hidden=zoom<=1.25;
    updatePosterMinimap();
  }
}
function updatePosterMinimap(){
  const stage=$('poster-stage'), box=$('poster-minimap-box');
  if(!stage||!box||zoom<=1.25)return;
  const ratioW=Math.min(1,stage.clientWidth/(zoom*800));
  const ratioH=Math.min(1,stage.clientHeight/(stage.scrollHeight||1));
  box.style.width=`${Math.round(ratioW*100)}%`;
  box.style.height=`${Math.round(ratioH*100)}%`;
  const scrollRatioX=stage.scrollWidth>stage.clientWidth?stage.scrollLeft/(stage.scrollWidth-stage.clientWidth):0;
  const scrollRatioY=stage.scrollHeight>stage.clientHeight?stage.scrollTop/(stage.scrollHeight-stage.clientHeight):0;
  box.style.left=`${Math.round(scrollRatioX*(1-ratioW)*100)}%`;
  box.style.top=`${Math.round(scrollRatioY*(1-ratioH)*100)}%`;
}
function closePoster(){
  $('poster-modal').hidden=true;$('poster-image').removeAttribute('src');activePoster=null;input.clear();touch.clear();
  const minimap=$('poster-minimap');if(minimap)minimap.hidden=true;
}

// V16: Auto-Guided Presentation Tour (Tour Tự Hành)
let autoTourActive=false, autoTourInterval=null;
function toggleAutoTour(){
  autoTourActive=!autoTourActive;
  const btn=$('auto-tour-btn');
  if(btn)btn.classList.toggle('active',autoTourActive);
  if(autoTourActive){
    if(btn)btn.textContent='⏸ DỪNG TOUR TỰ HÀNH';
    status('Đã bật Tour Tự Hành · Tự động lướt từng bài học');
    jumpToRelativeLesson(1);
    autoTourInterval=setInterval(()=>{
      if(!autoTourActive||mode!=='museum'){stopAutoTour();return;}
      jumpToRelativeLesson(1);
    },8500);
  }else{
    stopAutoTour();
  }
}
function stopAutoTour(){
  autoTourActive=false;
  if(autoTourInterval){clearInterval(autoTourInterval);autoTourInterval=null;}
  const btn=$('auto-tour-btn');
  if(btn){btn.classList.remove('active');btn.textContent='▶ TOUR TỰ HÀNH (AUTO)';}
}
function navigatePoster(direction){
  if(!activePoster)return;
  const arr=catalog.items.filter(i=>i.grade===activePoster.grade).sort((a,b)=>a.number-b.number);
  const i=arr.findIndex(x=>x.id===activePoster.id);
  openPoster(arr[(i+direction+arr.length)%arr.length]);
}
const guideSpeech='Chào mừng em đến sảnh trung tâm MATHVERSE Grand Dome! Từ tâm sảnh theo 4 đại lộ đối xứng chữ thập: rẽ trái (Hướng Tây) đến MATHVERSE LAB (310 mô hình 3D), rẽ phải (Hướng Đông) vào Bảo tàng Infographic (230 bài học), đi thẳng phía trước (Hướng Bắc) tới Khu Khám Phá DISCOVERY 3D (Địa cầu, 35 Kỳ quan UNESCO & 32 Ảnh thật 3 tầng), và đi hướng đối diện (Hướng Nam) là Công viên Toán học 3D với 11 trò chơi. Em có thể chọn ngay 1 trong 4 khu bên dưới hoặc bấm Bản đồ để di chuyển nhanh!';
function openGuide(){
  if(mode!=='lobby')return;
  $('guide-dialog').hidden=false;input.clear();touch.clear();
  $('guide-description').textContent=guideSpeech;
}
function closeGuide(){if($('guide-dialog'))$('guide-dialog').hidden=true;}
function speakGuide(){
  speakVietnamese(guideSpeech);
}
let currentActiveGradeNpc=null;
function openGradeGuide(npc){
  if(!npc)return;
  currentActiveGradeNpc=npc;
  const dialog=$('grade-guide-dialog');
  if(!dialog)return;
  $('grade-guide-eyebrow').textContent=`HƯỚNG DẪN VIÊN SƯ PHẠM · TOÁN ${npc.grade}`;
  $('grade-guide-heading').textContent=`${npc.profile.name} — ${npc.profile.title}`;
  $('grade-guide-description').innerHTML=`
    <p>${npc.profile.greeting}</p>
    <blockquote style="border-left:3px solid #e7c17c;padding-left:12px;margin:12px 0;color:#fce4a6;font-style:italic;">"${npc.profile.quote}"</blockquote>
  `;
  $('grade-guide-start').onclick=()=>{
    closeGradeGuide();
    const room=gallery?.rooms?.get(npc.grade);
    if(room&&room.posters.length>0){
      const p1=room.posters[0];
      const viewing=gallery.getViewingSpot(p1);
      player={x:viewing.x,z:viewing.z};
      yaw=viewing.yaw;
      charYaw=yaw;
      avatar.root.position.set(player.x,0,player.z);
      gallery.tick(player);
      updateMuseumHud(true);
      status(`Đã vào Phòng Toán ${npc.grade} · Bắt đầu từ Bài 1`);
    }
  };
  $('grade-guide-catalog').onclick=()=>{
    closeGradeGuide();
    openCatalog(npc.grade);
  };
  $('grade-guide-speak').onclick=()=>{
    speakVietnamese(`${npc.profile.name}, ${npc.profile.title}. ${npc.profile.greeting} ${npc.profile.quote}`);
  };
  $('grade-guide-close').onclick=closeGradeGuide;
  $('grade-guide-backdrop').onclick=closeGradeGuide;
  dialog.hidden=false;
  input.clear();touch.clear();
}
function closeGradeGuide(){
  const dialog=$('grade-guide-dialog');
  if(dialog)dialog.hidden=true;
  stopVietnameseSpeech();
  currentActiveGradeNpc=null;
}
function interaction(){
  if(parkUI?.quiz||parkUI?.mazeActive)return;
  if(!$('poster-modal').hidden){closePoster();return;}
  if(mode==='lobby'){
    if(discovery.nearExteriorPlayer(player)){enterDiscovery();return;}
    const parkNear=parkWorld.getNear(player);
    if(parkNear?.type==='gate'){
      if(!parkWorld.gateOpen && !parkWorld.opening){parkWorld.openGate();status('Cổng công viên đang mở ngay trên mặt bằng MATHVERSE.');}
      parkUI?.showGate();return;
    }
    if(parkNear?.type==='sanctuary-exit'){exitSanctuaryRoom();parkUI?.showZone(2);return;}
    if(parkNear?.type==='sanctuary-npc'){parkUI?.showSanctuaryNpc();return;}
    if(parkNear?.type==='zone'){focusParkZone(parkNear.index);parkUI?.showZone(parkNear.index);return;}
    if(parkNear?.type==='guide'){parkUI?.showGate();return;}
    const target=grand.getTarget(player);
    if(target==='gamepark')enterGamePark();
    else if(target==='discovery')enterDiscovery();
    else if(target==='r75')enterR75();
    else if(target==='gallery')enterMuseum();
    else if(target==='guide')openGuide();
    else status(COPY.walkHint);
  }else if(mode==='discovery'){
    handleDiscoveryAction(discovery.getNear(player));
  }else if(mode==='museum'){
    const roomReturn=gallery?.nearRoomReturnGate(player);
    if(roomReturn){
      player={x:0,z:ENTRANCE_Z};yaw=0;charYaw=0;
      avatar.root.position.set(0,0,ENTRANCE_Z);
      gallery.tick(player);updateMuseumHud(true);
      status(`🎉 Hoàn thành tham quan Toán ${roomReturn.grade}! Đã trở về Bục Tra Cứu Sảnh Trung Tâm.`);
      return;
    }
    const npc=gallery?.nearNpc(player);
    if(npc){openGradeGuide(npc);return;}
    const poster=gallery.closestPoster(player,3.8);
    if(poster)openPoster(poster.item);
    else if(gallery.nearReturn(player))moveToLobby();
    else if(gallery.nearClassification(player))openCatalog(catalogGrade);
    else {const gate=gallery.nearestDoor(player);
      if(gate){
        const current=gallery.tick(player);
        player=current?.grade===gate.grade?{x:0,z:ENTRANCE_Z}:gallery.gotoGrade(gate.grade);
        gallery.tick(player);updateMuseumHud(true);
      }
      else status(COPY.firstRoom);}
  }
}
function nearFrame(currentHallCached=null){
  if(parkUI?.quiz||parkUI?.mazeActive)return null;
  if(mode==='r75'||!$('poster-modal').hidden)return null;
  if(mode==='discovery'){
    const at=discovery.getNear(player);
    if(at?.type==='go')return at.room==='foyer'?'🚪 VỀ SẢNH DISCOVERY':`🚪 VÀO ${at.room==='unesco'||at.room==='globe'?'PHÒNG A – UNESCO 3D (3 TẦNG)':'PHÒNG B – 68 TRANH (3 TẦNG)'}`;
    if(at?.type==='exit')return '🚪 VỀ ĐẠI SẢNH MATHVERSE';
    if(at?.type==='discovery-npc')return '👨‍🏫 TRÒ CHUYỆN VỚI NPC HƯỚNG DẪN · XEM CHỈ DẪN 2 PHÒNG';
    if(at?.type==='unesco-floor')return `🔼 ĐI CẦU THANG LÊN/XUỐNG TẦNG ${at.floor+1} PHÒNG A`;
    if(at?.type==='gallery-floor')return `🔼 ĐI CẦU THANG LÊN/XUỐNG TẦNG ${at.floor+1} PHÒNG B`;
    if(at?.type==='artwork')return '🖼 XEM ẢNH THẬT & MÔ HÌNH HÌNH HỌC 3D/2D';
    if(at?.type==='world-wonder')return '🏛 XEM KỲ QUAN · SKETCHFAB & HÌNH HỌC 3D/2D';
    if(at?.type==='globe-list')return '🌍 KHÁM PHÁ CÁC ĐIỂM TRÊN ĐỊA CẦU';
  }
  if(mode==='lobby'){
    if(discovery.nearExteriorPlayer(player))return '🌍 VÀO DISCOVERY – ĐỊA CẦU VÀ 2 PHÒNG CHỦ ĐỀ';
    const near=parkWorld.getNear(player);
    if(near?.type==='sanctuary-npc')return '🪷 GẶP NPC PHẬT TRÍ TUỆ · BỐC QUẺ KIẾN THỨC';
    if(near?.type==='sanctuary-exit')return '🚪 RỜI PHÒNG THÍCH HỌC BÁ · VỀ CÔNG VIÊN';
    if(near?.type==='gate')return parkWorld.gateOpen?'🎡 GẶP LỄ TÂN CÔNG VIÊN 3D':'🚪 MỞ CỔNG CÔNG VIÊN 3D NGAY TRONG SẢNH';
    if(near?.type==='zone')return `🎮 GẶP NPC — ${parkWorld.zones[near.index].name.toUpperCase()}`;
    if(near?.type==='guide')return '🧭 GẶP NHÂN VIÊN GIỚI THIỆU CÔNG VIÊN';
    const target=grand.getTarget(player);
    if(target==='gamepark')return '🎡 ĐI ĐẾN CỔNG CÔNG VIÊN 3D';
    if(target==='discovery')return '🌍 VÀO DISCOVERY – ĐỊA CẦU VÀ 2 PHÒNG CHỦ ĐỀ';
    if(target==='r75')return COPY.nearR75;
    if(target==='gallery')return COPY.nearMuseum;
    if(target==='guide')return COPY.nearGuide;
  }
  if(mode==='museum'){
    const roomReturn=gallery?.nearRoomReturnGate(player);
    if(roomReturn)return `HOÀN THÀNH THAM QUAN – VỀ SẢNH TRUNG TÂM (TOÁN ${roomReturn.grade})`;
    const npc=gallery?.nearNpc(player);
    if(npc)return `TRÒ CHUYỆN VỚI ${npc.profile.name.toUpperCase()} (HƯỚNG DẪN VIÊN LỚP ${npc.grade})`;
    if(gallery?.closestPoster(player,3.8))return COPY.nearPoster;
    if(gallery?.nearReturn(player))return 'MỞ CỔNG 3D – VỀ SẢNH CHÍNH';
    if(gallery?.nearClassification(player))return 'MỞ BỤC PHÂN LOẠI 230 INFOGRAPHIC';
    const gate=gallery?.nearestDoor(player);
    if(gate && !gallery?.closestPoster(player,3.8)){
      const current=currentHallCached||gallery.tick(player);
      return current?.grade===gate.grade?'TRỞ VỀ SẢNH TRUNG TÂM':`VÀO PHÒNG TOÁN ${gate.grade}`;
    }
  }
  return null;
}
function onResize(){
  const w=window.innerWidth,h=window.innerHeight;
  camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
window.addEventListener('resize',onResize);setGraphics($('quality').value);
let moveVelX=0, moveVelZ=0, lastPlayerRef=null, bikeBoostActive=false;
function toggleBikeBoost(force){
  bikeBoostActive=typeof force==='boolean'?force:!bikeBoostActive;
  const isOutdoor=mode==='lobby'&&!parkWorld.sanctuaryActive;
  avatar.setBikeMode?.(bikeBoostActive&&isOutdoor);
  const btn=$('topbar-bike-btn');
  if(btn){
    btn.classList.toggle('is-active',bikeBoostActive);
    btn.setAttribute('aria-pressed',String(bikeBoostActive));
    btn.textContent=bikeBoostActive?(isOutdoor?'🚲 ĐANG ĐI XE ĐẠP (Shift)':'⚡ ĐANG TĂNG TỐC (Shift)'):'🚲 XE ĐẠP (Shift)';
  }
  if(mode==='r75'){
    try{$('r75-frame')?.contentWindow?.postMessage({type:'mathverse-r75-sprint',active:bikeBoostActive},'*');}catch{}
  }
  status(bikeBoostActive?(isOutdoor?'🚲 Đã gọi Xe Đạp Thể Thao! Tốc độ di chuyển tăng gấp 2.4 lần.':'⚡ Đã bật chế độ Đi Bộ Tăng Tốc trong công trình!'):'🚶 Đã chuyển về tốc độ đi bộ tiêu chuẩn.');
  return bikeBoostActive;
}
function applyCameraPreset(preset){
  for(const id of ['cam-preset-eye','cam-preset-near','cam-preset-far']){
    const el=$(id);if(el)el.classList.toggle('is-active',id===`cam-preset-${preset}`);
  }
  if(mode==='r75'){
    try{$('r75-frame')?.contentWindow?.postMessage({type:'mathverse-r75-cam',preset},'*');}catch{}
  }
  if(parkGameCamera&&parkGameCamera.index===9){
    parkGameCamera.view=preset;
  }
  if(preset==='eye'){
    setCameraMode('first');
    status('👁 Góc nhìn Mắt (Thứ nhất): Quan sát trực tiếp toàn cảnh từ tầm mắt nhân vật');
  }else if(preset==='near'){
    setCameraMode('third');
    setWorldCameraDolly(4.5);
    status('🔍 Góc nhìn Gần: Camera bám sát nhân vật rõ nét');
  }else if(preset==='far'){
    setCameraMode('third');
    setWorldCameraDolly(12.2);
    status('🔭 Góc nhìn Xa: Camera mở rộng quan sát toàn cảnh không gian xung quanh');
  }
}
const cameraLookCurrent=new THREE.Vector3(0,1.8,25);
let cameraLookInitialized=false;
function shortestAngleLerp(current,target,alpha){
  let diff=((target-current+Math.PI)% (Math.PI*2));
  if(diff<0)diff+=Math.PI*2;
  diff-=Math.PI;
  return current+diff*alpha;
}
function update(dt){
  if(mode==='r75'||discoveryMapUI?.isOpen||discoveryUI?.isOpen||natureUI?.isOpen||wondersUI?.isOpen||!$('poster-modal').hidden||!$('help-modal').hidden||!$('room-map-modal').hidden||!$('catalog-modal').hidden||!$('guide-dialog').hidden)return;
  // Reset velocity if player position was teleported externally
  if(lastPlayerRef&&(Math.abs(player.x-lastPlayerRef.x)>2.5||Math.abs(player.z-lastPlayerRef.z)>2.5)){
    moveVelX=0;moveVelZ=0;
  }
  let f=Number(input.has('w')||input.has('arrowup')||touch.has('w'))-Number(input.has('s')||input.has('arrowdown')||touch.has('s'));
  let strafe=Number(input.has('d')||touch.has('d'))-Number(input.has('a')||touch.has('a'));
  // Keep the avatar still while the in-scene mathematics quiz is active.
  if(parkUI?.quiz||parkUI?.mazePreview||masterMap?.isOpen){f=0;strafe=0;}
  const running=bikeBoostActive||input.has('shift');
  const isOutdoor=mode==='lobby'&&!parkWorld.sanctuaryActive&&!parkUI?.mazeActive;
  avatar.setBikeMode?.(running&&isOutdoor);
  const leftRotate=input.has('q')||input.has('arrowleft');const rightRotate=input.has('arrowright');
  if(leftRotate)yaw-=1.65*dt;if(rightRotate)yaw+=1.65*dt;
  const old={...player};const len=Math.hypot(f,strafe);
  if(len>0){
    const speed=running?(isOutdoor?15.5:12.8):6.6;
    const invLen=speed/len;
    const forwardX=Math.sin(yaw),forwardZ=-Math.cos(yaw);
    const rightX=Math.cos(yaw),rightZ=Math.sin(yaw);
    const targetVx=(forwardX*f+rightX*strafe)*invLen;
    const targetVz=(forwardZ*f+rightZ*strafe)*invLen;
    const accelAlpha=1-Math.exp(-22*dt);
    moveVelX+=(targetVx-moveVelX)*accelAlpha;
    moveVelZ+=(targetVz-moveVelZ)*accelAlpha;
  }else{
    const decelAlpha=1-Math.exp(-26*dt);
    moveVelX*=(1-decelAlpha);
    moveVelZ*=(1-decelAlpha);
    if(Math.hypot(moveVelX,moveVelZ)<0.04){moveVelX=0;moveVelZ=0;}
  }
  const curSpeed=Math.hypot(moveVelX,moveVelZ);
  if(curSpeed>0.01){
    const dx=moveVelX*dt;
    const dz=moveVelZ*dt;
    const next={x:player.x+dx,y:Number(player.y)||0,z:player.z+dz};
    if(mode==='lobby'){
      // V4 keeps original Lab/Museum doors while allowing the opposite-side park on the same map.
      if(parkUI?.mazeActive){
        player=parkWorld.collideMaze(old,next);
        if(parkWorld.mazeReachedExit(player.x,player.z))parkUI.reachMazeExit();
      }else if(parkWorld.sanctuaryActive){
        const roomCenter=parkWorld.getSanctuaryDoorWorldPosition().z+13;
        player={x:THREE.MathUtils.clamp(next.x,-12.4,12.4),z:THREE.MathUtils.clamp(next.z,roomCenter-17,roomCenter+16)};
      }else{
        let p=grand.clampPosition(old,next);
        if(parkWorld.collidePark){
          p=parkWorld.collidePark(old,p);
        }
        player=p;
      }
      // Seamlessly auto-open the Wonder Park gate when walking near the South Island so player never hits an invisible freeze wall
      if(!parkWorld.sanctuaryActive&&!parkWorld.gateOpen&&!parkWorld.opening){
        const pc=CAMPUS_MASTERPLAN.park;
        if(Math.hypot(player.x-pc.x,player.z-pc.z)<78.0){
          parkWorld.openGate();
        }
      }
    }else if(mode==='discovery'){
      player=discovery.restrict(old,next);
    }else if(gallery){
      player=restrictPosition(gallery.getPlan(),player,next);
    }
    if(len>0){
      const targetCharYaw=Math.atan2(dx,dz);
      charYaw=shortestAngleLerp(charYaw,targetCharYaw,1-Math.exp(-16*dt));
    }
  }
  lastPlayerRef={x:player.x,z:player.z};
  // Actual jump physics for the shared campus avatar, without changing game outcomes.
  if(jumpVelocity!==0||jumpHeight>0){
    jumpHeight=Math.max(0,jumpHeight+jumpVelocity*dt);
    jumpVelocity=jumpHeight===0?0:jumpVelocity-JUMP_GRAVITY*dt;
  }
  const py=mode==='discovery'?(Number(player.y)||0):0;
  if(py===0)avatar.root.position.set(player.x,jumpHeight,player.z);else avatar.root.position.set(player.x,py+jumpHeight,player.z);
  avatar.root.rotation.y=0;
  cameraDollyCurrent=THREE.MathUtils.damp(cameraDollyCurrent,cameraDollyGoal,8.5,dt);
  const animSpeedRatio=curSpeed>0.15?Math.min(1.8,curSpeed/5.8):0;
  avatar.updateAnimation(dt,animSpeedRatio,charYaw,jumpHeight);
  if(mode==='lobby'){
    grand.update(dt);
    const isParkView=Boolean(parkGameCamera||cameraMode==='top'||cameraMode==='overview');
    if(player.z>18||parkWorld.opening||isParkView){
      parkWorld.tick(dt,player,isParkView);
    }
    if(player.z<-15||isParkView){
      discovery.tick(dt);
    }
  }else if(mode==='discovery'){
    discovery.tick(dt);
  }
  const currentHall=mode==='museum'&&gallery?.tick(player,dt);
  const view=cameraMode;
  avatar.root.visible=(!parkGameCamera||parkGameCamera.index===7&&parkGameCamera.view==='maze_walk')&&view!=='first';
  // Consistent NORTH-UP top view: Lab/Museum above Hall, Park below.
  camera.up.set(0,view==='top'?0:1,view==='top'?-1:0);
  let target=new THREE.Vector3(player.x,py+1.8,player.z-Math.cos(yaw)*3);
  let desired=new THREE.Vector3(player.x-Math.sin(yaw)*cameraDollyCurrent,py+Math.max(2.55,2.1+cameraDollyCurrent*.29)+pitch*2.4,player.z+Math.cos(yaw)*cameraDollyCurrent);
  if(mode==='lobby'&&parkGameCamera){
    const c=parkGameCamera;
    const gameZoom=cameraDollyCurrent/7.9;
    const pose=c.index===0?parkWorld.getChickenCameraPose(c.view,gameZoom):
      c.index===1?parkWorld.getRocketCameraPose(c.view,gameZoom):
      c.index===2?parkWorld.getSanctuaryCameraPose(c.view):
      c.index===3?parkWorld.getBridgeCameraPose(c.view,gameZoom):
      c.index===4?parkWorld.getTugCameraPose(c.view,gameZoom):
      c.index===5?parkWorld.getSoccerCameraPose(c.view,gameZoom):
      c.index===7?parkWorld.getMazeCameraPose(player,yaw,c.view):
      c.index===6?parkWorld.getArchitectCameraPose(c.view,gameZoom):
      c.index===8?parkWorld.getCoasterCameraPose(c.view,gameZoom):
      c.index===9?parkWorld.getBalloonCameraPose(c.view,gameZoom):
      c.index===10?parkWorld.getMillionaireCameraPose(c.view,gameZoom):null;
    if(pose){desired.set(pose.eye.x,pose.eye.y,pose.eye.z);target.set(pose.look.x,pose.look.y,pose.look.z);}
  }else if(mode==='lobby'&&parkFocusZone!==null&&view==='third'){
    const spot=parkWorld.getZoneWorldPosition(parkFocusZone);
    if(spot){desired.set(spot.x+15,13,spot.z+21);target.set(spot.x+4.6,2.0,spot.z);}
  }else if(view==='first'){
    desired.set(player.x,py+1.76,player.z);
    target.set(player.x+Math.sin(yaw)*9,py+1.76-pitch*3.5,player.z-Math.cos(yaw)*9);
  }else if(view==='top'){
    if(mode==='lobby'){
      const bounds=aerialScope==='park'?CAMPUS_MASTERPLAN.parkBounds:ORBITAL_MASTERPLAN.bounds;
      const fit=fitAerialBounds({aspect:camera.aspect,verticalFov:66,bounds,zoom:cameraDollyCurrent/7.9});
      desired.set(fit.x,fit.y,fit.z);target.set(fit.x,0,fit.z);
    }else{
      desired.set(player.x+4,py+34*cameraDollyCurrent/7.9,player.z+12*cameraDollyCurrent/7.9);
      target.set(player.x,py,player.z-2);
    }
  }else if(view==='iso'){
    const scale=cameraDollyCurrent/7.9;
    desired.set(player.x-(13*Math.sin(yaw)+5)*scale,py+3+(18.5-3)*scale,player.z+(13*Math.cos(yaw)+5)*scale);
    target.set(player.x,py+1.3,player.z);
  }else if(view==='overview'){
    if(mode==='lobby'){
      const bounds=ORBITAL_MASTERPLAN.bounds;
      const fit=fitAerialBounds({aspect:camera.aspect,verticalFov:77,bounds,zoom:cameraDollyCurrent/7.9});
      desired.set(fit.x+34,fit.y+58,fit.z+73);target.set(fit.x,2,fit.z);
    }else{
      const loc=currentHall?{x:82*Math.sin(currentHall.theta),z:-82*Math.cos(currentHall.theta)}:{x:0,z:0};
      const dolly=cameraDollyCurrent/7.9;
      desired.set(loc.x+22*dolly,49*dolly,loc.z+30*dolly);target.set(loc.x,0,loc.z);
    }
  }
  const viewingPosition=(mode==='museum'&&gallery&&['third','iso'].includes(view))
    ?gallery.safeCameraPosition({x:player.x,y:1.68,z:player.z},desired)
    :desired;
  const camPosAlpha=1-Math.exp(-(view==='first'?18:10.5)*dt);
  camera.position.lerp(viewingPosition,camPosAlpha);
  if(!cameraLookInitialized||cameraLookCurrent.distanceToSquared(target)>400){
    cameraLookCurrent.copy(target);
    cameraLookInitialized=true;
  }else{
    cameraLookCurrent.lerp(target,1-Math.exp(-16*dt));
  }
  camera.lookAt(cameraLookCurrent);
  // All seven expanded grade gates remain accessible via the 3D hub and fast grade map.
  const normalFov=mode==='museum'?(view==='overview'?74:view==='top'?68:currentHall?67:(innerWidth<680?92:77)):(view==='top'?66:view==='overview'?77:innerWidth<800?84:76);
  const targetFov=parkGameCamera?(parkGameCamera.index===0?60:parkGameCamera.index===2?72:parkGameCamera.index===3?70:parkGameCamera.index===8?73:68):(view==='first'?THREE.MathUtils.clamp(normalFov+2*(cameraDollyCurrent-7.9),48,98):normalFov);
  if(Math.abs(camera.fov-targetFov)>.12){camera.fov+=(targetFov-camera.fov)*(1-Math.exp(-8*dt));camera.updateProjectionMatrix();}
  const nowHud=performance.now();
  if(nowHud-lastHudCheckTime>=80){
    lastHudCheckTime=nowHud;
    if(mode==='museum'&&gallery)updateMuseumHud();
    const currentNear=nearFrame(currentHall);
    if(currentNear!==lastNear){lastNear=currentNear;$('near-prompt').hidden=!currentNear;$('near-message').textContent=currentNear||'';}
  }
}
let lastFpsTime=performance.now(), frameCount=0, currentFps=60, lastRadarUpdate=0, lastHudCheckTime=0;
function updateRadar(now=performance.now()){
  if(now-lastRadarUpdate<120)return;
  lastRadarUpdate=now;
  const radarWrap=$('campus-radar');
  if(!radarWrap)return;
  if(mode!=='lobby'||parkWorld.sanctuaryActive){radarWrap.hidden=true;return;}
  radarWrap.hidden=false;
  const cvs=$('radar-canvas');if(!cvs)return;
  const ctx=cvs.getContext('2d');
  const w=cvs.width, h=cvs.height, cx=w/2, cy=h/2, r=w/2-6;
  ctx.clearRect(0,0,w,h);
  ctx.save();
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.fillStyle='rgba(8, 28, 46, 0.78)';ctx.fill();
  ctx.strokeStyle='rgba(212, 175, 55, 0.55)';ctx.lineWidth=1.5;ctx.stroke();
  for(const gr of [r*.35, r*.70]){
    ctx.beginPath();ctx.arc(cx,cy,gr,0,Math.PI*2);
    ctx.strokeStyle='rgba(130, 190, 220, 0.2)';ctx.lineWidth=1;ctx.stroke();
  }
  ctx.strokeStyle='rgba(130, 190, 220, 0.16)';ctx.beginPath();
  ctx.moveTo(cx-r,cy);ctx.lineTo(cx+r,cy);ctx.moveTo(cx,cy-r);ctx.lineTo(cx,cy+r);ctx.stroke();

  // Unified radar: 4-way Orbital Ring around GRAND DOME (0, 0).
  const bounds=ORBITAL_MASTERPLAN.bounds;
  const centerX=(bounds.xMin+bounds.xMax)/2,centerZ=(bounds.zMin+bounds.zMax)/2;
  const scale=(2*r*.90)/Math.max(bounds.xMax-bounds.xMin,bounds.zMax-bounds.zMin);
  const toRadar=(wx,wz)=>({rx:cx+(wx-centerX)*scale, ry:cy+(wz-centerZ)*scale});
  const c0=toRadar(0,0);
  ctx.strokeStyle='rgba(251,191,36,.55)';ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(c0.rx,c0.ry,138*scale,0,Math.PI*2);ctx.stroke();

  const parkR=toRadar(0,138);
  ctx.strokeStyle='rgba(99,226,176,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(parkR.rx,parkR.ry,54*scale,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#53f5ab';ctx.beginPath();ctx.arc(parkR.rx,parkR.ry,4,0,Math.PI*2);ctx.fill();

  const discR=toRadar(0,-138);
  ctx.fillStyle='#a855f7';ctx.beginPath();ctx.arc(discR.rx,discR.ry,4.5,0,Math.PI*2);ctx.fill();

  const labR=toRadar(-138,0);
  ctx.fillStyle='#38bdf8';ctx.beginPath();ctx.arc(labR.rx,labR.ry,4.5,0,Math.PI*2);ctx.fill();

  const museR=toRadar(138,0);
  ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(museR.rx,museR.ry,4.5,0,Math.PI*2);ctx.fill();

  const fountR=toRadar(0,0);
  ctx.fillStyle='#34d399';ctx.beginPath();ctx.arc(fountR.rx,fountR.ry,4.0,0,Math.PI*2);ctx.fill();

  const plyR=toRadar(player.x,player.z);
  ctx.save();ctx.translate(plyR.rx,plyR.ry);ctx.rotate(-yaw);
  ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,14,-Math.PI/2-.38,-Math.PI/2+.38);ctx.closePath();
  ctx.fillStyle='rgba(255, 225, 120, 0.4)';ctx.fill();
  ctx.restore();

  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(plyR.rx,plyR.ry,3.5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#d4af37';ctx.lineWidth=1.5;ctx.stroke();
  ctx.restore();
  masterMap?.updatePlayer(player);
}
function loop(){
  raf=requestAnimationFrame(loop);
  frameCount++;
  const now=performance.now();
  if(now-lastFpsTime>=500){
    currentFps=Math.round(frameCount*1000/(now-lastFpsTime));
    frameCount=0;lastFpsTime=now;
    const fpsEl=$('fps-counter');if(fpsEl)fpsEl.textContent=`${currentFps} FPS`;
  }
  if(mode==='r75')return;
  const dt=Math.min(clock.getDelta(),.05);
  update(dt);
  renderer.render(scene,camera);
  if(mode==='discovery'){
    podiumViewer?.update({
      enabled:false,
      fallbackNonGLB:discovery.currentRoom==='globe'&&!discovery.r99Active,
      camera,canvas,player,modalOpen:Boolean(wondersUI?.isOpen||discoveryUI?.isOpen||discoveryMapUI?.isOpen)
    });
  }
  updateRadar(now);
}
function pointerClick(event){
  if(mode==='r75'||discoveryUI?.isOpen||natureUI?.isOpen||wondersUI?.isOpen||!$('poster-modal').hidden||!$('catalog-modal').hidden||!$('guide-dialog').hidden||!$('grade-guide-dialog').hidden)return;
  if(dragStart&&Math.hypot(event.clientX-dragStart.x,event.clientY-dragStart.y)>7)return;
  if(parkUI?.quiz||parkUI?.mazeActive)return;
  const bounds=canvas.getBoundingClientRect();
  const pointer=new THREE.Vector2(((event.clientX-bounds.left)/bounds.width)*2-1,-((event.clientY-bounds.top)/bounds.height)*2+1);
  if(mode==='lobby'){
    const ray=new THREE.Raycaster();ray.setFromCamera(pointer,camera);
    if(ray.intersectObjects(discovery.entryClickables,false).length){enterDiscovery();return;}
    if(parkWorld.sanctuaryActive)return;
    const parkHit=ray.intersectObjects(parkWorld.clickable,true)[0];
    const parkInfo=parkHit&&parkWorld.getClickableInfo(parkHit.object);
    if(parkInfo?.type==='gate'){enterGamePark();return;}
    if(parkInfo?.type==='guide'){parkUI?.showGate();return;}
    if(parkInfo?.type==='zone'){
      if(!parkWorld.gateOpen){enterGamePark();status('Cô hãy mở cổng để NPC và các mô hình bắt đầu chuyển động.');}
      else{visitParkZone(parkInfo.index);focusParkZone(parkInfo.index);parkUI?.showZone(parkInfo.index);}
      return;
    }
    const hit=ray.intersectObjects(doorTargets,false)[0];
    const target=hit?.object.userData.grandTarget;
    if(target==='gamepark')enterGamePark();
    else if(target==='discovery')enterDiscovery();
    else if(target==='r75')enterR75();
    else if(target==='gallery')enterMuseum();
    else if(target==='guide')openGuide();
  }else if(mode==='discovery'){
    handleDiscoveryAction(discovery.onClick(pointer,camera));
  }else if(mode==='museum'){
    const clickedRoomReturn=gallery.clickRoomReturnGate(pointer,camera);
    if(clickedRoomReturn){
      player={x:0,z:ENTRANCE_Z};yaw=0;charYaw=0;
      avatar.root.position.set(0,0,ENTRANCE_Z);
      gallery.tick(player);updateMuseumHud(true);
      status(`🎉 Hoàn thành tham quan Toán ${clickedRoomReturn.grade}! Đã trở về Bục Tra Cứu Sảnh Trung Tâm.`);
      return;
    }
    const hitNpc=gallery.clickNpc(pointer,camera);
    if(hitNpc){openGradeGuide(hitNpc);return;}
    if(gallery.clickReturnPortalToLobby(pointer,camera)){moveToLobby();return;}
    const selectedCatalog=gallery.clickClassification(pointer,camera);
    if(selectedCatalog){openCatalog(selectedCatalog==='all'?catalogGrade:selectedCatalog);return;}
    const grade=gallery.clickDoorToEnter(pointer,camera);
    if(grade){player=gallery.gotoGrade(grade);gallery.tick(player);updateMuseumHud(true);}
    else gallery.clickToSelect(pointer,camera);
  }
}
canvas.addEventListener('pointerdown',e=>{
  dragStart={x:e.clientX,y:e.clientY};globePointerDrag=false;nativeDragId=null;
  if(mode==='discovery'&&discovery.currentRoom==='globe'&&!wondersUI?.isOpen){
    const b=canvas.getBoundingClientRect(),pt=new THREE.Vector2(((e.clientX-b.left)/b.width)*2-1,-((e.clientY-b.top)/b.height)*2+1);
    nativeDragId=discovery.pickNativeModel?.(pt,camera)||null;
  }
  if(mode==='discovery'&&discovery.currentRoom==='foyer'&&!discoveryUI?.isOpen){
    const b=canvas.getBoundingClientRect(),p=new THREE.Vector2(((e.clientX-b.left)/b.width)*2-1,-((e.clientY-b.top)/b.height)*2+1);
    globePointerDrag=discovery.isEarthHit(p,camera);
  }
});
canvas.addEventListener('pointermove',e=>{
  if(dragStart&&(e.buttons&1)){
    if(nativeDragId){discovery.rotateNativeModel?.(nativeDragId,e.movementX,e.movementY);return;}
    if(globePointerDrag){
      if(Math.hypot(e.clientX-dragStart.x,e.clientY-dragStart.y)>5){discovery.rotateEarth(e.movementX,e.movementY);}
      return;
    }
    yaw+=e.movementX*.006;
    pitch=THREE.MathUtils.clamp(pitch+e.movementY*.004,-.5,.95);
  }
});
canvas.addEventListener('click',pointerClick);
canvas.addEventListener('wheel',event=>{
  if(!wheelMayZoomWorld())return;
  event.preventDefault();
  setWorldCameraDolly(cameraDollyGoal*(event.deltaY>0?1.12:.88));
},{passive:false});
$('world-zoom-in').addEventListener('click',()=>setWorldCameraDolly(cameraDollyGoal*.82));
$('world-zoom-out').addEventListener('click',()=>setWorldCameraDolly(cameraDollyGoal*1.20));
$('world-zoom-reset').addEventListener('click',()=>setWorldCameraDolly(7.9));
$('cam-preset-eye')?.addEventListener('click',()=>applyCameraPreset('eye'));
$('cam-preset-near')?.addEventListener('click',()=>applyCameraPreset('near'));
$('cam-preset-far')?.addEventListener('click',()=>applyCameraPreset('far'));

canvas.addEventListener('pointerup',()=>{globePointerDrag=false;nativeDragId=null;setTimeout(()=>{dragStart=null;},0);});
window.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();
  if(e.target?.matches?.('input,textarea,select,[contenteditable]') && key!=='escape')return;
  if(e.code==='Space'||['w','a','s','d','q','e','shift','arrowup','arrowdown','arrowleft','arrowright','escape'].includes(key))e.preventDefault();
  if(key==='escape'){
    if(wondersUI?.isOpen){wondersUI.close();return;}
    if(natureUI?.isOpen){natureUI.close();return;}
    if(discoveryUI?.isOpen){discoveryUI.close();return;}
    if(discoveryMapUI?.isOpen){discoveryMapUI.hide();return;}
    if(mode==='discovery'){if(discovery.currentRoom!=='foyer')setDiscoveryRoom('foyer');else moveToLobby();return;}
    if(masterMap?.isOpen){masterMap.hide();return;}
    if(parkUI?.quiz||parkUI?.mazeActive){parkUI.hide();return;}
    if(!$('grade-guide-dialog').hidden)closeGradeGuide();
    else if(!$('guide-dialog').hidden)closeGuide();
    else if(!$('catalog-modal').hidden)closeCatalog();
    else if(!$('room-map-modal').hidden)closeRoomMap();
    else if(!$('poster-modal').hidden)closePoster();
    else if(!$('help-modal').hidden)$('help-modal').hidden=true;
    else if(mode==='lobby')showLobbyMenu(!$('lobby-menu').hidden);
    return;
  }
  if(!$('poster-modal').hidden){
    if(key==='arrowleft'){navigatePoster(-1);return;}
    if(key==='arrowright'){navigatePoster(1);return;}
    if(!e.repeat&&(key==='+'||key==='='||key==='add')){setPosterZoom(zoom+.2);return;}
    if(!e.repeat&&(key==='-'||key==='subtract')){setPosterZoom(zoom-.2);return;}
    if(!e.repeat&&key==='0'){setPosterZoom(1);return;}
    return;
  }
  if(mode==='r75'||discoveryUI?.isOpen||natureUI?.isOpen||wondersUI?.isOpen||!$('poster-modal').hidden||!$('room-map-modal').hidden||!$('catalog-modal').hidden||!$('guide-dialog').hidden||!$('grade-guide-dialog').hidden)return;
  if(e.code==='Space'){if(!e.repeat&&!parkUI?.quiz&&!parkUI?.mazePreview&&!masterMap?.isOpen&&jumpHeight===0){jumpVelocity=JUMP_IMPULSE;}return;}
  if(key==='shift'&&!e.repeat){toggleBikeBoost();input.add('shift');return;}
  if(!e.repeat&&(key==='+'||key==='='||key==='add')){setWorldCameraDolly(cameraDollyGoal*.82);return;}
  if(!e.repeat&&(key==='-'||key==='subtract')){setWorldCameraDolly(cameraDollyGoal*1.20);return;}
  if(!e.repeat&&key==='0'){setWorldCameraDolly(7.9);return;}
  if(key==='m'&&!e.repeat&&mode==='museum'){openRoomMap();return;}
  if(key==='m'&&!e.repeat&&mode==='lobby'){masterMap?.show();return;}
  if(key==='k'&&!e.repeat&&mode==='museum'){openCatalog(catalogGrade);return;}
  if(key==='c'&&!e.repeat){if(parkGameCamera){cycleParkGameCameraView();return;}setCameraMode(CAMERA_MODES[(CAMERA_MODES.indexOf(cameraMode)+1)%CAMERA_MODES.length]);return;}
  if(key==='v'&&!e.repeat){cycleAvatar();return;}
  if(key==='e'&&!e.repeat)interaction();
  else input.add(key);
});
window.addEventListener('keyup',e=>input.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{input.clear();touch.clear();});
for(const btn of document.querySelectorAll('[data-touch]')){
  const key=btn.dataset.touch;
  btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);touch.add(key);});
  btn.addEventListener('pointerup',()=>touch.delete(key));
  btn.addEventListener('pointercancel',()=>touch.delete(key));
}
$('touch-interact').onclick=interaction;
$('touch-jump')?.addEventListener('click',()=>{if(!parkUI?.quiz&&!parkUI?.mazePreview&&!masterMap?.isOpen&&jumpHeight===0)jumpVelocity=JUMP_IMPULSE;});
$('touch-bike')?.addEventListener('click',()=>toggleBikeBoost());
$('topbar-bike-btn')?.addEventListener('click',()=>toggleBikeBoost());
$('topbar-lobby-btn')?.addEventListener('click',()=>moveToLobby());

// Dropdown tích hợp 4 Khu Vực trên thanh Topbar
function closeZonesDropdown(){
  const menu=$('topbar-zones-menu');
  const toggle=$('topbar-zones-toggle');
  if(menu)menu.hidden=true;
  if(toggle)toggle.setAttribute('aria-expanded','false');
}
$('topbar-zones-toggle')?.addEventListener('click',e=>{
  e.stopPropagation();
  const menu=$('topbar-zones-menu');
  const toggle=$('topbar-zones-toggle');
  if(!menu)return;
  const open=menu.hidden;
  menu.hidden=!open;
  toggle?.setAttribute('aria-expanded',String(open));
});
document.addEventListener('click',e=>{
  const wrap=$('topbar-zones-dropdown');
  if(wrap&&!wrap.contains(e.target))closeZonesDropdown();
});

// Nút thuyết minh Tiếng Việt toàn khu vực & Nút Nói/Hiểu Tiếng Việt trên Topbar
onSpeechStateChange(speaking=>{
  const btn=$('topbar-tts-btn');
  if(btn){
    btn.classList.toggle('is-speaking',speaking);
    btn.setAttribute('aria-pressed',String(speaking));
    btn.textContent=speaking?'⏹ DỪNG ĐỌC':'🔊 THUYẾT MINH';
  }
});
onVoiceCommandStateChange((listening,msg)=>{
  const vBtn=$('topbar-voice-cmd-btn');
  if(vBtn){
    vBtn.classList.toggle('is-listening',listening);
    vBtn.setAttribute('aria-pressed',String(listening));
    vBtn.textContent=listening?'🎙 ĐANG NGHE...':'🎙 NÓI TIẾNG VIỆT';
  }
  if(msg)status(msg);
});
function triggerVietnameseVoiceAssistant(){
  toggleVietnameseVoiceCommand({
    toLobby:()=>moveToLobby(),
    enterLab:()=>enterR75(),
    enterMuseum:()=>enterMuseum(),
    enterDiscovery:()=>enterDiscovery(),
    enterPark:()=>enterGamePark(),
    toggleBike:(on)=>toggleBikeBoost(on),
    setCameraPreset:(p)=>applyCameraPreset(p),
    openGrade:(g)=>launchR75Feature({type:'grade',grade:g}),
    openHistory:()=>launchR75Feature({type:'history'}),
    getCurrentMode:()=>(mode==='lobby'&&(player.z>38||parkGameCamera||parkFocusZone!==null))?'park':mode,
    onStatus:status
  });
}
$('topbar-voice-cmd-btn')?.addEventListener('click',()=>triggerVietnameseVoiceAssistant());
$('topbar-tts-btn')?.addEventListener('click',()=>{
  if(isSpeakingVietnamese()){
    stopVietnameseSpeech();
    status('⏹ Đã dừng giọng đọc thuyết minh.');
    return;
  }
  const zoneKey=(mode==='lobby'&&(player.z>38||parkGameCamera||parkFocusZone!==null))?'park':(ZONE_VOICE_GUIDES[mode]?mode:'lobby');
  speakVietnamese(ZONE_VOICE_GUIDES[zoneKey]);
  status('🔊 Đang đọc thuyết minh Tiếng Việt toàn bộ khu vực...');
});
$('poster-speak')?.addEventListener('click',()=>{
  if(!activePoster)return;
  const text=`Bài học Infographic Toán lớp ${activePoster.grade}, bài số ${activePoster.number}: ${activePoster.title}. Chủ đề: ${activePoster.topic||'Kiến thức trọng tâm sách giáo khoa'}. Các em hãy quan sát sơ đồ trực quan, công thức đóng khung và các ví dụ minh họa trên bức tranh để nắm vững toàn bộ kiến thức bài học!`;
  speakVietnamese(text);
});
$('discovery-detail-speak')?.addEventListener('click',()=>{
  const title=$('discovery-title')?.textContent||'';
  const desc=$('discovery-description')?.textContent||'';
  const shape=$('discovery-shape')?.textContent||'';
  const math=$('discovery-math')?.textContent||'';
  const grades=$('discovery-grades')?.textContent||'';
  const note=$('discovery-note')?.textContent||'';
  speakVietnamese(`${title}. ${desc}. Cấu trúc hình học: ${shape}. Giải thích toán học: ${math}. Phù hợp với: ${grades}. ${note}`);
});

$('enter-mathverse').onclick=enterR75;
if($('lab-quick-enter'))$('lab-quick-enter').onclick=()=>{closeZonesDropdown();enterR75();};
if($('museum-quick-enter'))$('museum-quick-enter').onclick=()=>{closeZonesDropdown();enterMuseum();};
if($('discovery-quick-enter'))$('discovery-quick-enter').onclick=()=>{closeZonesDropdown();enterDiscovery();};
$('enter-gallery').onclick=enterMuseum;
$('enter-gamepark').onclick=enterGamePark;
$('enter-discovery').onclick=enterDiscovery;
$('park-quick-enter').onclick=()=>{closeZonesDropdown();enterGamePark();};
$('park-aerial').onclick=()=>{closeOmniHub();focusParkAerial('park');};
$('campus-park-aerial').onclick=()=>{closeOmniHub();focusParkAerial('all');};
$('park-open-menu').onclick=()=>{closeOmniHub();parkUI?.toggle();};
masterMap=initializeCampusMap({navigate:navigateMasterMap,aerial:focusParkAerial,notice:status});
discoveryUI=createDiscoveryUI({onRoom:setDiscoveryRoom,onBack:moveToLobby,onRotateGlobe:discovery.rotateEarth});
wondersUI=createWorldWondersR100UI({onRoom:setDiscoveryRoom,onMap:()=>{setDiscoveryRoom('map');discoveryMapUI?.show();},onImport:(id,file)=>discovery.importLicensedGLB(id,file)});
podiumViewer=createPodiumSketchfabViewer({
  getStands:()=>discovery.r102Pedestals||[],
  getLocalIds:()=>discovery.r103LocalGLBIds||new Set(),
  onDetails:id=>{podiumViewer?.reset();wondersUI?.open(id,'room');},
  onUpload:(id,file)=>discovery.importLicensedGLB(id,file)
});
if($('discovery-wonders-list'))$('discovery-wonders-list').onclick=()=>wondersUI?.show(discovery.currentRoom==='globe'?'room':'globe');
discoveryMapUI=createDiscoveryWorldMapUI({
  onOpen:(id)=>wondersUI?.has?.(id)?wondersUI.open(id,'map'):discoveryUI?.openItem(id),
  onReturn:()=>setDiscoveryRoom('foyer'),
  onOfficialData:(sites)=>{discoveryUI?.registerOfficialSites?.(sites);discovery.setWorldHeritageDots?.(sites);}
});
parkUI=initializeParkUI({
  park:parkWorld,notice:status,visitZone:visitParkZone,travelToGate:moveToParkGate,
  focusPark:()=>focusParkAerial('park'),focusZone:focusParkZone,
  enterGameMode:enterParkGameCamera,leaveGameMode:leaveParkGameCamera,
  enterMazeMode,leaveMazeMode,
  enterRoom:enterSanctuaryRoom,exitRoom:exitSanctuaryRoom,toSanctuaryDoor,
  cycleCamera:cycleParkGameCameraView,
  closeFocus:()=>{parkFocusZone=null;}
});
$('hide-menu').onclick=()=>showLobbyMenu(false);
$('lobby-shortcuts').onclick=()=>{closeOmniHub();if(mode==='lobby')showLobbyMenu($('lobby-menu').hidden);else moveToLobby();};
$('guide-open').onclick=openGuide;
$('guide-close').onclick=closeGuide;
$('guide-lab').onclick=()=>{closeGuide();enterR75();};
$('guide-museum').onclick=()=>{closeGuide();enterMuseum();};
if($('guide-discovery'))$('guide-discovery').onclick=()=>{closeGuide();enterDiscovery();};
$('guide-park').onclick=()=>{closeGuide();enterGamePark();};
$('guide-speak').onclick=speakGuide;
$('to-lobby').onclick=moveToLobby;
$('r75-exit').onclick=moveToLobby;
$('back-to-start').onclick=()=>{player={x:0,z:ENTRANCE_Z};gallery?.tick(player);updateMuseumHud(true);};
$('open-room-map').onclick=openRoomMap;
$('open-catalog').onclick=()=>openCatalog(catalogGrade);
$('catalog-close').onclick=closeCatalog;
$('catalog-backdrop').onclick=closeCatalog;
$('catalog-search').oninput=renderCatalog;
$('room-map-close').onclick=closeRoomMap;
$('room-map-backdrop').onclick=closeRoomMap;
$('poster-close').onclick=closePoster;
$('modal-backdrop').onclick=closePoster;
$('poster-prev').onclick=()=>navigatePoster(-1);
$('poster-next').onclick=()=>navigatePoster(1);
$('poster-minus').onclick=()=>setPosterZoom(zoom-.2);
$('poster-plus').onclick=()=>setPosterZoom(zoom+.2);
$('poster-image').addEventListener('wheel',e=>{e.preventDefault();setPosterZoom(zoom+(e.deltaY<0?.15:-.15));},{passive:false});
$('help').onclick=()=>{closeOmniHub();$('help-modal').hidden=false;input.clear();};
$('help-close').onclick=()=>$('help-modal').hidden=true;

// R107 Omni-Hub (Nút Tròn Mở Tất Cả Các Kho Học Liệu, Nhân Vật Chibi 3D & 5 Phương Án Sơ Đồ)
function toggleOmniHub(force){
  const pop=$('mv-omni-hub-popover');
  const btn=$('mv-omni-hub-btn');
  if(!pop||!btn)return;
  const open=typeof force==='boolean'?force:pop.hidden;
  pop.hidden=!open;
  btn.setAttribute('aria-expanded',String(open));
  btn.classList.toggle('is-active',open);
}
function closeOmniHub(){toggleOmniHub(false);}
if($('mv-omni-hub-btn'))$('mv-omni-hub-btn').onclick=()=>toggleOmniHub();
if($('mv-omni-hub-close'))$('mv-omni-hub-close').onclick=closeOmniHub;
if($('cartoon-studio-open'))$('cartoon-studio-open').addEventListener('click',closeOmniHub);

function openInlineHubModal(url,title){
  closeOmniHub();
  const modal=$('inline-hub-modal');
  const frame=$('inline-hub-frame');
  const head=$('inline-hub-title');
  const link=$('inline-hub-newtab');
  if(!modal||!frame)return;
  if(head)head.textContent=title;
  if(link)link.href=url;
  if(frame.getAttribute('src')!==url)frame.src=url;
  modal.hidden=false;
  input.clear();touch.clear();
}
function closeInlineHubModal(){
  const modal=$('inline-hub-modal');
  if(modal)modal.hidden=true;
}
if($('hub-open-gfx'))$('hub-open-gfx').onclick=()=>{
  closeOmniHub();
  if($('gfx-studio-modal'))$('gfx-studio-modal').hidden=false;
};
if($('gfx-open-chibi-btn'))$('gfx-open-chibi-btn').onclick=()=>{
  if($('gfx-studio-modal'))$('gfx-studio-modal').hidden=true;
  $('cartoon-studio-open')?.click();
};
if($('inline-hub-close'))$('inline-hub-close').onclick=closeInlineHubModal;
if($('inline-hub-backdrop'))$('inline-hub-backdrop').onclick=closeInlineHubModal;

function launchR75Feature(action){
  closeOmniHub();
  pendingR75Action=action;
  if(mode!=='r75')enterR75();
  const win=$('r75-frame')?.contentWindow;
  if(win?.museum)runPendingR75Action(win);
}
if($('hub-open-sgk'))$('hub-open-sgk').onclick=()=>launchR75Feature({type:'kho'});
if($('hub-open-studio'))$('hub-open-studio').onclick=()=>launchR75Feature({type:'studio'});
if($('hub-open-history'))$('hub-open-history').onclick=()=>launchR75Feature({type:'history'});
for(const gBtn of document.querySelectorAll('[data-hub-grade]')){
  gBtn.onclick=()=>launchR75Feature({type:'grade',grade:Number(gBtn.dataset.hubGrade)||6});
}
if($('hub-open-infographic'))$('hub-open-infographic').onclick=()=>{
  closeOmniHub();
  if(mode!=='museum')enterMuseum();
  openCatalog(catalogGrade);
};
if($('hub-open-quizbank'))$('hub-open-quizbank').onclick=()=>openInlineHubModal('/game-park/kho-cau-hoi.html','📝 KHO 3.087 CÂU HỎI TRẮC NGHIỆM TOÁN 6–12 (63 CHƯƠNG)');
if($('hub-open-discovery'))$('hub-open-discovery').onclick=()=>{
  closeOmniHub();
  if(mode!=='discovery')enterDiscovery();
  const dp=$('discovery-quick-panel');
  if(dp){
    dp.classList.remove('is-collapsed');
    if($('discovery-panel-toggle'))$('discovery-panel-toggle').textContent='▲ Thu gọn';
  }
};

// Topbar Collapse / Reopen Pill
if($('topbar-collapse-btn'))$('topbar-collapse-btn').onclick=()=>{
  closeOmniHub();
  document.body.classList.add('topbar-is-collapsed');
  if($('topbar-reopen-pill'))$('topbar-reopen-pill').hidden=false;
};
if($('topbar-reopen-pill'))$('topbar-reopen-pill').onclick=()=>{
  document.body.classList.remove('topbar-is-collapsed');
  $('topbar-reopen-pill').hidden=true;
};

// Plaza Guide Hint & Radar Collapsible toggles
if($('plaza-guide-toggle'))$('plaza-guide-toggle').onclick=()=>{
  const box=$('plaza-guide-hint');
  if(!box)return;
  const compact=box.classList.toggle('is-compact');
  $('plaza-guide-toggle').textContent=compact?'+':'−';
};
if($('radar-collapse-btn'))$('radar-collapse-btn').onclick=()=>{
  const r=$('campus-radar');
  if(!r)return;
  const compact=r.classList.toggle('is-collapsed');
  $('radar-collapse-btn').textContent=compact?'+':'−';
};

// Discovery Quick Panel Collapsible toggle
if($('discovery-panel-toggle'))$('discovery-panel-toggle').onclick=()=>{
  const dp=$('discovery-quick-panel');
  if(!dp)return;
  const collapsed=dp.classList.toggle('is-collapsed');
  $('discovery-panel-toggle').textContent=collapsed?'🔍 Kho 34 Điểm ▾':'▲ Thu gọn';
};

// R75 Shell Collapsible Hub toggle
if($('r75-hub-toggle'))$('r75-hub-toggle').onclick=()=>{
  const tools=$('r75-collapsible-tools');
  if(!tools)return;
  tools.hidden=!tools.hidden;
};

if($('hud-toggle'))$('hud-toggle').onclick=()=>{
  const hud=$('museum-hud');
  if(!hud)return;
  hud.classList.toggle('is-collapsed');
  const isCollapsed=hud.classList.contains('is-collapsed');
  $('hud-toggle').textContent=isCollapsed?'+':'−';
  $('hud-toggle').title=isCollapsed?'Mở rộng HUD':'Thu gọn HUD';
};
if($('lesson-prev'))$('lesson-prev').onclick=()=>jumpToRelativeLesson(-1);
if($('lesson-next'))$('lesson-next').onclick=()=>jumpToRelativeLesson(1);
if($('auto-tour-btn'))$('auto-tour-btn').onclick=toggleAutoTour;
if($('r75-open-kho'))$('r75-open-kho').onclick=()=>{
  if($('r75-collapsible-tools'))$('r75-collapsible-tools').hidden=true;
  try{$('r75-frame').contentWindow?.document?.getElementById('btn-curriculum')?.click();}catch(e){console.warn('Open Kho SGK failed',e);}
};
if($('r75-open-studio'))$('r75-open-studio').onclick=()=>{
  if($('r75-collapsible-tools'))$('r75-collapsible-tools').hidden=true;
  try{$('r75-frame').contentWindow?.document?.getElementById('btn-studio-launchpad')?.click();}catch(e){console.warn('Open Studio failed',e);}
};
if($('r75-open-history'))$('r75-open-history').onclick=()=>{
  if($('r75-collapsible-tools'))$('r75-collapsible-tools').hidden=true;
  try{$('r75-frame').contentWindow?.__MATHVERSE_EXHIBITION_CORE_R74__?.open?.();}catch(e){console.warn('Open History failed',e);}
};
if($('r75-qa-select'))$('r75-qa-select').onchange=e=>{
  const value=e.target.value;
  e.target.value='';
  if($('r75-collapsible-tools'))$('r75-collapsible-tools').hidden=true;
  if(!value)return;
  if(value.startsWith('sgk:')){
    const grade=Number(value.split(':')[1])||6;
    try{
      const win=$('r75-frame')?.contentWindow;
      const explorer=win?.curriculumExplorer;
      if(explorer?.open){explorer.open(grade);return;}
      win?.document?.getElementById('btn-curriculum')?.click();
    }catch(err){console.warn('Open integrated Kho SGK failed',err);}
    return;
  }
  window.open(value,'_blank','noopener');
};
if($('r75-focus-mode'))$('r75-focus-mode').onclick=()=>{
  const shell=$('r75-shell');
  if(!shell)return;
  shell.classList.toggle('is-focus-mode');
  const isFocus=shell.classList.contains('is-focus-mode');
  $('r75-focus-mode').textContent=isFocus?'⤢ MỞ THANH LAB':'✕ THU GỌN';
};
if($('catalog-view-grid'))$('catalog-view-grid').onclick=()=>{
  catalogView='grid';$('catalog-view-grid').classList.add('active');$('catalog-view-list')?.classList.remove('active');
  $('catalog-grid')?.classList.remove('list-view');
};
if($('catalog-view-list'))$('catalog-view-list').onclick=()=>{
  catalogView='list';$('catalog-view-list').classList.add('active');$('catalog-view-grid')?.classList.remove('active');
  $('catalog-grid')?.classList.add('list-view');
};
if($('poster-stage'))$('poster-stage').addEventListener('scroll',updatePosterMinimap);
$('loading-text').textContent=COPY.loading;
const rendererDetails={version:'GRAND CAMPUS V11 / TWO DISTINCT WORLDS',architecture:'symmetrical central reception campus; left solid academy Lab, right sculpted petal Museum, two equal-distance paths',source:'R75 original code',avatarFactory:'verbatim createAvatar()',graphics:'R75 material & color settings',availablePosters:catalog.total,gradeCounts:museumInventory.gradeCounts};
window.DUAL_WORLD_DEBUG={getCamera:()=>camera,getInlinePark:()=>parkWorld,getParkUI:()=>parkUI,viewWholePark:()=>focusParkAerial('park'),viewCampusAndPark:()=>focusParkAerial('all'),getCameraDolly:()=>cameraDollyGoal,setCameraDolly:setWorldCameraDolly,getMode:()=>mode,getPlayer:()=>({...player}),getGrand:()=>grand,getParkPortal:()=>parkWorld,getDiscovery:()=>discovery,enterDiscovery,discoveryRoom:setDiscoveryRoom,getDiscoveryUI:()=>discoveryUI,enterGamePark,getPlan:()=>gallery?.getPlan()||[],getRoomReturnGates:()=>gallery?.roomReturnGates||[],getR75Api:()=>{try{return $('r75-frame').contentWindow?.museum;}catch{return null;}},getMeta:()=>rendererDetails,getGallery:()=>gallery,openRoomMap,enterMuseum,enterR75,toLobby:moveToLobby,gotoGrade,jumpToRelativeLesson,toggleAutoTour,teleport:(x,z,rotY,y)=>{player.x=x;player.z=z;if(y!==undefined)player.y=y;if(rotY!==undefined){yaw=rotY;charYaw=rotY;}avatar.root.position.set(x,player.y||0,z);if(mode==='museum'){gallery?.tick(player);updateMuseumHud(true);}}};
window.DUAL_WORLD_DEBUG.getGraphicsEngine=()=>graphicsEngine;
setWorldCameraDolly(7.9);moveToLobby();avatar.root.position.set(player.x,0,player.z);camera.position.set(0,10,48);camera.lookAt(0,6,-44);
onResize();loop();$('loading').hidden=true;
