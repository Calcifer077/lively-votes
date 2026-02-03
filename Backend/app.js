import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
// import { rateLimit } from "express-rate-limit";
// import { slowDown } from "express-slow-down";
import { Server } from "socket.io";
import { createServer } from "node:http";

import pollRouter from "./routes/pollRoute.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  "https://lively-votes-gcdm2ih6c-maheshs-projects-0091caae.vercel.app",
  "https://lively-votes.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Explicit preflight for everything (Socket.IO polling loves this)
// app.options("*", cors());

export const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

const port = 3000;

// Slow down our server after too many requests
// const slowDownLimiter = slowDown({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   delayAfter: 5, // Allow 5 requests per 15 minutes.
//   delayMs: (hits) => hits * 100,
// });

// Rate limiting our server.
// right now -> 2 requests per user under 15 minutes
// const rateLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   limit: 2,
// });

app.use(express.json());
app.use(cookieParser());
// app.use(slowDownLimiter);
// app.use(rateLimiter);

app.use("/api/v1/polls", pollRouter);
app.use("/api/v1/users", userRouter);

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("polls:fetched", () => console.log("All polls fetched"));

  socket.on("disconnect", () => console.log("User disconnected"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.log("This error was caught by express.");
  console.log(err);

  // In case of expired token, return a 401
  // Axios on frontend will intercept this and try to refresh the token.
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Access token expired" });
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

httpServer.listen(port, () => {
  console.log(`App running on port ${port}`);
});
