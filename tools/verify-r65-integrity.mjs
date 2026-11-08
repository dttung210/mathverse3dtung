#!/usr/bin/env node
/** Final R6.5 integrity gate: source data, original mathematical modules, and executable registration. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ALL_MATH6_LABS} from '../src/math6-lab/catalog.js';
import {GRADE6_ACTIVE_IDS} from '../src/portal-labs/grade6-curation-v15-1.js';
import {getRoomsForGrade,ROOM_BY_ID,LAB_BY_ID,MODE_BY_ID} from '../src/museum/r6-room-layout.js';
import {isTrue3DCapable} from '../src/math6-lab/math6-taxonomy.mjs';
import {hasReal3DGalleryModel} from '../src/museum/math6-preview-v15.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const original={
 'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15',
 'data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9',
 'data/mathverse-7-12-curated.json':'744144b806b526d1d48aa482b95affba1f1a36b6322a658cef4acd031f8381f1',
 'src/math6-lab/catalog.js':'ccb4940cdbfd204cc5a70fe7420af847cc85953328053d780da6b03c75e0a1e7'
};
const check=(ok,msg)=>{if(!ok)throw Error('R6.5 integrity: '+msg);console.log('OK '+msg)};
for(const [file,h] of Object.entries(original))check(hash(file)===h,'original mathematical data preserved: '+file);
for(const file of ['index.html','src/curriculum/Grade6Lab.js','src/curriculum/grade6-unified.css','src/museum/r65-grade6-display.mjs','src/math6-lab/three-lab.mjs','src/qa/r65-grade6-3d.html','tests/r65-grade6-unified-3d.test.mjs','07_KIEM_THU_R65_TOAN6_3D.bat','08_MO_BANG_NGHIEM_THU_R65.bat'])check(fs.existsSync(path.join(root,file)),'required: '+file);
check(ROOM_BY_ID.size===34&&LAB_BY_ID.size===130&&MODE_BY_ID.size===310,'34 thematic rooms / 130 Labs / 310 modes');
check(getRoomsForGrade(6).length===4&&getRoomsForGrade(6).reduce((n,r)=>n+r.labs.length,0)===63,'Grade6: 4 rooms and 63 labs');
check(ALL_MATH6_LABS.length===63&&GRADE6_ACTIVE_IDS.length===35,'Grade6: 35 featured + 28 archived unchanged');
let count={solid:0,relief:0,board:0};for(const m of ALL_MATH6_LABS){if(isTrue3DCapable(m.id))count.solid++;else if(hasReal3DGalleryModel({labEngine:m.engine,labVariant:m.variant}))count.relief++;else count.board++;}
check(count.solid===8&&count.relief===30&&count.board===25,'8 true3D / 30 mathematical reliefs / 25 3D gallery boards');
for(const file of ['src/ui/LabShell.js','src/portal-labs/SpecialtyLab.js','src/curriculum/CurriculumExplorer.js']){
 const s=fs.readFileSync(path.join(root,file),'utf8');
 check(s.includes('Grade6Lab')&&!s.includes('Math6ExhibitLab'),'no legacy Lab in active module: '+file);
}
check(!fs.existsSync(path.join(root,'.env')),'no user AI secret in package');
console.log('R6.5 FULL INTEGRITY PASSED. GPU/Windows must be checked separately.');
