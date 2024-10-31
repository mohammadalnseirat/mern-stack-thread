import express from "express";
import protectedRoute from "../middleWare/protectedRoute.js";
import { createPost, getPost } from "../controllers/post.controller.js";

const router = express.Router();
router.get("/:id", getPost);
router.post("/create", protectedRoute, createPost);

export default router;
