import express from 'express';
import { protectRoute } from '../middlewares/protectRoute.js';
import { createPost, deletePost, commentOnPost, likeUnlikePost, getAllPosts, getFollowingPosts, getUserPosts} from '../controllers/post.controller.js';

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.post("/create", protectRoute, createPost);
router.get("/user/:username", protectRoute, getUserPosts);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);


export default router;