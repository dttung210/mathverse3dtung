import {spawn} from 'node:child_process';
const host='127.0.0.1';
const PORT=Number(process.env.SMOKE_PORT)||43799;
const child=spawn(process.execPath,['server/host.mjs'],{cwd:process.cwd(),env:{...process.env,DUAL_PORT:String(PORT)},stdio:['ignore','pipe','pipe']});
let logs='';
const waitReady=new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Timeout starting host: '+logs.slice(-1500))),14000);
  const observer=(chunk)=>{
    logs+=chunk.toString();const url=logs.match(/\[DUAL WORLD\] READY (http:\/\/127\.0\.0\.1:\d+\/)/)?.[1];
    if(url){clearTimeout(timer);resolve(url);}
  };
  child.stdout.on('data',observer);child.stderr.on('data',observer);
  child.once('exit',(code)=>{clearTimeout(timer);reject(Error('Host exited '+code+' '+logs.slice(-1500)));});
});
try{
  const url=await waitReady;
  const targets=['','health','dual/grand-dome.mjs','dual/crystal-architecture.mjs','dual/index.html','museum-data/catalog.json','r75/'];
  for(const p of targets){
    const resp=await fetch(url+p,{signal:AbortSignal.timeout(8000)});
    if(!resp.ok)throw Error(`${p} HTTP ${resp.status}`);
    const body=await resp.text();
    if(p==='dual/grand-dome.mjs'&&!body.includes('TRUE_INFINITY_LEMNISCATE_OVER_UNDER_RIBBON'))throw Error('New architecture missing');
    if(p==='museum-data/catalog.json'&&JSON.parse(body).total!==230)throw Error('Museum 230 originals missing');
    console.log(`HTTP ${resp.status} /${p} (${body.length} chars)`);
  }
  console.log('INFINITY V9 HTTP SMOKE PASSED',url);
}finally{
  child.kill('SIGTERM');
}
