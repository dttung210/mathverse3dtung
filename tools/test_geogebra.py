import sys, os, time
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        headless=True,
        args=['--use-gl=angle', '--enable-webgl', '--enable-webgl2-compute-context']
    )
    page = browser.new_page(viewport={'width': 1366, 'height': 768})
    page.goto('http://127.0.0.1:4173/')
    page.wait_for_timeout(2000)
    btn = page.query_selector('button:has-text("Bắt đầu")')
    if btn: btn.click()
    page.wait_for_timeout(1000)
    
    # Trigger GeoGebra 2D
    page.evaluate('''() => {
        window.dispatchEvent(new CustomEvent('mathverse:exhibition-action', { detail: { type: 'ggb-2d' } }));
    }''')
    
    for i in range(15):
        page.wait_for_timeout(1000)
        status = page.evaluate("() => document.getElementById('mv-ggb-status')?.textContent")
        print(f"[{i}s] GeoGebra Status: {status}")
        if "Sẵn sàng" in (status or ""):
            page.wait_for_timeout(2000)
            break
            
    page.screenshot(path='QA_ANH_KIEM_TRA/test_geogebra_render.png')
    browser.close()
    print('Captured QA_ANH_KIEM_TRA/test_geogebra_render.png!')
