import jwt from 'jsonwebtoken'
import CONFIG from '../config/environment'

// Export the type for use in other files
export type VerifyJWTResult = {
  valid: boolean
  expired: boolean
  decode: object | string | null // Adjust based on your actual decode structure
}

export const signJWT = (payload: object, options?: jwt.SignOptions) => {
  return jwt.sign(payload, CONFIG.jwt_private, {
    ...options,
    algorithm: 'RS256'
  })
}

export const verifyJWT = (token: string): VerifyJWTResult => {
  try {
    const decode = jwt.verify(token, CONFIG.jwt_public, { algorithms: ['RS256'] })
    return {
      valid: true,
      expired: false,
      decode
    }
  } catch (error) {
    return {
      valid: false,
      expired: error instanceof jwt.TokenExpiredError,
      decode: null
    }
  }
}
