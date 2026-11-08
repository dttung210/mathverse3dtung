import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getAllCurriculumModels } from '../src/curriculum/curriculum-manifest.mjs';
import { getGuidedDiscoveryPlan } from '../src/curriculum/guided-discovery.mjs';
import * as THREE from '../vendor/three.module.js';
import { LAB_BY_ID, getChapterRoomsForGrade, getRoomById } from '../src/museum/r6-room-layout.js';
import { getLabDoorsForRoom } from '../src/museum/r68-unified-labs.mjs';
import { planR73RoomGallery } from '../src/museum/r73-room-gallery-plan.mjs';
import { planClassroomPortalArc } from '../src/museum/curriculum-chapter-layout.mjs';
import { createGrade6Gate } from '../src/museum/grade6-gates-v15.js';
import { createModeExhibit } from '../src/museum/r67-mode-exhibits.mjs';

test('R11 Guided Discovery: Cả 310 mô hình từ Lớp 6 đến Lớp 12 đều có Nhiệm vụ Khám phá 3 Bước đầy đủ', () => {
  const models = getAllCurriculumModels();
  assert.equal(models.length, 310, 'Tổng số mô hình trong chương trình phải đúng 310');

  for (const m of models) {
    const plan = getGuidedDiscoveryPlan(m.id, m);
    assert.ok(plan.step1 && plan.step1.length > 15, `Mô hình ${m.id} có Bước 1 (Dự đoán & Thao tác)`);
    assert.ok(plan.step2 && plan.step2.length > 15, `Mô hình ${m.id} có Bước 2 (Kiểm chứng bất biến)`);
    assert.ok(plan.step3 && plan.step3.length > 15, `Mô hình ${m.id} có Bước 3 (Kết luận định lý SGK)`);
    assert.ok(plan.lessonLabel.includes(`SGK Toán ${m.targetGrade}`), `Mô hình ${m.id} gắn đúng nhãn SGK Toán ${m.targetGrade}`);
  }
});

test('R11 3D Pedestal Audit: Cả 310 mô hình trên bục 3D đều có hàm chuyển động animate(t) và các hình tứ giác Lớp 8 hoàn toàn phân biệt', () => {
  let totalChecked = 0;
  const quadCounts = {};

  for (const l of LAB_BY_ID.values()) {
    for (const m of l.modes) {
      assert.equal(m.labId, l.labId, `Mode ${m.id} phải mang đúng labId=${l.labId}`);
      const grp = createModeExhibit(m.grade, m);
      let meshCount = 0;
      grp.traverse(obj => { if (obj.isMesh || obj.isLine) meshCount++; });
      assert.ok(grp && meshCount >= 1, `Mode ${m.id} tạo nhóm 3D hợp lệ`);
      assert.equal(typeof grp.userData.animate, 'function', `Mode ${m.id} có hàm chuyển động 3D userData.animate(t)`);
      grp.userData.animate(1.25);
      if (m.id.startsWith('8-02-C')) {
        quadCounts[m.id] = meshCount;
      }
      totalChecked++;
    }
  }

  assert.equal(totalChecked, 310, 'Đã kiểm tra đủ 310/310 mô hình 3D trên bục');
  // 5 mô hình tứ giác lớp 8 (Hình thang cân, Hình bình hành, Hình chữ nhật, Hình thoi, Hình vuông) không được dùng chung 1 tam giác
  assert.ok(quadCounts['8-02-C01'] >= 10, 'Hình thang cân có đầy đủ cạnh đáy, cạnh bên, đường chéo');
  assert.ok(quadCounts['8-02-C03'] >= 18, 'Hình chữ nhật có đầy đủ 4 ký hiệu góc vuông và 2 đường chéo');
  assert.ok(quadCounts['8-02-C04'] >= 12, 'Hình thoi có 2 đường chéo vuông góc tại tâm');
  assert.notEqual(quadCounts['8-02-C01'], quadCounts['8-02-C03'], 'Hình thang cân và Hình chữ nhật có cấu trúc 3D khác nhau');
});

