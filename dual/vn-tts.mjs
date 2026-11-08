/**
 * MATHVERSE TOÁN HỌC MR.TUNG 3D — BỘ MÁY GIỌNG ĐỌC, HIỂU & THUYẾT MINH TIẾNG VIỆT TOÀN DIỆN (R107_V15)
 * 1. Đọc thuyết minh Tiếng Việt chuẩn tự nhiên 100% (Google Tiếng Việt Neural Audio + Web Speech vi-VN + Preload Queue).
 * 2. Không bao giờ dùng giọng Tiếng Anh (Microsoft David/Zira) để đọc văn bản Tiếng Việt trên Cốc Cốc / Windows.
 * 3. Thanh phụ đề thuyết minh trực tiếp (#mv-vn-subtitle-bar) hiển thị từng câu Thầy Tùng đang giảng.
 * 4. Hiểu ký hiệu/công thức Toán học Tiếng Việt & Nhận diện giọng nói Tiếng Việt (Web Speech Recognition vi-VN).
 */

export const ZONE_VOICE_GUIDES = Object.freeze({
  lobby:
    'Chào mừng các em học sinh và quý thầy cô đến với Đại Sảnh Trung Tâm của MathVerse Toán Học Thầy Tùng ba đê! ' +
    'Ở chính giữa quảng trường là Đài phun nước Dải vô cực Mơ-bi-út và Thầy Tùng đang chờ hướng dẫn các em. ' +
    'Từ Đại Sảnh, các em hãy đi qua bốn Cổng Chính để trống ở bốn hướng Đông, Tây, Nam, Bắc. ' +
    'Bốn góc chéo đã được xây Cửa Trắng đóng kín kèm biển báo để các em không đi nhầm. ' +
    'Cổng phía Tây dẫn vào Tòa Lab Toán Học với ba trăm mười mô hình sách giáo khoa từ Lớp sáu đến Lớp mười hai và Phòng Triển lãm mười tám Danh nhân Toán học. ' +
    'Cổng phía Đông dẫn vào Bảo Tàng Toán Học với hai trăm ba mươi bức tranh Infographic trực quan. ' +
    'Cổng phía Bắc dẫn vào Khu Khám Phá Discovery ba đê với Quả cầu Trái Đất và ba mươi lăm kỳ quan kiến trúc thế giới trên ba tầng. ' +
    'Cổng phía Nam dẫn vào Công Viên Giải Trí Wonder Park với mười một trò chơi toán học thực tế và chuyến bay Khinh khí cầu ngắm toàn cảnh một phút. ' +
    'Các em có thể nhấn phím Shift hoặc bấm nút Xe Đạp trên màn hình để chạy xe đạp tăng tốc, hoặc bấm nút Nói Tiếng Việt để trò chuyện và ra lệnh bằng giọng nói với Thầy Tùng!',
  r75:
    'Chào mừng các em đến với Tòa Nhà Lab Toán Học ba đê của Thầy Tùng! ' +
    'Tòa nhà gồm Sảnh Trung Tâm, bảy khu vực phòng học từ Lớp sáu đến Lớp mười hai với ba trăm mười mô hình toán học tương tác, mười bốn bảng toán học động dọc hành lang, và Phòng Triển Lãm Danh Nhân Toán Học ở phía Đông Bắc. ' +
    'Trong mỗi phòng học, các em nhấp chuột vào mô hình ba đê hoặc bấm Kho Sách Giáo Khoa để điều chỉnh thanh trượt, xem mặt cắt thiết diện, trải phẳng hình học không gian và nghe Thầy Tùng thuyết minh công thức. ' +
    'Tại Phòng Triển Lãm, các em có thể chiêm ngưỡng mười tám chân dung danh nhân toán học, mở Xưởng vẽ hình hai đê và ba đê GeoGebra, nghe đọc tiểu sử đầy đủ, hoặc bấm nút Về Sảnh Chính ở thanh trên cùng bất cứ lúc nào.',
  museum:
    'Chào mừng các em đến với Bảo Tàng Toán Học Infographic ba đê của Thầy Tùng! ' +
    'Bảo tàng được thiết kế như một cung điện nghệ thuật gồm Sảnh Vòm Trung Tâm và bảy phòng trưng bày theo khối Lớp sáu, Lớp bảy, Lớp tám, Lớp chín, Lớp mười, Lớp mười một và Lớp mười hai với tổng cộng hai trăm ba mươi bức tranh đồ họa kiến thức. ' +
    'Các em hãy đi dạo qua từng phòng hoặc dùng nút chọn phòng nhanh trên màn hình, nhấp chuột vào bất kỳ bức tranh nào để phóng to độ phân giải cao và bấm nút Thuyết minh Tiếng Việt để nghe Thầy Tùng giảng giải toàn bộ nội dung bài học trên tranh. ' +
    'Nhấn phím Shift hoặc nút Xe Đạp để di chuyển nhanh hơn trong bảo tàng, và bấm nút Về Sảnh Chính trên thanh công cụ khi muốn chuyển sang khu vực khác.',
  discovery:
    'Chào mừng các em đến với Khu Khám Phá Discovery ba đê — Toán Học Trong Kiến Trúc Và Vũ Trụ! ' +
    'Khu Discovery gồm năm không gian lớn: Sảnh Quả Cầu Trái Đất, Phòng Triển Lãm U-nét-xcô ba tầng với ba mươi lăm bục mô hình kiến trúc ba đê thực tế, Phòng Bản Đồ Thế Giới phẳng, Phòng Đại Số Hình Học, và Rạp Chiếu Phim Thiên Văn Vũ Trụ. ' +
    'Tại Phòng U-nét-xcô ba tầng, các em có thể đi cầu thang bộ hoặc bấm nút chuyển Tầng một, Tầng hai, Tầng ba để xoay các kỳ quan ba đê ngay trên bục, bấm phím E để xem ảnh tư liệu thật và nghe Thầy Tùng thuyết minh cấu trúc hình học của từng công trình.',
  park:
    'Chào mừng các em đến với Công Viên Giải Trí Toán Học Wonder Park ba đê của Thầy Tùng! ' +
    'Khu công viên gồm mười một trò chơi toán học phân khu riêng biệt rộng rãi: Đu Quay Lượng Giác, Tàu Lượn Parabol, Tháp Rơi Tự Do, Mê Cung ba đê nhiều tầng với Cổng Vào màu xanh ngọc và Cổng Ra màu vàng hoàng kim, Cầu Kính Xác Suất, Đấu Trường Đại Bác Góc Bắn, Nhảy Đệm Lò Xo Đồ Thị, Khinh Khí Cầu Tọa Độ, Đua Thuyền Véc-tơ, Vòng Xoay Hình Học Không Gian, và Sân Khấu Đố Vui Tốc Độ. ' +
    'Đặc biệt ở trò chơi Khinh Khí Cầu, khi giải đúng bài toán, các em sẽ được bay lên bầu trời ngắm toàn cảnh ba đê trong suốt một phút với đầy đủ nút chuyển đổi góc nhìn Mắt, Gần và Xa!'
});

