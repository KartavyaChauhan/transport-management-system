import React, { useState } from "react";
import { useQuery } from "urql";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import {
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Grid, // Standard Grid import for MUI v6
  Button,
} from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import AddIcon from "@mui/icons-material/Add"; // Import Add Icon
import { GET_SHIPMENTS } from "../graphql/queries";
import ShipmentDetails from "./ShipmentDetails";
import ShipmentCard from "./ShipmentCard";
import CreateShipmentModal from "./CreateShipmentModal"; // Import the Modal

// Define the shape of the data
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

const columns: GridColDef[] = [
  { field: "trackingId", headerName: "Tracking ID", width: 130 },
  { field: "status", headerName: "Status", width: 120 },
  { field: "shipperName", headerName: "Shipper", width: 150 },
  { field: "carrierName", headerName: "Carrier", width: 150 },
  { field: "pickupLocation", headerName: "Pickup", width: 200 },
  { field: "deliveryLocation", headerName: "Delivery", width: 200 },
  { field: "rate", headerName: "Rate ($)", width: 100, type: "number" },
];

export default function ShipmentList() {
  const [view, setView] = useState<"table" | "tile">("table");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  
  // NEW: State for Create Modal
  const [isCreateOpen, setCreateOpen] = useState(false);
  const userRole = localStorage.getItem("role"); // Check Admin Role

  // Query the API
  const [result] = useQuery({ query: GET_SHIPMENTS });
  const { data, fetching, error } = result;

  // Handlers
  const handleOpenDetails = (shipment: Shipment) => setSelectedShipment(shipment);
  const handleCloseDetails = () => setSelectedShipment(null);

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: "table" | "tile" | null
  ) => {
    if (newView !== null) setView(newView);
  };

  // 1. Loading State
  if (fetching)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );

  // 2. Error State
  if (error) return <Alert severity="error">Error: {error.message}</Alert>;

  // 3. Empty State
  if (!data || !data.shipments)
    return <Typography>No shipments found.</Typography>;

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" component="div">
          Shipment Management
        </Typography>

        <Box>
          {/* NEW: Admin Only Add Button */}
          {userRole === 'ADMIN' && (
             <Button 
               variant="contained" 
               startIcon={<AddIcon />} 
               onClick={() => setCreateOpen(true)}
               sx={{ mr: 2 }}
             >
               Add Shipment
             </Button>
          )}

          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="view mode"
          >
            <ToggleButton value="table">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="tile">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* VIEW 1: DATA GRID TABLE */}
      {view === "table" ? (
        <Paper sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={data.shipments.data}
            columns={columns}
            getRowId={(row) => row.id}
            onRowClick={(params) => handleOpenDetails(params.row as Shipment)}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 5 } },
            }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Paper>
      ) : (
        /* VIEW 2: TILE / CARD GRID */
        <Grid container spacing={3}>
          {data.shipments.data.map((row: Shipment) => (
            // FIX: Use 'size' for MUI v6
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={row.id}>
              <ShipmentCard row={row} onViewDetails={() => handleOpenDetails(row)} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* DETAILS MODAL */}
      <ShipmentDetails
        open={Boolean(selectedShipment)}
        onClose={handleCloseDetails}
        shipment={selectedShipment}
      />

      {/* NEW: CREATE MODAL */}
      <CreateShipmentModal 
        open={isCreateOpen} 
        onClose={() => setCreateOpen(false)} 
        onSuccess={() => {
           window.location.reload(); // Refresh to show new data
        }} 
      />
    </Box>
  );
}