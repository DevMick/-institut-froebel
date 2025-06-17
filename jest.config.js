/**
 * Jest Configuration - Rotary Club Mobile
 * Configuration Jest avec setup React Native, mocks et coverage
 */

module.exports = {
  preset: 'react-native',

  // Setup files
  setupFiles: [
    '<rootDir>/jest/setup.js',
  ],

  setupFilesAfterEnv: [
    '<rootDir>/jest/setupAfterEnv.js',
    '@testing-library/jest-native/extend-expect',
  ],

  // Test environment
  testEnvironment: 'node',

  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>/src'],

  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',

    // Mock static assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/jest/mocks/fileMock.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-vector-icons|react-native-sqlite-storage|@react-native-community|react-native-qrcode-svg|react-native-share|react-native-permissions)/)',
  ],

  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],

  // Files to ignore
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
  ],

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/App.tsx',
    '!src/**/__tests__/**',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/assets/**',
    '!src/config/constants.ts',
  ],

  coverageDirectory: '<rootDir>/coverage',

  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
  ],

  // Coverage thresholds (minimum 80%)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Specific thresholds for critical files
    './src/services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/store/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Error handling
  errorOnDeprecated: true,

  // Watch plugins (commented out for CI/CD compatibility)
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname',
  // ],

  // Globals
  globals: {
    __DEV__: true,
  },

  // Module file extensions
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
  ],

  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/test-results',
        outputName: 'junit.xml',
        suiteName: 'Rotary Club Mobile Tests',
      },
    ],
  ],

  // Cache
  cacheDirectory: '<rootDir>/.jest-cache',

  // Notify
  notify: false,
  notifyMode: 'failure-change',
};
