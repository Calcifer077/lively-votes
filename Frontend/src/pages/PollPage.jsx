import { css } from "@emotion/css";
import {
  Box,
  Button,
  CircularProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DoneIcon from "@mui/icons-material/Done";
import toast from "react-hot-toast";

import { useAuthContext } from "../context/AuthContext";
import { useGetPollById } from "../hooks/polls/useGetPollById";
import { useParams } from "react-router";
import Poll from "../components/Poll";
import { Suspense } from "react";

function PollPage() {
  // To check if the user is logged in or not.
  const { userId } = useAuthContext();

  // To get poll data, pollId will be passed as a query param, meaning custom hook will get it in its own function through url
  const { data: pollData, isLoading: isLoadingPollData } = useGetPollById();
  const { pollId } = useParams();

  // the user can only vote if he is logged in
  const isLoggedIn = !!userId;

  const byMe = !isLoggedIn ? false : pollData?.userId === userId;

  // handles sharing of poll, just copies the link to clipboard.
  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard.");
    } catch (err) {
      console.error(err);
      toast.error("Something wen twrong. Please try again.");
    }
  }

  return (
    <div
      className={css`
        margin: auto;
        margin-top: 32px;
        max-width: 700px;
        padding: 16px;
      `}
    >
      <div
        className={css`
          transition: all 0.4s ease;

          &:hover {
            box-shadow:
              rgba(100, 100, 111, 0.15) 0px 7px 29px 0px,
              rgba(196, 163, 255, 0.4) 0px 0px 20px 6px;
          }
        `}
      >
        {isLoadingPollData && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress size={100} />
          </Box>
        )}
        {!isLoadingPollData && (
          <Poll
            poll={pollData.poll}
            options={pollData.options}
            byMe={byMe}
            pollId={pollId}
            isLoggedIn={isLoggedIn}
          />
        )}
      </div>

      <Box
        sx={{
          width: "50%",
          margin: "auto",
          marginTop: "16px",
          position: "relative",
          borderRadius: "4px",
          backgroundColor: "var(--white)",

          "&:hover": {
            backgroundColor: "var(--light-gray)",
          },
          "&:hover .icon": {
            opacity: 1,
            transform: "translateY(0)",
          },
          transition: "all 2s ease",
        }}
        onClick={handleShare}
      >
        <Button
          variant="outlined"
          sx={{
            width: "100%",
            color: "var(--text-gray)",
            borderColor: "var(--light-purple)",
          }}
        >
          share
        </Button>
        <Box
          className="icon"
          sx={{
            position: "absolute",
            right: 8,
            top: 4,
            cursor: "pointer",

            opacity: 0,
            transform: "translateY(6px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          <SendIcon />
        </Box>
      </Box>
    </div>
  );
}

export default PollPage;
