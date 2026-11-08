import sys, os
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        headless=True,
        args=['--use-gl=angle', '--enable-webgl', '--enable-webgl2-compute-context']
    )
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto('http://127.0.0.1:4173/')
    page.wait_for_timeout(2000)
    btn = page.query_selector('button:has-text("Bắt đầu tại sảnh")')
    if btn: btn.click()
    page.wait_for_timeout(1000)
    
    # Position at x=54, z=1.5 facing south towards Exhibition Entrance
    page.evaluate('''() => {
        window.museum?.restoreState?.({ x: 54, z: 1.5, yaw: Math.PI, pitch: 0.15, charYaw: Math.PI, grade: 0 });
    }''')
    page.wait_for_timeout(1500)
    page.screenshot(path='QA_ANH_KIEM_TRA/07_loi_vao_trien_lam_va_huong_dan_vien.png')
    browser.close()
    print('Screenshot 07 refreshed!')

