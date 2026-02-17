import express from "express";
import {
  signUp,
  login,
  protect,
  logout,
  refresh,
} from "../controllers/authController.js";

import {
  getUserData,
  getPollsUserHaveVotedIn,
  getPollsUserHaveVotedInWithPagination,
} from "../controllers/userController.js";

const router = express();

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/refresh").get(refresh);

router.use(protect);

router.route("/getUserData").get(getUserData);
router.route("/getPollsUserHaveVotedIn").get(getPollsUserHaveVotedIn);
router
  .route("/getPollsUserHaveVotedInWithPagination/:page")
  .get(getPollsUserHaveVotedInWithPagination);

export default router;
