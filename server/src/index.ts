import dotenv from "dotenv";
// Load env vars first
dotenv.config();

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import jwt from "jsonwebtoken";
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import { connectDB } from "./config/db";

// Safety check
if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL: JWT_SECRET is not defined in .env");
  process.exit(1);
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

  // ✅ REQUIRED FOR POC / LOCAL DEV
  csrfPrevention: false,
});

async function startServer() {
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
          return {};
        }
      },
    });

    console.log(`🚀 Server ready at ${url}`);
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
}

startServer();