export const MATH_KNOWLEDGE_QA = Object.freeze([
  {
    keywords: ['pythagore', 'pi ta go', 'pitago', 'pytago', 'tam giác vuông'],
    answer: 'Định lý Pi-ta-go phát biểu rằng: Trong một tam giác vuông, bình phương độ dài cạnh huyền bằng tổng bình phương độ dài hai cạnh góc vuông, công thức là a bình phương cộng b bình phương bằng c bình phương.'
  },
  {
    keywords: ['hình chóp', 'thể tích chóp', 'chóp đều'],
    answer: 'Thể tích của khối chóp bằng một phần ba diện tích mặt đáy nhân với chiều cao hạ từ đỉnh xuống đáy, công thức là V bằng một phần ba S đáy nhân h.'
  },
  {
    keywords: ['hình trụ', 'thể tích trụ', 'diện tích trụ'],
    answer: 'Hình trụ có diện tích xung quanh bằng hai pi nhân bán kính r nhân chiều cao h, và thể tích bằng pi nhân r bình phương nhân chiều cao h.'
  },
  {
    keywords: ['hình nón', 'thể tích nón'],
    answer: 'Hình nón có diện tích xung quanh bằng pi nhân bán kính đáy r nhân đường sinh l, và thể tích bằng một phần ba pi nhân r bình phương nhân chiều cao h.'
  },
  {
    keywords: ['hình cầu', 'mặt cầu', 'khối cầu'],
    answer: 'Mặt cầu có diện tích bằng bốn pi nhân bán kính R bình phương, và thể tích khối cầu bằng bốn phần ba pi nhân R lập phương.'
  },
  {
    keywords: ['trung trực', 'đường trung trực'],
    answer: 'Đường trung trực của đoạn thẳng A B là đường thẳng vuông góc với A B tại trung điểm M của nó. Khi dựng bằng thước và com-pa, ta vẽ hai đường tròn tâm A và tâm B có cùng bán kính bằng đoạn A B cắt nhau tại hai điểm P và Q, đường thẳng P Q chính là đường trung trực.'
  },
  {
    keywords: ['đạo hàm', 'cực trị', 'tiếp tuyến'],
    answer: 'Đạo hàm của hàm số f x tại điểm x không biểu thị tốc độ biến thiên tức thời và là hệ số góc của tiếp tuyến với đồ thị tại điểm đó. Khi đạo hàm đổi dấu qua điểm dừng, hàm số đạt cực đại hoặc cực tiểu.'
  },
  {
    keywords: ['tích phân', 'nguyên hàm'],
    answer: 'Tích phân xác định của hàm số f x từ a đến b biểu diễn diện tích hình phẳng giới hạn bởi đồ thị hàm số và trục hoành, được tính theo công thức Niu-tơn Lai-bơ-nít.'
  },
  {
    keywords: ['lượng giác', 'sin', 'cos', 'tan'],
    answer: 'Trong tam giác vuông: tìm sin lấy đối chia huyền, cô-sin hai cạnh kề huyền chia nhau, còn tan ta hãy tính sau, đối trên kề dưới chia nhau ra liền.'
  },
  {
    keywords: ['xác suất', 'biến cố'],
    answer: 'Xác suất cổ điển của một biến cố A bằng tỉ số giữa số kết quả thuận lợi cho biến cố A chia cho tổng số kết quả có thể xảy ra của phép thử ngẫu nhiên.'
  }
]);

