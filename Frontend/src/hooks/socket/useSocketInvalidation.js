import { useEffect } from "react";
import { socket } from "../../services/socket";
import { useQueryClient } from "@tanstack/react-query";

export function useSocketInvalidation() {
  const queryClient = useQueryClient();

  // Listening to events from backend.
  useEffect(() => {
    socket.on("votes:caste", (pollId) => {
      queryClient.invalidateQueries({
        queryKey: ["countVotesForPoll", pollId],
      });
    });

    return () => {
      socket.off("votes:caste");
    };
  }, [queryClient]);
}
