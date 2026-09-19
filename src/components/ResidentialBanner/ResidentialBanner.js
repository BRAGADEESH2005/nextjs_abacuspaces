import React from "react";
import Link from "next/link";
import "./ResidentialBanner.css";

const ResidentialBanner = () => {
  return (
    <section className="residential-banner">
      <div className="residential-banner-overlay"></div>

      <div className="residential-banner-content">
        <h2 className="residential-banner-title">
          Discover managed Flex Spaces
        </h2>

        {/* <p className="residential-banner-subtitle">
          Discover our exclusive residential projects.
        </p> */}

        <Link
          href="/listings"
          className="residential-banner-btn"
          style={{ textDecoration: "none" }}
          aria-label="Browse Properties"
        >
          Browse Properties
        </Link>
      </div>
    </section>
  );
};

export default ResidentialBanner;
