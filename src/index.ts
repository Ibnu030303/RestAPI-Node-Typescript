import express, { Application, Request, Response, NextFunction } from 'express'

const app: Application = express()
const port: number = 4000

app.use('/health', (req: Request, res: Response, nex: NextFunction) => {
  res.status(200).send({ status: '200', data: 'Hello Word' })
})

app.listen(port, () => console.log(`Servers Is Listening on port ${port}`))
