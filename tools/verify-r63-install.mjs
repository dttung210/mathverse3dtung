import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const data=JSON.parse(fs.readFileSync(path.join(root,'MANIFEST_SHA256_R63.json'),'utf8'));
let failed=0,ok=0;
for(const [relative,expected] of Object.entries(data.files)){
  const full=path.resolve(root,...relative.split('/'));
  if(!full.startsWith(root+path.sep)){console.error('INVALID:',relative);failed++;continue;}
  if(!fs.existsSync(full)){console.error('MISSING:',relative);failed++;continue;}
  const actual=crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
  if(actual!==expected){console.error('CHANGED:',relative);failed++;}else ok++;
}
console.log(`MATHVERSE R6.3 release manifest: ${ok}/${Object.keys(data.files).length} file hashes verified; ${failed} failed.`);
console.log('The three localhost shortcut files are expected to change when the app starts and are excluded.');
if(failed)process.exit(1);
