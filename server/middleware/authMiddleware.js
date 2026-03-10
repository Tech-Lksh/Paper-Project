const jwt = require("jsonwebtoken");

/*
-----------------------------------------
AUTHENTICATION MIDDLEWARE
-----------------------------------------
Verifies JWT token and attaches user data
to request object.
-----------------------------------------
*/

const authMiddleware = (req, res, next) => {
  try {

    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing"
      });
    }

    const parts = authHeader.split(" ");

    if (!parts || parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format"
      });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // USER DATA ATTACH
    req.user = {
      id: decoded.id,
      email: decoded.email,
      type: decoded.type
    };

    next();

  } catch (error) {

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    console.error("AUTH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

/*
-----------------------------------------
PROFESSOR ROLE MIDDLEWARE
-----------------------------------------
Only professors can access these routes
-----------------------------------------
*/

const isProfessor = (req, res, next) => {

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated"
    });
  }

  if (req.user.type !== "Professor") {
    return res.status(403).json({
      success: false,
      message: "Only professors can perform this action"
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  isProfessor
};