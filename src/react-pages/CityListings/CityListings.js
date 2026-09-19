"use client";

import React, { useState, useEffect, useRef } from "react";
// import { useParams } from "@/lib/react-router-dom";
// import { Helmet } from "react-helmet-async";
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
import "../Listings/Listings.css";
import { BiFilterAlt } from "react-icons/bi";
import { FaBuilding } from "react-icons/fa";

// Using same CSS as Listings page

// City metadata for SEO
const CITIES_SEO_DATA = {
  bangalore: {
    name: "Bangalore",
    state: "Karnataka",
    seoTitle:
      "Office Space for Rent in Bangalore | Coworking & Commercial Offices | Abacus Spaces",
    seoDescription:
      "Find premium office spaces for rent in Bangalore. Explore coworking spaces, managed offices, and commercial office spaces in prime business locations with Abacus Spaces.",
    keywords:
      "office space for rent in bangalore, commercial office space bangalore, coworking space bangalore, managed office bangalore, office lease bangalore",
  },

  coimbatore: {
    name: "Coimbatore",
    state: "Tamil Nadu",
    seoTitle:
      "Office Space for Rent in Coimbatore | Commercial Offices | Abacus Spaces",
    seoDescription:
      "Find affordable office spaces for rent in Coimbatore. Explore managed offices, coworking spaces, and commercial office spaces for startups and enterprises.",
    keywords:
      "office space for rent in coimbatore, commercial office space coimbatore, coworking space coimbatore, managed office coimbatore, office lease coimbatore",
  },

  hyderabad: {
    name: "Hyderabad",
    state: "Telangana",
    seoTitle:
      "Office Space for Rent in Hyderabad | Commercial Offices | Abacus Spaces",
    seoDescription:
      "Explore premium office spaces for rent in Hyderabad. Compare coworking spaces, managed offices, and commercial office spaces in leading business hubs.",
    keywords:
      "office space for rent in hyderabad, commercial office space hyderabad, coworking space hyderabad, managed office hyderabad, office lease hyderabad",
  },

  chennai: {
    name: "Chennai",
    state: "Tamil Nadu",
    seoTitle:
      "Office Space for Rent in Chennai | Coworking & Commercial Offices | Abacus Spaces",
    seoDescription:
      "Find premium office spaces for rent in Chennai. Compare managed offices, coworking spaces, and commercial office spaces in prime business locations with Abacus Spaces.",
    keywords:
      "office space for rent in chennai, commercial office space chennai, coworking space chennai, managed office chennai, office lease chennai",
  },
};

