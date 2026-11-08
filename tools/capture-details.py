import sys
import os
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

OUT_DIR = os.path.abspath('QA_ANH_KIEM_TRA')

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        headless=True,
        args=['--use-gl=angle', '--enable-webgl', '--enable-webgl2-compute-context']
    )
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto('http://127.0.0.1:4173/')
    page.wait_for_timeout(2000)
    start_btn = page.query_selector('button:has-text("Bắt đầu tại sảnh")')
    if start_btn: start_btn.click()
    page.wait_for_timeout(1500)
    
    # 1. Look directly at GS. Euler in front of Exhibition Room (standing at x=54, z=1.5, yaw=Math.PI)
    page.evaluate('''() => {
        window.museum?.setState?.({ x: 54, z: 1.0, yaw: Math.PI, pitch: 0.15, charYaw: Math.PI });
    }''')
    page.wait_for_timeout(1500)
    page.screenshot(path=os.path.join(OUT_DIR, '07_loi_vao_trien_lam_va_huong_dan_vien.png'))
    
    # 2. Close-up of 2D GeoGebra Pedestal (standing at x=46, z=-23, looking north at x=46, z=-20)
    page.evaluate('''() => {
        window.museum?.setState?.({ x: 46, z: -23.0, yaw: 0, pitch: 0.22, charYaw: 0 });
    }''')
    page.wait_for_timeout(1500)
    page.screenshot(path=os.path.join(OUT_DIR, '08b_buc_geogebra_2d.png'))

    # 3. Close-up of 3D GeoGebra Pedestal (standing at x=62, z=-23, looking north at x=62, z=-20)
    page.evaluate('''() => {
        window.museum?.setState?.({ x: 62, z: -23.0, yaw: 0, pitch: 0.22, charYaw: 0 });
    }''')
    page.wait_for_timeout(1500)
    page.screenshot(path=os.path.join(OUT_DIR, '08c_buc_geogebra_3d.png'))

    # 4. Click on a mathematician frame (E or click) to show dialog
    page.evaluate('''() => {
        window.dispatchEvent(new CustomEvent('mathverse:history-open', { detail: { id: 'pythagoras' } }));
    }''')
    page.wait_for_timeout(1500)
    page.screenshot(path=os.path.join(OUT_DIR, '10_ho_so_danh_nhan_pythagoras.png'))

    browser.close()
    print('Captured specific detail views!')

