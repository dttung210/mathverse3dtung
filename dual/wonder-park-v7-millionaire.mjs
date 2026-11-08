/** Original Millionaire-style learning rules. No media/audio/source copied from TV show. */
export const MILLIONAIRE_PRIZES=Object.freeze([100,200,300,500,1000,2000,4000,8000,16000,32000,64000,125000,250000,500000,1000000]);
export const MILLIONAIRE_MILESTONES=Object.freeze([5,10,15]);
export const MILLIONAIRE_DIFFICULTY=Object.freeze(['Dễ','Trung bình','Khó']);
const ABCD=Object.freeze(['A','B','C','D']);
export function pickMillionaireQuestions(questions,rng=Math.random){
  const approved=(questions||[]).filter(q=>q&&ABCD.includes(q.answer)&&q.choices&&ABCD.every(k=>typeof q.choices[k]==='string')&&!q.issues?.length);
  const chosen=[];
  for(const difficulty of MILLIONAIRE_DIFFICULTY){
    const pool=approved.filter(q=>q.difficulty===difficulty);
    if(pool.length<5)throw new Error(`Kho giáo viên cần ít nhất 5 câu ${difficulty} cho Ai là triệu phú.`);
    const list=[...pool];for(let i=list.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[list[i],list[j]]=[list[j],list[i]];}
    chosen.push(...list.slice(0,5));
  }
  if(new Set(chosen.map(q=>q.id)).size!==15)throw new Error('Kho câu hỏi có mã bị trùng; cần giáo viên duyệt lại.');
  return chosen;
}
export function fiftyFifty(correct,rng=Math.random){
  const wrong=ABCD.filter(k=>k!==correct);const preserved=wrong[Math.floor(rng()*wrong.length)];return [correct,preserved];
}
/** Exactly 50% probability that the simulated audience's most-voted option is correct. */
export function audienceSimulation(correct,rng=Math.random){
  const correctLead=rng()<.5;
  const top=correctLead?correct:ABCD.filter(k=>k!==correct)[Math.floor(rng()*3)];
  const votes={A:0,B:0,C:0,D:0};const pct=51+Math.floor(rng()*22);
  votes[top]=pct;let remaining=100-pct;
  const other=ABCD.filter(k=>k!==top);
  for(let i=0;i<2;i++){const amount=Math.floor(rng()*(remaining+1));votes[other[i]]=amount;remaining-=amount;}
  votes[other[2]]=remaining;
  return {votes,top,correctLead};
}
/** Only a 50/50 SIMULATED suggestion, not an actual AI service. */
export function aiSimulation(correct,rng=Math.random){
  const isRight=rng()<.5;
  const suggestion=isRight?correct:ABCD.filter(k=>k!==correct)[Math.floor(rng()*3)];
  return {suggestion,simulation:true};
}
export function guaranteedPrize(correctCount){
  if(correctCount>=15)return MILLIONAIRE_PRIZES[14];
  if(correctCount>=10)return MILLIONAIRE_PRIZES[9];
  if(correctCount>=5)return MILLIONAIRE_PRIZES[4];
  return 0;
}
