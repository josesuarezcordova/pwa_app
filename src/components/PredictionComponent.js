import React, {useState} from "react";
import './styles/PredictionComponent.css';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import { b } from "../firebase";

const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/+$/, ''); // Remove trailing slash

const PredictionComponent = () => {
    const [currentImage, setCurrentImage] = useState(null);
    const [predictedLabel, setPredictedLabel] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    const images = [
        { src: `${publicUrl}/images/test/test_1.png`},
        { src: `${publicUrl}/images/test/test_2.png`},
        { src: `${publicUrl}/images/test/test_3.png`},
        { src: `${publicUrl}/images/test/test_4.png`},
        { src: `${publicUrl}/images/test/test_5.png`},
        { src: `${publicUrl}/images/test/test_6.png`},
        { src: `${publicUrl}/images/test/test_7.png`},
    ];

    const getRandomImage = () => {
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }

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

            // const API_BASE_URL = "http://192.168.0.27:5000";
            const API_BASE_URL = "https://530e0fff0bbf.ngrok-free.app";

            const response = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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

    React.useEffect(() => {
        setCurrentImage(getRandomImage());
    }, []);

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
            <h2>Prediction Screen</h2>
            <h3>Click on the image </h3>
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
                    <p>Loading model and predicting...</p>
                    </>
                ) : (
                    <>
                    <p className="prediction-result">Predicted Label: {predictedLabel}</p>
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