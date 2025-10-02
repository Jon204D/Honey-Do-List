from honeyDoList import HoneyDoList
# Custom imports
from operations.webdriverCheck import get_available_driver

if __name__ == "__main__":
    bot = HoneyDoList()
    bot.run_initial_tests()
    bot.exit()