import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useApi } from "../contexts/ApiContext";

const USER_STATUS_COLORS = {
  active: "success",
  pending: "warning",
  suspended: "error",
  closed: "default",
};

const LOAN_STATUS_COLORS = {
  active: "primary",
  marketplace: "info",
  funded: "secondary",
  repaid: "success",
  defaulted: "error",
  rejected: "error",
  cancelled: "default",
  pending_approval: "warning",
};

const StatCard = ({ icon, label, value, color }) => (
  <Card sx={{ p: 2.5, height: "100%" }}>
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar
        sx={{
          bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
          color: `${color}.main`,
        }}
      >
        {icon}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {label}
        </Typography>
      </Box>
    </Stack>
  </Card>
);

const AdminDashboardPage = () => {
  const {
    user,
    getSystemAnalytics,
    getAdminUsers,
    updateAdminUserStatus,
    deleteAdminUser,
    getAdminLoans,
    updateAdminLoanStatus,
    exportAuditLogs,
  } = useApi();

  const [tab, setTab] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [usersMeta, setUsersMeta] = useState({ totalPages: 1, currentPage: 1 });
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [loans, setLoans] = useState([]);
  const [loansMeta, setLoansMeta] = useState({ totalPages: 1, currentPage: 1 });
  const [loansLoading, setLoansLoading] = useState(false);
  const [loansError, setLoansError] = useState(null);
  const [loanPage, setLoanPage] = useState(1);

  const [exportMessage, setExportMessage] = useState(null);

  const isAdmin = user?.role === "admin";

  const loadAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      const res = await getSystemAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      setAnalyticsError(
        err.response?.data?.message || "Failed to load analytics",
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }, [getSystemAnalytics]);

  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const res = await getAdminUsers({
        page: userPage,
        limit: 10,
        ...(userSearch ? { search: userSearch } : {}),
      });
      setUsers(res.data || []);
      setUsersMeta({
        totalPages: res.totalPages || 1,
        currentPage: res.currentPage || 1,
      });
    } catch (err) {
      setUsersError(err.response?.data?.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, [getAdminUsers, userPage, userSearch]);

  const loadLoans = useCallback(async () => {
    try {
      setLoansLoading(true);
      setLoansError(null);
      const res = await getAdminLoans({ page: loanPage, limit: 10 });
      setLoans(res.data || []);
      setLoansMeta({
        totalPages: res.totalPages || 1,
        currentPage: res.currentPage || 1,
      });
    } catch (err) {
      setLoansError(err.response?.data?.message || "Failed to load loans");
    } finally {
      setLoansLoading(false);
    }
  }, [getAdminLoans, loanPage]);

  useEffect(() => {
    if (!isAdmin) return;
    loadAnalytics();
  }, [isAdmin, loadAnalytics]);

  useEffect(() => {
    if (!isAdmin || tab !== 1) return;
    loadUsers();
  }, [isAdmin, tab, loadUsers]);

  useEffect(() => {
    if (!isAdmin || tab !== 2) return;
    loadLoans();
  }, [isAdmin, tab, loadLoans]);

  const handleToggleUserStatus = async (targetUser) => {
    const nextStatus =
      targetUser.accountStatus === "suspended" ? "active" : "suspended";
    try {
      await updateAdminUserStatus(targetUser._id, nextStatus);
      loadUsers();
    } catch (err) {
      setUsersError(
        err.response?.data?.message || "Failed to update user status",
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteAdminUser(pendingDelete._id);
      setPendingDelete(null);
      loadUsers();
    } catch (err) {
      setUsersError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleLoanStatusChange = async (loan, status) => {
    try {
      await updateAdminLoanStatus(loan._id, status);
      loadLoans();
    } catch (err) {
      setLoansError(
        err.response?.data?.message || "Failed to update loan status",
      );
    }
  };

  const handleExport = async () => {
    try {
      setExportMessage(null);
      const res = await exportAuditLogs({ format: "json" });
      setExportMessage(res.message || "Audit logs exported successfully");
    } catch (err) {
      setExportMessage(
        err.response?.data?.message || "Failed to export audit logs",
      );
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ maxWidth: 480, mx: "auto", mt: 8, textAlign: "center" }}>
        <Alert severity="warning">
          This area is only available to administrators.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, mb: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography component="h1" variant="h4" fontWeight={700}>
          Admin Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export Audit Logs
        </Button>
      </Stack>

      {exportMessage && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          onClose={() => setExportMessage(null)}
        >
          {exportMessage}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_e, value) => setTab(value)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Users" />
        <Tab label="Loans" />
      </Tabs>

      {tab === 0 && (
        <Box>
          {analyticsError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {analyticsError}
            </Alert>
          )}
          {analyticsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<PeopleIcon />}
                  label="Total Users"
                  value={analytics?.users?.total ?? 0}
                  color="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<CheckCircleIcon />}
                  label="Active Users"
                  value={analytics?.users?.active ?? 0}
                  color="success"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<AccountBalanceIcon />}
                  label="Total Loans"
                  value={analytics?.loans?.total ?? 0}
                  color="secondary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<TrendingUpIcon />}
                  label="Active Loans"
                  value={analytics?.loans?.active ?? 0}
                  color="info"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Loan Volume
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    $
                    {Number(
                      analytics?.loans?.totalAmount || 0,
                    ).toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Average Loan Amount
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    $
                    {Number(
                      analytics?.loans?.averageAmount || 0,
                    ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              size="small"
              placeholder="Search by name, username, or email"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setUserPage(1);
                  loadUsers();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
          </Stack>

          {usersError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {usersError}
            </Alert>
          )}

          {usersLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u._id} hover>
                        <TableCell>{u.username || "N/A"}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={u.role}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={u.accountStatus}
                            size="small"
                            color={
                              USER_STATUS_COLORS[u.accountStatus] || "default"
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip
                            title={
                              u.accountStatus === "suspended"
                                ? "Reactivate user"
                                : "Suspend user"
                            }
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleToggleUserStatus(u)}
                            >
                              {u.accountStatus === "suspended" ? (
                                <CheckCircleIcon
                                  fontSize="small"
                                  color="success"
                                />
                              ) : (
                                <BlockIcon fontSize="small" color="warning" />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete user">
                            <IconButton
                              size="small"
                              onClick={() => setPendingDelete(u)}
                            >
                              <DeleteIcon fontSize="small" color="error" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ py: 3 }}
                          >
                            No users found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {usersMeta.totalPages > 1 && (
                <Stack alignItems="center" sx={{ mt: 2 }}>
                  <Pagination
                    count={usersMeta.totalPages}
                    page={userPage}
                    onChange={(_e, page) => setUserPage(page)}
                  />
                </Stack>
              )}
            </>
          )}
        </Paper>
      )}

      {tab === 2 && (
        <Paper sx={{ p: 3 }}>
          {loansError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loansError}
            </Alert>
          )}

          {loansLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Borrower</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Applied</TableCell>
                      <TableCell align="right">Update Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loans.map((loan) => (
                      <TableRow key={loan._id} hover>
                        <TableCell>
                          {loan.borrower?.username ||
                            loan.borrower?.email ||
                            "N/A"}
                        </TableCell>
                        <TableCell>
                          ${Number(loan.amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={loan.status}
                            size="small"
                            color={LOAN_STATUS_COLORS[loan.status] || "default"}
                          />
                        </TableCell>
                        <TableCell>
                          {loan.applicationDate
                            ? new Date(
                                loan.applicationDate,
                              ).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell align="right">
                          <Select
                            size="small"
                            value={loan.status}
                            onChange={(e) =>
                              handleLoanStatusChange(loan, e.target.value)
                            }
                            sx={{ minWidth: 160 }}
                          >
                            {Object.keys(LOAN_STATUS_COLORS).map((status) => (
                              <MenuItem key={status} value={status}>
                                {status.replace("_", " ")}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                    {loans.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ py: 3 }}
                          >
                            No loans found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {loansMeta.totalPages > 1 && (
                <Stack alignItems="center" sx={{ mt: 2 }}>
                  <Pagination
                    count={loansMeta.totalPages}
                    page={loanPage}
                    onChange={(_e, page) => setLoanPage(page)}
                  />
                </Stack>
              )}
            </>
          )}
        </Paper>
      )}

      <Dialog open={!!pendingDelete} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Delete user</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently deletes {pendingDelete?.email}. This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboardPage;
