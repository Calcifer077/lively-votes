import { io } from "socket.io-client";

export const socket = io("https://lively-votes.onrender.com", {
  withCredentials: true,
  autoConnect: false,
});
