import { useQuery } from "@tanstack/react-query";

import { useAxiosPrivate } from "../axios/useAxiosPrivate";
import { countVotesForPoll as countVotesForPollApi } from "../../services/apiPolls";

// returns a array which contains votes for each option.
// doesn't depend if the user is logged in or not.
export function useCountVotesForPoll(pollId) {
  const axiosInstance = useAxiosPrivate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["countVotesForPoll", pollId],
    queryFn: () => countVotesForPollApi(axiosInstance, pollId),
  });

  if (isLoading) {
    return { optionsWithVoteCount: [], isLoading, isError, error };
  }

  return { optionsWithVoteCount: data || [], isLoading, isError, error };
}
