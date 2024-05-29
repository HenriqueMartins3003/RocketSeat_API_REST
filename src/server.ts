import { app } from './config/app.config'
import { env } from './env'

app
  .listen({
    port: env.PORT,
    host: 'RENDER' in process.env ? '0.0.0.0' : 'localhost',
  })
  .then(() => {
    console.log('Http Server Runing')
  })
