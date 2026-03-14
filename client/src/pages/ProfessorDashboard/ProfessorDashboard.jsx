import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ProfessorProfile from "./ProfessorProfile";
import ProfessorGetPapers from "./ProfessorGetPapers";
import ProfessorUploadPapers from "./ProfessorUploadPapers";
import { Link } from "react-router-dom";
import ProfessorApproveStudents from "./ProfessorApproveStudents";

const ProfessorDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-blue-600 text-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link
            to="/professor-dashboard"
            className="text-xl font-semibold hover:text-gray-200 transition"
          >
            ProfessorDashboard
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <div className="pt-20 px-6">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <ProfessorProfile />
                <ProfessorGetPapers />
              </>
            }
          />

          <Route path="upload-paper" element={<ProfessorUploadPapers />} />
          <Route path="student-approve" element={<ProfessorApproveStudents />} />
        </Routes>
      </div>
    </div>
  );
};

export default ProfessorDashboard;
