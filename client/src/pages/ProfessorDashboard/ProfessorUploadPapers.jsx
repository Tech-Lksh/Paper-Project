import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";  // ← axiosInstance import kiya

const ProfessorUploadPaper = () => {
  const [papers, setPapers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    subjectName: "",
    subjectCode: "",
    branch: "",
    year: "",
    semester: "",
    className: "",
    examType: "",  // ✅ Added examType
    paperFile: null
  });

  const token = localStorage.getItem("token");

  /* ---------------- GET PAPERS ---------------- */
  const fetchPapers = async () => {
    try {
      const res = await axiosInstance.get("/papers/my-papers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPapers(res.data.papers);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  /* ---------------- HANDLE INPUT ---------------- */
  const handleChange = (e) => {
    if (e.target.name === "paperFile") {
      setFormData({ ...formData, paperFile: e.target.files[0] });
    } else if (e.target.name === "subjectCode") {
      setFormData({ ...formData, subjectCode: e.target.value.toUpperCase() });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  /* ---------------- UPLOAD PAPER ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      await axiosInstance.post("/papers/upload", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Paper Uploaded Successfully");

      setFormData({
        subjectName: "",
        subjectCode: "",
        branch: "",
        year: "",
        semester: "",
        className: "",
        examType: "",  // ✅ reset examType
        paperFile: null
      });

      fetchPapers();
    } catch (error) {
      console.log(error);
    }
  };

  /* ---------------- EDIT PAPER ---------------- */
  const handleEdit = (paper) => {
    setFormData({
      subjectName: paper.subjectName,
      subjectCode: paper.subjectCode,
      branch: paper.branch,
      year: paper.year,
      semester: paper.semester,
      className: paper.className || "",
      examType: paper.examType || "", // ✅ set examType
      paperFile: null
    });
    setEditingId(paper._id);
  };

  const updatePaper = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/papers/edit/${editingId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Paper Updated Successfully");

      setEditingId(null);
      setFormData({
        subjectName: "",
        subjectCode: "",
        branch: "",
        year: "",
        semester: "",
        className: "",
        examType: "", // ✅ reset examType
        paperFile: null
      });

      fetchPapers();
    } catch (error) {
      console.log(error);
    }
  };

  /* ---------------- DELETE ---------------- */
  const deletePaper = async (id) => {
    try {
      await axiosInstance.delete(`/papers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPapers();
    } catch (error) {
      console.log(error);
    }
  };

  /* ---------------- DOWNLOAD ---------------- */
  const downloadPaper = (fileName) => {
    window.open(
      `${axiosInstance.defaults.baseURL}/papers/download/${fileName}`,
      "_blank"
    );
  };

  return (
    <div className=" md:p-6 max-w-full mx-auto">
      {/* Upload Form */}
      <h2 className="text-xl md:text-2xl font-bold mb-6">
        {editingId ? "Edit Paper" : "Upload Paper"}
      </h2>

      <form
        onSubmit={editingId ? updatePaper : handleSubmit}
        className="grid grid-cols-2 md:grid-cols-2 gap-4 bg-white p-4 md:p-6 shadow-lg rounded-xl"
      >
        <input
          type="text"
          name="subjectName"
          value={formData.subjectName}
          placeholder="Subject Name"
          className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-500"
          onChange={handleChange}
        />

        <input
          type="text"
          name="subjectCode"
          value={formData.subjectCode}
          placeholder="Subject Code"
          className="border p-3 rounded w-full uppercase"
          onChange={handleChange}
        />

        <select
          name="branch"
          value={formData.branch}
          className="border p-3 rounded w-full"
          onChange={handleChange}
        >
          <option value="">Select Branch</option>
          <option>CSE</option>
          <option>MECH</option>
          <option>DS</option>
          <option>IOT</option>
          <option>ECE</option>
          <option>EEE</option>
          <option>CIVIL</option>
          <option>IT</option>
          <option>AIML</option>
        </select>

        <select
          name="year"
          value={formData.year}
          className="border p-3 rounded w-full"
          onChange={handleChange}
        >
          <option value="">Select Year</option>
          <option>1st Year</option>
          <option>2nd Year</option>
          <option>3rd Year</option>
          <option>4th Year</option>
        </select>

        <select
          name="semester"
          value={formData.semester}
          className="border p-3 rounded w-full"
          onChange={handleChange}
        >
          <option value="">Semester</option>
          {[1,2,3,4,5,6,7,8].map((s)=>(<option key={s}>{s}</option>))}
        </select>

        <input
          type="text"
          name="className"
          value={formData.className}
          placeholder="Class Name (optional)"
          className="border p-3 rounded w-full"
          onChange={handleChange}
        />

        {/* ----------------- EXAM TYPE ----------------- */}
        <select
          name="examType"
          value={formData.examType}
          className="border p-3 rounded w-full"
          onChange={handleChange}
        >
          <option value="">Select Exam Type</option>
          <option>Midterm 1</option>
          <option>Midterm 2</option>
        </select>

        <input
          type="file"
          name="paperFile"
          className="border p-3 rounded w-full"
          onChange={handleChange}
        />

        <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {editingId ? "Update Paper" : "Upload Paper"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="flex-1 bg-gray-400 text-white py-3 rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* My Papers */}
      <h2 className="text-xl md:text-2xl font-bold mt-10 mb-4">
        My Uploaded Papers
      </h2>

      <div className="grid gap-4">
        {papers.map((paper) => (
          <div
            key={paper._id}
            className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row md:justify-between md:items-center gap-4"
          >
            <div>
              <h3 className="font-semibold text-lg">{paper.subjectName}</h3>
              <p className="text-sm text-gray-500">
                {paper.subjectCode} | {paper.branch} | {paper.year} | Semester {paper.semester} |  {paper.examType} | {paper.className} 
              </p>
              <p className="text-sm font-semibold text-gray-600">
                Uploaded: {new Date(paper.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleEdit(paper)}
                className="bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600"
              >
                Edit
              </button>

              <button
                onClick={() => downloadPaper(paper.paperFile)}
                className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
              >
                Download
              </button>

              <button
                onClick={() => deletePaper(paper._id)}
                className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfessorUploadPaper;