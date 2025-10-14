from dotenv import load_dotenv
from operations.constants import BASE_URL
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import os
from tests.prechecks.base_test_suite import BaseTestSuite

class InviteTests(BaseTestSuite):
    def __init__(self, driver, wait):
        super().__init__(driver)
        self.wait = wait
        load_dotenv()

    def land_invite_page(self):
        try:
            print("🚀 Launching Invite page...")
            self.driver.get(BASE_URL + "/invite")
            try:
                self.wait.until(EC.presence_of_element_located((By.XPATH, "//h3[text()='Send a New Invite']")))
                self.log_result("Invite Page Load", True, "Invite form is present.")
                print("✅ Invite form is present.")
            except Exception as e:
                self.log_result("Invite Page Load", False, "Invite form is not present.")
                error_message = getattr(e, 'msg', str(e))
                print(f"❌ Invite form is not present: {error_message}")
                raise
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Invite Page Load", False, error_message)
            print(f"❌ An error occurred: \n- {error_message}")

    def invite_invalid(self):
        try:
            if not self.driver.current_url.endswith("/invite"):
                print("🔄 Redirecting to Invite page...")
                self.land_invite_page()

            print("📧 Attempting to send invite with invalid email...")
            self.driver.find_element(By.XPATH, "//form//input[@type='email']").send_keys("invalid-email")
            self.driver.find_element(By.XPATH, "//form//button[@type='submit']").click()

            try:
                self.driver.find_element(By.XPATH, "//li[contains(., 'not-an-email')]")
                self.log_result("Invalid Invite", False, "Invalid email was incorrectly added to the list.")
                print("❌ Invalid email was incorrectly added to the list.")
            except Exception as e:
                self.log_result("Invalid Invite", True, "Invalid email was not added (expected behavior).")
                print("✅ Invalid email not added (expected behavior).")
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Invalid Invite", False, error_message)
            print(f"❌ An error occurred: \n- {error_message}")

    def invite_valid(self, valid_email):
        try:
            if not self.driver.current_url.endswith("/invite"):
                print("🔄 Redirecting to Invite page...")
                self.land_invite_page()

            print("📧 Attempting to send invite with valid email...")
            self.driver.find_element(By.XPATH, "//form//input[@type='email']").clear()
            self.driver.find_element(By.XPATH, "//form//input[@type='email']").send_keys(valid_email)
            self.driver.find_element(By.XPATH, "//form//button[@type='submit']").click()

            try:
                invite_item = self.wait.until(
                            EC.presence_of_element_located((By.XPATH, f"//li[contains(., '{valid_email}')]"))
                        )
                assert valid_email in invite_item.text
                print(f"✅ Invite '{valid_email}' added and displayed in the list.")
            except Exception as e:
                error_message = getattr(e, 'msg', str(e))
                self.log_result("Valid Invite", False, f"Success message not found after valid invite attempt: {error_message}")
                print(f"❌ Success message not found after valid invite attempt: {error_message}")
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Valid Invite", False, error_message)
            print(f"❌ An error occurred: \n- {error_message}")

    def run_all_invite(self):
        print("🔍 Running invite feature tests...")
        try:
            self.land_invite_page()
            self.invite_invalid()
            valid_email = os.getenv("TEST_EMAIL")
            if not valid_email:
                raise Exception("❌ TEST_EMAIL environment variable is not set.")
            self.invite_valid(valid_email)
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Invite Tests", False, error_message)
            print(f"❌ An error occurred while running invite tests: \n- {error_message}")
        finally:
            return self.test_results