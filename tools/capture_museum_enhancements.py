import os, sys, time
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:4190/'
SCREENSHOT_DIR = 'QA_ANH_MUSEUM_UPGRADE'
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

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

    # 1. Đi vào Infographic Museum
    page.evaluate('() => window.DUAL_WORLD_DEBUG.enterMuseum()')
    page.wait_for_timeout(1000)
    page.screenshot(path=os.path.join(SCREENSHOT_DIR, '01_sanh_bao_tang_voi_hud_thong_minh.png'))
    print("Captured 01: Sảnh Bảo tàng & Smart HUD")

    # 2. Thử nghiệm Thu gọn HUD
    page.click('#hud-toggle')
    page.wait_for_timeout(400)
    page.screenshot(path=os.path.join(SCREENSHOT_DIR, '02_hud_da_thu_gon_tam_nhin_thoang.png'))
    print("Captured 02: HUD thu gọn tầm nhìn thoáng đãng")
    page.click('#hud-toggle')
    page.wait_for_timeout(400)

    # 3. Mở Kho 230 bài học với bộ lọc chuyên đề
    page.click('#open-catalog')
    page.wait_for_timeout(600)
    page.screenshot(path=os.path.join(SCREENSHOT_DIR, '03_kho_230_bai_loc_chuyen_de_gdpt.png'))
    print("Captured 03: Kho học liệu lọc chuyên đề GDPT")

    # 4. Mở 1 bài giảng: Khung vẽ Sạch sẽ (Clean Canvas 100%)
    page.evaluate('''() => {
        const item = document.querySelector('#catalog-grid .catalog-item .catalog-preview');
        if (item) item.click();
    }''')
    page.wait_for_timeout(800)
    page.screenshot(path=os.path.join(SCREENSHOT_DIR, '04_khung_ve_sach_se_clean_canvas.png'))
    print("Captured 04: Khung vẽ Sạch sẽ Clean Canvas")

    # 5. Thử nghiệm phím mũi tên chuyển bài tiếp theo
    page.keyboard.press('ArrowRight')
    page.wait_for_timeout(600)
    page.screenshot(path=os.path.join(SCREENSHOT_DIR, '05_chuyen_sang_bai_tiep_theo_mui_ten.png'))
    print("Captured 05: Chuyển bài bằng phím mũi tên")
    page.keyboard.press('Escape')
    page.wait_for_timeout(400)

    # 6. Sơ đồ 7 phòng hình quạt tròn
    page.click('#open-room-map')
    page.wait_for_timeout(600)
    page.screenshot(path=os.path.join(SCREENSHOT_DIR, '06_so_do_7_dai_sanh_tuong_tac.png'))
    print("Captured 06: Sơ đồ 7 phòng tương tác")
    page.click('#room-map-close')
    page.wait_for_timeout(400)

    browser.close()
    print("=== TẤT CẢ ẢNH CHỤP ĐÃ HOÀN TẤT ===")

