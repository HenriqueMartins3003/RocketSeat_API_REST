import fastify from "fastify";
import crypto from "node:crypto"
import { knex } from "./config/database.config";
import { env } from "./env";

const app = fastify();

app.get("/hello", async () => {
const transaction = await knex('transaction').insert({
  id: crypto.randomUUID(),
  title: 'transação de teste',
  amount: 1000,

}).returning('*')

  return transaction;
});

app.get("/hi", async ()=>{
  const transaction = await knex('transaction')
  .where('amount',100)
  .select('*')
  
  return transaction
})

app.listen({ port: env.PORT }).then(() => {
  console.log("Http Server Runing");
});
