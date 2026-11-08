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

/** Đọc giọng nói hướng dẫn bằng Web Speech API chuẩn trình duyệt (Offline TTS) */
export function speakText(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.startsWith('vi'));
    if (viVoice) utterance.voice = viVoice;
    window.speechSynthesis.speak(utterance);
  } catch (_) {}
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

