import os, sys, time
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

BASE_URL = 'http://127.0.0.1:4190/'
ARTIFACT_DIR = r'C:\Users\boyme\.gemini\antigravity\brain\0925282a-cfaa-466c-8082-4e9f8520d37b'

def capture_closeups():
    print("=== BAT DAU CHUP ANH CAN CANH LAB VA TRIEN LAM R76 ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',
            headless=True,
            args=[
                '--use-gl=angle',
                '--use-angle=d3d11',
                '--enable-webgl',
                '--enable-webgl2-compute-context',
                '--ignore-gpu-blocklist',
                '--enable-gpu-rasterization',
                '--no-sandbox'
            ]
        )
        page = browser.new_page(viewport={'width': 1600, 'height': 900})

        # 1. Open R75 Lab Directly
        lab_url = "http://127.0.0.1:4190/r75/"
        print(f"Opening Lab directly: {lab_url}...")
        page.goto(lab_url, wait_until='networkidle')
        page.wait_for_timeout(3000)

        # Click on "Lớp 12" tab
        print("Switching to Lop 12...")
        try:
            page.evaluate("""() => {
                const tabs = Array.from(document.querySelectorAll('button, .tab, [role=tab]'));
                const g12 = tabs.find(t => t.textContent && t.textContent.includes('Lớp 12'));
                if (g12) g12.click();
            }""")
            page.wait_for_timeout(1500)

            # Search or select 12-07
            page.evaluate("""() => {
                const items = Array.from(document.querySelectorAll('.mv-r5-item, .list-item, button, div'));
                const it12_07 = items.find(t => t.textContent && t.textContent.includes('12-07'));
                if (it12_07) it12_07.click();
            }""")
            page.wait_for_timeout(2000)
        except Exception as e:
            print("Lab interaction exception:", e)

        path_lab12 = os.path.join(ARTIFACT_DIR, "nghiem_thu_r76_05_lab_12_07_revolution_slider.png")
        page.screenshot(path=path_lab12)
        print(f"Saved: {path_lab12}")

        # 2. Open Museum and red facade
        print("Navigating to Museum view...")
        try:
            page.evaluate("""() => {
                const btn = Array.from(document.querySelectorAll('button, a')).find(b => b.textContent && b.textContent.includes('BẢO TÀNG') || b.textContent.includes('TRIỂN LÃM'));
                if (btn) btn.click();
            }""")
            page.wait_for_timeout(2500)
        except Exception as e:
            print("Museum navigation exception:", e)

        path_museum = os.path.join(ARTIFACT_DIR, "nghiem_thu_r76_06_museum_red_facade_and_frames.png")
        page.screenshot(path=path_museum)
        print(f"Saved: {path_museum}")

        browser.close()
        print("=== HOAN TAT CHUP ANH CAN CANH ===")

if __name__ == '__main__':
    capture_closeups()

