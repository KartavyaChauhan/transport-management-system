import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, gql } from 'urql';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid, 
  Card,
  CardContent,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  Alert,
  alpha,
  Divider,
  Avatar 
} from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';
import type { 
  GridColDef, 
  GridSortModel, 
  GridRenderCellParams 
} from '@mui/x-data-grid';

// Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; 
import VisibilityIcon from '@mui/icons-material/Visibility'; 
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import CloseIcon from '@mui/icons-material/Close';
import PlaceIcon from '@mui/icons-material/Place';
import LocalShippingIcon from '@mui/icons-material/LocalShipping'; 
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import RadarIcon from '@mui/icons-material/Radar'; // ✅ NEW ICON

import { GET_SHIPMENTS } from '../graphql/queries';

/* ------------------------------------------------------------------
   MUTATIONS
------------------------------------------------------------------ */
const DELETE_SHIPMENT = gql`
  mutation DeleteShipment($id: ID!) {
    deleteShipment(id: $id)
  }
`;

const UPDATE_STATUS = gql`
  mutation UpdateStatus($id: ID!, $status: ShipmentStatus!) {
    updateShipmentStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const CREATE_SHIPMENT = gql`
  mutation CreateShipment(
    $shipperName: String!, 
    $carrierName: String!, 
    $pickupLocation: String!, 
    $deliveryLocation: String!, 
    $rate: Float!
  ) {
    createShipment(
      shipperName: $shipperName, 
      carrierName: $carrierName, 
      pickupLocation: $pickupLocation, 
      deliveryLocation: $deliveryLocation, 
      rate: $rate
    ) {
      id
      trackingId
      status
    }
  }
