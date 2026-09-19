"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "@/lib/react-router-dom";
import {
  FaSearch,
  FaDownload,
  FaEye,
  FaEdit,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaSave,
  FaSpinner,
  FaFileAlt,
  FaCalculator,
  FaUser,
  FaBriefcase,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { MdDashboard, MdRefresh } from "react-icons/md";
import './LeadsManagement.css'; // Import the CSS file for styling

const LeadsManagement = ({ onNavigateBack }) => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    closed_won: 0,
  });

  // API configuration
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

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
  useEffect(() => {
    const authStatus = sessionStorage.getItem("adminAuthenticated");

    // If NOT authenticated → redirect to /admin
    if (authStatus !== "true") {
      navigate("/admin");
    }
  }, [navigate]);

  // Fetch leads with filters
  const fetchLeads = async (
    page = 1,
    search = "",
    source = "all",
    status = "all",
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 20,
        ...(search && { search }),
        ...(source !== "all" && { source }),
        ...(status !== "all" && { status }),
      };

      const response = await api.get("/leads", { params });

      if (response.data.success) {
        setLeads(response.data.data);
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.pages);

        // Calculate stats
        calculateStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      setError(error.response?.data?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (leadsData) => {
    const stats = {
      total: leadsData.length,
      new: 0,
      contacted: 0,
      qualified: 0,
      closed_won: 0,
    };

    leadsData.forEach((lead) => {
      if (stats.hasOwnProperty(lead.status)) {
        stats[lead.status]++;
      }
    });

    setStats(stats);
  };

  // Update lead status
  const updateLeadStatus = async (leadId, updateData) => {
    try {
      setUpdating(true);
      const response = await api.put(`/leads/${leadId}`, updateData);

      if (response.data.success) {
        // Refresh leads list
        await fetchLeads(currentPage, searchTerm, sourceFilter, statusFilter);
        setEditingLead(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating lead:", error);
      setError(error.response?.data?.message || "Failed to update lead");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchLeads(1, value, sourceFilter, statusFilter);
  };

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    if (type === "source") {
      setSourceFilter(value);
      fetchLeads(1, searchTerm, value, statusFilter);
    } else if (type === "status") {
      setStatusFilter(value);
      fetchLeads(1, searchTerm, sourceFilter, value);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      new: {
        color: "#3b82f6",
        bg: "#dbeafe",
        icon: FaExclamationTriangle,
        label: "New",
      },
      contacted: {
        color: "#f59e0b",
        bg: "#fef3c7",
        icon: FaPhone,
        label: "Contacted",
      },
      qualified: {
        color: "#8b5cf6",
        bg: "#ede9fe",
        icon: FaCheckCircle,
        label: "Qualified",
      },
      proposal_sent: {
        color: "#06b6d4",
        bg: "#cffafe",
        icon: FaFileAlt,
        label: "Proposal Sent",
      },
      closed_won: {
        color: "#10b981",
        bg: "#d1fae5",
        icon: FaCheckCircle,
        label: "Closed Won",
      },
      closed_lost: {
        color: "#ef4444",
        bg: "#fee2e2",
        icon: FaTimesCircle,
        label: "Closed Lost",
      },
    };

    const config = statusConfig[status] || statusConfig.new;
    const Icon = config.icon;

    return (
      <span
        className="status-badge"
        style={{
          color: config.color,
          backgroundColor: config.bg,
          border: `1px solid ${config.color}20`,
        }}
      >
        <Icon className="status-icon" />
        {config.label}
      </span>
    );
  };

  // Get source badge
  const getSourceBadge = (source) => {
    const sourceConfig = {
      spacecalculator: {
        color: "#23c6a4",
        icon: FaCalculator,
        label: "Space Calculator",
      },
      propertyreport: {
        color: "#1a2f5c",
        icon: FaFileAlt,
        label: "Property Report",
      },
      contactform: {
        color: "#6366f1",
        icon: FaEnvelope,
        label: "Contact Form",
      },
      inquiry: { color: "#f59e0b", icon: FaPhone, label: "Inquiry" },
      direct: { color: "#8b5cf6", icon: FaUser, label: "Direct" },
    };

    const config = sourceConfig[source] || sourceConfig.inquiry;
    const Icon = config.icon;

    return (
      <span className="source-badge" style={{ color: config.color }}>
        <Icon className="source-icon" />
        {config.label}
      </span>
    );
  };

  // Export leads to CSV
  const exportToCSV = () => {
    const csvData = leads.map((lead) => ({
      Name: lead.name,
      Company: lead.company,
      Designation: lead.designation,
      Phone: lead.phone,
      Email: lead.email,
      Source: lead.source,
      Status: lead.status,
      "Total Area": lead.totalArea,
      "Created Date": formatDate(lead.createdAt),
      Notes: lead.notes || "",
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Initial load
  useEffect(() => {
    fetchLeads();
  }, []);

  if (loading && leads.length === 0) {
    return (
      <div className="leads-loading">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
        </div>
        <p>Loading leads...</p>
      </div>
    );
  }

  return (
    <div className="ldm-leads-management">
      {/* Header */}
      <div className="leads-header">
        <div className="header-left">
          <div className="header-title">
            <h1>
              <MdDashboard className="header-icon" />
              Leads Management
            </h1>
            <p>Manage and track all your business leads</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={() =>
              fetchLeads(currentPage, searchTerm, sourceFilter, statusFilter)
            }
          >
            <MdRefresh />
            Refresh
          </button>
          <button
            className="export-btn"
            onClick={exportToCSV}
            disabled={leads.length === 0}
          >
            <FaDownload />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <FaUser />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Leads</p>
          </div>
        </div>
        <div className="stat-card new">
          <div className="stat-icon">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <h3>{stats.new}</h3>
            <p>New Leads</p>
          </div>
        </div>
        <div className="stat-card contacted">
          <div className="stat-icon">
            <FaPhone />
          </div>
          <div className="stat-content">
            <h3>{stats.contacted}</h3>
            <p>Contacted</p>
          </div>
        </div>
        <div className="stat-card qualified">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.qualified}</h3>
            <p>Qualified</p>
          </div>
        </div>
        <div className="stat-card won">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.closed_won}</h3>
            <p>Closed Won</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="leads-filters">
        <div className="search-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, company, email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => handleSearch("")}>
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label>Source:</label>
            <select
              value={sourceFilter}
              onChange={(e) => handleFilterChange("source", e.target.value)}
            >
              <option value="all">All Sources</option>
              <option value="spacecalculator">Space Calculator</option>
              <option value="propertyreport">Property Report</option>
              <option value="contactform">Contact Form</option>
              <option value="inquiry">Inquiry</option>
              <option value="direct">Direct</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <FaExclamationTriangle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Leads Table */}
      <div className="leads-table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Lead Details</th>
              <th>Company</th>
              <th>Contact</th>
              <th>Source</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id} className="lead-row">
                <td className="lead-details">
                  <div className="lead-info">
                    <h4>{lead.name}</h4>
                    <p>{lead.designation}</p>
                    {lead.totalArea > 0 && (
                      <span className="area-badge">
                        {lead.totalArea.toLocaleString()} sq.ft
                      </span>
                    )}
                  </div>
                </td>
                <td className="company-cell">
                  <div className="company-info">
                    <FaBuilding className="company-icon" />
                    <span>{lead.company}</span>
                  </div>
                </td>
                <td className="contact-cell">
                  <div className="contact-info">
                    <div className="contact-item">
                      <FaPhone className="contact-icon" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="contact-item">
                      <FaEnvelope className="contact-icon" />
                      <span>{lead.email}</span>
                    </div>
                  </div>
                </td>
                <td className="source-cell">{getSourceBadge(lead.source)}</td>
                <td className="status-cell">{getStatusBadge(lead.status)}</td>
                <td className="date-cell">
                  <div className="date-info">
                    <FaCalendarAlt className="date-icon" />
                    <span>{formatDate(lead.createdAt)}</span>
                  </div>
                </td>
                <td className="ldm-actions-cell">
                  <div className="ldm-action-buttons">
                    <button
                      className="ldm-action-btn view-btn"
                      onClick={() => {
                        setSelectedLead(lead);
                        setShowLeadDetails(true);
                      }}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="ldm-action-btn edit-btn"
                      onClick={() => setEditingLead(lead)}
                      title="Edit Status"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {leads.length === 0 && !loading && (
          <div className="no-leads">
            <div className="no-leads-icon">
              <FaUser />
            </div>
            <h3>No leads found</h3>
            <p>Try adjusting your search criteria or check back later.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() =>
              fetchLeads(
                currentPage - 1,
                searchTerm,
                sourceFilter,
                statusFilter,
              )
            }
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
            Previous
          </button>

          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="page-btn"
            onClick={() =>
              fetchLeads(
                currentPage + 1,
                searchTerm,
                sourceFilter,
                statusFilter,
              )
            }
            disabled={currentPage === totalPages}
          >
            Next
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* Lead Details Modal */}
      {showLeadDetails && selectedLead && (
        <div className="ldm-modal-overlay">
          <div className="ldm-modal-container lead-details-modal">
            <div className="ldm-modal-header">
              <h3>
                <FaUser className="ldm-modal-icon" />
                Lead Details
              </h3>
              <button
                className="close-btn"
                onClick={() => setShowLeadDetails(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="ldm-modal-content">
              <div className="lead-details-grid">
                <div className="ldm-detail-section">
                  <h4>Personal Information</h4>
                  <div className="ldm-detail-item">
                    <FaUser className="ldm-detail-icon" />
                    <div>
                      <label>Name:</label>
                      <span>{selectedLead.name}</span>
                    </div>
                  </div>
                  <div className="ldm-detail-item">
                    <FaBriefcase className="ldm-detail-icon" />
                    <div>
                      <label>Designation:</label>
                      <span>{selectedLead.designation}</span>
                    </div>
                  </div>
                  <div className="ldm-detail-item">
                    <FaBuilding className="ldm-detail-icon" />
                    <div>
                      <label>Company:</label>
                      <span>{selectedLead.company}</span>
                    </div>
                  </div>
                  <div className="ldm-detail-item">
                    <FaPhone className="ldm-detail-icon" />
                    <div>
                      <label>Phone:</label>
                      <span>{selectedLead.phone}</span>
                    </div>
                  </div>
                  <div className="ldm-detail-item">
                    <FaEnvelope className="ldm-detail-icon" />
                    <div>
                      <label>Email:</label>
                      <span>{selectedLead.email}</span>
                    </div>
                  </div>
                </div>

                <div className="ldm-detail-section">
                  <h4>Lead Information</h4>
                  <div className="ldm-detail-item">
                    <label>Source:</label>
                    {getSourceBadge(selectedLead.source)}
                  </div>
                  <div className="ldm-detail-item">
                    <label>Status:</label>
                    {getStatusBadge(selectedLead.status)}
                  </div>
                  <div className="ldm-detail-item">
                    <FaCalendarAlt className="ldm-detail-icon" />
                    <div>
                      <label>Created:</label>
                      <span>{formatDate(selectedLead.createdAt)}</span>
                    </div>
                  </div>
                  {selectedLead.totalArea > 0 && (
                    <div className="ldm-detail-item">
                      <label>Total Area:</label>
                      <span className="ldm-area-highlight">
                        {selectedLead.totalArea.toLocaleString()} sq.ft
                      </span>
                    </div>
                  )}
                </div>

                {/* Space Requirements for Calculator leads */}
                {selectedLead.source === "spacecalculator" &&
                  selectedLead.spaceRequirements && (
                    <div className="ldm-detail-section full-width">
                      <h4>Space Requirements</h4>
                      <div className="space-requirements">
                        {selectedLead.spaceRequirements.workstations?.persons >
                          0 && (
                          <div className="space-item">
                            <span>Workstations:</span>
                            <span>
                              {
                                selectedLead.spaceRequirements.workstations
                                  .persons
                              }{" "}
                              persons (
                              {selectedLead.spaceRequirements.workstations.type}
                              )
                            </span>
                          </div>
                        )}
                        {selectedLead.spaceRequirements.cabins?.count > 0 && (
                          <div className="space-item">
                            <span>Cabins:</span>
                            <span>
                              {selectedLead.spaceRequirements.cabins.count}
                            </span>
                          </div>
                        )}
                        {selectedLead.spaceRequirements.reception?.count >
                          0 && (
                          <div className="space-item">
                            <span>Reception:</span>
                            <span>
                              {selectedLead.spaceRequirements.reception.count}
                            </span>
                          </div>
                        )}
                        {selectedLead.spaceRequirements.pantry?.count > 0 && (
                          <div className="space-item">
                            <span>Pantry:</span>
                            <span>
                              {selectedLead.spaceRequirements.pantry.count} (
                              {selectedLead.spaceRequirements.pantry.type})
                            </span>
                          </div>
                        )}
                        {selectedLead.spaceRequirements.conferenceRoom?.count >
                          0 && (
                          <div className="space-item">
                            <span>Conference Room:</span>
                            <span>
                              {
                                selectedLead.spaceRequirements.conferenceRoom
                                  .count
                              }{" "}
                              (
                              {
                                selectedLead.spaceRequirements.conferenceRoom
                                  .type
                              }
                              )
                            </span>
                          </div>
                        )}
                        {selectedLead.spaceRequirements.serverRoom?.count >
                          0 && (
                          <div className="space-item">
                            <span>Server Room:</span>
                            <span>
                              {selectedLead.spaceRequirements.serverRoom.count}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Property Details for Report leads */}
                {selectedLead.source === "propertyreport" &&
                  selectedLead.propertyDetails && (
                    <div className="ldm-detail-section full-width">
                      <h4>Requested Property</h4>
                      <div className="property-details">
                        <div className="property-header">
                          <h5>{selectedLead.propertyDetails.title}</h5>
                          <span className="property-code">
                            Code: {selectedLead.propertyDetails.propertyCode}
                          </span>
                        </div>
                        <div className="property-info">
                          <div className="property-item">
                            <FaMapMarkerAlt className="property-icon" />
                            <span>{selectedLead.propertyDetails.location}</span>
                          </div>
                          <div className="property-item">
                            <span>
                              Area: {selectedLead.propertyDetails.area}
                            </span>
                          </div>
                          <div className="property-item">
                            <span>
                              Price: {selectedLead.propertyDetails.price}
                            </span>
                          </div>
                          <div className="property-item">
                            <span>
                              Type: {selectedLead.propertyDetails.type}
                            </span>
                          </div>
                          {selectedLead.propertyDetails.features &&
                            selectedLead.propertyDetails.features.length >
                              0 && (
                              <div className="property-features">
                                <span>Features:</span>
                                <div className="features-list">
                                  {selectedLead.propertyDetails.features.map(
                                    (feature, index) => (
                                      <span key={index} className="feature-tag">
                                        {feature}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )}

                {selectedLead.notes && (
                  <div className="ldm-detail-section full-width">
                    <h4>Notes</h4>
                    <div className="notes-content">{selectedLead.notes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="ldm-modal-overlay">
          <div className="ldm-modal-container ldm-edit-lead-modal">
            <div className="ldm-modal-header">
              <h3>
                <FaEdit className="ldmmodal-icon" />
                Update Lead Status
              </h3>
              <button
                className="close-btn"
                onClick={() => setEditingLead(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="ldm-modal-content">
              <div className="edit-form">
                <div className="ldm-lead-summary">
                  <h4>{editingLead.name}</h4>
                  <p>
                    {editingLead.company} • {editingLead.designation}
                  </p>
                </div>

                <div className="ldm-form-group">
                  <label>Status:</label>
                  <select
                    value={editingLead.status}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, status: e.target.value })
                    }
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>

                <div className="ldm-form-group">
                  <label>Notes:</label>
                  <textarea
                    value={editingLead.notes || ""}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, notes: e.target.value })
                    }
                    placeholder="Add notes about this lead..."
                    rows={4}
                  />
                </div>

                <div className="ldm-form-group">
                  <label>Follow-up Date:</label>
                  <input
                    type="date"
                    value={
                      editingLead.followUpDate
                        ? new Date(editingLead.followUpDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        followUpDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setEditingLead(null)}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() =>
                      updateLeadStatus(editingLead._id, {
                        status: editingLead.status,
                        notes: editingLead.notes,
                        followUpDate: editingLead.followUpDate,
                      })
                    }
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <FaSpinner className="spinner" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Update Lead
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsManagement;
