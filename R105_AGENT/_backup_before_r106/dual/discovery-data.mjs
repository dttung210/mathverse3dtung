import { UNESCO_HERITAGE } from './discovery-unesco-data.mjs';
/** MATHVERSE DISCOVERY R93 + R95: nội dung tuyển chọn, tách hoàn toàn với SGK/Lab/Museum gốc.
 * Các hình 3D là MÔ HÌNH TOÁN HỌC LÝ TƯỞNG HÓA, không phải bản vẽ kiến trúc gốc.
 * Ảnh lấy từ Wikimedia Commons khi có Internet và đã xác minh giấy phép;
 * các mục publishReady=false hiển thị minh họa vector Toán học kèm nhãn trạng thái rõ ràng.
 */
import { R95_LANDMARKS_RAW, R95_GALLERY_RAW } from './discovery-r95/r95-catalog-data.mjs';
import {
  MAX_GALLERY_PHYSICAL_FRAMES,
  isReadyToShowPhotograph,
  isReadyToPublish,
  mergeByIdPreserveExisting
} from './discovery-r95/ui/catalog-merge-r95.mjs';

const commons = (file) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file).replace(/%2F/g, '/')}?width=960`;
const page = (file) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file).replace(/%20/g, '_')}`;
const media = (file, author, license) => Object.freeze({
  file,
  author,
  license,
  photo: commons(file),
  source: page(file)
});

