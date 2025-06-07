# Backend Test Suite

This directory contains comprehensive unit and integration tests for the Twinbo backend API.

## 🧪 Test Overview

### Test Categories

1. **Unit Tests** - Test individual components in isolation

   - Controllers (auth, chat, home)
   - Models (User, Message, Conversation)
   - Middleware (authentication, error handling)
   - Services (LLM service)

2. **Integration Tests** - Test complete API workflows
   - Full authentication flow
   - Chat functionality end-to-end
   - API security and error handling

### Test Files

```
tests/
├── setup.js                 # Test configuration and database setup
├── auth.test.js             # Authentication controller tests
├── chat.test.js             # Chat controller tests
├── home.test.js             # Home route tests
├── middleware.test.js       # Authentication middleware tests
├── error-handler.test.js    # Error handling middleware tests
├── user-model.test.js       # User model tests
├── message-model.test.js    # Message model tests
├── conversation-model.test.js # Conversation model tests
├── llm-service.test.js      # LLM service tests
└── integration.test.js      # Full API integration tests
```

## 🚀 Running Tests

### Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Specific Test Types

```bash
# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run complete test suite with detailed reporting
npm run test:all
```

### Advanced Test Running

```bash
# Run a specific test file
npx jest tests/auth.test.js

# Run tests matching a pattern
npx jest --testNamePattern="login"

# Run tests with verbose output
npx jest --verbose

# Run tests and update snapshots
npx jest --updateSnapshot
```

## 📊 Coverage Reports

After running tests with coverage, you can view detailed reports:

```bash
# Generate and view coverage report
npm run test:coverage

# Open coverage report in browser (macOS)
open coverage/lcov-report/index.html
```

### Coverage Targets

- **Functions**: > 90%
- **Lines**: > 85%
- **Branches**: > 80%
- **Statements**: > 85%

## 🗄️ Test Database

Tests use MongoDB Memory Server for isolated testing:

- Each test file gets a fresh database instance
- Data is automatically cleaned between tests
- No interference with development/production databases

## 🔧 Test Configuration

### Environment Variables

Tests automatically set these environment variables:

```env
NODE_ENV=test
JWT_SECRET=test-secret-key
JWT_EXPIRE=1h
OPENROUTER_API_KEY=test-api-key (for LLM service tests)
```

### Jest Configuration

Key Jest settings in `jest.config.js`:

- **Test Environment**: Node.js
- **Setup**: `tests/setup.js` for database configuration
- **Timeout**: 30 seconds for integration tests
- **Coverage**: Includes controllers, services, middleware, routes

## 📝 Writing New Tests

### Test Structure

```javascript
describe("Feature or Component", () => {
  // Setup before each test
  beforeEach(async () => {
    // Create test data
  });

  describe("Specific Functionality", () => {
    it("should do something specific", async () => {
      // Arrange
      const testData = {
        /* ... */
      };

      // Act
      const result = await someFunction(testData);

      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Testing Guidelines

1. **Use descriptive test names** that explain what is being tested
2. **Follow the AAA pattern**: Arrange, Act, Assert
3. **Test both happy paths and error cases**
4. **Mock external dependencies** (like API calls)
5. **Keep tests independent** - each test should be able to run in isolation
6. **Clean up after tests** - the setup file handles database cleanup

### Common Test Patterns

#### Testing API Endpoints

```javascript
const response = await request(app)
  .post("/api/auth/login")
  .send({ email: "test@example.com", password: "password123" })
  .expect(200);

expect(response.body.status).toBe("success");
```

#### Testing Models

```javascript
const user = await User.create({
  username: "testuser",
  email: "test@example.com",
  password: "password123",
});

expect(user._id).toBeDefined();
expect(user.password).not.toBe("password123"); // Should be hashed
```

#### Testing Middleware

```javascript
const req = { header: jest.fn().mockReturnValue("Bearer valid-token") };
const res = mockResponse();
const next = jest.fn();

await authenticate(req, res, next);

expect(req.user).toBeDefined();
expect(next).toHaveBeenCalled();
```

## 🐛 Debugging Tests

### Common Issues

1. **Database Connection Errors**

   - Ensure MongoDB Memory Server is properly set up
   - Check that tests clean up after themselves

2. **Timeout Errors**

   - Increase timeout in Jest config if needed
   - Check for hanging promises or connections

3. **Mock Issues**
   - Clear mocks between tests with `jest.clearAllMocks()`
   - Ensure mocks are properly restored

### Debug Commands

```bash
# Run tests with debug output
DEBUG=* npm test

# Run a single test file for focused debugging
npx jest tests/auth.test.js --verbose

# Run tests with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📈 Performance Testing

For performance testing of specific endpoints:

```javascript
it("should handle multiple concurrent requests", async () => {
  const promises = Array(10)
    .fill()
    .map(() =>
      request(app)
        .get("/api/chat/users")
        .set("Authorization", `Bearer ${validToken}`)
    );

  const responses = await Promise.all(promises);
  responses.forEach((response) => {
    expect(response.status).toBe(200);
  });
});
```

## 🔒 Security Testing

Tests include security checks for:

- JWT token validation
- Password hashing
- SQL injection prevention
- XSS protection
- Authentication bypass attempts

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🤝 Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all existing tests pass
3. Maintain or improve code coverage
4. Add integration tests for new API endpoints
5. Update this README if adding new test patterns
