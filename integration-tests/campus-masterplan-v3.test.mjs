import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {CAMPUS_MASTERPLAN as M,zoneCenter,fitAerialBounds} from '../dual/campus-masterplan.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf-8');
const world=read('dual/wonder-park-world.mjs');
const app=read('dual/app.mjs');
const ui=read('dual/index.html');

test('Hall-to-Lab/Museum direct connections and opposite park occupy one collision-free map',()=>{
 assert.equal(M.lab.x,-42);assert.equal(M.museum.x,42);
 assert.equal(M.park.x,0);assert.ok(M.park.z>M.receptionist.z+100);
 assert.equal(M.lab.entryZ,M.museum.entryZ);
 assert.equal(M.lab.entryX,-M.museum.entryX);
 assert.equal(M.park.entryX,M.receptionist.x);
 assert.ok(M.park.entryZ>M.entrance.z);
 assert.ok(M.park.entryZ<M.park.z);
 const museumDist=Math.hypot(M.museum.x-M.park.x,M.museum.z-M.park.z);
 assert.ok(museumDist>(32.6+M.park.radius+10),'park and museum must not overlap');
 const labDist=Math.hypot(M.lab.x-M.park.x,M.lab.z-M.park.z);
 assert.ok(labDist>(38+M.park.radius+10),'park and lab must not overlap');
 const zones=Array.from({length:10},(_,i)=>zoneCenter(i));
 assert.equal(zones.length,10);
 zones.forEach((c,i)=>{
  if(i===2){assert.ok(Math.hypot(c.x-M.park.x,c.z-M.park.z)<.001,'Sanctuary is in the central plaza');return;}
  assert.ok(Math.abs(Math.hypot(c.x-M.park.x,c.z-M.park.z)-31)<.001);
 });
 for(let i=0;i<zones.length;i++)for(let j=i+1;j<zones.length;j++)
   assert.ok(Math.hypot(zones[i].x-zones[j].x,zones[i].z-zones[j].z)>15,'pavilions must not overlap');
});
test('Continuous walkable boulevard has no missing spans and meets the physical Wonder Park path',()=>{
 const p=M.boulevard;
 for(let i=1;i<p.length;i++)assert.ok(Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1])<38);
 assert.equal(p[0][0],0);
 assert.equal(p[p.length-1][0],M.park.x);
 assert.equal(p[p.length-1][1],M.park.entryZ);
 assert.ok(p.every(([x])=>x===0),"main avenue must be STRAIGHT along common hall axis");
 assert.ok(read('dual/app.mjs').includes('lobbyGroup.add(masterplanRoads.group)'));
});
test('Park physical 3D origin agrees with user-visible vector masterplan',()=>{
 assert.ok(world.includes('originX:0,originZ:128'));
 assert.ok(world.includes('centerX:0,centerZ:138'));
 assert.ok(world.includes('gateX:0,gateZ:85'));
 assert.ok(world.includes('fenceRadius=48.4'));
 assert.ok(app.includes('WONDER_PARK_LOCATION.startX'));
 assert.ok(app.includes('const dx=p.x-WONDER_PARK_LOCATION.centerX'));
 assert.ok(app.includes('masterMap?.updatePlayer(player)'));
});
test('Aerial camera fits the total map and the park in landscape and portrait orientations',()=>{
 for(const aspect of [16/9,1.33,.56])for(const bounds of [M.bounds,M.parkBounds]){
   const cam=fitAerialBounds({aspect,verticalFov:66,bounds});
   assert.ok(Number.isFinite(cam.y)&&cam.y>100);
   const h=(cam.y-39)*Math.tan(33*Math.PI/180)*2;
   const w=h*aspect;
   assert.ok(h>=bounds.zMax-bounds.zMin,'vertical crop');
   assert.ok(w>=bounds.xMax-bounds.xMin,'horizontal crop');
 }
});
test('Main canvas remains shared, the map is truly vector and no park iframe returns',()=>{
 assert.equal((ui.match(/id="dual-canvas"/g)||[]).length,1);
 assert.ok(ui.includes('id="campus-map-svg"'));
 assert.ok(ui.includes('id="campus-map-open"'));
 assert.ok(!ui.includes('id="game-park-frame"'));
 assert.ok(app.includes('focusParkAerial'));
 assert.ok(read('dual/campus-map-ui-v3.mjs').includes('document.createElementNS'));
});
