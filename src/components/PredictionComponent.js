import React, {useEffect, useState, useMemo, useCallback} from "react";
import './styles/PredictionComponent.css';
import "../styles/App.css" // Reusing LoadComponent styles for modal
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';

const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/+$/, ''); // Remove trailing slash

const PredictionComponent = () => {
    const [currentImage, setCurrentImage] = useState(null);
    const [predictedLabel, setPredictedLabel] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    const importTestImages = () => {
        const context = require.context('../assets/test_images', false, /\.(png|jpe?g|svg)$/);
        return context.keys().map(k => { 
            const mod= context(k);
            return { src: mod.default || mod }; 
        });
    };
    
    // Load image list only once
    const images = useMemo(() => importTestImages(), []);

    // Pick a random image from the list
    const getRandomImage = useCallback(() => {
        if(!Array.isArray(images) || images.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }, [images]);

    // Set a random image on component mount
    useEffect(() => {
        const img = getRandomImage();
        if (img) setCurrentImage(img);
    }, [getRandomImage]);

    const handleImageClick = async () => { 
        try {
            setShowModal(true);
            setIsLoading(true); // Show loading indicator
            setPredictedLabel(""); // Clear previous prediction

            const img = new Image();
            img.crossOrigin = "anonymous"; // Handle CORS
            img.src = currentImage.src;

            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const model = await mobilenet.load();
            const features = model.infer(img, true); // 'true' returns the intermediate activation activations
            const flattenedFeatures = features.flatten(); // Flatten the tensor to 1D

            console.log("Extracted Features:", flattenedFeatures.arraySync()); // Log the features
  
            // const API_BASE_URL = "https://09308f17d55c.ngrok-free.app"; // Replace with your actual API base URL

            const API_BASE_URL = "http://127.0.0.1:5000"; // Replace with your actual API base URL

            const response = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ features: flattenedFeatures.arraySync() })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const result = await response.json();
            setPredictedLabel(result.label);//display prediction
        } catch (error) {
            console.error("Error during prediction:", error);
            setPredictedLabel("Error during prediction. Please try again.");
        } finally {
            setIsLoading(false); // Hide loading indicator
        }
    };

    const handleReload = () => {
        window.location.reload();
    }

    const handleModalOk = () => {
        setShowModal(false);
        setPredictedLabel("");
        setIsLoading(false);
        setCurrentImage(getRandomImage());
    };

    return (
        <div className="prediction-screen">
            
            <h3 className="splash-title">Click on the image</h3>
            {currentImage && (
                <div className="image-container" onClick={handleImageClick}>
                    <img 
                        src={currentImage.src} 
                        alt="To be classified" 
                        className={isLoading ? 'loading' : ''} 
                        style={{ cursor: 'pointer' }}    
                    />
                </div>
            )}
           
            {/* {isLoading && <p>Loading model and predicting...</p>}
            {predictedLabel && !isLoading && <p className="prediction-result">Predicted Label: {predictedLabel}</p>}
             */}
            {/* Modal reused from LoadComponent styles */}
            {showModal && (
            <div className="modal">
                <div className="modal-content">
                {isLoading ? (
                    <>
                    <div className="loading-spinner"></div>
                    <p>Let me think </p> 
                    <img className="app-icon logo_animation" src="images/assets/whatisthis_logo2.png"/>
                    </>
                ) : (
                    <>
                    <p className="prediction-result">This is a {predictedLabel}</p>
                    <button className="button" onClick={handleModalOk}>Ok</button>
                    </>
                )}
                </div>
            </div>
            )}
        </div>
    );
};

export default PredictionComponent;