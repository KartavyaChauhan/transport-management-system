import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Paper, Typography, Grid } from '@mui/material'; // <--- KEEP AS "Grid"

const DELIVERY_DATA = [
  { name: 'Mon', time: 24 }, { name: 'Tue', time: 18 },
  { name: 'Wed', time: 30 }, { name: 'Thu', time: 20 },
  { name: 'Fri', time: 45 }, { name: 'Sat', time: 12 },
];

const COUNTRY_DATA = [
  { name: 'USA', value: 400 }, { name: 'UK', value: 300 },
  { name: 'DE', value: 300 }, { name: 'JP', value: 200 },
];

const STATUS_DATA = [
  { name: 'Active', value: 12, color: '#00C49F' },
  { name: 'Idle', value: 5, color: '#FFBB28' },
  { name: 'Maint.', value: 3, color: '#FF8042' },
];

export default function DashboardCharts() {
  return (
    <Grid container spacing={3}>
      {/* Chart 1: Avg Delivery Time */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2, height: 300, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>Avg. Delivery Time (Hrs)</Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DELIVERY_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="time" stroke="#2196F3" strokeWidth={3} dot={{r:4}} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Chart 2: Vehicle Status */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2, height: 300, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>Fleet Status</Typography>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={STATUS_DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {STATUS_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Chart 3: Delivery by Country */}
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2, height: 300, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>Deliveries by Country</Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={COUNTRY_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" fill="#673AB7" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}