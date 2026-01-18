import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { typeDefs } from "./graphql/schema"
import { resolvers } from "./graphql/resolvers"
import { bootstrapDb } from "./db/bootstrap"

await bootstrapDb()
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const port = process.env.PORT ? Number(process.env.PORT) : 3000

const { url } = await startStandaloneServer(server, {
  listen: { port },
})

console.log(`GraphQL ready at ${url}`)
