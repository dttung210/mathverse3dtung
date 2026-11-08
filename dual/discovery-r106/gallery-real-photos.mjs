/** R106 Room B: verified Wikimedia Commons photo pages (image is fetched only in browser).
 * These 11 photos are real, not synthetic. All images require Internet until a copyright-compliant
 * image cache is created on a machine with network access; not bundled into this update ZIP.
 * 8 original room frames are reused and paginated; no additional WebGL textures all at once.
 */
const commons=(file)=>`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=960`;
const page=(file)=>`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file).replaceAll('%20','_')}`;
const a=(id,name,file,author,license,math,latex,explanation,grade='Toán 6–9')=>Object.freeze({
 id,name,title:name,collection:'Ảnh thật và hình học R106',kind:'r106_photo',
 grade,classes:'6, 7, 8, 9',math,topics:math,latex,shape:math,
 explanation,model3d:false,geometry3DApproved:false,geometry2DApproved:true,
 photoApproved:true,publishReady:true,geometryReviewRequired:false,
 fidelityNote:'Ảnh chụp đối tượng thực tế. Mô hình Toán lý tưởng hóa, có thể khác kích thước vật thể trong ảnh.',
 media:Object.freeze({file,author,license,photo:commons(file),source:page(file)}),
 photo:Object.freeze({status:'approved',author,license,commonsPage:page(file),localPath:'/dual/discovery-assets/earth-fallback.png'}),
 referenceOnly:false,sourceUrl:page(file),
});
export const R106_REAL_PHOTOS=Object.freeze([
 a('r106_beehive','Tổ ong mật','Western Honey Bees and Honeycomb Closeup.JPG','Healthnutlady','CC BY 3.0','Lục giác gần đều, phép lát mặt phẳng',String.raw`S_{\text{lục giác đều}}=\frac{3\sqrt3}{2}a^2`,'Quan sát các ô tổ ong gần lục giác. Tìm trục đối xứng và chứng minh 3 góc 120° có thể ghép quanh một điểm.'),
 a('r106_romanesco','Súp lơ Romanesco','Romanesco broccoli 2025 G1.jpg','George Chernilevsky','CC BY 4.0','Cấu trúc tự tương tự, tỉ lệ',String.raw`k=\frac{a'}{a}`,'Quan sát các cụm hình nón có cấu trúc lặp theo nhiều cấp. Đây là tự tương tự gần đúng trong tự nhiên, không khẳng định một fractal Toán học chính xác.', 'Toán 6–12'),
 a('r106_pine','Quả thông và đường xoắn','The pine cone.jpg','BogTar200917','CC BY-SA 4.0','Đường xoắn, quy luật sắp xếp',String.raw`r=a\theta`,'Đếm các dải vảy xoắn thuận và xoắn ngược. Không khẳng định mọi quả thông đều cho chính xác cùng một chuỗi số.'),
 a('r106_ferris','Vòng đu quay','Ferris wheel.jpg','Llywrch','CC BY-SA 2.5','Đường tròn, phép quay, góc ở tâm',String.raw`s=R\theta`,'Tìm tâm và bán kính vòng quay; đo góc ở tâm và độ dài cung khi góc đo bằng radian.', 'Toán 6–12'),
 a('r106_stairs','Cầu thang xoắn ốc','M+ Spiral Staircase.jpg','Lord Jaraxxus','CC BY-SA 4.0','Đường xoắn không gian, hình chiếu bằng',String.raw`x=R\cos t,\ y=R\sin t,\ z=kt`,'Quan sát hình chiếu xuống mặt phẳng và cách chiều cao thay đổi theo góc quay. Công thức biểu diễn đường xoắn ốc lý tưởng, không phải số liệu đo công trình.', 'Toán 9–12'),
 a('r106_bicycle','Nan hoa bánh xe đạp','Closeup photo of Bicycle wheel.jpg','Tajdikul alam niloy','CC BY-SA 4.0','Bán kính, đường kính, phép đối xứng quay',String.raw`d=2R`,'Tìm tâm, các bán kính qua nan hoa, đo gần đúng góc giữa hai nan hoa cạnh nhau.'),
 a('r106_geodesic','Mái vòm geodesic','Geodesic Dome.jpg','Murgatroyd49','CC BY-SA 4.0','Tam giác, lưới và đa diện',String.raw`V-E+F=2`,'Quan sát mạng tam giác chia nhỏ trên mái vòm; xem quan hệ số đỉnh, cạnh, mặt chỉ áp dụng cho đa diện lồi khép kín, không áp máy móc cho mái vòm hở.', 'Toán 8–12'),
 a('r106_tessellation','Lát ghép hình','Tessellation.jpg','Annielogue','CC BY-SA 4.0','Đa giác, lát mặt phẳng và khe hở',String.raw`360^\circ`,'Ảnh chụp hoạt động xếp các miếng lát ngũ giác và hình thoi. Tìm góc quanh đỉnh, phân biệt lát kín với trường hợp có khoảng hở.'),
 a('r106_football','Quả bóng đá và đa giác','Soccerball.jpg','CAPS LOCK','CC BY-SA 3.0','Ngũ giác, lục giác và mặt khối cầu',String.raw`12\cdot5+20\cdot6=2\cdot90`,'Bóng Telstar kiểu truyền thống thường minh họa 12 ngũ giác và 20 lục giác. Không mặc định mọi mẫu bóng đều có cấu trúc này.'),
 a('r106_snowflake','Tinh thể bông tuyết','Snowflake seen at the microscope.jpg','Fedegrasso','CC BY 4.0','Đối xứng quay và sáu nhánh',String.raw`\alpha=\frac{360^\circ}{6}=60^\circ`,'Quan sát ảnh hiển vi một tinh thể băng, tìm các trục đối xứng gần đúng và góc quay 60 độ giữa các nhánh.'),
 a('r106_starfish','Sao biển và đối xứng','A starfish.jpg','Mert TÜRKAN','CC BY-SA 4.0','Đối xứng quay gần đúng',String.raw`\alpha\approx\frac{360^\circ}{5}=72^\circ`,'Đối với mẫu sao biển năm cánh, ước lượng góc giữa hai cánh gần nhau; sinh vật thật không đối xứng toán học hoàn hảo.'),
]);
