/** R107 room B: 17 Wikimedia Commons topic catalogs, images selected at runtime.
 * A category is NOT a license; metadata (author and license) is checked for the EXACT chosen photo.
 * No photograph is bundled, marked licensed, or approved before runtime verification.
 */
const mk=(id,name,category,wikipediaTitle,collection,math,latex,explanation,grade='Toán 6–9')=>Object.freeze({
 id,name,title:name,kind:'r107_commons_photo',collection,grade,classes:'6, 7, 8, 9',topics:math,math,latex,shape:math,
 wikipediaTitle,explanation,model3d:false,geometry2DApproved:true,geometry3DApproved:false,geometryReviewRequired:true,
 photoApproved:false,publishReady:false,referenceOnly:true,sourceStatus:'commons_category_awaiting_runtime_license_review',
 fidelityNote:'Ảnh chụp được chọn và xác nhận giấy phép ở thời điểm mở; mô hình Toán chỉ lý tưởng hóa.',
 media:Object.freeze({file:'',author:'Đọc từ metadata từng ảnh Wikimedia',license:'Chờ xác minh tệp ảnh',photo:'',source:`https://commons.wikimedia.org/wiki/Category:${encodeURIComponent(category.replace(/^Category:/,''))}`}),
 photo:Object.freeze({status:'pending',commonsCategory:category,wikipediaTitle,localPath:'/dual/discovery-assets/earth-fallback.png'}),
});
export const R107_REAL_PHOTOS=Object.freeze([
 mk('r107_basalt','Cột bazan lục giác – Giant’s Causeway','Category:Basalt_columns',"Giant's_Causeway",'Ảnh R107 · Thiên nhiên','Các cột gần lăng trụ có tiết diện đa giác',String.raw`S_{\rm lục\ giác}=\frac{3\sqrt3}{2}a^2`,'Quan sát các cột đá bazan; tiết diện thường gần đa giác và không nhất thiết là lục giác đều.'),
 mk('r107_spiderweb','Mạng nhện có đối xứng','Category:Spider_webs','Spider_web','Ảnh R107 · Thiên nhiên','Tia, góc và đối xứng quay gần đúng',String.raw`\alpha=\frac{360^\circ}{n}`,'Nhìn các tia từ tâm mạng nhện, ước lượng góc giữa các tia; không khẳng định mọi mạng đều đối xứng hoàn hảo.'),
 mk('r107_nautilus','Vỏ ốc Nautilus theo đường xoắn','Category:Nautilus_shells','Nautilus','Ảnh R107 · Thiên nhiên','Vỏ xoắn, các đường cong đồng dạng gần đúng',String.raw`r=r_0 e^{k\theta}`,'Quan sát hình dạng và các khoang; phương trình đường xoắn logarithm là xấp xỉ, không phải kết luận mọi vỏ ốc đúng tuyệt đối.'),
 mk('r107_leaf','Gân lá cây và nhánh phân cấp','Category:Leaf_veins','Leaf','Ảnh R107 · Thiên nhiên','Đường cong và cấu trúc phân nhánh',String.raw`AB+BC\ge AC`,'Quan sát trục gân chính, gân nhánh, so sánh độ dài một đường gấp khúc với đoạn nối thẳng.'),
 mk('r107_treerings','Vòng năm trên lát cắt gỗ','Category:Tree_rings','Dendrochronology','Ảnh R107 · Thiên nhiên','Đường cong khép kín gần đồng tâm',String.raw`A=\pi (R^2-r^2)`,'Khoanh hai vòng gần tròn và tính diện tích vành khăn lý tưởng hóa; các vòng thật không phải đường tròn hoàn hảo.'),
 mk('r107_pineapple','Quả dứa và dãy đường xoắn','Category:Pineapples','Pineapple','Ảnh R107 · Thiên nhiên','Quy luật xếp mắt quả, hình xoắn',String.raw`\theta_{n}=n\alpha`,'Đếm các dải mắt quả theo hai hướng; không mặc định các dãy số đều chính xác theo mọi quả dứa.'),
 mk('r107_soapbubbles','Bong bóng xà phòng hình cầu','Category:Soap_bubbles','Soap_bubble','Ảnh R107 · Thiên nhiên','Hình cầu và diện tích mặt cầu',String.raw`S=4\pi R^2`,'Bong bóng đơn tự do có khuynh hướng gần hình cầu do sức căng mặt ngoài.'),
 mk('r107_soapfilms','Màng xà phòng trên khung','Category:Soap_films','Soap_film','Ảnh R107 · Thiên nhiên','Mặt cong và diện tích bề mặt',String.raw`S=\iint_D\sqrt{1+f_x^2+f_y^2}\,dx\,dy`,'Màng xà phòng hình thành các mặt cong có diện tích rất nhỏ dưới điều kiện ràng buộc; công thức dành cho lớp mở rộng.' ,'Toán 10–12'),
 mk('r107_butterfly','Đôi cánh bướm – đối xứng','Category:Butterflies','Butterfly','Ảnh R107 · Thiên nhiên','Đối xứng trục gần đúng',String.raw`d(A,\Delta)=d(A',\Delta)`,'Tìm trục đối xứng gần theo thân bướm và so sánh hai cánh. Sinh vật thật có biến thiên tự nhiên.'),
 mk('r107_dish','Ăng-ten chảo vệ tinh','Category:Satellite_dishes','Satellite_dish','Ảnh R107 · Kỹ thuật','Mặt paraboloid tròn xoay và tiêu điểm',String.raw`z=\frac{x^2+y^2}{4f}`,'Mặt phản xạ lý tưởng hóa là paraboloid; quan sát mối quan hệ chảo và bộ thu tại vùng tiêu điểm.', 'Toán 9–12'),
 mk('r107_windturbine','Tuabin gió ba cánh','Category:Wind_turbines','Wind_turbine','Ảnh R107 · Kỹ thuật','Góc quay, đường tròn, đối xứng gần đúng',String.raw`\alpha=\frac{360^\circ}{3}=120^\circ`,'Tính góc giữa ba cánh tuabin bố trí gần đều quanh trục quay.'),
 mk('r107_truss','Cầu thép có hệ giàn tam giác','Category:Truss_bridges','Truss_bridge','Ảnh R107 · Kỹ thuật','Tam giác, hệ thanh giàn, tính cứng vững',String.raw`a^2+b^2=c^2`,'Phân tích các tam giác trong giàn chịu lực. Ví dụ Pythagoras chỉ áp dụng cho tam giác vuông.'),
 mk('r107_spring','Lò xo kim loại dạng helix','Category:Coil_springs','Spring_(device)','Ảnh R107 · Kỹ thuật','Đường xoắn trụ trong không gian',String.raw`x=R\cos t,\ y=R\sin t,\ z=pt`,'Mô tả một vòng helix lý tưởng và bước xoắn p.' ,'Toán 10–12'),
 mk('r107_container','Container hàng hóa xếp chồng','Category:Shipping_containers','Intermodal_container','Ảnh R107 · Kỹ thuật','Hình hộp chữ nhật và thể tích',String.raw`V=abc`,'Quan sát cạnh song song, góc vuông, mặt phẳng và công thức thể tích khối hộp.'),
 mk('r107_irrigation','Cánh đồng tưới xoay vòng','Category:Center_pivot_irrigation','Center-pivot_irrigation','Ảnh R107 · Kỹ thuật','Hình tròn, bán kính và diện tích',String.raw`S=\pi R^2`,'Từ ảnh vệ tinh vùng tưới tròn, ước lượng diện tích đã tưới khi biết bán kính.'),
 mk('r107_chainring','Đĩa xích xe đạp','Category:Bicycle_chainrings','Crankset','Ảnh R107 · Kỹ thuật','Đường tròn, số răng, góc ở tâm',String.raw`\alpha=\frac{360^\circ}{n}`,'Giả sử răng cách đều trên đĩa, xác định góc ở tâm tương ứng giữa hai răng liên tiếp.'),
 mk('r107_staircase','Cầu thang xoắn kim loại','Category:Spiral_staircases','Stairs','Ảnh R107 · Kỹ thuật','Hình chiếu tròn và đường xoắn',String.raw`x=R\cos t,\ y=R\sin t,\ z=kt`,'Quan sát hình chiếu bằng gần đường tròn, độ cao tăng theo góc quay; mô hình helix được lý tưởng hóa.','Toán 9–12'),
]);
