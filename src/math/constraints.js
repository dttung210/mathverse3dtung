/**
 * MATHVERSE V5 - Math Constraints Engine
 * Giải và duy trì các bất biến hình học 2D (ví dụ: Hình bình hành C = B + D - A)
 */

export const Constraints = {
  /**
   * Tính đỉnh C của hình bình hành ABCD khi biết A, B, D: C = B + D - A
   */
  parallelogramC(A, B, D) {
    return [
      Math.round((B[0] + D[0] - A[0]) * 1000) / 1000,
      Math.round((B[1] + D[1] - A[1]) * 1000) / 1000
    ];
  },

  /**
   * Tính trung điểm M của đoạn thẳng AB: M = (A + B) / 2
   */
  midpoint(A, B) {
    return [
      Math.round(((A[0] + B[0]) / 2) * 1000) / 1000,
      Math.round(((A[1] + B[1]) / 2) * 1000) / 1000
    ];
  },

  /**
   * Điểm chia đoạn thẳng theo tỉ số k: P = A + k * (B - A)
   */
  interpolate(A, B, k) {
    return [
      Math.round((A[0] + k * (B[0] - A[0])) * 1000) / 1000,
      Math.round((A[1] + k * (B[1] - A[1])) * 1000) / 1000
    ];
  },

  /**
   * Kiểm tra 3 điểm thẳng hàng (diện tích tam giác ~ 0)
   */
  areCollinear(A, B, C, eps = 1e-4) {
    const area = 0.5 * Math.abs(A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
    return area < eps;
  },

  /**
   * Kiểm tra hai vectơ song song (tích có hướng trong mặt phẳng ~ 0)
   */
  areParallel(u, v, eps = 1e-4) {
    return Math.abs(u[0] * v[1] - u[1] * v[0]) < eps;
  },

  /**
   * Chiếu vuông góc điểm P lên đường thẳng qua A, B.
   * Nếu hai điểm A và B trùng nhau (A = B), không xác định được đường thẳng duy nhất -> trả về null.
   */
  projectPointToLine(P, A, B) {
    if (!Array.isArray(P) || !Array.isArray(A) || !Array.isArray(B)) return null;
    const dx = B[0] - A[0], dy = B[1] - A[1];
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-9) return null;
    const t = ((P[0] - A[0]) * dx + (P[1] - A[1]) * dy) / lenSq;
    return [
      Math.round((A[0] + t * dx) * 1000) / 1000,
      Math.round((A[1] + t * dy) * 1000) / 1000
    ];
  },

  describeProjectionToLine(P, A, B) {
    const H = this.projectPointToLine(P, A, B);
    if (!H) {
      return 'Đường thẳng chưa xác định (hai điểm A và B trùng nhau — cần chọn hai điểm phân biệt).';
    }
    return `H(${H[0]}; ${H[1]})`;
  }
};
