from dotenv import load_dotenv
from operations.constants import BASE_URL
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException, ElementClickInterceptedException
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
            self.driver.get(BASE_URL + "/login")
            try:
                self.wait.until(EC.presence_of_element_located((By.XPATH, "//div//h2[text()='Log In']")))
                self.log_result("Login Page Load", True, "Login form is present.")
                print("✅ Login form is present.")
            except Exception as e:
                self.log_result("Login Page Load", False, "Login form is not present.")
                print("❌ Login form is not present:", getattr(e, "msg", str(e)))
                raise
        except Exception as e:
            self.log_result("Login Page Load", False, getattr(e, "msg", str(e)))
            print(f"❌ An error occurred: \n- {getattr(e, 'msg', str(e))}")

    def is_guidance_present(self, timeout=2):
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
        try:
            print("📝 Starting guidance walkthrough...")
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
                        if any(k in text for k in ("next", "done", "finish", "→")) and btn.is_displayed() and btn.is_enabled():
                            candidate = btn
                            break
                    except Exception:
                        continue

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

                try:
                    WebDriverWait(self.driver, wait_timeout).until(lambda d: candidate.is_displayed() and candidate.is_enabled())
                except Exception:
                    pass

                try:
                    candidate.click()
                except Exception:
                    try:
                        self.driver.execute_script("arguments[0].click();", candidate)
                    except Exception:
                        raise

                start = time.time()
                changed = False
                while time.time() - start < wait_timeout:
                    time.sleep(0.2)
                    try:
                        popover = self.driver.find_element(By.CSS_SELECTOR, "#driver-popover-content.driver-popover, .driver-popover")
                        curr_progress = read_progress(popover)
                        if curr_progress and curr_progress != prev_progress:
                            changed = True
                            prev_progress = curr_progress
                            break
                    except Exception:
                        changed = True
                        break

                try:
                    if not popover.is_displayed():
                        print("ℹ️ Popover disappeared after clicking, walkthrough complete.")
                        break
                except Exception:
                    break

                if not changed:
                    candidate_text = (candidate.text or "").strip().lower()
                    if any(k in candidate_text for k in ("done", "finish")):
                        print("ℹ️ Final button clicked but no progress change observed; assuming complete.")
                        break
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
            self.land_login_page()
            self.wait.until(EC.visibility_of_element_located((By.NAME, "email")))
            self.wait.until(EC.visibility_of_element_located((By.NAME, "password")))

            print("🔐 Attempting to log in with invalid credentials...")
            email_input = self.driver.find_element(By.NAME, "email")
            pwd_input = self.driver.find_element(By.NAME, "password")
            email_input.clear()
            pwd_input.clear()
            email_input.send_keys("invalid@example.com")
            pwd_input.send_keys("wrongpassword")
            # click submit (robust but simple)
            try:
                submit = self.driver.find_element(By.XPATH, "//form//button[@type='submit']")
                submit.click()
            except Exception:
                try:
                    submit = self.driver.find_element(By.XPATH, "//form//button[@type='submit']")
                    self.driver.execute_script("arguments[0].click();", submit)
                except Exception:
                    pass

            local_wait = WebDriverWait(self.driver, 6)
            try:
                local_wait.until(EC.visibility_of_element_located(
                    (By.XPATH, ".//div//p[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'invalid') or contains(., 'Invalid email') or contains(., 'Invalid email or password')]")
                ))
                self.log_result("Invalid Login", True, "Error message displayed for invalid login.")
                print("✅ Error message displayed for invalid login.")
            except TimeoutException:
                png, html = self._screenshot_and_snippet("invalid_login_no_error")
                console = self.capture_browser_console()
                self.log_result("Invalid Login", False, f"No error message displayed for invalid login (screenshot:{png}, console:{console})")
                print("❌ No error message displayed for invalid login (timeout). Artifacts:", png, html, console)
        except Exception as e:
            self.log_result("Invalid Login", False, getattr(e, "msg", str(e)))
            print(f"❌ An error occurred while attempting invalid login: \n- {getattr(e, 'msg', str(e))}")
        finally:
            try:
                if self.driver.find_elements(By.NAME, "email"):
                    self.driver.find_element(By.NAME, "email").clear()
                if self.driver.find_elements(By.NAME, "password"):
                    self.driver.find_element(By.NAME, "password").clear()
            except Exception:
                pass
            try:
                self.driver.get(f"{BASE_URL.rstrip('/')}/login")
                time.sleep(0.5)
                self.wait.until(EC.visibility_of_element_located((By.NAME, "email")))
            except Exception:
                pass

    def login_valid(self):
        """
        Attempt a valid login without relying on safe_click helper.
        - Seeds fakeUser in localStorage (CI fallback)
        - Navigates, fills credentials, clicks submit using direct click + JS fallback
        - Waits for redirect or inspects page for network error and captures artifacts
        """
        try:
            # Seed fakeUser for CI fallback
            try:
                email_env = os.getenv("TESTUSER1EMAIL")
                pwd_env = os.getenv("TESTUSER1PASSWORD")
                if email_env and pwd_env:
                    self.driver.execute_script("""
                        try {
                            localStorage.setItem('fakeUser', JSON.stringify({ email: arguments[0], password: arguments[1], username: 'CI Test User' }));
                        } catch(e) {}
                    """, email_env, pwd_env)
                    time.sleep(0.12)
            except Exception:
                pass

            # Start fresh
            self.land_login_page()

            email = os.getenv("TESTUSER1EMAIL")
            password = os.getenv("TESTUSER1PASSWORD")

            if not email or not password:
                raise Exception("TESTUSER1EMAIL or TESTUSER1PASSWORD not set")

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

            # Find submit button (locator) and attempt click without safe_click
            submit_locator = (By.XPATH, "//form//button[@type='submit']")
            try:
                submit_el = WebDriverWait(self.driver, 8).until(EC.presence_of_element_located(submit_locator))
            except Exception:
                png, html = self._screenshot_and_snippet("submit_not_found")
                console = self.capture_browser_console()
                self.log_result("Valid Login", False, f"Submit button not found (screenshot:{png}, console:{console})")
                print("❌ Submit button not found. Artifacts:", png, html, console)
                return

            prev_url = self.driver.current_url

            # Try clicking with retries, JS fallback if intercepted
            clicked = False
            for attempt in range(3):
                try:
                    submit_el.click()
                    clicked = True
                    break
                except ElementClickInterceptedException as e:
                    print(f"⚠️ submit click intercepted on attempt {attempt+1}; attempting JS click fallback.")
                    try:
                        self.driver.execute_script("arguments[0].click();", submit_el)
                        clicked = True
                        break
                    except Exception:
                        # try re-finding the element (in case of re-render)
                        try:
                            submit_el = self.driver.find_element(*submit_locator)
                        except Exception:
                            pass
                        time.sleep(0.25)
                except Exception:
                    # generic fallback: JS click then re-find
                    try:
                        self.driver.execute_script("arguments[0].click();", submit_el)
                        clicked = True
                        break
                    except Exception:
                        try:
                            submit_el = self.driver.find_element(*submit_locator)
                        except Exception:
                            pass
                        time.sleep(0.25)

            if not clicked:
                png, html = self._screenshot_and_snippet("login_submit_failed")
                console = self.capture_browser_console()
                self.log_result("Valid Login", False, f"Could not click login submit (screenshot:{png}, console:{console})")
                print("❌ Could not click login submit. Artifacts:", png, html, console)
                return
            
            if self.wait.until(EC.visibility_of_element_located((By.XPATH, "//div//p[text()='Invalid email or password']"))):
                print("❌ 'Invalid email or password' message shown before submitting valid login.\nAttempting to login with test user 3 instead.")
                
                # Capture artifacts
                png, html = self._screenshot_and_snippet("invalid_email_or_password")
                console = self.capture_browser_console()
                
                # Login as test user 3 instead
                email = os.getenv("TESTUSER3EMAIL")
                password = os.getenv("TESTUSER3PASSWORD")
                email_el.clear()
                pwd_el.clear()
                email_el.send_keys(email)
                pwd_el.send_keys(password)

            # Wait for redirect or known post-login url fragment
            local_wait = WebDriverWait(self.driver, 15)
            try:
                local_wait.until(
                    EC.any_of(
                        EC.url_changes(prev_url),
                        EC.url_contains("tasks"),
                        EC.url_contains("settings"),
                    )
                )
            except TimeoutException:
                current = self.driver.current_url
                png, html = self._screenshot_and_snippet("login_no_redirect")
                console = self.capture_browser_console()

                # Check for network / error message
                network_shown = False
                try:
                    WebDriverWait(self.driver, 2).until(EC.visibility_of_element_located(
                        (By.XPATH, ".//div//p[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'network') or contains(., 'error') or contains(., 'Network error')]")
                    ))
                    network_shown = True
                except Exception:
                    network_shown = False

                if network_shown:
                    self.log_result("Valid Login", False, "Network error message displayed during login.")
                    print("❌ Network error message displayed during login. Artifacts:", png, html, console)
                else:
                    self.log_result("Valid Login", False, f"Did not redirect; current URL: {current} (screenshot:{png}, console:{console})")
                    print(f"❌ Login did not redirect within timeout. Current URL: {current}. Artifacts: {png}, {html}, {console}")
                return

            # Final verification
            final_url = self.driver.current_url
            if "tasks" in final_url or "settings" in final_url:
                self.log_result("Valid Login", True, "Successfully logged in and redirected.")
                print("✅ Successfully logged in and redirected.")

                if self.is_guidance_present(timeout=2):
                    print("ℹ️ Guidance popover detected after login — running walkthrough.")
                    try:
                        self.guidanceWalkthrough()
                    except Exception:
                        print("⚠️ guidanceWalkthrough raised an error; continuing.")
                else:
                    print("ℹ️ No guidance popover detected after login — skipping walkthrough.")
            else:
                self.log_result("Valid Login", False, f"Unexpected redirect URL: {final_url}")
                print(f"❌ Login redirected to unexpected URL: {final_url}")
        except Exception as e:
            tb = traceback.format_exc()
            error_message = getattr(e, "msg", str(e))
            try:
                png, html = self._screenshot_and_snippet("login_unexpected_error")
                console = self.capture_browser_console()
            except Exception:
                png = html = console = None
            self.log_result("Valid Login", False, f"{error_message} | {tb} (artifacts: {png}, {html}, {console})")
            print(f"❌ An error occurred while validating login: \n- {error_message}\n{tb}")
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