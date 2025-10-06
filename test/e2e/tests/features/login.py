from dotenv import load_dotenv
from tests import constants
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import os

load_dotenv()  # Load environment variables from .env file

class LoginTests:
    def land_login_page(self):
        try:
            print("🚀 Launching Login page...")
            self.driver.get(constants.BASE_URL + "/login")

            try:
                self.wait.until(EC.presence_of_element_located((By.TITLE, "Log In")))
                print("✅ Login form is present.")
            except:
                raise Exception("❌ Login form is not present.")
        except Exception as e:
            print(f"❌ An error occurred: \n- {e}")

    def login_invalid(self):
        try:
            if not self.driver.current_url.endswith("/login"):
                print("🔄 Redirecting to Login page...")
                self.land_login_page()

            print("🔐 Attempting to log in with invalid credentials...")
            self.driver.find_element(By.NAME, "email").send_keys("invalid@example.com")
            self.driver.find_element(By.NAME, "password").send_keys("wrongpassword")
            self.driver.find_element(By.TYPE, "submit").click()

            if self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error_message"))):
                print("✅ Error message displayed for invalid login.")
            else:
                raise Exception("❌ No error message displayed for invalid login.")
        except Exception as e:
            print(f"❌ An error occurred while attempting invalid login: \n- {e}")

    def login_valid(self):
        try:
            if not self.driver.current_url.endswith("/login"):
                print("🔄 Redirecting to Login page...")
                self.land_login_page()

            username = os.getenv("TEST_USERNAME")
            password = os.getenv("TEST_PASSWORD")

            if not username or not password:
                raise Exception("❌ TEST_USERNAME or TEST_PASSWORD environment variables are not set.")
            
            print("🔐 Attempting to log in...")
            self.driver.find_element(By.NAME, "email").send_keys(username)
            self.driver.find_element(By.NAME, "password").send_keys(password)
            self.driver.find_element(By.TYPE, "submit").click()

            if self.wait.until(EC.url_contains("/dashboard")):
                print("✅ Successfully logged in and redirected to dashboard.")
            else:
                raise Exception("❌ Login failed or did not redirect to dashboard.")
        except Exception as e:
            print(f"❌ An error occurred while fetching credentials: \n- {e}")
            return


    def run_all_login(self):
        try:
            self.land_login_page()
            self.login_invalid()
            self.login_valid()
        except Exception as e:
            print(f"❌ An error occurred during tests: \n- {e}")
        finally:
            return self.results