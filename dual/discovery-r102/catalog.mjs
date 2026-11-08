/** MATHVERSE R102: architecture for education, not UNESCO's own "seven wonders" ranking.
 * All 14 ancient/New7Wonders appear on map/globe; only geometry-suitable objects on physical room plinths.
 * The geometry model is an explicitly educational abstraction, except for the retained R98 Parthenon GLB scan.
 */
import {WORLD_WONDERS_14} from '../discovery-r100/wonders-data.mjs';
import {R106_HERITAGE} from '../discovery-r106/heritage-additions.mjs';
import {R107_HERITAGE} from '../discovery-r107/heritage-additions.mjs';
export const GROUP_COLORS=Object.freeze({ancient:0xf59a65,new2007:0xe8c078,other:0xed5261});
export const GEO_META=Object.freeze({
 wonder_giza:{zone:'unesco',shape:'pyramid',caption:'Chóp tứ giác đều',formula:String.raw`S_{xq}=2al`,whc:86,note:'Mô hình khối lý tưởng, không thay thế bản quét bề mặt đá.'},
 wonder_artemis:{zone:'unesco',shape:'temple',caption:'Hệ cột trụ đối xứng',formula:String.raw`V_{trụ}=\pi r^2h`,whc:1018,note:'Cấu trúc đền đã mất; hình 3D là phục dựng khối minh họa.'},
 wonder_colosseum:{zone:'new7',shape:'colosseum',caption:'Vành elip và các vòm',formula:String.raw`\frac{x^2}{a^2}+\frac{y^2}{b^2}=1`,whc:91,note:'Mặt bằng dạng elip; hệ vòm là khái quát giáo dục.'},
 wonder_chichen:{zone:'new7',shape:'mayan',caption:'Các khối chóp cụt đồng tâm',formula:String.raw`S_{đáy}=a^2`,whc:483,note:'Bậc kim tự tháp mô phỏng hình học, không phải dữ liệu đo khảo cổ.'},
 wonder_taj:{zone:'new7',shape:'taj',caption:'Mái vòm và trục đối xứng',formula:String.raw`V_{cầu}=\frac{4}{3}\pi r^3`,whc:252,note:'Mái vòm, tháp góc và sân là các khối gần đúng.'},
});
export const EXTRA_GEO_META=Object.freeze({
 wonder_babylon:{shape:'babylon',caption:'Khối bậc thang giật cấp & vòm cuốn',formula:String.raw`V=\sum_{k=1}^{4} a_k^2 h`,note:'Mô phỏng hình học bậc thang đồng tâm và hệ vòm đỡ.'},
 wonder_gardens:{shape:'babylon',caption:'Khối bậc thang giật cấp & vòm cuốn',formula:String.raw`V=\sum_{k=1}^{4} a_k^2 h`,note:'Mô phỏng hình học bậc thang đồng tâm và hệ vòm đỡ.'},
 wonder_zeus:{shape:'zeus',caption:'Bệ khối hộp, ngai đối xứng & hàng cột Doric',formula:String.raw`V=a\cdot b\cdot h`,note:'Mô phỏng tỷ lệ khối hộp bệ tượng và hàng cột bao quanh.'},
 wonder_mausoleum:{shape:'mausoleum',caption:'Tổ hợp khối hộp đế, 36 cột trụ & chóp 24 bậc',formula:String.raw`V=V_{\text{đế}}+n\pi r^2h+V_{\text{chóp}}`,note:'Mô phỏng tổ hợp 3 tầng hình học kinh điển của Lăng Halicarnassus.'},
 wonder_colossus:{shape:'colossus',caption:'Hai bệ đá đa giác đều cửa cảng & trục đối xứng',formula:String.raw`S_{\text{đáy}}=n\cdot\frac{1}{2}R^2\sin\frac{2\pi}{n}`,note:'Mô phỏng cấu trúc bệ trụ đối xứng tại lối vào cảng.'},
 wonder_lighthouse:{shape:'pharos',caption:'Ba tầng đồng trục: khối vuông, bát giác đều & trụ tròn',formula:String.raw`V=a^2h_1+2(1+\sqrt2)s^2h_2+\pi r^2h_3`,note:'Mô phỏng hình học 3 tầng chuyển tiếp vuông → bát giác → tròn của Hải đăng Pharos.'},
 wonder_alexandria:{shape:'pharos',caption:'Ba tầng đồng trục: khối vuông, bát giác đều & trụ tròn',formula:String.raw`V=a^2h_1+2(1+\sqrt2)s^2h_2+\pi r^2h_3`,note:'Mô phỏng hình học 3 tầng chuyển tiếp vuông → bát giác → tròn của Hải đăng Pharos.'},
 wonder_greatwall:{shape:'greatwall',caption:'Đường gấp khúc 3D theo địa hình & tháp canh chóp cụt',formula:String.raw`L=\sum_{i=1}^{n}\sqrt{\Delta x_i^2+\Delta y_i^2+\Delta z_i^2}`,note:'Mô phỏng độ dốc, đường gấp khúc không gian và các tháp canh cách đều.'},
 wonder_wall:{shape:'greatwall',caption:'Đường gấp khúc 3D theo địa hình & tháp canh chóp cụt',formula:String.raw`L=\sum_{i=1}^{n}\sqrt{\Delta x_i^2+\Delta y_i^2+\Delta z_i^2}`,note:'Mô phỏng độ dốc, đường gấp khúc không gian và các tháp canh cách đều.'},
 wonder_petra:{shape:'petra',caption:'Mặt đứng đối xứng trục, trán tường tam giác & tháp tròn Tholos',formula:String.raw`d(M,\Delta)=d(M',\Delta)`,note:'Mô phỏng mặt đứng đối xứng trục của Al-Khazneh khắc vào vách đá.'},
 wonder_machu:{shape:'machu',caption:'Hệ bậc thang đồng mức sườn núi & nhà đá lăng trụ tam giác',formula:String.raw`z_k=z_0+k\cdot\Delta h`,note:'Mô phỏng các mặt phẳng ngang đồng mức (contour terraces) và mái hai dốc.'},
 wonder_christ:{shape:'christ',caption:'Bệ bát giác đều & cấu trúc chữ thập vuông góc đối xứng',formula:String.raw`\vec{u}\cdot\vec{v}=0\iff \vec{u}\perp\vec{v}`,note:'Mô phỏng trục thẳng đứng 30m vuông góc với sải ngang 28m trên bệ bát giác 8m.'},
});
export const EXTRA_STRUCTURES=Object.freeze([
 {id:'other_petronas',name:'Tháp đôi Petronas',english:'Petronas Twin Towers',group:'other',country:'Malaysia',lat:3.1579,lng:101.7116,location:'Kuala Lumpur, Malaysia',wiki:'Petronas_Towers',uid:'4111f3de53f24ab0a9547205723665b1',author:'NanoRay',kind:'Mô hình kiến trúc Sketchfab · CC BY',history:'Tháp đôi Petronas ở Kuala Lumpur gồm hai tháp nối bằng cầu trên không. Hai tháp có cấu trúc tầng lặp và trục gần song song; mặt bằng mang họa tiết đa giác.',math:'Lăng trụ, hình trụ ghép tầng, đường thẳng song song, mặt cắt đa giác.',isReconstruction:false,whc:null,shape:'petronas',caption:'Hai tháp lặp tầng, cầu nối',formula:String.raw`AB\parallel CD`,zone:'other',photoWiki:'Petronas_Towers',modelLabel:'Petronas Twin Towers 3D (NanoRay)',source:'https://sketchfab.com/3d-models/petronas-twin-towers-4111f3de53f24ab0a9547205723665b1'},
 {id:'other_louvre',name:'Kim tự tháp kính Louvre',english:'Louvre Pyramid',group:'other',country:'Pháp',lat:48.8606,lng:2.3376,location:'Paris, Pháp',wiki:'Louvre_Pyramid',uid:'6130243bcfda400ebb4475358cd73a5d',author:'print3deasy',kind:'Mô hình 3D minh họa · cần kiểm tra giấy phép',history:'Kim tự tháp kính Louvre ở sân Napoléon của bảo tàng Louvre có dạng hình chóp đáy vuông, ghép các tấm kính và khung kim loại.',math:'Hình chóp tứ giác đều, hình vuông, bốn mặt bên là tam giác.',isReconstruction:false,whc:null,shape:'glasspyramid',caption:'Chóp tứ giác đều và khung kính',formula:String.raw`V=\frac{1}{3}a^2h`,zone:'other',photoWiki:'Louvre_Pyramid',source:'https://sketchfab.com/3d-models/louvre-pyramid-6130243bcfda400ebb4475358cd73a5d'},
 {id:'other_golden_gate',name:'Cầu Golden Gate',english:'Golden Gate Bridge',group:'other',country:'Hoa Kỳ',lat:37.8199,lng:-122.4783,location:'San Francisco, Hoa Kỳ',wiki:'Golden_Gate_Bridge',uid:'0f1bf2d780ad4cb6b4e0f4c650f6cdfc',author:'damongraphics',kind:'Mô hình Sketchfab · giấy phép CC BY theo trang tác giả',history:'Cầu Golden Gate là cầu treo với hai tháp và hệ cáp chính. Cáp có thể được mô hình hóa xấp xỉ bởi parabol khi tải trọng được phân bố gần đều theo mặt cầu.',math:'Cáp treo xấp xỉ parabol, trục đối xứng, hệ dây thẳng đứng.',isReconstruction:false,whc:null,shape:'bridge',caption:'Cáp parabol (xấp xỉ)',formula:String.raw`y=ax^2+c`,zone:'other',photoWiki:'Golden_Gate_Bridge',source:'https://sketchfab.com/3d-models/golden-gate-bridge-3d-model-0f1bf2d780ad4cb6b4e0f4c650f6cdfc'},
 {id:'other_gateway',name:'Cổng vòm Gateway Arch',english:'Gateway Arch',group:'other',country:'Hoa Kỳ',lat:38.6247,lng:-90.1848,location:'St. Louis, Missouri, Hoa Kỳ',wiki:'Gateway_Arch',uid:'5015279eea634a0aa2822103c8e52fcd',author:'joseph.e.mathis',kind:'Mô hình tham khảo · cần kiểm tra giấy phép',history:'Gateway Arch tại St. Louis có đường cong dạng dây xích ngược (catenary), không phải đường parabol. Mặt cắt chân vòm có dạng tam giác đều và thay đổi kích thước dọc chiều cao.',math:'Catenary đối xứng: phân biệt với parabol và quan sát tiết diện tam giác.',isReconstruction:false,whc:null,shape:'catenary',caption:'Catenary – KHÔNG phải parabol',formula:String.raw`y=A-B\cosh(x/C)`,zone:'other',photoWiki:'Gateway_Arch',source:'https://www.nps.gov/jeff/planyourvisit/materials-and-techniques.htm'}
]);
const ZONES=Object.freeze({unesco:'KHU 1 · DI SẢN THẾ GIỚI UNESCO',new7:'KHU 2 · NEW7WONDERS 2007',other:'KHU 3 · KIẾN TRÚC HÌNH HỌC KHÁC'});
export {ZONES};
export const R102_CATALOG=Object.freeze([
 ...WORLD_WONDERS_14.map(a=>Object.freeze({
    ...a,...(EXTRA_GEO_META[a.id]||{}),...(GEO_META[a.id]||{}),
    modelOrigin:null,
    modelIsSiteOnly:false,
    // R103: restore the actual STATUE Sketchfab models; change only the left Rhodes real-life photo.
    photoWiki:a.id==='wonder_colossus'?'Rhodes_(city)':a.id==='wonder_zeus'?'Olympia,_Greece':a.wiki,
    photoUrl:a.id==='wonder_colossus'?'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Mandraki_colosseus_harbour_rhodes.jpg/1280px-Mandraki_colosseus_harbour_rhodes.jpg':null,
    photoSource:a.id==='wonder_colossus'?'https://commons.wikimedia.org/wiki/File:Mandraki_colosseus_harbour_rhodes.jpg':null,
    photoAttribution:a.id==='wonder_colossus'?'Jebulon · 2011 · CC0 1.0':null,
    photoSiteCaption:a.id==='wonder_colossus'?'Ảnh thật: cảng Mandraki ở Rhodes, vị trí tương truyền. Vị trí chính xác của tượng cổ CHƯA được xác nhận.':null,
    modelAccuracyNote:a.id==='wonder_zeus'?'Tượng nguyên bản đã mất; Sketchfab là phục dựng nghệ thuật, không có bản quét chính xác.':a.id==='wonder_colossus'?'Tượng gốc đã mất; Sketchfab là mô hình phục dựng nghệ thuật, khác với ảnh cảng Mandraki hiện nay.':null,
    uid:a.uid,
    author:a.author,
    sketchfabUrl:a.sketchfabUrl,
    // Seven wonders remain on map and globe; every single wonder now has a 3D & 2D geometric model.
    zone:GEO_META[a.id]?.zone||null,
    shape:GEO_META[a.id]?.shape||EXTRA_GEO_META[a.id]?.shape||null,
    inGallery:Boolean(GEO_META[a.id]?.zone),
    modelType:GEO_META[a.id]?.shape?'geometry_conceptual':'site_information_only',
    category:a.group==='ancient'?'7 kỳ quan cổ đại':'7 kỳ quan mới (2007)',color:GROUP_COLORS[a.group]
 })),
 ...EXTRA_STRUCTURES.map(a=>Object.freeze({...a,order:15+EXTRA_STRUCTURES.indexOf(a),category:'Công trình kiến trúc hình học khác',inGallery:true,modelType:'geometry_conceptual',color:GROUP_COLORS.other,sketchfabUrl:a.source})),
 ...R106_HERITAGE,
 ...R107_HERITAGE
]);
export const R102_BY_ID=new Map(R102_CATALOG.map(x=>[x.id,x]));
export const GALLERY_ITEMS=Object.freeze(R102_CATALOG.filter(x=>x.inGallery));
export const FLOOR3_WONDERS=Object.freeze(R102_CATALOG.filter(x=>!x.inGallery));
export const GLOBE_MAP_ITEMS=R102_CATALOG;
export const GALLERY_COUNTS=Object.freeze({unesco:GALLERY_ITEMS.filter(x=>x.zone==='unesco').length,new7:GALLERY_ITEMS.filter(x=>x.zone==='new7').length,other:GALLERY_ITEMS.filter(x=>x.zone==='other').length});
