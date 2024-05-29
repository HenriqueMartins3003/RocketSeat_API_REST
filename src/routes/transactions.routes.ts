import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../config/database.config'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-sessionId-exists'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (req) => {
    const { sessionId } = req.cookies

    const transactions = await knex('transaction')
      .where('session_id', sessionId)
      .select('*')

    return { transactions }
  })

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const getTransacrionParamSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getTransacrionParamSchema.parse(req.params)

    const { sessionId } = req.cookies

    const transaction = await knex('transaction')
      .where({
        session_id: sessionId,
        id,
      })
      .first()

    return { transaction }
  })
  app.get('/summary', { preHandler: [checkSessionIdExists] }, async (req) => {
    const { sessionId } = req.cookies

    const summary = await knex('transaction')
      .where('session_id', sessionId)
      .sum('amount', { as: 'amount' })
      .first()

    return { summary }
  })

  app.post('/', async (req, res) => {
    // usando o ZOD para criar o tipo dos dados do meu body! com um schema
    const createTransactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })
    try {
      // Desestruturando os valores do meu schema se passarem na validaçõa do schema que criei no ZOD.
      const { title, amount, type } = createTransactionSchema.parse(req.body)

      let sessionId = req.cookies.sessionId

      if (!sessionId) {
        sessionId = randomUUID()

        res.cookie('sessionId', sessionId, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      }

      await knex('transaction').insert({
        id: randomUUID(),
        title,
        // Se o type for credit salva o amount como ele veio se o type for debit salva com o valor dele negativo
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId,
      })
      return res.status(201).send()
    } catch (error) {
      console.error(error)
      return res.status(500).send(JSON.stringify(error))
    }
  })
}
