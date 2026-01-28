import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import { connectDB } from "./config/db";

dotenv.config();
connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    // This context function runs for EVERY request
    context: async ({ req }) => {
      // 1. Get the token from the header
      const token = req.headers.authorization?.replace("Bearer ", "") || "";

      // 2. If no token, return empty context (Public user)
      if (!token) return {};

      // 3. Verify token and attach user to context
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod");
        return { user: decoded };
      } catch (err) {
        // If token is invalid (expired/fake), return empty context
        return {};
      }
    },
  });

  console.log(`🚀 Server ready at ${url}`);
};

startServer();