/**
 * MATHVERSE R11 — HỆ THỐNG NHIỆM VỤ KHÁM PHÁ 3 BƯỚC (GUIDED DISCOVERY MICRO-TASKS)
 * Biến mọi mô hình trong 310 mô hình (Lớp 6–12) từ "công cụ xem thụ động" thành
 * chuỗi khám phá kiến thức chủ động 3 bước:
 *   Bước 1: Dự đoán & Thao tác trực tiếp (Action & Prediction)
 *   Bước 2: Kiểm chứng bất biến Toán học (Invariant Verification)
 *   Bước 3: Kết luận Định lý / Kiến thức SGK (Textbook Theorem Synthesis)
 */
import { getCurriculumModelById, getV4PedagogyMeta } from './curriculum-manifest.mjs';
import { formatMathText } from './math-formula-renderer.mjs';

const FAMILY_PEDAGOGY = {
  // LỚP 6
  'G6-R03-L01': {
    predict: 'Thay đổi giá trị số tự nhiên hoặc kéo điểm trên trục số và dự đoán quy luật biểu diễn.',
    verify: 'Kiểm tra mối liên hệ giữa vị trí điểm trên tia số, cấu tạo thập phân và tính chia hết / số nguyên tố.',
    conclude: 'Mỗi số tự nhiên ứng với một điểm trên tia số; số đứng bên trái nhỏ hơn số đứng bên phải (SGK Toán 6 Tập 1).'
  },
  'G6-R03-L02': {
    predict: 'Di chuyển qua mốc 0 hoặc thay đổi tử số/mẫu số để dự đoán giá trị của phân số và số thập phân.',
    verify: 'Kiểm chứng tính chất cơ bản của phân số a/b = (a·m)/(b·m) và quy tắc so sánh trên trục số.',
    conclude: 'Hai phân số bằng nhau biểu diễn cùng một giá trị; phần diện tích tô màu không đổi khi rút gọn hoặc quy đồng.'
  },
  'G6-R01-L02': {
    predict: 'Kéo tách/ghép các mảnh tam giác đều, hình vuông hoặc thay đổi độ dài cạnh a, b, h.',
    verify: 'Đếm số ô vuông đơn vị hoặc ghép các mảnh cắt để kiểm chứng công thức chu vi P và diện tích S.',
    conclude: 'Diện tích hình bình hành, hình thoi, hình thang cân đều suy ra được từ việc cắt ghép về hình chữ nhật hoặc tam giác.'
  },
  'G6-R01-L01': {
    predict: 'Xoay trục đối xứng hoặc gập thử hai nửa hình phẳng qua đường thẳng d / tâm O.',
    verify: 'Kiểm tra mọi điểm A trên hình biến thành điểm A′ thuộc chính hình đó qua phép đối xứng trục hoặc quay 180° quanh O.',
    conclude: 'Hình có trục đối xứng khi đường thẳng d chia hình thành hai phần chồng khít lên nhau khi gấp lại.'
  },
  'G6-R02-L01': {
    predict: 'Di chuyển điểm M trên tia hoặc xoay tia Oz quanh đỉnh O và dự đoán số đo góc xOz.',
    verify: 'Kiểm chứng hệ thức cộng độ dài AM + MB = AB khi M nằm giữa A, B và phân loại góc nhọn, vuông, tù, bẹt.',
    conclude: 'Điểm M là trung điểm của AB khi và chỉ khi M nằm giữa A, B và MA = MB = AB/2.'
  },
  'G6-R04-L01': {
    predict: 'Thay đổi tần số các nhóm dữ liệu trên bảng thống kê và dự đoán cột cao nhất / xu thế biểu đồ.',
    verify: 'Đối chiếu chiều cao từng cột (hoặc số biểu tượng tranh) với số liệu trong bảng kiểm đếm.',
    conclude: 'Biểu đồ cột và biểu đồ cột kép giúp so sánh trực quan độ lớn và sự chênh lệch giữa các nhóm dữ liệu.'
  },
  'G6-R04-L02': {
    predict: 'Tăng số lần tung đồng xu / xúc xắc / quay vòng quay (N = 10, 50, 100) và dự đoán tỉ số thực nghiệm.',
    verify: 'Quan sát tần số tương đối f = k/N hội tụ dần về xác suất lý thuyết khi số phép thử N đủ lớn.',
    conclude: 'Xác suất thực nghiệm k/N phản ánh khả năng xảy ra của sự kiện và tiến dần tới xác suất lý thuyết khi N lớn.'
  },
  // LỚP 7
  '7-01': {
    predict: 'Kéo điểm trên trục số hoặc thay đổi số hạng trong tỉ lệ thức a/b = c/d.',
    verify: 'Kiểm chứng tích chéo a·d = b·c và tính chất dãy tỉ số bằng nhau (a+c)/(b+d) = a/b.',
    conclude: 'Mọi số thực (hữu tỉ và vô tỉ như √2) đều được biểu diễn bởi một điểm duy nhất trên trục số thực.'
  },
  '7-02': {
    predict: 'Kéo xoay cát tuyến hoặc thay đổi góc α và dự đoán số đo các góc đối đỉnh, kề bù, so le trong.',
    verify: 'Kiểm chứng: Hai góc đối đỉnh luôn bằng nhau; khi hai đường thẳng song song thì cặp góc so le trong và đồng vị bằng nhau.',
    conclude: 'Nếu một đường thẳng cắt hai đường thẳng song song thì hai góc so le trong bằng nhau, hai góc trong cùng phía bù nhau (180°).'
  },
  '7-03': {
    predict: 'Kéo các đỉnh A, B, C của tam giác trên hình vẽ và dự đoán tổng 3 góc trong tam giác.',
    verify: 'Quan sát tổng ∠A + ∠B + ∠C luôn bất biến bằng 180° và cạnh đối diện với góc lớn hơn thì lớn hơn.',
    conclude: 'Trong mọi tam giác, tổng ba góc bằng 180° và độ dài một cạnh luôn nhỏ hơn tổng hai cạnh kia (Bất đẳng thức tam giác).'
  },
  '7-04': {
    predict: 'Kéo đỉnh B hoặc C của tam giác ABC và bấm "Chồng hình / vị tự" để so sánh với tam giác A′B′C′.',
    verify: 'Kiểm chứng hai tam giác chồng khít hoàn toàn khi thỏa mãn đủ 3 yếu tố (c.c.c, c.g.c, g.c.g hoặc cạnh huyền - góc nhọn).',
    conclude: 'Hai tam giác bằng nhau có các cạnh tương ứng bằng nhau và các góc tương ứng bằng nhau.'
  },
  '7-05': {
    predict: 'Kéo đỉnh A của tam giác và quan sát giao điểm của 3 đường trung tuyến, phân giác, trung trực, đường cao.',
    verify: 'Kiểm tra 3 đường cùng loại luôn đồng quy tại 1 điểm duy nhất (G, I, O, H) và tỉ số trọng tâm AG/AM = 2/3.',
    conclude: 'Ba đường trung tuyến đồng quy tại trọng tâm G (cách đỉnh 2/3); 3 phân giác đồng quy tại tâm đường tròn nội tiếp I.'
  },
  '7-06': {
    predict: 'Thay đổi tỉ lệ phần trăm các nhóm dữ liệu và quan sát góc ở tâm của từng hình quạt tròn.',
    verify: 'Kiểm chứng góc quạt θ_i = 360° × (p_i / 100) và tổng các hình quạt luôn khép kín 360° (100%).',
    conclude: 'Biểu đồ hình quạt tròn biểu diễn trực quan cơ cấu tỉ lệ phần trăm của từng thành phần trong tổng thể.'
  },
  '7-07': {
    predict: 'Kéo các điểm dữ liệu theo từng mốc thời gian và bấm Phát để quan sát điểm chạy dọc theo các đoạn thẳng.',
    verify: 'Kiểm chứng độ dốc đoạn thẳng đi lên khi dữ liệu tăng (Δy > 0) và đi xuống khi dữ liệu giảm (Δy < 0).',
    conclude: 'Biểu đồ đoạn thẳng giúp nhận biết rõ xu thế tăng trưởng hoặc suy giảm của đại lượng theo thời gian.'
  },
  '7-08': {
    predict: 'Xoay khối 3D và quan sát đồng thời Bản khai triển phẳng 2D bên cạnh khi thay đổi kích thước a, b, h.',
    verify: 'Đếm đủ 6 mặt chữ nhật (3 cặp mặt đối bằng nhau) và kiểm chứng S_xq = 2(a+b)h, V = a·b·h.',
    conclude: 'Diện tích xung quanh của hình hộp chữ nhật bằng chu vi đáy nhân chiều cao; thể tích bằng tích ba kích thước.'
  },
  '7-09': {
    predict: 'Thay đổi chiều cao h và kích thước đáy của lăng trụ đứng 3D, đối chiếu với hình khai triển 2D bên cạnh.',
    verify: 'Kiểm chứng các mặt bên đều là hình chữ nhật và S_xq = C_đáy · h, V = S_đáy · h.',
    conclude: 'Hình lăng trụ đứng có các cạnh bên vuông góc với đáy; thể tích bằng diện tích đáy nhân với chiều cao.'
  },
  '7-10': {
    predict: 'Bấm "Thử 10 lần / 100 lần" hoặc "Phát chuyển động" để quay vòng quay ngẫu nhiên và theo dõi biểu đồ tần số.',
    verify: 'Quan sát tỉ số thực nghiệm f = k/N tiến dần về xác suất lý thuyết P(A) = n(A)/n(Ω) khi số lần thử tăng.',
    conclude: 'Trong phép thử ngẫu nhiên đồng khả năng, xác suất của biến cố bằng tỉ số giữa số kết quả thuận lợi và tổng số kết quả.'
  },
  // LỚP 8
  '8-01': {
    predict: 'Thay đổi độ dài cạnh a, b trên hình vuông cắt ghép và dự đoán tổng diện tích các mảnh.',
    verify: 'Cộng diện tích các hình chữ nhật/hình vuông thành phần để kiểm chứng (a+b)² = a² + 2ab + b² và a² - b² = (a-b)(a+b).',
    conclude: 'Các hằng đẳng thức đáng nhớ có ý nghĩa hình học trực quan là sự bảo toàn diện tích khi cắt ghép hình phẳng.'
  },
  '8-02': {
    predict: 'Kéo các đỉnh của tứ giác trên hình vẽ và quan sát độ dài cạnh, góc và giao điểm O của hai đường chéo.',
    verify: 'Kiểm chứng tính chất đặc trưng: Hình bình hành có 2 đường chéo cắt nhau tại trung điểm; Hình chữ nhật có 2 đường chéo bằng nhau; Hình thoi có 2 đường chéo vuông góc.',
    conclude: 'Hình vuông vừa là hình chữ nhật vừa là hình thoi nên có hai đường chéo bằng nhau, vuông góc và cắt nhau tại trung điểm mỗi đường.'
  },
  '8-03': {
    predict: 'Kéo đường thẳng song song cắt hai cạnh tam giác và quan sát tỉ số các đoạn thẳng bị chắn.',
    verify: 'Kiểm chứng tỉ số AD/AB = AE/AC = DE/BC không đổi khi dịch chuyển đường thẳng song song DE // BC.',
    conclude: 'Định lý Thalès: Đường thẳng song song với một cạnh của tam giác và cắt hai cạnh còn lại thì định ra trên hai cạnh đó những đoạn thẳng tương ứng tỉ lệ.'
  },
  '8-04': {
    predict: 'Kéo đỉnh tam giác để thay đổi độ dài hai cạnh bên AB, AC và quan sát chân đường phân giác D trên BC.',
    verify: 'Kiểm chứng tỉ số DB/DC luôn bằng đúng tỉ số hai cạnh kề AB/AC.',
    conclude: 'Đường phân giác của một góc trong tam giác chia cạnh đối diện thành hai đoạn thẳng tỉ lệ với hai cạnh kề hai đoạn ấy.'
  },
  '8-05': {
    predict: 'Kéo thay đổi hai cạnh góc vuông a, b và so sánh diện tích hình vuông lớn c² với tổng hai hình vuông nhỏ a² + b².',
    verify: 'Kiểm chứng bất biến a² + b² = c² đúng với mọi tam giác vuông và kiểm tra định lý Pythagore đảo.',
    conclude: 'Trong một tam giác vuông, bình phương độ dài cạnh huyền bằng tổng các bình phương độ dài hai cạnh góc vuông.'
  },
  '8-06': {
    predict: 'Thay đổi tỉ số đồng dạng k và bấm "Chồng hình động" để quan sát phép vị tự biến △ABC thành △A′B′C′.',
    verify: 'Kiểm chứng: Tỉ số chu vi bằng k, tỉ số đường cao bằng k, nhưng tỉ số diện tích bằng k².',
    conclude: 'Hai tam giác đồng dạng theo tỉ số k có các góc tương ứng bằng nhau, các cạnh tương ứng tỉ lệ theo k và tỉ số diện tích bằng k².'
  },
  '8-07': {
    predict: 'Kéo trực tiếp điểm trên đồ thị hoặc thay đổi hệ số góc a và tung độ gốc b của đường thẳng y = ax + b.',
    verify: 'Quan sát: Khi a > 0 đồ thị đi lên, khi a < 0 đồ thị đi xuống; hai đường thẳng song song khi a = a′ và b ≠ b′.',
    conclude: 'Đồ thị hàm số bậc nhất y = ax + b (a ≠ 0) là một đường thẳng cắt trục tung tại (0; b) và có hệ số góc là a.'
  },
  '8-08': {
    predict: 'Kéo các cột dữ liệu hoặc chuyển đổi giữa Biểu đồ cột, Biểu đồ đoạn thẳng và Biểu đồ quạt tròn.',
    verify: 'Kiểm chứng cùng một bộ số liệu thống kê được biểu diễn nhất quán trên cả 3 dạng biểu đồ và tổng tỉ lệ bằng 100%.',
    conclude: 'Lựa chọn đúng loại biểu đồ giúp làm nổi bật sự so sánh độ lớn (cột), xu thế thời gian (đoạn thẳng) hoặc cơ cấu (quạt tròn).'
  },
  '8-09': {
    predict: 'Xoay hình chóp đều 3D bên trái và bấm Phát chuyển động để xem các mặt bên mở phẳng trên sơ đồ 2D bên phải.',
    verify: 'Kiểm chứng trung đoạn d = √(h² + r_đáy²), S_xq = p·d và thể tích V = (1/3)·S_đáy·h.',
    conclude: 'Hình chóp tam giác đều và chóp tứ giác đều có các mặt bên là những tam giác cân bằng nhau; V = (1/3)·S_đáy·h.'
  },
  // LỚP 9
  '9-01': {
    predict: 'Thay đổi hệ số của hai phương trình bậc nhất hai ẩn và quan sát giao điểm của hai đường thẳng trên mặt phẳng Oxy.',
    verify: 'Kiểm chứng: Hai đường thẳng cắt nhau (1 nghiệm duy nhất), song song (vô nghiệm), hoặc trùng nhau (vô số nghiệm).',
    conclude: 'Nghiệm của hệ hai phương trình bậc nhất hai ẩn chính là tọa độ giao điểm của hai đường thẳng biểu diễn chúng.'
  },
  '9-02': {
    predict: 'Thay đổi mốc biên a, b và bấm Phát chuyển động để điểm kiểm tra chạy trên miền nghiệm của trục số.',
    verify: 'Kiểm chứng miền nghiệm [a; +∞) hoặc giao của hai bất phương trình [a; b] (rỗng khi a > b).',
    conclude: 'Biểu diễn tập nghiệm bất phương trình bậc nhất một ẩn trên trục số giúp xác định trực quan miền giá trị thỏa mãn.'
  },
  '9-03': {
    predict: 'Kéo thay đổi góc nhọn α trong tam giác vuông và quan sát sự biến thiên của sin α, cos α, tan α, cot α.',
    verify: 'Kiểm chứng hệ thức bất biến sin²α + cos²α = 1, tan α · cot α = 1 và sin α = cos(90° - α).',
    conclude: 'Tỉ số lượng giác của góc nhọn α chỉ phụ thuộc vào độ lớn của góc α chứ không phụ thuộc vào kích thước tam giác vuông.'
  },
  '9-04': {
    predict: 'Thay đổi khoảng cách ngắm d và chiều cao h để quan sát tia ngắm góc nâng α từ giác kế đến đỉnh tháp / bờ sông.',
    verify: 'Kiểm chứng công thức đo gián tiếp h = d · tan α mà không cần trèo lên đỉnh tháp hay bơi qua sông.',
    conclude: 'Hệ thức lượng trong tam giác vuông cho phép đo chiều cao và khoảng cách không thể tiếp cận trực tiếp trong thực tế.'
  },
  '9-05': {
    predict: 'Thay đổi bán kính R, góc ở tâm θ và bấm Phát chuyển động để cung tròn & hình quạt quét theo góc θ.',
    verify: 'Kiểm chứng độ dài cung l = (πRθ)/180°, diện tích hình quạt S = (πR²θ)/360° và diện tích hình vành khuyên S = π(R² - r²).',
    conclude: 'Độ dài cung tròn và diện tích hình quạt tròn tỉ lệ thuận với số đo góc ở tâm chắn cung đó.'
  },
  '9-06': {
    predict: 'Kéo dịch chuyển đường thẳng (hoặc tâm đường tròn thứ hai) để thay đổi khoảng cách d so với bán kính R.',
    verify: 'Kiểm chứng 3 vị trí: d < R (cắt nhau tại 2 điểm), d = R (tiếp xúc tại 1 điểm và tiếp tuyến ⊥ bán kính), d > R (không giao nhau).',
    conclude: 'Tiếp tuyến của đường tròn vuông góc với bán kính đi qua tiếp điểm (d = R).'
  },
  '9-07': {
    predict: 'Kéo điểm M chạy trên cung tròn chứa góc nội tiếp ∠AMB và so sánh với góc ở tâm ∠AOB.',
    verify: 'Kiểm chứng bất biến: Dù M di chuyển đến đâu trên cung lớn AB thì ∠AMB = (1/2)∠AOB không đổi; góc nội tiếp chắn nửa đường tròn bằng 90°.',
    conclude: 'Trong một đường tròn, số đo của góc nội tiếp bằng nửa số đo của cung bị chắn; tứ giác nội tiếp có tổng hai góc đối bằng 180°.'
  },
  '9-08': {
    predict: 'Kéo điểm khảo sát trên parabol y = ax² và thay đổi hệ số a (a > 0 và a < 0).',
    verify: 'Kiểm chứng tính đối xứng của parabol qua trục tung Oy và đỉnh O(0; 0) là điểm thấp nhất (khi a > 0) hoặc cao nhất (khi a < 0).',
    conclude: 'Đồ thị hàm số y = ax² (a ≠ 0) là một đường parabol nhận trục Oy làm trục đối xứng và có đỉnh tại gốc tọa độ O.'
  },
  '9-09': {
    predict: 'Bấm Phát chuyển động để quan sát đường sinh AA′ quay quanh trục O₁O₂ tạo hình trụ 3D và trải phẳng thành hình chữ nhật 2D.',
    verify: 'Kiểm chứng chiều dài mặt trải phẳng bằng đúng chu vi đường tròn đáy 2πr, suy ra S_xq = 2πrh và V = πr²h.',
    conclude: 'Hình trụ tròn xoay có diện tích xung quanh S_xq = 2πrh và thể tích V = πr²h.'
  },
  '9-10': {
    predict: 'Bấm Phát chuyển động để quan sát tam giác vuông SOA quay quanh trục SO tạo hình nón 3D và khai triển thành hình quạt tròn 2D.',
    verify: 'Kiểm chứng hệ thức Pythagore l = √(r² + h²), diện tích xung quanh S_xq = πrl và thể tích V = (1/3)πr²h.',
    conclude: 'Thể tích hình nón bằng đúng 1/3 thể tích hình trụ có cùng bán kính đáy r và chiều cao h.'
  },
  '9-11': {
    predict: 'Bấm Phát chuyển động để xem nửa đường tròn quay quanh đường kính AB = 2R tạo Mặt cầu 3D và quan sát tam giác vuông ΔOHM trên mặt cắt 2D bên cạnh.',
    verify: 'Kiểm chứng trên cả hình 3D và 2D: Bán kính thiết diện r = √(R² - d²), diện tích mặt cầu S = 4πR² (bằng 4 hình tròn lớn) và thể tích V = (4/3)πR³.',
    conclude: 'Mặt cầu là bề mặt gồm các điểm cách tâm O khoảng R không đổi; mọi mặt phẳng cắt hình cầu (d < R) đều tạo thiết diện là hình tròn bán kính r = √(R² - d²).'
  },
  '9-12': {
    predict: 'Kéo đỉnh các cột tần số trên biểu đồ và quan sát tần số tương đối f_i = n_i / N tự động cập nhật.',
    verify: 'Kiểm chứng tổng các tần số tương đối của mọi nhóm luôn bằng 100% (Σf_i = 1).',
    conclude: 'Bảng tần số và biểu đồ tần số tương đối giúp nhận diện nhanh nhóm dữ liệu chiếm ưu thế trong mẫu thống kê.'
  },
  '9-13': {
    predict: 'Bấm "Thử 10 lần / 100 lần" hoặc "Phát chuyển động" để mô phỏng phép thử ngẫu nhiên và quan sát đường hội tụ tần số.',
    verify: 'Kiểm chứng khi số lần thử N càng lớn, tần số tương đối thực nghiệm càng bám sát đường xác suất lý thuyết P(A) = m/n.',
    conclude: 'Xác suất lý thuyết P(A) được kiểm chứng thực nghiệm qua quy luật ổn định của tần số tương đối khi số phép thử lớn.'
  },
  // LỚP 10
  '10-01': {
    predict: 'Thay đổi phần tử hoặc đầu mút các khoảng/đoạn A, B và bấm Phát chuyển động để xem phép toán tập hợp.',
    verify: 'Kiểm chứng trực quan trên sơ đồ Venn và trục số các phép Giao (A ∩ B), Hợp (A ∪ B) và Hiệu (A \\ B).',
    conclude: 'Sơ đồ Venn và biểu diễn khoảng/đoạn trên trục số giúp xác định chính xác tập nghiệm của hệ điều kiện.'
  },
  '10-02': {
    predict: 'Thay đổi các hệ số bất phương trình và quan sát miền nghiệm (nửa mặt phẳng hoặc đa giác miền khả thi).',
    verify: 'Kiểm chứng giá trị biểu thức mục tiêu F(x, y) = ax + by luôn đạt cực đại và cực tiểu tại các đỉnh của miền đa giác nghiệm.',
    conclude: 'Trong bài toán quy hoạch tuyến tính hai ẩn, giá trị tối ưu luôn đạt được tại một trong các đỉnh của miền nghiệm đa giác lồi.'
  },
  '10-03': {
    predict: 'Kéo đỉnh C hoặc B của tam giác (hoặc bật khóa hai cạnh AB, AC để mở góc A từ 60° lên 120°) và quan sát cạnh đối diện a = BC.',
    verify: 'Kiểm chứng Định lý Côsin a² = b² + c² - 2bc·cos A (với A = 90° suy ra Pythagore a² = b² + c²) và Định lý Sin a/sin A = b/sin B = c/sin C = 2R.',
    conclude: 'Định lý Côsin a² = b² + c² - 2bc·cos A và Định lý Sin là tổng quát hóa của định lý Pythagore và tỉ số lượng giác cho mọi tam giác bất kỳ.'
  },
  '10-04': {
    predict: 'Kéo trực tiếp hai đầu mút vectơ u và v trên mặt phẳng và quan sát vectơ tổng u + v theo quy tắc hình bình hành.',
    verify: 'Kiểm chứng tọa độ vectơ tổng (u_x + v_x; u_y + v_y) và tích vô hướng u·v = |u|·|v|·cos(u, v) = 0 khi u ⊥ v.',
    conclude: 'Hai vectơ khác vectơ-không vuông góc với nhau khi và chỉ khi tích vô hướng của chúng bằng 0.'
  },
  '10-05': {
    predict: 'Kéo trực tiếp điểm A, B trên mặt phẳng tọa độ Oxy và quan sát tọa độ vectơ AB cùng trung điểm M, trọng tâm G.',
    verify: 'Kiểm chứng công thức tọa độ vectơ AB = (x_B - x_A; y_B - y_A) và độ dài |AB| = √[(x_B - x_A)² + (y_B - y_A)²].',
    conclude: 'Hệ trục tọa độ Oxy chuyển mọi bài toán hình học phẳng thành phép tính đại số chính xác trên các cặp số thực.'
  },
  '10-06': {
    predict: 'Kéo điểm khảo sát trên Parabol y = ax² + bx + c và thay đổi các hệ số a, b, c.',
    verify: 'Kiểm chứng tọa độ đỉnh I(-b/2a; -Δ/4a), trục đối xứng x = -b/2a và mối liên hệ giữa dấu của Δ với số giao điểm trục Ox.',
    conclude: 'Hàm số bậc hai đạt cực tiểu tại x = -b/(2a) khi a > 0 và đạt cực đại tại x = -b/(2a) khi a < 0.'
  },
  '10-07': {
    predict: 'Kéo điểm M₀ hoặc thay đổi vectơ pháp tuyến n = (A; B) của đường thẳng Δ trên mặt phẳng Oxy.',
    verify: 'Kiểm chứng vectơ pháp tuyến n vuông góc với vectơ chỉ phương u = (-B; A) và công thức khoảng cách từ điểm P đến Δ.',
    conclude: 'Đường thẳng trong mặt phẳng Oxy hoàn toàn xác định khi biết một điểm đi qua và vectơ pháp tuyến hoặc vectơ chỉ phương.'
  },
  '10-08': {
    predict: 'Kéo tâm I(a; b) hoặc tiếp điểm T trên đường tròn (C) để quan sát phương trình đường tròn và tiếp tuyến.',
    verify: 'Kiểm chứng phương trình (x - a)² + (y - b)² = R² và tiếp tuyến tại T luôn vuông góc với bán kính IT.',
    conclude: 'Phương trình tiếp tuyến của đường tròn tại điểm T(x₀; y₀) có vectơ pháp tuyến chính là vectơ bán kính IT.'
  },
  '10-09': {
    predict: 'Thay đổi bán trục a, b (hoặc tham số tiêu p) và cho điểm M chạy dọc theo đường Elip, Hyperbol hoặc Parabol.',
    verify: 'Kiểm chứng tính chất tiêu điểm: Với Elip thì MF₁ + MF₂ = 2a không đổi; với Hyperbol thì |MF₁ - MF₂| = 2a; với Parabol thì MF = d(M, Δ).',
    conclude: 'Ba đường Conic được định nghĩa thống nhất qua tỉ số khoảng cách tới tiêu điểm F và đường chuẩn Δ (tâm sai e).'
  },
  '10-10': {
    predict: 'Thay đổi các giá trị mẫu số liệu và quan sát Biểu đồ hộp (Box-plot) cùng tứ phân vị Q₁, Q₂, Q₃.',
    verify: 'Kiểm chứng khoảng biến thiên R, khoảng tứ phân vị Δ_Q = Q₃ - Q₁ và độ lệch chuẩn s phản ánh mức độ phân tán dữ liệu.',
    conclude: 'Số trung bình, trung vị (Q₂) đo xu thế trung tâm; phương sai và khoảng tứ phân vị đo mức độ phân tán của mẫu số liệu.'
  },
  '10-11': {
    predict: 'Thay đổi số phần tử n, k để quan sát sơ đồ hình cây quy tắc đếm, hoán vị P_n, chỉnh hợp A_n^k, tổ hợp C_n^k.',
    verify: 'Kiểm chứng hệ thức C_n^k = A_n^k / k! và tần số thực nghiệm hội tụ về xác suất cổ điển P(A) = n(A)/n(Ω).',
    conclude: 'Chỉnh hợp A_n^k dùng khi có phân biệt thứ tự; Tổ hợp C_n^k dùng khi chỉ chọn tập con không phân biệt thứ tự.'
  },
  // LỚP 11
  '11-01': {
    predict: 'Kéo điểm M chạy quanh đường tròn lượng giác đơn vị (R = 1) và quan sát hình chiếu lên hai trục Ox, Oy.',
    verify: 'Kiểm chứng hoành độ x_M = cos α, tung độ y_M = sin α và hệ thức cơ bản sin²α + cos²α = 1 ở mọi góc phần tư.',
    conclude: 'Đường tròn lượng giác mở rộng định nghĩa giá trị lượng giác cho mọi góc lượng giác α bất kỳ trên (-∞; +∞).'
  },
  '11-02': {
    predict: 'Bấm Phát chuyển động để điểm khảo sát lướt dọc đồ thị hàm số y = sin x, y = cos x, y = tan x và đường thẳng y = m.',
    verify: 'Kiểm chứng tính tuần hoàn chu kỳ 2π của hàm sin/cos, chu kỳ π của hàm tan và số nghiệm phương trình lượng giác cơ bản.',
    conclude: 'Đồ thị hàm lượng giác hình sin biểu diễn các dao động tuần hoàn; nghiệm phương trình sin x = m là hoành độ giao điểm với đường y = m.'
  },
  '11-03': {
    predict: 'Thay đổi số hạng đầu u₁ và công sai d (hoặc công bội q), bấm Phát chuyển động để xem các số hạng u_n và tổng S_n.',
    verify: 'Kiểm chứng cấp số cộng tăng/giảm bậc thang đều (u_n = u₁ + (n-1)d) và cấp số nhân tăng/giảm theo hàm mũ (u_n = u₁·q^(n-1)).',
    conclude: 'Cấp số cộng có hiệu hai số hạng liên tiếp không đổi (d); cấp số nhân có tỉ số hai số hạng liên tiếp không đổi (q).'
  },
  '11-04': {
    predict: 'Thay đổi tần số các nhóm ghép lớp trên biểu đồ Histogram và quan sát vị trí số trung bình x̄, trung vị M_e, tứ phân vị.',
    verify: 'Kiểm chứng công thức ước lượng trung bình từ giá trị đại diện c_i và trung vị M_e tại vạch chia đôi diện tích biểu đồ.',
    conclude: 'Khi dữ liệu lớn được ghép nhóm theo khoảng, giá trị đại diện mỗi nhóm và biểu đồ tần số giúp ước lượng chính xác các số đặc trưng.'
  },
  '11-05': {
    predict: 'Thay đổi vị trí mặt phẳng cắt khối chóp 3D và quan sát các giao điểm trên các cạnh bên.',
    verify: 'Kiểm chứng giao tuyến của hai mặt phẳng là một đường thẳng đi qua các điểm chung, tạo thành đa giác thiết diện khép kín.',
    conclude: 'Muốn tìm giao tuyến của hai mặt phẳng, ta tìm hai điểm chung phân biệt của chúng; thiết diện là đa giác tạo bởi các đoạn giao tuyến.'
  },
  '11-06': {
    predict: 'Xoay mô hình không gian 3D và bấm Phát chuyển động để quan sát đường thẳng song song mặt phẳng, hai mặt phẳng song song và phép chiếu song song.',
    verify: 'Kiểm chứng: Khi d ∥ d′ ⊂ (P) thì d ∥ (P); khoảng cách giữa hai mặt phẳng song song (P) và (Q) bằng độ dài đoạn vuông góc chung HK.',
    conclude: 'Phép chiếu song song bảo toàn tính thẳng hàng, thứ tự điểm và tỉ số độ dài của hai đoạn thẳng cùng nằm trên các đường thẳng song song.'
  },
  '11-07': {
    predict: 'Xoay khối hình không gian 3D và kiểm tra góc giữa đường thẳng d với các đường nằm trong mặt phẳng (P).',
    verify: 'Kiểm chứng: Khi d vuông góc với hai đường thẳng cắt nhau trong (P) thì d ⊥ (P) và định lý 3 đường vuông góc.',
    conclude: 'Đường thẳng vuông góc với một mặt phẳng khi nó vuông góc với hai đường thẳng cắt nhau nằm trong mặt phẳng đó.'
  },
  '11-08': {
    predict: 'Xoay mô hình 3D để quan sát góc giữa đường thẳng d và hình chiếu d′, góc phẳng nhị diện [P, d, Q] và đoạn vuông góc chung AB.',
    verify: 'Kiểm chứng tam giác vuông ΔAHB (với sin φ = AH / AB) và đoạn vuông góc chung AB là khoảng cách ngắn nhất giữa hai đường chéo nhau.',
    conclude: 'Mọi bài toán góc và khoảng cách trong không gian đều quy về việc dựng hình chiếu vuông góc và giải tam giác vuông.'
  },
  '11-09': {
    predict: 'Thay đổi cạnh đáy và chiều cao h của khối lăng trụ, khối chóp, khối chóp cụt đều 3D và bấm Phát chuyển động.',
    verify: 'Kiểm chứng tỉ số thể tích V_chóp = (1/3)·V_lăng trụ có cùng diện tích đáy S và chiều cao h.',
    conclude: 'Thể tích khối lăng trụ V = S·h; thể tích khối chóp V = (1/3)S·h; thể tích khối chóp cụt V = (h/3)(S + S′ + √(SS′)).'
  },
  '11-10': {
    predict: 'Bấm Phát chuyển động để quan sát n → +∞ (giới hạn dãy số) hoặc x → x₀ (giới hạn và tính liên tục của hàm số).',
    verify: 'Kiểm chứng điểm khuyết được lấp kín khi lim_{x→x₀} f(x) = f(x₀) và định lý giá trị trung gian khi f(a)·f(b) < 0.',
    conclude: 'Hàm số liên tục trên một đoạn thì đồ thị là một đường liền nét không đứt gãy; nếu đổi dấu ở hai đầu đoạn thì chắc chắn có nghiệm.'
  },
  '11-11': {
    predict: 'Thay đổi cơ số a (0 < a < 1 hoặc a > 1) và quan sát tính đối xứng giữa đồ thị hàm số mũ y = a^x và hàm logarit y = log_a(x).',
    verify: 'Kiểm chứng hai đồ thị y = a^x và y = log_a(x) luôn đối xứng nhau qua đường phân giác y = x; đồng biến khi a > 1, nghịch biến khi 0 < a < 1.',
    conclude: 'Hàm số mũ và hàm số logarit cùng cơ số a là hai hàm số ngược của nhau, mô tả sự tăng trưởng/phân rã cấp số nhân.'
  },
  '11-12': {
    predict: 'Kéo điểm M₀ trên đồ thị hoặc giảm dần khoảng cách Δx → 0 để quan sát cát tuyến M₀M tiến dần về tiếp tuyến.',
    verify: 'Kiểm chứng hệ số góc cát tuyến Δy/Δx hội tụ về đạo hàm f′(x₀), chính là hệ số góc của tiếp tuyến tại M₀.',
    conclude: 'Đạo hàm f′(x₀) về mặt hình học là hệ số góc của tiếp tuyến với đồ thị hàm số tại điểm M₀(x₀; f(x₀)) và về mặt vật lý là vận tốc tức thời.'
  },
  '11-13': {
    predict: 'Thay đổi P(A), P(B) và thực hiện mô phỏng phép thử để kiểm chứng quy tắc cộng và quy tắc nhân xác suất.',
    verify: 'Kiểm chứng công thức P(A ∪ B) = P(A) + P(B) - P(A ∩ B) và với hai biến cố độc lập thì P(AB) = P(A)·P(B).',
    conclude: 'Quy tắc cộng tính xác suất của biến cố hợp; quy tắc nhân tính xác suất để cả hai biến cố độc lập cùng đồng thời xảy ra.'
  },
  // LỚP 12
  '12-01': {
    predict: 'Kéo điểm khảo sát M dọc theo đồ thị hàm bậc ba / hàm phân thức và quan sát dấu của đạo hàm f′(x) cùng chiều nghiêng tiếp tuyến.',
    verify: 'Kiểm chứng: Trên khoảng f′(x) > 0 hàm đồng biến (tiếp tuyến dốc lên); tại điểm cực trị thì f′(x₀) = 0 và tiếp tuyến nằm ngang.',
    conclude: 'Hàm số đạt cực đại hoặc cực tiểu tại điểm mà đạo hàm f′(x) đổi dấu khi đi qua điểm đó.'
  },
  '12-02': {
    predict: 'Thay đổi các hệ số a, b, c, d của hàm bậc ba hoặc hàm phân thức và quan sát các đường tiệm cận đứng, ngang, xiên.',
    verify: 'Kiểm chứng đồ thị hàm phân thức luôn nhận giao điểm hai đường tiệm cận I làm tâm đối xứng và tiến sát về tiệm cận khi x → ±∞.',
    conclude: 'Khảo sát sự biến thiên và xác định các đường tiệm cận giúp phác họa đầy đủ dáng điệu toàn cục của đồ thị hàm số.'
  },
  '12-03': {
    predict: 'Kéo thay đổi biến số thiết kế x (cạnh góc cắt hộp 3D, chiều rộng mảnh đất, giá bán) và quan sát giá trị mục tiêu đạt đỉnh.',
    verify: 'Kiểm chứng giá trị tối ưu (V_max, S_max, Doanh thu_max) đạt được đúng tại nghiệm của phương trình đạo hàm f′(x) = 0.',
    conclude: 'Phương pháp đạo hàm giúp giải quyết chính xác các bài toán tối ưu hóa hình học, vật lý và kinh tế trong thực tiễn.'
  },
  '12-04': {
    predict: 'Xoay hệ trục Oxyz 3D và thay đổi tọa độ điểm M(x; y; z) hoặc hai vectơ u, v để quan sát hình hộp chiếu tọa độ.',
    verify: 'Kiểm chứng quy tắc hình hộp / hình bình hành trong không gian 3D, độ dài |OM| = √(x² + y² + z²) và tích vô hướng u·v.',
    conclude: 'Hệ tọa độ Oxyz mở rộng hoàn toàn các phép toán vectơ từ mặt phẳng 2D lên không gian 3 chiều với bộ ba tọa độ (x; y; z).'
  },
  '12-05': {
    predict: 'Thay đổi tần số các nhóm ghép lớp và so sánh khoảng biến thiên R, khoảng tứ phân vị Δ_Q, phương sai s² và độ lệch chuẩn s.',
    verify: 'Kiểm chứng khi dữ liệu tập trung quanh số trung bình thì độ lệch chuẩn s nhỏ; khi dữ liệu trải rộng ở hai biên thì s lớn.',
    conclude: 'Phương sai s² và độ lệch chuẩn s của mẫu số liệu ghép nhóm là thước đo chuẩn xác về mức độ rủi ro / biến động của dữ liệu.'
  },
  '12-06': {
    predict: 'Tăng số hình chữ nhật chia nhỏ n và kéo thay đổi hai cận tích phân a, b trên hình phẳng.',
    verify: 'Kiểm chứng tổng diện tích các hình chữ nhật Riemann S_n hội tụ sát về tích phân xác định ∫_a^b f(x)dx = F(b) - F(a).',
    conclude: 'Công thức Newton–Leibniz kết nối nguyên hàm F(x) với diện tích hình thang cong giới hạn bởi đồ thị hàm số.'
  },
  '12-07': {
    predict: 'Cho miền phẳng quay quanh trục Ox trong không gian 3D và bấm Phát chuyển động để lát cắt hình tròn quét dọc trục Ox.',
    verify: 'Kiểm chứng diện tích mỗi lát cắt tại hoành độ x là S(x) = π·([R(x)]² - [r(x)]²), từ đó V = π∫_a^b ([R(x)]² - [r(x)]²)dx.',
    conclude: 'Tích phân xác định cho phép tính thể tích khối tròn xoay bất kỳ thông qua tích phân diện tích mặt cắt vuông góc với trục quay.'
  },
  '12-08': {
    predict: 'Thay đổi tọa độ vectơ pháp tuyến n = (A; B; C) và hệ số D của mặt phẳng trong hệ trục Oxyz 3D.',
    verify: 'Kiểm chứng vectơ pháp tuyến n luôn vuông góc với mặt phẳng (P) và công thức khoảng cách d(M, (P)) = |Ax₀+By₀+Cz₀+D| / √(A²+B²+C²).',
    conclude: 'Một mặt phẳng trong không gian Oxyz hoàn toàn được xác định khi biết một điểm đi qua và một vectơ pháp tuyến n = (A; B; C).'
  },
  '12-09': {
    predict: 'Xoay hệ trục Oxyz 3D và thay đổi vectơ chỉ phương u hoặc khoảng cách/góc giữa hai đường thẳng d₁, d₂.',
    verify: 'Kiểm chứng 4 vị trí tương đối giữa hai đường thẳng trong không gian 3D: cắt nhau, song song, trùng nhau và chéo nhau.',
    conclude: 'Đường thẳng trong không gian Oxyz được xác định bởi điểm đi qua M₀(x₀; y₀; z₀) và vectơ chỉ phương u = (a; b; c).'
  },
  '12-10': {
    predict: 'Xoay mặt cầu (S) trong hệ trục Oxyz 3D, bấm Phát chuyển động để mặt phẳng (P) / đường thẳng Δ dịch chuyển cắt mặt cầu.',
    verify: 'Kiểm chứng tam giác vuông ΔOHM (r = √(R² - d²)): Khi d < R cắt theo đường tròn (hoặc 2 điểm A, B); khi d = R tiếp xúc; khi d > R không giao nhau.',
    conclude: 'Mặt cầu (S) tâm I(a; b; c) bán kính R có phương trình (x - a)² + (y - b)² + (z - c)² = R²; vị trí tương đối quyết định bởi việc so sánh d và R.'
  },
  '12-11': {
    predict: 'Thay đổi xác suất tiền nghiệm P(A) và các xác suất có điều kiện P(B|A), P(B|Ā) trên sơ đồ hình cây xác suất.',
    verify: 'Kiểm chứng công thức xác suất toàn phần P(B) = P(A)P(B|A) + P(Ā)P(B|Ā) và công thức Bayes P(A|B) = P(A)P(B|A) / P(B).',
    conclude: 'Công thức Bayes cho phép cập nhật xác suất hậu nghiệm của nguyên nhân A sau khi đã quan sát thấy kết quả thực nghiệm B.'
  }
};

