import React, { useEffect, useState } from "react";
import axios from "axios";

const ProfessorApproveStudent = () => {

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const token = localStorage.getItem("token");

  /* ---------------- FETCH STUDENTS ---------------- */

  const fetchStudents = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/users/department-students",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStudents(res.data.students);

    } catch (error) {
      console.log(error);
    }

  };

  useEffect(() => {
    fetchStudents();
  }, []);

  /* ---------------- ACTIONS ---------------- */

  const grantStudent = async (id) => {

    await axios.put(
      `http://localhost:5000/api/users/grant-student/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchStudents();
  };

  const rejectStudent = async (id) => {

    await axios.put(
      `http://localhost:5000/api/users/reject-student/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchStudents();
  };

  const ungrantStudent = async (id) => {

    await axios.put(
      `http://localhost:5000/api/users/ungrant-student/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchStudents();
  };

  /* ---------------- FILTER LOGIC ---------------- */

  const filteredStudents = students
    .filter((student) =>
      student.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((student) => {

      if (filter === "approved") return student.granted === "approved";
      if (filter === "rejected") return student.granted === "rejected";
      if (filter === "pending") return !student.granted;

      return true;

    });

  /* ---------------- STATUS COLOR ---------------- */

  const statusColor = (status) => {

    if (status === "approved") return "bg-green-500";
    if (status === "rejected") return "bg-red-500";
    return "bg-yellow-500";

  };

  const statusText = (status) => {

    if (status === "approved") return "Granted";
    if (status === "rejected") return "Rejected";
    return "Pending";

  };

  return (

    <div className="max-w-8xl mx-auto md:p-6">

      <h2 className="text-2xl font-bold mb-6">
        Manage Students
      </h2>

      {/* SEARCH + FILTER */}

      <div className="flex flex-col md:flex-row gap-4 mb-6">

        <input
          type="text"
          placeholder="Search student..."
          className="border p-3 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-3 rounded w-full md:w-52"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Students</option>
          <option value="approved">Granted</option>
          <option value="pending">Ungrant</option>
          <option value="rejected">Rejected</option>
        </select>

      </div>

      {/* STUDENTS LIST */}

      <div className="grid gap-4">

        {filteredStudents.map((student) => (

          <div
            key={student._id}
            className="bg-white shadow rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >

            {/* STUDENT INFO */}

            <div>

              <h3 className="font-semibold text-lg">
                {student.name}
              </h3>

              <p className="text-sm text-gray-500">
                {student.email}
              </p>

              <p className="text-sm text-gray-400">
                Department: {student.department}
              </p>

              <p className="text-sm text-gray-400">
                Semester: {student.semester}
              </p>

              <p className="text-sm text-gray-400">
                Class: {student.class}
              </p>

              <span
                className={`inline-block mt-2 text-white text-xs px-3 py-1 rounded ${statusColor(student.granted)}`}
              >
                {statusText(student.granted)}
              </span>

            </div>

            {/* ACTION BUTTONS */}

            <div className="flex flex-wrap gap-2">

              <button
                onClick={() => grantStudent(student._id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Grant
              </button>

              <button
                onClick={() => ungrantStudent(student._id)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Ungrant
              </button>

              <button
                onClick={() => rejectStudent(student._id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Reject
              </button>

            </div>

          </div>

        ))}

      </div>

      {filteredStudents.length === 0 && (

        <p className="text-center text-gray-500 mt-10">
          No students found
        </p>

      )}

    </div>

  );
};

export default ProfessorApproveStudent;