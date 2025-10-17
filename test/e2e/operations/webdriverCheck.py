from selenium.webdriver import Chrome
from selenium.webdriver import Edge
from selenium.webdriver import Firefox
from selenium.webdriver import Safari
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.safari.service import Service as SafariService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.safari.options import Options as SafariOptions
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from webdriver_manager.firefox import GeckoDriverManager
import os

def is_Env_Localhost():
    return os.getenv("BASE_URL").__contains__("localhost")

def webdriver_check_chrome():
    try:
        chrome_options = ChromeOptions()
        chrome_options.add_argument("--headless=new")  # Or "--headless"
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        service = ChromeService(ChromeDriverManager().install())

        if is_Env_Localhost():
            driver = Chrome(service=service)
        else:
            driver = Chrome(service=service, options=chrome_options)

        print("✅ Chrome WebDriver initialized successfully")
        driver.get("http://www.google.com")
        driver.quit()
        return True
    except Exception as e:
        print(f"❌ Chrome WebDriver check failed: {e}")
        return False

def webdriver_check_edge():
    try:
        edge_options = EdgeOptions()
        edge_options.add_argument("--headless=new")  # Or "--headless"
        edge_options.add_argument("--no-sandbox")
        edge_options.add_argument("--disable-dev-shm-usage")
        service = EdgeService(EdgeChromiumDriverManager().install())
        
        if is_Env_Localhost():
            driver = Edge(service=service)
        else:
            driver = Edge(service=service, options=edge_options)

        print("✅ Edge WebDriver initialized successfully")
        driver.get("http://www.google.com")
        driver.quit()
        return True
    except Exception as e:
        print(f"❌ Edge WebDriver check failed: {e}")
        return False

def webdriver_check_firefox():
    try:
        firefox_options = FirefoxOptions()
        firefox_options.add_argument("--headless")
        firefox_options.add_argument("--no-sandbox")
        firefox_options.add_argument("--disable-dev-shm-usage")
        service = FirefoxService(GeckoDriverManager().install())

        if is_Env_Localhost():
            driver = Firefox(service=service)
        else:
            driver = Firefox(service=service, options=firefox_options)

        print("✅ Firefox WebDriver initialized successfully")
        driver.get("http://www.google.com")
        driver.quit()
        return True
    except Exception as e:
        print(f"❌ Firefox WebDriver check failed: {e}")
        return False

def webdriver_check_safari():
    try:
        safari_options = SafariOptions()
        safari_options.add_argument("--headless=new")  # Note: Safari's headless support is limited
        safari_options.add_argument("--no-sandbox")
        safari_options.add_argument("--disable-dev-shm-usage")
        # REMOVE any "--user-data-dir" argument!
        # Safari requires manual setup - check if it's enabled
        service = SafariService()

        if is_Env_Localhost():
            driver = Safari(service=service)
        else:
            driver = Safari(service=service, options=safari_options)

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
        chrome_options = ChromeOptions()
        chrome_options.add_argument("--headless=new")  # Or "--headless"
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        service = ChromeService(ChromeDriverManager().install())

        if is_Env_Localhost():
            return Chrome(service=service)
        else:
            return Chrome(service=service, options=chrome_options)
    elif checks["edge"]:
        print("🚀 Using Edge WebDriver")
        edge_options = EdgeOptions()
        edge_options.add_argument("--headless=new")  # Or "--headless"
        edge_options.add_argument("--no-sandbox")
        edge_options.add_argument("--disable-dev-shm-usage")
        service = EdgeService(EdgeChromiumDriverManager().install())

        if is_Env_Localhost():
            return Edge(service=service)
        else:
            return Edge(service=service, options=edge_options)
    elif checks["firefox"]:
        print("🚀 Using Firefox WebDriver")
        firefox_options = FirefoxOptions()
        firefox_options.add_argument("--headless")
        firefox_options.add_argument("--no-sandbox")
        firefox_options.add_argument("--disable-dev-shm-usage")
        service = FirefoxService(GeckoDriverManager().install())
        
        if is_Env_Localhost():
            return Firefox(service=service)
        else:
            return Firefox(service=service, options=firefox_options)
    elif checks["safari"]:
        print("🚀 Using Safari WebDriver")
        safari_options = SafariOptions()
        safari_options.add_argument("--headless=new")  # Note: Safari's headless support is limited
        safari_options.add_argument("--no-sandbox")
        safari_options.add_argument("--disable-dev-shm-usage")
        service = SafariService()

        if is_Env_Localhost():
            return Safari(service=service)
        else:
            return Safari(service=service, options=safari_options)
    else:
        print("❌ No available WebDriver found!")
        print("💡 Try installing Chrome, Edge, or Firefox")
        print("💡 For Safari: Enable 'Allow remote automation' in Develop menu")
        raise Exception("No available WebDriver found.")