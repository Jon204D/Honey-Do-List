from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    ElementClickInterceptedException,
    StaleElementReferenceException,
    TimeoutException,
)
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
        selectors_to_check = [
            "#driver-popover-content.driver-popover",
            ".driver-popover",
            ".driver-overlay",
            "svg.driver-overlay",
            "[data-tour='task-modal']",
            ".reactour__overlay-container",
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
                # try close buttons
                try:
                    close_btns = self.driver.find_elements(By.CSS_SELECTOR, ".driver-popover-close-btn, button[aria-label='Close']")
                    for b in close_btns:
                        try:
                            if b.is_displayed() and b.is_enabled():
                                try:
                                    b.click()
                                except Exception:
                                    self.driver.execute_script("arguments[0].click();", b)
                                time.sleep(wait_between)
                        except Exception:
                            continue
                except Exception:
                    pass

                # try internal next/done
                try:
                    nav_btns = self.driver.find_elements(By.CSS_SELECTOR, ".driver-popover-navigation-btns button, .driver-popover-next-btn, .driver-popover-navigation-btns > button")
                    for b in nav_btns:
                        try:
                            txt = (b.text or "").strip().lower()
                            aria = (b.get_attribute("aria-label") or "").strip().lower()
                            if any(k in (txt + " " + aria) for k in ("next", "done", "finish")) and b.is_displayed() and b.is_enabled():
                                try:
                                    b.click()
                                except Exception:
                                    self.driver.execute_script("arguments[0].click();", b)
                                time.sleep(wait_between)
                        except Exception:
                            continue
                except Exception:
                    pass

                # check if any selectors remain visible
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
                    time.sleep(0.2)
                    return True
                time.sleep(wait_between)

            # last resort: generic targeted removal
            try:
                self.driver.execute_script("""
                    const known = ['#driver-popover-content.driver-popover', '.driver-popover', '.driver-overlay', 'svg.driver-overlay', '[data-tour="task-modal"]', '.reactour__overlay-container'];
                    known.forEach(s => document.querySelectorAll(s).forEach(n => n.remove()));
                    ['driver-active','driver-fade','driver-active-element'].forEach(c => document.body.classList.remove(c));
                    document.body.removeAttribute('aria-haspopup');
                    document.body.removeAttribute('aria-expanded');
                    document.body.removeAttribute('aria-controls');
                    const vw = window.innerWidth, vh = window.innerHeight;
                    Array.from(document.querySelectorAll('body *')).forEach(el=>{
                      try{
                        const st = window.getComputedStyle(el);
                        if (!st) return;
                        if (st.position === 'fixed' || st.position === 'absolute') {
                          const r = el.getBoundingClientRect();
                          if (r.width >= vw*0.5 && r.height >= vh*0.25 && st.pointerEvents !== 'none') el.remove();
                        }
                      }catch(e){}
                    });
                """)
                time.sleep(0.2)
            except Exception:
                pass

            # final verify
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