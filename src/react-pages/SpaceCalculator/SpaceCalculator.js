"use client";

import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import {
  FaCalculator,
  FaBuilding,
  FaDesktop,
  FaDoorOpen,
  FaHandshake,
  FaCoffee,
  FaVideo,
  FaServer,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { MdEmail, MdPhone, MdPerson, MdBusiness } from "react-icons/md";
import "./SpaceCalculator.css"; // Import the CSS file for styling
const SpaceCalculator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [spaceData, setSpaceData] = useState({
    workstations: { type: "compact", persons: 0, area: 0 },
    cabins: { count: 0, area: 0 },
    reception: { count: 0, area: 0 },
    pantry: { type: "10pax", count: 0, area: 0 },
    conferenceRoom: { type: "7pax", count: 0, area: 0 },
    serverRoom: { count: 0, area: 0 },
  });
  const [userInfo, setUserInfo] = useState({
    name: "",
    company: "",
    designation: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const calculatorRef = useRef(null);

  // Configure axios base URL
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  // Create axios instance with default config
  const api =
    typeof window !== "undefined"
      ? axios.create({
          baseURL: API_BASE_URL,
          timeout: 10000, // 10 seconds timeout
          headers: {
            "Content-Type": "application/json",
          },
        })
      : null;
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 300);
  }, []);

  const workstationTypes = {
    compact: { label: "Compact", area: 25, description: "Efficient workspace" },
    standard: {
      label: "Standard",
      area: 30,
      description: "Comfortable workspace",
    },
    spacious: { label: "Spacious", area: 40, description: "Premium workspace" },
  };

  const pantryTypes = {
    "10pax": { label: "10 Pax", area: 200, description: "Small pantry" },
    "30pax": { label: "30 Pax", area: 500, description: "Large pantry" },
  };

  const conferenceTypes = {
    "7pax": { label: "7 Pax", area: 150, description: "Small meeting room" },
    "12pax": { label: "12 Pax", area: 250, description: "Large meeting room" },
  };

  const calculateArea = (category, type, count) => {
    const validCount = parseInt(count) || 0;

    switch (category) {
      case "workstations":
        return validCount * (workstationTypes[type]?.area || 25);
      case "cabins":
        return validCount * 160;
      case "reception":
        return validCount * 200;
      case "pantry":
        return validCount * (pantryTypes[type]?.area || 200);
      case "conferenceRoom":
        return validCount * (conferenceTypes[type]?.area || 150);
      case "serverRoom":
        return validCount * 100;
      default:
        return 0;
    }
  };

  const updateSpaceData = (category, field, value) => {
    setSpaceData((prev) => {
      const updated = { ...prev };
      updated[category] = { ...updated[category] };

      if (field === "type") {
        updated[category].type = value;
        if (category === "workstations") {
          updated[category].area = calculateArea(
            category,
            value,
            updated[category].persons,
          );
        } else {
          updated[category].area = calculateArea(
            category,
            value,
            updated[category].count,
          );
        }
      } else if (field === "persons" || field === "count") {
        const validValue = parseInt(value) || 0;
        updated[category][field] = validValue;
        updated[category].area = calculateArea(
          category,
          updated[category].type,
          validValue,
        );
      } else {
        updated[category][field] = value;
      }

      return updated;
    });
  };

  const getTotalArea = () => {
    return Object.values(spaceData).reduce((total, item) => {
      const area = parseInt(item.area) || 0;
      return total + area;
    }, 0);
  };

  const hasSpaceRequirements = () => {
    return Object.values(spaceData).some((item) => {
      const persons = parseInt(item.persons) || 0;
      const count = parseInt(item.count) || 0;
      return persons > 0 || count > 0;
    });
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!hasSpaceRequirements()) {
        newErrors.space = "Please add at least one space requirement";
      }
    }

    if (step === 2) {
      if (!userInfo.name.trim()) newErrors.name = "Name is required";
      if (!userInfo.company.trim())
        newErrors.company = "Company name is required";
      if (!userInfo.designation.trim())
        newErrors.designation = "Designation is required";
      if (!userInfo.phone.trim()) newErrors.phone = "Phone number is required";
      if (!userInfo.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(userInfo.email))
        newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Updated function to submit data to backend using axios
  const submitToBackend = async () => {
    setIsSubmitting(true);
    setSubmissionSuccess(false);
    setErrors((prev) => ({ ...prev, submit: null })); // Clear previous submit errors

    try {
      const requestData = {
        userInfo,
        spaceData,
        totalArea: getTotalArea(),
      };

      const response = await api.post("/leads", requestData);

      if (response.data.success) {
        setSubmissionSuccess(true);
        return true;
      } else {
        console.error("Failed to save lead:", response.data.message);
        setErrors((prev) => ({
          ...prev,
          submit: response.data.message || "Failed to submit inquiry",
        }));
        return false;
      }
    } catch (error) {
      console.error("Error saving lead:", error);

      let errorMessage = "Unable to connect to server. Please try again later.";

      if (error.response) {
        // Server responded with error status
        errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage =
          "No response from server. Please check your internet connection.";
      } else if (error.code === "ECONNABORTED") {
        // Request timeout
        errorMessage = "Request timeout. Please try again.";
      }

      setErrors((prev) => ({ ...prev, submit: errorMessage }));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Updated nextStep function with axios integration
  const nextStep = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        // Submit data to backend before showing results
        const success = await submitToBackend();
        // Always proceed to results, even if submission fails
        setCurrentStep((prev) => prev + 1);

        // If submission failed, you could show a toast notification here
        if (!success) {
          console.warn("Proceeding to results despite submission failure");
        }
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    setErrors({});
  };

  const handleInputChange = (category, field, inputValue) => {
    let value = inputValue;

    if (field === "persons" || field === "count") {
      value = Math.max(0, parseInt(inputValue) || 0);
    }

    updateSpaceData(category, field, value);
  };

  const resetCalculator = () => {
    setCurrentStep(1);
    setSpaceData({
      workstations: { type: "compact", persons: 0, area: 0 },
      cabins: { count: 0, area: 0 },
      reception: { count: 0, area: 0 },
      pantry: { type: "10pax", count: 0, area: 0 },
      conferenceRoom: { type: "7pax", count: 0, area: 0 },
      serverRoom: { count: 0, area: 0 },
    });
    setUserInfo({
      name: "",
      company: "",
      designation: "",
      phone: "",
      email: "",
    });
    setErrors({});
    setSubmissionSuccess(false);
    setIsSubmitting(false);
  };

  return (
    <>
      <Helmet>
        <title>
          Office Space Calculator | Calculate Your Commercial Space Needs
        </title>
        <meta
          name="description"
          content="Use our intelligent office space calculator to determine your perfect workspace requirements. Calculate space needed for workstations, cabins, meeting rooms, and more."
        />
        <meta
          name="keywords"
          content="space calculator, office space calculator, workspace calculator, commercial space calculator, office size calculator"
        />
        <link rel="canonical" href="https://abacuspaces.com/space-calculator" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Office Space Calculator" />
        <meta
          property="og:description"
          content="Calculate your exact commercial space requirements"
        />
        <meta
          property="og:url"
          content="https://abacuspaces.com/space-calculator"
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Office Space Calculator Tool" />
        <meta
          name="twitter:description"
          content="Calculate your workspace needs instantly"
        />
      </Helmet>

      <div className="sc-calculator-page">
        <div className="sc-calculator-container">
          {/* Header */}
          <div
            className={`sc-calculator-header ${isLoaded ? "sc-visible" : ""}`}
          >
            <div className="sc-header-content">
              <div className="sc-header-icon">
                <FaCalculator />
              </div>
              <h1>Office Space Calculator</h1>
              <p>
                Calculate your perfect office space requirements with our
                intelligent calculator
              </p>
            </div>
          </div>

          {/* Calculator Content */}
          <div
            className={`sc-calculator-content ${isLoaded ? "sc-visible" : ""} ${
              isSubmitting ? "sc-submitting" : ""
            }`}
            ref={calculatorRef}
          >
            {/* Step 1: Space Requirements */}
            {currentStep === 1 && (
              <div className="sc-step-content sc-space-requirements">
                <div className="sc-step-header">
                  <h2>Configure Your Space Requirements</h2>
                  <p>Select the components you need for your office space</p>
                </div>

                {errors.space && (
                  <div className="sc-error-banner">
                    <span className="sc-error-icon">⚠️</span>
                    {errors.space}
                  </div>
                )}

                <div className="sc-space-categories">
                  {/* Workstations */}
                  <div className="sc-category-card">
                    <div className="sc-category-header">
                      <div className="sc-category-icon">
                        <FaDesktop />
                      </div>
                      <div className="sc-category-info">
                        <h3>Workstations</h3>
                        <p>
                          Choose your workstation type and number of persons
                        </p>
                      </div>
                    </div>

                    <div className="sc-category-controls">
                      <div className="sc-type-selector">
                        <label>Workstation Type:</label>
                        <div className="sc-type-options">
                          {Object.entries(workstationTypes).map(
                            ([key, type]) => (
                              <button
                                key={key}
                                className={`sc-type-option ${
                                  spaceData.workstations.type === key
                                    ? "sc-active"
                                    : ""
                                }`}
                                onClick={() =>
                                  updateSpaceData("workstations", "type", key)
                                }
                              >
                                <span className="sc-type-label">
                                  {type.label}
                                </span>
                                <span className="sc-type-desc">
                                  {type.description}
                                </span>
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      <div className="sc-count-input">
                        <label>Number of Persons:</label>
                        <div className="sc-input-group">
                          <button
                            onClick={() =>
                              handleInputChange(
                                "workstations",
                                "persons",
                                Math.max(0, spaceData.workstations.persons - 1),
                              )
                            }
                            className="sc-count-btn"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={spaceData.workstations.persons}
                            onChange={(e) =>
                              handleInputChange(
                                "workstations",
                                "persons",
                                e.target.value,
                              )
                            }
                            min="0"
                          />
                          <button
                            onClick={() =>
                              handleInputChange(
                                "workstations",
                                "persons",
                                spaceData.workstations.persons + 1,
                              )
                            }
                            className="sc-count-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cabins */}
                  <div className="sc-category-card">
                    <div className="sc-category-header">
                      <div className="sc-category-icon">
                        <FaDoorOpen />
                      </div>
                      <div className="sc-category-info">
                        <h3>Cabins</h3>
                        <p>3-Seater private cabins</p>
                      </div>
                    </div>

                    <div className="sc-category-controls">
                      <div className="sc-count-input">
                        <label>Number of Cabins:</label>
                        <div className="sc-input-group">
                          <button
                            onClick={() =>
                              handleInputChange(
                                "cabins",
                                "count",
                                Math.max(0, spaceData.cabins.count - 1),
                              )
                            }
                            className="sc-count-btn"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={spaceData.cabins.count}
                            onChange={(e) =>
                              handleInputChange(
                                "cabins",
                                "count",
                                e.target.value,
                              )
                            }
                            min="0"
                          />
                          <button
                            onClick={() =>
                              handleInputChange(
                                "cabins",
                                "count",
                                spaceData.cabins.count + 1,
                              )
                            }
                            className="sc-count-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reception */}
                  <div className="sc-category-card">
                    <div className="sc-category-header">
                      <div className="sc-category-icon">
                        <FaHandshake />
                      </div>
                      <div className="sc-category-info">
                        <h3>Reception</h3>
                        <p>Standard reception area</p>
                      </div>
                    </div>

                    <div className="sc-category-controls">
                      <div className="sc-count-input">
                        <label>Number of Receptions:</label>
                        <div className="sc-input-group">
                          <button
                            onClick={() =>
                              handleInputChange(
                                "reception",
                                "count",
                                Math.max(0, spaceData.reception.count - 1),
                              )
                            }
                            className="sc-count-btn"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={spaceData.reception.count}
                            onChange={(e) =>
                              handleInputChange(
                                "reception",
                                "count",
                                e.target.value,
                              )
                            }
                            min="0"
                          />
                          <button
                            onClick={() =>
                              handleInputChange(
                                "reception",
                                "count",
                                spaceData.reception.count + 1,
                              )
                            }
                            className="sc-count-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pantry */}
                  <div className="sc-category-card">
                    <div className="sc-category-header">
                      <div className="sc-category-icon">
                        <FaCoffee />
                      </div>
                      <div className="sc-category-info">
                        <h3>Pantry</h3>
                        <p>Choose pantry size based on capacity</p>
                      </div>
                    </div>

                    <div className="sc-category-controls">
                      <div className="sc-type-selector">
                        <label>Pantry Type:</label>
                        <div className="sc-type-options">
                          {Object.entries(pantryTypes).map(([key, type]) => (
                            <button
                              key={key}
                              className={`sc-type-option ${
                                spaceData.pantry.type === key ? "sc-active" : ""
                              }`}
                              onClick={() =>
                                updateSpaceData("pantry", "type", key)
                              }
                            >
                              <span className="sc-type-label">
                                {type.label}
                              </span>
                              <span className="sc-type-desc">
                                {type.description}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="sc-count-input">
                        <label>Number of Pantries:</label>
                        <div className="sc-input-group">
                          <button
                            onClick={() =>
                              handleInputChange(
                                "pantry",
                                "count",
                                Math.max(0, spaceData.pantry.count - 1),
                              )
                            }
                            className="sc-count-btn"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={spaceData.pantry.count}
                            onChange={(e) =>
                              handleInputChange(
                                "pantry",
                                "count",
                                e.target.value,
                              )
                            }
                            min="0"
                          />
                          <button
                            onClick={() =>
                              handleInputChange(
                                "pantry",
                                "count",
                                spaceData.pantry.count + 1,
                              )
                            }
                            className="sc-count-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conference Room */}
                  <div className="sc-category-card">
                    <div className="sc-category-header">
                      <div className="sc-category-icon">
                        <FaVideo />
                      </div>
                      <div className="sc-category-info">
                        <h3>Conference Room</h3>
                        <p>Choose room size based on capacity</p>
                      </div>
                    </div>

                    <div className="sc-category-controls">
                      <div className="sc-type-selector">
                        <label>Room Type:</label>
                        <div className="sc-type-options">
                          {Object.entries(conferenceTypes).map(
                            ([key, type]) => (
                              <button
                                key={key}
                                className={`sc-type-option ${
                                  spaceData.conferenceRoom.type === key
                                    ? "sc-active"
                                    : ""
                                }`}
                                onClick={() =>
                                  updateSpaceData("conferenceRoom", "type", key)
                                }
                              >
                                <span className="sc-type-label">
                                  {type.label}
                                </span>
                                <span className="sc-type-desc">
                                  {type.description}
                                </span>
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      <div className="sc-count-input">
                        <label>Number of Rooms:</label>
                        <div className="sc-input-group">
                          <button
                            onClick={() =>
                              handleInputChange(
                                "conferenceRoom",
                                "count",
                                Math.max(0, spaceData.conferenceRoom.count - 1),
                              )
                            }
                            className="sc-count-btn"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={spaceData.conferenceRoom.count}
                            onChange={(e) =>
                              handleInputChange(
                                "conferenceRoom",
                                "count",
                                e.target.value,
                              )
                            }
                            min="0"
                          />
                          <button
                            onClick={() =>
                              handleInputChange(
                                "conferenceRoom",
                                "count",
                                spaceData.conferenceRoom.count + 1,
                              )
                            }
                            className="sc-count-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Server Room */}
                  <div className="sc-category-card">
                    <div className="sc-category-header">
                      <div className="sc-category-icon">
                        <FaServer />
                      </div>
                      <div className="sc-category-info">
                        <h3>Server Room</h3>
                        <p>Standard server room</p>
                      </div>
                    </div>

                    <div className="sc-category-controls">
                      <div className="sc-count-input">
                        <label>Number of Server Rooms:</label>
                        <div className="sc-input-group">
                          <button
                            onClick={() =>
                              handleInputChange(
                                "serverRoom",
                                "count",
                                Math.max(0, spaceData.serverRoom.count - 1),
                              )
                            }
                            className="sc-count-btn"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={spaceData.serverRoom.count}
                            onChange={(e) =>
                              handleInputChange(
                                "serverRoom",
                                "count",
                                e.target.value,
                              )
                            }
                            min="0"
                          />
                          <button
                            onClick={() =>
                              handleInputChange(
                                "serverRoom",
                                "count",
                                spaceData.serverRoom.count + 1,
                              )
                            }
                            className="sc-count-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: User Information */}
            {currentStep === 2 && (
              <div className="sc-step-content sc-user-info">
                <div className="sc-step-header">
                  <h2>Your Information</h2>
                  <p>Please provide your details to get the space calculated</p>
                </div>

                {/* Show submission error if any */}
                {errors.submit && (
                  <div className="sc-error-banner">
                    <span className="sc-error-icon">⚠️</span>
                    {errors.submit}
                  </div>
                )}

                <div className="sc-user-form">
                  <div className="sc-form-grid">
                    <div
                      className={`sc-form-group ${errors.name ? "sc-error" : ""}`}
                    >
                      <label>
                        <MdPerson className="sc-form-icon" />
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
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <span className="sc-error-message">{errors.name}</span>
                      )}
                    </div>

                    <div
                      className={`sc-form-group ${
                        errors.company ? "sc-error" : ""
                      }`}
                    >
                      <label>
                        <MdBusiness className="sc-form-icon" />
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
                        disabled={isSubmitting}
                      />
                      {errors.company && (
                        <span className="sc-error-message">
                          {errors.company}
                        </span>
                      )}
                    </div>

                    <div
                      className={`sc-form-group ${
                        errors.designation ? "sc-error" : ""
                      }`}
                    >
                      <label>
                        <FaBuilding className="sc-form-icon" />
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
                        disabled={isSubmitting}
                      />
                      {errors.designation && (
                        <span className="sc-error-message">
                          {errors.designation}
                        </span>
                      )}
                    </div>

                    <div
                      className={`sc-form-group ${
                        errors.phone ? "sc-error" : ""
                      }`}
                    >
                      <label>
                        <MdPhone className="sc-form-icon" />
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
                        disabled={isSubmitting}
                      />
                      {errors.phone && (
                        <span className="sc-error-message">{errors.phone}</span>
                      )}
                    </div>

                    <div
                      className={`sc-form-group sc-full-width ${
                        errors.email ? "sc-error" : ""
                      }`}
                    >
                      <label>
                        <MdEmail className="sc-form-icon" />
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
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <span className="sc-error-message">{errors.email}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Show loading state when submitting */}
                {isSubmitting && (
                  <div className="sc-loading">
                    <div className="sc-loading-spinner"></div>
                    <span>Submitting your inquiry...</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Results */}
            {currentStep === 3 && (
              <div className="sc-step-content sc-results">
                <div className="sc-step-header">
                  <h2>Space Calculation Results</h2>
                  <p>Here's your complete office space breakdown</p>
                </div>

                {/* Success message */}
                {submissionSuccess && (
                  <div className="sc-success-message">
                    <FaCheckCircle className="sc-success-icon" />
                    <p>
                      ✅ Your inquiry has been submitted successfully! Our team
                      will contact you within 24 hours.
                    </p>
                  </div>
                )}

                {/* Warning if submission failed but we're showing results */}
                {!submissionSuccess && errors.submit && (
                  <div className="sc-error-banner">
                    <span className="sc-error-icon">⚠️</span>
                    Your calculation is ready, but we couldn't save your
                    inquiry. Please contact us directly.
                  </div>
                )}

                <div className="sc-results-content">
                  <div className="sc-user-summary">
                    <h3>
                      <MdPerson style={{ marginRight: "0.5rem" }} />
                      Requested By
                    </h3>
                    <div className="sc-user-details">
                      <p>
                        <strong>Name:</strong> {userInfo.name}
                      </p>
                      <p>
                        <strong>Company:</strong> {userInfo.company}
                      </p>
                      <p>
                        <strong>Designation:</strong> {userInfo.designation}
                      </p>
                      <p>
                        <strong>Phone:</strong> {userInfo.phone}
                      </p>
                      <p>
                        <strong>Email:</strong> {userInfo.email}
                      </p>
                    </div>
                  </div>

                  <div className="sc-space-breakdown">
                    <h3>
                      <FaBuilding style={{ marginRight: "0.5rem" }} />
                      Space Breakdown
                    </h3>
                    <div className="sc-breakdown-list">
                      {Object.entries(spaceData).map(([key, data]) => {
                        const persons = parseInt(data.persons) || 0;
                        const count = parseInt(data.count) || 0;

                        if (
                          (key === "workstations" && persons === 0) ||
                          (key !== "workstations" && count === 0)
                        )
                          return null;

                        const categoryNames = {
                          workstations: "Workstations",
                          cabins: "Cabins",
                          reception: "Reception",
                          pantry: "Pantry",
                          conferenceRoom: "Conference Room",
                          serverRoom: "Server Room",
                        };

                        const categoryIcons = {
                          workstations: <FaDesktop />,
                          cabins: <FaDoorOpen />,
                          reception: <FaHandshake />,
                          pantry: <FaCoffee />,
                          conferenceRoom: <FaVideo />,
                          serverRoom: <FaServer />,
                        };

                        const getDetails = () => {
                          switch (key) {
                            case "workstations":
                              return `${persons} persons (${
                                workstationTypes[data.type]?.label || "Compact"
                              })`;
                            case "cabins":
                              return `${count} cabin(s)`;
                            case "reception":
                              return `${count} reception(s)`;
                            case "pantry":
                              return `${count} pantry(s) (${
                                pantryTypes[data.type]?.label || "10 Pax"
                              })`;
                            case "conferenceRoom":
                              return `${count} room(s) (${
                                conferenceTypes[data.type]?.label || "7 Pax"
                              })`;
                            case "serverRoom":
                              return `${count} room(s)`;
                            default:
                              return "";
                          }
                        };

                        return (
                          <div key={key} className="sc-breakdown-item">
                            <div className="sc-breakdown-info">
                              <div className="sc-breakdown-icon">
                                {categoryIcons[key]}
                              </div>
                              <div className="sc-breakdown-details">
                                <h4>{categoryNames[key]}</h4>
                                <p>{getDetails()}</p>
                              </div>
                            </div>
                            <div className="sc-breakdown-area">
                              {data.area.toLocaleString()} sq.ft
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="sc-total-summary">
                    <div className="sc-total-card sc-large">
                      <h3>
                        <FaCalculator style={{ marginRight: "0.5rem" }} />
                        Total Office Space Required
                      </h3>
                      <div className="sc-total-area sc-large">
                        {getTotalArea().toLocaleString()} sq.ft
                      </div>
                      <p>
                        Approximately {Math.ceil(getTotalArea() / 1000)}{" "}
                        thousand square feet
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="sc-step-navigation">
              {currentStep > 1 && currentStep < 3 && (
                <button
                  onClick={prevStep}
                  className="sc-btn-prev"
                  disabled={isSubmitting}
                >
                  <FaArrowLeft />
                  Previous
                </button>
              )}

              {currentStep < 3 && (
                <button
                  onClick={nextStep}
                  className="sc-btn-next"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="sc-loading-spinner" />
                      {currentStep === 2 ? "Submitting..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      {currentStep === 1
                        ? "Get Space Calculated"
                        : "Calculate Space"}
                      <FaArrowRight />
                    </>
                  )}
                </button>
              )}

              {currentStep === 3 && (
                <button onClick={resetCalculator} className="sc-btn-restart">
                  Calculate Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SpaceCalculator;
