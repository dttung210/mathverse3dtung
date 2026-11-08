/** Phase 4: supplemental, independently generated classroom experiments.
 * NEVER merged into the immutable 63 catalog models or 35 curated Math 6 exhibits.
 * These are explorations, not extracted illustrations from textbooks.
 */
const m=(grade,zone,type,title,params={},formula='',data=null)=>({grade,zone,type,title,params,formula,data});
export const EXPLORATION_MODELS=Object.freeze([
  m(7,'plane','polygonTiling','Lát nền tam giác đều và lục giác đều',{n:3,side:1.1,rows:4},'6\\cdot60^\\circ=360^\\circ'),
  m(7,'plane','polygonTiling','Lục giác đều xếp kín mặt phẳng',{n:6,side:1.2,rows:3},'3\\cdot120^\\circ=360^\\circ'),
  m(7,'graph','lineGraph','Kéo hệ số góc của đường thẳng',{a:-1.5,b:2},'y=ax+b'),
  m(7,'stats','barChart','Thay dữ liệu cột và xem tần số',{c1:7,c2:12,c3:5,c4:9}),
  m(8,'plane','polygonTiling','Lát nền bằng hình vuông',{n:4,side:1,rows:4},'4\\cdot90^\\circ=360^\\circ'),
  m(8,'plane','transform2d','Quay, tịnh tiến và phóng to tam giác',{deg:60,k:1,dx:2,dy:1},'S_{\\mathrm{anh}}=k^2S_{\\mathrm{goc}}'),
  m(8,'solid','cube','Thiết diện nghiêng hình lập phương',{a:4},'S_{\\mathrm{cat}}=S_{\\mathrm{da\\ giac}}'),
  m(8,'graph','linearSlope','Hệ số góc âm và tung độ gốc',{a:-2,b:3},'y=ax+b'),
  m(8,'stats','barChart','Thống kê điểm khảo sát',{c1:4,c2:7,c3:9,c4:6}),
  m(9,'plane','circleTangent','Khảo sát ba vị trí của đường thẳng với đường tròn',{r:3,d:4},'d<R,\\ d=R,\\ d>R'),
  m(9,'plane','unitCircleMotion','Góc quay trên đường tròn và giá trị sin',{deg:50,amp:1},'y=\\sin t'),
  m(9,'solid','squarePyramid','Mặt cắt nghiêng qua hình chóp',{a:5,h:5},'S_{\\mathrm{cat}}'),
  m(9,'graph','parabolaGeneral','Dịch đỉnh parabol theo a, b, c',{a:1,b:-3,c:1},'y=ax^2+bx+c'),
  m(9,'stats','barChart','Biểu đồ và số liệu quan sát',{c1:5,c2:8,c3:10,c4:7},'',{kind:'raw_numeric',values:[8,9,12,15,17,20,22,25],labels:['1','2','3','4','5','6','7','8']}),
  m(10,'plane','transform2d','Phép quay và vị tự có tỉ số k',{deg:45,k:1.6,dx:2,dy:-1},'S^\\prime=k^2S'),
  m(10,'plane','unitCircleMotion','Liên kết vòng tròn và đồ thị sin',{deg:120,amp:1.5},'y=A\\sin t'),
  m(10,'graph','sine','Đồ thị hàm sin và chu kỳ',{amp:2,freq:1.5},'y=A\\sin(kx)'),
  m(10,'graph','exponential','Đồ thị tăng trưởng hàm mũ',{a:1.8},'y=a^x'),
  m(10,'stats','boxPlot','Khám phá trung vị và tứ phân vị',{},'IQR=Q_3-Q_1',{kind:'raw_numeric',values:[2,3,4,5,5,6,7,8,9,11],labels:[]}),
  m(11,'plane','unitCircleMotion','Góc lượng giác từ 0° đến 360°',{deg:270,amp:1},'\\sin(360^\\circ-t)=-\\sin t'),
  m(11,'plane','transform2d','Ảnh tam giác qua một phép biến hình',{deg:-90,k:1,dx:0,dy:2},'AB=A^\\prime B^\\prime'),
  m(11,'graph','sine','Biên độ và tần số hàm sin',{amp:1,freq:2},'T=\\frac{2\\pi}{|k|}'),
  m(11,'graph','exponential','Cơ số và sự tăng giảm hàm mũ',{a:2.3},'y=a^x'),
  m(11,'graph','derivative','Đạo hàm của hàm bậc ba',{a:0.5,b:3},"f'(x)=3ax^2-b"),
  m(11,'stats','boxPlot','Phân bố số liệu và khoảng tứ phân vị',{},'IQR=Q_3-Q_1',{kind:'raw_numeric',values:[1,3,3,4,5,6,9,11,14,16,20],labels:[]}),
  m(12,'plane','transform2d','Tỷ số diện tích qua vị tự',{deg:0,k:1.8,dx:1,dy:0},'S^\\prime=k^2S'),
  m(12,'graph','derivative','Đồ thị hàm số và đạo hàm (hai đường)',{a:1,b:3},"f'(x)=3ax^2-b"),
  m(12,'graph','exponential','So sánh đồ thị các hàm mũ',{a:1.2},'y=a^x'),
  m(12,'solid','cuboid','Thiết diện nghiêng hình hộp chữ nhật',{a:5,b:3,h:4},'S_{\\mathrm{cat}}'),
  m(12,'solid','squarePyramid','Thiết diện nghiêng qua khối chóp',{a:5,h:6},'S_{\\mathrm{cat}}'),
  m(12,'stats','boxPlot','Thống kê mẫu, các tứ phân vị',{},'Me=Q_2',{kind:'raw_numeric',values:[2,4,4,6,7,9,11,13,18],labels:[]})
]);

