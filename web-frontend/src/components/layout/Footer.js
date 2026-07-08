import { Box, Container, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Footer = () => {
  const groups = [
    {
      heading: "Product",
      links: [
        { label: "Marketplace", to: "/marketplace" },
        { label: "Apply for a loan", to: "/apply" },
        { label: "Dashboard", to: "/dashboard" },
      ],
    },
    {
      heading: "Account",
      links: [
        { label: "Sign in", to: "/login" },
        { label: "Create account", to: "/register" },
        { label: "Profile", to: "/profile" },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        bgcolor: "var(--ls-ink)",
        color: "rgba(255,255,255,0.72)",
        py: "var(--ls-space-8)",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr" },
            gap: "var(--ls-space-6)",
            alignItems: "start",
          }}
        >
          <Box>
            <Typography
              component={RouterLink}
              to="/"
              sx={{
                fontFamily: "var(--ls-font-display)",
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              LendSmart
            </Typography>
            <Typography sx={{ mt: 1, maxWidth: 320, fontSize: "0.875rem" }}>
              Peer-to-peer lending with terms settled on-chain and shown in
              plain figures.
            </Typography>
          </Box>

          {groups.map((group) => (
            <Box key={group.heading}>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  mb: 1.5,
                }}
              >
                {group.heading}
              </Typography>
              {group.links.map((link) => (
                <Box
                  key={link.label}
                  component={RouterLink}
                  to={link.to}
                  sx={{
                    display: "block",
                    color: "rgba(255,255,255,0.72)",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    py: 0.5,
                    "&:hover": { color: "#fff" },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.12)",
            mt: "var(--ls-space-6)",
            pt: "var(--ls-space-4)",
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          © {new Date().getFullYear()} LendSmart. All rights reserved.
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
