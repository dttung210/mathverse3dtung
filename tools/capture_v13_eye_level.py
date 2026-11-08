import os, sys, time
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:4190/'
ARTIFACT_DIR = r'C:\Users\boyme\.gemini\antigravity\brain\33e2fe14-98c5-444e-a164-fe263d17f5c0'

def run():
    print("=== CAPTURING EYE-LEVEL 3RD-PERSON V13 SCREENSHOTS ===")
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

        # Enter museum
        page.evaluate('() => window.DUAL_WORLD_DEBUG.enterMuseum()')
        page.wait_for_timeout(2000)

        # Ensure third-person camera mode
        page.evaluate('''() => {
            const select = document.getElementById('camera-mode');
            select.value = 'third';
            select.dispatchEvent(new Event('change'));
            window.DUAL_WORLD_DEBUG.setCameraDolly(7.9);
        }''')
        page.wait_for_timeout(1000)

        # 1. Standing in rotunda looking towards Gate 6 and NPC Bé Mai
        print("Capturing Photo 2 (Eye-Level): Tiền sảnh Lớp 6 & NPC Bé Mai...")
        page.evaluate('''() => {
            const dbg = window.DUAL_WORLD_DEBUG;
            // Place player at r = 24 looking towards Grade 6 (-148 deg = -2.58 rad)
            dbg.teleport(-12, 16, -2.58);
        }''')
        page.wait_for_timeout(1500)
        p2 = os.path.join(ARTIFACT_DIR, '02_tien_sanh_npc_be_mai_va_triet_don_tiep.png')
        page.screenshot(path=p2, full_page=True)
        print("Saved:", p2)

        # 2. Standing in rotunda looking towards Gate 12 & 11 and NPCs Hoàng & Cô Thu
        print("Capturing Photo 3 (Eye-Level): Tiền sảnh Lớp 11 & 12 với NPC Hoàng và Cô Thu...")
        page.evaluate('''() => {
            const dbg = window.DUAL_WORLD_DEBUG;
            // Looking towards Grade 11 & 12
            dbg.teleport(12, 16, 2.3);
        }''')
        page.wait_for_timeout(1500)
        p3 = os.path.join(ARTIFACT_DIR, '03_tien_sanh_npc_hoang_va_co_thu_truoc_cong.png')
        page.screenshot(path=p3, full_page=True)
        print("Saved:", p3)

        # 3. Inside Grade 12 - eye level
        print("Capturing Photo 5 (Eye-Level): Inside Grade 12 (Imperial Gold)...")
        page.evaluate('''() => {
            window.DUAL_WORLD_DEBUG.gotoGrade(12);
        }''')
        page.wait_for_timeout(2000)
        p5 = os.path.join(ARTIFACT_DIR, '05_phong_toan_12_san_hoang_kim_vang_rua.png')
        page.screenshot(path=p5, full_page=True)
        print("Saved:", p5)

        # 4. Inside Grade 6 - eye level
        print("Capturing Photo 6 (Eye-Level): Inside Grade 6 (Teal)...")
        page.evaluate('''() => {
            window.DUAL_WORLD_DEBUG.gotoGrade(6);
        }''')
        page.wait_for_timeout(2000)
        p6 = os.path.join(ARTIFACT_DIR, '06_phong_toan_6_san_ngoc_lam_ruc_ro.png')
        page.screenshot(path=p6, full_page=True)
        print("Saved:", p6)

        # 5. Inside Grade 10 - eye level
        print("Capturing Photo 7 (Eye-Level): Inside Grade 10 (Amethyst Violet)...")
        page.evaluate('''() => {
            window.DUAL_WORLD_DEBUG.gotoGrade(10);
        }''')
        page.wait_for_timeout(2000)
        p7 = os.path.join(ARTIFACT_DIR, '07_phong_toan_10_san_tim_thach_anh.png')
        page.screenshot(path=p7, full_page=True)
        print("Saved:", p7)

        # 6. Eye-level view of Rotunda Wall Bay with Banners and Lounge Benches
        print("Capturing Photo 8 (Eye-Level): Rotunda Bay with Banners & Lounge Bench...")
        page.evaluate('''() => {
            const dbg = window.DUAL_WORLD_DEBUG;
            dbg.teleport(22, 22, -0.6);
        }''')
        page.wait_for_timeout(1500)
        p8 = os.path.join(ARTIFACT_DIR, '08_trang_tri_sanh_co_phuon_va_ghe_sofa.png')
        page.screenshot(path=p8, full_page=True)
        print("Saved:", p8)

        browser.close()
        print("=== EYE-LEVEL CAPTURE COMPLETED ===")

if __name__ == '__main__':
    run()

