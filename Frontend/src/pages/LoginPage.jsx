import React, { useState } from "react";
import { useNavigate } from "react-router";

import { Box, Button, Typography, Link, Paper } from "@mui/material";
import TextField from "../ui/TextField";

import { useAuthContextDispatch } from "../context/AuthContext";
import { useLogin } from "../hooks/authentication/useLogin.js";

export default function LoginPage() {
  // for navigation
  const navigate = useNavigate();

  const dispatch = useAuthContextDispatch();

  const { loginUser, isLoading } = useLogin();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // This functio is responsible for sending data to the backend. If looked from the broader perspective
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError(true);
      return;
    }

    try {
      // 'loginUser' is function given to us by 'useLogin' (a custom hook made using tanstack query).
      const data = await loginUser(form);

      // To store the state locally
      dispatch({
        type: "login",
        id: data.id,
        jwt: data.jwt,
        email: data.email,
      });

      // go to homepage after successfull login.
      navigate("/");

      // If there is any error in the request that error will be provided to us by tanstack query. basically axios will give that error and we can get it using tanstack query.
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),
                     radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
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
          Login
        </Typography>

        <form onSubmit={handleSubmit}>
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
            Login
          </Button>

          <Typography textAlign="center" mt={2}>
            Don't have an account?{" "}
            <Link underline="hover" onClick={() => navigate("/signup")}>
              Sign Up
            </Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}
