"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "@/lib/react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaImage,
  FaSave,
  FaTimes,
  FaSpinner,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaFileAlt,
  FaNewspaper,
  FaChartLine,
  FaBullhorn,
  FaCalendarAlt,
  FaTag,
  FaUser,
  FaCheckCircle,
  FaExclamationCircle,
  FaShieldAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdDashboard, MdRefresh } from "react-icons/md";
import './ContentManagement.css'

const ContentManagementPage = () => {
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    type: "Blog",
    sector: "General",
    title: "",
    text: "",
    date: new Date().toISOString().split("T")[0],
    status: "Published",
    author: "Abacus Spaces",
    tags: [],
    views: 0,
  });

  // Image file state
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    blogs: 0,
    reports: 0,
    updates: 0,
    news: 0,
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

  // Fetch contents
  useEffect(() => {
    fetchContents();
    fetchStats();
  }, [currentPage, typeFilter, sectorFilter, statusFilter]);

  // Filter contents based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = contents.filter(
        (content) =>
          content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          content.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          content.author.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredContents(filtered);
    } else {
      setFilteredContents(contents);
    }
  }, [searchTerm, contents]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 10,
        sort: "-date",
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(sectorFilter !== "all" && { sector: sectorFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      };

      const response = await api.get("/content", { params });

      if (response.data.success) {
        setContents(response.data.data);
        setFilteredContents(response.data.data);
        setTotalPages(response.data.pages);
        setTotalCount(response.data.total);
      }
    } catch (err) {
      console.error("Error fetching contents:", err);
      setError("Failed to load contents");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/content/stats/summary");
      if (response.data.success) {
        const data = response.data.data;
        setStats({
          total: data.totalContent,
          published: data.publishedContent,
          draft: data.draftContent,
          blogs: data.byType.find((t) => t._id === "Blog")?.count || 0,
          reports:
            data.byType.find((t) => t._id === "Research Report")?.count || 0,
          updates:
            data.byType.find((t) => t._id === "Industrial Update")?.count || 0,
          news: data.byType.find((t) => t._id === "News")?.count || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should not exceed 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
  };

  // Remove selected image
  const removeImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedFile(null);
    setImagePreviewUrl(null);
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("images", file);

      const response = await axios.post(
        `${API_BASE_URL}/images/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        },
      );
      console.log("---------------------------");
      console.log(response.data);
      console.log("Uploaded image URL:", response.data.data.urls);
      console.log(response.data.success && response.data.data.length > 0);

      if (response.data.success) {
        return response.data.data.urls;
      } else {
        throw new Error(response.data.message || "Failed to upload images");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      throw new Error(
        error.response?.data?.message || "Failed to upload images",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!formData.text.trim()) {
      alert("Please enter content text");
      return;
    }
    if (!selectedFile && !editingContent) {
      alert("Please upload an image");
      return;
    }

    setSaving(true);

    try {
      let imageUrl = null;

      // Upload new image if selected
      if (selectedFile) {
        imageUrl = await uploadImageToCloudinary(selectedFile);
      }

      const payload = {
        type: formData.type,
        sector: formData.sector,
        title: formData.title,
        text: formData.text,
        date: formData.date,
        status: formData.status,
        author: formData.author,
        views: formData.views,
        tags: formData.tags,
        ...(imageUrl && { imageUrl }),
      };

      if (editingContent) {
        // Update
        const response = await api.put(
          `/content/${editingContent._id}`,
          payload,
        );
        if (response.data.success) {
          alert("Content updated successfully!");
          resetForm();
          fetchContents();
          fetchStats();
        }
      } else {
        // Create
        const response = await api.post("/content", payload);
        if (response.data.success) {
          alert("Content created successfully!");
          resetForm();
          fetchContents();
          fetchStats();
        }
      }
    } catch (err) {
      console.error("Error saving content:", err);
      alert(
        err.response?.data?.message || err.message || "Failed to save content",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    setFormData({
      type: content.type,
      sector: content.sector,
      title: content.title,
      text: content.text,
      date: new Date(content.date).toISOString().split("T")[0],
      status: content.status,
      author: content.author,
      views: content.views || 0,
      tags: content.tags || [],
    });
    setImagePreviewUrl(content.image.url);
    setSelectedFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) {
      return;
    }

    try {
      const response = await api.delete(`/content/${id}`);
      if (response.data.success) {
        alert("Content deleted successfully!");
        fetchContents();
        fetchStats();
      }
    } catch (err) {
      console.error("Error deleting content:", err);
      alert("Failed to delete content");
    }
  };

  const resetForm = () => {
    setFormData({
      type: "Blog",
      sector: "General",
      title: "",
      text: "",
      date: new Date().toISOString().split("T")[0],
      status: "Published",
      author: "Abacus Spaces",
      tags: [],
      views: 0,
    });
    setEditingContent(null);
    setShowForm(false);
    removeImage();
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    navigate("/admin");
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Blog":
        return <FaFileAlt />;
      case "Research Report":
        return <FaChartLine />;
      case "Industrial Update":
        return <FaBullhorn />;
      case "News":
        return <FaNewspaper />;
      default:
        return <FaFileAlt />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Published: "cmp-status-published",
      Draft: "cmp-status-draft",
      Archived: "cmp-status-archived",
    };
    return badges[status] || "cmp-status-draft";
  };

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && selectedFile) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, []);

  return (
    <div className="cmp-content-management-page">
      {/* Header */}
      <div className="cmp-content-page-header">
        <div className="cmp-content-header-container">
          <div className="cmp-content-header-left">
            <FaShieldAlt className="cmp-admin-icon" />
            <div>
              <h1>Content Management</h1>
              <p>Manage your blogs, reports, and updates</p>
            </div>
          </div>
          <div className="cmp-content-header-actions">
            <button
              className="cmp-header-btn"
              onClick={() => navigate("/admin")}
            >
              <MdDashboard /> Dashboard
            </button>
            <button
              className="cmp-header-btn"
              onClick={() => navigate("/admin/leads")}
            >
              <FaUser /> Leads
            </button>
            <button
              className="cmp-header-btn cmp-logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="cmp-content-management">
        {/* Statistics */}
        <div className="cmp-content-stats">
          <div className="cmp-stat-card cmp-stat-total">
            <div className="cmp-stat-icon">
              <FaFileAlt />
            </div>
            <div className="cmp-stat-info">
              <h3>{stats.total}</h3>
              <p>Total Content</p>
            </div>
          </div>
          <div className="cmp-stat-card cmp-stat-published">
            <div className="cmp-stat-icon">
              <FaCheckCircle />
            </div>
            <div className="cmp-stat-info">
              <h3>{stats.published}</h3>
              <p>Published</p>
            </div>
          </div>
          <div className="cmp-stat-card cmp-stat-draft">
            <div className="cmp-stat-icon">
              <FaExclamationCircle />
            </div>
            <div className="cmp-stat-info">
              <h3>{stats.draft}</h3>
              <p>Drafts</p>
            </div>
          </div>
          <div className="cmp-stat-card cmp-stat-blogs">
            <div className="cmp-stat-icon">
              <FaFileAlt />
            </div>
            <div className="cmp-stat-info">
              <h3>{stats.blogs}</h3>
              <p>Blogs</p>
            </div>
          </div>
          <div className="cmp-stat-card cmp-stat-reports">
            <div className="cmp-stat-icon">
              <FaChartLine />
            </div>
            <div className="cmp-stat-info">
              <h3>{stats.reports}</h3>
              <p>Reports</p>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="cmp-content-controls">
          <div className="cmp-content-filters">
            <div className="cmp-search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <FaTimes
                  className="cmp-clear-search"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="cmp-filter-select"
            >
              <option value="all">All Types</option>
              <option value="Blog">Blog</option>
              <option value="Research Report">Research Report</option>
              <option value="Industrial Update">Industrial Update</option>
              <option value="News">News</option>
            </select>

            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="cmp-filter-select"
            >
              <option value="all">All Sectors</option>
              <option value="Retail">Retail</option>
              <option value="Office Space">Office Space</option>
              <option value="BTS">BTS</option>
              <option value="Managed Office Setup">Managed Office Setup</option>
              <option value="Hospitality">Hospitality</option>
              <option value="Healthcare">Healthcare</option>
              <option value="General">General</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cmp-filter-select"
            >
              <option value="all">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>

            <button className="cmp-refresh-button" onClick={fetchContents}>
              <MdRefresh /> Refresh
            </button>
          </div>

          <button
            className="cmp-add-content-button"
            onClick={() => setShowForm(true)}
          >
            <FaPlus /> Create Content
          </button>
        </div>

        {/* Content Form Modal */}
        {showForm && (
          <div className="cmp-content-modal-overlay">
            <div className="cmp-content-modal">
              <div className="cmp-modal-header">
                <h2>
                  {editingContent ? (
                    <>
                      <FaEdit /> Edit Content
                    </>
                  ) : (
                    <>
                      <FaPlus /> Create New Content
                    </>
                  )}
                </h2>
                <button className="cmp-close-modal" onClick={resetForm}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="cmp-content-form">
                <div className="cmp-form-row">
                  <div className="cmp-form-group">
                    <label>
                      Content Type <span className="cmp-required">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      required
                    >
                      <option value="Blog">Blog</option>
                      <option value="Research Report">Research Report</option>
                      <option value="Industrial Update">
                        Industrial Update
                      </option>
                      <option value="News">News</option>
                    </select>
                  </div>

                  <div className="cmp-form-group">
                    <label>
                      Sector <span className="cmp-required">*</span>
                    </label>
                    <select
                      value={formData.sector}
                      onChange={(e) =>
                        setFormData({ ...formData, sector: e.target.value })
                      }
                      required
                    >
                      <option value="General">General</option>
                      <option value="Retail">Retail</option>
                      <option value="Office Space">Office Space</option>
                      <option value="BTS">BTS</option>
                      <option value="Managed Office Setup">
                        Managed Office Setup
                      </option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Healthcare">Healthcare</option>
                    </select>
                  </div>
                </div>

                <div className="cmp-form-row">
                  <div className="cmp-form-group">
                    <label>
                      Status <span className="cmp-required">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      required
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div className="cmp-form-group">
                    <label>
                      Date <span className="cmp-required">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="cmp-form-group">
                  <label>
                    Title <span className="cmp-required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter content title..."
                    maxLength="200"
                    required
                  />
                  <small>{formData.title.length}/200 characters</small>
                </div>

                <div className="cmp-form-group">
                  <label>
                    Content <span className="cmp-required">*</span>
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    placeholder="Enter content text..."
                    rows="10"
                    maxLength="50000"
                    required
                  />
                  <small>{formData.text.length}/50000 characters</small>
                </div>

                <div className="cmp-form-group">
                  <label>Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    placeholder="Author name..."
                  />
                </div>
                <div className="cmp-form-group">
                  <label>Initial Views</label>
                  <input
                    type="number"
                    value={formData.views}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        views: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter initial views count..."
                    min="0"
                  />
                  <small>
                    Leave as 0 or set initial view count for this content
                  </small>
                </div>

                <div className="cmp-form-group">
                  <label>
                    Featured Image{" "}
                    {!editingContent && <span className="cmp-required">*</span>}
                  </label>
                  <div className="cmp-image-upload-area">
                    {imagePreviewUrl ? (
                      <div className="cmp-image-preview-container">
                        <img
                          src={imagePreviewUrl}
                          alt="Preview"
                          className="cmp-image-preview"
                        />
                        <button
                          type="button"
                          className="cmp-remove-image"
                          onClick={removeImage}
                        >
                          <FaTimes /> Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cmp-upload-label">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          style={{ display: "none" }}
                        />
                        <FaImage />
                        <span>Click to upload image</span>
                        <small>Max size: 5MB (JPG, PNG, GIF, WEBP)</small>
                      </label>
                    )}
                  </div>
                </div>

                <div className="cmp-form-actions">
                  <button
                    type="button"
                    className="cmp-cancel-button"
                    onClick={resetForm}
                    disabled={saving || uploadingImage}
                  >
                    <FaTimes /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="cmp-save-button"
                    disabled={saving || uploadingImage}
                  >
                    {saving || uploadingImage ? (
                      <>
                        <FaSpinner className="cmp-spinner" />{" "}
                        {uploadingImage ? "Uploading..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <FaSave />{" "}
                        {editingContent ? "Update Content" : "Create Content"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content List */}
        <div className="cmp-content-list-container">
          {loading ? (
            <div className="cmp-loading-state">
              <FaSpinner className="cmp-spinner" />
              <p>Loading contents...</p>
            </div>
          ) : error ? (
            <div className="cmp-error-state">
              <p>{error}</p>
              <button onClick={fetchContents}>Try Again</button>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="cmp-empty-state">
              <FaFileAlt />
              <h3>No Content Found</h3>
              <p>
                {searchTerm
                  ? "Try adjusting your search or filters"
                  : "Create your first content to get started"}
              </p>
              {!searchTerm && (
                <button onClick={() => setShowForm(true)}>
                  <FaPlus /> Create Content
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="cmp-content-grid">
                {filteredContents.map((content) => (
                  <div key={content._id} className="cmp-content-card">
                    <div className="cmp-content-card-image">
                      <img src={content.image.url} alt={content.title} />
                      <span
                        className={`cmp-status-badge ${getStatusBadge(
                          content.status,
                        )}`}
                      >
                        {content.status}
                      </span>
                    </div>

                    <div className="cmp-content-card-body">
                      <div className="cmp-content-card-meta">
                        <span className="cmp-content-type">
                          {getTypeIcon(content.type)} {content.type}
                        </span>
                        <span className="cmp-content-sector">
                          <FaTag /> {content.sector}
                        </span>
                      </div>

                      <h3 className="cmp-content-card-title">
                        {content.title}
                      </h3>

                      <p className="cmp-content-card-excerpt">
                        {content.text.substring(0, 150)}
                        {content.text.length > 150 && "..."}
                      </p>

                      <div className="cmp-content-card-footer">
                        <div className="cmp-content-info">
                          <span>
                            <FaUser /> {content.author}
                          </span>
                          <span>
                            <FaCalendarAlt />{" "}
                            {new Date(content.date).toLocaleDateString()}
                          </span>
                          <span>
                            <FaEye /> {content.views} views
                          </span>
                        </div>

                        <div className="cmp-content-actions">
                          <button
                            className="cmp-edit-btn"
                            onClick={() => handleEdit(content)}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="cmp-delete-btn"
                            onClick={() => handleDelete(content._id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="cmp-pagination">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="cmp-page-button"
                  >
                    <FaChevronLeft /> Previous
                  </button>

                  <div className="cmp-page-info">
                    Page {currentPage} of {totalPages} ({totalCount} total)
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="cmp-page-button"
                  >
                    Next <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManagementPage;
