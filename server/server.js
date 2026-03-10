require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("@exortek/express-mongo-sanitize");

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const paperRoutes = require("./routes/paperRoutes");

const app = express();

/* SECURITY MIDDLEWARE */

app.use(helmet());

app.use(
  mongoSanitize({
    replaceWith: "_"
  })
);

app.use(cors({
  origin: "*",
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many requests, please try again later"
  }
});

app.use("/api", limiter);

/* BODY PARSER */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
-----------------------------------------
STATIC FILE ACCESS (IMPORTANT)
-----------------------------------------
Allow public access to uploaded papers
*/
app.use("/uploads", express.static("uploads"));

/* ROUTES */

app.use("/api/users", userRoutes);
app.use("/api/papers", paperRoutes);

/* HEALTH CHECK */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server running successfully"
  });
});

/* GLOBAL ERROR HANDLER */

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

/* START SERVER */

const PORT = process.env.PORT || 5000;

const startServer = async () => {

  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

};

startServer();