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
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Grid, // Standard Grid import for MUI v6
} from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { GET_SHIPMENTS } from "../graphql/queries";
// Ensure this file exists in the same folder: client/src/components/ShipmentDetails.tsx
import ShipmentDetails from "./ShipmentDetails";
import ShipmentCard from './ShipmentCard';

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
  // State for the Details Modal
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const [result] = useQuery({ query: GET_SHIPMENTS });
  const { data, fetching, error } = result;

  const handleOpenDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
  };

  const handleCloseDetails = () => {
    setSelectedShipment(null);
  };

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: "table" | "tile" | null
  ) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  if (fetching)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">Error: {error.message}</Alert>;
  if (!data || !data.getShipments)
    return <Typography>No shipments found.</Typography>;

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" component="div">
          Shipment Management
        </Typography>

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

      {/* VIEW 1: DATA GRID TABLE */}
      {view === "table" ? (
        <Paper sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={data.getShipments}
            columns={columns}
            getRowId={(row) => row.id}
            // 1. CLICK HANDLER: Open modal on row click
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
          {data.getShipments.map((row: Shipment) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={row.id}>
              {/* 2. CLICK HANDLER: Pass open function to card */}
              <ShipmentCard row={row} onViewDetails={() => handleOpenDetails(row)} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* 3. RENDER THE MODAL: This fixes the 'value never read' error */}
      <ShipmentDetails
        open={Boolean(selectedShipment)}
        onClose={handleCloseDetails}
        shipment={selectedShipment}
      />
    </Box>
  );
}

// --- SUB-COMPONENT: Individual Tile/Card ---
// Updated to accept 'onViewDetails' prop
