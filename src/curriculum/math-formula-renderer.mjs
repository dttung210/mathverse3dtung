/**
 * MATHVERSE R7.3 — BỘ DỰNG CÔNG THỨC TOÁN HỌC CHUYÊN NGHIỆP (ZERO-DEPENDENCY LATEX/MATH RENDERER)
 * Chuyển đổi mã LaTeX và biểu thức đại số sang HTML/SVG Toán học hiển thị đẹp chuẩn sách giáo khoa:
 *   - Phân số xếp tầng thực sự (\frac{a}{b}, \frac12)
 *   - Căn thức có thanh ngang trên (\sqrt{...})
 *   - Vectơ có mũi tên trên đầu (\vec{u}, \overrightarrow{AB})
 *   - Gạch ngang trung bình (\overline{x}, \bar{x})
 *   - Hệ phương trình / bất phương trình ngoặc nhọn (\begin{cases}...\end{cases})
 *   - Tích phân, Tổng Sigma, Giới hạn (\int_a^b, \sum_{i=1}^n, \lim_{x\to a})
 *   - Định dạng đa thức & bất phương trình bậc nhất (loại bỏ triệt để lỗi "1x + 1y <= 2", "1x + -1y")
 */

const SUB_DIGITS = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'n': 'ₙ', 'k': 'ₖ', 'i': 'ᵢ', 'j': 'ⱼ', 'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ' };
const SUP_DIGITS = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', 'n': 'ⁿ', 'k': 'ᵏ' };

export const toSubscriptUnicode = (str) => String(str).replace(/[0-9+\-=()nkijaeox]/g, ch => SUB_DIGITS[ch] || ch);
export const toSuperscriptUnicode = (str) => String(str).replace(/[0-9+\-nk]/g, ch => SUP_DIGITS[ch] || ch);

const fmtNum = (n) => {
  if (!Number.isFinite(n)) return '0';
  const rounded = Math.round(n * 10000) / 10000;
  return String(rounded);
};

/**
 * Định dạng biểu thức tuyến tính 2 ẩn ax + by chuẩn SGK (không viết "1x + 1y" hay "1x + -2y").
 */
export function formatLinearExpr2D(a, b, varX = 'x', varY = 'y') {
  const parts = [];
  const na = Number(a) || 0;
  const nb = Number(b) || 0;

  if (Math.abs(na) > 1e-9) {
    const absA = Math.abs(na);
    const coefA = Math.abs(absA - 1) < 1e-9 ? '' : fmtNum(absA);
    parts.push(`${na < 0 ? '−' : ''}${coefA}${varX}`);
  }

  if (Math.abs(nb) > 1e-9) {
    const absB = Math.abs(nb);
    const coefB = Math.abs(absB - 1) < 1e-9 ? '' : fmtNum(absB);
    if (parts.length === 0) {
      parts.push(`${nb < 0 ? '−' : ''}${coefB}${varY}`);
    } else {
      parts.push(`${nb < 0 ? ' − ' : ' + '}${coefB}${varY}`);
    }
  }

  return parts.length ? parts.join('') : '0';
}

/**
 * Định dạng bất phương trình bậc nhất hai ẩn: ax + by ≤ c
 */
export function formatLinearInequality2D(a, b, rel = '≤', c = 0, varX = 'x', varY = 'y') {
  const cleanRel = rel === '<=' ? '≤' : rel === '>=' ? '≥' : rel === '!=' ? '≠' : rel;
  return `${formatLinearExpr2D(a, b, varX, varY)} ${cleanRel} ${fmtNum(Number(c) || 0)}`;
}

/**
 * Định dạng phương trình tổng quát đường thẳng: ax + by + c = 0
 */
export function formatLinearEquation2D(a, b, c = 0, varX = 'x', varY = 'y') {
  let expr = formatLinearExpr2D(a, b, varX, varY);
  const nc = Number(c) || 0;
  if (Math.abs(nc) > 1e-9) {
    const absC = fmtNum(Math.abs(nc));
    expr = expr === '0'
      ? (nc < 0 ? `−${absC}` : absC)
      : `${expr}${nc < 0 ? ' − ' : ' + '}${absC}`;
  }
  return `${expr} = 0`;
}

/**
 * Tìm cặp ngoặc nhọn { ... } cân bằng tính từ vị trí openIdx (nơi str[openIdx] === '{')
 */
