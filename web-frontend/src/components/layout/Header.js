import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { useApi } from "../../contexts/ApiContext";
import { useBlockchain } from "../../contexts/BlockchainContext";

const Header = () => {
  const { isAuthenticated, user, logout } = useApi();
  const { isConnected, account, connectWallet, disconnectWallet } =
    useBlockchain();

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (e) => setAnchorElNav(e.currentTarget);
  const handleOpenUserMenu = (e) => setAnchorElUser(e.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
  };
  const handleWalletConnect = () => {
    if (isConnected) disconnectWallet();
    else connectWallet();
  };

  const pages = [
    { title: "Home", path: "/" },
    { title: "Marketplace", path: "/marketplace" },
    { title: "Apply for Loan", path: "/apply", auth: true },
    { title: "My Loans", path: "/my-loans", auth: true },
    {
      title: "Risk Assessment",
      path: "/risk-assessment",
      auth: true,
      role: "risk-assessor",
    },
  ];

  const settings = [
    { title: "Dashboard", path: "/dashboard" },
    { title: "Profile", path: "/profile" },
  ];

  const canSee = (page) => {
    if (page.auth && !isAuthenticated) return false;
    if (page.role && (!user || user.role !== page.role)) return false;
    return true;
  };

  const wordmark = (display) => (
    <Typography
      noWrap
      component={RouterLink}
      to="/"
      sx={{
        display,
        fontFamily: "var(--ls-font-display)",
        fontWeight: 700,
        fontSize: "1.25rem",
        letterSpacing: "-0.02em",
        color: "var(--ls-ink)",
        textDecoration: "none",
      }}
    >
      LendSmart
    </Typography>
  );

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: "var(--ls-surface)",
        color: "var(--ls-ink)",
        borderBottom: "1px solid var(--ls-border)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: 1 }}>
          {wordmark({ xs: "none", md: "flex" })}

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              sx={{ color: "var(--ls-ink)" }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.filter(canSee).map((page) => (
                <MenuItem
                  key={page.title}
                  onClick={handleCloseNavMenu}
                  component={RouterLink}
                  to={page.path}
                >
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {wordmark({ xs: "flex", md: "none" })}

          {/* Desktop nav */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              ml: 3,
              gap: 0.5,
            }}
          >
            {pages.filter(canSee).map((page) => (
              <Button
                key={page.title}
                component={RouterLink}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{
                  color: "var(--ls-text-muted)",
                  fontWeight: 500,
                  "&:hover": { color: "var(--ls-ink)", bgcolor: "transparent" },
                }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          {/* Wallet */}
          <Button
            variant="outlined"
            onClick={handleWalletConnect}
            className={isConnected ? "ls-figure" : undefined}
            sx={{
              mr: 1,
              borderColor: "var(--ls-border-strong)",
              color: "var(--ls-ink)",
            }}
          >
            {isConnected
              ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
              : "Connect Wallet"}
          </Button>

          {/* User area */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    sx={{ bgcolor: "var(--ls-primary)" }}
                    alt={user?.firstName || user?.username || "User"}
                  >
                    {user?.firstName || user?.username ? (
                      (user.firstName || user.username).charAt(0).toUpperCase()
                    ) : (
                      <AccountCircleIcon />
                    )}
                  </Avatar>
                </IconButton>
                <Menu
                  sx={{ mt: "45px" }}
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  keepMounted
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem
                      key={setting.title}
                      onClick={handleCloseUserMenu}
                      component={RouterLink}
                      to={setting.path}
                    >
                      <Typography textAlign="center">
                        {setting.title}
                      </Typography>
                    </MenuItem>
                  ))}
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{ color: "var(--ls-ink)" }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/register"
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