export function normalizeViText(str = '') {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function groupGalleryByCollection(exhibits = []) {
  const map = new Map();
  for (const item of exhibits) {
    const col = item.collection || 'Khác';
    if (!map.has(col)) map.set(col, []);
    map.get(col).push(item);
  }
  return map;
}

export function getGallerySliceForFrames(collectionItems = []) {
  return collectionItems.slice(0, MAX_GALLERY_PHYSICAL_FRAMES);
}

function adaptBaseLandmark(item, continent, classesStr, latex) {
  return Object.freeze({
    ...item,
    title: item.name,
    continent,
    latitude: item.lat,
    longitude: item.lng,
    classes: classesStr,
    classesLabel: item.grade,
    latex,
    publishReady: true,
    geometryReviewRequired: false,
    coordinatesStatus: 'verified_reference',
    sourceStatus: 'verified_wikimedia_commons',
    sourceUrl: item.media.source,
    sourceName: 'Wikimedia Commons',
    geometry: Object.freeze({
      modelType: item.kind,
      concepts: Object.freeze([item.shape]),
      latex,
      fidelity: 'mathematical_idealization_not_architectural_scan',
      note: 'Mô hình toán học lý tưởng hóa — không phải bản quét kiến trúc thực tế.'
    }),
    photo: Object.freeze({
      status: 'approved',
      url: item.media.photo,
      localPath: '/dual/discovery-assets/earth-fallback.png',
      author: item.media.author,
      license: item.media.license,
      commonsPage: item.media.source,
      attributionText: `${item.media.author} (${item.media.license})`
    })
  });
}

function adaptBaseArtwork(item, classesStr, latex) {
  return Object.freeze({
    ...item,
    title: item.name,
    collection: 'Bộ sưu tập trước đây',
    classes: classesStr,
    classesLabel: item.grade,
    topics: item.math,
    latex,
    publishReady: true,
    geometryReviewRequired: false,
    photoApproved: true,
    geometry2DApproved: true,
    geometry3DApproved: Boolean(item.model3d),
    fidelityNote: 'Mô hình hình học khớp cấu trúc vật thể — đối chiếu ảnh thực tế, không phải bản vẽ CAD đo đạc của một thiết bị cụ thể.',
    photo: Object.freeze({
      status: 'approved',
      url: item.media.photo,
      localPath: '/dual/discovery-assets/earth-fallback.png',
      author: item.media.author,
      license: item.media.license,
      commonsPage: item.media.source,
      attributionText: `${item.media.author} (${item.media.license})`
    })
  });
}

export const DISCOVERY_LANDMARKS = Object.freeze([
  adaptBaseLandmark({
    id: 'giza', name: 'Đại kim tự tháp Giza', country: 'Ai Cập', lat: 29.9792, lng: 31.1342,
    history: 'Đại kim tự tháp do người Ai Cập cổ đại xây dựng làm lăng mộ cho pharaon Khufu, vào khoảng thế kỷ XXVI TCN.',
    math: 'Khối chóp có đáy gần hình vuông, các mặt bên gần hình tam giác. Mô hình Toán dùng hình chóp tứ giác đều lý tưởng hóa.',
    grade: 'Lớp 6, 8, 10–12', shape: 'Hình chóp tứ giác đều (lý tưởng hóa)', kind: 'pyramid',
    media: media('Great Pyramid of Giza - Pyramid of Khufu.jpg', 'Douwe C. van der Zee', 'CC BY-SA 4.0')
  }, 'Châu Phi', '6, 8, 10, 11, 12', 'V = \\frac{1}{3} a^2 h'),
  adaptBaseLandmark({
    id: 'sydney', name: 'Nhà hát Opera Sydney', country: 'Australia', lat:-33.8568, lng: 151.2153,
    history: 'Nhà hát Opera Sydney do kiến trúc sư Jørn Utzon thiết kế, chính thức khánh thành năm 1973.',
    math: 'Những mái vỏ được nghiên cứu dựa trên hình học của các phần mặt cầu. Mô hình chỉ minh họa cấu trúc mặt cầu, không sao chép mái thật.',
    grade: 'Lớp 9–12', shape: 'Các mảnh mặt cầu (mô hình ý tưởng)', kind: 'shells',
    media: media('Sydney Opera House in sunlight.jpg', 'Tác giả ảnh trên trang Wikimedia Commons', 'Giấy phép ghi tại trang nguồn')
  }, 'Châu Đại Dương', '9, 10, 11, 12', 'x^2 + y^2 + z^2 = R^2'),
  adaptBaseLandmark({
    id: 'eiffel', name: 'Tháp Eiffel', country: 'Pháp', lat: 48.8584, lng: 2.2945,
    history: 'Tháp Eiffel được xây dựng tại Paris cho Triển lãm Thế giới năm 1889.',
    math: 'Kết cấu giàn kim loại gồm nhiều tam giác liên kết. Mô hình đơn giản hóa nhằm làm nổi bật các thanh và tam giác.',
    grade: 'Lớp 6–12', shape: 'Giàn tam giác, đối xứng', kind: 'truss',
    media: media('MG-Paris-Eiffel Tower.jpg', 'Mattgirling', 'Giấy phép ghi tại trang nguồn')
  }, 'Châu Âu', '6, 7, 8, 9, 10, 11, 12', '\\sum \\widehat{A_i} = 180^\\circ'),
  adaptBaseLandmark({
    id: 'golden', name: 'Cầu Golden Gate', country: 'Hoa Kỳ', lat: 37.8199, lng: -122.4783,
    history: 'Cầu treo Golden Gate nối San Francisco với hạt Marin, được khánh thành năm 1937.',
    math: 'Mô hình cầu treo lý tưởng hóa gồm các tháp, dây cáp cong, thanh treo và mặt cầu. Đường cáp được làm gần đúng phục vụ trực quan.',
    grade: 'Lớp 7–12', shape: 'Đường cong, tam giác, trục đối xứng', kind: 'bridge',
    media: media('Golden Gate Bridge, San Francisco 07.jpg', 'Mike Peel (www.mikepeel.net)', 'CC BY-SA 4.0')
  }, 'Châu Mỹ', '7, 8, 9, 10, 11, 12', 'y = a x^2 + h_0')
]);

export const DISCOVERY_ARTWORKS = Object.freeze([
  adaptBaseArtwork({
    id: 'traffic', name: 'Đèn giao thông', math: 'Hình chữ nhật, hình tròn và hình hộp chữ nhật', grade: 'Toán 6–8',
    explanation: 'Ảnh thực tế cho thấy vỏ hộp đèn, tấm chắn nền và ba ô tín hiệu tròn có nắp che nắng. Bật hình 2D để xem hình chữ nhật và ba đường tròn đồng trục; bật 3D để xoay thân đèn hình hộp chữ nhật kèm nắp che và mặt đèn khối trụ.',
    kind: 'traffic', model3d: true, media: media('Modern_British_LED_Traffic_Light.jpg', 'Unisouth', 'CC BY 3.0')
  }, '6, 7, 8', 'S = a \\cdot b,\\quad C = 2\\pi R'),
  adaptBaseArtwork({
    id: 'fish', name: 'Hồ cá và tập hợp', math: 'Tập hợp, phần tử và tập con', grade: 'Toán 6',
    explanation: 'Quan sát ảnh hồ cá, rồi xem hình minh họa gồm 5 con cá ký hiệu c₁,…,c₅. Đây là mô hình ví dụ, KHÔNG phải phép đếm số cá trong ảnh thực.',
    kind: 'fish', model3d: true, media: media('Fish (2).jpg', 'Fitrah 9131', 'CC BY 4.0')
  }, '6', 'A = \\{c_1, c_2, c_3, c_4, c_5\\},\\quad B \\subset A'),
  adaptBaseArtwork({
    id: 'wheel', name: 'Bánh xe đạp', math: 'Đường tròn, tâm, bán kính, đường kính', grade: 'Toán 6–9',
    explanation: 'Hình bánh xe được lý tưởng hóa thành đường tròn; bán kính là đoạn từ tâm đến vành, đường kính dài gấp đôi bán kính.',
    kind: 'wheel', model3d: true, media: media('A bicycle wheel.jpg', 'Moebiusuibeom-en', 'CC BY-SA 4.0')
  }, '6, 7, 8, 9', 'd = 2R,\\quad C = 2\\pi R'),
  adaptBaseArtwork({
    id: 'clock', name: 'Đồng hồ và góc', math: 'Góc, số đo góc, đường tròn', grade: 'Toán 6–9',
    explanation: 'Hai kim đồng hồ tạo thành một góc có thể đo bằng độ. Mô hình ví dụ hiển thị lúc 3 giờ, góc nhỏ giữa hai kim là 90°.',
    kind: 'clock', model3d: false, media: media('The clock tower.jpg', 'Manu.lakshman', 'CC BY-SA 4.0')
  }, '6, 7, 8, 9', '\\widehat{AOB} = 90^\\circ')
]);

function expandClassesString(raw) {
  const s = String(raw || '');
  const nums = (s.match(/\d+/g) || []).map(Number);
  if (nums.length === 2 && nums[1] >= nums[0]) {
    const out = [];
    for (let g = nums[0]; g <= nums[1]; g++) out.push(g);
    return out.join(', ');
  }
  return s;
}

function adaptR95Landmark(raw) {
  const concepts = raw.geometry?.concepts || [];
  const shapeLabel = concepts.join(' • ') || raw.geometry?.modelType || 'Mô hình hình học lý tưởng hóa';
  const gradeLabel = String(raw.classes || '6–12').startsWith('Lớp') ? raw.classes : `Lớp ${raw.classes || '6–12'}`;
  const isApprovedPhoto = isReadyToShowPhotograph(raw);
  const historyNote = raw.publishReady
    ? (raw.historicalBiography || raw.shortIntro)
    : `${raw.shortIntro || raw.title} — [Trạng thái: Đang kiểm chứng hồ sơ lịch sử & tọa độ tham khảo (${raw.latitude}°, ${raw.longitude}°); chỉ hiển thị mô hình Toán học lý tưởng hóa].`;
  return Object.freeze({
    ...raw,
    name: raw.title,
    lat: Number(raw.latitude),
    lng: Number(raw.longitude),
    classes: expandClassesString(raw.classes),
    classesLabel: gradeLabel,
    grade: gradeLabel,
    shape: `${shapeLabel} (lý tưởng hóa)`,
    kind: raw.geometry?.modelType || 'r95_landmark',
    latex: raw.geometry?.latex || '',
    history: historyNote,
    math: `${shapeLabel}. Công thức: ${raw.geometry?.latex || ''}. ${raw.geometry?.note || 'Mô hình toán học lý tưởng hóa — không phải bản quét kiến trúc thực tế.'}`,
    model3d: true,
    media: Object.freeze({
      file: raw.svgPath || '',
      author: isApprovedPhoto ? raw.photo.author : 'Minh họa vector Toán học R95 (Đang bổ sung ảnh thực tế có giấy phép)',
      license: isApprovedPhoto ? raw.photo.license : 'Vector nội bộ R95 — Không phải ảnh chụp thực tế',
      photo: isApprovedPhoto ? raw.photo.localPath : `/dual/discovery-r95/${raw.svgPath}`,
      source: raw.sourceUrl || 'https://commons.wikimedia.org/'
    })
  });
}

function adaptR95Artwork(raw) {
  const gradeLabel = String(raw.classes || '6–12').startsWith('Toán') ? raw.classes : `Toán ${raw.classes || '6–12'}`;
  const isApprovedPhoto = isReadyToShowPhotograph(raw);
  const has3D = Boolean(raw.glbPath);
  return Object.freeze({
    ...raw,
    name: raw.title,
    math: raw.topics || raw.title,
    grade: gradeLabel,
    classes: expandClassesString(raw.classes),
    classesLabel: gradeLabel,
    kind: raw.diagramType || 'r95_exhibit',
    model3d: has3D,
    photoApproved: isApprovedPhoto,
    geometry2DApproved: Boolean(raw.svgPath),
    geometry3DApproved: has3D,
    fidelityNote: isApprovedPhoto
      ? 'Mô hình hình học khớp cấu trúc vật thể.'
      : 'Sơ đồ toán học lý tưởng hóa — đang chờ bổ sung ảnh thực tế có giấy phép.',
    explanation: `${raw.topics}. Công thức: ${raw.latex || ''}. ${raw.mathematicalClaim || 'Hình vẽ vector minh họa một mô hình Toán lý tưởng, không phải ảnh chụp vật thể thật.'}`,
    media: Object.freeze({
      file: raw.svgPath || '',
      author: isApprovedPhoto ? raw.photo.author : 'Sơ đồ vector Toán học R95 (Đang bổ sung ảnh thực tế có giấy phép)',
      license: isApprovedPhoto ? raw.photo.license : 'Vector nội bộ R95 — Không phải ảnh chụp thực tế',
      photo: isApprovedPhoto ? raw.photo.localPath : `/dual/discovery-r95/${raw.svgPath}`,
      source: raw.photo?.commonsPage || 'https://commons.wikimedia.org/'
    })
  });
}

export const DISCOVERY_LANDMARKS_R95 = Object.freeze(R95_LANDMARKS_RAW.map(adaptR95Landmark));
export const DISCOVERY_ARTWORKS_R95 = Object.freeze(R95_GALLERY_RAW.map(adaptR95Artwork));

export const DISCOVERY_ALL_LANDMARKS = Object.freeze(
  mergeByIdPreserveExisting(DISCOVERY_LANDMARKS, DISCOVERY_LANDMARKS_R95).items
);

export const DISCOVERY_ALL_ARTWORKS = Object.freeze(
  mergeByIdPreserveExisting(DISCOVERY_ARTWORKS, DISCOVERY_ARTWORKS_R95).items
);

export const DISCOVERY_APPROVED_ARTWORKS = Object.freeze(
  DISCOVERY_ALL_ARTWORKS.filter((x) => x.photoApproved && (x.geometry2DApproved || x.geometry3DApproved))
);

export const DISCOVERY_CONTINENTS = Object.freeze([
  'all',
  'Châu Âu',
  'Châu Á',
  'Châu Mỹ',
  'Châu Phi',
  'Châu Đại Dương'
]);

export const DISCOVERY_COLLECTIONS = Object.freeze([
  'Hình phẳng quanh em',
  'Khối hình đời thường',
  'Đối xứng và hoa văn',
  'Số học và tập hợp',
  'Đo lường và tỉ lệ',
  'Thống kê và xác suất',
  'Bộ sưu tập trước đây'
]);

export const discoveryById = (id) =>
  [...DISCOVERY_ALL_LANDMARKS, ...DISCOVERY_ALL_ARTWORKS, ...UNESCO_HERITAGE].find((it) => it.id === id) || null;

export function filterLandmarks(items, { text = '', continent = 'all', classes = 'all', limit = 100 } = {}) {
  const q = normalizeViText(text);
  return items
    .filter((x) => {
      const hay = [
        x.title,
        x.name,
        x.country,
        x.continent,
        x.shape,
        ...(x.geometry?.concepts || [])
      ]
        .map(normalizeViText)
        .join(' ');
      if (q && !hay.includes(q)) return false;
      if (continent !== 'all' && x.continent !== continent) return false;
      if (classes !== 'all' && !String(x.classes).includes(String(classes))) return false;
      return true;
    })
    .slice(0, limit);
}

export {
  MAX_GALLERY_PHYSICAL_FRAMES,
  isReadyToShowPhotograph,
  isReadyToPublish,
  mergeByIdPreserveExisting
};

export function validateDiscoveryData() {
  const ids = new Set();
  for (const item of [...DISCOVERY_ALL_LANDMARKS, ...DISCOVERY_ALL_ARTWORKS]) {
    if (!item.id || ids.has(item.id) || !item.name || !item.math || !item.media?.source) {
      throw new Error('Dữ liệu Discovery không hợp lệ: ' + item?.id);
    }
    ids.add(item.id);
    if ('lat' in item && (!Number.isFinite(item.lat) || Math.abs(item.lat) > 90 || !Number.isFinite(item.lng) || Math.abs(item.lng) > 180)) {
      throw new Error('Tọa độ sai: ' + item.id);
    }
  }
  return {
    landmarks: DISCOVERY_LANDMARKS.length,
    artworks: DISCOVERY_ARTWORKS.length
  };
}

export function validateDiscoveryR95Data() {
  validateDiscoveryData();
  return {
    baseLandmarks: DISCOVERY_LANDMARKS.length,
    r95Landmarks: DISCOVERY_LANDMARKS_R95.length,
    allLandmarks: DISCOVERY_ALL_LANDMARKS.length,
    baseArtworks: DISCOVERY_ARTWORKS.length,
    r95Artworks: DISCOVERY_ARTWORKS_R95.length,
    allArtworks: DISCOVERY_ALL_ARTWORKS.length
  };
}