const MODE_SPECIFIC_CONCLUDE = {
  // LỚP 7 - NHÓM 7-03 & 7-05
  '7-03-C01': 'Tổng ba góc trong một tam giác luôn bằng 180° (∠A + ∠B + ∠C = 180°).',
  '7-03-C02': 'Mỗi góc ngoài của một tam giác bằng tổng hai góc trong không kề với nó (∠CBx = ∠A + ∠C).',
  '7-03-C03': 'Trong một tam giác, góc đối diện với cạnh lớn hơn là góc lớn hơn và ngược lại.',
  '7-03-C04': 'Bất đẳng thức tam giác: Độ dài một cạnh bất kỳ luôn nhỏ hơn tổng độ dài hai cạnh còn lại và lớn hơn hiệu của chúng.',
  '7-03-C05': 'Tam giác cân có hai cạnh bên bằng nhau và hai góc ở đáy bằng nhau; tam giác đều có ba cạnh bằng nhau và ba góc đều bằng 60°.',
  '7-05-C01': 'Ba đường trung tuyến của một tam giác cùng đi qua một điểm (trọng tâm G) và cách mỗi đỉnh một khoảng bằng 2/3 độ dài đường trung tuyến đi qua đỉnh ấy.',
  '7-05-C02': 'Ba đường phân giác của một tam giác đồng quy tại một điểm I cách đều ba cạnh của tam giác (tâm đường tròn nội tiếp).',
  '7-05-C03': 'Ba đường trung trực của một tam giác đồng quy tại một điểm O cách đều ba đỉnh của tam giác (OA = OB = OC = R).',
  '7-05-C04': 'Ba đường cao của một tam giác cùng đi qua một điểm duy nhất gọi là trực tâm H của tam giác.',
  '7-05-C05': 'Hai đường tròn tâm A và tâm B cùng bán kính R = AB cắt nhau tại P, Q (PA = PB = QA = QB = AB); đường thẳng PQ đi qua trung điểm M và vuông góc với AB chính là đường trung trực của đoạn thẳng AB.',
  // LỚP 10
  '10-01-C01': 'Công thức cộng lực lượng tập hợp: n(A ∪ B) = n(A) + n(B) − n(A ∩ B).',
  '10-01-C02': 'Hiệu A \\ B gồm các phần tử thuộc A nhưng không thuộc B: n(A \\ B) = n(A) − n(A ∩ B).',
  '10-01-C03': 'Phần bù C_U A = U \\ A gồm mọi phần tử của tập vũ trụ U không thuộc A: n(C_U A) = n(U) − n(A).',
  '10-01-C04': 'Giao hai đoạn [a; b] ∩ [c; d] = [max(a, c); min(b, d)] khi max(a, c) ≤ min(b, d).',
  '10-02-C01': 'Đường thẳng ax + by = c chia mặt phẳng Oxy thành hai nửa mặt phẳng; một nửa là miền nghiệm của ax + by ≤ c.',
  '10-02-C02': 'Miền nghiệm của hệ bất phương trình bậc nhất hai ẩn là giao các nửa mặt phẳng nghiệm của từng bất phương trình.',
  '10-02-C03': 'Miền nghiệm hệ bất phương trình là miền đa giác lồi; biểu thức F = ux + vy đạt cực trị tại một trong các đỉnh.',
  '10-03-C01': 'Định lý Cosin trong tam giác bất kỳ: a² = b² + c² − 2bc·cos A (khi ∠A = 90° trở về định lý Pythagore).',
  '10-03-C02': 'Định lý Sin: a/sin A = b/sin B = c/sin C = 2R (với R là bán kính đường tròn ngoại tiếp tam giác).',
  '10-03-C03': 'Diện tích tam giác S = ½·b·c·sin A = ½·c·h_c = abc/(4R) = √[p(p−a)(p−b)(p−c)] (công thức Heron).',
  '10-04-C01': 'Quy tắc hình bình hành & quy tắc 3 điểm: OA + OB = OC và OA + AB = OB, tọa độ tổng u + v = (u_x + v_x; u_y + v_y).',
  '10-04-C02': 'Quy tắc hiệu hai vectơ chung gốc O: OA − OB = BA (mũi tên hướng về điểm đầu của vectơ bị trừ).',
  '10-04-C03': 'Vectơ k·u cùng hướng với u khi k > 0, ngược hướng khi k < 0 và có độ dài |k·u| = |k|·|u|.',
  '10-04-C04': 'Tích vô hướng u·v = |u|·|v|·cos(u, v) = u_x·v_x + u_y·v_y; hai vectơ vuông góc khi và chỉ khi u·v = 0.',
  '10-05-C01': 'Tọa độ của vectơ AB được xác định bằng hiệu tọa độ điểm cuối trừ điểm đầu: AB = (x_B − x_A; y_B − y_A).',
  '10-05-C02': 'Độ dài đoạn thẳng |AB| = √[(x_B − x_A)² + (y_B − y_A)²] và tọa độ trung điểm M = ((x_A + x_B)/2; (y_A + y_B)/2).',
  '10-05-C03': 'Biểu thức tọa độ tích vô hướng: AB·v = u_x·v_x + u_y·v_y; hai vectơ vuông góc khi tổng tích tọa độ bằng 0.',
  '10-06-C01': 'Hàm số bậc hai y = ax² + bx + c (a ≠ 0) có đỉnh I(−b/(2a); −Δ/(4a)) và trục đối xứng x = −b/(2a).',
  '10-06-C02': 'Khi a > 0 bề lõm parabol hướng lên (đạt cực tiểu tại đỉnh I); khi a < 0 bề lõm hướng xuống (đạt cực đại tại đỉnh I).',
  '10-06-C03': 'Dấu của tam thức bậc hai f(x) = ax² + bx + c phụ thuộc vào dấu hệ số a và biệt thức Δ = b² − 4ac.',
  '10-07-C01': 'Phương trình tổng quát đường thẳng Δ: ax + by + c = 0 có vectơ pháp tuyến n = (a; b) vuông góc với Δ.',
  '10-07-C02': 'Phương trình tham số đường thẳng đi qua M₀(x₀; y₀) có vectơ chỉ phương u = (−b; a) vuông góc với n = (a; b).',
  '10-07-C03': 'Vị trí tương đối và góc giữa hai đường thẳng Δ₁, Δ₂ được xác định qua tỉ số hệ số và tích vô hướng hai pháp tuyến.',
  '10-07-C04': 'Khoảng cách ngắn nhất từ điểm P(x₀; y₀) đến đường thẳng Δ là độ dài đoạn vuông góc PH: d(P, Δ) = |ax₀+by₀+c|/√(a²+b²).',
  '10-08-C01': 'Đường tròn (C) tâm I(h; k) bán kính R có phương trình (x − h)² + (y − k)² = R².',
  '10-08-C02': 'Vị trí tương đối giữa đường thẳng Δ và đường tròn (I; R): d < R cắt nhau (2 điểm), d = R tiếp xúc, d > R không giao nhau.',
  '10-08-C03': 'Tiếp tuyến của đường tròn tại tiếp điểm T(x_T; y_T) vuông góc với bán kính IT: (x_T − h)(x − x_T) + (y_T − k)(y − y_T) = 0.',
  '10-09-C01': 'Elip (E): x²/a² + y²/b² = 1 là quỹ tích các điểm M có tổng khoảng cách tới hai tiêu điểm MF₁ + MF₂ = 2a không đổi.',
  '10-09-C02': 'Hyperbol (H): x²/a² − y²/b² = 1 là quỹ tích các điểm M có hiệu khoảng cách |MF₁ − MF₂| = 2a không đổi.',
  '10-09-C03': 'Parabol (P): y² = 2px là quỹ tích các điểm M cách đều tiêu điểm F(p/2; 0) và đường chuẩn Δ: x = −p/2.',
  '10-10-C01': 'Số trung bình, trung vị M_e và tứ phân vị Q₁, Q₂, Q₃ đo xu thế trung tâm của mẫu số liệu không ghép nhóm.',
  '10-10-C02': 'Khoảng biến thiên R = x_max − x_min và khoảng tứ phân vị Δ_Q = Q₃ − Q₁ đo độ phân tán của nửa giữa mẫu số liệu.',
  '10-10-C03': 'Phương sai s² và độ lệch chuẩn s đo mức độ phân tán quanh số trung bình; giá trị ngoài [Q₁−1.5Δ_Q; Q₃+1.5Δ_Q] là ngoại lệ.',
  '10-10-C04': 'Sai số tuyệt đối Δ_a = |a − ā| ≤ d phản ánh mức độ chính xác của phép đo gần đúng so với ngưỡng cho phép d.',
  '10-11-C01': 'Quy tắc cộng (m + n) áp dụng cho các phương án tách rời; quy tắc nhân (m · n) áp dụng cho quy trình gồm các công đoạn liên tiếp.',
  '10-11-C02': 'Chỉnh hợp A_n^k có phân biệt thứ tự sắp xếp; tổ hợp C_n^k = A_n^k / k! chỉ chọn tập con k phần tử không phân biệt thứ tự.',
  '10-11-C03': 'Xác suất cổ điển P(A) = n(A)/n(Ω); khi số lần thử N tăng lớn, tần số tương đối f = k/N hội tụ về P(A).',
  '10-11-C04': 'Nhị thức Newton (a + b)^n có các hệ số C_n^k đối xứng trên tam giác Pascal và tổng các hệ số bằng 2^n.',
  // LỚP 11
  '11-01-C01': 'Mỗi góc lượng giác α xác định một điểm M duy nhất trên đường tròn lượng giác; đổi độ sang radian: α_rad = α° · π/180°.',
  '11-01-C02': 'Trên đường tròn lượng giác đơn vị: hoành độ x_M = cos α, tung độ y_M = sin α và cos²α + sin²α = 1.',
  '11-01-C03': 'Cung tròn bán kính R chắn bởi góc ở tâm α (rad) có độ dài l = R · |α|.',
  '11-01-C04': 'Công thức cộng lượng giác: cos(α + β) = cos α cos β − sin α sin β và sin(α + β) = sin α cos β + cos α sin β.',
  '11-02-C05': 'Phương trình sin x = m, cos x = m có nghiệm khi |m| ≤ 1, biểu diễn bằng hoành độ giao điểm với đường thẳng ngang y = m.',
  '11-02-C06': 'Phương trình tan x = m, cot x = m luôn có nghiệm với mọi m ∈ ℝ và lặp lại tuần hoàn theo chu kỳ π.',
  '11-03-C01': 'Dãy số (u_n) là hàm số trên tập ℕ*; dãy bị chặn và hội tụ khi các điểm (n; u_n) tiến sát về đường giới hạn ngang.',
  '11-03-C02': 'Cấp số cộng có hiệu u_{n+1} − u_n = d không đổi; số hạng tổng quát u_n = u₁ + (n−1)d và tổng S_n = n(u₁ + u_n)/2.',
  '11-03-C03': 'Cấp số nhân có tỉ số u_{n+1} / u_n = q không đổi; số hạng tổng quát u_n = u₁·q^(n−1) và tổng S_n = u₁(1 − q^n)/(1 − q).',
  '11-04-C01': 'Bảng tần số ghép nhóm phân chia mẫu số liệu lớn thành các khoảng lớp liên tiếp với giá trị đại diện c_i = (a_i + a_{i+1})/2.',
  '11-04-C02': 'Số trung bình của mẫu số liệu ghép nhóm được ước lượng theo giá trị đại diện các lớp: x_TB ≈ (Σ n_i · c_i) / N.',
  '11-04-C03': 'Trung vị M_e và tứ phân vị Q₁, Q₃ của mẫu ghép nhóm được nội suy từ tần số tích lũy tại vạch 25%, 50%, 75% cỡ mẫu.',
  '11-10-C01': 'Dãy số u_n = c/(n + 1) có giới hạn bằng 0 khi n → +∞ vì khoảng cách |u_n − 0| nhỏ tùy ý khi n đủ lớn.',
  '11-10-C02': 'Giới hạn hàm số tồn tại tại x = a khi và chỉ khi giới hạn trái lim_{x→a⁻} f(x) bằng giới hạn phải lim_{x→a⁺} f(x).',
  '11-10-C03': 'Hàm số f(x) liên tục tại điểm x = a khi và chỉ khi lim_{x→a} f(x) = f(a) (đồ thị liền nét, không có bước nhảy j = 0).',
  '11-13-C01': 'Quy tắc cộng xác suất cho hai biến cố bất kỳ: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).',
  '11-13-C02': 'Hai biến cố xung khắc (A ∩ B = ∅) không thể đồng thời xảy ra nên P(A ∪ B) = P(A) + P(B).',
  '11-13-C03': 'Hai biến cố A, B độc lập khi việc xảy ra của biến cố này không ảnh hưởng tới biến cố kia: P(A ∩ B) = P(A)·P(B).',
  // LỚP 12
  '12-03-C01': 'Trong các hình chữ nhật có cùng chu vi P, hình vuông cạnh x* = P/4 có diện tích lớn nhất S_max = P²/16.',
  '12-03-C02': 'Hộp không nắp cắt từ tấm bìa vuông cạnh L đạt thể tích cực đại V_max khi cạnh góc cắt x* = L/6 (V′(x*) = 0).',
  '12-03-C03': 'Hàm doanh thu R(p) = p(a − bp) đạt cực đại tại mức giá tối ưu p* = a/(2b) nơi đạo hàm biên R′(p*) = 0.',
  '12-04-C01': 'Trong hệ trục Oxyz, tọa độ điểm M(x; y; z) xác định bởi hình hộp chữ nhật chiếu lên 3 trục với độ dài OM = √(x² + y² + z²).',
  '12-04-C02': 'Biểu thức tọa độ của vectơ trong không gian Oxyz: u = (u₁; u₂; u₃) có độ dài |u| = √(u₁² + u₂² + u₃²).',
  '12-04-C03': 'Tích vô hướng trong không gian Oxyz: u·v = u₁v₁ + u₂v₂ + u₃v₃ và cos(u, v) = (u·v)/(|u|·|v|).',
  '12-04-C04': 'Quy tắc hình hộp & hình bình hành trong Oxyz: tổng hai vectơ u + v = (u₁ + v₁; u₂ + v₂; u₃ + v₃).',
  '12-05-C01': 'Khoảng biến thiên R = a_k − a_1 của mẫu số liệu ghép nhóm đo độ trải rộng toàn bộ mẫu từ đầu mút lớp đầu đến lớp cuối.',
  '12-05-C02': 'Khoảng tứ phân vị Δ_Q = Q₃ − Q₁ của mẫu ghép nhóm đo độ phân tán của 50% số liệu trung tâm, không bị ảnh hưởng bởi cực trị.',
  '12-05-C03': 'Phương sai s² ≈ (1/N) Σ n_i(c_i − x_TB)² và độ lệch chuẩn s = √(s²) đo mức độ phân tán dữ liệu quanh số trung bình.',
  '12-06-C01': 'Định lý cơ bản của Giải tích: F(x) = ∫ f(x)dx là nguyên hàm của f(x) nên đạo hàm F′(x) tại mọi điểm bằng đúng độ cao f(x).',
  '12-11-C01': 'Xác suất có điều kiện P(A|B) = P(A ∩ B) / P(B) là xác suất của A khi biết biến cố B đã xảy ra (thu hẹp không gian mẫu về B).',
  '12-11-C02': 'Công thức nhân xác suất cho hai biến cố bất kỳ: P(A ∩ B) = P(A) · P(B|A) = P(B) · P(A|B).',
  '12-11-C03': 'Công thức Bayes cập nhật xác suất hậu nghiệm của nguyên nhân A sau khi quan sát kết quả B: P(A|B) = P(A)P(B|A) / P(B).',
  '12-11-C04': 'Công thức xác suất toàn phần tính xác suất biến cố B qua các nhánh phân hoạch: P(B) = P(A)P(B|A) + P(Ā)P(B|Ā).'
};

