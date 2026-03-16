import { rateLimit } from "express-rate-limit";

export function createRateLimiter({
  windowMinutes = 10, // default: 10 min
  maxRequests = 50, // default: 50 req
  message = "Too many requests — please try again later.",
  ...otherOptions // allow passing any other rateLimit option
} = {}) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: maxRequests, // ← note: it's .limit in v7+, not .max
    standardHeaders: true, // sends RateLimit-Limit / Remaining / Reset
    legacyHeaders: false,
    message: (req, res) => {
      return {
        status: "error",
        message: "Too many requests — please try again later",
      };
    },
    statusCode: 429,
    ...otherOptions, // e.g. skip, keyGenerator, handler, etc.
  });
}
