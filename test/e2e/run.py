import sys
from honeyDoList import HoneyDoList

if __name__ == "__main__":
    bot = HoneyDoList()
    bot.run_regression_test()
    
    # Count failed tests
    failed_tests = sum(1 for result in bot.test_results if not result["passed"])
    bot.exit()

    # Exit code: 1 if any failed, 0 if all passed
    sys.exit(1 if failed_tests > 0 else 0)