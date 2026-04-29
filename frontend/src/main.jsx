import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import CustomerView from './pages/CustomerView';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/table/:uuid" element={<CustomerView />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/" element={
          <div className="flex items-center justify-center" style={{ height: '100vh', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 48 }}>☕</div>
            <h1 className="text-2xl font-bold">Cafe System</h1>
            <p className="text-secondary">Scan your table QR to start ordering</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
