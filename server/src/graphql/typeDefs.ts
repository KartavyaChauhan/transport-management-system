import { gql } from "graphql-tag";

export const typeDefs = gql`
  # 1. Define what a "Shipment" looks like
  type Shipment {
    id: ID!
    shipperName: String!
    carrierName: String!
    pickupLocation: String!
    deliveryLocation: String!
    status: String!
    trackingId: String
    rate: Float!
    estimatedDelivery: String
  }

  # 2. Define how users can GET data (Queries)
  type Query {
    # Get all shipments
    getShipments: [Shipment]
    # Get just one shipment by ID
    getShipment(id: ID!): Shipment
  }

  # 3. Define how users can CHANGE data (Mutations)
  type Mutation {
    createShipment(
      shipperName: String!
      carrierName: String!
      pickupLocation: String!
      deliveryLocation: String!
      status: String
      rate: Float!
      estimatedDelivery: String
    ): Shipment

    updateShipment(
      id: ID!
      status: String
    ): Shipment

    deleteShipment(id: ID!): Boolean
  }
`;