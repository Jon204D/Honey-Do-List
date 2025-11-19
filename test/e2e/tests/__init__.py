"""
Honey-Do-List E2E Test Suite

This package contains end-to-end tests for the Honey-Do-List application.
Tests are organized by functionality using professional patterns.

Test Structure:
- prechecks/: Environment validation tests
- features/: Feature-specific functionality tests
- unit/: Unit tests (future)

Usage:
    from tests.prechecks.test_initial_checks import InitialChecks
    precheck_test = InitialChecks(driver, wait)
    results = precheck_test.run_all()
"""

__version__ = "1.0.0"
__author__ = "Jon204D"