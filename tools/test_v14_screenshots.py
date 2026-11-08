import os, sys, time
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:4190/'
ARTIFACT_DIR = r'C:\Users\boyme\.gemini\antigravity\brain\33e2fe14-98c5-444e-a164-fe263d17f5c0'

def run():
    print("=== CAPTURING V14 QA SCREENSHOTS ===")
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
        page.wait_for_timeout(3000)

        # 1. Grand Campus - Overview from spawn (z=47) looking towards the Plaza and two buildings
        print("1. Capturing Grand Campus Overview...")
        page.evaluate('''() => {
            window.DUAL_WORLD_DEBUG.teleport(0, 42, 0);
            window.DUAL_WORLD_DEBUG.setCameraDolly(7.5);
        }''')
        page.wait_for_timeout(1500)
        p1 = os.path.join(ARTIFACT_DIR, 'v14_01_sanh_chung_toan_canh_la_ban_va_dai_phun_nuoc.png')
        page.screenshot(path=p1, full_page=True)
        print("Saved:", p1)

        # 2. Close-up of Infinity Möbius Fountain and Grand Bipolar Compass
        print("2. Capturing Infinity Mobius Fountain...")
        page.evaluate('''() => {
            window.DUAL_WORLD_DEBUG.teleport(0, 27, 0);
            window.DUAL_WORLD_DEBUG.setCameraDolly(5.5);
        }''')
        page.wait_for_timeout(1500)
        p2 = os.path.join(ARTIFACT_DIR, 'v14_02_sanh_chung_dai_phun_nuoc_mobius_can_canh.png')
        page.screenshot(path=p2, full_page=True)
        print("Saved:", p2)

        # 3. View at the Boulevard Fork looking at the two Wayfinding Totems
        print("3. Capturing Boulevard Fork and Totems...")
        page.evaluate('''() => {
            window.DUAL_WORLD_DEBUG.teleport(0, 8, 0);
            window.DUAL_WORLD_DEBUG.setCameraDolly(6.5);
        }''')
        page.wait_for_timeout(1500)
        p3 = os.path.join(ARTIFACT_DIR, 'v14_03_sanh_chung_nga_re_hai_dai_lo_va_totem.png')
        page.screenshot(path=p3, full_page=True)
        print("Saved:", p3)

        # 4. Reception Pavilion and NPC Cô An
        print("4. Capturing Reception Pavilion...")
        page.evaluate('''() => {
            window.DUAL_WORLD_DEBUG.teleport(0, -5, 0);
            window.DUAL_WORLD_DEBUG.setCameraDolly(5.0);
        }''')
        page.wait_for_timeout(1500)
        p4 = os.path.join(ARTIFACT_DIR, 'v14_04_sanh_chung_quay_le_tan_co_an_hoang_gia.png')
        page.screenshot(path=p4, full_page=True)
        print("Saved:", p4)

        # 5. Enter Museum - Rotunda with clean marble sectors and math frescoes
        print("5. Capturing Clean Museum Rotunda...")
        page.evaluate('() => window.DUAL_WORLD_DEBUG.enterMuseum()')
        page.wait_for_timeout(2000)
        page.evaluate('''() => {
            const select = document.getElementById('camera-mode');
            select.value = 'top';
            select.dispatchEvent(new Event('change'));
            window.DUAL_WORLD_DEBUG.teleport(0, 4, 0);
            window.DUAL_WORLD_DEBUG.setCameraDolly(16);
        }''')
        page.wait_for_timeout(1500)
        p5 = os.path.join(ARTIFACT_DIR, 'v14_05_bao_tang_sanh_trung_tam_khong_roi_mat.png')
        page.screenshot(path=p5, full_page=True)
        print("Saved:", p5)

        # 6. Eye-level looking towards Southern Gate (verifying Crystal Infinity Museum label orientation)
        print("6. Capturing Return Gate Label Orientation...")
        page.evaluate('''() => {
            const select = document.getElementById('camera-mode');
            select.value = 'third';
            select.dispatchEvent(new Event('change'));
            window.DUAL_WORLD_DEBUG.teleport(0, 10, 0);
            window.DUAL_WORLD_DEBUG.setCameraDolly(6.5);
        }''')
        page.wait_for_timeout(1500)
        p6 = os.path.join(ARTIFACT_DIR, 'v14_06_bien_crystal_museum_dung_chieu.png')
        page.screenshot(path=p6, full_page=True)
        print("Saved:", p6)

        browser.close()
        print("=== ALL SCREENSHOTS CAPTURED SUCCESSFULLY ===")

if __name__ == '__main__':
    run()

