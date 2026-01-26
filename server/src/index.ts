import { ApolloServer } from "apollo-server";
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";

// 1. Create the Apollo Server instance
// We pass it our "Shape" (typeDefs) and our "Logic" (resolvers)
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// 2. Start the server
server.listen().then(({ url }) => {
  console.log(`🚀  Server is running at ${url}`);
});