import { io } from "socket.io-client";

let BASEURL = "";

if (import.meta.env.DEV) {
  BASEURL = import.meta.env.VITE_URL_WHEN_DEV;
} else {
  BASEURL = import.meta.env.VITE_URL_WHEN_PROD;
}

export const socket = io(BASEURL, {
  withCredentials: true,
  autoConnect: false,
});
