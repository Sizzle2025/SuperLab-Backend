const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  assignTask,
  getAllTasks,
  updateTaskStatus,
  getTasksByStaffId,
  getTaskById,
  updateTaskProgress
} = require('../controllers/taskController');

// Setup multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // folder to save uploaded images locally
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Routes

// Assign a new task
router.post('/assign', assignTask);

// Get all tasks
router.get('/list', getAllTasks);

// Update basic status field (Pending, In Progress, Completed)
router.patch('/:id/status', updateTaskStatus);

// Get tasks assigned to a particular staff by their staffId
router.get('/staff/:staffId', getTasksByStaffId);

// Get a single task details by task id
router.get('/:id', getTaskById);

// Update task progress (reached, collected, submitted) with optional photo upload
router.patch('/:id/progress', upload.single('photo'), updateTaskProgress);

module.exports = router;
