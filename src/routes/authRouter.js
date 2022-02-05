import express from "express";
import { signIn, signUp } from "../controllers/authController.js";

import validateNewUserSchemaMiddleware from "../middlewares/validateNewUserSchemaMiddleware.js";
import validateUserSchemaMiddleware from "../middlewares/validateUserSchemaMiddleware.js";

const authRouter = express.Router();

authRouter.get("/hello", (req, res) => {
  res.send(users);
});

authRouter.post("/mywallet/sign-up", validateNewUserSchemaMiddleware, signUp)

authRouter.post("/mywallet/sign-in", validateUserSchemaMiddleware, signIn)

export default authRouter;