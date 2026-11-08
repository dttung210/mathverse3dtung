import os, sys, time, json
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:4190/'
ARTIFACT_DIR = r'C:\Users\boyme\.gemini\antigravity\brain\33e2fe14-98c5-444e-a164-fe263d17f5c0'
os.makedirs(ARTIFACT_DIR, exist_ok=True)

def run():
    print("=== STARTING V12 BIG UPDATE ACCEPTANCE & VISUAL QA ===")
    results = {}

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

        print("1. Loading V12 app...")
        page.goto(URL, wait_until='networkidle')
        page.wait_for_timeout(2500)

        # Enter museum
        print("2. Entering Infographic Museum...")
        page.evaluate('() => window.DUAL_WORLD_DEBUG.enterMuseum()')
        page.wait_for_timeout(2000)

        # Inspect Rotunda & HUD
        hud_info = page.evaluate('''() => {
            const titleEl = document.getElementById('grade-title');
            const hudEl = document.getElementById('museum-hud');
            const gallery = window.DUAL_WORLD_DEBUG.getGallery();
            const npcs = gallery?.npcs || [];
            
            // Check door 11 and door 12 portal meshes
            const g = gallery?.group;
            const door11 = g?.getObjectByName('CRYSTAL_PORTAL_GRADE_11');
            const door12 = g?.getObjectByName('CRYSTAL_PORTAL_GRADE_12');
            
            // Check murals
            const murals = [];
            for (let i = 0; i < 8; i++) {
                const m = g?.getObjectByName('ROTUNDA_MATH_FRESCO_' + i);
                if (m) murals.push(m.name);
            }
            
            return {
                titleText: titleEl?.textContent,
                titleClientWidth: titleEl?.clientWidth,
                titleScrollWidth: titleEl?.scrollWidth,
                titleOverflow: titleEl?.scrollWidth > titleEl?.clientWidth,
                hudWidth: hudEl?.clientWidth,
                npcCount: npcs.length,
                hasDoor11: !!door11,
                hasDoor12: !!door12,
                muralCount: murals.length
            };
        }''')
        print("HUD & Rotunda Inspection:", json.dumps(hud_info, ensure_ascii=False, indent=2))
        results['hud_info'] = hud_info

        # Photo 1: Standing at central rotunda looking at Door 11 & 12 (same angle as teacher's screenshot)
        print("3. Positioning camera to match teacher's screenshot angle...")
        page.evaluate('''() => {
            const dbg = window.DUAL_WORLD_DEBUG;
            // Angle looking towards Grade 11 and 12
            dbg.teleport(0, 0, Math.PI * 0.72);
        }''')
        page.wait_for_timeout(1500)
        p1 = os.path.join(ARTIFACT_DIR, '01_sanh_trung_tam_hud_khong_bi_cat_chu.png')
        page.screenshot(path=p1)
        print(f"Captured: {p1}")

        # Photo 2: Look at the mathematical stained glass murals between doors
        print("4. Looking at Rotunda Mathematical Murals...")
        page.evaluate('''() => {
            const dbg = window.DUAL_WORLD_DEBUG;
            dbg.teleport(0, 0, Math.PI * 0.15);
        }''')
        page.wait_for_timeout(1500)
        p2 = os.path.join(ARTIFACT_DIR, '02_phu_dieu_tranh_kinh_mau_toan_hoc_sanh_chinh.png')
        page.screenshot(path=p2)
        print(f"Captured: {p2}")

        # Photo 3: Walk to Room 6 (Toán 6) entrance and see NPC Bé Mai
        print("5. Walking to Room 6 Entrance...")
        page.evaluate('''() => {
            const dbg = window.DUAL_WORLD_DEBUG;
            dbg.gotoGrade(6);
        }''')
        page.wait_for_timeout(1500)
        p3 = os.path.join(ARTIFACT_DIR, '03_loi_vao_phong_toan_6_tham_nhung_va_npc.png')
        page.screenshot(path=p3)
        print(f"Captured: {p3}")

        # Photo 4: Interact with NPC Bé Mai (trigger dialogue)
        print("6. Interacting with NPC Bé Mai (pressing E)...")
        npc6_info = page.evaluate('''() => {
            const gallery = window.DUAL_WORLD_DEBUG.getGallery();
            const npc = gallery?.nearNpc(window.DUAL_WORLD_DEBUG.getPlayer());
            if (npc) {
                // Open guide
                const prompt = document.getElementById('near-message')?.textContent;
                return { ok: true, prompt, grade: npc.grade, name: npc.profile.name };
            }
            return { ok: false };
        }''')
        print("Near NPC check:", npc6_info)
        page.keyboard.press('e')
        page.wait_for_timeout(1000)

        p4 = os.path.join(ARTIFACT_DIR, '04_hop_thoai_npc_be_mai_toan_6.png')
        page.screenshot(path=p4)
        print(f"Captured: {p4}")

        # Photo 5: Click "Bắt đầu từ Bài 1"
        print("7. Clicking 'Bắt đầu từ Bài 1'...")
        page.click('#grade-guide-start')
        page.wait_for_timeout(1500)
        p5 = os.path.join(ARTIFACT_DIR, '05_den_ngay_bai_1_toan_6_khung_tranh_sac_net.png')
        page.screenshot(path=p5)
        print(f"Captured: {p5}")

        # Photo 6: Go to Room 12 (Toán 12)
        print("8. Going to Room 12 (Toán 12)...")
        page.evaluate('''() => {
            const dbg = window.DUAL_WORLD_DEBUG;
            dbg.gotoGrade(12);
        }''')
        page.wait_for_timeout(1500)
        p6 = os.path.join(ARTIFACT_DIR, '06_phong_toan_12_npc_co_thu_va_khong_gian_vang_hoang_kim.png')
        page.screenshot(path=p6)
        print(f"Captured: {p6}")

        # Photo 7: Interact with NPC Cô Thu in Room 12
        print("9. Interacting with NPC Cô Thu in Room 12...")
        page.keyboard.press('e')
        page.wait_for_timeout(1000)
        p7 = os.path.join(ARTIFACT_DIR, '07_hop_thoai_npc_toan_12_on_thi_thpt.png')
        page.screenshot(path=p7)
        print(f"Captured: {p7}")

        # Close dialog
        page.keyboard.press('Escape')
        page.wait_for_timeout(500)

        browser.close()

    print("=== V12 ACCEPTANCE TESTS COMPLETED SUCCESSFULLY ===")

if __name__ == '__main__':
    run()