let activeToken = 0;
let keepAliveTimer = null;
let currentAudio = null;
let preloadedAudio = null;
let speakingState = false;
let subtitleBar = null;
let recognitionInstance = null;
let listeningState = false;
const listeners = new Set();
const voiceCmdListeners = new Set();

function notifyListeners() {
  for (const fn of listeners) {
    try { fn(speakingState); } catch {}
  }
}

export function onSpeechStateChange(fn) {
  if (typeof fn === 'function') listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isSpeakingVietnamese() {
  return speakingState;
}

export function isListeningVietnamese() {
  return listeningState;
}

export function onVoiceCommandStateChange(fn) {
  if (typeof fn === 'function') voiceCmdListeners.add(fn);
  return () => voiceCmdListeners.delete(fn);
}

function notifyVoiceCmdListeners(statusText = '') {
  for (const fn of voiceCmdListeners) {
    try { fn(listeningState, statusText); } catch {}
  }
}

/**
 * Chuẩn hóa văn bản Toán học & LaTeX sang Tiếng Việt tự nhiên để giọng đọc phát âm chính xác 100%
 */
export function normalizeVietnameseMathText(raw) {
  if (!raw) return '';
  let text = String(raw)
    .replace(/<[^>]+>/g, ' ')
    // LaTeX fractions & roots
    .replace(/\\frac\s*\{\s*1\s*\}\s*\{\s*3\s*\}/g, ' một phần ba ')
    .replace(/\\frac\s*\{\s*1\s*\}\s*\{\s*2\s*\}/g, ' một phần hai ')
    .replace(/\\frac\s*\{\s*4\s*\}\s*\{\s*3\s*\}/g, ' bốn phần ba ')
    .replace(/\\frac\s*\{\s*([^}]+)\s*\}\s*\{\s*([^}]+)\s*\}/g, ' $1 phần $2 ')
    .replace(/\\sqrt\s*\{\s*([^}]+)\s*\}/g, ' căn bậc hai của $1 ')
    .replace(/√\s*([a-zA-Z0-9]+)/g, ' căn bậc hai của $1 ')
    .replace(/√/g, ' căn bậc hai ')
    // Common math subscripts & formulas
    .replace(/S_\{\s*xq\s*\}|S_xq/gi, ' diện tích xung quanh ')
    .replace(/S_\{\s*tp\s*\}|S_tp/gi, ' diện tích toàn phần ')
    .replace(/S_\{\s*đáy\s*\}|S_đáy|S_0/gi, ' diện tích đáy ')
    .replace(/\b1\/3\b/g, ' một phần ba ')
    .replace(/\b1\/2\b/g, ' một phần hai ')
    .replace(/\b2\/3\b/g, ' hai phần ba ')
    .replace(/\b3\/4\b/g, ' ba phần tư ')
    .replace(/\b4\/3\b/g, ' bốn phần ba ')
    .replace(/\^2\b|²/g, ' bình phương ')
    .replace(/\^3\b|³/g, ' lập phương ')
    .replace(/\^n\b/g, ' mũ n ')
    // LaTeX commands
    .replace(/\\pi\b|π/g, ' pi ')
    .replace(/\\varphi\b|\\phi\b|φ/g, ' phi ')
    .replace(/\\alpha\b|α/g, ' an-pha ')
    .replace(/\\beta\b|β/g, ' bê-ta ')
    .replace(/\\gamma\b|γ/g, ' gam-ma ')
    .replace(/\\Delta\b|Δ|∆/g, ' tam giác ')
    .replace(/\\perp\b|⊥/g, ' vuông góc với ')
    .replace(/\\parallel\b|∥/g, ' song song với ')
    .replace(/\\times\b|×/g, ' nhân ')
    .replace(/\\cdot\b/g, ' nhân ')
    .replace(/\\div\b|÷/g, ' chia ')
    .replace(/\\pm\b|±/g, ' cộng trừ ')
    .replace(/\\approx\b|≈/g, ' xấp xỉ ')
    .replace(/\\neq\b|≠/g, ' khác ')
    .replace(/\\leq\b|\\le\b|≤/g, ' nhỏ hơn hoặc bằng ')
    .replace(/\\geq\b|\\ge\b|≥/g, ' lớn hơn hoặc bằng ')
    .replace(/\\Rightarrow\b|⇒|⟹|->|→/g, ' suy ra ')
    .replace(/\\Leftrightarrow\b|⇔|⟺/g, ' tương đương ')
    .replace(/\\infty\b|∞/g, ' vô cực ')
    .replace(/\\int\b|∫/g, ' tích phân ')
    .replace(/\\sum\b|∑/g, ' tổng xích-ma ')
    .replace(/\\angle\b|\\widehat|∠/g, ' góc ')
    .replace(/°/g, ' độ ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[\{\}\$]/g, ' ')
    // Icons & bullets
    .replace(/[•·▪▸►◆◇★☆▣🏛🌐🧭🚲🔊🎙👁🔍🔭⚗▤🌍🎡✨⊞⤢✕✓]/g, '. ')
    // Vietnamese abbreviations & technical terms
    .replace(/\bOxyz\b/g, 'hệ tọa độ O x y z')
    .replace(/\bOxy\b/g, 'mặt phẳng tọa độ O x y')
    .replace(/\b3D\b/gi, 'ba đê')
    .replace(/\b2D\b/gi, 'hai đê')
    .replace(/\bSGK\b/gi, 'sách giáo khoa')
    .replace(/\bGDPT\b/gi, 'giáo dục phổ thông')
    .replace(/\bTHCS\b/gi, 'trung học cơ sở')
    .replace(/\bTHPT\b/gi, 'trung học phổ thông')
    .replace(/\bUNESCO\b/gi, 'U-nét-xcô')
    .replace(/\bInfographic\b/gi, 'tranh đồ họa kiến thức')
    .replace(/\bMr\.?\s*Tung\b/gi, 'Thầy Tùng')
    .replace(/\bWASD\b/gi, 'W A S D')
    .replace(/\s+/g, ' ')
    .trim();
  return text;
}

