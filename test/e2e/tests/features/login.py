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
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "#driver-popover-content.driver-popover, .driver-popover"))
            )
            return True
        except TimeoutException:
            return False
        except Exception:
            return False
        
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
                self.driver.get(f"{BASE_URL.rstrip('/')}/login")
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

            # ensure overlays removed before interacting
            if not self.dismiss_guidance_popover():
                print("⚠️ Could not dismiss guidance popover before login; continuing with caution.")

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

            # submit with safe click if available
            submit = self.wait.until(EC.presence_of_element_located((By.XPATH, "//form//button[@type='submit']")))
            if not self.safe_click(submit):
                png, html = self._screenshot_and_snippet("login_submit_failed")
                self.log_result("Valid Login", False, f"Could not click login submit (screenshot:{png})")
                print("❌ Could not click login submit.", png)
                return

            # wait for redirect or dashboard marker (give more time in CI)
            try:
                WebDriverWait(self.driver, 20).until(
                    EC.any_of(
                        EC.url_changes(self.driver.current_url),
                        EC.url_contains("tasks"),
                        EC.visibility_of_element_located((By.XPATH, "//div[text()='Your Tasks']"))
                    )
                )
            except TimeoutException:
                current = self.driver.current_url
                png, html = self._screenshot_and_snippet("login_no_redirect")
                self.log_result("Valid Login", False, f"Did not redirect; current URL: {current} (screenshot:{png})")
                print(f"❌ Login did not redirect within timeout. Current URL: {current}. Screenshot: {png}")
                return

            # final verification
            final_url = self.driver.current_url
            if "tasks" in final_url or "settings" in final_url or self.driver.find_elements(By.XPATH, "//div[text()='Your Tasks']"):
                self.log_result("Valid Login", True, "Successfully logged in and redirected.")
                print("✅ Successfully logged in and redirected.")
                # run guidance walkthrough only if present
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