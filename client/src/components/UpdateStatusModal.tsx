import React, { useState } from 'react';
import { useMutation } from 'urql';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { UPDATE_STATUS } from '../graphql/mutations';

interface Props {
  open: boolean;
  onClose: () => void;
  shipmentId: string;
  currentStatus: string;
  onSuccess: () => void;
}

const STATUS_OPTIONS = ['Pending', 'In Transit', 'Delivered', 'Cancelled'];

export default function UpdateStatusModal({ open, onClose, shipmentId, currentStatus, onSuccess }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Mutation Hook
  const [result, updateStatus] = useMutation(UPDATE_STATUS);

  const handleSubmit = async () => {
    setErrorMsg('');
    
    if (status === currentStatus) {
      onClose(); // No change made
      return;
    }

    const response = await updateStatus({ id: shipmentId, status });

    if (response.error) {
      setErrorMsg(response.error.message.replace("[GraphQL] ", ""));
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <EditIcon sx={{ mr: 1 }} />
        Update Status
      </DialogTitle>
      
      <DialogContent sx={{ mt: 1 }}>
        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
        
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={result.fetching}
        >
          {result.fetching ? 'Updating...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}