export function splitIntoSpeechChunks(text, maxLen = 155) {
  const cleaned = normalizeVietnameseMathText(text);
  if (!cleaned) return [];
  const rawSentences = cleaned
    .split(/(?<=[.!?…;:\n])\s+/)
    .map(s => s.replace(/^[.\s]+/, '').trim())
    .filter(s => s.length > 1);

  const chunks = [];
  for (const sentence of rawSentences) {
    if (sentence.length <= maxLen) {
      chunks.push(sentence);
      continue;
    }
    const parts = sentence.split(/(?<=[,–—])\s+/);
    let buf = '';
    for (const part of parts) {
      if ((buf + ' ' + part).trim().length <= maxLen) {
        buf = (buf + ' ' + part).trim();
      } else {
        if (buf) chunks.push(buf);
        if (part.length <= maxLen) {
          buf = part;
        } else {
          const words = part.split(/\s+/);
          let wbuf = '';
          for (const w of words) {
            if ((wbuf + ' ' + w).trim().length <= maxLen) {
              wbuf = (wbuf + ' ' + w).trim();
            } else {
              if (wbuf) chunks.push(wbuf);
              wbuf = w;
            }
          }
          buf = wbuf;
        }
      }
    }
    if (buf) chunks.push(buf);
  }
  return chunks;
}

/**
 * Chỉ chọn giọng đọc thực sự là Tiếng Việt (vi-VN).
 * Tuyệt đối KHÔNG chọn giọng Tiếng Anh (Microsoft David/Zira) vì sẽ đọc sai dấu Tiếng Việt.
 */
function pickStrictVietnameseVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  const viVoices = voices.filter(v =>
    /^(vi|vi[-_])/i.test(String(v.lang || '').trim()) ||
    /vietnam|tiếng việt|hoaimy|namminh|microsoft an/i.test(String(v.name || ''))
  );
  if (!viVoices.length) return null;
  return (
    viVoices.find(v => /hoaimy|namminh|natural|online|google/i.test(v.name || '')) ||
    viVoices.find(v => /microsoft an/i.test(v.name || '')) ||
    viVoices[0]
  );
}

