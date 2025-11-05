from dotenv import load_dotenv
from operations.constants import BASE_URL
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
import os
import time
import traceback
from tests.prechecks.base_test_suite import BaseTestSuite

load_dotenv()

class LoginTests(BaseTestSuite):
    def __init__(self, driver, wait):
        super().__init__(driver)
        self.wait = wait

    def land_login_page(self):
        try:
            print("🚀 Launching Login page...")
            # normalize URL building to avoid accidental double/missing slashes
            self.driver.get(f"{BASE_URL.rstrip('/')}/login")

            try:
                self.wait.until(EC.presence_of_element_located((By.XPATH, "//div//h2[text()='Log In']")))
                self.log_result("Login Page Load", True, "Login form is present.")
                print("✅ Login form is present.")
            except Exception as e:
                self.log_result("Login Page Load", False, "Login form is not present.")
                error_message = getattr(e, 'msg', str(e))
                print(f"❌ Login form is not present: {error_message}")
                raise
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Login Page Load", False, error_message)
            print(f"❌ An error occurred: \n- {error_message}")

    def is_guidance_present(self, timeout=2):
        """Quick presence check for the guidance/popover used on deployed site.
        Returns True if popover is present within timeout, False otherwise."""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "#driver-popover-content.driver-popover, .driver-popover"))
            )
            return True
        except TimeoutException:
            return False
        except Exception:
            return False

    def guidanceWalkthrough(self, max_steps=20, wait_timeout=5):
        """Walk through the in-app guidance popover if present.

        Notes:
        - First do a short-presence check and return immediately if no popover.
        - Use safe waits for clickable state when candidate is a WebElement (WebDriver's element_to_be_clickable expects a locator tuple).
        - Re-query the popover after each click because the DOM can be re-rendered.
        """
        try:
            print("📝 Starting guidance walkthrough...")

            # short-circuit if no popover
            try:
                popover = WebDriverWait(self.driver, 2).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "#driver-popover-content.driver-popover, .driver-popover"))
                )
            except TimeoutException:
                print("ℹ️ No guidance popover present (quick check).")
                return
            except Exception:
                print("ℹ️ No guidance popover present (error on quick check).")
                return

            def read_progress(local_popover):
                try:
                    prog = local_popover.find_element(By.CSS_SELECTOR, ".driver-popover-progress-text")
                    return prog.text.strip()
                except Exception:
                    try:
                        title = local_popover.find_element(By.CSS_SELECTOR, "#driver-popover-title, .driver-popover-title")
                        return title.text.strip()
                    except Exception:
                        return None

            prev_progress = read_progress(popover)
            steps = 0

            while steps < max_steps:
                steps += 1

                # re-query nav buttons from the current popover instance
                nav_btns = []
                try:
                    nav_btns = popover.find_elements(By.CSS_SELECTOR, ".driver-popover-navigation-btns button, .driver-popover-navigation-btns > button, .driver-popover-next-btn, .driver-popover-prev-btn, button")
                except Exception:
                    pass

                candidate = None
                for btn in nav_btns:
                    try:
                        text = (btn.text or "").strip().lower()
                        if not text:
                            text = (btn.get_attribute("aria-label") or "").strip().lower()
                        # prefer Next/Done/Finish labels
                        if any(k in text for k in ("next", "done", "finish", "→", "→")) and btn.is_displayed() and btn.is_enabled():
                            candidate = btn
                            break
                    except Exception:
                        continue

                # fallback xpath search inside popover
                if candidate is None:
                    try:
                        candidate = popover.find_element(By.XPATH, ".//button[contains(translate(normalize-space(text()), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'next') or contains(translate(normalize-space(text()), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'done') or contains(translate(normalize-space(text()), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'finish')]")
                        if not (candidate.is_displayed() and candidate.is_enabled()):
                            candidate = None
                    except Exception:
                        candidate = None

                if candidate is None:
                    print("ℹ️ No popover navigation button found, assuming walkthrough finished.")
                    break

                # wait for the WebElement candidate to be clickable using a lambda (since expected_conditions.element_to_be_clickable expects a locator tuple)
                try:
                    WebDriverWait(self.driver, wait_timeout).until(lambda d: candidate.is_displayed() and candidate.is_enabled())
                except Exception:
                    # if the wait fails, we'll still try to click (with JS fallback)
                    pass

                try:
                    candidate.click()
                except Exception:
                    try:
                        # JS fallback click
                        self.driver.execute_script("arguments[0].click();", candidate)
                    except Exception:
                        raise

                # wait for change in progress/title or popover disappearance
                start = time.time()
                changed = False
                while time.time() - start < wait_timeout:
                    time.sleep(0.2)
                    try:
                        # re-query popover (it might be re-rendered)
                        popover = self.driver.find_element(By.CSS_SELECTOR, "#driver-popover-content.driver-popover, .driver-popover")
                        curr_progress = read_progress(popover)
                        if curr_progress and curr_progress != prev_progress:
                            changed = True
                            prev_progress = curr_progress
                            break
                    except Exception:
                        # if element not found => disappeared => finished
                        changed = True
                        break

                # If popover disappeared -> finished
                try:
                    if not popover.is_displayed():
                        print("ℹ️ Popover disappeared after clicking, walkthrough complete.")
                        break
                except Exception:
                    break

                # If progress didn't change, but button looked like final, assume done
                if not changed:
                    candidate_text = (candidate.text or "").strip().lower()
                    if any(k in candidate_text for k in ("done", "finish")):
                        print("ℹ️ Final button clicked but no progress change observed; assuming complete.")
                        break
                    # otherwise continue to next iteration and attempt again
            else:
                print(f"⚠️ Reached max_steps={max_steps} without finishing the walkthrough.")

            self.log_result("Guidance Walkthrough", True, "Completed guidance walkthrough.")
            print("✅ Guidance walkthrough completed.")
        except Exception as e:
            tb = traceback.format_exc()
            try:
                timestamp = int(time.time())
                png = f"/tmp/guidance_failure_{timestamp}.png"
                self.driver.save_screenshot(png)
                diag = f"Screenshot saved to {png}"
            except Exception:
                diag = "Failed to save screenshot"
            error_message = getattr(e, "msg", str(e)) + " | " + diag + " | " + tb
            self.log_result("Guidance Walkthrough", False, error_message)
            print(f"❌ An error occurred during guidance walkthrough: \n- {error_message}")

    def login_invalid(self):
        try:
            # always start from a fresh login page
            self.land_login_page()

            # wait for inputs
            self.wait.until(EC.visibility_of_element_located((By.NAME, "email")))
            self.wait.until(EC.visibility_of_element_located((By.NAME, "password")))

            print("🔐 Attempting to log in with invalid credentials...")
            email_input = self.driver.find_element(By.NAME, "email")
            pwd_input = self.driver.find_element(By.NAME, "password")
            email_input.clear()
            pwd_input.clear()
            email_input.send_keys("invalid@example.com")
            pwd_input.send_keys("wrongpassword")
            self.driver.find_element(By.XPATH, "//form//button[@type='submit']").click()

            # short wait for error message to appear
            local_wait = WebDriverWait(self.driver, 6)
            try:
                if (local_wait.until(EC.visibility_of_element_located(
                    (By.XPATH, ".//div//p[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'network') or contains(., 'error') or contains(., 'Network error')]")
                ))):
                    self.log_result("Invalid Login", False, "Network error message displayed for invalid login.")
                    print("❌ Network error message displayed for invalid login.")
                elif local_wait.until(EC.visibility_of_element_located(
                    (By.XPATH, ".//div//p[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'invalid') or contains(., 'Invalid email') or contains(., 'Invalid email or password')]")
                )):
                    self.log_result("Invalid Login", True, "Error message displayed for invalid login.")
                    print("✅ Error message displayed for invalid login.")
            except TimeoutException:
                # capture artifacts for debugging CI
                png, html = self._screenshot_and_snippet("invalid_login_no_error")
                console = self.capture_browser_console()
                self.log_result("Invalid Login", False, f"No error message displayed for invalid login (screenshot:{png}, console:{console})")
                print("❌ No error message displayed for invalid login (timeout). Artifacts:", png, html, console)
        except Exception as e:
            error_message = getattr(e, "msg", str(e))
            self.log_result("Invalid Login", False, error_message)
            print(f"❌ An error occurred while attempting invalid login: \n- {error_message}")
        finally:
            # clear fields and reload login page to ensure clean state for next test
            try:
                if self.driver.find_elements(By.NAME, "email"):
                    self.driver.find_element(By.NAME, "email").clear()
                if self.driver.find_elements(By.NAME, "password"):
                    self.driver.find_element(By.NAME, "password").clear()
            except Exception:
                pass
            # reload login page to remove banners/modals
            try:
                self.driver.get(f"{BASE_URL.rstrip('/')}/login")
                # give the page a moment to settle
                time.sleep(0.5)
                self.wait.until(EC.visibility_of_element_located((By.NAME, "email")))
            except Exception:
                pass

    def login_valid(self):
        try:
            try:
                email = os.getenv("TESTUSER1EMAIL")
                password = os.getenv("TESTUSER1PASSWORD")
                if email and password:
                    self.driver.execute_script("""
                        try {
                            localStorage.setItem('fakeUser', JSON.stringify({ email: arguments[0], password: arguments[1], username: 'CI Test User' }));
                        } catch(e) {}
                    """, email, password)
                    time.sleep(0.12)
            except Exception:
                pass

            # always start clean
            self.land_login_page()

            email = os.getenv("TESTUSER1EMAIL")
            password = os.getenv("TESTUSER1PASSWORD")
            
            if not email or not password:
                raise Exception("TESTUSER1EMAIL or TESTUSER1PASSWORD not set")

            # wait for inputs
            self.wait.until(EC.visibility_of_element_located((By.NAME, "email")))
            self.wait.until(EC.visibility_of_element_located((By.NAME, "password")))

            print("🔐 Attempting to log in (valid)...")
            email_el = self.driver.find_element(By.NAME, "email")
            pwd_el = self.driver.find_element(By.NAME, "password")
            email_el.clear()
            pwd_el.clear()
            email_el.send_keys(email)
            pwd_el.send_keys(password)

            if not self.dismiss_guidance_popover():
                print("⚠️ Could not dismiss popover before login; continuing with caution.")

            submit = self.driver.find_element(By.XPATH, "//form//button[@type='submit']")
            prev_url = self.driver.current_url
            submit.click()

            local_wait = WebDriverWait(self.driver, 15)
            try:
                # wait for either url change OR a known post-login path
                local_wait.until(
                    EC.any_of(
                        EC.url_changes(prev_url),
                        EC.url_contains("tasks"),
                        EC.url_contains("settings"),
                    )
                )
            except TimeoutException:
                current = self.driver.current_url
                # capture artifacts for debugging CI runs
                png, html = self._screenshot_and_snippet("login_no_redirect")
                console = self.capture_browser_console()
                self.log_result("Valid Login", False, f"Did not redirect; current URL: {current} (screenshot:{png}, console:{console})")
                print(f"❌ Login did not redirect within timeout. Current URL: {current}. Artifacts: {png}, {html}, {console}")
                return

            # final verification
            final_url = self.driver.current_url
            if "tasks" in final_url or "settings" in final_url:
                self.log_result("Valid Login", True, "Successfully logged in and redirected.")
                print("✅ Successfully logged in and redirected.")

                # only run guidance walkthrough if the popover is present
                if self.is_guidance_present(timeout=2):
                    print("ℹ️ Guidance popover detected after login — running walkthrough.")
                    self.guidanceWalkthrough()
                else:
                    print("ℹ️ No guidance popover detected after login — skipping walkthrough.")
            else:
                self.log_result("Valid Login", False, f"Unexpected redirect URL: {final_url}")
                print(f"❌ Login redirected to unexpected URL: {final_url}")
        except Exception as e:
            error_message = getattr(e, "msg", str(e))
            self.log_result("Valid Login", False, error_message)
            print(f"❌ An error occurred while validating login: \n- {error_message}")
            return

    def run_all_login(self):
        print("\n🔍 Running login feature tests...")
        try:
            self.land_login_page()
            self.login_invalid()
            self.land_login_page()
            self.login_valid()
        except Exception as e:
            error_message = getattr(e, "msg", str(e))
            self.log_result("Login Tests", False, error_message)
            print(f"❌ An error occurred during tests: \n- {error_message}")
        finally:
            return self.test_results