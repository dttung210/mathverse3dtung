/** R91: deterministic pedagogy-driven timeline for *existing* MATHVERSE 3D Labs.
 * No new viewer, no new app and no independent addon.
 * Only dedicated Net-Unfolding ("Khai triển") lessons fold/unfold in 3D automatically;
 * all other 3D spatial lessons preserve their intact 3D solid and run cross-section
 * or parameter-construction animations.
 */
export const FOLDABLE_TYPES = new Set([
 'cube','cuboid','quadPrism','prismQuad','triPrism','triangularPrism',
 'trianglePyramid','tetrahedron','squarePyramid','frustumPyramid','chopcut4',
 'cylinder','cone','conicalFrustum','openTopBox'
]);
export const NET_UNFOLD_MODE_IDS = new Set([
 '7-08-C03','7-09-C03','8-09-C03','9-09-C02','9-10-C02','12-03-C02'
]);
export const CURVED_NONDEVELOPABLE = new Set(['sphere','sphereSection','oxyzSphereCut','oxyzSphereLine']);
/** R92: explicit learning intent per spatial Lab. A construction is not a
 * cross-section, and a net lesson is not a volume lesson. These plans drive
 * the in-place R91 viewer, not a new canvas, add-on or duplicate model. */
const scenario=(action,goal,steps,focus='geometry')=>Object.freeze({action,goal,steps:Object.freeze(steps),focus});
export const SPATIAL_STORYBOARDS=Object.freeze({
 '7-08-C01':scenario('assemble','Nhận biết 6 mặt, 12 cạnh, 8 đỉnh và đường chéo của hình hộp chữ nhật',['Xác định đáy chữ nhật a×b','Dựng chiều cao h theo 4 cạnh bên vuông góc','Đối chiếu 3 cặp mặt đối diện bằng nhau','Kiểm tra đường chéo không gian d = √(a²+b²+h²)']),
 '7-08-C02':scenario('assemble','Quan sát sáu mặt hình vuông bằng nhau và thiết diện chéo hình lập phương',['Xác định mặt đáy hình vuông a×a','Đồng bộ 3 kích thước bằng nhau a = b = h','Đối chiếu 6 mặt hình vuông bằng nhau','Kiểm tra đường chéo mặt a√2 và đường chéo khối a√3']),
 '7-08-C03':scenario('fold','Chứng minh một bản khai triển gấp thành hình hộp',['Quan sát đáy và bốn mặt bên','Gấp thành khối, khép nắp','Nhận diện cạnh và mặt tương ứng','Mở trở lại bản khai triển']),
 '7-08-C04':scenario('section','Liên hệ diện tích đáy với thể tích hình hộp',['Xác định đáy có diện tích a·b','Nâng dần mặt cắt song song đáy','Đọc chiều cao h','Kết luận V = a·b·h']),
 '7-09-C01':scenario('assemble','Nhận biết hai đáy tam giác song song, ba mặt bên chữ nhật',['Xác định đáy dưới tam giác đều △ABC','Tịnh tiến đáy dọc theo 3 cạnh bên vuông góc h','Khớp đáy trên △A′B′C′ song song và bằng đáy dưới','Đếm đúng 5 mặt, 9 cạnh, 6 đỉnh']),
 '7-09-C02':scenario('assemble','Nhận biết lăng trụ đứng tứ giác: hai đáy tứ giác, bốn mặt bên chữ nhật',['Phân tích đáy tứ giác (hình thang cân ABCD)','Dựng bốn mặt bên hình chữ nhật vuông góc đáy','Đậy đáy trên song song đáy dưới','Đối chiếu 6 mặt, 12 cạnh, 8 đỉnh']),
 '7-09-C03':scenario('fold','Khai triển lăng trụ theo đúng chuỗi cạnh tương ứng',['Xác định hai đáy tam giác','Gấp ba mặt bên theo bản lề','Kiểm tra hai đáy song song','Trải phẳng cả năm mặt']),
 '7-09-C04':scenario('section','Giải thích thể tích lăng trụ qua các mặt cắt bằng đáy',['Xác định diện tích S đáy','Di chuyển thiết diện song song đáy','Quan sát thiết diện không đổi','Kết luận V = S đáy · h']),
 '8-09-C01':scenario('assemble','Dựng hình chóp tam giác đều từ đáy tam giác đều và đường cao SO',['Xác định đáy tam giác đều ABC và trọng tâm O','Dựng trục đường cao SO vuông góc mặt đáy tại O','Nâng đỉnh S tới độ cao h tạo 3 mặt bên cân bằng nhau','Đối chiếu tam giác vuông △SOI tính trung đoạn d']),
 '8-09-C02':scenario('altitude','Phân biệt đường cao SO, trung đoạn SI và cạnh bên SA của chóp tứ giác đều',['Nhận diện đáy hình vuông ABCD và tâm O','Dựng đường cao SO = h vuông góc mặt đáy','Dựng trung đoạn SI = d xuống trung điểm cạnh đáy','Đối chiếu △SOI (d² = h² + a²/4) và △SOA (SA² = h² + a²/2)']),
 '8-09-C03':scenario('fold','Kiểm tra hình khai triển của hình chóp đều',['Trải đáy và các tam giác bên','Gấp theo từng cạnh của đáy','Khép các đỉnh vào chung đỉnh S','Mở lại đúng hình khai triển']),
 '8-09-C04':scenario('section','Minh họa thể tích hình chóp qua thiết diện đồng dạng',['Quan sát đáy có diện tích S','Mặt cắt song song đáy đi lên','Thiết diện co dần khi lên gần đỉnh','Kết luận V = (1/3)S·h']),
 '9-09-C01':scenario('assemble','Hình thành hình trụ khi quay hình chữ nhật OO′AB quanh trục OO′',['Xác định trục quay OO′ = h và bán kính r','Quay cạnh AB song song trục tạo mặt xung quanh','Hình thành hai đáy tròn tâm O, O′ bán kính r','Nhận biết đường sinh l = h vuông góc hai đáy']),
 '9-09-C02':scenario('fold','Trải mặt xung quanh hình trụ thành hình chữ nhật',['Quan sát hình trụ đặc','Cắt theo một đường sinh','Trải thành hình chữ nhật dài 2πr, cao h','Ghép lại hai hình tròn đáy']),
 '9-09-C03':scenario('section','Thể tích hình trụ từ các lớp hình tròn bằng nhau',['Giữ hình trụ và bán kính r','Mặt cắt tròn di chuyển dọc trục','Quan sát diện tích πr² không đổi','Kết luận V = πr²h']),
 '9-10-C01':scenario('assemble','Tạo hình nón khi quay tam giác vuông △SOA quanh trục cao SO',['Xác định trục cao SO = h và bán kính đáy OA = r','Quay cạnh huyền SA quanh SO tạo mặt nón','Xác định đường sinh l = √(r² + h²)','Kiểm chứng hệ thức Pythagore r² + h² = l²']),
 '9-10-C02':scenario('fold','Khai triển hình nón thành hình quạt và hình tròn',['Quan sát khối nón hoàn chỉnh','Mở đường cắt theo đường sinh','Trải hình quạt bán kính l, cung 2πr','Kiểm tra vòng tròn đáy bán kính r']),
 '9-10-C03':scenario('section','Thể tích khối nón từ tiết diện tròn thu nhỏ',['Xác định bán kính đáy r','Di chuyển mặt cắt lên phía đỉnh','Bán kính mặt cắt giảm tuyến tính','Kết luận V = (1/3)πr²h']),
 '9-11-C01':scenario('sphere','Dựng mặt cầu từ nửa đường tròn quay quanh đường kính AB = 2R',['Xác định tâm O và bán kính R','Quét các vòng vĩ tuyến tạo mặt cầu','Khép mặt cầu liên tục','Kiểm chứng quỹ tích OM = R không đổi']),
 '9-11-C02':scenario('sphere_scale','Liên hệ bán kính R với diện tích mặt cầu S = 4πR² và thể tích V = (4/3)πR³',['Cho bán kính R tăng dần từ 55% đến 100%','Đối chiếu diện tích mặt cầu bằng 4 hình tròn lớn (4πR²)','Quan sát thể tích khối cầu tăng theo R³','Đọc S = 4πR² và V = (4/3)πR³']),
 '9-11-C03':scenario('sphere_section','Khảo sát mặt phẳng cắt khối cầu theo đường tròn giao tuyến r = √(R² − d²)',['Nhận diện tâm O, bán kính R và khoảng cách OH = d','Di chuyển mặt phẳng cắt từ tâm O ra biên','Quan sát tiết diện tròn thu nhỏ theo r = √(R² − d²)','Đối chiếu tam giác vuông △OHM tại tâm mặt cắt H']),
 '11-09-C01':scenario('section','Thể tích lăng trụ qua nguyên lí các mặt cắt bằng đáy',['Nhận diện hai đáy song song','Xác định diện tích đáy S','Quét các lớp tiết diện bằng nhau','Kết luận V = S·h']),
 '11-09-C02':scenario('section','Thể tích hình chóp qua các thiết diện đồng dạng',['Nhận diện mặt đáy và đỉnh','Cho mặt cắt tiến lên theo chiều cao','Diện tích tiết diện giảm theo bình phương tỉ lệ','Kết luận V = (1/3)S·h']),
 '11-09-C03':scenario('section','Chóp cụt và hai đáy song song (mở rộng)',['Xác định hai diện tích đáy S₁,S₂','Di chuyển mặt cắt giữa hai đáy','Quan sát cạnh tiết diện thay đổi tuyến tính','Kết luận thể tích chóp cụt']),
 '12-03-C02':scenario('fold','Gấp hộp không nắp từ tấm bìa cắt bốn góc',['Tấm bìa hình vuông và bốn góc cắt','Gấp bốn vách cao x quanh đáy','Khép hộp không nắp','Tính V = x(L-2x)²']),
});
const SPATIAL_EXTRA_STORYBOARDS=Object.freeze({
 '11-05-C01':scenario('retain','Xác định mặt phẳng (P) qua 3 điểm không thẳng hàng A, B, C và điểm đồng phẳng M ∈ (ABC)',['Xác định 3 điểm không thẳng hàng A, B, C','Dựng hai vectơ chỉ phương AB, AC trên (P)','Di chuyển điểm M = A + α·AB + β·AC trên (P)','Dựng pháp tuyến n = AB × AC ⊥ (P)']),
 '11-05-C02':scenario('retain','Xác định giao tuyến d = (P) ∩ (Q) của hai mặt phẳng phân biệt có điểm chung',['Nhận diện hai mặt phẳng (P) và (Q) cắt nhau','Tìm hai điểm chung phân biệt trên (P) và (Q)','Điểm M(t) trượt dọc giao tuyến d = (P) ∩ (Q)','Kiểm chứng M(t) đồng thời thuộc (P) và (Q)']),
 '11-05-C03':scenario('retain','Nhận biết hai đường thẳng chéo nhau (không đồng phẳng) trong không gian 3D',['Dựng đường thẳng d₁ nằm trong mặt phẳng (P)','Dựng d₂ ở độ cao h vượt qua phía trên d₁','Điểm M(t) trượt trên d₂ cùng hình chiếu xuống (P)','Kết luận d₁ và d₂ không giao nhau và không song song']),
 '11-06-C01':scenario('retain','Hai đường thẳng song song đồng phẳng d₁ ∥ d₂ ⊂ (P) và khoảng cách không đổi',['Xác định mặt phẳng (P) chứa cả d₁ và d₂','Dựng hai đường thẳng song song d₁ ∥ d₂','Quét đoạn vuông góc chung A(t)B(t) dọc theo d₁, d₂','Kiểm chứng khoảng cách d(d₁, d₂) luôn không đổi']),
 '11-06-C02':scenario('retain','Đường thẳng song song mặt phẳng d ∥ (P) qua mặt phẳng phụ (Q) chứa d',['Dựng mặt phẳng phụ (Q) chứa d cắt (P) theo d\'','Đối chiếu d ∥ d\' với d\' ⊂ (P)','Quét đoạn khoảng cách M(t)H(t) ⊥ (P) dọc theo d','Kết luận d ∥ (P) và d(M, (P)) = const']),
 '11-06-C03':scenario('retain','Hai mặt phẳng song song (P) ∥ (Q) qua hai cặp đường thẳng cắt nhau song song',['Dựng cặp đường thẳng cắt nhau a₁, a₂ ⊂ (P)','Dựng cặp đường thẳng b₁ ∥ a₁, b₂ ∥ a₂ ⊂ (Q)','Quét đoạn pháp tuyến chung H(t)K(t) giữa (P) và (Q)','Kết luận (P) ∥ (Q) và khoảng cách giữa hai mặt không đổi']),
 '11-06-C04':scenario('retain','Phép chiếu song song tam giác △ABC lên mặt phẳng (P) theo phương chiếu l',['Xác định mặt phẳng chiếu (P) và phương chiếu l','Kẻ các tia chiếu song song phương l qua A, B, C','Tam giác △A(t)B(t)C(t) trượt dọc tia chiếu xuống (P)','Kiểm chứng bảo toàn tỉ số điểm thẳng hàng M\' trên A\'B\'']),
 '11-07-C01':scenario('retain','Góc giữa hai đường thẳng chéo nhau d₁, d₂ bằng phép tịnh tiến d₂\' ∥ d₂ cắt d₁ tại O',['Nhận diện hai đường thẳng chéo nhau d₁ và d₂','Chọn điểm O ∈ d₁ trên mặt phẳng (P)','Tịnh tiến d₂ xuống thành d₂\' ∥ d₂ đi qua O','Đo góc nhọn φ = (d₁, d₂) = ∠(d₁, d₂\') ≤ 90°']),
 '11-07-C02':scenario('retain','Điều kiện đường thẳng vuông góc mặt phẳng: d ⊥ a và d ⊥ b (a ∩ b = H ⊂ (P))',['Xác định hai đường thẳng cắt nhau a, b ⊂ (P) tại H','Dựng đường thẳng d đi qua H vuông góc với cả a và b','Quay đường thẳng bất kỳ c(t) ⊂ (P) quanh H','Kết luận d ⊥ c(t) với mọi c ⊂ (P) ⇒ d ⊥ (P)']),
 '11-07-C03':scenario('retain','Hai mặt phẳng vuông góc (P) ⊥ (Q) và góc phẳng nhị diện [P, d, Q] = 90°',['Xác định giao tuyến d = (P) ∩ (Q)','Dựng Ox ⊂ (P) và Oy ⊂ (Q) cùng vuông góc với d tại O','Mở góc nhị diện φ = ∠xOy giữa hai mặt phẳng','Kiểm chứng khi φ = 90° thì đường a ⊂ (Q), a ⊥ d sẽ vuông góc (P)']),
 '11-08-C01':scenario('retain','Góc giữa đường thẳng d và mặt phẳng (P) là góc giữa d và hình chiếu vuông góc d\'',['Xác định giao điểm B = d ∩ (P) và điểm A ∈ d','Hạ điểm chiếu vuông góc P(t) từ A xuống H ∈ (P)','Nối hình chiếu vuông góc d\' = BH trên mặt phẳng (P)','Đo góc φ = (d, (P)) = ∠ABH trong tam giác vuông △AHB']),
 '11-08-C02':scenario('retain','Góc phẳng nhị diện [P, d, Q] tạo bởi hai tia Ox ⊥ d và Oy ⊥ d',['Xác định cạnh nhị diện d = (P) ∩ (Q) và điểm O ∈ d','Kẻ tia Ox ⊂ (P), Ox ⊥ d và Oy ⊂ (Q), Oy ⊥ d','Quét cung góc phẳng nhị diện φ = ∠xOy trong mặt phẳng ⊥ d','Đọc số đo góc nhị diện [P, d, Q] = φ']),
 '11-08-C03':scenario('retain','Khoảng cách từ điểm A đến mặt phẳng (P) và định lý ba đường vuông góc',['Từ điểm A ngoài (P), hạ đoạn vuông góc P(t) rơi xuống H ∈ (P)','So sánh đường vuông góc AH với đường xiên AM (AH < AM)','Kẻ đường thẳng d ⊂ (P) vuông góc với hình chiếu HM','Kiểm chứng định lý 3 đường vuông góc: d ⊥ HM ⇔ d ⊥ AM']),
 '11-08-C04':scenario('retain','Đoạn vuông góc chung HK và khoảng cách giữa hai đường thẳng chéo nhau d₁, d₂',['Dựng hai mặt phẳng song song (P) ⊃ d₁ và (Q) ⊃ d₂','Xác định đoạn vuông góc chung HK (H ∈ d₁, K ∈ d₂)','Điểm dò P(t) trượt dọc đoạn vuông góc chung HK','Kết luận d(d₁, d₂) = HK là khoảng cách ngắn nhất']),
 '12-04-C01':scenario('retain','Tọa độ điểm M(x; y; z) và vectơ vị trí OM trong hệ trục Oxyz',['Đi dọc trục hoành Ox từ O đến (x; 0; 0)','Đi song song trục tung Oy đến hình chiếu M₁(x; y; 0) ∈ (Oxy)','Đi song song trục cao Oz từ M₁ lên điểm M(x; y; z)','Nối vectơ vị trí OM = x·i + y·j + z·k']),
 '12-04-C02':scenario('retain','Biểu diễn vectơ tự do AB = v − u theo tọa độ hai đầu mút A, B trong Oxyz',['Dựng vectơ vị trí OA = u và OB = v từ gốc O','Xác định hiệu tọa độ (x_B − x_A; y_B − y_A; z_B − z_A)','Tịnh tiến vectơ hiệu từ gốc O đến điểm đặt A','Khớp vectơ AB = OB − OA và tính độ dài |AB|']),
 '12-04-C03':scenario('retain','Tích vô hướng u·v, hình chiếu vuông góc và góc giữa hai vectơ trong Oxyz',['Dựng hai vectơ u và v chung gốc O trong không gian Oxyz','Hạ điểm chiếu vuông góc P(t) từ ngọn u xuống giá của v tại H','Quét cung góc φ = (u, v) trong mặt phẳng chứa u, v','Tính u·v = |u|·|v|·cos φ và cos(u, v)']),
 '12-04-C04':scenario('retain','Quy tắc hình bình hành tổng hai vectơ u + v trong không gian 3D Oxyz',['Dựng hai vectơ thành phần u và v xuất phát từ gốc O','Tịnh tiến bản sao vectơ v trượt dọc theo u đến ngọn của u','Khép hình bình hành 3D bởi cặp cạnh đối song song bằng nhau','Vẽ đường chéo vectơ tổng u + v từ gốc O đến đỉnh đối diện']),
 '12-07-C01':scenario('retain','Ứng dụng tích phân tính thể tích vật thể qua các lát cắt diện tích S(x) dọc trục Ox',['Chia đoạn [a, b] trên trục Ox thành các phần tử độ dày Δx','Xếp dần các đĩa trụ xấp xỉ Riemann dọc theo trục Ox','Di chuyển mặt cắt phẳng S(x) vuông góc với trục Ox','Lấy giới hạn tổng Riemann thu được V = ∫ S(x)dx']),
 '12-07-C02':scenario('retain','Thể tích khối tròn xoay rỗng (phương pháp vòng đệm Washer) V = π∫(R² − r²)dx',['Xác định bán kính ngoài R(x) và bán kính lỗ rỗng trong r(x)','Quét hình phẳng giới hạn bởi hai đường quanh trục Ox','Di chuyển thiết diện vành khăn S(x) = π(R(x)² − r(x)²) dọc Ox','Tính thể tích khối rỗng V = V_ngoài − V_lỗ']),
 '12-07-C03':scenario('retain','Quét 360° miền phẳng quanh trục Ox tạo khối tròn xoay hoàn chỉnh',['Xác định đường sinh biên y = f(x) trên mặt phẳng chứa trục Ox','Bắt đầu quay miền phẳng quanh trục Ox từ 0° đến 180°','Tiếp tục quét mặt tròn xoay từ 180° đến 360° khép kín khối','Kiểm chứng thiết diện tròn S(x) = πf(x)² tại vị trí cắt']),
 '12-08-C01':scenario('retain','Phương trình tổng quát mặt phẳng (P): Ax + By + Cz + D = 0 qua M₀ và pháp tuyến n',['Xác định điểm M₀(x₀; y₀; z₀) ∈ (P) và vectơ pháp tuyến n(A; B; C)','Dựng mặt phẳng (P) đi qua M₀ vuông góc với giá của n','Quay vectơ M₀M(t) 360° nằm trong mặt phẳng (P) quanh M₀','Kiểm chứng điều kiện vuông góc n · M₀M = 0 ⇔ Ax + By + Cz + D = 0']),
 '12-08-C02':scenario('retain','Vị trí tương đối của hai mặt phẳng (P) và (Q) trong không gian Oxyz',['Dựng hai mặt phẳng (P), (Q) cùng hai vectơ pháp tuyến n₁, n₂','Đối chiếu tỉ số tọa độ giữa hai vectơ pháp tuyến n₁ và n₂','Điểm M(t) trượt dọc giao tuyến d = (P) ∩ (Q) (hoặc đoạn khoảng cách)','Phân loại: cắt nhau theo giao tuyến, song song hoặc trùng nhau']),
 '12-08-C03':scenario('retain','Khoảng cách từ điểm M₀ đến mặt phẳng (P) bằng hình chiếu vuông góc H ∈ (P)',['Xác định điểm M₀(x₀; y₀; z₀) và mặt phẳng (P) có pháp tuyến n','Điểm P(t) rơi từ M₀ dọc theo phương pháp tuyến n xuống (P)','Xác định chân đường vuông góc H ∈ (P) và ký hiệu góc vuông','Tính khoảng cách d(M₀, (P)) = M₀H = |Ax₀+By₀+Cz₀+D|/√(A²+B²+C²)']),
 '12-08-C04':scenario('retain','Góc giữa hai mặt phẳng (P), (Q) trong Oxyz thông qua hai vectơ pháp tuyến n₁, n₂',['Xác định hai mặt phẳng (P), (Q) và giao tuyến d = (P) ∩ (Q)','Dựng hai vectơ pháp tuyến n₁ ⊥ (P) và n₂ ⊥ (Q)','Quét góc nhị diện φ = ((P), (Q)) đồng bộ với góc giữa n₁, n₂','Tính cos((P), (Q)) = |n₁·n₂| / (|n₁|·|n₂|)']),
 '12-09-C01':scenario('retain','Phương trình chính tắc của đường thẳng Δ qua M₀ và hộp tỉ số (Δx, Δy, Δz) = (u₁, u₂, u₃)',['Xác định điểm M₀(x₀; y₀; z₀) ∈ Δ và vectơ chỉ phương u(u₁; u₂; u₃)','Dựng hộp bậc thang tọa độ Δx = u₁·t, Δy = u₂·t, Δz = u₃·t từ M₀','Điểm M(x; y; z) trượt dọc đường thẳng Δ trong không gian Oxyz','Kiểm chứng tỉ số chính tắc (x−x₀)/u₁ = (y−y₀)/u₂ = (z−z₀)/u₃']),
 '12-09-C02':scenario('retain','Phương trình tham số của đường thẳng Δ: điểm động M(t) = M₀ + t·u theo tham số t',['Đặt điểm xuất phát tại M₀(x₀; y₀; z₀) ứng với t = 0','Gắn vectơ chỉ phương u(u₁; u₂; u₃) dọc theo đường thẳng Δ','Cho tham số t quét liên tục để điểm M(t) = M₀ + t·u trượt dọc Δ','Đối chiếu hình chiếu của M(t) lên mặt phẳng tọa độ (Oxy)']),
 '12-09-C03':scenario('retain','Vị trí tương đối và khoảng cách giữa hai đường thẳng d₁, d₂ trong Oxyz',['Dựng hai đường thẳng d₁, d₂ với vectơ chỉ phương u₁, u₂','Hai điểm dò P₁(t) ∈ d₁ và P₂(t) ∈ d₂ trượt về đoạn vuông góc chung HK','Kiểm tra tích hỗn tạp [u₁, u₂] · M₁M₂ và góc giữa u₁, u₂','Phân loại: chéo nhau (HK > 0), cắt nhau (HK = 0), song song hoặc trùng']),
 '12-09-C04':scenario('retain','Góc giữa đường thẳng Δ (chỉ phương u) và mặt phẳng (P) (pháp tuyến n) trong Oxyz',['Dựng đường thẳng Δ có vectơ chỉ phương u và mặt phẳng (P) có pháp tuyến n','Hạ điểm chiếu vuông góc P(t) từ A ∈ Δ xuống H ∈ (P) tạo hình chiếu Δ\'','Quét cung góc φ = (Δ, (P)) phụ với góc giữa u và pháp tuyến n','Tính sin(Δ, (P)) = |u·n| / (|u|·|n|)']),
 '12-10-C01':scenario('retain','Phương trình mặt cầu (S) tâm I(a; b; c) bán kính R và điểm động M(x; y; z) ∈ (S)',['Xác định tâm I(a; b; c) bằng đường gióng tọa độ trong Oxyz','Dựng 3 đường tròn lớn vuông góc nhau qua tâm I bán kính R','Quay bán kính vectơ IM(t) quét quanh mặt cầu (S) giữ nguyên |IM| = R','Kiểm chứng phương trình (x − a)² + (y − b)² + (z − c)² = R²']),
 '12-10-C02':scenario('retain','Mặt phẳng (P) cắt mặt cầu (S) theo đường tròn giao tuyến bán kính r = √(R² − d²)',['Hạ đoạn vuông góc IH = d từ tâm mặt cầu I xuống mặt phẳng cắt (P)','So sánh khoảng cách d = IH với bán kính mặt cầu R','Điểm M(t) quay tròn quanh tâm H trên đường tròn giao tuyến','Kiểm chứng tam giác vuông △IHM: r = HM = √(R² − d²)']),
 '12-10-C03':scenario('retain','Vị trí tương đối của đường thẳng Δ và mặt cầu (S) qua khoảng cách IH = d',['Hạ đoạn vuông góc IH = d từ tâm I của mặt cầu xuống đường thẳng Δ','Điểm dò P(t) trượt dọc theo đường thẳng Δ xuyên qua không gian 3D','Theo dõi khoảng cách IP(t) đạt cực tiểu bằng IH = d tại H','Đối chiếu d < R (cắt tại A, B), d = R (tiếp xúc tại H), d > R (không giao)']),
});
export function spatialStoryboard(id,type=''){
 return SPATIAL_STORYBOARDS[id]||SPATIAL_EXTRA_STORYBOARDS[id]||scenario(
  type==='sphere'?'sphere':'retain',
  'Quan sát quan hệ hình học và số đo thay đổi đúng điều kiện bài học',
  ['Xác định dữ kiện','Dựng đối tượng','Biến đổi các yếu tố hình học','Kiểm tra kết luận']);
}
export function spatialSceneDescription(id,type='',time=0,duration=6){
 const lesson=spatialStoryboard(id,type),progress=Math.max(0,Math.min(1,(Number(time)||0)/(duration||6)));
 const step=Math.min(3,Math.floor(progress*4));
 return {id,goal:lesson.goal,action:lesson.action,steps:lesson.steps,step,stepText:lesson.steps[step],progress};
}
/** Render the goal OUTSIDE the 3D stage so labels never occlude faces. */
export function mountSpatialLessonGuide(host,id,type=''){
 if(!host||typeof document==='undefined')return null;
 const view=document.createElement('section');view.className='mv-r92-spatial-guide';
 view.setAttribute('aria-live','off');view.style.cssText='margin:8px 0 12px;padding:10px 14px;border:1px solid #b8dbe7;border-radius:12px;background:#effaff;color:#123149;font:600 13px/1.5 system-ui,sans-serif;';
 const title=document.createElement('strong');title.style.cssText='display:block;color:#1D4ED8;font-size:14px;margin-bottom:4px';
 const state=document.createElement('div');state.style.cssText='color:#6D28D9;font-size:13px;margin:4px 0 8px;font-weight:750;';
 const steps=document.createElement('div');steps.style.cssText='display:flex;gap:8px;flex-wrap:wrap;';
 view.append(title,state,steps);host.append(view);
 return {view,title,state,steps,id,type};
}
export function updateSpatialLessonGuide(guide,id,type='',seconds=0,duration=6,activePhase=''){
 if(!guide)return null;
 const frame=spatialSceneDescription(id,type,seconds,duration);
 guide.title.textContent=`MỤC TIÊU: ${frame.goal}`;
 if(guide.state)guide.state.textContent=`ĐANG MINH HỌA: ${activePhase||frame.stepText} (${Math.round(frame.progress*100)}%)`;
 guide.steps.replaceChildren();
 for(let i=0;i<frame.steps.length;i++){
  const node=document.createElement('span');node.textContent=`${i+1}. ${frame.steps[i]}`;
  node.style.cssText=`border-radius:7px;padding:3px 6px;${i===frame.step?'background:#ede9fe;color:#6D28D9;border:1px solid #6D28D9;':'background:#fff;color:#475569;border:1px solid #cbd5e1;'}`;
  guide.steps.append(node);
 }
 return frame;
}