function ensureSubtitleBar() {
  if (typeof document === 'undefined') return null;
  if (subtitleBar && document.body.contains(subtitleBar)) return subtitleBar;
  const bar = document.createElement('div');
  bar.id = 'mv-vn-subtitle-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Phụ đề thuyết minh Tiếng Việt của Thầy Tùng');
  bar.hidden = true;
  bar.style.cssText = [
    'position:fixed',
    'left:50%',
    'bottom:68px',
    'transform:translateX(-50%)',
    'z-index:99999',
    'width:min(820px, 92vw)',
    'background:linear-gradient(135deg, rgba(10,22,40,0.94), rgba(15,35,62,0.95))',
    'border:1.5px solid rgba(56,189,248,0.65)',
    'border-radius:16px',
    'padding:10px 16px',
    'box-shadow:0 12px 32px rgba(0,0,0,0.55), 0 0 18px rgba(56,189,248,0.22)',
    'color:#f8fafc',
    'font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',
    'backdrop-filter:blur(12px)',
    'display:flex',
    'align-items:center',
    'gap:12px',
    'pointer-events:auto'
  ].join(';');

  bar.innerHTML = `
    <div style="font-size:26px;line-height:1;flex-shrink:0;" title="Thầy Tùng thuyết minh Tiếng Việt">👨‍🏫</div>
    <div style="flex:1;min-width:0;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
        <span id="mv-vn-sub-badge" style="font-size:11px;font-weight:800;letter-spacing:0.06em;color:#38bdf8;text-transform:uppercase;">🔊 THẦY TÙNG THUYẾT MINH TIẾNG VIỆT</span>
        <span id="mv-vn-sub-step" style="font-size:11px;color:#94a3b8;font-weight:600;"></span>
      </div>
      <div id="mv-vn-sub-text" style="font-size:14.5px;line-height:1.45;font-weight:600;color:#ffffff;word-break:break-word;"></div>
    </div>
    <button type="button" id="mv-vn-sub-stop" style="flex-shrink:0;background:rgba(239,68,68,0.22);color:#fecaca;border:1px solid rgba(248,113,113,0.6);border-radius:10px;padding:6px 12px;font-size:12.5px;font-weight:800;cursor:pointer;">⏹ Dừng</button>
  `;
  document.body.appendChild(bar);
  bar.querySelector('#mv-vn-sub-stop')?.addEventListener('click', () => {
    stopVietnameseSpeech();
  });
  subtitleBar = bar;
  return bar;
}

function showSubtitle(chunkText, stepIdx, totalSteps, badgeText = '🔊 THẦY TÙNG THUYẾT MINH TIẾNG VIỆT') {
  const bar = ensureSubtitleBar();
  if (!bar) return;
  const badge = bar.querySelector('#mv-vn-sub-badge');
  const step = bar.querySelector('#mv-vn-sub-step');
  const txt = bar.querySelector('#mv-vn-sub-text');
  if (badge) badge.textContent = badgeText;
  if (step) step.textContent = totalSteps > 1 ? `(${stepIdx}/${totalSteps})` : '';
  if (txt) txt.textContent = chunkText;
  bar.hidden = false;
  bar.style.display = 'flex';
}

function hideSubtitle() {
  if (!subtitleBar) return;
  subtitleBar.hidden = true;
  subtitleBar.style.display = 'none';
}

function buildGoogleVietnameseTtsUrl(chunkText) {
  const q = encodeURIComponent(chunkText);
  return `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=vi&dt=t&q=${q}`;
}

function createAudioElement(url) {
  const audio = new Audio();
  audio.referrerPolicy = 'no-referrer';
  audio.preload = 'auto';
  audio.src = url;
  return audio;
}

export function stopVietnameseSpeech() {
  activeToken++;
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
  if (currentAudio) {
    try {
      currentAudio.onended = null;
      currentAudio.onerror = null;
      currentAudio.pause();
      currentAudio.removeAttribute('src');
    } catch {}
    currentAudio = null;
  }
  if (preloadedAudio) {
    try {
      preloadedAudio.pause();
      preloadedAudio.removeAttribute('src');
    } catch {}
    preloadedAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch {}
  }
  hideSubtitle();
  if (speakingState) {
    speakingState = false;
    notifyListeners();
  }
}

/**
 * Đọc thuyết minh Tiếng Việt trọn vẹn 100% từ đầu đến cuối.
 * - Ưu tiên số 1: Google Tiếng Việt Neural Audio stream (hoạt động trên mọi trình duyệt Cốc Cốc, Chrome, Edge, kể cả máy Windows không cài gói giọng đọc vi-VN).
 * - Dự phòng số 2: Giọng đọc bản địa vi-VN (nếu máy có cài Microsoft An / Google Tiếng Việt và đang mất mạng).
 * - Luôn hiển thị phụ đề Tiếng Việt trực quan dưới màn hình.
 */
