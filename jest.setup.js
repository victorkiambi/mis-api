// Set environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ENCRYPTION_KEY = '2GulbbquYO699p/kbaWQTBH5fmSXK4iGfBOY9j3rTeM=';

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
}); 