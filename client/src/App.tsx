import React from 'react';
import Layout from './components/Layout';
import ShipmentList from './components/ShipmentList'; // <--- Import the new component
import { Container } from '@mui/material';

function App() {
  return (
    <Layout>
      <Container maxWidth="xl">
        {/* Render the actual Shipment List instead of text */}
        <ShipmentList />
      </Container>
    </Layout>
  );
}

export default App;