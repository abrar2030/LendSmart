import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
  MD3DarkTheme,
  MD3LightTheme,
} from "react-native-paper";

// Prefer the MD3 base themes (react-native-paper v5); fall back to the legacy
// names so the module is robust across Paper versions.
const DefaultTheme = MD3LightTheme || PaperDefaultTheme;
const DarkTheme = MD3DarkTheme || PaperDarkTheme;

// --- Modernized Theme Configuration ---
// Based on docs/ui-design-concept.md and modern UI trends.
// Fonts: Poppins and Inter are good choices. Ensure they are linked:
// 1. Add font files (e.g., .ttf) to `/assets/fonts/` directory.
// 2. Create `react-native.config.js` in the root with:
//    module.exports = { project: { ios: {}, android: {} }, assets: ['./src/assets/fonts/'] };
// 3. Run `npx react-native link`.

// --- Color Palette ---
// Refined colors for better balance and modern feel.

export const lightColors = {
  primary: "#2743E0", // Electric indigo (shared web identity)
  secondary: "#12B886", // Jade accent (positive / approved)
  success: "#12B886", // Jade
  warning: "#F08C00", // Amber
  error: "#E8590C", // Burnt orange

  background: "#F5F7FB", // Muted surface
  surface: "#FFFFFF", // Cards / modals

  textPrimary: "#0C1424", // Deep navy ink
  textSecondary: "#5A6B85", // Muted ink
  textTertiary: "#8695AB", // Faint ink

  border: "#E4E9F2", // Hairline border
  disabled: "#CDD6E5", // Strong border tone for disabled
  placeholder: "#8695AB", // Faint ink for placeholders
  backdrop: "rgba(12, 20, 36, 0.4)", // Ink backdrop
};

export const darkColors = {
  primary: "#5570F5", // Lifted indigo for dark surfaces
  secondary: "#2DD4A0", // Lifted jade
  success: "#2DD4A0",
  warning: "#FFB84D",
  error: "#FF7A45",

  background: "#0C1424", // Ink
  surface: "#16213A", // Raised ink
  surface2: "#1E2C48", // Nested surface

  textPrimary: "#FFFFFF",
  textSecondary: "#A0ABC0",
  textTertiary: "#6B7A94",

  border: "#263248",
  disabled: "#3A4a63",
  placeholder: "#6B7A94",
  backdrop: "rgba(0, 0, 0, 0.6)",
};

// --- Typography ---
// Using Inter as the primary font for its clean look.
// Ensure font files are linked as described above.
export const fonts = {
  // Body: Inter (shared with the web identity)
  primary: "Inter-Regular",
  primaryMedium: "Inter-Medium",
  primarySemiBold: "Inter-SemiBold",
  primaryBold: "Inter-Bold",
  // Display: Space Grotesk (shared with the web identity)
  display: "SpaceGrotesk-Bold",
  displayMedium: "SpaceGrotesk-Medium",
  // Mono: JetBrains Mono for ledger figures (amounts and rates)
  mono: "JetBrainsMono-Medium",
  // Secondary retained for compatibility
  secondary: "Poppins-Regular",
  secondaryMedium: "Poppins-Medium",
};

// Slightly adjusted font sizes for better hierarchy
export const fontSizes = {
  h1: 34, // Large titles
  h2: 28, // Section headers
  h3: 22, // Sub-section headers
  h4: 20, // Card titles
  h5: 17, // List item titles, bold text
  h6: 15, // Emphasized body text
  body1: 17, // Standard body text (iOS default)
  body2: 15, // Smaller body text
  caption: 13, // Captions, small info
  footnote: 12, // Footnotes, very small text
};

// --- Spacing & Radius ---
// Consistent spacing scale
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12, // Adjusted medium spacing
  lg: 16, // Adjusted large spacing
  xl: 24,
  xxl: 32,
};

// Slightly increased border radius for a softer look
export const borderRadius = {
  sm: 6,
  md: 10, // Default card radius
  lg: 16,
  xl: 20,
  full: 999, // For circular elements
};

// --- React Native Paper Theme Integration ---

// Helper function to map fonts for Paper
const _mapPaperFonts = (fontConfig) => ({
  regular: { fontFamily: fontConfig.primary, fontWeight: "400" },
  medium: { fontFamily: fontConfig.primaryMedium, fontWeight: "500" },
  light: { fontFamily: fontConfig.primary, fontWeight: "300" }, // Assuming Inter-Light exists or map appropriately
  thin: { fontFamily: fontConfig.primary, fontWeight: "100" }, // Assuming Inter-Thin exists
  // Add mappings for bold etc. if Paper uses them or if you customize components
  bold: { fontFamily: fontConfig.primaryBold, fontWeight: "700" },
});

export const CombinedLightTheme = {
  ...DefaultTheme,
  roundness: borderRadius.md,
  colors: {
    ...DefaultTheme.colors,
    primary: lightColors.primary,
    accent: lightColors.secondary, // Keep for compatibility, but prefer 'secondary'
    background: lightColors.background,
    surface: lightColors.surface,
    text: lightColors.textPrimary,
    placeholder: lightColors.placeholder,
    disabled: lightColors.disabled,
    error: lightColors.error,
    notification: lightColors.secondary,
    // Custom colors accessible via theme.colors.customProperty
    ...lightColors,
  },
  // fonts: configureFonts({ default: mapPaperFonts(fonts) }), // Use configureFonts if needed
  // Add custom theme properties
  spacing: spacing,
  fontSizes: fontSizes,
  borderRadius: borderRadius,
  fonts: { ...DefaultTheme.fonts, ...fonts }, // custom names on top of MD3 variants
};

export const CombinedDarkTheme = {
  ...DarkTheme,
  roundness: borderRadius.md,
  colors: {
    ...DarkTheme.colors,
    primary: darkColors.primary,
    accent: darkColors.secondary,
    background: darkColors.background,
    surface: darkColors.surface,
    text: darkColors.textPrimary,
    placeholder: darkColors.placeholder,
    disabled: darkColors.disabled,
    error: darkColors.error,
    notification: darkColors.secondary,
    // Custom colors
    ...darkColors,
    surface2: darkColors.surface2, // Make custom surface accessible
  },
  // fonts: configureFonts({ default: mapPaperFonts(fonts) }),
  // Add custom theme properties
  spacing: spacing,
  fontSizes: fontSizes,
  borderRadius: borderRadius,
  fonts: { ...DarkTheme.fonts, ...fonts }, // custom names on top of MD3 variants
};
