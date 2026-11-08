/** MATHVERSE V15.1: actual 3D educational dioramas (not screenshots on planes).
 * A thin solid can *represent* a plane shape in the gallery without falsely
 * claiming that the mathematical model is itself a 3D solid. Its lab is 2D.
 * Reference: three.js Shape + ExtrudeGeometry, Cylinder, Torus, InstancedMesh.
 */
const COLOR={mint:0x43dbc4,blue:0x76b9f7,amber:0xf5bc67,pink:0xe9a0b3,
 violet:0xb4a0f4,white:0xe5f6f5,navy:0x244b67,dark:0x214251,
 green:0x73cea1,gray:0x7793a7};
export const MATH6_3D_VARIANTS=Object.freeze({
 polygon:['triangle','square','hexagon','rectangle','rhombus','parallelogram','trapezoid'],
 composition:['parallelogram'],tiling:['mixed'],
 symmetry:['axis','center'],
 geometry:['pointline','pairlines','rays','ruler','midpoint','angle','clock'],
 number:['natural','integer','hops','factors','primes'],
 fraction:['bar','equivalent','percent','addsame'],
 chart:['pictogram','bar','double'],chance:['spinner','dice','coin'],real:['ferris','room']
});
const permitted=new Set(Object.entries(MATH6_3D_VARIANTS).flatMap(([engine,v])=>v.map(variant=>`${engine}:${variant}`)));
export function hasReal3DGalleryModel(item){return permitted.has(`${item?.labEngine}:${item?.labVariant}`);}
export function makeMath6GalleryPreview(THREE,item){
 if(!hasReal3DGalleryModel(item))throw new Error(`No meaningful 3D preview for ${item?.labId||item?.id}: ${item?.labEngine}:${item?.labVariant}`);
 const root=new THREE.Group();root.name='MATH6 3D: '+item.title;
 root.userData={gallery3D:true,sourceLab:item.labId,representation:'tangible-educational-diorama',flatMath:item.labEngine!=='real'&&item.labEngine!=='chance'};
 const mats=new Map();
 const material=(color,metalness=.10,roughness=.46)=>{
   const id=`${color}|${metalness}|${roughness}`;
   if(!mats.has(id))mats.set(id,new THREE.MeshStandardMaterial({color,metalness,roughness,
      emissive:color,emissiveIntensity:.075,side:THREE.DoubleSide}));
   return mats.get(id);
 };
 const add=(parent,geom,color,x=0,y=0,z=0,metalness=.10,roughness=.46)=>{
   const mesh=new THREE.Mesh(geom,material(color,metalness,roughness));
   mesh.position.set(x,y,z);mesh.castShadow=false;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 };
 const orb=(x,y,z,r,color,parent=root)=>add(parent,new THREE.SphereGeometry(r,12,8),color,x,y,z);
 const block=(x,y,z,w,h,d,color,parent=root)=>add(parent,new THREE.BoxGeometry(w,h,d),color,x,y,z);
 const rod=(a,b,r=.042,color=COLOR.mint,parent=root)=>{
   const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A),dist=v.length();
   if(dist<.0001)return null;
   const m=add(parent,new THREE.CylinderGeometry(r,r,dist,10),color,...A.clone().add(B).multiplyScalar(.5).toArray());
   m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;
 };
 const poly=(points,color,options={})=>{
   const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
   const geom=new THREE.ExtrudeGeometry(s,{depth:options.depth??.20,bevelEnabled:true,bevelSize:.04,bevelThickness:.035,bevelSegments:2,steps:1});
   geom.center();const group=new THREE.Group();group.position.set(options.x||0,options.y??1.28,options.z||0);group.rotation.y=options.yaw??-.09;
   root.add(group);const mesh=add(group,geom,color);
   if(options.edges!==false){const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geom,30),new THREE.LineBasicMaterial({color:options.outline||0xd6fffb,transparent:true,opacity:.72}));group.add(edges);}
   return group;
 };
 const polygon=(n,r=1.02,phase=-Math.PI/2)=>Array.from({length:n},(_,i)=>[Math.cos(phase+2*Math.PI*i/n)*r,Math.sin(phase+2*Math.PI*i/n)*r]);
 const variant=item.labVariant;
 const highlight=COLOR.mint;
 const byColor=[COLOR.mint,COLOR.blue,COLOR.amber,COLOR.pink,COLOR.violet,COLOR.green];
 if(item.labEngine==='polygon'){
   const verts={
    triangle:[[-1.02,-.89],[1.02,-.89],[0,.876691]],
    square:[[-.93,-.93],[.93,-.93],[.93,.93],[-.93,.93]],
    hexagon:polygon(6,1.06,-Math.PI/6),
    rectangle:[[-1.08,-.75],[1.08,-.75],[1.08,.75],[-1.08,.75]],
    rhombus:[[0,1.09],[1.08,0],[0,-1.09],[-1.08,0]],
    parallelogram:[[-1.08,-.77],[.57,-.77],[1.08,.77],[-.57,.77]],
    trapezoid:[[-1.11,-.84],[1.11,-.84],[.68,.84],[-.68,.84]]
   }[variant];
   const g=poly(verts,variant==='rhombus'?COLOR.violet:COLOR.mint);
   if(['triangle','hexagon','rhombus'].includes(variant)){
     const pts=verts.map(p=>new THREE.Vector3(p[0],p[1],.17));
     if(variant==='rhombus')for(const [a,b] of [[0,2],[1,3]])rod(pts[a].toArray(),pts[b].toArray(),.022,COLOR.amber,g);
     else if(variant==='hexagon')for(let i=0;i<6;i++)rod([0,0,.17],pts[i].toArray(),.016,COLOR.blue,g);
   }
 } else if(item.labEngine==='composition'){
   const a=poly([[-.93,-.55],[.18,-.55],[.54,.55],[-.57,.55]],COLOR.mint,{x:-.45,edges:true,yaw:0});
   const b=poly([[-.52,-.55],[.52,-.55],[.16,.55],[-.88,.55]],COLOR.amber,{x:.65,edges:true,yaw:0});
   rod([-.9,.55,.18],[.95,.55,.18],.026,COLOR.white);
 } else if(item.labEngine==='tiling'){
   // Four connected extruded hexagons: spatially legible modular tiling sample.
   for(const [i,[x,y]] of [[-.55,-.42],[.55,-.42],[0,.55],[-1.08,.48],[1.08,.48]].entries())
     poly(polygon(6,.53,-Math.PI/6),byColor[i],{x,y:1.30+y,depth:.12,yaw:0,outline:0xdafdf6});
 } else if(item.labEngine==='symmetry'){
   const left=[[-.08,1.0],[-.85,.73],[-.68,.12],[-1.04,-.62],[-.2,-.89],[0,0]];
   const right=left.map(([x,y])=>[-x,y]);
   if(variant==='axis'){
     poly(left,COLOR.blue,{x:-.07,yaw:0});poly(right,COLOR.pink,{x:.07,yaw:0});
     rod([0,.12,.26],[0,2.47,.26],.037,COLOR.amber);
   }else{
     // A figure and its 180-degree rotation, not reflection in a line.
     const petal=[[.2,.24],[.42,.94],[1.01,.75],[.97,.14],[.5,-.10]];
     poly(petal,COLOR.blue,{yaw:0});poly(petal.map(([x,y])=>[-x,-y]),COLOR.pink,{yaw:0});
     orb(0,1.28,.28,.16,COLOR.amber);for(let i=0;i<4;i++){
     const a=i*Math.PI/2;rod([0,1.28,.28],[Math.sin(a)*.25,1.28+Math.cos(a)*.25,.28],.02,COLOR.amber);
   }}
 } else if(item.labEngine==='geometry'){
   // Raised rods, illuminated endpoints and angle arcs are tangible manipulatives.
   const y=1.25,z=.17;
   const line=(x1,y1,x2,y2,c=COLOR.mint)=>rod([x1,y+y1,z],[x2,y+y2,z],.04,c);
   const dot=(x,y1,c=COLOR.amber)=>orb(x,y+y1,z,.105,c);
   if(variant==='clock'){
     const dial=add(root,new THREE.CylinderGeometry(1.01,1.01,.16,48),COLOR.white,0,1.24,0,.25);
     dial.rotation.x=Math.PI/2;
     const rim=add(root,new THREE.TorusGeometry(.97,.06,10,50),COLOR.blue,0,1.24,.12);
     for(let i=0;i<12;i++){const a=i*Math.PI/6;dot(.83*Math.cos(a),.83*Math.sin(a),COLOR.dark);}
     rod([0,1.24,.22],[.62,1.48,.22],.048,COLOR.violet);
     rod([0,1.24,.24],[-.28,1.92,.24],.057,COLOR.amber);dot(0,0,COLOR.pink);
   }else if(variant==='angle'){
     line(0,0,1.06,0);line(0,0,.54,.93,COLOR.blue);dot(0,0);
     const curve=new THREE.CatmullRomCurve3(Array.from({length:18},(_,i)=>{const t=(Math.PI/3)*i/17;return new THREE.Vector3(.39*Math.cos(t),y+.39*Math.sin(t),z+.05);}));
     root.add(new THREE.Mesh(new THREE.TubeGeometry(curve,18,.025,6,false),material(COLOR.amber)));
   }else if(variant==='midpoint'||variant==='ruler'){
     line(-1.09,0,1.09,0,COLOR.blue);dot(-1.09,0);dot(1.09,0);
     if(variant==='midpoint')dot(0,0,COLOR.amber);
     else for(let i=0;i<9;i++){const x=-1+i*.25;line(x,-.08,x,.08,i%2===0?COLOR.amber:COLOR.white);}
   }else if(variant==='pointline'){
     line(-1.10,0,1.1,0,COLOR.blue);dot(-.55,0);dot(.45,0,COLOR.blue);dot(.10,.5,COLOR.pink);
   }else if(variant==='pairlines'){
     line(-1.05,-.58,1.05,.58,COLOR.blue);line(-1.05,.58,1.05,-.58,COLOR.pink);dot(0,0);
   }else if(variant==='rays'){
     line(0,0,1.10,0);line(0,0,-1.10,0,COLOR.blue);dot(0,0);
     for(const v of [-1,1]){
       const head=add(root,new THREE.ConeGeometry(.11,.22,12),v===1?COLOR.mint:COLOR.blue,v*1.11,1.25,z);
       head.rotation.z=v===1?-Math.PI/2:Math.PI/2;
     }
   }
 } else if(item.labEngine==='number'){
   if(['natural','integer','hops'].includes(variant)){
     rod([-1.17,1.17,.1],[1.17,1.17,.1],.043,COLOR.blue);
     for(let i=0;i<9;i++){const x=-1.08+i*.27;
       rod([x,1.06,.1],[x,1.30,.1],.026,i===4?COLOR.amber:COLOR.white);
     }
     const x=variant==='natural'?.67:variant==='integer'?- .43:.53;
     orb(x,1.47,.11,.20,COLOR.amber);
     if(variant==='hops'){
       const a=new THREE.CatmullRomCurve3(Array.from({length:17},(_,i)=>new THREE.Vector3(-.81+1.35*i/16,1.45+.47*Math.sin(Math.PI*i/16),.13)));
       root.add(new THREE.Mesh(new THREE.TubeGeometry(a,16,.026,6,false),material(COLOR.pink)));
     }
   }else if(variant==='factors'){
     const nodes=[[0,2.17,COLOR.amber],[-.63,1.34,COLOR.blue],[.64,1.34,COLOR.mint],[-.96,.60,COLOR.white],[-.31,.60,COLOR.violet],[.38,.60,COLOR.white],[.94,.60,COLOR.pink]];
     for(const [a,b] of [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]])rod([nodes[a][0],nodes[a][1],0],[nodes[b][0],nodes[b][1],0],.033,COLOR.gray);
     for(const [x,y,c] of nodes)orb(x,y,.08,.18,c);
   }else if(variant==='primes'){
     grid100(n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true;});
   }
 } else if(item.labEngine==='fraction'){
   if(variant==='percent')grid100(n=>n<=Math.round(item.labDefaults?.numerator??45));
   else{
     const d=Math.max(1,Math.round(item.labDefaults?.denominator??8));
     const n=Math.max(0,Math.round(item.labDefaults?.numerator??3));
     const factor=Math.max(1,Math.round(item.labDefaults?.factor??2));
     const other=Math.max(0,Math.round(item.labDefaults?.other??3));
     const rows=variant==='addsame'?[[n,d],[other,d],[n+other,d]]:variant==='equivalent'?[[n,d],[n*factor,d*factor]]:[[n,d]];
     rows.forEach(([fill,count],r)=>{
       const unit=2.28/count,start=-1.14+unit/2,yy=1.75-r*.62;
       for(let i=0;i<count;i++)block(start+i*unit,yy,.04,unit*.9,.35,.27,i<fill?[COLOR.mint,COLOR.blue,COLOR.amber][r]:COLOR.gray);
     });
   }
 } else if(item.labEngine==='chart'){
   const source=item.labDefaults||{};
   if(variant==='pictogram'){
     // A pictogram consists of repeated symbols, NOT continuous columns.
     const values=(source.values||[3,5,7,4]).slice(0,4);
     const countMax=Math.max(...values,1);
     const step=Math.min(.26,1.80/countMax);
     values.forEach((count,i)=>{
       const x=-.87+i*.59;
       for(let n=0;n<count;n++)add(root,new THREE.IcosahedronGeometry(.105,0),byColor[i],x,.26+step*n,.08);
     });
     rod([-1.18,.17,.06],[1.18,.17,.06],.032,COLOR.white);
   }else{
     // Raised bars have EXACT relative height ratios from the default SGK data;
     // visitor clicks to edit the *2D* chart in the actual Lab.
     const primary=(source.values||[12,8,16,10]).slice(0,4);
     const secondary=variant==='double'?(source.otherValues||[9,16,11,7]).slice(0,4):null;
     const maximum=Math.max(1,...primary,...(secondary||[]));
     rod([-1.16,.31,.36],[-1.16,2.10,.36],.035,COLOR.white);
     rod([-1.16,.31,.36],[1.19,.31,.36],.035,COLOR.white);
     primary.forEach((v,i)=>{
       const x=-.82+i*.54,h=v/maximum*1.52;
       block(x-(secondary?.095:0),.35+h/2,.13,secondary?.19:.34,h,.32,byColor[i%byColor.length]);
       if(secondary){const hh=(secondary[i]||0)/maximum*1.52;
         block(x+.105,.35+hh/2,.13,.19,hh,.32,COLOR.amber);}
     });
   }
 } else if(item.labEngine==='chance'){
   if(variant==='dice'){
     const die=new THREE.Group();root.add(die);die.position.y=1.18;die.rotation.set(.18,.42,.10);
     add(die,new THREE.BoxGeometry(1.57,1.57,1.57),COLOR.white);
     const pattern={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[-1,1],[1,-1],[1,1]],5:[[-1,-1],[-1,1],[0,0],[1,-1],[1,1]],6:[[-1,-1],[-1,0],[-1,1],[1,-1],[1,0],[1,1]]};
     const side=.795,offset=.34;
     for(const [value,face] of [[1,'right'],[6,'left'],[2,'top'],[5,'bottom'],[3,'front'],[4,'back']]){
       for(const [u,v] of pattern[value]){const a=u*offset,b=v*offset;let xyz;
         if(face==='right')xyz=[side,b,-a];else if(face==='left')xyz=[-side,b,a];
         else if(face==='top')xyz=[a,side,-b];else if(face==='bottom')xyz=[a,-side,b];
         else if(face==='front')xyz=[a,b,side];else xyz=[-a,b,-side];
         const pip=orb(...xyz,.075,COLOR.dark,die);pip.name=`dice-pip-${value}`;
       }
     }
   }else if(variant==='coin'){
     const coin=add(root,new THREE.CylinderGeometry(.88,.88,.28,50),COLOR.amber,0,1.24,.04,.67,.24);
     coin.rotation.x=Math.PI/2; // coin face visible on its wide round surface
     root.add(add(root,new THREE.TorusGeometry(.78,.06,8,48),COLOR.white,0,1.24,.23));
     const n=[[-.35,-.37],[-.35,.37],[.33,-.37],[.33,.37]];
     rod([n[0][0],1.24+n[0][1],.25],[n[1][0],1.24+n[1][1],.25],.055,COLOR.dark);
     rod([n[0][0],1.24+n[1][1],.25],[n[2][0],1.24+n[2][1],.25],.055,COLOR.dark);
     rod([n[2][0],1.24+n[2][1],.25],[n[3][0],1.24+n[3][1],.25],.055,COLOR.dark);
   }else if(variant==='spinner'){
     for(let i=0;i<6;i++){
       const shape=new THREE.Shape();shape.moveTo(0,0);
       const a=i*Math.PI/3,b=(i+1)*Math.PI/3;
       for(let j=0;j<=9;j++){const t=a+(b-a)*j/9;shape.lineTo(.91*Math.cos(t),.91*Math.sin(t));}
       shape.closePath();
       const geo=new THREE.ExtrudeGeometry(shape,{depth:.14,bevelEnabled:false,steps:1});
       add(root,geo,byColor[i],0,1.22,0);
     }
     const rim=add(root,new THREE.TorusGeometry(.91,.04,8,50),COLOR.white,0,1.22,.14);
     rod([0,1.22,.18],[0,2.29,.18],.035,COLOR.dark);
     orb(0,1.22,.23,.13,COLOR.amber);
   }
 } else if(item.labEngine==='real'){
   if(variant==='ferris'){
     const rotor=new THREE.Group();rotor.name='ferris-rotor';rotor.position.set(0,1.42,0);root.add(rotor);
     const cabins=[];
     rotor.add(new THREE.Mesh(new THREE.TorusGeometry(.88,.06,10,48),material(COLOR.blue,.31)));
     for(let i=0;i<8;i++){
       const a=i*Math.PI/4,x=Math.cos(a)*.88,y=Math.sin(a)*.88;
       rod([0,0,0],[x,y,0],.025,COLOR.white,rotor);
       const cabin=new THREE.Group();cabin.name='ferris-cabin';cabin.position.set(x,y,.06);rotor.add(cabin);
       block(0,-.11,0,.23,.18,.16,byColor[i%6],cabin);cabins.push(cabin);
     }
     rod([-.55,.12,0],[0,1.42,0],.065,COLOR.amber);
     rod([.55,.12,0],[0,1.42,0],.065,COLOR.amber);
     block(0,.10,0,1.28,.14,.49,COLOR.dark);
     root.userData.animate=time=>{rotor.rotation.z=time*.085;for(const cabin of cabins)cabin.rotation.z=-rotor.rotation.z;};
   }else if(variant==='room'){
     block(0,.14,0,2.25,.13,1.84,0x7daba9);
     block(0,.55,-.93,2.28,.84,.09,COLOR.white);
     block(-1.10,.55,0,.09,.84,1.84,COLOR.white);
     for(let i=0;i<12;i++){
       const row=Math.floor(i/4),col=i%4,x=-.79+col*.52,z=-.52+row*.52;
       const desk=block(x,.32,z,.40,.15,.29,COLOR.amber);desk.name='room-desk';
       block(x,.20,z,.16,.07,.27,COLOR.dark);
     }
     block(.65,.42,.72,.42,.27,.20,COLOR.blue);
   }
 }
 // Every selected exhibit is an actual mesh construction; no PlaneGeometry or dark board.
 if(item.labEngine==='tiling')root.scale.setScalar(.81);
 // Physically arrange the constructed mesh above its existing marble plinth.
 // Number lines stay raised on slim support struts, not on a fake 2D billboard.
 const bounds=new THREE.Box3().setFromObject(root);
 const extent=bounds.getSize(new THREE.Vector3());
 const center=bounds.getCenter(new THREE.Vector3());
 const lift=extent.y<.78?1.0:.09;
 const assembly=new THREE.Group();assembly.name='actual-3D-math-artifact';
 for(const child of [...root.children])assembly.add(child);
 assembly.position.set(-center.x,lift-bounds.min.y,-center.z);
 root.add(assembly);
 if(extent.y<.78){
   for(const x of [-.68,.68])rod([x,.07,0],[x,lift,.0],.030,COLOR.gray,root);
 }
 root.userData.geometryMode=item.labEngine==='polygon'?'extruded-plane-relief':item.labEngine;
 root.userData.baseRotation=0;
 return root;
 function grid100(active){
   const geometry=new THREE.BoxGeometry(.168,.168,.09),mat=material(COLOR.white);
   const cells=new THREE.InstancedMesh(geometry,mat,100),dummy=new THREE.Object3D();
   const on=new THREE.Color(COLOR.mint),off=new THREE.Color(COLOR.gray);
   for(let n=1;n<=100;n++){
     const col=(n-1)%10,row=Math.floor((n-1)/10);
     dummy.position.set(-.85+col*.19,2.13-row*.19,.03);dummy.updateMatrix();
     cells.setMatrixAt(n-1,dummy.matrix);cells.setColorAt(n-1,active(n)?on:off);
   }
   cells.instanceMatrix.needsUpdate=true;
   if(cells.instanceColor)cells.instanceColor.needsUpdate=true;
   root.add(cells);
 }
}
