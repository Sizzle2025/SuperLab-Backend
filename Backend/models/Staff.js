const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  staffId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true, // Ensure consistency
  },
  password: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    default: "",
  },
  department: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "staff",
    enum: ["staff", "admin"], // Optional: allows future roles
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  location: {
    latitude: Number,
    longitude: Number,
    updatedAt: Date
  }
});

module.exports = mongoose.model("Staff", staffSchema);
