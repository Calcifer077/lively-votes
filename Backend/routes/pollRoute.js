import express from "express";

import {
  castVote,
  countVotes,
  createPoll,
  getAllPolls,
  whichOptionVoted,
} from "../controllers/mainController.js";
import { protect } from "../controllers/authController.js";

const router = express();

router.route("/").get(getAllPolls);

router.use(protect);

router.route("/").post(createPoll);

router.route("/castVote").post(castVote);
router.route("/countVotes/:pollId").get(countVotes);
router.route("/whichOptionVoted/:pollId").get(whichOptionVoted);

export default router;