export function speakVietnamese(text, options = {}) {
  stopVietnameseSpeech();
  const chunks = splitIntoSpeechChunks(text, 155);
  if (!chunks.length) return false;

  const token = ++activeToken;
  speakingState = true;
  notifyListeners();
  options.onStart?.();

  const finish = () => {
    if (token !== activeToken) return;
    if (keepAliveTimer) {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
    currentAudio = null;
    preloadedAudio = null;
    hideSubtitle();
    speakingState = false;
    notifyListeners();
    options.onEnd?.();
  };

  let idx = 0;

  const speakChunkWithNativeViVoice = (chunkText, onDone) => {
    if (token !== activeToken) return;
    const viVoice = pickStrictVietnameseVoice();
    if (!viVoice) {
      // Máy không có giọng vi-VN offline -> giữ phụ đề trên màn hình 3.2 giây để người dùng đọc rồi chuyển câu
      setTimeout(() => {
        if (token === activeToken) onDone();
      }, Math.min(4500, Math.max(1800, chunkText.length * 45)));
      return;
    }
    try {
      const u = new SpeechSynthesisUtterance(chunkText);
      u.lang = viVoice.lang || 'vi-VN';
      u.voice = viVoice;
      u.rate = options.rate || 1.02;
      u.pitch = options.pitch || 1.0;
      u.onend = () => { if (token === activeToken) onDone(); };
      u.onerror = () => { if (token === activeToken) onDone(); };
      window.speechSynthesis.speak(u);
    } catch {
      onDone();
    }
  };

  const playNextChunk = () => {
    if (token !== activeToken) return;
    if (idx >= chunks.length) {
      finish();
      return;
    }

    const currentIndex = idx;
    const chunkText = chunks[idx++];
    showSubtitle(chunkText, currentIndex + 1, chunks.length);

    // Preload next chunk for gapless Vietnamese speech
    let nextPreload = null;
    if (idx < chunks.length && typeof Audio !== 'undefined') {
      try {
        nextPreload = createAudioElement(buildGoogleVietnameseTtsUrl(chunks[idx]));
        nextPreload.load();
      } catch {}
    }

    if (typeof Audio !== 'undefined') {
      const audio = preloadedAudio || createAudioElement(buildGoogleVietnameseTtsUrl(chunkText));
      preloadedAudio = nextPreload;
      currentAudio = audio;
      audio.playbackRate = options.rate || 1.06;

      let settled = false;
      const advance = () => {
        if (settled || token !== activeToken) return;
        settled = true;
        currentAudio = null;
        setTimeout(playNextChunk, 25);
      };

      audio.onended = advance;
      audio.onerror = () => {
        if (settled || token !== activeToken) return;
        settled = true;
        currentAudio = null;
        speakChunkWithNativeViVoice(chunkText, () => setTimeout(playNextChunk, 25));
      };

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          if (settled || token !== activeToken) return;
          settled = true;
          currentAudio = null;
          speakChunkWithNativeViVoice(chunkText, () => setTimeout(playNextChunk, 25));
        });
      }
      return;
    }

    speakChunkWithNativeViVoice(chunkText, () => setTimeout(playNextChunk, 25));
  };

  playNextChunk();
  return true;
}

/**
 * Bộ Hiểu Tiếng Việt & Thực Thi Lệnh Giọng Nói Tiếng Việt (Vietnamese NLU + Voice Command)
 */
