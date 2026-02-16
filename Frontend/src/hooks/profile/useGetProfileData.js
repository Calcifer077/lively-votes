import { useQuery } from "@tanstack/react-query";

import { getProfileData } from "../../services/apiUser";
import { useAxiosPrivate } from "../axios/useAxiosPrivate";

export function useGetProfileData() {
  const axiosInstance = useAxiosPrivate();
  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["getProfileData"],
    queryFn: () => getProfileData(axiosInstance),
  });

  const { data } = profileData || {}; // Destructure data from profileData

  return { data, isLoading, isError, error }; // Return destructured data
}
