from honeyDoList import HoneyDoList
# Custom imports
from checks.webdriverCheck import get_available_driver

if __name__ == "__main__":
    driver = get_available_driver()
    honey_do_list = HoneyDoList(driver)
    honey_do_list.run_tests()
    driver.quit()