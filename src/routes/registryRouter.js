import express from "express";
import { deleteRegistry, editRegistry, postRegistry } from '../controllers/registryController.js';

const registryRouter = express.Router();

registryRouter.post("/mywallet/registry", postRegistry);

registryRouter.delete("/mywallet/registry/:id", deleteRegistry);

registryRouter.put("/mywallet/registry/:id", editRegistry);

export default registryRouter;