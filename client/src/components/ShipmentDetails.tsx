import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Divider,
  Box
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PlaceIcon from '@mui/icons-material/Place';

// Define the shape of the data we expect
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

interface ShipmentDetailsProps {
  open: boolean;
  onClose: () => void;
  shipment: Shipment | null;
}

export default function ShipmentDetails({ open, onClose, shipment }: ShipmentDetailsProps) {
  if (!shipment) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
        <LocalShippingIcon sx={{ mr: 1 }} />
        Shipment Details
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 1 }}>
          <Typography variant="h6">Tracking ID: {shipment.trackingId}</Typography>
          <Chip 
            label={shipment.status} 
            color={shipment.status === 'Delivered' ? 'success' : 'warning'} 
          />
        </Box>
        
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          {/* FIX: Use 'size' instead of 'item xs={6}' */}
          <Grid size={{ xs: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Shipper</Typography>
            <Typography variant="body1">{shipment.shipperName}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Carrier</Typography>
            <Typography variant="body1">{shipment.carrierName}</Typography>
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <PlaceIcon color="action" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Route</Typography>
                <Typography variant="body1">
                  {shipment.pickupLocation} ➝ {shipment.deliveryLocation}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
             <Typography variant="h6" color="primary" sx={{ textAlign: 'right', mt: 2 }}>
               Total Cost: ${shipment.rate}
             </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
}