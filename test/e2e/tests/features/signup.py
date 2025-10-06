from dotenv import load_dotenv
from tests import constants
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import os
from tests.prechecks.base_test_suite import BaseTestSuite

load_dotenv()  # Load environment variables from .env file

class SignupTests(BaseTestSuite):
    def __init__(self, driver, wait):
        super().__init__(driver)
        self.wait = wait

    def land_signup_page(self):
        try:
            print("🚀 Launching Signup page...")
            self.driver.get(constants.BASE_URL + "/signup")

            try:
                self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "Create Account")))
                self.log_result("Signup Page Load", True, "Signup form is present.")
                print("✅ Signup form is present.")
            except:
                self.log_result("Signup Page Load", False, "Signup form is not present.")
                raise Exception("❌ Signup form is not present.")
        except Exception as e:
            print(f"❌ An error occurred: \n- {e}")

    def signup_invalid(self):
        try:
            if not self.driver.current_url.endswith("/signup"):
                print("🔄 Redirecting to Signup page...")
                self.land_signup_page()

            print("🔐 Attempting to sign up with invalid credentials...")
            self.driver.find_element(By.NAME, "email").send_keys("invalid")
            self.driver.find_element(By.NAME, "password").send_keys("wrongpassword")
            self.driver.find_element(By.TYPE, "submit").click()

            if self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error_message"))):
                self.log_result("Invalid Signup", True, "Error message displayed for invalid signup.")
                print("✅ Error message displayed for invalid signup.")
            else:
                self.log_result("Invalid Signup", False, "No error message displayed for invalid signup.")
                raise Exception("❌ No error message displayed for invalid signup.")
        except Exception as e:
            print(f"❌ An error occurred while attempting invalid signup: \n- {e}")

    def signup_valid(self):
        try:
            if not self.driver.current_url.endswith("/signup"):
                print("🔄 Redirecting to Signup page...")
                self.land_signup_page()

            username = os.getenv("TEST_USERNAME")
            password = os.getenv("TEST_PASSWORD")

            if not username or not password:
                raise Exception("❌ TEST_USERNAME or TEST_PASSWORD environment variables are not set.")
            
            print("🔐 Attempting to sign up...")
            self.driver.find_element(By.NAME, "email").send_keys(username)
            self.driver.find_element(By.NAME, "password").send_keys(password)
            self.driver.find_element(By.TYPE, "submit").click()

            if self.wait.until(EC.url_contains("/login")):
                self.log_result("Valid Signup", True, "Successfully signed up and redirected to login.")
                print("✅ Successfully signed up and redirected to login.")
            else:
                self.log_result("Valid Signup", False, "Signup failed or did not redirect to login.")
                raise Exception("❌ Signup failed or did not redirect to login.")
        except Exception as e:
            print(f"❌ An error occurred while fetching credentials: \n- {e}")
            return


    def run_all_signup(self):
        try:
            self.land_signup_page()
            self.signup_invalid()
            self.signup_valid()
        except Exception as e:
            print(f"❌ An error occurred during tests: \n- {e}")
        finally:
            return self.test_results