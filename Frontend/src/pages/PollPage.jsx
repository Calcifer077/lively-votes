import { css } from "@emotion/css";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useGetPollById } from "../hooks/polls/useGetPollById";

function PollPage() {
  const { data: pollData, isLoading: isLoadingPollData } = useGetPollById();

  const showProgress = true;

  const totalVotes = pollData?.options.reduce(
    (acc, curr) => acc + curr.voteCount,
    0,
  );

  // If total votes exist than calculate percentage of each option, else it will be just 0.
  const overlayWidths = totalVotes
    ? pollData?.options.map((el) => (el.voteCount / totalVotes) * 100)
    : pollData?.options.map(() => 0);

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
                  <Button
                    key={index}
                    sx={{
                      display: "block",
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
                    // disabled={byMe || isLoadingOptionId || el.id === optionId}
                    // startIcon={el.id === optionId ? <DoneIcon /> : null}
                    key={el.id}
                    // onClick={() => handleClick(el.id)}
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
