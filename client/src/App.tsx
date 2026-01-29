import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Shipments from './pages/Shipments';
import Vehicles from './pages/Vehicles'; 
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      {/* ✅ OPEN ACCESS ROUTES 
         No <PrivateRoute> wrapper needed anymore.
         Everyone gets access immediately.
      */}
      
      <Route
        path="/"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      
      <Route
        path="/shipments"
        element={
          <Layout>
            <Shipments />
          </Layout>
        }
      />
      
      <Route
        path="/vehicles"
        element={
          <Layout>
            <Vehicles />
          </Layout>
        }
      />

      {/* Redirect unknown routes to Dashboard */}
      <Route path="*" element={<Layout><Dashboard /></Layout>} />
    </Routes>
  );
}

export default App;