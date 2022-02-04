import express from "express";
import { getWallet } from '../controllers/walletController.js';
import { validateToken } from "../middlewares/validateToken.js";

const walletRouter = express.Router();

walletRouter.use(validateToken)
walletRouter.get("/mywallet/wallet", getWallet);

export default walletRouter;