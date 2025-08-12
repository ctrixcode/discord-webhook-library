/** @type {import('ts-jest').JestConfigWithTsJest} */
const moduleNameMapper = {
  '^../src$': '<rootDir>/src/index.ts',
  '^../dist/discord-webhook-library.es$': '<rootDir>/dist/index.d.ts',
};

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper,
};
