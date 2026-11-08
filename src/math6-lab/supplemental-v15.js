/** Three additional editable, clearly marked simulations for missing grade-six concepts.
 * Not scans or reproductions of textbook figures; source page deliberately omitted.
 */
export const V15_EXTRA_LABS=Object.freeze([
  {
    id:'mv15-uoc-boi-bang100',grade:6,title:'Ước và bội trên bảng 100',
    group:'Trục số và sơ đồ',engine:'number',variant:'multiples',
    source:{book:'T1',printed_page:null},supplemental:true,
    action:'Chọn số n từ 2 đến 20. Các ô 1–100 là bội của n sẽ sáng lên; số ô bằng phần nguyên của 100/n.',
    defaults:{value:6},true_3d_implemented:false
  },
  {
    id:'mv15-nguyen-to-bang100',grade:6,title:'Số nguyên tố trên bảng 100',
    group:'Trục số và sơ đồ',engine:'number',variant:'primes',
    source:{book:'T1',printed_page:null},supplemental:true,
    action:'Kéo thanh giới hạn từ 2 đến 100, quan sát các số nguyên tố nổi bật theo sàng Eratosthenes.',
    defaults:{value:50},true_3d_implemented:false
  },
  {
    id:'mv15-cong-phan-so-cung-mau',grade:6,title:'Cộng hai phân số cùng mẫu',
    group:'Phân số – số thập phân',engine:'fraction',variant:'addsame',
    source:{book:'T2',printed_page:null},supplemental:true,
    action:'Kéo hai tử số và mẫu số; từng phần tô màu cho thấy cộng tử số, giữ nguyên mẫu số.',
    defaults:{numerator:2,other:3,denominator:8},true_3d_implemented:false
  }
]);
export const V15_EXTRA_ANCHORS=Object.freeze({
 'mv15-uoc-boi-bang100':'g6_12',
 'mv15-nguyen-to-bang100':'g6_12',
 'mv15-cong-phan-so-cung-mau':'g6_12'
});
