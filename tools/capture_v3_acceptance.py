import os, sys, time
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

BASE_URL = 'http://127.0.0.1:4190/'
HARNESS_URL = 'http://127.0.0.1:4190/test_harness_v3.html'
ARTIFACT_DIR = r'C:\Users\boyme\.gemini\antigravity\brain\0925282a-cfaa-466c-8082-4e9f8520d37b'

def capture_all():
    print("=== BAT DAU CHUP ANH WEBGL NGHIEM THU V3 ===")
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
        page = browser.new_page(viewport={'width': 1600, 'height': 900})

        # 1. Open Harness
        print("Opening test harness...")
        page.goto(HARNESS_URL, wait_until='networkidle')
        page.wait_for_timeout(2000)

        # 2. chop3 at 0%
        print("Capturing 1: chop3 at 0%...")
        page.evaluate("window.V3_QA.renderChop3(0)")
        page.wait_for_timeout(1000)
        p1 = os.path.join(ARTIFACT_DIR, 'nghiem_thu_v3_01_chop3_0_folded.png')
        page.screenshot(path=p1)
        print("Saved:", p1)

        # 3. chop3 at 50%
        print("Capturing 2: chop3 at 50%...")
        page.evaluate("window.V3_QA.renderChop3(50)")
        page.wait_for_timeout(1000)
        p2 = os.path.join(ARTIFACT_DIR, 'nghiem_thu_v3_02_chop3_50_unfolding.png')
        page.screenshot(path=p2)
        print("Saved:", p2)

        # 4. chop3 at 100%
        print("Capturing 3: chop3 at 100%...")
        page.evaluate("window.V3_QA.renderChop3(100)")
        page.wait_for_timeout(1000)
        p3 = os.path.join(ARTIFACT_DIR, 'nghiem_thu_v3_03_chop3_100_flat_net.png')
        page.screenshot(path=p3)
        print("Saved:", p3)

        # 5. lapphuong at 100%
        print("Capturing 4: lapphuong at 100%...")
        page.evaluate("window.V3_QA.renderLapphuong(100)")
        page.wait_for_timeout(1000)
        p4 = os.path.join(ARTIFACT_DIR, 'nghiem_thu_v3_04_lapphuong_100_flat_net.png')
        page.screenshot(path=p4)
        print("Saved:", p4)

        # 6. tdchop4 MNP section
        print("Capturing 5: tdchop4 MNP section with point Q...")
        page.evaluate("window.V3_QA.renderTDChop4()")
        page.wait_for_timeout(1000)
        p5 = os.path.join(ARTIFACT_DIR, 'nghiem_thu_v3_05_tdchop4_mnp_section_with_point_q.png')
        page.screenshot(path=p5)
        print("Saved:", p5)

        # 7. tronxoay at 180 degrees
        print("Capturing 6: tronxoay at 180 degrees...")
        page.evaluate("window.V3_QA.renderTronXoay(180)")
        page.wait_for_timeout(1000)
        p6 = os.path.join(ARTIFACT_DIR, 'nghiem_thu_v3_06_tronxoay_180_degrees.png')
        page.screenshot(path=p6)
        print("Saved:", p6)

        # 8. tronxoay at 360 degrees
        print("Capturing 7: tronxoay at 360 degrees...")
        page.evaluate("window.V3_QA.renderTronXoay(360)")
        page.wait_for_timeout(1000)
        p7 = os.path.join(ARTIFACT_DIR, 'nghiem_thu_v3_07_tronxoay_360_degrees.png')
        page.screenshot(path=p7)
        print("Saved:", p7)

        # 9. oxyz
        print("Capturing 8: oxyz plane...")
        page.evaluate("window.V3_QA.renderOxyz()")
        page.wait_for_timeout(1000)
        p8 = os.path.join(ARTIFACT_DIR, 'nghiem_thu_v3_08_oxyz_plane_normal.png')
        page.screenshot(path=p8)
        print("Saved:", p8)

        # 10. cone unfold
        print("Capturing 9: cone unfold...")
        page.evaluate("window.V3_QA.renderCone(100)")
        page.wait_for_timeout(1000)
        p9 = os.path.join(ARTIFACT_DIR, 'nghiem_thu_v3_09_non_cone_unfold.png')
        page.screenshot(path=p9)
        print("Saved:", p9)

        # 11. cylinder unfold
        print("Capturing 10: cylinder unfold...")
        page.evaluate("window.V3_QA.renderCylinder(100)")
        page.wait_for_timeout(1000)
        p10 = os.path.join(ARTIFACT_DIR, 'nghiem_thu_v3_10_tru_cylinder_unfold.png')
        page.screenshot(path=p10)
        print("Saved:", p10)

        # 12. Main Campus Overview
        print("Capturing 11: Main Campus Overview...")
        page.goto(BASE_URL, wait_until='networkidle')
        page.wait_for_timeout(3000)
        p11 = os.path.join(ARTIFACT_DIR, 'nghiem_thu_v3_11_grand_campus_lab_overview.png')
        page.screenshot(path=p11)
        print("Saved:", p11)

        browser.close()
        print("=== HOAN TAT CHUP TOAN BO ANH NGHIEM THU V3! ===")

if __name__ == '__main__':
    capture_all()

