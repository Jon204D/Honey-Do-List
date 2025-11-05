from dotenv import load_dotenv
from operations.constants import BASE_URL
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import time
from tests.prechecks.base_test_suite import BaseTestSuite
from datetime import datetime
from dateutil.relativedelta import relativedelta
from tests.features.login import LoginTests

load_dotenv()

class TaskPageTests(BaseTestSuite):
    def __init__(self, driver, wait):
        super().__init__(driver)
        self.wait = wait

    def land_task_page(self):
        try:
            print("🚀 Logging in to access Task page...")
            # ensure login happens elsewhere and sets session/cookies
            from tests.features.login import LoginTests
            LoginTests(self.driver, self.wait).login_valid()
            print("🚀 Launching Task page...")
            self.driver.get(BASE_URL + "tasks")
            try:
                self.wait.until(EC.presence_of_element_located((By.XPATH, "//div[text()='Your Tasks']")))
                self.log_result("Task Page Load", True, "Task page is present.")
                print("✅ Task page is present.")
            except Exception as e:
                self.log_result("Task Page Load", False, "Task page is not present.")
                error_message = getattr(e, 'msg', str(e))
                print(f"❌ Task page is not present: {error_message}")
                raise
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Task Page Load", False, error_message)
            print(f"❌ An error occurred: \n- {error_message}")

    def add_task(self, task_name):
        try:
            if not self.driver.current_url.endswith("/tasks") and not self.driver.current_url.endswith("/"):
                print("🔄 Redirecting to Task page...")
                self.land_task_page()

            print(f"➕ Attempting to add task: {task_name}...")

            # Ensure overlays are gone right before clicking
            if not self.dismiss_guidance_popover():
                print("⚠️ Could not dismiss guidance popover before clicking Create Task; will attempt safe click/JS fallbacks.")

            # Wait for create button presence
            create_btn = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "button[data-tour='create-task'], button[data-tour='create-task-button']")))

            # Wait until create button is visible, enabled and not disabled attribute
            self.wait.until(lambda d: create_btn.is_displayed() and create_btn.is_enabled())
            # Wait for disabled attribute to clear if present
            self.wait.until(lambda d: create_btn.get_attribute("disabled") in (None, "", False))

            time.sleep(0.5)

            # Use safe_click helper
            if not self.safe_click(create_btn):
                png, html = self._screenshot_and_snippet("create_click_failed")
                self.log_result("Add Task", False, f"Could not click Create Task (screenshot:{png})")
                print(f"❌ Could not click Create Task. screenshot: {png}")
                return

            # Wait for modal/form to appear
            try:
                self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "form, form[data-tour='task-form']")))
            except Exception:
                # keep going but capture diagnostics
                png, html = self._screenshot_and_snippet("task_form_not_visible")
                print("⚠️ Task form not visible after clicking create. screenshot:", png)

            # Fill the form fields
            title_input = self.wait.until(EC.visibility_of_element_located((By.XPATH, "//form//input[@placeholder='Title' or @name='title']")))
            desc_input = self.driver.find_element(By.XPATH, "//form//textarea[@placeholder='Description' or @name='description']")
            title_input.clear()
            title_input.send_keys(task_name)
            desc_input.clear()
            desc_input.send_keys("Automated task created by E2E test.")

            # select status and priority if present
            try:
                status_select = self.driver.find_element(By.XPATH, "//form//select[option[contains(., 'Select Status')]]")
                for option in status_select.find_elements(By.TAG_NAME, "option"):
                    if option.text.strip().lower() == "pending":
                        option.click()
                        break
            except Exception:
                pass

            try:
                priority_select = self.driver.find_element(By.XPATH, "//form//select[option[contains(., 'Select Priority')]]")
                for option in priority_select.find_elements(By.TAG_NAME, "option"):
                    if option.text.strip().lower() == "high":
                        option.click()
                        break
            except Exception:
                pass

            # due date if present
            try:
                date_input = self.driver.find_element(By.XPATH, "//form//input[@type='date']")
                date_input.send_keys((datetime.now() + relativedelta(months=6)).strftime("%Y-%m-%d"))
            except Exception:
                pass

            # Submit the form (use safe_click on submit)
            submit_btn = self.wait.until(EC.presence_of_element_located((By.XPATH, "//form//button[@type='submit']")))
            if not self.safe_click(submit_btn):
                png, html = self._screenshot_and_snippet("task_submit_failed")
                self.log_result("Add Task", False, f"Could not submit Task form (screenshot:{png})")
                print("❌ Could not submit Task form.", png)
                return

            # Wait for the task to appear in the list
            try:
                task_element = self.wait.until(EC.presence_of_element_located((By.XPATH, f"//h3[contains(text(), '{task_name}')]")))
                if task_element:
                    self.log_result("Add Task", True, f"Task '{task_name}' added successfully.")
                    print(f"✅ Task '{task_name}' added successfully.")
                else:
                    self.log_result("Add Task", False, f"Task '{task_name}' was not added.")
                    print(f"❌ Task '{task_name}' was not added.")
            except Exception as e:
                png, html = self._screenshot_and_snippet("task_not_found")
                self.log_result("Add Task", False, f"Task '{task_name}' not found after submit (screenshot:{png})")
                print(f"❌ Task '{task_name}' not found after submit. screenshot: {png}")
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Add Task", False, error_message)
            print(f"❌ An error occurred while adding task: \n- {error_message}")

    def run_all_tasks(self):
        print("\n📋 Running Task Page Tests...")
        try:
            LoginTests(self.driver, self.wait).login_valid()
            self.land_task_page()
            self.add_task("Test Task 1")
            self.add_task("Test Task 2")
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Run All Tasks", False, error_message)
            print(f"❌ An error occurred during task tests: \n- {error_message}")
        finally:
            return self.test_results