import bcrypt from 'bcrypt'

// Encode
export const hashing = (password: string) => {
  return bcrypt.hashSync(password, 10)
}

// decode
export const checkPassword = (password: string, userPassowrd: string) => {
  return bcrypt.compareSync(password, userPassowrd)
}
