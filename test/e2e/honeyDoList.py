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
wait = WebDriverWait(self.driver, 10)
load_dotenv()  # Load environment variables from .env file

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
        #Log test results for reporting.
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "message": message
        })
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status}: {test_name} - {message}")

    def print_test_summary(self):
        """Print test execution summary."""
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
            self.driver.get(const.BASE_URL)
            print(f"✅ Navigated to {const.BASE_URL} successfully.")
            time.sleep(2)  # Wait for the page to load

            # Example test: Check if the title contains "Honey Do List"
            assert "Honey Do List" in self.driver.title
            print("✅ Title check passed.")

            # Example test: Check if the main header is present
            header = self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
            assert header.text == "Honey Do List"
            print("✅ Header check passed.")

            self.exit()
            print("✅ All initial tests completed successfully.")
        except AssertionError as ae:
            print(f"❌ Assertion error: {ae}")
        except Exception as e:
            print(f"❌ An error occurred during tests: \n- {e}")
        finally:
            self.exit()