const clamp01=x=>Math.min(1,Math.max(0,Number.isFinite(Number(x))?Number(x):0));
const ease=x=>{const p=clamp01(x);return p*p*(3-2*p);};
export const spatialStage=(seconds,duration=6)=>clamp01(Number(seconds)/(duration>0?duration:6));

/** Whole pedagogical sequence is calculated from time, not accumulated state.
 * This guarantees scrubbing, reset and deterministic replay.
 * `unfold` is 0 for closed 3D, 1 for flat 2D net.
 * Only dedicated net-unfolding lessons (`netLesson === true` or `NET_UNFOLD_MODE_IDS.has(id)`)
 * fold/unfold in 3D; non-net lessons keep `unfold = 0` and sweep their cross-section.
 */
export function spatialMotionFrame({id='',type='',seconds=0,duration=6,supportsUnfold=false,supportsCrossSection=false,netLesson=false,deep=false}={}){
 const p=spatialStage(seconds,duration);
 const namedNet=Boolean(netLesson)||NET_UNFOLD_MODE_IDS.has(id);
 const hasFold=namedNet&&supportsUnfold&&FOLDABLE_TYPES.has(type);
 const isSphere=type==='sphere'||type==='sphereSection';
 if(deep){
  const lesson=spatialStoryboard(id,type);
  const act=netLesson?'fold':lesson.action;
  const stepPhase=lesson.steps[Math.min(3,Math.floor(p*4))]||lesson.goal;
  if(act==='fold'&&supportsUnfold&&FOLDABLE_TYPES.has(type)){
   let unfold,phase;
   if(id==='12-03-C02'||type==='openTopBox'){
    unfold=1-ease(p/.8);phase=p<.8?'Gấp bốn vách thành hộp':'Giữ hộp và kiểm chứng thể tích';
   }else if(p<.28){unfold=1-ease(p/.28);phase='Gấp các mặt theo bản lề của bản triển khai';}
   else if(p<.47){unfold=0;phase='Quan sát khối đã khép và đối chiếu các cạnh';}
   else{unfold=ease((p-.47)/.53);phase='Trải khối thành hình khai triển';}
   return {kind:'fold',p,phase,unfold:clamp01(unfold),constructScale:1,section:false,sectionPct:50,lesson};
  }
  if(act==='assemble'){
   const s=id==='7-08-C02'?(0.45+0.55*ease(p)):(0.35+0.65*ease(p));
   return {kind:'assemble',p,phase:stepPhase,unfold:0,constructScale:s,uniformScale:id==='7-08-C02',section:false,sectionPct:50,lesson};
  }
  if(act==='altitude'){
   const s=0.45+0.55*ease(Math.min(1,p/.55));
   return {kind:'altitude',p,phase:stepPhase,unfold:0,constructScale:s,uniformScale:false,section:false,sectionPct:50,lesson};
  }
  if(act==='section'&&supportsCrossSection){
   // Unlike folding, the solid remains intact and a mathematically exact
   // plane slices through. Geometry is regenerated at the requested height.
   return {kind:'section',p,phase:stepPhase,section:p>=.14,sectionPct:8+84*ease((p-.14)/.72),unfold:0,constructScale:1,lesson};
  }
  if(act==='sphere_scale'){
   return {kind:'sphere',p,phase:stepPhase,sweep:1,unfold:0,constructScale:0.55+0.45*ease(p),uniformScale:true,lesson};
  }
  if(act==='sphere_section'||(type==='sphereSection'&&act==='section')){
   return {kind:'sphere',p,phase:stepPhase,sweep:1,unfold:0,constructScale:1,lesson};
  }
  if(isSphere||act==='sphere')return {kind:'sphere',p,phase:stepPhase,sweep:clamp01(ease(p)),unfold:0,constructScale:1,lesson};
  return {kind:'retain',p,phase:stepPhase,unfold:0,constructScale:1,lesson};
 }
 // Compatibility path: preserve the preexisting R91 contract and tests.
 if(hasFold){
  let unfold,phase;
  if(id==='12-03-C02'||type==='openTopBox'){
   unfold=1-ease(p/.82);
   phase=p<.82?'Gấp 4 thành hộp từ tấm bìa đã cắt góc':'Giữ hộp không nắp 3D và kiểm tra thể tích';
  }else if(p<.27){unfold=1-ease(p/.27);phase='Dựng các mặt theo bản lề';}
  else if(p<.45){unfold=0;phase='Kiểm tra khối và mặt tương ứng';}
  else{unfold=ease((p-.45)/.55);phase='Trải phẳng theo nếp gấp';}
  return {kind:'fold',p,phase,unfold:clamp01(unfold),section:false,sectionPct:50};
 }
 if(isSphere)return {kind:'sphere',p,phase:'Quét tạo mặt cầu theo vĩ tuyến',sweep:clamp01(ease(p))};
 if(supportsCrossSection)return {kind:'section',p,phase:'Cho mặt cắt song song đáy đi qua khối',section:p>.01,sectionPct:15+70*ease(p)};
 return {kind:'retain',p,phase:'Giữ chuyển động toán học riêng của mô hình'};
}

