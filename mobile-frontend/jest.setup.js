// Jest setup file
// import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock react-native-keychain
jest.mock("react-native-keychain", () => ({
  setGenericPassword: jest.fn(() => Promise.resolve()),
  getGenericPassword: jest.fn(() => Promise.resolve(null)),
  resetGenericPassword: jest.fn(() => Promise.resolve()),
}));

// Mock NetInfo
jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock @expo/vector-icons (avoids font loading in tests)
jest.mock("@expo/vector-icons", () => ({
  MaterialCommunityIcons: "Icon",
  MaterialIcons: "Icon",
  Ionicons: "Icon",
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock WalletConnect
jest.mock("@walletconnect/modal-react-native", () => ({
  WalletConnectModal: jest.fn(() => null),
  useWalletConnectModal: () => ({
    open: jest.fn(),
    isConnected: false,
    address: undefined,
    provider: undefined,
  }),
}));

jest.mock("@walletconnect/react-native-compat", () => ({}));
jest.mock("react-native-get-random-values", () => ({}));

// Global test timeout
jest.setTimeout(10000);

// Screens read custom theme properties (spacing, custom colors, fonts) via
// useTheme(). In isolated tests there is no PaperProvider supplying the app
// theme, so provide those custom properties here. Values inlined to avoid a
// circular require of the theme module (which imports react-native-paper).
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  const base = actual.MD3LightTheme;
  const appTheme = {
    ...base,
    roundness: 10,
    colors: {
      ...base.colors,
      primary: "#2743E0",
      secondary: "#12B886",
      success: "#12B886",
      warning: "#F08C00",
      error: "#E8590C",
      background: "#F5F7FB",
      surface: "#FFFFFF",
      text: "#0C1424",
      textPrimary: "#0C1424",
      textSecondary: "#5A6B85",
      textTertiary: "#8695AB",
      border: "#E4E9F2",
      disabled: "#CDD6E5",
      placeholder: "#8695AB",
      accent: "#12B886",
    },
    spacing: { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
    fontSizes: {
      h1: 34,
      h2: 28,
      h3: 22,
      h4: 20,
      h5: 17,
      h6: 15,
      body1: 17,
      body2: 15,
      caption: 13,
      footnote: 12,
    },
    borderRadius: { sm: 6, md: 10, lg: 16, xl: 20, full: 999 },
    fonts: {
      ...base.fonts,
      primary: "Inter-Regular",
      primaryMedium: "Inter-Medium",
      primarySemiBold: "Inter-SemiBold",
      primaryBold: "Inter-Bold",
      display: "SpaceGrotesk-Bold",
      mono: "JetBrainsMono-Medium",
    },
  };
  return { ...actual, useTheme: () => appTheme };
});

// The loan details screen simulates a transaction with a 2s delay; give async
// queries (findBy*, waitFor) enough time to resolve with real timers.
const { configure: configureRNTL } = require("@testing-library/react-native");
configureRNTL({ asyncUtilTimeout: 5000 });
