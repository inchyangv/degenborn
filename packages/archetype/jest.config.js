/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@degenborn/shared$": "<rootDir>/../shared/src/index.ts",
  },
};
