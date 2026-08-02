import { Box, Container } from "@mui/material";
import { useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

/**
 * App shell: sticky header, centered main content area, footer pinned to the
 * bottom. The homepage and the auth split panels are designed to read well
 * within this centered container.
 */
const Layout = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          flex: 1,
          py: { xs: "var(--ls-space-5)", md: "var(--ls-space-6)" },
        }}
      >
        {children}
      </Container>
      {isHomePage && <Footer />}
    </Box>
  );
};

export default Layout;
