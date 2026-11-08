import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function hashFile(f) {
  const buf = fs.readFileSync(f);
  return crypto.createHash('sha256').update(buf).digest('hex');
}
function walk(dir) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) res = res.concat(walk(full));
    else res.push(full);
  }
  return res;
}
const protectedDirs = ['src/math6-lab', 'src/curriculum', 'src/portal-labs', 'src/studio', 'data'];
const protectedFiles = ['src/geometry.js'];
let all = [...protectedFiles];
for (const d of protectedDirs) all = all.concat(walk(d));
console.log('Total protected files found:', all.length);
const hashes = {};
for (const f of all) {
  const rel = path.relative('.', f).replace(/\\/g, '/');
  hashes[rel] = hashFile(f);
}
fs.writeFileSync('PROTECTED_FILES_BASELINE_SHA256.json', JSON.stringify(hashes, null, 2), 'utf8');
console.log('Saved PROTECTED_FILES_BASELINE_SHA256.json with', Object.keys(hashes).length, 'files');

