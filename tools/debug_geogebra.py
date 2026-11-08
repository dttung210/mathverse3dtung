import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        headless=True
    )
    page = browser.new_page(viewport={'width': 1366, 'height': 768})
    
    page.on("console", lambda msg: print(f"[BROWSER CONSOLE {msg.type}]: {msg.text}"))
    page.on("pageerror", lambda err: print(f"[BROWSER ERROR]: {err}"))
    page.on("requestfailed", lambda req: print(f"[REQ FAILED]: {req.url} -> {req.failure}"))
    
    page.goto('http://127.0.0.1:4173/')
    page.wait_for_timeout(2000)
    btn = page.query_selector('button:has-text("Bắt đầu")')
    if btn: btn.click()
    page.wait_for_timeout(1000)
    
    print("Triggering ggb-2d...")
    page.evaluate('''() => {
        window.dispatchEvent(new CustomEvent('mathverse:exhibition-action', { detail: { type: 'ggb-2d' } }));
    }''')
    
    for i in range(20):
        page.wait_for_timeout(1000)
        status = page.evaluate("() => document.getElementById('mv-ggb-status')?.textContent")
        print(f"[{i}s] Status: {status}")
        if "Sẵn sàng" in (status or ""):
            print(">>> GEOGEBRA READY! <<<")
            break
            
    browser.close()
