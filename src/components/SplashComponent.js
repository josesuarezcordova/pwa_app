import React from "react";
import "./styles/SplashComponent.css";

const SplashComponent = () => {
  return (
    <div className="splash-screen">
        <img src={`${process.env.PUBLIC_URL}icons/whatisthis_icon.gif`} alt="What is this?" className="splash-icon" />
        <h1 className="splash-title">What is this?</h1>
        <p>v.0.1</p>
    </div>
  );
}

export default SplashComponent;