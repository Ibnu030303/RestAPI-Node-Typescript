import { Request, Response, NextFunction } from 'express'

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user

  if (!user) {
    return res.sendStatus(403) // Use return to prevent further execution
  }

  next() // Call next only if the user exists
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user

  if (!user || user._doc.role !== 'admin') {
    res.sendStatus(403) // Use return to prevent further execution
  }

  next() // Call next only if the user is an admin
}
