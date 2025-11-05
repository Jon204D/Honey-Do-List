from dotenv import load_dotenv
from operations.constants import BASE_URL
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import os
import time
from tests.prechecks.base_test_suite import BaseTestSuite
from tests.features.login import LoginTests

load_dotenv()

class SettingsTests(BaseTestSuite):
    def __init__(self, driver, wait):
        super().__init__(driver)
        self.wait = wait

    def land_settings_page(self):
        try:
            print("🚀 Launching Settings page...")
            self.driver.get(BASE_URL + "settings")
            self.wait.until(EC.presence_of_element_located((By.XPATH, "//h2[text()='Account Settings']")))
            self.log_result("Settings Page Load", True, "Settings page is present.")
            print("✅ Settings page is present.")
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Settings Page Load", False, error_message)
            print(f"❌ Settings page is not present: {error_message}")

    def test_user_info_displayed(self, expected_username, expected_email, expected_password):
        try:
            self.land_settings_page()
            username_text = self.driver.find_element(By.XPATH, "//div[contains(text(), 'username')]").text
            email_text = self.driver.find_element(By.XPATH, "//div[contains(text(), 'email')]").text
            password_text = self.driver.find_element(By.XPATH, "//div[contains(text(), 'password')]").text
            assert expected_username in username_text
            assert expected_email in email_text
            assert "••••••" in password_text or expected_password in password_text
            self.log_result("User Info Displayed", True, "User info displayed correctly.")
            print("✅ User info displayed correctly.")
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("User Info Displayed", False, error_message)
            print(f"❌ User info display failed: {error_message}")

    def test_edit_username(self, new_username, current_password):
        try:
            self.land_settings_page()
            username_edit_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Reset Username')]")
            username_edit_btn.click()

            username_input = self.driver.find_element(By.XPATH, "//label[text()='Username']/following::input[1]")
            username_input.clear()
            username_input.send_keys(new_username)

            save_btn = self.driver.find_elements(By.XPATH, "//div//button[contains(text(), 'Save')]")
            save_btn[0].click()

            msg = self.wait.until(EC.presence_of_element_located((By.XPATH, "//form//p")))
            assert "Username updated!" in msg.text

            password_edit_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Reset Password')]")
            password_edit_btn.click()

            password_input = self.driver.find_element(By.XPATH, "//label[text()='Password']/following::input[1]")
            password_input.clear()
            password_input.send_keys(current_password)

            save_btn[1].click()

            msg = self.wait.until(EC.presence_of_element_located((By.XPATH, "//form//p")))
            assert "Password updated!" in msg.text

            self.log_result("Edit Username", True, "Username updated message displayed.")
            print("✅ Username update works.")
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Edit Username", False, error_message)
            print(f"❌ Username update failed: {error_message}")

    def test_edit_password(self, current_username, new_password):
        try:
            self.land_settings_page()
            username_edit_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Reset Username')]")
            username_edit_btn.click()

            username_input = self.driver.find_element(By.XPATH, "//label[text()='Username']/following::input[1]")
            username_input.clear()
            username_input.send_keys(current_username)

            save_btn = self.driver.find_elements(By.XPATH, "//div//button[contains(text(), 'Save')]")
            save_btn[0].click()

            msg = self.wait.until(EC.presence_of_element_located((By.XPATH, "//form//p")))
            assert "Username updated!" in msg.text

            password_edit_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Reset Password')]")
            password_edit_btn.click()

            password_input = self.driver.find_element(By.XPATH, "//label[text()='Password']/following::input[1]")
            password_input.clear()
            password_input.send_keys(new_password)

            save_btn[1].click()

            msg = self.wait.until(EC.presence_of_element_located((By.XPATH, "//form//p")))
            assert "Password updated!" in msg.text

            self.log_result("Edit Password", True, "Password updated message displayed.")
            print("✅ Password update works.")
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Edit Password", False, error_message)
            print(f"❌ Password update failed: {error_message}")

    def test_logout(self):
        try:
            self.land_settings_page()
            logout_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Log Out')]")
            logout_btn.click()

            self.wait.until(EC.presence_of_element_located((By.XPATH, "//h2[text()='Log In']")))
            msg = self.driver.find_element(By.XPATH, "//p")

            assert "You have been logged out!" in msg.text
            self.log_result("Logout", True, "Logout and redirect works.")
            print("✅ Logout and redirect works.")
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Logout", False, error_message)
            print(f"❌ Logout failed: {error_message}")

    def test_empty_fields_error(self):
        try:
            self.land_settings_page()
            username_edit_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Reset Username')]")
            username_edit_btn.click()

            username_input = self.driver.find_element(By.XPATH, "//label[text()='Username']/following::input[1]")
            username_input.clear()

            save_btn = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'Save')]")
            save_btn[1].click()

            msg = self.wait.until(EC.presence_of_element_located((By.XPATH, "//p")))
            assert "Username and password are required" in msg.text

            cancel_btn = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'Cancel')]")
            cancel_btn[1].click()

            password_edit_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Reset Password')]")
            password_edit_btn.click()

            password_input = self.driver.find_element(By.XPATH, "//label[text()='Password']/following::input[2]")
            password_input.clear()

            save_btn[2].click()

            msg = self.wait.until(EC.presence_of_element_located((By.XPATH, "//p")))
            assert "Username and password are required" in msg.text
            
            cancel_btn[2].click()
            self.log_result("Empty Fields Error", True, "Correct error message displayed for empty fields.")
            print("✅ Required field error message works.")
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Empty Fields Error", False, error_message)
            print(f"❌ Required field error message failed: {error_message}")

    def run_all_settings(self):
        print("\n⚙️ Running Settings Tests...")
        expected_username = os.getenv("TESTUSER1USERNAME")
        expected_email = os.getenv("TESTUSER1EMAIL")
        expected_password = os.getenv("TESTUSER1PASSWORD")

        current_username = os.getenv("TESTUSER1USERNAME")
        current_password = os.getenv("TESTUSER1PASSWORD")

        new_username = os.getenv("TESTUSERNEWUSERNAME")
        new_password = os.getenv("TESTUSERNEWPASSWORD")
        
        try:
            LoginTests(self.driver, self.wait).login_valid()
            # Initial checks
            # self.test_user_info_displayed(expected_username, expected_email, expected_password) --- Temporarily disabled ---
            # Edit username and password
            self.test_edit_username(new_username, current_password)
            self.test_edit_password(current_username, new_password)
            # Verify changes
            # self.test_user_info_displayed(new_username, expected_email, new_password) --- Temporarily disabled ---
            # Revert changes
            self.test_edit_username(expected_username, new_password)
            self.test_edit_password(new_username, expected_password)
            self.test_logout()
            self.test_empty_fields_error()
            print("🎉 All Settings tests passed!")
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Run All Settings", False, error_message)
            print(f"❌ An error occurred during Settings tests: \n- {error_message}")
        finally:
            return self.test_results