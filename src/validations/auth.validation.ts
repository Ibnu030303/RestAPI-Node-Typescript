import Joi from 'joi'
import userType from '../types/user.types'

export const createUserValidation = (payload: userType) => {
  const schema = Joi.object({
    user_id: Joi.string().required(),
    email: Joi.string().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().allow('', null)
  })

  return schema.validate(payload)
}

export const createSessionValidation = (payload: userType) => {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
  })

  return schema.validate(payload)
}

export const refreshSessionValidation = (payload: userType) => {
  const schema = Joi.object({
    refreshToken: Joi.string().required()
  })

  return schema.validate(payload)
}
