// src/models/common/Home.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Filter,
  Download,
  FileText,
  BookOpen,
  Calendar,
  Users,
  GraduationCap,
  Building2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader,
  X,
  BookMarked,
  FolderOpen
} from "lucide-react";
import axiosInstance from "../../api/axios";
import Navbar from "../common/Navbar"

const Home = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    branch: "",
    year: "",
    semester: ""
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    limit: 12
  });
  const [showFilters, setShowFilters] = useState(false);

  // Debounce timer ref
  const searchTimeout = useRef(null);
  const filterTimeout = useRef(null);

  // Branch options as per schema
  const branchOptions = ["CSE", "MECH", "DS", "IOT", "ECE", "EEE", "CIVIL", "IT"];
  
  // Year options as per schema
  const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  
  // Semester options as per schema
  const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  // Fetch public papers
  const fetchPapers = useCallback(async (pageNum = pagination.page) => {
    try {
      setLoading(true);
      
      // Agar search ya filters hain toh search endpoint use karo
      if (searchTerm || filters.branch || filters.year || filters.semester) {
        const params = new URLSearchParams({
          page: pageNum,
          limit: pagination.limit
        });
        
        if (searchTerm) params.append("search", searchTerm);
        if (filters.branch) params.append("branch", filters.branch);
        if (filters.year) params.append("year", filters.year);
        if (filters.semester) params.append("semester", filters.semester);

        const response = await axiosInstance.get(`/papers/search?${params}`);
        
        if (response.data.success) {
          setPapers(response.data.papers);
          setPagination(prev => ({
            ...prev,
            total: response.data.total,
            page: response.data.page
          }));
        }
      } else {
        // Warna public papers endpoint use karo
        const params = new URLSearchParams({
          page: pageNum,
          limit: pagination.limit
        });
        
        const response = await axiosInstance.get(`/papers/public?${params}`);
        
        if (response.data.success) {
          setPapers(response.data.papers);
          setPagination(prev => ({
            ...prev,
            total: response.data.total,
            page: response.data.page
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching papers:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, searchTerm, filters]);

  // Initial fetch
  useEffect(() => {
    fetchPapers();
  }, []);

  // Effect for search/filter changes
  useEffect(() => {
    fetchPapers(1);
  }, [searchTerm, filters]);

  // Debounced search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      // fetchPapers already called by useEffect
    }, 500);
  };

  // Handle filter change
  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));

    if (filterTimeout.current) {
      clearTimeout(filterTimeout.current);
    }

    filterTimeout.current = setTimeout(() => {
      // fetchPapers already called by useEffect
    }, 300);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilters({ branch: "", year: "", semester: "" });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle paper download
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
      alert("Error downloading paper. Please try again.");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get semester display
  const getSemesterDisplay = (semester) => {
    if (!semester) return "N/A";
    const suffixes = ["th", "st", "nd", "rd"];
    const v = semester % 100;
    const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
    return `${semester}${suffix} Semester`;
  };

  return (
    <>
      <Navbar />
      {/* Added pt-16 to push content below navbar */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">
                Academic Papers Repository
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Access thousands of academic papers, question papers, and study materials from various departments and branches
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {searchTerm || filters.branch || filters.year || filters.semester ? 'Search Results' : 'Latest Papers'}
              </h2>
              <p className="text-gray-600">
                Showing {papers.length} of {pagination.total} papers
              </p>
            </div>
            {loading && <Loader className="h-5 w-5 text-blue-600 animate-spin" />}
          </div>

          {/* Papers Grid */}
          {loading && papers.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {papers.map((paper) => (
                <div
                  key={paper._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
                >
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
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

                    {/* Only Download Button - View Button Hata Diya */}
                    <button
                      onClick={() => handleDownloadPaper(paper.paperFile)}
                      className="w-full px-3 py-2 text-sm font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Paper</span>
                    </button>
                  </div>
                </div>
              ))}

              {papers.length === 0 && !loading && (
                <div className="col-span-full text-center py-16">
                  <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No papers found
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || filters.branch || filters.year || filters.semester
                      ? "Try adjusting your search or filters"
                      : "No papers have been uploaded yet"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination.total > pagination.limit && !loading && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                  fetchPapers(pagination.page - 1);
                }}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                  fetchPapers(pagination.page + 1);
                }}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;