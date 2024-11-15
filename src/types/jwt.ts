import jwt from 'jsonwebtoken'
import CONFIG from '../config/environment'

export const signJWT = (payload: object, options?: jwt.SignOptions | undefined) => {
  return jwt.sign(payload, CONFIG.jwt_private, {
    ...(options && options),
    algorithm: 'RS256'
  })
}

export const verifyJWT = (token: string) => {
  try {
    const decoded = jwt.verify(token, CONFIG.jwt_public)
    return {
      valid: true,
      expired: false,
      decoded
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Check if it's an Error type
      return {
        valid: false,
        expired: error.message === 'jwt is expired or not eligible to use.',
        decoded: null
      }
    } else {
      // Handle other error types or log them
      console.error('Unexpected error:', error)
      return {
        valid: false,
        expired: false,
        decoded: null
      }
    }
  }
}
