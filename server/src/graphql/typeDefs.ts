import { gql } from "graphql-tag";

export const typeDefs = gql`
  # 1. Define Role Enum
  enum Role {
    ADMIN
    EMPLOYEE
  }

  # 2. User Type (For returning user info)
  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
  }

  # 3. Auth Payload (The response after login)
  type AuthPayload {
    token: String!
    user: User!
  }

  # 4. Shipment Type (Your upgraded version)
  type Shipment {
    id: ID!
    shipperName: String!
    carrierName: String!
    pickupLocation: String!
    deliveryLocation: String!
    status: String!
    trackingId: String!
    rate: Float!
    estimatedDelivery: String
    createdAt: String!
  }

  # 5. Pagination Response
  type ShipmentPage {
    data: [Shipment!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  type Query {
    # Public: Check if server is running
    hello: String

    # Protected: Get Shipments (Paginated & Filtered)
    shipments(
      page: Int = 1
      limit: Int = 10
      status: String
      sortBy: String = "createdAt"
      sortOrder: Int = -1
    ): ShipmentPage!

    # Protected: Get Single Shipment
    shipment(id: ID!): Shipment
  }

  type Mutation {
    # --- AUTH MUTATIONS (New!) ---
    register(
      name: String!
      email: String!
      password: String!
      role: Role # Optional, defaults to EMPLOYEE
    ): AuthPayload!

    login(email: String!, password: String!): AuthPayload!

    # --- SHIPMENT MUTATIONS (Admin Only) ---
    createShipment(
      shipperName: String!
      carrierName: String!
      pickupLocation: String!
      deliveryLocation: String!
      rate: Float!
      estimatedDelivery: String
    ): Shipment

    updateShipmentStatus(id: ID!, status: String!): Shipment

    deleteShipment(id: ID!): Boolean
  }
`;