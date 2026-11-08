/**
 * MATHVERSE TOÁN HỌC MR.TUNG 3D — VIETNAMESE FULL NARRATION ENGINE (TTS)
 * Reads 100% of every dialogue, zone guide, landmark story, and mathematician biography
 * from start to finish without Chrome's 15-second cutoff bug.
 */

export const ZONE_VOICE_GUIDES = Object.freeze({
  lobby:
    'Chào mừng các em học sinh và quý thầy cô đến với Đại Sảnh Trung Tâm của MathVerse Toán Học Mr.Tung 3D! ' +
    'Ở giữa quảng trường là Đài phun nước Dải vô cực Möbius và Thầy Tùng đang chờ hướng dẫn. ' +
    'Từ Đại Sảnh, các em hãy đi qua 4 Cổng Chính để trống ở 4 hướng Đông, Tây, Nam, Bắc. ' +
    'Bốn góc chéo đã được lắp Cửa Trắng đóng kín để các em không đi nhầm. ' +
    'Cổng phía Tây dẫn vào Tòa Lab Toán Học với 310 mô hình sách giáo khoa Lớp 6 đến Lớp 12 và Phòng Triển lãm 18 Danh nhân Toán học. ' +
    'Cổng phía Đông dẫn vào Bảo Tàng Toán Học với 230 bức tranh Infographic trực quan. ' +
    'Cổng phía Bắc dẫn vào Khu Khám Phá Discovery 3D với Quả cầu Trái Đất và 35 kỳ quan kiến trúc thế giới trên 3 tầng. ' +
    'Cổng phía Nam dẫn vào Công Viên Giải Trí Wonder Park với 11 trò chơi toán học thực tế và chuyến bay Khinh khí cầu ngắm toàn cảnh 1 phút. ' +
    'Các em có thể nhấn phím Shift hoặc bấm nút Xe Đạp trên màn hình để chạy xe đạp tăng tốc di chuyển thật nhanh giữa các khu vực!',
  r75:
    'Chào mừng các em đến với Tòa Nhà Lab Toán Học 3D của Thầy Tùng! ' +
    'Tòa nhà gồm Sảnh Trung Tâm, 6 phòng học từ Lớp 6 đến Lớp 12 với 310 mô hình toán học tương tác, 14 bảng toán học động dọc hành lang, và Phòng Triển Lãm Danh Nhân Toán Học ở phía Đông Bắc. ' +
    'Trong mỗi phòng học, các em nhấp chuột vào mô hình 3D hoặc bấm Kho SGK để điều chỉnh thanh trượt, xem công thức và dựng hình trực tiếp. ' +
    'Tại Phòng Triển Lãm, các em có thể xem 18 chân dung danh nhân toán học, mở Xưởng vẽ hình 2D và 3D GeoGebra, nghe đọc tiểu sử đầy đủ, hoặc bấm nút Về Sảnh Chính ở thanh trên cùng bất cứ lúc nào.',
  museum:
    'Chào mừng các em đến với Bảo Tàng Toán Học Infographic 3D! ' +
    'Bảo tàng được thiết kế như một cung điện nghệ thuật gồm Sảnh Vòm Trung Tâm và 6 phòng trưng bày theo khối Lớp 6, Lớp 7, Lớp 8, Lớp 9, Lớp 10, Lớp 11 và Lớp 12 với tổng cộng 230 bức tranh đồ họa kiến thức. ' +
    'Các em hãy đi dạo qua từng phòng hoặc dùng nút chọn phòng nhanh trên màn hình, nhấp chuột vào bất kỳ bức tranh nào để phóng to độ phân giải cao và nghe Thầy Tùng thuyết minh toàn bộ nội dung bài học trên tranh. ' +
    'Nhấn phím Shift hoặc nút Tăng tốc để di chuyển nhanh hơn trong bảo tàng, và bấm nút Về Sảnh Chính trên thanh công cụ khi muốn chuyển sang khu vực khác.',
  discovery:
    'Chào mừng các em đến với Khu Khám Phá Discovery 3D — Toán Học Trong Kiến Trúc Và Vũ Trụ! ' +
    'Khu Discovery gồm 5 không gian lớn: Sảnh Quả Cầu Trái Đất, Phòng Triển Lãm UNESCO 3 Tầng với 35 bục mô hình kiến trúc 3D thực tế, Phòng Bản Đồ Thế Giới phẳng, Phòng Đại Số Hình Học, và Rạp Chiếu Phim Thiên Văn Vũ Trụ. ' +
    'Tại Phòng UNESCO 3 Tầng, các em có thể đi cầu thang bộ hoặc bấm nút chuyển Tầng 1, Tầng 2, Tầng 3 để xoay các kỳ quan 3D ngay trên bục, bấm phím E để xem ảnh tư liệu thật và nghe thuyết minh toán học của từng công trình.',
  park:
    'Chào mừng các em đến với Công Viên Giải Trí Toán Học Wonder Park 3D! ' +
    'Khu công viên gồm 11 trò chơi toán học phân khu riêng biệt rộng rãi: Vòng Quay Lượng Giác, Tàu Lượn Parabol, Tháp Rơi Tự Do, Mê Cung 3D nhiều tầng với Cổng Vào màu xanh ngọc và Cổng Ra màu vàng hoàng kim, Cầu Kính Xác Suất, Đấu Trường Đại Bác Góc Bắn, Nhảy Đệm Lò Xo Đồ Thị,Khinh Khí Cầu Tọa Độ, Đua Thuyền Vector, Vòng Xoay Hình Học Không Gian, và Sân Khấu Đố Vui Tốc Độ. ' +
    'Đặc biệt ở trò chơi Khinh Khí Cầu, khi giải đúng bài toán, các em sẽ được bay lên bầu trời ngắm toàn cảnh 3D trong suốt 1 phút với đầy đủ nút chuyển đổi góc nhìn Mắt, Gần và Xa!'
});

