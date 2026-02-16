import { css } from "@emotion/css";

import { useNavigate } from "react-router";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DoneIcon from "@mui/icons-material/Done";
import { CircularProgress, Tooltip } from "@mui/material";

import { useCastVote } from "../hooks/polls/useCastVote";
import { useWhichOptionVoted } from "../hooks/polls/useWhichOptionVoted";
import { useCountVotesForPoll } from "../hooks/polls/useCountVotesForPoll";
import { useAxiosPrivate } from "../hooks/axios/useAxiosPrivate";

function Poll({ poll, options, byMe, pollId, isLoggedIn }) {
  const axiosInstance = useAxiosPrivate();

  const navigate = useNavigate();

  const { castVote } = useCastVote();

  const { optionId, isLoadingOptionId } = useWhichOptionVoted(pollId);

  const { optionsWithVoteCount, isLoadingOptionsWithVoteCount } =
    useCountVotesForPoll(pollId);

  const showProgress = byMe || optionId !== 0;

  const totalVotes = optionsWithVoteCount.reduce(
    (acc, curr) => acc + curr.voteCount,
    0,
  );

  const overlayWidths = totalVotes
    ? optionsWithVoteCount.map((el) => (el.voteCount / totalVotes) * 100)
    : options.map(() => 0);

  const toolTipTitle = isLoggedIn ? "" : "Login to vote";

  // Responsbile for casting vote
  async function handleCastVote(optionId) {
    // tanstack query only accepts one argument and than passes it to corresponding api function.
    await castVote({ axiosInstance, pollId, optionId });

    // will refetch data and rerender the component
    // queryClient.invalidateQueries({ queryKey: ["whichOptionVoted", pollId] });
    // queryClient.invalidateQueries({ queryKey: ["countVotesForPoll", pollId] });
  }

  // Responsible for redirecting to the poll
  function handleClick(e) {
    // will not redirect, when clicking on a button
    if (e.target.closest("button")) {
      return;
    }

    navigate(`/poll/${pollId}`);
  }

  return (
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
      onClick={(e) => handleClick(e)}
    >
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
        <span>{poll.question}</span>

        {byMe && <Button size="sm">By Me</Button>}
      </Typography>

      <div
        className={css`
          display: flex;
          flex-direction: column;
          /* align-items: start; */
          gap: 10px;
        `}
      >
        {isLoadingOptionsWithVoteCount && <CircularProgress />}
        {!isLoadingOptionId &&
          options.map((el, index) => (
            <div
              className={css`
                position: relative;
                width: 100%;
              `}
            >
              <Tooltip title={toolTipTitle}>
                <span>
                  <Button
                    key={index}
                    sx={{
                      display:
                        showProgress || isLoadingOptionsWithVoteCount
                          ? "block"
                          : "none",
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
                      isLoadingOptionId ||
                      el.id === optionId
                    }
                    startIcon={el.id === optionId ? <DoneIcon /> : null}
                    key={el.id}
                    onClick={() => handleCastVote(el.id)}
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
                        {!isLoadingOptionsWithVoteCount &&
                          optionsWithVoteCount[index]?.voteCount}
                      </span>
                    )}
                  </Button>
                </span>
              </Tooltip>
            </div>
          ))}
      </div>

      {showProgress && (
        <Typography
          sx={{ fontSize: "14px", textAlign: "center", marginTop: "10px" }}
        >
          Total Votes: {totalVotes}
        </Typography>
      )}
    </div>
  );
}

export default Poll;
