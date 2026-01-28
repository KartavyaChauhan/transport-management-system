import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' 
import './index.css'
import { Client, Provider, cacheExchange, fetchExchange } from 'urql';
import { BrowserRouter } from 'react-router-dom';

// 1. Initialize the Urql Client with Security Headers
const client = new Client({
  url: 'http://localhost:4000/',
  exchanges: [cacheExchange, fetchExchange],
  // This is the specific fix for the CSRF error:
  fetchOptions: () => {
    // 1. Get token from storage
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Apollo-Require-Preflight': 'true',
        // 2. Attach token if it exists
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider value={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)