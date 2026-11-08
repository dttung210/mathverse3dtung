import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {generatePerfectMaze,MAZE_LEVELS,MAZE_CELL_SIZE} from '../dual/wonder-park-v7-maze.mjs';
import {pickMillionaireQuestions,fiftyFifty,audienceSimulation,aiSimulation,guaranteedPrize,MILLIONAIRE_PRIZES,MILLIONAIRE_MILESTONES} from '../dual/wonder-park-v7-millionaire.mjs';
import {CAMPUS_MASTERPLAN,zoneCenter} from '../dual/campus-masterplan.mjs';
const ROOT=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=(p)=>fs.readFileSync(path.join(ROOT,p),'utf8');
const bank=JSON.parse(read('game-park/assets/questions.json'));
const questions=bank.questions;
const allDirections=[[1,0],[-1,0],[0,1],[0,-1]];
function analyze(m){
  const key=([r,c])=>`${r},${c}`;
  const nodes=[];let edges=0;
  for(let r=0;r<m.size;r++)for(let c=0;c<m.size;c++)if(m.grid[r][c]===0){
    nodes.push([r,c]);
    if(c+1<m.size&&m.grid[r][c+1]===0)edges++;
    if(r+1<m.size&&m.grid[r+1][c]===0)edges++;
  }
  const dist=new Map([[key(m.start),0]]),queue=[m.start];
  while(queue.length){const [r,c]=queue.shift();
    for(const [dr,dc] of allDirections){const rr=r+dr,cc=c+dc,coord=[rr,cc];
      if(rr<0||cc<0||rr>=m.size||cc>=m.size||m.grid[rr][cc]||dist.has(key(coord)))continue;
      dist.set(key(coord),dist.get(key([r,c]))+1);queue.push(coord);
    }
  }
  return {nodes:nodes.length,edges,reachable:dist.size,exitDistance:dist.get(key(m.exit))};
}

