import { Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

/**
 * Branded split-panel shell for the sign in and sign up screens. The left panel
 * carries the LendSmart identity (ink surface, ledger figures); the right panel
 * hosts the form. Collapses to a single column on small screens.
 */
export default function AuthLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          bgcolor: "var(--ls-ink)",
          color: "#fff",
          p: "var(--ls-space-8)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "100% 32px",
            opacity: 0.6,
          }}
        />
        <RouterLink
          to="/"
          style={{
            color: "#fff",
            fontFamily: "var(--ls-font-display)",
            fontWeight: 700,
            fontSize: "1.25rem",
            position: "relative",
          }}
        >
          Lend<span style={{ color: "var(--ls-accent)" }}>Smart</span>
        </RouterLink>

        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              fontFamily: "var(--ls-font-display)",
              fontWeight: 700,
              fontSize: "2.25rem",
              lineHeight: 1.1,
              mb: 2,
            }}
          >
            Lending with terms you can read.
          </Box>
          <Box sx={{ color: "rgba(255,255,255,0.7)", maxWidth: 420 }}>
            Every rate, repayment, and balance is settled on-chain and shown in
            plain figures. No fine print between you and the money.
          </Box>

          <Box
            sx={{
              mt: 4,
              display: "grid",
              gridTemplateColumns: "repeat(3, auto)",
              gap: 4,
              justifyContent: "start",
            }}
          >
            {[
              ["APR from", "4.9%"],
              ["Funded", "$48.2M"],
              ["Repaid on time", "98.6%"],
            ].map(([label, value]) => (
              <Box key={label}>
                <Box
                  className="ls-figure"
                  sx={{ fontSize: "1.5rem", fontWeight: 600 }}
                >
                  {value}
                </Box>
                <Box
                  sx={{
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    mt: 0.5,
                  }}
                >
                  {label}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Secured by audited smart contracts.
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: "var(--ls-space-5)", md: "var(--ls-space-8)" },
          bgcolor: "var(--ls-surface)",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>{children}</Box>
      </Box>
    </Box>
  );
}
