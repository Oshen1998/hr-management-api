# Testing & Code Standards Guide

## 🧪 Testing Strategy

### Test Types

- **Unit Tests:** Test individual functions/methods in isolation.
- **Integration Tests:** Test API endpoints and their interaction with the database.
- **E2E Tests:** Test complete user workflows (planned for future).

### Test Structure

```typescript
describe('Feature Name', () => {
  // Setup
  beforeAll(() => {
    /* Run once before all tests */
  });
  beforeEach(() => {
    /* Run before each test */
  });

  describe('Specific Function', () => {
    it('should do something specific', () => {
      // Arrange - Setup test data
      // Act - Execute the code
      // Assert - Check results
    });
  });

  // Cleanup
  afterEach(() => {
    /* Run after each test */
  });
  afterAll(() => {
    /* Run once after all tests */
  });
});
```

### Writing Good Tests

| ✅ DO                                      | ❌ DON'T                    |
| ------------------------------------------ | --------------------------- |
| Write descriptive test names               | Test implementation details |
| Test one thing per test                    | Write "flaky" tests         |
| Use **AAA pattern** (Arrange, Act, Assert) | Skip edge cases             |
| Mock external dependencies                 | Leave commented-out code    |
| Clean up after tests                       |                             |

---

## 📏 Code Quality Standards

### ESLint Rules

Our configuration enforces:

- **No `any` types:** Warnings for using explicit `any`.
- **No unused variables:** Blocks variables that aren't utilized.
- **Consistent imports:** Keeps the import structure clean.
- **Proper error handling:** Ensures try/catch or async safety.
- **Type safety:** Strict adherence to TypeScript definitions.

### Prettier Formatting

- **Strings:** Single quotes (`'`)
- **Semicolons:** Required
- **Indentation:** 2 spaces
- **Line Width:** 100 characters
- **Trailing Commas:** Required in ES5

---

## 🎯 Available Commands

### Testing

| Command                 | Description                        |
| ----------------------- | ---------------------------------- |
| `yarn test`             | Run all tests with coverage report |
| `yarn test:watch`       | Watch mode for active development  |
| `yarn test:unit`        | Run only unit tests                |
| `yarn test:integration` | Run only integration tests         |

### Linting & Formatting

| Command             | Description                            |
| ------------------- | -------------------------------------- |
| `yarn lint`         | Check for lint errors                  |
| `yarn lint:fix`     | Fix lint errors automatically          |
| `yarn format`       | Format all files with Prettier         |
| `yarn format:check` | Check if files are correctly formatted |

---

## 🛠 Development Workflow

1. **Make changes** to the code.
2. **Format** your code: `yarn format`
3. **Lint** for errors: `yarn lint`
4. **Run tests**: `yarn test`
5. **Commit**: (pre-commit hooks run automatically)

```bash
git add .
git commit -m "Your descriptive message"

```

---

## 🔒 Pre-commit Hooks

Using **Husky** and **lint-staged**, the following happens automatically when you commit:

1. `lint-staged` identifies changed files.
2. **ESLint** fixes issues automatically.
3. **Prettier** formats the code.
4. **Jest** runs related tests.

> **Result:** If all pass → commit succeeds ✅ | If any fail → commit blocked ❌

---

## 📊 Test Coverage Goals

We aim for a minimum of **70%** across all metrics:

- **Branches / Functions / Lines / Statements**

**To view the report:**

1. Run `yarn test`.
2. Open `coverage/lcov-report/index.html` in your browser.

---

## 🎨 Code Style Examples

### Good TypeScript

```typescript
// ✅ Good - Explicit types
interface User {
  id: number;
  name: string;
  email: string;
}

const createUser = (data: User): Promise<User> => {
  return userService.create(data);
};

// ❌ Bad - Implicit any
const createUser = (data) => {
  return userService.create(data);
};
```

### Good Testing

```typescript
// ✅ Good - Descriptive and focused
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = { name: 'John', email: 'john@example.com' };
      const result = await userService.createUser(userData);
      expect(result).toHaveProperty('id');
    });

    it('should throw error with invalid email', async () => {
      const userData = { name: 'John', email: 'invalid' };
      await expect(userService.createUser(userData)).rejects.toThrow('Invalid email');
    });
  });
});
```

---

## 🚀 Best Practices

1. **Write Tests First (TDD):** Follow the **Red → Green → Refactor** cycle.
2. **Keep Tests Independent:** Each test must run in isolation without relying on others.
3. **Use Descriptive Names:** `it('should return 404 when employee not found')` is better than `it('test employee')`.
4. **Mock External Dependencies:** Use `jest.mock()` for services like email or third-party APIs.
5. **Test Edge Cases:** Always check for empty inputs, `null`, `undefined`, or invalid data types.

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [ESLint Rules Reference](https://eslint.org/docs/rules/)
- [TypeScript Guidelines](https://www.typescriptlang.org/docs/)

---
