import mongoose, { Document, Schema } from "mongoose";

/* -------------------- Types -------------------- */

export type ShipmentStatus =
  | "Pending"
  | "InTransit"
  | "Delivered"
  | "Cancelled";

export interface ShipmentDocument extends Document {
  shipperName: string;
  carrierName: string;
  pickupLocation: string;
  deliveryLocation: string;
  status: ShipmentStatus;
  trackingId: string;
  rate: number;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/* -------------------- Schema -------------------- */

const ShipmentSchema = new Schema<ShipmentDocument>(
  {
    shipperName: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    carrierName: {
      type: String,
      required: true,
      trim: true,
    },
    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryLocation: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "InTransit", "Delivered", "Cancelled"],
      default: "Pending",
      index: true,
    },
    trackingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedDelivery: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "shipments",
  }
);

/* -------------------- Model -------------------- */

export const Shipment = mongoose.model<ShipmentDocument>(
  "Shipment",
  ShipmentSchema
);
