const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  uploadPaper,
  getPapers,
  editPaper,
  deletePaper,
  publicPapers,
  downloadPaper,
  myUploadedPapers,
  searchPapers
} = require("../controller/paperController");

const { authMiddleware } = require("../middleware/authMiddleware");

/*
-----------------------------------------
MULTER STORAGE CONFIGURATION
-----------------------------------------
*/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/papers");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/*
-----------------------------------------
PUBLIC ROUTES
-----------------------------------------
*/

// Public users can view papers
router.get("/public", publicPapers);

// Public users can download papers
router.get("/download/:filename", downloadPaper);

router.get("/search", searchPapers);

/*
-----------------------------------------
AUTHENTICATED ROUTES
-----------------------------------------
*/

// Upload paper (student & professor)
router.post(
  "/upload",
  authMiddleware,
  upload.single("paperFile"),
  uploadPaper
);

// Get dashboard papers
router.get("/", authMiddleware, getPapers);

// Get my uploaded papers
router.get("/my-papers", authMiddleware, myUploadedPapers);

// Edit paper (only uploader)
router.put("/edit/:id", authMiddleware, editPaper);

// Delete paper (only uploader)
router.delete("/:id", authMiddleware, deletePaper);

module.exports = router;