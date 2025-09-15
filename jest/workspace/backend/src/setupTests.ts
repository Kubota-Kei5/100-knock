// Global test setup for backend tests
// This file is executed before each test file

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Global test timeout
jest.setTimeout(10000);