import mongoose from "mongoose";
import dotenv from "dotenv";
import { Vehicle } from "../models/Vehicle";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tms-db";

const vehicles = [
  {
    plateNumber: "KG-656-LS9",
    vehicleModel: "Toyota Highlander",
    type: "Truck",
    driverName: "Backend Placeholder", // Will be replaced by Public API on frontend
    status: "Active",
    currentLocation: "Belgrade, SB",
  },
  {
    plateNumber: "VR-639-JS6",
    vehicleModel: "Lexus 350",
    type: "Van",
    driverName: "Backend Placeholder",
    status: "Idle",
    currentLocation: "San Diego, US",
  },
  {
    plateNumber: "HY-987-G66",
    vehicleModel: "Ford F150",
    type: "Truck",
    driverName: "Backend Placeholder",
    status: "Maintenance",
    currentLocation: "Birmingham, UK",
  },
  {
    plateNumber: "EH-456-8UN",
    vehicleModel: "The Grim Reaper",
    type: "Heavy Truck",
    driverName: "Backend Placeholder",
    status: "Active",
    currentLocation: "Houston, TX",
  },
  {
    plateNumber: "QU-326-3DS",
    vehicleModel: "Volvo VNL",
    type: "Truck",
    driverName: "Backend Placeholder",
    status: "Maintenance",
    currentLocation: "Caracas, VZ",
  },
  {
    plateNumber: "TR-888-X12",
    vehicleModel: "Mercedes Sprinter",
    type: "Van",
    driverName: "Backend Placeholder",
    status: "Active",
    currentLocation: "Berlin, DE",
  },
  {
    plateNumber: "JP-999-Y34",
    vehicleModel: "Isuzu N-Series",
    type: "Truck",
    driverName: "Backend Placeholder",
    status: "Active",
    currentLocation: "Tokyo, JP",
  },
];

const seedVehicles = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("🔥 Connected to DB");

    // Clear existing vehicles to avoid duplicates
    await Vehicle.deleteMany({});
    console.log("🧹 Cleared old vehicles");

    // Insert new ones
    await Vehicle.insertMany(vehicles);
    console.log(`✅ Successfully added ${vehicles.length} vehicles!`);

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding vehicles:", error);
    process.exit(1);
  }
};

seedVehicles();