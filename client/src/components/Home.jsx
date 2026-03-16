import React, { useEffect, useState, useRef } from "react";
import Navbar from "./Navbar";
import axiosInstance from "../api/axios";

const HomeWithPapers = () => {
  const [papers, setPapers] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    branch: "",
    year: "",
    semester: "",
    uploaderRole: "",
    examType: "",
  });

  const filterSectionRef = useRef(null);

  const fetchPapers = async () => {
    try {
      const params = { search, ...filters };
      const res = await axiosInstance.get("/papers/search", { params });
      setPapers(res.data.papers);
    } catch (error) {
      console.error("Error fetching papers", error);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [search, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const scrollToFilters = () => {
    if (filterSectionRef.current) {
      const navbarHeight = 80; // Adjust based on your navbar height
      const elementTop = filterSectionRef.current.getBoundingClientRect().top;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      window.scrollTo({
        top: elementTop + scrollTop - navbarHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <Navbar />

      {/* Add padding-top equal to navbar height to prevent overlap */}
      <div className="pt-[70px]">
        {/* Hero Section */}
        <section className="min-h-[90vh] bg-[rgb(255,255,255)] flex flex-col md:flex-row items-center  px-6 md:px-20 py-14">
          {/* --- MOBILE ONLY VIEW: Title Left, Image Right --- */}
          <div className="w-full flex md:hidden items-center gap-4 mb-16">
            {/* Title Left */}
            <div className="w-1/2">
              <h1 className="text-2xl mt-10 sm:text-3xl font-extrabold text-[#2c1e16] leading-tight text-left">
                All Your Exam Papers,
                <br />
                <span className="text-[#4163f8]">In One Place.</span>
              </h1>
            </div>

            {/* Image Right */}
            <div className="w-1/2 mt-16">
              <img
                src="/banner.png"
                alt="Handwritten Exam Notes"
                className="w-full h-auto rotate-3 mb-4 object-cover"
              />
            </div>
          </div>

          {/* --- DESKTOP LEFT CONTENT & MOBILE PARAGRAPH --- */}
          <div className="w-full md:w-1/2 text-center md:text-left mb-12 md:mb-0">
            {/* Title specifically for Desktop (hidden on mobile) */}
            <h1 className="hidden md:block text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2c1e16] leading-tight mb-6">
              All Your Exam Papers,
              <br />
              <span className="text-[#4163f8]">In One Place.</span>
            </h1>

            <p className="text-xl font-semibold text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0 text-start md:text-left">
            Share and access Midterm 1, Midterm 2, and Final exam papers in one place. Upload your papers or download previous year exam papers easily.
            </p>

            <div className="flex mt-20 flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <button
                onClick={scrollToFilters}
                className="w-full sm:w-auto px-8 py-3 bg-[#4163f8] text-white font-bold rounded-lg shadow-md hover:bg-[#bc8a5c] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center"
              >
                Filter & Download Papers
              </button>
            </div>
          </div>

          {/* --- DESKTOP ONLY VIEW: Image Right --- */}
          <div className="hidden md:flex w-full md:w-[55%] justify-center group perspective-1000">
            <img
              src="/banner.png"
              alt="Handwritten Exam Notes"
              className="w-full max-w-md h-auto rotate-3 transition-transform duration-500 ease-out group-hover:rotate-0 group-hover:scale-105 object-cover"
            />
          </div>
        </section>

        {/* SEARCH + FILTER + PAPERS (Baaki code bilkul unchanged) */}
        <div className="min-h-screen bg-gray-100">
          <div
            ref={filterSectionRef}
            className="bg-white p-6 rounded-xl shadow-md mb-6"
          >
            <div className="grid md:grid-cols-7 gap-4">
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
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
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
              <select
                name="examType"
                className="border p-2 rounded-md"
                onChange={handleFilterChange}
              >
                <option value="">Exam Type</option>
                <option value="Midterm 1">Midterm 1</option>
                <option value="Midterm 2">Midterm 2</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {papers.map((paper) => (
              <div
                key={paper._id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
              >
                <h2 className="text-lg font-bold">{paper.subjectName}</h2>
                <p className="text-sm text-gray-500">{paper.subjectCode}</p>

                <div className="mt-2 text-sm">
                  <p>
                    <b>Branch:</b> {paper.branch}
                  </p>
                  <p>
                    <b>Year:</b> {paper.year}
                  </p>
                  <p>
                    <b>Semester:</b> {paper.semester}
                  </p>
                  {paper.className && (
                    <p>
                      <b>Class:</b> {paper.className}
                    </p>
                  )}
                  {paper.examType && (
                    <p>
                      <b>ExamType:</b> {paper.examType}
                    </p>
                  )}
                  <p className="text-xs text-gray-700 mt-2">
                    Uploaded on:{" "}
                    {new Date(paper.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="mt-4 flex justify-between">
                  <a
                    href={`${axiosInstance.defaults.baseURL}/papers/download/${paper.paperFile}`}
                    className="bg-green-500 text-white px-3 py-1 rounded-md"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>

          {papers.length === 0 && (
            <p className="text-center text-gray-500 mt-10">No papers found</p>
          )}
        </div>
      </div>
    </>
  );
};

export default HomeWithPapers;
