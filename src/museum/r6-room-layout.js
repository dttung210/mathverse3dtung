/**
 * MATHVERSE R6 - THEMATIC ROOM & LAB HIERARCHY REGISTRY
 * Structure: Đại sảnh -> 7 Khối lớp -> 34 Phòng chuyên đề -> 130 Đơn vị Lab -> 310 Chế độ / Mô hình
 */

import { R6_MANIFEST_DATA } from './r6-room-manifest.js?v=r107_v15';
import { CURRICULUM_CHAPTERS_MANIFEST } from '../curriculum/curriculum-manifest.mjs?v=r107_v15';

export const R6_MANIFEST = R6_MANIFEST_DATA;
export const GRADES_LIST = [6, 7, 8, 9, 10, 11, 12];

// Flattened lookup tables for instant O(1) query
export const ROOMS_BY_GRADE = new Map();
export const ROOM_BY_ID = new Map();
export const LAB_BY_ID = new Map();
export const MODE_BY_ID = new Map();
export const MODES_BY_ROOM = new Map();

// Textbook Chapter & Lesson lookup tables (58 Chapters across Grades 6–12)
export const CHAPTER_ROOMS_BY_GRADE = new Map();
export const CHAPTER_ROOM_BY_ID = new Map();
export const CHAPTER_LESSON_LAB_BY_ID = new Map();
export const CHAPTER_MODES_BY_ROOM = new Map();
export const CHAPTER_BY_MODE_ID = new Map();

for (const g of R6_MANIFEST.grades) {
  ROOMS_BY_GRADE.set(g.grade, g.thematicRooms);
  for (const r of g.thematicRooms) {
    ROOM_BY_ID.set(r.roomId, r);
    const roomModes = [];
    for (const lab of r.labs) {
      const enrichedModes = [];
      for (const mode of lab.modes) {
        const modeEntry = {
          ...mode,
          labId: lab.labId,
          labName: lab.name,
          roomId: r.roomId,
          roomName: r.name,
          grade: g.grade,
          role: lab.role,
          modality: lab.modality,
          status: mode.status || lab.status || 'interactive'
        };
        MODE_BY_ID.set(mode.id, modeEntry);
        roomModes.push(modeEntry);
        enrichedModes.push(modeEntry);
      }
      LAB_BY_ID.set(lab.labId, { ...lab, modes: enrichedModes, roomId: r.roomId, grade: g.grade, roomName: r.name });
    }
    MODES_BY_ROOM.set(r.roomId, roomModes);
  }
}

for (const gEntry of CURRICULUM_CHAPTERS_MANIFEST.grades || []) {
  const chRooms = [];
  for (const ch of gEntry.chapters || []) {
    const lessonLabs = [];
    const chapterModes = [];
    for (const ls of ch.lessons || []) {
      const labId = `${ch.id}-B${String(ls.lesson).padStart(2, '0')}`;
      const labName = `Bài ${ls.lesson}: ${ls.title}`;
      const modeObjs = [];
      for (const m of ls.models || []) {
        const baseMode = MODE_BY_ID.get(m.id) || {};
        const modeObj = {
          ...baseMode,
          id: m.id,
          name: m.name || baseMode.name || m.id,
          modality: m.modality || baseMode.modality || '3D',
          grade: gEntry.grade,
          roomId: ch.id,
          roomName: `Chương ${ch.number}: ${ch.title}`,
          chapterId: ch.id,
          chapterNumber: ch.number,
          chapterTitle: ch.title,
          volume: ch.volume,
          lessonNumber: ls.lesson,
          lessonTitle: ls.title,
          labId,
          labName,
          sourceRoomId: baseMode.roomId || null,
          sourceLabId: baseMode.labId || null,
          status: baseMode.status || 'interactive',
          v4Meta: m.v4Meta || null
        };
        modeObjs.push(modeObj);
        chapterModes.push(modeObj);
        if (MODE_BY_ID.has(m.id)) {
          const existing = MODE_BY_ID.get(m.id);
          existing.sourceGrade = existing.sourceGrade || existing.grade;
          existing.sourceLabId = existing.sourceLabId || existing.labId;
          if (m.name) existing.name = m.name;
          existing.v4Meta = m.v4Meta || null;
          existing.grade = gEntry.grade;
          existing.chapterGrade = gEntry.grade;
          existing.chapterId = ch.id;
          existing.chapterNumber = ch.number;
          existing.chapterTitle = ch.title;
          existing.chapterRoomName = `Chương ${ch.number}: ${ch.title}`;
          existing.volume = ch.volume;
          existing.lessonId = labId;
          existing.lessonNumber = ls.lesson;
          existing.lessonTitle = ls.title;
          existing.lessonLabName = labName;
        }
        CHAPTER_BY_MODE_ID.set(m.id, {
          chapterId: ch.id,
          chapterNumber: ch.number,
          chapterTitle: ch.title,
          volume: ch.volume,
          lessonId: labId,
          lessonNumber: ls.lesson,
          lessonTitle: ls.title
        });
      }
      const lessonLab = {
        labId,
        id: labId,
        name: labName,
        lessonNumber: ls.lesson,
        lessonTitle: ls.title,
        roomId: ch.id,
        roomName: `Chương ${ch.number}: ${ch.title}`,
        grade: gEntry.grade,
        role: 'lesson-lab',
        modality: modeObjs[0]?.modality || 'CURRICULUM',
        modes: modeObjs,
        isChapterLessonLab: true
      };
      CHAPTER_LESSON_LAB_BY_ID.set(labId, lessonLab);
      lessonLabs.push(lessonLab);
    }
    const chapterRoom = {
      roomId: ch.id,
      id: ch.id,
      grade: gEntry.grade,
      number: ch.number,
      title: ch.title,
      volume: ch.volume,
      name: `Chương ${ch.number}: ${ch.title}`,
      shortTitle: ch.title,
      summary: `Tập ${ch.volume} · ${lessonLabs.length} Bài học · ${chapterModes.length} Mô hình`,
      labUnits: lessonLabs.length,
      modeCount: chapterModes.length,
      labs: lessonLabs,
      isChapterRoom: true
    };
    CHAPTER_ROOM_BY_ID.set(ch.id, chapterRoom);
    CHAPTER_MODES_BY_ROOM.set(ch.id, chapterModes);
    chRooms.push(chapterRoom);
  }
  CHAPTER_ROOMS_BY_GRADE.set(gEntry.grade, chRooms);
}

