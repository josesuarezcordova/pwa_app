import React, { useEffect, useState } from 'react';
import './styles/LoadComponent.css';
import {collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';

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
    return features.arraySync(); // Convert tensor to array
}

const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/+$/, ''); // Remove trailing slash

const LoadComponent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [feedbackCount, setFeedbackCount] = useState(0);
    const [modalMessage, setModalMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    
    // Array of image paths
    const images = [
        { src: `${publicUrl}/images/image1.png` },
        { src: `${publicUrl}/images/image2.png` },
        { src: `${publicUrl}/images/image3.png` },
        { src: `${publicUrl}/images/image4.png` },
        { src: `${publicUrl}/images/image5.png` },
        { src: `${publicUrl}/images/image6.png` },
        { src: `${publicUrl}/images/image7.png` },
        { src: `${publicUrl}/images/image8.png` },
        { src: `${publicUrl}/images/image9.png` },
        { src: `${publicUrl}/images/image10.png` },
    ];

    const getRandomImage = () => {
        return images[Math.floor(Math.random() * images.length)];
    };

     // Initialize the current image when the component mounts
     useEffect(() => {
        setCurrentImage(getRandomImage());
        testFirestoreConnection();
    }, []);

    // Function to save feedback to Firestore
    const saveFeedbackToFirestore = async (image, userLabel) => {
        try {
            
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

    //Handle user selection
    const handleSelection = async(selectedLabel) => {
        try{
            setIsLoading(true); // Show loading state
           // Wait for the feedback to be saved to Firestore before reloading
           await saveFeedbackToFirestore(currentImage.src, selectedLabel);
           setModalMessage(`You labelled as "${selectedLabel}" the image.`);
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
        setCurrentImage(getRandomImage()); //Update the image after closing the modal
    }

    useEffect(() => {
        testFirestoreConnection();
    }, []);
    return (
        <div className="background-container">
            <h1 className='title'>Help Us Teach the AI</h1>
            <div className="image-container">
                {/* <img src={randomImage.src} alt="Random" />
                 */}
                 {currentImage && <img src={currentImage.src} alt="Random" />}
            </div>
            <div className="button-container">
                <button className="button" onClick={()=> handleSelection('pear')} disabled={isLoading}>Pears</button>
                <button className="button" onClick={()=> handleSelection('apple')} disabled={isLoading}>Apple</button>
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
                    <p>{modalMessage}</p>
                    <p>Total labels Submitted: {feedbackCount}</p>
                    <button className='button' onClick={closeModal}>Ok</button>
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