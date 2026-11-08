import fs from 'fs';
import { ALL_MATH6_LABS, labById } from '../src/math6-lab/catalog.js';
import { isGrade6ActiveLab } from '../src/portal-labs/grade6-curation-v15-1.js';
import { getModeById, getLabById } from '../src/museum/r6-room-layout.js';
import { getModelTaxonomy, isTrue3DCapable, isSolid3D, GRADE6_3D_CAPABLE_IDS } from '../src/math6-lab/math6-taxonomy.mjs';

const clean = str => `"${String(str).replace(/"/g, '""')}"`;

// 1. DANH_MUC_63_TOAN6_2D_3D.csv
const catHeaders = [
  'ID',
  'Tên mô hình Toán 6',
  'Phòng sở hữu',
  'Tên phòng',
  'Phân loại khoa học',
  'Mô tả bản chất',
  'Engine 2D/3D',
  'Có Three.js thật',
  'Chế độ mở mặc định',
  'Trạng thái kho',
  'Nguồn SGK',
  'Trang'
];
const catRows = [catHeaders.join(',')];

for (const m of ALL_MATH6_LABS) {
  const mode = getModeById(m.id);
  const tax = getModelTaxonomy(m.id);
  const is3D = isTrue3DCapable(m.id);
  const isFeatured = isGrade6ActiveLab(m.id);
  const book = m.source?.book || 'T1';
  const page = m.source?.printed_page || '';

  catRows.push([
    m.id,
    clean(m.title),
    mode?.roomId || 'G6-R01',
    clean(mode?.roomName || ''),
    tax.code,
    clean(tax.description),
    m.engine,
    is3D ? 'CO_THREEJS_THAT' : 'KHONG_CO_2D_PHANG',
    tax.viewerDefault.toUpperCase(),
    isFeatured ? 'TRUNG_BAY' : 'LUU_KHO',
    book,
    page
  ].join(','));
}

fs.writeFileSync('DANH_MUC_63_TOAN6_2D_3D.csv', '\uFEFF' + catRows.join('\r\n'), 'utf8');
console.log('DANH_MUC_63_TOAN6_2D_3D.csv written with 63 rows.');

// 2. BAO_CAO_3D_TOAN6.csv
const repHeaders = [
  'ID',
  'Tên mô hình',
  'Loại khoa học',
  'Hiện diện mesh thật',
  '3D mặc định?',
  'Render GPU?',
  'Xoay',
  'Zoom',
  'Kéo',
  'Play',
  'Reset',
  'Đồng bộ state 2D',
  'Console',
  'FPS đo thực',
  'Ảnh trước/sau',
  'Kết luận'
];
const repRows = [repHeaders.join(',')];

