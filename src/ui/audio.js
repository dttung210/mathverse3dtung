/**
 * MATHVERSE NEO AUDIO SYSTEM
 * Hệ thống âm thanh phản hồi UI tổng hợp bằng Web Audio API
 * Không yêu cầu tệp MP3 ngoài, siêu nhẹ, không gây trễ hoặc lỗi nạp file
 */

let ctx = null;
function safeReadMuted() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
      return localStorage.getItem('mathverse_audio_muted') === 'true';
    }
  } catch (_) {}
  return false;
}
function safeWriteMuted(muted) {
  try {
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.setItem === 'function') {
      localStorage.setItem('mathverse_audio_muted', muted ? 'true' : 'false');
      return true;
    }
  } catch (_) {}
  return false;
}
let isMuted = safeReadMuted();

function getAudioContext() {
  if (!ctx && typeof window !== 'undefined') {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      ctx = new AudioCtx();
    }
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/** Phát âm click công nghệ nhẹ nhàng (Tactile UI Click) */
export function playClickSound() {
  if (isMuted) return;
  try {
    const c = getAudioContext();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    const now = c.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.045);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(c.destination);

    osc.start(now);
    osc.stop(now + 0.048);
  } catch (_) {}
}

/** Phát âm dịch chuyển lượng tử giữa các phòng (Quantum Warp Whoosh) */
export function playWarpSound() {
  if (isMuted) return;
  try {
    const c = getAudioContext();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    const now = c.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.16);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(c.destination);

    osc.start(now);
    osc.stop(now + 0.23);
  } catch (_) {}
}

/** Phát âm thanh kích hoạt Chế độ Máy chiếu (Projector Master Mode Chime) */
export function playProjectorSound() {
  if (isMuted) return;
  try {
    const c = getAudioContext();
    if (!c) return;
    const now = c.currentTime;

    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      const startT = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.09, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.28);

      osc.connect(gain);
      gain.connect(c.destination);

      osc.start(startT);
      osc.stop(startT + 0.3);
    });
  } catch (_) {}
}

/** Phát âm thanh nhảy nhẹ nhàng (Soft Hop Jump) */
export function playJumpSound() {
  if (isMuted) return;
  try {
    const c = getAudioContext();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    const now = c.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.07);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(c.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (_) {}
}

/** Phát âm bước chân êm ái khi nhân vật di chuyển (Tactile Footstep) */
export function playFootstepSound() {
  if (isMuted) return;
  try {
    const c = getAudioContext();
    if (!c) return;
    const now = c.currentTime;

    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.04);

    gain.gain.setValueAtTime(0.028, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

    osc.connect(gain);
    gain.connect(c.destination);

    osc.start(now);
    osc.stop(now + 0.042);
  } catch (_) {}
}

/** Phát âm thanh Hologram xuất hiện (Futuristic Hologram Chime) */
export function playHologramSound() {
  if (isMuted) return;
  try {
    const c = getAudioContext();
    if (!c) return;
    const now = c.currentTime;

    const osc1 = c.createOscillator();
    const osc2 = c.createOscillator();
    const gain = c.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, now);
    osc2.frequency.exponentialRampToValueAtTime(2200, now + 0.15);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(c.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.17);
    osc2.stop(now + 0.17);
  } catch (_) {}
}

let currentLabAudio = null;
let labSpeechToken = 0;

function normalizeLabVietnameseText(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\\frac\s*\{\s*1\s*\}\s*\{\s*3\s*\}/g, ' một phần ba ')
    .replace(/\\frac\s*\{\s*1\s*\}\s*\{\s*2\s*\}/g, ' một phần hai ')
    .replace(/\\frac\s*\{\s*4\s*\}\s*\{\s*3\s*\}/g, ' bốn phần ba ')
    .replace(/\\frac\s*\{\s*([^}]+)\s*\}\s*\{\s*([^}]+)\s*\}/g, ' $1 phần $2 ')
    .replace(/\\sqrt\s*\{\s*([^}]+)\s*\}/g, ' căn bậc hai của $1 ')
    .replace(/√\s*([a-zA-Z0-9]+)/g, ' căn bậc hai của $1 ')
    .replace(/√/g, ' căn bậc hai ')
    .replace(/S_\{\s*xq\s*\}|S_xq/gi, ' diện tích xung quanh ')
    .replace(/S_\{\s*tp\s*\}|S_tp/gi, ' diện tích toàn phần ')
    .replace(/S_\{\s*đáy\s*\}|S_đáy|S_0/gi, ' diện tích đáy ')
    .replace(/\b1\/3\b/g, ' một phần ba ')
    .replace(/\b1\/2\b/g, ' một phần hai ')
    .replace(/\b2\/3\b/g, ' hai phần ba ')
    .replace(/\b4\/3\b/g, ' bốn phần ba ')
    .replace(/\^2\b|²/g, ' bình phương ')
    .replace(/\^3\b|³/g, ' lập phương ')
    .replace(/\\pi\b|π/g, ' pi ')
    .replace(/\\varphi\b|\\phi\b|φ/g, ' phi ')
    .replace(/\\Delta\b|Δ|∆/g, ' tam giác ')
    .replace(/\\perp\b|⊥/g, ' vuông góc với ')
    .replace(/\\parallel\b|∥/g, ' song song với ')
    .replace(/\\times\b|×|\\cdot\b/g, ' nhân ')
    .replace(/\\approx\b|≈/g, ' xấp xỉ ')
    .replace(/\\leq\b|\\le\b|≤/g, ' nhỏ hơn hoặc bằng ')
    .replace(/\\geq\b|\\ge\b|≥/g, ' lớn hơn hoặc bằng ')
    .replace(/\\Rightarrow\b|⇒|⟹|->|→/g, ' suy ra ')
    .replace(/°/g, ' độ ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[\{\}\$]/g, ' ')
    .replace(/[•·▪▸►◆◇★☆▣🏛🌐🧭🚲🔊🎙👁🔍🔭]/g, '. ')
    .replace(/\bOxyz\b/g, 'hệ tọa độ O x y z')
    .replace(/\bOxy\b/g, 'mặt phẳng tọa độ O x y')
    .replace(/\b3D\b/gi, 'ba đê')
    .replace(/\b2D\b/gi, 'hai đê')
    .replace(/\bSGK\b/gi, 'sách giáo khoa')
    .replace(/\bTHCS\b/gi, 'trung học cơ sở')
    .replace(/\bTHPT\b/gi, 'trung học phổ thông')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stopSpeech() {
  labSpeechToken++;
  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window && typeof window.parent.__mathverseStopSpeech === 'function') {
      window.parent.__mathverseStopSpeech();
    }
  } catch (_) {}
  try {
    if (typeof window !== 'undefined' && typeof window.__mathverseStopSpeech === 'function') {
      window.__mathverseStopSpeech();
    }
  } catch (_) {}
  if (currentLabAudio) {
    try {
      currentLabAudio.pause();
      currentLabAudio.removeAttribute('src');
    } catch (_) {}
    currentLabAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (_) {}
  }
}

