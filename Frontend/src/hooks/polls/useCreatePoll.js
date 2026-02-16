import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAxiosPrivate } from "../axios/useAxiosPrivate";
import { createPoll as createPollApi } from "../../services/apiPolls";

export function useCreatePoll() {
  const queryClient = useQueryClient();
  const axiosInstance = useAxiosPrivate();

  const {
    mutateAsync: createPoll,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: () => createPollApi(axiosInstance),
    onSuccess: () => {
      queryClient.invalidateQueries(["polls"]);

      toast.success("Poll created successfully");
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.response.data.message);
    },
  });

  return { createPoll, isLoading, isError, error };
}
