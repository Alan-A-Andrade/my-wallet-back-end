import joi from 'joi';

const newUserSchema = joi.object({
  username: joi.string().required(),
  email: joi.string().required().email(),
  password: joi.string().required().pattern(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/),
});

export default newUserSchema;
