import express from "express";
import {
  followUnFollowUser,
  getUserProfile,
  logoutUser,
  signInUser,
  signUpUser,
  updateProfilePut,
} from "../controllers/user.controller.js";
import protectedRoute from "../middleWare/protectedRoute.js";

const router = express.Router();
router.get("/profile/:query", getUserProfile);
router.post("/sign-up", signUpUser);
router.post("/sign-in", signInUser);
router.post("/log-out", logoutUser);
router.post("/follow/:id", protectedRoute, followUnFollowUser); // toggle the state (follow/unfollow) user
router.put("/update-profile/:id", protectedRoute, updateProfilePut);

export default router;
