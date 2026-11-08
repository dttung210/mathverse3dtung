#!/usr/bin/env node
/** Verify the R6 room/lab proposal against the installed R5 registries. Read-only. */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const workspace=path.resolve(process.argv[2]||process.cwd());
const here=path.dirname(fileURLToPath(import.meta.url));
const manifestPath=path.resolve(process.argv[3]||path.join(here,'03_DANH_MUC_PHONG_LAB_310_MODELS.json'));
const report=[];
const assert=(v,m)=>{if(!v)throw Error('FAIL: '+m);report.push('OK: '+m);};
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifest=json(manifestPath),registry=json(path.join(workspace,'data/mathverse-7-12-curated.json'));
const {ALL_MATH6_LABS}=await import(pathToFileURL(path.join(workspace,'src/math6-lab/catalog.js')).href);
const {GRADE6_ACTIVE_IDS}=await import(pathToFileURL(path.join(workspace,'src/portal-labs/grade6-curation-v15-1.js')).href);
assert(manifest.grades.length===7,'7 khu lop');
assert(manifest.grades.reduce((n,g)=>n+g.thematicRooms.length,0)===34,'34 phong chuyen de');
const labRecords=manifest.grades.flatMap(g=>g.thematicRooms.flatMap(r=>r.labs));
assert(labRecords.length===130,'130 don vi Lab');
const proposedModelIds=labRecords.flatMap(l=>l.modes.map(m=>m.id));
assert(proposedModelIds.length===310&&new Set(proposedModelIds).size===310,'310 mode IDs unique');
const g6ids=new Set(ALL_MATH6_LABS.map(l=>l.id));
const curriculumModes=new Set(registry.source_registry.flatMap(f=>f.modes.map(m=>m.id)));
const expectedIds=new Set([...g6ids,...curriculumModes]);
assert(expectedIds.size===310,'source has 310 modes');
assert(proposedModelIds.every(id=>expectedIds.has(id))&&expectedIds.size===proposedModelIds.length,'all and only source IDs registered');
const idsFamilies=new Set(registry.source_registry.map(f=>f.id));
const matchedFamilies=new Set(labRecords.filter(l=>l.role==='family-lab').map(l=>l.labId));
assert(idsFamilies.size===67&&idsFamilies.size===matchedFamilies.size&&[...idsFamilies].every(id=>matchedFamilies.has(id)),'67 family IDs unique');
const allG6=labRecords.filter(l=>l.role==='standalone-g6-model');
const featured=new Set(GRADE6_ACTIVE_IDS);
assert(allG6.length===63&&allG6.filter(l=>l.status==='featured').length===35&&allG6.filter(l=>l.status==='archived').length===28,'grade6: 35 curated + 28 archived');
assert(allG6.every(l=>(l.status==='featured')===featured.has(l.labId)),'grade6 archive matches R5 original');
for(const [grade,modes,rooms] of [[6,63,4],[7,41,5],[8,37,5],[9,46,5],[10,38,5],[11,46,5],[12,39,5]]){
 const g=manifest.grades.find(x=>x.grade===grade);
 assert(g && g.thematicRooms.length===rooms&&g.thematicRooms.flatMap(r=>r.labs.flatMap(l=>l.modes)).length===modes,`grade ${grade}: ${rooms} rooms / ${modes} modes`);
}
console.log(report.join('\n'));
console.log('R6 classification plan: validation PASSED. (Does not certify UI or 3D implementation.)');
