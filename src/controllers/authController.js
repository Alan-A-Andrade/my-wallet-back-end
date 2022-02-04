import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';
import joi from 'joi';
import { stripHtml } from "string-strip-html";
import db from '../db.js';


export async function signUp(req, res) {
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
};


export async function signIn(req, res) {
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