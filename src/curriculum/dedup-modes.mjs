/**
 * MATHVERSE R96 — BẢNG HỢP NHẤT MÔ HÌNH CÙNG CHUYỂN ĐỘNG TOÁN 6–12
 * Nguyên tắc sư phạm: Trong cùng một bài học (Toán 6 → Toán 12), nếu 2 mô hình có cùng
 * cơ chế chuyển động hoặc dùng chung một mô hình hình học/đồ thị, chỉ chọn 1 mô hình đại diện
 * duy nhất để hiển thị trên danh mục bài học. Toàn bộ 310 ID gốc vẫn được bảo toàn trong
 * chỉ mục hệ thống để tương thích ngược và phục vụ kiểm thử tự động.
 */

export const DEDUP_MERGED_TO_PRIMARY = Object.freeze({
  // ================= TOÁN 6 =================
  // Bài 13: Tập hợp các số nguyên (cùng trượt điểm trên trục số nguyên)
  'toan6-nhiet-ke': 'toan6-truc-so-nguyen',
  // Bài 18: Tam giác đều, Hình vuông, Lục giác đều
  'toan6-ghep-luc-giac': 'toan6-luc-giac-deu',
  'toan6-ghep-vuong': 'toan6-hinh-vuong',
  // Bài 19: Hình chữ nhật, Hình thoi, Hình bình hành, Hình thang cân
  'toan6-mat-bang-phong-hoc': 'toan6-chu-nhat',
  // Bài 20: Chu vi và diện tích tứ giác
  'toan6-lat-gach-san': 'toan6-dien-tich-ghep',
  // Bài 21: Hình có trục đối xứng (cùng gập đối xứng qua trục)
  'toan6-buom-doi-xung': 'toan6-doi-xung-truc',
  'toan6-gap-ngoi-sao': 'toan6-doi-xung-truc',
  'toan6-thiep-gap': 'toan6-doi-xung-truc',
  // Bài 22: Hình có tâm đối xứng (cùng quay 180° quanh tâm O)
  'toan6-hoa-van-quay': 'toan6-doi-xung-tam',
  // Bài 23: Mở rộng phân số, phân số bằng nhau
  'toan6-luoi-phan-so': 'toan6-phan-so-bang-nhau',
  'toan6-thanh-phan-so': 'toan6-phan-so-bang-nhau',
  // Bài 32: Điểm và đường thẳng (cùng quay 2 đường thẳng cắt nhau)
  'toan6-giao-lo': 'toan6-hai-duong-thang',
  // Bài 33: Điểm nằm giữa hai điểm. Tia (cùng dịch chuyển điểm trên đường thẳng qua 3 điểm)
  'toan6-hai-tia-doi-nhau': 'toan6-ba-diem-thang-hang',
  // Bài 36: Góc (cùng quét góc giữa hai tia)
  'toan6-vong-quay-choi': 'toan6-goc-dong',
  // Bài 37: Số đo góc (cùng mở góc nhọn - vuông - tù - bẹt)
  'toan6-dong-ho-goc': 'toan6-phan-loai-goc',
  // Bài 39: Bảng thống kê và biểu đồ tranh
  'toan6-bang-kiem-dem': 'toan6-bieu-do-tranh',
  // Bài 40: Biểu đồ cột
  'toan6-cot-ngang': 'toan6-cot-don',

  // ================= TOÁN 7 =================
  // Bài 9: Hai đường thẳng song song và dấu hiệu nhận biết (cùng cát tuyến cắt 2 đường thẳng song song)
  '7-02-C05': '7-02-C03',
  // Bài 18: Biểu đồ hình quạt tròn (cùng biểu đồ quạt tròn)
  '7-06-C02': '7-06-C01',
  // Bài 19: Biểu đồ đoạn thẳng (cùng biểu đồ đoạn thẳng theo thời gian)
  '7-07-C02': '7-07-C01',

  // ================= TOÁN 8 =================
  // Bài 15: Định lí Thalès trong tam giác (cùng trượt đoạn thẳng song song đáy trên tam giác ABC)
  '8-03-C02': '8-03-C01',
  // Bài 17: Tính chất đường phân giác của tam giác (cùng dựng phân giác trong AD chia cạnh đáy BC)
  '8-04-C02': '8-04-C01',
  // Bài 29: Hệ số góc của đường thẳng (cùng biểu diễn đường thẳng y = ax + b khi thay đổi hệ số góc)
  '8-07-C03': '8-07-C02',
  // Bài 31: Cách tính xác suất của biến cố bằng tỉ số
  '7-10-C02': '8-08-C04',
  // Bài 32: Mối liên hệ giữa xác suất thực nghiệm với xác suất
  '7-10-C03': '8-08-C05',
  '9-13-C03': '8-08-C05',
  // Bài 35: Định lí Pythagore và ứng dụng (cùng kiểm nghiệm hệ thức a² + b² = c²)
  '8-05-C02': '8-05-C01',
  // Bài 37: Hình đồng dạng (cùng phóng/thu đồng dạng tam giác A'B'C' ~ ABC)
  '8-06-C09': '8-06-C08',

  // ================= TOÁN 9 =================
  // Bài 2: Giải hệ hai phương trình bậc nhất hai ẩn (cùng tương giao 2 đường thẳng trong Oxy)
  '9-01-C02': '9-01-C01',
  '9-01-C03': '9-01-C01',
  // Bài 6: Bất phương trình bậc nhất một ẩn (cùng biểu diễn miền nghiệm trên trục số)
  '9-02-C02': '9-02-C01',
  // Bài 11: Tỉ số lượng giác của góc nhọn (cùng tam giác vuông ABC thay đổi góc nhọn alpha)
  '9-03-C02': '9-03-C01',
  // Bài 12: Hệ thức giữa cạnh, góc trong tam giác vuông và ứng dụng (cùng tia ngắm giác kế)
  '9-04-C02': '9-04-C01',
  // Bài 15: Độ dài cung tròn, diện tích hình quạt tròn (cùng quét góc ở tâm hình quạt tròn)
  '9-05-C03': '9-05-C04',
  // Bài 16: Vị trí tương đối của đường thẳng và đường tròn (cùng kéo khoảng cách d từ tâm O đến đường thẳng)
  '9-06-C02': '9-06-C01',
  '9-06-C03': '9-06-C01',
  // Bài 17: Vị trí tương đối của hai đường tròn (cùng kéo khoảng cách nối tâm OO' = d)
  '9-06-C05': '9-06-C04',
  '9-06-C06': '9-06-C04',
  // Bài 18: Hàm số y = ax² (a ≠ 0) (cùng khảo sát parabol y = ax² với thanh trượt a âm/dương và cặp điểm đối xứng)
  '9-08-C02': '9-08-C01',
  '9-08-C03': '9-08-C01',
  // Bài 32: Hình cầu (cùng quét mặt cầu 3D bán kính R)
  '9-11-C01': '9-11-C02',

  // ================= TOÁN 10 =================
  // Bài 2: Tập hợp và các phép toán trên tập hợp (cùng sơ đồ Venn 2 tập hợp A, B)
  '10-01-C02': '10-01-C01',
  '10-01-C03': '10-01-C01',
  // Bài 4: Hệ bất phương trình bậc nhất hai ẩn (cùng miền đa giác nghiệm trên Oxy)
  '10-02-C03': '10-02-C02',
  // Bài 8: Tổng và hiệu của hai vectơ (cùng quy tắc hình bình hành / tam giác hai vectơ)
  '10-04-C02': '10-04-C01',
  // Bài 10: Vectơ trong mặt phẳng tọa độ (cùng biểu diễn tọa độ và độ dài vectơ trên Oxy)
  '10-05-C02': '10-05-C01',
  // Bài 11: Tích vô hướng của hai vectơ (cùng góc và tích vô hướng giữa hai vectơ)
  '10-05-C03': '10-04-C04',
  // Bài 14: Các số đặc trưng đo độ phân tán
  '10-10-C03': '10-10-C02',
  // Bài 16: Hàm số bậc hai (cùng khảo sát parabol y = ax² + bx + c với a > 0, a < 0, đỉnh và trục đối xứng)
  '10-06-C02': '10-06-C01',
  '10-06-C03': '10-06-C01',
  // Bài 19: Phương trình đường thẳng (cùng biểu diễn đường thẳng qua điểm và vectơ trên Oxy)
  '10-07-C02': '10-07-C01',

  // ================= TOÁN 11 =================
  // Bài 1: Giá trị lượng giác của góc lượng giác (cùng điểm M quét trên đường tròn lượng giác)
  '11-01-C01': '11-01-C02',
  '11-01-C03': '11-01-C02',
  // Bài 3: Hàm số lượng giác (hợp nhất cặp đồ thị sóng sin/cos và cặp đồ thị tiệm cận tan/cot)
  '11-02-C02': '11-02-C01',
  '11-02-C04': '11-02-C03',
  // Bài 4: Phương trình lượng giác cơ bản (cùng tương giao đường thẳng y = m với đồ thị lượng giác)
  '11-02-C06': '11-02-C05',
  // Bài 9: Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm
  '11-04-C03': '11-04-C02',
  // Bài 20: Hàm số mũ và hàm số lôgarit (11-11-C03 biểu diễn đồng thời cả hai hàm mũ và logarit đối xứng qua y = x)
  '11-11-C01': '11-11-C03',
  '11-11-C02': '11-11-C03',
  // Bài 25: Hai mặt phẳng vuông góc (cùng mô hình 3D twoPlanes mở góc nhị diện giữa hai mặt phẳng)
  '11-08-C02': '11-07-C03',
  // Bài 31: Định nghĩa và ý nghĩa của đạo hàm (cùng cát tuyến hội tụ về tiếp tuyến trên đồ thị y = f(x))
  '11-12-C01': '11-12-C02',

  // ================= TOÁN 12 =================
  // Bài 1: Tính đơn điệu và cực trị của hàm số (cùng điểm trượt khảo sát dấu đạo hàm f'(x) và cực trị trên hàm bậc ba)
  '12-01-C01': '12-01-C02',
  // Bài 3: Đường tiệm cận của đồ thị hàm số (cùng đồ thị hàm phân thức và các đường tiệm cận)
  '12-02-C04': '12-02-C03',
  // Bài 4: Khảo sát sự biến thiên và vẽ đồ thị của hàm số (cùng bảng biến thiên và đồ thị hàm bậc ba)
  '12-01-C04': '12-02-C01',
  // Bài 8: Biểu thức tọa độ của các phép toán vectơ (cùng mô hình 3D oxyzVectorPair trong không gian Oxyz)
  '12-04-C03': '12-04-C04',
  // Bài 9: Khoảng biến thiên và khoảng tứ phân vị của mẫu số liệu ghép nhóm
  '12-05-C01': '12-05-C02',
  // Bài 13: Ứng dụng hình học của tích phân (cùng mô hình 3D khối tròn xoay revolvedSolid quanh trục Ox)
  '12-07-C03': '12-07-C01',
  // Bài 14: Phương trình mặt phẳng (cùng mặt phẳng và điểm trong Oxyz)
  '12-08-C03': '12-08-C01',
  // Bài 15: Phương trình đường thẳng trong không gian (cùng mô hình 3D oxyzLine qua điểm và vectơ chỉ phương)
  '12-09-C02': '12-09-C01',
  // Bài 18: Xác suất có điều kiện (cùng sơ đồ cây xác suất 2 nhánh)
  '12-11-C02': '12-11-C01',
  // Bài 19: Công thức xác suất toàn phần và công thức Bayes (cùng sơ đồ cây Bayes)
  '12-11-C04': '12-11-C03'
});

const PRIMARY_TO_MERGED = new Map();
for (const [sec, pri] of Object.entries(DEDUP_MERGED_TO_PRIMARY)) {
  if (!PRIMARY_TO_MERGED.has(pri)) PRIMARY_TO_MERGED.set(pri, []);
  PRIMARY_TO_MERGED.get(pri).push(sec);
}

export function isDuplicateMergedModeId(id) {
  return Boolean(id && Object.prototype.hasOwnProperty.call(DEDUP_MERGED_TO_PRIMARY, String(id)));
}

export function resolveDeduplicatedModeId(id) {
  const key = String(id || '');
  return DEDUP_MERGED_TO_PRIMARY[key] || key;
}

export function getMergedSecondaryIds(primaryId) {
  return PRIMARY_TO_MERGED.get(String(primaryId || '')) || [];
}

