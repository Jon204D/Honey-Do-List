from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import ElementClickInterceptedException, StaleElementReferenceException
import time
import traceback

class BaseTestSuite:
    def __init__(self, driver=None, default_wait=12):
        if driver is None:
            from operations.webdriverCheck import get_available_driver
            self.driver = get_available_driver()
        else:
            self.driver = driver
        # default waits can be increased for CI if needed
        self.wait = WebDriverWait(self.driver, default_wait)
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
        Attempt to close/dismiss known page overlays/popovers that block clicks.
        Strategy:
          - Try clicking close / navigation buttons
          - Wait for invisibility
          - Final fallback: targeted JS removal of large fixed overlays and known selectors
        Returns True if overlays are gone or absent, False otherwise.
        """
        selectors_to_check = [
            "#driver-popover-content.driver-popover",
            ".driver-popover",
            ".driver-overlay",
            "svg.driver-overlay",
            "[data-tour='task-modal']",
            ".reactour__overlay-container",
        ]

        try:
            # Quick presence check
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
                # Try close buttons
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

                # Try Next/Done internal buttons
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

                # If nothing visible, break
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
                    return True

                time.sleep(wait_between)

            # Final fallback: remove large overlay nodes and known selectors
            try:
                self.driver.execute_script("""
                    const known = ['#driver-popover-content.driver-popover', '.driver-popover', '.driver-overlay', 'svg.driver-overlay', '[data-tour="task-modal"]', '.reactour__overlay-container'];
                    known.forEach(s => document.querySelectorAll(s).forEach(n => n.remove()));
                    ['driver-active','driver-fade','driver-active-element'].forEach(c => document.body.classList.remove(c));
                    document.body.removeAttribute('aria-haspopup');
                    document.body.removeAttribute('aria-expanded');
                    document.body.removeAttribute('aria-controls');
                    // additional: remove big fixed elements that cover most of viewport
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

            # verify gone
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
        except Exception as ex:
            try:
                png, html = self._screenshot_and_snippet("dismiss_error")
                print("dismiss_guidance_popover unexpected error; screenshot:", png, "html:", html)
            except Exception:
                pass
            return False

    def safe_click(self, el, retries=4, wait_between=0.6):
        """
        Robust click helper:
         - waits for display + enabled
         - checks disabled attribute
         - scrolls into view
         - tries normal click; on interception attempts conservative overlay removal and JS click
         - returns True on success, False otherwise
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
                    time.sleep(wait_between)
                    # continue to retry
                # scroll into view
                try:
                    self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
                except Exception:
                    pass

                try:
                    el.click()
                    return True
                except ElementClickInterceptedException as ex:
                    png, html = self._screenshot_and_snippet("click_intercepted")
                    print(f"⚠️ click intercepted on attempt {attempt}; screenshot: {png}")
                    # conservative overlay removal fallback
                    try:
                        self.driver.execute_script("""
                          const vw = window.innerWidth, vh = window.innerHeight;
                          document.querySelectorAll('svg, div').forEach(el=>{
                            try{
                              const s = window.getComputedStyle(el);
                              if (!s) return;
                              if (s.position === 'fixed' || s.position === 'absolute') {
                                const r = el.getBoundingClientRect();
                                if (r.width >= vw*0.5 && r.height >= vh*0.25 && s.pointerEvents !== 'none') el.remove();
                              }
                            }catch(e){}
                          });
                          ['#driver-popover-content.driver-popover', '.driver-popover', '.driver-overlay', '[data-tour=\"task-modal\"]'].forEach(s => document.querySelectorAll(s).forEach(n=>n.remove()));
                          document.body.classList.remove('driver-active','driver-fade','driver-active-element');
                        """)
                    except Exception as js_e:
                        print("⚠️ JS overlay removal attempt failed:", js_e)
                    # try JS click
                    try:
                        self.driver.execute_script("arguments[0].click();", el)
                        return True
                    except Exception as js_click_e:
                        print("⚠️ JS click failed:", js_click_e)
                        time.sleep(wait_between)
                        continue
                except StaleElementReferenceException:
                    time.sleep(wait_between)
                    continue
                except Exception as e:
                    print("⚠️ unexpected click error:", e)
                    time.sleep(wait_between)
                    continue
            except Exception:
                time.sleep(wait_between)
        return False

    def ensure_field_set(self, element, value):
        """
        Set a field value in a way frameworks (React/vuetify etc.) pick up:
         - set via JS to the machine-format value (for date inputs)
         - dispatch input/change and key events (keydown/keyup) and blur
         - returns True if applied (value attribute matches or element shows value)
        """
        try:
            # set and dispatch
            self.driver.execute_script("""
                try {
                    const el = arguments[0];
                    const val = arguments[1];
                    el.focus && el.focus();
                    // set raw value
                    el.value = val;
                    // dispatch events frameworks listen to
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
                    el.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }));
                    el.blur && el.blur();
                } catch(e) {}
            """, element, value)
            # small delay to let framework process
            time.sleep(0.12)
            # verify applied if possible
            try:
                applied = element.get_attribute("value")
                return applied == value or value in (applied or "")
            except Exception:
                return True
        except Exception:
            return False