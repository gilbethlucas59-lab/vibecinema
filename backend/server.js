const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose.connect("mongodb://127.0.0.1:27017/vibecinema")
  .then(() => console.log("✅ VibeCinema DB Connected"))
  .catch(err => console.error("❌ DB Error:", err));

// LINK ROUTES
app.use("/api/movies", require("./routes/movies"));

app.listen(5000, () => console.log("🚀 Server running on port 5000"));