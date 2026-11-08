import {pickMillionaireQuestions,fiftyFifty,audienceSimulation,aiSimulation,guaranteedPrize,MILLIONAIRE_PRIZES,MILLIONAIRE_MILESTONES} from './wonder-park-v7-millionaire.mjs';
import {GRADES,normalizeTeacherBank,mergeTeacherChapters,getAvailableChapters,checkQuestionReadiness,pickQuestionsForGame,DIFFICULTY_ORDER,getDifficultyRank} from './wonder-park-v8-bank.mjs';
/**
 * In-scene Wonder Park panels. Absolutely no park iframe or second renderer.
 * Question content comes only from the teacher-provided chapter bank.
 */
const el = id => document.getElementById(id);
const MATH_NS = 'http://www.w3.org/1998/Math/MathML';
// V9: offline MathML rendering from original author-supplied TeX, no CDN or image OCR.
const mathNode=(tag,children=[],text=null)=>{
  const n=document.createElementNS(MATH_NS,tag);
  if(text!==null)n.textContent=text;
  for(const c of children)n.appendChild(c);
  return n;
};
const symbols={
  in:'∈',notin:'∉',le:'≤',leq:'≤',ge:'≥',geq:'≥',neq:'≠',ne:'≠',times:'×',cdot:'·',cdots:'⋯',ldots:'…',
  pm:'±',mp:'∓',div:'÷',cup:'∪',cap:'∩',emptyset:'∅',subset:'⊂',subseteq:'⊆',supset:'⊃',rightarrow:'→',
  Rightarrow:'⇒',to:'→',pi:'π',alpha:'α',beta:'β',gamma:'γ',delta:'δ',Delta:'Δ',Omega:'Ω',theta:'θ',
  infty:'∞',forall:'∀',exists:'∃',sim:'∼',approx:'≈',perp:'⊥',int:'∫',bullet:'•',angle:'∠',mid:'∣',
  quad:' ',qquad:' ',textbackslash:'\\',leqslant:'≤',geqslant:'≥',partial:'∂',sum:'∑',prod:'∏'
};
/**
 * FINAL MathML: render only teacher-provided TeX. No external CDN, HTML injection,
 * OCR, or auto-created mathematics. Combined subscripts/superscripts matter for
 * integral limits: \int_{a}^{b} must be one msubsup node, not nested scripts.
 */
