from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import ElementClickInterceptedException, StaleElementReferenceException
import time
import traceback

class BaseTestSuite:
    def __init__(self, driver=None):
        if driver is None:
            from operations.webdriverCheck import get_available_driver
            self.driver = get_available_driver()
        else:
            self.driver = driver
        # default waits can be increased for CI if needed
        self.wait = WebDriverWait(self.driver, 12)
        self.test_results = []

    def log_result(self, test_name, passed, message):
        result = {
            "test": test_name,
            "passed": passed,
            "message": message
        }
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

    def dismiss_guidance_popover(self, timeout=8, wait_between=0.25):
        """
        Robustly dismiss overlays/popovers that block clicks in CI.

        Strategy:
         - Quick lookup for known overlay/popover/modal selectors
         - Attempt natural closes (close button, Next/Done)
         - Wait for invisibility; if still present, remove via JS including SVG overlays and data-tour modals
         - Return True if absent/dismissed, False otherwise
        """
        selectors_to_check = [
            "#driver-popover-content.driver-popover",
            ".driver-popover",
            ".driver-overlay",                 # generic overlay element
            "svg.driver-overlay",              # some overlays use svg
            "body.driver-active",
            "[data-tour='task-modal']",
            "[data-tour='task-modal'] *",      # modal children
        ]

        try:
            # quick presence check
            present = False
            for sel in selectors_to_check:
                try:
                    el = self.driver.find_element(By.CSS_SELECTOR, sel)
                    present = True
                    break
                except Exception:
                    continue
            if not present:
                return True

            end = time.time() + timeout
            while time.time() < end:
                # 1) Try popover close buttons
                try:
                    close_btns = self.driver.find_elements(By.CSS_SELECTOR, ".driver-popover-close-btn, button[aria-label='Close']")
                    for b in close_btns:
                        if b.is_displayed() and b.is_enabled():
                            try:
                                b.click()
                            except Exception:
                                self.driver.execute_script("arguments[0].click();", b)
                            time.sleep(wait_between)
                except Exception:
                    pass

                # 2) Try internal Next/Done within popover(s)
                try:
                    nav_btns = self.driver.find_elements(By.CSS_SELECTOR, ".driver-popover-navigation-btns button, .driver-popover-next-btn, .driver-popover-prev-btn, .driver-popover-navigation-btns > button")
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

                # 3) If task-modal present, try to close it via Cancel/Close button inside
                try:
                    modals = self.driver.find_elements(By.CSS_SELECTOR, "[data-tour='task-modal']")
                    for m in modals:
                        try:
                            # look for cancel or close buttons inside modal
                            cancel = m.find_elements(By.XPATH, ".//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'cancel') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'close') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'done')]")
                            if cancel:
                                for c in cancel:
                                    if c.is_displayed() and c.is_enabled():
                                        try:
                                            c.click()
                                        except Exception:
                                            self.driver.execute_script("arguments[0].click();", c)
                                        time.sleep(wait_between)
                                        break
                        except Exception:
                            continue
                except Exception:
                    pass

                # 4) Wait for any of the known selectors to be invisible
                still_here = False
                for sel in selectors_to_check:
                    try:
                        elems = self.driver.find_elements(By.CSS_SELECTOR, sel)
                        if elems:
                            # If any element still visible, we are not done
                            for e in elems:
                                try:
                                    if e.is_displayed():
                                        still_here = True
                                        break
                                except Exception:
                                    # if element stale or not queryable, ignore
                                    still_here = True
                                    break
                        if still_here:
                            break
                    except Exception:
                        continue

                if not still_here:
                    return True

                time.sleep(wait_between)

            # Final fallback: remove known overlay/popover nodes and classes via JS
            try:
                self.driver.execute_script("""
                    // remove common popovers / overlays
                    const sels = ['#driver-popover-content.driver-popover', '.driver-popover', '.driver-overlay', 'svg.driver-overlay', '[data-tour=\"task-modal\"]'];
                    sels.forEach(s => {
                        document.querySelectorAll(s).forEach(n => n.remove());
                    });
                    // Also clean body classes/attrs that can block clicks
                    ['driver-active','driver-fade','driver-active-element'].forEach(c => document.body.classList.remove(c));
                    document.body.removeAttribute('aria-haspopup');
                    document.body.removeAttribute('aria-expanded');
                    document.body.removeAttribute('aria-controls');
                """)
                time.sleep(0.2)
            except Exception:
                pass

            # final verification: ensure selectors are gone/hidden
            for sel in selectors_to_check:
                try:
                    elems = self.driver.find_elements(By.CSS_SELECTOR, sel)
                    if elems:
                        for e in elems:
                            try:
                                if e.is_displayed():
                                    # still blocking
                                    png, html = self._screenshot_and_snippet("popover_still_present")
                                    print("Popover still present. screenshot:", png, "html:", html)
                                    return False
                            except Exception:
                                # can't query displayed => assume still present
                                png, html = self._screenshot_and_snippet("popover_query_error")
                                print("Popover presence ambiguous. screenshot:", png, "html:", html)
                                return False
                except Exception:
                    continue

            return True
        except Exception as ex:
            try:
                png, html = self._screenshot_and_snippet("dismiss_error")
                print("dismiss_guidance_popover unexpected error; screenshot:", png, "html:", html)
            except Exception:
                pass
            return False
        
    def safe_click(self, el, retries=3, wait_between=0.4):
        """
        Robust click:
        - Waits until element is displayed/enabled and not disabled attr
        - Scrolls into view
        - Tries normal click, on Intercepted -> remove overlays via JS and try JS click
        - Retries a few times
        """
        for attempt in range(1, retries + 1):
            try:
                # ensure element is present and ready
                self.wait.until(lambda d: el.is_displayed() and el.is_enabled())
                # ensure not disabled attribute
                disabled = el.get_attribute("disabled")
                if disabled not in (None, "", False):
                    # wait a little for enablement
                    time.sleep(wait_between)
                    continue

                # bring into view
                try:
                    self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
                except Exception:
                    pass

                try:
                    el.click()
                    return True
                except ElementClickInterceptedException as ex:
                    # Take screenshot for debugging
                    png, html = self._screenshot_and_snippet("click_intercepted")
                    print(f"⚠️ click intercepted on attempt {attempt}; screenshot: {png}")
                    # Remove likely overlay(s) (aggressive but targeted)
                    try:
                        self.driver.execute_script("""
                        // remove big fixed overlays and top-level svg overlays covering the viewport
                        const vw = window.innerWidth, vh = window.innerHeight;
                        document.querySelectorAll('svg, div, section, header, main').forEach(el => {
                            try {
                            const s = window.getComputedStyle(el);
                            if (s.position === 'fixed' || s.position === 'absolute') {
                                const r = el.getBoundingClientRect();
                                if (r.width >= vw*0.5 && r.height >= vh*0.25 && s.pointerEvents !== 'none') el.remove();
                            }
                            } catch(e){}
                        });
                        // known selectors cleanup (conservative)
                        ['#driver-popover-content.driver-popover', '.driver-popover', '.driver-overlay', '[data-tour=\"task-modal\"]'].forEach(s => 
                            document.querySelectorAll(s).forEach(n=>n.remove()));
                        document.body.classList.remove('driver-active','driver-fade','driver-active-element');
                        """)
                    except Exception as js_e:
                        print("⚠️ JS overlay removal failed:", js_e)
                    # try JS click
                    try:
                        self.driver.execute_script("arguments[0].click();", el)
                        return True
                    except Exception as js_click_e:
                        print("⚠️ JS click failed:", js_click_e)
                        # fallthrough to retry loop
                except StaleElementReferenceException:
                    # re-find element likely needed by caller
                    time.sleep(wait_between)
                    continue
                except Exception as e:
                    print("⚠️ unexpected click error:", e)
                    time.sleep(wait_between)
            except Exception:
                time.sleep(wait_between)
        return False