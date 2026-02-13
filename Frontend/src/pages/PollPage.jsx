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
import { useCastVote } from "../hooks/polls/useCastVote";
import { useWhichOptionVoted } from "../hooks/polls/useWhichOptionVoted";
import { useAxiosPrivate } from "../hooks/axios/useAxiosPrivate";
import { useCountVotesForPoll } from "../hooks/polls/useCountVotesForPoll";
import { useParams } from "react-router";

function PollPage() {
  // To have the functionality of cast vote.
  const axiosInstance = useAxiosPrivate();
  // To check if the user is logged in or not.
  const { userId } = useAuthContext();
  // To get poll data, pollId will be passed as a query param, meaning custom hook will get it in its own function through url
  const { data: pollData, isLoading: isLoadingPollData } = useGetPollById();
  const { pollId } = useParams();

  // the user can only vote if he is logged in
  const isLoggedIn = !!userId;

  const toolTipTitle = isLoggedIn ? "" : "Login to vote";

  // function to cast vote
  const { castVote } = useCastVote();
  // get which option has been voted by user.
  const { optionId, isLoadingOptionId } = useWhichOptionVoted(pollId);

  const { optionsWithVoteCount, isLoadingOptionWithVoteCount } =
    useCountVotesForPoll(pollId);

  // When to show progress, when the user is not logged in, user have voted on this poll, or the poll was created by the currently logged in user.
  const showProgress =
    !isLoggedIn || optionId !== 0 || pollData?.poll.userId === userId;
  const byMe = pollData?.poll.userId === userId;

  const totalVotes = optionsWithVoteCount.reduce(
    (acc, curr) => acc + curr.voteCount,
    0,
  );

  const overlayWidths = totalVotes
    ? optionsWithVoteCount.map((el) => (el.voteCount / totalVotes) * 100)
    : (pollData?.options.map(() => 0) ?? []);

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

  // Responsible for handling of the casting of vote
  async function handleClick(optionId) {
    await castVote({ axiosInstance, pollId, optionId });
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
          border: 1.5px solid var(--light-purple);
          border-radius: 16px;
          /* max-width: 400px; */
          padding: 20px 16px 20px 16px;
          background-color: var(--white);
          transition: all 0.4s ease;

          &:hover {
            box-shadow:
              rgba(100, 100, 111, 0.15) 0px 7px 29px 0px,
              rgba(196, 163, 255, 0.4) 0px 0px 20px 6px;
          }
        `}
      >
        {isLoadingPollData ? (
          <>
            <Box
              key="loading"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress size={50} />
            </Box>
          </>
        ) : (
          <>
            <Typography
              variant="subtitle1"
              sx={{
                paddingBottom: "8px",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              {pollData?.poll.question}
            </Typography>

            <div
              className={css`
                display: flex;
                flex-direction: column;
                /* align-items: start; */
                gap: 10px;
              `}
            >
              {pollData?.options.map((el, index) => (
                <div
                  className={css`
                    position: relative;
                    width: 100%;
                  `}
                >
                  {/* 'Tooltip' doesn't work on disabled buttons, becuase mui sets 'pointer-events: none' */}
                  <Tooltip title={toolTipTitle} arrow>
                    <span>
                      <Button
                        key={index}
                        disabled={!isLoggedIn}
                        sx={{
                          display: showProgress ? "block" : "none",
                          position: "absolute",
                          width: `${overlayWidths[index] || 0}%`,
                          height: "100%",
                          top: 0,
                          left: 0,
                          zIndex: 0,
                          backgroundColor: "var(--lighter-purple)",
                        }}
                      ></Button>

                      <Button
                        variant="outlined"
                        disabled={
                          !isLoggedIn ||
                          byMe ||
                          el.id === optionId ||
                          isLoadingOptionId ||
                          isLoadingOptionWithVoteCount
                        }
                        startIcon={el.id === optionId ? <DoneIcon /> : null}
                        key={el.id}
                        onClick={() => handleClick(el.id)}
                        sx={{
                          width: "100%",
                          borderColor: "var(--lighter-purple)",
                          color: "var(--text-gray)",
                          textTransform: "capitalize",
                          position: "relative",
                          zIndex: 1,
                          // Below is needed to change position of text inside button as MUI button uses inline-flex as display. If you don't use it will just display it in the center.
                          // justifyContent: "flex-start",
                        }}
                      >
                        {el.text}

                        {showProgress && (
                          <span
                            className={css`
                              position: absolute;
                              right: 10px;
                            `}
                          >
                            {pollData.options[index]?.voteCount}
                          </span>
                        )}
                      </Button>
                    </span>
                  </Tooltip>
                </div>
              ))}
            </div>
          </>
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
