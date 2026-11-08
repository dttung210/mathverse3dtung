import crypto from 'node:crypto';
import fs from 'node:fs';

const baseline = JSON.parse(fs.readFileSync('PROTECTED_FILES_BASELINE_SHA256.json', 'utf8'));
let mismatches = 0;
for (const [file, expectedHash] of Object.entries(baseline)) {
  const currentBuf = fs.readFileSync(file);
  const currentHash = crypto.createHash('sha256').update(currentBuf).digest('hex');
  if (currentHash !== expectedHash) {
    console.error('MISMATCH in protected file:', file);
    mismatches++;
  }
}
if (mismatches === 0) {
  console.log('SUCCESS: All', Object.keys(baseline).length, 'protected math files are 100% UNCHANGED!');
} else {
  console.error('FAILED:', mismatches, 'protected files were modified!');
  process.exit(1);
}

