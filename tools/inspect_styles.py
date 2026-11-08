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
    page.evaluate('() => window.navigateToMode?.("10-02-C01")')
    page.wait_for_timeout(1500)
    
    rules = page.evaluate('''() => {
        const el = document.querySelector('.mv-r5-window');
        const matched = [];
        for (const sheet of document.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    if (rule.selectorText && el.matches(rule.selectorText)) {
                        if (rule.style.backgroundColor || rule.style.background) {
                            matched.push({
                                href: sheet.href,
                                selector: rule.selectorText,
                                bg: rule.style.backgroundColor || rule.style.background
                            });
                        }
                    }
                }
            } catch (e) {}
        }
        return matched;
    }''')
    for r in rules:
        print(r)
    browser.close()
