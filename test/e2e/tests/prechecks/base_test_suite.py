from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import time
import traceback

class BaseTestSuite:
    def __init__(self, driver=None):
        if driver is None:
            from operations.webdriverCheck import get_available_driver
            self.driver = get_available_driver()
        else:
            self.driver = driver
        self.wait = WebDriverWait(self.driver, 10)
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

    def dismiss_guidance_popover(self, timeout=8, wait_between=0.25):
        """
        Detect and dismiss the in-app guidance/popover that blocks clicks in CI.

        Strategy:
          1) Quick presence check for popover; if absent return True.
          2) Try Close button on the popover.
          3) Try clicking internal Next/Done buttons until popover disappears.
          4) Final fallback: remove the popover DOM & driver-active classes via JS.
        Returns True if popover dismissed or absent, False otherwise.
        """
        try:
            # quick check for popover presence
            try:
                popover = self.driver.find_element(By.CSS_SELECTOR, "#driver-popover-content.driver-popover, .driver-popover")
            except Exception:
                return True

            end_time = time.time() + timeout
            while time.time() < end_time:
                try:
                    # 1) Try a visible close button
                    try:
                        close_btn = popover.find_element(By.CSS_SELECTOR, ".driver-popover-close-btn, button[aria-label='Close']")
                        if close_btn.is_displayed() and close_btn.is_enabled():
                            try:
                                close_btn.click()
                            except Exception:
                                self.driver.execute_script("arguments[0].click();", close_btn)
                            time.sleep(wait_between)
                            try:
                                popover = self.driver.find_element(By.CSS_SELECTOR, "#driver-popover-content.driver-popover, .driver-popover")
                                # if still present, continue loop to try navigation
                            except Exception:
                                return True
                    except Exception:
                        pass

                    # 2) Try internal navigation buttons (Next / Done / Finish)
                    try:
                        candidate = None
                        nav_buttons = popover.find_elements(By.CSS_SELECTOR, ".driver-popover-navigation-btns button, .driver-popover-next-btn, .driver-popover-prev-btn, .driver-popover-navigation-btns > button")
                        for b in nav_buttons:
                            text = (b.text or "").strip().lower()
                            aria = (b.get_attribute("aria-label") or "").strip().lower()
                            label = f"{text} {aria}".strip()
                            if any(k in label for k in ("done", "finish", "next")) and b.is_displayed() and b.is_enabled():
                                candidate = b
                                break

                        if candidate:
                            try:
                                candidate.click()
                            except Exception:
                                self.driver.execute_script("arguments[0].click();", candidate)
                            time.sleep(wait_between)
                            try:
                                popover = self.driver.find_element(By.CSS_SELECTOR, "#driver-popover-content.driver-popover, .driver-popover")
                                # still present -> loop again
                            except Exception:
                                return True
                            continue
                    except Exception:
                        pass

                    # nothing else to try inside popover
                    break
                except Exception:
                    break

            # 3) Final fallback: remove popover programmatically (last resort)
            try:
                self.driver.execute_script("""
                    const pop = document.querySelector('#driver-popover-content.driver-popover, .driver-popover');
                    if (pop && pop.parentNode) pop.parentNode.removeChild(pop);
                    document.body.classList.remove('driver-active','driver-fade','driver-active-element');
                    document.body.removeAttribute('aria-haspopup');
                    document.body.removeAttribute('aria-expanded');
                    document.body.removeAttribute('aria-controls');
                """)
                time.sleep(0.2)
                try:
                    self.driver.find_element(By.CSS_SELECTOR, "#driver-popover-content.driver-popover, .driver-popover")
                    # still found => failure
                    return False
                except Exception:
                    return True
            except Exception:
                # If JS removal fails, capture screenshot for CI debugging
                try:
                    ts = int(time.time())
                    fn = f"/tmp/popover_remove_failed_{ts}.png"
                    self.driver.save_screenshot(fn)
                    print(f"Failed to remove popover. Screenshot saved to: {fn}")
                except Exception:
                    pass
                return False
        except Exception:
            # unexpected error - don't crash tests, but report failure to dismiss
            return False