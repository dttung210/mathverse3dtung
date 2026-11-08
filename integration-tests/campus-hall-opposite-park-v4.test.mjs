import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPUS_MASTERPLAN as M,zoneCenter,fitAerialBounds} from '../dual/campus-masterplan.mjs';

// Built-in node test loads grand-dome using browser Three vendor; provide a matching root
// in app tests, but pure map tests below independently validate coordinates.
import {readFileSync} from 'node:fs';
const baseSource=()=>readFileSync(new URL('../dual/grand-dome.mjs',import.meta.url),'utf-8');
test('common hall connects to both existing Lab and Museum at their original coordinates',()=>{
  assert.equal(M.lab.x,-42);assert.equal(M.lab.z,-60);
  assert.equal(M.museum.x,42);assert.equal(M.museum.z,-60);
  assert.equal(M.lab.entryX,-M.museum.entryX);
  assert.equal(M.lab.entryZ,M.museum.entryZ);
  assert.deepEqual(M.westBranch[0],[M.receptionist.x,M.receptionist.z]);
  assert.deepEqual(M.eastBranch[0],[M.receptionist.x,M.receptionist.z]);
  assert.deepEqual(M.westBranch.at(-1),[M.lab.entryX,M.lab.entryZ]);
  assert.deepEqual(M.eastBranch.at(-1),[M.museum.entryX,M.museum.entryZ]);
});
test('the Park entrance is straight OPPOSITE the common hall on same x=0 axis',()=>{
  assert.equal(M.receptionist.x,0);assert.equal(M.park.x,0);assert.equal(M.park.entryX,0);
  assert.ok(M.park.z>M.entrance.z);
  assert.ok(M.park.entryZ>M.entrance.z);
  assert.ok(M.park.entryZ<M.park.z);
  assert.ok(M.boulevard.every(pt=>pt[0]===0));
  for(let i=1;i<M.boulevard.length;i++){
    assert.ok(M.boulevard[i][1]>M.boulevard[i-1][1]);
    assert.ok(M.boulevard[i][1]-M.boulevard[i-1][1]<20);
  }
  assert.deepEqual(M.boulevard.at(-1),[M.park.entryX,M.park.entryZ]);
});
test('nine games on circular path and sanctuary portal in central plaza share world coordinates',()=>{
  const points=Array.from({length:10},(_,i)=>zoneCenter(i));
  points.forEach((p,i)=>{
    if(i===2){assert.equal(p.x,M.park.x);assert.equal(p.z,M.park.z);return;}
    assert.ok(Math.abs(Math.hypot(p.x-M.park.x,p.z-M.park.z)-M.ringRadius)<1e-6);
    assert.ok(p.z>90 && p.z<185);
  });
  for(let i=0;i<10;i++)for(let j=i+1;j<10;j++)
    assert.ok(Math.hypot(points[i].x-points[j].x,points[i].z-points[j].z)>16);
  assert.ok(M.bounds.zMax>M.park.z+M.park.radius);
  const builtIn=baseSource();
  assert.ok(builtIn.includes('zMax:207'),'movement clamp must allow walking inside park and back');
});
test('camera full campus and park remain visible in landscape and portrait',()=>{
  for(const a of [.55,1,16/9])for(const bounds of [M.bounds,M.parkBounds]){
    const c=fitAerialBounds({aspect:a,verticalFov:66,bounds});
    const h=(c.y-39)*2*Math.tan(33*Math.PI/180);
    assert.ok(h>=bounds.zMax-bounds.zMin);
    assert.ok(h*a>=bounds.xMax-bounds.xMin);
  }
});
