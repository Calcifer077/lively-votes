import { useState } from "react";
import { css } from "@emotion/css";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Typography, Box, Stack, Button } from "@mui/material";
import TextField from "../ui/TextField";
import { useCreatePoll } from "../features/polls/useCreatePoll";
import toast from "react-hot-toast";

export default function CreatePoll() {
  const { createPoll, isLoading } = useCreatePoll();

  // By default only 3 things are required, formQuestion and 2 options, if the user adds any more options and leave them blank, than we will just ignore those options.

  // For question
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollQuestionError, setPollQuestionError] = useState(false);

  // For options
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollOptionsError, setPollOptionsError] = useState([false, false]);

  const handleChange = (index, value) => {
    const newPollOptions = [...pollOptions];
    newPollOptions[index] = value;

    setPollOptions(newPollOptions);

    if (index < 2) {
      const newPollOptionsErrors = [...pollOptionsError];
      newPollOptionsErrors[index] = value.trim() === "";
      setPollOptionsError(newPollOptionsErrors);
    }
  };

  const addOption = () => {
    setPollOptions([...pollOptions, ""]);
    setPollOptionsError[[...pollOptionsError, false]];
  };

  // const removeOption = (index) => {
  //   if (index > 2) return;
  //   const newPollOptions = pollOptions.filter((_, i) => i !== index);
  //   const newPollOptionsErrors = pollOptionsError.filter((_, i) => i !== index);

  //   setPollOptions(newPollOptions);
  //   setPollOptionsError(newPollOptionsErrors);
  // };

  // This does form validation
  async function handleSubmit() {
    if (pollQuestion.trim() === "") {
      setPollQuestionError(true);
      toast.error("Please fill out the poll question.");
      return;
    } else {
      setPollQuestionError(false);
    }

    const newPollOptionsErrors = pollOptionsError.map(
      (err, i) => i < 2 && pollOptions[i].trim() === "",
    );

    if (newPollOptionsErrors.some((err) => err)) {
      toast.error("Please fill out the first two options.");
      return;
    }

    const dataToSubmit = {
      question: pollQuestion,
      // don't submit any empty options
      options: pollOptions.filter((option) => option.trim() !== ""),
    };

    await createPoll(dataToSubmit);
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
      <Typography
        variant="h4"
        component="h1"
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <AutoAwesomeIcon color="primary" />
        Create New Poll
      </Typography>
      <p
        className={css`
          color: var(--medium-gray);
        `}
      >
        Set up a new poll for others to vote on
      </p>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          border: "1px solid var(--lighter-purple)",
          margin: "20px auto",
          marginBottom: "40px",
          p: 4,
          backgroundColor: "var(--light-gray)",
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Poll Question
        </Typography>
        <TextField
          label="What would you like to ask?"
          variant="outlined"
          disabled={isLoading}
          required
          // Making controlled elements
          value={pollQuestion}
          onChange={(e) => setPollQuestion(e.target.value)}
          // Error handling
          error={pollQuestionError}
          helperText={pollQuestionError ? "This field is required" : ""}
        />

        <Typography
          variant="h5"
          component="h3"
          gutterBottom
          sx={{ marginTop: 1 }}
        >
          Options
        </Typography>
        <Stack spacing={3}>
          {/* Below is 'sx' we have used a custom colors for borders. */}

          {pollOptions.map((option, index) => (
            <TextField
              label={`Option ${index + 1}`}
              variant="outlined"
              disabled={isLoading}
              value={option}
              onChange={(e) => handleChange(index, e.target.value)}
              error={pollOptionsError[index]}
              helperText={
                pollOptionsError[index] ? "This field is requierd" : ""
              }
              key={index}
            />
          ))}
          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={addOption}
            disabled={isLoading}
            variant="outlined"
            sx={{
              alignSelf: "flex-start",
              textTransform: "capitalize",
              borderColor: "var(--lighter-purple)",
              color: "var(--text-gray)",
              "&:hover": {
                borderColor: "var(--hover-indigo)",
                color: "var(--hover-indigo)",
              },
            }}
          >
            Add another option
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading}
            sx={{
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
            Create Poll
          </Button>
        </Stack>
      </Box>
    </div>
  );
}