export function interpretAndExecuteVietnameseCommand(rawTranscript, handlers = {}) {
  const raw = String(rawTranscript || '').trim();
  if (!raw) return { matched: false, reply: '' };
  const norm = raw.toLowerCase();

  // 1. Dừng đọc
  if (/(dừng lại|tắt tiếng|im lặng|ngừng đọc|dừng thuyết minh)/.test(norm)) {
    stopVietnameseSpeech();
    return { matched: true, reply: 'Đã dừng thuyết minh.' };
  }

  // 2. Hỏi kiến thức Toán học bằng Tiếng Việt
  for (const item of MATH_KNOWLEDGE_QA) {
    if (item.keywords.some(k => norm.includes(k))) {
      speakVietnamese(`Thầy Tùng giải thích cho em nhé: ${item.answer}`);
      return { matched: true, reply: item.answer };
    }
  }

  // 3. Điều hướng về Sảnh Chính
  if (/(sảnh chính|đại sảnh|về sảnh|quay lại sảnh|ra ngoài sảnh|trung tâm)/.test(norm)) {
    handlers.toLobby?.();
    const reply = 'Thầy Tùng đã đưa em quay về Đại Sảnh Chính Trung Tâm!';
    speakVietnamese(reply);
    return { matched: true, reply };
  }

  // 4. Vào Phòng Triển Lãm 18 Danh Nhân
  if (/(danh nhân|nhà toán học|triển lãm danh nhân|18 danh nhân|geogebra)/.test(norm)) {
    handlers.openHistory?.();
    const reply = 'Đang mở Phòng Triển Lãm Mười Tám Danh Nhân Toán Học và Xưởng GeoGebra!';
    speakVietnamese(reply);
    return { matched: true, reply };
  }

  // 5. Chọn Khối Lớp 6 -> 12
  const gradeMatch = norm.match(/lớp\s*(6|7|8|9|10|11|12|sáu|bảy|tám|chín|mười một|mười hai|mười)/);
  if (gradeMatch) {
    const wordToNum = { 'sáu': 6, 'bảy': 7, 'tám': 8, 'chín': 9, 'mười': 10, 'mười một': 11, 'mười hai': 12 };
    const g = Number(gradeMatch[1]) || wordToNum[gradeMatch[1]] || 6;
    handlers.openGrade?.(g);
    const reply = `Thầy Tùng đang mở không gian học tập và mô hình Toán Lớp ${g} cho em!`;
    speakVietnamese(reply);
    return { matched: true, reply };
  }

  // 6. Vào Tòa Lab Toán Học 3D
  if (/(phòng lab|vào lab|tòa lab|thực nghiệm|thí nghiệm|mô hình 3d|sách giáo khoa|kho sgk)/.test(norm)) {
    handlers.enterLab?.();
    const reply = 'Chào mừng em tiến vào Tòa Lab Toán Học ba đê với ba trăm mười mô hình sách giáo khoa!';
    speakVietnamese(reply);
    return { matched: true, reply };
  }

  // 7. Vào Bảo Tàng 230 Tranh Infographic
  if (/(bảo tàng|xem tranh|infographic|230 tranh|phòng tranh)/.test(norm)) {
    handlers.enterMuseum?.();
    const reply = 'Thầy Tùng đang đưa em vào Bảo Tàng Toán Học với hai trăm ba mươi bức tranh đồ họa kiến thức!';
    speakVietnamese(reply);
    return { matched: true, reply };
  }

  // 8. Vào Khu Khám Phá Discovery
  if (/(discovery|khám phá|kỳ quan|địa cầu|trái đất|unesco|u nét xcô)/.test(norm)) {
    handlers.enterDiscovery?.();
    const reply = 'Đang đưa em đến Khu Khám Phá Discovery ba đê với Quả Cầu Trái Đất và ba mươi lăm kỳ quan thế giới!';
    speakVietnamese(reply);
    return { matched: true, reply };
  }

  // 9. Vào Công Viên Giải Trí Wonder Park
  if (/(công viên|trò chơi|wonder park|khinh khí cầu|mê cung|tàu lượn|đu quay|giải trí)/.test(norm)) {
    handlers.enterPark?.();
    const reply = 'Chào mừng em đến với Công Viên Giải Trí Wonder Park mười một trò chơi toán học!';
    speakVietnamese(reply);
    return { matched: true, reply };
  }

  // 10. Xe đạp & Tăng tốc
  if (/(xe đạp|tăng tốc|chạy nhanh|đi nhanh|gọi xe)/.test(norm)) {
    handlers.toggleBike?.(true);
    const reply = 'Đã bật chế độ Xe Đạp Thể Thao tăng tốc di chuyển siêu nhanh!';
    speakVietnamese(reply);
    return { matched: true, reply };
  }
  if (/(đi bộ|chậm lại|tắt xe đạp|xuống xe)/.test(norm)) {
    handlers.toggleBike?.(false);
    const reply = 'Đã chuyển về chế độ đi bộ bình thường.';
    speakVietnamese(reply);
    return { matched: true, reply };
  }

  // 11. Góc nhìn Mắt / Gần / Xa
  if (/(góc nhìn mắt|góc mắt|thứ nhất)/.test(norm)) {
    handlers.setCameraPreset?.('eye');
    const reply = 'Đã chuyển sang góc nhìn thứ nhất — góc nhìn Mắt.';
    speakVietnamese(reply);
    return { matched: true, reply };
  }
  if (/(góc nhìn gần|nhìn gần)/.test(norm)) {
    handlers.setCameraPreset?.('near');
    const reply = 'Đã chuyển sang góc nhìn gần nhân vật.';
    speakVietnamese(reply);
    return { matched: true, reply };
  }
  if (/(góc nhìn xa|nhìn xa|toàn cảnh|trên cao)/.test(norm)) {
    handlers.setCameraPreset?.('far');
    const reply = 'Đã chuyển sang góc nhìn xa bao quát toàn cảnh.';
    speakVietnamese(reply);
    return { matched: true, reply };
  }

  // 12. Thuyết minh / Hướng dẫn khu vực hiện tại
  if (/(thuyết minh|hướng dẫn|giới thiệu|đọc bài|giảng bài|thầy tùng ơi|chào thầy)/.test(norm)) {
    const mode = handlers.getCurrentMode?.() || 'lobby';
    const guide = ZONE_VOICE_GUIDES[mode] || ZONE_VOICE_GUIDES.lobby;
    speakVietnamese(guide);
    return { matched: true, reply: guide };
  }

  // Nếu người dùng nói câu bất kỳ khác bằng Tiếng Việt, Thầy Tùng phản hồi thân thiện và hướng dẫn
  const fallbackReply =
    `Thầy Tùng đã nghe rõ câu Tiếng Việt của em: "${raw}". ` +
    'Em có thể nói: Vào phòng Lab, Vào Bảo tàng, Vào Discovery, Vào Công viên, Về Sảnh Chính, Gọi Xe Đạp, Mở Lớp 6 đến Lớp 12, hoặc hỏi Định lý Pi-ta-go, Hình chóp, Hình trụ, Hình cầu để Thầy Tùng thuyết minh ngay nhé!';
  speakVietnamese(fallbackReply);
  return { matched: true, reply: fallbackReply };
}

