/** Compat loader for older Node tests that used data: URLs before the V7 scene modules existed. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
export async function loadParkModule(root){
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'mv7-test-'));
 const vendorUrl=pathToFileURL(path.join(root,'vendor/three.module.js')).href;
 const mazeUrl=pathToFileURL(path.join(root,'dual/wonder-park-v7-maze.mjs')).href;
 for(const [name,out] of [['wonder-park-v6-scenes.mjs','v6.mjs'],['wonder-park-v7-scenes.mjs','v7.mjs'],['wonder-park-world.mjs','world.mjs']]){
  let code=fs.readFileSync(path.join(root,'dual',name),'utf8');
  code=code.replaceAll("'/vendor/three.module.js'",JSON.stringify(vendorUrl));
  code=code.replaceAll("'./wonder-park-v6-scenes.mjs'","'./v6.mjs'")
   .replaceAll("'./wonder-park-v7-scenes.mjs'","'./v7.mjs'")
   .replaceAll("'./wonder-park-v7-maze.mjs'",JSON.stringify(mazeUrl));
  fs.writeFileSync(path.join(temp,out),code);
 }
 return import(pathToFileURL(path.join(temp,'world.mjs')).href);
}
