import React from "react";
import "./styles/HeaderComponent.css"

const HeaderComponent = () => {
    return (
        <header className="app-header">
            <img src="/icons/whatisthis_icon.gif" alt="App Icon" className="app-icon" />
            <h1 className="app-title">What is this?</h1>
        </header>
    );
};

export default HeaderComponent;