import os, sys, time, json
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:4190/'
SCREENSHOT_DIR = 'QA_ANH_KIEM_TRA_V11'
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def run_tests():
    print("=== STARTING MATHVERSE GRAND CAMPUS V11 ACCEPTANCE TESTS ===")
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
        
        # 1. Open URL
        print(f"1. Loading V11 page: {URL}")
        page.goto(URL, wait_until='networkidle')
        page.wait_for_timeout(3000)
        
        title = page.title()
        print(f"Page Title: {title}")
        results['title'] = title
        
        # 2. Inspect Grand Campus V11 Plaza & 3D Elements
        print("2. Inspecting Plaza & 3D Elements...")
        scene_elements = page.evaluate('''() => {
            const grand = window.DUAL_WORLD_DEBUG?.getGrand?.();
            if (!grand) return { ok: false, error: 'No grand dome found' };
            const g = grand.group;
            
            // Check NPC
            const npc = g.getObjectByName('NPC_HUONG_DAN_R75_AVATAR');
            const desk = g.getObjectByName('NPC_GREETING_AND_INFORMATION_DESK');
            const uniform = g.getObjectByName('NPC_RECEPTION_STAFF_UNIFORM');
            const downlight = g.getObjectByName('RECEPTION_CEILING_DOWNLIGHT');
            const pavilion = g.getObjectByName('CENTRAL_RECEPTION_PAVILION');
            
            // Check Buildings
            const lab = g.getObjectByName('MATHVERSE_R75_LAB_EXTERIOR');
            const labBlock = lab?.getObjectByName('LAB_RESEARCH_MAIN_BLOCK');
            const labBays = lab?.getObjectByName('LAB_GLASS_FACADE_BAYS');
            
            const museum = g.getObjectByName('CRYSTAL_INFINITY_MUSEUM_EXTERIOR');
            const museumGalleries = museum?.getObjectByName('MUSEUM_SEVEN_RADIAL_PETAL_GALLERIES');
            const museumOculus = museum?.getObjectByName('MUSEUM_PETAL_GLASS_OCULUS');
            
            // Check Walkways
            const labWalkway = g.getObjectByName('SYMMETRIC_LAB_WALKWAY');
            const museumWalkway = g.getObjectByName('SYMMETRIC_MUSEUM_WALKWAY');
            
            // Check Mega Dome
            const megaDome = g.getObjectByName('SHARED_MEGA_DOME_COVERS_TWO_BUILDINGS');
            
            return {
                ok: true,
                npc: {
                    exists: !!npc,
                    x: npc?.position.x,
                    y: npc?.position.y,
                    z: npc?.position.z,
                    scaleX: npc?.scale.x,
                    hasUniform: !!uniform,
                    hasDownlight: !!downlight,
                    hasPavilion: !!pavilion,
                    hasDesk: !!desk
                },
                lab: {
                    exists: !!lab,
                    hasMainBlock: !!labBlock,
                    hasGlassBays: !!labBays,
                    posX: lab?.position.x
                },
                museum: {
                    exists: !!museum,
                    hasPetalGalleries: !!museumGalleries,
                    hasOculus: !!museumOculus,
                    posX: museum?.position.x
                },
                walkways: {
                    hasLabWalkway: !!labWalkway,
                    hasMuseumWalkway: !!museumWalkway
                },
                megaDome: !!megaDome
            };
        }''')
        print("Scene Elements:", scene_elements)
        results['scene_elements'] = scene_elements
        
        # Capture Plaza overview
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '01_sanh_quang_truong_grand_campus_v11.png'))
        print("Captured: 01_sanh_quang_truong_grand_campus_v11.png")
        
        # 3. Test Reception NPC An interaction & Vietnamese dialogue
        print("3. Testing Reception NPC An...")
        # In V11, Guide anchor is at x: 0, z: -7. Teleport to (0, -3), looking at desk (yaw: Math.PI)
        page.evaluate('() => window.DUAL_WORLD_DEBUG.teleport(0, -3, Math.PI)')
        page.wait_for_timeout(600)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '02_npc_le_tan_an_chinh_giua_hai_toa.png'))
        
        # Press E to open dialogue
        page.keyboard.press('e')
        page.wait_for_timeout(600)
        dialog_visible = page.evaluate('() => !document.getElementById("guide-dialog").hidden')
        dialog_heading = page.evaluate('() => document.getElementById("guide-heading")?.textContent')
        print(f"Guide Dialog visible: {dialog_visible}, heading: {dialog_heading}")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '03_hop_thoai_le_tan_an.png'))
        results['npc_dialog'] = {'visible': dialog_visible, 'heading': dialog_heading}
        page.keyboard.press('Escape')
        page.wait_for_timeout(400)
        
        # 4. Check 3D Signboards (No distortion, proper aspect ratio)
        print("4. Checking Legible 3D Signboards...")
        signs_check = page.evaluate('''() => {
            const grand = window.DUAL_WORLD_DEBUG?.getGrand?.();
            const signs = [];
            grand.group.traverse(obj => {
                if (!obj.name || !obj.name.startsWith('LEGIBLE_SIGN_')) return;
                const dims = obj.material.map?.image;
                if (!dims) return;
                const meshAspect = obj.geometry.parameters.width / obj.geometry.parameters.height;
                const pixelAspect = dims.width / dims.height;
                const diffRatio = Math.abs(meshAspect - pixelAspect) / meshAspect;
                signs.push({
                    name: obj.name,
                    meshAspect: meshAspect.toFixed(3),
                    pixelAspect: pixelAspect.toFixed(3),
                    diffRatio: diffRatio.toFixed(4),
                    ok: diffRatio < 0.02
                });
            });
            return {
                totalSigns: signs.length,
                allOk: signs.every(s => s.ok),
                sample: signs.slice(0, 5)
            };
        }''')
        print("Signboards Check:", signs_check)
        results['signs_check'] = signs_check
        
        # 5. Check Two Symmetric Walkways (Flat, no floating tube barriers)
        print("5. Checking Symmetric Walkways...")
        walkways_check = page.evaluate('''() => {
            const grand = window.DUAL_WORLD_DEBUG?.getGrand?.();
            const g = grand.group;
            const labW = g.getObjectByName('SYMMETRIC_LAB_WALKWAY');
            const musW = g.getObjectByName('SYMMETRIC_MUSEUM_WALKWAY');
            
            // Check position array Y values for flatness
            const labPos = labW.geometry.attributes.position.array;
            let minY = Infinity, maxY = -Infinity;
            for (let i = 1; i < labPos.length; i += 3) {
                const y = labPos[i];
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
            const labHeight = maxY - minY;
            
            // Check if old V9 floating gold tube barriers exist
            const hasFloatingGoldTubes = !!g.getObjectByName('TRUE_INFINITY_LEMNISCATE_OVER_UNDER_RIBBON') ||
                                         !!g.getObjectByName('INFINITY_CROSSOVER_SHARED_GLASS_LINK');
            
            return {
                labFlat: labHeight < 0.07,
                labThickness: labHeight.toFixed(4),
                noFloatingTubes: !hasFloatingGoldTubes,
                hasLabWalkway: !!labW,
                hasMuseumWalkway: !!musW
            };
        }''')
        print("Walkways Check:", walkways_check)
        results['walkways_check'] = walkways_check
        
        # 6. Test Camera Zoom: Mouse Wheel, UI Buttons (+, -, Reset), Keys (+, -, 0)
        print("6. Testing Camera Dolly Zoom...")
        initial_dolly = page.evaluate('() => window.DUAL_WORLD_DEBUG.getCameraDolly()')
        print(f"Initial Camera Dolly: {initial_dolly}")
        
        # 6a. Test '+' button click (zoom in, camera closer)
        page.click('#world-zoom-in')
        page.wait_for_timeout(300)
        dolly_after_in_btn = page.evaluate('() => window.DUAL_WORLD_DEBUG.getCameraDolly()')
        zoom_text_in = page.evaluate('() => document.getElementById("world-zoom-value")?.textContent')
        print(f"Dolly after zoom-in button: {dolly_after_in_btn} (value: {zoom_text_in})")
        
        # 6b. Test '-' button click (zoom out, camera farther)
        page.click('#world-zoom-out')
        page.wait_for_timeout(300)
        dolly_after_out_btn = page.evaluate('() => window.DUAL_WORLD_DEBUG.getCameraDolly()')
        zoom_text_out = page.evaluate('() => document.getElementById("world-zoom-value")?.textContent')
        print(f"Dolly after zoom-out button: {dolly_after_out_btn} (value: {zoom_text_out})")
        
        # 6c. Test Reset button click
        page.click('#world-zoom-reset')
        page.wait_for_timeout(300)
        dolly_after_reset = page.evaluate('() => window.DUAL_WORLD_DEBUG.getCameraDolly()')
        print(f"Dolly after reset button: {dolly_after_reset}")
        
        # 6d. Test Keyboard '+' key
        page.keyboard.press('+')
        page.wait_for_timeout(300)
        dolly_after_key_plus = page.evaluate('() => window.DUAL_WORLD_DEBUG.getCameraDolly()')
        print(f"Dolly after '+' key: {dolly_after_key_plus}")
        
        # 6e. Test Keyboard '-' key
        page.keyboard.press('-')
        page.wait_for_timeout(300)
        dolly_after_key_minus = page.evaluate('() => window.DUAL_WORLD_DEBUG.getCameraDolly()')
        print(f"Dolly after '-' key: {dolly_after_key_minus}")
        
        # 6f. Test Keyboard '0' key (Reset)
        page.keyboard.press('0')
        page.wait_for_timeout(300)
        dolly_after_key_0 = page.evaluate('() => window.DUAL_WORLD_DEBUG.getCameraDolly()')
        print(f"Dolly after '0' key: {dolly_after_key_0}")
        
        # 6g. Test Mouse Wheel on canvas
        page.evaluate('''() => {
            const canvas = document.getElementById("dual-canvas");
            canvas.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true }));
        }''')
        page.wait_for_timeout(300)
        dolly_after_wheel_up = page.evaluate('() => window.DUAL_WORLD_DEBUG.getCameraDolly()')
        
        page.evaluate('''() => {
            const canvas = document.getElementById("dual-canvas");
            canvas.dispatchEvent(new WheelEvent("wheel", { deltaY: 100, bubbles: true }));
        }''')
        page.wait_for_timeout(300)
        dolly_after_wheel_down = page.evaluate('() => window.DUAL_WORLD_DEBUG.getCameraDolly()')
        print(f"Dolly wheel up: {dolly_after_wheel_up}, wheel down: {dolly_after_wheel_down}")
        
        # Reset dolly to default 7.9
        page.evaluate('() => window.DUAL_WORLD_DEBUG.setCameraDolly(7.9)')
        
        results['camera_zoom'] = {
            'initial': initial_dolly,
            'btn_in': dolly_after_in_btn,
            'btn_out': dolly_after_out_btn,
            'btn_reset': dolly_after_reset,
            'key_plus': dolly_after_key_plus,
            'key_minus': dolly_after_key_minus,
            'key_0': dolly_after_key_0,
            'wheel_up': dolly_after_wheel_up,
            'wheel_down': dolly_after_wheel_down
        }
        
        # 7. Visit & Inspect MATHVERSE LAB
        print("7. Visiting MATHVERSE LAB...")
        # Lab trigger is at x: -42, z: -29.5 (triggerRadius: 8.4). Teleport to (-42, -26)
        page.evaluate('() => window.DUAL_WORLD_DEBUG.teleport(-42, -26, 0)')
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '04_mat_tien_kien_truc_toa_nha_lab.png'))
        
        # Enter Lab via E
        page.keyboard.press('e')
        page.wait_for_timeout(2500)
        mode_in_lab = page.evaluate('() => window.DUAL_WORLD_DEBUG.getMode()')
        shell_visible = page.evaluate('() => !document.getElementById("r75-shell").hidden')
        print(f"In Lab Mode: {mode_in_lab}, Shell Visible: {shell_visible}")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '05_phong_lab_r75_goc_hoat_dong.png'))
        results['lab_enter'] = {'mode': mode_in_lab, 'shell_visible': shell_visible}
        
        # Return to lobby
        page.click('#r75-exit')
        page.wait_for_timeout(1000)
        mode_after_lab_exit = page.evaluate('() => window.DUAL_WORLD_DEBUG.getMode()')
        print(f"Mode after Lab exit: {mode_after_lab_exit}")
        
        # 8. Visit & Inspect INFOGRAPHIC MUSEUM (Lớp 6 and Lớp 10)
        print("8. Visiting INFOGRAPHIC MUSEUM...")
        # Museum trigger is at x: 42, z: -29.5 (triggerRadius: 8.4). Teleport to (42, -26)
        page.evaluate('() => window.DUAL_WORLD_DEBUG.teleport(42, -26, 0)')
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '06_mat_tien_kien_truc_toa_nha_museum.png'))
        
        # Enter Museum via E
        page.keyboard.press('e')
        page.wait_for_timeout(2000)
        mode_in_museum = page.evaluate('() => window.DUAL_WORLD_DEBUG.getMode()')
        print(f"In Museum Mode: {mode_in_museum}")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '07_sanh_trung_tam_museum_v11.png'))
        results['museum_enter'] = {'mode': mode_in_museum}
        
        # 8a. Check Grade 6 Hall
        print("Checking Grade 6 Hall...")
        page.evaluate('() => window.DUAL_WORLD_DEBUG.gotoGrade(6)')
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '08_dai_sanh_lop_6_v11.png'))
        
        # Open an infographic in Grade 6 via catalog
        page.keyboard.press('k')
        page.wait_for_timeout(400)
        page.evaluate('''() => {
            const tabs = Array.from(document.querySelectorAll('#catalog-grade-tabs button'));
            const t6 = tabs.find(b => b.textContent.includes('6'));
            if (t6) t6.click();
        }''')
        page.wait_for_timeout(400)
        page.evaluate('''() => {
            const item = document.querySelector('#catalog-grid .catalog-item .catalog-preview');
            if (item) item.click();
        }''')
        page.wait_for_timeout(800)
        
        g6_poster_title = page.evaluate('() => document.getElementById("poster-title")?.textContent')
        g6_poster_src = page.evaluate('() => document.getElementById("poster-image")?.getAttribute("src")')
        print(f"Grade 6 Poster opened: {g6_poster_title}, src: {g6_poster_src}")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '09_infographic_lop_6_modal.png'))
        
        # Test independent infographic zoom inside modal
        dolly_before_poster_zoom = page.evaluate('() => window.DUAL_WORLD_DEBUG.getCameraDolly()')
        page.click('#poster-plus')
        page.wait_for_timeout(200)
        page.click('#poster-plus')
        page.wait_for_timeout(200)
        poster_zoom_text = page.evaluate('() => document.getElementById("poster-zoom-label")?.textContent')
        dolly_after_poster_zoom = page.evaluate('() => window.DUAL_WORLD_DEBUG.getCameraDolly()')
        print(f"Poster Zoom Label: {poster_zoom_text}, 3D Camera Dolly unchanged: {dolly_before_poster_zoom == dolly_after_poster_zoom}")
        results['poster_zoom_independent'] = {
            'zoom_label': poster_zoom_text,
            'dolly_unchanged': dolly_before_poster_zoom == dolly_after_poster_zoom
        }
        page.keyboard.press('Escape')
        page.wait_for_timeout(400)
        
        # 8b. Check Grade 10 Hall
        print("Checking Grade 10 Hall...")
        page.evaluate('() => window.DUAL_WORLD_DEBUG.gotoGrade(10)')
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '10_dai_sanh_lop_10_v11.png'))
        
        # Open an infographic in Grade 10 via catalog
        page.keyboard.press('k')
        page.wait_for_timeout(400)
        page.evaluate('''() => {
            const tabs = Array.from(document.querySelectorAll('#catalog-grade-tabs button'));
            const t10 = tabs.find(b => b.textContent.includes('10'));
            if (t10) t10.click();
        }''')
        page.wait_for_timeout(400)
        page.evaluate('''() => {
            const item = document.querySelector('#catalog-grid .catalog-item .catalog-preview');
            if (item) item.click();
        }''')
        page.wait_for_timeout(800)
        
        g10_poster_title = page.evaluate('() => document.getElementById("poster-title")?.textContent')
        g10_poster_src = page.evaluate('() => document.getElementById("poster-image")?.getAttribute("src")')
        print(f"Grade 10 Poster opened: {g10_poster_title}, src: {g10_poster_src}")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '11_infographic_lop_10_modal.png'))
        page.keyboard.press('Escape')
        page.wait_for_timeout(400)
        
        # 8c. Check Central Classification Podium & Catalog Order
        catalog_validation = page.evaluate('''() => {
            return fetch('/museum-data/catalog.json')
                .then(r => r.json())
                .then(cat => {
                    const grades = [6, 7, 8, 9, 10, 11, 12];
                    const gradeCounts = {};
                    let inOrder = true;
                    for (const g of grades) {
                        const items = cat.items.filter(it => it.grade === g);
                        gradeCounts[g] = items.length;
                        for (let i = 1; i < items.length; i++) {
                            if (items[i].number < items[i-1].number) inOrder = false;
                        }
                    }
                    return {
                        total: cat.total,
                        itemsLength: cat.items.length,
                        gradeCounts,
                        orderedCorrectly: inOrder
                    };
                });
        }''')
        print("Catalog Validation:", catalog_validation)
        results['catalog_validation'] = catalog_validation
        
        # 8d. Return to plaza via existing gate
        print("Returning to Plaza...")
        page.evaluate('() => window.DUAL_WORLD_DEBUG.toLobby()')
        page.wait_for_timeout(1000)
        final_mode = page.evaluate('() => window.DUAL_WORLD_DEBUG.getMode()')
        print(f"Final Mode: {final_mode}")
        results['final_mode'] = final_mode
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, '12_tro_ve_sanh_quang_truong_thanh_cong.png'))
        
        # 9. Check Upload/Download Safety Guarantee
        upload_download_check = page.evaluate('''() => {
            const fileInputs = document.querySelectorAll('input[type="file"]');
            const downloadLinks = document.querySelectorAll('a[download]');
            const textNodes = Array.from(document.querySelectorAll('*')).filter(el => 
                (el.textContent && /tải lên|tải về|upload|download/i.test(el.textContent) && el.tagName === 'BUTTON')
            );
            return {
                fileInputsCount: fileInputs.length,
                downloadLinksCount: downloadLinks.length,
                uploadButtonsCount: textNodes.length
            };
        }''')
        print("Upload/Download Check:", upload_download_check)
        results['upload_download_check'] = upload_download_check
        
        browser.close()
        print("=== ALL V11 TESTS COMPLETED SUCCESSFULLY ===")
        return results

if __name__ == '__main__':
    res = run_tests()
    with open(os.path.join(SCREENSHOT_DIR, 'v11_acceptance_results.json'), 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False, indent=2)
    print("Results saved to QA_ANH_KIEM_TRA_V11/v11_acceptance_results.json")
