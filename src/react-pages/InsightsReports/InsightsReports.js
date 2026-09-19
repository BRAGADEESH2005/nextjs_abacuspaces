"use client";

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "@/lib/react-router-dom";
import {
  FaDownload,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaArrowLeft,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import "./InsightsReports.css"; // Import the CSS file for styling

const InsightsReports = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [contentData, setContentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSector, setSelectedSector] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  const api =
    typeof window !== "undefined"
      ? axios.create({
          baseURL: API_BASE_URL,
          timeout: 10000,
        })
      : null;

  const filters = [
    { id: "all", label: "All Reports", type: "all" },
    { id: "research", label: "Research", type: "Research Report" },
    { id: "blog", label: "Blog", type: "Blog" },
    { id: "updates", label: "Updates", type: "Industrial Update" },
  ];

  const sectors = [
    "all",
    "Office",
    "Retail",
    "Hospitality",
    "Healthcare",
    "Industrial",
    "Residential",
  ];

  useEffect(() => {
    fetchAllContent();
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  useEffect(() => {
    filterContent();
  }, [activeFilter, searchQuery, selectedSector, contentData]);

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const response = await api.get("/content", {
        params: {
          status: "Published",
          limit: 100,
          sort: "-date",
        },
      });

      if (response.data.success) {
        setContentData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      setContentData([]);
    } finally {
      setLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = [...contentData];

    // Filter by type
    if (activeFilter !== "all") {
      const filterType = filters.find((f) => f.id === activeFilter)?.type;
      filtered = filtered.filter((item) => item.type === filterType);
    }

    // Filter by sector
    if (selectedSector !== "all") {
      filtered = filtered.filter(
        (item) => item.sector?.toLowerCase() === selectedSector.toLowerCase(),
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredData(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleCardClick = (slug) => {
    navigate(`/content/${slug}`);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const clearFilters = () => {
    setActiveFilter("all");
    setSelectedSector("all");
    setSearchQuery("");
  };

  return (
    <>
      <Helmet>
        <title>
          Insights & Reports | Real Estate Market Analysis | Abacus Spaces
        </title>
        <meta
          name="description"
          content="Access comprehensive commercial real estate market insights, research reports, and expert analysis on industry trends and opportunities."
        />
        <meta
          name="keywords"
          content="real estate insights, market reports, real estate market analysis, commercial property trends, real estate research"
        />
        <link rel="canonical" href="https://abacuspaces.com/insights-reports" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Real Estate Insights & Reports" />
        <meta
          property="og:description"
          content="Expert market analysis and research reports on commercial real estate"
        />
        <meta
          property="og:url"
          content="https://abacuspaces.com/insights-reports"
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Insights & Reports" />
        <meta
          name="twitter:description"
          content="Commercial real estate market analysis and reports"
        />
      </Helmet>

      <div className="insights-reports-page">
        {/* Hero Section */}
        <div className="insights-hero">
          <video
            className="insights-hero-video"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/blogpage_vid.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="insights-hero-overlay"></div>
          <div className="insights-hero-content">
            <h1 className="insights-hero-title">Insights & Reports</h1>
            <p className="insights-hero-subtitle">
              Explore our comprehensive collection of research reports, industry
              updates, and expert insights on commercial real estate
            </p>
          </div>
        </div>

        <div className="insights-container">
          {/* Filter Section */}
          <div className="insights-filter-section">
            {/* Search Bar */}
            <div className="insights-search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search reports, blogs, updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="insights-search-input"
              />
              {searchQuery && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchQuery("")}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <button
              className="mobile-filter-toggle"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <FaFilter /> Filters
            </button>

            {/* Filters */}
            <div
              className={`insights-filters ${showMobileFilters ? "show-mobile" : ""}`}
            >
              <div className="filter-group">
                <h3 className="filter-title">
                  <FaFilter /> Content Type
                </h3>
                <div className="filter-chips">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      className={`filter-chip ${activeFilter === filter.id ? "active" : ""}`}
                      onClick={() => setActiveFilter(filter.id)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h3 className="filter-title">Sector</h3>
                <div className="filter-chips">
                  {sectors.map((sector) => (
                    <button
                      key={sector}
                      className={`filter-chip ${selectedSector === sector ? "active" : ""}`}
                      onClick={() => setSelectedSector(sector)}
                    >
                      {sector.charAt(0).toUpperCase() + sector.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {(activeFilter !== "all" ||
                selectedSector !== "all" ||
                searchQuery) && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  <FaTimes /> Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="insights-results-section">
            <div className="insights-results-header">
              <h2 className="results-count">
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    {filteredData.length}{" "}
                    {filteredData.length === 1 ? "Result" : "Results"} Found
                  </>
                )}
              </h2>
            </div>

            {/* Content Grid */}
            {loading ? (
              <div className="insights-loading">
                <div className="loading-spinner"></div>
                <p>Loading reports...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="insights-no-results">
                <div className="no-results-icon">📄</div>
                <h3>No reports found</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="reset-btn" onClick={clearFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="insights-grid">
                {filteredData.map((item) => (
                  <div
                    key={item._id}
                    className="insights-card"
                    onClick={() => handleCardClick(item.slug)}
                  >
                    <div className="insights-card-image">
                      <img
                        src={
                          item.image?.url ||
                          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500"
                        }
                        alt={item.title}
                      />
                      <div className="insights-card-overlay">
                        <button className="view-details-btn">
                          <FaDownload />
                          <span>View Details</span>
                        </button>
                      </div>
                      <span
                        className={`content-type-badge ${item.type.toLowerCase().replace(" ", "-")}`}
                      >
                        {item.type === "Research Report"
                          ? "Research"
                          : item.type === "Industrial Update"
                            ? "Update"
                            : "Blog"}
                      </span>
                    </div>
                    <div className="insights-card-content">
                      <div className="insights-card-meta">
                        <span className="insights-card-date">
                          <FaCalendarAlt /> {formatDate(item.date)}
                        </span>
                        {item.sector && (
                          <>
                            <span className="meta-divider">•</span>
                            <span className="insights-card-sector">
                              {item.sector}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="insights-card-title">{item.title}</h3>
                      {item.description && (
                        <p className="insights-card-description">
                          {item.description.substring(0, 120)}
                          {item.description.length > 120 ? "..." : ""}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InsightsReports;
