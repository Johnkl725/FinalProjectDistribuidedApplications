import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Suppress CanceledError from appearing in console
// These errors are expected when navigating between pages quickly
const originalConsoleError = console.error;
console.error = (...args) => {
  // Ignore CanceledError messages
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('CanceledError') || args[0].includes('ERR_CANCELED'))
  ) {
    return;
  }
  // Ignore React error boundary messages for CanceledError
  if (args[0]?.name === 'CanceledError' || args[0]?.code === 'ERR_CANCELED') {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Temporarily disable StrictMode to avoid double-mounting causing request cancellations
// In production this won't be an issue since StrictMode is dev-only
createRoot(document.getElementById('root')).render(
  <App />
)
