"use client";

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "@/lib/react-router-dom";
import {
  FaLinkedin,
  FaInstagram,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import axios from "axios";
import "./Footer.css"; // Import the CSS file for styling

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success"); // 'success' or 'error'
  const location = useLocation();
  const navigate = useNavigate();

  // Get base URL from environment variables
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  // Configure axios instance
  const api =
    typeof window !== "undefined"
      ? axios.create({
          baseURL: API_BASE_URL,
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        })
      : null;

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email || !email.trim()) {
      setPopupMessage("Please enter a valid email address");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/subscriptions", {
        email: email.trim(),
        source: "footer",
        metadata: {},
        preferences: {},
      });

      if (response.data.success) {
        setPopupMessage(
          response.data.message ||
            "Thank you for subscribing! You'll receive our latest updates soon.",
        );
        setPopupType("success");
        setShowPopup(true);
        setEmail(""); // Clear the input

        // Auto-close popup after 5 seconds
        setTimeout(() => {
          setShowPopup(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Subscription error:", error);

      let errorMessage = "Failed to subscribe. Please try again later.";

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

      setPopupMessage(errorMessage);
      setPopupType("error");
      setShowPopup(true);

      // Auto-close error popup after 5 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  // Handle scroll to Latest in Real Estate section
  const handleLatestEstateClick = (e) => {
    e.preventDefault();

    if (location.pathname === "/") {
      // Already on home page, just scroll
      const latestEstateSection = document.getElementById("latest-estate");
      if (latestEstateSection) {
        latestEstateSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Navigate to home page with hash
      navigate("/#latest-estate");
    }
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          {/* Main Footer Content - 4 Columns */}
          <div className="footer-columns">
            {/* Column 1 - Logo & Social Media & Subscribe */}
            <div className="footer-column">
              <Link to="/" className="footer-brand">
                <img
                  src="/logo_abacus.png"
                  alt="Abacus Spaces Logo"
                  className="footer-brand-logo"
                />
              </Link>

              {/* Social Media */}
              <div className="footer-social">
                <a
                  href="https://linkedin.com/company/abacus-spaces"
                  className="footer-social-link"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin />
                </a>
                <a
                  href="https://www.instagram.com/abacus_spaces?igsh=b3VrM290NGRyMGx6"
                  className="footer-social-link"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://twitter.com/abacus_spaces"
                  className="footer-social-link"
                  aria-label="Twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaXTwitter />
                </a>
              </div>

              {/* Subscribe Section */}
              <div className="footer-subscribe">
                <p className="footer-subscribe-text">
                  Subscribe now to stay updated
                </p>
                <form
                  onSubmit={handleSubscribe}
                  className="footer-subscribe-form"
                >
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="footer-subscribe-input"
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="submit"
                    className="footer-subscribe-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Subscribing..." : "Subscribe"}
                  </button>
                </form>
              </div>
            </div>

            {/* Column 2 - Services */}
            <div className="footer-column">
              <h3 className="footer-column-title">Services</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/#services">Retail</Link>
                </li>
                <li>
                  <Link to="/#services">Office Space</Link>
                </li>
                <li>
                  <Link to="/#services">BTS</Link>
                </li>
                <li>
                  <Link to="/#services">Managed Office Setup</Link>
                </li>
                <li>
                  <Link to="/#services">Hospitality</Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Technology & Projects */}
            <div className="footer-column">
              <h3 className="footer-column-title">Technology</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/space-calculator">Space Calculator</Link>
                </li>
              </ul>

              <h3 className="footer-column-title">Projects</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/listings">Retail Space</Link>
                </li>
                <li>
                  <Link to="/listings">Office Space</Link>
                </li>
                <li>
                  <Link to="/listings">Hospitality</Link>
                </li>
                <li>
                  <Link to="/listings">Healthcare Space</Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - Insights & Media */}
            <div className="footer-column">
              <h3 className="footer-column-title">Insights</h3>
              <ul className="footer-links">
                <li>
                  <a href="/#latest-estate" onClick={handleLatestEstateClick}>
                    Research Report
                  </a>
                </li>
                <li>
                  <a href="/#latest-estate" onClick={handleLatestEstateClick}>
                    Blogs
                  </a>
                </li>
                <li>
                  <a href="/#latest-estate" onClick={handleLatestEstateClick}>
                    Industrial Update
                  </a>
                </li>
              </ul>

              <h3 className="footer-column-title">Media</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/insights-reports">In The News</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Diversity Statement */}
          <div className="footer-diversity">
            <p>
              We value diversity within Abacus Spaces and are committed to
              offering equal opportunities in employment. We do not discriminate
              against any team member or applicant for employment on the basis
              of nationality, race, colour, religion, caste, gender
              identity/expression, sexual orientation, disability, social origin
              and status, indigenous status, political opinion, age, marital
              status or any other personal characteristics or status. Abacus
              Spaces values all talent and will do its utmost to hire, nurture,
              and grow them.
            </p>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <p className="footer-copyright">
              © {currentYear} Abacus Spaces. All Rights Reserved.
            </p>
            <div className="footer-legal">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <span className="footer-separator">|</span>
              <Link to="/privacy-policy">Terms of Use</Link>
              <span className="footer-separator">|</span>
              <Link to="/rera-registration">RERA</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Subscription Popup */}
      {showPopup && (
        <div className="subscription-popup-overlay" onClick={closePopup}>
          <div
            className={`subscription-popup ${popupType}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="subscription-popup-close" onClick={closePopup}>
              <FaTimes />
            </button>
            <div className="subscription-popup-content">
              {popupType === "success" ? (
                <>
                  <div className="subscription-popup-icon success-icon">
                    <FaCheckCircle />
                  </div>
                  <h3 className="subscription-popup-title">
                    Subscribed Successfully!
                  </h3>
                  <p className="subscription-popup-message">{popupMessage}</p>
                </>
              ) : (
                <>
                  <div className="subscription-popup-icon error-icon">
                    <FaTimes />
                  </div>
                  <h3 className="subscription-popup-title">
                    Subscription Failed
                  </h3>
                  <p className="subscription-popup-message">{popupMessage}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
