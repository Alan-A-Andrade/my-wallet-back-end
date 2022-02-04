import { ObjectId } from 'mongodb';
import joi from 'joi';
import { stripHtml } from "string-strip-html";
import db from '../db.js';

export async function postRegistry(req, res) {
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
}

export async function deleteRegistry(req, res) {
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
}

export async function editRegistry(req, res) {
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
}