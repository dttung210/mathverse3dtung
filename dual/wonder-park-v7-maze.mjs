/**
 * Original educational maze generator (randomized DFS spanning tree).
 * A perfect maze has one and only one path between any two open cells.
 * No AI-generated questions and no external assets.
 */
export const MAZE_LEVELS = Object.freeze([15,17,19,21,23,25,27,29]);
export const MAZE_CELL_SIZE = 3.3;

function generateMazeCandidate(level, seed=0x19562026){
  if(!Number.isInteger(level)||level<1||level>MAZE_LEVELS.length)throw new RangeError('Invalid maze level');
  const size=MAZE_LEVELS[level-1],grid=Array.from({length:size},()=>Array(size).fill(1));
  let rng=(seed^(level*0x9e3779b9))>>>0;
  const rand=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)/4294967296;};
  const stack=[[1,1]];grid[1][1]=0;
  const offsets=[[0,2],[0,-2],[2,0],[-2,0]];
  while(stack.length){
    const [r,c]=stack[stack.length-1];
    const options=offsets.filter(([dr,dc])=>{const rr=r+dr,cc=c+dc;return rr>0&&cc>0&&rr<size-1&&cc<size-1&&grid[rr][cc]===1;});
    if(!options.length){stack.pop();continue;}
    const [dr,dc]=options[Math.floor(rand()*options.length)];
    grid[r+dr/2][c+dc/2]=0;grid[r+dr][c+dc]=0;stack.push([r+dr,c+dc]);
  }
  // Farthest reachable cell in walking distance (not straight-line distance).
  const queue=[[1,1]],distance=Array.from({length:size},()=>Array(size).fill(-1));
  distance[1][1]=0;let head=0,exit=[1,1];
  while(head<queue.length){
    const [r,c]=queue[head++];
    if(distance[r][c]>distance[exit[0]][exit[1]])exit=[r,c];
    for(const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]]){
      const rr=r+dr,cc=c+dc;
      if(rr>=0&&cc>=0&&rr<size&&cc<size&&grid[rr][cc]===0&&distance[rr][cc]<0){
        distance[rr][cc]=distance[r][c]+1;queue.push([rr,cc]);
      }
    }
  }
  const deadEnds=[];
  for(let r=1;r<size-1;r++)for(let c=1;c<size-1;c++)if(grid[r][c]===0){
    const open=[[0,1],[0,-1],[1,0],[-1,0]].filter(([dr,dc])=>grid[r+dr][c+dc]===0).length;
    if(open===1)deadEnds.push([r,c]);
  }
  return {level,size,grid,start:[1,1],exit,solutionLength:distance[exit[0]][exit[1]],deadEnds,seed};
}


/** Rank randomized mazes by the number and depth of genuine dead-end branches. */
function scoreMaze(maze){
  const {grid,size,deadEnds}=maze;
  const neighbors=([r,c])=>[[r+1,c],[r-1,c],[r,c+1],[r,c-1]].filter(([rr,cc])=>rr>=0&&cc>=0&&rr<size&&cc<size&&grid[rr][cc]===0);
  let deepEnds=0,depthSum=0;
  for(const start of deadEnds){
    let prev=null,cell=start,depth=0;
    while(depth<size*size){
      const choices=neighbors(cell);
      if(choices.length>=3||depth>0&&cell[0]===maze.start[0]&&cell[1]===maze.start[1])break;
      const next=choices.find(([r,c])=>!prev||r!==prev[0]||c!==prev[1]);
      if(!next)break;
      prev=cell;cell=next;depth++;
    }
    depthSum+=Math.min(depth,22);
    if(depth>=6)deepEnds++;
  }
  maze.deepDeadEnds=deepEnds;
  maze.averageDeadEndDepth=Number((depthSum/Math.max(1,deadEnds.length)).toFixed(2));
  return deepEnds*15+deadEnds.length*5+depthSum*.65+maze.solutionLength*.17;
}
/** A seed is reproducible, while every new play session passes a new seed. */
export function generatePerfectMaze(level, seed=0x19562026){
  let best=null,bestScore=-Infinity;
  for(let i=0;i<10;i++){
    const attemptSeed=(seed+Math.imul(i,0x9e3779b9))>>>0;
    const maze=generateMazeCandidate(level,attemptSeed);
    const score=scoreMaze(maze);
    if(score>bestScore){best=maze;bestScore=score;}
  }
  return best;
}
/** Unique walk from entrance to exit; no branching arrowheads. */
export function getMazeSolution(maze){
  const {grid,size,start,exit}=maze;
  const key=([r,c])=>`${r},${c}`;
  const q=[start],previous=new Map([[key(start),null]]);
  for(let i=0;i<q.length;i++){
    const [r,c]=q[i];
    if(r===exit[0]&&c===exit[1])break;
    for(const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]]){
      const next=[r+dr,c+dc];
      if(next[0]<0||next[1]<0||next[0]>=size||next[1]>=size||grid[next[0]][next[1]]!==0||previous.has(key(next)))continue;
      previous.set(key(next),[r,c]);q.push(next);
    }
  }
  if(!previous.has(key(exit)))throw new Error('Maze exit unreachable');
  const path=[];
  for(let at=exit;at;at=previous.get(key(at)))path.push(at);
  return path.reverse();
}

