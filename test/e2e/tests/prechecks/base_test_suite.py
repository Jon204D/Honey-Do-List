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
        (Existing implementation expected here; keep as-is or merge the previously-discussed aggressive JS).
        Returns True if absent/dismissed, False otherwise.
        """
        # (Assume your existing implementation is present here; keep it.)
        # For brevity in this pasted file, we call a simple wrapper that tries quick closure.
        try:
            # quick check for known popover selector
            try:
                pop = self.driver.find_element(By.CSS_SELECTOR, "#driver-popover-content.driver-popover, .driver-popover")
            except Exception:
                return True

            # try to close nav/close buttons inside popover
            try:
                btns = pop.find_elements(By.CSS_SELECTOR, ".driver-popover-close-btn, button[aria-label='Close'], .driver-popover-next-btn, .driver-popover-navigation-btns button")
                for b in btns:
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

            # final fallback: attempt targeted JS removal (conservative)
            try:
                self.driver.execute_script("""
                    const selectors = ['#driver-popover-content.driver-popover', '.driver-popover', '.driver-overlay', '[data-tour=\"task-modal\"]'];
                    selectors.forEach(s => document.querySelectorAll(s).forEach(n => n.remove()));
                    ['driver-active','driver-fade','driver-active-element'].forEach(c => document.body.classList.remove(c));
                    document.body.removeAttribute('aria-haspopup');
                    document.body.removeAttribute('aria-expanded');
                    document.body.removeAttribute('aria-controls');
                """)
                time.sleep(0.2)
            except Exception:
                pass

            # verify gone
            try:
                self.driver.find_element(By.CSS_SELECTOR, "#driver-popover-content.driver-popover, .driver-popover")
                return False
            except Exception:
                return True
        except Exception:
            return False

    def safe_click(self, el, retries=3, wait_between=0.5):
        """
        Robust click helper:
         - Waits for displayed + enabled
         - Scrolls into view
         - Checks disabled attribute
         - Tries normal click, on interception removes overlays (JS) and tries JS click
         - Retries a few times, returns True on success
        """
        for attempt in range(1, retries + 1):
            try:
                # wait element stable
                self.wait.until(lambda d: el.is_displayed() and el.is_enabled())
            except Exception:
                # element not ready, wait a bit and retry
                time.sleep(wait_between)
            try:
                # check disabled attribute
                disabled = el.get_attribute("disabled")
                if disabled not in (None, "", False):
                    # wait for it to become enabled
                    time.sleep(wait_between)
                    # fall through to attempt anyway on retry
                # scroll into view
                try:
                    self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
                except Exception:
                    pass

                try:
                    el.click()
                    return True
                except ElementClickInterceptedException as ex:
                    # screenshot for debugging
                    png, html = self._screenshot_and_snippet("click_intercepted")
                    print(f"⚠️ click intercepted on attempt {attempt}; screenshot: {png}")
                    # Try to remove large overlays quickly (targeted JS)
                    try:
                        self.driver.execute_script("""
                          const vw = window.innerWidth, vh = window.innerHeight;
                          document.querySelectorAll('svg, div').forEach(el => {
                            try {
                              const s = window.getComputedStyle(el);
                              if (!s) return;
                              if (s.position === 'fixed' || s.position === 'absolute') {
                                const r = el.getBoundingClientRect();
                                if (r.width >= vw*0.5 && r.height >= vh*0.25 && s.pointerEvents !== 'none') el.remove();
                              }
                            } catch(e){}
                          });
                          ['#driver-popover-content.driver-popover', '.driver-popover', '.driver-overlay', '[data-tour=\"task-modal\"]'].forEach(s => document.querySelectorAll(s).forEach(n=>n.remove()));
                          document.body.classList.remove('driver-active','driver-fade','driver-active-element');
                        """)
                    except Exception as js_e:
                        print("⚠️ JS overlay removal attempt failed:", js_e)
                    # Try JS click
                    try:
                        self.driver.execute_script("arguments[0].click();", el)
                        return True
                    except Exception as js_click_e:
                        print("⚠️ JS click failed:", js_click_e)
                        time.sleep(wait_between)
                        continue
                except StaleElementReferenceException:
                    # need to re-find element in caller
                    time.sleep(wait_between)
                    continue
                except Exception as e:
                    print("⚠️ unexpected click error:", e)
                    time.sleep(wait_between)
                    continue
            except Exception:
                time.sleep(wait_between)
        return False