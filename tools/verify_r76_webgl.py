import os, sys, time
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

BASE_URL = 'http://127.0.0.1:4190/'
HARNESS_URL = 'http://127.0.0.1:4190/test_harness_r76_motion.html'
ARTIFACT_DIR = r'C:\Users\boyme\.gemini\antigravity\brain\0925282a-cfaa-466c-8082-4e9f8520d37b'

def capture_all():
    print("=== BAT DAU KIEM THU WEBGL CHUYEN DONG GIAO DUC R76 ===")
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
        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGEERROR: {err}"))
        page.on("response", lambda res: print(f"HTTP {res.status}: {res.url}") if res.status >= 400 else None)
        page.on("requestfailed", lambda req: print(f"FAILED REQ: {req.url}"))

        # 1. Open Harness
        print(f"Opening test harness: {HARNESS_URL}...")
        page.goto(HARNESS_URL, wait_until='networkidle')
        page.wait_for_timeout(2000)

        # Wait for ready
        page.wait_for_function("window.testApp && window.testApp.ready === true", timeout=15000)
        print("Harness ready!")

        # State 0%:
        print("Capturing 0% state...")
        page.evaluate("""() => {
            window.testApp.v1.setProgress(0.0);
            window.testApp.v2.setUnfoldProgress(0.0);
            window.testApp.v3.setRevolutionAngle(0);
        }""")
        page.wait_for_timeout(600)
        path_0 = os.path.join(ARTIFACT_DIR, "nghiem_thu_r76_01_motion_0_percent.png")
        page.screenshot(path=path_0)
        print(f"Saved: {path_0}")

        # State 50%:
        print("Capturing 50% state...")
        page.evaluate("""() => {
            window.testApp.v1.setProgress(0.5);
            window.testApp.v2.setUnfoldProgress(0.5);
            window.testApp.v3.setRevolutionAngle(180);
        }""")
        page.wait_for_timeout(600)
        path_50 = os.path.join(ARTIFACT_DIR, "nghiem_thu_r76_02_motion_50_percent.png")
        page.screenshot(path=path_50)
        print(f"Saved: {path_50}")

        # State 100%:
        print("Capturing 100% state...")
        page.evaluate("""() => {
            window.testApp.v1.setProgress(1.0);
            window.testApp.v2.setUnfoldProgress(1.0);
            window.testApp.v3.setRevolutionAngle(360);
        }""")
        page.wait_for_timeout(600)
        path_100 = os.path.join(ARTIFACT_DIR, "nghiem_thu_r76_03_motion_100_percent.png")
        page.screenshot(path=path_100)
        print(f"Saved: {path_100}")

        # Measure FPS
        print("Measuring FPS in real Chrome WebGL loop...")
        fps_info = page.evaluate("""() => new Promise(resolve => {
            let frames = 0;
            const start = performance.now();
            function loop() {
                frames++;
                window.testApp.v1.setProgress((performance.now() % 4000) / 4000);
                if (frames < 60) {
                    requestAnimationFrame(loop);
                } else {
                    const elapsed = performance.now() - start;
                    resolve({ fps: (frames / elapsed) * 1000, elapsed, frames });
                }
            }
            requestAnimationFrame(loop);
        })""")
        print(f"FPS measurement: {fps_info['fps']:.1f} FPS (Target >= 30 FPS)")

        # Capture live Grand Campus
        print(f"Opening Grand Campus live: {BASE_URL}...")
        page.goto(BASE_URL, wait_until='networkidle')
        page.wait_for_timeout(2500)
        path_campus = os.path.join(ARTIFACT_DIR, "nghiem_thu_r76_04_grand_campus_live.png")
        page.screenshot(path=path_campus)
        print(f"Saved: {path_campus}")

        browser.close()
        print("=== HOAN TAT KIEM THU WEBGL R76 ===")

if __name__ == '__main__':
    capture_all()
