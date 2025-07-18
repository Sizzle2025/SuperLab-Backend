// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const auth = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');

// Get all staff with location
router.get('/staff-list', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const staffList = await Staff.find({}, 'name location'); // only return name and location
    res.status(200).json(staffList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch staff list' });
  }
});

module.exports = router;
