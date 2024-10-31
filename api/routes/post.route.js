import express from "express";
import protectedRoute from "../middleWare/protectedRoute.js";
import {
  createPost,
  getPost,
  deletePost,
  likeUnlike_Post,
} from "../controllers/post.controller.js";

const router = express.Router();
router.get("/:id", getPost);
router.post("/create", protectedRoute, createPost);
router.post("/likeUnlike/:id", protectedRoute, likeUnlike_Post); //likeUnlike posted
router.delete("/delete/:id", protectedRoute, deletePost);
export default router;
