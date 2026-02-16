import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import { logoutUser } from "../../services/apiAuthentication";

export function useLogout() {
  const {
    mutateAsync: logout,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      toast.success("Successfully logged out");
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  return { logout, isLoading, isError, error };
}
