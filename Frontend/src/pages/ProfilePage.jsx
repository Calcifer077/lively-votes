import { css } from "@emotion/css";
import { Avatar, Box, Button, Divider, Grid, Typography } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DoneIcon from "@mui/icons-material/Done";
import CreateIcon from "@mui/icons-material/Create";

function ProfilePage() {
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
              <Typography variant="h6">ID, name</Typography>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
            </Box>
          </Box>

          {/* Logout Button */}
          <Button variant="contained" color="error">
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
              0
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
              0
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

        {/* <Grid container columns={10} spacing={4}>
          <Grid size={5}>
            <Poll
              question="This is a test"
              options={options}
              byMe={true}
            ></Poll>
          </Grid>

          <Grid size={5}>
            <Poll
              question="This is a test"
              options={options}
              byMe={true}
            ></Poll>
          </Grid>
        </Grid> */}
      </Box>
    </div>
  );
}

export default ProfilePage;