let activeToken = 0;
let keepAliveTimer = null;
let currentAudio = null;
let speakingState = false;
const listeners = new Set();

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

export function normalizeVietnameseMathText(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/<[^>]+>/g, ' ')
    .replace(/[•·▪▸►◆◇★☆▣🏛🌐🧭🚲🔊]/g, '. ')
    .replace(/⊥/g, ' vuông góc với ')
    .replace(/∥|\/\//g, ' song song với ')
    .replace(/⇒|⟹|->|→/g, ' suy ra ')
    .replace(/⇔|⟺/g, ' tương đương ')
    .replace(/≈/g, ' xấp xỉ ')
    .replace(/≠/g, ' khác ')
    .replace(/≤/g, ' nhỏ hơn hoặc bằng ')
    .replace(/≥/g, ' lớn hơn hoặc bằng ')
    .replace(/π/g, ' pi ')
    .replace(/Δ|∆/g, ' tam giác ')
    .replace(/∠|widehat/g, ' góc ')
    .replace(/°/g, ' độ ')
    .replace(/²/g, ' bình phương ')
    .replace(/³/g, ' lập phương ')
    .replace(/\bSGK\b/gi, 'sách giáo khoa')
    .replace(/\bTHCS\b/gi, 'trung học cơ sở')
    .replace(/\bTHPT\b/gi, 'trung học phổ thông')
    .replace(/\bUNESCO\b/gi, 'U-nét-xcô')
    .replace(/\bWASD\b/gi, 'W A S D')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitIntoSpeechChunks(text, maxLen = 145) {
  const cleaned = normalizeVietnameseMathText(text);
  if (!cleaned) return [];
  const rawSentences = cleaned
    .split(/(?<=[.!?…;:\n])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  const chunks = [];
  for (const sentence of rawSentences) {
    if (sentence.length <= maxLen) {
      chunks.push(sentence);
      continue;
    }
    // Split long sentences by comma or conjunctions so no chunk ever hits Chrome's 15s cutoff
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
          // Hard split by word boundary
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

function pickVietnameseVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  const viVoices = voices.filter(v =>
    /^(vi|vi[-_])/i.test(v.lang || '') ||
    /vietnam|tiếng việt|hoaimy|namminh|microsoft an/i.test(v.name || '')
  );
  if (!viVoices.length) return null;
  return (
    viVoices.find(v => /hoaimy|namminh|natural|online|google/i.test(v.name || '')) ||
    viVoices.find(v => v.localService) ||
    viVoices[0]
  );
}

export function stopVietnameseSpeech() {
  activeToken++;
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = '';
    } catch {}
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch {}
  }
  if (speakingState) {
    speakingState = false;
    notifyListeners();
  }
}

export function speakVietnamese(text, options = {}) {
  stopVietnameseSpeech();
  const chunks = splitIntoSpeechChunks(text, 140);
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
    speakingState = false;
    notifyListeners();
    options.onEnd?.();
  };

  const hasSynth = typeof window !== 'undefined' && 'speechSynthesis' in window;
  if (hasSynth) {
    const runSynthQueue = () => {
      if (token !== activeToken) return;
      const viVoice = pickVietnameseVoice();
      let idx = 0;

      // Chrome keep-alive timer to prevent long multi-chunk speech from pausing
      keepAliveTimer = setInterval(() => {
        if (token !== activeToken) return;
        try {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        } catch {}
      }, 9000);

      const nextChunk = () => {
        if (token !== activeToken) return;
        if (idx >= chunks.length) {
          finish();
          return;
        }
        const chunkText = chunks[idx++];
        const u = new SpeechSynthesisUtterance(chunkText);
        u.lang = viVoice?.lang || 'vi-VN';
        if (viVoice) u.voice = viVoice;
        u.rate = options.rate || 1.02;
        u.pitch = options.pitch || 1.0;
        u.onend = () => {
          if (token !== activeToken) return;
          setTimeout(nextChunk, 35);
        };
        u.onerror = () => {
          if (token !== activeToken) return;
          setTimeout(nextChunk, 50);
        };
        try {
          window.speechSynthesis.speak(u);
        } catch {
          finish();
        }
      };

      nextChunk();
    };

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) {
      let started = false;
      const onVoices = () => {
        if (started) return;
        started = true;
        window.speechSynthesis.removeEventListener?.('voiceschanged', onVoices);
        runSynthQueue();
      };
      window.speechSynthesis.addEventListener?.('voiceschanged', onVoices);
      setTimeout(() => {
        if (!started) {
          started = true;
          runSynthQueue();
        }
      }, 220);
    } else {
      runSynthQueue();
    }
    return true;
  }

  finish();
  return false;
}

if (typeof window !== 'undefined') {
  window.__mathverseSpeakText = speakVietnamese;
  window.__mathverseStopSpeech = stopVietnameseSpeech;
  window.__mathverseZoneGuides = ZONE_VOICE_GUIDES;
}

