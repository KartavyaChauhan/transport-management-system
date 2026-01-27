import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' 
import './index.css'
import { Client, Provider, cacheExchange, fetchExchange } from 'urql';
import { BrowserRouter } from 'react-router-dom';

// 1. Initialize the Urql Client (Simpler than Apollo)
const client = new Client({
  url: 'http://localhost:4000/',
  exchanges: [cacheExchange, fetchExchange],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. Wrap the App with Urql Provider */}
    <Provider value={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)