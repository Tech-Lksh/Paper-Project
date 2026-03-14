const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      set: (value) => value.charAt(0).toUpperCase() + value.slice(1),
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
    type: String,
    required: [true, "Password is required"],
    // select: false
    },

    profileImage: {
      type: String,
      default: "default.png"
    },

    type: {
      type: String,
      required: true,
      enum: ["Professor", "Student"],
    },

    year: {
      type: String,
      required: true,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    },

    semester: {
      type: Number,
      required: true,
      enum: [1,2,3,4,5,6,7,8],
    },

    department: {
      type: String,
      required: true,
      enum: ["CSE","MECH","DS","IOT","ECE","EEE","CIVIL","IT"],
    },

    granted: {
      type: String,
      enum: ["approved","rejected", null],
      default: null
    }

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);