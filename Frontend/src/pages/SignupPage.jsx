import { useState } from "react";
import { useNavigate } from "react-router";

import { Box, Button, Typography, Link, Paper } from "@mui/material";

import TextField from "../ui/TextField";
import { useSignup } from "../hooks/authentication/useSignup";
import { useAuthContextDispatch } from "../context/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();

  const dispatch = useAuthContextDispatch();

  const { signupUser, isLoading } = useSignup();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError(true);
      return;
    }

    try {
      const data = await signupUser(form);

      dispatch({
        type: "login",
        id: data.id,
        jwt: data.jwt,
        email: data.email,
      });

      navigate("/");
    } catch (err) {
      console.log(err);
    }

    setError(false);
    console.log("Signup submitted:", form);
    // TODO: connect to backend or Firebase
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: 400,
          borderRadius: 3,
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography variant="h5" fontWeight={600} textAlign="center" mb={3}>
          Sign Up
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            name="name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={handleChange}
            error={error && !form.name}
            helperText={error && !form.name ? "Name is required" : ""}
          />

          <TextField
            label="Email"
            name="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={handleChange}
            error={error && !form.email}
            helperText={error && !form.email ? "Email is required" : ""}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange}
            error={error && !form.password}
            helperText={error && !form.password ? "Password is required" : ""}
          />

          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            margin="normal"
            value={form.confirmPassword}
            onChange={handleChange}
            error={error && form.password !== form.confirmPassword}
            helperText={
              error && form.password !== form.confirmPassword
                ? "Passwords do not match"
                : ""
            }
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            fullWidth
            sx={{
              mt: 2,
              py: 1.2,
              backgroundColor: "var(--active-indigo)",
              color: "#fff",
              textTransform: "capitalize",
              fontWeight: 900,
              "&:hover": {
                backgroundColor: "var(--hover-indigo)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Sign Up
          </Button>

          <Typography textAlign="center" mt={2}>
            Already have an account?{" "}
            <Link underline="hover" onClick={() => navigate("/login")}>
              Log In
            </Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}
