import { createTheme } from "@mui/material/styles";

/**
 * MUI theme derived from the LendSmart design tokens (theme/tokens.css).
 * Keeping the palette and shape here in sync with the CSS variables means MUI
 * components and hand-written components share one identity.
 */
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2743e0", dark: "#1e34b8", light: "#eef1fe" },
    secondary: { main: "#12b886", dark: "#0e9d74" },
    error: { main: "#e8590c" },
    warning: { main: "#f08c00" },
    success: { main: "#12b886" },
    text: { primary: "#0c1424", secondary: "#5a6b85" },
    background: { default: "#f5f7fb", paper: "#ffffff" },
    divider: "#e4e9f2",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
    h1: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 18, paddingBlock: 9 },
        containedPrimary: { boxShadow: "0 1px 2px rgba(39,67,224,0.35)" },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: { borderColor: "#e4e9f2" },
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: { borderRadius: 16, borderColor: "#e4e9f2" },
      },
    },
    MuiTextField: { defaultProps: { variant: "outlined", size: "medium" } },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "inherit" },
    },
  },
});

export default theme;
