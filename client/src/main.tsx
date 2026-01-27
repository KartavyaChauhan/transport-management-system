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
    return {
      headers: {
        // The "Secret Handshake" that tells Apollo Server we are legit
        'Apollo-Require-Preflight': 'true',
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