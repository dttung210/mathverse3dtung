/**
 * MATHVERSE V5 - Math Measurements Engine
 * Tính toán số đo độ dài, góc, chu vi, diện tích và tọa độ chính xác.
 */

export const Measurements = {
  /**
   * Khoảng cách Euclid giữa 2 điểm 2D
   */
  distance2D(p1, p2) {
    const d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    return Math.round(d * 100) / 100;
  },

  /**
   * Góc giữa hai vectơ (độ, từ 0 đến 180).
   * Trả về null nếu một trong hai vectơ là vectơ không (độ dài = 0), không coi là 0°.
   */
  angleBetweenVectors(u, v) {
    if (!Array.isArray(u) || !Array.isArray(v) || u.length < 2 || v.length < 2) return null;
    const dot = u[0] * v[0] + u[1] * v[1];
    const lenU = Math.hypot(u[0], u[1]);
    const lenV = Math.hypot(v[0], v[1]);
    if (lenU < 1e-9 || lenV < 1e-9) return null;
    const cosVal = Math.max(-1, Math.min(1, dot / (lenU * lenV)));
    const deg = (Math.acos(cosVal) * 180) / Math.PI;
    return Math.round(deg * 10) / 10;
  },

  describeAngleBetweenVectors(u, v) {
    const angle = this.angleBetweenVectors(u, v);
    if (angle === null) {
      return 'Góc không xác định (vectơ không có độ dài / không xác định hướng)';
    }
    return `${angle}°`;
  },

  /**
   * Diện tích hình bình hành từ hai vectơ AB và AD: |det(AB, AD)|
   */
  parallelogramArea(A, B, D) {
    const u = [B[0] - A[0], B[1] - A[1]];
    const v = [D[0] - A[0], D[1] - A[1]];
    const det = Math.abs(u[0] * v[1] - u[1] * v[0]);
    return Math.round(det * 100) / 100;
  },

  /**
   * Chu vi hình bình hành từ các đỉnh A, B, D
   */
  parallelogramPerimeter(A, B, D) {
    const ab = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const ad = Math.hypot(D[0] - A[0], D[1] - A[1]);
    return Math.round(2 * (ab + ad) * 100) / 100;
  },

  /**
   * Diện tích tam giác từ 3 đỉnh
   */
  triangleArea(A, B, C) {
    const det = Math.abs(A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
    return Math.round((det / 2) * 100) / 100;
  },

  /**
   * Chu vi tam giác
   */
  trianglePerimeter(A, B, C) {
    const ab = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const bc = Math.hypot(C[0] - B[0], C[1] - B[1]);
    const ca = Math.hypot(A[0] - C[0], A[1] - C[1]);
    return Math.round((ab + bc + ca) * 100) / 100;
  }
};
