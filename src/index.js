import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/App.css';
import LoadComponent from './components/LoadComponent';


console.log('Checking Registering service worker...');
if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
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

ReactDOM.render(
  <React.StrictMode>
    <LoadComponent />
  </React.StrictMode>,
  document.getElementById('root')
);