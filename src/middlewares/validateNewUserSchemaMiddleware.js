import newUserSchema from "../schemas/newUserSchema.js";

export default function validateNewUserSchemaMiddleware(req, res, next) {

  const validation = newUserSchema.validate(req.body);

  if (validation.error) {
    res.sendStatus(422)
    return
  };

  next();

}