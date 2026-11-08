import test from 'node:test';import assert from 'node:assert/strict';
import {createGrade7To12Preview} from '../src/museum/r66-grade7-12-preview.mjs';
import {getRoomsForGrade} from '../src/museum/r6-room-layout.js';
import * as THREE from '../vendor/three.module.js';
test('67 family-lab stations grade7-12 all have preview geometry',()=>{
let count=0;let solids=0,boards=0;for(let grade=7;grade<=12;grade++)for(const room of getRoomsForGrade(grade))for(const lab of room.labs){const g=createGrade7To12Preview(grade,lab);assert(g?.isGroup);assert.equal(g.userData.labId,lab.labId);assert(g.children.some(c=>c.isMesh||c.isLineSegments));if(g.userData.previewKind==='diagram-2d-in-3d')boards++;else solids++;count++;}
assert.equal(count,67);assert(solids>0);assert(boards>0);
});
test('real 3D themed families get volumetric preview instead of a flat placeholder',()=>{for(const [grade,id] of [[7,'7-08'],[7,'7-09'],[8,'8-09'],[9,'9-09'],[9,'9-10'],[9,'9-11'],[12,'12-10']]){const g=createGrade7To12Preview(grade,{labId:id,name:'3D solid'});assert.notEqual(g.userData.previewKind,'diagram-2d-in-3d',id);assert(g.children.some(c=>c.isMesh&&!(c.geometry instanceof THREE.PlaneGeometry)),id)}});
test('planar grade7-12 gallery remains explicitly illustrative, not mislabeled as an exact 3D mathematical engine',()=>{const g=createGrade7To12Preview(7,{labId:'7-04',name:'Tam giác bằng nhau'});assert.equal(g.userData.previewKind,'diagram-2d-in-3d');assert.equal(g.userData.mathPreview,'illustrative')});
