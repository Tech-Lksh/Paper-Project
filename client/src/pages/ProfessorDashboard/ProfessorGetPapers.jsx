import React, { useEffect, useState } from "react";
import axios from "axios";

const ProfessorGetPaper = () => {

  const [papers, setPapers] = useState([]);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    branch: "",
    year: "",
    semester: "",
    uploaderRole: ""
  });

  const fetchPapers = async () => {
    try {

      const params = {
        search,
        ...filters
      };

      const res = await axios.get(
        "http://localhost:5000/api/papers/search",
        { params }
      );

      setPapers(res.data.papers);

    } catch (error) {
      console.error("Error fetching papers", error);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [search, filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* SEARCH + FILTER */}

      <div className="bg-white p-6 rounded-xl shadow-md mb-6">

        <div className="grid md:grid-cols-6 gap-4">

          <input
            type="text"
            placeholder="Search subject, code, branch..."
            className="border p-2 rounded-md col-span-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            name="branch"
            className="border p-2 rounded-md"
            onChange={handleFilterChange}
          >
            <option value="">Branch</option>
            <option value="CSE">CSE</option>
            <option value="DS">DS</option>
            <option value="IOT">IOT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>

          <select
            name="year"
            className="border p-2 rounded-md"
            onChange={handleFilterChange}
          >
            <option value="">Year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>

          <select
            name="semester"
            className="border p-2 rounded-md"
            onChange={handleFilterChange}
          >
            <option value="">Semester</option>
            {[1,2,3,4,5,6,7,8].map((sem) => (
              <option key={sem} value={sem}>
                Sem {sem}
              </option>
            ))}
          </select>

          <select
            name="uploaderRole"
            className="border p-2 rounded-md"
            onChange={handleFilterChange}
          >
            <option value="">Uploader</option>
            <option value="Professor">Professor</option>
            <option value="Student">Student</option>
          </select>

        </div>

      </div>

      {/* PAPERS LIST */}

      <div className="grid md:grid-cols-5 gap-4">

        {papers.map((paper) => (
          <div
            key={paper._id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
          >

            <h2 className="text-lg font-bold">
              {paper.subjectName}
            </h2>

            <p className="text-sm text-gray-500">
              {paper.subjectCode}
            </p>

            <div className="mt-2 text-sm">

              <p><b>Branch:</b> {paper.branch}</p>
              <p><b>Year:</b> {paper.year}</p>
              <p><b>Semester:</b> {paper.semester}</p>

              {paper.className && (
                <p><b>Class:</b> {paper.className}</p>
              )}

              {/* Uploaded Date */}
              <p className="text-xs text-gray-700 mt-2">
                Uploaded on:{" "}
                {new Date(paper.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </p>

            </div>

            <div className="mt-4 flex justify-between">

              <a
                href={`http://localhost:5000/api/papers/download/${paper.paperFile}`}
                className="bg-green-500 text-white px-3 py-1 rounded-md"
              >
                Download
              </a>

            </div>

          </div>
        ))}

      </div>

      {papers.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No papers found
        </p>
      )}

    </div>
  );
};

export default ProfessorGetPaper;