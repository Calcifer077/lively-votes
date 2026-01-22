import { AxiosInstance } from "./apiConfig";

export const getProfileData = async function () {
  const res = await AxiosInstance({
    url: `/users/getUserData`,
    method: "get",
  });

  if (res.data.status === "success") {
    return res.data.data;
  }
  return [];
};
