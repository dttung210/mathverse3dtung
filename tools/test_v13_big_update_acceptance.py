import os, sys, time, json
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:4190/'
ARTIFACT_DIR = r'C:\Users\boyme\.gemini\antigravity\brain\33e2fe14-98c5-444e-a164-fe263d17f5c0'
os.makedirs(ARTIFACT_DIR, exist_ok=True)

def run():
    print("=== STARTING V13 BIG UPDATE ACCEPTANCE & VISUAL QA ===")
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

        print("1. Loading V13 app...")
        page.goto(URL, wait_until='networkidle')
        page.wait_for_timeout(2500)

        # Enter museum
        print("2. Entering Infographic Museum...")
        page.evaluate('() => window.DUAL_WORLD_DEBUG.enterMuseum()')
        page.wait_for_timeout(2000)

        # Inspect V13 Architecture
        v13_arch = page.evaluate('''() => {
            const gallery = window.DUAL_WORLD_DEBUG.getGallery();
            const g = gallery?.group;
            const npcs = gallery?.npcs || [];
            
            // Check sectors
            const sectors = [];
            for (let grade = 6; grade <= 12; grade++) {
                const s = g?.getObjectByName(`SECTOR_FLOOR_GRADE_${grade}`);
                if (s) sectors.push(s.name);
            }
            const southSector = g?.getObjectByName('SECTOR_FLOOR_RETURN_GATE');

            // Check medallions
            const medallions = [];
            for (let grade = 6; grade <= 12; grade++) {
                const m = g?.getObjectByName(`GRADE_${grade}_INLAID_FLOOR_MEDALLION`);
                if (m) medallions.push(m.name);
            }

            // Check chandelier prisms
            const prisms = [];
            for (let i = 0; i < 7; i++) {
                const p = g?.getObjectByName(`RAINBOW_CHANDELIER_PRISM_${i}`);
                if (p) prisms.push(p.name);
            }

            // Check banners & benches
            let bannerCount = 0, benchCount = 0;
            for (let i = 0; i < 8; i++) {
                if (g?.getObjectByName(`ACADEMIC_BANNER_${i}_-1`)) bannerCount++;
                if (g?.getObjectByName(`ACADEMIC_BANNER_${i}_1`)) bannerCount++;
                if (g?.getObjectByName(`ROTUNDA_LOUNGE_BENCH_${i}`)) benchCount++;
            }

            // Check NPC positions (must be outside at r ~ 43.5 - 44m, in rotunda plaza!)
            const npcDetails = npcs.map(n => {
                const r = Math.hypot(n.position.x, n.position.z);
                return {
                    grade: n.grade,
                    name: n.profile.name,
                    x: Number(n.position.x.toFixed(2)),
                    z: Number(n.position.z.toFixed(2)),
                    r: Number(r.toFixed(2)),
                    isOutsideInRotunda: r < 47.0
                };
            });

            // Check Room floor colors
            const roomColors = [];
            for (let grade = 6; grade <= 12; grade++) {
                const r = gallery?.rooms?.get(grade);
                const colHex = r?.floor?.color ? '#' + r.floor.color.getHexString() : null;
                roomColors.push({ grade, hex: colHex });
            }

            return {
                sectorCount: sectors.length,
                hasSouthSector: !!southSector,
                medallionCount: medallions.length,
                prismCount: prisms.length,
                bannerCount,
                benchCount,
                npcDetails,
                roomColors
            };
        }''')
        print("V13 Architecture Verification:", json.dumps(v13_arch, ensure_ascii=False, indent=2))
        results['v13_arch'] = v13_arch

        # Photo 1: Overview of Central Rotunda showing Multicolored Radial Marble Floor
        print("3. Capturing Photo 1: Radial Multicolored Marble Floor (Kiệt tác la bàn 7 sắc màu)...")
        page.evaluate('''() => {
            const dbg = window.DUAL_WORLD_DEBUG;
            dbg.teleport(0, 12, 0); // Position near center looking north
            dbg.setCameraDolly(16);
        }''')
        # Switch to top/overview angle
        page.keyboard.press('KeyC') # switch camera view
        page.wait_for_timeout(500)
        page.keyboard.press('KeyC')
        page.wait_for_timeout(1000)
        p1 = os.path.join(ARTIFACT_DIR, '01_san_sanh_trung_tam_da_sac_7_canh_quat.png')
        page.screenshot(path=p1, full_page=True)
        print("Saved:", p1)

        # Switch back to third person
        print("4. Resetting camera mode...")
        page.evaluate('''() => {
            const dbg = window.DUAL_WORLD_DEBUG;
            // teleport to center facing north (towards Grade 9)
            dbg.teleport(0, 4, 0);
            dbg.setCameraDolly(7.9);
        }''')
        page.wait_for_timeout(1000)

        # Photo 2: Standing at center, looking towards Grade 6 and Grade 7 with NPCs standing in front
        print("5. Capturing Photo 2: Tiền sảnh Lớp 6 & 7 với NPC Bé Mai và Bạn Triết đón tiếp...")
        page.evaluate('''() => {
            const dbg = window.DUAL_WORLD_DEBUG;
            // Look towards Grade 6 / 7 (angle ~ -2.1 rad)
            dbg.teleport(0, 0, -2.2);
        }''')
        page.wait_for_timeout(1500)
        p2 = os.path.join(ARTIFACT_DIR, '02_tien_sanh_npc_be_mai_va_triet_don_tiep.png')
        page.screenshot(path=p2, full_page=True)
        print("Saved:", p2)

        # Photo 3: Looking towards Grade 11 and Grade 12 with NPCs Hoàng and Cô Thu in front of doors
        print("6. Capturing Photo 3: Tiền sảnh Lớp 11 & 12 với NPC Hoàng và Cô Thu...")
        page.evaluate('''() => {
            const dbg = window.DUAL_WORLD_DEBUG;
            // Angle looking towards Grade 11 and 12
            dbg.teleport(0, 0, Math.PI * 0.72);
        }''')
        page.wait_for_timeout(1500)
        p3 = os.path.join(ARTIFACT_DIR, '03_tien_sanh_npc_hoang_va_co_thu_truoc_cong.png')
        page.screenshot(path=p3, full_page=True)
        print("Saved:", p3)

        # Photo 4: Walk up to NPC Cô Thu (Grade 12) in the rotunda and interact
        print("7. Interacting with NPC Cô Thu in rotunda...")
        page.evaluate('''() => {
            const gallery = window.DUAL_WORLD_DEBUG.getGallery();
            const npc12 = gallery?.npcs?.find(n => n.grade === 12);
            if (npc12) {
                // Teleport right next to Cô Thu
                window.DUAL_WORLD_DEBUG.teleport(npc12.position.x - 2.5, npc12.position.z - 1.5, Math.atan2(npc12.position.x, npc12.position.z));
            }
        }''')
        page.wait_for_timeout(1000)
        page.keyboard.press('KeyE')
        page.wait_for_timeout(1200)
        p4 = os.path.join(ARTIFACT_DIR, '04_hop_thoai_npc_co_thu_vao_phong_toan_12.png')
        page.screenshot(path=p4, full_page=True)
        print("Saved:", p4)

        # Click button "[▶ VÀO PHÒNG BẮT ĐẦU TỪ BÀI 1]"
        print("8. Clicking '[▶ VÀO PHÒNG BẮT ĐẦU TỪ BÀI 1]'...")
        page.click('#grade-guide-start')
        page.wait_for_timeout(2000)

        # Photo 5: Inside Grade 12 Room - Imperial Gold floor, walls, and ceiling
        print("9. Capturing Photo 5: Bên trong Phòng Toán 12 - Sàn và không gian Hoàng Kim...")
        p5 = os.path.join(ARTIFACT_DIR, '05_phong_toan_12_san_hoang_kim_vang_rua.png')
        page.screenshot(path=p5, full_page=True)
        print("Saved:", p5)

        # Photo 6: Inside Grade 6 Room - Teal ocean floor & walls
        print("10. Visiting Grade 6 room...")
        page.evaluate('() => window.DUAL_WORLD_DEBUG.gotoGrade(6)')
        page.wait_for_timeout(2000)
        p6 = os.path.join(ARTIFACT_DIR, '06_phong_toan_6_san_ngoc_lam_ruc_ro.png')
        page.screenshot(path=p6, full_page=True)
        print("Saved:", p6)

        # Photo 7: Inside Grade 10 Room - Amethyst Violet floor & walls
        print("11. Visiting Grade 10 room...")
        page.evaluate('() => window.DUAL_WORLD_DEBUG.gotoGrade(10)')
        page.wait_for_timeout(2000)
        p7 = os.path.join(ARTIFACT_DIR, '07_phong_toan_10_san_tim_thach_anh.png')
        page.screenshot(path=p7, full_page=True)
        print("Saved:", p7)

        # Photo 8: Wall Bay with Banners, Fresco Murals, Sconces, and Lounge Benches
        print("12. Capturing Photo 8: Vách sảnh với Cờ phướn học thuật, Phù điêu và Ghế sofa cẩm thạch...")
        page.evaluate('''() => {
            const dbg = window.DUAL_WORLD_DEBUG;
            // Stand at rotunda wall bay between portals
            dbg.teleport(24, 24, 0.4);
        }''')
        page.wait_for_timeout(1500)
        p8 = os.path.join(ARTIFACT_DIR, '08_trang_tri_sanh_co_phuon_va_ghe_sofa.png')
        page.screenshot(path=p8, full_page=True)
        print("Saved:", p8)

        browser.close()
        print("=== ALL V13 ACCEPTANCE SCREENSHOTS CAPTURED SUCCESSFULLY ===")
        return results

if __name__ == '__main__':
    run()

