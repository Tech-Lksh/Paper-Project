import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [image, setImage] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    year: "",
    semester: "",
  });

  const token = localStorage.getItem("token");

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const departments = ["CSE", "MECH", "DS", "IOT", "ECE", "EEE", "CIVIL", "IT"];

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.user;

      setUser(data);
      setFormData({
        name: data.name,
        department: data.department,
        year: data.year,
        semester: data.semester,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpdate = async () => {
    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("department", formData.department);
      data.append("year", formData.year);
      data.append("semester", formData.semester);

      if (image) {
        data.append("image", image);
      }

      await axios.put("http://localhost:5000/api/users/profile", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEditMode(false);
      fetchProfile();
    } catch (error) {
      console.log(error);
    }
  };

  if (!user) return <div className="p-10">Loading...</div>;

  return (
    <div className="flex justify-center mt-2">
      <div className="w-full max-w-5xl   rounded-3xl p-4">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* PROFILE IMAGE */}
          <div className="flex flex-col items-center">
            <img
              src={user.profileImageUrl}
              alt="profile"
              className="w-48 h-48 rounded-full object-cover border"
            />

            {editMode && (
              <input
                type="file"
                onChange={handleImageChange}
                className="mt-4"
              />
            )}
          </div>

          {/* PROFILE INFO */}
          <div className="flex-1 space-y-3 w-full">
            {/* EMAIL */}
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="text-lg font-medium">{user.email}</p>
            </div>

            {/* NAME + YEAR */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500 text-sm">Full Name</p>

                {editMode ? (
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border rounded-lg p-2 w-full"
                  />
                ) : (
                  <p className="font-semibold">{user.name}</p>
                )}
              </div>

              <div>
                <p className="text-gray-500 text-sm">Year</p>

                {editMode ? (
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="border rounded-lg p-2 w-full"
                  >
                    {years.map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                ) : (
                  <p className="font-semibold">{user.year}</p>
                )}
              </div>
            </div>

            {/* SEMESTER + DEPARTMENT */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500 text-sm">Semester</p>

                {editMode ? (
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="border rounded-lg p-2 w-full"
                  >
                    {semesters.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <p className="font-semibold">{user.semester}</p>
                )}
              </div>

              <div>
                <p className="text-gray-500 text-sm">Department</p>

                {editMode ? (
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="border rounded-lg p-2 w-full"
                  >
                    {departments.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                ) : (
                  <p className="font-semibold">{user.department}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex flex-col md:flex-row items-center gap-4">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="w-full max-w-xl bg-gradient-to-r from-gray-500 to-gray-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-md hover:opacity-90 transition"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-6">
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition"
              >
                Save
              </button>

              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-500 text-white px-8 py-3 rounded-xl hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          )}

          <Link
            to="/student-dashboard/upload-paper"
            className="w-full max-w-xl bg-gradient-to-r from-gray-500 to-gray-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-md hover:opacity-90 transition text-center block"
          >
            Upload Paper's
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
