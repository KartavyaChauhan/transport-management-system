import React, { useState } from "react";
import { useQuery, useMutation } from "urql";
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
  Grid,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { GET_SHIPMENTS } from "../graphql/queries";
import { DELETE_SHIPMENT } from "../graphql/mutations";
import ShipmentDetails from "./ShipmentDetails";
import ShipmentCard from "./ShipmentCard";
import CreateShipmentModal from "./CreateShipmentModal";
import UpdateStatusModal from "./UpdateStatusModal";

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

export default function ShipmentList() {
  const [view, setView] = useState<"table" | "tile">("table");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  
  // Create State
  const [isCreateOpen, setCreateOpen] = useState(false);
  
  // Edit State
  const [shipmentToEdit, setShipmentToEdit] = useState<Shipment | null>(null);

  const userRole = localStorage.getItem("role");

  // API Hooks
  const [result] = useQuery({ query: GET_SHIPMENTS });
  const [deleteResult, deleteShipment] = useMutation(DELETE_SHIPMENT);

  const { data, fetching, error } = result;

  // Handlers
  const handleOpenDetails = (shipment: Shipment) => setSelectedShipment(shipment);
  const handleCloseDetails = () => setSelectedShipment(null);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this shipment?")) {
      await deleteShipment({ id });
      window.location.reload();
    }
  };

  const handleEdit = (shipment: Shipment) => {
    setShipmentToEdit(shipment);
  };

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: "table" | "tile" | null,
  ) => {
    if (newView !== null) setView(newView);
  };

  // Columns Configuration
  const columns: GridColDef[] = [
    { field: "trackingId", headerName: "Tracking ID", width: 130 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "shipperName", headerName: "Shipper", width: 150 },
    { field: "carrierName", headerName: "Carrier", width: 150 },
    { field: "pickupLocation", headerName: "Pickup", width: 200 },
    { field: "deliveryLocation", headerName: "Delivery", width: 200 },
    { field: "rate", headerName: "Rate ($)", width: 100, type: "number" },
  ];

  // Admin Actions Column
  if (userRole === "ADMIN") {
    columns.push({
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit Status">
            <IconButton
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(params.row as Shipment);
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Shipment">
            <IconButton
              color="error"
              onClick={(e) => handleDelete(params.row.id, e)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    });
  }

  if (fetching) return <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error: {error.message}</Alert>;
  if (!data || !data.shipments) return <Typography>No shipments found.</Typography>;

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" component="div">
          Shipment Management
        </Typography>

        <Box>
          {userRole === "ADMIN" && (
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

      {/* VIEW 1: TABLE */}
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
            disableRowSelectionOnClick
          />
        </Paper>
      ) : (
        /* VIEW 2: TILES */
        <Grid container spacing={3}>
          {data.shipments.data.map((row: Shipment) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={row.id}>
              <ShipmentCard
                row={row}
                onViewDetails={() => handleOpenDetails(row)}
                onDelete={() => handleDelete(row.id)}
                onEdit={() => handleEdit(row)}
              />
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

      {/* CREATE MODAL */}
      <CreateShipmentModal
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {/* EDIT STATUS MODAL */}
      {shipmentToEdit && (
        <UpdateStatusModal
          open={Boolean(shipmentToEdit)}
          onClose={() => setShipmentToEdit(null)}
          shipmentId={shipmentToEdit.id}
          currentStatus={shipmentToEdit.status}
          onSuccess={() => window.location.reload()}
        />
      )}
    </Box>
  );
}