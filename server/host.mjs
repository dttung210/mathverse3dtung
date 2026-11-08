import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateMuseumCatalog} from '../dual/museum-inventory.mjs';
import {handleR98Curation} from './discovery-r98-curation.mjs';
import {handleR99Nature} from './discovery-r99-nature.mjs';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(__dirname,'..');
const R75=ROOT;
const HOST='127.0.0.1';
const basePort=Number(process.env.DUAL_PORT)||4190;
const catalog=JSON.parse(fs.readFileSync(path.join(ROOT,'museum-data','catalog.json'),'utf8'));
const museumInventory=validateMuseumCatalog(catalog);
for(const item of catalog.items){
  const filename=path.join(ROOT,item.src.slice(1));
  if(!fs.existsSync(filename))throw new Error(`Museum missing required infographic: ${item.src}`);
}
let upstreamPort=null, child=null, hostPort=null, closed=false;
const MIME={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.glb':'model/gltf-binary','.txt':'text/plain; charset=utf-8'};
const send=(res,status,body,mime='text/plain; charset=utf-8')=>{
  res.writeHead(status,{'Content-Type':mime,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Referrer-Policy':'no-referrer'});
  res.end(body);
};
function safeFile(route,prefix,dir){
  const tail=decodeURIComponent(route.slice(prefix.length));
  const root=path.join(ROOT,dir);
  const target=path.resolve(root,'.'+path.sep+tail.replace(/^[/\\]+/,''));
  if(target!==root&&!target.startsWith(root+path.sep))return null;
  return target;
}
function readStatic(req,res,route,prefix,dir){
  let file;
  try{file=safeFile(route,prefix,dir);}catch{send(res,400,'Invalid URL');return;}
  if(!file||!fs.existsSync(file)||!fs.statSync(file).isFile()){send(res,404,'Not found');return;}
  const ext=path.extname(file).toLowerCase();
  if((prefix==='/museum-assets/'||prefix==='/museum-thumbs/')&&ext!=='.webp'){send(res,403,'Only WebP assets');return;}
  const cacheHeader=['.html','.mjs','.js','.css','.json'].includes(ext)?'no-cache, no-store, must-revalidate':'public, max-age=86400';
  if((ext==='.html'||ext==='.mjs'||ext==='.js')&&(prefix==='/dual/'||prefix==='/game-park/')){
    const stamp='r107_v15';
    const txt=fs.readFileSync(file,'utf8')
      .replace(/((?:from|import)\s*['"])(\.?\.?\/[^'"?]+\.(?:m?js))(?:\?[^'"]*)?(['"])/g,`$1$2?v=${stamp}$3`)
      .replace(/((?:src|href)=['"])(\/(?:dual|game-park)\/[^'"?]+\.(?:m?js|css))(?:\?[^'"]*)?(['"])/g,`$1$2?v=${stamp}$3`)
      .replace(/"\/vendor\/three\.module\.js(?:\?[^"]*)?"/g,`"/vendor/three.module.js?v=${stamp}"`)
      .replace(/iframe\.src='\/r75\/(?:\?[^']*)?'/g,`iframe.src='/r75/?v=${stamp}'`);
    const buf=Buffer.from(txt,'utf8');
    res.writeHead(200,{'Content-Type':MIME[ext]||'application/octet-stream','Content-Length':buf.length,'X-Content-Type-Options':'nosniff','Cache-Control':cacheHeader});
    if(req.method==='HEAD')res.end();else res.end(buf);
    return;
  }
  const size=fs.statSync(file).size;
  res.writeHead(200,{'Content-Type':MIME[ext]||'application/octet-stream','Content-Length':size,'X-Content-Type-Options':'nosniff','Cache-Control':cacheHeader});
  if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
}
let secondaryPort=null, secondaryApp=null, legacyAliasPort=null, legacyAliasApp=null;
function proxy(req,res,route){
  if(!upstreamPort){send(res,503,'MATHVERSE R75 is starting. Refresh soon.');return;}
  const target=route==='/r75'||route==='/r75/'?'/':route;
  const headers={...req.headers,host:`${HOST}:${upstreamPort}`};
  if(req.headers.origin){
    const allowed=[`http://${HOST}:${hostPort}`,`http://localhost:${hostPort}`,`http://${HOST}:${secondaryPort}`,`http://localhost:${secondaryPort}`,`http://${HOST}:${legacyAliasPort}`,`http://localhost:${legacyAliasPort}`];
    if(!allowed.includes(req.headers.origin)){
      send(res,403,'Cross-origin requests not allowed');return;
    }
    headers.origin=`http://${HOST}:${upstreamPort}`;
  }
  delete headers['content-security-policy'];
  const upstream=http.request({hostname:HOST,port:upstreamPort,path:target,method:req.method,headers},remote=>{
    const forwarded={...remote.headers};
    // Same-origin iframe needs self-embedding. Original R75 files remain byte-for-byte identical.
    // All other R75 CSP directives remain enforced, including object-src none.
    if(forwarded['content-security-policy']){
      forwarded['content-security-policy']=String(forwarded['content-security-policy'])
        .replace(/frame-ancestors\s+'none'/g,"frame-ancestors 'self'; media-src 'self' data: blob: https://translate.googleapis.com https://translate.google.com");
    }
    delete forwarded['x-frame-options'];
    res.writeHead(remote.statusCode||502,forwarded);
    remote.pipe(res);
  });
  upstream.on('error',e=>{if(!res.headersSent)send(res,502,`R75 unavailable: ${e.message}`);else res.end();});
  req.pipe(upstream);
}
const handleRequest=(req,res)=>{
  if(!['GET','HEAD','POST'].includes(req.method||'')){send(res,405,'Method not allowed');return;}
  let route;
  try{route=new URL(req.url,`http://${HOST}:${hostPort||basePort}`).pathname;}catch{send(res,400,'Invalid URL');return;}
  if((req.method==='POST')&&!route.startsWith('/api/')){send(res,405,'Method not allowed');return;}
  // R99 only serves pre-defined, fixed public 3D terrain/satellite tiles and credited photos.
  if(route.startsWith('/api/discovery/r99/')){
    const url=new URL(req.url,`http://${HOST}:${hostPort||basePort}`);
    handleR99Nature(req,res,route,url).catch(e=>{if(!res.headersSent)send(res,500,'R99 terrain error: '+e.message);});
    return;
  }
  // R98 local-only reviewed 3D asset intake. Legacy R75 routes remain untouched.
  if(route.startsWith('/api/discovery/r98/')){
    const url=new URL(req.url,`http://${HOST}:${hostPort||basePort}`);
    handleR98Curation(req,res,route,url,`http://${HOST}:${hostPort||basePort}`).then(handled=>{if(!handled)send(res,404,'Unknown R98 route');}).catch(e=>{if(!res.headersSent)send(res,500,'R98 upload error: '+e.message);});
    return;
  }
  // Read-only, namespaced integration endpoint; does not touch R75 /api routes.
  if(route==='/granddome/api/museum'){
    if(req.method!=='GET'&&req.method!=='HEAD'){send(res,405,'Method not allowed');return;}
    send(res,200,req.method==='HEAD'?'':JSON.stringify({ok:true,...museumInventory,entrance:'/',museumLibrary:'/dual/library.html',lab:'/r75/'}),MIME['.json']);return;
  }
  if(route==='/health'){
    send(res,200,JSON.stringify({ok:!!upstreamPort,app:'MATHVERSE-GRAND-CAMPUS-FINAL',version:'FINAL-2026-11-02',teacherBank:{grades:7,chapters:63,total:3150,ready:3087,quarantined:63},port:hostPort,upstream:upstreamPort,r75OriginalUnmodified:true,posters:catalog.total}),MIME['.json']);return;
  }
  if(route==='/lab'||route==='/lab/'){
    res.writeHead(302,{'Location':'/r75/'});res.end();return;
  }
  if(route==='/park'||route==='/park/'){
    res.writeHead(302,{'Location':'/game-park/'});res.end();return;
  }
  if(route==='/kho-cau-hoi'||route==='/kho-cau-hoi/'){
    res.writeHead(302,{'Location':'/game-park/kho-cau-hoi.html'});res.end();return;
  }
  if(route==='/infographic'||route==='/infographics'){
    res.writeHead(302,{'Location':'/dual/library.html'});res.end();return;
  }
  if(route==='/'||route==='/index.html'){
    readStatic(req,res,'/dual/index.html','/dual/','dual');return;
  }
  if(route.startsWith('/dual/')){readStatic(req,res,route,'/dual/','dual');return;}
  if(route==='/game-park'||route==='/game-park/') {readStatic(req,res,'/game-park/index.html','/game-park/','game-park');return;}
  if(route.startsWith('/game-park/')){readStatic(req,res,route,'/game-park/','game-park');return;}
  if(route.startsWith('/museum-assets/')){readStatic(req,res,route,'/museum-assets/','museum-assets');return;}
  if(route.startsWith('/museum-thumbs/')){readStatic(req,res,route,'/museum-thumbs/','museum-thumbs');return;}
  if(route==='/museum-data/catalog.json'){
    readStatic(req,res,'/museum-data/catalog.json','/museum-data/','museum-data');return;
  }
  // R75 routes retain their own original server-side rules and API behavior.
  proxy(req,res,route);
};
const app=http.createServer(handleRequest);
async function availablePort(){
  return new Promise((resolve,reject)=>{
    const s=http.createServer();s.once('error',reject);s.listen(0,HOST,()=>{const port=s.address().port;s.close(()=>resolve(port));});
  });
}
async function spawnOriginal(){
  const internal=await availablePort();
  return new Promise((resolve,reject)=>{
    child=spawn(process.execPath,[path.join(R75,'server','server.mjs')],{
      cwd:R75,env:{...process.env,PORT:String(internal),NO_BROWSER:'1',NO_SHORTCUTS:'1'},stdio:['ignore','pipe','pipe']
    });
    let log='';let done=false;
    const observe=(data,isError=false)=>{
      const text=data.toString();log=(log+text).slice(-9000);
      if(isError)process.stderr.write('[R75] '+text);
      const match=log.match(/MATH 3D MUSEUM SAN SANG:\s*http:\/\/127\.0\.0\.1:(\d+)/);
      if(match&&!done){upstreamPort=Number(match[1]);done=true;resolve(upstreamPort);}
    };
    child.stdout.on('data',t=>observe(t));child.stderr.on('data',t=>observe(t,true));
    child.once('error',e=>{if(!done){done=true;reject(e);}});
    child.once('exit',code=>{upstreamPort=null;if(!closed)console.error(`[DUAL WORLD] R75 server exit ${code}`);if(!done){done=true;reject(Error('R75 server exited before ready: '+log));}});
    setTimeout(()=>{if(!done){done=true;reject(Error('R75 startup timeout: '+log));}},30000).unref();
  });
}
function openBrowser(){
  if(process.env.NO_BROWSER==='1')return;
  const url=`http://${HOST}:${hostPort}/`;
  let exe,args;
  if(process.platform==='win32'){exe='rundll32.exe';args=['url.dll,FileProtocolHandler',url];}
  else if(process.platform==='darwin'){exe='open';args=[url];}
  else{exe='xdg-open';args=[url];}
  const proc=spawn(exe,args,{stdio:'ignore',detached:true});proc.on('error',()=>{});proc.unref();
}
async function listen(){
  for(let p=basePort;p<basePort+20;p++){
    try{
      await new Promise((resolve,reject)=>{
        const onError=e=>{app.off('listening',onListen);reject(e);};
        const onListen=()=>{app.off('error',onError);resolve();};
        app.once('error',onError);app.once('listening',onListen);app.listen(p,HOST);
      });
      hostPort=p;return p;
    }catch(e){if(e.code!=='EADDRINUSE')throw e;}
  }
  throw Error('No available port for Dual World');
}
async function attachSecondary(){
  const target=hostPort===4190?4192:4190;
  try{
    secondaryApp=http.createServer(handleRequest);
    await new Promise((resolve,reject)=>{
      secondaryApp.once('error',reject);
      secondaryApp.once('listening',resolve);
      secondaryApp.listen(target,HOST);
    });
    secondaryPort=target;
    console.log(`[DUAL WORLD] Secondary listener active at http://${HOST}:${secondaryPort}/`);
  }catch(e){/* optional secondary port */}
  if(hostPort===4190&&upstreamPort!==4173){
    try{
      legacyAliasApp=http.createServer(handleRequest);
      await new Promise((resolve,reject)=>{
        legacyAliasApp.once('error',reject);
        legacyAliasApp.once('listening',resolve);
        legacyAliasApp.listen(4173,HOST);
      });
      legacyAliasPort=4173;
      console.log(`[DUAL WORLD] Legacy alias listener active at http://${HOST}:${legacyAliasPort}/`);
    }catch(e){/* optional 4173 alias port */}
  }
}
function stop(){closed=true;try{app.close();}catch{}try{if(secondaryApp)secondaryApp.close();}catch{}try{if(legacyAliasApp)legacyAliasApp.close();}catch{}if(child&&!child.killed)child.kill('SIGTERM');}
process.on('SIGINT',()=>{stop();process.exit(0);});
process.on('SIGTERM',()=>{stop();process.exit(0);});
try{
  await spawnOriginal();
  await listen();
  await attachSecondary();
  console.log(`[DUAL WORLD] READY http://${HOST}:${hostPort}/`);
  console.log(`[DUAL WORLD] R75 original served unchanged at http://${HOST}:${hostPort}/r75/`);
  console.log(`[GRAND DOME V8] World 0: open shared megadome, actual LAB building, right Crystal Museum, R75 NPC; World 1 is original R75; World 2 has 7 halls / ${catalog.total} posters. Ctrl+C to stop.`);
  openBrowser();
}catch(err){console.error('[DUAL WORLD] Startup failed:',err.message);stop();process.exit(1);}
