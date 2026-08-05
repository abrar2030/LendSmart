import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import PersonIcon from "@mui/icons-material/Person";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ShieldIcon from "@mui/icons-material/Shield";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  alpha,
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Fade,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../contexts/ApiContext";
import { useBlockchain } from "../contexts/BlockchainContext";

const STATUS_COLORS = {
  Active: "primary",
  Requested: "info",
  Repaid: "success",
  Funded: "secondary",
  Defaulted: "error",
};

const truncateAddress = (address) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

const StatCard = ({ icon, label, value, color, onClick, delay = 0 }) => (
  <Fade in timeout={400 + delay}>
    <Card
      onClick={onClick}
      sx={{
        p: 2.5,
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        borderColor: "divider",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-4px)",
              boxShadow: (theme) =>
                `0 12px 24px ${alpha(theme.palette[color].main, 0.18)}`,
              borderColor: `${color}.main`,
            }
          : undefined,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar
          sx={{
            bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
            color: `${color}.main`,
            width: 52,
            height: 52,
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" fontWeight={700} lineHeight={1.2}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {label}
          </Typography>
        </Box>
      </Stack>
    </Card>
  </Fade>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, getMyLoans } = useApi();
  const {
    getUserLoans,
    getUserReputationScore,
    isConnected,
    isInitializing,
    connectWallet,
    account,
  } = useBlockchain();

  const [loans, setLoans] = useState([]);
  const [blockchainLoans, setBlockchainLoans] = useState([]);
  const [reputationScore, setReputationScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const backendResult = await getMyLoans();
      setLoans(backendResult.data?.loans || []);

      if (isConnected && account) {
        const blockchainLoanIds = await getUserLoans(account);
        setBlockchainLoans(blockchainLoanIds || []);

        const score = await getUserReputationScore(account);
        setReputationScore(score);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to fetch dashboard data");
      setLoading(false);
    }
  }, [getMyLoans, isConnected, account, getUserLoans, getUserReputationScore]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (_err) {
      setError("Failed to connect wallet");
    }
  };

  const handleCopyAddress = () => {
    if (!account) return;
    navigator.clipboard?.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const displayName = useMemo(() => {
    if (user?.firstName || user?.lastName) {
      return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    }
    return user?.username || "there";
  }, [user]);

  const stats = useMemo(
    () => ({
      active: loans.filter((loan) => loan.status === "Active").length,
      pending: loans.filter((loan) => loan.status === "Requested").length,
      repaid: loans.filter((loan) => loan.status === "Repaid").length,
      totalBorrowed: loans.reduce(
        (sum, loan) => sum + (Number(loan.amount) || 0),
        0,
      ),
    }),
    [loans],
  );

  const recentLoans = useMemo(() => loans.slice(0, 4), [loans]);

  if (loading) {
    return (
      <Box>
        <Skeleton
          variant="rounded"
          height={160}
          sx={{ mb: 3, borderRadius: 4 }}
        />
        <Grid container spacing={3}>
          {[0, 1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Skeleton
                variant="rounded"
                height={110}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Hero header */}
      <Fade in timeout={350}>
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            mb: 3,
            borderRadius: 4,
            color: "#fff",
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #2743e0 0%, #1e34b8 55%, #12b886 150%)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -60,
              right: -40,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: alpha("#ffffff", 0.08),
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -80,
              right: 120,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: alpha("#ffffff", 0.06),
            }}
          />
          <Grid
            container
            spacing={2}
            alignItems="center"
            sx={{ position: "relative" }}
          >
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography
                variant="overline"
                sx={{ opacity: 0.85, letterSpacing: 1.5 }}
              >
                Welcome back
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5, mb: 1 }}>
                Hi, {displayName}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 520 }}>
                Here is a snapshot of your loans, reputation, and wallet, all in
                one place.
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#fff",
                    color: "primary.main",
                    "&:hover": { bgcolor: alpha("#ffffff", 0.9) },
                  }}
                  endIcon={<RocketLaunchIcon />}
                  onClick={() => navigate("/apply")}
                >
                  Apply for a Loan
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: alpha("#ffffff", 0.6),
                    color: "#fff",
                    "&:hover": {
                      borderColor: "#fff",
                      bgcolor: alpha("#ffffff", 0.1),
                    },
                  }}
                  onClick={() => navigate("/marketplace")}
                >
                  Browse Marketplace
                </Button>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  bgcolor: alpha("#ffffff", 0.12),
                  borderRadius: 3,
                  p: 2.5,
                  backdropFilter: "blur(6px)",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <AccountBalanceWalletIcon />
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    Wallet
                  </Typography>
                </Stack>

                {isConnected ? (
                  <>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      sx={{ mt: 1.5 }}
                    >
                      <Typography variant="body2" fontFamily="monospace">
                        {truncateAddress(account)}
                      </Typography>
                      <Tooltip title={copied ? "Copied" : "Copy address"}>
                        <IconButton
                          size="small"
                          onClick={handleCopyAddress}
                          sx={{ color: "#fff" }}
                        >
                          <ContentCopyIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Stack direction="row" spacing={3} sx={{ mt: 1.5 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {reputationScore !== null ? reputationScore : "..."}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85 }}>
                          Reputation
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {blockchainLoans.length}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85 }}>
                          On-chain loans
                        </Typography>
                      </Box>
                    </Stack>
                  </>
                ) : (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1.5 }}>
                      {isInitializing
                        ? "Checking for a wallet..."
                        : "Connect your wallet to see on-chain activity."}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={isInitializing}
                      sx={{
                        bgcolor: "#fff",
                        color: "primary.main",
                        "&:hover": { bgcolor: alpha("#ffffff", 0.9) },
                      }}
                      onClick={handleConnectWallet}
                    >
                      {isInitializing ? (
                        <CircularProgress size={18} />
                      ) : (
                        "Connect Wallet"
                      )}
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<TrendingUpIcon />}
            label="Active Loans"
            value={stats.active}
            color="primary"
            delay={0}
            onClick={() => navigate("/my-loans")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<HourglassTopIcon />}
            label="Pending Requests"
            value={stats.pending}
            color="info"
            delay={80}
            onClick={() => navigate("/my-loans")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<CheckCircleIcon />}
            label="Repaid Loans"
            value={stats.repaid}
            color="success"
            delay={160}
            onClick={() => navigate("/my-loans")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<AccountBalanceIcon />}
            label="Total Borrowed"
            value={`$${stats.totalBorrowed.toLocaleString()}`}
            color="secondary"
            delay={240}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Recent loans */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" fontWeight={600}>
                Recent Loans
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate("/my-loans")}
              >
                View all
              </Button>
            </Stack>

            {recentLoans.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 5,
                  px: 2,
                  borderRadius: 3,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                }}
              >
                <AssignmentTurnedInIcon
                  sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
                />
                <Typography variant="subtitle1" fontWeight={600}>
                  No loans yet
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Start your first application to see it show up here.
                </Typography>
                <Button variant="contained" onClick={() => navigate("/apply")}>
                  Apply for a Loan
                </Button>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {recentLoans.map((loan) => (
                  <Box
                    key={loan._id || loan.id}
                    onClick={() => navigate(`/loans/${loan._id || loan.id}`)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      cursor: "pointer",
                      transition: "background-color 0.15s ease",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={600} noWrap>
                        {loan.purpose || "Loan request"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${Number(loan.amount || 0).toLocaleString()}
                        {loan.createdAt
                          ? ` \u00b7 ${new Date(
                              loan.createdAt,
                            ).toLocaleDateString()}`
                          : ""}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={loan.status || "Unknown"}
                      color={STATUS_COLORS[loan.status] || "default"}
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* User information */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" fontWeight={600}>
                Account
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate("/profile")}
              >
                Edit Profile
              </Button>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
                <PersonIcon />
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={600} noWrap>
                  {displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user?.email || "No email on file"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Member since{" "}
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          {/* Reputation */}
          {isConnected && (
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3, textAlign: "center" }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Reputation Score
              </Typography>
              <Box
                sx={{
                  position: "relative",
                  display: "inline-flex",
                  my: 1,
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={120}
                  thickness={4}
                  sx={{
                    color: (theme) => alpha(theme.palette.primary.main, 0.12),
                  }}
                />
                <CircularProgress
                  variant="determinate"
                  value={
                    reputationScore !== null
                      ? Math.min(100, Number(reputationScore))
                      : 0
                  }
                  size={120}
                  thickness={4}
                  color="secondary"
                  sx={{ position: "absolute", left: 0 }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShieldIcon color="secondary" sx={{ mb: 0.5 }} />
                  <Typography variant="h6" fontWeight={700}>
                    {reputationScore !== null ? reputationScore : "..."}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Based on your on-chain repayment history
              </Typography>
            </Paper>
          )}

          {/* Quick actions */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>

            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {[
                {
                  icon: <RocketLaunchIcon />,
                  label: "Apply for a New Loan",
                  description: "Start a new borrowing request",
                  color: "primary",
                  path: "/apply",
                },
                {
                  icon: <AccountBalanceIcon />,
                  label: "Browse Loan Marketplace",
                  description: "Find loans to fund",
                  color: "secondary",
                  path: "/marketplace",
                },
                {
                  icon: <TrendingUpIcon />,
                  label: "Manage Your Loans",
                  description: "Track status and repayments",
                  color: "info",
                  path: "/my-loans",
                },
              ].map((action) => (
                <Box
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: (theme) =>
                        alpha(theme.palette[action.color].main, 0.12),
                      color: `${action.color}.main`,
                    }}
                  >
                    {action.icon}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {action.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {action.description}
                    </Typography>
                  </Box>
                  <ArrowForwardIcon
                    sx={{ fontSize: 18, color: "text.disabled" }}
                  />
                </Box>
              ))}

              {user?.role === "risk-assessor" && (
                <Box
                  onClick={() => navigate("/risk-assessment")}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: (theme) =>
                        alpha(theme.palette.warning.main, 0.12),
                      color: "warning.main",
                    }}
                  >
                    <WarningAmberIcon />
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      Risk Assessment Dashboard
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      Review pending risk scores
                    </Typography>
                  </Box>
                  <ArrowForwardIcon
                    sx={{ fontSize: 18, color: "text.disabled" }}
                  />
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
