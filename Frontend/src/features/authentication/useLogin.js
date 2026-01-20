import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { loginUser as loginUserApi } from "../../services/apiAuthentication";

export function useLogin() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: loginUser,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: loginUserApi,
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);

      toast.success("Successfull login");
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  return { loginUser, isLoading, isError, error };
}
