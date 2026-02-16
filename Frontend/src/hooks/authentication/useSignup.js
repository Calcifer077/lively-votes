import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signupUser as signupUserApi } from "../../services/apiAuthentication";

export function useSignup() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: signupUser,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: signupUserApi,
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);

      toast.success("Successful signup");
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  return { signupUser, isLoading, isError, error };
}
