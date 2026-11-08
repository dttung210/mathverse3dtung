/**
 * MATHVERSE R6.4 — Phân loại chuyên môn 63 mô hình Toán 6
 * Tuân thủ tuyệt đối quy tắc phân định:
 * - PLANE_MATH_2D: Hình phẳng 2D chuẩn SGK (tam giác, vuông, lục giác, thoi, bình hành, thang cân, góc, đối xứng, v.v.)
 * - SOLID_3D: Khối có thể tích thực sự (khối lập phương bậc thang, xúc xắc lập phương)
 * - PHYSICAL_OBJECT_3D: Vật thể/thiết bị thực tế có hình nổi không gian (đu quay, thiệp gấp, giao lộ, phòng học, đồng xu, đĩa quay)
 * - NUMBER_2D: Trục số, phân số, số thập phân, bảng số, cây thừa số
 * - DATA_2D: Thống kê, bảng số liệu, biểu đồ cột, biểu đồ tranh
 * - PROBABILITY_INTERACTIVE: Xác suất thực nghiệm 2D (rút bóng, oẳn tù tì)
 */

export const TAXONOMY_KINDS = {
  PLANE_MATH_2D: {
    code: 'PLANE_MATH_2D',
    name: 'Hình phẳng 2D',
    badge: 'Hình phẳng 2D (Chuẩn SGK)',
    is3D: false,
    viewerDefault: 'model',
    description: 'Đối tượng hình học phẳng 2D; bảo toàn tính chính xác của SGK, không gán nhãn khối không gian.'
  },
  SOLID_3D: {
    code: 'SOLID_3D',
    name: 'Khối 3D có thể tích',
    badge: 'Khối 3D có thể tích',
    is3D: true,
    viewerDefault: '3d',
    description: 'Khối hình học không gian có thể tích và diện tích thực tế (lập phương, khối ghép đa tầng).'
  },
  PHYSICAL_OBJECT_3D: {
    code: 'PHYSICAL_OBJECT_3D',
    name: 'Vật thể 3D thực tế',
    badge: 'Vật thể 3D thực tế',
    is3D: true,
    viewerDefault: '3d',
    description: 'Mô hình vật thể thực tế trong đời sống thể hiện ở dạng không gian 3 chiều tương tác xoay/zoom.'
  },
  NUMBER_2D: {
    code: 'NUMBER_2D',
    name: 'Số học trực quan 2D',
    badge: 'Số học trực quan 2D',
    is3D: false,
    viewerDefault: 'model',
    description: 'Trục số, phân số, bảng nguyên tố và sơ đồ số học trực quan.'
  },
  DATA_2D: {
    code: 'DATA_2D',
    name: 'Thống kê & Biểu đồ 2D',
    badge: 'Thống kê & Biểu đồ 2D',
    is3D: false,
    viewerDefault: 'model',
    description: 'Biểu đồ tranh, bảng kiểm đếm, biểu đồ cột đơn và cột kép chuẩn dữ liệu SGK.'
  },
  PROBABILITY_INTERACTIVE: {
    code: 'PROBABILITY_INTERACTIVE',
    name: 'Xác suất thực nghiệm 2D',
    badge: 'Xác suất thực nghiệm 2D',
    is3D: false,
    viewerDefault: 'model',
    description: 'Thí nghiệm xác suất thực nghiệm trên mặt phẳng với bảng thống kê tần suất.'
  }
};

export const GRADE6_3D_CAPABLE_IDS = [
  'toan6-vong-quay',
  'toan6-xuc-xac',
  'toan6-dong-xu',
  'toan6-vong-quay-choi',
  'toan6-giao-lo',
  'toan6-thiep-gap',
  'toan6-bac-thang-khoi',
  'toan6-mat-bang-phong-hoc'
];

