import { gql } from 'urql';

export const GET_SHIPMENTS = gql`
  query GetShipments {
    shipments(page: 1, limit: 100) { # Fetching 100 for now to see everything
      data {
        id
        trackingId
        shipperName
        carrierName
        pickupLocation
        deliveryLocation
        status
        rate
        estimatedDelivery
      }
      total
    }
  }
`;