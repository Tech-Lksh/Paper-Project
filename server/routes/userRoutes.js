const express = require("express");
const router = express.Router();

// GET Users
router.get("/", (req, res) => {
  res.json({
    message: "User route working",
  });
});

module.exports = router;