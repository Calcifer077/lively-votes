import React, { useState } from "react";
import { Box, Paper, Typography, Button, Stack, Alert } from "@mui/material";

import TextField from "../ui/TextField";
import { useForgotPassword } from "../hooks/authentication/useForgotPassword";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const { forgotPassword, isLoading } = useForgotPassword();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await forgotPassword(email);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 420,
          width: "100%",
          p: 5,
          borderRadius: 3,
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <Stack spacing={3}>
          <Box textAlign="center">
            <Typography variant="h5" fontWeight={600}>
              Forgot Password
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Enter your email and we'll send you a reset link.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                loading={isLoading}
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  backgroundColor: "var(--active-indigo)",
                  "&:hover": {
                    backgroundColor: "var(--hover-indigo)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Send Reset Link
              </Button>
            </Stack>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
          >
            We'll send a secure link to reset your password.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
