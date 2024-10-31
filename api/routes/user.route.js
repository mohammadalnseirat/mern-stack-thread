import express from "express";
import {
  followUnFollowUser,
  logoutUser,
  signInUser,
  signUpUser,
} from "../controllers/user.controller.js";
import protectedRoute from "../middleWare/protectedRoute.js";

const router = express.Router();

router.post("/sign-up", signUpUser);
router.post("/sign-in", signInUser);
router.post("/log-out", logoutUser);
router.post("/follow/:id", protectedRoute, followUnFollowUser);

export default router;
