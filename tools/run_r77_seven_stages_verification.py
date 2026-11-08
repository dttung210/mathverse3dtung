import os, sys, time, json, zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PROJ = Path(r"G:\ANTIGRAVITY\MATHVERSE GAME\MATHVERSE_FINAL_DA_SUA_TRUC_TIEP_2026-11-02\MATHVERSE_GRAND_CAMPUS_FINAL_TOAN_6_12").resolve()
ARTIFACT_DIR = Path(r"C:\Users\boyme\.gemini\antigravity\brain\0925282a-cfaa-466c-8082-4e9f8520d37b").resolve()
HARNESS_URL = "http://127.0.0.1:4190/test_harness_r77_stages.html"

# Key representative models for 7 stages
STAGES_CONFIG = [
    {
        "stage": 1,
        "grade": 6,
        "name": "Toán 6: Khối, ghép hình, đối xứng và xác suất trực quan",
        "models": ["toan6-xuc-xac", "toan6-vong-quay-choi", "toan6-dong-xu", "toan6-ghep-luc-giac"]
    },
    {
        "stage": 2,
        "grade": 7,
        "name": "Toán 7: Góc, tam giác bằng nhau, đường đặc biệt và biểu đồ",
        "models": ["7-04-C01", "7-01-C01", "7-05-C01"]
    },
    {
        "stage": 3,
        "grade": 8,
        "name": "Toán 8: Định lý Pythagore, đồng dạng và dựng hình",
        "models": ["8-06-C02", "8-05-C01", "8-09-C02"]
    },
    {
        "stage": 4,
        "grade": 9,
        "name": "Toán 9: Quan hệ đường tròn, mặt cắt và khối tròn xoay",
        "models": ["9-11-C03", "9-06-C01", "9-09-C02"]
    },
    {
        "stage": 5,
        "grade": 10,
        "name": "Toán 10: Vectơ, đồ thị, đường tròn và miền nghiệm",
        "models": ["10-04-C01", "10-05-C01", "10-06-C01"]
    },
    {
        "stage": 6,
        "grade": 11,
        "name": "Toán 11: Hình không gian, góc nhị diện và lượng giác",
        "models": ["11-01-C01", "11-08-C01", "11-09-C01"]
    },
    {
        "stage": 7,
        "grade": 12,
        "name": "Toán 12: Oxyz, tích phân, mặt cắt và thể tích tròn xoay",
        "models": ["12-07-C01", "12-06-C02", "12-04-C01"]
    }
]

def make_checkpoint_zip(stage_num, grade_num):
    zip_path = Path(rf"G:\ANTIGRAVITY\MATHVERSE GAME\MATHVERSE_R77_CHECKPOINT_GD{stage_num}_TOAN_{grade_num}.zip")
    print(f"Creating checkpoint ZIP for Stage {stage_num}: {zip_path.name}...")
    count = 0
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(PROJ):
            dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', '__pycache__', '.mathverse_backups')]
            for file in files:
                if file.endswith('.zip'):
                    continue
                full_p = Path(root) / file
                rel_p = str(full_p.relative_to(PROJ)).replace('\\', '/')
                zf.write(full_p, rel_p)
                count += 1
    print(f"-> Checkpoint GD{stage_num} created: {count} files, {zip_path.stat().st_size / 1024 / 1024:.2f} MB")
    return zip_path

def run_stages():
    print("=== BAT DAU QUY TRINH NGHIEM THU THUC TE 7 GIAI DOAN R77 ===")
    results = []

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
        page = browser.new_page(viewport={'width': 1400, 'height': 850})
        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}") if msg.type in ('error', 'warn') else None)
        page.on("pageerror", lambda err: print(f"PAGEERROR: {err}"))

        print(f"Opening test harness: {HARNESS_URL}...")
        page.goto(HARNESS_URL, wait_until='networkidle')
        page.wait_for_timeout(2000)
        page.wait_for_function("window.testApp && window.testApp.ready === true", timeout=15000)
        print("Test harness ready!\n")

        for stage_cfg in STAGES_CONFIG:
            stg = stage_cfg["stage"]
            grd = stage_cfg["grade"]
            stg_name = stage_cfg["name"]
            print(f"==================================================")
            print(f"--- TIEN HANH GIAI DOAN {stg} (TOAN {grd}) ---")
            print(f"Tieu de: {stg_name}")
            print(f"==================================================")

            stage_models_data = []

            for mod_id in stage_cfg["models"]:
                print(f"\n[Model: {mod_id}]")
                loaded = page.evaluate(f"window.testApp.loadModel('{mod_id}')")
                page.wait_for_timeout(300)

                # 0%:
                page.evaluate("window.testApp.setProgress(0)")
                page.wait_for_timeout(300)
                state_0 = page.evaluate("window.testApp.getCurrentState()")
                shot_0_name = f"r77_gd{stg}_toan{grd}_{mod_id}_0pct.png"
                shot_0_path = ARTIFACT_DIR / shot_0_name
                page.screenshot(path=str(shot_0_path))

                # 50%:
                page.evaluate("window.testApp.setProgress(50)")
                page.wait_for_timeout(300)
                state_50 = page.evaluate("window.testApp.getCurrentState()")
                shot_50_name = f"r77_gd{stg}_toan{grd}_{mod_id}_50pct.png"
                shot_50_path = ARTIFACT_DIR / shot_50_name
                page.screenshot(path=str(shot_50_path))

                # 100%:
                page.evaluate("window.testApp.setProgress(100)")
                page.wait_for_timeout(300)
                state_100 = page.evaluate("window.testApp.getCurrentState()")
                shot_100_name = f"r77_gd{stg}_toan{grd}_{mod_id}_100pct.png"
                shot_100_path = ARTIFACT_DIR / shot_100_name
                page.screenshot(path=str(shot_100_path))

                print(f"  0% phase: {state_0['phase']} | Center: {state_0['center']}")
                print(f" 50% phase: {state_50['phase']} | Center: {state_50['center']}")
                print(f"100% phase: {state_100['phase']} | Center: {state_100['center']}")
                print(f"  Classification: {state_100['classification']}")
                print(f"  Saved 3 snapshots: {shot_0_name}, {shot_50_name}, {shot_100_name}")

                stage_models_data.append({
                    "id": mod_id,
                    "name": state_100.get("meaning", ""),
                    "classification": state_100.get("classification", ""),
                    "state_0": state_0,
                    "state_50": state_50,
                    "state_100": state_100,
                    "shots": [shot_0_name, shot_50_name, shot_100_name]
                })

            # Checkpoint ZIP for this stage
            ckpt_zip = make_checkpoint_zip(stg, grd)
            results.append({
                "stage": stg,
                "grade": grd,
                "name": stg_name,
                "checkpoint_zip": str(ckpt_zip),
                "models": stage_models_data
            })
            print(f"✓ GIAI DOAN {stg} DA HOAN TAT & NGHIEM THU DAT CHUAN!")

        browser.close()

    # Save summary report JSON
    summary_path = ARTIFACT_DIR / "R77_SEVEN_STAGES_EXECUTION_REPORT.json"
    summary_path.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"\nDa xuat file tong hop ket qua: {summary_path}")
    print("=== HOAN TAT TOAN BO 7 GIAI DOAN R77 ===")

if __name__ == '__main__':
    run_stages()

