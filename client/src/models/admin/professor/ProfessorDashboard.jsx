// src/models/admin/professor/ProfessorDashboard.jsx
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
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  RefreshCw,
  Camera,
  Search,
  Filter,
  FileText,
  Upload,
  Download,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  File,
  FolderOpen,
  GraduationCap,
  BookMarked,
  Hash,
  Layers,
  Clock,
  UserCircle,
  Building2
} from "lucide-react";
import axiosInstance from "../../../api/axios";

const ProfessorDashboard = () => {
  // State Management
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [papers, setPapers] = useState([]);
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState("students");

  // Paper Management State
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
  const [paperSearch, setPaperSearch] = useState("");
  const [paperFilter, setPaperFilter] = useState({
    branch: "",
    year: "",
    semester: ""
  });
  const [paperPagination, setPaperPagination] = useState({
    page: 1,
    total: 0,
    limit: 9
  });

  // Debounce timer ref
  const searchTimeout = useRef(null);
  const filterTimeout = useRef(null);

  // Helper function to convert semester number to display text
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

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch Profile and Students
  useEffect(() => {
    fetchProfile();
    fetchDepartmentStudents();
    fetchPapers();
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      if (filterTimeout.current) {
        clearTimeout(filterTimeout.current);
      }
    };
  }, []);

  // Fetch papers with current filters - Sirf limit pe depend karega
  const fetchPapers = useCallback(async (page = paperPagination.page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const params = new URLSearchParams({
        page: page,
        limit: paperPagination.limit
      });
      
      if (paperSearch) params.append("search", paperSearch);
      if (paperFilter.branch) params.append("branch", paperFilter.branch);
      if (paperFilter.year) params.append("year", paperFilter.year);
      if (paperFilter.semester) params.append("semester", paperFilter.semester);

      const response = await axiosInstance.get(`/papers?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPapers(response.data.papers);
        setPaperPagination(prev => ({
          ...prev,
          total: response.data.total,
          page: page
        }));
      }
    } catch (error) {
      console.error("Papers fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [paperPagination.limit]); // Sirf limit pe depend karega

  // Effect to fetch papers when search/filter/page changes
  useEffect(() => {
    if (activeTab === "papers") {
      fetchPapers(paperPagination.page);
    }
  }, [activeTab, paperPagination.page, paperSearch, paperFilter, fetchPapers]);

  // Debounced search handler
  const handlePaperSearch = (value) => {
    setPaperSearch(value);
    setPaperPagination(prev => ({ ...prev, page: 1 }));
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Set new timeout
    searchTimeout.current = setTimeout(() => {
      fetchPapers(1);
    }, 500);
  };

  // Debounced filter handler
  const handleFilterChange = (type, value) => {
    setPaperFilter(prev => ({ ...prev, [type]: value }));
    setPaperPagination(prev => ({ ...prev, page: 1 }));
    
    // Clear previous timeout
    if (filterTimeout.current) {
      clearTimeout(filterTimeout.current);
    }
    
    // Set new timeout
    filterTimeout.current = setTimeout(() => {
      fetchPapers(1);
    }, 300);
  };

  // Page change handler
  const handlePageChange = (newPage) => {
    setPaperPagination(prev => ({ ...prev, page: newPage }));
    fetchPapers(newPage);
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
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
        window.location.href = "/login";
      }
    }
  };

  const fetchDepartmentStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get("/users/department-students", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error("Students fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPaper = async () => {
    try {
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
      alert("Error uploading paper. Please try again.");
    }
  };

  const handleEditPaper = async () => {
    try {
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
      alert("Error updating paper. Please try again.");
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
        alert("Error deleting paper. Please try again.");
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
    }
  };

  // Student Action Handlers
  const handleGrantStudent = async (studentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.put(
        `/users/grant-student/${studentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        fetchDepartmentStudents();
      }
    } catch (error) {
      console.error("Grant student error:", error);
    }
  };

  const handleRejectStudent = async (studentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.put(
        `/users/reject-student/${studentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        fetchDepartmentStudents();
      }
    } catch (error) {
      console.error("Reject student error:", error);
    }
  };

  const handleUngrantStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to revoke access for this student?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.put(
          `/users/ungrant-student/${studentId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          fetchDepartmentStudents();
        }
      } catch (error) {
        console.error("Ungrant student error:", error);
      }
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
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Filter Students
  const getFilteredStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((student) => {
        if (filterStatus === "pending") return !student.granted;
        if (filterStatus === "approved") return student.granted === "approved";
        if (filterStatus === "rejected") return student.granted === "rejected";
        return true;
      });
    }

    return filtered;
  };

  // Statistics
  const stats = {
    total: students.length,
    approved: students.filter((s) => s.granted === "approved").length,
    pending: students.filter((s) => !s.granted).length,
    rejected: students.filter((s) => s.granted === "rejected").length,
    totalPapers: papers.length
  };

  if (loading) {
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
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-800">
                Professor Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("students")}
                className={`px-4 py-2 rounded-md transition-all ${
                  activeTab === "students"
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Students
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
        {activeTab === "profile" ? (
          /* Profile Section */
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
              <h2 className="text-2xl font-bold text-white">My Profile</h2>
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
              </div>

              {/* Profile Info */}
              <div className="max-w-2xl mx-auto">
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={editForm.department}
                        onChange={(e) =>
                          setEditForm({ ...editForm, department: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Department cannot be changed
                      </p>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={handleEditSubmit}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
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
                        <Users className="h-5 w-5 mr-3" />
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
        ) : activeTab === "papers" ? (
          /* Papers Section */
          <div className="space-y-6">
            {/* Header with Upload Button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Papers Repository</h2>
                <p className="text-gray-600">Manage and organize your department papers</p>
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Papers</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalPapers}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">This Year</p>
                    <p className="text-3xl font-bold text-green-600">
                      {papers.filter(p => p.year === new Date().getFullYear().toString()).length}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Subjects</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {new Set(papers.map(p => p.subjectCode)).size}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <BookMarked className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Downloads</p>
                    <p className="text-3xl font-bold text-orange-600">-</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Download className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search papers by subject, code, branch..."
                    value={paperSearch}
                    onChange={(e) => handlePaperSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={paperFilter.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Years</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                  <select
                    value={paperFilter.semester}
                    onChange={(e) => handleFilterChange('semester', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Semesters</option>
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
            </div>

            {/* Papers Grid */}
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                          {paper.subjectName}
                        </h3>
                        <p className="text-sm text-blue-600 font-medium">
                          {paper.subjectCode}
                        </p>
                      </div>
                      <FileText className="h-8 w-8 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{paper.branch}</span>
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
                        <UserCircle className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Uploaded by: {paper.uploadedBy?.name || "Unknown"}</span>
                      </div>
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
                      {paper.uploadedBy?._id === profile?._id && (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {papers.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No papers found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {paperSearch || paperFilter.year || paperFilter.semester
                      ? "Try adjusting your search or filters"
                      : "Upload your first paper to get started"}
                  </p>
                  <button
                    onClick={() => {
                      resetPaperForm();
                      setPaperForm(prev => ({ ...prev, branch: profile?.department }));
                      setShowUploadModal(true);
                    }}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Upload First Paper</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {paperPagination.total > paperPagination.limit && (
              <div className="flex justify-center items-center space-x-4 mt-6">
                <button
                  onClick={() => handlePageChange(paperPagination.page - 1)}
                  disabled={paperPagination.page === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {paperPagination.page} of {Math.ceil(paperPagination.total / paperPagination.limit)}
                </span>
                <button
                  onClick={() => handlePageChange(paperPagination.page + 1)}
                  disabled={paperPagination.page >= Math.ceil(paperPagination.total / paperPagination.limit)}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Students Section */
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.approved}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {stats.pending}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <RefreshCw className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">
                      {stats.rejected}
                    </p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Students</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredStudents().map((student) => (
                <div
                  key={student._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div
                    className={`h-2 ${
                      !student.granted
                        ? "bg-yellow-500"
                        : student.granted === "approved"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={
                          student.profileImageUrl
                            ? student.profileImageUrl.startsWith("http")
                              ? student.profileImageUrl
                              : `http://localhost:5000${student.profileImageUrl}`
                            : `https://ui-avatars.com/api/?name=${student.name}&background=random&size=64`
                        }
                        alt={student.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {student.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Year:</span>{" "}
                        {student.year || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Semester:</span>{" "}
                        {getSemesterDisplay(student.semester)}
                      </p>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 mr-2">
                          Status:
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            !student.granted
                              ? "bg-yellow-100 text-yellow-800"
                              : student.granted === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {!student.granted
                            ? "Pending"
                            : student.granted === "approved"
                            ? "Approved"
                            : "Rejected"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleGrantStudent(student._id)}
                        disabled={student.granted === "approved"}
                        className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                          student.granted === "approved"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        <UserCheck className="h-4 w-4 mx-auto mb-1" />
                        Grant
                      </button>
                      <button
                        onClick={() => handleRejectStudent(student._id)}
                        disabled={student.granted === "rejected"}
                        className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                          student.granted === "rejected"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        <UserX className="h-4 w-4 mx-auto mb-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleUngrantStudent(student._id)}
                        disabled={!student.granted}
                        className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                          !student.granted
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                        }`}
                      >
                        <XCircle className="h-4 w-4 mx-auto mb-1" />
                        Ungrant
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {getFilteredStudents().length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No students found
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || filterStatus !== "all"
                      ? "Try adjusting your search or filters"
                      : "No students have registered in your department yet"}
                  </p>
                </div>
              )}
            </div>
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
                    placeholder="e.g., Computer Science"
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
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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

export default ProfessorDashboard;