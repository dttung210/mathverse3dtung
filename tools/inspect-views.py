import sys
import time
import json
import os
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

OUT_DIR = os.path.abspath('QA_ANH_KIEM_TRA')
os.makedirs(OUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        headless=True,
        args=[
            '--use-gl=angle',
            '--enable-webgl',
            '--enable-webgl2-compute-context',
            '--ignore-gpu-blocklist',
            '--disable-background-timer-throttling'
        ]
    )
    
    # 1. Test 1920x1080
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto('http://127.0.0.1:4173/')
    page.wait_for_timeout(2000)
    
    # Click "Bắt đầu tại sảnh ->"
    start_btn = page.query_selector('button:has-text("Bắt đầu tại sảnh")')
    if start_btn:
        start_btn.click()
    page.wait_for_timeout(2000)
    
    # 1. Sảnh chính - Eye level (Enhanced)
    page.screenshot(path=os.path.join(OUT_DIR, '01_sanh_chinh_eye_level.png'))
    
    # 2. Sảnh chính - Top view
    page.evaluate('''() => {
        window.museum?.setViewMode?.('top');
    }''')
    page.wait_for_timeout(1200)
    page.screenshot(path=os.path.join(OUT_DIR, '02_sanh_chinh_top_view.png'))
    
    # 3. Sảnh chính - 3/4 view
    page.evaluate('''() => {
        window.museum?.setViewMode?.('third');
    }''')
    page.wait_for_timeout(1200)
    page.screenshot(path=os.path.join(OUT_DIR, '03_sanh_chinh_iso_view.png'))
    
    # 4. Day / Night mode
    page.evaluate('''() => {
        window.museum?.setDaylightTheme?.(false);
    }''')
    page.wait_for_timeout(1000)
    page.screenshot(path=os.path.join(OUT_DIR, '04_sanh_chinh_night_mode.png'))
    
    page.evaluate('''() => {
        window.museum?.setDaylightTheme?.(true);
    }''')
    page.wait_for_timeout(500)
    
    # 5. Classic 3D mode vs Enhanced 3D mode
    page.evaluate('''() => {
        const btn = document.getElementById('mv-graphics-style');
        if (btn) btn.click();
    }''')
    page.wait_for_timeout(1000)
    page.screenshot(path=os.path.join(OUT_DIR, '05_sanh_chinh_classic_mode.png'))
    
    # Back to enhanced
    page.evaluate('''() => {
        const btn = document.getElementById('mv-graphics-style');
        if (btn) btn.click();
    }''')
    page.wait_for_timeout(800)
    
    # 6. Walk to Grade 6 door & Corridor
    page.evaluate('''() => {
        window.museum?.toGrade?.(6);
    }''')
    page.wait_for_timeout(1500)
    page.screenshot(path=os.path.join(OUT_DIR, '06_cua_lop_6_va_hanh_lang.png'))
    
    # 7. Corridor outside Grade 12 & Exhibition entrance with GS. Euler Guide
    page.evaluate('''() => {
        window.museum?.toGrade?.(12);
        // Turn around to look at the corridor and Exhibition entrance
        window.museum?.teleport?.({ x: 54, z: -2.0, yaw: Math.PI, pitch: 0.15 });
    }''')
    page.wait_for_timeout(1500)
    page.screenshot(path=os.path.join(OUT_DIR, '07_loi_vao_trien_lam_va_huong_dan_vien.png'))
    
    # 8. Inside Exhibition Room (teleport to x=54, z=-28, facing the back portraits)
    page.evaluate('''() => {
        window.museum?.toGrade?.('lib');
    }''')
    page.wait_for_timeout(2500)
    page.screenshot(path=os.path.join(OUT_DIR, '08_phong_trien_lam_tong_quan.png'))

    # 8b. Close-up of GeoGebra Pedestals inside Exhibition room
    page.evaluate('''() => {
        window.museum?.teleport?.({ x: 46, z: -22, yaw: 0, pitch: 0.2 });
    }''')
    page.wait_for_timeout(1500)
    page.screenshot(path=os.path.join(OUT_DIR, '08b_buc_geogebra_trien_lam.png'))
    
    # Measure FPS
    fps_metrics = page.evaluate('''() => {
        return new Promise((resolve) => {
            let frames = 0;
            const start = performance.now();
            function count() {
                frames++;
                if (performance.now() - start < 1000) {
                    requestAnimationFrame(count);
                } else {
                    const elapsed = (performance.now() - start) / 1000;
                    resolve({ fps: Math.round(frames / elapsed) });
                }
            }
            requestAnimationFrame(count);
        });
    }''')
    print('FPS measured in Exhibition room:', fps_metrics)

    # 9. Test resolution 1366x768
    page.set_viewport_size({'width': 1366, 'height': 768})
    page.wait_for_timeout(1000)
    page.screenshot(path=os.path.join(OUT_DIR, '09_resolution_1366x768.png'))
    
    browser.close()
    print('Completed view inspection! Screenshots saved to QA_ANH_KIEM_TRA')
