require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("@exortek/express-mongo-sanitize");
const path = require("path");

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const paperRoutes = require("./routes/paperRoutes");

const app = express();

/* -------------------- SECURITY -------------------- */

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(
  mongoSanitize({
    replaceWith: "_"
  })
);
/* -------------------- CORS -------------------- */
// Allow any origin
app.use(cors({
  origin: "*", // <--- THIS ALLOWS ALL ORIGINS
  credentials: true
}));

/* -------------------- RATE LIMIT -------------------- */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests, try later" }
});
app.use("/api", limiter);

/* -------------------- BODY PARSER -------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- STATIC FILES -------------------- */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* -------------------- ROUTES -------------------- */
app.use("/api/users", userRoutes);
app.use("/api/papers", paperRoutes);

/* -------------------- HEALTH CHECK -------------------- */
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server running" });
});

/* -------------------- GLOBAL ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();