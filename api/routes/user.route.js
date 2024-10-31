import express from "express";
import {
  logoutUser,
  signInUser,
  signUpUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/sign-up", signUpUser);
router.post("/sign-in", signInUser);
router.post("/log-out", logoutUser);

export default router;