export const GRADE6_MODEL_TAXONOMY_MAP = {
  // G6-R01: Thế giới hình phẳng
  'toan6-tam-giac-deu': 'PLANE_MATH_2D',
  'toan6-hinh-vuong': 'PLANE_MATH_2D',
  'toan6-luc-giac-deu': 'PLANE_MATH_2D',
  'toan6-chu-nhat': 'PLANE_MATH_2D',
  'toan6-hinh-thoi': 'PLANE_MATH_2D',
  'toan6-binh-hanh': 'PLANE_MATH_2D',
  'toan6-thang-can': 'PLANE_MATH_2D',
  'toan6-ghep-luc-giac': 'PLANE_MATH_2D',
  'toan6-ghep-vuong': 'PLANE_MATH_2D',
  'toan6-lat-nen-da-giac': 'PLANE_MATH_2D',
  'toan6-cat-binh-hanh': 'PLANE_MATH_2D',
  'toan6-cat-hinh-thoi': 'PLANE_MATH_2D',
  'toan6-dien-tich-ghep': 'PLANE_MATH_2D',
  'toan6-lat-gach-san': 'PLANE_MATH_2D',

  // G6-R02: Đối xứng và đo đạc
  'toan6-doi-xung-truc': 'PLANE_MATH_2D',
  'toan6-doi-xung-tam': 'PLANE_MATH_2D',
  'toan6-buom-doi-xung': 'PLANE_MATH_2D',
  'toan6-gap-ngoi-sao': 'PLANE_MATH_2D',
  'toan6-hoa-van-quay': 'PLANE_MATH_2D',
  'toan6-diem-thuoc-duong': 'PLANE_MATH_2D',
  'toan6-ba-diem-thang-hang': 'PLANE_MATH_2D',
  'toan6-hai-duong-thang': 'PLANE_MATH_2D',
  'toan6-hai-tia-doi-nhau': 'PLANE_MATH_2D',
  'toan6-do-doan-thang': 'PLANE_MATH_2D',
  'toan6-trung-diem': 'PLANE_MATH_2D',
  'toan6-goc-dong': 'PLANE_MATH_2D',
  'toan6-phan-loai-goc': 'PLANE_MATH_2D',
  'toan6-dong-ho-goc': 'PLANE_MATH_2D',

  // G6-R03: Số học trực quan
  'toan6-tap-hop-venn': 'NUMBER_2D',
  'toan6-gia-tri-hang-so': 'NUMBER_2D',
  'toan6-truc-so-tu-nhien': 'NUMBER_2D',
  'toan6-truc-so-nguyen': 'NUMBER_2D',
  'toan6-buoc-nhay-so-nguyen': 'NUMBER_2D',
  'toan6-nhiet-ke': 'NUMBER_2D',
  'toan6-cay-thua-so': 'NUMBER_2D',
  'toan6-binh-phuong-luy-thua': 'NUMBER_2D',
  'toan6-thanh-phan-so': 'NUMBER_2D',
  'toan6-luoi-phan-so': 'NUMBER_2D',
  'toan6-banh-phan-so': 'NUMBER_2D',
  'toan6-phan-so-bang-nhau': 'NUMBER_2D',
  'toan6-so-sanh-phan-so': 'NUMBER_2D',
  'toan6-phan-so-cua-so': 'NUMBER_2D',
  'toan6-hang-thap-phan': 'NUMBER_2D',
  'toan6-luoi-100-phan-tram': 'NUMBER_2D',
  'mv15-uoc-boi-bang100': 'NUMBER_2D',
  'mv15-nguyen-to-bang100': 'NUMBER_2D',
  'mv15-cong-phan-so-cung-mau': 'NUMBER_2D',

  // G6-R04: Dữ liệu và cuộc sống
  'toan6-bang-kiem-dem': 'DATA_2D',
  'toan6-bieu-do-tranh': 'DATA_2D',
  'toan6-cot-don': 'DATA_2D',
  'toan6-cot-ngang': 'DATA_2D',
  'toan6-cot-kep': 'DATA_2D',
  'toan6-bang-thu-thap': 'DATA_2D',
  'toan6-vong-quay': 'PHYSICAL_OBJECT_3D', // Đĩa quay 3D
  'toan6-xuc-xac': 'SOLID_3D',             // Khối lập phương 6 mặt
  'toan6-rut-bong': 'PROBABILITY_INTERACTIVE',
  'toan6-dong-xu': 'PHYSICAL_OBJECT_3D',   // Đồng xu đĩa 3D
  'toan6-o-tu-ti': 'PROBABILITY_INTERACTIVE',
  'toan6-vong-quay-choi': 'PHYSICAL_OBJECT_3D', // Vòng đu quay 8 cabin 3D
  'toan6-giao-lo': 'PHYSICAL_OBJECT_3D',   // Hai làn giao lộ 3D
  'toan6-thiep-gap': 'PHYSICAL_OBJECT_3D', // Thiệp gấp không gian 3D
  'toan6-bac-thang-khoi': 'SOLID_3D',      // Khối lập phương ghép bậc thang 3D
  'toan6-mat-bang-phong-hoc': 'PHYSICAL_OBJECT_3D' // Mặt bằng phòng học 12 bàn 3D
};

export function getModelTaxonomy(modelId) {
  const code = GRADE6_MODEL_TAXONOMY_MAP[modelId] || 'PLANE_MATH_2D';
  return TAXONOMY_KINDS[code] || TAXONOMY_KINDS.PLANE_MATH_2D;
}

export function isTrue3DCapable(modelId) {
  return GRADE6_3D_CAPABLE_IDS.includes(modelId);
}

export function isSolid3D(modelId) {
  return modelId === 'toan6-bac-thang-khoi' || modelId === 'toan6-xuc-xac';
}
