"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./Hero.css";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  const progressIntervalRef = useRef(null);
  const slideIntervalRef = useRef(null);

  const slides = [
    {
      title: "Raising standards in Real Estate",
      description:
        "We listen, understand & deliver spaces aligned to your business",
      image: "/hero/slide1.jpeg",
      backgroundColor: "#ffb347",
      buttonText: "Explore Properties",
      actionType: "navigate",
      actionValue: "/listings",
    },
    {
      title: "Clarity and Trust in every property",
      description:
        "Creating credibility, nurturing relationships & empowering clients",
      image: "/hero/slide2.jpeg",
      backgroundColor: "#ffd700",
      buttonText: "Explore Rentals in Your City",
      actionType: "scroll",
      actionValue: "regions-section",
    },
    {
      title: "Innovate, Transform & Grow",
      description: "Innovating the future for Indian Real Estate",
      image: "/hero/slide3.jpeg",
      backgroundColor: "#ffb347",
      buttonText: "Explore Properties",
      actionType: "navigate",
      actionValue: "/listings",
    },
    {
      title: "From data to smart decisions",
      description:
        "Track trends, identify opportunities & make smarter decisions",
      image: "/hero/slide4.jpeg",
      backgroundColor: "#ffd700",
      buttonText: "Track New Update",
      actionType: "navigate",
      actionValue: "/insights-reports",
    },
  ];

  const SLIDE_DURATION = 5000;
  const PROGRESS_INTERVAL = 50;

  useEffect(() => {
    startProgress();

    return () => {
      clearInterval(progressIntervalRef.current);
      clearTimeout(slideIntervalRef.current);
    };
  }, [currentSlide]);

  const startProgress = () => {
    setProgress(0);

    clearInterval(progressIntervalRef.current);
    clearTimeout(slideIntervalRef.current);

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress =
          prev + (PROGRESS_INTERVAL / SLIDE_DURATION) * 100;

        if (newProgress >= 100) {
          clearInterval(progressIntervalRef.current);
          return 100;
        }

        return newProgress;
      });
    }, PROGRESS_INTERVAL);

    slideIntervalRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
  };

  const goToSlide = (index) => {
    if (index !== currentSlide) {
      setCurrentSlide(index);
    }
  };

  const handleButtonClick = (slide) => {
    if (slide.actionType === "scroll") {
      console.log("Scrolling to section:", slide.actionValue);

      const element = document.getElementById(slide.actionValue);

      console.log("Found element:", element);

      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="hero-slider">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`hero-slide ${
            index === currentSlide ? "active" : ""
          }`}
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundColor: slide.backgroundColor,
          }}
        >
          <div className="hero-slide-container">
            <div className="hero-text-section">
              <div className="hero-text-content">
                {index === 0 ? (
                  <h1 className="hero-slide-title">{slide.title}</h1>
                ) : (
                  <h2 className="hero-slide-title">{slide.title}</h2>
                )}

                <p className="hero-slide-description">
                  {slide.description}
                </p>

                {slide.actionType === "navigate" ? (
                  <Link
                    href={slide.actionValue}
                    className="hero-cta-button"
                    style={{ textDecoration: "none" }}
                    rel="noopener noreferrer"
                  >
                    {slide.buttonText}
                  </Link>
                ) : (
                  <button
                    className="hero-cta-button"
                    onClick={() => handleButtonClick(slide)}
                  >
                    {slide.buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="hero-progress-bars">
        {slides.map((_, index) => (
          <div
            key={index}
            className="hero-progress-bar-wrapper"
            onClick={() => goToSlide(index)}
          >
            <div className="hero-progress-bar-bg">
              <div
                className={`hero-progress-bar-fill ${
                  index === currentSlide ? "active" : ""
                } ${index < currentSlide ? "completed" : ""}`}
                style={{
                  width:
                    index === currentSlide
                      ? `${progress}%`
                      : index < currentSlide
                        ? "100%"
                        : "0%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;