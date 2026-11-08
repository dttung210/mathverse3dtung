import {clamp} from './math.mjs';

const smooth = u => u * u * (3 - 2 * u);

/**
 * MATHVERSE R79: Pedagogical depth motion parameter calculation for Grade 6.
 * Single-directional deterministic timeline: START -> CONSTRUCT -> TRANSFORM -> HOLD RESULT.
 * Clamps strictly at t = 1.0 (seconds = duration) and NEVER loops indefinitely.
 */
export function motionParams(model, original, seconds, duration = 8) {
  const p = structuredClone(original);
  const t = clamp(seconds / Math.max(1, duration), 0, 1);
  const rise = smooth(clamp((t - 0.05) / 0.85, 0, 1));
  const soft = smooth(t);
  const v = model.variant;

  p.progress = t;

  switch (model.engine) {
    case 'polygon':
      // Polygon depth: progress drives step-by-step geometric construction & decomposition
      p.progress = t;
      if (Number.isFinite(p.a)) p.a = original.a;
      if (Number.isFinite(p.b)) p.b = original.b;
      break;

    case 'composition':
      p.progress = rise;
      break;

    case 'tiling':
      p.progress = t;
      break;

    case 'symmetry':
      p.fold = 180 * rise;
      p.progress = rise;
      break;

    case 'geometry':
      p.progress = rise;
      if (['angle', 'angletypes'].includes(v)) {
        p.angle = v === 'angletypes' ? Math.round(30 + 150 * t) : Math.round(25 + 115 * rise);
      }
      if (v === 'pairlines') {
        p.angle = Math.round(30 + 60 * rise);
      }
      if (v === 'rays') {
        p.angle = Math.round(180 * rise);
      }
      if (v === 'clock') {
        const totalMinutes = Math.floor(t * 180);
        p.angle = (totalMinutes * 0.5) % 360;
        p.measure = totalMinutes % 60;
      }
      if (v === 'ruler') {
        p.measure = +(3 + 5 * rise).toFixed(1);
      }
      if (v === 'midpoint') {
        p.measure = +(4 + 4 * rise).toFixed(1);
      }
      if (['pointline', 'collinear'].includes(v)) {
        p.measure = Math.round(40 * rise) / 10;
      }
      break;

    case 'number':
      p.progress = rise;
      if (v === 'multiples') {
        p.value = clamp(original.value || 3, 2, 9);
      }
      if (v === 'primes') {
        p.step = Math.min(4, Math.floor(rise * 4));
      }
      if (['natural', 'integer', 'hops'].includes(v)) {
        p.value = v === 'natural' ? Math.round(t * 12) : Math.round(-8 + 16 * t);
      }
      if (v === 'thermometer') p.value = Math.round(-20 + 55 * t);
      if (v === 'place') p.value = Math.round(1000 + 7890 * t);
      if (v === 'powers') {
        p.value = 2 + Math.round(3 * rise);
        p.step = 1 + Math.round(2 * rise);
      }
      break;

    case 'fraction':
      p.progress = rise;
      if (v === 'addsame') {
        const den = original.denominator || 8;
        p.numerator = original.numerator || Math.max(1, Math.round(den * 0.35));
        p.other = original.other || Math.max(1, Math.round(den * 0.38));
      } else if (v === 'equivalent') {
        p.numerator = original.numerator || 2;
        p.denominator = original.denominator || 3;
        p.factor = 1 + Math.round(2 * rise);
      } else if (v === 'compare') {
        p.numerator = original.numerator || 3;
        p.denominator = original.denominator || 5;
        p.other = 1 + Math.round(((original.other || 4) - 1) * rise);
      } else if (v === 'percent' || v === 'decimal') {
        const target = original.numerator || (v === 'percent' ? 45 : 24);
        p.numerator = Math.round(target * rise);
      } else {
        const target = original.numerator || 3;
        p.numerator = Math.round(target * rise);
      }
      break;

    case 'chart':
      p.progress = soft;
      p.values = (original.values || []).map(x => Math.round(x * soft));
      if (v === 'double') {
        p.otherValues = (original.otherValues || []).map(x => Math.round(x * soft));
      }
      break;

    case 'venn':
      p.progress = t;
      p.a = 2 + Math.round(6 * rise);
      p.b = 2 + Math.round(6 * (1 - rise));
      break;

    case 'chance':
      p.progress = t;
      break;

    case 'real':
      p.progress = t;
      if (v === 'ferris') p.rotation = (original.rotation || 0) + 360 * t;
      if (v === 'roads') p.rotation = (original.rotation || 0) + 90 * rise;
      if (v === 'card') p.rotation = 180 * rise;
      if (v === 'cubes') p.speed = 2 + Math.round(6 * t);
      break;

    default:
      p.progress = t;
      break;
  }
  return p;
}

export function motionDescription(model) {
  return ({
    polygon: 'Dựng hình theo bước: các cạnh, góc, đường chéo và phân tích tam giác thành phần.',
    composition: 'Dịch chuyển các mảnh từ trạng thái ghép sang trạng thái tách để thấy bảo toàn diện tích.',
    symmetry: 'Gấp và mở hình qua trục hoặc quay quanh tâm, kiểm tra tính chồng khít.',
    geometry: 'Dựng quan hệ hình học chuẩn: điểm, đường thẳng, góc và trung điểm.',
    number: 'Di chuyển giá trị trên trục số, nhiệt kế hoặc cây thừa số nguyên tố.',
    fraction: 'Tô các phần bằng nhau, đối chiếu phân số bằng nhau và phép tính cộng.',
    chart: 'Mọc cột/thanh từ trục chuẩn theo dữ liệu thống kê.',
    chance: 'Mô phỏng 1 lần thử nghiệm ngẫu nhiên: quay, lăn, rút bóng hoặc tung xu rồi dừng cố định kết quả.',
    real: 'Quan sát chuyển động thực tế gắn liền kiến thức Toán học.'
  })[model?.engine] || 'Điều khiển mô hình qua trục thời gian.';
}
