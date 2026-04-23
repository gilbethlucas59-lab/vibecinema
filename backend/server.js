const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Update CORS to allow your Netlify site
app.use(cors({
  origin: ["https://djneptune0056.netlify.app", "http://localhost:5173"]
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Use the Environment Variable for MongoDB, or fallback to local for testing
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vibecinema";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ VibeCinema DB Connected"))
  .catch(err => console.error("❌ DB Error:", err));

app.use("/api/movies", require("./routes/movies"));

// Render uses a dynamic port, so we must use process.env.PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));