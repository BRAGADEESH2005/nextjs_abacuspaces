import React from "react";
import { FaBriefcase } from "react-icons/fa";
import "./Careers.css";

const Careers = () => {
  return (
    <div className="careers-page">
      {/* Hero Section */}
      <div className="careers-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-icon">
            <FaBriefcase />
          </div>
          <h1>Join Our Team</h1>
          <p>Be part of something extraordinary</p>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="careers-container">
        <div className="coming-soon-section">
          <div className="coming-soon-content">
            <div className="coming-soon-icon">
              <span className="icon-circle">🚀</span>
            </div>
            <h2>To be implemented soon</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;
