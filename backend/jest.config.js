module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  testTimeout: 30000,
  moduleFileExtensions: ['js', 'json'],
  transform: {}
};