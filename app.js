import express, { json } from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import joi from 'joi';
import { stripHtml } from "string-strip-html";
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();

app.use(express.json())
app.use(cors());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
  db = mongoClient.db("my-wallet-alan");
});


app.post("/mywallet/sign-up", async (req, res) => {
  // username, email, password
  const user = req.body;

  const userSchema = joi.object({
    username: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required(),
  })

  const validation = userSchema.validate(user);
  if (validation.error) {
    res.sendStatus(422)
    return
  }

  user.username = stripHtml(user.username).result.trim();
  user.password = stripHtml(user.password).result;
  user.email = stripHtml(user.email).result.trim();

  try {

    let registeredUsers = await db.collection("users").find({ "email": user.email }).toArray()

    if (registeredUsers.filter(el => el.email === user.email).length > 0) {
      res.sendStatus(409)
      return
    }
    const passwordHash = bcrypt.hashSync(user.password, 10);

    await db.collection('users').insertOne({ ...user, password: passwordHash })

    res.sendStatus(201);
  } catch {
    res.sendStatus(500)
  }
});

app.post("/mywallet/sign-in", async (req, res) => {
  let { email, password } = req.body;

  const loginSchema = joi.object({
    email: joi.string().required(),
    password: joi.string().required(),
  })

  const validation = loginSchema.validate(req.body);
  if (validation.error) {
    res.sendStatus(422)
    return
  }

  password = stripHtml(password).result;
  email = stripHtml(email).result.trim();

  try {

    const user = await db.collection('users').findOne({ email });

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = uuid();

      await db.collection("sessions").insertOne({
        userId: user._id,
        token
      })

      let userInfo = { ...user, token }

      delete userInfo.password

      res.send(userInfo);
    } else {
      res.sendStatus(401)
    }
  } catch {
    res.sendStatus(500)
  }
}
);

app.get("/mywallet/wallet", async (req, res) => {
  const authorization = req.header("authorization");
  const token = authorization?.replace('Bearer ', '');

  if (!token) return res.sendStatus(400);

  try {

    const session = await db.collection('sessions').findOne({ "token": token })

    if (!session) {
      return res.sendStatus(401);
    }

    const user = await db.collection("users").findOne({
      _id: session.userId
    })

    if (user) {
      // deletando a propriedade password
      const registries = await db.collection("registries").find({ userId: user._id }).toArray()

      // _id, name, email
      res.send(registries);
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(500)
  }
});

app.post("/mywallet/registry", async (req, res) => {
  const authorization = req.header("authorization");
  const token = authorization?.replace('Bearer ', '');

  if (!token) return res.sendStatus(400);

  try {

    const session = await db.collection('sessions').findOne({ "token": token })

    if (!session) {
      return res.sendStatus(401);
    }

    const user = await db.collection("users").findOne({
      _id: session.userId
    })

    if (user) {

      const registry = req.body

      const registrySchema = joi.object({
        value: joi.string().required().pattern(/^[0-9]+(,[0-9][0-9])?$/),
        type: joi.string().required().valid("surplus", "deficit"),
        description: joi.string().required().pattern(/^[^-\s][\w\s-]+/),
      })

      const validation = registrySchema.validate(registry);
      if (validation.error) {
        res.sendStatus(422)
        return
      }

      registry.value = stripHtml(registry.value).result.trim();
      registry.type = stripHtml(registry.type).result.trim();
      registry.description = stripHtml(registry.description).result.trim();

      await db.collection("registries").insertOne({ ...registry, date: Date.now(), userId: user._id })

      res.status(201).send(registry);
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(500)
  }
});


app.delete("/mywallet/registry/:id", async (req, res) => {
  const authorization = req.header("authorization");
  const token = authorization?.replace('Bearer ', '');

  const { id } = req.params;

  if (!token) return res.sendStatus(400);

  try {

    const session = await db.collection('sessions').findOne({ "token": token })

    if (!session) {
      return res.sendStatus(401);
    }

    const user = await db.collection("users").findOne({
      _id: session.userId
    })

    if (user) {

      await db.collection("registries").deleteOne({ _id: new ObjectId(id) })

      res.status(200).send("ok");
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(500)
  }
});

app.put("/mywallet/registry/:id", async (req, res) => {
  const authorization = req.header("authorization");
  const token = authorization?.replace('Bearer ', '');

  const { id } = req.params;
  const editRegistry = req.body;

  if (!token) return res.sendStatus(400);

  const registrySchema = joi.object({
    value: joi.string().required().pattern(/^[0-9]+(,[0-9][0-9])?$/),
    type: joi.string().required().valid("surplus", "deficit"),
    description: joi.string().required().pattern(/^[^-\s][\w\s-]+/),
  })

  const validation = registrySchema.validate(editRegistry);
  if (validation.error) {
    res.sendStatus(422)
    return
  }

  editRegistry.value = stripHtml(editRegistry.value).result.trim();
  editRegistry.type = stripHtml(editRegistry.type).result.trim();
  editRegistry.description = stripHtml(editRegistry.description).result.trim();

  try {

    const session = await db.collection('sessions').findOne({ "token": token })

    if (!session) {
      return res.sendStatus(401);
    }

    const user = await db.collection("users").findOne({
      _id: session.userId
    })

    if (user) {

      await db.collection("registries").updateOne({ _id: new ObjectId(id) },
        { $set: editRegistry }
      )

      res.status(200).send("ok");
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(500)
  }
});

app.listen(5000);