/**
 * MATHVERSE V5 - Statistics Engine
 * Tính toán số đặc trưng mẫu thống kê: Số lượng, Tổng, Trung bình, Trung vị, Mốt, Phương sai.
 * Phân biệt rõ ràng giữa "Mẫu số liệu thô (raw numeric observations)" và "Bảng tần số ghép nhóm/phân loại".
 */

function toFiniteNumber(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (!trimmed) return NaN;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

export const Stats = {
  /**
   * Phân tích dãy số liệu quan sát thô
   * Ví dụ: [12, 18, 9, 15] -> count: 4, sum: 54, mean: 13.5, median: 13.5
   * Phân biệt rõ quan sát thiếu/không phải số với quan sát bằng 0 (không tự ép chữ thành 0).
   */
  analyzeRaw(values) {
    if (!Array.isArray(values) || values.length === 0) {
      return {
        isRaw: true,
        valid: true,
        count: 0,
        inputCount: 0,
        invalidCount: 0,
        invalidValues: [],
        sum: 0,
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        warning: null
      };
    }

    const nums = [];
    const invalidValues = [];
    for (const v of values) {
      const parsed = toFiniteNumber(v);
      if (Number.isFinite(parsed)) {
        nums.push(parsed);
      } else {
        invalidValues.push(v);
      }
    }

    const warning =
      invalidValues.length > 0
        ? `Phát hiện ${invalidValues.length} giá trị không phải số hợp lệ (${invalidValues.map(x => String(x)).join(', ')}); đã loại khỏi mẫu thống kê (không tính là 0).`
        : null;

    if (nums.length === 0) {
      return {
        isRaw: true,
        valid: false,
        count: 0,
        inputCount: values.length,
        invalidCount: invalidValues.length,
        invalidValues,
        sum: 0,
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        warning
      };
    }

    const n = nums.length;
    const sum = nums.reduce((acc, x) => acc + x, 0);
    const mean = sum / n;

    const sorted = [...nums].sort((a, b) => a - b);
    let median = 0;
    if (n % 2 === 1) {
      median = sorted[Math.floor(n / 2)];
    } else {
      median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    }

    return {
      isRaw: true,
      valid: invalidValues.length === 0,
      count: n,
      inputCount: values.length,
      invalidCount: invalidValues.length,
      invalidValues,
      sum: Math.round(sum * 100) / 100,
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      min: sorted[0],
      max: sorted[n - 1],
      warning
    };
  },

  /** Five-number summary: median of each half, excluding the middle for odd n. */
  fiveNumberSummary(values){
    const nums=(Array.isArray(values)?values:[]).map(toFiniteNumber).filter(Number.isFinite).sort((a,b)=>a-b);
    if(!nums.length)return null;
    const med=arr=>{const n=arr.length;return n%2?arr[(n-1)/2]:(arr[n/2-1]+arr[n/2])/2;};
    const n=nums.length,k=Math.floor(n/2),lo=nums.slice(0,k),hi=nums.slice(n-k);
    return {min:nums[0],q1:lo.length?med(lo):nums[0],median:med(nums),q3:hi.length?med(hi):nums[n-1],max:nums[n-1]};
  },

  /**
   * Phân tích bảng tần số danh mục (ví dụ điểm môn học, nhóm A, B, C, D)
   * Lưu ý toán học:
   * - Số nhóm phân loại (categories) và số tần số (frequencies) phải khớp nhau.
   * - Ô thiếu tên nhóm hoặc tần số phi số/âm không được góp vào mẫu.
   */
  analyzeCategorical(categories, frequencies) {
    if (!Array.isArray(categories) || !Array.isArray(frequencies) || categories.length !== frequencies.length) {
      return {
        isCategorical: true,
        valid: false,
        error: `Số loại (${Array.isArray(categories) ? categories.length : 0}) và số tần số (${Array.isArray(frequencies) ? frequencies.length : 0}) không bằng nhau — vui lòng sửa bảng dữ liệu đồng kích thước.`,
        totalCount: 0,
        percentages: [],
        modeCategories: []
      };
    }

    const validCategories = [];
    const validFreqs = [];
    let skippedCount = 0;

    for (let i = 0; i < categories.length; i++) {
      const label = typeof categories[i] === 'string' ? categories[i].trim() : String(categories[i] ?? '').trim();
      const freq = toFiniteNumber(frequencies[i]);
      if (!label || !Number.isFinite(freq) || freq < 0) {
        skippedCount++;
        continue;
      }
      validCategories.push(label);
      validFreqs.push(freq);
    }

    if (skippedCount > 0 && validCategories.length === 0) {
      return {
        isCategorical: true,
        valid: false,
        error: 'Bảng phân loại không có cặp (nhóm, tần số) hợp lệ.',
        totalCount: 0,
        percentages: [],
        modeCategories: []
      };
    }

    const totalFreq = validFreqs.reduce((acc, f) => acc + f, 0);
    const maxFreq = Math.max(...validFreqs, 0);
    const modes = validCategories.filter((_, idx) => validFreqs[idx] === maxFreq && maxFreq > 0);

    return {
      isCategorical: true,
      valid: skippedCount === 0,
      error: skippedCount > 0 ? `Đã bỏ qua ${skippedCount} mục thiếu tên nhóm hoặc tần số không hợp lệ.` : null,
      categories: validCategories,
      totalCount: totalFreq,
      percentages: totalFreq > 0 ? validFreqs.map(f => Math.round((f / totalFreq) * 1000) / 10) : validFreqs.map(() => 0),
      modeCategories: modes
    };
  },

  /**
   * Chia nhóm số liệu thô thành histogram với các khoảng (bins)
   */
  /** Build finite, equal-width histogram classes from the actual numeric observations. */
  makeHistogramEdges(values, desiredBins=5) {
    const nums=(Array.isArray(values)?values:[]).map(toFiniteNumber).filter(Number.isFinite);
    if(!nums.length)return [0,1,2,3,4,5];
    const min=Math.min(...nums),max=Math.max(...nums);
    const bins=Math.max(2,Math.min(10,Math.round(desiredBins)||5));
    const rawWidth=(max-min||Math.max(1,Math.abs(min)*.1))/bins;
    const power=10**Math.floor(Math.log10(rawWidth));
    const factor=rawWidth/power;
    const nice=factor<=1?1:factor<=2?2:factor<=5?5:10;
    const width=nice*power;
    const start=Math.floor(min/width)*width;
    let n=Math.max(bins,Math.ceil((max-start)/width));
    if(n>12){n=Math.ceil((max-min||1)/width);}
    return Array.from({length:n+1},(_,i)=>Number((start+i*width).toPrecision(12)));
  },

  computeHistogramBins(values, binEdges = [0, 10, 20, 30, 40]) {
    if (!Array.isArray(binEdges) || binEdges.length < 2) return [];
    const counts = new Array(binEdges.length - 1).fill(0);
    const safeValues = Array.isArray(values) ? values : [];
    safeValues.forEach(v => {
      const val = toFiniteNumber(v);
      if (!Number.isFinite(val)) return; // Không tự xếp văn bản phi số vào nhóm chứa 0
      for (let i = 0; i < binEdges.length - 1; i++) {
        const lower = binEdges[i];
        const upper = binEdges[i + 1];
        // Khoảng cuối cùng lấy cả biên phải [a, b]
        if (i === binEdges.length - 2) {
          if (val >= lower && val <= upper) {
            counts[i]++;
            break;
          }
        } else {
          if (val >= lower && val < upper) {
            counts[i]++;
            break;
          }
        }
      }
    });
    return counts;
  }
};
