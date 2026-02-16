import { useQuery } from "@tanstack/react-query";

import { useAxiosPrivate } from "../axios/useAxiosPrivate";
import { getPollsUserHaveVotedIn as getPollsUserHaveVotedInApi } from "../../services/apiUser";

export function useGetPollsUserHaveVotedIn() {
  const axiosInstance = useAxiosPrivate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pollsUserHaveVotedIn"],
    queryFn: () => getPollsUserHaveVotedInApi(axiosInstance),
  });

  if (isLoading) {
    return { pollsUserHaveVotedIn: [], isLoading, isError, error };
  }

  const pollsUserHaveVotedIn = data.data;

  return { pollsUserHaveVotedIn, isLoading, isError, error };
}
