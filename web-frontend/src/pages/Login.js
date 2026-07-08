import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useApi } from "../contexts/ApiContext";
import AuthLayout from "../components/layout/AuthLayout";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error: apiError } = useApi();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthLayout>
      <Typography component="h1" variant="h4" sx={{ mb: 0.5 }}>
        Sign in
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 3 }}>
        Welcome back. Pick up where you left off.
      </Typography>

      {(error || apiError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || apiError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
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
          autoFocus
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
          autoComplete="current-password"
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <RouterLink to="/" style={{ fontSize: "0.875rem" }}>
            Forgot password?
          </RouterLink>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Sign In"}
        </Button>

        <Typography
          variant="body2"
          sx={{ color: "text.secondary", textAlign: "center" }}
        >
          <RouterLink to="/register">Don't have an account? Sign Up</RouterLink>
        </Typography>
      </form>
    </AuthLayout>
  );
};

export default Login;
