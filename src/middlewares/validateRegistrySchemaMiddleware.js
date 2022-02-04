import registrySchema from "../schemas/registrySchema.js";

export default function validateRegistrySchemaMiddleware(req, res, next) {

  const validation = registrySchema.validate(req.body);

  if (validation.error) {
    res.sendStatus(422)
    return
  };

  next();

}