/** Đọc giọng nói thuyết minh Tiếng Việt trọn vẹn 100% (Google Tiếng Việt Neural Audio + Web Speech vi-VN) */
export function speakText(text) {
  if (typeof window === 'undefined') return;
  stopSpeech();
  if (isMuted || !text) return;

  try {
    if (typeof window.__mathverseSpeakText === 'function') {
      window.__mathverseSpeakText(text);
      return;
    }
    if (window.parent && window.parent !== window && typeof window.parent.__mathverseSpeakText === 'function') {
      window.parent.__mathverseSpeakText(text);
      return;
    }
  } catch (_) {}

  const cleaned = normalizeLabVietnameseText(text);
  if (!cleaned) return;
  const sentences = cleaned
    .split(/(?<=[.!?…;:\n])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  const chunks = [];
  for (const s of sentences) {
    if (s.length <= 150) {
      chunks.push(s);
    } else {
      const words = s.split(/\s+/);
      let buf = '';
      for (const w of words) {
        if ((buf + ' ' + w).trim().length <= 150) buf = (buf + ' ' + w).trim();
        else { if (buf) chunks.push(buf); buf = w; }
      }
      if (buf) chunks.push(buf);
    }
  }
  if (!chunks.length) return;

  const token = ++labSpeechToken;
  let idx = 0;

  const speakFallbackVi = (chunk, done) => {
    if (token !== labSpeechToken || !('speechSynthesis' in window)) { done(); return; }
    const voices = window.speechSynthesis.getVoices() || [];
    const viVoice = voices.find(v => /^(vi|vi[-_])/i.test(v.lang || '') || /vietnam|tiếng việt|hoaimy|namminh|microsoft an/i.test(v.name || ''));
    if (!viVoice) { done(); return; }
    const u = new SpeechSynthesisUtterance(chunk);
    u.lang = viVoice.lang || 'vi-VN';
    u.voice = viVoice;
    u.rate = 1.03;
    u.onend = done;
    u.onerror = done;
    window.speechSynthesis.speak(u);
  };

  const next = () => {
    if (token !== labSpeechToken || idx >= chunks.length) return;
    const chunk = chunks[idx++];
    if (typeof Audio !== 'undefined') {
      const a = new Audio();
      a.referrerPolicy = 'no-referrer';
      a.src = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=vi&dt=t&q=${encodeURIComponent(chunk)}`;
      a.playbackRate = 1.06;
      currentLabAudio = a;
      let doneCalled = false;
      const advance = () => {
        if (doneCalled || token !== labSpeechToken) return;
        doneCalled = true;
        setTimeout(next, 25);
      };
      a.onended = advance;
      a.onerror = () => {
        if (doneCalled || token !== labSpeechToken) return;
        doneCalled = true;
        speakFallbackVi(chunk, () => setTimeout(next, 25));
      };
      const p = a.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          if (doneCalled || token !== labSpeechToken) return;
          doneCalled = true;
          speakFallbackVi(chunk, () => setTimeout(next, 25));
        });
      }
      return;
    }
    speakFallbackVi(chunk, () => setTimeout(next, 25));
  };

  next();
}

if (typeof window !== 'undefined') {
  window.__mathverseLabSpeakText = speakText;
  window.__mathverseLabStopSpeech = stopSpeech;
}

/** Bật / Tắt âm thanh */
export function toggleMute() {
  isMuted = !isMuted;
  safeWriteMuted(isMuted);
  if (!isMuted) {
    playClickSound();
  } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }
  return isMuted;
}

export function getMuteState() {
  return isMuted;
}

