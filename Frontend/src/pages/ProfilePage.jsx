import { css } from "@emotion/css";
import { useNavigate } from "react-router";

import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DoneIcon from "@mui/icons-material/Done";
import CreateIcon from "@mui/icons-material/Create";

import { useGetProfileData } from "../hooks/profile/useGetProfileData";
import { useLogout } from "../hooks/authentication/useLogout";
import { useAuthContext, useAuthContextDispatch } from "../context/AuthContext";
import { useGetPollsUserHaveVotedIn } from "../hooks/profile/useGetPollsUserHaveVotedIn";

import Poll from "../components/Poll";

function ProfilePage() {
  const { userId } = useAuthContext();

  const navigate = useNavigate();

  const { data: profileData } = useGetProfileData();
  const { logout, isLoading: isLoadingLogout } = useLogout();
  const { pollsUserHaveVotedIn, isLoading: isLoadingPollsUserHaveVotedIn } =
    useGetPollsUserHaveVotedIn();

  const dispatch = useAuthContextDispatch();

  async function handleLogout() {
    try {
      await logout();

      dispatch({
        type: "logout",
      });

      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div
      className={css`
        padding: 16px;
        margin: auto;
        max-width: 900px;
      `}
    >
      <Box
        sx={{
          marginTop: "32px",
          padding: "16px",
          backgroundColor: "var(--light-gray)",
          borderRadius: "8px",
        }}
      >
        {/* Profile Header */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
            }}
          >
            <Box>
              {/* Profile Info */}
              <AccountCircleIcon
                fontSize="large"
                sx={{ color: "var(--active-indigo)", width: 56, height: 56 }}
              />
            </Box>
            <Box>
              <Typography variant="h6">
                ID: {profileData?.user.id}, name: {profileData?.user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {profileData?.user.email}
              </Typography>
            </Box>
          </Box>

          {/* Logout Button */}
          <Button
            variant="contained"
            color="error"
            disabled={isLoadingLogout}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Profile Stats */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 4,
            marginTop: 4,
          }}
        >
          <Box
            sx={{
              padding: "18px",
              border: "1px solid var(--lighter-purple)",
              borderRadius: "8px",
              width: "50%",
              backgroundColor: "var(--lightest-purple)",
            }}
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              <Box>
                <CreateIcon />
              </Box>
              <Box>Total polls created</Box>
            </Typography>
            <Typography variant="h5" sx={{ marginTop: "6px" }}>
              {profileData?.pollsCreated}
            </Typography>
          </Box>
          <Box
            sx={{
              padding: "18px",
              border: "1px solid var(--lighter-purple)",
              borderRadius: "8px",
              width: "50%",
              backgroundColor: "var(--lightest-purple)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box>
                <DoneIcon />
              </Box>
              <Box>Polls participated in</Box>
            </Typography>
            <Typography variant="h5" sx={{ marginTop: "6px" }}>
              {profileData?.pollsParticipated}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Recent Activity */}
      <Box
        sx={{
          marginTop: "32px",
          padding: "16px",
          backgroundColor: "var(--light-gray)",
          borderRadius: "8px",
        }}
      >
        <Typography variant="h6">Recent Activity</Typography>

        {isLoadingPollsUserHaveVotedIn && <CircularProgress />}

        {!isLoadingPollsUserHaveVotedIn && (
          <Grid container columns={10} spacing={4}>
            {pollsUserHaveVotedIn?.map((el) => (
              <Grid size={5}>
                <Poll
                  poll={el}
                  options={el.options}
                  byMe={userId && el.user_id === userId}
                  pollId={el.pollId}
                  key={el.pollId}
                  isLoggedIn={true}
                ></Poll>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </div>
  );
}

export default ProfilePage;
