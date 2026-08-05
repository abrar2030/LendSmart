import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../contexts/ApiContext";
import { useBlockchain } from "../contexts/BlockchainContext";

const ApplyForLoan = () => {
  const navigate = useNavigate();
  const { applyForLoan } = useApi();
  const {
    requestLoan,
    isConnected,
    connectWallet,
    isLoading: blockchainLoading,
    isInitializing,
    error: blockchainError,
  } = useBlockchain();

  const [formData, setFormData] = useState({
    token: "0x0000000000000000000000000000000000000000", // Default to ETH
    principal: "",
    interestRate: "",
    duration: "",
    purpose: "",
    isCollateralized: false,
    collateralToken: "0x0000000000000000000000000000000000000000",
    collateralAmount: "",
    decimals: 18,
    collateralDecimals: 18,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      try {
        await connectWallet();
      } catch (_err) {
        setError("Please connect your wallet to apply for a loan");
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // The smart contract expects duration in seconds and the interest
      // rate scaled by 100 (e.g. 5% -> 500), while the form collects the
      // more human-friendly "days" and "percent" values.
      const contractPayload = {
        ...formData,
        duration: Math.round(parseFloat(formData.duration) * 24 * 60 * 60),
        interestRate: Math.round(parseFloat(formData.interestRate) * 100),
      };

      // First submit to blockchain
      const blockchainResult = await requestLoan(contractPayload);

      if (!blockchainResult) {
        throw new Error("Failed to submit loan request to blockchain");
      }

      // Then submit to backend with blockchain data
      const backendData = {
        ...formData,
        blockchainId: blockchainResult.loanId,
        transactionHash: blockchainResult.transactionHash,
      };

      await applyForLoan(backendData);

      setSuccess(true);
      setLoading(false);

      // Redirect to loan details page after short delay
      setTimeout(() => {
        navigate(`/loans/${blockchainResult.loanId}`);
      }, 2000);
    } catch (err) {
      console.error("Error applying for loan:", err);
      setError(err.message || "Failed to apply for loan");
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Apply for Loan
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
        {success ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            Loan application submitted successfully! Redirecting to loan
            details...
          </Alert>
        ) : null}

        {error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : null}

        {blockchainError ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {blockchainError}
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Token Address"
                name="token"
                value={formData.token}
                onChange={handleChange}
                fullWidth
                required
                helperText="Address of the token you want to borrow (use 0x0 for ETH)"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Principal Amount"
                name="principal"
                type="number"
                value={formData.principal}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">Tokens</InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Token Decimals"
                name="decimals"
                type="number"
                value={formData.decimals}
                onChange={handleChange}
                fullWidth
                required
                helperText="Usually 18 for ETH and most ERC20 tokens"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Interest Rate"
                name="interestRate"
                type="number"
                value={formData.interestRate}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                helperText="Annual interest rate (e.g., 5 for 5%)"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">Days</InputAdornment>
                  ),
                }}
                helperText="Loan duration in days"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={3}
                helperText="Describe the purpose of this loan"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isCollateralized"
                    checked={formData.isCollateralized}
                    onChange={handleChange}
                  />
                }
                label="Collateralized Loan"
              />
            </Grid>

            {formData.isCollateralized && (
              <>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Collateral Token Address"
                    name="collateralToken"
                    value={formData.collateralToken}
                    onChange={handleChange}
                    fullWidth
                    required
                    helperText="Address of the token you want to use as collateral"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Collateral Amount"
                    name="collateralAmount"
                    type="number"
                    value={formData.collateralAmount}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">Tokens</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Collateral Token Decimals"
                    name="collateralDecimals"
                    type="number"
                    value={formData.collateralDecimals}
                    onChange={handleChange}
                    fullWidth
                    required
                    helperText="Usually 18 for ETH and most ERC20 tokens"
                  />
                </Grid>
              </>
            )}

            {!isConnected && !isInitializing && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  You will be asked to connect your wallet (e.g. MetaMask) when
                  you submit. Transactions are always signed in your wallet -
                  LendSmart never asks for your private key.
                </Alert>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading || blockchainLoading || isInitializing}
              >
                {loading || blockchainLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Apply for Loan"
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ApplyForLoan;
