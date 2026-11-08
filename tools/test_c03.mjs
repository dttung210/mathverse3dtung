import {grade10Math, grade10Defaults} from '../src/curriculum/grade10-engine.mjs';

const defs = grade10Defaults('10-02-C03');
console.log('Defaults C03 params:', defs);

const res = grade10Math('10-02-C03', defs);
console.log('Vertices count:', res.result.vertices.length);
console.log('Vertices:', res.result.vertices);
console.log('Objective:', res.result.objective);
console.log('Lines:', res.lines);
