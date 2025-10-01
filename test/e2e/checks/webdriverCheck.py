from selenium.webdriver import Chrome
from selenium.webdriver import Edge
from selenium.webdriver import Firefox
from selenium.webdriver import Safari
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.safari.service import Service as SafariService

def webdriver_check_chrome():
    try:
        service = ChromeService(executable_path="chromedriver")
        driver = Chrome(service=service)
        driver.get("http://www.google.com")
        driver.quit()
        return True
    except Exception as e:
        print(f"WebDriver check failed: {e}")
        return False
    
def webdriver_check_edge():
    try:
        service = EdgeService(executable_path="msedgedriver")
        driver = Edge(service=service)
        driver.get("http://www.google.com")
        driver.quit()
        return True
    except Exception as e:
        print(f"WebDriver check failed: {e}")
        return False
    
def webdriver_check_firefox():
    try:
        service = FirefoxService(executable_path="geckodriver")
        driver = Firefox(service=service)
        driver.get("http://www.google.com")
        driver.quit()
        return True
    except Exception as e:
        print(f"WebDriver check failed: {e}")
        return False
    
def webdriver_check_safari():
    try:
        service = SafariService()
        driver = Safari(service=service)
        driver.get("http://www.google.com")
        driver.quit()
        return True
    except Exception as e:
        print(f"WebDriver check failed: {e}")
        return False
    
def webdriver_check_all():
    results = {
        "chrome": webdriver_check_chrome(),
        "edge": webdriver_check_edge(),
        "firefox": webdriver_check_firefox(),
        "safari": webdriver_check_safari()
    }
    return results

def get_available_driver():
    checks = webdriver_check_all()
    if checks["chrome"]:
        service = ChromeService(executable_path="chromedriver")
        return Chrome(service=service)
    elif checks["edge"]:
        service = EdgeService(executable_path="msedgedriver")
        return Edge(service=service)
    elif checks["firefox"]:
        service = FirefoxService(executable_path="geckodriver")
        return Firefox(service=service)
    elif checks["safari"]:
        service = SafariService()
        return Safari(service=service)
    else:
        raise Exception("No available WebDriver found.")