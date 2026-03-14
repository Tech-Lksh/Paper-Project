// src/models/common/Register.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Camera,
  Calendar,
  Layers,
  Building2,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";
import axios from "../api/axios";
import Navbar from "./Navbar";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    type: "Student",
    year: "1st Year",
    semester: 1,
    department: "CSE",
  });

  const [preview, setPreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (profileImage) {
        data.append("image", profileImage);
      }

      const res = await axios.post("/users/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message || "Registration successful");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen  bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="w-full mt-11 max-w-xl bg-white shadow-lg border rounded-xl p-6">
          {/* Heading */}
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 text-sm">Register to continue</p>
          </div>

          {message && (
            <div className="text-center text-red-600 text-sm mb-4">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Image */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border bg-gray-100 flex items-center justify-center overflow-hidden">
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-gray-400" />
                  )}
                </div>

                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700">
                  <Camera className="h-4 w-4" />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-2 md:grid-row-2 gap-1">
              {/* Name */}
              <div>
                <label className="text-sm text-gray-600">Name</label>

                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                  <input
                    type="text"
                    name="name"
                    required
                    onChange={handleChange}
                    placeholder="Full name"
                    className="w-full pl-9 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-gray-600">Email</label>

                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                  <input
                    type="email"
                    name="email"
                    required
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full pl-9 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Password</label>

                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full pl-9 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* User Type */}
              <div>
                <label className="text-sm text-gray-600">User Type</label>

                <select
                  name="type"
                  onChange={handleChange}
                  className="w-full mt-1 py-2.5 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Student">Student</option>
                  <option value="Professor">Professor</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="text-sm text-gray-600">Department</label>

                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                  <select
                    name="department"
                    onChange={handleChange}
                    className="w-full pl-9 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option>CSE</option>
                    <option>MECH</option>
                    <option>DS</option>
                    <option>IOT</option>
                    <option>ECE</option>
                    <option>EEE</option>
                    <option>CIVIL</option>
                    <option>IT</option>
                  </select>
                </div>
              </div>

              {/* Year */}
              <div>
                <label className="text-sm text-gray-600">Year</label>

                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                  <select
                    name="year"
                    onChange={handleChange}
                    className="w-full pl-9 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
              </div>

              {/* Semester */}
              <div>
                <label className="text-sm text-gray-600">Semester</label>

                <div className="relative mt-1">
                  <Layers className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                  <select
                    name="semester"
                    onChange={handleChange}
                    className="w-full pl-9 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
