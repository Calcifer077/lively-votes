import { css } from "@emotion/css";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";

// import { useQuery } from "@tanstack/react-query";

import Poll from "./Poll";
// import { getAllPolls } from "../services/apiPolls";
import { useAuthContext } from "../context/AuthContext";
import { useGetPollsWithPagination } from "../hooks/polls/useGetPollsWithPagination";

function AllPolls() {
  // getting the currently logged in user
  const { userId } = useAuthContext();

  // will get inifinte data in paginated form
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useGetPollsWithPagination();

  function handleClick() {
    fetchNextPage();
  }

  if (status === "loading") {
    return (
      <Box
        key={"isFetching"}
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

  if (status === "error") {
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
        margin-bottom: 50px;
        z-index: 10;
      `}
    >
      <h1>All Polls</h1>
      <p>Cast your vote and see real-time results</p>
      <Grid container columns={16} spacing={4}>
        {/* Explanation of below two lines:
        How does useInfinitQuery retrun data:
        it returns something like this:
        data = {
          pages: [
            { data: [poll1, poll2, poll3] }, // page 1
            { data: [poll4, poll5, poll6] }, // page 2
            { data: [poll7, poll8] },        // page 3
          ],
          pageParams: [1, 2, 3]
        }
        each time a next page is fetched it creates a new data object inside pages, so we flat it out.
         */}

        {data?.pages.flatMap((page) =>
          page?.data.map((el) => (
            <Grid size={5}>
              <Poll
                poll={el}
                options={el.options}
                key={el.id}
                byMe={userId && el.user_id === userId}
                pollId={el.id}
                isLoggedIn={true}
              ></Poll>
            </Grid>
          )),
        )}
      </Grid>

      {hasNextPage && (
        <Button
          variant="outlined"
          disabled={isFetchingNextPage}
          onClick={handleClick}
          sx={{
            display: "block",
            margin: "auto",
            border: "1.5px solid var(--text-gray)",
            marginTop: "20px",
            paddingLeft: "30px",
            paddingRight: "30px",
            color: "var(--dark-gray)",
            "&:hover": {
              backgroundColor: "var(--hover-indigo)",
              color: "var(--light-gray)",
            },
            "&:active": {
              backgroundColor: "var(--active-indigo)",
              color: "var(--light-gray)",
            },
          }}
        >
          {isFetchingNextPage ? "Loading…" : "Load more"}
        </Button>
      )}
    </div>
  );
}

export default AllPolls;
