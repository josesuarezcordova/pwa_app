import React from 'react';
import './styles/App.css';
import { BrowserRouter, HashRouter, Routes, Route, Link  } from 'react-router-dom';
import LoadComponent from './components/LoadComponent';
import PredictionComponent from './components/PredictionComponent';

const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const Router = isLocalhost ? BrowserRouter : HashRouter;

function App() {
    return (
        <Router>            
            <Routes>
                <Route path="/" element={<LoadComponent />} />
                <Route path="/predict" element={<PredictionComponent />} />
            </Routes>             
        </Router>
    );
}

export default App;