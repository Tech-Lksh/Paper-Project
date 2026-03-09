const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  register,
  login,
  logout,
  getProfile,
  updateProfileImage,
  grantStudent,
  rejectStudent,
  ungrantStudent
} = require("../controller/userController");

const { authMiddleware, isProfessor } = require("../middleware/authMiddleware");

/*
-----------------------------------------
MULTER STORAGE CONFIGURATION
-----------------------------------------
*/

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile");
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/*
-----------------------------------------
AUTH ROUTES
-----------------------------------------
*/

router.post("/register", register);

router.post("/login", login);

router.post("/logout", authMiddleware, logout);

/*
-----------------------------------------
PROFILE ROUTES
-----------------------------------------
*/

// GET PROFILE
router.get("/profile", authMiddleware, getProfile);

// UPDATE PROFILE IMAGE
router.put(
  "/profile/image",
  authMiddleware,
  upload.single("image"),
  updateProfileImage
);

/*
-----------------------------------------
PROFESSOR CONTROL ROUTES
-----------------------------------------
*/

// GRANT STUDENT
router.put("/grant-student/:id", authMiddleware, isProfessor, grantStudent);

// REJECT STUDENT
router.put("/reject-student/:id", authMiddleware, isProfessor, rejectStudent);

// UNGRANT STUDENT
router.put("/ungrant-student/:id", authMiddleware, isProfessor, ungrantStudent);

module.exports = router;