import { gql } from "graphql-tag";

export const typeDefs = gql`
  /* -------------------- ENUMS -------------------- */

  enum Role {
    ADMIN
    EMPLOYEE
  }

  enum ShipmentStatus {
    Pending
    InTransit
    Delivered
    Cancelled
  }

  /* -------------------- TYPES -------------------- */

  type User {
    id: ID!
    email: String!
    role: Role!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Shipment {
    id: ID!
    shipperName: String!
    carrierName: String!
    pickupLocation: String!
    deliveryLocation: String!
    status: ShipmentStatus!
    trackingId: String!
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

  /* -------------------- QUERIES -------------------- */

  type Query {
    # Health check
    health: String!

    # Protected: Paginated & Filtered Shipments
    shipments(
      page: Int = 1
      limit: Int = 10
      status: ShipmentStatus
      sortBy: String = "createdAt"
      sortOrder: Int = -1
    ): ShipmentPage!

    # Protected: Single Shipment
    shipment(id: ID!): Shipment
  }

  /* -------------------- MUTATIONS -------------------- */

  type Mutation {
    # Auth
    login(email: String!, password: String!): AuthPayload!

    # Shipments (ADMIN only)
    createShipment(
      shipperName: String!
      carrierName: String!
      pickupLocation: String!
      deliveryLocation: String!
      rate: Float!
      estimatedDelivery: String
    ): Shipment!

    updateShipmentStatus(
      id: ID!
      status: ShipmentStatus!
    ): Shipment!

    deleteShipment(id: ID!): Boolean!
  }
`;
