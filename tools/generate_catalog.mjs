import fs from 'node:fs';
import path from 'node:path';

const items = [
  // =================== LỚP 6 (9 MÔ HÌNH) ===================
  {
    id: "g6_03", grade: 6, type: "polygon",
    title: "Lục giác đều trong mặt phẳng",
    category: "Hình học trực quan",
    chapter: "Chương IV: Một số hình phẳng trong thực tiễn",
    topic: "Tam giác đều, hình vuông, lục giác đều",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 6 (Tr. 48)",
    description: "Khám phá đa giác đều 6 cạnh bằng nhau và 6 góc bằng nhau. Học sinh có thể điều chỉnh số cạnh n và bán kính đường tròn ngoại tiếp R để quan sát sự thay đổi chu vi và diện tích.",
    formula: "P = 2nR\\sin\\left(\\frac{\\pi}{n}\\right)",
    params: { n: 6, r: 2.6 }, custom: false
  },
  {
    id: "g6_06", grade: 6, type: "rhombus",
    title: "Hình thoi và hai đường chéo",
    category: "Hình học trực quan",
    chapter: "Chương IV: Một số hình phẳng trong thực tiễn",
    topic: "Hình thoi",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 6 (Tr. 48)",
    description: "Mô hình hình thoi có 4 cạnh bằng nhau, hai đường chéo vuông góc tại trung điểm của mỗi đường. Điều chỉnh độ dài hai đường chéo d₁ và d₂ để tính diện tích.",
    formula: "S = \\frac{1}{2} d_1 d_2",
    params: { a: 6, b: 4 }, custom: false
  },
  {
    id: "g6_07", grade: 6, type: "trapezoid",
    title: "Hình thang cân",
    category: "Hình học trực quan",
    chapter: "Chương IV: Một số hình phẳng trong thực tiễn",
    topic: "Hình thang cân",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 6 (Tr. 49)",
    description: "Mô hình hình thang cân có hai đáy song song, hai cạnh bên bằng nhau và hai góc kề một đáy bằng nhau. Thay đổi đáy lớn a, đáy nhỏ b và chiều cao h.",
    formula: "S = \\frac{(a + b)h}{2}",
    params: { a: 6, b: 3, h: 3 }, custom: false
  },
  {
    id: "g6_09", grade: 6, type: "parallelogram",
    title: "Hình bình hành và chiều cao",
    category: "Hình học trực quan",
    chapter: "Chương IV: Một số hình phẳng trong thực tiễn",
    topic: "Hình bình hành",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 6 (Tr. 48)",
    description: "Mô hình hình bình hành có các cặp cạnh đối song song và bằng nhau. Thanh điều chỉnh cạnh đáy a, cạnh bên b và đường cao h vẽ bằng nét nổi bật.",
    formula: "S = a \\cdot h, \\quad P = 2(a + b)",
    params: { a: 6, b: 4, h: 3.5 }, custom: false
  },
  {
    id: "g6_10", grade: 6, type: "symmetryAxis",
    title: "Hình có trục đối xứng",
    category: "Hình học trực quan",
    chapter: "Chương V: Tính đối xứng của hình phẳng",
    topic: "Hình có trục đối xứng",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 6 (Tr. 50)",
    description: "Mô hình tam giác cân và trục đối xứng d chia hình thành hai nửa đối xứng hoàn hảo. Quan sát trực quan tính đối xứng trục trong đời sống và nghệ thuật.",
    formula: "d \\text{ là trục đối xứng}",
    params: { a: 6, h: 5 }, custom: false
  },
  {
    id: "g6_11", grade: 6, type: "symmetryCenter",
    title: "Hình có tâm đối xứng",
    category: "Hình học trực quan",
    chapter: "Chương V: Tính đối xứng của hình phẳng",
    topic: "Hình có tâm đối xứng",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 6 (Tr. 50)",
    description: "Mô hình hình bình hành có tâm đối xứng O là giao điểm hai đường chéo. Phép quay 180° quanh tâm O biến hình thành chính nó.",
    formula: "O \\text{ là tâm đối xứng}",
    params: { a: 6, b: 4, deg: 60 }, custom: false
  },
  {
    id: "g6_12", grade: 6, type: "segmentMidpoint",
    title: "Đoạn thẳng và trung điểm M",
    category: "Hình học trực quan",
    chapter: "Chương VI: Hình học phẳng cơ bản",
    topic: "Điểm, đường thẳng, đoạn thẳng",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 6 (Tr. 51)",
    description: "Đoạn thẳng AB và điểm M nằm giữa A, B sao cho MA = MB = AB / 2. Kéo thanh trượt độ dài để quan sát vị trí điểm M luôn chia đôi đoạn thẳng.",
    formula: "MA = MB = \\frac{AB}{2}",
    params: { len: 8 }, custom: false
  },
  {
    id: "g6_05", grade: 6, type: "angles",
    title: "Góc nhọn, góc vuông, góc tù",
    category: "Hình học trực quan",
    chapter: "Chương VI: Hình học phẳng cơ bản",
    topic: "Góc và số đo góc",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 6 (Tr. 52)",
    description: "Hai tia chung gốc tạo thành một góc. Điều chỉnh số đo góc từ 5° đến 175° để phân biệt góc nhọn (<90°), góc vuông (=90°), góc tù (>90°) và góc bẹt (=180°).",
    formula: "0^\\circ < \\alpha < 180^\\circ",
    params: { deg: 65 }, custom: false
  },
  {
    id: "g6_13", grade: 6, type: "barChart",
    title: "Biểu đồ cột thống kê 3D",
    category: "Một số yếu tố thống kê",
    chapter: "Chương II: Một số yếu tố thống kê và xác suất",
    topic: "Biểu diễn dữ liệu bằng biểu đồ cột",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 6 (Tr. 46)",
    description: "Biểu đồ cột trong không gian 3D hiển thị số liệu trực quan 4 môn học (Toán, Văn, Anh, KHTN). Kéo từng cột để học sinh so sánh và phân tích trực quan.",
    formula: "h_i \\propto \\text{Tần số}",
    params: { c1: 6, c2: 8, c3: 5, c4: 9 }, custom: false
  },

  // =================== LỚP 7 (9 MÔ HÌNH) ===================
  {
    id: "g7_04", grade: 7, type: "angles",
    title: "Góc ở vị trí đặc biệt: Hai góc kề bù",
    category: "Hình học phẳng",
    chapter: "Chương III: Góc và đường thẳng song song",
    topic: "Góc ở vị trí đặc biệt",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 7 (Tr. 56)",
    description: "Mô hình hai góc kề bù có chung một cạnh và hai cạnh còn lại là hai tia đối nhau. Tổng số đo hai góc luôn bằng 180°.",
    formula: "\\widehat{xOy} + \\widehat{yOz} = 180^\\circ",
    params: { deg: 60 }, custom: false
  },
  {
    id: "g7_09", grade: 7, type: "parallelLines",
    title: "Hai đường thẳng song song và cát tuyến",
    category: "Hình học phẳng",
    chapter: "Chương III: Góc và đường thẳng song song",
    topic: "Dấu hiệu nhận biết hai đường thẳng song song",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 7 (Tr. 57)",
    description: "Đường thẳng c cắt hai đường thẳng song song a và b tạo ra các cặp góc so le trong bằng nhau, các cặp góc đồng vị bằng nhau, trong cùng phía bù nhau.",
    formula: "\\widehat{A}_1 = \\widehat{B}_1 \\quad (\\text{so le trong})",
    params: { angle: 65, dist: 3 }, custom: false
  },
  {
    id: "g7_10", grade: 7, type: "triangleAngles",
    title: "Tổng ba góc trong tam giác",
    category: "Hình học phẳng",
    chapter: "Chương IV: Tam giác bằng nhau",
    topic: "Tổng các góc trong một tam giác",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 7 (Tr. 58)",
    description: "Định lí cơ bản: Trong một tam giác bất kì, tổng số đo ba góc luôn bằng 180°. Điều chỉnh góc đỉnh A và B, góc C tự động cập nhật chính xác.",
    formula: "\\widehat{A} + \\widehat{B} + \\widehat{C} = 180^\\circ",
    params: { a: 60, b: 70 }, custom: false
  },
  {
    id: "g7_11", grade: 7, type: "congruentTriangles",
    title: "Hai tam giác bằng nhau",
    category: "Hình học phẳng",
    chapter: "Chương IV: Tam giác bằng nhau",
    topic: "Các trường hợp bằng nhau của hai tam giác (c-g-c)",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 7 (Tr. 58)",
    description: "Trực quan hóa trường hợp bằng nhau cạnh - góc - cạnh: Khi hai cạnh và góc xen giữa của ΔABC bằng ΔA'B'C' thì hai tam giác chồng khít lên nhau.",
    formula: "\\Delta ABC = \\Delta A'B'C'",
    params: { a: 4, b: 5, deg: 60 }, custom: false
  },
  {
    id: "g7_12", grade: 7, type: "pieChart",
    title: "Biểu đồ hình quạt tròn 3D",
    category: "Một số yếu tố thống kê",
    chapter: "Chương V: Thu thập và biểu diễn dữ liệu",
    topic: "Biểu đồ hình quạt tròn",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 7 (Tr. 54)",
    description: "Biểu đồ hình quạt tròn 3D biểu diễn tỉ lệ phần trăm các thành phần trong toàn thể. Góc ở tâm của mỗi hình quạt tỉ lệ thuận với tỉ lệ phần trăm.",
    formula: "\\alpha_i = \\frac{p_i}{100} \\times 360^\\circ",
    params: { p1: 40, p2: 35, p3: 25 }, custom: false
  },
  {
    id: "g7_13", grade: 7, type: "triangleCenters",
    title: "Sự đồng quy của 3 đường trung tuyến - Trọng tâm G",
    category: "Hình học phẳng",
    chapter: "Chương IV: Quan hệ giữa các yếu tố trong tam giác",
    topic: "Sự đồng quy của ba đường trung tuyến",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 7 (Tr. 60)",
    description: "Ba đường trung tuyến của tam giác cùng đi qua một điểm G gọi là trọng tâm. Trọng tâm cách mỗi đỉnh một khoảng bằng 2/3 độ dài đường trung tuyến đi qua đỉnh đó.",
    formula: "\\frac{GA}{AM} = \\frac{GB}{BN} = \\frac{GC}{CP} = \\frac{2}{3}",
    params: { a: 6, b: 5, c: 5.5 }, custom: false
  },
  {
    id: "g7_02", grade: 7, type: "cuboid",
    title: "Hình hộp chữ nhật và hình lập phương",
    category: "Hình học trực quan trong không gian",
    chapter: "Chương VI: Các hình khối trong thực tiễn",
    topic: "Hình hộp chữ nhật và hình lập phương",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 7 (Tr. 61)",
    description: "Mô hình khối hộp chữ nhật có 6 mặt, 8 đỉnh và 12 cạnh. Tích hợp công cụ cắt mặt phẳng thiết diện ngang và công thức thể tích, diện tích toàn phần.",
    formula: "V = a \\cdot b \\cdot h, \\quad S_{tp} = 2(ab + bh + ha)",
    params: { a: 4, b: 3, h: 2 }, custom: false
  },
  {
    id: "g7_01", grade: 7, type: "triPrism",
    title: "Lăng trụ đứng tam giác",
    category: "Hình học trực quan trong không gian",
    chapter: "Chương VI: Các hình khối trong thực tiễn",
    topic: "Hình lăng trụ đứng tam giác",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 7 (Tr. 62)",
    description: "Khối lăng trụ đứng có hai mặt đáy là tam giác bằng nhau nằm trên hai mặt phẳng song song, các mặt bên là các hình chữ nhật vuông góc với đáy.",
    formula: "V = S_{đáy} \\cdot h = \\frac{\\sqrt{3}}{4} a^2 h",
    params: { a: 3, h: 4 }, custom: false
  },
  {
    id: "g7_14", grade: 7, type: "prismQuad",
    title: "Lăng trụ đứng tứ giác",
    category: "Hình học trực quan trong không gian",
    chapter: "Chương VI: Các hình khối trong thực tiễn",
    topic: "Hình lăng trụ đứng tứ giác",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 7 (Tr. 62)",
    description: "Mô hình hình lăng trụ đứng tứ giác đáy hình thang. Hai đáy song song, các cạnh bên song song và bằng nhau, vuông góc với mặt phẳng đáy.",
    formula: "V = S_{đáy} \\cdot h = \\frac{(a + b)h_{base}}{2} \\cdot h",
    params: { a: 5, b: 3, h_base: 3, h: 6 }, custom: false
  },

  // =================== LỚP 8 (9 MÔ HÌNH) ===================
  {
    id: "g8_01", grade: 8, type: "squarePyramid",
    title: "Hình chóp tứ giác đều",
    category: "Hình khối trong thực tiễn",
    chapter: "Chương IV: Hình học trực quan",
    topic: "Hình chóp tứ giác đều",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 8 (Tr. 67)",
    description: "Hình chóp tứ giác đều có đáy là hình vuông, đỉnh cách đều các đỉnh đáy. Tích hợp tính năng cắt thiết diện ngang và mô phỏng trải phẳng 4 mặt bên.",
    formula: "V = \\frac{1}{3} a^2 h, \\quad S_{xq} = 2a \\cdot d",
    params: { a: 4, h: 3 }, custom: false
  },
  {
    id: "g8_02", grade: 8, type: "trianglePyramid",
    title: "Hình chóp tam giác đều",
    category: "Hình khối trong thực tiễn",
    chapter: "Chương IV: Hình học trực quan",
    topic: "Hình chóp tam giác đều",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 8 (Tr. 67)",
    description: "Hình chóp tam giác đều có mặt đáy là tam giác đều, các mặt bên là tam giác cân bằng nhau. Chiều cao SO hạ từ đỉnh vuông góc tâm đường tròn ngoại tiếp đáy.",
    formula: "V = \\frac{1}{3} S_{đáy} h = \\frac{\\sqrt{3}}{12} a^2 h",
    params: { a: 4, h: 3 }, custom: false
  },
  {
    id: "g8_03", grade: 8, type: "pythagoras",
    title: "Định lí Pythagore và 3 hình vuông trên 3 cạnh",
    category: "Định lí hình học",
    chapter: "Chương III: Định lí Pythagore và các loại tứ giác",
    topic: "Định lí Pythagore",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 8 (Tr. 64)",
    description: "Minh họa hình học kinh điển của Định lí Pythagore: Diện tích hình vuông dựng trên cạnh huyền bằng tổng diện tích hai hình vuông dựng trên hai cạnh góc vuông.",
    formula: "a^2 + b^2 = c^2",
    params: { a: 3, b: 4 }, custom: false
  },
  {
    id: "g8_04", grade: 8, type: "thales",
    title: "Định lí Thalès trong tam giác",
    category: "Định lí hình học",
    chapter: "Chương V: Định lí Thalès trong tam giác",
    topic: "Định lí Thalès thuận và đảo",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 8 (Tr. 68)",
    description: "Đường thẳng song song với một cạnh của tam giác và cắt hai cạnh còn lại định ra trên hai cạnh đó những đoạn thẳng tương ứng tỉ lệ: AM/AB = AN/AC.",
    formula: "\\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}",
    params: { a: 6, b: 7, k: 50 }, custom: false
  },
  {
    id: "g8_05", grade: 8, type: "midSegment",
    title: "Đường trung bình của tam giác",
    category: "Định lí hình học",
    chapter: "Chương V: Định lí Thalès trong tam giác",
    topic: "Đường trung bình của tam giác",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 8 (Tr. 68)",
    description: "Đoạn thẳng MN nối trung điểm hai cạnh AB và AC song song với cạnh đáy BC và có độ dài đúng bằng một nửa cạnh đáy BC: MN = BC / 2.",
    formula: "MN \\parallel BC, \\quad MN = \\frac{1}{2} BC",
    params: { a: 6, h: 5 }, custom: false
  },
  {
    id: "g8_06", grade: 8, type: "parallelogramMid",
    title: "Hình bình hành & Trung điểm hai đường chéo",
    category: "Tứ giác đặc biệt",
    chapter: "Chương III: Các loại tứ giác",
    topic: "Hình bình hành và tính chất hai đường chéo",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 8 (Tr. 65)",
    description: "Trực quan hóa tính chất cốt lõi của hình bình hành: Hai đường chéo AC và BD cắt nhau tại trung điểm O của mỗi đường (OA = OC, OB = OD).",
    formula: "OA = OC, \\quad OB = OD",
    params: { a: 6, b: 4, deg: 60 }, custom: false
  },
  {
    id: "g8_07", grade: 8, type: "rectangleSquare",
    title: "Hình chữ nhật & Hình vuông đặc biệt",
    category: "Tứ giác đặc biệt",
    chapter: "Chương III: Các loại tứ giác",
    topic: "Hình chữ nhật và hình vuông",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 8 (Tr. 65)",
    description: "Hình chữ nhật có 4 góc vuông và hai đường chéo bằng nhau. Khi chiều dài a = chiều rộng b, hình trở thành hình vuông hoàn hảo có 4 trục đối xứng.",
    formula: "d = \\sqrt{a^2 + b^2}, \\quad S = a \\cdot b",
    params: { a: 5, b: 3 }, custom: false
  },
  {
    id: "g8_08", grade: 8, type: "similarTriangles",
    title: "Tam giác đồng dạng và hình vị tự",
    category: "Hình học phẳng",
    chapter: "Chương V: Tam giác đồng dạng",
    topic: "Khái niệm hai tam giác đồng dạng",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 8 (Tr. 69)",
    description: "Hai tam giác đồng dạng có các góc tương ứng bằng nhau và các cạnh tương ứng tỉ lệ. Tỉ số diện tích bằng bình phương tỉ số đồng dạng k².",
    formula: "\\frac{S'}{S} = k^2, \\quad \\Delta A'B'C' \\backsim \\Delta ABC",
    params: { k: 0.6, a: 5 }, custom: false
  },
  {
    id: "g8_09", grade: 8, type: "linearSlope",
    title: "Đồ thị hàm số bậc nhất y = ax + b & Hệ số góc",
    category: "Hàm số và đồ thị",
    chapter: "Chương II: Hàm số bậc nhất",
    topic: "Hệ số góc của đường thẳng y = ax + b",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 8 (Tr. 63)",
    description: "Đường thẳng trên mặt phẳng tọa độ Oxy. Hệ số a quyết định góc tạo bởi đường thẳng và trục Ox; khi a > 0 góc nhọn, khi a < 0 góc tù; b là tung độ gốc.",
    formula: "y = ax + b, \\quad a = \\tan \\alpha",
    params: { a: 1.5, b: 1 }, custom: false
  },

  // =================== LỚP 9 (9 MÔ HÌNH) ===================
  {
    id: "g9_01", grade: 9, type: "cylinder",
    title: "Hình trụ tròn xoay",
    category: "Hình khối tròn xoay",
    chapter: "Chương X: Một số hình khối trong thực tiễn",
    topic: "Hình trụ",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 9 (Tr. 77)",
    description: "Hình trụ sinh ra khi quay hình chữ nhật một vòng quanh một cạnh cố định. Có hai đáy là hai hình tròn song song và bằng nhau, trục nối tâm hai đáy.",
    formula: "V = \\pi r^2 h, \\quad S_{xq} = 2\\pi r h",
    params: { r: 2, h: 4 }, custom: false
  },
  {
    id: "g9_02", grade: 9, type: "cone",
    title: "Hình nón tròn xoay",
    category: "Hình khối tròn xoay",
    chapter: "Chương X: Một số hình khối trong thực tiễn",
    topic: "Hình nón",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 9 (Tr. 77)",
    description: "Hình nón sinh ra khi quay một tam giác vuông quanh một cạnh góc vuông. Đáy là hình tròn, đỉnh S nối với đường tròn đáy bằng các đường sinh l.",
    formula: "V = \\frac{1}{3} \\pi r^2 h, \\quad l = \\sqrt{r^2 + h^2}",
    params: { r: 2, h: 4 }, custom: false
  },
  {
    id: "g9_03", grade: 9, type: "sphereSection",
    title: "Hình cầu & Mặt phẳng cắt tạo hình tròn",
    category: "Hình khối tròn xoay",
    chapter: "Chương X: Một số hình khối trong thực tiễn",
    topic: "Hình cầu và thiết diện của hình cầu",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 9 (Tr. 78)",
    description: "Khi cắt hình cầu tâm O bán kính R bằng mặt phẳng cách tâm khoảng cách d < R, thiết diện thu được luôn là một hình tròn có bán kính r = √(R² - d²).",
    formula: "r = \\sqrt{R^2 - d^2}, \\quad V = \\frac{4}{3}\\pi R^3",
    params: { r: 4, d: 2 }, custom: false
  },
  {
    id: "g9_04", grade: 9, type: "parabola",
    title: "Đồ thị Parabol y = ax² & Trục đối xứng",
    category: "Hàm số và đồ thị",
    chapter: "Chương VI: Hàm số y = ax² (a ≠ 0)",
    topic: "Đồ thị của hàm số y = ax²",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 9 (Tr. 72)",
    description: "Đường cong Parabol có đỉnh là gốc tọa độ O(0,0), nhận trục tung Oy làm trục đối xứng. Khi a > 0 bề lõm hướng lên; khi a < 0 bề lõm hướng xuống.",
    formula: "y = ax^2, \\quad a \\neq 0",
    params: { a: 1, b: 0, c: 0 }, custom: false
  },
  {
    id: "g9_05", grade: 9, type: "trigTriangle",
    title: "Tỉ số lượng giác của góc nhọn trong tam giác vuông",
    category: "Lượng giác",
    chapter: "Chương IV: Hệ thức lượng trong tam giác vuông",
    topic: "Tỉ số lượng giác của góc nhọn",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 9 (Tr. 73)",
    description: "Định nghĩa sin = đối/huyền, cos = kề/huyền, tan = đối/kề. Quan sát giá trị tỉ số lượng giác và góc B thay đổi theo độ dài các cạnh tam giác vuông.",
    formula: "\\sin B = \\frac{b}{c}, \\quad \\cos B = \\frac{a}{c}, \\quad \\tan B = \\frac{b}{a}",
    params: { b: 4, c: 5 }, custom: false
  },
  {
    id: "g9_06", grade: 9, type: "circleTangent",
    title: "Vị trí tương đối đường thẳng & đường tròn (Tiếp tuyến)",
    category: "Đường tròn",
    chapter: "Chương V: Đường tròn",
    topic: "Vị trí tương đối của đường thẳng và đường tròn",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 9 (Tr. 75)",
    description: "Đường thẳng d tiếp xúc với đường tròn (O; R) tại tiếp điểm H khi và chỉ khi khoảng cách OH = R. Khi đó tiếp tuyến vuông góc với bán kính tại tiếp điểm.",
    formula: "d \\perp OH \\text{ tại } H \\iff d(O, d) = R",
    params: { r: 3, d: 3 }, custom: false
  },
  {
    id: "g9_07", grade: 9, type: "circleInscribed",
    title: "Góc ở tâm và góc nội tiếp cùng chắn một cung",
    category: "Đường tròn",
    chapter: "Chương IX: Đường tròn",
    topic: "Góc ở tâm, góc nội tiếp",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 9 (Tr. 76)",
    description: "Định lí cơ bản: Số đo của góc nội tiếp AMB bằng một nửa số đo của góc ở tâm AOB cùng chắn cung AB (hoặc bằng nửa số đo cung bị chắn).",
    formula: "\\widehat{AMB} = \\frac{1}{2} \\widehat{AOB} = \\frac{1}{2} \\text{sđ}\\overparen{AB}",
    params: { r: 3, deg: 80 }, custom: false
  },
  {
    id: "g9_08", grade: 9, type: "circumIncircle",
    title: "Đường tròn ngoại tiếp & nội tiếp tam giác",
    category: "Đường tròn",
    chapter: "Chương IX: Đường tròn",
    topic: "Đường tròn ngoại tiếp, đường tròn nội tiếp tam giác",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 9 (Tr. 76)",
    description: "Mô hình tam giác cùng hai đường tròn: Đường tròn ngoại tiếp tâm O (giao điểm 3 đường trung trực) và đường tròn nội tiếp tâm I (giao điểm 3 đường phân giác).",
    formula: "R = \\frac{abc}{4S}, \\quad r = \\frac{S}{p}",
    params: { a: 5, b: 5, c: 6 }, custom: false
  },
  {
    id: "g9_09", grade: 9, type: "cyclicQuad",
    title: "Tứ giác nội tiếp đường tròn",
    category: "Đường tròn",
    chapter: "Chương IX: Đường tròn",
    topic: "Tứ giác nội tiếp đường tròn",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 9 (Tr. 76)",
    description: "Tứ giác có 4 đỉnh cùng nằm trên một đường tròn. Định lí quan trọng: Trong một tứ giác nội tiếp, tổng số đo hai góc đối diện luôn bằng 180°.",
    formula: "\\widehat{A} + \\widehat{C} = 180^\\circ, \\quad \\widehat{B} + \\widehat{D} = 180^\\circ",
    params: { r: 3, a1: 45, a2: 135 }, custom: false
  },

  // =================== LỚP 10 (9 MÔ HÌNH) ===================
  {
    id: "g10_01", grade: 10, type: "parabolaGeneral",
    title: "Đồ thị hàm số bậc hai Parabol y = ax² + bx + c & Đỉnh",
    category: "Hàm số và đồ thị",
    chapter: "Chương III: Hàm số bậc hai và đồ thị",
    topic: "Hàm số bậc hai",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 10 (Tr. 81)",
    description: "Đồ thị Parabol của hàm số bậc hai y = ax² + bx + c (a ≠ 0). Đỉnh I có tọa độ (-b/(2a), -Δ/(4a)), trục đối xứng là đường thẳng thẳng đứng x = -b/(2a).",
    formula: "I\\left(-\\frac{b}{2a}, -\\frac{\\Delta}{4a}\\right), \\quad x = -\\frac{b}{2a}",
    params: { a: 1, b: -2, c: -1 }, custom: false
  },
  {
    id: "g10_02", grade: 10, type: "inequalityRegion",
    title: "Miền nghiệm bất phương trình bậc nhất hai ẩn",
    category: "Đại số",
    chapter: "Chương II: Bất phương trình và hệ bất phương trình bậc nhất hai ẩn",
    topic: "Biểu diễn miền nghiệm trên mặt phẳng tọa độ",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 10 (Tr. 80)",
    description: "Đường thẳng d: ax + by = c chia mặt phẳng tọa độ Oxy thành hai nửa mặt phẳng. Một trong hai nửa mặt phẳng (kể cả bờ) là miền nghiệm của ax + by ≤ c.",
    formula: "ax + by \\le c",
    params: { a: 1, b: 2, c: 4 }, custom: false
  },
  {
    id: "g10_03", grade: 10, type: "triangleLaws",
    title: "Định lí Côsin & Định lí Sin trong tam giác",
    category: "Hệ thức lượng trong tam giác",
    chapter: "Chương IV: Hệ thức lượng trong tam giác",
    topic: "Định lí Côsin và Định lí Sin",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 10 (Tr. 83)",
    description: "Trong tam giác ABC bất kì: a² = b² + c² - 2bc cos A và a/sin A = b/sin B = c/sin C = 2R. Công cụ giải tam giác toàn năng cho học sinh THPT.",
    formula: "a^2 = b^2 + c^2 - 2bc \\cos A, \\quad \\frac{a}{\\sin A} = 2R",
    params: { a: 5, b: 6, c: 7 }, custom: false
  },
  {
    id: "g10_04", grade: 10, type: "vectorParallelogram",
    title: "Vectơ và Quy tắc hình bình hành cộng vectơ",
    category: "Vectơ trong mặt phẳng",
    chapter: "Chương V: Vectơ",
    topic: "Tổng và hiệu của hai vectơ",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 10 (Tr. 84)",
    description: "Nếu ABCD là hình bình hành thì vectơ AB + vectơ AD = vectơ AC (đường chéo). Trực quan hóa phép cộng hai vectơ bất kì bằng mũi tên 3D sinh động.",
    formula: "\\vec{u} + \\vec{v} = \\vec{w}",
    params: { ux: 3, uy: 1, vx: 1, vy: 3 }, custom: false
  },
  {
    id: "g10_05", grade: 10, type: "vectorDot",
    title: "Tích vô hướng của hai vectơ",
    category: "Vectơ trong mặt phẳng",
    chapter: "Chương V: Vectơ",
    topic: "Tích vô hướng của hai vectơ",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 10 (Tr. 85)",
    description: "Tích vô hướng của hai vectơ u và v bằng tích độ dài nhân với cosin của góc giữa chúng: u · v = |u| |v| cos(u, v). Bằng 0 khi hai vectơ vuông góc.",
    formula: "\\vec{u} \\cdot \\vec{v} = |\\vec{u}| |\\vec{v}| \\cos(\\vec{u}, \\vec{v})",
    params: { ulen: 4, vlen: 3, deg: 60 }, custom: false
  },
  {
    id: "g10_06", grade: 10, type: "lineOxy",
    title: "Phương trình đường thẳng trong Oxy & Vectơ pháp tuyến",
    category: "Phương pháp tọa độ trong mặt phẳng",
    chapter: "Chương VII: Phương pháp tọa độ trong mặt phẳng",
    topic: "Phương trình tổng quát của đường thẳng",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 10 (Tr. 86)",
    description: "Đường thẳng ax + by + c = 0 có vectơ pháp tuyến n = (a, b) vuông góc với đường thẳng. Hiển thị đường thẳng cùng vectơ n trên hệ trục tọa độ Oxy.",
    formula: "ax + by + c = 0, \\quad \\vec{n} = (a, b)",
    params: { a: 2, b: 1, c: -4 }, custom: false
  },
  {
    id: "g10_07", grade: 10, type: "circleOxy",
    title: "Phương trình đường tròn trong mặt phẳng Oxy",
    category: "Phương pháp tọa độ trong mặt phẳng",
    chapter: "Chương VII: Phương pháp tọa độ trong mặt phẳng",
    topic: "Phương trình đường tròn",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 10 (Tr. 87)",
    description: "Đường tròn tâm I(a, b) bán kính R có phương trình (x - a)² + (y - b)² = R². Cho phép điều chỉnh vị trí tâm và bán kính để xem đường tròn di chuyển.",
    formula: "(x - a)^2 + (y - b)^2 = R^2",
    params: { a: 1, b: 2, r: 3 }, custom: false
  },
  {
    id: "g10_08", grade: 10, type: "ellipse",
    title: "Đường Elip và hai tiêu điểm F₁, F₂",
    category: "Ba đường conic",
    chapter: "Chương VII: Phương pháp tọa độ trong mặt phẳng",
    topic: "Ba đường conic trong mặt phẳng",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 10 (Tr. 88)",
    description: "Đường Elip là tập hợp các điểm M sao cho MF₁ + MF₂ = 2a (không đổi). Phương trình chính tắc x²/a² + y²/b² = 1 với tiêu cự 2c = 2√(a² - b²).",
    formula: "\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1, \\quad b^2 = a^2 - c^2",
    params: { a: 4, b: 2 }, custom: false
  },
  {
    id: "g10_09", grade: 10, type: "hyperbola",
    title: "Đường Hypebol và hai đường tiệm cận",
    category: "Ba đường conic",
    chapter: "Chương VII: Phương pháp tọa độ trong mặt phẳng",
    topic: "Ba đường conic trong mặt phẳng",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 10 (Tr. 88)",
    description: "Đường Hypebol có phương trình chính tắc x²/a² - y²/b² = 1. Gồm hai nhánh đối xứng qua gốc O và hai đường tiệm cận chéo y = ±(b/a)x.",
    formula: "\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1, \\quad y = \\pm \\frac{b}{a}x",
    params: { a: 2, b: 1.5 }, custom: false
  },

  // =================== LỚP 11 (9 MÔ HÌNH) ===================
  {
    id: "g11_01", grade: 11, type: "twoPlanes",
    title: "Giao tuyến của hai mặt phẳng trong không gian",
    category: "Hình học không gian",
    chapter: "Chương IV: Quan hệ song song trong không gian",
    topic: "Đường thẳng và mặt phẳng trong không gian",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 11 (Tr. 98)",
    description: "Nếu hai mặt phẳng phân biệt có một điểm chung thì chúng có một đường thẳng chung duy nhất chứa tất cả các điểm chung đó gọi là giao tuyến.",
    formula: "(P) \\cap (Q) = d",
    params: { gap: 1, angle: 30 }, custom: false
  },
  {
    id: "g11_02", grade: 11, type: "skewLines",
    title: "Hai đường thẳng chéo nhau trong không gian",
    category: "Hình học không gian",
    chapter: "Chương IV: Quan hệ song song trong không gian",
    topic: "Hai đường thẳng song song và chéo nhau",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 11 (Tr. 98)",
    description: "Hai đường thẳng chéo nhau là hai đường thẳng không cùng nằm trong bất kì mặt phẳng nào (không song song và không cắt nhau). Có đoạn vuông góc chung duy nhất.",
    formula: "d_1, d_2 \\text{ chéo nhau}, \\quad AB \\perp d_1, AB \\perp d_2",
    params: { dist: 3, angle: 60 }, custom: false
  },
  {
    id: "g11_03", grade: 11, type: "lineParallelPlane",
    title: "Đường thẳng song song với mặt phẳng",
    category: "Hình học không gian",
    chapter: "Chương IV: Quan hệ song song trong không gian",
    topic: "Đường thẳng và mặt phẳng song song",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 11 (Tr. 99)",
    description: "Đường thẳng d song song với mặt phẳng (P) nếu d và (P) không có điểm chung. Điều kiện: d song song với một đường thẳng nằm trong (P).",
    formula: "d \\parallel (P) \\iff d \\cap (P) = \\emptyset",
    params: { dist: 2.5, angle: 0 }, custom: false
  },
  {
    id: "g11_04", grade: 11, type: "parallelPlanes",
    title: "Hai mặt phẳng song song trong không gian",
    category: "Hình học không gian",
    chapter: "Chương IV: Quan hệ song song trong không gian",
    topic: "Hai mặt phẳng song song",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 11 (Tr. 100)",
    description: "Hai mặt phẳng (P) và (Q) song song nếu chúng không có điểm chung nào. Khoảng cách giữa hai mặt phẳng song song là khoảng cách từ điểm bất kì trên mp này tới mp kia.",
    formula: "(P) \\parallel (Q) \\iff (P) \\cap (Q) = \\emptyset",
    params: { dist: 3 }, custom: false
  },
  {
    id: "g11_05", grade: 11, type: "linePerpPlane",
    title: "Đường thẳng vuông góc mặt phẳng & Định lí 3 đường vuông góc",
    category: "Hình học không gian",
    chapter: "Chương VIII: Quan hệ vuông góc trong không gian",
    topic: "Đường thẳng vuông góc với mặt phẳng",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 11 (Tr. 101)",
    description: "Đường thẳng d vuông góc với (P) nếu d vuông góc với mọi đường thẳng nằm trong (P). Trực quan hóa định lí ba đường vuông góc kinh điển.",
    formula: "d \\perp (P) \\iff d \\perp a, \\; \\forall a \\subset (P)",
    params: { h: 3, slant: 45 }, custom: false
  },
  {
    id: "g11_06", grade: 11, type: "perpendicularPlanes",
    title: "Hai mặt phẳng vuông góc",
    category: "Hình học không gian",
    chapter: "Chương VIII: Quan hệ vuông góc trong không gian",
    topic: "Hai mặt phẳng vuông góc",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 11 (Tr. 102)",
    description: "Hai mặt phẳng (P) và (Q) vuông góc với nhau nếu góc giữa chúng bằng 90°. Điều kiện: mặt phẳng này chứa một đường thẳng vuông góc với mặt phẳng kia.",
    formula: "(P) \\perp (Q) \\iff ((P), (Q)) = 90^\\circ",
    params: { w: 5, h: 4 }, custom: false
  },
  {
    id: "g11_07", grade: 11, type: "linePlaneAngle",
    title: "Góc giữa đường thẳng và mặt phẳng",
    category: "Hình học không gian",
    chapter: "Chương VIII: Quan hệ vuông góc trong không gian",
    topic: "Góc giữa đường thẳng và mặt phẳng",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 11 (Tr. 102)",
    description: "Góc giữa đường thẳng d và mặt phẳng (P) là góc giữa d và hình chiếu vuông góc d' của d trên mặt phẳng (P). Giá trị góc dao động từ 0° đến 90°.",
    formula: "\\varphi = (d, (P)) = (d, d'), \\quad 0^\\circ \\le \\varphi \\le 90^\\circ",
    params: { deg: 45, len: 4 }, custom: false
  },
  {
    id: "g11_08", grade: 11, type: "dihedralAngle",
    title: "Góc nhị diện và góc phẳng nhị diện",
    category: "Hình học không gian",
    chapter: "Chương VIII: Quan hệ vuông góc trong không gian",
    topic: "Góc nhị diện và khoảng cách",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 11 (Tr. 103)",
    description: "Hình gồm đường thẳng d và hai nửa mặt phẳng xuất phát từ d gọi là góc nhị diện [P, d, Q]. Góc phẳng nhị diện được tạo bởi hai tia vuông góc với cạnh d tại cùng một điểm.",
    formula: "\\alpha = [P, d, Q]",
    params: { deg: 70, size: 4 }, custom: false
  },
  {
    id: "g11_09", grade: 11, type: "frustumPyramid",
    title: "Hình chóp cụt tứ giác đều & Thể tích",
    category: "Hình học không gian",
    chapter: "Chương VIII: Quan hệ vuông góc trong không gian",
    topic: "Hình chóp cụt đều và thể tích khối đa diện",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 11 (Tr. 104)",
    description: "Phần hình chóp tứ giác đều nằm giữa đáy và thiết diện cắt bởi mặt phẳng song song với đáy. Hai đáy là hình vuông đồng dạng; 4 mặt bên là hình thang cân bằng nhau.",
    formula: "V = \\frac{h}{3}\\left(S_1 + S_2 + \\sqrt{S_1 S_2}\\right)",
    params: { a: 5, b: 2, h: 3 }, custom: false
  },

  // =================== LỚP 12 (9 MÔ HÌNH) ===================
  {
    id: "g12_01", grade: 12, type: "cubicCurve",
    title: "Đồ thị hàm số bậc ba y = ax³ + bx² + cx + d & Cực trị",
    category: "Ứng dụng đạo hàm khảo sát hàm số",
    chapter: "Chương I: Ứng dụng đạo hàm để khảo sát hàm số",
    topic: "Khảo sát sự biến thiên và vẽ đồ thị hàm số bậc ba",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 12 (Tr. 107)",
    description: "Đồ thị hàm số bậc ba hình chữ N hoặc N ngược có tâm đối xứng là điểm uốn U(-b/(3a), y(U)). Nhận diện số cực trị dựa vào nghiệm phương trình đạo hàm bậc hai y' = 0.",
    formula: "y = ax^3 + bx^2 + cx + d, \\quad y' = 3ax^2 + 2bx + c",
    params: { a: 0.5, b: 0, c: -3, d: 1 }, custom: false
  },
  {
    id: "g12_02", grade: 12, type: "rationalFunc",
    title: "Đồ thị hàm phân thức y = (ax+b)/(cx+d) & Tiệm cận",
    category: "Ứng dụng đạo hàm khảo sát hàm số",
    chapter: "Chương I: Ứng dụng đạo hàm để khảo sát hàm số",
    topic: "Đường tiệm cận của đồ thị hàm số",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 12 (Tr. 108)",
    description: "Đồ thị hàm nhất biến có tiệm cận đứng x = -d/c và tiệm cận ngang y = a/c. Giao điểm của hai đường tiệm cận I(-d/c, a/c) là tâm đối xứng của đồ thị.",
    formula: "y = \\frac{ax + b}{cx + d}, \\quad x = -\\frac{d}{c}, \\quad y = \\frac{a}{c}",
    params: { a: 2, b: 1, c: 1, d: -1 }, custom: false
  },
  {
    id: "g12_03", grade: 12, type: "revolvedSolid",
    title: "Ứng dụng tích phân tính thể tích khối tròn xoay",
    category: "Nguyên hàm - Tích phân",
    chapter: "Chương IV: Nguyên hàm, tích phân và ứng dụng",
    topic: "Ứng dụng hình học của tích phân (Thể tích khối tròn xoay)",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 12 (Tr. 110)",
    description: "Thể tích khối tròn xoay sinh ra khi quay hình phẳng giới hạn bởi đường cong y = f(x), trục Ox và hai đường thẳng x = a, x = b quanh trục Ox.",
    formula: "V = \\pi \\int_{a}^{b} [f(x)]^2 \\, dx",
    params: { r1: 1, r2: 3, h: 4 }, custom: false
  },
  {
    id: "g12_04", grade: 12, type: "oxyzAxes",
    title: "Hệ trục tọa độ Oxyz & Ba mặt phẳng tọa độ",
    category: "Phương pháp tọa độ trong không gian",
    chapter: "Chương V: Phương pháp tọa độ trong không gian",
    topic: "Hệ tọa độ trong không gian",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 12 (Tr. 111)",
    description: "Ba trục tọa độ Ox, Oy, Oz đôi một vuông góc tạo thành hệ tọa độ Des-cartes Oxyz. Ba mặt phẳng tọa độ (Oxy: z=0), (Oyz: x=0), (Ozx: y=0) chia không gian thành 8 phần.",
    formula: "Ox \\perp Oy \\perp Oz, \\quad (Oxy): z = 0",
    params: { len: 4 }, custom: false
  },
  {
    id: "g12_05", grade: 12, type: "oxyzVector",
    title: "Tọa độ điểm và Vectơ trong không gian Oxyz",
    category: "Phương pháp tọa độ trong không gian",
    chapter: "Chương V: Phương pháp tọa độ trong không gian",
    topic: "Tọa độ của điểm và vectơ",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 12 (Tr. 111)",
    description: "Điểm M(x, y, z) có vectơ vị trí OM = x i + y j + z k. Hiển thị trực quan hình chiếu vuông góc của M lên mặt phẳng Oxy và các trục tọa độ.",
    formula: "\\vec{OM} = x\\vec{i} + y\\vec{j} + z\\vec{k}, \\quad |\\vec{OM}| = \\sqrt{x^2 + y^2 + z^2}",
    params: { x: 3, y: 4, z: 2 }, custom: false
  },
  {
    id: "g12_06", grade: 12, type: "oxyzSphere",
    title: "Phương trình mặt cầu trong không gian Oxyz",
    category: "Phương pháp tọa độ trong không gian",
    chapter: "Chương V: Phương pháp tọa độ trong không gian",
    topic: "Phương trình mặt cầu",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 12 (Tr. 112)",
    description: "Mặt cầu tâm I(x₀, y₀, z₀) bán kính R là tập hợp các điểm M trong không gian sao cho khoảng cách IM = R. Phương trình chính tắc (x - x₀)² + (y - y₀)² + (z - z₀)² = R².",
    formula: "(x - x_0)^2 + (y - y_0)^2 + (z - z_0)^2 = R^2",
    params: { x: 0, y: 0, z: 0, r: 3 }, custom: false
  },
  {
    id: "g12_07", grade: 12, type: "oxyzPlane",
    title: "Mặt phẳng trong không gian Oxyz & Vectơ pháp tuyến",
    category: "Phương pháp tọa độ trong không gian",
    chapter: "Chương V: Phương pháp tọa độ trong không gian",
    topic: "Phương trình mặt phẳng",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 12 (Tr. 113)",
    description: "Mặt phẳng (P): Ax + By + Cz + D = 0 có vectơ pháp tuyến n = (A, B, C) vuông góc với mặt phẳng. Trực quan hóa mặt phẳng nghiêng trong không gian Oxyz.",
    formula: "Ax + By + Cz + D = 0, \\quad \\vec{n} = (A, B, C)",
    params: { A: 2, B: -1, C: 2, D: -4 }, custom: false
  },
  {
    id: "g12_08", grade: 12, type: "oxyzLine",
    title: "Đường thẳng trong Oxyz & Vectơ chỉ phương",
    category: "Phương pháp tọa độ trong không gian",
    chapter: "Chương V: Phương pháp tọa độ trong không gian",
    topic: "Phương trình đường thẳng trong không gian",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 12 (Tr. 113)",
    description: "Đường thẳng d đi qua điểm M₀(x₀, y₀, z₀) và có vectơ chỉ phương u = (u₁, u₂, u₃). Hiển thị phương trình tham số và hướng của đường thẳng trong không gian Oxyz.",
    formula: "\\begin{cases} x = x_0 + u_1 t \\\\ y = y_0 + u_2 t \\\\ z = z_0 + u_3 t \\end{cases}",
    params: { x0: 1, y0: 2, z0: 0, u1: 2, u2: 1, u3: -1 }, custom: false
  },
  {
    id: "g12_09", grade: 12, type: "oxyzDistance",
    title: "Vị trí tương đối và khoảng cách trong Oxyz",
    category: "Phương pháp tọa độ trong không gian",
    chapter: "Chương V: Phương pháp tọa độ trong không gian",
    topic: "Khoảng cách trong không gian",
    curriculumSource: "Thông tư 32/2018/TT-BGDĐT - Toán 12 (Tr. 114)",
    description: "Tính khoảng cách từ điểm M(x, y, z) đến mặt phẳng (P): z = d bằng đoạn vuông góc MH. Ứng dụng quan trọng trong các bài toán hình học không gian Oxyz.",
    formula: "d(M, (P)) = |z - d|",
    params: { x: 2, y: 3, z: 4, d: 0 }, custom: false
  }
];

const catalog = {
  version: 4,
  origin: "Danh mục 63 mô hình Toán 3D chuẩn hóa GDPT 2018 (Thông tư 32/2018/TT-BGDĐT) cho 7 phòng Lớp 6-12",
  items
};

const targetPath = path.resolve('data/catalog.json');
fs.writeFileSync(targetPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`Successfully generated ${items.length} models to ${targetPath}`);
