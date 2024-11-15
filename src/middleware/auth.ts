import { Request, Response, NextFunction } from 'express'

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user

  if (!user) {
    res.status(403).send({
      message: 'Forbidden'
    })
    return
  }

  next()
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user

  if (!user || user._doc.role !== 'admin') {
    res.status(403).send({
      message: 'Forbidden'
    })
    return
  }

  next()
}
