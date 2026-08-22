const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "\\.(png|jpg|jpeg|gif|webp|svg|ico)$": "<rootDir>/__mocks__/fileMock.js",
  },
};

module.exports = createJestConfig(customJestConfig);