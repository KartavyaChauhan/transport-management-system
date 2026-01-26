import { Shipment } from "../models/Shipment";

export const resolvers = {
  Query: {
    // 1. Logic to get all shipments (We use .find() from Mongoose)
    getShipments: async () => {
      return await Shipment.find().sort({ createdAt: -1 }); // Sort by newest first
    },
    // 2. Logic to get one shipment
    getShipment: async (_: any, { id }: { id: string }) => {
      return await Shipment.findById(id);
    },
  },

  Mutation: {
    // 3. Logic to create a shipment
    createShipment: async (_: any, args: any) => {
      // Create a random tracking ID if one isn't provided
      const trackingId = "TRK-" + Math.floor(Math.random() * 1000000);
      
      const newShipment = new Shipment({
        ...args,
        trackingId, // Add our generated tracking ID
      });

      return await newShipment.save();
    },

    // 4. Logic to update status
    updateShipment: async (_: any, { id, status }: { id: string; status: string }) => {
      // Find the shipment and update it. { new: true } returns the updated version.
      return await Shipment.findByIdAndUpdate(id, { status }, { new: true });
    },

    // 5. Logic to delete
    deleteShipment: async (_: any, { id }: { id: string }) => {
      await Shipment.findByIdAndDelete(id);
      return true;
    },
  },
};