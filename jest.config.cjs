module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: { '^lucide-react-native$': '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js' },
  testMatch: ['**/tests/**/*.test.tsx'],
  testTimeout: 20000,
};
