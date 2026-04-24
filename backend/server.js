const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ CORS (allow frontend)
app.use(cors({
  origin: [
    "https://djneptune0056.netlify.app",
    "http://localhost:5173"
  ],
  credentials: true
}));

// ✅ Static folder for uploads (videos/images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ MongoDB connection
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vibecinema";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ VibeCinema DB Connected"))
  .catch(err => {
    console.error("❌ DB Error:", err);
    process.exit(1); // stop server if DB fails
  });

// ✅ Routes
app.use("/api/movies", require("./routes/movies"));

// ✅ Homepage route (MUST be before app.listen)
app.get("/", (req, res) => {
  res.send("🎬 Welcome to VibeCinema API is running...");
});

// ✅ Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Global error handler (important)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});