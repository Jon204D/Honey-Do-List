from dotenv import load_dotenv
from operations.constants import BASE_URL
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import os
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
            print("🚀 Launching Task page...")
            self.driver.get(BASE_URL + "/tasks")

            if self.driver.current_url.endswith("/login"):
                LoginTests(self.driver, self.wait).login_valid()
                
                if not self.driver.current_url.endswith("/tasks"):
                    self.driver.get(BASE_URL + "/tasks")
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
            if not self.driver.current_url.endswith("/tasks"):
                print("🔄 Redirecting to Task page...")
                self.land_task_page()

            print(f"➕ Attempting to add task: {task_name}...")
            self.driver.find_element(By.XPATH, "//button[contains(text(), '+ Create Task')]").click()
            self.driver.find_element(By.XPATH, "//form//input[@placeholder='Title']").send_keys(task_name)
            self.driver.find_element(By.XPATH, "//form//textarea[@placeholder='Description']").send_keys("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam a odio imperdiet, dictum diam id, fringilla sapien. Proin nec velit at magna dapibus convallis. Maecenas nec orci vel tellus pellentesque maximus id a tellus. Donec eget convallis lorem, nec dapibus magna. Duis vel malesuada lectus. Ut quis eleifend dolor. Proin imperdiet posuere sodales. In blandit malesuada massa, non accumsan velit sodales ut. Etiam non rutrum neque. Donec ut augue nec est sodales semper at sit amet odio. Cras quis velit a lorem aliquam rhoncus vel eget turpis. Morbi fringilla neque condimentum tortor gravida scelerisque. Vestibulum placerat leo vitae ipsum suscipit. Nullam a felis euismod, convallis erat in, facilisis libero. Nulla facilisi. In hac habitasse platea dictumst.")
            select_Status = self.driver.find_element(By.XPATH, "//form//select[option[contains(text(), 'Select Status')]]")
            for option in select_Status.find_elements(By.TAG_NAME, 'option'):
                if option.text == 'Pending':
                    option.click()
                    break
            select_Priority = self.driver.find_element(By.XPATH, "//select[option[contains(text(), 'Select Priority')]]")
            for option in select_Priority.find_elements(By.TAG_NAME, 'option'):
                if option.text == 'High':
                    option.click()
                    break
            self.driver.find_element(By.XPATH, "//form//input[@type='date']").send_keys((datetime.now() + relativedelta(months=6)).strftime("%m-%d-%Y"))
            self.driver.find_element(By.XPATH, "//form//button[@type='submit']").click()

            try:
                task_element = self.wait.until(EC.presence_of_element_located((By.XPATH, f"//div//div//div//h3[contains(text(), '{task_name}')]")))
                if task_element:
                    self.log_result("Add Task", True, f"Task '{task_name}' added successfully.")
                    print(f"✅ Task '{task_name}' added successfully.")
                else:
                    self.log_result("Add Task", False, f"Task '{task_name}' was not added.")
                    print(f"❌ Task '{task_name}' was not added.")
            except Exception as e:
                self.log_result("Add Task", False, f"Task '{task_name}' was not added.")
                error_message = getattr(e, 'msg', str(e))
                print(f"❌ Task '{task_name}' was not added: {error_message}")
        except Exception as e:
            error_message = getattr(e, 'msg', str(e))
            self.log_result("Add Task", False, error_message)
            print(f"❌ An error occurred while adding task: \n- {error_message}")

    def run_all_tasks(self):
        print("=== Running Task Page Tests ===")
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