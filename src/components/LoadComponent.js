import React, { useEffect } from 'react';
import './styles/LoadComponent.css';
import {collection, addDoc, doc } from 'firebase/firestore';
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
console.log('PUBLIC_URL:', publicUrl);

const LoadComponent = () => {
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

    const randomImage = images[Math.floor(Math.random() * images.length)];
        
    console.log('Random Image:', randomImage);

    // Function to save feedback to Firestore
    const saveFeedbackToFirestore = async (image, userLabel, correctLabel) => {
        try {
            console.log('Starting to save feedback...');
            console.log('Image:', image);
            console.log('User Label:', userLabel);

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
            console.log('Feedback saved with ID:', docRef.id);
            
        }catch (error) {
            console.error('Error saving feedback to Firestore:', error.message, error);
        }
    };

    //Handle user selection
    const handleSelection = async(selectedLabel) => {
        try{
           // Wait for the feedback to be saved to Firestore before reloading
           await saveFeedbackToFirestore(randomImage.src, selectedLabel);
           alert(`You selected "${selectedLabel}" for the image.`);
           window.location.reload(); // Reload to show a new random image
        } catch (error) {
            console.error('Error handling selection:', error.message, error);
        }        
    }

    useEffect(() => {
        testFirestoreConnection();
    }, []);
    return (
        <div className='background-container' style={{ backgroundImage: `url(${randomImage.src})` }}>   
            <div className='overlay'></div>
            <div className="button-container">
                <button className="button" onClick={()=> handleSelection('pear')}>Pears</button>
                <button className="button" onClick={()=> handleSelection('apple')}>Apple</button>
            </div>
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