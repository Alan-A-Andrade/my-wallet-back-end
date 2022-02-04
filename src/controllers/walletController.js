import db from '../db.js';

export async function getWallet(req, res) {
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
}