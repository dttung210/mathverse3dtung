/**
 * MATHVERSE V5 - Safe Expression Evaluator
 * Đánh giá hàm số toán học an toàn tuyệt đối (KHÔNG dùng eval/new Function).
 * Tính toán nghiệm, đỉnh, tiệm cận, bảng giá trị.
 */

export const SafeExpression = {
  /**
   * Tính giá trị hàm bậc hai y = ax^2 + bx + c
   * Nếu a === 0, thoái biến về hàm bậc nhất y = bx + c hoặc hàm hằng.
   */
  evaluateQuadratic(x, a, b, c) {
    return a * x * x + b * x + c;
  },

  /**
   * Phân tích các đặc trưng hàm bậc hai: Đỉnh, trục đối xứng, nghiệm, bề lõm
   */
  analyzeQuadratic(a, b, c) {
    if (Math.abs(a) < 1e-9) {
      // Thoái biến thành bậc nhất hoặc hằng số
      if (Math.abs(b) < 1e-9) {
        if (Math.abs(c) < 1e-9) {
          return {
            type: 'identity_zero',
            infiniteRoots: true,
            solutionSet: 'S = ℝ',
            title: 'Hàm hằng đồng nhất y = 0 (Phương trình 0 = 0 có tập nghiệm S = ℝ)',
            vertex: null,
            axisOfSymmetry: null,
            roots: 'S = ℝ',
            rangeDesc: 'Giá trị không đổi y = 0; phương trình 0 = 0 nghiệm đúng với mọi x ∈ ℝ (S = ℝ)'
          };
        }
        return {
          type: 'constant',
          infiniteRoots: false,
          solutionSet: 'S = ∅',
          title: `Hàm hằng y = ${c}`,
          vertex: null,
          axisOfSymmetry: null,
          roots: [],
          rangeDesc: `Giá trị không đổi y = ${c}; phương trình ${c} = 0 vô nghiệm (S = ∅)`
        };
      }
      const root = -c / b;
      return {
        type: 'linear',
        infiniteRoots: false,
        solutionSet: `S = {${Math.round(root * 100) / 100}}`,
        title: `Đường thẳng y = ${b}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`,
        vertex: null,
        axisOfSymmetry: null,
        roots: [Math.round(root * 100) / 100],
        slope: b,
        intercept: c,
        rangeDesc: 'Hàm số đồng biến hoặc nghịch biến trên ℝ'
      };
    }

    const vx = -b / (2 * a);
    const vy = a * vx * vx + b * vx + c;
    const delta = b * b - 4 * a * c;
    let roots = [];

    if (delta > 1e-9) {
      const r1 = (-b - Math.sqrt(delta)) / (2 * a);
      const r2 = (-b + Math.sqrt(delta)) / (2 * a);
      roots = [Math.round(r1 * 100) / 100, Math.round(r2 * 100) / 100].sort((x, y) => x - y);
    } else if (Math.abs(delta) <= 1e-9) {
      roots = [Math.round(vx * 100) / 100];
    }

    return {
      type: 'parabola',
      title: `Parabol y = ${a}x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`,
      vertex: [Math.round(vx * 100) / 100, Math.round(vy * 100) / 100],
      axisOfSymmetry: Math.round(vx * 100) / 100,
      roots,
      delta: Math.round(delta * 100) / 100,
      concaveUp: a > 0,
      rangeDesc: a > 0 ? `y ≥ ${Math.round(vy * 100) / 100}` : `y ≤ ${Math.round(vy * 100) / 100}`
    };
  },

  /**
   * Tính giá trị hàm phân thức bậc nhất y = (ax + b) / (cx + d)
   */
  evaluateRational(x, a, b, c, d) {
    const denom = c * x + d;
    if (Math.abs(denom) < 1e-9) return null; // Điểm gián đoạn (tiệm cận đứng)
    return (a * x + b) / denom;
  },

  /**
   * Phân tích tiệm cận hàm phân thức y = (ax + b) / (cx + d)
   */
  analyzeRational(a, b, c, d) {
    if (Math.abs(c) < 1e-9) {
      if (Math.abs(d) < 1e-9) return { valid: false, error: 'Mẫu số bằng 0' };
      return {
        type: 'linear',
        verticalAsymptote: null,
        horizontalAsymptote: null
      };
    }
    const va = -d / c;
    const ha = a / c;
    // ad-bc=0: biểu thức rút gọn thành hằng số, x=-d/c là lỗ thủng.
    if (Math.abs(a*d-b*c) < 1e-9) return {
      type:'removable',verticalAsymptote:null,horizontalAsymptote:Math.round(ha*100)/100,
      hole:[Math.round(va*100)/100,Math.round(ha*100)/100],center:null
    };
    return {
      type: 'rational',
      verticalAsymptote: Math.round(va * 100) / 100,
      horizontalAsymptote: Math.round(ha * 100) / 100,
      center: [Math.round(va * 100) / 100, Math.round(ha * 100) / 100]
    };
  },

  /**
   * Tính giá trị hàm bậc ba y = ax^3 + bx^2 + cx + d
   */
  evaluateCubic(x, a, b, c, d) {
    return a * x * x * x + b * x * x + c * x + d;
  },

  /**
   * Điểm uốn của hàm bậc ba: x = -b / (3a)
   */
  inflectionPointCubic(a, b, c, d) {
    if (Math.abs(a) < 1e-9) return null;
    const ix = -b / (3 * a);
    const iy = this.evaluateCubic(ix, a, b, c, d);
    return [Math.round(ix * 100) / 100, Math.round(iy * 100) / 100];
  }
};