test('R11 Dual-Mode Studio & In-World Holo-Stage: Đấu nối đầy đủ trong index.html, main.js, CurriculumExplorer.js và r6-spatial-manager.js', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const explorer = fs.readFileSync(new URL('../src/curriculum/CurriculumExplorer.js', import.meta.url), 'utf8');
  const spatial = fs.readFileSync(new URL('../src/museum/r6-spatial-manager.js', import.meta.url), 'utf8');

  assert.match(html, /r11-adaptive-studio\.css/);
  assert.match(html, /btn-studio-launchpad/);
  assert.match(main, /new StudioLaunchpad/);
  assert.match(main, /new HoloStageInspector/);
  assert.match(explorer, /mountGuidedDiscoveryCard/);
  assert.match(spatial, /_applyHoloExplodeAndMaterial/);
});

test('R11 58 Textbook Chapter Gates: Toàn bộ 58 Chương SGK từ Lớp 6 đến Lớp 12 đều có Cổng 3D mang đúng tên Chương và mở vào Phòng Triển lãm Bài học', () => {
  const museumSrc = fs.readFileSync(new URL('../src/museum.js', import.meta.url), 'utf8');
  assert.match(museumSrc, /CHƯƠNG \$\{rp\.chapterNumber\} · TẬP \$\{rp\.volume \|\| 1\}/);
  assert.doesNotMatch(museumSrc, /const chapterTitle = roomMeta \? roomMeta\.name/);

  const roomCfgs = {
    6: { x: -54, zSide: 1 },
    7: { x: -54, zSide: -1 },
    8: { x: -18, zSide: 1 },
    9: { x: -18, zSide: -1 },
    10: { x: 18, zSide: 1 },
    11: { x: 18, zSide: -1 },
    12: { x: 54, zSide: 1 }
  };

  let totalChapters = 0;
  let totalLessonZones = 0;
  let totalModels = 0;

  for (const grade of [6, 7, 8, 9, 10, 11, 12]) {
    const chRooms = getChapterRoomsForGrade(grade);
    const arc = planClassroomPortalArc(grade, roomCfgs[grade], chRooms.length);
    assert.equal(arc.length, chRooms.length, `Lớp ${grade} có đủ ${chRooms.length} cổng chương trên sơ đồ 2 cánh`);

    for (let i = 0; i < chRooms.length; i++) {
      const ch = chRooms[i];
      const gatePos = arc[i];
      assert.equal(gatePos.chapterId, ch.roomId);
      assert.equal(gatePos.chapterTitle, ch.title);
      assert.ok(Math.abs(gatePos.x - roomCfgs[grade].x) >= 5.2, `Cổng ${ch.roomId} không chắn hành lang giữa phòng`);

      if (grade === 6) {
        const g6Gate = createGrade6Gate(
          THREE,
          { id: ch.roomId, accent: '#1abc9c', label: ch.title, short: `CHƯƠNG ${ch.number}` },
          i,
          roomCfgs[6],
          () => new THREE.Group()
        );
        assert.ok(g6Gate && g6Gate.group, `createGrade6Gate hoạt động cho cổng Chương thứ ${i + 1} của Lớp 6`);
      }

      const resolved = getRoomById(ch.roomId);
      assert.ok(resolved && resolved.isChapterRoom, `getRoomById('${ch.roomId}') trả về đúng Phòng Chương SGK`);
      const labs = getLabDoorsForRoom(ch.roomId);
      assert.ok(labs.length >= 1, `Chương ${ch.roomId} có ít nhất 1 Bài học`);
      const plan = planR73RoomGallery(resolved, roomCfgs[grade], labs);
      assert.equal(plan.zones.length, labs.length);
      assert.equal(plan.modeCount, ch.modeCount);

      totalChapters++;
      totalLessonZones += labs.length;
      totalModels += plan.modeCount;
    }
  }

  assert.equal(totalChapters, 58, 'Tổng số cổng Chương toàn hệ thống là 58 Chương SGK');
  assert.equal(totalLessonZones, 166, 'Tổng số khu Bài học (Lesson Zones) là 166 Bài SGK');
  assert.equal(totalModels, 310, 'Tổng số bục mô hình trong 58 Chương là 310 mô hình');
});
