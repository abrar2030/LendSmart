import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useApi } from "../contexts/ApiContext";
import AuthLayout from "../components/layout/AuthLayout";

// Mirrors the backend's employmentStatus enum (src/models/User.js)
const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "self-employed", label: "Self-employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "student", label: "Student" },
  { value: "retired", label: "Retired" },
];

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
const PASSWORD_RULES = [
  { test: (v) => v.length >= 8, label: "At least 8 characters" },
  { test: (v) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v) => /[a-z]/.test(v), label: "One lowercase letter" },
  { test: (v) => /\d/.test(v), label: "One number" },
  {
    test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v),
    label: "One special character",
  },
];

const initialFormData = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  dateOfBirth: "",
  employmentStatus: "",
  income: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useApi();

  const [formData, setFormData] = useState(initialFormData);
  const [consents, setConsents] = useState({
    essential: false,
    financialServices: false,
    marketing: false,
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConsentChange = (e) => {
    const { name, checked } = e.target;
    setConsents((prev) => ({ ...prev, [name]: checked }));
  };

  const failedPasswordRules = PASSWORD_RULES.filter(
    (rule) => !rule.test(formData.password),
  );

  const isAdult = (dob) => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    return birthDate <= eighteenYearsAgo;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (
      !USERNAME_PATTERN.test(formData.username) ||
      formData.username.length < 3
    ) {
      setError(
        "Username must be at least 3 characters and contain only letters, numbers, and underscores.",
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (failedPasswordRules.length > 0) {
      setError(
        `Password must include: ${failedPasswordRules.map((r) => r.label).join(", ")}.`,
      );
      return;
    }

    if (!isAdult(formData.dateOfBirth)) {
      setError("You must be at least 18 years old to register.");
      return;
    }

    if (!consents.essential || !consents.financialServices) {
      setError(
        "You must accept the essential and financial services consents to continue.",
      );
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        employmentStatus: formData.employmentStatus,
        ...(formData.income !== "" && { income: Number(formData.income) }),
        consents: {
          essential: consents.essential,
          financial_services: consents.financialServices,
          marketing: consents.marketing,
        },
      });
      // Registration requires email verification, so send the user to sign in.
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthLayout>
      <Typography component="h1" variant="h4" sx={{ mb: 0.5 }}>
        Sign up
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 3 }}>
        Create an account to borrow or lend in minutes.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          autoComplete="username"
          autoFocus
          helperText="3-30 characters: letters, numbers, and underscores only"
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            autoComplete="given-name"
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            autoComplete="family-name"
          />
        </Box>

        <TextField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          autoComplete="email"
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            autoComplete="tel"
            placeholder="+1 555 123 4567"
          />
          <TextField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <FormControl fullWidth required margin="normal">
          <InputLabel id="employment-status-label">
            Employment Status
          </InputLabel>
          <Select
            labelId="employment-status-label"
            label="Employment Status"
            name="employmentStatus"
            value={formData.employmentStatus}
            onChange={handleChange}
          >
            {EMPLOYMENT_STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Annual Income (optional)"
          name="income"
          type="number"
          value={formData.income}
          onChange={handleChange}
          fullWidth
          margin="normal"
          inputProps={{ min: 0 }}
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          autoComplete="new-password"
          helperText="8+ characters with uppercase, lowercase, a number, and a special character"
        />
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          autoComplete="new-password"
        />

        <FormControl required margin="normal" component="fieldset">
          <FormControlLabel
            control={
              <Checkbox
                name="essential"
                checked={consents.essential}
                onChange={handleConsentChange}
              />
            }
            label="I agree to the Terms of Service and essential data processing (required)"
          />
          <FormControlLabel
            control={
              <Checkbox
                name="financialServices"
                checked={consents.financialServices}
                onChange={handleConsentChange}
              />
            }
            label="I consent to credit checks and financial services processing (required)"
          />
          <FormControlLabel
            control={
              <Checkbox
                name="marketing"
                checked={consents.marketing}
                onChange={handleConsentChange}
              />
            }
            label="I'd like to receive product updates and offers (optional)"
          />
          <FormHelperText>
            Required consents are needed to create your account.
          </FormHelperText>
        </FormControl>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Sign Up"}
        </Button>

        <Typography
          variant="body2"
          sx={{ color: "text.secondary", textAlign: "center" }}
        >
          <RouterLink to="/login">Already have an account? Sign in</RouterLink>
        </Typography>
      </form>
    </AuthLayout>
  );
};

export default Register;
