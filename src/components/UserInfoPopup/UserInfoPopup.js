"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useLocation } from "@/lib/react-router-dom";
import axios from "axios";
import "./UserInfoPopup.css"; // Import the CSS file for styling
const UserInfoPopup = ({ delay = 3000 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    designation: "",
  });
  const [errors, setErrors] = useState({});

  const location = useLocation();

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

  useEffect(() => {
    // Check if current path is an admin page
    const isAdminPage = location.pathname.startsWith("/admin");

    // Check if user has already submitted
    const hasSubmitted = localStorage.getItem("userInfoSubmitted");

    // Check when popup was last closed
    const popupClosedTime = sessionStorage.getItem("popupClosedTime");
    let shouldShowPopup = false;

    if (!hasSubmitted && !isAdminPage) {
      if (!popupClosedTime) {
        // Popup hasn't been closed yet, show after delay
        shouldShowPopup = true;
      } else {
        // Check if 5 minutes (300000 ms) have passed
        const timePassed = Date.now() - parseInt(popupClosedTime);
        if (timePassed >= 300000) {
          // 5 minutes have passed, allow popup to show again
          shouldShowPopup = true;
          sessionStorage.removeItem("popupClosedTime");
        }
      }
    }

    if (shouldShowPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay, location.pathname]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.company.trim())
      newErrors.company = "Company name is required";
    if (!formData.designation.trim())
      newErrors.designation = "Designation is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare data in the format expected by the leads API
      const requestData = {
        userInfo: formData,
        source: "home_login",
        requestType: "user_registration",
      };

      const response = await api.post("/leads", requestData);

      if (response.data.success) {
        localStorage.setItem("userInfoSubmitted", "true");
        setSubmissionSuccess(true);

        // Auto-close popup after 3 seconds
        setTimeout(() => {
          setIsOpen(false);
        }, 3000);
      } else {
        setErrors({
          submit: response.data.message || "Failed to submit information",
        });
      }
    } catch (error) {
      console.error("Error submitting user info:", error);

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

      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Store the current timestamp when popup is closed
    // Popup will show again after 5 minutes
    sessionStorage.setItem("popupClosedTime", Date.now().toString());
  };

  if (!isOpen) return null;

  return (
    <div className="userinfopop-overlay">
      <div className="userinfopop-container">
        {!submissionSuccess && (
          <button
            onClick={handleClose}
            className="userinfopop-close-btn"
            aria-label="Close popup"
          >
            <X size={24} />
          </button>
        )}

        <div className="userinfopop-header">
          <h2 className="userinfopop-title">
            {submissionSuccess
              ? "Thank You! 🎉"
              : "Welcome to Our Platform! 👋"}
          </h2>
          <p className="userinfopop-subtitle">
            {submissionSuccess
              ? "Your information has been received successfully. We will contact you soon!"
              : "Please provide your professional details to access our services and receive personalized updates"}
          </p>
        </div>

        {!submissionSuccess ? (
          <>
            {errors.submit && (
              <div className="userinfopop-error-banner">
                <span className="userinfopop-error-icon">⚠️</span>
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="userinfopop-form">
              <div className="userinfopop-form-group">
                <label htmlFor="name" className="userinfopop-form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`userinfopop-form-input ${errors.name ? "error" : ""}`}
                  placeholder="Enter your full name (e.g., Michael Anderson)"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <span className="userinfopop-error-message">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="userinfopop-form-group">
                <label htmlFor="email" className="userinfopop-form-label">
                  Professional Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`userinfopop-form-input ${errors.email ? "error" : ""}`}
                  placeholder="Enter your business email (e.g., m.anderson@company.com)"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <span className="userinfopop-error-message">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="userinfopop-form-group">
                <label htmlFor="phone" className="userinfopop-form-label">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`userinfopop-form-input ${errors.phone ? "error" : ""}`}
                  placeholder="Enter your contact number with country code (e.g., +1-555-123-4567)"
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <span className="userinfopop-error-message">
                    {errors.phone}
                  </span>
                )}
              </div>

              <div className="userinfopop-form-group">
                <label htmlFor="company" className="userinfopop-form-label">
                  Organization Name *
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleInputChange}
                  className={`userinfopop-form-input ${errors.company ? "error" : ""}`}
                  placeholder="Enter your organization name (e.g., Global Enterprises Inc.)"
                  disabled={isSubmitting}
                />
                {errors.company && (
                  <span className="userinfopop-error-message">
                    {errors.company}
                  </span>
                )}
              </div>

              <div className="userinfopop-form-group">
                <label htmlFor="designation" className="userinfopop-form-label">
                  Job Title / Designation *
                </label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  required
                  value={formData.designation}
                  onChange={handleInputChange}
                  className={`userinfopop-form-input ${errors.designation ? "error" : ""}`}
                  placeholder="Enter your current position (e.g., Senior Marketing Manager)"
                  disabled={isSubmitting}
                />
                {errors.designation && (
                  <span className="userinfopop-error-message">
                    {errors.designation}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="userinfopop-form-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <span className="userinfopop-loading-spinner"></span>
                    Processing...
                  </>
                ) : (
                  "Submit Information"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="userinfopop-success-content">
            <div className="userinfopop-success-icon">✓</div>
            <button
              className="userinfopop-form-submit-btn"
              onClick={handleClose}
            >
              Got It
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfoPopup;
