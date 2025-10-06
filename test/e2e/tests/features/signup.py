from dotenv import load_dotenv
from tests import constants
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import os

load_dotenv()  # Load environment variables from .env file

class SignupTests:
    def land_signup_page(self):
        try:
            print("🚀 Launching Signup page...")
            self.driver.get(constants.BASE_URL + "/signup")

            try:
                self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "Create Account")))
                print("✅ Signup form is present.")
            except:
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
                print("✅ Error message displayed for invalid signup.")
            else:
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
                print("✅ Successfully signed up and redirected to login.")
            else:
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
            return self.results