#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const get = async p => import(pathToFileURL(path.join(root, p)).href);

function sha256File(relPath) {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
}

console.log('================================================================');
console.log('  KIỂM ĐỊNH TÍNH TOÀN VẸN BỘ CÀI MATHVERSE R6.4 RELEASE');
console.log('================================================================');

let passed = 0;
let failed = 0;

function check(label, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${label} ${detail}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${label} ${detail}`);
  }
}

// 1. Core file existence
const requiredFiles = [
  'index.html',
  'package.json',
  'server/server.mjs',
  'vendor/three.module.js',
  'data/catalog.json',
  'data/models.toan6.json',
  'data/mathverse-7-12-curated.json',
  'src/math6-lab/catalog.js',
  'src/math6-lab/math6-taxonomy.mjs',
  'src/math6-lab/Math6ExhibitLab.js',
  'src/math6-lab/three-lab.mjs',
  'src/math6-lab/math.mjs',
  'src/curriculum/CurriculumExplorer.js',
  'src/museum/r6-spatial-manager.js',
  '00_CAI_1_LAN_VA_CHAY_TOAN_6_12.bat',
  'CHAY_R64_TOAN6_12.bat',
  'KIEM_THU_TOAN_BO_R64.bat',
  'MO_BANG_NGHIEM_THU_R64.bat',
  'CHANGELOG_R64.md',
  'HUONG_DAN_CAI_R64_CHO_CO.md',
  'BAO_CAO_RA_SOAT_310_MO_HINH.csv',
  'BAO_CAO_3D_TOAN6.csv',
  'DANH_MUC_63_TOAN6_2D_3D.csv',
  'BANG_MAP_TOAN6_63_LAB.csv'
];

for (const f of requiredFiles) {
  check(`File tồn tại: ${f}`, fs.existsSync(path.join(root, f)));
}

// 2. Hash preservation on golden baseline files
const goldenHashes = {
  'data/catalog.json': '1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15',
  'data/models.toan6.json': 'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9',
  'data/mathverse-7-12-curated.json': '744144b806b526d1d48aa482b95affba1f1a36b6322a658cef4acd031f8381f1',
  'src/math6-lab/catalog.js': 'ccb4940cdbfd204cc5a70fe7420af847cc85953328053d780da6b03c75e0a1e7'
};

for (const [f, expectedHash] of Object.entries(goldenHashes)) {
  const actualHash = sha256File(f);
  check(`Bảo toàn dữ liệu: ${f}`, actualHash === expectedHash, `(SHA: ${actualHash ? actualHash.slice(0, 8) : 'null'}...)`);
}

// 3. Mathematical catalog & room layout checks
const { ALL_MATH6_LABS, LAB_TO_EXHIBIT } = await get('src/math6-lab/catalog.js');
const { GRADE6_ACTIVE_IDS } = await get('src/portal-labs/grade6-curation-v15-1.js');
const { SUPPORTS_3D } = await get('src/math6-lab/three-lab.mjs');
const { ROOM_BY_ID, LAB_BY_ID, MODE_BY_ID, getRoomsForGrade } = await get('src/museum/r6-room-layout.js');
const { GRADE6_MODEL_TAXONOMY_MAP } = await get('src/math6-lab/math6-taxonomy.mjs');

check('Số phòng bảo tàng = 34', ROOM_BY_ID.size === 34, `(Thực tế: ${ROOM_BY_ID.size})`);
check('Số phòng thí nghiệm Lab = 130', LAB_BY_ID.size === 130, `(Thực tế: ${LAB_BY_ID.size})`);
check('Tổng số mô hình - chế độ toàn hệ thống = 310', MODE_BY_ID.size === 310, `(Thực tế: ${MODE_BY_ID.size})`);

check('Toán 6: Tổng số mô hình = 63', ALL_MATH6_LABS.length === 63, `(Thực tế: ${ALL_MATH6_LABS.length})`);
check('Toán 6: 35 tuyển chọn', GRADE6_ACTIVE_IDS.length === 35, `(Thực tế: ${GRADE6_ACTIVE_IDS.length})`);
const archivedG6 = ALL_MATH6_LABS.filter(m => !GRADE6_ACTIVE_IDS.includes(m.id)).length;
check('Toán 6: 28 mở rộng (archived)', archivedG6 === 28, `(Thực tế: ${archivedG6})`);

const threeCapG6 = ALL_MATH6_LABS.filter(SUPPORTS_3D);
check('Toán 6: 8 mô hình có đường code Three.js', threeCapG6.length === 8, `(Thực tế: ${threeCapG6.length})`);
check('Toán 6: Đủ 63 phân loại taxonomy', Object.keys(GRADE6_MODEL_TAXONOMY_MAP).length === 63, `(Thực tế: ${Object.keys(GRADE6_MODEL_TAXONOMY_MAP).length})`);

const expectedDistribution = [[6, 63], [7, 41], [8, 37], [9, 46], [10, 38], [11, 46], [12, 39]];
for (const [g, expected] of expectedDistribution) {
  const modes = getRoomsForGrade(g).flatMap(r => r.labs.flatMap(l => l.modes));
  check(`Toán ${g}: Đủ ${expected} chế độ`, modes.length === expected, `(Thực tế: ${modes.length})`);
}

// 4. Security & cleanliness check
const forbiddenFiles = ['.env', 'id_rsa', '.npmrc'];
for (const p of forbiddenFiles) {
  check(`Không chứa file bí mật: ${p}`, !fs.existsSync(path.join(root, p)));
}

console.log('----------------------------------------------------------------');
console.log(`Kết quả kiểm định Release: ${passed} PASS, ${failed} FAIL.`);
if (failed > 0) {
  process.exit(1);
}
console.log('BỘ CÀI ĐẠT ĐẦY ĐỦ TIÊU CHUẨN PHÁT HÀNH MATHVERSE R6.4!');