/** Applies to the in-place Solid3DViewer (already mounted). */
export function applySpatialMotion(viewer,{id,type,seconds,duration=6,netLesson=false,deep=false}={}){
 if(!viewer)return {kind:'unavailable',p:0};
 const mesh=viewer.meshGroup;
 const frame=spatialMotionFrame({id,type,seconds,duration,netLesson,deep,
  supportsUnfold:!!mesh?.supportsUnfold,supportsCrossSection:!!mesh?.supportsCrossSection});
 // Always preserve the uniform normalization scale from createMathModel so solids and 3D sprite labels are NEVER squished
 if(mesh?.scale?.setScalar){
  const baseScale=Number.isFinite(mesh.userData?.baseScale)?mesh.userData.baseScale:(mesh.scale.x||1);
  mesh.scale.setScalar(baseScale);
  mesh.updateMatrixWorld?.(true);
 }
 if(frame.kind==='fold'){
  mesh?.setBuildProgress?.(null);
  viewer.setCrossSection?.(!!frame.section,frame.sectionPct);
  viewer.setUnfold?.(true,frame.unfold);
  viewer.setSphereSweepProgress?.(1);
 }else if(frame.kind==='assemble'||frame.kind==='altitude'){
  viewer.setUnfold?.(false,0);
  viewer.setCrossSection?.(!!frame.section,frame.sectionPct||50);
  viewer.setSphereSweepProgress?.(1);
  mesh?.setBuildProgress?.(frame.p);
  if(viewer.handleGroup){
   viewer.handleGroup.visible=viewer.showHandles&&viewer.toolMode==='edit'&&frame.p>=0.95;
  }
 }else if(frame.kind==='section'){
  mesh?.setBuildProgress?.(null);
  viewer.setUnfold?.(false,0);
  viewer.setCrossSection?.(frame.section,frame.sectionPct);
  viewer.setSphereSweepProgress?.(1);
 }else if(frame.kind==='sphere'){
  mesh?.setBuildProgress?.(null);
  viewer.setUnfold?.(false,0);
  viewer.setCrossSection?.(false,50);
  viewer.setSphereSweepProgress?.(frame.sweep??1);
 }else{
  mesh?.setBuildProgress?.(null);
  viewer.setUnfold?.(false,0);
  viewer.setSphereSweepProgress?.(1);
 }
 if(viewer.renderer&&viewer.scene&&viewer.camera){
  try{viewer.renderer.render(viewer.scene,viewer.camera);}catch{}
 }
 return frame;
}
