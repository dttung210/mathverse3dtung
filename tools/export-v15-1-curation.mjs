/** Deterministic human-readable curation report; leaves source JSON untouched. */
import fs from 'node:fs';
import {ALL_MATH6_LABS} from '../src/math6-lab/catalog.js';
import {GRADE6_ACTIVE_EXHIBITS,grade6ExhibitPlacement} from '../src/portal-labs/grade6-curation-v15-1.js';
const whyArchived={
 'toan6-ghep-luc-giac':'Là hoạt cảnh của lục giác đều; gộp vào Lab lục giác, không cần bục thứ hai',
 'toan6-ghep-vuong':'Trùng trực quan hình vuông/tam giác; xem trong Lab hình vuông',
 'toan6-cat-hinh-thoi':'Gần trùng phép cắt ghép diện tích; dùng Lab hình thoi để quan sát',
 'toan6-dien-tich-ghep':'Nên giải bằng thao tác ghép trên bảng vẽ hơn là một tượng 3D cố định',
 'toan6-lat-gach-san':'Trùng mô hình lát nền đa giác, bỏ khỏi bục để tránh lặp',
 'toan6-buom-doi-xung':'Ví dụ của đối xứng trục, không cần tượng trưng bày riêng',
 'toan6-gap-ngoi-sao':'Biến thể gấp đối xứng trục, đưa vào bài học liên quan',
 'toan6-hoa-van-quay':'Biến thể đối xứng tâm, tránh lặp thông điệp',
 'toan6-ba-diem-thang-hang':'Có thể thực hành ngay trong Lab điểm thuộc đường thẳng',
 'toan6-phan-loai-goc':'Trùng thao tác đổi góc trong Lab Góc động',
 'toan6-tap-hop-venn':'Minh họa tập hợp thích hợp bảng 2D hơn bục 3D',
 'toan6-gia-tri-hang-so':'Bảng số thuần văn bản; ưu tiên mô hình trục số và phân số',
 'toan6-nhiet-ke':'Ứng dụng trục số nguyên; chuyển thành ví dụ khi mở Lab trục số',
 'toan6-binh-phuong-luy-thua':'Mảng ô 2D dễ bị trùng hình lát nền; không ưu tiên bục',
 'toan6-luoi-phan-so':'Trùng mô hình thanh phân số, dùng mô hình thanh tương tác',
 'toan6-banh-phan-so':'Trùng khái niệm phần bằng nhau với thanh phân số',
 'toan6-so-sanh-phan-so':'Bổ sung sau như chức năng của Lab phân số bằng nhau',
 'toan6-phan-so-cua-so':'Ứng dụng số học, không cần vật trưng bày thứ hai',
 'toan6-hang-thap-phan':'Bảng số nên đặt trong Lab số trực quan, không lên bục',
 'toan6-bang-kiem-dem':'Bước nhập dữ liệu, thuộc Lab biểu đồ chứ không phải tượng 3D',
 'toan6-cot-ngang':'Cách biểu diễn khác của biểu đồ cột, chuyển thành nút đổi kiểu',
 'toan6-bang-thu-thap':'Bảng số liệu dạng chữ; giữ dữ liệu trong Lab thống kê',
 'toan6-rut-bong':'Thí nghiệm ngẫu nhiên tương tự xúc xắc/đồng xu; lưu làm lựa chọn khác',
 'toan6-o-tu-ti':'Trò chơi xác suất, không ưu tiên như vật trưng bày Toán',
 'toan6-giao-lo':'Trùng nội dung hai đường thẳng; lưu làm ví dụ áp dụng',
 'toan6-thiep-gap':'Ứng dụng gấp đối xứng, liên kết với Lab đối xứng trục',
 'toan6-bac-thang-khoi':'Mô hình khối mở rộng, không trọng tâm các bục Toán 6 đã tuyển',
 'mv15-uoc-boi-bang100':'Gần trùng bảng số nguyên tố; giữ trong kho bảo tồn để khi cần mở rộng'
};
const label={plane:'Hình phẳng và ghép hình',symmetry:'Đối xứng và đo đạc',number:'Trục số và phân số',data:'Biểu đồ và thực tế'};
const rows=ALL_MATH6_LABS.map(m=>{
 const loc=grade6ExhibitPlacement(m.id);return {
  id:m.id,title:m.title,group:m.group,engine:m.engine,variant:m.variant,
  book:m.source?.book||'',page:m.source?.printed_page??'',
  portal:loc?label[loc.zone]:'',order:loc?loc.slot+1:'',
  status:loc?'TRUNG_BAY_3D':'LUU_TRU_KHONG_HIEN',
  reason:loc?'Mô hình tiêu biểu; có hiện vật 3D và Lab tương tác riêng':whyArchived[m.id]||'Mẫu phụ hoặc chủ đề gần trùng, không cần thêm bục 3D'
 };
});
if(rows.length!==63||rows.filter(r=>r.status==='TRUNG_BAY_3D').length!==35)throw Error('Curation mismatch');
const names=Object.keys(rows[0]);
const cell=v=>'"'+String(v).replaceAll('"','""')+'"';
fs.writeFileSync('data/DANH_MUC_RA_SOAT_63_MAU_V15_1.csv','\uFEFF'+names.map(cell).join(',')+'\n'+rows.map(row=>names.map(k=>cell(row[k])).join(',')).join('\n')+'\n');
fs.writeFileSync('data/35_MO_HINH_TRUNG_BAY_3D_V15_1.json',JSON.stringify({version:'15.1.0',type:'curated-gallery',note:'28 mẫu khác giữ nguyên trong dữ liệu nguồn, chỉ ẩn khỏi khu trưng bày',zones:Object.entries(GRADE6_ACTIVE_EXHIBITS).map(([zone,ids])=>({id:zone,name:label[zone],count:ids.length,items:ids.map((id,i)=>rows.find(r=>r.id===id))}))},null,2));
console.log('35 3D displays, 28 archived, 63 original records preserved.');
