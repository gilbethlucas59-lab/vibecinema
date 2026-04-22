const express = require("express");
const router = express.Router();
const multer = require("multer");
const Movie = require("../models/Movie");

// Configure where to save videos
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// THE UPLOAD ROUTE
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