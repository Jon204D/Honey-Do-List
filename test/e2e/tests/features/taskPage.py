from dotenv import load_dotenv
from operations.constants import BASE_URL
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import time
from tests.prechecks.base_test_suite import BaseTestSuite
from datetime import datetime
from dateutil.relativedelta import relativedelta
from tests.features.login import LoginTests

load_dotenv()

class TaskPageTests(BaseTestSuite):
    def __init__(self, driver=None, wait=None):
        super().__init__(driver)
        self.wait = wait if wait is not None else self.wait
        # set a stable viewport for CI
        try:
            self.set_viewport(1366, 768)
        except Exception:
            pass

    def land_task_page(self):
        try:
            print("🚀 Launching Task page...")
            self.driver.get(f"{BASE_URL.rstrip('/')}/tasks")
            try:
                self.wait.until(EC.presence_of_element_located((By.XPATH, "//div[text()='Your Tasks']")))
                self.log_result("Task Page Load", True, "Task page is present.")
                print("✅ Task page is present.")
            except Exception as e:
                self.log_result("Task Page Load", False, "Task page is not present.")
                error_message = getattr(e, "msg", str(e))
                print(f"❌ Task page is not present: {error_message}")
                raise
        except Exception as e:
            error_message = getattr(e, "msg", str(e))
            self.log_result("Task Page Load", False, error_message)
            print(f"❌ An error occurred: \n- {error_message}")

    def _wait_for_no_overlays(self, timeout=6, poll=0.25):
        overlay_selectors = [
            "#driver-popover-content.driver-popover",
            ".driver-popover",
            ".driver-overlay",
            "[data-tour='task-modal']",
            ".reactour__overlay-container",
        ]
        end = time.time() + timeout
        while time.time() < end:
            any_visible = False
            for sel in overlay_selectors:
                try:
                    elems = self.driver.find_elements(By.CSS_SELECTOR, sel)
                    for e in elems:
                        try:
                            if e.is_displayed():
                                any_visible = True
                                break
                        except Exception:
                            any_visible = True
                            break
                    if any_visible:
                        break
                except Exception:
                    continue
            if not any_visible:
                time.sleep(0.25)
                return True
            time.sleep(poll)
        return False

    def _ensure_user_like_interaction(self, element):
        try:
            element.click()
            element.send_keys(Keys.SPACE)
            element.send_keys(Keys.BACKSPACE)
            element.send_keys(Keys.TAB)
            time.sleep(0.12)
            return True
        except Exception:
            try:
                ActionChains(self.driver).move_to_element(element).click().send_keys(' ').send_keys(Keys.BACKSPACE).send_keys(Keys.TAB).perform()
                time.sleep(0.12)
                return True
            except Exception:
                return False

    def add_task(self, task_name):
        try:
            # ensure on tasks page
            current = self.driver.current_url
            base_root = BASE_URL.rstrip("/")
            if not (current.rstrip("/").endswith("/tasks") or current.rstrip("/") == base_root):
                print("🔄 Redirecting to Task page...")
                self.land_task_page()

            print(f"➕ Attempting to add task: {task_name}...")

            # dismiss overlays
            try:
                self.dismiss_guidance_popover()
            except Exception as e:
                print("⚠️ dismiss_guidance_popover error:", e)
            self._wait_for_no_overlays(timeout=6)

            # Create button locator
            create_locator = (By.CSS_SELECTOR, "button[data-tour='create-task'], button[data-tour='create-task-button'], button[aria-label*='Create Task']")

            # open modal using safe_click (locator-based)
            if not self.safe_click(create_locator):
                png, html = self._screenshot_and_snippet("create_click_failed")
                self.log_result("Add Task", False, f"Could not click Create Task (screenshot:{png})")
                print("❌ Could not click Create Task. screenshot:", png)
                return

            # wait for form
            try:
                form_locator = (By.CSS_SELECTOR, "form[data-tour='task-form'], form")
                form = WebDriverWait(self.driver, 12).until(EC.visibility_of_element_located(form_locator))
            except Exception:
                png, html = self._screenshot_and_snippet("task_form_not_visible")
                print("⚠️ Task form not visible after clicking create. screenshot:", png)
                try:
                    form = self.driver.find_element(By.CSS_SELECTOR, "form[data-tour='task-form'], form")
                except Exception:
                    self.log_result("Add Task", False, "Task form did not appear after clicking Create.")
                    return

            # Title
            try:
                title_input = form.find_element(By.XPATH, ".//input[@placeholder='Title' or @name='title']")
                self.ensure_field_set(title_input, task_name)
                # encourage framework to register real interaction
                self._ensure_user_like_interaction(title_input)
            except Exception:
                pass

            # Description
            try:
                desc_input = form.find_element(By.XPATH, ".//textarea[@placeholder='Description' or @name='description']")
                self.ensure_field_set(desc_input, "Automated task created by E2E test.")
                self._ensure_user_like_interaction(desc_input)
            except Exception:
                pass

            # selects
            try:
                status_select = form.find_element(By.XPATH, ".//select[option[contains(., 'Select Status')]]")
                for option in status_select.find_elements(By.TAG_NAME, "option"):
                    if option.text.strip().lower() == "pending":
                        option.click()
                        break
            except Exception:
                pass

            try:
                priority_select = form.find_element(By.XPATH, ".//select[option[contains(., 'Select Priority')]]")
                for option in priority_select.find_elements(By.TAG_NAME, "option"):
                    if option.text.strip().lower() == "high":
                        option.click()
                        break
            except Exception:
                pass

            # date
            try:
                date_input = form.find_element(By.XPATH, ".//input[@type='date']")
                target_date = (datetime.now() + relativedelta(months=6)).strftime("%Y-%m-%d")
                self.ensure_field_set(date_input, target_date)
                try:
                    date_input.send_keys(Keys.TAB)
                except Exception:
                    ActionChains(self.driver).move_to_element(date_input).click().send_keys(Keys.TAB).perform()
                time.sleep(0.12)
            except Exception:
                pass

            # submit
            submit_locator = (By.XPATH, "//form//button[@type='submit']")
            if not self.safe_click(submit_locator):
                png, html = self._screenshot_and_snippet("task_submit_failed")
                self.log_result("Add Task", False, f"Could not submit Task form (screenshot:{png})")
                print("❌ Could not submit Task form.", png)
                return

            # verify
            try:
                task_element = WebDriverWait(self.driver, 12).until(
                    EC.presence_of_element_located((By.XPATH, f"//h3[contains(normalize-space(.), '{task_name}')]"))
                )
                if task_element:
                    self.log_result("Add Task", True, f"Task '{task_name}' added successfully.")
                    print(f"✅ Task '{task_name}' added successfully.")
                else:
                    self.log_result("Add Task", False, f"Task '{task_name}' was not added.")
                    print(f"❌ Task '{task_name}' was not added.")
            except Exception:
                png, html = self._screenshot_and_snippet("task_not_found")
                self.log_result("Add Task", False, f"Task '{task_name}' not found after submit (screenshot:{png})")
                print(f"❌ Task '{task_name}' not found after submit. screenshot: {png}")

        except Exception as e:
            error_message = getattr(e, "msg", str(e))
            self.log_result("Add Task", False, error_message)
            print(f"❌ An error occurred while adding task: \n- {error_message}")
            
    def run_all_tasks(self):
        print("\n📋 Running Task Page Tests...")
        try:
            # login once to establish session/cookies
            LoginTests(self.driver, self.wait).login_valid()

            # navigate + run
            self.land_task_page()
            self.add_task("Test Task 1")
            self.add_task("Test Task 2")
        except Exception as e:
            error_message = getattr(e, "msg", str(e))
            self.log_result("Run All Tasks", False, error_message)
            print(f"❌ An error occurred during task tests: \n- {error_message}")
        finally:
            return self.test_results