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
    
    # Test Grade 11: 11-07-C01
    page.evaluate('() => window.navigateToMode?.("11-07-C01")')
    page.wait_for_timeout(2000)
    info11 = page.evaluate('''() => {
        const c = document.querySelector('.mv-g7-3d-stage canvas');
        const net = document.querySelector('.mv-g7-net');
        return {
            canvasW: c ? c.width : 0,
            canvasH: c ? c.height : 0,
            hasNet: !!net,
            netVisible: !!net && net.clientHeight > 0
        };
    }''')
    print('Grade 11 info:', info11)
    page.screenshot(path='QA_ANH_KIEM_TRA/17_kiem_tra_lop_11_khong_gian.png')
    
    # Test Grade 7: 7-04-C01
    page.evaluate('() => window.navigateToMode?.("7-04-C01")')
    page.wait_for_timeout(2000)
    info7 = page.evaluate('''() => {
        const c = document.querySelector('.mv-g7-3d-stage canvas');
        const net = document.querySelector('.mv-g7-net');
        return {
            canvasW: c ? c.width : 0,
            canvasH: c ? c.height : 0,
            hasNet: !!net,
            netVisible: !!net && net.clientHeight > 0
        };
    }''')
    print('Grade 7 info:', info7)
    page.screenshot(path='QA_ANH_KIEM_TRA/18_kiem_tra_lop_7_khong_gian.png')
    browser.close()

