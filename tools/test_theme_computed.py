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
    
    info = page.evaluate('''() => {
        const win = document.querySelector('.mv-r5-window');
        const stage = document.querySelector('.mv-r5-stage');
        const header = document.querySelector('.mv-r5-header');
        const families = document.querySelector('.mv-r5-families');
        const themeBtn = document.querySelector('.mv-r63-theme-btn');
        return {
            win_bg: win ? getComputedStyle(win).backgroundColor : null,
            stage_bg: stage ? getComputedStyle(stage).backgroundColor : null,
            header_bg: header ? getComputedStyle(header).backgroundImage : null,
            families_bg: families ? getComputedStyle(families).backgroundColor : null,
            themeBtn_text: themeBtn ? themeBtn.innerText : null,
            overlay_classes: document.querySelector('#mv-r5-browser')?.className
        };
    }''')
    print("Computed styles now:", info)
    
    # Take screenshot in default LIGHT theme
    page.screenshot(path='QA_ANH_KIEM_TRA/26_giao_dien_trang_teal_mac_dinh.png')
    print("Captured 26_giao_dien_trang_teal_mac_dinh.png")
    
    # Click theme toggle button to switch to DARK
    theme_btn = page.query_selector('.mv-r63-theme-btn')
    if theme_btn:
        print("Clicking theme toggle button...")
        theme_btn.click()
        page.wait_for_timeout(1000)
        
        info_dark = page.evaluate('''() => {
            const win = document.querySelector('.mv-r5-window');
            const stage = document.querySelector('.mv-r5-stage');
            const themeBtn = document.querySelector('.mv-r63-theme-btn');
            return {
                win_bg: win ? getComputedStyle(win).backgroundColor : null,
                stage_bg: stage ? getComputedStyle(stage).backgroundColor : null,
                themeBtn_text: themeBtn ? themeBtn.innerText : null,
                overlay_classes: document.querySelector('#mv-r5-browser')?.className
            };
        }''')
        print("Computed styles in dark mode:", info_dark)
        page.screenshot(path='QA_ANH_KIEM_TRA/27_giao_dien_den_teal_khi_bam_nut.png')
        print("Captured 27_giao_dien_den_teal_khi_bam_nut.png")
        
        # Click back to LIGHT
        print("Clicking theme toggle button again to switch back to LIGHT...")
        theme_btn.click()
        page.wait_for_timeout(1000)
        page.screenshot(path='QA_ANH_KIEM_TRA/28_giao_dien_trang_teal_tro_lai.png')
        print("Captured 28_giao_dien_trang_teal_tro_lai.png")
    
    browser.close()
    print("DONE ALL THEME CHECKS!")
