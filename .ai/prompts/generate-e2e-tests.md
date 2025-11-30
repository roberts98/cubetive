Initialize e2e tests using following guidelines:

- Initialize configuration only with Chromium/Desktop Chrome browser
- Use browser contexts for isolating test environments
- Implement the Page Object Model for maintainable tests in ./e2e/page-objects
- Use `data-testid` attributes when introducing resilient test-oriented selectors
- When following `data-testid` convention, locate elements by `await page.getByTestId('selectorName')`
- Leverage API testing for backend validation
- Implement visual comparison with expect(page).toHaveScreenshot()
- Use the codegen tool for test recording
- Leverage trace viewer for debugging test failures
- Implement test hooks for setup and teardown
- Use expect assertions with specific matchers
- Leverage parallel execution for faster test runs
- Follow 'Arrange', 'Act', 'Assert' approach to test structure for simplicity and readability.

Also keep in mind:
Our strategy for E2E authentication optimization is to move away from executing the full UI login in every test.
Instead, we must implement a feature to generate an authenticated session once and then save and reuse that session
across multiple E2E test runs. This will significantly boost test suite performance and scalability.
