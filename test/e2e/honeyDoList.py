# System imports
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from dotenv import load_dotenv
import os
# Custom imports
from operations.webdriverCheck import get_available_driver
import operations.constants as const

driver = get_available_driver()
wait = WebDriverWait(driver, 10)

class HoneyDoList:
    def __init__(self):
        self.driver = get_available_driver()
        self.wait = WebDriverWait(self.driver, 10)
        self.test_results = []

    def exit(self):
        # This method closes the browser window.
        try:
            self.driver.quit()
            print("✅ Browser closed successfully.")
        except Exception as e:
            print(f"❌ An error occurred while closing the browser: \n- {e}")

    def log_test_result(self, test_name, passed, message=""):
        # Log test results for reporting.
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "message": message
        })
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status}: {test_name} - {message}")

    def print_test_summary(self):
        # Print test execution summary.
        print("\n" + "=" * 50)
        print("🐝 TEST SUMMARY 🐝")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["passed"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%" if total_tests > 0 else "No tests run")
        
        if failed_tests > 0:
            print("\nFailed Tests:")
            for result in self.test_results:
                if not result["passed"]:
                    print(f"  - {result['test']}: {result['message']}")

    def run_initial_tests(self):
        try:
            from tests.prechecks.test_initial_checks import InitialChecks
            precheck_test = InitialChecks(self.driver, self.wait)
            results = precheck_test.run_all()
            self.test_results.extend(results)
        except Exception as e:
            self.log_test_result("Prechecks", False, str(e))

    def run_regression_test(self):
        try:
            # First, run initial environment checks
            self.run_initial_tests()
            # Import and run signup feature tests
            from tests.features.signup import SignupTests
            signup_test = SignupTests(self.driver, self.wait)
            results = signup_test.run_all_signup()

            # Import and run login feature tests
            from tests.features.login import LoginTests
            login_test = LoginTests(self.driver, self.wait)
            results += login_test.run_all_login()
        except Exception as e:
            self.log_test_result("Regression", False, str(e))
        finally:
            self.exit()
            self.print_test_summary()