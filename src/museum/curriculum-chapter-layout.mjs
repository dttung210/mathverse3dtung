/**
 * MATHVERSE R10 – RADIAL CHAPTER GATES & LESSON GALLERIES
 * Bố trí các Cổng Chương tỏa đều theo chu vi phòng học (Radial perimeter distribution)
 * và phân khu Bài học bên trong phòng Triển lãm Chương.
 */

import { getChaptersForGrade } from '../curriculum/curriculum-manifest.mjs?v=r107_v15';

export const CHAPTER_COLOR_PALETTES = [
  '#2dd4bf', // Teal mint
  '#38bdf8', // Sky cyan
  '#818cf8', // Indigo
  '#a78bfa', // Lavender
  '#f472b6', // Rose
  '#fb923c', // Tangerine
  '#facc15', // Amber gold
  '#4ade80', // Emerald green
  '#22d3ee', // Bright turquoise
  '#e879f9'  // Violet pink
];

/**
 * Tính toán tọa độ và hướng quay cho các Cổng Chương trong sảnh Lớp học.
 * Các cổng được phân bổ hình cánh cung / vành khuyên tỏa đều 220° quanh tâm phòng.
 */
export function planRadialChapterGates(grade, config) {
  const chapters = getChaptersForGrade(grade);
  if (!chapters || !chapters.length) return [];

  const cx = config.x;
  const isPos = config.zSide === 1;
  const cz = isPos ? 28.0 : -28.0;
  const zSide = isPos ? 1 : -1;

  const N = chapters.length;
  const spanDeg = N <= 6 ? 180 : 220;
  const halfSpan = spanDeg / 2;
  const Rx = 13.2; // Bán kính ngang (m)
  const Rz = 14.6; // Bán kính dọc (m)

  return chapters.map((ch, idx) => {
    const frac = N > 1 ? idx / (N - 1) : 0.5;
    const angleDeg = -halfSpan + frac * spanDeg;
    const rad = (angleDeg * Math.PI) / 180;

    const gx = cx + Rx * Math.sin(rad);
    const gz = cz + zSide * Rz * Math.cos(rad);

    // Hướng nhìn của cổng: mặt trước cổng quay vào tâm phòng học
    const rotY = Math.atan2(cx - gx, cz - gz);

    const totalModels = ch.lessons.reduce((sum, les) => sum + les.models.length, 0);
    const accent = CHAPTER_COLOR_PALETTES[idx % CHAPTER_COLOR_PALETTES.length];

    return {
      index: idx,
      chapterId: ch.id,
      chapterNumber: ch.number,
      chapterTitle: ch.title,
      volume: ch.volume,
      totalLessons: ch.lessons.length,
      totalModels,
      grade,
      x: Number(gx.toFixed(2)),
      y: 0,
      z: Number(gz.toFixed(2)),
      rotY: Number(rotY.toFixed(3)),
      accent,
      lessons: ch.lessons
    };
  });
}

/**
 * Bố trí các Cổng Phòng Chuyên Đề / Chương trong lớp học theo hai cánh cung đối xứng hai bên,
 * chừa hành lang trung tâm thông thoáng nhìn thẳng lên bảng xanh và bục giảng (không chắn tầm nhìn 3D).
 */
export function planClassroomPortalArc(grade, config, gateCount = 5) {
  const chapters = getChaptersForGrade(grade) || [];
  const cx = config.x;
  const zSide = config.zSide === 1 ? 1 : -1;

  // Tọa độ (dx, dzAbs) dọc hai cánh trái/phải của phòng học (rộng 34m, sâu 40m, cửa ở z=8, bảng ở z=48).
  // Giữ khoảng trống chính giữa [-5.4m .. +5.8m] để người chơi đứng ở z=19 nhìn thẳng thấy toàn bộ bảng xanh.
  const presets = {
    4: [
      [-9.2, 23.8],
      [-5.5, 31.2],
      [5.5, 31.2],
      [9.2, 23.8]
    ],
    5: [
      [-10.2, 22.0],
      [-7.8, 28.5],
      [-5.4, 35.0],
      [5.8, 32.2],
      [9.4, 24.2]
    ],
    6: [
      [-11.6, 20.5],
      [-8.8, 27.5],
      [-5.8, 34.5],
      [5.8, 34.5],
      [8.8, 27.5],
      [11.6, 20.5]
    ],
    8: [
      [-13.2, 16.5],
      [-10.8, 23.2],
      [-8.2, 29.9],
      [-5.6, 36.6],
      [5.6, 36.6],
      [8.2, 29.9],
      [10.8, 23.2],
      [13.2, 16.5]
    ],
    9: [
      [-13.8, 14.5],
      [-11.8, 21.0],
      [-9.6, 27.5],
      [-7.5, 34.0],
      [-5.5, 40.5],
      [5.6, 36.8],
      [8.2, 30.0],
      [10.8, 23.2],
      [13.4, 16.4]
    ]
  };

  const slots = presets[gateCount] || [];
  const focusX = cx;
  const focusZ = zSide * 19.0; // Vị trí người chơi đứng quan sát khi vào lớp

  return Array.from({ length: gateCount }, (_, idx) => {
    const ch = chapters[idx] || chapters[chapters.length - 1] || {};
    let gx, gz;
    if (slots[idx]) {
      gx = cx + slots[idx][0];
      gz = zSide * slots[idx][1];
    } else {
      const frac = gateCount > 1 ? idx / (gateCount - 1) : 0.5;
      const angleDeg = -75 + frac * 150;
      const rad = (angleDeg * Math.PI) / 180;
      gx = cx + 11.5 * Math.sin(rad);
      gz = zSide * (24.0 + 10.5 * Math.cos(rad));
    }

    const rotY = Math.atan2(focusX - gx, focusZ - gz);
    const totalModels = Array.isArray(ch.lessons)
      ? ch.lessons.reduce((sum, les) => sum + les.models.length, 0)
      : 0;
    const accent = CHAPTER_COLOR_PALETTES[idx % CHAPTER_COLOR_PALETTES.length];

    return {
      index: idx,
      chapterId: ch.id || `G${grade}-CH0${idx + 1}`,
      chapterNumber: ch.number || String(idx + 1),
      chapterTitle: ch.title || `Chuyên đề ${idx + 1}`,
      volume: ch.volume || 1,
      totalLessons: Array.isArray(ch.lessons) ? ch.lessons.length : 0,
      totalModels,
      grade,
      x: Number(gx.toFixed(2)),
      y: 0,
      z: Number(gz.toFixed(2)),
      rotY: Number(rotY.toFixed(3)),
      accent
    };
  });
}
