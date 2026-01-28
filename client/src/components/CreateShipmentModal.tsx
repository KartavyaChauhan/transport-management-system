import React, { useState } from 'react';
import { useMutation } from 'urql';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid, // Standard Grid import for MUI v6
  Alert,
  Box
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { CREATE_SHIPMENT } from '../graphql/mutations';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateShipmentModal({ open, onClose, onSuccess }: Props) {
  // Form State
  const [formData, setFormData] = useState({
    shipperName: '',
    carrierName: '',
    pickupLocation: '',
    deliveryLocation: '',
    rate: '',
    estimatedDelivery: ''
  });
  
  const [errorMsg, setErrorMsg] = useState('');

  // Mutation Hook
  const [result, createShipment] = useMutation(CREATE_SHIPMENT);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    
    // Basic Validation
    if (!formData.shipperName || !formData.carrierName || !formData.rate) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    // Execute Mutation
    const response = await createShipment({
      ...formData,
      rate: parseFloat(formData.rate)
    });

    if (response.error) {
      setErrorMsg(response.error.message.replace("[GraphQL] ", ""));
    } else {
      // Success!
      setFormData({
        shipperName: '', carrierName: '', pickupLocation: '', 
        deliveryLocation: '', rate: '', estimatedDelivery: ''
      });
      onSuccess(); 
      onClose();   
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
        <LocalShippingIcon sx={{ mr: 1 }} />
        Create New Shipment
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
        
        <Box component="form" sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            {/* FIX: Use 'size' instead of 'item' for MUI v6 */}
            <Grid size={{ xs: 6 }}>
              <TextField
                name="shipperName"
                label="Shipper Name"
                fullWidth
                required
                value={formData.shipperName}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                name="carrierName"
                label="Carrier (e.g. FedEx)"
                fullWidth
                required
                value={formData.carrierName}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="pickupLocation"
                label="Pickup Address"
                fullWidth
                required
                value={formData.pickupLocation}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="deliveryLocation"
                label="Delivery Address"
                fullWidth
                required
                value={formData.deliveryLocation}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                name="rate"
                label="Shipping Rate ($)"
                type="number"
                fullWidth
                required
                value={formData.rate}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                name="estimatedDelivery"
                label="Est. Delivery Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.estimatedDelivery}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={result.fetching}
        >
          {result.fetching ? 'Creating...' : 'Create Shipment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}