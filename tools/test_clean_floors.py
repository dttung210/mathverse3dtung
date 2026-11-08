import os, sys, time
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:4190/'
ARTIFACT_DIR = r'C:\Users\boyme\.gemini\antigravity\brain\33e2fe14-98c5-444e-a164-fe263d17f5c0'

def run():
    print("=== CAPTURING CLEAN FLOOR QA SCREENSHOTS ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',
            headless=True,
            args=[
                '--use-gl=angle',
                '--use-angle=d3d11',
                '--enable-webgl',
                '--enable-webgl2-compute-context',
                '--ignore-gpu-blocklist',
                '--enable-gpu-rasterization',
                '--no-sandbox'
            ]
        )
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})
        page.goto(URL, wait_until='networkidle')
        page.wait_for_timeout(2500)

        page.evaluate('() => window.DUAL_WORLD_DEBUG.enterMuseum()')
        page.wait_for_timeout(2000)

        # 1. Clean Rotunda overview - top angle matching user's Image 1
        print("1. Capturing Clean Rotunda Top-Down...")
        page.evaluate('''() => {
            const select = document.getElementById('camera-mode');
            select.value = 'top';
            select.dispatchEvent(new Event('change'));
            window.DUAL_WORLD_DEBUG.teleport(0, 4, 0);
            window.DUAL_WORLD_DEBUG.setCameraDolly(16);
        }''')
        page.wait_for_timeout(1500)
        p1 = os.path.join(ARTIFACT_DIR, 'clean_01_san_sanh_sach_dep_khong_roi.png')
        page.screenshot(path=p1, full_page=True)
        print("Saved:", p1)

        # 2. Clean Room 7 - view matching user's Image 2 at doorway looking into Room 7
        print("2. Capturing Clean Room 7 & Doorway...")
        page.evaluate('''() => {
            const select = document.getElementById('camera-mode');
            select.value = 'third';
            select.dispatchEvent(new Event('change'));
            window.DUAL_WORLD_DEBUG.gotoGrade(7);
            window.DUAL_WORLD_DEBUG.setCameraDolly(6.5);
        }''')
        page.wait_for_timeout(2000)
        p2 = os.path.join(ARTIFACT_DIR, 'clean_02_phong_toan_7_tham_khong_bi_de.png')
        page.screenshot(path=p2, full_page=True)
        print("Saved:", p2)

        # 3. Clean Rotunda Eye-Level view
        print("3. Capturing Clean Rotunda Eye-Level...")
        page.evaluate('''() => {
            window.DUAL_WORLD_DEBUG.teleport(0, 0, Math.PI * 0.72);
            window.DUAL_WORLD_DEBUG.setCameraDolly(7.9);
        }''')
        page.wait_for_timeout(1500)
        p3 = os.path.join(ARTIFACT_DIR, 'clean_03_sanh_trung_tam_sang_trong_phang_min.png')
        page.screenshot(path=p3, full_page=True)
        print("Saved:", p3)

        browser.close()
        print("=== CAPTURE COMPLETE ===")

if __name__ == '__main__':
    run()

