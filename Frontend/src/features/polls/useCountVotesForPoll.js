import { useQuery } from "@tanstack/react-query";
import { countVotesForPoll } from "../../services/apiPolls";

export function useCountVotesForPoll(pollId) {
  const {
    data: optionsWithVoteCount,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["countVotesForPoll", pollId],
    queryFn: () => countVotesForPoll(pollId),
  });

  if (isLoading) {
    return { optionsWithVoteCount: [], isLoading, isError, error };
  }

  return { optionsWithVoteCount, isLoading, isError, error };
}
