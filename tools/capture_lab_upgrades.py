import sys, os
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        headless=True,
        args=['--use-gl=angle', '--enable-webgl', '--enable-webgl2-compute-context']
    )
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto('http://127.0.0.1:4173/')
    page.wait_for_timeout(2000)
    btn = page.query_selector('button:has-text("Bắt đầu")')
    if btn: btn.click()
    page.wait_for_timeout(1000)
    
    # 1. Teleport into a thematic Lab room (Grade 6 Room 1)
    print("Navigating to Grade 6 Room...")
    page.evaluate('''() => {
        // Enter Grade 6 thematic room via spatial manager or museum
        window.museum?.toGrade?.(6);
    }''')
    page.wait_for_timeout(2000)
    
    # Enter chapter 1 room
    page.evaluate('''() => {
        const sm = window.museum?.r6SpatialManager;
        if (sm) {
            sm.enterThematicRoom('6-01', window.museum?.player);
        }
    }''')
    page.wait_for_timeout(2000)
    page.screenshot(path='QA_ANH_KIEM_TRA/12_phong_lab_3d_buc_titanium.png')
    print("Screenshot 12 captured!")
    
    # 2. Open an interactive math model in LabShell to view theater mode
    print("Opening LabShell model...")
    page.evaluate('''() => {
        window.museum?.openLabShell?.('lab6-01-c01-m01') || window.openLabShell?.('lab6-01-c01-m01');
    }''')
    page.wait_for_timeout(2000)
    page.screenshot(path='QA_ANH_KIEM_TRA/13_giao_dien_labshell_mo_hinh.png')
    print("Screenshot 13 captured!")
    
    browser.close()
