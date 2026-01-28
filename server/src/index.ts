import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import { connectDB } from "./config/db";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

connectDB();

interface JwtPayload {
  id: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 },
      context: async ({ req }) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return {};

        const token = authHeader.replace("Bearer ", "");

        try {
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
          ) as JwtPayload;

          return { user: decoded };
        } catch {
          // Invalid or expired token
          return {};
        }
      },
    });

    console.log(`🚀 Server ready at ${url}`);
  } catch (error) {
    console.error("❌ Failed to start server", error);
    process.exit(1);
  }
};

startServer();
