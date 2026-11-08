/** Discovery UNESCO catalogue R96. The inscription applies to the UNESCO property,
 * not necessarily to each selected building within that property.
 * Coordinates approximate the depicted building and are for educational globe markers.
 * Sketchfab IDs refer to third-party embeddable viewers, NOT downloadable GLB assets.
 */
const properties = [
  ['hue','Ngọ Môn – Quần thể Cố đô Huế','Việt Nam','Châu Á',16.4669,107.5791,1993,678,'Meridian Gate (Huế)','Đối xứng, tỉ lệ, hình chữ nhật','6, 7, 8, 9','Đối xứng trục và các hình chữ nhật','truss',null,'6acf4f949d5247f3afa6afdaa7c188bd','korotovool','Ngọ Môn là một công trình nằm trong Quần thể di tích Cố đô Huế được UNESCO ghi danh.'],
  ['hoian','Chùa Cầu – Đô thị cổ Hội An','Việt Nam','Châu Á',15.8770,108.3260,1999,948,'Japanese Bridge','Hình thang, hình chữ nhật, đối xứng','6, 7, 8','Hình thang và trục đối xứng','bridge',null,null,null,'Chùa Cầu thuộc khu vực Đô thị cổ Hội An được UNESCO ghi danh; chưa ghép mô hình 3D cụ thể khi chưa kiểm chứng.'],
  ['myson','Tháp Chăm – Thánh địa Mỹ Sơn','Việt Nam','Châu Á',15.7640,108.1240,1999,949,'Mỹ Sơn','Đối xứng, hình khối, tỉ lệ','6, 8, 9','Khối hộp và các tầng tháp','stepped_tower',null,'833564ab7c2540b9be6ecefb8bfc2a8a','Robert Szymaniuk','Đền tháp Chăm là những thành phần của Thánh địa Mỹ Sơn được UNESCO ghi danh.'],
  ['thanglong','Đoan Môn – Hoàng thành Thăng Long','Việt Nam','Châu Á',21.0367,105.8402,2010,1328,'Imperial Citadel of Thăng Long','Đối xứng trục, tỉ lệ, hình chữ nhật','6, 7, 8','Trục đối xứng và dãy cửa','three_towers',null,null,null,'Đoan Môn nằm trong khu Trung tâm Hoàng thành Thăng Long – Hà Nội được UNESCO ghi danh.'],
  ['honha','Cổng Nam – Thành nhà Hồ','Việt Nam','Châu Á',20.0787,105.6032,2011,1358,'Citadel of the Hồ Dynasty','Hình khối, vòm, ước lượng kích thước','6, 8, 9','Hình hộp chữ nhật và vòm cuốn','steel_arch',null,null,null,'Cổng Nam thuộc Thành nhà Hồ, di sản thế giới được UNESCO ghi danh.'],
  ['vinhnghiem','Chùa Vĩnh Nghiêm – Quần thể Yên Tử','Việt Nam','Châu Á',21.2785,106.2285,2025,1732,'Vinh Nghiem Pagoda (Bac Giang)','Hình chữ nhật, góc mái, đối xứng','6, 7, 8','Trục đối xứng và góc mái','stepped_tower',null,null,null,'Chùa Vĩnh Nghiêm là một thành phần của quần thể Yên Tử – Vĩnh Nghiêm – Côn Sơn, Kiếp Bạc được ghi danh năm 2025.'],
  ['angkor','Angkor Wat','Campuchia','Châu Á',13.4125,103.8670,1992,668,'Angkor Wat','Đối xứng, hình vuông, hình chữ nhật','6, 7, 8, 9','Bố cục đồng tâm và đối xứng','stepped_tower',null,'be70b89f9c264fc19d63dca2ae78b224','333DDD','Angkor Wat là một công trình trong khu di sản Angkor được UNESCO ghi danh.'],
  ['taj','Taj Mahal','Ấn Độ','Châu Á',27.1751,78.0421,1983,252,'Taj Mahal','Đối xứng trục, hình tròn, hình khối','6, 7, 8, 9','Đối xứng trục và hình tròn','circle_square',null,'1eb09052f6cd421caeaa6cb3204cb15d','Dinendra Neyo','Toàn bộ khu phức hợp Taj Mahal được UNESCO ghi danh.'],
  ['giza','Đại kim tự tháp Giza','Ai Cập','Châu Phi',29.9792,31.1342,1979,86,'Great Pyramid of Giza','Hình chóp tứ giác đều, thể tích','6, 8, 10, 11, 12','Hình chóp tứ giác đều (lý tưởng hóa)','pyramid',null,'4a251113722f4d969b6cf2ca5f35c502','ianicolo','Kim tự tháp Khufu thuộc di sản Memphis và các khu mộ – từ Giza đến Dahshur.'],
  ['parthenon','Đền Parthenon','Hy Lạp','Châu Âu',37.9715,23.7267,1987,404,'Parthenon','Đường song song, góc, tỉ lệ','6, 7, 8, 9','Các dãy cột và hình chữ nhật','column_grid','models/parthenon_columns_8x17.glb','d5cc54ccd57a4bdeb3c164a96c677b59','Nick G. Gizelis','Đền Parthenon nằm trong khu Acropolis tại Athens được UNESCO ghi danh.'],
  ['pisa','Tháp nghiêng Pisa','Ý','Châu Âu',43.7230,10.3966,1987,395,'Leaning Tower of Pisa','Góc nghiêng, hình trụ, độ cao','6, 8, 9','Hình trụ và phương thẳng đứng','cylinder',null,'f0456bc36bdc4bfd8890f0dfdaf86656','Aglaiapoulida','Tháp nghiêng Pisa là một công trình trong Quảng trường Nhà thờ Pisa được UNESCO ghi danh.'],
  ['borobudur','Đền Borobudur','Indonesia','Châu Á',-7.6079,110.2038,1991,592,'Borobudur','Hình vuông đồng tâm, hình tròn','6, 7, 8','Các tầng vuông và vòng tròn','square_circle_terraces','models/borobudur_5_square_3_circle.glb','84525b2dc4094057ab33e026eb961371','giga','Borobudur thuộc Quần thể đền Borobudur được UNESCO ghi danh.'],
  ['colosseum','Đấu trường Colosseum','Ý','Châu Âu',41.8902,12.4922,1980,91,'Colosseum','Elip, đối xứng, hình vòng','9, 10, 11, 12','Đường elip và hình vành khuyên','elliptic_ring','models/colosseum_ellipse_annulus.glb','535dc96e586f40bd956ea3cbff810055','Brian Trepanier','Colosseum nằm trong Trung tâm lịch sử Roma được UNESCO ghi danh.'],
  ['sydney','Nhà hát Opera Sydney','Australia','Châu Đại Dương',-33.8568,151.2153,2007,166,'Sydney Opera House','Mặt cong, mặt cầu và thiết diện','9, 10, 11, 12','Mảnh mặt cầu lý tưởng hóa','shells',null,'317b2d540f0a4f7e8d87dd3b0372712d','Nick Reinhardt','Nhà hát Opera Sydney được UNESCO ghi danh; mô hình Sketchfab được chọn là bản dựng phong cách nghệ thuật.'],
  ['alhambra','Cung điện Alhambra','Tây Ban Nha','Châu Âu',37.1761,-3.5881,1984,314,'Alhambra','Lát mặt phẳng, họa tiết đối xứng','6, 7, 8, 9','Hoa văn đối xứng và hình đa giác','circle_square',null,'163da113b0c74d4daa8624a5b3bce244','Brian Trepanier','Alhambra là công trình trung tâm trong di sản Alhambra, Generalife và Albayzín.'],
  ['mont','Mont-Saint-Michel','Pháp','Châu Âu',48.6360,-1.5115,1979,80,'Mont-Saint-Michel','Hình khối, độ cao, tỉ lệ','6, 8, 9','Các khối kiến trúc theo cao độ','stepped_tower',null,'ee4eb76e449044d297010c49a178825a','LZCreation','Mont-Saint-Michel và vịnh của nó được UNESCO ghi danh.'],
  ['petra','Al-Khazneh – Thành cổ Petra','Jordan','Châu Á',30.3222,35.4514,1985,326,'Al-Khazneh','Đối xứng, cột, các hình chữ nhật','6, 7, 8','Mặt đứng đối xứng và dãy cột','column_grid',null,'966b88f5768d43ed9ebf4cc726c42f3d','Global Digital Heritage','Al-Khazneh thuộc Thành cổ Petra được UNESCO ghi danh; mô hình Sketchfab là bản quét thực địa.'],
  ['chichen','El Castillo – Chichén Itzá','Mexico','Châu Mỹ',20.6843,-88.5678,1988,483,'Chichen Itza','Hình chóp bậc thang, đối xứng','6, 8, 10','Các tầng vuông và hình chóp','stepped_pyramid','models/chichen_9_terraces.glb','1624b224a7514762baf9025e6fe7dc4f','CyArk','El Castillo thuộc di sản Chichén Itzá; mẫu Sketchfab công bố bởi CyArk.']
];

