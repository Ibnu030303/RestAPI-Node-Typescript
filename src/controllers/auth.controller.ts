import { Request, Response } from 'express'
import { createSessionValidation, createUserValidation, refreshSessionValidation } from '../validations/auth.validation'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/logger'
import { checkPassword, hashing } from '../utils/hashing'
import { createUser, findUserByEmail } from '../services/auth.service'
import { signJWT, verifyJWT, VerifyJWTResult } from '../types/jwt'

export const registerUser = async (req: Request, res: Response) => {
  req.body.user_id = uuidv4()
  const { error, value } = createUserValidation(req.body)

  if (error) {
    logger.error('ERR: auth - register = ', error.details[0].message)
    res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message, data: {} })
  }

  try {
    value.password = hashing(value.password) // Removed template string
    await createUser(value)
    logger.info('Add user success')
    res.status(201).send({ status: true, statusCode: 201, message: 'Success register user', data: value })
  } catch (error) {
    logger.error('ERR: auth - register = ', error)
    res.status(500).send({ status: false, statusCode: 500, message: 'Error register user', data: error })
  }
}

export const createSession = async (req: Request, res: Response) => {
  const { error, value } = createSessionValidation(req.body)

  if (error) {
    logger.error('ERR: auth - create session = ', error.details[0].message)
    res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message, data: {} })
  }

  try {
    const user = await findUserByEmail(value.email)
    if (!user) {
      res.status(401).json({ status: false, statusCode: 401, message: 'Invalid email or password' })
      return
    }

    const isValid = checkPassword(value.password, user.password)
    if (!isValid) {
      res.status(401).json({ status: false, statusCode: 401, message: 'Invalid email or password' })
      return
    }

    const accessToken = signJWT({ ...user }, { expiresIn: '1d' })

    const refreshToken = signJWT({ ...user }, { expiresIn: '1' })

    res
      .status(200)
      .send({ status: true, statusCode: 200, message: 'Login Success', data: { accessToken, refreshToken } })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('ERR: auth - create session = ', errMessage)
    res.status(500).send({ status: false, statusCode: 500, message: errMessage })
  }
}

export const refreshSession = async (req: Request, res: Response) => {
  const { error, value } = refreshSessionValidation(req.body)

  if (error) {
    logger.error('ERR: auth - refresh session = ', error.details[0].message)
    res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message, data: {} })
    return
  }

  try {
    const { decode }: VerifyJWTResult = verifyJWT(value.refreshToken) // Destructure valid, expired, and decode

    const user = await findUserByEmail((decode as { email: string }).email) // Cast decode to access email
    if (!user) {
      res.status(401).send({ status: false, statusCode: 401, message: 'User not found' })
      return // Add return here to avoid continuing
    }

    const accessToken = signJWT({ ...user }, { expiresIn: '1d' })
    res.status(200).send({ status: true, statusCode: 200, message: 'Refresh session Success', data: { accessToken } })
  } catch (error: unknown) {
    logger.error('ERR: auth - refresh session = ', error instanceof Error ? error.message : 'Unknown error')
    res.status(500).send({ status: false, statusCode: 500, message: 'Error refreshing session' })
  }
}
