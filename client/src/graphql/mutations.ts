import { gql } from 'urql';

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        role
      }
    }
  }
`;

export const CREATE_SHIPMENT = gql`
  mutation CreateShipment(
    $shipperName: String!
    $carrierName: String!
    $pickupLocation: String!
    $deliveryLocation: String!
    $rate: Float!
    $estimatedDelivery: String
  ) {
    createShipment(
      shipperName: $shipperName
      carrierName: $carrierName
      pickupLocation: $pickupLocation
      deliveryLocation: $deliveryLocation
      rate: $rate
      estimatedDelivery: $estimatedDelivery
    ) {
      id
      trackingId
      status
    }
  }
`;

export const DELETE_SHIPMENT = gql`
  mutation DeleteShipment($id: ID!) {
    deleteShipment(id: $id)
  }
`;

export const UPDATE_STATUS = gql`
  mutation UpdateStatus($id: ID!, $status: String!) {
    updateShipmentStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;