import fs from 'fs';
import { ALL_MATH6_LABS, LAB_TO_EXHIBIT, labById } from '../src/math6-lab/catalog.js';
import { isGrade6ActiveLab } from '../src/portal-labs/grade6-curation-v15-1.js';
import { getModeById, getLabById } from '../src/museum/r6-room-layout.js';
import { getModelTaxonomy, isTrue3DCapable } from '../src/math6-lab/math6-taxonomy.mjs';

const headers = [
  'ID',
  'Tên mô hình Toán 6',
  'Phòng sở hữu',
  'Tên phòng',
  'Đơn vị Lab',
  'Bục bảo tàng (Anchor)',
  'Nhóm bài học SGK',
  'Nguồn SGK',
  'Trang SGK',
  'Phân loại chuyên môn R6.4',
  'Khả năng Three.js 3D',
  'Chế độ hiển thị mặc định',
  'Trạng thái'
];

const rows = [headers.join(',')];

for (const m of ALL_MATH6_LABS) {
  const mode = getModeById(m.id);
  const lab = getLabById(m.id);
  const tax = getModelTaxonomy(m.id);
  const is3D = isTrue3DCapable(m.id);
  const isFeatured = isGrade6ActiveLab(m.id);
  const anchor = LAB_TO_EXHIBIT[m.id] || '';
  const room = mode?.roomId || 'G6-R01';
  const roomName = mode?.roomName || '';
  const book = m.source?.book || 'T1';
  const page = m.source?.printed_page || '';

  const clean = str => `"${String(str).replace(/"/g, '""')}"`;

  const row = [
    m.id,
    clean(m.title),
    room,
    clean(roomName),
    m.id,
    anchor,
    clean(m.group),
    book,
    page,
    tax.code,
    is3D ? 'CO_BODUNG_THREEJS' : 'KHONG_AP_DUNG_2D_PHANG',
    tax.viewerDefault,
    isFeatured ? 'TRUNG_BAY' : 'LUU_KHO'
  ];
  rows.push(row.join(','));
}

fs.writeFileSync('BANG_MAP_TOAN6_63_LAB.csv', '\uFEFF' + rows.join('\r\n'), 'utf8');
console.log('BANG_MAP_TOAN6_63_LAB.csv successfully generated with', rows.length - 1, 'items.');
