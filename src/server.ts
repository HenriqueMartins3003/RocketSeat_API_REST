import { app } from './config/app.config'
import { env } from './env'

app.listen({ port: env.PORT }).then(() => {
  console.log('Http Server Runing')
})
