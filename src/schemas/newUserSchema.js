import joi from 'joi';

const newUserSchema = joi.object({
  username: joi.string().required(),
  email: joi.string().required(),
  password: joi.string().required(),
});

export default newUserSchema;
