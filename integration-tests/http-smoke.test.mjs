import test from 'node:test';import assert from 'node:assert/strict';
import http from 'node:http';import {spawn} from 'node:child_process';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
async function freePort(){return new Promise((resolve,reject)=>{const s=http.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});}
test('Dual World host serves R75 original through same-origin routes',async()=>{
  const port=await freePort();
  const child=spawn(process.execPath,[path.join(root,'server/host.mjs')],{cwd:root,env:{...process.env,NO_BROWSER:'1',DUAL_PORT:String(port)},stdio:['ignore','pipe','pipe']});
  let out='';
  try{
    await new Promise((resolve,reject)=>{
      let done=false;
      const yes=()=>{if(!done&&out.includes('[DUAL WORLD] READY')){done=true;resolve();}};
      child.stdout.on('data',part=>{out+=part.toString();yes();});
      child.stderr.on('data',part=>{out+=part.toString();yes();});
      child.on('exit',code=>{if(!done){done=true;reject(Error('host exited '+code+' '+out));}});
      setTimeout(()=>{if(!done){done=true;reject(Error('host timeout '+out));}},12000).unref();
    });
    const routes=['/','/r75/','/api/health','/src/main.js','/vendor/three.module.js','/museum-data/catalog.json','/dual/app.mjs','/dual/gallery.mjs','/dual/library.html','/museum-assets/g6/Bai_01.webp','/museum-assets/g12/Bai_19.webp'];
    for(const route of routes){
      const response=await fetch(`http://127.0.0.1:${port}${route}`,{signal:AbortSignal.timeout(4000)});
      assert.equal(response.status,200,route);
      if(route==='/r75/')assert.match(response.headers.get('content-security-policy')||'',/frame-ancestors 'self'/);
      await response.arrayBuffer();
    }
    const state=await fetch(`http://127.0.0.1:${port}/health`).then(r=>r.json());
    assert.equal(state.posters,230);assert.equal(state.r75OriginalUnmodified,true);
    const bridgeResp=await fetch(`http://127.0.0.1:${port}/granddome/api/museum`);
    assert.equal(bridgeResp.status,200,'Museum integration status endpoint');
    const bridge=await bridgeResp.json();
    assert.equal(bridge.total,230);assert.equal(bridge.rooms,7);
    assert.deepEqual(bridge.gradeCounts,{'6':43,'7':37,'8':39,'9':32,'10':27,'11':33,'12':19});
    const attack=await fetch(`http://127.0.0.1:${port}/R75_ORIGINAL/server/server.mjs`);
    assert.equal(attack.status,404);
  } finally {child.kill('SIGTERM');await new Promise(r=>child.once('exit',r)).catch(()=>{});}
}, {timeout:25000});
