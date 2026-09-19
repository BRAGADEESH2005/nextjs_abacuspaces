"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import {
  FaBuilding,
  FaCity,
  FaArrowRight,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { MdLocationOn, MdBusiness } from "react-icons/md";
import { BsShop } from "react-icons/bs";
import "leaflet/dist/leaflet.css";
import "./RegionsMap.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const RegionsMap = () => {
  const [dataType, setDataType] = useState("rental"); // 'rental', 'supply', 'demand'
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placesInCity, setPlacesInCity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({});
  const sectionRef = useRef(null);

  // API configuration
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
  });

  // Fetch heatmap data
  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      let endpoint = "/heatmap";

      if (dataType === "rental") {
        endpoint = "/heatmap/type/rental";
      } else if (dataType === "supply" || dataType === "demand") {
        endpoint = "/heatmap/type/demand-supply";
      }

      const response = await api.get(endpoint);

      if (response.data.success) {
        const data = response.data.data;
        setHeatmapData(data);

        // Auto-select first place on load to show initial details
        if (data.length > 0) {
          handlePlaceClick(data[0]);
        } else {
          // Clear selection if no data
          setSelectedPlace(null);
          setPlacesInCity([]);
        }
      }
    } catch (error) {
      console.error("Error fetching heatmap data:", error);
      setHeatmapData([]);
      setSelectedPlace(null);
      setPlacesInCity([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, [dataType]);

  // Get places in same city
  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    const sameCityPlaces = heatmapData.filter(
      (item) =>
        item.cityName === place.cityName &&
        item._id !== place._id &&
        ((dataType === "rental" && item.type === "rental") ||
          ((dataType === "supply" || dataType === "demand") &&
            item.type === "demand_supply")),
    );
    setPlacesInCity(sameCityPlaces);
  };

  // Format value based on data type
  const formatValue = (place) => {
    if (dataType === "rental") {
      return `₹${(place.avgRent || 0).toLocaleString()}/sqft`;
    } else if (dataType === "supply") {
      return `${place.supply || "N/A"} million sqft`;
    } else if (dataType === "demand") {
      return `${place.demand || "N/A"} million sqft`;
    }
    return "N/A";
  };

  const getValueLabel = () => {
    if (dataType === "rental") return "Avg Rent";
    if (dataType === "supply") return "Supply";
    if (dataType === "demand") return "Demand";
    return "Value";
  };

  // Calculate total statistics
  const totalStats = {
    properties: heatmapData.length,
    offices: heatmapData.length,
    retail: heatmapData.length,
    cities: new Set(heatmapData.map((item) => item.cityName)).size,
  };

  // Create custom building icon for markers
  const createCustomIcon = (color) => {
    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background: ${color};
          width: 35px;
          height: 35px;
          border-radius: 50% 50% 50% 0;
          border: 3px solid white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          transform: rotate(-45deg);
          cursor: pointer;
        ">
          <span style="transform: rotate(45deg);">🏢</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 35],
    });
  };

  // Get heat intensity (0.1 to 1.0) based on value
  const getHeatmapIntensity = (place) => {
    let value = 0;

    if (dataType === "rental") {
      value = place.avgRent || 0;
    } else if (dataType === "supply") {
      value = place.supply || 0;
    } else if (dataType === "demand") {
      value = place.demand || 0;
    }

    if (value === 0 || value === null) {
      return 0.5; // Default to average
    }

    // Find min and max values in dataset for normalization
    let values = [];
    if (dataType === "rental") {
      values = heatmapData.map((p) => p.avgRent || 0).filter((v) => v > 0);
    } else {
      values = heatmapData
        .map((p) => (dataType === "supply" ? p.supply : p.demand) || 0)
        .filter((v) => v > 0);
    }

    if (values.length === 0) {
      return 0.5;
    }

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    // Normalize value to 0.1-1.0 range
    const normalizedValue = ((value - minValue) / range) * 0.9 + 0.1;
    return Math.min(1.0, Math.max(0.1, normalizedValue));
  };

  // Base Layer Component - Colors entire India with light color
  const BaseLayer = () => {
    const map = useMap();

    useEffect(() => {
      // Create a light blue rectangle covering entire India
      const indiaBounds = [
        [8.0, 68.0], // Southwest corner
        [35.0, 97.0], // Northeast corner
      ];

      const baseLayer = L.rectangle(indiaBounds, {
        color: "none",
        fillColor: "#ADD8E6", // Light blue
        fillOpacity: 0.15,
        weight: 0,
      }).addTo(map);

      return () => {
        map.removeLayer(baseLayer);
      };
    }, [map]);

    return null;
  };

  // Heat Layer Component - Colors the map regions
  const HeatLayer = () => {
    const map = useMap();

    useEffect(() => {
      if (heatmapData.length === 0) return;

      // Convert heatmap data to heat layer format [lat, lng, intensity]
      const heatData = heatmapData.map((place) => {
        const intensity = getHeatmapIntensity(place);
        return [place.latitude, place.longitude, intensity];
      });

      if (heatData.length === 0) return;

      // Create heat layer with custom gradient - subtle to keep map readable
      const heat = L.heatLayer(heatData, {
        radius: 50,
        blur: 30,
        maxZoom: 12,
        minOpacity: 0.3,
        gradient: {
          0.1: "#0D4F2F", // Level 1 - Extreme low
          0.2: "#1A7A4A", // Level 2 - Very low
          0.3: "#27AE60", // Level 3 - Low
          0.4: "#A8D440", // Level 4 - Moderate low
          0.5: "#F1C40F", // Level 5 - Average
          0.6: "#F39C12", // Level 6 - Moderate high
          0.7: "#E67E22", // Level 7 - Above average
          0.8: "#E74C3C", // Level 8 - High
          0.9: "#C0392B", // Level 9 - Very high
          1.0: "#7F0000", // Level 10 - Extreme high
        },
      }).addTo(map);

      return () => {
        map.removeLayer(heat);
      };
    }, [map, heatmapData, dataType]);

    return null;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            animateNumbers();
          }
        });
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animateNumbers = () => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      const progress = currentStep / steps;
      const easeProgress = easeOutCubic(progress);

      setAnimatedStats({
        properties: Math.floor(totalStats.properties * easeProgress),
        offices: Math.floor(totalStats.offices * easeProgress),
        retail: Math.floor(totalStats.retail * easeProgress),
        cities: Math.floor(totalStats.cities * easeProgress),
      });

      currentStep++;
      if (currentStep > steps) {
        clearInterval(interval);
        setAnimatedStats(totalStats);
      }
    }, stepDuration);
  };

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  return (
    <section className="regions-section" id="regions-section" ref={sectionRef}>
      <div className="regions-container">
        {/* Compact Header */}
        <div className={`regions-header ${isVisible ? "regions-visible" : ""}`}>
          <h1>Our presence across Southern India</h1>
          <p className="regions-header-description">
            This map highlights our office locations across Southern India.
          </p>
          <div className="regions-cities">
            {/* <p className="regions-cities-label">We are at</p> */}

            <ul className="regions-cities-list">
              <li>Bangalore</li>
              <li>Chennai</li>
              <li>Kochi</li>
              <li>Coimbatore</li>
              <li>Thiruvananthapuram</li>
            </ul>
          </div>
        </div>

        {/* Compact Stats
        <div
          className={`regions-stats-compact ${
            isVisible ? "regions-visible" : ""
          }`}
        >
          <div className="regions-stat-item">
            <div className="regions-stat-icon">
              <FaBuilding />
            </div>
            <div className="regions-stat-content">
              <span className="regions-stat-number">
                {animatedStats.properties || 0}+
              </span>
              <span className="regions-stat-label">Total Properties</span>
            </div>
          </div>

          <div className="regions-stat-item">
            <div className="regions-stat-icon">
              <MdBusiness />
            </div>
            <div className="regions-stat-content">
              <span className="regions-stat-number">
                {animatedStats.offices || 0}+
              </span>
              <span className="regions-stat-label">Listings</span>
            </div>
          </div>

          <div className="regions-stat-item">
            <div className="regions-stat-icon">
              <BsShop />
            </div>
            <div className="regions-stat-content">
              <span className="regions-stat-number">
                {animatedStats.retail || 0}+
              </span>
              <span className="regions-stat-label">Data Points</span>
            </div>
          </div>

          <div className="regions-stat-item">
            <div className="regions-stat-icon">
              <FaCity />
            </div>
            <div className="regions-stat-content">
              <span className="regions-stat-number">
                {animatedStats.cities || 0}
              </span>
              <span className="regions-stat-label">Cities</span>
            </div>
          </div>
        </div> */}

        {/* Data Type Filter */}
        <div
          className={`regions-filter-section ${
            isVisible ? "regions-visible" : ""
          }`}
        >
          {/* <h3>Select Data Type:</h3> */}
          <div className="regions-filter-buttons">
            <button
              className={`regions-filter-btn ${
                dataType === "rental" ? "regions-active" : ""
              }`}
              onClick={() => setDataType("rental")}
            >
              Rental
            </button>
            <button
              className={`regions-filter-btn ${
                dataType === "supply" ? "regions-active" : ""
              }`}
              onClick={() => setDataType("supply")}
            >
              Supply
            </button>
            <button
              className={`regions-filter-btn ${
                dataType === "demand" ? "regions-active" : ""
              }`}
              onClick={() => setDataType("demand")}
            >
              Demand
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`regions-main-content ${
            isVisible ? "regions-visible" : ""
          }`}
        >
          {/* Interactive Map */}
          <div className="regions-map-container">
            <div className="regions-map-header">
              <h3>Interactive Map ({heatmapData.length} locations)</h3>
            </div>

            {loading ? (
              <div className="regions-loading-state">Loading data...</div>
            ) : (
              <div className="regions-map-wrapper">
                <MapContainer
                  center={[12.5, 78]}
                  zoom={6}
                  className="regions-leaflet-map"
                  scrollWheelZoom={true}
                  attributionControl={false}
                  zoomControl={true}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution=""
                  />
                  <BaseLayer />
                  <HeatLayer />

                  {heatmapData.map(
                    (place) =>
                      place.latitude &&
                      place.longitude && (
                        <Marker
                          key={place._id}
                          position={[place.latitude, place.longitude]}
                          icon={createCustomIcon("#667eea")}
                          eventHandlers={{
                            click: () => handlePlaceClick(place),
                          }}
                        >
                          <Popup className="regions-custom-popup">
                            <div className="regions-popup-content">
                              <h4>{place.area}</h4>
                              <p>
                                {place.cityName}, {place.stateName}
                              </p>
                              <div className="regions-popup-price">
                                <strong>
                                  {getValueLabel()}: {formatValue(place)}
                                </strong>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ),
                  )}
                </MapContainer>
              </div>
            )}
          </div>

          {/* Place Details Panel */}
          <div className="regions-cards-container">
            {selectedPlace ? (
              <>
                {/* Selected Place Details */}
                <div className="regions-card-details">
                  <h3>{selectedPlace.area}</h3>
                  <p className="regions-card-location">
                    {selectedPlace.cityName}, {selectedPlace.stateName}
                  </p>

                  <div className="regions-card-info-box">
                    <p>
                      <strong>{getValueLabel()}:</strong>{" "}
                      {formatValue(selectedPlace)}
                    </p>
                    <p>
                      <strong>Year:</strong> {selectedPlace.year}
                    </p>
                    {selectedPlace.phoneNumber && (
                      <p className="regions-card-contact">
                        <FaPhone /> <strong>{selectedPlace.phoneNumber}</strong>
                      </p>
                    )}
                    {selectedPlace.email && (
                      <p className="regions-card-contact">
                        <FaEnvelope /> <strong>{selectedPlace.email}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Places in Same City */}
                {placesInCity.length > 0 && (
                  <div className="regions-other-properties">
                    <h4>Other Properties in {selectedPlace.cityName}</h4>
                    <div className="regions-cards-list">
                      {placesInCity.map((place) => (
                        <div
                          key={place._id}
                          className="regions-place-item"
                          onClick={() => handlePlaceClick(place)}
                        >
                          <p className="regions-place-name">{place.area}</p>
                          <p className="regions-place-stat">
                            {getValueLabel()}:{" "}
                            <strong>{formatValue(place)}</strong>
                          </p>
                          <p className="regions-place-stat">
                            Year: {place.year}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {placesInCity.length === 0 && (
                  <p className="regions-empty-state">
                    No other properties found in this city
                  </p>
                )}
              </>
            ) : (
              <div className="regions-placeholder-state">
                <p>Click on a marker on the map to see property details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegionsMap;
