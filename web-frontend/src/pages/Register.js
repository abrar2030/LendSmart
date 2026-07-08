import {
  Alert,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useApi } from "../contexts/ApiContext";
import AuthLayout from "../components/layout/AuthLayout";

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error: apiError } = useApi();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
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

      {(error || apiError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || apiError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          autoComplete="name"
          autoFocus
        />
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
        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          required
          InputLabelProps={{ required: false }}
          margin="normal"
          autoComplete="new-password"
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
