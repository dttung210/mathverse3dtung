import sys, os
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

artifact_dir = r"C:\Users\boyme\.gemini\antigravity\brain\33e2fe14-98c5-444e-a164-fe263d17f5c0"
qa_dir = r"G:\ANTIGRAVITY\MATH_3D_MUSEUM\MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31\MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT\QA_ANH_KIEM_TRA"

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        headless=True
    )
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    
    print("Navigating to MATHVERSE on port 4173...")
    page.goto('http://127.0.0.1:4173/')
    page.wait_for_timeout(2500)
    
    btn = page.query_selector('button:has-text("Bắt đầu")')
    if btn:
        btn.click()
    page.wait_for_timeout(1500)
    
    # 1. 10-02-C03
    print("Opening 10-02-C03 (Linear Programming / Tối ưu tuyến tính)...")
    page.evaluate('() => window.navigateToMode?.("10-02-C03")')
    page.wait_for_timeout(2000)
    
    # Capture canvas area
    p31_qa = os.path.join(qa_dir, "31_mo_hinh_1002c03_khung_ve_sach_se_khong_chu.png")
    p31_art = os.path.join(artifact_dir, "31_mo_hinh_1002c03_khung_ve_sach_se_khong_chu.png")
    page.screenshot(path=p31_qa)
    page.screenshot(path=p31_art)
    print(f"Captured: {p31_qa}")
    
    # Scroll slightly down to capture metrics cards below
    page.evaluate('() => { const el = document.querySelector(".mv-g7-workspace") || document.querySelector(".mv-r5-stage") || document.body; el.scrollTop = 220; }')
    page.wait_for_timeout(800)
    p32_qa = os.path.join(qa_dir, "32_mo_hinh_1002c03_the_so_lieu_ben_duoi.png")
    p32_art = os.path.join(artifact_dir, "32_mo_hinh_1002c03_the_so_lieu_ben_duoi.png")
    page.screenshot(path=p32_qa)
    page.screenshot(path=p32_art)
    print(f"Captured: {p32_qa}")
    
    # 2. 10-02-C01
    print("Opening 10-02-C01...")
    page.evaluate('() => window.navigateToMode?.("10-02-C01")')
    page.wait_for_timeout(2000)
    p33_qa = os.path.join(qa_dir, "33_mo_hinh_1002c01_khung_ve_sach_se.png")
    p33_art = os.path.join(artifact_dir, "33_mo_hinh_1002c01_khung_ve_sach_se.png")
    page.screenshot(path=p33_qa)
    page.screenshot(path=p33_art)
    print(f"Captured: {p33_qa}")
    
    # 3. 10-02-C02
    print("Opening 10-02-C02...")
    page.evaluate('() => window.navigateToMode?.("10-02-C02")')
    page.wait_for_timeout(2000)
    p34_qa = os.path.join(qa_dir, "34_mo_hinh_1002c02_khung_ve_sach_se.png")
    p34_art = os.path.join(artifact_dir, "34_mo_hinh_1002c02_khung_ve_sach_se.png")
    page.screenshot(path=p34_qa)
    page.screenshot(path=p34_art)
    print(f"Captured: {p34_qa}")
    
    browser.close()
    print("ALL ACCEPTANCE SCREENSHOTS CAPTURED SUCCESSFULLY!")

