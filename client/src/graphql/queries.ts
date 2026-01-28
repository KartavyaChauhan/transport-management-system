import { gql } from 'urql';

export const GET_SHIPMENTS = gql`
  query GetShipments($page: Int!, $limit: Int!) {
    shipments(page: $page, limit: $limit) {
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