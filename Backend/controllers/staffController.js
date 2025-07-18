const Staff = require('../models/Staff');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');

// ✅ Create new staff
const createStaff = async (req, res) => {
  try {
    const { name, staffId, password, contactNumber, department } = req.body;

    if (!name || !staffId || !password) {
      return res.status(400).json({ msg: 'Name, Staff ID, and Password are required' });
    }

    const existing = await Staff.findOne({ staffId });
    if (existing) {
      return res.status(400).json({ msg: 'Staff ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = new Staff({
      name,
      staffId,
      password: hashedPassword,
      contactNumber,
      department,
    });

    await newStaff.save();
    res.status(201).json({ msg: 'Staff created successfully' });
  } catch (err) {
    console.error('❌ Error creating staff:', err);
    res.status(500).json({ msg: 'Failed to create staff' });
  }
};

// ✅ Get all staff with task details
const getAllStaffWithTasks = async (req, res) => {
  try {
    const staffList = await Staff.find({}, '-password').lean();

    const enrichedStaff = await Promise.all(
      staffList.map(async (staff) => {
        const currentTask = await Task.findOne({
          assignedStaff: staff._id,
          status: { $ne: 'Completed' }
        }).lean();

        const completedTasks = await Task.find({
          assignedStaff: staff._id,
          status: 'Completed'
        })
          .sort({ date: -1 })
          .select('taskType sampleType date')
          .lean();

        return {
          ...staff,
          currentTask,
          completedTasks,
        };
      })
    );

    res.json(enrichedStaff);
  } catch (err) {
    console.error('❌ Error fetching staff list:', err);
    res.status(500).json({ msg: 'Failed to fetch staff list' });
  }
};

// ✅ Delete staff by ID
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ msg: 'Staff not found' });
    }
    res.json({ msg: 'Staff deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting staff:', err);
    res.status(500).json({ msg: 'Failed to delete staff' });
  }
};

// ✅ Get logged-in staff profile
const getStaffProfile = async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id).select('-password');
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    res.json(staff);
  } catch (err) {
    console.error('❌ Error getting staff profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ Update location of logged-in staff
const updateStaffLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    staff.location = {
      latitude,
      longitude,
      updatedAt: new Date(),
    };

    await staff.save();
    res.status(200).json({ message: "Location updated successfully" });
  } catch (err) {
    console.error("❌ Error updating location:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Export all controller functions
module.exports = {
  createStaff,
  getAllStaffWithTasks,
  deleteStaff,
  getStaffProfile,
  updateStaffLocation,
};
