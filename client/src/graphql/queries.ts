import { gql } from 'urql';

export const GET_SHIPMENTS = gql`
  query GetShipments {
    getShipments {
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
  }
`;