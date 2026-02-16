import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { socket } from "../../services/socket";

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
