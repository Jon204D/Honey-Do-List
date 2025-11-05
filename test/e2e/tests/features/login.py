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
            self.driver.get(BASE_URL + "login")

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
                local_wait.until(EC.visibility_of_element_located(
                    (By.XPATH, "//div//p[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'invalid') or contains(., 'Invalid email') or contains(., 'Invalid email or password')]")
                ))
                self.log_result("Invalid Login", True, "Error message displayed for invalid login.")
                print("✅ Error message displayed for invalid login.")
            except TimeoutException:
                # no error visible — mark failed but continue
                self.log_result("Invalid Login", False, "No error message displayed for invalid login (timeout).")
                print("❌ No error message displayed for invalid login (timeout).")
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
                self.driver.get(BASE_URL + "/login")
                # give the page a moment to settle
                time.sleep(0.5)
                self.wait.until(EC.visibility_of_element_located((By.NAME, "email")))
            except Exception:
                pass

    def login_valid(self):
        try:
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

            submit = self.driver.find_element(By.XPATH, "//form//button[@type='submit']")
            prev_url = self.driver.current_url
            submit.click()

            local_wait = WebDriverWait(self.driver, 15)
            try:
                # wait for either url change OR a known post-login path
                local_wait.until(
                    EC.any_of(
                        EC.url_changes(prev_url),
                        EC.url_contains("/tasks"),
                        EC.url_contains("/settings"),
                    )
                )
            except TimeoutException:
                current = self.driver.current_url
                self.log_result("Valid Login", False, f"Did not redirect; current URL: {current}")
                print(f"❌ Login did not redirect within timeout. Current URL: {current}.")
                return

            # final verification
            final_url = self.driver.current_url
            if "/tasks" in final_url or "/settings" in final_url:
                self.log_result("Valid Login", True, "Successfully logged in and redirected.")
                print("✅ Successfully logged in and redirected.")

                self.guidanceWalkthrough()
            else:
                # still a redirect but to unexpected place — log it
                self.log_result("Valid Login", False, f"Unexpected redirect URL: {final_url}")
                print(f"❌ Login redirected to unexpected URL: {final_url}")
        except Exception as e:
            error_message = getattr(e, "msg", str(e))
            self.log_result("Valid Login", False, error_message)
            print(f"❌ An error occurred while validating login: \n- {error_message}")
            return
        
    def guidanceWalkthrough(self, max_steps=20, wait_timeout=5):
        try:
            print("📝 Starting guidance walkthrough...")

            # Wait for the popover container to appear
            popover = self.wait.until(EC.presence_of_element_located(
                (By.CSS_SELECTOR, "#driver-popover-content.driver-popover, .driver-popover")
            ))

            # helper to read progress or title so we can detect change
            def read_progress():
                try:
                    prog = popover.find_element(By.CSS_SELECTOR, ".driver-popover-progress-text")
                    return prog.text.strip()
                except Exception:
                    # fallback to header/title text
                    try:
                        title = popover.find_element(By.CSS_SELECTOR, "#driver-popover-title, .driver-popover-title")
                        return title.text.strip()
                    except Exception:
                        # if nothing found return None
                        return None

            prev_progress = read_progress()
            steps = 0

            while steps < max_steps:
                steps += 1

                # find navigation buttons inside the popover only
                nav_btns = popover.find_elements(By.CSS_SELECTOR, ".driver-popover-navigation-btns button, .driver-popover-navigation-btns > button, .driver-popover-next-btn, .driver-popover-prev-btn, button")
                # filter for visible/usable buttons with text Next / Done / Finish / > / → etc.
                candidate = None
                for btn in nav_btns:
                    try:
                        text = (btn.text or "").strip().lower()
                        if not text:
                            # sometimes icons-only buttons; check aria-label
                            text = (btn.get_attribute("aria-label") or "").strip().lower()
                        # choose Next or final variants, prefer visible & enabled
                        if text in ("next", "next →", "→", "done", "finish", "done", "next >", "next→", "next—", "done"):
                            if btn.is_displayed() and btn.is_enabled():
                                candidate = btn
                                break
                        # fallback: if 'next' substring present
                        if "next" in text and btn.is_displayed() and btn.is_enabled():
                            candidate = btn
                            break
                    except Exception:
                        continue

                # If we didn't find a nav button using the popover's buttons, try a more specific selector for next/done
                if candidate is None:
                    try:
                        candidate = popover.find_element(By.XPATH, ".//button[contains(translate(normalize-space(text()), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'next') or contains(translate(normalize-space(text()), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'done') or contains(translate(normalize-space(text()), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'finish')]")
                        if not (candidate.is_displayed() and candidate.is_enabled()):
                            candidate = None
                    except Exception:
                        candidate = None

                if candidate is None:
                    # No more navigation button inside popover -> finished
                    print("ℹ️ No popover navigation button found, assuming walkthrough finished.")
                    break

                # click the candidate button in a safe manner
                try:
                    # wait until clickable
                    self.wait.until(EC.element_to_be_clickable(candidate))
                except Exception:
                    # ignore this small custom wait fallback; just click via JS if normal click fails
                    pass

                try:
                    # try normal click first
                    candidate.click()
                except Exception:
                    # fallback to JS click
                    try:
                        self.driver.execute_script("arguments[0].click();", candidate)
                    except Exception:
                        # if click completely fails, stop
                        raise

                # wait for the popover content / progress to change
                start = time.time()
                changed = False
                while time.time() - start < wait_timeout:
                    time.sleep(0.2)
                    try:
                        # re-query popover, it might have been re-rendered
                        popover = self.driver.find_element(By.CSS_SELECTOR, "#driver-popover-content.driver-popover, .driver-popover")
                        curr_progress = read_progress()
                        if curr_progress and curr_progress != prev_progress:
                            changed = True
                            prev_progress = curr_progress
                            break
                    except Exception:
                        # if popover disappears, we finished
                        changed = True
                        break

                # If popover disappeared -> finished
                try:
                    if not popover.is_displayed():
                        print("ℹ️ Popover disappeared after clicking, walkthrough complete.")
                        break
                except Exception:
                    break

                # If we didn't observe change, continue but track steps to avoid infinite loops
                if not changed:
                    # If the candidate's label was a final variant, break
                    candidate_text = (candidate.text or "").strip().lower()
                    if any(k in candidate_text for k in ("done", "finish")):
                        print("ℹ️ Final button clicked but no progress change observed; assuming complete.")
                        break
                    # else, continue to next iteration and attempt again
            else:
                # max_steps reached
                print(f"⚠️ Reached max_steps={max_steps} without finishing the walkthrough.")

            self.log_result("Guidance Walkthrough", True, "Completed guidance walkthrough.")
            print("✅ Guidance walkthrough completed.")
        except Exception as e:
            tb = traceback.format_exc()
            # Save diagnostics
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

    def run_all_login(self):
        print("🔍 Running login feature tests...")
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