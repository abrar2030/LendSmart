import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const stats = [
  ["Total funded", "$48.2M"],
  ["Average APR", "9.4%"],
  ["Repaid on time", "98.6%"],
  ["Active lenders", "12,480"],
];

const steps = [
  {
    n: "01",
    title: "Create your account",
    body: "Sign up and complete a short verification. Connect a wallet when you are ready to move funds.",
  },
  {
    n: "02",
    title: "Borrow or fund a loan",
    body: "Request a loan with clear terms, or browse the marketplace and fund the requests that fit your risk appetite.",
  },
  {
    n: "03",
    title: "Settle on-chain",
    body: "Repayments, interest, and balances are executed by audited contracts and shown to both sides in plain figures.",
  },
];

const HomePage = () => {
  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
          gap: "var(--ls-space-6)",
          alignItems: "center",
          py: { xs: "var(--ls-space-6)", md: "var(--ls-space-10)" },
        }}
      >
        <Box>
          <Typography
            sx={{
              color: "var(--ls-primary)",
              fontWeight: 600,
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              mb: 2,
            }}
          >
            Peer-to-peer lending, settled on-chain
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--ls-font-display)",
              fontWeight: 700,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              mb: 2,
            }}
          >
            Lending with terms you can actually read.
          </Typography>
          <Typography
            sx={{
              color: "var(--ls-text-muted)",
              fontSize: "1.125rem",
              maxWidth: 520,
              mb: 4,
            }}
          >
            LendSmart connects borrowers and lenders directly. Every rate,
            repayment, and balance is executed by smart contracts and shown to
            both sides as plain numbers, not fine print.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
            >
              Get started
            </Button>
            <Button
              component={RouterLink}
              to="/marketplace"
              variant="outlined"
              size="large"
              sx={{
                borderColor: "var(--ls-border-strong)",
                color: "var(--ls-ink)",
              }}
            >
              Explore the marketplace
            </Button>
          </Box>
        </Box>

        {/* Ledger panel: the signature element */}
        <Box
          sx={{
            bgcolor: "var(--ls-ink)",
            color: "#fff",
            borderRadius: "var(--ls-radius-lg)",
            p: "var(--ls-space-6)",
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
              backgroundSize: "100% 40px",
            }}
          />
          <Typography
            sx={{
              position: "relative",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
              mb: 2,
            }}
          >
            Live loan ledger
          </Typography>
          {[
            ["Requested", "$5,000.00"],
            ["APR", "8.50%"],
            ["Term", "180 days"],
            ["Funded", "$5,000.00"],
            ["Repaid", "$2,310.44"],
          ].map(([label, value], i) => (
            <Box
              key={label}
              sx={{
                position: "relative",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1.5,
                borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                {label}
              </Typography>
              <Typography
                className="ls-figure"
                sx={{ fontSize: "1.05rem", fontWeight: 600 }}
              >
                {value}
              </Typography>
            </Box>
          ))}
          <Box
            sx={{
              position: "relative",
              mt: 2,
              pt: 2,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "var(--ls-accent)",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            On track. Next payment in 12 days.
          </Box>
        </Box>
      </Box>

      {/* Stats band */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: "var(--ls-space-4)",
          py: "var(--ls-space-6)",
          borderTop: "1px solid var(--ls-border)",
          borderBottom: "1px solid var(--ls-border)",
        }}
      >
        {stats.map(([label, value]) => (
          <Box key={label}>
            <Typography
              className="ls-figure"
              sx={{
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: 600,
                color: "var(--ls-ink)",
              }}
            >
              {value}
            </Typography>
            <Typography
              sx={{ color: "var(--ls-text-muted)", fontSize: "0.875rem" }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* How it works: a real 3-step sequence, so the numbering carries meaning */}
      <Box sx={{ py: "var(--ls-space-10)" }}>
        <Typography
          component="h2"
          sx={{ fontSize: "2rem", fontWeight: 700, mb: 1 }}
        >
          How it works
        </Typography>
        <Typography
          sx={{ color: "var(--ls-text-muted)", mb: "var(--ls-space-6)" }}
        >
          Three steps from sign up to settled.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: "var(--ls-space-5)",
          }}
        >
          {steps.map((step) => (
            <Box
              key={step.n}
              sx={{
                border: "1px solid var(--ls-border)",
                borderRadius: "var(--ls-radius-lg)",
                p: "var(--ls-space-5)",
                bgcolor: "var(--ls-surface)",
              }}
            >
              <Typography
                className="ls-figure"
                sx={{ color: "var(--ls-primary)", fontWeight: 600, mb: 1.5 }}
              >
                {step.n}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--ls-font-display)",
                  fontWeight: 600,
                  fontSize: "1.125rem",
                  mb: 1,
                }}
              >
                {step.title}
              </Typography>
              <Typography
                sx={{ color: "var(--ls-text-muted)", fontSize: "0.95rem" }}
              >
                {step.body}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Closing CTA */}
      <Box
        sx={{
          bgcolor: "var(--ls-primary-050)",
          borderRadius: "var(--ls-radius-lg)",
          p: { xs: "var(--ls-space-6)", md: "var(--ls-space-8)" },
          mb: "var(--ls-space-8)",
          textAlign: "center",
        }}
      >
        <Typography
          component="h2"
          sx={{ fontSize: "1.875rem", fontWeight: 700, mb: 1 }}
        >
          Ready to borrow or lend?
        </Typography>
        <Typography sx={{ color: "var(--ls-text-muted)", mb: 3 }}>
          Open an account in a few minutes. No fine print.
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
          >
            Create account
          </Button>
          <Button
            component={RouterLink}
            to="/login"
            variant="text"
            size="large"
            sx={{ color: "var(--ls-primary)" }}
          >
            Sign in
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
