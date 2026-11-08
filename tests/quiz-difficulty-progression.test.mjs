import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

import {
  normalizeTeacherBank,
  filterQuestionPool,
  pickQuestionsForGame,
  DIFFICULTY_ORDER,
  getDifficultyRank
} from '../dual/wonder-park-v8-bank.mjs';

import {
  selectChapterQuestions
} from '../dual/wonder-park-ui.mjs';

const bankPath = path.join(root, 'game-park', 'assets', 'teacher-bank-6-12-63-chapters.json');
const rawBank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
const chapters = normalizeTeacherBank(rawBank);

test('Difficulty rank mapping covers standard GDPT 2018 difficulty tiers', () => {
  assert.equal(getDifficultyRank({difficulty: 'Dễ'}), 1);
  assert.equal(getDifficultyRank({difficulty: 'Nhận biết'}), 1);
  assert.equal(getDifficultyRank({difficulty: 'Trung bình'}), 2);
  assert.equal(getDifficultyRank({difficulty: 'Thông hiểu'}), 2);
  assert.equal(getDifficultyRank({difficulty: 'Khó'}), 3);
  assert.equal(getDifficultyRank({difficulty: 'Vận dụng'}), 3);
  assert.equal(getDifficultyRank({difficulty: 'Vận dụng cao'}), 4);
  assert.equal(getDifficultyRank({difficulty: 'Rất khó'}), 4);
});

test('pickQuestionsForGame outputs 10 questions strictly sorted from Dễ to Khó for all 63 chapters', () => {
  for (let grade = 6; grade <= 12; grade++) {
    const gradeChapters = chapters.filter(c => c.grade === grade);
    for (const c of gradeChapters) {
      const selection = {grade, scope: 'chapter', chapter: c.chapter};
      // Test standard quiz mode 0 (Học bá Chuồng Gà) and mode 1 (Tên Lửa)
      for (const mode of [0, 1, 2, 3, 4, 5, 6, 8, 9]) {
        const picked = pickQuestionsForGame(chapters, selection, mode);
        assert.equal(picked.length, 10, `Chapter ${c.chapter} Grade ${grade} must pick 10 questions`);
        
        // Assert monotonic ordering: rank of question i <= rank of question i+1
        for (let i = 0; i < picked.length - 1; i++) {
          const rankA = getDifficultyRank(picked[i]);
          const rankB = getDifficultyRank(picked[i + 1]);
          assert.ok(
            rankA <= rankB,
            `Grade ${grade} Ch ${c.chapter} Mode ${mode}: Question ${i + 1} (${picked[i].difficulty}, rank ${rankA}) must be <= Question ${i + 2} (${picked[i + 1].difficulty}, rank ${rankB})`
          );
        }
        
        // Assert question 1 is always Dễ (or lowest rank available)
        assert.ok(getDifficultyRank(picked[0]) <= 2, `First question must be easy/introductory`);
        // Assert question 10 is the hardest tier in the round
        assert.ok(getDifficultyRank(picked[9]) >= getDifficultyRank(picked[0]), `Last question must be highest or equal rank`);
      }
    }
  }
});

test('pickQuestionsForGame in Mode 10 (Ai là triệu phú) outputs 15 questions strictly sorted 5 Dễ -> 5 Trung bình -> 5 Khó', () => {
  for (let grade = 6; grade <= 12; grade++) {
    const selection = {grade, scope: 'chapter', chapter: 1};
    const picked = pickQuestionsForGame(chapters, selection, 10);
    assert.equal(picked.length, 15);
    
    // Check first 5 are Dễ
    for (let i = 0; i < 5; i++) {
      assert.equal(picked[i].difficulty, 'Dễ', `Question ${i + 1} of Millionaire must be Dễ`);
    }
    // Check next 5 are Trung bình
    for (let i = 5; i < 10; i++) {
      assert.equal(picked[i].difficulty, 'Trung bình', `Question ${i + 1} of Millionaire must be Trung bình`);
    }
    // Check last 5 are Khó
    for (let i = 10; i < 15; i++) {
      assert.equal(picked[i].difficulty, 'Khó', `Question ${i + 1} of Millionaire must be Khó`);
    }
  }
});

test('selectChapterQuestions outputs questions strictly sorted from Dễ to Khó', () => {
  const g6c1 = chapters.find(c => c.grade === 6 && c.chapter === 1);
  const picked = selectChapterQuestions(g6c1.questions, 10);
  assert.equal(picked.length, 10);
  for (let i = 0; i < picked.length - 1; i++) {
    const rankA = getDifficultyRank(picked[i]);
    const rankB = getDifficultyRank(picked[i + 1]);
    assert.ok(
      rankA <= rankB,
      `selectChapterQuestions: Question ${i + 1} (${picked[i].difficulty}) must be <= Question ${i + 2} (${picked[i + 1].difficulty})`
    );
  }
});

