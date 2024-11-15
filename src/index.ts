import { logger } from './utils/logger'
// Connect Database
import './utils/connectDB'
import createServer from './utils/server'

const app = createServer()
const port: number = 4001

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`)
})
