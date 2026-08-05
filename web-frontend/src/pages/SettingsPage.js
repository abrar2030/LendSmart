import ShieldIcon from "@mui/icons-material/Shield";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useApi } from "../contexts/ApiContext";

const SettingsPage = () => {
  const { updatePassword, setupMFA, verifyMFA, user, loading } = useApi();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // MFA setup flow
  const [mfaSetup, setMfaSetup] = useState(null); // { qrCode, backupCodes }
  const [mfaToken, setMfaToken] = useState("");
  const [mfaError, setMfaError] = useState(null);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaEnabledJustNow, setMfaEnabledJustNow] = useState(false);

  const isMfaEnabled = user?.mfaEnabled || mfaEnabledJustNow;

  const handleStartMfaSetup = async () => {
    setMfaError(null);
    setMfaLoading(true);
    try {
      const result = await setupMFA();
      setMfaSetup(result.data);
    } catch (err) {
      setMfaError(err.response?.data?.message || "Failed to start MFA setup");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    setMfaError(null);
    setMfaLoading(true);
    try {
      await verifyMFA(mfaToken);
      setMfaEnabledJustNow(true);
      setMfaSetup(null);
      setMfaToken("");
    } catch (err) {
      setMfaError(err.response?.data?.message || "Invalid verification code");
    } finally {
      setMfaLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess(true);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message || "Failed to update password");
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Password updated successfully!
          </Alert>
        )}
        <form onSubmit={handlePasswordSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                fullWidth
                type="password"
                label="Current Password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                fullWidth
                type="password"
                label="New Password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                fullWidth
                type="password"
                label="Confirm New Password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Update Password"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: "secondary.main" }}>
              <ShieldIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">Two-Factor Authentication</Typography>
              <Typography variant="body2" color="text.secondary">
                Add an extra layer of security to your account
              </Typography>
            </Box>
          </Stack>
          {isMfaEnabled && (
            <Chip
              icon={<VerifiedUserIcon />}
              label="Enabled"
              color="success"
              variant="outlined"
            />
          )}
        </Stack>
        <Divider sx={{ my: 3 }} />

        {mfaError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {mfaError}
          </Alert>
        )}

        {isMfaEnabled ? (
          <Alert severity="success">
            Two-factor authentication is active on your account. You will be
            asked for a code from your authenticator app whenever you sign in.
          </Alert>
        ) : mfaSetup ? (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <Typography variant="subtitle2" gutterBottom>
                1. Scan this QR code
              </Typography>
              <Box
                component="img"
                src={mfaSetup.qrCode}
                alt="MFA QR code"
                sx={{
                  width: "100%",
                  maxWidth: 200,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 1,
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 1 }}
              >
                Use an authenticator app such as Google Authenticator or Authy.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 7 }}>
              <Typography variant="subtitle2" gutterBottom>
                2. Save your backup codes
              </Typography>
              <Card
                variant="outlined"
                sx={{ p: 1.5, mb: 2, bgcolor: "action.hover" }}
              >
                <Grid container spacing={0.5}>
                  {(mfaSetup.backupCodes || []).map((code) => (
                    <Grid key={code} size={{ xs: 6 }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {code}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Card>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 2 }}
              >
                Store these somewhere safe. Each code can be used once if you
                lose access to your authenticator app.
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                3. Enter the 6-digit code to confirm
              </Typography>
              <form onSubmit={handleVerifyMfa}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    size="small"
                    placeholder="000000"
                    value={mfaToken}
                    onChange={(e) => setMfaToken(e.target.value)}
                    inputProps={{ maxLength: 6 }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={mfaLoading || mfaToken.length < 6}
                  >
                    {mfaLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Verify and Enable"
                    )}
                  </Button>
                </Stack>
              </form>
            </Grid>
          </Grid>
        ) : (
          <Button
            variant="outlined"
            onClick={handleStartMfaSetup}
            disabled={mfaLoading}
          >
            {mfaLoading ? (
              <CircularProgress size={20} />
            ) : (
              "Set Up Two-Factor Authentication"
            )}
          </Button>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notification Preferences
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <FormControlLabel
          control={
            <Switch
              checked={notifications.email}
              onChange={(e) =>
                setNotifications({ ...notifications, email: e.target.checked })
              }
            />
          }
          label="Email Notifications"
        />
        <FormControlLabel
          control={
            <Switch
              checked={notifications.push}
              onChange={(e) =>
                setNotifications({ ...notifications, push: e.target.checked })
              }
            />
          }
          label="Push Notifications"
        />
        <FormControlLabel
          control={
            <Switch
              checked={notifications.sms}
              onChange={(e) =>
                setNotifications({ ...notifications, sms: e.target.checked })
              }
            />
          }
          label="SMS Notifications"
        />
      </Paper>
    </Box>
  );
};

export default SettingsPage;
