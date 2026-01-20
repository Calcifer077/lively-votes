import { useQuery } from "@tanstack/react-query";
import { whichOptionVoted } from "../../services/apiPolls";

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
