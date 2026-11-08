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
    page.wait_for_timeout(2500)
    btn = page.query_selector('button:has-text("Bắt đầu")')
    if btn:
        btn.click()
    page.wait_for_timeout(1500)
    page.evaluate('() => window.navigateToMode?.("11-02-C05")')
    page.wait_for_timeout(2000)
    
    # Scroll stage to see buttons and sliders
    page.evaluate('''() => {
        const stage = document.querySelector('.mv-r5-stage');
        if (stage) stage.scrollTop = 380;
    }''')
    page.wait_for_timeout(1000)
    
    page.screenshot(path='QA_ANH_KIEM_TRA/30_mo_hinh_1102c05_nut_bam_ro_rang.png')
    print("Captured 30_mo_hinh_1102c05_nut_bam_ro_rang.png")
    
    browser.close()

