"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaArrowRight,
} from "react-icons/fa";
import Link from "next/link";
import "./LatestInRealEstate.css";

const LatestInRealEstateClient = ({ allContentData = [] }) => {
  const [activeTab, setActiveTab] = useState("updates");
  const scrollRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const autoScrollInterval = useRef(null);

  // Filter content based on active tab
  const getFilteredContent = () => {
    if (!allContentData) return [];

    const contentTypeMap = {
      updates: "Industrial Update",
      research: "Research Report",
      blog: "Blog",
    };

    const selectedType = contentTypeMap[activeTab];

    return allContentData.filter((item) => item.type === selectedType);
  };

  const contentData = getFilteredContent();

  // Auto scroll effect
  useEffect(() => {
    if (isAutoScrolling && scrollRef.current && contentData.length > 0) {
      autoScrollInterval.current = setInterval(() => {
        if (scrollRef.current) {
          const container = scrollRef.current;
          const maxScrollLeft = container.scrollWidth - container.clientWidth;

          if (container.scrollLeft >= maxScrollLeft - 1) {
            container.scrollTo({
              left: 0,
              behavior: "smooth",
            });
          } else {
            container.scrollLeft += 1;
          }
        }
      }, 30);
    }

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [isAutoScrolling, activeTab, contentData.length]);

  const handleMouseEnter = () => {
    setIsAutoScrolling(false);
  };

  const handleMouseLeave = () => {
    setIsAutoScrolling(true);
  };

  const scroll = (direction) => {
    setIsAutoScrolling(false);

    const scrollAmount = 400;

    if (scrollRef.current) {
      const scrollLeft =
        direction === "left"
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }

    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 3000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const renderCard = (item) => (
    <div key={item._id} className="estate-card">
      <div className="estate-card-image">
        <img
          src={
            item.image?.url ||
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500"
          }
          alt={item.title}
        />

        <div className="estate-card-overlay">
          <Link
            href={`/content/${item.slug}`}
            className="download-btn"
            style={{ textDecoration: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            <FaDownload />
            <span>View Details</span>
          </Link>
        </div>
      </div>

      <div className="estate-card-content" style={{ cursor: "pointer" }}>
        <Link
          href={`/content/${item.slug}`}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div className="estate-card-meta">
            <span className="estate-card-date">{formatDate(item.date)}</span>

            <span className="estate-card-divider">•</span>

            <span className="estate-card-category">
              {item.sector || item.type}
            </span>
          </div>

          <h3 className="estate-card-title">{item.title}</h3>
        </Link>
      </div>
    </div>
  );

  return (
    <div id="latest-estate" className="latest-estate-section">
      <div className="estate-container">
        <h2 className="estate-main-title">Latest in Real Estate</h2>

        {/* Tabs Navigation */}
        <div className="estate-tabs">
          <button
            className={`estate-tab ${activeTab === "updates" ? "active" : ""}`}
            onClick={() => setActiveTab("updates")}
          >
            Updates
          </button>

          <button
            className={`estate-tab ${activeTab === "research" ? "active" : ""}`}
            onClick={() => setActiveTab("research")}
          >
            Research
          </button>

          <button
            className={`estate-tab ${activeTab === "blog" ? "active" : ""}`}
            onClick={() => setActiveTab("blog")}
          >
            Blog
          </button>
        </div>

        {/* Content Section */}
        <div className="estate-content-wrapper">
          <button
            className="estate-scroll-btn estate-scroll-btn-left"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <FaChevronLeft />
          </button>

          {contentData.length === 0 ? (
            <div className="estate-no-content">No content available</div>
          ) : (
            <div
              className="estate-cards-container"
              ref={scrollRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {contentData.map(renderCard)}
            </div>
          )}

          <button
            className="estate-scroll-btn estate-scroll-btn-right"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <FaChevronRight />
          </button>
        </div>

        {/* View All Button */}
        <div className="estate-view-all-wrapper">
          <Link
            href="/insights-reports"
            style={{ textDecoration: "none" }}
            className="estate-view-all-btn"
          >
            <span>View All Reports</span>
            <FaArrowRight className="view-all-icon" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LatestInRealEstateClient;
