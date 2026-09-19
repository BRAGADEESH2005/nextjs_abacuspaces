"use client";

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  FaBuilding,
  FaHandshake,
  FaLightbulb,
  FaUsers,
  FaClock,
  FaHeart,
  FaRocket,
} from "react-icons/fa";
import { MdBusiness, MdTrendingUp, MdSecurity } from "react-icons/md";
import './AboutUs.css'

const AboutUs = () => {
  const [visibleSections, setVisibleSections] = useState({});

  // Scroll to top when component mounts
 
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => ({
            ...prev,
            [entry.target.id]: true,
          }));
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll("[id]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const teamMembers = [
    {
      name: "Doss",
      role: "CEO & Founder",
      initial: "D",
    },
    {
      name: "Abhi",
      role: "Operations",
      initial: "A",
    },
    {
      name: "Praveena",
      role: "Creative Head",
      initial: "P",
    },
    {
      name: "Gokul",
      role: "Marketing Head",
      initial: "G",
    },
    {
      name: "Indhu",
      role: "Facility Head",
      initial: "I",
    },
    {
      name: "Bragadeesh",
      role: "Technical Head",
      initial: "B",
    },
  ];

  const values = [
    {
      icon: <FaClock />,
      title: "Beyond Time",
      description:
        "Ensuring every requirement is handled with urgency and precision.",
    },
    {
      icon: <FaRocket />,
      title: "Beyond Effort",
      description:
        "Ensuring we secure the most value-driven deals for our clients.",
    },
    {
      icon: <FaHeart />,
      title: "Beyond Relationships",
      description: "Building trust with stakeholders for lasting partnerships.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>About Abacus Spaces | Commercial Real Estate Experts</title>
        <meta
          name="description"
          content="Learn about Abacus Spaces - a leading commercial real estate consulting company specializing in office and retail space leasing across India."
        />
        <meta
          name="keywords"
          content="about abacus spaces, commercial real estate company, office space consultants, real estate experts"
        />
        <link rel="canonical" href="https://abacuspaces.com/aboutus" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About Abacus Spaces" />
        <meta
          property="og:description"
          content="Discover our commitment to excellence in commercial real estate"
        />
        <meta property="og:url" content="https://abacuspaces.com/aboutus" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="About Abacus Spaces" />
        <meta
          name="twitter:description"
          content="Commercial Real Estate Experts"
        />
      </Helmet>

      <div className="about-page">
        {/* Header Section */}
        <div
          id="header"
          className={`about-header ${visibleSections.header ? "visible" : ""}`}
        >
          <video className="about-header-video" autoPlay muted loop playsInline>
            <source src="/aboutus_vid.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="about-header-overlay"></div>
          <div className="about-container">
            <h1>About Abacus Spaces</h1>
            {/* <p>
            Commercial real estate consulting company, specializing exclusively
            into leasing office and retail spaces
          </p> */}
          </div>
        </div>

        <div className="about-container">
          <div className="about-content">
            {/* Story Section */}
            <section
              id="story"
              className={`story-section ${visibleSections.story ? "visible" : ""}`}
            >
              <div className="story-text">
                <h2>Who We Are</h2>
                <p>
                  Abacus Spaces is a commercial real estate Consulting Company,
                  specializing exclusively into Leasing Office and Retail
                  Spaces. We cater from startups seeking flexible workspaces to
                  large corporates expanding their regional footprint.
                </p>
                <p>
                  At Abacus Spaces, we believe that a space is more than four
                  walls, it is the foundation where ideas grow, teams connect,
                  and businesses thrive.
                </p>
                <p>
                  Our approach goes beyond brokerage where we act as
                  consultants, negotiators, and partners invested in your
                  long-term success.
                </p>
                <p>
                  We combine data-driven market Insights with
                  Relationship-driven execution to ensure every client receives
                  precise insights, transparent advice, and value-maximized
                  deals.
                </p>
              </div>
              <div className="story-image">
                <img
                  src="/aboutus_content.png"
                  alt="Modern office building representing Abacus Spaces"
                />
              </div>
            </section>

            {/* Goal Section */}
            <section
              id="goal"
              className={`goal-section ${visibleSections.goal ? "visible" : ""}`}
            >
              <div className="goal-content">
                <div className="goal-icon">
                  <MdBusiness />
                </div>
                <h2>Our Goal</h2>
                <p>Making every square foot of space count for Business.</p>
              </div>
            </section>

            {/* Values Section */}
            <section
              id="values"
              className={`values-section ${visibleSections.values ? "visible" : ""}`}
            >
              <h2>Our Team Goes Beyond</h2>
              <p>
                The strength of Abacus Spaces lies in its young, driven and
                collaborative team that believes excellence is not an act, but a
                habit.
              </p>
              <div className="values-grid">
                {values.map((value, index) => (
                  <div
                    key={index}
                    className={`value-card ${visibleSections.values ? "animate" : ""}`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="value-icon">{value.icon}</div>
                    <h3>{value.title}</h3>
                    <p>{value.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Philosophy Section */}
            <section
              id="philosophy"
              className={`philosophy-section ${visibleSections.philosophy ? "visible" : ""}`}
            >
              <div className="philosophy-content">
                <h2>Our Philosophy</h2>
                <div className="philosophy-text">
                  <p>
                    At Abacus Spaces, we don't just find spaces — we create
                    business possibilities.
                  </p>
                  <p>
                    In an industry built on transactions, we stand for
                    transformation.
                  </p>
                  <p>
                    And in every deal we close, we stand for people — our
                    clients, our partners, and our team.
                  </p>
                </div>
              </div>
            </section>

            {/* Team Section */}
            <section
              id="team"
              className={`team-section ${visibleSections.team ? "visible" : ""}`}
            >
              <h2>Meet Our Team</h2>
              <p>
                Our dedicated professionals bringing expertise and passion to
                every project
              </p>
              <div className="team-grid">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className={`team-card ${visibleSections.team ? "animate" : ""}`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="team-avatar">{member.initial}</div>
                    <h4>{member.name}</h4>
                    <div className="role">{member.role}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Mission Section */}
            <section
              id="mission"
              className={`mission-section ${visibleSections.mission ? "visible" : ""}`}
            >
              <div className="mission-content">
                <div className="mission-text">
                  <h2>Our Mission</h2>
                  <p>
                    To revolutionize the commercial real estate experience by
                    providing innovative, client-focused solutions that drive
                    business success and create lasting value for all
                    stakeholders.
                  </p>
                  <p>
                    We are committed to transparency, excellence, and building
                    long-term partnerships that help businesses find their
                    perfect space to grow and thrive.
                  </p>
                </div>
                <div className="mission-stats">
                  <div className="mission-stat">
                    <div className="mission-icon">
                      <FaBuilding />
                    </div>
                    <div>
                      <h3>Expert Consultation</h3>
                      <p>Professional guidance throughout your space journey</p>
                    </div>
                  </div>
                  <div className="mission-stat">
                    <div className="mission-icon">
                      <MdTrendingUp />
                    </div>
                    <div>
                      <h3>Market Intelligence</h3>
                      <p>Data-driven insights for informed decisions</p>
                    </div>
                  </div>
                  <div className="mission-stat">
                    <div className="mission-icon">
                      <FaHandshake />
                    </div>
                    <div>
                      <h3>Trusted Partnerships</h3>
                      <p>Long-term relationships built on trust and results</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
