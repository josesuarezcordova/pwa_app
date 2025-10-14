import React, {useState, useEffect} from 'react';
import './styles/App.css';
import { BrowserRouter, HashRouter,Routes, Route } from 'react-router-dom';
import LoadComponent from './components/LoadComponent';
import PredictionComponent from './components/PredictionComponent';
import SplashComponent from './components/SplashComponent';
import HeaderComponent from './components/HeaderComponent';

const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const Router = isLocalhost ? BrowserRouter : HashRouter;

function App() {
    const [showSplash, setShowSplash] = useState(true);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 5000); // Show splash screen for 3 seconds

        return () => clearTimeout(timer);
    }, []);
    return (
        <Router>
            {showSplash ? (
                <SplashComponent />
            ) : ( 
                <>
                    <HeaderComponent/>  
                    <Routes>
                        <Route path="/" element={<LoadComponent />} />
                        <Route path="/predict" element={<PredictionComponent />} />
                    </Routes>
                </>
            )}             
        </Router>
    );
}

export default App;