import { AppBar, Box, Toolbar, Typography, Stack, Button } from "@mui/material";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import { useNavigate } from "react-router";

import NavbarButton from "./NavbarButton";
import { useAuthContext } from "../context/AuthContext";

export default function ButtonAppBar() {
  const navigate = useNavigate();

  const { userId } = useAuthContext();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{ backgroundColor: "var(--light-gray)", color: "var(--dark-gray)" }}
      >
        <Toolbar>
          <QueryStatsIcon
            sx={{
              mr: 2,
              padding: "10px",
              fontSize: "40px",
              backgroundColor: "var(--active-indigo)",
              color: "var(--light-gray)",
              borderRadius: "8px",
            }}
          />
          <Typography
            component="div"
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2>Live Polls</h2>
            <p>Real-time voting</p>
          </Typography>

          {/* Buttons group */}
          <Stack direction="row" spacing={2}>
            {userId && (
              <NavbarButton onClick={() => navigate("/")}>
                All Polls
              </NavbarButton>
            )}
            {userId && <NavbarButton>My Votes</NavbarButton>}
            {userId && (
              <NavbarButton onClick={() => navigate("/createPoll")}>
                Create Poll
              </NavbarButton>
            )}
            {userId && <NavbarButton>My Profile</NavbarButton>}

            {!userId && (
              <NavbarButton onClick={() => navigate("/signup")}>
                Sign up
              </NavbarButton>
            )}

            {!userId && (
              <NavbarButton onClick={() => navigate("/login")}>
                Login
              </NavbarButton>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
