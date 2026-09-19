"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "@/lib/react-router-dom";
import {
  FaSearch,
  FaDownload,
  FaEye,
  FaEdit,
  FaEnvelope,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaBell,
  FaFileAlt,
  FaChartLine,
  FaUserCheck,
  FaUserTimes,
  FaExclamationCircle,
  FaList,
  FaTrash,
} from "react-icons/fa";
import { MdDashboard, MdRefresh, MdEmail } from "react-icons/md";
import "./SubscriptionManagement.css"; // Import the CSS file for styling

const SubscriptionsManagement = ({ onNavigateBack }) => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0,
    bounced: 0,
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
    if (authStatus !== "true") {
      navigate("/admin");
    }
  }, [navigate]);

  // Fetch subscriptions with filters
  const fetchSubscriptions = async (
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

      const response = await api.get("/subscriptions/list", { params });

      if (response.data.success) {
        setSubscriptions(response.data.data);
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setError(
        error.response?.data?.message || "Failed to fetch subscriptions",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await api.get("/subscriptions/statistics");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  // Update subscription
  const updateSubscriptionStatus = async (subscriptionId, updateData) => {
    try {
      setUpdating(true);
      const response = await api.put(
        `/subscriptions/${subscriptionId}`,
        updateData,
      );

      if (response.data.success) {
        await fetchSubscriptions(
          currentPage,
          searchTerm,
          sourceFilter,
          statusFilter,
        );
        await fetchStatistics();
        setEditingSubscription(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating subscription:", error);
      setError(
        error.response?.data?.message || "Failed to update subscription",
      );
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Delete subscription
  const deleteSubscription = async (subscriptionId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this subscription? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setDeleting(subscriptionId);
      const response = await api.delete(`/subscriptions/${subscriptionId}`);

      if (response.data.success) {
        await fetchSubscriptions(
          currentPage,
          searchTerm,
          sourceFilter,
          statusFilter,
        );
        await fetchStatistics();
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);
      setError(
        error.response?.data?.message || "Failed to delete subscription",
      );
    } finally {
      setDeleting(null);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchSubscriptions(1, value, sourceFilter, statusFilter);
  };

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    if (type === "source") {
      setSourceFilter(value);
      fetchSubscriptions(1, searchTerm, value, statusFilter);
    } else if (type === "status") {
      setStatusFilter(value);
      fetchSubscriptions(1, searchTerm, sourceFilter, value);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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
      active: {
        color: "#10b981",
        bg: "#d1fae5",
        icon: FaCheckCircle,
        label: "Active",
      },
      unsubscribed: {
        color: "#ef4444",
        bg: "#fee2e2",
        icon: FaUserTimes,
        label: "Unsubscribed",
      },
      bounced: {
        color: "#f59e0b",
        bg: "#fef3c7",
        icon: FaExclamationCircle,
        label: "Bounced",
      },
    };

    const config = statusConfig[status] || statusConfig.active;
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
      footer: { color: "#23c6a4", icon: MdEmail, label: "Footer" },
      popup: { color: "#6366f1", icon: FaBell, label: "Popup" },
      homepage: { color: "#8b5cf6", icon: FaFileAlt, label: "Homepage" },
      direct: { color: "#f59e0b", icon: FaUserCheck, label: "Direct" },
    };

    const config = sourceConfig[source] || sourceConfig.footer;
    const Icon = config.icon;

    return (
      <span className="source-badge" style={{ color: config.color }}>
        <Icon className="source-icon" />
        {config.label}
      </span>
    );
  };

  // Export subscriptions to CSV
  const exportToCSV = async () => {
    try {
      const response = await api.get("/subscriptions/export", {
        responseType: "blob",
        params: {
          ...(sourceFilter !== "all" && { source: sourceFilter }),
          ...(statusFilter !== "all" && { status: statusFilter }),
        },
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscriptions_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting subscriptions:", error);
      setError("Failed to export subscriptions");
    }
  };

  // Initial load
  useEffect(() => {
    fetchSubscriptions();
    fetchStatistics();
  }, []);

  if (loading && subscriptions.length === 0) {
    return (
      <div className="subscriptions-loading">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
        </div>
        <p>Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="sbm-subscriptions-management">
      {/* Header */}
      <div className="subscriptions-header">
        <div className="header-left">
          <div className="header-title">
            <h1>
              <MdEmail className="header-icon" />
              Subscriptions Management
            </h1>
            <p>Manage and track all email subscriptions</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={() => {
              fetchSubscriptions(
                currentPage,
                searchTerm,
                sourceFilter,
                statusFilter,
              );
              fetchStatistics();
            }}
          >
            <MdRefresh />
            Refresh
          </button>
          <button
            className="export-btn"
            onClick={exportToCSV}
            disabled={subscriptions.length === 0}
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
            <FaList />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Subscriptions</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
        </div>
        <div className="stat-card unsubscribed">
          <div className="stat-icon">
            <FaUserTimes />
          </div>
          <div className="stat-content">
            <h3>{stats.unsubscribed}</h3>
            <p>Unsubscribed</p>
          </div>
        </div>
        <div className="stat-card bounced">
          <div className="stat-icon">
            <FaExclamationCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.bounced}</h3>
            <p>Bounced</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="subscriptions-filters">
        <div className="search-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by email..."
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
              <option value="footer">Footer</option>
              <option value="popup">Popup</option>
              <option value="homepage">Homepage</option>
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
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="bounced">Bounced</option>
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

      {/* Subscriptions Table */}
      <div className="subscriptions-table-container">
        <table className="subscriptions-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Source</th>
              <th>Status</th>
              <th>Subscribed Date</th>
              <th>Last Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <tr key={subscription._id} className="subscription-row">
                <td className="email-cell">
                  <div className="email-info">
                    <FaEnvelope className="email-icon" />
                    <span>{subscription.email}</span>
                  </div>
                </td>
                <td className="source-cell">
                  {getSourceBadge(subscription.source)}
                </td>
                <td className="status-cell">
                  {getStatusBadge(subscription.status)}
                </td>
                <td className="date-cell">
                  <div className="date-info">
                    <FaCalendarAlt className="date-icon" />
                    <span>{formatDate(subscription.createdAt)}</span>
                  </div>
                </td>
                <td className="date-cell">
                  <div className="date-info">
                    <FaCalendarAlt className="date-icon" />
                    <span>
                      {formatDate(subscription.tracking?.lastEmailSent)}
                    </span>
                  </div>
                </td>
                <td className="sbm-actions-cell">
                  <div className="sbm-action-buttons">
                    <button
                      className="sbm-action-btn view-btn"
                      onClick={() => {
                        setSelectedSubscription(subscription);
                        setShowSubscriptionDetails(true);
                      }}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="sbm-action-btn edit-btn"
                      onClick={() => setEditingSubscription(subscription)}
                      title="Edit Status"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="sbm-action-btn delete-btn"
                      onClick={() => deleteSubscription(subscription._id)}
                      disabled={deleting === subscription._id}
                      title="Delete"
                    >
                      {deleting === subscription._id ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {subscriptions.length === 0 && !loading && (
          <div className="no-subscriptions">
            <div className="no-subscriptions-icon">
              <MdEmail />
            </div>
            <h3>No subscriptions found</h3>
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
              fetchSubscriptions(
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
              fetchSubscriptions(
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

      {/* Subscription Details Modal */}
      {showSubscriptionDetails && selectedSubscription && (
        <div className="sbm-modal-overlay">
          <div className="sbm-modal-container subscription-details-modal">
            <div className="sbm-modal-header">
              <h3>
                <MdEmail className="sbm-modal-icon" />
                Subscription Details
              </h3>
              <button
                className="close-btn"
                onClick={() => setShowSubscriptionDetails(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="sbm-modal-content">
              <div className="subscription-details-grid">
                <div className="sbm-detail-section">
                  <h4>Basic Information</h4>
                  <div className="sbm-detail-item">
                    <FaEnvelope className="sbm-detail-icon" />
                    <div>
                      <label>Email:</label>
                      <span>{selectedSubscription.email}</span>
                    </div>
                  </div>
                  <div className="sbm-detail-item">
                    <label>Source:</label>
                    {getSourceBadge(selectedSubscription.source)}
                  </div>
                  <div className="sbm-detail-item">
                    <label>Status:</label>
                    {getStatusBadge(selectedSubscription.status)}
                  </div>
                  <div className="sbm-detail-item">
                    <FaCalendarAlt className="sbm-detail-icon" />
                    <div>
                      <label>Subscribed:</label>
                      <span>{formatDate(selectedSubscription.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="sbm-detail-section">
                  <h4>Preferences</h4>
                  <div className="preferences-list">
                    <div className="preference-item">
                      {selectedSubscription.preferences?.newsletter ? (
                        <FaCheckCircle className="pref-icon active" />
                      ) : (
                        <FaTimesCircle className="pref-icon inactive" />
                      )}
                      <span>Newsletter</span>
                    </div>
                    <div className="preference-item">
                      {selectedSubscription.preferences?.propertyAlerts ? (
                        <FaCheckCircle className="pref-icon active" />
                      ) : (
                        <FaTimesCircle className="pref-icon inactive" />
                      )}
                      <span>Property Alerts</span>
                    </div>
                    <div className="preference-item">
                      {selectedSubscription.preferences?.marketReports ? (
                        <FaCheckCircle className="pref-icon active" />
                      ) : (
                        <FaTimesCircle className="pref-icon inactive" />
                      )}
                      <span>Market Reports</span>
                    </div>
                    <div className="preference-item">
                      {selectedSubscription.preferences?.promotions ? (
                        <FaCheckCircle className="pref-icon active" />
                      ) : (
                        <FaTimesCircle className="pref-icon inactive" />
                      )}
                      <span>Promotions</span>
                    </div>
                  </div>
                </div>

                <div className="sbm-detail-section">
                  <h4>Tracking</h4>
                  <div className="sbm-detail-item">
                    <FaCalendarAlt className="sbm-detail-icon" />
                    <div>
                      <label>Last Email Sent:</label>
                      <span>
                        {formatDate(
                          selectedSubscription.tracking?.lastEmailSent,
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="sbm-detail-item">
                    <FaChartLine className="sbm-detail-icon" />
                    <div>
                      <label>Emails Sent:</label>
                      <span>
                        {selectedSubscription.tracking?.emailsSent || 0}
                      </span>
                    </div>
                  </div>
                  {selectedSubscription.tracking?.unsubscribeDate && (
                    <div className="sbm-detail-item">
                      <FaCalendarAlt className="sbm-detail-icon" />
                      <div>
                        <label>Unsubscribed:</label>
                        <span>
                          {formatDate(
                            selectedSubscription.tracking.unsubscribeDate,
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {editingSubscription && (
        <div className="sbm-modal-overlay">
          <div className="sbm-modal-container edit-subscription-modal">
            <div className="sbm-modal-header">
              <h3>
                <FaEdit className="sbm-modal-icon" />
                Edit Subscription
              </h3>
              <button
                className="close-btn"
                onClick={() => setEditingSubscription(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="sbm-modal-content">
              <div className="edit-form">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editingSubscription.email}
                    disabled
                    className="disabled-input"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editingSubscription.status}
                    onChange={(e) =>
                      setEditingSubscription({
                        ...editingSubscription,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="unsubscribed">Unsubscribed</option>
                    <option value="bounced">Bounced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Preferences</label>
                  <div className="preferences-checkboxes">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={
                          editingSubscription.preferences?.newsletter || false
                        }
                        onChange={(e) =>
                          setEditingSubscription({
                            ...editingSubscription,
                            preferences: {
                              ...editingSubscription.preferences,
                              newsletter: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>Newsletter</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={
                          editingSubscription.preferences?.propertyAlerts ||
                          false
                        }
                        onChange={(e) =>
                          setEditingSubscription({
                            ...editingSubscription,
                            preferences: {
                              ...editingSubscription.preferences,
                              propertyAlerts: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>Property Alerts</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={
                          editingSubscription.preferences?.marketReports ||
                          false
                        }
                        onChange={(e) =>
                          setEditingSubscription({
                            ...editingSubscription,
                            preferences: {
                              ...editingSubscription.preferences,
                              marketReports: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>Market Reports</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={
                          editingSubscription.preferences?.promotions || false
                        }
                        onChange={(e) =>
                          setEditingSubscription({
                            ...editingSubscription,
                            preferences: {
                              ...editingSubscription.preferences,
                              promotions: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>Promotions</span>
                    </label>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => setEditingSubscription(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="save-btn"
                    onClick={() =>
                      updateSubscriptionStatus(editingSubscription._id, {
                        status: editingSubscription.status,
                        preferences: editingSubscription.preferences,
                      })
                    }
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <FaSpinner className="spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Save Changes
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

export default SubscriptionsManagement;
