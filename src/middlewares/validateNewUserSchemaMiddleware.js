import newUserSchema from "../schemas/newUserSchema.js";

export default function validateNewUserSchemaMiddleware(req, res, next) {

  const validation = newUserSchema.validate(req.body, { abortEarly: false });

  if (validation.error) {
    res.status(422).send(validation.error.details.map((error) => error.message).join('/'))
    return
  };

  next();

}