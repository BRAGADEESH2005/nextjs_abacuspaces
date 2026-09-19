"use client";

import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import {
  FaMapMarkerAlt,
  FaRupeeSign,
  FaSearch,
  FaFilter,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaTimes,
  FaFileAlt,
  FaCheckCircle,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaPlay,
} from "react-icons/fa";
import {
  MdSpaceDashboard,
  MdLocationCity,
  MdKeyboardArrowDown,
  MdEmail,
  MdPhone,
  MdPerson,
  MdBusiness,
} from "react-icons/md";
import { BiFilterAlt } from "react-icons/bi";
import { FaBuilding } from "react-icons/fa";
import { generateBreadcrumbSchema } from "../../utils/seoConfig";
import "./Listings.css"; // Import the CSS file for styling

const Listings = () => {
  const [allListings, setAllListings] = useState([]); // Store all listings from first load
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCards, setVisibleCards] = useState([]);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [listingViews, setListingViews] = useState({});
  const [isFiltering, setIsFiltering] = useState(false);

  // New states for report popup
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSubmissionSuccess, setReportSubmissionSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    company: "",
    designation: "",
    phone: "",
    email: "",
  });
  const [reportErrors, setReportErrors] = useState({});

  // New states for video popup
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [selectedVideoListingId, setSelectedVideoListingId] = useState(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  const sectionRef = useRef(null);
  const imageIntervals = useRef({});
  const popupRef = useRef(null);
  const videoPopupRef = useRef(null);
  const listingsGridRef = useRef(null);

  // Get base URL from environment variables
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  // Configure axios instance
  const api =
    typeof window !== "undefined"
      ? axios.create({
          baseURL: `${API_BASE_URL}`,
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        })
      : null;

  // Generate random views from viewsRange
  const generateRandomViews = (viewsRange) => {
    if (!viewsRange || viewsRange.length !== 2) {
      return Math.floor(Math.random() * 200) + 100;
    }
    const [min, max] = viewsRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Helper function to get current active filters
  const getActiveFilters = () => {
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (selectedType !== "all") filters.type = selectedType;
    if (selectedLocation !== "all") filters.location = selectedLocation;
    return filters;
  };

  // Apply filters client-side on stored listings
  const applyFiltersLocally = (listingsToFilter, filters) => {
    let filtered = [...listingsToFilter];

    // Apply type filter
    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((listing) => listing.type === filters.type);
    }

    // Apply location filter
    if (filters.location && filters.location !== "all") {
      filtered = filtered.filter(
        (listing) =>
          listing.location &&
          listing.location
            .toLowerCase()
            .includes(filters.location.toLowerCase()),
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchLower) ||
          listing.location.toLowerCase().includes(searchLower) ||
          listing.propertyCode.toLowerCase().includes(searchLower) ||
          listing.area.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  };

  // Fetch listings from backend (only on initial load)
  const fetchListings = async (
    page = 1,
    filters = {},
    showFilterLoader = false,
  ) => {
    try {
      if (showFilterLoader) {
        setIsFiltering(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const params = {
        page,
        limit: 50,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === "all") {
          delete params[key];
        }
      });

      const response = await api.get("/listings", { params });

      if (response.data.success) {
        const listingsData = response.data.data;

        // Initialize image indexes and random views for new listings
        const initialIndexes = {};
        const initialViews = {};

        listingsData.forEach((listing) => {
          initialIndexes[listing._id] = 0;
          initialViews[listing._id] = generateRandomViews(listing.viewsRange);
        });

        setCurrentImageIndexes((prev) => ({ ...prev, ...initialIndexes }));
        setListingViews((prev) => ({ ...prev, ...initialViews }));

        // Store all listings for client-side filtering
        setAllListings(listingsData);
        setListings(listingsData);
        setFilteredListings(listingsData);
        setPagination(response.data.pagination);
        setCurrentPage(page);
      } else {
        throw new Error(response.data.message || "Failed to fetch listings");
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load properties",
      );
      setListings([]);
      setFilteredListings([]);
    } finally {
      setIsLoading(false);
      setIsFiltering(false);
    }
  };

  // Fetch available locations
  const fetchLocations = async () => {
    try {
      const response = await api.get("/listings/locations");
      if (response.data.success) {
        setAvailableLocations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  // Fetch available property types
  const fetchPropertyTypes = async () => {
    try {
      const response = await api.get("/listings/types");
      if (response.data.success) {
        setAvailableTypes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching property types:", error);
    }
  };

  // Handle pagination - go to specific page
  const handlePageChange = (newPage) => {
    // Check if filters are active
    const activeFilters = getActiveFilters();
    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    if (hasActiveFilters) {
      // Client-side pagination with filters
      const itemsPerPage = 50;
      const totalFiltered = filteredListings.length;
      const totalPages = Math.ceil(totalFiltered / itemsPerPage);

      if (newPage < 1 || newPage > totalPages) return;

      // For client-side pagination, we just need to scroll and update visible cards
      if (listingsGridRef.current) {
        listingsGridRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      setCurrentPage(newPage);
      setVisibleCards([]);
    } else {
      // Server-side pagination (original behavior)
      if (newPage < 1 || newPage > pagination.pages) return;

      if (listingsGridRef.current) {
        listingsGridRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      setVisibleCards([]);
      fetchListings(newPage, {}, true);
    }
  };

  // Handle Get Report button click
  const handleGetReport = (listing) => {
    setSelectedListing(listing);
    setShowReportPopup(true);
    setReportSubmissionSuccess(false);
    setReportErrors({});
    setUserInfo({
      name: "",
      company: "",
      designation: "",
      phone: "",
      email: "",
    });
  };

  // Close popup
  const closeReportPopup = () => {
    setShowReportPopup(false);
    setSelectedListing(null);
    setReportSubmissionSuccess(false);
    setReportErrors({});
    setUserInfo({
      name: "",
      company: "",
      designation: "",
      phone: "",
      email: "",
    });
  };

  // Format price helper
  const formatPrice = (price) => {
    if (!price) return price;
    const priceStr = price.toString().trim();
    if (priceStr === "0" || priceStr === "₹0") {
      return "Price available upon request";
    }
    if (priceStr.startsWith("₹")) {
      return priceStr.substring(1).trim();
    }
    return price;
  };

  // Helper to check if price is available
  const isPriceAvailable = (price) => {
    if (!price) return false;
    const priceStr = price.toString().trim();
    return priceStr !== "0" && priceStr !== "₹0";
  };

  // Helper function to extract YouTube video ID from various URL formats
  const extractYouTubeVideoId = (url) => {
    if (!url) return null;

    // Handle youtube.com/shorts/VIDEO_ID format
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) return shortsMatch[1];

    // Handle youtube.com/watch?v=VIDEO_ID format
    const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) return watchMatch[1];

    // Handle youtu.be/VIDEO_ID format
    const youtuMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (youtuMatch) return youtuMatch[1];

    // Handle youtube.com/embed/VIDEO_ID format
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (embedMatch) return embedMatch[1];

    return null;
  };

  // Handle Watch Videos button click
  const handleWatchVideos = (listing) => {
    setSelectedVideoListingId(listing._id);
    setSelectedVideoIndex(0);
    setShowVideoPopup(true);
  };

  // Close video popup
  const closeVideoPopup = () => {
    setShowVideoPopup(false);
    setSelectedVideoListingId(null);
    setSelectedVideoIndex(0);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!userInfo.name.trim()) newErrors.name = "Name is required";
    if (!userInfo.company.trim())
      newErrors.company = "Company name is required";
    if (!userInfo.designation.trim())
      newErrors.designation = "Designation is required";
    if (!userInfo.phone.trim()) newErrors.phone = "Phone number is required";
    if (!userInfo.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(userInfo.email))
      newErrors.email = "Email is invalid";
    setReportErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit report request
  const submitReportRequest = async () => {
    if (!validateForm()) return;
    setIsSubmittingReport(true);
    setReportErrors({});

    try {
      const requestData = {
        userInfo,
        propertyDetails: {
          propertyId: selectedListing._id,
          propertyCode: selectedListing.propertyCode,
          title: selectedListing.title,
          location: selectedListing.location,
          area: selectedListing.area,
          price: selectedListing.price,
          type: selectedListing.type,
          features: selectedListing.features,
        },
        source: "propertyreport",
        requestType: "property_report",
      };

      const response = await api.post("/leads", requestData);

      if (response.data.success) {
        setReportSubmissionSuccess(true);
        setTimeout(() => {
          closeReportPopup();
        }, 3000);
      } else {
        setReportErrors({
          submit: response.data.message || "Failed to submit request",
        });
      }
    } catch (error) {
      console.error("Error submitting report request:", error);
      let errorMessage = "Unable to connect to server. Please try again later.";
      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage =
          "No response from server. Please check your internet connection.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please try again.";
      }
      setReportErrors({ submit: errorMessage });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        closeReportPopup();
      }
    };

    if (showReportPopup) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [showReportPopup]);

  // Close video popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        videoPopupRef.current &&
        !videoPopupRef.current.contains(event.target)
      ) {
        closeVideoPopup();
      }
    };

    if (showVideoPopup) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [showVideoPopup]);

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchListings(),
        fetchLocations(),
        fetchPropertyTypes(),
      ]);
    };
    initializeData();
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  // Auto-scroll images
  useEffect(() => {
    filteredListings.forEach((listing) => {
      if (listing.images && listing.images.length > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndexes((prev) => ({
            ...prev,
            [listing._id]: (prev[listing._id] + 1) % listing.images.length,
          }));
        }, 3000);
        imageIntervals.current[listing._id] = interval;
      }
    });

    return () => {
      Object.values(imageIntervals.current).forEach((interval) => {
        clearInterval(interval);
      });
      imageIntervals.current = {};
    };
  }, [filteredListings]);

  const nextImage = (listingId, imageCount) => {
    clearInterval(imageIntervals.current[listingId]);
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [listingId]: (prev[listingId] + 1) % imageCount,
    }));

    setTimeout(() => {
      if (imageCount > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndexes((prev) => ({
            ...prev,
            [listingId]: (prev[listingId] + 1) % imageCount,
          }));
        }, 3000);
        imageIntervals.current[listingId] = interval;
      }
    }, 5000);
  };

  const prevImage = (listingId, imageCount) => {
    clearInterval(imageIntervals.current[listingId]);
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [listingId]: prev[listingId] === 0 ? imageCount - 1 : prev[listingId] - 1,
    }));

    setTimeout(() => {
      if (imageCount > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndexes((prev) => ({
            ...prev,
            [listingId]: (prev[listingId] + 1) % imageCount,
          }));
        }, 3000);
        imageIntervals.current[listingId] = interval;
      }
    }, 5000);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;

            if (target.classList.contains("listings-header")) {
              setTimeout(() => setHeaderVisible(true), 100);
            }

            if (target.classList.contains("listings-filters")) {
              setTimeout(() => setFiltersVisible(true), 200);
            }

            if (target.classList.contains("listing-card")) {
              const index = parseInt(target.getAttribute("data-index"));
              setTimeout(() => {
                setVisibleCards((prev) => [...prev, index]);
              }, index * 100);
            }
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    const elements = sectionRef.current?.querySelectorAll(".observe-animation");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [filteredListings]);

  // Handle filters - apply locally on stored listings
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setIsFiltering(true);
      const activeFilters = {
        type: selectedType,
        location: selectedLocation,
        search: searchTerm,
      };

      // Apply filters to all listings
      const filtered = applyFiltersLocally(allListings, activeFilters);
      setFilteredListings(filtered);
      setVisibleCards([]);
      setIsFiltering(false);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedType, selectedLocation, allListings]);

  // Handle view listing
  const handleViewListing = async (listingId) => {
    try {
      setListingViews((prev) => ({
        ...prev,
        [listingId]: (prev[listingId] || 0) + 1,
      }));
      await api.get(`/listings/${listingId}`);
    } catch (error) {
      console.error("Error viewing listing:", error);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    // Check if filters are active
    const activeFilters = getActiveFilters();
    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    const itemsPerPage = 50;
    const totalItems = hasActiveFilters
      ? filteredListings.length
      : pagination.total || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const current = currentPage;

    if (totalPages <= 7) {
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    } else {
      const pages = [];
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (current >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
      return pages;
    }
  };

  // Get pagination info (handles both filtered and server-side)
  const getPaginationInfo = () => {
    const activeFilters = getActiveFilters();
    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    if (hasActiveFilters) {
      const itemsPerPage = 50;
      const totalItems = filteredListings.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startItem = (currentPage - 1) * itemsPerPage + 1;
      const endItem = Math.min(currentPage * itemsPerPage, totalItems);

      return {
        pages: totalPages,
        total: totalItems,
        hasPrev: currentPage > 1,
        hasNext: currentPage < totalPages,
        startItem,
        endItem,
      };
    } else {
      return {
        pages: pagination.pages || 1,
        total: pagination.total || 0,
        hasPrev: pagination.hasPrev || false,
        hasNext: pagination.hasNext || false,
        startItem: (currentPage - 1) * 50 + 1,
        endItem: Math.min(currentPage * 50, pagination.total || 0),
      };
    }
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Listings", url: "/listings" },
  ];

  return (
    <>
      <Helmet>
        <title>
          Office & Retail Space Listings | Premium Commercial Real Estate |
          Abacus Spaces
        </title>
        <meta
          name="description"
          content="Browse premium office spaces, retail properties, and commercial real estate listings. Find flexible coworking and leasing solutions for your business."
        />
        <meta
          name="keywords"
          content="office space listings, commercial property, retail space, office lease, coworking space, business space for rent"
        />
        <link rel="canonical" href="https://abacuspaces.com/listings" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Commercial Space Listings | Abacus Spaces"
        />
        <meta
          property="og:description"
          content="Find premium office spaces and retail properties - browse listings now"
        />
        <meta property="og:url" content="https://abacuspaces.com/listings" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Office & Retail Space Listings" />
        <meta
          name="twitter:description"
          content="Discover premium commercial spaces for rent"
        />

        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbSchema(breadcrumbs))}
        </script>
      </Helmet>

      <div className="listings-page" ref={sectionRef}>
        {/* Initial Page Loading */}
        {isLoading && listings.length === 0 && (
          <div className="page-loading">
            <div className="loading-content">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <h3>Finding Amazing Properties</h3>
              <p>Discovering the perfect workspace for your business...</p>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {/* Error Screen */}
        {error && !isLoading && listings.length === 0 && (
          <div className="listings-error">
            <div className="error-content">
              <div className="error-icon">⚠️</div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button className="btn-primary" onClick={() => fetchListings()}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div
          className={`listings-header observe-animation ${
            headerVisible ? "visible" : ""
          }`}
        >
          <video
            className="listings-header-video"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/listings_vid.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="listings-header-overlay"></div>
          <div className="listings-container">
            <div className="header-content">
              <h1>Find Your Perfect Workspace</h1>
              <p>
                Discover premium commercial spaces tailored to your business
                needs
              </p>
            </div>
          </div>
        </div>

        <div className="listings-container">
          {/* Enhanced Filters */}
          <div
            className={`listings-filters observe-animation ${
              filtersVisible ? "visible" : ""
            }`}
          >
            <div className="filters-header">
              <div className="filters-title">
                <BiFilterAlt className="filters-icon" />
                <span>Filter Properties</span>
                {isFiltering && (
                  <div className="filter-loading">
                    <FaSpinner className="filter-spinner" />
                    <span>Filtering...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="search-section">
              <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by location, property name, or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="clear-search"
                    onClick={() => setSearchTerm("")}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="filter-controls">
              <div className="filter-group">
                <label htmlFor="location-filter">
                  <FaMapMarkerAlt className="filter-icon" />
                  Location
                </label>
                <div className="select-wrapper">
                  <select
                    id="location-filter"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="all">All Locations</option>
                    {availableLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  <MdKeyboardArrowDown className="select-arrow" />
                </div>
              </div>
              <div className="filter-group">
                <label htmlFor="type-filter">
                  <FaFilter className="filter-icon" />
                  Property Type
                </label>
                <div className="select-wrapper">
                  <select
                    id="type-filter"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    {availableTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === "Hospitality & Healthcare"
                          ? "Hospitality & Healthcare"
                          : `${type} Space`}
                      </option>
                    ))}
                  </select>
                  <MdKeyboardArrowDown className="select-arrow" />
                </div>
              </div>

              <button
                className="reset-filters"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("all");
                  setSelectedLocation("all");
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Results Info with Pagination Stats */}
          <div className="results-info" ref={listingsGridRef}>
            <div className="results-count">
              {/* <span className="count-number"> */}
              {/* {pagination.total > 0 ? (
                <>
                  Showing {(currentPage - 1) * 50 + 1}-
                  {Math.min(currentPage * 50, pagination.total)} of{" "}
                  {pagination.total}
                </>
              ) : (
                "0"
              )} */}
              {/* </span>
            <span className="count-text">
              {" "}
              {pagination.total === 1 ? "property" : "properties"}
            </span> */}
            </div>
            <div className="sort-options">
              <span>Sort by:</span>
              <select className="sort-select">
                <option>Most Popular</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>
          </div>

          {/* Filter Loading Overlay for Grid */}
          {isFiltering && (
            <div className="grid-loading-overlay">
              <div className="grid-loading-content">
                <div className="pulse-loader">
                  <div className="pulse-dot"></div>
                  <div className="pulse-dot"></div>
                  <div className="pulse-dot"></div>
                </div>
                <p>Updating results...</p>
              </div>
            </div>
          )}

          {/* Listings Grid */}
          <div className={`listings-grid ${isFiltering ? "filtering" : ""}`}>
            {filteredListings.map((listing, index) => (
              <div
                key={listing._id}
                data-index={index}
                className={`listing-card observe-animation ${
                  visibleCards.includes(index) ? "visible" : ""
                }`}
              >
                <div className="listing-image">
                  <div className="image-carousel">
                    <img
                      src={
                        listing.images && listing.images.length > 0
                          ? listing.images[
                              currentImageIndexes[listing._id] || 0
                            ]
                          : "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"
                      }
                      alt={listing.title}
                      loading="lazy"
                    />
                    {listing.images && listing.images.length > 1 && (
                      <>
                        <button
                          className="carousel-btn prev-btn"
                          onClick={() =>
                            prevImage(listing._id, listing.images.length)
                          }
                        >
                          <FaChevronLeft />
                        </button>
                        <button
                          className="carousel-btn next-btn"
                          onClick={() =>
                            nextImage(listing._id, listing.images.length)
                          }
                        >
                          <FaChevronRight />
                        </button>
                        <div className="image-indicators">
                          {listing.images.map((_, imgIndex) => (
                            <span
                              key={imgIndex}
                              className={`indicator ${
                                imgIndex ===
                                (currentImageIndexes[listing._id] || 0)
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => {
                                clearInterval(
                                  imageIntervals.current[listing._id],
                                );
                                setCurrentImageIndexes((prev) => ({
                                  ...prev,
                                  [listing._id]: imgIndex,
                                }));
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="listing-type">{listing.type}</div>
                </div>

                <div className="listing-content">
                  <div className="listing-header-section">
                    <div className="listing-info">
                      <h3>{listing.title}</h3>

                      <div className="listing-details">
                        <div className="detail-item">
                          <FaMapMarkerAlt className="detail-icon" />
                          <span>{listing.location}</span>
                        </div>
                        <div className="detail-item">
                          <MdSpaceDashboard className="detail-icon" />
                          <span>{listing.area}</span>
                        </div>
                        <div className="detail-item price">
                          {isPriceAvailable(listing.price) && (
                            <FaRupeeSign className="detail-icon" />
                          )}
                          <span>{formatPrice(listing.price)}</span>
                        </div>
                      </div>
                    </div>

                    {listing.videoUrls && listing.videoUrls.length > 0 && (
                      <button
                        className="watch-videos-btn-header"
                        onClick={() => handleWatchVideos(listing)}
                        title="Watch property videos"
                      >
                        <FaPlay />
                        Watch Videos
                      </button>
                    )}
                  </div>

                  <div className="listing-features">
                    {listing.features &&
                      listing.features.map((feature, idx) => (
                        <span key={idx} className="feature-tag">
                          {feature}
                        </span>
                      ))}
                  </div>

                  <div className="listing-footer">
                    <div className="listing-meta">
                      <span className="views-count">
                        <FaEye />{" "}
                        {listingViews[listing._id] ||
                          generateRandomViews(listing.viewsRange)}{" "}
                        views
                      </span>
                    </div>
                    <div className="listing-actions">
                      <button
                        className="listings-btn-primary get-report-btn"
                        onClick={() => handleGetReport(listing)}
                      >
                        <FaFileAlt />
                        {isPriceAvailable(listing.price)
                          ? "Get Best Price"
                          : "Request Price"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {(() => {
            const paginationInfo = getPaginationInfo();
            return paginationInfo.pages > 1 && !isLoading && !error ? (
              <div className="pagination-wrapper">
                <div className="pagination-info">
                  <p>
                    Page {currentPage} of {paginationInfo.pages} • Total{" "}
                    {paginationInfo.total} properties
                  </p>
                </div>
                <div className="pagination-controls">
                  {/* First Page Button */}
                  <button
                    className="pagination-btn pagination-btn-first"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1 || isFiltering}
                    title="First Page"
                  >
                    <FaAngleDoubleLeft />
                  </button>

                  {/* Previous Button */}
                  <button
                    className="pagination-btn pagination-btn-prev"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!paginationInfo.hasPrev || isFiltering}
                    title="Previous Page"
                  >
                    <FaChevronLeft />
                    <span className="pagination-btn-text">Previous</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="pagination-numbers">
                    {getPageNumbers().map((page, index) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="pagination-ellipsis"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          className={`pagination-number ${
                            currentPage === page ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(page)}
                          disabled={isFiltering}
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>

                  {/* Next Button */}
                  <button
                    className="pagination-btn pagination-btn-next"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!paginationInfo.hasNext || isFiltering}
                    title="Next Page"
                  >
                    <span className="pagination-btn-text">Next</span>
                    <FaChevronRight />
                  </button>

                  {/* Last Page Button */}
                  <button
                    className="pagination-btn pagination-btn-last"
                    onClick={() => handlePageChange(paginationInfo.pages)}
                    disabled={
                      currentPage === paginationInfo.pages || isFiltering
                    }
                    title="Last Page"
                  >
                    <FaAngleDoubleRight />
                  </button>
                </div>
              </div>
            ) : null;
          })()}

          {/* No Results */}
          {filteredListings.length === 0 &&
            !isLoading &&
            !error &&
            !isFiltering && (
              <div className="no-results">
                <div className="no-results-icon">
                  <MdLocationCity />
                </div>
                <h3>No properties found</h3>
                <p>
                  Try adjusting your search criteria or browse all properties
                </p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("all");
                    setSelectedLocation("all");
                  }}
                >
                  Show All Properties
                </button>
              </div>
            )}
        </div>

        {/* Report Request Popup - keeping the existing popup code */}
        {showReportPopup && (
          <div className="listings-popup-overlay">
            <div className="listings-popup-container" ref={popupRef}>
              <div className="listings-popup-header">
                <h3>
                  <FaFileAlt
                    style={{ marginRight: "0.5rem", color: "#23c6a4" }}
                  />
                  Get Property Report
                </h3>
                <button
                  className="listings-popup-close"
                  onClick={closeReportPopup}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="listings-popup-content">
                {selectedListing && (
                  <div className="listings-popup-property-summary">
                    <h4>{selectedListing.title}</h4>
                    <p>
                      <FaMapMarkerAlt style={{ marginRight: "0.3rem" }} />
                      {selectedListing.location} • {selectedListing.area} •{" "}
                      {isPriceAvailable(selectedListing.price) && "₹"}
                      {formatPrice(selectedListing.price)}
                    </p>
                    <p className="listings-popup-property-code">
                      Property Code: {selectedListing.propertyCode}
                    </p>
                  </div>
                )}

                {!reportSubmissionSuccess ? (
                  <>
                    <p className="listings-popup-description">
                      Please provide your details to receive a comprehensive
                      property report. Our team will contact you with detailed
                      information about this property.
                    </p>

                    {reportErrors.submit && (
                      <div className="listings-popup-error-banner">
                        <span className="listings-popup-error-icon">⚠️</span>
                        {reportErrors.submit}
                      </div>
                    )}

                    <div className="listings-popup-form">
                      <div className="listings-popup-form-grid">
                        <div
                          className={`listings-popup-form-group ${
                            reportErrors.name ? "listings-popup-error" : ""
                          }`}
                        >
                          <label>
                            <MdPerson className="listings-popup-form-icon" />
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={userInfo.name}
                            onChange={(e) =>
                              setUserInfo((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Enter your full name"
                            disabled={isSubmittingReport}
                          />
                          {reportErrors.name && (
                            <span className="listings-popup-error-message">
                              {reportErrors.name}
                            </span>
                          )}
                        </div>

                        <div
                          className={`listings-popup-form-group ${
                            reportErrors.company ? "listings-popup-error" : ""
                          }`}
                        >
                          <label>
                            <MdBusiness className="listings-popup-form-icon" />
                            Company Name *
                          </label>
                          <input
                            type="text"
                            value={userInfo.company}
                            onChange={(e) =>
                              setUserInfo((prev) => ({
                                ...prev,
                                company: e.target.value,
                              }))
                            }
                            placeholder="Enter your company name"
                            disabled={isSubmittingReport}
                          />
                          {reportErrors.company && (
                            <span className="listings-popup-error-message">
                              {reportErrors.company}
                            </span>
                          )}
                        </div>

                        <div
                          className={`listings-popup-form-group ${
                            reportErrors.designation
                              ? "listings-popup-error"
                              : ""
                          }`}
                        >
                          <label>
                            <FaBuilding className="listings-popup-form-icon" />
                            Designation *
                          </label>
                          <input
                            type="text"
                            value={userInfo.designation}
                            onChange={(e) =>
                              setUserInfo((prev) => ({
                                ...prev,
                                designation: e.target.value,
                              }))
                            }
                            placeholder="Enter your designation"
                            disabled={isSubmittingReport}
                          />
                          {reportErrors.designation && (
                            <span className="listings-popup-error-message">
                              {reportErrors.designation}
                            </span>
                          )}
                        </div>

                        <div
                          className={`listings-popup-form-group ${
                            reportErrors.phone ? "listings-popup-error" : ""
                          }`}
                        >
                          <label>
                            <MdPhone className="listings-popup-form-icon" />
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={userInfo.phone}
                            onChange={(e) =>
                              setUserInfo((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            placeholder="Enter your phone number"
                            disabled={isSubmittingReport}
                          />
                          {reportErrors.phone && (
                            <span className="listings-popup-error-message">
                              {reportErrors.phone}
                            </span>
                          )}
                        </div>

                        <div
                          className={`listings-popup-form-group listings-popup-full-width ${
                            reportErrors.email ? "listings-popup-error" : ""
                          }`}
                        >
                          <label>
                            <MdEmail className="listings-popup-form-icon" />
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={userInfo.email}
                            onChange={(e) =>
                              setUserInfo((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            placeholder="Enter your email address"
                            disabled={isSubmittingReport}
                          />
                          {reportErrors.email && (
                            <span className="listings-popup-error-message">
                              {reportErrors.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="listings-popup-actions">
                      <button
                        className="listings-popup-btn-secondary"
                        onClick={closeReportPopup}
                        disabled={isSubmittingReport}
                      >
                        Cancel
                      </button>
                      <button
                        className="listings-popup-btn-primary"
                        onClick={submitReportRequest}
                        disabled={isSubmittingReport}
                      >
                        {isSubmittingReport ? (
                          <>
                            <FaSpinner className="listings-popup-loading-spinner" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FaFileAlt />
                            Submit Request
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="listings-popup-success-content">
                    <div className="listings-popup-success-icon">
                      <FaCheckCircle />
                    </div>
                    <h4>Request Submitted Successfully!</h4>
                    <p>
                      Thank you for your interest in this property. Our team
                      will connect with you soon with a detailed property report
                      and all the information you need.
                    </p>
                    <p className="listings-popup-success-note">
                      You will also receive a confirmation email shortly.
                    </p>
                    <button
                      className="listings-popup-btn-primary"
                      onClick={closeReportPopup}
                    >
                      Got It
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Video Player Popup */}
        {showVideoPopup && selectedVideoListingId && (
          <div className="listings-popup-overlay">
            <div
              className="listings-popup-container video-popup-container"
              ref={videoPopupRef}
            >
              <div className="listings-popup-header">
                <h3>
                  <FaPlay style={{ marginRight: "0.5rem", color: "#23c6a4" }} />
                  Watch Property Videos
                </h3>
                <button
                  className="listings-popup-close"
                  onClick={closeVideoPopup}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="listings-popup-content video-popup-content">
                {(() => {
                  const listing = filteredListings.find(
                    (l) => l._id === selectedVideoListingId,
                  );
                  const videoUrls = listing?.videoUrls || [];
                  const videoId = extractYouTubeVideoId(
                    videoUrls[selectedVideoIndex],
                  );

                  return (
                    <>
                      {listing && (
                        <div className="listings-popup-property-summary">
                          <h4>{listing.title}</h4>
                          <p>
                            <FaMapMarkerAlt style={{ marginRight: "0.3rem" }} />
                            {listing.location} • {listing.area}
                          </p>
                        </div>
                      )}

                      {videoUrls.length > 0 ? (
                        <>
                          {/* Video Player */}
                          <div className="video-player-container">
                            {videoId ? (
                              <iframe
                                width="100%"
                                height="500"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                title="Property Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : (
                              <div className="video-player-error">
                                <p>Unable to load video. Invalid URL format.</p>
                              </div>
                            )}
                          </div>

                          {/* Video Selection Dropdown (if multiple videos) */}
                          {videoUrls.length > 1 && (
                            <div className="video-selection">
                              <label>Select Video:</label>
                              <select
                                value={selectedVideoIndex}
                                onChange={(e) =>
                                  setSelectedVideoIndex(
                                    parseInt(e.target.value),
                                  )
                                }
                                className="video-select"
                              >
                                {videoUrls.map((url, index) => (
                                  <option key={index} value={index}>
                                    Video {index + 1}{" "}
                                    {/* {url && `- ${url.substring(0, 50)}...`} */}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Video URLs List */}
                          <div className="video-urls-list">
                            <h4>
                              Videos for this Property ({videoUrls.length}):
                            </h4>
                            <div className="video-items">
                              {videoUrls.map((url, index) => (
                                <button
                                  key={index}
                                  className={`video-item ${
                                    selectedVideoIndex === index ? "active" : ""
                                  }`}
                                  onClick={() => setSelectedVideoIndex(index)}
                                >
                                  <FaPlay className="video-item-icon" />
                                  <div className="video-item-info">
                                    <div className="video-item-title">
                                      Video {index + 1}
                                    </div>
                                    {/* <div className="video-item-url">{url}</div> */}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="listings-popup-actions">
                            <button
                              className="listings-popup-btn-primary"
                              onClick={closeVideoPopup}
                            >
                              Close
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="listings-popup-error-banner">
                          <span className="listings-popup-error-icon">⚠️</span>
                          No videos available for this property
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Listings;
