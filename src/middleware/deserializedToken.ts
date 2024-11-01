import { Request, Response, NextFunction } from 'express'
import { verifyJWT, VerifyJWTResult } from '../types/jwt'

const deserializeToken = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization?.replace(/^Bearer\s/, '')

  if (!accessToken) {
    return next()
  }

  // Use the specific type from verifyJWT
  const token: VerifyJWTResult = verifyJWT(accessToken)

  if (token.decode) {
    // Check if decode is valid
    res.locals.user = token.decode
    return next()
  }

  if (token.expired) {
    // Optionally, handle token expiration if needed
    return next()
  }

  return next()
}

export default deserializeToken
