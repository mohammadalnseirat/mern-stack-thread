import express from "express";
import protectedRoute from "../middleWare/protectedRoute.js";
import { createPost, getPost,deletePost } from "../controllers/post.controller.js";

const router = express.Router();
router.get("/:id", getPost);
router.post("/create", protectedRoute, createPost);
router.delete('/delete/:id',protectedRoute,deletePost);
export default router;
