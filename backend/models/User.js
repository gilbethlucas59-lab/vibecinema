const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true }, // Changed 'ame' to 'username'
  email: { type: String, required: true },    // Changed 'mail' to 'email'
  password: { type: String, required: true }  // Changed 'assword' to 'password'
});

// Important: Change 'e.exports' to 'module.exports'
module.exports = mongoose.model("User", UserSchema);