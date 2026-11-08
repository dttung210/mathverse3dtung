/**
 * MATHVERSE R74 exhibition core UI, mounted in a shadow root.
 * All original SGK Lab implementations, mathematics engines and routing remain untouched.
 * A 3D wall-frame from the exhibition opens this dialog via CustomEvent.
 */
import {PEOPLE,PEOPLE_BY_ID} from './people.mjs';
import {getPortrait} from './storage.mjs';
import {diagramFor} from './diagrams.mjs';
import {PROFILES} from './profiles.mjs';
import {initGeometryWorkshops} from './workshop.mjs';
import {initWallModelViewer} from './wall-viewer.mjs';

const MATH_TYPOGRAPHY = {
  'pythagoras': '<i>a</i><sup>2</sup> + <i>b</i><sup>2</sup> = <i>c</i><sup>2</sup>',
  'euclid': '<i>a</i> ∥ <i>b</i> &nbsp;⟹&nbsp; <span style="border-top:1.5px solid currentColor;display:inline-block;padding-top:1px;"><i>A</i><sub>1</sub></span> = <span style="border-top:1.5px solid currentColor;display:inline-block;padding-top:1px;"><i>B</i><sub>1</sub></span> &nbsp; <small style="opacity:0.85;font-size:0.75em;">(hai góc so le trong bằng nhau)</small>',
  'archimedes': '<i>V</i><sub>cầu</sub> = <span class="math-frac"><span class="num">4</span><span class="den">3</span></span> π<i>r</i><sup>3</sup> = <span class="math-frac"><span class="num">2</span><span class="den">3</span></span> <i>V</i><sub>trụ</sub>',
  'fibonacci': '<i>F</i><sub><i>n</i>+2</sub> = <i>F</i><sub><i>n</i>+1</sub> + <i>F</i><sub><i>n</i></sub>',
  'descartes': '<i>M</i>(<i>x</i>; <i>y</i>)',
  'fermat': '<i>P</i>(<i>A</i>) = <span class="math-frac"><span class="num"><i>n</i>(<i>A</i>)</span><span class="den"><i>n</i>(Ω)</span></span>',
  'pascal': 'C<sub><i>n</i></sub><sup><i>k</i></sup> = C<sub><i>n</i>−1</sub><sup><i>k</i>−1</sup> + C<sub><i>n</i>−1</sub><sup><i>k</i></sup>',
  'newton': '<i>v</i>(<i>t</i>) = <i>s</i>′(<i>t</i>) &nbsp; <small style="opacity:0.85;font-size:0.75em;">(vận tốc tức thời bằng đạo hàm quãng đường)</small>',
  'leibniz': '<span style="font-size:1.3em;line-height:1;vertical-align:-0.15em;">∫</span><sub><i>a</i></sub><sup><i>b</i></sup> <i>f</i>(<i>x</i>) <i>dx</i> &nbsp; <small style="opacity:0.85;font-size:0.75em;">(diện tích hình phẳng dưới đồ thị)</small>',
  'euler': '<i>V</i> − <i>E</i> + <i>F</i> = 2 &nbsp; <small style="opacity:0.85;font-size:0.75em;">(Đỉnh − Cạnh + Mặt = 2 cho đa diện lồi)</small>',
  'gauss': '1 + 2 + ⋯ + <i>n</i> = <span class="math-frac"><span class="num"><i>n</i>(<i>n</i> + 1)</span><span class="den">2</span></span>',
  'luong-the-vinh': '<span class="math-frac"><span class="num"><i>H</i></span><span class="den"><i>h</i></span></span> = <span class="math-frac"><span class="num"><i>L</i></span><span class="den">ℓ</span></span> &nbsp;⟹&nbsp; <i>H</i> = <span class="math-frac"><span class="num"><i>h</i> · <i>L</i></span><span class="den">ℓ</span></span> &nbsp; <small style="opacity:0.85;font-size:0.75em;">(Đo chiều cao bằng bóng nắng và tam giác đồng dạng)</small>',
  'ngo-bao-chau': '<i>P</i> ⟹ <i>Q</i> &nbsp; <small style="opacity:0.85;font-size:0.75em;">(Quy trình chứng minh suy luận logic và hình học tọa độ)</small>',
  'al-khwarizmi': '<i>a</i><i>x</i> + <i>b</i> = <i>c</i> &nbsp; (<i>a</i> ≠ 0)',
  'sophie-germain': '<i>p</i> ∈ ℙ, &nbsp; 2<i>p</i> + 1 ∈ ℙ &nbsp; <small style="opacity:0.85;font-size:0.75em;">(Số nguyên tố Sophie Germain)</small>',
  'ada-lovelace': '<i>S</i><sub><i>n</i></sub> = 1 + 2 + ⋯ + <i>n</i> = <span style="font-size:1.15em;vertical-align:-0.1em;">∑</span><sub><i>k</i>=1</sub><sup><i>n</i></sup> <i>k</i>',
  'emmy-noether': '<i>f</i>(−<i>x</i>) = <i>f</i>(<i>x</i>) &nbsp; <small style="opacity:0.85;font-size:0.75em;">(Tính đối xứng và tính chất bất biến)</small>',
  'maryam-mirzakhani': '<i>s</i> = <i>R</i> · <i>θ</i> &nbsp; <small style="opacity:0.85;font-size:0.75em;">(<i>θ</i> tính bằng radian, độ dài cung trên mặt cong)</small>'
};

