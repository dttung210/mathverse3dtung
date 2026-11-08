/** Release preflight for the 38 curated Grade10 modes (3 standard graphs + 35 custom SVG). */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {GRADE10_IDS,grade10Defaults,grade10Valid,grade10Math} from '../src/curriculum/grade10-engine.mjs';
import {grade10SceneSVG} from '../src/curriculum/grade10-svg.mjs';
import {graphDefaults,graphExperiment} from '../src/curriculum/graph-models.mjs';
import {caseRuntimeStatus} from '../src/curriculum/CurriculumExplorer.js';
import {EXPLORATION_MODELS} from '../src/portal-labs/exploration-collection.js';
import {portalExhibits,zonesForGrade} from '../src/portal-labs/portal-registry.js';
const base=new URL('../',import.meta.url),r=x=>new URL(x,base),load=x=>fs.readFileSync(r(x));
const die=msg=>{throw Error('GRADE10 GD5 FAILED: '+msg)};
const data=JSON.parse(load('data/mathverse-7-12-curated.json')),catalog=JSON.parse(load('data/catalog.json')).items,rooms=data.source_registry.filter(f=>f.grade===10),modes=rooms.flatMap(f=>f.modes);
if(data.families!==67||data.modes_total!==247||data.by_grade['10']!==38||rooms.length!==11||modes.length!==38||new Set(modes.map(x=>x.id)).size!==38)die('Expected 67 rooms, 247 modes overall and 11/38 Grade10');
let changed=0;for(const id of GRADE10_IDS){const p=grade10Defaults(id);if(!grade10Valid(id,p)||caseRuntimeStatus(id)!=='interactive')die('Missing verified interactive model '+id);
 const m=grade10Math(id,p),a=grade10SceneSVG(id,p,0),b=grade10SceneSVG(id,p,2.7);if(!m.latex||!m.values.length||a===b||!/svg/.test(a)||/NaN|Infinity|undefined/.test(a+b))die('Bad SVG or math: '+id);changed++;}
for(const id of ['10-06-C01','10-06-C02','10-06-C03']){const m=graphExperiment(id,graphDefaults(id));if(!m.series.length||caseRuntimeStatus(id)!=='interactive')die('Missing quadratic graph '+id);}
for(const m of modes)if(caseRuntimeStatus(m.id)!=='interactive')die('Not interactive: '+m.id);
for(const file of ['src/curriculum/Grade10Lab.js','src/curriculum/grade10-engine.mjs','src/curriculum/grade10-svg.mjs','src/qa/toan10-audit.html','src/qa/toan10-audit.js','src/qa/toan10-hienvat.html','src/qa/toan10-hienvat.js','KIEM_TRA_TOAN_10_GD5.bat'])if(!fs.existsSync(r(file)))die('Missing file '+file);
for(const [file,expected] of Object.entries({'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15','data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'}))if(crypto.createHash('sha256').update(load(file)).digest('hex')!==expected)die('Immutable data changed '+file);
if(catalog.filter(x=>x.grade===10).length!==9||EXPLORATION_MODELS.filter(x=>x.grade===10).length!==5)die('Missing Grade10 originals or archive');
for(const zone of zonesForGrade(10))if(portalExhibits(catalog,10,zone.id).some(x=>x.id.startsWith('mv_r4_')))die('Wrong-class gallery sample still exposed');
console.log(`GRADE10 GD5: ${rooms.length} families / ${modes.length} interactive cases; ${changed} SVG + 3 quadratic graphs.`);
console.log('9 original Grade10 museum models are planar display concepts in 3D; 5 unrelated R4 samples archived.');
console.log('SHA-256 of original 63-model catalog and Math6 data: unchanged. Real Windows GPU QA remains manual.');
