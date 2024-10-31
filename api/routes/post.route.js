import express from 'express';
import protectedRoute from '../middleWare/protectedRoute.js';
import { createPost } from '../controllers/post.controller.js';


const router = express.Router()

router.post('/create',protectedRoute,createPost)


export default router