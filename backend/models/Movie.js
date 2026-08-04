const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  country: String,
  videoPath: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Movie", movieSchema);
