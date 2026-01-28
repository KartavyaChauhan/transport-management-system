import React, { useState } from 'react';
import {
  Card, CardContent, Box, Chip, IconButton, Menu, MenuItem,
  Typography, CardActions, Button
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

// Define the interface locally
export interface Shipment {
  id: string;
  trackingId: string;
  shipperName: string;
  carrierName: string;
  pickupLocation: string;
  deliveryLocation: string;
  status: string;
  rate: number;
}

interface ShipmentCardProps {
  row: Shipment;
  onViewDetails: () => void;
  onDelete?: () => void;
  // FIX: Add onEdit here so TypeScript stops complaining
  onEdit?: () => void;
}

export default function ShipmentCard({ row, onViewDetails, onDelete, onEdit }: ShipmentCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const userRole = localStorage.getItem('role');

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnchorEl(null);
  };

  // Handle Delete Click
  const handleDeleteClick = (e: React.MouseEvent) => {
    handleClose(e);
    if (onDelete) onDelete();
  };

  // Handle Edit Click
  const handleEditClick = (e: React.MouseEvent) => {
    handleClose(e);
    if (onEdit) onEdit();
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Chip
            label={row.status}
            color={row.status === "Delivered" ? "success" : row.status === "Pending" ? "warning" : "primary"}
            size="small"
          />
          {userRole === 'ADMIN' && (
            <>
              <IconButton onClick={handleClick} size="small">
                <MoreVertIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
                {/* FIX: Connect the Edit Handler */}
                <MenuItem onClick={handleEditClick}>Edit Status</MenuItem>
                <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>Delete</MenuItem>
              </Menu>
            </>
          )}
        </Box>

        <Typography variant="h6" sx={{ mt: 1, display: "flex", alignItems: "center" }}>
          <LocalShippingIcon sx={{ mr: 1, color: "text.secondary" }} />
          {row.trackingId}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">{row.carrierName}</Typography>
        <Typography variant="body2">
          <strong>From:</strong> {row.pickupLocation}<br />
          <strong>To:</strong> {row.deliveryLocation}
        </Typography>
        <Typography variant="h6" color="primary" sx={{ mt: 2 }}>${row.rate}</Typography>
      </CardContent>

      <CardActions sx={{ mt: "auto" }}>
        <Button size="small" onClick={onViewDetails}>View Details</Button>
      </CardActions>
    </Card>
  );
}