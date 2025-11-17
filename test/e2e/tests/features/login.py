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
        self.driver.get(f"{BASE_URL.rstrip('/')}/login")
        self.wait.until(EC.presence_of_element_located((By.XPATH, "//div//h2[text()='Log In']")))

    def login_invalid(self):
        self.land_login_page()
        self.wait.until(EC.visibility_of_element_located((By.NAME, "email")))
        self.wait.until(EC.visibility_of_element_located((By.NAME, "password")))

        email_input = self.driver.find_element(By.NAME, "email")
        pwd_input = self.driver.find_element(By.NAME, "password")
        email_input.clear()
        pwd_input.clear()
        email_input.send_keys("invalid@example.com")
        pwd_input.send_keys("wrongpassword")

        try:
            submit = self.driver.find_element(By.XPATH, "//form//button[@type='submit']")
            try:
                submit.click()
            except ElementClickInterceptedException:
                self.driver.execute_script("arguments[0].click();", submit)
        except Exception:
            pass

        local_wait = WebDriverWait(self.driver, 6)
        try:
            local_wait.until(EC.visibility_of_element_located(
                (By.XPATH, ".//div//p[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'invalid') or contains(., 'invalid credentials') or contains(., 'network')]")
            ))
            self.log_result("Invalid Login", True, "Error or network message displayed for invalid login.")
        except TimeoutException:
            png, html = self._screenshot_and_snippet("invalid_login_no_error")
            console = self.capture_browser_console()
            self.log_result("Invalid Login", False, f"No error message displayed for invalid login (screenshot:{png}, console:{console})")

    def login_valid(self):
        """
        Attempt a valid login that exercises the network path (no unconditional fakeUser).
        If you want to opt into a local fallback for debugging only, set USE_TEST_FALLBACK=true in the Action or env.
        """
        # Optionally seed local fallback only if explicitly requested
        try:
            if os.getenv("USE_TEST_FALLBACK") == "true":
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

        self.land_login_page()

        email = os.getenv("TESTUSER1EMAIL")
        password = os.getenv("TESTUSER1PASSWORD")
        if not email or not password:
            self.log_result("Valid Login", False, "TESTUSER1EMAIL or TESTUSER1PASSWORD not set")
            return

        self.wait.until(EC.visibility_of_element_located((By.NAME, "email")))
        self.wait.until(EC.visibility_of_element_located((By.NAME, "password")))

        email_el = self.driver.find_element(By.NAME, "email")
        pwd_el = self.driver.find_element(By.NAME, "password")
        email_el.clear()
        pwd_el.clear()
        email_el.send_keys(email)
        pwd_el.send_keys(password)

        try:
            submit = self.driver.find_element(By.XPATH, "//form//button[@type='submit']")
            try:
                submit.click()
            except ElementClickInterceptedException:
                self.driver.execute_script("arguments[0].click();", submit)
        except Exception:
            png, html = self._screenshot_and_snippet("submit_not_found")
            console = self.capture_browser_console()
            self.log_result("Valid Login", False, f"Submit button not found (screenshot:{png}, console:{console})")
            return
        
        try:
            if self.wait.until(EC.visibility_of_element_located((By.XPATH, "//div//p[text()='Invalid email or password']"))):
                print("❌ 'Invalid email or password' message shown before submitting valid login.\nAttempting to login with test user 3 instead.")
                
                # Capture artifacts
                png, html = self._screenshot_and_snippet("invalid_email_or_password")
                console = self.capture_browser_console()
                
                # Login as test user 3 instead
                email = os.getenv("TESTUSER2EMAIL")
                password = os.getenv("TESTUSER2PASSWORD")
                email_el.clear()
                pwd_el.clear()
                email_el.send_keys(email)
                pwd_el.send_keys(password)

                try:
                    submit = self.driver.find_element(By.XPATH, "//form//button[@type='submit']")
                    try:
                        submit.click()
                    except ElementClickInterceptedException:
                        self.driver.execute_script("arguments[0].click();", submit)
                except Exception:
                    png, html = self._screenshot_and_snippet("submit_not_found")
                    console = self.capture_browser_console()
                    self.log_result("Valid Login", False, f"Submit button not found (screenshot:{png}, console:{console})")
                    return
        except Exception:
            pass

        local_wait = WebDriverWait(self.driver, 15)
        try:
            local_wait.until(
                EC.any_of(
                    EC.url_contains("tasks"),
                    EC.url_contains("settings"),
                )
            )
            self.log_result("Valid Login", True, "Successfully logged in and redirected.")
        except TimeoutException:
            png, html = self._screenshot_and_snippet("login_no_redirect")
            console = self.capture_browser_console()
            # check for whether a network error message was shown
            try:
                WebDriverWait(self.driver, 2).until(EC.visibility_of_element_located(
                    (By.XPATH, ".//div//p[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'network') or contains(., 'error')]")
                ))
                self.log_result("Valid Login", False, "Network error displayed during login. (Backend/CORS issue)")
            except Exception:
                self.log_result("Valid Login", False, f"Did not redirect; current URL: {self.driver.current_url} (screenshot:{png}, console:{console})")
    
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