from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    ElementClickInterceptedException,
    StaleElementReferenceException,
    TimeoutException,
)
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

import time
import json

class BaseTestSuite:
    def __init__(self, driver=None, default_wait=12):
        if driver is None:
            from operations.webdriverCheck import get_available_driver
            self.driver = get_available_driver()
        else:
            self.driver = driver
        self.wait = WebDriverWait(self.driver, default_wait)
        self.test_results = []

    def set_viewport(self, w=1366, h=768):
        """Set the browser window size (helps headless CI match local)."""
        try:
            self.driver.set_window_size(w, h)
        except Exception:
            try:
                # fallback to maximize
                self.driver.maximize_window()
            except Exception:
                pass

    def log_result(self, test_name, passed, message):
        result = {"test": test_name, "passed": passed, "message": message}
        self.test_results.append(result)
        status = "✅" if passed else "❌"
        print(f"{status} {test_name}: {message}")

    def print_test_summary(self):
        print("\n" + "=" * 50)
        print("🐝 TEST SUMMARY 🐝")
        print("=" * 50)
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["passed"] is True)
        failed_tests = sum(1 for result in self.test_results if result["passed"] is False)
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%" if total_tests > 0 else "No tests run")
        if failed_tests > 0:
            print("\nFailed Tests:")
            for result in self.test_results:
                if bool(result["passed"]) is False:
                    print(f"  - {result['test']}: {result['message']}")

    def _screenshot_and_snippet(self, name_prefix="failure"):
        try:
            ts = int(time.time())
            png = f"/tmp/{name_prefix}_{ts}.png"
            html = f"/tmp/{name_prefix}_{ts}.html"
            try:
                self.driver.save_screenshot(png)
            except Exception:
                png = None
            try:
                with open(html, "w", encoding="utf-8") as f:
                    f.write(self.driver.page_source[:20000])
            except Exception:
                html = None
            return png, html
        except Exception:
            return None, None

    def capture_browser_console(self):
        try:
            ts = int(time.time())
            fn = f"/tmp/browser_console_{ts}.txt"
            try:
                logs = self.driver.get_log("browser")
            except Exception:
                logs = []
            with open(fn, "w", encoding="utf-8") as f:
                for entry in logs:
                    try:
                        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
                    except Exception:
                        f.write(str(entry) + "\n")
            return fn
        except Exception:
            return None

    def _element_from_point_info(self, x, y):
        """Return a dict with the tag, classes, id, and truncated outerHTML of element at (x,y)."""
        try:
            info = self.driver.execute_script("""
                try {
                    const x = arguments[0], y = arguments[1];
                    const el = document.elementFromPoint(x, y);
                    if (!el) return null;
                    return {
                        tag: el.tagName,
                        id: el.id || '',
                        classes: el.className || '',
                        outer: (el.outerHTML || '').slice(0, 4000),
                        rect: el.getBoundingClientRect ? el.getBoundingClientRect().toJSON() : null
                    };
                } catch(e) { return null; }
            """, int(x), int(y))
            return info
        except Exception:
            return None

    def _remove_element_at_point(self, x, y):
        """Remove the top element at x,y (if safe) and return True if removed."""
        try:
            removed = self.driver.execute_script("""
                try {
                    const x = arguments[0], y = arguments[1];
                    const el = document.elementFromPoint(x, y);
                    if (!el) return false;
                    // do not remove body or html
                    if (el === document.body || el === document.documentElement) return false;
                    el.remove();
                    return true;
                } catch(e) {
                    return false;
                }
            """, int(x), int(y))
            return bool(removed)
        except Exception:
            return False

    def dismiss_guidance_popover(self, timeout=8, wait_between=0.25):
        """
        Try to dismiss known guidance/tour overlays. Strategy (best-effort, conservative):
          - First try to call driver.js API if exposed (window.__hd_tour.destroy())
          - Set tour-done localStorage flag so it won't relaunch
          - Remove known driver.js / tour DOM nodes conservatively
          - Then proceed with the usual dismissal logic (close buttons, backdrop click, pointer-events tweak)
        Returns True if overlays are gone or absent, False otherwise.
        """
        # --- Try to stop tour via JS API and mark done in localStorage (non-destructive) ---
        try:
            self.driver.execute_script("""
                try {
                    // call destroy on exposed tour instance if present
                    if (window.__hd_tour && typeof window.__hd_tour.destroy === 'function') {
                        try { window.__hd_tour.destroy(); } catch(e) {}
                    }
                    // mark tour as seen in localStorage so app won't restart it
                    try { localStorage.setItem('hd_tour_done_v1','true'); } catch(e) {}
                    // remove common driver.js and tour DOM nodes conservatively
                    const sel = [
                      '.driver-popover', '.driver-overlay', '.driver-popover-content', '.driver-popover-close-btn',
                      '.reactour__overlay-container', '.introjs-overlay', '.shepherd-modal-overlay-container',
                      '.shepherd-overlay', '.tippy-box', '.tourguide-overlay', '.guided-tour'
                    ];
                    sel.forEach(s => document.querySelectorAll(s).forEach(n => { try { n.remove(); } catch(e){} }));
                    document.body.classList.remove('driver-active','driver-fade','driver-active-element');
                } catch(e) {}
            """)
            # allow a short settle
            time.sleep(0.12)
        except Exception:
            # non-fatal — continue into normal dismissal attempts
            pass

        # Continue with the existing overlay dismissal logic (close buttons, backdrop click, pointer-events)
        selectors_to_check = [
            "#driver-popover-content.driver-popover",
            ".driver-popover",
            ".driver-overlay",
            "svg.driver-overlay",
            "[data-tour='task-modal']",
            ".reactour__overlay-container",
            ".introjs-overlay",
            ".introjs-helperLayer",
            ".shepherd-modal-overlay-container",
            ".shepherd-overlay",
            ".tippy-box",
            ".tourguide-overlay",
            ".guided-tour",
            ".overlay",
            ".modal-backdrop",
            ".popup-overlay",
        ]
        try:
            # quick presence check
            present = False
            for sel in selectors_to_check:
                try:
                    if self.driver.find_elements(By.CSS_SELECTOR, sel):
                        present = True
                        break
                except Exception:
                    continue
            if not present:
                return True

            end = time.time() + timeout
            while time.time() < end:
                # 1) Send ESC to close any keyboard-listening popovers
                try:
                    ActionChains(self.driver).send_keys(Keys.ESCAPE).perform()
                    time.sleep(0.08)
                except Exception:
                    pass

                # 2) Try explicit clicks on close/next/done inside overlays
                try:
                    close_btns = self.driver.find_elements(By.CSS_SELECTOR,
                        ".driver-popover-close-btn, button[aria-label='Close'], button[title='Close'], .close, .close-btn, .tour-close, .introjs-skipbutton, .shepherd-button-secondary")
                    for b in close_btns:
                        try:
                            if b.is_displayed() and b.is_enabled():
                                try:
                                    b.click()
                                except Exception:
                                    try:
                                        self.driver.execute_script("arguments[0].click();", b)
                                    except Exception:
                                        pass
                                time.sleep(wait_between)
                        except Exception:
                            continue
                except Exception:
                    pass

                # 3) Try clicking overlay/backdrop centers (some libraries close on backdrop click)
                try:
                    for sel in selectors_to_check:
                        try:
                            elems = self.driver.find_elements(By.CSS_SELECTOR, sel)
                            for el in elems:
                                try:
                                    if not el.is_displayed():
                                        continue
                                    rect = self.driver.execute_script("return arguments[0].getBoundingClientRect().toJSON()", el)
                                    cx = (rect['left'] + rect['right']) / 2
                                    cy = (rect['top'] + rect['bottom']) / 2
                                    # attempt to click the overlay/backdrop center (may close)
                                    try:
                                        self.driver.execute_script("document.elementFromPoint(arguments[0], arguments[1]).click()", cx, cy)
                                    except Exception:
                                        try:
                                            self.driver.execute_script("arguments[0].click();", el)
                                        except Exception:
                                            pass
                                    time.sleep(wait_between)
                                except Exception:
                                    continue
                        except Exception:
                            continue
                except Exception:
                    pass

                # 4) Check whether selectors remain visible
                still_here = False
                for sel in selectors_to_check:
                    try:
                        elems = self.driver.find_elements(By.CSS_SELECTOR, sel)
                        if elems:
                            for e in elems:
                                try:
                                    if e.is_displayed():
                                        still_here = True
                                        break
                                except Exception:
                                    still_here = True
                                    break
                        if still_here:
                            break
                    except Exception:
                        continue

                if not still_here:
                    # small stabilization pause
                    time.sleep(0.12)
                    return True

                # 5) Intermediate fallback: temporarily disable pointer-events for overlays so underlying page is clickable
                try:
                    self.driver.execute_script("""
                        try {
                          const selList = arguments[0];
                          selList.forEach(s => {
                            document.querySelectorAll(s).forEach(n => {
                              try { n.__savedPointer = n.style.pointerEvents; n.style.pointerEvents = 'none'; } catch(e){}
                            });
                          });
                        } catch(e){}
                    """, selectors_to_check)
                    time.sleep(0.08)
                except Exception:
                    pass

                # After disabling pointer-events, attempt to click a safe spot (top-left header where create button resides)
                try:
                    # click near top-right where +Create often sits to trigger UI if clickable now
                    w = self.driver.execute_script("return window.innerWidth")
                    h = self.driver.execute_script("return window.innerHeight")
                    # click a little offset inside the header area
                    cx = w - 80
                    cy = 60
                    try:
                        self.driver.execute_script("document.elementFromPoint(arguments[0], arguments[1]).click()", cx, cy)
                    except Exception:
                        pass
                    time.sleep(0.12)
                except Exception:
                    pass

                # Re-check for visibility one more iteration; then attempt final removal if still blocking
                still_here = False
                for sel in selectors_to_check:
                    try:
                        elems = self.driver.find_elements(By.CSS_SELECTOR, sel)
                        for e in elems:
                            try:
                                if e.is_displayed():
                                    still_here = True
                                    break
                            except Exception:
                                still_here = True
                                break
                        if still_here:
                            break
                    except Exception:
                        continue

                if not still_here:
                    # restore pointer-events if any saved (best-effort)
                    try:
                        self.driver.execute_script("""
                            try {
                              document.querySelectorAll('*').forEach(n => {
                                if (n.__savedPointer !== undefined) { n.style.pointerEvents = n.__savedPointer; delete n.__savedPointer; }
                              });
                            } catch(e){}
                        """)
                    except Exception:
                        pass
                    time.sleep(0.12)
                    return True

                # continue loop and try again (until timeout)
                time.sleep(wait_between)

            # If we exit the loop, overlays did not clear; attempt conservative removal
            try:
                self.driver.execute_script("""
                    try {
                      const known = arguments[0];
                      known.forEach(s => document.querySelectorAll(s).forEach(n => {
                        try {
                          // avoid removing body/html
                          if (n === document.body || n === document.documentElement) return;
                          const st = window.getComputedStyle(n);
                          // only remove large fixed/absolute overlays that likely block interactions
                          if (st && (st.position === 'fixed' || st.position === 'absolute' || Number(st.zIndex) > 1000)) {
                              n.remove();
                          }
                        } catch(e){}
                      }));
                      ['driver-active','driver-fade','driver-active-element'].forEach(c => document.body.classList.remove(c));
                    } catch(e){}
                """, selectors_to_check)
                time.sleep(0.18)
            except Exception:
                pass

            # final verification: if still present, capture screenshot and return False
            for sel in selectors_to_check:
                try:
                    elems = self.driver.find_elements(By.CSS_SELECTOR, sel)
                    for e in elems:
                        try:
                            if e.is_displayed():
                                png, html = self._screenshot_and_snippet("popover_still_present")
                                print("Popover still present. screenshot:", png, "html:", html)
                                return False
                        except Exception:
                            png, html = self._screenshot_and_snippet("popover_query_error")
                            print("Popover presence ambiguous. screenshot:", png, "html:", html)
                            return False
                except Exception:
                    continue

            return True
        except Exception:
            try:
                png, html = self._screenshot_and_snippet("dismiss_error")
                print("dismiss_guidance_popover unexpected error; screenshot:", png, "html:", html)
            except Exception:
                pass
            return False