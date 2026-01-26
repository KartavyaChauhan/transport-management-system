import mongoose from "mongoose";

const ShipmentSchema = new mongoose.Schema(
  {
    shipperName: { type: String, required: true },
    carrierName: { type: String, required: true },
    pickupLocation: { type: String, required: true },
    deliveryLocation: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Transit", "Delivered", "Cancelled"],
      default: "Pending",
    },
    trackingId: { type: String, unique: true },
    rate: { type: Number, required: true },
    estimatedDelivery: { type: Date },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

export const Shipment = mongoose.model("Shipment", ShipmentSchema);