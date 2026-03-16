import express from "express";

import {
  castVote,
  countVotes,
  createPoll,
  getAllPolls,
  getPollbyId,
  getPollsWithPagination,
  whichOptionVoted,
} from "../controllers/pollController.js";

import { protect } from "../controllers/authController.js";

import { createRateLimiter } from "../utils/rateLimiter.js";

const router = express();

const softPollRateLimiter = createRateLimiter({
  windowMinutes: 1,
  maxRequests: 7,
});
const strictPollRateLimiter = createRateLimiter({
  windowMinutes: 1,
  maxRequests: 2,
});

router.route("/getPollById/:pollId").get(softPollRateLimiter, getPollbyId);
router.route("/countVotes/:pollId").get(countVotes);

router.use(protect);

router.route("/").get(getAllPolls);
router
  .route("/getPollsWithPagination/:page")
  .get(softPollRateLimiter, getPollsWithPagination);

router.route("/").post(strictPollRateLimiter, createPoll);

router.route("/castVote").post(castVote);
router.route("/whichOptionVoted/:pollId").get(whichOptionVoted);

export default router;
