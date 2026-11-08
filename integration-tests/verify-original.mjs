import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const csv=fs.readFileSync(path.join(root,'audit/R75_SHA256_ORIGINAL.csv'),'utf8').trim().split(/\r?\n/);
let ok=0;
for(const line of csv.slice(1)){
  const match=line.match(/^(.+),([0-9a-f]{64}),(\d+)$/);
  if(!match)throw Error('Invalid manifest line');
  const filename=path.join(root,match[1]);
  const content=fs.readFileSync(filename);
  const hash=crypto.createHash('sha256').update(content).digest('hex');
  if(hash!==match[2]||content.length!==Number(match[3]))throw Error('R75 modified: '+match[1]);
  ok++;
}
console.log('R75 immutable verified:',ok,'files');
if(ok!==csv.length-1)process.exitCode=1;
