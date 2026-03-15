import express from "express";
import {
  protect,
  logout,
  refresh,
  signUpWithSupabase,
  loginWithSupabase,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import {
  getUserData,
  getPollsUserHaveVotedIn,
  getPollsUserHaveVotedInWithPagination,
} from "../controllers/userController.js";

const router = express();

// router.route("/signup").post(signUp);
router.route("/signup").post(signUpWithSupabase);
// router.route("/login").post(login);
router.route("/login").post(loginWithSupabase);
router.route("/logout").get(logout);
router.route("/refresh").get(refresh);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword").post(resetPassword);

router.use(protect);

router.route("/getUserData").get(getUserData);
router.route("/getPollsUserHaveVotedIn").get(getPollsUserHaveVotedIn);
router
  .route("/getPollsUserHaveVotedInWithPagination/:page")
  .get(getPollsUserHaveVotedInWithPagination);

export default router;
