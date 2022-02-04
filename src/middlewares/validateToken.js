import db from "../db.js";

export async function validateToken(req, res, next) {

  const authorization = req.header("authorization");
  const token = authorization?.replace('Bearer ', '');

  if (!token) return res.sendStatus(401);

  try {

    const session = await db.collection('sessions').findOne({ "token": token })

    if (!session) {
      return res.sendStatus(401);
    }

    const user = await db.collection("users").findOne({
      _id: session.userId
    })

    if (!user) {
      return res.sendStatus(401);
    }

    res.locals.user = user;

    next();
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}