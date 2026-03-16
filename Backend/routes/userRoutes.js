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

import { createRateLimiter } from "../utils/rateLimiter.js";

const router = express();

const softAuthRateLimiter = createRateLimiter({
  windowMinutes: 1,
  maxRequests: 5,
});

const strictAuthRateLimiter = createRateLimiter({
  windowMinutes: 1,
  maxRequests: 2,
});

const userRateLimiter = createRateLimiter({
  windowMinutes: 1,
  maxRequests: 5,
});

// router.route("/signup").post(signUp);
router.route("/signup").post(softAuthRateLimiter, signUpWithSupabase);
// router.route("/login").post(login);
router.route("/login").post(softAuthRateLimiter, loginWithSupabase);
router.route("/logout").get(logout);
router.route("/refresh").get(refresh);
router.route("/forgotPassword").post(strictAuthRateLimiter, forgotPassword);
router.route("/resetPassword").post(strictAuthRateLimiter, resetPassword);

router.use(protect);

router.route("/getUserData").get(userRateLimiter, getUserData);
router.route("/getPollsUserHaveVotedIn").get(getPollsUserHaveVotedIn);
router
  .route("/getPollsUserHaveVotedInWithPagination/:page")
  .get(getPollsUserHaveVotedInWithPagination);

export default router;
