/** UI controller. This never opens or changes a mathematical Lab. */
import { openABDepthTestModal } from './depth-pipeline-v12.mjs?v=r107_v15';

export function mountGraphicsPanel(museum, { storage = globalThis.localStorage } = {}) {
  if (!museum || typeof document === 'undefined') return null;
  const qualityLabel = document.querySelector('.museum-quality-picker');
  if (!qualityLabel) return null;
  const parent = qualityLabel.parentElement;
  if (!parent) return null;

  // Keep the established quality selector (eco/auto/high); add a distinct style toggle.
  const btn = document.createElement('button');
  btn.id = 'mv-graphics-style';
  btn.type = 'button';
  btn.className = 'mv-graphics-style';
  btn.setAttribute('aria-label', 'Bật hoặc tắt đồ họa kiến trúc 3D nâng cao');
  btn.title = 'Đổi giữa giao diện 3D gốc và nâng cấp kiến trúc (không ảnh hưởng các Lab SGK)';
  parent.insertBefore(btn, qualityLabel.nextSibling);
  const key = 'mathverse_visual_3d_mode';
  const sync = (mode) => {
    const isEnhanced = mode === 'enhanced';
    document.body.classList.toggle('mv-graphics-v3d', isEnhanced);
    btn.setAttribute('aria-pressed', String(isEnhanced));
    btn.textContent = isEnhanced ? '✨ 3D Nâng cấp' : '◈ 3D Nguyên bản';
  };
  let mode = 'enhanced';
  try { if (storage?.getItem(key) === 'classic') mode = 'classic'; } catch {}
  sync(museum.setGraphicsMode(mode));
  btn.addEventListener('click', () => {
    const next = museum.getGraphicsMode() === 'enhanced' ? 'classic' : 'enhanced';
    sync(museum.setGraphicsMode(next));
    try { storage?.setItem(key, next); } catch {}
  });

  // Mount V12 AO toggle & A/B Depth Test Scene button when running in real browser DOM
  let abBtn = null;
  let aoBtn = null;
  if (typeof document.getElementById === 'function' && typeof parent.appendChild === 'function') {
    aoBtn = document.createElement('button');
    aoBtn.id = 'mv-v12-ao-toggle';
    aoBtn.type = 'button';
    aoBtn.className = 'mv-graphics-style';
    aoBtn.textContent = '◐ AO: Off';
    aoBtn.title = 'Chuyển đổi Ambient Occlusion (Off -> SSAO -> GTAO, không bật đồng thời cả hai)';
    aoBtn.addEventListener('click', () => {
      const cur = museum.getAOMode?.() || 'off';
      const next = cur === 'off' ? 'ssao' : cur === 'ssao' ? 'gtao' : 'off';
      const applied = museum.setAOMode ? museum.setAOMode(next) : 'off';
      aoBtn.textContent = `◐ AO: ${applied.toUpperCase()}`;
    });
    parent.insertBefore(aoBtn, btn.nextSibling);

    abBtn = document.createElement('button');
    abBtn.id = 'mv-v12-ab-open';
    abBtn.type = 'button';
    abBtn.className = 'mv-graphics-style';
    abBtn.textContent = '🧪 Cảnh A/B 3D';
    abBtn.title = 'Mở cảnh thử nghiệm A/B: Trước và Sau nâng cấp (Khối lập phương, Cầu, Nón, Sàn, Ánh sáng, Bóng đổ)';
    abBtn.addEventListener('click', () => openABDepthTestModal());
    parent.insertBefore(abBtn, aoBtn.nextSibling);
  }

  return {
    button: btn,
    aoButton: aoBtn,
    abButton: abBtn,
    setMode(mode) { sync(museum.setGraphicsMode(mode)); },
    dispose() {
      btn.remove();
      aoBtn?.remove?.();
      abBtn?.remove?.();
      document.body.classList.remove('mv-graphics-v3d');
    }
  };
}