function extractBalancedBraces(str, openIdx) {
  if (str[openIdx] !== '{') return null;
  let depth = 0;
  for (let i = openIdx; i < str.length; i++) {
    if (str[i] === '{' && str[i - 1] !== '\\') depth++;
    else if (str[i] === '}' && str[i - 1] !== '\\') {
      depth--;
      if (depth === 0) {
        return {
          content: str.slice(openIdx + 1, i),
          endIndex: i + 1
        };
      }
    }
  }
  return null;
}

/**
 * Thay thế tất cả các lệnh 1 đối số dạng \cmd{...} bằng hàm renderFn(innerContent)
 */
function replaceOneArgCommand(input, cmdName, renderFn) {
  const token = `\\${cmdName}`;
  let result = '';
  let idx = 0;
  while (idx < input.length) {
    const found = input.indexOf(token, idx);
    if (found === -1) {
      result += input.slice(idx);
      break;
    }
    // Đảm bảo sau tên lệnh không phải là chữ cái khác (ví dụ \vec vs \overrightarrow)
    const afterCmd = found + token.length;
    if (/[a-zA-Z]/.test(input[afterCmd] || '')) {
      result += input.slice(idx, afterCmd);
      idx = afterCmd;
      continue;
    }
    result += input.slice(idx, found);
    let cursor = afterCmd;
    while (cursor < input.length && input[cursor] === ' ') cursor++;
    if (input[cursor] === '{') {
      const extracted = extractBalancedBraces(input, cursor);
      if (extracted) {
        result += renderFn(extracted.content);
        idx = extracted.endIndex;
        continue;
      }
    }
    // Hỗ trợ viết tắt không ngoặc nhọn như \vec u, \overline x, \sqrt 2
    const shortMatch = input.slice(cursor).match(/^([a-zA-Z0-9]|\\[a-zA-Z]+)/);
    if (shortMatch && afterCmd < cursor) {
      result += renderFn(shortMatch[1]);
      idx = cursor + shortMatch[1].length;
      continue;
    }
    result += token;
    idx = afterCmd;
  }
  return result;
}

/**
 * Thay thế tất cả các lệnh 2 đối số dạng \frac{a}{b} hoặc viết tắt \frac12, \frac h3, \frac a{2b}
 */
function replaceTwoArgCommand(input, cmdName, renderFn) {
  const token = `\\${cmdName}`;
  let result = '';
  let idx = 0;
  while (idx < input.length) {
    const found = input.indexOf(token, idx);
    if (found === -1) {
      result += input.slice(idx);
      break;
    }
    const afterCmd = found + token.length;
    if (/[a-zA-Z]/.test(input[afterCmd] || '')) {
      result += input.slice(idx, afterCmd);
      idx = afterCmd;
      continue;
    }
    result += input.slice(idx, found);
    let cursor = afterCmd;
    while (cursor < input.length && input[cursor] === ' ') cursor++;

    let arg1 = null;
    if (input[cursor] === '{') {
      const ext1 = extractBalancedBraces(input, cursor);
      if (ext1) {
        arg1 = ext1.content;
        cursor = ext1.endIndex;
      }
    } else if (cursor < input.length && /[0-9a-zA-Z]/.test(input[cursor])) {
      arg1 = input[cursor];
      cursor += 1;
    }

    if (arg1 !== null) {
      while (cursor < input.length && input[cursor] === ' ') cursor++;
      let arg2 = null;
      if (input[cursor] === '{') {
        const ext2 = extractBalancedBraces(input, cursor);
        if (ext2) {
          arg2 = ext2.content;
          cursor = ext2.endIndex;
        }
      } else if (cursor < input.length && /[0-9a-zA-Z]/.test(input[cursor])) {
        arg2 = input[cursor];
        cursor += 1;
      }
      if (arg2 !== null) {
        result += renderFn(arg1, arg2);
        idx = cursor;
        continue;
      }
    }

    result += token;
    idx = afterCmd;
  }
  return result;
}

/**
 * Chuyển đổi chuỗi LaTeX sang HTML Toán học sắc nét, hỗ trợ đệ quy lồng nhau.
 */