export function createMazeScene(THREE,parent){
  const wrapper=new THREE.Group();wrapper.name='MATHVERSE_MAZE_SHARED_WORLD';wrapper.position.set(-330,0,-145);parent.add(wrapper);
  wrapper.visible=false;
  const T=MAZE_CELL_SIZE,wallColor=new THREE.Color(0x25517b),meshMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.77});
  let maze=null,wallMesh=null,floor=null,exitMarker=null,entrance=null,routeLine=null,routeHead=null,routeRibbon=null,half=0,runId=0;
  const previousLevelMaps=new Map();
  function makeSign(text,width=2.4,height=.6,bg='#124338',fg='#5ffbd4'){
    if(typeof document==='undefined')return new THREE.Group();
    const c=document.createElement('canvas');c.width=512;c.height=128;
    const ctx=c.getContext('2d');
    ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);
    ctx.strokeStyle=fg;ctx.lineWidth=8;ctx.strokeRect(6,6,500,116);
    ctx.fillStyle=fg;ctx.font='bold 44px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(text,256,64);
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
    const sMat=new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.FrontSide});
    const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),sMat);
    const back=new THREE.Mesh(m.geometry,sMat);back.rotation.y=Math.PI;back.position.z=-0.012;m.add(back);
    return m;
  }
  function dispose(){
    for(const obj of [wallMesh,floor,exitMarker,entrance,routeLine,routeHead,routeRibbon]){
      if(!obj)continue;wrapper.remove(obj);obj.geometry?.dispose();if(obj.material!==meshMaterial)obj.material?.dispose();
    }
    wallMesh=floor=exitMarker=entrance=routeLine=routeHead=routeRibbon=null;
  }
  function gridToLocal(r,c){return {x:(c-maze.size/2+.5)*T,z:(r-maze.size/2+.5)*T};}
  function gridToWorld(r,c){const p=gridToLocal(r,c);parent.updateMatrixWorld(true);
    const v=wrapper.localToWorld(new THREE.Vector3(p.x,0,p.z));return {x:v.x,z:v.z};
  }
  function cellFromWorld(x,z){parent.updateMatrixWorld(true);
    const v=wrapper.worldToLocal(new THREE.Vector3(x,0,z));
    return {r:Math.floor((v.z+half)/T),c:Math.floor((v.x+half)/T)};
  }
  function openWorld(x,z){
    if(!maze)return false;
    const p=cellFromWorld(x,z);
    return p.r>=0&&p.c>=0&&p.r<maze.size&&p.c<maze.size&&maze.grid[p.r][p.c]===0;
  }
  function reset(level){
    dispose();
    // Never reuse the same maze merely because pupils replay the same level.
    const seed=(Date.now()^Math.imul(++runId,0x9e3779b9)^(Math.random()*4294967296>>>0))>>>0;
    maze=generatePerfectMaze(level,seed);
    let signature=maze.grid.map(row=>row.join('')).join('');
    for(let retry=1;signature===previousLevelMaps.get(level)&&retry<12;retry++){
      maze=generatePerfectMaze(level,(seed+Math.imul(retry,0x85ebca6b))>>>0);
      signature=maze.grid.map(row=>row.join('')).join('');
    }
    previousLevelMaps.set(level,signature);
    half=maze.size*T/2;
    wrapper.visible=true;
    const walls=[];
    for(let r=0;r<maze.size;r++)for(let c=0;c<maze.size;c++)if(maze.grid[r][c])walls.push({r,c});
    wallMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(T*.96,4.05,T*.96),meshMaterial,walls.length);
    const d=new THREE.Object3D();walls.forEach(({r,c},i)=>{const p=gridToLocal(r,c);
      d.position.set(p.x,2.02,p.z);d.updateMatrix();wallMesh.setMatrixAt(i,d.matrix);
      const shade=(r+c)%4;wallMesh.setColorAt(i,new THREE.Color([0x1e40af,0x1d4ed8,0x0f766e,0x334155][shade]));
    });
    wallMesh.instanceMatrix.needsUpdate=true;wallMesh.instanceColor.needsUpdate=true;wrapper.add(wallMesh);
    floor=new THREE.Mesh(new THREE.BoxGeometry(maze.size*T,.42,maze.size*T),new THREE.MeshStandardMaterial({color:0xf3e5ab,roughness:.78,metalness:.06}));
    floor.position.y=-.22;wrapper.add(floor);
    const s=gridToLocal(...maze.start),e=gridToLocal(...maze.exit);
    // CỬA VÀO (ENTRANCE) — Nổi bật với tông Xanh Ngọc Lục Bảo Neon (#00f5d4 / #10b981)
    entrance=new THREE.Mesh(new THREE.CylinderGeometry(1.32,1.42,.16,32),new THREE.MeshBasicMaterial({color:0x00f5d4}));
    entrance.position.set(s.x,.08,s.z);wrapper.add(entrance);
    const inRing=new THREE.Mesh(new THREE.TorusGeometry(1.46,.09,12,36),new THREE.MeshBasicMaterial({color:0x10b981}));
    inRing.rotation.x=Math.PI/2;inRing.position.y=.06;entrance.add(inRing);
    for(const side of [-1,1]){
      const col=new THREE.Mesh(new THREE.CylinderGeometry(.18,.22,3.6,18),new THREE.MeshStandardMaterial({color:0x059669,emissive:0x047857,emissiveIntensity:.55,metalness:.35,roughness:.28}));
      col.position.set(side*1.08,1.8,0);entrance.add(col);
      const cap=new THREE.Mesh(new THREE.BoxGeometry(.52,.24,.52),new THREE.MeshStandardMaterial({color:0x00f5d4,emissive:0x00f5d4,emissiveIntensity:.45}));
      cap.position.set(side*1.08,3.65,0);entrance.add(cap);
      const torch=new THREE.Mesh(new THREE.SphereGeometry(.22,14,14),new THREE.MeshBasicMaterial({color:0x5ffbd4}));
      torch.position.set(side*1.08,4.05,0);entrance.add(torch);
    }
    const inBeam=new THREE.Mesh(new THREE.BoxGeometry(2.75,.44,.44),new THREE.MeshStandardMaterial({color:0x065f46,emissive:0x047857,emissiveIntensity:.4,roughness:.35}));
    inBeam.position.set(0,3.68,0);entrance.add(inBeam);
    const inSign=makeSign('🚪 CỬA VÀO MÊ CUNG',2.65,.62,'#022c22','#00f5d4');
    inSign.position.set(0,4.28,0);entrance.add(inSign);
    const inBeacon=new THREE.Mesh(new THREE.CylinderGeometry(.24,.55,14,18,1,true),new THREE.MeshBasicMaterial({color:0x00f5d4,transparent:true,opacity:.26,side:THREE.DoubleSide,depthWrite:false}));
    inBeacon.position.set(0,7.2,0);entrance.add(inBeacon);

    // CỬA RA (EXIT) — Nổi bật đối lập với tông Đỏ Hồng Ngọc & Vàng Hoàng Gia (#ff2a85 / #fbbf24)
    exitMarker=new THREE.Mesh(new THREE.CylinderGeometry(1.45,1.55,.18,32),new THREE.MeshBasicMaterial({color:0xff2a85}));
    exitMarker.position.set(e.x,.10,e.z);wrapper.add(exitMarker);
    const exRing=new THREE.Mesh(new THREE.TorusGeometry(1.62,.11,12,36),new THREE.MeshBasicMaterial({color:0xfbbf24}));
    exRing.rotation.x=Math.PI/2;exRing.position.y=.08;exitMarker.add(exRing);
    for(const side of [-1,1]){
      const exCol=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,4.2,18),new THREE.MeshStandardMaterial({color:0xe11d48,emissive:0x9f1239,emissiveIntensity:.6,metalness:.55,roughness:.25}));
      exCol.position.set(side*1.22,2.1,0);exitMarker.add(exCol);
      const exCap=new THREE.Mesh(new THREE.BoxGeometry(.62,.28,.62),new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xd97706,emissiveIntensity:.5,metalness:.75,roughness:.2}));
      exCap.position.set(side*1.22,4.25,0);exitMarker.add(exCap);
      const exOrb=new THREE.Mesh(new THREE.SphereGeometry(.26,14,14),new THREE.MeshBasicMaterial({color:0xfde047}));
      exOrb.position.set(side*1.22,4.68,0);exitMarker.add(exOrb);
    }
    const exBeam=new THREE.Mesh(new THREE.BoxGeometry(3.1,.52,.52),new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xb45309,emissiveIntensity:.45,metalness:.75,roughness:.22}));
    exBeam.position.set(0,4.28,0);exitMarker.add(exBeam);
    const exSign=makeSign('🏁 CỬA RA · ĐÍCH ĐẾN',2.95,.68,'#4c0519','#fde047');
    exSign.position.set(0,4.95,0);exitMarker.add(exSign);
    const star=new THREE.Mesh(new THREE.OctahedronGeometry(.52,0),new THREE.MeshBasicMaterial({color:0xfde047}));
    star.position.set(0,5.82,0);exitMarker.add(star);
    const exBeacon=new THREE.Mesh(new THREE.CylinderGeometry(.32,.85,22,20,1,true),new THREE.MeshBasicMaterial({color:0xff2a85,transparent:true,opacity:.32,side:THREE.DoubleSide,depthWrite:false}));
    exBeacon.position.set(0,11.2,0);exitMarker.add(exBeacon);

    const path=getMazeSolution(maze);
    const vertices=path.map(([r,c])=>{const p=gridToLocal(r,c);return new THREE.Vector3(p.x,.17,p.z);});
    // One continuous directional route, with EXACTLY ONE arrowhead at the exit.
    const geom=new THREE.BufferGeometry().setFromPoints(vertices);
    routeLine=new THREE.Line(geom,new THREE.LineBasicMaterial({color:0xffe06a,linewidth:3,depthTest:false,transparent:true,opacity:.96}));
    routeLine.renderOrder=8;wrapper.add(routeLine);
    const tubePath=new THREE.CatmullRomCurve3(vertices);
    const tubeGeo=new THREE.TubeGeometry(tubePath,Math.max(12,vertices.length*4),.22,8,false);
    routeRibbon=new THREE.Mesh(tubeGeo,new THREE.MeshBasicMaterial({color:0xffd23f,depthTest:false,transparent:true,opacity:.92}));
    routeRibbon.renderOrder=8;wrapper.add(routeRibbon);
    const point=vertices.at(-1),before=vertices.at(-2)||point;
    const direction=point.clone().sub(before).normalize();
    routeHead=new THREE.Mesh(new THREE.ConeGeometry(.85,1.8,16),new THREE.MeshBasicMaterial({color:0xffd23f,depthTest:false}));
    routeHead.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);
    routeHead.position.copy(point.clone().sub(direction.clone().multiplyScalar(.65)));
    routeHead.position.y=.42;routeHead.renderOrder=9;wrapper.add(routeHead);
    return {start:gridToWorld(...maze.start),exit:gridToWorld(...maze.exit),size:maze.size,
      solutionLength:maze.solutionLength,deadEnds:maze.deadEnds.length,deepDeadEnds:maze.deepDeadEnds,
      startYaw:maze.grid[1][2]===0?-Math.PI/2:0};
  }
  function collide(old,next){
    if(!maze)return old;
    const radius=.38;
    const walkable=(x,z)=>[[0,0],[radius,0],[-radius,0],[0,radius],[0,-radius]].every(([dx,dz])=>openWorld(x+dx,z+dz));
    const x=walkable(next.x,old.z)?next.x:old.x;
    const z=walkable(x,next.z)?next.z:old.z;
    return {x,z};
  }
  function atExit(x,z){if(!maze)return false;const p=cellFromWorld(x,z);
    return p.r===maze.exit[0]&&p.c===maze.exit[1];
  }
  function cameraPose(player,yaw=0,preview=false){
    if(!maze)return null;
    if(preview){parent.updateMatrixWorld(true);const origin=wrapper.getWorldPosition(new THREE.Vector3());
      return {eye:{x:origin.x,y:maze.size*T*1.08,z:origin.z+.01},look:{x:origin.x,y:0,z:origin.z},fov:68};}
    const fx=Math.sin(yaw),fz=-Math.cos(yaw);
    return {eye:{x:player.x-fx*1.65,y:2.6,z:player.z-fz*1.65},look:{x:player.x+fx*3.0,y:1.4,z:player.z+fz*3},fov:76};
  }
  function hide(){wrapper.visible=false;}
  function setRouteVisible(visible){if(routeLine)routeLine.visible=Boolean(visible);if(routeHead)routeHead.visible=Boolean(visible);if(routeRibbon)routeRibbon.visible=Boolean(visible);}
  return {wrapper,reset,hide,collide,atExit,cameraPose,setRouteVisible,get maze(){return maze;},get active(){return wrapper.visible;}};
}
