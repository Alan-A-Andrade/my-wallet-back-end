import express from "express";
import authRouter from "./authRouter.js";
import walletRouter from './walletRouter.js';
import registryRouter from './registryRouter.js';

const router = express.Router();

router.use(authRouter);
router.use(walletRouter);
router.use(registryRouter);

export default router;