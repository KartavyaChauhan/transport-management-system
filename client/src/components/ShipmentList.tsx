import React from 'react';
import { useQuery } from 'urql';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid'; // Fixed: Type-only import
import { Paper, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { GET_SHIPMENTS } from '../graphql/queries';

// 1. Define the shape of our data (TypeScript Interface)
interface Shipment {
  id: string;
  trackingId: string;
  shipperName: string;
  carrierName: string;
  pickupLocation: string;
  deliveryLocation: string;
  status: string;
  rate: number;
}

// 2. Define the Columns for the Grid (THIS WAS MISSING)
const columns: GridColDef[] = [
  { field: 'trackingId', headerName: 'Tracking ID', width: 130 },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'shipperName', headerName: 'Shipper', width: 150 },
  { field: 'carrierName', headerName: 'Carrier', width: 150 },
  { field: 'pickupLocation', headerName: 'Pickup', width: 200 },
  { field: 'deliveryLocation', headerName: 'Delivery', width: 200 },
  { 
    field: 'rate', 
    headerName: 'Rate ($)', 
    width: 100,
    type: 'number',
  },
];

export default function ShipmentList() {
  // 3. Execute the Query
  const [result] = useQuery({ query: GET_SHIPMENTS });
  const { data, fetching, error } = result;

  // 4. Robust Loading State
  if (fetching)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );

  // 5. Robust Error Handling
  if (error)
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading shipments: {error.message}
      </Alert>
    );

  // 6. Handle Empty State
  if (!data || !data.getShipments)
    return <Typography>No shipments found.</Typography>;

  return (
    <Paper sx={{ height: 500, width: "100%", p: 2 }}>
      <Typography variant="h6" gutterBottom component="div" sx={{ mb: 2 }}>
        All Shipments
      </Typography>

      <DataGrid
        rows={data.getShipments}
        columns={columns}
        getRowId={(row) => row.id} // Tell DataGrid which field is the unique ID
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Paper>
  );
}