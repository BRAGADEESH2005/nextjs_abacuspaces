"use client";

import React, { useEffect, useState, useRef } from "react";
import { BsLightningChargeFill } from "react-icons/bs";
import {
  FaGlobeAmericas,
  FaUsers,
  FaNetworkWired,
  FaDatabase,
  FaCheckCircle,
  FaHandshake,
} from "react-icons/fa";
import "./WhyAbacus.css";

const WhyAbacus = () => {
  const [showRoots, setShowRoots] = useState(false);
  const [animatedPillars, setAnimatedPillars] = useState([]);
  const [animatedLines, setAnimatedLines] = useState([]);
  const sectionRef = useRef(null);

  const features = [
    {
      title: "Market Insights",
      description: "Local & national outlook",
      icon: <FaGlobeAmericas />,
    },
    {
      title: "Client-Centric",
      description: "Occupier-focused approach",
      icon: <FaUsers />,
    },
    {
      title: "Strong Network",
      description: "Developer & landlord network",
      icon: <FaNetworkWired />,
    },
    {
      title: "Data Driven",
      description: "Data-backed decision making",
      icon: <FaDatabase />,
    },
    {
      title: "Full Execution",
      description: "End-to-end execution capability",
      icon: <FaCheckCircle />,
    },
    {
      title: "Trusted Partnerships",
      description: "Trust, transparency & long-term partnerships",
      icon: <FaHandshake />,
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !showRoots) {
            startAnimation();
          }
        });
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [showRoots]);

  const startAnimation = () => {
    // First show roots from heading
    setShowRoots(true);

    // Start pillar and line animations after roots appear
    setTimeout(() => {
      animateSequence();
    }, 800);
  };

  const animateSequence = () => {
    features.forEach((_, index) => {
      const delay = index * 1400;

      // Animate connecting line first (except for first pillar)
      if (index > 0) {
        setTimeout(() => {
          setAnimatedLines((prev) => [...prev, index - 1]);
        }, delay - 600);
      }

      // Then animate pillar
      setTimeout(() => {
        setAnimatedPillars((prev) => [...prev, index]);
      }, delay);
    });
  };

  return (
    <section className="why-abacus" ref={sectionRef}>
      <div className="why-container">
        <div className="why-header">
          {/* <span className="why-badge">
            <BsLightningChargeFill />
            Excellence in Real Estate
          </span> */}
          <h2>Why Choose Abacus Spaces</h2>
          <p className="why-subtext">Six Pillars of Our Excellence</p>

          {/* Root lines from heading */}
          <div className={`root-lines ${showRoots ? "show" : ""}`}>
            <div className="root-line root-center"></div>
          </div>
        </div>

        <div className="pillars-section">
          {features.map((feature, index) => (
            <React.Fragment key={index}>
              {/* Pillar with architectural design */}
              <div
                className={`pillar-item ${
                  animatedPillars.includes(index) ? "animate-draw" : ""
                }`}
              >
                <div className="pillar-structure">
                  {/* Capital (top decorative part) */}
                  <div className="pillar-capital">
                    <div className="capital-abacus"></div>
                    <div className="capital-echinus"></div>
                    <div className="capital-neck"></div>
                  </div>

                  {/* Shaft (main column body) */}
                  <div className="pillar-shaft">
                    <div className="shaft-flute shaft-flute-1"></div>
                    <div className="shaft-flute shaft-flute-2"></div>
                    <div className="shaft-flute shaft-flute-3"></div>

                    {/* Content in center */}
                    <div className="pillar-content">
                      <div className="pillar-icon">{feature.icon}</div>
                      <h3 className="pillar-title">{feature.title}</h3>
                      <p className="pillar-description">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Base (bottom part) */}
                  <div className="pillar-base">
                    <div className="base-torus"></div>
                    <div className="base-plinth"></div>
                  </div>
                </div>
              </div>

              {/* Connecting Line between pillars */}
              {index < features.length - 1 && (
                <div
                  className={`connecting-line ${
                    animatedLines.includes(index) ? "animate-line" : ""
                  }`}
                >
                  <div className="line-inner"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyAbacus;
