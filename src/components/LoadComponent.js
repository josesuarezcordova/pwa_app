import React from 'react';
import './styles/LoadComponent.css';
import { addDoc } from 'firebase/firestore';

const LoadComponent = () => {
    const images = [
        {src:'/images/image1.png'},
        {src:'/images/image2.png'},
        {src:'/images/image3.png'},
        {src:'/images/image4.png'},
        {src:'/images/image5.png'},
        {src:'/images/image6.png'},
        {src:'/images/image7.png'},
        {src:'/images/image8.png'},
        {src:'/images/image9.png'},
        {src:'/images/image10.png'},
    ];

    const randomImage = images[Math.floor(Math.random() * images.length)];

    // Function to save feedback to Firestore
    const saveFeedbackToFirestore = async (image, userLabel, correctLabel) => {
        try {
            const feedback = { 
                image, // path to the image
                userLabel, // Label selected by the user
                timestamp: new Date().toISOString(),
            };
            await addDoc(collection(db, 'feedback'), feedback);
            console.log('Feedback saved to Firestore:', feedback);
            
        }catch (error) {
            console.error('Error saving feedback to Firestore:', error);
        }
    };

    //Handle user selection
    const handleSelection = (selectedLabel) => {

        // Save feedback to Firestore
        saveFeedbackToFirestore(randomImage.src, selectedLabel);
        alert(`You selected "${selectedLabel}" for the image.`);
        window.location.reload(); // Reload to show a new random image
    }

    return (
        <div className='background-container' style={{ backgroundImage: `url(${randomImage})` }}>   
            <div className='overlay'></div>
            <div className="button-container">
                <button className="button" onClick={()=> handleSelection('pear')}>Pears</button>
                <button className="button" onClick={()=> handleSelection('apple')}>Apple</button>
            </div>
        </div>
    );
};

export default LoadComponent;