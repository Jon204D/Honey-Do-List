from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import operations.constants as const
import time
from tests.prechecks.base_test_suite import BaseTestSuite

class InitialChecks(BaseTestSuite):
    # Prechecks to ensure the application is ready for testing.
    # These tests validate basic functionality before running feature tests.

    def __init__(self, driver):
        super().__init__(driver)

    def test_page_load(self):
        # Test that the application loads successfully.
        try:
            self.driver.get(const.BASE_URL)
            time.sleep(2)  # Wait for page load
            
            # Check if page loaded
            if "Honey" in self.driver.title:
                self.log_result("Page Load", True, f"Successfully loaded {const.BASE_URL}")
            elif "React App" in self.driver.title:
                self.log_result("Page Load", False, f"Page loaded, but codebase loaded React App for {const.BASE_URL}")
            else:
                self.log_result("Page Load", False, f"Unexpected title: {self.driver.title}")
                
        except Exception as e:
            self.log_result("Page Load", False, str(e))
    
    def test_title_check(self):
        # Verify page title contains expected text.
        try:
            expected_texts = ["Honey"]
            title = self.driver.title
            
            if any(text in title for text in expected_texts):
                self.log_result("Title Check", True, f"Title contains expected text: {title}")
            elif title in "React App":
                self.log_result("Title Check", False, f"Title contains React App for {title}")
            else:
                self.log_result("Title Check", False, f"Title '{title}' doesn't contain expected text")
                
        except Exception as e:
            self.log_result("Title Check", False, str(e))
    
    def test_basic_dom_structure(self):
        # Check if basic DOM elements are present.
        try:
            # Wait for React to render
            time.sleep(1)
            
            # Look for common React app elements
            body = self.driver.find_element(By.TAG_NAME, "body")
            if body:
                self.log_result("DOM Structure", True, "Basic DOM structure is present")
            else:
                self.log_result("DOM Structure", False, "Body element not found")
                
        except Exception as e:
            self.log_result("DOM Structure", False, str(e))
    
    def run_all(self):
        # Run all precheck tests.
        print("🔍 Running initial application checks...")
        
        self.test_page_load()
        self.test_title_check() 
        self.test_basic_dom_structure()
        return self.test_results