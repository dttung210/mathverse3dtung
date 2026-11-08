import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe', headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto('http://127.0.0.1:4173/')
    page.wait_for_timeout(2000)
    btn = page.query_selector('button:has-text("Bắt đầu")')
    if btn: btn.click()
    page.wait_for_timeout(1000)
    page.evaluate('() => window.navigateToMode?.("8-01-C03")')
    page.wait_for_timeout(2000)
    page.screenshot(path='QA_ANH_KIEM_TRA/test_801c03_current.png')
    
    # Trigger exploded state on grade8Lab
    page.evaluate('''() => {
        const exp = window.curriculumExplorer;
        if (exp && exp.grade8Lab) {
            exp.grade8Lab.t = 1.8;
            exp.grade8Lab.draw();
        } else {
            // Find input range inside mv-g7-timeline
            const range = document.querySelector('.mv-g7-timeline input');
            if (range) {
                range.value = "1.8";
                range.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }''')
    page.wait_for_timeout(1000)
    page.screenshot(path='QA_ANH_KIEM_TRA/test_801c03_exploded.png')
    browser.close()