test('Teacher bank is fixed Grade 6 Chapter 1, 40 original questions',()=>{
  assert.equal(bank.meta.grade,6);assert.equal(bank.meta.chapter,1);
  assert.equal(questions.length,40);
  assert.equal(new Set(questions.map(q=>q.id)).size,40);
  assert.equal(questions.filter(q=>q.difficulty==='Dễ').length,15);
  assert.equal(questions.filter(q=>q.difficulty==='Trung bình').length,15);
  assert.equal(questions.filter(q=>q.difficulty==='Khó').length,10);
});
test('Millionaire pulls exactly 15 distinct teacher questions from 3 difficulty tiers',()=>{
  const picked=pickMillionaireQuestions(questions,()=>.35);
  assert.equal(picked.length,15);assert.equal(new Set(picked.map(q=>q.id)).size,15);
  assert.deepEqual([...new Set(picked.slice(0,5).map(q=>q.difficulty))],['Dễ']);
  assert.deepEqual([...new Set(picked.slice(5,10).map(q=>q.difficulty))],['Trung bình']);
  assert.deepEqual([...new Set(picked.slice(10,15).map(q=>q.difficulty))],['Khó']);
  for(const q of picked)assert.ok(questions.includes(q));
});
test('Millionaire rejects insufficient teacher provided data',()=>{
  assert.throws(()=>pickMillionaireQuestions(questions.slice(0,8)),/ít nhất 5/);
});
test('Millionaire uses 15 prize levels and three protected thresholds at 5/10/15',()=>{
  assert.equal(MILLIONAIRE_PRIZES.length,15);
  assert.deepEqual([...MILLIONAIRE_MILESTONES],[5,10,15]);
  assert.equal(guaranteedPrize(0),0);
  assert.equal(guaranteedPrize(4),0);
  assert.equal(guaranteedPrize(5),1000);
  assert.equal(guaranteedPrize(9),1000);
  assert.equal(guaranteedPrize(10),32000);
  assert.equal(guaranteedPrize(15),1000000);
});
test('50:50 never removes correct and always retains just one wrong answer',()=>{
  for(const correct of ['A','B','C','D'])for(const v of [.01,.35,.68,.99]){
    const options=fiftyFifty(correct,()=>v);
    assert.equal(options.length,2);assert.equal(new Set(options).size,2);
    assert.ok(options.includes(correct));
  }
});
test('Audience 50% success/failure branching and vote totals are consistent',()=>{
  for(const v of [.25,.75]){
    const result=audienceSimulation('B',()=>v);
    assert.equal(result.correctLead,v<.5);
    assert.equal(result.top==='B',v<.5);
    assert.equal(Object.values(result.votes).reduce((a,b)=>a+b),100);
    assert.ok(Object.values(result.votes).every(n=>Number.isInteger(n)&&n>=0));
    assert.equal(result.top,Object.keys(result.votes).sort((a,b)=>result.votes[b]-result.votes[a])[0]);
  }
});
test('AI helper 50% right/wrong simulation does not call actual external AI',()=>{
  assert.deepEqual(aiSimulation('C',()=>.1),{suggestion:'C',simulation:true});
  assert.notEqual(aiSimulation('C',()=>.8).suggestion,'C');
  const code=read('dual/wonder-park-v7-millionaire.mjs');
  assert.doesNotMatch(code, /\bfetch\(|https?:\/\/|gemini|openai/gi);
});
test('Eight increasingly large odd-sided maze levels',()=>{
  assert.deepEqual([...MAZE_LEVELS],[15,17,19,21,23,25,27,29]);
  assert.ok(MAZE_CELL_SIZE>=3);
});
test('All eight mazes are connected spanning trees with a single unambiguous route to exit',()=>{
  for(let level=1;level<=8;level++){
    const m=generatePerfectMaze(level,20261102),a=analyze(m);
    assert.equal(m.size,MAZE_LEVELS[level-1]);
    assert.equal(a.reachable,a.nodes,`maze ${level} disconnected`);
    assert.equal(a.edges,a.nodes-1,`maze ${level} contains a cycle or disconnected path`);
    assert.equal(a.exitDistance,m.solutionLength);
    assert.ok(m.solutionLength>20);
    assert.ok(m.deadEnds.length>=5);
  }
});
test('Maze outer perimeter is a continuous wall',()=>{
  for(let level=1;level<=8;level++){
    const m=generatePerfectMaze(level);
    for(let k=0;k<m.size;k++){
      assert.equal(m.grid[0][k],1);assert.equal(m.grid[m.size-1][k],1);
      assert.equal(m.grid[k][0],1);assert.equal(m.grid[k][m.size-1],1);
    }
  }
});
test('Maze seed generates different maps, and identical seed recreates same map',()=>{
  const a=generatePerfectMaze(3,100),b=generatePerfectMaze(3,101),c=generatePerfectMaze(3,100);
  assert.deepEqual(a.grid,c.grid);
  assert.notDeepEqual(a.grid,b.grid);
});
test('Maze no quiz, one preview and nearby third-person camera are coded',()=>{
  const code=read('dual/wonder-park-ui.mjs');
  assert.match(code,/currentZone===7\)startMazeAdventure\(\)/);
  assert.match(code,/mazeTimer=setTimeout\(/);
  assert.match(code,/},6000\)/);
  assert.match(code,/maze_preview/);assert.match(code,/maze_walk/);
  assert.match(code,/function reachMazeExit\(\)/);
});
test('Park has exactly 11 playable locations and the extra MC stage is physically constructed',()=>{
  assert.equal(CAMPUS_MASTERPLAN.zones.length,11);
  assert.ok(zoneCenter(10));
  assert.equal(zoneCenter(11),null);
  const code=read('dual/wonder-park-world.mjs');
  assert.match(code,/for\(let i=0;i<ZONES\.length;i\+\+\)\{\s*const pos=zoneLocation\(i\);app\.zonePositions\.push\(pos\)/);
  assert.match(code,/if\(i===10\)\{?app\.millionaire=createMillionaireScene\(g\)/);
  assert.match(code,/createTugScene\(g\)/);
  assert.match(code,/createSoccerScene\(g\)/);
  assert.match(code,/createMazeEntrance\(g\)/);
});
test('Ten outer games form a uniform 54m ring and learning room stays at the center',()=>{
  const center=zoneCenter(2);
  assert.deepEqual({x:center.x,z:center.z},{x:0,z:138});
  const outer=[0,1,3,4,5,6,7,8,9,10].map(zoneCenter);
  for(const p of outer)assert.ok(Math.abs(Math.hypot(p.x,p.z-138)-54)<1e-8);
  assert.equal(new Set(outer.map(p=>`${p.x.toFixed(3)},${p.z.toFixed(3)}`)).size,10);
});
test('All game panels and three helper controls exist in main application DOM',()=>{
  const html=read('dual/index.html');
  for(const id of ['mvpark-lifelines','mvpark-help-fifty','mvpark-help-audience','mvpark-help-ai','mvpark-prize-ladder','mvpark-maze-hud','mvpark-maze-level','mvpark-maze-info','mvpark-maze-exit','mvpark-maze-restart']){
    assert.ok(html.includes(`id="${id}"`),`missing ${id}`);
  }
});
test('Maze movement and exit detected in same Grand Campus scene and Space still jumps',()=>{
  const code=read('dual/app.mjs');
  assert.match(code,/parkWorld\.collideMaze\(old,next\)/);
  assert.match(code,/parkWorld\.mazeReachedExit\(player\.x,player\.z\)/);
  assert.match(code,/enterMazeMode\(/);
  assert.match(code,/leaveMazeMode\(/);
  assert.match(code,/e\.code==='Space'/);
  assert.match(code,/JUMP_IMPULSE/);
});
test('Tug and football are 10 right in a row; any wrong calls fail animation and ends quiz',()=>{
  const code=read('dual/wonder-park-ui.mjs');
  assert.match(code,/mode===4\)park\.correctTug\(\)/);
  assert.match(code,/mode===5\)park\.correctSoccer\(\)/);
  assert.match(code,/mode===4\)park\.failTug\(\)/);
  assert.match(code,/mode===5\)park\.failSoccer\(\)/);
  assert.match(code,/if\(choice!==expected\)/);
  assert.match(code,/finish\(false\)/);
  assert.match(code,/HỌC BÁ KÉO CO/);
  assert.match(code,/HỌC BÁ RONALDO/);
});
test('Millionaire shows three lifelines and milestone notifications',()=>{
  const code=read('dual/wonder-park-ui.mjs');
  assert.match(code,/pickQuestionsForGame\(b\.chapters,picked,zone\)/); // V8 routes 15-question selection through grade-aware validator
  assert.match(code,/if\(mode===10&&MILLIONAIRE_MILESTONES\.includes\(quiz\.correct\)\)/);
  assert.match(code,/guaranteedPrize\(quiz\.correct\)/);
  assert.match(code,/fiftyFifty\(correct\)/);
  assert.match(code,/audienceSimulation\(correct\)/);
  assert.match(code,/aiSimulation\(correct\)/);
});
test('No separate 3D renderer or park iframe introduced by the new game scripts',()=>{
  const world=read('dual/wonder-park-world.mjs');
  const scenes=read('dual/wonder-park-v7-scenes.mjs');
  assert.doesNotMatch(world,/new THREE\.WebGLRenderer|document\.createElement\('iframe'\)/);
  assert.doesNotMatch(scenes,/new THREE\.WebGLRenderer|document\.createElement\('iframe'\)/);
});
