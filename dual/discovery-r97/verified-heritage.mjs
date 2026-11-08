/** R97 curated geometric features: not architecturally faithful scans or full reconstructions.
 * Each model exposes only verified structural properties; the rest is deliberately omitted.
 */
export const R97_VERIFIED_UNESCO_MODELS = Object.freeze({
  unesco_giza: Object.freeze({
    subject:'Đại kim tự tháp Khufu',type:'tham_so_hinh_hoc',
    components:['Đáy vuông','Bốn mặt tam giác','Chiều cao nguyên thủy và cạnh đáy xấp xỉ'],
    dimensions:{baseMeters:230.3,originalHeightMeters:146.5,ratioHeightBase:146.5/230.3},
    source:'https://whc.unesco.org/en/list/86/',
    dimensionalSource:'https://www.nationalgeographic.com/history/article/great-pyramid-giza',
    caveat:'Hình chóp lý tưởng hóa, bỏ qua độ mòn, hành lang, lớp đá, sai lệch bề mặt; KHÔNG phải bản quét chính xác kim tự tháp.'
  }),
  unesco_borobudur: Object.freeze({
    subject:'Cấu trúc nền Borobudur',type:'tham_so_hinh_hoc',
    components:['5 nền vuông đồng tâm','3 nền tròn','Đỉnh tháp trung tâm'],
    parameters:{squareTerraces:5,circularTerraces:3},
    source:'https://whc.unesco.org/en/list/592/',
    caveat:'GLB mô phỏng 5 tầng vuông và 3 tầng tròn, KHÔNG phải bản dựng tượng Phật, phù điêu hoặc cấu trúc thực địa chính xác.'
  }),
  unesco_parthenon: Object.freeze({
    subject:'Lưới cột đền Parthenon',type:'tham_so_hinh_hoc',
    components:['8 cột cạnh ngắn','17 cột cạnh dài'],
    parameters:{frontColumns:8,sideColumns:17},
    source:'https://www.ysma.gr/en/monuments/parthenon/',
    caveat:'GLB là sơ đồ bố trí cột, không phải bản phục dựng mái, mặt đứng, kiến trúc hay các chi tiết thực tế.'
  })
});
export const R97_VERIFIED_IDS = Object.freeze(Object.keys(R97_VERIFIED_UNESCO_MODELS));
export function isR97VerifiedGeometry(id){return Object.hasOwn(R97_VERIFIED_UNESCO_MODELS,id);}
export function verifiedGeometryNote(id){return R97_VERIFIED_UNESCO_MODELS[id]?.caveat||'Chưa có mô hình hình học được xác minh.';}
