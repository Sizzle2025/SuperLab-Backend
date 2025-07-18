const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists or create it
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // recursive true just in case nested dirs needed
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'task_' + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

module.exports = upload;
