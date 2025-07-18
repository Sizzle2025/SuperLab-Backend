const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');

const {
  createStaff,
  getAllStaffWithTasks,
  deleteStaff,
  getStaffProfile,
  updateStaffLocation, // ✅ Make sure this function is in your controller
} = require('../controllers/staffController');

// @route   POST /api/staff/create
router.post('/create', createStaff);

// @route   GET /api/staff/list
router.get('/list', getAllStaffWithTasks);

// @route   DELETE /api/staff/delete/:id
router.delete('/delete/:id', deleteStaff);

// @route   GET /api/staff/profile
router.get('/profile', auth, roleCheck(['staff']), getStaffProfile);

// ✅ @route   POST /api/staff/update-location
router.post('/update-location', auth, roleCheck(['staff']), updateStaffLocation);

module.exports = router;
