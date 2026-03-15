import { useMutation } from "@tanstack/react-query";
import { resetPassword as resetPasswordApi } from "../../services/apiAuthentication";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export function useResetPassword() {
  const navigate = useNavigate();

  const {
    mutateAsync: resetPassword,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => {
      toast.success("Password reset successfully");

      navigate("/login");
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  return { resetPassword, isLoading, isError, error };
}
