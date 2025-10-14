import React, { useEffect, useState, useRef } from 'react';
import './styles/LoadComponent.css';
// import { useNavigate } from 'react-router-dom';
import {collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

// Function to extract image features using MobileNet
const extractImageFeatures = async (imageSrc) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // To avoid CORS issues
    img.src = imageSrc;

    await new Promise((resolve) => {
        img.onload = resolve;
    });
    const model = await mobilenet.load();
    const features = model.infer(img, true); // 'true' returns the intermediate activation activations
    
    const normalizedFeatures = features.arraySync().map(f => f / Math.max(...features.arraySync())); // Normalize the features

    return features.arraySync(); // Convert tensor to array
}

const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/+$/, ''); // Remove trailing slash

const getSessionId = () => {
    const SESSION_EXPIRATION_DAYS = 7; // Session expiration in days
    const now = new Date();

    let sessionId = localStorage.getItem('sessionId');
    let sessionTimestamp = parseInt(localStorage.getItem('sessionTimestamp'), 10);

    if(sessionId && sessionTimestamp) {
        const elapsedTime = now - sessionTimestamp;
        const expirationTime = SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000; // Convert days to milliseconds

        if(elapsedTime < expirationTime) {
            return sessionId; // Return existing session ID if not expired
        }
    }

    // If no valid session, create a new one
    sessionId = `session_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('sessionTimestamp', now.getTime().toString());
    return sessionId;
};

const incrementFeedbackCount = () => {
  let feedbackCount = parseInt(localStorage.getItem('feedbackCount'), 10) || 0;
  feedbackCount += 1;
  localStorage.setItem('feedbackCount', feedbackCount);
  return feedbackCount;
};

const getFeedbackCount = () => {
  return parseInt(localStorage.getItem('feedbackCount'), 10) || 0;
};

const importTrainImages = () => {
    const context = require.context('../assets/train', false, /\.(png|jpe?g|svg)$/);
    return context.keys().map(k => { 
        const mod= context(k);
        return { src: mod.default || mod }; 
    });
};

const LoadComponent = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [feedbackCount, setFeedbackCount] = useState(0);
    const [modalMessage, setModalMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // const [currentImage, setCurrentImage] = useState(null);
    const allImages = useRef(importTrainImages());
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentImage = allImages.current[currentIndex];
    
    // Swipe detection
    const touchStartX = useRef(null);
    const SWIPE_THRESHOLD = 40;

    const nextImage = () => {
        setCurrentIndex(i => (i + 1) % allImages.current.length);
    }
    const prevImage = () => {
        setCurrentIndex(i => (i - 1 + allImages.current.length) % allImages.current.length);
    }
    const handleTouchStart = (e) => {
        touchStartX.current = e.changedTouches[0].clientX;
    };
    const handleTouchEnd = (e) => {
        if(touchStartX.current !== null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (delta > SWIPE_THRESHOLD) {
            prevImage();
        } else if (delta < -SWIPE_THRESHOLD) {
            nextImage();
        }
        touchStartX.current = null;
    }

    // const getRandomImage = () => {
    //     return images[Math.floor(Math.random() * images.length)];
    // };

     // Initialize the current image when the component mounts
     useEffect(() => {
        // setCurrentImage(getRandomImage());
        // testFirestoreConnection();
        const onKey = (e) => {
            if(e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        testFirestoreConnection();
    }, []);
    
    // Function to save feedback to Firestore
    const saveFeedbackToFirestore = async (image, userLabel) => {
        try {
            
            const sessionId = getSessionId(); // Get the current session ID
            const feedbackCount = incrementFeedbackCount(); // Increment feedback count

            // Extract image features
            const imageFeatures = await extractImageFeatures(image);
            console.log('Extracted Image Features:', imageFeatures);

            const flattenedFeatures = imageFeatures.flat();
            console.log('Flattened Features:', flattenedFeatures);

            // Prepare feedback data
            const feedback = { 
                image, // path to the image
                userLabel, // Label selected by the user
                features: flattenedFeatures, // Extracted image features
                timestamp: new Date().toISOString(),
                sessionId, // Include session ID
                feedbackCount, // Include feedback count for the session

            };
            console.log('Saving feedback to Firestore:', feedback);
            const docRef = await addDoc(collection(db, 'feedback'), feedback);
            
            //Fetch the total feedback count
            const feedbackSnapshot = await getDocs(collection(db, 'feedback'));
            setFeedbackCount(feedbackSnapshot.size);

            console.log('Feedback saved with ID:', docRef.id);
            
        }catch (error) {
            console.error('Error saving feedback to Firestore:', error.message, error);
        }
    };

    // Get the current feedback count
    const n = getFeedbackCount();

    const incrementPoints = () => {
        let points = parseInt(localStorage.getItem('points'), 10) || 0;
        const feedbackCount = getFeedbackCount();
        
        if (feedbackCount % 10 === 0) {
            points += 10; // Award 10 points for every 10 images labelled
            localStorage.setItem('points', points);
        }
        return points;
    };

    const getPoints = () => {
        return parseInt(localStorage.getItem('points'), 10) || 0;
    };

    //Handle user selection
    const handleSelection = async(selectedLabel) => {
        try{
            setIsLoading(true); // Show loading state
           // Wait for the feedback to be saved to Firestore before reloading
           await saveFeedbackToFirestore(currentImage.src, selectedLabel);
           
           const points = incrementPoints(); // Increment points if applicable
           
           if(getFeedbackCount() % 10 === 0) {
            // Show special message for every 10 images labelled
            setModalMessage(`You labelled ${getFeedbackCount()} images and earned 10 points! Total Points: ${points}`);
           } else {
            // Regular message
            setModalMessage(`You labelled the image as "${selectedLabel}". Good job!`);
           }

           setIsModalOpen(true); // Open the modal
        } catch (error) {
            console.error('Error handling selection:', error.message, error);
        } finally {
            setIsLoading(false); // Hide loading state
        }        
    }

    const closeModal = () => {
        setIsModalOpen(false);
        // Reload the page to show a new random image
        // setCurrentImage(getRandomImage()); //Update the image after closing the modal
        nextImage();
    }

    // Test Firestore connection on component mount
    useEffect(() => {
        testFirestoreConnection();
    }, []);

    return (
        <div className="background-container">           
            <div className="image-container"
                 onTouchStart={handleTouchStart}
                 onTouchEnd={handleTouchEnd}
            >   
                {currentImage && <img src={currentImage.src} alt={`Train ${currentIndex+1}`} />}

                {/* Overlay navigation arrows */}
                <button
                  type="button"
                  className="nav-arrow nav-arrow--left"
                  onClick={prevImage}
                  aria-label="Previous image"
                  disabled={isLoading}
                >&lsaquo;</button>
                <button
                  type="button"
                  className="nav-arrow nav-arrow--right"
                  onClick={nextImage}
                  aria-label="Next image"
                  disabled={isLoading}
                >&rsaquo;</button>
            
            </div>
            <div className="actions">
                <div className="button-container">
                    <button className="button" onClick={() => handleSelection('pear')} disabled={isLoading}>Pear</button>
                    <button className="button" onClick={() => handleSelection('apple')} disabled={isLoading}>Apple</button>
                </div>

                <div className="button-container button-container--full">
                    <Link to="/predict" className="button button-test-background button-fullwidth">Test me</Link>
                </div>
            </div>     

        {/* Loading animation */}
        {isLoading && (
            <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <p>Saving...</p>
            </div>
        )}
        
        {/* Modal for feedback confirmation */}
        
        {isModalOpen && (
            <div className="modal">
                <div className="modal-content">
                    {(n % 10 === 0) ? (
                        <div className="subTitle">
                            <h3>You labelled {n} images</h3>
                            <h3>Great job!</h3>
                            {/* Trophy icon */}
                            <div className='award'>
                                <span role="img" aria-label="trophy" style={{fontSize: '48px'}}>🏆</span>
                                <p className="smallFont">You've labelled {getFeedbackCount()} images</p>
                                <p className="smallFont">Total Points: {getPoints()}</p>
                            </div>
                        </div>
                    ) : (
                        <p>{modalMessage}</p>
                    )}                    
                    <button className='button' onClick={closeModal}>Ok</button>
                    <p className="smallFont">You've labelled {getFeedbackCount()} images</p>
                    <p className="smallFont italics">Total labels Submitted: {feedbackCount}</p>             
                </div>
            </div>
        )}   
         </div>                              
    );
};

// Test Firestore Connection
const testFirestoreConnection = async () => {
    try {
        const testDoc = {
            testField: 'testValue',
            timestamp: new Date().toISOString(),
        };
        await addDoc(collection(db, 'testCollection'), testDoc);
        console.log('Test document added successfully:', testDoc);
    } catch (error) {
        console.error('===Error adding test document===:', error);
    }
};

export default LoadComponent;