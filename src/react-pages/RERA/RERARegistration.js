import React from "react";
import Link from "next/link";
import "./RERARegistration.css";

const RERARegistration = () => {
  return (
    <div className="rera-container">
      <div className="rera-content">
        <div className="rera-heading-with-logo">
          <h1>Legal Note on RERA Applicability</h1>
        </div>

        <p>
          At <strong>Abacus Spaces</strong>, we specialize in the leasing of
          commercial office and retail properties. We do not sell or develop
          properties and therefore,{" "}
          <strong>
            RERA registration is not applicable to our operations.
          </strong>
        </p>

        <hr />

        <h2>📜 What is RERA?</h2>

        <p>
          The{" "}
          <strong>
            Real Estate (Regulation and Development) Act, 2016 (RERA)
          </strong>{" "}
          was enacted to regulate real estate development and sale transactions.
          It aims to protect buyers, bring transparency, and monitor developers.
        </p>

        <ul>
          <li>
            <strong>Section 2(d):</strong> Defines "allottee" in the context of
            the sale of units (residential or commercial). Leasing is not
            included.
          </li>
          <li>
            <strong>Section 2(zn):</strong> Defines "real estate project" as a
            project intended for sale of plots, apartments, or buildings.
          </li>
          <li>
            <strong>Section 3:</strong> Requires registration only where a
            promoter intends to market, advertise, or sell real estate units.
          </li>
        </ul>

        <div className="rera-highlight">
          <p>
            <strong>
              Hence, standard leasing or renting is outside the scope of RERA.
            </strong>
          </p>
        </div>

        <h2>⚖️ Key Judicial & Regulatory Clarifications</h2>

        <ul>
          <li>
            <strong>
              Tamil Nadu RERA Appellate Tribunal – Marg Properties Case (2022):
            </strong>{" "}
            Stated that a long-term lease with an upfront lump sum payment was
            similar to a sale and required RERA compliance.
          </li>
          <li>
            <strong>Sale-like Long-Term Leases</strong> (e.g., 12+ years with
            upfront premium) → May fall under RERA, depending on state
            interpretation.
          </li>
        </ul>

        <p>
          Since we <strong>exclusively facilitate leasing</strong> of commercial
          spaces, Abacus Spaces is <strong>not required</strong> to hold a RERA
          registration number. This position is fully consistent with the Real
          Estate (Regulation and Development) Act, 2016 and relevant state
          rulings.
        </p>

        <h2>🔒 Transparency & Compliance</h2>

        <p>
          We maintain the{" "}
          <strong>highest standards of compliance and clarity</strong> in all
          our dealings. This note has been provided to assure our clients such
          as corporates, landlords, and tenants that our business model is in{" "}
          <strong>full legal alignment with RERA</strong> as of August 2025.
        </p>

        <div className="rera-disclaimer">
          <h3>⚖️ Disclaimer:</h3>
          <p>
            This note is intended for{" "}
            <strong>informational purposes only</strong> and does not constitute
            legal advice. For specific transactions involving long-term or
            complex lease structures,
            <strong>independent legal consultation is recommended.</strong>
          </p>
        </div>

        <hr />

        <div className="rera-navigation">
          <Link href="/">← Back to Home</Link>
          <span>|</span>
          <Link href="/contact">Contact Us</Link>
          <span>|</span>
          <Link href="/listings">Browse Listings</Link>
        </div>
      </div>
    </div>
  );
};

export default RERARegistration;
