import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full top-0 z-50 bg-white shadow-md">

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-black"
        >
          Mid<span className="text-blue-500">Paper's</span>
        </Link>


        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-10 text-black font-medium">

          {/* Home */}
          <li>
            <Link
              to="/"
              className="relative hover:text-red-500 transition duration-300 group"
            >
              Home
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-red-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>


          {/* Login / Register Buttons */}
          <div className="flex items-center space-x-4">

            {/* Login */}
            <Link
              to="/login"
              className="px-5 py-2 border-2 border-blue-500 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition duration-300"
            >
              Login
            </Link>

            {/* Register */}
            <Link
              to="/register"
              className="px-5 py-2 bg-blue-500 text-white rounded-full hover:bg-red-500 transition duration-300 shadow-md"
            >
              Register
            </Link>

          </div>

        </ul>


        {/* Mobile Menu Button */}
        <div
          className="md:hidden cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="w-6 h-[2px] bg-black mb-1"></div>
          <div className="w-6 h-[2px] bg-black mb-1"></div>
          <div className="w-6 h-[2px] bg-black"></div>
        </div>

      </div>


      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg">

          <ul className="flex flex-col items-center py-6 space-y-6 text-black font-medium">

            <Link
              to="/"
              className="hover:text-red-500 transition duration-300"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              to="/login"
              className="px-6 py-2 border border-blue-500 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition duration-300"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-red-500 transition duration-300"
              onClick={() => setMenuOpen(false)}
            >
              Register
            </Link>

          </ul>

        </div>
      )}

    </nav>
  );
};

export default Navbar;