import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/App.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { BrowserRouter } from 'react-router-dom';

const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

console.log('Enviroment loaded :', process.env);

//In development , ensure no SW is intercepting requests
// if('serviceWorker' in navigator && isLocalhost) {
//   navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
//   console.log('Unregistered existing service workers on localhost for development purposes.');
// }

// In production, register the service worker using a relative URL
// if('serviceWorker' in navigator && !isLocalhost) {
//   const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
//   navigator.serviceWorker
//   .register(swUrl)
//   .then((registration) => {
//       console.log('Service Worker registered with scope:', registration.scope);
//   })
//   .catch((error) => {
//       console.error('Service Worker registration failed:', error);
//   }); 
// }

// Register SW only in production
if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register();
} else {
  // In dev, ensure no SW interferes
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
  }
}

const basename = process.env.PUBLIC_URL || '/';
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the service worker for offline capabilities and faster load times
// This will allow the app to work offline and load faster on subsequent visits
// However, it also means that developers (and users) will only see deployed updates on subsequent visits to a page, after all the existing tabs open on the page have been closed, since previously cached resources are updated in the background.
// To learn more about the benefits of this model and instructions on how to opt-in, read https://cra.link/PWA
serviceWorkerRegistration.register();