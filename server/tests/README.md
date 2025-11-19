# Server Tests

This directory contains comprehensive unit and integration tests for the Honey-Do-List server application.

## Test Structure

```
tests/
├── globalSetup.js          # RUNS FIRST: Drops DB before any imports
├── setup.test.js           # Test configuration and setup
├── setupMocks.js           # Early mocks (runs before module imports)
├── testSetup.js            # Global DB setup and teardown
├── seedUsers.test.js       # User seeding functionality tests
├── task.test.js            # Task model and query tests
├── userController.test.js  # User controller unit tests
├── taskController.test.js  # Task controller unit tests
├── models.test.js          # Mongoose model tests
├── emailTemplate.test.js   # Email functionality tests
├── testUtils.js            # Utility functions for testing
├── testHelpers.js          # Chainable mock helpers
└── README.md               # This file
```

## Test Categories

### Unit Tests
- **User Controller Tests** (`userController.test.js`): Tests all user-related endpoints and business logic
- **Task Controller Tests** (`taskController.test.js`): Tests all task-related endpoints and business logic
- **Model Tests** (`models.test.js`): Tests Mongoose models, validation, and relationships
- **Email Template Tests** (`emailTemplate.test.js`): Tests email sending functionality with mocked SendGrid

### Integration Tests
- **Seeding Tests** (`seedUsers.test.js`): Tests user seeding and database operations
- **Task Query Tests** (`task.test.js`): Tests complex task queries and database interactions

### Utility Files
- **Global Setup** (`globalSetup.js`): **RUNS FIRST** - Drops test database before any model imports to prevent race conditions
- **Test Utilities** (`testUtils.js`): Helper functions for creating test data, mocking, and generating unique test emails
- **Test Helpers** (`testHelpers.js`): Chainable mock utilities for Mongoose queries (mockFindPopulate, etc.)
- **Setup** (`setup.test.js`): Global test configuration and environment setup
- **Setup Mocks** (`setupMocks.js`): Early mocks that run before module imports (prevents network calls)
- **Test Setup** (`testSetup.js`): Global database setup, cleanup, and index creation

## Running Tests

### Prerequisites
1. Ensure MongoDB is running on your local machine or update `MONGO_URI` in your `.env` file
2. Install dependencies: `npm install`

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test userController.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="login"
```

## Environment Setup

The tests require the following environment variables:

```env
MONGO_URI=mongodb://localhost:27017/honey-do-list-test
NODE_ENV=test
SendGridApiKey=your-sendgrid-api-key
FRONTEND_BASE_URL=http://localhost:3000
```

**Note**: The tests will use default values if these are not set, but it's recommended to use a separate test database.

## Test Coverage

The test suite covers:

- ✅ User registration, login, and authentication
- ✅ Password hashing and validation
- ✅ Task creation, updates, and deletion
- ✅ Task assignments and ownership
- ✅ Email verification and recovery
- ✅ Database validation and constraints
- ✅ Error handling and edge cases
- ✅ API endpoint responses and status codes

## Mocking

The tests use Jest mocking for:
- **SendGrid Email API**: Automatically mocked via `setupMocks.js` (runs before all imports) and manual mock in `__mocks__/@sendgrid/mail.js`. Prevents actual emails from being sent during testing.
- **Database Operations**: Some tests mock database errors to test error handling
- **Express Request/Response**: Mock objects for controller testing using `createMockReqRes()` from testUtils

## Database Considerations

### Test Execution Order (Important!)

Jest runs test setup in this specific order:

1. **globalSetup.js** (via globalSetup config) - **RUNS FIRST BEFORE EVERYTHING**
   - Drops the test database completely
   - Runs BEFORE any model imports
   - Prevents race conditions with index creation
   - Critical for preventing E11000 errors

2. **setupMocks.js** (via setupFiles config)
   - Mocks external services like SendGrid
   - Runs before any module imports

3. **testSetup.js** (via setupFilesAfterEnv config)
   - Connects to MongoDB
   - Recreates indexes after globalSetup drop
   - Clears all collections after each test
   - Disconnects after all tests

4. **Individual test files** - Execute in sequence (--runInBand)

### Best Practices
- Tests use a separate test database to avoid conflicts
- Individual test files no longer need their own connection/disconnection code
- **Tests run in-band** (`--runInBand` flag): Prevents race conditions with shared test database
- **Unique emails**: Use `generateUniqueEmail()` from testUtils to avoid duplicate key errors

## Writing New Tests

When adding new tests:

1. **Follow the naming convention**: `feature.test.js`
2. **Use the test utilities**: Import from `testUtils.js` for common operations
3. **Use unique emails**: Always use `generateUniqueEmail()` or `createTestUser()` to avoid duplicate key errors
4. **Don't create DB connections**: `testSetup.js` handles global DB connection/disconnection
5. **Clean up in beforeEach**: Clear test data in `beforeEach` (global `afterEach` also cleans up)
6. **Mock external services**: Don't make real API calls in tests (SendGrid is auto-mocked)
7. **Test both success and error cases**: Include edge cases and error conditions

### Example Test Structure

```javascript
const { generateUniqueEmail, createTestUser } = require('./testUtils');

describe('Feature Tests', () => {
  // No need for beforeAll/afterAll - testSetup.js handles DB connection
  
  beforeEach(async () => {
    // Clean up test data (optional - global afterEach also does this)
    await cleanupTestData();
    // Setup test data with unique emails
  });

  describe('Success Cases', () => {
    it('should perform expected action', async () => {
      // Use generateUniqueEmail or createTestUser for unique test data
      const user = await createTestUser();
      // Test implementation
    });
  });

  describe('Error Cases', () => {
    it('should handle error gracefully', async () => {
      // Error test implementation
    });
  });
});
```

## Troubleshooting

### Common Issues

1. **Tests timeout**: Increase timeout in Jest config or individual tests
2. **Database connection errors**: Ensure MongoDB is running and accessible
3. **Duplicate key errors (E11000)**: Use `generateUniqueEmail()` or `createTestUser()` instead of fixed emails
4. **"Conflicted registering namespace"**: This is fixed by globalSetup.js dropping DB early
5. **Mock issues**: Clear mocks between tests using `jest.clearAllMocks()`
6. **"populate is not a function" or "exec is not a function"**: Use `mockFindPopulate()` from testUtils or testHelpers for chainable mocks
7. **Race conditions**: Tests run in-band by default to prevent concurrent DB access

### Debug Mode

Run tests with debug output:
```bash
DEBUG=* npm test
```

Or run with Node.js debugging:
```bash
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

## CI/CD Integration

These tests are designed to run in CI/CD environments:
- **No external dependencies**: All external services (SendGrid) are mocked via `setupMocks.js`
- **Configurable database connection**: Uses `MONGO_URI` environment variable
- **Proper cleanup and isolation**: Global setup/teardown in `testSetup.js`
- **Deterministic execution**: Tests run in-band (`--runInBand`) to prevent race conditions
- **Unique test data**: Uses timestamp and random strings to avoid duplicate key errors
- **Early mocking**: `setupMocks.js` in setupFiles ensures mocks are active before any imports

For GitHub Actions or similar, ensure:
1. MongoDB service is available (e.g., `services: mongodb: image: mongo:7.0`)
2. Environment variables are set (`MONGO_URI`, `NODE_ENV=test`, etc.)
3. Test database is separate from production
4. Tests run with `--runInBand` flag (already configured in package.json)