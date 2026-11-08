/** MATHVERSE V15 grade-six art direction: compact arched gateways.
 * Uses the bundled official Three.js renderer; no external assets or imports.
 */
const X_OFFSETS=[-10.7,-3.56,3.56,10.7];
export function gatePosition(index,roomX,side){
 if(!Number.isInteger(index)||index<0||index>3)throw Error('Invalid grade6 gate');
 return {x:roomX+X_OFFSETS[index],z:side*20.6};
}
export function createGrade6Gate(THREE,zone,index,room,labelSprite){
 const safeIdx=Number.isInteger(index)&&index>=0&&index<=3?index:((Number(index)||0)%4+4)%4;
 const {x,z}=gatePosition(safeIdx,room.x,room.zSide),color=new THREE.Color(zone.accent);
 const group=new THREE.Group();group.position.set(x,0,z);
 group.userData.portalKey=zone.id;group.userData.portalGrade=6;
 const frameMaterial=new THREE.MeshStandardMaterial({color:0x0b1628,metalness:.38,roughness:.24});
 const luminous=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.98,toneMapped:false,fog:false});
 const base=new THREE.Mesh(new THREE.CylinderGeometry(1.68,1.85,.18,32),frameMaterial);
 base.position.y=.1;group.add(base);
 const threshold=new THREE.Mesh(new THREE.TorusGeometry(1.35,.055,8,42),luminous);
 threshold.rotation.x=-Math.PI/2;threshold.position.y=.21;group.add(threshold);
 for(const side of [-1,1]){
  const post=new THREE.Mesh(new THREE.CylinderGeometry(.14,.19,2.95,10),frameMaterial);
  post.position.set(side*1.42,1.58,0);group.add(post);
  const glow=new THREE.Mesh(new THREE.CylinderGeometry(.043,.043,2.8,8),luminous);
  glow.position.set(side*1.42,1.58,.16);group.add(glow);
 }
 // The arch is a semi-circle, not the oversized full ring of V14.
 const arch=new THREE.Mesh(new THREE.TorusGeometry(1.42,.14,12,44,Math.PI),frameMaterial);
 arch.position.y=3.05;group.add(arch);
 const archGlow=new THREE.Mesh(new THREE.TorusGeometry(1.42,.043,8,44,Math.PI),luminous);
 archGlow.position.set(0,3.05,.13);group.add(archGlow);
 const innerMaterial=new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,side:THREE.DoubleSide,
  uniforms:{uTime:{value:0},uColor:{value:color.clone()},uOpacity:{value:.55}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float uTime;uniform vec3 uColor;uniform float uOpacity;varying vec2 vUv;
  void main(){vec2 p=(vUv-.5)*vec2(1.,1.14);float radial=length(p);
  float whirl=sin(13.*radial-1.6*uTime+atan(p.y,p.x)*3.);
  float shimmer=.59+.21*whirl+.15*sin(uTime*1.15+vUv.y*8.);
  float a=(1.-smoothstep(.33,.56,radial))*(.33+.28*shimmer)*uOpacity;
  gl_FragColor=vec4(mix(uColor,vec3(.86,.99,1.),.18+.12*whirl),clamp(a,0.,.66));}`});
 const inner=new THREE.Mesh(new THREE.PlaneGeometry(2.63,3.17),innerMaterial);
 inner.position.y=1.85;group.add(inner);
 const core=new THREE.Mesh(new THREE.OctahedronGeometry(.17,0),new THREE.MeshBasicMaterial({color:0xffffff}));
 core.position.y=2.45;group.add(core);
 const marker=labelSprite(zone.short||zone.label,zone.accent,3.2,.65,'rgba(12,27,43,.91)');
 marker.position.set(0,4.76,.02);group.add(marker);
 const indexPlate=labelSprite(`CỔNG ${index+1}`,zone.accent,1.5,.42,'rgba(9,25,38,.86)');
 indexPlate.position.set(0,.54,.25);group.add(indexPlate);
 return {zone:zone.id,group,ring:archGlow,inner,core,shader:innerMaterial,x,z,grade:6};
}
export function createReturnGate(THREE,labelSprite,room){
 const group=new THREE.Group();group.position.set(room.x,0,room.zSide*13.3);
 group.userData.portalReturn=true;group.userData.portalGrade=6;
 const mat=new THREE.MeshBasicMaterial({color:0xb9d5e0,transparent:true,opacity:.78});
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.95,.10,9,32),mat);ring.position.y=1.8;ring.scale.y=1.35;group.add(ring);
 const inner=new THREE.Mesh(new THREE.PlaneGeometry(1.8,2.6),new THREE.MeshBasicMaterial({color:0x8ac3d1,transparent:true,opacity:.11,side:THREE.DoubleSide,depthWrite:false}));inner.position.y=1.8;group.add(inner);
 const text=labelSprite('VỀ 4 CỔNG','#a7e7dc',2.6,.60,'rgba(10,27,42,.91)');text.position.y=3.48;group.add(text);
 return {group,x:group.position.x,z:group.position.z,zone:null,inner,ring,grade:6};
}
