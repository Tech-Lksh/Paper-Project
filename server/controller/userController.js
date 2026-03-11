const User = require("../models/UserSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

/*
-----------------------------------------
UTILITY FUNCTION: GENERATE JWT TOKEN
-----------------------------------------
*/
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      type: user.type,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
      issuer: "campus-app",
    }
  );
};

/*
-----------------------------------------
REGISTER USER
-----------------------------------------
*/
exports.register = async (req, res) => {
  try {

    const {
      name,
      email,
      password,
      type,
      year,
      semester,
      department
    } = req.body;

    if (!name || !email || !password || !type || !year || !semester || !department) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // IMAGE HANDLE
    let profileImage = "default.png";

    if (req.file) {
      profileImage = req.file.filename;
    }

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      type,
      year,
      semester,
      department,
      profileImage,
      granted: type === "Professor" ? "approved" : null
    });

    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      type: newUser.type,
      year: newUser.year,
      semester: newUser.semester,
      department: newUser.department,
      profileImage: newUser.profileImage,
      createdAt: newUser.createdAt
    };

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse
    });

  } catch (error) {

    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }
};


/*
-----------------------------------------
LOGIN USER
-----------------------------------------
*/
exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    /* STUDENT APPROVAL CHECK */

    if (user.type === "Student" && user.granted !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your account is not approved by professor yet"
      });
    }

    const token = generateToken(user);

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
      year: user.year,
      semester: user.semester,
      department: user.department,
      profileImage: user.profileImage
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData
    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }

};


/*
-----------------------------------------
GET USER PROFILE
-----------------------------------------
*/
/*
-----------------------------------------
GET USER PROFILE
-----------------------------------------
*/





exports.getProfile = async (req, res) => {
try {

// Debug
console.log("REQ USER:", req.user);

if (!req.user || !req.user.id) {
  return res.status(401).json({
    success: false,
    message: "Unauthorized"
  });
}

// Find user
const user = await User.findById(req.user.id).select("-password").lean();

console.log("USER FROM DB:", user);

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found"
  });
}


// Build profile image URL
let profileImageUrl = null;

if (user.profileImage) {
  profileImageUrl = req.protocol + "://" + req.get("host") + "/uploads/profile/" + user.profileImage;
}

return res.status(200).json({
  success: true,
  message: "Profile fetched successfully",
  user: {
    ...user,
    profileImageUrl: profileImageUrl
  }
});

} catch (error) {


console.error("GET PROFILE ERROR:", error);

return res.status(500).json({
  success: false,
  message: "Internal server error"
});


}
};


/*
-----------------------------------------
UPDATE USER PROFILE
-----------------------------------------
Allow partial update
-----------------------------------------
*/



exports.updateProfile = async (req, res) => {

  try {

    const { name, year, semester, department } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // TEXT FIELD UPDATE
    if (name) user.name = name;
    if (year) user.year = year;
    if (semester) user.semester = semester;
    if (department) user.department = department;

    // IMAGE UPDATE
    if (req.file) {

      // delete old image
      if (user.profileImage !== "default.png") {

        const oldPath = path.join(
          __dirname,
          "..",
          "uploads/profile",
          user.profileImage
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }

      }

      user.profileImage = req.file.filename;

    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user
    });

  } catch (error) {

    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }

};



/*
-----------------------------------------
UPDATE PROFILE IMAGE
-----------------------------------------
*/
exports.updateProfileImage = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // delete old image if not default
    if (user.profileImage !== "default.png") {

      const oldPath = path.join(
        __dirname,
        "..",
        "uploads/profile",
        user.profileImage
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

    }

    user.profileImage = req.file.filename;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      user
    });

  } catch (error) {

    console.error("IMAGE UPDATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }

};


/*
-----------------------------------------
PROFESSOR GRANT STUDENT
-----------------------------------------
*/

exports.grantStudent = async (req, res) => {

  try {

    if (!req.user || req.user.type !== "Professor") {
      return res.status(403).json({
        success: false,
        message: "Only professors can perform this action"
      });
    }

    const professor = await User.findById(req.user.id);

    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (student.type !== "Student") {
      return res.status(400).json({
        success: false,
        message: "User is not a student"
      });
    }

    // 🔴 DEPARTMENT CHECK
    if (student.department !== professor.department) {
      return res.status(403).json({
        success: false,
        message: "You can only manage students from your department"
      });
    }

    student.granted = "approved";

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student granted successfully",
      student
    });

  } catch (error) {

    console.error("GRANT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }

};


/*
-----------------------------------------
PROFESSOR REJECT STUDENT
-----------------------------------------
*/

exports.rejectStudent = async (req, res) => {

  try {

    if (!req.user || req.user.type !== "Professor") {
      return res.status(403).json({
        success: false,
        message: "Only professors can reject students"
      });
    }

    const professor = await User.findById(req.user.id);

    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (student.department !== professor.department) {
      return res.status(403).json({
        success: false,
        message: "You can only manage students from your department"
      });
    }

    student.granted = "rejected";

    await student.save();

    return res.json({
      success: true,
      message: "Student rejected successfully",
      student
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }

};


/*
-----------------------------------------
PROFESSOR UNGRANT STUDENT
-----------------------------------------
*/

exports.ungrantStudent = async (req, res) => {

  try {

    if (req.user.type !== "Professor") {
      return res.status(403).json({
        success: false,
        message: "Only professors can revoke access"
      });
    }

    const professor = await User.findById(req.user.id);

    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (student.department !== professor.department) {
      return res.status(403).json({
        success: false,
        message: "You can only manage students from your department"
      });
    }

    student.granted = null;

    await student.save();

    return res.json({
      success: true,
      message: "Student access removed",
      student
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }

};


exports.getDepartmentStudents = async (req, res) => {
  try {

    console.log("REQUEST USER:", req.user);

    if (!req.user || req.user.type !== "Professor") {
      return res.status(403).json({
        success: false,
        message: "Only professors can access this"
      });
    }

    // professor fetch
    const professor = await User.findById(req.user.id);

    console.log("PROFESSOR DATA:", professor);

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: "Professor not found"
      });
    }

    // fetch students from same department
    const students = await User.find({
      type: "Student",
      department: professor.department
    }).select("-password");

    console.log("STUDENTS FOUND:", students);

    return res.status(200).json({
      success: true,
      count: students.length,
      students
    });

  } catch (error) {

    console.error("GET STUDENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }
};


/*
-----------------------------------------
LOGOUT USER
-----------------------------------------
*/
exports.logout = async (req, res) => {

  try {

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });

  } catch (error) {

    console.error("LOGOUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }

};