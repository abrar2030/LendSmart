module.exports = {
  preset: "jest-expo",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo[\\w-]*|@expo[\\w-]*(/.*)?|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-paper|react-native-vector-icons|react-native-svg|react-native-screens|react-native-modal|react-native-keychain|@react-native-async-storage|@walletconnect)/)",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js,jsx}",
    "!src/**/*.test.{ts,tsx,js,jsx}",
    "!src/**/__tests__/**",
    "!src/types/**",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
