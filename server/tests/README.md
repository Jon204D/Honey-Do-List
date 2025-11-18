# Server Tests

This directory contains comprehensive unit and integration tests for the Honey-Do-List server application.

## Test Structure

```
tests/
├── setup.test.js           # Test configuration and setup
├── seedUsers.test.js       # User seeding functionality tests
├── task.test.js            # Task model and query tests
├── userController.test.js  # User controller unit tests
├── taskController.test.js  # Task controller unit tests
├── models.test.js          # Mongoose model tests
├── emailTemplate.test.js   # Email functionality tests
├── testUtils.js           # Utility functions for testing
└── README.md              # This file
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
- **Test Utilities** (`testUtils.js`): Helper functions for creating test data and mocking
- **Setup** (`setup.test.js`): Global test configuration and environment setup

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
- **SendGrid Email API**: Prevents actual emails from being sent during testing
- **Database Operations**: Some tests mock database errors to test error handling
- **Express Request/Response**: Mock objects for controller testing

## Database Considerations

- Tests use a separate test database to avoid conflicts
- Each test suite cleans up data before and after tests
- Database connections are properly opened and closed
- Tests are isolated and can run in parallel

## Writing New Tests

When adding new tests:

1. **Follow the naming convention**: `feature.test.js`
2. **Use the test utilities**: Import from `testUtils.js` for common operations
3. **Clean up after tests**: Use `beforeEach`/`afterEach` to clean test data
4. **Mock external services**: Don't make real API calls in tests
5. **Test both success and error cases**: Include edge cases and error conditions

### Example Test Structure

```javascript
describe('Feature Tests', () => {
  beforeEach(async () => {
    await cleanupTestData();
    // Setup test data
  });

  describe('Success Cases', () => {
    it('should perform expected action', async () => {
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
3. **Mock issues**: Clear mocks between tests using `jest.clearAllMocks()`
4. **Memory leaks**: Ensure database connections are properly closed

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
- No external dependencies (mocked)
- Configurable database connection
- Proper cleanup and isolation
- Detailed error reporting

For GitHub Actions or similar, ensure:
1. MongoDB service is available
2. Environment variables are set
3. Test database is separate from production