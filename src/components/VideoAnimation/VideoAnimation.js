// "use client";

import React, { useState, useEffect } from "react";
import { FaCalculator, FaBullseye } from "react-icons/fa";
import "./VideoAnimation.css"; // Import the CSS file for styling

const VideoAnimation = () => {
  const [currentScene, setCurrentScene] = useState(0);

  const scenes = [
    { id: 0, name: "logo", duration: 4000 },
    { id: 1, name: "spaces", duration: 4000 },
    { id: 2, name: "map", duration: 4000 },
    { id: 3, name: "calculator", duration: 4000 },
    { id: 4, name: "goal", duration: 4000 },
    { id: 5, name: "conclusion", duration: 4000 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % scenes.length);
    }, scenes[currentScene].duration);

    return () => clearTimeout(timer);
  }, [currentScene, scenes]);

  return (
    <div className="video-animation-container">
      <div className="video-frame">
        {/* Scene 1: Logo with Tagline */}
        <div
          className={`scene scene-logo ${currentScene === 0 ? "active" : ""}`}
        >
          <div className="cosmic-background">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="cosmic-particle"
                style={{
                  "--delay": `${i * 0.1}s`,
                  "--x": `${Math.random() * 100}%`,
                  "--y": `${Math.random() * 100}%`,
                  "--duration": `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
          <div className="logo-showcase">
            <div className="logo-container-enhanced">
              <div className="logo-ring"></div>
              <div className="logo-ring ring-2"></div>
              <img
                src="/logo_abacus.png"
                alt="Abacus Spaces Logo"
                className="premium-logo"
              />
            </div>
            <h1 className="brand-name">ABACUS SPACES</h1>
            <div className="tagline-wrapper">
              <h2 className="premium-tagline">Spaces That Mean Business</h2>
              <div className="tagline-particles">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="tagline-particle"
                    style={{ "--angle": `${i * 45}deg` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scene 2: Three Spaces */}
        <div
          className={`scene scene-spaces ${currentScene === 1 ? "active" : ""}`}
        >
          <div className="spaces-showcase">
            <h2 className="spaces-title">Our Expertise</h2>
            <div className="spaces-carousel">
              <div className="space-card office-card">
                <div className="card-background">
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&auto=format&q=80"
                    alt="Modern Office Space"
                    className="space-bg-image"
                  />
                  <div className="card-overlay"></div>
                </div>
                <div className="card-content">
                  <div className="space-icon-container"></div>
                  <h3>OFFICE SPACE</h3>
                  <p>Premium corporate offices for growing businesses</p>
                  <div className="card-glow"></div>
                </div>
              </div>

              <div className="space-card retail-card">
                <div className="card-background">
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&auto=format&q=80"
                    alt="Modern Retail Space"
                    className="space-bg-image"
                  />
                  <div className="card-overlay"></div>
                </div>
                <div className="card-content">
                  <div className="space-icon-container"></div>
                  <h3>RETAIL SPACE</h3>
                  <p>High-footfall retail locations for maximum visibility</p>
                  <div className="card-glow"></div>
                </div>
              </div>

              <div className="space-card coworking-card">
                <div className="card-background">
                  <img
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop&auto=format&q=80"
                    alt="Hospitality & Healthcare Space"
                    className="space-bg-image"
                  />
                  <div className="card-overlay"></div>
                </div>
                <div className="card-content">
                  <div className="space-icon-container"></div>
                  <h3>Hospitality & Healthcare SPACE</h3>
                  <p>Flexible collaborative environments for teams</p>
                  <div className="card-glow"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scene 3: Map with Regions */}
        <div
          className={`scene scene-map ${currentScene === 2 ? "active" : ""}`}
        >
          <div className="map-showcase">
            <h2 className="map-title">Expanding Across India</h2>
            <div className="map-container-enhanced">
              <div className="india-map">
                <img
                  src="https://i.pinimg.com/736x/2e/cb/04/2ecb042b9e9be459a4f7de06adf528b6.jpg"
                  alt="India Map"
                  className="map-image-enhanced"
                />
              </div>
              <div className="coverage-stats">
                <div className="stat-item">
                  <span className="stat-number">5+</span>
                  <span className="stat-label">Major Cities</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Properties</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scene 4: Free Space Calculator */}
        <div
          className={`scene scene-calculator ${
            currentScene === 3 ? "active" : ""
          }`}
        >
          <div className="calculator-showcase">
            <div className="calculator-visual">
              <div className="calculator-device">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&auto=format&q=80"
                  alt="Calculator Interface"
                  className="calculator-bg"
                />
                <div className="calculator-overlay">
                  <FaCalculator className="calc-icon" />
                  <div className="calc-display">
                    <div className="calc-text">FREE</div>
                    <div className="calc-subtext">Space Calculator</div>
                  </div>
                </div>
              </div>
              <div className="calculator-features">
                <div className="feature-item">
                  <div className="feature-dot"></div>
                  <span>Instant Calculations</span>
                </div>
                <div className="feature-item">
                  <div className="feature-dot"></div>
                  <span>No Registration Required</span>
                </div>
                <div className="feature-item">
                  <div className="feature-dot"></div>
                  <span>Accurate Space Planning</span>
                </div>
              </div>
            </div>
            <div className="calculator-content">
              <h2 className="calculator-title">Free Office Space Calculator</h2>
              <p className="calculator-desc">
                Calculate your ideal office space requirements instantly
              </p>
            </div>
          </div>
        </div>

        {/* Scene 5: Our Goal */}
        <div
          className={`scene scene-goal ${currentScene === 4 ? "active" : ""}`}
        >
          <div className="goal-showcase">
            <div className="goal-visual">
              <div className="target-container">
                <div className="target-rings">
                  <div className="ring ring-1"></div>
                  <div className="ring ring-2"></div>
                  <div className="ring ring-3"></div>
                </div>
                <FaBullseye className="target-icon" />
              </div>
              <div className="goal-particles">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="goal-particle"
                    style={{
                      "--angle": `${i * 30}deg`,
                      "--delay": `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="goal-content">
              <h2 className="goal-title">Our Mission</h2>
              <h3 className="goal-statement">
                Making Every Square Foot Count for Business
              </h3>
              <p className="goal-description" style={{ color: "white" }}>
                We believe that space is more than four walls - it's the
                foundation where ideas grow, teams connect, and businesses
                thrive.
              </p>
            </div>
          </div>
        </div>

        {/* Scene 6: Conclusion */}
        <div
          className={`scene scene-conclusion ${
            currentScene === 5 ? "active" : ""
          }`}
        >
          <div className="conclusion-showcase">
            <div className="conclusion-visual">
              <div className="success-montage">
                <img
                  src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=200&h=150&fit=crop&auto=format&q=80"
                  alt="Business Success"
                  className="success-image img-1"
                />
                <img
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200&h=150&fit=crop&auto=format&q=80"
                  alt="Team Collaboration"
                  className="success-image img-2"
                />
                <img
                  src="https://i.pinimg.com/1200x/37/f6/d6/37f6d6850b3b47ac1b1fb48be16b7553.jpg"
                  alt="Modern Workspace"
                  className="success-image img-3"
                />
              </div>
              <div className="conclusion-burst">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className="burst-ray"
                    style={{ "--angle": `${i * 22.5}deg` }}
                  />
                ))}
              </div>
            </div>
            <div className="conclusion-content">
              <h2 className="conclusion-title">
                Your Space Journey Starts Here
              </h2>
              <div className="conclusion-url">abacuspaces.com</div>
              <div className="conclusion-tagline">
                Spaces That Mean Business
              </div>
            </div>
          </div>
        </div>

        {/* Continuous Progress Indicator */}
        <div className="progress-ring">
          <svg className="progress-svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" className="progress-bg" />
            <circle
              cx="50"
              cy="50"
              r="45"
              className="progress-fill"
              style={{
                strokeDasharray: "283",
                strokeDashoffset: `${
                  283 - 283 * ((currentScene + 1) / scenes.length)
                }`,
              }}
            />
          </svg>
          <div className="progress-center">
            <span className="progress-text">{currentScene + 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAnimation;
