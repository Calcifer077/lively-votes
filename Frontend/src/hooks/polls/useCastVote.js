import toast from "react-hot-toast";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { castVote as castVoteApi } from "./../../services/apiPolls";

export function useCastVote() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: castVote,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: castVoteApi,

    // 1. optimistic update - happens before API call
    async onMutate(variables) {
      // 1. Cancel any ongoing refetches
      await queryClient.cancelQueries({
        queryKey: ["whichOptionVoted", variables.pollId],
      });
      await queryClient.cancelQueries({
        queryKey: ["countVotesForPoll", variables.pollId],
      });

      // 2. Snapshot previous values (for rollback in case of error)
      const previousVoted = queryClient.getQueryData([
        "whichOptionVoted",
        variables.pollId,
      ]);
      const previousCounts = queryClient.getQueryData([
        "countVotesForPoll",
        variables.pollId,
      ]);

      // 3. Optimistically update "which option voted"
      queryClient.setQueryData(
        ["whichOptionVoted", variables.pollId],
        variables.optionId,
      );

      // 4. Optimistically update "count votes for poll"
      queryClient.setQueryData(
        ["countVotesForPoll", variables.pollId],
        (old) => {
          if (!old) return old;

          return old.map((opt) =>
            opt.optionId === variables.optionId
              ? { ...opt, voteCount: (opt.voteCount || 0) + 1 }
              : opt,
          );
        },
      );

      return { previousVoted, previousCounts };
    },

    // 2. If mutation fails -> rollback
    onError: (err, variables, context) => {
      if (context?.previousVoted) {
        queryClient.setQueryData(
          ["whichOptionVoted", variables.pollId],
          context.previousVoted,
        );
      }

      if (context?.previousCounts) {
        queryClient.setQueryData(
          ["countVotesForPoll", variables.pollId],
          context.previousCounts,
        );
      }
      toast.error("Failed to cast vote. Please try again.");
    },

    // 3. After success -> replace optimistic data with real server data
    onSuccess: (realResponse, variables) => {
      toast.success("Vote cast successfully");

      queryClient.invalidateQueries({
        queryKey: ["whichOptionVoted", variables.pollId],
      });
      queryClient.invalidateQueries({
        queryKey: ["countVotesForPoll", variables.pollId],
      });
    },
  });

  return { castVote, isLoading, isError, error };
}
