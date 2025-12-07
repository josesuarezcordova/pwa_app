import React from "react";
import "./styles/HeaderComponent.css"
import { Link } from "react-router-dom";

// Normalize PUBLIC_URL and build absolute paths
const publicUrl = (process.env.PUBLIC_URL || "").replace(/\/+$/, "");

const HeaderComponent = () => {
    return (
        <header className="topbar">
            <nav className="topbar_nav" aria-label="Primary">
                <Link to="/" className="topbar_icon" aria-label="Statistics">
                    <img src={`${publicUrl}/icons/house-chimney.svg`} alt="Statistics"/>
                </Link>
                <Link to="/gallery" className="topbar_icon" aria-label="Statistics">
                    <img src={`${publicUrl}/icons/copy-image.svg`} alt="Statistics"/>
                </Link>
                <Link to="/predict" className="topbar_logo" aria-label="Home">
                    <img src={`${publicUrl}/icons/whatisthis_icon.gif`} alt="App Logo"/>
                </Link> 
                <Link to="/stats" className="topbar_icon" aria-label="Profile">
                    <img src={`${publicUrl}/icons/chart-pie-alt.svg`} alt="Profile"/>
                </Link>
                <Link to="/profile" className="topbar_icon" aria-label="Profile">
                    <img src={`${publicUrl}/icons/user.svg`} alt="Profile"/>
                </Link>
            </nav>
        </header>
    );
};

export default HeaderComponent;