import express, { Router } from "express";
import { login, logout, signup, currentuser } from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();


router.post("/signup", signup);


router.get("/currentuser", protectRoute, currentuser);


router.post("/login", login);


router.post("/logout", logout);

export default router;