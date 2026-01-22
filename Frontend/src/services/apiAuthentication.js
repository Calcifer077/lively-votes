import { AxiosInstance } from "./apiConfig.js";

export const loginUser = async function (data) {
  const { email, password } = data;

  const res = await AxiosInstance({
    url: "/users/login",
    method: "post",
    data: { email, password },
  });

  if (res.data.status === "success") {
    const newUser = {
      id: res.data.data.user.id,
      jwt: res.data.token,
      email: res.data.data.user.email,
    };

    localStorage.setItem("jwt", res.data.token);

    return newUser;
  }

  return null;
};

export const signupUser = async function (data) {
  const { name, email, password } = data;

  const res = await AxiosInstance({
    url: "/users/signup",
    method: "post",
    data: {
      name,
      email,
      password,
    },
  });

  if (res.data.status === "success") {
    const newUser = {
      id: res.data.data.user.id,
      jwt: res.data.token,
      email: res.data.data.user.email,
    };

    localStorage.setItem("jwt", res.data.token);

    return newUser;
  }

  return null;
};

export const logoutUser = async function () {
  localStorage.setItem("jwt", null);

  const res = await AxiosInstance({
    url: "/users/logout",
    method: "get",
  });

  if (res.data.status === "success") {
    return true;
  }

  return false;
};