export function parseLatex(source){
  const s=String(source??'');let i=0;
  const atom=(value)=>{
    const v=String(value);
    const tag=/^[0-9]+(?:[.,][0-9]+)?$/.test(v)?'mn':/^[A-Za-zℕℤℚℝℂ]+$/.test(v)?'mi':'mo';
    return mathNode(tag,[],v);
  };
  const blanks=()=>{while(i<s.length&&/\s/.test(s[i]))i++;};
  function arg(){blanks();if(s[i]==='{'){i++;return sequence('}');}return token();}
  function token(){
    if(i>=s.length)return mathNode('mrow');
    if(s[i]==='\\'){
      i++;let name='';
      if(/[A-Za-z]/.test(s[i]||'')){while(i<s.length&&/[A-Za-z]/.test(s[i]))name+=s[i++];}
      else name=s[i++]||'';
      if(name==='left'||name==='right')return token();
      if(name==='frac'||name==='dfrac'||name==='tfrac')return mathNode('mfrac',[arg(),arg()]);
      if(name==='sqrt'){
        blanks();if(s[i]==='['){i++;const power=sequence(']');return mathNode('mroot',[arg(),power]);}
        return mathNode('msqrt',[arg()]);
      }
      if(name==='mathbb'){
        const content=arg().textContent;
        return atom({N:'ℕ',Z:'ℤ',Q:'ℚ',R:'ℝ',C:'ℂ'}[content]||content);
      }
      if(['overline','bar','vec','overrightarrow','hat','widehat'].includes(name)){
        return mathNode('mover',[arg(),atom(['vec','overrightarrow'].includes(name)?'→':name.includes('hat')?'ˆ':'¯')]);
      }
      if(name==='mathrm'||name==='mathbf'||name==='text')return mathNode('mtext',[],arg().textContent);
      if(name==='log'||name==='ln'||name==='sin'||name==='cos'||name==='tan')return mathNode('mi',[],name);
      if(['{','}','|','_','%','&','$','#'].includes(name))return atom(name);
      if(Object.prototype.hasOwnProperty.call(symbols,name))return atom(symbols[name]);
      // A clearly visible fallback is better than silently dropping math symbols.
      return mathNode('mtext',[],'\\'+name);
    }
    if(s[i]==='{'){i++;return sequence('}');}
    if(s[i]===String.fromCharCode(92)){i++;return atom('\\');}
    const c=s[i++];
    if(/[0-9]/.test(c)){
      let n=c;while(i<s.length&&/[0-9]/.test(s[i]))n+=s[i++];
      if(/[.,]/.test(s[i]||'')&&/[0-9]/.test(s[i+1]||'')){
        n+=s[i++];while(i<s.length&&/[0-9]/.test(s[i]))n+=s[i++];
      }
      return atom(n);
    }
    return atom(c);
  }
  function sequence(closing=''){
    const nodes=[];
    while(i<s.length){
      if(closing&&s[i]===closing){i++;break;}
      if(s[i]==='^'||s[i]==='_'){
        const scripts={};let base=nodes.pop()||mathNode('mrow');
        while((s[i]==='^'||s[i]==='_')&&!scripts[s[i]]){
          const op=s[i++];scripts[op]=arg();
        }
        if(scripts._&&scripts['^'])base=mathNode('msubsup',[base,scripts._,scripts['^']]);
        else if(scripts._)base=mathNode('msub',[base,scripts._]);
        else base=mathNode('msup',[base,scripts['^']]);
        nodes.push(base);
        continue;
      }
      nodes.push(token());
    }
    return mathNode('mrow',nodes);
  }
  return mathNode('math',[sequence()]);
}
export function addSegments(container,segments){
  container.replaceChildren();
  for(const seg of segments||[]){
    if(seg.t==='math')container.appendChild(parseLatex(seg.v));
    else container.appendChild(document.createTextNode(seg.v||''));
  }
}
const shuffle=(values)=>{const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export function selectChapterQuestions(all,count=10){
  const approved=(all||[]).filter(q=>q&&['A','B','C','D'].includes(q.answer)&&q.choices&&['A','B','C','D'].every(k=>typeof q.choices[k]==='string')&&!q.issues?.length);
  const byDifficulty=(difficulty)=>shuffle(approved.filter(q=>q.difficulty===difficulty));
  const desired=[...byDifficulty('Dễ').slice(0,4),...byDifficulty('Trung bình').slice(0,4),...byDifficulty('Khó').slice(0,2)];
  const selected=new Set(desired.map(q=>q.id));
  for(const q of shuffle(approved))if(desired.length<count&&!selected.has(q.id)){desired.push(q);selected.add(q.id);}
  return desired.slice(0,count).sort((a,b)=>getDifficultyRank(a)-getDifficultyRank(b));
}
export function initializeParkUI({park,notice,visitZone,travelToGate,focusPark,focusZone,closeFocus,enterGameMode,leaveGameMode,enterRoom,exitRoom,toSanctuaryDoor,enterMazeMode,leaveMazeMode,cycleCamera=null}){
  const GAME_IDS=new Set([0,1,2,3,4,5,6,7,8,9,10]);
  const GAME_INFO={
    0:{title:'🐔 HỌC BÁ CHUỒNG GÀ',button:'🐔 THỬ THÁCH CHUỒNG GÀ'},
    1:{title:'🚀 HỌC BÁ TÊN LỬA',button:'🚀 LÊN GHẾ TÊN LỬA'},
    2:{title:'🪷 PHÒNG THÍCH HỌC BÁ',button:'🪷 BỐC QUẺ KIẾN THỨC'},
    3:{title:'🌉 HỌC BÁ CẦU KÍNH',button:'🌉 LÊN CẦU KÍNH'},
    6:{title:'🏠 HỌC BÁ KIẾN TRÚC SƯ',button:'🏠 XÂY NHÀ 10 PHẦN'},
    8:{title:'🎢 HỌC BÁ TÀU LƯỢN SIÊU TỐC',button:'🎢 LÊN TÀU LƯỢN'},
    9:{title:'🎈 HỌC BÁ TRÍ TUỆ',button:'🎈 LÊN KHINH KHÍ CẦU'},
    4:{title:'🪢 HỌC BÁ KÉO CO',button:'🪢 KÉO CO TRI THỨC'},
    5:{title:'⚽ HỌC BÁ RONALDO',button:'⚽ THỬ THÁCH SÚT BÓNG'},
    7:{title:'🧭 MÊ CUNG LẠC LỐI',button:'🧭 BƯỚC VÀO MÊ CUNG · 8 MÀN'},
    10:{title:'💎 AI LÀ TRIỆU PHÚ TOÁN HỌC',button:'💎 NGỒI GHẾ NÓNG · 15 CÂU'}
  };
  let bank=null,bankPromise=null,quiz=null,token=0,pending=null,currentZone=null,maze=null;
  const PREF_KEY='mathverse_park_knowledge_v8';
  const IMPORT_KEY='mathverse_park_uploaded_teacher_bank_FINAL_20261102';
  const rulesCard=el('mvpark-rules-card'),rulesList=el('mvpark-rule-list'),quizRules=el('mvpark-quiz-rule-list');
  const setupCard=el('mvpark-learning-setup'),gradeSelect=el('mvpark-grade'),scopeSelect=el('mvpark-scope');
  const chapterSelect=el('mvpark-chapter'),chapterWrap=el('mvpark-chapter-wrap'),bankStatus=el('mvpark-bank-status');
  const fileInput=el('mvpark-bank-file'),importFeedback=el('mvpark-import-feedback');
  function getStorage(){try{return window?.localStorage||null;}catch{return null;}}
  function readPreference(){
    try{const v=JSON.parse(getStorage()?.getItem(PREF_KEY)||'null');
      if(GRADES.includes(Number(v?.grade)))
        return {grade:Number(v.grade),scope:v.scope==='grade'?'grade':'chapter',chapter:Number(v.chapter)||1};
    }catch{}return {grade:6,scope:'chapter',chapter:1};
  }
  const choiceSettings=readPreference();
  gradeSelect.value=String(choiceSettings.grade);scopeSelect.value=choiceSettings.scope;chapterSelect.value=String(choiceSettings.chapter);
  const GAME_RULES={
    0:['Đứng ngoài quan sát chuồng 3D; một gà quán quân lớn hơn 10 gà đối thủ.','Mỗi câu đúng: gà quán quân đá một gà đối thủ ra khỏi vòng tròn.','Sai một câu: gà quán quân bị loại, cả lượt chơi trở lại câu 1.','Đúng 10/10 liên tiếp: nhận HỌC BÁ CHUỒNG GÀ.'],
    1:['Em và NPC ngồi cùng ghế gắn tên lửa.','Trả lời đúng từng câu để tích lũy năng lượng.','Sai một câu: tên lửa phóng vút lên và biến mất kèm âm thanh kéo dài; chơi lại từ đầu.','Đúng 10/10: nhận HỌC BÁ TÊN LỬA.'],
    2:['Bước qua cổng đặc biệt, đến gần NPC Phật Trí Tuệ rồi nhấn E.','Bốc quẻ để nhận từng câu Toán từ kho giáo viên và chọn A–D.','Sai một câu: hiện MỜI THÍ CHỦ VỀ TU LUYỆN và quay về cửa phòng.','Đúng 10/10: nhận danh hiệu THÍCH HỌC BÁ.'],
    3:['Nhân vật đứng trên cầu kính cao, có thể nhìn xuyên kính xuống nước.','Mỗi câu đúng: bước sang tấm kính kế tiếp.','Sai một câu: kính vỡ và nhân vật rơi xuống nước; bắt đầu lại.','Vượt 10/10 nhịp: nhận HỌC BÁ CẦU KÍNH.'],
    4:['Em kéo co đối diện NPC trên một sợi dây 3D.','Mỗi câu đúng: dây chuyển một nhịp về phía em.','Sai một câu: NPC kéo thắng, lượt chơi kết thúc ngay.','Đúng 10/10 liên tiếp: nhận HỌC BÁ KÉO CO.'],
    5:['Nhân vật sút bóng đối mặt với thủ môn 3D.','Mỗi câu đúng: ghi một bàn vào khung thành.','Sai một câu: thủ môn cản phá, trận kết thúc và bắt đầu lại từ 0.','Ghi đủ 10/10: nhận HỌC BÁ RONALDO.'],
    6:['Ngôi nhà 3D được chia thành 10 mô-đun xây dựng.','Mỗi câu đúng: đặt thêm một khối nhà đúng vị trí.','Sai một câu: công trình đổ vỡ và phải chơi lại.','Đúng 10/10: hoàn thành nhà, nhận HỌC BÁ KIẾN TRÚC SƯ.'],
    7:['Không có câu hỏi trắc nghiệm. Em cần suy luận để thoát khỏi mê cung 3D.','Mỗi màn chỉ được xem sơ đồ toàn cảnh từ trên cao đúng một lần trong 6 giây.','Đi bằng W/A/S/D, xoay Q hoặc ← →, nhảy Space; mê cung có nhiều ngõ cụt nhưng chỉ một lối thoát hợp lệ.','Vượt đủ 8 màn từ 15×15 đến 29×29 ô: nhận HỌC BÁ MÊ CUNG.'],
    8:['Ngồi trong toa tàu lượn 3D với nhiều vòng và ngã ba cuối đường ray.','Mỗi câu đúng: tàu tiến tiếp trên tuyến an toàn.','Sai một câu: tàu rẽ sang ray gãy và bay lên trời; chơi lại từ đầu.','Đúng 10/10: tàu về ga, nhận HỌC BÁ TÀU LƯỢN SIÊU TỐC.'],
    9:['Em đứng trên giỏ khinh khí cầu để tham quan toàn khu.','Trả lời đúng 10 câu: khí cầu bay ở độ cao nhất định dọc tuyến ngắm Sảnh, LAB, Bảo tàng và Công viên.','Sai một câu: khí cầu rơi và lượt chơi kết thúc.','Hoàn thành chuyến bay, trở lại bến: nhận HỌC BÁ TRÍ TUỆ.'],
    10:['Ngồi trên ghế nóng với MC, trả lời 15 câu theo thứ tự 5 dễ – 5 trung bình – 5 khó.','Mốc điểm ảo bảo toàn tại câu 5, 10 và 15. Sai sẽ kết thúc lượt, giữ mốc đã đạt.','Có ba trợ giúp dùng một lần: 50:50 (loại 2 sai), Khán giả và Hỏi AI (gợi ý tự động trong trò chơi, không gọi mô hình AI trực tuyến).','Đúng 15/15: nhận HỌC BÁ TRIỆU PHÚ TOÁN HỌC.']
  };
  function writeRules(target,zone){
    target.replaceChildren();
    for(const text of GAME_RULES[zone]||[]){const li=document.createElement('li');li.textContent=text;target.appendChild(li);}
  }
  function storePreference(){try{getStorage()?.setItem(PREF_KEY,JSON.stringify(choiceSettings));}catch{}}
  function selection(){return {...choiceSettings};}
  function storedChapters(){
    try{const raw=JSON.parse(getStorage()?.getItem(IMPORT_KEY)||'null');
      return raw?.chapters?normalizeTeacherBank(raw,{sourceLabel:'Kho nạp trong trình duyệt'}):[];
    }catch{return [];}
  }
  function refreshChapters(){
    if(!bank){chapterSelect.replaceChildren();return;}
    const chapters=getAvailableChapters(bank.chapters,choiceSettings.grade);
    chapterSelect.replaceChildren();
    for(const chapter of chapters){
      const opt=document.createElement('option');opt.value=String(chapter.chapter);opt.textContent=`Chương ${chapter.chapter}: ${chapter.title} (${chapter.questions.length} câu)`;
      chapterSelect.appendChild(opt);
    }
    if(chapters.length&&!chapters.some(c=>c.chapter===choiceSettings.chapter))choiceSettings.chapter=chapters[0].chapter;
    chapterSelect.value=String(choiceSettings.chapter);
    chapterWrap.hidden=choiceSettings.scope==='grade';
    chapterSelect.disabled=choiceSettings.scope==='grade'||chapters.length===0;
  }
  function refreshReadiness(){
    if(currentZone===null||!GAME_IDS.has(currentZone)){setupCard.hidden=true;rulesCard.hidden=true;return;}
    setupCard.hidden=currentZone===7;rulesCard.hidden=false;
    writeRules(rulesList,currentZone);
    const label=currentZone===7?'🎯 Mục tiêu: 8 màn, không dùng câu hỏi.':currentZone===10?'🎯 Mục tiêu: 15 câu Toán đúng theo phạm vi đã chọn.':'🎯 Mục tiêu: đúng liên tiếp 10/10; sai là kết thúc lượt.';
    el('mvpark-rule-goal').textContent=label;
    if(currentZone===7){startButton.disabled=false;return;}
    if(!bank){startButton.disabled=true;bankStatus.textContent='Đang kiểm tra kho đề giáo viên...';bankStatus.dataset.ready='no';return;}
    const status=checkQuestionReadiness(bank.chapters,selection(),currentZone);
    const parts=Object.entries(status.byDifficulty||{}).map(([k,v])=>`${k}: ${v}`).join(' · ');
    bankStatus.dataset.ready=status.ready?'yes':'no';
    bankStatus.textContent=status.reason+(parts?` | ${parts}`:'');
    startButton.disabled=!status.ready;
    if(!startButton.hidden)startButton.title=status.ready?'Đã có đủ câu hỏi, có thể bắt đầu.':status.reason;
    storePreference();
  }
  function updateChoice(){
    choiceSettings.grade=Number(gradeSelect.value)||6;
    choiceSettings.scope=scopeSelect.value==='grade'?'grade':'chapter';
    choiceSettings.chapter=Number(chapterSelect.value)||choiceSettings.chapter||1;
    refreshChapters();refreshReadiness();storePreference();
  }
  gradeSelect.addEventListener('change',()=>{choiceSettings.chapter=1;updateChoice();});
  scopeSelect.addEventListener('change',updateChoice);
  chapterSelect.addEventListener('change',updateChoice);
  refreshChapters();
  function refreshAfterBank(){
    refreshChapters();refreshReadiness();
  }
  async function importTeacherFile(){
    const file=fileInput.files?.[0];if(!file){importFeedback.textContent='Vui lòng chọn tệp JSON giáo viên đã chuẩn bị.';return;}
    try{
      if(file.size>8*1024*1024)throw new Error('Tệp tối đa 8 MB trong chế độ nhập qua trình duyệt.');
      const loaded=JSON.parse(await file.text());
      const next=normalizeTeacherBank(loaded,{sourceLabel:file.name});
      const approved=next.reduce((n,chapter)=>n+chapter.questions.length,0);
      if(!approved)throw new Error('Tệp không có câu hỏi hợp lệ để sử dụng.');
      const merged=mergeTeacherChapters(storedChapters(),next);
      const payload={chapters:merged.map(ch=>({grade:ch.grade,chapter:ch.chapter,title:ch.title,source:ch.source,questions:ch.questions}))};
      const storage=getStorage();if(!storage)throw new Error('Trình duyệt không cho phép lưu dữ liệu; thử Chrome/Edge bình thường.');
      storage.setItem(IMPORT_KEY,JSON.stringify(payload));
      if(bank)bank.chapters=mergeTeacherChapters(bank.base,merged);
      importFeedback.textContent=`Đã nạp ${approved} câu hợp lệ thuộc ${next.length} chương. Dữ liệu chỉ nằm trong trình duyệt này.`;
      refreshAfterBank();notice('Kho câu hỏi giáo viên đã được cập nhật.');
    }catch(error){importFeedback.textContent='Không thể nạp: '+error.message;notice(importFeedback.textContent);}
  }
  el('mvpark-bank-import').addEventListener('click',()=>{importTeacherFile();});
  el('mvpark-bank-reset').addEventListener('click',()=>{
    try{getStorage()?.removeItem(IMPORT_KEY);}catch{}
    if(bank)bank.chapters=[...bank.base];
    importFeedback.textContent='Đã bỏ kho nạp thêm trên trình duyệt, vẫn giữ kho gốc đã đóng gói.';
    refreshAfterBank();
  });
  const mazeHud=el('mvpark-maze-hud'),mazeLevelEl=el('mvpark-maze-level'),mazeInfoEl=el('mvpark-maze-info');
  const lifelineBar=el('mvpark-lifelines'),ladder=el('mvpark-prize-ladder'),lifelineResult=el('mvpark-lifeline-result');
  let audioContext=null,woodbeatTimer=null;
  const panel=el('mvpark-panel'),game=el('mvpark-quiz'),list=el('mvpark-zone-list');
  const status=el('mvpark-guide-text'),zoneName=el('mvpark-zone-name');
  const title=el('mvpark-game-title'),question=el('mvpark-question'),answers=el('mvpark-answers'),feedback=el('mvpark-feedback');
  const quizScroll=el('mvpark-quiz-body');
  const progress=el('mvpark-progress'),count=el('mvpark-count'),win=el('mvpark-result');
  const startButton=el('mvpark-start'),enterRoomButton=el('mvpark-enter-room');
  const quizCameraButton=el('mvpark-eye-camera'),lotButton=el('mvpark-draw-lot');
  const soundButton=el('mvpark-temple-sound'),exitButton=el('mvpark-exit-room');
  const modalBackdrop=el('mvpark-game-shade');
  const beak=el('mvpark-chicken-beak');
  const clearPending=()=>{if(pending!==null)clearTimeout(pending);pending=null;};
  const delay=(fn,ms)=>{clearPending();pending=setTimeout(fn,ms);};
  const soundSupported=typeof (window.AudioContext||window.webkitAudioContext)==='function';
  function speak(content){
    if(typeof window!=='undefined'&&typeof window.__mathverseSpeakText==='function'){
      window.__mathverseSpeakText(content);
      return;
    }
    if(!('speechSynthesis' in window)){notice('Máy chưa hỗ trợ đọc tiếng Việt.');return;}
    speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(content);
    u.lang='vi-VN';u.rate=.92;speechSynthesis.speak(u);
  }
  let mokugyoBuffer=null;
  function loadMokugyo(){
    if(!soundSupported)return;
    try{
      const ctx=getAudio();if(!ctx)return;
      fetch('/dual/assets/sounds/mokugyo.wav')
        .then(r=>r.ok?r.arrayBuffer():null)
        .then(buf=>{
          if(buf&&ctx.decodeAudioData){
            ctx.decodeAudioData(buf,dec=>{mokugyoBuffer=dec;},()=>{});
          }
        }).catch(()=>{});
    }catch(e){}
  }
  function playWoodblock(){
    const ctx=getAudio();if(!ctx)return;
    if(mokugyoBuffer){
      try{
        const src=ctx.createBufferSource();
        src.buffer=mokugyoBuffer;
        const gain=ctx.createGain();gain.gain.value=0.88;
        src.connect(gain);gain.connect(ctx.destination);
        src.start(0);return;
      }catch(e){}
    }
    try{
      const t=ctx.currentTime;
      const osc=ctx.createOscillator(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
      osc.type='triangle';osc.frequency.setValueAtTime(375,t);osc.frequency.exponentialRampToValueAtTime(160,t+.12);
      filter.type='lowpass';filter.frequency.value=950;filter.Q.value=1.8;
      gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.12,t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+.18);
      osc.connect(filter);filter.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+.22);
    }catch(e){console.warn('Woodblock audio unavailable',e);}
  }
  
  function playTriumphChime(){
    const ctx = getAudio(); if(!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const t = ctx.currentTime + i * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.70);
      });
    } catch(e){}
  }

  function launchVictoryConfetti(){
    const canvas = el('mvpark-celebration-canvas');
    if(!canvas || typeof canvas.getContext !== 'function') return;
    if(typeof window === 'undefined' || typeof requestAnimationFrame !== 'function') return;
    canvas.hidden = false;
    canvas.width = window.innerWidth || 1024;
    canvas.height = window.innerHeight || 768;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    const colors = ['#f59e0b', '#10b981', '#38bdf8', '#ec4899', '#8b5cf6', '#ef4444', '#facc15'];
    const particles = [];
    for(let i = 0; i < 90; i++){
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height * 0.5,
        w: 6 + Math.random() * 8,
        h: 10 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: 2.5 + Math.random() * 4.5,
        vx: (Math.random() - 0.5) * 2.8,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8
      });
    }
    const start = performance.now();
    function loop(now){
      const elapsed = now - start;
      if(elapsed > 4500){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.hidden = true;
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for(const p of particles){
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.rotSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function playTripleMokugyo(){
    playWoodblock();
    setTimeout(playWoodblock,260);
    setTimeout(playWoodblock,520);
  }
  loadMokugyo();
  function stopTempleSound(){if(woodbeatTimer!==null){clearInterval(woodbeatTimer);woodbeatTimer=null;}}
  function startTempleSound(){
    if(!soundSupported){notice('Thiết bị không hỗ trợ Web Audio.');return;}
    if(!audioContext)audioContext=new (window.AudioContext||window.webkitAudioContext)();
    audioContext.resume().catch(()=>{});
    stopTempleSound();playWoodblock();woodbeatTimer=setInterval(playWoodblock,2800);
  }
  function updateSoundButton(){soundButton.textContent=woodbeatTimer===null?'🔔 Bật tiếng mõ':'🔕 Tắt tiếng mõ';}

  // All sound effects are original synthesized signals; no web assets or copied audio.
  function getAudio(){
    if(!soundSupported)return null;
    try{
      if(!audioContext)audioContext=new (window.AudioContext||window.webkitAudioContext)();
      if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
      return audioContext;
    }catch{return null;}
  }
  function soundSweep(from,to,duration=.45,type='sawtooth',volume=.15){
    const ctx=getAudio();if(!ctx)return;
    const t=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type=type;osc.frequency.setValueAtTime(Math.max(30,from),t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30,to),t+duration);
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(Math.max(.001,volume),t+.035);
    gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    osc.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+duration+.02);
  }
  function playRocketWhoosh(){
    // Long descending CHIU sound synchronized with the disappearing rocket.
    soundSweep(1550,95,2.2,'sawtooth',.12);
    soundSweep(820,55,2.45,'triangle',.075);
  }
  function playWaterSplash(){
    const ctx=getAudio();if(!ctx)return;
    const seconds=.95, size=Math.ceil(ctx.sampleRate*seconds),buf=ctx.createBuffer(1,size,ctx.sampleRate);
    const samples=buf.getChannelData(0);
    for(let k=0;k<size;k++)samples[k]=(Math.random()*2-1)*Math.exp(-5*k/size);
    const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    src.buffer=buf;filter.type='lowpass';filter.frequency.value=1450;
    gain.gain.value=.16;src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);src.start();
    soundSweep(180,62,.54,'sine',.085);
  }
  function playFailEffect(mode){
    if(mode===1)playRocketWhoosh();
    if(mode===3)playWaterSplash();
    if(mode===6){soundSweep(400,68,.9,'square',.095);}
    if(mode===8){soundSweep(860,110,1.5,'sawtooth',.105);}
    if(mode===9){soundSweep(460,70,1.6,'triangle',.115);}
    if(mode===4){soundSweep(490,125,.7,'triangle',.11);}
    if(mode===5){soundSweep(310,80,.42,'sine',.12);}
    if(mode===10){soundSweep(360,90,.8,'triangle',.1);}
  }

  function show(item){panel.hidden=item==='quiz';game.hidden=item!=='quiz';modalBackdrop.hidden=item!=='quiz';}
  function clearGame(){
    stopMazeAdventure();
    token++;clearPending();const last=quiz;quiz=null;game.hidden=true;modalBackdrop.hidden=true;win.hidden=true;
    answers.replaceChildren();question.replaceChildren();beak.hidden=true;lifelineBar.hidden=true;ladder.hidden=true;lifelineResult.hidden=true;lifelineResult.textContent='';
    if(last)leaveGameMode?.();
  }
  function showGate(){
    clearGame();currentZone=null;panel.hidden=false;
    zoneName.textContent='Cổng công viên MATHVERSE';
    status.textContent=park.gateOpen?'Công viên đang hoạt động trong chính sảnh MATHVERSE. Các khu có NPC và cửa vào riêng.':'Hãy mở cổng để các mô hình 3D bắt đầu chuyển động.';
    el('mvpark-open-gate').hidden=park.gateOpen;startButton.hidden=true;enterRoomButton.hidden=true;exitButton.hidden=true;soundButton.hidden=true;
    setupCard.hidden=true;rulesCard.hidden=true;
    el('mvpark-npc-name').textContent='NPC lễ tân MATHVERSE';el('mvpark-npc-emoji').textContent='👩‍✈️';
  }
  function showZone(i,metNpc=false){
    if(!park.gateOpen){showGate();return;}
    clearGame();currentZone=i;panel.hidden=false;
    const zone=park.zones[i];zoneName.textContent=`${i+1}. ${zone.name}`;
    el('mvpark-npc-name').textContent=zone.staff;
    el('mvpark-npc-emoji').textContent=zone.emoji;status.textContent=zone.guide;
    el('mvpark-open-gate').hidden=true;
    const playable=GAME_IDS.has(i);
    startButton.hidden=!playable||(i===2&&(!park.sanctuaryActive||!metNpc));
    enterRoomButton.hidden=i!==2||park.sanctuaryActive;
    exitButton.hidden=!park.sanctuaryActive;
    soundButton.hidden=!park.sanctuaryActive;
    startButton.textContent=(GAME_INFO[i]?.button||zone.name)+(i===10?' · 15 CÂU':i===7?'':' · 10 CÂU');
    updateSoundButton();
    refreshReadiness();
    if(i!==7)loadBank().then(()=>{if(currentZone===i&&!panel.hidden)refreshAfterBank();}).catch(error=>{if(currentZone===i){bankStatus.dataset.ready='no';bankStatus.textContent=error.message;startButton.disabled=true;}});
  }
  function hide(){clearGame();panel.hidden=true;closeFocus?.();}
  function toggle(){if(!panel.hidden||!game.hidden)hide();else showGate();}
  el('mvpark-speak').addEventListener('click',()=>{
    const info=currentZone!==null?GAME_INFO[currentZone]:null;
    const rulesText=info?.rules?(' Luật chơi: '+info.rules.join('. ')+'. '+(info.goal||'')):'';
    speak((zoneName.textContent?zoneName.textContent+'. ':'')+(status.textContent||'')+rulesText);
  });
  el('mvpark-close').addEventListener('click',hide);
  const quizExpandBtn=el('mvpark-quiz-expand');
  function setQuizExpanded(force){
    const isExp=typeof force==='boolean'?force:!game.classList.contains?.('expanded');
    if(isExp){
      game.classList.add('expanded');
      game.classList.remove('watching-3d-anim');
    }else{
      game.classList.remove('expanded');
    }
    if(quizExpandBtn){
      quizExpandBtn.textContent=isExp?'🗗 THU NHỎ':'⛶ PHÓNG TO';
      quizExpandBtn.setAttribute?.('title',isExp?'Thu nhỏ khung câu hỏi':'Phóng to toàn màn hình');
    }
  }
  function autoCollapseForAnimation(){
    setQuizExpanded(false);
    game.classList.add('watching-3d-anim');
    if(modalBackdrop)modalBackdrop.hidden=true;
  }
  if(quizExpandBtn){
    quizExpandBtn.addEventListener('click',()=>{
      game.classList.remove('watching-3d-anim');
      setQuizExpanded();
    });
  }
  el('mvpark-quiz-close').addEventListener('click',()=>{if(quiz?.mode===2&&park.sanctuaryActive){clearGame();showZone(2);}else hide();});
  el('mvpark-open-gate').addEventListener('click',()=>{
    if(park.openGate()){travelToGate();notice('Cổng công viên đang mở ngay trên bản đồ MATHVERSE.');showGate();}
  });
  for(let i=0;i<park.zones.length;i++){
    const zone=park.zones[i],button=document.createElement('button');button.type='button';
    button.textContent=`${i+1}. ${zone.emoji} ${zone.short}`;
    button.addEventListener('click',()=>{
      if(!park.gateOpen){showGate();notice('Hãy mở cổng trước khi chọn trò chơi.');return;}
      if(park.sanctuaryActive){stopTempleSound();exitRoom();}
      visitZone(i);focusZone(i);showZone(i);
    });list.appendChild(button);
  }
  el('mvpark-go-gate').addEventListener('click',()=>{if(park.sanctuaryActive){stopTempleSound();exitRoom();}travelToGate();showGate();});
  el('mvpark-see-aerial').addEventListener('click',()=>{if(park.sanctuaryActive){stopTempleSound();exitRoom();}hide();focusPark();});
  enterRoomButton.addEventListener('click',()=>{
    enterRoom();showZone(2);startTempleSound();updateSoundButton();
    notice('Đã vào Phòng Thích Học Bá. Đi tới gần NPC Phật Trí Tuệ rồi nhấn E để bốc quẻ.');
  });
  exitButton.addEventListener('click',()=>{stopTempleSound();hide();exitRoom();});
  soundButton.addEventListener('click',()=>{if(woodbeatTimer!==null)stopTempleSound();else startTempleSound();updateSoundButton();});
  startButton.addEventListener('click',()=>{if(currentZone===7)startMazeAdventure();else startQuiz();});el('mvpark-retry').addEventListener('click',()=>{
    if(quiz?.mode===2){clearGame();toSanctuaryDoor?.();showZone(2);return;}
    startQuiz();
  });
  el('mvpark-result-exit').addEventListener('click',()=>{
    const mode=quiz?.mode;clearGame();
    if(mode===2&&park.sanctuaryActive){toSanctuaryDoor?.();showZone(2);}
    else hide();
  });
  quizCameraButton.addEventListener('click',()=>{
    if(!quiz||![0,3,9].includes(quiz.mode))return;
    if(quiz.mode===9){
      const order=['eye','near','far'];
      const cur=order.indexOf(quiz.balloonView||'near');
      quiz.balloonView=order[(cur+1)%order.length];
      enterGameMode?.(9,quiz.balloonView);
      updateCameraButton();
      return;
    }
    quiz.eye=!quiz.eye;
    enterGameMode?.(quiz.mode,quiz.mode===0?(quiz.eye?'arena':'close'):(quiz.eye?'lookdown':'follow'));updateCameraButton();
  });
  function updateCameraButton(){
    quizCameraButton.hidden=![0,3,9].includes(quiz?.mode);
    if(quiz?.mode===9){
      const v=quiz.balloonView||'near';
      quizCameraButton.textContent=v==='eye'?'🔎 Góc nhìn Gần (Thấy khí cầu)':v==='near'?'🎥 Góc nhìn Xa (Toàn cảnh)':'👁 Góc nhìn Mắt (Trong giỏ)';
    }else{
      quizCameraButton.textContent=quiz?.mode===0?(quiz.eye?'🔎 Nhìn gần chuồng':'🎥 Xem toàn vòng'):(quiz?.eye?'🎥 Xem toàn cầu':'👁 Nhìn xuống nước');
    }
    beak.hidden=true;
  }
  async function loadBank(){
    if(bank)return bank;
    if(bankPromise)return bankPromise;
    bankPromise=(async()=>{
      // Packaged teacher-authored LaTeX, preserved by grade/chapter (63 chapters; 7 grades).
      let response=await fetch('/game-park/assets/teacher-bank-6-12-63-chapters.json');
      // Do NOT fallback to an obsolete 9-chapter bank: it contains questions outside the chosen program.
      if(!response.ok)throw new Error('Không đọc được kho câu hỏi do giáo viên cung cấp.');
      const payload=await response.json();
      const base=normalizeTeacherBank(payload,{sourceLabel:'Kho giáo viên'});
      bank={base,chapters:mergeTeacherChapters(base,storedChapters())};
      return bank;
    })();
    try{return await bankPromise;}
    finally{bankPromise=null;}
  }
  async function startQuiz(){
    const zone=currentZone;clearGame();currentZone=zone;
    if(zone===null||!GAME_IDS.has(zone)){showGate();return;}
    if(zone===2&&!park.sanctuaryActive){showZone(2);notice('Hãy vào phòng trước khi bốc quẻ.');return;}
    if(!park.gateOpen){showGate();notice('Hãy mở cổng công viên trước.');return;}
    const t=token;
    try{
      const b=await loadBank();if(token!==t)return;
      const picked=selection();
      const readiness=checkQuestionReadiness(b.chapters,picked,zone);
      if(!readiness.ready)throw new Error(readiness.reason);
      const round=pickQuestionsForGame(b.chapters,picked,zone);
      const total=zone===10?15:10;
      if(round.length!==total)throw new Error('Chưa đủ câu hỏi đúng lớp/chương được giáo viên cung cấp.');
      quiz={mode:zone,round,index:0,correct:0,locked:false,revealed:zone!==2,eye:zone===3,balloonView:'near',
        selection:picked,lifelines:{fifty:false,audience:false,ai:false}};
      if(zone===0){park.resetChicken();park.focusGame(0);}
      if(zone===1){park.resetRocket();park.focusGame(1);}
      if(zone===3){park.resetBridge();park.focusGame(3);}
      if(zone===4){park.resetTug();park.focusGame(4);}
      if(zone===5){park.resetSoccer();park.focusGame(5);}
      if(zone===10){park.resetMillionaire();park.focusGame(10);}
      if(zone===6){park.resetArchitect();park.focusGame(6);}
      if(zone===8){park.resetCoaster();park.focusGame(8);}
      if(zone===9){park.resetBalloon();park.focusGame(9);}
      const view=zone===0?'close':zone===1?'rocket':zone===3?'lookdown':zone===4?'tug':zone===5?'soccer':zone===6?'house':zone===8?'coaster':zone===9?'near':zone===10?'millionaire':'room';
      enterGameMode?.(zone,view);
      show('quiz');win.hidden=true;
      const scopeLabel=picked.scope==='grade'?'Toàn bộ kiến thức lớp '+picked.grade:`Chương ${picked.chapter} · Toán ${picked.grade}`;
      el('mvpark-bank-source').textContent=`Toán ${picked.grade} · ${scopeLabel} · Kho giáo viên`;
      el('mvpark-quiz-scope').textContent=`📚 ${scopeLabel} · ${round.length} câu · Đã lọc theo đúng phạm vi`;
      writeRules(quizRules,zone);
      el('mvpark-quiz-rules').open=false;
      renderQuestion();updateCameraButton();
      notice(zone===0?'Camera bám sát chuồng gà. Gà quán quân to hơn các gà khác.':zone===1?'Sai: tên lửa bay biến mất cùng NPC.':zone===2?'Bốc quẻ gặp NPC Trí Tuệ.':park.zones[zone].guide);
    }catch(e){notice('Không thể bắt đầu: '+e.message);showZone(zone);}
  }

  function renderQuestion(){
    if(!quiz)return;
    game.classList.remove('watching-3d-anim');
    const q=quiz.round[quiz.index],mode=quiz.mode;
    quiz.locked=false;
    const diff = q?.difficulty || 'Dễ';
    title.textContent=`${GAME_INFO[mode]?.title||park.zones[mode].name} · Câu ${quiz.index+1}/${quiz.round.length}`;
    progress.textContent=`Câu ${quiz.index+1}/${quiz.round.length}`;
    const diffBadge = el('mvpark-diff-badge');
    if(diffBadge){
      diffBadge.textContent=`Mức độ: ${diff}`;
      diffBadge.dataset.diff=diff;
    }
    const scopeEl = el('mvpark-quiz-scope');
    if(scopeEl && quiz.selection){
      const scopeLabel = quiz.selection.scope==='grade' ? `Toàn bộ kiến thức lớp ${quiz.selection.grade}` : `Toán ${quiz.selection.grade} · Chương ${quiz.selection.chapter}`;
      scopeEl.textContent = `🎯 ${scopeLabel} · Câu ${quiz.index+1}/${quiz.round.length} · [Mức độ: ${diff}]`;
    }
    count.textContent=mode===0?`Đã loại ${quiz.correct}/10 gà`:
      mode===1?`Động cơ ${quiz.correct}/10`:
      mode===2?`Đã bốc ${quiz.correct}/10 quẻ`:
      mode===3?`Qua ${quiz.correct}/10 nhịp cầu`:
      mode===4?`Dây kéo về phía em ${quiz.correct}/10`:
      mode===5?`Đã sút vào lưới ${quiz.correct}/10`:
      mode===10?`Mốc thưởng ${quiz.index+1}/15`:
      mode===6?`Đã lắp ${quiz.correct}/10 khối nhà`:
      mode===8?`Đã qua ${quiz.correct}/10 chặng`:
      `Chinh phục ${quiz.correct}/10 câu`;
    feedback.textContent=mode===0?'Camera quan sát gần chuồng. Gà quán quân lớn hơn các gà đối thủ.':
      mode===1?'Sai 1 câu: tên lửa bay mất cùng NPC, phát tiếng chíu kéo dài.':
      mode===2?'Bốc quẻ và trả lời. Sai sẽ quay về cửa phòng.':
      mode===3?'Nhìn qua kính xuống nước: đúng tiến 1 nhịp, sai rơi xuống nước.':
      mode===4?'Mỗi câu đúng kéo dây về phía em. Sai một câu, NPC thắng ngay.':
      mode===5?'Mỗi câu đúng ghi một bàn. Sai một câu thủ môn cản phá, về 0/10.':
      mode===10?'MC: 15 câu · mốc 5/10/15. Mỗi trợ giúp chỉ dùng một lần.':
      mode===6?'Đúng lắp thêm 1 phần nhà. Sai nhà sẽ đổ vỡ.':
      mode===8?'Đúng tàu đi tiếp về ga; sai tàu vào nhánh ray gãy.':
      'Đúng 10/10 để bay tham quan Sảnh, LAB, Bảo tàng và Công viên.';
    feedback.dataset.result='none';win.hidden=true;
    lifelineBar.hidden=mode!==10;ladder.hidden=mode!==10;lifelineResult.hidden=mode!==10;
    if(mode===10){lifelineResult.textContent='';updateMillionaireUI();}
    question.replaceChildren();answers.replaceChildren();
    lotButton.hidden=mode!==2||quiz.revealed;
    if(mode===2&&!quiz.revealed){
      question.textContent='NPC Phật Trí Tuệ mời thí chủ bốc quẻ Toán học từ kho do giáo viên cung cấp.';
      return;
    }
    addSegments(question,q.prompt_segments||[{t:'txt',v:q.prompt}]);
    quizScroll.scrollTop=0; // Always return to the first word, not the previous long question's scroll position.
    const energyBar = el('mvpark-energy-bar');
    if(energyBar && quiz && quiz.questions) {
      const pct = Math.min(100, Math.round(((quiz.index + 1) / quiz.questions.length) * 100));
      energyBar.style.width = pct + '%';
    }
    shuffle(['A','B','C','D']).forEach((original,index)=>{
      const letterChar = 'ABCD'[index];
      const btn=document.createElement('button');btn.type='button';
      btn.className='mvpark-answer mvpark-answer-'+letterChar.toLowerCase();
      btn.dataset.original=original;
      btn.dataset.letter=letterChar;
      const letter=document.createElement('strong');
      letter.className='mvpark-badge mvpark-badge-'+letterChar.toLowerCase();
      letter.textContent=letterChar;
      const content=document.createElement('span');
      addSegments(content,q.choice_segments?.[original]||[{t:'txt',v:q.choices[original]}]);
      btn.append(letter,content);btn.addEventListener('click',()=>answer(original,btn));answers.appendChild(btn);
    });
  }
  lotButton.addEventListener('click',()=>{
    if(!quiz||quiz.mode!==2||quiz.revealed||quiz.locked)return;
    quiz.revealed=true;park.drawFortuneLot();playTripleMokugyo();renderQuestion();
    notice('Đã bốc quẻ số '+(quiz.index+1)+'. Hãy chọn A, B, C hoặc D.');
  });

  const SUCCESS_TITLE={
    0:'HỌC BÁ CHUỒNG GÀ',
    1:'HỌC BÁ TÊN LỬA',
    2:'THÍCH HỌC BÁ',
    3:'HỌC BÁ CẦU KÍNH',
    6:'HỌC BÁ KIẾN TRÚC SƯ',
    8:'HỌC BÁ TÀU LƯỢN SIÊU TỐC',
    9:'HỌC BÁ TRÍ TUỆ',
    4:'HỌC BÁ KÉO CO',5:'HỌC BÁ RONALDO',10:'HỌC BÁ TRIỆU PHÚ TOÁN HỌC'
  };
  function gameEvent(mode,success){
    if(success){
      if(mode===0)park.kickEnemy();
      else if(mode===1)park.correctRocket();
      else if(mode===2){playWoodblock();park.correctSanctuary?.();}
      else if(mode===3)park.correctBridge();
      else if(mode===4)park.correctTug();
      else if(mode===5)park.correctSoccer();
      else if(mode===10)park.correctMillionaire();
      else if(mode===6)park.correctArchitect();
      else if(mode===8)park.correctCoaster();
      else if(mode===9)park.correctBalloon();
    }else{
      if(mode===0)park.kickPlayer();
      else if(mode===1)park.failRocket();
      else if(mode===2){playWoodblock();park.failSanctuary?.();toSanctuaryDoor?.();}
      else if(mode===3)park.failBridge();
      else if(mode===4)park.failTug();
      else if(mode===5)park.failSoccer();
      else if(mode===10)park.failMillionaire();
      else if(mode===6)park.failArchitect();
      else if(mode===8)park.failCoaster();
      else if(mode===9)park.failBalloon();
      playFailEffect(mode);
    }
  }
  function answer(choice,clicked){
    if(!quiz||quiz.locked||!quiz.revealed)return;
    quiz.locked=true;
    // Tự động thu gọn popup câu hỏi khi trả lời Đúng hoặc Sai để người dùng xem trọn vẹn hoạt ảnh 3D
    autoCollapseForAnimation();
    const expected=quiz.round[quiz.index].answer,mode=quiz.mode;
    const right=[...answers.children].find(b=>b.dataset.original===expected);
    for(const b of answers.children)b.disabled=true;
    right?.classList.add('correct');
    const t=token;
    if(choice!==expected){
      clicked.classList.add('wrong');
      gameEvent(mode,false);
      feedback.textContent={
        0:'Gà quán quân bị đá khỏi chuồng. Chơi lại từ đầu.',
        1:'Tên lửa cùng học sinh và NPC phóng lên trời với tiếng CHÍU kéo dài, rồi biến mất.',
        2:'MỜI THÍ CHỦ VỀ TU LUYỆN',
        3:'Kính vỡ, nhân vật rơi xuống nước! Nghe tiếng nước bắn tung tóe.',
        4:'NPC kéo dây về phía mình. Sai một câu, em thua cuộc!',
        5:'Thủ môn cản phá cú sút! Lượt chơi kết thúc, hãy chơi lại.',
        10:`MC: Câu trả lời chưa chính xác. Em giữ mốc bảo toàn ${guaranteedPrize(quiz.correct).toLocaleString('vi-VN')} điểm.`,
        6:'Ngôi nhà chưa hoàn thành vỡ thành nhiều mảnh!',
        8:'Toa tàu rẽ vào đường ray gãy rồi bay thẳng lên trời!',
        9:'Khinh khí cầu đang rơi xuống!'
      }[mode];
      feedback.dataset.result='wrong';
      delay(()=>{if(t===token)finish(false);},mode===1?2550:mode===3?1700:mode===8?2700:mode===9?2300:1650);
      return;
    }
    gameEvent(mode,true);
    quiz.correct++;
    if(mode===10&&MILLIONAIRE_MILESTONES.includes(quiz.correct)){
      const prize=MILLIONAIRE_PRIZES[quiz.correct-1];
      notice(`🏅 AI LÀ TRIỆU PHÚ: Đã đạt mốc câu ${quiz.correct}/15 – bảo toàn ${prize.toLocaleString('vi-VN')} điểm ảo!`);
      soundSweep(440,880,.6,'sine',.075);
    }
    feedback.dataset.result='correct';
    feedback.textContent={
      0:'Một gà đối thủ vừa bị gà quán quân đá ra khỏi vòng!',
      1:'Nạp năng lượng tên lửa và tiếp tục hành trình!',
      2:'Giải đúng quẻ Toán! Mời tiếp tục bốc quẻ.',
      3:'Bước thêm một ô kính. Nước xanh hiện rõ ngay bên dưới!',
      4:'Em kéo thắng một nhịp! Dây chuyển về phía học sinh.',
      5:'VÀO! Thủ môn không cản được. Em ghi thêm một bàn thắng!',
      10:`MC: Chính xác! Em vừa vượt qua câu ${quiz.index+1}/15.`,
      6:'Lắp thêm một bộ phận ngôi nhà 3D!',
      8:'Toa tàu vượt thêm một đoạn ray uốn lượn!',
      9:'Khinh khí cầu ổn định và chuẩn bị bay ngắm cảnh!'
    }[mode];
    if(quiz.correct===quiz.round.length){
      if(mode===1)park.winRocket();
      if(mode===8)park.winCoaster();
      if(mode===9){
        park.winBalloon();
        // Tự động chuyển về Góc nhìn Mắt (trong giỏ khinh khí cầu) để quan sát toàn cảnh 3D trong 1 phút (60s)!
        quiz.balloonView='eye';
        enterGameMode?.(9,'eye');
        updateCameraButton();
        autoCollapseForAnimation();
        feedback.textContent='🎈 CHIẾN THẮNG 10/10! Đang ở Góc nhìn Mắt ngắm toàn cảnh Sảnh, LAB, Discovery, Bảo tàng & Công viên (60 giây). Nhấn nút Góc nhìn hoặc cuộn chuột để đổi Gần/Xa!';
        notice('🎈 HỌC BÁ TRÍ TUỆ: Tự động chuyển sang Góc nhìn Mắt trên Khinh khí cầu bay 60 giây! Nhấn C hoặc nút Góc nhìn để xem Khinh khí cầu từ Gần/Xa.');
        for(let sec=1;sec<60;sec++){
          delay(()=>{
            if(t===token&&quiz?.mode===9){
              const rem=60-sec;
              title.textContent=`🎈 BAY THAM QUAN TOÀN CẢNH · Còn ${rem}s`;
              feedback.textContent=`🎈 Hành trình bay 1 phút (${rem}s còn lại) · Nhấn nút Góc nhìn (hoặc phím C / cuộn chuột) để chuyển đổi Góc nhìn Mắt / Gần / Xa!`;
            }
          },sec*1000);
        }
      }
      delay(()=>{if(t===token)finish(true);},mode===9?60000:mode===1?2900:mode===8?2450:1500);
      return;
    }
    delay(()=>{
      if(t!==token)return;
      quiz.index++;quiz.revealed=mode!==2;renderQuestion();
    },mode===2?1650:mode===3?1750:1950);
  }
  function finish(success){
    if(!quiz)return;
    game.classList.remove('watching-3d-anim');
    question.replaceChildren();answers.replaceChildren();lotButton.hidden=true;
    win.hidden=false;
    const mode=quiz.mode;
    const failureTitle={
      0:'GÀ CỦA EM BỊ LOẠI',1:'TÊN LỬA ĐÃ BIẾN MẤT',2:'MỜI THÍ CHỦ VỀ TU LUYỆN',
      3:'RƠI XUỐNG NƯỚC',4:'NPC ĐÃ THẮNG KÉO CO',5:'THỦ MÔN CẢN PHÁ',6:'NGÔI NHÀ ĐỔ VỠ',8:'RAY GÃY – TÀU BAY LÊN TRỜI',9:'KHINH KHÍ CẦU RƠI',10:'GHẾ NÓNG ĐÃ DỪNG LẠI'
    };
    el('mvpark-result-heading').textContent=success?'🏆 '+SUCCESS_TITLE[mode]:'❌ '+failureTitle[mode];
    el('mvpark-result-text').textContent=success?
      (mode===10?'15/15: Đạt mốc thứ ba và nhận giải thưởng 1.000.000 điểm học tập (điểm ảo).':
       mode===4?'10/10: Kéo hết dây về phía học sinh, NPC thua cuộc.':
       mode===5?'10/10: Ghi đủ 10 bàn thắng và nhận Học Bá Ronaldo.':
       mode===9?'10/10: Đã hoàn thành chuyến bay ngắm cảnh toàn khu và trở về bến an toàn.':
       mode===8?'10/10: Toa tàu đi nhánh an toàn và về ga cuối.':
       mode===6?'10/10: Đã lắp đầy đủ 10 bộ phận thành ngôi nhà hoàn chỉnh.':
       mode===3?'10/10: Đã vượt qua 10 nhịp cầu kính trong suốt.':
       'Xuất sắc! Đã hoàn thành 10/10 câu hỏi từ kho của giáo viên.'):
      (mode===2?'Mời thí chủ về tu luyện. Trở lại cửa phòng, hẹn gặp lại.':
       mode===10?`Em trả lời đúng ${quiz.correct}/15 câu. Mốc điểm bảo toàn: ${guaranteedPrize(quiz.correct).toLocaleString('vi-VN')} điểm ảo.`:
       'Sai 1 câu: lượt chơi kết thúc, cần bắt đầu lại từ câu 1.');
    el('mvpark-retry').textContent=mode===2?'🚪 Về cửa phòng':'↻ Chơi lại từ đầu';
    feedback.textContent=success?(mode===10?'15/15 – Đã nhận danh hiệu!':'10/10 – Đã nhận danh hiệu!'):'Thử thách kết thúc!';
    feedback.dataset.result=success?'correct':'wrong';
    const trophy = el('mvpark-trophy-badge');
    if(trophy) trophy.hidden = !success;
    if(success) { launchVictoryConfetti(); playTriumphChime(); }
    if(mode===2){stopTempleSound();updateSoundButton();}
    notice(el('mvpark-result-heading').textContent);
  }

  function updateMillionaireUI(){
    if(!quiz||quiz.mode!==10)return;
    const flags=quiz.lifelines;
    for(const [type,id] of [['fifty','mvpark-help-fifty'],['audience','mvpark-help-audience'],['ai','mvpark-help-ai']]){
      const b=el(id);b.disabled=flags[type]||quiz.locked;b.textContent={fifty:'50:50',audience:'👥 Khán giả',ai:'🤖 Hỏi AI'}[type]+(flags[type]?' · đã dùng':'');
    }
    ladder.replaceChildren();
    for(let i=14;i>=0;i--){
      const item=document.createElement('div');item.className='mvpark-prize-item';
      item.classList.toggle('current',i===quiz.index);
      item.classList.toggle('milestone',MILLIONAIRE_MILESTONES.includes(i+1));
      item.textContent=`${String(i+1).padStart(2,'0')}  •  ${MILLIONAIRE_PRIZES[i].toLocaleString('vi-VN')} điểm`;
      ladder.appendChild(item);
    }
    if(quiz.index===0&&!lifelineResult.textContent)lifelineResult.textContent='3 trợ giúp, mỗi loại dùng một lần. Các gợi ý không thay cho lời giải.';
  }
  function millionaireHelp(type){
    if(!quiz||quiz.mode!==10||quiz.locked||quiz.lifelines[type])return;
    const correct=quiz.round[quiz.index].answer;
    quiz.lifelines[type]=true;
    if(type==='fifty'){
      const keep=new Set(fiftyFifty(correct));
      for(const b of answers.children)if(!keep.has(b.dataset.original)){b.disabled=true;b.classList.add('mvpark-help-removed');}
      lifelineResult.textContent='Đã loại chính xác 2 phương án sai. Còn lại đáp án đúng và 1 phương án sai.';
    }else if(type==='audience'){
      const res=audienceSimulation(correct);
      const parts=['A','B','C','D'].map(k=>{
        const button=[...answers.children].find(b=>b.dataset.original===k);
        return `${button?.querySelector('strong')?.textContent||k}: ${res.votes[k]}%`;
      });
      lifelineResult.textContent='Lựa chọn của khán giả trong trò chơi: '+parts.join(' · ');
    }else{
      const res=aiSimulation(correct);
      const button=[...answers.children].find(b=>b.dataset.original===res.suggestion);
      lifelineResult.textContent=`Gợi ý tự động (không phải AI trực tuyến): cân nhắc phương án ${button?.querySelector('strong')?.textContent||'?'}; hãy tự kiểm tra trước khi chọn.`;
    }
    updateMillionaireUI();
  }
  el('mvpark-help-fifty').addEventListener('click',()=>millionaireHelp('fifty'));
  el('mvpark-help-audience').addEventListener('click',()=>millionaireHelp('audience'));
  el('mvpark-help-ai').addEventListener('click',()=>millionaireHelp('ai'));

  let mazeTimer=null;
  const clearMazeTimer=()=>{if(mazeTimer!==null){clearTimeout(mazeTimer);mazeTimer=null;}};
  function stopMazeAdventure(){
    clearMazeTimer();if(!maze)return;
    maze=null;mazeHud.hidden=true;park.exitMaze();leaveMazeMode?.();
  }
  function startMazeAdventure(){
    if(!park.gateOpen)return notice('Hãy mở cổng công viên trước.');
    clearGame();maze={level:1,preview:true,done:false};
    panel.hidden=true;game.hidden=true;modalBackdrop.hidden=true;mazeHud.hidden=false;
    startMazeLevel(1);notice('Mê cung: nhìn toàn cảnh đúng một lần trước khi tự tìm lối ra!');
  }
  function startMazeLevel(level){
    if(!maze)return;
    clearMazeTimer();maze.level=level;maze.preview=true;maze.done=false;
    const data=park.startMazeLevel(level);
    enterMazeMode?.(data.start,'maze_preview',data.startYaw||0);
    mazeLevelEl.textContent=`MÀN ${level}/8 · ${data.size}×${data.size} Ô`;
    mazeInfoEl.textContent=`Quan sát mũi tên duy nhất từ lối vào đến lối ra trong 6 giây. ${data.deadEnds} ngõ cụt (${data.deepDeadEnds} ngõ cụt sâu), đường đúng dài ${data.solutionLength} ô. Mỗi lượt chơi là một mê cung mới!`;
    el('mvpark-maze-restart').hidden=true;
    mazeTimer=setTimeout(()=>{
      if(!maze||maze.level!==level)return;
      maze.preview=false;park.showMazeRoute(false);enterMazeMode?.(data.start,'maze_walk',data.startYaw||0);
      mazeInfoEl.textContent='Đi từ CỬA VÀO (Xanh Ngọc Lục Bảo) tìm tới CỬA RA (Đỏ Ruby - Vàng Hoàng Gia có cột sáng cao) bằng W/A/S/D (Q/←→ để xoay). Space để nhảy.';
    },6000);
  }
  function reachMazeExit(){
    if(!maze||maze.preview||maze.done||!park.mazeActive)return;
    maze.done=true;maze.preview=true;
    const level=maze.level;
    if(level===8){
      mazeLevelEl.textContent='🏆 HỌC BÁ MÊ CUNG';
      mazeInfoEl.textContent='Em đã giải đủ 8 mê cung, tự tìm lối ra bằng tư duy không gian!';
      el('mvpark-maze-restart').hidden=false;
      notice('HỌC BÁ MÊ CUNG · Hoàn thành 8/8 màn!');
    }else{
      mazeInfoEl.textContent=`Xuất sắc! Màn ${level}/8 hoàn thành. Chuẩn bị mê cung tiếp theo...`;
      mazeTimer=setTimeout(()=>{if(maze&&maze.level===level)startMazeLevel(level+1);},1700);
    }
  }
  const camCycleBtn=el('mvpark-cam-cycle');
  if(camCycleBtn&&cycleCamera){
    camCycleBtn.addEventListener('click',()=>cycleCamera());
  }
  const mazeCamBtn=el('mvpark-maze-cam');
  if(mazeCamBtn&&cycleCamera){
    mazeCamBtn.addEventListener('click',()=>cycleCamera());
  }
  el('mvpark-maze-exit').addEventListener('click',()=>{stopMazeAdventure();showZone(7);});
  el('mvpark-maze-restart').addEventListener('click',()=>{stopMazeAdventure();startMazeAdventure();});
  return {
    showGate,showZone,startQuiz,hide,toggle,reachMazeExit,
    get mazeActive(){return Boolean(maze);},get mazePreview(){return Boolean(maze?.preview);},
    get isOpen(){return !panel.hidden||!game.hidden||Boolean(maze);},
    get quiz(){return quiz;},
    get currentZone(){return currentZone;},
    speak,
    stopTempleSound,
    showSanctuaryNpc(){if(!park.sanctuaryActive)return;showZone(2,true);},
  };
}
