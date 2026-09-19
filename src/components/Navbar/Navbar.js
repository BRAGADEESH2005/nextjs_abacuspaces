"use client";

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "@/lib/react-router-dom";
import {
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaTimes,
  FaChevronRight,
  FaCalculator,
  FaSearch,
  FaPhotoVideo,
  FaBriefcase,
  FaLightbulb,
  FaUsers,
} from "react-icons/fa";
import { MdViewList } from "react-icons/md";
import "./Navbar.css"; // Import the CSS file for styling

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (location.hash !== "#services") {
      return;
    }

    const timer = setTimeout(() => {
      document.getElementById("services")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [location.hash]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((isOpen) => !isOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    console.log("Searching for:", query);
  };

  const handleServicesClick = (event) => {
    event.preventDefault();
    closeMobileMenu();

    if (location.pathname === "/") {
      document.getElementById("services")?.scrollIntoView({
        behavior: "smooth",
      });
      return;
    }

    navigate("/#services");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-container">
          <div className="navbar-left">
            <div className="navbar-left-row">
              <Link
                to="/insights-reports"
                className={`navbar-link ${
                  isActive("/insights-reports") ? "active" : ""
                }`}
              >
                <FaPhotoVideo className="link-icon" />
                <span>Media</span>
                <div className="link-underline" />
              </Link>

              <Link
                to="/contact"
                className={`navbar-link ${
                  isActive("/contact") ? "active" : ""
                }`}
              >
                <FaEnvelope className="link-icon" />
                <span>Contact</span>
                <div className="link-underline" />
              </Link>
            </div>

            <div className="navbar-left-row">
              <a
                href="/#services"
                className={`navbar-link ${
                  location.hash === "#services" ? "active" : ""
                }`}
                onClick={handleServicesClick}
              >
                <span>Services</span>
                <div className="link-underline" />
              </a>

              <Link
                to="/listings"
                className={`navbar-link ${
                  isActive("/listings") ? "active" : ""
                }`}
              >
                <span>Properties</span>
                <div className="link-underline" />
              </Link>

              <Link
                to="/space-calculator"
                className={`navbar-link ${
                  isActive("/space-calculator") ? "active" : ""
                }`}
              >
                <span>Space Calculator</span>
                <div className="link-underline" />
              </Link>
            </div>
          </div>

          <Link
            to="/"
            className="navbar-brand"
            onClick={closeMobileMenu}
          >
            <img
              src="/logo_abacus.png"
              alt="Abacus Logo"
              className="brand-logo"
            />
          </Link>

          <div className="navbar-right">
            <div className="navbar-right-row">
              <form className="nav-search-bar" onSubmit={handleSearch}>
                <span className="search-label">Looking for</span>

                <input
                  type="text"
                  placeholder="office, commercial, hospitality"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="nav-search-input"
                />

                <button
                  type="submit"
                  className="search-button"
                  aria-label="Search"
                >
                  <FaSearch />
                </button>
              </form>
            </div>

            <div className="navbar-right-row">
              <Link
                to="/aboutus"
                className={`navbar-link ${
                  isActive("/aboutus") ? "active" : ""
                }`}
              >
                <span>About Us</span>
                <div className="link-underline" />
              </Link>

              <Link
                to="/insights-reports"
                className={`navbar-link ${
                  isActive("/insights-reports") ? "active" : ""
                }`}
              >
                <span>Insights</span>
                <div className="link-underline" />
              </Link>

              <Link
                to="/careers"
                className={`navbar-link ${
                  isActive("/careers") ? "active" : ""
                }`}
              >
                <span>Careers</span>
                <div className="link-underline" />
              </Link>
            </div>
          </div>

          <button
            type="button"
            className={`mobile-menu-toggle ${
              isMobileMenuOpen ? "active" : ""
            }`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="hamburger-box">
              <span className="hamburger-inner" />
            </span>
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="mobile-menu-blur"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <div className={`mobile-menu-panel ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <div className="mobile-brand">
            <img
              src="/logo_abacus.png"
              alt="Abacus Logo"
              className="mobile-brand-logo"
            />
          </div>

          <button
            type="button"
            className="mobile-close"
            onClick={closeMobileMenu}
            aria-label="Close mobile menu"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mobile-search-container">
          <form className="mobile-search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Looking for"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="mobile-search-input"
            />

            <button
              type="submit"
              className="mobile-search-button"
              aria-label="Search"
            >
              <FaSearch />
            </button>
          </form>
        </div>

        <div className="mobile-menu-items">
          <Link
            to="/"
            className={`mobile-nav-link ${
              isActive("/") ? "active" : ""
            }`}
            onClick={closeMobileMenu}
          >
            <FaHome className="mobile-link-icon" />
            <span className="mobile-link-text">Home</span>
            <FaChevronRight className="mobile-link-arrow" />
          </Link>

          <Link
            to="/insights-reports"
            className={`mobile-nav-link ${
              isActive("/insights-reports") ? "active" : ""
            }`}
            onClick={closeMobileMenu}
          >
            <FaPhotoVideo className="mobile-link-icon" />
            <span className="mobile-link-text">Media</span>
            <FaChevronRight className="mobile-link-arrow" />
          </Link>

          <Link
            to="/contact"
            className={`mobile-nav-link ${
              isActive("/contact") ? "active" : ""
            }`}
            onClick={closeMobileMenu}
          >
            <FaEnvelope className="mobile-link-icon" />
            <span className="mobile-link-text">Contact</span>
            <FaChevronRight className="mobile-link-arrow" />
          </Link>

          <a
            href="/#services"
            className={`mobile-nav-link ${
              location.hash === "#services" ? "active" : ""
            }`}
            onClick={handleServicesClick}
          >
            <FaBriefcase className="mobile-link-icon" />
            <span className="mobile-link-text">Services</span>
            <FaChevronRight className="mobile-link-arrow" />
          </a>

          <Link
            to="/listings"
            className={`mobile-nav-link ${
              isActive("/listings") ? "active" : ""
            }`}
            onClick={closeMobileMenu}
          >
            <MdViewList className="mobile-link-icon" />
            <span className="mobile-link-text">Properties</span>
            <FaChevronRight className="mobile-link-arrow" />
          </Link>

          <Link
            to="/space-calculator"
            className={`mobile-nav-link ${
              isActive("/space-calculator") ? "active" : ""
            }`}
            onClick={closeMobileMenu}
          >
            <FaCalculator className="mobile-link-icon" />
            <span className="mobile-link-text">Space Calculator</span>
            <FaChevronRight className="mobile-link-arrow" />
          </Link>

          <Link
            to="/aboutus"
            className={`mobile-nav-link ${
              isActive("/aboutus") ? "active" : ""
            }`}
            onClick={closeMobileMenu}
          >
            <FaInfoCircle className="mobile-link-icon" />
            <span className="mobile-link-text">About Us</span>
            <FaChevronRight className="mobile-link-arrow" />
          </Link>

          <Link
            to="/insights-reports"
            className={`mobile-nav-link ${
              isActive("/insights-reports") ? "active" : ""
            }`}
            onClick={closeMobileMenu}
          >
            <FaLightbulb className="mobile-link-icon" />
            <span className="mobile-link-text">Insights</span>
            <FaChevronRight className="mobile-link-arrow" />
          </Link>

          <Link
            to="/careers"
            className={`mobile-nav-link ${
              isActive("/careers") ? "active" : ""
            }`}
            onClick={closeMobileMenu}
          >
            <FaUsers className="mobile-link-icon" />
            <span className="mobile-link-text">Careers</span>
            <FaChevronRight className="mobile-link-arrow" />
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;