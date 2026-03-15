import toast from "react-hot-toast";
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
      jwt: res.data.accessToken,
      email: res.data.data.user.email,
    };

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
      jwt: res.data.accessToken,
      email: res.data.data.user.email,
    };

    localStorage.setItem("jwt", newUser.jwt);

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

export const forgotPassword = async function (email) {
  const res = await AxiosInstance({
    url: "/users/forgotPassword",
    method: "post",
    data: {
      email,
    },
  });

  if (res.data.status === "success") {
    toast.success("A email with reset password link has been sent to you");
  }

  return null;
};

export const resetPassword = async function ({
  password,
  access_token,
  refresh_token,
}) {
  const res = await AxiosInstance({
    url: "/users/resetPassword",
    method: "post",
    data: {
      password,
      access_token,
      refresh_token,
    },
  });

  if (res.data.status === "success") {
    return true;
  }

  return false;
};
