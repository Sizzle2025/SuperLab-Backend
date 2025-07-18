const Admin = require('../models/Admin');
const Staff = require('../models/Staff');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (user, role) => {
  return jwt.sign(
    { userId: user._id, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Login controller
exports.login = async (req, res) => {
  let { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: 'Please fill all fields' });
  }

  try {
    // First, try to find an admin with the exact username
    let user = await Admin.findOne({ username });
    let role = 'admin';

    // If no admin found, try finding staff by staffId (stored uppercase in DB)
    if (!user) {
      username = username.toUpperCase();  // Normalize staffId input to uppercase
      user = await Staff.findOne({ staffId: username });
      role = 'staff';
    }

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user, role);

    // Return user details and token
    if (role === 'staff') {
      res.json({
        token,
        user: {
          id: user._id,
          staffId: user.staffId,
          role,
          name: user.name,
        },
      });
    } else {
      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          role,
          name: user.name || '',
        },
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
