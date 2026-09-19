"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "@/lib/react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaExclamationCircle,
  FaMapMarkerAlt,
  FaThermometerHalf,
  FaChartLine,
  FaCalendarAlt,
  FaDownload,
  FaFileAlt,
} from "react-icons/fa";
import { MdDashboard, MdRefresh } from "react-icons/md";

import './HeatmapManagement.css'

// State and City Data
const STATES_AND_CITIES = {
  "Andhra Pradesh": [
    "Hyderabad",
    "Visakhapatnam",
    "Vijayawada",
    "Nellore",
    "Tirupati",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Salem",
    "Trichy",
    "Kanchipuram",
  ],
  Karnataka: ["Bangalore", "Mysore", "Pune", "Mangalore", "Hubli", "Belgaum"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Ernakulam", "Thrissur"],
  Telangana: [
    "Hyderabad",
    "Warangal",
    "Nizamabad",
    "Khammam",
    "Kakinada",
    "Secunderabad",
  ],
  Maharashtra: [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Aurangabad",
    "Nashik",
    "Ahmednagar",
  ],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Meerut", "Noida"],
  Delhi: ["New Delhi", "Delhi"],
  Haryana: ["Gurgaon", "Faridabad", "Hisar", "Rohtak", "Panipat"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "West Bengal": ["Kolkata", "Asansol", "Siliguri", "Darjeeling", "Durgapur"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
  Punjab: ["Chandigarh", "Amritsar", "Ludhiana", "Jalandhar", "Mohali"],
  Uttarakhand: ["Dehradun", "Haridwar", "Udham Singh Nagar", "Nainital"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Leh", "Anantnag"],
  "Himachal Pradesh": ["Shimla", "Manali", "Kangra", "Solan", "Mandi"],
};

const SORTED_STATES = Object.keys(STATES_AND_CITIES).sort();

// Function to format numbers in Indian style (1,23,456 instead of 123,456)
const formatIndianCurrency = (num) => {
  if (!num && num !== 0) return "";

  const number = parseFloat(num).toString();
  const parts = number.split(".");
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? "." + parts[1] : "";

  // For Indian style: 1,23,456
  // If 3 digits or less, no comma needed
  if (integerPart.length <= 3) {
    return integerPart + decimalPart;
  }

  // Extract last 3 digits
  const lastThree = integerPart.substring(integerPart.length - 3);
  const remaining = integerPart.substring(0, integerPart.length - 3);

  // Add commas to remaining part every 2 digits from right
  const remainingWithCommas = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  return remainingWithCommas + "," + lastThree + decimalPart;
};

const HeatmapManagement = () => {
  const navigate = useNavigate();
  const [heatmaps, setHeatmaps] = useState([]);
  const [filteredHeatmaps, setFilteredHeatmaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHeatmap, setEditingHeatmap] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showCoordinatesModal, setShowCoordinatesModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [manualCoordinates, setManualCoordinates] = useState({
    latitude: "",
    longitude: "",
  });

  // Form data
  const [formData, setFormData] = useState({
    type: "rental",
    stateName: "",
    cityName: "",
    area: "",
    year: new Date().getFullYear(),
    leastRent: "",
    highestRent: "",
    avgRent: "",
    supply: "",
    demand: "",
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    rental: 0,
    demandSupply: 0,
  });

  // API configuration
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  const api =
    typeof window !== "undefined"
      ? axios.create({
          baseURL: API_BASE_URL,
          timeout: 30000,
          headers: {
            "Content-Type": "application/json",
          },
        })
      : null;

  // Check authentication
  useEffect(() => {
    const authStatus = sessionStorage.getItem("adminAuthenticated");
    if (authStatus !== "true") {
      navigate("/admin");
    }
  }, [navigate]);

  // Fetch heatmap data
  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = "/heatmap";
      const params = {};

      if (typeFilter !== "all") {
        params.type = typeFilter === "rental" ? "rental" : "demand_supply";
      }

      if (searchTerm) {
        params.stateName = searchTerm;
      }

      if (yearFilter !== "all") {
        params.year = yearFilter;
      }

      const response = await api.get(url, { params });

      if (response.data.success) {
        const allData = response.data.data;

        // Calculate pagination
        const paginated = allData.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage,
        );

        setHeatmaps(paginated);
        setFilteredHeatmaps(paginated);
        setTotalCount(allData.length);
        setTotalPages(Math.ceil(allData.length / itemsPerPage));

        // Calculate stats
        const rentalCount = allData.filter((h) => h.type === "rental").length;
        const dsCount = allData.filter(
          (h) => h.type === "demand_supply",
        ).length;

        setStats({
          total: allData.length,
          rental: rentalCount,
          demandSupply: dsCount,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, [typeFilter, yearFilter, searchTerm, currentPage]);

  // Auto-calculate average rent when least and highest rent change
  useEffect(() => {
    if (
      formData.type === "rental" &&
      formData.leastRent &&
      formData.highestRent
    ) {
      const leastRent = parseFloat(formData.leastRent);
      const highestRent = parseFloat(formData.highestRent);

      if (!isNaN(leastRent) && !isNaN(highestRent)) {
        const avgRent = ((leastRent + highestRent) / 2).toFixed(2);
        setFormData((prev) => ({
          ...prev,
          avgRent: parseFloat(avgRent),
        }));
      }
    }
  }, [formData.leastRent, formData.highestRent, formData.type]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" ? parseInt(value) : value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      type: "rental",
      stateName: "",
      cityName: "",
      area: "",
      year: new Date().getFullYear(),
      leastRent: "",
      highestRent: "",
      avgRent: "",
      supply: "",
      demand: "",
    });
    setEditingHeatmap(null);
    setShowForm(false);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.stateName.trim()) {
      alert("State Name is required");
      return false;
    }
    if (!formData.cityName.trim()) {
      alert("City Name is required");
      return false;
    }
    if (!formData.area.trim()) {
      alert("Area is required");
      return false;
    }
    if (!formData.year) {
      alert("Year is required");
      return false;
    }

    if (formData.type === "rental") {
      if (!formData.leastRent || !formData.highestRent || !formData.avgRent) {
        alert(
          "For rental type: Least Rent, Highest Rent, and Avg Rent are required",
        );
        return false;
      }
    }

    if (formData.type === "demand_supply") {
      if (!formData.supply || !formData.demand) {
        alert("For demand & supply type: Supply and Demand are required");
        return false;
      }
    }

    return true;
  };

  // Validate manual coordinates
  const validateCoordinates = () => {
    if (!manualCoordinates.latitude.trim()) {
      alert("Latitude is required");
      return false;
    }
    if (!manualCoordinates.longitude.trim()) {
      alert("Longitude is required");
      return false;
    }

    const lat = parseFloat(manualCoordinates.latitude);
    const lon = parseFloat(manualCoordinates.longitude);

    if (isNaN(lat) || isNaN(lon)) {
      alert("Please enter valid numeric values for latitude and longitude");
      return false;
    }

    if (lat < -90 || lat > 90) {
      alert("Latitude must be between -90 and 90");
      return false;
    }

    if (lon < -180 || lon > 180) {
      alert("Longitude must be between -180 and 180");
      return false;
    }

    return true;
  };

  // Handle manual coordinates submission
  const handleManualCoordinatesSubmit = () => {
    if (!validateCoordinates()) {
      return;
    }

    // Update pending form data with manual coordinates
    const updatedData = {
      ...pendingFormData,
      latitude: parseFloat(manualCoordinates.latitude),
      longitude: parseFloat(manualCoordinates.longitude),
    };

    // Close modal and proceed with save
    setShowCoordinatesModal(false);
    setManualCoordinates({ latitude: "", longitude: "" });
    proceedWithSave(updatedData);
  };

  // Proceed with save using provided data
  const proceedWithSave = async (dataToSend) => {
    try {
      setSaving(true);
      setError(null);

      if (editingHeatmap) {
        await api.put(`/heatmap/${editingHeatmap._id}`, dataToSend);
      } else {
        await api.post("/heatmap", dataToSend);
      }

      resetForm();
      await fetchHeatmapData();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSaving(false);
    }
  };

  // Handle save
  // Fetch latitude and longitude from Nominatim API
  const fetchCoordinates = async (area, city, state) => {
    try {
      const place = `${area}, ${city}, ${state}, India`;
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`,
      );

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        };
      } else {
        console.warn("No coordinates found for location:", place);
        return { latitude: null, longitude: null };
      }
    } catch (err) {
      console.error("Error fetching coordinates:", err);
      return { latitude: null, longitude: null };
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Fetch coordinates from Nominatim API
      const coordinates = await fetchCoordinates(
        formData.area,
        formData.cityName,
        formData.stateName,
      );

      // Check if coordinates are null
      if (coordinates.latitude === null || coordinates.longitude === null) {
        // Show manual coordinates modal
        setSaving(false);
        const location = `${formData.area}, ${formData.cityName}, ${formData.stateName}`;
        alert(
          `Could not find coordinates for "${location}". Please enter them manually.`,
        );

        // Prepare pending data
        const pendingData = {
          type: formData.type,
          stateName: formData.stateName,
          cityName: formData.cityName,
          area: formData.area,
          year: formData.year,
          latitude: null,
          longitude: null,
        };

        if (formData.type === "rental") {
          pendingData.leastRent = parseFloat(formData.leastRent);
          pendingData.highestRent = parseFloat(formData.highestRent);
          pendingData.avgRent = parseFloat(formData.avgRent);
        } else {
          pendingData.supply = parseFloat(formData.supply);
          pendingData.demand = parseFloat(formData.demand);
        }

        setPendingFormData(pendingData);
        setManualCoordinates({ latitude: "", longitude: "" });
        setShowCoordinatesModal(true);
        return;
      }

      // Coordinates found - proceed with save
      const dataToSend = {
        type: formData.type,
        stateName: formData.stateName,
        cityName: formData.cityName,
        area: formData.area,
        year: formData.year,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      };

      if (formData.type === "rental") {
        dataToSend.leastRent = parseFloat(formData.leastRent);
        dataToSend.highestRent = parseFloat(formData.highestRent);
        dataToSend.avgRent = parseFloat(formData.avgRent);
      } else {
        dataToSend.supply = parseFloat(formData.supply);
        dataToSend.demand = parseFloat(formData.demand);
      }

      await proceedWithSave(dataToSend);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSaving(false);
    }
  };

  // Handle edit
  const handleEdit = (heatmap) => {
    setEditingHeatmap(heatmap);
    setFormData({
      type: heatmap.type,
      stateName: heatmap.stateName,
      cityName: heatmap.cityName,
      area: heatmap.area,
      year: heatmap.year,
      leastRent: heatmap.leastRent || "",
      highestRent: heatmap.highestRent || "",
      avgRent: heatmap.avgRent || "",
      supply: heatmap.supply || "",
      demand: heatmap.demand || "",
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        setDeleting(id);
        await api.delete(`/heatmap/${id}`);
        await fetchHeatmapData();
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setDeleting(null);
      }
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredHeatmaps.length === 0) {
      alert("No data to export");
      return;
    }

    const headers =
      formData.type === "rental"
        ? [
            "State Name",
            "City Name",
            "Area",
            "Year",
            "Least Rent",
            "Highest Rent",
            "Avg Rent",
          ]
        : ["State Name", "City Name", "Area", "Year", "Supply", "Demand"];

    const rows = filteredHeatmaps.map((h) =>
      formData.type === "rental"
        ? [
            h.stateName,
            h.cityName,
            h.area,
            h.year,
            formatIndianCurrency(h.leastRent),
            formatIndianCurrency(h.highestRent),
            formatIndianCurrency(h.avgRent),
          ]
        : [h.stateName, h.cityName, h.area, h.year, h.supply, h.demand],
    );

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `heatmap_${new Date().getTime()}.csv`;
    a.click();
  };

  return (
    <div className="heatmap_management">
      {/* Manual Coordinates Modal */}
      {showCoordinatesModal && (
        <div className="heatmap_modal-overlay">
          <div className="heatmap_modal">
            <div className="heatmap_modal-header">
              <h3>Enter Manual Coordinates</h3>
              <button
                className="heatmap_modal-close"
                onClick={() => setShowCoordinatesModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="heatmap_modal-body">
              <p className="heatmap_modal-info">
                Could not automatically fetch coordinates. Please enter them
                manually for:
              </p>
              <p className="heatmap_modal-location">
                <strong>
                  {pendingFormData?.area}, {pendingFormData?.cityName},{" "}
                  {pendingFormData?.stateName}
                </strong>
              </p>

              <div className="heatmap_form-group">
                <label>Latitude *</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="e.g., 13.0827"
                  value={manualCoordinates.latitude}
                  onChange={(e) =>
                    setManualCoordinates((prev) => ({
                      ...prev,
                      latitude: e.target.value,
                    }))
                  }
                  className="heatmap_input"
                />
                <small>Range: -90 to 90</small>
              </div>

              <div className="heatmap_form-group">
                <label>Longitude *</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="e.g., 80.2707"
                  value={manualCoordinates.longitude}
                  onChange={(e) =>
                    setManualCoordinates((prev) => ({
                      ...prev,
                      longitude: e.target.value,
                    }))
                  }
                  className="heatmap_input"
                />
                <small>Range: -180 to 180</small>
              </div>

              <div className="heatmap_modal-tip">
                <FaMapMarkerAlt /> You can find coordinates on Google Maps,
                OpenStreetMap, or search online
              </div>
            </div>
            <div className="heatmap_modal-footer">
              <button
                className="heatmap_btn heatmap_btn-secondary"
                onClick={() => setShowCoordinatesModal(false)}
              >
                Cancel
              </button>
              <button
                className="heatmap_btn heatmap_btn-success"
                onClick={handleManualCoordinatesSubmit}
              >
                <FaCheckCircle /> Save with Manual Coordinates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="heatmap_header">
        <div className="heatmap_header-left">
          <div className="heatmap_header-title">
            <h1>
              <FaThermometerHalf className="heatmap_header-icon" /> Heatmap Data
              Management
            </h1>
            <p>Manage rental and demand/supply heatmap data</p>
          </div>
        </div>
        <div className="heatmap_header-actions">
          <button
            className="heatmap_btn heatmap_btn-secondary"
            onClick={() => fetchHeatmapData()}
          >
            <MdRefresh /> Refresh
          </button>
          <button
            className="heatmap_btn heatmap_btn-success"
            onClick={() => setShowForm(!showForm)}
          >
            <FaPlus /> Add New
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="heatmap_stats-container">
        <div className="heatmap_stat-card">
          <div className="heatmap_stat-icon heatmap_total">
            <FaFileAlt />
          </div>
          <div className="heatmap_stat-content">
            <p>Total Records</p>
            <h3>{stats.total}</h3>
          </div>
        </div>
        <div className="heatmap_stat-card">
          <div className="heatmap_stat-icon heatmap_rental">
            <FaChartLine />
          </div>
          <div className="heatmap_stat-content">
            <p>Rental Data</p>
            <h3>{stats.rental}</h3>
          </div>
        </div>
        <div className="heatmap_stat-card">
          <div className="heatmap_stat-icon heatmap_demand">
            <FaThermometerHalf />
          </div>
          <div className="heatmap_stat-content">
            <p>Demand & Supply</p>
            <h3>{stats.demandSupply}</h3>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="heatmap_alert heatmap_alert-error">
          <FaExclamationCircle /> {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="heatmap_form-container">
          <div className="heatmap_form-header">
            <h2>
              {editingHeatmap ? "Edit Heatmap Data" : "Add New Heatmap Data"}
            </h2>
            <button className="heatmap_close-btn" onClick={resetForm}>
              <FaTimes />
            </button>
          </div>

          <div className="heatmap_form-body">
            {/* Type Selection */}
            <div className="heatmap_form-group">
              <label>Data Type *</label>
              <div className="heatmap_type-selector">
                <label className="heatmap_radio-label">
                  <input
                    type="radio"
                    name="type"
                    value="rental"
                    checked={formData.type === "rental"}
                    onChange={handleInputChange}
                  />
                  <span>Rental</span>
                </label>
                <label className="heatmap_radio-label">
                  <input
                    type="radio"
                    name="type"
                    value="demand_supply"
                    checked={formData.type === "demand_supply"}
                    onChange={handleInputChange}
                  />
                  <span>Demand & Supply</span>
                </label>
              </div>
            </div>

            {/* Common Fields */}
            <div className="heatmap_form-row">
              <div className="heatmap_form-group">
                <label>State Name *</label>
                <select
                  name="stateName"
                  value={formData.stateName}
                  onChange={(e) => {
                    handleInputChange(e);
                    setFormData((prev) => ({
                      ...prev,
                      cityName: "",
                    }));
                  }}
                  className="heatmap_form-select"
                >
                  <option value="">Select a state</option>
                  {SORTED_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div className="heatmap_form-group">
                <label>City Name *</label>
                <select
                  name="cityName"
                  value={formData.cityName}
                  onChange={handleInputChange}
                  className="heatmap_form-select"
                  disabled={!formData.stateName}
                >
                  <option value="">
                    {formData.stateName
                      ? "Select a city"
                      : "Select state first"}
                  </option>
                  {formData.stateName &&
                    STATES_AND_CITIES[formData.stateName]?.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="heatmap_form-row">
              <div className="heatmap_form-group">
                <label>Area Name*</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Enter area"
                />
              </div>
              <div className="heatmap_form-group">
                <label>Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="Enter year"
                />
              </div>
            </div>

            {/* Rental Fields */}
            {formData.type === "rental" && (
              <>
                <div className="heatmap_form-row">
                  <div className="heatmap_form-group">
                    <label>Least Rent (in INR) *</label>
                    <input
                      type="number"
                      name="leastRent"
                      value={formData.leastRent}
                      onChange={handleInputChange}
                      placeholder="Enter least rent"
                    />
                  </div>
                  <div className="heatmap_form-group">
                    <label>Highest Rent (in INR)*</label>
                    <input
                      type="number"
                      name="highestRent"
                      value={formData.highestRent}
                      onChange={handleInputChange}
                      placeholder="Enter highest rent"
                    />
                  </div>
                </div>
                <div className="heatmap_form-row">
                  <div className="heatmap_form-group">
                    <label>
                      Average Rent (in INR) *{" "}
                      <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        (Auto-calculated)
                      </span>
                    </label>
                    <input
                      type="number"
                      name="avgRent"
                      value={formData.avgRent}
                      onChange={handleInputChange}
                      placeholder="Automatically calculated"
                      readOnly
                      style={{
                        backgroundColor: "#f8fafc",
                        color: "#64748b",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Demand & Supply Fields */}
            {formData.type === "demand_supply" && (
              <div className="heatmap_form-row">
                <div className="heatmap_form-group">
                  <label>Supply *</label>
                  <input
                    type="number"
                    name="supply"
                    value={formData.supply}
                    onChange={handleInputChange}
                    placeholder="Enter supply"
                  />
                </div>
                <div className="heatmap_form-group">
                  <label>Demand *</label>
                  <input
                    type="number"
                    name="demand"
                    value={formData.demand}
                    onChange={handleInputChange}
                    placeholder="Enter demand"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="heatmap_form-footer">
            <button
              className="heatmap_btn heatmap_btn-secondary"
              onClick={resetForm}
            >
              <FaTimes /> Cancel
            </button>
            <button
              className="heatmap_btn heatmap_btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <FaSpinner className="heatmap_spinner" /> : <FaSave />}
              {saving ? " Saving..." : " Save"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="heatmap_filters-container">
        <div className="heatmap_search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by state name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="heatmap_filter-group">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Types</option>
            <option value="rental">Rental</option>
            <option value="demand_supply">Demand & Supply</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Years</option>
            {[2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <button
            className="heatmap_btn heatmap_btn-secondary"
            onClick={exportToCSV}
          >
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="heatmap_loading-container">
          <FaSpinner className="heatmap_spinner" />
          <p>Loading heatmap data...</p>
        </div>
      ) : filteredHeatmaps.length === 0 ? (
        <div className="heatmap_no-data-container">
          <FaFileAlt />
          <p>No heatmap data found</p>
        </div>
      ) : (
        <>
          <div className="heatmap_table-container">
            <table className="heatmap_table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>State</th>
                  <th>City</th>
                  <th>Area</th>
                  <th>Year</th>
                  <th>Least Rent/Supply</th>
                  <th>Highest Rent/Demand</th>
                  <th>Avg Rent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHeatmaps.map((heatmap) => (
                  <tr key={heatmap._id}>
                    <td>
                      <span
                        className={`heatmap_badge heatmap_badge-${
                          heatmap.type === "rental" ? "rental" : "demand"
                        }`}
                      >
                        {heatmap.type === "rental"
                          ? "Rental"
                          : "Demand & Supply"}
                      </span>
                    </td>
                    <td>{heatmap.stateName}</td>
                    <td>{heatmap.cityName}</td>
                    <td>{heatmap.area}</td>
                    <td>{heatmap.year}</td>
                    {heatmap.type === "rental" ? (
                      <>
                        <td>₹{formatIndianCurrency(heatmap.leastRent)}</td>
                        <td>₹{formatIndianCurrency(heatmap.highestRent)}</td>
                        <td>₹{formatIndianCurrency(heatmap.avgRent)}</td>
                      </>
                    ) : (
                      <>
                        <td>{heatmap.supply}</td>
                        <td>{heatmap.demand}</td>
                        <td>nil</td>
                      </>
                    )}
                    <td className="heatmap_action-buttons">
                      <button
                        className="heatmap_btn heatmap_btn-sm heatmap_btn-primary"
                        onClick={() => handleEdit(heatmap)}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="heatmap_btn heatmap_btn-sm heatmap_btn-danger"
                        onClick={() => handleDelete(heatmap._id)}
                        disabled={deleting === heatmap._id}
                      >
                        {deleting === heatmap._id ? (
                          <FaSpinner className="heatmap_spinner" />
                        ) : (
                          <FaTrash />
                        )}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="heatmap_pagination-container">
              <button
                className="heatmap_btn heatmap_btn-secondary"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <FaChevronLeft /> Previous
              </button>
              <span className="heatmap_page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="heatmap_btn heatmap_btn-secondary"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HeatmapManagement;
