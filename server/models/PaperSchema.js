const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true
    },

    subjectCode: {
      type: String,
      required: [true, "Subject code is required"],
      uppercase: true,
      trim: true
    },

    branch: {
      type: String,
      required: true,
      enum: ["CSE", "MECH", "DS", "IOT", "ECE", "EEE", "CIVIL", "IT"]
    },

    year: {
      type: String,
      required: true,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"]
    },

    semester: {
      type: Number,
      required: true,
      enum: [1,2,3,4,5,6,7,8]
    },

    // OPTIONAL FIELD
    className: {
      type: String,
      trim: true,
      default: null
    },

    paperFile: {
      type: String,
      required: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    uploaderRole: {
      type: String,
      enum: ["Professor", "Student"],
      required: true
    }

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Paper", paperSchema);