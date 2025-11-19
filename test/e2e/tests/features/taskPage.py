from dotenv import load_dotenv
from operations.constants import BASE_URL
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import time
from tests.prechecks.base_test_suite import BaseTestSuite
from tests.features.login import LoginTests

load_dotenv()


class TaskPageTests(BaseTestSuite):
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

    def _open_task_detail(self, task_name):
        """
        Click the task card by data-tour attribute or the title h3 to open the detail panel.
        Uses the structure shown in your screenshot (div[data-tour='task-card'] with <h3>title</h3>).
        """
        try:
            # prefer clicking the h3 inside the task card
            xpath_title = f"//div[@data-tour='task-card'][.//h3[contains(normalize-space(.), \"{task_name}\")]]//h3"
            try:
                el = self.wait.until(EC.element_to_be_clickable((By.XPATH, xpath_title)))
                el.click()
                return True
            except Exception:
                # fallback: click the card container itself
                card_xpath = f"//div[@data-tour='task-card'][.//h3[contains(normalize-space(.), \"{task_name}\")]]"
                try:
                    card = self.wait.until(EC.element_to_be_clickable((By.XPATH, card_xpath)))
                    card.click()
                    return True
                except Exception:
                    # last resort: any element with the text
                    try:
                        any_el = self.driver.find_element(By.XPATH, f"//h3[contains(normalize-space(.), \"{task_name}\")]")
                        any_el.click()
                        return True
                    except Exception:
                        return False
        except Exception as e:
            print(f"❌ _open_task_detail unexpected error: {e}")
            return False

    def add_task(self, task_name):
        # ... (unchanged) ...
        # keep your existing add_task implementation here unchanged
        pass

    def add_comment(self, task_name, comment_text):
        """Add a comment to a task and assert it appears in the comment list."""
        try:
            if not self._open_task_detail(task_name):
                self.log_result("Add Comment", False, f"Could not open task detail for '{task_name}'")
                return False

            # Use the input placeholder observed in the screenshot
            try:
                comment_input = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Add a comment...'], textarea[placeholder='Add a comment...']")))
            except Exception:
                try:
                    comment_input = self.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='comment'], textarea[placeholder*='comment']")
                except Exception as e:
                    png, html = self._screenshot_and_snippet("comment_input_missing")
                    self.log_result("Add Comment", False, f"Comment input not found (screenshot:{png})")
                    print("❌ Comment input not found:", e)
                    return False

            # fill and submit
            comment_input.clear()
            comment_input.send_keys(comment_text)
            # Find Add button within the comments area
            try:
                add_btn = self.driver.find_element(By.XPATH, "//button[normalize-space(text())='Add' or contains(., 'Add') and ancestor::div[contains(@class,'comments') or contains(., 'Comments')]]")
                add_btn.click()
            except Exception:
                # broad fallback: any button with 'Add' text
                try:
                    self.driver.find_element(By.XPATH, "//button[normalize-space(text())='Add']").click()
                except Exception:
                    try:
                        comment_input.send_keys("\n")
                    except Exception:
                        png, html = self._screenshot_and_snippet("comment_submit_failed")
                        self.log_result("Add Comment", False, f"Could not submit comment (screenshot:{png})")
                        print("❌ Could not submit comment")
                        return False

            # wait for the comment to show up - comments are <p> elements in TaskCard screenshot
            try:
                comment_xpath = f"//div[contains(@class,'task-card') or @data-tour='task-card'][.//h3[contains(normalize-space(.), \"{task_name}\")]]//p[contains(normalize-space(.), \"{comment_text[:20]}\")]"
                self.wait.until(EC.presence_of_element_located((By.XPATH, comment_xpath)))
                self.log_result("Add Comment", True, f"Comment added to task '{task_name}'")
                return True
            except Exception as e:
                png, html = self._screenshot_and_snippet("comment_not_found")
                self.log_result("Add Comment", False, f"Comment not visible after submit (screenshot:{png})")
                print("❌ Comment not visible after submit:", e)
                return False
        except Exception as e:
            png, html = self._screenshot_and_snippet("add_comment_error")
            self.log_result("Add Comment", False, f"Unexpected error while adding comment: {e} (screenshot:{png})")
            print(f"❌ Unexpected error while adding comment: {e}")
            return False

    def attempt_delete_comment_and_assert_nonremovable(self, task_name, comment_text):
        # keep your existing logic but search by the card's context
        try:
            if not self._open_task_detail(task_name):
                self.log_result("Delete Comment", False, f"Could not open task detail for '{task_name}'")
                return False

            try:
                delete_btn = self.driver.find_element(By.XPATH, f"//div[@data-tour='task-card'][.//h3[contains(normalize-space(.), \"{task_name}\")]]//p[contains(., \"{comment_text}\")]//following::button[contains(., 'Delete') or contains(@aria-label,'delete')][1]")
            except Exception:
                self.log_result("Delete Comment", True, "No delete control present for comment (expected non-removable behavior).")
                return True

            try:
                delete_btn.click()
                time.sleep(0.6)
            except Exception:
                pass

            remaining = self.driver.find_elements(By.XPATH, f"//div[@data-tour='task-card'][.//h3[contains(normalize-space(.), \"{task_name}\")]]//p[contains(., \"{comment_text}\")]")
            if len(remaining) > 0:
                self.log_result("Delete Comment", True, "Comment still present after delete attempt (non-removable).")
                return True
            else:
                self.log_result("Delete Comment", False, "Comment removed unexpectedly.")
                return False
        except Exception as e:
            png, html = self._screenshot_and_snippet("delete_comment_error")
            self.log_result("Delete Comment", False, f"Unexpected error while attempting to delete comment: {e} (screenshot:{png})")
            return False

    def _get_reaction_count(self, reaction_button_element):
        try:
            span = reaction_button_element.find_element(By.XPATH, ".//span")
            txt = span.text.strip()
            if not txt:
                return 0
            return int(txt)
        except Exception:
            # fallback: try extract digits from element text
            try:
                import re
                m = re.search(r"(\d+)", reaction_button_element.text)
                return int(m.group(1)) if m else 0
            except Exception:
                return None

    def add_reaction(self, task_name, reaction_text):
        try:
            if not self._open_task_detail(task_name):
                self.log_result("Add Reaction", False, f"Could not open task detail for '{task_name}'")
                return (None, None)

            # locate reaction button inside that card's reactions area
            try:
                reaction_btn = self.wait.until(EC.element_to_be_clickable((By.XPATH, f"//div[@data-tour='task-card'][.//h3[contains(normalize-space(.), \"{task_name}\")]]//button[contains(., '{reaction_text}') or @aria-label='{reaction_text}' or contains(@data-reaction,'{reaction_text}')]")))
            except Exception:
                try:
                    reaction_btn = self.driver.find_element(By.XPATH, f"//button[contains(., '{reaction_text}')]")
                except Exception as e:
                    png, html = self._screenshot_and_snippet("reaction_not_found")
                    self.log_result("Add Reaction", False, f"Reaction control not found (screenshot:{png})")
                    print("❌ Reaction control not found:", e)
                    return (None, None)

            before = self._get_reaction_count(reaction_btn)
            reaction_btn.click()
            time.sleep(0.4)
            after_btn = self.driver.find_element(By.XPATH, f"//div[@data-tour='task-card'][.//h3[contains(normalize-space(.), \"{task_name}\")]]//button[contains(., '{reaction_text}') or @aria-label='{reaction_text}' or contains(@data-reaction,'{reaction_text}')]")
            after = self._get_reaction_count(after_btn)
            self.log_result("Add Reaction", True, f"Reaction '{reaction_text}' added to task '{task_name}': {before} -> {after}")
            return (before, after)
        except Exception as e:
            png, html = self._screenshot_and_snippet("add_reaction_error")
            self.log_result("Add Reaction", False, f"Unexpected error while adding reaction: {e} (screenshot:{png})")
            print(f"❌ Unexpected error while adding reaction: {e}")
            return (None, None)

    def attempt_toggle_reaction_and_assert_nonremovable(self, task_name, reaction_text):
        # unchanged logic, uses add_reaction above
        try:
            before, after = self.add_reaction(task_name, reaction_text)
            if before is None:
                return False
            try:
                btn = self.driver.find_element(By.XPATH, f"//div[@data-tour='task-card'][.//h3[contains(normalize-space(.), \"{task_name}\")]]//button[contains(., '{reaction_text}') or @aria-label='{reaction_text}']")
                btn.click()
            except Exception:
                pass
            time.sleep(0.4)
            try:
                btn_after = self.driver.find_element(By.XPATH, f"//div[@data-tour='task-card'][.//h3[contains(normalize-space(.), \"{task_name}\")]]//button[contains(., '{reaction_text}') or @aria-label='{reaction_text}']")
                final = self._get_reaction_count(btn_after)
            except Exception:
                final = None
            if final is None:
                self.log_result("Toggle Reaction", False, "Could not read final reaction count")
                return False
            if final >= after:
                self.log_result("Toggle Reaction", True, f"Reaction non-removable behavior observed: {before} -> {after} -> {final}")
                return True
            else:
                self.log_result("Toggle Reaction", False, f"Reaction count decreased unexpectedly: {before} -> {after} -> {final}")
                return False
        except Exception as e:
            png, html = self._screenshot_and_snippet("toggle_reaction_error")
            self.log_result("Toggle Reaction", False, f"Unexpected error while toggling reaction: {e} (screenshot:{png})")
            return False

    def run_all_tasks(self):
        print("\n📋 Running Task Page Tests...")
        try:
            LoginTests(self.driver, self.wait).login_valid()

            self.land_task_page()
            self.add_task("Test Task 1")
            self.add_task("Test Task 2")

            comment_ok = self.add_comment("Test Task 1", "Automated test comment - do not remove")
            if comment_ok:
                self.attempt_delete_comment_and_assert_nonremovable("Test Task 1", "Automated test comment - do not remove")

            reaction_label = '👍'  # adjust to match app's reaction label if different
            self.attempt_toggle_reaction_and_assert_nonremovable("Test Task 2", reaction_label)

        except Exception as e:
            self.log_result("Run All Tasks", False, str(e))
            print(f"❌ An error occurred during task tests: {e}")
        finally:
            return self.test_results