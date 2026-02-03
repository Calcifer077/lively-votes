import { useQuery } from "@tanstack/react-query";
import { whichOptionVoted } from "../../services/apiPolls";

// returns the option id on which the user have voted for the given pollId
// only works if the user is logged in
// if the user is not logged in, returns 0
export const useWhichOptionVoted = function (pollId) {
  const {
    data: optionId,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["whichOptionVoted", pollId],
    queryFn: () => whichOptionVoted(pollId),
  });

  if (isLoading) {
    return { optionId: 0, isLoading, isError, error };
  }

  return { optionId, isLoading, isError, error };
};
