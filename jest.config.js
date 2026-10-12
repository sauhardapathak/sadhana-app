/**
 * Jest config — preset jest-expo. AsyncStorage is mapped to the official
 * in-memory mock shipped with the package (setupFiles alone cannot
 * intercept the import; moduleNameMapper redirects it).
 */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/node_modules/@react-native-async-storage/async-storage/jest/async-storage-mock.js',
  },
};