const HOOK='__MATHVERSE_EXHIBITION_CORE_R74__';
if(!window[HOOK]){
  const tools=initGeometryWorkshops();
  const walls=initWallModelViewer();
  const root='/src/exhibition/';
  const host=document.createElement('div');host.id='mv-history-gallery-ui';
  const shadow=host.attachShadow({mode:'open'});
  const css=document.createElement('link');css.rel='stylesheet';css.href=root+'gallery.css';shadow.append(css);
  const outer=document.createElement('div');
  outer.innerHTML=`
    <div id="exhibition-float-bar" hidden>
      <button id="entrance" type="button" title="Mở bộ sưu tập các nhà toán học trong phòng Triển lãm" hidden>▣ Khung danh nhân Toán học</button>
      <button id="exhibition-tts-room" class="exh-nav-btn tts" type="button" title="Nghe thuyết minh Tiếng Việt về Phòng Triển lãm Danh nhân Toán học">🔊 Thuyết minh Phòng Triển lãm</button>
      <button id="exhibition-to-lab-lobby" class="exh-nav-btn lab" type="button" title="Quay ra Sảnh Trung tâm tòa Lab">🏛 Ra Sảnh Lab</button>
      <button id="exhibition-to-campus-lobby" class="exh-nav-btn campus" type="button" title="Quay về Sảnh Chính 4 Khu vực">🌐 Về Sảnh Chính</button>
    </div>
    <section id="dialog" role="dialog" aria-label="Triển lãm các nhà toán học" aria-modal="true" hidden>
      <div id="window">
        <header>
          <div><h2>▣ BẢO TÀNG DANH NHÂN TOÁN HỌC</h2><p>${PEOPLE.length} chân dung · Tiểu sử và công trình sát ảnh · 2 xưởng GeoGebra và 14 tranh hành lang</p></div>
          <div class="header-actions"><button type="button" id="header-tts" style="background:#5b21b6;border-color:#c084fc">🔊 Đọc Tiểu sử</button><button type="button" id="header-2d">Xưởng 2D</button><button type="button" id="header-3d">Xưởng 3D</button><button type="button" id="header-walls">14 tranh hành lang</button><button type="button" id="header-main-lobby" style="background:#0f52ba;border-color:#7dd3fc">🌐 Về Sảnh Chính</button><button type="button" id="close">✕ Quay về phòng Triển lãm</button></div>
        </header>
        <div id="content">
          <div id="collection" aria-label="Chọn nhà toán học"></div>
          <article id="details">
            <div id="dtitle"></div>
            <div id="meta"></div>
            <div id="person-profile"><img id="detail-image" alt="Chân dung nhà toán học"/><div class="profile-text"><strong class="part-label">TIỂU SỬ NGẮN</strong><p id="bio"></p><strong class="part-label">CÔNG TRÌNH LIÊN QUAN SGK</strong><ul id="related-works"></ul></div></div>
            <strong id="worktitle"></strong>
            <p id="desc"></p>
            <div id="workgrade"></div>
            <div id="diagram"></div>
            <div id="formula" aria-label="Công thức toán học"></div>
            <p id="historical-note"></p>
            <div id="actions">
              <button id="speak-person-btn" class="primary" type="button" style="background:#6d28d9;border-color:#c084fc">🔊 Đọc toàn bộ lời thoại & tiểu sử</button>
              <button id="go-lab" class="primary" type="button">Mở mô hình SGK liên quan</button>
              <a id="commons" href="#" rel="noopener noreferrer" target="_blank">Nguồn ảnh tư liệu</a>
            </div>
            <div id="status" role="status" aria-live="polite"></div>
            <div id="credit">Ảnh minh họa có nguồn và giấy phép công khai. Các chân dung cổ đại/trung đại thường là hình tượng được sáng tác về sau.</div>
          </article>
        </div>
      </div>
    </section>`;
  shadow.append(outer);document.body.append(host);
  const $=id=>shadow.getElementById(id);
  let active=false,selectedId=PEOPLE[0].id,previousFocus=null,available={},allThumbs=new Map(),lastSavedUrls=new Map();
  const portraitURL=(p)=>available[p.id]?root+'assets/'+p.asset:p.imageUrl;
  const svgPlaceholder=(p)=>`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 420"><rect width="360" height="420" rx="18" fill="#112b40"/><circle cx="180" cy="155" r="58" fill="#294e64"/><path d="M90 365Q180 222 270 365" fill="#294e64"/><text x="180" y="402" fill="#f0d195" font-family="Arial" font-size="19" text-anchor="middle">${p.name}</text></svg>`)}`;
  const showStatus=t=>{$('status').textContent=t||'';};
  async function thumbURL(p){
    const blob=await getPortrait(p.id).catch(()=>null);
    if(blob){
      const old=lastSavedUrls.get(p.id);if(old)URL.revokeObjectURL(old);
      const u=URL.createObjectURL(blob);lastSavedUrls.set(p.id,u);return u;
    }
    return portraitURL(p);
  }
  async function updateThumb(p){
    const img=allThumbs.get(p.id);if(!img)return;
    img.alt='Ảnh minh họa '+p.name;
    img.onerror=()=>{img.onerror=null;img.src=svgPlaceholder(p);};
    img.src=await thumbURL(p);
    if(p.id===selectedId){const big=$('detail-image');big.alt='Chân dung minh họa '+p.name;big.onerror=()=>{big.onerror=null;big.src=svgPlaceholder(p);};big.src=img.src;}
  }
  function renderCards(){
    const list=$('collection');list.replaceChildren();allThumbs=new Map();
    for(const p of PEOPLE){
      const b=document.createElement('button');b.type='button';b.className='person';b.dataset.id=p.id;
      b.setAttribute('aria-pressed',String(p.id===selectedId));
      const img=document.createElement('img');img.loading='lazy';img.alt='Ảnh '+p.name;
      const strong=document.createElement('strong');strong.textContent=p.displayName||p.vietnamese+' · '+p.name;
      const small=document.createElement('small');small.textContent=p.grade+' · '+p.contribution;
      b.append(img,strong,small);list.append(b);allThumbs.set(p.id,img);
      b.addEventListener('click',()=>choose(p.id));void updateThumb(p);
    }
  }
  function choose(id){
    const p=PEOPLE_BY_ID.get(id);if(!p)return;
    selectedId=id;
    for(const b of shadow.querySelectorAll('button.person'))b.setAttribute('aria-pressed',String(b.dataset.id===id));
    $('dtitle').textContent=p.displayName||p.vietnamese+' — '+p.name;
    $('meta').textContent=p.period+' | '+p.group;
    const profile=PROFILES[p.id];
    $('bio').textContent=profile?.bio||p.summary;
    const works=$('related-works');works.replaceChildren();
    for(const [title,desc,linkGrade] of (profile?.works||[[p.contribution,p.work,p.grade]])) {
      const li=document.createElement('li');const b=document.createElement('strong');b.textContent=title+' ('+linkGrade+')';const note=document.createElement('span');note.textContent=' – '+desc;li.append(b,note);works.append(li);
    }
    void thumbURL(p).then(url=>{if(selectedId===p.id){const img=$('detail-image');img.onerror=()=>{img.onerror=null;img.src=svgPlaceholder(p);};img.alt='Chân dung minh họa '+p.name;img.src=url;}});
    $('worktitle').textContent=p.contribution+' · '+p.work;
    $('desc').textContent=p.summary+' '+p.demo;
    $('workgrade').textContent='Liên hệ: '+p.gradeNote;
    $('diagram').innerHTML=diagramFor(p); // Trusted diagrams generated entirely from static data.
    $('formula').innerHTML=MATH_TYPOGRAPHY[p.id]||p.formula;
    $('historical-note').textContent=p.portraitNote;
    $('commons').href=p.commons;
    $('commons').textContent=p.imageIsGenerated?'Ảnh tư liệu tham khảo':'Nguồn ảnh';
    $('credit').textContent=p.mediaLicense+' · Wikimedia Commons. '+p.portraitNote;
    $('go-lab').dataset.modeId=p.modeId;
    showStatus('');
  }
  $('go-lab').addEventListener('click',()=>{
    const modeId=PEOPLE_BY_ID.get(selectedId)?.modeId;
    if(typeof window.navigateToMode!=='function'){showStatus('Chưa có hàm mở Lab gốc trong phiên này. Cô có thể tra cứu mã '+modeId+' trong Kho SGK.');return;}
    close();try{window.navigateToMode(modeId);}catch(err){console.warn('[MV History Gallery] Lab routing:',err);}
  });
  function handleKey(e){
    if(!active)return;
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();return;}
    // Isolate museum WASD movement while a full-screen educational dialog is open.
    if(['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)&& !e.target?.matches?.('input,textarea')){
      e.stopImmediatePropagation();e.preventDefault();
    }
  }
  async function open(id){
    previousFocus=document.activeElement;
    active=true;$('dialog').hidden=false;
    document.exitPointerLock?.();
    window.addEventListener('keydown',handleKey,true);
    choose(id&&PEOPLE_BY_ID.has(id)?id:selectedId);
    $('close').focus();
  }
  function close(){
    if(!active)return;active=false;$('dialog').hidden=true;
    window.removeEventListener('keydown',handleKey,true);
    if(previousFocus?.isConnected)previousFocus.focus?.();else $('entrance').focus();
  }
  function speakCurrentPerson(){
    const p=PEOPLE_BY_ID.get(selectedId);if(!p)return;
    const profile=PROFILES[p.id];
    const worksText=(profile?.works||[[p.contribution,p.work,p.grade]]).map(([t,d,g])=>`${t} (${g}): ${d}`).join('. ');
    const fullText=`Danh nhân Toán học: ${p.displayName||p.vietnamese}, tên quốc tế ${p.name}. Thời kỳ: ${p.period}, nhóm: ${p.group}. Tiểu sử: ${profile?.bio||p.summary}. Công trình tiêu biểu: ${p.contribution}, ${p.work}. Chi tiết: ${p.summary} ${p.demo}. Liên hệ chương trình: ${p.gradeNote}. Các công trình liên quan sách giáo khoa: ${worksText}.`;
    if(window.__mathverseSpeakText)window.__mathverseSpeakText(fullText);
    else if(window.parent?.__mathverseSpeakText)window.parent.__mathverseSpeakText(fullText);
    else if('speechSynthesis' in window){window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(fullText);u.lang='vi-VN';window.speechSynthesis.speak(u);}
    showStatus('🔊 Đang đọc thuyết minh toàn bộ tiểu sử & công trình...');
  }
  function returnToMainLobbyFromExhibition(){
    close();
    if(window.parent&&window.parent!==window){
      window.parent.postMessage({type:'mathverse-r75-return-lobby'},'*');
      window.parent.__returnToMainCampusLobby?.();
    }else{
      window.__returnToMainCampusLobby?.();
    }
  }
  $('entrance').addEventListener('click',()=>void open());
  $('exhibition-tts-room')?.addEventListener('click',()=>{
    const roomIntro=`Chào mừng bạn đến với Phòng Triển Lãm Danh Nhân Toán Học của Thầy Tùng! Tại đây trưng bày 18 chân dung các nhà toán học vĩ đại của Việt Nam và Thế giới như Lương Thế Vinh, Ngô Bảo Châu, Pythagoras, Euclid, Archimedes, Euler, Gauss, Newton, cùng 2 bục Xưởng vẽ hình 2D và 3D GeoGebra ở giữa phòng. Bạn hãy nhấp chuột vào từng bức chân dung hoặc bấm nút Khung danh nhân Toán học để nghe thuyết minh chi tiết, hoặc bấm Về Sảnh Chính để ra đại sảnh 4 khu vực.`;
    if(window.__mathverseSpeakText)window.__mathverseSpeakText(roomIntro);
    else if(window.parent?.__mathverseSpeakText)window.parent.__mathverseSpeakText(roomIntro);
  });
  $('exhibition-to-lab-lobby')?.addEventListener('click',()=>{
    close();
    window.dispatchEvent(new CustomEvent('mathverse:exhibition-exit-to-lab-lobby'));
  });
  $('exhibition-to-campus-lobby')?.addEventListener('click',returnToMainLobbyFromExhibition);
  $('header-tts')?.addEventListener('click',speakCurrentPerson);
  $('speak-person-btn')?.addEventListener('click',speakCurrentPerson);
  $('header-main-lobby')?.addEventListener('click',returnToMainLobbyFromExhibition);
  $('header-2d').addEventListener('click',()=>{close();void tools.open('2d');});
  $('header-3d').addEventListener('click',()=>{close();void tools.open('3d');});
  $('header-walls').addEventListener('click',()=>{close();walls.open();});
  $('close').addEventListener('click',close);
  $('dialog').addEventListener('click',e=>{if(e.target===$('dialog'))close();});
  window.addEventListener('mathverse:history-open',e=>void open(e.detail?.id));
  window.addEventListener('mathverse:history-nearby',e=>{
    const near=Boolean(e.detail?.near);
    $('entrance').hidden=!near;
    if($('exhibition-float-bar'))$('exhibition-float-bar').hidden=!near;
  });
  void fetch(root+'assets/available.json').then(r=>r.ok?r.json():{}).then(data=>{available=data||{};renderCards();choose(selectedId);}).catch(()=>{renderCards();choose(selectedId);});
  window[HOOK]=Object.freeze({open,close,count:PEOPLE.length,getSelected:()=>selectedId});
}
