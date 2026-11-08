import os, sys, time
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:4190/'
ARTIFACT_DIR = r'C:\Users\boyme\.gemini\antigravity\brain\33e2fe14-98c5-444e-a164-fe263d17f5c0'

def run():
    print("=== CAPTURING V17 QA SCREENSHOTS ===")
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

        # 1. Central Rotunda - showing all 7 room entrances and central kiosk
        print("1. Capturing Rotunda 7 Room Entrances...")
        page.evaluate('''() => {
            window.DUAL_WORLD_DEBUG.enterMuseum();
            const select = document.getElementById('camera-mode');
            select.value = 'top';
            select.dispatchEvent(new Event('change'));
            window.DUAL_WORLD_DEBUG.teleport(0, 10, 0);
            window.DUAL_WORLD_DEBUG.setCameraDolly(16.5);
        }''')
        page.wait_for_timeout(2000)
        p1 = os.path.join(ARTIFACT_DIR, 'v17_01_sanh_rotunda_nhin_thay_7_cua_phong_hinh_quat.png')
        page.screenshot(path=p1, full_page=True)
        print("Saved:", p1)

        # 2. Grade 6 Room - Wide overview showing the horizontal rows (6-7-9-10-11) & S-curve aisles
        print("2. Capturing Grade 6 S-curve Horizontal Rows...")
        page.evaluate('''() => {
            const select = document.getElementById('camera-mode');
            select.value = 'overview';
            select.dispatchEvent(new Event('change'));
            const room6 = window.DUAL_WORLD_DEBUG.getPlan().find(p => p.grade === 6);
            const theta = room6.theta;
            // Stand near the entrance facing into the room
            const pos = { x: 56 * Math.sin(theta), z: -56 * Math.cos(theta) };
            window.DUAL_WORLD_DEBUG.teleport(pos.x, pos.z, theta);
            window.DUAL_WORLD_DEBUG.setCameraDolly(15.0);
        }''')
        page.wait_for_timeout(2500)
        p2 = os.path.join(ARTIFACT_DIR, 'v17_02_phong_toan_6_hang_ngang_chu_s.png')
        page.screenshot(path=p2, full_page=True)
        print("Saved:", p2)

        # 3. Grade 6 Room - Walking inside Row 1 aisle looking at Lesson 1..3
        print("3. Capturing Grade 6 Row 1 Posters & Spotlight...")
        page.evaluate('''() => {
            const select = document.getElementById('camera-mode');
            select.value = 'third';
            select.dispatchEvent(new Event('change'));
            const gallery = window.DUAL_WORLD_DEBUG.getGallery();
            const p1 = gallery.posters.find(p => p.item.grade === 6 && p.item.number === 1);
            if (p1) {
                const viewing = gallery.getViewingSpot(p1);
                window.DUAL_WORLD_DEBUG.teleport(viewing.x, viewing.z, viewing.yaw);
            }
            window.DUAL_WORLD_DEBUG.setCameraDolly(5.2);
        }''')
        page.wait_for_timeout(2500)
        p3 = os.path.join(ARTIFACT_DIR, 'v17_03_phong_toan_6_loi_di_va_bien_ten_bai.png')
        page.screenshot(path=p3, full_page=True)
        print("Saved:", p3)

        # 4. View of the rear face of a row partition wall showing math relief plaques
        print("4. Capturing Rear Wall Relief Plaques...")
        page.evaluate('''() => {
            // Stand in aisle between Row 1 and Row 2, looking at back of Row 1
            const room6 = window.DUAL_WORLD_DEBUG.getPlan().find(p => p.grade === 6);
            const theta = room6.theta;
            // Radius 70m (between row 1 at 62m and row 2 at 78m), facing inward towards row 1 back
            const pos = { x: 70 * Math.sin(theta), z: -70 * Math.cos(theta) };
            window.DUAL_WORLD_DEBUG.teleport(pos.x, pos.z, theta + Math.PI);
            window.DUAL_WORLD_DEBUG.setCameraDolly(6.5);
        }''')
        page.wait_for_timeout(2000)
        p4 = os.path.join(ARTIFACT_DIR, 'v17_04_mat_sau_vach_ngan_hoa_van_toan_hoc.png')
        page.screenshot(path=p4, full_page=True)
        print("Saved:", p4)

        # 5. In front of the Purple Return Gate directly after Lesson 43
        print("5. Capturing Purple Return Gate after Lesson 43...")
        page.evaluate('''() => {
            const gallery = window.DUAL_WORLD_DEBUG.getGallery();
            const gate6 = gallery.roomReturnGates.find(g => g.grade === 6);
            if (gate6) {
                const pos = gate6.position;
                const room6 = gallery.plan.find(p => p.grade === 6);
                const inFront = {
                    x: pos.x - 3.8 * Math.sin(room6.theta),
                    z: pos.z + 3.8 * Math.cos(room6.theta)
                };
                window.DUAL_WORLD_DEBUG.teleport(inFront.x, inFront.z, -room6.theta);
            }
            window.DUAL_WORLD_DEBUG.setCameraDolly(6.5);
        }''')
        page.wait_for_timeout(2500)
        p5 = os.path.join(ARTIFACT_DIR, 'v17_05_cua_tim_ve_sanh_sau_bai_43.png')
        page.screenshot(path=p5, full_page=True)
        print("Saved:", p5)

        # 6. Interact with Return Gate and safely return to Rotunda Kiosk
        print("6. Interacting with Purple Return Gate to Rotunda...")
        page.evaluate('''() => {
            const eKey = new KeyboardEvent('keydown', { key: 'e', bubbles: true });
            window.dispatchEvent(eKey);
        }''')
        page.wait_for_timeout(2000)
        p6 = os.path.join(ARTIFACT_DIR, 'v17_06_tuong_tac_cua_tim_tro_ve_sanh_rotunda.png')
        page.screenshot(path=p6, full_page=True)
        print("Saved:", p6)

        # 7. Grade 9 Room - 4 rows (6-7-9-10) and Purple Return Gate on the LEFT after Lesson 32
        print("7. Capturing Grade 9 Room (Gate on Left)...")
        page.evaluate('''() => {
            const select = document.getElementById('camera-mode');
            select.value = 'overview';
            select.dispatchEvent(new Event('change'));
            const room9 = window.DUAL_WORLD_DEBUG.getPlan().find(p => p.grade === 9);
            const pos = { x: 70 * Math.sin(room9.theta), z: -70 * Math.cos(room9.theta) };
            window.DUAL_WORLD_DEBUG.teleport(pos.x, pos.z, room9.theta);
            window.DUAL_WORLD_DEBUG.setCameraDolly(16.0);
        }''')
        page.wait_for_timeout(2500)
        p7 = os.path.join(ARTIFACT_DIR, 'v17_07_phong_toan_9_cua_tim_ben_trai.png')
        page.screenshot(path=p7, full_page=True)
        print("Saved:", p7)

        # 8. Grade 12 Room - 3 rows (5-6-8) and Purple Return Gate on the RIGHT after Lesson 19
        print("8. Capturing Grade 12 Room (Gate on Right)...")
        page.evaluate('''() => {
            const room12 = window.DUAL_WORLD_DEBUG.getPlan().find(p => p.grade === 12);
            const pos = { x: 70 * Math.sin(room12.theta), z: -70 * Math.cos(room12.theta) };
            window.DUAL_WORLD_DEBUG.teleport(pos.x, pos.z, room12.theta);
            window.DUAL_WORLD_DEBUG.setCameraDolly(16.0);
        }''')
        page.wait_for_timeout(2500)
        p8 = os.path.join(ARTIFACT_DIR, 'v17_08_phong_toan_12_cua_tim_ben_phai.png')
        page.screenshot(path=p8, full_page=True)
        print("Saved:", p8)

        browser.close()
        print("=== ALL 8 V17 SCREENSHOTS CAPTURED SUCCESSFULLY ===")

if __name__ == '__main__':
    run()
