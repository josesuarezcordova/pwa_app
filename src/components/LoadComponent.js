import React from 'react';
import './styles/LoadComponent.css';

const LoadComponent = () => {
    const images = [
        '/images/image1.png',
        '/images/image2.png',
        '/images/image3.png',
        '/images/image4.png',
        '/images/image5.png',
        '/images/image6.png',
        '/images/image7.png',
        '/images/image8.png',
        '/images/image9.png',
        '/images/image10.png',
    ];

    const randomImage = images[Math.floor(Math.random() * images.length)];

    return (
        <div className='background-container' style={{ backgroundImage: `url(${randomImage})` }}>   
            <div className='overlay'></div>
            <div className="button-container">
                <button className="button">Pears</button>
                <button className="button">Apple</button>
            </div>
        </div>
    );
};

export default LoadComponent;