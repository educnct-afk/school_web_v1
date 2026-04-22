import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@core/stores/queryClient';
import { ConfirmProvider } from '@core/ui/ConfirmDialog';
import '@core/stores/themeStore';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConfirmProvider>
          <App />
          <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        </ConfirmProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
