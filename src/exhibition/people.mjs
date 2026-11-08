/**
 * Historical portraits: Commons pages reviewed 2026-10-31.
 * Portraits of antique or medieval mathematicians are later artistic representations.
 * This collection never claims an artist's portrait is an authentic likeness.
 * Equations connect the displayed achievement to relevant SGK topics; attribution is nuanced.
 */
export const PEOPLE = Object.freeze([
  {
    id:'pythagoras', name:'Pythagoras', vietnamese:'Py-ta-go', period:'khoảng 570–495 TCN', group:'HÌNH HỌC CỔ ĐẠI', grade:'Toán 8', modeId:'8-05-C01',
    contribution:'Định lý mang tên Pythagoras', work:'Quan hệ ba cạnh của tam giác vuông',
    summary:'Trong tam giác vuông, tổng bình phương hai cạnh góc vuông bằng bình phương cạnh huyền. Quan hệ này đã được biết đến ở một số nền văn minh trước thời Pythagoras.',
    demo:'Dựng ba hình vuông trên ba cạnh tam giác vuông; kéo cạnh góc vuông và quan sát diện tích tương ứng.',
    formula:'a^2+b^2=c^2', gradeNote:'Kiến thức cốt lõi: Toán 8.',
    portraitNote:'Tượng bán thân mang tên Pythagoras; không phải chân dung xác thực thời cổ.',
    commons:'https://commons.wikimedia.org/wiki/File:Pythagoras_Bust_Vatican_Museum.jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/c/c1/Pythagoras_Bust_Vatican_Museum.jpg',
    mediaLicense:'Public domain (tác giả ảnh Andargor tự công bố)',
    asset:'pythagoras.jpg', accent:'#e7b95d', kind:'pythagoras'
  },
  {
    id:'euclid', name:'Euclid', vietnamese:'Ơ-clit', period:'khoảng thế kỷ III TCN', group:'HÌNH HỌC CỔ ĐẠI', grade:'Toán 6–9', modeId:'7-02-C05',
    contribution:'Bộ sách Cơ sở (Elements)', work:'Tiên đề và chứng minh hình học',
    summary:'Euclid hệ thống hóa các định nghĩa, tiên đề và chứng minh hình học trong tác phẩm Elements, nền tảng của hình học Euclid.',
    demo:'Kéo một cát tuyến qua hai đường song song; xem các cặp góc so le trong và đồng vị.',
    formula:'a\\parallel b\\;\\Longrightarrow\\;\\widehat{A_1}=\\widehat{B_1}', gradeNote:'Gắn với nội dung đường thẳng song song Toán 7.',
    portraitNote:'Nhân vật trong Trường học Athens của Raphael; danh tính người được vẽ còn tranh luận (Euclid hoặc Archimedes).',
    commons:'https://commons.wikimedia.org/wiki/File:Euclid.jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/2/21/Euclid.jpg',
    mediaLicense:'Public domain (tranh Raphael, nhân vật không xác định chắc chắn)',
    asset:'euclid.jpg', accent:'#77aaf4', kind:'parallel'
  },
  {
    id:'archimedes', name:'Archimedes', vietnamese:'Ác-si-mét', period:'khoảng 287–212 TCN', group:'HÌNH HỌC CỔ ĐẠI', grade:'Toán 9–12', modeId:'9-11-C02',
    contribution:'Về hình cầu và hình trụ', work:'Quan hệ thể tích khối cầu và hình trụ ngoại tiếp',
    summary:'Archimedes chứng minh thể tích khối cầu bằng hai phần ba thể tích hình trụ ngoại tiếp có cùng bán kính r và chiều cao 2r.',
    demo:'Thay bán kính r, quan sát mô hình cầu nằm gọn trong trụ và so sánh các thể tích.',
    formula:'V_{\\text{cầu}}=\\frac{4}{3}\\pi r^3=\\frac{2}{3}V_{\\text{trụ}}', gradeNote:'Khối cầu Toán 9, mở rộng sang Toán 12.',
    portraitNote:'Tranh thế kỷ XVII về một học giả thường được gắn với Archimedes; không phải chân dung đương thời.',
    commons:'https://commons.wikimedia.org/wiki/File:Domenico-Fetti_Archimedes_1620.jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/e/e7/Domenico-Fetti_Archimedes_1620.jpg',
    mediaLicense:'Public domain (tranh cổ, tái hiện nhân vật)',
    asset:'archimedes.jpg', accent:'#c9a3ff', kind:'sphere'
  },
  {
    id:'fibonacci', name:'Fibonacci', vietnamese:'Phi-bô-na-xi', period:'khoảng 1170–1250', group:'DÃY SỐ & QUY LUẬT', grade:'Toán 11', modeId:'11-03-C01',
    contribution:'Liber Abaci và bài toán thỏ', work:'Dãy Fibonacci',
    summary:'Bài toán sinh sản của thỏ trong Liber Abaci góp phần phổ biến dãy số hiện nay được gọi là Fibonacci tại châu Âu. Dãy có lịch sử sớm hơn ở các nền toán học khác.',
    demo:'Bấm bước n để tạo các số tiếp theo, quan sát tổng hai số liên tiếp và mô hình các ô vuông.',
    formula:'F_{n+2}=F_{n+1}+F_n', gradeNote:'Liên hệ dãy số và quy luật Toán 11.',
    portraitNote:'Chân dung tưởng tượng được vẽ nhiều thế kỷ sau khi Fibonacci qua đời.',
    commons:'https://commons.wikimedia.org/wiki/File:Fibonacci.jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/a/a2/Fibonacci.jpg',
    mediaLicense:'Public domain (minh họa lịch sử khoảng năm 1850)',
    asset:'fibonacci.jpg', accent:'#70d6b1', kind:'fibonacci'
  },
  {
    id:'descartes', name:'René Descartes', vietnamese:'Đề-các', period:'1596–1650', group:'ĐẠI SỐ & TỌA ĐỘ', grade:'Toán 10', modeId:'10-05-C01',
    contribution:'Hình học giải tích', work:'Biểu diễn điểm và hình bằng tọa độ',
    summary:'Descartes là một trong những người xây dựng hình học giải tích, kết nối đại số với các quan hệ hình học qua hệ tọa độ.',
    demo:'Kéo điểm M trên mặt phẳng Oxy và xem cặp tọa độ (x;y) thay đổi.',
    formula:'M(x;y)', gradeNote:'Tọa độ điểm và vectơ trong Oxy, Toán 10.',
    portraitNote:'Chân dung lịch sử từ tác phẩm gắn với Frans Hals.',
    commons:'https://commons.wikimedia.org/wiki/File:Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/7/73/Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg',
    mediaLicense:'Public domain (tranh cổ)',
    asset:'descartes.jpg', accent:'#54cee5', kind:'coordinate'
  },
  {
    id:'fermat', name:'Pierre de Fermat', vietnamese:'Phéc-ma', period:'1607/1608–1665', group:'ĐẠI SỐ & XÁC SUẤT', grade:'Toán 10–12', modeId:'10-11-C03',
    contribution:'Khởi đầu lý thuyết xác suất cùng Pascal', work:'Các bài toán chia tiền cược và đếm khả năng',
    summary:'Thư từ giữa Fermat và Pascal vào giữa thế kỷ XVII có vai trò quan trọng đối với sự hình thành lý thuyết xác suất hiện đại.',
    demo:'Đếm số kết quả đồng khả năng khi tung đồng xu hoặc xúc xắc; so sánh xác suất sự kiện.',
    formula:'P(A)=\\frac{n(A)}{n(\\Omega)}', gradeNote:'Xác suất cổ điển Toán 10 và liên hệ Toán 12.',
    portraitNote:'Bản khắc chân dung cổ, không phải ảnh chụp.',
    commons:'https://commons.wikimedia.org/wiki/File:Pierre_de_Fermat_(F._Poilly).jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/b/bd/Pierre_de_Fermat_%28F._Poilly%29.jpg',
    mediaLicense:'Public domain (khắc họa cổ của François de Poilly)',
    asset:'fermat.jpg', accent:'#f4ae77', kind:'probability'
  },
  {
    id:'pascal', name:'Blaise Pascal', vietnamese:'Pa-xcan', period:'1623–1662', group:'ĐẠI SỐ & XÁC SUẤT', grade:'Toán 10', modeId:'10-11-C04',
    contribution:'Tam giác số học Pascal', work:'Hệ số nhị thức và quy luật cộng',
    summary:'Tam giác số học Pascal thể hiện quy luật mỗi số bên trong bằng tổng hai số ở hàng trên; cấu trúc này đã được nhiều nền toán học nghiên cứu trước Pascal.',
    demo:'Chọn hàng thứ n, quan sát hệ số của khai triển nhị thức và quy luật cộng.',
    formula:'\\binom{n}{k}=\\binom{n-1}{k-1}+\\binom{n-1}{k}', gradeNote:'Nhị thức Newton và tổ hợp Toán 10.',
    portraitNote:'Chân dung khuyết danh thế kỷ XVII.',
    commons:'https://commons.wikimedia.org/wiki/File:Blaise_Pascal_2.jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/c/c1/Blaise_Pascal_2.jpg',
    mediaLicense:'Public domain (tranh cổ)',
    asset:'pascal.jpg', accent:'#ffc877', kind:'pascal'
  },
  {
    id:'newton', name:'Isaac Newton', vietnamese:'Niu-tơn', period:'1642–1727', group:'GIẢI TÍCH', grade:'Toán 11–12', modeId:'11-12-C03',
    contribution:'Phát triển giải tích và chuyển động', work:'Đạo hàm và vận tốc tức thời',
    summary:'Newton và Leibniz phát triển các hướng tiếp cận giải tích một cách độc lập. Đạo hàm giúp mô tả tốc độ thay đổi của đại lượng.',
    demo:'Cho điểm chạy theo đồ thị quãng đường theo thời gian; tiếp tuyến biểu diễn vận tốc tức thời.',
    formula:'v(t)=s\\prime(t)', gradeNote:'Đạo hàm Toán 11 và ứng dụng Toán 12.',
    portraitNote:'Chân dung do Godfrey Kneller vẽ năm 1689.',
    commons:'https://commons.wikimedia.org/wiki/File:GodfreyKneller-IsaacNewton-1689.jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/3/39/GodfreyKneller-IsaacNewton-1689.jpg',
    mediaLicense:'Public domain (Godfrey Kneller, 1689)',
    asset:'newton.jpg', accent:'#bda5ff', kind:'derivative'
  },
  {
    id:'leibniz', name:'G. W. Leibniz', vietnamese:'Lai-bơ-nít', period:'1646–1716', group:'GIẢI TÍCH', grade:'Toán 12', modeId:'12-06-C02',
    contribution:'Ký hiệu và phương pháp tích phân', work:'Diện tích dưới đồ thị và tính tổng liên tục',
    summary:'Leibniz phát triển độc lập phép tính vi–tích phân và những ký hiệu có ảnh hưởng lớn đến cách trình bày giải tích ngày nay.',
    demo:'Chia miền diện tích dưới đồ thị thành các dải nhỏ rồi tăng số dải để hình dung tích phân.',
    formula:'\\int_a^b f(x)\\,dx', gradeNote:'Nguyên hàm – tích phân Toán 12.',
    portraitNote:'Tranh chân dung thế kỷ XVII/XVIII, bản sao của họa sĩ đi sau.',
    commons:'https://commons.wikimedia.org/wiki/File:Gottfried_Wilhelm_Leibniz_(1).jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/2/2f/Gottfried_Wilhelm_Leibniz_%281%29.jpg',
    mediaLicense:'Public domain (tranh cổ)',
    asset:'leibniz.jpg', accent:'#8dd9f1', kind:'integral'
  },
  {
    id:'euler', name:'Leonhard Euler', vietnamese:'Ơ-le', period:'1707–1783', group:'HÌNH HỌC & ĐỒ THỊ', grade:'Toán 8–12 mở rộng', modeId:'8-09-C01',
    contribution:'Công thức Euler cho đa diện lồi', work:'Đếm đỉnh, cạnh và mặt của khối đa diện',
    summary:'Với đa diện lồi, số đỉnh V trừ số cạnh E cộng số mặt F bằng 2. Đây là hoạt động khám phá mở rộng, không nên trình bày như một định lý bắt buộc của SGK.',
    demo:'Xoay một khối lập phương, bật các nhãn đỉnh/cạnh/mặt rồi kiểm tra tổng V−E+F.',
    formula:'V-E+F=2', gradeNote:'Hoạt động mở rộng từ hình đa diện Toán 8–12.',
    portraitNote:'Chân dung pastel do Jakob Emanuel Handmann thực hiện năm 1753.',
    commons:'https://commons.wikimedia.org/wiki/File:Leonhard_Euler.jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/d/d7/Leonhard_Euler.jpg',
    mediaLicense:'Public domain (Jakob Emanuel Handmann, 1753)',
    asset:'euler.jpg', accent:'#9dea9b', kind:'polyhedron'
  },
  {
    id:'gauss', name:'Carl F. Gauss', vietnamese:'Gao-xơ', period:'1777–1855', group:'DÃY SỐ & SỐ HỌC', grade:'Toán 6, 11', modeId:'11-03-C02',
    contribution:'Lý thuyết số và các phương pháp tính toán', work:'Tính tổng cấp số cộng',
    summary:'Gauss có những đóng góp sâu rộng cho số học và nhiều lĩnh vực khác. Cách ghép cặp để tính tổng 1+2+...+n thường được kể trong giai thoại về thời thơ ấu của ông; xem đây là hoạt động minh họa, không khẳng định chi tiết giai thoại là tư liệu đã xác chứng.',
    demo:'Ghép hai dãy số xuôi – ngược, mỗi cặp có tổng n+1, tạo công thức cấp số cộng.',
    formula:'1+2+\\cdots+n=\\frac{n(n+1)}{2}', gradeNote:'Cấp số cộng Toán 11; mở rộng số học Toán 6.',
    portraitNote:'Chân dung lịch sử thế kỷ XIX.',
    commons:'https://commons.wikimedia.org/wiki/File:Carl_Friedrich_Gauss.jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/9/9b/Carl_Friedrich_Gauss.jpg',
    mediaLicense:'Public domain (tranh thế kỷ XIX)',
    asset:'gauss.jpg', accent:'#7cceff', kind:'progression'
  },
  {
    id:'luong-the-vinh', name:'Lương Thế Vinh', vietnamese:'Trạng Lường', displayName:'Lương Thế Vinh', displaySubtitle:'TRẠNG LƯỜNG · ĐẠI THÀNH TOÁN PHÁP',
    period:'1441–1496', group:'DANH NHÂN TOÁN HỌC VIỆT NAM', grade:'Toán 8 – vận dụng', modeId:'8-06-C03',
    contribution:'Đại thành toán pháp', work:'Toán đo lường, số học và thực hành',
    summary:'Lương Thế Vinh đỗ Trạng nguyên năm 1463 dưới triều Lê Thánh Tông. Tác phẩm Đại thành toán pháp được gắn với những kiến thức về phép tính, đo lường và ứng dụng toán học trong đời sống.',
    demo:'Khám phá cách đo chiều cao qua bóng nắng bằng hai tam giác đồng dạng. Đây là mô hình sư phạm hiện đại gợi từ chủ đề đo bóng, không phải bản phục dựng nguyên văn một trang sách cổ.',
    formula:'\\frac{H}{h}=\\frac{L}{\\ell}\\quad\\Rightarrow\\quad H=\\frac{hL}{\\ell}',
    gradeNote:'Liên hệ tam giác đồng dạng và bài toán thực tế Toán 8.',
    portraitNote:'Tranh minh họa tạo bằng AI theo bối cảnh thời Lê; không phải chân dung xác thực của Lương Thế Vinh.',
    commons:'https://commons.wikimedia.org/wiki/File:Luong_The_Vinh.jpg',
    imageUrl:'/src/exhibition/assets/luong-the-vinh.jpg',
    mediaLicense:'Ảnh AI phục vụ minh họa giáo dục; nguồn tư liệu ảnh cổ khác tại Wikimedia Commons (Public Domain).',
    imageIsGenerated:true, asset:'luong-the-vinh.jpg', accent:'#e7b16c', kind:'shadow-measure'
  },
  {
    id:'ngo-bao-chau', name:'Ngô Bảo Châu', vietnamese:'Ngô Bảo Châu', displayName:'Ngô Bảo Châu', displaySubtitle:'HUY CHƯƠNG FIELDS 2010',
    period:'sinh năm 1972', group:'DANH NHÂN TOÁN HỌC VIỆT NAM', grade:'Toán 10 – mở rộng tư duy', modeId:'10-05-C01',
    contribution:'Chứng minh Bổ đề cơ bản · Fields 2010', work:'Hình học đại số và lý thuyết dạng tự đẳng cấu',
    summary:'Ngô Bảo Châu nhận Huy chương Fields năm 2010 nhờ công trình chứng minh Bổ đề cơ bản trong lý thuyết dạng tự đẳng cấu bằng phương pháp hình học đại số.',
    demo:'Sơ đồ minh họa các bước giả thiết – lập luận – kết luận và liên hệ cách biểu diễn điểm bằng tọa độ. Hoạt động này KHÔNG tái hiện chứng minh Bổ đề cơ bản, vốn nằm ngoài chương trình phổ thông.',
    formula:'P\\Longrightarrow Q\\quad\\text{(minh họa tư duy chứng minh)}',
    gradeNote:'Liên hệ phương pháp lập luận và hình học tọa độ Toán 10; không xem Bổ đề cơ bản là kiến thức SGK.',
    portraitNote:'Tranh minh họa tạo bằng AI, không phải ảnh chụp hoặc chân dung được xác nhận của Giáo sư Ngô Bảo Châu.',
    commons:'https://commons.wikimedia.org/wiki/File:Ng%C3%B4_B%E1%BA%A3o_Ch%C3%A2u.JPG',
    imageUrl:'/src/exhibition/assets/ngo-bao-chau.jpg',
    mediaLicense:'Ảnh AI phục vụ minh họa giáo dục; ảnh chụp tư liệu thay thế tại Wikimedia Commons (CC BY-SA 4.0, tác giả Nguyentrongphu).',
    imageIsGenerated:true, asset:'ngo-bao-chau.jpg', accent:'#74cde6', kind:'proof-flow'
  },
  {
    id:'al-khwarizmi', name:'Al-Khwarizmi', vietnamese:'An-Khô-va-ri-dơ-mi', period:'khoảng 780–850', group:'LỊCH SỬ ĐẠI SỐ', grade:'Toán 8–9', modeId:'9-02-C01',
    contribution:'Tác phẩm về đại số al-jabr và hệ thống tính toán', work:'Nền tảng của đại số sơ khai',
    summary:'Học giả thời trung đại có đóng góp quan trọng trong hệ thống hóa các phương pháp giải phương trình. Từ algebra có nguồn gốc từ al-jabr; thuật ngữ algorithm gắn với tên được Latin hóa của ông.',
    demo:'Kéo các khối trên mô hình cân hai đĩa để giải một phương trình bậc nhất; quan sát phép biến đổi giữ nguyên hai vế.',
    formula:'ax+b=c\\quad(a\\ne0)', gradeNote:'Liên hệ phương trình bậc nhất và các phép biến đổi tương đương trong Toán 8–9.',
    portraitNote:'Chân dung nếu có chỉ là hình tượng phục dựng, không phải ảnh đương thời.',
    commons:'https://commons.wikimedia.org/wiki/File:Al-Khwarizmi_portrait.jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/2/22/Al-Khwarizmi_portrait.jpg',
    mediaLicense:'Public domain (hình tượng phục dựng lịch sử)',
    asset:'al-khwarizmi.jpg', accent:'#e5a855', kind:'balance-equation'
  },
  {
    id:'sophie-germain', name:'Sophie Germain', vietnamese:'Xô-phi Giéc-manh', period:'1776–1831', group:'SỐ NGUYÊN TỐ', grade:'Toán 6 và mở rộng', modeId:'mv15-nguyen-to-bang100',
    contribution:'Đóng góp cho lý thuyết số và bài toán dao động', work:'Số nguyên tố Sophie Germain',
    summary:'Nhà toán học Pháp nổi bật với những nghiên cứu về lý thuyết số, đặc biệt các số nguyên tố, và lý thuyết đàn hồi.',
    demo:'Nhập số nguyên tố p; kiểm tra 2p+1 có là số nguyên tố không. Ví dụ p=2 cho 2p+1=5.',
    formula:'p\\in\\mathbb{P},\\quad 2p+1\\in\\mathbb{P}', gradeNote:'Số nguyên tố Toán 6; bổ sung khái niệm số nguyên tố Sophie Germain như kiến thức mở rộng.',
    portraitNote:'Dùng ảnh/tranh lịch sử có ghi nguồn và giấy phép riêng; không có ảnh đương thời.',
    commons:'https://commons.wikimedia.org/wiki/File:Sophie_Germain.jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/0/05/Sophie_Germain.jpg',
    mediaLicense:'Public domain (khắc họa lịch sử thế kỷ XIX)',
    asset:'sophie-germain.jpg', accent:'#ec7ba4', kind:'germain-prime'
  },
  {
    id:'ada-lovelace', name:'Ada Lovelace', vietnamese:'A-đa Lớp-lây-xơ', period:'1815–1852', group:'THUẬT TOÁN & TOÁN HỌC', grade:'Toán 6–9 (tư duy thuật toán)', modeId:'11-10-C01',
    contribution:'Những ghi chú tiên phong về khả năng lập trình máy tính cơ học', work:'Thuật toán, vòng lặp và quy luật tính toán',
    summary:'Nhà toán học người Anh, viết các ghi chú năm 1843 về Máy phân tích của Charles Babbage, bao gồm cách tính số Bernoulli. Không nên tuyệt đối hóa danh xưng “người đầu tiên lập trình” vì lịch sử có nhiều tranh luận.',
    demo:'Sắp xếp các thẻ lệnh đầu vào → vòng lặp → phép tính → kết quả, để tính tổng 1+2+…+n.',
    formula:'S_n=\\sum_{k=1}^{n}k', gradeNote:'Quy luật dãy số và sơ đồ thuật toán; ứng dụng liên môn Toán – Tin học.',
    portraitNote:'Chân dung vẽ năm 1836 bởi Margaret Sarah Carpenter.',
    commons:'https://commons.wikimedia.org/wiki/File:Ada_Lovelace_portrait.jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/a/a4/Ada_Lovelace_portrait.jpg',
    mediaLicense:'Public domain (tranh sơn dầu Margaret Sarah Carpenter, 1836)',
    asset:'ada-lovelace.jpg', accent:'#a78bfa', kind:'algorithm-flow'
  },
  {
    id:'emmy-noether', name:'Emmy Noether', vietnamese:'Em-mi Nơ-thơ', period:'1882–1935', group:'CẤU TRÚC & ĐỐI XỨNG', grade:'Toán 6–10 (liên hệ)', modeId:'10-06-C03',
    contribution:'Đại số hiện đại và liên hệ giữa đối xứng với định luật bảo toàn', work:'Quan sát tính bất biến qua phép biến hình',
    summary:'Nhà toán học Đức có đóng góp nền tảng cho đại số trừu tượng và một định lý quan trọng liên hệ đối xứng liên tục với các định luật bảo toàn trong vật lý.',
    demo:'Kéo trục đối xứng qua các hình phẳng, thử phép biến hình nào giữ nguyên hình; phân biệt hoạt động này với định lý Noether chuyên sâu.',
    formula:'f(-x)=f(x)', gradeNote:'Hình đối xứng Toán 6–8; ví dụ hàm chẵn Toán 10 (mô hình sư phạm, không phải định lý Noether).',
    portraitNote:'Ảnh tư liệu lịch sử trước năm 1930.',
    commons:'https://commons.wikimedia.org/wiki/File:Emmy_Noether.jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/e/e5/Emmy_Noether.jpg',
    mediaLicense:'Public domain (ảnh tư liệu chụp trước 1930)',
    asset:'emmy-noether.jpg', accent:'#38bdf8', kind:'symmetry-invariant'
  },
  {
    id:'maryam-mirzakhani', name:'Maryam Mirzakhani', vietnamese:'Ma-ri-am Mia-da-kha-ni', period:'1977–2017', group:'HÌNH HỌC HIỆN ĐẠI', grade:'Toán 9–12 mở rộng', modeId:'9-11-C01',
    contribution:'Huy chương Fields 2014 nhờ nghiên cứu hình học và động lực học các mặt Riemann', work:'Đường trên mặt cong và tư duy hình học',
    summary:'Nhà toán học Iran, là người phụ nữ đầu tiên nhận Huy chương Fields năm 2014, với đóng góp chuyên sâu trong hình học và động lực học mặt Riemann.',
    demo:'Chọn hai điểm trên mặt cầu, thử so sánh đường đi bám mặt cầu với đường thẳng xuyên qua khối cầu; chỉ minh họa khái niệm đường trên mặt cong.',
    formula:'s=R\\theta\\quad(\\theta\\text{ tính bằng radian})', gradeNote:'Độ dài cung tròn trong hình học phổ thông (mô hình sư phạm, không phải công thức nghiên cứu của Mirzakhani).',
    portraitNote:'Người đương đại; sử dụng thẻ ảnh minh họa hình học hoặc tư liệu có giấy phép xác minh; tuyệt đối không tạo ảnh AI mạo danh.',
    commons:'https://commons.wikimedia.org/wiki/File:Maryam_Mirzakhani.jpg',
    imageUrl:'https://upload.wikimedia.org/wikipedia/commons/c/c0/Maryam_Mirzakhani.jpg',
    mediaLicense:'Tư liệu tưởng niệm / Thẻ minh họa hình học (tuân thủ bản quyền nhân vật đương đại)',
    asset:'maryam-mirzakhani.jpg', accent:'#34d399', kind:'curved-surface'
  }
]);
export const PEOPLE_BY_ID=new Map(PEOPLE.map(p=>[p.id,p]));
