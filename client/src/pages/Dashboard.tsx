import React, { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Stack,
  Button,
  alpha,
  Paper,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { SvgIconProps } from '@mui/material/SvgIcon';

// Icons
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BuildIcon from '@mui/icons-material/Build';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AddIcon from '@mui/icons-material/Add';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PublicIcon from '@mui/icons-material/Public'; 
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HubIcon from '@mui/icons-material/Hub'; // ✅ NEW LOGO
import RadarIcon from '@mui/icons-material/Radar'; // ✅ NEW SUBTITLE ICON

import { GET_DASHBOARD_STATS } from '../graphql/queries';
import DashboardCharts from '../components/DashboardCharts';

/* ──────────────────────────────────────────────
   ANIMATED COUNTER
──────────────────────────────────────────────── */
const AnimatedNumber = ({ value, isCurrency = false }: { value: number, isCurrency?: boolean }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500; 
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = Math.max(1, value / steps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{isCurrency ? `$${display.toLocaleString()}` : Math.floor(display).toLocaleString()}</>;
};

/* ──────────────────────────────────────────────
   FINANCIAL SUMMARY WIDGET
──────────────────────────────────────────────── */
const FinancialWidget = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
  <Stack 
    direction="row" 
    alignItems="center" 
    spacing={2} 
    sx={{ 
      p: 1.5, 
      pr: 3,
      borderRadius: 3, 
      bgcolor: alpha(color, 0.1), 
      border: `1px solid ${alpha(color, 0.2)}`,
      backdropFilter: 'blur(10px)'
    }}
  >
    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(color, 0.2), color: color, display: 'flex' }}>
      {icon}
    </Box>
    <Box>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h5" sx={{ fontFamily: 'Oswald', fontWeight: 700, color: color, lineHeight: 1 }}>
          <AnimatedNumber value={value} isCurrency />
        </Typography>
        <TrendingUpIcon sx={{ color: color, fontSize: '1rem', opacity: 0.8 }} />
      </Stack>
      <Typography variant="body2" sx={{ color: alpha('#fff', 0.7), fontFamily: 'Inter', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Typography>
    </Box>
  </Stack>
);

/* ──────────────────────────────────────────────
   KPI CARD
──────────────────────────────────────────────── */
const KpiCard = ({
  title,
  value,
  icon,
  color,
  accent,
}: {
  title: string;
  value: number;
  icon: React.ReactElement<SvgIconProps>;
  color: string;
  accent: string;
}) => (
  <Card
    sx={{
      borderRadius: 4,
      background: `linear-gradient(135deg, ${alpha('#1e293b', 0.9)}, ${alpha('#0f172a', 0.95)})`,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${alpha(color, 0.15)}`,
      boxShadow: `0 8px 32px -4px ${alpha('#000', 0.5)}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: `0 20px 40px -4px ${alpha(color, 0.25)}`,
        border: `1px solid ${alpha(color, 0.4)}`,
        '& .icon-box': {
          transform: 'scale(1.1) rotate(5deg)',
          background: `linear-gradient(135deg, ${color}, ${accent})`,
        }
      },
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: 150,
        height: 150,
        background: `radial-gradient(circle, ${alpha(color, 0.2)} 0%, transparent 70%)`,
        filter: 'blur(40px)',
        zIndex: 0,
      }}
    />

    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography
            variant="overline"
            sx={{
              color: alpha('#fff', 0.6),
              fontWeight: 600,
              letterSpacing: 1.5,
              fontSize: '0.75rem',
              fontFamily: 'Inter',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Oswald',
              fontWeight: 700,
              mt: 1,
              background: `linear-gradient(180deg, #fff, ${alpha('#fff', 0.7)})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 10px rgba(255,255,255,0.1))'
            }}
          >
            <AnimatedNumber value={value} />
          </Typography>
        </Box>

        <Box
          className="icon-box"
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(color, 0.2)}, ${alpha(color, 0.1)})`,
            display: 'grid',
            placeItems: 'center',
            color: accent,
            border: `1px solid ${alpha(color, 0.2)}`,
            transition: 'all 0.3s ease',
            boxShadow: `inset 0 0 20px ${alpha(color, 0.1)}`
          }}
        >
          {React.cloneElement(icon, { fontSize: 'large' as const })}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

/* ──────────────────────────────────────────────
   GLASS CONTAINER
──────────────────────────────────────────────── */
const GlassContainer = ({ title, children, action }: { title: string; children: React.ReactNode, action?: React.ReactNode }) => (
  <Box
    sx={{
      height: '100%',
      p: 3,
      borderRadius: 4,
      background: 'rgba(17, 24, 39, 0.7)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
    
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
      <Typography variant="h6" sx={{ fontFamily: 'Oswald', fontWeight: 500, letterSpacing: 1, color: '#e2e8f0' }}>
        {title}
      </Typography>
      {action}
    </Stack>
    
    <Box sx={{ flex: 1 }}>
      {children}
    </Box>
  </Box>
);

/* ──────────────────────────────────────────────
   MAIN DASHBOARD COMPONENT
──────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const [{ data, fetching, error }] = useQuery({ query: GET_DASHBOARD_STATS });

  if (fetching) return <Box sx={{ height: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#0f172a' }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">Failed to load dashboard.</Typography>;

  const pendingCount = data?.dashboardStats?.pending?.count || 0;
  const transitCount = data?.dashboardStats?.transit?.count || 0;
  const transitValue = data?.dashboardStats?.transit?.totalValue || 0; 
  const pendingValue = data?.dashboardStats?.pending?.totalValue || 0;

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        p: { xs: 2, md: 4, lg: 5 },
        bgcolor: '#0f172a',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ✅ Add Orbitron Font for that "Control Center" Look */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');`}
      </style>

      {/* WATERMARK */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          right: '-5%',
          opacity: 0.03,
          pointerEvents: 'none',
          zIndex: 0,
          color: '#60a5fa',
          transform: 'rotate(15deg) scale(1.5)',
        }}
      >
        <PublicIcon sx={{ fontSize: '800px' }} />
      </Box>

      {/* CONTENT */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        
        {/* HEADER */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={5} spacing={3}>
          <Box>
            {/* ✅ NEW LOGO SECTION */}
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
                <HubIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'Oswald',
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: 1,
                }}
              >
                LOGISTICS DASHBOARD
              </Typography>
            </Stack>

            {/* ✅ NEW SUBTITLE WITH ICON & FONT */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
              <RadarIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
              <Typography 
                variant="body1" 
                sx={{ 
                  color: alpha('#fff', 0.6), 
                  fontFamily: 'Orbitron, sans-serif', // Futuristic Font
                  letterSpacing: 1,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase'
                }}
              >
                Supply Chain Control Center • Real-time Financial Overview
              </Typography>
            </Stack>
          </Box>

          {/* FINANCIAL WIDGETS */}
          <Stack direction="row" spacing={2}>
            <FinancialWidget 
              title="Active Value (In Transit)" 
              value={transitValue} 
              icon={<FlightTakeoffIcon />} 
              color="#22d3ee" 
            />
            <FinancialWidget 
              title="Pending Revenue" 
              value={pendingValue} 
              icon={<LocalShippingOutlinedIcon />} 
              color="#fbbf24" 
            />
          </Stack>
        </Stack>

        {/* KPI CARDS */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 5
          }}
        >
          <KpiCard title="Total Shipments" value={data?.dashboardStats?.total?.count || 0} icon={<LocalShippingIcon />} color="#3b82f6" accent="#60a5fa" />
          <KpiCard title="Pending Orders" value={pendingCount} icon={<AccessTimeIcon />} color="#f59e0b" accent="#fbbf24" />
          <KpiCard title="In Transit" value={transitCount} icon={<FlightTakeoffIcon />} color="#06b6d4" accent="#22d3ee" />
          <KpiCard title="Delivered" value={data?.dashboardStats?.delivered?.count || 0} icon={<CheckCircleIcon />} color="#10b981" accent="#34d399" />
        </Box>

        {/* CHARTS & ALERTS */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2.5fr 1fr' }, gap: 4 }}>
          
          <GlassContainer title="PERFORMANCE & ANALYTICS">
            <DashboardCharts />
          </GlassContainer>

          <Stack spacing={4}>
            
            {/* SYSTEM ALERTS */}
            <GlassContainer title="SYSTEM ALERTS">
              <Stack spacing={2}>
                {pendingCount > 4 && (
                  <Paper sx={{ p: 2, bgcolor: alpha('#f59e0b', 0.1), border: `1px solid ${alpha('#f59e0b', 0.2)}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <WarningAmberIcon sx={{ color: '#fbbf24' }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#fbbf24', fontWeight: 600 }}>Attention Needed</Typography>
                      <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>{pendingCount} shipments are pending processing.</Typography>
                    </Box>
                  </Paper>
                )}
                
                <Paper sx={{ p: 2, bgcolor: alpha('#ef4444', 0.1), border: `1px solid ${alpha('#ef4444', 0.2)}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <BuildIcon sx={{ color: '#f87171' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#f87171', fontWeight: 600 }}>Maintenance Alert</Typography>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>Vehicle V-104 requires service check.</Typography>
                  </Box>
                </Paper>

                {transitCount === 0 && (
                  <Paper sx={{ p: 2, bgcolor: alpha('#3b82f6', 0.1), border: `1px solid ${alpha('#3b82f6', 0.2)}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PendingActionsIcon sx={{ color: '#60a5fa' }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#60a5fa', fontWeight: 600 }}>Fleet Idle</Typography>
                      <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>No active shipments in transit right now.</Typography>
                    </Box>
                  </Paper>
                )}
              </Stack>
            </GlassContainer>

            {/* QUICK ACTIONS */}
            <GlassContainer title="QUICK ACTIONS">
              <Stack spacing={2}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={() => navigate('/shipments')} 
                  sx={{ 
                    bgcolor: '#3b82f6', 
                    py: 1.5, 
                    fontFamily: 'Oswald', 
                    fontSize: '1rem',
                    letterSpacing: 1,
                    '&:hover': { bgcolor: '#2563eb' } 
                  }}
                >
                  Create New Shipment
                </Button>
                
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<DirectionsCarIcon />} 
                  onClick={() => navigate('/vehicles')}
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.2)', 
                    color: 'white', 
                    py: 1.5, 
                    fontFamily: 'Oswald', 
                    letterSpacing: 1,
                    '&:hover': { borderColor: '#60a5fa', bgcolor: 'rgba(96, 165, 250, 0.1)' } 
                  }}
                >
                  Manage Vehicles
                </Button>
              </Stack>
            </GlassContainer>

          </Stack>
        </Box>
      </Box>
    </Box>
  );
}