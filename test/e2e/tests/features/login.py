from dotenv import load_dotenv
from operations.constants import BASE_URL
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import os
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
                error_message = getattr(e, 'msg', str(e))
                print(f"❌ Login form is not present: {error_message}")
                raise
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Login Page Load", False, error_message)
            print(f"❌ An error occurred: \n- {error_message}")

    def login_invalid(self):
        try:
            if not self.driver.current_url.endswith("/login"):
                print("🔄 Redirecting to Login page...")
                self.land_login_page()

            print("🔐 Attempting to log in with invalid credentials...")
            self.driver.find_element(By.NAME, "email").send_keys("invalid@example.com")
            self.driver.find_element(By.NAME, "password").send_keys("wrongpassword")
            self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

            if self.wait.until(EC.presence_of_element_located((By.XPATH, "//div//p[contains(text(), 'Invalid email or password!')]"))):
                self.log_result("Invalid Login", True, "Error message displayed for invalid login.")
                print("✅ Error message displayed for invalid login.")
            else:
                self.log_result("Invalid Login", False, "No error message displayed for invalid login.")
                raise Exception("❌ No error message displayed for invalid login.")
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Invalid Login", False, error_message)
            print(f"❌ An error occurred while attempting invalid login: \n- {error_message}")
        finally:
            self.driver.find_element(By.NAME, "email").clear()
            self.driver.find_element(By.NAME, "password").clear()

    def login_valid(self):
        try:
            if not self.driver.current_url.endswith("/login"):
                print("🔄 Redirecting to Login page...")
                self.land_login_page()

            email = os.getenv("TEST_EMAIL")
            password = os.getenv("TEST_PASSWORD")

            if not email or not password:
                raise Exception("❌ TEST_EMAIL or TEST_PASSWORD environment variables are not set.")
            
            print("🔐 Attempting to log in...")
            self.driver.find_element(By.NAME, "email").send_keys(email)
            self.driver.find_element(By.NAME, "password").send_keys(password)
            self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

            if self.wait.until(EC.url_contains("/dashboard")):
                self.log_result("Valid Login", True, "Successfully logged in and redirected to dashboard.")
                print("✅ Successfully logged in and redirected to dashboard.")
            else:
                raise Exception("❌ Login failed or did not redirect to dashboard.")
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Valid Login", False, error_message)
            print(f"❌ An error occurred while fetching credentials: \n- {error_message}")
            return

    def run_all_login(self):
        print("🔍 Running login feature tests...")
        try:
            self.land_login_page()
            self.login_invalid()
            self.login_valid()
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Login Tests", False, error_message)
            print(f"❌ An error occurred during tests: \n- {error_message}")
        finally:
            return self.test_results