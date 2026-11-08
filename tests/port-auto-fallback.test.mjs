import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const serverFile=path.join(root,'server','server.mjs');

function launch(port){
  const child=spawn(process.execPath,[serverFile],{
    cwd:root,
    env:{...process.env,PORT:String(port),NO_BROWSER:'1',NO_SHORTCUTS:'1'},
    stdio:['ignore','pipe','pipe']
  });
  const out={child,text:''};
  for(const stream of [child.stdout,child.stderr]) stream.on('data',buf=>out.text+=String(buf));
  return out;
}
async function until(check,ms=9000){
  const start=Date.now();
  while(Date.now()-start<ms){
    const v=await check();
    if(v)return v;
    await sleep(90);
  }
  throw new Error('Timeout waiting for MATHVERSE server');
}
async function closeChild(out){
  if(!out?.child || out.child.exitCode!==null)return;
  const exited=new Promise(resolve=>out.child.once('exit',resolve));
  out.child.kill();
  await Promise.race([exited,sleep(2000)]);
}

test('Port fallback: another application is not killed; correct Lab endpoint is opened; same instance is reused',async()=>{
  const foreign=http.createServer((req,res)=>{
    res.writeHead(200,{'content-type':'application/json'});
    res.end(JSON.stringify({ok:true,app:'ANOTHER APPLICATION'}));
  });
  const listenPort=()=>new Promise((resolve,reject)=>{
    foreign.once('error',reject);
    foreign.listen(0,'127.0.0.1',()=>resolve(foreign.address().port));
  });
  const busyPort=await listenPort();
  if(busyPort===65535){await new Promise(resolve=>foreign.close(resolve));return;}
  let first,second;
  try{
    first=launch(busyPort);
    const result=await until(async()=>{
      try {
        const response=await fetch(`http://127.0.0.1:${busyPort+1}/api/health`,{signal:AbortSignal.timeout(250)});
        if(!response.ok)return null;
        const data=await response.json();
        return data.app==='MATH 3D MUSEUM'?data:null;
      }catch{return null;}
    });
    assert.equal(result.port,busyPort+1);
    assert.match(result.instanceId,/^[a-f0-9]{24}$/);
    assert.match(first.text,/dang ban/);
    // Correctly accept the chosen origin, while retaining origin restrictions for other ports.
    const api=`http://127.0.0.1:${busyPort+1}/api/interpret`;
    const good=await fetch(api,{method:'POST',headers:{'content-type':'application/json',origin:`http://127.0.0.1:${busyPort+1}`},body:'{}'});
    assert.notEqual(good.status,403);
    const blocked=await fetch(api,{method:'POST',headers:{'content-type':'application/json',origin:`http://127.0.0.1:${busyPort}`},body:'{}'});
    assert.equal(blocked.status,403);
    // The previous process remains alive and serves its original response.
    const foreignReply=await (await fetch(`http://127.0.0.1:${busyPort}/api/health`)).json();
    assert.equal(foreignReply.app,'ANOTHER APPLICATION');
    // Second MATHVERSE launch must reuse the matching instance, not create another server.
    second=launch(busyPort);
    const exitCode=await Promise.race([
      new Promise((resolve,reject)=>{second.child.once('error',reject);second.child.once('exit',resolve);}),
      sleep(6000).then(()=>{throw new Error('second launch did not exit');})
    ]);
    assert.equal(exitCode,0,second.text);
    assert.match(second.text,/DA CHAY/);
    assert.match(second.text,new RegExp(String(busyPort+1)));
  }finally{
    await Promise.all([closeChild(first),closeChild(second)]);
    await new Promise(resolve=>foreign.close(resolve));
  }
},{timeout:30000});

test('Port fallback: Windows URL / HTML shortcuts are synchronized to the actual port',async()=>{
  const fs=await import('node:fs');
  const os=await import('node:os');
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'mathverse-portfix-'));
  const mkdir=name=>fs.mkdirSync(path.join(temp,name),{recursive:true});
  mkdir('server');mkdir('src');mkdir('vendor');
  fs.copyFileSync(serverFile,path.join(temp,'server','server.mjs'));
  fs.copyFileSync(path.join(root,'src','math-core.js'),path.join(temp,'src','math-core.js'));
  fs.copyFileSync(path.join(root,'vendor','three.module.js'),path.join(temp,'vendor','three.module.js'));
  fs.writeFileSync(path.join(temp,'package.json'),'{"type":"module"}');
  fs.writeFileSync(path.join(temp,'TRUY_CAP_MATHVERSE.html'),'<a href="http://127.0.0.1:4173/">MATHVERSE</a>');
  fs.writeFileSync(path.join(temp,'LINK_TRUY_CAP.txt'),'http://127.0.0.1:4173/');
  const foreign=http.createServer((_req,res)=>res.end('not mathverse'));
  await new Promise(resolve=>foreign.listen(0,'127.0.0.1',resolve));
  const busyPort=foreign.address().port;
  const out={child:null,text:''};
  try{
    out.child=spawn(process.execPath,[path.join(temp,'server','server.mjs')],{
      cwd:temp,env:{...process.env,PORT:String(busyPort),NO_BROWSER:'1',NO_SHORTCUTS:'0'},stdio:['ignore','pipe','pipe']
    });
    for(const stream of [out.child.stdout,out.child.stderr])stream.on('data',buf=>out.text+=String(buf));
    const url=`http://127.0.0.1:${busyPort+1}/`;
    await until(async()=>{
      try{
        return ['LINK_TRUY_CAP_MATHVERSE.url','TRUY_CAP_MATHVERSE.html','LINK_TRUY_CAP.txt'].every(name=>fs.readFileSync(path.join(temp,name),'utf8').includes(url));
      }catch{return false;}
    });
    assert(fs.readFileSync(path.join(temp,'TRUY_CAP_MATHVERSE.html'),'utf8').includes(url));
    assert(fs.readFileSync(path.join(temp,'LINK_TRUY_CAP.txt'),'utf8').includes(url));
    const health=await (await fetch(`${url}api/health`)).json();
    assert.equal(health.port,busyPort+1);
  }finally{
    await closeChild(out);
    await new Promise(resolve=>foreign.close(resolve));
    fs.rmSync(temp,{recursive:true,force:true});
  }
},{timeout:25000});
