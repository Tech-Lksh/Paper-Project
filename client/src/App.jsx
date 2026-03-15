// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProfessorDashboard from "./pages/ProfessorDashboard/ProfessorDashboard";
import StudentDashboard from "./pages/StudentDashboard/StudentDashboard"; // Student Dashboard import kiya
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import GetPapers from "./components/GetPapers";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/filter-download-papers" element={<GetPapers />} />
        <Route
          path="/professor-dashboard/*"
          element={
            <ProtectedRoute>
              <ProfessorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard/*"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
