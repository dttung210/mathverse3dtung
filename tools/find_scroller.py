from playwright.sync_api import sync_playwright

p = sync_playwright().start()
b = p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe', headless=True)
page = b.new_page(viewport={'width': 1920, 'height': 1080})
page.goto('http://127.0.0.1:4173/')
page.wait_for_timeout(2500)

btn = page.query_selector('button:has-text("Bắt đầu")')
if btn:
    btn.click()
page.wait_for_timeout(1500)

page.evaluate('() => window.navigateToMode?.("10-02-C03")')
page.wait_for_timeout(1500)

scrollers = page.evaluate('''() => {
    return Array.from(document.querySelectorAll('*'))
        .filter(el => el.scrollHeight > el.clientHeight + 20)
        .map(el => ({ tag: el.tagName, class: el.className, id: el.id, sh: el.scrollHeight, ch: el.clientHeight }));
}''')
print("Scrollers:", scrollers)

# Scroll the main scroller to bottom and take a screenshot
for sc in scrollers:
    if 'mv-curriculum-explorer' in sc.get('class', '') or 'mv-ce-workspace' in sc.get('class', '') or 'workspace' in sc.get('class', '') or 'body' in sc.get('tag', '').lower():
        print("Scrolling:", sc)

page.evaluate('''() => {
    const w = document.querySelector('.mv-ce-workspace') || document.querySelector('.mv-curriculum-main') || document.querySelector('.mv-curriculum-explorer');
    if (w) w.scrollTop = 500;
    const all = Array.from(document.querySelectorAll('*')).filter(el => el.scrollHeight > el.clientHeight + 20);
    all.forEach(el => el.scrollTop = 450);
}''')
page.wait_for_timeout(1000)
page.screenshot(path=r'C:\Users\boyme\.gemini\antigravity\brain\33e2fe14-98c5-444e-a164-fe263d17f5c0\32_mo_hinh_1002c03_the_so_lieu_ben_duoi.png')
print("Recaptured 32_mo_hinh_1002c03_the_so_lieu_ben_duoi.png")
b.close()
p.stop()

