const Paper = require("../models/PaperSchema");
const User = require("../models/UserSchema");
const path = require("path");
const fs = require("fs");

/*
-----------------------------------------
UPLOAD PAPER
-----------------------------------------
*/
exports.uploadPaper = async (req, res) => {
  try {
    // File check
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Paper file is required"
      });
    }

    const { subjectName, subjectCode, branch, year, semester, className } = req.body;

    // Mandatory field validation
    if (!subjectName || !subjectCode || !branch || !year || !semester) {
      return res.status(400).json({
        success: false,
        message: "subjectName, subjectCode, branch, year, semester are required"
      });
    }

    const newPaper = await Paper.create({
      subjectName,
      subjectCode: subjectCode.toUpperCase(),
      branch,
      year,
      semester,
      className: className || null,
      paperFile: req.file.filename,
      uploadedBy: req.user.id,
      uploaderRole: req.user.type
    });

    return res.status(201).json({
      success: true,
      message: "Paper uploaded successfully",
      paper: newPaper
    });

  } catch (error) {
    console.error("UPLOAD PAPER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/*
-----------------------------------------
GET PAPERS (DASHBOARD)
-----------------------------------------
*/
exports.getPapers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    let papers;

    if (user.type === "Student") {
      // Student dashboard: only own papers
      papers = await Paper.find({ uploadedBy: user._id })
                          .populate("uploadedBy", "name email type department");
    } else if (user.type === "Professor") {
      // Professor dashboard: own papers + same dept students papers
      papers = await Paper.find({
        $or: [
          { uploadedBy: user._id },
          { branch: user.department, uploaderRole: "Student" }
        ]
      }).populate("uploadedBy", "name email type department");
    }

    return res.status(200).json({
      success: true,
      total: papers.length,
      papers
    });

  } catch (error) {
    console.error("GET PAPERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/*
-----------------------------------------
EDIT PAPER
-----------------------------------------
*/
exports.editPaper = async (req, res) => {
  try {

    const paper = await Paper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found"
      });
    }

    // Only uploader can edit
    if (paper.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can edit only your own papers"
      });
    }

    const body = req.body || {};

    const { subjectName, subjectCode, branch, year, semester, className } = body;

    if (subjectName !== undefined) {
      paper.subjectName = subjectName;
    }

    if (subjectCode !== undefined) {
      paper.subjectCode = subjectCode.toUpperCase();
    }

    if (branch !== undefined) {
      paper.branch = branch;
    }

    if (year !== undefined) {
      paper.year = year;
    }

    if (semester !== undefined) {
      paper.semester = semester;
    }

    if (className !== undefined) {
      paper.className = className;
    }

    await paper.save();

    return res.json({
      success: true,
      message: "Paper updated successfully",
      paper
    });

  } catch (error) {
    console.error("EDIT PAPER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/*
-----------------------------------------
DELETE PAPER
-----------------------------------------
*/
exports.deletePaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found"
      });
    }

    // Only uploader can delete
    if (paper.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own papers"
      });
    }

    await Paper.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Paper deleted successfully"
    });

  } catch (error) {
    console.error("DELETE PAPER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


exports.publicPapers = async (req, res) => {
  try {

    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const papers = await Paper.find({})
      .select("subjectName subjectCode branch year semester className paperFile createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Paper.countDocuments();

    return res.status(200).json({
      success: true,
      page,
      total,
      papers
    });

  } catch (error) {
    console.error("PUBLIC PAPERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};





exports.downloadPaper = async (req, res) => {
  try {

    const fileName = req.params.filename;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: "Filename required"
      });
    }

    const safePath = path.join(__dirname, "..", "uploads", "papers", fileName);

    if (!fs.existsSync(safePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }

    return res.download(safePath);

  } catch (error) {
    console.error("DOWNLOAD PAPER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Download failed"
    });
  }
};



exports.myUploadedPapers = async (req, res) => {
  try {

    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const papers = await Paper.find({ uploadedBy: req.user.id })
      .populate("uploadedBy", "name email type")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Paper.countDocuments({ uploadedBy: req.user.id });

    return res.status(200).json({
      success: true,
      page,
      total,
      papers
    });

  } catch (error) {
    console.error("MY PAPERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



exports.searchPapers = async (req, res) => {
  try {

    const {
      search,
      branch,
      year,
      semester,
      className,
      uploaderRole,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    /* AUTO SEARCH (1 letter bhi chalega) */

    if (search) {
      query.$or = [
        { subjectName: { $regex: search, $options: "i" } },
        { subjectCode: { $regex: search, $options: "i" } },
        { branch: { $regex: search, $options: "i" } },
        { year: { $regex: search, $options: "i" } },
        { className: { $regex: search, $options: "i" } },
        { uploaderRole: { $regex: search, $options: "i" } }
      ];
    }

    /* FILTERS */

    if (branch) query.branch = branch;

    if (year) query.year = year;

    if (semester) query.semester = Number(semester);

    if (className) {
      query.className = { $regex: className, $options: "i" };
    }

    if (uploaderRole) query.uploaderRole = uploaderRole;

    const safeLimit = Math.min(parseInt(limit), 100);
    const skip = (parseInt(page) - 1) * safeLimit;

    const papers = await Paper.find(query)
      .populate("uploadedBy", "name email type")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit);

    const total = await Paper.countDocuments(query);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      papers
    });

  } catch (error) {

    console.error("SEARCH PAPER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Search failed"
    });

  }
};