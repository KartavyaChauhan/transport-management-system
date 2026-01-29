import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const drawerWidth = 240;

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(!isMobile);

  useEffect(() => {
    if (isMobile) setOpen(false);
  }, [isMobile]);

  // ❌ REMOVED: Logout Logic

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Shipments', icon: <LocalShippingIcon />, path: '/shipments' },
    { text: 'Vehicles', icon: <DirectionsCarIcon />, path: '/vehicles' },
  ];

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        bgcolor: '#0f172a', 
        overflowX: 'hidden',
      }}
    >
      <CssBaseline />

      {/* APP BAR */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: '#1a2035',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && !isMobile && {
            marginLeft: drawerWidth,
            width: `calc(100vw - ${drawerWidth}px)`, 
          }),
        }}
      >
        <Toolbar>
          <IconButton color="inherit" onClick={() => setOpen(!open)}>
            <MenuIcon />
          </IconButton>

          <Typography sx={{ flexGrow: 1, ml: 2, fontFamily: 'Oswald', letterSpacing: 1 }} fontWeight={600}>
            Control Center
          </Typography>

          {/* ❌ REMOVED: Logout Button */}
        </Toolbar>
      </AppBar>

      {/* DRAWER */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#111827',
            color: 'white',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          },
        }}
      >
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Typography fontWeight={800} sx={{ letterSpacing: 1, fontFamily: 'Oswald', color: '#60a5fa' }}>
            TMS LOGISTICS
          </Typography>
        </Toolbar>

        <List sx={{ px: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  color: '#94a3b8',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(59, 130, 246, 0.2)', // Classy blue tint
                    color: '#60a5fa',
                    '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.3)' },
                    '& .MuiListItemIcon-root': { color: '#60a5fa' },
                  },
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.05),
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: '#94a3b8' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontFamily: 'Inter', fontWeight: 500 }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          width: !isMobile && open ? `calc(100vw - ${drawerWidth}px)` : '100vw',
          minHeight: '100vh',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: !isMobile && open ? `${drawerWidth}px` : 0,
        }}
      >
        <Toolbar /> 
        {children}
      </Box>
    </Box>
  );
}