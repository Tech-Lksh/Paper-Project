// src/models/student/StudentDashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  User,
  Mail,
  BookOpen,
  Calendar,
  Users,
  LogOut,
  Edit2,
  Save,
  X,
  Camera,
  GraduationCap,
  Building2,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
  Download,
  Trash2,
  Plus,
  FolderOpen,
  Clock,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Loader
} from "lucide-react";
import axiosInstance from "../../../api/axios";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  // Profile State
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    year: "",
    semester: "",
    department: ""
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Paper State
  const [papers, setPapers] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [paperForm, setPaperForm] = useState({
    subjectName: "",
    subjectCode: "",
    branch: "",
    year: "",
    semester: "",
    className: "",
    paperFile: null
  });
  const [paperPagination, setPaperPagination] = useState({
    page: 1,
    total: 0,
    limit: 6
  });
  const [activeTab, setActiveTab] = useState("profile"); // "profile" or "papers"

  // Search State (like Home.jsx)
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    branch: "",
    year: "",
    semester: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  // Debounce timer refs
  const searchTimeout = useRef(null);
  const filterTimeout = useRef(null);

  // Branch options as per schema
  const branchOptions = ["CSE", "MECH", "DS", "IOT", "ECE", "EEE", "CIVIL", "IT"];
  
  // Year options as per schema
  const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  
  // Semester options as per schema
  const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  // Helper functions
  const getSemesterDisplay = (semester) => {
    if (!semester && semester !== 0) return "Not specified";
    const semNum = parseInt(semester);
    switch(semNum) {
      case 1: return "1st Semester";
      case 2: return "2nd Semester";
      case 3: return "3rd Semester";
      case 4: return "4th Semester";
      case 5: return "5th Semester";
      case 6: return "6th Semester";
      case 7: return "7th Semester";
      case 8: return "8th Semester";
      default: return `${semester} Semester`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch Profile Function
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axiosInstance.get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setProfile(response.data.user);
        setEditForm({
          name: response.data.user.name || "",
          year: response.data.user.year || "",
          semester: response.data.user.semester ? response.data.user.semester.toString() : "",
          department: response.data.user.department || ""
        });
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userType");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch papers with search (like Home.jsx)
  const fetchPapers = useCallback(async (pageNum = paperPagination.page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Agar search ya filters hain toh search endpoint use karo
      if (searchTerm || filters.branch || filters.year || filters.semester) {
        const params = new URLSearchParams({
          page: pageNum,
          limit: paperPagination.limit
        });
        
        if (searchTerm) params.append("search", searchTerm);
        if (filters.branch) params.append("branch", filters.branch);
        if (filters.year) params.append("year", filters.year);
        if (filters.semester) params.append("semester", filters.semester);

        const response = await axiosInstance.get(`/papers/search?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setPapers(response.data.papers);
          setPaperPagination(prev => ({
            ...prev,
            total: response.data.total,
            page: response.data.page
          }));
        }
      } else {
        // Warna my-papers endpoint use karo
        const params = new URLSearchParams({
          page: pageNum,
          limit: paperPagination.limit
        });

        const response = await axiosInstance.get(`/papers/my-papers?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setPapers(response.data.papers);
          setPaperPagination(prev => ({
            ...prev,
            total: response.data.total
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching papers:", error);
    } finally {
      setLoading(false);
    }
  }, [paperPagination.limit, searchTerm, filters]);

  // Fetch Profile and Papers on mount
  useEffect(() => {
    fetchProfile();
    fetchPapers();
  }, []); // Removed fetchPapers from dependencies to avoid infinite loop

  // Effect for search/filter changes
  useEffect(() => {
    if (activeTab === "papers") {
      fetchPapers(1);
    }
  }, [searchTerm, filters, activeTab]); // Added activeTab to dependencies

  // Debounced search (like Home.jsx)
  const handleSearch = (value) => {
    setSearchTerm(value);
    setPaperPagination(prev => ({ ...prev, page: 1 }));

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      // fetchPapers will be called by useEffect
    }, 500);
  };

  // Handle filter change (like Home.jsx)
  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    setPaperPagination(prev => ({ ...prev, page: 1 }));

    if (filterTimeout.current) {
      clearTimeout(filterTimeout.current);
    }

    filterTimeout.current = setTimeout(() => {
      // fetchPapers will be called by useEffect
    }, 300);
  };

  // Clear filters (like Home.jsx)
  const clearFilters = () => {
    setSearchTerm("");
    setFilters({ branch: "", year: "", semester: "" });
    setPaperPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleUploadPaper = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      formData.append("subjectName", paperForm.subjectName);
      formData.append("subjectCode", paperForm.subjectCode);
      formData.append("branch", paperForm.branch || profile?.department);
      formData.append("year", paperForm.year);
      formData.append("semester", paperForm.semester);
      formData.append("className", paperForm.className);
      
      if (paperForm.paperFile) {
        formData.append("paperFile", paperForm.paperFile);
      }

      const response = await axiosInstance.post("/papers/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.success) {
        setShowUploadModal(false);
        resetPaperForm();
        fetchPapers();
        alert("Paper uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload paper error:", error);
      alert(error.response?.data?.message || "Error uploading paper");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPaper = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axiosInstance.put(`/papers/edit/${selectedPaper._id}`, {
        subjectName: paperForm.subjectName,
        subjectCode: paperForm.subjectCode,
        branch: paperForm.branch,
        year: paperForm.year,
        semester: paperForm.semester,
        className: paperForm.className
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setShowEditModal(false);
        setSelectedPaper(null);
        resetPaperForm();
        fetchPapers();
        alert("Paper updated successfully!");
      }
    } catch (error) {
      console.error("Edit paper error:", error);
      alert(error.response?.data?.message || "Error updating paper");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaper = async (paperId) => {
    if (window.confirm("Are you sure you want to delete this paper?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.delete(`/papers/${paperId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          fetchPapers();
          alert("Paper deleted successfully!");
        }
      } catch (error) {
        console.error("Delete paper error:", error);
        alert(error.response?.data?.message || "Error deleting paper");
      }
    }
  };

  const handleDownloadPaper = async (filename) => {
    try {
      const response = await axiosInstance.get(`/papers/download/${filename}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download error:", error);
      alert("Error downloading paper.");
    }
  };

  const resetPaperForm = () => {
    setPaperForm({
      subjectName: "",
      subjectCode: "",
      branch: profile?.department || "",
      year: "",
      semester: "",
      className: "",
      paperFile: null
    });
  };

  // Profile Update Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      formData.append("name", editForm.name);
      formData.append("year", editForm.year);
      formData.append("semester", parseInt(editForm.semester) || "");
      formData.append("department", editForm.department);
      
      if (profileImage) {
        formData.append("image", profileImage);
      }

      const response = await axiosInstance.put("/users/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.success) {
        setProfile(response.data.user);
        setEditMode(false);
        setProfileImage(null);
        setImagePreview(null);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        "/users/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userType");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userType");
      navigate("/login");
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-800">
                Student Dashboard
              </h1>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 rounded-md transition-all ${
                  activeTab === "profile"
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("papers")}
                className={`px-4 py-2 rounded-md transition-all ${
                  activeTab === "papers"
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Papers
              </button>
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Approval Status Banner */}
        {profile?.granted !== "approved" && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
              <p className="text-sm text-yellow-700">
                Your account is pending approval from your professor. You can still upload papers but they will be visible only after approval.
              </p>
            </div>
          </div>
        )}

        {activeTab === "profile" ? (
          /* Profile Section */
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
              <h2 className="text-2xl font-bold text-white">My Profile</h2>
              <p className="text-blue-100 mt-1">Manage your personal information</p>
            </div>

            <div className="p-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <img
                    src={
                      imagePreview ||
                      (profile?.profileImageUrl
                        ? profile.profileImageUrl.startsWith("http")
                          ? profile.profileImageUrl
                          : `http://localhost:5000${profile.profileImageUrl}`
                        : `https://ui-avatars.com/api/?name=${profile?.name}&background=random&size=128`)
                    }
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  {editMode && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
                
                {/* Approval Status Badge */}
                {profile?.granted === "approved" && (
                  <div className="mt-3 flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Approved</span>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="max-w-2xl mx-auto">
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year
                        </label>
                        <select
                          value={editForm.year}
                          onChange={(e) =>
                            setEditForm({ ...editForm, year: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Semester
                        </label>
                        <select
                          value={editForm.semester}
                          onChange={(e) =>
                            setEditForm({ ...editForm, semester: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Semester</option>
                          <option value="1">1st Semester</option>
                          <option value="2">2nd Semester</option>
                          <option value="3">3rd Semester</option>
                          <option value="4">4th Semester</option>
                          <option value="5">5th Semester</option>
                          <option value="6">6th Semester</option>
                          <option value="7">7th Semester</option>
                          <option value="8">8th Semester</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Department Field - DISABLED */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department <span className="text-gray-500 text-xs">(cannot be changed)</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.department}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={handleEditSubmit}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setProfileImage(null);
                          setImagePreview(null);
                          setEditForm({
                            name: profile?.name || "",
                            year: profile?.year || "",
                            semester: profile?.semester ? profile.semester.toString() : "",
                            department: profile?.department || ""
                          });
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center text-gray-600 mb-2">
                        <User className="h-5 w-5 mr-3" />
                        <span className="text-sm font-medium">Full Name</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 ml-8">
                        {profile?.name}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center text-gray-600 mb-2">
                        <Mail className="h-5 w-5 mr-3" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <p className="text-lg text-gray-900 ml-8">{profile?.email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center text-gray-600 mb-2">
                          <Calendar className="h-5 w-5 mr-3" />
                          <span className="text-sm font-medium">Year</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 ml-8">
                          {profile?.year || "Not specified"}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center text-gray-600 mb-2">
                          <BookOpen className="h-5 w-5 mr-3" />
                          <span className="text-sm font-medium">Semester</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 ml-8">
                          {getSemesterDisplay(profile?.semester)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center text-gray-600 mb-2">
                        <Building2 className="h-5 w-5 mr-3" />
                        <span className="text-sm font-medium">Department</span>
                      </div>
                      <p className="text-lg font-semibold text-blue-600 ml-8">
                        {profile?.department}
                      </p>
                    </div>

                    <button
                      onClick={() => setEditMode(true)}
                      className="w-full mt-4 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Papers Section */
          <div className="space-y-6">
            {/* Header with Upload Button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Papers Repository</h2>
                <p className="text-gray-600">Search and manage papers</p>
              </div>
              <button
                onClick={() => {
                  resetPaperForm();
                  setPaperForm(prev => ({ ...prev, branch: profile?.department }));
                  setShowUploadModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Paper</span>
              </button>
            </div>

            {/* Search and Filter Section - Like Home.jsx */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by subject, code, branch, year..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearFilters}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Filter Toggle Button (Mobile) */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </button>

                {/* Filters - Desktop */}
                <div className="hidden md:flex items-center space-x-3">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={filters.branch}
                    onChange={(e) => handleFilterChange('branch', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Branches</option>
                    {branchOptions.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Years</option>
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <select
                    value={filters.semester}
                    onChange={(e) => handleFilterChange('semester', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Semesters</option>
                    {semesterOptions.map(sem => (
                      <option key={sem} value={sem}>{getSemesterDisplay(sem)}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters Button */}
                {(searchTerm || filters.branch || filters.year || filters.semester) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Mobile Filters */}
              {showFilters && (
                <div className="mt-4 md:hidden space-y-3">
                  <select
                    value={filters.branch}
                    onChange={(e) => handleFilterChange('branch', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Branches</option>
                    {branchOptions.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Years</option>
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <select
                    value={filters.semester}
                    onChange={(e) => handleFilterChange('semester', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Semesters</option>
                    {semesterOptions.map(sem => (
                      <option key={sem} value={sem}>{getSemesterDisplay(sem)}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Results Info */}
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Showing {papers.length} of {paperPagination.total} papers
              </p>
              {loading && <Loader className="h-5 w-5 text-blue-600 animate-spin" />}
            </div>

            {/* Papers Grid */}
            {loading && papers.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <Loader className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            ) : papers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {papers.map((paper) => (
                    <div
                      key={paper._id}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                    >
                      <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                              {paper.subjectName}
                            </h3>
                            <p className="text-sm text-blue-600 font-medium flex items-center">
                              <BookMarked className="h-3 w-3 mr-1" />
                              {paper.subjectCode}
                            </p>
                          </div>
                          <FileText className="h-8 w-8 text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate">{paper.branch}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{paper.year} • {getSemesterDisplay(paper.semester)}</span>
                          </div>
                          {paper.className && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-2 text-gray-400" />
                              <span>Class: {paper.className}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{formatDate(paper.createdAt)}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleDownloadPaper(paper.paperFile)}
                            className="px-3 py-2 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex flex-col items-center"
                          >
                            <Download className="h-4 w-4 mb-1" />
                            Download
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPaper(paper);
                              setPaperForm({
                                subjectName: paper.subjectName,
                                subjectCode: paper.subjectCode,
                                branch: paper.branch,
                                year: paper.year,
                                semester: paper.semester.toString(),
                                className: paper.className || "",
                                paperFile: null
                              });
                              setShowEditModal(true);
                            }}
                            className="px-3 py-2 text-xs font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors flex flex-col items-center"
                          >
                            <Edit2 className="h-4 w-4 mb-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePaper(paper._id)}
                            className="px-3 py-2 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex flex-col items-center"
                          >
                            <Trash2 className="h-4 w-4 mb-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {paperPagination.total > paperPagination.limit && (
                  <div className="flex justify-center items-center space-x-4 mt-8">
                    <button
                      onClick={() => {
                        setPaperPagination(prev => ({ ...prev, page: prev.page - 1 }));
                        fetchPapers(paperPagination.page - 1);
                      }}
                      disabled={paperPagination.page === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {paperPagination.page} of {Math.ceil(paperPagination.total / paperPagination.limit)}
                    </span>
                    <button
                      onClick={() => {
                        setPaperPagination(prev => ({ ...prev, page: prev.page + 1 }));
                        fetchPapers(paperPagination.page + 1);
                      }}
                      disabled={paperPagination.page >= Math.ceil(paperPagination.total / paperPagination.limit)}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No papers found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filters.branch || filters.year || filters.semester
                    ? "Try adjusting your search or filters"
                    : "Upload your first paper to get started"}
                </p>
                {!searchTerm && !filters.branch && !filters.year && !filters.semester && (
                  <button
                    onClick={() => {
                      resetPaperForm();
                      setPaperForm(prev => ({ ...prev, branch: profile?.department }));
                      setShowUploadModal(true);
                    }}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Upload First Paper</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Paper Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Upload New Paper</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={paperForm.subjectName}
                  onChange={(e) => setPaperForm({ ...paperForm, subjectName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Data Structures"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={paperForm.subjectCode}
                  onChange={(e) => setPaperForm({ ...paperForm, subjectCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., CS301"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paperForm.branch}
                    onChange={(e) => setPaperForm({ ...paperForm, branch: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., CSE"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paperForm.year}
                    onChange={(e) => setPaperForm({ ...paperForm, year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paperForm.semester}
                    onChange={(e) => setPaperForm({ ...paperForm, semester: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Semester</option>
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                    <option value="3">3rd Semester</option>
                    <option value="4">4th Semester</option>
                    <option value="5">5th Semester</option>
                    <option value="6">6th Semester</option>
                    <option value="7">7th Semester</option>
                    <option value="8">8th Semester</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={paperForm.className}
                    onChange={(e) => setPaperForm({ ...paperForm, className: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., CS-A"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paper File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => setPaperForm({ ...paperForm, paperFile: e.target.files[0] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, PPT, PPTX
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleUploadPaper}
                  disabled={!paperForm.subjectName || !paperForm.subjectCode || !paperForm.branch || !paperForm.year || !paperForm.semester || !paperForm.paperFile}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload Paper
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Paper Modal */}
      {showEditModal && selectedPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Paper</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPaper(null);
                  resetPaperForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={paperForm.subjectName}
                  onChange={(e) => setPaperForm({ ...paperForm, subjectName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={paperForm.subjectCode}
                  onChange={(e) => setPaperForm({ ...paperForm, subjectCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={paperForm.branch}
                    onChange={(e) => setPaperForm({ ...paperForm, branch: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    value={paperForm.year}
                    onChange={(e) => setPaperForm({ ...paperForm, year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={paperForm.semester}
                    onChange={(e) => setPaperForm({ ...paperForm, semester: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Semester</option>
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                    <option value="3">3rd Semester</option>
                    <option value="4">4th Semester</option>
                    <option value="5">5th Semester</option>
                    <option value="6">6th Semester</option>
                    <option value="7">7th Semester</option>
                    <option value="8">8th Semester</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={paperForm.className}
                    onChange={(e) => setPaperForm({ ...paperForm, className: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleEditPaper}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Update Paper
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPaper(null);
                    resetPaperForm();
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Logout</h3>
              <p className="text-gray-600">
                Are you sure you want to logout from your account?
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;