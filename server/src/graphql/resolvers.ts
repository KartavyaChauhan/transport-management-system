import { Shipment } from "../models/Shipment";
import { User } from "../models/User";
import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Helper: Generate JWT Token
const generateToken = (user: any) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod", 
    { expiresIn: "1d" }
  );
};

// Helper: Check Authentication
const requireAuth = (context: any) => {
  if (!context.user) {
    throw new GraphQLError("Authentication required", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
};

// Helper: Check Admin Role
const requireAdmin = (context: any) => {
  requireAuth(context);
  if (context.user.role !== "ADMIN") {
    throw new GraphQLError("Access denied. Admins only.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
};

export const resolvers = {
  Query: {
    // PUBLIC
    hello: () => "TMS API is running!",

    // PROTECTED: Get Shipments
    shipments: async (_: any, { page, limit, status, sortBy, sortOrder }: any, context: any) => {
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

      // FIX: Map _id to id for each result
      const data = results.map((doc: any) => ({
        ...doc,
        id: doc._id.toString(),
        // Ensure date fields are strings if your schema expects strings
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
      }));

      return { data, total, page, limit };
    },

    // PROTECTED: Get Single Shipment
    shipment: async (_: any, { id }: { id: string }, context: any) => {
      requireAuth(context);
      
      const doc: any = await Shipment.findById(id).lean();
      if (!doc) throw new GraphQLError("Shipment not found");
      
      // FIX: Map _id to id
      return { 
        ...doc, 
        id: doc._id.toString(),
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null
      };
    },
  },

  Mutation: {
    // --- AUTH ---
    register: async (_: any, { name, email, password, role }: any) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new GraphQLError("User already exists with that email");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: role || "EMPLOYEE",
      });

      const res = await newUser.save();
      const token = generateToken(res);
      
      return { token, user: res };
    },

    login: async (_: any, { email, password }: any) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new GraphQLError("Invalid email or password");
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw new GraphQLError("Invalid email or password");
      }

      const token = generateToken(user);
      return { token, user };
    },

    // --- SHIPMENTS (ADMIN ONLY) ---
    createShipment: async (_: any, args: any, context: any) => {
      requireAdmin(context);

      const trackingId = crypto.randomUUID();
      const shipment = new Shipment({ ...args, trackingId });
      
      // .save() returns a Document, so 'id' virtual exists automatically
      return await shipment.save(); 
    },

    updateShipmentStatus: async (_: any, { id, status }: any, context: any) => {
      requireAdmin(context);

      const shipment = await Shipment.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!shipment) throw new GraphQLError("Shipment not found");
      return shipment;
    },

    deleteShipment: async (_: any, { id }: any, context: any) => {
      requireAdmin(context);

      const res = await Shipment.findByIdAndDelete(id);
      if (!res) throw new GraphQLError("Shipment not found");
      return true;
    },
  },
};