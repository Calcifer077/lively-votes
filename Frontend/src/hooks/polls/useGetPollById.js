import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "../axios/useAxiosPrivate";
import { getPollById as getPollByIdApi } from "../../services/apiPolls";
import { useParams } from "react-router";

// gets poll by Id from the backend.
export const useGetPollById = function () {
  const axiosInstance = useAxiosPrivate();
  const { pollId } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pollWithId", pollId],
    queryFn: () => getPollByIdApi(axiosInstance, pollId),
  });

  return { data, isLoading, isError, error };
};
