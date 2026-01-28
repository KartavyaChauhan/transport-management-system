import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import ShipmentList from './components/ShipmentList';
import { Container } from '@mui/material';

// FIX: Use React.ReactElement to avoid "JSX namespace" errors
const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem('token');
  // If no token, force redirect to /login
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Container maxWidth="xl">
                <ShipmentList />
              </Container>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;