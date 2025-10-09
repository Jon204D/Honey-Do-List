from selenium.webdriver import Chrome
from selenium.webdriver import Edge
from selenium.webdriver import Firefox
from selenium.webdriver import Safari
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.safari.service import Service as SafariService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from webdriver_manager.firefox import GeckoDriverManager

def webdriver_check_chrome():
    try:
        service = ChromeService(ChromeDriverManager().install())
        driver = Chrome(service=service)
        print("✅ Chrome WebDriver initialized successfully")
        driver.get("http://www.google.com")
        driver.quit()
        return True
    except Exception as e:
        print(f"❌ Chrome WebDriver check failed: {e}")
        return False
    
def webdriver_check_edge():
    try:
        service = EdgeService(EdgeChromiumDriverManager().install())
        driver = Edge(service=service)
        print("✅ Edge WebDriver initialized successfully")
        driver.get("http://www.google.com")
        driver.quit()
        return True
    except Exception as e:
        print(f"❌ Edge WebDriver check failed: {e}")
        return False
    
def webdriver_check_firefox():
    try:
        service = FirefoxService(GeckoDriverManager().install())
        driver = Firefox(service=service)
        print("✅ Firefox WebDriver initialized successfully")
        driver.get("http://www.google.com")
        driver.quit()
        return True
    except Exception as e:
        print(f"❌ Firefox WebDriver check failed: {e}")
        return False
    
def webdriver_check_safari():
    try:
        # Safari requires manual setup - check if it's enabled
        service = SafariService()
        driver = Safari(service=service)
        print("✅ Safari WebDriver initialized successfully")
        driver.get("http://www.google.com")
        driver.quit()
        return True
    except Exception as e:
        print(f"❌ Safari WebDriver check failed: {e}")
        print("💡 Enable 'Allow remote automation' in Safari > Develop menu")
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
    print("🔍 Checking available WebDrivers...")
    checks = webdriver_check_all()
    
    if checks["chrome"]:
        print("🚀 Using Chrome WebDriver")
        service = ChromeService(ChromeDriverManager().install())
        return Chrome(service=service)
    elif checks["edge"]:
        print("🚀 Using Edge WebDriver")
        service = EdgeService(EdgeChromiumDriverManager().install())
        return Edge(service=service)
    elif checks["firefox"]:
        print("🚀 Using Firefox WebDriver")
        service = FirefoxService(GeckoDriverManager().install())
        return Firefox(service=service)
    elif checks["safari"]:
        print("🚀 Using Safari WebDriver")
        service = SafariService()
        return Safari(service=service)
    else:
        print("❌ No available WebDriver found!")
        print("💡 Try installing Chrome, Edge, or Firefox")
        print("💡 For Safari: Enable 'Allow remote automation' in Develop menu")
        raise Exception("No available WebDriver found.")