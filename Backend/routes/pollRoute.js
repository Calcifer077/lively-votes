import express from "express";

import {
  castVote,
  countVotes,
  createPoll,
  getAllPolls,
  getPollsWithPagination,
  whichOptionVoted,
} from "../controllers/mainController.js";
import { protect } from "../controllers/authController.js";

const router = express();

router.use(protect);

router.route("/").get(getAllPolls);
router.route("/getPollsWithPagination/:page").get(getPollsWithPagination);

router.route("/").post(createPoll);

router.route("/castVote").post(castVote);
router.route("/countVotes/:pollId").get(countVotes);
router.route("/whichOptionVoted/:pollId").get(whichOptionVoted);

export default router;