export function renderLatexToHtml(latex) {
  if (latex === null || latex === undefined) return '';
  let raw = String(latex).trim();
  if (!raw) return '';

  // Sửa lỗi ký tự tab do \text bị viết thiếu dấu gạch chéo trong chuỗi JS
  raw = raw.replace(/\text\{/g, '\\text{');

  const parseSegment = (segment, depth = 0) => {
    if (!segment || depth > 8) return segment || '';
    let s = segment;

    // 1. Xử lý môi trường hệ phương trình / phân nhánh \begin{cases} ... \end{cases}
    s = s.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, (_, body) => {
      const rows = body
        .split(/\\\\/)
        .map(r => r.trim())
        .filter(Boolean)
        .map(row => {
          const cols = row.split('&').map(c => parseSegment(c.trim(), depth + 1));
          if (cols.length > 1) {
            return `<span class="mv-math-case-row"><span class="mv-math-case-cell">${cols[0]}</span><span class="mv-math-case-cond">${cols.slice(1).join(' ')}</span></span>`;
          }
          return `<span class="mv-math-case-row"><span class="mv-math-case-cell">${cols[0]}</span></span>`;
        })
        .join('');
      return `<span class="mv-math-cases"><span class="mv-math-brace" aria-hidden="true">{</span><span class="mv-math-cases-body">${rows}</span></span>`;
    });

    // 2. Xử lý \text{...} và \mathrm{...} trước để bảo toàn chữ tiếng Việt có dấu
    const textPlaceholders = [];
    const saveText = (txt, cls = 'mv-math-text') => {
      const clean = txt
        .replace(/\\;/g, ' ')
        .replace(/\\,/g, ' ')
        .replace(/\\\s+/g, ' ')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const token = `@@MVTEXT#${textPlaceholders.length}@@`;
      textPlaceholders.push(`<span class="${cls}">${clean}</span>`);
      return token;
    };

    s = replaceOneArgCommand(s, 'text', (inner) => saveText(inner, 'mv-math-text'));
    s = replaceOneArgCommand(s, 'mathrm', (inner) => saveText(inner, 'mv-math-rm'));

    // 3. Xử lý căn bậc n: \sqrt[n]{x} và căn bậc hai: \sqrt{x}
    s = s.replace(/\\sqrt\[([^\]]+)\]\{([^{}]+)\}/g, (_, deg, rad) => {
      return `<span class="mv-math-sqrt math-sqrt"><sup class="mv-math-root-idx">${parseSegment(deg, depth + 1)}</sup><span class="mv-math-surd">√</span><span class="mv-math-radicand math-radicand">${parseSegment(rad, depth + 1)}</span></span>`;
    });
    for (let pass = 0; pass < 3; pass++) {
      if (!s.includes('\\sqrt')) break;
      s = replaceOneArgCommand(s, 'sqrt', (inner) => {
        return `<span class="mv-math-sqrt math-sqrt"><span class="mv-math-surd">√</span><span class="mv-math-radicand math-radicand">${parseSegment(inner, depth + 1)}</span></span>`;
      });
    }

    // 4. Xử lý vectơ, đoạn thẳng có hướng, trung bình cộng, góc mũ
    s = replaceOneArgCommand(s, 'overrightarrow', (inner) =>
      `<span class="mv-math-vec mv-math-vec-long math-vec"><span class="mv-math-vec-arrow math-vec-arrow">⟶</span><span class="mv-math-vec-sym math-vec-sym">${parseSegment(inner, depth + 1)}</span></span>`
    );
    s = replaceOneArgCommand(s, 'vec', (inner) =>
      `<span class="mv-math-vec math-vec"><span class="mv-math-vec-arrow math-vec-arrow">→</span><span class="mv-math-vec-sym math-vec-sym">${parseSegment(inner, depth + 1)}</span></span>`
    );
    s = replaceOneArgCommand(s, 'overline', (inner) =>
      `<span class="mv-math-overline">${parseSegment(inner, depth + 1)}</span>`
    );
    s = replaceOneArgCommand(s, 'bar', (inner) =>
      `<span class="mv-math-overline">${parseSegment(inner, depth + 1)}</span>`
    );
    s = replaceOneArgCommand(s, 'widehat', (inner) =>
      `<span class="mv-math-hat"><span class="mv-math-hat-mark">^</span><span class="mv-math-hat-sym">${parseSegment(inner, depth + 1)}</span></span>`
    );
    s = replaceOneArgCommand(s, 'hat', (inner) =>
      `<span class="mv-math-hat"><span class="mv-math-hat-mark">^</span><span class="mv-math-hat-sym">${parseSegment(inner, depth + 1)}</span></span>`
    );

    // 5. Xử lý tổ hợp \binom{n}{k} và phân số \frac{a}{b} (nhiều tầng lồng nhau)
    for (let pass = 0; pass < 3; pass++) {
      if (s.includes('\\binom')) {
        s = replaceTwoArgCommand(s, 'binom', (top, bot) =>
          `<span class="mv-math-binom">(<span class="mv-math-binom-stack"><span class="mv-math-num">${parseSegment(top, depth + 1)}</span><span class="mv-math-den">${parseSegment(bot, depth + 1)}</span></span>)</span>`
        );
      }
      if (s.includes('\\frac')) {
        s = replaceTwoArgCommand(s, 'frac', (num, den) =>
          `<span class="mv-math-frac math-frac"><span class="mv-math-num math-num">${parseSegment(num, depth + 1)}</span><span class="mv-math-den math-denom">${parseSegment(den, depth + 1)}</span></span>`
        );
      }
    }

    // 6. Xử lý giới hạn \lim_{...}, tổng \sum_{...}^{...}, tích phân \int_{...}^{...}
    s = s.replace(/\\lim_\{([^{}]+)\}/g, (_, sub) =>
      `<span class="mv-math-lim"><span class="mv-math-fn">lim</span><sub class="mv-math-lim-sub">${parseSegment(sub, depth + 1)}</sub></span>`
    );
    s = s.replace(/\\sum_\{([^{}]+)\}\^\{([^{}]+)\}/g, (_, sub, sup) =>
      `<span class="mv-math-bigop"><span class="mv-math-op-sym">∑</span><span class="mv-math-op-limits"><sup class="mv-math-op-sup">${parseSegment(sup, depth + 1)}</sup><sub class="mv-math-op-sub">${parseSegment(sub, depth + 1)}</sub></span></span>`
    );
    s = s.replace(/\\sum_\{([^{}]+)\}\^([0-9a-zA-Z]+)/g, (_, sub, sup) =>
      `<span class="mv-math-bigop"><span class="mv-math-op-sym">∑</span><span class="mv-math-op-limits"><sup class="mv-math-op-sup">${parseSegment(sup, depth + 1)}</sup><sub class="mv-math-op-sub">${parseSegment(sub, depth + 1)}</sub></span></span>`
    );
    s = s.replace(/\\sum_([a-zA-Z0-9])/g, (_, sub) =>
      `<span class="mv-math-bigop"><span class="mv-math-op-sym">∑</span><sub class="mv-math-op-sub">${sub}</sub></span>`
    );
    s = s.replace(/\\int_\{([^{}]+)\}\^\{([^{}]+)\}/g, (_, sub, sup) =>
      `<span class="mv-math-bigop"><span class="mv-math-op-sym">∫</span><span class="mv-math-op-limits"><sup class="mv-math-op-sup">${parseSegment(sup, depth + 1)}</sup><sub class="mv-math-op-sub">${parseSegment(sub, depth + 1)}</sub></span></span>`
    );
    s = s.replace(/\\int_([0-9a-zA-Z-]+)\^([0-9a-zA-Z+]+)/g, (_, sub, sup) =>
      `<span class="mv-math-bigop"><span class="mv-math-op-sym">∫</span><span class="mv-math-op-limits"><sup class="mv-math-op-sup">${parseSegment(sup, depth + 1)}</sup><sub class="mv-math-op-sub">${parseSegment(sub, depth + 1)}</sub></span></span>`
    );

    // 7. Escape các dấu < > còn nằm ngoài thẻ HTML an toàn
    const htmlTags = [];
    const safeTagRe = /^<\/?(?:span|sup|sub|strong|em|b|i|br|small|code)(?:\s+(?:class|aria-hidden)="[^"]*")*\s*\/?>$/i;
    s = s.replace(/<[^>]+>/g, (tag) => {
      if (!safeTagRe.test(tag)) {
        return tag.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
      const tok = `@@MVTAG#${htmlTags.length}@@`;
      htmlTags.push(tag);
      return tok;
    });

    s = s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 8. Thay thế ngoặc co giãn \left, \right và các ký hiệu Toán học LaTeX
    s = s
      .replace(/\\mathbb\{R\}/g, 'ℝ')
      .replace(/\\mathbb\{N\}/g, 'ℕ')
      .replace(/\\mathbb\{Z\}/g, 'ℤ')
      .replace(/\\mathbb\{Q\}/g, 'ℚ')
      .replace(/\\mathbb\{C\}/g, 'ℂ')
      .replace(/\\left\s*([()[\]|])/g, '<span class="mv-math-delim">$1</span>')
      .replace(/\\right\s*([()[\]|])/g, '<span class="mv-math-delim">$1</span>')
      .replace(/\\left\\\{/g, '<span class="mv-math-delim">{</span>')
      .replace(/\\right\\\}/g, '<span class="mv-math-delim">}</span>')
      .replace(/\\\{/g, '{')
      .replace(/\\\}/g, '}')
      .replace(/\\not\\parallel/g, '∦')
      .replace(/\\not\\subset/g, '⊄')
      .replace(/\\Leftrightarrow|\\iff/g, ' ⇔ ')
      .replace(/\\Rightarrow|\\implies/g, ' ⇒ ')
      .replace(/\\longrightarrow|\\rightarrow|\\to/g, ' → ')
      .replace(/\\mapsto/g, ' ↦ ')
      .replace(/\\le(?:q)?(?![a-zA-Z])/g, ' ≤ ')
      .replace(/\\ge(?:q)?(?![a-zA-Z])/g, ' ≥ ')
      .replace(/\\ne(?:q)?(?![a-zA-Z])/g, ' ≠ ')
      .replace(/\\approx(?![a-zA-Z])/g, ' ≈ ')
      .replace(/\\equiv(?![a-zA-Z])/g, ' ≡ ')
      .replace(/\\cong(?![a-zA-Z])/g, ' ≅ ')
      .replace(/\\sim(?![a-zA-Z])/g, ' ∼ ')
      .replace(/\\pm(?![a-zA-Z])/g, ' ± ')
      .replace(/\\mp(?![a-zA-Z])/g, ' ∓ ')
      .replace(/\\cdot(?![a-zA-Z])/g, ' · ')
      .replace(/\\times(?![a-zA-Z])/g, ' × ')
      .replace(/\\div(?![a-zA-Z])/g, ' ÷ ')
      .replace(/\\cup(?![a-zA-Z])/g, ' ∪ ')
      .replace(/\\cap(?![a-zA-Z])/g, ' ∩ ')
      .replace(/\\setminus(?![a-zA-Z])/g, ' ∖ ')
      .replace(/\\subseteq(?![a-zA-Z])/g, ' ⊆ ')
      .replace(/\\subset(?![a-zA-Z])/g, ' ⊂ ')
      .replace(/\\in(?![a-zA-Z])/g, ' ∈ ')
      .replace(/\\notin(?![a-zA-Z])/g, ' ∉ ')
      .replace(/\\varnothing|\\emptyset/g, '∅')
      .replace(/\\forall(?![a-zA-Z])/g, '∀')
      .replace(/\\exists(?![a-zA-Z])/g, '∃')
      .replace(/\\infty(?![a-zA-Z])/g, '∞')
      .replace(/\\parallel(?![a-zA-Z])/g, ' ∥ ')
      .replace(/\\perp(?![a-zA-Z])/g, ' ⊥ ')
      .replace(/\\angle(?![a-zA-Z])/g, '∠')
      .replace(/\\triangle(?![a-zA-Z])/g, '△')
      .replace(/\^\\circ|\\circ(?![a-zA-Z])/g, '°')
      .replace(/\\prime(?![a-zA-Z])/g, '′')
      .replace(/\\ell(?![a-zA-Z])/g, 'ℓ')
      .replace(/\\mid(?![a-zA-Z])/g, ' | ')
      .replace(/\\alpha(?![a-zA-Z])/g, 'α')
      .replace(/\\beta(?![a-zA-Z])/g, 'β')
      .replace(/\\gamma(?![a-zA-Z])/g, 'γ')
      .replace(/\\delta(?![a-zA-Z])/g, 'δ')
      .replace(/\\Delta(?![a-zA-Z])/g, 'Δ')
      .replace(/\\varphi(?![a-zA-Z])|\\phi(?![a-zA-Z])/g, 'φ')
      .replace(/\\theta(?![a-zA-Z])/g, 'θ')
      .replace(/\\lambda(?![a-zA-Z])/g, 'λ')
      .replace(/\\mu(?![a-zA-Z])/g, 'μ')
      .replace(/\\pi(?![a-zA-Z])/g, 'π')
      .replace(/\\rho(?![a-zA-Z])/g, 'ρ')
      .replace(/\\sigma(?![a-zA-Z])/g, 'σ')
      .replace(/\\Sigma(?![a-zA-Z])/g, 'Σ')
      .replace(/\\omega(?![a-zA-Z])/g, 'ω')
      .replace(/\\Omega(?![a-zA-Z])/g, 'Ω')
      .replace(/\\int(?![a-zA-Z])/g, '<span class="mv-math-op-sym">∫</span>')
      .replace(/\\sum(?![a-zA-Z])/g, '<span class="mv-math-op-sym">∑</span>')
      .replace(/\\(sin|cos|tan|cot|arcsin|arccos|arctan|log|ln|lim|max|min)(?![a-zA-Z])/g, '<span class="mv-math-fn">$1</span>')
      .replace(/\\qquad/g, '<span class="mv-math-space-lg"></span>')
      .replace(/\\quad/g, '<span class="mv-math-space"></span>')
      .replace(/\\[,;:!]/g, '&nbsp;')
      .replace(/\\\s+/g, '&nbsp;')
      .replace(/\\(?=[\s]|$)/g, '');

    // 9. Xử lý số mũ ^{...}, ^x và chỉ số dưới _{...}, _x
    s = s.replace(/\^\{([^{}]+)\}/g, (_, exp) => `<sup>${parseSegment(exp, depth + 1)}</sup>`);
    s = s.replace(/\^([0-9a-zA-Z′°+-])/g, '<sup>$1</sup>');
    s = s.replace(/_\{([^{}]+)\}/g, (_, sub) => `<sub>${parseSegment(sub, depth + 1)}</sub>`);
    s = s.replace(/_([0-9a-zA-Z∗*+-])/g, '<sub>$1</sub>');

    // Khôi phục các thẻ HTML đã lưu (nhiều vòng cho các thẻ lồng nhau)
    for (let pass = 0; pass < 5; pass++) {
      if (!s.includes('@@MVTAG#') && !s.includes('@@MVTEXT#')) break;
      s = s.replace(/@@MVTAG#(\d+)@@/g, (_, i) => htmlTags[Number(i)] || '');
      s = s.replace(/@@MVTEXT#(\d+)@@/g, (_, i) => textPlaceholders[Number(i)] || '');
    }

    return s;
  };

  const rendered = parseSegment(raw, 0);
  return `<span class="math-rendered mv-math-rendered">${rendered}</span>`;
}

/**
 * Gắn công thức Toán học đã render vào phần tử DOM (ví dụ .mv-r5-latex hoặc #viewer-formula).
 * Bảo toàn mã LaTeX gốc trong dataset.rawLatex để nút "Sao chép LaTeX" hoạt động chính xác.
 */
export function mountRenderedFormula(el, latexStr) {
  if (!el) return;
  const raw = String(latexStr ?? '').trim();
  el.dataset.rawLatex = raw;
  el.classList.add('mv-math-box-rendered');
  el.innerHTML = renderLatexToHtml(raw);
}

const SUBSCRIPT_CHAR_MAP = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '−': '₋', '=': '₌', '(': '₍', ')': '₎',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ',
  'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ',
  's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ', 'y': 'ᵧ'
};

const SUPERSCRIPT_CHAR_MAP = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '−': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'n': 'ⁿ', 'i': 'ⁱ', 'k': 'ᵏ', 'x': 'ˣ', 'y': 'ʸ', 'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'm': 'ᵐ'
};

