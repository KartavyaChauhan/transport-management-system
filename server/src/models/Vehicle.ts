import mongoose, { Document, Schema } from "mongoose";

export type VehicleStatus = "Active" | "Idle" | "Maintenance";

export interface VehicleDocument extends Document {
  plateNumber: string;
  vehicleModel: string; // <--- RENAMED (was 'model')
  type: string;
  driverName: string;
  status: VehicleStatus;
  currentLocation: string;
}

const VehicleSchema = new Schema<VehicleDocument>(
  {
    plateNumber: { type: String, required: true, unique: true, trim: true },
    vehicleModel: { type: String, required: true }, // <--- RENAMED
    type: { type: String, required: true }, 
    driverName: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["Active", "Idle", "Maintenance"], 
      default: "Idle" 
    },
    currentLocation: { type: String, default: "Warehouse" },
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model<VehicleDocument>("Vehicle", VehicleSchema);