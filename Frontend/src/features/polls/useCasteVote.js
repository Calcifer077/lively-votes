import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { caseVote as caseVoteApi } from "../../services/apiPolls";

export function useCasteVote() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: casteVote,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: caseVoteApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });

      toast.success("Vote casted successfully");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to caste vote. Please try again.");
    },
  });

  return { casteVote, isLoading, isError, error };
}