const slugifyPathSegment = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const CityListings = ({ city, propertyType = "all" }) => {
  const citySlug = slugifyPathSegment(city || "");

  const cityData = CITIES_SEO_DATA[citySlug];

  const selectedTypeFromRoute = propertyType;

  const listingPath = cityData ? `/locations/${citySlug}` : "/listings";
  // States
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState(selectedTypeFromRoute);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCards, setVisibleCards] = useState([]);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [availableTypes, setAvailableTypes] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [listingViews, setListingViews] = useState({});
  const [isFiltering, setIsFiltering] = useState(false);

  // Report popup states
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

  // Video popup states
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [selectedVideoListingId, setSelectedVideoListingId] = useState(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  const sectionRef = useRef(null);
  const imageIntervals = useRef({});
  const popupRef = useRef(null);
  const videoPopupRef = useRef(null);
  const listingsGridRef = useRef(null);
  const isRouteSyncingRef = useRef(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

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

  // Generate random views
  const generateRandomViews = (viewsRange) => {
    if (!viewsRange || viewsRange.length !== 2) {
      return Math.floor(Math.random() * 200) + 100;
    }
    const [min, max] = viewsRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Get active filters
  const getActiveFilters = () => {
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (selectedType !== "all") filters.type = selectedType;
    if (cityData?.name) filters.location = cityData.name;
    return filters;
  };

  // Fetch listings for city
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
        location: cityData?.name,
        ...filters,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === "all") {
          delete params[key];
        }
      });

      const response = await api.get("/listings", { params });

      if (response.data.success) {
        const listingsData = response.data.data;

        const initialIndexes = {};
        const initialViews = {};

        listingsData.forEach((listing) => {
          initialIndexes[listing._id] = 0;
          initialViews[listing._id] = generateRandomViews(listing.viewsRange);
        });

        setCurrentImageIndexes((prev) => ({ ...prev, ...initialIndexes }));
        setListingViews((prev) => ({ ...prev, ...initialViews }));

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

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;

    if (listingsGridRef.current) {
      listingsGridRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setVisibleCards([]);
    fetchListings(newPage, getActiveFilters(), true);
  };

  // Handle Get Report
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

  // Close report popup
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

  // Format price
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

  // Check if price is available
  const isPriceAvailable = (price) => {
    if (!price) return false;
    const priceStr = price.toString().trim();
    return priceStr !== "0" && priceStr !== "₹0";
  };

  // Extract YouTube video ID
  const extractYouTubeVideoId = (url) => {
    if (!url) return null;

    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) return shortsMatch[1];

    const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) return watchMatch[1];

    const youtuMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (youtuMatch) return youtuMatch[1];

    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (embedMatch) return embedMatch[1];

    return null;
  };

  // Handle Watch Videos
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

  // Sync the route slug with the active filters and fetch the matching city data
  useEffect(() => {
    if (!cityData?.name) return;

    const loadRouteData = async () => {
      isRouteSyncingRef.current = true;

      try {
        setSelectedType(selectedTypeFromRoute);
        setSearchTerm("");
        setCurrentPage(1);
        setVisibleCards([]);

        const routeFilters = {
          location: cityData.name,
        };

        if (selectedTypeFromRoute !== "all") {
          routeFilters.type = selectedTypeFromRoute;
        }

        await Promise.all([
          fetchListings(1, routeFilters, false),
          fetchPropertyTypes(),
        ]);
      } finally {
        isRouteSyncingRef.current = false;
      }
    };

    loadRouteData();
  }, [cityData?.name, selectedTypeFromRoute, citySlug]);

  // Scroll to top
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

  // Intersection observer for animations
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

  // Handle filters
  useEffect(() => {
    if (isRouteSyncingRef.current) return;

    const debounceTimer = setTimeout(() => {
      fetchListings(1, getActiveFilters(), true);
      setVisibleCards([]);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedType]);

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

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const totalPages = pagination.pages || 1;
    const current = currentPage;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
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
    }
    return pages;
  };

  if (!cityData) {
    return (
      <div className="listings-page">
        {/* <Helmet>
          <title>City Not Found | Abacus Spaces</title>
          <meta name="description" content="The requested city was not found" />
          <meta name="robots" content="noindex, follow" />
        </Helmet> */}
        <div className="listings-container">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <h1>City Not Found</h1>
            <p>The city you're looking for is not available.</p>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbLabel =
    selectedTypeFromRoute === "all"
      ? cityData.name
      : `${selectedTypeFromRoute} Space for Rent in ${cityData.name}`;

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: breadcrumbLabel, url: listingPath },
  ];

  const pageTitle =
    selectedTypeFromRoute === "all"
      ? cityData.seoTitle
      : `${selectedTypeFromRoute} Space for Rent in ${cityData.name} | Commercial Real Estate`;
  const pageDescription =
    selectedTypeFromRoute === "all"
      ? cityData.seoDescription
      : `Find premium ${selectedTypeFromRoute.toLowerCase()} spaces for rent in ${cityData.name}. Flexible commercial leasing solutions for businesses of all sizes.`;
  const pageKeywords =
    selectedTypeFromRoute === "all"
      ? cityData.keywords
      : `${selectedTypeFromRoute.toLowerCase()} space for rent in ${cityData.name.toLowerCase()}, ${selectedTypeFromRoute.toLowerCase()} spaces ${cityData.name.toLowerCase()}, commercial real estate ${cityData.name.toLowerCase()}`;

  return (
    <>
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
              <h1>
                {selectedTypeFromRoute === "all"
                  ? `Premium Spaces in ${cityData.name}`
                  : `${selectedTypeFromRoute} Space for Rent in ${cityData.name}`}
              </h1>
              <p>
                {selectedTypeFromRoute === "all"
                  ? "Discover flexible commercial spaces tailored to your business needs"
                  : `Discover flexible ${selectedTypeFromRoute.toLowerCase()} leasing options tailored to your business needs`}
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
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Results Info with Pagination Stats */}
          <div className="results-info" ref={listingsGridRef}>
            <div className="results-count" />
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

          {/* Filter Loading Overlay */}
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
          {pagination.pages > 1 && !isLoading && !error && (
            <div className="pagination-wrapper">
              <div className="pagination-info">
                <p>
                  Page {currentPage} of {pagination.pages} • Total{" "}
                  {pagination.total} properties
                </p>
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-btn pagination-btn-first"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || isFiltering}
                  title="First Page"
                >
                  <FaAngleDoubleLeft />
                </button>

                <button
                  className="pagination-btn pagination-btn-prev"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev || isFiltering}
                  title="Previous Page"
                >
                  <FaChevronLeft />
                  <span className="pagination-btn-text">Previous</span>
                </button>

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

                <button
                  className="pagination-btn pagination-btn-next"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext || isFiltering}
                  title="Next Page"
                >
                  <span className="pagination-btn-text">Next</span>
                  <FaChevronRight />
                </button>

                <button
                  className="pagination-btn pagination-btn-last"
                  onClick={() => handlePageChange(pagination.pages)}
                  disabled={currentPage === pagination.pages || isFiltering}
                  title="Last Page"
                >
                  <FaAngleDoubleRight />
                </button>
              </div>
            </div>
          )}

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
                  }}
                >
                  Show All Properties
                </button>
              </div>
            )}
        </div>

        {/* Report Request Popup */}
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
                                    Video {index + 1}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

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

export default CityListings;
