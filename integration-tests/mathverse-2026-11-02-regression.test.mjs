import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {CAMPUS_MASTERPLAN,zoneCenter} from '../dual/campus-masterplan.mjs';
import {generatePerfectMaze,getMazeSolution} from '../dual/wonder-park-v7-maze.mjs';
import {normalizeTeacherBank,filterQuestionPool,pickQuestionsForGame} from '../dual/wonder-park-v8-bank.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const text=f=>readFileSync(join(root,f),'utf8');
const bank=JSON.parse(text('game-park/assets/teacher-bank-6-12-63-chapters.json'));
const chapters=normalizeTeacherBank(bank);
test('Exactly 10 detached outer stations and ONE central education room',()=>{
  const ctr=zoneCenter(2);assert.deepEqual([ctr.x,ctr.z],[0,138]);
  const ids=[0,1,3,4,5,6,7,8,9,10];const places=ids.map(zoneCenter);
  assert.equal(CAMPUS_MASTERPLAN.zones.length,11);
  for(const p of places)assert.ok(Math.abs(Math.hypot(p.x,p.z-138)-54)<1e-6);
  for(let i=0;i<places.length;i++)for(let j=i+1;j<places.length;j++)
    assert.ok(Math.hypot(places[i].x-places[j].x,places[i].z-places[j].z)>30);
});
test('Each level has deep dead ends and a uniquely marked solution with one exit',()=>{
  for(let level=1;level<=8;level++){
    const m=generatePerfectMaze(level,0x12345678),path=getMazeSolution(m);
    assert.ok(m.deadEnds.length>=5);assert.ok(m.deepDeadEnds>=3);
    assert.equal(path.length,m.solutionLength+1);
    assert.deepEqual(path[0],m.start);assert.deepEqual(path.at(-1),m.exit);
    for(let i=1;i<path.length;i++)assert.equal(Math.abs(path[i][0]-path[i-1][0])+Math.abs(path[i][1]-path[i-1][1]),1);
    assert.notDeepEqual(m.grid,generatePerfectMaze(level,0x31415926).grid);
  }
  const scene=text('dual/wonder-park-v7-maze.mjs');
  assert.match(scene,/routeHead=new THREE.Mesh/);assert.match(scene,/setRouteVisible/);
  assert.match(text('dual/wonder-park-ui.mjs'),/park.showMazeRoute\(false\)/);
});
test('Grade 6 chapter 1 never mixes with other-grade algebra or number sets',()=>{
  const grade6=filterQuestionPool(chapters,{grade:6,scope:'chapter',chapter:1});
  assert.equal(grade6.length,50);
  assert.ok(grade6.every(q=>q.grade===6&&q.chapter===1));
  assert.ok(grade6.every(q=>!/hai số thực u|u\s*\+\s*v|uv\s*=|phương trình bậc hai/.test(q.prompt.toLocaleLowerCase('vi-VN'))));
  for(let mode of [0,1,2,3,4,5,6,8,9,10]){
    const deck=pickQuestionsForGame(chapters,{grade:6,scope:'chapter',chapter:1},mode);
    assert.ok(deck.every(q=>q.grade===6&&q.chapter===1&&!q.issues?.length));
  }
});
test('All teacher questions traced, quarantined issues never appear in the quiz',()=>{
 const all=bank.chapters.flatMap(c=>c.questions);
 assert.equal(all.length,3150);assert.equal(all.filter(q=>q.issues.length).length,63);
 assert.equal(chapters.reduce((s,c)=>s+c.questions.length,0),3087);
 assert.ok(all.every(q=>q.sourceTex?.question&&q.provenance?.release==='USER_UPLOADED_2026-11-02'));
});
test('Quiz wraps and scrolls the four options, removes probability disclaimer',()=>{
 const html=text('dual/index.html'),style=text('dual/style.css'),ui=text('dual/wonder-park-ui.mjs');
 assert.match(html,/id="mvpark-quiz-body"/);assert.match(style,/#mvpark-quiz \.mvpark-quiz-body/);
 assert.match(style,/overflow-y:auto/);assert.match(ui,/quizScroll\.scrollTop=0/);
 assert.doesNotMatch(ui,/AI MÔ PHỎNG|xác suất gợi ý đúng 50%/i);
});
