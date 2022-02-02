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


app.post("/sign-up", async (req, res) => {
  // userName, email, senha
  const user = req.body;

  const passwordHash = bcrypt.hashSync(user.password, 10);

  await db.collection('users').insertOne({ ...user, password: passwordHash })

  res.sendStatus(201);
});

app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

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
    // usuário não encontrado (email ou senha incorretos)
  }
});

app.get("/wallet", async (req, res) => {
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

app.post("/registry", async (req, res) => {
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

      await db.collection("registries").insertOne({ ...registry, date: Date.now(), userId: user._id })

      res.status(201).send(registry);
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(500)
  }
});


app.delete("/registry/:id", async (req, res) => {
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

app.put("/registry/:id", async (req, res) => {
  const authorization = req.header("authorization");
  const token = authorization?.replace('Bearer ', '');

  const { id } = req.params;
  const editRegistry = req.body;

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