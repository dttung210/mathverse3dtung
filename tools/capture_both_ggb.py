import sys
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
    
    # 1. Test 2D Workshop
    print("Testing 2D GeoGebra...")
    page.evaluate('''() => {
        window.dispatchEvent(new CustomEvent('mathverse:exhibition-action', { detail: { type: 'ggb-2d' } }));
    }''')
    for i in range(15):
        page.wait_for_timeout(1000)
        status = page.evaluate("() => document.getElementById('mv-ggb-status')?.textContent")
        if "Sẵn sàng" in (status or ""):
            print("2D Ready!")
            break
            
    # Click sample shape
    sample_btn = page.query_selector('#mv-ggb-sample')
    if sample_btn:
        page.on('dialog', lambda dialog: dialog.accept())
        sample_btn.click()
        page.wait_for_timeout(1500)
        
    page.screenshot(path='QA_ANH_KIEM_TRA/08b_buc_geogebra_2d.png')
    print("Screenshot 08b saved!")
    
    # Close 2D
    close_btn = page.query_selector('#mv-ggb-close')
    if close_btn: close_btn.click()
    page.wait_for_timeout(1000)
    
    # 2. Test 3D Workshop
    print("Testing 3D GeoGebra...")
    page.evaluate('''() => {
        window.dispatchEvent(new CustomEvent('mathverse:exhibition-action', { detail: { type: 'ggb-3d' } }));
    }''')
    for i in range(20):
        page.wait_for_timeout(1000)
        status = page.evaluate("() => document.getElementById('mv-ggb-status')?.textContent")
        if "Sẵn sàng" in (status or ""):
            print("3D Ready!")
            break
            
    if sample_btn:
        sample_btn.click()
        page.wait_for_timeout(1500)
        
    page.screenshot(path='QA_ANH_KIEM_TRA/08c_buc_geogebra_3d.png')
    print("Screenshot 08c saved!")
    
    browser.close()
