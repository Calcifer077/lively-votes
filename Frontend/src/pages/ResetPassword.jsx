import React, { useState } from "react";
import toast from "react-hot-toast";

import { Box, Paper, Typography, Button, Stack } from "@mui/material";

import TextField from "../ui/TextField";
import { useResetPassword } from "../hooks/authentication/useResetPassword";
// import { useAxiosPrivate } from "../hooks/axios/useAxiosPrivate";

export default function ResetPassword() {
  const { resetPassword, isLoading } = useResetPassword();

  // Getting access and refresh token from the URL as they are needed by the backend to perform updation of password.
  const hash = new URLSearchParams(window.location.hash.substring(1));
  const access_token = hash.get("access_token");
  const refresh_token = hash.get("refresh_token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    await resetPassword({ password, access_token, refresh_token });
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
              Reset your password
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Enter your new password below.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="New Password"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                loading={isLoading}
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
                Reset Password
              </Button>
            </Stack>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
          >
            If you didn’t request a password reset, you can safely ignore this
            page.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
