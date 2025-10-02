import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/App.css';
import LoadComponent from './components/LoadComponent';


const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/+$/, ''); // Remove trailing slash

// Unregister any existing service workers (for debugging purposes)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
  });
}

const serviceWorkerPath = `${publicUrl}/service-worker.js`;
console.log('Service Worker Path:', serviceWorkerPath);

// Register the service worker for PWA functionality
if('serviceWorker' in navigator) {
  navigator.serviceWorker.register(serviceWorkerPath)
    .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
        console.error('Service Worker registration failed:', error);
    });
  }else{
    console.log('Service Workers are not supported in this browser.');
  }

console.log('Rendering ExampleComponent...');

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
  document.getElementById('root')
);