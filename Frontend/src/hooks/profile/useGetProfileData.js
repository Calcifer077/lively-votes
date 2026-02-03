import { getProfileData } from "../../services/apiUser";
import { useQuery } from "@tanstack/react-query";

export function useGetProfileData() {
  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["getProfileData"],
    queryFn: () => getProfileData(),
  });

  const { data } = profileData || {}; // Destructure data from profileData

  return { data, isLoading, isError, error }; // Return destructured data
}
