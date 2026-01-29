import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Client, Provider, cacheExchange, fetchExchange } from 'urql';
import { BrowserRouter } from 'react-router-dom';

// ✅ ONLY CHANGE: correct URL + env support
const client = new Client({
  url: import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql',
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Apollo-Require-Preflight': 'true',
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
  </React.StrictMode>
);
