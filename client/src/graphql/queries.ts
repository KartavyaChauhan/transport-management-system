import { gql } from 'urql';

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      total {
        count
        totalValue
      }
      pending {
        count
        totalValue
      }
      transit {
        count
        totalValue
      }
      delivered {
        count
        totalValue
      }
    }
  }
`;

export const GET_SHIPMENTS = gql`
  query GetShipments(
    $page: Int
    $limit: Int
    $status: ShipmentStatus
    $sortBy: String
    $sortOrder: String
  ) {
    shipments(
      page: $page
      limit: $limit
      status: $status
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      data {
        id
        trackingId
        shipperName
        carrierName
        pickupLocation
        deliveryLocation
        status
        rate
        createdAt
      }
      total
      page
      limit
    }
  }
`;

export const GET_VEHICLES = gql`
  query GetVehicles {
    vehicles {
      id
      plateNumber
      vehicleModel
      driverName
      status
      currentLocation
    }
  }
`;