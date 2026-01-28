import mongoose, { Document } from "mongoose";

export interface IShipment extends Document {
  shipperName: string;
  carrierName: string;
  pickupLocation: string;
  deliveryLocation: string;
  status: "Pending" | "In Transit" | "Delivered" | "Cancelled";
  trackingId: string;
  rate: number;
  estimatedDelivery?: Date;
}

const ShipmentSchema = new mongoose.Schema<IShipment>(
  {
    shipperName: { type: String, required: true, index: true },
    carrierName: { type: String, required: true },
    pickupLocation: { type: String, required: true },
    deliveryLocation: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Transit", "Delivered", "Cancelled"],
      default: "Pending",
      index: true,
    },
    trackingId: { type: String, required: true, unique: true },
    rate: { type: Number, required: true },
    estimatedDelivery: { type: Date },
  },
  { timestamps: true }
);

export const Shipment = mongoose.model<IShipment>("Shipment", ShipmentSchema);
