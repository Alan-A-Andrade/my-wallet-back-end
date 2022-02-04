import express from "express";
import { signIn, signUp } from "../controllers/authController.js";


const authRouter = express.Router();

authRouter.post("/mywallet/sign-up", signUp)

authRouter.post("/mywallet/sign-in", signIn)

export default authRouter;