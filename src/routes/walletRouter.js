import express from "express";
import { getWallet } from '../controllers/walletController.js';

const walletRouter = express.Router();

walletRouter.get("/mywallet/wallet", getWallet);

export default walletRouter;