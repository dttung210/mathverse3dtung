#!/usr/bin/env python3
"""Render the actual LabShell HTML template + its production CSS as a static layout QA.
Does NOT claim to test live WebGL or 3D mouse controls.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re, json
root=Path(__file__).resolve().parent.parent
source=(root/'src/ui/LabShell.js').read_text()
html=re.search(r'overlay\.innerHTML\s*=\s*`(.*?)`;',source,re.S)
if not html: raise RuntimeError('No LabShell template')
markup=html.group(1)
styles='\n'.join((root/f).read_text() for f in ['src/styles.css','src/neo-hud.css','src/studio/studio.css','src/studio/v10-layout.css','src/studio/v11-editor.css','src/studio/v12-ultimate.css','src/math6-lab/inline-math6.css','src/studio/v13-unified.css'])
page_html=f'''<!doctype html><html><meta charset="utf-8"><style>html,body{{height:100%;margin:0}}{styles}</style><body><div id="labshell-overlay" class="labshell-overlay">{markup}</div></body></html>'''
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(1366,768),(1440,900),(980,740)]:
  page=b.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  page.set_content(page_html)
  page.evaluate('''()=>{
    document.querySelector('#labshell-app').classList.add('visible','mv13-math6-library','math6-active');
    document.querySelector('#lab-stage-title').textContent='Hình thoi và hai đường chéo';
    document.querySelector('#lab-crumb-grade').textContent='Lớp 6';
    document.querySelector('#lab-crumb-modality').textContent='Thí nghiệm SGK';
    document.querySelector('#lab-crumb-title').textContent='Hình thoi và hai đường chéo';
    document.querySelector('#lab-badge-grade').textContent='LỚP 6';
    document.querySelector('#lab-sidebar-title').textContent='MÔ HÌNH LỚP 6';
    document.querySelector('#lab-ins-tag').textContent='MATHLAB 6';
    document.querySelector('#lab-stage-eyebrow').textContent='MATHLAB 6 • PHÒNG TOÁN 6';
    document.querySelector('#lab-btn-math6').hidden=true;
    document.querySelectorAll('[data-unified-mode]').forEach(e=>{e.classList.toggle('active',e.dataset.unifiedMode==='math6')});
    document.querySelector('#lab-model-list').innerHTML='';
    for(let i=0;i<12;i++){
      const row=document.createElement('div');row.className='studio-model-row math6-library-row';
      row.innerHTML='<button class="studio-model-card math6-library-card"><span class="mv13-math6-preview" data-engine="polygon"><svg class="mv13-math6-svg" viewBox="0 0 80 70" fill="none" stroke="currentColor" stroke-width="2"><polygon points="9,35 40,10 71,35 40,60"/><path d="M9 35H71 M40 10V60" stroke-dasharray="3 3"/></svg></span><span class="card-body"><strong class="card-title">Hình thoi và hai đường chéo</strong><small class="card-sub">Tập 1 · Trang 85 · Bục Hình thoi</small><span class="mv13-lab-card-kind">Hình phẳng</span></span></button>';
      document.querySelector('#lab-model-list').append(row);
    }
    const categories=document.querySelector('#lab-math6-categories');categories.hidden=false;
    for(const name of ['Tất cả 60','Hình phẳng','Cắt ghép','Đối xứng','Đo góc','Trục số','Phân số','Biểu đồ','Xác suất','Thực tế']){
      const b=document.createElement('button');b.className='mv13-category-chip';b.textContent=name;if(name==='Tất cả 60')b.classList.add('active');categories.append(b);
    }
    document.querySelector('#lab-viewport-main').innerHTML='<div class="math6-exhibit-lab"><div class="math6-portal-heading"><strong class="math6-context">ĐANG Ở BỤC MÔ HÌNH: HÌNH THOI</strong><div class="math6-related-wrap"><label>Mẫu SGK</label><select><option>Hình thoi · Tập 1, trang 85</option></select></div></div><details class="mv13-math6-specialized"><summary>⚒ Công cụ chuyên biệt theo mẫu SGK</summary></details><div class="math6-display"><canvas></canvas></div><div class="math6-lab-footer">Chu vi = 14,42 đv · Diện tích = 12 đv²</div><details class="math6-motion"><summary>🎞 Chuyển động / Ghi mốc</summary></details><details class="mv13-math6-export"><summary>⋯ Lưu / Xuất / Khôi phục</summary></details></div>';
    document.querySelector('#lab-ins-controls').innerHTML='<div class="math6-parameters"><h3>THÔNG SỐ THÍ NGHIỆM</h3><p>Điều chỉnh hai đường chéo và quan sát diện tích</p><div class="math6-param-row"><strong>Đường chéo 1 · 6</strong><input type="range" value="60"></div><div class="math6-param-row"><strong>Đường chéo 2 · 4</strong><input type="range" value="40"></div></div>';
    // Static draw for layout QA only, not a runtime/WebGL acceptance test.
    const canvas=document.querySelector('.math6-display canvas');
    canvas.width=920;canvas.height=560;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#fafdff';ctx.fillRect(0,0,920,560);
    ctx.strokeStyle='#e4edf1';ctx.lineWidth=1;
    for(let x=0;x<920;x+=46){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,560);ctx.stroke();}
    for(let y=0;y<560;y+=46){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(920,y);ctx.stroke();}
    ctx.strokeStyle='#9ebbc7';ctx.beginPath();ctx.moveTo(0,275);ctx.lineTo(920,275);ctx.moveTo(460,0);ctx.lineTo(460,560);ctx.stroke();
    ctx.beginPath();ctx.moveTo(460,75);ctx.lineTo(710,275);ctx.lineTo(460,475);ctx.lineTo(210,275);ctx.closePath();
    ctx.fillStyle='rgba(29,158,151,.13)';ctx.fill();ctx.strokeStyle='#118d91';ctx.lineWidth=3.2;ctx.stroke();
    ctx.setLineDash([12,7]);ctx.lineWidth=2.7;ctx.strokeStyle='#e59a40';ctx.beginPath();ctx.moveTo(460,75);ctx.lineTo(460,475);ctx.moveTo(210,275);ctx.lineTo(710,275);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#e59a40';for(const p of [[460,75],[710,275],[460,475],[210,275]]){ctx.beginPath();ctx.arc(p[0],p[1],9,0,Math.PI*2);ctx.fill();}
    ctx.font='700 21px system-ui';ctx.fillStyle='#244d60';ctx.fillText('A',476,60);ctx.fillText('B',722,265);ctx.fillText('C',476,498);ctx.fillText('D',184,265);
    ctx.font='700 18px system-ui';ctx.fillText('O',474,267);
  }''')
  page.wait_for_timeout(75)
  info=page.evaluate('''()=>{
    const bbox=sel=>{const r=document.querySelector(sel).getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}};
    return {workspace:bbox('.labshell-workspace'),sidebar:bbox('.labshell-sidebar'),stage:bbox('.labshell-stage-wrap'),canvas:bbox('.stage-viewport-outer'),inspector:bbox('.labshell-inspector'),mode:bbox('.mv13-mode-nav'),docHeight:document.documentElement.scrollHeight};
  }''')
  # Geometry lab is expected to be visible and usable at the exact viewport size.
  assert info['docHeight']<=height+2,(width,height,info)
  assert info['canvas']['h']>=290 and info['canvas']['w']>=410,(width,height,info)
  assert info['canvas']['y']+info['canvas']['h']<=height+1,(width,height,info)
  assert info['mode']['w']<=info['stage']['w']+1,(width,height,info)
  out=root/'docs'/'qa'/f'QA_GIAO_DIEN_V13_{width}x{height}.png';out.parent.mkdir(parents=True,exist_ok=True);page.screenshot(path=str(out));
  print(f'{width}x{height}',json.dumps(info,ensure_ascii=False));
  page.close()
 b.close()