export function getGuidedDiscoveryPlan(modeId, modeMeta = null) {
  const cm = getCurriculumModelById(modeId);
  const id = String(modeId || '');
  const famKey = cm?.targetLabId || id.replace(/-C\d+$/, '');
  const famPed = FAMILY_PEDAGOGY[famKey] || null;

  const interactionText = modeMeta?.student_interaction || modeMeta?.action || famPed?.predict ||
    'Kéo trực tiếp các điểm điều khiển màu cam trên hình hoặc điều chỉnh thanh trượt tham số và dự đoán sự thay đổi của mô hình.';

  const verifyText = modeMeta?.math_rule_to_verify || famPed?.verify ||
    'Quan sát các đại lượng đo đạc và công thức cập nhật theo thời gian thực để kiểm chứng mối liên hệ bất biến giữa các yếu tố.';

  const lessonLabel = cm
    ? `SGK Toán ${cm.targetGrade} (Tập ${cm.volume}) · Chương ${cm.chapterNum}: ${cm.chapterTitle} · Bài ${cm.lessonNum}: ${cm.lessonTitle}`
    : `Chuẩn chương trình GDPT 2018 · Mã mô hình ${id}`;

  const v4Meta = cm?.v4Meta || getV4PedagogyMeta(id);
  const baseConclude = MODE_SPECIFIC_CONCLUDE[id] || famPed?.conclude ||
    (modeMeta?.summary
      ? `${modeMeta.summary} (${lessonLabel}).`
      : `Khi các tham số biến thiên trong miền hợp lệ, tính chất toán học cốt lõi của "${cm?.name || modeMeta?.name || id}" luôn được bảo toàn (${lessonLabel}).`);
  const concludeText = v4Meta?.scopeNote
    ? `${baseConclude} — [${v4Meta.v4Code} · ${v4Meta.badge}] ${v4Meta.scopeNote}`
    : baseConclude;

  const cleanStep1 = formatMathText(interactionText);
  const cleanStep2 = formatMathText(verifyText);
  const cleanStep3 = formatMathText(concludeText);

  return {
    modeId: id,
    name: formatMathText(v4Meta?.displayTitle || cm?.name || modeMeta?.name || id),
    lessonLabel,
    step1: cleanStep1,
    step2: cleanStep2,
    step3: cleanStep3,
    observe: cleanStep1,
    correlate: cleanStep2,
    takeaway: cleanStep3,
    v4Meta
  };
}

