import { css } from "@emotion/css";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import { useQuery } from "@tanstack/react-query";

import Poll from "./Poll";
import { getAllPolls } from "../services/apiPolls";
import { useAuthContext } from "../context/AuthContext";

function AllPolls() {
  const { userId } = useAuthContext();

  const {
    isPending,
    isError,
    data: pollsFromDB,
  } = useQuery({
    queryKey: ["polls"],
    queryFn: getAllPolls,
  });

  if (isPending) {
    return (
      <Box
        key={"isPending"}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={100} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        key={"error"}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "90vh",
        }}
      >
        <h1
          className={css`
            font-size: 32px;
          `}
        >
          Something went wrong. Please try again later.
        </h1>
      </Box>
    );
  }

  return (
    <div
      className={css`
        margin-left: 20px;
        margin-top: 10px;
        z-index: 10;
      `}
    >
      <h1>All Polls</h1>
      <p>Cast your vote and see real-time results</p>
      <Grid container columns={16} spacing={4}>
        {pollsFromDB?.data?.map((el) => (
          <Grid size={5}>
            <Poll
              question={el.question}
              options={el.options}
              key={el.id}
              byMe={userId && el.user_id === userId}
              pollId={el.id}
            ></Poll>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default AllPolls;
