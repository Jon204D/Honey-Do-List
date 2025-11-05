# System imports
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from dotenv import load_dotenv
import os
# Custom imports
from tests.prechecks.base_test_suite import BaseTestSuite
from operations.webdriverCheck import get_available_driver
import operations.constants as const

load_dotenv()  # Load environment variables from .env file

class HoneyDoList(BaseTestSuite):
    def __init__(self):
        super().__init__()

    def exit(self):
        # This method closes the browser window.
        try:
            self.driver.quit()
            print("✅ Browser closed successfully.")
        except Exception as e:
            print(f"❌ An error occurred while closing the browser: \n- {e}")

    def run_initial_tests(self):
        try:
            from tests.prechecks.test_initial_checks import InitialChecks
            precheck_test = InitialChecks(self.driver)
            results = precheck_test.run_all()
            self.test_results.extend(results)
        except Exception as e:
            self.log_result("Prechecks", False, str(e))

    def run_regression_test(self):
        try:
            # First, run initial environment checks
            self.run_initial_tests()
            results = []

            try:
                if self.dismiss_guidance_popover():
                    print("ℹ️ Guidance popover dismissed or not present.")
                else:
                    print("⚠️ Guidance popover still present after dismiss attempts.")
            except Exception as e:
                print("⚠️ Error trying to dismiss guidance popover:", e)

            # Import and run signup feature tests
            print("\n") # Add spacing in console output
            from tests.features.signup import SignupTests
            signup_test = SignupTests(self.driver, self.wait)
            results += signup_test.run_all_signup()
            self.test_results.extend(results)

            # Import and run invite feature tests
            print("\n") # Add spacing in console output
            from tests.features.invite import InviteTests
            invite_test = InviteTests(self.driver, self.wait)
            results += invite_test.run_all_invite()
            self.test_results.extend(results)

            # Import and run forgot password feature tests
            print("\n") # Add spacing in console output
            from tests.features.forgotPassword import ForgotPasswordTests
            forgot_password_test = ForgotPasswordTests(self.driver, self.wait)
            results += forgot_password_test.run_all_forgot_password()
            self.test_results.extend(results)

            # Import and run login feature tests
            print("\n") # Add spacing in console output
            from tests.features.login import LoginTests
            login_test = LoginTests(self.driver, self.wait)
            results += login_test.run_all_login()
            self.test_results.extend(results)

            # Import and run task page feature tests
            print("\n") # Add spacing in console output
            from tests.features.taskPage import TaskPageTests
            task_page_test = TaskPageTests(self.driver, self.wait)
            results += task_page_test.run_all_tasks()
            self.test_results.extend(results)

            # Import and run settings feature tests
            # print("\n") # Add spacing in console output
            # from tests.features.settings import SettingsTests
            # settings_test = SettingsTests(self.driver, self.wait)
            # results += settings_test.run_all_settings()
            # self.test_results.extend(results)
        except Exception as e:
            self.log_result("Regression", False, str(e))
        finally:
            self.exit()
            self.print_test_summary()