export function getRoomsForGrade(grade) {
  return ROOMS_BY_GRADE.get(Number(grade)) || [];
}

export function getChapterRoomsForGrade(grade) {
  return CHAPTER_ROOMS_BY_GRADE.get(Number(grade)) || [];
}

export function getRoomById(roomId) {
  return ROOM_BY_ID.get(roomId) || CHAPTER_ROOM_BY_ID.get(roomId) || null;
}

export function getLabById(labId) {
  return LAB_BY_ID.get(labId) || CHAPTER_LESSON_LAB_BY_ID.get(labId) || null;
}

export function getChapterLessonLabById(labId) {
  return CHAPTER_LESSON_LAB_BY_ID.get(labId) || null;
}

export function getModeById(modeId) {
  return MODE_BY_ID.get(modeId) || null;
}

export function getModesForRoom(roomId) {
  return MODES_BY_ROOM.get(roomId) || CHAPTER_MODES_BY_ROOM.get(roomId) || [];
}

export function searchR6(query) {
  if (!query) return [];
  const q = query.trim().toLowerCase();
  const results = [];
  for (const mode of MODE_BY_ID.values()) {
    const gradeStr = String(mode.grade);
    const gradeMatches = 
      q === gradeStr ||
      q === `toán ${gradeStr}` ||
      q === `toan ${gradeStr}` ||
      q === `lớp ${gradeStr}` ||
      q === `lop ${gradeStr}` ||
      q === `k${gradeStr}` ||
      q === `grade ${gradeStr}`;

    if (
      gradeMatches ||
      mode.id.toLowerCase().includes(q) ||
      (mode.name && mode.name.toLowerCase().includes(q)) ||
      (mode.labName && mode.labName.toLowerCase().includes(q)) ||
      (mode.roomName && mode.roomName.toLowerCase().includes(q)) ||
      (mode.chapterTitle && mode.chapterTitle.toLowerCase().includes(q)) ||
      (mode.chapterRoomName && mode.chapterRoomName.toLowerCase().includes(q)) ||
      (mode.chapterId && mode.chapterId.toLowerCase().includes(q)) ||
      (mode.lessonTitle && mode.lessonTitle.toLowerCase().includes(q)) ||
      (mode.lessonLabName && mode.lessonLabName.toLowerCase().includes(q)) ||
      (mode.labId && mode.labId.toLowerCase().includes(q)) ||
      (mode.roomId && mode.roomId.toLowerCase().includes(q)) ||
      (mode.modality && mode.modality.toLowerCase().includes(q))
    ) {
      results.push(mode);
    }
  }
  return results;
}
