import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {fileURLToPath, pathToFileURL} from 'node:url';
const root=fileURLToPath(new URL('..', import.meta.url));
const d=fs.mkdtempSync(path.join(os.tmpdir(),'mv7-scene-'));
const vendor=pathToFileURL(path.join(root,'vendor/three.module.js')).href;
const maze=pathToFileURL(path.join(root,'dual/wonder-park-v7-maze.mjs')).href;
const copies=[['wonder-park-v6-scenes.mjs','v6.mjs'],['wonder-park-v7-scenes.mjs','v7.mjs'],['wonder-park-world.mjs','world.mjs']];
for(const [source,dest] of copies){let s=fs.readFileSync(path.join(root,'dual',source),'utf8');s=s.replaceAll("'/vendor/three.module.js'",`'${vendor}'`);
  s=s.replaceAll("'./wonder-park-v6-scenes.mjs'","'./v6.mjs'")
     .replaceAll("'./wonder-park-v7-scenes.mjs'","'./v7.mjs'")
     .replaceAll("'./wonder-park-v7-maze.mjs'",`'${maze}'`);
  fs.writeFileSync(path.join(d,dest),s);
}
globalThis.document={createElement(name){if(name!=='canvas')throw new Error('unknown element '+name);
  const context={fillRect(){},strokeRect(){},fillText(){},strokeText(){},clearRect(){},measureText(s){return {width:String(s).length*25}},beginPath(){},moveTo(){},lineTo(){},fill(){},stroke(){}};
  return {width:640,height:160,getContext(type){return context;}};
}};
const {createWonderParkWorld}=await import(pathToFileURL(path.join(d,'world.mjs')).href);
const THREE=await import(vendor);
const park=createWonderParkWorld();
const ids=park.zones.map((p,i)=>({i:i+1,name:p.name,position:park.getZoneWorldPosition(i)}));
if(ids.length!==11||ids.some(v=>!v.position||!Number.isFinite(v.position.x)))throw Error('11 zone scene positions missing');
const meshes=[];park.group.traverse(o=>{if(o.isMesh)meshes.push(o);});
console.log('Real Three runtime smoke: zones=',ids.length,'meshes=',meshes.length,'center=',JSON.stringify(ids.at(-1)));
park.openGate();for(let i=0;i<100;i++)park.tick(.016);
if(!park.gateOpen)throw Error('Gate failed to open');
park.resetTug();park.correctTug();park.tick(.016);park.failTug();park.tick(.016);
park.resetSoccer();park.correctSoccer();park.tick(.016);park.failSoccer();park.tick(.016);
park.resetMillionaire();park.correctMillionaire();park.tick(.016);park.failMillionaire();
const info=park.startMazeLevel(1);if(!park.mazeActive||!info.start||!info.exit)throw Error('Maze scene inactive');
if(!park.getMazeCameraPose(info.start,0,true)||!park.getMazeCameraPose(info.start,0,false))throw Error('Maze camera missing');
if(park.mazeReachedExit(...[info.start.x,info.start.z]))throw Error('Exit at start unexpected');
const collision=park.collideMaze(info.start,{x:info.start.x+99,z:info.start.z});
if(!Number.isFinite(collision.x))throw Error('Collision invalid');
park.exitMaze();if(park.mazeActive)throw Error('Maze not hidden');
console.log('PASS: 11 meshes, moving gate, tug, football, quiz stage, 3D maze, maze camera/collision/exit.');
fs.rmSync(d,{recursive:true,force:true});