export const UNESCO_HERITAGE = Object.freeze(properties.map((a) => {
  const [suffix,name,country,continent,lat,lng,year,whc,wikipediaTitle,math,classes,shape,kind,glbPath,sketchfabId,modelAuthor,history]=a;
  return Object.freeze({
    id:`unesco_${suffix}`, name, title:name, country, continent, lat, lng,
    latitude:lat,longitude:lng,year,heritageType:'cultural',whcId:whc,
    unescoUrl:`https://whc.unesco.org/en/list/${whc}/`,
    wikipediaTitle,math,grade:`Toán ${classes}`,classes,shape,kind,
    glbPath,model3d:true,sketchfabId,modelAuthor,
    history,explanation:history,
    geometry:{modelType:kind, concepts:shape.split(' và '),fidelity:'educational_idealized_not_a_scan'},
    photo:{status:'pending_commons_image_review'},
    media:{photo:'',author:'Đang tải tác giả từ Wikimedia Commons',license:'Đang kiểm tra giấy phép ảnh',source:`https://commons.wikimedia.org/`},
    publishReady:false,
    heritageInscriptionVerified:true
  });
}));
export const UNESCO_BY_ID = new Map(UNESCO_HERITAGE.map(item=>[item.id,item]));
export const UNESCO_TOTAL = UNESCO_HERITAGE.length;
export function isUnescoItem(item){return Boolean(item?.heritageInscriptionVerified && UNESCO_BY_ID.has(item.id));}
export function trustedSketchfabEmbed(item){
  if(!isUnescoItem(item)||!(/^[a-f0-9]{32}$/i).test(item.sketchfabId||''))return null;
  return `https://sketchfab.com/models/${item.sketchfabId}/embed?autostart=0&ui_theme=dark`;
}
