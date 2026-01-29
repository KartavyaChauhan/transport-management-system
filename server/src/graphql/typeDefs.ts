import { gql } from "graphql-tag";

export const typeDefs = gql`
  # -------------------- ENUMS --------------------
  enum ShipmentStatus {
    Pending
    InTransit
    Delivered
    Cancelled
  }

  enum VehicleStatus {
    Active
    Idle
    Maintenance
  }

  # -------------------- DASHBOARD TYPES --------------------
  type StatSummary {
    count: Int!
    totalValue: Float!
  }

  type DashboardStats {
    total: StatSummary!
    pending: StatSummary!
    transit: StatSummary!
    delivered: StatSummary!
  }

  # -------------------- ENTITY TYPES --------------------
  type Shipment {
    id: ID!
    trackingId: String!
    shipperName: String!
    carrierName: String!
    pickupLocation: String!
    deliveryLocation: String!
    status: ShipmentStatus!
    rate: Float!
    estimatedDelivery: String
    createdAt: String!
    updatedAt: String!
  }

  type ShipmentPage {
    data: [Shipment!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  type Vehicle {
    id: ID!
    plateNumber: String!
    vehicleModel: String!
    type: String!
    driverName: String!
    status: VehicleStatus!
    currentLocation: String!
  }

  # -------------------- QUERIES --------------------
  type Query {
    health: String!

    dashboardStats: DashboardStats!

    shipments(
      page: Int = 1
      limit: Int = 10
      status: ShipmentStatus
      sortBy: String = "createdAt"
      sortOrder: String = "desc"
    ): ShipmentPage!

    shipment(id: ID!): Shipment

    vehicles: [Vehicle!]!
  }

  # -------------------- MUTATIONS --------------------
  type Mutation {
    createShipment(
      shipperName: String!
      carrierName: String!
      pickupLocation: String!
      deliveryLocation: String!
      rate: Float!
      estimatedDelivery: String
    ): Shipment!

    updateShipmentStatus(id: ID!, status: ShipmentStatus!): Shipment!
    deleteShipment(id: ID!): Boolean!

    addVehicle(
      plateNumber: String!
      vehicleModel: String!
      type: String!
      driverName: String!
    ): Vehicle!

    deleteVehicle(id: ID!): Boolean!
    assignVehicleToShipment(vehicleId: ID!, shipmentId: ID!): Shipment!
  }
`;