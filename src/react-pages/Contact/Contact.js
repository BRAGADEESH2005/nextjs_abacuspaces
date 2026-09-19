"use client";
import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import {
  FaPhone,
  FaEnvelope,
  FaPaperPlane,
  FaTools,
  FaLaptopCode,
} from "react-icons/fa";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});
  // Get base URL from environment variables
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionName = entry.target.getAttribute("data-section");
            if (sectionName) {
              setTimeout(() => {
                setVisibleSections((prev) => ({
                  ...prev,
                  [sectionName]: true,
                }));
              }, 100);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    // Observe all sections
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/contact/submit`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        type: formData.subject.includes("Services") ? "services" : "tech",
      });

      if (response.data.success) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });

        setTimeout(() => {
          setSubmitStatus("");
        }, 3000);
      } else {
        setSubmitStatus("error");
        setTimeout(() => {
          setSubmitStatus("");
        }, 3000);
      }
    } catch (error) {
      console.error("Error:", error);
      setSubmitStatus("error");
      setTimeout(() => {
        setSubmitStatus("");
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnquireClick = (type) => {
    // Scroll to form and prefill subject
    const formSection = sectionRefs.current.form;
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth", block: "center" });
      setFormData((prev) => ({
        ...prev,
        subject:
          type === "services"
            ? "Services Inquiry"
            : "Technology Products Inquiry",
      }));
    }
  };

  const contactInfo = [
    {
      icon: <FaPhone />,
      title: "Phone",
      details: "+91 7339544927",
    },
    {
      icon: <FaEnvelope />,
      title: "Email",
      details: "info@abacuspaces.com",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Contact Abacus Spaces | Get in Touch</title>
        <meta
          name="description"
          content="Contact Abacus Spaces for your commercial real estate needs. We're here to help you find the perfect office or retail space."
        />
        <meta
          name="keywords"
          content="contact us, abacus spaces contact, real estate inquiry, office space inquiry"
        />
        <link rel="canonical" href="https://abacuspaces.com/contact" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Contact Abacus Spaces" />
        <meta
          property="og:description"
          content="Get in touch with our expert commercial real estate team"
        />
        <meta property="og:url" content="https://abacuspaces.com/contact" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact Us" />
        <meta name="twitter:description" content="Reach out to Abacus Spaces" />
      </Helmet>

      <div className="contact-page">
        {/* Hero Section with Background Image */}
        <div
          className="contact-hero"
          data-section="hero"
          ref={(el) => (sectionRefs.current.hero = el)}
        >
          <video
            className="contact-hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/contactus_vid.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="contact-hero-overlay"></div>
          <div className="contact-hero-content">
            <h1>Get in Touch</h1>
            <p>Have a question? Reach out to us</p>
          </div>
        </div>

        {/* CTA Boxes Section */}
        <div
          className={`cta-boxes-container ${
            visibleSections.ctaBoxes ? "visible" : ""
          }`}
          data-section="ctaBoxes"
          ref={(el) => (sectionRefs.current.ctaBoxes = el)}
        >
          <div className="contact-container">
            <div className="cta-boxes-grid">
              {/* Services Box */}
              <div
                className={`cta-box services-box ${
                  visibleSections.ctaBoxes ? "animate-box" : ""
                }`}
                style={{ animationDelay: "0.2s" }}
              >
                <div className="cta-icon">
                  <FaTools />
                </div>
                <h3>For Services</h3>
                <p className="cta-subtitle">We're here to help.</p>
                <p className="cta-description">
                  Contact us for Business Solutions.
                </p>
                <button
                  className="enquire-btn"
                  onClick={() => handleEnquireClick("services")}
                >
                  Enquire Now
                </button>
              </div>

              {/* Technology Box */}
              <div
                className={`cta-box tech-box ${
                  visibleSections.ctaBoxes ? "animate-box" : ""
                }`}
                style={{ animationDelay: "0.3s" }}
              >
                <div className="cta-icon">
                  <FaLaptopCode />
                </div>
                <h3>For TECH</h3>
                <p className="cta-subtitle">Ready to take the next step?</p>
                <p className="cta-description">
                  Reach out to us for Technology Products.
                </p>
                <button
                  className="enquire-btn"
                  onClick={() => handleEnquireClick("tech")}
                >
                  Enquire Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form and Info Section */}
        <div className="contact-container contact-main">
          <div className="contact-content">
            {/* Contact Form */}
            <div
              className={`contact-form-section ${
                visibleSections.form ? "visible" : ""
              }`}
              data-section="form"
              ref={(el) => (sectionRefs.current.form = el)}
            >
              <h2>Send us a Message</h2>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div
                    className={`form-group ${
                      visibleSections.form ? "animate" : ""
                    }`}
                    style={{ animationDelay: "0.3s" }}
                  >
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div
                    className={`form-group ${
                      visibleSections.form ? "animate" : ""
                    }`}
                    style={{ animationDelay: "0.4s" }}
                  >
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div
                    className={`form-group ${
                      visibleSections.form ? "animate" : ""
                    }`}
                    style={{ animationDelay: "0.5s" }}
                  >
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Your Phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div
                    className={`form-group ${
                      visibleSections.form ? "animate" : ""
                    }`}
                    style={{ animationDelay: "0.6s" }}
                  >
                    <input
                      type="text"
                      name="subject"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div
                  className={`form-group ${
                    visibleSections.form ? "animate" : ""
                  }`}
                  style={{ animationDelay: "0.7s" }}
                >
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    rows="5"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className={`submit-btn ${isSubmitting ? "submitting" : ""} ${
                    visibleSections.form ? "animate-btn" : ""
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="submit-spinner"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Send Message
                    </>
                  )}
                </button>

                {submitStatus === "success" && (
                  <div className="success-message animate-success">
                    ✓ Message sent successfully! We'll get back to you soon.
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="error-message-display">
                    ✗ Failed to send message. Please try again later.
                  </div>
                )}
              </form>
            </div>

            {/* Contact Info */}
            <div
              className={`contact-info-section ${
                visibleSections.info ? "visible" : ""
              }`}
              data-section="info"
              ref={(el) => (sectionRefs.current.info = el)}
            >
              <h2 className={visibleSections.info ? "animate-title" : ""}>
                Connect With Us
              </h2>

              <div className="contact-info-grid">
                {contactInfo.map((info, index) => (
                  <div
                    key={index}
                    className={`info-card ${
                      visibleSections.info ? "animate" : ""
                    }`}
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    <div className="info-icon">{info.icon}</div>
                    <div className="info-content">
                      <h3>{info.title}</h3>
                      <p>{info.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
