const express = require("express");
const router = express.Router();
const multer = require("multer");
const Movie = require("../models/Movie");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// ✅ GET all movies
router.get("/", async (req, res) => {
  try {
    // We ensure Movie is the model imported above
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST upload route
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const newMovie = new Movie({
      title: req.body.title,
      description: req.body.description,
      country: req.body.country,
      videoPath: req.file.filename
    });
    await newMovie.save();
    res.json({ message: "Movie uploaded successfully!", movie: newMovie });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
