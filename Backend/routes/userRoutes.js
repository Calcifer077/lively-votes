import express from "express";
import { signUp, login } from "../controllers/authController.js";

const router = express();

router.route("/signup").post(signUp);
router.route("/login").post(login);

export default router;
