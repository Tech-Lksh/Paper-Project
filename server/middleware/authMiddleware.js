const jwt = require("jsonwebtoken");

/*

## AUTHENTICATION MIDDLEWARE

Verifies JWT token and attaches user data
to request object.
------------------

*/

const authMiddleware = (req, res, next) => {
try {

// Authorization header read
const authHeader = req.headers.authorization || req.headers.Authorization;

console.log("AUTH HEADER:", authHeader);

if (!authHeader) {
  return res.status(401).json({
    success: false,
    message: "Authorization header missing"
  });
}

// Expect format: Bearer TOKEN
const parts = authHeader.split(" ");

if (parts.length !== 2 || parts[0] !== "Bearer") {
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

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);

console.log("DECODED TOKEN:", decoded);

// Attach user to request
req.user = {
  id: decoded.id,
  email: decoded.email,
  type: decoded.type
};

console.log("REQUEST USER:", req.user);

next();


} catch (error) {


console.error("AUTH ERROR:", error);

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

return res.status(500).json({
  success: false,
  message: "Authentication failed"
});


}
};

 /*

## PROFESSOR ROLE MIDDLEWARE

## Only professors can access these routes

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
