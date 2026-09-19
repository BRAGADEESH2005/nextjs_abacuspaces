import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "@/lib/react-router-dom";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const progressIntervalRef = useRef(null);
  const slideIntervalRef = useRef(null);

  const slides = [
    {
      title: "Raising standards in Real Estate",
      description:
        "We listen, understand & deliver spaces aligned to your business.",
      // image: "/hero/slide90.png",
      image: "/hero/slide1.jpeg",

      backgroundColor: "#1E3A5F",
      textColor: "#FFFFFF",
    },
    {
      title: "Clarity & Trust in every property",
      description:
        "Creating credibility, nurturing relationships & empowering clients.",
      // image: "/hero/fslide2.png",
      image: "/hero/slide2.jpeg",
      backgroundColor: "#C58B2A",
      textColor: "#FFFFFF",
    },
    {
      title: "Innovate, Transform & Grow",
      description: "Innovating the future for Indian Real Estate.",
      // image: "/hero/jammu.png",
      image: "/hero/slide3.jpeg",
      backgroundColor: "#f2983f",
      textColor: "#FFFFFF",
    },
    {
      title: "From data to smart decisions",
      description:
        "Track trends, identify opportunities & make smarter decisions.",
      // image: "/hero/aidaa.png",
      image: "/hero/slide4.jpeg",

      backgroundColor: "#070328",
      textColor: "#FFFFFF",
    },
  ];

  const SLIDE_DURATION = 5000; // 5 seconds
  const PROGRESS_INTERVAL = 50; // Update progress every 50ms

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
        const newProgress = prev + (PROGRESS_INTERVAL / SLIDE_DURATION) * 100;
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

  return (
    <section className="hero-slider">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`hero-slide ${index === currentSlide ? "active" : ""}`}
          style={{ backgroundColor: slide.backgroundColor }}
        >
          <div className="hero-slide-container">
            {/* Left Side - Text Content */}
            <div className="hero-text-section">
              <div className="hero-text-content">
                <h1
                  className="hero-slide-title"
                  style={{ color: slide.textColor }}
                >
                  {slide.title}
                </h1>
                <p
                  className="hero-slide-description"
                  style={{ color: slide.textColor }}
                >
                  {slide.description}
                </p>
                <button
                  className="hero-cta-button"
                  onClick={() => navigate("/listings")}
                >
                  Explore Properties
                </button>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="hero-image-section">
              <div className="hero-image-wrapper">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="hero-slide-image"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Progress Bar Navigation */}
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
