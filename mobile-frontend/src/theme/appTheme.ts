import type { MD3Theme } from "react-native-paper";

/**
 * The app extends React Native Paper's MD3 theme at runtime (see theme/theme.js)
 * with custom colors, a spacing/fontSizes/borderRadius scale, and named font
 * families. Paper's own types do not know about these, so components should read
 * the theme as AppTheme (via useTheme<AppTheme>()) to get accurate typing.
 */
export type CustomColors = {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  surface2: string;
  text: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  disabled: string;
  placeholder: string;
  accent: string;
  notification: string;
  backdrop: string;
};

export type CustomFonts = {
  primary: string;
  primaryMedium: string;
  primarySemiBold: string;
  primaryBold: string;
  display: string;
  displayMedium: string;
  mono: string;
  secondary: string;
  secondaryMedium: string;
};

export type AppTheme = Omit<MD3Theme, "colors" | "fonts"> & {
  colors: MD3Theme["colors"] & CustomColors;
  fonts: CustomFonts;
  spacing: Record<string, number>;
  fontSizes: Record<string, number>;
  borderRadius: Record<string, number>;
};
