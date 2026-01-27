import React from 'react';
import Layout from './components/Layout';
import { Typography, Container, Paper } from '@mui/material';

function App() {
  return (
    // Wrap everything in our new Layout
    <Layout>
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, mt: 3 }}>
           <Typography variant="h4" gutterBottom color="primary">
             Welcome to the Transportation Management System
           </Typography>
           <Typography variant="body1">
             This is the main content area where the shipment grid will appear soon.
           </Typography>
        </Paper>
      </Container>
    </Layout>
  );
}

export default App;