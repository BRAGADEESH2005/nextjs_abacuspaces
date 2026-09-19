"use client";

import React from "react";
import { Link } from "@/lib/react-router-dom";
import { useEffect } from "react";
import "./PrivacyPolicy.css"; // Import the CSS file for styling

const PrivacyPolicy = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);
  return (
    <div className="privacy-policy">
      <div className="privacy-policy-container">
        <div className="privacy-heading-with-logo">
          <Link to="/">
            <img
              src="/logo_abacus.png"
              alt="Abacus Spaces Logo"
              className="privacy-logo"
            />
          </Link>
          <h1>Privacy Policy</h1>
        </div>
        <p className="last-updated">Last Updated: March 9, 2026</p>

        <section className="policy-section">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul>
            <li>Name, email address, and phone number</li>
            <li>Property preferences and search criteria</li>
            <li>Communication preferences</li>
            <li>Any other information you choose to provide</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Send you property listings and updates</li>
            <li>Respond to your comments and questions</li>
            <li>Send you technical notices and support messages</li>
            <li>Communicate with you about products, services, and events</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Information Sharing</h2>
          <p>
            We do not share your personal information with third parties except:
          </p>
          <ul>
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and property</li>
            <li>With service providers who assist our operations</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Data Security</h2>
          <p>
            We take reasonable measures to protect your information from
            unauthorized access, use, or disclosure. However, no internet
            transmission is completely secure, and we cannot guarantee absolute
            security.
          </p>
        </section>

        <section className="policy-section">
          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>6. Cookies</h2>
          <p>
            We use cookies and similar technologies to collect information about
            your browsing activities and improve your experience on our website.
          </p>
        </section>

        <section className="policy-section">
          <h2>7. Children's Privacy</h2>
          <p>
            Our services are not directed to children under 13. We do not
            knowingly collect personal information from children under 13.
          </p>
        </section>

        <section className="policy-section">
          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last Updated" date.
          </p>
        </section>

        <section className="policy-section">
          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us:
          </p>
          <ul>
            <li>Email: info@abacuspaces.com</li>
            <li>Phone: +91 7339544927</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
