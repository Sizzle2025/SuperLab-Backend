const Task = require("../models/Task");
const Staff = require("../models/Staff");
const path = require("path");

// ✅ Assign a new task
const assignTask = async (req, res) => {
  try {
    const {
      taskType,
      patientName,
      patientAddress,
      patientLocation,
      sampleType,
      contactNumber,
      assignedStaff,
      date,
    } = req.body;

    const task = new Task({
      taskType,
      patientName,
      patientAddress,
      patientLocation,
      sampleType,
      contactNumber,
      assignedStaff,
      date,
      status: "Pending",
    });

    await task.save();
    res.status(201).json({ msg: "Task assigned successfully" });
  } catch (err) {
    console.error("Error assigning task:", err);
    res.status(500).json({ msg: "Task assignment failed" });
  }
};

// ✅ Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .populate("assignedStaff", "name staffId");

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching all tasks:", err);
    res.status(500).json({ msg: "Failed to fetch tasks" });
  }
};

// ✅ Update status only (basic)
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const updated = await Task.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) return res.status(404).json({ msg: "Task not found" });

    res.json({ msg: "Status updated", task: updated });
  } catch (err) {
    console.error("Error updating task status:", err);
    res.status(500).json({ msg: "Failed to update status" });
  }
};

// ✅ Get tasks for a staff member
const getTasksByStaffId = async (req, res) => {
  const { staffId } = req.params;

  try {
    const staff = await Staff.findOne({ staffId });
    if (!staff) return res.status(404).json({ msg: "Staff not found" });

    const tasks = await Task.find({ assignedStaff: staff._id }).populate(
      "assignedStaff",
      "name staffId"
    );

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching staff tasks:", err);
    res
      .status(500)
      .json({ msg: "Server error while fetching tasks", error: err.message });
  }
};

// ✅ Get task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id).populate(
      "assignedStaff",
      "name staffId"
    );

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ NEW: Update task progress + time + optional photo (improved)
const updateTaskProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["reached", "collected", "submitted"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status step" });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    const now = new Date();

    if (status === "reached") {
      task.reachedAt = now;
      task.status = "In Progress";
    } else if (status === "collected") {
      task.sampleCollectedAt = now;
    } else if (status === "submitted") {
      task.submittedToLabAt = now;
      task.status = "Completed";
    }

    // ✅ Correct field to store uploaded image
    if (req.file) {
      task.photoProof = req.file.filename;
    }

    await task.save();

    res.json({ msg: `Task marked as '${status}'`, task });
  } catch (err) {
    console.error("Progress update failed:", err);
    res.status(500).json({ msg: "Failed to update task progress" });
  }
};


module.exports = {
  assignTask,
  getAllTasks,
  updateTaskStatus,
  getTasksByStaffId,
  getTaskById,
  updateTaskProgress,
};
