"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaArrowRight, FaBuilding, FaHandshake } from "react-icons/fa";
import { MdCall, MdLocationOn } from "react-icons/md";
import "./CallToAction.css"; // Import the CSS file for styling
import Link from "next/link";
const CallToAction = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    // Create floating particles - same as TrustedBy
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      speed: Math.random() * 2 + 1,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="cta-section" ref={sectionRef}>
      {/* Hero Background with Animated Orbs - Same as TrustedBy */}
      <div className="hero-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>

        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="floating-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.speed + 3}s`,
            }}
          />
        ))}
      </div>

      <div className="cta-container">
        {/* Main Content */}
        <div className={`cta-content ${isVisible ? "cta-visible" : ""}`}>
          {/* Badge */}
          {/* <div className="cta-badge">
            <FaHandshake />
            <span>Get Started?</span>
          </div> */}

          {/* Main Headline */}
          <h2 className="cta-headline">Looking to Expand Your Business?</h2>
          {/* Supporting Text */}
          <p className="cta-description-text">
            Connect with our Team, to find you the Space that caters to your
            Business
          </p>

          {/* Action Buttons */}
          <div className="cta-buttons">
            <Link href="/contact" className="cta-btn cta-primary">
              <FaBuilding className="btn-icon" />
              <span>Talk to Us</span>
              <FaArrowRight className="btn-arrow" />
            </Link>

            <Link href="/listings" className="cta-btn cta-secondary">
              <FaBuilding className="btn-icon" />
              <span>View Properties</span>
              <FaArrowRight className="btn-arrow" />
            </Link>
          </div>

          {/* City Coverage */}
          <div className="cta-cities">
            <div className="cta-cities-header">
              <h3>We Operate In</h3>
            </div>
            <div className="cta-cities-grid">
              <div className="cta-city">
                <div className="cta-city-icon">
                  <MdLocationOn />
                </div>
                <span className="cta-city-name">Chennai</span>
              </div>

              <div className="cta-city">
                <div className="cta-city-icon">
                  <MdLocationOn />
                </div>
                <span className="cta-city-name">Coimbatore</span>
              </div>

              <div className="cta-city">
                <div className="cta-city-icon">
                  <MdLocationOn />
                </div>
                <span className="cta-city-name">Kochi</span>
              </div>

              <div className="cta-city">
                <div className="cta-city-icon">
                  <MdLocationOn />
                </div>
                <span className="cta-city-name">Bangalore</span>
              </div>

              <div className="cta-city">
                <div className="cta-city-icon">
                  <MdLocationOn />
                </div>
                <span className="cta-city-name">Hyderabad</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
