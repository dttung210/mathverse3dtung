import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        headless=True
    )
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto('http://127.0.0.1:4173/')
    page.wait_for_timeout(2000)
    btn = page.query_selector('button:has-text("Bắt đầu")')
    if btn: btn.click()
    page.wait_for_timeout(1000)
    
    # Open 8-01-C03
    page.evaluate('''() => {
        window.navigateToMode?.('8-01-C03');
    }''')
    page.wait_for_timeout(2500)
    page.screenshot(path='QA_ANH_KIEM_TRA/14_mo_hinh_801c03_thiet_ke_moi.png')
    print("Screenshot 14 captured successfully!")
    browser.close()
