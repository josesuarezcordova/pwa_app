import React from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Routes, Route, Link  } from 'react-router-dom';
import LoadComponent from './components/LoadComponent';
import PredictionComponent from './components/PredictionComponent';

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