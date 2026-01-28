import React, { useState } from 'react';
import { useMutation } from 'urql';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Paper, TextField, Button, Typography, Box, Alert, CircularProgress 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { LOGIN_USER } from '../graphql/mutations';

export default function Login() {
  const navigate = useNavigate();
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Mutation Hook
  const [result, login] = useMutation(LOGIN_USER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Execute Mutation
    const response = await login({ email, password });

    if (response.error) {
      setErrorMsg(response.error.message.replace("[GraphQL] ", ""));
      return;
    }

    if (response.data) {
      // 1. Save Token to Local Storage
      localStorage.setItem('token', response.data.login.token);
      localStorage.setItem('role', response.data.login.user.role);
      
      // 2. Force a page reload to update the URQL client headers
      window.location.href = '/'; 
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', borderRadius: '50%', color: 'white', mb: 2 }}>
            <LockOutlinedIcon />
          </Box>
          
          <Typography component="h1" variant="h5">
            TMS Sign In
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={result.fetching}
            >
              {result.fetching ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}