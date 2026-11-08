/** R6.6: Museum previews for grades 7-12.
 * These are VISUAL thumbnails for room stations, never substitute the
 * mathematical mode renderer inside CurriculumExplorer / Grade*Lab.
 */
import * as THREE from '../../vendor/three.module.js?v=r107_v15';
const mat=(color,opacity=1)=>new THREE.MeshStandardMaterial({color,roughness:.5,metalness:.08,transparent:opacity<1,opacity,side:THREE.DoubleSide});
const add=(g,geo,color,pos=[0,0,0],opacity=1)=>{const mesh=new THREE.Mesh(geo,mat(color,opacity));mesh.position.set(...pos);g.add(mesh);return mesh;};
const box=(g,dim,pos,color)=>add(g,new THREE.BoxGeometry(...dim),color,pos);
function wire(g,vertices,edges,color=0x31bfb8){const points=[];for(const [a,b] of edges){points.push(new THREE.Vector3(...vertices[a]),new THREE.Vector3(...vertices[b]));}const geo=new THREE.BufferGeometry().setFromPoints(points);g.add(new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color})));}
function solid(g,kind){
 if(kind==='cuboid'){const m=box(g,[1.68,1.35,1.15],[0,1.75,0],0x5ebec7);m.rotation.y=.28;g.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:0xe5f5fb})));}
 else if(kind==='prism'){const v=[[-.85,1,0],[.85,1,0],[0,2.2,0],[-.85,1,-.9],[.85,1,-.9],[0,2.2,-.9]];wire(g,v,[[0,1],[1,2],[2,0],[3,4],[4,5],[5,3],[0,3],[1,4],[2,5]]);const mesh=add(g,new THREE.CylinderGeometry(.82,.82,1.45,3,1,false),0x53c3ba,[0,1.58,-.45],.5);mesh.rotation.z=Math.PI/2;}
 else if(kind==='pyramid'){const vertices=[[-.9,.95,-.75],[.9,.95,-.75],[.9,.95,.75],[-.9,.95,.75],[0,2.6,0]];wire(g,vertices,[[0,1],[1,2],[2,3],[3,0],[0,4],[1,4],[2,4],[3,4]]);const mesh=add(g,new THREE.ConeGeometry(1.04,1.7,4),0x5fc8be,[0,1.75,0],.48);mesh.rotation.y=Math.PI/4;}
 else if(kind==='sphere'){add(g,new THREE.SphereGeometry(.83,24,14),0x4db8d0,[0,1.79,0],.75);const ring=add(g,new THREE.TorusGeometry(.87,.014,6,60),0xe3e9ff,[0,1.79,0]);ring.rotation.x=Math.PI/2;}
 else if(kind==='cylinder'){add(g,new THREE.CylinderGeometry(.73,.73,1.65,28),0x6ac6b3,[0,1.65,0],.75);}
 else if(kind==='cone'){add(g,new THREE.ConeGeometry(.86,1.75,28),0x8ad4c0,[0,1.75,0],.78);}
 else if(kind==='plane'){add(g,new THREE.PlaneGeometry(1.95,1.55),0x36b8c3,[0,1.78,0],.45).rotation.set(-.5,.3,.08);}
 else if(kind==='axes'){for(let k=0;k<3;k++){const b=box(g,k===0?[2.15,.035,.035]:k===1?[.035,2.3,.035]:[.035,.035,2.15],k===0?[0,1.38,0]:k===1?[0,1.6,0]:[0,1.38,0],[0xf0a764,0x7ed8b1,0x75b7f1][k]);}}
 g.userData.mathPreview='illustrative';g.userData.previewKind=kind;
}
function classify(grade,lab){const id=String(lab.labId||'');
 if(grade===7){if(id==='7-08')return 'cuboid';if(id==='7-09')return 'prism';}
 if(grade===8&&id==='8-09')return 'pyramid';
 if(grade===9){if(id==='9-09')return 'cylinder';if(id==='9-10')return 'cone';if(id==='9-11')return 'sphere';}
 if(grade===10&&['10-04','10-05'].includes(id))return 'axes';
 if(grade===11&&['11-05','11-06','11-07','11-08','11-09'].includes(id))return 'plane';
 if(grade===12){if(id==='12-04')return 'axes';if(id==='12-07')return 'cylinder';if(id==='12-08')return 'plane';if(id==='12-09')return 'axes';if(id==='12-10')return 'sphere';}
 return null;
}
function board(g,lab,grade){
 g.userData.mathPreview='illustrative';g.userData.previewKind='diagram-2d-in-3d';
 const stand=box(g,[.075,.65,.11],[0,.94,-.06],0x7193a1);
 const frame=box(g,[2.1,1.47,.12],[0,1.85,0],0xd0f1ef);
 // Canvas content has a real, legible diagram/graph rather than a blank teal plaque.
 if(typeof document==='undefined'){
   wire(g,[[-.8,1.3,.11],[0,2.23,.11],[.8,1.3,.11] ],[[0,1],[1,2],[2,0]]);return;
 }
 const can=document.createElement('canvas');can.width=512;can.height=360;const c=can.getContext('2d');if(!c)return;
 c.fillStyle='#f4fafb';c.fillRect(0,0,512,360);c.strokeStyle='#d4e5ec';c.lineWidth=1;
 for(let x=24;x<512;x+=32){c.beginPath();c.moveTo(x,0);c.lineTo(x,360);c.stroke()}
 for(let y=24;y<360;y+=32){c.beginPath();c.moveTo(0,y);c.lineTo(512,y);c.stroke()}
 c.strokeStyle='#138d96';c.lineWidth=8;c.lineCap='round';c.lineJoin='round';const name=(lab.name||'').toLowerCase();
 if(/đồ thị|hàm|giới hạn|đạo hàm|tích phân|lượng giác/.test(name)){
  c.strokeStyle='#49647b';c.lineWidth=3;c.beginPath();c.moveTo(50,190);c.lineTo(465,190);c.moveTo(246,330);c.lineTo(246,36);c.stroke();c.strokeStyle='#138d96';c.lineWidth=6;c.beginPath();for(let x=60;x<=458;x+=4){const t=(x-250)/85;const y=Math.max(40,Math.min(324,190-72*Math.sin(t)));if(x===60)c.moveTo(x,y);else c.lineTo(x,y)}c.stroke();
 }else if(/thống kê|biểu đồ|xác suất|dữ liệu|phép thử/.test(name)){
  for(let i=0;i<5;i++){c.fillStyle=['#1b929c','#63b4bd','#4a8aa6','#e1b86a','#6b98bd'][i];c.fillRect(68+i*86,302-(i*43+65)%205,57,(i*43+65)%205)}
 }else if(/tròn|đường tròn|góc/.test(name)){
  c.beginPath();c.arc(255,184,110,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(255,184);c.lineTo(361,155);c.moveTo(255,184);c.lineTo(194,92);c.stroke();
 }else if(/tập hợp|số thực|trục số/.test(name)){
  c.beginPath();c.moveTo(50,185);c.lineTo(464,185);c.stroke();for(let i=0;i<9;i++){const x=60+i*49;c.beginPath();c.moveTo(x,171);c.lineTo(x,199);c.stroke()}
 }else{
  c.beginPath();c.moveTo(88,298);c.lineTo(250,58);c.lineTo(420,298);c.closePath();c.stroke();c.beginPath();c.moveTo(168,180);c.lineTo(338,180);c.stroke();
 }
 c.fillStyle='#153849';c.font='bold 24px Segoe UI, sans-serif';c.textAlign='center';c.fillText(`TOÁN ${grade} · ${lab.labId}`,256,30);
 const texture=new THREE.CanvasTexture(can);texture.colorSpace=THREE.SRGBColorSpace;
 const fMat=new THREE.MeshBasicMaterial({map:texture,side:THREE.FrontSide});
 const face=new THREE.Mesh(new THREE.PlaneGeometry(1.99,1.37),fMat);face.position.set(0,1.85,.068);g.add(face);
 const faceBack=new THREE.Mesh(face.geometry,fMat);faceBack.position.set(0,1.85,-.068);faceBack.rotation.y=Math.PI;g.add(faceBack);
 g.userData.mathPreview='illustrative';g.userData.previewKind='diagram-2d-in-3d';
}
export function createGrade7To12Preview(grade,lab){if(!(grade>=7&&grade<=12)||!lab?.labId)return null;const g=new THREE.Group();const kind=classify(grade,lab);if(kind)solid(g,kind);else board(g,lab,grade);g.userData.labId=lab.labId;g.userData.grade=grade;return g;}
