import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { useAccessibility } from './hooks/useAccessibility';
import { initSentry } from './lib/sentry';

// Initialize Sentry error tracking
initSentry();

// Initialize accessibility preferences on app load
function AccessibilityInitializer() {
  useAccessibility();
  return null;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AccessibilityInitializer />
    <App />
  </React.StrictMode>
);
