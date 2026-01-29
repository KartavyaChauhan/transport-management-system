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
import VisibilityIcon from '@mui/icons-material/Visibility'; 
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'; // Main Logo
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'; // Watermark
import RadarIcon from '@mui/icons-material/Radar'; 
import EvStationIcon from '@mui/icons-material/EvStation';

import { GET_VEHICLES } from '../graphql/queries';

/* ------------------------------------------------------------------
   MUTATIONS
------------------------------------------------------------------ */
const ADD_VEHICLE = gql`
  mutation AddVehicle(
    $plateNumber: String!, 
    $vehicleModel: String!, 
    $type: String!, 
    $driverName: String!
  ) {
    addVehicle(
      plateNumber: $plateNumber, 
      vehicleModel: $vehicleModel, 
      type: $type, 
      driverName: $driverName
    ) {
      id
      plateNumber
      status
    }
  }
`;

const DELETE_VEHICLE = gql`
  mutation DeleteVehicle($id: ID!) {
    deleteVehicle(id: $id)
  }
`;

/* ------------------------------------------------------------------
   COMPONENT
------------------------------------------------------------------ */
export default function Vehicles() {
  // --- UI State ---
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'view'>('view');
  
  // ✅ STATE FOR RANDOM DRIVERS
  const [drivers, setDrivers] = useState<any[]>([]);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ 
    open: false, message: '', severity: 'success' 
  });

  // --- Form State ---
  const [formData, setFormData] = useState({
    id: '',
    plateNumber: '',
    vehicleModel: '',
    type: 'Truck',
    driverName: '',
    status: 'Idle',
    driverImage: '' 
  });

  // --- Pagination & Sorting ---
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // --- GraphQL Hooks ---
  const [{ data, fetching, error }, reexecuteQuery] = useQuery({ query: GET_VEHICLES });
  const [, addVehicle] = useMutation(ADD_VEHICLE);
  const [, deleteVehicle] = useMutation(DELETE_VEHICLE);

  /* ------------------------------------------------------------------
     1. FETCH REAL RANDOM DRIVERS (Consistent via seed=fleet)
  ------------------------------------------------------------------ */
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        // seed=fleet ensures the same "random" drivers load every time
        const response = await fetch('https://randomuser.me/api/?results=50&inc=name,picture&seed=fleet');
        const data = await response.json();
        setDrivers(data.results);
      } catch (err) {
        console.error("Failed to fetch drivers", err);
      }
    };
    fetchDrivers();
  }, []);

  /* ------------------------------------------------------------------
     2. MERGE DATA (Vehicles + Random Drivers)
  ------------------------------------------------------------------ */
  const rows = useMemo(() => {
    if (!data?.vehicles || drivers.length === 0) return [];
    
    return data.vehicles.map((vehicle: any, index: number) => {
      const driverData = drivers[index % drivers.length];
      return {
        ...vehicle,
        // Override backend name with realistic API name for visual demo
        visualDriverName: `${driverData.name.first} ${driverData.name.last}`,
        visualDriverImage: driverData.picture.medium
      };
    });
  }, [data, drivers]);

  /* ------------------------------------------------------------------
     HANDLERS
  ------------------------------------------------------------------ */
  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({ 
      id: '', plateNumber: '', vehicleModel: '', type: 'Truck', 
      driverName: '', status: 'Idle', driverImage: '' 
    });
    setIsModalOpen(true);
  };

  const handleOpenView = (row: any) => {
    setModalMode('view');
    setFormData({ 
      ...row, 
      driverName: row.visualDriverName,
      driverImage: row.visualDriverImage
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this vehicle from the fleet?')) {
      const result = await deleteVehicle({ id });
      if (result.error) {
        setSnackbar({ open: true, message: `Delete Failed: ${result.error.message}`, severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'Vehicle removed successfully', severity: 'success' });
        reexecuteQuery({ requestPolicy: 'network-only' });
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (modalMode === 'create') {
        const result = await addVehicle({
          plateNumber: formData.plateNumber,
          vehicleModel: formData.vehicleModel,
          type: formData.type,
          driverName: formData.driverName || "Unassigned", 
        });
        if (result.error) throw new Error(result.error.message);
        setSnackbar({ open: true, message: 'Vehicle added to fleet!', severity: 'success' });
      }
      setIsModalOpen(false);
      reexecuteQuery({ requestPolicy: 'network-only' });
    } catch (err: any) {
      setSnackbar({ open: true, message: `Operation Failed: ${err.message}`, severity: 'error' });
    }
  };

  const renderStatusChip = (status: string) => {
    // Keep status colors distinct regardless of theme
    const bgColors: any = {
      Active: '#065f46', // Dark Green
      Maintenance: '#7f1d1d', // Dark Red
      Idle: '#1e40af' // Dark Blue
    };
    const textColors: any = {
      Active: '#34d399', 
      Maintenance: '#f87171',
      Idle: '#60a5fa'
    };

    return (
      <Chip 
        label={status} 
        size="small" 
        sx={{ 
          bgcolor: bgColors[status] || 'rgba(255,255,255,0.1)',
          color: textColors[status] || 'white',
          fontWeight: 600, 
          fontFamily: 'Oswald', 
          minWidth: 80,
          border: `1px solid ${textColors[status] || 'gray'}`
        }} 
      />
    );
  };

  /* ------------------------------------------------------------------
     COLUMNS
  ------------------------------------------------------------------ */
  const columns: GridColDef[] = [
    { field: 'plateNumber', headerName: 'Plate Number', width: 150 },
    { field: 'vehicleModel', headerName: 'Model', flex: 1, minWidth: 150 },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 120,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ height: '100%', color: '#94a3b8' }}>
          <EvStationIcon fontSize="small" />
          <Typography variant="body2">{params.value}</Typography>
        </Stack>
      )
    },
    
    // ✅ DRIVER COLUMN (With Avatar)
    { 
      field: 'visualDriverName', 
      headerName: 'Assigned Driver', 
      width: 220,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ height: '100%' }}>
          <Avatar 
            src={params.row.visualDriverImage} 
            sx={{ width: 30, height: 30, border: '2px solid rgba(255,255,255,0.1)' }} 
          />
          <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Stack>
      )
    },

    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => renderStatusChip(params.value),
    },
    
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="View Details">
            {/* ✅ Changed Color to Blue */}
            <IconButton 
              size="small" 
              onClick={(e) => handleOpenView(params.row)} 
              sx={{ color: '#60a5fa', mr: 1 }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Remove Vehicle">
            <IconButton size="small" color="error" onClick={(e) => handleDelete(params.row.id, e)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (error) return <Typography color="error">Error loading fleet: {error.message}</Typography>;

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      
      {/* ✅ Orbitron Font */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');`}
      </style>

      {/* HEADER */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={4} spacing={2}>
        <Box>
          {/* Logo + Title */}
          <Stack direction="row" alignItems="center" spacing={2} mb={0.5}>
            <Box 
              sx={{ 
                p: 1, 
                borderRadius: 2, 
                // ✅ Blue Gradient BG
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DirectionsCarIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontFamily: 'Oswald', 
                fontWeight: 700, 
                // ✅ Blue/Purple Text Gradient
                background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}
            >
              Fleet Management
            </Typography>
          </Stack>

          {/* Subtitle */}
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
              Monitor vehicles, drivers, and maintenance status.
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
              // ✅ Blue Selected State
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
              // ✅ Blue Button
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
            Add Vehicle
          </Button>
        </Stack>
      </Stack>

      {/* CONTENT AREA */}
      <Paper 
        sx={{ 
          width: '100%', 
          borderRadius: 3, 
          overflow: 'hidden', 
          bgcolor: '#111827', 
          border: '1px solid rgba(255,255,255,0.08)',
          minHeight: 400,
          position: 'relative' 
        }}
      >
        
        {/* ✅ WATERMARKS (Changed to subtle gray like Shipments) */}
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
          <DirectionsCarIcon sx={{ fontSize: '500px' }} />
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
          <SettingsSuggestIcon sx={{ fontSize: '400px' }} />
        </Box>

        {viewMode === 'table' ? (
          <Box sx={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
            <DataGrid
              rows={rows} 
              columns={columns}
              rowCount={rows.length} 
              autoHeight
              pagination
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 20]}
              sortingMode="client"
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
                
                // ✅ Blue Hover State
                '& .MuiDataGrid-row:hover': {
                  bgcolor: 'rgba(30, 41, 59, 0.8) !important',
                  transition: 'background-color 0.2s'
                },

                // ✅ Blue Selected State
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
              {rows.map((vehicle: any) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={vehicle.id}>
                  <Card 
                    onClick={() => handleOpenView(vehicle)}
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
                        // ✅ Blue Hover Border
                        borderColor: '#3b82f6'
                      } 
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        {renderStatusChip(vehicle.status)}
                        <Tooltip title={`Driver: ${vehicle.visualDriverName}`}>
                          <Avatar src={vehicle.visualDriverImage} sx={{ width: 32, height: 32 }} />
                        </Tooltip>
                      </Stack>
                      
                      {/* ✅ Cyan Text Color */}
                      <Typography sx={{ fontFamily: 'Oswald', fontSize: '1.4rem', color: '#38bdf8' }}>
                        {vehicle.plateNumber}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                        {vehicle.vehicleModel}
                      </Typography>

                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                      
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                         <Stack direction="row" spacing={1} alignItems="center">
                            <EvStationIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                            <Typography variant="caption" sx={{ color: '#e2e8f0' }}>{vehicle.type}</Typography>
                         </Stack>
                         <IconButton size="small" color="error" onClick={(e) => handleDelete(vehicle.id, e)} sx={{ bgcolor: 'rgba(239,68,68,0.1)' }}>
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
          {modalMode === 'view' ? 'VEHICLE DETAILS' : 'ADD NEW VEHICLE'}
          <IconButton onClick={() => setIsModalOpen(false)} sx={{ color: '#94a3b8' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          {modalMode === 'view' ? (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>PLATE NUMBER</Typography>
                  {/* ✅ Light Blue Text */}
                  <Typography variant="h4" sx={{ fontFamily: 'Oswald', letterSpacing: 1, color: '#60a5fa' }}>{formData.plateNumber}</Typography>
                </Box>
                {renderStatusChip(formData.status)}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}>
                 <Avatar src={formData.driverImage} sx={{ width: 56, height: 56 }} />
                 <Box>
                    <Typography variant="subtitle2" sx={{ color: '#e2e8f0' }}>Assigned Driver</Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'Oswald' }}>{formData.driverName}</Typography>
                 </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>MODEL</Typography>
                  <Typography variant="body1">{formData.vehicleModel}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>TYPE</Typography>
                  <Typography variant="body1">{formData.type}</Typography>
                </Grid>
              </Grid>
            </Stack>
          ) : (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Plate Number"
                  fullWidth
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                  sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& fieldset': { borderColor: '#475569' } }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Model"
                  fullWidth
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& fieldset': { borderColor: '#475569' } }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  select
                  label="Type"
                  fullWidth
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& fieldset': { borderColor: '#475569' }, '& .MuiSvgIcon-root': { color: '#94a3b8' } }}
                >
                  <MenuItem value="Truck">Truck</MenuItem>
                  <MenuItem value="Van">Van</MenuItem>
                  <MenuItem value="Bike">Bike</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Driver Name (Optional)"
                  fullWidth
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  helperText="Leave blank to assign a random driver"
                  sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& fieldset': { borderColor: '#475569' }, '& .MuiFormHelperText-root': { color: '#64748b' } }}
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
               {/* ✅ Blue Submit Button */}
               <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#3b82f6', fontFamily: 'Oswald' }}>
                 Add Vehicle
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