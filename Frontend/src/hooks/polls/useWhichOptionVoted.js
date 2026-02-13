import { useQuery } from "@tanstack/react-query";
import { whichOptionVoted } from "../../services/apiPolls";
import { useAxiosPrivate } from "../axios/useAxiosPrivate";
import { useAuthContext } from "../../context/AuthContext";

// returns the option id on which the user have voted for the given pollId
// only works if the user is logged in
// if the user is not logged in, returns 0
export const useWhichOptionVoted = function (pollId) {
  const axiosInstance = useAxiosPrivate();

  const { userId } = useAuthContext();

  const isLoggedIn = !!userId;

  const {
    data: optionId,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["whichOptionVoted", pollId],
    queryFn: () => whichOptionVoted(axiosInstance, pollId),
  });

  // If the user is not logged in.
  if (isLoading || !isLoggedIn) {
    return { optionId: 0, isLoading, isError, error };
  }

  return { optionId, isLoading, isError, error };
};