/**
 * Bật / Tắt Microphone nghe và hiểu Tiếng Việt trực tiếp (Web Speech Recognition vi-VN)
 */
export function toggleVietnameseVoiceCommand(handlers = {}) {
  if (typeof window === 'undefined') return false;
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    const msg = 'Trình duyệt hiện tại không hỗ trợ Microphone nhận diện giọng nói. Thầy cô hãy nhấn nút Thuyết Minh để nghe giọng đọc Tiếng Việt của Thầy Tùng nhé!';
    handlers.onStatus?.(msg);
    speakVietnamese(msg);
    return false;
  }

  if (listeningState && recognitionInstance) {
    try { recognitionInstance.stop(); } catch {}
    listeningState = false;
    notifyVoiceCmdListeners('');
    return false;
  }

  stopVietnameseSpeech();
  const rec = new SpeechRec();
  recognitionInstance = rec;
  rec.lang = 'vi-VN';
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  listeningState = true;
  notifyVoiceCmdListeners('🎙 Đang nghe Tiếng Việt... (Hãy nói: "Vào phòng Lab", "Vào Bảo tàng", "Về Sảnh Chính", "Thuyết minh"...)');
  showSubtitle(
    'Hãy nói bằng Tiếng Việt: "Vào phòng Lab", "Vào Bảo tàng", "Vào Discovery", "Vào Công viên", "Về Sảnh Chính", "Gọi xe đạp", "Lớp 8", hoặc "Định lý Pythagore"...',
    1,
    1,
    '🎙 ĐANG NGHE & HIỂU GIỌNG NÓI TIẾNG VIỆT (vi-VN)'
  );

  rec.onresult = (event) => {
    let transcript = '';
    let isFinal = false;
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
      if (event.results[i].isFinal) isFinal = true;
    }
    if (transcript) {
      showSubtitle(`"${transcript.trim()}"`, 1, 1, isFinal ? '✅ ĐÃ HIỂU TIẾNG VIỆT' : '🎙 ĐANG NGHE TIẾNG VIỆT...');
    }
    if (isFinal && transcript.trim()) {
      listeningState = false;
      notifyVoiceCmdListeners(`Đã nghe: "${transcript.trim()}"`);
      handlers.onStatus?.(`🎙 Đã hiểu Tiếng Việt: "${transcript.trim()}"`);
      interpretAndExecuteVietnameseCommand(transcript.trim(), handlers);
    }
  };

  rec.onerror = () => {
    listeningState = false;
    notifyVoiceCmdListeners('');
    hideSubtitle();
    handlers.onStatus?.('🎙 Không nghe rõ hoặc chưa cấp quyền Micro. Hãy bấm lại nút 🎙 Nói Tiếng Việt để thử lại.');
  };

  rec.onend = () => {
    if (listeningState) {
      listeningState = false;
      notifyVoiceCmdListeners('');
    }
  };

  try {
    rec.start();
    return true;
  } catch {
    listeningState = false;
    notifyVoiceCmdListeners('');
    return false;
  }
}

if (typeof window !== 'undefined') {
  window.__mathverseSpeakText = speakVietnamese;
  window.__mathverseStopSpeech = stopVietnameseSpeech;
  window.__mathverseZoneGuides = ZONE_VOICE_GUIDES;
  window.__mathverseVoiceCommand = toggleVietnameseVoiceCommand;
}
