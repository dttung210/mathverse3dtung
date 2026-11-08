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
    
    # Open real mode
    print("Navigating to toan6-tap-hop-venn...")
    page.evaluate('''() => {
        window.navigateToMode?.('toan6-tap-hop-venn');
    }''')
    page.wait_for_timeout(3000)
    
    page.screenshot(path='QA_ANH_KIEM_TRA/13_giao_dien_labshell_mo_hinh.png')
    print("Screenshot 13 captured successfully!")
    browser.close()
