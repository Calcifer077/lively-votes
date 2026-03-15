import { useMutation } from "@tanstack/react-query";
import { forgotPassword as forgotPasswordApi } from "../../services/apiAuthentication";
import toast from "react-hot-toast";

export function useForgotPassword() {
  const {
    mutateAsync: forgotPassword,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: () => {
      toast.success("A email with reset password link has been sent to you");
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  return { forgotPassword, isLoading, isError, error };
}
