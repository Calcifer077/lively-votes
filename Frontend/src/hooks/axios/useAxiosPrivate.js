import { useEffect } from "react";
import { useNavigate } from "react-router";

import { AxiosInstance } from "../../services/apiConfig";
import {
  useAuthContext,
  useAuthContextDispatch,
} from "../../context/AuthContext";

// How it works?
// In the earlier version we used refresh token interceptors in apiConfig file.
// But we needed to also access react features (hooks) only setting localstorage wouldn't work.
// So we created this custom hook. so that we can access react features (like navigate from react-router, dispatch function, context).
// We took the original version of axios which is still responsible for making request and added interceptors to it.
// There are basically two types of interceptors, one for request and one for response.
// Request is attached before every request and response works after we get some kind of response.
// Before making request we add jwt from context api, which is required for most requests.
// In case of 401 error which means that the token has expired, we will try to refetch the token using refresh token stored in cookies.
// Token will be used by backend from cookies on its own, we don't have to do anything.
// In case of any other errors user will be navigated to login page.

// Now there is a problem with our api.
// All the api which connects to the backend are not custom hooks, but if they need to use the functinalities of this hook, they will have to use useAxiosPrivate.
// To achieve this we will pass useAxiosPrivate hook in their parameters.
// All the api functions are called by tanstack query, so we can simply pass useAxiosPrivate hook in their parameters.

// Everything except login, signup use this hook, so in those cases we will just use the original axios instance.

export function useAxiosPrivate() {
  const navigate = useNavigate();
  const { jwt } = useAuthContext();
  const dispatch = useAuthContextDispatch();

  useEffect(() => {
    const requestIntercept = AxiosInstance.interceptors.request.use(
      (config) => {
        if (jwt) {
          config.headers.authorization = `Bearer ${jwt}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseIntercept = AxiosInstance.interceptors.response.use(
      (response) => response,

      async (error) => {
        const originalRequest = error?.config;

        // Not 401 or already tried refresh -> regject immediately
        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;
        originalRequest.sent = true;

        try {
          // Try to refresh → backend will set new refresh cookie + return new access token
          const response = await AxiosInstance.get("users/refresh");

          if (response.data.status === "success") {
            const newUser = {
              id: response.data.data.user.id,
              jwt: response.data.accessToken,
              email: response.data.data.user.email,
            };

            dispatch({
              type: "login",
              id: newUser.id,
              jwt: newUser.jwt,
              email: newUser.email,
            });

            originalRequest.headers.authorization = `Bearer ${newUser.jwt}`;

            // Refresh succeeded → retry original request (cookie + new access token should work)
            return AxiosInstance(originalRequest);
          } else {
            return Promise.reject(error);
          }
        } catch (refreshError) {
          console.warn("Refresh token failed -> logging out");

          dispatch({
            type: "logout",
          });

          // localStorage.removeItem("jwt");
          navigate("/login");

          return Promise.reject(refreshError);
        }
      },
    );

    return () => {
      AxiosInstance.interceptors.request.eject(requestIntercept);
      AxiosInstance.interceptors.response.eject(responseIntercept);
    };
  }, [dispatch, navigate, jwt]);

  return AxiosInstance;
}
