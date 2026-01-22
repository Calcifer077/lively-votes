import { useQuery } from "@tanstack/react-query";
import { getPollsUserHaveVotedIn as getPollsUserHaveVotedInApi } from "../../services/apiUser";

export function useGetPollsUserHaveVotedIn() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pollsUserHaveVotedIn"],
    queryFn: getPollsUserHaveVotedInApi,
  });

  if (isLoading) {
    return { pollsUserHaveVotedIn: [], isLoading, isError, error };
  }

  const pollsUserHaveVotedIn = data.data;

  return { pollsUserHaveVotedIn, isLoading, isError, error };
}
