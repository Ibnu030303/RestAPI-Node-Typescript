import express, { Application } from 'express'
import cors from 'cors' // Ensure you have this installed
import deserializeToken from '../middleware/deserializedToken'
import { routes } from '../routes'

const createServer = () => {
  const app: Application = express()

  // Middleware to deserialize token
  app.use(deserializeToken)

  // Parse body request (using Express' built-in methods instead of bodyParser)
  app.use(express.urlencoded({ extended: false }))
  app.use(express.json())

  // CORS access handler (using the cors package)
  app.use(cors())

  // CORS headers (optional if you want more control over CORS)
  // You can remove the manual headers if you're using the `cors()` middleware
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', '*')
    res.setHeader('Access-Control-Allow-Headers', '*')
    next()
  })

  routes(app)

  return app
}

export default createServer
