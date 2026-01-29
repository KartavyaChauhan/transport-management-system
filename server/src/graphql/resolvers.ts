import { Shipment } from "../models/Shipment";
import { Vehicle } from "../models/Vehicle";
import { GraphQLError } from "graphql";
import crypto from "crypto";

export const resolvers = {
  Query: {
    health: () => "TMS GraphQL API running (Open Access)",

    /* ---------------------------------------------------------
       ✅ FIX: Robust Stats Calculator (Fixes 0 values)
       Calculates Count AND Total Value (Money) safely in JS
    --------------------------------------------------------- */
    dashboardStats: async () => {
      // 1. Get all shipments
      const allShipments = await Shipment.find({}).lean();

      // 2. Prepare buckets
      const stats = {
        total: { count: 0, totalValue: 0 },
        pending: { count: 0, totalValue: 0 },
        transit: { count: 0, totalValue: 0 },
        delivered: { count: 0, totalValue: 0 },
      };

      // 3. Loop through data safely
      allShipments.forEach((s: any) => {
        // SAFETY: Convert Rate to Number (handle if it's a string "1,200" or "1200")
        const rateString = s.rate?.toString().replace(/,/g, '') || "0";
        const rate = parseFloat(rateString) || 0;
        
        // SAFETY: Normalize Status (handle "In Transit" vs "InTransit" vs "intransit")
        const status = s.status?.toString().replace(/\s+/g, "").toLowerCase(); 

        // Update Total
        stats.total.count++;
        stats.total.totalValue += rate;

        // Update Specific Status Buckets
        if (status === 'pending') {
          stats.pending.count++;
          stats.pending.totalValue += rate;
        } else if (status === 'intransit') {
          stats.transit.count++;
          stats.transit.totalValue += rate;
        } else if (status === 'delivered') {
          stats.delivered.count++;
          stats.delivered.totalValue += rate;
        }
      });

      return stats;
    },

    /* -------------------- SHIPMENTS -------------------- */
    shipments: async (
      _: any,
      {
        page = 1,
        limit = 10,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      }: any
    ) => {
      const filter: any = {};
      if (status) filter.status = status;

      const allowedSortFields = [
        "createdAt", "updatedAt", "rate", "status", "shipperName", "carrierName",
      ];

      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
      const mongoSortOrder = sortOrder === "asc" ? 1 : -1;
      const sortOptions: Record<string, 1 | -1> = { [safeSortBy]: mongoSortOrder };
      const skip = (page - 1) * limit;

      const [results, total] = await Promise.all([
        Shipment.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
        Shipment.countDocuments(filter),
      ]);

      const data = results.map((doc: any) => ({
        ...doc,
        id: doc._id.toString(),
        // Ensure rate is a number for the frontend
        rate: typeof doc.rate === 'string' ? parseFloat(doc.rate.replace(/,/g, '')) : doc.rate,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
      }));

      return { data, total, page, limit };
    },

    shipment: async (_: any, { id }: { id: string }) => {
      const doc: any = await Shipment.findById(id).lean();
      if (!doc) throw new GraphQLError("Shipment not found");

      return {
        ...doc,
        id: doc._id.toString(),
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
      };
    },

    /* -------------------- VEHICLES -------------------- */
    vehicles: async () => {
      const vehicles = await Vehicle.find().lean();
      return vehicles.map((v: any) => ({
        ...v,
        id: v._id.toString(),
      }));
    },
  },

  Mutation: {
    createShipment: async (_: any, args: any) => {
      const shipment = new Shipment({
        ...args,
        trackingId: crypto.randomUUID(),
      });
      return await shipment.save();
    },

    updateShipmentStatus: async (
      _: any,
      { id, status }: { id: string; status: string }
    ) => {
      const shipment = await Shipment.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!shipment) throw new GraphQLError("Shipment not found");
      return shipment;
    },

    deleteShipment: async (_: any, { id }: { id: string }) => {
      const deleted = await Shipment.findByIdAndDelete(id);
      if (!deleted) throw new GraphQLError("Shipment not found");
      return true;
    },

    addVehicle: async (_: any, args: any) => {
      const vehicle = new Vehicle(args);
      const saved = await vehicle.save();
      return {
        ...saved.toObject(),
        id: saved._id.toString(),
      };
    },

    deleteVehicle: async (_: any, { id }: { id: string }) => {
      await Vehicle.findByIdAndDelete(id);
      return true;
    },

    assignVehicleToShipment: async (
      _: any,
      { vehicleId, shipmentId }: any
    ) => {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) throw new GraphQLError("Vehicle not found");

      vehicle.status = "Active";
      await vehicle.save();

      const shipment = await Shipment.findByIdAndUpdate(
        shipmentId,
        { status: "InTransit" },
        { new: true }
      );

      if (!shipment) throw new GraphQLError("Shipment not found");
      return shipment;
    },
  },
};