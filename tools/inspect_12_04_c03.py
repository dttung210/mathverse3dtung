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
    
    # Open 12-04-C03
    page.evaluate('''() => {
        window.navigateToMode?.('12-04-C03');
    }''')
    page.wait_for_timeout(2500)
    
    # Inspect 3D canvas and handles
    info = page.evaluate('''() => {
        const c = document.querySelector('.mv-g7-3d-stage canvas');
        const d = document.querySelector('.mv-g7-dual-grid');
        const net = document.querySelector('.mv-g7-net');
        let parent = d;
        let scrollParent = null;
        while (parent && parent !== document.body) {
            const style = window.getComputedStyle(parent);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                scrollParent = { cls: parent.className, scrollH: parent.scrollHeight, clientH: parent.clientHeight };
                break;
            }
            parent = parent.parentElement;
        }
        return {
            canvasWidth: c ? c.width : null,
            canvasHeight: c ? c.height : null,
            canvasClientW: c ? c.clientWidth : null,
            canvasClientH: c ? c.clientHeight : null,
            gridDisplay: d ? window.getComputedStyle(d).display : null,
            scrollParent: scrollParent,
            netRect: net ? net.getBoundingClientRect().toJSON() : null,
            dpr: window.devicePixelRatio
        };
    }''')
    print("Canvas info:", info)
    page.screenshot(path='QA_ANH_KIEM_TRA/test_12_04_c03.png')
    
    # Scroll down to net
    page.evaluate('''() => {
        const net = document.querySelector('.mv-g7-net');
        if (net) net.scrollIntoView({ behavior: 'instant', block: 'center' });
    }''')
    page.wait_for_timeout(500)
    page.screenshot(path='QA_ANH_KIEM_TRA/test_12_04_c03_scrolled_to_2d.png')
    browser.close()
