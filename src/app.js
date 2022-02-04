import express from 'express';
import cors from 'cors';
import { signIn, signUp } from './controllers/authController.js';
import { getWallet } from './controllers/walletController.js';
import { deleteRegistry, editRegistry, postRegistry } from './controllers/registryController.js';


const app = express();

app.use(express.json())
app.use(cors());


app.post("/mywallet/sign-up", signUp)

app.post("/mywallet/sign-in", signIn)

app.get("/mywallet/wallet", getWallet);

app.post("/mywallet/registry", postRegistry);

app.delete("/mywallet/registry/:id", deleteRegistry);

app.put("/mywallet/registry/:id", editRegistry);

app.listen(5000);