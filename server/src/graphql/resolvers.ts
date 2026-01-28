import { Shipment } from "../models/Shipment";
import { User } from "../models/User";
import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

/* ------------------------------------------------------------------ */
/* Utilities */
/* ------------------------------------------------------------------ */

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const generateToken = (user: any): string => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );
};

const requireAuth = (context: any) => {
  if (!context.user) {
    throw new GraphQLError("Authentication required", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
};

const requireAdmin = (context: any) => {
  requireAuth(context);
  if (context.user.role !== "ADMIN") {
    throw new GraphQLError("Admins only", {
      extensions: { code: "FORBIDDEN" },
    });
  }
};

/* ------------------------------------------------------------------ */
/* Resolvers */
/* ------------------------------------------------------------------ */

export const resolvers = {
  Query: {
    health: () => "TMS GraphQL API running",

    shipments: async (
      _: any,
      { page = 1, limit = 10, status, sortBy = "createdAt", sortOrder = -1 }: any,
      context: any
    ) => {
      requireAuth(context);

      const filter: any = {};
      if (status) filter.status = status;

      const skip = (page - 1) * limit;

      const [results, total] = await Promise.all([
        Shipment.find(filter)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean(),
        Shipment.countDocuments(filter),
      ]);

      const data = results.map((doc: any) => ({
        ...doc,
        id: doc._id.toString(),
        createdAt: doc.createdAt?.toISOString(),
        updatedAt: doc.updatedAt?.toISOString(),
      }));

      return { data, total, page, limit };
    },

    shipment: async (_: any, { id }: { id: string }, context: any) => {
      requireAuth(context);

      const doc: any = await Shipment.findById(id).lean();
      if (!doc) {
        throw new GraphQLError("Shipment not found");
      }

      return {
        ...doc,
        id: doc._id.toString(),
        createdAt: doc.createdAt?.toISOString(),
        updatedAt: doc.updatedAt?.toISOString(),
      };
    },
  },

  Mutation: {
    /* -------------------- AUTH -------------------- */

    login: async (_: any, { email, password }: any) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new GraphQLError("Invalid email or password");
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new GraphQLError("Invalid email or password");
      }

      const token = generateToken(user);

      return {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        },
      };
    },

    /* -------------------- SHIPMENTS (ADMIN) -------------------- */

    createShipment: async (_: any, args: any, context: any) => {
      requireAdmin(context);

      if (!args.shipperName || !args.carrierName) {
        throw new GraphQLError("Missing required shipment fields");
      }

      const shipment = new Shipment({
        ...args,
        trackingId: crypto.randomUUID(),
      });

      return await shipment.save();
    },

    updateShipmentStatus: async (
      _: any,
      { id, status }: { id: string; status: string },
      context: any
    ) => {
      requireAdmin(context);

      const shipment = await Shipment.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!shipment) {
        throw new GraphQLError("Shipment not found");
      }

      return shipment;
    },

    deleteShipment: async (_: any, { id }: { id: string }, context: any) => {
      requireAdmin(context);

      const deleted = await Shipment.findByIdAndDelete(id);
      if (!deleted) {
        throw new GraphQLError("Shipment not found");
      }

      return true;
    },
  },
};
