import joi from 'joi';

const registrySchema = joi.object({
  value: joi.string().required().pattern(/^[0-9]+(,[0-9][0-9])$/),
  type: joi.string().required().valid("surplus", "deficit"),
  description: joi.string().required()
})

export default registrySchema;