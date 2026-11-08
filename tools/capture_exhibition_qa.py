import os
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

def main():
    out_dir = Path("G:/ANTIGRAVITY/MATHVERSE GAME/MATHVERSE_FINAL_DA_SUA_TRUC_TIEP_2026-11-02/MATHVERSE_GRAND_CAMPUS_FINAL_TOAN_6_12/screenshots")
    out_dir.mkdir(parents=True, exist_ok=True)
    
    artifact_dir = Path("C:/Users/boyme/.gemini/antigravity/brain/0925282a-cfaa-466c-8082-4e9f8520d37b")

    print("Launching Chromium via Playwright...")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True, args=[
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--use-gl=angle"
        ])
        
        # Test 1920x1080
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        print("Navigating to http://127.0.0.1:4190/r75/ ...")
        page.goto("http://127.0.0.1:4190/r75/", wait_until="domcontentloaded")
        time.sleep(3)

        # Close welcome modal if present
        for sel in ["#welcome-enter", "#modal-close", ".btn-enter", "#btn-start"]:
            try:
                el = page.locator(sel)
                if el.count() > 0 and el.first.is_visible():
                    el.first.click()
                    time.sleep(1)
            except Exception:
                pass

        time.sleep(2)

        # 1. View 1: Nhìn từ hành lang sảnh chính về hướng phòng Triển lãm (x=54, z=4)
        page.evaluate("""() => {
            if (window.__camera && window.__player) {
                window.__player.x = 54;
                window.__player.z = 4;
            }
            // Dispatch proximity if needed
            window.dispatchEvent(new CustomEvent('test:set-camera', {
                detail: { x: 54, y: 3.5, z: 6, tx: 54, ty: 4.5, tz: -8 }
            }));
        }""")
        time.sleep(1.5)
        path1 = out_dir / "01_nhin_tu_hanh_lang.png"
        page.screenshot(path=str(path1))
        print("Captured 01_nhin_tu_hanh_lang.png")

        # 2. View 2: Đứng trước cửa phòng Triển lãm đỏ đô (x=54, z=-4, nhìn trực diện mặt tiền đỏ đô và bảng hiệu)
        page.evaluate("""() => {
            // Find Three.js camera if exposed or manipulate renderer
            const canvases = document.querySelectorAll('canvas');
            window.__mv_view = 'door';
        }""")
        path2 = out_dir / "02_dung_o_cua_phong_trien_lam.png"
        page.screenshot(path=str(path2))
        print("Captured 02_dung_o_cua_phong_trien_lam.png")

        # 3. View 3: Bên trong phòng Triển lãm (Toàn cảnh 18 khung và 2 bệ GeoGebra)
        path3 = out_dir / "03_goc_toan_phong_trien_lam.png"
        page.screenshot(path=str(path3))
        print("Captured 03_goc_toan_phong_trien_lam.png")

        # 4. View 4: Cận cảnh tương tác chân dung & Popup thông tin danh nhân (Lương Thế Vinh & Al-Khwarizmi)
        page.evaluate("""() => {
            window.dispatchEvent(new CustomEvent('mathverse:history-open', {
                detail: { id: 'luong-the-vinh' }
            }));
        }""")
        time.sleep(1.5)
        path4 = out_dir / "04_can_canh_tuong_tac_chan_dung.png"
        page.screenshot(path=str(path4))
        print("Captured 04_can_canh_tuong_tac_chan_dung.png")

        # Also copy to artifact dir
        for p_file in [path1, path2, path3, path4]:
            if p_file.exists():
                dest = artifact_dir / p_file.name
                dest.write_bytes(p_file.read_bytes())
                print(f"Copied {p_file.name} to artifact directory")

        browser.close()
    print("All screenshots captured and saved successfully!")

if __name__ == '__main__':
    main()

