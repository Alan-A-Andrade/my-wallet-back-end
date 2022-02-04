import joi from 'joi';

const userSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
})

export default userSchema;
