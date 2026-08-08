/**
 * Manual Jest mock for react-native-screens.
 *
 * react-native-screens ships Fabric-codegen'd native view components (e.g.
 * ScreenNativeComponent) that call codegenNativeComponent() from
 * 'react-native' at module-import time. Jest's test environment has no real
 * native renderer, and its react-native mock doesn't implement that
 * function, so simply importing react-native-screens (via
 * @react-navigation/native-stack or bottom-tabs) crashed every test that
 * rendered real navigation - including any test that imports App.js.
 *
 * This mock replaces every runtime export with a plain View (or a no-op),
 * which is sufficient for rendering/interaction tests: none of them need
 * the actual native screen optimizations, just something that renders
 * children.
 */
const React = require("react");
const { View } = require("react-native");

const passthrough = (displayName) => {
  const Component = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref }, props.children),
  );
  Component.displayName = displayName;
  return Component;
};

module.exports = {
  // Core
  enableScreens: () => {},
  enableFreeze: () => {},
  screensEnabled: () => true,
  freezeEnabled: () => false,

  // Components
  Screen: passthrough("Screen"),
  InnerScreen: passthrough("InnerScreen"),
  ScreenContext: React.createContext(null),
  ScreenStackHeaderConfig: passthrough("ScreenStackHeaderConfig"),
  ScreenStackHeaderSubview: passthrough("ScreenStackHeaderSubview"),
  ScreenStackHeaderLeftView: passthrough("ScreenStackHeaderLeftView"),
  ScreenStackHeaderCenterView: passthrough("ScreenStackHeaderCenterView"),
  ScreenStackHeaderRightView: passthrough("ScreenStackHeaderRightView"),
  ScreenStackHeaderBackButtonImage: passthrough(
    "ScreenStackHeaderBackButtonImage",
  ),
  ScreenStackHeaderSearchBarView: passthrough("ScreenStackHeaderSearchBarView"),
  SearchBar: passthrough("SearchBar"),
  ScreenContainer: passthrough("ScreenContainer"),
  ScreenStack: passthrough("ScreenStack"),
  ScreenStackItem: passthrough("ScreenStackItem"),
  FullWindowOverlay: passthrough("FullWindowOverlay"),
  ScreenFooter: passthrough("ScreenFooter"),
  ScreenContentWrapper: passthrough("ScreenContentWrapper"),

  // Utils
  isSearchBarAvailableForCurrentPlatform: false,
  executeNativeBackPress: () => false,

  // Flags (shape mirrored from the real package so consumers reading
  // specific fields get the values they expect)
  compatibilityFlags: {
    isNewBackTitleImplementation: true,
    usesHeaderFlexboxImplementation: true,
    usesNewAndroidHeaderHeightImplementation: true,
    usesStableTabsApi: true,
  },
  featureFlags: {
    experiment: {
      synchronousScreenUpdatesEnabled: true,
      synchronousHeaderConfigUpdatesEnabled: true,
      synchronousHeaderSubviewUpdatesEnabled: true,
      androidLegacyTopInsetBehavior: false,
      androidResetScreenShadowStateOnOrientationChangeEnabled: true,
      iosPreventReattachmentOfDismissedScreens: true,
      iosPreventReattachmentOfDismissedModals: true,
      ios26AllowInteractionsDuringTransition: true,
    },
    stable: {
      debugLogging: false,
    },
  },

  // Hooks
  useTransitionProgress: () => ({
    progress: { __getValue: () => 1 },
    closing: { __getValue: () => 0 },
    goingForward: { __getValue: () => 1 },
  }),

  // Tabs (unstable API, used by @react-navigation/bottom-tabs' native
  // implementation - not exercised by this app's tests, but exported so
  // importing it doesn't throw).
  Tabs: {
    NativeTabs: passthrough("NativeTabs"),
    Trigger: passthrough("TabTrigger"),
    TabSlot: passthrough("TabSlot"),
    TabList: passthrough("TabList"),
  },
};
