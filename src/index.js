import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/App.css';
import { BrowserRouter, HashRouter } from 'react-router-dom';
// import LoadComponent from './components/LoadComponent';

const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/+$/, ''); // Remove trailing slash

//In development , ensure no SW is intercepting requests
if('serviceWorker' in navigator && isLocalhost) {
  navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
  console.log('Unregistered existing service workers on localhost for development purposes.');
}

// In production, register the service worker using a relative URL
if('serviceWorker' in navigator && !isLocalhost) {
  const swUrl = new URL('./service-worker.js', window.location.href).toString();
  navigator.serviceWorker
  .register(swUrl)
  .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
  })
  .catch((error) => {
      console.error('Service Worker registration failed:', error);
  }); 
}

const rootElement = document.getElementById('root');
const Router = isLocalhost ? BrowserRouter : HashRouter;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);