/**
 * Chuẩn hóa chuỗi văn bản toán học thuần (SVG, thanh trạng thái, thẻ khám phá, số đo)
 * để loại bỏ hoàn toàn kí hiệu thô kiểu ASCII (_, ^) sang kí hiệu Toán học chuẩn Unicode.
 */
export function formatMathText(text) {
  if (text === null || text === undefined) return '';
  let s = String(text).replace(/\u20d7/g, '');
  s = s
    .replace(/\bC_U\s+A\b/g, 'CᵤA')
    .replace(/\bC_U\(([^)]+)\)/g, 'Cᵤ($1)')
    .replace(/\bC_U\b/g, 'Cᵤ')
    .replace(/\bx_TB\b/g, 'x̄')
    .replace(/\bM_e\b/g, 'Mₑ')
    .replace(/\bM_0\b/g, 'M₀')
    .replace(/Δ_Q/g, 'ΔQ')
    .replace(/Δ_a/g, 'Δₐ')
    .replace(/δ_a/g, 'δₐ')
    .replace(/\bh_c\b/g, 'h')
    .replace(/\bh_a\b/g, 'hₐ')
    .replace(/\bA_n\^k\b/g, 'Aₙᵏ')
    .replace(/\bC_n\^k\b/g, 'Cₙᵏ')
    .replace(/\bC_n\^0\b/g, 'Cₙ⁰')
    .replace(/\bC_n\^1\b/g, 'Cₙ¹')
    .replace(/\bC_n\^n\b/g, 'Cₙⁿ')
    .replace(/\bP_n\b/g, 'Pₙ')
    .replace(/\bu_\{n\+1\}/g, 'uₙ₊₁')
    .replace(/\bu_\{n-1\}/g, 'uₙ₋₁')
    .replace(/\bS_xq\b/g, 'Sₓq')
    .replace(/\bS_tp\b/g, 'Sₜₚ')
    .replace(/\bS_đáy\b/g, 'S(đáy)')
    .replace(/\bC_đáy\b/g, 'C(đáy)')
    .replace(/\br_đáy\b/g, 'r(đáy)')
    .replace(/\bV_chóp\b/g, 'V(chóp)')
    .replace(/\bV_lăng trụ\b/g, 'V(lăng trụ)')
    .replace(/\bV_trụ\b/g, 'V(trụ)')
    .replace(/\bV_nón\b/g, 'V(nón)')
    .replace(/\bV_max\b/g, 'Vₘₐₓ')
    .replace(/\bS_max\b/g, 'Sₘₐₓ')
    .replace(/\bF_max\b/g, 'Fₘₐₓ')
    .replace(/\bF_min\b/g, 'Fₘᵢₙ')
    .replace(/\bx_max\b/g, 'xₘₐₓ')
    .replace(/\bx_min\b/g, 'xₘᵢₙ')
    .replace(/\bf_ngửa\b/g, 'f(ngửa)')
    .replace(/α_rad/g, 'α(rad)')
    .replace(/lim_\{([^}]+)\}/g, 'lim($1)')
    .replace(/\blog_a\b/g, 'logₐ')
    .replace(/\blog_2\b/g, 'log₂')
    .replace(/\blog_10\b/g, 'log₁₀')
    .replace(/∫_a\^b/g, '∫ₐᵇ')
    .replace(/∫_0\^1/g, '∫₀¹')
    .replace(/\(a \+ b\)\^n/g, '(a + b)ⁿ')
    .replace(/q\^\(n[-−]1\)/g, 'qⁿ⁻¹')
    .replace(/a\^\(n[-−]k\)/g, 'aⁿ⁻ᵏ')
    .replace(/\b([xyzuva])_([ABMPTI])\b/g, '$1($2)')
    .replace(/\bCF_(\d)\b/g, (_, d) => `CF${SUBSCRIPT_CHAR_MAP[d] || d}`)
    .replace(/([A-Za-zΑ-Ωα-ωΔ])_([0-9ijknmaeorstuvxy]+)/g, (m, base, sub) => {
      const converted = [...sub].map((ch) => SUBSCRIPT_CHAR_MAP[ch]).join('');
      return converted.length === sub.length ? `${base}${converted}` : m;
    })
    .replace(/\^([-−]?[0-9nkxyabcm]+)/g, (m, sup) => {
      const converted = [...sup].map((ch) => SUPERSCRIPT_CHAR_MAP[ch]).join('');
      return converted.length === sup.length ? converted : m;
    });
  return s;
}

/**
 * Định dạng chuỗi văn bản có chứa công thức toán học kẹp giữa dấu $...$ hoặc ký hiệu chỉ số.
 * Dùng cho bảng thông tin thiết diện 3D, thẻ Nhiệm vụ Khám phá 3 bước và thẻ số đo.
 */
export function formatInlineMathHtml(text) {
  if (!text) return '';
  let str = String(text);
  // Chuyển các đoạn $...$ thành công thức Toán học HTML
  str = str.replace(/\$([^$]+)\$/g, (_, mathInner) => renderLatexToHtml(mathInner));
  // Làm đẹp các ký hiệu toán học phổ biến ngoài dấu $
  str = formatMathText(str)
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\%/g, '%')
    .replace(/<=/g, '≤')
    .replace(/>=/g, '≥')
    .replace(/\+\/-/g, '±');
  return str;
}