export const REAL_WORLD_EXTENSION_MODELS=Object.freeze([
  m(7,'real','cuboid','Tủ đựng đồ hình hộp chữ nhật trong lớp học',{a:4.8,b:2.6,h:6.2},'V=abh'),
  m(7,'real','triPrism','Mái che hành lang dạng lăng trụ tam giác',{a:4.2,h:3.4},'V=S_{\\text{đáy}}h'),
  m(8,'real','squarePyramid','Mái chòi sân trường dạng chóp tứ giác đều',{a:5,h:4.8},'V=\\frac{1}{3}S_{\\text{đáy}}h'),
  m(8,'real','pythagoras','Đường dốc xe lăn cạnh cầu thang',{a:3.2,b:4.6},'c^2=a^2+b^2'),
  m(9,'real','sphere','Đèn trang trí hình cầu',{r:2.8},'S=4\\pi R^2,\\ V=\\frac{4}{3}\\pi R^3'),
  m(9,'real','cone','Nón báo giao thông hình nón',{r:2.2,h:4.5},'V=\\frac{1}{3}\\pi r^2h,\\ l=\\sqrt{r^2+h^2}'),
  m(10,'real','ellipse','Bồn hoa elip ở sân trường',{a:4.6,b:2.8},'MF_1+MF_2=2a'),
  m(10,'real','circleOxy','Bánh xe đạp trong hệ trục tọa độ',{a:0,b:0,r:2.4},'(x-a)^2+(y-b)^2=R^2'),
  m(11,'real','lineParallelPlane','Đường ray mô hình song song với mặt sàn',{h:2.4},'d \\parallel (P)'),
  m(11,'real','frustumPyramid','Mái nhà cụt thoát nước',{a:6,b:3.2,h:3.4},'V=\\frac{h}{3}(S_1+S_2+\\sqrt{S_1S_2})'),
  m(12,'real','revolvedSolid','Bình gốm khối tròn xoay',{r1:1.6,r2:2.8,h:4.6,k:1.25},'V=\\pi\\int_a^b [R(x)]^2dx'),
  m(12,'real','oxyzSphere','Vòm quan sát mô hình mặt cầu Oxyz',{r:3.1},'x^2+y^2+z^2=R^2')
]);

export function explorationsForGrade(catalog,grade,zone){
 const own=catalog.filter(m=>Number(m.grade)===Number(grade));
 const ref=own.find(x=>x.portalZone===zone)||own[0];
 if(!ref)return [];
 const sourceList=zone==='real'?REAL_WORLD_EXTENSION_MODELS:EXPLORATION_MODELS;
 return sourceList.filter(x=>x.grade===Number(grade)&&x.zone===zone).map((x,index)=>({
   id:`mv_r4_${grade}_${zone}_${index+1}`,grade:x.grade,type:x.type,title:x.title,
   params:{...x.params},formula:x.formula,description:`Mô hình minh họa mở rộng do MATHVERSE xây dựng; KHÔNG phải mô hình SGK gốc. ${x.title}.`,
   ...(x.data?{data:structuredClone(x.data)}:{}),
   custom:false,supplemental:true,portalZone:zone,sourceExhibitId:ref.id,
   category:'Mô hình minh họa mở rộng',curriculumSource:'Mô hình minh họa mở rộng – không sao chép SGK'
 }));
}