/**
 * Gắn thẻ "Nhiệm vụ Khám phá 3 Bước" vào vùng Stage của Phòng Lab hoặc Bục 3D Holo-Stage.
 * Tự động lắng nghe thao tác kéo thả / chỉnh thanh trượt của học sinh để đánh dấu hoàn thành từng bước.
 */
export function mountGuidedDiscoveryCard(stageEl, { modeId, mode = null, onDemonstrate = null, compact = false } = {}) {
  if (!stageEl || !modeId) return null;
  const old = stageEl.querySelector('.mv-r11-discovery-card');
  if (old) old.remove();

  const plan = getGuidedDiscoveryPlan(modeId, mode);
  const card = document.createElement('section');
  card.className = 'mv-r11-discovery-card' + (compact ? ' is-compact' : '');
  card.setAttribute('aria-label', 'Nhiệm vụ khám phá toán học 3 bước');

  const v4BadgeHtml = plan.v4Meta
    ? `<span class="mv-r11-disc-badge" style="background:rgba(245,158,11,0.18);color:#fde68a;border:1px solid rgba(245,158,11,0.45)">📌 ${plan.v4Meta.badge}</span>`
    : '';

  const hasStageHeaderBreadcrumb = Boolean(stageEl.querySelector?.('.mv-r5-stage-header small'));
  const headerSubtitle = hasStageHeaderBreadcrumb
    ? `Chuỗi khám phá trực quan: Dự đoán (0%) → Kiểm chứng (50%) → Kết luận SGK (100%)`
    : plan.lessonLabel;

  card.innerHTML = `
    <div class="mv-r11-disc-header">
      <div class="mv-r11-disc-title">
        <span class="mv-r11-disc-badge">🎯 KHÁM PHÁ 3 BƯỚC</span>
        ${v4BadgeHtml}
        <strong>${headerSubtitle}</strong>
      </div>
      <div class="mv-r11-disc-actions">
        <button type="button" class="mv-r11-disc-demo-btn" title="Tự động chạy mô phỏng để kiểm chứng nhanh định lý">⚡ Tự động kiểm chứng</button>
        <button type="button" class="mv-r11-disc-toggle-btn" title="Thu gọn / Mở rộng thẻ nhiệm vụ">Thu gọn ▲</button>
      </div>
    </div>
    <div class="mv-r11-disc-steps">
      <div class="mv-r11-disc-step is-active" data-step="1">
        <div class="mv-r11-step-head">
          <span class="mv-r11-step-num">1</span>
          <strong>Dự đoán & Thao tác trực tiếp</strong>
          <em class="mv-r11-step-status">Đang chờ thao tác...</em>
        </div>
        <p>${plan.step1}</p>
      </div>
      <div class="mv-r11-disc-step" data-step="2">
        <div class="mv-r11-step-head">
          <span class="mv-r11-step-num">2</span>
          <strong>Kiểm chứng Bất biến Toán học</strong>
          <em class="mv-r11-step-status">0 / 3 lần thử</em>
        </div>
        <p>${plan.step2}</p>
      </div>
      <div class="mv-r11-disc-step" data-step="3">
        <div class="mv-r11-step-head">
          <span class="mv-r11-step-num">3</span>
          <strong>Kết luận Định lý SGK</strong>
          <em class="mv-r11-step-status">Mở khóa khi kiểm chứng</em>
        </div>
        <p>${plan.step3}</p>
      </div>
    </div>
  `;

  // Chèn ngay dưới tiêu đề bài học (.mv-r5-stage-header) hoặc ở đầu vùng stage
  const headerEl = stageEl.querySelector('.mv-r5-stage-header');
  if (headerEl && headerEl.nextSibling) {
    stageEl.insertBefore(card, headerEl.nextSibling);
  } else if (headerEl) {
    stageEl.append(card);
  } else {
    stageEl.prepend(card);
  }

  let interactionCount = 0;
  const step1El = card.querySelector('[data-step="1"]');
  const step2El = card.querySelector('[data-step="2"]');
  const step3El = card.querySelector('[data-step="3"]');
  const s1Status = step1El.querySelector('.mv-r11-step-status');
  const s2Status = step2El.querySelector('.mv-r11-step-status');
  const s3Status = step3El.querySelector('.mv-r11-step-status');

  function updateProgress(count, forcedComplete = false) {
    interactionCount = Math.max(interactionCount, count);
    if (interactionCount >= 1 || forcedComplete) {
      step1El.classList.add('is-done');
      step1El.classList.remove('is-active');
      s1Status.textContent = '✓ Đã thao tác';
      step2El.classList.add('is-active');
      s2Status.textContent = `${Math.min(3, interactionCount)} / 3 lần thử`;
    }
    if (interactionCount >= 3 || forcedComplete) {
      step2El.classList.add('is-done');
      step2El.classList.remove('is-active');
      s2Status.textContent = '✓ Đã kiểm chứng bất biến!';
      step3El.classList.add('is-done', 'is-active');
      s3Status.textContent = '★ Hoàn thành bài học';
      card.classList.add('is-verified');
    }
  }

  // Lắng nghe thao tác kéo trên SVG/Canvas hoặc chỉnh thanh trượt trong stageEl
  let lastTick = 0;
  const recordInteraction = (e) => {
    if (card.contains(e.target)) return;
    const now = performance.now();
    if (now - lastTick < 220) return;
    lastTick = now;
    updateProgress(interactionCount + 1);
  };
  stageEl.addEventListener('input', recordInteraction);
  stageEl.addEventListener('pointerdown', (e) => {
    if (e.target.closest?.('svg, canvas, .mv-g7-button, .mv-r5-action')) {
      recordInteraction(e);
    }
  });

  const demoBtn = card.querySelector('.mv-r11-disc-demo-btn');
  demoBtn?.addEventListener('click', () => {
    if (typeof onDemonstrate === 'function') {
      onDemonstrate();
    } else {
      // Tự động kích hoạt nút Phát chuyển động trong Stage nếu có
      const playBtn = [...stageEl.querySelectorAll('button')].find(b =>
        /▶\s*Phát|Phát chuyển động|Chồng hình động|Tự quay/i.test(b.textContent || '')
      );
      if (playBtn) playBtn.click();
    }
    updateProgress(3, true);
    demoBtn.textContent = '✓ Đang minh họa định lý';
  });

  const toggleBtn = card.querySelector('.mv-r11-disc-toggle-btn');
  toggleBtn?.addEventListener('click', () => {
    const collapsed = card.classList.toggle('is-collapsed');
    toggleBtn.textContent = collapsed ? 'Mở nhiệm vụ ▼' : 'Thu gọn ▲';
  });

  return { card, updateProgress };
}