`;

/* ------------------------------------------------------------------
   COMPONENT
------------------------------------------------------------------ */
export default function Shipments() {
  // --- UI State ---
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  
  // Stores the random users fetched from API
  const [agents, setAgents] = useState<any[]>([]);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ 
    open: false, message: '', severity: 'success' 
  });

  // --- Form State ---
  const [formData, setFormData] = useState({
    id: '',
    trackingId: '', 
    shipperName: '',
    carrierName: '',
    pickupLocation: '',
    deliveryLocation: '',
    rate: 0,
    status: 'Pending',
    agent: { name: '', image: '' } 
  });

  // --- Pagination & Sorting ---
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  
  const sortField = sortModel.length > 0 ? sortModel[0].field : undefined;
  const sortOrder = sortModel.length > 0 ? sortModel[0].sort : undefined;

  // --- GraphQL Hooks ---
  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: GET_SHIPMENTS,
    variables: {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      sortBy: sortField,
      sortOrder: sortOrder,
    },
  });

  const [, deleteShipment] = useMutation(DELETE_SHIPMENT);
  const [, updateStatus] = useMutation(UPDATE_STATUS);
  const [, createShipment] = useMutation(CREATE_SHIPMENT);

  /* ------------------------------------------------------------------
     1. FETCH REAL RANDOM USERS (Consistent via seed)
  ------------------------------------------------------------------ */
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('https://randomuser.me/api/?results=50&inc=name,picture&seed=tms');
        const data = await response.json();
        setAgents(data.results);
      } catch (err) {
        console.error("Failed to fetch agents", err);
      }
    };
    fetchAgents();
  }, []);

  /* ------------------------------------------------------------------
     2. MERGE DATA (Shipments + Random Agents)
  ------------------------------------------------------------------ */
  const rows = useMemo(() => {
    if (!data?.shipments?.data || agents.length === 0) return [];
    
    return data.shipments.data.map((shipment: any, index: number) => {
      const agentData = agents[index % agents.length];
      return {
        ...shipment,
        agentName: `${agentData.name.first} ${agentData.name.last}`,
        agentImage: agentData.picture.medium
      };
    });
  }, [data, agents]);

  /* ------------------------------------------------------------------
     HANDLERS
  ------------------------------------------------------------------ */
  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({ 
      id: '', trackingId: '', shipperName: '', carrierName: '', 
      pickupLocation: '', deliveryLocation: '', rate: 0, status: 'Pending',
      agent: { name: '', image: '' }
    });
    setIsModalOpen(true);
  };

  const handleOpenView = (row: any) => {
    setModalMode('view');
    setFormData({ 
      ...row, 
      rate: row.rate,
      agent: { name: row.agentName, image: row.agentImage }
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (row: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); 
    setModalMode('edit');
    setFormData({ 
      ...row, 
      rate: row.rate,
      agent: { name: row.agentName, image: row.agentImage }
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      const result = await deleteShipment({ id });
      if (result.error) {
        setSnackbar({ open: true, message: `Delete Failed: ${result.error.message}`, severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'Shipment deleted successfully', severity: 'success' });
        reexecuteQuery({ requestPolicy: 'network-only' });
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (modalMode === 'create') {
        const result = await createShipment({
          shipperName: formData.shipperName,
          carrierName: formData.carrierName,
          pickupLocation: formData.pickupLocation,
          deliveryLocation: formData.deliveryLocation,
          rate: parseFloat(formData.rate.toString()),
        });
        if (result.error) throw new Error(result.error.message);
        setSnackbar({ open: true, message: 'Shipment created!', severity: 'success' });
      } else if (modalMode === 'edit') {
        const result = await updateStatus({ id: formData.id, status: formData.status });
        if (result.error) throw new Error(result.error.message);
        setSnackbar({ open: true, message: 'Status updated!', severity: 'success' });
      }
      setIsModalOpen(false);
      reexecuteQuery({ requestPolicy: 'network-only' });
    } catch (err: any) {
      setSnackbar({ open: true, message: `Operation Failed: ${err.message}`, severity: 'error' });
    }
  };

  const renderStatusChip = (status: string) => {
    let color: any = 'default';
    if (status === 'Pending') color = 'warning';
    if (status === 'InTransit') color = 'info';
    if (status === 'Delivered') color = 'success';
    if (status === 'Cancelled') color = 'error';
    return <Chip label={status} color={color} size="small" variant="filled" sx={{ fontWeight: 600, fontFamily: 'Oswald', minWidth: 80 }} />;
  };

  /* ------------------------------------------------------------------
     COLUMNS
  ------------------------------------------------------------------ */
  const columns: GridColDef[] = [
    { field: 'trackingId', headerName: 'Tracking ID', width: 140 },
    
    { 
      field: 'agentName', 
      headerName: 'Lead Agent', 
      width: 220,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ height: '100%' }}>
          <Avatar 
            src={params.row.agentImage} 
            sx={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.1)' }} 
          />
          <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Stack>
      )
    },

    { field: 'shipperName', headerName: 'Shipper', flex: 1, minWidth: 150 },
    { field: 'carrierName', headerName: 'Carrier', flex: 1, minWidth: 150 },
    { field: 'rate', headerName: 'Rate ($)', width: 110, type: 'number', headerAlign: 'left', align: 'left' },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => renderStatusChip(params.value),
    },
    { field: 'pickupLocation', headerName: 'Origin', flex: 1, minWidth: 130 },
    { field: 'deliveryLocation', headerName: 'Destination', flex: 1, minWidth: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Update Status">
            <IconButton 
              size="small" 
              onClick={(e) => handleOpenEdit(params.row, e)} 
              sx={{ color: '#60a5fa', mr: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={(e) => handleDelete(params.row.id, e)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (error) return <Typography color="error">Error loading shipments: {error.message}</Typography>;

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      
      {/* ✅ Add Orbitron Font */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');`}
      </style>

      {/* HEADER */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={4} spacing={2}>
        <Box>
          {/* ✅ Logo + Title Section (Matches Dashboard) */}
          <Stack direction="row" alignItems="center" spacing={2} mb={0.5}>
            <Box 
              sx={{ 
                p: 1, 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LocalShippingIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontFamily: 'Oswald', 
                fontWeight: 700, 
                background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}
            >
              Shipment Management
            </Typography>
          </Stack>

          {/* ✅ Subtitle with Icon & Orbitron Font */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
            <RadarIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
            <Typography 
              variant="body1" 
              sx={{ 
                color: alpha('#fff', 0.6), 
                fontFamily: 'Orbitron, sans-serif', 
                letterSpacing: 1,
                fontSize: '0.85rem',
                textTransform: 'uppercase'
              }}
            >
              Manage orders, track status, and assign carriers in real-time.
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={2}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newView) => newView && setViewMode(newView)}
            size="small"
            sx={{ 
              bgcolor: alpha('#fff', 0.1),
              borderRadius: 2,
              '& .MuiToggleButton-root': { color: 'white', border: 'none' },
              '& .Mui-selected': { bgcolor: '#3b82f6 !important', color: 'white' }
            }}
          >
            <ToggleButton value="table"><ViewListIcon /></ToggleButton>
            <ToggleButton value="grid"><GridViewIcon /></ToggleButton>
          </ToggleButtonGroup>

          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpenCreate}
            sx={{ 
              bgcolor: '#3b82f6', 
              fontFamily: 'Oswald',
              letterSpacing: 1,
              fontWeight: 500,
              borderRadius: 2,
              px: 3,
              boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.5)',
              '&:hover': { bgcolor: '#2563eb', transform: 'translateY(-2px)' }
            }}
          >
            Create Shipment
          </Button>
        </Stack>
      </Stack>

      {/* TABLE / GRID CONTAINER */}
      <Paper 
        sx={{ 
          width: '100%', 
          borderRadius: 3, 
          overflow: 'hidden', 
          bgcolor: '#111827', // Dark base
          border: '1px solid rgba(255,255,255,0.08)',
          minHeight: 400,
          position: 'relative' 
        }}
      >
        
        {/* ✅ WATERMARKS (INSIDE THE PAPER) */}
        <Box 
          sx={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            opacity: 0.05, 
            transform: 'rotate(-10deg)',
            pointerEvents: 'none',
            zIndex: 0,
            color: '#94a3b8'
          }}
        >
          <LocalShippingIcon sx={{ fontSize: '500px' }} />
        </Box>

        <Box 
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            opacity: 0.05,
            transform: 'rotate(15deg)',
            pointerEvents: 'none',
            zIndex: 0,
            color: '#94a3b8'
          }}
        >
          <AirplanemodeActiveIcon sx={{ fontSize: '400px' }} />
        </Box>

        {viewMode === 'table' ? (
          <Box sx={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
            <DataGrid
              rows={rows} 
              columns={columns}
              rowCount={data?.shipments?.total || 0}
              autoHeight
              pagination
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 20]}
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={(model) => setSortModel(model)}
              loading={fetching}
              disableRowSelectionOnClick
              onRowClick={(params) => handleOpenView(params.row)}
              sx={{ 
                border: 'none',
                color: '#e2e8f0', 
                fontFamily: 'Inter',
                bgcolor: 'transparent', 
                
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#0f172a', 
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  fontFamily: 'Oswald',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                },
                
                '& .MuiDataGrid-row': {
                  bgcolor: 'transparent', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer'
                },
                
                '& .MuiDataGrid-row:hover': {
                  bgcolor: 'rgba(30, 41, 59, 0.8) !important',
                  transition: 'background-color 0.2s'
                },

                '& .MuiDataGrid-row.Mui-selected': {
                  bgcolor: 'rgba(59, 130, 246, 0.1) !important',
                },
                
                '& .MuiDataGrid-footerContainer': {
                  bgcolor: '#0f172a', 
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8'
                },
                '& .MuiTablePagination-root': { color: '#94a3b8' },
                '& .MuiSvgIcon-root': { color: '#94a3b8' }
              }}
            />
          </Box>
        ) : (
          <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
            <Grid container spacing={3}>
              {rows.map((shipment: any) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={shipment.id}>
                  <Card 
                    onClick={() => handleOpenView(shipment)}
                    sx={{ 
                      cursor: 'pointer', 
                      bgcolor: 'rgba(30, 41, 59, 0.9)', 
                      backdropFilter: 'blur(4px)',
                      color: 'white',
                      borderRadius: 3,
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: '0.3s', 
                      '&:hover': { 
                        transform: 'translateY(-5px)', 
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
                        borderColor: '#3b82f6'
                      } 
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        {renderStatusChip(shipment.status)}
                        <Tooltip title={`Lead: ${shipment.agentName}`}>
                          <Avatar src={shipment.agentImage} sx={{ width: 32, height: 32 }} />
                        </Tooltip>
                      </Stack>
                      
                      <Typography sx={{ fontFamily: 'Oswald', fontSize: '1.2rem', color: '#38bdf8' }}>
                        ${shipment.rate.toLocaleString()}
                      </Typography>
                      <Typography variant="h6" sx={{ fontFamily: 'Oswald', letterSpacing: 1 }} gutterBottom>
                        {shipment.trackingId}
                      </Typography>

                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Origin:</span> <span style={{ color: 'white' }}>{shipment.pickupLocation}</span>
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Dest:</span> <span style={{ color: 'white' }}>{shipment.deliveryLocation}</span>
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" justifyContent="flex-end" mt={2} pt={2} borderTop="1px solid rgba(255,255,255,0.1)" spacing={1}>
                        <IconButton size="small" onClick={(e) => handleOpenEdit(shipment, e)} sx={{ color: '#60a5fa', bgcolor: 'rgba(59,130,246,0.1)' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={(e) => handleDelete(shipment.id, e)} sx={{ bgcolor: 'rgba(239,68,68,0.1)' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* DIALOG MODALS */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1e293b',
            color: 'white',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Oswald', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {modalMode === 'view' ? 'SHIPMENT DETAILS' : (modalMode === 'create' ? 'CREATE SHIPMENT' : 'UPDATE STATUS')}
          <IconButton onClick={() => setIsModalOpen(false)} sx={{ color: '#94a3b8' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          {modalMode === 'view' ? (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>TRACKING ID</Typography>
                  <Typography variant="h5" sx={{ fontFamily: 'Oswald', letterSpacing: 1, color: '#60a5fa' }}>{formData.trackingId}</Typography>
                </Box>
                {renderStatusChip(formData.status)}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}>
                 <Avatar src={formData.agent?.image} sx={{ width: 48, height: 48 }} />
                 <Box>
                    <Typography variant="subtitle2" sx={{ color: '#e2e8f0' }}>Lead Agent</Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'Oswald' }}>{formData.agent?.name}</Typography>
                 </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>SHIPPER</Typography>
                  <Typography variant="body1">{formData.shipperName}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>CARRIER</Typography>
                  <Typography variant="body1">{formData.carrierName}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PlaceIcon fontSize="small" sx={{ color: '#fbbf24' }} />
                    <Box>
                       <Typography variant="caption" sx={{ color: '#94a3b8' }}>ORIGIN</Typography>
                       <Typography variant="body1">{formData.pickupLocation}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PlaceIcon fontSize="small" sx={{ color: '#34d399' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>DESTINATION</Typography>
                      <Typography variant="body1">{formData.deliveryLocation}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>

              <Box sx={{ p: 2, bgcolor: 'rgba(96, 165, 250, 0.1)', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Typography variant="body2" sx={{ color: '#93c5fd' }}>Total Shipment Cost</Typography>
                 <Typography variant="h4" sx={{ fontFamily: 'Oswald', color: '#60a5fa' }}>${formData.rate.toLocaleString()}</Typography>
              </Box>
            </Stack>
          ) : (
            <Grid container spacing={3}>
              {(modalMode === 'edit') && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    label="Update Status"
                    fullWidth
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& fieldset': { borderColor: '#475569' }, '& .MuiSvgIcon-root': { color: '#94a3b8' } }}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="InTransit">In Transit</MenuItem>
                    <MenuItem value="Delivered">Delivered</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </TextField>
                </Grid>
              )}
              
              {['Shipper Name', 'Carrier Name', 'Pickup Location', 'Delivery Location'].map((label, idx) => {
                const key = ['shipperName', 'carrierName', 'pickupLocation', 'deliveryLocation'][idx];
                return (
                  <Grid size={{ xs: 6 }} key={key}>
                    <TextField
                      label={label}
                      fullWidth
                      // @ts-ignore
                      value={formData[key]}
                      // @ts-ignore
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      disabled={modalMode === 'edit'}
                      sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& fieldset': { borderColor: '#475569' }, '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'rgba(255,255,255,0.5)' } }}
                    />
                  </Grid>
                );
              })}

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Rate ($)"
                  type="number"
                  fullWidth
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                  disabled={modalMode === 'edit'}
                  sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& fieldset': { borderColor: '#475569' }, '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'rgba(255,255,255,0.5)' } }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
          {modalMode === 'view' ? (
             <Button onClick={() => setIsModalOpen(false)} variant="contained" sx={{ bgcolor: '#334155' }}>Close</Button>
          ) : (
             <>
               <Button onClick={() => setIsModalOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
               <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#3b82f6', fontFamily: 'Oswald' }}>
                 {modalMode === 'create' ? 'Create' : 'Update Status'}
               </Button>
             </>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}