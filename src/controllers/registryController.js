import { ObjectId } from 'mongodb';
import { stripHtml } from "string-strip-html";
import db from '../db.js';

export async function postRegistry(req, res) {

  const user = res.locals.user;

  const registry = req.body

  registry.value = stripHtml(registry.value).result.trim();
  registry.type = stripHtml(registry.type).result.trim();
  registry.description = stripHtml(registry.description).result.trim();

  try {

    await db.collection("registries").insertOne({ ...registry, date: Date.now(), userId: user._id })

    res.status(201).send(registry);

  }
  catch {
    res.sendStatus(500)
  }
}

export async function editRegistry(req, res) {

  const { id } = req.params;
  const editRegistry = req.body;

  const user = res.locals.user;

  editRegistry.value = stripHtml(editRegistry.value).result.trim();
  editRegistry.type = stripHtml(editRegistry.type).result.trim();
  editRegistry.description = stripHtml(editRegistry.description).result.trim();

  try {

    await db.collection("registries").updateOne({ $and: [{ _id: new ObjectId(id) }, { userId: user._id }] },
      { $set: editRegistry }
    )

    res.sendStatus(200);

  } catch {
    res.sendStatus(500)
  }
}

export async function deleteRegistry(req, res) {

  try {

    const { id } = req.params;
    const user = res.locals.user;

    await db.collection("registries").deleteOne({ $and: [{ _id: new ObjectId(id) }, { userId: user._id }] })

    res.sendStatus(200);

  } catch {
    res.sendStatus(500)
  }
}