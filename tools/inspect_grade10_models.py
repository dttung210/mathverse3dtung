import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        headless=True
    )
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    
    print("Navigating to MATHVERSE...")
    page.goto('http://127.0.0.1:4173/')
    page.wait_for_timeout(2500)
    
    btn = page.query_selector('button:has-text("Bắt đầu")')
    if btn:
        btn.click()
    page.wait_for_timeout(1500)
    
    # 1. 10-02-C01
    print("Opening 10-02-C01...")
    page.evaluate('() => window.navigateToMode?.("10-02-C01")')
    page.wait_for_timeout(2000)
    page.screenshot(path='G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/QA_ANH_KIEM_TRA/23_mo_hinh_1002c01_ro_rang_khong_roi.png')
    print("Captured 23_mo_hinh_1002c01_ro_rang_khong_roi.png")
    
    # 2. 10-02-C02
    print("Opening 10-02-C02...")
    page.evaluate('() => window.navigateToMode?.("10-02-C02")')
    page.wait_for_timeout(2000)
    page.screenshot(path='G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/QA_ANH_KIEM_TRA/24_mo_hinh_1002c02_he_bpt_doi_toa_do.png')
    print("Captured 24_mo_hinh_1002c02_he_bpt_doi_toa_do.png")
    
    # 3. 10-02-C03
    print("Opening 10-02-C03...")
    page.evaluate('() => window.navigateToMode?.("10-02-C03")')
    page.wait_for_timeout(2000)
    page.screenshot(path='G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/QA_ANH_KIEM_TRA/25_mo_hinh_1002c03_giao_4_duong_huong_do_thi.png')
    print("Captured 25_mo_hinh_1002c03_giao_4_duong_huong_do_thi.png")
    
    browser.close()
    print("DONE ALL!")
