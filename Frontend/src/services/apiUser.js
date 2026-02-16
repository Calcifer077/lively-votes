export const getProfileData = async function (axiosInstance) {
  const res = await axiosInstance({
    url: `/users/getUserData`,
    method: "get",
  });

  if (res.data.status === "success") {
    return res.data.data;
  }
  return [];
};

export const getPollsUserHaveVotedIn = async function (axiosInstance) {
  const res = await axiosInstance({
    url: "/users/getPollsUserHaveVotedIn",
    method: "get",
  });

  if (res.data.status === "success") {
    return res.data.data;
  }

  return [];
};
