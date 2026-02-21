# Testing & Code Standards Guide

## 🧪 Testing Strategy

### Test Types

1.  **Unit Tests** - Test individual functions/methods
2.  **Integration Tests** - Test API endpoints with database
3.  **E2E Tests** - Test complete user workflows (future)

### Test Structure

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   describe('Feature Name', () => {    // Setup    beforeAll(() => { /* Run once before all tests */ });    beforeEach(() => { /* Run before each test */ });    describe('Specific Function', () => {      it('should do something specific', () => {        // Arrange - Setup test data        // Act - Execute the code        // Assert - Check results      });    });    // Cleanup    afterEach(() => { /* Run after each test */ });    afterAll(() => { /* Run once after all tests */ });  });   `

### Writing Good Tests

✅ **DO:**

- Write descriptive test names
- Test one thing per test
- Use AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Clean up after tests

❌ **DON'T:**

- Test implementation details
- Write flaky tests
- Skip edge cases
- Leave commented-out code

## 📏 Code Quality Standards

### ESLint Rules

Our configuration enforces:

- No any types (warns)
- No unused variables
- Consistent imports
- Proper error handling
- Type safety

### Prettier Formatting

- Single quotes for strings
- Semicolons required
- 2 spaces indentation
- 100 character line width
- Trailing commas in ES5

## 🎯 Available Commands

### Testing

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   yarn test                # Run all tests with coverage  yarn test:watch          # Watch mode for development  yarn test:unit           # Run only unit tests  yarn test:integration    # Run only integration tests   `

### Linting & Formatting

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   yarn lint                # Check for lint errors  yarn lint:fix            # Fix lint errors automatically  yarn format              # Format all files  yarn format:check        # Check if files are formatted   `

### Development Workflow

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   # 1. Make changes to code  # 2. Format your code  yarn format  # 3. Check for lint errors  yarn lint  # 4. Run tests  yarn test  # 5. Commit (pre-commit hooks run automatically)  git add .  git commit -m "Your message"   `

## 🔒 Pre-commit Hooks

**What happens when you commit:**

1.  **lint-staged** runs on changed files
2.  **ESLint** fixes issues automatically
3.  **Prettier** formats code
4.  **Jest** runs related tests
5.  If all pass → commit succeeds ✅
6.  If any fail → commit blocked ❌

## 📊 Test Coverage Goals

We aim for:

- **70%** branch coverage
- **70%** function coverage
- **70%** line coverage
- **70%** statement coverage

View coverage report:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   yarn test  # Then open: coverage/lcov-report/index.html   `

## 🎨 Code Style Examples

### Good TypeScript

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   // ✅ Good - Explicit types  interface User {    id: number;    name: string;    email: string;  }  const createUser = (data: User): Promise => {    return userService.create(data);  };  // ❌ Bad - Implicit any  const createUser = (data) => {    return userService.create(data);  };   `

### Good Testing

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   // ✅ Good - Descriptive and focused  describe('UserService', () => {    describe('createUser', () => {      it('should create user with valid data', async () => {        const userData = { name: 'John', email: 'john@example.com' };        const result = await userService.createUser(userData);        expect(result).toHaveProperty('id');      });      it('should throw error with invalid email', async () => {        const userData = { name: 'John', email: 'invalid' };        await expect(userService.createUser(userData))          .rejects.toThrow('Invalid email');      });    });  });  // ❌ Bad - Vague and testing multiple things  it('should work', async () => {    const result = await userService.createUser(data);    expect(result).toBeTruthy();    expect(result.name).toBe('John');    expect(result.email).toBe('john@example.com');    // Too many assertions  });   `

## 🚀 Best Practices

### 1\. Write Tests First (TDD)

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   # Red → Green → Refactor  1. Write failing test  2. Write minimal code to pass  3. Refactor and improve   `

### 2\. Keep Tests Independent

Each test should run in isolation

### 3\. Use Descriptive Names

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   // ✅ Good  it('should return 404 when employee not found')  // ❌ Bad    it('test employee')   `

### 4\. Mock External Dependencies

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   jest.mock('../services/emailService');   `

### 5\. Test Edge Cases

- Empty inputs
- Null/undefined
- Very large numbers
- Invalid data types

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [TypeScript Guidelines](https://www.typescriptlang.org/docs/)
