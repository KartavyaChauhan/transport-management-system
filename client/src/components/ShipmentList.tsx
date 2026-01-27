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
  Grid, // <--- Import the Modern Grid here
} from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { GET_SHIPMENTS } from "../graphql/queries";

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
  // 1. State for toggling views
  const [view, setView] = useState<"table" | "tile">("table");

  // 2. Query Data
  const [result] = useQuery({ query: GET_SHIPMENTS });
  const { data, fetching, error } = result;

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: "table" | "tile" | null,
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
      {/* HEADER: Title and Toggle Switch */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="div">
          Shipment Management
        </Typography>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          aria-label="view mode"
        >
          <ToggleButton value="table" aria-label="table view">
            <ViewListIcon />
          </ToggleButton>
          <ToggleButton value="tile" aria-label="tile view">
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
            // FIX: No 'item' prop. Use 'size' object for widths.
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={row.id}>
              <ShipmentCard row={row} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

// --- SUB-COMPONENT: Individual Tile/Card ---
function ShipmentCard({ row }: { row: Shipment }) {
  // Logic for the "Bun Button" (3 dots menu)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <CardContent>
        {/* Card Header with Status and Menu */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Chip
            label={row.status}
            color={
              row.status === "Delivered"
                ? "success"
                : row.status === "Pending"
                  ? "warning"
                  : "primary"
            }
            size="small"
          />
          <IconButton onClick={handleClick} size="small">
            <MoreVertIcon />
          </IconButton>
          {/* The Pop-up Menu */}
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={handleClose}>Edit</MenuItem>
            <MenuItem onClick={handleClose}>Flag</MenuItem>
            <MenuItem onClick={handleClose} sx={{ color: "error.main" }}>
              Delete
            </MenuItem>
          </Menu>
        </Box>

        {/* Card Data */}
        <Typography
          variant="h6"
          component="div"
          sx={{ mt: 1, display: "flex", alignItems: "center" }}
        >
          <LocalShippingIcon sx={{ mr: 1, color: "text.secondary" }} />
          {row.trackingId}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {row.carrierName}
        </Typography>
        <Typography variant="body2">
          <strong>From:</strong> {row.pickupLocation}
          <br />
          <strong>To:</strong> {row.deliveryLocation}
        </Typography>
        <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
          ${row.rate}
        </Typography>
      </CardContent>

      <CardActions sx={{ mt: "auto" }}>
        <Button size="small">View Details</Button>
      </CardActions>
    </Card>
  );
}
