module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.js", "**/*.test.js"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "services/**/*.js",
    "middleware/**/*.js",
    "routes/**/*.js",
    "!**/__tests__/**",
    "!**/node_modules/**",
  ],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 30000,
  verbose: true,
};
