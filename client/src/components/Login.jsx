// src/models/common/Login.jsx
import React, { useState } from "react";
import axiosInstance from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import Navbar from "./Navbar";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await axiosInstance.post("/users/login", {
        email,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("userType", res.data.user.type);

        if (res.data.user.type === "Professor") {
          navigate("/professor-dashboard");
        } else if (res.data.user.type === "Student") {
          navigate("/student-Dashboard");
        }
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

        <div className="w-full max-w-md bg-white shadow-lg border rounded-xl p-6 sm:p-8">

          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Login to your account
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Enter your email and password
            </p>
          </div>

          {/* Error Message */}
          {message && (
            <div className="mb-4 text-red-600 text-sm text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>

              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <LogIn className="h-5 w-5" />
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Register */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:underline"
              >
                Register
              </Link>
            </p>

          </form>
        </div>

      </div>
    </>
  );
};

export default Login;