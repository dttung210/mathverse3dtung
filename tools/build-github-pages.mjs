/**
 * Build static bundle (_site/) for GitHub Pages deployment.
 * Mirrors server/host.mjs routing so Grand Campus is served at /
 * and Lab R75 is served at /r75/ and /lab/, with static API endpoints
 * and automatic subpath (/<repo-name>/) support.
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateMuseumCatalog } from '../dual/museum-inventory.mjs';
import { getCountryTopology, getUnescoSites } from '../server/discovery-geo-r97.mjs';
import { NATURE_WONDERS } from '../dual/discovery-r99/nature-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '_site');

function detectBasePath() {
  if (typeof process.env.BASE_PATH === 'string') {
    const clean = process.env.BASE_PATH.trim().replace(/\/+$/, '');
    return clean ? (clean.startsWith('/') ? clean : '/' + clean) : '';
  }
  const ghRepo = process.env.GITHUB_REPOSITORY || '';
  if (ghRepo.includes('/')) {
    const [owner, repo] = ghRepo.split('/');
    if (repo && owner && repo.toLowerCase() !== `${owner.toLowerCase()}.github.io`) {
      return `/${repo}`;
    }
  }
  return '';
}

const BASE = detectBasePath();
const STAMP = 'r107_v13';

const ROOT_PREFIXES = [
  'dual/',
  'src/',
  'data/',
  'vendor/',
  'game-park/',
  'museum-assets/',
  'museum-thumbs/',
  'museum-data/',
  'r75/',
  'lab/',
  'api/',
  'granddome/',
  'favicon.svg',
  'health'
];

function rewriteRootPaths(content, base) {
  let txt = content
    .replace(/((?:from|import)\s*['"])(\.?\.?\/[^'"?]+\.(?:m?js))(?:\?[^'"]*)?(['"])/g, `$1$2?v=${STAMP}$3`)
    .replace(/((?:src|href)=['"])(\/(?:dual|game-park)\/[^'"?]+\.(?:m?js|css))(?:\?[^'"]*)?(['"])/g, `$1$2?v=${STAMP}$3`)
    .replace(/"\/vendor\/three\.module\.js(?:\?[^"]*)?"/g, `"/vendor/three.module.js?v=${STAMP}"`)
    .replace(/iframe\.src='\/r75\/(?:\?[^']*)?'/g, `iframe.src='/r75/?v=${STAMP}'`);

  if (!base) return txt;
  const prefixPattern = ROOT_PREFIXES.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const attrRegex = new RegExp(`((?:src|href|poster|action)=['"]|(?:from|import)\\s*['"]|url\\(\\s*['"]?)/(${prefixPattern})`, 'g');
  txt = txt.replace(attrRegex, `$1${base}/$2`);
  const strRegex = new RegExp(`(['"\`])/(${prefixPattern})`, 'g');
  txt = txt.replace(strRegex, `$1${base}/$2`);
  return txt;
}

function makeStaticShimScript(base) {
  return `<script id="mv-gh-pages-shim">
(function(){
  var BASE = ${JSON.stringify(base)};
  window.__MV_BASE_PATH__ = BASE;
  function mapUrl(u){
    if(typeof u !== 'string') return u;
    if(BASE && u.startsWith('/') && !u.startsWith(BASE + '/') && !u.startsWith('//')){
      u = BASE + u;
    }
    var qIdx = u.indexOf('?');
    var pathOnly = qIdx >= 0 ? u.slice(0, qIdx) : u;
    var query = qIdx >= 0 ? u.slice(qIdx) : '';
    var rel = BASE && pathOnly.startsWith(BASE) ? pathOnly.slice(BASE.length) : pathOnly;
    if(rel === '/api/discovery/r99/photo'){
      var params = new URLSearchParams(query);
      var id = params.get('id') || '';
      return (BASE || '') + '/api/discovery/r99/photo/' + encodeURIComponent(id) + '.json';
    }
    var mTile = rel.match(/^\\/api\\/discovery\\/r99\\/(terrain|satellite)\\/(\\d+)\\/(\\d+)\\/(\\d+)$/);
    if(mTile){
      var kind = mTile[1], z = mTile[2], x = mTile[3], y = mTile[4];
      if(kind === 'terrain') return 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/' + z + '/' + x + '/' + y + '.png';
      return 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/GoogleMapsCompatible/' + z + '/' + y + '/' + x + '.jpg';
    }
    var StaticJsonRoutes = {
      '/health': '/health.json',
      '/api/health': '/api/health.json',
      '/granddome/api/museum': '/granddome/api/museum.json',
      '/api/discovery/r98/catalog': '/api/discovery/r98/catalog.json',
      '/api/discovery/r99/catalog': '/api/discovery/r99/catalog.json',
      '/api/discovery/countries': '/api/discovery/countries.json',
      '/api/discovery/unesco': '/api/discovery/unesco.json'
    };
    if(StaticJsonRoutes[rel]){
      return (BASE || '') + StaticJsonRoutes[rel] + query;
    }
    return u;
  }
  var origFetch = window.fetch;
  if(origFetch){
    window.fetch = function(input, init){
      if(typeof input === 'string'){
        input = mapUrl(input);
      } else if(input && typeof input.url === 'string'){
        input = new Request(mapUrl(input.url), input);
      }
      return origFetch.call(this, input, init);
    };
  }
  var origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url){
    var args = Array.prototype.slice.call(arguments);
    if(typeof url === 'string') args[1] = mapUrl(url);
    return origOpen.apply(this, args);
  };
  if(BASE){
    [HTMLImageElement, HTMLIFrameElement, HTMLScriptElement, HTMLLinkElement].forEach(function(Ctor){
      if(!Ctor || !Ctor.prototype) return;
      var prop = Ctor === HTMLLinkElement ? 'href' : 'src';
      var desc = Object.getOwnPropertyDescriptor(Ctor.prototype, prop);
      if(desc && desc.set){
        Object.defineProperty(Ctor.prototype, prop, {
          configurable: true,
          enumerable: desc.enumerable,
          get: desc.get,
          set: function(v){
            return desc.set.call(this, typeof v === 'string' ? mapUrl(v) : v);
          }
        });
      }
    });
  }
})();
</script>`;
}

async function copyDirTransform(srcDir, destDir) {
  await fsp.mkdir(destDir, { recursive: true });
  const entries = await fsp.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirTransform(srcPath, destPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.html', '.mjs', '.js', '.css'].includes(ext) && entry.name !== 'three.module.js') {
        let txt = await fsp.readFile(srcPath, 'utf8');
        txt = rewriteRootPaths(txt, BASE);
        if (ext === '.html' && txt.includes('<head>')) {
          txt = txt.replace('<head>', '<head>\n' + makeStaticShimScript(BASE));
        }
        await fsp.writeFile(destPath, txt, 'utf8');
      } else {
        await fsp.copyFile(srcPath, destPath);
      }
    }
  }
}

async function writeJsonBoth(relPathNoExt, data) {
  const jsonText = JSON.stringify(data);
  const p1 = path.join(OUT, relPathNoExt);
  const p2 = path.join(OUT, `${relPathNoExt}.json`);
  await fsp.mkdir(path.dirname(p1), { recursive: true });
  await fsp.writeFile(p1, jsonText, 'utf8');
  await fsp.writeFile(p2, jsonText, 'utf8');
}

async function ensureThreeVendor() {
  const vendorFile = path.join(ROOT, 'vendor', 'three.module.js');
  if (fs.existsSync(vendorFile) && fs.statSync(vendorFile).size > 400_000) return;
  await fsp.mkdir(path.dirname(vendorFile), { recursive: true });
  const urls = [
    'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js',
    'https://unpkg.com/three@0.161.0/build/three.module.js',
    'https://raw.githubusercontent.com/mrdoob/three.js/r161/build/three.module.js'
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const text = await res.text();
      if (text.length > 400_000) {
        await fsp.writeFile(vendorFile, text, 'utf8');
        console.log('[GitHub Pages Builder] Downloaded vendor/three.module.js');
        return;
      }
    } catch {}
  }
}

async function main() {
  console.log(`[GitHub Pages Builder] Building static site into _site/ (BASE_PATH="${BASE}")...`);
  await ensureThreeVendor();
  await fsp.rm(OUT, { recursive: true, force: true });
  await fsp.mkdir(OUT, { recursive: true });

  const dirsToCopy = ['dual', 'src', 'data', 'vendor', 'game-park', 'museum-assets', 'museum-thumbs', 'museum-data'];
  for (const d of dirsToCopy) {
    const s = path.join(ROOT, d);
    if (fs.existsSync(s)) {
      await copyDirTransform(s, path.join(OUT, d));
    }
  }

  if (fs.existsSync(path.join(ROOT, 'favicon.svg'))) {
    await fsp.copyFile(path.join(ROOT, 'favicon.svg'), path.join(OUT, 'favicon.svg'));
  }

  // 1. Root index.html = Grand Campus (dual/index.html)
  let dualHtml = await fsp.readFile(path.join(ROOT, 'dual', 'index.html'), 'utf8');
  dualHtml = rewriteRootPaths(dualHtml, BASE).replace('<head>', '<head>\n' + makeStaticShimScript(BASE));
  await fsp.writeFile(path.join(OUT, 'index.html'), dualHtml, 'utf8');
  await fsp.writeFile(path.join(OUT, '404.html'), dualHtml, 'utf8');

  // 2. /r75/index.html and /lab/index.html = Lab R75 (root index.html)
  let r75Html = await fsp.readFile(path.join(ROOT, 'index.html'), 'utf8');
  r75Html = rewriteRootPaths(r75Html, BASE).replace('<head>', '<head>\n' + makeStaticShimScript(BASE));
  for (const sub of ['r75', 'lab']) {
    await fsp.mkdir(path.join(OUT, sub), { recursive: true });
    await fsp.writeFile(path.join(OUT, sub, 'index.html'), r75Html, 'utf8');
  }

  // 3. Static API JSON files
  const catalog = JSON.parse(await fsp.readFile(path.join(ROOT, 'museum-data', 'catalog.json'), 'utf8'));
  const museumInventory = validateMuseumCatalog(catalog);

  await writeJsonBoth('health', {
    ok: true,
    app: 'MATHVERSE-GRAND-CAMPUS-FINAL',
    version: 'FINAL-2026-11-08-R107-V13',
    teacherBank: { grades: 7, chapters: 63, total: 3150, ready: 3087, quarantined: 63 },
    r75OriginalUnmodified: true,
    posters: catalog.total
  });
  await writeJsonBoth('api/health', {
    ok: true,
    app: 'MATH 3D MUSEUM',
    version: '15.1.0',
    release: 'R7.3',
    uiVersion: 'R7.3',
    threeReady: true,
    aiEnabled: false
  });
  await writeJsonBoth('granddome/api/museum', {
    ok: true,
    ...museumInventory,
    entrance: `${BASE}/`,
    museumLibrary: `${BASE}/dual/library.html`,
    lab: `${BASE}/r75/`
  });

  // R98 curation catalog
  let r98Db = { version: 98, assets: [] };
  try {
    r98Db = JSON.parse(await fsp.readFile(path.join(ROOT, 'dual', 'discovery-r98', 'curation.json'), 'utf8'));
  } catch {}
  const approved = (r98Db.assets || []).filter(x => x.status === 'approved');
  await writeJsonBoth('api/discovery/r98/catalog', {
    ok: true,
    version: 98,
    approved,
    records: r98Db.assets || [],
    approvedCount: approved.length,
    policy: 'Static GitHub Pages build'
  });

  // R99 nature catalog & photos
  await writeJsonBoth('api/discovery/r99/catalog', {
    ok: true,
    version: 99,
    items: NATURE_WONDERS,
    verifiedModelCount: NATURE_WONDERS.filter(x => x.cachedGlbUrl).length,
    terrainSupported: NATURE_WONDERS.filter(x => x.model === 'terrain_dem').length,
    photoVerifiedCount: NATURE_WONDERS.filter(x => x.photo_verified).length
  });
  try {
    const photosMeta = JSON.parse(await fsp.readFile(path.join(ROOT, 'dual', 'discovery-r99', 'photos', 'photos-meta.json'), 'utf8'));
    const photoDir = path.join(OUT, 'api', 'discovery', 'r99', 'photo');
    await fsp.mkdir(photoDir, { recursive: true });
    for (const item of photosMeta) {
      if (item?.id) {
        const mapped = { ...item, url: BASE && item.url?.startsWith('/') ? `${BASE}${item.url}` : item.url };
        await fsp.writeFile(path.join(photoDir, `${item.id}.json`), JSON.stringify(mapped), 'utf8');
      }
    }
  } catch {}

  // R97 countries & UNESCO sites
  try {
    await writeJsonBoth('api/discovery/countries', await getCountryTopology());
    await writeJsonBoth('api/discovery/unesco', await getUnescoSites());
  } catch {}

  // 4. .nojekyll so GitHub Pages does not ignore folders starting with _ or .
  await fsp.writeFile(path.join(OUT, '.nojekyll'), '', 'utf8');
  console.log('[GitHub Pages Builder] Done! Output ready in _site/');
}

main().catch(err => {
  console.error('[GitHub Pages Builder] Failed:', err);
  process.exit(1);
});