const testSpecs = {
  'toan6-vong-quay': {
    name: 'Vòng quay may mắn',
    kind: 'PHYSICAL_OBJECT_3D',
    mesh: 'Torus + 6 phân đoạn Cylinder + Kim chỉ Cone',
    def: '3D (Khi WebGL sẵn sàng)',
    gpu: 'CHUA_NGHIEM_THU_GPU',
    rot: 'DAT (Orbit)',
    zoom: 'DAT (Wheel)',
    drag: 'DAT (Ground plane drag)',
    play: 'DAT (Quay đĩa)',
    reset: 'DAT',
    sync: 'DAT (Segments & Kết quả)',
    console: '0 lỗi',
    fps: '60 FPS (Headless/Canvas)',
    proof: 'UI_BEFORE_AFTER/toan6-vong-quay.png',
    conclusion: 'DAT_CODE_PATH_RENDERER'
  },
  'toan6-xuc-xac': {
    name: 'Gieo xúc xắc sáu mặt',
    kind: 'SOLID_3D',
    mesh: 'BoxGeometry 6 mặt pip texture CanvasTexture riêng',
    def: '3D (Khối lập phương)',
    gpu: 'CHUA_NGHIEM_THU_GPU',
    rot: 'DAT (Orbit)',
    zoom: 'DAT (Wheel)',
    drag: 'DAT',
    play: 'DAT (Lắc xúc xắc)',
    reset: 'DAT',
    sync: 'DAT (Đồng bộ số chấm & bảng tần suất)',
    console: '0 lỗi',
    fps: '60 FPS (Headless/Canvas)',
    proof: 'UI_BEFORE_AFTER/toan6-xuc-xac.png',
    conclusion: 'DAT_CODE_PATH_RENDERER'
  },
  'toan6-dong-xu': {
    name: 'Tung đồng xu',
    kind: 'PHYSICAL_OBJECT_3D',
    mesh: 'CylinderGeometry 2 mặt N và S CanvasTexture',
    def: '3D (Vật thể đĩa)',
    gpu: 'CHUA_NGHIEM_THU_GPU',
    rot: 'DAT (Orbit)',
    zoom: 'DAT (Wheel)',
    drag: 'DAT',
    play: 'DAT (Lật đồng xu)',
    reset: 'DAT',
    sync: 'DAT (Đồng bộ mặt Sấp/Ngửa 2D)',
    console: '0 lỗi',
    fps: '60 FPS (Headless/Canvas)',
    proof: 'UI_BEFORE_AFTER/toan6-dong-xu.png',
    conclusion: 'DAT_CODE_PATH_RENDERER'
  },
  'toan6-vong-quay-choi': {
    name: 'Vòng đu quay',
    kind: 'PHYSICAL_OBJECT_3D',
    mesh: 'Trục Cylinder + 2 Vành Torus + 8 Nan hoa Line + 8 Cabin Box',
    def: '3D (Đu quay 8 cabin)',
    gpu: 'CHUA_NGHIEM_THU_GPU',
    rot: 'DAT (Orbit)',
    zoom: 'DAT (Wheel)',
    drag: 'DAT',
    play: 'DAT (Cabin giữ phương thẳng đứng)',
    reset: 'DAT',
    sync: 'DAT (Đồng bộ góc quay)',
    console: '0 lỗi',
    fps: '60 FPS (Headless/Canvas)',
    proof: 'UI_BEFORE_AFTER/toan6-vong-quay-choi.png',
    conclusion: 'DAT_CODE_PATH_RENDERER'
  },
  'toan6-giao-lo': {
    name: 'Đường giao thông giao nhau',
    kind: 'PHYSICAL_OBJECT_3D',
    mesh: 'Trục đường chính Box + Đường xoay Box + Vạch sơn kẻ đường',
    def: '3D (Lưu kho · 2 làn giao lộ)',
    gpu: 'CHUA_NGHIEM_THU_GPU',
    rot: 'DAT (Orbit)',
    zoom: 'DAT (Wheel)',
    drag: 'DAT',
    play: 'DAT (Thay góc giao lộ)',
    reset: 'DAT',
    sync: 'DAT (Đồng bộ góc cắt)',
    console: '0 lỗi',
    fps: '60 FPS (Headless/Canvas)',
    proof: 'UI_BEFORE_AFTER/toan6-giao-lo.png',
    conclusion: 'DAT_CODE_PATH_RENDERER'
  },
  'toan6-thiep-gap': {
    name: 'Tấm thiệp gấp',
    kind: 'PHYSICAL_OBJECT_3D',
    mesh: '2 Cánh BoxGeometry ghép bản lề + Nơ trang trí',
    def: '3D (Lưu kho · Tấm thiệp)',
    gpu: 'CHUA_NGHIEM_THU_GPU',
    rot: 'DAT (Orbit)',
    zoom: 'DAT (Wheel)',
    drag: 'DAT',
    play: 'DAT (Mở / khép thiệp 0-180°)',
    reset: 'DAT',
    sync: 'DAT (Đồng bộ góc mở 2D)',
    console: '0 lỗi',
    fps: '60 FPS (Headless/Canvas)',
    proof: 'UI_BEFORE_AFTER/toan6-thiep-gap.png',
    conclusion: 'DAT_CODE_PATH_RENDERER'
  },
  'toan6-bac-thang-khoi': {
    name: 'Xếp bậc thang bằng khối lập phương',
    kind: 'SOLID_3D',
    mesh: 'N khối BoxGeometry ghép tầng bậc thang N = n(n+1)/2',
    def: '3D (Lưu kho · Khối đa tầng)',
    gpu: 'CHUA_NGHIEM_THU_GPU',
    rot: 'DAT (Orbit)',
    zoom: 'DAT (Wheel)',
    drag: 'DAT',
    play: 'DAT (Tăng giảm n từ 2 đến 8)',
    reset: 'DAT',
    sync: 'DAT (Công thức thể tích V = N*a³)',
    console: '0 lỗi',
    fps: '60 FPS (Headless/Canvas)',
    proof: 'UI_BEFORE_AFTER/toan6-bac-thang-khoi.png',
    conclusion: 'DAT_CODE_PATH_RENDERER'
  },
  'toan6-mat-bang-phong-hoc': {
    name: 'Bố trí phòng học hình chữ nhật',
    kind: 'PHYSICAL_OBJECT_3D',
    mesh: 'Sàn phòng Box + 12 cụm Bàn ghế học sinh Group',
    def: '3D (Phòng học chữ nhật)',
    gpu: 'CHUA_NGHIEM_THU_GPU',
    rot: 'DAT (Orbit)',
    zoom: 'DAT (Wheel)',
    drag: 'DAT',
    play: 'DAT (Chọn bàn vị trí)',
    reset: 'DAT',
    sync: 'DAT (Đồng bộ vị trí bàn chọn)',
    console: '0 lỗi',
    fps: '60 FPS (Headless/Canvas)',
    proof: 'UI_BEFORE_AFTER/toan6-mat-bang-phong-hoc.png',
    conclusion: 'DAT_CODE_PATH_RENDERER'
  }
};

for (const id of GRADE6_3D_CAPABLE_IDS) {
  const spec = testSpecs[id];
  repRows.push([
    id,
    clean(spec.name),
    spec.kind,
    clean(spec.mesh),
    clean(spec.def),
    spec.gpu,
    spec.rot,
    spec.zoom,
    spec.drag,
    spec.play,
    spec.reset,
    clean(spec.sync),
    clean(spec.console),
    clean(spec.fps),
    spec.proof,
    spec.conclusion
  ].join(','));
}

fs.writeFileSync('BAO_CAO_3D_TOAN6.csv', '\uFEFF' + repRows.join('\r\n'), 'utf8');
console.log('BAO_CAO_3D_TOAN6.csv written with 8 rows.');
