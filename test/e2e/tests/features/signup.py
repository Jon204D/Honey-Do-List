from dotenv import load_dotenv
from operations.constants import BASE_URL
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import os
from tests.prechecks.base_test_suite import BaseTestSuite

load_dotenv()

class SignupTests(BaseTestSuite):
    def __init__(self, driver, wait):
        super().__init__(driver)
        self.wait = wait

    def land_signup_page(self):
        try:
            print("🚀 Launching Signup page...")
            self.driver.get(BASE_URL + "/signup")
            try:
                self.wait.until(EC.presence_of_element_located((By.XPATH, "//h2[text()='Create Account']")))
                self.log_result("Signup Page Load", True, "Signup form is present.")
                print("✅ Signup form is present.")
            except Exception as e:
                self.log_result("Signup Page Load", False, "Signup form is not present.")
                error_message = getattr(e, 'msg', str(e))
                print(f"❌ Signup form is not present: {error_message}")
                raise
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Signup Page Load", False, error_message)
            print(f"❌ An error occurred: \n- {error_message}")

    def signup_invalid(self):
        try:
            if not self.driver.current_url.endswith("signup"):
                print("🔄 Redirecting to Signup page...")
                self.land_signup_page()

            print("🔐 Attempting to sign up with invalid credentials...")
            self.driver.find_element(By.NAME, "username").send_keys("Hi")
            self.driver.find_element(By.NAME, "email").send_keys("invalid")
            self.driver.find_element(By.NAME, "password").send_keys("wrongpassword")
            self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

            try:
                error_element = self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "p")))
                error_text = error_element.text.strip()
                
                expected_errors = [
                    "Username must be at least 3 characters long.",
                    "Invalid email format.",
                    "Password must be at least 6 characters long.",
                ]

                if any(err in error_text for err in expected_errors):
                    self.log_result("Invalid Signup", True, f"Error message displayed for invalid signup: {error_text}")
                    print(f"✅ Error message displayed for invalid signup: {error_text}")
                else:
                    self.log_result("Invalid Signup", False, f"No expected error message displayed. Actual: '{error_text}'")
                    print(f"❌ No expected error message displayed. Actual: '{error_text}'")
            except Exception as e:
                error_message = str(e).splitlines()[0] if str(e).strip() else "Unknown error"
                self.log_result("Invalid Signup", False, error_message)
                print(f"❌ An error occurred while setting invalid credentials and checking errors: \n- {error_message}")
        except Exception as e:
            error_message = str(e).splitlines()[0] if str(e).strip() else "Unknown error"
            self.log_result("Invalid Signup", False, error_message)
            print(f"❌ An error occurred while attempting invalid signup: \n- {error_message}")

    def signup_valid(self):
        try:
            if not self.driver.current_url.endswith("signup"):
                print("🔄 Redirecting to Signup page...")
                self.land_signup_page()
            email = os.getenv("TESTUSER1EMAIL")
            username = os.getenv("TESTUSER1USERNAME")
            password = os.getenv("TESTUSER1PASSWORD")
            if not email or not username or not password:
                raise Exception("❌ TEST_EMAIL, TEST_USERNAME, or TEST_PASSWORD environment variables are not set.")
            print("🔐 Attempting to sign up...")
            self.driver.find_element(By.NAME, "email").send_keys(email)
            self.driver.find_element(By.NAME, "username").send_keys(username)
            self.driver.find_element(By.NAME, "password").send_keys(password)
            self.dismiss_guidance_popover()
            self.driver.find_element(By.XPATH, "//button[@type='submit']").click()

            error_element = self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "p")))
            error_text = error_element.text.strip()

            if "Email already in use / taken" in error_text:
                print("✅ User already exists. Consider using different credentials.")
                self.driver.get(BASE_URL + "/login")
            elif self.wait.until(EC.url_contains("login")):
                self.log_result("Valid Signup", True, "Successfully signed up and redirected to login.")
                print("✅ Successfully signed up and redirected to login.")
            else:
                self.log_result("Valid Signup", False, "Signup failed or did not redirect to login.")
                raise Exception("❌ Signup failed or did not redirect to login.")
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Valid Signup", False, error_message)
            print(f"❌ An error occurred while fetching credentials: \n- {error_message}")

    def run_all_signup(self):
        print("\n🔍 Running signup feature tests...")
        try:
            self.land_signup_page()
            self.signup_invalid()
            self.signup_valid()
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Signup Suite", False, error_message)
            print(f"❌ An error occurred during tests: \n- {error_message}")
        finally:
            return self.test_results