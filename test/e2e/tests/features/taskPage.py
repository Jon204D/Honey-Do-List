from dotenv import load_dotenv
from operations.constants import BASE_URL
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import time
from tests.prechecks.base_test_suite import BaseTestSuite

load_dotenv()


class TaskPageTests(BaseTestSuite):
    """
    Simplified Task page test that uses straightforward, direct interactions
    (reverting to the simpler behavior requested).
    """

    def __init__(self, driver=None, wait=None):
        super().__init__(driver)
        # allow injecting a WebDriverWait from caller; otherwise use BaseTestSuite's wait
        self.wait = wait if wait is not None else self.wait

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
                print(f"❌ Task page is not present: {e}")
                raise
        except Exception as e:
            self.log_result("Task Page Load", False, str(e))
            print(f"❌ An error occurred: {e}")

    def add_task(self, task_name):
        try:
            # Ensure we're on the tasks page
            if not self.driver.current_url.rstrip("/").endswith("/tasks"):
                self.land_task_page()
                self.dismiss_guidance_popover()

            print(f"➕ Attempting to add task: {task_name}...")

            # Wait for the Create button to be present and clickable (simple direct interaction)
            try:
                self.wait.until(EC.presence_of_element_located((By.XPATH, "//button[contains(text(), '+ Create Task') or contains(., '+ Create Task')]")))
            except Exception:
                # fallback: presence of any create-task data-tour button
                pass

            # Direct find & click the Create button using the text match
            try:
                create_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), '+ Create Task') or contains(., '+ Create Task')]")
                create_btn.click()
            except Exception as e:
                # fallback to alternative selector if text-based click fails
                try:
                    create_btn = self.driver.find_element(By.CSS_SELECTOR, "button[data-tour='create-task'], button[data-tour='create-task-button']")
                    create_btn.click()
                except Exception as final_e:
                    png, html = self._screenshot_and_snippet("create_click_failed")
                    self.log_result("Add Task", False, f"Could not click Create Task (screenshot:{png})")
                    print("❌ Could not click Create Task:", final_e)
                    return

            # Wait briefly for form to appear
            time.sleep(0.6)
            try:
                self.wait.until(EC.visibility_of_element_located((By.XPATH, "//form")))
            except Exception:
                # will still try to fill fields; capture diagnostic screenshot
                png, html = self._screenshot_and_snippet("task_form_not_visible")
                print("⚠️ Task form not clearly visible after clicking create. screenshot:", png)

            # Fill title and description using straightforward send_keys per your original approach
            try:
                title_el = self.driver.find_element(By.XPATH, "//form//input[@placeholder='Title' or @name='title']")
                title_el.clear()
                title_el.send_keys(task_name)
            except Exception as e:
                png, html = self._screenshot_and_snippet("title_not_found")
                self.log_result("Add Task", False, f"Title input not found (screenshot:{png})")
                print("❌ Title input error:", e)
                return

            try:
                desc_el = self.driver.find_element(By.XPATH, "//form//textarea[@placeholder='Description' or @name='description']")
                desc_el.clear()
                desc_el.send_keys(
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam a odio imperdiet, dictum diam id, fringilla sapien. "
                    "Proin nec velit at magna dapibus convallis. Maecenas nec orci vel tellus pellentesque maximus id a tellus. Donec eget "
                    "convallis lorem, nec dapibus magna. Duis vel malesuada lectus. Ut quis eleifend dolor. Proin imperdiet posuere sodales. "
                    "In blandit malesuada massa, non accumsan velit sodales ut. Etiam non rutrum neque. Donec ut augue nec est sodales semper at sit amet odio. "
                    "Cras quis velit a lorem aliquam rhoncus vel eget turpis. Morbi fringilla neque condimentum tortor gravida scelerisque. "
                    "Vestibulum placerat leo vitae ipsum suscipit. Nullam a felis euismod, convallis erat in, facilisis libero. Nulla facilisi. "
                    "In hac habitasse platea dictumst."
                )
            except Exception as e:
                # description optional; continue
                print("⚠️ Description input not found or could not be filled:", e)

            # Select Status (simple approach: open select and pick option by visible text)
            try:
                select_Status = self.driver.find_element(By.XPATH, "//form//select[option[contains(text(), 'Select Status')]]")
                for option in select_Status.find_elements(By.TAG_NAME, "option"):
                    if option.text.strip().lower() == "pending":
                        option.click()
                        break
            except Exception:
                # if select not present, ignore
                pass

            # Select Priority
            try:
                select_Priority = self.driver.find_element(By.XPATH, "//form//select[option[contains(text(), 'Select Priority')]]")
                for option in select_Priority.find_elements(By.TAG_NAME, "option"):
                    if option.text.strip().lower() == "high":
                        option.click()
                        break
            except Exception:
                pass

            # Submit the form with a direct click on the submit button
            try:
                submit_btn = self.driver.find_element(By.XPATH, "//form//button[@type='submit' and (contains(., 'Save') or contains(., 'save') or contains(., 'Create'))]")
                submit_btn.click()
            except Exception as e:
                # fallback to any submit button
                try:
                    submit_btn = self.driver.find_element(By.XPATH, "//form//button[@type='submit']")
                    submit_btn.click()
                except Exception as final_e:
                    png, html = self._screenshot_and_snippet("submit_not_found")
                    self.log_result("Add Task", False, f"Submit button not found or not clickable (screenshot:{png})")
                    print("❌ Submit error:", final_e)
                    return

            # short wait for the task to appear
            time.sleep(0.8)
            try:
                task_element = self.wait.until(EC.presence_of_element_located((By.XPATH, f"//h3[contains(., '{task_name}')]")),)
                if task_element:
                    self.log_result("Add Task", True, f"Task '{task_name}' added successfully.")
                    print(f"✅ Task '{task_name}' added successfully.")
                else:
                    self.log_result("Add Task", False, f"Task '{task_name}' was not found after submit.")
                    print(f"❌ Task '{task_name}' was not found after submit.")
            except Exception as e:
                png, html = self._screenshot_and_snippet("task_not_found")
                self.log_result("Add Task", False, f"Task '{task_name}' not found after submit (screenshot:{png})")
                print("❌ Could not verify task creation:", e)

        except Exception as e:
            png, html = self._screenshot_and_snippet("add_task_error")
            self.log_result("Add Task", False, f"Unexpected error while adding task: {e} (screenshot:{png})")
            print(f"❌ An unexpected error occurred while adding task: {e}")

    def run_all_tasks(self):
        print("\n📋 Running Task Page Tests...")
        try:
            # perform a login once (preserve existing behavior)
            from tests.features.login import LoginTests
            LoginTests(self.driver, self.wait).login_valid()

            self.land_task_page()
            self.add_task("Test Task 1")
            self.add_task("Test Task 2")
        except Exception as e:
            self.log_result("Run All Tasks", False, str(e))
            print(f"❌ An error occurred during task tests: {e}")
        finally:
            return self.test_results